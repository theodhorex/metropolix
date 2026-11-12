import type { ArcId, BuildingKind } from '@metropolix/sim';
import {
  OUT,
  SPRITE_H,
  SPRITE_W,
  disc,
  isoBox,
  isoDiamond,
  leftWallRect,
  makeCanvas,
  px,
  rect,
  rightWallRect,
} from '../sprites';

// ============================================================================
// 1. ELF WONDER: MOON TREE (kind: 'moontree', height 2.6, 3 frames)
// A huge silver-leaved tree with a glowing moon-white canopy and lanterns, roots over the tile.
// Palette & motifs: apps/web/lib/arcs/elf.ts
// ============================================================================

const ELF_EMERALD_DARK = '#14382d';
const ELF_EMERALD_MID = '#1e5242';
const ELF_EMERALD_LIGHT = '#2c735c';
const ELF_BARK_DARK = '#3b2316';
const ELF_BARK_MID = '#593724';
const ELF_BARK_LIGHT = '#784d35';
const ELF_IVORY_DARK = '#b8b2a6';
const ELF_IVORY_MID = '#dbd5c7';
const ELF_IVORY_LIGHT = '#f5f1e6';
const ELF_GOLD_DARK = '#8f6f1d';
const ELF_GOLD_MID = '#c79f32';
const ELF_GOLD_LIGHT = '#f5d76e';
const ELF_LANTERN_CORE = '#e0fbff';
const ELF_LANTERN_MID = '#7ce0f7';
const ELF_LANTERN_DIM = '#3ba3c4';
const ELF_SILVER_LIGHT = '#e8f5e9';
const ELF_SILVER_MID = '#c8e6c9';
const ELF_SILVER_DARK = '#b2dfdb';

function buildMoontreeTexture(frame = 0): HTMLCanvasElement {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  // 1. Mossy enchanted elven ground diamond
  isoDiamond(ctx, 32, 52, 28, ELF_EMERALD_DARK, OUT);
  isoDiamond(ctx, 32, 52, 24, ELF_EMERALD_MID, ELF_EMERALD_DARK);

  // Bioluminescent azure ground mushrooms & spore blooms
  const shrooms = [
    [20, 50], [24, 54], [40, 54], [44, 49], [32, 59], [28, 46], [36, 46],
  ] as const;
  for (const [mx, my] of shrooms) {
    px(ctx, mx, my, ELF_LANTERN_MID);
    px(ctx, mx, my - 1, ELF_LANTERN_CORE);
  }

  // 2. Gnarled ancient silver roots grasping across the tile
  const roots = [
    // Left roots
    [[32, 52], [28, 52], [24, 51], [20, 49], [16, 48]],
    [[30, 53], [26, 54], [22, 56], [18, 56]],
    // Right roots
    [[32, 52], [36, 52], [40, 51], [44, 49], [48, 48]],
    [[34, 53], [38, 54], [42, 56], [46, 56]],
    // Front roots
    [[32, 53], [32, 56], [31, 58], [32, 60]],
    [[31, 54], [29, 56], [28, 58]],
    [[33, 54], [35, 56], [36, 58]],
  ] as const;

  for (const path of roots) {
    for (let i = 0; i < path.length; i++) {
      const [rx, ry] = path[i]!;
      rect(ctx, rx, ry, 2, 2, i < 2 ? ELF_IVORY_MID : ELF_IVORY_DARK);
      px(ctx, rx, ry, ELF_IVORY_LIGHT);
      px(ctx, rx, ry + 1, ELF_BARK_DARK);
    }
  }

  // 3. Towering twisting silver-ivory trunk (from y=50 up to y=25, height 2.6)
  for (let y = 50; y >= 25; y--) {
    const progress = (50 - y) / 25; // 0 at base, 1 at canopy junction
    const w = Math.round(11 - progress * 4); // 11 at base -> 7 at top
    const cx = 32 + Math.round(Math.sin(progress * 3.5) * 2); // subtle elven twist
    const x0 = cx - (w >> 1);

    rect(ctx, x0 - 1, y, w + 2, 1, OUT);
    rect(ctx, x0, y, 2, 1, ELF_BARK_DARK);
    rect(ctx, x0 + 2, y, w - 4, 1, ELF_IVORY_MID);
    rect(ctx, x0 + w - 2, y, 2, 1, ELF_IVORY_LIGHT);
  }

  // Spiral runic bark carvings glowing along the trunk
  for (let i = 0; i < 6; i++) {
    const ry = 46 - i * 4;
    const rx = 30 + Math.round(Math.sin(i * 1.2) * 3);
    px(ctx, rx, ry, ELF_LANTERN_MID);
    px(ctx, rx + 1, ry, ELF_LANTERN_CORE);
  }

  // 4. Massive Billowing Moon-White & Silver Canopy (y=4..32, width ~46px)
  // Deep under-canopy foliage discs
  const underCanopy = [
    [23, 22, 11], [41, 22, 11], [32, 18, 13], [32, 25, 9],
  ] as const;
  for (const [cx, cy, r] of underCanopy) {
    disc(ctx, cx, cy, r, OUT);
    disc(ctx, cx, cy, r - 1, ELF_EMERALD_DARK);
    disc(ctx, cx, cy, r - 2, ELF_EMERALD_LIGHT);
  }

  // Silver-leaf middle canopy puffs
  const midCanopy = [
    [18, 19, 8], [46, 19, 8], [24, 14, 9], [40, 14, 9], [32, 11, 10], [32, 20, 8],
  ] as const;
  for (const [cx, cy, r] of midCanopy) {
    disc(ctx, cx, cy, r, OUT);
    disc(ctx, cx, cy, r - 1, ELF_SILVER_DARK);
    disc(ctx, cx, cy, r - 2, ELF_SILVER_MID);
    disc(ctx, cx, cy, r - 3, ELF_SILVER_LIGHT);
  }

  // Glowing moon-white sunlit crowns & leafy highlights
  const topCrowns = [
    [22, 12, 6], [42, 12, 6], [32, 8, 8], [32, 14, 6],
  ] as const;
  for (const [cx, cy, r] of topCrowns) {
    disc(ctx, cx, cy, r - 1, ELF_SILVER_LIGHT);
    disc(ctx, cx - 1, cy - 1, r - 2, '#ffffff');
    px(ctx, cx - 1, cy - 2, ELF_LANTERN_CORE);
  }

  // 5. Hanging Filigree Gold Elven Lanterns (3 lanterns)
  const lanternLocs = [
    { x: 19, y: 28 }, // left bough
    { x: 32, y: 33 }, // front bough
    { x: 45, y: 28 }, // right bough
  ] as const;

  for (let idx = 0; idx < lanternLocs.length; idx++) {
    const { x, y } = lanternLocs[idx]!;
    // Gold chain hanging from bough
    rect(ctx, x, y - 5, 1, 5, ELF_GOLD_MID);

    // Ornate gold lantern frame
    rect(ctx, x - 1, y, 3, 4, OUT);
    rect(ctx, x - 1, y, 3, 1, ELF_GOLD_LIGHT);
    rect(ctx, x - 1, y + 3, 3, 1, ELF_GOLD_DARK);

    // Glowing cyan/moon-white core with 3-frame animated pulsing
    const pulsePhase = (frame + idx) % 3;
    if (pulsePhase === 0) {
      px(ctx, x, y + 1, ELF_LANTERN_CORE);
      px(ctx, x, y + 2, ELF_LANTERN_MID);
      // Soft ambient glow aura
      px(ctx, x - 1, y + 1, ELF_LANTERN_DIM);
      px(ctx, x + 1, y + 1, ELF_LANTERN_DIM);
    } else if (pulsePhase === 1) {
      rect(ctx, x - 1, y + 1, 3, 2, ELF_LANTERN_MID);
      px(ctx, x, y + 1, '#ffffff');
      px(ctx, x, y + 2, ELF_LANTERN_CORE);
    } else {
      px(ctx, x, y + 1, ELF_LANTERN_CORE);
      px(ctx, x, y + 2, ELF_LANTERN_CORE);
    }
  }

  // 6. Falling glowing starlight / moonleaf motes drifting down (3 frames)
  const motes = [
    // [baseX, baseY]
    [21, 34], [25, 41], [39, 36], [43, 43], [30, 48], [35, 47],
  ] as const;

  for (let m = 0; m < motes.length; m++) {
    const [bx, by] = motes[m]!;
    const my = by + ((frame + m) % 3) * 2;
    const mx = bx + ((frame + m * 2) % 3) - 1;
    px(ctx, mx, my, ELF_LANTERN_CORE);
    px(ctx, mx, my + 1, ELF_LANTERN_MID);
  }

  return canvas;
}

// ============================================================================
// 2. LIZARD WONDER: SUNKEN TEMPLE (kind: 'suntemple', height 2.0, 3 frames)
// A stepped swamp temple half in water, vines, a serpent idol, glowing pool.
// Palette & motifs: apps/web/lib/arcs/lizard.ts
// ============================================================================

const LIZ_TEAL_DARK = '#13494d';
const LIZ_TEAL_MID = '#1f7075';
const LIZ_TEAL_LIGHT = '#359ca3';
const LIZ_TEAL_BRIGHT = '#62d8de';
const LIZ_OCHRE_DARK = '#7d5628';
const LIZ_OCHRE_MID = '#ad7b3b';
const LIZ_OCHRE_LIGHT = '#dba358';
const LIZ_TERRA_DARK = '#6e331e';
const LIZ_TERRA_MID = '#9c4b2e';
const LIZ_TERRA_LIGHT = '#c96844';
const LIZ_AMBER_BRIGHT = '#ffd059';
const LIZ_AMBER_MID = '#eb9421';
const LIZ_VENOM_GLOW = '#76ff9b';
const LIZ_BONE_LIGHT = '#ebe3d2';
const LIZ_MUD_DARK = '#3b2d20';
const LIZ_MUD_MID = '#54412e';
const LIZ_REED_DARK = '#6b5a35';

function buildSuntempleTexture(frame = 0): HTMLCanvasElement {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  // 1. Murky flooded swamp basin surrounding temple
  isoDiamond(ctx, 32, 53, 28, LIZ_MUD_DARK, OUT);
  isoDiamond(ctx, 32, 53, 24, LIZ_TEAL_DARK, LIZ_MUD_MID);

  // Swamp reed clumps around water perimeter
  for (const [rx, ry] of [[12, 53], [16, 56], [48, 56], [52, 53]] as const) {
    rect(ctx, rx, ry - 4, 1, 4, LIZ_REED_DARK);
    px(ctx, rx, ry - 5, LIZ_TEAL_MID);
  }

  // 2. Stepped Weathered Sandstone Ziggurat (half in water)
  // Lower step (submerged base at y=58)
  const s1Fx = 32;
  const s1Fy = 58;
  const s1W = 19;
  const s1H = 6;
  isoBox(ctx, s1Fx, s1Fy, s1W, s1W, s1H, {
    top: LIZ_OCHRE_LIGHT,
    left: LIZ_OCHRE_DARK,
    right: LIZ_OCHRE_MID,
  });

  // Murky swamp waterline & water shimmer on submerged step
  for (let u = 0; u < s1W; u++) {
    const x = s1Fx - 1 - u;
    const y = s1Fy - (u >> 1);
    px(ctx, x, y, (u + frame) % 2 === 0 ? LIZ_TEAL_BRIGHT : LIZ_TEAL_MID);
  }
  for (let v = 0; v < s1W; v++) {
    const x = s1Fx + v;
    const y = s1Fy - (v >> 1);
    px(ctx, x, y, (v + frame) % 2 === 0 ? LIZ_TEAL_BRIGHT : LIZ_TEAL_MID);
  }

  // Mid stepped terrace
  const s2Fx = 32;
  const s2Fy = 52;
  const s2W = 14;
  const s2H = 7;
  isoBox(ctx, s2Fx, s2Fy, s2W, s2W, s2H, {
    top: LIZ_TERRA_LIGHT,
    left: LIZ_TERRA_DARK,
    right: LIZ_TERRA_MID,
  });

  // Top temple summit platform
  const s3Fx = 32;
  const s3Fy = 45;
  const s3W = 9;
  const s3H = 6;
  isoBox(ctx, s3Fx, s3Fy, s3W, s3W, s3H, {
    top: LIZ_OCHRE_LIGHT,
    left: LIZ_OCHRE_DARK,
    right: LIZ_OCHRE_MID,
  });

  // 3. Central Glowing Sacred Venom / Sun Pool
  // Sunken pool in the summit platform
  isoDiamond(ctx, 32, 39, 5, LIZ_TEAL_DARK, OUT);

  // Animated toxic green / solar gold pulsating pool
  const poolCoreCol = frame === 0 ? LIZ_VENOM_GLOW : frame === 1 ? LIZ_AMBER_BRIGHT : LIZ_TEAL_BRIGHT;
  const poolMidCol = frame === 0 ? LIZ_TEAL_LIGHT : frame === 1 ? LIZ_VENOM_GLOW : LIZ_AMBER_MID;
  isoDiamond(ctx, 32, 39, 3, poolMidCol);
  px(ctx, 32, 39, poolCoreCol);

  // 4. Overhanging Jungle Vines draping down the temple tiers
  const vinePaths = [
    // Left tier vines
    [[22, 45], [21, 47], [21, 49], [20, 51], [20, 53]],
    [[26, 48], [26, 50], [25, 52], [25, 54]],
    // Right tier vines
    [[42, 45], [43, 47], [43, 49], [44, 51], [44, 53]],
    [[38, 48], [38, 50], [39, 52], [39, 54]],
  ] as const;
  for (const vPath of vinePaths) {
    for (const [vx, vy] of vPath) {
      px(ctx, vx, vy, LIZ_TEAL_MID);
      px(ctx, vx, vy + 1, LIZ_VENOM_GLOW);
    }
  }

  // 5. Feathered Serpent / Quetzalcoatl Idol rising at summit (height 2.0, reaches y=14..28)
  // Idol stone base plinth
  rect(ctx, 29, 29, 6, 4, OUT);
  rect(ctx, 30, 29, 4, 3, LIZ_TERRA_MID);

  // Coiled serpent body
  rect(ctx, 28, 23, 8, 6, OUT);
  rect(ctx, 29, 24, 6, 4, LIZ_TERRA_LIGHT);
  px(ctx, 30, 25, LIZ_OCHRE_LIGHT);
  px(ctx, 33, 25, LIZ_OCHRE_LIGHT);

  // Flaring feathered serpent cobra hood & crest
  rect(ctx, 26, 17, 12, 6, OUT);
  rect(ctx, 27, 18, 10, 4, LIZ_TEAL_LIGHT);
  rect(ctx, 28, 19, 8, 2, LIZ_TEAL_BRIGHT);

  // Serpent head & open fanged jaws
  rect(ctx, 30, 16, 4, 7, OUT);
  rect(ctx, 30, 17, 4, 5, LIZ_TERRA_LIGHT);
  // White fangs
  px(ctx, 30, 21, LIZ_BONE_LIGHT);
  px(ctx, 33, 21, LIZ_BONE_LIGHT);

  // Pulsating glowing serpent eyes (3 frames)
  const eyeCol = frame === 0 ? LIZ_AMBER_BRIGHT : frame === 1 ? LIZ_VENOM_GLOW : '#ffffff';
  px(ctx, 30, 18, eyeCol);
  px(ctx, 33, 18, eyeCol);

  // Golden Sun Disc Crown behind serpent idol head
  disc(ctx, 32, 14, 5, OUT);
  disc(ctx, 32, 14, 4, LIZ_AMBER_MID);
  disc(ctx, 32, 14, 2, LIZ_AMBER_BRIGHT);
  px(ctx, 32, 14, '#ffffff'); // blinding sun core

  // Sun disc crown rays
  for (let a = 0; a < 8; a++) {
    const ang = (a * Math.PI) / 4;
    const rx = 32 + Math.round(Math.cos(ang) * 6);
    const ry = 14 + Math.round(Math.sin(ang) * 6);
    px(ctx, rx, ry, LIZ_AMBER_BRIGHT);
  }

  // 6. Floating swamp firefly / bio-spores (3 frames)
  const spores = [
    [24, 42], [39, 41], [27, 34], [37, 33], [32, 26],
  ] as const;
  for (let s = 0; s < spores.length; s++) {
    const [sx, sy] = spores[s]!;
    const py = sy - ((frame + s) % 3) * 2;
    const px0 = sx + ((frame + s * 2) % 3) - 1;
    px(ctx, px0, py, LIZ_VENOM_GLOW);
  }

  return canvas;
}

// ============================================================================
// 3. CAVEMAN WONDER: STANDING STONES (kind: 'stones', height 1.8, 3 frames)
// A ring of huge rough stones around a fire, mammoth skull, painted marks.
// Palette & motifs: apps/web/lib/arcs/caveman.ts
// ============================================================================

const CAV_DIRT_DARK = '#4d3a26';
const CAV_DIRT_0 = '#785f43';
const CAV_DIRT_1 = '#6b5339';
const CAV_FUR_LIGHT = '#9c9286';
const CAV_FUR_MID = '#756c62';
const CAV_FUR_DARK = '#4f4840';
const CAV_BONE_LIGHT = '#f5efe2';
const CAV_BONE_MID = '#d9ccb8';
const CAV_BONE_DARK = '#9e8f79';
const CAV_WOOD_DARK = '#4a2e16';
const CAV_OCHRE_RED = '#b83b24';
const CAV_FLAME_CORE = '#fff176';
const CAV_FLAME_MID = '#ff9800';
const CAV_FLAME_DARK = '#e65100';

function buildStonesTexture(frame = 0): HTMLCanvasElement {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  // 1. Primitive sacred packed earth circle
  isoDiamond(ctx, 32, 50, 27, CAV_DIRT_DARK, OUT);
  isoDiamond(ctx, 32, 50, 23, CAV_DIRT_0, CAV_DIRT_1);

  // Scattered ancient mammoth bones & tribal skull markers around ground
  const boneTotems = [
    [17, 49], [22, 55], [42, 55], [47, 49],
  ] as const;
  for (const [bx, by] of boneTotems) {
    rect(ctx, bx, by, 2, 2, CAV_BONE_MID);
    px(ctx, bx, by, CAV_BONE_LIGHT);
    px(ctx, bx + 1, by + 1, CAV_BONE_DARK);
  }

  // 2. Megalithic Standing Stones (Stonehenge Trilithon & Menhir Ring)
  // Back Trilithon: Two massive vertical menhirs spanned by a heavy lintel slab
  // Left pillar of trilithon: x=24..28, y=20..36
  rect(ctx, 24, 20, 5, 17, OUT);
  rect(ctx, 25, 20, 2, 16, CAV_FUR_DARK);
  rect(ctx, 27, 20, 2, 16, CAV_FUR_MID);
  px(ctx, 26, 21, CAV_FUR_LIGHT);

  // Right pillar of trilithon: x=36..40, y=20..36
  rect(ctx, 36, 20, 5, 17, OUT);
  rect(ctx, 37, 20, 2, 16, CAV_FUR_MID);
  rect(ctx, 39, 20, 2, 16, CAV_FUR_LIGHT);
  px(ctx, 38, 21, '#cfd8dc');

  // Spanning Horizontal Lintel Stone Slab (across x=22..42, y=16..21)
  rect(ctx, 22, 16, 21, 5, OUT);
  rect(ctx, 23, 17, 19, 2, CAV_FUR_LIGHT);
  rect(ctx, 23, 19, 19, 1, CAV_FUR_MID);
  // Red ochre painted tribal spiral on the lintel
  rect(ctx, 30, 17, 5, 2, CAV_OCHRE_RED);
  px(ctx, 32, 18, CAV_FLAME_MID);

  // Outer Standing Menhir Pillars
  // Far-left menhir: x=13..18, y=32..46
  rect(ctx, 13, 31, 6, 16, OUT);
  rect(ctx, 14, 32, 2, 14, CAV_FUR_DARK);
  rect(ctx, 16, 32, 2, 14, CAV_FUR_MID);
  px(ctx, 16, 31, CAV_FUR_LIGHT);

  // Far-right menhir: x=47..52, y=32..46
  rect(ctx, 46, 31, 6, 16, OUT);
  rect(ctx, 47, 32, 2, 14, CAV_FUR_MID);
  rect(ctx, 49, 32, 2, 14, CAV_FUR_LIGHT);
  px(ctx, 48, 31, '#cfd8dc');

  // Front-left menhir: x=18..22, y=43..53
  rect(ctx, 18, 43, 5, 10, OUT);
  rect(ctx, 19, 44, 3, 8, CAV_FUR_MID);
  px(ctx, 20, 44, CAV_FUR_LIGHT);

  // Front-right menhir: x=42..46, y=43..53
  rect(ctx, 42, 43, 5, 10, OUT);
  rect(ctx, 43, 44, 3, 8, CAV_FUR_LIGHT);
  px(ctx, 43, 44, '#ffffff');

  // 3. Red Ochre Cave Art Paintings on Stone Faces
  // Bison silhouette on left pillar
  px(ctx, 26, 26, CAV_OCHRE_RED);
  px(ctx, 27, 26, CAV_OCHRE_RED);
  px(ctx, 26, 27, CAV_OCHRE_RED);
  // Handprint on right pillar
  px(ctx, 38, 26, CAV_OCHRE_RED);
  px(ctx, 38, 27, CAV_OCHRE_RED);
  px(ctx, 39, 27, CAV_OCHRE_RED);
  // Sun marks on far stones
  px(ctx, 15, 36, CAV_OCHRE_RED);
  px(ctx, 48, 36, CAV_OCHRE_RED);

  // 4. Giant Mammoth Skull Altar (in front of trilithon)
  // Skull cranium
  rect(ctx, 29, 33, 7, 6, OUT);
  rect(ctx, 30, 34, 5, 4, CAV_BONE_LIGHT);
  // Dark eye sockets
  px(ctx, 30, 35, CAV_BONE_DARK);
  px(ctx, 34, 35, CAV_BONE_DARK);
  px(ctx, 32, 36, CAV_BONE_MID); // nasal bridge

  // Enormous Sweeping Mammoth Tusks (curving outward and forward around fire)
  // Left tusk: curves from (29, 37) down to (24, 45) then sweeps up
  const leftTusk = [[29, 37], [28, 39], [27, 41], [25, 43], [24, 44], [23, 43]] as const;
  for (const [tx, ty] of leftTusk) {
    rect(ctx, tx, ty, 2, 2, CAV_BONE_LIGHT);
    px(ctx, tx, ty + 1, CAV_BONE_MID);
  }
  px(ctx, 23, 42, CAV_BONE_LIGHT); // pointed tip

  // Right tusk: curves from (35, 37) down to (40, 45) then sweeps up
  const rightTusk = [[35, 37], [36, 39], [37, 41], [39, 43], [40, 44], [41, 43]] as const;
  for (const [tx, ty] of rightTusk) {
    rect(ctx, tx, ty, 2, 2, CAV_BONE_LIGHT);
    px(ctx, tx, ty + 1, CAV_BONE_MID);
  }
  px(ctx, 41, 42, CAV_BONE_LIGHT);

  // 5. Eternal Great Tribal Bonfire (Center x=32, y=47)
  // Ring of hearth stones
  disc(ctx, 32, 47, 6, CAV_FUR_DARK);
  disc(ctx, 32, 47, 5, '#1e1610');
  // Charcoal logs
  rect(ctx, 29, 47, 7, 2, CAV_WOOD_DARK);

  // Roaring central fire animated across 3 frames
  if (frame === 0) {
    // Tall soaring flames
    rect(ctx, 30, 42, 5, 5, CAV_FLAME_MID);
    rect(ctx, 31, 43, 3, 4, CAV_FLAME_CORE);
    px(ctx, 32, 41, CAV_FLAME_DARK);
    px(ctx, 32, 40, CAV_FLAME_CORE);
    // Sparks
    px(ctx, 30, 39, CAV_FLAME_MID);
    px(ctx, 34, 38, CAV_FLAME_CORE);
  } else if (frame === 1) {
    // Flickering shifted flames
    rect(ctx, 29, 43, 6, 4, CAV_FLAME_MID);
    rect(ctx, 30, 43, 4, 3, CAV_FLAME_CORE);
    px(ctx, 31, 41, CAV_FLAME_CORE);
    px(ctx, 33, 40, CAV_FLAME_DARK);
    px(ctx, 33, 39, CAV_FLAME_MID);
    // Sparks
    px(ctx, 32, 38, CAV_FLAME_CORE);
    px(ctx, 29, 37, CAV_FLAME_MID);
  } else {
    // Intense blazing core
    rect(ctx, 30, 43, 5, 4, CAV_FLAME_MID);
    rect(ctx, 31, 43, 3, 3, '#ffffff');
    px(ctx, 32, 42, CAV_FLAME_CORE);
    px(ctx, 31, 40, CAV_FLAME_DARK);
    px(ctx, 31, 39, CAV_FLAME_CORE);
    // Sparks
    px(ctx, 35, 39, CAV_FLAME_CORE);
    px(ctx, 31, 37, CAV_FLAME_MID);
  }

  // Firelight reflection on inner monolith faces
  const glowCol = frame === 0 ? CAV_FLAME_MID : frame === 1 ? CAV_FLAME_CORE : CAV_FLAME_DARK;
  px(ctx, 28, 30, glowCol);
  px(ctx, 36, 30, glowCol);

  return canvas;
}

// ============================================================================
// 4. DRAGON WONDER: EMBER THRONE (kind: 'emberthrone', height 2.4, 3 frames)
// Obsidian throne on a lava-veined dais, gold hoard, ember sparks.
// Palette & motifs: apps/web/lib/arcs/dragon.ts
// ============================================================================

const DRAG_ASH_DARK = '#141117';
const DRAG_ASH_LIGHT = '#342d38';
const DRAG_OBS_TOP = '#3a3247';
const DRAG_OBS_RIGHT = '#262030';
const DRAG_OBS_LEFT = '#181420';
const DRAG_BASALT_TOP = '#7a2e2e';
const DRAG_BASALT_RIGHT = '#591f1f';
const DRAG_BASALT_LEFT = '#3d1414';
const DRAG_PURPLE_LIGHT = '#6b4280';
const DRAG_LAVA_BRIGHT = '#fff176';
const DRAG_LAVA_MID = '#ff6d00';
const DRAG_LAVA_RED = '#d50000';
const DRAG_GOLD_BRIGHT = '#ffe57f';
const DRAG_GOLD_MID = '#ffc107';
const DRAG_GOLD_DARK = '#b26a00';
const DRAG_HORN_LIGHT = '#e0d6cc';
const DRAG_HORN_MID = '#9e8c7a';

function buildEmberthroneTexture(frame = 0): HTMLCanvasElement {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  // 1. Volcanic ash and obsidian ground
  isoDiamond(ctx, 32, 53, 28, DRAG_ASH_DARK, OUT);
  isoDiamond(ctx, 32, 53, 24, DRAG_ASH_LIGHT, DRAG_ASH_DARK);

  // 2. Stepped Obsidian & Basalt Dais with Molten Lava Veins
  // Lower tier dais
  const d1Fx = 32;
  const d1Fy = 58;
  const d1W = 18;
  const d1H = 6;
  isoBox(ctx, d1Fx, d1Fy, d1W, d1W, d1H, {
    top: DRAG_OBS_TOP,
    left: DRAG_OBS_LEFT,
    right: DRAG_OBS_RIGHT,
  });

  // Upper dais platform
  const d2Fx = 32;
  const d2Fy = 52;
  const d2W = 12;
  const d2H = 6;
  isoBox(ctx, d2Fx, d2Fy, d2W, d2W, d2H, {
    top: DRAG_BASALT_TOP,
    left: DRAG_BASALT_LEFT,
    right: DRAG_BASALT_RIGHT,
  });

  // Molten glowing lava veins pulsating across dais faces (3 frames)
  const lavaHi = frame === 0 ? DRAG_LAVA_BRIGHT : frame === 1 ? '#ffffff' : DRAG_LAVA_MID;
  const lavaLo = frame === 0 ? DRAG_LAVA_RED : frame === 1 ? DRAG_LAVA_MID : DRAG_LAVA_RED;

  // Lava fissures on left wall
  leftWallRect(ctx, d1Fx, d1Fy, 3, 2, 4, 1, lavaLo);
  leftWallRect(ctx, d1Fx, d1Fy, 4, 3, 2, 1, lavaHi);
  leftWallRect(ctx, d1Fx, d1Fy, 9, 2, 5, 1, lavaLo);
  leftWallRect(ctx, d1Fx, d1Fy, 10, 3, 3, 1, lavaHi);

  // Lava fissures on right wall
  rightWallRect(ctx, d1Fx, d1Fy, 3, 2, 4, 1, lavaLo);
  rightWallRect(ctx, d1Fx, d1Fy, 4, 3, 2, 1, lavaHi);
  rightWallRect(ctx, d1Fx, d1Fy, 9, 2, 5, 1, lavaLo);
  rightWallRect(ctx, d1Fx, d1Fy, 10, 3, 3, 1, lavaHi);

  // 3. Vast Dragon Hoard of Glistening Gold & Gems
  // Spilling across the lower dais and onto the ground
  const goldPiles: readonly (readonly [number, number, number, number])[] = [
    // [x, y, w, h]
    [20, 52, 6, 4], [40, 52, 6, 4],
    [26, 54, 7, 5], [33, 54, 7, 5],
    [16, 48, 5, 3], [44, 48, 5, 3],
  ];
  for (const [gx, gy, gw, gh] of goldPiles) {
    rect(ctx, gx, gy, gw, gh, DRAG_GOLD_DARK);
    rect(ctx, gx + 1, gy, gw - 2, gh - 1, DRAG_GOLD_MID);
    // Scattered coin highlights
    for (let py = 0; py < gh; py++) {
      for (let px0 = 0; px0 < gw; px0++) {
        if ((px0 + py) % 2 === 0) {
          px(ctx, gx + px0, gy + py, DRAG_GOLD_BRIGHT);
        }
      }
    }
  }

  // Jeweled treasures in the hoard (rubies & sapphires)
  px(ctx, 28, 55, '#f44336'); // ruby
  px(ctx, 36, 55, '#29b6f6'); // sapphire
  px(ctx, 22, 53, '#76ff03'); // emerald
  px(ctx, 42, 53, '#e040fb'); // amethyst

  // 4. Majestically Towering Obsidian Throne (height 2.4, reaches y=10..46)
  // Throne seat box
  const tFx = 32;
  const tFy = 46;
  const tW = 8;
  const tH = 8;
  isoBox(ctx, tFx, tFy, tW, tW, tH, {
    top: DRAG_OBS_TOP,
    left: DRAG_OBS_LEFT,
    right: DRAG_OBS_RIGHT,
  });

  // Throne armrests with bleached dragon horns
  // Left armrest horn
  rect(ctx, 25, 39, 2, 5, DRAG_HORN_MID);
  px(ctx, 25, 38, DRAG_HORN_LIGHT);
  px(ctx, 24, 37, '#ffffff'); // sharp horn tip
  // Right armrest horn
  rect(ctx, 37, 39, 2, 5, DRAG_HORN_MID);
  px(ctx, 37, 38, DRAG_HORN_LIGHT);
  px(ctx, 38, 37, '#ffffff');

  // Monumental Spired Dragon-Wing Throne Backrest (rising to y=10)
  // Center towering obsidian spine
  rect(ctx, 30, 10, 4, 28, OUT);
  rect(ctx, 31, 11, 2, 26, DRAG_OBS_TOP);
  px(ctx, 31, 10, DRAG_PURPLE_LIGHT); // top spike tip

  // Left dragon wing serrated obsidian spikes
  const leftSpikes = [
    [28, 14, 3, 20], [26, 17, 3, 16], [23, 21, 3, 11], [21, 26, 3, 6],
  ] as const;
  for (const [sx, sy, sw, sh] of leftSpikes) {
    rect(ctx, sx, sy, sw, sh, OUT);
    rect(ctx, sx + 1, sy + 1, sw - 1, sh - 1, DRAG_OBS_LEFT);
    px(ctx, sx + 1, sy, DRAG_PURPLE_LIGHT);
  }

  // Right dragon wing serrated obsidian spikes
  const rightSpikes = [
    [33, 14, 3, 20], [35, 17, 3, 16], [38, 21, 3, 11], [40, 26, 3, 6],
  ] as const;
  for (const [sx, sy, sw, sh] of rightSpikes) {
    rect(ctx, sx, sy, sw, sh, OUT);
    rect(ctx, sx, sy + 1, sw - 1, sh - 1, DRAG_OBS_RIGHT);
    px(ctx, sx + 1, sy, DRAG_PURPLE_LIGHT);
  }

  // Molten dragon eye emblem carved into the center of the throne back
  rect(ctx, 30, 22, 4, 4, OUT);
  rect(ctx, 31, 22, 2, 4, DRAG_LAVA_MID);
  px(ctx, 31, 23, DRAG_LAVA_BRIGHT);
  px(ctx, 32, 24, '#ffffff'); // slit pupil

  // 5. Burning Dragon Fire Braziers on Left and Right Dais
  // Left brazier (x=19, y=43)
  rect(ctx, 18, 43, 4, 4, DRAG_OBS_LEFT);
  rect(ctx, 18, 40, 4, 3, DRAG_LAVA_MID);
  px(ctx, 19, 39 + (frame % 2), DRAG_LAVA_BRIGHT);

  // Right brazier (x=43, y=43)
  rect(ctx, 42, 43, 4, 4, DRAG_OBS_RIGHT);
  rect(ctx, 42, 40, 4, 3, DRAG_LAVA_MID);
  px(ctx, 43, 39 + ((frame + 1) % 2), DRAG_LAVA_BRIGHT);

  // 6. Flying Ember Sparks floating upward (3 frames)
  const sparks = [
    [21, 36], [25, 28], [38, 29], [42, 35], [32, 22], [30, 16],
  ] as const;
  for (let s = 0; s < sparks.length; s++) {
    const [sx, sy] = sparks[s]!;
    const py = sy - ((frame + s) % 3) * 3;
    const px0 = sx + ((frame + s * 2) % 3) - 1;
    px(ctx, px0, py, s % 2 === 0 ? DRAG_LAVA_BRIGHT : DRAG_LAVA_MID);
  }

  return canvas;
}

// ============================================================================
// 5. GOBLIN WONDER: SCRAP SPIRE (kind: 'scrapspire', height 2.6, 3 frames)
// A wobbly tower of scrap metal, gears, pipes, a rocket or blimp on top, sparks.
// Palette & motifs: apps/web/lib/arcs/goblin.ts
// ============================================================================

const GOB_MUD_DARK = '#2a2016';
const GOB_MUD_MID = '#3d2f20';
const GOB_WOOD_DARK = '#3b2616';
const GOB_WOOD_MID = '#593a22';
const GOB_RUST_DARK = '#5e2411';
const GOB_RUST_MID = '#8c381b';
const GOB_RUST_LIGHT = '#b84e27';
const GOB_RUST_TOP = '#d4683b';
const GOB_IRON_DARK = '#2c3238';
const GOB_IRON_MID = '#454e57';
const GOB_IRON_LIGHT = '#636f7a';
const GOB_SPARK_YELLOW = '#ffee58';
const GOB_TOXIC_GREEN = '#76ff03';

function buildScrapspireTexture(frame = 0): HTMLCanvasElement {
  const [canvas, ctx] = makeCanvas(SPRITE_W, SPRITE_H);

  // 1. Cluttered junkyard scrap base
  isoDiamond(ctx, 32, 53, 28, GOB_MUD_DARK, OUT);
  isoDiamond(ctx, 32, 53, 24, GOB_MUD_MID, GOB_MUD_DARK);

  // Scattered scrap metal junk, oil barrels, rusted cogwheels
  // Barrel 1 (left)
  rect(ctx, 18, 51, 4, 6, GOB_RUST_MID);
  rect(ctx, 18, 52, 4, 1, GOB_IRON_LIGHT);
  rect(ctx, 18, 55, 4, 1, GOB_IRON_LIGHT);

  // Barrel 2 (right)
  rect(ctx, 43, 52, 4, 6, GOB_IRON_DARK);
  rect(ctx, 43, 53, 4, 1, GOB_RUST_LIGHT);

  // Rusted cogwheels lying on ground
  disc(ctx, 24, 55, 3, GOB_IRON_LIGHT);
  px(ctx, 24, 55, GOB_RUST_DARK);
  disc(ctx, 39, 56, 3, GOB_RUST_MID);
  px(ctx, 39, 56, GOB_IRON_DARK);

  // 2. Wobbly Asymmetrical Scrap Metal Tower
  // Tier 1 (Base hull: fx=32, fy=55, wL=14, wR=13, wallH=14)
  const bFx = 32;
  const bFy = 55;
  const bWL = 14;
  const bWR = 13;
  const bH = 14;

  isoBox(ctx, bFx, bFy, bWL, bWR, bH, {
    top: GOB_RUST_TOP,
    left: GOB_RUST_DARK,
    right: GOB_RUST_MID,
  });

  // Patchwork riveted steel boiler plates bolted on Tier 1
  leftWallRect(ctx, bFx, bFy, 2, 3, 5, 6, GOB_IRON_DARK);
  leftWallRect(ctx, bFx, bFy, 3, 4, 3, 4, GOB_IRON_MID);
  // Rivets
  px(ctx, bFx - 3, bFy - 4, GOB_IRON_LIGHT);
  px(ctx, bFx - 7, bFy - 6, GOB_IRON_LIGHT);

  rightWallRect(ctx, bFx, bFy, 2, 4, 6, 7, GOB_IRON_MID);
  rightWallRect(ctx, bFx, bFy, 3, 5, 4, 5, GOB_RUST_LIGHT);

  // Large turning gear cog mounted on front wall
  disc(ctx, 32, 46, 4, OUT);
  disc(ctx, 32, 46, 3, GOB_IRON_LIGHT);
  px(ctx, 32, 46, GOB_RUST_DARK);
  // Gear teeth
  px(ctx, 32, 42, GOB_IRON_LIGHT);
  px(ctx, 32, 50, GOB_IRON_LIGHT);
  px(ctx, 28, 46, GOB_IRON_LIGHT);
  px(ctx, 36, 46, GOB_IRON_LIGHT);

  // Tier 2 (Slanted crooked middle tower: fx=33, fy=41, wL=10, wR=10, wallH=14)
  const mFx = 33;
  const mFy = 41;
  const mWL = 10;
  const mWR = 10;
  const mH = 14;

  isoBox(ctx, mFx, mFy, mWL, mWR, mH, {
    top: GOB_IRON_LIGHT,
    left: GOB_IRON_DARK,
    right: GOB_IRON_MID,
  });

  // Crooked timber support buttress beams outside tower
  rect(ctx, 21, 38, 2, 14, GOB_WOOD_DARK);
  rect(ctx, 22, 36, 1, 16, GOB_WOOD_MID);
  rect(ctx, 43, 38, 2, 14, GOB_WOOD_DARK);

  // Copper steam pipes running up the shaft
  rect(ctx, 27, 28, 2, 16, '#b87333');
  rect(ctx, 27, 32, 4, 2, '#b87333'); // pipe elbow
  rect(ctx, 37, 26, 2, 14, '#b87333');

  // Tier 3: Launch Cradle & Cantilevered Scaffolding Deck (y=21..27)
  isoBox(ctx, 32, 27, 11, 11, 3, {
    top: GOB_RUST_TOP,
    left: GOB_WOOD_DARK,
    right: GOB_RUST_DARK,
  });

  // 3. Crazy Goblin Space Rocket / Airship perched on top (height 2.6, reaches y=5..21)
  // Rocket launch cradle gantry rails
  rect(ctx, 27, 18, 1, 9, GOB_IRON_LIGHT);
  rect(ctx, 36, 18, 1, 9, GOB_IRON_LIGHT);

  // Rocket Hull (cylindrical fuselage centered at x=32, y=9..21)
  // Tail rocket engine exhaust bell
  rect(ctx, 30, 20, 4, 3, GOB_IRON_DARK);
  // Thruster fire / idle smoke (3 frames)
  if (frame === 0) {
    rect(ctx, 31, 23, 2, 2, GOB_SPARK_YELLOW);
    px(ctx, 31, 25, GOB_TOXIC_GREEN);
  } else if (frame === 1) {
    rect(ctx, 30, 23, 4, 2, '#ff9800');
    px(ctx, 32, 25, GOB_SPARK_YELLOW);
  } else {
    rect(ctx, 31, 23, 2, 3, GOB_TOXIC_GREEN);
    px(ctx, 32, 26, '#ffffff');
  }

  // Rocket fuselage body (x=29..34, y=10..20)
  rect(ctx, 28, 10, 8, 10, OUT);
  rect(ctx, 29, 11, 2, 9, GOB_RUST_DARK);
  rect(ctx, 31, 11, 2, 9, GOB_RUST_LIGHT);
  rect(ctx, 33, 11, 2, 9, GOB_RUST_TOP);

  // Yellow warning hazard stripe across rocket
  rect(ctx, 29, 14, 6, 2, GOB_SPARK_YELLOW);
  px(ctx, 30, 14, '#212121');
  px(ctx, 32, 14, '#212121');
  px(ctx, 34, 14, '#212121');

  // Rocket porthole window
  disc(ctx, 32, 12, 2, OUT);
  px(ctx, 32, 12, GOB_TOXIC_GREEN);

  // Triangular stabilizing tail fins
  rect(ctx, 26, 17, 3, 3, GOB_RUST_DARK);
  rect(ctx, 35, 17, 3, 3, GOB_RUST_LIGHT);

  // Conical nose cone (y=5..10)
  rect(ctx, 30, 7, 4, 3, OUT);
  rect(ctx, 31, 7, 2, 3, GOB_IRON_LIGHT);
  px(ctx, 31, 6, '#ffffff');
  px(ctx, 32, 6, '#ffffff');

  // Lightning rod antenna on nose cone (y=3..5)
  rect(ctx, 31, 3, 1, 3, GOB_IRON_LIGHT);

  // 4. Animated Steam Puffs & Electric Sparks (3 frames)
  // Steam puff venting from left pipe elbow at (27, 30)
  if (frame === 0) {
    disc(ctx, 25, 29, 2, '#cfd8dc');
    px(ctx, 24, 28, '#ffffff');
  } else if (frame === 1) {
    disc(ctx, 23, 27, 3, '#eceff1');
    disc(ctx, 25, 29, 2, '#cfd8dc');
  } else {
    disc(ctx, 22, 24, 3, '#ffffff');
    disc(ctx, 24, 26, 2, '#eceff1');
  }

  // Electric spark snaps jumping off the antenna / wires (3 frames)
  if (frame === 0) {
    px(ctx, 31, 2, GOB_SPARK_YELLOW);
    px(ctx, 30, 1, GOB_TOXIC_GREEN);
  } else if (frame === 1) {
    px(ctx, 32, 2, '#ffffff');
    px(ctx, 33, 1, GOB_SPARK_YELLOW);
    px(ctx, 34, 2, GOB_TOXIC_GREEN);
  } else {
    px(ctx, 31, 1, GOB_TOXIC_GREEN);
    px(ctx, 30, 0, GOB_SPARK_YELLOW);
    px(ctx, 32, 0, '#ffffff');
  }

  return canvas;
}

// ============================================================================
// WONDER ART EXPORT
// ============================================================================

/**
 * Wonder art, one per people (task file .agy/tasks/t27). Drawn in that people's own palette and
 * used as-is (no colour filter). Each entry returns the animation frames (64x64 canvases).
 */
export const wonderArt: Record<ArcId, Partial<Record<BuildingKind, () => HTMLCanvasElement[]>>> = {
  elf: {
    moontree: () => [buildMoontreeTexture(0), buildMoontreeTexture(1), buildMoontreeTexture(2)],
  },
  lizard: {
    suntemple: () => [buildSuntempleTexture(0), buildSuntempleTexture(1), buildSuntempleTexture(2)],
  },
  caveman: {
    stones: () => [buildStonesTexture(0), buildStonesTexture(1), buildStonesTexture(2)],
  },
  dragon: {
    emberthrone: () => [buildEmberthroneTexture(0), buildEmberthroneTexture(1), buildEmberthroneTexture(2)],
  },
  goblin: {
    scrapspire: () => [buildScrapspireTexture(0), buildScrapspireTexture(1), buildScrapspireTexture(2)],
  },
};
