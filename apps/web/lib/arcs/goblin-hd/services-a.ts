// Goblin HD buildings: services-a (drawn by a worker, see .agy/tasks). Kinds left out fall back to the 1x goblin art.
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
import { isoBox, leftWallRect, rect, rightWallRect, px } from '../../sprites';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Small horned or plain goblin skull emblem for totems, shrines, and banners */
function drawSkull(ctx: CanvasRenderingContext2D, cx: number, cy: number, horned = false) {
  disc(ctx, cx, cy, 3, G.out);
  disc(ctx, cx, cy, 2, G.bone);
  rect(ctx, cx - 1, cy + 2, 3, 2, G.out);
  rect(ctx, cx, cy + 2, 2, 1, G.bone);
  // eye sockets
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
// 1. SCHOOL (Services, 40 citizens, height 1.3)
// ---------------------------------------------------------------------------
/**
 * A goblin village schoolhouse: two-storey building with a stone foundation,
 * half-timbered classroom floor, moss-shingle roof crowned with a crooked belfry
 * and swinging iron saw-gong. In the front yard: an outdoor slate chalkboard
 * with glowing goblin runes, a bubbling alchemy lesson cauldron, and a training dummy.
 */
function drawSchool(frame: number): HTMLCanvasElement {
  const [cv, ctx] = canvasHD();
  // Building placed slightly back on the tile to leave a generous front yard
  const fx = 68, fy = 112, wL = 38, wR = 40;
  groundShadow(ctx, fx, fy, wL, wR, 12);

  // --- Ground floor: sturdy goblin masonry ---
  box(ctx, fx, fy, wL, wR, 15, STONE);
  brickWalls(ctx, fx, fy, wL, wR, 15, 4, 6);
  doorR(ctx, fx, fy, 16, 8, 12);
  windowR(ctx, fx, fy, 5, 4, 5, 7, true);
  windowR(ctx, fx, fy, 29, 4, 5, 7, true);
  windowL(ctx, fx, fy, 10, 4, 5, 7, true);
  windowL(ctx, fx, fy, 25, 4, 5, 7, false);

  // --- Upper floor: daub & dark timber classroom ---
  const uy = fy - 15;
  box(ctx, fx, uy, wL, wR, 15, DAUB);
  timberFrame(ctx, fx, uy, wL, wR, 15);
  windowR(ctx, fx, uy, 6, 4, 5, 7, true);
  windowR(ctx, fx, uy, 17, 4, 5, 7, true);
  windowR(ctx, fx, uy, 28, 4, 5, 7, true);
  windowL(ctx, fx, uy, 8, 4, 5, 7, true);
  windowL(ctx, fx, uy, 23, 4, 5, 7, true);

  // --- Roof: mossy shingles with rusty tin patch ---
  roof(ctx, fx, uy, wL, wR, 15, 22, MOSS, true);

  // Stone chimney with warm smoke puffs
  const c = chimney(ctx, fx + 16, uy - 26, 11);
  smoke(ctx, c.x, c.y, frame);

  // Belfry / Saw-Gong Tower mounted on roof ridge
  const ridgeX = fx - (wL >> 1) + 12;
  const ridgeY = uy - 15 - 22 + 4;
  // Wooden belfry legs
  rect(ctx, ridgeX - 4, ridgeY - 14, 2, 14, G.out);
  rect(ctx, ridgeX - 3, ridgeY - 13, 1, 13, G.woodR);
  rect(ctx, ridgeX + 3, ridgeY - 14, 2, 14, G.out);
  rect(ctx, ridgeX + 4, ridgeY - 13, 1, 13, G.woodR);
  // Belfry crossbeam
  rect(ctx, ridgeX - 6, ridgeY - 15, 14, 2, G.out);
  rect(ctx, ridgeX - 5, ridgeY - 14, 12, 1, G.woodLight);
  // Belfry peaked cap
  rect(ctx, ridgeX - 7, ridgeY - 17, 16, 2, G.out);
  rect(ctx, ridgeX - 6, ridgeY - 16, 14, 1, G.rustLight);
  px(ctx, ridgeX + 1, ridgeY - 18, G.brassLight);
  // Clanging saw-gong suspended between posts, swinging with frame
  const sway = frame === 1 ? 1 : frame === 2 ? -1 : 0;
  rect(ctx, ridgeX + 1 + sway, ridgeY - 13, 1, 3, G.ironDark);
  disc(ctx, ridgeX + 1 + sway, ridgeY - 8, 3, G.out);
  disc(ctx, ridgeX + 1 + sway, ridgeY - 8, 2, G.brass);
  px(ctx, ridgeX + 1 + sway, ridgeY - 8, G.brassDark);

  // --- Front Yard Classroom Activities ---
  // Outdoor slate chalkboard on sturdy wooden posts
  const boardX = fx - 24, boardY = fy + 5;
  rect(ctx, boardX - 8, boardY - 12, 2, 12, G.out);
  rect(ctx, boardX - 7, boardY - 11, 1, 11, G.woodR);
  rect(ctx, boardX + 6, boardY - 8, 2, 12, G.out);
  rect(ctx, boardX + 7, boardY - 7, 1, 11, G.woodR);
  // Slate frame and dark slate surface
  rect(ctx, boardX - 7, boardY - 14, 14, 9, G.out);
  rect(ctx, boardX - 6, boardY - 13, 12, 7, '#242b26');
  // Goblin math & rune scribbles in bright toxic chalk
  px(ctx, boardX - 4, boardY - 11, G.toxicLight);
  px(ctx, boardX - 3, boardY - 11, G.toxic);
  px(ctx, boardX - 1, boardY - 11, G.toxicLight);
  px(ctx, boardX + 1, boardY - 11, G.toxic);
  px(ctx, boardX + 3, boardY - 11, G.toxicLight);
  px(ctx, boardX - 4, boardY - 8, G.glowHot);
  px(ctx, boardX - 2, boardY - 8, G.glow);
  px(ctx, boardX + 1, boardY - 8, G.bone);
  px(ctx, boardX + 3, boardY - 8, G.glowHot);

  // Bubbling alchemy cauldron in yard center
  const cauldX = fx + 6, cauldY = fy + 8;
  disc(ctx, cauldX, cauldY - 4, 5, G.out);
  disc(ctx, cauldX, cauldY - 4, 4, G.ironDark);
  disc(ctx, cauldX, cauldY - 6, 3, G.toxic);
  px(ctx, cauldX, cauldY - 6, G.toxicLight);
  // Cauldron tripod legs
  px(ctx, cauldX - 3, cauldY, G.ironL);
  px(ctx, cauldX + 3, cauldY, G.ironR);
  px(ctx, cauldX, cauldY + 1, G.ironDark);
  // Animated bubbles and green sparks
  if (frame === 0) {
    px(ctx, cauldX - 1, cauldY - 9, G.toxicLight);
    px(ctx, cauldX + 2, cauldY - 8, G.toxic);
  } else if (frame === 1) {
    px(ctx, cauldX + 1, cauldY - 10, G.toxicLight);
    px(ctx, cauldX - 2, cauldY - 8, G.toxicLight);
  } else {
    px(ctx, cauldX, cauldY - 9, G.toxicLight);
    px(ctx, cauldX + 2, cauldY - 11, G.glowHot);
  }

  // Combat practice dummy on right side of yard
  const dumX = fx + 26, dumY = fy - 2;
  rect(ctx, dumX - 1, dumY - 14, 2, 14, G.out);
  rect(ctx, dumX, dumY - 13, 1, 13, G.woodR);
  // Crossbar arms
  rect(ctx, dumX - 5, dumY - 10, 10, 2, G.out);
  rect(ctx, dumX - 4, dumY - 9, 8, 1, G.woodLight);
  // Straw sack body & horned goblin skull helmet
  disc(ctx, dumX, dumY - 8, 3, G.woodTop);
  drawSkull(ctx, dumX, dumY - 13, true);

  // Yard props: goblin banner, school desk/crate, barrel, bush
  banner(ctx, fx - wL + 2, fy - (wL >> 1) + 4, 30, frame, true);
  crate(ctx, fx + 14, fy + 4, 6);
  barrel(ctx, fx + wR - 4, fy - (wR >> 1) + 8, false);
  bush(ctx, fx + wR - 10, fy - (wR >> 1) + 14, 4);
  bush(ctx, fx - 30, fy - 6, 3);

  return cv;
}

// ---------------------------------------------------------------------------
// 2. PARK (Services, +happiness, height 0.3)
// ---------------------------------------------------------------------------
/**
 * A goblin public park and garden: a winding cobblestone walking path through
 * the lush grounds, two gnarled leafy shade trees, a rustic timber and iron park
 * bench, a stone birdbath/fountain, wild blossom patches, and a waving green pennant.
 */
function drawPark(frame: number): HTMLCanvasElement {
  const [cv, ctx] = canvasHD();

  // --- Cobblestone walking path winding across the park ---
  // Coordinates follow the isometric diamond contours
  const pathCobbles: [number, number, number, number][] = [
    [32, 110, 4, 2], [37, 108, 5, 3], [43, 106, 5, 2], [49, 104, 6, 3],
    [54, 102, 5, 3], [58, 99, 6, 3], [63, 96, 6, 3], [69, 94, 5, 3],
    [75, 92, 6, 3], [81, 89, 5, 3], [86, 86, 6, 3], [91, 84, 5, 2],
    // branch path toward bench and birdbath
    [52, 106, 5, 2], [57, 108, 6, 3], [62, 110, 5, 2],
    [46, 100, 5, 2], [50, 96, 5, 3], [55, 93, 5, 2],
  ];

  for (const [px0, py0, w, h] of pathCobbles) {
    rect(ctx, px0 - 1, py0 - 1, w + 2, h + 2, G.cobbleDark);
    rect(ctx, px0, py0, w, h, (px0 + py0) % 2 ? G.cobble : G.cobbleLight);
    px(ctx, px0 + w - 1, py0, G.stoneTop);
  }

  // --- Tree 1: Large gnarled shade tree on back-left (cx=36, by=82) ---
  // Ground shadow under tree 1
  disc(ctx, 36, 82, 12, G.shadow);
  // Gnarled trunk and roots
  rect(ctx, 34, 46, 6, 36, G.out);
  rect(ctx, 35, 47, 4, 34, G.woodR);
  rect(ctx, 35, 47, 2, 34, G.woodL);
  // Spreading roots
  rect(ctx, 28, 80, 8, 3, G.out);
  rect(ctx, 29, 81, 7, 2, G.woodL);
  rect(ctx, 38, 81, 8, 3, G.out);
  rect(ctx, 39, 82, 7, 2, G.woodR);
  // Branch splits
  rect(ctx, 26, 42, 10, 5, G.out);
  rect(ctx, 27, 43, 8, 3, G.woodL);
  rect(ctx, 38, 40, 10, 5, G.out);
  rect(ctx, 39, 41, 8, 3, G.woodR);
  // Lush layered foliage clusters
  const tree1Canopy = [
    [34, 38, 14], [24, 36, 10], [44, 34, 11],
    [34, 26, 12], [26, 25, 9], [42, 23, 10], [34, 16, 8],
  ] as const;
  for (const [cx, cy, r] of tree1Canopy) {
    disc(ctx, cx, cy, r + 1, G.out);
    disc(ctx, cx, cy, r, G.leaf);
    disc(ctx, cx + 1, cy + 2, r - 2, G.leafDark);
    disc(ctx, cx - 1, cy - 2, Math.max(1, r - 3), G.leafLight);
    px(ctx, cx - 2, cy - 3, G.grassTip);
  }
  // A small wooden birdhouse/goblin lantern hanging from a low bough
  rect(ctx, 25, 48, 1, 6, G.out); // rope
  rect(ctx, 23, 54, 5, 5, G.out);
  rect(ctx, 24, 55, 3, 3, G.woodTop);
  px(ctx, 25, 56, G.glowHot); // lantern glow

  // --- Tree 2: Flowering orchard/willow tree on right (cx=92, by=92) ---
  // Ground shadow under tree 2
  disc(ctx, 92, 92, 10, G.shadow);
  // Trunk and roots
  rect(ctx, 90, 60, 5, 32, G.out);
  rect(ctx, 91, 61, 3, 30, G.woodR);
  rect(ctx, 91, 61, 1, 30, G.woodL);
  rect(ctx, 86, 90, 6, 3, G.out);
  rect(ctx, 87, 91, 5, 2, G.woodL);
  rect(ctx, 94, 91, 6, 3, G.out);
  rect(ctx, 95, 92, 5, 2, G.woodR);
  // Lush canopy clusters
  const tree2Canopy = [
    [92, 54, 12], [82, 52, 9], [100, 50, 9],
    [92, 42, 11], [84, 40, 8], [98, 38, 8], [92, 32, 7],
  ] as const;
  for (const [cx, cy, r] of tree2Canopy) {
    disc(ctx, cx, cy, r + 1, G.out);
    disc(ctx, cx, cy, r, G.leaf);
    disc(ctx, cx + 1, cy + 2, r - 2, G.leafDark);
    disc(ctx, cx - 1, cy - 2, Math.max(1, r - 3), G.leafLight);
    // Tree 2 has small cheerful yellow blossoms!
    px(ctx, cx, cy - 1, '#f4e04a');
    px(ctx, cx + 2, cy + 1, '#fff8d0');
  }

  // --- The Park Bench (rustic dark timber planks & riveted iron frame) ---
  // Positioned beside the path at (fx=54, fy=112)
  const bFx = 54, bFy = 112;
  // Bench shadow
  ctx.fillStyle = G.shadow;
  ctx.fillRect(bFx - 6, bFy - 1, 14, 5);
  // Bench legs (iron)
  rect(ctx, bFx - 5, bFy - 6, 2, 8, G.out);
  rect(ctx, bFx - 4, bFy - 5, 1, 7, G.ironL);
  rect(ctx, bFx + 7, bFy - 6, 2, 8, G.out);
  rect(ctx, bFx + 8, bFy - 5, 1, 7, G.ironR);
  // Wooden plank seat
  rect(ctx, bFx - 7, bFy - 7, 18, 4, G.out);
  rect(ctx, bFx - 6, bFy - 6, 16, 2, G.woodTop);
  rect(ctx, bFx - 6, bFy - 4, 16, 1, G.woodR);
  // Bench backrest uprights & horizontal slats
  rect(ctx, bFx - 5, bFy - 14, 2, 8, G.out);
  rect(ctx, bFx - 4, bFy - 13, 1, 7, G.ironL);
  rect(ctx, bFx + 7, bFy - 14, 2, 8, G.out);
  rect(ctx, bFx + 8, bFy - 13, 1, 7, G.ironR);
  rect(ctx, bFx - 7, bFy - 15, 18, 3, G.out);
  rect(ctx, bFx - 6, bFy - 14, 16, 2, G.woodTop);
  rect(ctx, bFx - 7, bFy - 11, 18, 2, G.out);
  rect(ctx, bFx - 6, bFy - 10, 16, 1, G.woodR);

  // --- Stone Birdbath / Goblin Fountain (center-right, fx=74, fy=104) ---
  const fbX = 74, fbY = 104;
  disc(ctx, fbX, fbY + 2, 7, G.shadow);
  // Stone pedestal
  rect(ctx, fbX - 2, fbY - 6, 5, 8, G.out);
  rect(ctx, fbX - 1, fbY - 5, 3, 7, G.stoneR);
  // Basin bowl
  disc(ctx, fbX, fbY - 8, 6, G.out);
  disc(ctx, fbX, fbY - 8, 5, G.stoneTop);
  disc(ctx, fbX, fbY - 9, 3, '#4fc3f7'); // fresh blue water
  // Animated water shimmer/fountain droplet
  const waterSway = frame === 0 ? 0 : frame === 1 ? -1 : 1;
  px(ctx, fbX + waterSway, fbY - 11 - (frame % 2), '#e0f7fa');
  px(ctx, fbX, fbY - 9, '#ffffff');

  // --- Park Amenities & Goblin Details ---
  // Green skull banner waving on a timber flagpole by the park entrance
  banner(ctx, 22, 116, 28, frame, false);

  // Wildflower flowerbeds and shrubbery
  bush(ctx, 42, 114, 4);
  bush(ctx, 84, 102, 5);
  bush(ctx, 64, 78, 4);
  bush(ctx, 108, 92, 3);
  bush(ctx, 18, 94, 3);

  // Little clusters of colorful park flowers
  const flowerSpots = [
    [48, 114, '#f08ab4'], [68, 112, '#ffd54f'], [78, 108, '#8ad0ff'],
    [60, 84, '#f4e04a'], [72, 82, '#f08ab4'], [86, 76, '#8ad0ff'],
  ] as const;
  for (const [fx0, fy0, col] of flowerSpots) {
    px(ctx, fx0, fy0, G.leafDark);
    px(ctx, fx0, fy0 - 1, col);
    px(ctx, fx0 + 1, fy0 - 1, '#ffffff');
  }

  // Small wooden scrap crate / basket near the bench
  crate(ctx, bFx + 12, bFy - 2, 5);

  return cv;
}

// ---------------------------------------------------------------------------
// 3. LIBRARY (Services, 20 citizens, height 1.0)
// ---------------------------------------------------------------------------
/**
 * A goblin scroll-archive and antiquities library: a cosy timber-framed hall
 * upon an ashlar stone foundation, steep moss-shingled roof crowned with an open
 * tome signboard and study chimney, tall arched study windows, entrance porch
 * with a brass lantern, and an outdoor reading lectern with rolled salvage scrolls.
 */
function drawLibrary(frame: number): HTMLCanvasElement {
  const [cv, ctx] = canvasHD();
  const fx = 66, fy = 120, wL = 44, wR = 42;
  groundShadow(ctx, fx, fy, wL, wR, 12);

  // --- Foundation: warm stone course ---
  box(ctx, fx, fy, wL, wR, 8, STONE);
  brickWalls(ctx, fx, fy, wL, wR, 8, 4, 6);

  // --- Archive Hall: half-timbered daub walls ---
  const uy = fy - 8;
  box(ctx, fx, uy, wL, wR, 18, DAUB);
  timberFrame(ctx, fx, uy, wL, wR, 18);

  // Entrance door on the right wall
  doorR(ctx, fx, uy, 16, 8, 14);

  // Tall arched study windows with warm amber and subtle toxic-tint study light
  windowR(ctx, fx, uy, 5, 5, 6, 9, true);
  windowR(ctx, fx, uy, 28, 5, 6, 9, true);
  windowL(ctx, fx, uy, 10, 5, 6, 9, true);
  windowL(ctx, fx, uy, 26, 5, 6, 9, true);

  // Timber awning / porch over the entrance door
  rightWallRect(ctx, fx, uy, 14, 15, 12, 2, G.woodTop);
  rightWallRect(ctx, fx, uy, 15, 16, 10, 2, G.mossR);
  // Warm hanging brass lantern by the doorway
  const lanX = fx + 15, lanY = uy - (15 >> 1) - 12;
  rect(ctx, lanX, lanY - 3, 1, 3, G.ironDark);
  disc(ctx, lanX, lanY + 1, 3, G.out);
  disc(ctx, lanX, lanY + 1, 2, G.brass);
  px(ctx, lanX, lanY + 1, frame === 1 ? G.glowHot : G.glow);
  px(ctx, lanX + (frame === 2 ? 1 : 0), lanY + 2, G.glowDeep);

  // --- Steep mossy roof with rusty tin patch ---
  roof(ctx, fx, uy, wL, wR, 18, 22, MOSS, true);

  // Reading hearth stone chimney & smoke
  const c = chimney(ctx, fx + 14, uy - 32, 12);
  smoke(ctx, c.x, c.y, frame);

  // --- Prominent Open Tome / Scroll Signboard mounted on roof gable ---
  // Positioned along the front ridge / gable
  const signX = fx - (wL >> 1) + 2, signY = uy - 18 - 22 + 6;
  // Wooden mount board
  rect(ctx, signX - 9, signY - 8, 18, 10, G.out);
  rect(ctx, signX - 8, signY - 7, 16, 8, G.woodR);
  // Open book pages (bone parchment)
  rect(ctx, signX - 7, signY - 6, 6, 6, G.bone);
  rect(ctx, signX + 1, signY - 6, 6, 6, G.bone);
  // Leather book spine & page divider
  rect(ctx, signX - 1, signY - 7, 2, 8, G.woodDark);
  // Text lines (goblin script)
  for (let row = 0; row < 3; row++) {
    rect(ctx, signX - 6, signY - 5 + row * 2, 4, 1, G.woodL);
    rect(ctx, signX + 2, signY - 5 + row * 2, 4, 1, G.woodL);
  }
  // Red/brass bookmark ribbon dangling down
  px(ctx, signX, signY + 1, G.rustLight);
  px(ctx, signX, signY + 2, G.rustLight);

  // --- Yard: outdoor reading lectern, scroll crates, props ---
  // Outdoor wooden study lectern with an open scroll
  const lecX = fx + 26, lecY = fy + 2;
  // Lectern post & angled book rest
  rect(ctx, lecX - 1, lecY - 10, 2, 10, G.out);
  rect(ctx, lecX, lecY - 9, 1, 9, G.woodR);
  rect(ctx, lecX - 4, lecY - 14, 8, 4, G.out);
  rect(ctx, lecX - 3, lecY - 13, 6, 3, G.woodTop);
  // Unfurled paper scroll on lectern
  rect(ctx, lecX - 2, lecY - 13, 4, 2, G.bone);
  px(ctx, lecX - 1, lecY - 12, G.woodDark);
  // Feather quill in inkpot
  px(ctx, lecX + 3, lecY - 13, G.out);
  px(ctx, lecX + 4, lecY - 15, G.bone);

  // Wooden crate filled with rolled scrolls
  const crX = fx + 6, crY = fy + 5;
  crate(ctx, crX, crY, 7);
  // Rolled parchment ends sticking out
  disc(ctx, crX - 2, crY - 9, 1, G.bone);
  disc(ctx, crX + 2, crY - 8, 1, G.boneShade);
  disc(ctx, crX, crY - 10, 1, G.bone);

  // Goblin banner on left corner
  banner(ctx, fx - wL + 2, fy - (wL >> 1) + 2, 32, frame, true);

  // Yard scrap, barrel, and shrubbery
  barrel(ctx, fx + wR - 4, fy - (wR >> 1) + 6, false);
  scrap(ctx, fx - 22, fy - 2, 4);
  bush(ctx, fx + wR - 12, fy - (wR >> 1) + 12, 4);
  bush(ctx, fx - 28, fy - 6, 3);

  return cv;
}

// ---------------------------------------------------------------------------
// 4. ACADEMY (Services, 120 citizens, height 1.9)
// ---------------------------------------------------------------------------
/**
 * A grand goblin college of alchemy, explosives, and engineering: the tallest
 * service building! A massive three-tiered structure featuring a heavy ashlar
 * stone lecture hall base, timber-and-daub laboratory floor, iron observatory
 * drum with a giant patched copper dome, and a towering crooked lightning-rod
 * tesla coil reaching y=8 with crackling plasma sparks.
 */
function drawAcademy(frame: number): HTMLCanvasElement {
  const [cv, ctx] = canvasHD();
  // Grand lecture hall base
  const fx = 66, fy = 122, wL = 46, wR = 46;
  groundShadow(ctx, fx, fy, wL, wR, 14);

  // --- Tier 1: Grand Lecture Hall (Stone & Iron) ---
  box(ctx, fx, fy, wL, wR, 16, STONE);
  brickWalls(ctx, fx, fy, wL, wR, 16, 4, 6);
  // Heavy arched double entrance doors with iron bands
  doorR(ctx, fx, fy, 17, 10, 14);
  rightWallRect(ctx, fx, fy, 21, 0, 1, 13, G.out); // door split
  // Grand arched lecture hall windows
  windowR(ctx, fx, fy, 5, 5, 6, 8, true);
  windowR(ctx, fx, fy, 32, 5, 6, 8, true);
  windowL(ctx, fx, fy, 8, 5, 6, 8, true);
  windowL(ctx, fx, fy, 26, 5, 6, 8, true);
  // Tier 1 cornice / riveted iron balustrade
  isoBox(ctx, fx, fy - 16, wL, wR, 2, { top: G.ironTop, left: G.ironL, right: G.ironR, outline: G.out });
  rivets(ctx, fx, fy - 16, wR, 2, 5);

  // Long ragged green-and-rust academy banners hung on Tier 1 facade
  rightWallRect(ctx, fx, fy, 13, 3, 3, 10, G.out);
  rightWallRect(ctx, fx, fy, 14, 4, 1, 8, G.banner);
  px(ctx, fx + 14, fy - 7 - 6, G.bone); // skull dot
  leftWallRect(ctx, fx, fy, 16, 3, 3, 10, G.out);
  leftWallRect(ctx, fx, fy, 17, 4, 1, 8, G.rustR);

  // --- Tier 2: Laboratory & Tinkersmith Drum ---
  const t2Fx = fx, t2Fy = fy - 18, t2L = 34, t2R = 34;
  box(ctx, t2Fx, t2Fy, t2L, t2R, 14, DAUB);
  timberFrame(ctx, t2Fx, t2Fy, t2L, t2R, 14);
  // Glowing green alchemy lab windows
  rightWallRect(ctx, t2Fx, t2Fy, 6, 3, 5, 7, G.out);
  rightWallRect(ctx, t2Fx, t2Fy, 7, 4, 3, 5, G.toxic);
  rightWallRect(ctx, t2Fx, t2Fy, 7, 7, 3, 2, G.toxicLight);
  rightWallRect(ctx, t2Fx, t2Fy, 21, 3, 5, 7, G.out);
  rightWallRect(ctx, t2Fx, t2Fy, 22, 4, 3, 5, G.glow);
  rightWallRect(ctx, t2Fx, t2Fy, 22, 7, 3, 2, G.glowHot);
  leftWallRect(ctx, t2Fx, t2Fy, 8, 3, 5, 7, G.out);
  leftWallRect(ctx, t2Fx, t2Fy, 9, 4, 3, 5, G.toxic);
  leftWallRect(ctx, t2Fx, t2Fy, 21, 3, 5, 7, G.out);
  leftWallRect(ctx, t2Fx, t2Fy, 22, 4, 3, 5, G.glowDeep);
  // Tier 2 iron roof trim
  isoBox(ctx, t2Fx, t2Fy - 14, t2L, t2R, 2, { top: G.ironTop, left: G.ironL, right: G.ironR, outline: G.out });

  // Alchemy fume exhaust pipe on left wall puffing colored smoke
  const pipeX = t2Fx - t2L + 8, pipeY = t2Fy - (t2L >> 1) - 6;
  rect(ctx, pipeX, pipeY - 8, 3, 8, G.out);
  rect(ctx, pipeX + 1, pipeY - 7, 1, 7, G.rustLight);
  smoke(ctx, pipeX + 1, pipeY - 9, (frame + 1) % 3);

  // --- Tier 3: Observatory Drum (Riveted Iron) ---
  const t3Fx = t2Fx, t3Fy = t2Fy - 16, t3L = 22, t3R = 22;
  box(ctx, t3Fx, t3Fy, t3L, t3R, 9, IRON);
  rivets(ctx, t3Fx, t3Fy, t3R, 9, 4);
  // Glowing porthole windows
  rightWallRect(ctx, t3Fx, t3Fy, 5, 3, 3, 3, G.toxicLight);
  rightWallRect(ctx, t3Fx, t3Fy, 13, 3, 3, 3, G.toxic);
  leftWallRect(ctx, t3Fx, t3Fy, 6, 3, 3, 3, G.toxicLight);

  // --- Giant Patched Copper & Iron Observatory Dome ---
  const domeCx = 66, domeCy = t3Fy - 18;
  disc(ctx, domeCx, domeCy, 12, G.out);
  disc(ctx, domeCx, domeCy, 11, G.rustR);
  disc(ctx, domeCx - 2, domeCy - 2, 8, G.rustLight);
  disc(ctx, domeCx + 3, domeCy + 1, 5, G.ironTop);
  // Riveted plate seams across dome
  for (let dy = -8; dy <= 8; dy += 3) px(ctx, domeCx, domeCy + dy, G.rivet);
  // Telescope tube pointing to the stars
  rect(ctx, domeCx + 6, domeCy - 6, 9, 3, G.out);
  rect(ctx, domeCx + 7, domeCy - 5, 7, 1, G.brassLight);
  disc(ctx, domeCx + 14, domeCy - 5, 2, G.brass);

  // --- Summit Spire: Crooked Lightning Rod & Tesla Alchemy Coil ---
  // Rises from dome top (y=44) up to y=8!
  const spireBaseY = domeCy - 11;
  for (let i = 0; i < 26; i++) {
    const y0 = spireBaseY - i;
    const bend = ((i >> 2) % 2 === 0 ? 0 : 1) + (i > 18 ? 1 : 0);
    rect(ctx, domeCx - 1 + bend, y0, 3, 1, G.out);
    px(ctx, domeCx + bend, y0, (i % 3 === 0) ? G.brassLight : G.ironTop);
    // Tesla coil copper loops
    if (i === 6 || i === 12 || i === 18) {
      rect(ctx, domeCx - 3 + bend, y0, 7, 2, G.out);
      rect(ctx, domeCx - 2 + bend, y0, 5, 1, G.brass);
      px(ctx, domeCx + bend, y0, G.brassLight);
    }
  }

  // Crackling Plasma Lightning Orb at the apex (y=8)
  const summitY = spireBaseY - 26;
  disc(ctx, domeCx + 1, summitY, 3, G.out);
  disc(ctx, domeCx + 1, summitY, 2, G.toxicLight);
  px(ctx, domeCx + 1, summitY, '#ffffff');

  // Animated electrical sparks jumping around the lightning rod
  if (frame === 0) {
    px(ctx, domeCx - 3, summitY - 2, G.toxicLight);
    px(ctx, domeCx + 4, summitY + 1, G.glowHot);
    px(ctx, domeCx + 2, summitY + 8, G.toxic);
  } else if (frame === 1) {
    px(ctx, domeCx + 5, summitY - 1, G.toxicLight);
    px(ctx, domeCx - 4, summitY + 3, G.toxicLight);
    px(ctx, domeCx - 2, summitY + 12, G.glowHot);
  } else {
    px(ctx, domeCx - 2, summitY - 3, G.glowHot);
    px(ctx, domeCx + 3, summitY + 2, G.toxicLight);
    px(ctx, domeCx + 3, summitY + 10, G.toxicLight);
  }

  // --- Academy Courtyard & Grounds ---
  // Waving green skull banner on front corner
  banner(ctx, fx - wL + 2, fy - (wL >> 1) + 2, 36, frame, true);

  // Glowing toxic alchemical waste barrel in yard
  barrel(ctx, fx + wR - 4, fy - (wR >> 1) + 8, true);
  barrel(ctx, fx + wR - 10, fy - (wR >> 1) + 12, false);

  // Large brass cog mechanism mounted in yard
  gear(ctx, fx + 18, fy + 3, 5, frame);

  // Crate of volatile chemical flasks & scrap heap
  crate(ctx, fx + 6, fy + 4, 6);
  scrap(ctx, fx - 24, fy - 2, 7);

  // Green bushes flanking courtyard
  bush(ctx, fx + wR - 16, fy - (wR >> 1) + 16, 4);
  bush(ctx, fx - 32, fy - 6, 3);

  return cv;
}

// ---------------------------------------------------------------------------
// 5. CLINIC (Services, +happiness/health, height 1.1)
// ---------------------------------------------------------------------------
/**
 * A goblin "Sawbones" clinic and apothecary: pale whitewashed bone-plaster walls
 * with dark timber framing, a prominent bright-green healing cross emblem on the
 * facade, wide clean surgery bay windows, a crooked copper distillation pipe venting
 * herbal steam, and outdoor planter boxes growing glowing medicinal moonleaf herbs.
 */
function drawClinic(frame: number): HTMLCanvasElement {
  const [cv, ctx] = canvasHD();
  const fx = 66, fy = 120, wL = 44, wR = 44;
  groundShadow(ctx, fx, fy, wL, wR, 12);

  // --- Foundation: clean squared stone ---
  box(ctx, fx, fy, wL, wR, 8, STONE);
  brickWalls(ctx, fx, fy, wL, wR, 8, 4, 6);

  // --- Main Surgery Floor: distinctive pale bone-plaster & timber walls ---
  const uy = fy - 8;
  const BONE_MAT = { top: G.bone, left: G.boneShade, right: G.bone };
  box(ctx, fx, uy, wL, wR, 17, BONE_MAT);
  timberFrame(ctx, fx, uy, wL, wR, 17);

  // Heavy clinic entrance door on right wall
  doorR(ctx, fx, uy, 16, 8, 14);

  // --- Bold Green Healing Cross painted on the right wall facade ---
  // Vertical beam
  rightWallRect(ctx, fx, uy, 28, 4, 3, 9, G.out);
  rightWallRect(ctx, fx, uy, 29, 5, 1, 7, G.bannerLight);
  // Horizontal beam
  rightWallRect(ctx, fx, uy, 26, 7, 7, 3, G.out);
  rightWallRect(ctx, fx, uy, 27, 8, 5, 1, G.bannerLight);
  px(ctx, fx + 29, uy - 14 - 8, G.toxicLight); // bright center highlight

  // Clean, bright surgery windows with warm white and healing green tint
  windowR(ctx, fx, uy, 6, 5, 6, 8, true);
  windowL(ctx, fx, uy, 10, 5, 6, 8, true);
  windowL(ctx, fx, uy, 26, 5, 6, 8, true);

  // Porch awning over entrance door with hanging clinic shingle sign
  rightWallRect(ctx, fx, uy, 14, 15, 12, 2, G.woodTop);
  // Hanging sign with small painted green cross
  const signX = fx + 15, signY = uy - (15 >> 1) - 12;
  rect(ctx, signX - 3, signY - 1, 7, 6, G.out);
  rect(ctx, signX - 2, signY, 5, 4, G.bone);
  px(ctx, signX, signY + 1, G.bannerLight);
  px(ctx, signX - 1, signY + 2, G.bannerLight);
  px(ctx, signX, signY + 2, G.toxicLight);
  px(ctx, signX + 1, signY + 2, G.bannerLight);
  px(ctx, signX, signY + 3, G.bannerLight);

  // --- Roof: Rusty corrugated tin with moss patches ---
  roof(ctx, fx, uy, wL, wR, 17, 21, RUST, true);

  // Crooked copper herbal distillation pipe puffing fragrant herbal steam
  const distPipeX = fx + 15, distPipeY = uy - 30;
  rect(ctx, distPipeX - 1, distPipeY - 12, 3, 12, G.out);
  rect(ctx, distPipeX, distPipeY - 11, 1, 11, G.brass);
  // Distillation condenser coil & bulb
  disc(ctx, distPipeX, distPipeY - 6, 3, G.out);
  disc(ctx, distPipeX, distPipeY - 6, 2, G.brassLight);
  smoke(ctx, distPipeX, distPipeY - 14, frame);

  // Secondary stone chimney for the sterilizing hearth
  const sc = chimney(ctx, fx - 10, uy - 26, 9);
  smoke(ctx, sc.x, sc.y, (frame + 2) % 3);

  // --- Front Yard Apothecary Garden & Sawbones Gear ---
  // Raised wooden planter box 1 (right yard): growing glowing moonleaf herbs
  const pl1X = fx + 26, pl1Y = fy + 3;
  box(ctx, pl1X, pl1Y, 10, 5, 4, WOOD);
  // Glowing medicinal moonleaf herbs in planter 1
  for (let i = 0; i < 4; i++) {
    const hx = pl1X - 2 + i * 2, hy = pl1Y - 6 - (i % 2);
    px(ctx, hx, hy, G.leaf);
    px(ctx, hx, hy - 1, (frame + i) % 2 === 0 ? G.toxicLight : G.toxic);
    px(ctx, hx - 1, hy - 1, G.leafLight);
  }

  // Rusted tin-can herb pot 2 (center yard)
  const pl2X = fx + 10, pl2Y = fy + 6;
  rect(ctx, pl2X - 2, pl2Y - 6, 5, 6, G.out);
  rect(ctx, pl2X - 1, pl2Y - 5, 3, 5, G.rustLight);
  px(ctx, pl2X, pl2Y - 7, G.toxicLight);
  px(ctx, pl2X - 1, pl2Y - 6, G.leaf);
  px(ctx, pl2X + 1, pl2Y - 6, G.leafLight);

  // Wooden field stretcher / cot with clean linen roll in yard
  const cotX = fx - 16, cotY = fy + 4;
  rect(ctx, cotX - 6, cotY - 3, 13, 2, G.out);
  rect(ctx, cotX - 5, cotY - 3, 11, 1, G.woodTop);
  rect(ctx, cotX - 4, cotY - 5, 4, 3, G.bone); // folded linen / bandage roll
  px(ctx, cotX - 6, cotY - 1, G.woodDark); // legs
  px(ctx, cotX + 6, cotY - 1, G.woodDark);

  // Goblin banner with green healing cross
  banner(ctx, fx - wL + 2, fy - (wL >> 1) + 2, 32, frame, true);

  // Tonic barrel, crates with medicine jars, shrubbery
  barrel(ctx, fx + wR - 4, fy - (wR >> 1) + 6, false);
  crate(ctx, fx + 16, fy + 4, 6);
  px(ctx, fx + 16, fy - 3, '#4fc3f7'); // blue tonic jar on crate
  px(ctx, fx + 18, fy - 3, G.glowHot); // amber medicine jar
  bush(ctx, fx + wR - 14, fy - (wR >> 1) + 14, 4);
  bush(ctx, fx - 28, fy - 4, 3);

  return cv;
}

// ---------------------------------------------------------------------------
// 6. SHRINE (Services, +happiness/peace, height 1.0)
// ---------------------------------------------------------------------------
/**
 * A goblin bog-god shrine and sacred ancestor altar: stepped stone-and-timber
 * terraces, an open vaulted nave of colossal prehistoric rib bones, a central
 * towering carved totem pole crowned with an ancient horned skull with glowing
 * green eyes, a stone sacrificial altar heaped with gold scrap and mushrooms,
 * and twin iron braziers crackling with sacred toxic-green bog-fire.
 */
function drawShrine(frame: number): HTMLCanvasElement {
  const [cv, ctx] = canvasHD();
  const fx = 66, fy = 120, wL = 44, wR = 44;
  groundShadow(ctx, fx, fy, wL, wR, 14);

  // --- Terrace Step 1: Lower carved stone terrace plinth ---
  box(ctx, fx, fy, wL, wR, 6, STONE);
  brickWalls(ctx, fx, fy, wL, wR, 6, 3, 5);

  // --- Terrace Step 2: Upper sacred timber altar mound ---
  const pFx = fx, pFy = fy - 6, pL = 32, pR = 32;
  box(ctx, pFx, pFy, pL, pR, 7, WOOD);
  plankWalls(ctx, pFx, pFy, pL, pR, 7, 4);

  // --- Vaulted Mammoth Rib Bone Arches flanking the sanctuary ---
  // Left side rib bones curving up toward center
  const leftRibs = [
    [pFx - 24, pFy + 2, 14],
    [pFx - 14, pFy + 6, 17],
    [pFx - 4, pFy + 9, 20],
  ] as const;
  for (const [rx, ry, rh] of leftRibs) {
    rect(ctx, rx - 1, ry - rh - 1, 3, rh + 2, G.out);
    rect(ctx, rx, ry - rh, 1, rh, G.bone);
    // Tip curves inward
    px(ctx, rx + 1, ry - rh - 1, G.bone);
    px(ctx, rx + 2, ry - rh - 1, G.boneShade);
  }

  // Right side rib bones curving up toward center
  const rightRibs = [
    [pFx + 22, pFy + 2, 14],
    [pFx + 12, pFy + 6, 17],
    [pFx + 4, pFy + 9, 20],
  ] as const;
  for (const [rx, ry, rh] of rightRibs) {
    rect(ctx, rx - 1, ry - rh - 1, 3, rh + 2, G.out);
    rect(ctx, rx, ry - rh, 1, rh, G.boneShade);
    px(ctx, rx - 1, ry - rh - 1, G.bone);
    px(ctx, rx - 2, ry - rh - 1, G.bone);
  }

  // --- Central Carved Totem Pole (x=66, yBase=pFy-7, height=38) ---
  const totX = 66, totBaseY = pFy - 7;
  // Wooden totem column
  rect(ctx, totX - 4, totBaseY - 38, 9, 39, G.out);
  rect(ctx, totX - 3, totBaseY - 37, 7, 37, G.woodDark);
  rect(ctx, totX - 1, totBaseY - 37, 4, 37, G.woodR);

  // Carved Goblin Ancestor Face 1 (lower tier)
  rect(ctx, totX - 3, totBaseY - 14, 6, 8, G.woodL);
  px(ctx, totX - 2, totBaseY - 11, G.glowHot);
  px(ctx, totX + 1, totBaseY - 11, G.glowHot);
  rect(ctx, totX - 2, totBaseY - 8, 4, 1, G.out);

  // Carved Goblin Ancestor Face 2 (mid tier)
  rect(ctx, totX - 3, totBaseY - 26, 6, 8, G.woodTop);
  px(ctx, totX - 2, totBaseY - 23, G.toxicLight);
  px(ctx, totX + 1, totBaseY - 23, G.toxicLight);
  rect(ctx, totX - 2, totBaseY - 20, 4, 1, G.out);

  // --- Colossal Horned Bog-God Skull atop the Totem (apex y=28..38) ---
  const skullY = totBaseY - 44;
  disc(ctx, totX, skullY, 7, G.out);
  disc(ctx, totX, skullY, 6, G.bone);
  disc(ctx, totX + 1, skullY + 1, 4, G.boneShade);
  // Heavy snout & fangs
  rect(ctx, totX - 3, skullY + 5, 7, 5, G.out);
  rect(ctx, totX - 2, skullY + 5, 5, 4, G.bone);
  px(ctx, totX - 2, skullY + 9, G.boneShade);
  px(ctx, totX + 2, skullY + 9, G.boneShade);

  // Mystic glowing eye sockets (animated flame glow)
  rect(ctx, totX - 4, skullY - 2, 3, 3, G.out);
  rect(ctx, totX + 2, skullY - 2, 3, 3, G.out);
  const eyeCol = frame === 0 ? G.toxicLight : frame === 1 ? G.toxic : G.glowHot;
  rect(ctx, totX - 3, skullY - 1, 2, 2, eyeCol);
  rect(ctx, totX + 3, skullY - 1, 2, 2, eyeCol);
  px(ctx, totX - 3, skullY - 1, '#ffffff');
  px(ctx, totX + 3, skullY - 1, '#ffffff');

  // Sweeping horned ram/dragon horns
  // Left horn
  rect(ctx, totX - 9, skullY - 7, 4, 4, G.out);
  rect(ctx, totX - 8, skullY - 6, 2, 2, G.bone);
  rect(ctx, totX - 13, skullY - 5, 5, 4, G.out);
  rect(ctx, totX - 12, skullY - 4, 3, 2, G.boneShade);
  rect(ctx, totX - 15, skullY - 1, 3, 4, G.out);
  px(ctx, totX - 14, skullY, G.bone);
  // Right horn
  rect(ctx, totX + 6, skullY - 7, 4, 4, G.out);
  rect(ctx, totX + 7, skullY - 6, 2, 2, G.bone);
  rect(ctx, totX + 9, skullY - 5, 5, 4, G.out);
  rect(ctx, totX + 10, skullY - 4, 3, 2, G.boneShade);
  rect(ctx, totX + 13, skullY - 1, 3, 4, G.out);
  px(ctx, totX + 14, skullY, G.bone);

  // --- Stone Sacrificial Altar & Sacred Offerings ---
  const altX = 66, altY = pFy + 2;
  box(ctx, altX, altY, 12, 10, 5, STONE);
  brickWalls(ctx, altX, altY, 12, 10, 5, 2, 4);
  // Ornate brass offering chalice
  disc(ctx, altX, altY - 8, 4, G.out);
  disc(ctx, altX, altY - 8, 3, G.brass);
  px(ctx, altX, altY - 9, G.brassLight);
  // Shiny gold coin scraps & gems in chalice
  px(ctx, altX - 1, altY - 8, G.glowHot);
  px(ctx, altX + 1, altY - 8, G.brassLight);
  // Bioluminescent swamp mushrooms growing on altar slab
  px(ctx, altX + 4, altY - 7, G.leafDark);
  px(ctx, altX + 4, altY - 8, frame === 1 ? '#f08ab4' : G.toxicLight);
  px(ctx, altX - 4, altY - 6, G.leafDark);
  px(ctx, altX - 4, altY - 7, G.toxic);

  // Incense peat smoke curling up from the altar
  smoke(ctx, altX, altY - 12, frame);

  // --- Twin Iron Fire Braziers (Left & Right of sanctuary) ---
  const braziers: [number, number][] = [
    [pFx - 28, pFy + 8],
    [pFx + 28, pFy + 8],
  ];

  for (const [bx0, by0] of braziers) {
    // Brazier tripod stilt legs
    rect(ctx, bx0 - 3, by0 - 12, 2, 12, G.out);
    rect(ctx, bx0 - 2, by0 - 11, 1, 11, G.ironL);
    rect(ctx, bx0 + 2, by0 - 12, 2, 12, G.out);
    rect(ctx, bx0 + 3, by0 - 11, 1, 11, G.ironR);
    // Iron basin bowl
    disc(ctx, bx0 + 1, by0 - 13, 5, G.out);
    disc(ctx, bx0 + 1, by0 - 13, 4, G.ironTop);
    // Roaring toxic-green bog flame (animated flicker)
    const flameShift = (frame + (bx0 > pFx ? 1 : 0)) % 3;
    disc(ctx, bx0 + 1, by0 - 16, 4, G.toxic);
    disc(ctx, bx0 + 1, by0 - 17, 3, G.toxicLight);
    px(ctx, bx0 + 1 + (flameShift === 1 ? 1 : flameShift === 2 ? -1 : 0), by0 - 20, G.glowHot);
    px(ctx, bx0 + 1, by0 - 17, '#ffffff');
  }

  // --- Prayer Streamers, Stakes, and Yard Decorations ---
  // Green & bone streamers hanging from the totem and bone arches
  banner(ctx, pFx - pL + 2, pFy - (pL >> 1) + 4, 30, frame, true);
  banner(ctx, pFx + pR - 2, pFy - (pR >> 1) + 4, 28, (frame + 1) % 3, false);

  // Spiked bone stakes flanking the entrance steps
  stakes(ctx, 36, 48, 118, 0.5, 7);

  // Altar scrap heap and mysterious relic pots
  scrap(ctx, fx - 26, fy - 4, 6);
  barrel(ctx, fx + wR - 4, fy - (wR >> 1) + 6, true); // glowing toxic urn
  bush(ctx, fx + wR - 14, fy - (wR >> 1) + 12, 4);
  bush(ctx, fx - 32, fy - 6, 3);

  return cv;
}

// ---------------------------------------------------------------------------
// Exported art map
// ---------------------------------------------------------------------------
export const art: Partial<Record<BuildingKind, () => HTMLCanvasElement[]>> = {
  school: () => [0, 1, 2].map(drawSchool),
  park: () => [0, 1, 2].map(drawPark),
  library: () => [0, 1, 2].map(drawLibrary),
  academy: () => [0, 1, 2].map(drawAcademy),
  clinic: () => [0, 1, 2].map(drawClinic),
  shrine: () => [0, 1, 2].map(drawShrine),
};
