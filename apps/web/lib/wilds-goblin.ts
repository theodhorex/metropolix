// The Goblin wilds in HD (2x canvases): a sunny valley like a classic city builder. Pine forest and
// round oaks, mossy boulders, a cliff ridge behind the city with a waterfall feeding a river, a
// stone city wall with towers and gates around the buildable land, and a little goblin scrap.
import { G, box, brickWalls, banner, bush, disc, gear, groundShadow, scrap, STONE } from './arcs/goblin-hd/kit';
import { GRID } from '@metropolix/sim';
import { isoDiamond, makeCanvas, px, rect, tileHash, leftWallRect, rightWallRect } from './sprites';

type Ctx = CanvasRenderingContext2D;
const W = 128;

export interface GoblinWildArt {
  ground: HTMLCanvasElement[];      // 4 grass variants (130x66, no outline)
  water: HTMLCanvasElement[][];     // river tile per land-side mask (16), 3 frames each
  props: { frames: HTMLCanvasElement[]; tall: boolean; sway?: number; glow?: number; water?: 'pool' }[];
  /** Prop indexes for the special pieces. */
  idx: { wallX: number; wallY: number; tower: number; gateX: number; gateY: number };
  /** Ridge block prop per tile key "x,y". */
  ridge: Map<string, number>;
  /** Ordinary scenery, chosen by pickProp like any other people's. */
  tall: number[]; low: number[];
}

// ---------- ground ----------
function grass(variant: number, shade = 0): HTMLCanvasElement {
  const [cv, ctx] = makeCanvas(W + 2, 66);
  const base = shade ? '#528c34' : G.grass;
  isoDiamond(ctx, 65, 33, 65, base);
  for (let u = 1; u < 64; u++) for (let v = 1; v < 64; v++) {
    const h = tileHash(u, v, variant * 7 + shade * 3 + 11) % 41;
    const sx = 65 + (u - v), sy = 1 + ((u + v) >> 1);
    if (h < 3) rect(ctx, sx - 1, sy, 2, 1, G.grassDark);
    else if (h < 5) rect(ctx, sx - 1, sy, 2, 1, G.grassLight);
    else if (h === 5 && !shade) { px(ctx, sx, sy - 1, G.grassTip); px(ctx, sx, sy, G.grassLight); }
    else if (h === 6 && variant === 1) px(ctx, sx, sy, '#f4e04a');
    else if (h === 6 && variant === 2) px(ctx, sx, sy, '#f6f2e0');
  }
  return cv;
}

// Pixel buffers: faces and water are painted pixel by pixel, much faster through ImageData.
type Buf = { d: Uint8ClampedArray; w: number; h: number };
const rgb = (c: string) => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)] as const;
function put(b: Buf, x: number, y: number, c: readonly [number, number, number]) {
  if (x < 0 || y < 0 || x >= b.w || y >= b.h) return;
  const i = (y * b.w + x) * 4; b.d[i] = c[0]; b.d[i + 1] = c[1]; b.d[i + 2] = c[2]; b.d[i + 3] = 255;
}

const WATER = {
  deep: rgb('#2f8ab4'), mid: rgb('#3d9dc4'), shallow: rgb('#5cbcd6'), lip: rgb('#8fd8e8'),
  foam: rgb('#f2fcff'), foam2: rgb('#c6eef8'), sand: rgb('#d8c08a'), sandDark: rgb('#b89c64'), wet: rgb('#9a8456'),
  glint: rgb('#e6fbff'), streak: rgb('#7ccbe2'),
};

/**
 * One river tile. `mask` marks the sides that touch land (1: -x, 2: -y, 4: +x, 8: +y); those sides get a
 * sandy bank, a wet edge and a foam line. Sides touching more water stay plain, so the river has no seams.
 */
function waterTile(mask: number, frame: number): HTMLCanvasElement {
  const [cv, ctx] = makeCanvas(W + 2, 66);
  const img = ctx.createImageData(W + 2, 66);
  const b: Buf = { d: img.data, w: W + 2, h: 66 };
  for (let u = 0; u < 64; u++) for (let v = 0; v < 64; v++) {
    let d = 99;
    if (mask & 1) d = Math.min(d, u); if (mask & 4) d = Math.min(d, 63 - u);
    if (mask & 2) d = Math.min(d, v); if (mask & 8) d = Math.min(d, 63 - v);
    const n = tileHash(u, v, 77) % 7;
    const edge = d + (n > 4 ? 1 : 0) - ((u * 3 + v * 5 + frame) % 5 === 0 ? 1 : 0);
    let c: readonly [number, number, number];
    if (edge < 3) c = n < 2 ? WATER.sandDark : WATER.sand;
    else if (edge < 4) c = WATER.wet;
    else if (edge < 5 + ((frame + u + v) % 3 === 0 ? 1 : 0)) c = WATER.foam;
    else if (edge < 7) c = WATER.foam2;
    else if (edge < 10) c = WATER.lip;
    else if (edge < 16) c = WATER.shallow;
    else c = (u + v) % 2 && n === 0 ? WATER.mid : d > 24 ? WATER.deep : WATER.mid;
    // ripples flowing along the river, offset per frame
    const r = (u * 2 + v * 3 + frame * 5) % 37;
    if (edge >= 10 && r === 0) c = WATER.streak;
    if (edge >= 10 && r === 1 && n < 2) c = WATER.glint;
    const sx = 65 + (u - v), sy = 1 + ((u + v) >> 1);
    put(b, sx - 1, sy, c); put(b, sx, sy, c);
    if (((u + v) & 1) === 0) { put(b, sx - 1, sy + 1, c); put(b, sx, sy + 1, c); }
  }
  ctx.putImageData(img, 0, 0);
  return cv;
}

// ---------- trees and rocks ----------
function pine(ctx: Ctx, bx: number, by: number, h: number, salt: number) {
  const dark = '#24502a', mid = '#2f6a34', light = '#4a8e40', tip = '#7ab85a';
  ctx.fillStyle = G.shadow; for (let k = 0; k < 9; k++) ctx.fillRect(bx - 14 + k, by - 2 + (k >> 1), 18 - k, 2);
  rect(ctx, bx - 2, by - 8, 5, 9, G.out); rect(ctx, bx - 1, by - 8, 3, 8, '#5a3a22'); px(ctx, bx + 1, by - 8, '#7a5030');
  const tiers = 4 + (salt % 2), tierH = Math.floor((h - 6) / tiers) + 4;
  for (let t = 0; t < tiers; t++) {
    const top = by - h + Math.floor((t * (h - 10)) / tiers);
    const half = 5 + Math.floor(((t + 1) * h) / 7.5);
    for (let dy = 0; dy <= tierH; dy++) {
      const span = Math.max(1, Math.floor((half * dy) / tierH));
      const y = top + dy;
      rect(ctx, bx - span - 1, y, span * 2 + 3, 1, G.out);
      rect(ctx, bx - span, y, span, 1, dy < 2 ? light : mid);
      rect(ctx, bx, y, span + 1, 1, dark);
      if (dy === tierH - 1) { for (let k = -span + 1; k < 0; k += 3) px(ctx, bx + k, y, tip); }
    }
  }
  px(ctx, bx, by - h - 1, tip);
}

function oak(ctx: Ctx, bx: number, by: number, r: number, salt: number) {
  ctx.fillStyle = G.shadow; for (let k = 0; k < r; k++) ctx.fillRect(bx - r - 4 + k, by - 1 + (k >> 2), r * 2 - k, 2);
  rect(ctx, bx - 3, by - r - 4, 6, r + 5, G.out); rect(ctx, bx - 2, by - r - 4, 2, r + 4, '#5a3a22'); rect(ctx, bx, by - r - 4, 2, r + 4, '#7a5030');
  const cy = by - r - 10;
  const blobs = [[0, 0, r], [-r + 3, 4, r - 3], [r - 3, 4, r - 3], [-2, -r + 4, r - 4], [3, -2, r - 2]] as const;
  for (const [dx, dy, rr] of blobs) disc(ctx, bx + dx, cy + dy, rr + 1, G.out);
  for (const [dx, dy, rr] of blobs) disc(ctx, bx + dx, cy + dy, rr, '#3f7a2e');
  for (const [dx, dy, rr] of blobs) disc(ctx, bx + dx + 1, cy + dy + 2, Math.max(2, rr - 3), '#2e5e24');
  for (const [dx, dy, rr] of blobs) disc(ctx, bx + dx - 2, cy + dy - 2, Math.max(2, rr - 5), '#5e9a3e');
  for (let i = 0; i < 8; i++) { const h = tileHash(i, salt, 3); px(ctx, bx - r + 2 + (h % (r * 2 - 2)), cy - r + 3 + ((h >>> 8) % r), '#8cc45c'); }
}

function boulder(ctx: Ctx, bx: number, by: number, w: number, moss = true) {
  ctx.fillStyle = G.shadow; ctx.fillRect(bx - w - 3, by - 1, w * 2 + 2, 3);
  const h = Math.floor(w * 0.85);
  for (let dy = 0; dy < h; dy++) {
    const span = Math.round(w * Math.sqrt(1 - ((h - dy) / (h + 1)) ** 2));
    const y = by - h + dy;
    rect(ctx, bx - span - 1, y, span * 2 + 2, 1, G.out);
    rect(ctx, bx - span, y, span * 2, 1, dy < h * 0.35 ? '#c2bcb0' : '#a39d92');
    rect(ctx, bx + Math.floor(span / 4), y, span - Math.floor(span / 4), 1, '#86807a');
    if (moss && dy < 3) rect(ctx, bx - span + 1, y, Math.max(1, span - 2), 1, '#6aa244');
  }
  rect(ctx, bx - w - 1, by, w * 2 + 2, 1, G.out);
}

const ROCK_L = ['#b8ae9c', '#aaa08d', '#c2b8a6', '#a19784'].map(rgb), ROCK_R = ['#877e70', '#7c7366', '#918878', '#746b5e'].map(rgb);
const LEDGE_L = rgb('#d6ccb8'), LEDGE_R = rgb('#a39a8a'), SEAM = rgb('#655d51'), CRACK = rgb('#544d43'), AO = rgb('#5e574c');
const MOSS = rgb('#5e9a3e'), MOSS_D = rgb('#477a2e'), MOSS_L = rgb('#7cb84e');
const FALL = { base: rgb('#5ab8d6'), dark: rgb('#4aa2c4'), light: rgb('#a6e6f6'), white: rgb('#ffffff'), foam: rgb('#e8f9ff') };

/**
 * A block of the rock ridge behind the city: an iso block `h` px tall with layered, mossy rock faces and
 * grass (or the river) on top. Neighbouring blocks share the same rock layers, so the ridge reads as one
 * cliff. `fall` pours the river down the face toward the city.
 */
function cliffBlock(h: number, top: 'grass' | 'water', fall: boolean, tree: number, frame: number): HTMLCanvasElement {
  const TREE = tree ? 96 : 0;
  const CH = h + 66 + TREE;
  const [cv, ctx] = makeCanvas(W, CH);
  const img = ctx.createImageData(W, CH);
  const b: Buf = { d: img.data, w: W, h: CH };
  const fy = CH - 1;
  const layer = (z: number, k: number) => Math.floor((z + (tileHash(k >> 3, 0, 41) % 4)) / 11);
  for (let k = 0; k < 64; k++) {
    // left face (toward the city): x = 63 - k; right face: x = 64 + k
    const mossTop = h - 4 - (tileHash(k, 1, 43) % 6) - (tileHash(k, 2, 44) % 9 === 0 ? 10 : 0);
    const crackK = tileHash(k, 3, 45) % 13 === 0;
    for (let z = 0; z < h; z++) {
      const yb = fy - (k >> 1) - z;
      const L = layer(z, k), edge = (z + (tileHash(k >> 3, 0, 41) % 4)) % 11;
      let cl = ROCK_L[L % 4]!, cr = ROCK_R[(L + 1) % 4]!;
      if (edge === 10) { cl = LEDGE_L; cr = LEDGE_R; } else if (edge === 0) { cl = SEAM; cr = SEAM; }
      if (crackK && z > 6 && z < h - 8 && (z + k) % 9 < 6) { cl = CRACK; cr = CRACK; }
      if (z < 4) { cl = AO; cr = AO; }
      if (z >= mossTop) { const m = z >= h - 2 ? MOSS_L : (z + k) % 3 ? MOSS : MOSS_D; cl = m; cr = m; }
      if (fall) {
        const fz = (z + frame * 4 + (tileHash(k, 5, 46) % 12)) % 12;
        cl = z < 7 ? ((z + k + frame) % 3 ? FALL.foam : FALL.white) : fz === 0 ? FALL.white : fz < 3 ? FALL.light : k % 7 === 0 ? FALL.dark : FALL.base;
        if (z >= h - 2) cl = FALL.white;
      }
      put(b, 63 - k, yb, cl);
      put(b, 64 + k, yb, cr);
    }
  }
  ctx.putImageData(img, 0, 0);
  // the top: grass, or the river running to the edge
  const cy = fy - h - 32;
  if (top === 'grass') {
    isoDiamond(ctx, 64, cy, 64, G.grass);
    for (let u = 1; u < 63; u++) for (let v = 1; v < 63; v++) {
      const n = tileHash(u, v, 49) % 37;
      const sx = 64 + (u - v), sy = cy - 32 + ((u + v) >> 1);
      if (n < 3) rect(ctx, sx - 1, sy, 2, 1, G.grassDark); else if (n < 5) rect(ctx, sx - 1, sy, 2, 1, G.grassLight);
    }
    // a lit lip along the two front edges
    for (let k = 0; k < 64; k++) { px(ctx, 63 - k, fy - h - (k >> 1), G.grassTip); px(ctx, 64 + k, fy - h - (k >> 1), G.grassLight); }
  } else {
    isoDiamond(ctx, 64, cy, 64, '#3d9dc4');
    for (let i = 0; i < 26; i++) {
      const n = tileHash(i, frame, 51), u = 4 + (n % 56), v = (((n >>> 8) % 56) + frame * 6) % 60 + 2;
      rect(ctx, 64 + (u - v), cy - 32 + ((u + v) >> 1), 3 + (n % 4), 1, i % 3 ? '#7ccbe2' : '#e6fbff');
    }
  }
  if (tree === 1) pine(ctx, 64, cy + 8, 84, h);
  if (tree === 2) { pine(ctx, 46, cy + 2, 64, h); pine(ctx, 80, cy + 10, 76, h + 1); }
  return cv;
}

// ---------- the city wall ----------
const WALL_H = 30;
/** A wall segment running along the map's x axis (screen right-down), centred on the tile. */
function wallX(gate: boolean): HTMLCanvasElement {
  const [cv, ctx] = makeCanvas(W, W);
  const fx = 93, fy = 115, wL = 66, wR = 16;
  groundShadow(ctx, fx, fy, wL, wR, 6);
  box(ctx, fx, fy, wL, wR, WALL_H, STONE);
  brickWalls(ctx, fx, fy, wL, wR, WALL_H, 4, 7);
  // crenellations
  for (let u = wL - 6; u >= 2; u -= 8) box(ctx, fx - u, fy - WALL_H - (u >> 1), 4, wR, 5, STONE);
  if (gate) {
    // an arched gate with an iron portcullis on the face we see
    leftWallRect(ctx, fx, fy, 24, 0, 18, 18, G.out);
    leftWallRect(ctx, fx, fy, 25, 0, 16, 16, '#2a1e14');
    for (let u = 26; u < 41; u += 3) leftWallRect(ctx, fx, fy, u, 0, 1, 16, G.ironR);
    for (let z = 3; z < 16; z += 4) leftWallRect(ctx, fx, fy, 25, z, 16, 1, G.ironL);
  }
  return cv;
}
/** A wall segment running along the map's y axis (screen left-down). */
function wallY(gate: boolean): HTMLCanvasElement {
  const [cv, ctx] = makeCanvas(W, W);
  const fx = 36, fy = 115, wL = 16, wR = 66;
  groundShadow(ctx, fx, fy, wL, wR, 6);
  box(ctx, fx, fy, wL, wR, WALL_H, STONE);
  brickWalls(ctx, fx, fy, wL, wR, WALL_H, 4, 7);
  for (let v = wR - 6; v >= 2; v -= 8) box(ctx, fx + v + 4, fy - WALL_H - ((v + 4) >> 1), wL, 4, 5, STONE);
  if (gate) {
    rightWallRect(ctx, fx, fy, 24, 0, 18, 18, G.out);
    rightWallRect(ctx, fx, fy, 25, 0, 16, 16, '#2a1e14');
    for (let v = 26; v < 41; v += 3) rightWallRect(ctx, fx, fy, v, 0, 1, 16, G.ironR);
    for (let z = 3; z < 16; z += 4) rightWallRect(ctx, fx, fy, 25, z, 16, 1, G.ironL);
  }
  return cv;
}
/** A round-ish tower with a conical rusty roof and a goblin banner. */
function tower(frame: number): HTMLCanvasElement {
  const [cv, ctx] = makeCanvas(W, 176);
  const fx = 64, fy = 160, s = 40, h = 62;
  groundShadow(ctx, fx, fy, s, s, 10);
  box(ctx, fx, fy, s, s, h, STONE);
  brickWalls(ctx, fx, fy, s, s, h, 5, 7);
  leftWallRect(ctx, fx, fy, 12, 26, 4, 8, G.out); rightWallRect(ctx, fx, fy, 12, 26, 4, 8, G.out);
  rightWallRect(ctx, fx, fy, 13, 27, 2, 6, G.glow);
  // crenellated top
  for (let k = 0; k < s; k += 7) { box(ctx, fx - k, fy - h - (k >> 1), 4, 4, 5, STONE); box(ctx, fx + k + 4, fy - h - (k >> 1), 4, 4, 5, STONE); }
  // cone roof
  const cx = fx, baseY = fy - h - (s >> 1) + 2, rh = 34;
  for (let dy = 0; dy <= rh; dy++) {
    const span = Math.floor(((s + 4) * dy) / rh);
    const y = baseY - rh + dy;
    rect(ctx, cx - span - 1, y, span * 2 + 3, 1, G.out);
    rect(ctx, cx - span, y, span, 1, dy % 4 === 0 ? G.rustDark : G.rustL);
    rect(ctx, cx, y, span + 1, 1, dy % 4 === 0 ? G.rustL : G.rustR);
    if (dy % 4 === 2) px(ctx, cx + span - 1, y, G.rustLight);
  }
  // horn spikes on the cone and a banner on top
  px(ctx, cx - 10, baseY - 12, G.bone); px(ctx, cx + 11, baseY - 12, G.bone);
  banner(ctx, cx, baseY - rh, 18, frame);
  return cv;
}

// ---------- assemble ----------
function canvasT(h: number) { return makeCanvas(W, h); }
const TALL = 176, LOW = 96;
function paint(h: number, fn: (ctx: Ctx, bx: number, by: number) => void) { const [cv, ctx] = canvasT(h); fn(ctx, 64, h - 32); return cv; }

export function goblinWildArt(): GoblinWildArt {
  const props: GoblinWildArt['props'] = [];
  const add = (p: GoblinWildArt['props'][number]) => (props.push(p), props.length - 1);
  const tall = [
    add({ tall: true, sway: 2, frames: [paint(TALL, (c, x, y) => { pine(c, x - 18, y - 6, 70, 1); pine(c, x + 16, y + 2, 84, 2); })] }),
    add({ tall: true, sway: 3, frames: [paint(TALL, (c, x, y) => { pine(c, x, y, 104, 3); })] }),
    add({ tall: true, sway: 2, frames: [paint(TALL, (c, x, y) => { oak(c, x + 2, y, 20, 4); })] }),
    add({ tall: true, sway: 2, frames: [paint(TALL, (c, x, y) => { pine(c, x - 16, y - 4, 80, 5); oak(c, x + 18, y + 6, 14, 6); })] }),
    add({ tall: true, sway: 2, frames: [paint(TALL, (c, x, y) => { pine(c, x - 20, y - 8, 64, 7); pine(c, x + 4, y - 2, 90, 8); pine(c, x + 24, y + 6, 58, 9); })] }),
  ];
  const low = [
    add({ tall: false, frames: [paint(LOW, (c, x, y) => { boulder(c, x - 6, y, 13); boulder(c, x + 14, y + 6, 7); })] }),
    add({ tall: false, sway: 1, frames: [paint(LOW, (c, x, y) => { bush(c, x - 10, y + 2, 7); bush(c, x + 8, y - 2, 9); bush(c, x + 22, y + 6, 5); })] }),
    add({ tall: false, frames: [paint(LOW, (c, x, y) => { scrap(c, x, y, 5); gear(c, x - 14, y - 2, 4); })] }),
    add({ tall: false, frames: [paint(LOW, (c, x, y) => {
      rect(c, x - 18, y - 6, 28, 7, G.out); rect(c, x - 17, y - 5, 26, 5, G.woodR); rect(c, x - 17, y - 5, 26, 1, G.woodLight);
      disc(c, x + 10, y - 3, 3, G.out); disc(c, x + 10, y - 3, 2, '#c09060');
      rect(c, x + 14, y - 9, 9, 10, G.out); rect(c, x + 15, y - 8, 7, 8, G.woodR); rect(c, x + 15, y - 8, 7, 2, '#c09060');
    })] }),
    add({ tall: false, sway: 1, frames: [paint(LOW, (c, x, y) => {
      for (let i = 0; i < 9; i++) { const h = tileHash(i, 3, 3); const fx = x - 20 + (h % 40), fy = y - 6 + ((h >>> 8) % 12);
        rect(c, fx, fy - 4, 1, 4, G.leafDark); px(c, fx - 1, fy - 5, i % 3 ? '#f4e04a' : '#f08ab4'); px(c, fx, fy - 5, i % 3 ? '#fff4a0' : '#ffc0dc'); }
    })] }),
  ];
  // the ridge: one block per tile, cached by look, so equal blocks share a texture
  const ridge = new Map<string, number>();
  const blockCache = new Map<string, number>();
  for (let y = CLIFF_Y0; y <= CLIFF_Y1; y++) for (let x = RIDGE_X0; x <= RIDGE_X1; x++) {
    const look = ridgeLook(x, y);
    const key = `${look.h}|${look.top}|${look.fall}|${look.tree}`;
    let id = blockCache.get(key);
    if (id === undefined) {
      const frames = look.top === 'water' ? [0, 1, 2].map((f) => cliffBlock(look.h, look.top, look.fall, look.tree, f)) : [cliffBlock(look.h, look.top, look.fall, look.tree, 0)];
      id = add({ tall: true, frames, sway: look.tree && look.top === 'grass' ? 2 : undefined });
      blockCache.set(key, id);
    }
    ridge.set(`${x},${y}`, id);
  }
  const idx = {
    wallX: add({ tall: false, frames: [wallX(false)] }),
    wallY: add({ tall: false, frames: [wallY(false)] }),
    gateX: add({ tall: false, frames: [wallX(true)] }),
    gateY: add({ tall: false, frames: [wallY(true)] }),
    tower: add({ tall: true, frames: [0, 1, 2].map(tower) }),
  };
  const water = Array.from({ length: 16 }, (_, m) => [0, 1, 2].map((f) => waterTile(m, f)));
  return { ground: [0, 1, 2, 3].map((v) => grass(v)), water, props, idx, ridge, tall, low };
}

// ---------- layout ----------
// A rock ridge rises behind the city's far side; the river drops off it as a wide waterfall, runs toward
// the city, then turns and follows the wall to the right.
const RIVER_X0 = 8, RIVER_X1 = 10, CLIFF_Y0 = -14, CLIFF_Y1 = -11, RIDGE_X0 = -10, RIDGE_X1 = 34;
/** The ridge's front edge wanders a tile back and forth, so it reads as rock, not a ruler line. */
const frontY = (x: number) => (x >= RIVER_X0 - 1 && x <= RIVER_X1 + 1 ? CLIFF_Y1 : CLIFF_Y1 - 1 + Math.round(smooth(x * 1.3, 71) * 2));
const inRidge = (x: number, y: number) => y >= CLIFF_Y0 && y <= frontY(x) && x >= RIDGE_X0 && x <= RIDGE_X1;
const riverCol = (x: number) => x >= RIVER_X0 && x <= RIVER_X1;
const inRiver = (x: number, y: number) =>
  (riverCol(x) && y > CLIFF_Y1 && y <= -4) || (y >= -6 && y <= -4 && x >= RIVER_X0 && x < GRID + 30);
/** Water or the waterfall's foot: counts as water for the banks. */
const wetAt = (x: number, y: number) => inRiver(x, y) || (riverCol(x) && inRidge(x, y));

function smooth(x: number, salt: number) {
  const i = Math.floor(x / 4), f = (x - i * 4) / 4, e = f * f * (3 - 2 * f);
  const a = (tileHash(i, 0, salt) % 1000) / 1000, b = (tileHash(i + 1, 0, salt) % 1000) / 1000;
  return a + (b - a) * e;
}
function ridgeLook(x: number, y: number) {
  const back = frontY(x) - y; // 0 = the front row
  const ends = Math.min(x - RIDGE_X0, RIDGE_X1 - x);
  const taper = Math.min(1, (ends + 1) / 5);
  const river = riverCol(x);
  const base = river ? 72 : 78 + smooth(x, 61) * 46 + (Math.abs(x - 9) <= 3 ? 16 : 0);
  const h = Math.max(24, Math.round((base * taper + back * 18) / 8) * 8);
  const top: 'grass' | 'water' = river ? 'water' : 'grass';
  const n = tileHash(x, y, 63) % 100;
  const tree = river ? 0 : back === 0 ? (n < 18 ? 1 : 0) : n < 40 ? 1 : n < 70 ? 2 : 0;
  return { h, top, fall: river, tree };
}

const gateAt = (i: number) => i === (GRID >> 1) - 1 || i === GRID >> 1;
const towerAt = (i: number) => i % 10 === 4 && !gateAt(i);

export type Placement = { ground?: 'water'; mask?: number; prop?: number } | null;

/** Special pieces for a wild tile, or null to let ordinary scenery grow there. */
export function goblinPlace(art: GoblinWildArt, x: number, y: number, ring: number): Placement {
  // the city wall hugs the map, one tile out
  if (ring === 1) {
    const cornerX = x === -1 || x === GRID, cornerY = y === -1 || y === GRID;
    if (cornerX && cornerY) return { prop: art.idx.tower };
    // mid-wall towers only on the far sides, where they cannot hide the city
    if (cornerX) return { prop: x < 0 && towerAt(y) ? art.idx.tower : gateAt(y) ? art.idx.gateY : art.idx.wallY };
    if (cornerY) return { prop: y < 0 && towerAt(x) ? art.idx.tower : gateAt(x) ? art.idx.gateX : art.idx.wallX };
  }
  if (ring === 2) return {}; // a clear path just outside the wall
  if (inRiver(x, y)) {
    const mask = (wetAt(x - 1, y) ? 0 : 1) | (wetAt(x, y - 1) ? 0 : 2) | (wetAt(x + 1, y) ? 0 : 4) | (wetAt(x, y + 1) ? 0 : 8);
    return { ground: 'water', mask };
  }
  // the ridge behind the city, with the waterfall where the river comes down
  if (inRidge(x, y)) return { prop: art.ridge.get(`${x},${y}`)! };
  // a riverbank: no trees on the tiles right next to the water
  if (wetAt(x + 1, y) || wetAt(x - 1, y) || wetAt(x, y + 1) || wetAt(x, y - 1)) return tileHash(x, y, 5) % 3 === 0 ? { prop: art.low[0]! } : {};
  return null;
}
