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
  isoPitchedRoof,
  disc,
  tileHash,
  type ArcArt,
} from '../sprites';

// Dragon palette: obsidian black, deep volcanic purple, blood-red basalt, molten lava orange/yellow, hoard gold, bone horn
const ASH_0 = '#262129';
const ASH_1 = '#1f1b22';
const ASH_DARK = '#141117';
const ASH_LIGHT = '#342d38';
const OBS_TOP = '#3a3247';
const OBS_RIGHT = '#262030';
const OBS_LEFT = '#181420';
const BASALT_TOP = '#7a2e2e';
const BASALT_RIGHT = '#591f1f';
const BASALT_LEFT = '#3d1414';
const PURPLE_MID = '#4a2c59';
const PURPLE_LIGHT = '#6b4280';
const LAVA_BRIGHT = '#fff176';
const LAVA_MID = '#ff6d00';
const LAVA_RED = '#d50000';
const GOLD_BRIGHT = '#ffe57f';
const GOLD_MID = '#ffc107';
const GOLD_DARK = '#b26a00';
const HORN_LIGHT = '#e0d6cc';
const HORN_MID = '#9e8c7a';
const HORN_DARK = '#5c4f42';

/** Draw a curved dragon horn or claw tapering from base (x0, y0) to sharp tip (x1, y1). */
function drawHorn(
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  curveY: number,
  bright = true,
): void {
  const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 5);
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = Math.round(x0 + (x1 - x0) * t);
    const y = Math.round(y0 + (y1 - y0) * t - Math.sin(t * Math.PI) * curveY);
    const w = t < 0.5 ? 2 : 1;
    rect(ctx, x - 1, y - 1, w + 1, w + 1, OUT);
    rect(ctx, x, y, w, w, t > 0.7 ? HORN_LIGHT : bright ? HORN_MID : HORN_DARK);
  }
}

/** Draw a roaring dragonfire flame plume centered at (cx, baseY). */
function drawDragonFlame(
  ctx: CanvasRenderingContext2D,
  cx: number,
  baseY: number,
  h: number,
  frame: number,
): void {
  const sway = frame % 2 === 0 ? -1 : 1;
  for (let dy = 0; dy < h; dy++) {
    const t = dy / h;
    const span = Math.max(1, Math.round((1 - t * 0.85) * 4));
    const x = cx + (dy > h * 0.5 ? sway : 0);
    const y = baseY - dy;
    rect(ctx, x - span, y, span * 2, 1, LAVA_RED);
    if (span > 1) {
      rect(ctx, x - span + 1, y, (span - 1) * 2, 1, LAVA_MID);
    }
    if (t < 0.55) {
      rect(ctx, x - 1, y, 2, 1, LAVA_BRIGHT);
    }
  }
}

/** Draw a glittering mound of dragon gold & ruby gems centered at (cx, by). */
function drawGoldHeap(ctx: CanvasRenderingContext2D, cx: number, by: number, rx: number, h: number): void {
  for (let dy = 0; dy < h; dy++) {
    const span = Math.max(2, Math.round(rx * (1 - dy / (h + 1))));
    const y = by - dy;
    rect(ctx, cx - span - 1, y, (span + 1) * 2, 1, OUT);
    for (let dx = -span; dx < span; dx++) {
      const col = (dx + dy) % 5 === 0 ? GOLD_BRIGHT : dx < 0 ? GOLD_DARK : GOLD_MID;
      px(ctx, cx + dx, y, col);
    }
  }
  // Ruby & emerald gem glints in the hoard
  px(ctx, cx - 2, by - 1, LAVA_RED);
  px(ctx, cx + 1, by - 2, LAVA_BRIGHT);
}

function buildGround(parity: 0 | 1, variant: number): HTMLCanvasElement {
  const [canvas, ctx] = makeCanvas(SPRITE_W, TILE_H);
  const base = parity === 0 ? ASH_0 : ASH_1;
  const dark = parity === 0 ? '#1b171f' : '#151218';
  const light = parity === 0 ? ASH_LIGHT : '#2d2630';

  isoDiamond(ctx, 32, 16, 32, base, ASH_DARK);

  // Deterministic volcanic basalt & ash texture
  for (let u = 2; u < 30; u++) {
    for (let v = 2; v < 30; v++) {
      const h = tileHash(u, v, variant * 23 + parity * 13 + 7);
      const r = h % 29;
      if (r === 0 || r === 1) {
        isoTexel(ctx, 32, 0, u, v, light);
      } else if (r === 2 || r === 3) {
        isoTexel(ctx, 32, 0, u, v, dark);
      }
    }
  }

  if (variant === 1) {
    // Glowing molten lava vein crack across the volcanic rock
    for (const [u, v, col] of [
      [11, 14, LAVA_RED],
      [12, 15, LAVA_MID],
      [13, 15, LAVA_BRIGHT],
      [14, 16, LAVA_MID],
      [15, 17, LAVA_RED],
      [21, 11, LAVA_RED],
      [22, 12, LAVA_MID],
    ] as const) {
      const sx = 32 + (u - v);
      const sy = (u + v) >> 1;
      px(ctx, sx, sy, col);
      px(ctx, sx + 1, sy, LAVA_RED);
    }
  } else if (variant === 2) {
    // Jagged black obsidian crystal shards
    for (const [u, v] of [
      [10, 19],
      [22, 14],
    ] as const) {
      const sx = 32 + (u - v);
      const sy = (u + v) >> 1;
      rect(ctx, sx - 1, sy - 1, 2, 2, OUT);
      px(ctx, sx, sy - 1, PURPLE_LIGHT);
    }
  } else if (variant === 3) {
    // Glowing ember fissures & sulfur ash spots
    for (const [u, v] of [
      [14, 21],
      [19, 10],
      [24, 18],
    ] as const) {
      const sx = 32 + (u - v);
      const sy = (u + v) >> 1;
      rect(ctx, sx - 1, sy, 2, 1, LAVA_RED);
      px(ctx, sx, sy, LAVA_MID);
    }
  }

  return canvas;
}

function buildFoundation(): HTMLCanvasElement {
  const [canvas, ctx] = makeCanvas(SPRITE_W, TILE_H);
  isoDiamond(ctx, 32, 16, 32, ASH_1, OUT);
  isoDiamond(ctx, 32, 16, 26, OBS_RIGHT, LAVA_RED);
  return canvas;
}

/** Obsidian and red-basalt hall with glowing lava cracks, spiked horn roof, and hoard glint. */
function buildHouse(): HTMLCanvasElement[] {
  return [0, 1].map((frame) => {
    const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);
    isoDiamond(ctx, 32, 48, 27, ASH_1, OUT);
    isoDiamond(ctx, 32, 48, 22, BASALT_LEFT, LAVA_RED);

    const fx = 32;
    const fy = 56;
    const wL = 16;
    const wR = 16;
    const wallH = 14;

    // Red basalt plinth + black obsidian walls
    isoBox(ctx, fx, fy, wL, wR, wallH, {
      top: OBS_TOP,
      left: OBS_LEFT,
      right: OBS_RIGHT,
    });
    isoBox(ctx, fx, fy, wL, wR, 3, {
      top: BASALT_TOP,
      left: BASALT_LEFT,
      right: BASALT_RIGHT,
    });

    // Glowing molten lava cracks splitting the left and right obsidian walls
    leftWallRect(ctx, fx, fy, 4, 4, 1, 6, LAVA_RED);
    leftWallRect(ctx, fx, fy, 5, 6, 2, 3, frame ? LAVA_BRIGHT : LAVA_MID);
    rightWallRect(ctx, fx, fy, 11, 4, 2, 6, LAVA_RED);
    rightWallRect(ctx, fx, fy, 12, 5, 1, 4, frame ? LAVA_MID : LAVA_BRIGHT);

    // Fanged archway entrance with molten interior glow on right wall
    rightWallRect(ctx, fx, fy, 3, 1, 5, 8, OUT);
    rightWallRect(ctx, fx, fy, 4, 1, 3, 7, '#2b0909');
    rightWallRect(ctx, fx, fy, 4, 1, 3, 2, LAVA_MID);
    // Fang teeth hanging from door lintel
    rightWallRect(ctx, fx, fy, 4, 7, 1, 2, HORN_LIGHT);
    rightWallRect(ctx, fx, fy, 6, 7, 1, 2, HORN_LIGHT);

    // Steep crimson dragon-scale roof with gold ridge
    isoPitchedRoof(ctx, fx, fy, wL + 2, wR + 2, wallH, 11, {
      leftSlope: BASALT_LEFT,
      rightSlope: BASALT_TOP,
      gable: PURPLE_MID,
      ridge: GOLD_MID,
    });

    // Spiked dragon horns curving upward from the roof eaves and peak
    drawHorn(ctx, 16, 37, 12, 29, 2);
    drawHorn(ctx, 32, 43, 30, 35, 2);
    drawHorn(ctx, 47, 35, 52, 27, -2);
    drawHorn(ctx, 32, 25, 32, 16, 0);

    // Small gold hoard pile outside the lair
    drawGoldHeap(ctx, 43, 53, 4, 3);

    return canvas;
  });
}

/** Vaulted obsidian & gold hoard bazaar with glowing ore heaps and horned crest. */
function buildShop(): HTMLCanvasElement[] {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);
  isoDiamond(ctx, 32, 48, 27, ASH_0, OUT);
  isoDiamond(ctx, 32, 48, 23, OBS_RIGHT, GOLD_DARK);

  // Back-left obsidian treasure vault pavilion
  const fx = 30;
  const fy = 53;
  isoBox(ctx, fx, fy, 14, 16, 13, {
    top: BASALT_TOP,
    left: OBS_LEFT,
    right: OBS_RIGHT,
  });
  // Golden dragon-scale cornice band
  isoBox(ctx, fx, fy - 11, 15, 17, 3, {
    top: GOLD_BRIGHT,
    left: GOLD_DARK,
    right: GOLD_MID,
  });

  // Wide open vault mouth on right wall overflowing with gold & glowing ore
  rightWallRect(ctx, fx, fy, 2, 1, 12, 8, OUT);
  rightWallRect(ctx, fx, fy, 3, 1, 10, 7, '#1c0d18');
  // Treasure mounds inside vault + foreground hoard display
  drawGoldHeap(ctx, 36, 51, 5, 4);
  drawGoldHeap(ctx, 43, 54, 6, 4);
  // Glowing crimson ore crystals on display pedestal
  isoBox(ctx, 23, 55, 5, 5, 4, {
    top: OBS_TOP,
    left: OBS_LEFT,
    right: OBS_RIGHT,
  });
  rect(ctx, 22, 48, 3, 3, LAVA_RED);
  px(ctx, 23, 47, LAVA_BRIGHT);

  // Twin golden horns crowning the vault roof
  drawHorn(ctx, 25, 32, 20, 22, 3);
  drawHorn(ctx, 36, 32, 41, 22, -3);

  return [canvas];
}

/** Roaring dragon-rider roost with clawed landing perch, lava pit, and drake banner. */
function buildBarracks(): HTMLCanvasElement[] {
  return [0, 1].map((frame) => {
    const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);
    // Molten lava moat surrounding the obsidian garrison pad
    isoDiamond(ctx, 32, 48, 29, LAVA_RED, OUT);
    isoDiamond(ctx, 32, 48, 26, frame ? LAVA_MID : LAVA_RED);
    isoDiamond(ctx, 32, 48, 22, OBS_RIGHT, OUT);

    // Fortified black-obsidian dragon roost citadel
    const fx = 32;
    const fy = 55;
    const wL = 16;
    const wR = 16;
    const wallH = 17;
    isoBox(ctx, fx, fy, wL, wR, wallH, {
      top: OBS_TOP,
      left: OBS_LEFT,
      right: OBS_RIGHT,
    });
    // Crimson basalt battlement collar
    isoBox(ctx, fx, fy - 14, wL + 2, wR + 2, 4, {
      top: BASALT_TOP,
      left: BASALT_LEFT,
      right: BASALT_RIGHT,
    });

    // Glowing magma portcullis gate on right wall
    rightWallRect(ctx, fx, fy, 4, 1, 7, 9, OUT);
    rightWallRect(ctx, fx, fy, 5, 1, 5, 8, LAVA_RED);
    rightWallRect(ctx, fx, fy, 6, 1, 3, 6, frame ? LAVA_BRIGHT : LAVA_MID);
    // Iron fang bars across gate
    rightWallRect(ctx, fx, fy, 6, 3, 1, 6, OUT);
    rightWallRect(ctx, fx, fy, 8, 3, 1, 6, OUT);

    // Four giant inward-curving dragon-roost landing claws atop the platform
    drawHorn(ctx, 22, 33, 17, 21, 3);
    drawHorn(ctx, 42, 33, 47, 21, -3);
    drawHorn(ctx, 32, 27, 28, 16, 2);
    drawHorn(ctx, 32, 38, 36, 27, -2);

    // Roaring central dragonfire beacon on the roost deck
    drawDragonFlame(ctx, 32, 30, 11, frame);

    return canvas;
  });
}

/** Tall horned fang spire gripped by dragon claws with a crown of fire on top. */
function buildTower(): HTMLCanvasElement[] {
  return [0, 1].map((frame) => {
    const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);
    isoDiamond(ctx, 32, 48, 25, ASH_1, OUT);
    isoDiamond(ctx, 32, 48, 20, BASALT_LEFT, LAVA_RED);

    // Stepped obsidian base
    isoBox(ctx, 32, 57, 16, 16, 6, {
      top: BASALT_TOP,
      left: BASALT_LEFT,
      right: BASALT_RIGHT,
    });

    // Tall slender obsidian fang shaft
    const fx = 32;
    const fy = 52;
    isoBox(ctx, fx, fy, 10, 10, 26, {
      top: OBS_TOP,
      left: OBS_LEFT,
      right: OBS_RIGHT,
    });

    // Pulsing vertical magma veins running up both faces of the spire
    const veinCol = frame === 0 ? LAVA_MID : LAVA_BRIGHT;
    leftWallRect(ctx, fx, fy, 4, 2, 2, 22, LAVA_RED);
    leftWallRect(ctx, fx, fy, 5, 4, 1, 18, veinCol);
    rightWallRect(ctx, fx, fy, 4, 2, 2, 22, LAVA_RED);
    rightWallRect(ctx, fx, fy, 4, 4, 1, 18, veinCol);

    // Lower claw buttresses gripping the spire base
    drawHorn(ctx, 22, 48, 16, 36, 3);
    drawHorn(ctx, 42, 48, 48, 36, -3);

    // Twin giant summit horns framing the floating dragonfire crown
    drawHorn(ctx, 26, 23, 19, 9, 4);
    drawHorn(ctx, 38, 23, 45, 9, -4);
    drawDragonFlame(ctx, 32, 21, 12, frame);

    return canvas;
  });
}

/** Volcanic ash terrace irrigated by molten lava channels growing crimson fire-shrooms. */
function buildFarm(): HTMLCanvasElement[] {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);
  isoDiamond(ctx, 32, 48, 28, ASH_1, OUT);

  // Volcanic ash beds divided by glowing molten lava irrigation channels
  for (let u = 3; u < 29; u++) {
    for (let v = 3; v < 29; v++) {
      const isLavaChannel = u === 15 || u === 22;
      const col = isLavaChannel
        ? (u + v) % 3 === 0
          ? LAVA_BRIGHT
          : LAVA_MID
        : (u + v) % 2 === 0
          ? ASH_0
          : '#2d2433';
      isoTexel(ctx, 32, 32, u, v, col);
    }
  }

  // Rows of bulbous crimson & gold volcanic ember-shrooms on the front-right
  for (const rowU of [12, 18, 25]) {
    for (let v = 5; v < 27; v += 4) {
      const sx = 32 + (rowU - v);
      const sy = 32 + ((rowU + v) >> 1);
      rect(ctx, sx, sy - 2, 1, 2, HORN_MID); // pale fungal stalk
      disc(ctx, sx, sy - 3, 2, OUT);
      rect(ctx, sx - 1, sy - 4, 3, 2, BASALT_TOP);
      px(ctx, sx, sy - 4, GOLD_BRIGHT); // bioluminescent ember spot
    }
  }

  // Horned basalt magma-cistern hut on the back-left
  isoBox(ctx, 25, 47, 9, 10, 9, {
    top: OBS_TOP,
    left: BASALT_LEFT,
    right: BASALT_RIGHT,
  });
  rightWallRect(ctx, 25, 47, 3, 1, 4, 5, LAVA_MID);
  drawHorn(ctx, 20, 36, 17, 30, 2);
  drawHorn(ctx, 29, 36, 32, 30, -2);

  return [canvas];
}

/** Stepped obsidian wyrm-sanctum with glowing draconic runes and twin flame obelisks. */
function buildSchool(): HTMLCanvasElement[] {
  return [0, 1].map((frame) => {
    const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);
    isoDiamond(ctx, 32, 48, 28, ASH_1, OUT);
    isoDiamond(ctx, 32, 48, 23, PURPLE_MID, GOLD_DARK);

    // Stepped pyramid sanctum of dark purple obsidian
    isoBox(ctx, 32, 55, 18, 18, 8, {
      top: PURPLE_LIGHT,
      left: OBS_LEFT,
      right: PURPLE_MID,
    });
    isoBox(ctx, 32, 47, 12, 12, 8, {
      top: OBS_TOP,
      left: OBS_LEFT,
      right: OBS_RIGHT,
    });
    isoBox(ctx, 32, 39, 6, 6, 6, {
      top: GOLD_BRIGHT,
      left: GOLD_DARK,
      right: GOLD_MID,
    });

    // Pulsing golden & magma draconic runes carved into the sanctum walls
    const runeCol = frame === 0 ? GOLD_BRIGHT : LAVA_MID;
    for (const v0 of [3, 8, 13]) {
      rightWallRect(ctx, 32, 55, v0, 2, 2, 4, runeCol);
      leftWallRect(ctx, 32, 55, v0, 2, 2, 4, runeCol);
    }
    rightWallRect(ctx, 32, 47, 4, 2, 4, 4, runeCol);

    // Twin horned rune obelisks flanking the forecourt
    for (const [ox, oy] of [
      [18, 50],
      [46, 50],
    ] as const) {
      isoBox(ctx, ox, oy, 4, 4, 12, {
        top: OBS_TOP,
        left: OBS_LEFT,
        right: OBS_RIGHT,
      });
      drawDragonFlame(ctx, ox, oy - 13, 6, frame);
    }

    return canvas;
  });
}

/** Great hellfire smeltery with molten lava cascade, horned smokestacks, and ember clouds. */
function buildFactory(): HTMLCanvasElement[] {
  return [0, 1, 2].map((frame) => {
    const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);
    isoDiamond(ctx, 32, 48, 28, ASH_1, OUT);
    isoDiamond(ctx, 32, 48, 24, BASALT_LEFT, LAVA_RED);

    const fx = 32;
    const fy = 56;
    const wL = 18;
    const wR = 18;
    const wallH = 15;

    // Massive red-basalt & obsidian foundry block
    isoBox(ctx, fx, fy, wL, wR, wallH, {
      top: BASALT_TOP,
      left: OBS_LEFT,
      right: BASALT_RIGHT,
    });

    // Spiked obsidian roof ridges
    for (const uOff of [3, 9, 15]) {
      drawHorn(ctx, fx - uOff + 4, fy - wallH - (uOff >> 1), fx - uOff + 2, fy - wallH - (uOff >> 1) - 6, 1);
    }

    // Molten lava waterfall pouring out of right foundry wall into a glowing crucible pool
    rightWallRect(ctx, fx, fy, 4, 1, 6, 10, OUT);
    rightWallRect(ctx, fx, fy, 5, 1, 4, 9, LAVA_RED);
    rightWallRect(ctx, fx, fy, 6, 1 + (frame % 2), 2, 7, LAVA_BRIGHT);
    isoDiamond(ctx, 41, 53, 6, LAVA_MID, OUT);
    isoDiamond(ctx, 41, 53, 3, LAVA_BRIGHT);

    // Twin tall obsidian smokestacks on back-left belching embers & volcanic ash
    for (const [cx, cy] of [
      [22, 35],
      [29, 32],
    ] as const) {
      isoBox(ctx, cx, cy, 5, 5, 14, {
        top: OBS_TOP,
        left: OBS_LEFT,
        right: OBS_RIGHT,
      });
      isoBox(ctx, cx, cy - 12, 6, 6, 2, {
        top: GOLD_MID,
        left: GOLD_DARK,
        right: GOLD_BRIGHT,
      });
    }

    // Animated volcanic ash & glowing orange ember puffs
    const rise = frame * 2;
    disc(ctx, 22, 16 - rise, 3, ASH_LIGHT);
    px(ctx, 22, 16 - rise, LAVA_MID);
    disc(ctx, 29, 13 - rise, 4, '#43394a');
    px(ctx, 30, 12 - rise, LAVA_BRIGHT);
    px(ctx, 27, 14 - rise, LAVA_RED);

    return canvas;
  });
}

/** Sad, sparse lumber camp: barren ash pad, charred stump, and only two tiny imported/burnt logs. */
function buildLumber(): HTMLCanvasElement[] {
  return [0, 1].map((frame) => {
    const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);
    // Barren grey volcanic ash pad (no forest anywhere)
    isoDiamond(ctx, 32, 48, 26, ASH_1, OUT);
    isoDiamond(ctx, 32, 48, 20, ASH_0, ASH_DARK);

    // Cracked, dilapidated little basalt storage lean-to on back-left
    isoBox(ctx, 26, 49, 9, 10, 7, {
      top: OBS_RIGHT,
      left: OBS_LEFT,
      right: BASALT_LEFT,
    });

    // A single sad blackened dead tree stump in the middle
    isoBox(ctx, 33, 52, 4, 4, 3, {
      top: '#3b2d29',
      left: ASH_DARK,
      right: '#261d1a',
    });
    // Tiny smoldering ember on the stump showing why wood is scarce
    px(ctx, 33, 48, frame ? LAVA_BRIGHT : LAVA_RED);

    // Pitiful pile of just two small charred/imported logs on the right
    isoBox(ctx, 41, 53, 3, 7, 3, {
      top: '#594031',
      left: ASH_DARK,
      right: '#3d2b22',
    });
    isoBox(ctx, 44, 54, 3, 7, 3, {
      top: '#4a3528',
      left: ASH_DARK,
      right: '#2e2018',
    });
    px(ctx, 42, 50, LAVA_RED); // singed ember end

    return canvas;
  });
}

/** Spectacular dragon mine: fanged volcanic maw, lava forge river, crimson crystals, and glowing ore carts. */
function buildMine(): HTMLCanvasElement[] {
  return [0, 1].map((frame) => {
    const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);
    isoDiamond(ctx, 32, 48, 29, ASH_1, OUT);
    isoDiamond(ctx, 32, 48, 24, BASALT_LEFT, LAVA_RED);

    // Towering jagged obsidian mountain crag in back
    disc(ctx, 30, 35, 16, OUT);
    disc(ctx, 30, 35, 15, OBS_LEFT);
    disc(ctx, 26, 31, 10, OBS_RIGHT);
    disc(ctx, 35, 33, 10, BASALT_LEFT);
    // Sharp volcanic peak horns & glowing crimson ore crystal spires protruding from mountain
    drawHorn(ctx, 24, 22, 19, 11, 2, false);
    drawHorn(ctx, 35, 23, 41, 12, -2, false);
    rect(ctx, 20, 29, 3, 5, LAVA_RED);
    px(ctx, 21, 28, LAVA_BRIGHT);
    rect(ctx, 40, 31, 3, 5, GOLD_MID);
    px(ctx, 41, 30, GOLD_BRIGHT);

    // Giant fanged dragon-maw forge cavern mouth blazing with molten magma
    rect(ctx, 24, 35, 13, 13, OUT);
    rect(ctx, 25, 36, 11, 12, LAVA_RED);
    rect(ctx, 27, 38, 7, 10, frame ? LAVA_BRIGHT : LAVA_MID);
    rect(ctx, 29, 40, 3, 8, LAVA_BRIGHT);
    // Upper and lower stone dragon fangs framing the lava forge mouth
    for (const fx of [25, 28, 31, 34]) {
      rect(ctx, fx, 35, 2, 4, HORN_LIGHT);
      rect(ctx, fx, 45, 2, 3, HORN_MID);
    }

    // Molten lava river & iron rails leading to an overflowing glowing ore cart in front-right
    isoDiamond(ctx, 35, 51, 7, LAVA_MID, LAVA_RED);
    rect(ctx, 33, 54, 15, 1, HORN_MID);
    rect(ctx, 35, 56, 15, 1, HORN_MID);

    const cartX = 43 + frame;
    isoBox(ctx, cartX, 57, 6, 7, 5, {
      top: OBS_TOP,
      left: OBS_LEFT,
      right: GOLD_DARK,
    });
    // Heaped glowing gold & magma-red ore crystals inside the minecart
    rect(ctx, cartX - 3, 50, 6, 3, GOLD_MID);
    rect(ctx, cartX - 2, 49, 4, 2, LAVA_BRIGHT);
    px(ctx, cartX + 1, 50, LAVA_RED);

    return canvas;
  });
}

/** Dragon hoard sanctuary: glittering treasure mountain beside a bubbling magma pool and rib arches. */
function buildPark(): HTMLCanvasElement[] {
  return [0, 1].map((frame) => {
    const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);
    isoDiamond(ctx, 32, 48, 29, OBS_LEFT, OUT);
    isoDiamond(ctx, 32, 48, 24, BASALT_LEFT, GOLD_DARK);

    // Bubbling molten lava pool on the front-left
    isoDiamond(ctx, 25, 50, 10, LAVA_RED, OUT);
    isoDiamond(ctx, 25, 50, 7, frame ? LAVA_BRIGHT : LAVA_MID);

    // Glittering mountain of hoarded dragon gold, crowns & rubies on the back-right
    drawGoldHeap(ctx, 36, 49, 10, 9);
    drawGoldHeap(ctx, 31, 53, 7, 5);

    // Curved bone dragon-horns arching over the hoard
    drawHorn(ctx, 26, 40, 32, 27, 4);
    drawHorn(ctx, 45, 42, 37, 27, -4);

    return canvas;
  });
}

/** Charred dead tree (no living forests in the Dragon arc) with glowing ember cracks. */
function buildTree(): HTMLCanvasElement[] {
  return [0, 1].map((frame) => {
    const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);
    isoDiamond(ctx, 32, 50, 10, ASH_1, OUT);
    // Twisted blackened dead trunk
    rect(ctx, 30, 31, 4, 20, OUT);
    rect(ctx, 31, 32, 2, 18, '#241e21');
    // Bare jagged charred branches (zero leaves)
    drawHorn(ctx, 31, 38, 22, 29, -2, false);
    drawHorn(ctx, 33, 36, 42, 27, 2, false);
    drawHorn(ctx, 31, 32, 26, 22, -1, false);
    drawHorn(ctx, 32, 31, 37, 21, 1, false);
    // Glowing orange ember fissures inside the split bark
    px(ctx, 31, 42, frame ? LAVA_BRIGHT : LAVA_MID);
    px(ctx, 32, 39, LAVA_RED);
    px(ctx, 31, 35, frame ? LAVA_MID : LAVA_RED);
    // Smoldering ash at roots
    px(ctx, 29, 50, LAVA_RED);
    px(ctx, 34, 50, frame ? LAVA_MID : LAVA_RED);
    return canvas;
  });
}

/** Obsidian pillar topped with dragon claws gripping a floating magma orb. */
function buildLamp(): HTMLCanvasElement[] {
  return [0, 1].map((frame) => {
    const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);
    isoDiamond(ctx, 32, 50, 9, ASH_1, OUT);
    isoBox(ctx, 32, 51, 5, 5, 16, {
      top: OBS_TOP,
      left: OBS_LEFT,
      right: OBS_RIGHT,
    });
    drawHorn(ctx, 29, 35, 27, 27, 2);
    drawHorn(ctx, 35, 35, 37, 27, -2);
    drawDragonFlame(ctx, 32, 33, 9, frame);
    return canvas;
  });
}

/** Octagonal obsidian basin erupting with a molten lava geyser. */
function buildFountain(): HTMLCanvasElement[] {
  return [0, 1].map((frame) => {
    const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);
    isoDiamond(ctx, 32, 47, 25, OBS_LEFT, OUT);
    isoDiamond(ctx, 32, 47, 20, GOLD_DARK, OUT);
    isoDiamond(ctx, 32, 47, 16, LAVA_RED);
    isoDiamond(ctx, 32, 47, 10, frame ? LAVA_BRIGHT : LAVA_MID);
    // Central obsidian fang nozzle & erupting magma plume
    isoBox(ctx, 32, 46, 5, 5, 12, {
      top: OBS_TOP,
      left: OBS_LEFT,
      right: OBS_RIGHT,
    });
    drawDragonFlame(ctx, 32, 34, 13, frame);
    return canvas;
  });
}

/** Winged golden dragon idol rearing atop a lava-lit obsidian plinth. */
function buildStatue(): HTMLCanvasElement[] {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);
  isoDiamond(ctx, 32, 48, 22, ASH_1, OUT);
  isoBox(ctx, 32, 56, 12, 12, 8, {
    top: OBS_TOP,
    left: OBS_LEFT,
    right: OBS_RIGHT,
  });
  rightWallRect(ctx, 32, 56, 3, 2, 6, 4, LAVA_MID);
  // Golden dragon body, horned head & spread bat-like wings
  rect(ctx, 29, 25, 6, 20, OUT);
  rect(ctx, 30, 26, 4, 18, GOLD_MID);
  rect(ctx, 30, 26, 2, 18, GOLD_BRIGHT);
  // Outspread dragon wings
  drawHorn(ctx, 30, 33, 18, 21, 4);
  drawHorn(ctx, 34, 33, 46, 21, -4);
  rect(ctx, 21, 25, 8, 6, BASALT_TOP);
  rect(ctx, 35, 25, 8, 6, BASALT_TOP);
  // Dragon head & ruby eye
  disc(ctx, 32, 22, 4, OUT);
  disc(ctx, 32, 22, 3, GOLD_BRIGHT);
  px(ctx, 33, 21, LAVA_RED);
  drawHorn(ctx, 30, 19, 27, 13, 1);
  drawHorn(ctx, 34, 19, 37, 13, -1);
  return [canvas];
}

// Source: apps/web/lib/sprites.ts isometric helpers & MDN CanvasRenderingContext2D.fillRect
// (https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/fillRect)

/** Dense row of 3 narrow joined obsidian-and-basalt townhomes with stepped horn-gables, 3 fanged doors, and lava-lit windows. */
function buildRowhouse(): HTMLCanvasElement[] {
  return [0, 1].map((frame) => {
    const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);
    isoDiamond(ctx, 32, 48, 28, ASH_1, OUT);
    isoDiamond(ctx, 32, 48, 24, OBS_RIGHT, LAVA_RED);

    // Three narrow joined rowhouses stepped along the v-axis (back-right to front-left draw order)
    const units: readonly (readonly [number, number, number, boolean])[] = [
      [42, 51, 13, false], // unit 2 (back-right)
      [36, 54, 15, true],  // unit 1 (middle, taller crimson basalt)
      [30, 57, 13, false], // unit 0 (front-left)
    ];

    for (const [ufx, ufy, wallH, isMid] of units) {
      const wL = 13;
      const wR = 6;
      isoBox(ctx, ufx, ufy, wL, wR, wallH, {
        top: isMid ? BASALT_TOP : OBS_TOP,
        left: isMid ? BASALT_LEFT : OBS_LEFT,
        right: isMid ? BASALT_RIGHT : OBS_RIGHT,
      });
      // Basalt foundation course
      isoBox(ctx, ufx, ufy, wL, wR, 2, {
        top: GOLD_MID,
        left: BASALT_LEFT,
        right: BASALT_RIGHT,
      });

      // Individual narrow pitched dragon-scale roof per townhome
      isoPitchedRoof(ctx, ufx, ufy, wL + 2, wR, wallH, 6, {
        leftSlope: isMid ? OBS_LEFT : BASALT_LEFT,
        rightSlope: isMid ? PURPLE_MID : BASALT_TOP,
        gable: isMid ? BASALT_RIGHT : PURPLE_MID,
        ridge: GOLD_MID,
      });

      // Fanged basalt doorway on the front-right street face
      rightWallRect(ctx, ufx, ufy, 1, 1, 3, 6, OUT);
      rightWallRect(ctx, ufx, ufy, 2, 1, 1, 5, '#260707');
      rightWallRect(ctx, ufx, ufy, 2, 1, 1, 2, LAVA_MID);
      rightWallRect(ctx, ufx, ufy, 2, 5, 1, 1, HORN_LIGHT);

      // Upper and lower ember-slit windows
      const winCol = (isMid ? frame === 0 : frame === 1) ? LAVA_BRIGHT : LAVA_MID;
      rightWallRect(ctx, ufx, ufy, 4, 3, 1, 3, LAVA_RED);
      rightWallRect(ctx, ufx, ufy, 4, 4, 1, 2, winCol);
      rightWallRect(ctx, ufx, ufy, 2, 9, 3, 3, OUT);
      rightWallRect(ctx, ufx, ufy, 3, 10, 1, 2, winCol);

      // Horn finial at the party-wall ridge peak
      drawHorn(ctx, ufx - 4, ufy - wallH - 7, ufx - 5, ufy - wallH - 12, 1);
    }

    // Left gable windows on the front-most unit
    leftWallRect(ctx, 30, 57, 3, 4, 3, 4, OUT);
    leftWallRect(ctx, 30, 57, 4, 5, 1, 2, LAVA_BRIGHT);
    leftWallRect(ctx, 30, 57, 8, 4, 3, 4, OUT);
    leftWallRect(ctx, 30, 57, 9, 5, 1, 2, LAVA_MID);

    // Glowing lava-seam street gutter along the front stoops
    for (let i = 0; i < 16; i++) {
      const gx = 32 + i;
      const gy = 58 - (i >> 1);
      px(ctx, gx, gy, i % 3 === frame ? LAVA_BRIGHT : LAVA_RED);
    }

    return canvas;
  });
}

/** Aristocratic Dragonlord manor with walled lava-courtyard, pillared porch, magma chimney, and tall horned corner turret. */
function buildManor(): HTMLCanvasElement[] {
  return [0, 1].map((frame) => {
    const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);
    isoDiamond(ctx, 32, 48, 29, ASH_1, OUT);
    isoDiamond(ctx, 32, 48, 25, PURPLE_MID, GOLD_DARK);

    // Tall back-left obsidian corner turret (the manor's single tall vertical feature)
    const tFx = 24;
    const tFy = 48;
    isoBox(ctx, tFx, tFy, 8, 8, 23, {
      top: OBS_TOP,
      left: OBS_LEFT,
      right: OBS_RIGHT,
    });
    isoBox(ctx, tFx, tFy - 20, 9, 9, 3, {
      top: GOLD_BRIGHT,
      left: GOLD_DARK,
      right: GOLD_MID,
    });
    rightWallRect(ctx, tFx, tFy, 3, 12, 2, 6, LAVA_RED);
    rightWallRect(ctx, tFx, tFy, 3, 13, 1, 4, frame ? LAVA_BRIGHT : LAVA_MID);
    drawHorn(ctx, 20, 22, 16, 12, 2);
    drawHorn(ctx, 28, 22, 32, 12, -2);
    drawHorn(ctx, 24, 20, 24, 10, 0);

    // Main detached two-storey crimson-basalt & obsidian hall
    const fx = 34;
    const fy = 54;
    const wL = 14;
    const wR = 16;
    const wallH = 15;
    isoBox(ctx, fx, fy, wL, wR, wallH, {
      top: BASALT_TOP,
      left: BASALT_LEFT,
      right: BASALT_RIGHT,
    });
    // Rich golden belt course & cornice trim
    isoBox(ctx, fx, fy - 7, wL, wR, 2, {
      top: GOLD_BRIGHT,
      left: GOLD_DARK,
      right: GOLD_MID,
    });
    isoBox(ctx, fx, fy - wallH + 2, wL, wR, 2, {
      top: GOLD_BRIGHT,
      left: GOLD_DARK,
      right: GOLD_MID,
    });

    // Steep purple-obsidian gable roof with golden ridge
    isoPitchedRoof(ctx, fx, fy, wL + 2, wR + 2, wallH, 9, {
      leftSlope: OBS_LEFT,
      rightSlope: PURPLE_MID,
      gable: BASALT_TOP,
      ridge: GOLD_BRIGHT,
    });

    // Basalt magma-chimney on the back-right slope with glowing ember vent
    isoBox(ctx, 41, 32, 4, 4, 8, {
      top: OBS_TOP,
      left: BASALT_LEFT,
      right: BASALT_RIGHT,
    });
    px(ctx, 41, 22 - frame, LAVA_BRIGHT);
    px(ctx, 42, 23, LAVA_MID);

    // Upper floor arched golden-framed windows
    for (const v0 of [3, 9, 13]) {
      rightWallRect(ctx, fx, fy, v0, 10, 2, 3, GOLD_MID);
      rightWallRect(ctx, fx, fy, v0, 10, 1, 2, LAVA_BRIGHT);
    }
    for (const u0 of [4, 9]) {
      leftWallRect(ctx, fx, fy, u0, 10, 3, 3, GOLD_DARK);
      leftWallRect(ctx, fx, fy, u0 + 1, 10, 1, 2, LAVA_MID);
    }

    // Covered basalt & gold front porch on the right facade
    isoBox(ctx, 38, 56, 5, 7, 7, {
      top: GOLD_MID,
      left: OBS_LEFT,
      right: OBS_RIGHT,
    });
    rightWallRect(ctx, 38, 56, 2, 1, 3, 5, LAVA_MID);
    rightWallRect(ctx, 38, 56, 3, 1, 1, 4, frame ? LAVA_BRIGHT : LAVA_RED);

    // Low obsidian courtyard garden wall enclosing the front perimeter + red/gold banner
    isoBox(ctx, 32, 60, 14, 2, 4, {
      top: OBS_TOP,
      left: OBS_LEFT,
      right: OBS_RIGHT,
    });
    isoBox(ctx, 45, 54, 2, 12, 4, {
      top: OBS_TOP,
      left: OBS_LEFT,
      right: OBS_RIGHT,
    });
    // Crimson & gold house banner hanging beside the turret
    leftWallRect(ctx, fx, fy, 2, 3, 2, 6, BASALT_TOP);
    leftWallRect(ctx, fx, fy, 2, 3, 2, 1, GOLD_BRIGHT);

    return canvas;
  });
}

/** Low open obsidian market booth (~0.6 tile tall) with red-and-gold dragon-scale awning and glowing ore/gold wares. */
function buildStall(): HTMLCanvasElement[] {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);
  // Compact volcanic flagstones footprint (keeps total height ~0.6 tile, y = 35..58)
  isoDiamond(ctx, 32, 49, 23, ASH_1, OUT);
  isoDiamond(ctx, 32, 49, 18, OBS_RIGHT, GOLD_DARK);

  // Low obsidian & basalt display counter in the center-front
  const fx = 33;
  const fy = 55;
  const wL = 12;
  const wR = 14;
  isoBox(ctx, fx, fy, wL, wR, 5, {
    top: OBS_TOP,
    left: BASALT_LEFT,
    right: BASALT_RIGHT,
  });
  // Gold trim band along counter front
  rightWallRect(ctx, fx, fy, 1, 4, wR - 2, 1, GOLD_MID);
  leftWallRect(ctx, fx, fy, 1, 4, wL - 2, 1, GOLD_DARK);

  // Goods on the counter: glittering gold ingots, ruby shards, and glowing emberstone orbs
  drawGoldHeap(ctx, 31, 48, 4, 3);
  rect(ctx, 36, 46, 3, 2, LAVA_RED);
  px(ctx, 37, 45, LAVA_BRIGHT);
  rect(ctx, 40, 44, 3, 2, PURPLE_LIGHT);
  px(ctx, 41, 43, GOLD_BRIGHT);

  // Four black-iron & bone spear posts supporting the low open awning (zero wood)
  for (const [px0, py0] of [
    [22, 49],
    [32, 54],
    [45, 47],
    [35, 42],
  ] as const) {
    rect(ctx, px0, py0 - 10, 2, 10, OUT);
    rect(ctx, px0, py0 - 9, 1, 8, HORN_MID);
  }

  // Low slanted crimson-and-gold striped dragon-banner awning (y = 35..45)
  for (let u = 0; u < wL + 2; u++) {
    for (let v = 0; v < wR + 2; v++) {
      const stripe = ((v >> 1) & 1) === 0;
      const x = fx - u + v;
      const y = fy - 11 - ((u + v) >> 1);
      const isEdge = u === 0 || u === wL + 1 || v === 0 || v === wR + 1;
      const col = isEdge ? OUT : stripe ? BASALT_TOP : GOLD_MID;
      rect(ctx, x, y, 1, 2, col);
    }
  }
  // Small bone horns tipping the front awning corners
  drawHorn(ctx, 33, 44, 33, 39, 0);
  drawHorn(ctx, 46, 37, 49, 33, -1);

  return [canvas];
}

/** Two-storey obsidian & basalt Dragonkin tavern with warm magma-lit windows, swinging golden chalice sign, and iron magma-casks. */
function buildTavern(): HTMLCanvasElement[] {
  return [0, 1].map((frame) => {
    const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);
    isoDiamond(ctx, 32, 48, 28, ASH_1, OUT);
    isoDiamond(ctx, 32, 48, 24, BASALT_LEFT, GOLD_DARK);

    const fx = 31;
    const fy = 56;
    const wL = 16;
    const wR = 18;

    // Ground floor: heavy black obsidian walls (h = 9)
    isoBox(ctx, fx, fy, wL, wR, 9, {
      top: OBS_TOP,
      left: OBS_LEFT,
      right: OBS_RIGHT,
    });
    // Overhanging second storey: crimson basalt & purple obsidian gallery (h = 8)
    isoBox(ctx, fx, fy - 9, wL + 1, wR + 1, 8, {
      top: BASALT_TOP,
      left: BASALT_LEFT,
      right: BASALT_RIGHT,
    });
    // Gold belt divider between storeys
    isoBox(ctx, fx, fy - 8, wL + 1, wR + 1, 2, {
      top: GOLD_BRIGHT,
      left: GOLD_DARK,
      right: GOLD_MID,
    });

    // Steep pitched roof with curved horn eaves
    isoPitchedRoof(ctx, fx, fy, wL + 3, wR + 3, 17, 9, {
      leftSlope: OBS_LEFT,
      rightSlope: BASALT_TOP,
      gable: PURPLE_MID,
      ridge: GOLD_MID,
    });
    drawHorn(ctx, 15, 34, 11, 27, 2);
    drawHorn(ctx, 48, 33, 52, 26, -2);

    // Fanged arched tavern doorway on the right wall
    rightWallRect(ctx, fx, fy, 3, 1, 5, 7, OUT);
    rightWallRect(ctx, fx, fy, 4, 1, 3, 6, '#2b0909');
    rightWallRect(ctx, fx, fy, 4, 1, 3, 2, LAVA_MID);

    // Warm lit windows across both storeys (right and left walls)
    const glow1 = frame === 0 ? LAVA_BRIGHT : LAVA_MID;
    const glow2 = frame === 0 ? LAVA_MID : LAVA_BRIGHT;
    rightWallRect(ctx, fx, fy, 10, 2, 6, 5, OUT);
    rightWallRect(ctx, fx, fy, 11, 3, 4, 3, glow1);
    for (const v0 of [3, 9, 14]) {
      rightWallRect(ctx, fx, fy, v0, 11, 4, 4, OUT);
      rightWallRect(ctx, fx, fy, v0 + 1, 12, 2, 2, glow2);
    }
    for (const u0 of [4, 10]) {
      leftWallRect(ctx, fx, fy, u0, 3, 4, 4, OUT);
      leftWallRect(ctx, fx, fy, u0 + 1, 4, 2, 2, glow2);
      leftWallRect(ctx, fx, fy, u0, 11, 4, 4, OUT);
      leftWallRect(ctx, fx, fy, u0 + 1, 12, 2, 2, glow1);
    }

    // Projecting bone-horn bracket on right corner with hanging golden flame-chalice tavern sign
    drawHorn(ctx, 48, 39, 55, 36, -1);
    rect(ctx, 53, 38, 1, 3, OUT);
    rect(ctx, 51, 40, 5, 5, OUT);
    rect(ctx, 52, 41, 3, 3, GOLD_BRIGHT);
    px(ctx, 53, 41, LAVA_RED);

    // Two banded black-iron & crimson-basalt magma-ale casks ("barrels", no wood) by the door
    for (const [bx, by] of [
      [39, 56],
      [43, 54],
    ] as const) {
      isoBox(ctx, bx, by, 4, 4, 4, {
        top: BASALT_TOP,
        left: OBS_LEFT,
        right: BASALT_RIGHT,
      });
      rightWallRect(ctx, bx, by, 0, 2, 4, 1, GOLD_MID);
      px(ctx, bx + 1, by - 2, LAVA_BRIGHT); // glowing molten spigot
    }

    return canvas;
  });
}

/** Imposing obsidian & gold Hoard Bank with fluted golden pillars, heavy circular vault door, and gleaming dragon-coin sign. */
function buildBank(): HTMLCanvasElement[] {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);
  isoDiamond(ctx, 32, 48, 29, ASH_1, OUT);
  isoDiamond(ctx, 32, 48, 25, GOLD_DARK, OUT);
  isoDiamond(ctx, 32, 48, 23, OBS_RIGHT, GOLD_MID);

  const fx = 32;
  const fy = 56;
  const wL = 18;
  const wR = 18;
  const wallH = 17;

  // Heavy stepped golden podium base + fortified black-obsidian vault block
  isoBox(ctx, fx, fy, wL, wR, wallH, {
    top: OBS_TOP,
    left: OBS_LEFT,
    right: OBS_RIGHT,
  });
  isoBox(ctx, fx, fy, wL, wR, 3, {
    top: GOLD_BRIGHT,
    left: GOLD_DARK,
    right: GOLD_MID,
  });
  // Heavy golden entablature & roof parapet
  isoBox(ctx, fx, fy - wallH + 3, wL + 1, wR + 1, 3, {
    top: GOLD_BRIGHT,
    left: GOLD_DARK,
    right: GOLD_MID,
  });
  // Stepped golden vault roof dome
  isoBox(ctx, 32, 36, 12, 12, 4, {
    top: BASALT_TOP,
    left: GOLD_DARK,
    right: GOLD_MID,
  });

  // Four fluted golden columns along the right facade
  for (const vCol of [1, 5, 12, 16]) {
    rightWallRect(ctx, fx, fy, vCol, 3, 2, 11, OUT);
    rightWallRect(ctx, fx, fy, vCol, 3, 1, 11, GOLD_BRIGHT);
  }
  // Golden pilasters along the left wall with lava-slit vents between them
  for (const uCol of [3, 9, 15]) {
    leftWallRect(ctx, fx, fy, uCol, 3, 2, 11, GOLD_DARK);
  }
  for (const uWin of [6, 12]) {
    leftWallRect(ctx, fx, fy, uWin, 5, 2, 7, LAVA_RED);
    leftWallRect(ctx, fx, fy, uWin, 6, 1, 5, LAVA_MID);
  }

  // Massive circular golden-and-obsidian vault door in the center of the right facade
  disc(ctx, 40, 46, 5, OUT);
  disc(ctx, 40, 46, 4, GOLD_MID);
  disc(ctx, 40, 46, 2, OBS_LEFT);
  px(ctx, 40, 46, LAVA_BRIGHT); // ruby vault lock core

  // Giant gleaming Dragon Coin emblem mounted atop the front parapet + twin horn guards
  disc(ctx, 37, 29, 5, OUT);
  disc(ctx, 37, 29, 4, GOLD_BRIGHT);
  disc(ctx, 37, 29, 3, GOLD_MID);
  rect(ctx, 36, 27, 2, 5, LAVA_RED); // vertical dragon-slit eye on the coin
  px(ctx, 37, 28, LAVA_BRIGHT);
  drawHorn(ctx, 31, 31, 27, 23, 2);
  drawHorn(ctx, 43, 31, 47, 23, -2);

  return [canvas];
}

/** Modest purple-obsidian Hall of Draconic Lore with tall stained-magma lancet windows and a carved golden scroll sign. */
function buildLibrary(): HTMLCanvasElement[] {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);
  isoDiamond(ctx, 32, 48, 27, ASH_1, OUT);
  isoDiamond(ctx, 32, 48, 22, PURPLE_MID, GOLD_DARK);

  const fx = 32;
  const fy = 56;
  const wL = 14;
  const wR = 18;
  const wallH = 13;

  // Modest rectangular archive hall in deep purple obsidian & crimson basalt
  isoBox(ctx, fx, fy, wL, wR, wallH, {
    top: PURPLE_LIGHT,
    left: OBS_LEFT,
    right: PURPLE_MID,
  });
  isoBox(ctx, fx, fy, wL, wR, 2, {
    top: BASALT_TOP,
    left: BASALT_LEFT,
    right: BASALT_RIGHT,
  });

  // Low barrel-vaulted basalt roof with golden spine (distinct from pitched house & stepped school)
  isoBox(ctx, fx - 1, fy - wallH, wL - 2, wR - 2, 3, {
    top: BASALT_TOP,
    left: BASALT_LEFT,
    right: BASALT_RIGHT,
  });
  isoBox(ctx, fx - 3, fy - wallH - 3, wL - 6, wR - 4, 2, {
    top: GOLD_MID,
    left: GOLD_DARK,
    right: GOLD_BRIGHT,
  });

  // Entrance steps & arched archive doorway on front-right
  rightWallRect(ctx, fx, fy, 2, 1, 4, 7, OUT);
  rightWallRect(ctx, fx, fy, 3, 1, 2, 6, '#1c0d18');
  rightWallRect(ctx, fx, fy, 2, 8, 4, 1, GOLD_BRIGHT);

  // Three tall arched stained-lava windows along the right wall
  for (const v0 of [7, 11, 15]) {
    rightWallRect(ctx, fx, fy, v0, 3, 3, 8, OUT);
    rightWallRect(ctx, fx, fy, v0 + 1, 4, 1, 6, LAVA_MID);
    rightWallRect(ctx, fx, fy, v0 + 1, 7, 1, 2, LAVA_BRIGHT);
  }
  // Two tall lancet windows on the shaded left wall
  for (const u0 of [4, 9]) {
    leftWallRect(ctx, fx, fy, u0, 3, 3, 8, OUT);
    leftWallRect(ctx, fx, fy, u0 + 1, 4, 1, 6, LAVA_RED);
    leftWallRect(ctx, fx, fy, u0 + 1, 6, 1, 2, GOLD_BRIGHT);
  }

  // Unfurled golden metal scroll / rune-tablet sign mounted above the entrance
  isoBox(ctx, 36, 40, 3, 7, 5, {
    top: GOLD_BRIGHT,
    left: GOLD_DARK,
    right: GOLD_MID,
  });
  // Draconic rune lines etched in crimson on the scroll sign
  rightWallRect(ctx, 36, 40, 1, 3, 5, 1, LAVA_RED);
  rightWallRect(ctx, 36, 40, 1, 1, 4, 1, LAVA_RED);

  return [canvas];
}

/** Volcanic spire observatory (tallest service building) with lava courtyard, crimson-and-gold banners, and horned astrolabe dome. */
function buildAcademy(): HTMLCanvasElement[] {
  return [0, 1].map((frame) => {
    const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);
    // Walled volcanic courtyard with glowing lava channels
    isoDiamond(ctx, 32, 48, 29, ASH_1, OUT);
    isoDiamond(ctx, 32, 48, 25, BASALT_LEFT, LAVA_RED);
    isoDiamond(ctx, 32, 48, 20, OBS_RIGHT, GOLD_DARK);

    // Broad octagonal-feeling obsidian star-hall base
    const fx = 32;
    const fy = 55;
    isoBox(ctx, fx, fy, 18, 18, 11, {
      top: PURPLE_LIGHT,
      left: OBS_LEFT,
      right: OBS_RIGHT,
    });
    isoBox(ctx, fx, fy - 9, 19, 19, 2, {
      top: GOLD_BRIGHT,
      left: GOLD_DARK,
      right: GOLD_MID,
    });

    // Soaring volcanic observatory spire rising high into the upper canvas (reaches y = 5)
    const sFx = 32;
    const sFy = 44;
    isoBox(ctx, sFx, sFy, 11, 11, 20, {
      top: BASALT_TOP,
      left: OBS_LEFT,
      right: BASALT_RIGHT,
    });

    // Long crimson-and-gold vertical banners hanging down both faces of the spire
    rightWallRect(ctx, sFx, sFy, 2, 3, 3, 14, GOLD_MID);
    rightWallRect(ctx, sFx, sFy, 3, 4, 1, 12, LAVA_RED);
    leftWallRect(ctx, sFx, sFy, 2, 3, 3, 14, GOLD_DARK);
    leftWallRect(ctx, sFx, sFy, 3, 4, 1, 12, BASALT_TOP);

    // Observatory dome & glowing magma-crystal telescope aperture at the summit
    disc(ctx, 32, 20, 7, OUT);
    disc(ctx, 32, 20, 6, PURPLE_MID);
    disc(ctx, 30, 18, 4, PURPLE_LIGHT);
    // Telescope slit & pulsing golden astrolabe ring
    disc(ctx, 35, 19, 3, OUT);
    disc(ctx, 35, 19, 2, frame === 0 ? LAVA_BRIGHT : LAVA_MID);
    px(ctx, 36, 18, '#ffffff');

    // Giant curved dragon horns crowning the observatory dome around a floating star-flame
    drawHorn(ctx, 25, 19, 18, 7, 4);
    drawHorn(ctx, 39, 19, 46, 7, -4);
    drawHorn(ctx, 32, 14, 32, 5, 0);
    drawDragonFlame(ctx, 32, 13, 6, frame);

    // Forecourt lava-brazier pillars flanking the observatory steps
    for (const [bx, by] of [
      [21, 54],
      [43, 54],
    ] as const) {
      isoBox(ctx, bx, by, 4, 4, 6, {
        top: GOLD_MID,
        left: OBS_LEFT,
        right: BASALT_RIGHT,
      });
      px(ctx, bx, by - 7, frame ? LAVA_BRIGHT : LAVA_MID);
    }

    return canvas;
  });
}

/** Pale bone-stone & alabaster volcanic clinic with a glowing crimson healing cross and obsidian cinder-herb pots. */
function buildClinic(): HTMLCanvasElement[] {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);
  isoDiamond(ctx, 32, 48, 27, ASH_1, OUT);
  isoDiamond(ctx, 32, 48, 23, HORN_DARK, GOLD_DARK);

  const fx = 32;
  const fy = 55;
  const wL = 15;
  const wR = 16;
  const wallH = 14;

  // Clean pale bone-ash & bleached volcanic stone walls (distinct pale silhouette)
  isoBox(ctx, fx, fy, wL, wR, wallH, {
    top: HORN_LIGHT,
    left: HORN_DARK,
    right: HORN_MID,
  });
  // Crimson basalt plinth & roof cornice band
  isoBox(ctx, fx, fy, wL, wR, 2, {
    top: BASALT_TOP,
    left: BASALT_LEFT,
    right: BASALT_RIGHT,
  });
  isoBox(ctx, fx, fy - wallH + 2, wL + 1, wR + 1, 2, {
    top: GOLD_BRIGHT,
    left: BASALT_LEFT,
    right: BASALT_TOP,
  });

  // Smooth pale dome roof with a warm thermal vent
  disc(ctx, 31, 35, 7, OUT);
  disc(ctx, 31, 35, 6, HORN_MID);
  disc(ctx, 29, 34, 4, HORN_LIGHT);
  px(ctx, 31, 29, LAVA_BRIGHT);

  // Prominent crimson-and-gold Healing Cross symbol on the right wall
  rightWallRect(ctx, fx, fy, 9, 4, 5, 7, OUT);
  rightWallRect(ctx, fx, fy, 11, 5, 1, 5, LAVA_RED);
  rightWallRect(ctx, fx, fy, 10, 7, 3, 1, LAVA_RED);
  px(ctx, fx + 11, fy - 5 - 7, LAVA_BRIGHT);

  // Clean arched sanctuary doorway & warm window
  rightWallRect(ctx, fx, fy, 3, 1, 4, 7, OUT);
  rightWallRect(ctx, fx, fy, 4, 1, 2, 6, '#2b0909');
  rightWallRect(ctx, fx, fy, 4, 1, 2, 2, LAVA_BRIGHT);
  leftWallRect(ctx, fx, fy, 5, 5, 5, 5, OUT);
  leftWallRect(ctx, fx, fy, 6, 6, 3, 3, LAVA_BRIGHT);

  // Three carved black-obsidian herb pots along the front terrace growing crimson & gold ember-herbs
  for (const [px0, py0] of [
    [23, 54],
    [37, 57],
    [43, 54],
  ] as const) {
    isoBox(ctx, px0, py0, 4, 4, 3, {
      top: OBS_TOP,
      left: OBS_LEFT,
      right: OBS_RIGHT,
    });
    // Medicinal cinder-herb leaves & glowing ruby buds
    rect(ctx, px0 - 1, py0 - 6, 3, 2, BASALT_TOP);
    px(ctx, px0, py0 - 7, LAVA_RED);
    px(ctx, px0 - 1, py0 - 5, GOLD_BRIGHT);
    px(ctx, px0 + 1, py0 - 5, LAVA_BRIGHT);
  }

  return [canvas];
}

/** Emberstone forge workshop with a glowing crystal anvil, molten lava trough, basalt hood-chimney, and emberstone crates (3 frames). */
function buildWorkshop(): HTMLCanvasElement[] {
  return [0, 1, 2].map((frame) => {
    const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);
    isoDiamond(ctx, 32, 48, 28, ASH_1, OUT);
    isoDiamond(ctx, 32, 48, 24, OBS_RIGHT, LAVA_RED);

    // Back-left open-front obsidian forge shelter & flared basalt chimney hood
    const fx = 26;
    const fy = 49;
    isoBox(ctx, fx, fy, 11, 11, 11, {
      top: BASALT_TOP,
      left: OBS_LEFT,
      right: BASALT_RIGHT,
    });
    isoBox(ctx, 23, 38, 6, 6, 12, {
      top: OBS_TOP,
      left: OBS_LEFT,
      right: OBS_RIGHT,
    });
    drawHorn(ctx, 20, 27, 17, 21, 1);
    drawHorn(ctx, 26, 27, 29, 21, -1);
    // Roaring forge mouth inside the shelter + rising chimney flame
    rightWallRect(ctx, fx, fy, 2, 1, 7, 7, OUT);
    rightWallRect(ctx, fx, fy, 3, 1, 5, 6, LAVA_RED);
    rightWallRect(ctx, fx, fy, 4, 1, 3, 4, frame === 1 ? LAVA_BRIGHT : LAVA_MID);
    drawDragonFlame(ctx, 23, 25, 6, frame);

    // Molten lava trough channeling liquid fire across the work yard (animates 3 frames)
    isoBox(ctx, 31, 55, 5, 14, 3, {
      top: LAVA_RED,
      left: OBS_LEFT,
      right: OBS_RIGHT,
    });
    for (let v = 1; v < 13; v++) {
      const x = 31 + v - 2;
      const y = 52 - (v >> 1);
      const col = (v + frame) % 3 === 0 ? LAVA_BRIGHT : LAVA_MID;
      rect(ctx, x, y, 2, 1, col);
    }

    // Centerpiece GLOWING CRYSTAL ANVIL on a stepped obsidian pedestal (animates 3 frames)
    isoBox(ctx, 37, 52, 6, 6, 3, {
      top: OBS_TOP,
      left: OBS_LEFT,
      right: OBS_RIGHT,
    });
    const anvilCols = [
      { top: LAVA_BRIGHT, left: LAVA_RED, right: LAVA_MID },
      { top: '#ffffff', left: LAVA_MID, right: LAVA_BRIGHT },
      { top: GOLD_BRIGHT, left: PURPLE_LIGHT, right: LAVA_MID },
    ] as const;
    const aCol = anvilCols[frame % 3]!;
    // Anvil waist + horned crystal working face
    isoBox(ctx, 37, 49, 4, 5, 4, aCol);
    rect(ctx, 33, 43, 8, 2, OUT);
    rect(ctx, 34, 43, 6, 2, aCol.top);
    px(ctx, 32, 44, aCol.right); // left crystal anvil horn
    px(ctx, 41, 44, aCol.top);   // right crystal anvil horn
    // Animated forge sparks flying off the crystal anvil
    if (frame === 0) {
      px(ctx, 35, 40, LAVA_BRIGHT);
      px(ctx, 39, 41, GOLD_BRIGHT);
    } else if (frame === 1) {
      px(ctx, 33, 39, '#ffffff');
      px(ctx, 37, 38, LAVA_BRIGHT);
      px(ctx, 41, 40, LAVA_MID);
    } else {
      px(ctx, 36, 41, LAVA_MID);
      px(ctx, 40, 39, LAVA_BRIGHT);
    }

    // Obsidian tool bench with golden smithing tongs & iron-bound basalt crates of emberstone
    isoBox(ctx, 25, 57, 7, 4, 4, {
      top: OBS_TOP,
      left: OBS_LEFT,
      right: BASALT_RIGHT,
    });
    rect(ctx, 22, 51, 4, 1, GOLD_BRIGHT);
    // Crates of glowing emberstone in front-right
    isoBox(ctx, 45, 55, 5, 5, 4, {
      top: BASALT_TOP,
      left: OBS_LEFT,
      right: GOLD_DARK,
    });
    rect(ctx, 44, 49, 3, 2, LAVA_RED);
    px(ctx, 45, 49, LAVA_BRIGHT);

    return canvas;
  });
}

/** 16x24 dragon-kin warlord with twin curved horns, glowing eyes, scale armor, tail, and feet at row 23. */
function buildCitizen(frame: number, variant: number): HTMLCanvasElement {
  const [canvas, ctx] = makeCanvas(16, 24);
  const armorCols = [BASALT_TOP, GOLD_MID, PURPLE_LIGHT, LAVA_MID] as const;
  const armor = armorCols[variant & 3]!;
  const scaleSkin = variant % 2 === 0 ? '#591f1f' : '#2e2438';
  const step = frame & 3;
  const leftLegY = step === 1 ? 19 : 20;
  const rightLegY = step === 3 ? 19 : 20;

  // Twin curved dragon horns on top of helm/head
  rect(ctx, 3, 1, 2, 4, OUT);
  px(ctx, 3, 1, HORN_LIGHT);
  px(ctx, 4, 2, HORN_MID);
  rect(ctx, 11, 1, 2, 4, OUT);
  px(ctx, 12, 1, HORN_LIGHT);
  px(ctx, 11, 2, HORN_MID);

  // Draconic head & glowing ember eyes
  rect(ctx, 5, 4, 6, 6, OUT);
  rect(ctx, 6, 5, 4, 4, scaleSkin);
  px(ctx, 6, 6, LAVA_BRIGHT);
  px(ctx, 9, 6, LAVA_BRIGHT);

  // Spiked obsidian & scale chestplate + gold belt
  rect(ctx, 4, 10, 8, 9, OUT);
  rect(ctx, 5, 11, 6, 7, armor);
  rect(ctx, 6, 12, 4, 3, OBS_LEFT);
  rect(ctx, 5, 16, 6, 1, GOLD_BRIGHT);

  // Spiked draconic tail protruding on the left
  rect(ctx, 1, 15, 4, 3, OUT);
  rect(ctx, 2, 16, 3, 1, scaleSkin);
  px(ctx, 1, 15, LAVA_MID);

  // Clawed boots touching bottom row (y = 23)
  rect(ctx, 5, leftLegY, 3, 24 - leftLegY, OUT);
  rect(ctx, 6, leftLegY, 1, 23 - leftLegY, OBS_RIGHT);
  rect(ctx, 5, 22, 2, 2, GOLD_DARK);

  rect(ctx, 8, rightLegY, 3, 24 - rightLegY, OUT);
  rect(ctx, 9, rightLegY, 1, 23 - rightLegY, OBS_RIGHT);
  rect(ctx, 9, 22, 2, 2, GOLD_DARK);

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
