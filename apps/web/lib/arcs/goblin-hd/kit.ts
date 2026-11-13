// Goblin HD kit: the shared palette and drawing helpers for the 2x Goblin art.
// Every Goblin HD sprite is a 128x128 canvas (shown at half scale, so it fills one 64 px tile).
// The ground diamond sits at y = 64..127 with its top vertex at (64, 64), left (0, 96), right (128, 96),
// bottom (64, 128). Same isometric 2:1 projection as the 1x art, twice the pixels.
//
// Look: a sunny, lush day like a classic medieval city builder, made by goblins. Warm stone and dark
// timber, moss-green shingle roofs patched with rusty tin, brass and riveted iron, green skull banners,
// warm lit windows. Light comes from the top: roofs and tops are brightest, the right wall is lit, the
// left wall is in shade, and a soft shadow falls on the ground. Crisp pixels only: no smoothing,
// no gradients, no ctx.filter, no images.
import { isoBox, isoDiamond, isoPitchedRoof, leftWallRect, makeCanvas, px, rect, rightWallRect, tileHash } from '../../sprites';

export const HD = 128;
/** The tile's front (bottom) vertex and its centre. */
export const TILE_FX = 64, TILE_FY = 127, TILE_CY = 96;

export const G = {
  out: '#22180f',
  shadow: 'rgba(24,36,12,0.34)',
  // ground
  grass: '#5d9b3a', grassDark: '#4a8230', grassLight: '#78b84a', grassTip: '#94cc5c',
  dirt: '#a67e4e', dirtDark: '#8a6640', dirtLight: '#c09864',
  cobble: '#a29b8e', cobbleDark: '#7f786d', cobbleLight: '#bfb8ab',
  // stone
  stoneTop: '#c4bcae', stoneR: '#a39b8c', stoneL: '#7d7668', mortar: '#615a4f', stoneDark: '#5a5448',
  // timber
  woodTop: '#a86e3c', woodR: '#8a5a30', woodL: '#6a4324', woodDark: '#4a2e1a', woodLight: '#c08450',
  // mud plaster (goblin daub)
  daubR: '#cfae70', daubL: '#a8874f', daubDark: '#8a6c3e',
  // moss shingle roof
  mossR: '#64953c', mossL: '#4a7430', mossRidge: '#82b04e', mossLine: '#3a5a26', mossLight: '#9cc860',
  // rusty tin
  rustR: '#c05c2c', rustL: '#94431f', rustLight: '#de7a44', rustDark: '#6e2e14',
  // metal
  ironTop: '#a2acb4', ironR: '#7e8892', ironL: '#5c646c', ironDark: '#3e444a', rivet: '#d4d8dc',
  brass: '#d0a040', brassLight: '#f0cc6a', brassDark: '#8a6422',
  // banner, bone, glow
  banner: '#3f9a2f', bannerDark: '#2b6e20', bannerLight: '#62c04a',
  bone: '#efe7d4', boneShade: '#c4baa4',
  glow: '#ffd47a', glowHot: '#fff0b8', glowDeep: '#ffa847',
  toxic: '#9ce03a', toxicLight: '#d8ff6a',
  smoke: '#e8e6e0', smokeShade: '#bcb8b0',
  leaf: '#4e8a2e', leafDark: '#3a6a22', leafLight: '#78b444',
} as const;

export type Ctx = CanvasRenderingContext2D;
export const canvasHD = () => makeCanvas(HD, HD);

// ---------- ground ----------
/** A grass tile (128x64 canvas, diamond with no outline) for the city ground. */
export function grassTile(variant: number): HTMLCanvasElement {
  const [cv, ctx] = makeCanvas(HD, 64);
  isoDiamond(ctx, 64, 32, 64, G.grass);
  for (let u = 1; u < 63; u++) for (let v = 1; v < 63; v++) {
    const h = tileHash(u, v, variant * 13 + 3) % 37;
    const sx = 64 + (u - v), sy = (u + v) >> 1;
    if (h < 3) rect(ctx, sx - 1, sy, 2, 1, G.grassDark);
    else if (h < 5) rect(ctx, sx - 1, sy, 2, 1, G.grassLight);
    else if (h === 5) { px(ctx, sx, sy - 1, G.grassTip); px(ctx, sx, sy, G.grassLight); }
  }
  // a few flowers or pebbles per variant
  const spots = variant === 1 ? ['#f4e04a', '#fff8d0'] : variant === 2 ? ['#f08ab4', '#8ad0ff'] : variant === 3 ? ['#bdb6a8', '#8c867a'] : [];
  for (let i = 0; i < spots.length * 3; i++) {
    const h = tileHash(i, variant, 77);
    const u = 8 + (h % 48), v = 8 + ((h >>> 8) % 48);
    const sx = 64 + (u - v), sy = (u + v) >> 1;
    px(ctx, sx, sy + 1, G.grassDark); px(ctx, sx, sy, spots[i % spots.length]!);
  }
  return cv;
}

/** A packed-dirt pad with cobbles at the rim, under a building (128x64 canvas). */
export function padTile(): HTMLCanvasElement {
  const [cv, ctx] = makeCanvas(HD, 64);
  isoDiamond(ctx, 64, 32, 64, G.grass);
  isoDiamond(ctx, 64, 32, 58, G.cobbleDark);
  isoDiamond(ctx, 64, 32, 55, G.dirt);
  for (let u = 4; u < 60; u++) for (let v = 4; v < 60; v++) {
    const h = tileHash(u, v, 41) % 29;
    const sx = 64 + (u - v), sy = (u + v) >> 1;
    if (Math.abs(u - v) > 50 || u + v > 112 || u + v < 14) continue;
    if (h < 3) rect(ctx, sx - 1, sy, 2, 1, G.dirtDark);
    else if (h < 5) rect(ctx, sx - 1, sy, 2, 1, G.dirtLight);
  }
  // cobble ring
  for (let i = 0; i < 40; i++) {
    const t = i / 40, a = t * Math.PI * 2;
    const sx = Math.round(64 + Math.cos(a) * 53), sy = Math.round(32 + Math.sin(a) * 26);
    rect(ctx, sx - 2, sy - 1, 4, 2, i % 3 ? G.cobble : G.cobbleLight);
    px(ctx, sx - 2, sy + 1, G.cobbleDark);
  }
  return cv;
}

// ---------- shadow and boxes ----------
/** Soft ground shadow for a box footprint, falling to the left (the shaded side). */
export function groundShadow(ctx: Ctx, fx: number, fy: number, wL: number, wR: number, reach = 10) {
  ctx.fillStyle = G.shadow;
  for (let u = 0; u < wL + reach; u++) {
    const x = fx - 1 - u, yBot = fy - (u >> 1) + 2;
    const top = yBot - Math.min(wR >> 1, reach + 2);
    ctx.fillRect(x, top, 1, yBot - top + 1);
  }
}

export interface Mat { top: string; left: string; right: string }
export const STONE: Mat = { top: G.stoneTop, left: G.stoneL, right: G.stoneR };
export const WOOD: Mat = { top: G.woodTop, left: G.woodL, right: G.woodR };
export const DAUB: Mat = { top: G.daubR, left: G.daubL, right: G.daubR };
export const IRON: Mat = { top: G.ironTop, left: G.ironL, right: G.ironR };

/** A box with an outline; `fx, fy` is the front-bottom vertex (see sprites.isoBox). */
export function box(ctx: Ctx, fx: number, fy: number, wL: number, wR: number, h: number, m: Mat) {
  isoBox(ctx, fx, fy, wL, wR, h, { top: m.top, left: m.left, right: m.right, outline: G.out });
}

/** Stone courses and staggered joints on both walls of a box. */
export function brickWalls(ctx: Ctx, fx: number, fy: number, wL: number, wR: number, h: number, course = 5, joint = 7) {
  for (let z = course; z < h; z += course) {
    leftWallRect(ctx, fx, fy, 1, z, wL - 2, 1, G.mortar);
    rightWallRect(ctx, fx, fy, 1, z, wR - 2, 1, G.mortar);
  }
  for (let z = 0, row = 0; z < h - 1; z += course, row++) {
    const off = row % 2 ? joint >> 1 : 0;
    for (let u = 2 + off; u < wL - 1; u += joint) leftWallRect(ctx, fx, fy, u, z + 1, 1, Math.min(course - 1, h - z - 1), G.mortar);
    for (let v = 2 + off; v < wR - 1; v += joint) rightWallRect(ctx, fx, fy, v, z + 1, 1, Math.min(course - 1, h - z - 1), G.mortar);
    // sun catches the top of a few stones on the lit wall
    for (let v = 3 + off; v < wR - 2; v += joint * 2) rightWallRect(ctx, fx, fy, v, z + course - 1, 3, 1, G.stoneTop);
  }
}

/** Vertical planks on both walls, with a darker seam every few pixels. */
export function plankWalls(ctx: Ctx, fx: number, fy: number, wL: number, wR: number, h: number, step = 4) {
  for (let u = step; u < wL - 1; u += step) leftWallRect(ctx, fx, fy, u, 1, 1, h - 1, G.woodDark);
  for (let v = step; v < wR - 1; v += step) rightWallRect(ctx, fx, fy, v, 1, 1, h - 1, G.woodDark);
  for (let v = 1; v < wR - 1; v += step) rightWallRect(ctx, fx, fy, v, h - 3, 1, 2, G.woodLight);
}

/** Timber framing (posts and a beam) over plaster walls: the classic half-timbered look. */
export function timberFrame(ctx: Ctx, fx: number, fy: number, wL: number, wR: number, h: number) {
  const beam = Math.floor(h * 0.55);
  leftWallRect(ctx, fx, fy, 0, beam, wL, 2, G.woodL);
  rightWallRect(ctx, fx, fy, 0, beam, wR, 2, G.woodR);
  for (const u of [0, Math.floor(wL / 2), wL - 2]) leftWallRect(ctx, fx, fy, u, 0, 2, h, G.woodDark);
  for (const v of [0, Math.floor(wR / 2), wR - 2]) rightWallRect(ctx, fx, fy, v, 0, 2, h, G.woodL);
  // diagonal braces on the lit wall
  const half = Math.floor(wR / 2);
  for (let k = 0; k < Math.min(half - 2, beam - 1); k++) rightWallRect(ctx, fx, fy, 2 + k, 1 + Math.floor((k * (beam - 2)) / (half - 2)), 1, 2, G.woodR);
}

/** Rivets along the bottom and top of the lit wall. */
export function rivets(ctx: Ctx, fx: number, fy: number, wR: number, h: number, step = 5) {
  for (let v = 2; v < wR - 1; v += step) { rightWallRect(ctx, fx, fy, v, 2, 1, 1, G.rivet); rightWallRect(ctx, fx, fy, v, h - 2, 1, 1, G.rivet); }
}

// ---------- roofs ----------
export interface RoofMat { left: string; right: string; ridge: string; line: string; light: string }
export const MOSS: RoofMat = { left: G.mossL, right: G.mossR, ridge: G.mossRidge, line: G.mossLine, light: G.mossLight };
export const RUST: RoofMat = { left: G.rustL, right: G.rustR, ridge: G.rustLight, line: G.rustDark, light: G.rustLight };

/**
 * A gable roof with shingle rows: see sprites.isoPitchedRoof for the geometry (ridge along the
 * right-up axis). Rows of darker shingle edges run along the ridge, and a light lip catches the sun.
 */
export function roof(ctx: Ctx, fx: number, fy: number, wL: number, wR: number, wallH: number, peakH: number, m: RoofMat, patch = true) {
  isoPitchedRoof(ctx, fx, fy, wL, wR, wallH, peakH, { leftSlope: m.left, rightSlope: m.right, gable: G.daubL, ridge: m.ridge, outline: G.out });
  const topFy = fy - wallH, halfL = wL >> 1;
  for (let v = 1; v < wR - 1; v++) for (let u = 1; u < wL - 1; u++) {
    const d = u < halfL ? halfL - 1 - u : u - halfL;
    if (u === halfL - 1 || u === halfL) continue;
    const rise = Math.max(0, Math.round(((halfL - d) * peakH) / halfL));
    const x = fx - 1 - u + v, y = topFy - ((u + v + 1) >> 1) - rise;
    if (d % 3 === 0) px(ctx, x, y + 1, m.line);              // shingle rows
    else if ((v + d * 2) % 7 === 0) px(ctx, x, y, m.line);   // staggered tile edges
    else if (u < halfL && d % 3 === 1 && (v + u) % 5 === 0) px(ctx, x, y, m.light);
  }
  // a rusty tin patch nailed over a hole: very goblin
  if (patch && wR > 14) {
    const v0 = Math.floor(wR * 0.55), u0 = Math.floor(halfL * 0.3);
    for (let v = v0; v < v0 + 6; v++) for (let u = u0; u < u0 + 4; u++) {
      const d = halfL - 1 - u, rise = Math.round(((halfL - d) * peakH) / halfL);
      px(ctx, fx - 1 - u + v, topFy - ((u + v + 1) >> 1) - rise, (u + v) % 4 ? G.rustR : G.rustLight);
    }
    px(ctx, fx - 1 - u0 + v0, topFy - ((u0 + v0 + 1) >> 1) - Math.round(((u0 + 1) * peakH) / halfL), G.rivet);
  }
  // the gable gets planks
  for (let u = 2; u < wL - 2; u += 3) {
    const d = u < halfL ? halfL - 1 - u : u - halfL;
    const rise = Math.max(0, Math.round(((halfL - d) * peakH) / halfL));
    if (rise > 2) leftWallRect(ctx, fx, fy, u, wallH, 1, rise - 1, G.daubDark);
  }
}

// ---------- details on walls (u/v along the wall, z up from the ground) ----------
/** A warm lit window on the right (lit) wall. */
export function windowR(ctx: Ctx, fx: number, fy: number, v0: number, z0: number, w = 5, h = 7, lit = true) {
  rightWallRect(ctx, fx, fy, v0 - 1, z0 - 1, w + 2, h + 2, G.woodDark);
  rightWallRect(ctx, fx, fy, v0, z0, w, h, lit ? G.glow : '#3a4a5a');
  if (lit) { rightWallRect(ctx, fx, fy, v0, z0 + h - 2, w, 2, G.glowHot); rightWallRect(ctx, fx, fy, v0 + (w >> 1), z0, 1, h, G.woodDark); }
  rightWallRect(ctx, fx, fy, v0 - 1, z0 - 2, w + 2, 1, G.woodLight); // sill
}
/** A window on the left (shaded) wall. */
export function windowL(ctx: Ctx, fx: number, fy: number, u0: number, z0: number, w = 5, h = 7, lit = true) {
  leftWallRect(ctx, fx, fy, u0 - 1, z0 - 1, w + 2, h + 2, G.woodDark);
  leftWallRect(ctx, fx, fy, u0, z0, w, h, lit ? G.glowDeep : '#2a3440');
  if (lit) leftWallRect(ctx, fx, fy, u0, z0 + h - 2, w, 2, G.glow);
  leftWallRect(ctx, fx, fy, u0 + (w >> 1), z0, 1, h, G.woodDark);
}
/** An arched plank door on the right wall. */
export function doorR(ctx: Ctx, fx: number, fy: number, v0: number, w = 7, h = 12) {
  rightWallRect(ctx, fx, fy, v0 - 1, 0, w + 2, h + 1, G.out);
  rightWallRect(ctx, fx, fy, v0, 0, w, h - 1, G.woodL);
  rightWallRect(ctx, fx, fy, v0 + 1, h - 1, w - 2, 1, G.woodL);
  for (let k = 2; k < w; k += 2) rightWallRect(ctx, fx, fy, v0 + k, 0, 1, h - 2, G.woodDark);
  rightWallRect(ctx, fx, fy, v0, 3, w, 1, G.ironL); rightWallRect(ctx, fx, fy, v0, h - 4, w, 1, G.ironL);
  rightWallRect(ctx, fx, fy, v0 + w - 2, 5, 1, 1, G.brassLight);
}
/** A door on the left wall. */
export function doorL(ctx: Ctx, fx: number, fy: number, u0: number, w = 7, h = 12) {
  leftWallRect(ctx, fx, fy, u0 - 1, 0, w + 2, h + 1, G.out);
  leftWallRect(ctx, fx, fy, u0, 0, w, h - 1, G.woodDark);
  for (let k = 2; k < w; k += 2) leftWallRect(ctx, fx, fy, u0 + k, 0, 1, h - 2, '#3a2414');
  leftWallRect(ctx, fx, fy, u0, 3, w, 1, G.ironDark);
}

// ---------- props ----------
export function disc(ctx: Ctx, cx: number, cy: number, r: number, color: string) {
  for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) if (x * x + y * y <= r * r + r / 2) px(ctx, cx + x, cy + y, color);
}

/** A chimney of stone; returns the top centre for smoke. */
export function chimney(ctx: Ctx, x: number, yBase: number, h: number): { x: number; y: number } {
  box(ctx, x + 3, yBase, 5, 5, h, STONE);
  rect(ctx, x - 3, yBase - h - 4, 8, 2, G.stoneDark);
  return { x: x + 1, y: yBase - h - 5 };
}

/** Three puffs of smoke rising from (x, y); `frame` 0..2 moves them up and out. */
export function smoke(ctx: Ctx, x: number, y: number, frame: number) {
  const puffs = [[0, 0, 3], [2, -7, 4], [5, -15, 5]] as const;
  for (let i = 0; i < puffs.length; i++) {
    const [dx, dy, r] = puffs[i]!;
    const lift = frame * 3, drift = frame + i;
    const cx = x + dx + drift, cy = y + dy - lift;
    disc(ctx, cx, cy, r + 1, G.smokeShade);
    disc(ctx, cx - 1, cy - 1, r, G.smoke);
  }
}

/** A green goblin banner with a skull on a pole; frame 0..2 waves the cloth. */
export function banner(ctx: Ctx, x: number, yBase: number, h: number, frame: number, flip = false) {
  rect(ctx, x - 1, yBase - h, 3, h + 1, G.out);
  rect(ctx, x, yBase - h + 1, 1, h, G.woodLight);
  disc(ctx, x, yBase - h - 1, 2, G.brass);
  const dir = flip ? -1 : 1, w = 10, ch = 13;
  for (let i = 0; i < w; i++) {
    const wave = Math.round(Math.sin((i + frame * 2) * 0.7) * 1.5);
    const cx = x + dir * (i + 1), top = yBase - h + 1 + wave;
    const len = ch - (i > w - 3 ? (i - (w - 3)) * 2 : 0);
    rect(ctx, cx, top - 1, 1, len + 2, G.out);
    rect(ctx, cx, top, 1, len, i < 2 ? G.bannerDark : (i + frame) % 5 === 0 ? G.bannerLight : G.banner);
  }
  // the skull emblem
  const sx = x + dir * 5, sy = yBase - h + 5 + Math.round(Math.sin((5 + frame * 2) * 0.7) * 1.5);
  rect(ctx, sx - 2, sy, 4, 3, G.bone); rect(ctx, sx - 1, sy + 3, 2, 1, G.bone);
  px(ctx, sx - 1, sy + 1, G.out); px(ctx, sx + 1, sy + 1, G.out);
}

export function crate(ctx: Ctx, fx: number, fy: number, s = 7) {
  box(ctx, fx, fy, s, s, s, { top: G.woodLight, left: G.woodL, right: G.woodR });
  rightWallRect(ctx, fx, fy, 0, s >> 1, s, 1, G.woodDark);
  leftWallRect(ctx, fx, fy, 0, s >> 1, s, 1, G.woodDark);
}

export function barrel(ctx: Ctx, x: number, yBase: number, glow = false) {
  rect(ctx, x - 4, yBase - 11, 9, 12, G.out);
  rect(ctx, x - 3, yBase - 10, 7, 10, G.woodR);
  rect(ctx, x - 3, yBase - 10, 2, 10, G.woodL);
  rect(ctx, x + 2, yBase - 10, 1, 10, G.woodLight);
  rect(ctx, x - 3, yBase - 8, 7, 1, G.ironL); rect(ctx, x - 3, yBase - 3, 7, 1, G.ironL);
  if (glow) { rect(ctx, x - 3, yBase - 11, 7, 1, G.toxic); px(ctx, x - 1, yBase - 12, G.toxicLight); }
}

/** A brass cog of radius r (outer teeth), for scrap-tech details. */
export function gear(ctx: Ctx, cx: number, cy: number, r: number, frame = 0) {
  disc(ctx, cx, cy, r + 1, G.out);
  disc(ctx, cx, cy, r, G.brass);
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2 + frame * 0.39;
    px(ctx, Math.round(cx + Math.cos(a) * (r + 1)), Math.round(cy + Math.sin(a) * (r + 1)), G.brassDark);
  }
  disc(ctx, cx, cy, Math.max(1, r - 2), G.brassLight);
  disc(ctx, cx, cy, Math.max(1, (r >> 1) - 1), G.brassDark);
}

/** A round bush with sunlit top. */
export function bush(ctx: Ctx, cx: number, by: number, r: number) {
  disc(ctx, cx, by - r, r + 1, G.out);
  disc(ctx, cx, by - r, r, G.leaf);
  disc(ctx, cx + 1, by - r + 2, r - 2, G.leafDark);
  disc(ctx, cx - 1, by - r - 1, Math.max(1, r - 3), G.leafLight);
}

/** Small scrap heap: plates, a pipe and a gear. */
export function scrap(ctx: Ctx, cx: number, by: number, salt = 1) {
  const cols = [G.ironR, G.ironL, G.rustR, G.rustL, G.ironTop];
  for (let i = 0; i < 6; i++) {
    const h = tileHash(i, salt, 9);
    const w = 3 + (h % 5), hh = 2 + ((h >>> 4) % 3), x = cx - 7 + ((h >>> 8) % 12), y = by - 2 - i - ((h >>> 12) % 2);
    rect(ctx, x - 1, y - 1, w + 2, hh + 2, G.out); rect(ctx, x, y, w, hh, cols[(h >>> 16) % cols.length]!);
  }
  gear(ctx, cx + 3, by - 9, 3);
}

/** Spiked wooden stakes in a row along the ground (x0..x1), leaning a little. */
export function stakes(ctx: Ctx, x0: number, x1: number, yBase: number, slope: number, h = 9) {
  for (let x = x0, i = 0; x <= x1; x += 4, i++) {
    const y = Math.round(yBase + (x - x0) * slope), hh = h + (i % 2) * 2;
    rect(ctx, x - 1, y - hh - 1, 3, hh + 2, G.out);
    rect(ctx, x, y - hh, 1, hh, G.woodR); px(ctx, x, y - hh, G.bone);
  }
}
