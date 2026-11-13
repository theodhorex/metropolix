// Goblin HD buildings: industry-b (drawn by a worker, see .agy/tasks). Kinds left out fall back to the 1x goblin art.
import type { BuildingKind } from '@metropolix/sim';
import {
  G,
  MOSS,
  RUST,
  STONE,
  WOOD,
  DAUB,
  IRON,
  type Ctx,
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
import { leftWallRect, rightWallRect, px, rect } from '../../sprites';

/** 1. WINDMILL (Industry, height 1.8, animated sails, 3 frames) */
export function goblinWindmill(frame: number): HTMLCanvasElement {
  const [cv, ctx] = canvasHD();
  const fx = 65, fy = 120, wL = 36, wR = 36;
  groundShadow(ctx, fx, fy, wL, wR, 12);

  // Ground floor: heavy octagonal stone base
  box(ctx, fx, fy, wL, wR, 24, STONE);
  brickWalls(ctx, fx, fy, wL, wR, 24, 4, 6);
  doorR(ctx, fx, fy, 14, 8, 14);
  windowL(ctx, fx, fy, 14, 9, 5, 6, true);
  windowR(ctx, fx, fy, 4, 9, 4, 5, false);

  // Upper tower: daub & dark timber frame with iron bands
  const uy = fy - 24;
  const twL = 26, twR = 26, th = 30;
  box(ctx, fx, uy, twL, twR, th, DAUB);
  timberFrame(ctx, fx, uy, twL, twR, th);

  // Iron reinforcement bands with rivets
  leftWallRect(ctx, fx, uy, 0, 14, twL, 2, G.ironL);
  rightWallRect(ctx, fx, uy, 0, 14, twR, 2, G.ironR);
  for (let v = 2; v < twR - 1; v += 5) rightWallRect(ctx, fx, uy, v, 14, 1, 1, G.rivet);
  for (let u = 2; u < twL - 1; u += 5) leftWallRect(ctx, fx, uy, u, 14, 1, 1, G.ironDark);

  windowR(ctx, fx, uy, 11, 16, 5, 6, true);
  windowL(ctx, fx, uy, 11, 16, 5, 6, true);

  // Cap / roof: conical pitched roof cap
  const ry = uy - th;
  roof(ctx, fx, ry, 28, 28, 0, 18, RUST, true);

  // Spire / weathercock spike atop roof
  rect(ctx, 64, ry - 22, 2, 6, G.ironDark);
  disc(ctx, 65, ry - 22, 2, G.brass);
  px(ctx, 65, ry - 24, G.bone);

  // Windmill sails rotor hub
  const hx = 65, hy = ry - 4;
  rect(ctx, hx - 2, hy - 2, 4, 4, G.woodDark);

  // 4 rotating arms with patched scrap canvas / tin sails
  const armLen = 27;
  const baseAngle = (frame * Math.PI) / 6; // 0, 30 deg, 60 deg
  for (let k = 0; k < 4; k++) {
    const ang = baseAngle + (k * Math.PI) / 2;
    const cos = Math.cos(ang);
    const sin = Math.sin(ang);
    const perpX = -sin;
    const perpY = cos;

    // Wooden spar
    for (let r = 3; r <= armLen; r++) {
      const sx = Math.round(hx + cos * r);
      const sy = Math.round(hy + sin * r);
      px(ctx, sx, sy, G.woodTop);
    }
    // Cloth / tin sail on trailing side
    for (let r = 7; r <= armLen - 2; r++) {
      const sw = r > armLen - 5 ? armLen - r + 2 : 5;
      for (let w = 1; w <= sw; w++) {
        const sx = Math.round(hx + cos * r + perpX * w);
        const sy = Math.round(hy + sin * r + perpY * w);
        if (w === sw || r === 7 || r === armLen - 2) {
          px(ctx, sx, sy, G.out);
        } else if ((r + k) % 4 === 0) {
          px(ctx, sx, sy, G.rustLight);
        } else if ((r + w) % 2 === 0) {
          px(ctx, sx, sy, G.bone);
        } else {
          px(ctx, sx, sy, G.boneShade);
        }
      }
    }
  }

  // Rotor hub cap on top of sails
  disc(ctx, hx, hy, 4, G.out);
  disc(ctx, hx, hy, 3, G.ironTop);
  disc(ctx, hx, hy, 1, G.brassLight);

  // Yard details
  box(ctx, fx + 26, fy - 8, 6, 6, 5, { top: G.bone, left: G.boneShade, right: G.bone });
  box(ctx, fx + 31, fy - 10, 5, 5, 5, { top: G.bone, left: G.boneShade, right: G.bone });
  box(ctx, fx + 28, fy - 13, 5, 5, 4, { top: G.bone, left: G.boneShade, right: G.bone });

  banner(ctx, fx - wL + 2, fy - (wL >> 1) + 2, 32, frame, true);
  crate(ctx, fx - 8, fy + 4, 7);
  barrel(ctx, fx - 22, fy + 2);
  scrap(ctx, fx + 16, fy + 3, 4);
  bush(ctx, fx + wR - 4, fy - (wR >> 1) + 8, 4);

  return cv;
}

/** 2. SAWMILL (Industry, height 1.1, steam buzzsaw yard, 3 frames) */
export function goblinSawmill(frame: number): HTMLCanvasElement {
  const [cv, ctx] = canvasHD();
  const fx = 60, fy = 114, wL = 40, wR = 26;
  groundShadow(ctx, fx, fy, wL, wR, 14);

  // Timber mill shed on back-left
  box(ctx, fx, fy, wL, wR, 20, WOOD);
  plankWalls(ctx, fx, fy, wL, wR, 20, 4);

  // Open work bay on right facade facing the yard
  rightWallRect(ctx, fx, fy, 2, 0, 22, 16, G.woodDark);
  rightWallRect(ctx, fx, fy, 4, 2, 10, 6, G.woodL);
  rightWallRect(ctx, fx, fy, 5, 8, 8, 1, G.ironTop);

  // Corrugated rust roof
  roof(ctx, fx, fy, wL, wR, 20, 14, RUST, true);

  // Steam boiler at rear-left corner
  const bx = 38, by = 86;
  box(ctx, bx, by, 10, 10, 16, IRON);
  rivets(ctx, bx, by, 10, 16, 3);
  disc(ctx, bx + 4, by - 10, 2, G.brass);
  // Bent chimney pipe
  rect(ctx, bx - 3, by - 22, 3, 7, G.ironDark);
  rect(ctx, bx - 2, by - 22, 1, 7, G.ironTop);
  rect(ctx, bx - 6, by - 26, 6, 4, G.ironDark);
  rect(ctx, bx - 5, by - 25, 4, 2, G.ironR);
  smoke(ctx, bx - 4, by - 28, frame);

  // Sawing trestle / bench in front-right yard
  const tx = 76, ty = 114;
  box(ctx, tx, ty, 10, 22, 10, WOOD);
  rightWallRect(ctx, tx, ty, 0, 4, 22, 2, G.woodDark);

  // Tree log on bench being cut
  box(ctx, tx + 2, ty - 6, 6, 18, 6, { top: G.woodL, left: G.woodDark, right: G.woodR });
  rightWallRect(ctx, tx + 2, ty - 6, 0, 0, 18, 6, G.woodDark);
  leftWallRect(ctx, tx + 2, ty - 6, 0, 0, 6, 6, G.woodLight);

  // GIANT SPINNING CIRCULAR BUZZSAW BLADE
  const sx = 74, sy = 101;
  disc(ctx, sx, sy, 10, G.out);
  disc(ctx, sx, sy, 9, G.ironTop);
  disc(ctx, sx, sy, 7, G.ironL);
  disc(ctx, sx, sy, 4, G.ironDark);
  disc(ctx, sx, sy, 2, G.brassLight);
  px(ctx, sx, sy, G.out);

  // Animated rotating saw teeth
  const toothAngle = (frame * Math.PI) / 6;
  for (let k = 0; k < 8; k++) {
    const a = toothAngle + (k * Math.PI) / 4;
    const px0 = Math.round(sx + Math.cos(a) * 9);
    const py0 = Math.round(sy + Math.sin(a) * 9);
    px(ctx, px0, py0, G.rivet);
  }

  // Flying sparks from blade contact point
  const sparks = [
    [[77, 106, G.glowHot], [80, 104, G.glow], [78, 108, G.rustLight]],
    [[78, 105, G.glowHot], [82, 107, G.glowDeep], [80, 109, G.glow]],
    [[79, 104, G.glow], [81, 106, G.glowHot], [83, 108, G.rustLight]],
  ] as const;
  for (const [spX, spY, spCol] of sparks[frame % 3]!) {
    px(ctx, spX, spY, spCol);
    px(ctx, spX + 1, spY, G.out);
  }

  // Sawdust piles in yard
  rect(ctx, tx + 4, ty + 1, 9, 3, G.woodLight);
  rect(ctx, tx + 6, ty + 3, 5, 2, G.woodTop);
  rect(ctx, tx - 8, ty - 2, 6, 2, G.woodLight);

  // Stack of cut timber planks
  box(ctx, tx + 20, ty - 8, 8, 14, 6, { top: G.woodLight, left: G.woodDark, right: G.woodR });

  // Props: crate, barrel, scrap, bush
  crate(ctx, fx - 10, fy + 2, 7);
  barrel(ctx, fx - 24, fy - 6);
  scrap(ctx, fx + 4, fy + 5, 2);
  bush(ctx, tx + 24, ty - 2, 4);

  return cv;
}

/** 3. SMELTER (Industry, height 1.3, glowing furnace, smoke, 3 frames) */
export function goblinSmelter(frame: number): HTMLCanvasElement {
  const [cv, ctx] = canvasHD();
  const fx = 66, fy = 118, wL = 44, wR = 40;
  groundShadow(ctx, fx, fy, wL, wR, 14);

  // Squat, heavy stone blast furnace
  box(ctx, fx, fy, wL, wR, 26, STONE);
  brickWalls(ctx, fx, fy, wL, wR, 26, 4, 6);

  // Heavy riveted iron reinforcement plates across both walls
  leftWallRect(ctx, fx, fy, 1, 6, wL - 2, 2, G.ironL);
  rightWallRect(ctx, fx, fy, 1, 6, wR - 2, 2, G.ironR);
  leftWallRect(ctx, fx, fy, 1, 18, wL - 2, 2, G.ironL);
  rightWallRect(ctx, fx, fy, 1, 18, wR - 2, 2, G.ironR);
  for (let v = 3; v < wR - 2; v += 5) {
    rightWallRect(ctx, fx, fy, v, 6, 1, 1, G.rivet);
    rightWallRect(ctx, fx, fy, v, 18, 1, 1, G.rivet);
  }
  for (let u = 3; u < wL - 2; u += 5) {
    leftWallRect(ctx, fx, fy, u, 6, 1, 1, G.ironDark);
    leftWallRect(ctx, fx, fy, u, 18, 1, 1, G.ironDark);
  }

  // Open glowing tap-hole hearth on right wall pouring molten metal
  const thV = 10, thZ = 2, thW = 16, thH = 14;
  rightWallRect(ctx, fx, fy, thV - 1, thZ - 1, thW + 2, thH + 2, G.out);
  rightWallRect(ctx, fx, fy, thV, thZ, thW, thH, G.rustDark);

  // Animated roaring molten interior fire
  const moltenCore = frame === 0 ? G.glowHot : frame === 1 ? G.glow : G.glowDeep;
  const moltenEdge = frame === 0 ? G.glowDeep : frame === 1 ? G.rustLight : G.glowHot;
  rightWallRect(ctx, fx, fy, thV + 2, thZ + 1, thW - 4, thH - 3, moltenEdge);
  rightWallRect(ctx, fx, fy, thV + 4, thZ + 3, thW - 8, thH - 7, moltenCore);

  // Molten iron runoff trough leading forward into yard
  const rx = fx + 20, ry = fy + 6;
  box(ctx, rx, ry, 8, 18, 4, STONE);
  for (let u = 1; u < 7; u++) {
    for (let v = 1; v < 17; v++) {
      const pxX = rx - 1 - u + v;
      const pxY = ry - 4 - ((u + v + 1) >> 1);
      const col = (u + v + frame) % 3 === 0 ? G.glowHot : (u + v) % 2 === 0 ? G.glowDeep : G.rustLight;
      px(ctx, pxX, pxY, col);
    }
  }

  // Furnace upper crown / iron cap
  const uy = fy - 26;
  box(ctx, fx, uy, 36, 32, 8, IRON);
  rivets(ctx, fx, uy, 32, 8, 4);

  // Twin crooked smokestacks
  for (let i = 0; i < 22; i++) {
    const sw = Math.max(4, 7 - (i >> 3));
    const sx0 = 44 - (i >> 2);
    const sy0 = uy - 6 - i;
    rect(ctx, sx0 - (sw >> 1), sy0, sw, 1, G.out);
    rect(ctx, sx0 - (sw >> 1) + 1, sy0, sw - 2, 1, i % 4 === 0 ? G.rustR : G.ironDark);
  }
  smoke(ctx, 44 - (22 >> 2), uy - 28, frame);

  for (let i = 0; i < 18; i++) {
    const sw = Math.max(4, 8 - (i >> 3));
    const sx0 = 64 + (i >> 3);
    const sy0 = uy - 6 - i;
    rect(ctx, sx0 - (sw >> 1), sy0, sw, 1, G.out);
    rect(ctx, sx0 - (sw >> 1) + 1, sy0, sw - 2, 1, i % 3 === 0 ? G.ironL : G.rustDark);
  }
  smoke(ctx, 64 + (18 >> 3), uy - 24, (frame + 1) % 3);

  // Yard details
  rect(ctx, fx - 32, fy - 6, 14, 7, G.out);
  rect(ctx, fx - 31, fy - 5, 12, 5, G.rustDark);
  px(ctx, fx - 28, fy - 7, G.rustLight);
  px(ctx, fx - 24, fy - 6, G.rustR);
  px(ctx, fx - 26, fy - 4, G.rustLight);

  for (let row = 0; row < 3; row++) {
    rect(ctx, rx + 16, ry - 6 - row * 2, 8, 2, G.out);
    rect(ctx, rx + 17, ry - 6 - row * 2, 6, 1, G.ironTop);
  }

  barrel(ctx, fx - 36, fy - 16, true);
  banner(ctx, fx - wL + 2, fy - (wL >> 1) + 4, 34, frame, true);
  crate(ctx, fx - 10, fy + 5, 7);
  bush(ctx, fx + wR - 2, fy - (wR >> 1) + 6, 4);

  return cv;
}

/** 4. CRAFTHALL (Industry, Craft Hall, height 1.4, machine guildhall & gears, 3 frames) */
export function goblinCrafthall(frame: number): HTMLCanvasElement {
  const [cv, ctx] = canvasHD();
  const fx = 66, fy = 120, wL = 46, wR = 40;
  groundShadow(ctx, fx, fy, wL, wR, 14);

  // Ground floor: sturdy stone foundation with brick walls
  box(ctx, fx, fy, wL, wR, 14, STONE);
  brickWalls(ctx, fx, fy, wL, wR, 14, 4, 6);

  // Large open artisan workshop bay on right wall
  const bayV = 4, bayZ = 0, bayW = 24, bayH = 13;
  rightWallRect(ctx, fx, fy, bayV - 1, bayZ, bayW + 2, bayH + 1, G.out);
  rightWallRect(ctx, fx, fy, bayV, bayZ, bayW, bayH, G.woodDark);
  rightWallRect(ctx, fx, fy, bayV + 2, 1, 18, 4, G.woodL);
  rightWallRect(ctx, fx, fy, bayV + 6, 4, 6, 4, G.ironTop);
  rightWallRect(ctx, fx, fy, bayV + 5, 6, 2, 2, G.ironDark);
  rightWallRect(ctx, fx, fy, bayV + 18, 2, 5, 6, frame === 0 ? G.glowHot : G.glowDeep);

  doorL(ctx, fx, fy, 16, 9, 13);
  windowL(ctx, fx, fy, 32, 4, 5, 6, true);

  // Upper floor: half-timbered daub hall
  const uy = fy - 14;
  box(ctx, fx, uy, wL, wR, 14, DAUB);
  timberFrame(ctx, fx, uy, wL, wR, 14);

  windowR(ctx, fx, uy, 7, 4, 5, 6, true);
  windowR(ctx, fx, uy, 24, 4, 5, 6, true);
  windowL(ctx, fx, uy, 10, 4, 5, 6, true);
  windowL(ctx, fx, uy, 30, 4, 5, 6, true);

  roof(ctx, fx, uy, wL, wR, 14, 20, MOSS, true);

  // Big mechanical clockwork gears mounted on left facade
  gear(ctx, fx - 22, uy - 18, 7, frame);
  gear(ctx, fx - 34, uy - 20, 4, (3 - frame) % 3);
  rect(ctx, fx - 23, uy - 11, 2, 12, G.brassDark);
  rect(ctx, fx - 22, uy - 11, 1, 12, G.brassLight);

  const c = chimney(ctx, fx + 16, uy - 28, 12);
  smoke(ctx, c.x, c.y, frame);

  banner(ctx, fx - wL + 2, fy - (wL >> 1) + 2, 34, frame, true);
  crate(ctx, fx - 8, fy + 4, 7);
  crate(ctx, fx - 1, fy + 7, 5);
  barrel(ctx, fx - 24, fy - 4);
  scrap(ctx, fx + 32, fy - 6, 5);
  bush(ctx, fx + wR - 4, fy - (wR >> 1) + 12, 4);

  return cv;
}

/** 5. FOUNDRY (Industry, height 1.9, colossal dread foundry, thick smoke, 3 frames) */
export function goblinFoundry(frame: number): HTMLCanvasElement {
  const [cv, ctx] = canvasHD();
  const fx = 68, fy = 122, wL = 48, wR = 44;
  groundShadow(ctx, fx, fy, wL, wR, 16);

  // Massive dark iron and stone foundry hall
  box(ctx, fx, fy, wL, wR, 32, IRON);

  // Heavy reinforcement bands and rivets
  leftWallRect(ctx, fx, fy, 1, 8, wL - 2, 2, G.rustDark);
  rightWallRect(ctx, fx, fy, 1, 8, wR - 2, 2, G.rustR);
  leftWallRect(ctx, fx, fy, 1, 22, wL - 2, 2, G.rustDark);
  rightWallRect(ctx, fx, fy, 1, 22, wR - 2, 2, G.rustR);
  rivets(ctx, fx, fy, wR, 32, 4);

  // Open casting portal on right wall with glowing molten vat
  const vatV = 6, vatZ = 2, vatW = 22, vatH = 20;
  rightWallRect(ctx, fx, fy, vatV - 1, vatZ, vatW + 2, vatH + 1, G.out);
  rightWallRect(ctx, fx, fy, vatV, vatZ, vatW, vatH, G.ironDark);

  // Molten metal vat interior
  const moltenVatCore = frame === 0 ? G.glowHot : frame === 1 ? G.glow : G.glowDeep;
  const moltenVatEdge = frame === 0 ? G.glowDeep : frame === 1 ? G.rustLight : G.glowHot;
  rightWallRect(ctx, fx, fy, vatV + 2, vatZ + 1, vatW - 4, 12, moltenVatEdge);
  rightWallRect(ctx, fx, fy, vatV + 5, vatZ + 3, vatW - 10, 8, moltenVatCore);

  // Door on left wall
  doorL(ctx, fx, fy, 20, 8, 14);

  // Roof of foundry hall
  const uy = fy - 32;
  roof(ctx, fx, uy, wL, wR, 0, 18, RUST, true);

  // Overhead scrap gantry crane extending over the right casting yard
  const craneY = uy + 6;
  rect(ctx, 72, craneY, 36, 4, G.out);
  rect(ctx, 73, craneY + 1, 34, 2, G.ironTop);
  // Support struts
  rect(ctx, 72, craneY, 2, 14, G.ironDark);
  rect(ctx, 102, craneY + 4, 2, 12, G.ironDark);
  // Suspended ladle / crucible with chain
  rect(ctx, 92, craneY + 4, 1, 14, G.ironDark);
  rect(ctx, 88, craneY + 18, 9, 8, G.out);
  rect(ctx, 89, craneY + 19, 7, 6, G.ironL);
  px(ctx, 92, craneY + 25, frame === 0 ? G.glowHot : G.glowDeep); // dripping molten drop

  // HUGE riveted conical cupola smokestack on left side
  // Base at x = 38, y = uy + 12 = 102, rising all the way to y = 28!
  for (let i = 0; i < 48; i++) {
    const sw = Math.max(6, 16 - Math.floor((i * 10) / 48));
    const sx0 = 38 - (i >> 3);
    const sy0 = uy + 12 - i;
    rect(ctx, sx0 - (sw >> 1), sy0, sw, 1, G.out);
    rect(ctx, sx0 - (sw >> 1) + 1, sy0, sw - 2, 1, i % 5 === 0 ? G.rustR : G.ironDark);
    if (i % 6 === 0) {
      px(ctx, sx0 + (sw >> 1) - 2, sy0, G.rivet);
    }
  }
  // Stack rim
  rect(ctx, 38 - (48 >> 3) - 5, uy + 12 - 49, 10, 2, G.ironTop);

  // BILLOWING THICK SMOKE CLOUDS (huge, multi-layered, 3 frames)
  const stackTopX = 38 - (48 >> 3);
  const stackTopY = uy + 12 - 50;

  // Multi-puff billowing plume
  const smokePuffs = [
    // Frame 0
    [
      [stackTopX, stackTopY - 2, 5, G.smokeShade, G.smoke],
      [stackTopX + 4, stackTopY - 8, 7, G.smokeShade, G.smoke],
      [stackTopX + 11, stackTopY - 14, 9, G.smokeShade, G.smoke],
      [stackTopX + 20, stackTopY - 19, 11, G.smokeShade, G.smoke],
      [stackTopX + 8, stackTopY - 9, 3, G.ironDark, G.toxic],
    ],
    // Frame 1
    [
      [stackTopX, stackTopY - 3, 6, G.smokeShade, G.smoke],
      [stackTopX + 6, stackTopY - 10, 8, G.smokeShade, G.smoke],
      [stackTopX + 14, stackTopY - 16, 10, G.smokeShade, G.smoke],
      [stackTopX + 24, stackTopY - 21, 12, G.smokeShade, G.smoke],
      [stackTopX + 11, stackTopY - 11, 4, G.ironDark, G.toxic],
    ],
    // Frame 2
    [
      [stackTopX, stackTopY - 4, 5, G.smokeShade, G.smoke],
      [stackTopX + 5, stackTopY - 9, 8, G.smokeShade, G.smoke],
      [stackTopX + 12, stackTopY - 15, 10, G.smokeShade, G.smoke],
      [stackTopX + 22, stackTopY - 20, 11, G.smokeShade, G.smoke],
      [stackTopX + 9, stackTopY - 10, 4, G.ironDark, G.toxicLight],
    ],
  ] as const;

  for (const [cx0, cy0, r0, colOut, colIn] of smokePuffs[frame % 3]!) {
    disc(ctx, cx0, cy0, r0, colOut);
    disc(ctx, cx0 - 1, cy0 - 1, Math.max(1, r0 - 2), colIn);
  }

  // Secondary crooked tin roof pipe
  rect(ctx, 62, uy - 14, 3, 10, G.out);
  rect(ctx, 63, uy - 14, 1, 10, G.rustLight);
  smoke(ctx, 63, uy - 16, (frame + 1) % 3);

  // Yard details
  barrel(ctx, fx - 34, fy - 12, true);
  barrel(ctx, fx - 26, fy - 18, true);
  crate(ctx, fx - 10, fy + 5, 8);
  scrap(ctx, fx + 34, fy - 4, 7);
  stakes(ctx, fx - 44, fx - 26, fy - 8, -0.4, 9);
  bush(ctx, fx + wR - 4, fy - (wR >> 1) + 8, 4);

  return cv;
}

/** 6. SCRAPSPIRE (Goblin WONDER, height 2.6, full canvas height, green fire, 3 frames) */
export function goblinScrapspire(frame: number): HTMLCanvasElement {
  const [cv, ctx] = canvasHD();
  const fx = 66, fy = 122, wL = 48, wR = 44;
  groundShadow(ctx, fx, fy, wL, wR, 16);

  // TIER 1: Heavy stone & riveted iron bastion foundation (fy = 122, h = 24)
  box(ctx, fx, fy, wL, wR, 24, STONE);
  brickWalls(ctx, fx, fy, wL, wR, 24, 4, 6);

  // Bolted iron armor plating over stone
  leftWallRect(ctx, fx, fy, 4, 4, 18, 14, G.ironDark);
  rightWallRect(ctx, fx, fy, 4, 4, 18, 14, G.ironR);
  doorR(ctx, fx, fy, 14, 10, 16);
  doorL(ctx, fx, fy, 24, 8, 14);

  // Massive turning brass cog on bastion front
  gear(ctx, 66, 106, 6, frame);

  // TIER 2: Slanted asymmetrical boiler hull & timber scaffold (uy = 98, h = 30)
  const uy2 = fy - 24;
  const twL = 36, twR = 34, th = 30;
  box(ctx, fx, uy2, twL, twR, th, IRON);
  rivets(ctx, fx, uy2, twR, th, 4);

  // Heavy timber buttress trusses bracing the mid-tower
  rect(ctx, 42, uy2 - 24, 3, 24, G.out);
  rect(ctx, 43, uy2 - 24, 1, 24, G.woodR);
  rect(ctx, 88, uy2 - 22, 3, 22, G.out);
  rect(ctx, 89, uy2 - 22, 1, 22, G.woodR);

  // Giant clockwork gear on left wall of Tier 2
  gear(ctx, 46, uy2 - 14, 8, (3 - frame) % 3);

  // Copper steam pipes running up the shaft
  rect(ctx, 58, uy2 - 28, 3, 28, G.out);
  rect(ctx, 59, uy2 - 28, 1, 28, G.brassLight);
  rect(ctx, 56, uy2 - 20, 3, 2, G.brassDark); // elbow
  smoke(ctx, 55, uy2 - 22, frame);

  windowR(ctx, fx, uy2, 8, 14, 5, 5, true);
  windowR(ctx, fx, uy2, 22, 14, 5, 5, true);

  // TIER 3: Cantilevered Launch Cradle Scaffolding Deck (uy = 68, h = 18)
  const uy3 = uy2 - th;
  box(ctx, fx, uy3, 26, 26, 18, { top: G.rustLight, left: G.ironL, right: G.ironR });
  rivets(ctx, fx, uy3, 26, 18, 3);

  // Twin goblin banners on the launch scaffold
  banner(ctx, 42, uy3 - 4, 26, frame, true);
  banner(ctx, 90, uy3 - 2, 26, (frame + 1) % 3, false);

  // TIER 4: THE CROWN WONDER - CRAZY GOBLIN SPACE ROCKET / RAMJET (y = 2 to 50)
  const gantryTop = uy3 - 18; // y = 50

  // Vertical launch rails
  rect(ctx, 54, gantryTop - 34, 2, 36, G.out);
  rect(ctx, 55, gantryTop - 34, 1, 36, G.ironTop);
  rect(ctx, 76, gantryTop - 34, 2, 36, G.out);
  rect(ctx, 77, gantryTop - 34, 1, 36, G.ironTop);
  // Gantry cross ties
  for (let gy = gantryTop - 30; gy <= gantryTop - 4; gy += 8) {
    rect(ctx, 54, gy, 24, 1, G.ironL);
  }

  // Rocket Engine Thruster Nozzle & ROARING GREEN FIRE JET (3 frames animation)
  const engY = gantryTop - 4; // y = 46
  rect(ctx, 60, engY, 11, 4, G.out);
  rect(ctx, 61, engY + 1, 9, 2, G.ironDark);

  // Animated green toxic thruster flames & sparks
  if (frame === 0) {
    rect(ctx, 62, engY + 4, 7, 7, G.toxic);
    rect(ctx, 63, engY + 4, 5, 5, G.toxicLight);
    px(ctx, 65, engY + 10, '#ffffff');
    px(ctx, 60, engY + 12, G.toxicLight);
    px(ctx, 70, engY + 11, G.glowHot);
  } else if (frame === 1) {
    rect(ctx, 61, engY + 4, 9, 9, G.toxic);
    rect(ctx, 62, engY + 4, 7, 6, G.toxicLight);
    rect(ctx, 64, engY + 10, 3, 4, G.glowHot);
    px(ctx, 65, engY + 13, '#ffffff');
    px(ctx, 59, engY + 14, G.toxicLight);
    px(ctx, 71, engY + 13, G.toxic);
  } else {
    rect(ctx, 62, engY + 4, 7, 10, G.toxic);
    rect(ctx, 63, engY + 4, 5, 8, G.toxicLight);
    rect(ctx, 64, engY + 4, 3, 6, '#ffffff');
    px(ctx, 65, engY + 14, G.glowHot);
    px(ctx, 61, engY + 13, G.glowHot);
    px(ctx, 69, engY + 15, G.toxicLight);
  }

  // Rocket Fuselage Body (x = 58..73, y = 14..45)
  rect(ctx, 58, engY - 30, 15, 30, G.out);
  rect(ctx, 59, engY - 29, 3, 28, G.rustDark);
  rect(ctx, 62, engY - 29, 5, 28, G.rustLight);
  rect(ctx, 67, engY - 29, 5, 28, G.rustR);

  // Yellow & black goblin hazard stripes across rocket fuselage
  const hazY = engY - 17;
  rect(ctx, 59, hazY, 13, 4, G.glowHot);
  px(ctx, 60, hazY, G.out);
  px(ctx, 61, hazY + 1, G.out);
  px(ctx, 64, hazY, G.out);
  px(ctx, 65, hazY + 1, G.out);
  px(ctx, 68, hazY, G.out);
  px(ctx, 69, hazY + 1, G.out);

  // Cockpit porthole window with glowing green glass
  disc(ctx, 65, engY - 23, 3, G.out);
  disc(ctx, 65, engY - 23, 2, G.toxicLight);
  px(ctx, 65, engY - 23, '#ffffff');

  // Stabilizer tail fins
  rect(ctx, 52, engY - 8, 6, 6, G.out);
  rect(ctx, 53, engY - 7, 5, 4, G.rustDark);
  rect(ctx, 73, engY - 8, 6, 6, G.out);
  rect(ctx, 73, engY - 7, 5, 4, G.rustLight);

  // Rocket nose cone tapering to tip (y = 5..15)
  for (let i = 0; i < 10; i++) {
    const nw = Math.max(2, 13 - i);
    const ny = engY - 30 - i;
    rect(ctx, 65 - (nw >> 1), ny, nw, 1, G.out);
    rect(ctx, 65 - (nw >> 1) + 1, ny, Math.max(1, nw - 2), 1, i % 2 === 0 ? G.ironTop : G.ironL);
  }

  // Antenna / lightning rod reaching top of canvas (y = 2..5)
  rect(ctx, 65, 2, 1, 5, G.ironTop);
  px(ctx, 65, 2, G.glowHot);

  // Junkyard base props
  barrel(ctx, fx - 34, fy - 8, true);
  barrel(ctx, fx + 36, fy - 6, true);
  scrap(ctx, fx - 16, fy + 4, 9);
  scrap(ctx, fx + 18, fy + 5, 11);
  crate(ctx, fx - 8, fy + 6, 8);
  stakes(ctx, fx - 44, fx - 26, fy - 8, -0.4, 9);
  bush(ctx, fx + wR - 4, fy - (wR >> 1) + 8, 4);

  return cv;
}

export const art: Partial<Record<BuildingKind, () => HTMLCanvasElement[]>> = {
  windmill: () => [0, 1, 2].map(goblinWindmill),
  sawmill: () => [0, 1, 2].map(goblinSawmill),
  smelter: () => [0, 1, 2].map(goblinSmelter),
  crafthall: () => [0, 1, 2].map(goblinCrafthall),
  foundry: () => [0, 1, 2].map(goblinFoundry),
  scrapspire: () => [0, 1, 2].map(goblinScrapspire),
};

export const _unused = G;
