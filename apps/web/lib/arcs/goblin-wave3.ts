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

// Goblin palette: murky bog green, rust orange, dull iron grey, dirty mud brown, bleached bone, toxic yellow-green glow.
// Source: apps/web/lib/arcs/goblin.ts & apps/web/lib/sprites.ts (64x64 isometric layout, ground diamond y=32..63, top vertex (32,32))
const MUD_DARK = '#2a2016';
const MUD_MID = '#3d2f20';

const BOG_DARK = '#24331c';
const BOG_MID = '#324726';
const BOG_LIGHT = '#435e33';

const WOOD_DARK = '#3b2616';
const WOOD_MID = '#593a22';
const WOOD_LIGHT = '#785030';
const WOOD_TOP = '#8f633d';

const RUST_DARK = '#5e2411';
const RUST_MID = '#8c381b';
const RUST_LIGHT = '#b84e27';
const RUST_TOP = '#d4683b';

const IRON_DARK = '#2c3238';
const IRON_MID = '#454e57';
const IRON_LIGHT = '#636f7a';
const IRON_TOP = '#84919e';

const BONE_SHADOW = '#9e9589';
const BONE_MID = '#cfc6b8';
const BONE_LIGHT = '#ebe4d8';

const TOXIC_DEEP = '#689f38';
const TOXIC_MID = '#9ccc65';
const TOXIC_BRIGHT = '#c6ff00';
const TOXIC_YELLOW = '#ffee58';

/** Draw a small horned animal/goblin skull trophy (5x4) with dark eye sockets. */
function drawSkull(ctx: CanvasRenderingContext2D, cx: number, cy: number, horned = true): void {
  rect(ctx, cx - 2, cy - 2, 5, 4, OUT);
  rect(ctx, cx - 1, cy - 1, 3, 2, BONE_LIGHT);
  px(ctx, cx - 1, cy + 1, BONE_MID);
  px(ctx, cx + 1, cy + 1, BONE_MID);
  px(ctx, cx - 1, cy, OUT);
  px(ctx, cx + 1, cy, OUT);
  if (horned) {
    px(ctx, cx - 3, cy - 2, BONE_MID);
    px(ctx, cx - 3, cy - 3, BONE_LIGHT);
    px(ctx, cx + 3, cy - 2, BONE_MID);
    px(ctx, cx + 3, cy - 3, BONE_LIGHT);
  }
}

/** Draw a flickering toxic-green goblin torch on a crooked wooden stake. */
function drawGreenTorch(ctx: CanvasRenderingContext2D, x: number, yBot: number, h: number, frame: number): void {
  rect(ctx, x, yBot - h, 2, h + 1, OUT);
  rect(ctx, x, yBot - h + 1, 1, h - 1, WOOD_MID);
  const fY = yBot - h - 2;
  const shift = frame % 2;
  rect(ctx, x - 1, fY, 3, 3, TOXIC_DEEP);
  rect(ctx, x, fY - 1 + shift, 2, 2, TOXIC_BRIGHT);
  px(ctx, x + shift, fY - 2, TOXIC_YELLOW);
}

/** Draw a messy pile of scrap metal, planks, and bones around (cx, cy). */
function drawJunkPile(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
  rect(ctx, cx - 4, cy - 1, 8, 3, OUT);
  rect(ctx, cx - 3, cy - 1, 6, 2, IRON_MID);
  rect(ctx, cx - 2, cy - 2, 4, 2, RUST_MID);
  px(ctx, cx - 2, cy - 2, RUST_TOP);
  px(ctx, cx + 1, cy - 1, IRON_TOP);
  rect(ctx, cx - 3, cy, 2, 1, BONE_LIGHT);
}

// ============================================================================
// RESIDENTIAL
// ============================================================================

/** 1. COTTAGE (Residential starter hovel, 6 citizens, height 0.8) */
function buildCottage(): HTMLCanvasElement[] {
  return [0, 1].map((frame) => {
    const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

    // Mud and bog-moss foundation mound
    isoDiamond(ctx, 32, 48, 22, MUD_DARK, OUT);
    isoDiamond(ctx, 32, 48, 18, MUD_MID, BOG_DARK);

    const fx = 32, fy = 55, wL = 12, wR = 14, wallH = 9;

    // Crooked mud & timber plank walls
    isoBox(ctx, fx, fy, wL, wR, 2, { top: MUD_MID, left: MUD_DARK, right: WOOD_DARK });
    isoBox(ctx, fx, fy - 2, wL, wR, wallH - 2, { top: WOOD_TOP, left: WOOD_DARK, right: WOOD_MID });

    // Patchwork scrap iron reinforcement plates
    rightWallRect(ctx, fx, fy, 1, 3, 4, 4, OUT);
    rightWallRect(ctx, fx, fy, 2, 4, 2, 2, RUST_MID);

    // Crooked plank door on right wall
    rightWallRect(ctx, fx, fy, 8, 1, 4, 6, OUT);
    rightWallRect(ctx, fx, fy, 9, 1, 2, 5, RUST_DARK);
    px(ctx, fx + 10, fy - (10 >> 1) - 3, BONE_LIGHT); // bone latch

    // Glowing barred slit window on left wall
    leftWallRect(ctx, fx, fy, 4, 3, 4, 3, OUT);
    leftWallRect(ctx, fx, fy, 5, 4, 2, 1, frame === 0 ? TOXIC_BRIGHT : TOXIC_YELLOW);

    // Corrugated rusted tin & sagging scrap thatch roof
    isoPitchedRoof(ctx, fx, fy, wL + 2, wR + 2, wallH, 6, {
      leftSlope: RUST_DARK,
      rightSlope: RUST_MID,
      gable: WOOD_DARK,
      ridge: RUST_TOP,
    });

    // Tilted rusted stovepipe chimney on back roof slope
    const chX = 35, chY = 33;
    rect(ctx, chX - 1, chY - 4, 3, 5, OUT);
    rect(ctx, chX, chY - 3, 1, 4, IRON_MID);
    px(ctx, chX, chY - 5 - (frame % 2), TOXIC_MID);

    // Front yard details: skull trophy and junk scrap
    drawSkull(ctx, 24, 53, false);
    drawJunkPile(ctx, 42, 54);

    return canvas;
  });
}

/** 2. LONGHOUSE (Residential communal hall, 18 citizens, height 1.0) */
function buildLonghouse(): HTMLCanvasElement[] {
  return [0, 1].map((frame) => {
    const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

    // Mud and scrap timber sleeper yard
    isoDiamond(ctx, 32, 48, 28, MUD_DARK, OUT);
    isoDiamond(ctx, 32, 48, 24, MUD_MID, BOG_DARK);

    const fx = 28, fy = 57, wL = 12, wR = 26, wallH = 10;

    // Heavy rough-hewn log & scavenged girder base course
    isoBox(ctx, fx, fy, wL, wR, 2, { top: IRON_DARK, left: MUD_DARK, right: WOOD_DARK });
    isoBox(ctx, fx, fy - 2, wL, wR, wallH - 2, { top: WOOD_TOP, left: WOOD_DARK, right: WOOD_MID });

    // Horizontal iron-brace straps
    leftWallRect(ctx, fx, fy, 1, 4, wL - 2, 1, IRON_MID);
    rightWallRect(ctx, fx, fy, 1, 4, wR - 2, 1, IRON_MID);

    // Front gable arched jaw-door on front-left wall
    leftWallRect(ctx, fx, fy, 3, 1, 6, 7, OUT);
    leftWallRect(ctx, fx, fy, 4, 1, 4, 6, RUST_DARK);
    px(ctx, fx - 1 - 5, fy - (5 >> 1) - 3, BONE_LIGHT);

    // Two side doors along the long right wall
    for (const vDoor of [4, 16]) {
      rightWallRect(ctx, fx, fy, vDoor, 1, 4, 6, OUT);
      rightWallRect(ctx, fx, fy, vDoor + 1, 1, 2, 5, WOOD_DARK);
    }

    // Narrow smoke slits with toxic-green/amber fire glow
    for (const vWin of [10, 22]) {
      rightWallRect(ctx, fx, fy, vWin, 5, 3, 2, OUT);
      rightWallRect(ctx, fx, fy, vWin + 1, 5, 1, 1, frame === 0 ? TOXIC_BRIGHT : TOXIC_YELLOW);
    }

    // Steep sagged Nordic-goblin patchwork roof (rust sheets + blackened timber)
    isoPitchedRoof(ctx, fx, fy, wL + 2, wR + 2, wallH, 10, {
      leftSlope: RUST_DARK,
      rightSlope: RUST_MID,
      gable: WOOD_DARK,
      ridge: RUST_TOP,
    });

    // Crossed animal rib finials rising above front gable peak
    const peakX = fx - 1 - (wL >> 1);
    const peakY = fy - wallH - ((wL >> 1) >> 1) - 10;
    rect(ctx, peakX - 2, peakY - 4, 1, 5, OUT);
    rect(ctx, peakX + 2, peakY - 4, 1, 5, OUT);
    px(ctx, peakX - 2, peakY - 4, BONE_LIGHT);
    px(ctx, peakX + 2, peakY - 4, BONE_LIGHT);

    // Front yard: green torch and junk piles
    drawGreenTorch(ctx, 21, 56, 6, frame);
    drawJunkPile(ctx, 45, 52);

    return canvas;
  });
}

/** 3. TENEMENT (Residential crowded shanty-stack, 40 citizens, height 1.8) */
function buildTenement(): HTMLCanvasElement[] {
  return [0, 1].map((frame) => {
    const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

    // Muddy cobblestone & scrap iron ground
    isoDiamond(ctx, 32, 48, 26, MUD_DARK, OUT);
    isoDiamond(ctx, 32, 48, 22, MUD_MID, IRON_DARK);

    const fx = 32, fy = 57, wL = 16, wR = 18;

    // Tier 1: Ground floor (h=10)
    isoBox(ctx, fx, fy, wL, wR, 10, { top: WOOD_TOP, left: WOOD_DARK, right: WOOD_MID });
    // Tier 2: Mid floor (h=9, offset)
    isoBox(ctx, fx - 1, fy - 10, wL - 1, wR - 1, 9, { top: RUST_TOP, left: RUST_DARK, right: RUST_MID });
    // Tier 3: Leaning attic floor (h=8)
    isoBox(ctx, fx, fy - 19, wL - 3, wR - 3, 8, { top: IRON_TOP, left: IRON_DARK, right: IRON_MID });

    // Patchwork scrap plates and belt seams
    rightWallRect(ctx, fx, fy, 1, 9, wR - 2, 1, OUT);
    rightWallRect(ctx, fx - 1, fy - 10, 1, 8, wR - 3, 1, OUT);

    // Ground entrance door on right wall
    rightWallRect(ctx, fx, fy, 2, 1, 4, 7, OUT);
    rightWallRect(ctx, fx, fy, 3, 1, 2, 6, RUST_DARK);

    // Grid of crooked lit windows with toxic glow across all floors
    for (const v of [8, 13]) {
      rightWallRect(ctx, fx, fy, v, 3, 3, 4, OUT);
      rightWallRect(ctx, fx, fy, v + 1, 4, 1, 2, frame === 0 ? TOXIC_BRIGHT : TOXIC_YELLOW);
    }
    for (const v of [3, 8, 12]) {
      rightWallRect(ctx, fx - 1, fy - 10, v, 3, 3, 4, OUT);
      rightWallRect(ctx, fx - 1, fy - 10, v + 1, 4, 1, 2, frame === 1 ? TOXIC_BRIGHT : TOXIC_YELLOW);
    }
    for (const v of [3, 8]) {
      rightWallRect(ctx, fx, fy - 19, v, 2, 3, 3, OUT);
      rightWallRect(ctx, fx, fy - 19, v + 1, 3, 1, 1, TOXIC_YELLOW);
    }

    // Rusty iron fire escape ladder and catwalk on left wall
    leftWallRect(ctx, fx, fy, 3, 9, 8, 1, IRON_LIGHT);
    leftWallRect(ctx, fx - 1, fy - 10, 3, 8, 8, 1, IRON_LIGHT);
    leftWallRect(ctx, fx, fy, 4, 1, 1, 17, IRON_MID);
    leftWallRect(ctx, fx, fy, 9, 1, 1, 17, IRON_MID);

    // Flapping line of tattered loot rags strung along facade
    const lx0 = fx + 4;
    const ly0 = fy - (4 >> 1) - 13;
    const lx1 = fx + 15;
    const ly1 = fy - (15 >> 1) - 13;
    for (let x = lx0; x <= lx1; x++) {
      const t = (x - lx0) / (lx1 - lx0);
      const y = Math.round(ly0 + t * (ly1 - ly0) + Math.sin(t * Math.PI) * 2);
      px(ctx, x, y, OUT);
    }
    px(ctx, lx0 + 2, ly0 + 2 + (frame % 2), BONE_LIGHT);
    px(ctx, lx0 + 5, ly0 + 3 - (frame % 2), RUST_LIGHT);
    px(ctx, lx0 + 8, ly0 + 3 + (frame % 2), TOXIC_MID);
    px(ctx, lx0 + 10, ly0 + 2, IRON_LIGHT);

    // Rooftop scrap junk barrel
    rect(ctx, 29, 21, 4, 5, OUT);
    rect(ctx, 30, 22, 2, 4, RUST_MID);

    drawSkull(ctx, 42, 54, true);

    return canvas;
  });
}

/** 4. VILLA (Residential warlord manse / mud-court villa, 16 citizens, height 1.4) */
function buildVilla(): HTMLCanvasElement[] {
  return [0, 1].map((frame) => {
    const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

    // Mud yard and scrap courtyard paving
    isoDiamond(ctx, 32, 48, 28, MUD_DARK, OUT);
    isoDiamond(ctx, 32, 48, 24, MUD_MID, BOG_DARK);

    // Back-left main hall wing
    const mFx = 29, mFy = 54, mWl = 14, mWr = 10, mH = 14;
    isoBox(ctx, mFx, mFy, mWl, mWr, 2, { top: IRON_DARK, left: MUD_DARK, right: WOOD_DARK });
    isoBox(ctx, mFx, mFy - 2, mWl, mWr, mH - 2, { top: WOOD_TOP, left: WOOD_DARK, right: WOOD_MID });

    // Windows on main wing
    leftWallRect(ctx, mFx, mFy, 3, 4, 3, 5, OUT);
    leftWallRect(ctx, mFx, mFy, 4, 5, 1, 3, frame === 0 ? TOXIC_BRIGHT : TOXIC_YELLOW);
    leftWallRect(ctx, mFx, mFy, 8, 4, 3, 5, OUT);
    leftWallRect(ctx, mFx, mFy, 9, 5, 1, 3, frame === 1 ? TOXIC_BRIGHT : TOXIC_YELLOW);

    isoPitchedRoof(ctx, mFx, mFy, mWl + 2, mWr + 2, mH, 7, {
      leftSlope: RUST_DARK,
      rightSlope: RUST_MID,
      gable: WOOD_DARK,
      ridge: RUST_TOP,
    });

    // Front-right cross wing
    const cFx = 39, cFy = 54, cWl = 8, cWr = 12, cH = 12;
    isoBox(ctx, cFx, cFy, cWl, cWr, 2, { top: IRON_DARK, left: MUD_DARK, right: WOOD_DARK });
    isoBox(ctx, cFx, cFy - 2, cWl, cWr, cH - 2, { top: RUST_TOP, left: RUST_DARK, right: RUST_MID });

    rightWallRect(ctx, cFx, cFy, 2, 3, 3, 5, OUT);
    rightWallRect(ctx, cFx, cFy, 3, 4, 1, 3, TOXIC_YELLOW);
    rightWallRect(ctx, cFx, cFy, 7, 3, 3, 5, OUT);
    rightWallRect(ctx, cFx, cFy, 8, 4, 1, 3, TOXIC_BRIGHT);

    isoPitchedRoof(ctx, cFx, cFy, cWl + 2, cWr + 2, cH, 6, {
      leftSlope: RUST_DARK,
      rightSlope: RUST_MID,
      gable: WOOD_DARK,
      ridge: RUST_TOP,
    });

    // Courtyard bone pillars supporting scrap tin awning
    for (const vCol of [1, 5, 9]) {
      const colX = 26 + vCol;
      const colY = 56 - (vCol >> 1);
      rect(ctx, colX - 1, colY - 7, 2, 8, OUT);
      rect(ctx, colX, colY - 6, 1, 6, BONE_LIGHT);
      px(ctx, colX, colY - 7, BONE_MID);
    }

    // Bubbling toxic slime basin in courtyard center
    disc(ctx, 32, 53, 4, OUT);
    disc(ctx, 32, 53, 3, IRON_MID);
    disc(ctx, 32, 53, 2, TOXIC_DEEP);
    px(ctx, 32 + (frame % 2), 52, TOXIC_BRIGHT);

    drawSkull(ctx, 28, 38, true);
    drawSkull(ctx, 42, 42, true);

    return canvas;
  });
}

/** 5. HIGHRISE (Residential scrap spire, 60 citizens, height 2.4) */
function buildHighrise(): HTMLCanvasElement[] {
  return [0, 1].map((frame) => {
    const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

    // Mud and scrap iron plaza
    isoDiamond(ctx, 32, 48, 25, IRON_DARK, OUT);
    isoDiamond(ctx, 32, 48, 21, MUD_MID, IRON_MID);

    // Tier 1: Base fortress (h=14, fx=32, fy=58, w=14)
    const t1Fx = 32, t1Fy = 58, t1W = 14, t1H = 14;
    isoBox(ctx, t1Fx, t1Fy, t1W, t1W, t1H, { top: IRON_TOP, left: IRON_DARK, right: IRON_MID });

    // Reinforced iron gate on right wall
    rightWallRect(ctx, t1Fx, t1Fy, 3, 1, 8, 8, OUT);
    rightWallRect(ctx, t1Fx, t1Fy, 4, 1, 6, 7, RUST_DARK);
    for (const v of [5, 7, 9]) {
      rightWallRect(ctx, t1Fx, t1Fy, v, 5, 1, 3, IRON_TOP);
    }

    // Tier 2: Mid spire (h=14, fx=31, fy=44, w=12)
    const t2Fx = 31, t2Fy = 44, t2W = 12, t2H = 14;
    isoBox(ctx, t2Fx, t2Fy, t2W, t2W, t2H, { top: RUST_TOP, left: RUST_DARK, right: RUST_MID });

    // Vertical rows of toxic-lit windows on Tier 2
    for (const v of [2, 5, 8]) {
      for (const z of [2, 6, 10]) {
        rightWallRect(ctx, t2Fx, t2Fy, v, z, 2, 3, OUT);
        rightWallRect(ctx, t2Fx, t2Fy, v, z + 1, 1, 2, z === 6 ? TOXIC_YELLOW : TOXIC_BRIGHT);
      }
    }
    for (const u of [2, 5, 8]) {
      for (const z of [2, 6, 10]) {
        leftWallRect(ctx, t2Fx, t2Fy, u, z, 2, 3, OUT);
        leftWallRect(ctx, t2Fx, t2Fy, u, z + 1, 1, 2, u === 5 ? TOXIC_YELLOW : TOXIC_DEEP);
      }
    }

    // Tier 3: Lookout tower (h=10, fx=30, fy=30, w=10)
    const t3Fx = 30, t3Fy = 30, t3W = 10, t3H = 10;
    isoBox(ctx, t3Fx, t3Fy, t3W, t3W, t3H, { top: IRON_TOP, left: IRON_DARK, right: IRON_MID });

    for (const v of [2, 6]) {
      for (const z of [2, 6]) {
        rightWallRect(ctx, t3Fx, t3Fy, v, z, 2, 2, OUT);
        rightWallRect(ctx, t3Fx, t3Fy, v, z, 1, 2, TOXIC_YELLOW);
      }
    }

    // Rooftop iron scrap water vat / boiler
    rect(ctx, 22, 10, 5, 6, OUT);
    rect(ctx, 23, 11, 3, 4, RUST_MID);

    // Tall jagged iron lightning antenna extending up to y = 3
    rect(ctx, 30, 3, 2, 13, OUT);
    rect(ctx, 30, 4, 1, 12, IRON_LIGHT);
    rect(ctx, 28, 7, 5, 1, IRON_TOP);
    rect(ctx, 29, 10, 3, 1, IRON_TOP);

    // Flashing toxic beacon lamp at summit (2 frames)
    const beaconCol = frame === 0 ? TOXIC_BRIGHT : TOXIC_YELLOW;
    rect(ctx, 29, 2, 3, 2, OUT);
    px(ctx, 30, 2, beaconCol);

    drawSkull(ctx, 32, 46, true);

    return canvas;
  });
}

// ============================================================================
// COMMERCE
// ============================================================================

/** 6. BAKERY (Commerce, bread counter, round oven with 2-frame smoke, h=1.0) */
function buildBakery(): HTMLCanvasElement[] {
  return [0, 1].map((frame) => {
    const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

    // Muddy cobblestone path
    isoDiamond(ctx, 32, 48, 26, MUD_DARK, OUT);
    isoDiamond(ctx, 32, 48, 22, MUD_MID, BOG_DARK);

    const fx = 32, fy = 56, wL = 16, wR = 18, wallH = 13;

    // Stone base course & dark wood/iron walls
    isoBox(ctx, fx, fy, wL, wR, 2, { top: IRON_DARK, left: MUD_DARK, right: WOOD_DARK });
    isoBox(ctx, fx, fy - 2, wL, wR, wallH - 2, { top: WOOD_TOP, left: WOOD_DARK, right: WOOD_MID });

    // Storefront on right wall: serving window and counter with food
    rightWallRect(ctx, fx, fy, 4, 2, 9, 7, OUT);
    rightWallRect(ctx, fx, fy, 5, 3, 7, 5, MUD_DARK);
    // Rough plank counter shelf
    rightWallRect(ctx, fx, fy, 3, 2, 11, 2, WOOD_DARK);
    // Charred loaves and glowing green mushroom pies on counter
    px(ctx, fx + 5, fy - (5 >> 1) - 4, RUST_LIGHT);
    px(ctx, fx + 6, fy - (6 >> 1) - 4, RUST_TOP);
    px(ctx, fx + 7, fy - (7 >> 1) - 4, RUST_MID);
    px(ctx, fx + 9, fy - (9 >> 1) - 4, TOXIC_DEEP);
    px(ctx, fx + 10, fy - (10 >> 1) - 4, TOXIC_BRIGHT);
    px(ctx, fx + 12, fy - (12 >> 1) - 4, RUST_LIGHT);

    // Corrugated rusted metal canopy over counter
    for (let v = 3; v <= 14; v++) {
      const isRust = (v & 1) === 0;
      const x = fx + v;
      const y = fy - (v >> 1) - 9;
      rect(ctx, x, y, 1, 2, isRust ? RUST_LIGHT : IRON_MID);
    }

    // Wrought-iron bracket with bone-pretzel guild sign
    const signX = fx + 2;
    const signY = fy - (2 >> 1) - 10;
    rect(ctx, signX - 1, signY, 3, 1, OUT);
    rect(ctx, signX, signY + 1, 1, 2, OUT);
    rect(ctx, signX - 1, signY + 3, 3, 3, BONE_LIGHT);
    px(ctx, signX, signY + 4, OUT);

    // Crooked back door
    rightWallRect(ctx, fx, fy, 14, 1, 3, 7, OUT);
    rightWallRect(ctx, fx, fy, 14, 1, 2, 6, RUST_DARK);

    // Pitched corrugated rust & wood roof
    isoPitchedRoof(ctx, fx, fy, wL + 2, wR + 2, wallH, 8, {
      leftSlope: RUST_DARK,
      rightSlope: RUST_MID,
      gable: WOOD_DARK,
      ridge: RUST_TOP,
    });

    // Round riveted iron bake oven protruding from left wall
    const ovenX = fx - 10;
    const ovenY = fy - 3;
    disc(ctx, ovenX, ovenY, 5, OUT);
    disc(ctx, ovenX, ovenY, 4, IRON_MID);
    disc(ctx, ovenX, ovenY, 2, frame === 0 ? RUST_TOP : TOXIC_BRIGHT); // glowing firemouth

    // Crooked chimney rising from oven
    rect(ctx, ovenX - 2, 20, 5, 24, OUT);
    rect(ctx, ovenX - 1, 21, 3, 23, IRON_DARK);
    rect(ctx, ovenX - 2, 20, 5, 2, RUST_MID);

    // 2-frame smoke puffs
    if (frame === 0) {
      disc(ctx, ovenX, 16, 2, IRON_LIGHT);
      disc(ctx, ovenX + 3, 11, 3, IRON_MID);
      px(ctx, ovenX + 1, 7, TOXIC_MID);
    } else {
      disc(ctx, ovenX + 1, 15, 3, IRON_MID);
      disc(ctx, ovenX + 2, 9, 2, IRON_LIGHT);
      px(ctx, ovenX + 4, 5, TOXIC_MID);
    }

    return canvas;
  });
}

/** 7. TEAHOUSE (Commerce, moonleaf tea / swamp brew, height 1.1) */
function buildTeahouse(): HTMLCanvasElement[] {
  return [0, 1].map((frame) => {
    const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

    // Boggy mire garden with dark stepping stones
    isoDiamond(ctx, 32, 48, 26, BOG_DARK, OUT);
    isoDiamond(ctx, 32, 48, 22, BOG_MID, MUD_DARK);

    // Wild thorny reeds at front-left
    rect(ctx, 19, 44, 1, 8, BOG_DARK);
    rect(ctx, 21, 42, 1, 9, BOG_LIGHT);
    px(ctx, 18, 43, TOXIC_DEEP);
    px(ctx, 22, 41, TOXIC_MID);

    const fx = 32, fy = 56, wL = 16, wR = 16, wallH = 12;

    // Raised dark timber deck
    isoBox(ctx, fx, fy, wL, wR, 3, { top: WOOD_MID, left: WOOD_DARK, right: WOOD_DARK });

    // Weathered timber & stained bone-cloth screen walls
    isoBox(ctx, fx, fy - 3, wL - 2, wR - 2, wallH - 3, { top: BONE_SHADOW, left: WOOD_DARK, right: BONE_MID });

    // Wooden vertical bars on facades
    for (const v of [2, 5, 8, 11]) {
      rightWallRect(ctx, fx, fy, v, 3, 1, wallH - 4, WOOD_DARK);
    }
    for (const u of [2, 5, 8, 11]) {
      leftWallRect(ctx, fx, fy, u, 3, 1, wallH - 4, WOOD_DARK);
    }

    // Slanted curved roof with dark green bog-slate & iron eaves
    isoPitchedRoof(ctx, fx, fy, wL + 2, wR + 2, wallH, 8, {
      leftSlope: BOG_DARK,
      rightSlope: BOG_MID,
      gable: WOOD_DARK,
      ridge: BOG_LIGHT,
    });

    // Hanging toxic green flask lanterns under eaves
    const l1X = fx + wR - 2;
    const l1Y = fy - (wR >> 1) - wallH + 2;
    rect(ctx, l1X, l1Y, 3, 4, OUT);
    rect(ctx, l1X + 1, l1Y + 1, 1, 2, TOXIC_DEEP);
    px(ctx, l1X + 1, l1Y + 2, frame === 0 ? TOXIC_BRIGHT : TOXIC_YELLOW);

    const l2X = fx + 2;
    const l2Y = fy - wallH + 1;
    rect(ctx, l2X, l2Y, 3, 4, OUT);
    rect(ctx, l2X + 1, l2Y + 1, 1, 2, TOXIC_DEEP);
    px(ctx, l2X + 1, l2Y + 2, frame === 1 ? TOXIC_BRIGHT : TOXIC_YELLOW);

    // Rough timber tea tables with steaming green bowls
    rect(ctx, 42, 50, 4, 2, WOOD_DARK);
    px(ctx, 43, 49, BONE_LIGHT);
    px(ctx, 44, 49, TOXIC_BRIGHT);

    rect(ctx, 23, 50, 4, 2, WOOD_DARK);
    px(ctx, 24, 49, BONE_LIGHT);
    px(ctx, 25, 49, TOXIC_BRIGHT);

    return canvas;
  });
}

/** 8. TAILOR (Commerce, tanner & scrap clothier, height 1.1) */
function buildTailor(): HTMLCanvasElement[] {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  // Mud & scrap iron flagstone pad
  isoDiamond(ctx, 32, 48, 25, MUD_DARK, OUT);
  isoDiamond(ctx, 32, 48, 21, MUD_MID, IRON_DARK);

  const fx = 31, fy = 56, wL = 14, wR = 18, wallH = 15;

  // Dark timber base & patchwork hide walls
  isoBox(ctx, fx, fy, wL, wR, 2, { top: WOOD_DARK, left: MUD_DARK, right: MUD_MID });
  isoBox(ctx, fx, fy - 2, wL, wR, wallH - 2, { top: WOOD_TOP, left: WOOD_DARK, right: WOOD_MID });

  // Entrance door on right wall
  rightWallRect(ctx, fx, fy, 2, 1, 3, 8, OUT);
  rightWallRect(ctx, fx, fy, 3, 1, 1, 7, RUST_DARK);
  px(ctx, fx + 3, fy - (3 >> 1) - 4, BONE_LIGHT);

  // Large display window showcasing scrap armor dummy
  rightWallRect(ctx, fx, fy, 6, 2, 9, 8, OUT);
  rightWallRect(ctx, fx, fy, 7, 3, 7, 6, MUD_DARK);

  // Dummy inside window: wooden stand, spiked scrap breastplate, skull helm
  const mX = fx + 10;
  const mY = fy - (10 >> 1) - 3;
  rect(ctx, mX, mY - 4, 1, 4, WOOD_MID);
  rect(ctx, mX - 1, mY - 4, 3, 3, IRON_LIGHT);
  px(ctx, mX, mY - 3, RUST_TOP);
  px(ctx, mX, mY - 5, BONE_LIGHT); // skull helm

  // Scalloped patchwork hide awning over storefront
  for (let v = 5; v <= 15; v++) {
    const isRust = (v & 1) === 0;
    const ax = fx + v;
    const ay = fy - (v >> 1) - 10;
    rect(ctx, ax, ay, 1, 3, isRust ? RUST_MID : BOG_MID);
    px(ctx, ax, ay + 3, isRust ? RUST_DARK : BOG_DARK);
  }

  // Wrought-iron bracket with giant rusted shears sign
  const sX = fx + 4;
  const sY = fy - (4 >> 1) - 11;
  rect(ctx, sX - 1, sY, 3, 1, OUT);
  rect(ctx, sX, sY + 1, 1, 2, OUT);
  px(ctx, sX - 1, sY + 3, IRON_TOP);
  px(ctx, sX + 1, sY + 3, IRON_TOP);
  px(ctx, sX, sY + 4, IRON_TOP);
  px(ctx, sX - 1, sY + 5, IRON_TOP);
  px(ctx, sX + 1, sY + 5, IRON_TOP);

  // Left wall: frame drying racks with stretched animal skins
  const bX = fx - 10;
  const bY = fy - 5;
  rect(ctx, bX, bY - 6, 4, 6, OUT);
  rect(ctx, bX + 1, bY - 5, 2, 4, BONE_MID);

  // Sagging mansard roof of dark timber & corrugated tin
  isoPitchedRoof(ctx, fx, fy, wL + 2, wR + 2, wallH, 8, {
    leftSlope: RUST_DARK,
    rightSlope: RUST_MID,
    gable: WOOD_DARK,
    ridge: RUST_TOP,
  });

  return [canvas];
}

/** 9. BAZAAR (Commerce, scrap market & fences, height 1.0) */
function buildBazaar(): HTMLCanvasElement[] {
  return [0, 1].map((frame) => {
    const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

    // Muddy market square with scrap borders
    isoDiamond(ctx, 32, 48, 28, MUD_DARK, OUT);
    isoDiamond(ctx, 32, 48, 24, MUD_MID, BOG_DARK);

    // Tattered rugs / hides laid out on square
    rect(ctx, 30, 48, 7, 4, OUT);
    rect(ctx, 31, 49, 5, 2, RUST_MID);
    px(ctx, 33, 49, BONE_LIGHT);

    rect(ctx, 22, 47, 6, 3, OUT);
    rect(ctx, 23, 48, 4, 1, BOG_MID);

    // Tent 1: Center-back tall conical marquee tent (Rust & Mud canvas)
    const t1Cx = 32, t1Cy = 36, t1R = 9, t1PeakY = 18;
    for (let dy = 0; dy <= 12; dy++) {
      const y = t1Cy - dy;
      const span = Math.round((t1R * (t1Cy - y)) / (t1Cy - t1PeakY));
      const half = Math.max(1, t1R - span);
      rect(ctx, t1Cx - half - 1, y, half * 2 + 2, 1, OUT);
      for (let dx = -half; dx <= half; dx++) {
        const isRust = (Math.abs(dx) % 3) === 0;
        px(ctx, t1Cx + dx, y, isRust ? RUST_MID : WOOD_DARK);
      }
    }
    // Horned skull finial on tent 1
    drawSkull(ctx, t1Cx, t1PeakY - 2, true);

    // Tent 2: Front-left scrap iron lean-to canopy
    const t2Fx = 23, t2Fy = 54;
    rect(ctx, t2Fx - 7, t2Fy - 8, 1, 6, WOOD_DARK);
    rect(ctx, t2Fx - 1, t2Fy - 8, 1, 6, WOOD_DARK);
    for (let u = 0; u < 8; u++) {
      const isRust = (u & 1) === 0;
      const ax = t2Fx - u;
      const ay = t2Fy - (u >> 1) - 6;
      rect(ctx, ax, ay, 2, 2, isRust ? RUST_LIGHT : IRON_MID);
    }

    // Tent 3: Front-right arched bog-hide shelter
    const t3Fx = 41, t3Fy = 52;
    rect(ctx, t3Fx - 1, t3Fy - 6, 1, 6, WOOD_DARK);
    rect(ctx, t3Fx + 5, t3Fy - 9, 1, 6, WOOD_DARK);
    for (let v = 0; v < 7; v++) {
      const isBog = (v & 1) === 0;
      const ax = t3Fx + v;
      const ay = t3Fy - (v >> 1) - 7;
      rect(ctx, ax, ay, 1, 3, isBog ? BOG_MID : MUD_MID);
    }

    // Goods for sale: shiny scrap gears, toxic potions, bone dice
    rect(ctx, 27, 52, 3, 2, WOOD_DARK);
    px(ctx, 28, 51, TOXIC_YELLOW); // shiny brass gear

    rect(ctx, 31, 54, 3, 2, WOOD_DARK);
    px(ctx, 32, 53, frame === 0 ? TOXIC_BRIGHT : TOXIC_DEEP); // glowing vial

    rect(ctx, 35, 53, 3, 2, WOOD_DARK);
    px(ctx, 36, 52, BONE_LIGHT); // bone dice

    drawGreenTorch(ctx, 45, 50, 6, frame);

    return canvas;
  });
}

/** 10. TRADEGUILD (Commerce, cartel headquarters & smugglers' hall, height 1.8) */
function buildTradeguild(): HTMLCanvasElement[] {
  return [0, 1].map((frame) => {
    const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

    // Dark iron & mud paved platform
    isoDiamond(ctx, 32, 48, 28, IRON_DARK, OUT);
    isoDiamond(ctx, 32, 48, 24, MUD_MID, IRON_MID);

    const fx = 32, fy = 56, wL = 18, wR = 20, wallH = 18;

    // Massive stone base & fortified timber/iron walls
    isoBox(ctx, fx, fy, wL + 2, wR + 2, 3, { top: IRON_DARK, left: MUD_DARK, right: IRON_MID });
    isoBox(ctx, fx, fy - 3, wL, wR, wallH - 3, { top: WOOD_TOP, left: WOOD_DARK, right: WOOD_MID });

    // Heavy iron vault doors on right wall
    rightWallRect(ctx, fx, fy, 7, 1, 6, 9, OUT);
    rightWallRect(ctx, fx, fy, 8, 2, 4, 8, IRON_DARK);
    px(ctx, fx + 9, fy - (9 >> 1) - 5, TOXIC_YELLOW); // padlock brass glint

    // Golden/iron Scales of Trade sign over entrance (weighing skull vs coin)
    const scX = fx + 10;
    const scY = fy - (10 >> 1) - 12;
    rect(ctx, scX, scY, 1, 4, IRON_LIGHT);
    rect(ctx, scX - 2, scY + 1, 5, 1, IRON_LIGHT);
    px(ctx, scX - 2, scY + 3, BONE_LIGHT); // skull on left pan
    px(ctx, scX + 2, scY + 3, TOXIC_YELLOW); // gold on right pan

    // Tattered cartel banner hanging down facade
    const bX = fx + 4;
    const bY = fy - (4 >> 1) - 14;
    rect(ctx, bX - 1, bY, 4, 9, OUT);
    rect(ctx, bX, bY + 1, 2, 7, RUST_DARK);
    px(ctx, bX, bY + 4, TOXIC_YELLOW);
    px(ctx, bX + 1, bY + 5, TOXIC_BRIGHT);

    // Barred slit windows with green glow
    for (const v of [1, 15]) {
      rightWallRect(ctx, fx, fy, v, 4, 3, 8, OUT);
      rightWallRect(ctx, fx, fy, v + 1, 5, 1, 6, frame === 0 ? TOXIC_BRIGHT : TOXIC_YELLOW);
    }
    for (const u of [3, 9, 14]) {
      leftWallRect(ctx, fx, fy, u, 4, 3, 8, OUT);
      leftWallRect(ctx, fx, fy, u + 1, 5, 1, 6, frame === 1 ? TOXIC_BRIGHT : TOXIC_YELLOW);
    }

    // Corrugated rust roof
    isoPitchedRoof(ctx, fx, fy, wL + 2, wR + 2, wallH, 8, {
      leftSlope: RUST_DARK,
      rightSlope: RUST_MID,
      gable: WOOD_DARK,
      ridge: RUST_TOP,
    });

    // Central Belfry / Clock Tower with giant cog clock
    const tFx = 32, tFy = 35, tW = 8, tH = 14;
    isoBox(ctx, tFx, tFy, tW, tW, tH, { top: IRON_TOP, left: IRON_DARK, right: IRON_MID });

    // Working jagged mechanical cog clock face
    const clockX = tFx + 2;
    const clockY = tFy - (2 >> 1) - 7;
    disc(ctx, clockX, clockY, 3, OUT);
    disc(ctx, clockX, clockY, 2, RUST_LIGHT);
    px(ctx, clockX, clockY, OUT);
    px(ctx, clockX, clockY - 1, IRON_TOP);
    px(ctx, clockX + 1, clockY, IRON_TOP);

    // Tower copper-corroded peaked roof with iron finial spike
    rect(ctx, tFx - 1, tFy - tH - 5, 2, 6, OUT);
    px(ctx, tFx - 1, tFy - tH - 5, BONE_LIGHT);

    return canvas;
  });
}

// ============================================================================
// INDUSTRY
// ============================================================================

/** 11. FISHERY (Industry, stilt dock over bog water, height 0.7, 2 frames) */
function buildFishery(): HTMLCanvasElement[] {
  return [0, 1].map((frame) => {
    const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

    // Muddy shoreline & murky bog water
    isoDiamond(ctx, 32, 48, 27, MUD_DARK, OUT);
    isoDiamond(ctx, 32, 48, 23, BOG_DARK, MUD_MID);

    // Murky green water pool on right side with animated ripples
    rect(ctx, 32, 49, 14, 8, BOG_DARK);
    rect(ctx, 34, 51, 10, 4, TOXIC_DEEP);
    px(ctx, 35 + (frame % 2) * 2, 52, TOXIC_MID);
    px(ctx, 40 - (frame % 2) * 2, 53, TOXIC_BRIGHT);

    // Stilt timber dock extending over water
    isoBox(ctx, 28, 54, 12, 14, 4, { top: WOOD_MID, left: WOOD_DARK, right: WOOD_DARK });

    // Stilt support poles dipping into water
    rect(ctx, 35, 52, 1, 6, WOOD_DARK);
    rect(ctx, 39, 50, 1, 6, WOOD_DARK);
    rect(ctx, 25, 54, 1, 6, WOOD_DARK);

    // Small ramshackle stilt fishing shack on back-left of pier
    const sFx = 24, sFy = 50, sWl = 8, sWr = 8, sH = 8;
    isoBox(ctx, sFx, sFy, sWl, sWr, sH, { top: RUST_TOP, left: WOOD_DARK, right: RUST_MID });
    rightWallRect(ctx, sFx, sFy, 2, 1, 3, 5, OUT);
    rightWallRect(ctx, sFx, sFy, 3, 1, 1, 4, MUD_DARK);

    // Corrugated rust roof on fishing shack
    isoPitchedRoof(ctx, sFx, sFy, sWl + 2, sWr + 2, sH, 4, {
      leftSlope: RUST_DARK,
      rightSlope: RUST_MID,
      gable: WOOD_DARK,
      ridge: RUST_TOP,
    });

    // Fish drying racks on pier with spiky bog-eels
    rect(ctx, 32, 42, 6, 1, WOOD_LIGHT);
    rect(ctx, 32, 43, 1, 5, WOOD_DARK);
    rect(ctx, 37, 43, 1, 5, WOOD_DARK);
    px(ctx, 33, 44, IRON_LIGHT);
    px(ctx, 34, 44, BONE_LIGHT);
    px(ctx, 35, 44, IRON_LIGHT);
    px(ctx, 36, 44, BONE_LIGHT);

    // Iron-hooped barrel of green bog-fish
    rect(ctx, 22, 52, 4, 5, OUT);
    rect(ctx, 23, 53, 2, 3, RUST_MID);
    px(ctx, 23, 52, TOXIC_MID);
    px(ctx, 24, 52, TOXIC_BRIGHT);

    // Wooden crane pole with bone hook
    rect(ctx, 41, 38, 1, 9, WOOD_MID);
    rect(ctx, 38, 38, 4, 1, WOOD_MID);
    px(ctx, 38, 39, BONE_LIGHT);

    return canvas;
  });
}

/** 12. WINDMILL (Industry, scrap turbine & bone mill, height 1.8, 3 frames) */
function buildWindmill(): HTMLCanvasElement[] {
  return [0, 1, 2].map((frame) => {
    const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

    // Mud and scrap sleeper base
    isoDiamond(ctx, 32, 48, 27, MUD_DARK, OUT);
    isoDiamond(ctx, 32, 48, 22, MUD_MID, BOG_DARK);

    // Squat, heavy tapering mill tower of bolted iron & timber
    isoBox(ctx, 32, 56, 12, 12, 18, { top: IRON_TOP, left: IRON_DARK, right: IRON_MID });

    // Iron reinforcement bands
    rightWallRect(ctx, 32, 56, 1, 6, 10, 1, RUST_MID);
    rightWallRect(ctx, 32, 56, 1, 12, 10, 1, RUST_MID);
    leftWallRect(ctx, 32, 56, 1, 6, 10, 1, RUST_DARK);
    leftWallRect(ctx, 32, 56, 1, 12, 10, 1, RUST_DARK);

    // Low iron hatch door
    rightWallRect(ctx, 32, 56, 3, 1, 4, 6, OUT);
    rightWallRect(ctx, 32, 56, 4, 1, 2, 5, RUST_DARK);

    // Conical corrugated rust roof cap
    isoPitchedRoof(ctx, 32, 38, 14, 14, 0, 7, {
      leftSlope: RUST_DARK,
      rightSlope: RUST_MID,
      gable: WOOD_DARK,
      ridge: RUST_TOP,
    });

    // Rotating 4-arm jagged scrap turbine sails (hub at x=32, y=28)
    const hubX = 32, hubY = 28;
    rect(ctx, hubX - 1, hubY - 1, 3, 3, OUT);
    rect(ctx, hubX, hubY, 1, 1, TOXIC_YELLOW);

    // 3 rotation frames
    if (frame === 0) {
      // Plus orientation (+)
      rect(ctx, hubX, hubY - 13, 2, 13, OUT);
      rect(ctx, hubX + 1, hubY - 12, 4, 10, RUST_LIGHT);
      rect(ctx, hubX - 1, hubY + 1, 2, 13, OUT);
      rect(ctx, hubX - 5, hubY + 2, 4, 10, IRON_MID);
      rect(ctx, hubX - 13, hubY - 1, 13, 2, OUT);
      rect(ctx, hubX - 12, hubY - 5, 10, 4, RUST_LIGHT);
      rect(ctx, hubX + 1, hubY, 13, 2, OUT);
      rect(ctx, hubX + 2, hubY + 1, 10, 4, IRON_MID);
    } else if (frame === 1) {
      // Diagonal orientation (X)
      for (let d = 2; d <= 11; d++) {
        rect(ctx, hubX + d - 1, hubY - d - 1, 2, 2, OUT);
        px(ctx, hubX + d, hubY - d, RUST_TOP);
        px(ctx, hubX + d, hubY - d - 1, RUST_LIGHT);

        rect(ctx, hubX - d - 1, hubY + d - 1, 2, 2, OUT);
        px(ctx, hubX - d, hubY + d, IRON_LIGHT);
        px(ctx, hubX - d, hubY + d + 1, IRON_DARK);

        rect(ctx, hubX - d - 1, hubY - d - 1, 2, 2, OUT);
        px(ctx, hubX - d, hubY - d, RUST_LIGHT);
        px(ctx, hubX - d - 1, hubY - d, RUST_MID);

        rect(ctx, hubX + d - 1, hubY + d - 1, 2, 2, OUT);
        px(ctx, hubX + d, hubY + d, IRON_LIGHT);
        px(ctx, hubX + d + 1, hubY + d, IRON_MID);
      }
    } else {
      // Tilted / offset diagonal
      for (let d = 2; d <= 11; d++) {
        const dx = Math.round(d * 0.9);
        const dy = Math.round(d * 0.6);
        rect(ctx, hubX + dx - 1, hubY - dy - 1, 2, 2, OUT);
        px(ctx, hubX + dx, hubY - dy, RUST_TOP);
        rect(ctx, hubX - dx - 1, hubY + dy - 1, 2, 2, OUT);
        px(ctx, hubX - dx, hubY + dy, IRON_MID);

        rect(ctx, hubX - dy - 1, hubY - dx - 1, 2, 2, OUT);
        px(ctx, hubX - dy, hubY - dx, RUST_LIGHT);
        rect(ctx, hubX + dy - 1, hubY + dx - 1, 2, 2, OUT);
        px(ctx, hubX + dy, hubY + dx, IRON_LIGHT);
      }
    }

    // Sacks of bone flour beside mill
    isoBox(ctx, 42, 56, 4, 4, 3, { top: BONE_LIGHT, left: WOOD_DARK, right: WOOD_MID });

    return canvas;
  });
}

/** 13. SAWMILL (Industry, steam buzzsaw yard, height 1.1, 2 frames) */
function buildSawmill(): HTMLCanvasElement[] {
  return [0, 1].map((frame) => {
    const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

    // Mud and sawdust ground
    isoDiamond(ctx, 32, 48, 27, MUD_DARK, OUT);
    isoDiamond(ctx, 32, 48, 23, MUD_MID, WOOD_DARK);

    // Open timber mill shed on back-left
    const fx = 30, fy = 54, wL = 14, wR = 16, wallH = 11;
    isoBox(ctx, fx, fy, wL, wR, wallH, { top: WOOD_TOP, left: WOOD_DARK, right: WOOD_MID });

    // Open work bay on right facade
    rightWallRect(ctx, fx, fy, 2, 1, 12, 8, MUD_DARK);

    // Corrugated rust roof
    isoPitchedRoof(ctx, fx, fy, wL + 2, wR + 2, wallH, 6, {
      leftSlope: RUST_DARK,
      rightSlope: RUST_MID,
      gable: WOOD_DARK,
      ridge: RUST_TOP,
    });

    // Small iron steam boiler at back with fuming pipe
    rect(ctx, 20, 36, 4, 6, OUT);
    rect(ctx, 21, 37, 2, 5, IRON_MID);
    rect(ctx, 22, 26, 2, 10, OUT);
    rect(ctx, 22, 27, 1, 9, RUST_LIGHT);
    disc(ctx, 22 + (frame % 2), 23 - (frame % 2), 2, IRON_LIGHT);

    // Heavy log cradle holding a timber log
    isoBox(ctx, 36, 54, 6, 10, 4, { top: WOOD_LIGHT, left: WOOD_DARK, right: WOOD_MID });

    // GIANT SPINNING CIRCULAR BUZZSAW BLADE (center at x=35, y=46)
    const sawX = 35, sawY = 46;
    disc(ctx, sawX, sawY, 5, OUT);
    disc(ctx, sawX, sawY, 4, IRON_LIGHT);
    disc(ctx, sawX, sawY, 2, IRON_DARK);
    px(ctx, sawX, sawY, TOXIC_YELLOW); // axle nut

    // 2-frame saw teeth & sparks
    if (frame === 0) {
      px(ctx, sawX, sawY - 5, IRON_TOP);
      px(ctx, sawX, sawY + 5, IRON_TOP);
      px(ctx, sawX - 5, sawY, IRON_TOP);
      px(ctx, sawX + 5, sawY, IRON_TOP);
      px(ctx, sawX + 6, sawY + 2, TOXIC_YELLOW); // flying sparks!
    } else {
      px(ctx, sawX - 4, sawY - 4, IRON_TOP);
      px(ctx, sawX + 4, sawY + 4, IRON_TOP);
      px(ctx, sawX - 4, sawY + 4, IRON_TOP);
      px(ctx, sawX + 4, sawY - 4, IRON_TOP);
      px(ctx, sawX + 7, sawY + 1, RUST_TOP); // flying sparks!
    }

    // Sawdust piles in front yard
    rect(ctx, 42, 53, 5, 2, WOOD_TOP);
    px(ctx, 44, 52, WOOD_LIGHT);

    return canvas;
  });
}

/** 14. SMELTER (Industry, iron ore blast kiln, height 1.3, 2 frames) */
function buildSmelter(): HTMLCanvasElement[] {
  return [0, 1].map((frame) => {
    const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

    // Blackened slag & mud foundation
    isoDiamond(ctx, 32, 48, 28, IRON_DARK, OUT);
    isoDiamond(ctx, 32, 48, 24, MUD_DARK, IRON_MID);

    const fx = 32, fy = 56, wL = 16, wR = 16, wallH = 14;

    // Squat, heavy stone & iron blast furnace
    isoBox(ctx, fx, fy, wL, wR, wallH, { top: IRON_TOP, left: IRON_DARK, right: IRON_MID });

    // Bolted iron reinforcement plates
    rightWallRect(ctx, fx, fy, 1, 5, wR - 2, 2, RUST_MID);
    leftWallRect(ctx, fx, fy, 1, 5, wL - 2, 2, RUST_DARK);

    // Open glowing slag tap-hole on right wall pouring molten metal
    rightWallRect(ctx, fx, fy, 4, 1, 6, 6, OUT);
    rightWallRect(ctx, fx, fy, 5, 1, 4, 5, frame === 0 ? RUST_TOP : TOXIC_YELLOW);
    rightWallRect(ctx, fx, fy, 6, 2, 2, 3, frame === 0 ? TOXIC_YELLOW : TOXIC_BRIGHT);

    // Molten iron runoff trough leading forward
    rect(ctx, 38, 54, 8, 3, OUT);
    rect(ctx, 39, 55, 6, 1, frame === 0 ? TOXIC_YELLOW : RUST_TOP);

    // Twin crooked smokestacks venting dark smoke
    for (let i = 0; i < 11; i++) {
      rect(ctx, 24 - (i >> 2), 34 - i, 4, 1, OUT);
      rect(ctx, 25 - (i >> 2), 34 - i, 2, 1, IRON_DARK);
    }
    for (let i = 0; i < 13; i++) {
      rect(ctx, 34 + (i >> 2), 32 - i, 4, 1, OUT);
      rect(ctx, 35 + (i >> 2), 32 - i, 2, 1, RUST_MID);
    }

    // Smoke puffs
    if (frame === 0) {
      disc(ctx, 21, 20, 2, IRON_LIGHT);
      disc(ctx, 38, 16, 3, IRON_MID);
      px(ctx, 39, 15, TOXIC_MID);
    } else {
      disc(ctx, 20, 18, 3, IRON_MID);
      disc(ctx, 39, 14, 2, IRON_LIGHT);
      px(ctx, 21, 17, TOXIC_MID);
    }

    // Heaps of raw rust ore in yard
    rect(ctx, 21, 53, 5, 3, OUT);
    rect(ctx, 22, 54, 3, 2, RUST_DARK);
    px(ctx, 23, 53, RUST_TOP);

    drawGreenTorch(ctx, 46, 52, 6, frame);

    return canvas;
  });
}

/** 15. CRAFTHALL (Industry, machine hall & tinkers' foundry, height 1.4) */
function buildCrafthall(): HTMLCanvasElement[] {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  // Mud and iron-plated work yard
  isoDiamond(ctx, 32, 48, 28, IRON_DARK, OUT);
  isoDiamond(ctx, 32, 48, 24, MUD_MID, IRON_MID);

  const fx = 32, fy = 56, wL = 18, wR = 18, wallH = 14;

  // Heavy timber & iron workshop walls
  isoBox(ctx, fx, fy, wL, wR, wallH, { top: WOOD_TOP, left: WOOD_DARK, right: WOOD_MID });

  // Bolted iron plates across facades
  leftWallRect(ctx, fx, fy, 2, 4, 6, 6, OUT);
  leftWallRect(ctx, fx, fy, 3, 5, 4, 4, RUST_MID);

  // Large open workshop bay on right wall
  rightWallRect(ctx, fx, fy, 3, 1, 12, 9, OUT);
  rightWallRect(ctx, fx, fy, 4, 1, 10, 8, MUD_DARK);

  // Anvil, vise & tool bench inside bay
  rightWallRect(ctx, fx, fy, 5, 1, 4, 3, IRON_TOP);
  rightWallRect(ctx, fx, fy, 10, 1, 3, 2, WOOD_DARK);

  // Wall-mounted toothed iron gear
  disc(ctx, fx - 10, fy - 16, 3, OUT);
  disc(ctx, fx - 10, fy - 16, 2, IRON_LIGHT);
  px(ctx, fx - 10, fy - 16, OUT);

  // Corrugated rust roof
  isoPitchedRoof(ctx, fx, fy, wL + 2, wR + 2, wallH, 8, {
    leftSlope: RUST_DARK,
    rightSlope: RUST_MID,
    gable: WOOD_DARK,
    ridge: RUST_TOP,
  });

  // Tilted iron chimney vent pipe
  rect(ctx, 28, 23, 3, 8, OUT);
  rect(ctx, 29, 24, 1, 7, IRON_MID);

  drawSkull(ctx, 32, 38, true);
  drawJunkPile(ctx, 45, 54);

  return [canvas];
}

/** 16. FOUNDRY (Industry, heavy dread foundry & cupola smokestack, height 1.9, 3 frames) */
function buildFoundry(): HTMLCanvasElement[] {
  return [0, 1, 2].map((frame) => {
    const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

    // Mud and slag foundation
    isoDiamond(ctx, 32, 48, 29, IRON_DARK, OUT);
    isoDiamond(ctx, 32, 48, 25, MUD_DARK, IRON_DARK);

    const fx = 34, fy = 57, wL = 16, wR = 18, wallH = 20;

    // Massive black iron & rust foundry hall
    isoBox(ctx, fx, fy, wL, wR, wallH, { top: IRON_TOP, left: IRON_DARK, right: IRON_MID });

    // Huge conical riveted iron cupola smokestack on left side (x=22, y=49 rising to y=15)
    for (let i = 0; i < 20; i++) {
      const wStack = Math.max(4, 9 - (i >> 2));
      const shift = -(i >> 3);
      rect(ctx, 22 + shift - (wStack >> 1), 35 - i, wStack, 1, OUT);
      rect(ctx, 22 + shift - (wStack >> 1) + 1, 35 - i, wStack - 2, 1, i % 3 === 0 ? RUST_MID : IRON_MID);
    }

    // Billowing toxic-green and soot smoke clouds (3 frames)
    const puffOffsets: readonly (readonly [number, number, number])[][] = [
      [[19, 10, 3], [22, 5, 4], [25, 2, 3]],
      [[18, 9, 4], [23, 4, 3], [26, 1, 4]],
      [[20, 11, 3], [21, 6, 4], [24, 3, 3]],
    ];
    for (const [px0, py0, r] of puffOffsets[frame % 3]!) {
      disc(ctx, px0, py0, r, OUT);
      disc(ctx, px0, py0, r - 1, TOXIC_DEEP);
      px(ctx, px0, py0, TOXIC_BRIGHT);
    }

    // Right wall open casting arch
    rightWallRect(ctx, fx, fy, 4, 1, 10, 9, OUT);
    rightWallRect(ctx, fx, fy, 5, 1, 8, 8, MUD_DARK);

    // Molten glow inside casting arch
    rightWallRect(ctx, fx, fy, 6, 1, 6, 4, frame === 0 ? RUST_TOP : TOXIC_YELLOW);
    px(ctx, fx + 8, fy - (8 >> 1) - 3, TOXIC_BRIGHT);

    // Overhead scrap gantry crane with hanging crucible
    rect(ctx, 42, 36, 1, 10, IRON_LIGHT);
    rect(ctx, 38, 36, 5, 1, IRON_LIGHT);
    rect(ctx, 38, 37, 1, 3, OUT);
    px(ctx, 38, 40, frame === 1 ? TOXIC_YELLOW : RUST_TOP);

    // Stacks of cast iron ingots in yard
    rect(ctx, 44, 53, 5, 3, OUT);
    rect(ctx, 45, 54, 3, 2, IRON_TOP);

    return canvas;
  });
}

// ============================================================================
// SERVICES
// ============================================================================

/** 17. SHRINE (Services, bog-god totem & scrap altar, height 1.0, 2 frames) */
function buildShrine(): HTMLCanvasElement[] {
  return [0, 1].map((frame) => {
    const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

    // Peat mud & moss mound
    isoDiamond(ctx, 32, 48, 26, MUD_DARK, OUT);
    isoDiamond(ctx, 32, 48, 22, BOG_MID, MUD_DARK);

    // Stepped stone and timber altar mound
    isoBox(ctx, 32, 55, 12, 12, 5, { top: MUD_MID, left: MUD_DARK, right: WOOD_DARK });

    // Bone rib arches flanking the central totem
    rect(ctx, 23, 44, 2, 7, OUT);
    rect(ctx, 24, 45, 1, 5, BONE_LIGHT);
    rect(ctx, 39, 44, 2, 7, OUT);
    rect(ctx, 39, 45, 1, 5, BONE_LIGHT);

    // Central towering carved wooden totem pole (x=31, y=36 rising to y=18)
    rect(ctx, 30, 21, 4, 16, OUT);
    rect(ctx, 31, 22, 2, 14, WOOD_MID);

    // Crowned with a massive horned animal/bog-god skull
    drawSkull(ctx, 32, 20, true);
    // Glowing green eye sockets
    px(ctx, 31, 20, frame === 0 ? TOXIC_BRIGHT : TOXIC_YELLOW);
    px(ctx, 33, 20, frame === 0 ? TOXIC_BRIGHT : TOXIC_YELLOW);

    // Offering bowl at base with gold scrap and mushrooms
    rect(ctx, 30, 52, 5, 3, OUT);
    rect(ctx, 31, 53, 3, 1, RUST_MID);
    px(ctx, 31, 52, TOXIC_YELLOW); // shiny gold coin
    px(ctx, 33, 52, TOXIC_BRIGHT); // swamp shroom

    // Twin flickering green torches
    drawGreenTorch(ctx, 22, 53, 6, frame);
    drawGreenTorch(ctx, 42, 53, 6, frame + 1);

    return canvas;
  });
}

/** 18. GARDEN (Services, swamp fungi & thorn patch, height 0.4, 2 frames) */
function buildGarden(): HTMLCanvasElement[] {
  return [0, 1].map((frame) => {
    const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

    // Peat bog mud garden bed
    isoDiamond(ctx, 32, 48, 27, MUD_DARK, OUT);
    isoDiamond(ctx, 32, 48, 23, BOG_DARK, MUD_MID);

    // Enclosed by a low crooked fence of sharpened stakes and ribs
    for (let u = 0; u < 14; u += 3) {
      const x = 32 - u;
      const y = 48 + (u >> 1);
      rect(ctx, x, y - 4, 1, 4, u % 6 === 0 ? BONE_MID : WOOD_DARK);
    }
    for (let v = 0; v < 14; v += 3) {
      const x = 32 + v;
      const y = 48 + (v >> 1);
      rect(ctx, x, y - 4, 1, 4, v % 6 === 0 ? BONE_MID : WOOD_DARK);
    }

    // Stagnant puddle of dark green water
    rect(ctx, 27, 48, 9, 4, BOG_DARK);
    rect(ctx, 28, 49, 7, 2, TOXIC_DEEP);

    // Big bulbous orange spotted mushroom (left)
    disc(ctx, 24, 43, 4, OUT);
    disc(ctx, 24, 43, 3, RUST_TOP);
    px(ctx, 23, 42, TOXIC_YELLOW);
    px(ctx, 25, 43, TOXIC_YELLOW);
    rect(ctx, 24, 46, 1, 3, BONE_LIGHT);

    // Cluster of bioluminescent lime green mushrooms (center-right)
    disc(ctx, 37, 44, 3, OUT);
    disc(ctx, 37, 44, 2, frame === 0 ? TOXIC_BRIGHT : TOXIC_MID);
    rect(ctx, 37, 46, 1, 3, BONE_LIGHT);

    disc(ctx, 33, 42, 2, OUT);
    px(ctx, 33, 42, frame === 1 ? TOXIC_BRIGHT : TOXIC_YELLOW);
    rect(ctx, 33, 44, 1, 2, BONE_LIGHT);

    // Tangled dark thorn vines along back
    rect(ctx, 30, 36, 1, 5, BOG_DARK);
    px(ctx, 29, 37, BOG_LIGHT);
    px(ctx, 31, 39, BOG_LIGHT);

    return canvas;
  });
}

/** 19. THEATER (Services, brawl-pit & puppet grand guignol, height 1.5, 2 frames) */
function buildTheater(): HTMLCanvasElement[] {
  return [0, 1].map((frame) => {
    const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

    // Mud and scrap timber foundation
    isoDiamond(ctx, 32, 48, 28, MUD_DARK, OUT);
    isoDiamond(ctx, 32, 48, 24, MUD_MID, BOG_DARK);

    const fx = 32, fy = 56, wL = 16, wR = 18, wallH = 10;

    // Raised fighting/acting deck with dark wood planks
    isoBox(ctx, fx, fy, wL, wR, wallH, { top: WOOD_MID, left: WOOD_DARK, right: WOOD_DARK });

    // Spiked timber perimeter railing on front sides
    for (const v of [2, 6, 10, 14]) {
      rightWallRect(ctx, fx, fy, v, wallH + 1, 1, 3, WOOD_LIGHT);
      px(ctx, fx + v, fy - (v >> 1) - wallH - 3, BONE_LIGHT);
    }

    // Back stage puppet booth with tattered red/black curtain
    const pFx = 26, pFy = 46, pWl = 10, pWr = 8, pH = 12;
    isoBox(ctx, pFx, pFy, pWl, pWr, pH, { top: RUST_TOP, left: WOOD_DARK, right: RUST_MID });
    rightWallRect(ctx, pFx, pFy, 1, 2, 6, 8, RUST_DARK);
    px(ctx, pFx + 3, pFy - 1 - 5, TOXIC_YELLOW); // stage lantern

    // Two carved goblin skull masks mounted over the stage
    drawSkull(ctx, 26, 32, false);
    drawSkull(ctx, 32, 29, true);

    // Front stage apron footlights: flaming skull bowls (2 frames)
    for (const [bx, by] of [[28, 55], [34, 53], [40, 50]] as const) {
      rect(ctx, bx - 1, by, 3, 2, OUT);
      px(ctx, bx, by, BONE_LIGHT);
      px(ctx, bx, by - 1 - (frame % 2), frame === 0 ? TOXIC_BRIGHT : RUST_TOP);
    }

    // Rough spectator log benches in foreground
    rect(ctx, 43, 54, 5, 2, WOOD_DARK);
    rect(ctx, 21, 54, 5, 2, WOOD_DARK);

    return canvas;
  });
}

/** 20. OBSERVATORY (Services, scrap stargazer & spy-tower, height 2.0) */
function buildObservatory(): HTMLCanvasElement[] {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  // Mud and scrap iron foundation
  isoDiamond(ctx, 32, 48, 26, IRON_DARK, OUT);
  isoDiamond(ctx, 32, 48, 22, MUD_MID, IRON_MID);

  const fx = 32, fy = 56, wL = 12, wR = 12, wallH = 22;

  // Squat round/octagonal tower of riveted scrap boilers
  isoBox(ctx, fx, fy, wL, wR, wallH, { top: IRON_TOP, left: IRON_DARK, right: IRON_MID });

  // Iron climbing ladder on left wall
  for (let z = 2; z < wallH - 2; z += 3) {
    leftWallRect(ctx, fx, fy, 4, z, 4, 1, RUST_MID);
  }

  // Slit windows on right wall
  rightWallRect(ctx, fx, fy, 4, 8, 3, 4, OUT);
  rightWallRect(ctx, fx, fy, 5, 9, 1, 2, TOXIC_YELLOW);
  rightWallRect(ctx, fx, fy, 4, 16, 3, 4, OUT);
  rightWallRect(ctx, fx, fy, 5, 17, 1, 2, TOXIC_BRIGHT);

  // Hemispherical iron scrap dome on roof (center at x=32, y=28)
  const domeX = 32, domeY = 27;
  disc(ctx, domeX, domeY, 7, OUT);
  disc(ctx, domeX, domeY, 6, IRON_LIGHT);
  disc(ctx, domeX - 2, domeY - 2, 4, RUST_MID);

  // GIANT BRASS & IRON SPYGLASS TELESCOPE pointing up-left into the sky
  const scX0 = domeX + 2, scY0 = domeY - 1;
  for (let i = 0; i < 11; i++) {
    const tx = scX0 - i;
    const ty = scY0 - Math.round(i * 1.1);
    rect(ctx, tx - 1, ty - 1, 3, 3, OUT);
    rect(ctx, tx, ty, 2, 2, i < 5 ? RUST_TOP : IRON_TOP);
  }
  // Glowing glass objective lens at tip of telescope
  px(ctx, scX0 - 11, scY0 - 13, TOXIC_BRIGHT);
  px(ctx, scX0 - 10, scY0 - 13, TOXIC_YELLOW);

  // Weather vane on dome summit
  rect(ctx, domeX + 1, domeY - 9, 1, 4, IRON_LIGHT);
  px(ctx, domeX + 1, domeY - 10, BONE_LIGHT);

  drawSkull(ctx, 42, 54, false);

  return [canvas];
}

/** 21. HOSPITAL (Services, sawbones tent & leech apothecary, height 1.6) */
function buildHospital(): HTMLCanvasElement[] {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  // Mud and bone gravel base
  isoDiamond(ctx, 32, 48, 27, MUD_DARK, OUT);
  isoDiamond(ctx, 32, 48, 23, BONE_SHADOW, BOG_DARK);

  const fx = 32, fy = 55, wL = 15, wR = 16, wallH = 14;

  // Pale bone-plaster & bleached tin walls
  isoBox(ctx, fx, fy, wL, wR, wallH, { top: BONE_LIGHT, left: BONE_SHADOW, right: BONE_MID });
  isoBox(ctx, fx, fy, wL, wR, 2, { top: IRON_TOP, left: IRON_DARK, right: IRON_MID });

  // Flat patched tin roof with riveted rim
  isoDiamond(ctx, 32, 34, 11, IRON_MID, OUT);
  rect(ctx, 27, 25, 3, 9, OUT);
  rect(ctx, 28, 26, 1, 7, RUST_LIGHT);
  px(ctx, 28, 23, TOXIC_BRIGHT); // fuming herbal vapor

  // Bold green Healing Saw / Cross painted on right wall
  rightWallRect(ctx, fx, fy, 9, 4, 5, 7, OUT);
  rightWallRect(ctx, fx, fy, 11, 5, 1, 5, TOXIC_BRIGHT);
  rightWallRect(ctx, fx, fy, 10, 7, 3, 1, TOXIC_BRIGHT);

  // Clinic door & barred window
  rightWallRect(ctx, fx, fy, 3, 1, 4, 7, OUT);
  rightWallRect(ctx, fx, fy, 4, 1, 2, 6, WOOD_MID);
  leftWallRect(ctx, fx, fy, 5, 4, 5, 5, OUT);
  leftWallRect(ctx, fx, fy, 6, 5, 3, 3, TOXIC_YELLOW);

  // Three rusted tin-can herb pots growing glowing swamp herbs
  for (const [px0, py0] of [[23, 54], [37, 57], [43, 54]] as const) {
    isoBox(ctx, px0, py0, 4, 4, 3, { top: RUST_TOP, left: RUST_DARK, right: RUST_MID });
    rect(ctx, px0 - 1, py0 - 6, 3, 2, TOXIC_DEEP);
    px(ctx, px0, py0 - 7, TOXIC_BRIGHT);
  }

  return [canvas];
}

/** 22. UNIVERSITY (Services, academy of explosives & scavenging, height 2.2, 2 frames) */
function buildUniversity(): HTMLCanvasElement[] {
  return [0, 1].map((frame) => {
    const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

    // Mud and dark iron quadrangle base
    isoDiamond(ctx, 32, 48, 28, IRON_DARK, OUT);
    isoDiamond(ctx, 32, 48, 24, MUD_MID, IRON_MID);

    const fx = 32, fy = 56, wL = 18, wR = 20, wallH = 18;

    // Heavy dark timber & ashlar stone academy hall
    isoBox(ctx, fx, fy, wL + 2, wR + 2, 3, { top: IRON_DARK, left: MUD_DARK, right: WOOD_DARK });
    isoBox(ctx, fx, fy - 3, wL, wR, wallH - 3, { top: WOOD_TOP, left: WOOD_DARK, right: WOOD_MID });

    // Grand arched entryway on right wall
    rightWallRect(ctx, fx, fy, 7, 1, 6, 9, OUT);
    rightWallRect(ctx, fx, fy, 8, 2, 4, 8, MUD_DARK);

    // Multistory windows with flickering alchemical glow
    for (const v of [2, 14]) {
      rightWallRect(ctx, fx, fy, v, 4, 3, 6, OUT);
      rightWallRect(ctx, fx, fy, v + 1, 5, 1, 4, frame === 0 ? TOXIC_BRIGHT : TOXIC_YELLOW);
      rightWallRect(ctx, fx, fy, v, 11, 3, 5, OUT);
      rightWallRect(ctx, fx, fy, v + 1, 12, 1, 3, frame === 1 ? TOXIC_BRIGHT : TOXIC_YELLOW);
    }
    for (const u of [3, 9, 14]) {
      leftWallRect(ctx, fx, fy, u, 4, 3, 6, OUT);
      leftWallRect(ctx, fx, fy, u + 1, 5, 1, 4, frame === 1 ? TOXIC_BRIGHT : TOXIC_DEEP);
    }

    // Corrugated rust roof
    isoPitchedRoof(ctx, fx, fy, wL + 2, wR + 2, wallH, 8, {
      leftSlope: RUST_DARK,
      rightSlope: RUST_MID,
      gable: WOOD_DARK,
      ridge: RUST_TOP,
    });

    // Tall spire tower on left corner (reaching up to y=6)
    const spX = 24, spY = 32, spW = 6, spH = 18;
    isoBox(ctx, spX, spY, spW, spW, spH, { top: IRON_TOP, left: IRON_DARK, right: IRON_MID });
    isoPitchedRoof(ctx, spX, spY - spH, spW + 2, spW + 2, 0, 6, {
      leftSlope: BOG_DARK,
      rightSlope: BOG_MID,
      gable: WOOD_DARK,
      ridge: BOG_LIGHT,
    });

    // Sparking lightning rod at tower apex
    rect(ctx, spX - 1, 6, 1, 4, IRON_LIGHT);
    px(ctx, spX - 1, 5 - (frame % 2), TOXIC_BRIGHT);

    // Courtyard chalkboard with explosive diagrams & dynamite crates
    rect(ctx, 42, 52, 6, 4, OUT);
    rect(ctx, 43, 53, 4, 2, '#141820'); // black slate
    px(ctx, 44, 53, '#ffffff'); // formula chalk mark

    rect(ctx, 23, 53, 4, 3, OUT);
    rect(ctx, 24, 54, 2, 2, RUST_LIGHT); // explosive crate

    return canvas;
  });
}

// ============================================================================
// MILITARY
// ============================================================================

/** 23. PALISADE (Military, spiked scrap stockade, height 0.8) */
function buildPalisade(): HTMLCanvasElement[] {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  // Mud and trench ground
  isoDiamond(ctx, 32, 48, 27, MUD_DARK, OUT);
  isoDiamond(ctx, 32, 48, 23, MUD_MID, BOG_DARK);

  const fx = 32, fy = 56;

  // Cross-braced wooden walkway behind palisade
  leftWallRect(ctx, fx, fy, 1, 3, 16, 2, WOOD_DARK);
  rightWallRect(ctx, fx, fy, 1, 3, 16, 2, WOOD_DARK);

  // Jagged row of sharpened pine logs & rusted girders along left face
  for (let u = 0; u < 16; u += 2) {
    const x = fx - 1 - u;
    const yBot = fy - (u >> 1);
    const stakeH = u % 4 === 0 ? 11 : 8;
    rect(ctx, x - 1, yBot - stakeH, 2, stakeH + 1, OUT);
    rect(ctx, x, yBot - stakeH + 1, 1, stakeH - 1, u % 4 === 0 ? RUST_MID : WOOD_MID);
    px(ctx, x - 1, yBot - stakeH - 1, IRON_TOP);
    if (u === 6) drawSkull(ctx, x, yBot - stakeH - 3, false);
  }

  // Sharpened stakes along right face with gate gap
  for (let v = 0; v < 16; v += 2) {
    if (v >= 6 && v <= 8) continue; // gate gap
    const x = fx + v;
    const yBot = fy - (v >> 1);
    const stakeH = v % 4 === 0 ? 11 : 8;
    rect(ctx, x - 1, yBot - stakeH, 2, stakeH + 1, OUT);
    rect(ctx, x, yBot - stakeH + 1, 1, stakeH - 1, v % 4 === 0 ? IRON_MID : WOOD_LIGHT);
    px(ctx, x + 1, yBot - stakeH - 1, IRON_TOP);
  }

  // Reinforced scrap gate doors in the gap
  rightWallRect(ctx, fx, fy, 6, 1, 3, 7, OUT);
  rightWallRect(ctx, fx, fy, 6, 1, 2, 6, RUST_DARK);

  // Outward-thrusting bone spikes bristling forward
  rect(ctx, 24, 52, 4, 1, BONE_LIGHT);
  rect(ctx, 38, 52, 4, 1, BONE_LIGHT);

  drawJunkPile(ctx, 43, 54);

  return [canvas];
}

/** 24. WATCHTOWER (Military, crow-nest sentry rig, height 2.0, 2 frames) */
function buildWatchtower(): HTMLCanvasElement[] {
  return [0, 1].map((frame) => {
    const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

    // Mud and scrap sleeper pad
    isoDiamond(ctx, 32, 48, 26, MUD_DARK, OUT);
    isoDiamond(ctx, 32, 48, 22, MUD_MID, BOG_DARK);

    const fx = 32, fy = 56;

    // 4 crooked timber stilt legs reaching up to y=23
    // Front leg
    rect(ctx, fx - 1, fy - 33, 2, 33, OUT);
    rect(ctx, fx, fy - 32, 1, 31, WOOD_LIGHT);
    // Left leg
    rect(ctx, fx - 11, fy - 38, 2, 33, OUT);
    rect(ctx, fx - 10, fy - 37, 1, 31, WOOD_DARK);
    // Right leg
    rect(ctx, fx + 9, fy - 38, 2, 33, OUT);
    rect(ctx, fx + 10, fy - 37, 1, 31, WOOD_MID);
    // Back leg
    rect(ctx, fx - 1, fy - 43, 2, 33, OUT);
    rect(ctx, fx, fy - 42, 1, 31, WOOD_DARK);

    // Diagonal timber cross-braces
    for (const yBrace of [46, 36]) {
      rect(ctx, fx - 8, yBrace, 16, 1, WOOD_DARK);
    }

    // Fortified crow's nest cabin on top (w=8, h=8)
    const cFx = 32, cFy = 24, cW = 8, cH = 8;
    isoBox(ctx, cFx, cFy, cW, cW, cH, { top: RUST_TOP, left: WOOD_DARK, right: RUST_MID });

    // Arrow slits in crow's nest
    rightWallRect(ctx, cFx, cFy, 3, 2, 2, 4, OUT);
    rightWallRect(ctx, cFx, cFy, 3, 3, 1, 2, TOXIC_YELLOW);

    // Conical corrugated rust roof cap
    isoPitchedRoof(ctx, cFx, cFy, cW + 2, cW + 2, cH, 5, {
      leftSlope: RUST_DARK,
      rightSlope: RUST_MID,
      gable: WOOD_DARK,
      ridge: RUST_TOP,
    });

    // Signal brazier with toxic green flame mounted on cabin railing
    rect(ctx, cFx + cW, cFy - (cW >> 1) - cH - 2, 3, 4, OUT);
    rect(ctx, cFx + cW + 1, cFy - (cW >> 1) - cH - 1, 1, 3, IRON_MID);
    // Flickering green flame (2 frames)
    const flameY = cFy - (cW >> 1) - cH - 4;
    rect(ctx, cFx + cW, flameY - (frame % 2), 3, 3, TOXIC_DEEP);
    px(ctx, cFx + cW + 1, flameY - (frame % 2), frame === 0 ? TOXIC_BRIGHT : TOXIC_YELLOW);

    drawSkull(ctx, 32, 53, true);

    return canvas;
  });
}

/** 25. ARMORY (Military, scrap arsenal & munitions bunker, height 1.3) */
function buildArmory(): HTMLCanvasElement[] {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  // Reinforced mud and iron foundation
  isoDiamond(ctx, 32, 48, 28, IRON_DARK, OUT);
  isoDiamond(ctx, 32, 48, 24, MUD_MID, IRON_MID);

  const fx = 32, fy = 56, wL = 16, wR = 16, wallH = 13;

  // Squat, heavy riveted iron bunker walls
  isoBox(ctx, fx, fy, wL, wR, wallH, { top: IRON_TOP, left: IRON_DARK, right: IRON_MID });

  // Heavy bolted iron vault door on right wall
  rightWallRect(ctx, fx, fy, 4, 1, 6, 8, OUT);
  rightWallRect(ctx, fx, fy, 5, 1, 4, 7, RUST_DARK);
  px(ctx, fx + 7, fy - (7 >> 1) - 4, TOXIC_YELLOW); // padlock brass glint

  // Barred slit window with toxic green glow
  rightWallRect(ctx, fx, fy, 11, 4, 3, 3, OUT);
  rightWallRect(ctx, fx, fy, 12, 5, 1, 1, TOXIC_BRIGHT);

  // Weapon rack outside holding goblin cleavers & barbed spears
  rect(ctx, 20, 50, 7, 1, WOOD_LIGHT);
  rect(ctx, 20, 51, 1, 5, WOOD_DARK);
  rect(ctx, 26, 51, 1, 5, WOOD_DARK);
  px(ctx, 21, 49, IRON_TOP);
  px(ctx, 23, 48, BONE_LIGHT); // barbed spear tip
  px(ctx, 25, 49, IRON_TOP);

  // Crates of black-powder bomb spheres with fuses outside
  rect(ctx, 42, 53, 5, 3, OUT);
  rect(ctx, 43, 54, 3, 2, WOOD_DARK);
  disc(ctx, 44, 52, 2, OUT); // round iron bomb
  px(ctx, 44, 52, IRON_DARK);
  px(ctx, 45, 51, TOXIC_YELLOW); // burning fuse spark!

  // Spiked battlements on roof perimeter
  for (const v of [1, 5, 9, 13]) {
    rightWallRect(ctx, fx, fy, v, wallH + 1, 2, 2, RUST_MID);
    px(ctx, fx + v, fy - (v >> 1) - wallH - 2, BONE_LIGHT);
  }
  for (const u of [1, 5, 9, 13]) {
    leftWallRect(ctx, fx, fy, u, wallH + 1, 2, 2, RUST_DARK);
    px(ctx, fx - 1 - u, fy - (u >> 1) - wallH - 2, BONE_LIGHT);
  }

  drawSkull(ctx, 32, 40, true);

  return [canvas];
}

/** 26. WARCAMP (Military, raiding host encampment & yurts, height 1.0, 2 frames) */
function buildWarcamp(): HTMLCanvasElement[] {
  return [0, 1].map((frame) => {
    const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

    // Mud and ash dirt yard
    isoDiamond(ctx, 32, 48, 28, MUD_DARK, OUT);
    isoDiamond(ctx, 32, 48, 24, MUD_MID, BOG_DARK);

    // 1. Back-left Large Command Yurt (conical dome of patched hide and tusks)
    const yCx = 24, yCy = 42, yR = 8, yPeakY = 24;
    for (let dy = 0; dy <= 14; dy++) {
      const y = yCy - dy;
      const span = Math.round((yR * (yCy - y)) / (yCy - yPeakY));
      const half = Math.max(1, yR - span);
      rect(ctx, yCx - half - 1, y, half * 2 + 2, 1, OUT);
      for (let dx = -half; dx <= half; dx++) {
        const isRust = (Math.abs(dx) % 3) === 0;
        px(ctx, yCx + dx, y, isRust ? RUST_MID : WOOD_DARK);
      }
    }
    // Horned skull atop command yurt
    drawSkull(ctx, yCx, yPeakY - 2, true);

    // 2. Back-right Ridge Wedge Tent (stitched skins)
    isoBox(ctx, 42, 48, 8, 10, 6, { top: RUST_TOP, left: WOOD_DARK, right: RUST_MID });
    isoPitchedRoof(ctx, 42, 48, 10, 12, 6, 4, {
      leftSlope: RUST_DARK,
      rightSlope: RUST_MID,
      gable: WOOD_DARK,
      ridge: RUST_TOP,
    });

    // 3. Central Campfire at (x=33, y=49)
    rect(ctx, 31, 48, 5, 3, OUT);
    rect(ctx, 32, 49, 3, 1, MUD_DARK);
    // 2-frame roaring green & orange flame
    const fY = 46 - (frame % 2);
    rect(ctx, 32, fY, 3, 3, RUST_TOP);
    rect(ctx, 32, fY - 1, 2, 2, TOXIC_BRIGHT);
    px(ctx, 33, fY - 2, TOXIC_YELLOW);

    // 4. Perimeter spiked bone markers and loot sacks
    drawSkull(ctx, 18, 51, false);
    drawSkull(ctx, 46, 52, false);

    // Loot sack pile in front-right
    isoBox(ctx, 38, 56, 4, 4, 3, { top: BONE_LIGHT, left: WOOD_DARK, right: WOOD_MID });

    return canvas;
  });
}

/** 27. FORTRESS (Military, dread iron bastion / warlord citadel, height 2.3) */
function buildFortress(): HTMLCanvasElement[] {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  // Blackened rock and iron foundation
  isoDiamond(ctx, 32, 48, 29, IRON_DARK, OUT);
  isoDiamond(ctx, 32, 48, 25, MUD_DARK, IRON_DARK);

  // 1. Lower curtain wall terrace (fx=34, fy=58, wL=20, wR=20, wallH=8)
  const lFx = 34, lFy = 58, lW = 20, lH = 8;
  isoBox(ctx, lFx, lFy, lW, lW, lH, { top: IRON_TOP, left: IRON_DARK, right: IRON_MID });

  // Central gatehouse with fanged iron teeth
  rightWallRect(ctx, lFx, lFy, 7, 1, 6, 7, OUT);
  rightWallRect(ctx, lFx, lFy, 8, 1, 4, 6, '#181412');
  for (const vTooth of [8, 10, 12]) {
    rightWallRect(ctx, lFx, lFy, vTooth, 4, 1, 3, IRON_TOP);
  }

  // Spikes on lower curtain wall parapet
  for (const v of [2, 5, 14, 17]) {
    rightWallRect(ctx, lFx, lFy, v, lH + 1, 2, 2, RUST_MID);
    px(ctx, lFx + v, lFy - (v >> 1) - lH - 2, BONE_LIGHT);
  }
  for (const u of [2, 5, 14, 17]) {
    leftWallRect(ctx, lFx, lFy, u, lH + 1, 2, 2, RUST_DARK);
    px(ctx, lFx - 1 - u, lFy - (u >> 1) - lH - 2, BONE_LIGHT);
  }

  // 2. Imposing Central Citadel Keep (fx=32, fy=48, wL=12, wR=12, wallH=20, reaching to y=10)
  const kFx = 32, kFy = 48, kW = 12, kH = 20;
  isoBox(ctx, kFx, kFy, kW, kW, kH, { top: IRON_TOP, left: IRON_DARK, right: IRON_MID });

  // Bolted iron plates & barred arrow slits on central keep
  rightWallRect(ctx, kFx, kFy, 3, 5, 2, 5, OUT);
  rightWallRect(ctx, kFx, kFy, 4, 6, 1, 3, TOXIC_YELLOW);
  rightWallRect(ctx, kFx, kFy, 7, 5, 2, 5, OUT);
  rightWallRect(ctx, kFx, kFy, 8, 6, 1, 3, TOXIC_BRIGHT);

  leftWallRect(ctx, kFx, kFy, 3, 5, 2, 5, OUT);
  leftWallRect(ctx, kFx, kFy, 4, 6, 1, 3, TOXIC_DEEP);
  leftWallRect(ctx, kFx, kFy, 7, 5, 2, 5, OUT);
  leftWallRect(ctx, kFx, kFy, 8, 6, 1, 3, TOXIC_YELLOW);

  // Overhanging machicolated parapet on keep summit
  isoBox(ctx, kFx, kFy - kH, kW + 2, kW + 2, 3, { top: RUST_TOP, left: RUST_DARK, right: RUST_MID });

  // Huge horned war skull trophy mounted over gatehouse
  drawSkull(ctx, 34, 43, true);

  // Ragged war banner flying at keep summit
  const poleX = 32, poleY = 5;
  rect(ctx, poleX, poleY, 1, 11, IRON_LIGHT);
  rect(ctx, poleX + 1, poleY + 1, 8, 5, RUST_MID);
  px(ctx, poleX + 4, poleY + 3, TOXIC_YELLOW);

  return [canvas];
}

// ============================================================================
// DECORATION
// ============================================================================

/** 28. FLOWERBED (Decoration, bog-orchid & fungi bed, height 0.3) */
function buildFlowerbed(): HTMLCanvasElement[] {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  // Peat mud plot
  isoDiamond(ctx, 32, 48, 22, MUD_DARK, OUT);
  isoDiamond(ctx, 32, 48, 18, MUD_MID, BOG_DARK);

  const fx = 32, fy = 53, wL = 12, wR = 12, wallH = 3;

  // Weathered scrap-timber planter box
  isoBox(ctx, fx, fy, wL, wR, wallH, { top: MUD_DARK, left: WOOD_DARK, right: WOOD_MID });

  // Rich peat bed packed with glowing swamp fungi & bog-orchids
  // Lime green toxic puffballs
  disc(ctx, 30, 48, 3, OUT);
  disc(ctx, 30, 48, 2, TOXIC_DEEP);
  px(ctx, 30, 48, TOXIC_BRIGHT);

  disc(ctx, 36, 49, 2, OUT);
  px(ctx, 36, 49, TOXIC_BRIGHT);

  // Orange-rust toadstools with yellow spots
  disc(ctx, 26, 45, 3, OUT);
  disc(ctx, 26, 45, 2, RUST_TOP);
  px(ctx, 26, 44, TOXIC_YELLOW);

  disc(ctx, 38, 45, 3, OUT);
  disc(ctx, 38, 45, 2, RUST_MID);
  px(ctx, 38, 45, TOXIC_YELLOW);

  // Pale bone-spores
  px(ctx, 32, 44, BONE_LIGHT);
  px(ctx, 34, 43, BONE_LIGHT);

  return [canvas];
}

/** 29. HEDGE (Decoration, bramble & thorn barrier, height 0.5) */
function buildHedge(): HTMLCanvasElement[] {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  // Mud base
  isoDiamond(ctx, 32, 48, 24, MUD_DARK, OUT);
  isoDiamond(ctx, 32, 48, 20, BOG_DARK, MUD_MID);

  const fx = 32, fy = 54, wL = 10, wR = 16, wallH = 7;

  // Dense, wild, prickly hedge block of twisted bog thorns
  isoBox(ctx, fx, fy, wL, wR, wallH, { top: BOG_LIGHT, left: BOG_DARK, right: BOG_MID });

  // Sharpened stakes and bone splinters protruding through foliage
  rect(ctx, 25, 47, 1, 4, WOOD_DARK);
  px(ctx, 25, 46, BONE_LIGHT);
  rect(ctx, 33, 44, 1, 4, WOOD_DARK);
  px(ctx, 33, 43, BONE_LIGHT);
  rect(ctx, 41, 47, 1, 4, WOOD_DARK);
  px(ctx, 41, 46, BONE_LIGHT);

  // Glowing poisonous berries speckled in the thorns
  px(ctx, 28, 49, TOXIC_YELLOW);
  px(ctx, 36, 48, TOXIC_BRIGHT);
  px(ctx, 31, 52, TOXIC_YELLOW);
  px(ctx, 39, 52, TOXIC_BRIGHT);

  return [canvas];
}

/** 30. WELL (Decoration, murk-well & slime cistern, height 0.7) */
function buildWell(): HTMLCanvasElement[] {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  // Mud and cobblestone surround
  isoDiamond(ctx, 32, 48, 24, MUD_DARK, OUT);
  isoDiamond(ctx, 32, 48, 20, MUD_MID, BOG_DARK);

  // Circular stone well mouth with rusted iron rim
  const wCx = 32, wCy = 50;
  disc(ctx, wCx, wCy, 7, OUT);
  disc(ctx, wCx, wCy, 6, IRON_MID);
  disc(ctx, wCx, wCy, 4, RUST_DARK);
  // Glowing green water reflection inside well mouth
  disc(ctx, wCx, wCy, 3, TOXIC_DEEP);
  px(ctx, wCx, wCy, TOXIC_BRIGHT);

  // Crooked timber A-frame posts
  rect(ctx, wCx - 7, wCy - 12, 2, 13, OUT);
  rect(ctx, wCx - 6, wCy - 11, 1, 12, WOOD_MID);
  rect(ctx, wCx + 5, wCy - 12, 2, 13, OUT);
  rect(ctx, wCx + 5, wCy - 11, 1, 12, WOOD_LIGHT);

  // Crossbeam and iron winch spool
  rect(ctx, wCx - 6, wCy - 13, 13, 2, OUT);
  rect(ctx, wCx - 5, wCy - 12, 11, 1, WOOD_LIGHT);
  rect(ctx, wCx - 1, wCy - 11, 3, 2, IRON_LIGHT); // spool

  // Small corrugated tin hood roof over well
  rect(ctx, wCx - 8, wCy - 15, 17, 3, OUT);
  rect(ctx, wCx - 7, wCy - 14, 15, 1, RUST_MID);

  // Hanging chain and iron bucket
  rect(ctx, wCx, wCy - 9, 1, 4, IRON_LIGHT);
  rect(ctx, wCx - 1, wCy - 5, 3, 3, OUT);
  px(ctx, wCx, wCy - 4, RUST_LIGHT);

  drawSkull(ctx, wCx - 7, wCy - 6, false);

  return [canvas];
}

/** 31. POND (Decoration, mire pool & slime puddle, height 0.2, 2 frames) */
function buildPond(): HTMLCanvasElement[] {
  return [0, 1].map((frame) => {
    const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

    // Muddy outer bank
    isoDiamond(ctx, 32, 48, 27, MUD_DARK, OUT);
    isoDiamond(ctx, 32, 48, 23, BOG_DARK, MUD_DARK);

    // Natural murky green water pool
    disc(ctx, 32, 48, 12, OUT);
    disc(ctx, 32, 48, 11, BOG_DARK);
    disc(ctx, 32, 48, 8, TOXIC_DEEP);

    // Floating bog pads / lilies
    disc(ctx, 27, 47, 3, BOG_LIGHT);
    px(ctx, 27, 47, BOG_DARK);
    disc(ctx, 37, 49, 2, BOG_LIGHT);

    // Animated toxic ripples & popping bubbles (2 frames)
    if (frame === 0) {
      // Small expanding ripple ring
      rect(ctx, 31, 45, 4, 1, TOXIC_MID);
      rect(ctx, 30, 46, 6, 1, TOXIC_DEEP);
      px(ctx, 33, 44, TOXIC_BRIGHT); // pop!

      px(ctx, 35, 52, TOXIC_BRIGHT);
      px(ctx, 26, 51, TOXIC_YELLOW);
    } else {
      // Wider ripple ring & new bubble
      rect(ctx, 30, 45, 6, 1, TOXIC_MID);
      rect(ctx, 29, 46, 8, 1, TOXIC_DEEP);
      px(ctx, 32, 47, TOXIC_YELLOW); // pop!

      px(ctx, 36, 51, TOXIC_BRIGHT);
      px(ctx, 25, 50, TOXIC_MID);
    }

    // Muddy bank cattails & sunken skull on left shore
    rect(ctx, 22, 42, 1, 6, BOG_DARK);
    px(ctx, 22, 41, MUD_MID);
    rect(ctx, 20, 44, 1, 5, BOG_DARK);

    drawSkull(ctx, 40, 52, false);

    return canvas;
  });
}

/** 32. ARCH (Decoration, victory tusk-gate / scrap triumphal arch, height 1.6) */
function buildArch(): HTMLCanvasElement[] {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  // Mud and scrap iron foundation
  isoDiamond(ctx, 32, 48, 28, IRON_DARK, OUT);
  isoDiamond(ctx, 32, 48, 24, MUD_MID, IRON_MID);

  // Left heavy square pillar (fx=23, fy=51, w=6, h=18)
  const lPx = 23, lPy = 51, pW = 6, pH = 18;
  isoBox(ctx, lPx, lPy, pW, pW, pH, { top: IRON_TOP, left: IRON_DARK, right: IRON_MID });
  leftWallRect(ctx, lPx, lPy, 1, 5, pW - 2, 2, RUST_DARK);
  leftWallRect(ctx, lPx, lPy, 1, 11, pW - 2, 2, RUST_DARK);

  // Right heavy square pillar (fx=41, fy=51, w=6, h=18)
  const rPx = 41, rPy = 51;
  isoBox(ctx, rPx, rPy, pW, pW, pH, { top: IRON_TOP, left: IRON_DARK, right: IRON_MID });
  rightWallRect(ctx, rPx, rPy, 1, 5, pW - 2, 2, RUST_MID);
  rightWallRect(ctx, rPx, rPy, 1, 11, pW - 2, 2, RUST_MID);

  // Heavy interlocking iron I-beam & timber arch lintel spanning between pillars
  rect(ctx, 20, 22, 24, 5, OUT);
  rect(ctx, 21, 23, 22, 3, IRON_LIGHT);
  rect(ctx, 22, 24, 20, 1, RUST_MID);

  // Hanging heavy iron chains dangling under the archway
  rect(ctx, 26, 27, 1, 5, IRON_LIGHT);
  rect(ctx, 32, 27, 1, 4, IRON_LIGHT);
  rect(ctx, 37, 27, 1, 6, IRON_LIGHT);

  // Massive horned beast war-skull crowning the arch apex
  drawSkull(ctx, 32, 17, true);
  px(ctx, 31, 17, TOXIC_BRIGHT); // glowing green eye
  px(ctx, 33, 17, TOXIC_BRIGHT);

  // Ragged war pennants hanging from flanking pillars
  rect(ctx, 18, 30, 2, 8, OUT);
  rect(ctx, 18, 31, 1, 6, RUST_MID);
  px(ctx, 18, 33, TOXIC_YELLOW);

  rect(ctx, 44, 30, 2, 8, OUT);
  rect(ctx, 44, 31, 1, 6, BOG_MID);
  px(ctx, 44, 33, TOXIC_YELLOW);

  return [canvas];
}

// ============================================================================
// ART EXPORT MAP
// ============================================================================

/** goblin art for the third-wave buildings. Used as-is (no colour filter); kinds left out use the shared art recoloured. */
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
