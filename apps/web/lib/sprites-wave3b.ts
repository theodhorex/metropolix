import type { BuildingKind } from '@metropolix/sim';
import {
  OUT,
  SPRITE_H,
  SPRITE_W,
  disc,
  isoBox,
  isoDiamond,
  isoPitchedRoof,
  leftWallRect,
  makeCanvas,
  px,
  rect,
  rightWallRect,
} from './sprites';

// ============================================================================
// Shared Helper Functions (Clean pure pixel art primitives)
// ============================================================================

/** Draw a pointed spire roof with 1px dark outline and top-left lighting. */
function drawSpireLocal(
  ctx: CanvasRenderingContext2D,
  cx: number,
  baseY: number,
  halfBase: number,
  height: number,
  leftCol: string,
  rightCol: string,
  finialCol = '#ffd54f',
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
  px(ctx, cx, topY, '#fff8e1');
}

/** Draw a ribbed pixel dome with 1px dark outline. */
function drawDomeLocal(
  ctx: CanvasRenderingContext2D,
  cx: number,
  baseY: number,
  r: number,
  leftCol: string,
  rightCol: string,
  highlightCol: string,
  goldRib = true,
): void {
  for (let dy = 0; dy <= r; dy++) {
    const span = Math.max(1, Math.round(Math.sqrt(Math.max(0, r * r - dy * dy))));
    const y = baseY - dy;
    rect(ctx, cx - span - 1, y, (span + 1) * 2, 1, OUT);
    rect(ctx, cx - span, y, span, 1, leftCol);
    rect(ctx, cx, y, span, 1, rightCol);
    if (dy >= 2 && dy <= r - 2 && span >= 3) {
      rect(ctx, cx - span + 1, y, Math.max(1, span - 2), 1, highlightCol);
    }
    if (goldRib) {
      px(ctx, cx, y, '#ffd54f');
    }
  }
}

/** Draw waving banner on vertical pole. */
function drawBannerLocal(
  ctx: CanvasRenderingContext2D,
  poleX: number,
  poleY: number,
  poleH: number,
  w: number,
  h: number,
  mainCol: string,
  trimCol: string,
  frame: number,
): void {
  rect(ctx, poleX, poleY, 2, poleH, OUT);
  rect(ctx, poleX + 1, poleY + 1, 1, poleH - 1, '#cfd8dc');
  px(ctx, poleX, poleY - 1, '#ffd54f');

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
// 1. FISHERY (Industry, height 0.7, color #5f9fc0)
// Wooden pier over pond, boat, fish racks, nets, 2-frame water shimmer
// ============================================================================

export function buildFisheryTexture(frame = 0): HTMLCanvasElement {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  // Grassy shore on left/back, water pond occupying right/front
  isoDiamond(ctx, 32, 48, 28, '#416d48', OUT);

  // Water pond basin centered toward front-right
  for (let dy = -12; dy <= 12; dy++) {
    const span = Math.max(0, 22 - Math.abs(dy) * 2);
    if (span <= 0) continue;
    const y = 49 + dy;
    const x0 = 36 - (span >> 1);
    rect(ctx, x0, y, span, 1, '#2b6280');
    // Deep pool center
    if (span > 8) {
      rect(ctx, x0 + 4, y, span - 8, 1, '#1e485e');
    }
  }

  // Water shoreline ripple / embankment
  isoDiamond(ctx, 36, 49, 14, '#24526b');

  // Animated water shimmer (2 frames)
  const glints = frame === 0
    ? [[28, 48], [34, 54], [44, 48], [39, 44], [48, 52], [32, 57]] as const
    : [[30, 47], [32, 55], [42, 49], [41, 43], [46, 53], [35, 58]] as const;
  for (const [gx, gy] of glints) {
    rect(ctx, gx, gy, 2, 1, '#81d4fa');
    px(ctx, gx, gy, '#e1f5fe');
  }

  // Fisherman's wooden shack on back-left shore (fx=23, fy=45, wL=9, wR=9, wallH=9)
  const fx = 23;
  const fy = 45;
  isoBox(ctx, fx, fy, 9, 9, 9, {
    top: '#b0875a',
    left: '#543b27',
    right: '#7d583b',
  });
  // Window on right wall with lantern glow
  rightWallRect(ctx, fx, fy, 3, 3, 3, 3, OUT);
  rightWallRect(ctx, fx, fy, 4, 4, 1, 1, '#ffe082');
  // Shanty door on left wall
  leftWallRect(ctx, fx, fy, 2, 1, 4, 6, OUT);
  leftWallRect(ctx, fx, fy, 3, 1, 2, 5, '#3e2723');

  // Weathered pitched wood-shingle roof
  isoPitchedRoof(ctx, fx, fy, 11, 11, 9, 5, {
    leftSlope: '#37474f',
    rightSlope: '#546e7a',
    gable: '#543b27',
    ridge: '#78909c',
  });

  // Fish drying racks on the shore in front of shack (x=16..24, y=49..53)
  for (const rx of [17, 23]) {
    rect(ctx, rx, 48, 1, 6, OUT);
    rect(ctx, rx, 48, 1, 5, '#6d4c41');
  }
  // Cross poles and hanging fish
  rect(ctx, 16, 49, 9, 1, '#8d6e63');
  rect(ctx, 16, 51, 9, 1, '#8d6e63');
  for (let fxPos = 17; fxPos <= 23; fxPos += 2) {
    px(ctx, fxPos, 50, '#eceff1');
    px(ctx, fxPos, 52, '#cfd8dc');
  }

  // Wooden pier extending out into the pond from x=26 to x=44
  // Pier pilings in water
  const pilings = [[28, 54], [34, 57], [40, 55], [36, 50], [42, 52]] as const;
  for (const [px0, py0] of pilings) {
    rect(ctx, px0, py0, 2, 5, OUT);
    rect(ctx, px0, py0, 1, 4, '#3e2723');
  }
  // Main pier walkway planking
  for (let u = 0; u < 12; u++) {
    const px0 = 26 + u;
    const py0 = 47 + (u >> 1);
    rect(ctx, px0, py0, 1, 3, '#c49a62');
    px(ctx, px0, py0 + 3, OUT);
    px(ctx, px0, py0 - 1, OUT);
    if (u % 2 === 0) px(ctx, px0, py0, '#deb887');
  }
  // Pier cross-tee head
  for (let v = -4; v <= 4; v++) {
    const px0 = 38 + v;
    const py0 = 53 - (v >> 1);
    rect(ctx, px0, py0, 2, 2, '#a87a42');
    px(ctx, px0, py0 + 2, OUT);
  }

  // Tied rowboat docked against the pier
  const bx = 45;
  const by = 50;
  rect(ctx, bx - 1, by - 1, 8, 4, OUT);
  rect(ctx, bx, by, 6, 2, '#6d4c41');
  rect(ctx, bx + 1, by, 4, 2, '#d7ccc8'); // boat interior
  // Mooring rope from boat to pier
  px(ctx, bx - 1, by + 1, '#cfd8dc');
  px(ctx, bx - 2, by + 1, '#b0bec5');

  // Coiled rope & fish baskets on the pier
  disc(ctx, 30, 48, 2, '#bcaaa4');
  disc(ctx, 30, 48, 1, '#8d6e63');
  rect(ctx, 36, 52, 3, 2, '#5d4037');

  return canvas;
}

export function drawFisheryAddon(ctx: CanvasRenderingContext2D, level: 2 | 3, _frame: number): void {
  // L2: Smokehouse shed on shore + stacked salt herring barrels
  const sFx = 15;
  const sFy = 44;
  isoBox(ctx, sFx, sFy, 6, 6, 8, { top: '#a1783f', left: '#4e342e', right: '#795548' });
  isoPitchedRoof(ctx, sFx, sFy, 7, 7, 8, 4, {
    leftSlope: '#263238',
    rightSlope: '#455a64',
    gable: '#4e342e',
    ridge: '#607d8b',
  });
  // Smokehouse stone chimney and aromatic smoke
  isoBox(ctx, 12, 36, 2, 2, 4, { top: '#78909c', left: '#37474f', right: '#546e7a' });
  disc(ctx, 11, 30, 2, '#cfd8dc');
  disc(ctx, 12, 27, 3, '#eceff1');

  // Barrels on pier
  disc(ctx, 33, 49, 2, OUT);
  disc(ctx, 33, 49, 1, '#6d4c41');
  disc(ctx, 35, 51, 2, OUT);
  disc(ctx, 35, 51, 1, '#8d6e63');

  if (level === 3) {
    // L3: Pierhead cargo derrick crane lifting a crate + harbor lantern post + masted sailing boat
    // Derrick crane on pier corner
    rect(ctx, 43, 44, 2, 10, OUT);
    rect(ctx, 43, 44, 1, 9, '#5d4037');
    // Boom arm
    for (let i = 0; i < 7; i++) {
      px(ctx, 43 + i, 44 - (i >> 1), '#8d6e63');
    }
    // Hoist rope and suspended crate
    rect(ctx, 49, 42, 1, 6, '#cfd8dc');
    isoBox(ctx, 50, 50, 3, 3, 3, { top: '#ffd54f', left: '#a1783f', right: '#c49a62' });

    // Harbor beacon lantern on post
    rect(ctx, 27, 43, 1, 6, OUT);
    rect(ctx, 26, 42, 3, 3, '#ffd54f');
    px(ctx, 27, 43, '#fff9c4');

    // Masted sailboat moored on the outer pier
    const sx = 48;
    const sy = 56;
    rect(ctx, sx - 2, sy - 2, 10, 5, OUT);
    rect(ctx, sx - 1, sy - 1, 8, 3, '#4e342e');
    rect(ctx, sx, sy, 6, 2, '#f5f5f5');
    // Mast & furled sail
    rect(ctx, sx + 2, sy - 9, 1, 9, '#3e2723');
    rect(ctx, sx + 3, sy - 7, 3, 2, '#eceff1');
  }
}

// ============================================================================
// 2. WINDMILL (Industry, height 1.8, color #e8dcc0)
// Tall round mill with 4 sails turning (3 frames), small flour sacks
// ============================================================================

export function buildWindmillTexture(frame = 0): HTMLCanvasElement {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  // Cobblestone ground circle centered around (32, 52)
  isoDiamond(ctx, 32, 48, 28, '#436d49', OUT);
  isoDiamond(ctx, 32, 52, 18, '#827d73', OUT);
  isoDiamond(ctx, 32, 52, 15, '#a69f92', '#59544c');

  // Round tapered windmill tower (built via stacked circular slices from y=52 down to y=27)
  const baseY = 52;
  const topY = 27;
  const towerH = baseY - topY;

  for (let dy = 0; dy <= towerH; dy++) {
    const y = baseY - dy;
    // Radius tapers from 9 down to 6
    const r = Math.round(9 - (dy * 3) / towerH);
    const span = r * 2;
    const x0 = 32 - r;

    // 1px outline
    rect(ctx, x0 - 1, y, span + 2, 1, OUT);
    // Dark left shadow (shaded side)
    rect(ctx, x0, y, r, 1, '#b0a48a');
    // Mid right side (sunlit plaster)
    rect(ctx, 32, y, r, 1, '#e6dcc5');
    // Bright sunlit highlight line on front-right
    if (r >= 4) {
      px(ctx, 32 + (r >> 1), y, '#fffbee');
    }
    // Stone foundation course at base
    if (dy <= 3) {
      rect(ctx, x0, y, r, 1, '#5d574d');
      rect(ctx, 32, y, r, 1, '#7a7366');
    }
  }

  // Wooden arch entrance door on front-right
  rect(ctx, 33, 47, 4, 6, OUT);
  rect(ctx, 34, 48, 2, 5, '#4e342e');
  px(ctx, 35, 50, '#ffd54f'); // brass latch

  // Small shuttered mill windows on upper floors
  rect(ctx, 31, 38, 3, 3, OUT);
  rect(ctx, 32, 39, 1, 2, '#64b5f6');
  rect(ctx, 30, 31, 3, 3, OUT);
  rect(ctx, 31, 32, 1, 2, '#ffe082');

  // Conical thatched / timber roof cap (from y=27 down to y=20)
  for (let dy = 0; dy <= 7; dy++) {
    const y = 27 - dy;
    const r = Math.max(1, Math.round(((7 - dy) * 7) / 7));
    rect(ctx, 32 - r - 1, y, r * 2 + 2, 1, OUT);
    rect(ctx, 32 - r, y, r, 1, '#4e342e');
    rect(ctx, 32, y, r, 1, '#6d4c41');
    px(ctx, 32, y, '#8d6e63');
  }
  // Cap finial
  rect(ctx, 31, 18, 2, 2, OUT);
  rect(ctx, 31, 18, 1, 2, '#ffd54f');

  // 4 Turning Windmill Sails (3 frames: 0 = + 0°, 1 = 30°, 2 = 60°)
  const hubX = 32;
  const hubY = 25;

  // Sail blade definition: 4 blades (index 0..3) with [dx, dy] vectors of length ~12
  type SailVec = readonly [number, number];
  let sailVecs: readonly [SailVec, SailVec, SailVec, SailVec];

  if (frame === 0) {
    // 0°, 90°, 180°, 270°
    sailVecs = [
      [0, -12],
      [12, 0],
      [0, 12],
      [-12, 0],
    ];
  } else if (frame === 1) {
    // 30°, 120°, 210°, 300°
    sailVecs = [
      [6, -11],
      [11, 6],
      [-6, 11],
      [-11, -6],
    ];
  } else {
    // 60°, 150°, 240°, 330°
    sailVecs = [
      [11, -6],
      [6, 11],
      [-11, 6],
      [-6, -11],
    ];
  }

  // Draw 4 sails with lattice canvas cloth
  for (const [vx, vy] of sailVecs) {
    for (let step = 2; step <= 12; step++) {
      const sx = Math.round(hubX + (vx * step) / 12);
      const sy = Math.round(hubY + (vy * step) / 12);
      // Spar in dark wood
      px(ctx, sx, sy, '#3e2723');

      // Canvas sail cloth (perpendicular offset)
      if (step >= 4 && step <= 11) {
        // Normal vector (-vy, vx)
        const nx = -Math.sign(vy);
        const ny = Math.sign(vx);
        px(ctx, sx + nx, sy + ny, '#fff9e6');
        px(ctx, sx + nx * 2, sy + ny * 2, '#eceff1');
        px(ctx, sx + nx * 3, sy + ny * 3, OUT);
      }
    }
  }

  // Central wooden axle hub
  disc(ctx, hubX, hubY, 2, OUT);
  disc(ctx, hubX, hubY, 1, '#4e342e');
  px(ctx, hubX, hubY, '#ffd54f');

  // Plump flour sacks stacked outside the door
  const sacks = [[26, 52], [28, 54], [25, 55], [39, 52]] as const;
  for (const [sx, sy] of sacks) {
    rect(ctx, sx - 1, sy - 1, 4, 4, OUT);
    rect(ctx, sx, sy, 2, 3, '#fffbee');
    px(ctx, sx, sy - 1, '#d7ccc8'); // sack tie
    px(ctx, sx + 1, sy + 1, '#bcaaa4'); // sack shading
  }

  return canvas;
}

export function drawWindmillAddon(ctx: CanvasRenderingContext2D, level: 2 | 3, _frame: number): void {
  // L2: Timber granary storehouse lean-to on left + wooden sack cart
  const aFx = 23;
  const aFy = 53;
  isoBox(ctx, aFx, aFy, 7, 7, 8, { top: '#d7a868', left: '#5d4037', right: '#8d6e63' });
  isoPitchedRoof(ctx, aFx, aFy, 8, 8, 8, 4, {
    leftSlope: '#3e2723',
    rightSlope: '#6d4c41',
    gable: '#5d4037',
    ridge: '#ffd54f',
  });
  // Grain sack cart out front (two-wheel hand barrow)
  rect(ctx, 38, 54, 6, 2, '#8d6e63');
  disc(ctx, 39, 57, 2, OUT);
  disc(ctx, 39, 57, 1, '#4e342e');
  rect(ctx, 41, 52, 3, 3, '#fffbee'); // sacks on cart

  if (level === 3) {
    // L3: High timber observation/hoist walkway + weather vane + canvas covered grain wagon
    // Timber gallery / balcony wrapping the upper tower at y=35
    for (let u = -8; u <= 8; u++) {
      const gx = 32 + u;
      const gy = 36 - Math.round(Math.sqrt(Math.max(0, 64 - u * u)) * 0.3);
      px(ctx, gx, gy, '#5d4037');
      px(ctx, gx, gy + 1, OUT);
    }
    // Golden rooster weather vane atop conical roof
    rect(ctx, 31, 14, 1, 4, OUT);
    rect(ctx, 30, 13, 3, 2, '#ffd54f');
    px(ctx, 32, 12, '#ffe082');

    // Covered grain delivery wagon on front-right
    const wx = 42;
    const wy = 48;
    isoBox(ctx, wx, wy, 6, 8, 5, { top: '#fffbee', left: '#5d4037', right: '#8d6e63' });
    // Wagon wheels
    disc(ctx, wx - 1, wy + 2, 2, OUT);
    disc(ctx, wx + 6, wy - 1, 2, OUT);
  }
}

// ============================================================================
// 3. SAWMILL (Industry, height 1.1, color #9a6a3a)
// Open shed with big round saw, log pile, plank stacks, smoke (2 frames)
// ============================================================================

export function buildSawmillTexture(frame = 0): HTMLCanvasElement {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  // Grass and sawdust/bark work yard pad
  isoDiamond(ctx, 32, 48, 28, '#3d6945', OUT);
  isoDiamond(ctx, 32, 48, 24, '#b0844f', '#6e4a27');
  // Golden sawdust dusting
  isoDiamond(ctx, 33, 50, 16, '#c49a62');
  px(ctx, 30, 48, '#deb887');
  px(ctx, 35, 52, '#deb887');
  px(ctx, 28, 52, '#d7a76c');

  // Open-sided timber mill shed (fx=28, fy=51, wL=14, wR=14, wallH=11)
  const fx = 28;
  const fy = 51;
  const wL = 14;
  const wR = 14;
  const wallH = 11;

  // Solid back-left timber walls
  isoBox(ctx, fx, fy, wL, wR, wallH, {
    top: '#a1783f',
    left: '#543b27',
    right: '#7d583b',
  });

  // Open right face showing saw mill interior
  rightWallRect(ctx, fx, fy, 1, 1, 12, 9, '#241710');
  // Heavy timber corner posts supporting roof
  rect(ctx, fx - 1, fy - wallH, 2, wallH + 1, OUT);
  rect(ctx, fx - 1, fy - wallH, 1, wallH, '#6d4c41');
  rect(ctx, fx + wR - 2, fy - (wR >> 1) - wallH, 2, wallH + 1, OUT);
  rect(ctx, fx + wR - 2, fy - (wR >> 1) - wallH, 1, wallH, '#6d4c41');

  // Pitched weathered cedar timber roof
  isoPitchedRoof(ctx, fx, fy, wL + 2, wR + 2, wallH, 6, {
    leftSlope: '#4a3321',
    rightSlope: '#785334',
    gable: '#6d4c41',
    ridge: '#9e6d42',
  });

  // Timber sawing carriage table inside
  rect(ctx, 22, 45, 12, 3, '#3e2723');
  rect(ctx, 22, 44, 8, 2, '#6d4c41'); // timber log being cut

  // Big round circular saw blade mounted on carriage bench
  disc(ctx, 28, 43, 5, OUT);
  disc(ctx, 28, 43, 4, '#78909c');
  disc(ctx, 28, 43, 1, '#263238'); // arbor bolt
  // Bright sharp tooth rim and saw sparks
  px(ctx, 24, 43, '#ffffff');
  px(ctx, 32, 43, '#ffffff');
  px(ctx, 28, 39, '#ffffff');
  px(ctx, 28, 47, '#ffffff');
  px(ctx, 29, 41, '#ffd54f'); // spark

  // Pyramid of tree logs outside in the front-left yard
  const logs = [
    [17, 54],
    [21, 56],
    [25, 57],
    [19, 51],
    [23, 53],
    [21, 48],
  ] as const;
  for (const [lx, ly] of logs) {
    disc(ctx, lx, ly, 3, OUT);
    disc(ctx, lx, ly, 2, '#5d4037');
    px(ctx, lx, ly, '#d7a76c'); // cut ring heartwood
  }

  // Neatly stacked cut lumber planks in the front-right yard
  isoBox(ctx, 38, 54, 5, 6, 4, { top: '#e0b878', left: '#8d6e3f', right: '#b0875a' });
  rightWallRect(ctx, 38, 54, 1, 2, 4, 1, '#543b27'); // spacer gap
  isoBox(ctx, 44, 49, 4, 5, 3, { top: '#f0ca88', left: '#9e7a48', right: '#c49a62' });

  // Stovepipe chimney on roof with gentle smoke (2 frames)
  rect(ctx, 21, 25, 2, 7, OUT);
  rect(ctx, 21, 25, 1, 6, '#37474f');
  if (frame === 0) {
    disc(ctx, 21, 21, 2, '#cfd8dc');
    disc(ctx, 23, 17, 3, '#eceff1');
  } else {
    disc(ctx, 22, 20, 2, '#b0bec5');
    disc(ctx, 24, 16, 3, '#cfd8dc');
    disc(ctx, 27, 12, 3, '#eceff1');
  }

  return canvas;
}

export function drawSawmillAddon(ctx: CanvasRenderingContext2D, level: 2 | 3, frame: number): void {
  // L2: Heavy log delivery ramp with steel rollers + timber crane arm
  const rFx = 16;
  const rFy = 56;
  rect(ctx, rFx - 2, rFy - 1, 8, 4, OUT);
  rect(ctx, rFx - 1, rFy, 6, 2, '#5d4037');
  for (let rx = rFx; rx <= rFx + 4; rx += 2) {
    px(ctx, rx, rFy, '#90a4ae'); // iron roller
  }
  // Crane boom on front corner of shed
  rect(ctx, 28, 36, 2, 8, OUT);
  rect(ctx, 28, 36, 1, 7, '#5d4037');
  for (let i = 0; i < 6; i++) {
    px(ctx, 28 + i, 36 - (i >> 1), '#8d6e63');
  }
  rect(ctx, 33, 34, 1, 5, '#cfd8dc'); // cable

  if (level === 3) {
    // L3: Overhead timber gantry frame with chain hoist + two-storey drying loft + secondary steam stack
    // Gantry spanning over log yard
    rect(ctx, 16, 38, 2, 16, OUT);
    rect(ctx, 16, 38, 1, 15, '#4e342e');
    rect(ctx, 42, 36, 2, 16, OUT);
    rect(ctx, 42, 36, 1, 15, '#4e342e');
    rect(ctx, 16, 37, 28, 2, OUT);
    rect(ctx, 16, 38, 27, 1, '#ffd54f'); // golden hoist rail

    // Hoist trolley & chains
    const tX = 26 + (frame % 2) * 2;
    rect(ctx, tX, 39, 4, 3, '#263238');
    rect(ctx, tX + 1, 42, 1, 6, '#cfd8dc');
    rect(ctx, tX + 2, 42, 1, 6, '#90a4ae');

    // Upper timber lumber-drying loft
    const lFx = 27;
    const lFy = 38;
    isoBox(ctx, lFx, lFy, 10, 10, 7, { top: '#c49a62', left: '#543b27', right: '#7d583b' });
    // Louvered drying slats
    for (const z of [2, 4]) {
      rightWallRect(ctx, lFx, lFy, 1, z, 8, 1, '#2b1d14');
    }
    isoPitchedRoof(ctx, lFx, lFy, 11, 11, 7, 4, {
      leftSlope: '#3e2723',
      rightSlope: '#6d4c41',
      gable: '#543b27',
      ridge: '#ffd54f',
    });

    // Secondary tall steam boiler stack
    isoBox(ctx, 38, 30, 3, 3, 11, { top: '#263238', left: '#37474f', right: '#455a64' });
    disc(ctx, 37, 16, 3, '#eceff1');
  }
}

// ============================================================================
// 4. SMELTER (Industry, height 1.3, color #7a5a5a)
// Squat stone furnace with glowing mouth (3 frames), chimney smoke, ore cart
// ============================================================================

export function buildSmelterTexture(frame = 0): HTMLCanvasElement {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  // Scorched basalt & slag furnace foundation pad
  isoDiamond(ctx, 32, 48, 28, '#2e2e2e', OUT);
  isoDiamond(ctx, 32, 48, 24, '#424242', '#1f1f1f');
  // Cinders and soot
  isoDiamond(ctx, 32, 50, 16, '#262626');
  px(ctx, 28, 52, '#ff5722');
  px(ctx, 36, 54, '#ff9800');
  px(ctx, 39, 49, '#bf360c');

  // Squat stone furnace body (fx=30, fy=54, wL=15, wR=15, wallH=14)
  const fx = 30;
  const fy = 54;
  const wL = 15;
  const wR = 15;
  const wallH = 14;

  // Dark firebrick masonry
  isoBox(ctx, fx, fy, wL, wR, wallH, {
    top: '#5d4747',
    left: '#3a2727',
    right: '#4a3333',
  });

  // Heavy forged iron reinforcement straps binding the stone block
  leftWallRect(ctx, fx, fy, 0, 4, wL, 1, '#1a1a1a');
  leftWallRect(ctx, fx, fy, 0, 10, wL, 1, '#1a1a1a');
  rightWallRect(ctx, fx, fy, 0, 4, wR, 1, '#1a1a1a');
  rightWallRect(ctx, fx, fy, 0, 10, wR, 1, '#1a1a1a');

  // Glowing furnace mouth on front-right wall (3-frame molten pulse)
  rightWallRect(ctx, fx, fy, 3, 1, 7, 7, OUT);
  rightWallRect(ctx, fx, fy, 4, 2, 5, 5, '#bf360c');

  if (frame === 0) {
    rightWallRect(ctx, fx, fy, 5, 2, 3, 4, '#ff5722');
    px(ctx, 36, 50, '#ffeb3b');
  } else if (frame === 1) {
    rightWallRect(ctx, fx, fy, 5, 2, 3, 4, '#ff9800');
    px(ctx, 36, 50, '#ffffff');
    px(ctx, 35, 51, '#ffe082');
  } else {
    rightWallRect(ctx, fx, fy, 5, 2, 3, 4, '#ff6d00');
    px(ctx, 36, 50, '#ffd54f');
    px(ctx, 37, 49, '#ffab00');
  }

  // Reflected molten glow spilled on stone apron
  rect(ctx, 35, 53, 5, 1, '#ff6d00');
  rect(ctx, 36, 54, 3, 1, '#bf360c');

  // Heavy stone masonry chimney stack rising above furnace roof
  const cFx = 24;
  const cFy = 36;
  isoBox(ctx, cFx, cFy, 6, 6, 12, {
    top: '#212121',
    left: '#2d1f1f',
    right: '#3d2b2b',
  });
  // Iron rim cap
  rect(ctx, cFx - 6, cFy - (6 >> 1) - 12, 10, 2, '#1b1b1b');

  // Billowing furnace smoke (3 frames)
  if (frame === 0) {
    disc(ctx, 23, 17, 3, '#546e7a');
    disc(ctx, 25, 13, 4, '#78909c');
  } else if (frame === 1) {
    disc(ctx, 24, 16, 3, '#455a64');
    disc(ctx, 26, 11, 4, '#607d8b');
    disc(ctx, 29, 7, 3, '#90a4ae');
  } else {
    disc(ctx, 23, 18, 2, '#37474f');
    disc(ctx, 25, 14, 4, '#546e7a');
    disc(ctx, 27, 9, 4, '#78909c');
  }

  // Small iron ore cart on rails
  // Parallel iron rail tracks along front-right
  for (let r = 0; r < 12; r++) {
    const rx = 36 + r;
    const ry = 55 - (r >> 1);
    px(ctx, rx, ry, '#424242');
    px(ctx, rx + 1, ry + 2, '#424242');
  }
  // Iron ore cart
  const cartFx = 43;
  const cartFy = 53;
  isoBox(ctx, cartFx, cartFy, 4, 5, 4, {
    top: '#8d6e63',
    left: '#263238',
    right: '#37474f',
  });
  // Raw rough iron ore chunks in cart with metallic glint
  px(ctx, cartFx - 1, cartFy - 4, '#4e342e');
  px(ctx, cartFx - 2, cartFy - 5, '#ffd54f'); // gold pyrite / raw ore spark
  px(ctx, cartFx, cartFy - 5, '#6d4c41');

  // Flanged wheels on rails
  disc(ctx, cartFx - 2, cartFy + 1, 1, '#1b1b1b');
  disc(ctx, cartFx + 3, cartFy - 1, 1, '#1b1b1b');

  return canvas;
}

export function drawSmelterAddon(ctx: CanvasRenderingContext2D, level: 2 | 3, frame: number): void {
  // L2: Molten slag discharge canal with glowing orange slag trail + secondary iron preheating flue
  // Molten slag trough running off front-left
  for (let s = 0; s < 8; s++) {
    const sx = 27 - s;
    const sy = 54 + (s >> 1);
    rect(ctx, sx - 1, sy, 3, 2, OUT);
    rect(ctx, sx, sy, 2, 1, frame % 2 === 0 ? '#ff5722' : '#ff9800');
  }
  // Secondary iron flue stack on right
  isoBox(ctx, 37, 34, 3, 3, 8, { top: '#212121', left: '#2d1f1f', right: '#3d2b2b' });
  disc(ctx, 36, 23, 2, '#78909c');

  // Heavy crucible ladle crane
  rect(ctx, 39, 44, 1, 8, OUT);
  rect(ctx, 37, 43, 4, 1, '#455a64');
  rect(ctx, 36, 44, 2, 3, '#ffd54f');

  if (level === 3) {
    // L3: Steel blast furnace superstructure with industrial gantry + inclined skip hoist ramp with second ore hopper
    // Heavy steel truss framework over the furnace
    rect(ctx, 18, 22, 2, 24, OUT);
    rect(ctx, 18, 22, 1, 23, '#37474f');
    rect(ctx, 38, 20, 2, 24, OUT);
    rect(ctx, 38, 20, 1, 23, '#37474f');
    rect(ctx, 18, 21, 22, 2, OUT);
    rect(ctx, 18, 22, 21, 1, '#ffb300'); // safety warning girder

    // Cross truss bracing
    for (let b = 0; b < 10; b += 3) {
      px(ctx, 19 + b, 23 + b, '#78909c');
      px(ctx, 37 - b, 23 + b, '#78909c');
    }

    // Inclined skip hoist ramp for ore buckets
    for (let i = 0; i < 14; i++) {
      const rx = 16 + i;
      const ry = 46 - i;
      px(ctx, rx, ry, '#212121');
      px(ctx, rx + 1, ry, '#78909c');
    }
    // Skip car on hoist ramp
    const sX = 22 + (frame % 3) * 2;
    const sY = 40 - (frame % 3) * 2;
    rect(ctx, sX - 2, sY - 2, 5, 4, OUT);
    rect(ctx, sX - 1, sY - 1, 3, 2, '#ffab00');
  }
}

// ============================================================================
// 5. CRAFT HALL (Industry, height 1.4, color #9a7aaa)
// Two-storey guild workshop, crane lifting a crate, many goods crates
// ============================================================================

export function buildCrafthallTexture(): HTMLCanvasElement {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  // Flagstone artisan guild courtyard
  isoDiamond(ctx, 32, 48, 28, '#433d39', OUT);
  isoDiamond(ctx, 32, 48, 25, '#696057', '#332e2a');

  // Impressive two-storey guildhall building (fx=29, fy=54, wL=15, wR=17, total H=19)
  const fx = 29;
  const fy = 54;
  const wL = 15;
  const wR = 17;

  // Ground floor: Ashlar masonry course (height 9)
  isoBox(ctx, fx, fy, wL, wR, 9, {
    top: '#757575',
    left: '#424242',
    right: '#5e5e5e',
  });

  // Heavy arched double doors on right wall
  rightWallRect(ctx, fx, fy, 2, 1, 5, 7, OUT);
  rightWallRect(ctx, fx, fy, 3, 1, 3, 6, '#3e2723');
  px(ctx, fx + 4, fy - 3, '#ffd54f'); // brass ring handle

  // Ground floor leaded arched workshop window
  rightWallRect(ctx, fx, fy, 9, 3, 5, 4, OUT);
  rightWallRect(ctx, fx, fy, 10, 4, 3, 2, '#ffd56b');

  // Ground floor window on shaded left wall
  leftWallRect(ctx, fx, fy, 4, 3, 5, 4, OUT);
  leftWallRect(ctx, fx, fy, 5, 4, 3, 2, '#81d4fa');

  // Upper floor: Jettied overhang (projects 1px out, height 10)
  const uFx = fx + 1;
  const uFy = fy - 9;
  const uL = wL;
  const uR = wR;
  const uH = 10;

  isoBox(ctx, uFx, uFy, uL, uR, uH, {
    top: '#e0d5c3',
    left: '#8d6e63',
    right: '#bcaaa4',
  });

  // Exposed dark oak timber framing on upper floor
  rightWallRect(ctx, uFx, uFy, 0, 0, uR, 1, '#3e2723'); // jetty beam
  rightWallRect(ctx, uFx, uFy, 0, uH - 1, uR, 1, '#3e2723'); // wall plate
  leftWallRect(ctx, uFx, uFy, 0, 0, uL, 1, '#2b1b17');
  leftWallRect(ctx, uFx, uFy, 0, uH - 1, uL, 1, '#2b1b17');

  // Vertical timber studs
  for (const v0 of [1, 5, 9, 13]) {
    rightWallRect(ctx, uFx, uFy, v0, 1, 1, uH - 2, '#3e2723');
  }
  for (const u0 of [2, 7, 12]) {
    leftWallRect(ctx, uFx, uFy, u0, 1, 1, uH - 2, '#2b1b17');
  }

  // Upper leaded diamond-pane windows
  rightWallRect(ctx, uFx, uFy, 2, 2, 3, 5, OUT);
  rightWallRect(ctx, uFx, uFy, 2, 3, 2, 3, '#81d4fa');
  rightWallRect(ctx, uFx, uFy, 10, 2, 3, 5, OUT);
  rightWallRect(ctx, uFx, uFy, 10, 3, 2, 3, '#81d4fa');
  leftWallRect(ctx, uFx, uFy, 3, 2, 3, 5, OUT);
  leftWallRect(ctx, uFx, uFy, 4, 3, 2, 3, '#4fc3f7');

  // Steep pitched roof in guild plum-slate
  isoPitchedRoof(ctx, uFx, uFy, uL + 2, uR + 2, uH, 8, {
    leftSlope: '#4a3359',
    rightSlope: '#7b538c',
    gable: '#6d4c41',
    ridge: '#a97dbd',
  });

  // Attic timber gantry crane boom projecting from front-right gable
  const gantryX = 31;
  const gantryY = 25;
  rect(ctx, gantryX, gantryY, 2, 2, OUT);
  // Crane timber beam extending out forward
  for (let i = 0; i < 8; i++) {
    px(ctx, gantryX + i, gantryY + (i >> 1), '#5d4037');
    px(ctx, gantryX + i, gantryY + (i >> 1) + 1, OUT);
  }
  // Pulley at tip & rope
  disc(ctx, 39, 29, 1, '#212121');
  rect(ctx, 39, 30, 1, 12, '#d7ccc8'); // hoist rope

  // Suspended wooden cargo crate swinging mid-air
  isoBox(ctx, 41, 46, 4, 4, 4, {
    top: '#ffd54f',
    left: '#8d6e3f',
    right: '#c49a62',
  });
  // Iron banding on swinging crate
  px(ctx, 40, 44, '#263238');
  px(ctx, 41, 44, '#263238');

  // Many goods crates and cargo stacked around the courtyard
  // Stack on left flank (3 crates)
  isoBox(ctx, 18, 54, 5, 5, 4, { top: '#d7a76c', left: '#5d4037', right: '#8d6e63' });
  isoBox(ctx, 17, 50, 3, 3, 3, { top: '#ffd54f', left: '#b28924', right: '#f5be36' });
  isoBox(ctx, 22, 56, 4, 4, 3, { top: '#c49a62', left: '#4e342e', right: '#795548' });

  // Stack on right flank (crates and barrels)
  isoBox(ctx, 45, 53, 5, 5, 4, { top: '#c49a62', left: '#4e342e', right: '#795548' });
  isoBox(ctx, 48, 48, 4, 4, 3, { top: '#d7ccc8', left: '#546e7a', right: '#78909c' });
  disc(ctx, 43, 56, 2, OUT);
  disc(ctx, 43, 56, 1, '#4e342e');

  return canvas;
}

export function drawCrafthallAddon(ctx: CanvasRenderingContext2D, level: 2 | 3, _frame: number): void {
  // L2: Master artisan dormer windows on slate roof + outdoor forge and anvil under awning
  // Roof dormer window on right slope
  const dFx = 37;
  const dFy = 28;
  isoBox(ctx, dFx, dFy, 3, 4, 4, { top: '#bcaaa4', left: '#6d4c41', right: '#8d6e63' });
  isoPitchedRoof(ctx, dFx, dFy, 4, 5, 4, 3, {
    leftSlope: '#4a3359',
    rightSlope: '#7b538c',
    gable: '#6d4c41',
    ridge: '#ffd54f',
  });
  rightWallRect(ctx, dFx, dFy, 1, 1, 2, 2, '#ffd56b');

  // Outdoor forge hearth and anvil on left courtyard
  rect(ctx, 15, 50, 4, 3, OUT);
  rect(ctx, 15, 50, 3, 2, '#424242');
  px(ctx, 16, 49, '#ff5722'); // glowing coals
  // Iron anvil
  rect(ctx, 14, 54, 4, 2, OUT);
  rect(ctx, 15, 54, 2, 1, '#78909c');

  if (level === 3) {
    // L3: Grand guild clocktower pediment on roof + overhead bridge crane + heraldic banners
    // Clocktower pediment rising from roof ridge
    const tFx = 30;
    const tFy = 20;
    isoBox(ctx, tFx, tFy, 6, 6, 10, { top: '#e0d5c3', left: '#5c436b', right: '#7b538c' });
    // Clock face
    disc(ctx, 32, 14, 3, OUT);
    disc(ctx, 32, 14, 2, '#fffbee');
    px(ctx, 32, 14, '#1b1b1b');
    px(ctx, 32, 13, '#1b1b1b'); // clock hand
    px(ctx, 33, 14, '#ffd54f'); // golden rim
    drawSpireLocal(ctx, tFx + 1, tFy - 12, 4, 7, '#4a3359', '#7b538c');

    // Heavy overhead steel bridge crane structure
    rect(ctx, 42, 34, 2, 14, OUT);
    rect(ctx, 42, 34, 1, 13, '#37474f');
    rect(ctx, 28, 30, 16, 2, '#ffb300'); // yellow crane beam

    // Heraldic guild banners hanging from upper wall
    drawBannerLocal(ctx, 24, 36, 10, 4, 6, '#5c436b', '#ffd54f', 0);
  }
}

// ============================================================================
// 6. FOUNDRY (Industry, height 1.9, color #6a6a72)
// Heavy industrial block, two tall chimneys with thick smoke (3 frames), molten glow
// ============================================================================

export function buildFoundryTexture(frame = 0): HTMLCanvasElement {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  // Scorched industrial slag & iron plate foundation pad
  isoDiamond(ctx, 32, 48, 28, '#263238', OUT);
  isoDiamond(ctx, 32, 48, 25, '#37474f', '#1c252a');
  // Cinders and soot
  isoDiamond(ctx, 32, 50, 18, '#21282c');

  // Heavy monolith industrial foundry block (fx=32, fy=54, wL=17, wR=19, wallH=17)
  const fx = 32;
  const fy = 54;
  const wL = 17;
  const wR = 19;
  const wallH = 17;

  // Dark industrial stone & cast-iron walls
  isoBox(ctx, fx, fy, wL, wR, wallH, {
    top: '#546e7a',
    left: '#263238',
    right: '#37474f',
  });

  // Steel exoskeleton girder cage (dark iron structural beams)
  leftWallRect(ctx, fx, fy, 0, 0, wL, 1, '#151b1e');
  leftWallRect(ctx, fx, fy, 0, wallH - 1, wL, 1, '#151b1e');
  rightWallRect(ctx, fx, fy, 0, 0, wR, 1, '#151b1e');
  rightWallRect(ctx, fx, fy, 0, wallH - 1, wR, 1, '#151b1e');
  // Vertical column girders
  for (const v of [1, 6, 12, 17]) {
    rightWallRect(ctx, fx, fy, v, 0, 1, wallH, '#151b1e');
  }
  for (const u of [2, 8, 14]) {
    leftWallRect(ctx, fx, fy, u, 0, 1, wallH, '#151b1e');
  }

  // Raised roof monitor / clerestory lantern for smoke ventilation
  const mFx = 29;
  const mFy = 34;
  isoBox(ctx, mFx, mFy, 8, 10, 4, {
    top: '#37474f',
    left: '#1c252a',
    right: '#263238',
  });
  // Louver vent slats
  rightWallRect(ctx, mFx, mFy, 1, 1, 8, 1, '#151b1e');
  rightWallRect(ctx, mFx, mFy, 1, 3, 8, 1, '#151b1e');

  // Wide low arched casting bay on front-right wall with molten glow
  rightWallRect(ctx, fx, fy, 4, 1, 11, 6, OUT);
  rightWallRect(ctx, fx, fy, 5, 1, 9, 5, '#151b1e');

  // 3-frame molten metal pulse
  if (frame === 0) {
    rightWallRect(ctx, fx, fy, 6, 1, 7, 3, '#ff3d00');
    rightWallRect(ctx, fx, fy, 7, 2, 4, 1, '#ff9100');
  } else if (frame === 1) {
    rightWallRect(ctx, fx, fy, 6, 1, 7, 3, '#ff9100');
    rightWallRect(ctx, fx, fy, 7, 2, 5, 1, '#ffea00');
  } else {
    rightWallRect(ctx, fx, fy, 6, 1, 7, 3, '#ff6d00');
    rightWallRect(ctx, fx, fy, 7, 2, 4, 1, '#ffffff');
  }

  // Molten iron runoff channel extending forward on ground
  for (let c = 0; c < 6; c++) {
    const cx0 = 36 + c;
    const cy0 = 54 + (c >> 1);
    px(ctx, cx0, cy0, frame === 1 ? '#ffab00' : '#ff3d00');
    px(ctx, cx0, cy0 + 1, OUT);
  }

  // Two tall brick smokestacks (twin chimneys) rising high above
  // Chimney 1 (back-left, base at (22, 35), height 18, top at y=13)
  isoBox(ctx, 22, 35, 4, 4, 18, {
    top: '#1c252a',
    left: '#37474f',
    right: '#455a64',
  });
  // Iron rim cap
  rect(ctx, 16, 14, 7, 2, '#151b1e');

  // Chimney 2 (center-back, base at (34, 29), height 15, top at y=11)
  isoBox(ctx, 34, 29, 4, 4, 15, {
    top: '#1c252a',
    left: '#37474f',
    right: '#455a64',
  });
  rect(ctx, 28, 12, 7, 2, '#151b1e');

  // Thick heavy industrial smoke billowing from both chimneys (3 frames)
  if (frame === 0) {
    // Stack 1 smoke
    disc(ctx, 19, 10, 4, '#37474f');
    disc(ctx, 21, 6, 5, '#546e7a');
    disc(ctx, 24, 3, 4, '#78909c');
    // Stack 2 smoke
    disc(ctx, 31, 8, 3, '#37474f');
    disc(ctx, 33, 4, 5, '#546e7a');
    disc(ctx, 36, 1, 4, '#78909c');
  } else if (frame === 1) {
    disc(ctx, 20, 9, 4, '#263238');
    disc(ctx, 22, 5, 5, '#455a64');
    disc(ctx, 25, 2, 5, '#607d8b');
    disc(ctx, 28, 0, 4, '#90a4ae');
    disc(ctx, 32, 7, 4, '#263238');
    disc(ctx, 34, 3, 5, '#455a64');
    disc(ctx, 37, 1, 4, '#607d8b');
  } else {
    disc(ctx, 19, 11, 3, '#1c252a');
    disc(ctx, 21, 7, 5, '#37474f');
    disc(ctx, 23, 4, 5, '#546e7a');
    disc(ctx, 26, 1, 4, '#78909c');
    disc(ctx, 31, 9, 3, '#1c252a');
    disc(ctx, 33, 5, 4, '#37474f');
    disc(ctx, 36, 2, 4, '#546e7a');
  }

  return canvas;
}

export function drawFoundryAddon(ctx: CanvasRenderingContext2D, level: 2 | 3, _frame: number): void {
  // L2: Overhead iron pipe network across roof + side casting shed annex with iron louvers
  // Overhead steam/gas duct pipes
  rect(ctx, 21, 26, 16, 2, OUT);
  rect(ctx, 21, 27, 16, 1, '#cfd8dc');
  rect(ctx, 37, 27, 2, 8, OUT);
  rect(ctx, 37, 27, 1, 7, '#90a4ae');

  // Side casting shed annex on right flank
  const sFx = 46;
  const sFy = 48;
  isoBox(ctx, sFx, sFy, 6, 7, 9, { top: '#546e7a', left: '#263238', right: '#37474f' });
  rightWallRect(ctx, sFx, sFy, 1, 2, 5, 5, '#151b1e');
  rightWallRect(ctx, sFx, sFy, 2, 3, 3, 3, '#ff9100'); // glowing ingots inside

  if (level === 3) {
    // L3: Massive central reverberatory cupola dome + third towering chimney stack + iron slag gantry
    // Central reverberatory furnace cupola dome
    drawDomeLocal(ctx, 31, 22, 6, '#263238', '#455a64', '#90a4ae', true);
    // Fiery vent top on cupola
    rect(ctx, 30, 14, 3, 3, '#ff3d00');
    px(ctx, 31, 13, '#ffea00');

    // Third towering super-stack in the center
    isoBox(ctx, 27, 25, 4, 4, 19, { top: '#1c252a', left: '#263238', right: '#37474f' });
    rect(ctx, 21, 4, 7, 2, '#ffd54f'); // gold safety band
    disc(ctx, 24, 1, 4, '#37474f');

    // Heavy slag gantry rail running along front
    rect(ctx, 16, 47, 14, 2, '#ffb300');
    rect(ctx, 16, 48, 1, 8, '#263238');
    rect(ctx, 29, 48, 1, 8, '#263238');
  }
}

// ============================================================================
// 7. SHRINE (Services, height 1.0, color #d8c8a8)
// Sacred gate/altar with candles, stone steps, prayer flags
// ============================================================================

export function buildShrineTexture(): HTMLCanvasElement {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  // Sacred grove grass & raked gravel sanctuary pad
  isoDiamond(ctx, 32, 48, 28, '#3d6945', OUT);
  isoDiamond(ctx, 32, 48, 24, '#d8d0c0', '#787062');
  // Raked concentric zen gravel patterns
  isoDiamond(ctx, 32, 48, 20, '#ebe5d8', '#a89f90');

  // Tiered stone steps leading to sacred altar terrace
  isoDiamond(ctx, 32, 51, 17, '#8d877c', OUT);
  isoDiamond(ctx, 32, 49, 14, '#b0aba0', '#54514a');

  // Sacred Torii gate (vermilion & cedar pillars with curved lintel)
  const p1X = 23;
  const p1Y = 46;
  const p2X = 41;
  const p2Y = 42;
  const gateH = 15;

  // Pillar 1 (left)
  rect(ctx, p1X - 1, p1Y - gateH, 3, gateH + 1, OUT);
  rect(ctx, p1X, p1Y - gateH, 2, gateH, '#b71c1c');
  rect(ctx, p1X - 1, p1Y - 2, 3, 3, '#212121'); // black lacquer base

  // Pillar 2 (right)
  rect(ctx, p2X - 1, p2Y - gateH, 3, gateH + 1, OUT);
  rect(ctx, p2X, p2Y - gateH, 2, gateH, '#c62828');
  rect(ctx, p2X - 1, p2Y - 2, 3, 3, '#212121');

  // Upper curved crossbeam lintel spanning across the pillars
  const lintelY = p1Y - gateH - 1;
  rect(ctx, p1X - 4, lintelY - 2, (p2X - p1X) + 9, 3, OUT);
  rect(ctx, p1X - 3, lintelY - 2, (p2X - p1X) + 7, 2, '#b71c1c');
  // Curved upturned beam ends
  px(ctx, p1X - 4, lintelY - 3, '#b71c1c');
  px(ctx, p2X + 4, lintelY - 3 - 2, '#b71c1c');

  // Secondary tie-beam beneath
  rect(ctx, p1X - 1, lintelY + 3, (p2X - p1X) + 3, 2, OUT);
  rect(ctx, p1X, lintelY + 3, (p2X - p1X) + 1, 1, '#212121');

  // Golden sacred talisman plaque in center of lintel
  rect(ctx, 31, lintelY - 1, 3, 3, '#ffd54f');
  px(ctx, 32, lintelY, '#fff9c4');

  // Sacred stone altar table centered beneath gate
  const aFx = 32;
  const aFy = 49;
  isoBox(ctx, aFx, aFy, 6, 6, 4, {
    top: '#e0dacf',
    left: '#757068',
    right: '#9e978d',
  });

  // Brass offering bowls on altar
  px(ctx, 31, 44, '#ffd54f');
  px(ctx, 32, 44, '#ffd54f');
  px(ctx, 33, 44, '#cfd8dc');

  // Lit candles with flickering flame tips
  // Left candle
  rect(ctx, 29, 42, 1, 3, '#fffbee');
  px(ctx, 29, 41, '#ff9800');
  px(ctx, 29, 40, '#ffeb3b');

  // Right candle
  rect(ctx, 34, 41, 1, 3, '#fffbee');
  px(ctx, 34, 40, '#ff9800');
  px(ctx, 34, 39, '#ffeb3b');

  // Colorful prayer flags strung across the gate
  const flags = [
    [26, 33, '#29b6f6'], // blue: space
    [29, 32, '#ffffff'], // white: air
    [32, 31, '#e53935'], // red: fire
    [35, 30, '#43a047'], // green: water
    [38, 29, '#fdd835'], // yellow: earth
  ] as const;
  for (const [fx0, fy0, col] of flags) {
    rect(ctx, fx0, fy0, 2, 3, OUT);
    rect(ctx, fx0, fy0, 2, 2, col);
  }

  // Carved stone lanterns (toro) flanking the stone terrace
  // Left stone lantern
  isoBox(ctx, 19, 53, 3, 3, 6, { top: '#b0aba0', left: '#54514a', right: '#757068' });
  px(ctx, 18, 49, '#ffd54f'); // lit lantern window
  px(ctx, 19, 46, OUT); // pointed pagoda cap

  // Right stone lantern
  isoBox(ctx, 45, 48, 3, 3, 6, { top: '#b0aba0', left: '#54514a', right: '#757068' });
  px(ctx, 44, 44, '#ffd54f');
  px(ctx, 45, 41, OUT);

  return canvas;
}

export function drawShrineAddon(ctx: CanvasRenderingContext2D, level: 2 | 3, _frame: number): void {
  // L2: Ornate stone incense brazier with rising white smoke + carved stone guardian statues
  // Stone incense brazier in front of altar
  isoBox(ctx, 32, 54, 4, 4, 3, { top: '#5d574d', left: '#3e3a33', right: '#4a453d' });
  px(ctx, 31, 50, '#ff5722'); // burning incense coals
  disc(ctx, 30, 46, 2, '#cfd8dc'); // smoke puffs
  disc(ctx, 31, 42, 3, '#eceff1');

  // Carved stone guardian statues on bottom steps
  rect(ctx, 22, 54, 3, 4, OUT);
  rect(ctx, 22, 54, 2, 3, '#b0aba0');
  rect(ctx, 41, 50, 3, 4, OUT);
  rect(ctx, 41, 50, 2, 3, '#b0aba0');

  if (level === 3) {
    // L3: Sacred pagoda bell canopy with brass temple bell + meditation pavilion
    // Tiered pagoda roof canopy over the shrine
    drawSpireLocal(ctx, 32, 24, 7, 7, '#b71c1c', '#c62828', '#ffd54f');
    // Suspended brass temple bell
    disc(ctx, 32, 27, 2, OUT);
    disc(ctx, 32, 27, 1, '#ffd54f');

    // Stone meditation pavilion with water reflection basin on right
    isoBox(ctx, 47, 43, 6, 6, 6, { top: '#e0dacf', left: '#54514a', right: '#757068' });
    isoPitchedRoof(ctx, 47, 43, 7, 7, 6, 3, {
      leftSlope: '#263238',
      rightSlope: '#37474f',
      gable: '#54514a',
      ridge: '#ffd54f',
    });
    // Water basin (tsukubai)
    disc(ctx, 42, 52, 2, OUT);
    disc(ctx, 42, 52, 1, '#81d4fa');
  }
}

// ============================================================================
// 8. GARDEN (Services, height 0.4, color #5aa860)
// Flat formal garden: hedge maze / flower beds, bench, pond, 0.4 tall
// ============================================================================

export function buildGardenTexture(): HTMLCanvasElement {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  // Manicured formal garden lawn occupying full ground diamond
  isoDiamond(ctx, 32, 48, 28, '#2e7d32', OUT);

  // Geometric formal crushed-gravel pathways (cross axis)
  // Longitudinal path along left-up axis
  for (let u = 4; u < 28; u++) {
    const sx = 32 + (u - 16);
    const sy = 48 - (u >> 1) + 8;
    rect(ctx, sx - 2, sy, 4, 1, '#d7ccc8');
    px(ctx, sx - 2, sy, '#a1887f');
    px(ctx, sx + 2, sy, '#a1887f');
  }
  // Transverse path along right-up axis
  for (let v = 4; v < 28; v++) {
    const sx = 32 - (v - 16);
    const sy = 48 - (v >> 1) + 8;
    rect(ctx, sx - 2, sy, 4, 1, '#d7ccc8');
    px(ctx, sx - 2, sy, '#a1887f');
    px(ctx, sx + 2, sy, '#a1887f');
  }

  // Central circular plaza intersection
  isoDiamond(ctx, 32, 48, 8, '#eceff1', '#8d6e63');

  // Neat boxwood parterre hedges (height 3px) framing geometric garden rooms
  // Quadrant 1 (back-left): Neat hedge maze parterre
  const h1 = [[24, 40], [28, 38], [20, 42], [24, 44]] as const;
  for (const [hx, hy] of h1) {
    rect(ctx, hx - 2, hy - 3, 5, 4, OUT);
    rect(ctx, hx - 2, hy - 3, 2, 3, '#1b5e20');
    rect(ctx, hx, hy - 3, 2, 3, '#2e7d32');
    rect(ctx, hx - 1, hy - 4, 3, 1, '#43a047');
  }

  // Vibrant flowerbeds inside hedge compartments
  // Quadrant 1 flowers: Purple lavender & iris
  const iris = [[23, 41], [27, 39], [21, 43], [25, 43]] as const;
  for (const [fx0, fy0] of iris) {
    px(ctx, fx0, fy0 - 1, '#ab47bc');
    px(ctx, fx0, fy0 - 2, '#ce93d8');
    px(ctx, fx0, fy0, '#1b5e20');
  }

  // Quadrant 2 (back-right): Red & pink rose beds
  const roses = [[38, 39], [42, 41], [36, 42], [40, 43]] as const;
  for (const [rx0, ry0] of roses) {
    rect(ctx, rx0 - 1, ry0 - 1, 3, 2, '#1b5e20');
    px(ctx, rx0, ry0 - 1, '#e91e63');
    px(ctx, rx0 + 1, ry0 - 2, '#f06292');
  }

  // Quadrant 3 (front-left): Golden marigolds
  const marigolds = [[22, 50], [26, 52], [20, 52], [24, 54]] as const;
  for (const [mx0, my0] of marigolds) {
    rect(ctx, mx0 - 1, my0 - 1, 3, 2, '#1b5e20');
    px(ctx, mx0, my0 - 1, '#ffb300');
    px(ctx, mx0 + 1, my0 - 2, '#ffeb3b');
  }

  // Quadrant 4 (front-right): Small circular reflection pond with water lilies
  const pondX = 40;
  const pondY = 51;
  isoDiamond(ctx, pondX, pondY, 8, '#cfd8dc', OUT); // stone coping
  isoDiamond(ctx, pondX, pondY, 6, '#4fc3f7', '#0288d1'); // clear water
  // Water lilies & pink lotus bloom
  px(ctx, pondX - 1, pondY, '#81c784');
  px(ctx, pondX, pondY, '#81c784');
  px(ctx, pondX + 1, pondY - 1, '#f48fb1'); // lotus flower
  px(ctx, pondX + 1, pondY - 2, '#ffffff');

  // Carved classical stone garden bench on the left path
  const bx = 22;
  const by = 48;
  rect(ctx, bx - 2, by - 2, 6, 4, OUT);
  rect(ctx, bx - 1, by - 1, 4, 2, '#ffffff');
  rect(ctx, bx - 1, by + 1, 4, 1, '#bdbdbd'); // bench shadow
  rect(ctx, bx - 2, by - 3, 5, 1, '#e0e0e0'); // bench backrest

  return canvas;
}

export function drawGardenAddon(ctx: CanvasRenderingContext2D, level: 2 | 3, _frame: number): void {
  // L2: Classical timber pergola arbor with climbing roses + bronze sundial on stone pedestal
  // Pergola arch over central path
  rect(ctx, 30, 42, 1, 7, OUT);
  rect(ctx, 34, 42, 1, 7, OUT);
  rect(ctx, 29, 41, 7, 2, '#6d4c41');
  // Climbing rose vines on pergola
  px(ctx, 30, 44, '#e91e63');
  px(ctx, 31, 41, '#f06292');
  px(ctx, 33, 41, '#e91e63');

  // Bronze sundial on pedestal in central circle
  rect(ctx, 31, 46, 2, 3, OUT);
  rect(ctx, 31, 46, 1, 2, '#cfd8dc');
  px(ctx, 31, 45, '#ffd54f'); // bronze gnomon

  if (level === 3) {
    // L3: Grand tiered marble fountain with bubbling water jets + classical stone statues along balustrades
    // Tiered marble fountain in center
    isoDiamond(ctx, 32, 48, 6, '#eceff1', OUT);
    isoDiamond(ctx, 32, 48, 4, '#4fc3f7');
    // Tier 2 basin
    rect(ctx, 31, 43, 3, 3, OUT);
    rect(ctx, 31, 43, 2, 2, '#ffffff');
    // Top water plume
    px(ctx, 32, 41, '#81d4fa');
    px(ctx, 32, 40, '#ffffff');
    px(ctx, 31, 41, '#b3e5fc');
    px(ctx, 33, 41, '#b3e5fc');

    // Classical stone statues on pedestals along perimeter corners
    const statues = [[16, 44], [48, 44]] as const;
    for (const [stX, stY] of statues) {
      isoBox(ctx, stX, stY, 3, 3, 4, { top: '#ffffff', left: '#9e9e9e', right: '#cfd8dc' });
      rect(ctx, stX - 1, stY - 8, 3, 5, OUT);
      rect(ctx, stX - 1, stY - 8, 2, 4, '#ffffff');
    }
  }
}

// ============================================================================
// 9. THEATER (Services, height 1.5, color #b0485a)
// Grand hall with curtains/masks sign, arched entrance, waving pennants (2 frames)
// ============================================================================

export function buildTheaterTexture(frame = 0): HTMLCanvasElement {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  // Paved civic theater plaza with red carpet promenade
  isoDiamond(ctx, 32, 48, 28, '#4a4247', OUT);
  isoDiamond(ctx, 32, 48, 24, '#756b72', '#363035');

  // Red carpet promenade runner leading to entrance along right-up axis
  for (let r = 0; r < 14; r++) {
    const rx0 = 36 + r;
    const ry0 = 57 - (r >> 1);
    rect(ctx, rx0 - 2, ry0, 4, 1, '#b71c1c');
    px(ctx, rx0 - 2, ry0, '#ffd54f'); // gold fringe
    px(ctx, rx0 + 2, ry0, '#ffd54f');
  }

  // Grand sandstone theater hall building (fx=31, fy=54, wL=16, wR=18, wallH=19)
  const fx = 31;
  const fy = 54;
  const wL = 16;
  const wR = 18;
  const wallH = 19;

  isoBox(ctx, fx, fy, wL, wR, wallH, {
    top: '#d7ccc8',
    left: '#6d4c41',
    right: '#8d6e63',
  });

  // Classical pilasters along the right facade
  for (const v0 of [1, 6, 12, 16]) {
    rightWallRect(ctx, fx, fy, v0, 0, 1, wallH, '#bcaaa4');
  }
  for (const u0 of [2, 8, 13]) {
    leftWallRect(ctx, fx, fy, u0, 0, 1, wallH, '#4e342e');
  }

  // Grand arched entrance on front-right wall
  rightWallRect(ctx, fx, fy, 4, 1, 8, 9, OUT);
  rightWallRect(ctx, fx, fy, 5, 1, 6, 8, '#212121');

  // Draped rich crimson velvet stage curtains flanking the portal
  // Left curtain drape
  rightWallRect(ctx, fx, fy, 5, 2, 2, 7, '#b71c1c');
  rightWallRect(ctx, fx, fy, 5, 4, 1, 1, '#ffd54f'); // gold tassel tieback
  // Right curtain drape
  rightWallRect(ctx, fx, fy, 9, 2, 2, 7, '#b71c1c');
  rightWallRect(ctx, fx, fy, 10, 4, 1, 1, '#ffd54f');

  // Over the grand entrance: Golden pediment plaque with Comedy and Tragedy masks
  rightWallRect(ctx, fx, fy, 4, 11, 8, 4, OUT);
  rightWallRect(ctx, fx, fy, 5, 12, 6, 2, '#ffd54f');
  // Comedy smile mask
  px(ctx, fx + 6, fy - 12, '#3e2723');
  // Tragedy frown mask
  px(ctx, fx + 9, fy - 14, '#3e2723');

  // Upper arched stained-glass windows on left wall
  leftWallRect(ctx, fx, fy, 3, 5, 4, 6, OUT);
  leftWallRect(ctx, fx, fy, 4, 6, 2, 4, '#ab47bc');
  leftWallRect(ctx, fx, fy, 9, 5, 4, 6, OUT);
  leftWallRect(ctx, fx, fy, 10, 6, 2, 4, '#ec407a');

  // Fly-tower pitched roof in rich crimson-maroon tiles
  isoPitchedRoof(ctx, fx, fy, wL + 2, wR + 2, wallH, 8, {
    leftSlope: '#5a082d',
    rightSlope: '#880e4f',
    gable: '#6d4c41',
    ridge: '#ad1457',
  });

  // Twin rooftop pennant flagpoles with waving banners (2 frames)
  // Pole 1 on front-left roof pinnacle
  const p1X = 23;
  const p1Y = 24;
  drawBannerLocal(ctx, p1X, p1Y - 11, 12, 5, 4, '#b71c1c', '#ffd54f', frame);

  // Pole 2 on back-right roof pinnacle
  const p2X = 38;
  const p2Y = 17;
  drawBannerLocal(ctx, p2X, p2Y - 11, 12, 5, 4, '#b71c1c', '#ffd54f', frame);

  return canvas;
}

export function drawTheaterAddon(ctx: CanvasRenderingContext2D, level: 2 | 3, frame: number): void {
  // L2: Illuminated marquee canopy over entrance + stage fly-tower roof extension
  // Marquee canopy over entrance with glowing golden bulbs
  const mFx = 38;
  const mFy = 50;
  isoBox(ctx, mFx, mFy, 5, 8, 3, { top: '#b71c1c', left: '#4a0820', right: '#780d38' });
  // Glowing marquee perimeter lamps
  for (let b = 0; b < 6; b += 2) {
    px(ctx, mFx + b, mFy - (b >> 1), frame % 2 === 0 ? '#ffd54f' : '#ffffff');
  }

  // Stage fly-tower roof extension box on rear
  isoBox(ctx, 26, 30, 8, 8, 7, { top: '#780d38', left: '#4a0820', right: '#5a082d' });

  if (level === 3) {
    // L3: Classical Corinthian colonnaded portico with pediment statuary + twin grand spires
    // Classical portico columns out front
    const cX1 = 34;
    const cY1 = 57;
    rect(ctx, cX1, cY1 - 10, 2, 10, '#ffffff');
    rect(ctx, cX1 + 6, cY1 - 3 - 10, 2, 10, '#ffffff');
    // Triangular pediment with golden comedy/tragedy statuary
    rect(ctx, cX1 - 2, cY1 - 13, 12, 3, OUT);
    rect(ctx, cX1 - 1, cY1 - 12, 10, 2, '#ffffff');
    disc(ctx, cX1 + 4, cY1 - 14, 2, '#ffd54f'); // golden statuary

    // Twin soaring decorative spires atop roof pinnacles
    drawSpireLocal(ctx, 23, 14, 3, 8, '#5a082d', '#880e4f', '#ffd54f');
    drawSpireLocal(ctx, 38, 7, 3, 8, '#5a082d', '#880e4f', '#ffd54f');
  }
}

// ============================================================================
// 10. OBSERVATORY (Services, height 2.0, color #5a6aa8)
// Domed tower with open slit and telescope, celestial star sign
// ============================================================================

export function buildObservatoryTexture(): HTMLCanvasElement {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  // Astronomical observation terrace with celestial compass rose in pavement
  isoDiamond(ctx, 32, 48, 28, '#2b303c', OUT);
  isoDiamond(ctx, 32, 48, 24, '#454d60', '#1c2029');

  // Inlaid brass compass rose on the terrace floor
  px(ctx, 32, 48, '#ffd54f');
  px(ctx, 32, 46, '#ffe082');
  px(ctx, 32, 50, '#ffe082');
  px(ctx, 30, 48, '#ffe082');
  px(ctx, 34, 48, '#ffe082');

  // Sturdy round/octagonal stone observatory tower
  // Built with stacked circular courses from y=52 up to y=28 (height 24 px)
  const baseY = 52;
  const topY = 28;
  const towerH = baseY - topY;

  for (let dy = 0; dy <= towerH; dy++) {
    const y = baseY - dy;
    // Radius: 9 at base, tapering to 8 at top
    const r = Math.round(9 - (dy * 1) / towerH);
    const span = r * 2;
    const x0 = 32 - r;

    // 1px dark outline
    rect(ctx, x0 - 1, y, span + 2, 1, OUT);
    // Dark left shadow (deep indigo/slate)
    rect(ctx, x0, y, r, 1, '#303f9f');
    // Mid sunlit blue-grey right face
    rect(ctx, 32, y, r, 1, '#5c6bc0');
    // Highlight strip
    px(ctx, 32 + (r >> 1), y, '#7986cb');

    // Foundation course at base
    if (dy <= 3) {
      rect(ctx, x0, y, r, 1, '#1a237e');
      rect(ctx, 32, y, r, 1, '#283593');
    }
  }

  // Arched entrance door on front-right at base
  rect(ctx, 33, 47, 4, 6, OUT);
  rect(ctx, 34, 48, 2, 5, '#1a237e');
  px(ctx, 35, 50, '#ffd54f'); // brass doorknob

  // Celestial 8-pointed star sign medallion mounted above entrance at (32, 36)
  disc(ctx, 32, 36, 3, OUT);
  disc(ctx, 32, 36, 2, '#ffd54f');
  px(ctx, 32, 34, '#ffffff'); // star north point
  px(ctx, 32, 38, '#ffffff'); // south
  px(ctx, 30, 36, '#ffffff'); // west
  px(ctx, 34, 36, '#ffffff'); // east

  // Observation walkway balustrade ring at y=28
  for (let u = -10; u <= 10; u++) {
    const gx = 32 + u;
    const gy = 28 - Math.round(Math.sqrt(Math.max(0, 100 - u * u)) * 0.3);
    px(ctx, gx, gy, '#7986cb');
    px(ctx, gx, gy - 2, '#212121'); // iron railing
  }

  // Hemispherical copper/midnight-blue observation dome atop tower
  // Base at y=26, radius r=8, reaches zenith at y=18
  drawDomeLocal(ctx, 32, 26, 8, '#1a237e', '#283593', '#5c6bc0', false);

  // Open viewing slit in dome (runs vertically from base to zenith)
  rect(ctx, 31, 18, 3, 9, OUT);
  rect(ctx, 32, 19, 1, 8, '#0b1021'); // deep black space inside slit

  // Giant brass astronomical telescope protruding from the dome slit
  // Barrel angled up toward the sky (from (32, 24) to (38, 16))
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
    rect(ctx, tx0, ty0, 2, 1, '#ffd54f');
    px(ctx, tx0, ty0, '#fff9c4'); // brass highlight
  }
  // Objective lens bezel & starry glint at tip
  disc(ctx, 39, 15, 2, OUT);
  disc(ctx, 39, 15, 1, '#81d4fa');
  px(ctx, 39, 15, '#ffffff');

  return canvas;
}

export function drawObservatoryAddon(ctx: CanvasRenderingContext2D, level: 2 | 3, _frame: number): void {
  // L2: Brass armillary sphere instrument on balcony + celestial chart plaque + outdoor tripod
  // Brass armillary sphere on balcony
  const aX = 24;
  const aY = 28;
  disc(ctx, aX, aY, 3, OUT);
  disc(ctx, aX, aY, 2, '#ffd54f');
  px(ctx, aX, aY, '#ffb300'); // celestial globe axis

  // Celestial star chart plaque on lower wall
  rect(ctx, 39, 44, 4, 4, OUT);
  rect(ctx, 40, 45, 2, 2, '#e0f7fa');
  px(ctx, 40, 45, '#ffd54f'); // star dot

  if (level === 3) {
    // L3: Ancillary rotating star-spectrograph turret + astronomical aerial antenna spire
    // Ancillary domed turret on right flank
    const tX = 42;
    const tY = 36;
    isoBox(ctx, tX, tY, 5, 5, 8, { top: '#283593', left: '#1a237e', right: '#3949ab' });
    drawDomeLocal(ctx, tX - 2, tY - 8, 4, '#1a237e', '#283593', '#7986cb', true);

    // Astronomical aerial lightning rod / antenna spire atop central dome
    rect(ctx, 32, 8, 1, 10, OUT);
    rect(ctx, 32, 8, 1, 9, '#ffd54f');
    px(ctx, 32, 7, '#ffffff'); // glowing stellar crystal at tip
    // Cross antenna bars
    rect(ctx, 30, 11, 5, 1, '#ffd54f');
    rect(ctx, 31, 14, 3, 1, '#ffd54f');
  }
}

// ============================================================================
// 11. HOSPITAL (Services, height 1.6, color #f0ece0)
// Big pale multi-wing building with healing cross, many windows, ambulance cart
// ============================================================================

export function buildHospitalTexture(): HTMLCanvasElement {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  // Sanitarium lawn courtyard with paved stone apron
  isoDiamond(ctx, 32, 48, 28, '#3d6945', OUT);
  isoDiamond(ctx, 32, 48, 25, '#7d786d', OUT);
  isoDiamond(ctx, 32, 50, 20, '#cfc9be', '#545048');

  // Pale multi-wing sanitarium building
  // Central main block (fx=32, fy=52, wL=16, wR=18, wallH=17)
  const fx = 32;
  const fy = 52;
  const wL = 16;
  const wR = 18;
  const wallH = 17;

  // Pale whitewashed stone / limestone facade
  isoBox(ctx, fx, fy, wL, wR, wallH, {
    top: '#f5f5f0',
    left: '#9e9e96',
    right: '#d4d4cb',
  });

  // Projecting forward left wing (fx=23, fy=55, wL=8, wR=7, wallH=15)
  const lFx = 23;
  const lFy = 55;
  isoBox(ctx, lFx, lFy, 8, 7, 15, {
    top: '#f5f5f0',
    left: '#8f8f87',
    right: '#c7c7be',
  });
  isoPitchedRoof(ctx, lFx, lFy, 9, 8, 15, 5, {
    leftSlope: '#455a64',
    rightSlope: '#607d8b',
    gable: '#c7c7be',
    ridge: '#78909c',
  });

  // Projecting forward right wing (fx=41, fy=51, wL=7, wR=8, wallH=15)
  const rFx = 41;
  const rFy = 51;
  isoBox(ctx, rFx, rFy, 7, 8, 15, {
    top: '#f5f5f0',
    left: '#9e9e96',
    right: '#d4d4cb',
  });
  isoPitchedRoof(ctx, rFx, rFy, 8, 9, 15, 5, {
    leftSlope: '#455a64',
    rightSlope: '#607d8b',
    gable: '#d4d4cb',
    ridge: '#78909c',
  });

  // Main central pitched sage-slate roof
  isoPitchedRoof(ctx, fx, fy, wL + 2, wR + 2, wallH, 7, {
    leftSlope: '#37474f',
    rightSlope: '#546e7a',
    gable: '#d4d4cb',
    ridge: '#78909c',
  });

  // Orderly rows of clean glass windows on two storeys
  // Main right wall windows
  const winR = [
    [2, 4], [6, 4], [10, 4],
    [2, 10], [6, 10], [10, 10],
  ] as const;
  for (const [v0, z0] of winR) {
    rightWallRect(ctx, fx, fy, v0, z0, 3, 4, OUT);
    rightWallRect(ctx, fx, fy, v0 + 1, z0 + 1, 2, 2, '#b3e5fc');
    px(ctx, fx + v0 + 1, fy - z0 - 1, '#ffffff'); // window glint
  }

  // Left wing windows
  const winL = [
    [2, 3], [5, 3],
    [2, 8], [5, 8],
  ] as const;
  for (const [u0, z0] of winL) {
    leftWallRect(ctx, lFx, lFy, u0, z0, 3, 4, OUT);
    leftWallRect(ctx, lFx, lFy, u0 + 1, z0 + 1, 2, 2, '#81d4fa');
  }

  // Hospital entrance door in central recess
  rightWallRect(ctx, fx, fy, 1, 1, 4, 7, OUT);
  rightWallRect(ctx, fx, fy, 2, 1, 2, 6, '#3e2723');

  // Prominent bold red healing cross emblem on central front pediment
  const crossX = 32;
  const crossY = 27;
  disc(ctx, crossX, crossY, 4, OUT);
  disc(ctx, crossX, crossY, 3, '#ffffff');
  // Red cross bars
  rect(ctx, crossX, crossY - 2, 1, 5, '#d32f2f');
  rect(ctx, crossX - 2, crossY, 5, 1, '#d32f2f');

  // Ambulance medical cart in front courtyard
  const cX = 35;
  const cY = 57;
  // Wooden wagon cart
  isoBox(ctx, cX, cY, 4, 6, 4, {
    top: '#ffffff',
    left: '#6d4c41',
    right: '#8d6e63',
  });
  // Canvas canopy & red cross
  px(ctx, cX + 2, cY - 3, '#d32f2f');
  // Spoked wagon wheels
  disc(ctx, cX - 2, cY + 1, 2, OUT);
  disc(ctx, cX - 2, cY + 1, 1, '#3e2723');
  disc(ctx, cX + 4, cY - 1, 2, OUT);
  disc(ctx, cX + 4, cY - 1, 1, '#3e2723');

  return canvas;
}

export function drawHospitalAddon(ctx: CanvasRenderingContext2D, level: 2 | 3, _frame: number): void {
  // L2: Glazed apothecary greenhouse wing on left + medicinal herb garden
  const gFx = 15;
  const gFy = 52;
  isoBox(ctx, gFx, gFy, 6, 6, 7, { top: '#e0f7fa', left: '#80deea', right: '#b2ebf2' });
  // Glass greenhouse panes
  for (const z of [2, 4]) {
    leftWallRect(ctx, gFx, gFy, 1, z, 4, 1, '#ffffff');
  }
  // Medicinal herb planter beds
  rect(ctx, 16, 56, 6, 2, OUT);
  rect(ctx, 16, 56, 5, 1, '#66bb6a');
  px(ctx, 18, 55, '#ab47bc'); // medicinal herbs

  if (level === 3) {
    // L3: Upper convalescent terrace ward + clock bell tower with red cross + shaded awnings
    // Upper convalescent ward floor
    const uFx = 32;
    const uFy = 35;
    isoBox(ctx, uFx, uFy, 12, 14, 7, { top: '#f5f5f0', left: '#8f8f87', right: '#c7c7be' });
    isoPitchedRoof(ctx, uFx, uFy, 13, 15, 7, 5, {
      leftSlope: '#37474f',
      rightSlope: '#546e7a',
      gable: '#c7c7be',
      ridge: '#ffd54f',
    });

    // Central hospital bell / clock tower
    const tFx = 32;
    const tFy = 23;
    isoBox(ctx, tFx, tFy, 6, 6, 9, { top: '#ffffff', left: '#9e9e96', right: '#cfcfc8' });
    drawSpireLocal(ctx, tFx - 1, tFy - 9, 4, 7, '#37474f', '#546e7a', '#d32f2f');
    // Tower red cross emblem
    rect(ctx, 31, 17, 1, 5, '#d32f2f');
    rect(ctx, 29, 19, 5, 1, '#d32f2f');
  }
}

// ============================================================================
// 12. UNIVERSITY (Services, height 2.2, color #8a6ac8)
// Grand collegiate quad with towers, spire and dome, heraldic banners
// ============================================================================

export function buildUniversityTexture(): HTMLCanvasElement {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  // Grand collegiate quadrangle footprint: central quad lawn with surrounding cloister walkway
  isoDiamond(ctx, 32, 48, 28, '#2e7d32', OUT);
  isoDiamond(ctx, 32, 48, 25, '#757575', OUT);
  isoDiamond(ctx, 32, 48, 20, '#388e3c', '#424242'); // inner grassy quadrangle

  // Central scholar's monument / open book pedestal in lawn
  rect(ctx, 31, 47, 3, 3, OUT);
  rect(ctx, 31, 47, 2, 2, '#cfd8dc');
  px(ctx, 31, 46, '#ffd54f'); // golden open book

  // Left Wing: Great Hall & Chancellor's Tower (fx=23, fy=53, wL=12, wR=10, wallH=18)
  const lFx = 23;
  const lFy = 53;
  const lW = 12;
  const lR = 10;
  const lH = 18;

  isoBox(ctx, lFx, lFy, lW, lR, lH, {
    top: '#b39ddb',
    left: '#4527a0',
    right: '#5e35b1',
  });

  // Tall Gothic traceried leaded windows on Great Hall
  const gWin = [[2, 4], [6, 4], [2, 11], [6, 11]] as const;
  for (const [v0, z0] of gWin) {
    rightWallRect(ctx, lFx, lFy, v0, z0, 3, 5, OUT);
    rightWallRect(ctx, lFx, lFy, v0 + 1, z0 + 1, 2, 3, '#81d4fa');
    px(ctx, lFx + v0 + 1, lFy - z0 - 2, '#ffffff');
  }

  // Great Hall steep pitched purple-slate roof
  isoPitchedRoof(ctx, lFx, lFy, lW + 2, lR + 2, lH, 7, {
    leftSlope: '#311b92',
    rightSlope: '#512da8',
    gable: '#5e35b1',
    ridge: '#7e57c2',
  });

  // Left Corner Chancellor's Turret & Spire
  const t1X = 16;
  const t1Y = 37;
  isoBox(ctx, t1X, t1Y, 5, 5, 14, { top: '#b39ddb', left: '#311b92', right: '#512da8' });
  drawSpireLocal(ctx, t1X - 1, t1Y - 14, 4, 8, '#311b92', '#512da8', '#ffd54f');

  // Right Wing: Academic Library & Cloister Gallery (fx=43, fy=49, wL=10, wR=14, wallH=16)
  const rFx = 43;
  const rFy = 49;
  const rW = 10;
  const rR = 14;
  const rH = 16;

  isoBox(ctx, rFx, rFy, rW, rR, rH, {
    top: '#b39ddb',
    left: '#512da8',
    right: '#673ab7',
  });

  // Cloister arched gallery openings facing courtyard
  for (const u0 of [1, 4, 7]) {
    leftWallRect(ctx, rFx, rFy, u0, 1, 2, 6, OUT);
    leftWallRect(ctx, rFx, rFy, u0, 2, 2, 4, '#311b92');
  }
  // Library windows on right outer wall
  for (const v0 of [2, 6, 10]) {
    rightWallRect(ctx, rFx, rFy, v0, 5, 3, 5, OUT);
    rightWallRect(ctx, rFx, rFy, v0 + 1, 6, 2, 3, '#b39ddb');
  }

  isoPitchedRoof(ctx, rFx, rFy, rW + 2, rR + 2, rH, 7, {
    leftSlope: '#311b92',
    rightSlope: '#512da8',
    gable: '#673ab7',
    ridge: '#7e57c2',
  });

  // Central Gothic Quad Portal Gallery connecting the wings
  const cFx = 31;
  const cFy = 41;
  isoBox(ctx, cFx, cFy, 8, 8, 12, { top: '#b39ddb', left: '#4527a0', right: '#5e35b1' });

  // Central Academic Library Dome (rotunda dome behind quad)
  drawDomeLocal(ctx, 32, 25, 7, '#311b92', '#512da8', '#ab47bc', true);

  // Soaring Central Spire rising high from clocktower
  drawSpireLocal(ctx, 32, 16, 4, 11, '#311b92', '#512da8', '#ffd54f');

  // University Heraldic Banners hanging from gallery facade
  drawBannerLocal(ctx, 22, 36, 9, 4, 5, '#4a148c', '#ffd54f', 0);
  drawBannerLocal(ctx, 39, 31, 9, 4, 5, '#4a148c', '#ffd54f', 0);

  return canvas;
}

export function drawUniversityAddon(ctx: CanvasRenderingContext2D, level: 2 | 3, _frame: number): void {
  // L2: Gothic stone cloisters arcade + stained glass rose window on Great Hall + tiered scholar's fountain
  // Stained glass rose window on Great Hall gable
  disc(ctx, 23, 31, 4, OUT);
  disc(ctx, 23, 31, 3, '#ffd54f'); // gold tracery
  px(ctx, 23, 31, '#ab47bc'); // purple center
  px(ctx, 23, 29, '#e91e63'); // rose petal
  px(ctx, 23, 33, '#29b6f6');
  px(ctx, 21, 31, '#4caf50');
  px(ctx, 25, 31, '#ff9800');

  // Tiered marble scholar's fountain in center of quad lawn
  isoDiamond(ctx, 32, 48, 5, '#eceff1', OUT);
  isoDiamond(ctx, 32, 48, 3, '#81d4fa');
  px(ctx, 32, 45, '#ffffff'); // jet

  if (level === 3) {
    // L3: Soaring central Gothic cathedral campanile clock tower with bells + second observatory dome wing + golden banners
    // Central Gothic campanile rising higher
    const tFx = 32;
    const tFy = 16;
    isoBox(ctx, tFx, tFy, 6, 6, 8, { top: '#b39ddb', left: '#311b92', right: '#512da8' });
    // Campanile clock face
    disc(ctx, 32, 10, 3, OUT);
    disc(ctx, 32, 10, 2, '#fffbee');
    px(ctx, 32, 10, '#1b1b1b');
    px(ctx, 33, 10, '#ffd54f'); // gold rim
    // Ultra high pinnacle spire
    drawSpireLocal(ctx, 32, 6, 3, 6, '#311b92', '#512da8', '#ffd54f');

    // Secondary astronomical observatory copper dome on right library wing
    drawDomeLocal(ctx, 45, 29, 5, '#1a237e', '#283593', '#7986cb', true);

    // Golden university gonfalons on courtyard pillars
    drawBannerLocal(ctx, 18, 48, 8, 3, 4, '#ffd54f', '#4a148c', 0);
    drawBannerLocal(ctx, 46, 42, 8, 3, 4, '#ffd54f', '#4a148c', 0);
  }
}

// ============================================================================
// Maps export
// ============================================================================

/** Third-wave shared art (task file .agy/tasks/t26). Each entry returns the animation frames (64x64 canvases). */
export const art3b: Partial<Record<BuildingKind, () => HTMLCanvasElement[]>> = {
  fishery: () => [buildFisheryTexture(0), buildFisheryTexture(1)],
  windmill: () => [buildWindmillTexture(0), buildWindmillTexture(1), buildWindmillTexture(2)],
  sawmill: () => [buildSawmillTexture(0), buildSawmillTexture(1)],
  smelter: () => [buildSmelterTexture(0), buildSmelterTexture(1), buildSmelterTexture(2)],
  crafthall: () => [buildCrafthallTexture()],
  foundry: () => [buildFoundryTexture(0), buildFoundryTexture(1), buildFoundryTexture(2)],
  shrine: () => [buildShrineTexture()],
  garden: () => [buildGardenTexture()],
  theater: () => [buildTheaterTexture(0), buildTheaterTexture(1)],
  observatory: () => [buildObservatoryTexture()],
  hospital: () => [buildHospitalTexture()],
  university: () => [buildUniversityTexture()],
};

/** Level 2 / level 3 add-ons for this file's kinds, drawn on a blank 64x64 canvas over the level 1 sprite. */
export const addons3b: Partial<Record<BuildingKind, (ctx: CanvasRenderingContext2D, level: 2 | 3, frame: number) => void>> = {
  fishery: drawFisheryAddon,
  windmill: drawWindmillAddon,
  sawmill: drawSawmillAddon,
  smelter: drawSmelterAddon,
  crafthall: drawCrafthallAddon,
  foundry: drawFoundryAddon,
  shrine: drawShrineAddon,
  garden: drawGardenAddon,
  theater: drawTheaterAddon,
  observatory: drawObservatoryAddon,
  hospital: drawHospitalAddon,
  university: drawUniversityAddon,
};
