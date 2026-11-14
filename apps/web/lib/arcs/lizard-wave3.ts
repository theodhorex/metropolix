import type { BuildingKind } from '@metropolix/sim';
import {
  disc,
  isoBox,
  isoDiamond,
  isoTexel,
  leftWallRect,
  makeCanvas,
  OUT,
  px,
  rect,
  rightWallRect,
  SPRITE_H,
  SPRITE_W,
} from '../sprites';

// ============================================================================
// LIZARD PALETTE CONSTANTS (from lizard.ts)
// ============================================================================
const TEAL_DARK = '#1f7a7e'; // oasis turquoise (was #13494d, too dark on the sand)
const TEAL_MID = '#2a9aa0';
const TEAL_LIGHT = '#359ca3';
const TEAL_BRIGHT = '#62d8de';
const OCHRE_DARK = '#7d5628';
const OCHRE_MID = '#ad7b3b';
const OCHRE_LIGHT = '#dba358';
const TERRA_DARK = '#6e331e';
const TERRA_MID = '#9c4b2e';
const TERRA_LIGHT = '#c96844';
const AMBER_DARK = '#b86514';
const AMBER_MID = '#eb9421';
const AMBER_BRIGHT = '#ffd059';
const VENOM_GLOW = '#76ff9b';
const BONE_DARK = '#8f8674';
const BONE_MID = '#bfb59f';
const BONE_LIGHT = '#ebe3d2';
const MUD_DARK = '#8a6a3e'; // sun-baked sandstone (was dark swamp mud)
const MUD_MID = '#b38d55';
const REED_DARK = '#6b5a35';
const REED_LIGHT = '#9e8852';

// ============================================================================
// HELPER MOTIFS (from lizard.ts)
// ============================================================================

/** Draw a teal-and-amber reptile scale pattern frieze along the left and right walls of an isoBox. */
function drawScaleTrim(
  ctx: CanvasRenderingContext2D,
  fx: number,
  fy: number,
  wL: number,
  wR: number,
  z0: number,
): void {
  leftWallRect(ctx, fx, fy, 1, z0, wL - 2, 2, TEAL_DARK);
  rightWallRect(ctx, fx, fy, 1, z0, wR - 2, 2, TEAL_MID);
  for (let u = 2; u < wL - 2; u += 2) {
    leftWallRect(ctx, fx, fy, u, z0 + (u & 1), 1, 1, TEAL_LIGHT);
  }
  for (let v = 2; v < wR - 2; v += 2) {
    rightWallRect(ctx, fx, fy, v, z0 + 1, 1, 1, TEAL_BRIGHT);
    if (v % 4 === 0) rightWallRect(ctx, fx, fy, v, z0, 1, 1, AMBER_BRIGHT);
  }
}

/** Draw a carved lizard-and-skull totem pole rooted at (bx, by). */
function drawTotemPole(ctx: CanvasRenderingContext2D, bx: number, by: number, h = 12): void {
  rect(ctx, bx - 1, by - h, 3, h + 1, OUT);
  rect(ctx, bx, by - h, 1, h, OCHRE_MID);
  // Teal & terracotta painted totem segments
  for (let z = 2; z < h - 2; z += 3) {
    px(ctx, bx, by - z, z % 2 === 0 ? TEAL_BRIGHT : TERRA_LIGHT);
  }
  // Horned bleached bone skull at top of pole
  rect(ctx, bx - 2, by - h - 2, 5, 3, OUT);
  rect(ctx, bx - 1, by - h - 2, 3, 2, BONE_LIGHT);
  px(ctx, bx - 2, by - h - 3, BONE_MID); // left horn
  px(ctx, bx + 2, by - h - 3, BONE_MID); // right horn
  px(ctx, bx, by - h - 1, AMBER_BRIGHT); // glowing amber eye
}

/** Draw a sagging rope-and-plank bridge between (x0, y0) and (x1, y1). */
function drawRopeBridge(
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
): void {
  const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = Math.round(x0 + (x1 - x0) * t);
    const sag = Math.round(Math.sin(t * Math.PI) * 2);
    const y = Math.round(y0 + (y1 - y0) * t) + sag;
    // Rope handrails & wooden plank slats
    px(ctx, x, y - 2, REED_LIGHT);
    rect(ctx, x, y, 2, 2, i % 2 === 0 ? OCHRE_DARK : MUD_DARK);
    px(ctx, x, y + 1, OUT);
  }
}

// ============================================================================
// 1. RESIDENTIAL (5 kinds)
// ============================================================================

/** 1. COTTAGE: Small 1-room sun-baked adobe burrow with reed cap & skull post (h=0.8). */
function buildLizardCottage(): HTMLCanvasElement[] {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  // Mud & dried ochre plot pad
  isoDiamond(ctx, 32, 48, 22, MUD_MID, OUT);
  isoDiamond(ctx, 32, 48, 18, OCHRE_DARK, MUD_DARK);

  const fx = 32;
  const fy = 55;
  const wL = 12;
  const wR = 14;
  const wallH = 8;

  // Adobe mud-brick base
  isoBox(ctx, fx, fy, wL, wR, wallH, {
    top: OCHRE_LIGHT,
    left: TERRA_DARK,
    right: TERRA_MID,
  });
  drawScaleTrim(ctx, fx, fy, wL, wR, 3);

  // Projecting beam ends (vigas)
  leftWallRect(ctx, fx, fy, 3, wallH - 1, 1, 1, MUD_DARK);
  leftWallRect(ctx, fx, fy, 8, wallH - 1, 1, 1, MUD_DARK);
  rightWallRect(ctx, fx, fy, 4, wallH - 1, 1, 1, MUD_DARK);
  rightWallRect(ctx, fx, fy, 10, wallH - 1, 1, 1, MUD_DARK);

  // Hide curtain door on right wall
  rightWallRect(ctx, fx, fy, 2, 1, 3, 5, OUT);
  rightWallRect(ctx, fx, fy, 3, 1, 2, 4, TEAL_DARK);
  rightWallRect(ctx, fx, fy, 3, 4, 2, 1, AMBER_MID);

  // Amber slit window on right wall
  rightWallRect(ctx, fx, fy, 8, 3, 3, 3, OUT);
  rightWallRect(ctx, fx, fy, 9, 4, 1, 1, AMBER_BRIGHT);

  // Stepped reed-thatch cap
  isoBox(ctx, 32, 47, 14, 16, 3, {
    top: REED_LIGHT,
    left: REED_DARK,
    right: OCHRE_MID,
  });
  isoBox(ctx, 32, 44, 9, 11, 2, {
    top: REED_LIGHT,
    left: REED_DARK,
    right: OCHRE_LIGHT,
  });

  // Small bone skull post in front yard
  rect(ctx, 45, 52, 2, 5, OUT);
  rect(ctx, 45, 52, 1, 4, BONE_LIGHT);
  px(ctx, 45, 51, AMBER_BRIGHT);

  // Swamp reeds in front-left yard
  rect(ctx, 22, 52, 1, 4, REED_LIGHT);
  px(ctx, 22, 51, TERRA_MID);

  return [canvas];
}

/** 2. LONGHOUSE: Elongated adobe-timber communal lodge with vigas & smoke vents (h=1.0). */
function buildLizardLonghouse(): HTMLCanvasElement[] {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  // Packed mud & terracotta foundation pad
  isoDiamond(ctx, 32, 48, 28, MUD_DARK, OUT);
  isoDiamond(ctx, 32, 48, 24, MUD_MID, TERRA_DARK);

  const fx = 32;
  const fy = 56;
  const wL = 24;
  const wR = 12;
  const wallH = 9;

  // Elongated adobe dwelling box
  isoBox(ctx, fx, fy, wL, wR, wallH, {
    top: OCHRE_LIGHT,
    left: TERRA_DARK,
    right: TERRA_MID,
  });
  drawScaleTrim(ctx, fx, fy, wL, wR, 4);

  // Row of wooden roof vigas along long left wall
  for (const u of [3, 7, 11, 15, 19]) {
    leftWallRect(ctx, fx, fy, u, wallH - 1, 1, 1, MUD_DARK);
  }

  // Communal hide-hung arched entrance on right wall
  rightWallRect(ctx, fx, fy, 4, 1, 4, 6, OUT);
  rightWallRect(ctx, fx, fy, 5, 1, 2, 5, TEAL_DARK);
  rightWallRect(ctx, fx, fy, 5, 5, 2, 1, AMBER_BRIGHT);

  // Amber smoke/ventilation slits along left wall
  for (const u of [5, 10, 15]) {
    leftWallRect(ctx, fx, fy, u, 4, 2, 3, OUT);
    leftWallRect(ctx, fx, fy, u + 1, 5, 1, 1, AMBER_MID);
  }

  // Stepped long reed-thatch roof ridge
  isoBox(ctx, fx, fy - wallH, wL + 2, wR + 2, 3, {
    top: REED_LIGHT,
    left: REED_DARK,
    right: OCHRE_MID,
  });
  isoBox(ctx, fx, fy - wallH - 3, wL - 4, wR - 2, 3, {
    top: REED_LIGHT,
    left: REED_DARK,
    right: OCHRE_LIGHT,
  });

  // Twin terracotta smoke pots venting warm smoke
  isoBox(ctx, 25, 41, 3, 3, 2, { top: MUD_DARK, left: TERRA_DARK, right: TERRA_LIGHT });
  isoBox(ctx, 35, 43, 3, 3, 2, { top: MUD_DARK, left: TERRA_DARK, right: TERRA_LIGHT });
  px(ctx, 25, 38, BONE_MID);
  px(ctx, 35, 40, BONE_MID);

  // Flanking skull totem pole at front corner
  drawTotemPole(ctx, 44, 53, 9);

  return [canvas];
}

/** 3. TENEMENT: 3-tier stepped adobe cliff-dwelling burrow with ladders (h=1.8). */
function buildLizardTenement(): HTMLCanvasElement[] {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  // Wide packed mud & ochre foundation
  isoDiamond(ctx, 32, 48, 28, MUD_DARK, OUT);
  isoDiamond(ctx, 32, 48, 24, OCHRE_DARK, TERRA_DARK);

  // Tier 1: Wide ground adobe block
  const fx = 32;
  const fy = 57;
  const wL = 18;
  const wR = 18;
  const wallH = 10;
  isoBox(ctx, fx, fy, wL, wR, wallH, {
    top: OCHRE_LIGHT,
    left: TERRA_DARK,
    right: TERRA_MID,
  });
  drawScaleTrim(ctx, fx, fy, wL, wR, wallH - 3);

  // Twin ground doorways
  rightWallRect(ctx, fx, fy, 2, 1, 3, 5, OUT);
  rightWallRect(ctx, fx, fy, 3, 1, 1, 4, TEAL_DARK);
  rightWallRect(ctx, fx, fy, 11, 1, 3, 5, OUT);
  rightWallRect(ctx, fx, fy, 12, 1, 1, 4, TEAL_DARK);
  // Ground window slit
  rightWallRect(ctx, fx, fy, 7, 3, 2, 3, OUT);
  rightWallRect(ctx, fx, fy, 7, 4, 1, 1, AMBER_BRIGHT);

  // Tier 2: Middle stepped adobe terrace
  isoBox(ctx, 31, 47, 14, 14, 8, {
    top: OCHRE_LIGHT,
    left: OCHRE_DARK,
    right: OCHRE_MID,
  });
  drawScaleTrim(ctx, 31, 47, 14, 14, 5);
  rightWallRect(ctx, 31, 47, 3, 1, 3, 5, OUT);
  rightWallRect(ctx, 31, 47, 4, 1, 1, 4, AMBER_MID);
  rightWallRect(ctx, 31, 47, 9, 2, 3, 3, OUT);
  rightWallRect(ctx, 31, 47, 10, 3, 1, 1, AMBER_BRIGHT);

  // External bone-and-rope ladder connecting tier 1 to tier 2
  for (let l = 0; l < 5; l++) {
    rect(ctx, 42, 50 - l * 2, 4, 1, l % 2 === 0 ? BONE_LIGHT : REED_LIGHT);
  }

  // Tier 3: Crowded top attic & reed cap
  isoBox(ctx, 30, 39, 10, 10, 6, {
    top: TERRA_LIGHT,
    left: TERRA_DARK,
    right: TERRA_MID,
  });
  isoBox(ctx, 30, 33, 12, 12, 2, {
    top: REED_LIGHT,
    left: REED_DARK,
    right: OCHRE_LIGHT,
  });
  rightWallRect(ctx, 30, 39, 3, 2, 3, 2, OUT);
  rightWallRect(ctx, 30, 39, 4, 2, 1, 1, AMBER_BRIGHT);

  // Hanging skin drying line on left wall
  for (let i = 0; i < 6; i++) {
    px(ctx, 19 + i, 38 + (i >> 1), i % 2 === 0 ? TEAL_LIGHT : TERRA_LIGHT);
  }

  // Small bone skull totem marker
  drawTotemPole(ctx, 16, 50, 8);

  return [canvas];
}

/** 4. VILLA: Walled terracotta compound with pool, bone veranda & reed canopy (h=1.4). */
function buildLizardVilla(): HTMLCanvasElement[] {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  // Courtyard base & decorative terracotta perimeter wall
  isoDiamond(ctx, 32, 48, 29, MUD_DARK, OUT);
  isoDiamond(ctx, 32, 48, 25, OCHRE_DARK, TEAL_DARK);

  isoBox(ctx, 32, 59, 14, 3, 3, {
    top: OCHRE_LIGHT,
    left: TERRA_DARK,
    right: TERRA_MID,
  });
  isoBox(ctx, 36, 57, 3, 12, 3, {
    top: OCHRE_LIGHT,
    left: TERRA_DARK,
    right: TERRA_MID,
  });

  // Sunken decorative teal pool in courtyard
  isoDiamond(ctx, 34, 51, 8, TEAL_DARK, OUT);
  isoDiamond(ctx, 34, 51, 5, TEAL_BRIGHT);
  px(ctx, 34, 51, VENOM_GLOW);

  // Main 2-tier residential villa hall
  const fx = 30;
  const fy = 52;
  const wL = 15;
  const wR = 15;
  const wallH = 11;
  isoBox(ctx, fx, fy, wL, wR, wallH, {
    top: OCHRE_LIGHT,
    left: TERRA_DARK,
    right: TERRA_MID,
  });
  drawScaleTrim(ctx, fx, fy, wL, wR, wallH - 3);

  // Stepped upper roof terrace
  isoBox(ctx, fx, fy - wallH, 11, 11, 4, {
    top: REED_LIGHT,
    left: OCHRE_DARK,
    right: OCHRE_MID,
  });

  // Bone-pillared shade veranda
  rect(ctx, 41, 44, 2, 9, OUT);
  rect(ctx, 41, 44, 1, 8, BONE_LIGHT);
  rect(ctx, 47, 41, 2, 9, OUT);
  rect(ctx, 47, 41, 1, 8, BONE_LIGHT);
  isoBox(ctx, 41, 45, 6, 8, 2, {
    top: REED_LIGHT,
    left: REED_DARK,
    right: OCHRE_MID,
  });

  // Doorway & amber-glazed windows
  rightWallRect(ctx, fx, fy, 3, 1, 4, 6, OUT);
  rightWallRect(ctx, fx, fy, 4, 1, 2, 5, TEAL_DARK);
  rightWallRect(ctx, fx, fy, 9, 4, 3, 3, OUT);
  rightWallRect(ctx, fx, fy, 10, 5, 1, 1, AMBER_BRIGHT);

  // Terracotta herb pot with blooming lotus
  isoBox(ctx, 24, 53, 3, 3, 3, {
    top: TERRA_LIGHT,
    left: TERRA_DARK,
    right: TERRA_MID,
  });
  px(ctx, 24, 49, VENOM_GLOW);

  // Flanking skull totem pole
  drawTotemPole(ctx, 18, 49, 10);

  return [canvas];
}

/** 5. HIGHRISE: Monumental 4-tier ziggurat residential tower with animated clan banners (h=2.4, 2 frames). */
function buildLizardHighrise(frame = 0): HTMLCanvasElement {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  // Base pad
  isoDiamond(ctx, 32, 48, 29, MUD_DARK, OUT);
  isoDiamond(ctx, 32, 48, 25, TERRA_DARK, TEAL_DARK);

  // Tier 1: Wide monumental base (fy=58, wallH=10)
  const fx = 32;
  const fy = 58;
  isoBox(ctx, fx, fy, 20, 20, 10, {
    top: OCHRE_LIGHT,
    left: TERRA_DARK,
    right: TERRA_MID,
  });
  drawScaleTrim(ctx, fx, fy, 20, 20, 7);

  // Grand entrance portal & windows
  rightWallRect(ctx, fx, fy, 7, 1, 6, 6, OUT);
  rightWallRect(ctx, fx, fy, 8, 1, 4, 5, TEAL_DARK);
  rightWallRect(ctx, fx, fy, 3, 3, 2, 3, OUT);
  rightWallRect(ctx, fx, fy, 3, 4, 1, 1, AMBER_BRIGHT);
  rightWallRect(ctx, fx, fy, 15, 3, 2, 3, OUT);
  rightWallRect(ctx, fx, fy, 15, 4, 1, 1, AMBER_BRIGHT);

  // Tier 2: Stepped middle ziggurat body (fy=48, wallH=9)
  isoBox(ctx, 32, 48, 16, 16, 9, {
    top: OCHRE_LIGHT,
    left: OCHRE_DARK,
    right: OCHRE_MID,
  });
  drawScaleTrim(ctx, 32, 48, 16, 16, 5);
  for (const v of [3, 7, 11]) {
    rightWallRect(ctx, 32, 48, v, 3, 2, 3, OUT);
    rightWallRect(ctx, 32, 48, v, 4, 1, 1, AMBER_BRIGHT);
  }

  // Tier 3: Narrower upper shaft (fy=39, wallH=9)
  isoBox(ctx, 32, 39, 12, 12, 9, {
    top: TERRA_LIGHT,
    left: TERRA_DARK,
    right: TERRA_MID,
  });
  drawScaleTrim(ctx, 32, 39, 12, 12, 5);
  for (const v of [3, 7]) {
    rightWallRect(ctx, 32, 39, v, 3, 2, 3, OUT);
    rightWallRect(ctx, 32, 39, v, 4, 1, 1, AMBER_BRIGHT);
  }

  // Tier 4: Pinnacle altar & bone horn projections (fy=30, wallH=8)
  isoBox(ctx, 32, 30, 8, 8, 8, {
    top: BONE_LIGHT,
    left: BONE_DARK,
    right: BONE_MID,
  });
  rect(ctx, 23, 22, 3, 2, BONE_LIGHT);
  rect(ctx, 38, 22, 3, 2, BONE_LIGHT);

  // Summit brazier
  disc(ctx, 32, 19, 3, OUT);
  disc(ctx, 32, 19, 2, AMBER_BRIGHT);
  px(ctx, 32, 18, frame === 0 ? VENOM_GLOW : AMBER_BRIGHT);

  // Twin waving lizard clan banners at summit
  const wave = frame % 2;
  rect(ctx, 25, 8, 1, 14, BONE_LIGHT);
  rect(ctx, 20 + wave, 9, 5, 4, OUT);
  rect(ctx, 20 + wave, 10, 4, 3, TEAL_MID);
  px(ctx, 22 + wave, 11, AMBER_BRIGHT);

  rect(ctx, 39, 8, 1, 14, BONE_LIGHT);
  rect(ctx, 40 - wave, 9, 5, 4, OUT);
  rect(ctx, 40 - wave, 10, 4, 3, TEAL_MID);
  px(ctx, 41 - wave, 11, AMBER_BRIGHT);

  return canvas;
}

// ============================================================================
// 2. COMMERCE (5 kinds)
// ============================================================================

/** 6. BAKERY: Sun-baked beehive earthen bread oven & reed shed with animated smoke (h=1.0, 2 frames). */
function buildLizardBakery(frame = 0): HTMLCanvasElement {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  // Mud & sandstone foundation
  isoDiamond(ctx, 32, 48, 27, MUD_DARK, OUT);
  isoDiamond(ctx, 32, 48, 23, OCHRE_DARK, TERRA_DARK);

  // Back-left flour storage & kneading shed
  const fx = 28;
  const fy = 54;
  const wL = 14;
  const wR = 12;
  const wallH = 10;
  isoBox(ctx, fx, fy, wL, wR, wallH, {
    top: OCHRE_LIGHT,
    left: TERRA_DARK,
    right: TERRA_MID,
  });
  drawScaleTrim(ctx, fx, fy, wL, wR, 6);
  isoBox(ctx, 28, 44, 16, 14, 3, {
    top: REED_LIGHT,
    left: REED_DARK,
    right: OCHRE_MID,
  });
  // Door on right wall of shed
  rightWallRect(ctx, fx, fy, 2, 1, 3, 5, OUT);
  rightWallRect(ctx, fx, fy, 3, 1, 1, 4, TEAL_DARK);

  // Front-right domed beehive clay bread oven
  isoBox(ctx, 42, 54, 8, 8, 6, {
    top: TERRA_LIGHT,
    left: TERRA_DARK,
    right: TERRA_MID,
  });
  // Glowing fiery hearth arch
  rightWallRect(ctx, 42, 54, 2, 1, 4, 4, OUT);
  rightWallRect(ctx, 42, 54, 3, 1, 2, 3, frame === 0 ? AMBER_BRIGHT : '#ff7043');

  // Chimney pot atop oven with rising animated smoke puffs
  isoBox(ctx, 42, 48, 3, 3, 3, {
    top: MUD_DARK,
    left: TERRA_DARK,
    right: TERRA_LIGHT,
  });
  const yShift = frame * 2;
  disc(ctx, 42, 43 - yShift, 2, BONE_MID);
  disc(ctx, 43, 39 - yShift, 3, BONE_LIGHT);
  px(ctx, 42, 35 - yShift, BONE_DARK);

  // Wooden cooling counter with seed flatbreads
  isoBox(ctx, 34, 57, 5, 6, 3, {
    top: OCHRE_LIGHT,
    left: MUD_DARK,
    right: OCHRE_MID,
  });
  disc(ctx, 34, 53, 2, AMBER_MID);
  px(ctx, 34, 53, AMBER_BRIGHT);
  disc(ctx, 37, 51, 2, OCHRE_LIGHT);

  // Flour / grain basket on the left
  isoBox(ctx, 22, 53, 4, 4, 3, {
    top: BONE_LIGHT,
    left: BONE_DARK,
    right: BONE_MID,
  });

  return canvas;
}

/** 7. TEAHOUSE: Elevated stilted swamp pavilion with bone pillars & glowing moonleaf tea (h=1.1). */
function buildLizardTeahouse(): HTMLCanvasElement[] {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  // Swamp pool & mud pad
  isoDiamond(ctx, 32, 48, 28, MUD_DARK, OUT);
  isoDiamond(ctx, 32, 48, 23, TEAL_DARK, MUD_MID);
  isoDiamond(ctx, 32, 49, 16, '#13393b');

  // Mangrove stilt posts
  for (const [sx, sy] of [
    [23, 49],
    [32, 54],
    [41, 49],
    [32, 45],
  ] as const) {
    rect(ctx, sx - 1, sy - 5, 2, 6, MUD_MID);
  }

  // Stilted wooden deck
  const fx = 32;
  const fy = 50;
  const wL = 16;
  const wR = 16;
  isoBox(ctx, fx, fy, wL, wR, 2, {
    top: OCHRE_MID,
    left: MUD_DARK,
    right: OCHRE_DARK,
  });

  // Bleached bone open pavilion pillars
  for (const [px0, py0] of [
    [23, 46],
    [41, 46],
    [32, 42],
    [32, 51],
  ] as const) {
    rect(ctx, px0, py0 - 10, 2, 10, BONE_LIGHT);
  }

  // Sweeping double-tiered reed-thatch canopy
  isoBox(ctx, 32, 38, 18, 18, 3, {
    top: REED_LIGHT,
    left: REED_DARK,
    right: OCHRE_MID,
  });
  isoBox(ctx, 32, 35, 12, 12, 3, {
    top: REED_LIGHT,
    left: REED_DARK,
    right: OCHRE_LIGHT,
  });
  rect(ctx, 31, 29, 2, 4, BONE_LIGHT);
  px(ctx, 31, 28, VENOM_GLOW);

  // Low tea table with glowing moonleaf bowls & steam
  isoBox(ctx, 32, 47, 6, 6, 2, {
    top: TEAL_MID,
    left: TEAL_DARK,
    right: TEAL_LIGHT,
  });
  px(ctx, 31, 44, VENOM_GLOW);
  px(ctx, 33, 45, VENOM_GLOW);
  px(ctx, 31, 42, TEAL_BRIGHT);
  px(ctx, 33, 43, TEAL_BRIGHT);

  // Hanging reed privacy mats
  rect(ctx, 25, 38, 4, 5, REED_DARK);
  rect(ctx, 37, 38, 4, 5, REED_DARK);

  // Rope bridge ramp leading up to deck
  drawRopeBridge(ctx, 36, 52, 44, 56);

  return [canvas];
}

/** 8. TAILOR: Reptile hide tanner & scalecrafter lodge with stretching frames (h=1.1). */
function buildLizardTailor(): HTMLCanvasElement[] {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  // Mud & terracotta pad
  isoDiamond(ctx, 32, 48, 27, MUD_DARK, OUT);
  isoDiamond(ctx, 32, 48, 22, OCHRE_DARK, TERRA_DARK);

  // Main adobe tailor shop
  const fx = 28;
  const fy = 53;
  const wL = 13;
  const wR = 15;
  const wallH = 11;
  isoBox(ctx, fx, fy, wL, wR, wallH, {
    top: OCHRE_LIGHT,
    left: TERRA_DARK,
    right: TERRA_MID,
  });
  drawScaleTrim(ctx, fx, fy, wL, wR, wallH - 3);
  isoBox(ctx, 28, 42, 11, 13, 3, {
    top: REED_LIGHT,
    left: REED_DARK,
    right: OCHRE_MID,
  });

  // Doorway with dyed hide curtain & amber window
  rightWallRect(ctx, fx, fy, 2, 1, 4, 6, OUT);
  rightWallRect(ctx, fx, fy, 3, 1, 2, 5, '#c27a9a');
  rightWallRect(ctx, fx, fy, 8, 3, 3, 3, OUT);
  rightWallRect(ctx, fx, fy, 9, 4, 1, 1, AMBER_BRIGHT);

  // Bone frame holding stretched vibrant teal reptile pelt in front-right yard
  rect(ctx, 37, 46, 1, 9, BONE_LIGHT);
  rect(ctx, 44, 42, 1, 9, BONE_LIGHT);
  rect(ctx, 38, 44, 6, 6, OUT);
  rect(ctx, 39, 45, 4, 4, TEAL_BRIGHT);
  px(ctx, 40, 46, TEAL_DARK);

  // Clay dye vats (plum & teal pigments)
  isoBox(ctx, 36, 56, 4, 4, 3, {
    top: '#c27a9a',
    left: MUD_DARK,
    right: TERRA_DARK,
  });
  isoBox(ctx, 42, 53, 4, 4, 3, {
    top: TEAL_MID,
    left: MUD_DARK,
    right: TEAL_DARK,
  });

  // Tool bench with cured amber leather roll
  isoBox(ctx, 22, 54, 4, 5, 3, {
    top: AMBER_MID,
    left: REED_DARK,
    right: OCHRE_MID,
  });
  rect(ctx, 22, 49, 3, 1, BONE_LIGHT);

  return [canvas];
}

/** 9. BAZAAR: Multi-stall swamp market with striped canopies & auction plinth (h=1.0). */
function buildLizardBazaar(): HTMLCanvasElement[] {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  // Packed sandstone & mud plaza
  isoDiamond(ctx, 32, 48, 29, MUD_DARK, OUT);
  isoDiamond(ctx, 32, 48, 25, OCHRE_DARK, MUD_MID);
  isoDiamond(ctx, 32, 48, 18, TERRA_DARK, OCHRE_MID);

  // Central raised stone auction plinth with trade goods
  isoBox(ctx, 32, 51, 8, 8, 3, {
    top: BONE_LIGHT,
    left: BONE_DARK,
    right: BONE_MID,
  });
  drawScaleTrim(ctx, 32, 51, 8, 8, 1);
  rect(ctx, 31, 46, 2, 3, AMBER_BRIGHT);
  rect(ctx, 34, 45, 2, 3, '#e53935');

  // Stall 1 (back-left): Adobe counter with teal-and-amber canopy
  isoBox(ctx, 22, 47, 6, 8, 4, {
    top: OCHRE_LIGHT,
    left: TERRA_DARK,
    right: TERRA_MID,
  });
  isoBox(ctx, 22, 40, 8, 10, 2, {
    top: TEAL_MID,
    left: TEAL_DARK,
    right: TEAL_LIGHT,
  });
  rect(ctx, 21, 41, 2, 2, VENOM_GLOW);
  rect(ctx, 24, 42, 2, 2, AMBER_BRIGHT);

  // Stall 2 (back-right): Terracotta spice canopy
  isoBox(ctx, 42, 47, 8, 6, 4, {
    top: OCHRE_LIGHT,
    left: TERRA_DARK,
    right: TERRA_MID,
  });
  isoBox(ctx, 42, 40, 10, 8, 2, {
    top: TERRA_LIGHT,
    left: TERRA_DARK,
    right: TERRA_MID,
  });
  rect(ctx, 41, 41, 2, 2, '#e53935');
  rect(ctx, 44, 42, 2, 2, AMBER_MID);

  // Front trade rug & crates
  isoDiamond(ctx, 25, 54, 5, TEAL_DARK, TEAL_BRIGHT);
  isoBox(ctx, 38, 56, 4, 5, 3, {
    top: REED_LIGHT,
    left: MUD_DARK,
    right: OCHRE_DARK,
  });

  // Totem entrance pole at front corner
  drawTotemPole(ctx, 47, 51, 11);

  return [canvas];
}

/** 10. TRADEGUILD: 2-storey mercantile palace with bone columns & golden scales (h=1.8). */
function buildLizardTradeguild(): HTMLCanvasElement[] {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  // Paved treasury plaza
  isoDiamond(ctx, 32, 48, 29, MUD_DARK, OUT);
  isoDiamond(ctx, 32, 48, 25, OCHRE_DARK, TEAL_MID);

  // Heavy foundation plinth
  const fx = 32;
  const fy = 58;
  const wL = 17;
  const wR = 19;
  isoBox(ctx, fx, fy, wL + 2, wR + 2, 3, {
    top: BONE_LIGHT,
    left: BONE_DARK,
    right: BONE_MID,
  });

  // Lower guild hall
  const wallH = 12;
  isoBox(ctx, fx, fy - 3, wL, wR, wallH, {
    top: OCHRE_LIGHT,
    left: TERRA_DARK,
    right: TERRA_MID,
  });
  drawScaleTrim(ctx, fx, fy - 3, wL, wR, wallH - 3);

  // Carved bone columns across front-right facade
  for (const v of [2, 6, 12, 16]) {
    rightWallRect(ctx, fx, fy - 3, v, 1, 2, wallH - 2, OUT);
    rightWallRect(ctx, fx, fy - 3, v, 1, 1, wallH - 2, BONE_LIGHT);
    rightWallRect(ctx, fx, fy - 3, v, wallH - 3, 1, 1, AMBER_BRIGHT);
  }

  // Imposing bronze-and-amber arched portal
  rightWallRect(ctx, fx, fy - 3, 8, 1, 4, 8, OUT);
  rightWallRect(ctx, fx, fy - 3, 9, 1, 2, 7, AMBER_MID);
  px(ctx, fx + 9, fy - 3 - (9 >> 1) - 4, AMBER_BRIGHT);

  // Upper 2nd tier
  isoBox(ctx, 32, 42, 13, 15, 7, {
    top: TERRA_LIGHT,
    left: OCHRE_DARK,
    right: OCHRE_MID,
  });
  drawScaleTrim(ctx, 32, 42, 13, 15, 4);
  for (const v of [3, 9]) {
    rightWallRect(ctx, 32, 42, v, 2, 3, 3, OUT);
    rightWallRect(ctx, 32, 42, v + 1, 3, 1, 1, AMBER_BRIGHT);
  }

  // Golden balance scales emblem mounted on upper facade
  disc(ctx, 36, 31, 4, OUT);
  disc(ctx, 36, 31, 3, AMBER_BRIGHT);
  rect(ctx, 34, 31, 5, 1, BONE_LIGHT);
  px(ctx, 33, 32, AMBER_MID);
  px(ctx, 39, 32, AMBER_MID);

  // Summit stepped roof crown
  isoBox(ctx, 32, 35, 9, 11, 4, {
    top: AMBER_MID,
    left: TERRA_DARK,
    right: AMBER_DARK,
  });
  rect(ctx, 31, 27, 2, 4, BONE_LIGHT);
  px(ctx, 31, 26, AMBER_BRIGHT);

  return [canvas];
}

// ============================================================================
// 3. INDUSTRY (6 kinds)
// ============================================================================

/** 11. FISHERY: Mangrove stilt pier with gutting shed, drying rack & animated water (h=0.7, 2 frames). */
function buildLizardFishery(frame = 0): HTMLCanvasElement {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  // Murky swamp water & mud pad
  isoDiamond(ctx, 32, 48, 29, MUD_DARK, OUT);
  isoDiamond(ctx, 32, 48, 25, TEAL_DARK, MUD_MID);
  isoDiamond(ctx, 32, 49, 18, '#143c3f');

  // Mangrove stilt posts
  for (const [sx, sy] of [
    [20, 52],
    [28, 56],
    [36, 52],
    [44, 48],
  ] as const) {
    rect(ctx, sx - 1, sy - 5, 2, 6, MUD_MID);
  }

  // Stilted wooden dock platform
  const fx = 30;
  const fy = 54;
  const wL = 16;
  const wR = 10;
  isoBox(ctx, fx, fy, wL, wR, 2, {
    top: OCHRE_MID,
    left: MUD_DARK,
    right: OCHRE_DARK,
  });

  // Reed-thatched fish gutting shed on back-left
  isoBox(ctx, 24, 49, 8, 8, 6, {
    top: OCHRE_LIGHT,
    left: TERRA_DARK,
    right: TERRA_MID,
  });
  isoBox(ctx, 24, 43, 10, 10, 2, {
    top: REED_LIGHT,
    left: REED_DARK,
    right: OCHRE_MID,
  });

  // Drying rack with hanging silver/teal swamp-fish
  rect(ctx, 33, 45, 1, 7, BONE_LIGHT);
  rect(ctx, 41, 41, 1, 7, BONE_LIGHT);
  rect(ctx, 34, 43, 8, 1, REED_LIGHT);
  px(ctx, 35, 44, TEAL_BRIGHT);
  px(ctx, 35, 45, BONE_LIGHT);
  px(ctx, 37, 44, TEAL_LIGHT);
  px(ctx, 37, 45, BONE_LIGHT);
  px(ctx, 39, 44, TEAL_BRIGHT);
  px(ctx, 39, 45, BONE_LIGHT);

  // Bone-rib fish trap in water
  for (let b = 0; b < 4; b++) {
    rect(ctx, 42 + b * 2, 53 - b, 1, 4, BONE_LIGHT);
  }

  // Animated ripples & bobbing float
  const rOff = frame % 2;
  disc(ctx, 30 + rOff, 57, 2, TEAL_BRIGHT);
  px(ctx, 43, 56 - rOff, AMBER_BRIGHT);
  px(ctx, 25, 53 + rOff, TEAL_LIGHT);

  return canvas;
}

/** 12. WINDMILL: Stepped octagonal adobe tower with 4 rotating woven reed sails (h=1.8, 3 frames). */
function buildLizardWindmill(frame = 0): HTMLCanvasElement {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  // Mud & sandstone foundation
  isoDiamond(ctx, 32, 48, 27, MUD_DARK, OUT);
  isoDiamond(ctx, 32, 48, 23, OCHRE_DARK, TERRA_DARK);

  // Tier 1: Wide octagonal adobe mill base
  const fx = 32;
  const fy = 58;
  const wL = 16;
  const wR = 16;
  const wallH = 10;
  isoBox(ctx, fx, fy, wL, wR, wallH, {
    top: OCHRE_LIGHT,
    left: TERRA_DARK,
    right: TERRA_MID,
  });
  drawScaleTrim(ctx, fx, fy, wL, wR, wallH - 3);
  rightWallRect(ctx, fx, fy, 6, 1, 4, 6, OUT);
  rightWallRect(ctx, fx, fy, 7, 1, 2, 5, MUD_DARK);

  // Tier 2: Stepped tapering upper tower
  isoBox(ctx, 32, 48, 12, 12, 12, {
    top: OCHRE_LIGHT,
    left: OCHRE_DARK,
    right: OCHRE_MID,
  });
  drawScaleTrim(ctx, 32, 48, 12, 12, 6);
  rightWallRect(ctx, 32, 48, 5, 5, 2, 3, OUT);
  rightWallRect(ctx, 32, 48, 5, 6, 1, 1, AMBER_BRIGHT);

  // Conical reed-thatch cap
  isoBox(ctx, 32, 36, 14, 14, 3, {
    top: REED_LIGHT,
    left: REED_DARK,
    right: OCHRE_MID,
  });
  isoBox(ctx, 32, 33, 8, 8, 3, {
    top: REED_LIGHT,
    left: REED_DARK,
    right: OCHRE_LIGHT,
  });
  rect(ctx, 31, 28, 2, 3, BONE_LIGHT);

  // Rotating woven reed-and-bone sail vanes (3 frames)
  const hx = 38;
  const hy = 33;
  disc(ctx, hx, hy, 2, OUT);
  px(ctx, hx, hy, AMBER_BRIGHT);

  if (frame === 0) {
    // Cross: +, 0 deg
    rect(ctx, hx - 1, hy - 12, 3, 11, OUT);
    rect(ctx, hx, hy - 11, 2, 10, REED_LIGHT);
    rect(ctx, hx - 1, hy + 2, 3, 11, OUT);
    rect(ctx, hx, hy + 2, 2, 10, REED_DARK);
    rect(ctx, hx - 12, hy - 1, 11, 3, OUT);
    rect(ctx, hx - 11, hy, 10, 2, OCHRE_MID);
    rect(ctx, hx + 2, hy - 1, 11, 3, OUT);
    rect(ctx, hx + 2, hy, 10, 2, REED_LIGHT);
  } else if (frame === 1) {
    // Diagonal: X, ~45 deg
    for (let i = 2; i <= 8; i++) {
      rect(ctx, hx - i, hy - i, 2, 2, REED_LIGHT);
      px(ctx, hx - i, hy - i, OUT);
      rect(ctx, hx + i, hy + i, 2, 2, REED_DARK);
      px(ctx, hx + i, hy + i, OUT);
      rect(ctx, hx + i, hy - i, 2, 2, REED_LIGHT);
      px(ctx, hx + i, hy - i, OUT);
      rect(ctx, hx - i, hy + i, 2, 2, OCHRE_MID);
      px(ctx, hx - i, hy + i, OUT);
    }
  } else {
    // Steep diagonal / ~60 deg
    for (let i = 2; i <= 9; i++) {
      const x1 = hx - Math.round(i * 0.5);
      const y1 = hy - i;
      rect(ctx, x1, y1, 2, 2, REED_LIGHT);
      px(ctx, x1, y1, OUT);

      const x2 = hx + Math.round(i * 0.5);
      const y2 = hy + i;
      rect(ctx, x2, y2, 2, 2, REED_DARK);
      px(ctx, x2, y2, OUT);

      const x3 = hx + i;
      const y3 = hy - Math.round(i * 0.5);
      rect(ctx, x3, y3, 2, 2, REED_LIGHT);
      px(ctx, x3, y3, OUT);

      const x4 = hx - i;
      const y4 = hy + Math.round(i * 0.5);
      rect(ctx, x4, y4, 2, 2, OCHRE_MID);
      px(ctx, x4, y4, OUT);
    }
  }

  // Flour sacks around the base
  isoBox(ctx, 23, 54, 4, 4, 3, {
    top: BONE_LIGHT,
    left: BONE_DARK,
    right: BONE_MID,
  });

  return canvas;
}

/** 13. SAWMILL: Swamp logging mill with animated paddle wheel & bone saw (h=1.1, 2 frames). */
function buildLizardSawmill(frame = 0): HTMLCanvasElement {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  // Mud pad & canal stream on right
  isoDiamond(ctx, 32, 48, 28, MUD_DARK, OUT);
  isoDiamond(ctx, 32, 48, 23, MUD_MID, TEAL_DARK);
  for (let v = 18; v < 28; v++) {
    isoTexel(ctx, 32, 32, 14, v, '#16383b');
  }

  // Water paddle wheel turning in canal
  const rot = frame % 2;
  disc(ctx, 45, 48, 5, OUT);
  disc(ctx, 45, 48, 4, OCHRE_DARK);
  for (let a = 0; a < 4; a++) {
    const ang = (a * Math.PI) / 2 + (rot * Math.PI) / 4;
    const px0 = Math.round(45 + Math.cos(ang) * 4);
    const py0 = Math.round(48 + Math.sin(ang) * 4);
    px(ctx, px0, py0, REED_LIGHT);
  }
  px(ctx, 44 + rot, 54, TEAL_BRIGHT);
  px(ctx, 46 - rot, 54, '#ffffff');

  // Sawmill building on back-left
  const fx = 26;
  const fy = 52;
  const wL = 13;
  const wR = 13;
  const wallH = 10;
  isoBox(ctx, fx, fy, wL, wR, wallH, {
    top: OCHRE_LIGHT,
    left: TERRA_DARK,
    right: TERRA_MID,
  });
  drawScaleTrim(ctx, fx, fy, wL, wR, wallH - 3);
  isoBox(ctx, 26, 42, 15, 15, 3, {
    top: REED_LIGHT,
    left: REED_DARK,
    right: OCHRE_MID,
  });

  // Small adobe chimney puffing light smoke
  isoBox(ctx, 22, 39, 3, 3, 4, {
    top: MUD_DARK,
    left: TERRA_DARK,
    right: TERRA_LIGHT,
  });
  px(ctx, 22, 33 - rot, BONE_MID);
  px(ctx, 23, 31 - rot, BONE_LIGHT);

  // Open cutting deck with log & reciprocating bone-toothed saw
  rect(ctx, 27, 49, 10, 3, MUD_DARK);
  rect(ctx, 28, 50, 8, 1, OCHRE_DARK);
  rect(ctx, 31 + rot, 44, 2, 7, BONE_LIGHT);
  px(ctx, 31 + rot, 49, BONE_DARK);
  px(ctx, 33 + rot, 51, OCHRE_LIGHT);

  // Stacked lumber planks in front-left
  isoBox(ctx, 20, 56, 4, 6, 3, {
    top: OCHRE_LIGHT,
    left: MUD_DARK,
    right: REED_DARK,
  });

  return canvas;
}

/** 14. SMELTER: Stepped blast furnace with glowing ore tap & thick smoke (h=1.3, 3 frames). */
function buildLizardSmelter(frame = 0): HTMLCanvasElement {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  // Mud & scorched terracotta pad
  isoDiamond(ctx, 32, 48, 28, MUD_DARK, OUT);
  isoDiamond(ctx, 32, 48, 24, MUD_MID, TERRA_DARK);

  // Heavy blast furnace base
  const fx = 30;
  const fy = 55;
  const wL = 15;
  const wR = 15;
  const wallH = 12;
  isoBox(ctx, fx, fy, wL, wR, wallH, {
    top: TERRA_LIGHT,
    left: TERRA_DARK,
    right: TERRA_MID,
  });
  drawScaleTrim(ctx, fx, fy, wL, wR, 6);

  // Stepped blast chimney shaft
  isoBox(ctx, 27, 43, 9, 9, 8, {
    top: MUD_DARK,
    left: TERRA_DARK,
    right: TERRA_MID,
  });

  // Glowing furnace tap mouth on right wall
  rightWallRect(ctx, fx, fy, 4, 1, 6, 6, OUT);
  rightWallRect(ctx, fx, fy, 5, 1, 4, 5, frame === 1 ? '#ff7043' : AMBER_BRIGHT);
  rightWallRect(ctx, fx, fy, 6, 2, 2, 3, '#fff8e1');

  // Molten metal runner trough
  isoBox(ctx, 38, 57, 4, 8, 2, {
    top: frame === 0 ? AMBER_BRIGHT : '#ff7043',
    left: TERRA_DARK,
    right: TERRA_MID,
  });
  px(ctx, 38, 55, '#fff8e1');

  // Ore piles in front-left
  isoDiamond(ctx, 22, 54, 5, MUD_DARK, BONE_DARK);
  px(ctx, 22, 53, AMBER_MID);

  // Thick animated smoke clouds rising from chimney (3 frames)
  const puffs: readonly (readonly [number, number, number, number])[] =
    frame === 0
      ? [
          [26, 32, 4, 3],
          [28, 26, 5, 3],
          [30, 20, 4, 2],
        ]
      : frame === 1
        ? [
            [27, 30, 5, 3],
            [29, 24, 5, 3],
            [32, 18, 3, 2],
          ]
        : [
            [26, 33, 4, 2],
            [27, 27, 6, 3],
            [29, 21, 5, 3],
          ];
  for (const [px0, py0, pw, ph] of puffs) {
    rect(ctx, px0 - 1, py0, pw + 2, ph, MUD_DARK);
    rect(ctx, px0, py0 - 1, pw, ph + 1, '#4a4036');
    rect(ctx, px0 + 1, py0, Math.max(1, pw - 2), Math.max(1, ph - 1), '#635648');
  }

  return canvas;
}

/** 15. CRAFTHALL: Multi-bay artisan complex with courtyard, kilns & carving tables (h=1.4). */
function buildLizardCrafthall(): HTMLCanvasElement[] {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  // Sandstone & mud artisan plaza
  isoDiamond(ctx, 32, 48, 29, MUD_DARK, OUT);
  isoDiamond(ctx, 32, 48, 25, OCHRE_DARK, TERRA_DARK);

  // Main central workshop hall (back)
  const fx = 32;
  const fy = 52;
  const wL = 16;
  const wR = 16;
  const wallH = 11;
  isoBox(ctx, fx, fy, wL, wR, wallH, {
    top: OCHRE_LIGHT,
    left: TERRA_DARK,
    right: TERRA_MID,
  });
  drawScaleTrim(ctx, fx, fy, wL, wR, wallH - 3);
  isoBox(ctx, 32, 41, 14, 14, 4, {
    top: REED_LIGHT,
    left: REED_DARK,
    right: OCHRE_MID,
  });
  rect(ctx, 26, 34, 2, 3, BONE_LIGHT);
  rect(ctx, 37, 34, 2, 3, BONE_LIGHT);

  // Left wing: pottery/spice drying kiln
  isoBox(ctx, 22, 53, 6, 8, 7, {
    top: TERRA_LIGHT,
    left: TERRA_DARK,
    right: TERRA_MID,
  });
  isoBox(ctx, 22, 46, 4, 4, 3, {
    top: MUD_DARK,
    left: TERRA_DARK,
    right: TERRA_LIGHT,
  });

  // Right wing: bone-pillared shade veranda
  rect(ctx, 42, 46, 2, 8, BONE_LIGHT);
  rect(ctx, 47, 43, 2, 8, BONE_LIGHT);
  isoBox(ctx, 42, 46, 6, 8, 2, {
    top: REED_LIGHT,
    left: REED_DARK,
    right: OCHRE_MID,
  });

  // Central crafting courtyard display
  isoBox(ctx, 32, 57, 5, 5, 3, {
    top: BONE_LIGHT,
    left: BONE_DARK,
    right: BONE_MID,
  });
  px(ctx, 31, 52, AMBER_BRIGHT);
  px(ctx, 33, 53, '#e53935');
  isoBox(ctx, 26, 58, 4, 4, 2, {
    top: '#e64a19',
    left: REED_DARK,
    right: REED_LIGHT,
  });

  // Flanking totem post
  drawTotemPole(ctx, 47, 50, 9);

  return [canvas];
}

/** 16. FOUNDRY: Fortified casting citadel with twin tall blast stacks & thick smoke (h=1.9, 3 frames). */
function buildLizardFoundry(frame = 0): HTMLCanvasElement {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  // Scorched foundation pad
  isoDiamond(ctx, 32, 48, 29, '#241a14', OUT);
  isoDiamond(ctx, 32, 48, 25, MUD_DARK, TERRA_DARK);

  // Massive lower casting hall
  const fx = 32;
  const fy = 58;
  const wL = 20;
  const wR = 20;
  const wallH = 11;
  isoBox(ctx, fx, fy, wL, wR, wallH, {
    top: TERRA_LIGHT,
    left: TERRA_DARK,
    right: TERRA_MID,
  });
  drawScaleTrim(ctx, fx, fy, wL, wR, 6);

  // Heavy arched furnace gates on right wall
  rightWallRect(ctx, fx, fy, 4, 1, 5, 6, OUT);
  rightWallRect(ctx, fx, fy, 5, 1, 3, 5, frame === 1 ? AMBER_BRIGHT : '#d84315');
  rightWallRect(ctx, fx, fy, 12, 1, 5, 6, OUT);
  rightWallRect(ctx, fx, fy, 13, 1, 3, 5, frame === 0 ? AMBER_BRIGHT : '#ff7043');

  // Twin tall stepped blast chimneys
  isoBox(ctx, 24, 47, 7, 7, 16, {
    top: MUD_DARK,
    left: TERRA_DARK,
    right: TERRA_MID,
  });
  isoBox(ctx, 38, 43, 7, 7, 14, {
    top: MUD_DARK,
    left: TERRA_DARK,
    right: TERRA_MID,
  });

  // Thick billowing smoke from both chimneys (3 frames)
  const y1 = frame * 2;
  disc(ctx, 24, 27 - y1, 3, '#6e5232');
  disc(ctx, 25, 22 - y1, 4, '#8a6a3e');
  disc(ctx, 27, 16 - y1, 3, '#a08050');

  const y2 = ((frame + 1) % 3) * 2;
  disc(ctx, 38, 25 - y2, 3, '#6e5232');
  disc(ctx, 39, 20 - y2, 4, '#8a6a3e');
  disc(ctx, 41, 14 - y2, 3, '#a08050');

  // Glowing molten iron reservoir in front court
  isoDiamond(ctx, 32, 55, 6, OUT);
  isoDiamond(ctx, 32, 55, 4, frame === 2 ? '#fff8e1' : AMBER_BRIGHT);

  // Bone casting molds and slag heap
  isoBox(ctx, 42, 56, 4, 5, 2, {
    top: BONE_MID,
    left: MUD_DARK,
    right: BONE_DARK,
  });

  return canvas;
}

// ============================================================================
// 4. SERVICES (6 kinds)
// ============================================================================

/** 17. SHRINE: Ancient carved serpent-head altar alcove with venom fire (h=1.0). */
function buildLizardShrine(): HTMLCanvasElement[] {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  // Sandstone & mud pad
  isoDiamond(ctx, 32, 48, 26, MUD_DARK, OUT);
  isoDiamond(ctx, 32, 48, 21, OCHRE_DARK, TEAL_DARK);

  // Stepped adobe plinth
  const fx = 32;
  const fy = 55;
  const wL = 12;
  const wR = 12;
  const wallH = 4;
  isoBox(ctx, fx, fy, wL, wR, wallH, {
    top: OCHRE_LIGHT,
    left: TERRA_DARK,
    right: TERRA_MID,
  });
  drawScaleTrim(ctx, fx, fy, wL, wR, 1);

  // Carved stone serpent shrine alcove
  isoBox(ctx, 32, 51, 8, 8, 8, {
    top: TERRA_LIGHT,
    left: OCHRE_DARK,
    right: OCHRE_MID,
  });
  rightWallRect(ctx, 32, 51, 2, 1, 4, 6, OUT);
  rightWallRect(ctx, 32, 51, 3, 1, 2, 5, TEAL_DARK);
  px(ctx, 32, 44, AMBER_BRIGHT);
  px(ctx, 31, 46, BONE_LIGHT);
  px(ctx, 33, 46, BONE_LIGHT);

  // Bronze offering bowl with burning venom fire
  isoBox(ctx, 36, 56, 4, 4, 3, {
    top: TEAL_MID,
    left: TERRA_DARK,
    right: TEAL_DARK,
  });
  disc(ctx, 36, 51, 2, VENOM_GLOW);
  px(ctx, 36, 50, AMBER_BRIGHT);

  // Flanking bone prayer totems
  rect(ctx, 22, 48, 1, 8, BONE_LIGHT);
  px(ctx, 22, 47, AMBER_BRIGHT);
  rect(ctx, 42, 48, 1, 8, BONE_LIGHT);
  px(ctx, 42, 47, TEAL_BRIGHT);

  return [canvas];
}

/** 18. GARDEN: Swamp botanic purification garden with marsh-lotus & runnels (h=0.4). */
function buildLizardGarden(): HTMLCanvasElement[] {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  // Low garden terrace pad
  isoDiamond(ctx, 32, 48, 28, MUD_DARK, OUT);
  isoDiamond(ctx, 32, 48, 24, '#9a7746', TEAL_DARK);

  // Low terracotta garden curbs
  isoBox(ctx, 32, 58, 16, 2, 2, {
    top: TERRA_LIGHT,
    left: TERRA_DARK,
    right: TERRA_MID,
  });
  isoBox(ctx, 34, 56, 2, 16, 2, {
    top: TERRA_LIGHT,
    left: TERRA_DARK,
    right: TERRA_MID,
  });

  // Clear reflective teal water runnel cutting across
  for (let u = 8; u < 24; u++) {
    isoTexel(ctx, 32, 32, u, 16, TEAL_BRIGHT);
    isoTexel(ctx, 32, 32, u, 17, TEAL_MID);
  }

  // Stepping stones across runnel
  rect(ctx, 31, 47, 3, 2, BONE_LIGHT);
  rect(ctx, 32, 48, 2, 1, BONE_MID);

  // Purification lotus & marsh orchids
  disc(ctx, 24, 46, 3, TEAL_DARK);
  px(ctx, 24, 46, VENOM_GLOW);
  px(ctx, 23, 45, '#ffffff');
  px(ctx, 25, 47, '#e53935');

  disc(ctx, 40, 46, 3, TEAL_DARK);
  px(ctx, 40, 46, AMBER_BRIGHT);
  px(ctx, 39, 45, '#ffffff');
  px(ctx, 41, 47, VENOM_GLOW);

  // Tall swamp reeds with cattail heads
  rect(ctx, 28, 41, 1, 5, REED_LIGHT);
  px(ctx, 28, 40, TERRA_MID);
  rect(ctx, 36, 41, 1, 5, REED_LIGHT);
  px(ctx, 36, 40, TERRA_MID);

  // Carved stone bench
  isoBox(ctx, 32, 56, 4, 5, 2, {
    top: BONE_LIGHT,
    left: BONE_DARK,
    right: BONE_MID,
  });

  return [canvas];
}

/** 19. THEATER: Stepped adobe amphitheater & stage with animated footlights (h=1.5, 2 frames). */
function buildLizardTheater(frame = 0): HTMLCanvasElement {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  // Sandstone plaza
  isoDiamond(ctx, 32, 48, 29, MUD_DARK, OUT);
  isoDiamond(ctx, 32, 48, 25, OCHRE_DARK, TERRA_DARK);

  // Semicircular tiered adobe seating
  isoBox(ctx, 25, 52, 14, 8, 8, {
    top: OCHRE_LIGHT,
    left: TERRA_DARK,
    right: TERRA_MID,
  });
  drawScaleTrim(ctx, 25, 52, 14, 8, 5);
  isoBox(ctx, 27, 49, 10, 6, 4, {
    top: BONE_LIGHT,
    left: OCHRE_DARK,
    right: OCHRE_MID,
  });

  // Elevated wooden stage
  const fx = 38;
  const fy = 54;
  const wL = 10;
  const wR = 10;
  const wallH = 4;
  isoBox(ctx, fx, fy, wL, wR, wallH, {
    top: OCHRE_MID,
    left: MUD_DARK,
    right: OCHRE_DARK,
  });

  // Painted hide backdrop screen
  rect(ctx, 37, 36, 12, 10, OUT);
  rect(ctx, 38, 37, 10, 8, TEAL_MID);
  disc(ctx, 43, 41, 3, AMBER_BRIGHT);
  px(ctx, 43, 41, VENOM_GLOW);

  // Bone acoustic horn projections
  rect(ctx, 33, 45, 2, 7, BONE_LIGHT);
  px(ctx, 33, 44, BONE_MID);
  rect(ctx, 48, 40, 2, 7, BONE_LIGHT);
  px(ctx, 48, 39, BONE_MID);

  // Animated footlights along front rim
  const fShift = frame % 2;
  disc(ctx, 35, 53, 2, fShift === 0 ? AMBER_BRIGHT : VENOM_GLOW);
  disc(ctx, 39, 51, 2, fShift === 1 ? AMBER_BRIGHT : VENOM_GLOW);
  disc(ctx, 43, 49, 2, fShift === 0 ? AMBER_BRIGHT : VENOM_GLOW);

  // Flanking skull totem pole
  drawTotemPole(ctx, 16, 51, 10);

  return canvas;
}

/** 20. OBSERVATORY: Stepped sandstone ziggurat with bone celestial armillary sphere (h=2.0). */
function buildLizardObservatory(): HTMLCanvasElement[] {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  // Foundation
  isoDiamond(ctx, 32, 48, 28, MUD_DARK, OUT);
  isoDiamond(ctx, 32, 48, 24, OCHRE_DARK, TEAL_MID);

  // Tier 1: Wide stepped base
  isoBox(ctx, 32, 58, 18, 18, 9, {
    top: OCHRE_LIGHT,
    left: TERRA_DARK,
    right: TERRA_MID,
  });
  drawScaleTrim(ctx, 32, 58, 18, 18, 6);
  rightWallRect(ctx, 32, 58, 6, 1, 5, 5, OUT);
  rightWallRect(ctx, 32, 58, 7, 1, 3, 4, MUD_DARK);

  // Tier 2: Stepped middle tower
  isoBox(ctx, 32, 49, 13, 13, 10, {
    top: OCHRE_LIGHT,
    left: OCHRE_DARK,
    right: OCHRE_MID,
  });
  drawScaleTrim(ctx, 32, 49, 13, 13, 6);
  rightWallRect(ctx, 32, 49, 4, 3, 2, 4, OUT);
  rightWallRect(ctx, 32, 49, 4, 4, 1, 2, TEAL_BRIGHT);

  // Tier 3: Upper deck
  isoBox(ctx, 32, 39, 9, 9, 8, {
    top: BONE_LIGHT,
    left: BONE_DARK,
    right: BONE_MID,
  });

  // Open celestial platform at summit
  rect(ctx, 25, 29, 2, 3, BONE_LIGHT);
  rect(ctx, 37, 29, 2, 3, BONE_LIGHT);

  // Giant bone armillary sphere / celestial sighting rings
  disc(ctx, 32, 20, 6, OUT);
  disc(ctx, 32, 20, 5, BONE_LIGHT);
  disc(ctx, 32, 20, 3, '#102224');
  disc(ctx, 32, 20, 2, AMBER_BRIGHT);
  px(ctx, 32, 20, '#fff8e1');

  // Sighting pointer
  rect(ctx, 31, 10, 2, 6, AMBER_BRIGHT);
  px(ctx, 31, 9, VENOM_GLOW);

  return [canvas];
}

/** 21. HOSPITAL: Bone-limewashed healing sanatorium with serpent healing cross (h=1.6). */
function buildLizardHospital(): HTMLCanvasElement[] {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  // Clean sandstone & teal pad
  isoDiamond(ctx, 32, 48, 29, MUD_DARK, OUT);
  isoDiamond(ctx, 32, 48, 25, BONE_MID, TEAL_MID);

  // Main adobe sanatorium hall
  const fx = 32;
  const fy = 56;
  const wL = 18;
  const wR = 18;
  const wallH = 12;
  isoBox(ctx, fx, fy, wL, wR, wallH, {
    top: OCHRE_LIGHT,
    left: TERRA_MID,
    right: OCHRE_MID,
  });
  leftWallRect(ctx, fx, fy, 1, 9, 16, 2, TEAL_MID);
  rightWallRect(ctx, fx, fy, 1, 9, 16, 2, TEAL_BRIGHT);

  // Doors and windows
  rightWallRect(ctx, fx, fy, 3, 1, 4, 7, OUT);
  rightWallRect(ctx, fx, fy, 4, 1, 2, 6, TEAL_MID);
  rightWallRect(ctx, fx, fy, 9, 3, 3, 4, OUT);
  rightWallRect(ctx, fx, fy, 10, 4, 1, 2, VENOM_GLOW);
  rightWallRect(ctx, fx, fy, 14, 3, 3, 4, OUT);
  rightWallRect(ctx, fx, fy, 15, 4, 1, 2, VENOM_GLOW);

  // Stepped upper attic & healing cross
  isoBox(ctx, 32, 44, 12, 12, 5, {
    top: REED_LIGHT,
    left: REED_DARK,
    right: OCHRE_LIGHT,
  });
  disc(ctx, 36, 36, 5, OUT);
  disc(ctx, 36, 36, 4, '#ffffff');
  rect(ctx, 35, 33, 3, 7, '#e53935');
  rect(ctx, 33, 35, 7, 3, '#e53935');
  px(ctx, 36, 36, VENOM_GLOW);

  // Shaded reed recovery awning on left side
  rect(ctx, 20, 48, 2, 7, BONE_LIGHT);
  isoBox(ctx, 22, 48, 6, 6, 2, {
    top: REED_LIGHT,
    left: REED_DARK,
    right: OCHRE_MID,
  });

  // Terracotta herb tubs in front court
  for (const [hx, hy] of [
    [26, 56],
    [38, 58],
    [44, 55],
  ] as const) {
    isoBox(ctx, hx, hy, 3, 3, 3, {
      top: TERRA_LIGHT,
      left: TERRA_DARK,
      right: TERRA_MID,
    });
    px(ctx, hx, hy - 4, VENOM_GLOW);
  }

  return [canvas];
}

/** 22. UNIVERSITY: Monumental 3-tier ziggurat lore-citadel with blazing sun-eye spire (h=2.2). */
function buildLizardUniversity(): HTMLCanvasElement[] {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  // Grand ceremonial plaza
  isoDiamond(ctx, 32, 48, 30, MUD_DARK, OUT);
  isoDiamond(ctx, 32, 48, 26, OCHRE_DARK, TEAL_MID);
  isoDiamond(ctx, 32, 48, 20, TERRA_MID, AMBER_BRIGHT);

  // Tier 1: Wide campus base
  const fx = 32;
  const fy = 58;
  const wL = 22;
  const wR = 22;
  const wallH = 10;
  isoBox(ctx, fx, fy, wL, wR, wallH, {
    top: OCHRE_LIGHT,
    left: TERRA_DARK,
    right: TERRA_MID,
  });
  drawScaleTrim(ctx, fx, fy, wL, wR, 7);

  // Bone colonnade across entrance
  for (const v of [4, 8, 14, 18]) {
    rightWallRect(ctx, fx, fy, v, 1, 2, 8, OUT);
    rightWallRect(ctx, fx, fy, v, 1, 1, 8, BONE_LIGHT);
  }
  rightWallRect(ctx, fx, fy, 10, 1, 4, 7, OUT);
  rightWallRect(ctx, fx, fy, 11, 1, 2, 6, TEAL_DARK);

  // Tier 2: Stepped middle tier
  isoBox(ctx, 32, 48, 16, 16, 10, {
    top: TERRA_LIGHT,
    left: OCHRE_DARK,
    right: OCHRE_MID,
  });
  drawScaleTrim(ctx, 32, 48, 16, 16, 6);
  for (const v of [3, 7, 11]) {
    rightWallRect(ctx, 32, 48, v, 3, 2, 4, OUT);
    rightWallRect(ctx, 32, 48, v, 4, 1, 2, AMBER_BRIGHT);
  }

  // Tier 3: Octagonal dome drum & high curved spire reaching y=6
  isoBox(ctx, 32, 38, 10, 10, 8, {
    top: TEAL_LIGHT,
    left: TEAL_DARK,
    right: TEAL_MID,
  });

  for (let dy = -8; dy <= 0; dy++) {
    const span = Math.round(7 * Math.sqrt(Math.max(0, 1 - (dy * dy) / 64)));
    rect(ctx, 32 - span - 1, 25 + dy, (span + 1) * 2, 1, OUT);
    rect(ctx, 32 - span, 25 + dy, span * 2, 1, dy < -5 ? AMBER_BRIGHT : TEAL_BRIGHT);
  }
  rect(ctx, 31, 7, 2, 10, BONE_LIGHT);
  disc(ctx, 32, 6, 3, VENOM_GLOW);
  px(ctx, 32, 6, AMBER_BRIGHT);

  // Flanking totem obelisks
  drawTotemPole(ctx, 16, 52, 12);
  drawTotemPole(ctx, 48, 52, 12);

  return [canvas];
}

// ============================================================================
// 5. MILITARY (5 kinds)
// ============================================================================

/** 23. PALISADE: Sharpened mangrove logs, pointed bone ribs & skull trophy (h=0.8). */
function buildLizardPalisade(): HTMLCanvasElement[] {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  // Mud & clay berm foundation
  isoDiamond(ctx, 32, 48, 28, MUD_DARK, OUT);
  isoDiamond(ctx, 32, 48, 23, MUD_MID, OCHRE_DARK);

  // Earthen defensive rampart berm
  isoBox(ctx, 32, 57, 18, 5, 3, {
    top: OCHRE_MID,
    left: MUD_DARK,
    right: MUD_MID,
  });

  // Sharpened mangrove stakes & pointed bone tusks along crest
  for (let u = 0; u < 16; u += 2) {
    const x = 32 - u;
    const y = 54 - (u >> 1);
    rect(ctx, x - 1, y - 8, 2, 9, OUT);
    rect(ctx, x, y - 8, 1, 8, u % 4 === 0 ? BONE_LIGHT : OCHRE_DARK);
    px(ctx, x, y - 9, BONE_LIGHT);
  }

  // Pointed bone spikes curving outwards on front face
  for (const [bx, by] of [
    [24, 52],
    [30, 55],
    [36, 52],
  ] as const) {
    rect(ctx, bx, by - 4, 1, 5, BONE_LIGHT);
    px(ctx, bx + 1, by - 5, BONE_MID);
  }

  // Lashed reed crossbars
  for (let u = 1; u < 16; u++) {
    px(ctx, 32 - u, 50 - (u >> 1), REED_LIGHT);
    px(ctx, 32 - u, 47 - (u >> 1), REED_DARK);
  }

  // Raised corner sentry lookout platform on right
  isoBox(ctx, 38, 54, 6, 6, 6, {
    top: REED_LIGHT,
    left: TERRA_DARK,
    right: TERRA_MID,
  });
  rect(ctx, 37, 43, 4, 3, OUT);
  rect(ctx, 38, 43, 2, 2, BONE_LIGHT);
  px(ctx, 37, 42, BONE_MID);
  px(ctx, 40, 42, BONE_MID);
  px(ctx, 38, 44, AMBER_BRIGHT);

  return [canvas];
}

/** 24. WATCHTOWER: Tapering bone pylon tower with animated signal brazier (h=2.0, 2 frames). */
function buildLizardWatchtower(frame = 0): HTMLCanvasElement {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  // Mud & terracotta pad
  isoDiamond(ctx, 32, 48, 25, MUD_DARK, OUT);
  isoDiamond(ctx, 32, 48, 20, OCHRE_DARK, TERRA_DARK);

  // Low adobe anchor footing
  isoBox(ctx, 32, 56, 12, 12, 3, {
    top: OCHRE_LIGHT,
    left: TERRA_DARK,
    right: TERRA_MID,
  });
  drawScaleTrim(ctx, 32, 56, 12, 12, 1);

  // Tapering bone-and-timber pylon legs
  for (let t = 0; t < 22; t++) {
    const dx = Math.floor(t / 4);
    rect(ctx, 24 + dx, 52 - t, 2, 2, OUT);
    px(ctx, 25 + dx, 52 - t, BONE_LIGHT);
    rect(ctx, 39 - dx, 52 - t, 2, 2, OUT);
    px(ctx, 39 - dx, 52 - t, OCHRE_LIGHT);
  }
  rect(ctx, 26, 44, 12, 1, REED_LIGHT);
  rect(ctx, 28, 37, 8, 1, REED_DARK);

  // Rope ladder
  for (let y = 34; y <= 50; y += 3) {
    px(ctx, 32, y, REED_LIGHT);
    px(ctx, 31, y, REED_DARK);
  }

  // Fortified crow's nest at summit
  isoBox(ctx, 32, 30, 10, 10, 5, {
    top: REED_LIGHT,
    left: TERRA_DARK,
    right: TERRA_MID,
  });
  rect(ctx, 24, 23, 2, 3, BONE_LIGHT);
  rect(ctx, 38, 23, 2, 3, BONE_LIGHT);
  isoBox(ctx, 32, 25, 12, 12, 2, {
    top: REED_LIGHT,
    left: REED_DARK,
    right: OCHRE_LIGHT,
  });

  // Animated signal fire & venom brazier
  disc(ctx, 32, 17, 3, OUT);
  disc(ctx, 32, 17, 2, AMBER_BRIGHT);
  const flameShift = frame % 2;
  px(ctx, 32, 14 - flameShift, VENOM_GLOW);
  px(ctx, 31 + flameShift, 12 - flameShift, AMBER_BRIGHT);

  // Waving raider banner
  rect(ctx, 40, 18, 1, 9, BONE_LIGHT);
  rect(ctx, 41 + flameShift, 19, 4, 3, TEAL_MID);
  px(ctx, 42 + flameShift, 20, AMBER_BRIGHT);

  return canvas;
}

/** 25. ARMORY: Reinforced adobe bunker with spear racks, shields & forge chimney (h=1.3). */
function buildLizardArmory(): HTMLCanvasElement[] {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  // Foundation
  isoDiamond(ctx, 32, 48, 28, MUD_DARK, OUT);
  isoDiamond(ctx, 32, 48, 24, OCHRE_DARK, TERRA_DARK);

  // Adobe bunker body
  const fx = 32;
  const fy = 56;
  const wL = 16;
  const wR = 16;
  const wallH = 11;
  isoBox(ctx, fx, fy, wL, wR, wallH, {
    top: OCHRE_LIGHT,
    left: TERRA_DARK,
    right: TERRA_MID,
  });
  drawScaleTrim(ctx, fx, fy, wL, wR, 8);

  // Bronze-studded door on right wall
  rightWallRect(ctx, fx, fy, 4, 1, 5, 7, OUT);
  rightWallRect(ctx, fx, fy, 5, 1, 3, 6, MUD_DARK);
  px(ctx, fx + 5, fy - (5 >> 1) - 3, AMBER_BRIGHT);
  px(ctx, fx + 7, fy - (7 >> 1) - 3, AMBER_BRIGHT);

  // Spiked turtle-shell shield hung on right wall
  disc(ctx, 43, 44, 3, OUT);
  disc(ctx, 43, 44, 2, TEAL_DARK);
  px(ctx, 43, 44, BONE_LIGHT);

  // Obsidian-tipped spear rack in front-left yard
  rect(ctx, 22, 50, 8, 1, REED_DARK);
  rect(ctx, 22, 50, 1, 5, BONE_LIGHT);
  rect(ctx, 29, 50, 1, 5, BONE_LIGHT);
  for (let s = 0; s < 4; s++) {
    rect(ctx, 23 + s * 2, 45, 1, 6, OCHRE_MID);
    px(ctx, 23 + s * 2, 44, '#1b1b1b');
  }

  // Bone-toothed swords display bench
  isoBox(ctx, 38, 57, 4, 6, 3, {
    top: BONE_LIGHT,
    left: MUD_DARK,
    right: BONE_MID,
  });
  rect(ctx, 37, 52, 6, 1, BONE_LIGHT);
  px(ctx, 38, 53, BONE_DARK);

  // Stepped roof terrace with forge chimney pot
  isoBox(ctx, 32, 45, 12, 12, 3, {
    top: TERRA_LIGHT,
    left: OCHRE_DARK,
    right: OCHRE_MID,
  });
  isoBox(ctx, 26, 42, 3, 3, 3, {
    top: MUD_DARK,
    left: TERRA_DARK,
    right: TERRA_LIGHT,
  });
  px(ctx, 26, 38, AMBER_MID);

  return [canvas];
}

/** 26. WARCAMP: Raider yurts, roasting war pit with crackling embers & banners (h=1.0, 2 frames). */
function buildLizardWarcamp(frame = 0): HTMLCanvasElement {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  // Mud & scorched ground diamond
  isoDiamond(ctx, 32, 48, 29, MUD_DARK, OUT);
  isoDiamond(ctx, 32, 48, 25, MUD_MID, TERRA_DARK);

  // Chieftain yurt (back-left)
  isoBox(ctx, 24, 49, 10, 10, 5, {
    top: OCHRE_MID,
    left: TERRA_DARK,
    right: TERRA_MID,
  });
  disc(ctx, 24, 40, 7, OUT);
  disc(ctx, 24, 40, 6, REED_LIGHT);
  disc(ctx, 24, 38, 4, OCHRE_LIGHT);
  rect(ctx, 23, 33, 2, 5, BONE_LIGHT);
  px(ctx, 23, 32, AMBER_BRIGHT);
  rect(ctx, 26, 44, 3, 4, TEAL_DARK);

  // Troop yurt (right)
  isoBox(ctx, 42, 49, 8, 8, 4, {
    top: OCHRE_MID,
    left: TERRA_DARK,
    right: TERRA_MID,
  });
  disc(ctx, 42, 42, 6, OUT);
  disc(ctx, 42, 42, 5, REED_DARK);
  rect(ctx, 41, 36, 2, 4, BONE_LIGHT);

  // Central roasting war pit with animated fire
  isoDiamond(ctx, 32, 53, 6, MUD_DARK, OUT);
  const fireShift = frame % 2;
  disc(ctx, 32, 52, 3, fireShift === 0 ? AMBER_BRIGHT : '#ff7043');
  px(ctx, 32, 50 - fireShift, VENOM_GLOW);
  px(ctx, 31 + fireShift, 49 - fireShift, AMBER_BRIGHT);

  // Roasting spit
  rect(ctx, 29, 50, 1, 4, BONE_LIGHT);
  rect(ctx, 35, 50, 1, 4, BONE_LIGHT);
  rect(ctx, 30, 49, 5, 1, REED_LIGHT);
  rect(ctx, 31, 48, 3, 2, TERRA_LIGHT);

  // Waving raider banners
  const bWave = frame % 2;
  rect(ctx, 18, 42, 1, 14, BONE_LIGHT);
  rect(ctx, 19 + bWave, 43, 5, 4, OUT);
  rect(ctx, 19 + bWave, 44, 4, 3, TEAL_MID);
  px(ctx, 20 + bWave, 45, AMBER_BRIGHT);

  rect(ctx, 46, 44, 1, 12, BONE_LIGHT);
  rect(ctx, 47 - bWave, 45, 4, 3, OUT);
  rect(ctx, 47 - bWave, 46, 3, 2, TERRA_LIGHT);

  return canvas;
}

/** 27. FORTRESS: Monumental stepped obsidian citadel bastion with crenellations & skull totems (h=2.3). */
function buildLizardFortress(): HTMLCanvasElement[] {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  // Massive foundation pad
  isoDiamond(ctx, 32, 48, 30, MUD_DARK, OUT);
  isoDiamond(ctx, 32, 48, 26, '#281e18', TERRA_DARK);

  // Lower fortress curtain wall & corner bastions
  const fx = 32;
  const fy = 58;
  const wL = 22;
  const wR = 22;
  const wallH = 12;
  isoBox(ctx, fx, fy, wL, wR, wallH, {
    top: OCHRE_LIGHT,
    left: TERRA_DARK,
    right: TERRA_MID,
  });
  drawScaleTrim(ctx, fx, fy, wL, wR, 8);

  // Crenellations along wall tops
  for (let u = 2; u < 20; u += 3) {
    leftWallRect(ctx, fx, fy, u, 12, 1, 2, BONE_LIGHT);
  }
  for (let v = 2; v < 20; v += 3) {
    rightWallRect(ctx, fx, fy, v, 12, 1, 2, BONE_LIGHT);
  }

  // Reinforced bronze-and-bone fortress gate
  rightWallRect(ctx, fx, fy, 9, 1, 5, 8, OUT);
  rightWallRect(ctx, fx, fy, 10, 1, 3, 7, '#1b1b1b');
  px(ctx, fx + 10, fy - (10 >> 1) - 4, AMBER_BRIGHT);

  // High central keep tower
  isoBox(ctx, 32, 46, 14, 14, 12, {
    top: TERRA_LIGHT,
    left: OCHRE_DARK,
    right: OCHRE_MID,
  });
  drawScaleTrim(ctx, 32, 46, 14, 14, 8);
  rightWallRect(ctx, 32, 46, 4, 4, 2, 4, OUT);
  rightWallRect(ctx, 32, 46, 4, 5, 1, 2, AMBER_BRIGHT);

  // Summit commanding battlement & watch turret
  isoBox(ctx, 32, 34, 8, 8, 8, {
    top: BONE_LIGHT,
    left: BONE_DARK,
    right: BONE_MID,
  });
  rect(ctx, 23, 23, 2, 4, BONE_LIGHT);
  rect(ctx, 39, 23, 2, 4, BONE_LIGHT);

  // Summit war brazier
  disc(ctx, 32, 20, 3, OUT);
  disc(ctx, 32, 20, 2, AMBER_BRIGHT);
  px(ctx, 32, 19, VENOM_GLOW);

  // Twin skull totems flanking gate
  drawTotemPole(ctx, 16, 54, 11);
  drawTotemPole(ctx, 48, 54, 11);

  return [canvas];
}

// ============================================================================
// 6. DECORATION (5 kinds)
// ============================================================================

/** 28. FLOWERBED: Raised terracotta planter with vibrant night-lotus & orchids (h=0.3). */
function buildLizardFlowerbed(): HTMLCanvasElement[] {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  // Mud foundation pad
  isoDiamond(ctx, 32, 48, 22, MUD_DARK, OUT);

  // Terracotta planter curb
  isoBox(ctx, 32, 54, 12, 12, 3, {
    top: TERRA_LIGHT,
    left: TERRA_DARK,
    right: TERRA_MID,
  });

  // Swamp soil
  isoDiamond(ctx, 32, 49, 9, '#2b2118');

  // Bog blossoms
  px(ctx, 30, 48, AMBER_BRIGHT);
  px(ctx, 30, 47, AMBER_MID);
  px(ctx, 34, 46, AMBER_BRIGHT);

  disc(ctx, 32, 49, 2, TEAL_DARK);
  px(ctx, 32, 49, VENOM_GLOW);

  px(ctx, 28, 49, '#e53935');
  px(ctx, 35, 50, '#e53935');
  px(ctx, 32, 46, '#ff5252');

  // Corner bone caps
  px(ctx, 21, 52, BONE_LIGHT);
  px(ctx, 42, 52, BONE_LIGHT);
  px(ctx, 32, 57, BONE_LIGHT);
  px(ctx, 32, 47, BONE_LIGHT);

  return [canvas];
}

/** 29. HEDGE: Dense swamp thorn-bramble wall with bone defense spikes (h=0.5). */
function buildLizardHedge(): HTMLCanvasElement[] {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  // Mud & sandstone footing
  isoDiamond(ctx, 32, 48, 24, MUD_DARK, OUT);

  // Green thorn hedge block
  const fx = 32;
  const fy = 54;
  const wL = 14;
  const wR = 14;
  const wallH = 6;
  isoBox(ctx, fx, fy, wL, wR, wallH, {
    top: '#2e5a3a',
    left: '#15321f',
    right: '#22482e',
  });

  // Foliage highlights
  for (let u = 2; u < 12; u += 3) {
    for (let v = 2; v < 12; v += 3) {
      px(ctx, 32 + (u - v), 54 - 6 - ((u + v) >> 1), (u + v) % 2 === 0 ? '#437c54' : TEAL_LIGHT);
    }
  }

  // Pointed bone stakes
  rect(ctx, 24, 47, 1, 4, BONE_LIGHT);
  px(ctx, 24, 46, BONE_MID);
  rect(ctx, 32, 51, 1, 4, BONE_LIGHT);
  px(ctx, 32, 50, BONE_MID);
  rect(ctx, 40, 47, 1, 4, BONE_LIGHT);
  px(ctx, 40, 46, BONE_MID);

  // Amber thorn-berries
  px(ctx, 26, 50, AMBER_BRIGHT);
  px(ctx, 37, 50, AMBER_BRIGHT);
  px(ctx, 35, 52, AMBER_MID);

  return [canvas];
}

/** 30. WELL: Stepped adobe well ring around cool spring with arched bone canopy (h=0.7). */
function buildLizardWell(): HTMLCanvasElement[] {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  // Sandstone plaza
  isoDiamond(ctx, 32, 48, 24, MUD_DARK, OUT);
  isoDiamond(ctx, 32, 48, 19, OCHRE_DARK, TEAL_DARK);

  // Adobe well curb
  isoBox(ctx, 32, 54, 10, 10, 5, {
    top: BONE_LIGHT,
    left: TERRA_DARK,
    right: TERRA_MID,
  });
  drawScaleTrim(ctx, 32, 54, 10, 10, 2);

  // Spring water interior
  isoDiamond(ctx, 32, 47, 6, '#10282b');
  disc(ctx, 32, 47, 2, TEAL_BRIGHT);
  px(ctx, 32, 47, VENOM_GLOW);

  // Bone canopy posts & reed roof
  rect(ctx, 25, 41, 2, 10, BONE_LIGHT);
  rect(ctx, 38, 41, 2, 10, BONE_LIGHT);
  isoBox(ctx, 32, 40, 12, 12, 3, {
    top: REED_LIGHT,
    left: REED_DARK,
    right: OCHRE_MID,
  });
  rect(ctx, 31, 35, 2, 2, BONE_LIGHT);

  // Rope & clay amphora
  rect(ctx, 32, 40, 1, 5, REED_LIGHT);
  rect(ctx, 31, 45, 3, 3, TERRA_LIGHT);
  px(ctx, 32, 45, TERRA_MID);

  // Spilled water
  disc(ctx, 36, 54, 2, TEAL_BRIGHT);

  return [canvas];
}

/** 31. POND: Natural swamp pool with dark teal water, lilies & baby reptile (h=0.2, 2 frames). */
function buildLizardPond(frame = 0): HTMLCanvasElement {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  // Swamp pool pad
  isoDiamond(ctx, 32, 48, 28, MUD_DARK, OUT);
  isoDiamond(ctx, 32, 48, 24, MUD_MID, '#1f7a7e');

  // Reflective teal pool
  isoDiamond(ctx, 32, 49, 18, TEAL_DARK, OUT);
  isoDiamond(ctx, 32, 49, 14, '#36b4b8');

  // Green lily pads with blossoms
  disc(ctx, 25, 48, 3, '#4f9a45');
  px(ctx, 25, 48, '#ffffff');
  px(ctx, 26, 48, '#ff80ab');

  disc(ctx, 39, 48, 3, '#4f9a45');
  px(ctx, 39, 48, '#ffffff');
  px(ctx, 38, 48, VENOM_GLOW);

  // Baby reptile on stone
  rect(ctx, 31, 52, 4, 2, BONE_MID);
  rect(ctx, 32, 51, 3, 2, TEAL_LIGHT);
  px(ctx, 34, 51, AMBER_BRIGHT);
  px(ctx, 31, 52, TEAL_BRIGHT);

  // Animated ripples
  const rip = frame % 2;
  disc(ctx, 32, 48, 4 + rip * 2, rip === 0 ? TEAL_LIGHT : TEAL_BRIGHT);
  disc(ctx, 32, 48, 3 + rip * 2, '#36b4b8');

  // Reeds & cattails
  rect(ctx, 28, 40, 1, 4, REED_LIGHT);
  px(ctx, 28, 39, TERRA_MID);
  rect(ctx, 35, 41, 1, 4, REED_LIGHT);
  px(ctx, 35, 40, TERRA_MID);

  return canvas;
}

/** 32. ARCH: Ceremonial gateway with obelisk pillars, serpent skull & sun-disc (h=1.6). */
function buildLizardArch(): HTMLCanvasElement[] {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  // Ceremonial pad
  isoDiamond(ctx, 32, 48, 28, MUD_DARK, OUT);
  isoDiamond(ctx, 32, 48, 24, OCHRE_DARK, TEAL_MID);

  // Left obelisk pillar
  isoBox(ctx, 22, 54, 6, 6, 16, {
    top: BONE_LIGHT,
    left: TERRA_DARK,
    right: TERRA_MID,
  });
  drawScaleTrim(ctx, 22, 54, 6, 6, 8);
  rect(ctx, 18, 36, 2, 3, BONE_LIGHT);

  // Right obelisk pillar
  isoBox(ctx, 42, 54, 6, 6, 16, {
    top: BONE_LIGHT,
    left: TERRA_DARK,
    right: TERRA_MID,
  });
  drawScaleTrim(ctx, 42, 54, 6, 6, 8);
  rect(ctx, 44, 36, 2, 3, BONE_LIGHT);

  // Corbelled arch lintel
  isoBox(ctx, 32, 47, 18, 6, 5, {
    top: OCHRE_LIGHT,
    left: OCHRE_DARK,
    right: OCHRE_MID,
  });
  rightWallRect(ctx, 32, 47, 1, 2, 16, 2, TEAL_BRIGHT);

  // Open portal ground
  isoDiamond(ctx, 32, 49, 8, TERRA_DARK, OUT);

  // Horned serpent skull & glowing sun-disc
  rect(ctx, 29, 24, 6, 5, OUT);
  rect(ctx, 30, 25, 4, 3, BONE_LIGHT);
  px(ctx, 28, 23, BONE_MID);
  px(ctx, 35, 23, BONE_MID);
  px(ctx, 32, 26, AMBER_BRIGHT);

  disc(ctx, 32, 20, 5, OUT);
  disc(ctx, 32, 20, 4, AMBER_BRIGHT);
  disc(ctx, 32, 20, 2, VENOM_GLOW);

  // Braziers on pillar caps
  disc(ctx, 22, 35, 2, VENOM_GLOW);
  px(ctx, 22, 34, AMBER_BRIGHT);
  disc(ctx, 42, 35, 2, VENOM_GLOW);
  px(ctx, 42, 34, AMBER_BRIGHT);

  return [canvas];
}

// ============================================================================
// MAP EXPORT (All 32 kinds)
// ============================================================================

/** lizard art for the third-wave buildings. */
export const art3: Partial<Record<BuildingKind, () => HTMLCanvasElement[]>> = {
  // Residential (5)
  cottage: () => buildLizardCottage(),
  longhouse: () => buildLizardLonghouse(),
  tenement: () => buildLizardTenement(),
  villa: () => buildLizardVilla(),
  highrise: () => [buildLizardHighrise(0), buildLizardHighrise(1)],

  // Commerce (5)
  bakery: () => [buildLizardBakery(0), buildLizardBakery(1)],
  teahouse: () => buildLizardTeahouse(),
  tailor: () => buildLizardTailor(),
  bazaar: () => buildLizardBazaar(),
  tradeguild: () => buildLizardTradeguild(),

  // Industry (6)
  fishery: () => [buildLizardFishery(0), buildLizardFishery(1)],
  windmill: () => [buildLizardWindmill(0), buildLizardWindmill(1), buildLizardWindmill(2)],
  sawmill: () => [buildLizardSawmill(0), buildLizardSawmill(1)],
  smelter: () => [buildLizardSmelter(0), buildLizardSmelter(1), buildLizardSmelter(2)],
  crafthall: () => buildLizardCrafthall(),
  foundry: () => [buildLizardFoundry(0), buildLizardFoundry(1), buildLizardFoundry(2)],

  // Services (6)
  shrine: () => buildLizardShrine(),
  garden: () => buildLizardGarden(),
  theater: () => [buildLizardTheater(0), buildLizardTheater(1)],
  observatory: () => buildLizardObservatory(),
  hospital: () => buildLizardHospital(),
  university: () => buildLizardUniversity(),

  // Military (5)
  palisade: () => buildLizardPalisade(),
  watchtower: () => [buildLizardWatchtower(0), buildLizardWatchtower(1)],
  armory: () => buildLizardArmory(),
  warcamp: () => [buildLizardWarcamp(0), buildLizardWarcamp(1)],
  fortress: () => buildLizardFortress(),

  // Decoration (5)
  flowerbed: () => buildLizardFlowerbed(),
  hedge: () => buildLizardHedge(),
  well: () => buildLizardWell(),
  pond: () => [buildLizardPond(0), buildLizardPond(1)],
  arch: () => buildLizardArch(),
};
