// Goblin HD buildings: industry-a (drawn by a worker, see .agy/tasks). Kinds left out fall back to the 1x goblin art.
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
import { leftWallRect, rightWallRect, px, rect, isoBox } from '../../sprites';

/**
 * 1. FARM (Industry, height 0.5, 3 frames)
 * Lush goblin muck-farm: tilled soil furrows, rows of plump cabbages and glowing spotted
 * goblin mushrooms, a cozy rustic half-timbered barn with hayloft, scarecrow with horned skull,
 * wheelbarrow/crates of harvest, and smoking stovepipe.
 */
export function goblinFarm(frame: number): HTMLCanvasElement {
  const [cv, ctx] = canvasHD();

  // Barn footprint in the back-right: fx = 80, fy = 100, wL = 28, wR = 22, h = 18
  const bFx = 80, bFy = 100, bL = 28, bR = 22, bH = 18;
  groundShadow(ctx, bFx, bFy, bL, bR, 10);

  // Furrow lines and tilled crop beds across the front and left ground
  // Furrows run along right-up axis: from left towards center
  const furrowBands = [
    { startX: 24, startY: 104, len: 26 },
    { startX: 34, startY: 110, len: 28 },
    { startX: 46, startY: 116, len: 26 },
  ];
  for (const f of furrowBands) {
    for (let i = 0; i < f.len; i++) {
      const x = f.startX + i;
      const y = f.startY - (i >> 1);
      rect(ctx, x, y, 1, 2, G.dirtDark);
      rect(ctx, x, y - 1, 1, 1, G.dirt);
      if (i % 4 === 0) px(ctx, x, y - 2, G.dirtLight);
    }
  }

  // Row 1: Goblin Cabbages (leafy green bunches)
  const cabbageLocs = [
    [26, 100], [33, 97], [40, 94], [47, 91],
    [36, 107], [43, 104], [50, 101], [57, 98],
  ] as const;
  for (const [cx, cy] of cabbageLocs) {
    // shadow & leaves
    rect(ctx, cx - 3, cy - 1, 7, 3, G.shadow);
    rect(ctx, cx - 2, cy - 2, 5, 4, G.out);
    rect(ctx, cx - 2, cy - 2, 4, 3, G.leafDark);
    rect(ctx, cx - 1, cy - 2, 3, 2, G.leaf);
    px(ctx, cx, cy - 2, G.leafLight);
    px(ctx, cx - 1, cy - 1, G.toxicLight); // slight goblin glow
  }

  // Row 2: Giant Spotted Mushrooms (frontmost furrow)
  const shroomLocs = [
    [48, 113, true],
    [54, 110, false],
    [60, 107, true],
    [66, 104, false],
    [72, 101, true],
  ] as const;
  for (const [sx, sy, isToxic] of shroomLocs) {
    // stalk
    rect(ctx, sx - 1, sy - 3, 3, 4, G.out);
    rect(ctx, sx, sy - 3, 1, 3, G.bone);
    // cap
    const capCol = isToxic ? G.toxic : G.rustR;
    const spotCol = isToxic ? G.toxicLight : G.bone;
    rect(ctx, sx - 3, sy - 6, 7, 4, G.out);
    rect(ctx, sx - 2, sy - 6, 5, 3, capCol);
    rect(ctx, sx - 1, sy - 7, 3, 1, capCol);
    px(ctx, sx - 1, sy - 5, spotCol);
    px(ctx, sx + 1, sy - 4, spotCol);
  }

  // Barn building:
  // Lower level: stone wall base (h = 8)
  box(ctx, bFx, bFy, bL, bR, 8, STONE);
  brickWalls(ctx, bFx, bFy, bL, bR, 8, 4, 5);

  // Upper level: rustic wood & timber frame (h = 10)
  const uFy = bFy - 8;
  box(ctx, bFx, uFy, bL, bR, 10, WOOD);
  plankWalls(ctx, bFx, uFy, bL, bR, 10, 3);

  // Barn door on left wall (facing yard): double arched barn door
  doorL(ctx, bFx, bFy, 8, 10, 12);

  // Hayloft window/opening on upper left wall with golden hay sticking out
  leftWallRect(ctx, bFx, uFy, 10, 3, 6, 5, G.out);
  leftWallRect(ctx, bFx, uFy, 11, 4, 4, 4, G.woodDark);
  leftWallRect(ctx, bFx, uFy, 10, 3, 4, 2, G.brassLight); // spilling hay
  px(ctx, bFx - 12, uFy - 6 - 2, G.glowHot);

  // Lit window on right wall
  windowR(ctx, bFx, bFy, 7, 2, 5, 5, true);

  // Moss roof with rusty patch
  roof(ctx, bFx, uFy, bL, bR, 10, 15, MOSS, true);

  // Crooked stovepipe chimney atop barn
  const c = chimney(ctx, bFx + 7, uFy - 18, 9);
  smoke(ctx, c.x, c.y, frame);

  // Fence stakes enclosing the back left pasture
  stakes(ctx, 16, 44, 86, 0.45, 8);

  // Goblin Scarecrow in the field: cross pole with horned skull
  const scX = 38, scY = 94;
  rect(ctx, scX - 1, scY - 14, 3, 15, G.out);
  rect(ctx, scX, scY - 13, 1, 13, G.woodR);
  // cross spar
  rect(ctx, scX - 5, scY - 10, 11, 2, G.out);
  rect(ctx, scX - 4, scY - 9, 9, 1, G.woodLight);
  // tattered cloth flapping
  const flap = (frame % 3) - 1;
  rect(ctx, scX - 3, scY - 8, 3, 4 + flap, G.banner);
  rect(ctx, scX + 1, scY - 8, 3, 4 - flap, G.rustR);
  // horned skull
  rect(ctx, scX - 2, scY - 16, 5, 4, G.out);
  rect(ctx, scX - 1, scY - 15, 3, 3, G.bone);
  px(ctx, scX - 1, scY - 14, G.out); px(ctx, scX + 1, scY - 14, G.out); // eye sockets
  px(ctx, scX - 3, scY - 17, G.bone); px(ctx, scX + 3, scY - 17, G.bone); // horns

  // Farm props near the barn entrance:
  crate(ctx, bFx + 6, bFy + 3, 7);
  barrel(ctx, bFx + 15, bFy - 2, false);
  scrap(ctx, bFx - 18, bFy + 11, 4);
  bush(ctx, bFx + bR - 2, bFy - (bR >> 1) + 8, 4);

  // Harvest basket / tub in front of barn with green produce
  rect(ctx, 62, 109, 6, 4, G.out);
  rect(ctx, 63, 110, 4, 3, G.woodLight);
  px(ctx, 63, 109, G.leafLight);
  px(ctx, 64, 109, G.toxicLight);
  px(ctx, 65, 109, G.leaf);

  return cv;
}

/**
 * 2. FACTORY (Industry, height 1.6, 3 frames)
 * Heavy goblin industrial smelting factory: twin billowing smoking stacks, riveted iron boiler
 * dome with molten slag runoff, massive corrugated steel & stone warehouse, large spinning wall cog,
 * pipe bridge with brass valve, glowing furnace grates, and toxic waste barrels.
 */
export function goblinFactory(frame: number): HTMLCanvasElement {
  const [cv, ctx] = canvasHD();

  // Ground shadow under the expansive industrial complex
  groundShadow(ctx, 70, 120, 48, 44, 14);

  // 1. Left Boiler House & Blast Furnace (drawn first so main hall can flank it)
  const bFx = 48, bFy = 114, bL = 22, bR = 20, bH = 18;
  box(ctx, bFx, bFy, bL, bR, bH, IRON);
  rivets(ctx, bFx, bFy, bR, bH, 5);

  // Riveted boiler dome sitting atop the furnace box
  const domeCx = bFx - (bL >> 1) + (bR >> 1); // 47
  const domeCy = bFy - bH - ((bL + bR) >> 2); // 114 - 18 - 10 = 86
  disc(ctx, domeCx, domeCy, 10, G.out);
  disc(ctx, domeCx, domeCy, 9, G.ironL);
  disc(ctx, domeCx + 1, domeCy - 1, 8, G.ironR);
  disc(ctx, domeCx + 2, domeCy - 2, 6, G.ironTop);
  // Rivet band across dome
  for (let d = -7; d <= 7; d += 3) {
    px(ctx, domeCx + d, domeCy + 1, G.rivet);
  }

  // Molten fire grate on furnace right wall
  rightWallRect(ctx, bFx, bFy, 4, 2, 8, 8, G.out);
  rightWallRect(ctx, bFx, bFy, 5, 3, 6, 6, G.glowDeep);
  rightWallRect(ctx, bFx, bFy, 6, 4, 4, 4, frame % 2 === 0 ? G.glowHot : G.glow);
  px(ctx, bFx + 7, bFy - 3 - 6, G.toxic);

  // Left Tall Smokestack (riveted iron pipe chimney, height 36)
  const s1X = 36, s1BaseY = 86, s1H = 38;
  rect(ctx, s1X - 3, s1BaseY - s1H, 7, s1H, G.out);
  rect(ctx, s1X - 2, s1BaseY - s1H + 1, 5, s1H - 1, G.ironL);
  rect(ctx, s1X, s1BaseY - s1H + 1, 3, s1H - 1, G.ironR);
  px(ctx, s1X + 2, s1BaseY - s1H + 1, G.ironTop);
  // Stack flared lip
  rect(ctx, s1X - 4, s1BaseY - s1H - 2, 9, 3, G.out);
  rect(ctx, s1X - 3, s1BaseY - s1H - 1, 7, 2, G.ironDark);
  // Smokestack rivet rings
  for (let r = 8; r < s1H; r += 10) {
    rect(ctx, s1X - 3, s1BaseY - r, 7, 1, G.out);
    rect(ctx, s1X - 2, s1BaseY - r, 5, 1, G.rivet);
  }
  // Billowing black/grey smoke from stack 1
  smoke(ctx, s1X + 1, s1BaseY - s1H - 4, frame);

  // 2. Main Factory Hall (right side)
  const mFx = 74, mFy = 118, mL = 26, mR = 36;
  // Lower level: heavy dark stone
  box(ctx, mFx, mFy, mL, mR, 15, STONE);
  brickWalls(ctx, mFx, mFy, mL, mR, 15, 5, 6);

  // Heavy arched iron blast door on right wall
  doorR(ctx, mFx, mFy, 8, 10, 13);

  // Upper level: corrugated iron & rust plates
  const uFy = mFy - 15;
  box(ctx, mFx, uFy, mL, mR, 17, IRON);
  rivets(ctx, mFx, uFy, mR, 17, 6);

  // Lit factory slit windows along the upper right wall
  windowR(ctx, mFx, uFy, 22, 6, 5, 6, true);
  windowR(ctx, mFx, uFy, 29, 6, 4, 6, false);

  // Large industrial Cog mounted on the factory exterior right wall
  gear(ctx, mFx + 15, uFy - 5, 7, frame);

  // Factory roof: rusty tin roof with patches
  roof(ctx, mFx, uFy, mL, mR, 17, 16, RUST, true);

  // Second Smokestack on Factory Hall (brick & iron stack, height 30)
  const s2X = 84, s2BaseY = 62, s2H = 30;
  rect(ctx, s2X - 3, s2BaseY - s2H, 6, s2H, G.out);
  rect(ctx, s2X - 2, s2BaseY - s2H + 1, 4, s2H - 1, G.rustL);
  rect(ctx, s2X, s2BaseY - s2H + 1, 2, s2H - 1, G.rustR);
  rect(ctx, s2X - 4, s2BaseY - s2H - 2, 8, 3, G.out);
  rect(ctx, s2X - 3, s2BaseY - s2H - 1, 6, 2, G.stoneDark);
  // Smoke from stack 2
  smoke(ctx, s2X, s2BaseY - s2H - 4, (frame + 1) % 3);

  // 3. Overhead Pipe Bridge connecting Boiler to Factory Hall
  rect(ctx, 45, 90, 16, 4, G.out);
  rect(ctx, 45, 91, 16, 2, G.ironR);
  rect(ctx, 49, 90, 2, 4, G.ironTop);
  rect(ctx, 56, 90, 2, 4, G.ironTop);
  // Brass valve wheel on the pipe
  gear(ctx, 52, 90, 3, frame);

  // 4. Molten Toxic Slag Vat in front
  const vFx = 56, vFy = 124, vS = 9;
  box(ctx, vFx, vFy, vS, vS, 5, IRON);
  // bubbling molten green liquid inside
  isoBox(ctx, vFx, vFy - 4, vS - 2, vS - 2, 1, {
    top: G.toxic,
    left: G.toxicLight,
    right: G.toxic,
  });
  px(ctx, vFx - 3, vFy - 8 - (frame % 2), G.toxicLight);
  px(ctx, vFx + 1, vFy - 9 + (frame % 2), G.glowHot);

  // 5. Yard Props
  banner(ctx, mFx + mR - 2, mFy - (mR >> 1) + 2, 34, frame, false);
  barrel(ctx, mFx + mR - 10, mFy - (mR >> 1) + 12, true); // toxic barrel
  barrel(ctx, mFx + mR - 4, mFy - (mR >> 1) + 14, false);
  crate(ctx, mFx + 4, mFy + 4, 7);
  scrap(ctx, 22, 114, 8);
  bush(ctx, 16, 106, 3);

  return cv;
}

/**
 * 3. LUMBER (Lumber Camp, Industry, height 0.9, 3 frames)
 * Active goblin logging & timber camp: open timber-pole shelter with tool racks and stovepipe,
 * large stacked pyramidal log rick, heavy X-trestle sawbuck with animated toothed crosscut saw,
 * chopping block with embedded iron axe, hacked tree stumps, sawdust piles, and resin barrels.
 */
export function goblinLumber(frame: number): HTMLCanvasElement {
  const [cv, ctx] = canvasHD();

  // Ground shadow under the timber camp
  groundShadow(ctx, 64, 118, 44, 42, 12);

  // 1. Rear Open-Sided Timber Barn / Work Shelter
  // Footprint: fx = 56, fy = 96, wL = 26, wR = 24, h = 18
  const sFx = 56, sFy = 96, sL = 26, sR = 24, sH = 18;

  // Solid rear back wall (left wall of the right-back quadrant)
  // Back corner: (sFx + sR - sL, sFy - (sL + sR)/2) = (54, 71)
  // Draw back wall planks:
  for (let z = 0; z < sH; z += 4) {
    rect(ctx, sFx - sL, sFy - (sL >> 1) - z - 4, sL, 4, G.woodDark);
  }
  // Planks stacked inside the shelter
  for (let k = 0; k < 4; k++) {
    isoBox(ctx, sFx - 4, sFy - 2 - k * 3, 16, 6, 2, {
      top: G.woodLight,
      left: G.woodDark,
      right: G.woodR,
    });
  }

  // Four heavy corner timber posts holding up the shelter roof
  // Front post:
  rect(ctx, sFx - 1, sFy - sH, 3, sH + 1, G.out);
  rect(ctx, sFx, sFy - sH + 1, 1, sH, G.woodR);
  // Left post:
  const lpX = sFx - sL, lpY = sFy - (sL >> 1);
  rect(ctx, lpX - 1, lpY - sH, 3, sH + 1, G.out);
  rect(ctx, lpX, lpY - sH + 1, 1, sH, G.woodDark);
  // Right post:
  const rpX = sFx + sR, rpY = sFy - (sR >> 1);
  rect(ctx, rpX - 1, rpY - sH, 3, sH + 1, G.out);
  rect(ctx, rpX, rpY - sH + 1, 1, sH, G.woodR);

  // Cross tie-beams between posts
  rect(ctx, lpX, lpY - sH, sL, 2, G.woodDark);
  rect(ctx, sFx, sFy - sH, sR, 2, G.woodL);

  // Hanging tool rack under the eaves: iron axe and hand-saws
  rect(ctx, sFx - 10, sFy - sH + 4, 1, 6, G.woodLight); // axe handle
  rect(ctx, sFx - 11, sFy - sH + 8, 3, 2, G.ironTop);   // axe blade
  rect(ctx, sFx - 4, sFy - sH + 4, 1, 7, G.ironR);     // saw blade

  // Shelter Roof: moss shingle & corrugated rust roof
  roof(ctx, sFx, sFy - sH, sL, sR, 0, 15, RUST, true);

  // Crooked stovepipe chimney atop shelter
  const c = chimney(ctx, sFx + 6, sFy - sH - 12, 8);
  smoke(ctx, c.x, c.y, frame);

  // 2. Stacked Pyramidal Log Rick (Right yard)
  // Stack of 6 cut logs (3 on bottom, 2 in middle, 1 on top)
  const drawLog = (lx: number, ly: number, len: number) => {
    // Log bark body extending back along left-up axis
    for (let u = 1; u <= len; u++) {
      const sx = lx - u;
      const sy = ly - (u >> 1);
      rect(ctx, sx - 2, sy - 3, 5, 6, G.out);
      rect(ctx, sx - 2, sy - 2, 4, 5, G.woodDark);
      rect(ctx, sx - 1, sy - 3, 3, 2, G.woodL);
    }
    // Front cut log end (round disc with growth rings)
    disc(ctx, lx, ly, 3, G.out);
    disc(ctx, lx, ly, 2, G.woodLight);
    px(ctx, lx, ly, G.woodDark); // center ring
    px(ctx, lx - 1, ly, G.woodTop);
    px(ctx, lx + 1, ly, G.woodTop);
  };

  // Base tier of logs
  drawLog(84, 104, 18);
  drawLog(92, 100, 18);
  drawLog(100, 96, 18);
  // Middle tier
  drawLog(88, 98, 18);
  drawLog(96, 94, 18);
  // Top tier
  drawLog(92, 92, 18);

  // 3. Goblin Sawbuck with Animated Toothed Crosscut Saw (Center work area)
  // Trestle base around fx = 62, fy = 114
  const sbX = 62, sbY = 114;
  // X-trestle front leg pair
  rect(ctx, sbX - 6, sbY - 10, 2, 12, G.out);
  rect(ctx, sbX - 5, sbY - 9, 1, 10, G.woodR);
  rect(ctx, sbX + 4, sbY - 10, 2, 12, G.out);
  rect(ctx, sbX + 3, sbY - 9, 1, 10, G.woodL);
  // Cross pin
  px(ctx, sbX - 1, sbY - 5, G.ironDark);

  // Heavy timber trunk resting across the sawbuck (left-up axis)
  for (let u = -8; u <= 12; u++) {
    const tx = sbX + 2 - u;
    const ty = sbY - 8 - (u >> 1);
    rect(ctx, tx - 2, ty - 2, 5, 5, G.out);
    rect(ctx, tx - 1, ty - 2, 3, 4, G.woodR);
    rect(ctx, tx - 1, ty - 3, 3, 1, G.woodLight);
  }
  // Cut end of trunk
  disc(ctx, sbX + 10, sbY - 4, 3, G.out);
  disc(ctx, sbX + 10, sbY - 4, 2, G.woodLight);
  px(ctx, sbX + 10, sbY - 4, G.woodDark);

  // Saw blade motion: shifts back and forth across frames
  const sawShift = (frame % 3) * 2 - 2; // -2, 0, +2
  const sawX = sbX - 2 + sawShift, sawY = sbY - 11;
  // Iron saw blade slicing into the trunk
  rect(ctx, sawX - 8, sawY, 18, 3, G.out);
  rect(ctx, sawX - 7, sawY + 1, 16, 1, G.ironTop);
  // Saw teeth
  for (let t = sawX - 7; t <= sawX + 8; t += 2) {
    px(ctx, t, sawY + 2, G.ironDark);
  }
  // Upright wooden saw handles at both ends
  rect(ctx, sawX - 9, sawY - 4, 2, 8, G.out);
  rect(ctx, sawX - 9, sawY - 3, 1, 6, G.woodLight);
  rect(ctx, sawX + 9, sawY - 4, 2, 8, G.out);
  rect(ctx, sawX + 9, sawY - 3, 1, 6, G.woodLight);

  // Yellow sawdust pile under the saw cut
  rect(ctx, sbX - 4, sbY - 1, 8, 3, G.shadow);
  rect(ctx, sbX - 3, sbY - 2, 6, 2, G.woodLight);
  px(ctx, sbX - 1, sbY - 3, G.brassLight);
  px(ctx, sbX + 1, sbY - 3, G.brassLight);

  // 4. Chopping Block with Embedded Iron Axe (Front-left)
  const cbX = 36, cbY = 114;
  // Stump block
  rect(ctx, cbX - 4, cbY - 7, 9, 8, G.out);
  rect(ctx, cbX - 3, cbY - 6, 7, 6, G.woodDark);
  disc(ctx, cbX, cbY - 7, 3, G.woodTop);
  px(ctx, cbX, cbY - 7, G.woodDark);
  // Iron axe stuck into the top of the chopping block
  rect(ctx, cbX - 1, cbY - 11, 4, 4, G.out);
  rect(ctx, cbX, cbY - 10, 2, 3, G.ironTop);
  px(ctx, cbX + 1, cbY - 9, G.ironDark);
  // Wooden axe handle sticking out at an angle
  rect(ctx, cbX + 2, cbY - 16, 2, 7, G.out);
  rect(ctx, cbX + 2, cbY - 15, 1, 6, G.woodLight);

  // 5. Freshly Hacked Tree Stumps in the clearing
  const drawStump = (sx: number, sy: number, r: number) => {
    rect(ctx, sx - r - 1, sy - 5, (r << 1) + 3, 6, G.out);
    rect(ctx, sx - r, sy - 4, r << 1 + 1, 5, G.woodDark);
    disc(ctx, sx, sy - 5, r, G.woodTop);
    px(ctx, sx, sy - 5, G.woodDark);
    // axe notch wedge mark
    px(ctx, sx + 1, sy - 5, G.out);
  };
  drawStump(22, 102, 3);
  drawStump(42, 98, 3);
  drawStump(18, 112, 2);

  // 6. Yard Props
  banner(ctx, 22, 94, 28, frame, true);
  crate(ctx, 74, 118, 6);
  barrel(ctx, 48, 118, false); // resin barrel
  scrap(ctx, 106, 104, 4);
  bush(ctx, 108, 88, 4);
  stakes(ctx, 14, 38, 86, 0.45, 9);

  return cv;
}

/**
 * 4. MINE (Mine, Industry, height 0.8, 3 frames)
 * Rich goblin iron & ore mine: craggy rock cliff face with glittering mineral and toxic veins,
 * shored-up timber tunnel adit with hanging flickering lantern, iron rail track with cross-ties,
 * heavy wheeled ore cart overflowing with gleaming gold and toxic crystals, wooden hoist derrick,
 * pickaxe, and rubble tailings.
 */
export function goblinMine(frame: number): HTMLCanvasElement {
  const [cv, ctx] = canvasHD();

  // Ground shadow under the mine slope and work yard
  groundShadow(ctx, 66, 120, 48, 44, 12);

  // 1. Craggy Rock Cliff Face (Back half of the tile)
  // Layered rock boulders and stone strata forming a natural cavern wall
  const drawRockMass = (cx: number, cy: number, r: number) => {
    disc(ctx, cx, cy, r + 1, G.out);
    disc(ctx, cx, cy, r, G.stoneL);
    disc(ctx, cx + 2, cy - 2, r - 3, G.stoneR);
    disc(ctx, cx - 1, cy - 3, Math.max(1, r - 5), G.stoneTop);
    // Craggy fissures & rock fractures
    for (let i = 0; i < 4; i++) {
      px(ctx, cx - r + 3 + i * 4, cy - 1 + (i % 2) * 2, G.mortar);
    }
  };

  // Back wall cliff formations
  drawRockMass(32, 70, 18);
  drawRockMass(96, 72, 18);
  drawRockMass(48, 60, 20);
  drawRockMass(80, 60, 20);
  drawRockMass(64, 54, 22);

  // Glittering mineral veins running through the rock cliff
  const veins = [
    { x: 38, y: 58, isToxic: false },
    { x: 44, y: 64, isToxic: false },
    { x: 74, y: 50, isToxic: true },
    { x: 86, y: 56, isToxic: true },
    { x: 92, y: 64, isToxic: false },
    { x: 58, y: 46, isToxic: false },
  ];
  for (let i = 0; i < veins.length; i++) {
    const v = veins[i]!;
    const twinkle = (i + frame) % 3 === 0;
    const col = v.isToxic
      ? (twinkle ? G.toxicLight : G.toxic)
      : (twinkle ? G.brassLight : G.brass);
    rect(ctx, v.x - 1, v.y - 1, 3, 3, G.out);
    rect(ctx, v.x, v.y, 2, 2, col);
    if (twinkle) px(ctx, v.x, v.y - 1, G.glowHot);
  }

  // 2. Mine Tunnel Adit (Tunnel mouth shored up by timber & iron)
  // Tunnel opening at center: dark cavern black
  const tX = 54, tY = 88, tW = 18, tH = 20;
  rect(ctx, tX - 1, tY - tH - 1, tW + 2, tH + 2, G.out);
  rect(ctx, tX, tY - tH, tW, tH, '#110d0a');
  // Cavern interior depth gradations
  rect(ctx, tX + 2, tY - tH + 3, tW - 4, tH - 3, '#0b0806');

  // Timber shoring portal frame
  // Left heavy post:
  rect(ctx, tX - 3, tY - tH - 2, 4, tH + 3, G.out);
  rect(ctx, tX - 2, tY - tH - 1, 2, tH + 1, G.woodDark);
  // Right heavy post:
  rect(ctx, tX + tW - 1, tY - tH - 2, 4, tH + 3, G.out);
  rect(ctx, tX + tW, tY - tH - 1, 2, tH + 1, G.woodR);
  // Heavy timber lintel beam:
  rect(ctx, tX - 4, tY - tH - 4, tW + 8, 4, G.out);
  rect(ctx, tX - 3, tY - tH - 3, tW + 6, 2, G.woodLight);
  // Riveted iron corner gussets
  px(ctx, tX - 1, tY - tH - 1, G.ironTop);
  px(ctx, tX + tW, tY - tH - 1, G.ironTop);

  // Hanging flickering mine lantern inside the arch
  const lanX = tX + (tW >> 1), lanY = tY - tH + 3;
  rect(ctx, lanX, lanY, 1, 3, G.ironTop); // chain
  rect(ctx, lanX - 2, lanY + 3, 5, 5, G.out);
  rect(ctx, lanX - 1, lanY + 4, 3, 3, G.woodDark);
  px(ctx, lanX, lanY + 5, frame % 2 === 0 ? G.glowHot : G.glow);
  // Amber lantern glow on the lintel underside
  rect(ctx, lanX - 3, lanY + 2, 7, 1, G.glowDeep);

  // 3. Wooden Hoist Derrick / Crane (to the left of tunnel)
  const dX = 34, dY = 86;
  // A-frame timber legs
  rect(ctx, dX - 1, dY - 28, 3, 29, G.out);
  rect(ctx, dX, dY - 27, 1, 27, G.woodLight);
  rect(ctx, dX + 8, dY - 20, 2, 21, G.out);
  rect(ctx, dX + 8, dY - 19, 1, 19, G.woodDark);
  // Crane arm
  rect(ctx, dX - 3, dY - 28, 14, 3, G.out);
  rect(ctx, dX - 2, dY - 27, 12, 1, G.woodR);
  // Pulley cog at apex
  gear(ctx, dX + 8, dY - 27, 3, frame);
  // Cable & dangling iron bucket
  rect(ctx, dX + 8, dY - 23, 1, 8, G.ironTop);
  box(ctx, dX + 10, dY - 12, 5, 5, 4, IRON);

  // 4. Rail Tracks (extending forward-right from tunnel mouth)
  // Track runs from (58, 88) down to (92, 105)
  for (let k = 0; k < 9; k++) {
    const rx = 58 + k * 4;
    const ry = 88 + k * 2;
    // Wooden cross-tie (sleeper)
    rect(ctx, rx - 4, ry + 1, 8, 2, G.out);
    rect(ctx, rx - 3, ry + 1, 6, 1, G.woodDark);
  }
  // Two parallel iron rails
  for (let k = 0; k < 36; k++) {
    const rx = 58 + k;
    const ry = 88 + (k >> 1);
    // Rail 1 (inner)
    px(ctx, rx - 2, ry, G.ironTop);
    px(ctx, rx - 2, ry + 1, G.out);
    // Rail 2 (outer)
    px(ctx, rx + 2, ry, G.ironTop);
    px(ctx, rx + 2, ry + 1, G.out);
  }

  // 5. Heavy Wheeled Ore Cart (on the rails at fx = 76, fy = 106)
  const cFx = 76, cFy = 106, cL = 12, cR = 14, cH = 10;
  // Iron cart hopper
  box(ctx, cFx, cFy, cL, cR, cH, IRON);
  rivets(ctx, cFx, cFy, cR, cH, 4);

  // Flanged iron cart wheels resting on the rails
  // Front wheel:
  disc(ctx, cFx - 3, cFy + 3, 3, G.out);
  disc(ctx, cFx - 3, cFy + 3, 2, G.ironTop);
  px(ctx, cFx - 3, cFy + 3, G.ironDark);
  // Rear wheel:
  disc(ctx, cFx + cR - 3, cFy - (cR >> 1) + 3, 3, G.out);
  disc(ctx, cFx + cR - 3, cFy - (cR >> 1) + 3, 2, G.ironTop);
  px(ctx, cFx + cR - 3, cFy - (cR >> 1) + 3, G.ironDark);

  // Ore overflowing the cart: glittering gold, iron, and toxic crystals
  const oreChunks = [
    [-4, -2, G.brassLight],
    [-1, -3, G.brass],
    [2, -2, G.toxicLight],
    [5, -1, G.toxic],
    [-2, 0, G.ironTop],
    [1, -1, G.brass],
    [3, 1, G.toxicLight],
    [0, 2, G.ironTop],
  ] as const;
  for (const [ox, oy, col] of oreChunks) {
    const pxX = cFx - (cL >> 1) + (cR >> 1) + ox;
    const pxY = cFy - cH - ((cL + cR) >> 2) + oy;
    rect(ctx, pxX - 1, pxY - 1, 3, 3, G.out);
    rect(ctx, pxX, pxY, 2, 2, col);
  }

  // 6. Mine Pickaxe leaning against shoring post
  rect(ctx, tX - 5, tY - 14, 2, 14, G.out);
  rect(ctx, tX - 5, tY - 13, 1, 12, G.woodLight); // handle
  // curved pick head
  rect(ctx, tX - 8, tY - 14, 7, 2, G.ironTop);
  px(ctx, tX - 9, tY - 13, G.ironDark);
  px(ctx, tX - 2, tY - 13, G.ironDark);

  // 7. Ore Tailings & Waste Piles (stone rubble)
  const drawTailings = (tx: number, ty: number, w: number, h: number) => {
    rect(ctx, tx - 1, ty - h - 1, w + 2, h + 2, G.out);
    rect(ctx, tx, ty - h, w, h, G.stoneL);
    for (let u = 0; u < w; u += 2) {
      px(ctx, tx + u, ty - h + (u % 2), G.stoneTop);
      px(ctx, tx + u + 1, ty - 1, G.stoneDark);
    }
  };
  drawTailings(24, 98, 12, 6);
  drawTailings(40, 106, 10, 5);

  // 8. Yard Props
  crate(ctx, 88, 116, 7);
  barrel(ctx, 98, 110, true); // toxic barrel
  barrel(ctx, 104, 106, false);
  scrap(ctx, 20, 110, 6);
  bush(ctx, 16, 100, 3);
  banner(ctx, 106, 90, 28, frame, false);

  return cv;
}

/**
 * 5. WORKSHOP (Workshop, Industry, height 1.1, 3 frames)
 * Bustling goblin tinkers' & blacksmith workshop: two-storey stone and half-timbered forge house,
 * wide open blazing hearth arch with glowing orange fire and embers, massive stone chimney,
 * outdoor stamping press with large rotating interlocking brass & iron gears, heavy iron anvil
 * on oak stump with red-hot iron billet and hammer, toolbench with vise, and crates of fresh cogs.
 */
export function goblinWorkshop(frame: number): HTMLCanvasElement {
  const [cv, ctx] = canvasHD();

  // Ground shadow under the workshop and yard
  groundShadow(ctx, 66, 120, 46, 44, 12);

  // 1. Workshop Forge Building (Back-left)
  // Footprint: fx = 58, fy = 106, wL = 34, wR = 26
  const wFx = 58, wFy = 106, wL = 34, wR = 26;

  // Ground floor: heavy dark stone with mortar lines
  box(ctx, wFx, wFy, wL, wR, 16, STONE);
  brickWalls(ctx, wFx, wFy, wL, wR, 16, 4, 6);

  // Wide open blacksmith forge hearth arch on the right wall
  rightWallRect(ctx, wFx, wFy, 6, 0, 14, 13, G.out);
  rightWallRect(ctx, wFx, wFy, 7, 0, 12, 12, '#180e07');
  // Blazing hearth coal fire with flickering embers
  rightWallRect(ctx, wFx, wFy, 8, 0, 10, 5, G.glowDeep);
  rightWallRect(ctx, wFx, wFy, 9, 1, 8, 4, frame % 2 === 0 ? G.glowHot : G.glow);
  px(ctx, wFx + 8, wFy - 4 - 8 - (frame % 3), G.glowHot);
  px(ctx, wFx + 12, wFy - 6 - 9 + (frame % 2), G.toxicLight);

  // Shaded window on left wall
  windowL(ctx, wFx, wFy, 14, 5, 5, 6, true);

  // Upper floor: half-timbered daub workshop
  const uFy = wFy - 16;
  box(ctx, wFx, uFy, wL, wR, 14, DAUB);
  timberFrame(ctx, wFx, uFy, wL, wR, 14);
  windowR(ctx, wFx, uFy, 8, 4, 5, 5, true);
  windowL(ctx, wFx, uFy, 12, 4, 5, 5, true);

  // Moss-covered roof with rusty tin repair patch
  roof(ctx, wFx, uFy, wL, wR, 14, 18, MOSS, true);

  // Massive stone chimney rising above the forge
  const c = chimney(ctx, wFx + 10, uFy - 18, 14);
  smoke(ctx, c.x, c.y, frame);

  // 2. Outdoor Stamping Press with Intermeshing Gears (Right yard)
  // Iron A-frame derrick mounting the gearworks
  const gBaseX = 86, gBaseY = 94;
  // Upright iron posts
  rect(ctx, gBaseX - 8, gBaseY - 14, 3, 20, G.out);
  rect(ctx, gBaseX - 7, gBaseY - 13, 1, 18, G.ironL);
  rect(ctx, gBaseX + 12, gBaseY - 24, 3, 20, G.out);
  rect(ctx, gBaseX + 13, gBaseY - 23, 1, 18, G.ironR);
  // Cross beam
  rect(ctx, gBaseX - 9, gBaseY - 2, 24, 3, G.out);
  rect(ctx, gBaseX - 8, gBaseY - 1, 22, 1, G.ironDark);

  // Large Primary Brass Cog (radius 8, rotates with frame)
  gear(ctx, gBaseX - 2, gBaseY, 8, frame);

  // Secondary Meshing Steel Cog (radius 5, counter-rotates)
  gear(ctx, gBaseX + 11, gBaseY - 6, 5, (frame + 1) % 3);

  // Small tertiary brass drive cog
  gear(ctx, gBaseX - 2, gBaseY - 12, 4, (frame + 2) % 3);

  // 3. Blacksmith Anvil on Oak Stump (Front-center yard)
  const anX = 48, anY = 116;
  // Heavy oak tree stump base
  rect(ctx, anX - 4, anY - 7, 9, 8, G.out);
  rect(ctx, anX - 3, anY - 6, 7, 6, G.woodDark);
  disc(ctx, anX, anY - 7, 3, G.woodTop);

  // Iron Horned Anvil
  rect(ctx, anX - 3, anY - 9, 7, 3, G.out);
  rect(ctx, anX - 2, anY - 8, 5, 2, G.ironDark);
  rect(ctx, anX - 5, anY - 12, 12, 4, G.out);
  rect(ctx, anX - 4, anY - 11, 10, 2, G.ironTop);
  px(ctx, anX - 5, anY - 11, G.ironL); // horn tip
  // Red-hot glowing iron billet on the anvil face
  rect(ctx, anX - 1, anY - 12, 4, 1, frame % 2 === 0 ? G.glowHot : G.glowDeep);
  // Blacksmith forging hammer
  rect(ctx, anX + 3, anY - 14, 1, 5, G.woodLight); // handle
  rect(ctx, anX + 2, anY - 15, 3, 2, G.ironTop);   // hammer head

  // 4. Quenching Water Barrel beside the anvil
  barrel(ctx, 36, 118, false);
  // Steam puff rising from quenching tub
  px(ctx, 36, 105 - (frame % 3), G.smoke);
  px(ctx, 37, 104 - (frame % 3), G.smokeShade);

  // 5. Workbench with Vise (Front-left yard)
  isoBox(ctx, 28, 112, 8, 6, 5, {
    top: G.woodTop,
    left: G.woodDark,
    right: G.woodR,
  });
  // Iron bench vise on the edge
  rect(ctx, 27, 105, 3, 3, G.out);
  rect(ctx, 28, 105, 2, 2, G.ironTop);

  // 6. Crates overflowing with newly stamped gears
  crate(ctx, 74, 118, 7);
  // Shiny gears lying on and in the crate
  gear(ctx, 72, 113, 3, frame);
  gear(ctx, 78, 115, 2, (frame + 1) % 3);

  // 7. Yard Props
  banner(ctx, 108, 92, 28, frame, false);
  barrel(ctx, 98, 106, true); // toxic grease barrel
  scrap(ctx, 20, 104, 5);
  bush(ctx, 16, 96, 4);
  stakes(ctx, 14, 34, 84, 0.45, 8);

  return cv;
}

/**
 * 6. FISHERY (Fishery, Industry, height 0.7, 3 frames)
 * Coastal goblin fishing outpost: stilt timber boardwalk dock over a murky water inlet with
 * animated shimmering ripples, ramshackle fishing shack with smoking stovepipe, draped mesh nets
 * with caught fish, drying rack with hung spiky bog-eels, dipping net crane, and barrels of catch.
 */
export function goblinFishery(frame: number): HTMLCanvasElement {
  const [cv, ctx] = canvasHD();

  // Ground shadow under the pier and shoreline
  groundShadow(ctx, 64, 118, 44, 42, 10);

  // 1. Murky Bog Water Pool / Canal Inlet (Right and front-right half)
  // Draw water basin diamond / polygon in the low right quadrant
  const waterPoints: [number, number][] = [
    [48, 104],
    [88, 84],
    [120, 100],
    [80, 120],
  ];
  ctx.beginPath();
  ctx.moveTo(waterPoints[0]![0], waterPoints[0]![1]);
  for (let i = 1; i < waterPoints.length; i++) {
    ctx.lineTo(waterPoints[i]![0], waterPoints[i]![1]);
  }
  ctx.closePath();
  ctx.fillStyle = '#22382c'; // deep murky water
  ctx.fill();

  // Water depth texture & ripples
  for (let y = 88; y <= 118; y += 2) {
    for (let x = 50; x <= 116; x += 3) {
      if (ctx.isPointInPath(x, y)) {
        if ((x + y) % 5 === 0) px(ctx, x, y, '#2e4c3c');
      }
    }
  }

  // Animated water wavelets & light glints (drifting with frame)
  const ripShift = (frame % 3) * 2;
  const rippleLocs = [
    [64 + ripShift, 108],
    [76 - ripShift, 112],
    [88 + ripShift, 104],
    [100 - ripShift, 100],
    [72 + ripShift, 115],
    [94 + ripShift, 110],
    [108 - ripShift, 106],
  ] as const;
  for (const [rx, ry] of rippleLocs) {
    rect(ctx, rx - 2, ry, 5, 1, G.mossLight);
    px(ctx, rx, ry, G.toxicLight);
  }

  // Floating bog lily pads / scum patches
  const drawLily = (lx: number, ly: number) => {
    disc(ctx, lx, ly, 3, G.out);
    disc(ctx, lx, ly, 2, G.leafDark);
    px(ctx, lx, ly, G.leafLight);
  };
  drawLily(84, 114);
  drawLily(104, 104);

  // 2. Heavy Timber Stilt Pilings (driven into the water)
  const pilings = [
    [52, 104, 12],
    [74, 98, 14],
    [96, 92, 14],
    [62, 110, 12],
    [84, 106, 12],
    [104, 102, 12],
  ] as const;
  for (const [pxX, pxY, pH] of pilings) {
    rect(ctx, pxX - 1, pxY, 3, pH + 1, G.out);
    rect(ctx, pxX, pxY, 1, pH, G.woodDark);
    // Waterline moss ring where pole enters water
    px(ctx, pxX, pxY + pH - 1, G.mossR);
    px(ctx, pxX, pxY + pH, G.mossLine);
  }

  // 3. Stilt Boardwalk Pier Deck
  // Pier box footprint: fx = 54, fy = 106, wL = 22, wR = 42, h = 4
  const pFx = 54, pFy = 106, pL = 22, pR = 42, pH = 4;
  box(ctx, pFx, pFy, pL, pR, pH, WOOD);
  plankWalls(ctx, pFx, pFy, pL, pR, pH, 3);
  // Deck plank seams on the top surface
  for (let v = 2; v < pR - 1; v += 4) {
    const startX = pFx + v;
    const startY = pFy - pH - (v >> 1);
    for (let u = 1; u < pL - 1; u++) {
      px(ctx, startX - u, startY - (u >> 1), G.woodDark);
    }
  }

  // 4. Ramshackle Fishing Shack (Back-left of pier)
  // Footprint: fx = 48, fy = 98, wL = 22, wR = 20, h = 14
  const sFx = 48, sFy = 98, sL = 22, sR = 20, sH = 14;
  box(ctx, sFx, sFy, sL, sR, sH, WOOD);
  plankWalls(ctx, sFx, sFy, sL, sR, sH, 3);

  // Arched entrance door on the right wall
  doorR(ctx, sFx, sFy, 4, 6, 10);
  // Shaded window on left wall
  windowL(ctx, sFx, sFy, 8, 4, 5, 5, true);

  // Rusty tin roof with patch
  roof(ctx, sFx, sFy - sH, sL, sR, 0, 13, RUST, true);

  // Crooked stovepipe chimney
  const c = chimney(ctx, sFx + 6, sFy - sH - 10, 8);
  smoke(ctx, c.x, c.y, frame);

  // 5. Pier Edge Railings & Draped Fishing Nets
  // Railing posts along the right edge:
  const railPosts = [10, 20, 30, 40];
  for (const v of railPosts) {
    const rx = pFx + v, ry = pFy - pH - (v >> 1);
    rect(ctx, rx - 1, ry - 6, 2, 7, G.out);
    rect(ctx, rx, ry - 5, 1, 6, G.woodLight);
  }
  // Railing crossbeam
  for (let v = 8; v <= 40; v++) {
    const rx = pFx + v, ry = pFy - pH - (v >> 1) - 6;
    px(ctx, rx, ry, G.out);
    px(ctx, rx, ry + 1, G.woodR);
  }

  // Draped woven fishing nets hanging in swags over the railing
  for (let v = 10; v <= 38; v++) {
    const rx = pFx + v, ry = pFy - pH - (v >> 1);
    const sag = Math.round(Math.sin(((v - 10) / 10) * Math.PI) * 5);
    for (let d = 0; d <= sag + 2; d++) {
      if ((v + d) % 2 === 0) {
        px(ctx, rx, ry - 3 + d, G.daubDark);
      } else {
        px(ctx, rx, ry - 3 + d, G.boneShade);
      }
    }
    // Tangled caught fish in the net swags
    if (v === 15 || v === 25 || v === 35) {
      px(ctx, rx, ry + sag - 2, G.ironTop);
      px(ctx, rx, ry + sag - 1, G.toxicLight);
    }
  }

  // 6. Fish Drying Racks on the Pier Deck
  const rX = 68, rY = 96;
  // Two upright wooden posts
  rect(ctx, rX - 1, rY - 11, 2, 12, G.out);
  rect(ctx, rX, rY - 10, 1, 11, G.woodDark);
  rect(ctx, rX + 10, rY - 16, 2, 12, G.out);
  rect(ctx, rX + 11, rY - 15, 1, 11, G.woodR);
  // Horizontal drying pole
  rect(ctx, rX, rY - 11, 12, 2, G.out);
  rect(ctx, rX, rY - 10, 11, 1, G.woodLight);

  // Hanging dried fish / bog eels
  const fishList = [
    [rX + 2, rY - 9, 5, G.ironTop],
    [rX + 5, rY - 9, 6, G.toxic],
    [rX + 8, rY - 9, 5, G.ironTop],
  ] as const;
  for (const [fx, fy, len, col] of fishList) {
    rect(ctx, fx, fy, 1, len, G.out);
    rect(ctx, fx, fy + 1, 1, len - 2, col);
    px(ctx, fx, fy + len - 1, G.bone); // fish tail
  }

  // 7. Wooden Dipping Net Crane (over the water)
  const crX = 94, crY = 96;
  // Angled boom spar
  for (let k = 0; k < 12; k++) {
    px(ctx, crX + k, crY - 8 + (k >> 1), G.out);
    px(ctx, crX + k, crY - 7 + (k >> 1), G.woodLight);
  }
  // Rope and circular hoop net dipping into the water
  rect(ctx, crX + 11, crY - 2, 1, 8, G.ironTop);
  // Net hoop
  disc(ctx, crX + 11, crY + 6, 4, G.out);
  disc(ctx, crX + 11, crY + 6, 3, G.mossLight);
  px(ctx, crX + 11, crY + 6, G.toxicLight);

  // 8. Barrels and Crates of Fish on the Dock
  barrel(ctx, 42, 108, false);
  // Fish heads poking out of barrel
  px(ctx, 41, 96, G.ironTop);
  px(ctx, 42, 96, G.bone);
  px(ctx, 43, 96, G.toxicLight);

  crate(ctx, 60, 114, 6);
  barrel(ctx, 28, 102, true); // toxic barrel on shoreline

  // 9. Shoreline Props
  scrap(ctx, 20, 104, 3);
  bush(ctx, 16, 96, 4);
  stakes(ctx, 14, 32, 86, 0.45, 8);
  banner(ctx, 24, 94, 28, frame, true);

  return cv;
}

export const art: Partial<Record<BuildingKind, () => HTMLCanvasElement[]>> = {
  farm: () => [0, 1, 2].map(goblinFarm),
  factory: () => [0, 1, 2].map(goblinFactory),
  lumber: () => [0, 1, 2].map(goblinLumber),
  mine: () => [0, 1, 2].map(goblinMine),
  workshop: () => [0, 1, 2].map(goblinWorkshop),
  fishery: () => [0, 1, 2].map(goblinFishery),
};

export const _unused = G;
