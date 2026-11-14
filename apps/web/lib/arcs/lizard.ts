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

// LIZARD PALETTE: teal, ochre, terracotta, amber, bone, swamp mud & dry reed thatch
const TEAL_DARK = '#1f7a7e'; // oasis turquoise (was #13494d, too dark on the sand)
const TEAL_MID = '#2a9aa0';
const TEAL_LIGHT = '#359ca3';
const TEAL_BRIGHT = '#62d8de';
const OCHRE_DARK = '#7d5628';
const OCHRE_MID = '#ad7b3b';
const OCHRE_LIGHT = '#dba358';
const TERRA_DARK = '#6e331e';
const TERRA_MID = '#9c4b2e';
const TERRA_LIGHT = '#c96844';
const AMBER_DARK = '#b86514';
const AMBER_MID = '#eb9421';
const AMBER_BRIGHT = '#ffd059';
const VENOM_GLOW = '#76ff9b';
const BONE_DARK = '#8f8674';
const BONE_MID = '#bfb59f';
const BONE_LIGHT = '#ebe3d2';
const MUD_DARK = '#8a6a3e'; // sun-baked sandstone (was dark swamp mud)
const MUD_MID = '#b38d55';
const REED_DARK = '#6b5a35';
const REED_LIGHT = '#9e8852';

/** Draw a teal-and-amber reptile scale pattern frieze along the left and right walls of an isoBox. */
function drawScaleTrim(
  ctx: CanvasRenderingContext2D,
  fx: number,
  fy: number,
  wL: number,
  wR: number,
  z0: number,
): void {
  leftWallRect(ctx, fx, fy, 1, z0, wL - 2, 2, TEAL_DARK);
  rightWallRect(ctx, fx, fy, 1, z0, wR - 2, 2, TEAL_MID);
  for (let u = 2; u < wL - 2; u += 2) {
    leftWallRect(ctx, fx, fy, u, z0 + (u & 1), 1, 1, TEAL_LIGHT);
  }
  for (let v = 2; v < wR - 2; v += 2) {
    rightWallRect(ctx, fx, fy, v, z0 + 1, 1, 1, TEAL_BRIGHT);
    if (v % 4 === 0) rightWallRect(ctx, fx, fy, v, z0, 1, 1, AMBER_BRIGHT);
  }
}

/** Draw a carved lizard-and-skull totem pole rooted at (bx, by). */
function drawTotemPole(ctx: CanvasRenderingContext2D, bx: number, by: number, h = 12): void {
  rect(ctx, bx - 1, by - h, 3, h + 1, OUT);
  rect(ctx, bx, by - h, 1, h, OCHRE_MID);
  // Teal & terracotta painted totem segments
  for (let z = 2; z < h - 2; z += 3) {
    px(ctx, bx, by - z, z % 2 === 0 ? TEAL_BRIGHT : TERRA_LIGHT);
  }
  // Horned bleached bone skull at top of pole
  rect(ctx, bx - 2, by - h - 2, 5, 3, OUT);
  rect(ctx, bx - 1, by - h - 2, 3, 2, BONE_LIGHT);
  px(ctx, bx - 2, by - h - 3, BONE_MID); // left horn
  px(ctx, bx + 2, by - h - 3, BONE_MID); // right horn
  px(ctx, bx, by - h - 1, AMBER_BRIGHT); // glowing amber eye
}

/** Draw a sagging rope-and-plank bridge between (x0, y0) and (x1, y1). */
function drawRopeBridge(
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
): void {
  const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = Math.round(x0 + (x1 - x0) * t);
    const sag = Math.round(Math.sin(t * Math.PI) * 2);
    const y = Math.round(y0 + (y1 - y0) * t) + sag;
    // Rope handrails & wooden plank slats
    px(ctx, x, y - 2, REED_LIGHT);
    rect(ctx, x, y, 2, 2, i % 2 === 0 ? OCHRE_DARK : MUD_DARK);
    px(ctx, x, y + 1, OUT);
  }
}

/** Ground tile: dry scrub-ochre grass patches with dark muddy swamp puddles and reeds. */
function buildLizardGround(parity: 0 | 1, variant: number): HTMLCanvasElement {
  const [canvas, ctx] = makeCanvas(SPRITE_W, TILE_H);
  const base = parity === 0 ? '#5c5432' : '#524b2c';
  const dryPatch = parity === 0 ? '#78683c' : '#6b5d35';
  const mud = parity === 0 ? '#3d3122' : '#362b1e';
  const border = '#2b2318';

  isoDiamond(ctx, 32, 16, 32, base, border);

  for (let u = 2; u < 30; u++) {
    for (let v = 2; v < 30; v++) {
      const h = tileHash(u, v, variant * 23 + parity * 13 + 9);
      const r = h % 26;
      if (r === 0 || r === 1 || r === 2) {
        isoTexel(ctx, 32, 0, u, v, dryPatch);
      } else if (r === 3 || r === 4) {
        isoTexel(ctx, 32, 0, u, v, mud);
      }
    }
  }

  if (variant === 1) {
    // Muddy swamp puddle with teal-tinted sheen and standing reeds
    for (let u = 12; u <= 18; u++) {
      for (let v = 13; v <= 18; v++) {
        isoTexel(ctx, 32, 0, u, v, (u + v) % 3 === 0 ? TEAL_DARK : MUD_DARK);
      }
    }
    // Tall swamp reeds at puddle edge
    rect(ctx, 31, 11, 1, 4, REED_LIGHT);
    px(ctx, 31, 10, TERRA_MID); // cattail head
    rect(ctx, 34, 12, 1, 3, TEAL_MID);
  } else if (variant === 2) {
    // Dry grass tufts and reed stalks
    const tufts = [
      [10, 14],
      [21, 11],
      [15, 22],
    ] as const;
    for (const [u, v] of tufts) {
      const sx = 32 + (u - v);
      const sy = (u + v) >> 1;
      rect(ctx, sx, sy - 2, 1, 3, REED_LIGHT);
      px(ctx, sx - 1, sy - 1, OCHRE_LIGHT);
      px(ctx, sx + 1, sy - 1, REED_DARK);
    }
  } else if (variant === 3) {
    // Bleached desert bone fragments & ochre stones
    const bones = [
      [11, 19],
      [22, 13],
    ] as const;
    for (const [u, v] of bones) {
      const sx = 32 + (u - v);
      const sy = (u + v) >> 1;
      rect(ctx, sx - 1, sy, 3, 1, BONE_LIGHT);
      px(ctx, sx, sy + 1, BONE_DARK);
    }
  }

  return canvas;
}

/** Foundation pad: sun-baked adobe mud-brick platform with teal scale border. */
function buildLizardFoundation(): HTMLCanvasElement {
  const [canvas, ctx] = makeCanvas(SPRITE_W, TILE_H);
  isoDiamond(ctx, 32, 16, 32, MUD_MID, MUD_DARK);
  isoDiamond(ctx, 32, 16, 26, OCHRE_DARK, TEAL_DARK);
  isoDiamond(ctx, 32, 16, 20, TERRA_MID, OCHRE_MID);
  return canvas;
}

/**
 * 1. HOUSE: Sun-Baked Stepped Adobe Hut with Reed Thatch & Skull Totem.
 * Two-tier adobe brick dwelling with projecting wooden vigas, teal scale-pattern frieze,
 * thick stepped reed-thatch cap, and a horned skull totem pole outside.
 */
function buildLizardHouse(): HTMLCanvasElement[] {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  // Sun-baked mud & sandstone pad
  isoDiamond(ctx, 32, 48, 26, MUD_MID, OUT);
  isoDiamond(ctx, 32, 48, 21, OCHRE_DARK, MUD_DARK);

  // Lower stepped adobe hut body (terracotta & ochre mud-brick)
  const fx = 32;
  const fy = 56;
  const wL = 16;
  const wR = 18;
  const wallH = 11;
  isoBox(ctx, fx, fy, wL, wR, wallH, {
    top: OCHRE_LIGHT,
    left: TERRA_DARK,
    right: TERRA_MID,
  });

  // Teal & amber scale-pattern trim around the adobe wall
  drawScaleTrim(ctx, fx, fy, wL, wR, wallH - 4);

  // Projecting wooden roof beam ends (vigas) along right and left walls
  for (const v of [3, 8, 13]) {
    rightWallRect(ctx, fx, fy, v, wallH - 1, 1, 1, MUD_DARK);
  }
  for (const u of [3, 8, 13]) {
    leftWallRect(ctx, fx, fy, u, wallH - 1, 1, 1, MUD_DARK);
  }

  // Trapezoidal hide-curtain doorway on right wall
  rightWallRect(ctx, fx, fy, 4, 1, 5, 7, OUT);
  rightWallRect(ctx, fx, fy, 5, 1, 3, 6, TEAL_DARK);
  rightWallRect(ctx, fx, fy, 5, 5, 3, 2, AMBER_MID); // painted hide flap top

  // Upper stepped adobe tier + thick bundled reed-thatch roof
  isoBox(ctx, 32, 45, 12, 14, 5, {
    top: OCHRE_LIGHT,
    left: OCHRE_DARK,
    right: OCHRE_MID,
  });
  isoBox(ctx, 32, 40, 14, 16, 3, {
    top: REED_LIGHT,
    left: REED_DARK,
    right: OCHRE_MID,
  });
  isoBox(ctx, 32, 37, 10, 12, 3, {
    top: REED_LIGHT,
    left: REED_DARK,
    right: OCHRE_LIGHT,
  });

  // Horned skull totem pole planted in front-right yard
  drawTotemPole(ctx, 47, 52, 12);

  return [canvas];
}

/**
 * 2. SHOP: Raider Adobe Trading Post & Reed-Shade Canopy.
 * Stepped ochre adobe bunker paired with a slanted reed-thatch awning on bone poles,
 * teal scale trade rug, amber venom jars, and totem pole.
 */
function buildLizardShop(): HTMLCanvasElement[] {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  // Packed mud & ochre adobe market pad
  isoDiamond(ctx, 32, 48, 27, MUD_MID, OUT);
  isoDiamond(ctx, 32, 48, 22, OCHRE_DARK, TERRA_DARK);

  // Back-left stepped adobe storehouse
  const fx = 28;
  const fy = 52;
  const wL = 14;
  const wR = 14;
  const wallH = 13;
  isoBox(ctx, fx, fy, wL, wR, wallH, {
    top: TERRA_LIGHT,
    left: TERRA_DARK,
    right: TERRA_MID,
  });
  drawScaleTrim(ctx, fx, fy, wL, wR, wallH - 3);
  // Stepped ziggurat crown on storehouse
  isoBox(ctx, fx, fy - wallH, 10, 10, 4, {
    top: OCHRE_LIGHT,
    left: OCHRE_DARK,
    right: OCHRE_MID,
  });

  // Front-right woven reed-thatch canopy supported by bleached bone poles
  rect(ctx, 36, 42, 2, 13, BONE_LIGHT);
  rect(ctx, 45, 38, 2, 12, BONE_MID);
  isoBox(ctx, 38, 44, 10, 12, 3, {
    top: REED_LIGHT,
    left: REED_DARK,
    right: OCHRE_MID,
  });

  // Teal scale-patterned trade rug & amber/bone raid spoils on display
  isoBox(ctx, 38, 56, 8, 10, 2, {
    top: TEAL_MID,
    left: TEAL_DARK,
    right: TEAL_LIGHT,
  });
  rect(ctx, 36, 51, 2, 3, AMBER_BRIGHT); // glowing amber jar
  rect(ctx, 39, 49, 2, 3, TERRA_LIGHT); // clay amphora
  rect(ctx, 42, 48, 3, 2, BONE_LIGHT); // carved skull trophy

  drawTotemPole(ctx, 16, 50, 11);

  return [canvas];
}

/**
 * 3. BARRACKS: Snake-Pit Arena.
 * Sunken venomous pit surrounded by a stepped terracotta-and-ochre adobe arena wall,
 * bone spikes around the rim, a rope bridge spanning the pit, and writhing vipers / flame (2 frames).
 */
function buildLizardBarracks(): HTMLCanvasElement[] {
  return [0, 1].map((frame) => {
    const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

    // Outer blood-terracotta & mud arena base
    isoDiamond(ctx, 32, 48, 29, MUD_DARK, OUT);

    // Stepped adobe arena perimeter wall
    const fx = 32;
    const fy = 58;
    isoBox(ctx, fx, fy, 22, 22, 9, {
      top: OCHRE_LIGHT,
      left: TERRA_DARK,
      right: TERRA_MID,
    });
    drawScaleTrim(ctx, fx, fy, 22, 22, 5);

    // Sunken dark snake-pit interior hollowed into the top of the arena
    isoDiamond(ctx, 32, 38, 16, OUT);
    isoDiamond(ctx, 32, 39, 14, '#182624');
    isoDiamond(ctx, 32, 40, 11, TEAL_DARK);

    // Coiled teal & amber pit vipers writhing inside the pit (shifts with frame)
    const shift = frame % 2;
    rect(ctx, 28 + shift, 38, 4, 2, TEAL_BRIGHT);
    px(ctx, 31 + shift, 37, AMBER_BRIGHT); // snake eyes/fangs
    rect(ctx, 33 - shift, 40, 4, 2, VENOM_GLOW);
    px(ctx, 33 - shift, 39, AMBER_MID);

    // Bleached bone spikes lining the arena parapet rim
    for (const [bx, by] of [
      [16, 36],
      [22, 33],
      [42, 33],
      [48, 36],
      [24, 44],
      [40, 44],
    ] as const) {
      rect(ctx, bx, by - 3, 2, 4, OUT);
      rect(ctx, bx, by - 3, 1, 3, BONE_LIGHT);
    }

    // Rope suspension bridge spanning across the snake pit
    drawRopeBridge(ctx, 21, 37, 43, 37);

    // Twin serpent totem pillars at the back of the arena with flickering amber war braziers
    isoBox(ctx, 26, 31, 4, 4, 9, {
      top: TERRA_LIGHT,
      left: TERRA_DARK,
      right: OCHRE_MID,
    });
    isoBox(ctx, 38, 31, 4, 4, 9, {
      top: TERRA_LIGHT,
      left: TERRA_DARK,
      right: OCHRE_MID,
    });
    disc(ctx, 26, 20, 2 + shift, AMBER_BRIGHT);
    px(ctx, 26, 19, VENOM_GLOW);
    disc(ctx, 38, 20, 3 - shift, AMBER_BRIGHT);
    px(ctx, 38, 19, VENOM_GLOW);

    return canvas;
  });
}

/**
 * 4. TOWER: Tall Stepped Obelisk with Venom Brazier.
 * 4-stage tapering stepped ziggurat/obelisk in ochre & terracotta with teal scale bands,
 * bone horn projections, and a summit brazier burning with green-amber venom fire (3 frames).
 */
function buildLizardTower(): HTMLCanvasElement[] {
  return [0, 1, 2].map((frame) => {
    const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

    // Stepped mud-and-ochre foundation pad
    isoDiamond(ctx, 32, 48, 27, MUD_DARK, OUT);
    isoDiamond(ctx, 32, 48, 23, TERRA_DARK, TEAL_DARK);

    // Tier 1: Wide ziggurat base with bone corner horns
    isoBox(ctx, 32, 57, 18, 18, 7, {
      top: OCHRE_LIGHT,
      left: TERRA_DARK,
      right: TERRA_MID,
    });
    drawScaleTrim(ctx, 32, 57, 18, 18, 3);
    // Arched temple entrance at base
    rightWallRect(ctx, 32, 57, 6, 1, 5, 5, OUT);
    rightWallRect(ctx, 32, 57, 7, 1, 3, 4, MUD_DARK);

    // Tier 2: Stepped middle obelisk body
    isoBox(ctx, 32, 50, 14, 14, 9, {
      top: OCHRE_LIGHT,
      left: OCHRE_DARK,
      right: OCHRE_MID,
    });
    drawScaleTrim(ctx, 32, 50, 14, 14, 5);

    // Tier 3: Narrower upper obelisk shaft
    isoBox(ctx, 32, 41, 10, 10, 10, {
      top: TERRA_LIGHT,
      left: TERRA_DARK,
      right: TERRA_MID,
    });
    leftWallRect(ctx, 32, 41, 3, 3, 4, 5, TEAL_DARK);
    rightWallRect(ctx, 32, 41, 3, 3, 4, 5, TEAL_BRIGHT);

    // Tier 4: Crown altar & bone horn projections
    isoBox(ctx, 32, 31, 8, 8, 5, {
      top: BONE_LIGHT,
      left: BONE_DARK,
      right: BONE_MID,
    });
    rect(ctx, 22, 23, 3, 2, BONE_LIGHT); // left bone horn
    rect(ctx, 39, 23, 3, 2, BONE_LIGHT); // right bone horn

    // Animated bubbling venom & amber flame brazier at the summit (y = 10..22)
    const flameH = frame === 0 ? 7 : frame === 1 ? 9 : 6;
    disc(ctx, 32, 20, 5, OUT);
    disc(ctx, 32, 20, 4, TEAL_MID);
    rect(ctx, 29, 20 - flameH, 6, flameH, TEAL_BRIGHT);
    rect(ctx, 30, 21 - flameH, 4, flameH - 1, VENOM_GLOW);
    rect(ctx, 31, 22 - flameH, 2, flameH - 2, AMBER_BRIGHT);
    // Rising venom sparks
    px(ctx, 29 + frame, 10, VENOM_GLOW);
    px(ctx, 34 - frame, 8, AMBER_BRIGHT);

    return canvas;
  });
}

/**
 * 5. FARM: Swamp Reed-Paddy & Amber Gourd Bog.
 * Waterlogged teal-mud bog plots divided by adobe dikes, spanned by a rope plank bridge,
 * tall swamp reeds, glowing amber marsh-gourds, and a reed-thatched mud storage hut.
 */
function buildLizardFarm(): HTMLCanvasElement[] {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  // Muddy swamp border & flooded teal-mud paddy field
  isoDiamond(ctx, 32, 48, 28, MUD_DARK, OUT);
  for (let u = 3; u < 29; u++) {
    for (let v = 3; v < 29; v++) {
      const isDike = u === 14 || u === 15 || v % 6 === 0;
      const col = isDike ? OCHRE_DARK : (u + v) % 2 === 0 ? TEAL_DARK : '#2a8a8e';
      isoTexel(ctx, 32, 32, u, v, col);
    }
  }

  // Clumps of swamp reeds & glowing amber marsh-gourds in the bog rows
  for (const rowU of [7, 11, 19, 24]) {
    const isGourd = rowU === 11 || rowU === 24;
    for (let v = 5; v < 27; v += 3) {
      const sx = 32 + (rowU - v);
      const sy = 32 + ((rowU + v) >> 1);
      if (isGourd) {
        rect(ctx, sx - 1, sy - 2, 2, 2, TEAL_MID);
        rect(ctx, sx - 1, sy - 3, 2, 2, AMBER_MID);
        px(ctx, sx, sy - 3, AMBER_BRIGHT);
      } else {
        rect(ctx, sx, sy - 4, 1, 4, REED_LIGHT);
        px(ctx, sx, sy - 5, TERRA_MID);
        rect(ctx, sx + 1, sy - 3, 1, 3, TEAL_LIGHT);
      }
    }
  }

  // Small stepped adobe & reed-thatch mud hut on back-left (front-bottom at (25, 47))
  isoBox(ctx, 25, 47, 9, 9, 7, {
    top: OCHRE_LIGHT,
    left: TERRA_DARK,
    right: TERRA_MID,
  });
  isoBox(ctx, 25, 40, 11, 11, 3, {
    top: REED_LIGHT,
    left: REED_DARK,
    right: OCHRE_MID,
  });

  // Low rope-and-plank walkway across the central bog dike
  drawRopeBridge(ctx, 27, 50, 39, 46);

  return [canvas];
}

/**
 * 6. SCHOOL: Shamanic Stepped Ziggurat of the Sun-Serpent.
 * 3-stepped ochre-and-terracotta ziggurat with exterior front-right ceremonial staircase,
 * teal scale-carved lore tablets, totem poles, and a pulsing amber sun-disc at the summit (2 frames).
 */
function buildLizardSchool(): HTMLCanvasElement[] {
  return [0, 1].map((frame) => {
    const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

    // Sun-baked ochre plaza
    isoDiamond(ctx, 32, 48, 28, MUD_DARK, OUT);
    isoDiamond(ctx, 32, 48, 24, OCHRE_DARK, TERRA_DARK);

    // Ziggurat Step 1 (wide base)
    isoBox(ctx, 32, 57, 20, 20, 6, {
      top: OCHRE_LIGHT,
      left: TERRA_DARK,
      right: TERRA_MID,
    });
    drawScaleTrim(ctx, 32, 57, 20, 20, 2);

    // Ziggurat Step 2 (middle terrace)
    isoBox(ctx, 32, 51, 14, 14, 6, {
      top: OCHRE_LIGHT,
      left: OCHRE_DARK,
      right: OCHRE_MID,
    });
    drawScaleTrim(ctx, 32, 51, 14, 14, 2);

    // Ziggurat Step 3 (summit sanctuary)
    isoBox(ctx, 32, 45, 8, 8, 6, {
      top: TERRA_LIGHT,
      left: TERRA_DARK,
      right: TERRA_MID,
    });

    // Stepped ceremonial stone staircase ascending the front-right face across all 3 tiers
    for (let s = 0; s < 14; s++) {
      rightWallRect(ctx, 32, 57, 4, s + 1, 4, 1, s % 2 === 0 ? BONE_LIGHT : OCHRE_LIGHT);
    }

    // Carved teal serpent tablets & pulsing amber sun-disc at summit
    rect(ctx, 29, 31, 6, 6, OUT);
    rect(ctx, 30, 32, 4, 4, TEAL_MID);
    disc(ctx, 32, 26, frame === 0 ? 4 : 5, OUT);
    disc(ctx, 32, 26, frame === 0 ? 3 : 4, AMBER_BRIGHT);
    px(ctx, 32, 26, VENOM_GLOW);

    // Flanking skull totem poles at base of staircase
    drawTotemPole(ctx, 16, 51, 10);
    drawTotemPole(ctx, 48, 51, 10);

    return canvas;
  });
}

/**
 * 7. FACTORY: Venom-Distillery & Twin Adobe Beehive Kilns.
 * Two stepped adobe smelter kilns connected by a rope bridge, a bubbling teal-venom vat,
 * bone condenser pipes, and rising green-amber alchemical fumes (3 frames).
 */
function buildLizardFactory(): HTMLCanvasElement[] {
  return [0, 1, 2].map((frame) => {
    const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

    // Mud & scorched adobe industrial yard
    isoDiamond(ctx, 32, 48, 28, MUD_DARK, OUT);
    isoDiamond(ctx, 32, 48, 24, MUD_MID, TERRA_DARK);

    // Back-left stepped adobe kiln #1 (tall venom smelter)
    isoBox(ctx, 24, 50, 12, 12, 10, {
      top: TERRA_LIGHT,
      left: TERRA_DARK,
      right: TERRA_MID,
    });
    drawScaleTrim(ctx, 24, 50, 12, 12, 6);
    isoBox(ctx, 24, 40, 8, 8, 7, {
      top: OCHRE_LIGHT,
      left: OCHRE_DARK,
      right: OCHRE_MID,
    });
    isoBox(ctx, 24, 33, 5, 5, 5, {
      top: MUD_DARK,
      left: TERRA_DARK,
      right: TERRA_MID,
    });

    // Right stepped adobe kiln #2
    isoBox(ctx, 40, 52, 10, 10, 9, {
      top: OCHRE_LIGHT,
      left: TERRA_DARK,
      right: TERRA_MID,
    });
    isoBox(ctx, 40, 43, 7, 7, 6, {
      top: TERRA_LIGHT,
      left: OCHRE_DARK,
      right: OCHRE_MID,
    });
    // Glowing furnace mouth on kiln #2
    rightWallRect(ctx, 40, 52, 3, 1, 4, 5, OUT);
    rightWallRect(ctx, 40, 52, 4, 1, 2, 4, frame === 1 ? AMBER_BRIGHT : AMBER_MID);

    // Rope suspension catwalk connecting the two kilns
    drawRopeBridge(ctx, 25, 36, 39, 39);

    // Front bubbling green-teal venom vat in adobe rim
    isoBox(ctx, 31, 58, 9, 9, 4, {
      top: BONE_MID,
      left: MUD_DARK,
      right: OCHRE_DARK,
    });
    isoDiamond(ctx, 31, 51, 6, frame % 2 === 0 ? TEAL_BRIGHT : VENOM_GLOW, OUT);
    // Bone pipe feeding from kiln into venom vat
    rect(ctx, 26, 46, 5, 2, BONE_LIGHT);

    // Rising venomous green & amber fume clouds from kiln #1 chimney (center ~(24, 24))
    const puffs: readonly (readonly [number, number, number, number])[] =
      frame === 0
        ? [
            [23, 22, 4, 2],
            [25, 17, 5, 3],
            [27, 12, 3, 2],
          ]
        : frame === 1
          ? [
              [24, 20, 4, 3],
              [26, 15, 5, 3],
              [29, 10, 3, 2],
            ]
          : [
              [23, 23, 3, 2],
              [24, 18, 5, 2],
              [27, 13, 4, 3],
            ];
    for (const [px0, py0, pw, ph] of puffs) {
      rect(ctx, px0 - 1, py0, pw + 2, ph, TEAL_DARK);
      rect(ctx, px0, py0 - 1, pw, ph + 1, TEAL_BRIGHT);
      rect(ctx, px0 + 1, py0, Math.max(1, pw - 2), Math.max(1, ph - 1), VENOM_GLOW);
    }

    return canvas;
  });
}

/**
 * 8. LUMBER: Swamp Mangrove & Reed Harvesting Camp.
 * Muddy bog dock on stilts with a rope bridge, reed-thatched splitting shed,
 * stacked bundles of golden swamp reeds & mangrove timber, and animated bone-saw (2 frames).
 */
function buildLizardLumber(): HTMLCanvasElement[] {
  return [0, 1].map((frame) => {
    const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

    // Swamp mud & teal bog water pad
    isoDiamond(ctx, 32, 48, 27, MUD_DARK, OUT);
    isoDiamond(ctx, 32, 48, 22, TEAL_DARK, MUD_MID);

    // Elevated adobe & timber platform on stilts (back-left)
    isoBox(ctx, 27, 51, 13, 13, 8, {
      top: OCHRE_LIGHT,
      left: TERRA_DARK,
      right: TERRA_MID,
    });
    drawScaleTrim(ctx, 27, 51, 13, 13, 4);
    // Stepped reed-thatch canopy over shed
    isoBox(ctx, 27, 43, 15, 15, 3, {
      top: REED_LIGHT,
      left: REED_DARK,
      right: OCHRE_MID,
    });
    isoBox(ctx, 27, 40, 10, 10, 3, {
      top: REED_LIGHT,
      left: REED_DARK,
      right: OCHRE_LIGHT,
    });

    // Rope bridge linking the shed to the front-right reed-bundling dock
    drawRopeBridge(ctx, 31, 49, 42, 52);

    // Stacked bundles of harvested swamp reeds & mangrove logs on right
    for (let i = 0; i < 3; i++) {
      isoBox(ctx, 43, 56 - i * 3, 5, 7, 2, {
        top: i % 2 === 0 ? REED_LIGHT : OCHRE_MID,
        left: MUD_DARK,
        right: REED_DARK,
      });
    }

    // Bone-toothed saw frame cutting a mangrove log on left (shifts with frame)
    rect(ctx, 15 + frame, 45, 7, 2, BONE_LIGHT);
    for (let x = 15 + frame; x < 22 + frame; x += 2) {
      px(ctx, x, 47, BONE_DARK); // saw teeth
    }

    return canvas;
  });
}

/**
 * 9. MINE: Open-Cast Sandstone & Amber Quarry Pit with Bone-Hoist Derrick.
 * Stepped sunken ochre quarry pit in the ground diamond, spanned by a rope bridge
 * and a lashed timber-and-bone A-frame crane hoisting glowing amber ore (2 frames).
 */
function buildLizardMine(): HTMLCanvasElement[] {
  return [0, 1].map((frame) => {
    const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

    // Outer sandstone & mud quarry rim
    isoDiamond(ctx, 32, 48, 28, OCHRE_DARK, OUT);
    isoDiamond(ctx, 32, 48, 24, TERRA_MID, MUD_DARK);

    // Stepped sunken open-cast quarry pit in center
    isoDiamond(ctx, 32, 49, 18, TERRA_DARK, OUT);
    isoDiamond(ctx, 32, 50, 13, MUD_DARK, OUT);
    isoDiamond(ctx, 32, 51, 8, '#1b1612');

    // Rope bridge spanning across the quarry pit
    drawRopeBridge(ctx, 20, 48, 44, 48);

    // Lashed bone-and-timber A-frame hoist derrick straddling the pit
    for (let t = 0; t < 18; t++) {
      const dx = Math.floor(t / 3);
      rect(ctx, 24 + dx, 46 - t, 2, 2, OUT);
      px(ctx, 25 + dx, 46 - t, BONE_LIGHT);
      rect(ctx, 38 - dx, 46 - t, 2, 2, OUT);
      px(ctx, 38 - dx, 46 - t, OCHRE_LIGHT);
    }
    // Crossbar & hanging hoist rope with amber ore bucket
    rect(ctx, 27, 28, 10, 2, BONE_LIGHT);
    const ropeLen = frame === 0 ? 10 : 13;
    rect(ctx, 32, 30, 1, ropeLen, REED_LIGHT);
    isoBox(ctx, 32, 30 + ropeLen + 3, 4, 4, 3, {
      top: AMBER_BRIGHT,
      left: AMBER_DARK,
      right: AMBER_MID,
    });

    // Glowing amber & teal mineral veins exposed in the quarry walls
    px(ctx, 25, 49, frame === 0 ? AMBER_BRIGHT : VENOM_GLOW);
    px(ctx, 39, 49, frame === 0 ? TEAL_BRIGHT : AMBER_BRIGHT);
    px(ctx, 32, 53, AMBER_BRIGHT);

    return canvas;
  });
}

/**
 * 10. PARK: Totem Boneyard & Bubbling Mud-Spring Oasis.
 * Warm teal-green bubbling swamp spring surrounded by dry scrub grass, reeds,
 * a rope boardwalk bridge, and three painted lizard skull totem poles (2 frames).
 */
function buildLizardPark(): HTMLCanvasElement[] {
  return [0, 1].map((frame) => {
    const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

    // Dry ochre scrub & mud oasis pad
    isoDiamond(ctx, 32, 48, 29, MUD_MID, OUT);
    isoDiamond(ctx, 32, 48, 24, '#6b5d35', MUD_DARK);

    // Bubbling teal-and-venom spring pool in the center
    isoDiamond(ctx, 32, 49, 15, TEAL_DARK, OUT);
    isoDiamond(ctx, 32, 49, 10, frame === 0 ? TEAL_MID : TEAL_LIGHT);
    // Spring bubbles
    disc(ctx, 30 + frame * 2, 48, 2, TEAL_BRIGHT);
    px(ctx, 34 - frame, 50, VENOM_GLOW);

    // Rope-lashed plank bridge crossing over the spring
    drawRopeBridge(ctx, 22, 51, 42, 47);

    // Three painted lizard totem poles arranged around the oasis
    drawTotemPole(ctx, 32, 39, 12);
    drawTotemPole(ctx, 18, 47, 10);
    drawTotemPole(ctx, 46, 48, 10);

    // Swamp reed clumps beside the pool
    rect(ctx, 25, 43, 1, 5, REED_LIGHT);
    px(ctx, 25, 42, TERRA_MID);
    rect(ctx, 39, 52, 1, 5, REED_LIGHT);
    px(ctx, 39, 51, TERRA_MID);

    return canvas;
  });
}

/** Decoration: Gnarled swamp mangrove / desert palm on exposed stilt roots in a mud puddle (2 frames). */
function buildLizardTree(): HTMLCanvasElement[] {
  return [0, 1].map((frame) => {
    const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);
    const sway = frame % 2;
    // Muddy puddle & teal water ring
    isoDiamond(ctx, 32, 50, 13, MUD_DARK, OUT);
    isoDiamond(ctx, 32, 50, 9, TEAL_DARK);
    // Arched mangrove stilt roots & knotted ochre-bark trunk
    rect(ctx, 27, 44, 2, 7, MUD_MID);
    rect(ctx, 35, 44, 2, 7, MUD_MID);
    rect(ctx, 30, 33, 4, 15, OUT);
    rect(ctx, 31, 34, 2, 14, OCHRE_DARK);
    // Tufted swamp-teal & dry-reed palm/mangrove crown with hanging moss
    disc(ctx, 32 + sway, 30, 10, OUT);
    disc(ctx, 32 + sway, 30, 9, TEAL_DARK);
    disc(ctx, 27 + sway, 32, 6, TEAL_MID);
    disc(ctx, 37 + sway, 32, 6, '#3b6e4c');
    disc(ctx, 32 + sway, 26, 6, REED_LIGHT);
    // Hanging swamp-moss strands
    rect(ctx, 24 + sway, 34, 1, 5, TEAL_LIGHT);
    rect(ctx, 39 + sway, 34, 1, 5, REED_LIGHT);
    return canvas;
  });
}

/** Decoration: Lashed bone-and-timber totem post holding a skull venom brazier (2 frames). */
function buildLizardLamp(): HTMLCanvasElement[] {
  return [0, 1].map((frame) => {
    const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);
    isoDiamond(ctx, 32, 50, 9, MUD_DARK, OUT);
    drawTotemPole(ctx, 32, 50, 18);
    // Amber & venom flame rising from the skull crown
    const r = frame ? 4 : 3;
    disc(ctx, 32, 26, r, AMBER_BRIGHT);
    disc(ctx, 32, 26, 2, VENOM_GLOW);
    return canvas;
  });
}

/** Decoration: Stepped adobe serpent-head fountain spouting green-teal marsh water (2 frames). */
function buildLizardFountain(): HTMLCanvasElement[] {
  return [0, 1].map((frame) => {
    const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);
    isoDiamond(ctx, 32, 47, 25, TERRA_DARK, OUT);
    isoDiamond(ctx, 32, 47, 20, OCHRE_MID, TEAL_DARK);
    isoDiamond(ctx, 32, 47, 16, frame ? TEAL_MID : TEAL_DARK);
    isoDiamond(ctx, 32, 47, 10, frame ? VENOM_GLOW : TEAL_BRIGHT);
    // Stepped ziggurat serpent pillar in center
    isoBox(ctx, 32, 47, 8, 8, 8, {
      top: OCHRE_LIGHT,
      left: TERRA_DARK,
      right: TERRA_MID,
    });
    isoBox(ctx, 32, 39, 6, 6, 7, {
      top: TEAL_LIGHT,
      left: TEAL_DARK,
      right: TEAL_MID,
    });
    // Bone fangs & spouting venom-green water streams
    px(ctx, 30, 31, BONE_LIGHT);
    px(ctx, 34, 31, BONE_LIGHT);
    const dy = frame ? 0 : 2;
    rect(ctx, 28, 32 + dy, 2, 8, VENOM_GLOW);
    rect(ctx, 34, 32 + dy, 2, 8, TEAL_BRIGHT);
    return canvas;
  });
}

/** Decoration: Carved ochre-and-teal feathered serpent / lizard warlord idol on a stepped plinth. */
function buildLizardStatue(): HTMLCanvasElement[] {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);
  isoDiamond(ctx, 32, 48, 22, MUD_DARK, OUT);
  // Two-step ziggurat plinth
  isoBox(ctx, 32, 57, 14, 14, 5, {
    top: OCHRE_LIGHT,
    left: TERRA_DARK,
    right: TERRA_MID,
  });
  isoBox(ctx, 32, 52, 10, 10, 5, {
    top: TERRA_LIGHT,
    left: OCHRE_DARK,
    right: OCHRE_MID,
  });
  // Coiled teal-and-ochre serpent idol body & wide feathered hood
  disc(ctx, 32, 26, 9, OUT);
  disc(ctx, 32, 26, 8, AMBER_MID);
  disc(ctx, 32, 26, 6, TEAL_LIGHT);
  rect(ctx, 28, 24, 8, 18, OUT);
  rect(ctx, 29, 25, 6, 16, TEAL_MID);
  // Reptilian snout, glowing amber eyes & bone fangs
  rect(ctx, 29, 20, 6, 5, OCHRE_LIGHT);
  px(ctx, 30, 22, AMBER_BRIGHT);
  px(ctx, 33, 22, AMBER_BRIGHT);
  px(ctx, 30, 25, BONE_LIGHT);
  px(ctx, 33, 25, BONE_LIGHT);
  return [canvas];
}

/**
 * 11. ROWHOUSE: Three Joined Stepped-Adobe Mud-Brick Terrace Dwellings.
 * Three narrow adjoining ochre-and-terracotta row homes stepped along the lane,
 * each with its own hide-curtain doorway, upper window, projecting vigas, and reed-thatch cap.
 */
function buildLizardRowhouse(): HTMLCanvasElement[] {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  // Sun-baked mud & ochre lane pad
  isoDiamond(ctx, 32, 48, 28, MUD_DARK, OUT);
  isoDiamond(ctx, 32, 48, 23, MUD_MID, TERRA_DARK);

  // Three narrow joined adobe units stepped along the right-up (v) axis
  const units = [
    [26, 58, TERRA_MID, OCHRE_MID],
    [32, 55, OCHRE_MID, TERRA_LIGHT],
    [38, 52, TERRA_MID, OCHRE_MID],
  ] as const;

  for (const [ufx, ufy, rightCol, topCol] of units) {
    // 2-storey narrow adobe dwelling box
    isoBox(ctx, ufx, ufy, 14, 7, 13, {
      top: OCHRE_LIGHT,
      left: TERRA_DARK,
      right: rightCol,
    });
    // Teal scale frieze across each unit
    leftWallRect(ctx, ufx, ufy, 1, 6, 12, 2, TEAL_DARK);
    rightWallRect(ctx, ufx, ufy, 1, 6, 5, 2, TEAL_MID);
    rightWallRect(ctx, ufx, ufy, 2, 7, 3, 1, TEAL_BRIGHT);

    // Individual ground doorway & upper storey window
    rightWallRect(ctx, ufx, ufy, 1, 1, 3, 5, OUT);
    rightWallRect(ctx, ufx, ufy, 2, 1, 1, 4, MUD_DARK);
    rightWallRect(ctx, ufx, ufy, 2, 4, 1, 1, AMBER_MID);
    rightWallRect(ctx, ufx, ufy, 2, 9, 3, 3, OUT);
    rightWallRect(ctx, ufx, ufy, 3, 10, 1, 1, AMBER_BRIGHT);

    // Individual stepped reed-thatch roof bundle on top of each unit
    isoBox(ctx, ufx, ufy - 13, 12, 6, 3, {
      top: REED_LIGHT,
      left: REED_DARK,
      right: topCol,
    });
  }

  // Projecting wooden vigas on the left end wall
  for (const u0 of [3, 7, 11]) {
    leftWallRect(ctx, 26, 58, u0, 11, 1, 1, MUD_DARK);
    leftWallRect(ctx, 26, 58, u0, 3, 2, 3, OUT);
  }

  // Small skull totem marker at the corner of the row
  drawTotemPole(ctx, 47, 49, 8);

  return [canvas];
}

/**
 * 12. MANOR: Chieftain's Stepped Ziggurat Villa with Bone-Crested Turret & Walled Court.
 * Grand detached terracotta-and-ochre manor with a low adobe courtyard wall, pillared porch,
 * smoking adobe chimney, rich scale-and-amber trim, and a tall stepped corner turret.
 */
function buildLizardManor(): HTMLCanvasElement[] {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  // Adobe compound courtyard pad & low perimeter garden wall
  isoDiamond(ctx, 32, 48, 29, MUD_DARK, OUT);
  isoDiamond(ctx, 32, 48, 25, OCHRE_DARK, TEAL_DARK);
  isoBox(ctx, 32, 60, 16, 3, 3, {
    top: OCHRE_LIGHT,
    left: TERRA_DARK,
    right: TERRA_MID,
  });
  isoBox(ctx, 35, 58, 3, 14, 3, {
    top: OCHRE_LIGHT,
    left: TERRA_DARK,
    right: TERRA_MID,
  });

  // Main detached adobe manor hall
  const fx = 33;
  const fy = 54;
  const wL = 16;
  const wR = 16;
  const wallH = 13;
  isoBox(ctx, fx, fy, wL, wR, wallH, {
    top: OCHRE_LIGHT,
    left: TERRA_DARK,
    right: TERRA_MID,
  });
  drawScaleTrim(ctx, fx, fy, wL, wR, 3);
  drawScaleTrim(ctx, fx, fy, wL, wR, wallH - 3);

  // Projecting front-right bone-pillared porch & grand doorway
  isoBox(ctx, 37, 55, 6, 8, 7, {
    top: REED_LIGHT,
    left: OCHRE_DARK,
    right: OCHRE_MID,
  });
  rightWallRect(ctx, 37, 55, 2, 1, 4, 5, OUT);
  rightWallRect(ctx, 37, 55, 3, 1, 2, 4, TEAL_DARK);
  rightWallRect(ctx, 37, 55, 1, 1, 1, 6, BONE_LIGHT);
  rightWallRect(ctx, 37, 55, 6, 1, 1, 6, BONE_LIGHT);

  // Warm amber-lit windows on main hall
  for (const v0 of [9, 13]) {
    rightWallRect(ctx, fx, fy, v0, 5, 3, 4, OUT);
    rightWallRect(ctx, fx, fy, v0 + 1, 6, 1, 2, AMBER_BRIGHT);
  }

  // Stepped upper adobe roof terrace + terracotta chimney pot on right
  isoBox(ctx, 33, 41, 12, 12, 5, {
    top: REED_LIGHT,
    left: OCHRE_DARK,
    right: OCHRE_MID,
  });
  isoBox(ctx, 40, 38, 3, 3, 6, {
    top: MUD_DARK,
    left: TERRA_DARK,
    right: TERRA_LIGHT,
  });

  // Tall stepped ziggurat watch-turret on back-left corner crowned with bone horns
  isoBox(ctx, 23, 48, 8, 8, 18, {
    top: TERRA_LIGHT,
    left: TERRA_DARK,
    right: OCHRE_MID,
  });
  isoBox(ctx, 23, 30, 6, 6, 7, {
    top: BONE_LIGHT,
    left: TEAL_DARK,
    right: TEAL_MID,
  });
  rect(ctx, 18, 21, 2, 3, BONE_LIGHT);
  rect(ctx, 26, 21, 2, 3, BONE_LIGHT);
  disc(ctx, 23, 20, 2, AMBER_BRIGHT);

  return [canvas];
}

/**
 * 13. STALL: Low Swamp Bazaar Booth (~0.6 tile tall).
 * Compact open mud-brick & bone counter under a low striped teal-and-ochre reed awning,
 * displaying bowls of red spice, amber jars, and smoked marsh-fish.
 */
function buildLizardStall(): HTMLCanvasElement[] {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  // Compact dried-mud pad leaving open ground around the stall
  isoDiamond(ctx, 32, 48, 22, MUD_DARK, OUT);
  isoDiamond(ctx, 32, 48, 17, OCHRE_DARK, MUD_MID);

  // Low adobe & reed counter table in center (0.6 tile height profile)
  const fx = 33;
  const fy = 54;
  isoBox(ctx, fx, fy, 10, 14, 5, {
    top: OCHRE_LIGHT,
    left: TERRA_DARK,
    right: TERRA_MID,
  });
  drawScaleTrim(ctx, fx, fy, 10, 14, 2);

  // Goods arranged on counter: bright red spice mound, amber jar, teal scale pelt
  rect(ctx, 34, 47, 3, 2, '#e53935');
  px(ctx, 35, 46, AMBER_BRIGHT);
  rect(ctx, 38, 45, 2, 3, AMBER_MID);
  rect(ctx, 41, 44, 3, 2, TEAL_BRIGHT);
  rect(ctx, 29, 47, 3, 2, BONE_LIGHT);

  // Bleached bone support poles holding up a low striped teal-and-amber reed awning
  rect(ctx, 25, 38, 2, 12, OUT);
  rect(ctx, 25, 38, 1, 11, BONE_LIGHT);
  rect(ctx, 43, 38, 2, 11, OUT);
  rect(ctx, 43, 38, 1, 10, BONE_LIGHT);

  for (let v = 0; v < 16; v++) {
    const isTeal = ((v >> 1) & 1) === 0;
    const col = isTeal ? TEAL_MID : AMBER_MID;
    const edge = isTeal ? TEAL_BRIGHT : OCHRE_LIGHT;
    const x = 25 + v;
    const y = 41 - (v >> 2);
    rect(ctx, x - 3, y - 4, 4, 4, OUT);
    rect(ctx, x - 2, y - 3, 3, 3, col);
    px(ctx, x, y, edge);
  }

  // Woven spice basket on the ground beside the counter
  isoBox(ctx, 24, 54, 4, 4, 3, {
    top: '#e53935',
    left: REED_DARK,
    right: REED_LIGHT,
  });

  return [canvas];
}

/**
 * 14. TAVERN: Two-Storey Swamp Cantina on Stilts.
 * Elevated two-storey adobe-and-reed inn perched on mangrove stilts over a teal swamp pool,
 * rope boardwalk entrance, warm amber-lit windows, hanging bone-gourd sign, and brew barrels.
 */
function buildLizardTavern(): HTMLCanvasElement[] {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  // Murky teal swamp water & mud pad under the stilts
  isoDiamond(ctx, 32, 48, 28, MUD_DARK, OUT);
  isoDiamond(ctx, 32, 48, 23, TEAL_DARK, MUD_MID);
  isoDiamond(ctx, 32, 49, 16, '#16383b');

  // Heavy wooden mangrove stilts rising out of the swamp water
  for (const [sx, sy] of [
    [20, 49],
    [26, 53],
    [32, 57],
    [39, 53],
    [44, 49],
  ] as const) {
    rect(ctx, sx - 1, sy - 6, 3, 7, OUT);
    rect(ctx, sx, sy - 6, 1, 6, MUD_MID);
  }

  // Stilted wooden deck platform
  const fx = 32;
  const fy = 53;
  const wL = 16;
  const wR = 18;
  isoBox(ctx, fx, fy, wL, wR, 2, {
    top: OCHRE_MID,
    left: MUD_DARK,
    right: OCHRE_DARK,
  });

  // Lower cantina storey: terracotta adobe walls with warm lit windows & doorway
  isoBox(ctx, fx, fy - 2, wL, wR, 8, {
    top: OCHRE_LIGHT,
    left: TERRA_DARK,
    right: TERRA_MID,
  });
  drawScaleTrim(ctx, fx, fy - 2, wL, wR, 6);

  // Cantina doorway & warm amber-lit drinking hall window on lower right wall
  rightWallRect(ctx, fx, fy - 2, 3, 1, 4, 6, OUT);
  rightWallRect(ctx, fx, fy - 2, 4, 1, 2, 5, AMBER_MID);
  rightWallRect(ctx, fx, fy - 2, 9, 2, 6, 4, OUT);
  rightWallRect(ctx, fx, fy - 2, 10, 3, 4, 2, AMBER_BRIGHT);

  // Upper second storey: narrower ochre-and-reed loft with warm lit windows
  isoBox(ctx, 32, 43, 14, 16, 7, {
    top: REED_LIGHT,
    left: OCHRE_DARK,
    right: OCHRE_MID,
  });
  for (const v0 of [3, 10]) {
    rightWallRect(ctx, 32, 43, v0, 2, 4, 4, OUT);
    rightWallRect(ctx, 32, 43, v0 + 1, 3, 2, 2, AMBER_BRIGHT);
  }
  for (const u0 of [3, 9]) {
    leftWallRect(ctx, 32, 43, u0, 2, 4, 4, OUT);
    leftWallRect(ctx, 32, 43, u0 + 1, 3, 2, 2, AMBER_MID);
  }

  // Thick stepped reed-thatch roof crown
  isoBox(ctx, 32, 36, 16, 18, 3, {
    top: REED_LIGHT,
    left: REED_DARK,
    right: OCHRE_LIGHT,
  });
  isoBox(ctx, 32, 33, 10, 12, 3, {
    top: REED_LIGHT,
    left: REED_DARK,
    right: OCHRE_MID,
  });

  // Projecting bone pole on right wall with hanging amber gourd & fang tavern sign
  rect(ctx, 45, 37, 7, 2, OUT);
  rect(ctx, 45, 37, 6, 1, BONE_LIGHT);
  rect(ctx, 48, 39, 4, 5, OUT);
  rect(ctx, 49, 40, 2, 3, AMBER_BRIGHT);
  px(ctx, 49, 41, TERRA_MID);

  // Rope bridge ramp leading up to the stilted deck + swamp-brew barrels by the door
  drawRopeBridge(ctx, 35, 53, 43, 58);
  isoBox(ctx, 38, 52, 4, 4, 4, {
    top: OCHRE_LIGHT,
    left: MUD_DARK,
    right: TERRA_MID,
  });
  rightWallRect(ctx, 38, 52, 0, 2, 4, 1, TEAL_BRIGHT);

  return [canvas];
}

/**
 * 15. BANK: Temple-Vault of the Golden Scales.
 * Heavy stepped stone-and-terracotta treasury with four carved bone-and-gold columns,
 * heavy bronze-gold vault portal, scale trim, and a large gleaming gold sun-coin emblem.
 */
function buildLizardBank(): HTMLCanvasElement[] {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  // Paved sandstone & teal treasury plaza
  isoDiamond(ctx, 32, 48, 28, MUD_DARK, OUT);
  isoDiamond(ctx, 32, 48, 24, OCHRE_DARK, TEAL_MID);
  isoDiamond(ctx, 32, 48, 20, BONE_MID, AMBER_MID);

  // Heavy stepped stone plinth
  const fx = 32;
  const fy = 57;
  const wL = 18;
  const wR = 20;
  isoBox(ctx, fx, fy, wL, wR, 3, {
    top: BONE_LIGHT,
    left: BONE_DARK,
    right: BONE_MID,
  });

  // Massive adobe-and-stone vault hall body
  const wallH = 15;
  isoBox(ctx, fx, fy - 3, wL - 2, wR - 2, wallH, {
    top: OCHRE_LIGHT,
    left: TERRA_DARK,
    right: TERRA_MID,
  });
  drawScaleTrim(ctx, fx, fy - 3, wL - 2, wR - 2, wallH - 3);

  // Heavy golden-amber vault door in center of right wall
  rightWallRect(ctx, fx, fy - 3, 6, 1, 6, 9, OUT);
  rightWallRect(ctx, fx, fy - 3, 7, 1, 4, 8, AMBER_MID);
  rightWallRect(ctx, fx, fy - 3, 8, 3, 2, 4, AMBER_BRIGHT);
  rightWallRect(ctx, fx, fy - 3, 8, 5, 1, 1, TEAL_BRIGHT);

  // Four carved bone-and-gold columns across the front-right facade
  for (const v0 of [2, 5, 13, 16]) {
    rightWallRect(ctx, fx, fy - 3, v0, 1, 2, 11, OUT);
    rightWallRect(ctx, fx, fy - 3, v0, 1, 1, 11, BONE_LIGHT);
    rightWallRect(ctx, fx, fy - 3, v0, 10, 1, 2, AMBER_BRIGHT);
  }
  // Barred treasury slits on left wall
  for (const u0 of [4, 10]) {
    leftWallRect(ctx, fx, fy - 3, u0, 4, 3, 6, OUT);
    leftWallRect(ctx, fx, fy - 3, u0 + 1, 5, 1, 4, AMBER_MID);
  }

  // Stepped golden-ochre vault crown
  isoBox(ctx, 32, 39, 12, 14, 5, {
    top: AMBER_BRIGHT,
    left: AMBER_DARK,
    right: AMBER_MID,
  });

  // Giant gleaming gold sun-coin sign mounted on the front of the roof crown
  disc(ctx, 36, 32, 5, OUT);
  disc(ctx, 36, 32, 4, AMBER_BRIGHT);
  disc(ctx, 36, 32, 2, AMBER_MID);
  px(ctx, 36, 32, '#fff8e1');

  return [canvas];
}

/**
 * 16. LIBRARY: Hall of Carved Clay Tablets & Reed Scrolls.
 * Modest elongated adobe-and-teal archive hall with three tall narrow window slits,
 * flat stepped roof with projecting vigas, and a carved stone tablet/scroll sign above the door.
 */
function buildLizardLibrary(): HTMLCanvasElement[] {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  // Quiet sandstone & teal courtyard pad
  isoDiamond(ctx, 32, 48, 26, MUD_DARK, OUT);
  isoDiamond(ctx, 32, 48, 21, OCHRE_DARK, TEAL_DARK);

  // Modest rectangular adobe hall (wider along v, single-tier profile distinct from stepped school pyramid)
  const fx = 30;
  const fy = 56;
  const wL = 13;
  const wR = 20;
  const wallH = 12;
  isoBox(ctx, fx, fy, wL, wR, wallH, {
    top: OCHRE_LIGHT,
    left: OCHRE_DARK,
    right: OCHRE_MID,
  });
  drawScaleTrim(ctx, fx, fy, wL, wR, wallH - 3);

  // Doorway & three tall narrow teal-lit scholar windows on right wall
  rightWallRect(ctx, fx, fy, 2, 1, 4, 7, OUT);
  rightWallRect(ctx, fx, fy, 3, 1, 2, 6, TEAL_DARK);
  for (const v0 of [7, 11, 15]) {
    rightWallRect(ctx, fx, fy, v0, 2, 3, 7, OUT);
    rightWallRect(ctx, fx, fy, v0 + 1, 3, 1, 5, TEAL_BRIGHT);
  }
  for (const u0 of [3, 8]) {
    leftWallRect(ctx, fx, fy, u0, 2, 3, 7, OUT);
    leftWallRect(ctx, fx, fy, u0 + 1, 3, 1, 5, TEAL_MID);
  }

  // Low reed-thatch overhang & carved stone tablet / scroll sign on the front parapet
  isoBox(ctx, fx, fy - wallH, wL - 2, wR - 2, 3, {
    top: REED_LIGHT,
    left: TERRA_DARK,
    right: TERRA_MID,
  });
  // Prominent open scroll / twin clay tablet sign mounted above the entrance
  rect(ctx, 34, 37, 8, 6, OUT);
  rect(ctx, 35, 38, 3, 4, BONE_LIGHT);
  rect(ctx, 39, 38, 2, 4, AMBER_BRIGHT);
  px(ctx, 36, 39, TEAL_DARK);
  px(ctx, 36, 41, TERRA_MID);

  return [canvas];
}

/**
 * 17. ACADEMY: Grand Serpent-Sages' Observatory Dome & Ziggurat (Tallest Service Building, 2 frames).
 * Enclosed mud-brick & teal courtyard, broad lower hall, soaring stepped teal-and-gold dome/spire
 * reaching y=4, flanked by twin waving teal-and-amber banners.
 */
function buildLizardAcademy(): HTMLCanvasElement[] {
  return [0, 1].map((frame) => {
    const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

    // Grand ceremonial plaza with teal-and-amber border
    isoDiamond(ctx, 32, 48, 30, MUD_DARK, OUT);
    isoDiamond(ctx, 32, 48, 26, OCHRE_DARK, TEAL_MID);
    isoDiamond(ctx, 32, 48, 20, TERRA_MID, AMBER_BRIGHT);

    // Front courtyard gate pillars
    isoBox(ctx, 25, 57, 3, 3, 6, {
      top: BONE_LIGHT,
      left: TERRA_DARK,
      right: TERRA_LIGHT,
    });
    isoBox(ctx, 39, 57, 3, 3, 6, {
      top: BONE_LIGHT,
      left: TERRA_DARK,
      right: TERRA_LIGHT,
    });

    // Broad lower academy sanctuary hall
    const fx = 32;
    const fy = 55;
    isoBox(ctx, fx, fy, 20, 20, 10, {
      top: OCHRE_LIGHT,
      left: TERRA_DARK,
      right: TERRA_MID,
    });
    drawScaleTrim(ctx, fx, fy, 20, 20, 7);

    // Grand portal & tall amber-lit windows
    rightWallRect(ctx, fx, fy, 3, 1, 5, 7, OUT);
    rightWallRect(ctx, fx, fy, 4, 1, 3, 6, TEAL_DARK);
    for (const v0 of [10, 15]) {
      rightWallRect(ctx, fx, fy, v0, 2, 3, 5, OUT);
      rightWallRect(ctx, fx, fy, v0 + 1, 3, 1, 3, AMBER_BRIGHT);
    }
    for (const u0 of [4, 10, 15]) {
      leftWallRect(ctx, fx, fy, u0, 2, 3, 5, OUT);
      leftWallRect(ctx, fx, fy, u0 + 1, 3, 1, 3, TEAL_BRIGHT);
    }

    // Second tier: Tall octagonal ochre-and-teal observatory drum
    isoBox(ctx, 32, 45, 14, 14, 11, {
      top: TEAL_LIGHT,
      left: OCHRE_DARK,
      right: OCHRE_MID,
    });
    rightWallRect(ctx, 32, 45, 4, 2, 6, 7, OUT);
    rightWallRect(ctx, 32, 45, 5, 3, 4, 5, TEAL_BRIGHT);

    // Third tier: High curved teal-scale observatory dome & golden-amber celestial spire (reaches y=4)
    for (let dy = -11; dy <= 0; dy++) {
      const span = Math.round(10 * Math.sqrt(Math.max(0, 1 - (dy * dy) / 125)));
      rect(ctx, 32 - span - 1, 27 + dy, (span + 1) * 2, 1, OUT);
      const col = dy < -7 ? AMBER_BRIGHT : dy < -3 ? TEAL_BRIGHT : TEAL_MID;
      rect(ctx, 32 - span, 27 + dy, span * 2, 1, col);
    }
    rect(ctx, 31, 6, 2, 10, BONE_LIGHT);
    disc(ctx, 32, 5, frame === 0 ? 3 : 2, VENOM_GLOW);
    px(ctx, 32, 5, AMBER_BRIGHT);

    // Twin tall waving teal-and-amber academy banners on left and right
    const wave = frame % 2;
    for (const [px0, py0] of [
      [14, 22],
      [47, 22],
    ] as const) {
      rect(ctx, px0, py0, 1, 18, OUT);
      rect(ctx, px0 + 1, py0 + 1, 1, 17, BONE_LIGHT);
      rect(ctx, px0 + 2, py0 + 2 + wave, 5, 7, OUT);
      rect(ctx, px0 + 2, py0 + 3 + wave, 4, 5, TEAL_MID);
      rect(ctx, px0 + 3, py0 + 4 + wave, 2, 3, AMBER_BRIGHT);
    }

    return canvas;
  });
}

/**
 * 18. CLINIC: Pale Bone-Plastered Swamp Apothecary & Healing Sanctuary.
 * Clean whitewashed bone-plaster adobe building with a glowing green/red healing cross emblem,
 * reed-thatch awning, and terracotta pots of medicinal swamp-aloe & red herbs.
 */
function buildLizardClinic(): HTMLCanvasElement[] {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  // Clean sandstone & teal apothecary pad
  isoDiamond(ctx, 32, 48, 27, MUD_DARK, OUT);
  isoDiamond(ctx, 32, 48, 22, BONE_MID, TEAL_MID);

  // Clean pale bone-limewashed adobe sanctuary body
  const fx = 33;
  const fy = 55;
  const wL = 15;
  const wR = 16;
  const wallH = 12;
  isoBox(ctx, fx, fy, wL, wR, wallH, {
    top: '#ffffff',
    left: BONE_MID,
    right: BONE_LIGHT,
  });
  // Soothing teal-green band around upper wall
  leftWallRect(ctx, fx, fy, 0, wallH - 3, wL, 2, TEAL_MID);
  rightWallRect(ctx, fx, fy, 0, wallH - 3, wR, 2, TEAL_BRIGHT);

  // Entrance doorway & bright clean window on right wall
  rightWallRect(ctx, fx, fy, 3, 1, 4, 7, OUT);
  rightWallRect(ctx, fx, fy, 4, 1, 2, 6, TEAL_MID);
  rightWallRect(ctx, fx, fy, 9, 3, 4, 5, OUT);
  rightWallRect(ctx, fx, fy, 10, 4, 2, 3, VENOM_GLOW);

  // Stepped pale adobe roof parapet with prominent red & green healing cross sign
  isoBox(ctx, 33, 43, 11, 12, 4, {
    top: BONE_LIGHT,
    left: BONE_DARK,
    right: '#ffffff',
  });
  disc(ctx, 36, 36, 5, OUT);
  disc(ctx, 36, 36, 4, '#ffffff');
  rect(ctx, 35, 33, 3, 7, '#e53935');
  rect(ctx, 33, 35, 7, 3, '#e53935');
  px(ctx, 36, 36, VENOM_GLOW);

  // Terracotta herb pots along the front walk with green aloe & red medicinal blossoms
  for (const [hx, hy, herbCol] of [
    [25, 54, VENOM_GLOW],
    [37, 57, '#e53935'],
    [43, 54, TEAL_BRIGHT],
  ] as const) {
    isoBox(ctx, hx, hy, 3, 3, 3, {
      top: TERRA_LIGHT,
      left: TERRA_DARK,
      right: TERRA_MID,
    });
    rect(ctx, hx - 1, hy - 6, 3, 3, TEAL_MID);
    px(ctx, hx, hy - 7, herbCol);
  }

  return [canvas];
}

/**
 * 19. WORKSHOP: Swamp Spice-Drying Yard & Smoking Pit (Lizards' special good, 3 frames).
 * Sun-baked yard with woven baskets of bright red & orange spices, a stone smoking pit with
 * slatted rack & rising spice-smoke (3 frames), grinding bench, crates, and adobe drying shed.
 */
function buildLizardWorkshop(): HTMLCanvasElement[] {
  return [0, 1, 2].map((frame) => {
    const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

    // Sun-baked ochre & mud spice-drying yard pad
    isoDiamond(ctx, 32, 48, 28, MUD_DARK, OUT);
    isoDiamond(ctx, 32, 48, 24, OCHRE_DARK, TERRA_DARK);

    // Back-left adobe spice-curing shed with chimney
    isoBox(ctx, 25, 48, 10, 10, 9, {
      top: OCHRE_LIGHT,
      left: TERRA_DARK,
      right: TERRA_MID,
    });
    drawScaleTrim(ctx, 25, 48, 10, 10, 6);
    isoBox(ctx, 23, 39, 4, 4, 6, {
      top: MUD_DARK,
      left: TERRA_DARK,
      right: TERRA_LIGHT,
    });

    // Sunken stone-ringed spice-smoking pit in center-right with glowing embers & wooden grate
    isoDiamond(ctx, 38, 49, 9, MUD_DARK, OUT);
    isoDiamond(ctx, 38, 49, 6, frame === 1 ? AMBER_BRIGHT : '#d84315');
    // Slatted wooden spice-smoking rack over the pit with red/orange chili pods
    for (let dx = -4; dx <= 4; dx += 2) {
      rect(ctx, 38 + dx, 46, 1, 6, REED_LIGHT);
      px(ctx, 38 + dx, 48, '#e53935');
      px(ctx, 38 + dx, 49, AMBER_BRIGHT);
    }

    // Woven spice baskets overflowing with bright red & orange spices in front-left & center
    for (const [bx, by, spiceTop, spiceHighlight] of [
      [23, 55, '#d32f2f', '#ff5252'],
      [29, 57, AMBER_MID, AMBER_BRIGHT],
      [35, 57, '#e64a19', AMBER_BRIGHT],
    ] as const) {
      isoBox(ctx, bx, by, 5, 5, 3, {
        top: spiceTop,
        left: REED_DARK,
        right: REED_LIGHT,
      });
      rect(ctx, bx - 1, by - 5, 3, 2, spiceHighlight);
    }

    // Spice-grinding tool bench & packed spice crate on right
    isoBox(ctx, 44, 54, 5, 7, 4, {
      top: OCHRE_LIGHT,
      left: MUD_DARK,
      right: OCHRE_MID,
    });
    rect(ctx, 44, 48, 3, 2, '#e53935');

    // Rising aromatic orange-amber smoke puffs from the smoking pit & chimney (3 frames)
    const yOff = frame * 2;
    disc(ctx, 38, 41 - yOff, 3, OCHRE_MID);
    disc(ctx, 39, 36 - yOff, 2, AMBER_BRIGHT);
    disc(ctx, 23, 30 - yOff, 2, BONE_MID);

    return canvas;
  });
}

/**
 * Citizen sprite (16x24): Lizardfolk raider with snouted reptilian jaw, dorsal/head crest,
 * tail at back, scale/armor variants 0..3, 4-frame walk cycle, clawed feet at y=23.
 */
function buildLizardCitizen(frame: number, variant: number): HTMLCanvasElement {
  const [canvas, ctx] = makeCanvas(16, 24);
  const f = ((frame % 4) + 4) % 4;
  const v = ((variant % 4) + 4) % 4;

  const scaleVariants = [
    [TEAL_MID, TEAL_BRIGHT, TERRA_MID],
    ['#3b7a3e', '#68b85e', OCHRE_MID],
    [OCHRE_MID, AMBER_BRIGHT, TEAL_MID],
    [TERRA_MID, AMBER_MID, BONE_LIGHT],
  ] as const;
  const [scaleBase, scaleLight, harnessCol] = scaleVariants[v]!;
  const bob = f === 1 || f === 3 ? -1 : 0;

  // Bone/fin crest on top of head (y = 3..4)
  rect(ctx, 5, 3 + bob, 4, 2, OUT);
  rect(ctx, 6, 3 + bob, 2, 2, BONE_LIGHT);

  // Reptilian snouted head (projects forward to the right, x = 5..12, y = 5..10)
  rect(ctx, 4, 5 + bob, 9, 6, OUT);
  rect(ctx, 5, 6 + bob, 7, 4, scaleBase);
  rect(ctx, 6, 6 + bob, 5, 1, scaleLight);
  px(ctx, 9, 7 + bob, AMBER_BRIGHT); // glowing slit reptile eye
  px(ctx, 11, 9 + bob, BONE_LIGHT); // sharp fang

  // Scaled torso with bone/terracotta raider harness (y = 11..18)
  rect(ctx, 4, 11 + bob, 8, 8, OUT);
  rect(ctx, 5, 11 + bob, 6, 7, scaleBase);
  rect(ctx, 6, 12 + bob, 4, 5, harnessCol);
  rect(ctx, 5, 12 + bob, 6, 1, BONE_LIGHT); // bone shoulder/chest strap
  rect(ctx, 5, 17 + bob, 6, 1, OCHRE_LIGHT); // belt

  // Reptilian tail extending out to the left (x = 1..4, y = 16..19)
  const tailWag = f % 2;
  rect(ctx, 1, 16 + tailWag, 4, 3, OUT);
  rect(ctx, 2, 17 + tailWag, 3, 1, scaleLight);

  // Clawed legs with feet at bottom row (y = 23)
  const leftY = f === 1 ? 19 : 20;
  const rightY = f === 3 ? 19 : 20;
  rect(ctx, 5, 19, 3, 5, OUT);
  rect(ctx, 6, leftY, 1, 23 - leftY, scaleBase);
  px(ctx, 6, 23, BONE_LIGHT); // claw

  rect(ctx, 8, 19, 3, 5, OUT);
  rect(ctx, 9, rightY, 1, 23 - rightY, scaleBase);
  px(ctx, 9, 23, BONE_LIGHT); // claw

  return canvas;
}

export const art: ArcArt = {
  ground: buildLizardGround,
  foundation: buildLizardFoundation,
  citizen: buildLizardCitizen,
  buildings: {
    house: buildLizardHouse,
    shop: buildLizardShop,
    barracks: buildLizardBarracks,
    tower: buildLizardTower,
    farm: buildLizardFarm,
    school: buildLizardSchool,
    factory: buildLizardFactory,
    lumber: buildLizardLumber,
    mine: buildLizardMine,
    park: buildLizardPark,
    tree: buildLizardTree,
    lamp: buildLizardLamp,
    fountain: buildLizardFountain,
    statue: buildLizardStatue,
    rowhouse: buildLizardRowhouse,
    manor: buildLizardManor,
    stall: buildLizardStall,
    tavern: buildLizardTavern,
    bank: buildLizardBank,
    library: buildLizardLibrary,
    academy: buildLizardAcademy,
    clinic: buildLizardClinic,
    workshop: buildLizardWorkshop,
  },
};
