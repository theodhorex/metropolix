import type { BuildingKind } from '@metropolix/sim';
import {
  SPRITE_W,
  SPRITE_H,
  OUT,
  makeCanvas,
  px,
  rect,
  isoDiamond,
  isoBox,
  leftWallRect,
  rightWallRect,
  isoPitchedRoof,
  disc,
} from '../sprites';

// Dragon palette: obsidian black, deep volcanic purple, blood-red basalt, molten lava orange/yellow, hoard gold, bone horn
const ASH_0 = '#262129';
const ASH_1 = '#1f1b22';
const ASH_DARK = '#141117';
const ASH_LIGHT = '#342d38';
const OBS_TOP = '#3a3247';
const OBS_RIGHT = '#262030';
const OBS_LEFT = '#181420';
const BASALT_TOP = '#7a2e2e';
const BASALT_RIGHT = '#591f1f';
const BASALT_LEFT = '#3d1414';
const PURPLE_MID = '#4a2c59';
const PURPLE_LIGHT = '#6b4280';
const LAVA_BRIGHT = '#fff176';
const LAVA_MID = '#ff6d00';
const LAVA_RED = '#d50000';
const GOLD_BRIGHT = '#ffe57f';
const GOLD_MID = '#ffc107';
const GOLD_DARK = '#b26a00';
const HORN_LIGHT = '#e0d6cc';
const HORN_MID = '#9e8c7a';
const HORN_DARK = '#5c4f42';

/** Draw a curved dragon horn or claw tapering from base (x0, y0) to sharp tip (x1, y1). */
function drawHorn(
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  curveY: number,
  bright = true,
): void {
  const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 5);
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = Math.round(x0 + (x1 - x0) * t);
    const y = Math.round(y0 + (y1 - y0) * t - Math.sin(t * Math.PI) * curveY);
    const w = t < 0.5 ? 2 : 1;
    rect(ctx, x - 1, y - 1, w + 1, w + 1, OUT);
    rect(ctx, x, y, w, w, t > 0.7 ? HORN_LIGHT : bright ? HORN_MID : HORN_DARK);
  }
}

/** Draw a roaring dragonfire flame plume centered at (cx, baseY). */
function drawDragonFlame(
  ctx: CanvasRenderingContext2D,
  cx: number,
  baseY: number,
  h: number,
  frame: number,
): void {
  const sway = frame % 2 === 0 ? -1 : 1;
  for (let dy = 0; dy < h; dy++) {
    const t = dy / h;
    const span = Math.max(1, Math.round((1 - t * 0.85) * 4));
    const x = cx + (dy > h * 0.5 ? sway : 0);
    const y = baseY - dy;
    rect(ctx, x - span, y, span * 2, 1, LAVA_RED);
    if (span > 1) {
      rect(ctx, x - span + 1, y, (span - 1) * 2, 1, LAVA_MID);
    }
    if (t < 0.55) {
      rect(ctx, x - 1, y, 2, 1, LAVA_BRIGHT);
    }
  }
}

/** Draw a glittering mound of dragon gold & ruby gems centered at (cx, by). */
function drawGoldHeap(ctx: CanvasRenderingContext2D, cx: number, by: number, rx: number, h: number): void {
  for (let dy = 0; dy < h; dy++) {
    const span = Math.max(2, Math.round(rx * (1 - dy / (h + 1))));
    const y = by - dy;
    rect(ctx, cx - span - 1, y, (span + 1) * 2, 1, OUT);
    for (let dx = -span; dx < span; dx++) {
      const col = (dx + dy) % 5 === 0 ? GOLD_BRIGHT : dx < 0 ? GOLD_DARK : GOLD_MID;
      px(ctx, cx + dx, y, col);
    }
  }
  // Ruby & emerald gem glints in the hoard
  px(ctx, cx - 2, by - 1, LAVA_RED);
  px(ctx, cx + 1, by - 2, LAVA_BRIGHT);
}

// ============================================================================
// 1. RESIDENTIAL
// ============================================================================

/** 1. COTTAGE (Residential, height 0.8): Cozy compact volcanic basalt hut with horn finials. */
function buildCottage(): HTMLCanvasElement[] {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);
  isoDiamond(ctx, 32, 48, 23, ASH_0, OUT);
  isoDiamond(ctx, 32, 48, 19, ASH_1, LAVA_RED);

  const fx = 32;
  const fy = 55;
  const wL = 11;
  const wR = 13;
  const wallH = 9;

  // Red basalt plinth course + obsidian walls
  isoBox(ctx, fx, fy, wL, wR, wallH, {
    top: OBS_TOP,
    left: OBS_LEFT,
    right: OBS_RIGHT,
  });
  isoBox(ctx, fx, fy, wL, wR, 2, {
    top: BASALT_TOP,
    left: BASALT_LEFT,
    right: BASALT_RIGHT,
  });

  // Fanged entrance doorway on right wall
  rightWallRect(ctx, fx, fy, 2, 1, 4, 6, OUT);
  rightWallRect(ctx, fx, fy, 3, 1, 2, 5, '#260707');
  rightWallRect(ctx, fx, fy, 3, 1, 2, 2, LAVA_MID);
  rightWallRect(ctx, fx, fy, 3, 5, 1, 1, HORN_LIGHT);

  // Left wall glowing magma slit window
  leftWallRect(ctx, fx, fy, 4, 3, 3, 3, OUT);
  leftWallRect(ctx, fx, fy, 5, 4, 1, 2, LAVA_BRIGHT);

  // Steep dragon-scale pitched roof
  isoPitchedRoof(ctx, fx, fy, wL + 2, wR + 2, wallH, 7, {
    leftSlope: BASALT_LEFT,
    rightSlope: BASALT_TOP,
    gable: PURPLE_MID,
    ridge: GOLD_MID,
  });

  // Horn finials on roof ridge and eaves
  drawHorn(ctx, 32, 39, 32, 33, 0);
  drawHorn(ctx, 23, 44, 18, 39, 2);
  drawHorn(ctx, 41, 44, 46, 39, -2);

  // Small basalt chimney puffing faint ember
  isoBox(ctx, 35, 33, 3, 3, 5, {
    top: BASALT_TOP,
    left: BASALT_LEFT,
    right: BASALT_RIGHT,
  });
  px(ctx, 35, 27, LAVA_BRIGHT);

  // Small gold nugget heap beside doorway
  drawGoldHeap(ctx, 42, 53, 3, 2);

  return [canvas];
}

/** 2. LONGHOUSE (Residential, height 1.0, 2 frames): Cavernous dragonhall with spine crest. */
function buildLonghouse(): HTMLCanvasElement[] {
  return [0, 1].map((frame) => {
    const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);
    isoDiamond(ctx, 32, 48, 28, ASH_1, OUT);
    isoDiamond(ctx, 32, 48, 24, BASALT_LEFT, LAVA_RED);

    const fx = 31;
    const fy = 56;
    const wL = 11;
    const wR = 20;
    const wallH = 11;

    // Basalt base course + obsidian main body
    isoBox(ctx, fx, fy, wL, wR, wallH, {
      top: OBS_TOP,
      left: OBS_LEFT,
      right: OBS_RIGHT,
    });
    isoBox(ctx, fx, fy, wL, wR, 3, {
      top: BASALT_TOP,
      left: BASALT_LEFT,
      right: BASALT_RIGHT,
    });

    // Front gable fanged entrance
    leftWallRect(ctx, fx, fy, 3, 1, 5, 8, OUT);
    leftWallRect(ctx, fx, fy, 4, 1, 3, 7, '#230707');
    leftWallRect(ctx, fx, fy, 4, 1, 3, 3, frame ? LAVA_BRIGHT : LAVA_MID);
    leftWallRect(ctx, fx, fy, 4, 7, 1, 1, HORN_LIGHT);
    leftWallRect(ctx, fx, fy, 6, 7, 1, 1, HORN_LIGHT);

    // Glowing magma slit windows along the long right flank
    for (const v0 of [4, 9, 14]) {
      rightWallRect(ctx, fx, fy, v0, 3, 2, 4, OUT);
      rightWallRect(ctx, fx, fy, v0, 4, 2, 2, frame ? LAVA_BRIGHT : LAVA_MID);
    }

    // Elongated dragon-scale pitched roof
    isoPitchedRoof(ctx, fx, fy, wL + 2, wR + 2, wallH, 10, {
      leftSlope: BASALT_LEFT,
      rightSlope: BASALT_TOP,
      gable: PURPLE_MID,
      ridge: GOLD_MID,
    });

    // Giant curved dragon horns framing the front gable
    drawHorn(ctx, 22, 48, 17, 36, 3);
    drawHorn(ctx, 33, 42, 38, 30, -3);

    // Dorsal spine horn scales along the roof ridge
    for (let i = 0; i < 4; i++) {
      const rx = 31 + i * 4;
      const ry = 35 - i * 2;
      drawHorn(ctx, rx, ry, rx - 1, ry - 5, 0);
    }

    // Animated smoke puffs from roof smoke holes
    const sOff = frame * 2;
    disc(ctx, 37, 28 - sOff, 2, ASH_LIGHT);
    px(ctx, 37, 28 - sOff, LAVA_MID);
    disc(ctx, 45, 24 - sOff, 2, '#43394a');
    px(ctx, 46, 23 - sOff, LAVA_BRIGHT);

    return canvas;
  });
}

/** 3. TENEMENT (Residential, height 1.8): Tall multi-tier obsidian cliff-block with fanged balconies. */
function buildTenement(): HTMLCanvasElement[] {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);
  isoDiamond(ctx, 32, 48, 26, ASH_1, OUT);
  isoDiamond(ctx, 32, 48, 22, OBS_RIGHT, BASALT_LEFT);

  const fx = 32;
  const fy = 57;
  const wL = 16;
  const wR = 16;
  const wallH = 22;

  // Massive obsidian block
  isoBox(ctx, fx, fy, wL, wR, wallH, {
    top: OBS_TOP,
    left: OBS_LEFT,
    right: OBS_RIGHT,
  });

  // Red basalt ground course
  isoBox(ctx, fx, fy, wL, wR, 4, {
    top: BASALT_TOP,
    left: BASALT_LEFT,
    right: BASALT_RIGHT,
  });

  // Golden belt cornices separating floors
  isoBox(ctx, fx, fy - 10, wL + 1, wR + 1, 2, {
    top: GOLD_MID,
    left: GOLD_DARK,
    right: GOLD_BRIGHT,
  });
  isoBox(ctx, fx, fy - 18, wL + 1, wR + 1, 2, {
    top: GOLD_MID,
    left: GOLD_DARK,
    right: GOLD_BRIGHT,
  });

  // Grid of glowing magma windows on right wall (3 floors x 2 columns)
  for (const v0 of [3, 10]) {
    for (const h0 of [5, 13, 20]) {
      rightWallRect(ctx, fx, fy, v0, h0, 3, 3, OUT);
      rightWallRect(ctx, fx, fy, v0 + 1, h0 + 1, 1, 2, LAVA_MID);
      px(ctx, fx + (v0 + 1) - (h0 + 1), fy - Math.floor((v0 + 1) / 2) - (h0 + 1), LAVA_BRIGHT);
    }
  }

  // Windows on left wall
  for (const u0 of [3, 10]) {
    for (const h0 of [5, 13, 20]) {
      leftWallRect(ctx, fx, fy, u0, h0, 3, 3, OUT);
      leftWallRect(ctx, fx, fy, u0 + 1, h0 + 1, 1, 2, LAVA_RED);
    }
  }

  // Fanged entrance on right ground floor
  rightWallRect(ctx, fx, fy, 6, 1, 4, 7, OUT);
  rightWallRect(ctx, fx, fy, 7, 1, 2, 6, '#260707');
  rightWallRect(ctx, fx, fy, 7, 1, 2, 2, LAVA_BRIGHT);

  // Rooftop horn-spiked parapet and central dragon roost shelter
  drawHorn(ctx, 16, 40, 11, 31, 3);
  drawHorn(ctx, 48, 40, 53, 31, -3);
  drawHorn(ctx, 32, 48, 32, 38, 0);
  drawHorn(ctx, 32, 26, 32, 17, 0);

  // Rooftop cabin
  isoBox(ctx, 32, 32, 7, 7, 5, {
    top: PURPLE_LIGHT,
    left: PURPLE_MID,
    right: PURPLE_MID,
  });
  drawHorn(ctx, 32, 27, 32, 20, 0);

  return [canvas];
}

/** 4. VILLA (Residential, height 1.4): Courtyard palace with private bubbling lava pool. */
function buildVilla(): HTMLCanvasElement[] {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);
  isoDiamond(ctx, 32, 48, 28, ASH_0, OUT);
  isoDiamond(ctx, 32, 48, 25, PURPLE_MID, GOLD_DARK);

  // Main back-left hall
  const mFx = 26;
  const mFy = 48;
  const mWl = 10;
  const mWr = 14;
  const mH = 13;
  isoBox(ctx, mFx, mFy, mWl, mWr, mH, {
    top: BASALT_TOP,
    left: BASALT_LEFT,
    right: BASALT_RIGHT,
  });
  isoPitchedRoof(ctx, mFx, mFy, mWl + 2, mWr + 2, mH, 7, {
    leftSlope: OBS_LEFT,
    rightSlope: BASALT_TOP,
    gable: PURPLE_MID,
    ridge: GOLD_MID,
  });

  // Cross-wing gallery on front-right
  const cFx = 40;
  const cFy = 56;
  const cWl = 12;
  const cWr = 8;
  const cH = 9;
  isoBox(ctx, cFx, cFy, cWl, cWr, cH, {
    top: OBS_TOP,
    left: OBS_LEFT,
    right: OBS_RIGHT,
  });
  isoPitchedRoof(ctx, cFx, cFy, cWl + 2, cWr + 2, cH, 6, {
    leftSlope: BASALT_LEFT,
    rightSlope: PURPLE_LIGHT,
    gable: PURPLE_MID,
    ridge: GOLD_BRIGHT,
  });

  // Private central courtyard with bubbling lava basin & gold hoard display
  isoDiamond(ctx, 33, 50, 7, LAVA_RED, OUT);
  isoDiamond(ctx, 33, 50, 4, LAVA_BRIGHT);

  // Golden hoard pile in courtyard corner
  drawGoldHeap(ctx, 42, 53, 4, 3);

  // Horn finials on roof peaks
  drawHorn(ctx, 20, 31, 16, 22, 2);
  drawHorn(ctx, 34, 25, 38, 16, -2);
  drawHorn(ctx, 43, 44, 48, 36, -2);

  // Grand arched entrance with gold border
  rightWallRect(ctx, cFx, cFy, 2, 1, 4, 7, GOLD_DARK);
  rightWallRect(ctx, cFx, cFy, 3, 1, 2, 6, '#200505');
  rightWallRect(ctx, cFx, cFy, 3, 1, 2, 2, LAVA_MID);

  return [canvas];
}

/** 5. HIGHRISE (Residential, height 2.4, 2 frames): Soaring obsidian spire citadel with crown beacon. */
function buildHighrise(): HTMLCanvasElement[] {
  return [0, 1].map((frame) => {
    const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);
    isoDiamond(ctx, 32, 48, 28, ASH_1, OUT);
    isoDiamond(ctx, 32, 48, 24, BASALT_LEFT, LAVA_RED);

    // Tier 1 (Base): fx=32, fy=58, 17x17, height 12
    isoBox(ctx, 32, 58, 17, 17, 12, {
      top: BASALT_TOP,
      left: BASALT_LEFT,
      right: BASALT_RIGHT,
    });
    // Tier 1 portal
    rightWallRect(ctx, 32, 58, 6, 1, 5, 9, OUT);
    rightWallRect(ctx, 32, 58, 7, 1, 3, 8, '#260606');
    rightWallRect(ctx, 32, 58, 7, 1, 3, 3, frame ? LAVA_BRIGHT : LAVA_MID);

    // Tier 2 (Mid-shaft): fx=32, fy=46, 12x12, height 13
    isoBox(ctx, 32, 46, 12, 12, 13, {
      top: OBS_TOP,
      left: OBS_LEFT,
      right: OBS_RIGHT,
    });
    // Golden dividing cornice
    isoBox(ctx, 32, 46 - 12, 13, 13, 2, {
      top: GOLD_MID,
      left: GOLD_DARK,
      right: GOLD_BRIGHT,
    });

    // Glowing window array on Tier 2
    for (const v of [2, 5, 8]) {
      rightWallRect(ctx, 32, 46, v, 4, 2, 3, OUT);
      rightWallRect(ctx, 32, 46, v, 5, 2, 2, frame ? LAVA_BRIGHT : LAVA_MID);
      leftWallRect(ctx, 32, 46, v, 4, 2, 3, OUT);
      leftWallRect(ctx, 32, 46, v, 5, 2, 2, LAVA_RED);
    }

    // Tier 3 (Upper pinnacle): fx=32, fy=32, 7x7, height 14
    isoBox(ctx, 32, 32, 7, 7, 14, {
      top: PURPLE_LIGHT,
      left: OBS_LEFT,
      right: PURPLE_MID,
    });

    // Vertical pulsing lava conduits up spire corners
    const veinCol = frame === 0 ? LAVA_MID : LAVA_BRIGHT;
    leftWallRect(ctx, 32, 32, 3, 2, 1, 11, veinCol);
    rightWallRect(ctx, 32, 32, 3, 2, 1, 11, veinCol);

    // Claw buttresses gripping the mid-tier corners
    drawHorn(ctx, 20, 39, 15, 27, 3);
    drawHorn(ctx, 44, 39, 49, 27, -3);

    // Summit horns framing roaring dragonfire beacon
    drawHorn(ctx, 28, 17, 23, 7, 3);
    drawHorn(ctx, 36, 17, 41, 7, -3);
    drawDragonFlame(ctx, 32, 15, 10, frame);

    return canvas;
  });
}

// ============================================================================
// 2. COMMERCE
// ============================================================================

/** 6. BAKERY (Commerce, height 1.0, 2 frames): Fire-brick oven bakery with glowing hearth & smoking chimney. */
function buildBakery(): HTMLCanvasElement[] {
  return [0, 1].map((frame) => {
    const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);
    isoDiamond(ctx, 32, 48, 26, ASH_0, OUT);
    isoDiamond(ctx, 32, 48, 22, BASALT_LEFT, LAVA_RED);

    const fx = 30;
    const fy = 55;
    const wL = 12;
    const wR = 14;
    const wallH = 11;

    // Basalt foundation course + obsidian masonry
    isoBox(ctx, fx, fy, wL, wR, wallH, {
      top: OBS_TOP,
      left: OBS_LEFT,
      right: OBS_RIGHT,
    });
    isoBox(ctx, fx, fy, wL, wR, 3, {
      top: BASALT_TOP,
      left: BASALT_LEFT,
      right: BASALT_RIGHT,
    });

    // Pitched crimson scale roof
    isoPitchedRoof(ctx, fx, fy, wL + 2, wR + 2, wallH, 8, {
      leftSlope: BASALT_LEFT,
      rightSlope: BASALT_TOP,
      gable: PURPLE_MID,
      ridge: GOLD_MID,
    });

    // Large glowing bread oven arch on right wall
    rightWallRect(ctx, fx, fy, 3, 1, 6, 8, OUT);
    rightWallRect(ctx, fx, fy, 4, 1, 4, 7, '#240404');
    rightWallRect(ctx, fx, fy, 4, 1, 4, 3, frame ? LAVA_BRIGHT : LAVA_MID);
    // Glowing ember oven hearth floor
    rightWallRect(ctx, fx, fy, 4, 2, 4, 1, LAVA_BRIGHT);

    // Bread display counter on front-right stoop
    isoBox(ctx, 43, 54, 4, 6, 4, {
      top: BASALT_TOP,
      left: BASALT_LEFT,
      right: BASALT_RIGHT,
    });
    // Freshly baked golden ash-loaves & fire-cakes on display
    rect(ctx, 42, 48, 2, 2, GOLD_BRIGHT);
    rect(ctx, 45, 47, 2, 2, GOLD_MID);
    rect(ctx, 43, 50, 2, 2, GOLD_MID);

    // Left wall glowing ember window
    leftWallRect(ctx, fx, fy, 4, 4, 3, 3, OUT);
    leftWallRect(ctx, fx, fy, 5, 5, 1, 2, frame ? LAVA_BRIGHT : LAVA_MID);

    // Heavy obsidian chimney on back-left puffing animated smoke & fire sparks
    isoBox(ctx, 23, 37, 4, 4, 10, {
      top: OBS_TOP,
      left: OBS_LEFT,
      right: OBS_RIGHT,
    });
    const sOff = frame * 2;
    disc(ctx, 23, 24 - sOff, 3, ASH_LIGHT);
    px(ctx, 23, 24 - sOff, LAVA_MID);
    px(ctx, 24, 22 - sOff, LAVA_BRIGHT);

    // Horn finials on roof eaves
    drawHorn(ctx, 21, 44, 16, 37, 2);
    drawHorn(ctx, 39, 44, 44, 37, -2);
    drawHorn(ctx, 30, 36, 30, 29, 0);

    return canvas;
  });
}

/** 7. TEAHOUSE (Commerce, height 1.1): Pagoda-style draconic tea pavilion with sweeping horn eaves. */
function buildTeahouse(): HTMLCanvasElement[] {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);
  isoDiamond(ctx, 32, 48, 27, ASH_0, OUT);
  isoDiamond(ctx, 32, 48, 23, PURPLE_MID, GOLD_DARK);

  const fx = 32;
  const fy = 55;
  const wL = 14;
  const wR = 14;
  const wallH = 9;

  // Base pavilion structure
  isoBox(ctx, fx, fy, wL, wR, wallH, {
    top: OBS_TOP,
    left: OBS_LEFT,
    right: OBS_RIGHT,
  });
  // Crimson basalt lower base
  isoBox(ctx, fx, fy, wL, wR, 2, {
    top: BASALT_TOP,
    left: BASALT_LEFT,
    right: BASALT_RIGHT,
  });

  // Flared lower eave cornice
  isoBox(ctx, fx, fy - 7, wL + 2, wR + 2, 2, {
    top: GOLD_MID,
    left: GOLD_DARK,
    right: GOLD_BRIGHT,
  });
  // Corner sweeping horn tips on lower eave
  drawHorn(ctx, 16, 44, 11, 38, 2);
  drawHorn(ctx, 48, 44, 53, 38, -2);

  // Upper tea chamber
  const uFx = 32;
  const uFy = 46;
  const uW = 9;
  isoBox(ctx, uFx, uFy, uW, uW, 6, {
    top: PURPLE_LIGHT,
    left: PURPLE_MID,
    right: PURPLE_MID,
  });
  // Upper pitched dragon-scale roof
  isoPitchedRoof(ctx, uFx, uFy, uW + 2, uW + 2, 6, 6, {
    leftSlope: BASALT_LEFT,
    rightSlope: BASALT_TOP,
    gable: PURPLE_MID,
    ridge: GOLD_BRIGHT,
  });

  // Summit twin horns framing moonleaf jade jewel
  drawHorn(ctx, 28, 30, 24, 21, 2);
  drawHorn(ctx, 36, 30, 40, 21, -2);
  rect(ctx, 31, 25, 2, 2, '#4fc3f7'); // glowing tea crystal
  px(ctx, 31, 25, '#e0f7fa');

  // Open tea veranda on right wall with steaming caldron & low serving counter
  rightWallRect(ctx, fx, fy, 2, 1, 10, 7, OUT);
  rightWallRect(ctx, fx, fy, 3, 1, 8, 6, '#180f1a');
  // Teapot / steaming caldron
  rect(ctx, 38, 51, 3, 3, GOLD_MID);
  px(ctx, 39, 49, HORN_LIGHT); // steam
  px(ctx, 38, 47, '#e0d6cc');

  return [canvas];
}

/** 8. TAILOR (Commerce, height 1.1): Crimson and gold clothier hall with dragon-hide draperies. */
function buildTailor(): HTMLCanvasElement[] {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);
  isoDiamond(ctx, 32, 48, 26, ASH_1, OUT);
  isoDiamond(ctx, 32, 48, 22, BASALT_LEFT, PURPLE_MID);

  const fx = 31;
  const fy = 55;
  const wL = 13;
  const wR = 14;
  const wallH = 12;

  // Main shop building
  isoBox(ctx, fx, fy, wL, wR, wallH, {
    top: OBS_TOP,
    left: OBS_LEFT,
    right: OBS_RIGHT,
  });
  isoBox(ctx, fx, fy, wL, wR, 3, {
    top: BASALT_TOP,
    left: BASALT_LEFT,
    right: BASALT_RIGHT,
  });

  // Pitched dragon-scale roof
  isoPitchedRoof(ctx, fx, fy, wL + 2, wR + 2, wallH, 7, {
    leftSlope: BASALT_LEFT,
    rightSlope: BASALT_TOP,
    gable: PURPLE_MID,
    ridge: GOLD_MID,
  });

  // Striped canopy awning over storefront on right wall
  for (let i = 0; i < 8; i++) {
    const col = i % 2 === 0 ? BASALT_TOP : GOLD_MID;
    const ax = 35 + i;
    const ay = 52 - Math.floor(i / 2);
    rect(ctx, ax, ay, 2, 3, col);
  }

  // Display window showing spiked dragon cuirass / mannequin
  rightWallRect(ctx, fx, fy, 2, 1, 5, 7, OUT);
  rightWallRect(ctx, fx, fy, 3, 1, 3, 6, '#1a0b16');
  // Mannequin wearing crimson scale vest & gold brooch
  rect(ctx, 36, 50, 3, 4, BASALT_TOP);
  px(ctx, 37, 49, GOLD_BRIGHT);

  // Left wall banner / rolled dragon leather bolts
  leftWallRect(ctx, fx, fy, 3, 3, 3, 6, PURPLE_LIGHT);
  leftWallRect(ctx, fx, fy, 7, 3, 3, 6, GOLD_MID);

  // Horn finials on peak & gilded dragon scissors/emblem
  drawHorn(ctx, 31, 36, 31, 29, 0);
  drawHorn(ctx, 22, 42, 17, 36, 2);
  drawHorn(ctx, 40, 42, 45, 36, -2);
  rect(ctx, 30, 42, 3, 2, GOLD_BRIGHT);

  return [canvas];
}

/** 9. BAZAAR (Commerce, height 1.0): Crowded open-air souk with striped canopy stalls & hoarded gems. */
function buildBazaar(): HTMLCanvasElement[] {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);
  isoDiamond(ctx, 32, 48, 29, ASH_0, OUT);
  isoDiamond(ctx, 32, 48, 25, BASALT_LEFT, GOLD_DARK);

  // Stall 1 (Back-left purple jewel canopy)
  const s1x = 22;
  const s1y = 44;
  isoBox(ctx, s1x, s1y, 7, 7, 5, {
    top: PURPLE_LIGHT,
    left: OBS_LEFT,
    right: PURPLE_MID,
  });
  isoPitchedRoof(ctx, s1x, s1y, 8, 8, 5, 4, {
    leftSlope: PURPLE_MID,
    rightSlope: PURPLE_LIGHT,
    gable: BASALT_LEFT,
    ridge: GOLD_BRIGHT,
  });
  // Heaped gems & gold under Stall 1
  drawGoldHeap(ctx, s1x, s1y + 1, 3, 2);

  // Stall 2 (Back-right crimson spice & ore canopy)
  const s2x = 42;
  const s2y = 44;
  isoBox(ctx, s2x, s2y, 7, 7, 5, {
    top: BASALT_TOP,
    left: BASALT_LEFT,
    right: BASALT_RIGHT,
  });
  isoPitchedRoof(ctx, s2x, s2y, 8, 8, 5, 4, {
    leftSlope: BASALT_LEFT,
    rightSlope: BASALT_TOP,
    gable: PURPLE_MID,
    ridge: GOLD_MID,
  });
  // Glowing magma jars & ore sacks under Stall 2
  rect(ctx, 40, 42, 3, 3, LAVA_RED);
  px(ctx, 41, 41, LAVA_BRIGHT);
  rect(ctx, 43, 44, 2, 3, GOLD_MID);

  // Central foreground grand trading pavilion
  const cFx = 32;
  const cFy = 56;
  isoBox(ctx, cFx, cFy, 10, 10, 7, {
    top: OBS_TOP,
    left: OBS_LEFT,
    right: OBS_RIGHT,
  });
  // Striped gold and crimson canopy roof
  isoPitchedRoof(ctx, cFx, cFy, 11, 11, 7, 6, {
    leftSlope: BASALT_LEFT,
    rightSlope: GOLD_MID,
    gable: PURPLE_MID,
    ridge: GOLD_BRIGHT,
  });

  // Horn crests crowning central pavilion
  drawHorn(ctx, 25, 44, 20, 36, 2);
  drawHorn(ctx, 39, 44, 44, 36, -2);
  drawHorn(ctx, 32, 37, 32, 30, 0);

  // Overflowing treasure chest & dragon scales in center court
  drawGoldHeap(ctx, 32, 57, 5, 3);

  return [canvas];
}

/** 10. TRADEGUILD (Commerce, height 1.8): Imposing obsidian merchant treasury with golden dragon vault. */
function buildTradeguild(): HTMLCanvasElement[] {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);
  isoDiamond(ctx, 32, 48, 28, ASH_1, OUT);
  isoDiamond(ctx, 32, 48, 25, PURPLE_MID, GOLD_DARK);

  const fx = 32;
  const fy = 57;
  const wL = 16;
  const wR = 16;
  const wallH = 18;

  // Massive obsidian guildhall
  isoBox(ctx, fx, fy, wL, wR, wallH, {
    top: OBS_TOP,
    left: OBS_LEFT,
    right: OBS_RIGHT,
  });
  // Rusticated crimson basalt foundation course
  isoBox(ctx, fx, fy, wL, wR, 5, {
    top: BASALT_TOP,
    left: BASALT_LEFT,
    right: BASALT_RIGHT,
  });

  // Golden cornice bands
  isoBox(ctx, fx, fy - 9, wL + 1, wR + 1, 2, {
    top: GOLD_MID,
    left: GOLD_DARK,
    right: GOLD_BRIGHT,
  });
  isoBox(ctx, fx, fy - 16, wL + 1, wR + 1, 2, {
    top: GOLD_MID,
    left: GOLD_DARK,
    right: GOLD_BRIGHT,
  });

  // Steep pitched dragon-scale roof
  isoPitchedRoof(ctx, fx, fy, wL + 2, wR + 2, wallH, 10, {
    leftSlope: BASALT_LEFT,
    rightSlope: BASALT_TOP,
    gable: PURPLE_MID,
    ridge: GOLD_BRIGHT,
  });

  // Massive round golden vault door on right wall
  rightWallRect(ctx, fx, fy, 4, 1, 8, 9, OUT);
  rightWallRect(ctx, fx, fy, 5, 1, 6, 8, GOLD_MID);
  rightWallRect(ctx, fx, fy, 6, 2, 4, 6, GOLD_BRIGHT);
  rightWallRect(ctx, fx, fy, 7, 3, 2, 4, GOLD_DARK);
  // Ruby gem lock mechanism in vault center
  rightWallRect(ctx, fx, fy, 7, 4, 1, 2, LAVA_RED);

  // Gilded balance scales / dragon crest carved above entrance
  rightWallRect(ctx, fx, fy, 5, 11, 6, 4, GOLD_BRIGHT);

  // Upper floor magma-lit arched windows
  leftWallRect(ctx, fx, fy, 4, 11, 3, 4, OUT);
  leftWallRect(ctx, fx, fy, 5, 12, 1, 2, LAVA_BRIGHT);
  leftWallRect(ctx, fx, fy, 9, 11, 3, 4, OUT);
  leftWallRect(ctx, fx, fy, 10, 12, 1, 2, LAVA_MID);

  // Four giant summit horns crowning the guildhall
  drawHorn(ctx, 16, 42, 10, 31, 3);
  drawHorn(ctx, 48, 42, 54, 31, -3);
  drawHorn(ctx, 32, 50, 32, 41, 0);
  drawHorn(ctx, 32, 29, 32, 19, 0);

  // Hoard display by front entrance
  drawGoldHeap(ctx, 45, 54, 4, 3);

  return [canvas];
}

// ============================================================================
// 3. INDUSTRY
// ============================================================================

/** 11. FISHERY (Industry, height 0.7, 2 frames): Volcanic sulfur-pool dock drying fire-scaled fish. */
function buildFishery(): HTMLCanvasElement[] {
  return [0, 1].map((frame) => {
    const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);
    isoDiamond(ctx, 32, 48, 28, ASH_1, OUT);

    // Boiling sulfurous thermal pool on front-right
    isoDiamond(ctx, 36, 49, 14, '#1b323d', OUT);
    isoDiamond(ctx, 36, 49, 11, frame ? '#264b5b' : '#1b323d');
    // Molten magma heat vents under water
    px(ctx, 34, 48, LAVA_RED);
    px(ctx, 38, 50, frame ? LAVA_BRIGHT : LAVA_MID);
    px(ctx, 35, 51, LAVA_MID);

    // Basalt pier and smoking shack on back-left
    const fx = 25;
    const fy = 50;
    const wL = 9;
    const wR = 9;
    const wallH = 8;
    isoBox(ctx, fx, fy, wL, wR, wallH, {
      top: BASALT_TOP,
      left: BASALT_LEFT,
      right: BASALT_RIGHT,
    });
    isoPitchedRoof(ctx, fx, fy, wL + 2, wR + 2, wallH, 5, {
      leftSlope: OBS_LEFT,
      rightSlope: BASALT_TOP,
      gable: PURPLE_MID,
      ridge: GOLD_MID,
    });

    // Small stone fish-smoker chimney
    isoBox(ctx, 19, 38, 3, 3, 6, {
      top: OBS_TOP,
      left: OBS_LEFT,
      right: OBS_RIGHT,
    });
    // Animated smoke from fish smoker
    const sOff = frame * 2;
    disc(ctx, 19, 30 - sOff, 2, ASH_LIGHT);
    px(ctx, 19, 30 - sOff, LAVA_MID);

    // Wooden/bone drying racks extending over dock with glowing fire-fish
    rect(ctx, 30, 48, 1, 6, HORN_DARK);
    rect(ctx, 42, 54, 1, 6, HORN_DARK);
    rect(ctx, 30, 49, 13, 1, HORN_MID);
    // Hanging fire-scaled catch
    for (let i = 0; i < 4; i++) {
      const rx = 32 + i * 3;
      const ry = 50 + (i >> 1);
      rect(ctx, rx, ry, 2, 3, BASALT_TOP);
      px(ctx, rx, ry + 1, frame ? GOLD_BRIGHT : LAVA_MID);
    }

    // Horn dock ties
    drawHorn(ctx, 27, 54, 25, 50, 1);
    drawHorn(ctx, 44, 57, 46, 53, -1);

    return canvas;
  });
}

/** 12. WINDMILL (Industry, height 1.8, 3 frames): Towering obsidian mill with dragon-wing sail rotor. */
function buildWindmill(): HTMLCanvasElement[] {
  return [0, 1, 2].map((frame) => {
    const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);
    isoDiamond(ctx, 32, 48, 28, ASH_1, OUT);
    isoDiamond(ctx, 32, 48, 20, BASALT_LEFT, LAVA_RED);

    // Tapered obsidian windmill tower
    const fx = 32;
    const fy = 55;
    const wL = 12;
    const wR = 12;
    const wallH = 21;
    isoBox(ctx, fx, fy, wL, wR, wallH, {
      top: OBS_TOP,
      left: OBS_LEFT,
      right: OBS_RIGHT,
    });
    // Basalt foundation course
    isoBox(ctx, fx, fy, wL, wR, 4, {
      top: BASALT_TOP,
      left: BASALT_LEFT,
      right: BASALT_RIGHT,
    });

    // Middle golden belt
    isoBox(ctx, fx, fy - 11, wL + 1, wR + 1, 2, {
      top: GOLD_MID,
      left: GOLD_DARK,
      right: GOLD_BRIGHT,
    });

    // Conical cap roof
    isoBox(ctx, fx, fy - wallH, 8, 8, 4, {
      top: PURPLE_LIGHT,
      left: PURPLE_MID,
      right: PURPLE_MID,
    });
    drawHorn(ctx, fx, fy - wallH - 4, fx, fy - wallH - 10, 0);

    // Fanged entrance on right wall
    rightWallRect(ctx, fx, fy, 4, 1, 4, 6, OUT);
    rightWallRect(ctx, fx, fy, 5, 1, 2, 5, '#260606');
    rightWallRect(ctx, fx, fy, 5, 1, 2, 2, LAVA_MID);

    // Windmill sail rotor on front right: hub at (42, 28)
    const hubX = 42;
    const hubY = 28;
    rect(ctx, hubX - 2, hubY - 2, 5, 5, OUT);
    rect(ctx, hubX - 1, hubY - 1, 3, 3, GOLD_MID);
    px(ctx, hubX, hubY, GOLD_BRIGHT);

    // 4 dragon-wing sails rotating across 3 frames
    // frame 0: +, frame 1: diagonal X, frame 2: skewed
    const sailAngles = ([
      [ [0, -11], [0, 11], [-11, 0], [11, 0] ],
      [ [-8, -8], [8, 8], [-8, 8], [8, -8] ],
      [ [-4, -10], [4, 10], [-10, 4], [10, -4] ],
    ] as const)[frame]!;

    for (const [dx, dy] of sailAngles) {
      // Bone spar
      const steps = 7;
      for (let s = 1; s <= steps; s++) {
        const t = s / steps;
        const sx = Math.round(hubX + dx * t);
        const sy = Math.round(hubY + dy * t);
        px(ctx, sx, sy, HORN_LIGHT);
      }
      // Dragon-wing red membrane vane
      const vx = Math.round(hubX + dx * 0.7 - dy * 0.25);
      const vy = Math.round(hubY + dy * 0.7 + dx * 0.25);
      rect(ctx, vx - 1, vy - 1, 3, 3, BASALT_TOP);
      px(ctx, vx, vy, LAVA_RED);
    }

    return canvas;
  });
}

/** 13. SAWMILL (Industry, height 1.1, 2 frames): Basalt saw shed with spinning buzzsaw blade & spark spray. */
function buildSawmill(): HTMLCanvasElement[] {
  return [0, 1].map((frame) => {
    const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);
    isoDiamond(ctx, 32, 48, 28, ASH_0, OUT);
    isoDiamond(ctx, 32, 48, 24, BASALT_LEFT, ASH_DARK);

    const fx = 30;
    const fy = 55;
    const wL = 13;
    const wR = 14;
    const wallH = 10;

    // Cutting shed
    isoBox(ctx, fx, fy, wL, wR, wallH, {
      top: OBS_TOP,
      left: OBS_LEFT,
      right: OBS_RIGHT,
    });
    isoBox(ctx, fx, fy, wL, wR, 3, {
      top: BASALT_TOP,
      left: BASALT_LEFT,
      right: BASALT_RIGHT,
    });

    // Dragon scale roof
    isoPitchedRoof(ctx, fx, fy, wL + 2, wR + 2, wallH, 6, {
      leftSlope: BASALT_LEFT,
      rightSlope: BASALT_TOP,
      gable: PURPLE_MID,
      ridge: GOLD_MID,
    });

    // Open cutting bay on right wall
    rightWallRect(ctx, fx, fy, 2, 1, 9, 7, OUT);
    rightWallRect(ctx, fx, fy, 3, 1, 7, 6, '#1a111a');

    // Circular iron saw blade inside bay
    const sawX = 37;
    const sawY = 48;
    disc(ctx, sawX, sawY, 4, OUT);
    disc(ctx, sawX, sawY, 3, HORN_LIGHT);
    px(ctx, sawX, sawY, OUT);

    // Animated spark spray from saw teeth
    const sparkCol = frame === 0 ? LAVA_BRIGHT : LAVA_MID;
    px(ctx, sawX + 2, sawY - 2, sparkCol);
    px(ctx, sawX + 3, sawY - 3, LAVA_RED);
    px(ctx, sawX + (frame ? 4 : 2), sawY - (frame ? 1 : 3), sparkCol);

    // Stack of charred volcanic timber logs in front-right
    isoBox(ctx, 44, 54, 4, 7, 3, {
      top: '#4a3528',
      left: ASH_DARK,
      right: '#2e2018',
    });
    px(ctx, 42, 51, LAVA_RED);
    isoBox(ctx, 42, 56, 3, 7, 3, {
      top: '#594031',
      left: ASH_DARK,
      right: '#3d2b22',
    });
    px(ctx, 40, 53, LAVA_BRIGHT);

    // Chimney on back-left puffing smoke
    isoBox(ctx, 23, 38, 3, 3, 6, {
      top: BASALT_TOP,
      left: BASALT_LEFT,
      right: BASALT_RIGHT,
    });
    disc(ctx, 23, 30 - frame * 2, 2, ASH_LIGHT);

    // Roof horn finials
    drawHorn(ctx, 20, 43, 16, 37, 2);
    drawHorn(ctx, 38, 43, 43, 37, -2);

    return canvas;
  });
}

/** 14. SMELTER (Industry, height 1.3, 3 frames): Blast furnace with roaring fire pit & molten ore river. */
function buildSmelter(): HTMLCanvasElement[] {
  return [0, 1, 2].map((frame) => {
    const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);
    isoDiamond(ctx, 32, 48, 28, ASH_1, OUT);
    isoDiamond(ctx, 32, 48, 24, BASALT_LEFT, LAVA_RED);

    const fx = 32;
    const fy = 56;
    const wL = 14;
    const wR = 14;
    const wallH = 13;

    // Heavy furnace block
    isoBox(ctx, fx, fy, wL, wR, wallH, {
      top: BASALT_TOP,
      left: OBS_LEFT,
      right: BASALT_RIGHT,
    });

    // Massive glowing hearth arch on right wall
    rightWallRect(ctx, fx, fy, 3, 1, 8, 9, OUT);
    rightWallRect(ctx, fx, fy, 4, 1, 6, 8, LAVA_RED);
    rightWallRect(ctx, fx, fy, 5, 1, 4, 7, frame === 1 ? LAVA_BRIGHT : LAVA_MID);
    rightWallRect(ctx, fx, fy, 6, 2, 2, 5, LAVA_BRIGHT);

    // Molten ore channel pouring out of furnace onto casting bed
    isoDiamond(ctx, 43, 53, 6, LAVA_MID, OUT);
    isoDiamond(ctx, 43, 53, 4, frame === 0 ? LAVA_BRIGHT : LAVA_MID);

    // Ingot molds cooling beside channel
    rect(ctx, 41, 57, 3, 2, GOLD_DARK);
    px(ctx, 42, 57, GOLD_BRIGHT);
    rect(ctx, 46, 55, 3, 2, GOLD_DARK);
    px(ctx, 47, 55, GOLD_BRIGHT);

    // Massive obsidian blast chimney on back-left
    isoBox(ctx, 23, 38, 5, 5, 14, {
      top: OBS_TOP,
      left: OBS_LEFT,
      right: OBS_RIGHT,
    });
    // Golden rim on chimney
    isoBox(ctx, 23, 25, 6, 6, 2, {
      top: GOLD_MID,
      left: GOLD_DARK,
      right: GOLD_BRIGHT,
    });

    // Animated belching furnace smoke clouds & glowing sparks
    const rise = frame * 2;
    disc(ctx, 23, 18 - rise, 3, ASH_LIGHT);
    px(ctx, 23, 18 - rise, LAVA_MID);
    disc(ctx, 25, 13 - rise, 4, '#44374d');
    px(ctx, 26, 12 - rise, LAVA_BRIGHT);

    // Spiked horn crests on roof
    drawHorn(ctx, 26, 39, 21, 31, 2);
    drawHorn(ctx, 40, 39, 45, 31, -2);
    drawHorn(ctx, 32, 45, 32, 36, 0);

    return canvas;
  });
}

/** 15. CRAFTHALL (Industry, height 1.4): Guild manufactory of emberstone artifacts & forge workbenches. */
function buildCrafthall(): HTMLCanvasElement[] {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);
  isoDiamond(ctx, 32, 48, 28, ASH_0, OUT);
  isoDiamond(ctx, 32, 48, 25, PURPLE_MID, GOLD_DARK);

  const fx = 32;
  const fy = 56;
  const wL = 15;
  const wR = 15;
  const wallH = 14;

  // Artisans' hall
  isoBox(ctx, fx, fy, wL, wR, wallH, {
    top: OBS_TOP,
    left: OBS_LEFT,
    right: OBS_RIGHT,
  });
  isoBox(ctx, fx, fy, wL, wR, 4, {
    top: BASALT_TOP,
    left: BASALT_LEFT,
    right: BASALT_RIGHT,
  });

  // Pitched dragon scale roof
  isoPitchedRoof(ctx, fx, fy, wL + 2, wR + 2, wallH, 8, {
    leftSlope: BASALT_LEFT,
    rightSlope: PURPLE_MID,
    gable: BASALT_RIGHT,
    ridge: GOLD_BRIGHT,
  });

  // Open craft bay on right wall
  rightWallRect(ctx, fx, fy, 3, 1, 9, 8, OUT);
  rightWallRect(ctx, fx, fy, 4, 1, 7, 7, '#1f1322');

  // Workbenches & glowing emberstone crystals on display
  rect(ctx, 37, 50, 4, 3, BASALT_TOP);
  rect(ctx, 38, 49, 2, 2, LAVA_RED); // glowing emberstone
  px(ctx, 38, 49, LAVA_BRIGHT);

  // Anvil in foreground
  rect(ctx, 42, 53, 3, 3, HORN_DARK);
  px(ctx, 43, 52, GOLD_BRIGHT);

  // Twin forge chimneys on left wall
  isoBox(ctx, 22, 43, 3, 3, 8, {
    top: OBS_TOP,
    left: OBS_LEFT,
    right: OBS_RIGHT,
  });
  px(ctx, 22, 34, LAVA_BRIGHT);
  isoBox(ctx, 26, 40, 3, 3, 10, {
    top: OBS_TOP,
    left: OBS_LEFT,
    right: OBS_RIGHT,
  });
  px(ctx, 26, 29, LAVA_MID);

  // Golden dragon crest above portal
  rightWallRect(ctx, fx, fy, 5, 9, 5, 3, GOLD_BRIGHT);

  // Horn finials on gables
  drawHorn(ctx, 20, 40, 15, 31, 2);
  drawHorn(ctx, 44, 40, 49, 31, -2);
  drawHorn(ctx, 32, 34, 32, 26, 0);

  return [canvas];
}

/** 16. FOUNDRY (Industry, height 1.9, 3 frames): Massive industrial magma plant with triple smokestacks. */
function buildFoundry(): HTMLCanvasElement[] {
  return [0, 1, 2].map((frame) => {
    const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);
    isoDiamond(ctx, 32, 48, 29, ASH_1, OUT);
    isoDiamond(ctx, 32, 48, 25, BASALT_LEFT, LAVA_RED);

    const fx = 32;
    const fy = 58;
    const wL = 18;
    const wR = 18;
    const wallH = 16;

    // Heavy casting complex
    isoBox(ctx, fx, fy, wL, wR, wallH, {
      top: BASALT_TOP,
      left: OBS_LEFT,
      right: BASALT_RIGHT,
    });
    // Lower basalt footing
    isoBox(ctx, fx, fy, wL, wR, 5, {
      top: BASALT_TOP,
      left: BASALT_LEFT,
      right: BASALT_RIGHT,
    });

    // Molten lava cascade arch on right wall
    rightWallRect(ctx, fx, fy, 4, 1, 8, 11, OUT);
    rightWallRect(ctx, fx, fy, 5, 1, 6, 10, LAVA_RED);
    rightWallRect(ctx, fx, fy, 6, 1 + (frame % 2), 4, 8, LAVA_MID);
    rightWallRect(ctx, fx, fy, 7, 2, 2, 6, LAVA_BRIGHT);

    // Floor crucible bubbling pool
    isoDiamond(ctx, 42, 54, 7, LAVA_RED, OUT);
    isoDiamond(ctx, 42, 54, 4, frame === 1 ? LAVA_BRIGHT : LAVA_MID);

    // Triple towering obsidian chimneys on back-left
    const chimneys: readonly (readonly [number, number, number])[] = [
      [18, 39, 14],
      [25, 34, 17],
      [32, 30, 15],
    ];
    for (const [cx, cy, ch] of chimneys) {
      isoBox(ctx, cx, cy, 4, 4, ch, {
        top: OBS_TOP,
        left: OBS_LEFT,
        right: OBS_RIGHT,
      });
      isoBox(ctx, cx, cy - ch + 2, 5, 5, 2, {
        top: GOLD_MID,
        left: GOLD_DARK,
        right: GOLD_BRIGHT,
      });

      // Animated rising dark smoke & sparks
      const r = (frame * 2 + cx) % 6;
      disc(ctx, cx, cy - ch - 4 - r, 3, ASH_LIGHT);
      px(ctx, cx, cy - ch - 4 - r, LAVA_MID);
      px(ctx, cx + 1, cy - ch - 6 - r, LAVA_BRIGHT);
    }

    // Horn crenellations along right parapet
    for (const v0 of [3, 9, 15]) {
      drawHorn(ctx, fx + v0 - 2, fy - wallH - Math.floor(v0 / 2), fx + v0, fy - wallH - Math.floor(v0 / 2) - 6, -1);
    }

    return canvas;
  });
}

// ============================================================================
// 4. SERVICES
// ============================================================================

/** 17. SHRINE (Services, height 1.0): Sacred obsidian wyrm-altar framed by mammoth horn ribs & eternal flame. */
function buildShrine(): HTMLCanvasElement[] {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);
  isoDiamond(ctx, 32, 48, 26, ASH_0, OUT);
  isoDiamond(ctx, 32, 48, 22, PURPLE_MID, GOLD_DARK);

  // Stepped sacrificial altar dais
  const fx = 32;
  const fy = 55;
  isoBox(ctx, fx, fy, 12, 12, 5, {
    top: BASALT_TOP,
    left: BASALT_LEFT,
    right: BASALT_RIGHT,
  });

  // Central obsidian altar block
  isoBox(ctx, fx, fy - 4, 6, 6, 8, {
    top: OBS_TOP,
    left: OBS_LEFT,
    right: OBS_RIGHT,
  });
  // Golden altar table top
  isoBox(ctx, fx, fy - 11, 7, 7, 2, {
    top: GOLD_BRIGHT,
    left: GOLD_DARK,
    right: GOLD_MID,
  });

  // Glowing dragonfire flame burning atop altar
  drawDragonFlame(ctx, fx, fy - 14, 9, 0);

  // Ribbed bone dragon horns arching cathedral-like over the altar
  drawHorn(ctx, 21, 49, 30, 27, 4);
  drawHorn(ctx, 43, 49, 34, 27, -4);
  drawHorn(ctx, 25, 43, 31, 23, 2);
  drawHorn(ctx, 39, 43, 33, 23, -2);

  // Glowing ruby offering gems & gold chalice on dais steps
  drawGoldHeap(ctx, 41, 53, 3, 2);
  px(ctx, 25, 52, LAVA_RED);
  px(ctx, 26, 51, LAVA_BRIGHT);

  return [canvas];
}

/** 18. GARDEN (Services, height 0.4): Volcanic rockery with cinder-lilies, thermal rill, and stone lantern. */
function buildGarden(): HTMLCanvasElement[] {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);
  isoDiamond(ctx, 32, 48, 28, ASH_0, OUT);
  isoDiamond(ctx, 32, 48, 24, '#2d2433', ASH_DARK);

  // Raked volcanic pumice path running through garden
  for (let u = 4; u < 28; u++) {
    const v = u;
    const sx = 32 + (u - v);
    const sy = 32 + ((u + v) >> 1);
    rect(ctx, sx - 2, sy, 5, 1, '#3a3040');
  }

  // Meandering glowing thermal brook with obsidian river stones
  for (const [u, v] of [
    [8, 18], [9, 17], [11, 16], [13, 16], [15, 15], [17, 14], [19, 13], [21, 11]
  ] as const) {
    const sx = 32 + (u - v);
    const sy = 32 + ((u + v) >> 1);
    rect(ctx, sx - 1, sy, 3, 2, LAVA_RED);
    px(ctx, sx, sy, LAVA_MID);
  }

  // Raised basalt planter beds with glowing cinder-lilies and fire-orchids
  for (const [bx, by] of [
    [24, 46],
    [38, 43],
    [27, 54],
  ] as const) {
    isoDiamond(ctx, bx, by, 5, BASALT_TOP, OUT);
    rect(ctx, bx - 2, by - 2, 4, 3, BASALT_LEFT);
    // Glowing flowers
    px(ctx, bx - 1, by - 3, LAVA_RED);
    px(ctx, bx, by - 4, LAVA_BRIGHT);
    px(ctx, bx + 1, by - 3, GOLD_MID);
  }

  // Carved miniature obsidian pagoda lantern
  const lx = 42;
  const ly = 51;
  isoBox(ctx, lx, ly, 4, 4, 6, {
    top: OBS_TOP,
    left: OBS_LEFT,
    right: OBS_RIGHT,
  });
  // Glowing flame inside lantern
  px(ctx, lx, ly - 7, LAVA_BRIGHT);
  px(ctx, lx + 1, ly - 7, LAVA_MID);
  drawHorn(ctx, lx, ly - 8, lx, ly - 12, 0);

  return [canvas];
}

/** 19. THEATER (Services, height 1.5, 2 frames): Tiered obsidian amphitheater with animated braziers & stage. */
function buildTheater(): HTMLCanvasElement[] {
  return [0, 1].map((frame) => {
    const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);
    isoDiamond(ctx, 32, 48, 28, ASH_1, OUT);
    isoDiamond(ctx, 32, 48, 24, BASALT_LEFT, PURPLE_MID);

    // Tiered semicircular stone amphitheater seating in rear
    isoBox(ctx, 28, 48, 16, 14, 11, {
      top: OBS_TOP,
      left: OBS_LEFT,
      right: OBS_RIGHT,
    });
    // Seating steps carved in obsidian
    for (let s = 1; s <= 3; s++) {
      const stepH = s * 3;
      isoBox(ctx, 28, 48 - stepH, 16 - s * 3, 14 - s * 2, 2, {
        top: BASALT_TOP,
        left: BASALT_LEFT,
        right: BASALT_RIGHT,
      });
      // Spectator velvet cushions / glowing lanterns on tiers
      px(ctx, 20 + s * 3, 40 - stepH, PURPLE_LIGHT);
      px(ctx, 28 + s * 2, 38 - stepH, GOLD_MID);
    }

    // Raised proscenium stage on front-right
    const stgX = 39;
    const stgY = 56;
    isoBox(ctx, stgX, stgY, 10, 10, 7, {
      top: BASALT_TOP,
      left: BASALT_LEFT,
      right: BASALT_RIGHT,
    });
    // Stage golden trim
    isoBox(ctx, stgX, stgY - 6, 11, 11, 2, {
      top: GOLD_MID,
      left: GOLD_DARK,
      right: GOLD_BRIGHT,
    });

    // Stage backdrop framed by golden dragon horns
    drawHorn(ctx, 32, 47, 28, 36, 2);
    drawHorn(ctx, 46, 47, 50, 36, -2);

    // Golden tragic/comic dragon masks mounted on stage backwall
    rect(ctx, 38, 44, 4, 4, GOLD_BRIGHT);
    px(ctx, 39, 45, OUT);
    px(ctx, 41, 45, OUT);

    // Animated proscenium footlight braziers on stage front rim
    for (const [bx, by] of [
      [34, 55],
      [43, 58],
    ] as const) {
      isoBox(ctx, bx, by, 3, 3, 4, {
        top: OBS_TOP,
        left: OBS_LEFT,
        right: OBS_RIGHT,
      });
      drawDragonFlame(ctx, bx, by - 5, 6, frame);
    }

    return canvas;
  });
}

/** 20. OBSERVATORY (Services, height 2.0): Slender obsidian spire with stargazing dome & arcane celestial sphere. */
function buildObservatory(): HTMLCanvasElement[] {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);
  isoDiamond(ctx, 32, 48, 28, ASH_1, OUT);
  isoDiamond(ctx, 32, 48, 23, PURPLE_MID, GOLD_DARK);

  // Stepped octagonal obsidian base
  const fx = 32;
  const fy = 56;
  const wL = 15;
  const wR = 15;
  const wallH = 12;
  isoBox(ctx, fx, fy, wL, wR, wallH, {
    top: BASALT_TOP,
    left: BASALT_LEFT,
    right: BASALT_RIGHT,
  });

  // Slender upper observatory shaft
  const uFx = 32;
  const uFy = 44;
  const uW = 10;
  const uH = 14;
  isoBox(ctx, uFx, uFy, uW, uW, uH, {
    top: OBS_TOP,
    left: OBS_LEFT,
    right: OBS_RIGHT,
  });
  // Golden gallery ring beneath dome
  isoBox(ctx, uFx, uFy - uH + 2, uW + 2, uW + 2, 2, {
    top: GOLD_BRIGHT,
    left: GOLD_DARK,
    right: GOLD_MID,
  });

  // Stargazing dome with open telescope slit
  const domeX = 32;
  const domeY = 24;
  disc(ctx, domeX, domeY, 8, OUT);
  disc(ctx, domeX, domeY, 7, PURPLE_MID);
  disc(ctx, domeX - 2, domeY - 2, 5, PURPLE_LIGHT);
  // Observation slit in dome
  rect(ctx, domeX - 1, domeY - 6, 2, 10, '#100a14');

  // Great brass & gold dragon-claw telescope protruding from slit
  rect(ctx, domeX - 2, domeY - 7, 6, 2, GOLD_BRIGHT);
  px(ctx, domeX + 4, domeY - 8, '#e0f7fa'); // optic lens glint

  // Floating arcane star-crystal orb above summit
  rect(ctx, domeX - 1, domeY - 12, 3, 3, '#80d8ff');
  px(ctx, domeX, domeY - 13, '#e1f5fe');

  // Flanking sweeping dragon horn buttresses
  drawHorn(ctx, 22, 39, 16, 26, 3);
  drawHorn(ctx, 42, 39, 48, 26, -3);

  // Entrance door on ground floor
  rightWallRect(ctx, fx, fy, 5, 1, 4, 7, OUT);
  rightWallRect(ctx, fx, fy, 6, 1, 2, 6, '#260505');
  rightWallRect(ctx, fx, fy, 6, 1, 2, 2, LAVA_MID);

  return [canvas];
}

/** 21. HOSPITAL (Services, height 1.6): Volcanic sanatorium with bone-horn facade & restorative mineral spring. */
function buildHospital(): HTMLCanvasElement[] {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);
  isoDiamond(ctx, 32, 48, 28, ASH_0, OUT);
  isoDiamond(ctx, 32, 48, 25, HORN_MID, PURPLE_MID);

  const fx = 32;
  const fy = 56;
  const wL = 16;
  const wR = 16;
  const wallH = 14;

  // Sanatorium hall of polished bone-horn stone and purple slate
  isoBox(ctx, fx, fy, wL, wR, wallH, {
    top: HORN_LIGHT,
    left: HORN_DARK,
    right: HORN_MID,
  });
  // Purple obsidian basement course
  isoBox(ctx, fx, fy, wL, wR, 3, {
    top: PURPLE_MID,
    left: OBS_LEFT,
    right: PURPLE_LIGHT,
  });

  // Pitch dragon scale roof
  isoPitchedRoof(ctx, fx, fy, wL + 2, wR + 2, wallH, 9, {
    leftSlope: BASALT_LEFT,
    rightSlope: BASALT_TOP,
    gable: PURPLE_MID,
    ridge: GOLD_BRIGHT,
  });

  // Red healing cross / dragon insignia emblazoned above entrance
  rightWallRect(ctx, fx, fy, 6, 9, 4, 4, OUT);
  rightWallRect(ctx, fx, fy, 7, 9, 2, 4, LAVA_RED);
  rightWallRect(ctx, fx, fy, 6, 10, 4, 2, LAVA_RED);
  px(ctx, 42, 40, LAVA_BRIGHT);

  // Grand arched double entrance
  rightWallRect(ctx, fx, fy, 5, 1, 6, 7, OUT);
  rightWallRect(ctx, fx, fy, 6, 1, 4, 6, '#240808');
  rightWallRect(ctx, fx, fy, 6, 1, 4, 2, LAVA_MID);

  // Upper convalescent balcony on left wall
  leftWallRect(ctx, fx, fy, 3, 8, 8, 4, OUT);
  leftWallRect(ctx, fx, fy, 4, 9, 6, 2, HORN_LIGHT);

  // Therapeutic mineral hot-spring pool in front courtyard
  isoDiamond(ctx, 44, 53, 6, '#00838f', OUT);
  isoDiamond(ctx, 44, 53, 4, '#4dd0e1');
  px(ctx, 44, 50, '#e0f7fa'); // healing vapor

  // Roof crest horns
  drawHorn(ctx, 18, 39, 13, 29, 2);
  drawHorn(ctx, 46, 39, 51, 29, -2);
  drawHorn(ctx, 32, 33, 32, 24, 0);

  return [canvas];
}

/** 22. UNIVERSITY (Services, height 2.2): Grand draconic academy with soaring twin spires & floating lore orb. */
function buildUniversity(): HTMLCanvasElement[] {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);
  isoDiamond(ctx, 32, 48, 29, ASH_1, OUT);
  isoDiamond(ctx, 32, 48, 25, PURPLE_MID, GOLD_DARK);

  const fx = 32;
  const fy = 57;
  const wL = 16;
  const wR = 16;
  const wallH = 16;

  // Central collegiate basilica
  isoBox(ctx, fx, fy, wL, wR, wallH, {
    top: OBS_TOP,
    left: OBS_LEFT,
    right: OBS_RIGHT,
  });
  // Basalt foundation
  isoBox(ctx, fx, fy, wL, wR, 4, {
    top: BASALT_TOP,
    left: BASALT_LEFT,
    right: BASALT_RIGHT,
  });

  // Golden cornice band
  isoBox(ctx, fx, fy - 12, wL + 1, wR + 1, 2, {
    top: GOLD_MID,
    left: GOLD_DARK,
    right: GOLD_BRIGHT,
  });

  // Vaulted pitched dragon-scale roof
  isoPitchedRoof(ctx, fx, fy, wL + 2, wR + 2, wallH, 10, {
    leftSlope: BASALT_LEFT,
    rightSlope: PURPLE_LIGHT,
    gable: PURPLE_MID,
    ridge: GOLD_BRIGHT,
  });

  // Twin soaring academy spires on left and right flanks
  const spires: readonly (readonly [number, number, number])[] = [
    [18, 45, 23],
    [46, 45, 23],
  ];
  for (const [sx, sy, sh] of spires) {
    isoBox(ctx, sx, sy, 5, 5, sh, {
      top: OBS_TOP,
      left: OBS_LEFT,
      right: OBS_RIGHT,
    });
    isoBox(ctx, sx, sy - sh + 2, 6, 6, 2, {
      top: GOLD_MID,
      left: GOLD_DARK,
      right: GOLD_BRIGHT,
    });
    // Sharp golden horn pinnacles atop spires
    drawHorn(ctx, sx, sy - sh, sx + (sx < 32 ? -3 : 3), sy - sh - 9, sx < 32 ? 2 : -2);
    // Magma runes on spire faces
    rect(ctx, sx - 1, sy - 14, 2, 5, LAVA_RED);
    px(ctx, sx, sy - 12, LAVA_BRIGHT);
  }

  // Grand arched portal on right wall
  rightWallRect(ctx, fx, fy, 4, 1, 7, 8, OUT);
  rightWallRect(ctx, fx, fy, 5, 1, 5, 7, '#230606');
  rightWallRect(ctx, fx, fy, 5, 1, 5, 2, LAVA_BRIGHT);
  // Gilded draconic tome & wisdom crest above door
  rightWallRect(ctx, fx, fy, 5, 9, 5, 4, GOLD_BRIGHT);

  // Floating orb of dragon wisdom & arcane lore hovering above central ridge
  drawDragonFlame(ctx, 32, 27, 8, 0);

  return [canvas];
}

// ============================================================================
// 5. MILITARY
// ============================================================================

/** 23. PALISADE (Military, height 0.8): Jagged black obsidian rampart & bone-spike barricade with fanged gate. */
function buildPalisade(): HTMLCanvasElement[] {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);
  isoDiamond(ctx, 32, 48, 26, ASH_1, OUT);
  isoDiamond(ctx, 32, 48, 22, BASALT_LEFT, LAVA_RED);

  // V-shaped obsidian rampart walls
  // Left wall: fx=23, fy=44, wL=10, wR=4, h=7
  isoBox(ctx, 23, 44, 10, 4, 7, {
    top: OBS_TOP,
    left: OBS_LEFT,
    right: BASALT_LEFT,
  });
  // Right wall: fx=41, fy=44, wL=4, wR=10, h=7
  isoBox(ctx, 41, 44, 4, 10, 7, {
    top: OBS_TOP,
    left: BASALT_LEFT,
    right: OBS_RIGHT,
  });

  // Jagged obsidian stakes & dragon-horn spikes crowning both rampart walls
  for (let u = 2; u < 10; u += 3) {
    const sx = 23 - u;
    const sy = 44 - Math.floor(u / 2) - 7;
    drawHorn(ctx, sx, sy, sx - 1, sy - 5, 0);
  }
  for (let v = 2; v < 10; v += 3) {
    const sx = 41 + v;
    const sy = 44 - Math.floor(v / 2) - 7;
    drawHorn(ctx, sx, sy, sx + 1, sy - 5, 0);
  }

  // Central fanged gatehouse portal
  const gFx = 32;
  const gFy = 50;
  isoBox(ctx, gFx, gFy, 5, 5, 11, {
    top: BASALT_TOP,
    left: BASALT_LEFT,
    right: BASALT_RIGHT,
  });
  // Gate opening & iron fang portcullis
  rightWallRect(ctx, gFx, gFy, 1, 1, 3, 7, OUT);
  rightWallRect(ctx, gFx, gFy, 2, 1, 1, 6, '#260404');
  rightWallRect(ctx, gFx, gFy, 2, 1, 1, 2, LAVA_MID);
  // Fang bars
  rightWallRect(ctx, gFx, gFy, 2, 4, 1, 1, HORN_LIGHT);

  // Corner watch sentry posts on wall flanks
  isoBox(ctx, 14, 40, 4, 4, 9, {
    top: OBS_TOP,
    left: OBS_LEFT,
    right: OBS_RIGHT,
  });
  drawHorn(ctx, 14, 30, 11, 24, 1);

  isoBox(ctx, 50, 40, 4, 4, 9, {
    top: OBS_TOP,
    left: OBS_LEFT,
    right: OBS_RIGHT,
  });
  drawHorn(ctx, 50, 30, 53, 24, -1);

  // Glowing lava trench in foreground
  for (let i = 0; i < 14; i++) {
    const tx = 25 + i;
    const ty = 57 - Math.floor(Math.abs(i - 7) / 2);
    px(ctx, tx, ty, i % 2 === 0 ? LAVA_RED : LAVA_MID);
  }

  return [canvas];
}

/** 24. WATCHTOWER (Military, height 2.0, 2 frames): Slender obsidian lookout spire with waving drake banner & beacon. */
function buildWatchtower(): HTMLCanvasElement[] {
  return [0, 1].map((frame) => {
    const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);
    isoDiamond(ctx, 32, 50, 20, ASH_1, OUT);
    isoDiamond(ctx, 32, 50, 16, BASALT_LEFT, LAVA_RED);

    // Flared basalt base
    const fx = 32;
    const fy = 55;
    isoBox(ctx, fx, fy, 9, 9, 7, {
      top: BASALT_TOP,
      left: BASALT_LEFT,
      right: BASALT_RIGHT,
    });

    // Tall slender obsidian spire shaft
    const sFx = 32;
    const sFy = 48;
    const sW = 6;
    const sH = 22;
    isoBox(ctx, sFx, sFy, sW, sW, sH, {
      top: OBS_TOP,
      left: OBS_LEFT,
      right: OBS_RIGHT,
    });

    // Vertical pulsing magma veins on shaft
    const veinCol = frame === 0 ? LAVA_MID : LAVA_BRIGHT;
    leftWallRect(ctx, sFx, sFy, 2, 2, 1, 18, veinCol);
    rightWallRect(ctx, sFx, sFy, 2, 2, 1, 18, veinCol);

    // Upper lookout platform / crow's nest with golden railing
    const pY = sFy - sH + 2;
    isoBox(ctx, sFx, pY, 10, 10, 3, {
      top: GOLD_MID,
      left: GOLD_DARK,
      right: GOLD_BRIGHT,
    });

    // Pyramidal horn canopy roof
    isoBox(ctx, sFx, pY - 7, 7, 7, 3, {
      top: PURPLE_LIGHT,
      left: PURPLE_MID,
      right: PURPLE_MID,
    });

    // Roaring signal fire beacon on platform
    drawDragonFlame(ctx, 32, pY - 2, 8, frame);

    // Twin giant summit horns crowning the tower
    drawHorn(ctx, 27, pY - 9, 23, pY - 17, 2);
    drawHorn(ctx, 37, pY - 9, 41, pY - 17, -2);

    // Waving crimson dragon war-pennant fluttering from mast
    const flagShift = frame === 0 ? 0 : 1;
    rect(ctx, 38, pY - 15, 6, 3, BASALT_TOP);
    rect(ctx, 44, pY - 15 + flagShift, 3, 2, LAVA_RED);
    px(ctx, 40, pY - 14, GOLD_BRIGHT); // dragon insignia on flag

    return canvas;
  });
}

/** 25. ARMORY (Military, height 1.3): Fortified weapons keep with weapon racks, halberds & horned helms. */
function buildArmory(): HTMLCanvasElement[] {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);
  isoDiamond(ctx, 32, 48, 27, ASH_1, OUT);
  isoDiamond(ctx, 32, 48, 23, BASALT_LEFT, PURPLE_MID);

  const fx = 32;
  const fy = 56;
  const wL = 14;
  const wR = 14;
  const wallH = 13;

  // Heavy basalt armory keep
  isoBox(ctx, fx, fy, wL, wR, wallH, {
    top: OBS_TOP,
    left: OBS_LEFT,
    right: OBS_RIGHT,
  });
  // Rusticated basalt foundation
  isoBox(ctx, fx, fy, wL, wR, 4, {
    top: BASALT_TOP,
    left: BASALT_LEFT,
    right: BASALT_RIGHT,
  });

  // Dragon-scale pitched roof
  isoPitchedRoof(ctx, fx, fy, wL + 2, wR + 2, wallH, 8, {
    leftSlope: BASALT_LEFT,
    rightSlope: BASALT_TOP,
    gable: PURPLE_MID,
    ridge: GOLD_BRIGHT,
  });

  // Reinforced iron-studded vault door
  rightWallRect(ctx, fx, fy, 4, 1, 6, 8, OUT);
  rightWallRect(ctx, fx, fy, 5, 1, 4, 7, '#1f1a24');
  // Iron studs on door
  px(ctx, 38, 49, HORN_LIGHT);
  px(ctx, 40, 48, HORN_LIGHT);

  // Crossed golden dragon swords / insignia above portal
  rightWallRect(ctx, fx, fy, 4, 9, 6, 3, GOLD_BRIGHT);
  px(ctx, 40, 41, LAVA_RED);

  // Weapon racks on front-right forecourt displaying halberds & swords
  rect(ctx, 43, 53, 1, 6, HORN_DARK);
  rect(ctx, 48, 55, 1, 6, HORN_DARK);
  rect(ctx, 43, 54, 6, 1, HORN_MID);
  // Jagged blades
  for (let i = 0; i < 3; i++) {
    px(ctx, 44 + i * 2, 51 + (i >> 1), HORN_LIGHT);
    px(ctx, 44 + i * 2, 52 + (i >> 1), GOLD_MID);
  }

  // Armor stand in forecourt with horned helmet
  rect(ctx, 24, 52, 3, 5, OBS_LEFT);
  px(ctx, 25, 51, GOLD_BRIGHT);
  drawHorn(ctx, 24, 51, 22, 47, 1);
  drawHorn(ctx, 26, 51, 28, 47, -1);

  // Forge chimney on left wall
  isoBox(ctx, 22, 41, 3, 3, 7, {
    top: BASALT_TOP,
    left: BASALT_LEFT,
    right: BASALT_RIGHT,
  });
  px(ctx, 22, 33, LAVA_BRIGHT);

  // Summit horns
  drawHorn(ctx, 20, 39, 15, 31, 2);
  drawHorn(ctx, 44, 39, 49, 31, -2);
  drawHorn(ctx, 32, 33, 32, 25, 0);

  return [canvas];
}

/** 26. WARCAMP (Military, height 1.0, 2 frames): Draconic legion bivouac with horned tents & central bonfire. */
function buildWarcamp(): HTMLCanvasElement[] {
  return [0, 1].map((frame) => {
    const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);
    isoDiamond(ctx, 32, 48, 28, ASH_0, OUT);
    isoDiamond(ctx, 32, 48, 24, BASALT_LEFT, LAVA_RED);

    // Main commander's pavilion on back-left
    const cmdX = 24;
    const cmdY = 46;
    isoBox(ctx, cmdX, cmdY, 8, 8, 6, {
      top: BASALT_TOP,
      left: BASALT_LEFT,
      right: BASALT_RIGHT,
    });
    isoPitchedRoof(ctx, cmdX, cmdY, 9, 9, 6, 5, {
      leftSlope: BASALT_LEFT,
      rightSlope: PURPLE_MID,
      gable: BASALT_TOP,
      ridge: GOLD_BRIGHT,
    });
    // Commander's banner pole & dragon standard
    const bShift = frame === 0 ? 0 : 1;
    rect(ctx, cmdX, cmdY - 14, 1, 9, HORN_DARK);
    rect(ctx, cmdX + 1, cmdY - 14, 5, 3, BASALT_TOP);
    rect(ctx, cmdX + 6, cmdY - 14 + bShift, 3, 2, LAVA_RED);

    // Flanking troop tents on back-right
    const t2x = 42;
    const t2y = 46;
    isoBox(ctx, t2x, t2y, 7, 7, 5, {
      top: PURPLE_LIGHT,
      left: OBS_LEFT,
      right: PURPLE_MID,
    });
    isoPitchedRoof(ctx, t2x, t2y, 8, 8, 5, 4, {
      leftSlope: BASALT_LEFT,
      rightSlope: BASALT_TOP,
      gable: PURPLE_MID,
      ridge: GOLD_MID,
    });
    drawHorn(ctx, t2x, t2y - 9, t2x, t2y - 14, 0);

    // Front-left sentry tent
    const t3x = 22;
    const t3y = 54;
    isoBox(ctx, t3x, t3y, 6, 6, 4, {
      top: BASALT_TOP,
      left: BASALT_LEFT,
      right: BASALT_RIGHT,
    });
    isoPitchedRoof(ctx, t3x, t3y, 7, 7, 4, 3, {
      leftSlope: OBS_LEFT,
      rightSlope: BASALT_TOP,
      gable: PURPLE_MID,
      ridge: GOLD_MID,
    });

    // Central blazing legion war bonfire
    drawDragonFlame(ctx, 33, 51, 10, frame);
    // Ash ring around fire
    disc(ctx, 33, 53, 5, OUT);
    disc(ctx, 33, 53, 4, ASH_DARK);

    // Weapon racks & supply crates in front-right
    drawGoldHeap(ctx, 44, 55, 3, 2);
    rect(ctx, 41, 53, 4, 3, HORN_DARK);
    px(ctx, 42, 52, GOLD_BRIGHT);

    return canvas;
  });
}

/** 27. FORTRESS (Military, height 2.3): Concentric obsidian dragon citadel with polygonal towers & lava moat. */
function buildFortress(): HTMLCanvasElement[] {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);
  // Outer glowing molten lava moat
  isoDiamond(ctx, 32, 51, 29, LAVA_RED, OUT);
  isoDiamond(ctx, 32, 51, 26, LAVA_MID);
  // Inner fortress island of black obsidian
  isoDiamond(ctx, 32, 51, 22, OBS_RIGHT, OUT);

  const fx = 32;
  const fy = 57;
  const wL = 17;
  const wR = 17;
  const wallH = 17;

  // Main central fortress block
  isoBox(ctx, fx, fy, wL, wR, wallH, {
    top: BASALT_TOP,
    left: OBS_LEFT,
    right: OBS_RIGHT,
  });
  // Red basalt lower plinth
  isoBox(ctx, fx, fy, wL, wR, 5, {
    top: BASALT_TOP,
    left: BASALT_LEFT,
    right: BASALT_RIGHT,
  });

  // Front gateway bastion tower
  isoBox(ctx, 32, 60, 6, 6, 13, {
    top: BASALT_TOP,
    left: BASALT_LEFT,
    right: BASALT_RIGHT,
  });
  // Iron gate and lava drawbridge
  rightWallRect(ctx, 32, 60, 1, 1, 4, 7, OUT);
  rightWallRect(ctx, 32, 60, 2, 1, 2, 6, '#260404');
  rightWallRect(ctx, 32, 60, 2, 1, 2, 2, LAVA_BRIGHT);

  // Left polygonal corner bastion tower
  const lBx = 17;
  const lBy = 46;
  const lBh = 22;
  isoBox(ctx, lBx, lBy, 7, 7, lBh, {
    top: OBS_TOP,
    left: OBS_LEFT,
    right: OBS_RIGHT,
  });
  isoBox(ctx, lBx, lBy - lBh + 2, 8, 8, 3, {
    top: GOLD_MID,
    left: GOLD_DARK,
    right: GOLD_BRIGHT,
  });
  drawHorn(ctx, lBx - 2, lBy - lBh, lBx - 5, lBy - lBh - 9, 2);
  drawHorn(ctx, lBx + 2, lBy - lBh, lBx + 5, lBy - lBh - 9, -2);
  drawDragonFlame(ctx, lBx, lBy - lBh, 6, 0);

  // Right polygonal corner bastion tower
  const rBx = 47;
  const rBy = 46;
  const rBh = 22;
  isoBox(ctx, rBx, rBy, 7, 7, rBh, {
    top: OBS_TOP,
    left: OBS_LEFT,
    right: OBS_RIGHT,
  });
  isoBox(ctx, rBx, rBy - rBh + 2, 8, 8, 3, {
    top: GOLD_MID,
    left: GOLD_DARK,
    right: GOLD_BRIGHT,
  });
  drawHorn(ctx, rBx - 2, rBy - rBh, rBx - 5, rBy - rBh - 9, 2);
  drawHorn(ctx, rBx + 2, rBy - rBh, rBx + 5, rBy - rBh - 9, -2);
  drawDragonFlame(ctx, rBx, rBy - rBh, 6, 1);

  // Central high keep tower (tallest pinnacle at height ~27)
  const kX = 32;
  const kY = 41;
  const kH = 25;
  isoBox(ctx, kX, kY, 8, 8, kH, {
    top: PURPLE_LIGHT,
    left: OBS_LEFT,
    right: PURPLE_MID,
  });
  isoBox(ctx, kX, kY - kH + 2, 9, 9, 3, {
    top: GOLD_BRIGHT,
    left: GOLD_DARK,
    right: GOLD_MID,
  });
  // Great summit dragon horns & roaring high crown flame
  drawHorn(ctx, kX - 3, kY - kH, kX - 6, kY - kH - 11, 3);
  drawHorn(ctx, kX + 3, kY - kH, kX + 6, kY - kH - 11, -3);
  drawDragonFlame(ctx, kX, kY - kH - 1, 10, 0);

  return [canvas];
}

// ============================================================================
// 6. DECORATION
// ============================================================================

/** 28. FLOWERBED (Decoration, height 0.3): Basalt planter box with glowing crimson cinder-lilies & gold buds. */
function buildFlowerbed(): HTMLCanvasElement[] {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);
  isoDiamond(ctx, 32, 50, 18, ASH_0, OUT);
  isoDiamond(ctx, 32, 50, 14, BASALT_LEFT, OUT);

  // Basalt planter box rim
  isoBox(ctx, 32, 52, 10, 10, 3, {
    top: BASALT_TOP,
    left: BASALT_LEFT,
    right: BASALT_RIGHT,
  });
  // Dark obsidian soil inside planter
  isoDiamond(ctx, 32, 48, 7, ASH_DARK);

  // Clusters of glowing fire-lilies & golden ember-buds
  const flowers: readonly (readonly [number, number, string, string])[] = [
    [32, 46, LAVA_RED, LAVA_BRIGHT],
    [29, 48, GOLD_MID, GOLD_BRIGHT],
    [35, 48, LAVA_MID, LAVA_BRIGHT],
    [32, 50, BASALT_TOP, GOLD_MID],
    [27, 46, PURPLE_LIGHT, GOLD_BRIGHT],
    [37, 46, LAVA_RED, LAVA_MID],
  ];
  for (const [fx, fy, pCol, cCol] of flowers) {
    rect(ctx, fx - 1, fy - 1, 3, 3, OUT);
    rect(ctx, fx - 1, fy - 1, 2, 2, pCol);
    px(ctx, fx, fy, cCol);
  }

  // Tiny corner horn accents on planter box
  px(ctx, 22, 46, HORN_LIGHT);
  px(ctx, 42, 46, HORN_LIGHT);
  px(ctx, 32, 51, HORN_LIGHT);

  return [canvas];
}

/** 29. HEDGE (Decoration, height 0.5): Pruned volcanic briar hedge of blackened thorn leaves with ember berries. */
function buildHedge(): HTMLCanvasElement[] {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);
  isoDiamond(ctx, 32, 50, 18, ASH_1, OUT);

  // Dense linear volcanic briar hedge block
  const fx = 32;
  const fy = 52;
  const wL = 11;
  const wR = 7;
  const wallH = 7;
  isoBox(ctx, fx, fy, wL, wR, wallH, {
    top: '#2d2433',
    left: '#19131d',
    right: '#221b27',
  });

  // Stippled thorn leaf texture & sharp horn thorns along top crest
  for (let u = 1; u < wL; u += 2) {
    const sx = fx - u;
    const sy = fy - Math.floor(u / 2) - wallH;
    px(ctx, sx, sy - 1, HORN_LIGHT);
    px(ctx, sx, sy, '#3b2f42');
  }
  for (let v = 1; v < wR; v += 2) {
    const sx = fx + v;
    const sy = fy - Math.floor(v / 2) - wallH;
    px(ctx, sx, sy - 1, HORN_LIGHT);
    px(ctx, sx, sy, '#3b2f42');
  }

  // Glowing red & orange cinder-berries scattered across hedge faces
  const berries: readonly (readonly [number, number, string])[] = [
    [25, 48, LAVA_RED],
    [28, 49, LAVA_MID],
    [30, 46, LAVA_BRIGHT],
    [34, 48, LAVA_RED],
    [36, 49, LAVA_MID],
    [37, 46, LAVA_BRIGHT],
  ];
  for (const [bx, by, col] of berries) {
    px(ctx, bx, by, col);
  }

  return [canvas];
}

/** 30. WELL (Decoration, height 0.7): Obsidian wellhead tapping subterranean mineral aquifer with horn posts. */
function buildWell(): HTMLCanvasElement[] {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);
  isoDiamond(ctx, 32, 50, 18, ASH_0, OUT);
  isoDiamond(ctx, 32, 50, 14, BASALT_LEFT, OUT);

  // Octagonal obsidian well wall
  const fx = 32;
  const fy = 53;
  const wL = 7;
  const wR = 7;
  const wallH = 6;
  isoBox(ctx, fx, fy, wL, wR, wallH, {
    top: BASALT_TOP,
    left: OBS_LEFT,
    right: OBS_RIGHT,
  });

  // Well mouth opening with glowing turquoise mineral water deep below
  isoDiamond(ctx, 32, 47, 4, '#00838f', OUT);
  isoDiamond(ctx, 32, 47, 2, '#80deea');

  // Twin curved bone horn posts supporting canopy
  drawHorn(ctx, 25, 46, 25, 36, 1);
  drawHorn(ctx, 39, 46, 39, 36, -1);

  // Dragon-scale pitched canopy over well
  isoPitchedRoof(ctx, fx, fy - 6, 8, 8, 8, 5, {
    leftSlope: BASALT_LEFT,
    rightSlope: BASALT_TOP,
    gable: PURPLE_MID,
    ridge: GOLD_MID,
  });

  // Winch crank and hanging bucket
  rect(ctx, 31, 38, 2, 4, HORN_MID);
  rect(ctx, 31, 42, 2, 2, GOLD_DARK);
  px(ctx, 32, 42, '#80deea'); // water splash in bucket

  // Horn crest on canopy ridge
  drawHorn(ctx, 32, 32, 32, 27, 0);

  return [canvas];
}

/** 31. POND (Decoration, height 0.2, 2 frames): Steaming volcanic mineral pool with basalt boulders & steam bubbles. */
function buildPond(): HTMLCanvasElement[] {
  return [0, 1].map((frame) => {
    const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);
    isoDiamond(ctx, 32, 48, 24, ASH_0, OUT);

    // Outer thermal hot-spring pool
    isoDiamond(ctx, 32, 48, 18, '#006064', OUT);
    isoDiamond(ctx, 32, 48, 15, '#00838f');
    // Center bright thermal vent
    isoDiamond(ctx, 32, 48, 10, '#00acc1');
    isoDiamond(ctx, 32, 48, 5, frame ? '#4dd0e1' : '#26c6da');

    // Animated rising steam bubbles & mineral ripples
    const bubbles = ([
      [ [30, 47], [35, 49], [32, 45] ],
      [ [33, 46], [29, 49], [36, 47] ],
    ] as const)[frame]!;
    for (const [bx, by] of bubbles) {
      px(ctx, bx, by, '#e0f7fa');
      px(ctx, bx, by - 1, '#ffffff');
    }

    // Floating crimson heat-lilies on water surface
    rect(ctx, 27, 48, 3, 2, BASALT_TOP);
    px(ctx, 28, 48, LAVA_BRIGHT);

    rect(ctx, 36, 50, 3, 2, BASALT_TOP);
    px(ctx, 37, 50, GOLD_MID);

    // Smooth basalt boulders lining pool shoreline
    for (const [rx, ry] of [
      [19, 47], [22, 53], [42, 53], [44, 46], [26, 42], [38, 42]
    ] as const) {
      rect(ctx, rx - 1, ry - 1, 4, 3, OUT);
      rect(ctx, rx, ry - 1, 3, 2, BASALT_TOP);
      px(ctx, rx, ry, OBS_RIGHT);
    }

    return canvas;
  });
}

/** 32. ARCH (Decoration, height 1.6): Ceremonial triumphal arch of polished obsidian with sweeping horns & drake crest. */
function buildArch(): HTMLCanvasElement[] {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);
  isoDiamond(ctx, 32, 48, 26, ASH_1, OUT);
  isoDiamond(ctx, 32, 48, 22, BASALT_LEFT, GOLD_DARK);

  // Twin massive obsidian pylon pillars
  // Left pylon: fx=23, fy=51, 6x6, h=16
  const lPx = 23;
  const lPy = 51;
  const pH = 16;
  isoBox(ctx, lPx, lPy, 6, 6, pH, {
    top: OBS_TOP,
    left: OBS_LEFT,
    right: OBS_RIGHT,
  });
  isoBox(ctx, lPx, lPy, 6, 6, 3, {
    top: BASALT_TOP,
    left: BASALT_LEFT,
    right: BASALT_RIGHT,
  });
  // Right pylon: fx=41, fy=51, 6x6, h=16
  const rPx = 41;
  const rPy = 51;
  isoBox(ctx, rPx, rPy, 6, 6, pH, {
    top: OBS_TOP,
    left: OBS_LEFT,
    right: OBS_RIGHT,
  });
  isoBox(ctx, rPx, rPy, 6, 6, 3, {
    top: BASALT_TOP,
    left: BASALT_LEFT,
    right: BASALT_RIGHT,
  });

  // Spanning vaulted entablature / bridge across pylons
  const aFx = 32;
  const aFy = 43;
  isoBox(ctx, aFx, aFy, 13, 13, 6, {
    top: GOLD_MID,
    left: GOLD_DARK,
    right: GOLD_BRIGHT,
  });

  // Arched portal opening through center (gateway passage)
  isoDiamond(ctx, 32, 51, 7, ASH_0, OUT);
  rightWallRect(ctx, lPx, lPy, 1, 1, 4, 11, OUT);
  rightWallRect(ctx, lPx, lPy, 2, 1, 2, 10, '#1c0707');

  // Glowing red magma runes carved into pylon faces
  leftWallRect(ctx, lPx, lPy, 2, 5, 2, 7, LAVA_RED);
  px(ctx, lPx - 2, lPy - 10, LAVA_BRIGHT);

  rightWallRect(ctx, rPx, rPy, 2, 5, 2, 7, LAVA_RED);
  px(ctx, rPx + 2, rPy - 10, LAVA_BRIGHT);

  // Golden dragon relief crest in center of entablature
  rect(ctx, 30, 31, 5, 4, GOLD_BRIGHT);
  px(ctx, 32, 32, LAVA_RED); // ruby crest eye

  // Magnificent sweeping horns crowning both pylon summits, curving inward
  drawHorn(ctx, 19, 34, 25, 18, 4);
  drawHorn(ctx, 45, 34, 39, 18, -4);
  drawHorn(ctx, 32, 27, 32, 17, 0);

  return [canvas];
}

/** dragon art for the third-wave buildings. Used as-is (no colour filter); kinds left out use the shared art recoloured. */
export const art3: Partial<Record<BuildingKind, () => HTMLCanvasElement[]>> = {
  cottage: buildCottage,
  longhouse: buildLonghouse,
  tenement: buildTenement,
  villa: buildVilla,
  highrise: buildHighrise,
  bakery: buildBakery,
  teahouse: buildTeahouse,
  tailor: buildTailor,
  bazaar: buildBazaar,
  tradeguild: buildTradeguild,
  fishery: buildFishery,
  windmill: buildWindmill,
  sawmill: buildSawmill,
  smelter: buildSmelter,
  crafthall: buildCrafthall,
  foundry: buildFoundry,
  shrine: buildShrine,
  garden: buildGarden,
  theater: buildTheater,
  observatory: buildObservatory,
  hospital: buildHospital,
  university: buildUniversity,
  palisade: buildPalisade,
  watchtower: buildWatchtower,
  armory: buildArmory,
  warcamp: buildWarcamp,
  fortress: buildFortress,
  flowerbed: buildFlowerbed,
  hedge: buildHedge,
  well: buildWell,
  pond: buildPond,
  arch: buildArch,
};
