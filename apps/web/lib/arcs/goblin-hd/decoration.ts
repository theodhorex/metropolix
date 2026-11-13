// Goblin HD buildings: decoration (drawn by a worker, see .agy/tasks). Kinds left out fall back to the 1x goblin art.
import type { BuildingKind } from '@metropolix/sim';
import {
  G,
  canvasHD,
  groundShadow,
  box,
  brickWalls,
  plankWalls,
  roof,
  RUST,
  STONE,
  WOOD,
  IRON,
  disc,
  gear,
  stakes,
  rivets,
  type Ctx,
} from './kit';
import { isoBox, isoDiamond, leftWallRect, rightWallRect, px, rect } from '../../sprites';

/** Helper to draw a rich clumpy foliage cluster with goblin shading (sunlight from top-right). */
function leafClump(ctx: Ctx, cx: number, cy: number, r: number) {
  disc(ctx, cx, cy, r + 1, G.out);
  disc(ctx, cx, cy, r, G.leaf);
  // shade on lower-left
  disc(ctx, cx - 1, cy + 2, Math.max(1, r - 2), G.leafDark);
  // sunlight on top-right
  disc(ctx, cx + 1, cy - 2, Math.max(1, r - 2), G.leafLight);
  // sunny rim highlight
  disc(ctx, cx + 2, cy - 3, Math.max(1, r - 4), G.grassTip);
}

/** Helper to draw a small goblin skull. */
function tinySkull(ctx: Ctx, cx: number, cy: number) {
  rect(ctx, cx - 3, cy - 3, 6, 5, G.out);
  rect(ctx, cx - 2, cy - 2, 4, 4, G.bone);
  px(ctx, cx - 1, cy - 1, G.out); // left eye
  px(ctx, cx + 1, cy - 1, G.out); // right eye
  px(ctx, cx - 1, cy + 1, G.boneShade); // teeth
  px(ctx, cx + 1, cy + 1, G.boneShade);
}

// ============================================================================
// 1. TREE: One big leafy goblin oak with sprawling canopy, gnarled roots,
//    a hanging bone talisman, and scrap at the base.
// ============================================================================
function drawTree(): HTMLCanvasElement {
  const [cv, ctx] = canvasHD();
  const tx = 64, ty = 104;

  // Ground shadow falling to the left
  groundShadow(ctx, tx, ty, 18, 16, 10);

  // Spread roots
  // Left root
  rect(ctx, tx - 11, ty - 1, 6, 4, G.out);
  rect(ctx, tx - 10, ty, 5, 2, G.woodDark);
  // Right root
  rect(ctx, tx + 5, ty, 7, 4, G.out);
  rect(ctx, tx + 6, ty + 1, 5, 2, G.woodR);
  px(ctx, tx + 7, ty + 1, G.woodLight);
  // Front tap root
  rect(ctx, tx - 2, ty + 1, 5, 4, G.out);
  rect(ctx, tx - 1, ty + 2, 3, 2, G.woodL);

  // Gnarled goblin trunk (thick, twisting wood)
  for (let y = ty - 2; y >= ty - 28; y--) {
    const t = (ty - 2 - y) / 26;
    // Slight organic twist
    const xOff = Math.round(Math.sin(t * Math.PI * 1.5) * 2.5);
    const w = Math.round(11 - t * 3); // 11px wide at base tapering to 8px
    const leftX = tx - (w >> 1) + xOff;
    rect(ctx, leftX - 1, y, w + 2, 1, G.out);
    rect(ctx, leftX, y, 2, 1, G.woodDark);
    rect(ctx, leftX + 2, y, Math.max(1, (w >> 1) - 1), 1, G.woodL);
    rect(ctx, leftX + 1 + (w >> 1), y, Math.max(1, (w >> 1) - 1), 1, G.woodR);
    px(ctx, leftX + w - 1, y, G.woodLight);
  }

  // Large twisting boughs branching left and right
  // Left bough
  rect(ctx, tx - 14, ty - 34, 10, 8, G.out);
  rect(ctx, tx - 13, ty - 33, 8, 6, G.woodDark);
  rect(ctx, tx - 11, ty - 32, 6, 4, G.woodL);
  // Right bough
  rect(ctx, tx + 4, ty - 32, 11, 7, G.out);
  rect(ctx, tx + 5, ty - 31, 9, 5, G.woodR);
  px(ctx, tx + 8, ty - 30, G.woodLight);

  // Big lush canopy built from layered foliage clumps
  // Back & lower foliage clumps
  leafClump(ctx, tx - 18, ty - 42, 15);
  leafClump(ctx, tx + 18, ty - 40, 15);
  leafClump(ctx, tx - 8, ty - 56, 17);
  leafClump(ctx, tx + 12, ty - 54, 16);

  // Deep mid clumps
  leafClump(ctx, tx - 22, ty - 50, 13);
  leafClump(ctx, tx + 22, ty - 48, 14);
  leafClump(ctx, tx, ty - 46, 18);

  // Crown clumps (sunny top)
  leafClump(ctx, tx - 6, ty - 68, 14);
  leafClump(ctx, tx + 10, ty - 66, 15);
  leafClump(ctx, tx + 2, ty - 74, 12);

  // Details: hanging bone talisman on right branch
  rect(ctx, tx + 15, ty - 30, 1, 8, G.ironDark); // cord
  // Tiny skull
  rect(ctx, tx + 13, ty - 22, 5, 4, G.out);
  rect(ctx, tx + 14, ty - 21, 3, 3, G.bone);
  px(ctx, tx + 14, ty - 20, G.out); // eye
  px(ctx, tx + 16, ty - 20, G.out); // eye
  px(ctx, tx + 15, ty - 18, G.boneShade); // teeth

  // Scrap / mushroom details around base
  // Toadstool cluster on left
  rect(ctx, tx - 15, ty - 4, 5, 3, G.out);
  rect(ctx, tx - 14, ty - 3, 3, 2, G.rustLight);
  px(ctx, tx - 13, ty - 3, G.bone);
  rect(ctx, tx - 13, ty - 1, 1, 2, G.bone);
  // Little brass cog buried on the right
  gear(ctx, tx + 14, ty + 2, 4);

  return cv;
}

// ============================================================================
// 2. LAMP: Street lamp with a green-glass lantern, forged iron post,
//    brass cog ornament, and animated flickering toxic flame (3 frames).
// ============================================================================
function drawLamp(frame: number): HTMLCanvasElement {
  const [cv, ctx] = canvasHD();
  const lx = 64, ly = 108;

  // Ground shadow
  groundShadow(ctx, lx, ly, 10, 10, 6);

  // Stepped stone plinth base
  box(ctx, lx, ly, 8, 8, 5, STONE);
  brickWalls(ctx, lx, ly, 8, 8, 5, 2, 3);
  // Iron collar on base
  rect(ctx, lx - 4, ly - 7, 8, 2, G.ironTop);
  px(ctx, lx - 2, ly - 7, G.rivet);
  px(ctx, lx + 2, ly - 7, G.rivet);

  // Wrought iron lamp post
  const topY = 46;
  const postH = ly - 7 - topY;
  rect(ctx, lx - 2, topY, 4, postH, G.out);
  rect(ctx, lx - 1, topY, 1, postH, G.ironDark);
  rect(ctx, lx, topY, 1, postH, G.ironR);
  rect(ctx, lx + 1, topY, 1, postH, G.ironTop);

  // Brass and iron decorative rings on post
  rect(ctx, lx - 3, 84, 6, 2, G.brass);
  px(ctx, lx - 2, 84, G.brassLight);
  rect(ctx, lx - 3, 66, 6, 2, G.ironDark);
  px(ctx, lx + 1, 66, G.rivet);

  // Decorative scrap gear mounted on post
  gear(ctx, lx - 6, 56, 4, frame);

  // Overhanging curved forged iron bracket
  rect(ctx, lx, topY, 13, 3, G.out);
  rect(ctx, lx + 1, topY + 1, 11, 1, G.ironR);
  // Diagonal support strut
  rect(ctx, lx + 2, topY + 4, 3, 2, G.out);
  rect(ctx, lx + 5, topY + 2, 4, 2, G.out);
  px(ctx, lx + 4, topY + 3, G.ironTop);

  // Lantern hanging on the right (centered at x = lx + 11 = 75)
  const lX = lx + 11;
  const lY = topY + 6; // hook start

  // Iron suspension link
  rect(ctx, lX, lY, 1, 3, G.ironDark);

  // Lantern peaked roof hood
  rect(ctx, lX - 4, lY + 3, 9, 3, G.out);
  rect(ctx, lX - 3, lY + 4, 7, 2, G.rustLight);
  px(ctx, lX, lY + 2, G.brass); // top brass finial
  px(ctx, lX, lY + 1, G.bone);  // pointy tip

  // Lantern green-glass chamber (8x8)
  const glassY = lY + 6;
  rect(ctx, lX - 4, glassY, 9, 9, G.out);
  rect(ctx, lX - 3, glassY + 1, 7, 7, '#184220'); // dark green glass frame

  // Animated flickering toxic flame inside lantern
  if (frame === 0) {
    rect(ctx, lX - 2, glassY + 2, 5, 5, G.toxic);
    rect(ctx, lX - 1, glassY + 3, 3, 3, G.toxicLight);
    px(ctx, lX, glassY + 3, '#ffffff');
  } else if (frame === 1) {
    rect(ctx, lX - 2, glassY + 3, 5, 4, G.toxic);
    rect(ctx, lX - 1, glassY + 2, 3, 4, G.toxicLight);
    px(ctx, lX - 1, glassY + 4, '#f5ffb0');
    px(ctx, lX + 2, glassY, G.toxicLight); // little flare
  } else {
    rect(ctx, lX - 2, glassY + 1, 5, 6, G.toxic);
    rect(ctx, lX, glassY + 2, 2, 4, G.toxicLight);
    px(ctx, lX, glassY + 4, '#ffffff');
    px(ctx, lX - 3, glassY, G.toxicLight); // flare
  }

  // Vertical iron cage mullions
  rect(ctx, lX, glassY + 1, 1, 7, G.ironDark);

  // Lantern base tray
  rect(ctx, lX - 4, glassY + 9, 9, 2, G.out);
  rect(ctx, lX - 3, glassY + 9, 7, 1, G.ironR);
  px(ctx, lX, glassY + 11, G.ironDark); // downward spike

  // Ground details: paving cobblestones and leaning rusty crowbar
  rect(ctx, lx - 7, ly - 2, 4, 2, G.cobble);
  rect(ctx, lx + 5, ly + 1, 4, 2, G.cobbleLight);
  rect(ctx, lx - 6, ly - 10, 2, 9, G.out);
  rect(ctx, lx - 5, ly - 9, 1, 8, G.rustR);

  return cv;
}

// ============================================================================
// 3. FOUNTAIN: Tiered stone & iron basin with carved gargoyle column,
//    brass water pipe, and animated splashing jets & water ripples (3 frames).
// ============================================================================
function drawFountain(frame: number): HTMLCanvasElement {
  const [cv, ctx] = canvasHD();
  const fx = 64, fy = 110, wL = 22, wR = 22, h = 9;

  // Ground shadow
  groundShadow(ctx, fx, fy, wL, wR, 8);

  // Surrounding cobblestone ring on ground
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    const sx = Math.round(fx + Math.cos(a) * 26);
    const sy = Math.round(fy - 11 + Math.sin(a) * 13);
    rect(ctx, sx - 1, sy, 3, 2, i % 2 === 0 ? G.cobble : G.cobbleDark);
  }

  // Outer stone basin
  box(ctx, fx, fy, wL, wR, h, STONE);
  brickWalls(ctx, fx, fy, wL, wR, h, 3, 5);
  rivets(ctx, fx, fy, wR, h, 4);

  // Basin top center is at (fx, fy - h - (wL+wR)/4) = (64, 90)
  const cx = 64, cy = 90;

  // Inner water surface: deep teal pool
  isoDiamond(ctx, cx, cy, 18, '#1b4d5e');
  isoDiamond(ctx, cx, cy, 14, '#24657a');
  isoDiamond(ctx, cx, cy, 10, '#36829c');

  // Central gargoyle pillar
  const pL = 7, pR = 7, pH = 14;
  isoBox(ctx, cx, cy + 4, pL, pR, pH, { top: G.ironTop, left: G.stoneL, right: G.stoneR, outline: G.out });
  // Carved gargoyle mouth / brass nozzle at summit
  const nozzleY = cy + 4 - pH - 3;
  rect(ctx, cx - 4, nozzleY, 8, 3, G.out);
  rect(ctx, cx - 3, nozzleY + 1, 6, 2, G.brass);
  px(ctx, cx, nozzleY, G.brassLight);

  // Animated water spurts and cascading ripples
  const jetH = frame === 0 ? 9 : frame === 1 ? 11 : 8;
  const jetTop = nozzleY - jetH;

  // Vertical water spout
  rect(ctx, cx - 1, jetTop, 3, jetH + 1, G.out);
  rect(ctx, cx, jetTop + 1, 1, jetH, '#78e0ee');
  px(ctx, cx, jetTop, '#ffffff');

  if (frame === 0) {
    // Droplets splashing outwards left and right
    px(ctx, cx - 4, nozzleY - 4, '#a2f0fa');
    px(ctx, cx - 8, nozzleY, '#78e0ee');
    px(ctx, cx - 12, cy - 2, '#ffffff');

    px(ctx, cx + 4, nozzleY - 3, '#a2f0fa');
    px(ctx, cx + 8, nozzleY + 1, '#78e0ee');
    px(ctx, cx + 13, cy - 1, '#ffffff');

    // Concentric pool ripples
    isoDiamond(ctx, cx, cy, 8, '#78e0ee');
    isoDiamond(ctx, cx, cy, 5, '#36829c');
  } else if (frame === 1) {
    px(ctx, cx - 3, nozzleY - 6, '#ffffff');
    px(ctx, cx - 7, nozzleY - 2, '#a2f0fa');
    px(ctx, cx - 11, cy - 4, '#78e0ee');
    px(ctx, cx - 14, cy, '#ffffff');

    px(ctx, cx + 5, nozzleY - 5, '#ffffff');
    px(ctx, cx + 9, nozzleY - 1, '#a2f0fa');
    px(ctx, cx + 12, cy - 3, '#78e0ee');

    isoDiamond(ctx, cx, cy, 11, '#78e0ee');
    isoDiamond(ctx, cx, cy, 7, '#36829c');
  } else {
    px(ctx, cx - 5, nozzleY - 5, '#78e0ee');
    px(ctx, cx - 9, nozzleY - 1, '#ffffff');
    px(ctx, cx - 13, cy + 1, '#a2f0fa');

    px(ctx, cx + 3, nozzleY - 4, '#78e0ee');
    px(ctx, cx + 7, nozzleY - 2, '#ffffff');
    px(ctx, cx + 11, cy + 1, '#a2f0fa');

    isoDiamond(ctx, cx, cy, 13, '#78e0ee');
    isoDiamond(ctx, cx, cy, 9, '#36829c');
  }

  // Basin rim details: brass pipe valve on left, moss patch on right
  rect(ctx, fx - wL + 2, fy - 6, 3, 4, G.brass);
  px(ctx, fx - wL + 3, fy - 7, G.brassLight);
  px(ctx, fx + 10, fy - 1, G.mossLight);
  px(ctx, fx + 11, fy - 2, G.mossR);

  return cv;
}

// ============================================================================
// 4. STATUE: Monumental Goblin King effigy in cast bronze & iron atop a
//    stepped plinth, horned crown, hoisted war cleaver, and trophy skulls.
// ============================================================================
function drawStatue(): HTMLCanvasElement {
  const [cv, ctx] = canvasHD();
  const fx = 64, fy = 114;

  // Ground shadow
  groundShadow(ctx, fx, fy, 18, 18, 9);

  // Stepped lower stone plinth (fx, fy, 18, 18, 7)
  box(ctx, fx, fy, 18, 18, 7, STONE);
  brickWalls(ctx, fx, fy, 18, 18, 7, 3, 4);

  // Upper iron pedestal (fx, fy - 7, 13, 13, 8)
  const uy = fy - 7;
  box(ctx, fx, uy, 13, 13, 8, IRON);
  rivets(ctx, fx, uy, 13, 8, 3);

  // Brass engraved dedication plaque on lit wall
  rightWallRect(ctx, fx, uy, 2, 2, 7, 4, G.brass);
  rightWallRect(ctx, fx, uy, 3, 3, 5, 2, G.brassLight);

  // Pedestal top center is at (fx, uy - 8 - 13/2) = (64, 92)
  const sx = 64, sy = 92;

  // Trophies at plinth base: skulls and scrap
  tinySkull(ctx, fx - 12, fy - 2);
  tinySkull(ctx, fx + 12, fy + 1);

  // --- Goblin King Statue Figure ---
  // Stout armored legs / greaves (y = 80..89)
  // Left leg
  rect(ctx, sx - 6, sy - 11, 4, 9, G.out);
  rect(ctx, sx - 5, sy - 10, 2, 7, G.ironL);
  // Right leg
  rect(ctx, sx + 2, sy - 11, 4, 9, G.out);
  rect(ctx, sx + 3, sy - 10, 2, 7, G.brassDark);
  px(ctx, sx + 4, sy - 9, G.brassLight);

  // Royal Mantle / Cape behind body (y = 52..83)
  rect(ctx, sx - 10, sy - 38, 20, 30, G.out);
  rect(ctx, sx - 9, sy - 37, 8, 28, G.bannerDark);
  rect(ctx, sx + 1, sy - 37, 8, 28, G.banner);

  // Torso / Stout pot-belly cuirass (y = 62..79)
  rect(ctx, sx - 7, sy - 28, 14, 16, G.out);
  rect(ctx, sx - 6, sy - 27, 4, 14, G.ironL);
  rect(ctx, sx - 2, sy - 27, 8, 14, G.ironR);
  // Spiked war belt
  rect(ctx, sx - 7, sy - 16, 14, 3, G.woodDark);
  px(ctx, sx - 4, sy - 15, G.brassLight);
  px(ctx, sx, sy - 15, G.brass);
  px(ctx, sx + 4, sy - 15, G.brassLight);
  // Chest skull emblem
  rect(ctx, sx - 2, sy - 24, 4, 3, G.brass);
  px(ctx, sx - 2, sy - 23, G.brassLight);

  // Left arm holding gold loot sack (x = sx - 12)
  rect(ctx, sx - 13, sy - 24, 6, 12, G.out);
  rect(ctx, sx - 12, sy - 23, 4, 10, G.woodR);
  // Sack bulging with loot
  rect(ctx, sx - 15, sy - 15, 7, 7, G.out);
  rect(ctx, sx - 14, sy - 14, 5, 5, G.woodLight);
  px(ctx, sx - 13, sy - 15, G.glowHot); // gold coin peeking out

  // Right arm hoisting oversized notched war cleaver (x = sx + 8)
  rect(ctx, sx + 7, sy - 28, 5, 12, G.out);
  rect(ctx, sx + 8, sy - 27, 3, 10, G.brassDark);
  // Cleaver haft
  rect(ctx, sx + 12, sy - 36, 2, 28, G.out);
  rect(ctx, sx + 12, sy - 35, 1, 26, G.woodDark);
  // Massive notched iron cleaver blade
  rect(ctx, sx + 13, sy - 36, 6, 14, G.out);
  rect(ctx, sx + 14, sy - 35, 4, 12, G.ironTop);
  rect(ctx, sx + 16, sy - 35, 1, 12, G.ironR);
  // Notch in blade
  rect(ctx, sx + 18, sy - 30, 2, 2, G.out);

  // Goblin King Head (y = 44..59)
  // Wide horizontal pointy ears
  // Left ear
  rect(ctx, sx - 16, sy - 40, 8, 4, G.out);
  rect(ctx, sx - 15, sy - 39, 6, 2, G.brassDark);
  // Right ear
  rect(ctx, sx + 8, sy - 40, 8, 4, G.out);
  rect(ctx, sx + 9, sy - 39, 6, 2, G.brass);
  px(ctx, sx + 14, sy - 37, G.brassLight); // brass hoop earring

  // Head block
  rect(ctx, sx - 6, sy - 42, 12, 12, G.out);
  rect(ctx, sx - 5, sy - 41, 4, 10, G.brassDark);
  rect(ctx, sx - 1, sy - 41, 6, 10, G.brass);

  // Glowing eyes & fanged grin
  px(ctx, sx - 2, sy - 38, '#e63946'); // ruby red menacing eyes
  px(ctx, sx + 2, sy - 38, '#e63946');
  // Tusks
  px(ctx, sx - 3, sy - 34, G.bone);
  px(ctx, sx + 3, sy - 34, G.bone);
  rect(ctx, sx - 2, sy - 33, 4, 1, G.boneShade);

  // Spiked Goblin King Crown (y = 34..43)
  rect(ctx, sx - 7, sy - 46, 14, 5, G.out);
  rect(ctx, sx - 6, sy - 45, 12, 3, G.brassLight);
  // Crown spikes
  px(ctx, sx - 5, sy - 48, G.brassLight);
  px(ctx, sx - 2, sy - 50, G.brassLight);
  px(ctx, sx, sy - 51, '#e63946'); // central crown jewel
  px(ctx, sx + 2, sy - 50, G.brassLight);
  px(ctx, sx + 5, sy - 48, G.brassLight);

  return cv;
}

// ============================================================================
// 5. FLOWERBED: Raised rustic timber planter packed with rich dark soil,
//    vibrant bog-orchids, nightshades, glowing puffballs, and garden skull sign.
// ============================================================================
function drawFlowerbed(): HTMLCanvasElement {
  const [cv, ctx] = canvasHD();
  const fx = 64, fy = 108, wL = 20, wR = 20, h = 5;

  // Ground shadow
  groundShadow(ctx, fx, fy, wL, wR, 6);

  // Raised timber planter box
  box(ctx, fx, fy, wL, wR, h, WOOD);
  plankWalls(ctx, fx, fy, wL, wR, h, 4);

  // Corner reinforcing iron brackets
  leftWallRect(ctx, fx, fy, 0, 0, 2, h, G.ironDark);
  leftWallRect(ctx, fx, fy, wL - 2, 0, 2, h, G.ironDark);
  rightWallRect(ctx, fx, fy, 0, 0, 2, h, G.ironR);
  rightWallRect(ctx, fx, fy, wR - 2, 0, 2, h, G.ironR);

  // Soil diamond center: (64, fy - h - 10) = (64, 93)
  const cx = 64, cy = 93;
  isoDiamond(ctx, cx, cy, 16, G.dirtDark);
  isoDiamond(ctx, cx, cy, 13, G.dirt);

  // --- Goblin Floral Arrangement ---
  // Foliage base cushions
  leafClump(ctx, cx - 8, cy - 2, 6);
  leafClump(ctx, cx + 8, cy - 2, 6);
  leafClump(ctx, cx, cy + 3, 5);
  leafClump(ctx, cx - 2, cy - 6, 5);

  // 1. Magenta Bog-Orchids (top-left)
  rect(ctx, cx - 11, cy - 4, 3, 3, '#e02870');
  px(ctx, cx - 10, cy - 3, '#ffa8cf');
  rect(ctx, cx - 7, cy - 6, 3, 3, '#e02870');
  px(ctx, cx - 6, cy - 5, '#fff088');

  // 2. Sunny Golden Buttercups (center-front)
  rect(ctx, cx - 2, cy + 2, 3, 3, '#f59e0b');
  px(ctx, cx - 1, cy + 3, '#fef08a');
  rect(ctx, cx + 3, cy + 1, 3, 3, '#f59e0b');
  px(ctx, cx + 4, cy + 2, '#fff5b0');

  // 3. Royal Purple Nightshades (right)
  rect(ctx, cx + 7, cy - 4, 3, 3, '#8b5cf6');
  px(ctx, cx + 8, cy - 3, '#ddd6fe');
  rect(ctx, cx + 11, cy - 2, 3, 3, '#7c3aed');
  px(ctx, cx + 12, cy - 1, '#c084fc');

  // 4. Glowing Lime Toxic Puffballs (back & scattered)
  disc(ctx, cx - 1, cy - 8, 3, G.out);
  disc(ctx, cx - 1, cy - 8, 2, G.toxic);
  px(ctx, cx - 1, cy - 9, G.toxicLight);

  disc(ctx, cx + 5, cy - 7, 2, G.toxic);
  px(ctx, cx + 5, cy - 7, G.toxicLight);

  // 5. Orange-rust toadstools with white specks
  disc(ctx, cx - 6, cy + 3, 3, G.out);
  disc(ctx, cx - 6, cy + 3, 2, G.rustLight);
  px(ctx, cx - 6, cy + 2, G.bone);

  // Details: Garden sign on stake & watering pot on rim
  // Signpost stuck in dirt
  rect(ctx, cx - 12, cy - 12, 1, 6, G.woodDark);
  rect(ctx, cx - 15, cy - 16, 7, 5, G.out);
  rect(ctx, cx - 14, cy - 15, 5, 3, G.woodLight);
  px(ctx, cx - 13, cy - 14, G.out); // mini skull dot
  px(ctx, cx - 11, cy - 14, G.out);

  // Little tin pot on the right rim
  rect(ctx, fx + 12, fy - 6, 4, 4, G.out);
  rect(ctx, fx + 13, fy - 5, 2, 3, G.ironR);
  px(ctx, fx + 14, fy - 6, G.brassLight);

  return cv;
}

// ============================================================================
// 6. HEDGE: Dense manicured yet brambly thorn barrier with defensive stakes,
//    glowing berries, low cobblestone base, and scrap brass bell.
// ============================================================================
function drawHedge(): HTMLCanvasElement {
  const [cv, ctx] = canvasHD();
  const fx = 64, fy = 110, wL = 24, wR = 14, h = 15;

  // Ground shadow
  groundShadow(ctx, fx, fy, wL, wR, 8);

  // Rough cobblestone kerb along ground
  for (let u = 2; u < wL; u += 5) {
    leftWallRect(ctx, fx, fy, u, 0, 4, 2, u % 2 === 0 ? G.cobble : G.cobbleDark);
  }
  for (let v = 2; v < wR; v += 5) {
    rightWallRect(ctx, fx, fy, v, 0, 4, 2, v % 2 === 0 ? G.cobbleLight : G.cobble);
  }

  // Hedge main foliage body
  isoBox(ctx, fx, fy - 2, wL, wR, h, { top: G.leafLight, left: G.leafDark, right: G.leaf, outline: G.out });

  // Rich foliage texturing on top and walls
  // Top face: sunny ridges and dappling
  for (let u = 2; u < wL - 1; u += 3) {
    for (let v = 2; v < wR - 1; v += 3) {
      const topY = fy - 2 - h - ((u + v + 1) >> 1);
      const topX = fx - 1 - u + v;
      if ((u + v) % 4 === 0) px(ctx, topX, topY, G.grassTip);
      else if ((u + v) % 4 === 2) px(ctx, topX, topY, G.leaf);
    }
  }

  // Right wall (lit face): leaf shading and specks
  for (let v = 2; v < wR - 1; v += 2) {
    for (let z = 2; z < h - 1; z += 3) {
      if ((v + z) % 3 === 0) rightWallRect(ctx, fx, fy - 2, v, z, 2, 2, G.leafLight);
      else if ((v + z) % 3 === 1) rightWallRect(ctx, fx, fy - 2, v, z, 1, 1, G.leafDark);
    }
  }

  // Left wall (shaded face): deep bramble shadow accents
  for (let u = 2; u < wL - 1; u += 3) {
    for (let z = 2; z < h - 1; z += 4) {
      leftWallRect(ctx, fx, fy - 2, u, z, 2, 2, '#204018');
    }
  }

  // Sharpened goblin defense stakes protruding along top
  stakes(ctx, fx - wL + 2, fx - 2, fy - 2 - h - 3, -0.45, 7);

  // Bone splinters & stakes on right
  rect(ctx, fx + 6, fy - h - 6, 1, 5, G.woodDark);
  px(ctx, fx + 6, fy - h - 7, G.bone);
  rect(ctx, fx + 11, fy - h - 4, 1, 5, G.woodDark);
  px(ctx, fx + 11, fy - h - 5, G.bone);

  // Glowing poisonous berries speckled in foliage
  // Golden glow berries
  px(ctx, fx - 14, fy - h + 1, G.glowHot);
  px(ctx, fx - 8, fy - h + 4, G.glow);
  px(ctx, fx + 4, fy - h + 2, G.glowHot);
  px(ctx, fx + 10, fy - h + 6, G.glow);

  // Toxic green berries
  px(ctx, fx - 18, fy - h + 6, G.toxicLight);
  px(ctx, fx - 4, fy - h + 8, G.toxic);
  px(ctx, fx + 7, fy - h + 9, G.toxicLight);

  // Scrap brass bell hanging on a stick at right corner
  rect(ctx, fx + wR - 1, fy - (wR >> 1) - h - 2, 1, 8, G.out);
  rect(ctx, fx + wR, fy - (wR >> 1) - h - 1, 1, 7, G.ironR);
  px(ctx, fx + wR + 1, fy - (wR >> 1) - h + 4, G.brassLight);

  return cv;
}

// ============================================================================
// 7. WELL: Circular stone well mouth, dark timber A-frame, iron winch spool,
//    weathered tin-patched pitched hood, suspended bucket, and toxic reflection.
// ============================================================================
function drawWell(): HTMLCanvasElement {
  const [cv, ctx] = canvasHD();
  const fx = 64, fy = 108, wL = 16, wR = 16, h = 9;

  // Ground shadow
  groundShadow(ctx, fx, fy, wL, wR, 8);

  // Cobblestone surround
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    const sx = Math.round(fx + Math.cos(a) * 20);
    const sy = Math.round(fy - 8 + Math.sin(a) * 10);
    rect(ctx, sx - 1, sy, 3, 2, i % 2 === 0 ? G.cobble : G.cobbleDark);
  }

  // Stone well basin
  box(ctx, fx, fy, wL, wR, h, STONE);
  brickWalls(ctx, fx, fy, wL, wR, h, 3, 4);
  rivets(ctx, fx, fy, wR, h, 4);

  // Top center is at (64, 108 - 9 - 8) = (64, 91)
  const cx = 64, cy = 91;

  // Well interior hole with deep murky toxic reflection
  isoDiamond(ctx, cx, cy, 11, G.out);
  isoDiamond(ctx, cx, cy, 9, '#12261a');
  isoDiamond(ctx, cx, cy, 6, '#1a4e28');
  px(ctx, cx - 1, cy - 1, G.toxic);
  px(ctx, cx, cy - 1, G.toxicLight);

  // Timber upright posts supporting hood
  // Left post
  rect(ctx, cx - 14, cy - 28, 3, 34, G.out);
  rect(ctx, cx - 13, cy - 27, 1, 32, G.woodDark);
  rect(ctx, cx - 12, cy - 27, 1, 32, G.woodL);
  // Right post
  rect(ctx, cx + 11, cy - 28, 3, 34, G.out);
  rect(ctx, cx + 12, cy - 27, 1, 32, G.woodR);
  px(ctx, cx + 13, cy - 26, G.woodLight);

  // Crossbeam spanning posts
  rect(ctx, cx - 16, cy - 26, 32, 4, G.out);
  rect(ctx, cx - 15, cy - 25, 30, 2, G.woodR);
  px(ctx, cx - 14, cy - 25, G.woodLight);

  // Winch spool with coiled rope
  rect(ctx, cx - 4, cy - 27, 8, 5, G.ironDark);
  rect(ctx, cx - 3, cy - 26, 6, 3, '#c29a60'); // coiled rope
  // Iron crank handle on right
  rect(ctx, cx + 14, cy - 26, 4, 2, G.ironR);
  rect(ctx, cx + 17, cy - 26, 2, 5, G.ironDark);

  // Suspended iron chain and wooden bucket
  rect(ctx, cx, cy - 22, 1, 10, G.ironTop);
  // Wooden bucket
  rect(ctx, cx - 3, cy - 12, 6, 6, G.out);
  rect(ctx, cx - 2, cy - 11, 4, 4, G.woodR);
  rect(ctx, cx - 2, cy - 9, 4, 1, G.ironL); // iron band

  // Pitched roof hood over well
  // Top ridge at cy - 36, wallH = 0, peakH = 10, wL = 16, wR = 16
  roof(ctx, cx, cy - 28, 16, 16, 0, 10, RUST, true);

  // Bone skull finial at front gable peak
  tinySkull(ctx, cx, cy - 38);

  // Ground bucket & water splash
  rect(ctx, fx + 14, fy - 2, 5, 5, G.out);
  rect(ctx, fx + 15, fy - 1, 3, 3, G.woodR);
  px(ctx, fx + 9, fy + 1, '#78e0ee'); // water splash
  px(ctx, fx + 10, fy + 2, '#48b8cc');

  return cv;
}

// ============================================================================
// 8. POND: Natural scenic mire pond with cobblestone rim, floating lily pads,
//    pink water lilies, cattails, sunken brass cog, and animated ripple rings (3 frames).
// ============================================================================
function drawPond(frame: number): HTMLCanvasElement {
  const [cv, ctx] = canvasHD();
  const px0 = 64, py0 = 96;

  // Ground shadow / wet muddy bank
  isoDiamond(ctx, px0, py0, 26, G.dirtDark);
  isoDiamond(ctx, px0, py0, 23, G.dirt);

  // Cobblestone border around pond bank
  for (let i = 0; i < 20; i++) {
    const a = (i / 20) * Math.PI * 2;
    const sx = Math.round(px0 + Math.cos(a) * 28);
    const sy = Math.round(py0 + Math.sin(a) * 14);
    rect(ctx, sx - 1, sy, 3, 2, i % 3 === 0 ? G.cobbleLight : i % 3 === 1 ? G.cobble : G.cobbleDark);
  }

  // Water depth layers
  isoDiamond(ctx, px0, py0, 20, '#1c4856'); // deep rim
  isoDiamond(ctx, px0, py0, 16, '#266070'); // mid water
  isoDiamond(ctx, px0, py0, 12, '#347e92'); // clear shallows
  isoDiamond(ctx, px0, py0, 8, '#449cb0');  // sunlit water

  // Shore cattails and reeds on back-left bank
  rect(ctx, px0 - 20, py0 - 12, 1, 9, '#2a5a1e');
  px(ctx, px0 - 20, py0 - 13, '#6e4424'); // cattail head
  rect(ctx, px0 - 16, py0 - 10, 1, 8, '#3a7228');
  px(ctx, px0 - 16, py0 - 11, '#6e4424');
  rect(ctx, px0 - 23, py0 - 7, 1, 7, '#3a7228');

  // Sunken brass cog in shallows
  gear(ctx, px0 + 13, py0 - 4, 3, frame);

  // Floating bog lily pads
  // Lily pad 1 (left) with pink blossom
  disc(ctx, px0 - 11, py0 - 2, 4, G.leaf);
  disc(ctx, px0 - 10, py0 - 3, 2, G.leafLight);
  px(ctx, px0 - 11, py0 - 2, '#1c4856'); // slit
  px(ctx, px0 - 10, py0 - 4, '#ff99c8'); // pink lily flower
  px(ctx, px0 - 10, py0 - 5, '#ffffff');

  // Lily pad 2 (right-front)
  disc(ctx, px0 + 10, py0 + 3, 3, G.leaf);
  px(ctx, px0 + 11, py0 + 2, G.leafLight);

  // Lily pad 3 (back)
  disc(ctx, px0 - 2, py0 - 7, 3, G.leafLight);
  px(ctx, px0 - 2, py0 - 7, G.grassTip);

  // Animated ripples and surface bubbles (3 frames)
  if (frame === 0) {
    // Small inner ripple ring
    isoDiamond(ctx, px0 - 1, py0 + 1, 5, '#78e0ee');
    // Popping bubble at (px0 + 5, py0 - 1)
    px(ctx, px0 + 5, py0 - 1, '#ffffff');
    px(ctx, px0 + 6, py0 - 1, G.toxicLight);
    // Sun sparkles
    px(ctx, px0 - 6, py0 + 3, '#d4faff');
  } else if (frame === 1) {
    // Expanding mid ripple ring
    isoDiamond(ctx, px0 - 1, py0 + 1, 9, '#78e0ee');
    isoDiamond(ctx, px0 - 1, py0 + 1, 6, '#347e92');
    // Popping bubble at (px0 - 7, py0 + 2)
    px(ctx, px0 - 7, py0 + 2, '#ffffff');
    px(ctx, px0 + 5, py0 - 2, '#78e0ee');
    // Sun sparkles
    px(ctx, px0 + 2, py0 - 4, '#ffffff');
  } else {
    // Widest ripple ring
    isoDiamond(ctx, px0 - 1, py0 + 1, 13, '#5cbccc');
    isoDiamond(ctx, px0 - 1, py0 + 1, 10, '#347e92');
    // New tiny center bubble
    px(ctx, px0, py0, '#ffffff');
    px(ctx, px0 - 1, py0, G.toxicLight);
    // Sun sparkles
    px(ctx, px0 + 6, py0 + 2, '#d4faff');
  }

  // Little skull on front-right bank
  tinySkull(ctx, px0 + 18, py0 + 8);

  return cv;
}

// ============================================================================
// 9. ARCH: Grand Goblin Gateway with reinforced stone & iron pylons,
//    heavy bolted lintel, horned war-skull apex, iron fangs, and fluttering banners.
// ============================================================================
function drawArch(): HTMLCanvasElement {
  const [cv, ctx] = canvasHD();

  // Cobblestone road passing through gateway
  for (let i = 0; i < 18; i++) {
    const rx = 64 + (i % 2 === 0 ? -6 : 6) + ((i * 3) % 7) - 3;
    const ry = 80 + i * 2;
    rect(ctx, rx - 3, ry, 6, 2, i % 3 === 0 ? G.cobbleLight : i % 3 === 1 ? G.cobble : G.cobbleDark);
  }

  // Two massive gate pillars
  // Left pillar (fx1 = 44, fy1 = 110, wL = 10, wR = 10, h = 38)
  const fx1 = 44, fy1 = 110, pW = 10, pH = 38;
  groundShadow(ctx, fx1, fy1, pW, pW, 8);
  // Base plinth: stone
  box(ctx, fx1, fy1, pW, pW, 8, STONE);
  brickWalls(ctx, fx1, fy1, pW, pW, 8, 3, 3);
  // Pillar shaft: iron & rivets
  box(ctx, fx1, fy1 - 8, pW, pW, pH - 8, IRON);
  rivets(ctx, fx1, fy1 - 8, pW, pH - 8, 4);
  // Rust band accents on left pillar
  leftWallRect(ctx, fx1, fy1 - 8, 1, 8, pW - 2, 2, G.rustL);
  leftWallRect(ctx, fx1, fy1 - 8, 1, 18, pW - 2, 2, G.rustL);

  // Right pillar (fx2 = 84, fy2 = 110, wL = 10, wR = 10, h = 38)
  const fx2 = 84, fy2 = 110;
  groundShadow(ctx, fx2, fy2, pW, pW, 8);
  // Base plinth: stone
  box(ctx, fx2, fy2, pW, pW, 8, STONE);
  brickWalls(ctx, fx2, fy2, pW, pW, 8, 3, 3);
  // Pillar shaft: iron & rivets
  box(ctx, fx2, fy2 - 8, pW, pW, pH - 8, IRON);
  rivets(ctx, fx2, fy2 - 8, pW, pH - 8, 4);
  // Rust band accents on right pillar
  rightWallRect(ctx, fx2, fy2 - 8, 1, 8, pW - 2, 2, G.rustR);
  rightWallRect(ctx, fx2, fy2 - 8, 1, 18, pW - 2, 2, G.rustR);

  // Lintel / Arch Beam spanning from x = 36 to 92 (y = 66..78)
  const beamTop = 66, beamH = 12;
  rect(ctx, 36, beamTop, 56, beamH, G.out);
  // Sunlit top flange
  rect(ctx, 37, beamTop + 1, 54, 2, G.ironTop);
  // Main iron web
  rect(ctx, 37, beamTop + 3, 54, 6, G.ironR);
  // Shaded bottom flange
  rect(ctx, 37, beamTop + 9, 54, 2, G.ironDark);
  // Timber inset fascia
  rect(ctx, 42, beamTop + 4, 44, 4, G.woodR);
  px(ctx, 43, beamTop + 5, G.woodLight);
  // Rivets across beam
  for (let rx = 40; rx <= 88; rx += 6) {
    px(ctx, rx, beamTop + 2, G.rivet);
    px(ctx, rx, beamTop + 8, G.rivet);
  }

  // Underside hanging iron fangs / portcullis teeth
  const teethX = [48, 56, 64, 72, 80];
  for (let i = 0; i < teethX.length; i++) {
    const tx = teethX[i]!;
    const tH = (i === 2) ? 8 : (i === 1 || i === 3) ? 7 : 5;
    rect(ctx, tx - 1, beamTop + beamH, 3, tH, G.out);
    rect(ctx, tx, beamTop + beamH, 1, tH - 1, G.ironTop);
    px(ctx, tx, beamTop + beamH + tH - 1, G.bone); // bone tip
  }

  // Hanging heavy iron chains
  rect(ctx, 52, beamTop + beamH, 1, 6, G.ironTop);
  rect(ctx, 76, beamTop + beamH, 1, 6, G.ironTop);

  // Stepped ornamental pediment crest above lintel (y = 48..66)
  rect(ctx, 50, beamTop - 8, 28, 9, G.out);
  rect(ctx, 51, beamTop - 7, 26, 7, G.rustR);
  rect(ctx, 56, beamTop - 15, 16, 8, G.out);
  rect(ctx, 57, beamTop - 14, 14, 6, G.ironTop);
  // Center decorative brass cog
  gear(ctx, 64, beamTop - 4, 4);

  // Massive Horned Beast War-Skull crowning the arch apex (y = 35..50)
  const kx = 64, ky = 42;
  // Sweeping horns
  // Left horn
  rect(ctx, kx - 14, ky - 8, 6, 3, G.out);
  rect(ctx, kx - 13, ky - 7, 5, 1, G.bone);
  rect(ctx, kx - 9, ky - 5, 5, 3, G.out);
  rect(ctx, kx - 8, ky - 4, 4, 1, G.bone);
  // Right horn
  rect(ctx, kx + 8, ky - 8, 6, 3, G.out);
  rect(ctx, kx + 8, ky - 7, 5, 1, G.bone);
  rect(ctx, kx + 4, ky - 5, 5, 3, G.out);
  rect(ctx, kx + 4, ky - 4, 4, 1, G.bone);

  // Central skull block
  rect(ctx, kx - 5, ky - 6, 10, 11, G.out);
  rect(ctx, kx - 4, ky - 5, 8, 9, G.bone);
  // Glowing green beast eye sockets
  px(ctx, kx - 2, ky - 3, G.toxic);
  px(ctx, kx + 2, ky - 3, G.toxic);
  px(ctx, kx - 2, ky - 2, G.toxicLight);
  px(ctx, kx + 2, ky - 2, G.toxicLight);
  // Beast nasal cavity & jagged fangs
  px(ctx, kx, ky, G.out);
  rect(ctx, kx - 3, ky + 2, 6, 1, G.boneShade);
  px(ctx, kx - 2, ky + 3, G.bone);
  px(ctx, kx + 2, ky + 3, G.bone);

  // Flanking green goblin war banners on outer pillars
  // Left banner
  rect(ctx, 31, 74, 3, 22, G.out);
  rect(ctx, 32, 75, 1, 20, G.bannerDark);
  rect(ctx, 33, 75, 1, 20, G.banner);
  px(ctx, 32, 80, G.bone); // skull patch dot
  // Right banner
  rect(ctx, 94, 74, 3, 22, G.out);
  rect(ctx, 94, 75, 1, 20, G.banner);
  rect(ctx, 95, 75, 1, 20, G.bannerLight);
  px(ctx, 95, 80, G.bone);

  // Hanging green street lanterns flanking the archway
  // Left lantern (x = 39, y = 86)
  rect(ctx, 38, 83, 1, 3, G.ironDark);
  rect(ctx, 37, 86, 3, 4, G.out);
  rect(ctx, 38, 87, 1, 2, G.toxic);
  px(ctx, 38, 87, G.toxicLight);
  // Right lantern (x = 89, y = 86)
  rect(ctx, 89, 83, 1, 3, G.ironDark);
  rect(ctx, 88, 86, 3, 4, G.out);
  rect(ctx, 89, 87, 1, 2, G.toxic);
  px(ctx, 89, 87, G.toxicLight);

  return cv;
}

export const art: Partial<Record<BuildingKind, () => HTMLCanvasElement[]>> = {
  tree: () => [drawTree()],
  lamp: () => [0, 1, 2].map(drawLamp),
  fountain: () => [0, 1, 2].map(drawFountain),
  statue: () => [drawStatue()],
  flowerbed: () => [drawFlowerbed()],
  hedge: () => [drawHedge()],
  well: () => [drawWell()],
  pond: () => [0, 1, 2].map(drawPond),
  arch: () => [drawArch()],
};
