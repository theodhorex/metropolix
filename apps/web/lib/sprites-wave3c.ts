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
// 1. PALISADE (Military, height 0.8)
// Sharpened log wall section across the tile, with a reinforced wooden gate.
// ============================================================================

function buildPalisadeTexture(): HTMLCanvasElement {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  // Dirt embankment and ditch across tile
  isoDiamond(ctx, 32, 48, 25, '#4e3b2b', OUT);
  isoDiamond(ctx, 32, 48, 21, '#68503b', '#3b2b1d');

  // Raised timber walkway behind the palisade (back-left and back-right)
  isoBox(ctx, 24, 43, 10, 4, 6, { top: '#795548', left: '#4e342e', right: '#5d4037' });
  isoBox(ctx, 40, 43, 4, 10, 6, { top: '#795548', left: '#4e342e', right: '#5d4037' });

  // Rear support stilts
  rect(ctx, 16, 42, 2, 7, '#3e2723');
  rect(ctx, 46, 42, 2, 7, '#3e2723');

  // Front-left sharpened log wall section (running from x=12, y=41 down to x=28, y=49)
  const leftStart = 28;
  const leftBaseY = 49;
  for (let u = 0; u < 16; u++) {
    const x = leftStart - u;
    const yBot = leftBaseY - (u >> 1);
    const stakeH = u % 3 === 0 ? 14 : u % 3 === 1 ? 12 : 13;
    const yTop = yBot - stakeH;
    rect(ctx, x, yTop, 1, stakeH, u % 2 === 0 ? '#6d4c41' : '#5d4037');
    px(ctx, x, yTop - 1, '#a1887f');
    if (u % 3 === 0) px(ctx, x, yTop - 2, '#d7ccc8');
    if (stakeH >= 8) {
      px(ctx, x, yBot - 4, '#3e2723');
      px(ctx, x, yBot - 8, '#3e2723');
    }
    px(ctx, x, yBot, OUT);
  }

  // Front-right sharpened log wall section (running from x=36, y=49 up to x=52, y=41)
  const rightStart = 36;
  const rightBaseY = 49;
  for (let v = 0; v < 16; v++) {
    const x = rightStart + v;
    const yBot = rightBaseY - (v >> 1);
    const stakeH = v % 3 === 0 ? 14 : v % 3 === 1 ? 12 : 13;
    const yTop = yBot - stakeH;
    rect(ctx, x, yTop, 1, stakeH, v % 2 === 0 ? '#795548' : '#6d4c41');
    px(ctx, x, yTop - 1, '#bcaaa4');
    if (v % 3 === 0) px(ctx, x, yTop - 2, '#d7ccc8');
    if (stakeH >= 8) {
      px(ctx, x, yBot - 4, '#3e2723');
      px(ctx, x, yBot - 8, '#3e2723');
    }
    px(ctx, x, yBot, OUT);
  }

  // Central wooden gate structure (between x=28 and x=36)
  // Left post
  rect(ctx, 28, 33, 2, 17, OUT);
  rect(ctx, 28, 34, 2, 15, '#4e342e');
  px(ctx, 28, 32, '#a1887f');
  // Right post
  rect(ctx, 34, 33, 2, 17, OUT);
  rect(ctx, 34, 34, 2, 15, '#5d4037');
  px(ctx, 34, 32, '#a1887f');

  // Overhead lintel beam
  rect(ctx, 27, 34, 10, 3, OUT);
  rect(ctx, 28, 35, 8, 1, '#8d6e63');
  for (let sx = 29; sx <= 34; sx += 2) {
    px(ctx, sx, 33, '#a1887f');
  }

  // Gate planks (slightly ajar with dark opening gap)
  rect(ctx, 30, 38, 4, 12, OUT);
  rect(ctx, 30, 39, 2, 10, '#5d4037');
  rect(ctx, 32, 40, 2, 9, '#4e342e');
  // Iron strap hinges
  rect(ctx, 28, 41, 6, 1, '#37474f');
  rect(ctx, 28, 47, 6, 1, '#37474f');
  px(ctx, 29, 41, '#90a4ae');
  px(ctx, 29, 47, '#90a4ae');

  // Defensive stakes in front of the ditch
  for (let i = 0; i < 4; i++) {
    const sx = 22 + i * 6;
    const sy = 55 - (i > 1 ? (i - 1) * 2 : 0);
    rect(ctx, sx, sy, 1, 3, '#3e2723');
    px(ctx, sx, sy - 1, '#a1887f');
  }

  return canvas;
}

function drawPalisadeAddon(ctx: CanvasRenderingContext2D, level: 2 | 3): void {
  if (level === 2) {
    isoBox(ctx, 15, 39, 5, 5, 8, { top: '#8d6e63', left: '#4e342e', right: '#5d4037' });
    rect(ctx, 13, 27, 2, 5, '#3e2723');
    px(ctx, 13, 26, '#ffd54f');

    isoBox(ctx, 51, 39, 5, 5, 8, { top: '#8d6e63', left: '#4e342e', right: '#5d4037' });
    rect(ctx, 49, 27, 2, 5, '#3e2723');

    rect(ctx, 29, 37, 6, 1, '#78909c');
    rect(ctx, 29, 44, 6, 1, '#78909c');

    rect(ctx, 24, 53, 5, 1, '#3e2723');
    rect(ctx, 35, 53, 5, 1, '#3e2723');
    px(ctx, 23, 52, '#d7ccc8');
    px(ctx, 39, 52, '#d7ccc8');
    return;
  }

  // L3: Stone base + flanking sentry towers
  isoBox(ctx, 20, 48, 8, 3, 4, { top: '#90a4ae', left: '#455a64', right: '#607d8b' });
  isoBox(ctx, 44, 48, 3, 8, 4, { top: '#90a4ae', left: '#455a64', right: '#607d8b' });

  for (const [tFx, tFy] of [
    [24, 45],
    [40, 45],
  ] as const) {
    isoBox(ctx, tFx, tFy, 6, 6, 16, { top: '#90a4ae', left: '#455a64', right: '#607d8b' });
    isoBox(ctx, tFx, tFy - 14, 7, 7, 4, { top: '#8d6e63', left: '#4e342e', right: '#5d4037' });
    isoBox(ctx, tFx, tFy - 18, 5, 5, 3, { top: '#c62828', left: '#7f0000', right: '#b71c1c' });
    px(ctx, tFx, tFy - 22, '#ffd54f');
  }

  rect(ctx, 26, 29, 12, 3, OUT);
  rect(ctx, 27, 30, 10, 2, '#90a4ae');
  rect(ctx, 30, 32, 4, 6, OUT);
  rect(ctx, 31, 33, 2, 4, '#c62828');
  px(ctx, 31, 34, '#ffd54f');
}

// ============================================================================
// 2. WATCHTOWER (Military, height 2.0, 2 frames)
// Tall thin timber tower on stilts with a roofed lookout and a torch (2 frames).
// ============================================================================

function buildWatchtowerTexture(frame = 0): HTMLCanvasElement {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  // Dirt & gravel outpost clearing
  isoDiamond(ctx, 32, 50, 18, '#4e3e30', OUT);
  isoDiamond(ctx, 32, 50, 14, '#6b5442', '#3e3124');

  // Stone stilt footing blocks on the ground
  const stilts = [
    { x: 31, y: 55, col: '#5d4037', outCol: '#3e2723' },
    { x: 21, y: 50, col: '#4e342e', outCol: '#271712' },
    { x: 41, y: 50, col: '#5d4037', outCol: '#3e2723' },
    { x: 31, y: 45, col: '#3e2723', outCol: OUT },
  ];
  for (const s of stilts) {
    rect(ctx, s.x, s.y, 2, 2, '#78909c');
    px(ctx, s.x, s.y, '#b0bec5');
  }

  // Stilts rising from ground up to lookout deck (y=28)
  rect(ctx, 31, 28, 2, 17, '#3e2723');
  rect(ctx, 21, 28, 2, 22, '#4e342e');
  rect(ctx, 41, 28, 2, 22, '#5d4037');
  rect(ctx, 31, 30, 2, 25, '#6d4c41');

  // Diagonal X-bracing between stilts
  for (let dy = 0; dy < 16; dy += 2) {
    px(ctx, 22 + (dy >> 1), 48 - dy, '#3e2723');
    px(ctx, 31 - (dy >> 1), 48 - dy, '#3e2723');
    px(ctx, 31 + (dy >> 1), 48 - dy, '#4e342e');
    px(ctx, 41 - (dy >> 1), 48 - dy, '#4e342e');
  }

  // Wooden access ladder running up between stilts
  for (let ly = 32; ly <= 52; ly += 3) {
    rect(ctx, 26, ly, 4, 1, '#8d6e63');
  }
  rect(ctx, 26, 30, 1, 23, '#4e342e');
  rect(ctx, 29, 30, 1, 23, '#4e342e');

  // Lookout platform deck at y=27..29
  isoBox(ctx, 32, 29, 11, 11, 2, { top: '#a1887f', left: '#4e342e', right: '#795548' });

  // Wooden guard railings around platform
  leftWallRect(ctx, 32, 29, 0, 2, 11, 4, OUT);
  leftWallRect(ctx, 32, 29, 1, 3, 9, 2, '#5d4037');
  rightWallRect(ctx, 32, 29, 0, 2, 11, 4, OUT);
  rightWallRect(ctx, 32, 29, 1, 3, 9, 2, '#6d4c41');

  // 4 corner posts supporting roof
  rect(ctx, 22, 17, 2, 11, '#4e342e');
  rect(ctx, 40, 17, 2, 11, '#5d4037');
  rect(ctx, 31, 17, 2, 11, '#6d4c41');
  rect(ctx, 31, 15, 2, 11, '#3e2723');

  // Sentinel archer silhouette
  rect(ctx, 29, 20, 3, 5, '#263238');
  px(ctx, 30, 19, '#cfd8dc');
  rect(ctx, 27, 18, 1, 8, '#795548');

  // 4-sided pitched timber/shingle roof
  isoPitchedRoof(ctx, 32, 18, 13, 13, 1, 7, {
    leftSlope: '#4e342e',
    rightSlope: '#795548',
    gable: '#3e2723',
    ridge: '#a1887f',
  });

  // Animated flaming torch on iron wall sconce
  rect(ctx, 42, 23, 3, 1, '#37474f');
  rect(ctx, 44, 21, 1, 3, '#4e342e');
  if (frame === 0) {
    rect(ctx, 43, 18, 3, 3, '#ff9800');
    px(ctx, 44, 19, '#fff59d');
    px(ctx, 44, 17, '#e65100');
    px(ctx, 45, 16, '#ffe082');
  } else {
    rect(ctx, 44, 17, 2, 4, '#ff9800');
    px(ctx, 44, 18, '#ffffff');
    px(ctx, 43, 16, '#ff5722');
    px(ctx, 45, 15, '#fff176');
  }

  return canvas;
}

function drawWatchtowerAddon(ctx: CanvasRenderingContext2D, level: 2 | 3, frame: number): void {
  if (level === 2) {
    isoBox(ctx, 32, 51, 8, 8, 10, { top: '#8d6e63', left: '#4e342e', right: '#6d4c41' });
    rightWallRect(ctx, 32, 51, 2, 1, 3, 6, OUT);
    rightWallRect(ctx, 32, 51, 3, 2, 1, 5, '#3e2723');

    rect(ctx, 18, 26, 4, 1, '#4e342e');
    rect(ctx, 18, 27, 1, 7, '#d7ccc8');
    rect(ctx, 17, 34, 3, 3, '#795548');

    const wave = frame % 2;
    rect(ctx, 34, 29, 6, 8, OUT);
    rect(ctx, 35, 30, 4, 6, '#c62828');
    px(ctx, 36, 31 + wave, '#ffd54f');
    return;
  }

  for (const [sFx, sFy] of [
    [32, 56],
    [22, 51],
    [42, 51],
  ] as const) {
    isoBox(ctx, sFx, sFy, 4, 4, 8, { top: '#b0bec5', left: '#455a64', right: '#607d8b' });
  }

  rect(ctx, 29, 23, 6, 2, '#37474f');
  rect(ctx, 28, 22, 1, 4, '#8d6e63');
  rect(ctx, 34, 22, 1, 4, '#8d6e63');
  px(ctx, 31, 21, '#cfd8dc');

  rect(ctx, 31, 16, 2, 3, '#ffd54f');
  px(ctx, 31, 19, '#ffb300');

  rect(ctx, 31, 6, 2, 5, OUT);
  rect(ctx, 31, 7, 2, 3, '#ffd54f');
  px(ctx, 31, 6, '#fff8e1');
}

// ============================================================================
// 3. ARMORY (Military, height 1.3)
// Stone storehouse with weapon racks, shields on the wall, anvil.
// ============================================================================

function buildArmoryTexture(): HTMLCanvasElement {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  // Cobblestone fortress yard
  isoDiamond(ctx, 32, 48, 26, '#454a4f', OUT);
  isoDiamond(ctx, 32, 48, 22, '#5e656b', '#373b3f');

  // Main fortified stone storehouse
  const fx = 28;
  const fy = 53;
  const wL = 14;
  const wR = 13;
  const wallH = 16;

  isoBox(ctx, fx, fy, wL, wR, wallH, {
    top: '#90a4ae',
    left: '#37474f',
    right: '#546e7a',
  });

  for (const z of [4, 8, 12]) {
    leftWallRect(ctx, fx, fy, 1, z, wL - 2, 1, '#263238');
    rightWallRect(ctx, fx, fy, 1, z, wR - 2, 1, '#37474f');
  }

  isoPitchedRoof(ctx, fx, fy, wL, wR, wallH, 8, {
    leftSlope: '#263238',
    rightSlope: '#455a64',
    gable: '#212121',
    ridge: '#607d8b',
  });

  isoBox(ctx, 24, 34, 4, 4, 9, { top: '#78909c', left: '#263238', right: '#455a64' });

  // Storehouse door
  leftWallRect(ctx, fx, fy, 4, 1, 5, 8, OUT);
  leftWallRect(ctx, fx, fy, 5, 1, 3, 7, '#3e2723');
  leftWallRect(ctx, fx, fy, 5, 3, 3, 1, '#78909c');
  leftWallRect(ctx, fx, fy, 5, 6, 3, 1, '#78909c');

  // Slit windows
  rightWallRect(ctx, fx, fy, 3, 8, 2, 5, OUT);
  rightWallRect(ctx, fx, fy, 3, 10, 1, 1, '#ffd54f');
  rightWallRect(ctx, fx, fy, 8, 8, 2, 5, OUT);
  rightWallRect(ctx, fx, fy, 8, 10, 1, 1, '#ffd54f');

  // Shields mounted on wall
  rightWallRect(ctx, fx, fy, 3, 3, 3, 3, OUT);
  rightWallRect(ctx, fx, fy, 3, 3, 3, 3, '#c62828');
  rightWallRect(ctx, fx, fy, 4, 4, 1, 1, '#ffd54f');

  rightWallRect(ctx, fx, fy, 8, 3, 3, 4, OUT);
  rightWallRect(ctx, fx, fy, 8, 3, 3, 3, '#90a4ae');
  rightWallRect(ctx, fx, fy, 9, 2, 1, 2, '#cfd8dc');

  // Smithing porch
  rect(ctx, 36, 44, 2, 9, '#4e342e');
  rect(ctx, 46, 40, 2, 9, '#5d4037');
  rect(ctx, 36, 43, 12, 2, '#3e2723');

  // Anvil on oak stump
  rect(ctx, 39, 49, 4, 4, '#5d4037');
  rect(ctx, 38, 47, 6, 3, OUT);
  rect(ctx, 39, 47, 4, 2, '#37474f');
  px(ctx, 40, 47, '#90a4ae');
  px(ctx, 43, 47, '#78909c');

  // Quenching trough
  rect(ctx, 43, 52, 6, 4, '#4e342e');
  rect(ctx, 44, 52, 4, 2, '#0288d1');
  px(ctx, 45, 52, '#81d4fa');

  // Weapon rack
  rect(ctx, 33, 48, 4, 7, '#3e2723');
  rect(ctx, 34, 44, 1, 10, '#cfd8dc');
  px(ctx, 34, 43, '#ffffff');
  rect(ctx, 36, 46, 1, 8, '#b0bec5');
  px(ctx, 36, 50, '#ffd54f');

  return canvas;
}

function drawArmoryAddon(ctx: CanvasRenderingContext2D, level: 2 | 3): void {
  if (level === 2) {
    rect(ctx, 47, 47, 3, 5, '#78909c');
    px(ctx, 48, 49, '#cfd8dc');
    rect(ctx, 46, 50, 5, 2, '#4e342e');

    rect(ctx, 43, 42, 3, 5, '#90a4ae');
    px(ctx, 44, 41, '#cfd8dc');
    rect(ctx, 42, 44, 1, 4, '#546e7a');

    rect(ctx, 31, 52, 4, 5, '#4e342e');
    px(ctx, 32, 51, '#cfd8dc');
    px(ctx, 33, 50, '#cfd8dc');
    return;
  }

  isoBox(ctx, 22, 36, 7, 7, 18, { top: '#90a4ae', left: '#37474f', right: '#546e7a' });
  isoBox(ctx, 20, 24, 3, 3, 3, { top: '#cfd8dc', left: '#455a64', right: '#78909c' });
  isoBox(ctx, 24, 26, 3, 3, 3, { top: '#cfd8dc', left: '#455a64', right: '#78909c' });

  disc(ctx, 25, 20, 3, '#78909c');
  disc(ctx, 27, 16, 4, '#b0bec5');
  disc(ctx, 29, 12, 3, '#eceff1');

  rect(ctx, 20, 27, 7, 7, OUT);
  rect(ctx, 21, 28, 5, 5, '#ffd54f');
  px(ctx, 23, 30, '#c62828');
}

// ============================================================================
// 4. WARCAMP (Military, height 1.0, 2 frames)
// Several canvas tents around a campfire (fire 2 frames), banners.
// ============================================================================

function buildWarcampTexture(frame = 0): HTMLCanvasElement {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  // Trampled mud & gravel encampment clearing
  isoDiamond(ctx, 32, 48, 26, '#544232', OUT);
  isoDiamond(ctx, 32, 48, 22, '#6d5540', '#3b2b1d');

  // 1. Back-left Large Command Pavilion Tent
  const pApexX = 23;
  const pApexY = 24;
  for (let dy = 0; dy <= 16; dy++) {
    const span = Math.round((dy * 9) / 16);
    const y = pApexY + dy;
    rect(ctx, pApexX - span - 1, y, (span + 1) * 2, 1, OUT);
    rect(ctx, pApexX - span, y, span, 1, '#d7ccc8');
    rect(ctx, pApexX, y, span, 1, '#efebe9');
  }
  rect(ctx, pApexX - 2, pApexY + 11, 4, 6, '#3e2723');
  rect(ctx, pApexX - 1, pApexY + 12, 2, 5, '#211510');
  rect(ctx, pApexX, pApexY - 3, 1, 4, '#ffd54f');
  rect(ctx, pApexX + 1, pApexY - 3, 4, 2, '#c62828');

  // 2. Back-right Ridge / Wedge Tent
  for (let u = 0; u < 10; u++) {
    const rx = 36 + u;
    const ry = 33 - (u >> 1);
    for (let h = 0; h < 9; h++) {
      const y = ry + h;
      rect(ctx, rx - 4, y, 4, 1, '#cfd8dc');
      rect(ctx, rx, y, 4, 1, '#eceff1');
    }
    px(ctx, rx, ry, OUT);
  }

  // 3. Front-left small soldier bivy / pup tent
  for (let h = 0; h < 7; h++) {
    const y = 49 - h;
    const w = 7 - h;
    rect(ctx, 16 - (w >> 1), y, w, 1, '#bcaaa4');
  }
  px(ctx, 16, 42, OUT);

  // 4. Central Campfire at (x=33, y=48)
  disc(ctx, 33, 48, 5, '#373b3f');
  disc(ctx, 33, 48, 4, '#1e2022');
  rect(ctx, 31, 48, 5, 2, '#3e2723');

  // Cooking tripod spit with pot
  rect(ctx, 30, 44, 1, 5, '#263238');
  rect(ctx, 36, 44, 1, 5, '#263238');
  rect(ctx, 30, 44, 7, 1, '#263238');
  rect(ctx, 32, 45, 3, 2, '#455a64');

  if (frame === 0) {
    rect(ctx, 32, 45, 3, 3, '#ff9800');
    px(ctx, 33, 46, '#fff59d');
    px(ctx, 33, 44, '#d84315');
    px(ctx, 34, 43, '#ffeb3b');
  } else {
    rect(ctx, 31, 46, 4, 2, '#ff9800');
    px(ctx, 32, 45, '#fff176');
    px(ctx, 34, 44, '#e65100');
    px(ctx, 32, 43, '#ffe082');
  }

  // 5. Military Camp Details
  isoBox(ctx, 43, 50, 4, 4, 4, { top: '#8d6e63', left: '#4e342e', right: '#6d4c41' });
  isoBox(ctx, 47, 48, 4, 4, 4, { top: '#8d6e63', left: '#4e342e', right: '#6d4c41' });

  rect(ctx, 39, 52, 4, 4, '#5d4037');
  rect(ctx, 39, 53, 4, 1, '#90a4ae');

  const flagX = 46;
  const flagY = 36;
  rect(ctx, flagX, flagY - 12, 1, 18, OUT);
  rect(ctx, flagX, flagY - 12, 1, 18, '#8d6e63');
  px(ctx, flagX, flagY - 13, '#ffd54f');

  const wave = frame % 2;
  rect(ctx, flagX + 1, flagY - 12 + wave, 6, 4, OUT);
  rect(ctx, flagX + 1, flagY - 11 + wave, 5, 2, '#c62828');
  px(ctx, flagX + 2, flagY - 11 + wave, '#ffd54f');

  return canvas;
}

function drawWarcampAddon(ctx: CanvasRenderingContext2D, level: 2 | 3, frame: number): void {
  if (level === 2) {
    isoBox(ctx, 25, 50, 5, 5, 4, { top: '#d7ccc8', left: '#4e342e', right: '#6d4c41' });
    rect(ctx, 24, 47, 3, 2, '#fff9c4');
    px(ctx, 25, 47, '#c62828');

    rect(ctx, 40, 44, 4, 2, '#78909c');
    px(ctx, 41, 43, '#90a4ae');
    px(ctx, 42, 43, '#90a4ae');

    rect(ctx, 21, 23, 6, 2, '#c62828');
    px(ctx, 20, 24, '#ffd54f');
    px(ctx, 27, 24, '#ffd54f');
    return;
  }

  for (let i = 0; i < 3; i++) {
    const bx = 16 + i * 5;
    const by = 55 - i * 2;
    rect(ctx, bx, by, 4, 1, '#3e2723');
    px(ctx, bx + 1, by - 1, '#d7ccc8');
  }

  disc(ctx, 23, 19, 5, '#c62828');
  disc(ctx, 23, 19, 4, '#d32f2f');
  px(ctx, 23, 13, '#ffd54f');

  const wave = frame % 2;
  rect(ctx, 29, 6, 1, 18, '#ffd54f');
  rect(ctx, 30, 8 + wave, 9, 6, OUT);
  rect(ctx, 30, 9 + wave, 8, 4, '#b71c1c');
  rect(ctx, 32, 10 + wave, 4, 2, '#ffd54f');
}

// ============================================================================
// 5. FORTRESS (Military, height 2.3)
// Massive stone keep with battlements, corner towers and a gate, tallest military.
// ============================================================================

function buildFortressTexture(): HTMLCanvasElement {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  // Broad stone terrace foundation pad
  isoDiamond(ctx, 32, 53, 29, '#37474f', OUT);
  isoDiamond(ctx, 32, 53, 25, '#455a64', '#263238');

  // 1. Lower Fortress Curtain Wall Terrace
  const bFx = 32;
  const bFy = 58;
  const bWL = 19;
  const bWR = 19;
  const bH = 7;

  isoBox(ctx, bFx, bFy, bWL, bWR, bH, {
    top: '#78909c',
    left: '#37474f',
    right: '#546e7a',
  });

  // 2. Central Gatehouse Entrance
  rightWallRect(ctx, bFx, bFy, 5, 1, 8, 6, OUT);
  rightWallRect(ctx, bFx, bFy, 6, 1, 6, 5, '#212121');
  for (let pb = 7; pb <= 10; pb++) {
    rightWallRect(ctx, bFx, bFy, pb, 1, 1, 5, '#78909c');
  }

  // 3. Imposing Central Citadel Keep
  const kFx = 32;
  const kFy = 51;
  const kWL = 13;
  const kWR = 13;
  const kH = 23;

  isoBox(ctx, kFx, kFy, kWL, kWR, kH, {
    top: '#90a4ae',
    left: '#37474f',
    right: '#607d8b',
  });

  for (const z of [6, 12, 18]) {
    leftWallRect(ctx, kFx, kFy, 1, z, kWL - 2, 1, '#263238');
    rightWallRect(ctx, kFx, kFy, 1, z, kWR - 2, 1, '#455a64');
  }

  for (const z0 of [8, 15]) {
    leftWallRect(ctx, kFx, kFy, 5, z0, 2, 4, OUT);
    leftWallRect(ctx, kFx, kFy, 5, z0 + 1, 1, 2, '#ffd54f');
    rightWallRect(ctx, kFx, kFy, 5, z0, 2, 4, OUT);
    rightWallRect(ctx, kFx, kFy, 6, z0 + 1, 1, 2, '#ffd54f');
  }

  // 4. Two Flanking Crenellated Corner Towers
  isoBox(ctx, 20, 51, 6, 6, 19, { top: '#90a4ae', left: '#37474f', right: '#546e7a' });
  isoBox(ctx, 44, 51, 6, 6, 19, { top: '#90a4ae', left: '#455a64', right: '#607d8b' });

  isoBox(ctx, 18, 32, 2, 2, 3, { top: '#cfd8dc', left: '#37474f', right: '#546e7a' });
  isoBox(ctx, 21, 33, 2, 2, 3, { top: '#cfd8dc', left: '#37474f', right: '#546e7a' });
  isoBox(ctx, 42, 33, 2, 2, 3, { top: '#cfd8dc', left: '#455a64', right: '#78909c' });
  isoBox(ctx, 45, 32, 2, 2, 3, { top: '#cfd8dc', left: '#455a64', right: '#78909c' });

  // 5. Overhanging Machicolated Parapet on Central Keep
  const topFy = kFy - kH;
  isoBox(ctx, kFx, topFy + 2, 15, 15, 4, {
    top: '#b0bec5',
    left: '#37474f',
    right: '#546e7a',
  });

  const keepMerlons: readonly (readonly [number, number, number, number])[] = [
    [32, topFy - 7, 3, 3],
    [24, topFy - 3, 3, 3],
    [40, topFy - 3, 3, 3],
    [28, topFy + 1, 3, 3],
    [36, topFy + 1, 3, 3],
  ];
  for (const [mFx, mFy, mW, mH] of keepMerlons) {
    isoBox(ctx, mFx, mFy, mW, mH, 3, { top: '#eceff1', left: '#455a64', right: '#78909c' });
  }

  isoDiamond(ctx, 32, topFy - 5, 8, '#263238', OUT);

  leftWallRect(ctx, kFx, kFy, 3, 7, 4, 11, OUT);
  leftWallRect(ctx, kFx, kFy, 4, 8, 2, 9, '#b71c1c');
  leftWallRect(ctx, kFx, kFy, 4, 13, 2, 2, '#ffd54f');

  rightWallRect(ctx, kFx, kFy, 3, 7, 4, 11, OUT);
  rightWallRect(ctx, kFx, kFy, 4, 8, 2, 9, '#b71c1c');
  rightWallRect(ctx, kFx, kFy, 4, 13, 2, 2, '#ffd54f');

  return canvas;
}

function drawFortressAddon(ctx: CanvasRenderingContext2D, level: 2 | 3, frame: number): void {
  if (level === 2) {
    isoBox(ctx, 36, 61, 7, 7, 6, { top: '#90a4ae', left: '#37474f', right: '#546e7a' });
    rightWallRect(ctx, 36, 61, 2, 1, 4, 5, '#4e342e');
    px(ctx, 35, 57, '#cfd8dc');
    px(ctx, 39, 55, '#cfd8dc');

    rect(ctx, 19, 28, 3, 3, '#212121');
    px(ctx, 20, 29, '#ff9800');
    rect(ctx, 43, 28, 3, 3, '#212121');
    px(ctx, 44, 29, '#ff9800');
    return;
  }

  isoBox(ctx, 32, 23, 7, 7, 12, { top: '#cfd8dc', left: '#455a64', right: '#78909c' });
  isoBox(ctx, 32, 11, 5, 5, 5, { top: '#d32f2f', left: '#7f0000', right: '#b71c1c' });
  rect(ctx, 31, 3, 2, 4, OUT);
  rect(ctx, 31, 4, 2, 2, '#ffd54f');
  px(ctx, 31, 3, '#fff8e1');

  rect(ctx, 27, 21, 5, 2, '#4e342e');
  rect(ctx, 28, 17, 1, 6, '#795548');
  rect(ctx, 26, 20, 2, 3, '#37474f');
  px(ctx, 29, 16, '#cfd8dc');

  isoBox(ctx, 20, 31, 5, 5, 5, { top: '#c62828', left: '#7f0000', right: '#b71c1c' });
  isoBox(ctx, 44, 31, 5, 5, 5, { top: '#c62828', left: '#7f0000', right: '#b71c1c' });
}

// ============================================================================
// 6. FLOWERBED (Decoration, height 0.3)
// Flat bed of mixed colourful flowers with a border.
// ============================================================================

function buildFlowerbedTexture(): HTMLCanvasElement {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  // Gravel garden surround
  isoDiamond(ctx, 32, 48, 26, '#cfd8dc', OUT);

  // Carved stone / terracotta decorative curbing
  isoDiamond(ctx, 32, 48, 22, '#90a4ae', '#455a64');
  isoDiamond(ctx, 32, 48, 20, '#b0bec5', '#546e7a');

  // Rich dark garden compost loam
  isoDiamond(ctx, 32, 48, 18, '#3e2723', '#271810');

  // Ornamental central stone sundial pedestal
  rect(ctx, 31, 46, 2, 4, '#78909c');
  rect(ctx, 30, 45, 4, 1, '#cfd8dc');
  px(ctx, 31, 44, '#eceff1');

  // Vivid mixed pixel flower blooms and foliage clusters
  // Symmetrical / geometric decorative planting beds
  const flowers: readonly (readonly [number, number, string, string])[] = [
    // Red tulips / roses
    [26, 45, '#e53935', '#ff8a80'],
    [24, 47, '#e53935', '#ff8a80'],
    [25, 49, '#d32f2f', '#ef9a9a'],
    [38, 45, '#e53935', '#ff8a80'],
    [40, 47, '#e53935', '#ff8a80'],
    [39, 49, '#d32f2f', '#ef9a9a'],

    // Yellow marigolds / daffodils
    [30, 42, '#fbc02d', '#fff59d'],
    [34, 42, '#fbc02d', '#fff59d'],
    [30, 54, '#fbc02d', '#fff59d'],
    [34, 54, '#fbc02d', '#fff59d'],

    // Violet lavender
    [28, 44, '#8e24aa', '#e1bee7'],
    [36, 44, '#8e24aa', '#e1bee7'],
    [27, 51, '#7b1fa2', '#ba68c8'],
    [37, 51, '#7b1fa2', '#ba68c8'],

    // Blue forget-me-nots / cornflowers
    [32, 40, '#1e88e5', '#90caf9'],
    [32, 56, '#1e88e5', '#90caf9'],
    [22, 48, '#1976d2', '#64b5f6'],
    [42, 48, '#1976d2', '#64b5f6'],

    // White lilies
    [29, 47, '#ffffff', '#e0f2f1'],
    [35, 47, '#ffffff', '#e0f2f1'],
    [29, 50, '#ffffff', '#e0f2f1'],
    [35, 50, '#ffffff', '#e0f2f1'],
  ];

  for (const [fx, fy, col, hi] of flowers) {
    // Leaf base
    px(ctx, fx - 1, fy, '#2e7d32');
    px(ctx, fx + 1, fy, '#388e3c');
    // Petals
    rect(ctx, fx, fy - 1, 2, 2, col);
    px(ctx, fx, fy - 1, hi);
  }

  // Extra leafy green foliage sprigs
  const leaves: readonly (readonly [number, number])[] = [
    [27, 43], [37, 43], [24, 46], [40, 46],
    [23, 49], [41, 49], [28, 53], [36, 53],
  ];
  for (const [lx, ly] of leaves) {
    px(ctx, lx, ly, '#43a047');
    px(ctx, lx + 1, ly, '#81c784');
  }

  return canvas;
}

// ============================================================================
// 7. HEDGE (Decoration, height 0.5)
// Trimmed green hedge block or topiary.
// ============================================================================

function buildHedgeTexture(): HTMLCanvasElement {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  // Gravel garden path with neat flagstone paving
  isoDiamond(ctx, 32, 48, 25, '#cfd8dc', OUT);
  isoDiamond(ctx, 32, 48, 21, '#b0bec5', '#90a4ae');

  // Stone edging stones
  for (let u = 0; u < 20; u += 4) {
    px(ctx, 32 - u, 48 - (u >> 1), '#78909c');
    px(ctx, 32 + u, 48 - (u >> 1), '#78909c');
    px(ctx, 32 - u, 48 + (u >> 1), '#78909c');
    px(ctx, 32 + u, 48 + (u >> 1), '#78909c');
  }

  // Main trimmed boxwood hedge block
  // fx=32, fy=53, wL=14, wR=14, wallH=9
  const fx = 32;
  const fy = 53;
  const wL = 14;
  const wR = 14;
  const h = 9;

  isoBox(ctx, fx, fy, wL, wR, h, {
    top: '#66bb6a',
    left: '#1b5e20',
    right: '#2e7d32',
  });

  // Dense dappled leaf texture on all faces
  // Top face leaf variation
  for (let u = 1; u < wL - 1; u++) {
    for (let v = 1; v < wR - 1; v++) {
      if ((u * 3 + v * 7) % 5 === 0) {
        px(ctx, fx - 1 - u + v, fy - h - ((u + v + 1) >> 1), '#81c784');
      } else if ((u * 5 + v * 3) % 7 === 0) {
        px(ctx, fx - 1 - u + v, fy - h - ((u + v + 1) >> 1), '#a5d6a7');
      }
    }
  }

  // Right face sunlit leaves
  for (let v = 1; v < wR - 1; v++) {
    for (let z = 1; z < h - 1; z++) {
      if ((v * 5 + z * 3) % 4 === 0) {
        rightWallRect(ctx, fx, fy, v, z, 1, 1, '#43a047');
      }
    }
  }

  // Left face shadow leaves
  for (let u = 1; u < wL - 1; u++) {
    for (let z = 1; z < h - 1; z++) {
      if ((u * 3 + z * 5) % 4 === 0) {
        leftWallRect(ctx, fx, fy, u, z, 1, 1, '#144218');
      }
    }
  }

  // Sculpted topiary center sphere in an ornamental terracotta urn
  // Terracotta planter pedestal atop hedge center
  rect(ctx, 30, 39, 4, 3, OUT);
  rect(ctx, 31, 40, 2, 2, '#d84315');
  px(ctx, 31, 39, '#ff8a65'); // terracotta rim

  // Manicured spherical topiary crown
  disc(ctx, 32, 33, 6, OUT);
  disc(ctx, 32, 33, 5, '#2e7d32');
  disc(ctx, 31, 32, 3, '#43a047');
  disc(ctx, 30, 31, 2, '#66bb6a');
  px(ctx, 30, 30, '#a5d6a7'); // top-left sunlight glint

  return canvas;
}

// ============================================================================
// 8. WELL (Decoration, height 0.7)
// Round stone well with a small roof and bucket.
// ============================================================================

function buildWellTexture(): HTMLCanvasElement {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  // Cobblestone town square paving
  isoDiamond(ctx, 32, 50, 20, '#54514a', OUT);
  isoDiamond(ctx, 32, 50, 16, '#6e6a61', '#3d3a35');

  // Spilled water splash on the paving
  isoDiamond(ctx, 35, 52, 4, '#0288d1');
  px(ctx, 35, 52, '#81d4fa');

  // Octagonal stone well wall
  // fx=32, fy=53, wL=10, wR=10, wallH=7
  const fx = 32;
  const fy = 53;
  const wL = 10;
  const wR = 10;
  const wallH = 7;

  isoBox(ctx, fx, fy, wL, wR, wallH, {
    top: '#90a4ae',
    left: '#37474f',
    right: '#546e7a',
  });

  // Masonry stone lines on well wall
  leftWallRect(ctx, fx, fy, 1, 3, wL - 2, 1, '#263238');
  rightWallRect(ctx, fx, fy, 1, 3, wR - 2, 1, '#37474f');

  // Deep dark well opening inside
  isoDiamond(ctx, 32, 44, 5, '#01579b', OUT);
  px(ctx, 32, 44, '#4fc3f7'); // water reflection glint

  // Two sturdy timber posts supporting the well roof
  // Left post
  rect(ctx, 24, 30, 2, 18, OUT);
  rect(ctx, 24, 31, 2, 16, '#4e342e');
  // Right post
  rect(ctx, 38, 30, 2, 18, OUT);
  rect(ctx, 38, 31, 2, 16, '#5d4037');

  // Wooden windlass spindle & coil of rope
  rect(ctx, 25, 33, 14, 2, '#6d4c41');
  rect(ctx, 30, 33, 4, 3, '#d7ccc8'); // rope winding
  rect(ctx, 31, 36, 1, 5, '#d7ccc8'); // hanging rope

  // Wooden water bucket suspended into the well
  rect(ctx, 30, 41, 4, 4, OUT);
  rect(ctx, 31, 42, 2, 3, '#5d4037');
  rect(ctx, 30, 43, 4, 1, '#90a4ae'); // iron hoop

  // Iron turning crank handle on right post
  rect(ctx, 40, 33, 3, 1, '#37474f');
  rect(ctx, 42, 34, 1, 3, '#37474f');
  px(ctx, 43, 36, '#8d6e63'); // wood grip

  // Pitched 2-slope timber roof canopy over well
  isoPitchedRoof(ctx, 32, 31, 13, 13, 1, 6, {
    leftSlope: '#4e342e',
    rightSlope: '#795548',
    gable: '#3e2723',
    ridge: '#a1887f',
  });

  // Second wooden bucket resting on cobblestones beside the well
  rect(ctx, 22, 51, 4, 4, OUT);
  rect(ctx, 23, 52, 2, 3, '#6d4c41');
  rect(ctx, 22, 53, 4, 1, '#78909c');
  px(ctx, 23, 51, '#4fc3f7'); // water in bucket

  return canvas;
}

// ============================================================================
// 9. POND (Decoration, height 0.2, 2 frames)
// Flat pond with lily pads and a duck (water shimmer 2 frames).
// ============================================================================

function buildPondTexture(frame = 0): HTMLCanvasElement {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  // Grass meadow & smooth pebble shoreline
  isoDiamond(ctx, 32, 48, 26, '#355f3e', OUT);
  isoDiamond(ctx, 32, 48, 22, '#41724b', '#26472e');

  // Smooth river pebble beach around water rim
  const pebbles: readonly (readonly [number, number, string])[] = [
    [18, 48, '#78909c'], [20, 45, '#90a4ae'], [24, 42, '#607d8b'],
    [40, 42, '#90a4ae'], [44, 45, '#78909c'], [46, 48, '#607d8b'],
    [22, 53, '#90a4ae'], [26, 55, '#78909c'], [38, 55, '#607d8b'], [42, 53, '#90a4ae'],
  ];
  for (const [px0, py0, col] of pebbles) {
    rect(ctx, px0, py0, 2, 2, col);
    px(ctx, px0, py0, '#cfd8dc');
  }

  // Clear blue ornamental pond pool
  isoDiamond(ctx, 32, 48, 18, '#0277bd', OUT);
  isoDiamond(ctx, 32, 48, 14, '#0288d1', '#01579b');

  // Deep azure water center
  isoDiamond(ctx, 32, 48, 9, '#01579b');

  // Reeds & cattails on the far bank
  rect(ctx, 36, 39, 1, 6, '#388e3c');
  rect(ctx, 38, 40, 1, 5, '#43a047');
  px(ctx, 36, 38, '#5d4037'); // cattail head
  px(ctx, 38, 39, '#5d4037');

  // Green floating lily pads with delicate pink lotus flowers
  // Pad 1 (left)
  disc(ctx, 26, 47, 2, '#2e7d32');
  px(ctx, 26, 47, '#f48fb1'); // pink flower
  px(ctx, 26, 46, '#ffffff');

  // Pad 2 (front)
  disc(ctx, 30, 52, 2, '#388e3c');
  px(ctx, 30, 52, '#ffffff');

  // Pad 3 (right)
  disc(ctx, 39, 47, 2, '#2e7d32');
  px(ctx, 39, 47, '#f48fb1');

  // Animated swimming mallard duck
  // Frame 0: duck at (33, 48); Frame 1: duck slight bob/drift at (33, 47) with ripple wake
  const duckY = frame === 0 ? 48 : 47;
  const duckX = 33;

  // Duck body
  rect(ctx, duckX - 2, duckY, 5, 3, '#4e342e'); // brown plumage
  rect(ctx, duckX - 1, duckY + 1, 3, 2, '#6d4c41');
  px(ctx, duckX - 3, duckY, '#ffffff');         // tail white tip

  // Iridescent green duck head & neck
  rect(ctx, duckX + 2, duckY - 2, 3, 3, '#1b5e20');
  px(ctx, duckX + 2, duckY + 1, '#ffffff');     // white neck collar
  px(ctx, duckX + 4, duckY - 3, '#1b5e20');     // crown
  px(ctx, duckX + 5, duckY - 2, '#ff9800');     // yellow/orange bill

  // Animated water shimmer & ripple glints (2 frames)
  if (frame === 0) {
    // Water ripples
    px(ctx, 28, 46, '#81d4fa');
    px(ctx, 29, 46, '#e1f5fe');
    px(ctx, 36, 50, '#81d4fa');
    px(ctx, 37, 50, '#ffffff');
    px(ctx, 32, 53, '#4fc3f7');
    // Duck wake
    px(ctx, duckX - 4, duckY + 1, '#b3e5fc');
  } else {
    // Shimmer shifted
    px(ctx, 29, 45, '#e1f5fe');
    px(ctx, 30, 45, '#81d4fa');
    px(ctx, 35, 51, '#ffffff');
    px(ctx, 36, 51, '#81d4fa');
    px(ctx, 27, 49, '#4fc3f7');
    // Duck wake ripple expanding
    px(ctx, duckX - 4, duckY + 2, '#e1f5fe');
    px(ctx, duckX - 5, duckY + 1, '#81d4fa');
  }

  return canvas;
}

// ============================================================================
// 10. ARCH (Decoration, height 1.6)
// Tall stone arch gateway with carvings.
// ============================================================================

function buildArchTexture(): HTMLCanvasElement {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  // Stepped monumental limestone base plinth
  isoDiamond(ctx, 32, 53, 25, '#78909c', OUT);
  isoDiamond(ctx, 32, 53, 21, '#b0bec5', '#546e7a');

  // Left monumental fluted pier
  // fx=24, fy=52, wL=7, wR=7, wallH=18
  const lFx = 24;
  const lFy = 52;
  const pW = 7;
  const pH = 18;

  isoBox(ctx, lFx, lFy, pW, pW, pH, {
    top: '#cfd8dc',
    left: '#455a64',
    right: '#78909c',
  });

  // Fluting on left pier
  leftWallRect(ctx, lFx, lFy, 2, 2, 1, pH - 4, '#37474f');
  leftWallRect(ctx, lFx, lFy, 4, 2, 1, pH - 4, '#37474f');
  rightWallRect(ctx, lFx, lFy, 2, 2, 1, pH - 4, '#546e7a');
  rightWallRect(ctx, lFx, lFy, 4, 2, 1, pH - 4, '#546e7a');

  // Right monumental fluted pier
  // fx=44, fy=52, wL=7, wR=7, wallH=18
  const rFx = 44;
  const rFy = 52;

  isoBox(ctx, rFx, rFy, pW, pW, pH, {
    top: '#cfd8dc',
    left: '#546e7a',
    right: '#90a4ae',
  });

  // Fluting on right pier
  leftWallRect(ctx, rFx, rFy, 2, 2, 1, pH - 4, '#455a64');
  leftWallRect(ctx, rFx, rFy, 4, 2, 1, pH - 4, '#455a64');
  rightWallRect(ctx, rFx, rFy, 2, 2, 1, pH - 4, '#607d8b');
  rightWallRect(ctx, rFx, rFy, 4, 2, 1, pH - 4, '#607d8b');

  // Spanning Arched Vault & Attic Story
  // Spans across both piers from x=16 to x=48
  // fx=32, fy=34, wL=15, wR=15, wallH=9
  const aFx = 32;
  const aFy = 34;
  const aW = 15;
  const aH = 9;

  isoBox(ctx, aFx, aFy, aW, aW, aH, {
    top: '#eceff1',
    left: '#546e7a',
    right: '#90a4ae',
  });

  // Deep arched portal vault opening underneath
  for (let dy = 0; dy < 8; dy++) {
    const span = Math.round(Math.sqrt(Math.max(0, 36 - dy * dy)));
    rect(ctx, 32 - span, 35 + dy, span * 2, 1, '#263238');
  }

  // Classical carved reliefs & inscriptions along the frieze
  leftWallRect(ctx, aFx, aFy, 2, 2, aW - 4, 2, '#37474f');
  rightWallRect(ctx, aFx, aFy, 2, 2, aW - 4, 2, '#607d8b');

  // Golden carved keystone medallion at the apex of the arch portal
  rect(ctx, 31, 32, 3, 3, OUT);
  rect(ctx, 31, 32, 3, 3, '#ffd54f');
  px(ctx, 32, 33, '#ffb300'); // carved laurel relief

  // Ornamental stone urn finials / acroteria on attic corners
  // Left finial
  rect(ctx, 17, 19, 3, 4, OUT);
  rect(ctx, 18, 19, 2, 3, '#cfd8dc');
  px(ctx, 18, 18, '#ffd54f');
  // Right finial
  rect(ctx, 44, 19, 3, 4, OUT);
  rect(ctx, 45, 19, 2, 3, '#cfd8dc');
  px(ctx, 45, 18, '#ffd54f');
  // Center crest atop attic
  rect(ctx, 30, 16, 4, 3, OUT);
  rect(ctx, 31, 16, 2, 2, '#ffd54f');
  px(ctx, 31, 15, '#fff8e1');

  return canvas;
}

/** Third-wave shared art (task file .agy/tasks/t27). Each entry returns the animation frames (64x64 canvases). */
export const art3c: Partial<Record<BuildingKind, () => HTMLCanvasElement[]>> = {
  palisade: () => [buildPalisadeTexture()],
  watchtower: () => [buildWatchtowerTexture(0), buildWatchtowerTexture(1)],
  armory: () => [buildArmoryTexture()],
  warcamp: () => [buildWarcampTexture(0), buildWarcampTexture(1)],
  fortress: () => [buildFortressTexture()],
  flowerbed: () => [buildFlowerbedTexture()],
  hedge: () => [buildHedgeTexture()],
  well: () => [buildWellTexture()],
  pond: () => [buildPondTexture(0), buildPondTexture(1)],
  arch: () => [buildArchTexture()],
};

/** Level 2 / level 3 add-ons for this file's kinds, drawn on a blank 64x64 canvas over the level 1 sprite. */
export const addons3c: Partial<Record<BuildingKind, (ctx: CanvasRenderingContext2D, level: 2 | 3, frame: number) => void>> = {
  palisade: (ctx, level) => drawPalisadeAddon(ctx, level),
  watchtower: (ctx, level, frame) => drawWatchtowerAddon(ctx, level, frame),
  armory: (ctx, level) => drawArmoryAddon(ctx, level),
  warcamp: (ctx, level, frame) => drawWarcampAddon(ctx, level, frame),
  fortress: (ctx, level, frame) => drawFortressAddon(ctx, level, frame),
};
