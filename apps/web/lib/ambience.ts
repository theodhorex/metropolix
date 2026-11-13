// Ambience: the living sky and air around the city, themed per people.
// Fireflies and falling leaves in the elven woods, bubbles and dragonflies over the swamp, eagles and
// dust on the steppe, embers, ash and a passing dragon over the volcano, spores and bats in the scrap
// badlands. Cloud shadows glide over every city. Pure decoration, no game state.
import { CanvasSource, Container, Sprite, Texture } from 'pixi.js';
import { GRID, type ArcId } from '@metropolix/sim';
import { makeCanvas } from './sprites';
import { WILD_RINGS } from './wilds';

const TW = 64, TH = 32;
const toWorld = (x: number, y: number) => ({ x: ((x - y) * TW) / 2, y: ((x + y) * TH) / 2 + TH / 2 });

export interface WaterSpot { x: number; y: number; kind: 'pool' | 'lava' | 'toxic' }
/** A soft light that breathes over glowing scenery (lava, magic mushrooms, toxic puddles). */
export interface LightSpot { x: number; y: number; color: number }

type Motion = 'firefly' | 'rise' | 'fall' | 'drift';
interface MoteSpec { motion: Motion; tex: 'dot' | 'glow' | 'leaf' | 'flake'; colors: number[]; count: number; add?: boolean; ring?: [number, number]; size?: number }
interface FlyerSpec { kind: 'birds' | 'eagle' | 'bats' | 'dragonflies' | 'dragon'; every: [number, number]; color: number }
interface Theme { motes: MoteSpec[]; fog: { color: number; alpha: number; count: number }; flyers: FlyerSpec; clouds: number; bubble: number }

const THEMES: Record<ArcId | 'none', Theme> = {
  elf: {
    motes: [
      { motion: 'firefly', tex: 'glow', colors: [0xd8ff7a, 0xbfe6ff, 0xfff2a8], count: 46, add: true, ring: [1, 12] },
      { motion: 'fall', tex: 'leaf', colors: [0x6fc25a, 0xa8d86a, 0xe0c45a], count: 18, ring: [0, 10] },
    ],
    fog: { color: 0xd8f0e8, alpha: 0.09, count: 9 }, flyers: { kind: 'birds', every: [16, 30], color: 0xf2f2ea }, clouds: 3, bubble: 0xbfe6ff,
  },
  lizard: {
    motes: [
      { motion: 'firefly', tex: 'glow', colors: [0xc6d84f, 0x9ff2a8], count: 22, add: true, ring: [1, 10] },
      { motion: 'drift', tex: 'dot', colors: [0x8aa86a, 0xb8c87a], count: 16, ring: [0, 12] },
    ],
    fog: { color: 0xa8c0a0, alpha: 0.13, count: 12 }, flyers: { kind: 'dragonflies', every: [10, 20], color: 0x4fd8d0 }, clouds: 2, bubble: 0xd8f0e0,
  },
  caveman: {
    motes: [
      { motion: 'drift', tex: 'dot', colors: [0xd8c08a, 0xb8a070], count: 30, ring: [0, 14] },
      { motion: 'fall', tex: 'flake', colors: [0xf0ece0], count: 10, ring: [0, 12] },
    ],
    fog: { color: 0xe0c8a0, alpha: 0.07, count: 6 }, flyers: { kind: 'eagle', every: [14, 26], color: 0x4a3424 }, clouds: 4, bubble: 0xffffff,
  },
  dragon: {
    motes: [
      { motion: 'rise', tex: 'glow', colors: [0xff8a2a, 0xffc24a, 0xff5a1a], count: 56, add: true, ring: [0, 14] },
      { motion: 'fall', tex: 'flake', colors: [0x8a8090, 0x5a5262], count: 26, ring: [0, 14] },
    ],
    fog: { color: 0x3a3040, alpha: 0.16, count: 10 }, flyers: { kind: 'dragon', every: [18, 32], color: 0xd2452a }, clouds: 0, bubble: 0xffd27a,
  },
  // a sunny valley: pollen and seeds on the breeze, leaves off the forest, birds and cloud shadows
  goblin: {
    motes: [
      { motion: 'drift', tex: 'dot', colors: [0xfff6c0, 0xffffff, 0xf4e48a], count: 34, ring: [0, 12], size: 0.8 },
      { motion: 'fall', tex: 'leaf', colors: [0x6fae3e, 0x9ccc5a, 0xd8b84a], count: 20, ring: [2, 12] },
    ],
    fog: { color: 0xf4fbff, alpha: 0.06, count: 6 }, flyers: { kind: 'birds', every: [10, 20], color: 0xf6f6ee }, clouds: 5, bubble: 0xffffff,
  },
  none: {
    motes: [{ motion: 'fall', tex: 'leaf', colors: [0x6fc25a, 0xa8d86a], count: 14, ring: [0, 10] }],
    fog: { color: 0xe0f0e8, alpha: 0.07, count: 6 }, flyers: { kind: 'birds', every: [18, 32], color: 0xf2f2ea }, clouds: 3, bubble: 0xffffff,
  },
};

// ---------- tiny textures ----------
function tex(c: HTMLCanvasElement, smooth = false): Texture {
  return new Texture({ source: new CanvasSource({ resource: c, scaleMode: smooth ? 'linear' : 'nearest', autoGenerateMipmaps: false }) });
}
function pixels(w: number, h: number, rows: string[]): Texture {
  const [c, ctx] = makeCanvas(w, h);
  ctx.fillStyle = '#ffffff';
  rows.forEach((r, y) => { for (let x = 0; x < r.length; x++) if (r[x] === '#') ctx.fillRect(x, y, 1, 1); });
  return tex(c);
}
function softBlob(w: number, h: number): Texture {
  const [c, ctx] = makeCanvas(w, h);
  ctx.imageSmoothingEnabled = true;
  ctx.save(); ctx.scale(1, h / w);
  const g = ctx.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
  g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.55, 'rgba(255,255,255,0.55)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, w); ctx.restore();
  return tex(c, true);
}
function glowDot(): Texture {
  const [c, ctx] = makeCanvas(7, 7);
  ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.fillRect(1, 1, 5, 5); ctx.fillRect(0, 2, 7, 3); ctx.fillRect(2, 0, 3, 7);
  ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.fillRect(2, 2, 3, 3);
  ctx.fillStyle = '#ffffff'; ctx.fillRect(3, 3, 1, 1);
  return tex(c);
}

/** Wing frames, white so a tint colours them. */
const FLYER_ART: Record<FlyerSpec['kind'], { w: number; h: number; frames: string[][]; scale: number }> = {
  birds: { w: 7, h: 4, scale: 1, frames: [['#.....#', '.#...#.', '..#.#..', '...#...'], ['.......', '###.###', '...#...', '.......']] },
  eagle: { w: 15, h: 6, scale: 1, frames: [
    ['##...........##', '.###.......###.', '...####.####...', '......###......', '.......#.......', '...............'],
    ['...............', '...............', '#####.###.#####', '...#########...', '......###......', '.......#.......']] },
  bats: { w: 9, h: 4, scale: 1, frames: [['#.......#', '##.###.##', '.#######.', '...#.#...'], ['.........', '..#####..', '#########', '#..#.#..#']] },
  dragonflies: { w: 7, h: 3, scale: 1, frames: [['##.#.##', '..###..', '...#...'], ['.......', '#######', '...#...']] },
  dragon: { w: 36, h: 14, scale: 3, frames: [
    ['#..................................#', '##................................##', '.###............................###.', '..####......................####....', '...######..............######.......', '.....#######...##...#######.........', '.......###############.#####........', '.........##############...###.......', '...........##########.......##......', '............##....##..........#.....', '.............#....#.................', '....................................', '....................................', '....................................'],
    ['....................................', '....................................', '....................................', '....................................', '..........................#.........', '...............##........##.........', '.....#################.#####........', '..##########################........', '#############################.......', '.##........##########.......##......', '.............##....##.........#.....', '..............#....#................', '....................................', '....................................']] },
};

interface Mote { s: Sprite; spec: MoteSpec; x: number; y: number; vx: number; vy: number; life: number; max: number; ph: number; base: number }
interface Puff { s: Sprite; x: number; y: number; vx: number; vy: number; life: number; max: number; base: number }
interface Flyer { s: Sprite; shadow: Sprite; x: number; y: number; vx: number; vy: number; ph: number; frame: number; aura?: Sprite; breath?: number; trail?: number }

/** Circle-free helper: a random point in the wilds, between two rings past the map edge (in world px). */
function wildPoint(r0: number, r1: number): { x: number; y: number } {
  for (let i = 0; i < 40; i++) {
    const x = Math.floor(Math.random() * (GRID + 2 * r1)) - r1;
    const y = Math.floor(Math.random() * (GRID + 2 * r1)) - r1;
    const ring = Math.max(-x, -y, x - (GRID - 1), y - (GRID - 1));
    if (ring >= r0 && ring <= r1) { const w = toWorld(x + Math.random(), y + Math.random()); return w; }
  }
  return toWorld(-r0 - 1, Math.random() * GRID);
}
/** A random point anywhere over the map or the near wilds. */
function anyPoint(pad: number) { return toWorld(Math.random() * (GRID + 2 * pad) - pad, Math.random() * (GRID + 2 * pad) - pad); }

export class Ambience {
  private theme: Theme;
  private texDot = pixels(2, 2, ['##', '##']);
  private texFlake = pixels(2, 1, ['##']);
  private texLeaf = pixels(3, 2, ['##.', '.##']);
  private texGlow = glowDot();
  private texFog = softBlob(256, 96);
  private texCloud = softBlob(512, 220);
  private flyerTex: Texture[];
  private motes: Mote[] = [];
  private fog: Puff[] = [];
  private clouds: Puff[] = [];
  private bubbles: Puff[] = [];
  private flyers: Flyer[] = [];
  private lights: { s: Sprite; ph: number; base: number; speed: number }[] = [];
  private nextFlock = 4;
  private t = 0;
  private wingMs = 0;

  constructor(private readonly air: Container, private readonly sky: Container, private readonly arc: ArcId | null,
    private readonly water: WaterSpot[], private lite: boolean, private readonly glows: LightSpot[] = []) {
    this.theme = THEMES[arc ?? 'none'];
    const art = FLYER_ART[this.theme.flyers.kind];
    this.flyerTex = art.frames.map((f) => pixels(art.w, art.h, f));
    this.populate();
  }

  setLite(lite: boolean) {
    if (lite === this.lite) return;
    this.lite = lite;
    this.clear();
    this.populate();
  }

  private scaleCount(n: number) { return this.lite ? Math.ceil(n * 0.4) : n; }

  private populate() {
    for (const spec of this.theme.motes) for (let i = 0; i < this.scaleCount(spec.count); i++) this.motes.push(this.newMote(spec, true));
    if (!this.lite) for (let i = 0; i < this.theme.fog.count; i++) this.fog.push(this.newFog(true));
    for (let i = 0; i < this.theme.clouds; i++) this.clouds.push(this.newCloud(true));
    // glow pools of light under lava and magic: additive, so they brighten the dark wilds
    const cap = this.lite ? 40 : 140;
    const stride = Math.max(1, Math.ceil(this.glows.length / cap)); // spread evenly, not just the first ones
    for (const g of this.glows.filter((_, i) => i % stride === 0)) {
      const s = new Sprite({ texture: this.texFog });
      s.anchor.set(0.5); s.tint = g.color; s.blendMode = 'add'; s.scale.set(0.42, 0.42);
      s.position.set(g.x, g.y);
      this.air.addChild(s);
      this.lights.push({ s, ph: Math.random() * 6.28, base: 0.32 + Math.random() * 0.18, speed: 1.2 + Math.random() * 1.4 });
    }
    this.nextFlock = 3 + Math.random() * 4;
  }

  private moteTex(spec: MoteSpec) { return spec.tex === 'glow' ? this.texGlow : spec.tex === 'leaf' ? this.texLeaf : spec.tex === 'flake' ? this.texFlake : this.texDot; }

  private newMote(spec: MoteSpec, warm: boolean, reuse?: Sprite): Mote {
    const s = reuse ?? new Sprite({ texture: this.moteTex(spec), roundPixels: true });
    s.anchor.set(0.5);
    s.tint = spec.colors[Math.floor(Math.random() * spec.colors.length)]!;
    if (spec.add) s.blendMode = 'add';
    s.scale.set(spec.size ?? 1);
    if (!reuse) this.air.addChild(s);
    const [r0, r1] = spec.ring ?? [0, 10];
    const p = wildPoint(r0, r1);
    const m: Mote = { s, spec, x: p.x, y: p.y, vx: 0, vy: 0, life: 0, max: 4 + Math.random() * 6, ph: Math.random() * 6.28, base: 1 };
    switch (spec.motion) {
      case 'firefly': m.max = 6 + Math.random() * 8; break;
      case 'rise': m.vy = -(14 + Math.random() * 22); m.vx = (Math.random() - 0.5) * 6; m.max = 2.5 + Math.random() * 3.5; break;
      case 'fall': m.y -= 90 + Math.random() * 60; m.vy = 9 + Math.random() * 10; m.vx = 6 + Math.random() * 6; m.max = 8 + Math.random() * 6; break;
      case 'drift': m.vx = 8 + Math.random() * 10; m.vy = (Math.random() - 0.5) * 3; m.max = 7 + Math.random() * 6; m.base = 0.6; break;
    }
    if (warm) m.life = Math.random() * m.max;
    return m;
  }

  private newFog(warm: boolean, reuse?: Sprite): Puff {
    const f = this.theme.fog;
    const s = reuse ?? new Sprite({ texture: this.texFog });
    s.anchor.set(0.5); s.tint = f.color;
    const k = 1.2 + Math.random() * 1.6; s.scale.set(k, k * 0.8);
    if (!reuse) this.air.addChild(s);
    const p = wildPoint(3, WILD_RINGS - 3);
    const puff: Puff = { s, x: p.x, y: p.y, vx: 4 + Math.random() * 6, vy: (Math.random() - 0.5) * 2, life: 0, max: 30 + Math.random() * 30, base: f.alpha * (0.6 + Math.random() * 0.8) };
    if (warm) puff.life = Math.random() * puff.max;
    return puff;
  }

  /** Cloud shadows: huge, faint and slow, sliding diagonally over the whole city. */
  private newCloud(warm: boolean, reuse?: Sprite): Puff {
    const s = reuse ?? new Sprite({ texture: this.texCloud });
    s.anchor.set(0.5); s.tint = 0x000000;
    const k = 1.6 + Math.random() * 1.6; s.scale.set(k, k * 0.7);
    if (!reuse) this.sky.addChild(s);
    const span = GRID * TW;
    const x = warm ? (Math.random() - 0.5) * span * 1.4 : -span * 0.95;
    const y = warm ? Math.random() * GRID * TH : -GRID * TH * 0.1 + Math.random() * GRID * TH * 0.8;
    return { s, x, y, vx: 16 + Math.random() * 10, vy: 5 + Math.random() * 4, life: 0, max: 1, base: 0.1 + Math.random() * 0.05 };
  }

  private spawnFlock() {
    const fl = this.theme.flyers, art = FLYER_ART[fl.kind];
    const n = fl.kind === 'dragon' ? 1 : fl.kind === 'eagle' ? 1 + Math.floor(Math.random() * 2) : fl.kind === 'dragonflies' ? 3 + Math.floor(Math.random() * 3) : 5 + Math.floor(Math.random() * 4);
    // cross the map from one side to the other, picking a random lane
    const fromLeft = Math.random() < 0.5;
    const span = GRID * TW;
    const lane = anyPoint(0).y;
    const speed = fl.kind === 'dragon' ? 120 : fl.kind === 'eagle' ? 55 : fl.kind === 'dragonflies' ? 70 : 85;
    const dir = fromLeft ? 1 : -1;
    for (let i = 0; i < n; i++) {
      const s = new Sprite({ texture: this.flyerTex[0]!, roundPixels: true });
      s.anchor.set(0.5); s.tint = fl.color; s.scale.set(art.scale * dir, art.scale);
      const shadow = new Sprite({ texture: this.flyerTex[1]!, roundPixels: true });
      shadow.anchor.set(0.5); shadow.tint = 0x000000; shadow.alpha = fl.kind === 'dragon' ? 0.22 : 0.14;
      shadow.scale.set(art.scale * dir * 1.1, art.scale * 0.6);
      this.sky.addChild(shadow); this.air.addChild(s);
      // a V formation: the leader in front, the rest trailing behind on either side
      const row = Math.ceil(i / 2), side = i % 2 ? 1 : -1;
      const x = (fromLeft ? -span * 0.85 : span * 0.85) - dir * row * 22;
      const y = lane - 160 + side * row * 12;
      const f: Flyer = { s, shadow, x, y, vx: dir * speed * (0.9 + Math.random() * 0.2), vy: (Math.random() - 0.5) * 10, ph: Math.random() * 6.28, frame: i % 2 };
      if (fl.kind === 'dragon') {
        // a halo of firelight rides with the dragon, and it breathes fire now and then
        const aura = new Sprite({ texture: this.texFog });
        aura.anchor.set(0.5); aura.tint = 0xff6a1a; aura.blendMode = 'add'; aura.scale.set(0.9, 0.6); aura.alpha = 0.45;
        this.air.addChildAt(aura, this.air.children.indexOf(s));
        f.aura = aura; f.breath = 1.5 + Math.random(); f.trail = 0;
      }
      this.flyers.push(f);
    }
  }

  update(dtMs: number) {
    const dt = Math.min(dtMs, 100) / 1000;
    this.t += dt;
    for (let i = 0; i < this.motes.length; i++) {
      const m = this.motes[i]!;
      m.life += dt;
      if (m.life >= m.max) { this.motes[i] = this.newMote(m.spec, false, m.s); continue; }
      const u = m.life / m.max;
      const fade = Math.min(1, u * 5, (1 - u) * 5);
      if (m.spec.motion === 'firefly') {
        m.x += Math.sin(this.t * 0.9 + m.ph) * 9 * dt; m.y += Math.cos(this.t * 0.7 + m.ph * 1.3) * 6 * dt;
        m.s.alpha = fade * (0.35 + 0.65 * Math.max(0, Math.sin(this.t * 2.2 + m.ph)));
      } else {
        m.x += (m.vx + (m.spec.motion === 'fall' ? Math.sin(this.t * 2 + m.ph) * 10 : 0)) * dt;
        m.y += m.vy * dt;
        if (m.spec.motion === 'rise') m.x += Math.sin(this.t * 3 + m.ph) * 8 * dt;
        if (m.spec.motion === 'fall') m.s.scale.x = Math.sin(this.t * 4 + m.ph) > 0 ? 1 : -1; // leaves flutter
        m.s.alpha = fade * m.base * (m.spec.motion === 'rise' ? 0.6 + 0.4 * Math.sin(this.t * 9 + m.ph) : 1);
      }
      m.s.position.set(Math.round(m.x), Math.round(m.y));
    }
    for (let i = 0; i < this.fog.length; i++) {
      const f = this.fog[i]!;
      f.life += dt;
      if (f.life >= f.max) { this.fog[i] = this.newFog(false, f.s); continue; }
      const u = f.life / f.max;
      f.x += f.vx * dt; f.y += f.vy * dt;
      f.s.alpha = f.base * Math.sin(u * Math.PI);
      f.s.position.set(f.x, f.y);
    }
    const span = GRID * TW;
    for (let i = 0; i < this.clouds.length; i++) {
      const c = this.clouds[i]!;
      c.x += c.vx * dt; c.y += c.vy * dt;
      if (c.x > span * 0.95 || c.y > GRID * TH * 1.2) { this.clouds[i] = this.newCloud(false, c.s); continue; }
      c.s.alpha = c.base; c.s.position.set(c.x, c.y);
    }
    for (const l of this.lights) l.s.alpha = l.base * (0.65 + 0.35 * Math.sin(this.t * l.speed + l.ph));
    this.updateBubbles(dt);
    this.updateFlyers(dt, dtMs);
  }

  /** Bubbles over swamp pools and toxic puddles, sparks leaping off lava. */
  private updateBubbles(dt: number) {
    const cap = this.lite ? 10 : 28;
    if (this.water.length && this.bubbles.length < cap && Math.random() < dt * (this.lite ? 4 : 10)) {
      const w = this.water[Math.floor(Math.random() * this.water.length)]!;
      const lava = w.kind === 'lava';
      const s = new Sprite({ texture: lava ? this.texGlow : this.texDot, roundPixels: true });
      s.anchor.set(0.5);
      s.tint = lava ? (Math.random() < 0.5 ? 0xffc24a : 0xff7a2a) : w.kind === 'toxic' ? 0xbff26a : this.theme.bubble;
      if (lava) s.blendMode = 'add';
      s.scale.set(lava ? 0.8 : 1);
      this.air.addChild(s);
      const ox = (Math.random() - 0.5) * 18, oy = (Math.random() - 0.5) * 6;
      this.bubbles.push({ s, x: w.x + ox, y: w.y + oy, vx: lava ? (Math.random() - 0.5) * 30 : 0, vy: lava ? -(40 + Math.random() * 40) : -(6 + Math.random() * 6), life: 0, max: lava ? 0.9 + Math.random() * 0.6 : 0.8 + Math.random() * 0.8, base: 1 });
    }
    for (let i = this.bubbles.length - 1; i >= 0; i--) {
      const b = this.bubbles[i]!;
      b.life += dt;
      if (b.life >= b.max) { b.s.destroy(); this.bubbles.splice(i, 1); continue; }
      b.x += b.vx * dt; b.y += b.vy * dt;
      if (b.vx !== 0 && b.base !== 0) b.vy += 90 * dt; // lava sparks arc and fall back in; dragon fire just fades
      b.s.alpha = 1 - b.life / b.max;
      b.s.position.set(Math.round(b.x), Math.round(b.y));
    }
  }

  private updateFlyers(dt: number, dtMs: number) {
    this.nextFlock -= dt;
    if (this.nextFlock <= 0 && this.flyers.length === 0) {
      this.spawnFlock();
      const [a, b] = this.theme.flyers.every;
      this.nextFlock = a + Math.random() * (b - a);
    }
    this.wingMs += dtMs;
    const flap = this.theme.flyers.kind === 'dragon' ? 420 : this.theme.flyers.kind === 'eagle' ? 520 : this.theme.flyers.kind === 'dragonflies' ? 70 : 160;
    const tick = this.wingMs >= flap;
    if (tick) this.wingMs %= flap;
    const span = GRID * TW;
    const kind = this.theme.flyers.kind;
    for (let i = this.flyers.length - 1; i >= 0; i--) {
      const f = this.flyers[i]!;
      f.x += f.vx * dt;
      f.y += (f.vy + Math.sin(this.t * (kind === 'bats' ? 6 : 1.4) + f.ph) * (kind === 'bats' ? 30 : kind === 'dragonflies' ? 24 : 8)) * dt;
      if (tick) { f.frame ^= 1; f.s.texture = this.flyerTex[f.frame]!; }
      f.s.position.set(Math.round(f.x), Math.round(f.y));
      // the shadow falls on the ground well below the flyer, so it reads as high in the sky
      f.shadow.position.set(Math.round(f.x + 30), Math.round(f.y + (kind === 'dragon' ? 210 : 150)));
      if (f.aura) this.dragonFire(f, dt);
      if (Math.abs(f.x) > span * 0.95) { f.s.destroy(); f.shadow.destroy(); f.aura?.destroy(); this.flyers.splice(i, 1); }
    }
  }

  /** Embers trail from the dragon's wings, and every few seconds it roars a cone of fire ahead of it. */
  private dragonFire(f: Flyer, dt: number) {
    const dir = Math.sign(f.vx) || 1;
    f.aura!.position.set(f.x, f.y + 6);
    f.aura!.alpha = 0.38 + 0.12 * Math.sin(this.t * 7);
    f.trail! += dt;
    while (f.trail! > 0.05) {
      f.trail! -= 0.05;
      this.spark(f.x - dir * (20 + Math.random() * 30), f.y + (Math.random() - 0.5) * 16, -dir * 10, 10 + Math.random() * 15, 0.7 + Math.random() * 0.6, Math.random() < 0.5 ? 0xffc24a : 0xff7a2a);
    }
    f.breath! -= dt;
    if (f.breath! <= 0) {
      if (f.breath! < -0.7) { f.breath = 2.5 + Math.random() * 2.5; return; }
      for (let k = 0; k < 4; k++) {
        const v = 160 + Math.random() * 120, a = (Math.random() - 0.3) * 0.5;
        const c = [0xfff2b0, 0xffc24a, 0xff7a2a, 0xff4a1a][Math.floor(Math.random() * 4)]!;
        this.spark(f.x + dir * 40, f.y + 8, dir * v * Math.cos(a) + f.vx, v * Math.sin(a) + 40, 0.35 + Math.random() * 0.35, c, 1.4);
      }
    }
  }

  private spark(x: number, y: number, vx: number, vy: number, life: number, color: number, size = 1) {
    if (this.bubbles.length > (this.lite ? 60 : 160)) return;
    const s = new Sprite({ texture: this.texGlow, roundPixels: true });
    s.anchor.set(0.5); s.tint = color; s.blendMode = 'add'; s.scale.set(size);
    this.air.addChild(s);
    this.bubbles.push({ s, x, y, vx, vy, life: 0, max: life, base: 0 });
  }

  private clear() {
    for (const m of this.motes) m.s.destroy();
    for (const f of this.fog) f.s.destroy();
    for (const c of this.clouds) c.s.destroy();
    for (const b of this.bubbles) b.s.destroy();
    for (const f of this.flyers) { f.s.destroy(); f.shadow.destroy(); f.aura?.destroy(); }
    for (const l of this.lights) l.s.destroy();
    this.lights = [];
    this.motes = []; this.fog = []; this.clouds = []; this.bubbles = []; this.flyers = [];
  }

  destroy() {
    this.clear();
    for (const t of [this.texDot, this.texFlake, this.texLeaf, this.texGlow, this.texFog, this.texCloud, ...this.flyerTex]) t.destroy(true);
  }
}
