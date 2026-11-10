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
  TILE_H,
  tileHash,
  type ArcArt,
} from '../sprites';

// Goblin palette: murky green, rust orange, dull iron grey, dirty brown, toxic yellow-green glow.
// Source: apps/web/lib/sprites.ts helper conventions & 64x64 isometric layout (ground diamond y=32..63, top vertex (32,32))
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

// Pre-allocated static coordinate tables (avoids per-call allocations)
const TOWER_SPIKES: readonly (readonly [number, number, number])[] = [
  [24, 24, 4],
  [28, 22, 5],
  [33, 21, 4],
  [39, 23, 5],
  [43, 25, 4],
  [34, 29, 5],
];

const FARM_SHROOMS: readonly (readonly [number, number, boolean])[] = [
  [20, 50, true],
  [25, 53, false],
  [30, 51, true],
  [35, 55, false],
  [28, 57, true],
  [39, 53, true],
  [23, 45, false],
];

const FACTORY_PUFFS: readonly (readonly (readonly [number, number, number])[])[] = [
  [[18, 10, 3], [20, 5, 2], [39, 17, 2]],
  [[17, 8, 3], [21, 3, 2], [40, 15, 3]],
  [[19, 11, 2], [18, 6, 3], [38, 16, 2]],
];

const LUMBER_STUMPS: readonly (readonly [number, number])[] = [
  [20, 51],
  [42, 47],
  [37, 55],
];

const MINE_VEINS: readonly (readonly [number, number, boolean])[] = [
  [21, 31, true],
  [25, 28, false],
  [31, 26, true],
  [36, 30, false],
  [42, 34, true],
  [29, 33, true],
];

const MINE_TUNNELS: readonly (readonly [number, number])[] = [
  [21, 36],
  [34, 37],
];

const GROUND_PATCHES: readonly (readonly [number, number])[] = [
  [11, 14],
  [21, 11],
  [15, 22],
];

const GROUND_SCRAPS: readonly (readonly [number, number, string, string])[] = [
  [10, 13, RUST_MID, IRON_TOP],
  [20, 10, IRON_MID, RUST_LIGHT],
  [16, 21, RUST_DARK, IRON_LIGHT],
];

const GROUND_BONES: readonly (readonly [number, number])[] = [
  [12, 17],
  [22, 13],
  [10, 9],
];

const GROUND_PUDDLES: readonly (readonly [number, number])[] = [
  [13, 19],
  [21, 12],
];

const CITIZEN_SKINS: readonly (readonly [string, string])[] = [
  ['#4b7828', '#689f38'],
  ['#558b2f', '#7cb342'],
  ['#38611d', '#52802d'],
  ['#689f38', '#8bc34a'],
];

const CITIZEN_OUTFITS: readonly (readonly [string, string, string])[] = [
  [RUST_DARK, RUST_MID, RUST_TOP],   // variant 0: rusted scrap-plate vest
  [IRON_DARK, IRON_MID, IRON_TOP],   // variant 1: scavenged iron mail
  [WOOD_DARK, WOOD_MID, BONE_MID],   // variant 2: patched leather & bone harness
  [BOG_DARK, MUD_MID, TOXIC_YELLOW], // variant 3: mire-alchemist rags
];

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

/**
 * GOBLIN HOUSE: Crooked ramshackle scavenger shack made of mismatched planks & rusty corrugated sheets,
 * with a lower side lean-to, patchwork roof, tilted stovepipe chimney, skull trophy, and green torch.
 */
function buildGoblinHouse(frame: number): HTMLCanvasElement {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  isoDiamond(ctx, 32, 48, 26, MUD_DARK, OUT);
  isoDiamond(ctx, 32, 48, 22, MUD_MID, BOG_DARK);
  isoDiamond(ctx, 24, 51, 6, BOG_MID);
  rect(ctx, 35, 53, 5, 2, WOOD_MID);
  rect(ctx, 38, 55, 5, 2, WOOD_LIGHT);

  // Back-left rusty corrugated metal lean-to annex (asymmetric silhouette)
  isoBox(ctx, 23, 51, 8, 10, 8, { top: RUST_TOP, left: RUST_DARK, right: RUST_MID });
  for (let v = 1; v < 9; v += 2) {
    rightWallRect(ctx, 23, 51, v, 8, 1, 2, IRON_MID);
  }

  // Main crooked plank shack body (offset forward-right)
  const fx = 33, fy = 56, wL = 14, wR = 16, wallH = 12;
  isoBox(ctx, fx, fy, wL, wR, wallH, { top: WOOD_TOP, left: WOOD_DARK, right: WOOD_MID });

  // Mismatched plank seams & bolted rust-metal patches on walls
  for (const z of [4, 8]) {
    leftWallRect(ctx, fx, fy, 1, z, wL - 2, 1, OUT);
    rightWallRect(ctx, fx, fy, 1, z, wR - 2, 1, OUT);
  }
  leftWallRect(ctx, fx, fy, 2, 3, 5, 6, OUT);
  leftWallRect(ctx, fx, fy, 3, 4, 3, 4, RUST_MID);
  px(ctx, fx - 4, fy - 7, IRON_TOP);
  rightWallRect(ctx, fx, fy, 10, 7, 5, 4, OUT);
  rightWallRect(ctx, fx, fy, 11, 8, 3, 2, IRON_MID);

  // Crooked plank door on right wall + glowing barred window on left wall
  rightWallRect(ctx, fx, fy, 3, 1, 5, 8, OUT);
  rightWallRect(ctx, fx, fy, 4, 1, 3, 7, RUST_DARK);
  rightWallRect(ctx, fx, fy, 4, 4, 3, 1, WOOD_LIGHT);
  leftWallRect(ctx, fx, fy, 8, 5, 5, 5, OUT);
  leftWallRect(ctx, fx, fy, 9, 6, 3, 3, frame % 2 === 0 ? TOXIC_BRIGHT : TOXIC_YELLOW);
  leftWallRect(ctx, fx, fy, 10, 6, 1, 3, WOOD_DARK);

  // Asymmetric lopsided patchwork roof with mid-ridge sag
  const topFy = fy - wallH;
  const halfL = wL >> 1;
  for (let v = -1; v <= wR; v++) {
    for (let u = -1; u <= wL; u++) {
      const dist = u < halfL ? halfL - u : u - halfL;
      const rise = Math.max(0, 7 - Math.floor((dist * 7) / (halfL + 1)));
      const sag = v > 4 && v < 11 ? 1 : 0;
      const x = fx - 1 - u + v;
      const y = topFy - ((u + v + 1) >> 1) - rise + sag;
      const isEdge = u === -1 || u === wL || v === -1 || v === wR;
      let col = u >= halfL ? WOOD_DARK : WOOD_LIGHT;
      if (u < halfL && v >= 3 && v <= 8) col = RUST_LIGHT;
      else if (u >= halfL && v >= 7 && v <= 13) col = IRON_MID;
      else if (u === halfL) col = RUST_DARK;
      if (isEdge) col = OUT;
      rect(ctx, x, y, 1, 2, col);
    }
  }

  // Visibly tilted stovepipe chimney jutting at an angle from the roof
  const chX = 33, chY = 31;
  for (let i = 0; i < 8; i++) {
    const shift = i >> 1;
    rect(ctx, chX + shift - 1, chY - i, 4, 1, OUT);
    rect(ctx, chX + shift, chY - i, 2, 1, i % 3 === 0 ? RUST_MID : IRON_MID);
  }
  const puffShift = frame % 2;
  disc(ctx, chX + 4 + puffShift, chY - 10 - puffShift, 2, IRON_LIGHT);
  px(ctx, chX + 4 + puffShift, chY - 10 - puffShift, TOXIC_MID);

  drawSkull(ctx, 38, 41, true);
  drawJunkPile(ctx, 28, 58);
  drawGreenTorch(ctx, 43, 55, 6, frame);

  return canvas;
}

/**
 * GOBLIN SHOP: Scavenger scrap bazaar! Open-air ramshackle wooden deck with a jagged patched tarp
 * lean-to canopy on uneven poles, heaps of rusty gears, glowing toxic bottles, and a skull banner.
 */
function buildGoblinShop(frame: number): HTMLCanvasElement {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  isoDiamond(ctx, 32, 48, 28, MUD_DARK, OUT);
  isoDiamond(ctx, 32, 48, 24, MUD_MID, BOG_DARK);

  // Low crooked wooden deck platform & back scrap-wall partition
  isoBox(ctx, 32, 56, 18, 18, 3, { top: WOOD_LIGHT, left: WOOD_DARK, right: WOOD_MID });
  isoBox(ctx, 25, 45, 12, 5, 12, { top: RUST_TOP, left: WOOD_DARK, right: RUST_MID });

  // Two crooked front support poles holding up the canopy
  rect(ctx, 17, 36, 2, 14, OUT);
  rect(ctx, 18, 36, 1, 13, WOOD_MID);
  rect(ctx, 45, 36, 2, 14, OUT);
  rect(ctx, 45, 36, 1, 13, WOOD_LIGHT);

  // Lopsided scavenger counter with glowing toxic potions & gold scrap
  isoBox(ctx, 34, 53, 6, 12, 5, { top: RUST_LIGHT, left: WOOD_DARK, right: WOOD_MID });
  px(ctx, 35, 46, TOXIC_BRIGHT);
  px(ctx, 36, 46, TOXIC_DEEP);
  px(ctx, 38, 45, TOXIC_YELLOW);
  px(ctx, 41, 43, TOXIC_BRIGHT);

  drawJunkPile(ctx, 24, 49);
  drawJunkPile(ctx, 28, 51);

  // Slanted patchwork tarp & corrugated metal canopy overhead
  for (let u = 0; u < 16; u++) {
    for (let v = 0; v < 16; v++) {
      const slope = (u + v) >> 2;
      const x = 32 - u + v;
      const y = 26 + ((u + v) >> 1) + slope;
      const isEdge = u === 0 || u === 15 || v === 0 || v === 15;
      const patch = ((u >> 2) + (v >> 2)) % 3;
      const col = isEdge ? OUT : patch === 0 ? RUST_LIGHT : patch === 1 ? BOG_LIGHT : IRON_LIGHT;
      rect(ctx, x, y, 2, 1, col);
    }
  }
  for (let v = 1; v < 15; v += 2) {
    const x = 18 + v;
    const y = 35 + (v >> 2);
    rect(ctx, x, y, 2, 2, v % 4 === 1 ? RUST_MID : BOG_MID);
    px(ctx, x, y + 2, OUT);
  }

  // Tall crooked signpost on the right corner with skull & swinging green lantern
  rect(ctx, 48, 22, 2, 26, OUT);
  rect(ctx, 48, 23, 1, 24, WOOD_LIGHT);
  rect(ctx, 43, 25, 9, 5, OUT);
  rect(ctx, 44, 26, 7, 3, WOOD_TOP);
  px(ctx, 46, 27, TOXIC_BRIGHT);
  px(ctx, 48, 27, TOXIC_YELLOW);
  drawSkull(ctx, 48, 21, true);

  const swing = frame % 2;
  rect(ctx, 43 + swing, 30, 3, 4, OUT);
  rect(ctx, 44 + swing, 31, 1, 2, swing === 0 ? TOXIC_BRIGHT : TOXIC_YELLOW);

  return canvas;
}

/**
 * GOBLIN BARRACKS: Spiked scrap fort with a ragged loot flag!
 * Asymmetric two-part scrap-iron & timber bastion bristling with outward-jutting diagonal spikes,
 * fanged gatehouse arch, green war braziers, and a flapping loot banner.
 */
function buildGoblinBarracks(frame: number): HTMLCanvasElement {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  isoDiamond(ctx, 32, 48, 29, MUD_DARK, OUT);
  isoDiamond(ctx, 32, 48, 25, MUD_MID, BOG_DARK);

  // Back-left taller scrap-iron turret
  isoBox(ctx, 25, 49, 9, 9, 19, { top: IRON_TOP, left: IRON_DARK, right: IRON_MID });
  isoBox(ctx, 25, 36, 9, 9, 3, { top: RUST_TOP, left: RUST_DARK, right: RUST_MID });

  // Main fortified scrap-metal & plank war-hall
  const fx = 33, fy = 54, wL = 15, wR = 16, wallH = 13;
  isoBox(ctx, fx, fy, wL, wR, wallH, { top: RUST_TOP, left: WOOD_DARK, right: RUST_MID });
  isoBox(ctx, fx, fy, wL, wR, 6, { top: IRON_LIGHT, left: IRON_DARK, right: IRON_MID });

  // Fanged gatehouse arch on right wall with hanging iron teeth
  rightWallRect(ctx, fx, fy, 4, 1, 7, 9, OUT);
  rightWallRect(ctx, fx, fy, 5, 1, 5, 8, '#181412');
  for (const vTooth of [5, 7, 9]) {
    rightWallRect(ctx, fx, fy, vTooth, 6, 1, 3, IRON_TOP);
  }
  drawSkull(ctx, 39, 41, true);

  for (const u0 of [4, 10]) {
    leftWallRect(ctx, fx, fy, u0, 8, 3, 4, OUT);
    leftWallRect(ctx, fx, fy, u0 + 1, 9, 1, 2, TOXIC_BRIGHT);
  }

  // Outward-jutting diagonal iron spikes bristling from the upper walls
  for (const uSpike of [2, 6, 10, 13]) {
    const sx = fx - 1 - uSpike;
    const sy = fy - (uSpike >> 1) - 10;
    rect(ctx, sx - 3, sy - 1, 3, 2, OUT);
    rect(ctx, sx - 2, sy, 2, 1, IRON_TOP);
    px(ctx, sx - 3, sy - 1, BONE_LIGHT);
  }
  for (const vSpike of [2, 12, 15]) {
    const sx = fx + vSpike;
    const sy = fy - (vSpike >> 1) - 10;
    rect(ctx, sx + 1, sy - 1, 3, 2, OUT);
    rect(ctx, sx + 1, sy, 2, 1, IRON_TOP);
    px(ctx, sx + 3, sy - 1, BONE_LIGHT);
  }

  // Jagged front perimeter barricade of rusted girders & sharpened stakes
  const pFx = 32, pFy = 60;
  for (let u = 0; u < 18; u += 2) {
    const x = pFx - 1 - u;
    const yBot = pFy - (u >> 1);
    const stakeH = u % 4 === 0 ? 8 : 5;
    rect(ctx, x - 1, yBot - stakeH, 2, stakeH + 1, OUT);
    rect(ctx, x, yBot - stakeH + 1, 1, stakeH - 1, u % 4 === 0 ? RUST_MID : WOOD_MID);
    px(ctx, x - 1, yBot - stakeH - 1, IRON_TOP);
  }
  for (let v = 0; v < 18; v += 2) {
    if (v >= 4 && v <= 10) continue;
    const x = pFx + v;
    const yBot = pFy - (v >> 1);
    const stakeH = v % 4 === 0 ? 8 : 5;
    rect(ctx, x, yBot - stakeH, 2, stakeH + 1, OUT);
    rect(ctx, x, yBot - stakeH + 1, 1, stakeH - 1, v % 4 === 0 ? IRON_MID : WOOD_LIGHT);
    px(ctx, x + 1, yBot - stakeH - 1, IRON_TOP);
  }

  drawGreenTorch(ctx, 35, 58, 6, frame);
  drawGreenTorch(ctx, 43, 54, 6, frame + 1);

  // Tall spear-pole on the turret with a ragged waving LOOT FLAG
  const poleX = 25, poleY = 8, wave = frame % 2;
  rect(ctx, poleX, poleY, 2, 18, OUT);
  rect(ctx, poleX, poleY + 1, 1, 16, IRON_LIGHT);
  px(ctx, poleX, poleY - 1, TOXIC_YELLOW);
  rect(ctx, poleX + 2, poleY + 1 + wave, 11, 7, OUT);
  rect(ctx, poleX + 2, poleY + 2 + wave, 9, 5, RUST_MID);
  rect(ctx, poleX + 8, poleY + 2 + wave, 4, 5, BOG_MID);
  px(ctx, poleX + 12, poleY + 3 + wave, OUT);
  px(ctx, poleX + 12, poleY + 5 + wave, OUT);
  rect(ctx, poleX + 4, poleY + 3 + wave, 3, 3, TOXIC_YELLOW);
  px(ctx, poleX + 5, poleY + 4 + wave, OUT);

  return canvas;
}

/**
 * GOBLIN TOWER: Wobbly watchtower made of 3 offset stacked junk boxes!
 * Bottom: rusty iron boiler; Middle: leaning crooked crate braced with struts;
 * Top: overhanging crow's nest with dangling rope ladder, skull spike, and toxic green beacon.
 */
function buildGoblinTower(frame: number): HTMLCanvasElement {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  isoDiamond(ctx, 32, 48, 25, MUD_DARK, OUT);
  isoDiamond(ctx, 32, 48, 20, MUD_MID, BOG_DARK);

  // TIER 1 (Bottom): Squat rusted iron boiler & propping struts
  isoBox(ctx, 32, 57, 14, 14, 11, { top: RUST_TOP, left: IRON_DARK, right: RUST_MID });
  rightWallRect(ctx, 32, 57, 4, 1, 6, 7, OUT);
  rightWallRect(ctx, 32, 57, 5, 2, 4, 5, IRON_MID);
  rightWallRect(ctx, 32, 57, 7, 4, 1, 1, TOXIC_YELLOW);
  rect(ctx, 17, 46, 2, 8, OUT);
  rect(ctx, 18, 46, 1, 7, WOOD_MID);
  rect(ctx, 45, 46, 2, 8, OUT);
  rect(ctx, 45, 46, 1, 7, WOOD_LIGHT);

  // TIER 2 (Middle): Shifted LEFT by 3px so the tower visibly leans!
  const midFx = 29, midFy = 46;
  isoBox(ctx, midFx, midFy, 10, 10, 12, { top: WOOD_TOP, left: WOOD_DARK, right: WOOD_MID });
  rightWallRect(ctx, midFx, midFy, 2, 4, 6, 5, OUT);
  rightWallRect(ctx, midFx, midFy, 3, 5, 4, 3, IRON_MID);
  rightWallRect(ctx, midFx, midFy, 4, 6, 2, 1, TOXIC_BRIGHT);
  leftWallRect(ctx, midFx, midFy, 3, 5, 4, 4, OUT);
  leftWallRect(ctx, midFx, midFy, 4, 6, 2, 2, TOXIC_YELLOW);

  for (let i = 0; i < 6; i++) {
    rect(ctx, 21 + (i >> 1), 35 + i, 2, 1, WOOD_LIGHT);
    rect(ctx, 38 + (i >> 1), 35 + i, 2, 1, WOOD_LIGHT);
  }

  // TIER 3 (Top): Shifted RIGHT by 5px overhanging crow's nest
  isoBox(ctx, 34, 35, 12, 12, 6, { top: RUST_LIGHT, left: RUST_DARK, right: WOOD_MID });
  for (const [sx, sy, sh] of TOWER_SPIKES) {
    rect(ctx, sx, sy - sh, 2, sh, OUT);
    rect(ctx, sx, sy - sh + 1, 1, sh - 1, sx % 2 === 0 ? IRON_LIGHT : WOOD_LIGHT);
  }

  // Dangling crooked rope ladder down the right face
  for (let y = 30; y < 50; y += 3) {
    rect(ctx, 39, y, 4, 1, BONE_SHADOW);
  }
  rect(ctx, 39, 30, 1, 20, OUT);
  rect(ctx, 42, 30, 1, 20, OUT);

  // Blazing toxic-green signal brazier & skull spike atop crow's nest
  const fShift = frame % 2;
  rect(ctx, 31, 19, 6, 4, OUT);
  rect(ctx, 32, 20, 4, 2, IRON_MID);
  disc(ctx, 34, 17 - fShift, 3, TOXIC_DEEP);
  disc(ctx, 34, 17 - fShift, 2, TOXIC_BRIGHT);
  px(ctx, 34 + fShift, 14 - fShift, TOXIC_YELLOW);
  rect(ctx, 24, 14, 1, 7, OUT);
  drawSkull(ctx, 24, 13, true);

  return canvas;
}

/**
 * GOBLIN FARM: Muddy fungal & muck-grub pit!
 * Sunken dark mire enclosed by bone-and-scrap stakes, giant glowing toxic & rust-spotted mushrooms,
 * a rotting log sprouting fungi, a skull scarecrow, and a crooked back-right muck shed.
 */
function buildGoblinFarm(): HTMLCanvasElement {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  isoDiamond(ctx, 32, 48, 29, MUD_DARK, OUT);
  for (let u = 3; u < 29; u++) {
    for (let v = 3; v < 29; v++) {
      const isSlimePool = u >= 14 && u <= 22 && v >= 15 && v <= 23 && (u + v) % 5 === 0;
      const col = isSlimePool ? BOG_LIGHT : v % 5 === 0 ? BOG_DARK : MUD_MID;
      isoTexel(ctx, 32, 32, u, v, col);
    }
  }

  // Crooked lean-to fungal shed on the BACK-RIGHT quadrant
  const fx = 39, fy = 47;
  isoBox(ctx, fx, fy, 10, 9, 8, { top: RUST_TOP, left: WOOD_DARK, right: RUST_MID });
  for (let u = 0; u < 12; u++) {
    for (let v = 0; v < 11; v++) {
      const x = fx - u + v;
      const y = fy - 8 - ((u + v) >> 1) - (u >> 2);
      const isEdge = u === 0 || u === 11 || v === 0 || v === 10;
      rect(ctx, x, y, 1, 2, isEdge ? OUT : (u + v) % 3 === 0 ? BOG_LIGHT : WOOD_MID);
    }
  }
  leftWallRect(ctx, fx, fy, 3, 1, 4, 5, OUT);
  leftWallRect(ctx, fx, fy, 4, 1, 2, 4, '#14100c');
  leftWallRect(ctx, fx, fy, 4, 1, 1, 2, TOXIC_BRIGHT);

  // Rotting hollow log in the back-left muck
  for (let i = 0; i < 9; i++) {
    const lx = 20 + i, ly = 43 + (i >> 1);
    rect(ctx, lx, ly - 3, 2, 4, OUT);
    rect(ctx, lx, ly - 2, 2, 2, i % 2 === 0 ? WOOD_DARK : BOG_MID);
  }

  // Giant spotted goblin mushrooms cultivated across the muck pit
  for (const [sx, sy, isToxic] of FARM_SHROOMS) {
    rect(ctx, sx - 1, sy - 3, 3, 3, OUT);
    rect(ctx, sx, sy - 2, 1, 2, BONE_MID);
    const capCol = isToxic ? TOXIC_DEEP : RUST_LIGHT;
    const spotCol = isToxic ? TOXIC_BRIGHT : TOXIC_YELLOW;
    rect(ctx, sx - 3, sy - 5, 7, 3, OUT);
    rect(ctx, sx - 2, sy - 5, 5, 2, capCol);
    rect(ctx, sx - 1, sy - 6, 3, 1, capCol);
    px(ctx, sx - 1, sy - 5, spotCol);
    px(ctx, sx + 1, sy - 4, spotCol);
  }

  rect(ctx, 26, 40, 2, 9, OUT);
  rect(ctx, 26, 41, 1, 7, WOOD_LIGHT);
  rect(ctx, 23, 42, 8, 2, RUST_MID);
  drawSkull(ctx, 26, 39, true);

  return canvas;
}

/**
 * GOBLIN SCHOOL: Trap & Alchemy Training Kennel!
 * Domed scrap-metal kennel hut on back-left, outdoor chalkboard with toxic-green plans,
 * bubbling alchemy cauldron, target dummy in yard, and a bone-tripod rusted gong.
 */
function buildGoblinSchool(frame: number): HTMLCanvasElement {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  isoDiamond(ctx, 32, 48, 28, MUD_DARK, OUT);
  isoDiamond(ctx, 32, 48, 24, MUD_MID, BOG_DARK);

  // Back-left crooked scrap-dome classroom hut
  isoBox(ctx, 26, 50, 12, 12, 8, { top: WOOD_TOP, left: WOOD_DARK, right: RUST_MID });
  disc(ctx, 26, 38, 9, OUT);
  disc(ctx, 26, 38, 8, IRON_MID);
  disc(ctx, 24, 36, 5, RUST_LIGHT);
  disc(ctx, 28, 37, 4, IRON_LIGHT);
  rightWallRect(ctx, 26, 50, 3, 1, 4, 6, OUT);
  rightWallRect(ctx, 26, 50, 4, 1, 2, 5, '#18120e');
  leftWallRect(ctx, 26, 50, 4, 3, 4, 4, OUT);
  leftWallRect(ctx, 26, 50, 5, 4, 2, 2, TOXIC_YELLOW);

  // Outdoor crooked slate chalkboard on wooden posts
  rect(ctx, 18, 46, 2, 9, OUT);
  rect(ctx, 25, 49, 2, 9, OUT);
  isoBox(ctx, 26, 53, 8, 2, 6, { top: WOOD_LIGHT, left: IRON_DARK, right: WOOD_MID });
  px(ctx, 21, 48, TOXIC_BRIGHT);
  px(ctx, 22, 49, TOXIC_BRIGHT);
  px(ctx, 23, 48, TOXIC_YELLOW);
  px(ctx, 20, 50, TOXIC_MID);

  // Bubbling toxic-green alchemy cauldron in center of yard
  disc(ctx, 34, 52, 4, OUT);
  disc(ctx, 34, 52, 3, IRON_DARK);
  rect(ctx, 32, 49, 5, 2, TOXIC_BRIGHT);
  if (frame % 2 === 0) {
    px(ctx, 33, 47, TOXIC_YELLOW);
    px(ctx, 35, 48, TOXIC_BRIGHT);
  } else {
    px(ctx, 34, 46, TOXIC_BRIGHT);
    px(ctx, 32, 48, TOXIC_YELLOW);
  }

  // Straw & sack target dummy on the right side of yard
  rect(ctx, 43, 45, 2, 10, OUT);
  rect(ctx, 43, 46, 1, 8, WOOD_LIGHT);
  rect(ctx, 40, 47, 8, 2, OUT);
  rect(ctx, 41, 47, 6, 1, WOOD_MID);
  isoBox(ctx, 44, 51, 4, 4, 5, { top: BONE_MID, left: WOOD_MID, right: BONE_SHADOW });
  px(ctx, 44, 48, RUST_LIGHT);
  rect(ctx, 46, 47, 3, 1, IRON_TOP);

  // Bone-and-scrap tripod suspending a clanging rusted saw-gong
  rect(ctx, 24, 21, 2, 11, OUT);
  rect(ctx, 28, 21, 2, 11, OUT);
  rect(ctx, 23, 21, 8, 2, BONE_LIGHT);
  const gongShift = frame % 2;
  disc(ctx, 26 + gongShift, 26, 3, OUT);
  disc(ctx, 26 + gongShift, 26, 2, RUST_TOP);
  px(ctx, 26 + gongShift, 26, TOXIC_YELLOW);

  return canvas;
}

/**
 * GOBLIN FACTORY: Bulbous Riveted Scrap-Smelter & Slag Foundry!
 * Round blast-furnace dome on left connected by overhead pipes to a corrugated workshop on right,
 * two crooked unequal smokestacks belching toxic yellow-green smoke, spinning gear, and glowing slag vat.
 */
function buildGoblinFactory(frame: number): HTMLCanvasElement {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  isoDiamond(ctx, 32, 48, 29, IRON_DARK, OUT);
  isoDiamond(ctx, 32, 48, 25, MUD_DARK, IRON_MID);

  // Right-side corrugated scrap workshop
  const fx = 38, fy = 55;
  isoBox(ctx, fx, fy, 12, 14, 13, { top: IRON_LIGHT, left: IRON_DARK, right: RUST_MID });
  for (let v = 0; v < 14; v++) {
    for (let u = 0; u < 12; u++) {
      const x = fx - 1 - u + v;
      const y = fy - 13 - ((u + v + 1) >> 1) - (u >> 2);
      px(ctx, x, y, v % 3 === 0 ? RUST_LIGHT : IRON_MID);
    }
  }

  // Left-side bulbous riveted blast-furnace dome
  isoBox(ctx, 24, 52, 11, 11, 10, { top: RUST_TOP, left: RUST_DARK, right: RUST_MID });
  disc(ctx, 24, 37, 8, OUT);
  disc(ctx, 24, 37, 7, RUST_MID);
  disc(ctx, 22, 35, 5, RUST_LIGHT);
  rect(ctx, 17, 37, 14, 2, OUT);
  for (let x = 18; x < 30; x += 3) px(ctx, x, 37, IRON_TOP);

  rightWallRect(ctx, 24, 52, 3, 1, 5, 6, OUT);
  rightWallRect(ctx, 24, 52, 4, 1, 3, 5, frame % 2 === 0 ? TOXIC_YELLOW : RUST_TOP);
  rightWallRect(ctx, 24, 52, 5, 2, 1, 3, TOXIC_BRIGHT);

  // Overhead rusted pipe bridge & molten toxic-slag vat
  rect(ctx, 28, 34, 11, 4, OUT);
  rect(ctx, 28, 35, 11, 2, IRON_LIGHT);
  rect(ctx, 32, 34, 2, 4, RUST_MID);
  isoBox(ctx, 31, 58, 7, 7, 4, { top: TOXIC_BRIGHT, left: IRON_DARK, right: IRON_MID });
  px(ctx, 30 + (frame % 2), 53, TOXIC_YELLOW);
  px(ctx, 31, 54, TOXIC_BRIGHT);

  // Giant toothed iron gear mounted on the right workshop wall
  const gCx = 44, gCy = 46;
  disc(ctx, gCx, gCy, 4, OUT);
  disc(ctx, gCx, gCy, 3, IRON_LIGHT);
  px(ctx, gCx, gCy, OUT);
  if (frame % 2 === 0) {
    px(ctx, gCx - 4, gCy, IRON_TOP);
    px(ctx, gCx + 4, gCy, IRON_TOP);
    px(ctx, gCx, gCy - 4, IRON_TOP);
    px(ctx, gCx, gCy + 4, IRON_TOP);
  } else {
    px(ctx, gCx - 3, gCy - 3, IRON_TOP);
    px(ctx, gCx + 3, gCy - 3, IRON_TOP);
    px(ctx, gCx - 3, gCy + 3, IRON_TOP);
    px(ctx, gCx + 3, gCy + 3, IRON_TOP);
  }

  // Two crooked unequal iron smokestacks + toxic yellow-green smoke puffs
  for (let i = 0; i < 15; i++) {
    const shift = -(i >> 2);
    rect(ctx, 21 + shift, 28 - i, 5, 1, OUT);
    rect(ctx, 22 + shift, 28 - i, 3, 1, i % 4 === 0 ? RUST_MID : IRON_MID);
  }
  for (let i = 0; i < 11; i++) {
    const shift = i >> 2;
    rect(ctx, 35 + shift, 31 - i, 4, 1, OUT);
    rect(ctx, 36 + shift, 31 - i, 2, 1, i % 3 === 0 ? RUST_LIGHT : IRON_DARK);
  }
  for (const [px0, py0, r] of FACTORY_PUFFS[frame % 3]!) {
    disc(ctx, px0, py0, r, OUT);
    disc(ctx, px0, py0, r - 1, TOXIC_DEEP);
    px(ctx, px0 - 1, py0 - 1, TOXIC_BRIGHT);
  }

  return canvas;
}

/**
 * GOBLIN LUMBER: Small and meagre (goblins lack wood)!
 * Barren muddy clearing with tiny hacked stumps, a pathetic 3-plank lean-to rain cover,
 * a single lonely crooked branch on a sawbuck, and a rusty hand-saw.
 */
function buildGoblinLumber(frame: number): HTMLCanvasElement {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  isoDiamond(ctx, 32, 48, 24, MUD_DARK, OUT);
  isoDiamond(ctx, 32, 48, 20, MUD_MID, BOG_DARK);

  // Tiny, pathetic lean-to shelter in the back (3 planks on 2 uneven sticks)
  rect(ctx, 23, 39, 2, 10, OUT);
  rect(ctx, 23, 40, 1, 8, WOOD_DARK);
  rect(ctx, 31, 41, 2, 8, OUT);
  rect(ctx, 31, 42, 1, 6, WOOD_MID);
  for (let u = 0; u < 8; u++) {
    for (let v = 0; v < 9; v++) {
      const x = 29 - u + v;
      const y = 37 + ((u + v) >> 1) + (u >> 2);
      const isEdge = u === 0 || u === 7 || v === 0 || v === 8;
      rect(ctx, x, y, 1, 2, isEdge ? OUT : u % 3 === 0 ? RUST_MID : WOOD_LIGHT);
    }
  }

  for (const [sx, sy] of LUMBER_STUMPS) {
    rect(ctx, sx - 2, sy - 2, 5, 4, OUT);
    rect(ctx, sx - 1, sy - 1, 3, 2, WOOD_DARK);
    rect(ctx, sx - 1, sy - 2, 3, 1, WOOD_TOP);
  }

  // Tiny X-frame sawbuck holding ONE skinny crooked stick + rusty hand-saw
  rect(ctx, 28, 50, 8, 3, OUT);
  rect(ctx, 27, 49, 10, 2, WOOD_MID);
  px(ctx, 26, 48, BOG_LIGHT);

  const sawShift = frame % 2;
  rect(ctx, 30 + sawShift, 46, 5, 3, OUT);
  rect(ctx, 31 + sawShift, 47, 3, 1, IRON_TOP);
  px(ctx, 30 + sawShift, 47, RUST_MID);

  return canvas;
}

/**
 * GOBLIN MINE: Rich, busy, scrappy pit with MANY ore carts (goblins are rich in ore)!
 * Craggy rust-and-iron cliff with twin mine tunnels, overhead scrap hoist crane,
 * dual rail tracks, THREE overflowing ore carts (gold, toxic emerald, iron), and ore heaps.
 */
function buildGoblinMine(frame: number): HTMLCanvasElement {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  isoDiamond(ctx, 32, 48, 30, IRON_DARK, OUT);
  isoDiamond(ctx, 32, 48, 26, MUD_DARK, IRON_MID);
  isoDiamond(ctx, 33, 52, 14, '#1b1612', OUT);

  // Towering craggy iron & rust-veined cliff along the back half
  disc(ctx, 26, 36, 12, OUT);
  disc(ctx, 26, 36, 11, IRON_MID);
  disc(ctx, 37, 37, 11, OUT);
  disc(ctx, 37, 37, 10, RUST_DARK);
  disc(ctx, 31, 32, 10, OUT);
  disc(ctx, 31, 32, 9, IRON_LIGHT);
  disc(ctx, 23, 34, 6, RUST_MID);

  for (const [vx, vy, isGold] of MINE_VEINS) {
    const col = (isGold ? frame === 0 : frame !== 0) ? TOXIC_YELLOW : TOXIC_BRIGHT;
    rect(ctx, vx, vy, 2, 2, col);
  }

  // Two dark mine tunnel mouths shored up by crooked scrap-iron & timber frames
  for (const [tx, ty] of MINE_TUNNELS) {
    rect(ctx, tx, ty, 8, 9, OUT);
    rect(ctx, tx + 1, ty + 1, 6, 8, '#120e0b');
    rect(ctx, tx - 1, ty - 1, 10, 2, WOOD_LIGHT);
    rect(ctx, tx - 1, ty, 2, 9, WOOD_MID);
    rect(ctx, tx + 7, ty, 2, 9, RUST_MID);
    px(ctx, tx + 4, ty + 1, frame % 2 === 0 ? TOXIC_BRIGHT : TOXIC_YELLOW);
  }

  // Timber & scrap-iron hoist gantry crane atop the central cliff
  rect(ctx, 29, 17, 2, 11, OUT);
  rect(ctx, 30, 18, 1, 9, WOOD_LIGHT);
  rect(ctx, 29, 17, 9, 2, OUT);
  rect(ctx, 30, 17, 7, 1, RUST_LIGHT);
  rect(ctx, 36, 19, 1, 7, IRON_TOP);

  // Twin iron rail tracks emerging from both tunnels across the quarry
  for (let i = 0; i < 16; i++) {
    const rx1 = 23 + i, ry1 = 44 + (i >> 1);
    px(ctx, rx1, ry1, IRON_TOP);
    px(ctx, rx1, ry1 + 2, IRON_LIGHT);
    if (i % 3 === 0) rect(ctx, rx1, ry1, 1, 3, WOOD_DARK);

    const rx2 = 37 - (i >> 1), ry2 = 45 + (i >> 1);
    px(ctx, rx2, ry2, IRON_TOP);
    px(ctx, rx2 + 2, ry2, IRON_LIGHT);
  }

  // THREE overflowing ore carts (gold, toxic emerald, and rich iron ore)
  const cartShift = frame % 2;
  const drawCart = (cx: number, cy: number, ore1: string, ore2: string) => {
    isoBox(ctx, cx, cy, 5, 6, 4, { top: IRON_LIGHT, left: IRON_DARK, right: RUST_MID });
    px(ctx, cx - 3, cy, IRON_TOP);
    px(ctx, cx + 2, cy - 1, IRON_TOP);
    rect(ctx, cx - 2, cy - 6, 5, 2, OUT);
    rect(ctx, cx - 1, cy - 6, 3, 2, ore1);
    px(ctx, cx, cy - 7, ore2);
    px(ctx, cx + 1, cy - 6, ore2);
  };
  drawCart(25 + cartShift, 49, TOXIC_YELLOW, RUST_TOP);
  drawCart(34, 53, TOXIC_BRIGHT, TOXIC_YELLOW);
  drawCart(42 - cartShift, 50, TOXIC_YELLOW, IRON_TOP);

  disc(ctx, 29, 57, 3, OUT);
  disc(ctx, 29, 57, 2, RUST_LIGHT);
  px(ctx, 28, 56, TOXIC_YELLOW);
  px(ctx, 30, 57, TOXIC_BRIGHT);

  return canvas;
}

/**
 * GOBLIN PARK: Tribal Bonfire & Totem Gathering Pit!
 * Muddy trampled circle with a roaring toxic-green bonfire in the center,
 * scrap-metal & barrel seats, puddles, and a tall stacked skull-and-gear totem pole.
 */
function buildGoblinPark(frame: number): HTMLCanvasElement {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  isoDiamond(ctx, 32, 48, 29, BOG_DARK, OUT);
  isoDiamond(ctx, 32, 48, 24, MUD_MID, BOG_MID);
  isoDiamond(ctx, 32, 48, 15, MUD_DARK);

  isoDiamond(ctx, 20, 49, 5, BOG_LIGHT);
  px(ctx, 20, 49, TOXIC_MID);
  isoDiamond(ctx, 43, 50, 4, BOG_LIGHT);

  // Tall stacked Skull-and-Scrap Goblin Totem Pole on the back-left
  const tX = 23, tY = 44;
  rect(ctx, tX - 2, tY - 18, 5, 19, OUT);
  rect(ctx, tX - 1, tY - 17, 3, 17, WOOD_MID);
  rect(ctx, tX - 6, tY - 13, 13, 3, OUT);
  rect(ctx, tX - 5, tY - 12, 11, 1, RUST_LIGHT);
  drawSkull(ctx, tX, tY - 8, false);
  drawSkull(ctx, tX, tY - 15, true);
  px(ctx, tX - 1, tY - 15, TOXIC_YELLOW);
  px(ctx, tX + 1, tY - 15, TOXIC_YELLOW);

  // Scrap-metal benches & central roaring toxic-green bonfire
  isoBox(ctx, 39, 45, 4, 7, 3, { top: RUST_LIGHT, left: RUST_DARK, right: RUST_MID });
  isoBox(ctx, 26, 55, 7, 4, 3, { top: IRON_LIGHT, left: IRON_DARK, right: IRON_MID });

  disc(ctx, 33, 49, 6, OUT);
  disc(ctx, 33, 49, 5, WOOD_DARK);
  rect(ctx, 29, 48, 8, 2, BONE_MID);
  const fShift = frame % 2;
  disc(ctx, 33, 45 - fShift, 5, TOXIC_DEEP);
  disc(ctx, 33, 44 - fShift, 3, TOXIC_BRIGHT);
  rect(ctx, 32 + fShift, 39 - fShift, 2, 4, TOXIC_YELLOW);
  px(ctx, 31, 38 - fShift, TOXIC_BRIGHT);
  px(ctx, 35, 40, TOXIC_YELLOW);

  return canvas;
}

/**
 * GOBLIN GROUND (64x32): Muddy bog grass with deterministic noise and 4 variants:
 * (0) muddy grass blotches, (1) half-buried rusty scrap plates, (2) bleached bones, (3) toxic puddles.
 */
function buildGoblinGround(parity: 0 | 1, variant: number): HTMLCanvasElement {
  const [canvas, ctx] = makeCanvas(SPRITE_W, TILE_H);
  const base = parity === 0 ? '#2f4022' : '#28371d';
  const mud = parity === 0 ? MUD_MID : MUD_DARK;
  const moss = parity === 0 ? BOG_LIGHT : BOG_MID;

  isoDiamond(ctx, 32, 16, 32, base, '#1a2412');

  for (let u = 2; u < 30; u++) {
    for (let v = 2; v < 30; v++) {
      const r = tileHash(u, v, variant * 19 + parity * 11 + 5) % 27;
      if (r === 0 || r === 1) isoTexel(ctx, 32, 0, u, v, mud);
      else if (r === 2) isoTexel(ctx, 32, 0, u, v, moss);
      else if (r === 3) isoTexel(ctx, 32, 0, u, v, BOG_DARK);
    }
  }

  const vIdx = ((variant % 4) + 4) % 4;
  if (vIdx === 0) {
    for (const [u, v] of GROUND_PATCHES) {
      const sx = 32 + (u - v), sy = (u + v) >> 1;
      rect(ctx, sx - 1, sy, 3, 1, MUD_DARK);
      px(ctx, sx, sy - 1, TOXIC_DEEP);
    }
  } else if (vIdx === 1) {
    for (const [u, v, plateCol, rivetCol] of GROUND_SCRAPS) {
      const sx = 32 + (u - v), sy = (u + v) >> 1;
      rect(ctx, sx - 2, sy, 4, 2, OUT);
      rect(ctx, sx - 1, sy, 2, 1, plateCol);
      px(ctx, sx, sy, rivetCol);
    }
  } else if (vIdx === 2) {
    for (const [u, v] of GROUND_BONES) {
      const sx = 32 + (u - v), sy = (u + v) >> 1;
      rect(ctx, sx - 2, sy, 4, 1, BONE_LIGHT);
      px(ctx, sx - 2, sy + 1, BONE_SHADOW);
      px(ctx, sx + 1, sy - 1, BONE_MID);
    }
  } else {
    for (const [u, v] of GROUND_PUDDLES) {
      const sx = 32 + (u - v), sy = (u + v) >> 1;
      rect(ctx, sx - 3, sy, 6, 2, MUD_DARK);
      rect(ctx, sx - 2, sy, 4, 1, BOG_LIGHT);
      px(ctx, sx - 1, sy, TOXIC_MID);
    }
  }

  return canvas;
}

/** GOBLIN FOUNDATION (64x32): Patchwork pad of packed mud, crooked planks, and bolted scrap-iron sheets. */
function buildGoblinFoundation(): HTMLCanvasElement {
  const [canvas, ctx] = makeCanvas(SPRITE_W, TILE_H);
  isoDiamond(ctx, 32, 16, 32, MUD_DARK, '#1a2412');
  isoDiamond(ctx, 32, 16, 26, MUD_MID, OUT);
  rect(ctx, 26, 13, 12, 2, WOOD_DARK);
  rect(ctx, 28, 17, 9, 2, IRON_MID);
  rect(ctx, 23, 15, 5, 2, RUST_DARK);
  return canvas;
}

/**
 * GOBLIN CITIZEN (16x24): Small hunched body with huge horizontal pointy ears, big nose,
 * glowing yellow eyes, 4 clothing/skin variants (0..3), and 4-frame walk cycle (feet at bottom row y=23).
 */
function buildGoblinCitizen(frame: number, variant: number): HTMLCanvasElement {
  const [canvas, ctx] = makeCanvas(16, 24);
  const f = ((frame % 4) + 4) % 4;
  const v = ((variant % 4) + 4) % 4;

  const [skinShadow, skinLight] = CITIZEN_SKINS[v]!;
  const [clothDark, clothMid, trimCol] = CITIZEN_OUTFITS[v]!;
  const bob = f === 1 ? 1 : 0;

  // Hunched head & huge horizontal pointy ears (x = 1..14)
  const headY = 8 + bob;
  rect(ctx, 1, headY + 1, 4, 3, OUT);
  rect(ctx, 4, headY + 2, 1, 2, OUT);
  rect(ctx, 2, headY + 2, 3, 1, skinLight);
  px(ctx, 1, headY + 1, skinShadow);

  rect(ctx, 11, headY + 1, 4, 3, OUT);
  rect(ctx, 11, headY + 2, 3, 1, skinLight);
  px(ctx, 14, headY + 1, skinShadow);

  rect(ctx, 4, headY, 8, 6, OUT);
  rect(ctx, 5, headY + 1, 6, 4, skinLight);
  rect(ctx, 5, headY + 4, 6, 1, skinShadow);
  px(ctx, 6, headY + 2, TOXIC_YELLOW);
  px(ctx, 9, headY + 2, TOXIC_YELLOW);
  rect(ctx, 7, headY + 3, 2, 2, skinShadow);
  px(ctx, 7, headY + 3, skinLight);

  if (v === 1) {
    rect(ctx, 5, headY - 1, 6, 2, OUT);
    rect(ctx, 6, headY - 1, 4, 1, IRON_LIGHT);
  } else if (v === 2) {
    rect(ctx, 6, headY - 1, 4, 1, BONE_LIGHT);
  }

  // Hunched torso & swinging clawed arms
  const torsoY = 13 + bob;
  rect(ctx, 3, torsoY, 10, 7, OUT);
  rect(ctx, 4, torsoY + 1, 8, 5, clothMid);
  rect(ctx, 4, torsoY + 1, 3, 5, clothDark);
  px(ctx, 6, torsoY + 2, trimCol);
  px(ctx, 7, torsoY + 3, trimCol);
  px(ctx, 8, torsoY + 4, trimCol);

  const leftArmY = torsoY + (f === 0 ? 2 : f === 2 ? 0 : 1);
  const rightArmY = torsoY + (f === 2 ? 2 : f === 0 ? 0 : 1);
  rect(ctx, 2, leftArmY, 2, 5, OUT);
  rect(ctx, 2, leftArmY + 1, 1, 3, skinShadow);
  rect(ctx, 12, rightArmY, 2, 5, OUT);
  rect(ctx, 12, rightArmY + 1, 1, 3, skinLight);

  // Scurrying legs & feet planted at bottom row y = 23
  const leftFootY = f === 2 ? 22 : 23;
  const rightFootY = f === 0 ? 22 : 23;
  rect(ctx, 4, 19 + bob, 3, leftFootY - (19 + bob) + 1, OUT);
  rect(ctx, 5, 19 + bob, 1, leftFootY - (19 + bob), clothDark);
  rect(ctx, 4, leftFootY - 1, 3, 2, OUT);
  px(ctx, 5, leftFootY - 1, WOOD_DARK);

  rect(ctx, 9, 19 + bob, 3, rightFootY - (19 + bob) + 1, OUT);
  rect(ctx, 10, 19 + bob, 1, rightFootY - (19 + bob), clothDark);
  rect(ctx, 9, rightFootY - 1, 3, 2, OUT);
  px(ctx, 10, rightFootY - 1, WOOD_MID);

  return canvas;
}

/**
 * GOBLIN TREE: Gnarled bog deadwood with forked crooked branches,
 * drooping murky swamp-moss curtains, root mushrooms, and a hanging bone charm.
 */
function buildGoblinTree(frame: number): HTMLCanvasElement {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);
  const sway = frame % 2;

  isoDiamond(ctx, 32, 50, 12, MUD_DARK, OUT);
  isoDiamond(ctx, 32, 50, 8, BOG_DARK);

  for (let i = 0; i < 16; i++) {
    const bend = i < 8 ? -(i >> 1) : -4 + ((i - 8) >> 1);
    rect(ctx, 30 + bend, 49 - i, 5, 2, OUT);
    rect(ctx, 31 + bend, 49 - i, 3, 1, i % 2 === 0 ? WOOD_DARK : WOOD_MID);
  }
  for (let i = 0; i < 8; i++) {
    rect(ctx, 27 - i, 34 - (i >> 1), 3, 2, OUT);
    px(ctx, 28 - i, 34 - (i >> 1), WOOD_MID);
    rect(ctx, 32 + i, 35 - (i >> 1), 3, 2, OUT);
    px(ctx, 33 + i, 35 - (i >> 1), WOOD_LIGHT);
  }

  const drawMossCluster = (cx: number, cy: number, r: number) => {
    disc(ctx, cx, cy, r, OUT);
    disc(ctx, cx, cy, r - 1, BOG_MID);
    disc(ctx, cx - 1, cy - 1, Math.max(2, r - 2), BOG_LIGHT);
    rect(ctx, cx - 2, cy + r - 1, 1, 4, OUT);
    rect(ctx, cx - 2, cy + r - 1, 1, 3, TOXIC_DEEP);
    rect(ctx, cx + 2, cy + r - 1, 1, 5, OUT);
    rect(ctx, cx + 2, cy + r - 1, 1, 4, BOG_LIGHT);
  };
  drawMossCluster(22 + sway, 29, 5);
  drawMossCluster(30 + sway, 25, 6);
  drawMossCluster(39 + sway, 30, 5);

  rect(ctx, 38 + sway, 33, 1, 5, OUT);
  rect(ctx, 37 + sway, 38, 3, 3, OUT);
  rect(ctx, 37 + sway, 38, 2, 2, BONE_LIGHT);
  rect(ctx, 35, 48, 3, 2, OUT);
  rect(ctx, 35, 47, 3, 1, TOXIC_BRIGHT);

  return canvas;
}

/**
 * GOBLIN LAMP: Crooked scrap-iron pike with a horned skull finial and a swinging
 * rib-cage brazier burning with crisp toxic-green & yellow flames.
 */
function buildGoblinLamp(frame: number): HTMLCanvasElement {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);
  const sway = frame % 2;

  isoDiamond(ctx, 32, 50, 10, MUD_DARK, OUT);
  drawJunkPile(ctx, 31, 50);

  for (let i = 0; i < 26; i++) {
    const bend = i < 13 ? -(i >> 2) : -3 + ((i - 13) >> 2);
    rect(ctx, 30 + bend, 49 - i, 3, 1, OUT);
    px(ctx, 31 + bend, 49 - i, i % 4 === 0 ? RUST_MID : IRON_MID);
  }

  rect(ctx, 27, 22, 12, 3, OUT);
  rect(ctx, 28, 23, 10, 1, BONE_MID);
  drawSkull(ctx, 29, 20, true);

  const cageX = 36 + sway;
  rect(ctx, cageX, 24, 1, 4, IRON_TOP);
  rect(ctx, cageX - 2, 28, 6, 6, OUT);
  rect(ctx, cageX - 1, 29, 4, 4, IRON_DARK);
  rect(ctx, cageX - 1, 27, 4, 4, TOXIC_DEEP);
  rect(ctx, cageX, 26, 2, 4, TOXIC_BRIGHT);
  px(ctx, cageX + (1 - sway), 25, TOXIC_YELLOW);
  px(ctx, cageX - 4, 27 + sway, TOXIC_BRIGHT);
  px(ctx, cageX + 5, 29 - sway, TOXIC_YELLOW);
  px(ctx, cageX + 1, 35, TOXIC_DEEP);

  return canvas;
}

/**
 * GOBLIN FOUNTAIN: Leaky riveted boiler-tank cistern atop a toxic slime catch-basin,
 * spewing jets of bubbling green sludge from crooked iron pipes.
 */
function buildGoblinFountain(frame: number): HTMLCanvasElement {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);
  const shift = frame % 2;

  isoDiamond(ctx, 32, 47, 26, IRON_DARK, OUT);
  isoDiamond(ctx, 32, 47, 22, RUST_DARK, IRON_MID);
  isoDiamond(ctx, 32, 47, 18, shift === 0 ? TOXIC_DEEP : BOG_LIGHT, OUT);
  isoDiamond(ctx, 32, 47, 11, shift === 0 ? TOXIC_BRIGHT : TOXIC_MID);

  isoBox(ctx, 32, 45, 8, 8, 13, { top: RUST_TOP, left: RUST_DARK, right: RUST_MID });
  isoBox(ctx, 32, 38, 8, 8, 2, { top: IRON_TOP, left: IRON_DARK, right: IRON_MID });
  drawSkull(ctx, 32, 41, false);

  rect(ctx, 23, 34, 5, 3, OUT);
  rect(ctx, 24, 35, 4, 1, IRON_LIGHT);
  rect(ctx, 36, 34, 5, 3, OUT);
  rect(ctx, 36, 35, 4, 1, IRON_LIGHT);
  rect(ctx, 30, 26, 4, 5, OUT);
  rect(ctx, 31, 27, 2, 4, IRON_MID);

  rect(ctx, 31, 22 - shift, 2, 4, TOXIC_BRIGHT);
  px(ctx, 30, 21 + shift, TOXIC_YELLOW);
  px(ctx, 33, 22, TOXIC_YELLOW);
  rect(ctx, 22, 36 + shift, 2, 8, TOXIC_BRIGHT);
  px(ctx, 21, 44, TOXIC_YELLOW);
  rect(ctx, 40, 36 + (1 - shift), 2, 8, TOXIC_BRIGHT);
  px(ctx, 41, 44, TOXIC_YELLOW);

  return canvas;
}

/**
 * GOBLIN STATUE: Crude, menacing Scrap-Iron & Bone Goblin Warlord Effigy!
 * Welded together from rusted boiler plates and girders atop a skull-strewn scrap plinth,
 * with wide pointy metal ears, glowing yellow eyes, a hoisted iron cleaver, and a gold loot sack.
 */
function buildGoblinStatue(): HTMLCanvasElement {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  isoDiamond(ctx, 32, 49, 23, MUD_DARK, OUT);
  isoBox(ctx, 32, 56, 13, 13, 7, { top: RUST_TOP, left: IRON_DARK, right: RUST_MID });
  drawSkull(ctx, 25, 52, false);
  drawSkull(ctx, 39, 52, false);

  isoBox(ctx, 32, 45, 8, 8, 12, { top: IRON_TOP, left: IRON_DARK, right: IRON_MID });
  rightWallRect(ctx, 32, 45, 1, 4, 6, 5, RUST_LIGHT);
  leftWallRect(ctx, 32, 45, 1, 4, 6, 5, RUST_MID);

  // Oversized scrap-metal goblin head with HUGE horizontal pointy ears
  rect(ctx, 21, 23, 6, 4, OUT);
  rect(ctx, 22, 24, 5, 2, IRON_LIGHT);
  rect(ctx, 37, 23, 6, 4, OUT);
  rect(ctx, 37, 24, 5, 2, IRON_TOP);

  disc(ctx, 32, 24, 5, OUT);
  disc(ctx, 32, 24, 4, IRON_MID);
  rect(ctx, 29, 23, 2, 2, TOXIC_YELLOW);
  rect(ctx, 33, 23, 2, 2, TOXIC_YELLOW);
  rect(ctx, 29, 26, 6, 2, OUT);
  px(ctx, 30, 26, BONE_LIGHT);
  px(ctx, 32, 26, BONE_LIGHT);
  px(ctx, 34, 26, BONE_LIGHT);

  // Jagged crown, golden loot sack in left hand, massive notched iron cleaver hoisted in right hand
  rect(ctx, 28, 17, 8, 3, OUT);
  rect(ctx, 29, 18, 6, 2, TOXIC_YELLOW);
  px(ctx, 29, 16, TOXIC_YELLOW);
  px(ctx, 32, 15, TOXIC_YELLOW);
  px(ctx, 35, 16, TOXIC_YELLOW);

  rect(ctx, 23, 31, 5, 4, OUT);
  disc(ctx, 23, 36, 4, OUT);
  disc(ctx, 23, 36, 3, TOXIC_YELLOW);
  px(ctx, 22, 35, BONE_LIGHT);

  rect(ctx, 36, 28, 5, 4, OUT);
  rect(ctx, 39, 12, 5, 17, OUT);
  rect(ctx, 40, 13, 3, 11, IRON_TOP);
  rect(ctx, 40, 24, 2, 4, WOOD_MID);
  px(ctx, 43, 16, OUT);
  px(ctx, 43, 20, OUT);

  return canvas;
}

// Source: apps/web/lib/sprites.ts isometric helpers & MDN CanvasRenderingContext2D.fillRect
// (https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/fillRect)

/**
 * GOBLIN ROWHOUSE: Three cramped, ramshackle narrow scrap-shanties jammed side-by-side in a row,
 * with mismatched corrugated roofs, crooked chimneys, 3 riveted doors, and green porthole windows.
 */
function buildGoblinRowhouse(frame: number): HTMLCanvasElement {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  isoDiamond(ctx, 32, 48, 28, MUD_DARK, OUT);
  isoDiamond(ctx, 32, 48, 24, MUD_MID, BOG_DARK);

  // Three narrow joined shanties stepped back-right to front-left along the street
  const units: readonly (readonly [number, number, number, string, string, string, string])[] = [
    [42, 51, 12, IRON_TOP, IRON_DARK, IRON_MID, RUST_LIGHT],   // unit 2: riveted boiler plate
    [36, 54, 15, RUST_TOP, WOOD_DARK, RUST_MID, BOG_LIGHT],    // unit 1: tall rusted corrugated iron
    [30, 57, 13, WOOD_TOP, WOOD_DARK, WOOD_MID, IRON_LIGHT],   // unit 0: patched plank & tin
  ];

  for (let idx = 0; idx < units.length; idx++) {
    const [ufx, ufy, wallH, topC, leftC, rightC, roofC] = units[idx]!;
    const wL = 13;
    const wR = 6;
    isoBox(ctx, ufx, ufy, wL, wR, wallH, { top: topC, left: leftC, right: rightC });

    // Corrugated patched slanted roof cap per unit
    for (let u = 0; u < wL + 1; u++) {
      for (let v = 0; v < wR; v++) {
        const rise = u < 6 ? u >> 1 : (wL - u) >> 1;
        const x = ufx - 1 - u + v;
        const y = ufy - wallH - ((u + v + 1) >> 1) - rise;
        const isEdge = u === 0 || u === wL || v === 0 || v === wR - 1;
        rect(ctx, x, y, 1, 2, isEdge ? OUT : (u + v) % 3 === 0 ? RUST_MID : roofC);
      }
    }

    // Narrow riveted door on the front-right street face
    rightWallRect(ctx, ufx, ufy, 1, 1, 3, 6, OUT);
    rightWallRect(ctx, ufx, ufy, 2, 1, 1, 5, idx === 1 ? IRON_DARK : RUST_DARK);
    px(ctx, ufx + 2, ufy - 4, TOXIC_YELLOW);

    // Lower and upper toxic-green lit windows on each unit
    const winGlow = (idx + frame) % 2 === 0 ? TOXIC_BRIGHT : TOXIC_YELLOW;
    rightWallRect(ctx, ufx, ufy, 4, 3, 2, 3, OUT);
    rightWallRect(ctx, ufx, ufy, 4, 4, 1, 1, winGlow);
    rightWallRect(ctx, ufx, ufy, 2, 8, 3, 3, OUT);
    rightWallRect(ctx, ufx, ufy, 3, 9, 1, 2, winGlow);
  }

  // Left wall patched windows & rivets on front-most unit
  leftWallRect(ctx, 30, 57, 3, 5, 4, 4, OUT);
  leftWallRect(ctx, 30, 57, 4, 6, 2, 2, TOXIC_BRIGHT);
  leftWallRect(ctx, 30, 57, 8, 4, 3, 5, RUST_MID);

  // Two crooked stovepipe chimneys jutting from the row roofs
  for (let i = 0; i < 6; i++) {
    rect(ctx, 31 - (i >> 1), 35 - i, 3, 1, OUT);
    px(ctx, 32 - (i >> 1), 35 - i, IRON_LIGHT);
    rect(ctx, 39 + (i >> 1), 33 - i, 3, 1, OUT);
    px(ctx, 40 + (i >> 1), 33 - i, RUST_LIGHT);
  }
  px(ctx, 29, 28 - (frame % 2), TOXIC_MID);
  px(ctx, 42, 26 - (frame % 2), TOXIC_BRIGHT);

  // Green street lamp by the front stoop
  drawGreenTorch(ctx, 33, 59, 5, frame);

  return canvas;
}

/**
 * GOBLIN MANOR: Rich Goblin Boss's "Scrap-Villa" with a riveted iron garden wall, pillared porch,
 * crooked pipe chimney, shiny brass/yellow rivet trim, and a tall pointed back-left scrap turret.
 */
function buildGoblinManor(frame: number): HTMLCanvasElement {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  isoDiamond(ctx, 32, 48, 29, MUD_DARK, OUT);
  isoDiamond(ctx, 32, 48, 25, BOG_DARK, IRON_MID);

  // Tall back-left riveted iron turret with conical scrap spire & golden horned skull
  const tFx = 24, tFy = 48;
  isoBox(ctx, tFx, tFy, 8, 8, 21, { top: IRON_TOP, left: IRON_DARK, right: IRON_MID });
  isoBox(ctx, tFx, tFy - 18, 9, 9, 3, { top: TOXIC_YELLOW, left: RUST_DARK, right: RUST_TOP });
  rightWallRect(ctx, tFx, tFy, 3, 11, 3, 5, OUT);
  rightWallRect(ctx, tFx, tFy, 4, 12, 1, 3, frame % 2 === 0 ? TOXIC_BRIGHT : TOXIC_YELLOW);
  // Pointed scrap roof cone on turret
  for (let dy = 0; dy < 7; dy++) {
    const span = Math.max(1, 5 - (dy >> 1));
    rect(ctx, 24 - span, 22 - dy, span * 2, 1, OUT);
    rect(ctx, 24 - span + 1, 22 - dy, Math.max(1, (span - 1) * 2), 1, dy % 2 === 0 ? RUST_LIGHT : IRON_LIGHT);
  }
  drawSkull(ctx, 24, 14, true);

  // Main two-storey detached manor hall with rich rust-and-gold rivet bands
  const fx = 34, fy = 54, wL = 14, wR = 16, wallH = 15;
  isoBox(ctx, fx, fy, wL, wR, wallH, { top: RUST_TOP, left: WOOD_DARK, right: RUST_MID });
  isoBox(ctx, fx, fy, wL, wR, 3, { top: IRON_TOP, left: IRON_DARK, right: IRON_MID });
  // Rich brass-yellow rivet trim bands
  leftWallRect(ctx, fx, fy, 1, 8, wL - 2, 1, TOXIC_YELLOW);
  rightWallRect(ctx, fx, fy, 1, 8, wR - 2, 1, TOXIC_YELLOW);
  leftWallRect(ctx, fx, fy, 1, wallH - 1, wL - 2, 1, TOXIC_YELLOW);
  rightWallRect(ctx, fx, fy, 1, wallH - 1, wR - 2, 1, TOXIC_YELLOW);

  // Patched corrugated gable roof over the main hall
  for (let u = 0; u <= wL; u++) {
    for (let v = 0; v <= wR; v++) {
      const half = wL >> 1;
      const dist = u < half ? half - u : u - half;
      const rise = Math.max(0, 7 - dist);
      const x = fx - 1 - u + v;
      const y = fy - wallH - ((u + v + 1) >> 1) - rise;
      const isEdge = u === 0 || u === wL || v === 0 || v === wR;
      const col = isEdge ? OUT : (u + v) % 4 === 0 ? IRON_TOP : u < half ? RUST_LIGHT : IRON_MID;
      rect(ctx, x, y, 1, 2, col);
    }
  }

  // Crooked pipe chimney on the right roof slope
  for (let i = 0; i < 8; i++) {
    const shift = i >> 1;
    rect(ctx, 41 + shift, 31 - i, 4, 1, OUT);
    rect(ctx, 42 + shift, 31 - i, 2, 1, IRON_MID);
  }
  disc(ctx, 45, 21 - (frame % 2), 2, TOXIC_MID);

  // Upper floor windows on right and left walls
  for (const v0 of [3, 8, 12]) {
    rightWallRect(ctx, fx, fy, v0, 10, 3, 4, OUT);
    rightWallRect(ctx, fx, fy, v0 + 1, 11, 1, 2, TOXIC_YELLOW);
  }
  for (const u0 of [4, 9]) {
    leftWallRect(ctx, fx, fy, u0, 10, 3, 4, OUT);
    leftWallRect(ctx, fx, fy, u0 + 1, 11, 1, 2, TOXIC_BRIGHT);
  }

  // Covered corrugated front porch on right wall
  isoBox(ctx, 38, 56, 5, 7, 7, { top: IRON_TOP, left: WOOD_DARK, right: WOOD_MID });
  rightWallRect(ctx, 38, 56, 2, 1, 3, 5, OUT);
  rightWallRect(ctx, 38, 56, 3, 1, 1, 4, TOXIC_YELLOW);

  // Low scrap-iron garden wall enclosing the front yard + green gate torch
  isoBox(ctx, 32, 60, 13, 2, 4, { top: IRON_LIGHT, left: IRON_DARK, right: RUST_MID });
  isoBox(ctx, 45, 54, 2, 11, 4, { top: IRON_LIGHT, left: IRON_DARK, right: IRON_MID });
  drawGreenTorch(ctx, 34, 60, 6, frame);

  return canvas;
}

/**
 * GOBLIN STALL: Low open booth (~0.6 tile tall) with a rusty-orange & sickly-green striped
 * corrugated awning and scavenged gears & potions on a patched counter.
 */
function buildGoblinStall(): HTMLCanvasElement {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  // Compact muddy pad keeping total height low (~0.6 tile, y = 35..58)
  isoDiamond(ctx, 32, 49, 23, MUD_DARK, OUT);
  isoDiamond(ctx, 32, 49, 18, MUD_MID, BOG_DARK);

  // Low patched plank-and-iron counter in the center
  const fx = 33, fy = 55, wL = 12, wR = 14;
  isoBox(ctx, fx, fy, wL, wR, 5, { top: WOOD_TOP, left: WOOD_DARK, right: RUST_MID });
  rightWallRect(ctx, fx, fy, 2, 1, 4, 3, IRON_MID);
  leftWallRect(ctx, fx, fy, 3, 1, 4, 3, RUST_DARK);

  // Goods on the counter: shiny brass gears, glowing green bottles, and bone trinkets
  rect(ctx, 29, 47, 3, 2, TOXIC_YELLOW);
  px(ctx, 30, 46, IRON_TOP);
  rect(ctx, 34, 47, 2, 3, TOXIC_BRIGHT);
  px(ctx, 34, 46, BONE_LIGHT);
  rect(ctx, 38, 45, 3, 2, RUST_TOP);
  px(ctx, 39, 44, TOXIC_YELLOW);

  // Four short crooked iron-pipe poles supporting the low striped awning
  for (const [px0, py0] of [
    [22, 49],
    [32, 54],
    [45, 47],
    [35, 42],
  ] as const) {
    rect(ctx, px0, py0 - 9, 2, 9, OUT);
    rect(ctx, px0, py0 - 8, 1, 7, IRON_LIGHT);
  }

  // Low striped awning in rusty orange & sickly bog-green (y = 35..45)
  for (let u = 0; u < wL + 2; u++) {
    for (let v = 0; v < wR + 2; v++) {
      const stripe = ((v >> 1) & 1) === 0;
      const x = fx - u + v;
      const y = fy - 10 - ((u + v) >> 1);
      const isEdge = u === 0 || u === wL + 1 || v === 0 || v === wR + 1;
      const col = isEdge ? OUT : stripe ? RUST_TOP : TOXIC_DEEP;
      rect(ctx, x, y, 1, 2, col);
    }
  }
  // Tiny green lamp dangling from front-right corner of the stall
  rect(ctx, 45, 40, 2, 3, OUT);
  px(ctx, 45, 41, TOXIC_BRIGHT);

  return canvas;
}

/**
 * GOBLIN TAVERN: Two-storey ramshackle "Grog & Gear Inn" with overhanging upper storey,
 * warm lit windows, swinging foaming-mug sign, crooked chimney, and leaky barrels by the door.
 */
function buildGoblinTavern(frame: number): HTMLCanvasElement {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  isoDiamond(ctx, 32, 48, 28, MUD_DARK, OUT);
  isoDiamond(ctx, 32, 48, 24, MUD_MID, BOG_DARK);

  const fx = 31, fy = 56, wL = 15, wR = 18;
  // Ground storey: riveted iron & plank walls (h = 8)
  isoBox(ctx, fx, fy, wL, wR, 8, { top: WOOD_TOP, left: IRON_DARK, right: WOOD_MID });
  // Overhanging second storey: rusted corrugated sheets & timber (h = 8)
  isoBox(ctx, fx, fy - 8, wL + 1, wR + 1, 8, { top: RUST_TOP, left: WOOD_DARK, right: RUST_MID });
  // Iron girder belt band between floors
  isoBox(ctx, fx, fy - 7, wL + 1, wR + 1, 2, { top: IRON_TOP, left: IRON_DARK, right: IRON_MID });

  // Steep patched corrugated roof with sagging ridge
  for (let u = -1; u <= wL + 1; u++) {
    for (let v = -1; v <= wR + 1; v++) {
      const half = (wL + 1) >> 1;
      const dist = u < half ? half - u : u - half;
      const rise = Math.max(0, 7 - dist);
      const sag = v > 5 && v < 13 ? 1 : 0;
      const x = fx - 1 - u + v;
      const y = fy - 16 - ((u + v + 1) >> 1) - rise + sag;
      const isEdge = u === -1 || u === wL + 1 || v === -1 || v === wR + 1;
      const col = isEdge ? OUT : (u + v) % 4 === 0 ? IRON_TOP : u < half ? RUST_LIGHT : WOOD_DARK;
      rect(ctx, x, y, 1, 2, col);
    }
  }

  // Crooked stovepipe chimney on back-left roof slope
  for (let i = 0; i < 7; i++) {
    rect(ctx, 24 - (i >> 1), 28 - i, 3, 1, OUT);
    px(ctx, 25 - (i >> 1), 28 - i, IRON_LIGHT);
  }

  // Arched tavern door on the right wall
  rightWallRect(ctx, fx, fy, 3, 1, 5, 6, OUT);
  rightWallRect(ctx, fx, fy, 4, 1, 3, 5, RUST_DARK);
  px(ctx, fx + 6, fy - 4, TOXIC_YELLOW);

  // Warm lit windows on both storeys (amber-yellow & toxic-green glow)
  const warmA = frame % 2 === 0 ? TOXIC_YELLOW : '#ffb74d';
  const warmB = frame % 2 === 0 ? '#ffb74d' : TOXIC_BRIGHT;
  rightWallRect(ctx, fx, fy, 10, 2, 5, 4, OUT);
  rightWallRect(ctx, fx, fy, 11, 3, 3, 2, warmA);
  for (const v0 of [3, 9, 14]) {
    rightWallRect(ctx, fx, fy, v0, 10, 4, 4, OUT);
    rightWallRect(ctx, fx, fy, v0 + 1, 11, 2, 2, warmB);
  }
  for (const u0 of [3, 9]) {
    leftWallRect(ctx, fx, fy, u0, 2, 4, 4, OUT);
    leftWallRect(ctx, fx, fy, u0 + 1, 3, 2, 2, warmB);
    leftWallRect(ctx, fx, fy, u0, 10, 4, 4, OUT);
    leftWallRect(ctx, fx, fy, u0 + 1, 11, 2, 2, warmA);
  }

  // Projecting iron pipe bracket on right corner with a hanging foaming-mug sign
  rect(ctx, 47, 36, 8, 2, OUT);
  rect(ctx, 48, 36, 6, 1, IRON_TOP);
  const swing = frame % 2;
  rect(ctx, 51 + swing, 38, 5, 6, OUT);
  rect(ctx, 52 + swing, 40, 3, 3, TOXIC_YELLOW);
  rect(ctx, 52 + swing, 39, 3, 1, BONE_LIGHT); // white foam head on mug

  // Two iron-hooped grog barrels beside the door with a green puddle
  for (const [bx, by] of [
    [39, 56],
    [43, 54],
  ] as const) {
    isoBox(ctx, bx, by, 4, 4, 4, { top: WOOD_TOP, left: WOOD_DARK, right: WOOD_LIGHT });
    rightWallRect(ctx, bx, by, 0, 2, 4, 1, IRON_MID);
  }
  px(ctx, 40, 56, TOXIC_BRIGHT);

  return canvas;
}

/**
 * GOBLIN BANK: Lopsided riveted iron safe-house with pipe columns, heavy round vault wheel,
 * a GIANT PADLOCK chained to the front, and a notched gold coin sign on the roof!
 */
function buildGoblinBank(): HTMLCanvasElement {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  isoDiamond(ctx, 32, 48, 29, IRON_DARK, OUT);
  isoDiamond(ctx, 32, 48, 25, MUD_DARK, IRON_MID);

  // Lower tier: heavy riveted iron strongbox hall
  const fx = 32, fy = 56, wL = 16, wR = 16;
  isoBox(ctx, fx, fy, wL, wR, 11, { top: IRON_TOP, left: IRON_DARK, right: IRON_MID });
  isoBox(ctx, fx, fy, wL, wR, 2, { top: RUST_TOP, left: RUST_DARK, right: RUST_MID });

  // Upper tier: shifted LEFT by 3px so the iron safe-house is visibly LOPSIDED!
  const uFx = 29, uFy = 45;
  isoBox(ctx, uFx, uFy, 14, 15, 8, { top: IRON_TOP, left: IRON_DARK, right: RUST_MID });
  isoBox(ctx, uFx, uFy - 7, 15, 16, 2, { top: TOXIC_YELLOW, left: RUST_DARK, right: RUST_LIGHT });

  // Rivet studs dotting the left wall of the safe
  for (const z of [4, 9]) {
    for (const u of [3, 7, 11]) {
      leftWallRect(ctx, fx, fy, u, z, 1, 1, IRON_TOP);
    }
  }

  // Two thick riveted iron pipe-columns flanking the right facade
  for (const vCol of [1, 13]) {
    rightWallRect(ctx, fx, fy, vCol, 2, 2, 9, OUT);
    rightWallRect(ctx, fx, fy, vCol, 2, 1, 9, IRON_TOP);
  }

  // Heavy circular bank vault door with spoked wheel on right wall
  disc(ctx, 38, 47, 5, OUT);
  disc(ctx, 38, 47, 4, IRON_LIGHT);
  disc(ctx, 38, 47, 2, IRON_DARK);
  px(ctx, 38, 47, TOXIC_YELLOW);

  // GIANT PADLOCK hanging prominently on the front-right corner of the safe-house
  const pX = 44, pY = 44;
  // Padlock iron shackle loop
  rect(ctx, pX - 2, pY - 5, 6, 5, OUT);
  rect(ctx, pX - 1, pY - 4, 4, 4, IRON_TOP);
  rect(ctx, pX, pY - 3, 2, 3, IRON_DARK);
  // Padlock brass/gold body with dark keyhole
  rect(ctx, pX - 3, pY - 1, 8, 8, OUT);
  rect(ctx, pX - 2, pY, 6, 6, TOXIC_YELLOW);
  rect(ctx, pX - 2, pY, 2, 6, RUST_LIGHT);
  rect(ctx, pX, pY + 2, 2, 3, OUT); // keyhole

  // Giant notched Gold Coin sign mounted atop the lopsided safe roof
  disc(ctx, 31, 27, 5, OUT);
  disc(ctx, 31, 27, 4, TOXIC_YELLOW);
  disc(ctx, 31, 27, 3, RUST_TOP);
  rect(ctx, 30, 25, 2, 5, TOXIC_YELLOW);

  return canvas;
}

/**
 * GOBLIN LIBRARY: Modest riveted-tin & plank Scroll-Archive Hall with barrel-corrugated roof,
 * tall green-lit lancet windows, and an open book/scroll signboard above the door.
 */
function buildGoblinLibrary(): HTMLCanvasElement {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  isoDiamond(ctx, 32, 48, 27, MUD_DARK, OUT);
  isoDiamond(ctx, 32, 48, 22, MUD_MID, BOG_DARK);

  const fx = 32, fy = 56, wL = 14, wR = 18, wallH = 12;
  isoBox(ctx, fx, fy, wL, wR, wallH, { top: WOOD_TOP, left: WOOD_DARK, right: RUST_MID });
  isoBox(ctx, fx, fy, wL, wR, 2, { top: IRON_LIGHT, left: IRON_DARK, right: IRON_MID });

  // Rounded quonset-style corrugated tin roof over the archive hall
  for (let u = 0; u < wL; u++) {
    for (let v = 0; v < wR; v++) {
      const arch = u >= 2 && u <= wL - 3 ? 3 : u >= 1 && u <= wL - 2 ? 2 : 1;
      const x = fx - 1 - u + v;
      const y = fy - wallH - ((u + v + 1) >> 1) - arch;
      const isEdge = u === 0 || u === wL - 1 || v === 0 || v === wR - 1;
      const col = isEdge ? OUT : v % 3 === 0 ? IRON_TOP : IRON_MID;
      rect(ctx, x, y, 1, 2, col);
    }
  }

  // Entrance door on front-right
  rightWallRect(ctx, fx, fy, 2, 1, 4, 7, OUT);
  rightWallRect(ctx, fx, fy, 3, 1, 2, 6, WOOD_DARK);

  // Three tall green-lit archive windows on the right wall + two on the left wall
  for (const v0 of [7, 11, 15]) {
    rightWallRect(ctx, fx, fy, v0, 3, 3, 8, OUT);
    rightWallRect(ctx, fx, fy, v0 + 1, 4, 1, 6, TOXIC_MID);
    rightWallRect(ctx, fx, fy, v0 + 1, 7, 1, 2, TOXIC_YELLOW);
  }
  for (const u0 of [4, 9]) {
    leftWallRect(ctx, fx, fy, u0, 3, 3, 8, OUT);
    leftWallRect(ctx, fx, fy, u0 + 1, 4, 1, 6, TOXIC_DEEP);
    leftWallRect(ctx, fx, fy, u0 + 1, 6, 1, 2, TOXIC_BRIGHT);
  }

  // Large open Book / Scroll signboard mounted over the front-right roof edge
  isoBox(ctx, 36, 40, 3, 8, 5, { top: BONE_LIGHT, left: WOOD_DARK, right: BONE_MID });
  rightWallRect(ctx, 36, 40, 3, 1, 1, 4, RUST_DARK); // book spine center line
  rightWallRect(ctx, 36, 40, 1, 3, 2, 1, TOXIC_DEEP);
  rightWallRect(ctx, 36, 40, 5, 2, 2, 1, RUST_MID);

  return canvas;
}

/**
 * GOBLIN ACADEMY: The tallest Goblin service building!
 * Walled tinker courtyard, wide riveted lecture hall, giant patched iron/copper dome,
 * towering crooked lightning-spire reaching y=5, and ragged green-and-rust banners.
 */
function buildGoblinAcademy(frame: number): HTMLCanvasElement {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  // Flagged courtyard with iron scrap plates
  isoDiamond(ctx, 32, 48, 29, MUD_DARK, OUT);
  isoDiamond(ctx, 32, 48, 25, IRON_DARK, RUST_MID);
  isoDiamond(ctx, 32, 48, 20, MUD_MID, BOG_DARK);

  // Broad riveted iron & rust lecture hall base
  const fx = 32, fy = 55;
  isoBox(ctx, fx, fy, 18, 18, 11, { top: RUST_TOP, left: IRON_DARK, right: RUST_MID });
  isoBox(ctx, fx, fy - 9, 19, 19, 2, { top: IRON_TOP, left: IRON_DARK, right: IRON_LIGHT });

  // Upper octagonal-feeling scrap-tower drum
  isoBox(ctx, 32, 44, 12, 12, 11, { top: IRON_LIGHT, left: WOOD_DARK, right: IRON_MID });

  // Long ragged green-and-rust banners hanging on both faces of the academy
  rightWallRect(ctx, 32, 55, 4, 2, 4, 8, OUT);
  rightWallRect(ctx, 32, 55, 5, 3, 2, 6, TOXIC_DEEP);
  rightWallRect(ctx, 32, 55, 5, 6, 2, 2, TOXIC_YELLOW);
  leftWallRect(ctx, 32, 55, 4, 2, 4, 8, OUT);
  leftWallRect(ctx, 32, 55, 5, 3, 2, 6, RUST_LIGHT);
  leftWallRect(ctx, 32, 55, 5, 6, 2, 2, TOXIC_BRIGHT);

  // Giant patched copper & iron observatory dome atop the drum
  disc(ctx, 32, 25, 8, OUT);
  disc(ctx, 32, 25, 7, RUST_MID);
  disc(ctx, 30, 23, 5, BOG_LIGHT);
  disc(ctx, 34, 24, 4, IRON_LIGHT);

  // Towering crooked lightning-rod & alchemy coil spire reaching y = 5
  for (let i = 0; i < 13; i++) {
    const bend = (i >> 2) % 2 === 0 ? 0 : 1;
    rect(ctx, 31 + bend, 17 - i, 3, 1, OUT);
    px(ctx, 32 + bend, 17 - i, i % 3 === 0 ? TOXIC_YELLOW : IRON_TOP);
  }
  // Crackling toxic-green & yellow lightning orb at the very peak
  const spark = frame % 2;
  disc(ctx, 32, 5, 2, TOXIC_DEEP);
  px(ctx, 32, 5, TOXIC_YELLOW);
  px(ctx, 29 + spark, 4, TOXIC_BRIGHT);
  px(ctx, 35 - spark, 6, TOXIC_YELLOW);

  // Courtyard green lamps flanking the front entrance
  drawGreenTorch(ctx, 21, 55, 6, frame);
  drawGreenTorch(ctx, 43, 55, 6, frame + 1);

  return canvas;
}

/**
 * GOBLIN CLINIC: Clean-ish pale whitewashed bone-plaster & tin "Sawbones Clinic"
 * with a bright green healing cross symbol, crooked vent pipe, and rusted tin herb pots.
 */
function buildGoblinClinic(): HTMLCanvasElement {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  isoDiamond(ctx, 32, 48, 27, MUD_DARK, OUT);
  isoDiamond(ctx, 32, 48, 23, BONE_SHADOW, BOG_DARK);

  const fx = 32, fy = 55, wL = 15, wR = 16, wallH = 13;
  // Pale bone-plaster & bleached tin walls (distinct clean pale look)
  isoBox(ctx, fx, fy, wL, wR, wallH, { top: BONE_LIGHT, left: BONE_SHADOW, right: BONE_MID });
  // Iron foundation & riveted roof rim
  isoBox(ctx, fx, fy, wL, wR, 2, { top: IRON_TOP, left: IRON_DARK, right: IRON_MID });
  isoBox(ctx, fx, fy - wallH + 2, wL + 1, wR + 1, 2, { top: IRON_TOP, left: IRON_DARK, right: IRON_LIGHT });

  // Flat patched tin roof with a crooked green-fume vent pipe
  isoDiamond(ctx, 32, 34, 11, IRON_MID, OUT);
  rect(ctx, 27, 25, 3, 9, OUT);
  rect(ctx, 28, 26, 1, 7, RUST_LIGHT);
  px(ctx, 28, 23, TOXIC_BRIGHT);

  // Bold green Healing Cross painted on the right wall
  rightWallRect(ctx, fx, fy, 9, 4, 5, 7, OUT);
  rightWallRect(ctx, fx, fy, 11, 5, 1, 5, TOXIC_BRIGHT);
  rightWallRect(ctx, fx, fy, 10, 7, 3, 1, TOXIC_BRIGHT);

  // Clinic door & clean window
  rightWallRect(ctx, fx, fy, 3, 1, 4, 7, OUT);
  rightWallRect(ctx, fx, fy, 4, 1, 2, 6, WOOD_MID);
  leftWallRect(ctx, fx, fy, 5, 4, 5, 5, OUT);
  leftWallRect(ctx, fx, fy, 6, 5, 3, 3, TOXIC_YELLOW);

  // Three rusted tin-can herb pots along the front growing glowing green swamp-herbs
  for (const [px0, py0] of [
    [23, 54],
    [37, 57],
    [43, 54],
  ] as const) {
    isoBox(ctx, px0, py0, 4, 4, 3, { top: RUST_TOP, left: RUST_DARK, right: RUST_MID });
    rect(ctx, px0 - 1, py0 - 6, 3, 2, TOXIC_DEEP);
    px(ctx, px0, py0 - 7, TOXIC_BRIGHT);
    px(ctx, px0 + 1, py0 - 5, TOXIC_YELLOW);
  }

  return canvas;
}

/**
 * GOBLIN WORKSHOP: Open-yard Gear Factory that makes the Goblins' special `gears` good!
 * Features a giant spinning cog wheel (3 frames), a tool bench, crates overflowing with gears,
 * a back-left shed with crooked chimney, and a scrap jib crane.
 */
function buildGoblinWorkshop(frame: number): HTMLCanvasElement {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  isoDiamond(ctx, 32, 48, 28, IRON_DARK, OUT);
  isoDiamond(ctx, 32, 48, 24, MUD_MID, IRON_MID);

  // Back-left corrugated gear-stamping shed + crooked chimney
  const fx = 26, fy = 49;
  isoBox(ctx, fx, fy, 10, 11, 10, { top: RUST_TOP, left: IRON_DARK, right: RUST_MID });
  for (let i = 0; i < 9; i++) {
    rect(ctx, 21 - (i >> 2), 33 - i, 4, 1, OUT);
    rect(ctx, 22 - (i >> 2), 33 - i, 2, 1, IRON_MID);
  }
  disc(ctx, 20, 22 - (frame % 3), 2, TOXIC_MID);

  // Scrap-timber jib crane mounted beside the shed
  rect(ctx, 30, 24, 2, 14, OUT);
  rect(ctx, 30, 25, 1, 12, WOOD_LIGHT);
  rect(ctx, 30, 24, 9, 2, OUT);
  rect(ctx, 31, 24, 7, 1, RUST_LIGHT);
  rect(ctx, 37, 26, 1, 6 + (frame % 2), IRON_TOP);

  // GIANT SPINNING COG WHEEL mounted on an iron A-frame in the center of the yard (3 frames)
  const gCx = 35, gCy = 44;
  disc(ctx, gCx, gCy, 6, OUT);
  disc(ctx, gCx, gCy, 5, IRON_LIGHT);
  disc(ctx, gCx, gCy, 3, RUST_MID);
  disc(ctx, gCx, gCy, 1, TOXIC_YELLOW);
  // 3-frame rotating gear teeth around the circumference
  const teethOffsets: readonly (readonly (readonly [number, number])[])[] = [
    [[0, -7], [7, 0], [0, 7], [-7, 0], [5, -5], [-5, 5]],
    [[3, -7], [7, 3], [-3, 7], [-7, -3], [6, -3], [-6, 3]],
    [[-3, -7], [7, -3], [3, 7], [-7, 3], [5, 5], [-5, -5]],
  ];
  for (const [dx, dy] of teethOffsets[frame % 3]!) {
    rect(ctx, gCx + dx - 1, gCy + dy - 1, 2, 2, OUT);
    px(ctx, gCx + dx, gCy + dy, IRON_TOP);
  }

  // Work yard tool bench in front-left with vise, hammer, and green oil lamp
  isoBox(ctx, 25, 56, 8, 4, 4, { top: WOOD_TOP, left: WOOD_DARK, right: WOOD_MID });
  rect(ctx, 22, 50, 3, 2, IRON_TOP);
  px(ctx, 25, 50, TOXIC_BRIGHT);

  // Crates of freshly forged shiny GEARS in the front-right yard
  isoBox(ctx, 44, 55, 6, 6, 4, { top: WOOD_LIGHT, left: WOOD_DARK, right: RUST_MID });
  disc(ctx, 43, 49, 2, TOXIC_YELLOW);
  px(ctx, 43, 49, OUT);
  disc(ctx, 46, 50, 2, IRON_TOP);
  px(ctx, 46, 50, OUT);

  return canvas;
}

export const art: ArcArt = {
  ground: (parity, variant) => buildGoblinGround(parity, variant),
  foundation: () => buildGoblinFoundation(),
  citizen: (frame, variant) => buildGoblinCitizen(frame, variant),
  buildings: {
    house: () => [buildGoblinHouse(0), buildGoblinHouse(1)],
    shop: () => [buildGoblinShop(0), buildGoblinShop(1)],
    barracks: () => [buildGoblinBarracks(0), buildGoblinBarracks(1)],
    tower: () => [buildGoblinTower(0), buildGoblinTower(1)],
    farm: () => [buildGoblinFarm()],
    school: () => [buildGoblinSchool(0), buildGoblinSchool(1)],
    factory: () => [buildGoblinFactory(0), buildGoblinFactory(1), buildGoblinFactory(2)],
    lumber: () => [buildGoblinLumber(0), buildGoblinLumber(1)],
    mine: () => [buildGoblinMine(0), buildGoblinMine(1)],
    park: () => [buildGoblinPark(0), buildGoblinPark(1)],
    tree: () => [buildGoblinTree(0), buildGoblinTree(1)],
    lamp: () => [buildGoblinLamp(0), buildGoblinLamp(1)],
    fountain: () => [buildGoblinFountain(0), buildGoblinFountain(1)],
    statue: () => [buildGoblinStatue()],
    rowhouse: () => [buildGoblinRowhouse(0), buildGoblinRowhouse(1)],
    manor: () => [buildGoblinManor(0), buildGoblinManor(1)],
    stall: () => [buildGoblinStall()],
    tavern: () => [buildGoblinTavern(0), buildGoblinTavern(1)],
    bank: () => [buildGoblinBank()],
    library: () => [buildGoblinLibrary()],
    academy: () => [buildGoblinAcademy(0), buildGoblinAcademy(1)],
    clinic: () => [buildGoblinClinic()],
    workshop: () => [buildGoblinWorkshop(0), buildGoblinWorkshop(1), buildGoblinWorkshop(2)],
  },
};
