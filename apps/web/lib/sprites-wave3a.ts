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
// 1. COTTAGE (Residential starter home, 6 citizens, height 0.8)
// Silhouette: Small cozy 1-room home, lower than house, thatched roof, flower box, stone chimney.
// ============================================================================
export function buildCottageTexture(): HTMLCanvasElement {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  // Small grassy garden plot pad
  isoDiamond(ctx, 32, 48, 22, '#486e4d', '#243c29');
  isoDiamond(ctx, 32, 48, 18, '#7d786d', OUT);

  const fx = 32;
  const fy = 55;
  const wL = 12;
  const wR = 14;
  const wallH = 10;

  // Stone foundation
  isoBox(ctx, fx, fy, wL, wR, 2, {
    top: '#8a8579',
    left: '#57544d',
    right: '#6e6a62',
  });

  // Warm timber / plaster walls
  isoBox(ctx, fx, fy - 2, wL, wR, wallH - 2, {
    top: '#ecd5b3',
    left: '#9e724c',
    right: '#cf9867',
  });

  // Rustic plank door on right wall
  rightWallRect(ctx, fx, fy, 2, 1, 3, 6, OUT);
  rightWallRect(ctx, fx, fy, 3, 1, 2, 5, '#5c3a21');
  px(ctx, fx + 4, fy - (4 >> 1) - 3, '#ffd54f'); // brass latch

  // Front window with cheerful flower box on right wall
  rightWallRect(ctx, fx, fy, 7, 3, 5, 4, OUT);
  rightWallRect(ctx, fx, fy, 8, 4, 3, 2, '#9be7ff');
  // Flower box under window
  rightWallRect(ctx, fx, fy, 7, 2, 5, 1, '#5c3a21');
  px(ctx, fx + 7, fy - (7 >> 1) - 2, '#ef5350'); // red blossom
  px(ctx, fx + 9, fy - (9 >> 1) - 2, '#ffd54f'); // yellow blossom
  px(ctx, fx + 11, fy - (11 >> 1) - 2, '#ef5350'); // red blossom

  // Small shuttered window on left (shaded) wall
  leftWallRect(ctx, fx, fy, 4, 3, 4, 4, OUT);
  leftWallRect(ctx, fx, fy, 5, 4, 2, 2, '#6ec5e8');
  leftWallRect(ctx, fx, fy, 3, 3, 1, 4, '#5b341f'); // left shutter
  leftWallRect(ctx, fx, fy, 8, 3, 1, 4, '#5b341f'); // right shutter

  // Low thatched straw roof
  isoPitchedRoof(ctx, fx, fy, wL + 2, wR + 2, wallH, 7, {
    leftSlope: '#997529',
    rightSlope: '#cf9f34',
    gable: '#805f20',
    ridge: '#ebd267',
  });

  // Small fieldstone chimney on back-right roof slope
  isoBox(ctx, 35, 33, 3, 3, 5, {
    top: '#7d7568',
    left: '#4a453d',
    right: '#635d52',
  });

  return canvas;
}

function drawCottageAddon(ctx: CanvasRenderingContext2D, level: 2 | 3): void {
  const fx = 32;
  const fy = 55;

  // L2: Thatched porch hood over front door + front yard stone well
  rightWallRect(ctx, fx, fy, 1, 8, 5, 1, OUT);
  rightWallRect(ctx, fx, fy, 1, 7, 5, 1, '#cf9f34');
  rect(ctx, fx + 5, fy - (5 >> 1) - 7, 1, 7, '#5c3a21'); // porch support post

  // Small stone well in front-left yard
  isoBox(ctx, 23, 54, 4, 4, 3, {
    top: '#4fc3f7',
    left: '#54514a',
    right: '#6e6a61',
  });
  rect(ctx, 21, 44, 1, 8, '#5c3a21');
  rect(ctx, 25, 42, 1, 8, '#5c3a21');
  rect(ctx, 20, 44, 7, 2, OUT);
  rect(ctx, 20, 43, 7, 1, '#ebd267');

  if (level === 2) return;

  // L3: Side storage annex with thatched roof + climbing rose trellis + taller stone chimney
  const aFx = 22;
  const aFy = 51;
  isoBox(ctx, aFx, aFy, 6, 7, 6, {
    top: '#ecd5b3',
    left: '#8a623f',
    right: '#b07f55',
  });
  isoPitchedRoof(ctx, aFx, aFy, 7, 8, 6, 4, {
    leftSlope: '#997529',
    rightSlope: '#cf9f34',
    gable: '#805f20',
    ridge: '#ebd267',
  });
  leftWallRect(ctx, aFx, aFy, 1, 1, 4, 4, '#388e3c');
  px(ctx, aFx - 2, aFy - 2, '#e91e63');
  px(ctx, aFx - 4, aFy - 3, '#ff4081');

  isoBox(ctx, 35, 28, 4, 4, 3, {
    top: '#8a8579',
    left: '#57544d',
    right: '#6e6a62',
  });
}

// ============================================================================
// 2. LONGHOUSE (Residential communal timber hall, 18 citizens, height 1.0)
// Silhouette: Long low building along right-up axis, steep timber roof, several doors, crossed gable horns.
// ============================================================================
export function buildLonghouseTexture(): HTMLCanvasElement {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  // Packed dirt and timber sleeper yard
  isoDiamond(ctx, 32, 48, 28, '#3d4c38', '#202b1c');
  isoDiamond(ctx, 32, 48, 24, '#6b5c47', OUT);

  const fx = 28;
  const fy = 57;
  const wL = 12;
  const wR = 26;
  const wallH = 10;

  // Heavy log foundation course
  isoBox(ctx, fx, fy, wL, wR, 2, {
    top: '#5c3818',
    left: '#331d0a',
    right: '#472810',
  });

  // Dark timber walls
  isoBox(ctx, fx, fy - 2, wL, wR, wallH - 2, {
    top: '#8c592a',
    left: '#4d2e13',
    right: '#6b411d',
  });

  // Horizontal timber beam courses
  leftWallRect(ctx, fx, fy, 1, 4, wL - 2, 1, '#331d0a');
  rightWallRect(ctx, fx, fy, 1, 4, wR - 2, 1, '#331d0a');

  // Arched wooden gable door on front-left wall
  leftWallRect(ctx, fx, fy, 3, 1, 5, 7, OUT);
  leftWallRect(ctx, fx, fy, 4, 1, 3, 6, '#331d0a');
  px(ctx, fx - 1 - 4, fy - (4 >> 1) - 4, '#cfd8dc'); // iron door ring

  // Two entrance doors along the long right wall
  for (const vDoor of [4, 16]) {
    rightWallRect(ctx, fx, fy, vDoor, 1, 4, 6, OUT);
    rightWallRect(ctx, fx, fy, vDoor + 1, 1, 2, 5, '#331d0a');
  }

  // Small high smoke slit windows with warm interior fire glow
  for (const vWin of [10, 22]) {
    rightWallRect(ctx, fx, fy, vWin, 5, 3, 2, OUT);
    rightWallRect(ctx, fx, fy, vWin + 1, 5, 1, 1, '#f5d76e');
  }

  // Steep Nordic timber shingle roof
  isoPitchedRoof(ctx, fx, fy, wL + 2, wR + 2, wallH, 10, {
    leftSlope: '#382213',
    rightSlope: '#57361e',
    gable: '#452b18',
    ridge: '#784d2b',
  });

  // Crossed carved gable finials (horns/dragon heads) rising above front gable peak
  const peakX = fx - 1 - (wL >> 1);
  const peakY = fy - wallH - ((wL >> 1) >> 1) - 10;
  rect(ctx, peakX - 2, peakY - 3, 1, 4, OUT);
  rect(ctx, peakX + 2, peakY - 3, 1, 4, OUT);
  px(ctx, peakX - 2, peakY - 3, '#8c592a');
  px(ctx, peakX + 2, peakY - 3, '#8c592a');

  // Stack of firewood logs beside the wall at right corner
  const woodX = fx + wR - 2;
  const woodY = fy - ((wR - 2) >> 1);
  rect(ctx, woodX - 2, woodY - 2, 4, 3, OUT);
  rect(ctx, woodX - 1, woodY - 2, 3, 2, '#8d6e63');
  px(ctx, woodX - 1, woodY - 1, '#d7ccc8');

  return canvas;
}

function drawLonghouseAddon(ctx: CanvasRenderingContext2D, level: 2 | 3): void {
  const fx = 28;
  const fy = 57;

  // L2: Row of 4 round warrior shields on the right wall + stone hearth chimney on roof ridge
  const shieldColors = ['#c62828', '#1565c0', '#ffd54f', '#2e7d32'];
  for (let i = 0; i < 4; i++) {
    const v = 2 + i * 6;
    rightWallRect(ctx, fx, fy, v, 4, 3, 3, OUT);
    rightWallRect(ctx, fx, fy, v + 1, 5, 1, 1, shieldColors[i]!);
  }

  // Stone hearth chimney poking through roof ridge
  isoBox(ctx, 36, 32, 3, 3, 5, {
    top: '#757575',
    left: '#424242',
    right: '#616161',
  });

  if (level === 2) return;

  // L3: Grand carved chieftain porch at front gable with carved totem poles + war banners
  const pFx = 24;
  const pFy = 59;
  isoBox(ctx, pFx, pFy, 5, 5, 8, {
    top: '#8c592a',
    left: '#4d2e13',
    right: '#6b411d',
  });
  isoPitchedRoof(ctx, pFx, pFy, 6, 6, 8, 4, {
    leftSlope: '#382213',
    rightSlope: '#57361e',
    gable: '#452b18',
    ridge: '#ffd54f',
  });
  px(ctx, pFx - 2, pFy - 8 - 4 - 2, '#ffd54f');
  rect(ctx, pFx - 4, pFy - 14, 1, 12, '#37474f');
  rect(ctx, pFx - 7, pFy - 14, 3, 4, '#c62828');
  rect(ctx, pFx + 6, pFy - 16, 1, 12, '#37474f');
  rect(ctx, pFx + 7, pFy - 16, 3, 4, '#1565c0');
}

// ============================================================================
// 3. TENEMENT (Residential crowded flats, 40 citizens, height 1.8)
// Silhouette: 3 storeys, plain brick facade, grid of small windows, fire escape stairs, laundry lines.
// ============================================================================
export function buildTenementTexture(): HTMLCanvasElement {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  // Urban cobblestone pavement pad with curb
  isoDiamond(ctx, 32, 48, 26, '#545b63', OUT);
  isoDiamond(ctx, 32, 48, 22, '#707982', '#3e444a');

  const fx = 32;
  const fy = 57;
  const wL = 16;
  const wR = 18;
  const wallH = 27;

  // Rusticated stone foundation
  isoBox(ctx, fx, fy, wL, wR, 3, {
    top: '#6e6861',
    left: '#3d3a36',
    right: '#54504b',
  });

  // Weathered red-brown brick block
  isoBox(ctx, fx, fy - 3, wL, wR, wallH - 3, {
    top: '#a65349',
    left: '#5e231f',
    right: '#7d332d',
  });

  // Belt courses between floors
  leftWallRect(ctx, fx, fy, 1, 10, wL - 2, 1, '#421614');
  rightWallRect(ctx, fx, fy, 1, 10, wR - 2, 1, '#421614');
  leftWallRect(ctx, fx, fy, 1, 18, wL - 2, 1, '#421614');
  rightWallRect(ctx, fx, fy, 1, 18, wR - 2, 1, '#421614');

  // Ground entrance door & stone stoop on right wall
  rightWallRect(ctx, fx, fy, 2, 1, 4, 7, OUT);
  rightWallRect(ctx, fx, fy, 3, 1, 2, 6, '#3e2723');
  rightWallRect(ctx, fx, fy, 1, 0, 5, 1, '#9e9e9e');

  // Grid of sash windows on right wall (3 floors)
  for (const v of [8, 13]) {
    rightWallRect(ctx, fx, fy, v, 3, 3, 4, OUT);
    rightWallRect(ctx, fx, fy, v, 7, 3, 1, '#cfd8dc');
    rightWallRect(ctx, fx, fy, v + 1, 4, 1, 2, '#fff59d');
  }
  for (const v of [3, 8, 13]) {
    rightWallRect(ctx, fx, fy, v, 12, 3, 4, OUT);
    rightWallRect(ctx, fx, fy, v, 16, 3, 1, '#cfd8dc');
    rightWallRect(ctx, fx, fy, v + 1, 13, 1, 2, '#90caf9');
  }
  for (const v of [3, 8, 13]) {
    rightWallRect(ctx, fx, fy, v, 20, 3, 4, OUT);
    rightWallRect(ctx, fx, fy, v, 24, 3, 1, '#cfd8dc');
    rightWallRect(ctx, fx, fy, v + 1, 21, 1, 2, '#fff59d');
  }

  // Windows on shaded left wall
  for (const u of [4, 10]) {
    for (const z of [4, 12, 20]) {
      leftWallRect(ctx, fx, fy, u, z, 3, 4, OUT);
      leftWallRect(ctx, fx, fy, u + 1, z + 1, 1, 2, '#64b5f6');
    }
  }

  // Metal fire escape platforms and ladders on left wall
  leftWallRect(ctx, fx, fy, 3, 10, 8, 1, '#212121');
  leftWallRect(ctx, fx, fy, 3, 18, 8, 1, '#212121');
  leftWallRect(ctx, fx, fy, 3, 11, 1, 3, '#212121');
  leftWallRect(ctx, fx, fy, 10, 11, 1, 3, '#212121');
  leftWallRect(ctx, fx, fy, 3, 19, 1, 3, '#212121');
  leftWallRect(ctx, fx, fy, 10, 19, 1, 3, '#212121');

  // Roof parapet
  isoBox(ctx, fx, fy - wallH, wL, wR, 2, {
    top: '#78909c',
    left: '#455a64',
    right: '#546e7a',
  });
  isoDiamond(ctx, 33, 57 - wallH - 8, 11, '#263238', OUT);

  // Rooftop access bulkhead
  isoBox(ctx, 30, 24, 4, 4, 4, {
    top: '#8d6e63',
    left: '#4e342e',
    right: '#6d4c41',
  });

  // Flapping laundry line strung across facade
  const lx0 = fx + 4;
  const ly0 = fy - (4 >> 1) - 13;
  const lx1 = fx + 15;
  const ly1 = fy - (15 >> 1) - 13;
  for (let x = lx0; x <= lx1; x++) {
    const t = (x - lx0) / (lx1 - lx0);
    const y = Math.round(ly0 + t * (ly1 - ly0) + Math.sin(t * Math.PI) * 2);
    px(ctx, x, y, '#e0e0e0');
  }
  px(ctx, lx0 + 2, ly0 + 2, '#ffffff');
  px(ctx, lx0 + 3, ly0 + 2, '#ffffff');
  px(ctx, lx0 + 5, ly0 + 3, '#ef5350');
  px(ctx, lx0 + 7, ly0 + 3, '#42a5f5');
  px(ctx, lx0 + 9, ly0 + 2, '#ffeb3b');

  return canvas;
}

function drawTenementAddon(ctx: CanvasRenderingContext2D, level: 2 | 3): void {
  // L2: Rooftop wooden water tank on timber stilts + TV aerial
  rect(ctx, 24, 18, 1, 5, '#4e342e');
  rect(ctx, 27, 16, 1, 5, '#4e342e');
  rect(ctx, 21, 16, 1, 5, '#4e342e');
  rect(ctx, 20, 10, 8, 7, OUT);
  rect(ctx, 21, 11, 6, 5, '#8d6e63');
  rect(ctx, 21, 13, 6, 1, '#3e2723');
  rect(ctx, 22, 8, 4, 2, '#5d4037');

  rect(ctx, 36, 10, 1, 9, '#78909c');
  rect(ctx, 34, 12, 5, 1, '#b0bec5');
  rect(ctx, 35, 15, 3, 1, '#b0bec5');

  if (level === 2) return;

  // L3: 4th floor brick penthouse/mansard extension + rooftop garden terrace
  const pHx = 32;
  const pHy = 28;
  isoBox(ctx, pHx, pHy, 10, 12, 6, {
    top: '#455a64',
    left: '#5e231f',
    right: '#7d332d',
  });
  rightWallRect(ctx, pHx, pHy, 2, 2, 3, 3, OUT);
  rightWallRect(ctx, pHx, pHy, 3, 3, 1, 1, '#fff59d');
  rightWallRect(ctx, pHx, pHy, 7, 2, 3, 3, OUT);
  rightWallRect(ctx, pHx, pHy, 8, 3, 1, 1, '#fff59d');

  rect(ctx, 38, 20, 5, 2, '#2e7d32');
  px(ctx, 39, 19, '#e91e63');
  px(ctx, 41, 19, '#ffeb3b');
}

// ============================================================================
// 4. VILLA (Residential rich estate, 16 citizens, height 1.4)
// Silhouette: Sprawling two-wing Mediterranean villa, courtyard terrace, marble columns, terracotta tiles.
// ============================================================================
export function buildVillaTexture(): HTMLCanvasElement {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  // Manicured garden lawn and terracotta tiled courtyard terrace
  isoDiamond(ctx, 32, 48, 28, '#388e3c', OUT);
  isoDiamond(ctx, 32, 48, 24, '#c47d52', '#824828');

  // Back-left main wing: fx = 29, fy = 54, wL = 14, wR = 10, wallH = 14
  const mFx = 29;
  const mFy = 54;
  const mWl = 14;
  const mWr = 10;
  const mH = 14;

  isoBox(ctx, mFx, mFy, mWl, mWr, 2, {
    top: '#9e907d',
    left: '#595044',
    right: '#7a6f60',
  });
  isoBox(ctx, mFx, mFy - 2, mWl, mWr, mH - 2, {
    top: '#f7edd8',
    left: '#9e8569',
    right: '#cfb597',
  });

  // Windows and French doors on main wing
  leftWallRect(ctx, mFx, mFy, 3, 4, 3, 6, OUT);
  leftWallRect(ctx, mFx, mFy, 4, 5, 1, 4, '#80deea');
  leftWallRect(ctx, mFx, mFy, 8, 4, 3, 6, OUT);
  leftWallRect(ctx, mFx, mFy, 9, 5, 1, 4, '#80deea');

  // Pitched terracotta roof on main wing
  isoPitchedRoof(ctx, mFx, mFy, mWl + 2, mWr + 2, mH, 7, {
    leftSlope: '#7a281c',
    rightSlope: '#a83e2d',
    gable: '#8c483b',
    ridge: '#d9654f',
  });

  // Cross wing along front-right: fx = 39, fy = 54, wL = 8, wR = 12, wallH = 12
  const cFx = 39;
  const cFy = 54;
  const cWl = 8;
  const cWr = 12;
  const cH = 12;

  isoBox(ctx, cFx, cFy, cWl, cWr, 2, {
    top: '#9e907d',
    left: '#595044',
    right: '#7a6f60',
  });
  isoBox(ctx, cFx, cFy - 2, cWl, cWr, cH - 2, {
    top: '#f7edd8',
    left: '#9e8569',
    right: '#cfb597',
  });

  // Arched windows on right wing
  rightWallRect(ctx, cFx, cFy, 2, 3, 3, 5, OUT);
  rightWallRect(ctx, cFx, cFy, 3, 4, 1, 3, '#80deea');
  rightWallRect(ctx, cFx, cFy, 7, 3, 3, 5, OUT);
  rightWallRect(ctx, cFx, cFy, 8, 4, 1, 3, '#80deea');

  // Pitched terracotta roof on cross wing
  isoPitchedRoof(ctx, cFx, cFy, cWl + 2, cWr + 2, cH, 6, {
    leftSlope: '#7a281c',
    rightSlope: '#a83e2d',
    gable: '#8c483b',
    ridge: '#d9654f',
  });

  // Colonnaded loggia in the courtyard (3 white marble columns supporting terrace)
  for (const vCol of [1, 5, 9]) {
    const colX = 26 + vCol;
    const colY = 56 - (vCol >> 1);
    rect(ctx, colX - 1, colY - 7, 2, 8, OUT);
    rect(ctx, colX, colY - 6, 1, 6, '#ffffff');
    px(ctx, colX, colY - 7, '#ffd54f');
  }

  // Terracotta planters with cypress / citrus trees in the courtyard
  rect(ctx, 33, 52, 3, 2, '#d87a48');
  rect(ctx, 33, 48, 3, 4, '#2e7d32');
  px(ctx, 34, 49, '#ff9800');
  rect(ctx, 22, 54, 3, 2, '#d87a48');
  rect(ctx, 23, 49, 2, 5, '#1b5e20');

  return canvas;
}

function drawVillaAddon(ctx: CanvasRenderingContext2D, level: 2 | 3): void {
  // L2: Bubbling marble fountain in courtyard + purple bougainvillea pergola
  disc(ctx, 31, 53, 4, OUT);
  disc(ctx, 31, 53, 3, '#cfd8dc');
  disc(ctx, 31, 53, 2, '#29b6f6');
  px(ctx, 31, 52, '#ffffff');

  rect(ctx, 23, 46, 10, 1, '#5d4037');
  rect(ctx, 24, 45, 1, 4, '#8e24aa');
  rect(ctx, 27, 44, 2, 3, '#ab47bc');
  rect(ctx, 31, 45, 2, 3, '#8e24aa');

  if (level === 2) return;

  // L3: Belvedere tower cupola on roof with arched gallery and gilded dome
  const bFx = 26;
  const bFy = 36;
  isoBox(ctx, bFx, bFy, 6, 6, 8, {
    top: '#f7edd8',
    left: '#9e8569',
    right: '#cfb597',
  });
  leftWallRect(ctx, bFx, bFy, 1, 2, 4, 4, OUT);
  leftWallRect(ctx, bFx, bFy, 2, 3, 2, 2, '#80deea');
  rightWallRect(ctx, bFx, bFy, 1, 2, 4, 4, OUT);
  rightWallRect(ctx, bFx, bFy, 2, 3, 2, 2, '#80deea');

  disc(ctx, bFx - 1, bFy - 8 - 3, 4, OUT);
  disc(ctx, bFx - 1, bFy - 8 - 3, 3, '#ffd54f');
  px(ctx, bFx - 1, bFy - 8 - 7, '#ffffff');
}

// ============================================================================
// 5. HIGHRISE (Residential tallest tower, 60 citizens, height 2.4)
// Silhouette: Tallest building (3 tiers), lit window strips, roof water tank, radio beacon.
// ============================================================================
export function buildHighriseTexture(frame = 0): HTMLCanvasElement {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  // Modern paved granite plaza
  isoDiamond(ctx, 32, 48, 25, '#37474f', OUT);
  isoDiamond(ctx, 32, 48, 21, '#546e7a', '#263238');

  // Tier 1 (Ground to h=14): fx = 32, fy = 58, wL = 14, wR = 14
  const t1Fx = 32;
  const t1Fy = 58;
  const t1W = 14;
  const t1H = 14;

  isoBox(ctx, t1Fx, t1Fy, t1W, t1W, t1H, {
    top: '#90a4ae',
    left: '#37474f',
    right: '#546e7a',
  });

  // Double-height glass entrance lobby on right wall
  rightWallRect(ctx, t1Fx, t1Fy, 3, 1, 8, 8, OUT);
  rightWallRect(ctx, t1Fx, t1Fy, 4, 2, 6, 6, '#80deea');
  rightWallRect(ctx, t1Fx, t1Fy, 6, 2, 2, 5, '#4dd0e1');
  rightWallRect(ctx, t1Fx, t1Fy, 1, 9, t1W - 2, 1, '#b0bec5');

  // Tier 2 (h=14 to h=28): Setback by 1px: fx = 31, fy = 44, wL = 12, wR = 12
  const t2Fx = 31;
  const t2Fy = 44;
  const t2W = 12;
  const t2H = 14;

  isoBox(ctx, t2Fx, t2Fy, t2W, t2W, t2H, {
    top: '#b0bec5',
    left: '#455a64',
    right: '#607d8b',
  });

  // Vertical bands of lit windows on Tier 2
  for (const v of [2, 5, 8]) {
    for (const z of [2, 6, 10]) {
      rightWallRect(ctx, t2Fx, t2Fy, v, z, 2, 3, OUT);
      rightWallRect(ctx, t2Fx, t2Fy, v, z + 1, 1, 2, z === 6 ? '#fff59d' : '#80d8ff');
    }
  }
  for (const u of [2, 5, 8]) {
    for (const z of [2, 6, 10]) {
      leftWallRect(ctx, t2Fx, t2Fy, u, z, 2, 3, OUT);
      leftWallRect(ctx, t2Fx, t2Fy, u, z + 1, 1, 2, u === 5 ? '#fff59d' : '#64b5f6');
    }
  }

  // Tier 3 (h=28 to h=38): Upper setback: fx = 30, fy = 30, wL = 10, wR = 10
  const t3Fx = 30;
  const t3Fy = 30;
  const t3W = 10;
  const t3H = 10;

  isoBox(ctx, t3Fx, t3Fy, t3W, t3W, t3H, {
    top: '#cfd8dc',
    left: '#546e7a',
    right: '#78909c',
  });

  // Windows on Tier 3
  for (const v of [2, 6]) {
    for (const z of [2, 6]) {
      rightWallRect(ctx, t3Fx, t3Fy, v, z, 2, 2, OUT);
      rightWallRect(ctx, t3Fx, t3Fy, v, z, 1, 2, '#fff59d');
    }
  }
  for (const u of [2, 6]) {
    for (const z of [2, 6]) {
      leftWallRect(ctx, t3Fx, t3Fy, u, z, 2, 2, OUT);
      leftWallRect(ctx, t3Fx, t3Fy, u, z, 1, 2, '#80d8ff');
    }
  }

  // Rooftop equipment
  const roofY = t3Fy - t3H;
  rect(ctx, t3Fx - t3W, roofY - (t3W >> 1), 1, 2, OUT);

  // Cylindrical water tank on roof
  rect(ctx, 23, 11, 1, 4, '#37474f');
  rect(ctx, 26, 10, 1, 4, '#37474f');
  rect(ctx, 22, 6, 6, 5, OUT);
  rect(ctx, 23, 7, 4, 3, '#8d6e63');

  // Tall communications mast extending up to y = 3
  rect(ctx, 30, 3, 2, 13, OUT);
  rect(ctx, 30, 4, 1, 12, '#eceff1');
  rect(ctx, 28, 7, 5, 1, '#cfd8dc');
  rect(ctx, 29, 10, 3, 1, '#cfd8dc');

  // Flashing red aircraft warning beacon
  const beaconColor = frame % 2 === 0 ? '#ff1744' : '#8a0010';
  rect(ctx, 29, 2, 3, 2, OUT);
  px(ctx, 30, 2, beaconColor);

  return canvas;
}

function drawHighriseAddon(ctx: CanvasRenderingContext2D, level: 2 | 3): void {
  // L2: Exterior glass elevator track along the corner + satellite microwave dish
  rect(ctx, 31, 20, 3, 36, OUT);
  rect(ctx, 32, 21, 1, 34, '#80deea');
  rect(ctx, 31, 34, 3, 4, '#ffd54f');

  disc(ctx, 35, 10, 3, OUT);
  disc(ctx, 35, 10, 2, '#eceff1');
  px(ctx, 35, 10, '#37474f');

  if (level === 2) return;

  // L3: Rooftop helipad deck + glowing penthouse beacon array
  disc(ctx, 29, 13, 7, OUT);
  disc(ctx, 29, 13, 6, '#37474f');
  rect(ctx, 28, 11, 1, 5, '#ffd54f');
  rect(ctx, 30, 11, 1, 5, '#ffd54f');
  rect(ctx, 28, 13, 3, 1, '#ffd54f');
  px(ctx, 23, 13, '#00e676');
  px(ctx, 35, 13, '#00e676');
}

// ============================================================================
// 6. BAKERY (Commerce, bread counter, round oven with 2-frame smoke, pretzel sign)
// ============================================================================
export function buildBakeryTexture(frame = 0): HTMLCanvasElement {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  // Warm cobblestone path
  isoDiamond(ctx, 32, 48, 26, '#7b7268', OUT);
  isoDiamond(ctx, 32, 48, 22, '#9c9287', '#544f47');

  const fx = 32;
  const fy = 56;
  const wL = 16;
  const wR = 18;
  const wallH = 13;

  // Stone base course
  isoBox(ctx, fx, fy, wL, wR, 2, {
    top: '#8a8277',
    left: '#544f47',
    right: '#6e675d',
  });

  // Warm cream/flour walls
  isoBox(ctx, fx, fy - 2, wL, wR, wallH - 2, {
    top: '#fcf3e3',
    left: '#a6825c',
    right: '#d9ab79',
  });

  // Storefront on right wall: serving window and counter with bread
  rightWallRect(ctx, fx, fy, 4, 2, 9, 7, OUT);
  rightWallRect(ctx, fx, fy, 5, 3, 7, 5, '#fff8e1'); // warm lit interior
  // Counter shelf
  rightWallRect(ctx, fx, fy, 3, 2, 11, 2, '#6d4c41');
  // Bread loaves on counter
  px(ctx, fx + 5, fy - (5 >> 1) - 4, '#e67e22'); // golden baguette
  px(ctx, fx + 6, fy - (6 >> 1) - 4, '#f5b041');
  px(ctx, fx + 7, fy - (7 >> 1) - 4, '#e67e22');
  px(ctx, fx + 9, fy - (9 >> 1) - 4, '#d35400'); // round boule
  px(ctx, fx + 10, fy - (10 >> 1) - 4, '#f39c12');
  px(ctx, fx + 12, fy - (12 >> 1) - 4, '#f5b041'); // croissant

  // Striped canopy over counter
  for (let v = 3; v <= 14; v++) {
    const isRed = (v & 1) === 0;
    const x = fx + v;
    const y = fy - (v >> 1) - 9;
    rect(ctx, x, y, 1, 2, isRed ? '#d32f2f' : '#fff9c4');
  }

  // Wrought-iron bracket with golden pretzel sign
  const signX = fx + 2;
  const signY = fy - (2 >> 1) - 10;
  rect(ctx, signX - 1, signY, 3, 1, OUT);
  rect(ctx, signX, signY + 1, 1, 2, OUT);
  // Pretzel shape
  rect(ctx, signX - 1, signY + 3, 3, 3, '#ffd54f');
  px(ctx, signX, signY + 4, '#6d4c41'); // center hole

  // Dutch bakery door at back of right wall
  rightWallRect(ctx, fx, fy, 14, 1, 3, 7, OUT);
  rightWallRect(ctx, fx, fy, 14, 1, 2, 6, '#5c3a21');

  // Pitched terracotta shingle roof
  isoPitchedRoof(ctx, fx, fy, wL + 2, wR + 2, wallH, 8, {
    leftSlope: '#784628',
    rightSlope: '#a8653b',
    gable: '#8c5330',
    ridge: '#d48855',
  });

  // Round stone bake oven protruding from left wall
  const ovenX = fx - 10;
  const ovenY = fy - 3;
  disc(ctx, ovenX, ovenY, 5, OUT);
  disc(ctx, ovenX, ovenY, 4, '#8d6e63');
  disc(ctx, ovenX, ovenY, 2, '#ff5722'); // glowing hearth

  // Chimney rising from oven up to y = 20
  rect(ctx, ovenX - 2, 20, 5, 24, OUT);
  rect(ctx, ovenX - 1, 21, 3, 23, '#8d6e63');
  rect(ctx, ovenX - 2, 20, 5, 2, '#4e342e'); // stone rim

  // 2 animation frames of smoke puffs rising from oven chimney
  if (frame % 2 === 0) {
    disc(ctx, ovenX, 16, 2, '#cfd8dc');
    disc(ctx, ovenX + 3, 11, 3, '#eceff1');
    disc(ctx, ovenX + 1, 6, 2, '#cfd8dc');
  } else {
    disc(ctx, ovenX + 1, 15, 3, '#eceff1');
    disc(ctx, ovenX + 2, 9, 2, '#cfd8dc');
    disc(ctx, ovenX + 4, 4, 3, '#eceff1');
  }

  return canvas;
}

function drawBakeryAddon(ctx: CanvasRenderingContext2D, level: 2 | 3): void {
  // L2: Outdoor cafe tables with pastry plates + flour sack delivery cart
  // Wooden table
  rect(ctx, 42, 53, 5, 2, '#5d4037');
  rect(ctx, 44, 55, 1, 3, '#5d4037');
  px(ctx, 43, 52, '#fff9c4'); // pastry plate
  px(ctx, 45, 52, '#f5b041'); // croissant

  // Flour sack delivery cart
  rect(ctx, 20, 55, 6, 3, '#8d6e63');
  disc(ctx, 20, 58, 2, OUT); // cart wheel
  disc(ctx, 26, 55, 2, OUT);
  rect(ctx, 21, 53, 4, 3, '#fffde7'); // white flour sack

  if (level === 2) return;

  // L3: Upper floor patisserie dormer with lace curtains + giant golden wheat sheaf sign
  isoBox(ctx, 35, 36, 5, 6, 6, {
    top: '#fcf3e3',
    left: '#a6825c',
    right: '#d9ab79',
  });
  rightWallRect(ctx, 35, 36, 1, 1, 4, 4, OUT);
  rightWallRect(ctx, 35, 36, 2, 2, 2, 2, '#fff59d');
  isoPitchedRoof(ctx, 35, 36, 7, 7, 6, 3, {
    leftSlope: '#784628',
    rightSlope: '#a8653b',
    gable: '#8c5330',
    ridge: '#ffd54f',
  });

  // Golden wheat sheaf crest on roof ridge
  rect(ctx, 33, 24, 3, 5, '#ffd54f');
  px(ctx, 32, 23, '#ffd54f');
  px(ctx, 35, 23, '#ffd54f');
}

// ============================================================================
// 7. TEAHOUSE (Commerce, moonleaf tea, curved pagoda roof, hanging lanterns, tea tables)
// ============================================================================
export function buildTeahouseTexture(): HTMLCanvasElement {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  // Zen gravel garden with stepping stones and bamboo
  isoDiamond(ctx, 32, 48, 26, '#9ea79b', OUT);
  isoDiamond(ctx, 32, 48, 22, '#b2baa0', '#555f52');

  // Stepping stones
  px(ctx, 32, 58, '#616161');
  px(ctx, 33, 56, '#757575');
  px(ctx, 31, 54, '#616161');

  // Bamboo stalks at front-left corner
  rect(ctx, 19, 44, 1, 8, '#2e7d32');
  rect(ctx, 21, 42, 1, 9, '#388e3c');
  px(ctx, 18, 43, '#4caf50');
  px(ctx, 22, 41, '#4caf50');

  const fx = 32;
  const fy = 56;
  const wL = 16;
  const wR = 16;
  const wallH = 12;

  // Raised dark timber deck (engawa)
  isoBox(ctx, fx, fy, wL, wR, 3, {
    top: '#6d4c41',
    left: '#3e2723',
    right: '#4e342e',
  });

  // Pavilion walls: Translucent shoji screens with dark wooden lattice
  isoBox(ctx, fx, fy - 3, wL - 2, wR - 2, wallH - 3, {
    top: '#fffde7',
    left: '#d7ccc8',
    right: '#efebe9',
  });

  // Shoji lattice grid on right facade
  for (const v of [2, 5, 8, 11]) {
    rightWallRect(ctx, fx, fy, v, 3, 1, wallH - 4, '#3e2723');
  }
  for (const z of [5, 8]) {
    rightWallRect(ctx, fx, fy, 1, z, wR - 3, 1, '#3e2723');
  }
  // Shoji lattice grid on left facade
  for (const u of [2, 5, 8, 11]) {
    leftWallRect(ctx, fx, fy, u, 3, 1, wallH - 4, '#3e2723');
  }
  for (const z of [5, 8]) {
    leftWallRect(ctx, fx, fy, 1, z, wL - 3, 1, '#3e2723');
  }

  // Flared curved pagoda roof (glazed jade tiles)
  isoPitchedRoof(ctx, fx, fy, wL + 2, wR + 2, wallH, 8, {
    leftSlope: '#1b5e20',
    rightSlope: '#2e7d32',
    gable: '#1b5e20',
    ridge: '#4caf50',
  });

  // Upturned curved pagoda eave tips at corners
  px(ctx, fx - 1 - (wL + 1), fy - wallH - ((wL + 1) >> 1) - 1, '#4caf50');
  px(ctx, fx + (wR + 1), fy - wallH - ((wR + 1) >> 1) - 1, '#4caf50');
  px(ctx, fx - 1, fy - wallH - 1, '#4caf50');

  // Hanging glowing red paper lanterns under eaves
  // Lantern 1 (right corner)
  const l1X = fx + wR - 2;
  const l1Y = fy - (wR >> 1) - wallH + 2;
  rect(ctx, l1X, l1Y, 3, 4, OUT);
  rect(ctx, l1X + 1, l1Y + 1, 1, 2, '#e53935');
  px(ctx, l1X + 1, l1Y + 2, '#ffd54f'); // glowing wick

  // Lantern 2 (front center)
  const l2X = fx + 2;
  const l2Y = fy - wallH + 1;
  rect(ctx, l2X, l2Y, 3, 4, OUT);
  rect(ctx, l2X + 1, l2Y + 1, 1, 2, '#e53935');
  px(ctx, l2X + 1, l2Y + 2, '#ffd54f');

  // Low outdoor tea tables with steaming matcha bowls
  // Table 1 on right veranda
  rect(ctx, 42, 50, 4, 2, '#5d4037');
  rect(ctx, 43, 52, 2, 2, '#3e2723');
  px(ctx, 43, 49, '#ffffff'); // ceramic cup
  px(ctx, 44, 49, '#4caf50'); // green tea
  px(ctx, 43, 48, '#e0f2f1'); // steam

  // Table 2 on left veranda
  rect(ctx, 23, 50, 4, 2, '#5d4037');
  rect(ctx, 24, 52, 2, 2, '#3e2723');
  px(ctx, 24, 49, '#ffffff');
  px(ctx, 25, 49, '#4caf50');
  px(ctx, 24, 48, '#e0f2f1');

  return canvas;
}

function drawTeahouseAddon(ctx: CanvasRenderingContext2D, level: 2 | 3): void {
  // L2: Second tiered pagoda roof level + traditional stone lantern (toro)
  // Second tiered roof
  isoPitchedRoof(ctx, 32, 44, 10, 10, 8, 6, {
    leftSlope: '#1b5e20',
    rightSlope: '#2e7d32',
    gable: '#1b5e20',
    ridge: '#ffd54f',
  });

  // Japanese stone toro lantern in garden
  rect(ctx, 26, 52, 3, 6, OUT);
  rect(ctx, 27, 53, 1, 4, '#9e9e9e');
  px(ctx, 27, 54, '#fff59d'); // warm flame
  rect(ctx, 25, 52, 5, 1, '#616161'); // roof cap

  if (level === 2) return;

  // L3: Triple pagoda gold finial spire + ceremonial zen koi pond
  // Spire finial
  rect(ctx, 31, 20, 2, 7, OUT);
  rect(ctx, 31, 20, 1, 6, '#ffd54f');
  px(ctx, 31, 19, '#ffffff');

  // Zen koi pond with water & orange fish
  disc(ctx, 39, 54, 4, OUT);
  disc(ctx, 39, 54, 3, '#00acc1');
  px(ctx, 39, 54, '#ff5722'); // swimming koi!
  px(ctx, 40, 53, '#ff9800');
}

// ============================================================================
// 8. TAILOR (Commerce, boutique clothier, dress mannequin bay window, scissors sign, awning)
// ============================================================================
export function buildTailorTexture(): HTMLCanvasElement {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  // Flagstone sidewalk pad
  isoDiamond(ctx, 32, 48, 25, '#78909c', OUT);
  isoDiamond(ctx, 32, 48, 21, '#90a4ae', '#455a64');

  const fx = 31;
  const fy = 56;
  const wL = 14;
  const wR = 18;
  const wallH = 16;

  // Dark stone plinth
  isoBox(ctx, fx, fy, wL, wR, 2, {
    top: '#546e7a',
    left: '#263238',
    right: '#37474f',
  });

  // Chic boutique walls in rich plum/mauve and cream trim
  isoBox(ctx, fx, fy - 2, wL, wR, wallH - 2, {
    top: '#f3e5f5',
    left: '#6a1b9a',
    right: '#8e24aa',
  });

  // Boutique entrance door on right wall
  rightWallRect(ctx, fx, fy, 2, 1, 3, 8, OUT);
  rightWallRect(ctx, fx, fy, 3, 1, 1, 7, '#4a148c');
  px(ctx, fx + 3, fy - (3 >> 1) - 4, '#ffd54f'); // brass doorknob

  // Large display bay window on right wall showcasing mannequin
  rightWallRect(ctx, fx, fy, 6, 2, 9, 8, OUT);
  rightWallRect(ctx, fx, fy, 7, 3, 7, 6, '#e0f7fa'); // glass
  px(ctx, fx + 8, fy - (8 >> 1) - 6, '#ffffff'); // glint
  px(ctx, fx + 9, fy - (9 >> 1) - 7, '#ffffff');

  // Dress form / mannequin inside window
  const mX = fx + 10;
  const mY = fy - (10 >> 1) - 3;
  rect(ctx, mX, mY - 4, 1, 4, '#5d4037'); // stand post
  rect(ctx, mX - 1, mY - 4, 3, 3, '#1976d2'); // sapphire dress torso
  px(ctx, mX, mY - 3, '#ffd54f'); // gold sash
  px(ctx, mX, mY - 5, '#f5f5f5'); // mannequin neck

  // Scalloped fabric awning over storefront (striped magenta & cream)
  for (let v = 5; v <= 15; v++) {
    const isStripe = (v & 1) === 0;
    const ax = fx + v;
    const ay = fy - (v >> 1) - 10;
    rect(ctx, ax, ay, 1, 3, isStripe ? '#ba68c8' : '#fff9c4');
    px(ctx, ax, ay + 3, isStripe ? '#7b1fa2' : '#f5f5f5'); // scallop trim
  }

  // Ornate bracket with golden scissors guild sign
  const sX = fx + 4;
  const sY = fy - (4 >> 1) - 11;
  rect(ctx, sX - 1, sY, 3, 1, OUT);
  rect(ctx, sX, sY + 1, 1, 2, OUT);
  // Crossed scissor blades
  px(ctx, sX - 1, sY + 3, '#ffd54f');
  px(ctx, sX + 1, sY + 3, '#ffd54f');
  px(ctx, sX, sY + 4, '#ffd54f');
  px(ctx, sX - 1, sY + 5, '#ffd54f');
  px(ctx, sX + 1, sY + 5, '#ffd54f');

  // Left wall: side window and stacked bolts of colourful dyed fabric
  leftWallRect(ctx, fx, fy, 3, 4, 4, 6, OUT);
  leftWallRect(ctx, fx, fy, 4, 5, 2, 4, '#b3e5fc');
  // Stack of 3 fabric bolts against left wall
  const bX = fx - 10;
  const bY = fy - 5;
  rect(ctx, bX, bY - 2, 4, 2, '#d32f2f'); // red bolt
  rect(ctx, bX, bY - 4, 4, 2, '#388e3c'); // green bolt
  rect(ctx, bX, bY - 6, 4, 2, '#ffd54f'); // gold bolt

  // Steep mansard roof in deep purple-slate
  isoPitchedRoof(ctx, fx, fy, wL + 2, wR + 2, wallH, 8, {
    leftSlope: '#4a148c',
    rightSlope: '#6a1b9a',
    gable: '#5c1675',
    ridge: '#ba68c8',
  });

  return canvas;
}

function drawTailorAddon(ctx: CanvasRenderingContext2D, level: 2 | 3): void {
  // L2: Second floor fitting salon dormer + outdoor dress rack
  isoBox(ctx, 35, 36, 5, 6, 6, {
    top: '#f3e5f5',
    left: '#6a1b9a',
    right: '#8e24aa',
  });
  rightWallRect(ctx, 35, 36, 1, 1, 4, 4, OUT);
  rightWallRect(ctx, 35, 36, 2, 2, 2, 2, '#e0f7fa');
  isoPitchedRoof(ctx, 35, 36, 7, 7, 6, 3, {
    leftSlope: '#4a148c',
    rightSlope: '#6a1b9a',
    gable: '#5c1675',
    ridge: '#ffd54f',
  });

  // Outdoor clothing rack with hanging dresses
  rect(ctx, 44, 52, 6, 1, '#5d4037');
  rect(ctx, 44, 53, 1, 4, '#5d4037');
  rect(ctx, 49, 53, 1, 4, '#5d4037');
  rect(ctx, 45, 53, 1, 3, '#e91e63'); // pink dress
  rect(ctx, 47, 53, 1, 3, '#00bcd4'); // cyan dress

  if (level === 2) return;

  // L3: Haute couture atelier skylight + grand gilded scissors crest
  // Glass atelier roof skylight
  rect(ctx, 25, 23, 6, 4, OUT);
  rect(ctx, 26, 24, 4, 2, '#e0f7fa');
  px(ctx, 27, 24, '#ffffff');

  // Grand golden scissors crest with ruby
  disc(ctx, 32, 21, 3, OUT);
  disc(ctx, 32, 21, 2, '#ffd54f');
  px(ctx, 32, 21, '#d32f2f'); // ruby jewel center
}

// ============================================================================
// 9. BAZAAR (Commerce, crowded square, 3 colored tents, woven rugs, spice crates)
// ============================================================================
export function buildBazaarTexture(): HTMLCanvasElement {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  // Bustling market plaza paving with mosaic borders
  isoDiamond(ctx, 32, 48, 28, '#bcaaa4', OUT);
  isoDiamond(ctx, 32, 48, 24, '#d7ccc8', '#8d6e63');

  // Woven Persian rugs laid out on the square
  // Rug 1: Crimson and gold central carpet
  rect(ctx, 30, 48, 7, 4, OUT);
  rect(ctx, 31, 49, 5, 2, '#c2185b');
  px(ctx, 33, 49, '#ffd54f');
  px(ctx, 33, 50, '#ffd54f');

  // Rug 2: Turquoise runner
  rect(ctx, 22, 47, 6, 3, OUT);
  rect(ctx, 23, 48, 4, 1, '#00838f');

  // Tent 1: Center-back tall conical marquee tent (Purple & Gold)
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
      px(ctx, t1Cx + dx, y, isGold ? '#ffd54f' : '#6a1b9a');
    }
  }
  // Gold finial crescent on tent 1
  rect(ctx, t1Cx - 1, t1PeakY - 2, 3, 2, '#ffd54f');

  // Tent 2: Front-left rectangular striped canopy (Red & Cream)
  const t2Fx = 23;
  const t2Fy = 54;
  // 4 timber support poles
  rect(ctx, t2Fx - 7, t2Fy - 8, 1, 6, '#5d4037');
  rect(ctx, t2Fx - 1, t2Fy - 8, 1, 6, '#5d4037');
  rect(ctx, t2Fx - 4, t2Fy - 10, 1, 6, '#5d4037');
  rect(ctx, t2Fx + 2, t2Fy - 10, 1, 6, '#5d4037');
  // Striped awning
  for (let u = 0; u < 8; u++) {
    const isRed = (u & 1) === 0;
    const ax = t2Fx - u;
    const ay = t2Fy - (u >> 1) - 6;
    rect(ctx, ax, ay, 2, 2, isRed ? '#d32f2f' : '#fff9c4');
  }

  // Tent 3: Front-right arched pavilion (Turquoise & Orange)
  const t3Fx = 41;
  const t3Fy = 52;
  rect(ctx, t3Fx - 1, t3Fy - 6, 1, 6, '#5d4037');
  rect(ctx, t3Fx + 5, t3Fy - 9, 1, 6, '#5d4037');
  for (let v = 0; v < 7; v++) {
    const isOrange = (v & 1) === 0;
    const ax = t3Fx + v;
    const ay = t3Fy - (v >> 1) - 7;
    rect(ctx, ax, ay, 1, 3, isOrange ? '#ef6c00' : '#00838f');
  }

  // Wicker spice baskets with colourful conical mounds of spices
  // Saffron yellow spice basket
  rect(ctx, 27, 52, 3, 2, '#8d6e63');
  px(ctx, 28, 51, '#ffb300');
  // Paprika red spice basket
  rect(ctx, 31, 54, 3, 2, '#8d6e63');
  px(ctx, 32, 53, '#d32f2f');
  // Green mint/herb basket
  rect(ctx, 35, 53, 3, 2, '#8d6e63');
  px(ctx, 36, 52, '#388e3c');

  // Clay amphorae pots and wooden trade crates
  rect(ctx, 39, 48, 3, 4, OUT);
  rect(ctx, 40, 49, 1, 3, '#d87a48'); // clay pot
  rect(ctx, 44, 46, 4, 4, OUT);
  rect(ctx, 45, 47, 2, 2, '#8d6e63'); // crate

  return canvas;
}

function drawBazaarAddon(ctx: CanvasRenderingContext2D, level: 2 | 3): void {
  // L2: Central brass lantern pole with glowing lanterns + merchant pack donkey
  rect(ctx, 32, 40, 1, 8, '#b58d28');
  px(ctx, 30, 42, '#ffd54f'); // left lantern
  px(ctx, 34, 42, '#ffd54f'); // right lantern
  px(ctx, 32, 39, '#ffd54f'); // top lantern

  // Small pack donkey with saddlebags
  rect(ctx, 16, 50, 5, 3, '#757575'); // body
  rect(ctx, 15, 48, 2, 3, '#757575'); // head
  rect(ctx, 16, 53, 1, 3, '#616161'); // leg
  rect(ctx, 19, 53, 1, 3, '#616161'); // leg
  rect(ctx, 17, 50, 2, 2, '#d87a48'); // saddlebag

  if (level === 2) return;

  // L3: Grand Sultan silk marquee pavilion + overflowing treasure chest
  disc(ctx, 32, 21, 6, OUT);
  disc(ctx, 32, 21, 5, '#e91e63'); // royal silk canopy
  px(ctx, 32, 14, '#ffd54f'); // gold peacock finial

  // Open treasure chest overflowing with gems and gold
  rect(ctx, 27, 49, 4, 3, OUT);
  rect(ctx, 28, 50, 2, 2, '#ffd54f'); // gold coins
  px(ctx, 28, 50, '#00e676'); // emerald
  px(ctx, 29, 50, '#ff1744'); // ruby
}

// ============================================================================
// 10. TRADE GUILD (Commerce, merchant guild hall, central clock tower, banner, scales sign)
// ============================================================================
export function buildTradeguildTexture(): HTMLCanvasElement {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  // Stepped polished granite plaza
  isoDiamond(ctx, 32, 48, 28, '#545b63', OUT);
  isoDiamond(ctx, 32, 48, 24, '#78909c', '#37474f');

  const fx = 32;
  const fy = 56;
  const wL = 18;
  const wR = 20;
  const wallH = 18;

  // Grand stone podium base
  isoBox(ctx, fx, fy, wL + 2, wR + 2, 3, {
    top: '#90a4ae',
    left: '#455a64',
    right: '#607d8b',
  });

  // Dressed ashlar sandstone guild hall
  isoBox(ctx, fx, fy - 3, wL, wR, wallH - 3, {
    top: '#f5edd6',
    left: '#8c7b64',
    right: '#bfae95',
  });

  // Grand arched double entrance portal on right wall
  rightWallRect(ctx, fx, fy, 7, 1, 6, 9, OUT);
  rightWallRect(ctx, fx, fy, 8, 2, 4, 8, '#4e342e'); // dark oak doors
  px(ctx, fx + 9, fy - (9 >> 1) - 5, '#ffd54f'); // gold lion knocker

  // Golden Scales of Trade guild sign over entrance
  const scX = fx + 10;
  const scY = fy - (10 >> 1) - 12;
  rect(ctx, scX, scY, 1, 4, '#ffd54f'); // balance beam
  rect(ctx, scX - 2, scY + 1, 5, 1, '#ffd54f'); // crossbar
  px(ctx, scX - 2, scY + 3, '#ffd54f'); // left pan
  px(ctx, scX + 2, scY + 3, '#ffd54f'); // right pan

  // Embroidered guild coat-of-arms banner hanging down facade
  const bX = fx + 4;
  const bY = fy - (4 >> 1) - 14;
  rect(ctx, bX - 1, bY, 4, 9, OUT);
  rect(ctx, bX, bY + 1, 2, 7, '#c62828'); // crimson field
  px(ctx, bX, bY + 4, '#ffd54f'); // gold crest
  px(ctx, bX + 1, bY + 5, '#ffd54f');

  // Mullioned windows on right wall
  for (const v of [1, 15]) {
    rightWallRect(ctx, fx, fy, v, 4, 3, 8, OUT);
    rightWallRect(ctx, fx, fy, v + 1, 5, 1, 6, '#e0f7fa');
  }
  // Mullioned windows on left wall
  for (const u of [3, 9, 14]) {
    leftWallRect(ctx, fx, fy, u, 4, 3, 8, OUT);
    leftWallRect(ctx, fx, fy, u + 1, 5, 1, 6, '#b2ebf2');
  }

  // Hipped copper-patina roof
  isoPitchedRoof(ctx, fx, fy, wL + 2, wR + 2, wallH, 8, {
    leftSlope: '#2e5b4b',
    rightSlope: '#3d7863',
    gable: '#24473b',
    ridge: '#ffd54f',
  });

  // Soaring Central Clock / Belfry Tower
  const tFx = 32;
  const tFy = 35;
  const tW = 8;
  const tH = 14;

  isoBox(ctx, tFx, tFy, tW, tW, tH, {
    top: '#f5edd6',
    left: '#8c7b64',
    right: '#bfae95',
  });

  // Working clock face on tower
  const clockX = tFx + 2;
  const clockY = tFy - (2 >> 1) - 7;
  disc(ctx, clockX, clockY, 3, OUT);
  disc(ctx, clockX, clockY, 2, '#ffffff'); // white dial
  px(ctx, clockX, clockY, '#141820'); // clock hand center
  px(ctx, clockX, clockY - 1, '#141820'); // hour hand
  px(ctx, clockX + 1, clockY, '#141820'); // minute hand
  px(ctx, clockX - 1, clockY - 1, '#ffd54f'); // golden rim

  // Pyramidal copper spire with gold weathercock finial
  const sPeakY = tFy - tH - 8;
  for (let dy = 0; dy <= 8; dy++) {
    const y = tFy - tH - dy;
    const half = Math.max(1, Math.round((4 * (8 - dy)) / 8));
    rect(ctx, tFx - 1 - half, y, half * 2 + 2, 1, OUT);
    rect(ctx, tFx - 1 - half, y, half, 1, '#2e5b4b');
    rect(ctx, tFx - 1, y, half, 1, '#3d7863');
  }
  // Golden ship / weathercock finial extending to y = 8
  rect(ctx, tFx - 2, sPeakY - 2, 3, 2, OUT);
  rect(ctx, tFx - 1, sPeakY - 2, 1, 2, '#ffd54f');
  px(ctx, tFx, sPeakY - 3, '#ffd54f');

  return canvas;
}

function drawTradeguildAddon(ctx: CanvasRenderingContext2D, level: 2 | 3): void {
  // L2: Flanking stone statues of commerce in facade niches + belfry brass bell
  // Statue 1 in left niche
  leftWallRect(ctx, 32, 56, 1, 4, 2, 6, OUT);
  leftWallRect(ctx, 32, 56, 1, 5, 1, 4, '#eceff1');
  // Statue 2 in right niche
  rightWallRect(ctx, 32, 56, 18, 4, 2, 6, OUT);
  rightWallRect(ctx, 32, 56, 18, 5, 1, 4, '#eceff1');

  // Brass bell in tower belfry
  rect(ctx, 31, 27, 3, 3, '#ffd54f');

  // Pennants flying from roof corners
  rect(ctx, 21, 28, 1, 6, '#37474f');
  rect(ctx, 18, 28, 3, 2, '#c62828');
  rect(ctx, 43, 28, 1, 6, '#37474f');
  rect(ctx, 44, 28, 3, 2, '#c62828');

  if (level === 2) return;

  // L3: Grand neoclassical entrance portico with marble columns + golden dome on clock tower
  // 4 white marble columns flanking entrance stairs
  for (const v of [6, 8, 11, 13]) {
    const colX = 32 + v;
    const colY = 56 - (v >> 1);
    rect(ctx, colX - 1, colY - 10, 2, 11, OUT);
    rect(ctx, colX, colY - 9, 1, 9, '#ffffff');
    px(ctx, colX, colY - 10, '#ffd54f');
  }

  // Golden cupola dome on clock tower
  disc(ctx, 31, 12, 4, OUT);
  disc(ctx, 31, 12, 3, '#ffd54f');
  px(ctx, 31, 8, '#ffffff');
}

// ============================================================================
// MAPS: Wire all 10 third-wave buildings and their level add-ons
// ============================================================================

/** Third-wave shared art (task file .agy/tasks/t25). Each entry returns the animation frames (64x64 canvases). */
export const art3a: Partial<Record<BuildingKind, () => HTMLCanvasElement[]>> = {
  cottage: () => [buildCottageTexture()],
  longhouse: () => [buildLonghouseTexture()],
  tenement: () => [buildTenementTexture()],
  villa: () => [buildVillaTexture()],
  highrise: () => [buildHighriseTexture(0), buildHighriseTexture(1)],
  bakery: () => [buildBakeryTexture(0), buildBakeryTexture(1)],
  teahouse: () => [buildTeahouseTexture()],
  tailor: () => [buildTailorTexture()],
  bazaar: () => [buildBazaarTexture()],
  tradeguild: () => [buildTradeguildTexture()],
};

/** Level 2 / level 3 add-ons for this file's kinds, drawn on a blank 64x64 canvas over the level 1 sprite. */
export const addons3a: Partial<Record<BuildingKind, (ctx: CanvasRenderingContext2D, level: 2 | 3, frame: number) => void>> = {
  cottage: (ctx, level) => drawCottageAddon(ctx, level),
  longhouse: (ctx, level) => drawLonghouseAddon(ctx, level),
  tenement: (ctx, level) => drawTenementAddon(ctx, level),
  villa: (ctx, level) => drawVillaAddon(ctx, level),
  highrise: (ctx, level) => drawHighriseAddon(ctx, level),
  bakery: (ctx, level) => drawBakeryAddon(ctx, level),
  teahouse: (ctx, level) => drawTeahouseAddon(ctx, level),
  tailor: (ctx, level) => drawTailorAddon(ctx, level),
  bazaar: (ctx, level) => drawBazaarAddon(ctx, level),
  tradeguild: (ctx, level) => drawTradeguildAddon(ctx, level),
};
