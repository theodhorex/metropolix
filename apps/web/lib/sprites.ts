import { CanvasSource, Texture } from 'pixi.js';
import { BUILDING_KINDS, canUpgrade, type ArcId, type BuildingKind } from '@metropolix/sim';
import { ARC_ART } from './arcs';
import { paintedFrames, paintedPeople } from './painted';
import { buildLevelCanvas } from './sprites-levels';
import { art3a } from './sprites-wave3a';
import { art3b } from './sprites-wave3b';
import { art3c } from './sprites-wave3c';

// Sprite dimensions: 64x32 isometric ground diamond; 64x64 building sprite canvas
// where the ground diamond occupies y = 32..63 (top vertex at (32, 32)).
import { SPECIES_COUNT, WALK_FRAMES, drawCitizen } from './citizens';
import {
  BADGE_H,
  BADGE_W,
  buildAcademyTexture,
  buildBadgeTexture,
  buildBankTexture,
  buildClinicTexture,
  buildLibraryTexture,
  buildManorTexture,
  buildRowhouseTexture,
  buildStallTexture,
  buildTavernTexture,
  buildWorkshopTexture,
  drawSoldier,
} from './sprites-wave2';
export { BADGE_H, BADGE_W };
export const SPRITE_W = 64;
export const TILE_H = 32;
export const SPRITE_H = 64;

export const OUT = '#141820'; // 1px dark pixel-art outline

/**
 * Hand-drawn art for one arc. Anything omitted falls back to the shared sprites with a colour theme.
 * Each function returns canvases (animation frames) in the same 64x64 layout as the shared sprites.
 */
export interface ArcArt {
  ground?: (parity: 0 | 1, variant: number) => HTMLCanvasElement;
  foundation?: () => HTMLCanvasElement;
  buildings?: Partial<Record<BuildingKind, () => HTMLCanvasElement[]>>;
  /** NPC citizen walking sprite: 16x24 canvas, 3 frames per direction-less walk cycle, `variant` 0..3 for clothing. */
  citizen?: (frame: number, variant: number) => HTMLCanvasElement;
}

export interface SpriteBank {
  ground: Texture[][]; // [parity 0..1][variant 0..3]
  foundation: Texture; // lighter ground pad under buildings
  buildings: Record<BuildingKind, Texture[]>; // 1+ animation frames per building, drawn on first access
  /** The building textures drawn so far (only these need destroying). */
  built: Map<BuildingKind, Texture[]>;
  citizens: Texture[][][]; // [sub-species][view 0 front, 1 back][frame 0..3 walk, 4 idle]
  badges: [Texture, Texture]; // [level 2 badge, level 3 badge]
  soldiers: Texture[][]; // [view 0 front, 1 back][frame 0..3 walk, 4 idle]
  /** Lazily builds and caches level 2 / level 3 building frame textures on first use. */
  levelFrames: (kind: BuildingKind, level: number) => Texture[];
  /** Cached level variant textures keyed by `${kind}@${level}`, destroyed with the bank. */
  levelCache: Map<string, Texture[]>;
}

/** Set a single logical pixel on a 2D canvas context. */
export function px(ctx: CanvasRenderingContext2D, x: number, y: number, color: string): void {
  ctx.fillStyle = color;
  ctx.fillRect(x | 0, y | 0, 1, 1);
}

/** Fill an integer rectangle on a 2D canvas context. */
export function rect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string): void {
  if (w <= 0 || h <= 0) return;
  ctx.fillStyle = color;
  ctx.fillRect(x | 0, y | 0, w | 0, h | 0);
}

/**
 * Draw a flat 2:1 isometric diamond centered at (cx, cy) with half-width rx (and half-height rx/2).
 */
export function isoDiamond(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rx: number,
  fill: string,
  outline?: string,
): void {
  const ry = rx >> 1;
  for (let dy = -ry; dy < ry; dy++) {
    const d = dy < 0 ? -1 - dy : dy;
    const span = Math.min(rx, rx - d * 2);
    const y = cy + dy;
    const x0 = cx - span;
    const w = span * 2;
    rect(ctx, x0, y, w, 1, fill);
    if (outline) {
      rect(ctx, x0, y, 2, 1, outline);
      rect(ctx, x0 + w - 2, y, 2, 1, outline);
    }
  }
}

/**
 * Plot a 2x1 isometric texel on a diamond whose top corner is (cx, topY),
 * using tile coordinates u, v in 0..steps-1.
 */
export function isoTexel(
  ctx: CanvasRenderingContext2D,
  cx: number,
  topY: number,
  u: number,
  v: number,
  color: string,
): void {
  rect(ctx, cx + (u - v) - 1, topY + ((u + v) >> 1), 2, 1, color);
}

export interface IsoBoxColors {
  top: string;
  left: string;
  right: string;
  outline?: string;
}

/**
 * Draw a 2:1 isometric extruded box.
 * (fx, fy) is the front-bottom vertex of the box on the ground.
 * wL = width in pixels along the left-up axis; wR = width in pixels along the right-up axis; h = wall height.
 * Lighting: top-left daytime light (left face darker, right face mid, top face lightest) + 1px dark outline.
 */
export function isoBox(
  ctx: CanvasRenderingContext2D,
  fx: number,
  fy: number,
  wL: number,
  wR: number,
  h: number,
  colors: IsoBoxColors,
): void {
  const out = colors.outline ?? OUT;

  // 1. Top face diamond/parallelogram
  const topFy = fy - h;
  for (let u = 0; u < wL; u++) {
    for (let v = 0; v < wR; v++) {
      const x = fx - 1 - u + v;
      const y = topFy - ((u + v + 1) >> 1);
      px(ctx, x, y, colors.top);
    }
  }

  // 2. Left face (darker)
  for (let u = 0; u < wL; u++) {
    const x = fx - 1 - u;
    const yBot = fy - (u >> 1);
    const yTop = yBot - h;
    rect(ctx, x, yTop, 1, h + 1, colors.left);
    px(ctx, x, yBot, out);
    px(ctx, x, yTop, out);
  }

  // 3. Right face (mid)
  for (let v = 0; v < wR; v++) {
    const x = fx + v;
    const yBot = fy - (v >> 1);
    const yTop = yBot - h;
    rect(ctx, x, yTop, 1, h + 1, colors.right);
    px(ctx, x, yBot, out);
    px(ctx, x, yTop, out);
  }

  // 4. Outer & back outlines
  for (let u = 0; u < wL; u++) {
    const x = fx - 1 - u + (wR - 1);
    const y = topFy - ((u + wR) >> 1);
    px(ctx, x, y, out);
  }
  for (let v = 0; v < wR; v++) {
    const x = fx - wL + v;
    const y = topFy - ((wL + v) >> 1);
    px(ctx, x, y, out);
  }
  // Vertical corner edges
  rect(ctx, fx - wL, fy - (wL >> 1) - h, 1, h + 1, out);
  rect(ctx, fx + wR - 1, fy - ((wR - 1) >> 1) - h, 1, h + 1, out);
  rect(ctx, fx - 1, fy - h, 1, h + 1, out);
}

/** Draw a sloped rectangle on the left wall of an isoBox anchored at front-bottom (fx, fy). */
export function leftWallRect(
  ctx: CanvasRenderingContext2D,
  fx: number,
  fy: number,
  u0: number,
  z0: number,
  du: number,
  dz: number,
  color: string,
): void {
  for (let u = u0; u < u0 + du; u++) {
    const x = fx - 1 - u;
    const yBase = fy - (u >> 1);
    rect(ctx, x, yBase - z0 - dz + 1, 1, dz, color);
  }
}

/** Draw a sloped rectangle on the right wall of an isoBox anchored at front-bottom (fx, fy). */
export function rightWallRect(
  ctx: CanvasRenderingContext2D,
  fx: number,
  fy: number,
  v0: number,
  z0: number,
  dv: number,
  dz: number,
  color: string,
): void {
  for (let v = v0; v < v0 + dv; v++) {
    const x = fx + v;
    const yBase = fy - (v >> 1);
    rect(ctx, x, yBase - z0 - dz + 1, 1, dz, color);
  }
}

/**
 * Draw a pitched gable roof over an isoBox whose ridge runs along the right-up (v) axis.
 * The gable triangle faces the left-down wall, and the sunlit roof slope faces right-down.
 */
export function isoPitchedRoof(
  ctx: CanvasRenderingContext2D,
  fx: number,
  fy: number,
  wL: number,
  wR: number,
  wallH: number,
  peakH: number,
  colors: { leftSlope: string; rightSlope: string; gable: string; ridge: string; outline?: string },
): void {
  const out = colors.outline ?? OUT;
  const topFy = fy - wallH;
  const halfL = wL >> 1;

  // Fill gable triangle on the front-left wall first
  for (let u = 0; u < wL; u++) {
    const distFromCenter = u < halfL ? halfL - 1 - u : u - halfL;
    const rise = Math.max(0, Math.round(((halfL - distFromCenter) * peakH) / halfL));
    if (rise > 0) {
      const x = fx - 1 - u;
      const yBase = topFy - (u >> 1);
      rect(ctx, x, yBase - rise, 1, rise, colors.gable);
    }
  }

  // Draw roof slopes extruded along v = 0..wR-1
  for (let v = 0; v < wR; v++) {
    for (let u = 0; u < wL; u++) {
      const isBackHalf = u >= halfL;
      const distFromCenter = u < halfL ? halfL - 1 - u : u - halfL;
      const rise = Math.max(0, Math.round(((halfL - distFromCenter) * peakH) / halfL));
      const x = fx - 1 - u + v;
      const y = topFy - ((u + v + 1) >> 1) - rise;
      const isEdge = v === 0 || v === wR - 1 || u === 0 || u === wL - 1;
      const isRidge = u === halfL - 1 || u === halfL;
      const col = isEdge
        ? out
        : isRidge
          ? colors.ridge
          : isBackHalf
            ? colors.leftSlope
            : colors.rightSlope;
      rect(ctx, x, y, 1, 2, col);
    }
  }
}

export function makeCanvas(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;
  return [canvas, ctx];
}

// PixiJS v8 Texture from CanvasSource with nearest-neighbor scaling
// Source: https://pixijs.download/v8.22.0/docs/rendering.CanvasSource.html
// Source: https://pixijs.download/v8.22.0/docs/rendering.TextureSource.html#scaleMode
// Per-arc colour theme, applied to every sprite while a bank is built (nearest-neighbour safe: no scaling).
// Distinct per-arc SHAPES come from ARC_SPRITES in ./arcs (optional overrides drawn by hand).
export const ARC_FILTER: Record<ArcId, string> = {
  elf: 'hue-rotate(35deg) saturate(1.15) brightness(1.2)',
  lizard: 'hue-rotate(85deg) saturate(1.3) brightness(1.12)',
  caveman: 'sepia(0.55) saturate(0.9) brightness(1.04)',
  dragon: 'hue-rotate(-35deg) saturate(1.5) brightness(0.92) contrast(1.05)',
  goblin: 'hue-rotate(55deg) saturate(0.9) brightness(0.92) contrast(1.1)',
};
/**
 * Level 2 and 3 add-ons use their own milder filter. The race filters spin hues hard, which turned
 * red banners orange on elf and silos pink on dragon; add-ons only need the race's light and dirt.
 */
export const ADDON_FILTER: Record<ArcId, string> = {
  elf: 'saturate(1.05) brightness(1.12)',
  lizard: 'saturate(1.1) brightness(1.1)',
  caveman: 'sepia(0.4) saturate(1.3) brightness(1.12)',
  dragon: 'saturate(1.1) brightness(1.05) contrast(1.05)',
  goblin: 'saturate(1.05) brightness(1.05) contrast(1.05)',
};
/**
 * Brighter, more colourful buildings (Theo, 14 Nov 2026: "agak terang dan colorful"), on top of the people's
 * own colours; it also reaches the hand-drawn people buildings, which skip ARC_FILTER.
 */
export const BUILDING_POP: Record<ArcId, string> = {
  elf: 'brightness(1.1) saturate(1.35)',
  lizard: 'brightness(1.1) saturate(1.35)',
  caveman: 'brightness(1.12) saturate(1.5)',
  dragon: 'brightness(1.22) saturate(1.3)',
  goblin: 'brightness(1.15) saturate(1.4)',
};
let themeFilter: string | null = null;

function canvasToTexture(canvas: HTMLCanvasElement): Texture {
  let c = canvas;
  if (themeFilter) {
    const [t, tctx] = makeCanvas(canvas.width, canvas.height);
    tctx.filter = themeFilter;
    tctx.drawImage(canvas, 0, 0);
    c = t;
  }
  // painted (AI-made) art is not pixel art: sample it smoothly, with mipmaps for zoomed-out views
  const smooth = canvas.dataset.smooth === '1';
  const source = new CanvasSource({
    resource: c,
    scaleMode: smooth ? 'linear' : 'nearest',
    autoGenerateMipmaps: smooth,
  });
  return new Texture({ source });
}

/** Deterministic integer hash for seeded pixel noise. */
export function tileHash(x: number, y: number, salt = 0): number {
  let h = (x * 374761393 + y * 668265263 + salt * 1442695041) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return (h ^ (h >>> 16)) >>> 0;
}

function buildGroundVariant(parity: 0 | 1, variant: number): Texture {
  const [canvas, ctx] = makeCanvas(SPRITE_W, TILE_H);
  const base = parity === 0 ? '#355f3e' : '#2e5437';
  const dark = parity === 0 ? '#2c5134' : '#26472e';
  const light = parity === 0 ? '#41724b' : '#396543';
  const border = '#1f3a26';

  isoDiamond(ctx, 32, 16, 32, base, border);

  // Deterministic pixel noise across the 32x32 isometric grid
  for (let u = 2; u < 30; u++) {
    for (let v = 2; v < 30; v++) {
      const h = tileHash(u, v, variant * 17 + parity * 7);
      const r = h % 29;
      if (r === 0 || r === 1) {
        isoTexel(ctx, 32, 0, u, v, light);
      } else if (r === 2 || r === 3) {
        isoTexel(ctx, 32, 0, u, v, dark);
      }
    }
  }

  // Variant-specific tiny details (grass blades, wildflowers, pebbles)
  if (variant === 1) {
    // Tiny yellow & white wildflowers
    const spots = [
      [10, 12, '#f7df63'],
      [21, 9, '#fff5cc'],
      [16, 22, '#f7df63'],
    ] as const;
    for (const [u, v, col] of spots) {
      const sx = 32 + (u - v);
      const sy = (u + v) >> 1;
      px(ctx, sx, sy + 1, '#24442b');
      px(ctx, sx, sy, col);
    }
  } else if (variant === 2) {
    // Tiny sky-blue & pink meadow flowers
    const spots = [
      [13, 18, '#7ad0ff'],
      [22, 15, '#f59ab5'],
      [9, 9, '#7ad0ff'],
    ] as const;
    for (const [u, v, col] of spots) {
      const sx = 32 + (u - v);
      const sy = (u + v) >> 1;
      px(ctx, sx, sy + 1, '#24442b');
      px(ctx, sx, sy, col);
    }
  } else if (variant === 3) {
    // Tiny pebbles and clover cluster
    const rocks = [
      [12, 20],
      [23, 12],
    ] as const;
    for (const [u, v] of rocks) {
      const sx = 32 + (u - v);
      const sy = (u + v) >> 1;
      rect(ctx, sx - 1, sy, 2, 1, '#8c969e');
      px(ctx, sx, sy + 1, '#59626a');
    }
  }

  return canvasToTexture(canvas);
}

function buildFoundationTexture(): Texture {
  const [canvas, ctx] = makeCanvas(SPRITE_W, TILE_H);
  isoDiamond(ctx, 32, 16, 32, '#3d6946', '#213c28');
  isoDiamond(ctx, 32, 16, 26, '#506455', '#2d3b31');
  return canvasToTexture(canvas);
}

/** Draw a cozy cottage house (pitched roof + door + window + chimney). */
function buildHouseTexture(): Texture {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);
  // Subtle stone/garden pad on the tile footprint (centered at 32, 48)
  isoDiamond(ctx, 32, 48, 26, '#486e4d', '#243c29');
  isoDiamond(ctx, 32, 48, 22, '#7d786d', OUT);

  // Main cottage body: front-bottom corner at (32, 56)
  const fx = 32;
  const fy = 56;
  const wL = 16;
  const wR = 18;
  const wallH = 13;

  // Stone foundation course (2px high)
  isoBox(ctx, fx, fy, wL, wR, 2, {
    top: '#8c877c',
    left: '#54514a',
    right: '#6e6a61',
  });

  // Warm timber/plaster walls above foundation
  isoBox(ctx, fx, fy - 2, wL, wR, wallH - 2, {
    top: '#f0c999',
    left: '#b07d4f',
    right: '#d9a066',
  });

  // Wooden door on the right wall with stone doorstep
  rightWallRect(ctx, fx, fy, 4, 1, 5, 8, OUT);
  rightWallRect(ctx, fx, fy, 5, 1, 3, 7, '#6b3e26');
  rightWallRect(ctx, fx, fy, 7, 4, 1, 1, '#f5d76e'); // brass doorknob

  // Lit window on the right wall next to door
  rightWallRect(ctx, fx, fy, 11, 5, 5, 5, OUT);
  rightWallRect(ctx, fx, fy, 12, 6, 3, 3, '#9be7ff');
  rightWallRect(ctx, fx, fy, 12, 7, 1, 2, '#e0f7ff'); // window glint

  // Lit window with wooden shutters on the left (shaded) wall
  leftWallRect(ctx, fx, fy, 5, 5, 6, 5, OUT);
  leftWallRect(ctx, fx, fy, 6, 6, 4, 3, '#6ec5e8');
  leftWallRect(ctx, fx, fy, 4, 5, 1, 5, '#5b341f');
  leftWallRect(ctx, fx, fy, 11, 5, 1, 5, '#5b341f');

  // Pitched terracotta shingle roof
  isoPitchedRoof(ctx, fx, fy, wL + 2, wR + 2, wallH, 9, {
    leftSlope: '#8f322a',
    rightSlope: '#c2473b',
    gable: '#9e6e44',
    ridge: '#e06758',
  });

  // Small brick chimney on the back-right roof slope
  isoBox(ctx, 35, 31, 3, 3, 6, {
    top: '#a84a42',
    left: '#632622',
    right: '#873630',
  });

  return canvasToTexture(canvas);
}

/** Draw a farm (tilled crop rows + small red barn + hay bale). */
function buildFarmTexture(): Texture {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  // Grassy border + tilled soil field on the 64x32 footprint (top corner at (32, 32))
  isoDiamond(ctx, 32, 48, 28, '#3f6e46', OUT);
  for (let u = 3; u < 29; u++) {
    for (let v = 3; v < 29; v++) {
      const isFurrow = u % 4 === 0 || u % 4 === 3;
      isoTexel(ctx, 32, 32, u, v, isFurrow ? '#4f3321' : '#6e4930');
    }
  }

  // Distinct parallel isometric crop rows on the front/right field (u = 14..27, v = 4..27)
  for (const rowU of [15, 19, 23, 27]) {
    const isWheat = rowU === 19 || rowU === 27;
    for (let v = 4; v < 28; v++) {
      const sx = 32 + (rowU - v);
      const sy = 32 + ((rowU + v) >> 1);
      if (isWheat) {
        rect(ctx, sx - 1, sy - 2, 2, 2, '#c99326');
        px(ctx, sx - 1, sy - 3, '#f7d454');
        px(ctx, sx, sy - 2, '#ffe885');
      } else {
        rect(ctx, sx - 1, sy - 2, 2, 2, '#4d8c28');
        rect(ctx, sx - 1, sy - 3, 2, 1, '#8bc34a');
        if (v % 4 === 0) px(ctx, sx, sy - 3, '#ef5350');
        else px(ctx, sx, sy - 3, '#b8e968');
      }
    }
  }

  // Small red barn on the back-left quadrant of the farm (front-bottom at (26, 48))
  const fx = 26;
  const fy = 48;
  const wL = 10;
  const wR = 12;
  const wallH = 9;

  isoBox(ctx, fx, fy, wL, wR, wallH, {
    top: '#d94b3d',
    left: '#8c271e',
    right: '#b8372b',
  });

  // White barn door frame & dark interior on the right wall
  rightWallRect(ctx, fx, fy, 3, 1, 6, 6, '#f2eadc');
  rightWallRect(ctx, fx, fy, 4, 1, 4, 5, '#2b1912');
  rightWallRect(ctx, fx, fy, 4, 1, 3, 2, '#e6b83c'); // hay inside doorway

  // White X-trim accent on the left wall
  leftWallRect(ctx, fx, fy, 3, 2, 4, 5, '#f2eadc');
  leftWallRect(ctx, fx, fy, 4, 3, 2, 3, '#8c271e');

  // Pitched barn roof
  isoPitchedRoof(ctx, fx, fy, wL + 2, wR + 2, wallH, 6, {
    leftSlope: '#4a3525',
    rightSlope: '#6b4c36',
    gable: '#a63228',
    ridge: '#8c6548',
  });

  // Golden hay bale beside the barn
  isoBox(ctx, 19, 52, 4, 4, 3, {
    top: '#f7d454',
    left: '#b58420',
    right: '#d9a730',
  });

  return canvasToTexture(canvas);
}

/** Draw a market shop (striped awning + glass storefront + parapet roof). */
function buildShopTexture(): Texture {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  // Paved market sidewalk pad
  isoDiamond(ctx, 32, 48, 26, '#7b848c', OUT);
  isoDiamond(ctx, 32, 48, 22, '#929ba3', '#525960');

  const fx = 32;
  const fy = 56;
  const wL = 18;
  const wR = 20;
  const wallH = 17;

  // Main shop building in sky-blue palette
  isoBox(ctx, fx, fy, wL, wR, wallH, {
    top: '#78d2fa',
    left: '#2b7ba1',
    right: '#43a0cc',
  });

  // Cream cornice / roof parapet band at the top (3px tall)
  isoBox(ctx, fx, fy - (wallH - 3), wL, wR, 3, {
    top: '#f5ebd6',
    left: '#a89c82',
    right: '#d6c8ab',
  });
  // Recessed flat tar roof inside parapet
  isoDiamond(ctx, 33, 56 - wallH - 9, 14, '#46525e', OUT);

  // Storefront glass window & door on the right wall (below awning)
  rightWallRect(ctx, fx, fy, 2, 1, 5, 8, OUT);
  rightWallRect(ctx, fx, fy, 3, 1, 3, 7, '#6e4228'); // shop door
  rightWallRect(ctx, fx, fy, 8, 2, 9, 7, OUT);
  rightWallRect(ctx, fx, fy, 9, 3, 7, 5, '#a8ecff'); // display window
  rightWallRect(ctx, fx, fy, 10, 4, 2, 3, '#e8fbff'); // glass reflection
  rightWallRect(ctx, fx, fy, 13, 3, 2, 2, '#ffd54f'); // displayed goods

  // Side window on the left wall
  leftWallRect(ctx, fx, fy, 5, 3, 8, 5, OUT);
  leftWallRect(ctx, fx, fy, 6, 4, 6, 3, '#72c5e8');

  // Prominent projecting red-and-white striped awning on the right storefront wall
  for (let v = 1; v < wR - 1; v++) {
    const stripeRed = ((v >> 1) & 1) === 0;
    const topCol = stripeRed ? '#e53935' : '#fff8eb';
    const valanceCol = stripeRed ? '#b71c1c' : '#d9cfc0';
    const x = fx + v;
    const yWall = fy - (v >> 1) - 9;
    // Sloped awning canopy + projecting front valance
    rect(ctx, x, yWall - 3, 1, 3, topCol);
    rect(ctx, x + 1, yWall - 1, 1, 2, topCol);
    px(ctx, x + 1, yWall + 1, valanceCol);
    px(ctx, x, yWall - 4, OUT);
  }

  // Smaller shaded striped awning on the left wall
  for (let u = 4; u < wL - 4; u++) {
    const stripeRed = ((u >> 1) & 1) === 0;
    const col = stripeRed ? '#b52b27' : '#d4cbb8';
    const x = fx - 1 - u;
    const yWall = fy - (u >> 1) - 9;
    rect(ctx, x - 1, yWall - 2, 2, 3, col);
    px(ctx, x, yWall - 3, OUT);
  }

  // Golden rooftop shop sign on the front parapet
  isoBox(ctx, 34, 38, 3, 8, 4, {
    top: '#ffe082',
    left: '#b28924',
    right: '#f5be36',
  });

  return canvasToTexture(canvas);
}

/** Draw an industrial factory (sawtooth roof + tall smokestack chimney + optional smoke frame). */
function buildFactoryTexture(smokeFrame = -1): Texture {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  // Industrial concrete yard pad
  isoDiamond(ctx, 32, 48, 28, '#555b61', OUT);
  isoDiamond(ctx, 32, 48, 24, '#6e767d', '#3b4045');

  const fx = 32;
  const fy = 56;
  const wL = 20;
  const wR = 20;
  const wallH = 17;

  // Main factory hall
  isoBox(ctx, fx, fy, wL, wR, wallH, {
    top: '#9ea7b0',
    left: '#5c636b',
    right: '#838c96',
  });

  // Foundation dark plinth
  isoBox(ctx, fx, fy, wL, wR, 2, {
    top: '#5c636b',
    left: '#3a3f45',
    right: '#4c5259',
  });

  // Loading bay roll-up door on right wall with hazard sill
  rightWallRect(ctx, fx, fy, 3, 2, 8, 9, OUT);
  for (let z = 2; z < 10; z++) {
    rightWallRect(ctx, fx, fy, 4, z, 6, 1, z % 2 === 0 ? '#495159' : '#636d78');
  }
  rightWallRect(ctx, fx, fy, 3, 1, 8, 1, '#f5b82e'); // yellow safety curb

  // Factory multi-pane windows on right wall
  rightWallRect(ctx, fx, fy, 13, 5, 5, 7, OUT);
  rightWallRect(ctx, fx, fy, 14, 6, 3, 5, '#ffd56b'); // warm furnace light

  // Two tall industrial windows on left shaded wall
  for (const u0 of [4, 12]) {
    leftWallRect(ctx, fx, fy, u0, 5, 5, 8, OUT);
    leftWallRect(ctx, fx, fy, u0 + 1, 6, 3, 6, '#80c8e8');
    leftWallRect(ctx, fx, fy, u0 + 1, 9, 3, 1, OUT); // window mullion
  }

  // Sawtooth roof: 3 parallel sawtooth ridges across the factory top
  const roofFy = fy - wallH;
  for (let tooth = 0; tooth < 3; tooth++) {
    const vStart = 1 + tooth * 6;
    // Each tooth rises from h=1 to h=6 across dv=0..5, with a vertical glass skylight on the front-right face
    for (let dv = 0; dv < 6; dv++) {
      const rise = 1 + dv;
      const v = vStart + dv;
      for (let u = 1; u < wL - 1; u++) {
        const x = fx - 1 - u + v;
        const yBase = roofFy - ((u + v + 1) >> 1);
        // Left gable end of the tooth (u === 1)
        if (u === 1) {
          rect(ctx, x, yBase - rise, 1, rise, '#4e555c');
          px(ctx, x, yBase - rise, OUT);
        } else {
          // Sloped metal roof top
          const isRidge = dv === 5 || u === wL - 2;
          rect(ctx, x, yBase - rise, 1, 2, isRidge ? OUT : '#adb6bf');
        }
        // Steep skylight face on the tooth peak (dv === 5)
        if (dv === 5 && u > 2 && u < wL - 2) {
          rect(ctx, x + 1, yBase - rise + 1, 1, 4, u % 3 === 0 ? OUT : '#9be7ff');
        }
      }
    }
  }

  // Tall smokestack chimney on the back-left corner
  const cFx = 21;
  const cFy = 34;
  isoBox(ctx, cFx, cFy, 5, 5, 18, {
    top: '#2b2f33',
    left: '#59332c',
    right: '#7d4940',
  });
  // Chimney iron bands & crown
  isoBox(ctx, cFx, cFy - 15, 6, 6, 3, {
    top: '#22252a',
    left: '#3f231e',
    right: '#59332c',
  });

  // Optional animated smoke puffs rising from chimney top (center ~(21, 14))
  if (smokeFrame >= 0) {
    const puffs: readonly (readonly [number, number, number, number])[] =
      smokeFrame === 0
        ? [
            [21, 12, 3, 2],
            [23, 8, 4, 3],
            [26, 4, 3, 2],
          ]
        : smokeFrame === 1
          ? [
              [22, 10, 4, 3],
              [25, 6, 4, 3],
              [28, 2, 2, 2],
            ]
          : [
              [21, 13, 2, 2],
              [22, 9, 4, 2],
              [25, 5, 3, 3],
            ];
    for (const [px0, py0, pw, ph] of puffs) {
      rect(ctx, px0 - 1, py0, pw + 2, ph, '#586068');
      rect(ctx, px0, py0 - 1, pw, ph + 2, '#9aa3ad');
      rect(ctx, px0, py0, pw - 1, ph - 1, '#dce3eb');
    }
  }

  return canvasToTexture(canvas);
}

/** Draw a brick schoolhouse (brick walls + golden trim + belfry with golden bell + flagpole with waving flag). */
function buildSchoolTexture(flagFrame = 0): Texture {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  // Courtyard & lawn pad
  isoDiamond(ctx, 32, 48, 28, '#416e48', OUT);
  isoDiamond(ctx, 32, 48, 22, '#8c8577', '#4a463e');

  const fx = 32;
  const fy = 56;
  const wL = 18;
  const wR = 20;
  const wallH = 15;

  // Brick schoolhouse walls
  isoBox(ctx, fx, fy, wL, wR, wallH, {
    top: '#ffd54f',
    left: '#943a2c',
    right: '#bf4d3b',
  });

  // Golden-ochre sandstone belt course & cornice (matching school #ffd54f color identity)
  isoBox(ctx, fx, fy, wL, wR, 2, {
    top: '#ffd54f',
    left: '#b58d28',
    right: '#e6b83c',
  });
  leftWallRect(ctx, fx, fy, 1, wallH - 2, wL - 2, 2, '#c99c2e');
  rightWallRect(ctx, fx, fy, 1, wallH - 2, wR - 2, 2, '#ffd54f');

  // Double school entrance doors on right wall
  rightWallRect(ctx, fx, fy, 2, 1, 5, 8, OUT);
  rightWallRect(ctx, fx, fy, 3, 1, 3, 7, '#633b22');
  rightWallRect(ctx, fx, fy, 2, 9, 5, 1, '#ffd54f'); // golden lintel

  // Two tall classroom windows on right wall
  for (const v0 of [9, 14]) {
    rightWallRect(ctx, fx, fy, v0, 4, 4, 7, OUT);
    rightWallRect(ctx, fx, fy, v0 + 1, 5, 2, 5, '#a8ecff');
    rightWallRect(ctx, fx, fy, v0, 11, 4, 1, '#ffd54f');
  }

  // Two tall classroom windows on left wall
  for (const u0 of [4, 11]) {
    leftWallRect(ctx, fx, fy, u0, 4, 5, 7, OUT);
    leftWallRect(ctx, fx, fy, u0 + 1, 5, 3, 5, '#72c5e8');
    leftWallRect(ctx, fx, fy, u0, 11, 5, 1, '#c99c2e');
  }

  // Pitched slate roof
  isoPitchedRoof(ctx, fx, fy, wL + 2, wR + 2, wallH, 8, {
    leftSlope: '#384654',
    rightSlope: '#4f6375',
    gable: '#8c372a',
    ridge: '#ffd54f',
  });

  // Rooftop belfry / bell tower on the ridge
  const bFx = 32;
  const bFy = 32;
  isoBox(ctx, bFx, bFy, 6, 6, 7, {
    top: '#ffe082',
    left: '#9e7b22',
    right: '#d9ac36',
  });
  // Dark belfry opening & gleaming golden bell inside
  rightWallRect(ctx, bFx, bFy, 1, 1, 4, 5, OUT);
  leftWallRect(ctx, bFx, bFy, 1, 1, 4, 5, OUT);
  const bellShift = flagFrame === 1 ? 1 : 0;
  rect(ctx, bFx - 1 + bellShift, bFy - 5, 3, 3, '#ffd54f');
  px(ctx, bFx + bellShift, bFy - 6, '#fff3b0'); // bell crown highlight
  px(ctx, bFx + bellShift, bFy - 2, '#f59e0b'); // bell clapper
  // Small pyramid cap on belfry
  isoDiamond(ctx, bFx, bFy - 9, 8, '#4f6375', OUT);

  // Flagpole in front-right of roof/courtyard with waving flag
  const poleX = 41;
  const poleY = 12;
  rect(ctx, poleX, poleY, 1, 16, OUT);
  rect(ctx, poleX + 1, poleY + 1, 1, 15, '#e2e8f0');
  px(ctx, poleX, poleY - 1, '#ffd54f'); // golden finial
  // Waving blue & gold school banner flag
  if (flagFrame % 2 === 0) {
    rect(ctx, poleX + 2, poleY + 1, 4, 4, OUT);
    rect(ctx, poleX + 2, poleY + 2, 3, 2, '#29b6f6');
    rect(ctx, poleX + 5, poleY + 2, 4, 4, OUT);
    rect(ctx, poleX + 5, poleY + 3, 3, 2, '#ffd54f');
  } else {
    rect(ctx, poleX + 2, poleY + 2, 4, 4, OUT);
    rect(ctx, poleX + 2, poleY + 3, 3, 2, '#29b6f6');
    rect(ctx, poleX + 5, poleY + 1, 4, 4, OUT);
    rect(ctx, poleX + 5, poleY + 2, 3, 2, '#ffd54f');
  }

  return canvasToTexture(canvas);
}

/** Helper to draw a layered pixel-art tree with 1px dark outline and top-left sunlit crown. */
function drawPixelTree(
  ctx: CanvasRenderingContext2D,
  bx: number,
  by: number,
  radius: number,
  trunkH: number,
  sway: number,
): void {
  // Ground shadow under tree
  rect(ctx, bx - radius + 1, by, radius * 2 - 2, 2, '#1f4722');
  // Trunk with 1px dark outline
  rect(ctx, bx - 2, by - trunkH, 4, trunkH + 1, OUT);
  rect(ctx, bx - 1, by - trunkH, 1, trunkH, '#4a2e19');
  rect(ctx, bx, by - trunkH, 1, trunkH, '#6e4728');

  // Lower canopy tier
  const cy1 = by - trunkH - radius + 2;
  const cx1 = bx;
  for (let dy = -radius; dy <= radius; dy++) {
    const span = Math.round(Math.sqrt(Math.max(0, radius * radius - dy * dy)));
    rect(ctx, cx1 - span - 1, cy1 + dy, (span + 1) * 2, 1, OUT);
    const col = dy > 1 ? '#1e5c24' : dy < -1 ? '#3ca143' : '#2e7d32';
    rect(ctx, cx1 - span, cy1 + dy, span * 2, 1, col);
  }

  // Upper swaying crown tier (shifts by `sway` px)
  const r2 = Math.max(3, radius - 2);
  const cx2 = bx + sway;
  const cy2 = cy1 - 3;
  for (let dy = -r2; dy <= r2; dy++) {
    const span = Math.round(Math.sqrt(Math.max(0, r2 * r2 - dy * dy)));
    rect(ctx, cx2 - span - 1, cy2 + dy, (span + 1) * 2, 1, OUT);
    const col = dy > 0 ? '#2e7d32' : '#4caf50';
    rect(ctx, cx2 - span, cy2 + dy, span * 2, 1, col);
  }
  // Top-left sunlit leaf cluster
  rect(ctx, cx2 - r2 + 1, cy2 - r2 + 1, 3, 2, '#81c784');
}

/** Draw a city park (lush lawn + stone path + wooden bench + swaying trees). */
function buildParkTexture(swayFrame = 0): Texture {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  // Lush emerald park turf on the 64x32 footprint (centered at 32, 48)
  isoDiamond(ctx, 32, 48, 30, '#2e7d32', OUT);
  isoDiamond(ctx, 32, 48, 26, '#358a3a');

  // Stone path crossing the park (u = 13..18 across v = 3..28) + center plaza
  for (let u = 3; u < 29; u++) {
    for (let v = 3; v < 29; v++) {
      const onPath = (u >= 14 && u <= 17) || (v >= 14 && v <= 17 && u >= 10 && u <= 21);
      const onBorder = (u === 13 || u === 18) && v >= 4 && v <= 27;
      if (onPath) {
        const cobble = (u + v) % 3 === 0 ? '#b0a58e' : '#cfc3aa';
        isoTexel(ctx, 32, 32, u, v, cobble);
      } else if (onBorder) {
        isoTexel(ctx, 32, 32, u, v, '#7a7262');
      }
    }
  }

  // Flower bed accents beside the central path
  const flowers: readonly (readonly [number, number, string])[] = [
    [11, 20, '#f48fb1'],
    [12, 22, '#ffd54f'],
    [20, 10, '#4fc3f7'],
    [21, 12, '#f48fb1'],
  ];
  for (const [u, v, col] of flowers) {
    const sx = 32 + (u - v);
    const sy = 32 + ((u + v) >> 1);
    px(ctx, sx, sy, '#1b5e20');
    px(ctx, sx, sy - 1, col);
  }

  // Wooden park bench next to the path (front-bottom at (37, 53))
  isoBox(ctx, 37, 53, 3, 7, 2, {
    top: '#c98349',
    left: '#6e4220',
    right: '#9c6032',
  });
  rightWallRect(ctx, 37, 53, 0, 2, 7, 2, '#804d26'); // backrest

  // Three park trees arranged in back-to-front depth order with 2-frame breeze sway
  const sway = swayFrame % 2 === 1 ? 1 : 0;
  drawPixelTree(ctx, 31, 41, 6, 5, sway);
  drawPixelTree(ctx, 19, 47, 5, 4, sway);
  drawPixelTree(ctx, 45, 48, 5, 4, sway);

  return canvasToTexture(canvas);
}

/** Draw a military barracks (fortified garrison + timber palisade stakes + waving red war banner). */
function buildBarracksTexture(bannerFrame = 0): Texture {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  // Packed dirt & stone drill yard pad
  isoDiamond(ctx, 32, 48, 28, '#594a3c', OUT);
  isoDiamond(ctx, 32, 48, 24, '#73604e', '#3d3228');

  // Main fortified garrison hall
  const fx = 31;
  const fy = 53;
  const wL = 16;
  const wR = 16;
  const wallH = 16;

  // Stone base + crimson-red military garrison walls
  isoBox(ctx, fx, fy, wL, wR, wallH, {
    top: '#d64537',
    left: '#78221a',
    right: '#a83227',
  });
  isoBox(ctx, fx, fy, wL, wR, 5, {
    top: '#7d848a',
    left: '#4a4f54',
    right: '#646a70',
  });

  // Recessed dark roof deck with red brick parapets
  isoDiamond(ctx, 31, 53 - wallH - 8, 12, '#3c4247', OUT);

  // Iron-grated archway entrance on right wall
  rightWallRect(ctx, fx, fy, 4, 1, 6, 9, OUT);
  rightWallRect(ctx, fx, fy, 5, 1, 4, 8, '#221c1a');
  rightWallRect(ctx, fx, fy, 6, 1, 1, 8, '#7f8c8d'); // portcullis bar
  rightWallRect(ctx, fx, fy, 8, 1, 1, 8, '#7f8c8d');

  // Vertical crimson war banner hanging on right wall
  rightWallRect(ctx, fx, fy, 11, 6, 4, 8, OUT);
  rightWallRect(ctx, fx, fy, 12, 7, 2, 6, '#e53935');
  rightWallRect(ctx, fx, fy, 12, 10, 2, 2, '#ffd54f'); // gold emblem

  // Narrow slit windows on left wall
  for (const u0 of [4, 10]) {
    leftWallRect(ctx, fx, fy, u0, 8, 3, 5, OUT);
    leftWallRect(ctx, fx, fy, u0 + 1, 9, 1, 3, '#ffd56b');
  }

  // Front timber palisade wall (sharpened log stakes along front-left and front-right perimeter)
  const pFx = 32;
  const pFy = 59;
  for (let u = 0; u < 18; u++) {
    const x = pFx - 1 - u;
    const yBot = pFy - (u >> 1);
    const stakeH = u % 2 === 0 ? 7 : 6;
    rect(ctx, x, yBot - stakeH, 1, stakeH + 1, u % 3 === 0 ? OUT : '#5e3c22');
    px(ctx, x, yBot - stakeH - 1, '#9c6840'); // sharpened stake tip
    px(ctx, x, yBot - 3, '#2e1c10'); // horizontal binding rope
    px(ctx, x, yBot, OUT);
  }
  for (let v = 0; v < 18; v++) {
    // Leave an entrance gap in front of the archway (v = 5..9)
    if (v >= 5 && v <= 9) continue;
    const x = pFx + v;
    const yBot = pFy - (v >> 1);
    const stakeH = v % 2 === 0 ? 7 : 6;
    rect(ctx, x, yBot - stakeH, 1, stakeH + 1, v % 3 === 0 ? OUT : '#7d5230');
    px(ctx, x, yBot - stakeH - 1, '#bf8554'); // sharpened stake tip
    px(ctx, x, yBot - 3, '#3b2415');
    px(ctx, x, yBot, OUT);
  }

  // Tall rooftop flagpole & waving red war banner
  const poleX = 29;
  const poleY = 9;
  rect(ctx, poleX, poleY, 1, 18, OUT);
  rect(ctx, poleX + 1, poleY + 1, 1, 17, '#cfd8dc');
  px(ctx, poleX, poleY - 1, '#ffd54f');

  if (bannerFrame % 2 === 0) {
    rect(ctx, poleX + 2, poleY + 1, 6, 5, OUT);
    rect(ctx, poleX + 2, poleY + 2, 5, 3, '#d32f2f');
    rect(ctx, poleX + 3, poleY + 3, 2, 1, '#ffd54f');
    rect(ctx, poleX + 7, poleY + 2, 5, 5, OUT);
    rect(ctx, poleX + 7, poleY + 3, 4, 3, '#ef5350');
  } else {
    rect(ctx, poleX + 2, poleY + 2, 6, 5, OUT);
    rect(ctx, poleX + 2, poleY + 3, 5, 3, '#d32f2f');
    rect(ctx, poleX + 3, poleY + 4, 2, 1, '#ffd54f');
    rect(ctx, poleX + 7, poleY + 1, 5, 5, OUT);
    rect(ctx, poleX + 7, poleY + 2, 4, 3, '#ef5350');
  }

  return canvasToTexture(canvas);
}

/** Draw a tall stone watchtower with corbeled parapet and crenellated battlements. */
function buildTowerTexture(): Texture {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  // Heavy cobblestone fortress pad
  isoDiamond(ctx, 32, 48, 26, '#4d413b', OUT);
  isoDiamond(ctx, 32, 48, 22, '#66564e', '#382f2b');

  // Wide stone plinth base
  isoBox(ctx, 32, 57, 16, 16, 6, {
    top: '#8c6558',
    left: '#4a342d',
    right: '#6d4c41',
  });

  // Tall stone tower shaft
  const fx = 32;
  const fy = 52;
  const wL = 12;
  const wR = 12;
  const shaftH = 26;

  isoBox(ctx, fx, fy, wL, wR, shaftH, {
    top: '#997062',
    left: '#523931',
    right: '#755347',
  });

  // Stone mortar bands along the shaft
  for (const z of [6, 12, 18, 24]) {
    leftWallRect(ctx, fx, fy, 1, z, wL - 2, 1, '#3d2a24');
    rightWallRect(ctx, fx, fy, 1, z, wR - 2, 1, '#5c4037');
  }

  // Iron-bound arched door at tower base (right wall)
  rightWallRect(ctx, fx, fy, 4, 1, 4, 6, OUT);
  rightWallRect(ctx, fx, fy, 5, 1, 2, 5, '#2b1e19');
  rightWallRect(ctx, fx, fy, 5, 3, 2, 1, '#90a4ae'); // iron strap

  // Narrow arrow slits on two levels (left and right walls)
  for (const z0 of [9, 17]) {
    leftWallRect(ctx, fx, fy, 5, z0, 2, 5, OUT);
    leftWallRect(ctx, fx, fy, 4, z0 + 2, 4, 1, OUT);
    rightWallRect(ctx, fx, fy, 5, z0, 2, 5, OUT);
    rightWallRect(ctx, fx, fy, 4, z0 + 2, 4, 1, OUT);
    rightWallRect(ctx, fx, fy, 5, z0 + 2, 1, 1, '#ffd54f'); // torchlight glint
  }

  // Overhanging corbeled parapet platform at top of shaft
  const topFy = fy - shaftH + 1;
  isoBox(ctx, fx, topFy, 14, 14, 4, {
    top: '#9e7668',
    left: '#593e35',
    right: '#7d594d',
  });
  // Recessed dark roof walk inside parapet
  isoDiamond(ctx, 32, topFy - 11, 10, '#3b2c27', OUT);

  // Crenellated battlements (merlons around the top rim, drawn back-to-front)
  const merlonColors = {
    top: '#ad8475',
    left: '#593e35',
    right: '#855f52',
  };
  const merlons: readonly (readonly [number, number, number, number])[] = [
    [32, topFy - 11, 4, 4], // back corner merlon
    [25, topFy - 7, 4, 3],  // back-left merlon
    [39, topFy - 7, 3, 4],  // back-right merlon
    [21, topFy - 5, 3, 3],  // left corner merlon
    [43, topFy - 5, 3, 3],  // right corner merlon
    [26, topFy - 2, 4, 3],  // front-left merlon
    [38, topFy - 2, 3, 4],  // front-right merlon
    [32, topFy, 4, 4],      // front corner merlon
  ];
  for (const [mx, my, mL, mR] of merlons) {
    isoBox(ctx, mx, my - 4, mL, mR, 3, merlonColors);
  }

  return canvasToTexture(canvas);
}

export function disc(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, color: string): void {
  for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) if (x * x + y * y <= r * r + r / 2) px(ctx, cx + x, cy + y, color);
}

function buildTreeTexture(frame: number): Texture {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);
  isoDiamond(ctx, 32, 50, 10, '#27412c');
  rect(ctx, 30, 40, 4, 14, '#5d4037'); rect(ctx, 30, 40, 1, 14, '#3e2a24');
  const sway = frame ? 1 : 0;
  disc(ctx, 32 + sway, 31, 10, OUT); disc(ctx, 32 + sway, 31, 9, '#2e7d32');
  disc(ctx, 28 + sway, 35, 6, '#388e3c'); disc(ctx, 37 + sway, 35, 6, '#2e7d32');
  disc(ctx, 31 + sway, 26, 6, '#66bb6a'); disc(ctx, 35 + sway, 29, 3, '#81c784');
  px(ctx, 28 + sway, 31, '#c8e6c9'); px(ctx, 33 + sway, 24, '#c8e6c9');
  return canvasToTexture(canvas);
}

function buildLampTexture(frame: number): Texture {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);
  isoDiamond(ctx, 32, 50, 9, '#4b5563', OUT);
  rect(ctx, 30, 24, 4, 3, OUT); rect(ctx, 31, 26, 2, 26, '#37474f'); rect(ctx, 31, 26, 1, 26, '#263238');
  isoBox(ctx, 33, 31, 4, 4, 5, { top: '#fff59d', left: '#f9a825', right: '#ffd54f' });
  const g = frame ? '#fff9c466' : '#fff9c433';
  disc(ctx, 32, 24, frame ? 9 : 8, g);
  return canvasToTexture(canvas);
}

function buildFountainTexture(frame: number): Texture {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);
  isoDiamond(ctx, 32, 46, 26, '#6b7280', OUT);
  isoDiamond(ctx, 32, 46, 21, '#9ca3af');
  isoDiamond(ctx, 32, 46, 17, frame ? '#4fc3f7' : '#29b6f6');
  isoDiamond(ctx, 32, 46, 11, frame ? '#81d4fa' : '#4fc3f7');
  rect(ctx, 30, 30, 4, 18, '#9ca3af'); rect(ctx, 30, 30, 1, 18, '#6b7280');
  isoDiamond(ctx, 32, 31, 7, '#cfd8dc', OUT);
  const jets: [number, number][] = frame ? [[32, 20], [31, 22], [33, 22], [29, 26], [35, 26]] : [[32, 22], [31, 24], [33, 24], [28, 27], [36, 27]];
  for (const [x, y] of jets) rect(ctx, x, y, 1, 3, '#e1f5fe');
  return canvasToTexture(canvas);
}

function buildStatueTexture(): Texture {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);
  isoDiamond(ctx, 32, 48, 22, '#5a6470', OUT);
  isoBox(ctx, 32, 56, 12, 12, 8, { top: '#cfd8dc', left: '#78909c', right: '#b0bec5' });
  rect(ctx, 29, 24, 6, 22, OUT); rect(ctx, 30, 25, 4, 20, '#cfd8dc'); rect(ctx, 30, 25, 1, 20, '#90a4ae');
  rect(ctx, 26, 28, 12, 3, OUT); rect(ctx, 27, 29, 10, 1, '#cfd8dc'); // arms
  disc(ctx, 32, 20, 4, OUT); disc(ctx, 32, 20, 3, '#eceff1');
  px(ctx, 36, 14, '#ffd54f'); rect(ctx, 33, 14, 3, 1, '#ffd54f'); // laurel crown
  return canvasToTexture(canvas);
}

function buildLumberTexture(frame: number): Texture {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);
  isoDiamond(ctx, 32, 48, 26, '#6d5a3a', OUT);
  isoBox(ctx, 28, 52, 14, 14, 10, { top: '#b0875a', left: '#5d4326', right: '#7d5a35' });
  isoPitchedRoof(ctx, 28, 52, 16, 16, 10, 6, { leftSlope: '#5d4326', rightSlope: '#7d5a35', gable: '#a1783f', ridge: '#3e2a24' });
  // log pile
  for (let i = 0; i < 4; i++) { disc(ctx, 44 + (i % 2) * 5, 55 - i, 3, OUT); disc(ctx, 44 + (i % 2) * 5, 55 - i, 2, i % 2 ? '#c49a62' : '#a77d4a'); }
  // saw blade spin
  rect(ctx, 12 + frame, 44, 8, 1, '#cfd8dc'); rect(ctx, 14 - frame, 45, 4, 1, '#90a4ae');
  return canvasToTexture(canvas);
}

function buildMineTexture(frame: number): Texture {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);
  isoDiamond(ctx, 32, 48, 26, '#4b5563', OUT);
  disc(ctx, 32, 38, 15, OUT); disc(ctx, 32, 38, 14, '#78909c'); disc(ctx, 27, 34, 9, '#90a4ae'); disc(ctx, 38, 36, 8, '#607d8b');
  rect(ctx, 27, 40, 11, 12, OUT); rect(ctx, 28, 41, 9, 11, '#1b1f24'); // tunnel mouth
  rect(ctx, 26, 39, 13, 2, '#8d6e3f'); rect(ctx, 26, 40, 2, 12, '#6d5430'); rect(ctx, 37, 40, 2, 12, '#6d5430'); // timber frame
  px(ctx, 24, 36, frame ? '#80deea' : '#26c6da'); px(ctx, 40, 33, frame ? '#26c6da' : '#80deea'); px(ctx, 33, 30, '#80deea'); // ore glints
  // minecart on rails
  rect(ctx, 30, 55, 12, 1, '#cfd8dc'); isoBox(ctx, 38, 56, 4, 4, 3, { top: '#455a64', left: '#263238', right: '#37474f' });
  return canvasToTexture(canvas);
}

/** Build a complete sprite bank for an arc (null = default look). The caller owns it and must destroy it. */
/**
 * Third-wave buildings: art from lib/sprites-wave3{a,b,c}.ts; any kind not drawn there yet
 * borrows the nearest existing sprite.
 */
function wave3Shared(): Record<Exclude<BuildingKind, BaseKind>, () => Texture[]> {
  const like = (f: () => Texture[]) => f;
  const house = () => [buildHouseTexture()], shop = () => [buildShopTexture()], farm = () => [buildFarmTexture()];
  const factory = () => [buildFactoryTexture(0), buildFactoryTexture(1), buildFactoryTexture(2)];
  const park = () => [buildParkTexture(0), buildParkTexture(1)], tower = () => [buildTowerTexture()];
  const barracks = () => [buildBarracksTexture(0), buildBarracksTexture(1)], statue = () => [buildStatueTexture()];
  const tree = () => [buildTreeTexture(0), buildTreeTexture(1)], fountain = () => [buildFountainTexture(0), buildFountainTexture(1)];
  const school = () => [buildSchoolTexture(0), buildSchoolTexture(1)];
  const c = (b: () => HTMLCanvasElement) => () => [canvasToTexture(b())];
  const fallback: Record<Exclude<BuildingKind, BaseKind>, () => Texture[]> = {
    cottage: like(house), longhouse: c(buildRowhouseTexture), tenement: c(buildRowhouseTexture), villa: c(buildManorTexture), highrise: c(buildBankTexture),
    bakery: c(buildStallTexture), teahouse: like(shop), tailor: like(shop), bazaar: c(buildStallTexture), tradeguild: c(buildBankTexture),
    fishery: like(farm), windmill: like(farm), sawmill: () => [buildLumberTexture(0), buildLumberTexture(1)], smelter: () => [buildMineTexture(0), buildMineTexture(1)],
    crafthall: () => [canvasToTexture(buildWorkshopTexture(0))], foundry: like(factory),
    shrine: c(buildLibraryTexture), garden: like(park), theater: c(buildLibraryTexture), observatory: like(school), hospital: c(buildClinicTexture), university: () => [canvasToTexture(buildAcademyTexture(0))],
    palisade: like(barracks), watchtower: like(tower), armory: like(barracks), warcamp: like(barracks), fortress: like(tower),
    flowerbed: like(tree), hedge: like(tree), well: like(fountain), pond: like(fountain), arch: like(statue),
    moontree: like(tree), suntemple: like(statue), stones: like(statue), emberthrone: like(statue), scrapspire: like(tower),
  };
  const drawn = { ...art3a, ...art3b, ...art3c };
  for (const k of Object.keys(fallback) as Exclude<BuildingKind, BaseKind>[]) {
    const f = drawn[k];
    if (f) fallback[k] = () => f().map(canvasToTexture);
  }
  return fallback;
}
type BaseKind = 'house' | 'farm' | 'shop' | 'factory' | 'school' | 'park' | 'barracks' | 'tower' | 'tree' | 'lamp' | 'fountain' | 'statue' | 'lumber' | 'mine'
  | 'rowhouse' | 'manor' | 'stall' | 'tavern' | 'bank' | 'library' | 'academy' | 'clinic' | 'workshop';

export function buildSpriteBank(arc: ArcId | null): SpriteBank {
  const art: ArcArt = (arc && ARC_ART[arc]) || {};
  const raw = (c: HTMLCanvasElement) => { const keep = themeFilter; themeFilter = null; try { return canvasToTexture(c); } finally { themeFilter = keep; } };
  themeFilter = arc ? ARC_FILTER[arc] : null;
  try {
    const ground: Texture[][] = [0, 1].map((par) =>
      [0, 1, 2, 3].map((v) => (art.ground ? raw(art.ground(par as 0 | 1, v)) : buildGroundVariant(par as 0 | 1, v))));
    const foundation = art.foundation ? raw(art.foundation()) : buildFoundationTexture();
    const shared: Record<BuildingKind, () => Texture[]> = {
      house: () => [buildHouseTexture()],
      farm: () => [buildFarmTexture()],
      shop: () => [buildShopTexture()],
      factory: () => [buildFactoryTexture(0), buildFactoryTexture(1), buildFactoryTexture(2)],
      school: () => [buildSchoolTexture(0), buildSchoolTexture(1)],
      park: () => [buildParkTexture(0), buildParkTexture(1)],
      barracks: () => [buildBarracksTexture(0), buildBarracksTexture(1)],
      tower: () => [buildTowerTexture()],
      tree: () => [buildTreeTexture(0), buildTreeTexture(1)],
      lamp: () => [buildLampTexture(0), buildLampTexture(1)],
      fountain: () => [buildFountainTexture(0), buildFountainTexture(1)],
      statue: () => [buildStatueTexture()],
      lumber: () => [buildLumberTexture(0), buildLumberTexture(1)],
      mine: () => [buildMineTexture(0), buildMineTexture(1)],
      rowhouse: () => [canvasToTexture(buildRowhouseTexture())],
      manor: () => [canvasToTexture(buildManorTexture())],
      stall: () => [canvasToTexture(buildStallTexture())],
      tavern: () => [canvasToTexture(buildTavernTexture(0)), canvasToTexture(buildTavernTexture(1))],
      bank: () => [canvasToTexture(buildBankTexture())],
      library: () => [canvasToTexture(buildLibraryTexture())],
      academy: () => [canvasToTexture(buildAcademyTexture(0)), canvasToTexture(buildAcademyTexture(1))],
      clinic: () => [canvasToTexture(buildClinicTexture())],
      workshop: () => [
        canvasToTexture(buildWorkshopTexture(0)),
        canvasToTexture(buildWorkshopTexture(1)),
        canvasToTexture(buildWorkshopTexture(2)),
      ],
      ...wave3Shared(),
    };
    // Buildings are drawn on first use, not all 60 up front: the landing island needs only a few dozen
    // and the first frame no longer waits for the rest. The people's colour filter is reapplied for each one.
    const filter = themeFilter;
    const made = new Map<BuildingKind, Texture[]>();
    const make = (k: BuildingKind): Texture[] => {
      const pop = arc ? BUILDING_POP[arc] : null;
      const keep = themeFilter; themeFilter = [filter, pop].filter(Boolean).join(' ') || null;
      try {
        // rendered art (tools/blender, public/art) wins over the drawings when this people has it
        const rendered = arc ? paintedFrames(arc, k) : undefined;
        if (rendered) return rendered.map(raw);
        const custom = art.buildings?.[k];
        if (!custom) return shared[k]();
        themeFilter = pop; // the people's own drawings keep their colours, brightened
        return custom().map((c) => canvasToTexture(c));
      } finally { themeFilter = keep; }
    };
    const buildings = {} as Record<BuildingKind, Texture[]>;
    for (const k of BUILDING_KINDS) {
      Object.defineProperty(buildings, k, {
        enumerable: true,
        get: () => { let t = made.get(k); if (!t) { t = make(k); made.set(k, t); } return t; },
      });
    }
    // rendered (Blender) walkers win over the pixel drawings when this people has them (64x96, shown at 16x24)
    const walker = (name: string, draw: (f: number) => HTMLCanvasElement): Texture[] => {
      const r = arc ? paintedPeople(arc, name) : undefined;
      return r && r.length >= WALK_FRAMES + 1 ? r.map(raw) : Array.from({ length: WALK_FRAMES + 1 }, (_, f) => raw(draw(f)));
    };
    const citizens = Array.from({ length: SPECIES_COUNT }, (_, v) =>
      (['front', 'back'] as const).map((view) => walker(`cit_${v}_${view}`, (f) => drawCitizen(arc, v, view, f))));
    const badges: [Texture, Texture] = [raw(buildBadgeTexture(2)), raw(buildBadgeTexture(3))];
    const soldiers = (['front', 'back'] as const).map((view) => walker(`sol_${view}`, (f) => drawSoldier(arc, view, f)));
    const arcFilter = arc ? ADDON_FILTER[arc] : null;
    const levelCache = new Map<string, Texture[]>();
    const levelFrames = (kind: BuildingKind, level: number): Texture[] => {
      if (level <= 1 || !canUpgrade(kind)) return buildings[kind];
      const lv: 2 | 3 = level >= 3 ? 3 : 2;
      const key = `${kind}@${lv}`;
      const hit = levelCache.get(key);
      if (hit) return hit;
      const painted = arc ? paintedFrames(arc, key) : undefined;
      if (painted && painted.length > 0) {
        const frames = painted.map(raw);
        levelCache.set(key, frames);
        return frames;
      }
      // rendered (Blender) art keeps its look at every level: the pixel add-ons clash with it, and the
      // gold level pips already say the level
      const base = buildings[kind];
      if ((base[0]?.source.resource as HTMLCanvasElement | undefined)?.dataset?.smooth === '1') return base;
      const frames = buildings[kind].map((baseTex, f) =>
        raw(buildLevelCanvas(baseTex.source.resource as HTMLCanvasElement, kind, lv, f, arcFilter)),
      );
      levelCache.set(key, frames);
      return frames;
    };
    return { ground, foundation, buildings, built: made, citizens, badges, soldiers, levelFrames, levelCache };
  } finally {
    themeFilter = null;
  }
}

export function destroySpriteBank(bank: SpriteBank): void {
  // PixiJS v8 Texture.destroy(true) destroys both the Texture view and its underlying CanvasSource
  // Source: https://pixijs.download/v8.22.0/docs/rendering.Texture.html#destroy
  for (const row of bank.ground) for (const tex of row) tex.destroy(true);
  bank.foundation.destroy(true);
  for (const frames of bank.built.values()) for (const tex of frames) tex.destroy(true);
  bank.built.clear();
  for (const frames of bank.levelCache.values()) for (const tex of frames) tex.destroy(true);
  bank.levelCache.clear();
  for (const sp of bank.citizens) for (const view of sp) for (const tex of view) tex.destroy(true);
  for (const tex of bank.badges) tex.destroy(true);
  for (const view of bank.soldiers) for (const tex of view) tex.destroy(true);
}
