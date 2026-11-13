// The wilds: scenery that rings the buildable map in the game, themed per people.
// Elves live in a deep forest, Lizardfolk in a swamp, Cavemen on a boulder steppe, Dragonkin on
// volcanic rock (no forest at all, as the lore says) and Goblins in scrap badlands.
// Pure decoration: nothing here can be clicked or built on, and none of it touches the simulation.
import type { ArcId } from '@metropolix/sim';
import { goblinPlace, goblinWildArt, type Placement } from './wilds-goblin';
import { disc, isoDiamond, makeCanvas, OUT, px, rect, tileHash } from './sprites';
import { paintedWild } from './painted';

/** Prop canvases are 64 px wide; the ground diamond's centre sits at (32, H - 16). */
export const PROP_W = 64;

/** One tile of scenery: animation frames, whether it is tall, and where its water (if any) sits. */
export interface WildProp { frames: HTMLCanvasElement[]; tall: boolean; water?: 'pool' | 'lava' | 'toxic'; glow?: number }
export interface WildTheme {
  /** Colour far beyond the wilds: the ground colour at the darkest shade, so the edge melts away. */
  backdrop: number;
  /** Seamless ground (no tile outlines), four variants. */
  ground: HTMLCanvasElement[];
  props: WildProp[];
  /** HD themes: animated water ground (river) and hand-placed pieces (walls, cliffs, waterfall). */
  water?: HTMLCanvasElement[][];
  place?: (x: number, y: number, ring: number) => Placement;
  /** Which props ordinary scattering may use (default: all). */
  scatter?: { tall: number[]; low: number[] };
  /** A sunlit theme: the wilds stay bright and melt into clouds instead of darkness. */
  day?: boolean;
}

type Ctx = CanvasRenderingContext2D;
const canvas = (h: number) => makeCanvas(PROP_W, h);

// ---------- small painters ----------
function shadow(ctx: Ctx, cx: number, cy: number, r: number, color = 'rgba(0,0,0,0.28)') {
  isoDiamond(ctx, cx, cy, r, color);
}

function pine(ctx: Ctx, bx: number, by: number, h: number, c: { trunk: string; dark: string; mid: string; light: string }) {
  shadow(ctx, bx, by, Math.max(6, (h / 3) | 0));
  rect(ctx, bx - 2, by - 6, 4, 7, OUT);
  rect(ctx, bx - 1, by - 6, 2, 6, c.trunk);
  const tiers = 3, tierH = Math.floor((h - 4) / tiers);
  for (let t = 0; t < tiers; t++) {
    const top = by - 4 - h + t * tierH + 2;
    const half = 4 + Math.floor(((t + 1) * h) / 9);
    for (let dy = 0; dy <= tierH + 3; dy++) {
      const span = Math.max(1, Math.floor((half * dy) / (tierH + 3)));
      const y = top + dy;
      rect(ctx, bx - span - 1, y, span * 2 + 2, 1, OUT);
      rect(ctx, bx - span, y, span, 1, dy < 3 ? c.light : c.mid);
      rect(ctx, bx, y, span, 1, c.dark);
    }
  }
  px(ctx, bx, by - 4 - h + 1, c.light);
}

function broadTree(ctx: Ctx, bx: number, by: number, r: number, c: { trunk: string; dark: string; mid: string; light: string; accent?: string }, salt: number) {
  shadow(ctx, bx, by, r + 2);
  const trunkH = r + 2;
  rect(ctx, bx - 2, by - trunkH, 4, trunkH + 1, OUT);
  rect(ctx, bx - 1, by - trunkH, 1, trunkH, c.trunk);
  rect(ctx, bx, by - trunkH, 1, trunkH, c.dark);
  const cy = by - trunkH - r + 2;
  disc(ctx, bx, cy, r + 1, OUT);
  disc(ctx, bx, cy, r, c.mid);
  disc(ctx, bx + 2, cy + 2, r - 3, c.dark);
  disc(ctx, bx - 2, cy - 2, Math.max(2, r - 4), c.light);
  if (c.accent) for (let i = 0; i < 4; i++) {
    const h = tileHash(i, salt, 7);
    px(ctx, bx - r + 2 + (h % (r * 2 - 3)), cy - r + 2 + ((h >>> 8) % (r * 2 - 3)), c.accent);
  }
}

function bush(ctx: Ctx, bx: number, by: number, r: number, dark: string, mid: string, light: string) {
  shadow(ctx, bx, by + 1, r + 1);
  disc(ctx, bx, by - r + 1, r + 1, OUT);
  disc(ctx, bx, by - r + 1, r, mid);
  disc(ctx, bx + 1, by - r + 2, r - 2, dark);
  disc(ctx, bx - 1, by - r, Math.max(1, r - 3), light);
}

function boulder(ctx: Ctx, bx: number, by: number, w: number, c: { dark: string; mid: string; light: string }) {
  shadow(ctx, bx, by + 1, w + 2);
  const h = Math.max(3, Math.floor(w * 0.8));
  for (let dy = 0; dy < h; dy++) {
    const span = Math.round(w * Math.sqrt(1 - ((h - dy) / (h + 1)) ** 2));
    const y = by - h + dy;
    rect(ctx, bx - span - 1, y, span * 2 + 2, 1, OUT);
    rect(ctx, bx - span, y, span * 2, 1, dy < h / 3 ? c.light : c.mid);
    rect(ctx, bx + Math.floor(span / 3), y, span - Math.floor(span / 3), 1, c.dark);
  }
  rect(ctx, bx - w - 1, by, w * 2 + 2, 1, OUT);
}

function deadTree(ctx: Ctx, bx: number, by: number, h: number, wood: string, dark: string, salt: number) {
  shadow(ctx, bx, by, 6);
  rect(ctx, bx - 2, by - h, 4, h + 1, OUT);
  rect(ctx, bx - 1, by - h, 1, h, wood);
  rect(ctx, bx, by - h, 1, h, dark);
  const arms = 3 + (salt % 2);
  for (let i = 0; i < arms; i++) {
    const y = by - h + 3 + i * Math.floor((h - 6) / arms);
    const dir = (i + salt) % 2 ? 1 : -1, len = 4 + ((salt >>> (i * 3)) % 4);
    for (let k = 1; k <= len; k++) {
      px(ctx, bx + dir * k, y - Math.floor(k / 2) - 1, OUT);
      px(ctx, bx + dir * k, y - Math.floor(k / 2), k % 2 ? wood : dark);
    }
  }
}

function mushroom(ctx: Ctx, bx: number, by: number, r: number, cap: string, capDark: string, spot: string) {
  shadow(ctx, bx, by + 1, r);
  const stemH = r + 1;
  rect(ctx, bx - 2, by - stemH, 4, stemH + 1, OUT);
  rect(ctx, bx - 1, by - stemH, 2, stemH, '#e8dcc4');
  const cy = by - stemH;
  for (let dy = -r; dy <= 0; dy++) {
    const span = Math.round(Math.sqrt(r * r - dy * dy)) + 1;
    rect(ctx, bx - span - 1, cy + dy, span * 2 + 2, 1, OUT);
    rect(ctx, bx - span, cy + dy, span * 2, 1, dy > -2 ? capDark : cap);
  }
  px(ctx, bx - 2, cy - r + 2, spot); px(ctx, bx + 2, cy - 2, spot); px(ctx, bx - r + 1, cy - 1, spot);
}

function pool(ctx: Ctx, cx: number, cy: number, rx: number, rim: string, water: string, sheen: string, f = 0) {
  isoDiamond(ctx, cx, cy, rx + 2, rim);
  isoDiamond(ctx, cx, cy, rx, water);
  // ripples drift across the surface, one pixel a frame
  const o = f - 1;
  rect(ctx, cx - (rx >> 1) + o, cy - 2, rx >> 1, 1, sheen);
  rect(ctx, cx + 2 - o, cy + 1, rx >> 2, 1, sheen);
  if (f % 2) px(ctx, cx - 2 + o * 2, cy + 3, sheen);
}

function reeds(ctx: Ctx, bx: number, by: number, stem: string, head: string, salt: number) {
  for (let i = 0; i < 5; i++) {
    const x = bx - 5 + i * 2 + ((salt >>> i) & 1), h = 7 + ((salt >>> (i * 2)) % 6);
    rect(ctx, x, by - h, 1, h, stem);
    if (i % 2 === 0) { rect(ctx, x - 1, by - h - 1, 3, 3, OUT); rect(ctx, x, by - h, 1, 2, head); }
  }
}

function spire(ctx: Ctx, bx: number, by: number, h: number, w: number, dark: string, mid: string, light: string) {
  shadow(ctx, bx, by + 1, w + 3);
  for (let dy = 0; dy <= h; dy++) {
    const span = Math.max(0, Math.floor((w * dy) / h));
    const y = by - h + dy;
    rect(ctx, bx - span - 1, y, span * 2 + 3, 1, OUT);
    rect(ctx, bx - span, y, span + 1, 1, mid);
    rect(ctx, bx + 1, y, span, 1, dark);
    if (span > 1) px(ctx, bx - span + 1, y, light);
  }
}

function lavaPool(ctx: Ctx, cx: number, cy: number, rx: number, f = 0) {
  // the molten core breathes: it swells and shrinks while bubbles rise and pop
  const pulse = [0, 1, 2, 1][f % 4]!;
  isoDiamond(ctx, cx, cy, rx + 3, '#2a1612');
  isoDiamond(ctx, cx, cy, rx + 1, '#8a2a12');
  isoDiamond(ctx, cx, cy, rx - 1, '#ff6a1a');
  isoDiamond(ctx, cx, cy, Math.max(2, rx - 6 + pulse), '#ffc24a');
  if (pulse === 2) isoDiamond(ctx, cx, cy, 2, '#fff2b0');
  const bub = [[-5, 0], [4, 1], [-1, -2], [6, -1]] as const;
  const [bx, by] = bub[f % 4]!;
  rect(ctx, cx + bx - 1, cy + by - 1, 3, 2, '#ffe08a'); px(ctx, cx + bx, cy + by - 2, '#fff8d8');
  for (const [gx, gy] of [[-rx, 0], [rx - 2, 1]] as const) px(ctx, cx + gx + 1, cy + gy, '#c8401a');
}

function scrapHeap(ctx: Ctx, bx: number, by: number, salt: number) {
  shadow(ctx, bx, by + 1, 13);
  const metals = ['#7a7a82', '#5c5c66', '#a0582a', '#8a6a3a', '#4a4a52', '#b8b8c0'];
  for (let i = 0; i < 9; i++) {
    const h = tileHash(i, salt, 3);
    const w = 3 + (h % 6), hh = 2 + ((h >>> 4) % 4);
    const x = bx - 10 + ((h >>> 8) % 18), y = by - 3 - Math.floor((i * 10) / 9) - ((h >>> 12) % 3);
    rect(ctx, x - 1, y - 1, w + 2, hh + 2, OUT);
    rect(ctx, x, y, w, hh, metals[(h >>> 16) % metals.length]!);
    px(ctx, x, y, '#d8d8e0');
  }
  // a cog wheel poking out of the top
  disc(ctx, bx + 2, by - 15, 4, OUT); disc(ctx, bx + 2, by - 15, 3, '#9a9aa2'); px(ctx, bx + 2, by - 15, OUT);
}

function barrel(ctx: Ctx, bx: number, by: number, wood: string, band: string, ooze?: string) {
  shadow(ctx, bx, by + 1, 5);
  rect(ctx, bx - 4, by - 10, 8, 11, OUT);
  rect(ctx, bx - 3, by - 9, 6, 9, wood);
  rect(ctx, bx + 1, by - 9, 2, 9, band);
  rect(ctx, bx - 3, by - 7, 6, 1, band); rect(ctx, bx - 3, by - 3, 6, 1, band);
  if (ooze) { rect(ctx, bx - 3, by - 10, 6, 1, ooze); px(ctx, bx - 2, by - 8, ooze); }
}

function bones(ctx: Ctx, bx: number, by: number) {
  shadow(ctx, bx, by + 1, 10);
  // a great curved tusk
  for (let k = 0; k < 14; k++) {
    const x = bx - 8 + k, y = by - 2 - Math.round(Math.sin((k / 13) * Math.PI) * 9);
    rect(ctx, x, y - 1, 1, 4, OUT);
    rect(ctx, x, y, 1, 2, k > 10 ? '#c8bca4' : '#efe6d2');
  }
  rect(ctx, bx - 4, by - 2, 7, 2, OUT); rect(ctx, bx - 3, by - 2, 5, 1, '#e8dcc4');
}

function tufts(ctx: Ctx, bx: number, by: number, a: string, b: string, salt: number) {
  for (let i = 0; i < 4; i++) {
    const h = tileHash(i, salt, 11);
    const x = bx - 9 + (h % 18), y = by - 2 + ((h >>> 5) % 5);
    px(ctx, x, y - 2, a); px(ctx, x - 1, y - 1, b); px(ctx, x + 1, y - 1, a); px(ctx, x, y - 1, b);
  }
}

// ---------- props per people ----------
type Paint = (ctx: Ctx, bx: number, by: number, salt: number, f: number) => void;
/**
 * Each recipe paints one tile's worth of scenery; a tall recipe gets a taller canvas.
 * `sway` bends the top of the drawing in the wind (pixels at the very top); `live` means the painter
 * itself draws each frame differently (water sheen, lava bubbles).
 */
interface Recipe { tall: boolean; paint: Paint; sway?: number; live?: boolean; water?: WildProp['water']; glow?: number }
export const WILD_FRAMES = 4;

const TALL_H = 104, LOW_H = 64;

/**
 * Wind: copy the drawing row by row, sliding each row sideways in proportion to its height above
 * the ground. Whole pixels only, so the trunk stays put and the crown bends, still crisp pixel art.
 */
function bend(src: HTMLCanvasElement, sway: number): HTMLCanvasElement {
  const W = src.width;
  const [cv, ctx] = makeCanvas(W, src.height);
  const root = src.height - (W > PROP_W ? 40 : 20);
  for (let y = 0; y < src.height; y++) {
    const dx = y >= root ? 0 : Math.round((sway * (root - y)) / root);
    ctx.drawImage(src, 0, y, W, 1, dx, y, W, 1);
  }
  return cv;
}

const SWAY_STEPS = [0, 1, 0, -1];

function bakeAll(recipes: Recipe[], copies = 2): WildProp[] {
  const out: WildProp[] = [];
  for (let i = 0; i < recipes.length; i++) for (let c = 0; c < copies; c++) {
    const r = recipes[i]!;
    const h = r.tall ? TALL_H : LOW_H;
    const salt = tileHash(i, c, 97);
    const paintFrame = (f: number) => { const [cv, ctx] = canvas(h); r.paint(ctx, 32, h - 16, salt, f); return cv; };
    let frames: HTMLCanvasElement[];
    if (r.live) frames = Array.from({ length: WILD_FRAMES }, (_, f) => paintFrame(f));
    else if (r.sway) { const base = paintFrame(0); frames = SWAY_STEPS.map((k) => (k === 0 ? base : bend(base, k * r.sway!))); }
    else frames = [paintFrame(0)];
    out.push({ frames, tall: r.tall, water: r.water, glow: r.glow });
  }
  return out;
}

const ELF_PINE = { trunk: '#5a3a24', dark: '#123d2c', mid: '#1e5c3f', light: '#3f8f5e' };
const ELF_OAK = { trunk: '#6a4630', dark: '#174a33', mid: '#246a45', light: '#4caa6a', accent: '#bfe6ff' };
const elf: Recipe[] = [
  { tall: true, sway: 2, paint: (c, x, y) => { pine(c, x - 9, y - 4, 40, ELF_PINE); pine(c, x + 8, y + 2, 48, ELF_PINE); } },
  { tall: true, sway: 2, paint: (c, x, y, s) => { broadTree(c, x + 2, y, 12, ELF_OAK, s); bush(c, x - 12, y + 4, 5, '#123d2c', '#1e5c3f', '#3f8f5e'); } },
  { tall: true, sway: 3, paint: (c, x, y, s) => { pine(c, x + 6, y - 2, 54, ELF_PINE); broadTree(c, x - 8, y + 4, 9, ELF_OAK, s); } },
  { tall: false, live: true, glow: 0x5fe0d0, paint: (c, x, y, _s, f) => {
    // glowing mushrooms: the caps pulse softly in turn
    const glow = ['#4fc8b8', '#6fe0d0', '#9ff2e6', '#6fe0d0'];
    mushroom(c, x - 6, y + 2, 5, glow[f % 4]!, '#2f8a80', '#e6fffb'); mushroom(c, x + 7, y, 3, glow[(f + 2) % 4]!, '#3fa898', '#ffffff');
  } },
  { tall: false, sway: 1, paint: (c, x, y) => { bush(c, x - 4, y + 2, 6, '#123d2c', '#246a45', '#4caa6a'); bush(c, x + 8, y - 1, 4, '#123d2c', '#1e5c3f', '#3f8f5e'); px(c, x - 5, y - 6, '#bfe6ff'); px(c, x + 8, y - 5, '#bfe6ff'); } },
];

const MANGROVE = { trunk: '#5a4a2a', dark: '#3a4a1e', mid: '#56702e', light: '#7f9a40', accent: '#c6d84f' };
const lizard: Recipe[] = [
  { tall: true, sway: 2, paint: (c, x, y, s) => {
    for (const dx of [-6, -3, 3, 6]) { rect(c, x + dx - 1, y - 6, 2, 7, OUT); rect(c, x + dx, y - 6, 1, 6, '#5a4a2a'); }
    broadTree(c, x, y - 6, 13, MANGROVE, s);
    for (let i = 0; i < 4; i++) rect(c, x - 9 + i * 6, y - 22, 1, 6 + (i % 2) * 4, '#4a6a2a');
  } },
  { tall: true, live: true, water: 'pool', paint: (c, x, y, s, f) => { pool(c, x, y, 18, '#3d3122', '#2f4a40', '#6f9a86', f); broadTree(c, x + 6, y - 2, 10, MANGROVE, s); } },
  { tall: false, live: true, water: 'pool', paint: (c, x, y, _s, f) => { pool(c, x, y, 22, '#3d3122', '#2f4a40', '#6f9a86', f); disc(c, x - 6, y - 1, 2, '#5f8a3a'); disc(c, x + 7, y + 2, 2, '#6f9a40'); px(c, x - 6, y - 2, f % 2 ? '#ffc0d4' : '#f59ab5'); } },
  { tall: false, sway: 2, paint: (c, x, y, s) => { reeds(c, x - 6, y + 2, '#7a8a3a', '#6b4a2a', s); reeds(c, x + 7, y, '#8a9a4a', '#5a3a22', s >>> 3); } },
  { tall: false, paint: (c, x, y) => {
    shadow(c, x, y + 1, 12);
    rect(c, x - 12, y - 5, 24, 6, OUT); rect(c, x - 11, y - 4, 22, 4, '#6a5232'); rect(c, x - 11, y - 4, 22, 1, '#8a6a42');
    rect(c, x - 11, y - 1, 22, 1, '#4a6a2a'); disc(c, x + 10, y - 3, 3, OUT); disc(c, x + 10, y - 3, 2, '#a88a5a');
  } },
];

const CONIFER = { trunk: '#5a4632', dark: '#2a3e2a', mid: '#3b5a3a', light: '#5a7a4a' };
const STONE = { dark: '#5a524a', mid: '#8a7f72', light: '#b0a698' };
const caveman: Recipe[] = [
  { tall: true, sway: 2, paint: (c, x, y) => { pine(c, x + 4, y, 44, CONIFER); boulder(c, x - 10, y + 4, 6, STONE); } },
  { tall: true, paint: (c, x, y) => { boulder(c, x, y, 14, STONE); boulder(c, x + 10, y + 4, 7, STONE); boulder(c, x - 7, y - 8, 7, STONE); } },
  { tall: true, sway: 2, paint: (c, x, y) => { pine(c, x - 7, y - 2, 36, CONIFER); pine(c, x + 8, y + 3, 30, CONIFER); } },
  { tall: false, paint: (c, x, y) => { bones(c, x, y); } },
  { tall: false, sway: 1, paint: (c, x, y, s) => { boulder(c, x + 5, y + 1, 6, STONE); tufts(c, x - 4, y, '#b8a46a', '#8a7a4a', s); } },
];

const OBSIDIAN = ['#1e1824', '#3a2e44', '#7a6a94'] as const;
const dragon: Recipe[] = [
  { tall: true, paint: (c, x, y) => { spire(c, x - 4, y + 1, 46, 8, ...OBSIDIAN); spire(c, x + 9, y + 4, 28, 6, ...OBSIDIAN); } },
  { tall: true, paint: (c, x, y, s) => { deadTree(c, x - 6, y + 2, 30, '#3a2a2a', '#1e1418', s); spire(c, x + 8, y + 4, 22, 5, ...OBSIDIAN); } },
  { tall: true, paint: (c, x, y) => {
    // basalt columns
    for (const [dx, h] of [[-9, 22], [-3, 32], [3, 26], [9, 18]] as const) {
      rect(c, x + dx - 3, y - h, 7, h + 1, OUT); rect(c, x + dx - 2, y - h + 1, 3, h - 1, '#3a3440'); rect(c, x + dx + 1, y - h + 1, 2, h - 1, '#26222c'); rect(c, x + dx - 2, y - h + 1, 5, 1, '#5a5262');
    }
  } },
  { tall: false, live: true, water: 'lava', glow: 0xff6a1a, paint: (c, x, y, _s, f) => { lavaPool(c, x, y, 14, f); } },
  { tall: false, paint: (c, x, y, s) => {
    boulder(c, x - 5, y + 2, 7, { dark: '#1e1a22', mid: '#3a3440', light: '#5a5262' });
    for (let i = 0; i < 3; i++) { const h = tileHash(i, s, 5); px(c, x + 3 + (h % 8), y - 1 + ((h >>> 4) % 4), '#ff7a2a'); }
    rect(c, x + 6, y - 14, 2, 2, 'rgba(180,170,190,0.55)'); rect(c, x + 5, y - 19, 3, 2, 'rgba(180,170,190,0.4)');
  } },
];

const goblin: Recipe[] = [
  { tall: true, paint: (c, x, y, s) => { deadTree(c, x - 4, y + 1, 34, '#5a4632', '#3a2a1e', s); barrel(c, x + 10, y + 4, '#6a4a2a', '#3a3a3a'); } },
  { tall: true, sway: 1, paint: (c, x, y) => { mushroom(c, x + 3, y, 11, '#b0402a', '#7a2a1a', '#f2e6c8'); mushroom(c, x - 11, y + 4, 5, '#9ccc3a', '#6a9a2a', '#e6ffb0'); } },
  { tall: true, paint: (c, x, y, s) => { scrapHeap(c, x, y, s); } },
  { tall: false, live: true, water: 'toxic', glow: 0x8acc2a, paint: (c, x, y, _s, f) => { pool(c, x, y, 14, '#3a3020', '#5a9a2a', '#bff26a', f); barrel(c, x + 12, y - 2, '#4a5a3a', '#2a2a2a', f % 2 ? '#bff26a' : '#9ccc3a'); } },
  { tall: false, paint: (c, x, y, s) => { boulder(c, x - 4, y + 2, 7, { dark: '#3a3628', mid: '#5a5440', light: '#7a7258' }); tufts(c, x + 4, y, '#7a8a3a', '#4a5a24', s); } },
];

const generic: Recipe[] = [
  { tall: true, sway: 2, paint: (c, x, y) => { pine(c, x - 6, y - 2, 42, { trunk: '#5d4037', dark: '#1e4a26', mid: '#2e6e36', light: '#4caf50' }); pine(c, x + 9, y + 3, 32, { trunk: '#5d4037', dark: '#1e4a26', mid: '#2e6e36', light: '#4caf50' }); } },
  { tall: true, sway: 2, paint: (c, x, y, s) => { broadTree(c, x, y, 12, { trunk: '#5d4037', dark: '#1e5c24', mid: '#2e7d32', light: '#66bb6a' }, s); } },
  { tall: false, paint: (c, x, y) => { bush(c, x - 3, y + 2, 6, '#1e5c24', '#2e7d32', '#66bb6a'); boulder(c, x + 9, y, 4, STONE); } },
];

/** Ground colours per people: [base, dark, light, accent], close to each people's own city ground. */
const THEMES: Record<ArcId | 'none', { recipes: Recipe[]; ground: [string, string, string, string] }> = {
  elf: { recipes: elf, ground: ['#1c4733', '#163b2a', '#26603f', '#3f8a5a'] },
  lizard: { recipes: lizard, ground: ['#4e4a2c', '#3f3b22', '#625a34', '#3d5a40'] },
  caveman: { recipes: caveman, ground: ['#5c4832', '#4c3b29', '#76603f', '#8a7a52'] },
  dragon: { recipes: dragon, ground: ['#1d1820', '#141117', '#2b2430', '#5a2018'] },
  goblin: { recipes: goblin, ground: ['#2c3b20', '#222e19', '#3a4a28', '#5a5a2a'] },
  none: { recipes: generic, ground: ['#2f5838', '#284c30', '#3a6a44', '#4f8a5a'] },
};

/** How dark the outermost rings get, and so the backdrop colour (base ground at this shade). */
export const WILD_FLOOR = 0.16;
const hex = (c: string) => parseInt(c.slice(1), 16);
const mulColor = (c: number, k: number) => (Math.round(((c >> 16) & 255) * k) << 16) | (Math.round(((c >> 8) & 255) * k) << 8) | Math.round((c & 255) * k);

/** A wild ground tile: the same diamond as the city's, a pixel wider so neighbours meet with no seam or outline. */
function groundTile(pal: [string, string, string, string], variant: number): HTMLCanvasElement {
  const [cv, ctx] = makeCanvas(PROP_W + 2, 34);
  isoDiamond(ctx, 33, 17, 34, pal[0]);
  for (let u = 1; u < 33; u++) for (let v = 1; v < 33; v++) {
    const h = tileHash(u, v, variant * 31 + 5) % 23;
    const sx = 33 + (u - v), sy = 1 + ((u + v) >> 1);
    if (h < 2) rect(ctx, sx - 1, sy, 2, 1, pal[1]);
    else if (h < 4) rect(ctx, sx - 1, sy, 2, 1, pal[2]);
    else if (h === 4 && variant % 2) px(ctx, sx, sy, pal[3]);
  }
  return cv;
}

/** Draw the scenery for one people. Canvases only; the renderer turns them into textures. */
export function wildTheme(arc: ArcId | null): WildTheme {
  if (arc === 'goblin') return goblinTheme();
  const t = THEMES[arc ?? 'none'];
  const props = bakeAll(t.recipes);
  if (arc) {
    for (let p = 0; p < props.length; p++) {
      const i = Math.floor(p / 2);
      const v = p % 2;
      const rendered = paintedWild(arc, i, v);
      if (rendered && rendered.length > 0) {
        props[p]!.frames = rendered;
      }
    }
  }
  return {
    backdrop: mulColor(hex(t.ground[0]), WILD_FLOOR),
    ground: [0, 1, 2, 3].map((v) => groundTile(t.ground, v)),
    props,
  };
}

/** How far (in tiles) the wilds reach past each edge of the map. */
export const WILD_RINGS = 18;

/**
 * Which prop (index into `props`, or -1 for bare ground) stands on a wild tile, `ring` tiles past the
 * map edge. The first rings stay open like a clearing, and nothing tall stands right in front of the
 * map, where it would hide the city.
 */
export function pickProp(theme: WildTheme, x: number, y: number, ring: number, front: boolean): number {
  const h = tileHash(x, y, 313);
  const roll = h % 100;
  const tallIdx = theme.scatter?.tall ?? theme.props.map((p, i) => (p.tall ? i : -1)).filter((i) => i >= 0);
  const lowIdx = theme.scatter?.low ?? theme.props.map((p, i) => (p.tall ? -1 : i)).filter((i) => i >= 0);
  const pick = (list: number[]) => list[(h >>> 8) % list.length]!;
  if (ring <= 1) return roll < 12 && lowIdx.length ? pick(lowIdx) : -1;
  const tallOk = front ? ring >= 4 : ring >= 2;
  // the forest thickens quickly past the clearing; a few tiles stay open as glades
  const tallPct = !tallOk ? 0 : ring < 4 ? 30 : ring < 6 ? 62 : 80;
  const lowPct = ring < 4 ? 26 : 14;
  if (roll < tallPct && tallIdx.length) return pick(tallIdx);
  if (roll < tallPct + lowPct && lowIdx.length) return pick(lowIdx);
  return -1;
}

/** Brightness per ring: full near the city, easing down to WILD_FLOOR at the last ring, the backdrop's shade. */
export function ringShade(ring: number, day = false): number {
  if (day) { const u = Math.min(1, Math.max(0, (ring - 6) / (WILD_RINGS - 7))); return 1 - 0.22 * u * u * (3 - 2 * u); }
  const u = Math.min(1, Math.max(0, (ring - 2) / (WILD_RINGS - 3)));
  const e = u * u * (3 - 2 * u); // smoothstep: no visible band where the fade starts or ends
  return 1 - (1 - WILD_FLOOR) * e;
}

/** The Goblin valley in HD: sunny meadow, forest, river and waterfall, a city wall with towers. */
function goblinTheme(): WildTheme {
  const a = goblinWildArt();
  const props: WildProp[] = a.props.map((p) => ({
    frames: p.sway && p.frames.length === 1 ? SWAY_STEPS.map((k) => (k === 0 ? p.frames[0]! : bend(p.frames[0]!, k * p.sway!))) : p.frames,
    tall: p.tall, water: p.water, glow: p.glow,
  }));
  // the first ten props (5 tall, 5 low) each have a Blender piece, one copy: wild_<prop>_0
  for (let p = 0; p < 10; p++) {
    const rendered = paintedWild('goblin', p, 0);
    if (rendered && props[p]) props[p]!.frames = rendered;
  }
  return {
    backdrop: 0x4f7d34, ground: a.ground, water: a.water, props, day: true,
    place: (x, y, ring) => goblinPlace(a, x, y, ring),
    scatter: { tall: a.tall, low: a.low },
  };
}
