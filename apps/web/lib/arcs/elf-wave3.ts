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
};
