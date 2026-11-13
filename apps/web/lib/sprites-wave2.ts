import type { ArcId } from '@metropolix/sim';
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

const ROWHOUSE_PALETTES = [
  { top: '#f0c999', left: '#a87042', right: '#d99a60', roofL: '#8f322a', roofR: '#c2473b', ridge: '#e06758' },
  { top: '#f5d6ad', left: '#9e6238', right: '#c98a52', roofL: '#7a2b24', roofR: '#ad3d32', ridge: '#d45a4e' },
  { top: '#ebd5b3', left: '#b07d4f', right: '#deb07c', roofL: '#8f322a', roofR: '#c2473b', ridge: '#e06758' },
] as const;

const STALL_POLES: readonly (readonly [number, number])[] = [
  [20, 43], // back-left pole
  [45, 42], // back-right pole
  [34, 36], // far-back pole
  [30, 49], // front pole
];

const CLINIC_POTS: readonly (readonly [number, number, string])[] = [
  [36, 57, '#66bb6a'],
  [40, 55, '#80deea'], // moonleaf herb
  [44, 53, '#66bb6a'],
];

const WORKSHOP_PUFFS: readonly (readonly (readonly [number, number, number, number])[])[] = [
  [
    [20, 21, 3, 2],
    [22, 17, 3, 2],
  ],
  [
    [21, 19, 3, 2],
    [23, 15, 4, 2],
  ],
  [
    [20, 22, 2, 2],
    [21, 18, 3, 2],
    [24, 14, 3, 2],
  ],
];

/**
 * Draw Row Houses (residential): 3 narrow joined terrace homes in a row along the right-up axis,
 * with individual doors, two storeys of windows, stepped party walls, and 3 small chimneys.
 */
export function buildRowhouseTexture(): HTMLCanvasElement {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  // Paved residential street & garden border pad
  isoDiamond(ctx, 32, 48, 28, '#486e4d', '#243c29');
  isoDiamond(ctx, 32, 48, 25, '#7d786d', OUT);

  // 3 narrow joined rowhouses stepping along the right-up (v) axis.
  // Total footprint: wL = 16, wR = 24 (3 units of wR = 8 each), front-bottom at (30, 58).
  const fx = 30;
  const fy = 58;
  const wL = 16;
  const unitR = 8;
  const totalR = unitR * 3;
  const wallH = 15;

  // Shared stone foundation course across all 3 joined units
  isoBox(ctx, fx, fy, wL, totalR, 2, {
    top: '#8c877c',
    left: '#54514a',
    right: '#6e6a61',
  });

  // Draw the 3 joined terrace units back-to-front (unit 2 = back-right, unit 1 = middle, unit 0 = front-left)
  for (let i = 2; i >= 0; i--) {
    const uFx = fx + i * unitR;
    const uFy = fy - ((i * unitR) >> 1);
    const pal = ROWHOUSE_PALETTES[i]!;
    const unitH = i === 1 ? wallH + 1 : wallH; // Slight 1px step on middle terrace for distinct row silhouette

    isoBox(ctx, uFx, uFy - 2, wL, unitR, unitH - 2, {
      top: pal.top,
      left: pal.left,
      right: pal.right,
    });

    // Timber stringcourse between ground and upper floor on right wall
    rightWallRect(ctx, uFx, uFy, 0, 8, unitR, 1, '#5b341f');

    // Front door on right wall (ground floor) + stone doorstep
    rightWallRect(ctx, uFx, uFy, 1, 1, 3, 6, OUT);
    rightWallRect(ctx, uFx, uFy, 2, 1, 1, 5, i === 1 ? '#7d3229' : '#6b3e26');
    rightWallRect(ctx, uFx, uFy, 1, 0, 3, 1, '#b0aba0');

    // Ground floor parlor window next to door
    rightWallRect(ctx, uFx, uFy, 5, 3, 2, 4, OUT);
    rightWallRect(ctx, uFx, uFy, 5, 4, 2, 2, '#9be7ff');

    // Two upper-storey bedroom windows on right wall
    for (const vOff of [1, 5]) {
      rightWallRect(ctx, uFx, uFy, vOff, 10, 2, 4, OUT);
      rightWallRect(ctx, uFx, uFy, vOff, 11, 2, 2, '#9be7ff');
      rightWallRect(ctx, uFx, uFy, vOff, 12, 1, 1, '#e0f7ff');
    }

    // Individual pitched roof per terrace unit
    isoPitchedRoof(ctx, uFx, uFy, wL + 2, unitR + 1, unitH, 7, {
      leftSlope: pal.roofL,
      rightSlope: pal.roofR,
      gable: '#9e6e44',
      ridge: pal.ridge,
    });

    // Small brick chimney pot on each unit's ridge
    isoBox(ctx, uFx - 5 + (unitR >> 1), uFy - unitH - 8, 2, 2, 4, {
      top: '#a84a42',
      left: '#632622',
      right: '#873630',
    });
  }

  // Shaded left gable end wall details (on unit 0, the frontmost unit)
  leftWallRect(ctx, fx, fy, 1, 8, wL - 2, 1, '#5b341f');
  for (const u0 of [3, 10]) {
    leftWallRect(ctx, fx, fy, u0, 3, 3, 4, OUT);
    leftWallRect(ctx, fx, fy, u0 + 1, 4, 1, 2, '#6ec5e8');
    leftWallRect(ctx, fx, fy, u0, 10, 3, 4, OUT);
    leftWallRect(ctx, fx, fy, u0 + 1, 11, 1, 2, '#6ec5e8');
  }

  return canvas;
}

/**
 * Draw a Manor (residential): grand detached estate with front garden wall & hedge,
 * columned entrance porch, tall corner turret with pointed spire, chimney, and rich stone quoin trim.
 */
export function buildManorTexture(): HTMLCanvasElement {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  // Manicured estate lawn & cobblestone courtyard pad
  isoDiamond(ctx, 32, 48, 30, '#366b3f', OUT);
  isoDiamond(ctx, 32, 48, 25, '#8c8476', '#4a453d');

  // Main manor hall body (set slightly back to leave room for porch & front garden wall)
  const fx = 31;
  const fy = 54;
  const wL = 18;
  const wR = 20;
  const wallH = 16;

  // Dressed stone plinth base
  isoBox(ctx, fx, fy, wL, wR, 3, {
    top: '#9c9488',
    left: '#5c564e',
    right: '#7d756b',
  });

  // Rich warm terracotta-rose & cream plaster walls
  isoBox(ctx, fx, fy - 3, wL, wR, wallH - 3, {
    top: '#f2dcc2',
    left: '#8a4b32',
    right: '#b06a4a',
  });

  // Cream stone belt course & roof cornice trim
  leftWallRect(ctx, fx, fy, 1, 8, wL - 2, 1, '#c9bda6');
  rightWallRect(ctx, fx, fy, 1, 8, wR - 2, 1, '#ede3cc');
  leftWallRect(ctx, fx, fy, 1, wallH - 2, wL - 2, 2, '#c9bda6');
  rightWallRect(ctx, fx, fy, 1, wallH - 2, wR - 2, 2, '#ede3cc');

  // Stone corner quoins on front-center vertical edge
  for (const z of [4, 6, 10, 12]) {
    leftWallRect(ctx, fx, fy, 0, z, 2, 1, '#c9bda6');
    rightWallRect(ctx, fx, fy, 0, z, 2, 1, '#ede3cc');
  }

  // Tall mullioned windows on left (shaded) wall
  for (const u0 of [4, 11]) {
    leftWallRect(ctx, fx, fy, u0, 4, 4, 4, OUT);
    leftWallRect(ctx, fx, fy, u0 + 1, 5, 2, 2, '#72c5e8');
    leftWallRect(ctx, fx, fy, u0, 10, 4, 4, OUT);
    leftWallRect(ctx, fx, fy, u0 + 1, 11, 2, 2, '#ffe082');
  }

  // Upper floor & side windows on right wall
  for (const v0 of [3, 9, 14]) {
    rightWallRect(ctx, fx, fy, v0, 10, 4, 4, OUT);
    rightWallRect(ctx, fx, fy, v0 + 1, 11, 2, 2, '#ffe082');
    rightWallRect(ctx, fx, fy, v0 + 1, 12, 1, 1, '#fff8e1');
  }
  rightWallRect(ctx, fx, fy, 13, 3, 5, 5, OUT);
  rightWallRect(ctx, fx, fy, 14, 4, 3, 3, '#a8ecff');

  // Steep burgundy-red manor gable roof with gold ridge cresting
  isoPitchedRoof(ctx, fx, fy, wL + 2, wR + 2, wallH, 9, {
    leftSlope: '#691e22',
    rightSlope: '#962d32',
    gable: '#7a422c',
    ridge: '#ffd54f',
  });

  // Tall octagonal/square corner turret on the back-left/center wing
  const tFx = 24;
  const tFy = 43;
  const tW = 7;
  const tH = 22;
  isoBox(ctx, tFx, tFy, tW, tW, tH, {
    top: '#f2dcc2',
    left: '#7d432c',
    right: '#a85f40',
  });
  // Turret stone band & arched lancet window
  leftWallRect(ctx, tFx, tFy, 1, 13, tW - 2, 1, '#c9bda6');
  rightWallRect(ctx, tFx, tFy, 1, 13, tW - 2, 1, '#ede3cc');
  rightWallRect(ctx, tFx, tFy, 2, 15, 3, 5, OUT);
  rightWallRect(ctx, tFx, tFy, 3, 16, 1, 3, '#ffe082');
  leftWallRect(ctx, tFx, tFy, 2, 15, 3, 5, OUT);
  leftWallRect(ctx, tFx, tFy, 3, 16, 1, 3, '#72c5e8');

  // Steep pointed spire roof atop the turret (rising to y ~ 8)
  const spireBaseY = tFy - tH - 3;
  for (let dy = 0; dy < 10; dy++) {
    const halfSpan = Math.max(1, 5 - (dy >> 1));
    const y = spireBaseY - dy;
    rect(ctx, tFx - halfSpan - 1, y, halfSpan * 2 + 2, 1, OUT);
    rect(ctx, tFx - halfSpan, y, halfSpan, 1, '#5e191d');
    rect(ctx, tFx, y, halfSpan, 1, '#962d32');
  }
  rect(ctx, tFx - 1, spireBaseY - 12, 2, 3, '#ffd54f'); // golden weathervane finial

  // Tall brick chimney on the back-right roof slope
  isoBox(ctx, 37, 29, 3, 3, 8, {
    top: '#8c3b32',
    left: '#54211b',
    right: '#732f27',
  });
  isoBox(ctx, 37, 21, 4, 4, 2, {
    top: '#ede3cc',
    left: '#9c9488',
    right: '#cfc6b8',
  });

  // Projecting columned entrance porch on the front-right wall
  const pFx = 36;
  const pFy = 54;
  isoBox(ctx, pFx, pFy, 4, 7, 8, {
    top: '#ede3cc',
    left: '#9c9488',
    right: '#cfc6b8',
  });
  isoPitchedRoof(ctx, pFx, pFy, 6, 8, 8, 4, {
    leftSlope: '#691e22',
    rightSlope: '#962d32',
    gable: '#cfc6b8',
    ridge: '#ffd54f',
  });
  // Double oak manor doors inside porch
  rightWallRect(ctx, pFx, pFy, 1, 1, 5, 6, OUT);
  rightWallRect(ctx, pFx, pFy, 2, 1, 3, 5, '#5b341f');
  rightWallRect(ctx, pFx, pFy, 3, 3, 1, 1, '#ffd54f');

  // Front garden stone wall & clipped hedge along the foreground perimeter
  isoBox(ctx, 32, 60, 15, 2, 4, {
    top: '#b0a89c',
    left: '#635e56',
    right: '#878076',
  });
  isoBox(ctx, 32, 60, 2, 14, 3, {
    top: '#4caf50',
    left: '#1e5c24',
    right: '#2e7d32',
  });
  // Stone gate piers at the front corner
  isoBox(ctx, 33, 61, 3, 3, 6, {
    top: '#ede3cc',
    left: '#7d756b',
    right: '#b0a89c',
  });

  return canvas;
}

/**
 * Draw a Market Stall (commerce): low open-air wooden booth (~0.6 tile tall)
 * with 4 corner poles, a sloped striped cloth canopy, and colorful goods displayed on a counter.
 */
export function buildStallTexture(): HTMLCanvasElement {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  // Open cobblestone market square pad
  isoDiamond(ctx, 32, 48, 26, '#7b848c', OUT);
  isoDiamond(ctx, 32, 48, 22, '#929ba3', '#525960');

  // Low wooden market counter in the center of the plaza (wL = 12, wR = 16, h = 5)
  const fx = 31;
  const fy = 54;
  const wL = 12;
  const wR = 16;
  const counterH = 5;

  isoBox(ctx, fx, fy, wL, wR, counterH, {
    top: '#e0b06c',
    left: '#6e4220',
    right: '#9c6032',
  });

  // Decorative cloth apron hanging along the front-right of the counter
  rightWallRect(ctx, fx, fy, 1, 2, wR - 2, 2, '#c94a38');
  rightWallRect(ctx, fx, fy, 1, 1, wR - 2, 1, '#ffd54f');

  // Colorful displayed wares & produce boxes on top of the counter
  // Crate 1: red apples/berries
  isoBox(ctx, 29, 46, 4, 4, 2, {
    top: '#ef5350',
    left: '#8c271e',
    right: '#c62828',
  });
  // Crate 2: golden grain/cheeses
  isoBox(ctx, 33, 44, 4, 4, 2, {
    top: '#ffe082',
    left: '#b28924',
    right: '#f5be36',
  });
  // Crate 3: fresh greens & herbs
  isoBox(ctx, 37, 42, 4, 4, 2, {
    top: '#81c784',
    left: '#2e7d32',
    right: '#4caf50',
  });

  // Four slim timber support poles rising from the counter corners (total booth height ~10px)
  const poleH = 8;
  for (const [px0, py0] of STALL_POLES) {
    rect(ctx, px0, py0 - poleH, 2, poleH + 1, OUT);
    rect(ctx, px0, py0 - poleH, 1, poleH, '#7d4e28');
  }

  // Sloped gold, cream & crimson striped canvas awning supported by the 4 poles
  const canopyFy = fy - counterH - poleH + 2;
  for (let v = -1; v <= wR; v++) {
    const stripe = ((v + 2) >> 1) % 3;
    const colTop = stripe === 0 ? '#e0b04a' : stripe === 1 ? '#fff8eb' : '#d94b3d';
    const colShade = stripe === 0 ? '#b58420' : stripe === 1 ? '#d4cbb8' : '#962d22';
    for (let u = -1; u <= wL; u++) {
      // Gently sloped awning: higher toward the front-right (u=0), lower toward the back-left (u=wL)
      const slopeDrop = u >> 2;
      const x = fx - 1 - u + v;
      const y = canopyFy - ((u + v + 1) >> 1) + slopeDrop;
      const isEdge = u === -1 || u === wL || v === -1 || v === wR;
      px(ctx, x, y, isEdge ? OUT : u > (wL >> 1) ? colShade : colTop);
      // Scalloped front valance along u = -1 and v = -1
      if (u === -1 && v >= 0 && v < wR) {
        rect(ctx, x, y + 1, 1, 2, colTop);
        px(ctx, x, y + 3, (v & 1) === 0 ? colShade : OUT);
      }
      if (v === -1 && u >= 0 && u < wL) {
        rect(ctx, x, y + 1, 1, 2, colShade);
        px(ctx, x, y + 3, OUT);
      }
    }
  }

  // Extra wooden supply crate & grain sack on the ground in front of the stall
  isoBox(ctx, 41, 51, 4, 4, 3, {
    top: '#d9a066',
    left: '#7d5230',
    right: '#a87042',
  });
  isoBox(ctx, 21, 51, 3, 3, 3, {
    top: '#f5ebd6',
    left: '#9e947d',
    right: '#cfc3a8',
  });

  return canvas;
}

/**
 * Draw a Tavern (commerce): two-storey half-timbered inn with overhanging jettied upper floor,
 * warm amber-lit windows, wooden ale barrels by the door, and a swinging hanging tankard sign.
 */
export function buildTavernTexture(frame = 0): HTMLCanvasElement {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  // Cobblestone & warm packed-earth courtyard pad
  isoDiamond(ctx, 32, 48, 28, '#615445', OUT);
  isoDiamond(ctx, 32, 48, 24, '#7d6e5c', '#42382d');

  // Ground floor stone & timber base (wL = 16, wR = 18, h = 8)
  const fx = 32;
  const fy = 56;
  const gL = 16;
  const gR = 18;
  const gH = 8;

  isoBox(ctx, fx, fy, gL, gR, gH, {
    top: '#a8643a',
    left: '#5c3822',
    right: '#825030',
  });
  // Stone foundation course
  isoBox(ctx, fx, fy, gL, gR, 2, {
    top: '#8c8478',
    left: '#524d46',
    right: '#6e685e',
  });

  // Sturdy arched oak tavern door on right wall
  rightWallRect(ctx, fx, fy, 3, 1, 5, 7, OUT);
  rightWallRect(ctx, fx, fy, 4, 1, 3, 6, '#4a2816');
  rightWallRect(ctx, fx, fy, 6, 3, 1, 1, '#ffd54f'); // brass latch

  // Warm amber-lit tavern common-room window next to door (flickers with frame)
  const glowMain = frame % 2 === 0 ? '#ffc107' : '#ffca28';
  const glowCore = frame % 2 === 0 ? '#ffe082' : '#fff8e1';
  rightWallRect(ctx, fx, fy, 10, 2, 6, 5, OUT);
  rightWallRect(ctx, fx, fy, 11, 3, 4, 3, glowMain);
  rightWallRect(ctx, fx, fy, 12, 4, 2, 2, glowCore);
  rightWallRect(ctx, fx, fy, 13, 3, 1, 3, '#5c3822'); // timber mullion

  // Ground-floor window on shaded left wall
  leftWallRect(ctx, fx, fy, 5, 2, 6, 5, OUT);
  leftWallRect(ctx, fx, fy, 6, 3, 4, 3, '#ffb300');
  leftWallRect(ctx, fx, fy, 7, 4, 2, 1, glowCore);

  // Jettied (overhanging) half-timbered upper storey (wL = 18, wR = 20, h = 8)
  const uFx = 33;
  const uFy = fy - gH + 1;
  const uL = 18;
  const uR = 20;
  const uH = 8;

  isoBox(ctx, uFx, uFy, uL, uR, uH, {
    top: '#f2dec4',
    left: '#ba9d79',
    right: '#e6ccb0',
  });

  // Half-timber framing beams on the upper floor walls
  leftWallRect(ctx, uFx, uFy, 0, 0, uL, 1, '#4a2816');
  rightWallRect(ctx, uFx, uFy, 0, 0, uR, 1, '#5c3822');
  leftWallRect(ctx, uFx, uFy, 0, uH - 1, uL, 1, '#4a2816');
  rightWallRect(ctx, uFx, uFy, 0, uH - 1, uR, 1, '#5c3822');
  for (const vBeam of [0, 6, 13, 19]) {
    rightWallRect(ctx, uFx, uFy, vBeam, 1, 1, uH - 2, '#5c3822');
  }
  for (const uBeam of [0, 8, 17]) {
    leftWallRect(ctx, uFx, uFy, uBeam, 1, 1, uH - 2, '#4a2816');
  }

  // Two warm-lit inn guestroom windows on upper right wall
  for (const v0 of [2, 8, 15]) {
    rightWallRect(ctx, uFx, uFy, v0, 2, 3, 4, OUT);
    rightWallRect(ctx, uFx, uFy, v0 + 1, 3, 1, 2, glowMain);
  }
  // Two warm-lit windows on upper left wall
  for (const u0 of [3, 11]) {
    leftWallRect(ctx, uFx, uFy, u0, 2, 4, 4, OUT);
    leftWallRect(ctx, uFx, uFy, u0 + 1, 3, 2, 2, '#ffb300');
  }

  // Steep dark-chestnut & russet shingle pitched roof over the jettied upper floor
  isoPitchedRoof(ctx, uFx, uFy, uL + 2, uR + 2, uH, 8, {
    leftSlope: '#5e2c1c',
    rightSlope: '#8f442b',
    gable: '#a8643a',
    ridge: '#b85d3d',
  });

  // Stone hearth chimney on the left roof slope
  isoBox(ctx, 24, 31, 3, 3, 6, {
    top: '#8c8478',
    left: '#4a453e',
    right: '#6e685e',
  });

  // Wooden ale barrels stacked by the front door (at right-front of ground floor)
  isoBox(ctx, 39, 55, 3, 3, 4, {
    top: '#c98a52',
    left: '#6e4220',
    right: '#9c6032',
  });
  rect(ctx, 37, 52, 4, 1, '#37474f'); // iron barrel hoop
  isoBox(ctx, 42, 53, 3, 3, 3, {
    top: '#c98a52',
    left: '#6e4220',
    right: '#9c6032',
  });

  // Projecting wrought-iron arm & swinging golden ale-mug sign on the front corner
  const armX = 33;
  const armY = 39;
  rect(ctx, armX, armY, 6, 1, OUT);
  px(ctx, armX + 5, armY - 1, OUT);
  const swing = frame % 2 === 1 ? 1 : 0;
  const signX = armX + 2 + swing;
  const signY = armY + 1;
  px(ctx, armX + 3, signY, OUT); // chain link
  rect(ctx, signX, signY + 1, 4, 4, OUT);
  rect(ctx, signX + 1, signY + 2, 2, 2, '#ffd54f'); // golden ale mug
  rect(ctx, signX + 1, signY + 1, 2, 1, '#fff8eb'); // frothy foam head

  return canvas;
}

/**
 * Draw a Bank (commerce): monumental neoclassical stone & marble treasury hall on a stepped podium,
 * with 4 fluted portico columns, heavy gold-trimmed vault door, barred windows, and rooftop gold coin emblem.
 */
export function buildBankTexture(): HTMLCanvasElement {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  // Polished granite & marble plaza pad
  isoDiamond(ctx, 32, 48, 28, '#545b63', OUT);
  isoDiamond(ctx, 32, 48, 24, '#7a838c', '#3c4147');

  // Stepped granite podium base (wL = 20, wR = 22, h = 3)
  isoBox(ctx, 32, 57, 20, 22, 3, {
    top: '#9ea6ad',
    left: '#52585e',
    right: '#737b82',
  });

  // Main marble & warm sandstone treasury hall (wL = 18, wR = 20, h = 18)
  const fx = 32;
  const fy = 54;
  const wL = 18;
  const wR = 20;
  const wallH = 18;

  isoBox(ctx, fx, fy, wL, wR, wallH, {
    top: '#f2ead8',
    left: '#9e9278',
    right: '#cfc2a6',
  });

  // Rusticated stone course lines on shaded left wall
  for (const z of [4, 8, 12]) {
    leftWallRect(ctx, fx, fy, 1, z, wL - 2, 1, '#7d735e');
  }

  // Tall iron-barred treasury windows on left wall
  for (const u0 of [4, 11]) {
    leftWallRect(ctx, fx, fy, u0, 3, 4, 10, OUT);
    leftWallRect(ctx, fx, fy, u0 + 1, 4, 2, 8, '#72c5e8');
    leftWallRect(ctx, fx, fy, u0 + 1, 8, 2, 1, '#37474f'); // iron bar
  }

  // Heavy bronze & gold bank vault entrance door on right wall (centered at v = 7..12)
  rightWallRect(ctx, fx, fy, 7, 1, 6, 11, OUT);
  rightWallRect(ctx, fx, fy, 8, 1, 4, 10, '#455a64'); // steel vault frame
  rightWallRect(ctx, fx, fy, 9, 2, 2, 8, '#d8c27a'); // gilded bronze doors
  rightWallRect(ctx, fx, fy, 9, 5, 2, 2, '#ffd54f'); // golden vault wheel lock

  // Flanking treasury windows on right wall (behind columns)
  for (const v0 of [3, 14]) {
    rightWallRect(ctx, fx, fy, v0, 4, 3, 8, OUT);
    rightWallRect(ctx, fx, fy, v0 + 1, 5, 1, 6, '#a8ecff');
  }

  // 4 tall fluted marble portico columns standing proud along the right facade
  for (const vCol of [1, 6, 13, 18]) {
    const cx = fx + vCol;
    const cyBot = fy - (vCol >> 1);
    rect(ctx, cx - 1, cyBot - 14, 3, 15, OUT);
    rect(ctx, cx, cyBot - 13, 1, 13, '#fff9eb'); // sunlit column shaft
    rect(ctx, cx - 1, cyBot - 14, 3, 1, '#ffd54f'); // gilded Corinthian capital
    rect(ctx, cx - 1, cyBot - 1, 3, 1, '#d8c27a'); // column base
  }

  // Rich golden entablature & frieze band crowning the walls
  isoBox(ctx, fx, fy - (wallH - 3), wL, wR, 3, {
    top: '#ffe082',
    left: '#b58d28',
    right: '#e6b83c',
  });

  // Stepped steel-and-stone vault roof deck atop the hall
  isoBox(ctx, 31, fy - wallH - 2, 12, 14, 4, {
    top: '#78909c',
    left: '#37474f',
    right: '#546e7a',
  });

  // Prominent embossed golden coin sign mounted above the front portico
  const coinX = 36;
  const coinY = 30;
  disc(ctx, coinX, coinY, 5, OUT);
  disc(ctx, coinX, coinY, 4, '#f59e0b');
  disc(ctx, coinX, coinY, 3, '#ffd54f');
  rect(ctx, coinX, coinY - 2, 1, 5, '#b45309'); // vertical coin stamp bar
  px(ctx, coinX - 1, coinY - 2, '#fff8e1'); // specular gold glint

  return canvas;
}

/**
 * Draw a Library (services): modest scholarly limestone hall with slate-blue roof,
 * tall arched reading-room windows, stone entrance steps, and an open-book plaque sign.
 */
export function buildLibraryTexture(): HTMLCanvasElement {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  // Quiet stone courtyard & clipped hedge border pad
  isoDiamond(ctx, 32, 48, 26, '#3b6944', OUT);
  isoDiamond(ctx, 32, 48, 22, '#8a8579', '#4a463f');

  const fx = 32;
  const fy = 56;
  const wL = 16;
  const wR = 20;
  const wallH = 13;

  // Stone base plinth
  isoBox(ctx, fx, fy, wL, wR, 2, {
    top: '#9e9789',
    left: '#59554d',
    right: '#787267',
  });

  // Warm limestone & indigo-trimmed scholarly hall walls
  isoBox(ctx, fx, fy - 2, wL, wR, wallH - 2, {
    top: '#ebe4d3',
    left: '#99907c',
    right: '#cfc5b0',
  });

  // Slate-blue frieze band along the top of the walls
  leftWallRect(ctx, fx, fy, 1, wallH - 2, wL - 2, 2, '#52649c');
  rightWallRect(ctx, fx, fy, 1, wallH - 2, wR - 2, 2, '#7a8cc8');

  // Entrance door on front-right wall + stone reading-room steps
  rightWallRect(ctx, fx, fy, 2, 1, 5, 8, OUT);
  rightWallRect(ctx, fx, fy, 3, 1, 3, 7, '#5c3822');
  rightWallRect(ctx, fx, fy, 2, 9, 5, 1, '#7a8cc8'); // blue stone lintel
  isoBox(ctx, 35, 56, 2, 5, 1, {
    top: '#cfc5b0',
    left: '#787267',
    right: '#9e9789',
  });

  // Two tall arched reading-room windows on right wall with warm lamp glow at bottom
  for (const v0 of [9, 14]) {
    rightWallRect(ctx, fx, fy, v0, 2, 4, 9, OUT);
    rightWallRect(ctx, fx, fy, v0 + 1, 5, 2, 5, '#a8ecff');
    rightWallRect(ctx, fx, fy, v0 + 1, 3, 2, 2, '#ffe082'); // reading desk lamp glow
    rightWallRect(ctx, fx, fy, v0 + 1, 7, 2, 1, OUT); // window transoms
  }

  // Two tall arched windows on shaded left wall
  for (const u0 of [3, 10]) {
    leftWallRect(ctx, fx, fy, u0, 2, 4, 9, OUT);
    leftWallRect(ctx, fx, fy, u0 + 1, 5, 2, 5, '#72c5e8');
    leftWallRect(ctx, fx, fy, u0 + 1, 3, 2, 2, '#ffd54f');
    leftWallRect(ctx, fx, fy, u0 + 1, 7, 2, 1, OUT);
  }

  // Pitched slate-indigo roof
  isoPitchedRoof(ctx, fx, fy, wL + 2, wR + 2, wallH, 7, {
    leftSlope: '#455587',
    rightSlope: '#687db8',
    gable: '#7d7564',
    ridge: '#9ab0eb',
  });

  // Prominent Open-Book & Scroll emblem sign mounted above the entrance on the right roof eave
  const bx = 33;
  const by = 37;
  rect(ctx, bx, by, 9, 6, OUT);
  rect(ctx, bx + 1, by + 1, 3, 4, '#fff8eb'); // left open page
  rect(ctx, bx + 5, by + 1, 3, 4, '#f2ead8'); // right open page
  rect(ctx, bx + 4, by + 1, 1, 4, '#c99c2e'); // golden book spine
  px(ctx, bx + 2, by + 2, '#52649c'); // tiny text lines on left page
  px(ctx, bx + 2, by + 4, '#52649c');
  px(ctx, bx + 6, by + 2, '#52649c'); // tiny text lines on right page
  px(ctx, bx + 6, by + 4, '#52649c');
  rect(ctx, bx + 5, by + 5, 2, 2, '#e53935'); // red bookmark ribbon

  return canvas;
}

/**
 * Draw an Academy (services): the tallest service building, featuring a grand stone & violet hall,
 * tiled front courtyard, waving royal banners, drum rotunda, and a soaring ribbed dome + spire finial.
 */
export function buildAcademyTexture(frame = 0): HTMLCanvasElement {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  // Grand patterned courtyard & lawn border pad
  isoDiamond(ctx, 32, 48, 30, '#366842', OUT);
  isoDiamond(ctx, 32, 48, 26, '#8f8799', '#494352');
  isoDiamond(ctx, 32, 50, 18, '#b5adc2', '#6a6275'); // inner mosaic courtyard

  // Main quadrangle hall (set slightly back to showcase front courtyard)
  const fx = 31;
  const fy = 54;
  const wL = 18;
  const wR = 20;
  const wallH = 16;

  // Purple-slate plinth base
  isoBox(ctx, fx, fy, wL, wR, 3, {
    top: '#8f82ab',
    left: '#4d4361',
    right: '#6c5f87',
  });

  // Pale marble & lavender-stone hall walls
  isoBox(ctx, fx, fy - 3, wL, wR, wallH - 3, {
    top: '#ebe6f5',
    left: '#9386b0',
    right: '#c4b8e0',
  });

  // Golden cornice & frieze band at top of hall
  isoBox(ctx, fx, fy - (wallH - 2), wL, wR, 2, {
    top: '#ffe082',
    left: '#b58d28',
    right: '#e6b83c',
  });

  // Grand arched academy portal on right wall
  rightWallRect(ctx, fx, fy, 7, 1, 6, 10, OUT);
  rightWallRect(ctx, fx, fy, 8, 1, 4, 9, '#3b2854');
  rightWallRect(ctx, fx, fy, 9, 2, 2, 7, '#ffd54f'); // gilded inner portal trim

  // Flanking royal purple & gold hanging banners on right wall (sway with frame)
  const bannerDrop = frame % 2 === 1 ? 1 : 0;
  for (const vBan of [2, 15]) {
    rightWallRect(ctx, fx, fy, vBan, 4 - bannerDrop, 4, 9, OUT);
    rightWallRect(ctx, fx, fy, vBan + 1, 5 - bannerDrop, 2, 7, '#7e57c2');
    rightWallRect(ctx, fx, fy, vBan + 1, 8 - bannerDrop, 2, 2, '#ffd54f');
  }

  // Tall arched clerestory windows on shaded left wall
  for (const u0 of [3, 9, 14]) {
    leftWallRect(ctx, fx, fy, u0, 4, 3, 9, OUT);
    leftWallRect(ctx, fx, fy, u0 + 1, 5, 1, 7, '#80d8ff');
  }

  // Elevated drum rotunda on the center of the roof
  const dFx = 31;
  const dFy = 31;
  const dW = 10;
  const dH = 6;
  isoBox(ctx, dFx, dFy, dW, dW, dH, {
    top: '#d7cce8',
    left: '#7a6b99',
    right: '#a898c9',
  });
  // Golden ring at base of dome
  isoBox(ctx, dFx, dFy - dH + 1, dW, dW, 1, {
    top: '#ffe082',
    left: '#b58d28',
    right: '#e6b83c',
  });

  // Soaring ribbed amethyst dome rising from y = 21 up to y = 10
  const domeCx = 31;
  const domeBaseY = 21;
  const domeR = 9;
  for (let dy = 0; dy <= domeR; dy++) {
    const span = Math.max(1, Math.round(Math.sqrt(Math.max(0, domeR * domeR - dy * dy))));
    const y = domeBaseY - dy;
    rect(ctx, domeCx - span - 1, y, (span + 1) * 2, 1, OUT);
    // Shaded left half vs sunlit right half + top-left specular highlight
    rect(ctx, domeCx - span, y, span, 1, '#6a4ca8');
    rect(ctx, domeCx, y, span, 1, '#9a7ad8');
    if (dy >= 3 && dy <= 7 && span >= 3) {
      rect(ctx, domeCx - span + 1, y, Math.max(1, span - 2), 1, '#c4aee8');
    }
    // Central golden meridian rib
    px(ctx, domeCx, y, '#ffd54f');
  }

  // Tall golden observatory spire & celestial finial atop the dome (reaches y = 3)
  rect(ctx, domeCx - 1, domeBaseY - domeR - 6, 3, 6, OUT);
  rect(ctx, domeCx, domeBaseY - domeR - 6, 1, 6, '#ffd54f');
  if (frame % 2 === 0) {
    rect(ctx, domeCx - 2, domeBaseY - domeR - 5, 5, 1, '#fff8e1');
    px(ctx, domeCx, domeBaseY - domeR - 7, '#fff8e1');
  } else {
    rect(ctx, domeCx - 1, domeBaseY - domeR - 6, 3, 3, '#ffe082');
    px(ctx, domeCx, domeBaseY - domeR - 5, '#ffffff');
  }

  // Front courtyard entrance pillars & waving banner standard
  isoBox(ctx, 24, 59, 3, 3, 5, {
    top: '#ebe6f5',
    left: '#7a6b99',
    right: '#b8aad6',
  });
  isoBox(ctx, 38, 59, 3, 3, 5, {
    top: '#ebe6f5',
    left: '#7a6b99',
    right: '#b8aad6',
  });
  // Courtyard banner pole at front-right
  const poleX = 42;
  const poleY = 44;
  rect(ctx, poleX, poleY, 1, 13, OUT);
  px(ctx, poleX, poleY - 1, '#ffd54f');
  rect(ctx, poleX + 1, poleY + 1 + bannerDrop, 5, 4, OUT);
  rect(ctx, poleX + 1, poleY + 2 + bannerDrop, 4, 2, '#9a7ad8');
  px(ctx, poleX + 2, poleY + 2 + bannerDrop, '#ffd54f');

  return canvas;
}

/**
 * Draw a Clinic (services): clean pale apothecary/infirmary pavilion with sage-green roof,
 * prominent red-and-white healing cross emblem, and terracotta medicinal herb pots in front.
 */
export function buildClinicTexture(): HTMLCanvasElement {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  // Clean pale flagstones & medicinal herb garden border pad
  isoDiamond(ctx, 32, 48, 28, '#3d7050', OUT);
  isoDiamond(ctx, 32, 48, 24, '#a6b0ab', '#525c57');

  const fx = 31;
  const fy = 55;
  const wL = 16;
  const wR = 18;
  const wallH = 14;

  // Clean sage-stone plinth base
  isoBox(ctx, fx, fy, wL, wR, 2, {
    top: '#80a693',
    left: '#3b5e4c',
    right: '#59856e',
  });

  // Crisp pale cream/whitewashed infirmary walls
  isoBox(ctx, fx, fy - 2, wL, wR, wallH - 2, {
    top: '#faf7f0',
    left: '#b8b2a2',
    right: '#e8e2d0',
  });

  // Seafoam-green hygienic stripe band along the upper wall
  leftWallRect(ctx, fx, fy, 1, wallH - 3, wL - 2, 1, '#3b7a57');
  rightWallRect(ctx, fx, fy, 1, wallH - 3, wR - 2, 1, '#52a376');

  // Clean white & glass double clinic doors on right wall
  rightWallRect(ctx, fx, fy, 2, 1, 5, 8, OUT);
  rightWallRect(ctx, fx, fy, 3, 1, 3, 7, '#d7f2e6');
  rightWallRect(ctx, fx, fy, 4, 4, 1, 3, '#4fc3f7'); // glass door pane

  // Bright ward windows on right wall
  for (const v0 of [9, 13]) {
    rightWallRect(ctx, fx, fy, v0, 4, 4, 6, OUT);
    rightWallRect(ctx, fx, fy, v0 + 1, 5, 2, 4, '#b3e5fc');
    rightWallRect(ctx, fx, fy, v0 + 1, 7, 1, 2, '#ffffff');
  }

  // Two bright windows on shaded left wall
  for (const u0 of [3, 10]) {
    leftWallRect(ctx, fx, fy, u0, 4, 4, 6, OUT);
    leftWallRect(ctx, fx, fy, u0 + 1, 5, 2, 4, '#81d4fa');
  }

  // Pitched sage-emerald roof
  isoPitchedRoof(ctx, fx, fy, wL + 2, wR + 2, wallH, 8, {
    leftSlope: '#2e6b4e',
    rightSlope: '#43946d',
    gable: '#cfc8b6',
    ridge: '#76d1a4',
  });

  // Prominent white gable plaque with Red Healing Cross above the clinic entrance
  const cx = 34;
  const cy = 34;
  rect(ctx, cx, cy, 7, 7, OUT);
  rect(ctx, cx + 1, cy + 1, 5, 5, '#ffffff');
  rect(ctx, cx + 3, cy + 1, 1, 5, '#e53935'); // vertical bar of red cross
  rect(ctx, cx + 1, cy + 3, 5, 1, '#e53935'); // horizontal bar of red cross

  // Terracotta medicinal herb planters (with green & moonleaf-cyan herbs) along the front walk
  for (const [px0, py0, leafCol] of CLINIC_POTS) {
    isoBox(ctx, px0, py0, 3, 3, 2, {
      top: '#d96b43',
      left: '#87381d',
      right: '#b84f2b',
    });
    // Medicinal herb leaves sprouting from each pot
    rect(ctx, px0 - 2, py0 - 5, 3, 2, '#1b5e20');
    rect(ctx, px0 - 1, py0 - 6, 2, 2, leafCol);
    px(ctx, px0, py0 - 7, '#e0f7fa');
  }

  return canvas;
}

/**
 * Draw a Workshop (industry): open-front artisan work yard with a plum-roofed craft shed,
 * stone kiln chimney, timber jib crane, outdoor tool bench, stacked crates of goods, and 3-frame animation.
 */
export function buildWorkshopTexture(frame = 0): HTMLCanvasElement {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  // Flagstone & timber artisan work-yard pad
  isoDiamond(ctx, 32, 48, 28, '#4f4842', OUT);
  isoDiamond(ctx, 32, 48, 24, '#6e655c', '#38332e');

  // Compact artisan shed on the back-left of the yard (leaving front-right as an open work yard)
  const fx = 27;
  const fy = 50;
  const wL = 12;
  const wR = 14;
  const wallH = 12;

  // Stone base + warm timber & plaster shed walls
  isoBox(ctx, fx, fy, wL, wR, wallH, {
    top: '#d9a773',
    left: '#734b28',
    right: '#a66f3f',
  });
  isoBox(ctx, fx, fy, wL, wR, 2, {
    top: '#807a73',
    left: '#4a4642',
    right: '#66615b',
  });

  // Wide open workshop bay on right wall facing the work yard
  rightWallRect(ctx, fx, fy, 2, 1, 6, 8, OUT);
  rightWallRect(ctx, fx, fy, 3, 1, 4, 7, '#291d17');
  // Glowing forge/kiln hearth inside the shed bay (pulses across frames 0..2)
  const hearthCol = frame === 0 ? '#ff6d00' : frame === 1 ? '#ffab00' : '#ffd54f';
  rightWallRect(ctx, fx, fy, 4, 2, 2, 3, hearthCol);

  // Tool rack window on right wall
  rightWallRect(ctx, fx, fy, 9, 4, 4, 5, OUT);
  rightWallRect(ctx, fx, fy, 10, 5, 2, 3, '#ffd56b');

  // Window on shaded left wall
  leftWallRect(ctx, fx, fy, 4, 4, 5, 5, OUT);
  leftWallRect(ctx, fx, fy, 5, 5, 3, 3, '#72c5e8');

  // Pitched plum-slate roof (matching Workshop #8a6a9a identity)
  isoPitchedRoof(ctx, fx, fy, wL + 2, wR + 2, wallH, 6, {
    leftSlope: '#5c436b',
    rightSlope: '#8a6a9a',
    gable: '#7d5230',
    ridge: '#b594c7',
  });

  // Stone kiln chimney on the back-left corner of the shed
  const cFx = 21;
  const cFy = 35;
  isoBox(ctx, cFx, cFy, 4, 4, 11, {
    top: '#525861',
    left: '#3f3847',
    right: '#635970',
  });

  // 3-frame animated craft smoke wisps rising from the kiln chimney
  const puffs = WORKSHOP_PUFFS[frame % 3]!;
  for (const [px0, py0, pw, ph] of puffs) {
    rect(ctx, px0 - 1, py0, pw + 2, ph, '#5e4f6b');
    rect(ctx, px0, py0 - 1, pw, ph + 1, '#a995ba');
    px(ctx, px0, py0, '#e6daf0');
  }

  // Timber jib crane mounted on the front-right corner of the shed, extending over the yard
  const mastX = 33;
  const mastY = 30;
  rect(ctx, mastX, mastY, 2, 15, OUT);
  rect(ctx, mastX, mastY, 1, 15, '#8d5a2b'); // vertical crane mast
  rect(ctx, mastX, mastY + 1, 9, 2, OUT);
  rect(ctx, mastX + 1, mastY + 1, 7, 1, '#b87a3d'); // horizontal jib arm
  // Hoist cable & suspended good (shifts height with frame)
  const ropeLen = 4 + (frame % 3);
  rect(ctx, mastX + 7, mastY + 3, 1, ropeLen, OUT);
  rect(ctx, mastX + 6, mastY + 3 + ropeLen, 3, 3, OUT);
  rect(ctx, mastX + 7, mastY + 4 + ropeLen, 1, 1, '#ffd54f');

  // Artisan tool bench in the open foreground yard (front-bottom at (32, 57))
  isoBox(ctx, 32, 57, 5, 9, 4, {
    top: '#e0ad6d',
    left: '#6e4220',
    right: '#9c6032',
  });
  // Special good & tools on the workbench top (glints with frame)
  rect(ctx, 31, 50, 3, 2, '#8a6a9a');
  px(ctx, 32 + (frame % 2), 50, '#ffd54f');
  rect(ctx, 35, 49, 2, 1, '#cfd8dc'); // steel hand tool

  // Stacked wooden crates of finished goods in the right yard corner
  isoBox(ctx, 42, 53, 5, 5, 4, {
    top: '#c98a52',
    left: '#6e4220',
    right: '#9c6032',
  });
  isoBox(ctx, 41, 49, 4, 4, 3, {
    top: '#b594c7',
    left: '#5c436b',
    right: '#8a6a9a',
  });

  return canvas;
}

export const BADGE_W = 20;
export const BADGE_H = 10;

/**
 * Build a crisp pixel-art upgrade badge for building levels 2 and 3.
 * Level 2: dark slate pill with 2 gleaming gold chevrons/pips.
 * Level 3: gold-trimmed dark pill with 2 flanking gold pips and a bright central star.
 */
export function buildBadgeTexture(level: 2 | 3): HTMLCanvasElement {
  const [canvas, ctx] = makeCanvas(BADGE_W, BADGE_H);
  // Rank pips, no plate: level 2 shows two gold diamonds, level 3 three (the middle one larger and brighter).
  // (The old dark plate with two gold blobs read as a pair of eyes at a glance.)
  const pip = (cx: number, cy: number, r: number, bright: boolean) => {
    for (let dy = -r - 1; dy <= r + 1; dy++) {
      const w = r + 1 - Math.abs(dy);
      rect(ctx, cx - w, cy + dy, w * 2 + 1, 1, OUT);
    }
    for (let dy = -r; dy <= r; dy++) {
      const w = r - Math.abs(dy);
      rect(ctx, cx - w, cy + dy, w * 2 + 1, 1, dy < 0 ? (bright ? '#fff3c4' : '#ffe082') : dy === 0 ? '#ffd54f' : '#e0a020');
    }
    px(ctx, cx - (r > 1 ? 1 : 0), cy - r + 1, '#ffffff');
  };
  if (level === 2) {
    pip(6, 5, 2, false);
    pip(13, 5, 2, false);
  } else {
    pip(3, 5, 2, false);
    pip(16, 5, 2, false);
    pip(10, 5, 3, true);
  }
  return canvas;
}

interface SoldierStyle {
  skin: string;
  skinDark: string;
  tunic: string;
  armor: string;
  armorLight: string;
  helm: string;
  helmLight: string;
  plume: string;
  shield: string;
  shieldRim: string;
  legs: string;
  eye: string;
}

const SOLDIER_STYLES: Record<ArcId, SoldierStyle> = {
  elf: {
    skin: '#f0d2b0',
    skinDark: '#c9a682',
    tunic: '#25633e',
    armor: '#90a4ae',
    armorLight: '#cfd8dc',
    helm: '#90a4ae',
    helmLight: '#e2e8f0',
    plume: '#ffd54f',
    shield: '#2e7d47',
    shieldRim: '#ffd54f',
    legs: '#344e3a',
    eye: '#1a1a22',
  },
  lizard: {
    skin: '#4fae8a',
    skinDark: '#2f7a5e',
    tunic: '#2a5c6a',
    armor: '#c98a32',
    armorLight: '#f7d454',
    helm: '#b57c28',
    helmLight: '#ffe082',
    plume: '#ef5350',
    shield: '#8c2f24',
    shieldRim: '#f7d454',
    legs: '#26384a',
    eye: '#fff080',
  },
  caveman: {
    skin: '#d9a679',
    skinDark: '#a8784e',
    tunic: '#6e4726',
    armor: '#9c6b3f',
    armorLight: '#c99a6b',
    helm: '#d9cfc0',
    helmLight: '#fff8eb',
    plume: '#e53935',
    shield: '#7d5230',
    shieldRim: '#e8d8b8',
    legs: '#4a3220',
    eye: '#1a1a22',
  },
  dragon: {
    skin: '#b8483c',
    skinDark: '#822c22',
    tunic: '#4a1c24',
    armor: '#4f5661',
    armorLight: '#7d8796',
    helm: '#454c57',
    helmLight: '#909ba8',
    plume: '#ffd54f',
    shield: '#8c221c',
    shieldRim: '#ffd54f',
    legs: '#241822',
    eye: '#ffd34a',
  },
  goblin: {
    skin: '#7fb347',
    skinDark: '#56802b',
    tunic: '#5c3424',
    armor: '#687280',
    armorLight: '#9aa5b4',
    helm: '#5c6673',
    helmLight: '#9aa5b4',
    plume: '#ef5350',
    shield: '#962820',
    shieldRim: '#cfd8dc',
    legs: '#2e2418',
    eye: '#ffe04a',
  },
};

/**
 * Draw a 16x24 patrolling barracks soldier sprite in the city's race palette.
 * Shares the exact 2-view x (4 walk + 1 idle) frame layout of `drawCitizen` so walker logic is shared.
 * Distinct silhouette: crested war-helmet with plume, armored breastplate, emblem shield, and upright spear.
 */
export function drawSoldier(arc: ArcId | null, view: 'front' | 'back', frame: number): HTMLCanvasElement {
  const a: ArcId = arc ?? 'elf';
  const st = SOLDIER_STYLES[a];
  const [c, ctx] = makeCanvas(16, 24);
  const O = (x: number, y: number, w: number, h: number) => rect(ctx, x - 1, y - 1, w + 2, h + 2, OUT);

  const idle = frame >= 4;
  const f = idle ? 0 : frame & 3;
  const liftL = idle ? 0 : [2, 1, 0, 1][f]!;
  const liftR = idle ? 0 : [0, 1, 2, 1][f]!;
  const armL = idle ? 0 : [1, 0, -1, 0][f]!;
  const armR = -armL;
  const bob = idle ? 0 : [0, -1, 0, -1][f]!;

  const legLen = 6;
  const torsoH = 7;
  const tw = 6;
  const legTop = 23 - legLen;
  const torsoTop = legTop - torsoH + bob;
  const headTop = torsoTop - 6;
  const tx = 5;
  const back = view === 'back';

  // Race tail / wings behind body
  if (a === 'lizard' || a === 'dragon') {
    const sway = idle ? 0 : [0, 1, 0, -1][f]!;
    O(10, legTop - 1, 4, 2);
    rect(ctx, 10, legTop - 1, 4, 2, st.skin);
    O(13 + sway, legTop, 2, 2);
    rect(ctx, 13 + sway, legTop, 2, 2, st.skinDark);
  }
  if (a === 'dragon') {
    rect(ctx, 3, torsoTop + 1, 2, 3, '#7a2a24');
    rect(ctx, 11, torsoTop + 1, 2, 3, '#7a2a24');
  }

  // Boots & greaves
  O(6, legTop + liftL, 2, legLen - liftL);
  rect(ctx, 6, legTop + liftL, 2, legLen - liftL, st.legs);
  O(8, legTop + liftR, 2, legLen - liftR);
  rect(ctx, 8, legTop + liftR, 2, legLen - liftR, st.legs);
  rect(ctx, 6, 22, 2, 1, st.armor);
  rect(ctx, 8, 22, 2, 1, st.armor);

  // Arms + armored shoulder pauldrons
  const axL = tx - 2;
  const axR = tx + tw;
  O(axL, torsoTop + 1 + armL, 2, 5);
  rect(ctx, axL, torsoTop + 1 + armL, 2, 5, st.skin);
  rect(ctx, axL, torsoTop + 1 + armL, 2, 2, st.armorLight);
  O(axR, torsoTop + 1 + armR, 2, 5);
  rect(ctx, axR, torsoTop + 1 + armR, 2, 5, st.skin);
  rect(ctx, axR, torsoTop + 1 + armR, 2, 2, st.armor);

  // Upright war-spear in right hand (tall silhouette rising above helmet)
  const spX = axR + 2;
  const spY = torsoTop + armR;
  rect(ctx, spX - 1, spY - 9, 3, 5, OUT);
  rect(ctx, spX, spY - 6, 1, 15, '#6e4726');
  rect(ctx, spX - 1, spY - 8, 3, 3, st.helmLight);
  px(ctx, spX, spY - 9, '#ffffff');

  // Armored torso & war belt
  O(tx, torsoTop, tw, torsoH);
  rect(ctx, tx, torsoTop, tw, torsoH, st.tunic);
  rect(ctx, tx, torsoTop + 1, tw, 4, st.armor);
  rect(ctx, tx, torsoTop + 1, 2, 3, st.armorLight); // top-left sunlit chestplate glint
  rect(ctx, tx, torsoTop + torsoH - 2, tw, 1, st.shieldRim); // war belt

  // Head & race ears
  const hx = 5;
  const hw = 6;
  if (a === 'elf' || a === 'goblin') {
    const ew = a === 'goblin' ? 3 : 2;
    O(hx - ew, headTop + 2, ew, 1);
    rect(ctx, hx - ew, headTop + 2, ew, 1, st.skin);
    O(hx + hw, headTop + 2, ew, 1);
    rect(ctx, hx + hw, headTop + 2, ew, 1, st.skin);
  }
  O(hx, headTop, hw, 6);
  rect(ctx, hx, headTop, hw, 6, st.skin);

  if (!back) {
    const ey = headTop + 3;
    px(ctx, hx + 1, ey, st.eye);
    px(ctx, hx + hw - 2, ey, st.eye);
    if (a === 'caveman') rect(ctx, hx + 1, headTop + 4, hw - 2, 2, '#3a2418');
    else rect(ctx, hx + 2, headTop + 5, 2, 1, st.skinDark);
  }

  // Crested war-helmet with tall plume
  O(hx - 1, headTop - 1, hw + 2, back ? 5 : 3);
  rect(ctx, hx - 1, headTop - 1, hw + 2, back ? 5 : 3, st.helm);
  rect(ctx, hx - 1, headTop - 1, hw + 2, 1, st.helmLight);
  if (!back) rect(ctx, hx + 2, headTop + 2, 2, 2, st.helmLight); // nasal guard
  // Tall helmet plume crest
  O(hx + 2, headTop - 4, 2, 3);
  rect(ctx, hx + 2, headTop - 4, 2, 3, st.plume);
  px(ctx, hx + 2, headTop - 4, '#fff8e1');

  // Emblem shield on the left arm (drawn in front of body for clear silhouette)
  const shX = 1;
  const shY = torsoTop + 1 + armL;
  O(shX, shY, 4, 6);
  rect(ctx, shX, shY, 4, 6, st.shield);
  rect(ctx, shX, shY, 4, 1, st.shieldRim);
  rect(ctx, shX, shY + 5, 4, 1, st.shieldRim);
  rect(ctx, shX + 1, shY + 2, 2, 2, st.shieldRim); // shield boss

  return c;
}

