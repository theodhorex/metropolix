// The sunny valley (Theo's reference, 14 Nov: a bright day, a full forest, a cliff with a waterfall, a river and
// a walled city) for every people, each on its own bright land (Theo: every people a different backdrop, alive). The goblin valley's HD pixel pieces (grass, river, ridge, wall, towers, gates,
// tree clumps) are repainted per people by colour group, so each people keeps one layout but its own land
// (see LOOK).
import type { ArcId } from '@metropolix/sim';
import { goblinWildArt, type GoblinWildArt } from './wilds-goblin';

/** A colour change: h/sat replace hue and saturation, dh shifts the hue, s and l scale saturation and lightness. */
type Tf = { h?: number; dh?: number; sat?: number; s?: number; l?: number };
interface Look { grass: Tf; leaf: Tf; stone: Tf; water: Tf; roof: Tf }

export type ValleyArc = Exclude<ArcId, 'goblin'>;
const LOOK: Record<ValleyArc, Look> = {
  // elves: vivid emerald meadow under pink blossom trees, marble walls, a clear blue river
  elf: { grass: { dh: 18, s: 1.1, l: 1.1 }, leaf: { h: 340, sat: 0.42, l: 1.75 }, stone: { h: 45, sat: 0.12, l: 1.2 }, water: { dh: -8, s: 1.15, l: 1.1 }, roof: { h: 205, s: 0.85 } },
  // lizardfolk: a desert oasis, golden sand, bright palm greens, a turquoise river, sandstone walls
  lizard: { grass: { h: 42, sat: 0.5, l: 1.45 }, leaf: { dh: 10, s: 1.25, l: 1.3 }, stone: { h: 35, sat: 0.35, l: 1.1 }, water: { h: 178, s: 1.1, l: 1.1 }, roof: { dh: 12, s: 1.1 } },
  // cavemen: a bright snowfield, dark firs with frost, an icy river, grey-blue rock
  caveman: { grass: { h: 205, sat: 0.22, l: 2.0 }, leaf: { dh: 30, s: 0.6, l: 0.9 }, stone: { h: 215, sat: 0.1, l: 1.05 }, water: { h: 195, s: 0.7, l: 1.25 }, roof: { h: 25, s: 0.6, l: 0.85 } },
  // dragons: red ochre badlands, autumn-gold trees, basalt walls and a river of lava
  dragon: { grass: { h: 14, sat: 0.42, l: 1.12 }, leaf: { h: 28, sat: 0.85, l: 1.15 }, stone: { h: 260, sat: 0.08, l: 0.7 }, water: { h: 20, sat: 1, l: 1.25 }, roof: { dh: -10, s: 1.15 } },
};

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2;
  if (mx === mn) return [0, 0, l];
  const d = mx - mn, s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
  const h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h * 60, s, l];
}
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h = ((h % 360) + 360) % 360 / 360;
  if (s === 0) return [l * 255, l * 255, l * 255];
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
  const f = (t: number) => {
    t = (t + 1) % 1;
    return 255 * (t < 1 / 6 ? p + (q - p) * 6 * t : t < 1 / 2 ? q : t < 2 / 3 ? p + (q - p) * (2 / 3 - t) * 6 : p);
  };
  return [f(h + 1 / 3), f(h), f(h - 1 / 3)];
}
const clamp = (v: number) => Math.max(0, Math.min(1, v));
function apply(t: Tf, h: number, s: number, l: number): [number, number, number] {
  return hslToRgb(t.h ?? h + (t.dh ?? 0), clamp(t.sat ?? s * (t.s ?? 1)), clamp(l * (t.l ?? 1)));
}

/** Repaint a canvas: greens (as grass or as foliage), greys (stone), blues (water) and bright red-orange (roofs). */
function recolor(src: HTMLCanvasElement, look: Look, green: 'grass' | 'leaf' = 'grass'): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = src.width; c.height = src.height;
  if (!c.width || !c.height) return c;
  const ctx = c.getContext('2d', { willReadFrequently: true })!;
  ctx.drawImage(src, 0, 0);
  const img = ctx.getImageData(0, 0, c.width, c.height), d = img.data;
  const memo = new Map<number, number>();
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] === 0) continue;
    const key = (d[i]! << 16) | (d[i + 1]! << 8) | d[i + 2]!;
    let out = memo.get(key);
    if (out === undefined) {
      const [h, s, l] = rgbToHsl(d[i]!, d[i + 1]!, d[i + 2]!);
      let t: Tf | null = null;
      if (l < 0.11) t = null; // ink outlines and deep shadow stay
      else if (s < 0.2) t = look.stone;
      else if (h >= 70 && h < 170) t = look[green];
      else if (h >= 170 && h < 250) t = look.water;
      else if ((h < 45 || h >= 330) && s > 0.5 && l > 0.3) t = look.roof;
      if (!t) out = key;
      else { const [r, g, b] = apply(t, h, s, l); out = (Math.round(r) << 16) | (Math.round(g) << 8) | Math.round(b); }
      memo.set(key, out);
    }
    d[i] = out >> 16; d[i + 1] = (out >> 8) & 255; d[i + 2] = out & 255;
  }
  ctx.putImageData(img, 0, 0);
  return c;
}

const cache = new Map<ValleyArc, { art: GoblinWildArt; backdrop: number }>();

/** The goblin valley's pieces repainted for a people (built once per people). */
export function valleyArt(arc: ValleyArc): { art: GoblinWildArt; backdrop: number } {
  const hit = cache.get(arc);
  if (hit) return hit;
  const look = LOOK[arc], base = goblinWildArt();
  const art: GoblinWildArt = {
    ...base,
    ground: base.ground.map((g) => recolor(g, look)),
    water: base.water.map((fs) => fs.map((f) => recolor(f, look))),
    // the tree clumps and bushes take the foliage colour; ridge, wall and towers keep the grass colour
    props: base.props.map((p, i) => {
      const leaf = base.tall.includes(i) || base.low.includes(i);
      return { ...p, frames: p.frames.map((f) => recolor(f, look, leaf ? 'leaf' : 'grass')) };
    }),
  };
  // the backdrop past the last ring: the grass, a little faded, like the goblin valley's
  const [r, g, b] = apply(look.grass, ...rgbToHsl(0x5d, 0x9b, 0x3a));
  const backdrop = (Math.round(r * 0.8) << 16) | (Math.round(g * 0.8) << 8) | Math.round(b * 0.8);
  const out = { art, backdrop };
  cache.set(arc, out);
  return out;
}
