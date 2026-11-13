// Goblin HD buildings: commerce (drawn by a worker, see .agy/tasks). Kinds left out fall back to the 1x goblin art.
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
  isoBox,
  leftWallRect,
  px,
  rect,
  rightWallRect,
} from '../../sprites';

/**
 * 1. SHOP: A lively goblin general store and scavenger depot.
 * Stone base, plank walls, wide open-air serving counter with exotic potions and gears,
 * corrugated rust canopy, hanging shop sign, crooked stovepipe with smoke, crates and scrap.
 */
function drawShop(frame: number): HTMLCanvasElement {
  const [cv, ctx] = canvasHD();
  const fx = 66, fy = 120, wL = 46, wR = 44;
  groundShadow(ctx, fx, fy, wL, wR, 10);

  // Stone base
  box(ctx, fx, fy, wL, wR, 6, STONE);
  brickWalls(ctx, fx, fy, wL, wR, 6, 3, 5);

  // Upper walls: timber planks
  const my = fy - 6;
  const mh = 22;
  box(ctx, fx, my, wL, wR, mh, WOOD);
  plankWalls(ctx, fx, my, wL, wR, mh, 4);

  // Left wall has barred window
  windowL(ctx, fx, my, 14, 6, 8, 8, true);
  leftWallRect(ctx, fx, my, 17, 6, 1, 8, G.ironDark);
  leftWallRect(ctx, fx, my, 19, 6, 1, 8, G.ironDark);

  // Front right: open trade counter cutout
  rightWallRect(ctx, fx, my, 8, 4, 28, 12, G.out);
  rightWallRect(ctx, fx, my, 9, 5, 26, 10, '#1c140c');
  // Protruding counter counter-top
  rightWallRect(ctx, fx, my, 6, 4, 32, 2, G.woodTop);
  rightWallRect(ctx, fx, my, 6, 3, 32, 1, G.woodL);

  // Counter wares: glowing potions, brass cogs, iron ingots
  rightWallRect(ctx, fx, my, 10, 6, 2, 4, G.toxic);
  rightWallRect(ctx, fx, my, 10, 9, 2, 1, G.toxicLight);
  rightWallRect(ctx, fx, my, 14, 6, 3, 3, G.glowDeep);
  rightWallRect(ctx, fx, my, 15, 8, 1, 2, G.glowHot);
  rightWallRect(ctx, fx, my, 20, 6, 4, 2, G.brass);
  rightWallRect(ctx, fx, my, 21, 7, 2, 1, G.brassLight);
  rightWallRect(ctx, fx, my, 26, 6, 5, 3, G.ironR);
  rightWallRect(ctx, fx, my, 27, 8, 4, 1, G.ironTop);

  // Corrugated rust canopy over counter
  for (let v = 5; v <= 38; v++) {
    for (let u = 0; u < 5; u++) {
      const ax = fx + v - u;
      const ay = my - 16 - (v >> 1) + (u >> 1);
      rect(ctx, ax, ay, 1, 2, (v + u) % 3 === 0 ? G.rustR : G.rustLight);
    }
  }
  // Upright wooden posts supporting canopy
  rightWallRect(ctx, fx, my, 6, 0, 2, 16, G.woodDark);
  rightWallRect(ctx, fx, my, 36, 0, 2, 16, G.woodDark);

  // Shingled moss gable roof with rust patch
  roof(ctx, fx, my, wL, wR, mh, 20, MOSS);

  // Hanging wooden shop sign with brass coin emblem
  rightWallRect(ctx, fx, my, 40, 16, 1, 5, G.ironDark);
  const signX = fx + 40, signY = my - (40 >> 1) - 17;
  rect(ctx, signX - 4, signY, 8, 7, G.out);
  rect(ctx, signX - 3, signY + 1, 6, 5, G.woodL);
  disc(ctx, signX, signY + 3, 1, G.brassLight);

  // Stovepipe chimney on rear roof with smoke
  const cx = fx - 10, cy = my - mh - 12;
  rect(ctx, cx - 2, cy - 8, 4, 8, G.out);
  rect(ctx, cx - 1, cy - 7, 2, 7, G.ironL);
  disc(ctx, cx, cy - 8, 2, G.ironTop);
  smoke(ctx, cx, cy - 8, frame);

  // Yard props: crates, barrel, scrap pile, bush
  crate(ctx, fx + 6, fy + 2, 7);
  crate(ctx, fx + 15, fy - 2, 6);
  barrel(ctx, fx + wR - 4, fy - (wR >> 1) + 8, false);
  scrap(ctx, fx - 24, fy - 1, 5);
  bush(ctx, fx - wL + 8, fy - (wL >> 1) + 6, 4);

  return cv;
}

/**
 * 2. STALL (Market Stall): A cheap, compact open-air market stall (height ~0.6).
 * Low wooden trestle counter, vibrant wares, 4 corner posts, striped fabric canopy
 * with scalloped valance fringe, hanging brass lantern, sacks and crates.
 */
function drawStall(frame: number): HTMLCanvasElement {
  const [cv, ctx] = canvasHD();
  // Low compact footprint centered on tile
  const fx = 64, fy = 114, wL = 26, wR = 30, tableH = 9;
  groundShadow(ctx, fx, fy, wL, wR, 8);

  // Wooden counter base
  box(ctx, fx, fy, wL, wR, tableH, WOOD);
  plankWalls(ctx, fx, fy, wL, wR, tableH, 4);

  // Counter top trim
  rightWallRect(ctx, fx, fy, 0, tableH - 1, wR, 1, G.woodLight);
  leftWallRect(ctx, fx, fy, 0, tableH - 1, wL, 1, G.woodTop);

  // Goods displayed on the counter top
  // Woven bins with red & green fruit/fungi
  rightWallRect(ctx, fx, fy, 3, tableH, 6, 3, '#a83232');
  rightWallRect(ctx, fx, fy, 4, tableH + 2, 4, 1, '#d85252');
  rightWallRect(ctx, fx, fy, 11, tableH, 5, 3, G.mossR);
  rightWallRect(ctx, fx, fy, 12, tableH + 2, 3, 1, G.mossLight);
  // Brass trinkets & glowing phials
  rightWallRect(ctx, fx, fy, 18, tableH, 4, 2, G.brass);
  rightWallRect(ctx, fx, fy, 19, tableH + 1, 2, 1, G.brassLight);
  rightWallRect(ctx, fx, fy, 24, tableH, 2, 4, G.toxic);
  px(ctx, fx + 24, fy - (24 >> 1) - tableH - 4, G.toxicLight);

  // 4 corner wooden upright poles supporting the canopy
  const posts = [
    [1, 1],
    [1, wR - 3],
    [wL - 3, 1],
    [wL - 3, wR - 3],
  ] as const;
  const poleH = 26;
  for (const [u, v] of posts) {
    const px0 = fx - u + v;
    const py0 = fy - ((u + v) >> 1);
    rect(ctx, px0 - 1, py0 - poleH, 2, poleH, G.out);
    rect(ctx, px0, py0 - poleH + 1, 1, poleH - 1, G.woodR);
  }

  // Slanted striped awning canopy overhead (alternating rust and warm daub stripes)
  const canY = fy - poleH;
  for (let u = -1; u <= wL + 1; u++) {
    for (let v = -1; v <= wR + 1; v++) {
      // slope upward towards back left
      const rise = Math.round((u * 4) / wL);
      const ax = fx - u + v;
      const ay = canY - ((u + v) >> 1) - rise;
      const isEdge = u === -1 || u === wL + 1 || v === -1 || v === wR + 1;
      const stripe = ((v >> 1) & 1) === 0;
      if (isEdge) {
        rect(ctx, ax, ay, 1, 1, G.out);
      } else {
        rect(ctx, ax, ay, 1, 2, stripe ? G.rustR : G.daubR);
        if (stripe) px(ctx, ax, ay, G.rustLight);
      }
    }
  }

  // Scalloped fringe hanging from the front/right edge of the awning
  for (let v = 0; v <= wR; v += 2) {
    const ax = fx + v;
    const ay = canY - (v >> 1) + 2;
    rect(ctx, ax, ay, 1, 3 + (v % 4 === 0 ? 1 : 0), (v >> 1) % 2 ? G.rustDark : G.daubDark);
  }

  // Hanging lantern from front-right corner pole
  const lanX = fx + wR - 2, lanY = canY - (wR >> 1) + 8;
  rect(ctx, lanX - 1, lanY, 3, 4, G.out);
  rect(ctx, lanX, lanY + 1, 1, 2, frame % 2 === 0 ? G.glowHot : G.glow);
  px(ctx, lanX, lanY - 1, G.ironL); // hook

  // Ground props: burlap sack, small crate, barrel, pebbles
  // Sack of grain on left
  const sx = fx - 10, sy = fy + 2;
  rect(ctx, sx - 4, sy - 6, 8, 7, G.out);
  rect(ctx, sx - 3, sy - 5, 6, 6, G.daubR);
  rect(ctx, sx - 2, sy - 1, 4, 2, G.daubDark);
  px(ctx, sx - 1, sy - 6, G.woodLight); // tie string

  crate(ctx, fx - 16, fy - 1, 5);
  barrel(ctx, fx + wR + 4, fy - (wR >> 1) + 8, false);
  bush(ctx, fx - wL + 4, fy - (wL >> 1) + 8, 3);

  return cv;
}

/**
 * 3. TAVERN: "The Frothing Boar" / Goblin Alehouse (height 1.2).
 * Stout stone ground floor with arched doorway, overhanging half-timbered second floor,
 * warm lit tavern windows, smoking stone chimney, swinging tankard tavern sign,
 * ale kegs, drinking bench and scrap.
 */
function drawTavern(frame: number): HTMLCanvasElement {
  const [cv, ctx] = canvasHD();
  const fx = 66, fy = 122, wL = 48, wR = 44;
  groundShadow(ctx, fx, fy, wL, wR, 12);

  // Ground floor: solid stone masonry
  const gh = 15;
  box(ctx, fx, fy, wL, wR, gh, STONE);
  brickWalls(ctx, fx, fy, wL, wR, gh, 4, 6);

  // Arched entrance door on right wall
  doorR(ctx, fx, fy, 16, 9, 13);
  // Lantern mounted beside the tavern door
  rightWallRect(ctx, fx, fy, 13, 8, 2, 3, G.out);
  rightWallRect(ctx, fx, fy, 13, 8, 1, 2, frame % 2 === 0 ? G.glowHot : G.glow);
  px(ctx, fx + 13, fy - (13 >> 1) - 10, G.ironL);

  // Ground floor windows with warm amber tavern glow
  windowR(ctx, fx, fy, 30, 4, 8, 7, true);
  windowL(ctx, fx, fy, 14, 4, 8, 7, true);
  windowL(ctx, fx, fy, 32, 4, 7, 7, false);

  // Second storey: timber-framed goblin daub, slightly cantilevered
  const uy = fy - gh;
  const uh = 15;
  box(ctx, fx, uy, wL, wR, uh, DAUB);
  timberFrame(ctx, fx, uy, wL, wR, uh);

  // Upper floor windows
  windowR(ctx, fx, uy, 10, 4, 6, 7, true);
  windowR(ctx, fx, uy, 28, 4, 6, 7, true);
  windowL(ctx, fx, uy, 16, 4, 6, 7, true);
  windowL(ctx, fx, uy, 34, 4, 6, 7, false);

  // Mossy shingle roof with rusty tin patch
  roof(ctx, fx, uy, wL, wR, uh, 24, MOSS, true);

  // Prominent stone hearth chimney puffing active tavern smoke
  const c = chimney(ctx, fx + 15, uy - 29, 13);
  smoke(ctx, c.x, c.y, frame);

  // Animated swinging tavern sign hanging from front corner: a frothing ale tankard!
  const sway = frame === 1 ? 1 : frame === 2 ? -1 : 0;
  // Iron wall bracket extending from corner
  rightWallRect(ctx, fx, uy, 1, 2, 4, 1, G.ironDark);
  const signX = fx + 6 + sway, signY = uy - 3 + Math.abs(sway);
  // Iron chains
  px(ctx, signX - 2, signY - 2, G.ironL);
  px(ctx, signX + 2, signY - 2, G.ironL);
  // Tankard body
  rect(ctx, signX - 4, signY, 8, 8, G.out);
  rect(ctx, signX - 3, signY + 1, 6, 6, G.woodR);
  // Tankard handle
  rect(ctx, signX + 4, signY + 2, 2, 4, G.woodDark);
  // Foaming white head of ale overflowing top
  rect(ctx, signX - 3, signY - 1, 7, 2, '#ffffff');
  px(ctx, signX - 1, signY - 2, '#ffffff');
  px(ctx, signX + 2, signY, '#fff8d0');

  // Yard details: ale kegs, drinking bench, scrap, bush
  barrel(ctx, fx + wR - 4, fy - (wR >> 1) + 10, false);
  barrel(ctx, fx + wR - 14, fy - (wR >> 1) + 14, true); // glowing toxic brew barrel
  // Outdoor drinking bench on shaded left side
  leftWallRect(ctx, fx, fy, 4, 0, 8, 3, G.woodDark);
  leftWallRect(ctx, fx, fy, 3, 3, 10, 1, G.woodLight); // bench seat
  crate(ctx, fx + 4, fy + 4, 6);
  scrap(ctx, fx - 22, fy - 1, 2);
  bush(ctx, fx - wL + 8, fy - (wL >> 1) + 6, 4);

  return cv;
}

/**
 * 4. BANK: Fortified goblin stronghouse and treasury vault (height 1.7).
 * Massive riveted iron plates, heavy stone foundation, huge circular bank vault door
 * with brass spoke wheel, barred slit grilles, stepped safe-tower with giant brass padlock,
 * defensive iron spikes, treasure chests and brass cog scrap.
 */
function drawBank(frame: number): HTMLCanvasElement {
  const [cv, ctx] = canvasHD();
  const fx = 66, fy = 122, wL = 50, wR = 48;
  groundShadow(ctx, fx, fy, wL, wR, 14);

  // Ashlar stone and iron base foundation
  const baseH = 8;
  box(ctx, fx, fy, wL, wR, baseH, STONE);
  brickWalls(ctx, fx, fy, wL, wR, baseH, 4, 6);
  // Heavy iron plinth band
  isoBox(ctx, fx, fy - 6, wL, wR, 2, { top: G.ironTop, left: G.ironL, right: G.ironR });

  // Main vault tier (heavy riveted iron plates)
  const vy = fy - baseH;
  const vh = 24;
  box(ctx, fx, vy, wL, wR, vh, IRON);
  rivets(ctx, fx, vy, wR, vh, 5);

  // Vertical iron girders on both walls
  for (let u = 4; u < wL - 2; u += 10) leftWallRect(ctx, fx, vy, u, 0, 2, vh, G.ironDark);
  for (let v = 4; v < wR - 2; v += 10) rightWallRect(ctx, fx, vy, v, 0, 2, vh, G.ironL);

  // Narrow barred slit windows on left wall
  for (const u of [12, 28, 40]) {
    leftWallRect(ctx, fx, vy, u, 10, 5, 5, G.out);
    leftWallRect(ctx, fx, vy, u + 1, 11, 3, 3, G.glowDeep);
    leftWallRect(ctx, fx, vy, u + 2, 10, 1, 5, G.ironDark); // vertical bar
  }

  // MASSIVE CIRCULAR VAULT DOOR on right wall
  // Recessed vault frame
  rightWallRect(ctx, fx, vy, 14, 2, 20, 20, G.out);
  rightWallRect(ctx, fx, vy, 15, 3, 18, 18, G.ironDark);
  // Center coordinate of vault door on screen
  const vDoorU = 24, vDoorZ = 12;
  const vdX = fx + vDoorU, vdY = vy - (vDoorU >> 1) - vDoorZ;
  // Outer circular heavy iron rim
  disc(ctx, vdX, vdY, 8, G.out);
  disc(ctx, vdX, vdY, 7, G.ironTop);
  disc(ctx, vdX, vdY, 6, G.ironR);
  // Brass bolt studs around the rim
  for (let a = 0; a < 8; a++) {
    const ang = (a / 8) * Math.PI * 2;
    px(ctx, Math.round(vdX + Math.cos(ang) * 6), Math.round(vdY + Math.sin(ang) * 6), G.brassLight);
  }
  // Central locking brass wheel mechanism
  disc(ctx, vdX, vdY, 4, G.out);
  disc(ctx, vdX, vdY, 3, G.brass);
  disc(ctx, vdX, vdY, 1, G.brassLight);
  // Spoke handles
  rect(ctx, vdX - 3, vdY, 7, 1, G.brassDark);
  rect(ctx, vdX, vdY - 3, 1, 7, G.brassDark);

  // Stepped upper watch safe-house (offset slightly to look chunky & goblin-made)
  const ty = vy - vh;
  const tfx = fx - 2, twL = 36, twR = 34, th = 16;
  box(ctx, tfx, ty, twL, twR, th, IRON);
  rivets(ctx, tfx, ty, twR, th, 4);

  // Fortified iron crenellations along the safe-house parapet
  for (let v = 1; v < twR - 2; v += 6) rightWallRect(ctx, tfx, ty, v, th, 3, 3, G.ironR);
  for (let u = 1; u < twL - 2; u += 6) leftWallRect(ctx, tfx, ty, u, th, 3, 3, G.ironL);

  // GIANT BRASS PADLOCK mounted on the front corner of the safe-tower
  const pX = tfx + 14, pY = ty - 4;
  // Shackle loop (iron arch)
  rect(ctx, pX - 3, pY - 7, 7, 6, G.out);
  rect(ctx, pX - 2, pY - 6, 5, 5, G.ironTop);
  rect(ctx, pX - 1, pY - 5, 3, 4, G.ironDark);
  // Padlock heavy body
  rect(ctx, pX - 4, pY - 2, 9, 8, G.out);
  rect(ctx, pX - 3, pY - 1, 7, 6, G.brass);
  rect(ctx, pX - 2, pY, 5, 2, G.brassLight);
  // Keyhole
  rect(ctx, pX, pY + 2, 1, 3, G.out);

  // Roof cresting spikes and goblin skull banner atop safe-house
  const peakY = ty - th;
  banner(ctx, tfx + 8, peakY, 20, frame, true);

  // Yard props: iron-bound treasure chests, brass scrap cogs, defensive stakes
  // Treasure chest in front
  const cx = fx + 6, cy = fy + 3;
  box(ctx, cx, cy, 10, 8, 7, WOOD);
  rightWallRect(ctx, cx, cy, 0, 3, 8, 1, G.ironTop);
  leftWallRect(ctx, cx, cy, 0, 3, 10, 1, G.ironTop);
  px(ctx, cx + 4, cy - 4, G.brassLight); // gold lock

  // Brass cogs and iron ingots
  gear(ctx, fx + wR - 8, fy - (wR >> 1) + 12, 4);
  gear(ctx, fx + wR - 16, fy - (wR >> 1) + 16, 3);
  scrap(ctx, fx - 16, fy + 1, 4);

  // Defensive spikes along left perimeter
  stakes(ctx, fx - wL + 2, fx - 20, fy - (wL >> 1) + 6, 0.5, 9);

  return cv;
}

/**
 * 5. BAKERY: Goblin bakehouse with large domed stone baking oven (height 1.0).
 * Timber and daub shop with open bread counter, fresh loaves and mushroom pies,
 * carved wooden pretzel sign, projecting domed stone oven with glowing firemouth,
 * puffing oven smoke, flour sacks and stacked firewood logs.
 */
function drawBakery(frame: number): HTMLCanvasElement {
  const [cv, ctx] = canvasHD();
  const fx = 66, fy = 120, wL = 44, wR = 40;
  groundShadow(ctx, fx, fy, wL, wR, 12);

  // Stone base course
  const bh = 8;
  box(ctx, fx, fy, wL, wR, bh, STONE);
  brickWalls(ctx, fx, fy, wL, wR, bh, 4, 6);

  // Upper walls: warm plaster daub with dark timber framing
  const my = fy - bh;
  const mh = 16;
  box(ctx, fx, my, wL, wR, mh, DAUB);
  timberFrame(ctx, fx, my, wL, wR, mh);

  // Front right wall: bakery serving counter
  rightWallRect(ctx, fx, my, 8, 3, 22, 10, G.out);
  rightWallRect(ctx, fx, my, 9, 4, 20, 8, '#241a12');
  // Counter wooden ledge
  rightWallRect(ctx, fx, my, 6, 3, 26, 2, G.woodTop);
  rightWallRect(ctx, fx, my, 6, 2, 26, 1, G.woodL);

  // Baked goods on counter: golden crusty loaves, pies & braided rolls
  // Round golden loaves
  rightWallRect(ctx, fx, my, 8, 5, 4, 3, G.woodTop);
  rightWallRect(ctx, fx, my, 9, 7, 2, 1, G.glowHot);
  rightWallRect(ctx, fx, my, 14, 5, 3, 4, G.daubR);
  rightWallRect(ctx, fx, my, 15, 8, 1, 1, G.glowHot);
  // Mushroom pies (charred crust with green moss filling)
  rightWallRect(ctx, fx, my, 19, 5, 4, 3, G.rustL);
  rightWallRect(ctx, fx, my, 20, 7, 2, 1, G.toxicLight);
  rightWallRect(ctx, fx, my, 25, 5, 3, 2, G.woodLight);

  // Awning hood over serving counter
  for (let v = 6; v <= 32; v++) {
    for (let u = 0; u < 4; u++) {
      const ax = fx + v - u;
      const ay = my - 13 - (v >> 1) + (u >> 1);
      rect(ctx, ax, ay, 1, 2, v % 4 < 2 ? G.rustR : G.woodTop);
    }
  }

  // Pretzels / bread ring trade sign
  rightWallRect(ctx, fx, my, 34, 11, 1, 4, G.ironL);
  const psX = fx + 34, psY = my - (34 >> 1) - 13;
  disc(ctx, psX, psY, 4, G.out);
  disc(ctx, psX, psY, 3, G.woodTop);
  disc(ctx, psX - 1, psY, 1, G.out);
  disc(ctx, psX + 1, psY, 1, G.out);
  px(ctx, psX, psY - 2, G.glowHot);

  // Entrance door on right facade
  doorR(ctx, fx, fy, 32, 6, 11);

  // Main shingle roof
  roof(ctx, fx, my, wL, wR, mh, 20, MOSS, true);

  // PROJECTING DOMED STONE BAKING OVEN on the left side
  // The oven base is built of blackened stone courses projecting from left wall
  const ovU = 22, ovW = 18, ovH = 14;
  const ovFx = fx - ovU, ovFy = fy - (ovU >> 1);
  box(ctx, ovFx, ovFy, ovW, 14, ovH, STONE);
  brickWalls(ctx, ovFx, ovFy, ovW, 14, ovH, 3, 5);

  // Glowing oven firemouth on the front-facing wall of the stone oven
  leftWallRect(ctx, fx, fy, ovU + 4, 2, 10, 8, G.out);
  // Fire interior with burning orange/yellow embers
  leftWallRect(ctx, fx, fy, ovU + 5, 3, 8, 6, G.glowDeep);
  leftWallRect(ctx, fx, fy, ovU + 6, 3, 6, 3, frame % 2 === 0 ? G.glowHot : G.glow);
  px(ctx, fx - 1 - (ovU + 7), fy - ((ovU + 7) >> 1) - 6, '#ffffff');

  // Heavy stone oven chimney puffing thick oven smoke
  const ch = chimney(ctx, ovFx - 4, ovFy - ovH - 2, 10);
  smoke(ctx, ch.x, ch.y, frame);

  // Stacked firewood logs against the oven
  const wx0 = ovFx + 4, wy0 = ovFy + 3;
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 4 - row; col++) {
      const lx = wx0 + col * 4 - row * 2;
      const ly = wy0 - row * 3;
      rect(ctx, lx, ly - 2, 4, 3, G.out);
      rect(ctx, lx + 1, ly - 1, 2, 2, G.woodR);
      px(ctx, lx + 1, ly - 1, G.woodLight);
    }
  }

  // Flour sacks leaning by front corner
  const sx = fx + 2, sy = fy + 3;
  rect(ctx, sx - 4, sy - 8, 8, 9, G.out);
  rect(ctx, sx - 3, sy - 7, 6, 7, G.bone);
  rect(ctx, sx - 2, sy - 2, 4, 2, G.boneShade);
  px(ctx, sx - 1, sy - 7, G.woodDark); // string tie

  const sx2 = fx + 6, sy2 = fy + 5;
  rect(ctx, sx2 - 3, sy2 - 6, 7, 7, G.out);
  rect(ctx, sx2 - 2, sy2 - 5, 5, 5, G.bone);

  bush(ctx, fx + wR - 6, fy - (wR >> 1) + 12, 3);

  return cv;
}

/**
 * 6. TEAHOUSE: Moonleaf tea retreat with tiered flared eaves (height 1.1).
 * Raised timber stilt deck, slatted bamboo-screen walls with warm translucent glow,
 * double-tier curved flared eave roof with swept horns, steaming brass tea samovar,
 * hanging paper lanterns, potted moonleaf bonsai and bamboo fence.
 */
function drawTeahouse(frame: number): HTMLCanvasElement {
  const [cv, ctx] = canvasHD();
  const fx = 65, fy = 120, wL = 44, wR = 44;
  groundShadow(ctx, fx, fy, wL, wR, 10);

  // Raised timber stilt foundation / deck
  const dh = 6;
  box(ctx, fx, fy, wL, wR, dh, WOOD);
  plankWalls(ctx, fx, fy, wL, wR, dh, 3);
  // Stilt pilings underneath
  for (let u = 0; u <= wL; u += 14) leftWallRect(ctx, fx, fy, u, 0, 2, dh, G.woodDark);
  for (let v = 0; v <= wR; v += 14) rightWallRect(ctx, fx, fy, v, 0, 2, dh, G.woodDark);

  // Main pavilion (inset slightly on deck)
  const py = fy - dh;
  const pwL = 36, pwR = 36, ph = 18;
  const pfx = fx - 4; // centered on deck
  box(ctx, pfx, py, pwL, pwR, ph, DAUB);

  // Slatted screen lattice walls with moonleaf soft glow behind
  for (let u = 3; u < pwL - 3; u += 4) {
    leftWallRect(ctx, pfx, py, u, 2, 2, ph - 4, G.woodDark);
    leftWallRect(ctx, pfx, py, u + 2, 3, 2, ph - 6, G.glowDeep);
  }
  for (let v = 3; v < pwR - 3; v += 4) {
    rightWallRect(ctx, pfx, py, v, 2, 2, ph - 4, G.woodDark);
    rightWallRect(ctx, pfx, py, v + 2, 3, 2, ph - 6, G.glow);
  }

  // Sliding screen door on right wall
  rightWallRect(ctx, pfx, py, 12, 1, 12, ph - 2, G.woodDark);
  rightWallRect(ctx, pfx, py, 14, 2, 8, ph - 4, G.bone);
  for (let k = 4; k < ph - 4; k += 3) rightWallRect(ctx, pfx, py, 14, k, 8, 1, G.woodL);
  rightWallRect(ctx, pfx, py, 18, 2, 1, ph - 4, G.woodDark);

  // Lower wraparound flared awning eave
  const eaveY = py - ph + 2;
  for (let u = -3; u <= pwL + 3; u++) {
    for (let v = -3; v <= pwR + 3; v++) {
      // upturn at the four outer corners (flare)
      const isCorner = (u < 0 || u > pwL) && (v < 0 || v > pwR);
      const flare = isCorner ? 2 : 0;
      const ax = pfx - u + v;
      const ay = eaveY - ((u + v) >> 1) - flare;
      const isRim = u === -3 || u === pwL + 3 || v === -3 || v === pwR + 3;
      if (isRim) {
        rect(ctx, ax, ay, 1, 1, G.out);
      } else {
        px(ctx, ax, ay, (u + v) % 4 === 0 ? G.mossLight : G.mossR);
      }
    }
  }

  // Upper tiered roof with swept ridge horns
  const upRoofY = py - ph - 2;
  const urW = 28;
  roof(ctx, pfx + 4, upRoofY, urW, urW, 4, 18, MOSS, false);

  // Swept finials/horns on roof peak
  const peakX = pfx + 4 - (urW >> 1), peakY = upRoofY - 24;
  rect(ctx, peakX - 2, peakY - 3, 5, 2, G.bone);
  px(ctx, peakX - 3, peakY - 4, G.bone);
  px(ctx, peakX + 3, peakY - 4, G.bone);

  // Steaming brass tea kettle on the deck table
  // Small round wooden low table on the front-right verandah
  const tbX = fx + wR - 12, tbY = fy - (wR >> 1) - 1;
  disc(ctx, tbX, tbY, 4, G.out);
  disc(ctx, tbX, tbY, 3, G.woodTop);
  // Brass tea kettle
  rect(ctx, tbX - 2, tbY - 5, 5, 4, G.out);
  rect(ctx, tbX - 1, tbY - 4, 3, 3, G.brassLight);
  px(ctx, tbX + 2, tbY - 4, G.brass); // spout
  px(ctx, tbX - 1, tbY - 6, G.ironL); // handle
  // Delicate tea steam rising from spout
  smoke(ctx, tbX + 3, tbY - 6, frame);

  // Hanging glowing lanterns from flared roof eaves
  const lan1X = pfx - pwL - 2, lan1Y = eaveY - (pwL >> 1) + 4;
  rect(ctx, lan1X, lan1Y, 3, 4, G.out);
  rect(ctx, lan1X + 1, lan1Y + 1, 1, 2, frame % 2 === 0 ? G.toxicLight : G.toxic);

  const lan2X = pfx + pwR + 2, lan2Y = eaveY - (pwR >> 1) + 4;
  rect(ctx, lan2X, lan2Y, 3, 4, G.out);
  rect(ctx, lan2X + 1, lan2Y + 1, 1, 2, frame % 2 === 0 ? G.glowHot : G.glow);

  // Yard props: potted moonleaf bush in ceramic pot, stepping stones
  // Ceramic planter pot with plant
  const potX = fx + 6, potY = fy + 5;
  rect(ctx, potX - 3, potY - 4, 7, 5, G.out);
  rect(ctx, potX - 2, potY - 3, 5, 4, G.rustR);
  bush(ctx, potX, potY - 4, 4);

  // Stepping stones
  for (const [stX, stY] of [
    [fx - 12, fy + 2],
    [fx - 18, fy - 1],
    [fx - 24, fy - 4],
  ] as const) {
    disc(ctx, stX, stY, 3, G.cobble);
    px(ctx, stX, stY - 1, G.cobbleLight);
  }

  return cv;
}

/**
 * 7. TAILOR: Goblin clothier & leatherworker (height 1.1).
 * Timber and patchwork hide boutique with large front display bay window,
 * mannequin dummy in scrap armor & feathered cape, hanging giant brass scissors sign,
 * overhanging drying poles with colorful dyed fabric bolts waving in the breeze.
 */
function drawTailor(frame: number): HTMLCanvasElement {
  const [cv, ctx] = canvasHD();
  const fx = 65, fy = 120, wL = 46, wR = 42;
  groundShadow(ctx, fx, fy, wL, wR, 10);

  // Stone & dark timber base
  const bh = 6;
  box(ctx, fx, fy, wL, wR, bh, STONE);
  brickWalls(ctx, fx, fy, wL, wR, bh, 3, 5);

  // Main floor: timber-framed walls with patchwork panels
  const my = fy - bh;
  const mh = 18;
  box(ctx, fx, my, wL, wR, mh, WOOD);
  timberFrame(ctx, fx, my, wL, wR, mh);

  // Left wall has window and hide drying stretcher
  windowL(ctx, fx, my, 12, 5, 7, 7, true);
  // Stretched tanned hide on left wall
  leftWallRect(ctx, fx, my, 26, 3, 10, 10, G.out);
  leftWallRect(ctx, fx, my, 27, 4, 8, 8, G.daubR);
  leftWallRect(ctx, fx, my, 28, 5, 6, 6, G.daubDark);

  // Front right facade: LARGE DISPLAY WINDOW with mannequin
  rightWallRect(ctx, fx, my, 6, 3, 20, 12, G.out);
  rightWallRect(ctx, fx, my, 7, 4, 18, 10, '#1a1612'); // dark interior
  // Warm spotlight glow inside window
  rightWallRect(ctx, fx, my, 8, 4, 16, 2, G.glowDeep);

  // Dressed Mannequin inside the display window
  // Mannequin center
  const manV = 16, manZ = 4;
  const mX = fx + manV, mY = my - (manV >> 1) - manZ;
  // Wooden stand
  rect(ctx, mX - 1, mY, 2, 4, G.woodDark);
  rect(ctx, mX - 3, mY + 3, 6, 1, G.woodL);
  // Padded scrap doublet/tunic (dyed rust)
  rect(ctx, mX - 3, mY - 4, 6, 4, G.rustR);
  px(ctx, mX, mY - 3, G.brassLight); // brass button
  px(ctx, mX, mY - 2, G.brassLight);
  // Feathered cape draped over shoulder (moss green)
  rect(ctx, mX - 4, mY - 3, 2, 5, G.banner);
  rect(ctx, mX + 2, mY - 3, 2, 5, G.bannerLight);
  // Skull / horned helmet head
  rect(ctx, mX - 2, mY - 7, 4, 3, G.bone);
  px(ctx, mX - 3, mY - 8, G.bone); // left horn
  px(ctx, mX + 2, mY - 8, G.bone); // right horn

  // Display window frame & sill
  rightWallRect(ctx, fx, my, 5, 2, 22, 1, G.woodLight); // sill
  rightWallRect(ctx, fx, my, 15, 4, 1, 10, G.woodDark); // vertical mullion

  // Entrance door on right
  doorR(ctx, fx, fy, 29, 8, 13);

  // GIANT BRASS SCISSORS TRADE SIGN hanging above entrance
  rightWallRect(ctx, fx, my, 31, 15, 1, 4, G.ironL);
  const scX = fx + 31, scY = my - (31 >> 1) - 16;
  // Two scissor blades crossing in an X
  rect(ctx, scX - 2, scY - 2, 5, 1, G.brassLight);
  rect(ctx, scX - 1, scY - 1, 3, 1, G.brass);
  px(ctx, scX - 3, scY - 3, G.brassLight);
  px(ctx, scX + 3, scY - 3, G.brassLight);
  // Finger loops
  disc(ctx, scX - 2, scY + 2, 1, G.brass);
  disc(ctx, scX + 2, scY + 2, 1, G.brass);

  // Roof: moss shingles with timber eaves
  roof(ctx, fx, my, wL, wR, mh, 20, MOSS, true);

  // OUTDOOR FABRIC DRYING POLES extending from upper storey
  // Horizontal poles
  const wave = frame === 1 ? 1 : frame === 2 ? -1 : 0;
  rightWallRect(ctx, fx, my, 8, mh, 24, 1, G.woodLight);
  // Draped dyed fabrics hanging down
  // Cloth strip 1: Rust orange
  const c1X = fx + 10, c1Y = my - (10 >> 1) - mh + 1;
  rect(ctx, c1X - 2, c1Y, 4, 8 + wave, G.rustLight);
  rect(ctx, c1X - 1, c1Y + 1, 2, 7 + wave, G.rustR);
  // Cloth strip 2: Moss green
  const c2X = fx + 16, c2Y = my - (16 >> 1) - mh + 1;
  rect(ctx, c2X - 2, c2Y, 4, 10 - wave, G.bannerLight);
  rect(ctx, c2X - 1, c2Y + 1, 2, 9 - wave, G.banner);
  // Cloth strip 3: Gold yellow
  const c3X = fx + 22, c3Y = my - (22 >> 1) - mh + 1;
  rect(ctx, c3X - 2, c3Y, 4, 7 + (wave >> 1), G.brassLight);
  rect(ctx, c3X - 1, c3Y + 1, 2, 6 + (wave >> 1), G.brass);

  // Yard props: basket with fabric rolls, crate, bush
  // Basket with cloth bolts
  const bkX = fx + 4, bkY = fy + 4;
  rect(ctx, bkX - 3, bkY - 5, 7, 6, G.out);
  rect(ctx, bkX - 2, bkY - 4, 5, 5, G.woodL);
  // Colorful rolled bolts sticking out
  rect(ctx, bkX - 2, bkY - 8, 2, 4, G.rustLight);
  rect(ctx, bkX, bkY - 7, 2, 3, G.banner);
  rect(ctx, bkX + 2, bkY - 9, 2, 5, G.brassLight);

  crate(ctx, fx + 12, fy + 2, 6);
  bush(ctx, fx - wL + 6, fy - (wL >> 1) + 8, 4);

  return cv;
}

/**
 * 8. BAZAAR: The Great Goblin Bazaar (height 1.0).
 * Crowded bustling market square filling the tile with multiple overlapping stalls:
 * tall striped conical pavilion tent, front-right food & spice stall with scalloped canopy,
 * rear armor & pot vendor booth, colorful tribal carpets, rippling pennant bunting,
 * overflowing crates, amphora jars and hanging cured sausages.
 */
function drawBazaar(frame: number): HTMLCanvasElement {
  const [cv, ctx] = canvasHD();
  const fx = 66, fy = 120, wL = 50, wR = 48;
  groundShadow(ctx, fx, fy, wL, wR, 12);

  // Colorful tribal carpets laid on the ground
  // Rug 1: Rust & bone kilim rug in center
  for (let u = 8; u < 28; u++) {
    for (let v = 6; v < 22; v++) {
      const rx = fx - u + v;
      const ry = fy - ((u + v) >> 1);
      const isStripe = (u + v) % 4 === 0;
      px(ctx, rx, ry, isStripe ? G.bone : G.rustDark);
      if (u === 8 || u === 27 || v === 6 || v === 21) px(ctx, rx, ry, G.out);
    }
  }

  // Rug 2: Dark green banner cloth rug
  for (let u = 26; u < 42; u++) {
    for (let v = 18; v < 30; v++) {
      const rx = fx - u + v;
      const ry = fy - ((u + v) >> 1);
      px(ctx, rx, ry, (u + v) % 3 === 0 ? G.bannerLight : G.bannerDark);
    }
  }

  // STALL 1: Large Center-Left Conical Marquee Tent
  const tCx = 46, tCy = 80, tR = 18, tPeakY = 32;
  // Conical striped canvas roof
  for (let dy = 0; dy <= 28; dy++) {
    const y = tCy - dy;
    const span = Math.round((tR * (tCy - y)) / (tCy - tPeakY));
    const half = Math.max(1, tR - span);
    rect(ctx, tCx - half - 1, y, half * 2 + 2, 1, G.out);
    for (let dx = -half; dx <= half; dx++) {
      const stripe = ((Math.abs(dx) + (dy >> 1)) % 5) < 3;
      px(ctx, tCx + dx, y, stripe ? G.rustR : G.bone);
    }
    // Highlight on right side
    px(ctx, tCx + (half >> 1), y, G.rustLight);
  }
  // Iron spike & crescent finial atop marquee
  rect(ctx, tCx - 1, tPeakY - 8, 2, 8, G.out);
  rect(ctx, tCx, tPeakY - 7, 1, 7, G.ironTop);
  disc(ctx, tCx, tPeakY - 8, 2, G.brassLight);

  // Tent interior shadow & wares table under marquee
  rect(ctx, tCx - 10, tCy - 2, 20, 6, '#18120c');
  // Wares under tent: glowing bottles and gold urn
  rect(ctx, tCx - 6, tCy, 3, 4, G.toxic);
  px(ctx, tCx - 5, tCy - 1, G.toxicLight);
  rect(ctx, tCx + 2, tCy - 1, 4, 5, G.brass);
  px(ctx, tCx + 3, tCy - 2, G.brassLight);

  // STALL 2: Front-Right Open Food & Spice Stall
  const s2Fx = fx + 2, s2Fy = fy - 2, s2L = 14, s2R = 24, s2H = 9;
  // Wooden counter
  box(ctx, s2Fx, s2Fy, s2L, s2R, s2H, WOOD);
  plankWalls(ctx, s2Fx, s2Fy, s2L, s2R, s2H, 3);
  rightWallRect(ctx, s2Fx, s2Fy, 0, s2H - 1, s2R, 1, G.woodLight);

  // Baskets of colorful spices and produce on counter
  // Paprika / red spices
  rightWallRect(ctx, s2Fx, s2Fy, 2, s2H, 4, 3, '#a82c2c');
  rightWallRect(ctx, s2Fx, s2Fy, 3, s2H + 2, 2, 1, '#d84444');
  // Turmeric / yellow spice mound
  rightWallRect(ctx, s2Fx, s2Fy, 8, s2H, 4, 3, G.brass);
  rightWallRect(ctx, s2Fx, s2Fy, 9, s2H + 2, 2, 1, G.brassLight);
  // Blue/green herbal pots
  rightWallRect(ctx, s2Fx, s2Fy, 14, s2H, 3, 4, G.mossR);
  rightWallRect(ctx, s2Fx, s2Fy, 15, s2H + 3, 1, 1, G.mossLight);
  // Glowing bottles
  rightWallRect(ctx, s2Fx, s2Fy, 19, s2H, 2, 4, G.toxic);
  px(ctx, s2Fx + 19, s2Fy - (19 >> 1) - s2H - 4, G.toxicLight);

  // Corner timber poles holding front stall canopy
  const s2PoleH = 24;
  for (const [u, v] of [
    [1, 1],
    [1, s2R - 2],
    [s2L - 2, 1],
    [s2L - 2, s2R - 2],
  ] as const) {
    const px0 = s2Fx - u + v, py0 = s2Fy - ((u + v) >> 1);
    rect(ctx, px0 - 1, py0 - s2PoleH, 2, s2PoleH, G.out);
    rect(ctx, px0, py0 - s2PoleH + 1, 1, s2PoleH - 1, G.woodR);
  }

  // Scalloped green-and-gold striped canopy overhead
  const s2CanY = s2Fy - s2PoleH;
  for (let u = -1; u <= s2L + 1; u++) {
    for (let v = -1; v <= s2R + 1; v++) {
      const ax = s2Fx - u + v;
      const ay = s2CanY - ((u + v) >> 1);
      const isEdge = u === -1 || u === s2L + 1 || v === -1 || v === s2R + 1;
      const col = isEdge ? G.out : ((v >> 1) & 1) === 0 ? G.mossR : G.daubR;
      rect(ctx, ax, ay, 1, 2, col);
    }
  }
  // Scalloped fringe
  for (let v = 0; v <= s2R; v += 2) {
    const ax = s2Fx + v;
    const ay = s2CanY - (v >> 1) + 2;
    rect(ctx, ax, ay, 1, 3 + (v % 4 === 0 ? 1 : 0), (v >> 1) % 2 ? G.mossRidge : G.daubDark);
  }

  // STALL 3: Back-Right Pottery & Armor Lean-to Stall
  const s3X = fx + 26, s3Y = fy - 28;
  box(ctx, s3X, s3Y, 12, 14, 7, WOOD);
  // Slanted rust metal lean-to sheet
  for (let u = 0; u < 14; u++) {
    for (let v = 0; v < 16; v++) {
      const ax = s3X - u + v;
      const ay = s3Y - 14 - ((u + v) >> 1) + (u >> 1);
      rect(ctx, ax, ay, 1, 1, (u + v) % 3 === 0 ? G.rustR : G.rustLight);
    }
  }

  // FESTIVE STRING BUNTING with pennants stretched across the bazaar
  // Pole 1 at marquee (tCx + 6, tCy - 14) to Pole 2 at front stall (s2Fx + 2, s2CanY + 2)
  const xA = tCx + 4, yA = tCy - 16;
  const xB = s2Fx + 2, yB = s2CanY + 2;
  const buntingFrames = [
    [0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0],
    [0, -1, 0, -1, 0, -1],
  ];
  const bDip = buntingFrames[frame]!;
  const bColors = [G.rustR, G.banner, G.brassLight, G.rustLight, G.bannerLight, G.brass];
  for (let step = 0; step < 6; step++) {
    const t = (step + 1) / 7;
    const bx = Math.round(xA + (xB - xA) * t);
    const by = Math.round(yA + (yB - yA) * t + Math.sin(t * Math.PI) * 5) + bDip[step]!;
    // Sagging string line
    px(ctx, bx, by, G.ironDark);
    // Triangular pennant hanging down
    rect(ctx, bx - 1, by + 1, 3, 2, G.out);
    rect(ctx, bx, by + 1, 1, 3, bColors[step % bColors.length]!);
  }

  // Yard props: amphora pots, stacked crates, barrel, sausages hanging
  // Amphora pottery jar
  const apX = fx + 16, apY = fy + 6;
  disc(ctx, apX, apY - 3, 3, G.rustL);
  rect(ctx, apX - 1, apY - 7, 2, 4, G.rustR);
  px(ctx, apX, apY - 7, G.rustLight);

  crate(ctx, fx - 16, fy + 4, 7);
  crate(ctx, fx - 24, fy + 1, 6);
  barrel(ctx, fx + wR - 6, fy - (wR >> 1) + 12, false);
  scrap(ctx, fx - 34, fy - 6, 2);

  return cv;
}

/**
 * 9. TRADE GUILD: Grand Merchant Guildhall (height 1.8).
 * Stately 2-storey dressed ashlar stone palazzo on an elevated plinth with stone steps,
 * grand entrance portico, carved Scales of Trade emblem (skull vs gold coin),
 * rows of tall arched mullioned windows, high moss shingle roof with iron cresting,
 * rooftop clocktower with rotating brass gear clockwork, and waving green skull guild banner.
 */
function drawTradeguild(frame: number): HTMLCanvasElement {
  const [cv, ctx] = canvasHD();
  const fx = 66, fy = 122, wL = 52, wR = 48;
  groundShadow(ctx, fx, fy, wL, wR, 14);

  // Elevated ashlar stone plinth / podium
  const baseH = 8;
  box(ctx, fx, fy, wL, wR, baseH, STONE);
  brickWalls(ctx, fx, fy, wL, wR, baseH, 4, 6);
  // Gold/brass frieze band along plinth top
  rightWallRect(ctx, fx, fy, 0, baseH - 1, wR, 1, G.brass);
  leftWallRect(ctx, fx, fy, 0, baseH - 1, wL, 1, G.brassDark);

  // Grand stone entrance steps on right facade
  const stU = 14, stW = 12;
  for (let s = 0; s < 3; s++) {
    const sx = fx + stU - s * 2, sy = fy - ((stU - s * 2) >> 1) + s * 2;
    rightWallRect(ctx, sx, sy, 0, 0, stW + s * 2, 2, G.stoneTop);
    leftWallRect(ctx, sx, sy, 0, 0, 2, 2, G.stoneL);
  }

  // Main 2-storey guildhall body: warm stone with timber quoins
  const gy = fy - baseH;
  const gh = 32;
  box(ctx, fx, gy, wL, wR, gh, STONE);
  brickWalls(ctx, fx, gy, wL, wR, gh, 5, 7);

  // Carved wooden pilasters & quoins on facade
  for (const v of [0, 12, 28, wR - 2]) {
    rightWallRect(ctx, fx, gy, v, 0, 2, gh, G.woodR);
    rightWallRect(ctx, fx, gy, v, gh - 2, 2, 2, G.brass); // brass capital
  }
  for (const u of [0, 16, 34, wL - 2]) {
    leftWallRect(ctx, fx, gy, u, 0, 2, gh, G.woodL);
  }

  // Grand double entrance portal on right wall
  const pV = 16, pW = 10, pH = 15;
  rightWallRect(ctx, fx, gy, pV - 1, 0, pW + 2, pH + 2, G.out);
  rightWallRect(ctx, fx, gy, pV, 0, pW, pH, G.woodDark);
  // Arched frame top
  rightWallRect(ctx, fx, gy, pV + 1, pH, pW - 2, 2, G.woodL);
  // Brass door studs & handles
  rightWallRect(ctx, fx, gy, pV + 2, 0, 1, pH - 1, G.ironL);
  rightWallRect(ctx, fx, gy, pV + pW - 3, 0, 1, pH - 1, G.ironL);
  px(ctx, fx + pV + 3, gy - ((pV + 3) >> 1) - 6, G.brassLight);
  px(ctx, fx + pV + 6, gy - ((pV + 6) >> 1) - 6, G.brassLight);

  // THE SCALES OF TRADE emblem carved above the grand entrance
  // Center coordinates of emblem pediment
  const scV = pV + 5, scZ = pH + 4;
  const scX = fx + scV, scY = gy - (scV >> 1) - scZ;
  // Triangular stone pediment
  rect(ctx, scX - 7, scY - 2, 15, 3, G.stoneTop);
  rect(ctx, scX - 5, scY - 4, 11, 2, G.stoneR);
  // Brass balance scale
  rect(ctx, scX, scY - 3, 1, 6, G.brassLight); // center post
  rect(ctx, scX - 4, scY - 1, 9, 1, G.brass); // balance beam
  // Left pan holding goblin skull
  px(ctx, scX - 4, scY + 1, G.ironL); // chain
  rect(ctx, scX - 5, scY + 2, 3, 1, G.brass); // pan
  px(ctx, scX - 4, scY + 1, G.bone); // skull
  // Right pan holding gold coin
  px(ctx, scX + 4, scY + 1, G.ironL); // chain
  rect(ctx, scX + 3, scY + 2, 3, 1, G.brass); // pan
  px(ctx, scX + 4, scY + 1, G.glowHot); // shining gold

  // Rows of tall arched leaded guild windows
  // Ground floor windows
  windowR(ctx, fx, gy, 4, 4, 6, 9, true);
  windowR(ctx, fx, gy, 34, 4, 7, 9, true);
  // Upper floor windows (warm bright glow)
  windowR(ctx, fx, gy, 4, 18, 6, 8, true);
  windowR(ctx, fx, gy, 18, 18, 7, 8, true);
  windowR(ctx, fx, gy, 34, 18, 7, 8, true);

  // Left wall windows
  windowL(ctx, fx, gy, 6, 4, 7, 8, true);
  windowL(ctx, fx, gy, 22, 4, 7, 8, true);
  windowL(ctx, fx, gy, 38, 4, 7, 8, false);
  windowL(ctx, fx, gy, 8, 18, 6, 7, true);
  windowL(ctx, fx, gy, 24, 18, 6, 7, true);

  // High-pitched grand shingle roof with iron ridge cresting
  roof(ctx, fx, gy, wL, wR, gh, 22, MOSS, true);
  // Iron cresting along ridge
  for (let k = 4; k < wR - 4; k += 4) {
    const rx = fx - (wL >> 1) + k;
    const ry = gy - gh - 22 - (k >> 1);
    rect(ctx, rx - 1, ry - 3, 2, 3, G.ironTop);
    px(ctx, rx, ry - 4, G.brass);
  }

  // ROOFTOP CLOCKTOWER with ROTATING BRASS GEAR CLOCKWORK
  const twX = fx + 6, twY = gy - gh - 16;
  const twW = 18, twH = 16;
  rect(ctx, twX - (twW >> 1) - 1, twY - twH, twW + 2, twH, G.out);
  rect(ctx, twX - (twW >> 1), twY - twH + 1, twW, twH - 1, G.stoneR);
  // Belfry corner columns
  rect(ctx, twX - (twW >> 1), twY - twH, 2, twH, G.woodDark);
  rect(ctx, twX + (twW >> 1) - 1, twY - twH, 2, twH, G.woodR);

  // Rotating brass clockwork gear face
  const clockX = twX + 1, clockY = twY - (twH >> 1);
  gear(ctx, clockX, clockY, 5, frame);
  // Clock hands (frame moves minute hand)
  px(ctx, clockX, clockY, G.out);
  const handAngles = [0, (2 * Math.PI) / 3, (4 * Math.PI) / 3];
  const ha = handAngles[frame]!;
  px(ctx, Math.round(clockX + Math.cos(ha) * 3), Math.round(clockY + Math.sin(ha) * 3), G.ironDark);

  // Pyramidal copper spire surmounting clocktower
  const spPeakY = twY - twH - 12;
  for (let dy = 0; dy <= 12; dy++) {
    const y = twY - twH - dy;
    const half = Math.max(1, Math.round(((twW >> 1) * (12 - dy)) / 12));
    rect(ctx, twX - half - 1, y, half * 2 + 2, 1, G.out);
    rect(ctx, twX - half, y, half * 2, 1, (dy % 3 === 0) ? G.mossLight : G.mossR);
  }

  // Tall waving goblin skull guild banner on the pinnacle spire
  banner(ctx, twX, spPeakY, 24, frame, false);

  // Stone chimney with puffing smoke on rear roof
  const c = chimney(ctx, fx - 16, gy - gh - 8, 12);
  smoke(ctx, c.x, c.y, frame);

  // Fine brass street lantern by the grand steps
  const slX = fx + stU + stW + 4, slY = fy - ((stU + stW) >> 1) + 4;
  rect(ctx, slX - 1, slY - 14, 2, 14, G.ironDark);
  rect(ctx, slX - 2, slY - 16, 4, 3, G.out);
  rect(ctx, slX - 1, slY - 15, 2, 2, frame % 2 === 0 ? G.glowHot : G.glow);
  px(ctx, slX, slY - 17, G.brass);

  // Yard props: gilded trade crates, heavy strongbox, scrap cogs
  const chX = fx + 4, chY = fy + 4;
  box(ctx, chX, chY, 10, 8, 7, WOOD);
  rightWallRect(ctx, chX, chY, 0, 3, 8, 1, G.brass);
  px(ctx, chX + 4, chY - 4, G.brassLight);

  gear(ctx, fx + wR - 4, fy - (wR >> 1) + 12, 3);
  bush(ctx, fx - wL + 4, fy - (wL >> 1) + 8, 4);
  scrap(ctx, fx - 28, fy - 2, 6);

  return cv;
}

export const art: Partial<Record<BuildingKind, () => HTMLCanvasElement[]>> = {
  shop: () => [0, 1, 2].map(drawShop),
  stall: () => [0, 1, 2].map(drawStall),
  tavern: () => [0, 1, 2].map(drawTavern),
  bank: () => [0, 1, 2].map(drawBank),
  bakery: () => [0, 1, 2].map(drawBakery),
  teahouse: () => [0, 1, 2].map(drawTeahouse),
  tailor: () => [0, 1, 2].map(drawTailor),
  bazaar: () => [0, 1, 2].map(drawBazaar),
  tradeguild: () => [0, 1, 2].map(drawTradeguild),
};
