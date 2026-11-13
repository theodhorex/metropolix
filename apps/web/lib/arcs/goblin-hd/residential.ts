// Goblin HD buildings: residential (drawn by a worker, see .agy/tasks). Kinds left out fall back to the 1x goblin art.
import type { BuildingKind } from '@metropolix/sim';
import {
  G,
  MOSS,
  RUST,
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
  doorL,
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
import { leftWallRect, rect, rightWallRect, px } from '../../sprites';

/**
 * 1. ROWHOUSE (Row Houses, 24 citizens, height 1.2)
 * Three cramped, joined narrow townhouses stepped along the street with varied facades,
 * staggered roofs, multiple chimneys, lit windows, and goblin yard props.
 */
function drawRowhouse(frame: number): HTMLCanvasElement {
  const [cv, ctx] = canvasHD();
  // Ground shadow under the three attached rowhouses
  groundShadow(ctx, 64, 122, 48, 46, 12);

  // Unit 3 (Back-right townhouse: stone ground floor + dark plank attic + rusty tin roof)
  const u3Fx = 94, u3Fy = 107, u3L = 40, u3R = 15;
  box(ctx, u3Fx, u3Fy, u3L, u3R, 14, STONE);
  brickWalls(ctx, u3Fx, u3Fy, u3L, u3R, 14, 4, 5);
  doorR(ctx, u3Fx, u3Fy, 3, 5, 9);
  windowR(ctx, u3Fx, u3Fy, 9, 3, 4, 6);
  box(ctx, u3Fx, u3Fy - 14, u3L, u3R, 12, WOOD);
  plankWalls(ctx, u3Fx, u3Fy - 14, u3L, u3R, 12, 3);
  windowR(ctx, u3Fx, u3Fy - 14, 6, 2, 4, 5);
  roof(ctx, u3Fx, u3Fy - 26, u3L, u3R, 0, 16, RUST, true);
  // Crooked stovepipe chimney
  rect(ctx, 100, u3Fy - 26 - 18, 3, 7, G.out);
  rect(ctx, 101, u3Fy - 26 - 17, 1, 6, G.ironTop);
  smoke(ctx, 101, u3Fy - 26 - 19, (frame + 2) % 3);

  // Unit 2 (Middle townhouse: tall 3-storey daub & timber half-timbered building)
  const u2Fx = 79, u2Fy = 114, u2L = 44, u2R = 15;
  box(ctx, u2Fx, u2Fy, u2L, u2R, 14, STONE);
  brickWalls(ctx, u2Fx, u2Fy, u2L, u2R, 14, 4, 5);
  doorR(ctx, u2Fx, u2Fy, 4, 6, 10);
  windowR(ctx, u2Fx, u2Fy, 11, 4, 3, 5);
  box(ctx, u2Fx, u2Fy - 14, u2L, u2R, 13, DAUB);
  timberFrame(ctx, u2Fx, u2Fy - 14, u2L, u2R, 13);
  windowR(ctx, u2Fx, u2Fy - 14, 5, 3, 4, 5);
  box(ctx, u2Fx, u2Fy - 27, u2L, u2R, 12, DAUB);
  timberFrame(ctx, u2Fx, u2Fy - 27, u2L, u2R, 12);
  windowR(ctx, u2Fx, u2Fy - 27, 5, 2, 4, 5);
  roof(ctx, u2Fx, u2Fy - 39, u2L, u2R, 0, 18, MOSS, true);
  const c2 = chimney(ctx, 84, u2Fy - 39 - 14, 10);
  smoke(ctx, c2.x, c2.y, (frame + 1) % 3);

  // Unit 1 (Front-left townhouse: stone base, plank upper floor, moss roof)
  const u1Fx = 64, u1Fy = 122, u1L = 46, u1R = 15;
  box(ctx, u1Fx, u1Fy, u1L, u1R, 15, STONE);
  brickWalls(ctx, u1Fx, u1Fy, u1L, u1R, 15, 4, 5);
  doorR(ctx, u1Fx, u1Fy, 4, 6, 11);
  windowL(ctx, u1Fx, u1Fy, 10, 4, 5, 6);
  windowL(ctx, u1Fx, u1Fy, 26, 4, 5, 6);
  box(ctx, u1Fx, u1Fy - 15, u1L, u1R, 14, WOOD);
  plankWalls(ctx, u1Fx, u1Fy - 15, u1L, u1R, 14, 3);
  windowR(ctx, u1Fx, u1Fy - 15, 5, 3, 5, 6);
  windowL(ctx, u1Fx, u1Fy - 15, 12, 3, 5, 6);
  windowL(ctx, u1Fx, u1Fy - 15, 28, 3, 5, 6);
  roof(ctx, u1Fx, u1Fy - 29, u1L, u1R, 0, 18, MOSS, true);

  // Front yard props: skull banner, crate, barrel, scrap, bush
  banner(ctx, u1Fx - u1L + 2, u1Fy - (u1L >> 1) + 2, 30, frame, true);
  crate(ctx, u1Fx + 4, u1Fy + 4, 6);
  barrel(ctx, u2Fx + 3, u2Fy + 4, false);
  scrap(ctx, u1Fx - 24, u1Fy - 5, 5);
  bush(ctx, u3Fx + 12, u3Fy - 2, 3);

  return cv;
}

/**
 * 2. MANOR (Manor, 12 citizens, height 1.6)
 * Grand goblin warlord manor hall: 2-storey stone and half-timbered mansion with
 * back-left riveted iron turret, conical scrap spire, golden horned skull finial,
 * grand arched entrance, glowing toxic barrel, and spiked yard fence.
 */
function drawManor(frame: number): HTMLCanvasElement {
  const [cv, ctx] = canvasHD();
  // Ground shadow
  groundShadow(ctx, 68, 120, 44, 44, 14);

  // 1. Back-left Warlord Turret (drawn first so main hall sits in front)
  const tFx = 44, tFy = 104, tW = 16, tH = 44;
  box(ctx, tFx, tFy, tW, tW, tH, IRON);
  rivets(ctx, tFx, tFy, tW, tH, 6);
  // Slit windows on turret with glowing amber/toxic light
  rightWallRect(ctx, tFx, tFy, 6, 24, 4, 7, G.out);
  rightWallRect(ctx, tFx, tFy, 7, 25, 2, 5, G.toxic);
  px(ctx, tFx + 7, tFy - 3 - 26, G.toxicLight);
  leftWallRect(ctx, tFx, tFy, 6, 24, 4, 7, G.out);
  leftWallRect(ctx, tFx, tFy, 7, 25, 2, 5, G.glowDeep);
  // Turret overhanging scrap battlements
  box(ctx, tFx + 2, tFy - tH, tW + 4, tW + 4, 4, STONE);
  // Conical scrap spire on top
  const spireBaseY = tFy - tH - 4;
  const spirePeakX = tFx - 1;
  const spirePeakY = spireBaseY - 18;
  for (let dy = 0; dy < 18; dy++) {
    const span = Math.max(1, Math.round(((18 - dy) * (tW >> 1)) / 18));
    const py = spireBaseY - dy;
    rect(ctx, spirePeakX - span, py, span * 2, 1, G.out);
    rect(ctx, spirePeakX - span + 1, py, Math.max(1, (span - 1) * 2), 1, dy % 3 === 0 ? G.rustR : G.rustL);
  }
  // Golden horned skull / brass finial at the turret peak
  disc(ctx, spirePeakX, spirePeakY - 1, 3, G.brass);
  px(ctx, spirePeakX, spirePeakY - 3, G.brassLight);
  px(ctx, spirePeakX - 2, spirePeakY - 4, G.bone);
  px(ctx, spirePeakX + 2, spirePeakY - 4, G.bone);

  // 2. Main Manor Hall
  const fx = 68, fy = 120, wL = 36, wR = 40;
  // Ground floor: warm dressed stone
  box(ctx, fx, fy, wL, wR, 16, STONE);
  brickWalls(ctx, fx, fy, wL, wR, 16, 4, 6);
  // Grand arched double door with brass knockers
  doorR(ctx, fx, fy, 15, 9, 14);
  windowR(ctx, fx, fy, 4, 5, 6, 7);
  windowR(ctx, fx, fy, 28, 5, 6, 7);
  windowL(ctx, fx, fy, 8, 5, 6, 7);
  windowL(ctx, fx, fy, 22, 5, 6, 7);

  // Upper floor: daub and timber frame with decorative diagonals
  const uy = fy - 16;
  box(ctx, fx, uy, wL, wR, 15, DAUB);
  timberFrame(ctx, fx, uy, wL, wR, 15);
  windowR(ctx, fx, uy, 5, 4, 6, 7);
  windowR(ctx, fx, uy, 16, 4, 6, 7);
  windowR(ctx, fx, uy, 27, 4, 6, 7);
  windowL(ctx, fx, uy, 10, 4, 6, 7);
  windowL(ctx, fx, uy, 24, 4, 6, 7);

  // Mansard/Gable moss roof with rust tin patch
  roof(ctx, fx, uy, wL, wR, 15, 20, MOSS, true);
  // Ornate stone chimney
  const c = chimney(ctx, fx + 16, uy - 31, 13);
  smoke(ctx, c.x, c.y, frame);

  // 3. Yard props: stakes, banner, glowing barrel, crate, brass gear, bushes
  stakes(ctx, 18, 42, 121, -0.25, 7);
  banner(ctx, fx + 6, fy + 4, 34, frame, false);
  barrel(ctx, fx + wR - 4, fy - (wR >> 1) + 8, true); // glowing toxic barrel
  gear(ctx, fx + 18, fy + 2, 4, frame);
  crate(ctx, fx + 26, fy - 2, 6);
  scrap(ctx, fx - 20, fy - 4, 2);
  bush(ctx, fx + wR - 10, fy - (wR >> 1) + 14, 4);
  bush(ctx, 16, 110, 3);

  return cv;
}

/**
 * 3. COTTAGE (Cottage, 6 citizens, height 0.8)
 * A small, cosy starter hovel: low stone base, plank timber upper walls, steep moss
 * roof with rusty patch, squat smoking chimney, skull totem post, barrel, crate, and bushes.
 */
function drawCottage(frame: number): HTMLCanvasElement {
  const [cv, ctx] = canvasHD();
  const fx = 64, fy = 120, wL = 38, wR = 36;
  groundShadow(ctx, fx, fy, wL, wR, 10);

  // Low stone foundation
  box(ctx, fx, fy, wL, wR, 8, STONE);
  brickWalls(ctx, fx, fy, wL, wR, 8, 4, 5);

  // Upper rustic timber walls
  const uy = fy - 8;
  box(ctx, fx, uy, wL, wR, 10, WOOD);
  plankWalls(ctx, fx, uy, wL, wR, 10, 3);

  // Door and windows
  doorR(ctx, fx, fy, 16, 7, 11);
  windowR(ctx, fx, fy, 4, 3, 5, 6);
  windowL(ctx, fx, fy, 10, 3, 5, 6);
  windowL(ctx, fx, fy, 24, 3, 5, 6, false);

  // Steep cosy moss roof
  roof(ctx, fx, uy, wL, wR, 10, 20, MOSS, true);
  const c = chimney(ctx, fx + 10, uy - 18, 9);
  smoke(ctx, c.x, c.y, frame);

  // Yard: bone stakes, skull totem, scrap, barrel, crate, bushes
  stakes(ctx, 16, 32, 115, -0.28, 6);
  // Skull totem on post
  rect(ctx, 56, 122, 2, 9, G.woodDark);
  rect(ctx, 55, 119, 4, 4, G.bone);
  px(ctx, 56, 120, G.out);
  px(ctx, 58, 120, G.out);
  px(ctx, 55, 118, G.bone);
  px(ctx, 58, 118, G.bone);

  crate(ctx, fx + 6, fy + 4, 6);
  barrel(ctx, fx + wR - 4, fy - (wR >> 1) + 8, false);
  scrap(ctx, fx - 22, fy - 3, 4);
  bush(ctx, fx + wR - 8, fy - (wR >> 1) + 14, 4);
  bush(ctx, fx - 26, fy - 7, 3);

  return cv;
}

/**
 * 4. LONGHOUSE (Longhouse, 18 citizens, height 1.0)
 * An elongated communal Nordic-goblin hall: long timber flanks with riveted iron straps,
 * front gable arched jaw entrance, side doors, glowing smoke slits, massive moss roof
 * with crossed bone finials at the ridges, roof stovepipes, and front toxic torch.
 */
function drawLonghouse(frame: number): HTMLCanvasElement {
  const [cv, ctx] = canvasHD();
  const fx = 50, fy = 124, wL = 32, wR = 58;
  groundShadow(ctx, fx, fy, wL, wR, 12);

  // Heavy foundation and timber walls
  box(ctx, fx, fy, wL, wR, 4, STONE);
  box(ctx, fx, fy - 4, wL, wR, 12, WOOD);
  plankWalls(ctx, fx, fy - 4, wL, wR, 12, 4);

  // Horizontal iron reinforcement straps along the long flank
  rightWallRect(ctx, fx, fy, 1, 6, wR - 2, 1, G.ironR);
  rightWallRect(ctx, fx, fy, 1, 12, wR - 2, 1, G.ironR);
  leftWallRect(ctx, fx, fy, 1, 6, wL - 2, 1, G.ironL);

  // Front gable arched jaw-door on left wall
  doorL(ctx, fx, fy, 10, 8, 12);
  // Bone teeth / ribs above door
  px(ctx, fx - 1 - 12, fy - 6 - 13, G.bone);
  px(ctx, fx - 1 - 14, fy - 7 - 13, G.bone);
  px(ctx, fx - 1 - 16, fy - 8 - 13, G.bone);

  // Two side doors along the long right wall
  doorR(ctx, fx, fy, 8, 7, 11);
  doorR(ctx, fx, fy, 38, 7, 11);

  // Fire-slit glowing windows along the right wall
  windowR(ctx, fx, fy, 20, 6, 4, 5);
  windowR(ctx, fx, fy, 28, 6, 4, 5);
  windowR(ctx, fx, fy, 49, 6, 4, 5);

  // Enormous pitched roof spanning the longhouse
  roof(ctx, fx, fy - 16, wL, wR, 0, 24, MOSS, true);

  // Crossed animal rib finials rising above front gable peak
  const halfL = wL >> 1;
  const peakX = fx - 1 - halfL;
  const peakY = fy - 16 - (halfL >> 1) - 24;
  rect(ctx, peakX - 3, peakY - 6, 2, 8, G.out);
  rect(ctx, peakX - 2, peakY - 5, 1, 6, G.bone);
  rect(ctx, peakX + 2, peakY - 6, 2, 8, G.out);
  rect(ctx, peakX + 2, peakY - 5, 1, 6, G.bone);

  // Back gable horn finials
  const peakBackX = peakX + wR;
  const peakBackY = peakY - (wR >> 1);
  rect(ctx, peakBackX - 1, peakBackY - 5, 2, 6, G.out);
  px(ctx, peakBackX, peakBackY - 4, G.bone);

  // Two stovepipe smoke vents along the ridge
  rect(ctx, 62, 70, 3, 7, G.out);
  rect(ctx, 63, 71, 1, 6, G.ironTop);
  smoke(ctx, 63, 69, frame);

  rect(ctx, 82, 60, 3, 7, G.out);
  rect(ctx, 83, 61, 1, 6, G.rustLight);
  smoke(ctx, 83, 59, (frame + 1) % 3);

  // Front yard: toxic green torch brazier, stacked firewood / crates, barrels
  rect(ctx, 40, 117, 3, 9, G.out);
  rect(ctx, 41, 118, 1, 8, G.woodDark);
  rect(ctx, 39, 115, 5, 3, G.ironL);
  disc(ctx, 41, 114, 2, G.toxic);
  px(ctx, 41, 112 - (frame % 2), G.toxicLight);

  // Yard props
  barrel(ctx, 102, 98, false);
  crate(ctx, 94, 101, 6);
  crate(ctx, 96, 96, 5);
  scrap(ctx, 26, 116, 3);
  bush(ctx, 110, 93, 4);
  bush(ctx, 18, 106, 3);

  return cv;
}

/**
 * 5. TENEMENT (Tenement, 40 citizens, height 1.8)
 * A tall, crowded, 3-tier stepped shanty-stack tower: stone foundation, timber-framed
 * middle tier, leaning scrap-iron attic shacks, fire escape ladder and catwalks on the
 * left flank, clothesline with fluttering rags, rooftop water tank, and smoky stovepipe.
 */
function drawTenement(frame: number): HTMLCanvasElement {
  const [cv, ctx] = canvasHD();
  const fx = 64, fy = 122, wL = 44, wR = 42;
  groundShadow(ctx, fx, fy, wL, wR, 14);

  // --- Tier 1: Heavy stone base ---
  box(ctx, fx, fy, wL, wR, 18, STONE);
  brickWalls(ctx, fx, fy, wL, wR, 18, 5, 6);
  doorR(ctx, fx, fy, 4, 7, 13);
  windowR(ctx, fx, fy, 16, 5, 5, 7);
  windowR(ctx, fx, fy, 28, 5, 5, 7);
  windowL(ctx, fx, fy, 10, 5, 5, 7);
  windowL(ctx, fx, fy, 26, 5, 5, 7);

  // --- Tier 2: Mid shanty floor (daub and timber framing) ---
  const uy1 = fy - 18;
  const fx2 = 63, fy2 = uy1, wL2 = 42, wR2 = 40, h2 = 17;
  box(ctx, fx2, fy2, wL2, wR2, h2, DAUB);
  timberFrame(ctx, fx2, fy2, wL2, wR2, h2);
  rivets(ctx, fx2, fy2, wR2, h2, 7);
  windowR(ctx, fx2, fy2, 6, 4, 5, 7);
  windowR(ctx, fx2, fy2, 18, 4, 5, 7);
  windowR(ctx, fx2, fy2, 30, 4, 5, 7);
  windowL(ctx, fx2, fy2, 8, 4, 5, 7);
  windowL(ctx, fx2, fy2, 24, 4, 5, 7);

  // --- Tier 3: Leaning attic tier (plank timber & scrap iron) ---
  const uy2 = fy2 - h2;
  const fx3 = 65, fy3 = uy2, wL3 = 36, wR3 = 36, h3 = 16;
  box(ctx, fx3, fy3, wL3, wR3, h3, WOOD);
  plankWalls(ctx, fx3, fy3, wL3, wR3, h3, 3);
  windowR(ctx, fx3, fy3, 6, 4, 5, 6);
  windowR(ctx, fx3, fy3, 22, 4, 5, 6);
  windowL(ctx, fx3, fy3, 10, 4, 5, 6);
  windowL(ctx, fx3, fy3, 22, 4, 5, 6);

  // --- Roof: Rusty tin gable roof ---
  roof(ctx, fx3, fy3 - h3, wL3, wR3, 0, 16, RUST, true);

  // Rooftop scrap iron water vat / boiler
  box(ctx, 48, fy3 - h3 - 10, 10, 10, 9, IRON);
  rivets(ctx, 48, fy3 - h3 - 10, 10, 9, 3);

  // Crooked stovepipe chimney
  rect(ctx, 68, fy3 - h3 - 20, 3, 9, G.out);
  rect(ctx, 69, fy3 - h3 - 19, 1, 8, G.ironTop);
  smoke(ctx, 69, fy3 - h3 - 21, frame);

  // --- Fire escape ladder and catwalk on left wall ---
  leftWallRect(ctx, fx, fy, 4, 18, 12, 2, G.ironTop);
  leftWallRect(ctx, fx2, fy2, 4, 17, 12, 2, G.ironTop);
  // Ladder vertical rails
  leftWallRect(ctx, fx, fy, 6, 2, 1, 35, G.ironL);
  leftWallRect(ctx, fx, fy, 14, 2, 1, 35, G.ironL);
  // Ladder rungs
  for (let z = 4; z < 35; z += 4) {
    leftWallRect(ctx, fx, fy, 6, z, 8, 1, G.ironTop);
  }

  // --- Flapping clothesline with tattered loot rags ---
  const lx0 = fx + 6, ly0 = fy - 26;
  const lx1 = fx + 34, ly1 = fy - (34 >> 1) - 26;
  for (let x = lx0; x <= lx1; x++) {
    const t = (x - lx0) / (lx1 - lx0);
    const y = Math.round(ly0 + t * (ly1 - ly0) + Math.sin(t * Math.PI) * 3);
    px(ctx, x, y, G.out);
  }
  // Hanging cloths
  const ragColors = [G.rustLight, G.bone, G.toxic, G.bannerLight];
  for (let i = 0; i < 4; i++) {
    const rx = lx0 + 4 + i * 6;
    const t = (rx - lx0) / (lx1 - lx0);
    const ry = Math.round(ly0 + t * (ly1 - ly0) + Math.sin(t * Math.PI) * 3);
    const wave = (frame + i) % 2;
    rect(ctx, rx - 1, ry + 1, 3, 4 + wave, G.out);
    rect(ctx, rx, ry + 1, 2, 3 + wave, ragColors[i]!);
  }

  // Yard props
  barrel(ctx, fx + 14, fy + 4, true); // toxic barrel
  crate(ctx, fx + 26, fy + 4, 6);
  crate(ctx, fx + 32, fy + 1, 5);
  scrap(ctx, fx - 22, fy - 3, 7);
  bush(ctx, 110, 100, 3);
  bush(ctx, 18, 108, 3);

  return cv;
}

/**
 * 6. VILLA (Villa, 16 citizens, height 1.4)
 * Warlord mud-court villa: L-shaped compound with a grand 2-storey back-left hall wing
 * and front-right guest wing enclosing a paved courtyard, bone colonnade awning,
 * bubbling toxic slime basin fountain, lush bushes, banner, and scrap crates.
 */
function drawVilla(frame: number): HTMLCanvasElement {
  const [cv, ctx] = canvasHD();
  // Broad ground shadow for the villa compound
  groundShadow(ctx, 64, 122, 48, 48, 14);

  // --- Wing 1: Back-left Main Hall (drawn first) ---
  const w1Fx = 54, w1Fy = 108, w1L = 30, w1R = 26;
  // Lower floor: stone
  box(ctx, w1Fx, w1Fy, w1L, w1R, 14, STONE);
  brickWalls(ctx, w1Fx, w1Fy, w1L, w1R, 14, 4, 5);
  doorR(ctx, w1Fx, w1Fy, 4, 6, 10);
  windowR(ctx, w1Fx, w1Fy, 14, 4, 5, 6);
  windowL(ctx, w1Fx, w1Fy, 8, 4, 5, 6);
  windowL(ctx, w1Fx, w1Fy, 20, 4, 5, 6);
  // Upper floor: daub & timber
  const uy1 = w1Fy - 14;
  box(ctx, w1Fx, uy1, w1L, w1R, 12, DAUB);
  timberFrame(ctx, w1Fx, uy1, w1L, w1R, 12);
  windowR(ctx, w1Fx, uy1, 6, 3, 5, 6);
  windowR(ctx, w1Fx, uy1, 16, 3, 5, 6);
  windowL(ctx, w1Fx, uy1, 10, 3, 5, 6);
  // Roof: moss shingle with chimney
  roof(ctx, w1Fx, uy1 - 12, w1L, w1R, 0, 18, MOSS, true);
  const c = chimney(ctx, w1Fx + 8, uy1 - 12 - 12, 10);
  smoke(ctx, c.x, c.y, frame);

  // --- Wing 2: Front-right Cross Wing ---
  const w2Fx = 80, w2Fy = 120, w2L = 24, w2R = 28;
  // Lower floor: stone
  box(ctx, w2Fx, w2Fy, w2L, w2R, 12, STONE);
  brickWalls(ctx, w2Fx, w2Fy, w2L, w2R, 12, 4, 5);
  doorR(ctx, w2Fx, w2Fy, 8, 7, 10);
  windowR(ctx, w2Fx, w2Fy, 18, 4, 5, 6);
  windowL(ctx, w2Fx, w2Fy, 6, 3, 5, 6);
  // Upper floor: timber planks
  const uy2 = w2Fy - 12;
  box(ctx, w2Fx, uy2, w2L, w2R, 10, WOOD);
  plankWalls(ctx, w2Fx, uy2, w2L, w2R, 10, 3);
  windowR(ctx, w2Fx, uy2, 10, 2, 5, 5);
  windowR(ctx, w2Fx, uy2, 20, 2, 5, 5);
  windowL(ctx, w2Fx, uy2, 8, 2, 5, 5);
  // Roof
  roof(ctx, w2Fx, uy2 - 10, w2L, w2R, 0, 15, MOSS, true);

  // --- Courtyard bone colonnade / veranda connecting the wings ---
  for (const [colX, colY] of [[56, 114], [64, 118], [72, 122]] as const) {
    rect(ctx, colX - 1, colY - 12, 2, 13, G.out);
    rect(ctx, colX, colY - 11, 1, 11, G.bone);
    disc(ctx, colX, colY - 12, 2, G.brass);
  }
  // Timber beam connecting colonnade tops
  for (let x = 56; x <= 72; x++) {
    const t = (x - 56) / (72 - 56);
    const y = Math.round(114 - 12 + t * 8);
    rect(ctx, x, y, 1, 2, G.woodTop);
  }

  // --- Bubbling toxic slime pool fountain in courtyard ---
  const bx = 62, by = 117;
  disc(ctx, bx, by, 6, G.out);
  disc(ctx, bx, by, 5, G.stoneR);
  disc(ctx, bx, by, 4, G.stoneDark);
  disc(ctx, bx, by, 3, G.toxic);
  px(ctx, bx + (frame % 3) - 1, by, G.toxicLight);
  px(ctx, bx, by - 1 + ((frame + 1) % 2), G.toxicLight);

  // --- Warlord skull banner ---
  banner(ctx, 40, 116, 32, frame, false);

  // --- Courtyard and garden props ---
  gear(ctx, 74, 125, 3, frame);
  crate(ctx, 78, 124, 5);
  crate(ctx, 80, 120, 4);
  barrel(ctx, w2Fx + w2R - 4, w2Fy - (w2R >> 1) + 6, false);
  scrap(ctx, 22, 112, 4);

  // Lush greenery
  bush(ctx, 46, 118, 4);
  bush(ctx, 50, 123, 3);
  bush(ctx, 86, 124, 4);
  bush(ctx, 108, 102, 4);
  bush(ctx, 16, 104, 3);

  return cv;
}

/**
 * 7. HIGHRISE (High Rise, 60 citizens, height 2.4)
 * The tallest goblin residential home: a towering 4-tier fortress skyscraper of stone,
 * riveted iron, timber, and scrap. Features multiple cantilever balconies, cargo crane
 * with dangling crate, full-height iron ladder on shaded flank, rooftop boiler vat,
 * smoking pipe, and tall lightning antenna with pulsing toxic summit beacon.
 */
function drawHighrise(frame: number): HTMLCanvasElement {
  const [cv, ctx] = canvasHD();
  // Ground shadow
  groundShadow(ctx, 64, 122, 46, 44, 14);

  // --- Tier 1: Heavy stone & armored iron fortress base (h=20) ---
  const fx1 = 64, fy1 = 122, wL1 = 44, wR1 = 42, h1 = 20;
  box(ctx, fx1, fy1, wL1, wR1, h1, STONE);
  brickWalls(ctx, fx1, fy1, wL1, wR1, h1, 5, 6);
  // Armored iron band along right wall
  rightWallRect(ctx, fx1, fy1, 1, 10, wR1 - 2, 2, G.ironR);
  doorR(ctx, fx1, fy1, 5, 9, 15);
  rivets(ctx, fx1, fy1, wR1, h1, 6);
  windowR(ctx, fx1, fy1, 18, 6, 5, 7);
  windowR(ctx, fx1, fy1, 28, 6, 5, 7);
  windowL(ctx, fx1, fy1, 10, 6, 5, 7);
  windowL(ctx, fx1, fy1, 26, 6, 5, 7);

  // --- Tier 2: Industrial riveted daub & iron mid-tower (h=22) ---
  const uy1 = fy1 - h1;
  const fx2 = 63, fy2 = uy1, wL2 = 38, wR2 = 36, h2 = 22;
  box(ctx, fx2, fy2, wL2, wR2, h2, DAUB);
  timberFrame(ctx, fx2, fy2, wL2, wR2, h2);
  rivets(ctx, fx2, fy2, wR2, h2, 6);
  // Lower row of windows
  windowR(ctx, fx2, fy2, 6, 3, 4, 6);
  windowR(ctx, fx2, fy2, 16, 3, 4, 6);
  windowR(ctx, fx2, fy2, 26, 3, 4, 6);
  windowL(ctx, fx2, fy2, 8, 3, 4, 6);
  windowL(ctx, fx2, fy2, 22, 3, 4, 6);
  // Upper row of windows
  windowR(ctx, fx2, fy2, 6, 13, 4, 6);
  windowR(ctx, fx2, fy2, 16, 13, 4, 6);
  windowR(ctx, fx2, fy2, 26, 13, 4, 6);
  windowL(ctx, fx2, fy2, 8, 13, 4, 6);
  windowL(ctx, fx2, fy2, 22, 13, 4, 6);

  // --- Tier 3: Upper timber shanty tower (h=20) ---
  const uy2 = fy2 - h2;
  const fx3 = 64, fy3 = uy2, wL3 = 32, wR3 = 30, h3 = 20;
  box(ctx, fx3, fy3, wL3, wR3, h3, WOOD);
  plankWalls(ctx, fx3, fy3, wL3, wR3, h3, 3);
  windowR(ctx, fx3, fy3, 6, 4, 5, 6);
  windowR(ctx, fx3, fy3, 18, 4, 5, 6);
  windowL(ctx, fx3, fy3, 8, 4, 5, 6);
  windowL(ctx, fx3, fy3, 18, 4, 5, 6);

  // --- Tier 4: Top lookout shack (h=14) ---
  const uy3 = fy3 - h3;
  const fx4 = 63, fy4 = uy3, wL4 = 24, wR4 = 22, h4 = 14;
  box(ctx, fx4, fy4, wL4, wR4, h4, IRON);
  rivets(ctx, fx4, fy4, wR4, h4, 4);
  windowR(ctx, fx4, fy4, 6, 3, 4, 5);
  windowL(ctx, fx4, fy4, 6, 3, 4, 5);

  // Roof of top shack
  const uy4 = fy4 - h4;
  roof(ctx, fx4, uy4, wL4, wR4, 0, 12, RUST, true);

  // Rooftop scrap iron water vat / boiler
  box(ctx, 44, uy4 - 2, 8, 8, 9, IRON);
  rect(ctx, 48, uy4 - 15, 3, 6, G.out);
  rect(ctx, 49, uy4 - 14, 1, 5, G.ironTop);
  smoke(ctx, 49, uy4 - 16, (frame + 1) % 3);

  // --- Tall jagged iron lightning antenna & pulsing toxic summit beacon ---
  // Antenna mast up to y = 8
  rect(ctx, 60, 10, 2, 26, G.out);
  rect(ctx, 60, 11, 1, 24, G.ironTop);
  rect(ctx, 56, 16, 10, 1, G.ironTop);
  rect(ctx, 58, 22, 6, 1, G.ironTop);
  rect(ctx, 55, 28, 12, 1, G.ironTop);
  // Flashing summit beacon
  disc(ctx, 60, 8, 3, G.out);
  disc(ctx, 60, 8, 2, frame === 0 ? G.toxicLight : frame === 1 ? G.toxic : G.glowHot);
  px(ctx, 60, 8, G.glowHot);

  // --- Iron ladders and catwalks on shaded left flank ---
  leftWallRect(ctx, fx1, fy1, 4, 20, 10, 2, G.ironTop);
  leftWallRect(ctx, fx2, fy2, 4, 22, 10, 2, G.ironTop);
  leftWallRect(ctx, fx3, fy3, 4, 20, 10, 2, G.ironTop);
  // Ladder vertical rails
  leftWallRect(ctx, fx1, fy1, 6, 2, 1, 58, G.ironL);
  leftWallRect(ctx, fx1, fy1, 12, 2, 1, 58, G.ironL);
  for (let z = 4; z < 58; z += 4) {
    leftWallRect(ctx, fx1, fy1, 6, z, 6, 1, G.ironTop);
  }

  // --- Cantilevered cargo boom crane from Tier 3 right wall ---
  rightWallRect(ctx, fx3, fy3, 20, 16, 12, 2, G.woodTop);
  const ropeX = fx3 + 28;
  const ropeY = fy3 - (28 >> 1) - 16;
  rect(ctx, ropeX, ropeY, 1, 10, G.out);
  crate(ctx, ropeX + 2, ropeY + 14, 5);

  // --- Ground yard props ---
  banner(ctx, fx1 - wL1 + 2, fy1 - (wL1 >> 1) + 2, 36, frame, true);
  barrel(ctx, fx1 + wR1 - 4, fy1 - (wR1 >> 1) + 8, true); // toxic barrel
  barrel(ctx, fx1 + wR1 - 10, fy1 - (wR1 >> 1) + 12, false);
  gear(ctx, fx1 + 18, fy1 + 2, 5, frame);
  crate(ctx, fx1 + 8, fy1 + 4, 7);
  scrap(ctx, fx1 - 24, fy1 - 6, 8);
  bush(ctx, 110, 98, 4);
  bush(ctx, 16, 112, 3);

  return cv;
}

export const art: Partial<Record<BuildingKind, () => HTMLCanvasElement[]>> = {
  rowhouse: () => [0, 1, 2].map(drawRowhouse),
  manor: () => [0, 1, 2].map(drawManor),
  cottage: () => [0, 1, 2].map(drawCottage),
  longhouse: () => [0, 1, 2].map(drawLonghouse),
  tenement: () => [0, 1, 2].map(drawTenement),
  villa: () => [0, 1, 2].map(drawVilla),
  highrise: () => [0, 1, 2].map(drawHighrise),
};
