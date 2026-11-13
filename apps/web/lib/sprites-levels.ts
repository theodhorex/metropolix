import { addons3a } from './sprites-wave3a';
import { addons3b } from './sprites-wave3b';
import { addons3c } from './sprites-wave3c';
import { canUpgrade, type BuildingKind } from '@metropolix/sim';
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

/** Draw a ribbed pixel-art dome with 1px dark outline, top-left highlight, and optional gold meridian rib. */
function drawDome(
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

/** Draw a pointed spire roof with 1px dark outline, top-left lighting, and golden finial. */
function drawSpire(
  ctx: CanvasRenderingContext2D,
  cx: number,
  baseY: number,
  halfBase: number,
  height: number,
  leftCol: string,
  rightCol: string,
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
  rect(ctx, cx, topY, 1, 3, '#ffd54f');
  px(ctx, cx, topY, '#fff8e1');
}

/** Draw a waving war/guild banner on a vertical pole. */
function drawBanner(
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
// 1. RESIDENTIAL: house, rowhouse, manor
// L2: extra storey or side wing
// L3: taller roof with a tower/turret and chimney
// ============================================================================

function drawHouseAddon(ctx: CanvasRenderingContext2D, level: 2 | 3): void {
  // L2: Side wing extension on the front-left + roof dormer window
  const wFx = 22;
  const wFy = 54;
  isoBox(ctx, wFx, wFy, 7, 8, 2, { top: '#8c877c', left: '#54514a', right: '#6e6a61' });
  isoBox(ctx, wFx, wFy - 2, 7, 8, 7, { top: '#f0c999', left: '#b07d4f', right: '#d9a066' });
  leftWallRect(ctx, wFx, wFy, 2, 3, 3, 4, OUT);
  leftWallRect(ctx, wFx, wFy, 3, 4, 1, 2, '#9be7ff');
  rightWallRect(ctx, wFx, wFy, 2, 3, 4, 4, OUT);
  rightWallRect(ctx, wFx, wFy, 3, 4, 2, 2, '#9be7ff');
  isoPitchedRoof(ctx, wFx, wFy, 9, 9, 9, 5, {
    leftSlope: '#8f322a',
    rightSlope: '#c2473b',
    gable: '#9e6e44',
    ridge: '#e06758',
  });

  if (level === 2) {
    // Cozy roof dormer on the main cottage slope
    isoBox(ctx, 35, 39, 4, 5, 5, { top: '#f0c999', left: '#b07d4f', right: '#d9a066' });
    rightWallRect(ctx, 35, 39, 1, 1, 3, 3, OUT);
    rightWallRect(ctx, 35, 39, 2, 2, 1, 2, '#ffe082');
    isoPitchedRoof(ctx, 35, 39, 6, 6, 5, 3, {
      leftSlope: '#8f322a',
      rightSlope: '#c2473b',
      gable: '#9e6e44',
      ridge: '#ffd54f',
    });
    return;
  }

  // L3: Second storey & steeper roof + corner watch-turret with spire + tall brick chimney
  const uFx = 32;
  const uFy = 42;
  isoBox(ctx, uFx, uFy, 14, 16, 7, { top: '#f5d6ad', left: '#a87042', right: '#d99a60' });
  for (const v0 of [3, 10]) {
    rightWallRect(ctx, uFx, uFy, v0, 2, 4, 4, OUT);
    rightWallRect(ctx, uFx, uFy, v0 + 1, 3, 2, 2, '#ffe082');
  }
  leftWallRect(ctx, uFx, uFy, 4, 2, 5, 4, OUT);
  leftWallRect(ctx, uFx, uFy, 5, 3, 3, 2, '#9be7ff');
  isoPitchedRoof(ctx, uFx, uFy, 16, 18, 7, 8, {
    leftSlope: '#7a2b24',
    rightSlope: '#c2473b',
    gable: '#9e6e44',
    ridge: '#ffd54f',
  });

  // Tall corner turret on back-left with pointed spire
  const tFx = 25;
  const tFy = 36;
  isoBox(ctx, tFx, tFy, 6, 6, 12, { top: '#f5d6ad', left: '#8a5a36', right: '#c98a52' });
  rightWallRect(ctx, tFx, tFy, 2, 6, 2, 4, OUT);
  rightWallRect(ctx, tFx, tFy, 2, 7, 1, 2, '#ffe082');
  drawSpire(ctx, tFx, tFy - 14, 4, 8, '#691e22', '#ad3d32');

  // Tall twin-pot brick chimney on right roof slope
  isoBox(ctx, 39, 28, 4, 4, 9, { top: '#a84a42', left: '#632622', right: '#873630' });
  isoBox(ctx, 39, 19, 5, 5, 2, { top: '#ede3cc', left: '#8c877c', right: '#cfc6b8' });
}

function drawRowhouseAddon(ctx: CanvasRenderingContext2D, level: 2 | 3): void {
  // L2: Extra mansard attic storey stepping across all 3 terrace units + front bay wing
  const fx = 30;
  const fy = 43;
  const wL = 14;
  const unitR = 8;
  for (let i = 2; i >= 0; i--) {
    const uFx = fx + i * unitR;
    const uFy = fy - ((i * unitR) >> 1);
    isoBox(ctx, uFx, uFy, wL, unitR, 6, {
      top: '#f5d6ad',
      left: '#9e6238',
      right: '#d99a60',
    });
    rightWallRect(ctx, uFx, uFy, 2, 1, 4, 4, OUT);
    rightWallRect(ctx, uFx, uFy, 3, 2, 2, 2, '#ffe082');
    isoPitchedRoof(ctx, uFx, uFy, wL + 2, unitR + 1, 6, 6, {
      leftSlope: '#7a2b24',
      rightSlope: '#c2473b',
      gable: '#9e6e44',
      ridge: level === 3 ? '#ffd54f' : '#e06758',
    });
  }
  // Projecting front bay window wing on unit 0
  isoBox(ctx, 33, 57, 4, 5, 11, { top: '#f0c999', left: '#8a5a36', right: '#c98a52' });
  rightWallRect(ctx, 33, 57, 1, 2, 3, 3, '#9be7ff');
  rightWallRect(ctx, 33, 57, 1, 7, 3, 3, '#ffe082');

  if (level === 3) {
    // L3: Corner clock/bell turret rising above the middle terrace + tall twin chimneys
    const tFx = 36;
    const tFy = 32;
    isoBox(ctx, tFx, tFy, 6, 6, 12, { top: '#f5d6ad', left: '#8a4b32', right: '#b06a4a' });
    rightWallRect(ctx, tFx, tFy, 1, 6, 4, 4, OUT);
    rightWallRect(ctx, tFx, tFy, 2, 7, 2, 2, '#ffd54f');
    leftWallRect(ctx, tFx, tFy, 1, 6, 4, 4, OUT);
    leftWallRect(ctx, tFx, tFy, 2, 7, 2, 2, '#9be7ff');
    drawSpire(ctx, tFx, tFy - 14, 4, 8, '#455587', '#687db8');

    // Tall brick chimneys on the outer units
    isoBox(ctx, 27, 29, 3, 3, 7, { top: '#a84a42', left: '#632622', right: '#873630' });
    isoBox(ctx, 43, 21, 3, 3, 7, { top: '#a84a42', left: '#632622', right: '#873630' });
  }
}

function drawManorAddon(ctx: CanvasRenderingContext2D, level: 2 | 3): void {
  // L2: Sun-lit side conservatory wing on the right flank + left wing annex
  const rFx = 43;
  const rFy = 52;
  isoBox(ctx, rFx, rFy, 7, 8, 10, { top: '#f2dcc2', left: '#8a4b32', right: '#b06a4a' });
  rightWallRect(ctx, rFx, rFy, 1, 2, 6, 6, OUT);
  rightWallRect(ctx, rFx, rFy, 2, 3, 4, 4, '#a8ecff');
  isoPitchedRoof(ctx, rFx, rFy, 9, 9, 10, 5, {
    leftSlope: '#691e22',
    rightSlope: '#962d32',
    gable: '#cfc6b8',
    ridge: '#ffd54f',
  });

  const lFx = 20;
  const lFy = 50;
  isoBox(ctx, lFx, lFy, 7, 7, 9, { top: '#f2dcc2', left: '#7d432c', right: '#a85f40' });
  leftWallRect(ctx, lFx, lFy, 2, 3, 3, 4, OUT);
  leftWallRect(ctx, lFx, lFy, 3, 4, 1, 2, '#ffe082');
  isoPitchedRoof(ctx, lFx, lFy, 8, 8, 9, 4, {
    leftSlope: '#691e22',
    rightSlope: '#962d32',
    gable: '#7a422c',
    ridge: '#ffd54f',
  });

  if (level === 3) {
    // L3: Sovereign central/right keep turret with soaring spire + grand twin chimney stack
    const kFx = 34;
    const kFy = 35;
    isoBox(ctx, kFx, kFy, 8, 8, 14, { top: '#f2dcc2', left: '#7d432c', right: '#b06a4a' });
    leftWallRect(ctx, kFx, kFy, 1, 11, 6, 2, '#c9bda6');
    rightWallRect(ctx, kFx, kFy, 1, 11, 6, 2, '#ede3cc');
    rightWallRect(ctx, kFx, kFy, 2, 4, 4, 6, OUT);
    rightWallRect(ctx, kFx, kFy, 3, 5, 2, 4, '#ffe082');
    leftWallRect(ctx, kFx, kFy, 2, 4, 4, 6, OUT);
    leftWallRect(ctx, kFx, kFy, 3, 5, 2, 4, '#9be7ff');
    drawSpire(ctx, kFx, kFy - 17, 5, 10, '#5e191d', '#962d32');

    // Ornate tall twin chimney on the right slope
    isoBox(ctx, 41, 28, 4, 4, 9, { top: '#8c3b32', left: '#54211b', right: '#732f27' });
    isoBox(ctx, 41, 19, 5, 5, 2, { top: '#ffd54f', left: '#b58d28', right: '#e6b83c' });
  }
}

// ============================================================================
// 2. COMMERCE: shop, stall, tavern, bank
// L2: awning + crates/sign
// L3: second floor or domed/columned front with a gold sign
// ============================================================================

function drawShopAddon(ctx: CanvasRenderingContext2D, level: 2 | 3): void {
  // L2: Extended side market awning + stacked cargo crates + projecting merchant sign
  for (let u = 2; u < 16; u++) {
    const stripe = ((u >> 1) & 1) === 0;
    const col = stripe ? '#e53935' : '#fff8eb';
    const x = 31 - u;
    const yWall = 46 - (u >> 1);
    rect(ctx, x - 2, yWall - 2, 3, 3, col);
    px(ctx, x - 2, yWall + 1, OUT);
    px(ctx, x, yWall - 3, OUT);
  }
  // Stacked cargo crates on left and right sidewalk
  isoBox(ctx, 21, 55, 5, 5, 4, { top: '#e0b06c', left: '#6e4220', right: '#9c6032' });
  isoBox(ctx, 20, 51, 3, 3, 3, { top: '#ffe082', left: '#b28924', right: '#f5be36' });
  isoBox(ctx, 45, 52, 5, 5, 4, { top: '#d9a066', left: '#6e4220', right: '#a87042' });

  // Projecting iron bracket + hanging trade sign on right corner
  rect(ctx, 44, 36, 6, 1, OUT);
  rect(ctx, 45, 37, 4, 5, OUT);
  rect(ctx, 46, 38, 2, 3, '#ffd54f');

  if (level === 3) {
    // L3: Full second floor arcade + golden dome + grand gold rooftop sign
    const uFx = 32;
    const uFy = 39;
    isoBox(ctx, uFx, uFy, 16, 18, 10, { top: '#78d2fa', left: '#2b7ba1', right: '#43a0cc' });
    isoBox(ctx, uFx, uFy - 8, 16, 18, 2, { top: '#ffe082', left: '#b58d28', right: '#e6b83c' });
    for (const v0 of [2, 8, 13]) {
      rightWallRect(ctx, uFx, uFy, v0, 2, 4, 5, OUT);
      rightWallRect(ctx, uFx, uFy, v0 + 1, 3, 2, 3, '#ffe082');
    }
    for (const u0 of [3, 10]) {
      leftWallRect(ctx, uFx, uFy, u0, 2, 4, 5, OUT);
      leftWallRect(ctx, uFx, uFy, u0 + 1, 3, 2, 3, '#a8ecff');
    }
    // Golden-copper merchant dome atop the second floor
    drawDome(ctx, 32, 22, 6, '#b58d28', '#ffd54f', '#fff8e1', true);
    rect(ctx, 31, 13, 3, 3, OUT);
    px(ctx, 32, 13, '#ffd54f');

    // Grand gold sign across the upper front parapet
    isoBox(ctx, 35, 30, 3, 10, 5, { top: '#fff8e1', left: '#b28924', right: '#ffd54f' });
    rightWallRect(ctx, 35, 30, 2, 1, 6, 3, '#b45309');
    rightWallRect(ctx, 35, 30, 3, 2, 4, 1, '#fff8e1');
  }
}

function drawStallAddon(ctx: CanvasRenderingContext2D, level: 2 | 3): void {
  // L2: Side awning wing + stacked crates/barrels + tall merchant signpost
  isoBox(ctx, 21, 53, 6, 7, 5, { top: '#e0b06c', left: '#6e4220', right: '#9c6032' });
  // Striped side awning over the left counter wing
  for (let u = 0; u < 7; u++) {
    for (let v = 0; v < 8; v++) {
      const x = 21 - u + v;
      const y = 41 - ((u + v) >> 1);
      const isEdge = u === 0 || u === 6 || v === 0 || v === 7;
      const col = isEdge ? OUT : ((u + v) & 1) === 0 ? '#e53935' : '#ffe082';
      px(ctx, x, y, col);
    }
  }
  // Stacked supply crates on right and foreground
  isoBox(ctx, 44, 52, 5, 5, 4, { top: '#d9a066', left: '#6e4220', right: '#a87042' });
  isoBox(ctx, 43, 48, 4, 4, 3, { top: '#ffe082', left: '#b28924', right: '#f5be36' });

  // Tall wooden signpost with hanging trade board
  rect(ctx, 47, 30, 2, 18, OUT);
  rect(ctx, 47, 31, 1, 16, '#8d5a2b');
  rect(ctx, 42, 31, 7, 5, OUT);
  rect(ctx, 43, 32, 5, 3, '#ffd54f');
  px(ctx, 45, 33, '#b45309');

  if (level === 3) {
    // L3: Second-floor covered bazaar pavilion + golden dome + big gold guild sign
    const uFx = 31;
    const uFy = 41;
    isoBox(ctx, uFx, uFy, 12, 14, 9, { top: '#f5ebd6', left: '#9e6238', right: '#d9a066' });
    isoBox(ctx, uFx, uFy - 7, 12, 14, 2, { top: '#ffe082', left: '#b58d28', right: '#e6b83c' });
    for (const v0 of [2, 8]) {
      rightWallRect(ctx, uFx, uFy, v0, 2, 4, 5, OUT);
      rightWallRect(ctx, uFx, uFy, v0 + 1, 3, 2, 3, '#ffe082');
    }
    drawDome(ctx, 31, 25, 6, '#b58d28', '#ffd54f', '#fff8e1', true);
    rect(ctx, 30, 16, 3, 3, OUT);
    px(ctx, 31, 16, '#fff8e1');

    // Prominent gold sign on front-right eave
    rect(ctx, 32, 31, 10, 5, OUT);
    rect(ctx, 33, 32, 8, 3, '#ffd54f');
    rect(ctx, 35, 33, 4, 1, '#fff8e1');
  }
}

function drawTavernAddon(ctx: CanvasRenderingContext2D, level: 2 | 3, frame: number): void {
  // L2: Side beer-garden awning + stacked ale barrels/crates + larger hanging sign
  const pFx = 21;
  const pFy = 54;
  isoBox(ctx, pFx, pFy, 7, 8, 4, { top: '#c98a52', left: '#5c3822', right: '#825030' });
  // Striped crimson-and-gold beer garden awning overhead
  for (let u = 0; u < 8; u++) {
    for (let v = 0; v < 9; v++) {
      const x = pFx - u + v;
      const y = 43 - ((u + v) >> 1);
      const edge = u === 0 || u === 7 || v === 0 || v === 8;
      const col = edge ? OUT : (v & 1) === 0 ? '#d94b3d' : '#ffd54f';
      px(ctx, x, y, col);
    }
  }
  // Stacked oak ale casks & crates on the right
  isoBox(ctx, 45, 53, 4, 4, 5, { top: '#c98a52', left: '#5c3822', right: '#9c6032' });
  isoBox(ctx, 44, 48, 3, 3, 4, { top: '#e0b06c', left: '#6e4220', right: '#a87042' });

  // Ornate projecting golden tavern sign banner on right wall
  const swing = frame % 2;
  rect(ctx, 41, 35, 7, 2, OUT);
  rect(ctx, 42 + swing, 37, 5, 6, OUT);
  rect(ctx, 43 + swing, 38, 3, 4, '#ffd54f');
  px(ctx, 44 + swing, 38, '#fff8e1');

  if (level === 3) {
    // L3: Third-storey grand inn gable tower + golden tankard-and-crown sign
    const tFx = 33;
    const tFy = 35;
    isoBox(ctx, tFx, tFy, 12, 14, 9, { top: '#f2dec4', left: '#ba9d79', right: '#e6ccb0' });
    leftWallRect(ctx, tFx, tFy, 0, 0, 12, 1, '#4a2816');
    rightWallRect(ctx, tFx, tFy, 0, 0, 14, 1, '#5c3822');
    const glow = frame % 2 === 0 ? '#ffc107' : '#ffe082';
    for (const v0 of [2, 8]) {
      rightWallRect(ctx, tFx, tFy, v0, 2, 4, 5, OUT);
      rightWallRect(ctx, tFx, tFy, v0 + 1, 3, 2, 3, glow);
    }
    leftWallRect(ctx, tFx, tFy, 4, 2, 4, 5, OUT);
    leftWallRect(ctx, tFx, tFy, 5, 3, 2, 3, glow);
    isoPitchedRoof(ctx, tFx, tFy, 14, 16, 9, 7, {
      leftSlope: '#5e2c1c',
      rightSlope: '#8f442b',
      gable: '#a8643a',
      ridge: '#ffd54f',
    });

    // Grand golden sign emblem mounted on the upper front gable
    rect(ctx, 31, 22, 9, 6, OUT);
    rect(ctx, 32, 23, 7, 4, '#ffd54f');
    rect(ctx, 33, 24, 5, 2, '#b45309');
    rect(ctx, 34, 23, 3, 2, '#fff8e1');
  }
}

function drawBankAddon(ctx: CanvasRenderingContext2D, level: 2 | 3): void {
  // L2: Crimson-and-gold portico awning + armored gold bullion crates + hanging scale sign
  for (let v = 4; v < 16; v++) {
    const x = 32 + v;
    const y = 42 - (v >> 1);
    const col = (v & 1) === 0 ? '#ffd54f' : '#b71c1c';
    rect(ctx, x, y - 3, 2, 3, col);
    px(ctx, x, y - 4, OUT);
    px(ctx, x + 1, y, OUT);
  }
  // Armored bullion chests flanking the podium steps
  isoBox(ctx, 21, 55, 5, 5, 4, { top: '#ffd54f', left: '#8f6f1d', right: '#d99a26' });
  isoBox(ctx, 45, 52, 5, 5, 4, { top: '#ffd54f', left: '#8f6f1d', right: '#d99a26' });

  // Projecting golden sign bracket on front corner
  rect(ctx, 25, 36, 6, 5, OUT);
  rect(ctx, 26, 37, 4, 3, '#ffd54f');
  px(ctx, 27, 38, '#fff8e1');

  if (level === 3) {
    // L3: Columned upper treasury rotunda + gleaming golden dome + monumental gold sign
    const uFx = 32;
    const uFy = 34;
    isoBox(ctx, uFx, uFy, 14, 16, 8, { top: '#f2ead8', left: '#9e9278', right: '#cfc2a6' });
    isoBox(ctx, uFx, uFy - 6, 14, 16, 2, { top: '#ffe082', left: '#b58d28', right: '#e6b83c' });
    for (const vCol of [2, 6, 10, 14]) {
      const cx = uFx + vCol;
      const cy = uFy - (vCol >> 1);
      rect(ctx, cx, cy - 6, 2, 6, '#fff9eb');
      px(ctx, cx, cy - 6, '#ffd54f');
    }
    // Radiant golden treasury dome
    drawDome(ctx, 31, 19, 8, '#b58d28', '#ffd54f', '#fff8e1', true);
    rect(ctx, 30, 8, 3, 4, OUT);
    rect(ctx, 31, 8, 1, 4, '#ffd54f');
    px(ctx, 31, 7, '#ffffff');

    // Monumental gold coin & pediment sign on the upper front
    rect(ctx, 32, 23, 11, 6, OUT);
    rect(ctx, 33, 24, 9, 4, '#ffd54f');
    disc(ctx, 37, 26, 3, '#fff8e1');
    disc(ctx, 37, 26, 2, '#f59e0b');
  }
}

// ============================================================================
// 3. INDUSTRY: farm, factory, lumber, mine, workshop
// L2: silo/barn for farm, extra chimney for factory, log stacks for lumber,
//     headframe/minecart for mine, forge chimney for workshop
// L3: second silo + windmill for farm, cooling tower for factory,
//     sawmill wheel for lumber, ore conveyor for mine, crane for workshop
// ============================================================================

function drawSilo(ctx: CanvasRenderingContext2D, fx: number, fy: number, w: number, h: number): void {
  isoBox(ctx, fx, fy, w, w, h, { top: '#cfd8dc', left: '#78221a', right: '#b8372b' });
  for (let z = 4; z < h; z += 4) {
    leftWallRect(ctx, fx, fy, 1, z, w - 2, 1, '#cfd8dc');
    rightWallRect(ctx, fx, fy, 1, z, w - 2, 1, '#eceff1');
  }
  const capY = fy - h - (w >> 1);
  drawDome(ctx, fx, capY, (w >> 1) + 1, '#90a4ae', '#cfd8dc', '#ffffff', false);
}

function drawFarmAddon(ctx: CanvasRenderingContext2D, level: 2 | 3): void {
  // L2: Tall grain silo beside the barn + expanded red barn wing
  drawSilo(ctx, 18, 47, 6, 15);
  isoBox(ctx, 33, 45, 7, 8, 7, { top: '#d94b3d', left: '#8c271e', right: '#b8372b' });
  isoPitchedRoof(ctx, 33, 45, 9, 9, 7, 4, {
    leftSlope: '#4a3525',
    rightSlope: '#6b4c36',
    gable: '#a63228',
    ridge: '#8c6548',
  });

  if (level === 3) {
    // L3: Second grain silo + tall timber windmill with 4 diagonal canvas sails
    drawSilo(ctx, 13, 50, 5, 12);

    const mFx = 43;
    const mFy = 49;
    isoBox(ctx, mFx, mFy, 7, 7, 16, { top: '#f5ebd6', left: '#8d5a2b', right: '#c99a6b' });
    isoPitchedRoof(ctx, mFx, mFy, 9, 9, 16, 5, {
      leftSlope: '#4a3525',
      rightSlope: '#6b4c36',
      gable: '#8d5a2b',
      ridge: '#ffd54f',
    });
    // Windmill hub & 4 diagonal latticework sails centered at (45, 31)
    const hx = 45;
    const hy = 31;
    for (let i = -7; i <= 7; i++) {
      // Diagonal 1: top-left to bottom-right
      rect(ctx, hx + i - 1, hy + i - 1, 3, 3, OUT);
      rect(ctx, hx + i, hy + i, 2, 2, '#fff8eb');
      px(ctx, hx + i, hy + i, '#d9a066');
      // Diagonal 2: bottom-left to top-right
      rect(ctx, hx + i - 1, hy - i - 1, 3, 3, OUT);
      rect(ctx, hx + i, hy - i, 2, 2, '#fff8eb');
      px(ctx, hx + i, hy - i, '#d9a066');
    }
    disc(ctx, hx, hy, 2, OUT);
    px(ctx, hx, hy, '#ffd54f');
  }
}

function drawFactoryAddon(ctx: CanvasRenderingContext2D, level: 2 | 3, frame: number): void {
  // L2: Second tall smokestack chimney + side boiler house annex + animated smoke
  const cFx = 28;
  const cFy = 31;
  isoBox(ctx, cFx, cFy, 5, 5, 17, { top: '#2b2f33', left: '#59332c', right: '#7d4940' });
  isoBox(ctx, cFx, cFy - 14, 6, 6, 3, { top: '#22252a', left: '#3f231e', right: '#59332c' });

  const shift = frame % 3;
  const puffs: readonly [number, number, number, number][] = [
    [28 + shift, 10 - shift, 3, 2],
    [31 + shift, 6 - shift, 4, 3],
  ];
  for (const [px0, py0, pw, ph] of puffs) {
    rect(ctx, px0 - 1, py0, pw + 2, ph, '#586068');
    rect(ctx, px0, py0 - 1, pw, ph + 1, '#dce3eb');
  }

  // Side boiler annex on front-left flank
  isoBox(ctx, 20, 52, 6, 7, 9, { top: '#9ea7b0', left: '#495159', right: '#6e767d' });
  leftWallRect(ctx, 20, 52, 1, 2, 4, 4, '#ffd56b');

  if (level === 3) {
    // L3: Massive hyperbolic/stepped industrial cooling tower on the right + steam cloud + overhead pipe
    // Overhead steam pipe connecting factory roof to cooling tower
    rect(ctx, 33, 34, 10, 3, OUT);
    rect(ctx, 33, 35, 10, 1, '#cfd8dc');

    const tFx = 44;
    const tFy = 51;
    isoBox(ctx, tFx, tFy, 9, 9, 9, { top: '#adb6bf', left: '#5c636b', right: '#838c96' });
    isoBox(ctx, tFx - 1, tFy - 9, 7, 7, 6, { top: '#adb6bf', left: '#636d78', right: '#9ea7b0' });
    isoBox(ctx, tFx, tFy - 15, 8, 8, 4, { top: '#37474f', left: '#5c636b', right: '#838c96' });
    rightWallRect(ctx, tFx, tFy, 1, 8, 7, 1, '#f5b82e'); // safety hazard ring

    // Billowing white cooling-tower steam plume
    const sY = tFy - 24 - (frame % 2);
    disc(ctx, tFx - 1, sY, 4, '#9aa3ad');
    disc(ctx, tFx, sY - 2, 4, '#dce3eb');
    disc(ctx, tFx + 2, sY - 4, 3, '#ffffff');
  }
}

function drawLumberAddon(ctx: CanvasRenderingContext2D, level: 2 | 3, frame: number): void {
  // L2: Large stacked timber log piles & covered plank-drying rack shed
  const rFx = 41;
  const rFy = 49;
  isoBox(ctx, rFx, rFy, 7, 8, 8, { top: '#c49a62', left: '#5d4326', right: '#8d6e3f' });
  // Horizontal stacked plank tiers with air gaps
  for (const z of [2, 4, 6]) {
    rightWallRect(ctx, rFx, rFy, 1, z, 6, 1, '#f0c999');
    leftWallRect(ctx, rFx, rFy, 1, z, 5, 1, '#b0875a');
  }
  isoPitchedRoof(ctx, rFx, rFy, 9, 9, 8, 4, {
    leftSlope: '#4a3525',
    rightSlope: '#6b4c36',
    gable: '#8d6e3f',
    ridge: '#ffd54f',
  });

  // Pyramid of cut timber logs on the front-left yard
  const logs: readonly [number, number][] = [
    [18, 55],
    [22, 56],
    [26, 57],
    [20, 52],
    [24, 53],
    [22, 49],
  ];
  for (const [lx, ly] of logs) {
    disc(ctx, lx, ly, 3, OUT);
    disc(ctx, lx, ly, 2, '#8d5a2b');
    px(ctx, lx, ly, '#f0c999'); // bright cut-log heartwood ring
  }

  if (level === 3) {
    // L3: Second-storey sawmill loft + big rotating spoked sawmill wheel
    const uFx = 28;
    const uFy = 42;
    isoBox(ctx, uFx, uFy, 12, 12, 8, { top: '#b0875a', left: '#5d4326', right: '#7d5a35' });
    isoPitchedRoof(ctx, uFx, uFy, 14, 14, 8, 6, {
      leftSlope: '#4a3525',
      rightSlope: '#7d5a35',
      gable: '#a1783f',
      ridge: '#ffd54f',
    });

    // Big spoked sawmill wheel mounted on the front-left side (cx=18, cy=41, r=6)
    const wx = 18;
    const wy = 41;
    disc(ctx, wx, wy, 7, OUT);
    disc(ctx, wx, wy, 6, '#5d4326');
    disc(ctx, wx, wy, 5, '#c49a62');
    disc(ctx, wx, wy, 3, '#263238');
    // Rotating wheel spokes (alternate + and x on frame % 2)
    if (frame % 2 === 0) {
      rect(ctx, wx - 5, wy, 11, 1, '#ffd54f');
      rect(ctx, wx, wy - 5, 1, 11, '#ffd54f');
    } else {
      for (let d = -4; d <= 4; d++) {
        px(ctx, wx + d, wy + d, '#ffd54f');
        px(ctx, wx + d, wy - d, '#ffd54f');
      }
    }
    disc(ctx, wx, wy, 1, '#cfd8dc');
  }
}

function drawMineAddon(ctx: CanvasRenderingContext2D, level: 2 | 3, frame: number): void {
  // L2: Timber shaft headframe tower with pulley wheel + second ore-filled minecart on rails
  const hFx = 32;
  const hFy = 35;
  // A-frame timber legs straddling the mine ridge
  rect(ctx, 26, 20, 2, 15, OUT);
  rect(ctx, 27, 20, 1, 14, '#8d5a2b');
  rect(ctx, 36, 20, 2, 15, OUT);
  rect(ctx, 36, 20, 1, 14, '#b87a3d');
  // Crossbar beams
  rect(ctx, 26, 25, 12, 2, OUT);
  rect(ctx, 27, 25, 10, 1, '#a1783f');
  isoBox(ctx, hFx, 21, 7, 7, 3, { top: '#b87a3d', left: '#5d4326', right: '#8d5a2b' });

  // Spinning iron sheave pulley wheel atop headframe + hoist cable
  disc(ctx, 32, 15, 4, OUT);
  disc(ctx, 32, 15, 3, '#90a4ae');
  px(ctx, 32 + (frame % 2), 14, '#ffffff');
  rect(ctx, 32, 18, 1, 18, OUT);

  // Extended rail & second minecart heaped with glowing ore on front-left
  rect(ctx, 18, 56, 12, 1, '#cfd8dc');
  isoBox(ctx, 23, 57, 5, 5, 4, { top: '#455a64', left: '#263238', right: '#37474f' });
  rect(ctx, 21, 51, 3, 2, frame % 2 === 0 ? '#80deea' : '#ffd54f');
  px(ctx, 22, 50, '#ffffff');

  if (level === 3) {
    // L3: Elevated ore conveyor bridge + tall ore-sorting hopper tower on the right
    const bFx = 45;
    const bFy = 50;
    isoBox(ctx, bFx, bFy, 8, 8, 16, { top: '#78909c', left: '#37474f', right: '#546e7a' });
    isoPitchedRoof(ctx, bFx, bFy, 10, 10, 16, 4, {
      leftSlope: '#263238',
      rightSlope: '#455a64',
      gable: '#546e7a',
      ridge: '#ffd54f',
    });

    // Sloped steel conveyor belt spanning from headframe (34, 22) to hopper roof (45, 29)
    for (let i = 0; i < 12; i++) {
      const cx = 34 + i;
      const cy = 22 + (i >> 1);
      rect(ctx, cx, cy - 1, 2, 4, OUT);
      rect(ctx, cx, cy, 2, 2, '#90a4ae');
      if ((i + frame) % 3 === 0) {
        rect(ctx, cx, cy - 2, 2, 2, '#26c6da');
        px(ctx, cx, cy - 2, '#e0f7fa');
      }
    }
  }
}

function drawWorkshopAddon(ctx: CanvasRenderingContext2D, level: 2 | 3, frame: number): void {
  // L2: Heavy stone-and-iron blast forge chimney & smelting furnace annex on back-right
  const fFx = 37;
  const fFy = 46;
  isoBox(ctx, fFx, fFy, 7, 7, 14, { top: '#525861', left: '#3f3847', right: '#635970' });
  isoBox(ctx, fFx, fFy - 12, 8, 8, 3, { top: '#37474f', left: '#263238', right: '#455a64' });
  // Glowing molten forge mouth on right face
  const glow = frame === 0 ? '#ff6d00' : frame === 1 ? '#ffab00' : '#ffd54f';
  rightWallRect(ctx, fFx, fFy, 2, 2, 3, 5, OUT);
  rightWallRect(ctx, fFx, fFy, 3, 2, 2, 4, glow);
  // Rising forge embers/smoke
  const eY = 24 - (frame % 3);
  disc(ctx, fFx, eY, 3, '#635970');
  px(ctx, fFx, eY, glow);

  if (level === 3) {
    // L3: Second-storey master guild loft over shed + tall slewing yard crane on the right
    const uFx = 27;
    const uFy = 38;
    isoBox(ctx, uFx, uFy, 12, 14, 8, { top: '#d9a773', left: '#734b28', right: '#a66f3f' });
    rightWallRect(ctx, uFx, uFy, 3, 2, 4, 4, OUT);
    rightWallRect(ctx, uFx, uFy, 4, 3, 2, 2, '#ffd54f');
    isoPitchedRoof(ctx, uFx, uFy, 14, 16, 8, 6, {
      leftSlope: '#5c436b',
      rightSlope: '#8a6a9a',
      gable: '#7d5230',
      ridge: '#ffd54f',
    });

    // Heavy tower crane on the right yard (mast at x=47, y=15..48, boom spanning x=35..55)
    isoBox(ctx, 48, 51, 5, 5, 5, { top: '#78909c', left: '#37474f', right: '#546e7a' });
    rect(ctx, 46, 15, 3, 32, OUT);
    rect(ctx, 47, 16, 1, 30, '#f5b82e');
    // Horizontal crane jib boom + counterweight
    rect(ctx, 35, 16, 19, 3, OUT);
    rect(ctx, 36, 17, 17, 1, '#ffd54f');
    rect(ctx, 51, 18, 4, 4, OUT);
    rect(ctx, 52, 19, 2, 2, '#546e7a');
    // Hoist cable & suspended masterwork crate
    const drop = 5 + (frame % 3) * 2;
    rect(ctx, 38, 19, 1, drop, OUT);
    isoBox(ctx, 39, 23 + drop, 4, 4, 4, { top: '#ffd54f', left: '#5c436b', right: '#8a6a9a' });
  }
}

// ============================================================================
// 4. SERVICES: school, park, library, academy, clinic
// L2: bell tower / extra wing (park: fountain or gazebo)
// L3: dome or spire with gold trim
// ============================================================================

function drawSchoolAddon(ctx: CanvasRenderingContext2D, level: 2 | 3, frame: number): void {
  // L2: Side classroom wing + taller brick-and-gold bell tower
  const wFx = 21;
  const wFy = 53;
  isoBox(ctx, wFx, wFy, 8, 9, 11, { top: '#ffd54f', left: '#943a2c', right: '#bf4d3b' });
  leftWallRect(ctx, wFx, wFy, 2, 3, 4, 5, OUT);
  leftWallRect(ctx, wFx, wFy, 3, 4, 2, 3, '#a8ecff');
  isoPitchedRoof(ctx, wFx, wFy, 10, 10, 11, 5, {
    leftSlope: '#384654',
    rightSlope: '#4f6375',
    gable: '#8c372a',
    ridge: '#ffd54f',
  });

  // Taller two-tier bell tower on main roof ridge
  const bFx = 32;
  const bFy = 32;
  isoBox(ctx, bFx, bFy, 8, 8, 12, { top: '#ffe082', left: '#9e7b22', right: '#d9ac36' });
  rightWallRect(ctx, bFx, bFy, 2, 3, 4, 6, OUT);
  leftWallRect(ctx, bFx, bFy, 2, 3, 4, 6, OUT);
  const bellShift = frame % 2;
  rect(ctx, bFx - 1 + bellShift, bFy - 7, 3, 4, '#ffd54f');
  px(ctx, bFx + bellShift, bFy - 8, '#fff8e1');

  if (level === 2) {
    drawSpire(ctx, bFx, bFy - 15, 5, 6, '#384654', '#4f6375');
    return;
  }

  // L3: Grand gold-trimmed dome & soaring golden spire crowning the school bell tower
  isoBox(ctx, bFx, bFy - 11, 8, 8, 3, { top: '#fff8e1', left: '#b58d28', right: '#ffd54f' });
  drawDome(ctx, bFx, bFy - 16, 6, '#384654', '#4f6375', '#78909c', true);
  drawSpire(ctx, bFx, bFy - 22, 2, 6, '#b58d28', '#ffd54f');
}

function drawParkAddon(ctx: CanvasRenderingContext2D, level: 2 | 3, frame: number): void {
  // L2: Central stone water fountain + white timber gazebo pavilion
  isoBox(ctx, 32, 51, 9, 9, 3, { top: '#cfd8dc', left: '#6b7280', right: '#9ca3af' });
  isoDiamond(ctx, 32, 45, 7, frame % 2 === 0 ? '#29b6f6' : '#4fc3f7');

  // Gazebo columns rising around the central fountain plaza
  for (const [px0, py0] of [
    [25, 46],
    [32, 42],
    [39, 46],
    [32, 50],
  ] as const) {
    rect(ctx, px0 - 1, py0 - 10, 3, 10, OUT);
    rect(ctx, px0, py0 - 10, 1, 10, '#fff8eb');
  }
  // Sparkling fountain jet inside gazebo
  const jetH = frame % 2 === 0 ? 6 : 8;
  rect(ctx, 31, 44 - jetH, 2, jetH, '#e1f5fe');
  px(ctx, 30, 45 - jetH, '#ffffff');
  px(ctx, 33, 45 - jetH, '#ffffff');

  if (level === 2) {
    // Conical gazebo canopy roof
    drawSpire(ctx, 32, 34, 8, 7, '#2e6b4e', '#43946d');
    return;
  }

  // L3: Grand gold-trimmed conservatory rotunda dome & tall golden spire + golden park lamps
  isoBox(ctx, 32, 36, 10, 10, 4, { top: '#fff8e1', left: '#b58d28', right: '#ffd54f' });
  drawDome(ctx, 32, 29, 7, '#2e7d32', '#4caf50', '#81c784', true);
  drawSpire(ctx, 32, 22, 3, 8, '#b58d28', '#ffd54f');

  // Twin golden park lamps on the foreground path
  for (const [lx, ly] of [
    [24, 56],
    [40, 56],
  ] as const) {
    rect(ctx, lx - 1, ly - 8, 3, 8, OUT);
    rect(ctx, lx, ly - 7, 1, 7, '#37474f');
    rect(ctx, lx - 1, ly - 10, 3, 3, '#ffd54f');
    px(ctx, lx, ly - 10, '#ffffff');
  }
}

function drawLibraryAddon(ctx: CanvasRenderingContext2D, level: 2 | 3): void {
  // L2: Side reading-room wing + limestone archive bell/clock tower
  const wFx = 21;
  const wFy = 53;
  isoBox(ctx, wFx, wFy, 8, 9, 10, { top: '#ebe4d3', left: '#99907c', right: '#cfc5b0' });
  leftWallRect(ctx, wFx, wFy, 2, 2, 4, 6, OUT);
  leftWallRect(ctx, wFx, wFy, 3, 3, 2, 4, '#72c5e8');
  isoPitchedRoof(ctx, wFx, wFy, 10, 10, 10, 5, {
    leftSlope: '#455587',
    rightSlope: '#687db8',
    gable: '#7d7564',
    ridge: '#9ab0eb',
  });

  // Scholarly clock/bell tower on the back-left
  const tFx = 25;
  const tFy = 39;
  isoBox(ctx, tFx, tFy, 7, 7, 14, { top: '#ebe4d3', left: '#8a8270', right: '#cfc5b0' });
  rightWallRect(ctx, tFx, tFy, 2, 6, 3, 5, OUT);
  rightWallRect(ctx, tFx, tFy, 3, 7, 1, 3, '#ffe082');
  drawSpire(ctx, tFx, tFy - 16, 4, 7, '#455587', '#687db8');

  if (level === 3) {
    // L3: Grand indigo-and-gold archive rotunda dome & celestial golden spire
    const dFx = 33;
    const dFy = 36;
    isoBox(ctx, dFx, dFy, 10, 10, 7, { top: '#ebe4d3', left: '#99907c', right: '#cfc5b0' });
    isoBox(ctx, dFx, dFy - 5, 10, 10, 2, { top: '#ffe082', left: '#b58d28', right: '#ffd54f' });
    drawDome(ctx, 33, 24, 7, '#455587', '#687db8', '#9ab0eb', true);
    drawSpire(ctx, 33, 17, 3, 7, '#b58d28', '#ffd54f');
  }
}

function drawAcademyAddon(ctx: CanvasRenderingContext2D, level: 2 | 3, frame: number): void {
  // L2: Flanking twin scholar wings & belfry towers on left and right corners
  const lFx = 20;
  const lFy = 50;
  isoBox(ctx, lFx, lFy, 6, 7, 16, { top: '#ebe6f5', left: '#7a6b99', right: '#b8aad6' });
  isoBox(ctx, lFx, lFy - 14, 6, 7, 2, { top: '#ffe082', left: '#b58d28', right: '#e6b83c' });
  leftWallRect(ctx, lFx, lFy, 2, 4, 2, 7, OUT);
  leftWallRect(ctx, lFx, lFy, 2, 5, 1, 5, '#80d8ff');

  const rFx = 43;
  const rFy = 49;
  isoBox(ctx, rFx, rFy, 7, 6, 16, { top: '#ebe6f5', left: '#7a6b99', right: '#c4b8e0' });
  isoBox(ctx, rFx, rFy - 14, 7, 6, 2, { top: '#ffe082', left: '#b58d28', right: '#e6b83c' });
  rightWallRect(ctx, rFx, rFy, 2, 4, 2, 7, OUT);
  rightWallRect(ctx, rFx, rFy, 2, 5, 1, 5, '#ffe082');

  if (level === 2) {
    drawSpire(ctx, lFx, lFy - 18, 4, 6, '#5c436b', '#8a6a9a');
    drawSpire(ctx, rFx, rFy - 18, 4, 6, '#5c436b', '#8a6a9a');
    return;
  }

  // L3: Twin golden domes & tall spires on the flanking towers + gilded royal collar & arcane crest
  drawDome(ctx, lFx, lFy - 18, 4, '#b58d28', '#ffd54f', '#fff8e1', true);
  drawSpire(ctx, lFx, lFy - 22, 2, 6, '#b58d28', '#ffd54f');

  drawDome(ctx, rFx, rFy - 18, 4, '#b58d28', '#ffd54f', '#fff8e1', true);
  drawSpire(ctx, rFx, rFy - 22, 2, 6, '#b58d28', '#ffd54f');

  // Grand golden collar & radiant celestial halo around the central academy dome
  isoBox(ctx, 31, 25, 12, 12, 2, { top: '#fff8e1', left: '#b58d28', right: '#ffd54f' });
  const pulse = frame % 2;
  rect(ctx, 27 - pulse, 6, 9 + pulse * 2, 2, OUT);
  rect(ctx, 28 - pulse, 6, 7 + pulse * 2, 1, '#ffd54f');
  px(ctx, 31, 4, '#ffffff');
}

function drawClinicAddon(ctx: CanvasRenderingContext2D, level: 2 | 3): void {
  // L2: Side apothecary ward wing + rooftop bell/lantern tower
  const wFx = 21;
  const wFy = 53;
  isoBox(ctx, wFx, wFy, 8, 9, 10, { top: '#faf7f0', left: '#b8b2a2', right: '#e8e2d0' });
  leftWallRect(ctx, wFx, wFy, 2, 3, 4, 4, OUT);
  leftWallRect(ctx, wFx, wFy, 3, 4, 2, 2, '#81d4fa');
  isoPitchedRoof(ctx, wFx, wFy, 10, 10, 10, 5, {
    leftSlope: '#2e6b4e',
    rightSlope: '#43946d',
    gable: '#cfc8b6',
    ridge: '#76d1a4',
  });

  // Sanctuary bell/lantern cupola on main roof
  const bFx = 31;
  const bFy = 34;
  isoBox(ctx, bFx, bFy, 6, 6, 9, { top: '#faf7f0', left: '#9e9789', right: '#e8e2d0' });
  rightWallRect(ctx, bFx, bFy, 2, 2, 2, 5, OUT);
  rightWallRect(ctx, bFx, bFy, 2, 3, 1, 3, '#ffd54f');

  if (level === 2) {
    drawSpire(ctx, bFx, bFy - 11, 4, 6, '#2e6b4e', '#43946d');
    return;
  }

  // L3: Grand hospital rotunda with gold-trimmed emerald dome & tall golden spire
  const dFx = 31;
  const dFy = 35;
  isoBox(ctx, dFx, dFy, 10, 10, 7, { top: '#faf7f0', left: '#b8b2a2', right: '#e8e2d0' });
  isoBox(ctx, dFx, dFy - 5, 10, 10, 2, { top: '#ffe082', left: '#b58d28', right: '#ffd54f' });
  drawDome(ctx, 31, 23, 7, '#2e6b4e', '#43946d', '#76d1a4', true);
  drawSpire(ctx, 31, 16, 3, 7, '#b58d28', '#ffd54f');

  // Gold-rimmed red healing cross crest on the rotunda front
  rect(ctx, 32, 28, 5, 5, '#ffd54f');
  rect(ctx, 34, 29, 1, 3, '#e53935');
  rect(ctx, 33, 30, 3, 1, '#e53935');
}

// ============================================================================
// 5. MILITARY: barracks, tower
// L2: palisade/stone wall pieces and a banner
// L3: corner turrets and a big banner
// ============================================================================

function drawStoneBastions(ctx: CanvasRenderingContext2D): void {
  const wallCol = { top: '#9ea7b0', left: '#4a4f54', right: '#6e767d' };
  const merlonCol = { top: '#cfd8dc', left: '#5c636b', right: '#838c96' };

  // Front-left stone wall bastion + merlons
  isoBox(ctx, 21, 57, 8, 5, 8, wallCol);
  isoBox(ctx, 18, 48, 3, 3, 3, merlonCol);
  isoBox(ctx, 22, 50, 3, 3, 3, merlonCol);

  // Front-right stone wall bastion + merlons
  isoBox(ctx, 41, 56, 5, 8, 8, wallCol);
  isoBox(ctx, 41, 49, 3, 3, 3, merlonCol);
  isoBox(ctx, 45, 47, 3, 3, 3, merlonCol);
}

function drawBarracksAddon(ctx: CanvasRenderingContext2D, level: 2 | 3, frame: number): void {
  // L2: Crenellated stone wall bastions + extra crimson-and-gold war banner
  drawStoneBastions(ctx);

  if (level === 2) {
    drawBanner(ctx, 37, 18, 14, 8, 4, '#d32f2f', '#ffd54f', frame);
    return;
  }

  // L3: Flanking crenellated corner watch-turrets + huge royal war banner
  for (const [tFx, tFy] of [
    [20, 49],
    [42, 48],
  ] as const) {
    isoBox(ctx, tFx, tFy, 7, 7, 19, { top: '#9ea7b0', left: '#4a4f54', right: '#6e767d' });
    isoBox(ctx, tFx, tFy - 16, 8, 8, 3, { top: '#d64537', left: '#78221a', right: '#a83227' });
    rightWallRect(ctx, tFx, tFy, 3, 8, 1, 5, OUT);
    leftWallRect(ctx, tFx, tFy, 3, 8, 1, 5, OUT);
    drawSpire(ctx, tFx, tFy - 21, 5, 7, '#78221a', '#d64537');
  }

  // Huge royal crimson-and-gold war banner at the summit
  drawBanner(ctx, 29, 4, 22, 12, 6, '#b71c1c', '#ffd54f', frame);
}

function drawTowerAddon(ctx: CanvasRenderingContext2D, level: 2 | 3, frame: number): void {
  // L2: Crenellated stone wall bastions at base + war banner on summit
  drawStoneBastions(ctx);

  // Vertical crimson-and-gold war banner draped down the right tower shaft
  rightWallRect(ctx, 32, 52, 8, 10, 4, 11, OUT);
  rightWallRect(ctx, 32, 52, 9, 11, 2, 9, '#d32f2f');
  rightWallRect(ctx, 32, 52, 9, 16, 2, 2, '#ffd54f');

  if (level === 2) {
    drawBanner(ctx, 32, 4, 14, 8, 4, '#d32f2f', '#ffd54f', frame);
    return;
  }

  // L3: Flanking corner turrets + huge royal war banner at the tower summit
  for (const [tFx, tFy] of [
    [21, 46],
    [42, 46],
  ] as const) {
    isoBox(ctx, tFx, tFy, 6, 6, 18, { top: '#997062', left: '#4a342d', right: '#755347' });
    isoBox(ctx, tFx, tFy - 15, 7, 7, 3, { top: '#ad8475', left: '#593e35', right: '#855f52' });
    rightWallRect(ctx, tFx, tFy, 2, 7, 1, 5, OUT);
    leftWallRect(ctx, tFx, tFy, 2, 7, 1, 5, OUT);
    drawSpire(ctx, tFx, tFy - 20, 4, 7, '#691e22', '#c2473b');
  }

  // Huge royal war banner flying above the fortress keep
  drawBanner(ctx, 31, 2, 16, 12, 6, '#b71c1c', '#ffd54f', frame);
}

/**
 * Fallback add-on for any upgradable kind without its own (task t27 replaces this with a
 * proper per-sector design): a small pennant on the roofline, a second one at level 3.
 */
export function drawGenericAddon(ctx: CanvasRenderingContext2D, _kind: BuildingKind, level: 2 | 3, frame: number): void {
  const flag = (x: number, y: number) => {
    ctx.fillStyle = '#141820'; ctx.fillRect(x, y, 1, 8);
    ctx.fillStyle = frame % 2 ? '#e8c050' : '#d4a838'; ctx.fillRect(x + 1, y, 4, 3);
  };
  flag(40, 14);
  if (level === 3) flag(22, 12);
}

/** Dispatch the procedural level 2 or level 3 silhouette add-on for an upgradable building kind. */
export function drawLevelAddon(
  ctx: CanvasRenderingContext2D,
  kind: BuildingKind,
  level: 2 | 3,
  frame: number,
): void {
  if (!canUpgrade(kind)) return;
  switch (kind) {
    case 'house':
      drawHouseAddon(ctx, level);
      break;
    case 'rowhouse':
      drawRowhouseAddon(ctx, level);
      break;
    case 'manor':
      drawManorAddon(ctx, level);
      break;
    case 'shop':
      drawShopAddon(ctx, level);
      break;
    case 'stall':
      drawStallAddon(ctx, level);
      break;
    case 'tavern':
      drawTavernAddon(ctx, level, frame);
      break;
    case 'bank':
      drawBankAddon(ctx, level);
      break;
    case 'farm':
      drawFarmAddon(ctx, level);
      break;
    case 'factory':
      drawFactoryAddon(ctx, level, frame);
      break;
    case 'lumber':
      drawLumberAddon(ctx, level, frame);
      break;
    case 'mine':
      drawMineAddon(ctx, level, frame);
      break;
    case 'workshop':
      drawWorkshopAddon(ctx, level, frame);
      break;
    case 'school':
      drawSchoolAddon(ctx, level, frame);
      break;
    case 'park':
      drawParkAddon(ctx, level, frame);
      break;
    case 'library':
      drawLibraryAddon(ctx, level);
      break;
    case 'academy':
      drawAcademyAddon(ctx, level, frame);
      break;
    case 'clinic':
      drawClinicAddon(ctx, level);
      break;
    case 'barracks':
      drawBarracksAddon(ctx, level, frame);
      break;
    case 'tower':
      drawTowerAddon(ctx, level, frame);
      break;
    default: {
      const own = addons3a[kind] ?? addons3b[kind] ?? addons3c[kind];
      if (own) own(ctx, level, frame);
      else drawGenericAddon(ctx, kind, level, frame);
    }
  }
}

/**
 * Build a level-2 or level-3 sprite canvas by copying the race's level-1 frame canvas
 * and compositing the procedural silhouette add-on through the race's themeFilter pipeline.
 */
export function buildLevelCanvas(
  baseCanvas: HTMLCanvasElement,
  kind: BuildingKind,
  level: 2 | 3,
  frame: number,
  filter: string | null,
): HTMLCanvasElement {
  // HD art (2x canvas): the shared add-on is drawn at 1x and doubled with crisp pixels
  // (any multiple of 64, and a canvas taller than square keeps its tile at the bottom)
  const res = Math.max(1, Math.round(baseCanvas.width / SPRITE_W));
  const [out, octx] = makeCanvas(SPRITE_W * res, baseCanvas.height);
  const dy = baseCanvas.height - SPRITE_H * res;
  if (baseCanvas.dataset.smooth) out.dataset.smooth = baseCanvas.dataset.smooth;
  octx.drawImage(baseCanvas, 0, 0);

  const [addon1, actx] = makeCanvas(SPRITE_W, SPRITE_H);
  drawLevelAddon(actx, kind, level, frame);
  let addon = addon1;
  if (res > 1) {
    const [big, bctx] = makeCanvas(SPRITE_W * res, SPRITE_H * res);
    bctx.imageSmoothingEnabled = false;
    bctx.drawImage(addon1, 0, 0, SPRITE_W * res, SPRITE_H * res);
    addon = big;
  }

  // MDN CanvasRenderingContext2D.filter applies CSS filter functions to subsequent drawImage calls
  // Source: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/filter
  if (filter) {
    octx.filter = filter;
    octx.drawImage(addon, 0, dy);
    octx.filter = 'none';
  } else {
    octx.drawImage(addon, 0, dy);
  }
  return out;
}
