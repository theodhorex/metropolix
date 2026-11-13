// Goblin HD buildings: military (drawn by a worker, see .agy/tasks). Kinds left out fall back to the 1x goblin art.
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
import { isoPitchedRoof, leftWallRect, px, rect, rightWallRect } from '../../sprites';

/** Draw a horned goblin skull trophy on a wall or post. */
function drawSkull(ctx: CanvasRenderingContext2D, cx: number, cy: number, horned = true): void {
  rect(ctx, cx - 2, cy - 2, 5, 4, G.out);
  rect(ctx, cx - 1, cy - 1, 3, 2, G.bone);
  px(ctx, cx - 1, cy + 1, G.boneShade);
  px(ctx, cx + 1, cy + 1, G.boneShade);
  px(ctx, cx - 1, cy, G.out);
  px(ctx, cx + 1, cy, G.out);
  if (horned) {
    px(ctx, cx - 3, cy - 2, G.boneShade);
    px(ctx, cx - 3, cy - 3, G.bone);
    px(ctx, cx + 3, cy - 2, G.boneShade);
    px(ctx, cx + 3, cy - 3, G.bone);
  }
}

/** Draw a flickering wall torch or iron brazier flame. */
function drawTorch(ctx: CanvasRenderingContext2D, x: number, y: number, frame: number, toxic = true): void {
  rect(ctx, x - 1, y, 3, 5, G.out);
  rect(ctx, x, y + 1, 1, 4, G.ironR);
  const shift = frame % 2;
  const c0 = toxic ? G.toxic : G.glowDeep;
  const c1 = toxic ? G.toxicLight : G.glow;
  const c2 = G.glowHot;
  rect(ctx, x - 1, y - 2, 3, 2, c0);
  px(ctx, x + shift - 1, y - 3, c1);
  px(ctx, x, y - 4 + shift, c2);
}

/** Training dummy with cross arms, straw body, iron helmet, and stuck practice arrow. */
function drawTrainingDummy(ctx: CanvasRenderingContext2D, x: number, y: number, frame: number): void {
  // central post
  rect(ctx, x - 1, y - 16, 3, 17, G.out);
  rect(ctx, x, y - 15, 1, 16, G.woodR);
  // cross arm
  rect(ctx, x - 6, y - 12, 13, 3, G.out);
  rect(ctx, x - 5, y - 11, 11, 1, G.woodLight);
  // straw body
  rect(ctx, x - 4, y - 14, 9, 8, G.out);
  rect(ctx, x - 3, y - 13, 7, 6, G.daubR);
  px(ctx, x - 1, y - 11, G.rustR); // target bullseye
  px(ctx, x + 1, y - 11, G.rustR);
  // iron helmet head
  rect(ctx, x - 2, y - 19, 5, 4, G.out);
  rect(ctx, x - 1, y - 18, 3, 3, G.ironTop);
  px(ctx, x - 1, y - 17, G.out); // eye slit
  px(ctx, x + 1, y - 17, G.out);
  // stuck practice arrow (sways slightly with wind)
  const sway = frame === 1 ? 1 : 0;
  rect(ctx, x + 3 + sway, y - 15, 5, 1, G.woodDark);
  px(ctx, x + 8 + sway, y - 15, G.bone);
}

/** Wooden weapon rack holding spears and an iron-rimmed goblin shield. */
function drawWeaponRack(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  rect(ctx, x - 7, y - 12, 2, 13, G.out);
  rect(ctx, x - 6, y - 11, 1, 12, G.woodL);
  rect(ctx, x + 5, y - 12, 2, 13, G.out);
  rect(ctx, x + 6, y - 11, 1, 12, G.woodR);
  rect(ctx, x - 6, y - 7, 12, 2, G.out);
  rect(ctx, x - 5, y - 6, 10, 1, G.woodLight);
  for (let i = 0; i < 3; i++) {
    const sx = x - 4 + i * 4;
    rect(ctx, sx, y - 16, 1, 15, G.woodDark);
    rect(ctx, sx - 1, y - 18, 3, 3, G.out);
    rect(ctx, sx, y - 18, 1, 2, G.ironTop);
  }
  // round goblin buckler leaning on the rack
  disc(ctx, x + 8, y - 4, 4, G.out);
  disc(ctx, x + 8, y - 4, 3, G.rustR);
  disc(ctx, x + 8, y - 4, 1, G.ironTop);
}

/**
 * 1. BARRACKS (Military, height 1.4)
 * Fortified war-hall with stone ground floor, timber-framed upper dormitory,
 * moss shingle roof with rusty tin patch, chimney smoke, rear watch turret,
 * and an open drill yard with training dummy, weapon rack, banners, and spiked fence.
 */
function drawBarracks(frame: number): HTMLCanvasElement {
  const [cv, ctx] = canvasHD();

  // Ground shadow under the barracks building and drill yard perimeter
  groundShadow(ctx, 60, 120, 50, 42, 12);

  // Main barracks war-hall (stone base + timber upper floor)
  const fx = 56, fy = 112, wL = 46, wR = 24;

  // Ground floor: chunky stone masonry
  box(ctx, fx, fy, wL, wR, 18, STONE);
  brickWalls(ctx, fx, fy, wL, wR, 18, 4, 6);
  doorR(ctx, fx, fy, 6, 8, 14); // entrance from drill yard
  windowL(ctx, fx, fy, 10, 6, 5, 7);
  windowL(ctx, fx, fy, 26, 6, 5, 7);

  // Upper floor: daub and timber framing
  const uy = fy - 18;
  box(ctx, fx, uy, wL, wR, 14, DAUB);
  timberFrame(ctx, fx, uy, wL, wR, 14);
  windowR(ctx, fx, uy, 8, 4, 5, 6);
  windowL(ctx, fx, uy, 12, 4, 5, 6);
  windowL(ctx, fx, uy, 28, 4, 5, 6);

  // Roof: moss shingle with rust tin patch
  roof(ctx, fx, uy, wL, wR, 14, 20, MOSS, true);
  const ch = chimney(ctx, 40, uy - 18, 11);
  smoke(ctx, ch.x, ch.y, frame);

  // Rear-left stone watch turret with crenellations & skull trophy
  const tFx = 26, tFy = 94, tW = 14, tH = 32;
  box(ctx, tFx, tFy, tW, tW, tH, STONE);
  brickWalls(ctx, tFx, tFy, tW, tW, tH, 4, 5);
  // Turret crenellations
  for (const v of [1, 7, 12]) {
    rightWallRect(ctx, tFx, tFy, v, tH, 2, 3, G.stoneR);
    px(ctx, tFx + v, tFy - (v >> 1) - tH - 3, G.stoneTop);
  }
  for (const u of [1, 7, 12]) {
    leftWallRect(ctx, tFx, tFy, u, tH, 2, 3, G.stoneL);
  }
  drawSkull(ctx, tFx + 6, tFy - 3 - tH, true);
  banner(ctx, tFx + 2, tFy - (tW >> 1) - tH, 22, frame, true);

  // Drill Yard (dirt ground with training equipment on the right side)
  // Cobble / dirt patches on the drill yard floor
  for (let u = 2; u < 20; u += 3) {
    for (let v = 6; v < 22; v += 4) {
      const sx = 58 - u + v;
      const sy = 114 - ((u + v) >> 1);
      px(ctx, sx, sy, (u + v) % 2 === 0 ? G.dirt : G.dirtLight);
    }
  }

  // Spiked timber fence bordering the drill yard perimeter
  stakes(ctx, 84, 108, 118, -0.5, 9);

  // Training dummy in drill yard
  drawTrainingDummy(ctx, 86, 110, frame);

  // Weapon rack with spears and shield
  drawWeaponRack(ctx, 72, 116);

  // Grand skull banner at entrance to drill yard
  banner(ctx, 104, 114, 32, frame, false);

  // Yard military props: crate of broadswords, grog barrel, scrap metal
  crate(ctx, 60, 118, 6);
  barrel(ctx, 98, 116, false);
  scrap(ctx, 32, 112, 4);
  bush(ctx, 112, 98, 4);

  return cv;
}

/**
 * 2. TOWER (Military, Defence Tower, height 2.2)
 * Towering multi-tiered defensive stronghold with heavy stone base, riveted iron
 * mid-tier with arrow slits, overhanging machicolated parapet, spiked conical roof,
 * signal brazier, skull trophies, and perimeter defense stakes.
 */
function drawTower(frame: number): HTMLCanvasElement {
  const [cv, ctx] = canvasHD();

  // Ground shadow
  groundShadow(ctx, 64, 120, 38, 38, 12);

  // Tier 1: Heavy stone masonry bastion base (h = 24)
  const bFx = 64, bFy = 120, bW = 34, bH = 24;
  box(ctx, bFx, bFy, bW, bW, bH, STONE);
  brickWalls(ctx, bFx, bFy, bW, bW, bH, 4, 6);
  rivets(ctx, bFx, bFy, bW, bH, 5); // iron reinforcement band along skirt

  // Arched reinforced iron gateway on right wall
  doorR(ctx, bFx, bFy, 12, 10, 15);
  // Arrow slit windows with warm glow
  windowR(ctx, bFx, bFy, 4, 10, 4, 7);
  windowR(ctx, bFx, bFy, 26, 10, 4, 7);
  windowL(ctx, bFx, bFy, 8, 10, 4, 7);
  windowL(ctx, bFx, bFy, 22, 10, 4, 7);

  // Tier 2: Mid-level riveted iron & dark timber defensive tower (h = 24)
  const mFx = 64, mFy = bFy - bH, mW = 28, mH = 24;
  // Overhanging timber corbel brackets supporting Tier 2
  for (let v = 1; v < bW - 1; v += 6) {
    rightWallRect(ctx, bFx, bFy, v, bH - 2, 3, 2, G.woodR);
  }
  for (let u = 1; u < bW - 1; u += 6) {
    leftWallRect(ctx, bFx, bFy, u, bH - 2, 3, 2, G.woodL);
  }

  box(ctx, mFx, mFy, mW, mW, mH, IRON);
  rivets(ctx, mFx, mFy, mW, mH, 5);
  // Cross-timber bracing
  timberFrame(ctx, mFx, mFy, mW, mW, mH);
  // Narrow vertical arrow slits with toxic glow
  for (const v of [6, 14, 21]) {
    rightWallRect(ctx, mFx, mFy, v, 8, 2, 6, G.out);
    rightWallRect(ctx, mFx, mFy, v, 9, 1, 4, G.glowHot);
  }
  for (const u of [6, 14, 21]) {
    leftWallRect(ctx, mFx, mFy, u, 8, 2, 6, G.out);
    leftWallRect(ctx, mFx, mFy, u, 9, 1, 4, G.glowDeep);
  }

  // Tier 3: Overhanging Machicolated Crow's Nest / Parapet (h = 10)
  const pFx = 65, pFy = mFy - mH, pW = 30, pH = 10;
  // Stone corbels under the parapet
  for (let v = 0; v < mW; v += 5) {
    rightWallRect(ctx, mFx, mFy, v, mH - 1, 2, 2, G.stoneTop);
  }
  for (let u = 0; u < mW; u += 5) {
    leftWallRect(ctx, mFx, mFy, u, mH - 1, 2, 2, G.stoneL);
  }

  box(ctx, pFx, pFy, pW, pW, pH, STONE);
  brickWalls(ctx, pFx, pFy, pW, pW, pH, 3, 5);

  // Spiked crenellations / merlons on battlements
  for (const v of [1, 8, 15, 22, 28]) {
    rightWallRect(ctx, pFx, pFy, v, pH, 3, 4, G.stoneR);
    px(ctx, pFx + v + 1, pFy - (v >> 1) - pH - 4, G.stoneTop);
    px(ctx, pFx + v + 1, pFy - (v >> 1) - pH - 5, G.bone); // bone pike tip
  }
  for (const u of [1, 8, 15, 22, 28]) {
    leftWallRect(ctx, pFx, pFy, u, pH, 3, 4, G.stoneL);
  }

  // Roof cap: conical peaked rust-and-moss shingle roof reaching high up (peak at y=16)
  const rFx = 65, rFy = pFy - pH + 2, rW = 22, rH = 18;
  roof(ctx, rFx, rFy, rW, rW, 0, rH, RUST, true);

  // Skull trophy over the gatehouse arch
  drawSkull(ctx, 77, 102, true);

  // Signal fire brazier on the right corner of the battlement
  const bzX = pFx + pW - 2, bzY = pFy - (pW >> 1) - pH - 2;
  drawTorch(ctx, bzX, bzY, frame, true);

  // War banner flying high from the tower roof peak
  banner(ctx, 65, rFy - rH - 2, 20, frame, false);

  // Ground surroundings: defense stakes, toxic barrel, crate of bolts, scrap
  stakes(ctx, 24, 46, 114, 0.5, 9);
  barrel(ctx, 94, 114, true); // glowing toxic barrel
  crate(ctx, 76, 122, 6);
  scrap(ctx, 42, 118, 5);
  bush(ctx, 104, 102, 4);

  return cv;
}

/**
 * 3. PALISADE (Military, height 0.8)
 * Defensive perimeter wall segment of heavy sharpened timber logs and rusty iron girders,
 * reinforced with crossbars and rivets, rear elevated patrol walkway with ladder,
 * central fortified gatehouse with horned skull trophy and gate torches, ditch stakes,
 * and waving green banner.
 */
function drawPalisade(frame: number): HTMLCanvasElement {
  const [cv, ctx] = canvasHD();

  const fx = 64, fy = 120, wL = 46, wR = 46;

  // Ground shadow falling forward-left
  groundShadow(ctx, fx, fy, wL, 24, 10);

  // Rear patrol walkway (catwalk deck behind the log wall at z = 10)
  // Left walkway
  leftWallRect(ctx, fx, fy, 2, 10, wL - 4, 3, G.woodL);
  // Walkway support stilts along left face
  for (let u = 8; u < wL - 6; u += 12) {
    leftWallRect(ctx, fx, fy, u, 0, 2, 10, G.woodDark);
    leftWallRect(ctx, fx, fy, u + 2, 4, 6, 2, G.woodL); // diagonal bracket
  }
  // Right walkway
  rightWallRect(ctx, fx, fy, 20, 10, wR - 22, 3, G.woodR);
  // Walkway support stilts along right face
  for (let v = 22; v < wR - 6; v += 12) {
    rightWallRect(ctx, fx, fy, v, 0, 2, 10, G.woodL);
  }

  // Wooden access ladder to the walkway on the left
  const ladU = 24;
  leftWallRect(ctx, fx, fy, ladU, 0, 1, 12, G.woodDark);
  leftWallRect(ctx, fx, fy, ladU + 5, 0, 1, 12, G.woodDark);
  for (let z = 2; z <= 10; z += 2) {
    leftWallRect(ctx, fx, fy, ladU, z, 6, 1, G.woodLight);
  }

  // Walkway rear railing
  for (let u = 4; u < wL - 4; u += 2) {
    if (u % 8 === 0) leftWallRect(ctx, fx, fy, u, 12, 1, 6, G.woodDark);
  }
  leftWallRect(ctx, fx, fy, 4, 17, wL - 8, 1, G.woodR);

  // Sharpened pine logs and iron girders along the LEFT wall segment
  for (let u = 0; u < wL; u += 3) {
    const isIron = u % 9 === 0;
    const isRust = u % 9 === 6;
    const logH = 18 + ((u * 7) % 7); // jagged varying height
    const x = fx - 1 - u;
    const yBot = fy - (u >> 1);

    // log body with outline
    rect(ctx, x - 1, yBot - logH, 3, logH + 1, G.out);
    rect(
      ctx,
      x,
      yBot - logH + 1,
      1,
      logH - 1,
      isIron ? G.ironL : isRust ? G.rustL : u % 2 === 0 ? G.woodL : G.woodDark
    );
    // sharpened chisel/conical point
    px(ctx, x, yBot - logH - 1, isIron ? G.ironTop : G.bone);
    if (u % 12 === 0) {
      px(ctx, x, yBot - logH + 3, G.rivet);
    }
  }
  // Iron reinforcing horizontal bands along left face
  leftWallRect(ctx, fx, fy, 1, 5, wL - 2, 2, G.ironDark);
  leftWallRect(ctx, fx, fy, 1, 14, wL - 2, 2, G.ironDark);

  // Sharpened logs along the RIGHT wall segment (with gate gap between v = 6..22)
  for (let v = 0; v < wR; v += 3) {
    if (v >= 6 && v <= 21) continue; // gate opening
    const isIron = v % 9 === 0;
    const isRust = v % 9 === 3;
    const logH = 18 + ((v * 5) % 7);
    const x = fx + v;
    const yBot = fy - (v >> 1);

    rect(ctx, x - 1, yBot - logH, 3, logH + 1, G.out);
    rect(
      ctx,
      x,
      yBot - logH + 1,
      1,
      logH - 1,
      isIron ? G.ironR : isRust ? G.rustR : v % 2 === 0 ? G.woodR : G.woodLight
    );
    px(ctx, x, yBot - logH - 1, isIron ? G.ironTop : G.bone);
    if (v % 12 === 0) {
      px(ctx, x, yBot - logH + 3, G.rivet);
    }
  }
  // Iron reinforcing bands on right wall
  rightWallRect(ctx, fx, fy, 22, 5, wR - 23, 2, G.ironL);
  rightWallRect(ctx, fx, fy, 22, 14, wR - 23, 2, G.ironL);

  // Reinforced Gatehouse Portal (v = 6..21)
  // Massive gateposts
  rightWallRect(ctx, fx, fy, 5, 0, 3, 24, G.woodDark);
  rightWallRect(ctx, fx, fy, 6, 1, 1, 23, G.ironTop);
  rightWallRect(ctx, fx, fy, 21, 0, 3, 24, G.woodDark);
  rightWallRect(ctx, fx, fy, 22, 1, 1, 23, G.ironTop);

  // Overhead lintel beam across the gate
  rightWallRect(ctx, fx, fy, 5, 21, 18, 3, G.woodR);
  rightWallRect(ctx, fx, fy, 6, 22, 16, 1, G.ironTop);

  // Double wooden gate doors with iron diagonal crossbars and iron studs
  rightWallRect(ctx, fx, fy, 8, 1, 13, 19, G.out);
  rightWallRect(ctx, fx, fy, 9, 1, 5, 18, G.woodDark); // left leaf
  rightWallRect(ctx, fx, fy, 15, 1, 5, 18, G.woodL); // right leaf
  // Iron hinges and cross straps
  rightWallRect(ctx, fx, fy, 8, 4, 13, 2, G.ironL);
  rightWallRect(ctx, fx, fy, 8, 14, 13, 2, G.ironL);
  for (const stud of [10, 13, 16, 19]) {
    rightWallRect(ctx, fx, fy, stud, 5, 1, 1, G.rivet);
    rightWallRect(ctx, fx, fy, stud, 15, 1, 1, G.rivet);
  }
  // Iron spikes jutting downward from lintel like teeth
  for (const vTooth of [9, 12, 15, 18]) {
    rightWallRect(ctx, fx, fy, vTooth, 18, 1, 3, G.ironTop);
  }

  // Horned skull trophy mounted proudly over the gate
  drawSkull(ctx, 77, 100, true);

  // Gate torches on the gateposts
  drawTorch(ctx, 68, 97, frame, false);
  drawTorch(ctx, 84, 89, frame, false);

  // Tall skull banner waving above the left gatepost
  banner(ctx, 64, 88, 28, frame, true);

  // Outward ditch stakes in front of the palisade
  stakes(ctx, 22, 52, 122, 0.5, 8);
  stakes(ctx, 84, 108, 122, -0.5, 8);

  // Yard props: crate of nails/girders, toxic tar barrel, scrap pile
  crate(ctx, 54, 122, 6);
  barrel(ctx, 106, 100, true);
  scrap(ctx, 36, 116, 3);
  bush(ctx, 112, 104, 3);

  return cv;
}

/**
 * 4. WATCHTOWER (Military, height 2.0)
 * Tall timber stilt sentry tower with four heavy log pilings, multi-tiered diagonal
 * X-cross-bracing, climbing access ladder, reinforced crow's nest cabin with arrow slits,
 * steep rusty tin hip roof, projecting beam with roaring green signal brazier, and skull banner.
 */
function drawWatchtower(frame: number): HTMLCanvasElement {
  const [cv, ctx] = canvasHD();

  const fx = 64, fy = 120;

  // Ground shadow under the tower legs and shelter
  groundShadow(ctx, fx, fy, 32, 32, 10);

  // Small stone & plank ground sentry shelter at the tower base
  const sFx = 58, sFy = 116, sW = 16, sH = 11;
  box(ctx, sFx, sFy, sW, sW, sH, STONE);
  brickWalls(ctx, sFx, sFy, sW, sW, sH, 3, 5);
  doorR(ctx, sFx, sFy, 4, 6, 9);
  windowL(ctx, sFx, sFy, 5, 3, 4, 5);

  // Four massive timber stilt legs rising from ground up to y = 56
  // Leg geometry:
  // Front leg: base at (fx, fy) = (64, 120), top at (64, 60)
  rect(ctx, 63, 60, 3, 61, G.out);
  rect(ctx, 64, 61, 1, 59, G.woodR);

  // Left leg: base at (fx - 24, fy - 12) = (40, 108), top at (40, 48)
  rect(ctx, 39, 48, 3, 61, G.out);
  rect(ctx, 40, 49, 1, 59, G.woodL);

  // Right leg: base at (fx + 24, fy - 12) = (88, 108), top at (88, 48)
  rect(ctx, 87, 48, 3, 61, G.out);
  rect(ctx, 88, 49, 1, 59, G.woodR);

  // Back leg: base at (fx, fy - 24) = (64, 96), top at (64, 36)
  rect(ctx, 63, 36, 3, 61, G.out);
  rect(ctx, 64, 37, 1, 59, G.woodDark);

  // Horizontal tie-beams and diagonal X-braces
  // Level 1 braces (y ~ 96..104)
  for (let k = 0; k < 24; k++) {
    // left-front face brace
    const xL = 40 + k;
    const yL = 100 - (k >> 1);
    px(ctx, xL, yL, G.woodDark);
    px(ctx, xL, yL + 6, G.woodL);
    // right-front face brace
    const xR = 64 + k;
    const yR = 88 + (k >> 1);
    px(ctx, xR, yR, G.woodR);
    px(ctx, xR, yR + 6, G.woodDark);
  }

  // Level 2 braces (y ~ 74..82)
  for (let k = 0; k < 24; k++) {
    const xL = 40 + k;
    const yL = 76 - (k >> 1);
    px(ctx, xL, yL, G.woodDark);
    px(ctx, xL, yL + 5, G.woodL);
    const xR = 64 + k;
    const yR = 64 + (k >> 1);
    px(ctx, xR, yR, G.woodR);
    px(ctx, xR, yR + 5, G.woodDark);
  }

  // Climbing wooden ladder up the front-left stilt
  for (let y = 62; y < 118; y += 3) {
    rect(ctx, 42 + Math.floor(((118 - y) * 20) / 56), y, 3, 1, G.woodLight);
  }

  // Crow's Nest Lookout Cabin on top (y = 58)
  // Cantilevered wooden deck platform
  const cFx = 64, cFy = 58, cW = 26, cH = 15;
  box(ctx, cFx, cFy, cW, cW, 3, WOOD);

  // Cabin structure on deck
  const bFx = 63, bFy = cFy - 3, bW = 20, bH = 14;
  box(ctx, bFx, bFy, bW, bW, bH, WOOD);
  plankWalls(ctx, bFx, bFy, bW, bW, bH, 3);
  rivets(ctx, bFx, bFy, bW, bH, 4);

  // Lookout slit windows with warm light
  windowR(ctx, bFx, bFy, 7, 4, 5, 6, true);
  windowL(ctx, bFx, bFy, 7, 4, 5, 6, true);

  // Deck guard railing around the cabin
  rightWallRect(ctx, cFx, cFy, 1, 3, cW - 2, 5, G.out);
  rightWallRect(ctx, cFx, cFy, 2, 4, cW - 4, 3, G.woodR);
  leftWallRect(ctx, cFx, cFy, 1, 3, cW - 2, 5, G.out);
  leftWallRect(ctx, cFx, cFy, 2, 4, cW - 4, 3, G.woodL);

  // Steep pyramidal roof with rusty tin and moss shingles (reaches y = 18)
  roof(ctx, bFx, bFy - bH, bW, bW, 0, 18, RUST, true);

  // Horned skull trophy on front gable
  drawSkull(ctx, 64, bFy - bH - 3, true);

  // Projecting beam on right deck with roaring toxic signal brazier
  const bzX = cFx + cW - 4;
  const bzY = cFy - (cW >> 1) - 4;
  rect(ctx, bzX - 2, bzY - 6, 7, 2, G.out);
  rect(ctx, bzX - 1, bzY - 5, 5, 1, G.ironTop);
  drawTorch(ctx, bzX + 1, bzY - 6, frame, true);

  // Green goblin banner waving on a timber pole atop the left platform
  banner(ctx, 42, 46, 24, frame, true);

  // Ground props: crate of crossbow bolts, glowing barrel, scrap pile, bush
  crate(ctx, 74, 120, 6);
  barrel(ctx, 86, 114, true);
  scrap(ctx, 42, 116, 4);
  bush(ctx, 102, 102, 4);

  return cv;
}

/**
 * 5. ARMORY (Military, height 1.3)
 * Heavy riveted iron & stone munitions bunker and blacksmith armory, with vaulted
 * iron door, brass padlock gear, glowing forge hearth slit windows, stone forge chimney
 * with thick smoke and flying sparks, bomb piles with sputtering fuses, weapon racks, and anvil.
 */
function drawArmory(frame: number): HTMLCanvasElement {
  const [cv, ctx] = canvasHD();

  const fx = 64, fy = 120, wL = 46, wR = 38, wallH = 22;

  // Heavy ground shadow
  groundShadow(ctx, fx, fy, wL, wR, 12);

  // Ground floor: Heavy dressed stone masonry bunker walls
  box(ctx, fx, fy, wL, wR, wallH, STONE);
  brickWalls(ctx, fx, fy, wL, wR, wallH, 4, 6);

  // Iron armor reinforcing plates and rivets along lower and upper wall
  rivets(ctx, fx, fy, wR, wallH, 5);
  for (let v = 2; v < wR - 2; v += 10) {
    rightWallRect(ctx, fx, fy, v, 2, 4, wallH - 4, G.ironR);
    rightWallRect(ctx, fx, fy, v + 1, 3, 2, wallH - 6, G.ironTop);
  }
  for (let u = 2; u < wL - 2; u += 10) {
    leftWallRect(ctx, fx, fy, u, 2, 4, wallH - 4, G.ironL);
  }

  // Heavy vaulted iron blast door on right wall
  rightWallRect(ctx, fx, fy, 13, 0, 12, 17, G.out);
  rightWallRect(ctx, fx, fy, 14, 1, 10, 15, G.ironDark);
  rightWallRect(ctx, fx, fy, 15, 2, 8, 13, G.rustDark);
  // Heavy iron cross-bars and diagonal bracing on door
  rightWallRect(ctx, fx, fy, 14, 4, 10, 2, G.ironL);
  rightWallRect(ctx, fx, fy, 14, 11, 10, 2, G.ironL);
  // Massive brass vault wheel / padlock
  gear(ctx, fx + 19, fy - 10, 3, frame);

  // Narrow barred forge windows glowing with blazing furnace fire
  // Right wall window
  rightWallRect(ctx, fx, fy, 5, 8, 5, 8, G.out);
  rightWallRect(ctx, fx, fy, 6, 9, 3, 6, G.glowDeep);
  rightWallRect(ctx, fx, fy, 7, 10, 1, 4, G.glowHot);
  rightWallRect(ctx, fx, fy, 6, 12, 3, 1, G.ironDark); // iron bar
  // Left wall windows
  leftWallRect(ctx, fx, fy, 10, 8, 5, 8, G.out);
  leftWallRect(ctx, fx, fy, 11, 9, 3, 6, G.glowDeep);
  leftWallRect(ctx, fx, fy, 12, 10, 1, 4, G.glowHot);
  leftWallRect(ctx, fx, fy, 11, 12, 3, 1, G.ironDark);

  leftWallRect(ctx, fx, fy, 28, 8, 5, 8, G.out);
  leftWallRect(ctx, fx, fy, 29, 9, 3, 6, G.glowDeep);
  leftWallRect(ctx, fx, fy, 30, 10, 1, 4, G.glowHot);
  leftWallRect(ctx, fx, fy, 29, 12, 3, 1, G.ironDark);

  // Spiked crenellated battlements along parapet rim
  for (const v of [1, 9, 17, 25, 33]) {
    rightWallRect(ctx, fx, fy, v, wallH, 3, 4, G.ironR);
    px(ctx, fx + v + 1, fy - (v >> 1) - wallH - 4, G.bone); // bone pike
  }
  for (const u of [1, 9, 17, 25, 33, 41]) {
    leftWallRect(ctx, fx, fy, u, wallH, 3, 4, G.ironL);
    px(ctx, fx - 1 - u, fy - (u >> 1) - wallH - 4, G.bone);
  }

  // Low-pitched rusty tin roof with rivets
  roof(ctx, fx, fy - wallH, wL, wR, 0, 14, RUST, true);

  // Massive stone smithy chimney belching thick smoke and sparks
  const ch = chimney(ctx, 42, fy - wallH - 6, 14);
  smoke(ctx, ch.x, ch.y, frame);
  // Sputtering fiery forge sparks floating from chimney
  const sparkShift = frame % 2;
  px(ctx, ch.x + sparkShift - 1, ch.y - 3, G.glowHot);
  px(ctx, ch.x + 2, ch.y - 6 - sparkShift, G.glowDeep);

  // Horned skull trophy mounted above vault gate
  drawSkull(ctx, 77, 98, true);

  // Outside Blacksmith Anvil on wooden stump
  const ax = 78, ay = 118;
  rect(ctx, ax - 3, ay - 6, 6, 7, G.out);
  rect(ctx, ax - 2, ay - 5, 4, 6, G.woodR); // stump
  rect(ctx, ax - 4, ay - 9, 8, 4, G.out);
  rect(ctx, ax - 3, ay - 8, 6, 2, G.ironTop); // anvil body
  rect(ctx, ax - 5, ay - 8, 2, 1, G.ironTop); // horn
  // Hammer resting on anvil
  rect(ctx, ax - 1, ay - 10, 4, 1, G.woodDark);
  px(ctx, ax + 3, ay - 10, G.ironTop);

  // Stack of iron cannonballs / round bomb spheres with sputtering fuses
  const bx = 96, by = 114;
  disc(ctx, bx, by, 3, G.out);
  disc(ctx, bx, by, 2, G.ironDark);
  disc(ctx, bx + 5, by - 2, 3, G.out);
  disc(ctx, bx + 5, by - 2, 2, G.ironDark);
  disc(ctx, bx + 2, by - 5, 3, G.out);
  disc(ctx, bx + 2, by - 5, 2, G.ironDark);
  // Sputtering burning fuse spark!
  px(ctx, bx + 3, by - 8, G.woodDark); // fuse cord
  px(ctx, bx + 3 + (frame % 2), by - 9, G.glowHot);

  // Weapon rack with halberds and shields on the left yard
  drawWeaponRack(ctx, 36, 114);

  // Crates of spare weapons and glowing toxic coolant barrel
  crate(ctx, 62, 120, 7);
  barrel(ctx, 106, 106, true);

  // Warlord war banner flying from the left parapet
  banner(ctx, 26, 88, 26, frame, true);

  bush(ctx, 112, 100, 3);

  return cv;
}

/**
 * 6. WARCAMP (Military, War Camp: tents, height 1.0)
 * Bustling goblin raiding encampment with large horned Warlord yurt pavilion,
 * A-frame canvas troop wedge tents, central roaring campfire with leaping flames,
 * meat roasting spit, supply crates, loot chests, grog barrels, and perimeter war banners.
 */
function drawWarcamp(frame: number): HTMLCanvasElement {
  const [cv, ctx] = canvasHD();

  // Dirt, mud, and ash ground pad with cobbles
  groundShadow(ctx, 64, 122, 48, 46, 10);

  // 1. BACK-LEFT: Warlord's Command Yurt (large conical tent of stitched hides and tusks)
  const yCx = 44, yCy = 86, yR = 19, yH = 34;
  // Conical dome profile
  for (let dy = 0; dy <= yH; dy++) {
    const y = yCy - dy;
    const progress = dy / yH;
    const halfW = Math.max(1, Math.round(yR * (1 - progress * 0.85)));
    rect(ctx, yCx - halfW - 1, y, halfW * 2 + 3, 1, G.out);
    for (let dx = -halfW; dx <= halfW; dx++) {
      const isLit = dx > 0;
      const isSeam = (Math.abs(dx) % 5 === 0) || (dy % 8 === 0);
      const col = isSeam
        ? G.woodDark
        : isLit
        ? dy % 6 === 2
          ? G.rustR
          : G.woodR
        : dy % 6 === 2
        ? G.rustL
        : G.woodL;
      px(ctx, yCx + dx, y, col);
    }
  }
  // Open tent flap entrance showing warm firelight
  rect(ctx, yCx + 2, yCy - 11, 7, 12, G.out);
  rect(ctx, yCx + 3, yCy - 10, 5, 11, G.glowDeep);
  rect(ctx, yCx + 4, yCy - 8, 3, 8, G.glowHot);
  // Horned war skull crowning the command yurt peak
  drawSkull(ctx, yCx, yCy - yH - 2, true);
  // Smoke plume rising from yurt smoke hole
  smoke(ctx, yCx, yCy - yH - 4, frame);

  // 2. BACK-RIGHT: Raider Troop Wedge Tent (A-frame canvas and rust hide)
  const t2Fx = 88, t2Fy = 94, t2L = 18, t2R = 26;
  isoPitchedRoof(ctx, t2Fx, t2Fy, t2L, t2R, 0, 16, {
    leftSlope: G.woodDark,
    rightSlope: G.rustR,
    gable: G.daubDark,
    ridge: G.woodTop,
    outline: G.out,
  });
  // Guy ropes with wooden ground pegs
  for (let v = 4; v < t2R - 4; v += 8) {
    const rx = t2Fx + v + 3;
    const ry = t2Fy - (v >> 1) + 2;
    rect(ctx, rx, ry, 1, 3, G.woodLight);
  }
  // Open tent flap
  rightWallRect(ctx, t2Fx, t2Fy, 2, 0, 6, 8, G.out);
  rightWallRect(ctx, t2Fx, t2Fy, 3, 0, 4, 7, G.glow);

  // 3. FRONT-LEFT: Sentry Ridge Tent (smaller wedge tent)
  const t3Fx = 40, t3Fy = 116, t3L = 14, t3R = 14;
  isoPitchedRoof(ctx, t3Fx, t3Fy, t3L, t3R, 0, 12, {
    leftSlope: G.mossL,
    rightSlope: G.mossR,
    gable: G.daubL,
    ridge: G.mossRidge,
    outline: G.out,
  });

  // 4. CENTRAL CAMPFIRE & ROASTING PIT (x = 68, y = 104)
  // Cobble stone ring
  const fCx = 68, fCy = 104;
  for (let a = 0; a < 8; a++) {
    const rad = (a / 8) * Math.PI * 2;
    const sx = Math.round(fCx + Math.cos(rad) * 9);
    const sy = Math.round(fCy + Math.sin(rad) * 5);
    rect(ctx, sx - 1, sy - 1, 3, 2, G.cobbleDark);
    px(ctx, sx, sy - 1, G.cobbleLight);
  }
  // Ash bed and glowing charcoal
  disc(ctx, fCx, fCy, 5, G.out);
  disc(ctx, fCx, fCy, 4, '#241a12');
  disc(ctx, fCx, fCy, 2, G.rustDark);

  // 3-frame animated leaping campfire flames
  const fShift = frame % 2;
  const fHeight = 8 + (frame === 1 ? 2 : 0);
  rect(ctx, fCx - 3, fCy - fHeight, 7, fHeight, G.out);
  rect(ctx, fCx - 2, fCy - fHeight + 1, 5, fHeight - 1, G.rustR);
  rect(ctx, fCx - 2 + fShift, fCy - fHeight - 1, 4, fHeight - 2, G.glow);
  rect(ctx, fCx - 1, fCy - fHeight - 2 - fShift, 3, fHeight - 3, G.glowHot);
  // Toxic green ember sparks popping in the fire
  px(ctx, fCx + (frame === 0 ? -2 : 2), fCy - fHeight - 4, G.toxicLight);
  px(ctx, fCx + 1, fCy - fHeight - 5, G.glowHot);

  // Iron cooking spit with roasting meat
  rect(ctx, fCx - 9, fCy - 10, 2, 10, G.ironDark);
  rect(ctx, fCx + 8, fCy - 10, 2, 10, G.ironR);
  rect(ctx, fCx - 9, fCy - 10, 19, 1, G.ironTop); // spit bar
  rect(ctx, fCx - 4, fCy - 12, 8, 4, G.woodR); // roasting meat
  px(ctx, fCx - 2, fCy - 11, G.rustLight);

  // 5. CAMP PERIMETER PROPS & WEAPONS
  // Spiked bone boundary stakes along right edge
  stakes(ctx, 88, 108, 118, -0.5, 8);

  // Weapon rack with spears near the troop tent
  drawWeaponRack(ctx, 94, 112);

  // Plunder chests and supply crates
  crate(ctx, 52, 118, 6);
  crate(ctx, 58, 119, 5);

  // Barrels: grog and toxic brew
  barrel(ctx, 28, 106, false);
  barrel(ctx, 78, 98, true);

  // Grand War Banners flanking the camp
  banner(ctx, 24, 88, 30, frame, true);
  banner(ctx, 106, 96, 28, frame, false);

  bush(ctx, 114, 102, 3);
  scrap(ctx, 48, 122, 5);

  return cv;
}

/**
 * 7. FORTRESS (Military, height 2.3)
 * The crowning goblin military stronghold: massive stone curtain wall barbican,
 * portcullis gate with iron fangs, fanged doors, terrace battlements with mounted shields,
 * towering central stone and iron citadel keep, portcullis winch gear, high corner watch spire
 * with conical roof and chimney smoke, summit warlord battlement with grand fluttering war banner,
 * signal beacon, defense ditch stakes, and weapons yard.
 */
function drawFortress(frame: number): HTMLCanvasElement {
  const [cv, ctx] = canvasHD();

  // Ground shadow under the massive fortress footprint
  groundShadow(ctx, 64, 122, 54, 50, 14);

  // =========================================================================
  // TIER 1: Lower Outer Curtain Wall Bastion & Barbican (h = 20)
  // =========================================================================
  const lFx = 64, lFy = 122, lW = 52, lH = 20, lR = 48;
  box(ctx, lFx, lFy, lW, lR, lH, STONE);
  brickWalls(ctx, lFx, lFy, lW, lR, lH, 4, 6);
  rivets(ctx, lFx, lFy, lR, lH, 6);

  // Iron reinforcing corner plates
  for (let v = 2; v < 8; v += 2) {
    rightWallRect(ctx, lFx, lFy, v, 1, 1, lH - 2, G.ironR);
  }
  for (let u = 2; u < 8; u += 2) {
    leftWallRect(ctx, lFx, lFy, u, 1, 1, lH - 2, G.ironL);
  }

  // Fortified Barbican Gatehouse on right wall (v = 15..34)
  // Arched gate surround
  rightWallRect(ctx, lFx, lFy, 15, 0, 19, 17, G.out);
  rightWallRect(ctx, lFx, lFy, 16, 1, 17, 15, G.stoneDark);
  rightWallRect(ctx, lFx, lFy, 17, 1, 15, 14, '#141210'); // dark gateway interior
  // Portcullis with downward fanged iron teeth
  for (const vTooth of [18, 21, 24, 27, 30]) {
    rightWallRect(ctx, lFx, lFy, vTooth, 6, 1, 9, G.ironTop);
    px(ctx, lFx + vTooth, lFy - (vTooth >> 1) - 6, G.ironTop); // sharp tooth point
  }
  rightWallRect(ctx, lFx, lFy, 17, 10, 15, 1, G.ironR); // portcullis horizontal bar
  rightWallRect(ctx, lFx, lFy, 17, 14, 15, 1, G.ironR);

  // Heavy timber & iron gate doors behind portcullis
  rightWallRect(ctx, lFx, lFy, 18, 1, 6, 8, G.woodDark);
  rightWallRect(ctx, lFx, lFy, 25, 1, 6, 8, G.woodL);
  rightWallRect(ctx, lFx, lFy, 18, 3, 13, 1, G.ironL); // hinge bar

  // Giant horned war skull trophy mounted above barbican gate
  drawSkull(ctx, 89, 98, true);

  // Gate torches flanking the barbican portal
  drawTorch(ctx, 77, 95, frame, false);
  drawTorch(ctx, 100, 84, frame, false);

  // Slit arrow-loop windows on curtain walls
  windowR(ctx, lFx, lFy, 8, 8, 4, 7);
  windowR(ctx, lFx, lFy, 40, 8, 4, 7);
  windowL(ctx, lFx, lFy, 12, 8, 4, 7);
  windowL(ctx, lFx, lFy, 28, 8, 4, 7);
  windowL(ctx, lFx, lFy, 42, 8, 4, 7);

  // Lower terrace parapet corbels and crenellations
  for (const v of [1, 7, 13, 36, 42]) {
    rightWallRect(ctx, lFx, lFy, v, lH, 3, 4, G.stoneR);
    px(ctx, lFx + v + 1, lFy - (v >> 1) - lH - 4, G.stoneTop);
    px(ctx, lFx + v + 1, lFy - (v >> 1) - lH - 5, G.bone); // bone spike
  }
  for (const u of [1, 7, 13, 20, 27, 34, 41, 47]) {
    leftWallRect(ctx, lFx, lFy, u, lH, 3, 4, G.stoneL);
    px(ctx, lFx - 1 - u, lFy - (u >> 1) - lH - 5, G.bone);
  }

  // Iron shields mounted along the terrace parapet
  disc(ctx, 70, 104, 3, G.out);
  disc(ctx, 70, 104, 2, G.rustR);
  disc(ctx, 106, 86, 3, G.out);
  disc(ctx, 106, 86, 2, G.ironTop);

  // =========================================================================
  // TIER 2: Inner High Citadel Keep (h = 28)
  // =========================================================================
  const kFx = 62, kFy = lFy - lH, kW = 36, kR = 34, kH = 28;
  box(ctx, kFx, kFy, kW, kR, kH, STONE);
  brickWalls(ctx, kFx, kFy, kW, kR, kH, 4, 5);

  // Upper portion has bolted iron plating and dark timber braces
  for (let v = 4; v < kR - 4; v += 8) {
    rightWallRect(ctx, kFx, kFy, v, 14, 2, kH - 15, G.woodR);
  }
  for (let u = 4; u < kW - 4; u += 8) {
    leftWallRect(ctx, kFx, kFy, u, 14, 2, kH - 15, G.woodL);
  }
  rivets(ctx, kFx, kFy, kR, kH, 5);

  // Windows in citadel keep with glowing toxic and warm hearth light
  windowR(ctx, kFx, kFy, 8, 8, 5, 7, true);
  windowR(ctx, kFx, kFy, 22, 8, 5, 7, true);
  windowL(ctx, kFx, kFy, 10, 8, 5, 7, true);
  windowL(ctx, kFx, kFy, 24, 8, 5, 7, true);

  // Brass winch gear on the keep wall for the portcullis chains
  gear(ctx, 48, 70, 4, frame);
  rect(ctx, 47, 74, 2, 8, G.ironDark); // chain down to barbican

  // Machicolations along citadel summit rim
  for (let v = 0; v < kR; v += 6) {
    rightWallRect(ctx, kFx, kFy, v, kH - 1, 3, 2, G.stoneTop);
  }
  for (let u = 0; u < kW; u += 6) {
    leftWallRect(ctx, kFx, kFy, u, kH - 1, 3, 2, G.stoneL);
  }

  // =========================================================================
  // TIER 3: Summit Keeps & Turrets
  // =========================================================================
  // A. Back-Left High Watch Spire with conical peaked roof (reaches y = 12)
  const sFx = 44, sFy = kFy - kH + 2, sW = 16, sH = 18;
  box(ctx, sFx, sFy, sW, sW, sH, STONE);
  brickWalls(ctx, sFx, sFy, sW, sW, sH, 3, 4);
  windowL(ctx, sFx, sFy, 5, 4, 4, 6, true);
  // Conical steep roof cap
  roof(ctx, sFx, sFy - sH, sW, sW, 0, 18, MOSS, true);
  // Spire stone chimney with billowing smoke
  const ch = chimney(ctx, 36, sFy - sH - 14, 9);
  smoke(ctx, ch.x, ch.y, frame);

  // B. Front-Right Warlord Crow's Nest / Battlement with Grand War Banner
  const bFx = 68, bFy = kFy - kH + 2, bW = 20, bR = 18, bH = 10;
  box(ctx, bFx, bFy, bW, bR, bH, STONE);
  brickWalls(ctx, bFx, bFy, bW, bR, bH, 3, 4);
  // Spiked battlements on warlord summit
  for (const v of [1, 7, 13]) {
    rightWallRect(ctx, bFx, bFy, v, bH, 2, 3, G.stoneR);
    px(ctx, bFx + v, bFy - (v >> 1) - bH - 3, G.stoneTop);
  }
  for (const u of [1, 7, 13]) {
    leftWallRect(ctx, bFx, bFy, u, bH, 2, 3, G.stoneL);
  }

  // Roaring signal fire beacon on battlement corner
  const bzX = bFx + bR - 2, bzY = bFy - (bR >> 1) - bH - 2;
  drawTorch(ctx, bzX, bzY, frame, true);

  // Grand Goblin War Banner flying from tall iron summit mast
  banner(ctx, 72, bFy - bH - 2, 32, frame, false);

  // =========================================================================
  // GROUND SURROUNDINGS: Defense stakes, weapons rack, bombs, barrels, props
  // =========================================================================
  // Spiked stakes in defense ditch along left front
  stakes(ctx, 18, 44, 116, 0.5, 9);

  // Weapons rack with halberds and tower shield in courtyard
  drawWeaponRack(ctx, 36, 116);

  // Stack of iron cannonballs / bombs
  disc(ctx, 94, 118, 3, G.out);
  disc(ctx, 94, 118, 2, G.ironDark);
  disc(ctx, 99, 116, 3, G.out);
  disc(ctx, 99, 116, 2, G.ironDark);
  px(ctx, 99, 112 - (frame % 2), G.glowHot); // fuse spark

  // Heavy supply crate and glowing toxic barrel
  crate(ctx, 74, 122, 7);
  barrel(ctx, 108, 106, true);
  scrap(ctx, 46, 122, 6);
  bush(ctx, 114, 102, 4);

  return cv;
}

export const art: Partial<Record<BuildingKind, () => HTMLCanvasElement[]>> = {
  barracks: () => [0, 1, 2].map(drawBarracks),
  tower: () => [0, 1, 2].map(drawTower),
  palisade: () => [0, 1, 2].map(drawPalisade),
  watchtower: () => [0, 1, 2].map(drawWatchtower),
  armory: () => [0, 1, 2].map(drawArmory),
  warcamp: () => [0, 1, 2].map(drawWarcamp),
  fortress: () => [0, 1, 2].map(drawFortress),
};
