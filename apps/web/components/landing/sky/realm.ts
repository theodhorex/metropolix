import {
  AdditiveBlending, BoxGeometry, BufferAttribute, BufferGeometry, Color, DataTexture, DirectionalLight, Fog, Group,
  HemisphereLight, InstancedMesh, Matrix4, Mesh, MeshBasicMaterial, MeshToonMaterial, NearestFilter, PerspectiveCamera,
  PlaneGeometry, Points, RedFormat, Scene, ShaderMaterial, Vector2, Vector3, WebGLRenderer,
} from 'three';

/*
  The realm sky: one WebGL canvas behind the whole landing page. Scrolling is the passing of a day:
  morning over the hero, a golden afternoon, a sunset, and (in the dark theme) a deep night with an aurora.

  It is drawn at a fraction of the screen resolution and scaled up with nearest-neighbour filtering, so the
  3D voxel clouds, the dithered gradient and the stars all read as pixel art, and the GPU only shades a few
  hundred thousand pixels a frame. Everything is deterministic (seeded), nothing allocates per frame.
*/

export type SkyTheme = 'light' | 'dark';
export interface RealmOptions { lite: boolean; theme: SkyTheme }
export interface RealmSky {
  setTheme(theme: SkyTheme): void;
  /** 0..1, the dawn-to-night position (normally the page scroll). */
  setProgress(p: number): void;
  /** Pointer in viewport fractions (0..1, y down), or null when it leaves. */
  setPointer(x: number | null, y: number): void;
  /** Pause drawing (an opaque scene covers the sky). */
  setCovered(covered: boolean): void;
  dispose(): void;
}

type RGB = readonly [number, number, number];
interface Key {
  p: number; top: RGB; mid: RGB; bot: RGB;
  sun: RGB; glow: number; night: number; aurora: number;
  cloudLit: RGB; cloudShade: RGB;
}

const hex = (h: string): RGB => {
  const n = parseInt(h.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};

// Rich, saturated skies (the owner found the old ones washed out). Text sits on a soft veil, see landing.css.
const LIGHT: Key[] = [
  { p: 0.0, top: hex('#3d8ef2'), mid: hex('#7fc0ff'), bot: hex('#cfe9ff'), sun: hex('#ffd36b'), glow: 0.9, night: 0, aurora: 0, cloudLit: hex('#fff8ec'), cloudShade: hex('#b4c4f2') },
  { p: 0.3, top: hex('#2c83f0'), mid: hex('#69b3ff'), bot: hex('#d3edff'), sun: hex('#fff1b8'), glow: 0.7, night: 0, aurora: 0, cloudLit: hex('#ffffff'), cloudShade: hex('#adc1f0') },
  { p: 0.58, top: hex('#4a84e8'), mid: hex('#99c1f6'), bot: hex('#ffd396'), sun: hex('#ffc35a'), glow: 1.0, night: 0, aurora: 0, cloudLit: hex('#ffefc8'), cloudShade: hex('#c6a2c6') },
  { p: 0.82, top: hex('#5a6cd6'), mid: hex('#f39888'), bot: hex('#ffbf80'), sun: hex('#ff8a4c'), glow: 1.25, night: 0.08, aurora: 0, cloudLit: hex('#ffb28a'), cloudShade: hex('#8c6cb8') },
  { p: 1.0, top: hex('#3b3d9c'), mid: hex('#a768a8'), bot: hex('#f4987a'), sun: hex('#ff6f4a'), glow: 1.1, night: 0.4, aurora: 0, cloudLit: hex('#f59e8e'), cloudShade: hex('#5c4890') },
];
const DARK: Key[] = [
  { p: 0.0, top: hex('#0e1747'), mid: hex('#2a2f78'), bot: hex('#6a3f86'), sun: hex('#f4ecd0'), glow: 0.5, night: 0.75, aurora: 0, cloudLit: hex('#8d90d6'), cloudShade: hex('#2b2c60') },
  { p: 0.5, top: hex('#070d2e'), mid: hex('#142060'), bot: hex('#2b2a72'), sun: hex('#f4ecd0'), glow: 0.45, night: 0.95, aurora: 0.25, cloudLit: hex('#6f76c4'), cloudShade: hex('#1d2050') },
  { p: 1.0, top: hex('#030617'), mid: hex('#0a1238'), bot: hex('#1a2160'), sun: hex('#f4ecd0'), glow: 0.4, night: 1, aurora: 1, cloudLit: hex('#555ea8'), cloudShade: hex('#141842') },
];

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const mixRGB = (a: RGB, b: RGB, t: number, out: number[]) => { out[0] = lerp(a[0], b[0], t); out[1] = lerp(a[1], b[1], t); out[2] = lerp(a[2], b[2], t); };

/** Sample a key list at p into `out` (no allocation). */
interface Sample { top: number[]; mid: number[]; bot: number[]; sun: number[]; lit: number[]; shade: number[]; glow: number; night: number; aurora: number }
const newSample = (): Sample => ({ top: [0, 0, 0], mid: [0, 0, 0], bot: [0, 0, 0], sun: [0, 0, 0], lit: [0, 0, 0], shade: [0, 0, 0], glow: 0, night: 0, aurora: 0 });
function sample(keys: Key[], p: number, out: Sample) {
  let i = 0;
  while (i < keys.length - 2 && p > keys[i + 1]!.p) i++;
  const a = keys[i]!, b = keys[i + 1]!;
  const t = Math.min(1, Math.max(0, (p - a.p) / (b.p - a.p)));
  const s = t * t * (3 - 2 * t);
  mixRGB(a.top, b.top, s, out.top); mixRGB(a.mid, b.mid, s, out.mid); mixRGB(a.bot, b.bot, s, out.bot);
  mixRGB(a.sun, b.sun, s, out.sun); mixRGB(a.cloudLit, b.cloudLit, s, out.lit); mixRGB(a.cloudShade, b.cloudShade, s, out.shade);
  out.glow = lerp(a.glow, b.glow, s); out.night = lerp(a.night, b.night, s); out.aurora = lerp(a.aurora, b.aurora, s);
}
function blendSample(a: Sample, b: Sample, t: number, out: Sample) {
  for (const k of ['top', 'mid', 'bot', 'sun', 'lit', 'shade'] as const) for (let c = 0; c < 3; c++) out[k][c] = lerp(a[k][c]!, b[k][c]!, t);
  out.glow = lerp(a.glow, b.glow, t); out.night = lerp(a.night, b.night, t); out.aurora = lerp(a.aurora, b.aurora, t);
}

/** Seeded PRNG so every visitor (and the server snapshot) sees the same sky. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const SKY_VERT = /* glsl */ `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position.xy, 0.9999, 1.0); }
`;

// Dithered gradient, posterised sun or moon glow, twinkling stars with scroll parallax, shooting stars,
// an aurora at deep night and a warm lantern pool under the pointer. All on the low-res pixel grid.
const SKY_FRAG = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform vec2 uRes;
uniform float uTime, uNight, uAurora, uGlow, uRise, uMoon, uLantern, uScroll, uSunR;
uniform vec3 uTop, uMid, uBot, uSun;
uniform vec2 uSunPos, uPtr;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float bayer4(vec2 p) {
  vec2 q = mod(p, 4.0);
  int i = int(q.x) + int(q.y) * 4;
  float m[16];
  m[0]=0.;m[1]=8.;m[2]=2.;m[3]=10.;m[4]=12.;m[5]=4.;m[6]=14.;m[7]=6.;
  m[8]=3.;m[9]=11.;m[10]=1.;m[11]=9.;m[12]=15.;m[13]=7.;m[14]=13.;m[15]=5.;
  for (int k = 0; k < 16; k++) if (k == i) return m[k] / 16.0;
  return 0.0;
}

void main() {
  vec2 px = floor(vUv * uRes);
  vec2 uv = (px + 0.5) / uRes;
  float aspect = uRes.x / uRes.y;
  float t = uv.y;

  vec3 col = t > 0.45 ? mix(uMid, uTop, smoothstep(0.45, 1.0, t)) : mix(uBot, uMid, smoothstep(0.0, 0.45, t));

  // sun (day) or moon (night): posterised halo rings, then the disc
  vec2 sp = uSunPos - vec2(0.0, (1.0 - uRise) * 0.35);
  vec2 d = (uv - sp) * vec2(aspect, 1.0);
  float r = length(d);
  // a broad warm wash, then a tight posterised halo (a few rings, not a target board)
  col += uSun * exp(-r * 2.6) * 0.14 * uGlow;
  float halo = exp(-r * (uMoon > 0.5 ? 12.0 : 9.0)) * uGlow;
  col += uSun * floor(halo * 5.0) / 5.0 * 0.5;
  float disc = step(r, uSunR);
  if (uMoon > 0.5) {
    float bite = step(length(d - vec2(uSunR * 0.45, uSunR * 0.25)), uSunR * 0.9);
    vec3 moon = mix(uSun, uSun * 0.78, step(0.5, hash(floor(d / uSunR * 4.0))) * 0.6);
    col = mix(col, moon, disc * (1.0 - bite * 0.85));
  } else {
    col = mix(col, mix(uSun, vec3(1.0, 0.98, 0.9), 0.55), disc);
  }

  // stars: two layers, drifting with scroll at different speeds
  for (int l = 0; l < 2; l++) {
    float fl = float(l);
    vec2 cell = px + vec2(fl * 37.0, floor(uScroll * uRes.y * (0.10 + fl * 0.08)));
    float h = hash(floor(cell / (1.0 + fl)));
    float on = step(0.9972 - fl * 0.0012, h);
    float tw = 0.55 + 0.45 * sin(uTime * (1.5 + h * 3.0) + h * 80.0);
    col += vec3(1.0, 0.96, 0.86) * on * tw * uNight * smoothstep(0.12, 0.55, t) * (1.0 - fl * 0.35);
  }

  // a shooting star every few seconds at night
  float period = 6.5;
  float k = floor(uTime / period);
  float ph = fract(uTime / period);
  if (ph < 0.16 && uNight > 0.3) {
    vec2 a = vec2(hash(vec2(k, 1.0)) * 0.7 + 0.2, 0.7 + hash(vec2(k, 2.0)) * 0.25);
    vec2 dir = normalize(vec2(-1.0, -0.42));
    vec2 head = a + dir * ph * 2.4;
    vec2 rel = (uv - head) * vec2(aspect, 1.0);
    float along = dot(rel, -dir);
    float across = abs(dot(rel, vec2(-dir.y, dir.x)));
    float streak = step(0.0, along) * step(along, 0.16) * step(across, 1.2 / uRes.y);
    col += vec3(1.0, 0.95, 0.8) * streak * (1.0 - along / 0.16) * uNight;
  }

  // aurora curtains: a wavy lower hem, fine vertical rays rising from it and fading upward, posterised
  if (uAurora > 0.01) {
    float w = sin(uv.x * 4.0 + uTime * 0.22 + sin(uv.x * 9.0 - uTime * 0.15) * 0.9);
    float hem = 0.6 + w * 0.05;
    float above = t - hem;
    float body = step(0.0, above) * exp(-above * 5.5) * smoothstep(0.0, 0.015, above + 0.004);
    float rays = pow(0.5 + 0.5 * sin(uv.x * aspect * 64.0 + w * 5.0 + uTime * 0.35), 3.0);
    float drape = smoothstep(-0.3, 0.9, sin(uv.x * 3.4 + uTime * 0.06 + 1.3));
    float glow = body * (0.3 + 0.7 * rays) * drape;
    vec3 ac = mix(vec3(0.22, 0.96, 0.6), vec3(0.6, 0.36, 1.0), smoothstep(0.02, 0.3, above));
    col += ac * floor(glow * 4.0) / 4.0 * 0.5 * uAurora;
  }

  // the visitor's lantern: a warm pool of light under the pointer after dusk
  if (uLantern > 0.01 && uPtr.x >= 0.0) {
    float lp = length((uv - uPtr) * vec2(aspect, 1.0));
    col += vec3(1.0, 0.68, 0.32) * floor(exp(-lp * 8.0) * 5.0) / 5.0 * 0.28 * uLantern;
  }

  // ordered dither, then posterise: smooth gradients become hand-placed pixel bands
  float b = bayer4(px) - 0.5;
  col = floor(col * 28.0 + b + 0.5) / 28.0;
  gl_FragColor = vec4(col, 1.0);
}
`;

/** Fireflies drift on their own; drawing them to the pointer is off (the sparkle trail is the cursor effect). */
const FLIES_FOLLOW = false;

const FLY_VERT = /* glsl */ `
attribute float aSeed;
uniform float uTime, uPx;
varying float vTw;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vTw = 0.55 + 0.45 * sin(uTime * (2.0 + aSeed * 3.0) + aSeed * 40.0);
  gl_PointSize = max(1.0, uPx * (13.0 / -mv.z));
  gl_Position = projectionMatrix * mv;
}
`;
const FLY_FRAG = /* glsl */ `
precision mediump float;
uniform float uAlpha;
varying float vTw;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  if (max(abs(c.x), abs(c.y)) > 0.5) discard;
  gl_FragColor = vec4(vec3(1.0, 0.86, 0.42) * vTw, uAlpha * vTw);
}
`;

export function createRealmSky(host: HTMLElement, opts: RealmOptions): RealmSky {
  const lite = opts.lite;
  let PIX = lite ? 5 : 3; // CSS pixels per sky pixel (coarser after a slow-frame downgrade)
  let slow = lite; // draw at 30 fps
  const renderer = new WebGLRenderer({ antialias: false, alpha: false, powerPreference: 'low-power', preserveDrawingBuffer: false });
  renderer.setPixelRatio(1);
  const canvas = renderer.domElement;
  canvas.className = 'realm-sky-canvas';
  host.appendChild(canvas);
  // a shader this GPU cannot compile would paint black: drop the canvas so the CSS gradient shows instead
  let broken = false;
  renderer.debug.onShaderError = () => { broken = true; };

  const scene = new Scene();
  const camera = new PerspectiveCamera(50, 1, 0.1, 400);
  camera.position.set(0, 0, 30);

  // ---------- sky quad ----------
  const uni = {
    uRes: { value: new Vector2(1, 1) }, uTime: { value: 0 }, uNight: { value: 0 }, uAurora: { value: 0 }, uGlow: { value: 1 },
    uRise: { value: 0 }, uMoon: { value: opts.theme === 'dark' ? 1 : 0 }, uLantern: { value: 0 }, uScroll: { value: 0 }, uSunR: { value: 0.05 },
    uTop: { value: new Vector3() }, uMid: { value: new Vector3() }, uBot: { value: new Vector3() }, uSun: { value: new Vector3() },
    uSunPos: { value: new Vector2(0.8, 0.6) }, uPtr: { value: new Vector2(-1, -1) },
  };
  const skyMat = new ShaderMaterial({ vertexShader: SKY_VERT, fragmentShader: SKY_FRAG, uniforms: uni, depthWrite: false, depthTest: false });
  const sky = new Mesh(new PlaneGeometry(2, 2), skyMat);
  sky.frustumCulled = false;
  sky.renderOrder = -10;
  scene.add(sky);

  // ---------- light ----------
  const sunLight = new DirectionalLight(0xffffff, 2.2);
  sunLight.position.set(-30, 40, 20);
  const hemi = new HemisphereLight(0xbfdcff, 0x8a6fb0, 1.1);
  scene.add(sunLight, hemi);
  scene.fog = new Fog(0xaaccff, 60, 170);

  // ---------- voxel clouds ----------
  const toonRamp = new DataTexture(new Uint8Array([150, 210, 255]), 3, 1, RedFormat);
  toonRamp.minFilter = toonRamp.magFilter = NearestFilter;
  toonRamp.needsUpdate = true;
  const cloudMat = new MeshToonMaterial({ color: 0xffffff, gradientMap: toonRamp });
  const cube = new BoxGeometry(1, 1, 1);
  const rand = mulberry32(20261112);
  const RISE = 95; // how far the camera climbs from the top of the page to the bottom
  const clouds: { mesh: InstancedMesh; speed: number; z: number; half: number }[] = [];
  const shadeCol = new Color(), litCol = new Color(), tmpCol = new Color();
  const cloudCount = lite ? 9 : 16;
  const m4 = new Matrix4();
  for (let c = 0; c < cloudCount; c++) {
    // a puffy cumulus: a few overlapping spheres on a flat base, voxelised; only the shell is kept
    const blobs: [number, number, number, number][] = [];
    const nb = 3 + Math.floor(rand() * 3);
    let span = 0;
    for (let k = 0; k < nb; k++) {
      const r = 2.4 + rand() * 2.4 * (k === Math.floor(nb / 2) ? 1.3 : 1);
      blobs.push([span + r * 0.6, rand() * 1.2, (rand() - 0.5) * 2, r]);
      span += r * 1.15;
    }
    blobs.forEach((bl) => { bl[0] -= span / 2; });
    const floorY = -1.2;
    const inside = (x: number, y: number, z: number) => {
      if (y < floorY) return false;
      for (const [bx, by, bz, br] of blobs) { const dx = x - bx, dy = (y - by) * 1.15, dz = z - bz; if (dx * dx + dy * dy + dz * dz < br * br) return true; }
      return false;
    };
    const cells: [number, number, number, number][] = [];
    const ext = Math.ceil(span / 2 + 6), top = 7;
    for (let x = -ext; x <= ext; x++) for (let y = Math.floor(floorY); y <= top; y++) for (let z = -6; z <= 6; z++) {
      if (!inside(x, y, z)) continue;
      if (inside(x + 1, y, z) && inside(x - 1, y, z) && inside(x, y + 1, z) && inside(x, y - 1, z) && inside(x, y, z + 1) && inside(x, y, z - 1)) continue;
      cells.push([x, y, z, Math.min(1, Math.max(0, (y - floorY) / 6))]);
    }
    const a = span / 2;
    const mesh = new InstancedMesh(cube, cloudMat, cells.length);
    cells.forEach(([x, y, z], i) => { m4.makeTranslation(x, y, z); mesh.setMatrixAt(i, m4); mesh.setColorAt(i, tmpCol.setRGB(1, 1, 1)); });
    mesh.userData.heights = cells.map((cell) => cell[3]);
    const z = -22 - rand() * 80;
    // clouds keep to the outer thirds of the view so headings in the middle stay clear
    const halfW = Math.tan((50 / 2) * (Math.PI / 180)) * (30 - z) * 1.9;
    const side = c % 2 === 0 ? -1 : 1;
    mesh.position.set(side * (halfW * (0.42 + rand() * 0.5)), -18 + rand() * (RISE + 40), z);
    mesh.scale.setScalar(1 + rand() * 0.5);
    clouds.push({ mesh, speed: 0.4 + rand() * 0.9, z, half: halfW + a * 2 });
    scene.add(mesh);
  }
  let lastTint = -1;
  const recolorClouds = (lit: number[], shade: number[]) => {
    // re-upload the instance colours only when the light has visibly changed
    const tint = lit[0]! * 3 + lit[1]! * 5 + lit[2]! * 7 + shade[0]! * 11 + shade[1]! * 13 + shade[2]! * 17;
    if (Math.abs(tint - lastTint) < 0.004) return;
    lastTint = tint;
    litCol.setRGB(lit[0]!, lit[1]!, lit[2]!); shadeCol.setRGB(shade[0]!, shade[1]!, shade[2]!);
    for (const { mesh } of clouds) {
      const hs = mesh.userData.heights as number[];
      for (let i = 0; i < hs.length; i++) mesh.setColorAt(i, tmpCol.copy(shadeCol).lerp(litCol, Math.min(1, hs[i]! * 1.4)));
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    }
  };

  // ---------- birds (morning only): a little V of gulls with flapping wings ----------
  const wingGeo = new BufferGeometry();
  wingGeo.setAttribute('position', new BufferAttribute(new Float32Array([0, 0, 0, 1.3, 0.25, 0, 0.5, -0.12, 0]), 3));
  const birdMat = new MeshBasicMaterial({ color: 0x2d3557 });
  const birds: { g: Group; l: Mesh; r: Mesh; ph: number }[] = [];
  const flock = new Group();
  for (let i = 0; i < (lite ? 4 : 7); i++) {
    const g = new Group();
    const l = new Mesh(wingGeo, birdMat), r = new Mesh(wingGeo, birdMat);
    r.scale.x = -1;
    g.add(l, r);
    const row = Math.ceil(i / 2), side = i % 2 === 0 ? 1 : -1;
    g.position.set(-row * 1.8, row * side * 1.1, -row * 0.6);
    flock.add(g);
    birds.push({ g, l, r, ph: i * 0.7 });
  }
  flock.position.set(-60, 12, -35);
  scene.add(flock);

  // ---------- fireflies (after dusk), drawn to the pointer ----------
  const FLIES = lite ? 28 : 70;
  const flyPos = new Float32Array(FLIES * 3), flyHome = new Float32Array(FLIES * 3), flySeed = new Float32Array(FLIES);
  for (let i = 0; i < FLIES; i++) {
    flyHome[i * 3] = (rand() - 0.5) * 70; flyHome[i * 3 + 1] = (rand() - 0.5) * 34; flyHome[i * 3 + 2] = -6 - rand() * 30;
    flySeed[i] = rand();
  }
  flyPos.set(flyHome);
  const flyGeo = new BufferGeometry();
  flyGeo.setAttribute('position', new BufferAttribute(flyPos, 3));
  flyGeo.setAttribute('aSeed', new BufferAttribute(flySeed, 1));
  const flyMat = new ShaderMaterial({ vertexShader: FLY_VERT, fragmentShader: FLY_FRAG, transparent: true, depthWrite: false, blending: AdditiveBlending,
    uniforms: { uTime: { value: 0 }, uPx: { value: 1 }, uAlpha: { value: 0 } } });
  const flies = new Points(flyGeo, flyMat);
  flies.frustumCulled = false;
  scene.add(flies);

  // ---------- state ----------
  let theme: SkyTheme = opts.theme;
  let prevTheme: SkyTheme = theme;
  let themeT = 1; // 0..1 crossfade from prevTheme to theme
  let target = 0, prog = 0;
  let ptrX = -1, ptrY = -1, ptrOn = false, camX = 0, camYoff = 0;
  let covered = false, raf = 0, last = performance.now(), time = 0, rise = 0, acc = 0;
  const sA = newSample(), sB = newSample(), s = newSample();
  const ptrWorld = new Vector3();
  const fogCol = new Color();

  const fit = () => {
    const w = host.clientWidth || innerWidth, h = host.clientHeight || innerHeight;
    const rw = Math.max(32, Math.round(w / PIX)), rh = Math.max(32, Math.round(h / PIX));
    renderer.setSize(rw, rh, false);
    uni.uRes.value.set(rw, rh);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    flyMat.uniforms.uPx!.value = rh / 60;
  };
  fit();
  const ro = new ResizeObserver(fit);
  ro.observe(host);

  let probeT = 0, probeN = 0;
  const frame = (now: number) => {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (covered || document.hidden) return;
    // a full-tier device that keeps missing frames drops to the lite sky by itself (once)
    if (!slow && dt < 0.25) {
      probeT += dt; probeN++;
      if (probeT > 4) {
        if (probeT / probeN > 0.026) { slow = true; PIX = 5; fit(); }
        probeT = 0; probeN = 0;
      }
    }
    // lite devices draw at 30 fps; the sky moves slowly, so nobody can tell
    if (slow) { acc += dt; if (acc < 1 / 31) return; acc = 0; }
    time += dt;
    rise = Math.min(1, rise + dt / 2.2);
    prog += (target - prog) * Math.min(1, dt * 6);
    themeT = Math.min(1, themeT + dt / 0.9);

    sample(theme === 'dark' ? DARK : LIGHT, prog, sB);
    if (themeT < 1) { sample(prevTheme === 'dark' ? DARK : LIGHT, prog, sA); blendSample(sA, sB, themeT * themeT * (3 - 2 * themeT), s); }
    else blendSample(sB, sB, 0, s);

    const dark = theme === 'dark';
    uni.uTop.value.set(s.top[0]!, s.top[1]!, s.top[2]!);
    uni.uMid.value.set(s.mid[0]!, s.mid[1]!, s.mid[2]!);
    uni.uBot.value.set(s.bot[0]!, s.bot[1]!, s.bot[2]!);
    uni.uSun.value.set(s.sun[0]!, s.sun[1]!, s.sun[2]!);
    uni.uNight.value = s.night; uni.uAurora.value = lite ? s.aurora * 0.8 : s.aurora; uni.uGlow.value = s.glow;
    uni.uTime.value = time; uni.uRise.value = 1 - Math.pow(1 - rise, 3); uni.uScroll.value = prog;
    uni.uMoon.value = dark ? 1 : 0;
    // the sun climbs and sinks as the page scrolls; the moon drifts slowly
    // both keep to the upper right, clear of the centred headings and text columns
    if (dark) { uni.uSunPos.value.set(0.86 - 0.06 * prog, 0.84 - 0.05 * prog); uni.uSunR.value = 0.034; }
    else { uni.uSunPos.value.set(0.87 - 0.08 * prog, 0.6 + 0.24 * Math.sin(Math.PI * (prog + 0.12))); uni.uSunR.value = 0.046; }
    uni.uLantern.value = 0; // the owner prefers the sparkle trail (motion/CursorTrail) over a lantern glow
    uni.uPtr.value.set(ptrOn ? ptrX : -1, ptrOn ? 1 - ptrY : -1);

    // light follows the sky
    const sp = uni.uSunPos.value;
    sunLight.position.set((sp.x - 0.5) * 80, (sp.y - 0.3) * 80, 30);
    sunLight.color.setRGB(lerp(1, s.sun[0]!, 0.6), lerp(1, s.sun[1]!, 0.6), lerp(1, s.sun[2]!, 0.6));
    sunLight.intensity = dark ? 0.9 : 2.2;
    hemi.color.setRGB(s.mid[0]!, s.mid[1]!, s.mid[2]!);
    hemi.groundColor.setRGB(s.bot[0]!, s.bot[1]!, s.bot[2]!);
    fogCol.setRGB(lerp(s.mid[0]!, s.bot[0]!, 0.4), lerp(s.mid[1]!, s.bot[1]!, 0.4), lerp(s.mid[2]!, s.bot[2]!, 0.4));
    (scene.fog as Fog).color.copy(fogCol);
    recolorClouds(s.lit, s.shade);

    // the camera climbs with the page and leans a little toward the pointer
    const tx = ptrOn && !lite ? (ptrX - 0.5) * 3 : 0;
    const ty = ptrOn && !lite ? (0.5 - ptrY) * 1.6 : 0;
    camX += (tx - camX) * Math.min(1, dt * 2.5);
    camYoff += (ty - camYoff) * Math.min(1, dt * 2.5);
    camera.position.set(camX, prog * RISE + camYoff, 30);
    camera.lookAt(camX * 0.6, prog * RISE + camYoff * 0.6, 0);

    for (const c of clouds) {
      c.mesh.position.x += c.speed * dt;
      if (c.mesh.position.x > c.half) c.mesh.position.x = -c.half;
    }

    // the gulls cross the morning sky, then rest until the next morning
    const birdsOn = !dark && prog < 0.45;
    flock.visible = birdsOn;
    if (birdsOn) {
      flock.position.x += dt * 6;
      if (flock.position.x > 70) flock.position.x = -70;
      flock.position.y = prog * RISE + 12 + Math.sin(time * 0.6) * 1.2;
      for (const b of birds) {
        const f = Math.sin(time * 9 + b.ph) * 0.7;
        b.l.rotation.y = f; b.r.rotation.y = -f;
        b.l.rotation.x = b.r.rotation.x = -0.3;
      }
    }

    // fireflies wander around their homes; the ones near the pointer drift toward it
    const fa = Math.max(0, (s.night - 0.35) / 0.65);
    flyMat.uniforms.uAlpha!.value = fa;
    flyMat.uniforms.uTime!.value = time;
    flies.visible = fa > 0.01;
    if (flies.visible) {
      flies.position.y = prog * RISE;
      if (ptrOn && FLIES_FOLLOW) {
        ptrWorld.set((ptrX - 0.5) * 2, (0.5 - ptrY) * 2, 0.5).unproject(camera).sub(camera.position).normalize();
        const k = (-18 - camera.position.z) / ptrWorld.z;
        ptrWorld.multiplyScalar(k).add(camera.position);
        ptrWorld.y -= flies.position.y;
      }
      for (let i = 0; i < FLIES; i++) {
        const sd = flySeed[i]!;
        let hx = flyHome[i * 3]! + Math.sin(time * (0.3 + sd * 0.4) + sd * 20) * 3;
        let hy = flyHome[i * 3 + 1]! + Math.cos(time * (0.25 + sd * 0.3) + sd * 13) * 2;
        if (ptrOn && FLIES_FOLLOW) {
          const dx = ptrWorld.x - hx, dy = ptrWorld.y - hy;
          const pull = Math.exp(-(dx * dx + dy * dy) / 160) * 0.75;
          hx += dx * pull; hy += dy * pull;
        }
        flyPos[i * 3] = flyPos[i * 3]! + (hx - flyPos[i * 3]!) * Math.min(1, dt * 2);
        flyPos[i * 3 + 1] = flyPos[i * 3 + 1]! + (hy - flyPos[i * 3 + 1]!) * Math.min(1, dt * 2);
      }
      (flyGeo.attributes.position as BufferAttribute).needsUpdate = true;
    }

    renderer.render(scene, camera);
    if (broken) { cancelAnimationFrame(raf); canvas.remove(); return; }
    if (!canvas.dataset.ready) canvas.dataset.ready = '1';
  };
  raf = requestAnimationFrame(frame);

  return {
    setTheme(next) {
      if (next === theme) return;
      prevTheme = theme; theme = next; themeT = 0;
    },
    setProgress(p) { target = Math.min(1, Math.max(0, p)); },
    setPointer(x, y) { if (x === null) { ptrOn = false; return; } ptrOn = true; ptrX = x; ptrY = y; },
    setCovered(c) { covered = c; },
    dispose() {
      cancelAnimationFrame(raf);
      ro.disconnect();
      scene.traverse((o) => {
        const m = o as Mesh;
        if (m.geometry) m.geometry.dispose();
      });
      skyMat.dispose(); cloudMat.dispose(); birdMat.dispose(); flyMat.dispose(); toonRamp.dispose();
      renderer.dispose();
      canvas.remove();
    },
  };
}
