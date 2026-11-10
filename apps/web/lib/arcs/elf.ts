import {
  disc,
  isoBox,
  isoDiamond,
  isoPitchedRoof,
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

// ELF PALETTE: deep emerald, leaf green, bark brown, ivory, soft gold, silver-blue lantern glow
const EMERALD_DARK = '#14382d';
const EMERALD_MID = '#1e5242';
const EMERALD_LIGHT = '#2c735c';
const LEAF_DARK = '#1e4d2b';
const LEAF_MID = '#2e6f40';
const LEAF_LIGHT = '#489c5c';
const LEAF_HIGHLIGHT = '#7ed992';
const BARK_DARK = '#3b2316';
const BARK_MID = '#593724';
const BARK_LIGHT = '#784d35';
const IVORY_DARK = '#b8b2a6';
const IVORY_MID = '#dbd5c7';
const IVORY_LIGHT = '#f5f1e6';
const GOLD_DARK = '#8f6f1d';
const GOLD_MID = '#c79f32';
const GOLD_LIGHT = '#f5d76e';
const LANTERN_CORE = '#e0fbff';
const LANTERN_MID = '#7ce0f7';
const LANTERN_DIM = '#3ba3c4';

/** Draw a curved elven leaf-dome canopy centered at (cx, baseY) with radius rx and height ry. */
function drawElvenCanopy(
  ctx: CanvasRenderingContext2D,
  cx: number,
  baseY: number,
  rx: number,
  ry: number,
  sway = 0,
): void {
  for (let dy = -ry; dy <= 2; dy++) {
    const t = Math.max(0, 1 - (dy * dy) / (ry * ry + 2));
    const span = Math.round(rx * Math.sqrt(t));
    if (span <= 0) continue;
    const x0 = cx + (dy < -ry / 2 ? sway : 0);
    rect(ctx, x0 - span - 1, baseY + dy, (span + 1) * 2, 1, OUT);
    const col =
      dy < -ry * 0.55
        ? LEAF_HIGHLIGHT
        : dy < -ry * 0.2
          ? LEAF_LIGHT
          : dy <= 0
            ? LEAF_MID
            : LEAF_DARK;
    rect(ctx, x0 - span, baseY + dy, span * 2, 1, col);
    // Scalloped gold-and-emerald shingle trim at the eaves (dy === 1)
    if (dy === 1) {
      for (let dx = -span; dx < span; dx += 3) {
        px(ctx, x0 + dx, baseY + dy, GOLD_LIGHT);
      }
    }
  }
  // Hanging emerald vines under eaves
  for (const vx of [-rx + 3, -rx / 2, rx / 2 - 1, rx - 4]) {
    const x = Math.round(cx + vx);
    rect(ctx, x, baseY + 2, 1, 4, LEAF_DARK);
    px(ctx, x, baseY + 5, LEAF_LIGHT);
  }
}

/** Draw a hanging silver-blue elven lantern at (lx, ly). */
function drawSilverLantern(ctx: CanvasRenderingContext2D, lx: number, ly: number, frame = 0): void {
  px(ctx, lx, ly - 2, GOLD_MID);
  rect(ctx, lx - 1, ly - 1, 3, 4, OUT);
  rect(ctx, lx - 1, ly, 3, 2, frame % 2 === 0 ? LANTERN_MID : LANTERN_CORE);
  px(ctx, lx, ly, LANTERN_CORE);
  px(ctx, lx, ly + 3, GOLD_LIGHT);
}

/** Ground tile: lush deep-emerald grass with soft moss patches and tiny glowing silver-blue / gold flowers. */
function buildElfGround(parity: 0 | 1, variant: number): HTMLCanvasElement {
  const [canvas, ctx] = makeCanvas(SPRITE_W, TILE_H);
  const base = parity === 0 ? '#1f4f37' : '#1a4530';
  const moss = parity === 0 ? '#2b6948' : '#255c3f';
  const shade = parity === 0 ? '#163b29' : '#123323';
  const border = '#0f2b1d';

  isoDiamond(ctx, 32, 16, 32, base, border);

  for (let u = 2; u < 30; u++) {
    for (let v = 2; v < 30; v++) {
      const h = tileHash(u, v, variant * 19 + parity * 11 + 3);
      const r = h % 25;
      if (r === 0 || r === 1 || r === 2) {
        isoTexel(ctx, 32, 0, u, v, moss);
      } else if (r === 3 || r === 4) {
        isoTexel(ctx, 32, 0, u, v, shade);
      }
    }
  }

  if (variant === 1) {
    // Glowing silver-blue starlight blossoms
    const flowers = [
      [9, 13],
      [20, 10],
      [15, 22],
    ] as const;
    for (const [u, v] of flowers) {
      const sx = 32 + (u - v);
      const sy = (u + v) >> 1;
      px(ctx, sx, sy + 1, LEAF_LIGHT);
      px(ctx, sx, sy, LANTERN_MID);
      px(ctx, sx + 1, sy, LANTERN_CORE);
    }
  } else if (variant === 2) {
    // Soft gold & ivory sylvan lilies
    const flowers = [
      [12, 18, GOLD_LIGHT],
      [22, 14, IVORY_LIGHT],
      [10, 9, GOLD_LIGHT],
    ] as const;
    for (const [u, v, col] of flowers) {
      const sx = 32 + (u - v);
      const sy = (u + v) >> 1;
      px(ctx, sx, sy + 1, LEAF_MID);
      px(ctx, sx, sy, col);
    }
  } else if (variant === 3) {
    // Lush moss rings and glowing dewdrop
    const spots = [
      [13, 19],
      [21, 11],
    ] as const;
    for (const [u, v] of spots) {
      const sx = 32 + (u - v);
      const sy = (u + v) >> 1;
      rect(ctx, sx - 1, sy, 3, 1, LEAF_LIGHT);
      px(ctx, sx, sy - 1, LEAF_HIGHLIGHT);
      px(ctx, sx, sy, LANTERN_CORE);
    }
  }

  return canvas;
}

/** Foundation pad: mossy emerald glade with ivory-and-gold elven ring inlay. */
function buildElfFoundation(): HTMLCanvasElement {
  const [canvas, ctx] = makeCanvas(SPRITE_W, TILE_H);
  isoDiamond(ctx, 32, 16, 32, '#24573d', '#112e1f');
  isoDiamond(ctx, 32, 16, 26, '#2e6b4b', GOLD_DARK);
  isoDiamond(ctx, 32, 16, 20, '#365e49', IVORY_DARK);
  return canvas;
}

/**
 * 1. HOUSE: Living-Wood Tree-House.
 * Gnarled bark trunk with flaring roots, elevated ivory-and-gold dwelling pod in the boughs,
 * curved leaf-shingle dome roof, hanging vines, and silver-blue lantern.
 */
function buildElfHouse(): HTMLCanvasElement[] {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  // Mossy glade pad with ivory stepping stones
  isoDiamond(ctx, 32, 48, 26, LEAF_DARK, OUT);
  isoDiamond(ctx, 32, 48, 20, LEAF_MID, GOLD_DARK);
  rect(ctx, 34, 54, 3, 2, IVORY_MID);
  rect(ctx, 37, 56, 3, 2, IVORY_LIGHT);

  // Flaring root buttresses at base (front-bottom around (32, 56))
  isoBox(ctx, 32, 57, 16, 16, 3, {
    top: BARK_LIGHT,
    left: BARK_DARK,
    right: BARK_MID,
  });

  // Central living tree trunk rising from roots
  isoBox(ctx, 32, 55, 12, 12, 9, {
    top: BARK_LIGHT,
    left: BARK_DARK,
    right: BARK_MID,
  });
  // Arched wooden door carved into the trunk base (right face)
  rightWallRect(ctx, 32, 55, 4, 1, 4, 6, OUT);
  rightWallRect(ctx, 32, 55, 5, 1, 2, 5, EMERALD_MID);
  rightWallRect(ctx, 32, 55, 5, 6, 2, 1, GOLD_LIGHT); // golden arch lintel

  // Upper cantilevered living-wood & ivory tree-house chamber (wider than trunk!)
  const fx = 32;
  const fy = 46;
  const wL = 16;
  const wR = 16;
  const wallH = 10;
  isoBox(ctx, fx, fy, wL, wR, wallH, {
    top: IVORY_LIGHT,
    left: IVORY_DARK,
    right: IVORY_MID,
  });
  // Gold & bark trim bands at bottom and top of chamber
  leftWallRect(ctx, fx, fy, 0, 1, wL, 2, GOLD_DARK);
  rightWallRect(ctx, fx, fy, 0, 1, wR, 2, GOLD_MID);
  leftWallRect(ctx, fx, fy, 0, wallH - 1, wL, 1, GOLD_MID);
  rightWallRect(ctx, fx, fy, 0, wallH - 1, wR, 1, GOLD_LIGHT);

  // Silver-blue arched windows on upper chamber walls
  rightWallRect(ctx, fx, fy, 5, 4, 6, 5, OUT);
  rightWallRect(ctx, fx, fy, 6, 5, 4, 3, LANTERN_MID);
  rightWallRect(ctx, fx, fy, 7, 6, 2, 2, LANTERN_CORE);

  leftWallRect(ctx, fx, fy, 5, 4, 6, 5, OUT);
  leftWallRect(ctx, fx, fy, 6, 5, 4, 3, LANTERN_DIM);

  // Curved multi-tier leaf-shingle roof crown over the treehouse
  drawElvenCanopy(ctx, 32, 27, 17, 13, 0);

  // Branch extending right with hanging silver-blue lantern
  rect(ctx, 45, 34, 6, 2, BARK_MID);
  rect(ctx, 45, 33, 6, 1, OUT);
  drawSilverLantern(ctx, 50, 37, 0);

  return [canvas];
}

/**
 * 2. SHOP: Sylvan Canopy Bazaar.
 * Open crescent pavilion with slender ivory-and-gold pillars, curved emerald leaf-silk dome,
 * glowing potion & gem display counter, and twin silver-blue lanterns.
 */
function buildElfShop(): HTMLCanvasElement[] {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  // Ivory & emerald mosaic courtyard
  isoDiamond(ctx, 32, 48, 27, EMERALD_DARK, OUT);
  isoDiamond(ctx, 32, 48, 23, IVORY_MID, GOLD_DARK);
  isoDiamond(ctx, 32, 48, 17, EMERALD_MID, GOLD_MID);

  // Low curved/stepped ivory merchant counters in front-right and front-left
  isoBox(ctx, 34, 55, 6, 14, 5, {
    top: GOLD_LIGHT,
    left: IVORY_DARK,
    right: IVORY_MID,
  });
  isoBox(ctx, 29, 55, 14, 6, 5, {
    top: GOLD_LIGHT,
    left: IVORY_DARK,
    right: IVORY_MID,
  });

  // Displayed elven wares on the counters (glowing vials, golden chalice, moonstones)
  rect(ctx, 36, 48, 2, 2, LANTERN_CORE);
  rect(ctx, 40, 46, 2, 2, GOLD_LIGHT);
  rect(ctx, 43, 44, 2, 2, '#f48fb1');
  rect(ctx, 24, 46, 2, 2, LANTERN_MID);
  rect(ctx, 21, 44, 2, 2, LEAF_HIGHLIGHT);

  // Four slender ivory-and-gold arched pillars supporting the pavilion dome
  const pillars = [
    [20, 46],
    [32, 40],
    [44, 46],
    [32, 53],
  ] as const;
  for (const [px0, py0] of pillars) {
    rect(ctx, px0 - 1, py0 - 14, 3, 14, OUT);
    rect(ctx, px0, py0 - 14, 1, 14, IVORY_LIGHT);
    px(ctx, px0, py0 - 13, GOLD_LIGHT);
    px(ctx, px0, py0 - 2, GOLD_MID);
  }

  // Scalloped emerald-and-gold silk & leaf dome roof
  drawElvenCanopy(ctx, 32, 30, 19, 12, 0);
  // Gold filigree finial on top of dome
  rect(ctx, 31, 14, 2, 4, GOLD_LIGHT);
  px(ctx, 31, 13, LANTERN_CORE);

  // Twin hanging silver-blue lanterns at left and right eaves
  drawSilverLantern(ctx, 16, 34, 0);
  drawSilverLantern(ctx, 48, 34, 1);

  return [canvas];
}

/**
 * 3. BARRACKS: Ranger Lodge.
 * Living-timber lodge flanked by two elevated treetop archer platforms,
 * recurve bow rack, archery target, and waving emerald-and-gold ranger banners (2 frames).
 */
function buildElfBarracks(): HTMLCanvasElement[] {
  return [0, 1].map((frame) => {
    const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

    // Forest training glade pad
    isoDiamond(ctx, 32, 48, 28, LEAF_DARK, OUT);
    isoDiamond(ctx, 32, 48, 23, '#2f5c3a', BARK_DARK);

    // Main ranger lodge hall (back-center, living bark & deep emerald walls)
    const fx = 30;
    const fy = 52;
    const wL = 14;
    const wR = 16;
    const wallH = 12;
    isoBox(ctx, fx, fy, wL, wR, wallH, {
      top: EMERALD_LIGHT,
      left: BARK_DARK,
      right: BARK_MID,
    });
    // Gold & ivory trim band
    leftWallRect(ctx, fx, fy, 1, wallH - 2, wL - 2, 2, GOLD_DARK);
    rightWallRect(ctx, fx, fy, 1, wallH - 2, wR - 2, 2, GOLD_MID);

    // Arched lodge doorway on right wall
    rightWallRect(ctx, fx, fy, 3, 1, 5, 8, OUT);
    rightWallRect(ctx, fx, fy, 4, 1, 3, 7, EMERALD_DARK);
    rightWallRect(ctx, fx, fy, 4, 8, 3, 1, GOLD_LIGHT);

    // Green leaf-shingle pitched roof on lodge
    isoPitchedRoof(ctx, fx, fy, wL + 2, wR + 2, wallH, 7, {
      leftSlope: EMERALD_DARK,
      rightSlope: LEAF_MID,
      gable: BARK_LIGHT,
      ridge: GOLD_LIGHT,
    });

    // Left elevated treetop archer platform on living trunk
    isoBox(ctx, 18, 52, 6, 6, 16, {
      top: BARK_LIGHT,
      left: BARK_DARK,
      right: BARK_MID,
    });
    isoBox(ctx, 18, 36, 9, 9, 3, {
      top: IVORY_MID,
      left: GOLD_DARK,
      right: GOLD_MID,
    });
    drawElvenCanopy(ctx, 18, 28, 8, 6, frame);

    // Archery target & bow rack in front-right yard
    disc(ctx, 43, 49, 4, OUT);
    disc(ctx, 43, 49, 3, IVORY_LIGHT);
    disc(ctx, 43, 49, 1, '#e53935');
    // Weapon rack with golden recurve bows
    rect(ctx, 34, 54, 6, 4, OUT);
    rect(ctx, 35, 55, 4, 1, GOLD_LIGHT);
    rect(ctx, 35, 57, 4, 1, GOLD_MID);

    // Tall silver-wood banner pole with waving green & gold ranger banner
    const poleX = 33;
    const poleY = 12;
    rect(ctx, poleX, poleY, 1, 16, OUT);
    rect(ctx, poleX + 1, poleY + 1, 1, 15, IVORY_LIGHT);
    px(ctx, poleX, poleY - 1, GOLD_LIGHT);

    const wave = frame % 2;
    rect(ctx, poleX + 2, poleY + 1 + wave, 6, 5, OUT);
    rect(ctx, poleX + 2, poleY + 2 + wave, 5, 3, LEAF_MID);
    rect(ctx, poleX + 3, poleY + 3 + wave, 3, 1, GOLD_LIGHT);
    rect(ctx, poleX + 7, poleY + 2 - wave, 5, 4, OUT);
    rect(ctx, poleX + 7, poleY + 3 - wave, 4, 2, LEAF_LIGHT);

    return canvas;
  });
}

/**
 * 4. TOWER: Tall Living Sentinel Tree with Platform.
 * Massive ancient tree trunk rising from roots, mid-crown cantilevered ivory-and-gold
 * lookout platform, crowned by a high emerald canopy and pulsing starlight beacon (2 frames).
 */
function buildElfTower(): HTMLCanvasElement[] {
  return [0, 1].map((frame) => {
    const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

    // Sacred root-stone circle on ground
    isoDiamond(ctx, 32, 48, 26, LEAF_DARK, OUT);
    isoDiamond(ctx, 32, 48, 21, EMERALD_MID, GOLD_DARK);

    // Sweeping root buttresses
    isoBox(ctx, 32, 57, 16, 16, 5, {
      top: BARK_LIGHT,
      left: BARK_DARK,
      right: BARK_MID,
    });

    // Tall ancient living tree shaft
    const fx = 32;
    const fy = 53;
    const shaftH = 26;
    isoBox(ctx, fx, fy, 10, 10, shaftH, {
      top: BARK_LIGHT,
      left: BARK_DARK,
      right: BARK_MID,
    });

    // Golden-trimmed elven portal at base of tree
    rightWallRect(ctx, fx, fy, 3, 1, 4, 7, OUT);
    rightWallRect(ctx, fx, fy, 4, 1, 2, 6, LANTERN_MID);
    rightWallRect(ctx, fx, fy, 3, 7, 4, 1, GOLD_LIGHT);

    // Spiraling vine & silver-blue rune lights up the trunk
    for (const z of [9, 15, 21]) {
      leftWallRect(ctx, fx, fy, 2, z, 6, 1, LEAF_MID);
      rightWallRect(ctx, fx, fy, 2, z, 6, 1, LEAF_LIGHT);
      rightWallRect(ctx, fx, fy, 4, z + 1, 2, 2, frame === 0 ? LANTERN_CORE : LANTERN_MID);
    }

    // Cantilevered ivory-and-gold sentinel platform high in the boughs
    const platFy = 29;
    isoBox(ctx, 32, platFy, 16, 16, 4, {
      top: IVORY_LIGHT,
      left: IVORY_DARK,
      right: IVORY_MID,
    });
    leftWallRect(ctx, 32, platFy, 0, 1, 16, 1, GOLD_DARK);
    rightWallRect(ctx, 32, platFy, 0, 1, 16, 1, GOLD_LIGHT);

    // High crown of living foliage above the platform
    drawElvenCanopy(ctx, 32, 16, 15, 10, frame);

    // Silver-blue starlight beacon floating at tree apex
    disc(ctx, 32, 5, frame === 0 ? 3 : 4, LANTERN_MID);
    disc(ctx, 32, 5, 2, LANTERN_CORE);
    drawSilverLantern(ctx, 19, 28, frame);
    drawSilverLantern(ctx, 45, 28, frame + 1);

    return canvas;
  });
}

/**
 * 5. FARM: Sylvan Moon-Blossom & Golden Berry Grove.
 * Irrigated silver-stream channel, curved vine trellises with golden fruit & glowing blossoms,
 * and a leaf-roofed gatherer's pavilion.
 */
function buildElfFarm(): HTMLCanvasElement[] {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  // Lush mossy terrace pad
  isoDiamond(ctx, 32, 48, 28, LEAF_DARK, OUT);
  for (let u = 3; u < 29; u++) {
    for (let v = 3; v < 29; v++) {
      // Shimmering silver-blue irrigation stream down the middle (u = 14..16)
      if (u >= 14 && u <= 16) {
        isoTexel(ctx, 32, 32, u, v, (u + v) % 3 === 0 ? LANTERN_CORE : LANTERN_MID);
      } else {
        const isBed = v % 5 === 1 || v % 5 === 2;
        isoTexel(ctx, 32, 32, u, v, isBed ? '#1e4a31' : LEAF_MID);
      }
    }
  }

  // Arched living-vine trellises on the front-right and front-left beds bearing golden berries & blue moon-blossoms
  for (const rowU of [7, 11, 20, 24]) {
    const isGoldFruit = rowU === 11 || rowU === 24;
    for (let v = 5; v < 26; v += 2) {
      const sx = 32 + (rowU - v);
      const sy = 32 + ((rowU + v) >> 1);
      rect(ctx, sx - 1, sy - 3, 2, 3, LEAF_DARK);
      rect(ctx, sx - 1, sy - 4, 2, 2, LEAF_LIGHT);
      px(ctx, sx, sy - 3, isGoldFruit ? GOLD_LIGHT : LANTERN_CORE);
    }
  }

  // Small curved leaf-roofed gatherer's pavilion on the back-left (front-bottom at (25, 47))
  isoBox(ctx, 25, 47, 9, 9, 7, {
    top: IVORY_LIGHT,
    left: IVORY_DARK,
    right: IVORY_MID,
  });
  rightWallRect(ctx, 25, 47, 3, 1, 3, 5, BARK_DARK);
  drawElvenCanopy(ctx, 25, 37, 9, 6, 0);

  // Woven golden fruit basket beside the stream
  isoBox(ctx, 38, 53, 4, 4, 3, {
    top: GOLD_LIGHT,
    left: BARK_MID,
    right: GOLD_MID,
  });

  return [canvas];
}

/**
 * 6. SCHOOL: Sylvan Lore-Spire & Star-Orrery.
 * Two-tier ivory-and-gold octagonal sanctuary cradled by living boughs,
 * tall silver-blue lancet windows, rooftop crystal orrery, and waving lore pennant (2 frames).
 */
function buildElfSchool(): HTMLCanvasElement[] {
  return [0, 1].map((frame) => {
    const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

    // Star-inlaid courtyard pad
    isoDiamond(ctx, 32, 48, 28, LEAF_DARK, OUT);
    isoDiamond(ctx, 32, 48, 22, IVORY_MID, GOLD_DARK);
    isoDiamond(ctx, 32, 48, 16, EMERALD_MID, GOLD_LIGHT);

    // Lower ivory sanctuary hall
    const fx = 32;
    const fy = 55;
    const wL = 18;
    const wR = 18;
    const wallH = 12;
    isoBox(ctx, fx, fy, wL, wR, wallH, {
      top: IVORY_LIGHT,
      left: IVORY_DARK,
      right: IVORY_MID,
    });
    // Gold base & cornice bands
    leftWallRect(ctx, fx, fy, 0, 1, wL, 2, GOLD_DARK);
    rightWallRect(ctx, fx, fy, 0, 1, wR, 2, GOLD_MID);
    leftWallRect(ctx, fx, fy, 0, wallH - 2, wL, 2, GOLD_MID);
    rightWallRect(ctx, fx, fy, 0, wallH - 2, wR, 2, GOLD_LIGHT);

    // Arched scholar's doorway & tall stained-glass lancet windows
    rightWallRect(ctx, fx, fy, 3, 1, 4, 8, OUT);
    rightWallRect(ctx, fx, fy, 4, 1, 2, 7, EMERALD_MID);
    for (const v0 of [9, 14]) {
      rightWallRect(ctx, fx, fy, v0, 3, 3, 7, OUT);
      rightWallRect(ctx, fx, fy, v0 + 1, 4, 1, 5, LANTERN_CORE);
    }
    for (const u0 of [4, 11]) {
      leftWallRect(ctx, fx, fy, u0, 3, 4, 7, OUT);
      leftWallRect(ctx, fx, fy, u0 + 1, 4, 2, 5, LANTERN_MID);
    }

    // Upper stepped rotunda tier
    isoBox(ctx, 32, 43, 12, 12, 8, {
      top: GOLD_LIGHT,
      left: IVORY_DARK,
      right: IVORY_LIGHT,
    });

    // Emerald leaf-dome roof & glowing crystal star-orrery at apex
    drawElvenCanopy(ctx, 32, 27, 13, 9, 0);
    disc(ctx, 32, 15, 4, OUT);
    disc(ctx, 32, 15, 3, frame === 0 ? LANTERN_MID : LANTERN_CORE);
    px(ctx, 31, 14, '#ffffff');
    // Golden astrolabe ring around crystal
    rect(ctx, 27, 15, 10, 1, GOLD_LIGHT);

    // Waving silver-blue & gold lore pennant on right spire
    const poleX = 43;
    const poleY = 14;
    rect(ctx, poleX, poleY, 1, 14, OUT);
    rect(ctx, poleX + 1, poleY + 1, 1, 13, GOLD_LIGHT);
    const dy = frame % 2;
    rect(ctx, poleX + 2, poleY + 1 + dy, 6, 4, OUT);
    rect(ctx, poleX + 2, poleY + 2 + dy, 5, 2, LANTERN_MID);
    px(ctx, poleX + 4, poleY + 2 + dy, GOLD_LIGHT);

    return canvas;
  });
}

/**
 * 7. FACTORY: Mana-Weaving Conservatory & Silver-Sap Forge.
 * Vaulted emerald-crystal conservatory dome cradled by living wood ribs,
 * golden mana-condenser spire emitting rising starlight motes (3 frames), and glowing sap basin.
 */
function buildElfFactory(): HTMLCanvasElement[] {
  return [0, 1, 2].map((frame) => {
    const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

    // Moss-and-ivory terrace pad
    isoDiamond(ctx, 32, 48, 28, EMERALD_DARK, OUT);
    isoDiamond(ctx, 32, 48, 24, '#24523f', GOLD_DARK);

    // Base ivory & living-bark hall (front-bottom at (33, 56))
    const fx = 33;
    const fy = 56;
    const wL = 16;
    const wR = 18;
    const wallH = 10;
    isoBox(ctx, fx, fy, wL, wR, wallH, {
      top: IVORY_LIGHT,
      left: BARK_DARK,
      right: BARK_MID,
    });
    // Gold filigree belt
    leftWallRect(ctx, fx, fy, 0, wallH - 2, wL, 2, GOLD_DARK);
    rightWallRect(ctx, fx, fy, 0, wallH - 2, wR, 2, GOLD_LIGHT);

    // Glowing mana-furnace windows along right & left walls
    for (const v0 of [3, 9, 14]) {
      rightWallRect(ctx, fx, fy, v0, 2, 4, 6, OUT);
      rightWallRect(ctx, fx, fy, v0 + 1, 3, 2, 4, frame === 1 ? LANTERN_CORE : LANTERN_MID);
    }
    for (const u0 of [4, 10]) {
      leftWallRect(ctx, fx, fy, u0, 2, 4, 6, OUT);
      leftWallRect(ctx, fx, fy, u0 + 1, 3, 2, 4, LANTERN_DIM);
    }

    // Vaulted crystal-and-leaf conservatory dome over the hall with golden ribs
    for (let dy = -12; dy <= 0; dy++) {
      const span = Math.round(15 * Math.sqrt(Math.max(0, 1 - (dy * dy) / 150)));
      rect(ctx, 33 - span - 1, 38 + dy, (span + 1) * 2, 1, OUT);
      const col = dy < -8 ? LANTERN_CORE : dy < -4 ? LANTERN_MID : EMERALD_LIGHT;
      rect(ctx, 33 - span, 38 + dy, span * 2, 1, col);
      // Golden arch ribs across dome
      if (span > 4) {
        px(ctx, 33 - Math.floor(span * 0.5), 38 + dy, GOLD_LIGHT);
        px(ctx, 33 + Math.floor(span * 0.5), 38 + dy, GOLD_MID);
      }
    }

    // Tall golden & ivory mana-condenser spire on back-left (replaces ugly smokestack)
    const cFx = 21;
    const cFy = 46;
    isoBox(ctx, cFx, cFy, 5, 5, 18, {
      top: GOLD_LIGHT,
      left: IVORY_DARK,
      right: IVORY_MID,
    });
    isoBox(ctx, cFx, cFy - 16, 6, 6, 3, {
      top: LANTERN_CORE,
      left: GOLD_DARK,
      right: GOLD_LIGHT,
    });

    // Rising shimmering silver-blue & gold star-motes (3 animation frames)
    const motes: readonly (readonly [number, number, string])[] =
      frame === 0
        ? [
            [20, 22, LANTERN_CORE],
            [22, 17, GOLD_LIGHT],
            [19, 12, LANTERN_MID],
            [23, 7, LANTERN_CORE],
          ]
        : frame === 1
          ? [
              [21, 20, GOLD_LIGHT],
              [19, 15, LANTERN_CORE],
              [22, 10, LANTERN_MID],
              [20, 5, GOLD_LIGHT],
            ]
          : [
              [19, 21, LANTERN_MID],
              [21, 16, LANTERN_CORE],
              [20, 11, GOLD_LIGHT],
              [22, 6, LANTERN_CORE],
            ];
    for (const [mx, my, col] of motes) {
      rect(ctx, mx - 1, my, 3, 1, col);
      rect(ctx, mx, my - 1, 1, 3, col);
      px(ctx, mx, my, '#ffffff');
    }

    return canvas;
  });
}

/**
 * 8. LUMBER: Gentle Tree-Shaping Grove.
 * Sacred mossy ring where living saplings are woven into an arch by golden harmonic pillars
 * with floating emerald/gold growth sparkles (2 frames) and a small caretaker's shrine.
 */
function buildElfLumber(): HTMLCanvasElement[] {
  return [0, 1].map((frame) => {
    const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

    // Mossy forest floor with golden shaping circle
    isoDiamond(ctx, 32, 48, 27, LEAF_DARK, OUT);
    isoDiamond(ctx, 32, 48, 22, LEAF_MID, GOLD_DARK);
    isoDiamond(ctx, 32, 48, 15, '#235937', GOLD_LIGHT);

    // Small curved living-wood shaper's tool-shrine on back-left
    isoBox(ctx, 23, 47, 8, 8, 7, {
      top: BARK_LIGHT,
      left: BARK_DARK,
      right: BARK_MID,
    });
    drawElvenCanopy(ctx, 23, 37, 8, 5, 0);

    // Two ivory-and-gold harmonic tuning pillars on left & right of the grove
    isoBox(ctx, 22, 54, 4, 4, 11, {
      top: GOLD_LIGHT,
      left: IVORY_DARK,
      right: IVORY_LIGHT,
    });
    isoBox(ctx, 43, 52, 4, 4, 11, {
      top: GOLD_LIGHT,
      left: IVORY_DARK,
      right: IVORY_LIGHT,
    });
    px(ctx, 22, 41, LANTERN_CORE);
    px(ctx, 43, 39, LANTERN_CORE);

    // Central living tree boughs curving inward to form a woven heart-arch
    for (let t = 0; t < 14; t++) {
      const bend = Math.round(Math.sin((t / 13) * Math.PI) * 4);
      rect(ctx, 28 + bend, 50 - t, 2, 2, BARK_DARK);
      rect(ctx, 35 - bend, 50 - t, 2, 2, BARK_MID);
    }
    drawElvenCanopy(ctx, 32, 33, 11, 8, frame);

    // Gentle golden & silver-blue growth sparkles between pillars and tree
    const shift = frame === 0 ? 0 : 2;
    px(ctx, 25 + shift, 42, GOLD_LIGHT);
    px(ctx, 27, 39 - shift, LANTERN_CORE);
    px(ctx, 39 - shift, 41, GOLD_LIGHT);
    px(ctx, 37, 38 + shift, LEAF_HIGHLIGHT);

    return canvas;
  });
}

/**
 * 9. MINE: Modest Mossy Cave with Carved Stone Arch (elves are poor in ore).
 * Small low mossy knoll, graceful curved ivory-and-gold archway over a narrow dark hollow,
 * hanging vines, a single silver-blue lantern, and 2 subtle moonstone glints (2 frames).
 */
function buildElfMine(): HTMLCanvasElement[] {
  return [0, 1].map((frame) => {
    const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

    // Modest mossy forest floor pad
    isoDiamond(ctx, 32, 48, 26, LEAF_DARK, OUT);
    isoDiamond(ctx, 32, 48, 21, '#265437', BARK_DARK);

    // Small, low moss-covered earthen hillock (much smaller than shared rocky mountain)
    disc(ctx, 31, 43, 11, OUT);
    disc(ctx, 31, 43, 10, LEAF_DARK);
    disc(ctx, 29, 40, 8, LEAF_MID);
    disc(ctx, 34, 42, 7, '#28593a');
    // Soft moss crown highlight
    rect(ctx, 27, 34, 6, 2, LEAF_LIGHT);

    // Graceful carved ivory-and-gold elven stone arch framing the narrow cave mouth
    rect(ctx, 26, 38, 12, 13, OUT);
    rect(ctx, 27, 39, 10, 12, IVORY_MID);
    rect(ctx, 27, 38, 10, 2, IVORY_LIGHT);
    // Gold keystone & trim on the stone arch
    rect(ctx, 31, 37, 2, 3, GOLD_LIGHT);
    rect(ctx, 27, 44, 1, 6, GOLD_MID);
    rect(ctx, 36, 44, 1, 6, GOLD_MID);

    // Narrow dark cave opening inside the arch
    rect(ctx, 29, 41, 6, 10, '#10181c');
    // Hanging emerald vines draping over the arch top
    rect(ctx, 28, 39, 1, 5, LEAF_MID);
    rect(ctx, 34, 39, 1, 4, LEAF_LIGHT);

    // Single silver-blue lantern hanging beside the arch & tiny woven ore basket
    drawSilverLantern(ctx, 40, 44, frame);
    isoBox(ctx, 24, 54, 4, 4, 2, {
      top: BARK_LIGHT,
      left: BARK_DARK,
      right: BARK_MID,
    });
    // Sparse, modest moonstone glints (1-2 tiny pixels)
    px(ctx, 31, 46, frame === 0 ? LANTERN_CORE : LANTERN_MID);
    px(ctx, 24, 51, frame === 0 ? LANTERN_MID : LANTERN_CORE);

    return canvas;
  });
}

/**
 * 10. PARK: Sacred Moonwell Glade.
 * Circular ivory-and-gold moonwell pool glowing with silver-blue starlight water,
 * weeping emerald boughs (2 sway frames), glowing lotus pads, and curved ivory bench.
 */
function buildElfPark(): HTMLCanvasElement[] {
  return [0, 1].map((frame) => {
    const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);
    const sway = frame % 2;

    // Lush emerald glade with ivory star-path
    isoDiamond(ctx, 32, 48, 29, LEAF_DARK, OUT);
    isoDiamond(ctx, 32, 48, 25, LEAF_MID, GOLD_DARK);
    isoDiamond(ctx, 32, 48, 18, IVORY_MID, GOLD_MID);

    // Central circular/diamond Moonwell glowing with silver-blue water
    isoDiamond(ctx, 32, 48, 13, frame === 0 ? LANTERN_MID : LANTERN_DIM, OUT);
    isoDiamond(ctx, 32, 48, 8, LANTERN_CORE);
    // Floating golden lotus petals on the moonwell
    px(ctx, 30, 47, GOLD_LIGHT);
    px(ctx, 34, 49, GOLD_LIGHT);

    // Curved ivory meditation bench at front-right
    isoBox(ctx, 41, 54, 3, 7, 2, {
      top: IVORY_LIGHT,
      left: IVORY_DARK,
      right: GOLD_MID,
    });

    // Two weeping silver-bark trees flanking the moonwell
    for (const [tx, ty, rx] of [
      [20, 44, 7],
      [44, 45, 7],
    ] as const) {
      rect(ctx, tx - 1, ty - 11, 3, 12, OUT);
      rect(ctx, tx, ty - 11, 1, 11, IVORY_MID);
      drawElvenCanopy(ctx, tx, ty - 12, rx, 6, sway);
    }

    return canvas;
  });
}

/** Decoration: Tall silver-bark mallorn tree with emerald-and-gold canopy & hanging vines (2 frames). */
function buildElfTree(): HTMLCanvasElement[] {
  return [0, 1].map((frame) => {
    const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);
    isoDiamond(ctx, 32, 50, 12, LEAF_DARK, OUT);
    // Silver-bark trunk with flaring roots
    rect(ctx, 29, 36, 6, 15, OUT);
    rect(ctx, 30, 36, 2, 14, IVORY_DARK);
    rect(ctx, 32, 36, 2, 14, IVORY_LIGHT);
    drawElvenCanopy(ctx, 32, 34, 13, 10, frame % 2);
    drawElvenCanopy(ctx, 32, 24, 9, 7, frame % 2);
    return canvas;
  });
}

/** Decoration: Curved living-branch lamppost with hanging silver-blue lantern & fireflies (2 frames). */
function buildElfLamp(): HTMLCanvasElement[] {
  return [0, 1].map((frame) => {
    const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);
    isoDiamond(ctx, 32, 50, 9, LEAF_DARK, OUT);
    // Living wood post & gracefully arched branch arm
    rect(ctx, 30, 25, 3, 25, OUT);
    rect(ctx, 31, 26, 1, 24, BARK_LIGHT);
    rect(ctx, 31, 24, 7, 2, OUT);
    rect(ctx, 31, 25, 6, 1, GOLD_MID);
    drawSilverLantern(ctx, 37, 28, frame);
    // Floating firefly motes
    px(ctx, 27 + frame, 30, LANTERN_CORE);
    px(ctx, 40 - frame, 33, GOLD_LIGHT);
    return canvas;
  });
}

/** Decoration: Lotus-petal ivory & gold fountain with shimmering silver-blue water jets (2 frames). */
function buildElfFountain(): HTMLCanvasElement[] {
  return [0, 1].map((frame) => {
    const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);
    isoDiamond(ctx, 32, 47, 24, IVORY_DARK, OUT);
    isoDiamond(ctx, 32, 47, 20, IVORY_LIGHT, GOLD_MID);
    isoDiamond(ctx, 32, 47, 16, frame ? LANTERN_MID : LANTERN_DIM);
    isoDiamond(ctx, 32, 47, 10, LANTERN_CORE);
    // Slender fluted gold-and-ivory lotus pedestal
    rect(ctx, 30, 29, 4, 18, OUT);
    rect(ctx, 31, 30, 2, 17, IVORY_LIGHT);
    isoDiamond(ctx, 32, 31, 8, GOLD_LIGHT, OUT);
    // Rising silver-blue starlight water arcs
    const dy = frame ? 0 : 2;
    rect(ctx, 31, 19 + dy, 2, 9 - dy, LANTERN_CORE);
    px(ctx, 28, 25 + dy, LANTERN_MID);
    px(ctx, 35, 25 + dy, LANTERN_MID);
    return canvas;
  });
}

/** Decoration: Slender ivory-and-gold elven guardian archer statue on a vine-wrapped plinth. */
function buildElfStatue(): HTMLCanvasElement[] {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);
  isoDiamond(ctx, 32, 48, 22, LEAF_DARK, OUT);
  isoBox(ctx, 32, 56, 12, 12, 8, {
    top: IVORY_LIGHT,
    left: IVORY_DARK,
    right: IVORY_MID,
  });
  // Wrapping emerald vine on pedestal
  leftWallRect(ctx, 32, 56, 2, 2, 8, 2, LEAF_MID);
  rightWallRect(ctx, 32, 56, 2, 4, 8, 2, LEAF_LIGHT);
  // Slender elven figure in cloak
  rect(ctx, 29, 23, 6, 22, OUT);
  rect(ctx, 30, 24, 4, 20, IVORY_LIGHT);
  rect(ctx, 31, 24, 2, 20, GOLD_LIGHT);
  // Head & pointed ears
  disc(ctx, 32, 19, 3, OUT);
  disc(ctx, 32, 19, 2, IVORY_LIGHT);
  px(ctx, 28, 19, IVORY_LIGHT);
  px(ctx, 36, 19, IVORY_LIGHT);
  // Raised golden recurve bow on right side
  for (let dy = -6; dy <= 6; dy++) {
    const bx = 37 + Math.round((36 - dy * dy) / 14);
    px(ctx, bx, 28 + dy, GOLD_LIGHT);
  }
  rect(ctx, 36, 22, 1, 13, IVORY_MID); // bowstring
  return [canvas];
}

/**
 * 11. ROWHOUSE: Three Narrow Joined Sylvan Terrace Homes.
 * Three slender connected ivory-and-bark dwellings stepped along the lane,
 * each with its own arched door, silver-blue window, and individual leaf-shingle gable cap.
 */
function buildElfRowhouse(): HTMLCanvasElement[] {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  // Mossy lane pad with ivory flagstone walk
  isoDiamond(ctx, 32, 48, 28, LEAF_DARK, OUT);
  isoDiamond(ctx, 32, 48, 23, LEAF_MID, GOLD_DARK);

  // Three narrow joined terrace units stepped along the right-up (v) axis
  const units = [
    [26, 58, IVORY_MID, LEAF_MID],
    [32, 55, IVORY_LIGHT, LEAF_LIGHT],
    [38, 52, IVORY_MID, LEAF_MID],
  ] as const;

  for (const [ufx, ufy, wallRight, roofCol] of units) {
    // Bark plinth + narrow 2-storey ivory row unit
    isoBox(ctx, ufx, ufy, 14, 7, 13, {
      top: IVORY_LIGHT,
      left: IVORY_DARK,
      right: wallRight,
    });
    leftWallRect(ctx, ufx, ufy, 0, 0, 14, 2, BARK_DARK);
    rightWallRect(ctx, ufx, ufy, 0, 0, 7, 2, BARK_MID);
    rightWallRect(ctx, ufx, ufy, 0, 7, 7, 1, GOLD_MID); // floor belt course

    // Individual arched door at ground level
    rightWallRect(ctx, ufx, ufy, 1, 1, 3, 5, OUT);
    rightWallRect(ctx, ufx, ufy, 2, 1, 1, 4, EMERALD_MID);
    // Upper storey lit window
    rightWallRect(ctx, ufx, ufy, 2, 8, 3, 4, OUT);
    rightWallRect(ctx, ufx, ufy, 3, 9, 1, 2, LANTERN_CORE);

    // Individual scalloped leaf-shingle mini-canopy per rowhouse
    drawElvenCanopy(ctx, ufx - 3, ufy - 16, 7, 5, 0);
    rect(ctx, ufx - 5, ufy - 18, 4, 1, roofCol);
  }

  // Shared left-end bark timber party wall & window accents
  leftWallRect(ctx, 26, 58, 3, 4, 4, 4, OUT);
  leftWallRect(ctx, 26, 58, 4, 5, 2, 2, LANTERN_MID);
  leftWallRect(ctx, 26, 58, 9, 4, 4, 4, OUT);
  leftWallRect(ctx, 26, 58, 10, 5, 2, 2, LANTERN_MID);

  // Stepping stones in front of all three doors & street lantern
  rect(ctx, 28, 58, 2, 1, IVORY_LIGHT);
  rect(ctx, 34, 55, 2, 1, IVORY_LIGHT);
  rect(ctx, 40, 52, 2, 1, IVORY_LIGHT);
  drawSilverLantern(ctx, 46, 46, 0);

  return [canvas];
}

/**
 * 12. MANOR: Noble Elven Villa with Garden Wall, Porch & Tall Star-Turret.
 * Detached aristocratic ivory-and-gold residence enclosed by a low vine-draped garden wall,
 * pillared front porch, chimney, and a tall slender turret crowned with a golden spire.
 */
function buildElfManor(): HTMLCanvasElement[] {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  // Manicured emerald estate lawn & low ivory garden wall perimeter
  isoDiamond(ctx, 32, 48, 29, LEAF_DARK, OUT);
  isoDiamond(ctx, 32, 48, 25, LEAF_MID, GOLD_LIGHT);
  // Low front-right & front-left garden wall segments with gold coping
  isoBox(ctx, 32, 60, 16, 3, 3, {
    top: GOLD_LIGHT,
    left: IVORY_DARK,
    right: IVORY_MID,
  });
  isoBox(ctx, 35, 58, 3, 14, 3, {
    top: GOLD_LIGHT,
    left: IVORY_DARK,
    right: IVORY_MID,
  });

  // Main detached manor hall
  const fx = 33;
  const fy = 54;
  const wL = 16;
  const wR = 16;
  const wallH = 13;
  isoBox(ctx, fx, fy, wL, wR, wallH, {
    top: IVORY_LIGHT,
    left: IVORY_DARK,
    right: IVORY_MID,
  });
  // Rich double gold filigree bands & bark corner pilasters
  leftWallRect(ctx, fx, fy, 0, 1, wL, 2, GOLD_DARK);
  rightWallRect(ctx, fx, fy, 0, 1, wR, 2, GOLD_MID);
  leftWallRect(ctx, fx, fy, 0, wallH - 2, wL, 2, GOLD_MID);
  rightWallRect(ctx, fx, fy, 0, wallH - 2, wR, 2, GOLD_LIGHT);

  // Projecting front-right pillared porch & noble double doors
  isoBox(ctx, 37, 55, 6, 8, 7, {
    top: GOLD_LIGHT,
    left: IVORY_DARK,
    right: IVORY_LIGHT,
  });
  rightWallRect(ctx, 37, 55, 2, 1, 4, 5, OUT);
  rightWallRect(ctx, 37, 55, 3, 1, 2, 4, BARK_MID);

  // Tall arched manor windows on main hall
  for (const v0 of [9, 13]) {
    rightWallRect(ctx, fx, fy, v0, 4, 3, 6, OUT);
    rightWallRect(ctx, fx, fy, v0 + 1, 5, 1, 4, LANTERN_CORE);
  }
  for (const u0 of [4, 10]) {
    leftWallRect(ctx, fx, fy, u0, 4, 4, 6, OUT);
    leftWallRect(ctx, fx, fy, u0 + 1, 5, 2, 4, LANTERN_MID);
  }

  // Curved leaf-shingle roof over main manor hall + ivory chimney on right slope
  drawElvenCanopy(ctx, 33, 34, 15, 9, 0);
  isoBox(ctx, 41, 31, 3, 3, 7, {
    top: GOLD_LIGHT,
    left: IVORY_DARK,
    right: IVORY_MID,
  });

  // Tall slender aristocratic turret rising on the back-left corner
  const tFx = 23;
  const tFy = 48;
  isoBox(ctx, tFx, tFy, 7, 7, 24, {
    top: GOLD_LIGHT,
    left: IVORY_DARK,
    right: IVORY_LIGHT,
  });
  rightWallRect(ctx, tFx, tFy, 2, 16, 3, 5, OUT);
  rightWallRect(ctx, tFx, tFy, 3, 17, 1, 3, LANTERN_CORE);
  // Pointed leaf-and-gold turret spire cap
  drawElvenCanopy(ctx, 23, 21, 7, 8, 0);
  rect(ctx, 22, 10, 2, 4, GOLD_LIGHT);
  px(ctx, 22, 9, LANTERN_CORE);

  return [canvas];
}

/**
 * 13. STALL: Low Sylvan Market Booth (~0.6 tile tall).
 * Compact open-air wooden counter under a striped emerald-and-gold leaf awning,
 * displaying glowing moonleaf vials, golden fruit, and folded elven silks.
 */
function buildElfStall(): HTMLCanvasElement[] {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  // Modest mossy cobblestone pad (leaves open ground around the low stall)
  isoDiamond(ctx, 32, 48, 22, LEAF_DARK, OUT);
  isoDiamond(ctx, 32, 48, 17, IVORY_MID, GOLD_DARK);

  // Low living-bark & gold counter table in center (0.6 tile height profile)
  const fx = 33;
  const fy = 54;
  isoBox(ctx, fx, fy, 10, 14, 5, {
    top: IVORY_LIGHT,
    left: BARK_DARK,
    right: BARK_MID,
  });
  rightWallRect(ctx, fx, fy, 1, 2, 12, 2, GOLD_MID);

  // Goods arranged on the counter: glowing potion vials, golden berries, folded emerald cloth
  rect(ctx, 34, 47, 2, 2, LANTERN_CORE);
  rect(ctx, 37, 46, 3, 2, GOLD_LIGHT);
  rect(ctx, 41, 44, 3, 2, LEAF_HIGHLIGHT);
  rect(ctx, 29, 47, 3, 2, '#f48fb1');

  // Two slender bark support poles at back-left and front-right
  rect(ctx, 25, 38, 2, 12, OUT);
  rect(ctx, 25, 38, 1, 11, BARK_LIGHT);
  rect(ctx, 43, 38, 2, 11, OUT);
  rect(ctx, 43, 38, 1, 10, BARK_LIGHT);

  // Slanted striped emerald-and-gold leaf-silk awning (~y=34..41, stays low at 0.6 tile tall)
  for (let v = 0; v < 16; v++) {
    const isGold = ((v >> 1) & 1) === 0;
    const col = isGold ? GOLD_LIGHT : LEAF_LIGHT;
    const valance = isGold ? GOLD_MID : LEAF_DARK;
    const x = 25 + v;
    const y = 41 - (v >> 2);
    rect(ctx, x - 3, y - 4, 4, 4, OUT);
    rect(ctx, x - 2, y - 3, 3, 3, col);
    px(ctx, x, y, valance);
  }

  // Small woven herb basket on ground beside the stall
  isoBox(ctx, 24, 54, 4, 4, 3, {
    top: GOLD_LIGHT,
    left: BARK_DARK,
    right: BARK_LIGHT,
  });

  return [canvas];
}

/**
 * 14. TAVERN: Two-Storey Sylvan Wine-Inn ("The Starlight Bough").
 * Two-storey living-wood & ivory inn with warm golden-lit windows,
 * hanging golden goblet sign on a branch arm, and elven wine barrels by the door.
 */
function buildElfTavern(): HTMLCanvasElement[] {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  // Warm lantern-lit mossy courtyard pad
  isoDiamond(ctx, 32, 48, 27, LEAF_DARK, OUT);
  isoDiamond(ctx, 32, 48, 22, '#2d593e', GOLD_DARK);

  // Lower storey: sturdy living-bark timber hall
  const fx = 32;
  const fy = 56;
  const wL = 16;
  const wR = 18;
  isoBox(ctx, fx, fy, wL, wR, 9, {
    top: BARK_LIGHT,
    left: BARK_DARK,
    right: BARK_MID,
  });

  // Upper jettying second storey: pale ivory walls with gold timber framing
  isoBox(ctx, fx, fy - 9, wL + 2, wR + 2, 8, {
    top: IVORY_LIGHT,
    left: IVORY_DARK,
    right: IVORY_MID,
  });
  leftWallRect(ctx, fx, fy - 9, 0, 0, wL + 2, 1, GOLD_DARK);
  rightWallRect(ctx, fx, fy - 9, 0, 0, wR + 2, 1, GOLD_LIGHT);

  // Arched tavern door on lower right wall
  rightWallRect(ctx, fx, fy, 3, 1, 5, 7, OUT);
  rightWallRect(ctx, fx, fy, 4, 1, 3, 6, BARK_LIGHT);
  rightWallRect(ctx, fx, fy, 4, 7, 3, 1, GOLD_LIGHT);

  // Warm golden-amber lit tavern windows on both storeys (distinct cozy hearth glow)
  rightWallRect(ctx, fx, fy, 10, 3, 6, 4, OUT);
  rightWallRect(ctx, fx, fy, 11, 4, 4, 2, GOLD_LIGHT);
  rightWallRect(ctx, fx, fy, 12, 4, 2, 1, '#fff8e1');

  for (const v0 of [3, 11]) {
    rightWallRect(ctx, fx, fy - 9, v0, 2, 5, 4, OUT);
    rightWallRect(ctx, fx, fy - 9, v0 + 1, 3, 3, 2, GOLD_LIGHT);
  }
  for (const u0 of [4, 11]) {
    leftWallRect(ctx, fx, fy - 9, u0, 2, 5, 4, OUT);
    leftWallRect(ctx, fx, fy - 9, u0 + 1, 3, 3, 2, GOLD_MID);
  }

  // Curved leaf-shingle gable roof over the two-storey inn
  drawElvenCanopy(ctx, 32, 31, 17, 10, 0);

  // Projecting branch arm on right facade with hanging golden chalice sign
  rect(ctx, 46, 36, 7, 2, OUT);
  rect(ctx, 46, 36, 6, 1, BARK_LIGHT);
  rect(ctx, 49, 38, 4, 5, OUT);
  rect(ctx, 50, 39, 2, 3, GOLD_LIGHT);
  px(ctx, 50, 40, LANTERN_CORE);

  // Two banded wooden wine barrels beside the tavern door
  isoBox(ctx, 39, 57, 4, 4, 4, {
    top: BARK_LIGHT,
    left: BARK_DARK,
    right: BARK_MID,
  });
  rightWallRect(ctx, 39, 57, 0, 2, 4, 1, GOLD_MID);
  isoBox(ctx, 43, 55, 4, 4, 4, {
    top: BARK_LIGHT,
    left: BARK_DARK,
    right: BARK_MID,
  });
  rightWallRect(ctx, 43, 55, 0, 2, 4, 1, GOLD_MID);

  return [canvas];
}

/**
 * 15. BANK: Golden-Leaf Treasury & Moonstone Vault.
 * Monumental white-ivory & gold marble hall with fluted golden columns,
 * heavy circular gold-and-emerald vault door, stepped roof, and gleaming coin emblem.
 */
function buildElfBank(): HTMLCanvasElement[] {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  // Paved gold-and-ivory treasury plaza
  isoDiamond(ctx, 32, 48, 28, EMERALD_DARK, OUT);
  isoDiamond(ctx, 32, 48, 24, IVORY_MID, GOLD_MID);
  isoDiamond(ctx, 32, 48, 20, IVORY_LIGHT, GOLD_LIGHT);

  // Raised golden stylobate steps
  const fx = 32;
  const fy = 57;
  const wL = 18;
  const wR = 20;
  isoBox(ctx, fx, fy, wL, wR, 3, {
    top: GOLD_LIGHT,
    left: GOLD_DARK,
    right: GOLD_MID,
  });

  // Solid ivory-and-emerald stone treasury vault body
  const wallH = 16;
  isoBox(ctx, fx, fy - 3, wL - 2, wR - 2, wallH, {
    top: IVORY_LIGHT,
    left: IVORY_DARK,
    right: IVORY_MID,
  });
  // Heavy gold cornice & emerald frieze
  leftWallRect(ctx, fx, fy - 3, 0, wallH - 3, wL - 2, 2, EMERALD_MID);
  rightWallRect(ctx, fx, fy - 3, 0, wallH - 3, wR - 2, 2, EMERALD_LIGHT);
  leftWallRect(ctx, fx, fy - 3, 0, wallH - 1, wL - 2, 1, GOLD_MID);
  rightWallRect(ctx, fx, fy - 3, 0, wallH - 1, wR - 2, 1, GOLD_LIGHT);

  // Heavy circular gold-and-moonstone vault door in center of right facade
  rightWallRect(ctx, fx, fy - 3, 6, 1, 6, 9, OUT);
  rightWallRect(ctx, fx, fy - 3, 7, 1, 4, 8, GOLD_MID);
  rightWallRect(ctx, fx, fy - 3, 8, 3, 2, 4, GOLD_LIGHT);
  rightWallRect(ctx, fx, fy - 3, 8, 5, 1, 1, LANTERN_CORE); // vault lock gem

  // Fluted golden columns along the right colonnade facade
  for (const v0 of [2, 5, 13, 16]) {
    rightWallRect(ctx, fx, fy - 3, v0, 1, 2, 12, OUT);
    rightWallRect(ctx, fx, fy - 3, v0, 1, 1, 12, GOLD_LIGHT);
  }
  // Tall narrow treasury slit windows on left wall with gold bars
  for (const u0 of [4, 10]) {
    leftWallRect(ctx, fx, fy - 3, u0, 3, 3, 8, OUT);
    leftWallRect(ctx, fx, fy - 3, u0 + 1, 4, 1, 6, GOLD_LIGHT);
  }

  // Stepped golden pediment & low emerald vault dome
  isoBox(ctx, 32, 38, 12, 14, 4, {
    top: GOLD_LIGHT,
    left: GOLD_DARK,
    right: GOLD_MID,
  });
  drawElvenCanopy(ctx, 32, 30, 12, 6, 0);

  // Gleaming golden coin & crescent sign mounted on the front-right pediment
  disc(ctx, 38, 29, 4, OUT);
  disc(ctx, 38, 29, 3, GOLD_LIGHT);
  disc(ctx, 38, 29, 1, '#fff8e1');

  return [canvas];
}

/**
 * 16. LIBRARY: Hall of Whispering Scrolls.
 * Modest elongated ivory-and-bark archive hall with three tall silver-blue lancet windows,
 * gently arched leaf roof, and an open golden scroll/book sign above the entrance.
 */
function buildElfLibrary(): HTMLCanvasElement[] {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  // Quiet mossy reading court pad
  isoDiamond(ctx, 32, 48, 26, LEAF_DARK, OUT);
  isoDiamond(ctx, 32, 48, 21, IVORY_MID, EMERALD_MID);

  // Modest elongated library hall (wider along v than u, lower than school/academy)
  const fx = 30;
  const fy = 56;
  const wL = 13;
  const wR = 20;
  const wallH = 12;
  isoBox(ctx, fx, fy, wL, wR, wallH, {
    top: IVORY_LIGHT,
    left: IVORY_DARK,
    right: IVORY_MID,
  });
  // Living-bark lower wainscot & gold upper frieze
  leftWallRect(ctx, fx, fy, 0, 0, wL, 3, BARK_DARK);
  rightWallRect(ctx, fx, fy, 0, 0, wR, 3, BARK_MID);
  leftWallRect(ctx, fx, fy, 0, wallH - 2, wL, 1, GOLD_MID);
  rightWallRect(ctx, fx, fy, 0, wallH - 2, wR, 1, GOLD_LIGHT);

  // Arched library door on front-right + three tall lancet reading windows
  rightWallRect(ctx, fx, fy, 2, 1, 4, 7, OUT);
  rightWallRect(ctx, fx, fy, 3, 1, 2, 6, EMERALD_MID);
  for (const v0 of [7, 11, 15]) {
    rightWallRect(ctx, fx, fy, v0, 3, 3, 7, OUT);
    rightWallRect(ctx, fx, fy, v0 + 1, 4, 1, 5, LANTERN_CORE);
  }
  for (const u0 of [3, 8]) {
    leftWallRect(ctx, fx, fy, u0, 3, 3, 7, OUT);
    leftWallRect(ctx, fx, fy, u0 + 1, 4, 1, 5, LANTERN_MID);
  }

  // Pitched emerald leaf-shingle roof over the hall
  isoPitchedRoof(ctx, fx, fy, wL + 2, wR + 2, wallH, 7, {
    leftSlope: EMERALD_DARK,
    rightSlope: LEAF_MID,
    gable: IVORY_MID,
    ridge: GOLD_LIGHT,
  });

  // Open book / twin-scroll sign mounted above the doorway on the right roof eave
  rect(ctx, 33, 37, 7, 5, OUT);
  rect(ctx, 34, 38, 2, 3, IVORY_LIGHT); // left page
  rect(ctx, 37, 38, 2, 3, GOLD_LIGHT); // right illuminated page
  rect(ctx, 36, 38, 1, 3, BARK_DARK); // book spine

  // Small reading bench & lantern outside
  drawSilverLantern(ctx, 47, 44, 0);

  return [canvas];
}

/**
 * 17. ACADEMY: Grand High-Elven Astral Conservatory (Tallest Service Building, 2 frames).
 * Star-inlaid colonnaded courtyard, twin scholar wings, soaring central ivory-and-gold spire
 * crowned by a high emerald dome & pulsing starlight beacon (reaches y=3), and twin banners.
 */
function buildElfAcademy(): HTMLCanvasElement[] {
  return [0, 1].map((frame) => {
    const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

    // Grand starlight courtyard with ivory perimeter balustrade
    isoDiamond(ctx, 32, 48, 30, EMERALD_DARK, OUT);
    isoDiamond(ctx, 32, 48, 26, IVORY_MID, GOLD_MID);
    isoDiamond(ctx, 32, 48, 20, EMERALD_MID, GOLD_LIGHT);

    // Front courtyard pillars framing the ceremonial approach
    isoBox(ctx, 25, 57, 3, 3, 6, {
      top: GOLD_LIGHT,
      left: IVORY_DARK,
      right: IVORY_LIGHT,
    });
    isoBox(ctx, 39, 57, 3, 3, 6, {
      top: GOLD_LIGHT,
      left: IVORY_DARK,
      right: IVORY_LIGHT,
    });

    // Wide lower lecture hall with left and right wings
    const fx = 32;
    const fy = 55;
    isoBox(ctx, fx, fy, 20, 20, 11, {
      top: IVORY_LIGHT,
      left: IVORY_DARK,
      right: IVORY_MID,
    });
    leftWallRect(ctx, fx, fy, 0, 9, 20, 2, GOLD_MID);
    rightWallRect(ctx, fx, fy, 0, 9, 20, 2, GOLD_LIGHT);

    // Grand arched portal & tall stained-glass windows along both wings
    rightWallRect(ctx, fx, fy, 3, 1, 5, 8, OUT);
    rightWallRect(ctx, fx, fy, 4, 1, 3, 7, LANTERN_MID);
    for (const v0 of [10, 15]) {
      rightWallRect(ctx, fx, fy, v0, 2, 3, 6, OUT);
      rightWallRect(ctx, fx, fy, v0 + 1, 3, 1, 4, LANTERN_CORE);
    }
    for (const u0 of [4, 10, 15]) {
      leftWallRect(ctx, fx, fy, u0, 2, 3, 6, OUT);
      leftWallRect(ctx, fx, fy, u0 + 1, 3, 1, 4, LANTERN_MID);
    }

    // Second tier: Octagonal ivory-and-gold astral rotunda
    isoBox(ctx, 32, 44, 14, 14, 11, {
      top: GOLD_LIGHT,
      left: IVORY_DARK,
      right: IVORY_LIGHT,
    });
    rightWallRect(ctx, 32, 44, 4, 2, 6, 7, OUT);
    rightWallRect(ctx, 32, 44, 5, 3, 4, 5, LANTERN_CORE);
    leftWallRect(ctx, 32, 44, 4, 2, 6, 7, OUT);
    leftWallRect(ctx, 32, 44, 5, 3, 4, 5, LANTERN_MID);

    // Third tier: Towering high-elven emerald dome & golden celestial spire (reaches y=3)
    drawElvenCanopy(ctx, 32, 26, 14, 10, 0);
    isoBox(ctx, 32, 18, 6, 6, 9, {
      top: GOLD_LIGHT,
      left: GOLD_DARK,
      right: GOLD_MID,
    });
    rect(ctx, 31, 4, 2, 6, GOLD_LIGHT);
    disc(ctx, 32, 4, frame === 0 ? 3 : 2, LANTERN_CORE);

    // Twin tall waving emerald-and-gold academy banners on left and right
    const wave = frame % 2;
    for (const [px0, py0] of [
      [15, 22],
      [47, 22],
    ] as const) {
      rect(ctx, px0, py0, 1, 18, OUT);
      rect(ctx, px0 + 1, py0 + 1, 1, 17, GOLD_LIGHT);
      rect(ctx, px0 + 2, py0 + 2 + wave, 5, 7, OUT);
      rect(ctx, px0 + 2, py0 + 3 + wave, 4, 5, EMERALD_LIGHT);
      rect(ctx, px0 + 3, py0 + 4 + wave, 2, 3, GOLD_LIGHT);
    }

    return canvas;
  });
}

/**
 * 18. CLINIC: Serene Healing Grove Sanctuary (Elves' signature strength, 2 frames).
 * Pristine pale-ivory pavilion beside a soothing silver-blue healing spring,
 * prominent glowing emerald-and-white healing cross/leaf emblem on the front gable,
 * and golden herb pots brimming with moonleaf around the porch.
 */
function buildElfClinic(): HTMLCanvasElement[] {
  return [0, 1].map((frame) => {
    const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

    // Serene mossy grove pad with a gentle silver-blue healing spring pool in front-left
    isoDiamond(ctx, 32, 48, 28, LEAF_DARK, OUT);
    isoDiamond(ctx, 32, 48, 23, LEAF_MID, GOLD_LIGHT);
    isoDiamond(ctx, 23, 51, 8, LANTERN_MID, OUT);
    isoDiamond(ctx, 23, 51, 5, LANTERN_CORE);

    // Clean pale-ivory healing sanctuary pavilion
    const fx = 34;
    const fy = 55;
    const wL = 14;
    const wR = 16;
    const wallH = 12;
    isoBox(ctx, fx, fy, wL, wR, wallH, {
      top: '#ffffff',
      left: IVORY_MID,
      right: IVORY_LIGHT,
    });
    // Soft mint-emerald & gold trim band
    leftWallRect(ctx, fx, fy, 0, wallH - 2, wL, 2, LEAF_LIGHT);
    rightWallRect(ctx, fx, fy, 0, wallH - 2, wR, 2, LEAF_HIGHLIGHT);

    // Open welcoming sanctuary doorway with soothing cyan-green glow
    rightWallRect(ctx, fx, fy, 3, 1, 5, 8, OUT);
    rightWallRect(ctx, fx, fy, 4, 1, 3, 7, LANTERN_CORE);
    rightWallRect(ctx, fx, fy, 10, 3, 4, 5, OUT);
    rightWallRect(ctx, fx, fy, 11, 4, 2, 3, LEAF_HIGHLIGHT);

    // Gentle living-leaf dome roof crowned with a white-and-emerald healing cross emblem
    drawElvenCanopy(ctx, 34, 36, 15, 9, 0);
    // Prominent clean white & emerald-green healing symbol shield on front-right roof face
    disc(ctx, 38, 33, 5, OUT);
    disc(ctx, 38, 33, 4, '#ffffff');
    rect(ctx, 37, 30, 3, 7, LEAF_LIGHT);
    rect(ctx, 35, 32, 7, 3, LEAF_LIGHT);
    px(ctx, 38, 33, LEAF_HIGHLIGHT);

    // Row of golden-terracotta herb pots with glowing moonleaf sprouts along the front
    for (const [hx, hy] of [
      [36, 57],
      [41, 55],
      [46, 52],
    ] as const) {
      isoBox(ctx, hx, hy, 3, 3, 3, {
        top: GOLD_MID,
        left: BARK_MID,
        right: GOLD_LIGHT,
      });
      rect(ctx, hx - 1, hy - 6, 3, 3, LEAF_HIGHLIGHT);
      px(ctx, hx, hy - 7, frame === 0 ? LANTERN_CORE : '#ffffff');
    }

    // Floating emerald/silver healing motes rising over the grove
    const dy = frame % 2;
    px(ctx, 23, 45 - dy, LANTERN_CORE);
    px(ctx, 31, 24 - dy, LEAF_HIGHLIGHT);
    px(ctx, 43, 27 + dy, LANTERN_CORE);

    return canvas;
  });
}

/**
 * 19. WORKSHOP: Moonleaf Herb Garden & Drying Racks (Elves' special good, 3 frames).
 * Fragrant herbalist work yard with raised moonleaf beds, two timber A-frame drying racks
 * hung with pale glowing moonleaf bundles, herbalist workbench, crates, and copper still chimney.
 */
function buildElfWorkshop(): HTMLCanvasElement[] {
  return [0, 1, 2].map((frame) => {
    const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

    // Moss-and-stone herbalist yard pad
    isoDiamond(ctx, 32, 48, 28, LEAF_DARK, OUT);
    isoDiamond(ctx, 32, 48, 24, '#214d35', BARK_DARK);

    // Raised stone-bordered moonleaf garden bed on front-left with pale glowing leaves
    isoBox(ctx, 24, 55, 10, 8, 3, {
      top: '#1a3d2a',
      left: IVORY_DARK,
      right: IVORY_MID,
    });
    for (const [lx, ly] of [
      [20, 49],
      [23, 48],
      [26, 49],
      [22, 51],
      [25, 51],
    ] as const) {
      rect(ctx, lx, ly - 2, 2, 2, LEAF_HIGHLIGHT);
      px(ctx, lx, ly - 3, frame === 1 ? '#ffffff' : LANTERN_CORE);
    }

    // Two tall living-wood drying racks on back-right hung with rows of pale glowing moonleaf
    for (const [rx, ry] of [
      [34, 47],
      [41, 51],
    ] as const) {
      // Upright bark posts & crossbars
      rect(ctx, rx - 5, ry - 12, 2, 12, OUT);
      rect(ctx, rx - 4, ry - 12, 1, 11, BARK_LIGHT);
      rect(ctx, rx + 3, ry - 9, 2, 12, OUT);
      rect(ctx, rx + 4, ry - 9, 1, 11, BARK_MID);
      rect(ctx, rx - 5, ry - 11, 10, 2, GOLD_MID);
      rect(ctx, rx - 5, ry - 6, 10, 2, BARK_LIGHT);
      // Hanging bundles of pale glowing moonleaf leaves
      for (const dx of [-3, 0, 2]) {
        const glowCol = (dx + frame) % 2 === 0 ? LANTERN_CORE : LEAF_HIGHLIGHT;
        rect(ctx, rx + dx, ry - 9, 2, 3, OUT);
        rect(ctx, rx + dx, ry - 9, 2, 2, glowCol);
        rect(ctx, rx + dx, ry - 4, 2, 3, OUT);
        rect(ctx, rx + dx, ry - 4, 2, 2, LEAF_HIGHLIGHT);
      }
    }

    // Herbalist tool bench in center-front + crates of packed moonleaf on right
    isoBox(ctx, 33, 57, 6, 9, 4, {
      top: IVORY_LIGHT,
      left: BARK_DARK,
      right: BARK_LIGHT,
    });
    rect(ctx, 33, 51, 3, 2, LANTERN_CORE); // cut moonleaf on bench
    rect(ctx, 37, 50, 2, 2, GOLD_LIGHT); // golden mortar & pestle

    isoBox(ctx, 45, 55, 5, 5, 4, {
      top: LEAF_HIGHLIGHT,
      left: BARK_DARK,
      right: GOLD_MID,
    });

    // Small ivory-and-gold herbal alembic chimney on back-left corner emitting fragrant silver mist
    isoBox(ctx, 23, 44, 6, 6, 11, {
      top: GOLD_LIGHT,
      left: IVORY_DARK,
      right: IVORY_MID,
    });
    const mistY = 29 - frame * 2;
    disc(ctx, 23, mistY, 2, LANTERN_MID);
    px(ctx, 23, mistY - 1, LANTERN_CORE);
    px(ctx, 25, mistY - 3, LEAF_HIGHLIGHT);

    return canvas;
  });
}

/**
 * Citizen sprite (16x24): Elf villager with pointed ears, slender tunic (variants 0..3),
 * 4-frame walk cycle, feet at y=23.
 */
function buildElfCitizen(frame: number, variant: number): HTMLCanvasElement {
  const [canvas, ctx] = makeCanvas(16, 24);
  const f = ((frame % 4) + 4) % 4;
  const v = ((variant % 4) + 4) % 4;

  const tunicColors = [
    [EMERALD_MID, LEAF_LIGHT],
    [IVORY_MID, GOLD_LIGHT],
    [LEAF_MID, GOLD_MID],
    ['#2b5b6c', LANTERN_MID],
  ] as const;
  const hairColors = [GOLD_LIGHT, IVORY_LIGHT, '#d99b52', '#a8f0ff'] as const;
  const [tunicMain, tunicTrim] = tunicColors[v]!;
  const hair = hairColors[v]!;
  const skin = '#fce2c4';

  const bob = f === 1 || f === 3 ? -1 : 0;

  // Head & hair (y = 5..10)
  rect(ctx, 5, 4 + bob, 6, 7, OUT);
  rect(ctx, 6, 5 + bob, 4, 5, skin);
  rect(ctx, 5, 4 + bob, 6, 2, hair);
  rect(ctx, 5, 6 + bob, 1, 4, hair); // long elven locks
  rect(ctx, 10, 6 + bob, 1, 4, hair);
  // Pointed elven ears sticking out horizontally!
  px(ctx, 3, 7 + bob, OUT);
  px(ctx, 4, 7 + bob, skin);
  px(ctx, 11, 7 + bob, skin);
  px(ctx, 12, 7 + bob, OUT);
  // Eyes
  px(ctx, 7, 7 + bob, '#1b4d3e');
  px(ctx, 9, 7 + bob, '#1b4d3e');

  // Slender elven tunic & cloak (y = 11..19)
  rect(ctx, 4, 11 + bob, 8, 8, OUT);
  rect(ctx, 5, 11 + bob, 6, 7, tunicMain);
  rect(ctx, 7, 11 + bob, 2, 7, tunicTrim); // vertical gold/leaf sash
  rect(ctx, 5, 17 + bob, 6, 1, GOLD_LIGHT); // belt / hem trim

  // Swinging arms
  const armSwing = f === 0 ? 0 : f === 1 ? 1 : f === 2 ? 0 : -1;
  rect(ctx, 4, 12 + bob + armSwing, 1, 4, tunicMain);
  rect(ctx, 11, 12 + bob - armSwing, 1, 4, tunicMain);

  // Legs & boots with feet at bottom row (y = 23)
  const leftY = f === 1 ? 19 : 20;
  const rightY = f === 3 ? 19 : 20;
  rect(ctx, 5, 19, 3, 5, OUT);
  rect(ctx, 6, leftY, 1, 23 - leftY, BARK_MID);
  px(ctx, 6, 23, BARK_DARK);

  rect(ctx, 8, 19, 3, 5, OUT);
  rect(ctx, 9, rightY, 1, 23 - rightY, BARK_MID);
  px(ctx, 9, 23, BARK_DARK);

  return canvas;
}

export const art: ArcArt = {
  ground: buildElfGround,
  foundation: buildElfFoundation,
  citizen: buildElfCitizen,
  buildings: {
    house: buildElfHouse,
    shop: buildElfShop,
    barracks: buildElfBarracks,
    tower: buildElfTower,
    farm: buildElfFarm,
    school: buildElfSchool,
    factory: buildElfFactory,
    lumber: buildElfLumber,
    mine: buildElfMine,
    park: buildElfPark,
    tree: buildElfTree,
    lamp: buildElfLamp,
    fountain: buildElfFountain,
    statue: buildElfStatue,
    rowhouse: buildElfRowhouse,
    manor: buildElfManor,
    stall: buildElfStall,
    tavern: buildElfTavern,
    bank: buildElfBank,
    library: buildElfLibrary,
    academy: buildElfAcademy,
    clinic: buildElfClinic,
    workshop: buildElfWorkshop,
  },
};
