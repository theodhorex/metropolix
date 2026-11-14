// Regional rivers, lakes and landmarks for every people's wilds.
import { GRID, type ArcId } from '@metropolix/sim';
import { isoDiamond, makeCanvas, tileHash } from './sprites';
import type { Placement } from './wilds-goblin';

type Color = readonly [number, number, number];
const rgb = (c: string): Color => [
  parseInt(c.slice(1, 3), 16),
  parseInt(c.slice(3, 5), 16),
  parseInt(c.slice(5, 7), 16),
];

type Buf = { d: Uint8ClampedArray; w: number; h: number };
function put(b: Buf, x: number, y: number, c: Color) {
  if (x < 0 || y < 0 || x >= b.w || y >= b.h) return;
  const i = (y * b.w + x) * 4;
  b.d[i] = c[0]; b.d[i + 1] = c[1]; b.d[i + 2] = c[2]; b.d[i + 3] = 255;
}

const WATER_PALETTES: Record<string, {
  sand: Color; sandDark: Color; wet: Color;
  foam: Color; foam2: Color;
  shallow: Color; mid: Color; deep: Color;
  lip: Color;
}> = {
  elf: {
    sandDark: rgb('#1a3224'), sand: rgb('#264432'), wet: rgb('#14261c'),
    foam: rgb('#ffffff'), foam2: rgb('#d4f0ff'),
    lip: rgb('#a4d8f8'), shallow: rgb('#64a8d4'), mid: rgb('#3c7ea8'), deep: rgb('#225880'),
  },
  lizard: {
    sandDark: rgb('#342c1c'), sand: rgb('#4a3e26'), wet: rgb('#241e12'),
    foam: rgb('#6e8c46'), foam2: rgb('#547034'),
    lip: rgb('#426038'), shallow: rgb('#325032'), mid: rgb('#223c24'), deep: rgb('#162a18'),
  },
  caveman: {
    sandDark: rgb('#4c3a26'), sand: rgb('#685238'), wet: rgb('#382a1a'),
    foam: rgb('#ffffff'), foam2: rgb('#d4ecfc'),
    lip: rgb('#9ed4f4'), shallow: rgb('#5aaee0'), mid: rgb('#3488be'), deep: rgb('#1e6696'),
  },
  dragon: {
    sandDark: rgb('#20141a'), sand: rgb('#341814'), wet: rgb('#1a0d12'),
    foam: rgb('#ff9624'), foam2: rgb('#d63c12'),
    lip: rgb('#b2280e'), shallow: rgb('#f05814'), mid: rgb('#ffa028'), deep: rgb('#ffdc42'),
  },
};

/** Fixed, seeded, visible spots in rings 3-7 on the front sides of each people. */
export const LANDMARK_SPOTS: Record<ArcId, readonly [{ x: number; y: number }, { x: number; y: number }, { x: number; y: number }]> = {
  elf: [{ x: 45, y: 8 }, { x: 45, y: 28 }, { x: 20, y: -5 }],
  lizard: [{ x: 8, y: 45 }, { x: 28, y: 45 }, { x: -5, y: 20 }],
  caveman: [{ x: 45, y: 10 }, { x: 45, y: 32 }, { x: 24, y: -5 }],
  dragon: [{ x: 10, y: 45 }, { x: 30, y: 45 }, { x: -5, y: 24 }],
  goblin: [{ x: 44, y: 14 }, { x: 44, y: 44 }, { x: 14, y: 44 }],
};

const ELF_LAKE: readonly [number, number][] = [
  [45, 18], [44, 18], [46, 18], [45, 17], [45, 19], [44, 19], [46, 17],
];
const LIZARD_LAKE: readonly [number, number][] = [
  [18, 45], [17, 45], [19, 45], [18, 44], [18, 46], [17, 44], [19, 46],
];
const CAVEMAN_LAKE: readonly [number, number][] = [
  [45, 22], [44, 22], [46, 22], [45, 21], [45, 23], [44, 23], [46, 21],
];
const DRAGON_LAKE: readonly [number, number][] = [
  [20, 46], [19, 46], [21, 46], [20, 45], [20, 47], [19, 45], [21, 47],
];

/** Check if tile (x, y) belongs to the river or lake of arc. */
export function isWaterTile(arc: ArcId, x: number, y: number): boolean {
  // never in rings 0-2: the city and its edge stay dry
  if (Math.max(-x, -y, x - (GRID - 1), y - (GRID - 1)) < 3) return false;
  if (arc === 'elf') {
    if (ELF_LAKE.some(([lx, ly]) => lx === x && ly === y)) return true;
    if (x >= -30 && x < GRID + 30) {
      const cy = Math.round(GRID + 4 + 2.4 * Math.sin((x + 10) * 0.16) + Math.sin(x * 0.41));
      return Math.abs(y - cy) <= 1;
    }
  } else if (arc === 'lizard') {
    if (LIZARD_LAKE.some(([lx, ly]) => lx === x && ly === y)) return true;
    if (y >= -30 && y < GRID + 30) {
      const cx = Math.round(GRID + 4 + 2.4 * Math.sin((y + 6) * 0.17) + Math.sin(y * 0.37));
      return Math.abs(x - cx) <= 1;
    }
  } else if (arc === 'caveman') {
    if (CAVEMAN_LAKE.some(([lx, ly]) => lx === x && ly === y)) return true;
    if (x >= -30 && x < GRID + 30) {
      const cy = Math.round(GRID + 4 + 2.2 * Math.cos((x + 4) * 0.15) + Math.sin(x * 0.43));
      return Math.abs(y - cy) <= 1;
    }
  } else if (arc === 'dragon') {
    if (DRAGON_LAKE.some(([lx, ly]) => lx === x && ly === y)) return true;
    if (y >= -30 && y < GRID + 30) {
      const cx = Math.round(GRID + 4 + 2.4 * Math.cos((y + 12) * 0.16) + Math.sin(y * 0.39));
      return Math.abs(x - cx) <= 1;
    }
  }
  return false;
}

/** One 66x34 water ground tile with bank masks (1: -x, 2: -y, 4: +x, 8: +y). */
function waterTile(arc: ArcId, mask: number, frame: number): HTMLCanvasElement {
  const [cv, ctx] = makeCanvas(66, 34);
  const pal = WATER_PALETTES[arc] ?? WATER_PALETTES.elf!;
  const hexColor = (c: Color) => '#' + c.map((v) => v.toString(16).padStart(2, '0')).join('');
  isoDiamond(ctx, 33, 17, 34, mask !== 0 ? hexColor(pal.sandDark) : hexColor(pal.deep));

  const img = ctx.getImageData(0, 0, 66, 34);
  const b: Buf = { d: img.data, w: 66, h: 34 };

  for (let u = 0; u < 32; u++) {
    for (let v = 0; v < 32; v++) {
      let d = 99;
      if (mask & 1) d = Math.min(d, u);
      if (mask & 4) d = Math.min(d, 31 - u);
      if (mask & 2) d = Math.min(d, v);
      if (mask & 8) d = Math.min(d, 31 - v);

      const n = tileHash(u, v, 77) % 7;
      const edge = d + (n > 4 ? 1 : 0) - ((u * 3 + v * 5 + frame) % 5 === 0 ? 1 : 0);

      let c: Color;
      if (edge < 2) {
        c = n < 2 ? pal.sandDark : pal.sand;
      } else if (edge < 3) {
        c = pal.wet;
      } else if (edge < 4 + ((frame + u + v) % 3 === 0 ? 1 : 0)) {
        c = pal.foam;
      } else if (edge < 6) {
        c = pal.foam2;
      } else if (edge < 8) {
        c = pal.lip;
      } else if (edge < 11) {
        c = pal.shallow;
      } else {
        c = (u + v) % 2 && n === 0 ? pal.mid : d > 14 ? pal.deep : pal.mid;
      }

      if (edge >= 4) {
        if (arc === 'elf') {
          const spk = (u * 7 + v * 13 + frame * 9) % 23;
          if (spk === 0) c = [255, 255, 255];
          else if (spk === 1 && n < 3) c = [216, 244, 255];
        } else if (arc === 'lizard') {
          const hPad = tileHash(u, v, 23) % 29;
          if (hPad === 0) {
            c = [86, 138, 52];
            if ((frame + u) % 2 === 0) c = [252, 174, 200];
          }
        } else if (arc === 'caveman') {
          const hStone = tileHash(u, v, 41) % 31;
          if (hStone === 0 && edge <= 9) {
            c = n % 2 === 0 ? [138, 127, 114] : [176, 166, 152];
          }
        } else if (arc === 'dragon') {
          const bub = (u * 3 + v * 5 + frame * 7) % 19;
          if (bub === 0) c = [255, 250, 160];
          else if (bub === 1) c = [255, 255, 255];
        }
      }

      const sx = 33 + (u - v), sy = 1 + ((u + v) >> 1);
      put(b, sx - 1, sy, c);
      put(b, sx, sy, c);
      if (((u + v) & 1) === 0) {
        put(b, sx - 1, sy + 1, c);
        put(b, sx, sy + 1, c);
      }
    }
  }

  ctx.putImageData(img, 0, 0);
  return cv;
}

const waterCache = new Map<ArcId, HTMLCanvasElement[][]>();

/** Pre-bake 16 bank mask tiles x 3 animation frames for an arc. */
export function createLandWater(arc: ArcId): HTMLCanvasElement[][] {
  let cached = waterCache.get(arc);
  if (!cached) {
    cached = Array.from({ length: 16 }, (_, m) => [0, 1, 2].map((f) => waterTile(arc, m, f)));
    waterCache.set(arc, cached);
  }
  return cached;
}

/** Place river, lake, landmarks and clean banks for elf, lizard, caveman, dragon. */
export function landPlace(
  arc: ArcId,
  x: number,
  y: number,
  _ring: number,
  landmarkIdx: (number | undefined)[],
  lavaGlowIdx?: number,
  lowPropIdx?: number,
): Placement {
  const spots = LANDMARK_SPOTS[arc];
  if (spots) {
    for (let k = 0; k < 3; k++) {
      const s = spots[k];
      if (s && s.x === x && s.y === y) {
        if (landmarkIdx[k] !== undefined) return { prop: landmarkIdx[k] };
        return {};
      }
    }
  }

  if (isWaterTile(arc, x, y)) {
    const mask =
      (isWaterTile(arc, x - 1, y) ? 0 : 1) |
      (isWaterTile(arc, x, y - 1) ? 0 : 2) |
      (isWaterTile(arc, x + 1, y) ? 0 : 4) |
      (isWaterTile(arc, x, y + 1) ? 0 : 8);

    if (arc === 'dragon' && lavaGlowIdx !== undefined && (x + y) % 3 === 0) {
      return { ground: 'water', mask, prop: lavaGlowIdx };
    }
    return { ground: 'water', mask };
  }

  if (
    isWaterTile(arc, x + 1, y) ||
    isWaterTile(arc, x - 1, y) ||
    isWaterTile(arc, x, y + 1) ||
    isWaterTile(arc, x, y - 1)
  ) {
    return lowPropIdx !== undefined && tileHash(x, y, 7) % 4 === 0 ? { prop: lowPropIdx } : {};
  }

  return null;
}
