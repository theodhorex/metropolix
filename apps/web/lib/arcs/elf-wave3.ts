import type { BuildingKind } from '@metropolix/sim';
import {
  disc,
  isoBox,
  isoDiamond,
  isoPitchedRoof,
  leftWallRect,
  makeCanvas,
  OUT,
  px,
  rect,
  rightWallRect,
  SPRITE_H,
  SPRITE_W,
} from '../sprites';

// ELF PALETTE: deep emerald, leaf green, bark brown, ivory, soft gold, silver-blue lantern glow
const EMERALD_DARK = '#14382d';
const EMERALD_MID = '#1e5242';
const EMERALD_LIGHT = '#2c735c';
const LEAF_DARK = '#1e4d2b';
const LEAF_MID = '#2e6f40';
const LEAF_LIGHT = '#489c5c';
const LEAF_HIGHLIGHT = '#7ed992';
const BARK_DARK = '#3b2316';
const BARK_MID = '#593724';
const BARK_LIGHT = '#784d35';
const IVORY_DARK = '#b8b2a6';
const IVORY_MID = '#dbd5c7';
const IVORY_LIGHT = '#f5f1e6';
const GOLD_DARK = '#8f6f1d';
const GOLD_MID = '#c79f32';
const GOLD_LIGHT = '#f5d76e';
const LANTERN_CORE = '#e0fbff';
const LANTERN_MID = '#7ce0f7';
const LANTERN_DIM = '#3ba3c4';

/** Draw a curved elven leaf-dome canopy centered at (cx, baseY) with radius rx and height ry. */
function drawElvenCanopy(
  ctx: CanvasRenderingContext2D,
  cx: number,
  baseY: number,
  rx: number,
  ry: number,
  sway = 0,
): void {
  for (let dy = -ry; dy <= 2; dy++) {
    const t = Math.max(0, 1 - (dy * dy) / (ry * ry + 2));
    const span = Math.round(rx * Math.sqrt(t));
    if (span <= 0) continue;
    const x0 = cx + (dy < -ry / 2 ? sway : 0);
    rect(ctx, x0 - span - 1, baseY + dy, (span + 1) * 2, 1, OUT);
    const col =
      dy < -ry * 0.55
        ? LEAF_HIGHLIGHT
        : dy < -ry * 0.2
          ? LEAF_LIGHT
          : dy <= 0
            ? LEAF_MID
            : LEAF_DARK;
    rect(ctx, x0 - span, baseY + dy, span * 2, 1, col);
    if (dy === 1) {
      for (let dx = -span; dx < span; dx += 3) {
        px(ctx, x0 + dx, baseY + dy, GOLD_LIGHT);
      }
    }
  }
  for (const vx of [-rx + 3, -rx / 2, rx / 2 - 1, rx - 4]) {
    const x = Math.round(cx + vx);
    rect(ctx, x, baseY + 2, 1, 4, LEAF_DARK);
    px(ctx, x, baseY + 5, LEAF_LIGHT);
  }
}

/** Draw a hanging silver-blue elven lantern at (lx, ly). */
function drawSilverLantern(ctx: CanvasRenderingContext2D, lx: number, ly: number, frame = 0): void {
  px(ctx, lx, ly - 2, GOLD_MID);
  rect(ctx, lx - 1, ly - 1, 3, 4, OUT);
  rect(ctx, lx - 1, ly, 3, 2, frame % 2 === 0 ? LANTERN_MID : LANTERN_CORE);
  px(ctx, lx, ly, LANTERN_CORE);
  px(ctx, lx, ly + 3, GOLD_LIGHT);
}

/** Draw a slender tapering elven spire with gold finial. */
function drawElvenSpire(
  ctx: CanvasRenderingContext2D,
  cx: number,
  baseY: number,
  halfBase: number,
  height: number,
  leftCol = EMERALD_DARK,
  rightCol = EMERALD_LIGHT,
  finialCol = GOLD_LIGHT,
): void {
  for (let dy = 0; dy < height; dy++) {
    const halfSpan = Math.max(1, Math.round(((height - dy) * halfBase) / height));
    const y = baseY - dy;
    rect(ctx, cx - halfSpan - 1, y, halfSpan * 2 + 2, 1, OUT);
    rect(ctx, cx - halfSpan, y, halfSpan, 1, leftCol);
    rect(ctx, cx, y, halfSpan, 1, rightCol);
  }
  const topY = Math.max(1, baseY - height - 3);
  rect(ctx, cx - 1, topY, 3, 3, OUT);
  rect(ctx, cx, topY, 1, 3, finialCol);
  px(ctx, cx, topY, '#ffffff');
}

/** Draw a waving elven pennant banner on a silver-wood pole. */
function drawElvenBanner(
  ctx: CanvasRenderingContext2D,
  poleX: number,
  poleY: number,
  poleH: number,
  w: number,
  h: number,
  mainCol = LEAF_MID,
  trimCol = GOLD_LIGHT,
  frame = 0,
): void {
  rect(ctx, poleX, poleY, 2, poleH, OUT);
  rect(ctx, poleX + 1, poleY + 1, 1, poleH - 1, IVORY_LIGHT);
  px(ctx, poleX, poleY - 1, GOLD_LIGHT);

  const wave = frame % 2;
  const w1 = Math.max(3, w >> 1);
  const w2 = Math.max(3, w - w1);
  const y1 = poleY + 1 + wave;
  const y2 = poleY + 2 - wave;

  rect(ctx, poleX + 2, y1, w1 + 1, h + 2, OUT);
  rect(ctx, poleX + 2, y1 + 1, w1, h, mainCol);
  rect(ctx, poleX + 3, y1 + 2, Math.max(1, w1 - 2), Math.max(1, h - 2), trimCol);

  rect(ctx, poleX + 2 + w1, y2, w2 + 1, h + 2, OUT);
  rect(ctx, poleX + 2 + w1, y2 + 1, w2, h, mainCol);
  rect(ctx, poleX + 2 + w1, y2 + (h >> 1), Math.max(1, w2 - 1), 1, trimCol);
}

// ============================================================================
// RESIDENTIAL BUILDINGS (cottage, longhouse, tenement, villa, highrise)
// ============================================================================

/** 1. COTTAGE (height 0.8): Cozy living-root & ivory pod home under low sweeping boughs. */
function buildElfCottage(): HTMLCanvasElement[] {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  isoDiamond(ctx, 32, 48, 22, LEAF_DARK, OUT);
  isoDiamond(ctx, 32, 48, 18, LEAF_MID, GOLD_DARK);

  const fx = 32;
  const fy = 55;
  const wL = 12;
  const wR = 14;
  const wallH = 9;

  // Root & bark foundation
  isoBox(ctx, fx, fy, wL, wR, 2, { top: BARK_LIGHT, left: BARK_DARK, right: BARK_MID });
  // Ivory & living wood walls
  isoBox(ctx, fx, fy - 2, wL, wR, wallH - 2, { top: IVORY_LIGHT, left: IVORY_DARK, right: IVORY_MID });
  leftWallRect(ctx, fx, fy, 0, 0, wL, 1, GOLD_DARK);
  rightWallRect(ctx, fx, fy, 0, 0, wR, 1, GOLD_MID);

  // Door on right wall
  rightWallRect(ctx, fx, fy, 2, 1, 3, 5, OUT);
  rightWallRect(ctx, fx, fy, 3, 1, 2, 4, BARK_DARK);
  rightWallRect(ctx, fx, fy, 3, 5, 2, 1, GOLD_LIGHT);
  px(ctx, fx + 4, fy - (4 >> 1) - 3, GOLD_LIGHT);

  // Window on right wall with flowerbox
  rightWallRect(ctx, fx, fy, 7, 3, 5, 4, OUT);
  rightWallRect(ctx, fx, fy, 8, 4, 3, 2, LANTERN_MID);
  px(ctx, fx + 9, fy - (9 >> 1) - 4, LANTERN_CORE);
  rightWallRect(ctx, fx, fy, 7, 2, 5, 1, BARK_MID);
  px(ctx, fx + 7, fy - (7 >> 1) - 2, LANTERN_CORE);
  px(ctx, fx + 9, fy - (9 >> 1) - 2, GOLD_LIGHT);
  px(ctx, fx + 11, fy - (11 >> 1) - 2, LANTERN_MID);

  // Shuttered window on left wall
  leftWallRect(ctx, fx, fy, 4, 3, 4, 4, OUT);
  leftWallRect(ctx, fx, fy, 5, 4, 2, 2, LANTERN_DIM);

  // Low sweeping scalloped leaf canopy
  drawElvenCanopy(ctx, 32, 36, 15, 9, 0);

  // Chimney & lantern
  isoBox(ctx, 35, 34, 3, 3, 5, { top: BARK_LIGHT, left: BARK_DARK, right: BARK_MID });
  drawSilverLantern(ctx, 48, 39, 0);

  return [canvas];
}

/** 2. LONGHOUSE (height 1.0): Sylvan Clan Lodge / Great Bough Hall along right-up axis. */
function buildElfLonghouse(): HTMLCanvasElement[] {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  isoDiamond(ctx, 32, 48, 28, LEAF_DARK, OUT);
  isoDiamond(ctx, 32, 48, 24, '#245237', GOLD_DARK);

  const fx = 28;
  const fy = 57;
  const wL = 12;
  const wR = 26;
  const wallH = 10;

  isoBox(ctx, fx, fy, wL, wR, 2, { top: BARK_LIGHT, left: BARK_DARK, right: BARK_MID });
  isoBox(ctx, fx, fy - 2, wL, wR, wallH - 2, { top: IVORY_LIGHT, left: IVORY_DARK, right: IVORY_MID });

  leftWallRect(ctx, fx, fy, 1, 4, wL - 2, 1, GOLD_DARK);
  rightWallRect(ctx, fx, fy, 1, 4, wR - 2, 1, GOLD_MID);
  leftWallRect(ctx, fx, fy, 0, wallH - 1, wL, 1, BARK_DARK);
  rightWallRect(ctx, fx, fy, 0, wallH - 1, wR, 1, BARK_MID);

  // Gable entrance on front-left
  leftWallRect(ctx, fx, fy, 3, 1, 5, 7, OUT);
  leftWallRect(ctx, fx, fy, 4, 1, 3, 6, BARK_DARK);
  leftWallRect(ctx, fx, fy, 4, 7, 3, 1, GOLD_LIGHT);

  // Side doors along long right wall
  for (const v of [4, 16]) {
    rightWallRect(ctx, fx, fy, v, 1, 4, 6, OUT);
    rightWallRect(ctx, fx, fy, v + 1, 1, 2, 5, EMERALD_MID);
    rightWallRect(ctx, fx, fy, v + 1, 6, 2, 1, GOLD_LIGHT);
  }

  // Slit windows
  for (const v of [10, 22]) {
    rightWallRect(ctx, fx, fy, v, 5, 3, 3, OUT);
    rightWallRect(ctx, fx, fy, v + 1, 6, 1, 1, LANTERN_CORE);
  }

  // Pitched leaf roof
  isoPitchedRoof(ctx, fx, fy, wL + 2, wR + 2, wallH, 10, {
    leftSlope: EMERALD_DARK,
    rightSlope: LEAF_MID,
    gable: IVORY_LIGHT,
    ridge: GOLD_LIGHT,
  });

  // Crossed golden stag-antler finials at front peak
  const peakX = fx - 1 - (wL >> 1);
  const peakY = fy - wallH - ((wL >> 1) >> 1) - 10;
  rect(ctx, peakX - 2, peakY - 4, 1, 5, OUT);
  rect(ctx, peakX + 2, peakY - 4, 1, 5, OUT);
  px(ctx, peakX - 2, peakY - 4, GOLD_LIGHT);
  px(ctx, peakX + 2, peakY - 4, GOLD_LIGHT);
  px(ctx, peakX - 3, peakY - 5, GOLD_LIGHT);
  px(ctx, peakX + 3, peakY - 5, GOLD_LIGHT);

  drawSilverLantern(ctx, fx + 1, fy - 6, 0);

  return [canvas];
}

/** 3. TENEMENT (height 1.8): Ancient Living Willow Spire / Vertical Habitation Boughs. */
function buildElfTenement(): HTMLCanvasElement[] {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  isoDiamond(ctx, 32, 48, 26, EMERALD_DARK, OUT);
  isoDiamond(ctx, 32, 48, 22, '#214e38', GOLD_DARK);

  const fx = 32;
  const fy = 57;
  const wL = 16;
  const wR = 18;
  const wallH = 27;

  isoBox(ctx, fx, fy, wL, wR, 3, { top: BARK_LIGHT, left: BARK_DARK, right: BARK_MID });
  isoBox(ctx, fx, fy - 3, wL, wR, wallH - 3, { top: IVORY_LIGHT, left: IVORY_DARK, right: IVORY_MID });

  leftWallRect(ctx, fx, fy, 1, 10, wL - 2, 1, GOLD_DARK);
  rightWallRect(ctx, fx, fy, 1, 10, wR - 2, 1, GOLD_MID);
  leftWallRect(ctx, fx, fy, 1, 18, wL - 2, 1, GOLD_DARK);
  rightWallRect(ctx, fx, fy, 1, 18, wR - 2, 1, GOLD_MID);

  rightWallRect(ctx, fx, fy, 2, 1, 4, 7, OUT);
  rightWallRect(ctx, fx, fy, 3, 1, 2, 6, EMERALD_MID);
  rightWallRect(ctx, fx, fy, 3, 7, 2, 1, GOLD_LIGHT);

  // 3-floor window grid
  for (const v of [8, 13]) {
    rightWallRect(ctx, fx, fy, v, 3, 3, 4, OUT);
    rightWallRect(ctx, fx, fy, v + 1, 4, 1, 2, LANTERN_CORE);
  }
  for (const v of [3, 8, 13]) {
    rightWallRect(ctx, fx, fy, v, 12, 3, 4, OUT);
    rightWallRect(ctx, fx, fy, v + 1, 13, 1, 2, LANTERN_MID);
  }
  for (const v of [3, 8, 13]) {
    rightWallRect(ctx, fx, fy, v, 20, 3, 4, OUT);
    rightWallRect(ctx, fx, fy, v + 1, 21, 1, 2, LANTERN_CORE);
  }

  for (const u of [4, 10]) {
    for (const z of [4, 12, 20]) {
      leftWallRect(ctx, fx, fy, u, z, 3, 4, OUT);
      leftWallRect(ctx, fx, fy, u + 1, z + 1, 1, 2, LANTERN_DIM);
    }
  }

  // Living-wood balconies on left wall
  leftWallRect(ctx, fx, fy, 3, 10, 8, 1, BARK_LIGHT);
  leftWallRect(ctx, fx, fy, 3, 11, 8, 1, GOLD_DARK);
  leftWallRect(ctx, fx, fy, 3, 18, 8, 1, BARK_LIGHT);
  leftWallRect(ctx, fx, fy, 3, 19, 8, 1, GOLD_DARK);

  // Climbing vines
  leftWallRect(ctx, fx, fy, 7, 2, 1, 20, LEAF_DARK);
  leftWallRect(ctx, fx, fy, 7, 6, 2, 1, LEAF_LIGHT);
  leftWallRect(ctx, fx, fy, 6, 14, 2, 1, LEAF_LIGHT);

  // Rooftop garden canopy
  isoBox(ctx, fx, fy - wallH, wL, wR, 2, { top: EMERALD_MID, left: GOLD_DARK, right: GOLD_LIGHT });
  drawElvenCanopy(ctx, 33, 57 - wallH - 7, 12, 7, 0);
  drawSilverLantern(ctx, 47, 42, 0);

  return [canvas];
}

/** 4. VILLA (height 1.4): Sylvan High Estate / Moonlit Garden Villa. */
function buildElfVilla(): HTMLCanvasElement[] {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  isoDiamond(ctx, 32, 48, 28, LEAF_DARK, OUT);
  isoDiamond(ctx, 32, 48, 24, '#2d6144', GOLD_DARK);

  // Main wing back-left
  const mFx = 29;
  const mFy = 54;
  const mWl = 14;
  const mWr = 10;
  const mH = 14;

  isoBox(ctx, mFx, mFy, mWl, mWr, 2, { top: IVORY_LIGHT, left: IVORY_DARK, right: IVORY_MID });
  isoBox(ctx, mFx, mFy - 2, mWl, mWr, mH - 2, { top: IVORY_LIGHT, left: IVORY_DARK, right: IVORY_MID });
  leftWallRect(ctx, mFx, mFy, 3, 4, 3, 6, OUT);
  leftWallRect(ctx, mFx, mFy, 4, 5, 1, 4, LANTERN_DIM);
  leftWallRect(ctx, mFx, mFy, 8, 4, 3, 6, OUT);
  leftWallRect(ctx, mFx, mFy, 9, 5, 1, 4, LANTERN_DIM);
  isoPitchedRoof(ctx, mFx, mFy, mWl + 2, mWr + 2, mH, 7, {
    leftSlope: EMERALD_DARK,
    rightSlope: LEAF_MID,
    gable: IVORY_LIGHT,
    ridge: GOLD_LIGHT,
  });

  // Cross wing front-right
  const cFx = 39;
  const cFy = 54;
  const cWl = 8;
  const cWr = 12;
  const cH = 12;

  isoBox(ctx, cFx, cFy, cWl, cWr, 2, { top: IVORY_LIGHT, left: IVORY_DARK, right: IVORY_MID });
  isoBox(ctx, cFx, cFy - 2, cWl, cWr, cH - 2, { top: IVORY_LIGHT, left: IVORY_DARK, right: IVORY_MID });
  rightWallRect(ctx, cFx, cFy, 2, 3, 3, 5, OUT);
  rightWallRect(ctx, cFx, cFy, 3, 4, 1, 3, LANTERN_CORE);
  rightWallRect(ctx, cFx, cFy, 7, 3, 3, 5, OUT);
  rightWallRect(ctx, cFx, cFy, 8, 4, 1, 3, LANTERN_MID);
  isoPitchedRoof(ctx, cFx, cFy, cWl + 2, cWr + 2, cH, 6, {
    leftSlope: EMERALD_DARK,
    rightSlope: LEAF_MID,
    gable: IVORY_LIGHT,
    ridge: GOLD_LIGHT,
  });

  // Colonnade
  for (const vCol of [1, 5, 9]) {
    const colX = 26 + vCol;
    const colY = 56 - (vCol >> 1);
    rect(ctx, colX - 1, colY - 7, 2, 8, OUT);
    rect(ctx, colX, colY - 6, 1, 6, IVORY_LIGHT);
    px(ctx, colX, colY - 7, GOLD_LIGHT);
  }

  // Fountain pool
  disc(ctx, 31, 53, 4, OUT);
  disc(ctx, 31, 53, 3, IVORY_LIGHT);
  disc(ctx, 31, 53, 2, LANTERN_MID);
  px(ctx, 31, 52, LANTERN_CORE);

  // Sylvan planters
  rect(ctx, 36, 51, 3, 2, GOLD_DARK);
  rect(ctx, 36, 47, 3, 4, LEAF_LIGHT);
  px(ctx, 37, 48, GOLD_LIGHT);

  drawSilverLantern(ctx, 22, 45, 0);

  return [canvas];
}

/** 5. HIGHRISE (height 2.4): Celestial Sun-Spire / Living Sky-Tree (2 frames). */
function buildElfHighrise(): HTMLCanvasElement[] {
  return [0, 1].map((frame) => {
    const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

    isoDiamond(ctx, 32, 48, 25, EMERALD_DARK, OUT);
    isoDiamond(ctx, 32, 48, 21, '#1b4733', GOLD_DARK);

    // Tier 1
    const t1Fx = 32;
    const t1Fy = 58;
    const t1W = 14;
    const t1H = 14;

    isoBox(ctx, t1Fx, t1Fy, t1W, t1W, t1H, { top: IVORY_LIGHT, left: IVORY_DARK, right: IVORY_MID });
    leftWallRect(ctx, t1Fx, t1Fy, 0, 0, t1W, 2, BARK_DARK);
    rightWallRect(ctx, t1Fx, t1Fy, 0, 0, t1W, 2, BARK_MID);

    rightWallRect(ctx, t1Fx, t1Fy, 3, 1, 8, 8, OUT);
    rightWallRect(ctx, t1Fx, t1Fy, 4, 2, 6, 6, LANTERN_MID);
    rightWallRect(ctx, t1Fx, t1Fy, 6, 2, 2, 5, LANTERN_CORE);
    rightWallRect(ctx, t1Fx, t1Fy, 4, 8, 6, 1, GOLD_LIGHT);
    rightWallRect(ctx, t1Fx, t1Fy, 1, 10, t1W - 2, 1, GOLD_LIGHT);

    // Tier 2
    const t2Fx = 31;
    const t2Fy = 44;
    const t2W = 12;
    const t2H = 14;

    isoBox(ctx, t2Fx, t2Fy, t2W, t2W, t2H, { top: IVORY_LIGHT, left: IVORY_DARK, right: IVORY_MID });
    for (const v of [2, 5, 8]) {
      for (const z of [2, 6, 10]) {
        rightWallRect(ctx, t2Fx, t2Fy, v, z, 2, 3, OUT);
        rightWallRect(ctx, t2Fx, t2Fy, v, z + 1, 1, 2, z === 6 ? GOLD_LIGHT : LANTERN_CORE);
      }
    }
    for (const u of [2, 5, 8]) {
      for (const z of [2, 6, 10]) {
        leftWallRect(ctx, t2Fx, t2Fy, u, z, 2, 3, OUT);
        leftWallRect(ctx, t2Fx, t2Fy, u, z + 1, 1, 2, LANTERN_DIM);
      }
    }
    leftWallRect(ctx, t2Fx, t2Fy, 0, 13, t2W, 1, GOLD_DARK);
    rightWallRect(ctx, t2Fx, t2Fy, 0, 13, t2W, 1, GOLD_LIGHT);

    // Tier 3
    const t3Fx = 30;
    const t3Fy = 30;
    const t3W = 10;
    const t3H = 10;

    isoBox(ctx, t3Fx, t3Fy, t3W, t3W, t3H, { top: IVORY_LIGHT, left: IVORY_DARK, right: IVORY_MID });
    for (const v of [2, 6]) {
      for (const z of [2, 6]) {
        rightWallRect(ctx, t3Fx, t3Fy, v, z, 2, 2, OUT);
        rightWallRect(ctx, t3Fx, t3Fy, v, z, 1, 2, LANTERN_CORE);
      }
    }
    for (const u of [2, 6]) {
      for (const z of [2, 6]) {
        leftWallRect(ctx, t3Fx, t3Fy, u, z, 2, 2, OUT);
        leftWallRect(ctx, t3Fx, t3Fy, u, z, 1, 2, LANTERN_DIM);
      }
    }

    drawElvenCanopy(ctx, 30, 20, 12, 7, 0);

    // Celestial spire & pulsing starlight beacon
    rect(ctx, 29, 3, 2, 12, OUT);
    rect(ctx, 29, 4, 1, 11, GOLD_LIGHT);
    rect(ctx, 27, 7, 5, 1, GOLD_MID);

    const beaconColor = frame % 2 === 0 ? LANTERN_CORE : LANTERN_MID;
    disc(ctx, 30, 3, frame % 2 === 0 ? 3 : 2, LANTERN_MID);
    px(ctx, 30, 3, beaconColor);

    drawSilverLantern(ctx, 22, 28, frame);
    drawSilverLantern(ctx, 38, 28, frame + 1);

    return canvas;
  });
}

// ============================================================================
// COMMERCE BUILDINGS (bakery, teahouse, tailor, bazaar, tradeguild)
// ============================================================================

/** 6. BAKERY (height 1.0): Elven Lembas & Sun-Bread Oven (2 frames). */
function buildElfBakery(): HTMLCanvasElement[] {
  return [0, 1].map((frame) => {
    const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

    isoDiamond(ctx, 32, 48, 26, LEAF_DARK, OUT);
    isoDiamond(ctx, 32, 48, 22, '#214e38', GOLD_DARK);

    const fx = 32;
    const fy = 56;
    const wL = 16;
    const wR = 18;
    const wallH = 13;

    isoBox(ctx, fx, fy, wL, wR, 2, { top: BARK_LIGHT, left: BARK_DARK, right: BARK_MID });
    isoBox(ctx, fx, fy - 2, wL, wR, wallH - 2, { top: IVORY_LIGHT, left: IVORY_DARK, right: IVORY_MID });

    // Storefront serving window & display counter
    rightWallRect(ctx, fx, fy, 4, 2, 9, 7, OUT);
    rightWallRect(ctx, fx, fy, 5, 3, 7, 5, IVORY_LIGHT);
    rightWallRect(ctx, fx, fy, 3, 2, 11, 2, BARK_LIGHT);

    // Lembas & sun-bread loaves
    px(ctx, fx + 5, fy - (5 >> 1) - 4, GOLD_LIGHT);
    px(ctx, fx + 6, fy - (6 >> 1) - 4, LEAF_LIGHT);
    px(ctx, fx + 7, fy - (7 >> 1) - 4, GOLD_LIGHT);
    px(ctx, fx + 9, fy - (9 >> 1) - 4, GOLD_MID);
    px(ctx, fx + 10, fy - (10 >> 1) - 4, GOLD_LIGHT);
    px(ctx, fx + 12, fy - (12 >> 1) - 4, '#f5b041');

    // Scalloped emerald & gold striped canopy
    for (let v = 3; v <= 14; v++) {
      const isGreen = (v & 1) === 0;
      const x = fx + v;
      const y = fy - (v >> 1) - 9;
      rect(ctx, x, y, 1, 2, isGreen ? EMERALD_MID : GOLD_LIGHT);
    }

    // Golden crescent sign
    const signX = fx + 2;
    const signY = fy - (2 >> 1) - 10;
    rect(ctx, signX - 1, signY, 3, 1, OUT);
    rect(ctx, signX, signY + 1, 1, 2, OUT);
    rect(ctx, signX - 1, signY + 3, 3, 3, GOLD_LIGHT);
    px(ctx, signX, signY + 4, BARK_DARK);

    rightWallRect(ctx, fx, fy, 14, 1, 3, 7, OUT);
    rightWallRect(ctx, fx, fy, 14, 1, 2, 6, BARK_DARK);

    isoPitchedRoof(ctx, fx, fy, wL + 2, wR + 2, wallH, 8, {
      leftSlope: EMERALD_DARK,
      rightSlope: LEAF_MID,
      gable: IVORY_LIGHT,
      ridge: GOLD_LIGHT,
    });

    // Round stone/bark bake oven on left
    const ovenX = fx - 10;
    const ovenY = fy - 3;
    disc(ctx, ovenX, ovenY, 5, OUT);
    disc(ctx, ovenX, ovenY, 4, BARK_MID);
    disc(ctx, ovenX, ovenY, 2, GOLD_LIGHT);

    // Flue chimney
    rect(ctx, ovenX - 2, 20, 5, 24, OUT);
    rect(ctx, ovenX - 1, 21, 3, 23, BARK_LIGHT);
    rect(ctx, ovenX - 2, 20, 5, 2, GOLD_MID);

    // Animated fragrant smoke puffs
    if (frame % 2 === 0) {
      disc(ctx, ovenX, 16, 2, LANTERN_MID);
      disc(ctx, ovenX + 3, 11, 3, LANTERN_CORE);
      disc(ctx, ovenX + 1, 6, 2, LANTERN_MID);
    } else {
      disc(ctx, ovenX + 1, 15, 3, LANTERN_CORE);
      disc(ctx, ovenX + 2, 9, 2, LANTERN_MID);
      disc(ctx, ovenX + 4, 4, 3, LANTERN_CORE);
    }

    return canvas;
  });
}

/** 7. TEAHOUSE (height 1.1): Moonleaf Pavilion with tiered swept pagoda roof. */
function buildElfTeahouse(): HTMLCanvasElement[] {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  isoDiamond(ctx, 32, 48, 26, LEAF_DARK, OUT);
  isoDiamond(ctx, 32, 48, 22, '#215438', GOLD_DARK);

  // Stepping stones & sylvan reeds
  px(ctx, 32, 58, IVORY_MID);
  px(ctx, 33, 56, IVORY_LIGHT);
  px(ctx, 31, 54, IVORY_MID);
  rect(ctx, 19, 44, 1, 8, LEAF_DARK);
  rect(ctx, 21, 42, 1, 9, LEAF_MID);
  px(ctx, 18, 43, LEAF_HIGHLIGHT);
  px(ctx, 22, 41, LEAF_HIGHLIGHT);

  const fx = 32;
  const fy = 56;
  const wL = 16;
  const wR = 16;
  const wallH = 12;

  isoBox(ctx, fx, fy, wL, wR, 3, { top: BARK_LIGHT, left: BARK_DARK, right: BARK_MID });
  isoBox(ctx, fx, fy - 3, wL - 2, wR - 2, wallH - 3, { top: IVORY_LIGHT, left: IVORY_DARK, right: IVORY_MID });

  // Shoji-style gold & ivory screen lattice
  for (const v of [2, 5, 8, 11]) {
    rightWallRect(ctx, fx, fy, v, 3, 1, wallH - 4, GOLD_DARK);
  }
  for (const z of [5, 8]) {
    rightWallRect(ctx, fx, fy, 1, z, wR - 3, 1, GOLD_MID);
  }
  for (const u of [2, 5, 8, 11]) {
    leftWallRect(ctx, fx, fy, u, 3, 1, wallH - 4, GOLD_DARK);
  }
  for (const z of [5, 8]) {
    leftWallRect(ctx, fx, fy, 1, z, wL - 3, 1, GOLD_DARK);
  }

  // Flared swept jade-leaf pagoda roof
  isoPitchedRoof(ctx, fx, fy, wL + 2, wR + 2, wallH, 8, {
    leftSlope: EMERALD_DARK,
    rightSlope: LEAF_MID,
    gable: IVORY_LIGHT,
    ridge: GOLD_LIGHT,
  });

  // Upturned golden eave finials
  px(ctx, fx - 1 - (wL + 1), fy - wallH - ((wL + 1) >> 1) - 1, GOLD_LIGHT);
  px(ctx, fx + (wR + 1), fy - wallH - ((wR + 1) >> 1) - 1, GOLD_LIGHT);
  px(ctx, fx - 1, fy - wallH - 1, GOLD_LIGHT);

  // Veranda tea tables with steaming moonleaf tea
  rect(ctx, 42, 50, 4, 2, BARK_LIGHT);
  rect(ctx, 43, 52, 2, 2, BARK_MID);
  px(ctx, 43, 49, IVORY_LIGHT);
  px(ctx, 44, 49, LANTERN_MID);
  px(ctx, 43, 48, LANTERN_CORE);

  rect(ctx, 23, 50, 4, 2, BARK_LIGHT);
  rect(ctx, 24, 52, 2, 2, BARK_MID);
  px(ctx, 24, 49, IVORY_LIGHT);
  px(ctx, 25, 49, LANTERN_MID);
  px(ctx, 24, 48, LANTERN_CORE);

  drawSilverLantern(ctx, fx + wR - 2, fy - (wR >> 1) - wallH + 4, 0);
  drawSilverLantern(ctx, fx + 2, fy - wallH + 4, 1);

  return [canvas];
}

/** 8. TAILOR (height 1.1): Sylvan Silkweaver & Leaf-Garment Atelier. */
function buildElfTailor(): HTMLCanvasElement[] {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  isoDiamond(ctx, 32, 48, 25, EMERALD_DARK, OUT);
  isoDiamond(ctx, 32, 48, 21, '#1b4733', GOLD_DARK);

  const fx = 31;
  const fy = 56;
  const wL = 14;
  const wR = 18;
  const wallH = 16;

  isoBox(ctx, fx, fy, wL, wR, 2, { top: BARK_LIGHT, left: BARK_DARK, right: BARK_MID });
  isoBox(ctx, fx, fy - 2, wL, wR, wallH - 2, { top: IVORY_LIGHT, left: IVORY_DARK, right: IVORY_MID });

  rightWallRect(ctx, fx, fy, 2, 1, 3, 8, OUT);
  rightWallRect(ctx, fx, fy, 3, 1, 1, 7, BARK_DARK);
  px(ctx, fx + 3, fy - (3 >> 1) - 4, GOLD_LIGHT);

  // Large crystal display window
  rightWallRect(ctx, fx, fy, 6, 2, 9, 8, OUT);
  rightWallRect(ctx, fx, fy, 7, 3, 7, 6, LANTERN_CORE);
  px(ctx, fx + 8, fy - (8 >> 1) - 6, '#ffffff');
  px(ctx, fx + 9, fy - (9 >> 1) - 7, '#ffffff');

  // Mannequin with emerald & gold gown
  const mX = fx + 10;
  const mY = fy - (10 >> 1) - 3;
  rect(ctx, mX, mY - 4, 1, 4, BARK_MID);
  rect(ctx, mX - 1, mY - 4, 3, 3, EMERALD_MID);
  px(ctx, mX, mY - 3, GOLD_LIGHT);
  px(ctx, mX, mY - 5, IVORY_LIGHT);

  // Emerald & gold awning
  for (let v = 5; v <= 15; v++) {
    const isStripe = (v & 1) === 0;
    const ax = fx + v;
    const ay = fy - (v >> 1) - 10;
    rect(ctx, ax, ay, 1, 3, isStripe ? EMERALD_MID : GOLD_LIGHT);
    px(ctx, ax, ay + 3, isStripe ? EMERALD_DARK : GOLD_MID);
  }

  // Golden scissors crest
  const sX = fx + 4;
  const sY = fy - (4 >> 1) - 11;
  rect(ctx, sX - 1, sY, 3, 1, OUT);
  rect(ctx, sX, sY + 1, 1, 2, OUT);
  px(ctx, sX - 1, sY + 3, GOLD_LIGHT);
  px(ctx, sX + 1, sY + 3, GOLD_LIGHT);
  px(ctx, sX, sY + 4, GOLD_LIGHT);
  px(ctx, sX - 1, sY + 5, GOLD_LIGHT);
  px(ctx, sX + 1, sY + 5, GOLD_LIGHT);

  // Bolts of silk
  leftWallRect(ctx, fx, fy, 3, 4, 4, 6, OUT);
  leftWallRect(ctx, fx, fy, 4, 5, 2, 4, LANTERN_DIM);
  const bX = fx - 10;
  const bY = fy - 5;
  rect(ctx, bX, bY - 2, 4, 2, EMERALD_LIGHT);
  rect(ctx, bX, bY - 4, 4, 2, LANTERN_MID);
  rect(ctx, bX, bY - 6, 4, 2, GOLD_LIGHT);

  isoPitchedRoof(ctx, fx, fy, wL + 2, wR + 2, wallH, 8, {
    leftSlope: EMERALD_DARK,
    rightSlope: LEAF_MID,
    gable: IVORY_LIGHT,
    ridge: GOLD_LIGHT,
  });

  return [canvas];
}

/** 9. BAZAAR (height 1.0): Sylvan Canopy Market / Emerald Glade Fair. */
function buildElfBazaar(): HTMLCanvasElement[] {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  isoDiamond(ctx, 32, 48, 28, LEAF_DARK, OUT);
  isoDiamond(ctx, 32, 48, 24, '#245237', GOLD_DARK);

  // Woven carpets
  rect(ctx, 30, 48, 7, 4, OUT);
  rect(ctx, 31, 49, 5, 2, EMERALD_MID);
  px(ctx, 33, 49, GOLD_LIGHT);
  px(ctx, 33, 50, GOLD_LIGHT);

  rect(ctx, 22, 47, 6, 3, OUT);
  rect(ctx, 23, 48, 4, 1, LANTERN_MID);

  // Tent 1: Central conical leaf-silk tent
  const t1Cx = 32;
  const t1Cy = 36;
  const t1R = 9;
  const t1PeakY = 18;
  for (let dy = 0; dy <= 12; dy++) {
    const y = t1Cy - dy;
    const span = Math.round((t1R * (t1Cy - y)) / (t1Cy - t1PeakY));
    const half = Math.max(1, t1R - span);
    rect(ctx, t1Cx - half - 1, y, half * 2 + 2, 1, OUT);
    for (let dx = -half; dx <= half; dx++) {
      const isGold = (Math.abs(dx) % 3) === 0;
      px(ctx, t1Cx + dx, y, isGold ? GOLD_LIGHT : EMERALD_MID);
    }
  }
  rect(ctx, t1Cx - 1, t1PeakY - 2, 3, 2, GOLD_LIGHT);
  px(ctx, t1Cx, t1PeakY - 3, LANTERN_CORE);

  // Tent 2: Front-left gold canopy
  const t2Fx = 23;
  const t2Fy = 54;
  rect(ctx, t2Fx - 7, t2Fy - 8, 1, 6, BARK_DARK);
  rect(ctx, t2Fx - 1, t2Fy - 8, 1, 6, BARK_DARK);
  rect(ctx, t2Fx - 4, t2Fy - 10, 1, 6, BARK_DARK);
  rect(ctx, t2Fx + 2, t2Fy - 10, 1, 6, BARK_DARK);
  for (let u = 0; u < 8; u++) {
    const isGold = (u & 1) === 0;
    const ax = t2Fx - u;
    const ay = t2Fy - (u >> 1) - 6;
    rect(ctx, ax, ay, 2, 2, isGold ? GOLD_LIGHT : IVORY_LIGHT);
  }

  // Tent 3: Front-right cyan canopy
  const t3Fx = 41;
  const t3Fy = 52;
  rect(ctx, t3Fx - 1, t3Fy - 6, 1, 6, BARK_DARK);
  rect(ctx, t3Fx + 5, t3Fy - 9, 1, 6, BARK_DARK);
  for (let v = 0; v < 7; v++) {
    const isCyan = (v & 1) === 0;
    const ax = t3Fx + v;
    const ay = t3Fy - (v >> 1) - 7;
    rect(ctx, ax, ay, 1, 3, isCyan ? LANTERN_MID : EMERALD_LIGHT);
  }

  // Baskets & pottery
  rect(ctx, 27, 52, 3, 2, BARK_LIGHT);
  px(ctx, 28, 51, GOLD_LIGHT);
  rect(ctx, 31, 54, 3, 2, BARK_LIGHT);
  px(ctx, 32, 53, LANTERN_CORE);
  rect(ctx, 35, 53, 3, 2, BARK_LIGHT);
  px(ctx, 36, 52, LEAF_HIGHLIGHT);

  rect(ctx, 39, 48, 3, 4, OUT);
  rect(ctx, 40, 49, 1, 3, GOLD_MID);
  rect(ctx, 44, 46, 4, 4, OUT);
  rect(ctx, 45, 47, 2, 2, BARK_LIGHT);

  return [canvas];
}

/** 10. TRADE GUILD (height 1.8): Sylvan Merchant Hall & Star-Chronometer Spire. */
function buildElfTradeguild(): HTMLCanvasElement[] {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  isoDiamond(ctx, 32, 48, 28, LEAF_DARK, OUT);
  isoDiamond(ctx, 32, 48, 24, '#1b4733', GOLD_DARK);

  const fx = 32;
  const fy = 56;
  const wL = 18;
  const wR = 20;
  const wallH = 18;

  isoBox(ctx, fx, fy, wL + 2, wR + 2, 3, { top: IVORY_LIGHT, left: IVORY_DARK, right: IVORY_MID });
  isoBox(ctx, fx, fy - 3, wL, wR, wallH - 3, { top: IVORY_LIGHT, left: IVORY_DARK, right: IVORY_MID });

  rightWallRect(ctx, fx, fy, 7, 1, 6, 9, OUT);
  rightWallRect(ctx, fx, fy, 8, 2, 4, 8, BARK_DARK);
  px(ctx, fx + 9, fy - (9 >> 1) - 5, GOLD_LIGHT);
  rightWallRect(ctx, fx, fy, 7, 9, 6, 1, GOLD_LIGHT);

  // Scales sign
  const scX = fx + 10;
  const scY = fy - (10 >> 1) - 12;
  rect(ctx, scX, scY, 1, 4, GOLD_LIGHT);
  rect(ctx, scX - 2, scY + 1, 5, 1, GOLD_LIGHT);
  px(ctx, scX - 2, scY + 3, GOLD_LIGHT);
  px(ctx, scX + 2, scY + 3, GOLD_LIGHT);

  // Guild banner
  const bX = fx + 4;
  const bY = fy - (4 >> 1) - 14;
  rect(ctx, bX - 1, bY, 4, 9, OUT);
  rect(ctx, bX, bY + 1, 2, 7, EMERALD_MID);
  px(ctx, bX, bY + 4, GOLD_LIGHT);
  px(ctx, bX + 1, bY + 5, GOLD_LIGHT);

  for (const v of [1, 15]) {
    rightWallRect(ctx, fx, fy, v, 4, 3, 8, OUT);
    rightWallRect(ctx, fx, fy, v + 1, 5, 1, 6, LANTERN_CORE);
  }
  for (const u of [3, 9, 14]) {
    leftWallRect(ctx, fx, fy, u, 4, 3, 8, OUT);
    leftWallRect(ctx, fx, fy, u + 1, 5, 1, 6, LANTERN_DIM);
  }

  isoPitchedRoof(ctx, fx, fy, wL + 2, wR + 2, wallH, 8, {
    leftSlope: EMERALD_DARK,
    rightSlope: LEAF_MID,
    gable: IVORY_LIGHT,
    ridge: GOLD_LIGHT,
  });

  // Central Clock Tower
  const tFx = 32;
  const tFy = 35;
  const tW = 8;
  const tH = 14;

  isoBox(ctx, tFx, tFy, tW, tW, tH, { top: IVORY_LIGHT, left: IVORY_DARK, right: IVORY_MID });

  const clockX = tFx + 2;
  const clockY = tFy - (2 >> 1) - 7;
  disc(ctx, clockX, clockY, 3, OUT);
  disc(ctx, clockX, clockY, 2, GOLD_LIGHT);
  px(ctx, clockX, clockY, BARK_DARK);
  px(ctx, clockX, clockY - 1, BARK_DARK);
  px(ctx, clockX + 1, clockY, BARK_DARK);

  for (let dy = 0; dy <= 8; dy++) {
    const y = tFy - tH - dy;
    const half = Math.max(1, Math.round((4 * (8 - dy)) / 8));
    rect(ctx, tFx - 1 - half, y, half * 2 + 2, 1, OUT);
    rect(ctx, tFx - 1 - half, y, half, 1, EMERALD_DARK);
    rect(ctx, tFx - 1, y, half, 1, LEAF_MID);
  }
  rect(ctx, tFx - 1, tFy - tH - 10, 2, 2, GOLD_LIGHT);
  px(ctx, tFx - 1, tFy - tH - 11, LANTERN_CORE);

  return [canvas];
}

// ============================================================================
// INDUSTRY BUILDINGS (fishery, windmill, sawmill, smelter, crafthall, foundry)
// ============================================================================

/** 11. FISHERY (height 0.7): Moonlit River Pier & Net-Weaver's Bough (2 frames). */
function buildElfFishery(): HTMLCanvasElement[] {
  return [0, 1].map((frame) => {
    const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

    isoDiamond(ctx, 32, 48, 28, LEAF_DARK, OUT);

    // Turquoise water basin
    for (let dy = -12; dy <= 12; dy++) {
      const span = Math.max(0, 22 - Math.abs(dy) * 2);
      if (span <= 0) continue;
      const y = 49 + dy;
      const x0 = 36 - (span >> 1);
      rect(ctx, x0, y, span, 1, '#1e5242');
      if (span > 8) rect(ctx, x0 + 4, y, span - 8, 1, '#14382d');
    }

    // Shimmering water glints
    const glints =
      frame === 0
        ? ([[28, 48], [34, 54], [44, 48], [39, 44], [48, 52], [32, 57]] as const)
        : ([[30, 47], [32, 55], [42, 49], [41, 43], [46, 53], [35, 58]] as const);
    for (const [gx, gy] of glints) {
      rect(ctx, gx, gy, 2, 1, LANTERN_MID);
      px(ctx, gx, gy, LANTERN_CORE);
    }

    // Net-weaver's hut on left shore
    const fx = 23;
    const fy = 45;
    isoBox(ctx, fx, fy, 9, 9, 9, { top: IVORY_LIGHT, left: BARK_DARK, right: BARK_MID });
    rightWallRect(ctx, fx, fy, 3, 3, 3, 3, OUT);
    rightWallRect(ctx, fx, fy, 4, 4, 1, 1, LANTERN_CORE);
    isoPitchedRoof(ctx, fx, fy, 11, 11, 9, 5, {
      leftSlope: EMERALD_DARK,
      rightSlope: LEAF_MID,
      gable: IVORY_LIGHT,
      ridge: GOLD_LIGHT,
    });

    // Drying racks
    for (const rx of [17, 23]) {
      rect(ctx, rx, 48, 1, 6, OUT);
      rect(ctx, rx, 48, 1, 5, BARK_MID);
    }
    rect(ctx, 16, 49, 9, 1, BARK_LIGHT);
    rect(ctx, 16, 51, 9, 1, BARK_LIGHT);
    for (let fxPos = 17; fxPos <= 23; fxPos += 2) {
      px(ctx, fxPos, 50, LANTERN_CORE);
      px(ctx, fxPos, 52, IVORY_LIGHT);
    }

    // Pier walkway
    for (let u = 0; u < 12; u++) {
      const px0 = 26 + u;
      const py0 = 47 + (u >> 1);
      rect(ctx, px0, py0, 1, 3, BARK_LIGHT);
      px(ctx, px0, py0 + 3, OUT);
      px(ctx, px0, py0 - 1, OUT);
      if (u % 2 === 0) px(ctx, px0, py0, GOLD_LIGHT);
    }
    const pilings = [[28, 54], [34, 57], [40, 55], [36, 50], [42, 52]] as const;
    for (const [px0, py0] of pilings) {
      rect(ctx, px0, py0, 2, 5, OUT);
      rect(ctx, px0, py0, 1, 4, BARK_DARK);
    }

    // Docked curved elven canoe
    const bx = 45;
    const by = 50;
    rect(ctx, bx - 1, by - 1, 8, 4, OUT);
    rect(ctx, bx, by, 6, 2, BARK_MID);
    rect(ctx, bx + 1, by, 4, 2, IVORY_LIGHT);
    px(ctx, bx - 1, by + 1, GOLD_LIGHT);

    drawSilverLantern(ctx, 38, 50, frame);

    return canvas;
  });
}

/** 12. WINDMILL (height 1.8): Sylvan Breeze-Spire / Lotus Sail-Mill (3 frames). */
function buildElfWindmill(): HTMLCanvasElement[] {
  return [0, 1, 2].map((frame) => {
    const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

    isoDiamond(ctx, 32, 48, 28, LEAF_DARK, OUT);
    isoDiamond(ctx, 32, 52, 18, '#1b4733', OUT);
    isoDiamond(ctx, 32, 52, 15, '#245a40', GOLD_DARK);

    // Tapered round tower
    const baseY = 52;
    const topY = 27;
    const towerH = baseY - topY;

    for (let dy = 0; dy <= towerH; dy++) {
      const y = baseY - dy;
      const r = Math.round(9 - (dy * 3) / towerH);
      const span = r * 2;
      const x0 = 32 - r;

      rect(ctx, x0 - 1, y, span + 2, 1, OUT);
      rect(ctx, x0, y, r, 1, IVORY_DARK);
      rect(ctx, 32, y, r, 1, IVORY_MID);
      if (r >= 4) px(ctx, 32 + (r >> 1), y, IVORY_LIGHT);
      if (dy <= 3) {
        rect(ctx, x0, y, r, 1, BARK_DARK);
        rect(ctx, 32, y, r, 1, BARK_MID);
      }
      if (dy === 12) {
        rect(ctx, x0, y, span, 1, GOLD_MID);
      }
    }

    rect(ctx, 33, 47, 4, 6, OUT);
    rect(ctx, 34, 48, 2, 5, BARK_DARK);
    px(ctx, 35, 50, GOLD_LIGHT);

    rect(ctx, 31, 38, 3, 3, OUT);
    rect(ctx, 32, 39, 1, 2, LANTERN_MID);

    // Conical leaf roof cap
    for (let dy = 0; dy <= 7; dy++) {
      const y = 27 - dy;
      const r = Math.max(1, Math.round(((7 - dy) * 7) / 7));
      rect(ctx, 32 - r - 1, y, r * 2 + 2, 1, OUT);
      rect(ctx, 32 - r, y, r, 1, EMERALD_DARK);
      rect(ctx, 32, y, r, 1, LEAF_MID);
      px(ctx, 32, y, LEAF_HIGHLIGHT);
    }
    rect(ctx, 31, 18, 2, 2, OUT);
    rect(ctx, 31, 18, 1, 2, GOLD_LIGHT);
    px(ctx, 31, 17, LANTERN_CORE);

    // 4 Turning Sails
    const hubX = 32;
    const hubY = 25;
    type SailVec = readonly [number, number];
    let sailVecs: readonly [SailVec, SailVec, SailVec, SailVec];
    if (frame === 0) {
      sailVecs = [[0, -12], [12, 0], [0, 12], [-12, 0]];
    } else if (frame === 1) {
      sailVecs = [[6, -11], [11, 6], [-6, 11], [-11, -6]];
    } else {
      sailVecs = [[11, -6], [6, 11], [-11, 6], [-6, -11]];
    }

    for (const [vx, vy] of sailVecs) {
      for (let step = 2; step <= 12; step++) {
        const sx = Math.round(hubX + (vx * step) / 12);
        const sy = Math.round(hubY + (vy * step) / 12);
        px(ctx, sx, sy, BARK_DARK);
        if (step >= 4 && step <= 11) {
          const nx = -Math.sign(vy);
          const ny = Math.sign(vx);
          px(ctx, sx + nx, sy + ny, LEAF_LIGHT);
          px(ctx, sx + nx * 2, sy + ny * 2, GOLD_LIGHT);
          px(ctx, sx + nx * 3, sy + ny * 3, OUT);
        }
      }
    }

    disc(ctx, hubX, hubY, 2, OUT);
    disc(ctx, hubX, hubY, 1, GOLD_MID);
    px(ctx, hubX, hubY, GOLD_LIGHT);

    // Flour sacks
    const sacks = [[26, 52], [28, 54], [25, 55], [39, 52]] as const;
    for (const [sx, sy] of sacks) {
      rect(ctx, sx - 1, sy - 1, 4, 4, OUT);
      rect(ctx, sx, sy, 2, 3, IVORY_LIGHT);
      px(ctx, sx, sy - 1, GOLD_MID);
      px(ctx, sx + 1, sy + 1, IVORY_DARK);
    }

    return canvas;
  });
}

/** 13. SAWMILL (height 1.1): Living-Wood Shaper's Yard & Water-Saw (2 frames). */
function buildElfSawmill(): HTMLCanvasElement[] {
  return [0, 1].map((frame) => {
    const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

    isoDiamond(ctx, 32, 48, 28, LEAF_DARK, OUT);
    isoDiamond(ctx, 32, 48, 24, '#245237', GOLD_DARK);

    isoDiamond(ctx, 33, 50, 16, '#2e6b48');
    px(ctx, 30, 48, GOLD_LIGHT);
    px(ctx, 35, 52, GOLD_LIGHT);
    px(ctx, 28, 52, GOLD_MID);

    const fx = 28;
    const fy = 51;
    const wL = 14;
    const wR = 14;
    const wallH = 11;

    isoBox(ctx, fx, fy, wL, wR, wallH, { top: IVORY_LIGHT, left: BARK_DARK, right: BARK_MID });
    rightWallRect(ctx, fx, fy, 1, 1, 12, 9, '#1a100b');

    rect(ctx, fx - 1, fy - wallH, 2, wallH + 1, OUT);
    rect(ctx, fx - 1, fy - wallH, 1, wallH, BARK_LIGHT);
    rect(ctx, fx + wR - 2, fy - (wR >> 1) - wallH, 2, wallH + 1, OUT);
    rect(ctx, fx + wR - 2, fy - (wR >> 1) - wallH, 1, wallH, BARK_LIGHT);

    isoPitchedRoof(ctx, fx, fy, wL + 2, wR + 2, wallH, 6, {
      leftSlope: EMERALD_DARK,
      rightSlope: LEAF_MID,
      gable: IVORY_LIGHT,
      ridge: GOLD_LIGHT,
    });

    rect(ctx, 22, 45, 12, 3, BARK_DARK);
    rect(ctx, 22, 44, 8, 2, BARK_LIGHT);

    // Circular silver blade & spark spray
    disc(ctx, 28, 43, 5, OUT);
    disc(ctx, 28, 43, 4, LANTERN_MID);
    disc(ctx, 28, 43, 1, GOLD_LIGHT);

    if (frame % 2 === 0) {
      px(ctx, 26, 41, GOLD_LIGHT);
      px(ctx, 25, 40, LANTERN_CORE);
      px(ctx, 29, 40, GOLD_LIGHT);
    } else {
      px(ctx, 27, 40, LANTERN_CORE);
      px(ctx, 25, 42, GOLD_LIGHT);
      px(ctx, 30, 41, LANTERN_CORE);
    }

    // Stacked boards
    rect(ctx, 38, 51, 6, 4, OUT);
    rect(ctx, 38, 51, 5, 1, GOLD_LIGHT);
    rect(ctx, 38, 52, 5, 1, BARK_LIGHT);
    rect(ctx, 38, 53, 5, 1, GOLD_LIGHT);

    return canvas;
  });
}

/** 14. SMELTER (height 1.3): Sylvan Mithril & Sun-Gold Forge (2 frames). */
function buildElfSmelter(): HTMLCanvasElement[] {
  return [0, 1].map((frame) => {
    const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

    isoDiamond(ctx, 32, 48, 28, LEAF_DARK, OUT);
    isoDiamond(ctx, 32, 48, 24, '#1b4733', GOLD_DARK);

    const fx = 32;
    const fy = 55;
    const wL = 16;
    const wR = 16;
    const wallH = 14;

    isoBox(ctx, fx, fy, wL, wR, 3, { top: BARK_LIGHT, left: BARK_DARK, right: BARK_MID });
    isoBox(ctx, fx, fy - 3, wL, wR, wallH - 3, { top: IVORY_LIGHT, left: IVORY_DARK, right: IVORY_MID });

    // Crucible aperture
    rightWallRect(ctx, fx, fy, 4, 1, 7, 7, OUT);
    const hearthCol = frame % 2 === 0 ? LANTERN_CORE : GOLD_LIGHT;
    rightWallRect(ctx, fx, fy, 5, 2, 5, 5, hearthCol);
    rightWallRect(ctx, fx, fy, 6, 3, 3, 3, frame % 2 === 0 ? '#ffffff' : LANTERN_CORE);

    // Stone chimney
    rect(ctx, 26, 18, 6, 24, OUT);
    rect(ctx, 27, 19, 4, 23, IVORY_MID);
    rect(ctx, 26, 18, 6, 2, GOLD_MID);

    if (frame % 2 === 0) {
      disc(ctx, 29, 14, 3, LANTERN_MID);
      disc(ctx, 31, 9, 3, LANTERN_CORE);
      disc(ctx, 30, 4, 2, LANTERN_MID);
    } else {
      disc(ctx, 30, 13, 2, LANTERN_CORE);
      disc(ctx, 28, 8, 3, LANTERN_MID);
      disc(ctx, 32, 4, 3, LANTERN_CORE);
    }

    rect(ctx, 42, 52, 4, 3, OUT);
    rect(ctx, 43, 53, 2, 1, LANTERN_CORE);
    rect(ctx, 43, 54, 2, 1, GOLD_LIGHT);
    px(ctx, 37, 54, LANTERN_CORE);
    px(ctx, 38, 53, LANTERN_MID);

    return canvas;
  });
}

/** 15. CRAFTHALL (height 1.4): Elven Artisan Guildhall & Gem-Polishing Atrium. */
function buildElfCrafthall(): HTMLCanvasElement[] {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  isoDiamond(ctx, 32, 48, 28, LEAF_DARK, OUT);
  isoDiamond(ctx, 32, 48, 24, '#245237', GOLD_DARK);

  const fx = 32;
  const fy = 56;
  const wL = 18;
  const wR = 18;
  const wallH = 14;

  isoBox(ctx, fx, fy, wL, wR, 2, { top: BARK_LIGHT, left: BARK_DARK, right: BARK_MID });
  isoBox(ctx, fx, fy - 2, wL, wR, wallH - 2, { top: IVORY_LIGHT, left: IVORY_DARK, right: IVORY_MID });

  rightWallRect(ctx, fx, fy, 6, 1, 5, 8, OUT);
  rightWallRect(ctx, fx, fy, 7, 2, 3, 7, BARK_DARK);
  rightWallRect(ctx, fx, fy, 7, 8, 3, 1, GOLD_LIGHT);

  for (const v of [1, 13]) {
    rightWallRect(ctx, fx, fy, v, 4, 3, 6, OUT);
    rightWallRect(ctx, fx, fy, v + 1, 5, 1, 4, LANTERN_CORE);
  }
  for (const u of [3, 9, 14]) {
    leftWallRect(ctx, fx, fy, u, 4, 3, 6, OUT);
    leftWallRect(ctx, fx, fy, u + 1, 5, 1, 4, LANTERN_DIM);
  }

  isoPitchedRoof(ctx, fx, fy, wL + 2, wR + 2, wallH, 8, {
    leftSlope: EMERALD_DARK,
    rightSlope: LEAF_MID,
    gable: IVORY_LIGHT,
    ridge: GOLD_LIGHT,
  });

  // Trestle bench displaying golden harp & bow
  rect(ctx, 42, 51, 6, 2, BARK_LIGHT);
  rect(ctx, 43, 53, 1, 3, BARK_DARK);
  rect(ctx, 47, 53, 1, 3, BARK_DARK);
  px(ctx, 43, 50, GOLD_LIGHT);
  px(ctx, 44, 49, GOLD_LIGHT);
  px(ctx, 45, 50, GOLD_LIGHT);
  rect(ctx, 46, 50, 2, 1, LEAF_LIGHT);
  px(ctx, 47, 49, GOLD_LIGHT);

  drawSilverLantern(ctx, 22, 42, 0);

  return [canvas];
}

/** 16. FOUNDRY (height 1.9): High Mithril Foundry / Sun-Smeltery (2 frames). */
function buildElfFoundry(): HTMLCanvasElement[] {
  return [0, 1].map((frame) => {
    const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

    isoDiamond(ctx, 32, 48, 28, LEAF_DARK, OUT);
    isoDiamond(ctx, 32, 48, 24, '#1b4733', GOLD_DARK);

    const fx = 32;
    const fy = 57;
    const wL = 18;
    const wR = 18;
    const wallH = 20;

    isoBox(ctx, fx, fy, wL, wR, 3, { top: BARK_LIGHT, left: BARK_DARK, right: BARK_MID });
    isoBox(ctx, fx, fy - 3, wL, wR, wallH - 3, { top: IVORY_LIGHT, left: IVORY_DARK, right: IVORY_MID });

    // Arched casting bay
    rightWallRect(ctx, fx, fy, 4, 1, 10, 10, OUT);
    const metalCol = frame % 2 === 0 ? LANTERN_CORE : GOLD_LIGHT;
    rightWallRect(ctx, fx, fy, 5, 2, 8, 8, metalCol);
    rightWallRect(ctx, fx, fy, 7, 3, 4, 5, frame % 2 === 0 ? '#ffffff' : LANTERN_CORE);

    // Twin chimneys
    rect(ctx, 21, 12, 4, 25, OUT);
    rect(ctx, 22, 13, 2, 24, IVORY_MID);
    rect(ctx, 21, 12, 4, 2, GOLD_LIGHT);

    rect(ctx, 29, 10, 4, 25, OUT);
    rect(ctx, 30, 11, 2, 24, IVORY_LIGHT);
    rect(ctx, 29, 10, 4, 2, GOLD_LIGHT);

    if (frame % 2 === 0) {
      disc(ctx, 23, 8, 3, LANTERN_MID);
      disc(ctx, 24, 3, 3, LANTERN_CORE);
      disc(ctx, 31, 6, 3, LANTERN_CORE);
      disc(ctx, 33, 2, 2, LANTERN_MID);
    } else {
      disc(ctx, 22, 7, 2, LANTERN_CORE);
      disc(ctx, 25, 2, 3, LANTERN_MID);
      disc(ctx, 32, 5, 3, LANTERN_MID);
      disc(ctx, 30, 2, 3, LANTERN_CORE);
    }

    rect(ctx, 42, 52, 6, 4, OUT);
    rect(ctx, 43, 53, 4, 1, LANTERN_CORE);
    rect(ctx, 43, 54, 4, 1, GOLD_LIGHT);

    return canvas;
  });
}

// ============================================================================
// SERVICES (shrine, garden, theater, observatory, hospital, university)
// ============================================================================

/** 17. SHRINE (height 1.0): Sacred Sylvan Moon-Altar & Living Arbor Gate (2 frames). */
function buildElfShrine(): HTMLCanvasElement[] {
  return [0, 1].map((frame) => {
    const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

    // Sacred moss grove & raked ivory gravel sanctuary
    isoDiamond(ctx, 32, 48, 28, LEAF_DARK, OUT);
    isoDiamond(ctx, 32, 48, 24, '#265438', GOLD_DARK);
    isoDiamond(ctx, 32, 48, 20, IVORY_MID, '#8c8574');

    // Stepped moonstone terrace
    isoDiamond(ctx, 32, 51, 16, IVORY_DARK, OUT);
    isoDiamond(ctx, 32, 49, 13, IVORY_LIGHT, GOLD_MID);

    // Living silver-wood arbor gate (arched pillars & curved boughs)
    const p1X = 23;
    const p1Y = 46;
    const p2X = 41;
    const p2Y = 42;
    const gateH = 15;

    // Left pillar (living white-bark trunk wrapped in vine)
    rect(ctx, p1X - 1, p1Y - gateH, 3, gateH + 1, OUT);
    rect(ctx, p1X, p1Y - gateH, 2, gateH, IVORY_MID);
    rect(ctx, p1X, p1Y - gateH + 3, 2, 2, LEAF_MID);
    rect(ctx, p1X, p1Y - gateH + 8, 2, 2, LEAF_MID);
    rect(ctx, p1X - 1, p1Y - 2, 3, 3, BARK_DARK);

    // Right pillar
    rect(ctx, p2X - 1, p2Y - gateH, 3, gateH + 1, OUT);
    rect(ctx, p2X, p2Y - gateH, 2, gateH, IVORY_LIGHT);
    rect(ctx, p2X, p2Y - gateH + 4, 2, 2, LEAF_LIGHT);
    rect(ctx, p2X, p2Y - gateH + 9, 2, 2, LEAF_LIGHT);
    rect(ctx, p2X - 1, p2Y - 2, 3, 3, BARK_DARK);

    // Graceful curved overhead bough lintel
    const lintelY = p1Y - gateH - 1;
    rect(ctx, p1X - 4, lintelY - 2, (p2X - p1X) + 9, 3, OUT);
    rect(ctx, p1X - 3, lintelY - 2, (p2X - p1X) + 7, 2, EMERALD_MID);
    px(ctx, p1X - 4, lintelY - 3, GOLD_LIGHT);
    px(ctx, p2X + 4, lintelY - 3 - 2, GOLD_LIGHT);

    // Sylvan canopy crowning the gate
    drawElvenCanopy(ctx, 32, lintelY - 2, 8, 5, frame % 2);

    // Sacred golden star talisman in center of arch
    rect(ctx, 31, lintelY - 1, 3, 3, OUT);
    rect(ctx, 31, lintelY - 1, 3, 3, GOLD_LIGHT);
    px(ctx, 32, lintelY, '#ffffff');

    // Suspended silver lantern under lintel
    drawSilverLantern(ctx, 32, lintelY + 5, frame);

    // Sacred moon-altar table beneath gate
    const aFx = 32;
    const aFy = 49;
    isoBox(ctx, aFx, aFy, 6, 6, 4, {
      top: IVORY_LIGHT,
      left: IVORY_DARK,
      right: IVORY_MID,
    });
    leftWallRect(ctx, aFx, aFy, 0, 3, 6, 1, GOLD_DARK);
    rightWallRect(ctx, aFx, aFy, 0, 3, 6, 1, GOLD_LIGHT);

    // Moon-basin offering bowl on altar glowing with starlight
    rect(ctx, 31, 43, 3, 2, OUT);
    rect(ctx, 31, 43, 3, 1, GOLD_LIGHT);
    px(ctx, 32, 43, frame === 0 ? LANTERN_CORE : LANTERN_MID);

    // Flanking starlight candles
    rect(ctx, 29, 42, 1, 3, IVORY_LIGHT);
    px(ctx, 29, 41, LANTERN_MID);
    px(ctx, 29, 40, frame === 0 ? LANTERN_CORE : '#ffffff');

    rect(ctx, 34, 41, 1, 3, IVORY_LIGHT);
    px(ctx, 34, 40, LANTERN_MID);
    px(ctx, 34, 39, frame === 0 ? '#ffffff' : LANTERN_CORE);

    // Elven prayer ribbons
    const ribbons = [
      [26, 33, LEAF_LIGHT],
      [29, 32, GOLD_LIGHT],
      [35, 30, LANTERN_MID],
      [38, 29, LEAF_HIGHLIGHT],
    ] as const;
    for (const [rx0, ry0, col] of ribbons) {
      rect(ctx, rx0, ry0, 2, 4, OUT);
      rect(ctx, rx0, ry0, 2, 3, col);
    }

    // Flanking carved sylvan stone lanterns
    isoBox(ctx, 19, 53, 3, 3, 6, { top: IVORY_LIGHT, left: IVORY_DARK, right: IVORY_MID });
    px(ctx, 18, 49, frame === 0 ? LANTERN_CORE : LANTERN_MID);
    px(ctx, 19, 46, GOLD_LIGHT);

    isoBox(ctx, 45, 48, 3, 3, 6, { top: IVORY_LIGHT, left: IVORY_DARK, right: IVORY_MID });
    px(ctx, 44, 44, frame === 0 ? LANTERN_MID : LANTERN_CORE);
    px(ctx, 45, 41, GOLD_LIGHT);

    return canvas;
  });
}

/** 18. GARDEN (height 0.4): Enchanted Botanical Sylvan Garden & Starlight Water Basin (2 frames). */
function buildElfGarden(): HTMLCanvasElement[] {
  return [0, 1].map((frame) => {
    const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

    // Lush deep-emerald formal lawn
    isoDiamond(ctx, 32, 48, 28, LEAF_DARK, OUT);
    isoDiamond(ctx, 32, 48, 25, EMERALD_MID, '#163b27');

    // Curved ivory gravel pathways
    for (let u = 4; u < 28; u++) {
      const sx = 32 + (u - 16);
      const sy = 48 - (u >> 1) + 8;
      rect(ctx, sx - 2, sy, 4, 1, IVORY_MID);
      px(ctx, sx - 2, sy, GOLD_DARK);
      px(ctx, sx + 2, sy, GOLD_DARK);
    }
    for (let v = 4; v < 28; v++) {
      const sx = 32 - (v - 16);
      const sy = 48 - (v >> 1) + 8;
      rect(ctx, sx - 2, sy, 4, 1, IVORY_MID);
      px(ctx, sx - 2, sy, GOLD_DARK);
      px(ctx, sx + 2, sy, GOLD_DARK);
    }

    // Central circular ivory moon-fountain / reflecting basin
    isoDiamond(ctx, 32, 48, 8, IVORY_LIGHT, GOLD_MID);
    isoDiamond(ctx, 32, 48, 6, frame === 0 ? LANTERN_MID : LANTERN_CORE, OUT);
    px(ctx, 32, 48, '#ffffff');

    // Quadrant 1 (back-left): Sculpted emerald hedges & glowing dusk-orchids
    const h1 = [[24, 40], [28, 38], [20, 42], [24, 44]] as const;
    for (const [hx, hy] of h1) {
      rect(ctx, hx - 2, hy - 3, 5, 4, OUT);
      rect(ctx, hx - 2, hy - 3, 2, 3, LEAF_DARK);
      rect(ctx, hx, hy - 3, 2, 3, LEAF_MID);
      rect(ctx, hx - 1, hy - 4, 3, 1, LEAF_HIGHLIGHT);
    }
    const orchids = [[23, 41], [27, 39], [21, 43], [25, 43]] as const;
    for (const [fx0, fy0] of orchids) {
      px(ctx, fx0, fy0 - 1, '#ba68c8');
      px(ctx, fx0, fy0 - 2, '#e1bee7');
      px(ctx, fx0, fy0, LEAF_LIGHT);
    }

    // Quadrant 2 (back-right): Golden sylvan lilies
    const lilies = [[38, 39], [42, 41], [36, 42], [40, 43]] as const;
    for (const [rx0, ry0] of lilies) {
      rect(ctx, rx0 - 1, ry0 - 1, 3, 2, LEAF_DARK);
      px(ctx, rx0, ry0 - 1, GOLD_LIGHT);
      px(ctx, rx0 + 1, ry0 - 2, '#fff59d');
    }

    // Quadrant 3 (front-left): Glowing silver-blue starlight blossoms
    const starBlooms = [[22, 50], [26, 52], [20, 52], [24, 54]] as const;
    for (const [mx0, my0] of starBlooms) {
      rect(ctx, mx0 - 1, my0 - 1, 3, 2, LEAF_MID);
      px(ctx, mx0, my0 - 1, frame === 0 ? LANTERN_CORE : LANTERN_MID);
      px(ctx, mx0 + 1, my0 - 2, '#ffffff');
    }

    // Quadrant 4 (front-right): Crescent moon reflection pool with water lilies
    const pondX = 40;
    const pondY = 51;
    isoDiamond(ctx, pondX, pondY, 8, IVORY_LIGHT, OUT);
    isoDiamond(ctx, pondX, pondY, 6, LANTERN_MID, LANTERN_DIM);
    px(ctx, pondX - 1, pondY, LEAF_LIGHT);
    px(ctx, pondX, pondY, LEAF_HIGHLIGHT);
    px(ctx, pondX + 1, pondY - 1, GOLD_LIGHT);
    px(ctx, pondX + 1, pondY - 2, frame === 0 ? '#ffffff' : LANTERN_CORE);

    // Carved ivory elven meditation bench on left walk
    const bx = 22;
    const by = 48;
    rect(ctx, bx - 2, by - 2, 6, 4, OUT);
    rect(ctx, bx - 1, by - 1, 4, 2, IVORY_LIGHT);
    rect(ctx, bx - 1, by + 1, 4, 1, IVORY_DARK);
    rect(ctx, bx - 2, by - 3, 5, 1, GOLD_MID);

    return canvas;
  });
}

/** 19. THEATER (height 1.5): Grand Elven Odeon / Amphitheater of the Stars (2 frames). */
function buildElfTheater(): HTMLCanvasElement[] {
  return [0, 1].map((frame) => {
    const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

    // Paved civic odeon terrace with emerald-and-gold runner promenade
    isoDiamond(ctx, 32, 48, 28, LEAF_DARK, OUT);
    isoDiamond(ctx, 32, 48, 24, EMERALD_MID, GOLD_DARK);

    // Emerald-and-gold carpet promenade runner along right-up axis
    for (let r = 0; r < 14; r++) {
      const rx0 = 36 + r;
      const ry0 = 57 - (r >> 1);
      rect(ctx, rx0 - 2, ry0, 4, 1, EMERALD_DARK);
      px(ctx, rx0 - 2, ry0, GOLD_LIGHT);
      px(ctx, rx0 + 2, ry0, GOLD_LIGHT);
    }

    // Grand ivory & living-bark theater hall
    const fx = 31;
    const fy = 54;
    const wL = 16;
    const wR = 18;
    const wallH = 19;

    isoBox(ctx, fx, fy, wL, wR, wallH, {
      top: IVORY_LIGHT,
      left: IVORY_DARK,
      right: IVORY_MID,
    });

    // Fluted living-wood pilasters along right wall
    for (const v0 of [1, 6, 12, 16]) {
      rightWallRect(ctx, fx, fy, v0, 0, 1, wallH, GOLD_MID);
    }
    for (const u0 of [2, 8, 13]) {
      leftWallRect(ctx, fx, fy, u0, 0, 1, wallH, BARK_LIGHT);
    }

    // Grand arched portal on front-right wall
    rightWallRect(ctx, fx, fy, 4, 1, 8, 9, OUT);
    rightWallRect(ctx, fx, fy, 5, 1, 6, 8, '#0b1f16');

    // Draped emerald-and-gold stage velvet curtains
    rightWallRect(ctx, fx, fy, 5, 2, 2, 7, LEAF_MID);
    rightWallRect(ctx, fx, fy, 5, 4, 1, 1, GOLD_LIGHT);
    rightWallRect(ctx, fx, fy, 9, 2, 2, 7, LEAF_MID);
    rightWallRect(ctx, fx, fy, 10, 4, 1, 1, GOLD_LIGHT);

    // Carved golden elven lyre & star emblem pediment above entrance
    rightWallRect(ctx, fx, fy, 4, 11, 8, 4, OUT);
    rightWallRect(ctx, fx, fy, 5, 12, 6, 2, GOLD_LIGHT);
    px(ctx, fx + 6, fy - 12, GOLD_DARK);
    px(ctx, fx + 8, fy - 12, GOLD_DARK);
    px(ctx, fx + 7, fy - 13, '#ffffff');

    // Arched stained-glass windows on left wall
    leftWallRect(ctx, fx, fy, 3, 5, 4, 6, OUT);
    leftWallRect(ctx, fx, fy, 4, 6, 2, 4, LANTERN_MID);
    leftWallRect(ctx, fx, fy, 9, 5, 4, 6, OUT);
    leftWallRect(ctx, fx, fy, 10, 6, 2, 4, LEAF_HIGHLIGHT);

    // Sweeping emerald leaf-shingle pitched roof
    isoPitchedRoof(ctx, fx, fy, wL + 2, wR + 2, wallH, 8, {
      leftSlope: EMERALD_DARK,
      rightSlope: LEAF_MID,
      gable: IVORY_LIGHT,
      ridge: GOLD_LIGHT,
    });

    // Twin silver-wood flagpoles with waving emerald-and-gold sylvan swallowtail pennants
    drawElvenBanner(ctx, 23, 13, 12, 5, 4, LEAF_MID, GOLD_LIGHT, frame);
    drawElvenBanner(ctx, 38, 6, 12, 5, 4, LEAF_MID, GOLD_LIGHT, frame);

    return canvas;
  });
}

/** 20. OBSERVATORY (height 2.0): Sylvan Star-Tower & Astromancer's Glass Dome (2 frames). */
function buildElfObservatory(): HTMLCanvasElement[] {
  return [0, 1].map((frame) => {
    const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

    // Sacred astronomical star-terrace with silver star dial
    isoDiamond(ctx, 32, 48, 28, LEAF_DARK, OUT);
    isoDiamond(ctx, 32, 48, 24, EMERALD_DARK, GOLD_DARK);

    // Inlaid golden celestial star-rose in paving
    px(ctx, 32, 48, GOLD_LIGHT);
    px(ctx, 32, 46, LANTERN_CORE);
    px(ctx, 32, 50, LANTERN_CORE);
    px(ctx, 30, 48, LANTERN_CORE);
    px(ctx, 34, 48, LANTERN_CORE);

    // Slender round/octagonal ivory and silver-bark tower (y=52 to y=28, height 24)
    const baseY = 52;
    const topY = 28;
    const towerH = baseY - topY;

    for (let dy = 0; dy <= towerH; dy++) {
      const y = baseY - dy;
      const r = Math.round(9 - (dy * 1) / towerH);
      const span = r * 2;
      const x0 = 32 - r;

      rect(ctx, x0 - 1, y, span + 2, 1, OUT);
      rect(ctx, x0, y, r, 1, IVORY_DARK);
      rect(ctx, 32, y, r, 1, IVORY_LIGHT);
      px(ctx, 32 + (r >> 1), y, '#ffffff');

      if (dy <= 3) {
        rect(ctx, x0, y, r, 1, BARK_DARK);
        rect(ctx, 32, y, r, 1, BARK_LIGHT);
      }
    }

    // Spiraling emerald vine & starlight runes up the tower
    for (const dy of [8, 14, 20]) {
      const y = baseY - dy;
      rect(ctx, 28, y, 8, 1, LEAF_MID);
      px(ctx, 33, y, frame === 0 ? LANTERN_CORE : LANTERN_MID);
      px(ctx, 35, y, GOLD_LIGHT);
    }

    // Arched sylvan portal at base
    rect(ctx, 33, 47, 4, 6, OUT);
    rect(ctx, 34, 48, 2, 5, EMERALD_DARK);
    px(ctx, 35, 50, GOLD_LIGHT);

    // Celestial 8-pointed star medallion mounted above entrance at (32, 36)
    disc(ctx, 32, 36, 3, OUT);
    disc(ctx, 32, 36, 2, GOLD_LIGHT);
    px(ctx, 32, 34, '#ffffff');
    px(ctx, 32, 38, '#ffffff');
    px(ctx, 30, 36, '#ffffff');
    px(ctx, 34, 36, '#ffffff');

    // Observation walkway balustrade ring at y=28
    for (let u = -10; u <= 10; u++) {
      const gx = 32 + u;
      const gy = 28 - Math.round(Math.sqrt(Math.max(0, 100 - u * u)) * 0.3);
      px(ctx, gx, gy, GOLD_LIGHT);
      px(ctx, gx, gy - 2, OUT);
    }

    // Hemispherical emerald-and-glass observation dome atop tower
    for (let dy = 0; dy <= 8; dy++) {
      const r = Math.round(Math.sqrt(Math.max(0, 64 - dy * dy)));
      const y = 26 - dy;
      rect(ctx, 32 - r - 1, y, r * 2 + 2, 1, OUT);
      rect(ctx, 32 - r, y, r, 1, EMERALD_DARK);
      rect(ctx, 32, y, r, 1, EMERALD_LIGHT);
      px(ctx, 32 + (r >> 1), y, LEAF_HIGHLIGHT);
    }

    // Open viewing slit in dome
    rect(ctx, 31, 18, 3, 9, OUT);
    rect(ctx, 32, 19, 1, 8, '#081711');

    // Polished mithril & gold celestial telescope protruding from slit
    const telescope = [
      [32, 24],
      [33, 23],
      [34, 21],
      [35, 20],
      [36, 18],
      [37, 17],
      [38, 16],
    ] as const;
    for (const [tx0, ty0] of telescope) {
      rect(ctx, tx0 - 1, ty0, 3, 2, OUT);
      rect(ctx, tx0, ty0, 2, 1, GOLD_LIGHT);
      px(ctx, tx0, ty0, '#ffffff');
    }
    disc(ctx, 39, 15, 2, OUT);
    disc(ctx, 39, 15, 1, frame === 0 ? LANTERN_CORE : LANTERN_MID);
    px(ctx, 39, 15, '#ffffff');

    // Floating starlight crystal finial at dome apex
    disc(ctx, 32, 14, frame === 0 ? 3 : 2, LANTERN_MID);
    px(ctx, 32, 14, LANTERN_CORE);

    return canvas;
  });
}

/** 21. HOSPITAL (height 1.6): High House of Healing / Moonleaf Sanitarium (2 frames). */
function buildElfHospital(): HTMLCanvasElement[] {
  return [0, 1].map((frame) => {
    const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

    // Sanitarium herb meadow & paved ivory apron
    isoDiamond(ctx, 32, 48, 28, LEAF_DARK, OUT);
    isoDiamond(ctx, 32, 48, 25, '#225538', GOLD_DARK);
    isoDiamond(ctx, 32, 50, 20, IVORY_MID, '#87806f');

    // Central main ivory hall
    const fx = 32;
    const fy = 52;
    const wL = 16;
    const wR = 18;
    const wallH = 17;

    isoBox(ctx, fx, fy, wL, wR, wallH, {
      top: '#ffffff',
      left: IVORY_DARK,
      right: IVORY_LIGHT,
    });

    // Projecting forward left wing
    const lFx = 23;
    const lFy = 55;
    isoBox(ctx, lFx, lFy, 8, 7, 15, {
      top: '#ffffff',
      left: IVORY_DARK,
      right: IVORY_MID,
    });
    isoPitchedRoof(ctx, lFx, lFy, 9, 8, 15, 5, {
      leftSlope: EMERALD_DARK,
      rightSlope: LEAF_MID,
      gable: IVORY_LIGHT,
      ridge: GOLD_LIGHT,
    });

    // Projecting forward right wing
    const rFx = 41;
    const rFy = 51;
    isoBox(ctx, rFx, rFy, 7, 8, 15, {
      top: '#ffffff',
      left: IVORY_MID,
      right: IVORY_LIGHT,
    });
    isoPitchedRoof(ctx, rFx, rFy, 8, 9, 15, 5, {
      leftSlope: EMERALD_DARK,
      rightSlope: LEAF_MID,
      gable: IVORY_LIGHT,
      ridge: GOLD_LIGHT,
    });

    // Main central pitched emerald roof
    isoPitchedRoof(ctx, fx, fy, wL + 2, wR + 2, wallH, 7, {
      leftSlope: EMERALD_DARK,
      rightSlope: LEAF_MID,
      gable: IVORY_LIGHT,
      ridge: GOLD_LIGHT,
    });

    // Orderly arched healing sanctuary windows with soft cyan/starlight glow
    const winR = [
      [2, 4], [6, 4], [10, 4],
      [2, 10], [6, 10], [10, 10],
    ] as const;
    for (const [v0, z0] of winR) {
      rightWallRect(ctx, fx, fy, v0, z0, 3, 4, OUT);
      rightWallRect(ctx, fx, fy, v0 + 1, z0 + 1, 2, 2, frame === 0 ? LANTERN_MID : LANTERN_CORE);
      px(ctx, fx + v0 + 1, fy - z0 - 1, '#ffffff');
    }

    const winL = [
      [2, 3], [5, 3],
      [2, 8], [5, 8],
    ] as const;
    for (const [u0, z0] of winL) {
      leftWallRect(ctx, lFx, lFy, u0, z0, 3, 4, OUT);
      leftWallRect(ctx, lFx, lFy, u0 + 1, z0 + 1, 2, 2, frame === 0 ? LANTERN_DIM : LANTERN_MID);
    }

    // Arched entrance door in central recess
    rightWallRect(ctx, fx, fy, 1, 1, 4, 7, OUT);
    rightWallRect(ctx, fx, fy, 2, 1, 2, 6, EMERALD_DARK);
    rightWallRect(ctx, fx, fy, 2, 7, 2, 1, GOLD_LIGHT);

    // Glowing emerald-and-white sylvan healing cross medallion on central gable
    const crossX = 32;
    const crossY = 27;
    disc(ctx, crossX, crossY, 4, OUT);
    disc(ctx, crossX, crossY, 3, '#ffffff');
    rect(ctx, crossX, crossY - 2, 1, 5, LEAF_LIGHT);
    rect(ctx, crossX - 2, crossY, 5, 1, LEAF_LIGHT);
    px(ctx, crossX, crossY, LEAF_HIGHLIGHT);

    // Moonleaf planters along right wing terrace
    rect(ctx, 42, 45, 6, 2, BARK_DARK);
    rect(ctx, 42, 44, 6, 1, LEAF_LIGHT);
    px(ctx, 44, 43, frame === 0 ? LANTERN_CORE : LANTERN_MID);
    px(ctx, 46, 43, frame === 0 ? LANTERN_MID : LANTERN_CORE);

    // Healing cart in front courtyard
    const cX = 35;
    const cY = 57;
    isoBox(ctx, cX, cY, 4, 6, 4, {
      top: IVORY_LIGHT,
      left: BARK_DARK,
      right: BARK_MID,
    });
    px(ctx, cX + 2, cY - 3, LEAF_LIGHT);
    disc(ctx, cX - 2, cY + 1, 2, OUT);
    disc(ctx, cX - 2, cY + 1, 1, GOLD_MID);
    disc(ctx, cX + 4, cY - 1, 2, OUT);
    disc(ctx, cX + 4, cY - 1, 1, GOLD_MID);

    return canvas;
  });
}

/** 22. UNIVERSITY (height 2.2): High Sylvan Athenaeum / Academy of Elders (2 frames). */
function buildElfUniversity(): HTMLCanvasElement[] {
  return [0, 1].map((frame) => {
    const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

    // Grand collegiate cloister quadrangle footprint
    isoDiamond(ctx, 32, 48, 28, LEAF_DARK, OUT);
    isoDiamond(ctx, 32, 48, 25, EMERALD_DARK, GOLD_DARK);
    isoDiamond(ctx, 32, 48, 20, '#1c4a30', '#10301e');

    // Central sacred moon-pool & floating starlight lilies in quad lawn
    isoDiamond(ctx, 32, 48, 7, IVORY_LIGHT, OUT);
    isoDiamond(ctx, 32, 48, 5, frame === 0 ? LANTERN_MID : LANTERN_CORE);
    px(ctx, 32, 48, GOLD_LIGHT);

    // Left Wing: High Lore Hall (fx=23, fy=53, wL=12, wR=10, wallH=18)
    const lFx = 23;
    const lFy = 53;
    const lW = 12;
    const lR = 10;
    const lH = 18;

    isoBox(ctx, lFx, lFy, lW, lR, lH, {
      top: IVORY_LIGHT,
      left: IVORY_DARK,
      right: IVORY_MID,
    });

    // Tall arched traceried leaded windows on Great Hall
    const gWin = [[2, 4], [6, 4], [2, 11], [6, 11]] as const;
    for (const [v0, z0] of gWin) {
      rightWallRect(ctx, lFx, lFy, v0, z0, 3, 5, OUT);
      rightWallRect(ctx, lFx, lFy, v0 + 1, z0 + 1, 2, 3, LANTERN_MID);
      px(ctx, lFx + v0 + 1, lFy - z0 - 2, '#ffffff');
    }

    // Great Hall steep pitched emerald roof
    isoPitchedRoof(ctx, lFx, lFy, lW + 2, lR + 2, lH, 7, {
      leftSlope: EMERALD_DARK,
      rightSlope: LEAF_MID,
      gable: IVORY_LIGHT,
      ridge: GOLD_LIGHT,
    });

    // Left Corner Chancellor's Turret & Spire
    const t1X = 16;
    const t1Y = 37;
    isoBox(ctx, t1X, t1Y, 5, 5, 14, { top: IVORY_LIGHT, left: IVORY_DARK, right: IVORY_MID });
    drawElvenSpire(ctx, t1X - 1, t1Y - 14, 4, 8, EMERALD_DARK, LEAF_MID, GOLD_LIGHT);

    // Right Wing: Ancient Lore Library & Cloister Gallery (fx=43, fy=49, wL=10, wR=14, wallH=16)
    const rFx = 43;
    const rFy = 49;
    const rW = 10;
    const rR = 14;
    const rH = 16;

    isoBox(ctx, rFx, rFy, rW, rR, rH, {
      top: IVORY_LIGHT,
      left: IVORY_DARK,
      right: IVORY_MID,
    });

    // Cloister arched gallery openings facing courtyard
    for (const u0 of [1, 4, 7]) {
      leftWallRect(ctx, rFx, rFy, u0, 1, 2, 6, OUT);
      leftWallRect(ctx, rFx, rFy, u0, 2, 2, 4, EMERALD_DARK);
      px(ctx, rFx - u0, rFy - 3, GOLD_LIGHT);
    }
    // Library windows on right outer wall
    for (const v0 of [2, 6, 10]) {
      rightWallRect(ctx, rFx, rFy, v0, 5, 3, 5, OUT);
      rightWallRect(ctx, rFx, rFy, v0 + 1, 6, 2, 3, LANTERN_MID);
    }

    isoPitchedRoof(ctx, rFx, rFy, rW + 2, rR + 2, rH, 7, {
      leftSlope: EMERALD_DARK,
      rightSlope: LEAF_MID,
      gable: IVORY_LIGHT,
      ridge: GOLD_LIGHT,
    });

    // Central Gothic Quad Portal Gallery connecting the wings
    const cFx = 31;
    const cFy = 41;
    isoBox(ctx, cFx, cFy, 8, 8, 12, { top: IVORY_LIGHT, left: IVORY_DARK, right: IVORY_MID });

    // Central Academic Rotunda Dome with living leaf canopy
    drawElvenCanopy(ctx, 32, 25, 7, 5, frame % 2);

    // Soaring Central Spire rising high from clocktower
    drawElvenSpire(ctx, 32, 16, 4, 11, EMERALD_DARK, LEAF_MID, GOLD_LIGHT);

    // University Heraldic Banners hanging from gallery facade
    drawElvenBanner(ctx, 22, 36, 9, 4, 5, LEAF_MID, GOLD_LIGHT, frame);
    drawElvenBanner(ctx, 39, 31, 9, 4, 5, LEAF_MID, GOLD_LIGHT, frame);

    return canvas;
  });
}

// ============================================================================
// MILITARY (palisade, watchtower, armory, warcamp, fortress)
// ============================================================================

/** 23. PALISADE (height 0.8): Living Ironwood & Brier Stockade. */
function buildElfPalisade(): HTMLCanvasElement[] {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  // Deep moss embankment and defensive ditch
  isoDiamond(ctx, 32, 48, 25, LEAF_DARK, OUT);
  isoDiamond(ctx, 32, 48, 21, EMERALD_DARK, '#133522');

  // Raised walkway behind the stockade
  isoBox(ctx, 24, 43, 10, 4, 6, { top: BARK_LIGHT, left: BARK_DARK, right: BARK_MID });
  isoBox(ctx, 40, 43, 4, 10, 6, { top: BARK_LIGHT, left: BARK_DARK, right: BARK_MID });

  // Rear living root supports
  rect(ctx, 16, 42, 2, 7, BARK_DARK);
  rect(ctx, 46, 42, 2, 7, BARK_DARK);

  // Front-left sharpened ironwood stake section
  const leftStart = 28;
  const leftBaseY = 49;
  for (let u = 0; u < 16; u++) {
    const x = leftStart - u;
    const yBot = leftBaseY - (u >> 1);
    const stakeH = u % 3 === 0 ? 14 : u % 3 === 1 ? 12 : 13;
    const yTop = yBot - stakeH;
    rect(ctx, x, yTop, 1, stakeH, u % 2 === 0 ? BARK_LIGHT : BARK_MID);
    px(ctx, x, yTop - 1, GOLD_LIGHT);
    if (u % 3 === 0) px(ctx, x, yTop - 2, LEAF_HIGHLIGHT);
    if (stakeH >= 8) {
      px(ctx, x, yBot - 4, LEAF_MID);
      px(ctx, x, yBot - 8, LEAF_LIGHT);
    }
    px(ctx, x, yBot, OUT);
  }

  // Front-right sharpened ironwood stake section
  const rightStart = 36;
  const rightBaseY = 49;
  for (let v = 0; v < 16; v++) {
    const x = rightStart + v;
    const yBot = rightBaseY - (v >> 1);
    const stakeH = v % 3 === 0 ? 14 : v % 3 === 1 ? 12 : 13;
    const yTop = yBot - stakeH;
    rect(ctx, x, yTop, 1, stakeH, v % 2 === 0 ? BARK_MID : BARK_DARK);
    px(ctx, x, yTop - 1, GOLD_LIGHT);
    if (v % 3 === 0) px(ctx, x, yTop - 2, LEAF_HIGHLIGHT);
    if (stakeH >= 8) {
      px(ctx, x, yBot - 4, LEAF_MID);
      px(ctx, x, yBot - 8, LEAF_LIGHT);
    }
    px(ctx, x, yBot, OUT);
  }

  // Central elven arbor gate structure
  rect(ctx, 28, 33, 2, 17, OUT);
  rect(ctx, 28, 34, 2, 15, IVORY_MID);
  px(ctx, 28, 32, GOLD_LIGHT);

  rect(ctx, 34, 33, 2, 17, OUT);
  rect(ctx, 34, 34, 2, 15, IVORY_LIGHT);
  px(ctx, 34, 32, GOLD_LIGHT);

  // Overhead arched bough lintel
  rect(ctx, 27, 34, 10, 3, OUT);
  rect(ctx, 28, 35, 8, 1, GOLD_MID);
  for (let sx = 29; sx <= 34; sx += 2) {
    px(ctx, sx, 33, LEAF_LIGHT);
  }

  // Gate heartwood doors with bronze vine hinges
  rect(ctx, 30, 38, 4, 12, OUT);
  rect(ctx, 30, 39, 2, 10, BARK_DARK);
  rect(ctx, 32, 40, 2, 9, BARK_MID);
  rect(ctx, 28, 41, 6, 1, GOLD_MID);
  rect(ctx, 28, 47, 6, 1, GOLD_MID);
  px(ctx, 29, 41, GOLD_LIGHT);
  px(ctx, 29, 47, GOLD_LIGHT);

  // Thorny stakes in front of ditch
  for (let i = 0; i < 4; i++) {
    const sx = 22 + i * 6;
    const sy = 55 - (i > 1 ? (i - 1) * 2 : 0);
    rect(ctx, sx, sy, 1, 3, BARK_DARK);
    px(ctx, sx, sy - 1, LEAF_LIGHT);
  }

  return [canvas];
}

/** 24. WATCHTOWER (height 2.0): Sylvan Sentinel Perch & Starlight Beacon (2 frames). */
function buildElfWatchtower(): HTMLCanvasElement[] {
  return [0, 1].map((frame) => {
    const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

    // Sacred glade outpost clearing
    isoDiamond(ctx, 32, 50, 18, LEAF_DARK, OUT);
    isoDiamond(ctx, 32, 50, 14, EMERALD_MID, GOLD_DARK);

    // Living root footing blocks on the ground
    const stilts = [
      { x: 31, y: 55 },
      { x: 21, y: 50 },
      { x: 41, y: 50 },
      { x: 31, y: 45 },
    ];
    for (const s of stilts) {
      rect(ctx, s.x, s.y, 2, 2, BARK_DARK);
      px(ctx, s.x, s.y, LEAF_MID);
    }

    // Slender silver-bark stilts rising up to lookout deck at y=28
    rect(ctx, 31, 28, 2, 17, IVORY_DARK);
    rect(ctx, 21, 28, 2, 22, IVORY_MID);
    rect(ctx, 41, 28, 2, 22, IVORY_LIGHT);
    rect(ctx, 31, 30, 2, 25, IVORY_LIGHT);

    // Living vine X-bracing between stilts
    for (let dy = 0; dy < 16; dy += 2) {
      px(ctx, 22 + (dy >> 1), 48 - dy, LEAF_MID);
      px(ctx, 31 - (dy >> 1), 48 - dy, LEAF_LIGHT);
      px(ctx, 31 + (dy >> 1), 48 - dy, LEAF_MID);
      px(ctx, 41 - (dy >> 1), 48 - dy, LEAF_LIGHT);
    }

    // Vine ladder
    for (let ly = 32; ly <= 52; ly += 3) {
      rect(ctx, 26, ly, 4, 1, GOLD_MID);
    }
    rect(ctx, 26, 30, 1, 23, BARK_DARK);
    rect(ctx, 29, 30, 1, 23, BARK_DARK);

    // Lookout platform deck at y=27..29
    isoBox(ctx, 32, 29, 11, 11, 2, { top: IVORY_LIGHT, left: IVORY_DARK, right: IVORY_MID });

    // Gold filigree guard railings around platform
    leftWallRect(ctx, 32, 29, 0, 2, 11, 4, OUT);
    leftWallRect(ctx, 32, 29, 1, 3, 9, 2, GOLD_DARK);
    rightWallRect(ctx, 32, 29, 0, 2, 11, 4, OUT);
    rightWallRect(ctx, 32, 29, 1, 3, 9, 2, GOLD_LIGHT);

    // 4 slender ivory corner posts supporting roof
    rect(ctx, 22, 17, 2, 11, IVORY_DARK);
    rect(ctx, 40, 17, 2, 11, IVORY_LIGHT);
    rect(ctx, 31, 17, 2, 11, IVORY_LIGHT);
    rect(ctx, 31, 15, 2, 11, IVORY_MID);

    // Elven sentinel archer silhouette with recurve bow
    rect(ctx, 29, 20, 3, 5, EMERALD_DARK);
    px(ctx, 30, 19, IVORY_LIGHT);
    rect(ctx, 27, 18, 1, 8, GOLD_LIGHT);

    // Sweeping living leaf-canopy roof
    drawElvenCanopy(ctx, 32, 17, 13, 8, frame % 2);

    // Hanging silver lantern on corner branch arm
    drawSilverLantern(ctx, 43, 23, frame);

    return canvas;
  });
}

/** 25. ARMORY (height 1.3): Elven Bowyer & Mithril Weapon-Keep. */
function buildElfArmory(): HTMLCanvasElement[] {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  // Courtyard glade with ivory paving
  isoDiamond(ctx, 32, 48, 26, LEAF_DARK, OUT);
  isoDiamond(ctx, 32, 48, 22, IVORY_MID, GOLD_DARK);

  // Fortified ivory & emerald stone storehouse
  const fx = 28;
  const fy = 53;
  const wL = 14;
  const wR = 13;
  const wallH = 16;

  isoBox(ctx, fx, fy, wL, wR, wallH, {
    top: IVORY_LIGHT,
    left: IVORY_DARK,
    right: IVORY_MID,
  });

  // Gold & emerald trim courses
  for (const z of [4, 8, 12]) {
    leftWallRect(ctx, fx, fy, 1, z, wL - 2, 1, GOLD_DARK);
    rightWallRect(ctx, fx, fy, 1, z, wR - 2, 1, GOLD_MID);
  }

  // Sweeping emerald-tile pitched roof
  isoPitchedRoof(ctx, fx, fy, wL, wR, wallH, 8, {
    leftSlope: EMERALD_DARK,
    rightSlope: LEAF_MID,
    gable: IVORY_LIGHT,
    ridge: GOLD_LIGHT,
  });

  // Small defensive turret on roof ridge
  isoBox(ctx, 24, 34, 4, 4, 9, { top: IVORY_LIGHT, left: IVORY_DARK, right: IVORY_MID });
  drawElvenSpire(ctx, 24, 25, 3, 6, EMERALD_DARK, LEAF_MID, GOLD_LIGHT);

  // Storehouse door of polished heartwood with gold straps
  leftWallRect(ctx, fx, fy, 4, 1, 5, 8, OUT);
  leftWallRect(ctx, fx, fy, 5, 1, 3, 7, BARK_DARK);
  leftWallRect(ctx, fx, fy, 5, 3, 3, 1, GOLD_LIGHT);
  leftWallRect(ctx, fx, fy, 5, 6, 3, 1, GOLD_LIGHT);

  // Arched arrow slits with starlight glint
  rightWallRect(ctx, fx, fy, 3, 8, 2, 5, OUT);
  rightWallRect(ctx, fx, fy, 3, 10, 1, 1, LANTERN_CORE);
  rightWallRect(ctx, fx, fy, 8, 8, 2, 5, OUT);
  rightWallRect(ctx, fx, fy, 8, 10, 1, 1, LANTERN_CORE);

  // Mounted elven shields on wall
  rightWallRect(ctx, fx, fy, 3, 3, 3, 3, OUT);
  rightWallRect(ctx, fx, fy, 3, 3, 3, 3, EMERALD_DARK);
  rightWallRect(ctx, fx, fy, 4, 4, 1, 1, GOLD_LIGHT);

  rightWallRect(ctx, fx, fy, 8, 3, 3, 4, OUT);
  rightWallRect(ctx, fx, fy, 8, 3, 3, 3, LANTERN_MID);
  rightWallRect(ctx, fx, fy, 9, 2, 1, 2, LANTERN_CORE);

  // Smithing porch under living bough
  rect(ctx, 36, 44, 2, 9, BARK_DARK);
  rect(ctx, 46, 40, 2, 9, BARK_MID);
  rect(ctx, 36, 43, 12, 2, LEAF_MID);

  // Mithril anvil on heartwood stump
  rect(ctx, 39, 49, 4, 4, BARK_LIGHT);
  rect(ctx, 38, 47, 6, 3, OUT);
  rect(ctx, 39, 47, 4, 2, IVORY_LIGHT);
  px(ctx, 40, 47, '#ffffff');
  px(ctx, 43, 47, GOLD_LIGHT);

  // Quenching basin of starlight water
  rect(ctx, 43, 52, 6, 4, BARK_DARK);
  rect(ctx, 44, 52, 4, 2, LANTERN_MID);
  px(ctx, 45, 52, LANTERN_CORE);

  // Weapon rack with golden recurve bows and silver spears
  rect(ctx, 33, 48, 4, 7, BARK_DARK);
  rect(ctx, 34, 44, 1, 10, IVORY_LIGHT);
  px(ctx, 34, 43, '#ffffff');
  rect(ctx, 36, 46, 1, 8, GOLD_MID);
  px(ctx, 36, 50, GOLD_LIGHT);

  return [canvas];
}

/** 26. WARCAMP (height 1.0): Sylvan Ranger Encampment & Waywatcher Glade (2 frames). */
function buildElfWarcamp(): HTMLCanvasElement[] {
  return [0, 1].map((frame) => {
    const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

    // Trampled moss & needle encampment clearing
    isoDiamond(ctx, 32, 48, 26, LEAF_DARK, OUT);
    isoDiamond(ctx, 32, 48, 22, '#214f32', BARK_DARK);

    // 1. Back-left Large Command Pavilion Tent (apex at 23, 24)
    const pApexX = 23;
    const pApexY = 24;
    for (let dy = 0; dy <= 16; dy++) {
      const span = Math.round((dy * 9) / 16);
      const y = pApexY + dy;
      rect(ctx, pApexX - span - 1, y, (span + 1) * 2, 1, OUT);
      rect(ctx, pApexX - span, y, span, 1, EMERALD_DARK);
      rect(ctx, pApexX, y, span, 1, EMERALD_LIGHT);
    }
    rect(ctx, pApexX - 6, pApexY + 10, 13, 1, GOLD_LIGHT);
    rect(ctx, pApexX - 2, pApexY + 11, 4, 6, BARK_DARK);
    rect(ctx, pApexX - 1, pApexY + 12, 2, 5, '#0c1f17');
    rect(ctx, pApexX, pApexY - 3, 1, 4, GOLD_LIGHT);
    rect(ctx, pApexX + 1, pApexY - 3, 4, 2, LEAF_MID);

    // 2. Back-right Ridge / Wedge Tent
    for (let u = 0; u < 10; u++) {
      const rx = 36 + u;
      const ry = 33 - (u >> 1);
      for (let h = 0; h < 9; h++) {
        const y = ry + h;
        rect(ctx, rx - 4, y, 4, 1, LEAF_MID);
        rect(ctx, rx, y, 4, 1, LEAF_LIGHT);
      }
      px(ctx, rx, ry, GOLD_LIGHT);
    }

    // 3. Front-left small ranger bivy shelter
    for (let h = 0; h < 7; h++) {
      const y = 49 - h;
      const w = 7 - h;
      rect(ctx, 16 - (w >> 1), y, w, 1, EMERALD_MID);
    }
    px(ctx, 16, 42, GOLD_LIGHT);

    // 4. Central Magical Campfire at (33, 48)
    disc(ctx, 33, 48, 5, BARK_DARK);
    disc(ctx, 33, 48, 4, '#173022');
    rect(ctx, 31, 48, 5, 2, BARK_LIGHT);

    // Cooking tripod spit
    rect(ctx, 30, 44, 1, 5, BARK_DARK);
    rect(ctx, 36, 44, 1, 5, BARK_DARK);
    rect(ctx, 30, 44, 7, 1, BARK_DARK);
    rect(ctx, 32, 45, 3, 2, GOLD_MID);

    // Sylvan emerald-and-gold fire animation (2 frames)
    if (frame === 0) {
      rect(ctx, 32, 45, 3, 3, LEAF_LIGHT);
      px(ctx, 33, 46, GOLD_LIGHT);
      px(ctx, 33, 44, LEAF_HIGHLIGHT);
      px(ctx, 34, 43, '#ffffff');
    } else {
      rect(ctx, 31, 46, 4, 2, LEAF_LIGHT);
      px(ctx, 32, 45, '#ffffff');
      px(ctx, 34, 44, GOLD_LIGHT);
      px(ctx, 32, 43, LEAF_HIGHLIGHT);
    }

    // 5. Weapon crates & arrow quivers
    isoBox(ctx, 43, 50, 4, 4, 4, { top: IVORY_LIGHT, left: BARK_DARK, right: BARK_MID });
    isoBox(ctx, 47, 48, 4, 4, 4, { top: IVORY_LIGHT, left: BARK_DARK, right: BARK_MID });

    rect(ctx, 39, 52, 4, 4, BARK_DARK);
    rect(ctx, 39, 53, 4, 1, GOLD_LIGHT);

    // Tall silver-wood banner pole with waving elven ranger flag
    const flagX = 46;
    const flagY = 36;
    drawElvenBanner(ctx, flagX, flagY - 12, 18, 6, 4, LEAF_MID, GOLD_LIGHT, frame);

    return canvas;
  });
}

/** 27. FORTRESS (height 2.3): Citadel of the Silver Star / Sylvan High Bastion. */
function buildElfFortress(): HTMLCanvasElement[] {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  // Broad foundation terrace pad
  isoDiamond(ctx, 32, 53, 29, LEAF_DARK, OUT);
  isoDiamond(ctx, 32, 53, 25, EMERALD_DARK, GOLD_DARK);

  // 1. Lower Fortress Curtain Wall Terrace
  const bFx = 32;
  const bFy = 58;
  const bWL = 19;
  const bWR = 19;
  const bH = 7;

  isoBox(ctx, bFx, bFy, bWL, bWR, bH, {
    top: IVORY_LIGHT,
    left: IVORY_DARK,
    right: IVORY_MID,
  });

  // 2. Central Gatehouse Entrance
  rightWallRect(ctx, bFx, bFy, 5, 1, 8, 6, OUT);
  rightWallRect(ctx, bFx, bFy, 6, 1, 6, 5, EMERALD_DARK);
  for (let pb = 7; pb <= 10; pb++) {
    rightWallRect(ctx, bFx, bFy, pb, 1, 1, 5, GOLD_LIGHT);
  }

  // 3. Imposing Central Citadel Keep
  const kFx = 32;
  const kFy = 51;
  const kWL = 13;
  const kWR = 13;
  const kH = 23;

  isoBox(ctx, kFx, kFy, kWL, kWR, kH, {
    top: IVORY_LIGHT,
    left: IVORY_DARK,
    right: IVORY_MID,
  });

  // Gold & emerald string courses on keep
  for (const z of [6, 12, 18]) {
    leftWallRect(ctx, kFx, kFy, 1, z, kWL - 2, 1, GOLD_DARK);
    rightWallRect(ctx, kFx, kFy, 1, z, kWR - 2, 1, GOLD_MID);
  }

  // Arrow loops with starlight glint
  for (const z0 of [8, 15]) {
    leftWallRect(ctx, kFx, kFy, 5, z0, 2, 4, OUT);
    leftWallRect(ctx, kFx, kFy, 5, z0 + 1, 1, 2, LANTERN_CORE);
    rightWallRect(ctx, kFx, kFy, 5, z0, 2, 4, OUT);
    rightWallRect(ctx, kFx, kFy, 6, z0 + 1, 1, 2, LANTERN_CORE);
  }

  // 4. Two Flanking Bastion Towers with conical spires
  isoBox(ctx, 20, 51, 6, 6, 19, { top: IVORY_LIGHT, left: IVORY_DARK, right: IVORY_MID });
  isoBox(ctx, 44, 51, 6, 6, 19, { top: IVORY_LIGHT, left: IVORY_DARK, right: IVORY_MID });

  drawElvenSpire(ctx, 19, 31, 4, 9, EMERALD_DARK, LEAF_MID, GOLD_LIGHT);
  drawElvenSpire(ctx, 43, 31, 4, 9, EMERALD_DARK, LEAF_MID, GOLD_LIGHT);

  // 5. Overhanging Machicolated Parapet on Central Keep
  const topFy = kFy - kH;
  isoBox(ctx, kFx, topFy + 2, 15, 15, 4, {
    top: IVORY_LIGHT,
    left: IVORY_DARK,
    right: IVORY_MID,
  });

  const keepMerlons: readonly (readonly [number, number, number, number])[] = [
    [32, topFy - 7, 3, 3],
    [24, topFy - 3, 3, 3],
    [40, topFy - 3, 3, 3],
    [28, topFy + 1, 3, 3],
    [36, topFy + 1, 3, 3],
  ];
  for (const [mFx, mFy, mW, mH] of keepMerlons) {
    isoBox(ctx, mFx, mFy, mW, mH, 3, { top: '#ffffff', left: GOLD_DARK, right: GOLD_LIGHT });
  }

  // Soaring Central Spire atop Citadel Keep
  drawElvenSpire(ctx, 32, topFy - 5, 4, 14, EMERALD_DARK, LEAF_MID, GOLD_LIGHT);

  // Long emerald-and-gold sylvan heraldic wall banners
  leftWallRect(ctx, kFx, kFy, 3, 7, 4, 11, OUT);
  leftWallRect(ctx, kFx, kFy, 4, 8, 2, 9, LEAF_MID);
  leftWallRect(ctx, kFx, kFy, 4, 13, 2, 2, GOLD_LIGHT);

  rightWallRect(ctx, kFx, kFy, 3, 7, 4, 11, OUT);
  rightWallRect(ctx, kFx, kFy, 4, 8, 2, 9, LEAF_MID);
  rightWallRect(ctx, kFx, kFy, 4, 13, 2, 2, GOLD_LIGHT);

  return [canvas];
}

// ============================================================================
// DECORATION (flowerbed, hedge, well, pond, arch)
// ============================================================================

/** 28. FLOWERBED (height 0.3): Sylvan Star-Blossom Parterre. */
function buildElfFlowerbed(): HTMLCanvasElement[] {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  // Deep emerald moss surround
  isoDiamond(ctx, 32, 48, 26, LEAF_DARK, OUT);

  // Carved ivory and gold curbing
  isoDiamond(ctx, 32, 48, 22, IVORY_MID, GOLD_DARK);
  isoDiamond(ctx, 32, 48, 20, IVORY_LIGHT, GOLD_MID);

  // Rich sylvan compost loam
  isoDiamond(ctx, 32, 48, 18, BARK_DARK, '#19281a');

  // Miniature central lotus moon-bath pedestal
  rect(ctx, 31, 46, 2, 4, IVORY_LIGHT);
  rect(ctx, 30, 45, 4, 1, GOLD_LIGHT);
  px(ctx, 31, 44, LANTERN_CORE);

  // Mixed elven flower blooms
  const flowers: readonly (readonly [number, number, string, string])[] = [
    [26, 45, GOLD_LIGHT, '#ffffff'],
    [24, 47, GOLD_LIGHT, '#ffffff'],
    [25, 49, GOLD_MID, GOLD_LIGHT],
    [38, 45, GOLD_LIGHT, '#ffffff'],
    [40, 47, GOLD_LIGHT, '#ffffff'],
    [39, 49, GOLD_MID, GOLD_LIGHT],

    [30, 42, LANTERN_CORE, '#ffffff'],
    [34, 42, LANTERN_CORE, '#ffffff'],
    [30, 54, LANTERN_CORE, '#ffffff'],
    [34, 54, LANTERN_CORE, '#ffffff'],

    [28, 44, '#8e24aa', '#e1bee7'],
    [36, 44, '#8e24aa', '#e1bee7'],
    [27, 51, '#7b1fa2', '#ba68c8'],
    [37, 51, '#7b1fa2', '#ba68c8'],

    [32, 40, LANTERN_MID, LANTERN_CORE],
    [32, 56, LANTERN_MID, LANTERN_CORE],
    [22, 48, LANTERN_MID, LANTERN_CORE],
    [42, 48, LANTERN_MID, LANTERN_CORE],

    [29, 47, '#ffffff', GOLD_LIGHT],
    [35, 47, '#ffffff', GOLD_LIGHT],
    [29, 50, '#ffffff', GOLD_LIGHT],
    [35, 50, '#ffffff', GOLD_LIGHT],
  ];

  for (const [fx, fy, col, hi] of flowers) {
    px(ctx, fx - 1, fy, LEAF_DARK);
    px(ctx, fx + 1, fy, LEAF_MID);
    rect(ctx, fx, fy - 1, 2, 2, col);
    px(ctx, fx, fy - 1, hi);
  }

  // Extra leafy sprigs
  const leaves: readonly (readonly [number, number])[] = [
    [27, 43], [37, 43], [24, 46], [40, 46],
    [23, 49], [41, 49], [28, 53], [36, 53],
  ];
  for (const [lx, ly] of leaves) {
    px(ctx, lx, ly, LEAF_LIGHT);
    px(ctx, lx + 1, ly, LEAF_HIGHLIGHT);
  }

  return [canvas];
}

/** 29. HEDGE (height 0.5): Living Sylvan Topiary & Moon-Hedge. */
function buildElfHedge(): HTMLCanvasElement[] {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  // Flagstone path with ivory edging
  isoDiamond(ctx, 32, 48, 25, LEAF_DARK, OUT);
  isoDiamond(ctx, 32, 48, 21, IVORY_MID, GOLD_DARK);

  // Ivory edging stones
  for (let u = 0; u < 20; u += 4) {
    px(ctx, 32 - u, 48 - (u >> 1), IVORY_LIGHT);
    px(ctx, 32 + u, 48 - (u >> 1), IVORY_LIGHT);
    px(ctx, 32 - u, 48 + (u >> 1), IVORY_LIGHT);
    px(ctx, 32 + u, 48 + (u >> 1), IVORY_LIGHT);
  }

  // Main emerald hedge block
  const fx = 32;
  const fy = 53;
  const wL = 14;
  const wR = 14;
  const h = 9;

  isoBox(ctx, fx, fy, wL, wR, h, {
    top: LEAF_LIGHT,
    left: EMERALD_DARK,
    right: LEAF_MID,
  });

  // Dense foliage texture and golden berries
  for (let u = 1; u < wL - 1; u++) {
    for (let v = 1; v < wR - 1; v++) {
      if ((u * 3 + v * 7) % 5 === 0) {
        px(ctx, fx - 1 - u + v, fy - h - ((u + v + 1) >> 1), LEAF_HIGHLIGHT);
      } else if ((u * 5 + v * 3) % 7 === 0) {
        px(ctx, fx - 1 - u + v, fy - h - ((u + v + 1) >> 1), GOLD_LIGHT);
      }
    }
  }

  for (let v = 1; v < wR - 1; v++) {
    for (let z = 1; z < h - 1; z++) {
      if ((v * 5 + z * 3) % 4 === 0) {
        rightWallRect(ctx, fx, fy, v, z, 1, 1, LEAF_HIGHLIGHT);
      }
    }
  }

  for (let u = 1; u < wL - 1; u++) {
    for (let z = 1; z < h - 1; z++) {
      if ((u * 3 + z * 5) % 4 === 0) {
        leftWallRect(ctx, fx, fy, u, z, 1, 1, '#0e291e');
      }
    }
  }

  // Ivory & gold pedestal urn atop center
  rect(ctx, 30, 39, 4, 3, OUT);
  rect(ctx, 31, 40, 2, 2, IVORY_LIGHT);
  px(ctx, 31, 39, GOLD_LIGHT);

  // Sculpted elven topiary crescent-crown
  disc(ctx, 32, 33, 6, OUT);
  disc(ctx, 32, 33, 5, LEAF_MID);
  disc(ctx, 31, 32, 3, LEAF_LIGHT);
  disc(ctx, 30, 31, 2, LEAF_HIGHLIGHT);
  px(ctx, 30, 30, '#ffffff');

  px(ctx, 34, 31, GOLD_LIGHT);
  px(ctx, 33, 35, GOLD_LIGHT);
  px(ctx, 29, 34, LANTERN_CORE);

  return [canvas];
}

/** 30. WELL (height 0.7): Sylvan Moonwell. */
function buildElfWell(): HTMLCanvasElement[] {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  // Sacred glade flagstones
  isoDiamond(ctx, 32, 50, 20, LEAF_DARK, OUT);
  isoDiamond(ctx, 32, 50, 16, IVORY_MID, GOLD_DARK);

  // Shimmering starlight water splash
  isoDiamond(ctx, 35, 52, 4, LANTERN_MID);
  px(ctx, 35, 52, LANTERN_CORE);

  // Carved ivory stone well wall
  const fx = 32;
  const fy = 53;
  const wL = 10;
  const wR = 10;
  const wallH = 7;

  isoBox(ctx, fx, fy, wL, wR, wallH, {
    top: IVORY_LIGHT,
    left: IVORY_DARK,
    right: IVORY_MID,
  });

  // Gold trim bands on well wall
  leftWallRect(ctx, fx, fy, 1, 3, wL - 2, 1, GOLD_DARK);
  rightWallRect(ctx, fx, fy, 1, 3, wR - 2, 1, GOLD_LIGHT);

  // Deep silver-blue moon-water opening
  isoDiamond(ctx, 32, 44, 5, LANTERN_DIM, OUT);
  px(ctx, 32, 44, LANTERN_CORE);

  // Living silver-wood arbor posts supporting canopy
  rect(ctx, 24, 30, 2, 18, OUT);
  rect(ctx, 24, 31, 2, 16, IVORY_MID);
  rect(ctx, 38, 30, 2, 18, OUT);
  rect(ctx, 38, 31, 2, 16, IVORY_LIGHT);

  // Wooden windlass spindle & golden rope
  rect(ctx, 25, 33, 14, 2, BARK_LIGHT);
  rect(ctx, 30, 33, 4, 3, GOLD_LIGHT);
  rect(ctx, 31, 36, 1, 5, GOLD_LIGHT);

  // Carved ivory bucket suspended into well
  rect(ctx, 30, 41, 4, 4, OUT);
  rect(ctx, 31, 42, 2, 3, IVORY_LIGHT);
  rect(ctx, 30, 43, 4, 1, GOLD_LIGHT);

  // Golden turning crank handle
  rect(ctx, 40, 33, 3, 1, GOLD_MID);
  rect(ctx, 42, 34, 1, 3, GOLD_MID);
  px(ctx, 43, 36, GOLD_LIGHT);

  // Sweeping leaf canopy roof over well
  drawElvenCanopy(ctx, 32, 29, 10, 6, 0);

  // Hanging silver lantern under roof
  drawSilverLantern(ctx, 32, 29);

  // Second ivory bucket resting on paving
  rect(ctx, 22, 51, 4, 4, OUT);
  rect(ctx, 23, 52, 2, 3, IVORY_LIGHT);
  rect(ctx, 22, 53, 4, 1, GOLD_LIGHT);
  px(ctx, 23, 51, LANTERN_CORE);

  return [canvas];
}

/** 31. POND (height 0.2): Sylvan Swan-Mere & Starlight Waters (2 frames). */
function buildElfPond(): HTMLCanvasElement[] {
  return [0, 1].map((frame) => {
    const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

    // Deep emerald moss bank
    isoDiamond(ctx, 32, 48, 26, LEAF_DARK, OUT);
    isoDiamond(ctx, 32, 48, 22, '#1e5235', '#0f331e');

    // Smooth river pebbles
    const pebbles: readonly (readonly [number, number, string])[] = [
      [18, 48, IVORY_DARK], [20, 45, IVORY_MID], [24, 42, IVORY_LIGHT],
      [40, 42, IVORY_MID], [44, 45, IVORY_DARK], [46, 48, IVORY_MID],
      [22, 53, IVORY_MID], [26, 55, IVORY_LIGHT], [38, 55, IVORY_DARK], [42, 53, IVORY_MID],
    ];
    for (const [px0, py0, col] of pebbles) {
      rect(ctx, px0, py0, 2, 2, col);
      px(ctx, px0, py0, '#ffffff');
    }

    // Iridescent silver-blue enchanted water pool
    isoDiamond(ctx, 32, 48, 18, LANTERN_DIM, OUT);
    isoDiamond(ctx, 32, 48, 14, LANTERN_MID, '#1b647d');
    isoDiamond(ctx, 32, 48, 9, LANTERN_DIM);

    // Reeds & cattails with golden plumes
    rect(ctx, 36, 39, 1, 6, LEAF_MID);
    rect(ctx, 38, 40, 1, 5, LEAF_LIGHT);
    px(ctx, 36, 38, GOLD_LIGHT);
    px(ctx, 38, 39, GOLD_LIGHT);

    // Green lily pads with white moon-lotus flowers
    disc(ctx, 26, 47, 2, LEAF_MID);
    px(ctx, 26, 47, '#ffffff');
    px(ctx, 26, 46, GOLD_LIGHT);

    disc(ctx, 30, 52, 2, LEAF_LIGHT);
    px(ctx, 30, 52, '#ffffff');

    disc(ctx, 39, 47, 2, LEAF_MID);
    px(ctx, 39, 47, '#ffffff');

    // Elegant white elven swan swimming peacefully
    const swanY = frame === 0 ? 48 : 47;
    const swanX = 33;

    // Swan body
    rect(ctx, swanX - 2, swanY, 5, 3, IVORY_LIGHT);
    rect(ctx, swanX - 1, swanY + 1, 3, 2, '#ffffff');
    px(ctx, swanX - 3, swanY, '#ffffff');

    // Graceful arched neck & head
    rect(ctx, swanX + 2, swanY - 2, 2, 3, '#ffffff');
    px(ctx, swanX + 3, swanY - 3, '#ffffff');
    px(ctx, swanX + 4, swanY - 3, GOLD_MID);

    // Water shimmer & ripple wake (2 frames)
    if (frame === 0) {
      px(ctx, 28, 46, LANTERN_CORE);
      px(ctx, 29, 46, '#ffffff');
      px(ctx, 36, 50, LANTERN_CORE);
      px(ctx, 37, 50, '#ffffff');
      px(ctx, 32, 53, LANTERN_MID);
      px(ctx, swanX - 4, swanY + 1, LANTERN_CORE);
    } else {
      px(ctx, 29, 45, '#ffffff');
      px(ctx, 30, 45, LANTERN_CORE);
      px(ctx, 35, 51, '#ffffff');
      px(ctx, 36, 51, LANTERN_CORE);
      px(ctx, 27, 49, LANTERN_MID);
      px(ctx, swanX - 4, swanY + 2, '#ffffff');
      px(ctx, swanX - 5, swanY + 1, LANTERN_CORE);
    }

    return canvas;
  });
}

/** 32. ARCH (height 1.6): Great Portal of the Stars / Sylvan Triumphal Gateway. */
function buildElfArch(): HTMLCanvasElement[] {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  // Stepped monumental ivory & gold base plinth
  isoDiamond(ctx, 32, 53, 25, LEAF_DARK, OUT);
  isoDiamond(ctx, 32, 53, 21, IVORY_MID, GOLD_DARK);

  // Left monumental fluted ivory pier (fx=24, fy=52, pW=7, pH=18)
  const lFx = 24;
  const lFy = 52;
  const pW = 7;
  const pH = 18;

  isoBox(ctx, lFx, lFy, pW, pW, pH, {
    top: IVORY_LIGHT,
    left: IVORY_DARK,
    right: IVORY_MID,
  });

  // Fluting & creeping vines on left pier
  leftWallRect(ctx, lFx, lFy, 2, 2, 1, pH - 4, GOLD_DARK);
  leftWallRect(ctx, lFx, lFy, 4, 2, 1, pH - 4, LEAF_MID);
  rightWallRect(ctx, lFx, lFy, 2, 2, 1, pH - 4, GOLD_LIGHT);
  rightWallRect(ctx, lFx, lFy, 4, 2, 1, pH - 4, LEAF_LIGHT);

  // Right monumental fluted ivory pier (fx=44, fy=52, pW=7, pH=18)
  const rFx = 44;
  const rFy = 52;

  isoBox(ctx, rFx, rFy, pW, pW, pH, {
    top: IVORY_LIGHT,
    left: IVORY_DARK,
    right: IVORY_MID,
  });

  leftWallRect(ctx, rFx, rFy, 2, 2, 1, pH - 4, GOLD_DARK);
  leftWallRect(ctx, rFx, rFy, 4, 2, 1, pH - 4, LEAF_MID);
  rightWallRect(ctx, rFx, rFy, 2, 2, 1, pH - 4, GOLD_LIGHT);
  rightWallRect(ctx, rFx, rFy, 4, 2, 1, pH - 4, LEAF_LIGHT);

  // Spanning Arched Vault & Attic Story (fx=32, fy=34, aW=15, aH=9)
  const aFx = 32;
  const aFy = 34;
  const aW = 15;
  const aH = 9;

  isoBox(ctx, aFx, aFy, aW, aW, aH, {
    top: '#ffffff',
    left: IVORY_DARK,
    right: IVORY_MID,
  });

  // Deep parabolic arched portal vault opening underneath
  for (let dy = 0; dy < 8; dy++) {
    const span = Math.round(Math.sqrt(Math.max(0, 36 - dy * dy)));
    rect(ctx, 32 - span, 35 + dy, span * 2, 1, '#0e2319');
  }

  // Frieze reliefs with gold leaf motif
  leftWallRect(ctx, aFx, aFy, 2, 2, aW - 4, 2, GOLD_DARK);
  rightWallRect(ctx, aFx, aFy, 2, 2, aW - 4, 2, GOLD_LIGHT);

  // Golden 8-pointed star keystone medallion at arch apex
  rect(ctx, 31, 32, 3, 3, OUT);
  rect(ctx, 31, 32, 3, 3, GOLD_LIGHT);
  px(ctx, 32, 33, '#ffffff');

  // Hanging silver-blue lantern suspended in arch portal
  drawSilverLantern(ctx, 32, 36);

  // Slender elven spire finials on attic corners
  drawElvenSpire(ctx, 18, 19, 2, 6, EMERALD_DARK, LEAF_MID, GOLD_LIGHT);
  drawElvenSpire(ctx, 45, 19, 2, 6, EMERALD_DARK, LEAF_MID, GOLD_LIGHT);

  // Center golden star crest atop attic
  rect(ctx, 30, 16, 4, 3, OUT);
  rect(ctx, 31, 16, 2, 2, GOLD_LIGHT);
  px(ctx, 31, 15, '#ffffff');

  return [canvas];
}

/** elf art for the third-wave buildings. */
export const art3: Partial<Record<BuildingKind, () => HTMLCanvasElement[]>> = {
  cottage: buildElfCottage,
  longhouse: buildElfLonghouse,
  tenement: buildElfTenement,
  villa: buildElfVilla,
  highrise: buildElfHighrise,
  bakery: buildElfBakery,
  teahouse: buildElfTeahouse,
  tailor: buildElfTailor,
  bazaar: buildElfBazaar,
  tradeguild: buildElfTradeguild,
  fishery: buildElfFishery,
  windmill: buildElfWindmill,
  sawmill: buildElfSawmill,
  smelter: buildElfSmelter,
  crafthall: buildElfCrafthall,
  foundry: buildElfFoundry,
  shrine: buildElfShrine,
  garden: buildElfGarden,
  theater: buildElfTheater,
  observatory: buildElfObservatory,
  hospital: buildElfHospital,
  university: buildElfUniversity,
  palisade: buildElfPalisade,
  watchtower: buildElfWatchtower,
  armory: buildElfArmory,
  warcamp: buildElfWarcamp,
  fortress: buildElfFortress,
  flowerbed: buildElfFlowerbed,
  hedge: buildElfHedge,
  well: buildElfWell,
  pond: buildElfPond,
  arch: buildElfArch,
};
