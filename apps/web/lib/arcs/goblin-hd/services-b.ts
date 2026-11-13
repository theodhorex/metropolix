// Goblin HD buildings: services-b (drawn by a worker, see .agy/tasks). Kinds left out fall back to the 1x goblin art.
import type { BuildingKind } from '@metropolix/sim';
import {
  G,
  MOSS,
  STONE,
  WOOD,
  DAUB,
  IRON,
  banner,
  barrel,
  box,
  brickWalls,
  bush,
  canvasHD,
  chimney,
  crate,
  disc,
  doorR,
  gear,
  groundShadow,
  plankWalls,
  rivets,
  roof,
  scrap,
  smoke,
  stakes,
  timberFrame,
  windowL,
  windowR,
} from './kit';
import {
  isoDiamond,
  isoPitchedRoof,
  leftWallRect,
  px,
  rect,
  rightWallRect,
} from '../../sprites';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Mini goblin skull emblem for scarecrows, banners, and theater masks */
function miniSkull(ctx: CanvasRenderingContext2D, cx: number, cy: number, horned = false) {
  disc(ctx, cx, cy, 3, G.out);
  disc(ctx, cx, cy, 2, G.bone);
  rect(ctx, cx - 1, cy + 2, 3, 2, G.out);
  rect(ctx, cx, cy + 2, 2, 1, G.bone);
  px(ctx, cx - 1, cy, G.out);
  px(ctx, cx + 1, cy, G.out);
  if (horned) {
    px(ctx, cx - 3, cy - 2, G.boneShade);
    px(ctx, cx - 4, cy - 3, G.bone);
    px(ctx, cx + 3, cy - 2, G.boneShade);
    px(ctx, cx + 4, cy - 3, G.bone);
  }
}

// ---------------------------------------------------------------------------
// 1. GARDEN (Services, height 0.4, scrubs 3 smoke)
// ---------------------------------------------------------------------------
/**
 * A goblin flower garden: cobblestone walkways leading to a carved stone water basin,
 * two raised flowerbeds (one stone-walled, one timber-framed) brimming with smoke-scrubbing
 * blooms, an overgrown floral timber trellis arch, a quirky goblin scarecrow,
 * watering barrel, seed crates, and animated floating pollen spores / butterflies.
 */
function drawGarden(frame: number): HTMLCanvasElement {
  const [cv, ctx] = canvasHD();

  // --- Cobblestone walking paths ---
  const pathTiles: [number, number, number, number][] = [
    // Main entrance path from front-center toward center
    [62, 116, 5, 3], [60, 112, 6, 3], [62, 108, 6, 3], [61, 104, 6, 3],
    [59, 100, 6, 3], [62, 96, 6, 3],
    // Left branch leading to scarecrow & west bed
    [54, 103, 5, 2], [48, 101, 5, 2], [42, 99, 5, 2], [36, 97, 5, 2],
    // Right branch leading to water barrel & east bed
    [69, 103, 5, 2], [75, 101, 5, 2], [81, 99, 5, 2], [87, 97, 5, 2],
    // Back arbor path
    [62, 91, 5, 2], [62, 87, 5, 2], [62, 83, 5, 2],
  ];
  for (const [px0, py0, w, h] of pathTiles) {
    rect(ctx, px0 - 1, py0 - 1, w + 2, h + 2, G.cobbleDark);
    rect(ctx, px0, py0, w, h, (px0 + py0) % 2 ? G.cobble : G.cobbleLight);
    px(ctx, px0 + w - 1, py0, G.stoneTop);
  }

  // --- Left Raised Flowerbed: Stone Border ---
  const b1Fx = 48, b1Fy = 106, b1L = 20, b1R = 14, b1H = 5;
  groundShadow(ctx, b1Fx, b1Fy, b1L, b1R, 6);
  box(ctx, b1Fx, b1Fy, b1L, b1R, b1H, STONE);
  brickWalls(ctx, b1Fx, b1Fy, b1L, b1R, b1H, 3, 5);
  // Rich soil inside left bed
  isoDiamond(ctx, b1Fx - 3, b1Fy - b1H - 7, 8, '#2e1d10');

  // Left bed flowers: tall smoke-scrubbing Moonleaf and Purple Bellflowers
  const leftFlowers = [
    // [x, yBase, stemH, petalCol, centerCol]
    [32, 94, 7, '#68c8e8', '#ffd440'],
    [36, 92, 9, '#bf82ee', '#ffffff'],
    [40, 95, 6, '#e85a70', '#ffd440'],
    [43, 91, 8, '#68c8e8', '#ffd440'],
    [46, 96, 7, '#9a5cd0', '#fff0b8'],
    [38, 97, 5, '#f07820', '#ffd440'],
    [34, 99, 6, '#bf82ee', '#fff0b8'],
  ] as const;
  for (const [flX, flY, stemH, petalCol, centerCol] of leftFlowers) {
    // Green leafy stem
    rect(ctx, flX, flY - stemH, 1, stemH, G.grassDark);
    px(ctx, flX - 1, flY - (stemH >> 1), G.leaf);
    px(ctx, flX + 1, flY - (stemH >> 1) + 1, G.leafLight);
    // Petal cluster
    rect(ctx, flX - 2, flY - stemH - 2, 5, 5, G.out);
    rect(ctx, flX - 1, flY - stemH - 1, 3, 3, petalCol);
    px(ctx, flX, flY - stemH, centerCol);
  }

  // --- Right Raised Flowerbed: Dark Timber Border ---
  const b2Fx = 80, b2Fy = 106, b2L = 14, b2R = 20, b2H = 5;
  groundShadow(ctx, b2Fx, b2Fy, b2L, b2R, 6);
  box(ctx, b2Fx, b2Fy, b2L, b2R, b2H, WOOD);
  plankWalls(ctx, b2Fx, b2Fy, b2L, b2R, b2H, 3);
  // Rich soil inside right bed
  isoDiamond(ctx, b2Fx + 3, b2Fy - b2H - 7, 8, '#2e1d10');

  // Right bed flowers: Alchemical Toxic-Cleansers and Orange Snapdragons
  const rightFlowers = [
    [72, 96, 8, G.toxicLight, G.toxic],
    [76, 93, 10, '#f07820', '#fff0b8'],
    [80, 97, 6, '#ffd440', '#de7a44'],
    [83, 92, 9, G.toxicLight, '#ffffff'],
    [87, 95, 7, '#e85a70', '#ffd440'],
    [75, 99, 5, '#f07820', '#ffd440'],
    [85, 98, 6, G.toxicLight, G.toxic],
  ] as const;
  for (const [flX, flY, stemH, petalCol, centerCol] of rightFlowers) {
    rect(ctx, flX, flY - stemH, 1, stemH, G.grassDark);
    px(ctx, flX - 1, flY - (stemH >> 1), G.leaf);
    px(ctx, flX + 1, flY - (stemH >> 1) + 1, G.leafLight);
    rect(ctx, flX - 2, flY - stemH - 2, 5, 5, G.out);
    rect(ctx, flX - 1, flY - stemH - 1, 3, 3, petalCol);
    px(ctx, flX, flY - stemH, centerCol);
  }

  // --- Central Carved Stone Water Basin / Fountain ---
  const fX = 64, fY = 96;
  // Pedestal
  box(ctx, fX, fY, 8, 8, 5, STONE);
  // Upper wide water bowl
  const bowlY = fY - 5;
  disc(ctx, fX, bowlY - 2, 8, G.out);
  disc(ctx, fX, bowlY - 2, 7, G.stoneTop);
  disc(ctx, fX, bowlY - 3, 5, '#3a789c');
  // Water surface shimmer (animated across 3 frames)
  disc(ctx, fX, bowlY - 3, 4, frame === 0 ? '#54b4d8' : frame === 1 ? '#68c8e8' : '#4aa0c8');
  px(ctx, fX - 1, bowlY - 4, '#ffffff'); // sun highlight
  if (frame === 1) px(ctx, fX + 1, bowlY - 2, '#ffffff');

  // --- Back Flowering Trellis / Timber Arbor ---
  const arbX = 64, arbY = 82;
  // Two timber support poles
  rect(ctx, arbX - 9, arbY - 18, 2, 18, G.out);
  rect(ctx, arbX - 8, arbY - 17, 1, 17, G.woodR);
  rect(ctx, arbX + 7, arbY - 18, 2, 18, G.out);
  rect(ctx, arbX + 8, arbY - 17, 1, 17, G.woodR);
  // Overhead arched crossbeam
  rect(ctx, arbX - 11, arbY - 20, 22, 3, G.out);
  rect(ctx, arbX - 10, arbY - 19, 20, 1, G.woodLight);
  rect(ctx, arbX - 8, arbY - 22, 16, 2, G.out);
  rect(ctx, arbX - 7, arbY - 21, 14, 1, G.woodTop);
  // Lush flowering climber vines covering the arbor
  for (const [vx, vy] of [
    [arbX - 8, arbY - 14], [arbX - 7, arbY - 8], [arbX - 9, arbY - 18],
    [arbX + 7, arbY - 13], [arbX + 8, arbY - 7], [arbX + 6, arbY - 18],
    [arbX - 4, arbY - 21], [arbX, arbY - 22], [arbX + 4, arbY - 20],
  ] as const) {
    disc(ctx, vx, vy, 2, G.leafDark);
    px(ctx, vx, vy, G.leafLight);
    // tiny red/pink climber roses
    px(ctx, vx + 1, vy - 1, '#f06888');
  }

  // --- Goblin Scarecrow (East side, guarding the blooms) ---
  const scX = 26, scY = 98;
  rect(ctx, scX - 1, scY - 16, 2, 16, G.out);
  rect(ctx, scX, scY - 15, 1, 15, G.woodR);
  // Crossbar arms & straw cuffs
  rect(ctx, scX - 6, scY - 12, 12, 2, G.out);
  rect(ctx, scX - 5, scY - 11, 10, 1, G.woodLight);
  px(ctx, scX - 6, scY - 11, G.woodLight);
  px(ctx, scX + 5, scY - 11, G.woodLight);
  // Patched goblin burlap tunic
  rect(ctx, scX - 3, scY - 10, 6, 6, G.out);
  rect(ctx, scX - 2, scY - 9, 4, 5, G.bannerDark);
  px(ctx, scX - 1, scY - 8, G.rustLight); // patch
  // Horned mini goblin skull head
  miniSkull(ctx, scX, scY - 15, true);

  // --- Garden Props: Water Barrel, Tool Crate, Fences, Bushes ---
  barrel(ctx, 92, 98, false);
  // Wooden watering can next to barrel
  rect(ctx, 96, 97, 4, 3, G.out);
  rect(ctx, 97, 98, 2, 2, G.ironTop);
  px(ctx, 99, 96, G.ironTop); // spout

  // Tool / seed crate on right foreground
  crate(ctx, 72, 114, 6);

  // Low decorative fence stakes along front left & right
  stakes(ctx, 40, 56, 112, 0.5, 6);
  stakes(ctx, 72, 88, 120, -0.5, 6);

  // Lush garden border shrubbery
  bush(ctx, 20, 94, 4);
  bush(ctx, 25, 90, 3);
  bush(ctx, 102, 94, 4);
  bush(ctx, 98, 88, 3);
  bush(ctx, 64, 76, 5); // behind arbor

  // --- Animated Pollen Spores & Butterflies (3 frames) ---
  // Gentle floating pollen drifting upward from smoke-scrubbing blooms
  const spores = [
    [36, 86, 0], [42, 83, 1], [46, 87, 2],
    [74, 85, 2], [78, 82, 0], [84, 86, 1],
    [64, 88, 1],
  ] as const;
  for (const [sx, sy, phase] of spores) {
    const fOffset = (frame + phase) % 3;
    const curX = sx + (fOffset === 1 ? 1 : fOffset === 2 ? -1 : 0);
    const curY = sy - fOffset * 2;
    px(ctx, curX, curY, fOffset === 0 ? G.glowHot : G.glow);
  }
  // A colorful yellow/orange garden butterfly fluttering around fountain
  const bFlyX = 58 + frame * 3;
  const bFlyY = 90 - (frame === 1 ? 3 : 0);
  px(ctx, bFlyX - 1, bFlyY - 1, '#ffd440');
  px(ctx, bFlyX + 1, bFlyY - 1, '#f07820');
  px(ctx, bFlyX, bFlyY, G.out);

  return cv;
}

// ---------------------------------------------------------------------------
// 2. THEATER (Services, height 1.5, big cheer)
// ---------------------------------------------------------------------------
/**
 * A goblin playhouse and amphitheater: curved rustic log benches for spectators,
 * a raised timber stage deck with spiked railings, an arched proscenium playhouse
 * draped with rich red stage curtains, twin goblin comedy & tragedy masks mounted
 * on the lintel, a moss-shingled roof with a waving banner, backstage prop crates,
 * and animated flickering flame footlights along the stage apron.
 */
function drawTheater(frame: number): HTMLCanvasElement {
  const [cv, ctx] = canvasHD();

  // --- Foreground: Cobblestones and Spectator Log Benches ---
  const fx = 64, fy = 114, wL = 36, wR = 36;
  groundShadow(ctx, fx, fy, wL, wR, 12);

  // Audience ground cobblestones
  for (const [cx0, cy0] of [
    [52, 118], [58, 120], [64, 122], [70, 120], [76, 118],
    [46, 114], [82, 114],
  ] as const) {
    rect(ctx, cx0 - 2, cy0 - 1, 4, 2, G.cobbleDark);
    rect(ctx, cx0 - 1, cy0, 3, 1, G.cobbleLight);
  }

  // Curved rough-hewn log benches for goblin patrons
  // Left bench
  rect(ctx, 42, 116, 12, 3, G.out);
  rect(ctx, 43, 117, 10, 2, G.woodR);
  rect(ctx, 43, 116, 10, 1, G.woodTop);
  // Log supports
  rect(ctx, 44, 119, 2, 2, G.woodDark);
  rect(ctx, 51, 119, 2, 2, G.woodDark);

  // Center-right bench
  rect(ctx, 72, 116, 12, 3, G.out);
  rect(ctx, 73, 117, 10, 2, G.woodR);
  rect(ctx, 73, 116, 10, 1, G.woodTop);
  rect(ctx, 74, 119, 2, 2, G.woodDark);
  rect(ctx, 81, 119, 2, 2, G.woodDark);

  // Center-front bench
  rect(ctx, 58, 122, 12, 3, G.out);
  rect(ctx, 59, 123, 10, 2, G.woodR);
  rect(ctx, 59, 122, 10, 1, G.woodTop);
  rect(ctx, 60, 125, 2, 2, G.woodDark);
  rect(ctx, 67, 125, 2, 2, G.woodDark);

  // --- Raised Timber Acting Deck / Stage Platform ---
  const stH = 7;
  box(ctx, fx, fy, wL, wR, stH, WOOD);
  plankWalls(ctx, fx, fy, wL, wR, stH, 4);

  // Deck surface wood planks
  const topFy = fy - stH;
  for (let u = 2; u < wL - 2; u += 3) {
    const x = fx - u, y = topFy - (u >> 1);
    px(ctx, x, y, G.woodLight);
  }

  // Stage perimeter spiked wood railings
  for (let u = 4; u < wL - 4; u += 6) {
    leftWallRect(ctx, fx, fy, u, stH, 1, 4, G.woodDark);
    px(ctx, fx - u, topFy - (u >> 1) - 4, G.bone);
  }
  for (let v = 4; v < wR - 4; v += 6) {
    rightWallRect(ctx, fx, fy, v, stH, 1, 4, G.woodR);
    px(ctx, fx + v, topFy - (v >> 1) - 4, G.bone);
  }

  // --- Stage Apron Footlights: Flaming Iron Skulls (Animated 3 frames) ---
  const footlights = [
    [fx - 14, topFy + 6],
    [fx, topFy + 1],
    [fx + 14, topFy + 6],
  ] as const;
  for (let i = 0; i < footlights.length; i++) {
    const [lx, ly] = footlights[i]!;
    // Iron bowl / miniature skull holder
    rect(ctx, lx - 2, ly - 3, 5, 3, G.out);
    rect(ctx, lx - 1, ly - 2, 3, 2, G.ironR);
    // Flickering torch flame (3 frames)
    const flameH = 3 + ((frame + i) % 3);
    const flameCol = ((frame + i) % 2 === 0) ? G.glowHot : G.rustLight;
    rect(ctx, lx - 1, ly - 3 - flameH, 3, flameH, G.out);
    rect(ctx, lx, ly - 2 - flameH, 1, flameH, flameCol);
    px(ctx, lx, ly - 3 - flameH, G.glowHot);
  }

  // --- Backstage Playhouse Building & Proscenium Stage Arch ---
  const pFx = 62, pFy = topFy - 2, pWl = 26, pWr = 26, pH = 22;
  box(ctx, pFx, pFy, pWl, pWr, pH, DAUB);
  timberFrame(ctx, pFx, pFy, pWl, pWr, pH);

  // Proscenium stage opening on right wall
  const archV = 4, archW = 16, archH = 14;
  rightWallRect(ctx, pFx, pFy, archV - 1, 0, archW + 2, archH + 2, G.out);
  // Dark interior depth
  rightWallRect(ctx, pFx, pFy, archV, 0, archW, archH, '#1c1410');

  // Rich theatrical red/crimson curtains gathered at sides
  const curL = archV, curR = archV + archW - 4;
  rightWallRect(ctx, pFx, pFy, curL, 0, 4, archH, '#8a1824');
  rightWallRect(ctx, pFx, pFy, curL + 1, 1, 2, archH - 1, '#b42636');
  rightWallRect(ctx, pFx, pFy, curR, 0, 4, archH, '#8a1824');
  rightWallRect(ctx, pFx, pFy, curR + 1, 1, 2, archH - 1, '#b42636');
  // Scalloped curtain valance across top
  rightWallRect(ctx, pFx, pFy, archV, archH - 3, archW, 3, '#a02030');
  rightWallRect(ctx, pFx, pFy, archV + 1, archH - 2, archW - 2, 1, '#d03848');
  // Gold curtain tiebacks
  rightWallRect(ctx, pFx, pFy, curL + 1, 5, 2, 1, G.brassLight);
  rightWallRect(ctx, pFx, pFy, curR + 1, 5, 2, 1, G.brassLight);

  // Puppet / actor silhouette in center stage with wooden prop sword
  rightWallRect(ctx, pFx, pFy, archV + 7, 0, 3, 6, G.woodDark); // puppet body
  rightWallRect(ctx, pFx, pFy, archV + 8, 6, 2, 2, G.bone);    // skull head
  rightWallRect(ctx, pFx, pFy, archV + 10, 3, 1, 4, G.ironTop); // sword

  // Twin Goblin Drama Masks mounted on the Proscenium Lintel
  // Comedy Mask (grinning skull)
  miniSkull(ctx, pFx + 12, pFy - 17, false);
  px(ctx, pFx + 12, pFy - 15, '#ffffff'); // grin
  // Tragedy Mask (drooping horned skull)
  miniSkull(ctx, pFx + 20, pFy - 21, true);

  // Playhouse window on left wall
  windowL(ctx, pFx, pFy, 8, 8, 5, 7, true);

  // --- Playhouse Roof: Steep Moss Shingles with Rusty Tin Patch ---
  roof(ctx, pFx, pFy, pWl, pWr, pH, 16, MOSS, true);

  // Summit Pennant: Goblin Theater Banner on roof apex
  const apexX = pFx - (pWl >> 1) + 10;
  const apexY = pFy - pH - 16;
  banner(ctx, apexX, apexY, 20, frame, false);

  // --- Backstage Props & Dressing Area ---
  // Large costume/props trunk on right wings
  crate(ctx, fx + wR - 8, fy - (wR >> 1) + 2, 7);
  // Music lute / war-drum barrel on left wings
  barrel(ctx, fx - wL + 8, fy - (wL >> 1) + 4, false);
  // Brass horn horn sticking out of barrel
  rect(ctx, fx - wL + 8, fy - (wL >> 1) - 8, 2, 5, G.out);
  rect(ctx, fx - wL + 9, fy - (wL >> 1) - 7, 1, 4, G.brassLight);
  disc(ctx, fx - wL + 9, fy - (wL >> 1) - 8, 2, G.brass);

  // Scrap metal pile & bushes
  scrap(ctx, fx - wL + 2, fy - (wL >> 1) + 8, 5);
  bush(ctx, fx + wR - 2, fy - (wR >> 1) + 12, 4);
  bush(ctx, fx - 28, fy - 6, 3);

  return cv;
}

// ---------------------------------------------------------------------------
// 3. OBSERVATORY (Services, height 2.0, teaches 60 citizens the stars)
// ---------------------------------------------------------------------------
/**
 * A goblin astronomical observatory: heavy ashlar stone drum base with an exterior
 * iron ladder, riveted mid-level tower with exposed brass drive gears, a grand
 * hemispherical copper dome with a slotted shutter, and a GIANT brass spyglass
 * telescope angled toward the heavens with an animated glowing starlight lens.
 * In the yard: an outdoor armillary celestial globe, star-chart lectern, and gear crates.
 */
function drawObservatory(frame: number): HTMLCanvasElement {
  const [cv, ctx] = canvasHD();

  // --- Tier 1: Sturdy Ashlar Stone Drum Base ---
  const fx = 66, fy = 120, wL = 36, wR = 36, h1 = 18;
  groundShadow(ctx, fx, fy, wL, wR, 14);

  box(ctx, fx, fy, wL, wR, h1, STONE);
  brickWalls(ctx, fx, fy, wL, wR, h1, 4, 6);

  // Arched reinforced iron-banded entrance door on right wall
  doorR(ctx, fx, fy, 14, 8, 14);

  // Narrow slit windows for astrological calculations
  windowR(ctx, fx, fy, 4, 6, 4, 7, true);
  windowR(ctx, fx, fy, 26, 6, 4, 7, true);
  windowL(ctx, fx, fy, 8, 6, 4, 7, true);
  windowL(ctx, fx, fy, 24, 6, 4, 7, true);

  // Exterior iron access ladder climbing up the shaded left wall
  const ladU = 4;
  for (let z = 2; z < h1; z += 3) {
    leftWallRect(ctx, fx, fy, ladU, z, 5, 1, G.rustLight);
  }
  leftWallRect(ctx, fx, fy, ladU, 1, 1, h1, G.ironDark);
  leftWallRect(ctx, fx, fy, ladU + 4, 1, 1, h1, G.ironDark);

  // Tier 1 observation terrace / riveted iron balustrade rim
  const t1TopFy = fy - h1;
  // Overhanging iron rim
  for (let u = 0; u <= wL; u++) {
    px(ctx, fx - 1 - u, t1TopFy - (u >> 1), G.ironTop);
    px(ctx, fx - 1 - u, t1TopFy - (u >> 1) + 1, G.ironDark);
  }
  for (let v = 0; v <= wR; v++) {
    px(ctx, fx + v, t1TopFy - (v >> 1), G.ironTop);
    px(ctx, fx + v, t1TopFy - (v >> 1) + 1, G.ironR);
  }
  rivets(ctx, fx, fy - h1, wR, 2, 5);

  // --- Tier 2: Cylindrical Mechanical Mid-Tower (Daub & Riveted Iron) ---
  const t2Fx = fx, t2Fy = t1TopFy - 1, t2L = 26, t2R = 26, h2 = 16;
  box(ctx, t2Fx, t2Fy, t2L, t2R, h2, DAUB);
  timberFrame(ctx, t2Fx, t2Fy, t2L, t2R, h2);

  // Lit star-room windows
  rightWallRect(ctx, t2Fx, t2Fy, 6, 4, 4, 6, G.out);
  rightWallRect(ctx, t2Fx, t2Fy, 7, 5, 2, 4, G.glowHot);
  rightWallRect(ctx, t2Fx, t2Fy, 18, 4, 4, 6, G.out);
  rightWallRect(ctx, t2Fx, t2Fy, 19, 5, 2, 4, G.glow);
  leftWallRect(ctx, t2Fx, t2Fy, 14, 4, 4, 6, G.out);
  leftWallRect(ctx, t2Fx, t2Fy, 15, 5, 2, 4, G.glowDeep);

  // Large external brass telescope tracking cog mechanism (animated rotation)
  gear(ctx, t2Fx + 12, t2Fy - 6, 5, frame);
  gear(ctx, t2Fx + 5, t2Fy - 2, 3, (frame + 1) % 3);

  // Tier 2 iron roof cornice
  const t2TopFy = t2Fy - h2;
  for (let u = 0; u <= t2L; u++) {
    px(ctx, t2Fx - 1 - u, t2TopFy - (u >> 1), G.ironTop);
    px(ctx, t2Fx - 1 - u, t2TopFy - (u >> 1) + 1, G.ironDark);
  }
  for (let v = 0; v <= t2R; v++) {
    px(ctx, t2Fx + v, t2TopFy - (v >> 1), G.ironTop);
    px(ctx, t2Fx + v, t2TopFy - (v >> 1) + 1, G.ironR);
  }

  // --- Tier 3: Grand Patched Copper & Riveted Iron Observatory Dome ---
  const domeCx = 66, domeCy = t2TopFy - 10;
  // Copper dome hemispherical shell
  disc(ctx, domeCx, domeCy, 17, G.out);
  disc(ctx, domeCx, domeCy, 16, G.rustR);
  disc(ctx, domeCx - 2, domeCy - 2, 13, G.rustLight);
  disc(ctx, domeCx + 3, domeCy + 1, 9, G.rustDark);
  // Riveted metal plate patch on dome
  disc(ctx, domeCx + 6, domeCy + 2, 5, G.ironR);
  disc(ctx, domeCx + 6, domeCy + 2, 4, G.ironTop);
  px(ctx, domeCx + 8, domeCy + 1, G.rivet);
  px(ctx, domeCx + 4, domeCy + 3, G.rivet);

  // Slotted dome viewing aperture shutter (dark slit opening)
  for (let dy = -12; dy <= 4; dy++) {
    rect(ctx, domeCx - 2, domeCy + dy, 4, 1, G.out);
    rect(ctx, domeCx - 1, domeCy + dy, 2, 1, '#181210');
  }

  // --- GIANT BRASS & RIVETED IRON SPYGLASS TELESCOPE ---
  // Emerges from the dome aperture pointing high up into the sky at (-dx, -dy) angle
  const telBaseX = domeCx - 1, telBaseY = domeCy + 2;
  const telLen = 22; // extends up-left to y=32!
  for (let i = 0; i < telLen; i++) {
    const tx = telBaseX - Math.round(i * 1.3);
    const ty = telBaseY - Math.round(i * 1.4);
    const rad = i < 7 ? 4 : i < 15 ? 3 : 2;
    const bodyCol = i < 7 ? G.ironTop : (i % 2 === 0 ? G.brassLight : G.brass);
    // Draw cylindrical cross-slice
    rect(ctx, tx - rad, ty - rad + 1, rad * 2 + 1, rad * 2, G.out);
    rect(ctx, tx - rad + 1, ty - rad + 2, rad * 2 - 1, rad * 2 - 2, bodyCol);
    // Sunlit top edge of barrel
    px(ctx, tx, ty - rad + 1, G.glowHot);
  }

  // Giant objective lens housing at telescope tip (around x=37, y=30)
  const tipX = telBaseX - Math.round(telLen * 1.3);
  const tipY = telBaseY - Math.round(telLen * 1.4);
  disc(ctx, tipX, tipY, 4, G.out);
  disc(ctx, tipX, tipY, 3, G.brass);
  disc(ctx, tipX, tipY, 2, G.brassLight);
  // Glowing astronomical glass lens (animated starlight glint across 3 frames)
  const lensGlint = frame === 0 ? '#ffffff' : frame === 1 ? '#a8f0ff' : '#68c8e8';
  px(ctx, tipX, tipY, lensGlint);
  px(ctx, tipX - 1, tipY - 1, frame === 1 ? '#ffffff' : '#68c8e8');
  if (frame === 0) px(ctx, tipX - 2, tipY - 2, G.glowHot);

  // Weathercock / Celestial Astrolabe finial on dome summit
  const sumY = domeCy - 17;
  rect(ctx, domeCx - 1, sumY - 7, 2, 8, G.out);
  rect(ctx, domeCx, sumY - 6, 1, 7, G.brassLight);
  // Armillary ring on finial
  disc(ctx, domeCx, sumY - 9, 3, G.out);
  disc(ctx, domeCx, sumY - 9, 2, G.brass);
  px(ctx, domeCx, sumY - 9, G.brassLight);
  miniSkull(ctx, domeCx, sumY - 13, false);

  // --- Observatory Courtyard & Stargazer Props ---
  // Outdoor Celestial Armillary Sphere on carved stone plinth
  const plinthX = fx + 26, plinthY = fy + 2;
  box(ctx, plinthX, plinthY, 6, 6, 6, STONE);
  // Brass rings of armillary sphere
  disc(ctx, plinthX, plinthY - 10, 5, G.out);
  disc(ctx, plinthX, plinthY - 10, 4, G.brass);
  disc(ctx, plinthX, plinthY - 10, 2, G.brassDark);
  px(ctx, plinthX, plinthY - 10, G.brassLight); // center planet

  // Open Star-Chart Lectern with glowing blue/toxic constellation runes
  const lecX = fx - 22, lecY = fy + 2;
  rect(ctx, lecX - 1, lecY - 10, 2, 10, G.out);
  rect(ctx, lecX, lecY - 9, 1, 9, G.woodR);
  rect(ctx, lecX - 5, lecY - 15, 10, 6, G.out);
  rect(ctx, lecX - 4, lecY - 14, 8, 4, '#1b2430'); // dark star-slate
  // Constellation stars
  px(ctx, lecX - 2, lecY - 13, G.glowHot);
  px(ctx, lecX, lecY - 12, '#68c8e8');
  px(ctx, lecX + 2, lecY - 14, G.glowHot);
  px(ctx, lecX + 1, lecY - 11, '#ffffff');

  // Crate of precision brass cogs and glass lenses
  crate(ctx, fx + 8, fy + 4, 7);
  // Brass gear peeking out of crate
  gear(ctx, fx + 8, fy - 6, 3, (frame + 2) % 3);

  // Glowing alchemical star-fluid barrel
  barrel(ctx, fx + wR - 4, fy - (wR >> 1) + 6, true);

  // Green goblin skull banner on left terrace
  banner(ctx, fx - wL + 2, fy - (wL >> 1) + 3, 34, frame, true);

  // Shrubbery & yard scrap
  scrap(ctx, fx - 28, fy - 4, 8);
  bush(ctx, fx + wR - 12, fy - (wR >> 1) + 12, 4);
  bush(ctx, fx - 32, fy - 8, 3);

  return cv;
}

// ---------------------------------------------------------------------------
// 4. HOSPITAL (Services, height 1.6, keeps whole city healthy)
// ---------------------------------------------------------------------------
/**
 * A goblin hospital and sawbones apothecary: two-storey building with heavy stone
 * foundation, pale timber-framed surgery ward, a bold green healing cross painted
 * on the front facade, upper windowsill planter boxes blooming with medicinal
 * moonleaf herbs, an apothecary chimney venting herbal distillation vapors,
 * an outdoor recovery cot under a cloth awning, and tincture crates.
 */
function drawHospital(frame: number): HTMLCanvasElement {
  const [cv, ctx] = canvasHD();

  const fx = 66, fy = 122, wL = 46, wR = 42;
  groundShadow(ctx, fx, fy, wL, wR, 14);

  // --- Ground Floor: Bleached Stone Clinic Foundation ---
  const gfH = 16;
  box(ctx, fx, fy, wL, wR, gfH, STONE);
  brickWalls(ctx, fx, fy, wL, wR, gfH, 4, 6);

  // Clinic double doors on right wall with brass latch
  doorR(ctx, fx, fy, 16, 9, 14);

  // Ground floor windows
  windowR(ctx, fx, fy, 5, 5, 5, 7, true);
  windowR(ctx, fx, fy, 30, 5, 5, 7, true);
  windowL(ctx, fx, fy, 8, 5, 5, 7, true);
  windowL(ctx, fx, fy, 28, 5, 5, 7, false);

  // Bold Goblin Healing Cross / Sawbones Caduceus on the lit right wall
  // Sits prominently between door and right window
  const crossV = 26, crossZ = 6;
  // White/bone circular backing plaque
  rightWallRect(ctx, fx, fy, crossV - 1, crossZ - 1, 7, 7, G.out);
  rightWallRect(ctx, fx, fy, crossV, crossZ, 5, 5, G.bone);
  // Vibrant emerald healing cross
  rightWallRect(ctx, fx, fy, crossV + 2, crossZ, 1, 5, G.toxic);
  rightWallRect(ctx, fx, fy, crossV, crossZ + 2, 5, 1, G.toxic);
  px(ctx, fx + crossV + 2, fy - (crossV >> 1) - crossZ - 2, G.toxicLight); // core glint

  // --- Upper Floor: Daub & Timber Surgery & Leech Ward ---
  const uy = fy - gfH;
  const ufH = 15;
  box(ctx, fx, uy, wL, wR, ufH, DAUB);
  timberFrame(ctx, fx, uy, wL, wR, ufH);

  // Upper floor ward windows
  windowR(ctx, fx, uy, 6, 4, 5, 7, true);
  windowR(ctx, fx, uy, 18, 4, 5, 7, true);
  windowR(ctx, fx, uy, 30, 4, 5, 7, true);
  windowL(ctx, fx, uy, 10, 4, 5, 7, true);
  windowL(ctx, fx, uy, 26, 4, 5, 7, true);

  // Windowsill herbal planter boxes growing glowing medicinal Moonleaf
  const planterBoxes = [
    [fx, uy, 5, 2, 7],
    [fx, uy, 17, 2, 7],
    [fx, uy, 29, 2, 7],
  ] as const;
  for (const [pFx, pFy, v0, z0, len] of planterBoxes) {
    rightWallRect(ctx, pFx, pFy, v0, z0, len, 2, G.woodDark);
    rightWallRect(ctx, pFx, pFy, v0 + 1, z0 + 1, len - 2, 1, G.woodR);
    // Glowing cyan moonleaf sprigs poking out of planter
    for (let k = 1; k < len - 1; k += 2) {
      rightWallRect(ctx, pFx, pFy, v0 + k, z0 + 2, 1, 2, '#68c8e8');
      px(ctx, pFx + v0 + k, pFy - ((v0 + k) >> 1) - z0 - 4, '#b0f0ff');
    }
  }

  // --- Roof: Moss Shingles with Tin Patch & Apothecary Chimney ---
  roof(ctx, fx, uy, wL, wR, ufH, 22, MOSS, true);

  // Stone apothecary chimney venting herbal brewing vapors
  const c = chimney(ctx, fx + 16, uy - 28, 12);
  smoke(ctx, c.x, c.y, frame);
  // Alchemical greenish spark floating from chimney rim (3 frames)
  if (frame === 0) px(ctx, c.x + 2, c.y - 2, G.toxicLight);
  else if (frame === 1) px(ctx, c.x - 2, c.y - 4, G.toxicLight);
  else px(ctx, c.x + 1, c.y - 5, G.glowHot);

  // --- Clinic Courtyard: Recovery Cot, Medicine Crates, Potion Table ---
  // Outdoor patient recovery cot under a rustic canvas sun-shade
  const cotX = fx + 26, cotY = fy + 5;
  // Wooden frame and legs
  rect(ctx, cotX - 1, cotY - 5, 12, 5, G.out);
  rect(ctx, cotX, cotY - 4, 10, 3, G.woodR);
  // Stretched white linen mattress & goblin pillow
  rect(ctx, cotX + 1, cotY - 5, 8, 2, G.bone);
  rect(ctx, cotX + 7, cotY - 6, 2, 3, G.boneShade);
  // Small angled canvas shade awning above cot
  rect(ctx, cotX - 2, cotY - 14, 2, 10, G.out);
  rect(ctx, cotX - 1, cotY - 13, 1, 9, G.woodR);
  rect(ctx, cotX + 9, cotY - 14, 2, 10, G.out);
  rect(ctx, cotX + 10, cotY - 13, 1, 9, G.woodR);
  // Awning cloth
  rect(ctx, cotX - 3, cotY - 16, 16, 3, G.out);
  rect(ctx, cotX - 2, cotY - 15, 14, 2, G.bannerLight);

  // Medicine table with glass tincture bottles and leech jar
  const tabX = fx - 22, tabY = fy + 4;
  rect(ctx, tabX - 5, tabY - 8, 10, 8, G.out);
  rect(ctx, tabX - 4, tabY - 7, 8, 2, G.woodTop);
  rect(ctx, tabX - 4, tabY - 5, 2, 5, G.woodDark);
  rect(ctx, tabX + 2, tabY - 5, 2, 5, G.woodDark);
  // Glass potion bottles on table (animated sparkle)
  px(ctx, tabX - 3, tabY - 9, G.toxicLight);
  px(ctx, tabX - 1, tabY - 9, '#e85a70'); // red tincture
  px(ctx, tabX + 1, tabY - 9, '#68c8e8'); // moonleaf elixir
  if (frame === 1) px(ctx, tabX - 1, tabY - 10, '#ffffff');

  // Medical supply crate on right front
  crate(ctx, fx + 8, fy + 5, 6);

  // Fresh water / antiseptic barrel
  barrel(ctx, fx + wR - 4, fy - (wR >> 1) + 8, false);

  // Goblin skull banner with green healing pennant
  banner(ctx, fx - wL + 2, fy - (wL >> 1) + 3, 34, frame, true);

  // Yard scrap and medicinal shrubbery
  scrap(ctx, fx - 28, fy - 2, 6);
  bush(ctx, fx + wR - 12, fy - (wR >> 1) + 14, 4);
  bush(ctx, fx - 32, fy - 6, 3);

  return cv;
}

// ---------------------------------------------------------------------------
// 5. UNIVERSITY (Services, height 2.2, teaches 200 citizens)
// ---------------------------------------------------------------------------
/**
 * A grand goblin university campus building: heavy ashlar stone ground floor with
 * a grand arched double portal, timber-framed upper lecture halls, multi-gable
 * moss roof, an imposing central clock-and-bell spire tower rising up to y=14
 * with a brass astronomical clockface and skull finial, courtyard study lectern
 * with a giant leatherbound tome, outdoor scrolls crate, and waving banners.
 */
function drawUniversity(frame: number): HTMLCanvasElement {
  const [cv, ctx] = canvasHD();

  const fx = 66, fy = 122, wL = 48, wR = 46;
  groundShadow(ctx, fx, fy, wL, wR, 14);

  // --- Tier 1: Grand Ashlar Stone Lecture Hall Base ---
  const gfH = 16;
  box(ctx, fx, fy, wL, wR, gfH, STONE);
  brickWalls(ctx, fx, fy, wL, wR, gfH, 4, 6);

  // Grand arched double entrance portal on lit right wall
  const doorV = 16, doorW = 12, doorH = 14;
  doorR(ctx, fx, fy, doorV, doorW, doorH);
  // Center door meeting seam & carved archway keystone
  rightWallRect(ctx, fx, fy, doorV + (doorW >> 1), 0, 1, doorH - 1, G.out);
  rightWallRect(ctx, fx, fy, doorV + 1, doorH - 1, doorW - 2, 2, G.stoneTop);
  // Goblin heraldic crest / carved skull plaque above the portal
  miniSkull(ctx, fx + doorV + (doorW >> 1), fy - (doorV >> 1) - doorH - 3, false);

  // Grand lecture hall arched windows with study candlelight
  windowR(ctx, fx, fy, 4, 5, 5, 8, true);
  windowR(ctx, fx, fy, 32, 5, 5, 8, true);
  windowL(ctx, fx, fy, 8, 5, 5, 8, true);
  windowL(ctx, fx, fy, 22, 5, 5, 8, true);
  windowL(ctx, fx, fy, 36, 5, 5, 8, true);

  // Tier 1 cornice / riveted iron balustrade trim
  for (let u = 0; u <= wL; u++) {
    px(ctx, fx - 1 - u, fy - gfH - (u >> 1), G.ironTop);
    px(ctx, fx - 1 - u, fy - gfH - (u >> 1) + 1, G.ironDark);
  }
  for (let v = 0; v <= wR; v++) {
    px(ctx, fx + v, fy - gfH - (v >> 1), G.ironTop);
    px(ctx, fx + v, fy - gfH - (v >> 1) + 1, G.ironR);
  }
  rivets(ctx, fx, fy - gfH, wR, 2, 6);

  // --- Tier 2: Timber & Daub Academic Halls & Library Wings ---
  const uy = fy - gfH;
  const ufH = 16;
  box(ctx, fx, uy, wL, wR, ufH, DAUB);
  timberFrame(ctx, fx, uy, wL, wR, ufH);

  // Upper floor library windows (alchemy-green and warm lit study lights)
  windowR(ctx, fx, uy, 5, 4, 5, 8, true);
  windowR(ctx, fx, uy, 15, 4, 5, 8, true);
  windowR(ctx, fx, uy, 26, 4, 5, 8, true);
  windowR(ctx, fx, uy, 36, 4, 5, 8, true);
  // Alchemical lecture glow in left wing windows
  leftWallRect(ctx, fx, uy, 8, 4, 6, 8, G.out);
  leftWallRect(ctx, fx, uy, 9, 5, 4, 6, frame === 0 ? G.toxicLight : G.toxic);
  leftWallRect(ctx, fx, uy, 22, 4, 6, 8, G.out);
  leftWallRect(ctx, fx, uy, 23, 5, 4, 6, G.glowDeep);
  leftWallRect(ctx, fx, uy, 36, 4, 6, 8, G.out);
  leftWallRect(ctx, fx, uy, 37, 5, 4, 6, frame === 1 ? G.toxicLight : G.glow);

  // --- Main Roof: Moss Shingles with Tin Patches ---
  roof(ctx, fx, uy, wL, wR, ufH, 20, MOSS, true);

  // Campus stone heating chimney on right wing
  const c = chimney(ctx, fx + 26, uy - 30, 11);
  smoke(ctx, c.x, c.y, frame);

  // --- Towering Central Clock & Belfry Campanile Spire (Rises to y=14) ---
  // Sits in the center of the campus hall
  const twFx = fx + 2, twFy = uy - 18, twL = 16, twR = 16, twH = 28;
  box(ctx, twFx, twFy, twL, twR, twH, DAUB);
  timberFrame(ctx, twFx, twFy, twL, twR, twH);

  // Large Brass Astronomical Clockface on lit tower wall
  const clockV = 4, clockZ = 12;
  const clockCx = twFx + clockV + 3;
  const clockCy = twFy - (clockV >> 1) - clockZ - 2;
  disc(ctx, clockCx, clockCy, 6, G.out);
  disc(ctx, clockCx, clockCy, 5, G.brass);
  disc(ctx, clockCx, clockCy, 4, G.brassLight);
  disc(ctx, clockCx, clockCy, 1, G.brassDark); // center pinion
  // Clock hands (moving with animation frame!)
  if (frame === 0) {
    px(ctx, clockCx, clockCy - 2, G.out);
    px(ctx, clockCx + 2, clockCy, G.out);
  } else if (frame === 1) {
    px(ctx, clockCx + 1, clockCy - 2, G.out);
    px(ctx, clockCx + 1, clockCy + 2, G.out);
  } else {
    px(ctx, clockCx - 2, clockCy, G.out);
    px(ctx, clockCx + 2, clockCy - 1, G.out);
  }
  // Clock perimeter rivets / hour studs
  px(ctx, clockCx, clockCy - 4, G.brassDark);
  px(ctx, clockCx + 4, clockCy, G.brassDark);
  px(ctx, clockCx, clockCy + 4, G.brassDark);
  px(ctx, clockCx - 4, clockCy, G.brassDark);

  // Tower Belfry Arched Louvers above the clockface
  rightWallRect(ctx, twFx, twFy, clockV + 1, twH - 6, 5, 4, G.out);
  rightWallRect(ctx, twFx, twFy, clockV + 2, twH - 5, 3, 2, G.woodDark);
  // Brass bell suspended inside louver (swaying with frame)
  const bellSway = frame === 1 ? 1 : 0;
  px(ctx, clockCx + bellSway, clockCy - 7, G.brassLight);

  // Steep Pyramidal Spire atop the Campanile Tower (y=56 down to y=22)
  const spTopFy = twFy - twH;
  isoPitchedRoof(ctx, twFx, twFy, twL, twR, twH, 18, {
    leftSlope: G.rustL,
    rightSlope: G.rustR,
    gable: G.woodDark,
    ridge: G.rustLight,
    outline: G.out,
  });

  // Tall Iron Lightning Rod & Celestial Armillary Finial on Spire Apex (y=22 up to y=14!)
  const apexY = spTopFy - 18;
  const spX = twFx - (twL >> 1) + 4;
  rect(ctx, spX - 1, apexY - 10, 2, 11, G.out);
  rect(ctx, spX, apexY - 9, 1, 10, G.brassLight);
  // Spire finial skull ornament
  miniSkull(ctx, spX, apexY - 12, true);
  px(ctx, spX, apexY - 15, '#ffffff'); // apex starlight glint

  // --- University Courtyard & Campus Quadrangle ---
  // Outdoor Professor's Study Lectern with a massive open parchment tome
  const lecX = fx + 28, lecY = fy + 3;
  rect(ctx, lecX - 1, lecY - 11, 2, 11, G.out);
  rect(ctx, lecX, lecY - 10, 1, 10, G.woodR);
  rect(ctx, lecX - 6, lecY - 16, 12, 6, G.out);
  rect(ctx, lecX - 5, lecY - 15, 10, 4, G.woodTop);
  // Large open leather tome with white pages
  rect(ctx, lecX - 4, lecY - 15, 8, 3, G.bone);
  px(ctx, lecX, lecY - 14, G.woodDark); // spine divider
  px(ctx, lecX - 2, lecY - 14, G.woodR); // text lines
  px(ctx, lecX + 2, lecY - 14, G.woodR);

  // Stack of three heavy leatherbound library books on ground
  const bookX = fx + 20, bookY = fy + 6;
  rect(ctx, bookX - 4, bookY - 5, 8, 5, G.out);
  rect(ctx, bookX - 3, bookY - 4, 6, 1, '#8a2028'); // red tome
  rect(ctx, bookX - 3, bookY - 3, 6, 1, '#245a80'); // blue tome
  rect(ctx, bookX - 3, bookY - 2, 6, 1, '#4a6a24'); // green tome

  // Open wooden crate packed with rolled scholarly scrolls
  const crX = fx + 8, crY = fy + 5;
  crate(ctx, crX, crY, 7);
  disc(ctx, crX - 2, crY - 9, 1, G.bone);
  disc(ctx, crX + 2, crY - 8, 1, G.boneShade);
  disc(ctx, crX, crY - 10, 1, G.bone);

  // Outdoor study bench on left quad
  rect(ctx, fx - 24, fy + 4, 10, 3, G.out);
  rect(ctx, fx - 23, fy + 5, 8, 2, G.woodR);
  rect(ctx, fx - 23, fy + 4, 8, 1, G.woodTop);

  // Two waving university banners (left and right campus wings)
  banner(ctx, fx - wL + 2, fy - (wL >> 1) + 2, 38, frame, true);
  banner(ctx, fx + wR - 4, fy - (wR >> 1) + 4, 30, frame, false);

  // Campus barrels and shrubbery
  barrel(ctx, fx + wR - 10, fy - (wR >> 1) + 8, false);
  scrap(ctx, fx - 26, fy - 2, 5);
  bush(ctx, fx + wR - 16, fy - (wR >> 1) + 14, 4);
  bush(ctx, fx - 34, fy - 6, 3);

  return cv;
}

// ---------------------------------------------------------------------------
// Exported art map
// ---------------------------------------------------------------------------
export const art: Partial<Record<BuildingKind, () => HTMLCanvasElement[]>> = {
  garden: () => [0, 1, 2].map(drawGarden),
  theater: () => [0, 1, 2].map(drawTheater),
  observatory: () => [0, 1, 2].map(drawObservatory),
  hospital: () => [0, 1, 2].map(drawHospital),
  university: () => [0, 1, 2].map(drawUniversity),
};
