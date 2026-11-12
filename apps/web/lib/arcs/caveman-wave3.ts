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
  disc,
} from '../sprites';

// Caveman palette: sun-baked ochre, mammoth hide brown, wolf-fur grey, bleached bone white, campfire orange
const DIRT_0 = '#785f43';
const DIRT_1 = '#6b5339';
const DIRT_DARK = '#4d3a26';
const DIRT_LIGHT = '#917453';
const HIDE_LIGHT = '#d89b52';
const HIDE_MID = '#b57435';
const HIDE_DARK = '#7d4b1e';
const FUR_LIGHT = '#9c9286';
const FUR_MID = '#756c62';
const FUR_DARK = '#4f4840';
const BONE_LIGHT = '#f5efe2';
const BONE_MID = '#d9ccb8';
const BONE_DARK = '#9e8f79';
const WOOD_LIGHT = '#9c6b3f';
const WOOD_MID = '#734b28';
const WOOD_DARK = '#4a2e16';
const OCHRE_RED = '#b83b24';
const FLAME_CORE = '#fff176';
const FLAME_MID = '#ff9800';
const FLAME_DARK = '#e65100';
const LEAF_DARK = '#2d4c24';
const LEAF_MID = '#436d33';
const LEAF_LIGHT = '#6b9e4a';
const WATER_DEEP = '#2b5876';
const WATER_MID = '#417d9e';
const WATER_SHALLOW = '#68a6c7';
const WATER_FOAM = '#c8e4f0';

/** Draw a curved mammoth tusk arching from (x0, y0) to (x1, y1) with peak offset. */
function drawTusk(
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  archH: number,
): void {
  const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 6);
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = Math.round(x0 + (x1 - x0) * t);
    const y = Math.round(y0 + (y1 - y0) * t - Math.sin(t * Math.PI) * archH);
    rect(ctx, x - 1, y - 1, 2, 3, OUT);
    px(ctx, x, y - 1, BONE_LIGHT);
    px(ctx, x, y, BONE_MID);
  }
}

/** Draw a stone-age round hide-and-bone yurt dome centered at (cx, baseY). */
function drawHideDome(
  ctx: CanvasRenderingContext2D,
  cx: number,
  baseY: number,
  rx: number,
  height: number,
): void {
  for (let dy = 0; dy <= height; dy++) {
    const t = dy / height;
    const span = Math.max(2, Math.round(rx * Math.sqrt(Math.max(0, 1 - t * t * 0.88))));
    const y = baseY - dy;
    rect(ctx, cx - span - 1, y, (span + 1) * 2, 1, OUT);
    for (let dx = -span; dx < span; dx++) {
      const isSeam = dy === Math.round(height * 0.45) || (dx + dy) % 9 === 0;
      let col = dx < -span * 0.25 ? HIDE_DARK : dx > span * 0.2 ? HIDE_MID : HIDE_LIGHT;
      if (dy > height * 0.65 && dx >= -3 && dx <= 3) col = FUR_MID;
      if (isSeam && dy < height - 1) col = WOOD_DARK;
      px(ctx, cx + dx, y, col);
    }
  }
  const topY = baseY - height;
  rect(ctx, cx - 3, topY - 1, 6, 2, OUT);
  rect(ctx, cx - 2, topY, 4, 1, BONE_MID);
  px(ctx, cx - 4, topY - 2, BONE_LIGHT);
  px(ctx, cx + 3, topY - 2, BONE_LIGHT);
}

/** Draw a crackling stone-ringed campfire at (cx, cy). */
function drawFirePit(ctx: CanvasRenderingContext2D, cx: number, cy: number, frame: number): void {
  for (const [dx, dy, col] of [
    [-4, 0, FUR_DARK],
    [-3, 1, FUR_MID],
    [-1, 2, FUR_LIGHT],
    [1, 2, FUR_MID],
    [3, 1, FUR_DARK],
    [4, 0, FUR_MID],
    [2, -1, FUR_DARK],
    [-2, -1, FUR_MID],
  ] as const) {
    rect(ctx, cx + dx, cy + dy, 2, 2, OUT);
    px(ctx, cx + dx, cy + dy, col);
  }
  rect(ctx, cx - 2, cy, 4, 2, WOOD_DARK);
  const fShift = frame % 2 === 0 ? 0 : 1;
  rect(ctx, cx - 2, cy - 3, 4, 3, FLAME_DARK);
  rect(ctx, cx - 1, cy - 5 + fShift, 3, 4, FLAME_MID);
  rect(ctx, cx - 1 + fShift, cy - 3, 2, 2, FLAME_CORE);
  px(ctx, cx - fShift, cy - 6, FLAME_DARK);
}

// ============================================================================
// 1. RESIDENTIAL
// ============================================================================

/** 1. COTTAGE (Residential, height 0.8): Cozy single-family hide-and-bone yurt. */
function buildCottage(): HTMLCanvasElement[] {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);
  isoDiamond(ctx, 32, 48, 24, DIRT_0, OUT);
  isoDiamond(ctx, 32, 48, 19, DIRT_LIGHT, DIRT_DARK);

  // Low boulder ring base
  isoDiamond(ctx, 32, 51, 13, FUR_DARK, OUT);
  drawHideDome(ctx, 32, 51, 11, 14);

  // Tiny mammoth tusk arch over front fur doorway
  rect(ctx, 33, 46, 4, 6, OUT);
  rect(ctx, 34, 47, 2, 5, '#261a10');
  drawTusk(ctx, 32, 52, 36, 44, 2);

  // Red ochre handprint on sunlit wall
  px(ctx, 37, 43, OCHRE_RED);
  px(ctx, 38, 42, OCHRE_RED);
  px(ctx, 38, 44, OCHRE_RED);

  // Drying pelt rack beside cottage
  rect(ctx, 20, 42, 1, 9, OUT);
  rect(ctx, 24, 44, 1, 9, OUT);
  rect(ctx, 20, 43, 5, 1, WOOD_LIGHT);
  rect(ctx, 21, 44, 3, 5, HIDE_MID);

  return [canvas];
}

/** 2. LONGHOUSE (Residential, height 1.0, 2 frames): Great communal timber & mammoth-rib hall. */
function buildLonghouse(): HTMLCanvasElement[] {
  return [0, 1].map((frame) => {
    const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);
    isoDiamond(ctx, 32, 48, 28, DIRT_0, OUT);
    isoDiamond(ctx, 32, 48, 24, DIRT_1, DIRT_DARK);

    // Stone foundation slab
    isoBox(ctx, 32, 56, 12, 22, 4, { top: FUR_LIGHT, left: FUR_DARK, right: FUR_MID });

    // Arched ribbed mammoth-hide roof spanning along the v-axis
    for (let v = 0; v < 22; v++) {
      const cx = 32 + (v - 5);
      const baseY = 52 - (v >> 1);
      const isRib = v % 4 === 0;
      const col = isRib ? BONE_LIGHT : ((v >> 1) & 1) === 0 ? HIDE_LIGHT : HIDE_MID;
      rect(ctx, cx - 7, baseY - 12, 8, 2, OUT);
      rect(ctx, cx - 6, baseY - 11, 7, 2, col);
      rect(ctx, cx - 5, baseY - 9, 6, 8, isRib ? BONE_MID : HIDE_DARK);
    }

    // Front gable entrance framed by giant arched tusks
    drawTusk(ctx, 26, 56, 32, 43, 4);
    drawTusk(ctx, 37, 52, 33, 43, 3);
    rect(ctx, 29, 47, 5, 7, OUT);
    rect(ctx, 30, 48, 3, 6, '#261a10');
    // Mounted beast skull above entrance
    rect(ctx, 30, 44, 3, 3, BONE_LIGHT);
    px(ctx, 30, 45, OUT);
    px(ctx, 32, 45, OUT);

    // Ochre painted tribal spiral along flank
    px(ctx, 42, 40, OCHRE_RED);
    px(ctx, 43, 39, OCHRE_RED);
    px(ctx, 44, 40, OCHRE_RED);
    px(ctx, 43, 41, OCHRE_RED);

    // Roof smoke holes with animated smoke puffs
    const sOff = frame * 2;
    disc(ctx, 28, 32 - sOff, 2, FUR_DARK);
    disc(ctx, 38, 27 - sOff, 2, FUR_LIGHT);

    return canvas;
  });
}

/** 3. TENEMENT (Residential, height 1.8): Multi-tier stacked cliff / pueblo troglodyte lodge. */
function buildTenement(): HTMLCanvasElement[] {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);
  isoDiamond(ctx, 32, 48, 28, DIRT_0, OUT);
  isoDiamond(ctx, 32, 48, 23, DIRT_LIGHT, DIRT_DARK);

  // Bottom tier: massive boulder walls
  isoBox(ctx, 32, 58, 17, 18, 10, { top: FUR_LIGHT, left: FUR_DARK, right: FUR_MID });
  // Ground floor doorway and warm windows
  rightWallRect(ctx, 32, 58, 4, 1, 4, 6, OUT);
  rightWallRect(ctx, 32, 58, 5, 2, 2, 5, '#261a10');
  rightWallRect(ctx, 32, 58, 11, 3, 3, 4, OUT);
  rightWallRect(ctx, 32, 58, 12, 4, 1, 2, FLAME_MID);
  leftWallRect(ctx, 32, 58, 5, 3, 3, 4, OUT);
  leftWallRect(ctx, 32, 58, 6, 4, 1, 2, FLAME_MID);

  // Second tier stepped back
  isoBox(ctx, 30, 48, 13, 14, 9, { top: BONE_MID, left: FUR_DARK, right: FUR_MID });
  rightWallRect(ctx, 30, 48, 3, 1, 3, 5, OUT);
  rightWallRect(ctx, 30, 48, 4, 2, 1, 4, '#261a10');
  rightWallRect(ctx, 30, 48, 8, 2, 3, 4, OUT);
  rightWallRect(ctx, 30, 48, 9, 3, 1, 2, FLAME_CORE);
  leftWallRect(ctx, 30, 48, 4, 2, 3, 4, OUT);
  leftWallRect(ctx, 30, 48, 5, 3, 1, 2, FLAME_MID);

  // Third top tier lookout hut
  drawHideDome(ctx, 28, 39, 8, 11);

  // Wooden access ladders between terraces
  rect(ctx, 42, 46, 2, 11, OUT);
  px(ctx, 42, 48, WOOD_LIGHT);
  px(ctx, 42, 51, WOOD_LIGHT);
  px(ctx, 42, 54, WOOD_LIGHT);

  rect(ctx, 36, 37, 2, 10, OUT);
  px(ctx, 36, 39, WOOD_LIGHT);
  px(ctx, 36, 42, WOOD_LIGHT);
  px(ctx, 36, 45, WOOD_LIGHT);

  // Rawhide drying lines with hanging pelts
  rect(ctx, 18, 43, 8, 1, BONE_LIGHT);
  rect(ctx, 20, 44, 2, 3, HIDE_LIGHT);
  rect(ctx, 23, 44, 2, 3, OCHRE_RED);

  return [canvas];
}

/** 4. VILLA (Residential, height 1.4): Chieftain's walled steppe compound with courtyard. */
function buildVilla(): HTMLCanvasElement[] {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);
  isoDiamond(ctx, 32, 48, 29, DIRT_0, OUT);
  isoDiamond(ctx, 32, 48, 25, DIRT_LIGHT, DIRT_DARK);

  // Megalithic compound perimeter wall
  isoBox(ctx, 32, 60, 16, 3, 3, { top: FUR_LIGHT, left: FUR_DARK, right: FUR_MID });
  isoBox(ctx, 35, 58, 3, 15, 3, { top: FUR_LIGHT, left: FUR_DARK, right: FUR_MID });

  // Main master hide pavilion on back-left
  isoBox(ctx, 27, 49, 13, 12, 10, { top: HIDE_LIGHT, left: FUR_DARK, right: FUR_MID });
  drawHideDome(ctx, 27, 39, 10, 10);
  // Grand mammoth tusk porch
  drawTusk(ctx, 25, 49, 29, 41, 3);
  drawTusk(ctx, 33, 46, 30, 41, 3);
  rightWallRect(ctx, 27, 49, 2, 1, 4, 6, OUT);
  rightWallRect(ctx, 27, 49, 3, 2, 2, 5, '#261a10');

  // Secondary guest yurt on right side
  drawHideDome(ctx, 43, 47, 7, 9);
  rightWallRect(ctx, 43, 47, 1, 1, 3, 4, OUT);

  // Central courtyard fire pit & polished decorative stone ring
  drawFirePit(ctx, 36, 52, 0);

  // Tribal trophy pole with skull in courtyard
  rect(ctx, 21, 51, 1, 8, OUT);
  rect(ctx, 20, 50, 3, 3, BONE_LIGHT);
  px(ctx, 21, 51, OUT);

  return [canvas];
}

/** 5. HIGHRISE (Residential, height 2.4, 2 frames): Stepped megalithic cliff-spire. */
function buildHighrise(): HTMLCanvasElement[] {
  return [0, 1].map((frame) => {
    const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);
    isoDiamond(ctx, 32, 48, 29, DIRT_DARK, OUT);
    isoDiamond(ctx, 32, 48, 25, DIRT_0, DIRT_1);

    // Tier 1: Massive cyclopean base (h=11)
    isoBox(ctx, 32, 59, 18, 18, 11, { top: FUR_LIGHT, left: FUR_DARK, right: FUR_MID });
    rightWallRect(ctx, 32, 59, 4, 1, 4, 7, OUT);
    rightWallRect(ctx, 32, 59, 5, 2, 2, 6, '#261a10');
    rightWallRect(ctx, 32, 59, 11, 3, 4, 4, OUT);
    rightWallRect(ctx, 32, 59, 12, 4, 2, 2, FLAME_MID);
    leftWallRect(ctx, 32, 59, 5, 3, 4, 4, OUT);
    leftWallRect(ctx, 32, 59, 6, 4, 2, 2, FLAME_MID);

    // Tier 2: Stepped tower block (h=11)
    isoBox(ctx, 32, 48, 14, 14, 11, { top: BONE_MID, left: FUR_DARK, right: FUR_MID });
    rightWallRect(ctx, 32, 48, 4, 3, 3, 4, OUT);
    rightWallRect(ctx, 32, 48, 5, 4, 1, 2, FLAME_CORE);
    leftWallRect(ctx, 32, 48, 4, 3, 3, 4, OUT);
    leftWallRect(ctx, 32, 48, 5, 4, 1, 2, FLAME_CORE);

    // Tier 3: Upper masonry redoubt (h=11)
    isoBox(ctx, 32, 37, 10, 10, 11, { top: FUR_LIGHT, left: FUR_DARK, right: FUR_MID });
    rightWallRect(ctx, 32, 37, 3, 2, 3, 4, OUT);
    rightWallRect(ctx, 32, 37, 4, 3, 1, 2, FLAME_CORE);

    // Tier 4: Sky-yurt dome with mammoth skull crest
    drawHideDome(ctx, 32, 26, 8, 10);
    rect(ctx, 31, 15, 3, 3, BONE_LIGHT);
    px(ctx, 31, 16, OUT);
    px(ctx, 33, 16, OUT);

    // Tribal hide banners fluttering at the summit
    const bOff = frame === 0 ? 0 : 1;
    rect(ctx, 25, 10, 1, 14, OUT);
    rect(ctx, 22 - bOff, 11, 3, 4, OCHRE_RED);
    rect(ctx, 39, 10, 1, 14, OUT);
    rect(ctx, 40, 11, 3 + bOff, 4, HIDE_LIGHT);

    // Wooden ladders along exterior
    rect(ctx, 44, 47, 2, 10, OUT);
    px(ctx, 44, 49, WOOD_LIGHT);
    px(ctx, 44, 52, WOOD_LIGHT);
    px(ctx, 44, 55, WOOD_LIGHT);

    return canvas;
  });
}

// ============================================================================
// 2. COMMERCE
// ============================================================================

/** 6. BAKERY (Commerce, height 1.0, 2 frames): Domed earthen bread oven & grain roastery. */
function buildBakery(): HTMLCanvasElement[] {
  return [0, 1].map((frame) => {
    const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);
    isoDiamond(ctx, 32, 48, 27, DIRT_0, OUT);
    isoDiamond(ctx, 32, 48, 22, DIRT_1, DIRT_DARK);

    // Domed clay bread oven on back-left
    drawHideDome(ctx, 26, 48, 9, 13);
    // Glowing oven fire mouth
    rect(ctx, 24, 44, 5, 4, OUT);
    rect(ctx, 25, 45, 3, 3, FLAME_DARK);
    rect(ctx, 26, 46, 1, 1, FLAME_CORE);

    // Stone grain grinding slab with rotary quern in front-left
    isoBox(ctx, 24, 56, 6, 6, 4, { top: FUR_LIGHT, left: FUR_DARK, right: FUR_MID });
    disc(ctx, 24, 50, 2, BONE_LIGHT);

    // Timber & bone counter on right displaying baked flat seed-breads
    isoBox(ctx, 36, 54, 8, 12, 5, { top: WOOD_LIGHT, left: WOOD_DARK, right: WOOD_MID });
    // Hearth breads on counter
    rect(ctx, 33, 48, 3, 2, HIDE_LIGHT);
    rect(ctx, 38, 46, 3, 2, HIDE_MID);
    rect(ctx, 42, 44, 3, 2, HIDE_LIGHT);
    px(ctx, 34, 49, OCHRE_RED);

    // Rising oven smoke (2 frames)
    const sOff = frame * 2;
    disc(ctx, 26, 31 - sOff, 2, FUR_DARK);
    disc(ctx, 27, 26 - sOff, 3, FUR_MID);
    disc(ctx, 29, 21 - sOff, 2, FUR_LIGHT);

    return canvas;
  });
}

/** 7. TEAHOUSE (Commerce, height 1.1): Steaming herbal moonleaf infusion pavilion. */
function buildTeahouse(): HTMLCanvasElement[] {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);
  isoDiamond(ctx, 32, 48, 27, DIRT_0, OUT);
  isoDiamond(ctx, 32, 48, 22, DIRT_LIGHT, DIRT_DARK);

  // Raised split-timber & woven reed platform
  isoBox(ctx, 32, 54, 15, 15, 3, { top: WOOD_LIGHT, left: WOOD_DARK, right: WOOD_MID });

  // 4 corner mammoth-bone pillars supporting light hide shade canopy
  for (const [px0, py0] of [
    [19, 47],
    [32, 53],
    [45, 47],
    [32, 41],
  ] as const) {
    rect(ctx, px0, py0 - 13, 2, 14, OUT);
    rect(ctx, px0, py0 - 13, 1, 13, BONE_LIGHT);
  }

  // Taut hide canopy pitched overhead
  for (let dy = 0; dy < 5; dy++) {
    isoDiamond(ctx, 32, 36 - dy, 13 - dy, dy === 4 ? BONE_LIGHT : HIDE_LIGHT, OUT);
  }

  // Steaming stone cauldron over hot river stones on the platform
  isoBox(ctx, 30, 48, 5, 5, 4, { top: FUR_LIGHT, left: FUR_DARK, right: FUR_MID });
  px(ctx, 30, 43, LEAF_LIGHT);
  px(ctx, 31, 43, LEAF_MID);
  // Steam wisps
  px(ctx, 30, 39, BONE_LIGHT);
  px(ctx, 31, 37, BONE_MID);

  // Low flat stone tea table with drinking bowls
  isoBox(ctx, 38, 50, 4, 4, 2, { top: FUR_LIGHT, left: FUR_DARK, right: FUR_MID });
  px(ctx, 37, 46, OCHRE_RED);
  px(ctx, 39, 45, BONE_LIGHT);

  // Bundles of green moonleaf herbs hanging from canopy edge
  rect(ctx, 23, 35, 2, 4, LEAF_MID);
  px(ctx, 24, 39, LEAF_LIGHT);
  rect(ctx, 41, 35, 2, 4, LEAF_MID);
  px(ctx, 42, 39, LEAF_LIGHT);

  return [canvas];
}

/** 8. TAILOR (Commerce, height 1.1): Master peltier & tribal furrier lodge. */
function buildTailor(): HTMLCanvasElement[] {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);
  isoDiamond(ctx, 32, 48, 27, DIRT_0, OUT);
  isoDiamond(ctx, 32, 48, 22, DIRT_1, DIRT_DARK);

  // Main rough stone and log work lodge on back
  isoBox(ctx, 30, 50, 13, 13, 9, { top: HIDE_LIGHT, left: FUR_DARK, right: FUR_MID });
  drawHideDome(ctx, 30, 41, 9, 8);
  rightWallRect(ctx, 30, 50, 2, 1, 3, 5, OUT);
  rightWallRect(ctx, 30, 50, 3, 1, 1, 4, '#261a10');

  // Large wooden pelt-stretching frames on the left and right displaying cured skins
  // Left frame (spotted pelt)
  rect(ctx, 16, 42, 1, 13, OUT);
  rect(ctx, 22, 45, 1, 13, OUT);
  rect(ctx, 16, 43, 7, 1, WOOD_LIGHT);
  rect(ctx, 17, 45, 5, 8, HIDE_MID);
  px(ctx, 18, 47, FUR_DARK);
  px(ctx, 20, 49, FUR_DARK);
  px(ctx, 19, 51, FUR_DARK);

  // Right frame (fine striped wolf/deer pelt)
  rect(ctx, 42, 44, 1, 13, OUT);
  rect(ctx, 48, 41, 1, 13, OUT);
  rect(ctx, 42, 43, 7, 1, WOOD_LIGHT);
  rect(ctx, 43, 44, 5, 8, FUR_LIGHT);
  px(ctx, 44, 46, OCHRE_RED);
  px(ctx, 46, 47, OCHRE_RED);

  // Stone cutting slab in foreground with bone awl & sinew spools
  isoBox(ctx, 33, 57, 6, 8, 4, { top: FUR_LIGHT, left: FUR_DARK, right: FUR_MID });
  rect(ctx, 32, 51, 3, 2, HIDE_LIGHT);
  px(ctx, 36, 50, BONE_LIGHT);
  px(ctx, 38, 49, OCHRE_RED);

  return [canvas];
}

/** 9. BAZAAR (Commerce, height 1.0): Bustling tribal barter clearing with multiple canopy stalls. */
function buildBazaar(): HTMLCanvasElement[] {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);
  isoDiamond(ctx, 32, 48, 29, DIRT_0, OUT);
  isoDiamond(ctx, 32, 48, 25, DIRT_1, DIRT_DARK);

  // Stall 1 (back-left): Slanted red-ochre & bone hide awning
  for (let v = 0; v < 11; v++) {
    const x = 18 + v;
    const y = 44 - (v >> 1);
    const col = ((v >> 1) & 1) === 0 ? OCHRE_RED : HIDE_LIGHT;
    rect(ctx, x - 3, y - 9, 5, 2, OUT);
    rect(ctx, x - 2, y - 8, 4, 2, col);
  }
  drawTusk(ctx, 18, 44, 17, 33, 2);
  drawTusk(ctx, 28, 39, 27, 28, 2);
  // Flint goods on stone slab under stall 1
  isoBox(ctx, 23, 48, 6, 7, 3, { top: FUR_LIGHT, left: FUR_DARK, right: FUR_MID });
  rect(ctx, 21, 42, 3, 2, '#cfd8dc'); // obsidian / flint
  px(ctx, 24, 41, BONE_LIGHT);

  // Stall 2 (back-right): Fur-covered lean-to with smoked meat & fish
  for (let u = 0; u < 10; u++) {
    const x = 46 - u;
    const y = 43 - (u >> 1);
    const col = ((u >> 1) & 1) === 0 ? HIDE_MID : HIDE_DARK;
    rect(ctx, x - 2, y - 9, 4, 2, OUT);
    rect(ctx, x - 1, y - 8, 3, 2, col);
  }
  rect(ctx, 46, 36, 1, 9, OUT);
  rect(ctx, 37, 40, 1, 9, OUT);
  // Smoked meat on slab under stall 2
  isoBox(ctx, 41, 47, 7, 6, 3, { top: WOOD_LIGHT, left: WOOD_DARK, right: WOOD_MID });
  rect(ctx, 40, 41, 4, 2, OCHRE_RED);
  px(ctx, 44, 40, BONE_LIGHT);

  // Central barter slab in foreground with amber chunks and beads
  isoBox(ctx, 32, 57, 8, 8, 4, { top: FUR_LIGHT, left: FUR_DARK, right: FUR_MID });
  rect(ctx, 30, 50, 3, 2, FLAME_MID); // amber chunks
  rect(ctx, 34, 49, 3, 2, BONE_LIGHT); // shell beads
  px(ctx, 32, 52, OCHRE_RED);

  return [canvas];
}

/** 10. TRADEGUILD (Commerce, height 1.8): Grand Barter Clan Council & Treasure Hall. */
function buildTradeguild(): HTMLCanvasElement[] {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);
  isoDiamond(ctx, 32, 48, 29, DIRT_DARK, OUT);
  isoDiamond(ctx, 32, 48, 25, DIRT_0, DIRT_1);

  // Raised megalithic stone plinth
  const fx = 32;
  const fy = 58;
  isoBox(ctx, fx, fy, 18, 18, 4, { top: BONE_MID, left: FUR_DARK, right: FUR_LIGHT });

  // Main heavy stone hall lower storey
  isoBox(ctx, fx, fy - 4, 16, 16, 10, { top: FUR_LIGHT, left: FUR_DARK, right: FUR_MID });
  // Ochre & bone tribal frieze
  leftWallRect(ctx, fx, fy - 4, 1, 7, 14, 2, OCHRE_RED);
  rightWallRect(ctx, fx, fy - 4, 1, 7, 14, 2, OCHRE_RED);

  // Grand tusk portico entrance on front-right
  drawTusk(ctx, 35, 54, 38, 43, 3);
  drawTusk(ctx, 43, 50, 40, 43, 3);
  rightWallRect(ctx, fx, fy - 4, 4, 1, 5, 7, OUT);
  rightWallRect(ctx, fx, fy - 4, 5, 2, 3, 6, '#261a10');

  // Upper storey: Lashed heavy timber & cured hide treasury
  isoBox(ctx, fx, fy - 14, 12, 12, 8, { top: HIDE_LIGHT, left: HIDE_DARK, right: HIDE_MID });
  // Stitched hide roof crown
  drawHideDome(ctx, 32, 34, 10, 10);

  // Wealth displays: Bales of pelts and stone chests in front
  isoBox(ctx, 23, 57, 5, 5, 4, { top: HIDE_LIGHT, left: HIDE_DARK, right: HIDE_MID });
  isoBox(ctx, 41, 58, 5, 5, 4, { top: BONE_LIGHT, left: FUR_DARK, right: FUR_MID });
  rect(ctx, 40, 52, 2, 2, FLAME_MID); // amber nuggets

  // Hanging bone merchant scale from portico beam
  rect(ctx, 39, 41, 7, 1, BONE_LIGHT);
  px(ctx, 40, 43, BONE_MID);
  px(ctx, 44, 43, BONE_MID);

  return [canvas];
}

// ============================================================================
// 3. INDUSTRY
// ============================================================================

/** 11. FISHERY (Industry, height 0.7, 2 frames): River stilt fishing camp & drying racks. */
function buildFishery(): HTMLCanvasElement[] {
  return [0, 1].map((frame) => {
    const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);
    // Ground diamond: dry dirt bank on left, river water on right
    isoDiamond(ctx, 32, 48, 27, DIRT_0, OUT);
    isoDiamond(ctx, 32, 48, 22, DIRT_1, DIRT_DARK);

    // River water cut on the front-right flank
    for (let u = 0; u < 18; u++) {
      for (let v = 12; v < 26; v++) {
        const sx = 32 + (u - v);
        const sy = 48 + ((u + v) >> 1) - 14;
        if (sx > 24 && sy > 42 && sx < 60 && sy < 62) {
          const isRipple = (u + v + frame) % 4 === 0;
          px(ctx, sx, sy, isRipple ? WATER_FOAM : WATER_MID);
        }
      }
    }

    // Wooden & bone stilt pier extending over water
    isoBox(ctx, 38, 52, 6, 12, 4, { top: WOOD_LIGHT, left: WOOD_DARK, right: WOOD_MID });
    // Stilt legs
    rect(ctx, 32, 54, 1, 6, WOOD_DARK);
    rect(ctx, 44, 48, 1, 6, WOOD_DARK);
    rect(ctx, 40, 56, 1, 5, WOOD_DARK);

    // Fish drying racks on the riverbank with silver fish
    rect(ctx, 20, 42, 1, 11, OUT);
    rect(ctx, 28, 45, 1, 11, OUT);
    rect(ctx, 20, 43, 9, 1, BONE_LIGHT);
    for (let fx0 = 21; fx0 <= 27; fx0 += 2) {
      rect(ctx, fx0, 44, 1, 3, BONE_LIGHT);
      px(ctx, fx0, 47, BONE_DARK);
    }

    // Hide coracle (round boat) resting on the shore
    disc(ctx, 23, 54, 4, OUT);
    disc(ctx, 23, 54, 3, HIDE_DARK);
    px(ctx, 23, 54, HIDE_LIGHT);

    // Woven willow fish basket trap on pier
    isoBox(ctx, 40, 50, 3, 3, 3, { top: HIDE_LIGHT, left: WOOD_DARK, right: WOOD_MID });

    return canvas;
  });
}

/** 12. WINDMILL (Industry, height 1.8, 3 frames): Primitive bone-and-hide sail grain mill. */
function buildWindmill(): HTMLCanvasElement[] {
  return [0, 1, 2].map((frame) => {
    const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);
    isoDiamond(ctx, 32, 48, 27, DIRT_0, OUT);
    isoDiamond(ctx, 32, 48, 22, DIRT_1, DIRT_DARK);

    // Sturdy rough-stone & lashed log mill tower
    isoBox(ctx, 32, 56, 12, 12, 18, { top: FUR_LIGHT, left: FUR_DARK, right: FUR_MID });
    // Low arched door on ground
    rightWallRect(ctx, 32, 56, 3, 1, 4, 6, OUT);
    rightWallRect(ctx, 32, 56, 4, 2, 2, 5, '#261a10');

    // Conical hide roof cap
    drawHideDome(ctx, 32, 38, 9, 8);

    // Rotating 4-arm mammoth rib & stretched hide sails (hub at x=32, y=28)
    const hubX = 32;
    const hubY = 28;
    rect(ctx, hubX - 1, hubY - 1, 3, 3, OUT);
    rect(ctx, hubX, hubY, 1, 1, BONE_LIGHT);

    // 3 rotation frames (0 = plus +, 1 = diagonal X, 2 = rotated X)
    if (frame === 0) {
      // Up arm
      rect(ctx, hubX, hubY - 13, 2, 13, OUT);
      rect(ctx, hubX + 1, hubY - 12, 4, 10, HIDE_LIGHT);
      // Down arm
      rect(ctx, hubX - 1, hubY + 1, 2, 13, OUT);
      rect(ctx, hubX - 5, hubY + 2, 4, 10, HIDE_MID);
      // Left arm
      rect(ctx, hubX - 13, hubY - 1, 13, 2, OUT);
      rect(ctx, hubX - 12, hubY - 5, 10, 4, HIDE_LIGHT);
      // Right arm
      rect(ctx, hubX + 1, hubY, 13, 2, OUT);
      rect(ctx, hubX + 2, hubY + 1, 10, 4, HIDE_MID);
    } else if (frame === 1) {
      // Top-right & bottom-left diagonal arms
      for (let d = 2; d <= 11; d++) {
        rect(ctx, hubX + d - 1, hubY - d - 1, 2, 2, OUT);
        px(ctx, hubX + d, hubY - d, BONE_LIGHT);
        px(ctx, hubX + d, hubY - d - 1, HIDE_LIGHT);

        rect(ctx, hubX - d - 1, hubY + d - 1, 2, 2, OUT);
        px(ctx, hubX - d, hubY + d, BONE_MID);
        px(ctx, hubX - d, hubY + d + 1, HIDE_DARK);

        rect(ctx, hubX - d - 1, hubY - d - 1, 2, 2, OUT);
        px(ctx, hubX - d, hubY - d, BONE_LIGHT);
        px(ctx, hubX - d - 1, hubY - d, HIDE_LIGHT);

        rect(ctx, hubX + d - 1, hubY + d - 1, 2, 2, OUT);
        px(ctx, hubX + d, hubY + d, BONE_MID);
        px(ctx, hubX + d + 1, hubY + d, HIDE_MID);
      }
    } else {
      // Slightly offset diagonal blades
      for (let d = 2; d <= 11; d++) {
        const dx = Math.round(d * 0.9);
        const dy = Math.round(d * 0.6);
        rect(ctx, hubX + dx - 1, hubY - dy - 1, 2, 2, OUT);
        px(ctx, hubX + dx, hubY - dy, BONE_LIGHT);
        rect(ctx, hubX - dx - 1, hubY + dy - 1, 2, 2, OUT);
        px(ctx, hubX - dx, hubY + dy, BONE_MID);

        rect(ctx, hubX - dy - 1, hubY - dx - 1, 2, 2, OUT);
        px(ctx, hubX - dy, hubY - dx, BONE_LIGHT);
        rect(ctx, hubX + dy - 1, hubY + dx - 1, 2, 2, OUT);
        px(ctx, hubX + dy, hubY + dx, BONE_MID);
      }
    }

    // Grain baskets beside mill
    isoBox(ctx, 42, 56, 4, 4, 3, { top: HIDE_LIGHT, left: WOOD_DARK, right: WOOD_MID });

    return canvas;
  });
}

/** 13. SAWMILL (Industry, height 1.1, 2 frames): Flint-axe log splitters' yard & heavy timber trestles. */
function buildSawmill(): HTMLCanvasElement[] {
  return [0, 1].map((frame) => {
    const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);
    isoDiamond(ctx, 32, 48, 28, DIRT_0, OUT);
    isoDiamond(ctx, 32, 48, 23, DIRT_LIGHT, DIRT_DARK);

    // Sturdy timber splitting trestles / sawhorses
    rect(ctx, 24, 46, 2, 8, OUT);
    rect(ctx, 28, 48, 2, 8, OUT);
    rect(ctx, 38, 43, 2, 8, OUT);
    rect(ctx, 42, 45, 2, 8, OUT);

    // Massive tree trunk mounted horizontally across the trestles
    isoBox(ctx, 33, 49, 14, 6, 6, { top: WOOD_LIGHT, left: WOOD_DARK, right: WOOD_MID });
    // Cut tree rings on log ends
    disc(ctx, 24, 46, 2, BONE_MID);
    px(ctx, 24, 46, WOOD_DARK);

    // Large knapped flint splitting wedge lodged in trunk
    rect(ctx, 32, 42, 2, 4, '#cfd8dc');
    px(ctx, 32, 41, OUT);

    // Animated stone splitting maul striking the wedge (sparks in frame 1)
    const mY = frame === 0 ? 38 : 40;
    rect(ctx, 31, mY, 4, 3, OUT);
    rect(ctx, 32, mY, 2, 2, FUR_DARK);
    rect(ctx, 34, mY - 4, 1, 5, WOOD_LIGHT);
    if (frame === 1) {
      px(ctx, 30, 42, FLAME_CORE);
      px(ctx, 35, 41, FLAME_MID);
      px(ctx, 31, 44, BONE_LIGHT); // flying woodchip
    }

    // Stacks of peeled round logs on the front-right
    for (let i = 0; i < 3; i++) {
      isoBox(ctx, 39 + i * 2, 58 - i, 8, 3, 3, { top: WOOD_LIGHT, left: WOOD_DARK, right: WOOD_MID });
    }

    // Small tool-hardening fire pit on left
    drawFirePit(ctx, 20, 52, frame);

    return canvas;
  });
}

/** 14. SMELTER (Industry, height 1.3, 2 frames): Primitive clay pit bloomery & charcoal kiln. */
function buildSmelter(): HTMLCanvasElement[] {
  return [0, 1].map((frame) => {
    const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);
    isoDiamond(ctx, 32, 48, 28, DIRT_DARK, OUT);
    isoDiamond(ctx, 32, 48, 23, '#5c4033', DIRT_0);

    // Large domed clay-and-stone bloomery furnace on back-center
    drawHideDome(ctx, 32, 47, 12, 16);
    // Glowing furnace taphole with molten bronze run
    rect(ctx, 30, 43, 5, 4, OUT);
    rect(ctx, 31, 44, 3, 3, FLAME_DARK);
    rect(ctx, 32, 45, 1, 1, FLAME_CORE);

    // Molten metal runoff channel into stone ingot molds in front
    rect(ctx, 32, 48, 2, 6, FLAME_MID);
    px(ctx, 32, 49, FLAME_CORE);
    px(ctx, 33, 51, FLAME_CORE);
    isoBox(ctx, 33, 57, 5, 8, 3, { top: FUR_LIGHT, left: FUR_DARK, right: FUR_MID });
    rect(ctx, 32, 52, 3, 2, FLAME_CORE); // molten ingot

    // Twin rawhide foot bellows on left
    isoBox(ctx, 20, 51, 5, 5, 4, { top: HIDE_MID, left: HIDE_DARK, right: WOOD_DARK });
    rect(ctx, 24, 48, 4, 1, BONE_LIGHT); // bone blast pipe into furnace

    // Charcoal heaps and raw ore rocks on right
    for (const [ox, oy] of [
      [42, 47],
      [45, 51],
      [43, 54],
    ] as const) {
      rect(ctx, ox - 1, oy - 1, 3, 3, OUT);
      px(ctx, ox, oy, FUR_DARK);
      px(ctx, ox + 1, oy - 1, OCHRE_RED);
    }

    // Heavy sparks and smoke billows (2 frames)
    const sOff = frame * 2;
    disc(ctx, 32, 28 - sOff, 3, FUR_DARK);
    disc(ctx, 34, 23 - sOff, 3, FUR_MID);
    disc(ctx, 31, 18 - sOff, 2, FUR_LIGHT);
    if (frame === 1) {
      px(ctx, 30, 26, FLAME_CORE);
      px(ctx, 35, 24, FLAME_MID);
    }

    return canvas;
  });
}

/** 15. CRAFTHALL (Industry, height 1.4): Master flint knappers & bone carvers' pavilion. */
function buildCrafthall(): HTMLCanvasElement[] {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);
  isoDiamond(ctx, 32, 48, 29, DIRT_0, OUT);
  isoDiamond(ctx, 32, 48, 24, DIRT_LIGHT, DIRT_DARK);

  // Broad stone-and-timber artisan hall
  isoBox(ctx, 32, 56, 17, 16, 9, { top: HIDE_LIGHT, left: FUR_DARK, right: FUR_MID });
  drawHideDome(ctx, 32, 47, 14, 11);

  // Wide workshop opening on right flank
  rightWallRect(ctx, 32, 56, 3, 1, 10, 6, OUT);
  rightWallRect(ctx, 32, 56, 4, 2, 8, 5, '#261a10');
  // Mammoth tusk support pillars along opening
  drawTusk(ctx, 34, 55, 37, 45, 3);
  drawTusk(ctx, 42, 51, 41, 44, 3);

  // Large flat boulder carving benches with flint spearheads and ivory figurines
  isoBox(ctx, 24, 57, 6, 7, 4, { top: FUR_LIGHT, left: FUR_DARK, right: FUR_MID });
  rect(ctx, 22, 51, 3, 2, '#cfd8dc'); // obsidian dagger
  px(ctx, 25, 50, BONE_LIGHT); // carved ivory fetish

  // Front tool display: antler picks, stone axes, bone needles
  rect(ctx, 39, 56, 2, 4, OUT);
  px(ctx, 39, 57, BONE_LIGHT);
  px(ctx, 40, 56, WOOD_LIGHT);

  // Wall cave petroglyph frieze on left wall
  leftWallRect(ctx, 32, 56, 2, 6, 13, 2, OCHRE_RED);
  leftWallRect(ctx, 32, 56, 4, 7, 2, 1, BONE_LIGHT);

  return [canvas];
}

/** 16. FOUNDRY (Industry, height 1.9, 2 frames): Great Clan Smelting Crag & twin blast chimneys. */
function buildFoundry(): HTMLCanvasElement[] {
  return [0, 1].map((frame) => {
    const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);
    isoDiamond(ctx, 32, 48, 29, DIRT_DARK, OUT);
    isoDiamond(ctx, 32, 48, 24, '#4a3525', DIRT_0);

    // Massive cyclopean stone furnace base (h=13)
    isoBox(ctx, 32, 58, 18, 18, 13, { top: FUR_DARK, left: FUR_DARK, right: FUR_MID });

    // Roaring furnace portal in center with glowing crucible
    rightWallRect(ctx, 32, 58, 4, 1, 6, 8, OUT);
    rightWallRect(ctx, 32, 58, 5, 2, 4, 7, FLAME_DARK);
    rightWallRect(ctx, 32, 58, 6, 3, 2, 4, FLAME_CORE);

    // Molten bronze/iron trench pouring out across stone floor
    rightWallRect(ctx, 32, 58, 6, 0, 2, 2, FLAME_MID);
    rect(ctx, 37, 56, 4, 4, OUT);
    rect(ctx, 38, 57, 2, 2, FLAME_CORE);

    // Twin towering stone chimney flues rising from rear of furnace
    // Left chimney (h=14)
    isoBox(ctx, 24, 45, 6, 6, 14, { top: FUR_LIGHT, left: FUR_DARK, right: FUR_MID });
    // Right chimney (h=14)
    isoBox(ctx, 38, 42, 6, 6, 14, { top: FUR_LIGHT, left: FUR_DARK, right: FUR_MID });

    // Billowing animated smoke from both chimneys (2 frames)
    const sOff = frame * 2;
    // Left chimney smoke
    disc(ctx, 24, 28 - sOff, 3, '#212121');
    disc(ctx, 23, 22 - sOff, 4, FUR_DARK);
    disc(ctx, 25, 16 - sOff, 3, FUR_MID);
    // Right chimney smoke
    disc(ctx, 38, 25 - sOff, 3, '#212121');
    disc(ctx, 40, 19 - sOff, 4, FUR_DARK);
    disc(ctx, 39, 13 - sOff, 3, FUR_MID);

    if (frame === 1) {
      px(ctx, 24, 29, FLAME_MID);
      px(ctx, 38, 26, FLAME_MID);
    }

    // Heavy iron ore boulders and charcoal piles stacked beside furnace
    for (const [bx, by] of [
      [18, 54],
      [21, 57],
      [44, 52],
    ] as const) {
      rect(ctx, bx - 1, by - 1, 3, 3, OUT);
      px(ctx, bx, by, FUR_DARK);
    }

    return canvas;
  });
}

// ============================================================================
// 4. SERVICES
// ============================================================================

/** 17. SHRINE (Services, height 1.0): Megalithic dolmen ancestor altar with sacred eternal flame. */
function buildShrine(): HTMLCanvasElement[] {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);
  isoDiamond(ctx, 32, 48, 26, DIRT_DARK, OUT);
  isoDiamond(ctx, 32, 48, 21, DIRT_0, FUR_DARK);

  // Concentric circle of small ritual standing stones
  for (const [sx, sy] of [
    [20, 46],
    [24, 52],
    [40, 52],
    [44, 46],
  ] as const) {
    rect(ctx, sx - 1, sy - 4, 3, 5, OUT);
    rect(ctx, sx, sy - 3, 2, 4, FUR_LIGHT);
  }

  // Great Dolmen / Trilithon in center:
  // Left upright megalith
  isoBox(ctx, 27, 51, 5, 5, 11, { top: FUR_LIGHT, left: FUR_DARK, right: FUR_MID });
  // Right upright megalith
  isoBox(ctx, 37, 47, 5, 5, 11, { top: FUR_LIGHT, left: FUR_DARK, right: FUR_MID });

  // Massive horizontal capstone boulder resting on top of the two pillars
  isoBox(ctx, 32, 41, 14, 12, 4, { top: BONE_MID, left: FUR_DARK, right: FUR_LIGHT });

  // Horned beast skull totem resting on center of capstone
  rect(ctx, 31, 33, 3, 3, BONE_LIGHT);
  px(ctx, 31, 34, OUT);
  px(ctx, 33, 34, OUT);
  drawTusk(ctx, 30, 34, 26, 30, -2);
  drawTusk(ctx, 34, 34, 38, 30, -2);

  // Sacred ancestor flame burning between the megalith pillars
  drawFirePit(ctx, 32, 49, 0);

  // Offerings of amber beads & red ochre handprint on the dolmen pillar
  px(ctx, 29, 44, OCHRE_RED);
  px(ctx, 35, 53, FLAME_MID);
  px(ctx, 37, 52, BONE_LIGHT);

  return [canvas];
}

/** 18. GARDEN (Services, height 0.4): Wild steppe herb & healing flora glade. */
function buildGarden(): HTMLCanvasElement[] {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);
  isoDiamond(ctx, 32, 48, 28, DIRT_0, OUT);
  isoDiamond(ctx, 32, 48, 24, '#4a3824', DIRT_DARK);

  // Curved river-stone garden borders separating lush planting mounds
  for (let u = 4; u < 24; u += 3) {
    const sx = 32 + (u - 14);
    const sy = 48 + ((u + 14) >> 1) - 14;
    rect(ctx, sx - 1, sy, 2, 2, FUR_DARK);
    px(ctx, sx, sy, FUR_LIGHT);
  }

  // Lush wild herb beds & moonleaf patches
  for (const [cx0, cy0, r0] of [
    [24, 46, 5],
    [32, 43, 6],
    [40, 48, 5],
    [32, 53, 5],
  ] as const) {
    disc(ctx, cx0, cy0, r0, LEAF_DARK);
    disc(ctx, cx0, cy0, r0 - 1, LEAF_MID);
    px(ctx, cx0, cy0 - 1, LEAF_LIGHT);
  }

  // Colorful wild blossoms: golden tundra buttercups, red poppies, pale star-moss
  for (const [fx, fy, col] of [
    [23, 44, FLAME_CORE],
    [26, 47, OCHRE_RED],
    [31, 41, FLAME_CORE],
    [34, 43, BONE_LIGHT],
    [38, 46, OCHRE_RED],
    [42, 49, FLAME_CORE],
    [30, 52, BONE_LIGHT],
    [34, 54, OCHRE_RED],
    [32, 52, FLAME_CORE],
  ] as const) {
    rect(ctx, fx, fy, 2, 2, col);
    px(ctx, fx, fy, '#ffffff');
  }

  // Low mossy boulder cluster in the center
  rect(ctx, 31, 47, 4, 3, FUR_MID);
  px(ctx, 32, 47, LEAF_LIGHT);

  return [canvas];
}

/** 19. THEATER (Services, height 1.5, 2 frames): Tribal storytelling circle & sacred fire amphitheater. */
function buildTheater(): HTMLCanvasElement[] {
  return [0, 1].map((frame) => {
    const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);
    isoDiamond(ctx, 32, 48, 29, DIRT_0, OUT);
    isoDiamond(ctx, 32, 48, 25, DIRT_DARK, DIRT_1);

    // Stepped concentric semicircular stone seating tiers (back-left to back-right)
    // Tier 1 (highest outer tier, h=9)
    isoBox(ctx, 32, 46, 17, 17, 9, { top: FUR_LIGHT, left: FUR_DARK, right: FUR_MID });
    // Tier 2 (middle tier cut, h=5)
    isoBox(ctx, 32, 51, 13, 13, 5, { top: BONE_MID, left: FUR_DARK, right: FUR_LIGHT });
    // Tier 3 (sunken orchestra pit, h=2)
    isoBox(ctx, 32, 54, 8, 8, 2, { top: DIRT_0, left: FUR_DARK, right: FUR_MID });

    // Roaring tribal storytelling bonfire in the sunken center (2 frames)
    drawFirePit(ctx, 32, 52, frame);

    // Left and right carved ceremonial totem poles hung with animal dance masks
    // Left totem pole
    rect(ctx, 18, 34, 2, 14, OUT);
    rect(ctx, 18, 34, 1, 13, WOOD_LIGHT);
    rect(ctx, 17, 36, 4, 4, BONE_LIGHT); // wolf mask
    px(ctx, 18, 38, OUT);
    px(ctx, 20, 38, OUT);

    // Right totem pole
    rect(ctx, 46, 34, 2, 14, OUT);
    rect(ctx, 46, 34, 1, 13, WOOD_LIGHT);
    rect(ctx, 45, 36, 4, 4, OCHRE_RED); // painted bear mask
    px(ctx, 46, 38, BONE_LIGHT);
    px(ctx, 48, 38, BONE_LIGHT);

    // Mammoth-rib arching backdrop over the rear seating tier
    drawTusk(ctx, 23, 38, 32, 28, 4);
    drawTusk(ctx, 41, 38, 32, 28, 4);
    rect(ctx, 31, 27, 3, 3, BONE_LIGHT); // central skull keystone

    return canvas;
  });
}

/** 20. OBSERVATORY (Services, height 2.0): Megalithic Sun & Star Pointer Spire. */
function buildObservatory(): HTMLCanvasElement[] {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);
  isoDiamond(ctx, 32, 48, 28, DIRT_DARK, OUT);
  isoDiamond(ctx, 32, 48, 23, DIRT_0, DIRT_1);

  // Massive stepped cyclopean stone tower body (h=22 total)
  // Lower tower tier (h=12)
  isoBox(ctx, 32, 57, 14, 14, 12, { top: FUR_LIGHT, left: FUR_DARK, right: FUR_MID });
  rightWallRect(ctx, 32, 57, 3, 1, 4, 6, OUT);
  rightWallRect(ctx, 32, 57, 4, 2, 2, 5, '#261a10');
  // Astronomical spiral petroglyph on left wall
  leftWallRect(ctx, 32, 57, 3, 5, 4, 4, OUT);
  leftWallRect(ctx, 32, 57, 4, 6, 2, 2, OCHRE_RED);

  // Upper tower tier (h=12)
  isoBox(ctx, 32, 45, 11, 11, 12, { top: BONE_MID, left: FUR_DARK, right: FUR_MID });
  rightWallRect(ctx, 32, 45, 3, 3, 3, 4, OUT);
  rightWallRect(ctx, 32, 45, 4, 4, 1, 2, FLAME_CORE);

  // Observation parapet on top platform
  const topY = 33;
  isoBox(ctx, 32, topY, 13, 13, 3, { top: FUR_LIGHT, left: FUR_DARK, right: FUR_MID });

  // Two colossal mammoth tusks forming parabolic star sighting fork
  drawTusk(ctx, 26, topY - 3, 22, 17, -3);
  drawTusk(ctx, 38, topY - 3, 42, 17, -3);

  // Central astronomical alignment bone gnomon pointed straight up at the stars
  rect(ctx, 31, topY - 14, 2, 12, OUT);
  rect(ctx, 31, topY - 14, 1, 11, BONE_LIGHT);
  px(ctx, 31, topY - 15, FLAME_CORE); // gilded needle tip catching sun/starlight

  return [canvas];
}

/** 21. HOSPITAL (Services, height 1.6): Great Shaman's Healing Sanatorium & thermal steam lodge. */
function buildHospital(): HTMLCanvasElement[] {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);
  isoDiamond(ctx, 32, 48, 28, DIRT_0, OUT);
  isoDiamond(ctx, 32, 48, 23, BONE_MID, FUR_DARK);

  // Clean pale chalk-stone & bleached-bone building body
  const fx = 32;
  const fy = 56;
  const wL = 17;
  const wR = 17;
  const wallH = 12;
  isoBox(ctx, fx, fy, wL, wR, wallH, {
    top: BONE_LIGHT,
    left: BONE_DARK,
    right: BONE_MID,
  });
  // Green healing herb trim band along upper cornice
  leftWallRect(ctx, fx, fy, 0, wallH - 2, wL, 2, LEAF_MID);
  rightWallRect(ctx, fx, fy, 0, wallH - 2, wR, 2, LEAF_LIGHT);

  // Broad healer's entrance doorway & warm hearth windows
  rightWallRect(ctx, fx, fy, 4, 1, 5, 7, OUT);
  rightWallRect(ctx, fx, fy, 5, 2, 3, 6, '#261a10');
  rightWallRect(ctx, fx, fy, 11, 4, 4, 4, OUT);
  rightWallRect(ctx, fx, fy, 12, 5, 2, 2, FLAME_CORE);

  // Large bleached white hide dome roof
  drawHideDome(ctx, 32, 44, 13, 11);

  // Prominent red-ochre & green shamanic healing cross emblem on front gable
  disc(ctx, 32, 36, 5, OUT);
  disc(ctx, 32, 36, 4, BONE_LIGHT);
  rect(ctx, 31, 33, 3, 7, OCHRE_RED);
  rect(ctx, 29, 35, 7, 3, OCHRE_RED);
  px(ctx, 32, 36, LEAF_LIGHT);

  // Steaming medicinal herb infusion pit in front-left
  isoBox(ctx, 22, 56, 5, 5, 3, { top: WATER_MID, left: FUR_DARK, right: FUR_MID });
  px(ctx, 22, 51, BONE_LIGHT);
  px(ctx, 23, 49, BONE_MID);

  // Stone mortars filled with healing herbs in front-right
  isoBox(ctx, 42, 56, 4, 4, 3, { top: FUR_LIGHT, left: FUR_DARK, right: FUR_MID });
  rect(ctx, 41, 51, 2, 2, LEAF_MID);

  return [canvas];
}

/** 22. UNIVERSITY (Services, height 2.2): Clan Elders' Grand Hall of Lore & Sacred Cave Wisdom. */
function buildUniversity(): HTMLCanvasElement[] {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);
  isoDiamond(ctx, 32, 48, 29, DIRT_DARK, OUT);
  isoDiamond(ctx, 32, 48, 25, DIRT_0, DIRT_1);

  // Stepped megalithic terrace plinth
  const fx = 32;
  const fy = 59;
  isoBox(ctx, fx, fy, 19, 19, 4, { top: BONE_MID, left: FUR_DARK, right: FUR_LIGHT });

  // Monumental assembly hall lower storey (h=11)
  isoBox(ctx, fx, fy - 4, 17, 17, 11, { top: FUR_LIGHT, left: FUR_DARK, right: FUR_MID });
  // Epic cave petroglyphs (mammoth herd & tribal hunters) across left and right walls
  leftWallRect(ctx, fx, fy - 4, 2, 3, 13, 5, OUT);
  leftWallRect(ctx, fx, fy - 4, 3, 4, 11, 3, OCHRE_RED);
  px(ctx, 24, 47, BONE_LIGHT);
  px(ctx, 27, 46, BONE_LIGHT);

  // Grand entrance portico framed by 4 cyclopean stone pillars & arching mammoth tusks
  drawTusk(ctx, 34, 55, 37, 42, 4);
  drawTusk(ctx, 44, 50, 41, 42, 4);
  rightWallRect(ctx, fx, fy - 4, 4, 1, 6, 8, OUT);
  rightWallRect(ctx, fx, fy - 4, 5, 2, 4, 7, '#261a10');

  // Upper lore sanctuary storey (h=10)
  isoBox(ctx, fx, fy - 15, 13, 13, 10, { top: HIDE_LIGHT, left: HIDE_DARK, right: HIDE_MID });
  rightWallRect(ctx, fx, fy - 15, 3, 3, 4, 4, OUT);
  rightWallRect(ctx, fx, fy - 15, 4, 4, 2, 2, FLAME_CORE);

  // Great ceremonial hide dome roof crowned by giant antlered skull
  drawHideDome(ctx, 32, 30, 11, 11);
  rect(ctx, 30, 18, 4, 3, BONE_LIGHT);
  px(ctx, 31, 19, OUT);
  px(ctx, 33, 19, OUT);
  drawTusk(ctx, 30, 18, 24, 13, -3);
  drawTusk(ctx, 34, 18, 40, 13, -3);

  // Eternal flame brazier burning on the front plaza
  drawFirePit(ctx, 33, 58, 0);

  return [canvas];
}

// ============================================================================
// 5. MILITARY
// ============================================================================

/** 23. PALISADE (Military, height 0.8): Sharpened log wall section & mammoth-rib rampart. */
function buildPalisade(): HTMLCanvasElement[] {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);
  isoDiamond(ctx, 32, 48, 26, DIRT_DARK, OUT);
  isoDiamond(ctx, 32, 48, 22, '#543d2b', DIRT_0);

  // Earthen rampart embankment & rear timber catwalk
  isoBox(ctx, 24, 43, 11, 4, 6, { top: WOOD_LIGHT, left: WOOD_DARK, right: WOOD_MID });
  isoBox(ctx, 40, 43, 4, 11, 6, { top: WOOD_LIGHT, left: WOOD_DARK, right: WOOD_MID });

  // Front sharpened log and mammoth-rib wall running across the tile
  for (let u = 0; u < 16; u++) {
    const x = 28 - u;
    const yBot = 50 - (u >> 1);
    const isRib = u % 4 === 0;
    const stakeH = isRib ? 15 : u % 2 === 0 ? 12 : 14;
    const yTop = yBot - stakeH;
    rect(ctx, x, yTop, 1, stakeH, isRib ? BONE_MID : WOOD_DARK);
    px(ctx, x, yTop - 1, isRib ? BONE_LIGHT : WOOD_LIGHT);
  }

  for (let v = 0; v < 16; v++) {
    const x = 36 + v;
    const yBot = 50 - (v >> 1);
    const isRib = v % 4 === 0;
    const stakeH = isRib ? 15 : v % 2 === 0 ? 12 : 14;
    const yTop = yBot - stakeH;
    rect(ctx, x, yTop, 1, stakeH, isRib ? BONE_MID : WOOD_MID);
    px(ctx, x, yTop - 1, isRib ? BONE_LIGHT : WOOD_LIGHT);
  }

  // Central reinforced timber-and-bone barricade gate
  rect(ctx, 29, 42, 6, 9, OUT);
  rect(ctx, 30, 43, 4, 8, WOOD_DARK);
  // Cross bracing
  px(ctx, 31, 45, BONE_LIGHT);
  px(ctx, 32, 46, BONE_LIGHT);
  px(ctx, 31, 48, BONE_LIGHT);
  px(ctx, 32, 47, BONE_LIGHT);

  // Tusks framing the palisade gateway
  drawTusk(ctx, 28, 51, 31, 41, 3);
  drawTusk(ctx, 36, 51, 33, 41, 3);

  // Sharpened stakes in ditch in front of gate
  for (const [sx, sy] of [
    [27, 54],
    [31, 56],
    [35, 54],
  ] as const) {
    rect(ctx, sx, sy - 4, 1, 4, OUT);
    px(ctx, sx, sy - 5, BONE_LIGHT);
  }

  return [canvas];
}

/** 24. WATCHTOWER (Military, height 2.0, 2 frames): Tall timber-and-bone scout scaffold & signal brazier. */
function buildWatchtower(): HTMLCanvasElement[] {
  return [0, 1].map((frame) => {
    const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);
    isoDiamond(ctx, 32, 48, 26, DIRT_0, OUT);
    isoDiamond(ctx, 32, 48, 21, DIRT_1, DIRT_DARK);

    // Boulder foundation pads for stilts
    for (const [bx, by] of [
      [22, 46],
      [32, 53],
      [42, 46],
      [32, 41],
    ] as const) {
      rect(ctx, bx - 1, by - 1, 3, 3, OUT);
      px(ctx, bx, by, FUR_MID);
    }

    // Four tall timber corner stilts rising to crow's nest (y=24)
    rect(ctx, 22, 23, 2, 24, OUT);
    rect(ctx, 22, 23, 1, 23, WOOD_DARK);
    rect(ctx, 41, 23, 2, 24, OUT);
    rect(ctx, 42, 23, 1, 23, WOOD_MID);
    rect(ctx, 31, 28, 2, 26, OUT);
    rect(ctx, 31, 28, 1, 25, WOOD_LIGHT);
    rect(ctx, 31, 19, 2, 23, OUT);
    rect(ctx, 31, 19, 1, 22, WOOD_DARK);

    // Diagonal timber cross bracing
    for (let i = 0; i < 3; i++) {
      const y0 = 44 - i * 7;
      rect(ctx, 24, y0, 16, 1, WOOD_LIGHT);
      rect(ctx, 26, y0 + 3, 12, 1, WOOD_DARK);
    }

    // Lashed ladder climbing the center stilt
    for (let ly = 48; ly >= 28; ly -= 3) {
      rect(ctx, 30, ly, 4, 1, BONE_LIGHT);
    }

    // Fortified crow's nest lookout platform (at y=24)
    isoBox(ctx, 32, 26, 12, 12, 4, { top: WOOD_LIGHT, left: HIDE_DARK, right: HIDE_MID });
    // Protective bone parapet railings
    rect(ctx, 24, 18, 16, 2, BONE_LIGHT);
    rect(ctx, 24, 18, 1, 5, BONE_LIGHT);
    rect(ctx, 39, 18, 1, 5, BONE_LIGHT);

    // Conical hide roof over lookout
    drawHideDome(ctx, 32, 18, 8, 8);

    // Signal fire brazier on platform with animated flame & smoke (2 frames)
    rect(ctx, 36, 19, 4, 3, OUT);
    rect(ctx, 37, 20, 2, 2, FLAME_DARK);
    const fOff = frame === 0 ? 0 : 1;
    px(ctx, 37 + fOff, 18, FLAME_CORE);
    disc(ctx, 38, 14 - fOff * 2, 2, FUR_DARK);
    disc(ctx, 39, 9 - fOff * 2, 2, FUR_MID);

    return canvas;
  });
}

/** 25. ARMORY (Military, height 1.3): Clan Arsenal & Flint Weapon Bunker. */
function buildArmory(): HTMLCanvasElement[] {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);
  isoDiamond(ctx, 32, 48, 28, DIRT_DARK, OUT);
  isoDiamond(ctx, 32, 48, 23, DIRT_0, DIRT_1);

  // Massive rough-stone arsenal bunker body (h=11)
  const fx = 32;
  const fy = 56;
  isoBox(ctx, fx, fy, 16, 16, 11, { top: FUR_LIGHT, left: FUR_DARK, right: FUR_MID });

  // Heavy timber-and-bone door with flint boss studs
  rightWallRect(ctx, fx, fy, 3, 1, 5, 7, OUT);
  rightWallRect(ctx, fx, fy, 4, 2, 3, 6, WOOD_DARK);
  rightWallRect(ctx, fx, fy, 5, 4, 1, 1, BONE_LIGHT);
  rightWallRect(ctx, fx, fy, 5, 6, 1, 1, BONE_LIGHT);

  // Tough hide roof with mammoth-rib ridge crest
  drawHideDome(ctx, 32, 45, 12, 10);
  rect(ctx, 31, 33, 3, 3, BONE_LIGHT);
  px(ctx, 31, 34, OUT);
  px(ctx, 33, 34, OUT);

  // Front spear racks bristling with flint spears and stone axes
  rect(ctx, 22, 48, 1, 10, OUT);
  rect(ctx, 26, 50, 1, 10, OUT);
  rect(ctx, 22, 49, 5, 1, WOOD_LIGHT);
  for (let sx = 23; sx <= 26; sx++) {
    px(ctx, sx, 46, '#cfd8dc'); // knapped flint tips
  }

  // Stacked mammoth-hide shields painted with tribal red-ochre eye runes
  disc(ctx, 42, 54, 4, OUT);
  disc(ctx, 42, 54, 3, HIDE_LIGHT);
  px(ctx, 42, 54, OCHRE_RED);
  disc(ctx, 45, 51, 4, OUT);
  disc(ctx, 45, 51, 3, HIDE_MID);
  px(ctx, 45, 51, OCHRE_RED);

  return [canvas];
}

/** 26. WARCAMP (Military, height 1.0, 2 frames): Steppe Warband Encampment & roaring council fire. */
function buildWarcamp(): HTMLCanvasElement[] {
  return [0, 1].map((frame) => {
    const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);
    isoDiamond(ctx, 32, 48, 29, DIRT_DARK, OUT);
    isoDiamond(ctx, 32, 48, 25, '#694a32', DIRT_0);

    // War-teepee 1 (back-left, tall striped hide cone)
    drawHideDome(ctx, 24, 44, 8, 14);
    // Crossed poles emerging from apex
    px(ctx, 23, 29, WOOD_LIGHT);
    px(ctx, 25, 29, WOOD_LIGHT);

    // War-teepee 2 (back-right, spotted fur cone)
    drawHideDome(ctx, 40, 42, 8, 13);
    px(ctx, 39, 28, WOOD_LIGHT);
    px(ctx, 41, 28, WOOD_LIGHT);

    // Central roaring war council fire pit (2 frames)
    drawFirePit(ctx, 32, 49, frame);

    // Large mammoth-hide war drum on front-left platform
    isoBox(ctx, 24, 56, 5, 5, 5, { top: BONE_LIGHT, left: HIDE_DARK, right: HIDE_MID });
    leftWallRect(ctx, 24, 56, 1, 2, 3, 2, OCHRE_RED);
    rightWallRect(ctx, 24, 56, 1, 2, 3, 2, OCHRE_RED);

    // War totem banner pole on front-right tipped with skull & red hide pennant
    rect(ctx, 43, 38, 2, 18, OUT);
    rect(ctx, 43, 38, 1, 17, WOOD_LIGHT);
    rect(ctx, 42, 37, 4, 3, BONE_LIGHT);
    px(ctx, 43, 38, OUT);
    // Fluttering pennant (shifts with frame)
    const pOff = frame === 0 ? 0 : 1;
    rect(ctx, 45, 39, 4 + pOff, 3, OCHRE_RED);

    // Spear rack beside drum
    rect(ctx, 17, 50, 1, 8, OUT);
    rect(ctx, 20, 52, 1, 8, OUT);
    rect(ctx, 17, 51, 4, 1, WOOD_LIGHT);
    px(ctx, 18, 48, '#cfd8dc');
    px(ctx, 20, 50, '#cfd8dc');

    return canvas;
  });
}

/** 27. FORTRESS (Military, height 2.3): The Great Megalithic Stronghold & Twin Bastion Citadel. */
function buildFortress(): HTMLCanvasElement[] {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);
  isoDiamond(ctx, 32, 48, 29, DIRT_DARK, OUT);
  isoDiamond(ctx, 32, 48, 25, DIRT_0, DIRT_1);

  // Massive central gatehouse block (h=14)
  isoBox(ctx, 32, 57, 18, 18, 14, { top: FUR_LIGHT, left: FUR_DARK, right: FUR_MID });

  // Heavy spiked timber portcullis gate flanked by twin giant mammoth tusks
  drawTusk(ctx, 34, 54, 38, 41, 4);
  drawTusk(ctx, 44, 49, 40, 41, 4);
  rightWallRect(ctx, 32, 57, 4, 1, 6, 9, OUT);
  rightWallRect(ctx, 32, 57, 5, 2, 4, 8, '#261a10');
  // Spiked portcullis bars
  for (let gy = 3; gy <= 8; gy += 2) {
    rightWallRect(ctx, 32, 57, 5, gy, 4, 1, WOOD_DARK);
  }

  // Left Bastion Tower (h=19, rising to y=19)
  isoBox(ctx, 22, 51, 8, 8, 19, { top: BONE_MID, left: FUR_DARK, right: FUR_MID });
  // Battlements on left tower
  rect(ctx, 15, 17, 3, 3, OUT);
  rect(ctx, 16, 17, 2, 2, FUR_LIGHT);
  rect(ctx, 21, 14, 3, 3, OUT);
  rect(ctx, 22, 14, 2, 2, FUR_LIGHT);
  rect(ctx, 27, 17, 3, 3, OUT);
  rect(ctx, 28, 17, 2, 2, FUR_LIGHT);

  // Right Bastion Tower (h=19, rising to y=16)
  isoBox(ctx, 42, 44, 8, 8, 19, { top: BONE_MID, left: FUR_DARK, right: FUR_MID });
  // Battlements on right tower
  rect(ctx, 35, 14, 3, 3, OUT);
  rect(ctx, 36, 14, 2, 2, FUR_LIGHT);
  rect(ctx, 41, 11, 3, 3, OUT);
  rect(ctx, 42, 11, 2, 2, FUR_LIGHT);
  rect(ctx, 47, 14, 3, 3, OUT);
  rect(ctx, 48, 14, 2, 2, FUR_LIGHT);

  // High fortified rampart connecting the two towers
  rect(ctx, 27, 28, 10, 2, OUT);
  rect(ctx, 27, 28, 9, 1, BONE_LIGHT);

  // Skull totems & tribal hide war standards atop towers
  rect(ctx, 22, 8, 1, 9, OUT);
  rect(ctx, 20, 9, 3, 3, OCHRE_RED);
  rect(ctx, 42, 5, 1, 9, OUT);
  rect(ctx, 43, 6, 3, 3, HIDE_LIGHT);

  return [canvas];
}

// ============================================================================
// 6. DECORATION
// ============================================================================

/** 28. FLOWERBED (Decoration, height 0.3): Steppe river-stone wildflower bed. */
function buildFlowerbed(): HTMLCanvasElement[] {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);
  isoDiamond(ctx, 32, 48, 22, DIRT_0, OUT);
  isoDiamond(ctx, 32, 48, 17, '#4a3622', DIRT_DARK);

  // Raised river-pebble border ring
  for (let u = 2; u < 16; u += 2) {
    const sx1 = 32 + (u - 9);
    const sy1 = 48 + ((u + 9) >> 1) - 9;
    rect(ctx, sx1 - 1, sy1, 2, 2, FUR_DARK);
    px(ctx, sx1, sy1, FUR_LIGHT);
  }

  // Dark soil mound in center
  disc(ctx, 32, 48, 8, '#3d2b1a');

  // Clustered vibrant tundra wildflowers: golden buttercups, scarlet poppies, white stars, purple heather
  for (const [fx, fy, col] of [
    [28, 47, FLAME_CORE],
    [31, 45, OCHRE_RED],
    [35, 46, '#ab47bc'],
    [33, 49, BONE_LIGHT],
    [30, 50, FLAME_CORE],
    [36, 49, OCHRE_RED],
    [27, 49, LEAF_LIGHT],
    [34, 44, LEAF_LIGHT],
  ] as const) {
    rect(ctx, fx, fy, 2, 2, col);
    px(ctx, fx, fy, '#ffffff');
  }

  return [canvas];
}

/** 29. HEDGE (Decoration, height 0.5): Wild thorny steppe bramble & willow wattle hedge. */
function buildHedge(): HTMLCanvasElement[] {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);
  isoDiamond(ctx, 32, 48, 24, DIRT_0, OUT);
  isoDiamond(ctx, 32, 48, 19, DIRT_1, DIRT_DARK);

  // Dense thorny bramble wall running diagonally across the tile
  for (let u = 0; u < 18; u++) {
    const x = 23 + u;
    const yBot = 54 - (u >> 1);
    const h = (u % 3 === 0) ? 9 : (u % 2 === 0) ? 8 : 7;
    rect(ctx, x - 2, yBot - h, 4, h, OUT);
    rect(ctx, x - 1, yBot - h + 1, 3, h - 1, LEAF_DARK);
    rect(ctx, x - 1, yBot - h + 2, 2, h - 3, LEAF_MID);
    px(ctx, x, yBot - h, LEAF_LIGHT);

    // Tangled wooden willow wattle stakes and red wild thornberries
    if (u % 4 === 1) {
      px(ctx, x, yBot - 3, WOOD_DARK);
      px(ctx, x, yBot - 5, OCHRE_RED);
    } else if (u % 4 === 3) {
      px(ctx, x, yBot - 4, FLAME_MID);
    }
  }

  return [canvas];
}

/** 30. WELL (Decoration, height 0.7): Boulder-rimmed freshwater spring & hollowed gourd winch. */
function buildWell(): HTMLCanvasElement[] {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);
  isoDiamond(ctx, 32, 48, 25, DIRT_0, OUT);
  isoDiamond(ctx, 32, 48, 20, DIRT_1, DIRT_DARK);

  // Circular stone well base of rough river boulders
  disc(ctx, 32, 50, 9, OUT);
  disc(ctx, 32, 50, 8, FUR_DARK);
  disc(ctx, 32, 50, 7, FUR_MID);
  // Interior deep water with sunlight reflection
  disc(ctx, 32, 50, 5, WATER_DEEP);
  px(ctx, 31, 49, WATER_MID);
  px(ctx, 32, 49, WATER_FOAM);

  // Heavy timber tripod crane over the well
  rect(ctx, 25, 36, 2, 16, OUT);
  rect(ctx, 25, 36, 1, 15, WOOD_DARK);
  rect(ctx, 39, 36, 2, 16, OUT);
  rect(ctx, 40, 36, 1, 15, WOOD_MID);
  rect(ctx, 31, 31, 2, 18, OUT);
  rect(ctx, 31, 31, 1, 17, WOOD_LIGHT);

  // Lashed bone crossbeam atop tripod
  rect(ctx, 25, 33, 16, 2, OUT);
  rect(ctx, 25, 33, 15, 1, BONE_LIGHT);

  // Suspended sinew rope with hollowed water gourd bucket
  rect(ctx, 32, 35, 1, 10, BONE_MID);
  rect(ctx, 31, 45, 3, 4, OUT);
  rect(ctx, 31, 45, 2, 3, HIDE_LIGHT);
  px(ctx, 32, 46, WATER_FOAM);

  // Flat boulder drinking trough beside the well
  isoBox(ctx, 22, 55, 4, 4, 3, { top: WATER_MID, left: FUR_DARK, right: FUR_MID });
  px(ctx, 22, 50, WATER_FOAM);

  return [canvas];
}

/** 31. POND (Decoration, height 0.2, 2 frames): Steppe oasis rock pool & water lily glade. */
function buildPond(): HTMLCanvasElement[] {
  return [0, 1].map((frame) => {
    const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);
    isoDiamond(ctx, 32, 48, 27, DIRT_0, OUT);
    isoDiamond(ctx, 32, 48, 23, '#4f3a28', DIRT_DARK);

    // Natural irregular boulder rim surrounding the pool
    for (const [bx, by] of [
      [20, 48],
      [24, 42],
      [31, 40],
      [40, 42],
      [45, 48],
      [41, 55],
      [32, 57],
      [23, 54],
    ] as const) {
      rect(ctx, bx - 2, by - 2, 4, 4, OUT);
      rect(ctx, bx - 1, by - 1, 3, 3, FUR_MID);
      px(ctx, bx, by - 1, FUR_LIGHT);
    }

    // Clear shimmering water basin
    disc(ctx, 32, 48, 12, WATER_DEEP);
    disc(ctx, 32, 48, 10, WATER_MID);
    disc(ctx, 32, 48, 8, WATER_SHALLOW);

    // Animated water surface glints & ripples (2 frames)
    const wShift = frame === 0 ? 0 : 1;
    px(ctx, 28 + wShift, 46, WATER_FOAM);
    px(ctx, 34 - wShift, 49, WATER_FOAM);
    px(ctx, 37 + wShift, 46, WATER_FOAM);
    px(ctx, 27, 51 - wShift, WATER_FOAM);

    // Green lily pads floating on surface
    for (const [lx, ly] of [
      [26, 48],
      [34, 45],
      [36, 51],
      [30, 52],
    ] as const) {
      disc(ctx, lx, ly, 2, LEAF_DARK);
      px(ctx, lx, ly, LEAF_MID);
    }
    // Blooming white and pink lily flowers
    px(ctx, 26, 47, BONE_LIGHT);
    px(ctx, 34, 44, OCHRE_RED);
    px(ctx, 36, 50, BONE_LIGHT);

    // Tall cattails / reeds on rear bank
    for (const rx of [23, 40]) {
      rect(ctx, rx, 37, 1, 6, LEAF_DARK);
      rect(ctx, rx, 36, 1, 3, WOOD_DARK); // cattail head
    }

    return canvas;
  });
}

/** 32. ARCH (Decoration, height 1.6): Monumental Mammoth Tusk Arch & Megalithic Gateway. */
function buildArch(): HTMLCanvasElement[] {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);
  isoDiamond(ctx, 32, 48, 28, DIRT_0, OUT);
  isoDiamond(ctx, 32, 48, 24, DIRT_1, DIRT_DARK);

  // Smooth flat stone ceremonial pathway passing through the arch
  for (let u = 4; u < 24; u += 3) {
    const sx = 32 + (u - 14);
    const sy = 48 + ((u + 14) >> 1) - 14;
    rect(ctx, sx - 2, sy - 1, 4, 3, BONE_MID);
    px(ctx, sx, sy, BONE_LIGHT);
  }

  // Left Standing Megalith Pillar (h=14)
  isoBox(ctx, 22, 50, 7, 7, 14, { top: BONE_MID, left: FUR_DARK, right: FUR_MID });
  leftWallRect(ctx, 22, 50, 1, 4, 4, 4, OUT);
  leftWallRect(ctx, 22, 50, 2, 5, 2, 2, OCHRE_RED); // carved sun petroglyph

  // Right Standing Megalith Pillar (h=14)
  isoBox(ctx, 42, 44, 7, 7, 14, { top: BONE_MID, left: FUR_DARK, right: FUR_MID });
  rightWallRect(ctx, 42, 44, 1, 4, 4, 4, OUT);
  rightWallRect(ctx, 42, 44, 2, 5, 2, 2, OCHRE_RED); // carved hunter petroglyph

  // Colossal interlocking mammoth tusks sweeping up to form arch apex overhead (at y=20)
  drawTusk(ctx, 22, 36, 32, 20, 6);
  drawTusk(ctx, 42, 30, 32, 20, 6);

  // Golden amber keystone talisman & carved animal skull at the arch summit
  rect(ctx, 30, 17, 4, 4, OUT);
  rect(ctx, 31, 18, 2, 2, FLAME_MID); // glowing amber medallion
  px(ctx, 31, 18, FLAME_CORE);

  // Mounted skull crowning the apex
  rect(ctx, 31, 14, 3, 3, BONE_LIGHT);
  px(ctx, 31, 15, OUT);
  px(ctx, 33, 15, OUT);

  return [canvas];
}

/** caveman art for the third-wave buildings. Used as-is (no colour filter); kinds left out use the shared art recoloured. */
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
