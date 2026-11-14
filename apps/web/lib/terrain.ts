// Terrain polish for the game map (not the landing island): one painted layer under the city instead of
// a grid of tile plates. Soft patches of light and shade break up the ground, worn paths and plazas
// join the buildings into a town, every building casts a soft shadow, and a warm glow pools around
// the town at night-toned peoples. Pure decoration: canvases only, the renderer turns them into sprites.
import { GRID, type ArcId, type GameState } from '@metropolix/sim';
import { tileHash } from './sprites';

const TW = 64, TH = 32;
/** Canvas pixels per world pixel for the painted layers (half resolution, sampled smoothly). */
export const TERRAIN_SCALE = 0.5;
/** The painted layers cover the map's bounding box in world px: x in [-W/2, W/2], y in [0, H]. */
export const MAP_W = GRID * TW;
export const MAP_H = GRID * TH;

interface Look {
  /** Path and plaza colour, its darker rim, and two speckle colours (pebbles, cracks). */
  path: string; rim: string; light: string; dark: string;
  /** Patch colours for the ground: lit (meadow in the sun) and shaded (hollows). */
  lit: string; shade: string; patch: number;
  /** Warm light pooled around buildings (additive), and its strength; 0 for sunny peoples. */
  glow: string; glowA: number;
  /** Strength of the screen vignette. */
  vignette: number;
}

const LOOKS: Record<ArcId | 'none', Look> = {
  elf: { path: '#3f5a3f', rim: '#1e3a26', light: '#6f8a63', dark: '#2a3f2c', lit: '#4f9a66', shade: '#1f4a2c', patch: 0.32, glow: '#ffd89a', glowA: 0.12, vignette: 0.16},
  lizard: { path: '#6a5c36', rim: '#4a4020', light: '#8d7c4e', dark: '#4c4226', lit: '#8a8a48', shade: '#3a4a22', patch: 0.3, glow: '#ffcf80', glowA: 0.08, vignette: 0.14},
  caveman: { path: '#86683f', rim: '#5a4228', light: '#a88a5c', dark: '#5e4830', lit: '#a08a58', shade: '#4a3620', patch: 0.28, glow: '#ffc070', glowA: 0.06, vignette: 0.14},
  dragon: { path: '#3a2c30', rim: '#2a1a1e', light: '#5a464c', dark: '#8a2c18', lit: '#4a3446', shade: '#2a1c22', patch: 0.34, glow: '#ff8a40', glowA: 0.1, vignette: 0.2},
  goblin: { path: '#9a7e52', rim: '#5a4a30', light: '#bea070', dark: '#76603c', lit: '#b8d870', shade: '#1e3410', patch: 0.2, glow: '#ffd890', glowA: 0, vignette: 0.14},
  none: { path: '#7d6c4e', rim: '#3a3020', light: '#a08a64', dark: '#5a4a34', lit: '#5a9a5a', shade: '#0a1a0a', patch: 0.28, glow: '#ffd08a', glowA: 0.08, vignette: 0.4 },
};

export const terrainLook = (arc: ArcId | null): Look => LOOKS[arc ?? 'none'];

function canvas(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return [c, c.getContext('2d')!];
}

/** World px to painted-layer canvas px. */
const cx = (wx: number) => (wx + MAP_W / 2) * TERRAIN_SCALE;
const cy = (wy: number) => wy * TERRAIN_SCALE;
/** Centre of a tile in world px. */
const centre = (x: number, y: number) => ({ x: ((x - y) * TW) / 2, y: ((x + y) * TH) / 2 + TH / 2 });

/** Clip the context to the map diamond (so nothing paints past the edge of the map). */
function clipMap(ctx: CanvasRenderingContext2D) {
  ctx.beginPath();
  ctx.moveTo(cx(0), cy(0));
  ctx.lineTo(cx(MAP_W / 2), cy(MAP_H / 2));
  ctx.lineTo(cx(0), cy(MAP_H));
  ctx.lineTo(cx(-MAP_W / 2), cy(MAP_H / 2));
  ctx.closePath();
  ctx.clip();
}

/** A soft iso ellipse (twice as wide as tall) of radius r canvas px, solid up to `core` then fading out. */
function blob(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string, alpha: number, core = 0.55) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(1, 0.5);
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
  g.addColorStop(0, rgba(color, alpha));
  g.addColorStop(core, rgba(color, alpha));
  g.addColorStop(1, rgba(color, 0));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function rgba(hex: string, a: number) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

/**
 * Static ground patches: big soft blotches of sunlit and shaded ground (two sizes), so the map stops
 * reading as one flat colour. Drawn once per people.
 */
export function paintPatches(arc: ArcId | null): HTMLCanvasElement {
  const look = terrainLook(arc);
  const [c, ctx] = canvas(Math.ceil(MAP_W * TERRAIN_SCALE), Math.ceil(MAP_H * TERRAIN_SCALE));
  ctx.save();
  clipMap(ctx);
  const salt = (arc ?? 'none').length * 977;
  for (const [count, size, a] of [[34, 7, 1], [90, 3, 0.8]] as const) {
    for (let i = 0; i < count; i++) {
      const h = tileHash(i, size, salt);
      const tx = h % GRID, ty = (h >>> 8) % GRID;
      const p = centre(tx, ty);
      const r = (size * 0.6 + ((h >>> 16) % 100) / 100 * size) * TW * TERRAIN_SCALE * 0.5;
      const lit = (h >>> 24) & 1;
      blob(ctx, cx(p.x), cy(p.y), r, lit ? look.lit : look.shade, look.patch * a * (lit ? 0.7 : 1), 0.15);
    }
  }
  ctx.restore();
  return c;
}

/** Which tiles get a worn path: weight 1 under buildings, less on open tiles between them. */
function pathWeights(s: GameState): Float32Array {
  const w = new Float32Array(GRID * GRID);
  const at = (x: number, y: number) => x >= 0 && y >= 0 && x < GRID && y < GRID && !!s.grid[y]![x];
  for (let y = 0; y < GRID; y++) for (let x = 0; x < GRID; x++) {
    if (at(x, y)) { w[y * GRID + x] = 1; continue; }
    const n = +at(x - 1, y) + +at(x + 1, y) + +at(x, y - 1) + +at(x, y + 1);
    const opposite = (at(x - 1, y) && at(x + 1, y)) || (at(x, y - 1) && at(x, y + 1));
    if (opposite || n >= 3) w[y * GRID + x] = 0.8; // a street between two buildings
    else if (n === 2) w[y * GRID + x] = 0.55;
    else if (n === 1 && tileHash(x, y, 17) % 4 === 0) w[y * GRID + x] = 0.35; // now and then a trodden spot
  }
  return w;
}

/** A cheap fingerprint of which tiles hold a building, so the paths are only repainted on change. */
export function occupancyKey(s: GameState): string {
  let key = '';
  for (let y = 0; y < GRID; y++) {
    let bits = 0;
    const row = s.grid[y]!;
    for (let x = 0; x < GRID; x++) if (row[x]) bits |= 1 << (x & 31);
    let hi = 0;
    for (let x = 32; x < GRID; x++) if (row[x]) hi |= 1 << (x - 32);
    key += bits.toString(36) + '.' + hi.toString(36) + ',';
  }
  return key;
}

/**
 * Worn ground: plazas under the buildings and paths between them, with a darker rim and pebbles.
 * Repainted into `c` (reused) whenever buildings come or go.
 */
export function paintPaths(c: HTMLCanvasElement, s: GameState, arc: ArcId | null) {
  const look = terrainLook(arc);
  const ctx = c.getContext('2d')!;
  ctx.clearRect(0, 0, c.width, c.height);
  const w = pathWeights(s);
  const R = (TW / 2) * TERRAIN_SCALE; // half a tile's width in canvas px
  const [mask, m] = canvas(c.width, c.height);
  const paint = (grow: number, color: string, alpha: number, dy: number) => {
    m.clearRect(0, 0, mask.width, mask.height);
    for (let y = 0; y < GRID; y++) for (let x = 0; x < GRID; x++) {
      const k = w[y * GRID + x]!;
      if (!k) continue;
      const p = centre(x, y);
      const j = (tileHash(x, y, 5) % 100) / 100;
      blob(m, cx(p.x) + (j - 0.5) * 3, cy(p.y) + dy, R * (0.5 + 0.55 * k + 0.1 * j) * grow, '#ffffff', 1, 0.45);
    }
    // give the shape one flat colour, whatever the overlap
    m.globalCompositeOperation = 'source-in';
    m.fillStyle = rgba(color, alpha);
    m.fillRect(0, 0, mask.width, mask.height);
    m.globalCompositeOperation = 'source-over';
    ctx.drawImage(mask, 0, 0);
  };
  paint(1.1, look.rim, 0.4, 1.5); // rim, a touch lower so the path looks pressed into the ground
  paint(1, look.path, 1, 0);
  // pebbles and cracks, only on the path itself
  ctx.save();
  ctx.globalCompositeOperation = 'source-atop';
  for (let y = 0; y < GRID; y++) for (let x = 0; x < GRID; x++) {
    if (!w[y * GRID + x]) continue;
    const p = centre(x, y);
    for (let i = 0; i < 9; i++) {
      const h = tileHash(x * 13 + i, y * 7 + i, 99);
      const px = cx(p.x) + ((h % 100) / 100 - 0.5) * R * 1.7;
      const py = cy(p.y) + (((h >>> 8) % 100) / 100 - 0.5) * R * 0.85;
      ctx.fillStyle = (h >>> 16) & 1 ? rgba(look.light, 0.75) : rgba(look.dark, 0.6);
      ctx.fillRect(Math.round(px), Math.round(py), 1 + ((h >>> 20) & 1), 1);
    }
  }
  ctx.restore();
}

/** Canvas pixels per world pixel for the glow: very low, so the light comes out as one smooth wash. */
export const GLOW_SCALE = 1 / 16;

/** Warm light pooled around the buildings (drawn additively, into a GLOW_SCALE canvas). */
export function paintGlow(c: HTMLCanvasElement, s: GameState, arc: ArcId | null) {
  const look = terrainLook(arc);
  const ctx = c.getContext('2d')!;
  ctx.clearRect(0, 0, c.width, c.height);
  if (!look.glowA) return;
  const k = GLOW_SCALE;
  for (let y = 0; y < GRID; y++) for (let x = 0; x < GRID; x++) {
    if (!s.grid[y]![x]) continue;
    const p = centre(x, y);
    blob(ctx, (p.x + MAP_W / 2) * k, p.y * k, TW * k * 2.6, look.glow, look.glowA * 0.3, 0);
  }
}

/** A soft shadow under a building (one texture, scaled per building). */
export function shadowCanvas(): HTMLCanvasElement {
  const [c, ctx] = canvas(128, 64);
  blob(ctx, 64, 32, 64, '#000000', 0.55, 0.25);
  return c;
}

/** Screen vignette: clear in the middle, darker towards the corners. */
export function vignetteCanvas(strength: number): HTMLCanvasElement {
  const [c, ctx] = canvas(256, 256);
  const g = ctx.createRadialGradient(128, 128, 60, 128, 128, 182);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(0.55, `rgba(0,0,0,${strength * 0.35})`);
  g.addColorStop(1, `rgba(0,0,0,${strength})`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  return c;
}
