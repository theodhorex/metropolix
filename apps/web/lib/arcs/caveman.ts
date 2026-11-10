import {
  SPRITE_W,
  SPRITE_H,
  TILE_H,
  OUT,
  makeCanvas,
  px,
  rect,
  isoDiamond,
  isoTexel,
  isoBox,
  leftWallRect,
  rightWallRect,
  disc,
  tileHash,
  type ArcArt,
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
      // Top-left sunlit shading + stitched hide patchwork bands
      const isSeam = dy === Math.round(height * 0.45) || (dx + dy) % 9 === 0;
      let col = dx < -span * 0.25 ? HIDE_DARK : dx > span * 0.2 ? HIDE_MID : HIDE_LIGHT;
      if (dy > height * 0.65 && dx >= -3 && dx <= 3) col = FUR_MID;
      if (isSeam && dy < height - 1) col = WOOD_DARK;
      px(ctx, cx + dx, y, col);
    }
  }
  // Rib-bone frame struts radiating from smoke hole apex
  const topY = baseY - height;
  rect(ctx, cx - 3, topY - 1, 6, 2, OUT);
  rect(ctx, cx - 2, topY, 4, 1, BONE_MID);
  px(ctx, cx - 4, topY - 2, BONE_LIGHT);
  px(ctx, cx + 3, topY - 2, BONE_LIGHT);
}

/** Draw a crackling stone-ringed campfire at (cx, cy). */
function drawFirePit(ctx: CanvasRenderingContext2D, cx: number, cy: number, frame: number): void {
  // Circle of grey river stones
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
  // Charred wood & animated flame tongues
  rect(ctx, cx - 2, cy, 4, 2, WOOD_DARK);
  const fShift = frame % 2 === 0 ? 0 : 1;
  rect(ctx, cx - 2, cy - 3, 4, 3, FLAME_DARK);
  rect(ctx, cx - 1, cy - 5 + fShift, 3, 4, FLAME_MID);
  rect(ctx, cx - 1 + fShift, cy - 3, 2, 2, FLAME_CORE);
  px(ctx, cx - fShift, cy - 6, FLAME_DARK);
}

function buildGround(parity: 0 | 1, variant: number): HTMLCanvasElement {
  const [canvas, ctx] = makeCanvas(SPRITE_W, TILE_H);
  const base = parity === 0 ? DIRT_0 : DIRT_1;
  const dark = parity === 0 ? '#654e36' : '#59442e';
  const light = parity === 0 ? DIRT_LIGHT : '#826748';

  isoDiamond(ctx, 32, 16, 32, base, DIRT_DARK);

  for (let u = 2; u < 30; u++) {
    for (let v = 2; v < 30; v++) {
      const h = tileHash(u, v, variant * 19 + parity * 11 + 3);
      const r = h % 27;
      if (r === 0 || r === 1) {
        isoTexel(ctx, 32, 0, u, v, light);
      } else if (r === 2 || r === 3) {
        isoTexel(ctx, 32, 0, u, v, dark);
      }
    }
  }

  if (variant === 1) {
    // Sparse dry steppe grass tufts
    for (const [u, v] of [
      [10, 14],
      [21, 10],
      [15, 22],
    ] as const) {
      const sx = 32 + (u - v);
      const sy = (u + v) >> 1;
      px(ctx, sx, sy + 1, '#435225');
      px(ctx, sx - 1, sy, '#657a3b');
      px(ctx, sx + 1, sy, '#7c9449');
    }
  } else if (variant === 2) {
    // Sun-bleached bone fragments in the dirt
    for (const [u, v] of [
      [12, 18],
      [22, 13],
    ] as const) {
      const sx = 32 + (u - v);
      const sy = (u + v) >> 1;
      rect(ctx, sx - 1, sy, 3, 1, BONE_LIGHT);
      px(ctx, sx - 2, sy + 1, BONE_MID);
      px(ctx, sx + 2, sy - 1, BONE_MID);
    }
  } else if (variant === 3) {
    // Flint nodules and ochre pebbles
    for (const [u, v] of [
      [11, 20],
      [20, 9],
      [24, 19],
    ] as const) {
      const sx = 32 + (u - v);
      const sy = (u + v) >> 1;
      rect(ctx, sx - 1, sy, 2, 2, FUR_DARK);
      px(ctx, sx - 1, sy, FUR_LIGHT);
    }
  }

  return canvas;
}

function buildFoundation(): HTMLCanvasElement {
  const [canvas, ctx] = makeCanvas(SPRITE_W, TILE_H);
  isoDiamond(ctx, 32, 16, 32, DIRT_1, DIRT_DARK);
  isoDiamond(ctx, 32, 16, 26, '#877259', OUT);
  return canvas;
}

/** Round hide-and-bone hut with mammoth-tusk entrance arch, red-ochre cave handprint, and fire pit. */
function buildHouse(): HTMLCanvasElement[] {
  return [0, 1].map((frame) => {
    const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);
    isoDiamond(ctx, 32, 48, 27, DIRT_0, OUT);
    isoDiamond(ctx, 32, 48, 22, '#8a7052', DIRT_DARK);

    // Low boulder ring base under the yurt
    isoDiamond(ctx, 30, 50, 16, FUR_DARK, OUT);
    // Round hide-and-bone dome (distinct circular silhouette instead of rectangular box)
    drawHideDome(ctx, 30, 50, 14, 19);

    // Red-ochre cave painting (hunting handprint & spiral) on the sunlit right hide wall
    px(ctx, 34, 41, OCHRE_RED);
    px(ctx, 35, 40, OCHRE_RED);
    px(ctx, 36, 41, OCHRE_RED);
    px(ctx, 35, 42, OCHRE_RED);
    px(ctx, 25, 40, OCHRE_RED);
    px(ctx, 24, 41, BONE_LIGHT);

    // Dark fur-curtain doorway framed by crossed mammoth tusks on the front-right
    rect(ctx, 32, 43, 6, 8, OUT);
    rect(ctx, 33, 44, 4, 7, '#261a10');
    drawTusk(ctx, 31, 51, 35, 41, 3);
    drawTusk(ctx, 39, 51, 35, 41, 3);
    // Animal skull mounted above doorway arch
    rect(ctx, 34, 39, 3, 3, BONE_LIGHT);
    px(ctx, 34, 40, OUT);
    px(ctx, 36, 40, OUT);

    // Outdoor cooking fire pit in front
    drawFirePit(ctx, 43, 53, frame);

    return canvas;
  });
}

/** Mammoth-rib trading tent with stretched pelt drying rack and stone barter slab. */
function buildShop(): HTMLCanvasElement[] {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);
  isoDiamond(ctx, 32, 48, 27, DIRT_0, OUT);
  isoDiamond(ctx, 32, 48, 22, DIRT_LIGHT, DIRT_DARK);

  // Slanted hide lean-to canopy supported by giant mammoth ribs on back-left
  for (let v = 0; v < 16; v++) {
    const x0 = 20 + v;
    const y0 = 49 - (v >> 1);
    const col = ((v >> 1) & 1) === 0 ? HIDE_LIGHT : OCHRE_RED;
    rect(ctx, x0 - 8, y0 - 15, 9, 2, OUT);
    rect(ctx, x0 - 7, y0 - 14, 8, 2, col);
    rect(ctx, x0 - 6, y0 - 12, 7, 5, HIDE_DARK);
  }
  // Giant curved mammoth tusks holding up the front of the market canopy
  drawTusk(ctx, 20, 50, 17, 35, 4);
  drawTusk(ctx, 35, 43, 32, 28, 4);

  // Flat boulder barter counter in front displaying flint blades, meat haunch & amber beads
  isoBox(ctx, 33, 55, 10, 14, 4, {
    top: FUR_LIGHT,
    left: FUR_DARK,
    right: FUR_MID,
  });
  // Barter goods on stone slab
  rect(ctx, 31, 49, 4, 2, OCHRE_RED); // raw meat cut
  px(ctx, 35, 49, BONE_LIGHT); // bone handle
  rect(ctx, 37, 47, 3, 2, FLAME_MID); // amber chunks
  rect(ctx, 28, 48, 3, 2, '#cfd8dc'); // knapped flint spearheads

  // Wooden pelt-stretching rack on the left side
  rect(ctx, 15, 39, 1, 13, OUT);
  rect(ctx, 22, 42, 1, 13, OUT);
  rect(ctx, 15, 40, 8, 1, WOOD_LIGHT);
  rect(ctx, 17, 42, 4, 8, HIDE_MID);
  rect(ctx, 18, 43, 2, 6, HIDE_LIGHT);

  return [canvas];
}

/** Bone-fenced training ring with a big mammoth-hide war drum and weapon rack. */
function buildBarracks(): HTMLCanvasElement[] {
  return [0, 1].map((frame) => {
    const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);
    // Trodden red-ochre sparring ring on the ground
    isoDiamond(ctx, 32, 48, 28, DIRT_DARK, OUT);
    isoDiamond(ctx, 32, 48, 22, '#8c583a', OCHRE_RED);
    isoDiamond(ctx, 32, 48, 14, DIRT_LIGHT, DIRT_DARK);

    // Big mammoth-hide war drum on a bone platform at the back of the ring
    const dFx = 27;
    const dFy = 44;
    isoBox(ctx, dFx, dFy, 9, 9, 8, {
      top: BONE_LIGHT,
      left: HIDE_DARK,
      right: HIDE_MID,
    });
    // Crimson tribal war paint stripes & bone lacings on drum body
    leftWallRect(ctx, dFx, dFy, 2, 2, 5, 4, OCHRE_RED);
    rightWallRect(ctx, dFx, dFy, 2, 2, 5, 4, OCHRE_RED);
    // Animated bone drumstick striking the drumhead
    const beatY = frame === 0 ? dFy - 13 : dFy - 10;
    rect(ctx, dFx + 1, beatY, 5, 2, OUT);
    rect(ctx, dFx + 2, beatY, 3, 1, BONE_LIGHT);
    disc(ctx, dFx, beatY, 2, BONE_LIGHT);

    // Wooden spear & stone-club rack on the right
    rect(ctx, 41, 35, 1, 14, OUT);
    rect(ctx, 45, 37, 1, 14, OUT);
    rect(ctx, 40, 42, 7, 2, WOOD_MID);
    px(ctx, 41, 33, BONE_LIGHT);
    px(ctx, 45, 35, BONE_LIGHT);

    // Perimeter ring of alternating rib-bones and sharpened wooden spikes
    for (let u = 2; u < 20; u += 3) {
      const x = 32 - 1 - u;
      const yBot = 60 - (u >> 1);
      const isBone = u % 6 === 2;
      const h = isBone ? 8 : 6;
      rect(ctx, x - 1, yBot - h, 2, h + 1, OUT);
      rect(ctx, x, yBot - h, 1, h, isBone ? BONE_LIGHT : WOOD_MID);
      px(ctx, x + (isBone ? 1 : 0), yBot - h - 1, isBone ? BONE_MID : WOOD_LIGHT);
    }
    for (let v = 2; v < 20; v += 3) {
      if (v >= 7 && v <= 12) continue; // sparring ring entrance gap
      const x = 32 + v;
      const yBot = 60 - (v >> 1);
      const isBone = v % 6 === 2;
      const h = isBone ? 8 : 6;
      rect(ctx, x, yBot - h, 2, h + 1, OUT);
      rect(ctx, x, yBot - h, 1, h, isBone ? BONE_LIGHT : WOOD_LIGHT);
      px(ctx, x - (isBone ? 1 : 0), yBot - h - 1, isBone ? BONE_LIGHT : HIDE_LIGHT);
    }

    return canvas;
  });
}

/** Tall stacked-stone totem cairn crowned with mammoth skulls and twin bone torches. */
function buildTower(): HTMLCanvasElement[] {
  return [0, 1].map((frame) => {
    const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);
    isoDiamond(ctx, 32, 48, 25, DIRT_1, OUT);
    isoDiamond(ctx, 32, 48, 19, FUR_DARK, OUT);

    // 4 tapering stacked megalithic boulder tiers (totem silhouette, clearly distinct from square watchtower)
    isoBox(ctx, 32, 57, 16, 16, 7, {
      top: FUR_LIGHT,
      left: FUR_DARK,
      right: FUR_MID,
    });
    isoBox(ctx, 32, 50, 13, 13, 8, {
      top: HIDE_LIGHT,
      left: HIDE_DARK,
      right: HIDE_MID,
    });
    // Ochre spiral totem carving on middle tier
    rightWallRect(ctx, 32, 50, 3, 2, 6, 4, OCHRE_RED);
    rightWallRect(ctx, 32, 50, 5, 3, 2, 2, BONE_LIGHT);

    isoBox(ctx, 32, 42, 10, 10, 9, {
      top: FUR_LIGHT,
      left: FUR_DARK,
      right: FUR_MID,
    });
    isoBox(ctx, 32, 33, 8, 8, 8, {
      top: BONE_MID,
      left: BONE_DARK,
      right: BONE_LIGHT,
    });

    // Giant horned mammoth skull crowning the totem peak
    disc(ctx, 32, 21, 5, OUT);
    disc(ctx, 32, 21, 4, BONE_LIGHT);
    // Dark eye sockets & nasal cavity
    rect(ctx, 29, 20, 2, 2, OUT);
    rect(ctx, 33, 20, 2, 2, OUT);
    px(ctx, 31, 23, OUT);
    // Sweeping side tusks curving outward from the skull
    drawTusk(ctx, 28, 22, 19, 16, -3);
    drawTusk(ctx, 36, 22, 45, 16, -3);

    // Flickering signal fire on top of skull crown
    const f = frame % 2;
    rect(ctx, 30, 13 + f, 4, 4, FLAME_DARK);
    rect(ctx, 31, 11 + f, 2, 4, FLAME_MID);
    px(ctx, 31 + f, 13, FLAME_CORE);

    return canvas;
  });
}

/** Stone-age foraging patch with wild berry bushes, tuber mounds, and wooden meat-smoking racks. */
function buildFarm(): HTMLCanvasElement[] {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);
  isoDiamond(ctx, 32, 48, 28, DIRT_0, OUT);
  isoDiamond(ctx, 32, 48, 24, DIRT_1, DIRT_DARK);

  // Wild berry bush clusters on the front/right foraging ground
  for (const [u, v] of [
    [16, 8],
    [22, 9],
    [16, 16],
    [23, 17],
    [18, 23],
    [24, 24],
  ] as const) {
    const sx = 32 + (u - v);
    const sy = 32 + ((u + v) >> 1);
    disc(ctx, sx, sy - 2, 4, OUT);
    disc(ctx, sx, sy - 2, 3, '#3f5e2a');
    disc(ctx, sx - 1, sy - 3, 2, '#5c823c');
    // Bright red & ochre wild berries
    px(ctx, sx - 2, sy - 2, OCHRE_RED);
    px(ctx, sx + 1, sy - 3, '#ef5350');
    px(ctx, sx, sy - 1, FLAME_MID);
  }

  // A-frame wooden meat-drying & smoking racks on the back-left
  for (const [rx, ry] of [
    [24, 44],
    [18, 49],
  ] as const) {
    // A-frame poles
    rect(ctx, rx - 5, ry - 9, 2, 10, OUT);
    rect(ctx, rx - 4, ry - 9, 1, 9, WOOD_LIGHT);
    rect(ctx, rx + 3, ry - 7, 2, 10, OUT);
    rect(ctx, rx + 4, ry - 7, 1, 9, WOOD_MID);
    // Crossbar
    rect(ctx, rx - 5, ry - 8, 10, 2, WOOD_DARK);
    // Hanging smoked meat strips
    rect(ctx, rx - 2, ry - 6, 2, 5, OCHRE_RED);
    rect(ctx, rx + 1, ry - 6, 2, 5, '#8c2d19');
    px(ctx, rx - 2, ry - 2, BONE_LIGHT);
  }

  return [canvas];
}

/** Elder's painted rock overhang shelter with mammoth mural and storytelling fire circle. */
function buildSchool(): HTMLCanvasElement[] {
  return [0, 1].map((frame) => {
    const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);
    isoDiamond(ctx, 32, 48, 28, DIRT_0, OUT);
    isoDiamond(ctx, 32, 48, 23, DIRT_LIGHT, DIRT_DARK);

    // Slanted monolith cliff slab at back-left with flat painted rock wall facing right-down
    isoBox(ctx, 28, 51, 10, 18, 18, {
      top: FUR_LIGHT,
      left: FUR_DARK,
      right: '#8f8375',
    });
    // Stepped upper crag ledge
    isoBox(ctx, 26, 33, 8, 12, 5, {
      top: FUR_LIGHT,
      left: FUR_DARK,
      right: FUR_MID,
    });

    // Ochre & bone-chalk cave painting mural (mammoth + spear hunters) on the cliff face
    rightWallRect(ctx, 28, 51, 3, 5, 12, 9, '#736759');
    rightWallRect(ctx, 28, 51, 5, 7, 5, 4, OCHRE_RED); // painted mammoth body
    rightWallRect(ctx, 28, 51, 10, 6, 2, 2, BONE_LIGHT); // painted tusks
    rightWallRect(ctx, 28, 51, 13, 7, 1, 4, FLAME_CORE); // shaman figure

    // Semicircle of stone seats around the elder's storytelling fire in front-right
    for (const [sx, sy] of [
      [35, 55],
      [40, 54],
      [44, 50],
      [42, 46],
    ] as const) {
      isoBox(ctx, sx, sy, 3, 3, 2, {
        top: FUR_LIGHT,
        left: FUR_DARK,
        right: FUR_MID,
      });
    }
    drawFirePit(ctx, 37, 50, frame);

    return canvas;
  });
}

/** Flint-knapping & boiling tar-pit workshop with hide bellows and smoke puffs. */
function buildFactory(): HTMLCanvasElement[] {
  return [0, 1, 2].map((frame) => {
    const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);
    isoDiamond(ctx, 32, 48, 28, DIRT_1, OUT);
    isoDiamond(ctx, 32, 48, 23, FUR_DARK, OUT);

    // Conical mud-and-boulder kiln mound on back-left
    drawHideDome(ctx, 25, 48, 10, 16);
    // Glowing fire mouth at kiln base
    rect(ctx, 26, 43, 5, 5, OUT);
    rect(ctx, 27, 44, 3, 4, frame === 1 ? FLAME_CORE : FLAME_MID);

    // Bubbling black tar & ember pit on front-right ringed by heavy boulders
    isoDiamond(ctx, 39, 50, 10, '#2e2a27', OUT);
    isoDiamond(ctx, 39, 50, 7, '#141210');
    const bubbleX = 38 + (frame % 3);
    rect(ctx, bubbleX, 49, 2, 2, FLAME_MID);
    px(ctx, bubbleX, 49, FLAME_CORE);

    // Heavy flint-knapping anvil boulder + bone hammers in front
    isoBox(ctx, 28, 56, 6, 6, 4, {
      top: FUR_LIGHT,
      left: FUR_DARK,
      right: FUR_MID,
    });
    rect(ctx, 27, 50, 3, 2, BONE_LIGHT);

    // Rising smoke puffs from the kiln chimney hole
    const yOff = frame * 2;
    disc(ctx, 25, 27 - yOff, 3, FUR_DARK);
    disc(ctx, 27, 21 - yOff, 4, FUR_MID);
    disc(ctx, 29, 15 - yOff, 3, FUR_LIGHT);

    return canvas;
  });
}

/** Log pile with lashed stone axes, chopping stump, and bark lean-to. */
function buildLumber(): HTMLCanvasElement[] {
  return [0, 1].map((frame) => {
    const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);
    isoDiamond(ctx, 32, 48, 27, DIRT_0, OUT);
    isoDiamond(ctx, 32, 48, 22, DIRT_1, DIRT_DARK);

    // Pyramid stack of rough-barked logs on the back-left (bound with hide thongs)
    for (const [lx, ly] of [
      [22, 48],
      [27, 48],
      [32, 48],
      [24, 44],
      [29, 44],
      [27, 40],
    ] as const) {
      isoBox(ctx, lx, ly, 5, 10, 4, {
        top: WOOD_LIGHT,
        left: WOOD_DARK,
        right: WOOD_MID,
      });
      // Pale cut wood end-grain on left face
      leftWallRect(ctx, lx, ly, 1, 1, 3, 2, HIDE_LIGHT);
    }

    // Wide tree-stump chopping block on front-right with a stone-head axe
    isoBox(ctx, 40, 54, 7, 7, 5, {
      top: HIDE_LIGHT,
      left: WOOD_DARK,
      right: WOOD_MID,
    });
    // Stone axe handle & heavy flint blade (shifts between frames)
    const axeY = frame === 0 ? 44 : 46;
    rect(ctx, 39, axeY, 2, 5, WOOD_LIGHT);
    rect(ctx, 37, axeY - 2, 5, 3, OUT);
    rect(ctx, 38, axeY - 1, 3, 2, FUR_LIGHT);

    return canvas;
  });
}

/** Open-pit rock & ochre quarry with stepped crater and wooden A-frame hoist. */
function buildMine(): HTMLCanvasElement[] {
  return [0, 1].map((frame) => {
    const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);
    // Terraced stepped quarry pit dug into the tile
    isoDiamond(ctx, 32, 48, 28, FUR_MID, OUT);
    isoDiamond(ctx, 32, 49, 22, FUR_DARK, OUT);
    isoDiamond(ctx, 32, 50, 15, '#2e2925', OUT);
    isoDiamond(ctx, 32, 51, 8, '#1a1715');

    // Jagged limestone & red-ochre quarry cliff wall on the back rim
    isoBox(ctx, 29, 44, 12, 14, 10, {
      top: DIRT_LIGHT,
      left: FUR_DARK,
      right: FUR_MID,
    });
    rightWallRect(ctx, 29, 44, 3, 2, 8, 5, OCHRE_RED); // exposed red-ochre vein
    rightWallRect(ctx, 29, 44, 5, 3, 3, 2, BONE_LIGHT); // flint seam

    // Wooden A-frame hoist & hide ore bucket overhanging the quarry pit
    rect(ctx, 31, 29, 2, 16, OUT);
    rect(ctx, 32, 29, 1, 15, WOOD_LIGHT);
    rect(ctx, 37, 32, 2, 15, OUT);
    rect(ctx, 38, 32, 1, 14, WOOD_MID);
    rect(ctx, 30, 30, 10, 2, WOOD_DARK);
    // Rope & swaying boulder bucket
    const bucketY = frame === 0 ? 39 : 41;
    rect(ctx, 35, 32, 1, bucketY - 32, BONE_MID);
    isoBox(ctx, 36, bucketY + 4, 4, 4, 3, {
      top: OCHRE_RED,
      left: HIDE_DARK,
      right: HIDE_MID,
    });

    return canvas;
  });
}

/** Sacred ancestor standing-stone ring and tribal bonfire circle. */
function buildPark(): HTMLCanvasElement[] {
  return [0, 1].map((frame) => {
    const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);
    isoDiamond(ctx, 32, 48, 29, DIRT_0, OUT);
    isoDiamond(ctx, 32, 48, 23, '#8a6c4c', DIRT_DARK);
    isoDiamond(ctx, 32, 48, 15, DIRT_1, OCHRE_RED);

    // 4 megalithic standing stones (menhirs) around the circle in back-to-front depth order
    for (const [mx, my, mh] of [
      [32, 40, 12],
      [20, 47, 10],
      [44, 47, 10],
      [32, 57, 9],
    ] as const) {
      isoBox(ctx, mx, my, 4, 4, mh, {
        top: FUR_LIGHT,
        left: FUR_DARK,
        right: FUR_MID,
      });
      rightWallRect(ctx, mx, my, 1, 3, 2, 3, OCHRE_RED);
    }

    // Central tribal bonfire
    drawFirePit(ctx, 32, 47, frame);

    return canvas;
  });
}

/** Gnarled prehistoric steppe scrub-pine with exposed roots and olive/amber foliage. */
function buildTree(): HTMLCanvasElement[] {
  return [0, 1].map((frame) => {
    const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);
    isoDiamond(ctx, 32, 50, 11, DIRT_DARK, OUT);
    // Gnarled leaning trunk
    rect(ctx, 29, 36, 5, 15, OUT);
    rect(ctx, 30, 37, 2, 13, WOOD_DARK);
    rect(ctx, 32, 37, 1, 13, WOOD_MID);
    // Flat-topped prehistoric steppe canopy pads
    const sway = frame % 2;
    disc(ctx, 26 + sway, 35, 6, OUT);
    disc(ctx, 26 + sway, 35, 5, '#4d5e28');
    disc(ctx, 37 + sway, 34, 6, OUT);
    disc(ctx, 37 + sway, 34, 5, '#5f7332');
    disc(ctx, 32 + sway, 28, 7, OUT);
    disc(ctx, 32 + sway, 28, 6, '#788f42');
    rect(ctx, 29 + sway, 25, 4, 2, '#9cb55b');
    return canvas;
  });
}

/** Bone-tripod torch with burning pitch-soaked skull brazier. */
function buildLamp(): HTMLCanvasElement[] {
  return [0, 1].map((frame) => {
    const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);
    isoDiamond(ctx, 32, 50, 9, DIRT_DARK, OUT);
    // Crossed bone tripod legs
    rect(ctx, 29, 34, 2, 16, OUT);
    rect(ctx, 30, 34, 1, 15, BONE_MID);
    rect(ctx, 33, 34, 2, 16, OUT);
    rect(ctx, 33, 34, 1, 15, BONE_LIGHT);
    // Skull fire bowl
    isoBox(ctx, 32, 35, 5, 5, 4, {
      top: BONE_LIGHT,
      left: BONE_DARK,
      right: BONE_MID,
    });
    // Animated torch flame
    const f = frame % 2;
    rect(ctx, 30, 24 + f, 4, 6, FLAME_DARK);
    rect(ctx, 31, 22 + f, 2, 6, FLAME_MID);
    px(ctx, 31 + f, 25, FLAME_CORE);
    return canvas;
  });
}

/** Bubbling thermal hot-spring pool ringed by mossy boulders. */
function buildFountain(): HTMLCanvasElement[] {
  return [0, 1].map((frame) => {
    const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);
    isoDiamond(ctx, 32, 47, 25, FUR_DARK, OUT);
    isoDiamond(ctx, 32, 47, 20, FUR_MID, OUT);
    isoDiamond(ctx, 32, 47, 15, frame ? '#4dd0e1' : '#26c6da');
    isoDiamond(ctx, 32, 47, 9, '#b2ebf2');
    // Boulders around rim
    for (const [bx, by] of [
      [22, 44],
      [32, 39],
      [42, 45],
      [26, 52],
    ] as const) {
      disc(ctx, bx, by, 3, OUT);
      disc(ctx, bx, by, 2, FUR_LIGHT);
    }
    // Geyser spout & steam
    const h = frame ? 12 : 9;
    rect(ctx, 31, 45 - h, 3, h, '#e0f7fa');
    px(ctx, 29, 34 - frame * 2, BONE_LIGHT);
    px(ctx, 35, 33 - frame * 2, BONE_LIGHT);
    return canvas;
  });
}

/** Carved ochre sandstone Venus/Mammoth idol flanked by two mammoth tusks. */
function buildStatue(): HTMLCanvasElement[] {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);
  isoDiamond(ctx, 32, 48, 22, DIRT_DARK, OUT);
  isoBox(ctx, 32, 56, 12, 12, 6, {
    top: FUR_LIGHT,
    left: FUR_DARK,
    right: FUR_MID,
  });
  // Rounded ancestral fertility/totem stone idol smeared with red ochre
  disc(ctx, 32, 39, 6, OUT);
  disc(ctx, 32, 39, 5, HIDE_MID);
  disc(ctx, 32, 31, 5, OUT);
  disc(ctx, 32, 31, 4, HIDE_LIGHT);
  disc(ctx, 32, 24, 4, OUT);
  disc(ctx, 32, 24, 3, OCHRE_RED);
  // Twin mammoth tusks framing the idol
  drawTusk(ctx, 24, 48, 21, 26, 4);
  drawTusk(ctx, 40, 48, 43, 26, -4);
  return [canvas];
}

/**
 * 11. ROWHOUSE: Three Joined Stone-and-Hide Terrace Shelters.
 * Three narrow connected rough-stone dwellings in a stepped row, each with its own
 * bone-framed doorway, fire-lit window slit, and individual stitched-hide dome cap.
 */
function buildRowhouse(): HTMLCanvasElement[] {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  // Packed dirt & flat river-stone lane pad
  isoDiamond(ctx, 32, 48, 28, DIRT_0, OUT);
  isoDiamond(ctx, 32, 48, 23, DIRT_1, DIRT_DARK);

  // Three narrow joined stone-and-hide units stepped along the right-up (v) axis
  const units = [
    [26, 58, FUR_MID],
    [32, 55, FUR_LIGHT],
    [38, 52, FUR_MID],
  ] as const;

  for (const [ufx, ufy, rightStone] of units) {
    // Rough grey stone base + lashed timber upper wall
    isoBox(ctx, ufx, ufy, 14, 7, 11, {
      top: HIDE_LIGHT,
      left: FUR_DARK,
      right: rightStone,
    });
    leftWallRect(ctx, ufx, ufy, 0, 6, 14, 1, WOOD_DARK);
    rightWallRect(ctx, ufx, ufy, 0, 6, 7, 1, WOOD_MID);

    // Individual fur-flap doorway framed by bone ribs on ground level
    rightWallRect(ctx, ufx, ufy, 1, 1, 3, 5, OUT);
    rightWallRect(ctx, ufx, ufy, 2, 1, 1, 4, '#261a10');
    rightWallRect(ctx, ufx, ufy, 1, 5, 3, 1, BONE_LIGHT);
    // Upper fire-lit window slit
    rightWallRect(ctx, ufx, ufy, 2, 7, 3, 3, OUT);
    rightWallRect(ctx, ufx, ufy, 3, 8, 1, 1, FLAME_CORE);

    // Individual stitched-hide dome roof over each row unit
    drawHideDome(ctx, ufx - 3, ufy - 11, 6, 8);
  }

  // Red-ochre tribal handprints & window slits on the shared left stone end-wall
  leftWallRect(ctx, 26, 58, 3, 4, 3, 4, OUT);
  leftWallRect(ctx, 26, 58, 4, 5, 1, 2, FLAME_MID);
  leftWallRect(ctx, 26, 58, 9, 4, 3, 4, OUT);
  leftWallRect(ctx, 26, 58, 10, 5, 1, 2, FLAME_MID);

  return [canvas];
}

/**
 * 12. MANOR: Chieftain's Great Megalithic Lodge with Tusk Porch & Watch-Turret.
 * Big detached rough-stone & mammoth-hide chieftain home with a boulder garden wall,
 * twin-tusk front porch, smoking stone chimney, and a tall megalithic corner turret.
 */
function buildManor(): HTMLCanvasElement[] {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  // Packed ochre compound & low rough-stone perimeter garden wall
  isoDiamond(ctx, 32, 48, 29, DIRT_0, OUT);
  isoDiamond(ctx, 32, 48, 25, DIRT_LIGHT, DIRT_DARK);
  isoBox(ctx, 32, 60, 16, 3, 3, {
    top: FUR_LIGHT,
    left: FUR_DARK,
    right: FUR_MID,
  });
  isoBox(ctx, 35, 58, 3, 14, 3, {
    top: FUR_LIGHT,
    left: FUR_DARK,
    right: FUR_MID,
  });

  // Main detached rough-stone & timber lodge body
  const fx = 33;
  const fy = 54;
  const wL = 16;
  const wR = 16;
  const wallH = 12;
  isoBox(ctx, fx, fy, wL, wR, wallH, {
    top: HIDE_LIGHT,
    left: FUR_DARK,
    right: FUR_MID,
  });
  // Red-ochre & bone tribal frieze along upper wall
  leftWallRect(ctx, fx, fy, 1, wallH - 3, wL - 2, 2, OCHRE_RED);
  rightWallRect(ctx, fx, fy, 1, wallH - 3, wR - 2, 2, OCHRE_RED);
  rightWallRect(ctx, fx, fy, 2, wallH - 2, wR - 4, 1, BONE_LIGHT);

  // Projecting front-right porch framed by arching mammoth tusks
  isoBox(ctx, 37, 55, 6, 8, 7, {
    top: HIDE_LIGHT,
    left: WOOD_DARK,
    right: HIDE_MID,
  });
  rightWallRect(ctx, 37, 55, 2, 1, 4, 5, OUT);
  rightWallRect(ctx, 37, 55, 3, 1, 2, 4, '#261a10');
  drawTusk(ctx, 36, 55, 39, 46, 3);
  drawTusk(ctx, 44, 51, 41, 45, 3);

  // Warm hearth-lit windows on main lodge
  for (const v0 of [9, 13]) {
    rightWallRect(ctx, fx, fy, v0, 4, 3, 4, OUT);
    rightWallRect(ctx, fx, fy, v0 + 1, 5, 1, 2, FLAME_CORE);
  }

  // Broad stitched-hide roof over main lodge + rough-stone chimney on right
  drawHideDome(ctx, 33, 39, 13, 10);
  isoBox(ctx, 41, 35, 4, 4, 7, {
    top: FUR_LIGHT,
    left: FUR_DARK,
    right: FUR_MID,
  });

  // Tall megalithic stone & hide watch-turret on back-left corner crowned with bone horns
  isoBox(ctx, 23, 48, 8, 8, 19, {
    top: FUR_LIGHT,
    left: FUR_DARK,
    right: FUR_MID,
  });
  drawHideDome(ctx, 23, 27, 7, 9);
  drawTusk(ctx, 20, 20, 15, 14, -2);
  drawTusk(ctx, 26, 20, 31, 14, -2);

  return [canvas];
}

/**
 * 13. STALL: Low Stone-Age Barter Booth (~0.6 tile tall).
 * Low rough-stone slab counter under a striped hide-and-ochre awning lashed to bone poles,
 * displaying folded pelts, flint knives, and amber chunks.
 */
function buildStall(): HTMLCanvasElement[] {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  // Compact trodden dirt pad
  isoDiamond(ctx, 32, 48, 22, DIRT_0, OUT);
  isoDiamond(ctx, 32, 48, 17, DIRT_LIGHT, DIRT_DARK);

  // Low boulder & log barter counter in center (0.6 tile height profile)
  const fx = 33;
  const fy = 54;
  isoBox(ctx, fx, fy, 10, 14, 5, {
    top: FUR_LIGHT,
    left: FUR_DARK,
    right: FUR_MID,
  });

  // Barter goods on counter: folded hides, red meat cut, amber nuggets, bone tools
  rect(ctx, 33, 47, 3, 2, HIDE_LIGHT);
  rect(ctx, 37, 46, 3, 2, OCHRE_RED);
  rect(ctx, 41, 44, 2, 2, FLAME_MID);
  rect(ctx, 29, 47, 3, 2, BONE_LIGHT);

  // Lashed bone poles supporting a low striped hide-and-ochre awning
  rect(ctx, 25, 38, 2, 12, OUT);
  rect(ctx, 25, 38, 1, 11, BONE_LIGHT);
  rect(ctx, 43, 38, 2, 11, OUT);
  rect(ctx, 43, 38, 1, 10, BONE_LIGHT);

  for (let v = 0; v < 16; v++) {
    const isOchre = ((v >> 1) & 1) === 0;
    const col = isOchre ? HIDE_LIGHT : OCHRE_RED;
    const edge = isOchre ? HIDE_MID : BONE_MID;
    const x = 25 + v;
    const y = 41 - (v >> 2);
    rect(ctx, x - 3, y - 4, 4, 4, OUT);
    rect(ctx, x - 2, y - 3, 3, 3, col);
    px(ctx, x, y, edge);
  }

  // Bundle of tied hides beside the stall
  isoBox(ctx, 24, 54, 4, 4, 3, {
    top: HIDE_LIGHT,
    left: HIDE_DARK,
    right: HIDE_MID,
  });

  return [canvas];
}

/**
 * 14. TAVERN: Two-Storey Mammoth-Bone Mead Hall & Roast Inn.
 * Rough-stone lower storey and lashed-log/hide upper storey with warm fire-lit windows,
 * hanging mammoth-horn & roast-haunch sign, and log brew barrels by the door.
 */
function buildTavern(): HTMLCanvasElement[] {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  // Trodden dirt courtyard pad
  isoDiamond(ctx, 32, 48, 27, DIRT_0, OUT);
  isoDiamond(ctx, 32, 48, 22, DIRT_1, DIRT_DARK);

  // Lower storey: heavy grey boulder walls
  const fx = 32;
  const fy = 56;
  const wL = 16;
  const wR = 18;
  isoBox(ctx, fx, fy, wL, wR, 9, {
    top: FUR_LIGHT,
    left: FUR_DARK,
    right: FUR_MID,
  });

  // Upper second storey: lashed timber logs & stretched mammoth hide
  isoBox(ctx, fx, fy - 9, wL + 2, wR + 2, 8, {
    top: HIDE_LIGHT,
    left: HIDE_DARK,
    right: HIDE_MID,
  });
  // Horizontal log lashing beam between storeys
  leftWallRect(ctx, fx, fy - 9, 0, 0, wL + 2, 2, WOOD_DARK);
  rightWallRect(ctx, fx, fy - 9, 0, 0, wR + 2, 2, WOOD_LIGHT);

  // Bone-framed tavern doorway & warm fire-lit windows on both storeys
  rightWallRect(ctx, fx, fy, 3, 1, 5, 7, OUT);
  rightWallRect(ctx, fx, fy, 4, 1, 3, 6, '#261a10');
  rightWallRect(ctx, fx, fy, 3, 7, 5, 1, BONE_LIGHT);

  rightWallRect(ctx, fx, fy, 10, 3, 5, 4, OUT);
  rightWallRect(ctx, fx, fy, 11, 4, 3, 2, FLAME_MID);
  rightWallRect(ctx, fx, fy, 12, 4, 1, 1, FLAME_CORE);

  for (const v0 of [3, 11]) {
    rightWallRect(ctx, fx, fy - 9, v0, 3, 5, 4, OUT);
    rightWallRect(ctx, fx, fy - 9, v0 + 1, 4, 3, 2, FLAME_CORE);
  }
  for (const u0 of [4, 11]) {
    leftWallRect(ctx, fx, fy - 9, u0, 3, 5, 4, OUT);
    leftWallRect(ctx, fx, fy - 9, u0 + 1, 4, 3, 2, FLAME_MID);
  }

  // Stitched-hide & mammoth-rib roof crown over the two-storey inn
  drawHideDome(ctx, 32, 34, 16, 11);

  // Projecting log arm with hanging drinking-horn & meat tavern sign
  rect(ctx, 46, 36, 7, 2, OUT);
  rect(ctx, 46, 36, 6, 1, WOOD_LIGHT);
  rect(ctx, 49, 38, 4, 5, OUT);
  rect(ctx, 50, 39, 2, 3, BONE_LIGHT);
  px(ctx, 51, 40, OCHRE_RED);

  // Two hollowed-log berry-brew barrels lashed with hide thongs beside the door
  isoBox(ctx, 39, 57, 4, 4, 4, {
    top: WOOD_LIGHT,
    left: WOOD_DARK,
    right: WOOD_MID,
  });
  rightWallRect(ctx, 39, 57, 0, 2, 4, 1, BONE_MID);
  isoBox(ctx, 43, 55, 4, 4, 4, {
    top: WOOD_LIGHT,
    left: WOOD_DARK,
    right: WOOD_MID,
  });
  rightWallRect(ctx, 43, 55, 0, 2, 4, 1, BONE_MID);

  return [canvas];
}

/**
 * 15. BANK: Megalithic Stone Vault with Giant Round Rock Door.
 * Solid cyclopean stone bunker flanked by monolithic columns & mammoth tusks,
 * sealed by a massive circular rolling boulder door and topped with a golden stone-coin emblem.
 */
function buildBank(): HTMLCanvasElement[] {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  // Heavy flagstone vault plaza
  isoDiamond(ctx, 32, 48, 28, DIRT_DARK, OUT);
  isoDiamond(ctx, 32, 48, 24, FUR_DARK, OUT);
  isoDiamond(ctx, 32, 48, 20, FUR_MID, BONE_MID);

  // Raised megalithic stone plinth
  const fx = 32;
  const fy = 57;
  const wL = 18;
  const wR = 20;
  isoBox(ctx, fx, fy, wL, wR, 3, {
    top: BONE_MID,
    left: FUR_DARK,
    right: FUR_LIGHT,
  });

  // Massive rough-stone vault hall body
  const wallH = 15;
  isoBox(ctx, fx, fy - 3, wL - 2, wR - 2, wallH, {
    top: FUR_LIGHT,
    left: FUR_DARK,
    right: FUR_MID,
  });
  // Gold-ochre & bone treasury band across upper wall
  leftWallRect(ctx, fx, fy - 3, 0, wallH - 3, wL - 2, 2, HIDE_DARK);
  rightWallRect(ctx, fx, fy - 3, 0, wallH - 3, wR - 2, 2, FLAME_MID);
  rightWallRect(ctx, fx, fy - 3, 1, wallH - 2, wR - 4, 1, FLAME_CORE);

  // Monolithic stone pillars flanking the front-right facade
  for (const v0 of [2, 15]) {
    rightWallRect(ctx, fx, fy - 3, v0, 1, 2, 12, OUT);
    rightWallRect(ctx, fx, fy - 3, v0, 1, 1, 12, BONE_LIGHT);
  }

  // Big round rolling-rock vault door centered on the front-right wall
  const doorCx = 40;
  const doorCy = 45;
  disc(ctx, doorCx, doorCy, 6, OUT);
  disc(ctx, doorCx, doorCy, 5, FUR_LIGHT);
  disc(ctx, doorCx - 1, doorCy - 1, 3, BONE_MID);
  // Carved golden sun-coin slot & bone locking bar across the round rock door
  rect(ctx, doorCx - 4, doorCy, 9, 2, WOOD_DARK);
  disc(ctx, doorCx, doorCy, 2, FLAME_CORE);
  px(ctx, doorCx, doorCy, FLAME_MID);

  // Heavy megalithic capstone roof & giant golden stone-coin sign on top
  isoBox(ctx, 32, 39, 13, 15, 4, {
    top: BONE_LIGHT,
    left: FUR_DARK,
    right: BONE_MID,
  });
  disc(ctx, 36, 32, 5, OUT);
  disc(ctx, 36, 32, 4, FLAME_MID);
  disc(ctx, 36, 32, 2, FLAME_CORE);
  px(ctx, 36, 32, FUR_DARK); // hole in center of stone-age coin disc

  // Guarding mammoth tusks at vault corners
  drawTusk(ctx, 29, 55, 26, 43, 3);
  drawTusk(ctx, 47, 46, 50, 35, -3);

  return [canvas];
}

/**
 * 16. LIBRARY: Hall of Carved Bone Scrolls & Cave-Painted Slabs.
 * Modest rectangular rough-stone & timber archive hall with three tall narrow torch-lit windows,
 * timber-lashed hide roof, and a carved bone-scroll / ochre-tablet sign above the entrance.
 */
function buildLibrary(): HTMLCanvasElement[] {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  // Quiet stone-ringed dirt court
  isoDiamond(ctx, 32, 48, 26, DIRT_0, OUT);
  isoDiamond(ctx, 32, 48, 21, DIRT_1, FUR_DARK);

  // Modest elongated rough-stone & timber hall (distinct closed hall vs open cliff school)
  const fx = 30;
  const fy = 56;
  const wL = 13;
  const wR = 20;
  const wallH = 12;
  isoBox(ctx, fx, fy, wL, wR, wallH, {
    top: HIDE_LIGHT,
    left: FUR_DARK,
    right: FUR_MID,
  });
  // Lashed log cornice beam
  leftWallRect(ctx, fx, fy, 0, wallH - 2, wL, 2, WOOD_DARK);
  rightWallRect(ctx, fx, fy, 0, wallH - 2, wR, 2, WOOD_LIGHT);

  // Entrance & three tall narrow torch-lit window slits along right wall
  rightWallRect(ctx, fx, fy, 2, 1, 4, 7, OUT);
  rightWallRect(ctx, fx, fy, 3, 1, 2, 6, '#261a10');
  for (const v0 of [7, 11, 15]) {
    rightWallRect(ctx, fx, fy, v0, 2, 3, 7, OUT);
    rightWallRect(ctx, fx, fy, v0 + 1, 3, 1, 5, FLAME_CORE);
  }
  for (const u0 of [3, 8]) {
    leftWallRect(ctx, fx, fy, u0, 2, 3, 7, OUT);
    leftWallRect(ctx, fx, fy, u0 + 1, 3, 1, 5, FLAME_MID);
  }

  // Low timber-and-hide roof deck
  isoBox(ctx, fx, fy - wallH, wL - 1, wR - 1, 3, {
    top: HIDE_LIGHT,
    left: HIDE_DARK,
    right: HIDE_MID,
  });

  // Prominent carved bone scroll & painted ochre tablet sign mounted above the door
  rect(ctx, 33, 36, 9, 6, OUT);
  rect(ctx, 34, 37, 3, 4, BONE_LIGHT);
  rect(ctx, 38, 37, 3, 4, BONE_MID);
  px(ctx, 35, 38, OCHRE_RED);
  px(ctx, 39, 39, OCHRE_RED);

  return [canvas];
}

/**
 * 17. ACADEMY: Grand Shamanic Great-Dome & Mammoth-Spire Sanctuary (Tallest Service Building, 2 frames).
 * Megalithic stone courtyard with tusk gates, broad stone-and-hide lecture hall, soaring central
 * hide-and-bone dome & sky-spire reaching y=4, flanked by two tall waving red-ochre banners.
 */
function buildAcademy(): HTMLCanvasElement[] {
  return [0, 1].map((frame) => {
    const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

    // Megalithic boulder courtyard with red-ochre ritual pavement
    isoDiamond(ctx, 32, 48, 30, DIRT_DARK, OUT);
    isoDiamond(ctx, 32, 48, 26, FUR_MID, OCHRE_RED);
    isoDiamond(ctx, 32, 48, 20, DIRT_LIGHT, BONE_MID);

    // Front courtyard standing-stone gate pillars
    isoBox(ctx, 25, 57, 3, 3, 6, {
      top: BONE_LIGHT,
      left: FUR_DARK,
      right: FUR_LIGHT,
    });
    isoBox(ctx, 39, 57, 3, 3, 6, {
      top: BONE_LIGHT,
      left: FUR_DARK,
      right: FUR_LIGHT,
    });

    // Broad lower megalithic stone sanctuary hall
    const fx = 32;
    const fy = 55;
    isoBox(ctx, fx, fy, 20, 20, 10, {
      top: HIDE_LIGHT,
      left: FUR_DARK,
      right: FUR_MID,
    });
    leftWallRect(ctx, fx, fy, 0, 8, 20, 2, WOOD_DARK);
    rightWallRect(ctx, fx, fy, 0, 8, 20, 2, WOOD_LIGHT);

    // Grand bone-framed entrance & tall torch-lit windows
    rightWallRect(ctx, fx, fy, 3, 1, 5, 7, OUT);
    rightWallRect(ctx, fx, fy, 4, 1, 3, 6, '#261a10');
    for (const v0 of [10, 15]) {
      rightWallRect(ctx, fx, fy, v0, 2, 3, 5, OUT);
      rightWallRect(ctx, fx, fy, v0 + 1, 3, 1, 3, FLAME_CORE);
    }
    for (const u0 of [4, 10, 15]) {
      leftWallRect(ctx, fx, fy, u0, 2, 3, 5, OUT);
      leftWallRect(ctx, fx, fy, u0 + 1, 3, 1, 3, FLAME_MID);
    }

    // Second tier: Tall hide-and-mammoth-rib rotunda dome + towering bone sky-spire (reaches y=4)
    drawHideDome(ctx, 32, 41, 13, 17);
    isoBox(ctx, 32, 23, 6, 6, 9, {
      top: BONE_LIGHT,
      left: BONE_DARK,
      right: BONE_MID,
    });
    rect(ctx, 31, 5, 2, 9, BONE_LIGHT);
    disc(ctx, 32, 5, frame === 0 ? 3 : 2, FLAME_MID);
    px(ctx, 32, 5, FLAME_CORE);

    // Twin tall waving red-ochre & hide shamanic banners on left and right
    const wave = frame % 2;
    for (const [px0, py0] of [
      [14, 22],
      [47, 22],
    ] as const) {
      rect(ctx, px0, py0, 1, 18, OUT);
      rect(ctx, px0 + 1, py0 + 1, 1, 17, WOOD_LIGHT);
      rect(ctx, px0 + 2, py0 + 2 + wave, 5, 7, OUT);
      rect(ctx, px0 + 2, py0 + 3 + wave, 4, 5, OCHRE_RED);
      rect(ctx, px0 + 3, py0 + 4 + wave, 2, 3, BONE_LIGHT);
    }

    return canvas;
  });
}

/**
 * 18. CLINIC: Chalk-Stone & Bleached-Bone Tribal Healer's Hut.
 * Clean pale chalk-stone & white-bone sanctuary with a prominent red-ochre & green-herb
 * healing cross symbol on the front and stone pots of medicinal roots by the door.
 */
function buildClinic(): HTMLCanvasElement[] {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  // Clean swept stone & dirt pad
  isoDiamond(ctx, 32, 48, 27, DIRT_0, OUT);
  isoDiamond(ctx, 32, 48, 22, BONE_MID, FUR_DARK);

  // Clean pale chalk-stone & bleached-bone building body
  const fx = 33;
  const fy = 55;
  const wL = 15;
  const wR = 16;
  const wallH = 11;
  isoBox(ctx, fx, fy, wL, wR, wallH, {
    top: BONE_LIGHT,
    left: BONE_DARK,
    right: BONE_MID,
  });
  // Soothing green-herb & red-ochre trim band along top of wall
  leftWallRect(ctx, fx, fy, 0, wallH - 2, wL, 2, '#3f6e36');
  rightWallRect(ctx, fx, fy, 0, wallH - 2, wR, 2, '#5c944e');

  // Healer's doorway & bright window on right wall
  rightWallRect(ctx, fx, fy, 3, 1, 4, 7, OUT);
  rightWallRect(ctx, fx, fy, 4, 1, 2, 6, '#261a10');
  rightWallRect(ctx, fx, fy, 9, 3, 4, 5, OUT);
  rightWallRect(ctx, fx, fy, 10, 4, 2, 3, FLAME_CORE);

  // Pale bleached-hide roof cap with prominent red-ochre & green healing cross shield
  isoBox(ctx, 33, 44, 12, 13, 4, {
    top: '#ffffff',
    left: BONE_MID,
    right: BONE_LIGHT,
  });
  disc(ctx, 36, 36, 5, OUT);
  disc(ctx, 36, 36, 4, BONE_LIGHT);
  rect(ctx, 35, 33, 3, 7, OCHRE_RED);
  rect(ctx, 33, 35, 7, 3, OCHRE_RED);
  px(ctx, 36, 36, '#7cb342');

  // Stone mortar pots filled with green healing herbs along the front
  for (const [hx, hy] of [
    [25, 54],
    [37, 57],
    [43, 54],
  ] as const) {
    isoBox(ctx, hx, hy, 3, 3, 3, {
      top: FUR_LIGHT,
      left: FUR_DARK,
      right: FUR_MID,
    });
    rect(ctx, hx - 1, hy - 6, 3, 3, '#5c944e');
    px(ctx, hx, hy - 7, OCHRE_RED);
  }

  return [canvas];
}

/**
 * 19. WORKSHOP: Mammoth-Hide Tannery with Hides Stretched on Bone Frames (Cavemen's special good, 3 frames).
 * Work yard with two big lashed bone frames holding taut stretched hides, a stone fleshing/tool bench,
 * stacked crates/bales of cured hides, and a stone curing chimney emitting smoke puffs (3 frames).
 */
function buildWorkshop(): HTMLCanvasElement[] {
  return [0, 1, 2].map((frame) => {
    const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

    // Packed earth & flat stone tannery work yard
    isoDiamond(ctx, 32, 48, 28, DIRT_1, OUT);
    isoDiamond(ctx, 32, 48, 24, DIRT_0, DIRT_DARK);

    // Two large upright mammoth-bone frames with taut hides stretched across them
    for (const [rx, ry, peltCol, peltHi] of [
      [25, 48, HIDE_MID, HIDE_LIGHT],
      [38, 49, '#a65d2e', HIDE_LIGHT],
    ] as const) {
      // Bleached bone side posts & top/bottom bone crossbars
      rect(ctx, rx - 6, ry - 14, 2, 14, OUT);
      rect(ctx, rx - 5, ry - 14, 1, 13, BONE_LIGHT);
      rect(ctx, rx + 4, ry - 12, 2, 14, OUT);
      rect(ctx, rx + 5, ry - 12, 1, 13, BONE_MID);
      rect(ctx, rx - 6, ry - 13, 12, 2, BONE_LIGHT);
      rect(ctx, rx - 6, ry - 3, 12, 2, BONE_MID);

      // Stretched animal hide laced inside the bone frame with corner thongs
      px(ctx, rx - 4, ry - 11, BONE_LIGHT);
      px(ctx, rx + 3, ry - 11, BONE_LIGHT);
      px(ctx, rx - 4, ry - 4, BONE_LIGHT);
      px(ctx, rx + 3, ry - 4, BONE_LIGHT);
      rect(ctx, rx - 4, ry - 10, 8, 6, OUT);
      rect(ctx, rx - 3, ry - 9, 6, 4, peltCol);
      rect(ctx, rx - 2, ry - 8, 3, 2, peltHi);
    }

    // Rough-stone & log scraping tool bench in front-left with flint scraper
    isoBox(ctx, 27, 57, 6, 9, 4, {
      top: WOOD_LIGHT,
      left: FUR_DARK,
      right: FUR_MID,
    });
    rect(ctx, 26, 51, 4, 2, HIDE_LIGHT);
    rect(ctx, 30 + (frame % 2), 50, 2, 2, BONE_LIGHT); // moving bone/flint scraper

    // Crates & tied bales of finished hides on front-right
    isoBox(ctx, 41, 57, 6, 6, 4, {
      top: HIDE_LIGHT,
      left: WOOD_DARK,
      right: HIDE_MID,
    });
    isoBox(ctx, 46, 54, 5, 5, 3, {
      top: HIDE_MID,
      left: HIDE_DARK,
      right: HIDE_LIGHT,
    });

    // Back stone hide-smoking chimney pot with rising smoke puffs (3 frames)
    isoBox(ctx, 31, 42, 5, 5, 9, {
      top: FUR_LIGHT,
      left: FUR_DARK,
      right: FUR_MID,
    });
    const yOff = frame * 2;
    disc(ctx, 31, 29 - yOff, 3, FUR_DARK);
    disc(ctx, 32, 24 - yOff, 3, FUR_MID);
    disc(ctx, 34, 19 - yOff, 2, FUR_LIGHT);

    return canvas;
  });
}

/** 16x24 stone-age villager with shaggy hair, bone hairpin, fur pelt tunic, wooden club, and bare feet at row 23. */
function buildCitizen(frame: number, variant: number): HTMLCanvasElement {
  const [canvas, ctx] = makeCanvas(16, 24);
  const peltCols = [HIDE_MID, FUR_MID, OCHRE_RED, '#8d6e63'] as const;
  const pelt = peltCols[variant & 3]!;
  const skin = variant % 2 === 0 ? '#d2996c' : '#b87d52';
  const step = frame & 3;
  const leftLegY = step === 1 ? 19 : 20;
  const rightLegY = step === 3 ? 19 : 20;

  // Shaggy dark hair + white bone hairpin at top
  rect(ctx, 4, 2, 8, 6, OUT);
  rect(ctx, 5, 3, 6, 4, '#2b1d12');
  rect(ctx, 5, 1, 6, 2, OUT);
  rect(ctx, 6, 1, 4, 1, BONE_LIGHT);

  // Head / face
  rect(ctx, 5, 6, 6, 5, OUT);
  rect(ctx, 6, 6, 4, 4, skin);
  px(ctx, 7, 7, OUT); // eye
  px(ctx, 9, 7, OUT);

  // One-shoulder animal pelt tunic & bare chest shoulder
  rect(ctx, 4, 10, 8, 9, OUT);
  rect(ctx, 5, 11, 6, 7, pelt);
  rect(ctx, 5, 11, 2, 3, skin); // bare shoulder
  // Jagged fur hem & bone belt
  rect(ctx, 5, 15, 6, 1, BONE_MID);
  px(ctx, 6, 18, OUT);
  px(ctx, 8, 18, OUT);

  // Wooden club held in right hand
  const clubY = step % 2 === 0 ? 9 : 8;
  rect(ctx, 11, clubY, 3, 8, OUT);
  rect(ctx, 12, clubY + 1, 1, 6, WOOD_LIGHT);
  rect(ctx, 11, clubY + 1, 2, 3, WOOD_MID);

  // Bare legs & feet touching bottom row (y = 23)
  rect(ctx, 5, leftLegY, 3, 24 - leftLegY, OUT);
  rect(ctx, 6, leftLegY, 1, 23 - leftLegY, skin);
  rect(ctx, 5, 22, 2, 2, skin);

  rect(ctx, 8, rightLegY, 3, 24 - rightLegY, OUT);
  rect(ctx, 9, rightLegY, 1, 23 - rightLegY, skin);
  rect(ctx, 9, 22, 2, 2, skin);

  return canvas;
}

export const art: ArcArt = {
  ground: buildGround,
  foundation: buildFoundation,
  citizen: buildCitizen,
  buildings: {
    house: buildHouse,
    shop: buildShop,
    barracks: buildBarracks,
    tower: buildTower,
    farm: buildFarm,
    school: buildSchool,
    factory: buildFactory,
    lumber: buildLumber,
    mine: buildMine,
    park: buildPark,
    tree: buildTree,
    lamp: buildLamp,
    fountain: buildFountain,
    statue: buildStatue,
    rowhouse: buildRowhouse,
    manor: buildManor,
    stall: buildStall,
    tavern: buildTavern,
    bank: buildBank,
    library: buildLibrary,
    academy: buildAcademy,
    clinic: buildClinic,
    workshop: buildWorkshop,
  },
};
