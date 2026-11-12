// Layered pixel portraits: ONE generator draws all 500 portraits from their traits (see packages/sim/src/portrait.ts).
// Output is a small canvas scaled up with `image-rendering: pixelated` by components/Portrait.tsx.
import type { ArcId, PortraitTraits } from '@metropolix/sim';

export const PORTRAIT_W = 48;
export const PORTRAIT_H = 56;

/** Fast 2D canvas factory with pixel smoothing disabled */
function makeCanvas(): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement('canvas');
  c.width = PORTRAIT_W;
  c.height = PORTRAIT_H;
  const g = c.getContext('2d')!;
  g.imageSmoothingEnabled = false;
  return [c, g];
}

/** Set a single pixel */
function px(g: CanvasRenderingContext2D, x: number, y: number, color: string): void {
  if (x < 0 || x >= PORTRAIT_W || y < 0 || y >= PORTRAIT_H) return;
  g.fillStyle = color;
  g.fillRect(x, y, 1, 1);
}

/** Draw a solid rectangle */
function rect(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string): void {
  g.fillStyle = color;
  g.fillRect(x, y, w, h);
}

/** Horizontal line */
function hLine(g: CanvasRenderingContext2D, x1: number, x2: number, y: number, color: string): void {
  const minX = Math.min(x1, x2);
  const w = Math.abs(x2 - x1) + 1;
  rect(g, minX, y, w, 1, color);
}

/** Vertical line */
function vLine(g: CanvasRenderingContext2D, x: number, y1: number, y2: number, color: string): void {
  const minY = Math.min(y1, y2);
  const h = Math.abs(y2 - y1) + 1;
  rect(g, x, minY, 1, h, color);
}

/** Dithered rectangle pattern (checkerboard 50%) */
function ditherRect(
  g: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  col1: string,
  col2: string,
): void {
  rect(g, x, y, w, h, col1);
  g.fillStyle = col2;
  for (let dy = 0; dy < h; dy++) {
    for (let dx = 0; dx < w; dx++) {
      if ((x + dx + y + dy) % 2 === 0) {
        g.fillRect(x + dx, y + dy, 1, 1);
      }
    }
  }
}

/* =====================================================================
   LAYER 1: BACKDROPS (8 per people)
   ===================================================================== */

function drawBackdrop(g: CanvasRenderingContext2D, arc: ArcId, bgIdx: number): void {
  const bg = bgIdx % 8;
  switch (arc) {
    case 'elf':
      drawElfBackdrop(g, bg);
      break;
    case 'lizard':
      drawLizardBackdrop(g, bg);
      break;
    case 'caveman':
      drawCavemanBackdrop(g, bg);
      break;
    case 'dragon':
      drawDragonBackdrop(g, bg);
      break;
    case 'goblin':
      drawGoblinBackdrop(g, bg);
      break;
  }
}

function drawElfBackdrop(g: CanvasRenderingContext2D, bg: number): void {
  switch (bg) {
    case 0: // Deep emerald night canopy
      rect(g, 2, 2, 44, 20, '#0a1f14');
      rect(g, 2, 22, 44, 18, '#12361f');
      rect(g, 2, 40, 44, 14, '#1e5242');
      ditherRect(g, 2, 18, 44, 6, '#0a1f14', '#12361f');
      ditherRect(g, 2, 36, 44, 6, '#12361f', '#1e5242');
      break;
    case 1: // Twilight boughs with firefly dots
      rect(g, 2, 2, 44, 26, '#0c2618');
      rect(g, 2, 28, 44, 26, '#174026');
      px(g, 8, 10, '#c9ff8a');
      px(g, 38, 14, '#c9ff8a');
      px(g, 14, 24, '#7ed992');
      px(g, 32, 28, '#7ed992');
      break;
    case 2: // Silver moon glade
      rect(g, 2, 2, 44, 30, '#10232e');
      rect(g, 2, 32, 44, 22, '#1a3647');
      // Moon
      rect(g, 33, 8, 7, 7, '#e4eff5');
      px(g, 32, 9, '#e4eff5');
      px(g, 40, 9, '#e4eff5');
      px(g, 32, 13, '#e4eff5');
      px(g, 40, 13, '#e4eff5');
      px(g, 34, 10, '#c8d9e3');
      break;
    case 3: // Autumn golden woodland
      rect(g, 2, 2, 44, 20, '#241a0f');
      rect(g, 2, 22, 44, 18, '#473117');
      rect(g, 2, 40, 44, 14, '#6b4c22');
      ditherRect(g, 2, 19, 44, 5, '#241a0f', '#473117');
      px(g, 10, 12, '#f5d76e');
      px(g, 36, 16, '#c79f32');
      break;
    case 4: // Mist over ancient pines
      rect(g, 2, 2, 44, 18, '#0d2119');
      rect(g, 2, 20, 44, 16, '#1a3b2e');
      rect(g, 2, 36, 44, 18, '#2d5e49');
      ditherRect(g, 2, 32, 44, 8, '#1a3b2e', '#3a785d');
      break;
    case 5: // Ivory column silhouette glade
      rect(g, 2, 2, 44, 52, '#14382d');
      rect(g, 6, 8, 4, 46, '#dbd5c7');
      vLine(g, 5, 10, 52, '#3b2316');
      rect(g, 38, 8, 4, 46, '#dbd5c7');
      vLine(g, 42, 10, 52, '#3b2316');
      break;
    case 6: // Celestial starry grove
      rect(g, 2, 2, 44, 32, '#091624');
      rect(g, 2, 34, 44, 20, '#132c3f');
      px(g, 12, 6, '#e0fbff');
      px(g, 24, 4, '#e0fbff');
      px(g, 36, 8, '#7ce0f7');
      px(g, 7, 18, '#7ce0f7');
      px(g, 41, 20, '#e0fbff');
      break;
    case 7: // Sunlit emerald canopy
    default:
      rect(g, 2, 2, 44, 16, '#18472a');
      rect(g, 2, 18, 44, 20, '#26693d');
      rect(g, 2, 38, 44, 16, '#3c8f55');
      ditherRect(g, 2, 15, 44, 6, '#18472a', '#26693d');
      break;
  }
}

function drawLizardBackdrop(g: CanvasRenderingContext2D, bg: number): void {
  switch (bg) {
    case 0: // Swamp sunset amber & rust
      rect(g, 2, 2, 44, 18, '#f2a65a');
      rect(g, 2, 20, 44, 18, '#d9743a');
      rect(g, 2, 38, 44, 16, '#5b2a1e');
      ditherRect(g, 2, 16, 44, 6, '#f2a65a', '#d9743a');
      ditherRect(g, 2, 34, 44, 6, '#d9743a', '#5b2a1e');
      break;
    case 1: // Murky mangrove marsh
      rect(g, 2, 2, 44, 24, '#1b3833');
      rect(g, 2, 26, 44, 28, '#13494d');
      // Reed stalks
      vLine(g, 8, 20, 52, '#6c9a3a');
      vLine(g, 10, 26, 52, '#4a6e26');
      vLine(g, 38, 18, 52, '#6c9a3a');
      vLine(g, 40, 24, 52, '#4a6e26');
      break;
    case 2: // Ochre mudflats
      rect(g, 2, 2, 44, 20, '#54412e');
      rect(g, 2, 22, 44, 16, '#7d5628');
      rect(g, 2, 38, 44, 16, '#ad7b3b');
      ditherRect(g, 2, 19, 44, 5, '#54412e', '#7d5628');
      break;
    case 3: // Deep jungle heat & sun
      rect(g, 2, 2, 44, 52, '#1a3628');
      rect(g, 18, 6, 12, 12, '#ffd059');
      rect(g, 20, 8, 8, 8, '#ffea88');
      break;
    case 4: // Toxic steam swamp
      rect(g, 2, 2, 44, 26, '#182e28');
      rect(g, 2, 28, 44, 26, '#284d3b');
      ditherRect(g, 2, 22, 44, 10, '#182e28', '#76ff9b');
      break;
    case 5: // Ancient stone ziggurat
      rect(g, 2, 2, 44, 24, '#3b2f28');
      rect(g, 2, 26, 44, 28, '#241d18');
      // Terraced steps
      hLine(g, 6, 42, 22, '#bfb59f');
      hLine(g, 10, 38, 16, '#bfb59f');
      hLine(g, 16, 32, 10, '#bfb59f');
      break;
    case 6: // Reed bed night
      rect(g, 2, 2, 44, 30, '#152424');
      rect(g, 2, 32, 44, 22, '#203d36');
      px(g, 12, 14, '#62d8de');
      px(g, 36, 18, '#62d8de');
      break;
    case 7: // Terracotta canyon
    default:
      rect(g, 2, 2, 44, 18, '#6e331e');
      rect(g, 2, 20, 44, 18, '#9c4b2e');
      rect(g, 2, 38, 44, 16, '#c96844');
      ditherRect(g, 2, 17, 44, 5, '#6e331e', '#9c4b2e');
      break;
  }
}

function drawCavemanBackdrop(g: CanvasRenderingContext2D, bg: number): void {
  switch (bg) {
    case 0: // Campfire cavern
      rect(g, 2, 2, 44, 22, '#1f1410');
      rect(g, 2, 24, 44, 18, '#7a4a2a');
      rect(g, 2, 42, 44, 12, '#f08a2f');
      ditherRect(g, 2, 36, 44, 8, '#7a4a2a', '#f08a2f');
      break;
    case 1: // Prehistoric mammoth steppe
      rect(g, 2, 2, 44, 22, '#4d3a26');
      rect(g, 2, 24, 44, 16, '#6b5339');
      rect(g, 2, 40, 44, 14, '#917453');
      ditherRect(g, 2, 20, 44, 6, '#4d3a26', '#6b5339');
      break;
    case 2: // Cave wall with ochre paintings
      rect(g, 2, 2, 44, 52, '#382a20');
      // Ochre beast painting silhouette
      hLine(g, 8, 14, 12, '#b83b24');
      hLine(g, 9, 17, 13, '#b83b24');
      px(g, 10, 14, '#b83b24');
      px(g, 14, 14, '#b83b24');
      // Stick figure hunter
      px(g, 36, 12, '#b83b24');
      vLine(g, 36, 13, 16, '#b83b24');
      hLine(g, 34, 38, 14, '#b83b24');
      px(g, 35, 17, '#b83b24');
      px(g, 37, 17, '#b83b24');
      break;
    case 3: // Starry prehistoric night
      rect(g, 2, 2, 44, 30, '#11151f');
      rect(g, 2, 32, 44, 22, '#212a3d');
      px(g, 10, 8, '#f5efe2');
      px(g, 20, 6, '#f5efe2');
      px(g, 34, 10, '#f5efe2');
      px(g, 40, 16, '#f5efe2');
      px(g, 8, 22, '#f5efe2');
      break;
    case 4: // Smouldering embers cave
      rect(g, 2, 2, 44, 28, '#1a0d0a');
      rect(g, 2, 30, 44, 24, '#421a12');
      px(g, 12, 22, '#ff9800');
      px(g, 18, 26, '#fff176');
      px(g, 32, 20, '#ff9800');
      px(g, 38, 24, '#e65100');
      break;
    case 5: // Sun-baked canyon pass
      rect(g, 2, 2, 44, 18, '#593822');
      rect(g, 2, 20, 44, 18, '#875635');
      rect(g, 2, 38, 44, 16, '#b57435');
      ditherRect(g, 2, 17, 44, 5, '#593822', '#875635');
      break;
    case 6: // Deep crystal cavern
      rect(g, 2, 2, 44, 52, '#211826');
      px(g, 8, 12, '#a78bfa');
      px(g, 14, 8, '#c4b5fd');
      px(g, 34, 14, '#c4b5fd');
      px(g, 40, 10, '#a78bfa');
      break;
    case 7: // Dawn over prehistoric forest
    default:
      rect(g, 2, 2, 44, 16, '#332115');
      rect(g, 2, 18, 44, 18, '#694124');
      rect(g, 2, 36, 44, 18, '#a66a3d');
      ditherRect(g, 2, 16, 44, 5, '#332115', '#694124');
      break;
  }
}

function drawDragonBackdrop(g: CanvasRenderingContext2D, bg: number): void {
  switch (bg) {
    case 0: // Volcanic magma crater
      rect(g, 2, 2, 44, 20, '#14060a');
      rect(g, 2, 22, 44, 18, '#9c1d1d');
      rect(g, 2, 40, 44, 14, '#ff7a2f');
      ditherRect(g, 2, 18, 44, 6, '#14060a', '#9c1d1d');
      ditherRect(g, 2, 36, 44, 6, '#9c1d1d', '#ff7a2f');
      break;
    case 1: // Obsidian peak under ash sky
      rect(g, 2, 2, 44, 24, '#1a141e');
      rect(g, 2, 26, 44, 28, '#262030');
      // Obsidian spires
      vLine(g, 8, 16, 52, '#3a3247');
      vLine(g, 40, 14, 52, '#3a3247');
      break;
    case 2: // Molten lava river
      rect(g, 2, 2, 44, 30, '#1f0d11');
      rect(g, 2, 32, 44, 22, '#591f1f');
      // Lava fissures
      hLine(g, 6, 18, 38, '#ff6d00');
      hLine(g, 26, 42, 42, '#fff176');
      px(g, 12, 37, '#fff176');
      break;
    case 3: // Dragon hoard gold shimmer
      rect(g, 2, 2, 44, 28, '#1e140d');
      rect(g, 2, 30, 44, 24, '#3d2b15');
      px(g, 8, 36, '#ffe57f');
      px(g, 12, 42, '#ffc107');
      px(g, 36, 38, '#ffe57f');
      px(g, 40, 44, '#ffc107');
      break;
    case 4: // Brimstone smoke & floating embers
      rect(g, 2, 2, 44, 52, '#21161d');
      ditherRect(g, 2, 30, 44, 24, '#21161d', '#4a2c59');
      px(g, 10, 14, '#ffb74d');
      px(g, 22, 10, '#ff9800');
      px(g, 36, 16, '#ffb74d');
      px(g, 16, 26, '#ffd54f');
      break;
    case 5: // Blood moon crimson sky
      rect(g, 2, 2, 44, 30, '#260a0f');
      rect(g, 2, 32, 44, 22, '#54151f');
      // Red moon
      rect(g, 32, 8, 8, 8, '#d50000');
      px(g, 31, 10, '#d50000');
      px(g, 40, 10, '#d50000');
      px(g, 34, 11, '#ff6d00');
      break;
    case 6: // Basalt fortress spire
      rect(g, 2, 2, 44, 52, '#181420');
      rect(g, 6, 12, 5, 42, '#342d38');
      rect(g, 37, 10, 5, 44, '#342d38');
      break;
    case 7: // Blazing inferno horizon
    default:
      rect(g, 2, 2, 44, 16, '#2e0a0a');
      rect(g, 2, 18, 44, 18, '#821a1a');
      rect(g, 2, 36, 44, 18, '#d9431a');
      ditherRect(g, 2, 16, 44, 6, '#2e0a0a', '#821a1a');
      break;
  }
}

function drawGoblinBackdrop(g: CanvasRenderingContext2D, bg: number): void {
  switch (bg) {
    case 0: // Scrapyard junk heap
      rect(g, 2, 2, 44, 24, '#1b2416');
      rect(g, 2, 26, 44, 28, '#2c2a22');
      // Rusty cog shapes
      rect(g, 6, 32, 4, 4, '#8a4a24');
      rect(g, 38, 30, 4, 4, '#5e2411');
      px(g, 8, 34, '#241a10');
      break;
    case 1: // Toxic alchemical bog
      rect(g, 2, 2, 44, 26, '#152112');
      rect(g, 2, 28, 44, 26, '#253b1e');
      ditherRect(g, 2, 36, 44, 18, '#253b1e', '#80d926');
      break;
    case 2: // Subterranean burrow
      rect(g, 2, 2, 44, 20, '#211a14');
      rect(g, 2, 22, 44, 18, '#3b2f23');
      rect(g, 2, 40, 44, 14, '#594432');
      ditherRect(g, 2, 19, 44, 5, '#211a14', '#3b2f23');
      break;
    case 3: // Glowing mushroom warren
      rect(g, 2, 2, 44, 52, '#192416');
      px(g, 8, 34, '#c8ff5a');
      px(g, 9, 33, '#c8ff5a');
      px(g, 38, 32, '#c8ff5a');
      px(g, 37, 33, '#c8ff5a');
      break;
    case 4: // Rust & iron foundry
      rect(g, 2, 2, 44, 26, '#202429');
      rect(g, 2, 28, 44, 26, '#402a20');
      px(g, 10, 20, '#ff9800');
      px(g, 36, 18, '#ff9800');
      break;
    case 5: // Night robbery rooftop
      rect(g, 2, 2, 44, 30, '#101721');
      rect(g, 2, 32, 44, 22, '#1c2838');
      // Chimney
      rect(g, 8, 22, 5, 20, '#2c3238');
      break;
    case 6: // Stolen brass hoard
      rect(g, 2, 2, 44, 30, '#1c1b14');
      rect(g, 2, 32, 44, 22, '#383321');
      px(g, 8, 40, '#ffd54f');
      px(g, 14, 44, '#ffca28');
      px(g, 36, 38, '#ffd54f');
      break;
    case 7: // Slime sewer cavern
    default:
      rect(g, 2, 2, 44, 22, '#141e12');
      rect(g, 2, 24, 44, 16, '#24361e');
      rect(g, 2, 40, 44, 14, '#38522c');
      ditherRect(g, 2, 21, 44, 5, '#141e12', '#24361e');
      break;
  }
}

/* =====================================================================
   LAYER 2: AURA (Super Legendary / Mythic only, 3 frames)
   ===================================================================== */

function drawAura(g: CanvasRenderingContext2D, frameIdx: number): void {
  // Center of head is around (24, 26)
  const cx = 24;
  const cy = 25;
  const goldCore = '#ffd700';
  const goldGlow = '#fff3a8';
  const goldOuter = '#b26a00';

  if (frameIdx === 0) {
    // Pulse 0: Halo disc ring at radius 14
    for (let dy = -15; dy <= 15; dy++) {
      for (let dx = -15; dx <= 15; dx++) {
        const d2 = dx * dx + dy * dy;
        if (d2 >= 135 && d2 <= 175) {
          px(g, cx + dx, cy + dy, (dx + dy) % 2 === 0 ? goldCore : goldGlow);
        }
      }
    }
    // 4 cardinal sparkles
    px(g, cx, cy - 17, '#ffffff');
    px(g, cx, cy + 17, '#ffffff');
    px(g, cx - 17, cy, '#ffffff');
    px(g, cx + 17, cy, '#ffffff');
  } else if (frameIdx === 1) {
    // Pulse 1: Expanded halo ring at radius 15
    for (let dy = -16; dy <= 16; dy++) {
      for (let dx = -16; dx <= 16; dx++) {
        const d2 = dx * dx + dy * dy;
        if (d2 >= 155 && d2 <= 200) {
          px(g, cx + dx, cy + dy, (dx + dy) % 2 === 0 ? goldGlow : goldOuter);
        }
      }
    }
    // 4 diagonal sparkles
    px(g, cx - 13, cy - 13, '#ffffff');
    px(g, cx + 13, cy - 13, '#ffffff');
    px(g, cx - 13, cy + 13, '#ffffff');
    px(g, cx + 13, cy + 13, '#ffffff');
  } else {
    // Pulse 2: Compact crisp radiant ring + 8 perimeter particles
    for (let dy = -14; dy <= 14; dy++) {
      for (let dx = -14; dx <= 14; dx++) {
        const d2 = dx * dx + dy * dy;
        if (d2 >= 120 && d2 <= 155) {
          px(g, cx + dx, cy + dy, goldCore);
        }
      }
    }
    // 8 points
    px(g, cx, cy - 18, '#ffffff');
    px(g, cx, cy + 18, '#ffffff');
    px(g, cx - 18, cy, '#ffffff');
    px(g, cx + 18, cy, '#ffffff');
    px(g, cx - 12, cy - 12, goldGlow);
    px(g, cx + 12, cy - 12, goldGlow);
    px(g, cx - 12, cy + 12, goldGlow);
    px(g, cx + 12, cy + 12, goldGlow);
  }
}

/* =====================================================================
   LAYER 9: FRAME BY TIER (0..5, 2px border, animated sparkles)
   ===================================================================== */

function drawFrame(g: CanvasRenderingContext2D, tierFrame: number, frameIdx: number): void {
  // 2px border: x=0,1 and x=46,47; y=0,1 and y=54,55
  switch (tierFrame) {
    case 0: // Common: Plain wood
      rect(g, 0, 0, PORTRAIT_W, 2, '#6b4a2a');
      rect(g, 0, PORTRAIT_H - 2, PORTRAIT_W, 2, '#3a2412');
      rect(g, 0, 0, 2, PORTRAIT_H, '#6b4a2a');
      rect(g, PORTRAIT_W - 2, 0, 2, PORTRAIT_H, '#3a2412');
      // Corner highlights
      px(g, 0, 0, '#8f683e');
      px(g, PORTRAIT_W - 1, 0, '#4f321a');
      px(g, 0, PORTRAIT_H - 1, '#4f321a');
      px(g, PORTRAIT_W - 1, PORTRAIT_H - 1, '#241408');
      break;

    case 1: // Uncommon: Iron
      rect(g, 0, 0, PORTRAIT_W, 2, '#636f7a');
      rect(g, 0, PORTRAIT_H - 2, PORTRAIT_W, 2, '#2d3338');
      rect(g, 0, 0, 2, PORTRAIT_H, '#636f7a');
      rect(g, PORTRAIT_W - 2, 0, 2, PORTRAIT_H, '#2d3338');
      // Iron rivets in 4 corners
      px(g, 1, 1, '#9ba6b2');
      px(g, PORTRAIT_W - 2, 1, '#9ba6b2');
      px(g, 1, PORTRAIT_H - 2, '#485159');
      px(g, PORTRAIT_W - 2, PORTRAIT_H - 2, '#485159');
      break;

    case 2: // Rare: Silver with rare blue tint (#4fa3e0 corners)
      rect(g, 0, 0, PORTRAIT_W, 2, '#d8e2ec');
      rect(g, 0, PORTRAIT_H - 2, PORTRAIT_W, 2, '#7e8e9c');
      rect(g, 0, 0, 2, PORTRAIT_H, '#d8e2ec');
      rect(g, PORTRAIT_W - 2, 0, 2, PORTRAIT_H, '#7e8e9c');
      // Blue tint corners (#4fa3e0)
      rect(g, 0, 0, 2, 2, '#4fa3e0');
      rect(g, PORTRAIT_W - 2, 0, 2, 2, '#4fa3e0');
      rect(g, 0, PORTRAIT_H - 2, 2, 2, '#4fa3e0');
      rect(g, PORTRAIT_W - 2, PORTRAIT_H - 2, 2, 2, '#4fa3e0');
      px(g, 0, 0, '#a5dbff');
      break;

    case 3: // Epic: Violet (#b07cf0)
      rect(g, 0, 0, PORTRAIT_W, 2, '#d4aeff');
      rect(g, 0, PORTRAIT_H - 2, PORTRAIT_W, 2, '#5e3894');
      rect(g, 0, 0, 2, PORTRAIT_H, '#b07cf0');
      rect(g, PORTRAIT_W - 2, 0, 2, PORTRAIT_H, '#7c4ebf');
      // Inner border accent
      rect(g, 0, 0, 2, 2, '#f3e8ff');
      rect(g, PORTRAIT_W - 2, 0, 2, 2, '#b07cf0');
      rect(g, 0, PORTRAIT_H - 2, 2, 2, '#b07cf0');
      rect(g, PORTRAIT_W - 2, PORTRAIT_H - 2, 2, 2, '#492b75');
      break;

    case 4: { // Legendary: Gold (#f2a33a) with corner gems & moving sparkle
      rect(g, 0, 0, PORTRAIT_W, 2, '#ffd56b');
      rect(g, 0, PORTRAIT_H - 2, PORTRAIT_W, 2, '#9e6414');
      rect(g, 0, 0, 2, PORTRAIT_H, '#f2a33a');
      rect(g, PORTRAIT_W - 2, 0, 2, PORTRAIT_H, '#b87518');
      // Corner ruby gems
      rect(g, 0, 0, 2, 2, '#e62e4c');
      rect(g, PORTRAIT_W - 2, 0, 2, 2, '#e62e4c');
      rect(g, 0, PORTRAIT_H - 2, 2, 2, '#e62e4c');
      rect(g, PORTRAIT_W - 2, PORTRAIT_H - 2, 2, 2, '#e62e4c');
      px(g, 0, 0, '#ff99aa');
      // Moving sparkle pixel
      const sparklePos: [number, number] = [
        [3, 1] as [number, number],
        [PORTRAIT_W - 4, 1] as [number, number],
        [PORTRAIT_W - 2, PORTRAIT_H - 4] as [number, number],
      ][frameIdx % 3]!;
      px(g, sparklePos[0], sparklePos[1], '#ffffff');
      break;
    }

    case 5: // Super Legendary / Mythic: Prismatic (#ff5c8a + rainbow corners + moving sparkle)
    default: {
      rect(g, 0, 0, PORTRAIT_W, 2, '#ff80a8');
      rect(g, 0, PORTRAIT_H - 2, PORTRAIT_W, 2, '#b82a55');
      rect(g, 0, 0, 2, PORTRAIT_H, '#ff5c8a');
      rect(g, PORTRAIT_W - 2, 0, 2, PORTRAIT_H, '#cc3d6e');
      // Rainbow corners: cyan, lime, yellow, purple
      rect(g, 0, 0, 2, 2, '#5ce6ff'); // Top-left cyan
      rect(g, PORTRAIT_W - 2, 0, 2, 2, '#5cff8a'); // Top-right lime
      rect(g, 0, PORTRAIT_H - 2, 2, 2, '#ffdb5c'); // Bottom-left gold/yellow
      rect(g, PORTRAIT_W - 2, PORTRAIT_H - 2, 2, 2, '#c05cff'); // Bottom-right violet
      // Moving sparkle
      const prismSparkle: [number, number] = [
        [1, 3] as [number, number],
        [PORTRAIT_W - 2, 3] as [number, number],
        [PORTRAIT_W - 4, PORTRAIT_H - 2] as [number, number],
      ][frameIdx % 3]!;
      px(g, prismSparkle[0], prismSparkle[1], '#ffffff');
      break;
    }
  }
}

/* =====================================================================
   PEOPLE: ELF
   ===================================================================== */

function drawElf(g: CanvasRenderingContext2D, t: PortraitTraits, frameIdx: number): void {
  const skinPals = [
    { base: '#f8dcc0', shadow: '#e1a98a', light: '#fff4eb', out: '#593724' },
    { base: '#f1cfae', shadow: '#c9906e', light: '#fceddd', out: '#593724' },
    { base: '#d8b693', shadow: '#b57c52', light: '#e8caa8', out: '#422818' },
    { base: '#bfa085', shadow: '#946e52', light: '#d1b399', out: '#361e12' },
  ];
  const sk = skinPals[t.skin % 4]!;

  const hairPals = [
    { base: '#f4efe0', shadow: '#b9c2cf', light: '#ffffff', out: '#6f7a89' }, // Silver
    { base: '#f5d76e', shadow: '#c79f32', light: '#fff2a8', out: '#8f6f1d' }, // Gold
    { base: '#489c5c', shadow: '#2e6f40', light: '#7ed992', out: '#1e4d2b' }, // Moss
  ];
  const hp = hairPals[t.id % 3]!;

  // 1. Hair back (if long hair styles)
  const isBackHair = t.hair === 0 || t.hair === 4 || t.hair === 5 || t.hair === 7;
  if (isBackHair && t.headwear !== 2) {
    // Back hair flowing behind shoulders
    rect(g, 15, 22, 18, 26, hp.base);
    rect(g, 13, 28, 22, 20, hp.base);
    // Highlights & shadow
    vLine(g, 14, 28, 46, hp.light);
    vLine(g, 33, 28, 46, hp.shadow);
    vLine(g, 12, 30, 46, hp.out);
    vLine(g, 35, 30, 46, hp.out);
  }

  // 2. Shoulders & Cloak (y=38..53)
  const cloakBase = '#245f36';
  const cloakShadow = '#12361f';
  const cloakLight = '#3c8a52';
  const cloakOut = '#0e2d19';

  // Base mantle
  rect(g, 18, 38, 12, 3, cloakBase);
  rect(g, 14, 41, 20, 3, cloakBase);
  rect(g, 10, 44, 28, 3, cloakBase);
  rect(g, 6, 47, 36, 3, cloakBase);
  rect(g, 3, 50, 42, 4, cloakBase);

  // Top-left lighting & shadows
  vLine(g, 4, 50, 53, cloakLight);
  vLine(g, 7, 47, 49, cloakLight);
  vLine(g, 11, 44, 46, cloakLight);
  vLine(g, 43, 50, 53, cloakShadow);
  vLine(g, 40, 47, 49, cloakShadow);
  vLine(g, 36, 44, 46, cloakShadow);

  // Cloak 1px dark outline
  hLine(g, 18, 29, 37, cloakOut);
  vLine(g, 17, 38, 40, cloakOut);
  vLine(g, 30, 38, 40, cloakOut);
  vLine(g, 13, 41, 43, cloakOut);
  vLine(g, 34, 41, 43, cloakOut);
  vLine(g, 9, 44, 46, cloakOut);
  vLine(g, 38, 44, 46, cloakOut);
  vLine(g, 5, 47, 49, cloakOut);
  vLine(g, 42, 47, 49, cloakOut);
  vLine(g, 2, 50, 53, cloakOut);
  vLine(g, 45, 50, 53, cloakOut);

  // Inner ivory tunic collar
  rect(g, 22, 38, 4, 5, '#ecdcae');
  rect(g, 23, 43, 2, 3, '#ecdcae');
  px(g, 22, 43, '#9b6b4a');
  px(g, 25, 43, '#9b6b4a');

  // Gold leaf brooch/clasp
  rect(g, 23, 39, 2, 3, '#ffd96b');
  px(g, 23, 38, '#7a5a12');
  px(g, 24, 42, '#7a5a12');

  // 3. Neck
  rect(g, 22, 34, 4, 4, sk.base);
  vLine(g, 25, 34, 37, sk.shadow);
  vLine(g, 21, 34, 37, sk.out);
  vLine(g, 26, 34, 37, sk.out);

  // 4. Pointed Elven Ears (distinct silhouette!)
  // Left ear: points to (10, 18)
  for (let i = 0; i < 7; i++) {
    const ex = 16 - i;
    const ey = 25 - i;
    px(g, ex, ey, sk.base);
    px(g, ex + 1, ey, sk.shadow);
    px(g, ex, ey + 1, sk.out);
    px(g, ex - 1, ey, sk.out);
  }
  px(g, 10, 18, sk.light); // ear tip

  // Right ear: points to (37, 18)
  for (let i = 0; i < 7; i++) {
    const ex = 31 + i;
    const ey = 25 - i;
    px(g, ex, ey, sk.base);
    px(g, ex - 1, ey, sk.shadow);
    px(g, ex, ey + 1, sk.out);
    px(g, ex + 1, ey, sk.out);
  }
  px(g, 37, 18, sk.light); // ear tip

  // 5. Head Shape
  rect(g, 19, 17, 10, 2, sk.base);
  rect(g, 18, 19, 12, 3, sk.base);
  rect(g, 17, 22, 14, 8, sk.base);
  rect(g, 18, 30, 12, 3, sk.base);
  rect(g, 20, 33, 8, 2, sk.base);
  rect(g, 22, 35, 4, 1, sk.base); // chin

  // Shading & highlights (top-left)
  vLine(g, 17, 22, 29, sk.light);
  hLine(g, 19, 23, 17, sk.light);
  vLine(g, 30, 22, 29, sk.shadow);
  rect(g, 27, 30, 3, 2, sk.shadow);

  // Head 1px dark outline
  hLine(g, 20, 27, 16, sk.out);
  px(g, 19, 17, sk.out);
  px(g, 28, 17, sk.out);
  vLine(g, 17, 19, 21, sk.out);
  vLine(g, 30, 19, 21, sk.out);
  vLine(g, 16, 22, 29, sk.out);
  vLine(g, 31, 22, 29, sk.out);
  vLine(g, 17, 30, 32, sk.out);
  vLine(g, 30, 30, 32, sk.out);
  px(g, 18, 33, sk.out);
  px(g, 29, 33, sk.out);
  px(g, 19, 34, sk.out);
  px(g, 28, 34, sk.out);
  hLine(g, 21, 26, 36, sk.out);

  // Nose
  vLine(g, 23, 27, 29, sk.shadow);
  px(g, 24, 29, sk.shadow);

  // Mouth
  hLine(g, 22, 25, 32, '#b5604f');

  // 6. Eyes (6 shapes) & Glow
  const eyeY = 24;
  const leftX = 19;
  const rightX = 26;
  const eyeCol = ['#2ea64a', '#3cb85c', '#1f7035', '#248744', '#155426', '#43c767'][t.eyes % 6]!;

  // Eyebrows
  hLine(g, leftX - 1, leftX + 2, eyeY - 2, hp.out);
  hLine(g, rightX, rightX + 3, eyeY - 2, hp.out);

  // Eye whites and iris
  rect(g, leftX, eyeY, 3, 2, '#ffffff');
  rect(g, rightX, eyeY, 3, 2, '#ffffff');
  px(g, leftX + 1, eyeY, eyeCol);
  px(g, rightX + 1, eyeY, eyeCol);
  px(g, leftX + 1, eyeY + 1, '#12301a'); // pupil
  px(g, rightX + 1, eyeY + 1, '#12301a');

  // GlowEyes (animated shifted glow)
  if (t.glowEyes) {
    const glowBright = frameIdx === 0 ? '#c9ff8a' : '#eaffd0';
    const glowDim = frameIdx === 0 ? '#7ed992' : '#9cf2aa';

    // Iris glow
    px(g, leftX + 1, eyeY, glowBright);
    px(g, rightX + 1, eyeY, glowBright);

    // 1px aura glow pixels
    const offset = frameIdx === 1 ? 1 : 0;
    px(g, leftX - 1, eyeY, glowDim);
    px(g, leftX + 3, eyeY, glowDim);
    px(g, leftX + 1, eyeY - 1 - offset, glowBright);
    px(g, leftX + 1, eyeY + 2 + offset, glowDim);

    px(g, rightX - 1, eyeY, glowDim);
    px(g, rightX + 3, eyeY, glowDim);
    px(g, rightX + 1, eyeY - 1 - offset, glowBright);
    px(g, rightX + 1, eyeY + 2 + offset, glowDim);
  }

  // 7. Hair Styles (0..7)
  // If wearing a full hood (headwear === 2), hide upper hair
  if (t.headwear !== 2) {
    drawElfHair(g, t.hair % 8, hp);
  }

  // 8. Headwear (0..7)
  drawElfHeadwear(g, t.headwear % 8, hp);

  // 9. Accessories (0..5)
  drawElfAccessory(g, t.accessory % 6);
}

function drawElfHair(
  g: CanvasRenderingContext2D,
  hairIdx: number,
  hp: { base: string; shadow: string; light: string; out: string },
): void {
  // Forehead fringe/bangs
  hLine(g, 19, 28, 17, hp.base);
  hLine(g, 18, 29, 18, hp.base);
  px(g, 21, 19, hp.base);
  px(g, 26, 19, hp.base);

  switch (hairIdx) {
    case 0: // Long straight hair
      vLine(g, 15, 20, 42, hp.base);
      vLine(g, 16, 20, 42, hp.light);
      vLine(g, 31, 20, 42, hp.base);
      vLine(g, 32, 20, 42, hp.shadow);
      break;
    case 1: // High ponytail
      rect(g, 22, 13, 5, 4, hp.base);
      px(g, 24, 12, hp.light);
      // Sweeping tail to the right
      rect(g, 27, 14, 5, 3, hp.base);
      rect(g, 31, 17, 3, 8, hp.base);
      rect(g, 33, 24, 2, 10, hp.shadow);
      break;
    case 2: // Side braid on left
      for (let y = 22; y <= 44; y += 3) {
        rect(g, 14, y, 3, 2, hp.base);
        px(g, 15, y, hp.light);
        px(g, 15, y + 2, '#ffd96b'); // gold hair tie
      }
      break;
    case 3: // Short sleek bob
      rect(g, 16, 19, 2, 12, hp.base);
      rect(g, 30, 19, 2, 12, hp.base);
      px(g, 17, 31, hp.out);
      px(g, 30, 31, hp.out);
      break;
    case 4: // Wavy locks
      for (let y = 20; y <= 42; y += 4) {
        rect(g, 14, y, 3, 2, hp.base);
        rect(g, 13, y + 2, 3, 2, hp.shadow);
        rect(g, 31, y, 3, 2, hp.base);
        rect(g, 32, y + 2, 3, 2, hp.shadow);
      }
      break;
    case 5: // Twin braids
      vLine(g, 15, 20, 40, hp.base);
      vLine(g, 32, 20, 40, hp.base);
      px(g, 15, 30, '#dbd5c7'); // silver tie
      px(g, 15, 38, '#dbd5c7');
      px(g, 32, 30, '#dbd5c7');
      px(g, 32, 38, '#dbd5c7');
      break;
    case 6: // Windblown woodland locks
      hLine(g, 14, 20, 16, hp.base);
      hLine(g, 12, 18, 15, hp.light);
      hLine(g, 28, 34, 16, hp.base);
      hLine(g, 30, 36, 17, hp.shadow);
      px(g, 11, 14, hp.out);
      px(g, 37, 18, hp.out);
      break;
    case 7: // Royal mantle hair
    default:
      rect(g, 18, 14, 12, 4, hp.base);
      hLine(g, 19, 28, 13, hp.light);
      rect(g, 14, 18, 3, 22, hp.base);
      rect(g, 31, 18, 3, 22, hp.base);
      break;
  }
}

function drawElfHeadwear(
  g: CanvasRenderingContext2D,
  headwearIdx: number,
  hp: { base: string; shadow: string; light: string; out: string },
): void {
  switch (headwearIdx) {
    case 0: // None
      break;
    case 1: // Leaf wreath / laurel
      hLine(g, 18, 29, 18, '#489c5c');
      px(g, 19, 17, '#7ed992');
      px(g, 23, 17, '#ffd96b'); // gold berry
      px(g, 25, 17, '#ffd96b');
      px(g, 28, 17, '#7ed992');
      break;
    case 2: // Ranger green hood
      rect(g, 16, 12, 16, 6, '#1e5242');
      rect(g, 14, 16, 4, 16, '#1e5242');
      rect(g, 30, 16, 4, 16, '#14382d');
      // Hood peak
      px(g, 24, 11, '#2c735c');
      hLine(g, 17, 30, 12, '#2c735c');
      hLine(g, 16, 31, 18, '#0e2d19');
      break;
    case 3: // Archer cap with silver feather
      rect(g, 18, 14, 12, 4, '#2e6f40');
      hLine(g, 17, 30, 18, '#1e4d2b');
      // Falcon feather pointing back
      vLine(g, 29, 9, 14, '#dbd5c7');
      px(g, 30, 8, '#ffffff');
      px(g, 31, 7, '#dbd5c7');
      break;
    case 4: // Braided leather band
      hLine(g, 18, 29, 18, '#784d35');
      px(g, 24, 18, '#7be0a0'); // emerald stud
      break;
    case 5: // Silk headscarf
      rect(g, 17, 15, 14, 4, '#dbd5c7');
      hLine(g, 18, 29, 15, '#f5f1e6');
      vLine(g, 31, 18, 28, '#b8b2a6'); // scarf tail
      break;
    case 6: // Silver Circlet with emerald gem (Epic+)
      hLine(g, 18, 29, 19, '#dbd5c7');
      px(g, 18, 18, '#ffffff');
      px(g, 29, 18, '#b8b2a6');
      // Center jewel setting
      rect(g, 23, 17, 3, 3, '#7be0a0');
      px(g, 24, 18, '#ffffff'); // jewel sparkle
      px(g, 24, 16, '#dbd5c7'); // silver crest
      break;
    case 7: // Gold Crown (Legendary+)
      // Filigree gold spires
      hLine(g, 17, 30, 18, '#ffd56b');
      hLine(g, 18, 29, 19, '#b26a00');
      // 3 tall spires
      vLine(g, 20, 13, 17, '#ffd56b');
      vLine(g, 24, 10, 17, '#ffd56b');
      vLine(g, 28, 13, 17, '#ffd56b');
      // Gems on spires
      px(g, 20, 12, '#7be0a0'); // emerald
      px(g, 24, 9, '#e62e4c'); // ruby center
      px(g, 28, 12, '#7be0a0'); // emerald
      // Highlights
      px(g, 24, 10, '#ffffff');
      break;
  }
}

function drawElfAccessory(g: CanvasRenderingContext2D, accIdx: number): void {
  switch (accIdx) {
    case 0: // None
      break;
    case 1: // Silver leaf earring on left ear
      px(g, 11, 24, '#dbd5c7');
      px(g, 11, 25, '#7be0a0');
      px(g, 11, 26, '#dbd5c7');
      break;
    case 2: // Leaf cheek tattoo on right cheek
      px(g, 28, 28, '#489c5c');
      px(g, 29, 29, '#7ed992');
      px(g, 28, 30, '#489c5c');
      break;
    case 3: // Slender wooden pipe
      hLine(g, 17, 22, 33, '#784d35');
      px(g, 16, 32, '#593724');
      // Smoke wisp
      px(g, 15, 30, '#e0fbff');
      px(g, 14, 28, '#b8b2a6');
      break;
    case 4: // Forehead star jewel
      px(g, 24, 21, '#7ce0f7');
      px(g, 24, 20, '#e0fbff');
      px(g, 23, 21, '#e0fbff');
      px(g, 25, 21, '#e0fbff');
      px(g, 24, 22, '#e0fbff');
      break;
    case 5: // Gold ear cuffs
      px(g, 12, 21, '#ffd56b');
      px(g, 13, 22, '#ffd56b');
      px(g, 35, 21, '#ffd56b');
      px(g, 34, 22, '#ffd56b');
      break;
  }
}

/* =====================================================================
   PEOPLE: LIZARD
   ===================================================================== */

function drawLizard(g: CanvasRenderingContext2D, t: PortraitTraits, frameIdx: number): void {
  const skinPals = [
    { base: '#4fc8a8', shadow: '#1d7a72', light: '#8fe3c6', out: '#0f4a46', snout: '#8fe3c6' },
    { base: '#359ca3', shadow: '#13494d', light: '#62d8de', out: '#0b3336', snout: '#62d8de' },
    { base: '#2e8a75', shadow: '#1b594b', light: '#52bfa4', out: '#0f3b31', snout: '#6ad6bb' },
    { base: '#1f6b64', shadow: '#10423e', light: '#3ca197', out: '#082926', snout: '#4bb8ac' },
  ];
  const sk = skinPals[t.skin % 4]!;

  // 1. Back Frill / Horns (drawn behind head and shoulders)
  drawLizardBackCrest(g, t.hair % 8, sk);

  // 2. Shoulders & Torso (y=38..53)
  const vestBase = '#a8693a';
  const vestShadow = '#6e3523';
  const vestLight = '#d9743a';
  const vestOut = '#4a2217';

  // Base shoulders
  rect(g, 18, 38, 12, 3, vestBase);
  rect(g, 14, 41, 20, 3, vestBase);
  rect(g, 10, 44, 28, 3, vestBase);
  rect(g, 6, 47, 36, 3, vestBase);
  rect(g, 3, 50, 42, 4, vestBase);

  // Lighting & Shadows
  vLine(g, 4, 50, 53, vestLight);
  vLine(g, 7, 47, 49, vestLight);
  vLine(g, 11, 44, 46, vestLight);
  vLine(g, 43, 50, 53, vestShadow);
  vLine(g, 40, 47, 49, vestShadow);
  vLine(g, 36, 44, 46, vestShadow);

  // Shoulder 1px dark outline
  hLine(g, 18, 29, 37, vestOut);
  vLine(g, 17, 38, 40, vestOut);
  vLine(g, 30, 38, 40, vestOut);
  vLine(g, 13, 41, 43, vestOut);
  vLine(g, 34, 41, 43, vestOut);
  vLine(g, 9, 44, 46, vestOut);
  vLine(g, 38, 44, 46, vestOut);
  vLine(g, 5, 47, 49, vestOut);
  vLine(g, 42, 47, 49, vestOut);
  vLine(g, 2, 50, 53, vestOut);
  vLine(g, 45, 50, 53, vestOut);

  // Bone necklace across chest
  hLine(g, 16, 31, 44, '#6b4a2a');
  // Bone pendants
  rect(g, 18, 45, 2, 3, '#f1e6c8');
  rect(g, 21, 46, 2, 4, '#f1e6c8');
  rect(g, 25, 46, 2, 4, '#f1e6c8');
  rect(g, 28, 45, 2, 3, '#f1e6c8');
  px(g, 18, 48, '#6b4a2a');
  px(g, 21, 50, '#6b4a2a');
  px(g, 25, 50, '#6b4a2a');
  px(g, 28, 48, '#6b4a2a');

  // 3. Neck
  rect(g, 21, 33, 6, 5, sk.base);
  vLine(g, 26, 33, 37, sk.shadow);
  vLine(g, 20, 33, 37, sk.out);
  vLine(g, 27, 33, 37, sk.out);

  // 4. Head & Snout
  // Main skull
  rect(g, 18, 17, 12, 3, sk.base);
  rect(g, 17, 20, 14, 6, sk.base);
  rect(g, 18, 26, 12, 5, sk.base);
  rect(g, 20, 31, 8, 3, sk.base); // jaw
  px(g, 23, 34, sk.base);
  px(g, 24, 34, sk.base);

  // Top-left lighting
  vLine(g, 17, 20, 25, sk.light);
  hLine(g, 19, 23, 17, sk.light);
  // Right shadow
  vLine(g, 30, 20, 25, sk.shadow);
  rect(g, 28, 26, 2, 5, sk.shadow);

  // Snout plate (lighter scale tone)
  rect(g, 20, 27, 8, 4, sk.snout);
  px(g, 21, 31, sk.snout);
  px(g, 26, 31, sk.snout);

  // Nostrils
  px(g, 22, 28, '#0b3532');
  px(g, 25, 28, '#0b3532');

  // Mouth line & forked tongue
  hLine(g, 21, 26, 32, '#0b3532');
  px(g, 23, 33, '#d6452f');
  px(g, 24, 33, '#d6452f');
  px(g, 23, 34, '#d6452f');
  px(g, 25, 34, '#d6452f');

  // Head outline
  hLine(g, 19, 28, 16, sk.out);
  vLine(g, 17, 18, 19, sk.out);
  vLine(g, 30, 18, 19, sk.out);
  vLine(g, 16, 20, 25, sk.out);
  vLine(g, 31, 20, 25, sk.out);
  vLine(g, 17, 26, 30, sk.out);
  vLine(g, 30, 26, 30, sk.out);
  vLine(g, 19, 31, 33, sk.out);
  vLine(g, 28, 31, 33, sk.out);
  hLine(g, 21, 26, 35, sk.out);

  // Scale spots on forehead
  px(g, 21, 19, sk.shadow);
  px(g, 26, 19, sk.shadow);
  px(g, 24, 21, sk.shadow);

  // 5. Eyes (6 shapes, reptilian vertical slit)
  const eyeY = 23;
  const leftX = 18;
  const rightX = 27;
  const eyeAmber = ['#ffe14a', '#ffd059', '#ff9800', '#76ff9b', '#fff368', '#f2a65a'][t.eyes % 6]!;

  // Brow ridge
  hLine(g, leftX - 1, leftX + 3, eyeY - 2, sk.out);
  hLine(g, rightX - 1, rightX + 3, eyeY - 2, sk.out);

  // Amber iris
  rect(g, leftX, eyeY, 3, 3, eyeAmber);
  rect(g, rightX, eyeY, 3, 3, eyeAmber);

  // Vertical slit pupil
  vLine(g, leftX + 1, eyeY, eyeY + 2, '#14120a');
  vLine(g, rightX + 1, eyeY, eyeY + 2, '#14120a');

  // Eye highlights
  px(g, leftX, eyeY, '#ffffff');
  px(g, rightX, eyeY, '#ffffff');

  // GlowEyes
  if (t.glowEyes) {
    const glowBright = frameIdx === 0 ? '#76ff9b' : '#ffff59';
    const glowDim = frameIdx === 0 ? '#359ca3' : '#62d8de';
    const shift = frameIdx === 1 ? 1 : 0;

    px(g, leftX + 1, eyeY, glowBright);
    px(g, rightX + 1, eyeY, glowBright);

    px(g, leftX - 1, eyeY + 1, glowDim);
    px(g, leftX + 3, eyeY + 1, glowDim);
    px(g, leftX + 1, eyeY - 1 - shift, glowBright);
    px(g, leftX + 1, eyeY + 3 + shift, glowDim);

    px(g, rightX - 1, eyeY + 1, glowDim);
    px(g, rightX + 3, eyeY + 1, glowDim);
    px(g, rightX + 1, eyeY - 1 - shift, glowBright);
    px(g, rightX + 1, eyeY + 3 + shift, glowDim);
  }

  // 6. Front Crest / Spines (if visible over forehead)
  drawLizardFrontCrest(g, t.hair % 8, sk);

  // 7. Headwear (0..7)
  drawLizardHeadwear(g, t.headwear % 8);

  // 8. Accessories (0..5)
  drawLizardAccessory(g, t.accessory % 6);
}

function drawLizardBackCrest(
  g: CanvasRenderingContext2D,
  crestIdx: number,
  sk: { base: string; shadow: string; light: string; out: string; snout: string },
): void {
  const frillAmber = '#ffb347';
  const frillRed = '#d6452f';
  const frillRib = '#8c2a1c';

  switch (crestIdx) {
    case 0: // Giant fan neck-frill
      for (let i = 0; i < 7; i++) {
        // Left web
        rect(g, 10 - i, 16 + i * 2, 7, 3, frillAmber);
        hLine(g, 9 - i, 15 - i, 16 + i * 2, frillRib);
        // Right web
        rect(g, 31 + i, 16 + i * 2, 7, 3, frillRed);
        hLine(g, 32 + i, 38 + i, 16 + i * 2, frillRib);
      }
      break;
    case 1: // Spined dorsal ridge
      for (let y = 10; y <= 16; y += 2) {
        rect(g, 23, y, 2, 2, sk.shadow);
        px(g, 24, y - 1, sk.light);
      }
      break;
    case 2: // Twin curved horns (bone)
      // Left horn
      vLine(g, 15, 10, 16, '#ebe3d2');
      vLine(g, 14, 8, 12, '#ebe3d2');
      px(g, 13, 7, '#ffffff');
      vLine(g, 16, 12, 17, '#bfb59f');
      // Right horn
      vLine(g, 32, 10, 16, '#ebe3d2');
      vLine(g, 33, 8, 12, '#ebe3d2');
      px(g, 34, 7, '#ffffff');
      vLine(g, 31, 12, 17, '#bfb59f');
      break;
    case 3: // Webbed cheek frills
      rect(g, 10, 24, 6, 6, frillAmber);
      rect(g, 32, 24, 6, 6, frillRed);
      hLine(g, 10, 15, 27, frillRib);
      hLine(g, 32, 37, 27, frillRib);
      break;
    case 4: // Triple horn crown
      vLine(g, 20, 11, 16, '#ebe3d2');
      vLine(g, 24, 8, 16, '#ebe3d2');
      vLine(g, 28, 11, 16, '#ebe3d2');
      px(g, 24, 7, '#ffffff');
      break;
    case 5: // Jagged spiky scales
      for (let i = 0; i < 4; i++) {
        px(g, 16 - i * 2, 18 + i * 3, sk.light);
        px(g, 31 + i * 2, 18 + i * 3, sk.shadow);
      }
      break;
    case 6: // Throat dewlap & spikes
      rect(g, 22, 35, 4, 6, frillRed);
      vLine(g, 23, 36, 40, frillAmber);
      break;
    case 7: // Monarch frill
    default:
      rect(g, 11, 14, 26, 4, frillAmber);
      hLine(g, 12, 35, 13, frillRed);
      hLine(g, 14, 33, 12, '#ffd059');
      break;
  }
}

function drawLizardFrontCrest(
  g: CanvasRenderingContext2D,
  crestIdx: number,
  sk: { base: string; shadow: string; light: string; out: string; snout: string },
): void {
  // Forehead scales/crest details
  if (crestIdx === 1 || crestIdx === 4) {
    vLine(g, 24, 16, 21, sk.shadow);
    px(g, 24, 18, sk.light);
  }
}

function drawLizardHeadwear(g: CanvasRenderingContext2D, headwearIdx: number): void {
  switch (headwearIdx) {
    case 0: // None
      break;
    case 1: // Woven reed sunhat
      hLine(g, 12, 35, 17, '#9e8852');
      hLine(g, 15, 32, 16, '#9e8852');
      hLine(g, 18, 29, 15, '#6b5a35');
      hLine(g, 21, 26, 14, '#9e8852');
      px(g, 23, 13, '#6b5a35');
      px(g, 24, 13, '#6b5a35');
      break;
    case 2: // Carved bone skullcap
      rect(g, 18, 14, 12, 4, '#ebe3d2');
      hLine(g, 19, 28, 13, '#ffffff');
      hLine(g, 18, 29, 18, '#bfb59f');
      // Carved tribal marks
      px(g, 21, 15, '#8f8674');
      px(g, 26, 15, '#8f8674');
      break;
    case 3: // Reptile hide headband
      hLine(g, 17, 30, 18, '#ad7b3b');
      px(g, 24, 18, '#ff9800'); // copper stud
      break;
    case 4: // Swamp shroud hood
      rect(g, 16, 12, 16, 6, '#1b3833');
      rect(g, 14, 16, 4, 12, '#1b3833');
      rect(g, 30, 16, 4, 12, '#13494d');
      hLine(g, 17, 30, 12, '#359ca3');
      break;
    case 5: // Feathered reed headdress
      hLine(g, 18, 29, 18, '#6b5a35');
      // Feathers pointing up
      vLine(g, 20, 8, 17, '#62d8de');
      vLine(g, 24, 5, 17, '#ffb347');
      vLine(g, 28, 8, 17, '#d6452f');
      px(g, 24, 4, '#ffff70');
      break;
    case 6: // Silver Circlet with Amber Gem (Epic+)
      hLine(g, 18, 29, 19, '#d8e2ec');
      px(g, 18, 18, '#ffffff');
      px(g, 29, 18, '#7e8e9c');
      // Center amber setting
      rect(g, 23, 17, 3, 3, '#eb9421');
      px(g, 24, 18, '#ffd059');
      px(g, 24, 16, '#d8e2ec');
      break;
    case 7: // Gold Lizard King Crown (Legendary+)
      hLine(g, 17, 30, 18, '#ffd56b');
      hLine(g, 18, 29, 19, '#b26a00');
      // Spiked golden spires
      vLine(g, 19, 12, 17, '#ffd56b');
      vLine(g, 24, 9, 17, '#ffd56b');
      vLine(g, 28, 12, 17, '#ffd56b');
      // Amber jewels
      px(g, 19, 11, '#ff9800');
      px(g, 24, 8, '#ff9800');
      px(g, 28, 11, '#ff9800');
      px(g, 24, 9, '#ffffff');
      break;
  }
}

function drawLizardAccessory(g: CanvasRenderingContext2D, accIdx: number): void {
  switch (accIdx) {
    case 0: // None
      break;
    case 1: // Bone nose quill
      hLine(g, 20, 27, 29, '#ebe3d2');
      px(g, 20, 29, '#ffffff');
      px(g, 27, 29, '#ffffff');
      break;
    case 2: // Battle scar across cheek
      px(g, 20, 25, '#0f4a46');
      px(g, 21, 26, '#0f4a46');
      px(g, 22, 27, '#0f4a46');
      px(g, 20, 26, '#d6452f');
      break;
    case 3: // Tribal white war paint dots
      px(g, 18, 27, '#ffffff');
      px(g, 20, 28, '#ffffff');
      px(g, 27, 28, '#ffffff');
      px(g, 29, 27, '#ffffff');
      break;
    case 4: // Copper chin ring
      rect(g, 23, 35, 2, 3, '#eb9421');
      px(g, 23, 36, '#0f4a46');
      break;
    case 5: // Amber tooth hanging from crest
      px(g, 15, 23, '#6b4a2a');
      px(g, 15, 24, '#ffd059');
      px(g, 15, 25, '#eb9421');
      break;
  }
}

/* =====================================================================
   PEOPLE: CAVEMAN
   ===================================================================== */

function drawCaveman(g: CanvasRenderingContext2D, t: PortraitTraits, frameIdx: number): void {
  const skinPals = [
    { base: '#e2a878', shadow: '#a8683f', light: '#f4caa5', out: '#59341b' },
    { base: '#d79a6a', shadow: '#8a4f27', light: '#eec098', out: '#4d2a13' },
    { base: '#b97d52', shadow: '#733e18', light: '#d69c73', out: '#3b1c09' },
    { base: '#8a5533', shadow: '#542e14', light: '#ab734e', out: '#291004' },
  ];
  const sk = skinPals[t.skin % 4]!;

  const hairPals = [
    { base: '#6b4326', shadow: '#2e1c10', light: '#915e37', out: '#1f120a' },
    { base: '#2e1c10', shadow: '#120a05', light: '#4a301e', out: '#000000' },
    { base: '#9c9286', shadow: '#4f4840', light: '#bfb5a8', out: '#2e2a24' },
  ];
  const hp = hairPals[t.id % 3]!;

  // 1. Wild Hair Back (behind head/shoulders)
  const isBackHair = t.hair === 0 || t.hair === 2 || t.hair === 5 || t.hair === 7;
  if (isBackHair && t.headwear !== 2) {
    rect(g, 13, 20, 22, 26, hp.base);
    rect(g, 11, 26, 26, 20, hp.shadow);
    vLine(g, 10, 26, 44, hp.out);
    vLine(g, 37, 26, 44, hp.out);
  }

  // 2. Fur Pelt Shoulders (y=38..53)
  const peltBase = '#b58a55';
  const peltShadow = '#7d4b1e';
  const peltLight = '#d89b52';
  const peltOut = '#4a2f18';

  // Asymmetrical fur pelt (slung across right shoulder)
  rect(g, 18, 38, 12, 3, peltBase);
  rect(g, 14, 41, 20, 3, peltBase);
  rect(g, 10, 44, 28, 3, peltBase);
  rect(g, 6, 47, 36, 3, peltBase);
  rect(g, 3, 50, 42, 4, peltBase);

  // Jagged fur pelt texture & lighting
  vLine(g, 4, 50, 53, peltLight);
  vLine(g, 7, 47, 49, peltLight);
  vLine(g, 11, 44, 46, peltLight);
  vLine(g, 43, 50, 53, peltShadow);
  vLine(g, 40, 47, 49, peltShadow);
  vLine(g, 36, 44, 46, peltShadow);

  // Fur jagged tufts on hem
  for (let x = 6; x <= 40; x += 4) {
    px(g, x, 53, peltShadow);
    px(g, x + 1, 52, peltBase);
  }

  // Shoulder 1px dark outline
  hLine(g, 18, 29, 37, peltOut);
  vLine(g, 17, 38, 40, peltOut);
  vLine(g, 30, 38, 40, peltOut);
  vLine(g, 13, 41, 43, peltOut);
  vLine(g, 34, 41, 43, peltOut);
  vLine(g, 9, 44, 46, peltOut);
  vLine(g, 38, 44, 46, peltOut);
  vLine(g, 5, 47, 49, peltOut);
  vLine(g, 42, 47, 49, peltOut);
  vLine(g, 2, 50, 53, peltOut);
  vLine(g, 45, 50, 53, peltOut);

  // Large bone clasp holding the pelt
  rect(g, 20, 41, 4, 3, '#f5efe2');
  px(g, 19, 42, '#f5efe2');
  px(g, 24, 42, '#f5efe2');
  px(g, 21, 42, '#7a4a2a'); // sinew tie

  // Bare chest / neck opening
  rect(g, 22, 35, 5, 5, sk.base);
  vLine(g, 26, 35, 39, sk.shadow);

  // 3. Head & Rugged Jaw
  rect(g, 18, 17, 12, 3, sk.base);
  rect(g, 17, 20, 14, 6, sk.base);
  rect(g, 18, 26, 12, 5, sk.base);
  rect(g, 19, 31, 10, 4, sk.base);
  rect(g, 21, 35, 6, 2, sk.base); // broad chin

  // Top-left lighting & shading
  vLine(g, 17, 20, 26, sk.light);
  hLine(g, 19, 23, 17, sk.light);
  vLine(g, 30, 20, 26, sk.shadow);
  rect(g, 28, 27, 2, 5, sk.shadow);

  // Head outline
  hLine(g, 19, 28, 16, sk.out);
  vLine(g, 17, 18, 19, sk.out);
  vLine(g, 30, 18, 19, sk.out);
  vLine(g, 16, 20, 25, sk.out);
  vLine(g, 31, 20, 25, sk.out);
  vLine(g, 17, 26, 30, sk.out);
  vLine(g, 30, 26, 30, sk.out);
  vLine(g, 18, 31, 34, sk.out);
  vLine(g, 29, 31, 34, sk.out);
  hLine(g, 20, 27, 37, sk.out);

  // Broad nose
  rect(g, 23, 27, 2, 4, sk.shadow);
  px(g, 22, 30, sk.shadow);
  px(g, 25, 30, sk.shadow);

  // Ears
  rect(g, 15, 23, 2, 4, sk.base);
  rect(g, 31, 23, 2, 4, sk.shadow);
  vLine(g, 14, 23, 26, sk.out);
  vLine(g, 33, 23, 26, sk.out);

  // 4. Prominent Heavy Brow Ridge (Crucial Caveman trait!)
  hLine(g, 17, 30, 22, hp.shadow);
  hLine(g, 18, 29, 21, hp.out);

  // 5. Eyes (Deep-set eyes)
  const eyeY = 24;
  const leftX = 18;
  const rightX = 27;

  // Sclera and pupil
  rect(g, leftX, eyeY, 3, 2, '#fff6e6');
  rect(g, rightX, eyeY, 3, 2, '#fff6e6');
  px(g, leftX + 1, eyeY, '#3a2410');
  px(g, rightX + 1, eyeY, '#3a2410');
  px(g, leftX + 1, eyeY + 1, '#1f120a');
  px(g, rightX + 1, eyeY + 1, '#1f120a');

  // Eye shape variations
  if (t.eyes === 1) { // Wide wild stare
    px(g, leftX, eyeY - 1, '#ffffff');
    px(g, rightX + 2, eyeY - 1, '#ffffff');
  } else if (t.eyes === 2) { // Narrow fierce squint
    hLine(g, leftX, leftX + 2, eyeY + 1, sk.base);
    hLine(g, rightX, rightX + 2, eyeY + 1, sk.base);
  }

  // GlowEyes (Primal campfire fire glow)
  if (t.glowEyes) {
    const glowBright = frameIdx === 0 ? '#fff176' : '#ff9800';
    const glowDim = frameIdx === 0 ? '#ff9800' : '#e65100';
    const shift = frameIdx === 1 ? 1 : 0;

    px(g, leftX + 1, eyeY, glowBright);
    px(g, rightX + 1, eyeY, glowBright);

    px(g, leftX - 1, eyeY, glowDim);
    px(g, leftX + 3, eyeY, glowDim);
    px(g, leftX + 1, eyeY + 2 + shift, glowDim);

    px(g, rightX - 1, eyeY, glowDim);
    px(g, rightX + 3, eyeY, glowDim);
    px(g, rightX + 1, eyeY + 2 + shift, glowDim);
  }

  // 6. Hair & Beard (8 styles)
  drawCavemanHairAndBeard(g, t.hair % 8, hp, t.headwear);

  // 7. Headwear (0..7)
  drawCavemanHeadwear(g, t.headwear % 8);

  // 8. Accessories (0..5)
  drawCavemanAccessory(g, t.accessory % 6);
}

function drawCavemanHairAndBeard(
  g: CanvasRenderingContext2D,
  hairIdx: number,
  hp: { base: string; shadow: string; light: string; out: string },
  headwear: number,
): void {
  // Forehead hair tufts (if not wearing full cowl)
  if (headwear !== 2 && headwear !== 1) {
    switch (hairIdx) {
      case 0: // Wild unruly mane + full beard
        // Hair top
        rect(g, 16, 13, 16, 5, hp.base);
        px(g, 15, 12, hp.light);
        px(g, 32, 12, hp.shadow);
        // Full bushy beard
        rect(g, 18, 33, 12, 8, hp.base);
        rect(g, 20, 41, 8, 3, hp.shadow);
        break;
      case 1: // Topknot with bone pin
        rect(g, 22, 10, 5, 5, hp.base);
        // Bone pin
        hLine(g, 20, 28, 12, '#f5efe2');
        px(g, 19, 11, '#f5efe2');
        px(g, 29, 13, '#f5efe2');
        // Scruffy chin beard
        rect(g, 21, 34, 6, 5, hp.base);
        break;
      case 2: // Braided dreadlocks + braided beard
        for (let y = 18; y <= 40; y += 3) {
          px(g, 14, y, hp.base);
          px(g, 33, y, hp.shadow);
        }
        // Braided chin beard with tooth clasp
        vLine(g, 24, 34, 42, hp.base);
        px(g, 24, 40, '#f5efe2'); // tooth
        break;
      case 3: // Shaggy bangs + mutton chops
        rect(g, 17, 16, 14, 5, hp.base);
        // Mutton chops on cheeks
        rect(g, 16, 26, 3, 7, hp.base);
        rect(g, 29, 26, 3, 7, hp.shadow);
        break;
      case 4: // Spiky mohawk + goatee
        vLine(g, 24, 8, 16, hp.base);
        vLine(g, 23, 9, 16, hp.light);
        vLine(g, 25, 9, 16, hp.shadow);
        // Pointed goatee
        vLine(g, 24, 34, 40, hp.base);
        break;
      case 5: // Bald top + massive beard
        hLine(g, 19, 28, 16, hp.light);
        // Huge beard down to y=44
        rect(g, 17, 33, 14, 9, hp.base);
        rect(g, 19, 42, 10, 3, hp.shadow);
        break;
      case 6: // Side braids + jawline beard
        vLine(g, 15, 18, 38, hp.base);
        vLine(g, 32, 18, 38, hp.shadow);
        hLine(g, 19, 28, 35, hp.base);
        break;
      case 7: // Mammoth hunter mane
      default:
        rect(g, 15, 12, 18, 6, hp.base);
        rect(g, 18, 34, 12, 7, hp.base);
        // Sinew cord ties
        hLine(g, 16, 31, 15, '#4d2a13');
        break;
    }
  } else {
    // Under helmet/hood: just draw beard
    rect(g, 19, 34, 10, 6, hp.base);
  }
}

function drawCavemanHeadwear(g: CanvasRenderingContext2D, headwearIdx: number): void {
  switch (headwearIdx) {
    case 0: // None
      break;
    case 1: // Wolf skull helm
      rect(g, 16, 10, 16, 7, '#f5efe2');
      // Eye sockets
      px(g, 20, 14, '#1f1410');
      px(g, 27, 14, '#1f1410');
      // Sharp fangs
      px(g, 18, 17, '#ffffff');
      px(g, 29, 17, '#ffffff');
      hLine(g, 17, 30, 10, '#ffffff');
      break;
    case 2: // Sabertooth pelt cowl
      rect(g, 15, 11, 18, 7, '#d89b52');
      rect(g, 13, 16, 4, 14, '#d89b52');
      rect(g, 31, 16, 4, 14, '#b57435');
      // Tiger stripes
      px(g, 18, 13, '#1f1410');
      px(g, 24, 12, '#1f1410');
      px(g, 29, 13, '#1f1410');
      break;
    case 3: // Feather & bone warband
      hLine(g, 17, 30, 18, '#4d2a13');
      // Tall raptor feathers
      vLine(g, 21, 8, 17, '#9c9286');
      vLine(g, 26, 6, 17, '#f5efe2');
      px(g, 26, 5, '#b83b24'); // dipped in ochre
      break;
    case 4: // Mammoth hide band
      hLine(g, 17, 30, 18, '#7d4b1e');
      px(g, 20, 18, '#f5efe2');
      px(g, 24, 18, '#f5efe2');
      px(g, 28, 18, '#f5efe2');
      break;
    case 5: // Antler headdress
      hLine(g, 18, 29, 18, '#4d2a13');
      // Antler prongs
      vLine(g, 17, 8, 17, '#bfb59f');
      px(g, 15, 9, '#bfb59f');
      px(g, 14, 7, '#ebe3d2');
      vLine(g, 30, 8, 17, '#bfb59f');
      px(g, 32, 9, '#bfb59f');
      px(g, 33, 7, '#ebe3d2');
      break;
    case 6: // Silver Circlet with Raw Ruby (Epic+)
      hLine(g, 17, 30, 19, '#d8e2ec');
      px(g, 17, 18, '#ffffff');
      px(g, 30, 18, '#7e8e9c');
      // Rough raw ruby gem
      rect(g, 23, 17, 3, 3, '#e62e4c');
      px(g, 24, 18, '#ff99aa');
      break;
    case 7: // Primitive Gold Crown (Legendary+)
      hLine(g, 17, 30, 18, '#ffd56b');
      hLine(g, 18, 29, 19, '#b26a00');
      // Hammered gold points
      vLine(g, 19, 12, 17, '#ffd56b');
      vLine(g, 24, 9, 17, '#ffd56b');
      vLine(g, 28, 12, 17, '#ffd56b');
      px(g, 24, 9, '#ffffff');
      px(g, 19, 11, '#e62e4c'); // ruby
      px(g, 28, 11, '#e62e4c');
      break;
  }
}

function drawCavemanAccessory(g: CanvasRenderingContext2D, accIdx: number): void {
  switch (accIdx) {
    case 0: // None
      break;
    case 1: // Bone through septum
      hLine(g, 20, 27, 30, '#f5efe2');
      px(g, 19, 30, '#ffffff');
      px(g, 28, 30, '#ffffff');
      break;
    case 2: // Red ochre war paint stripes on cheeks
      hLine(g, 18, 21, 28, '#b83b24');
      hLine(g, 18, 21, 30, '#b83b24');
      hLine(g, 26, 29, 28, '#b83b24');
      hLine(g, 26, 29, 30, '#b83b24');
      break;
    case 3: // Claw necklace
      hLine(g, 18, 29, 39, '#4a2f18');
      px(g, 22, 40, '#f5efe2');
      px(g, 25, 40, '#f5efe2');
      break;
    case 4: // Jagged battle scar across brow
      px(g, 20, 21, '#4d2a13');
      px(g, 21, 22, '#4d2a13');
      px(g, 22, 23, '#b83b24');
      px(g, 23, 24, '#4d2a13');
      break;
    case 5: // Soot/charcoal handprint streak
      rect(g, 25, 26, 3, 4, '#1f1410');
      px(g, 24, 25, '#1f1410');
      px(g, 26, 24, '#1f1410');
      px(g, 28, 25, '#1f1410');
      break;
  }
}

/* =====================================================================
   PEOPLE: DRAGON
   ===================================================================== */

function drawDragon(g: CanvasRenderingContext2D, t: PortraitTraits, frameIdx: number): void {
  const skinPals = [
    { base: '#d0402e', shadow: '#7a1414', light: '#ff6b57', out: '#3a0709', snout: '#c4392a' },
    { base: '#9c1d1d', shadow: '#591010', light: '#cf3c3c', out: '#290505', snout: '#8a1b1b' },
    { base: '#7a1414', shadow: '#420707', light: '#a82828', out: '#1f0303', snout: '#661212' },
    { base: '#4a0d14', shadow: '#240408', light: '#781c25', out: '#140103', snout: '#3b0a10' },
  ];
  const sk = skinPals[t.skin % 4]!;

  // 1. Horns & Dorsal Crest (behind head & shoulders)
  drawDragonHorns(g, t.hair % 8);

  // 2. Scaled Mantle & Shoulders (y=38..53)
  const mantleBase = '#4a0d14';
  const mantleShadow = '#240408';
  const mantleLight = '#781c25';
  const mantleOut = '#1d0508';

  // Base shoulders
  rect(g, 18, 38, 12, 3, mantleBase);
  rect(g, 14, 41, 20, 3, mantleBase);
  rect(g, 10, 44, 28, 3, mantleBase);
  rect(g, 6, 47, 36, 3, mantleBase);
  rect(g, 3, 50, 42, 4, mantleBase);

  // Top-left lighting & shadows
  vLine(g, 4, 50, 53, mantleLight);
  vLine(g, 7, 47, 49, mantleLight);
  vLine(g, 11, 44, 46, mantleLight);
  vLine(g, 43, 50, 53, mantleShadow);
  vLine(g, 40, 47, 49, mantleShadow);
  vLine(g, 36, 44, 46, mantleShadow);

  // 1px dark outline on shoulders
  hLine(g, 18, 29, 37, mantleOut);
  vLine(g, 17, 38, 40, mantleOut);
  vLine(g, 30, 38, 40, mantleOut);
  vLine(g, 13, 41, 43, mantleOut);
  vLine(g, 34, 41, 43, mantleOut);
  vLine(g, 9, 44, 46, mantleOut);
  vLine(g, 38, 44, 46, mantleOut);
  vLine(g, 5, 47, 49, mantleOut);
  vLine(g, 42, 47, 49, mantleOut);
  vLine(g, 2, 50, 53, mantleOut);
  vLine(g, 45, 50, 53, mantleOut);

  // Golden dragon gorget / chest plate
  rect(g, 21, 41, 6, 5, '#f2b45a');
  px(g, 20, 42, '#f2b45a');
  px(g, 27, 42, '#f2b45a');
  px(g, 23, 43, '#d50000'); // ruby center
  px(g, 24, 43, '#d50000');
  hLine(g, 21, 26, 46, '#b26a00');

  // 3. Neck
  rect(g, 21, 33, 6, 5, sk.base);
  vLine(g, 26, 33, 37, sk.shadow);
  vLine(g, 20, 33, 37, sk.out);
  vLine(g, 27, 33, 37, sk.out);

  // 4. Head & Snout
  rect(g, 18, 17, 12, 3, sk.base);
  rect(g, 17, 20, 14, 6, sk.base);
  rect(g, 18, 26, 12, 5, sk.base);
  rect(g, 20, 31, 8, 3, sk.base);
  px(g, 23, 34, sk.base);
  px(g, 24, 34, sk.base);

  // Shading & highlights
  vLine(g, 17, 20, 25, sk.light);
  hLine(g, 19, 23, 17, sk.light);
  vLine(g, 30, 20, 25, sk.shadow);
  rect(g, 28, 26, 2, 5, sk.shadow);

  // Snout
  rect(g, 19, 26, 10, 5, sk.snout);
  px(g, 20, 31, sk.snout);
  px(g, 27, 31, sk.snout);

  // Nostrils
  px(g, 22, 27, '#2a0508');
  px(g, 25, 27, '#2a0508');

  // Mouth & sharp fangs
  hLine(g, 21, 26, 31, '#2a0508');
  // Two white fangs pointing down
  px(g, 21, 32, '#fffbe9');
  px(g, 21, 33, '#fffbe9');
  px(g, 26, 32, '#fffbe9');
  px(g, 26, 33, '#fffbe9');

  // Head outline
  hLine(g, 19, 28, 16, sk.out);
  vLine(g, 17, 18, 19, sk.out);
  vLine(g, 30, 18, 19, sk.out);
  vLine(g, 16, 20, 25, sk.out);
  vLine(g, 31, 20, 25, sk.out);
  vLine(g, 17, 26, 30, sk.out);
  vLine(g, 30, 26, 30, sk.out);
  vLine(g, 19, 31, 33, sk.out);
  vLine(g, 28, 31, 33, sk.out);
  hLine(g, 21, 26, 35, sk.out);

  // 5. Eyes (Fiery Draconic slit eyes)
  const eyeY = 23;
  const leftX = 18;
  const rightX = 27;
  const eyeGold = ['#ffb300', '#fff176', '#ff6d00', '#eb9421', '#ffd059', '#ff9800'][t.eyes % 6]!;

  // Scaled brow ridge
  hLine(g, leftX - 1, leftX + 3, eyeY - 2, sk.out);
  hLine(g, rightX - 1, rightX + 3, eyeY - 2, sk.out);

  // Molten iris
  rect(g, leftX, eyeY, 3, 3, eyeGold);
  rect(g, rightX, eyeY, 3, 3, eyeGold);

  // Vertical slit pupil
  vLine(g, leftX + 1, eyeY, eyeY + 2, '#14060a');
  vLine(g, rightX + 1, eyeY, eyeY + 2, '#14060a');

  // Specular white highlight
  px(g, leftX, eyeY, '#ffffff');
  px(g, rightX, eyeY, '#ffffff');

  // GlowEyes (Molten lava glow)
  if (t.glowEyes) {
    const glowBright = frameIdx === 0 ? '#fff176' : '#ffb300';
    const glowDim = frameIdx === 0 ? '#ff6d00' : '#d50000';
    const shift = frameIdx === 1 ? 1 : 0;

    px(g, leftX + 1, eyeY, glowBright);
    px(g, rightX + 1, eyeY, glowBright);

    px(g, leftX - 1, eyeY + 1, glowDim);
    px(g, leftX + 3, eyeY + 1, glowDim);
    px(g, leftX + 1, eyeY - 1 - shift, glowBright);
    px(g, leftX + 1, eyeY + 3 + shift, glowDim);

    px(g, rightX - 1, eyeY + 1, glowDim);
    px(g, rightX + 3, eyeY + 1, glowDim);
    px(g, rightX + 1, eyeY - 1 - shift, glowBright);
    px(g, rightX + 1, eyeY + 3 + shift, glowDim);
  }

  // 6. Forehead ridge details
  px(g, 24, 18, sk.light);
  px(g, 24, 20, sk.shadow);

  // 7. Headwear (0..7) - Horns poke through!
  drawDragonHeadwear(g, t.headwear % 8);

  // 8. Accessories (0..5)
  drawDragonAccessory(g, t.accessory % 6);
}

function drawDragonHorns(g: CanvasRenderingContext2D, hornIdx: number): void {
  const hornLight = '#efe0b8';
  const hornShadow = '#b89c64';
  const hornOut = '#3a2a14';

  switch (hornIdx) {
    case 0: // Massive curved swept-back horns
      // Left horn: curves from (16, 18) -> (12, 12) -> (8, 6)
      vLine(g, 16, 15, 18, hornLight);
      vLine(g, 14, 12, 16, hornLight);
      vLine(g, 11, 9, 13, hornLight);
      vLine(g, 8, 6, 10, hornLight);
      px(g, 7, 5, '#ffffff'); // tip
      vLine(g, 17, 16, 19, hornShadow);
      vLine(g, 15, 13, 16, hornShadow);
      vLine(g, 12, 10, 13, hornShadow);
      vLine(g, 9, 7, 10, hornShadow);
      vLine(g, 7, 6, 10, hornOut);
      // Right horn: curves from (31, 18) -> (35, 12) -> (39, 6)
      vLine(g, 31, 15, 18, hornLight);
      vLine(g, 33, 12, 16, hornLight);
      vLine(g, 36, 9, 13, hornLight);
      vLine(g, 39, 6, 10, hornLight);
      px(g, 40, 5, '#ffffff'); // tip
      vLine(g, 32, 16, 19, hornShadow);
      vLine(g, 34, 13, 16, hornShadow);
      vLine(g, 37, 10, 13, hornShadow);
      vLine(g, 40, 7, 10, hornShadow);
      vLine(g, 41, 6, 10, hornOut);
      break;

    case 1: // Spiked crown of horns (5 spikes)
      vLine(g, 16, 11, 17, hornLight);
      vLine(g, 20, 8, 17, hornLight);
      vLine(g, 24, 6, 17, hornLight);
      vLine(g, 28, 8, 17, hornLight);
      vLine(g, 31, 11, 17, hornLight);
      px(g, 24, 5, '#ffffff');
      break;

    case 2: // Curled ram horns
      // Left curl
      rect(g, 12, 14, 4, 3, hornLight);
      rect(g, 9, 17, 3, 5, hornLight);
      rect(g, 12, 22, 4, 3, hornShadow);
      // Right curl
      rect(g, 32, 14, 4, 3, hornLight);
      rect(g, 36, 17, 3, 5, hornLight);
      rect(g, 32, 22, 4, 3, hornShadow);
      break;

    case 3: // Tall dorsal fin crest
      for (let y = 6; y <= 16; y += 2) {
        rect(g, 23, y, 2, 2, '#8f1d18');
        px(g, 24, y - 1, '#ff6d00'); // fiery fin tip
      }
      break;

    case 4: // Forward-swept war horns
      // Left horn
      vLine(g, 15, 12, 18, hornLight);
      hLine(g, 11, 15, 12, hornLight);
      px(g, 10, 12, '#ffffff');
      // Right horn
      vLine(g, 32, 12, 18, hornLight);
      hLine(g, 32, 36, 12, hornLight);
      px(g, 37, 12, '#ffffff');
      break;

    case 5: // Jagged lightning horns
      vLine(g, 15, 14, 18, hornLight);
      hLine(g, 11, 15, 14, hornLight);
      vLine(g, 11, 8, 14, hornLight);
      px(g, 11, 7, '#ffffff');
      vLine(g, 32, 14, 18, hornLight);
      hLine(g, 32, 36, 14, hornLight);
      vLine(g, 36, 8, 14, hornLight);
      px(g, 36, 7, '#ffffff');
      break;

    case 6: // Multi-tined branching horns
      vLine(g, 15, 8, 18, hornLight);
      hLine(g, 10, 15, 12, hornLight);
      px(g, 10, 11, '#ffffff');
      vLine(g, 32, 8, 18, hornLight);
      hLine(g, 32, 37, 12, hornLight);
      px(g, 37, 11, '#ffffff');
      break;

    case 7: // Great Wyrm horns & cheek spurs
    default:
      vLine(g, 14, 6, 18, hornLight);
      vLine(g, 33, 6, 18, hornLight);
      px(g, 14, 5, '#ffffff');
      px(g, 33, 5, '#ffffff');
      // Cheek horn spurs
      px(g, 12, 26, hornLight);
      px(g, 13, 26, hornShadow);
      px(g, 35, 26, hornLight);
      px(g, 34, 26, hornShadow);
      break;
  }
}

function drawDragonHeadwear(g: CanvasRenderingContext2D, headwearIdx: number): void {
  switch (headwearIdx) {
    case 0: // None
      break;
    case 1: // Iron horned bascinet
      hLine(g, 17, 30, 18, '#636f7a');
      hLine(g, 18, 29, 17, '#9ba6b2');
      px(g, 24, 17, '#ffffff');
      break;
    case 2: // Chainmail coif
      rect(g, 16, 16, 16, 3, '#454e57');
      for (let x = 17; x <= 30; x += 2) {
        px(g, x, 17, '#8d9ba8');
      }
      break;
    case 3: // Dark leather aviator hood
      hLine(g, 16, 31, 18, '#3b2316');
      hLine(g, 17, 30, 17, '#593724');
      px(g, 20, 18, '#d50000'); // brass buckle
      px(g, 27, 18, '#d50000');
      break;
    case 4: // Dragon-scale war helm
      rect(g, 17, 16, 14, 3, '#181420');
      hLine(g, 18, 29, 16, '#3a3247');
      px(g, 24, 15, '#ff6d00'); // fire crest
      break;
    case 5: // Ceremonial flame hood
      hLine(g, 16, 31, 18, '#8f1d18');
      hLine(g, 17, 30, 17, '#c4392a');
      px(g, 24, 17, '#ffe57f'); // gold rune
      break;
    case 6: // Silver Circlet with Sapphire Gem (Epic+)
      hLine(g, 17, 30, 19, '#d8e2ec');
      px(g, 17, 18, '#ffffff');
      px(g, 30, 18, '#7e8e9c');
      // Center sapphire
      rect(g, 23, 17, 3, 3, '#3ba3c4');
      px(g, 24, 18, '#e0fbff');
      break;
    case 7: // Imperial Dragon Gold Crown (Legendary+)
      hLine(g, 17, 30, 18, '#ffd56b');
      hLine(g, 18, 29, 19, '#b26a00');
      // Tall gold spires (horns poke between them)
      vLine(g, 19, 12, 17, '#ffd56b');
      vLine(g, 24, 9, 17, '#ffd56b');
      vLine(g, 28, 12, 17, '#ffd56b');
      // Rubies on spires
      px(g, 19, 11, '#d50000');
      px(g, 24, 8, '#d50000');
      px(g, 28, 11, '#d50000');
      px(g, 24, 9, '#ffffff');
      break;
  }
}

function drawDragonAccessory(g: CanvasRenderingContext2D, accIdx: number): void {
  switch (accIdx) {
    case 0: // None
      break;
    case 1: // Gold horn ring
      px(g, 12, 11, '#ffd56b');
      px(g, 13, 11, '#ffd56b');
      px(g, 12, 12, '#b26a00');
      break;
    case 2: // Smoking ember pipe
      hLine(g, 16, 21, 32, '#262129');
      px(g, 15, 31, '#ff6d00'); // ember
      px(g, 14, 29, '#ffe57f'); // smoke
      break;
    case 3: // Scorched cheek scar
      px(g, 27, 26, '#3a0709');
      px(g, 28, 27, '#ff6d00'); // glowing lava scar
      px(g, 29, 28, '#3a0709');
      break;
    case 4: // Fang stud piercing
      px(g, 21, 34, '#ffd56b');
      break;
    case 5: // Molten magma veins on neck
      vLine(g, 24, 34, 38, '#ff6d00');
      px(g, 23, 35, '#fff176');
      px(g, 25, 37, '#fff176');
      break;
  }
}

/* =====================================================================
   PEOPLE: GOBLIN
   ===================================================================== */

function drawGoblin(g: CanvasRenderingContext2D, t: PortraitTraits, frameIdx: number): void {
  const skinPals = [
    { base: '#9ccf4a', shadow: '#5a8a22', light: '#c4f06e', out: '#2e4a10', nose: '#7fb63a' },
    { base: '#7fb63a', shadow: '#44691a', light: '#a8de5b', out: '#24380d', nose: '#68962c' },
    { base: '#5a8a22', shadow: '#314d10', light: '#7dbd33', out: '#1a2b08', nose: '#487019' },
    { base: '#3d5a1f', shadow: '#223310', light: '#5b8530', out: '#121c08', nose: '#304718' },
  ];
  const sk = skinPals[t.skin % 4]!;

  const hairPals = [
    { base: '#22221b', shadow: '#11110c', light: '#3d3d33', out: '#0a0a06' }, // Greasy black
    { base: '#8c381b', shadow: '#5e2411', light: '#b84e27', out: '#3b1408' }, // Rust red
    { base: '#454e57', shadow: '#2c3238', light: '#636f7a', out: '#1a1e21' }, // Iron grey
  ];
  const hp = hairPals[t.id % 3]!;

  // 1. Huge Pointed Bat Ears (behind head, extending far to sides x=6..16 and x=31..41)
  // Left ear: points to (6, 23)
  for (let i = 0; i < 9; i++) {
    const ex = 16 - i;
    const ey = 27 - Math.floor(i / 2);
    px(g, ex, ey, sk.base);
    px(g, ex, ey + 1, sk.shadow);
    px(g, ex, ey - 1, sk.out);
    px(g, ex, ey + 2, sk.out);
  }
  px(g, 6, 23, sk.light); // ear tip
  // Right ear: points to (41, 23)
  for (let i = 0; i < 9; i++) {
    const ex = 31 + i;
    const ey = 27 - Math.floor(i / 2);
    px(g, ex, ey, sk.base);
    px(g, ex, ey + 1, sk.shadow);
    px(g, ex, ey - 1, sk.out);
    px(g, ex, ey + 2, sk.out);
  }
  px(g, 41, 23, sk.light); // ear tip

  // 2. Shoulders & Patched Scrap Vest (y=38..53)
  const vestBase = '#7a5230';
  const vestShadow = '#4d321c';
  const vestLight = '#a87448';
  const vestOut = '#241a10';

  // Base shoulders
  rect(g, 18, 38, 12, 3, vestBase);
  rect(g, 14, 41, 20, 3, vestBase);
  rect(g, 10, 44, 28, 3, vestBase);
  rect(g, 6, 47, 36, 3, vestBase);
  rect(g, 3, 50, 42, 4, vestBase);

  // Lighting & shadows
  vLine(g, 4, 50, 53, vestLight);
  vLine(g, 7, 47, 49, vestLight);
  vLine(g, 11, 44, 46, vestLight);
  vLine(g, 43, 50, 53, vestShadow);
  vLine(g, 40, 47, 49, vestShadow);
  vLine(g, 36, 44, 46, vestShadow);

  // 1px dark outline on shoulders
  hLine(g, 18, 29, 37, vestOut);
  vLine(g, 17, 38, 40, vestOut);
  vLine(g, 30, 38, 40, vestOut);
  vLine(g, 13, 41, 43, vestOut);
  vLine(g, 34, 41, 43, vestOut);
  vLine(g, 9, 44, 46, vestOut);
  vLine(g, 38, 44, 46, vestOut);
  vLine(g, 5, 47, 49, vestOut);
  vLine(g, 42, 47, 49, vestOut);
  vLine(g, 2, 50, 53, vestOut);
  vLine(g, 45, 50, 53, vestOut);

  // Patched burlap green pocket on left chest
  rect(g, 14, 44, 5, 4, '#3d5a1f');
  px(g, 15, 43, '#ffd54f'); // stitch thread
  px(g, 17, 43, '#ffd54f');

  // Iron rivets on right pauldron
  px(g, 32, 43, '#8d8d80');
  px(g, 35, 46, '#8d8d80');
  px(g, 31, 48, '#8d8d80');

  // Little skull trinket necklace
  hLine(g, 20, 27, 40, '#241a10');
  rect(g, 22, 41, 4, 4, '#efe6c8');
  px(g, 23, 42, '#241a10'); // eye socket
  px(g, 24, 42, '#241a10');
  px(g, 23, 44, '#241a10'); // jaw

  // 3. Neck
  rect(g, 22, 34, 4, 4, sk.base);
  vLine(g, 25, 34, 37, sk.shadow);
  vLine(g, 21, 34, 37, sk.out);
  vLine(g, 26, 34, 37, sk.out);

  // 4. Head, Hooked Nose, and Grin
  rect(g, 19, 17, 10, 2, sk.base);
  rect(g, 18, 19, 12, 3, sk.base);
  rect(g, 17, 22, 14, 8, sk.base);
  rect(g, 18, 30, 12, 3, sk.base);
  rect(g, 21, 33, 6, 2, sk.base);
  px(g, 23, 35, sk.base); // pointed goblin chin
  px(g, 24, 35, sk.base);

  // Top-left lighting & shadows
  vLine(g, 17, 22, 29, sk.light);
  hLine(g, 19, 23, 17, sk.light);
  vLine(g, 30, 22, 29, sk.shadow);
  rect(g, 28, 30, 2, 3, sk.shadow);

  // Head outline
  hLine(g, 20, 27, 16, sk.out);
  vLine(g, 17, 18, 21, sk.out);
  vLine(g, 30, 18, 21, sk.out);
  vLine(g, 16, 22, 29, sk.out);
  vLine(g, 31, 22, 29, sk.out);
  vLine(g, 17, 30, 32, sk.out);
  vLine(g, 30, 30, 32, sk.out);
  px(g, 19, 33, sk.out);
  px(g, 28, 33, sk.out);
  px(g, 20, 34, sk.out);
  px(g, 27, 34, sk.out);
  hLine(g, 22, 25, 36, sk.out);

  // Big Hooked Goblin Nose
  rect(g, 22, 25, 4, 4, sk.nose);
  px(g, 21, 28, sk.nose);
  px(g, 26, 28, sk.nose);
  px(g, 23, 29, sk.out);
  px(g, 24, 29, sk.out);

  // Wide toothy goblin grin
  rect(g, 19, 31, 10, 3, '#2a0e08'); // dark mouth cavity
  // Jagged sharp white fangs
  px(g, 20, 31, '#fffbe9'); // upper fangs
  px(g, 23, 31, '#fffbe9');
  px(g, 26, 31, '#fffbe9');
  px(g, 21, 33, '#fffbe9'); // lower fangs
  px(g, 24, 33, '#fffbe9');
  px(g, 27, 33, '#fffbe9');

  // 5. Eyes (Big mischievous eyes)
  const eyeY = 23;
  const leftX = 18;
  const rightX = 27;
  const eyeYellow = ['#fff36b', '#b6f23a', '#ffd54f', '#ffeb3b', '#c8ff5a', '#ffee55'][t.eyes % 6]!;

  // Brows
  hLine(g, leftX - 1, leftX + 3, eyeY - 2, sk.out);
  hLine(g, rightX - 1, rightX + 3, eyeY - 2, sk.out);

  // Large yellowish eyes
  rect(g, leftX, eyeY, 3, 3, eyeYellow);
  rect(g, rightX, eyeY, 3, 3, eyeYellow);

  // Mischievous dark pupil
  rect(g, leftX + 1, eyeY + 1, 2, 2, '#1a1a08');
  rect(g, rightX + 1, eyeY + 1, 2, 2, '#1a1a08');

  // White gleam
  px(g, leftX, eyeY, '#ffffff');
  px(g, rightX, eyeY, '#ffffff');

  // GlowEyes (Toxic yellow-green glow)
  if (t.glowEyes) {
    const glowBright = frameIdx === 0 ? '#c8ff5a' : '#fff36b';
    const glowDim = frameIdx === 0 ? '#76ff9b' : '#9ccf4a';
    const shift = frameIdx === 1 ? 1 : 0;

    px(g, leftX + 1, eyeY + 1, glowBright);
    px(g, rightX + 1, eyeY + 1, glowBright);

    px(g, leftX - 1, eyeY + 1, glowDim);
    px(g, leftX + 3, eyeY + 1, glowDim);
    px(g, leftX + 1, eyeY - 1 - shift, glowBright);
    px(g, leftX + 1, eyeY + 3 + shift, glowDim);

    px(g, rightX - 1, eyeY + 1, glowDim);
    px(g, rightX + 3, eyeY + 1, glowDim);
    px(g, rightX + 1, eyeY - 1 - shift, glowBright);
    px(g, rightX + 1, eyeY + 3 + shift, glowDim);
  }

  // 6. Hair & Spikes (0..7)
  if (t.headwear !== 1) { // Bucket helmet hides hair
    drawGoblinHair(g, t.hair % 8, hp);
  }

  // 7. Headwear (0..7)
  drawGoblinHeadwear(g, t.headwear % 8);

  // 8. Accessories (0..5)
  drawGoblinAccessory(g, t.accessory % 6);
}

function drawGoblinHair(
  g: CanvasRenderingContext2D,
  hairIdx: number,
  hp: { base: string; shadow: string; light: string; out: string },
): void {
  switch (hairIdx) {
    case 0: // Greasy spiked mohawk
      vLine(g, 24, 9, 16, hp.base);
      vLine(g, 23, 11, 16, hp.light);
      vLine(g, 25, 11, 16, hp.shadow);
      px(g, 24, 8, hp.light);
      break;
    case 1: // Bald skull with wispy ear tufts
      px(g, 15, 22, hp.base);
      px(g, 14, 21, hp.base);
      px(g, 32, 22, hp.base);
      px(g, 33, 21, hp.base);
      break;
    case 2: // Topknot tied with rusty wire
      rect(g, 22, 11, 4, 5, hp.base);
      hLine(g, 21, 26, 13, '#b84e27'); // rusty wire
      px(g, 23, 10, hp.light);
      break;
    case 3: // Chaotic messy spikes
      px(g, 18, 14, hp.base);
      px(g, 21, 12, hp.base);
      px(g, 24, 13, hp.base);
      px(g, 27, 12, hp.base);
      px(g, 30, 14, hp.base);
      break;
    case 4: // Greasy comb-over
      hLine(g, 18, 29, 16, hp.base);
      px(g, 30, 17, hp.shadow);
      px(g, 31, 18, hp.shadow);
      break;
    case 5: // Bristly chin goatee
      vLine(g, 23, 36, 40, hp.base);
      vLine(g, 24, 36, 41, hp.shadow);
      break;
    case 6: // Twin rat-tails
      vLine(g, 16, 28, 38, hp.base);
      vLine(g, 31, 28, 38, hp.shadow);
      break;
    case 7: // Hedgehog bristles
    default:
      for (let x = 18; x <= 29; x += 2) {
        vLine(g, x, 13, 16, hp.base);
        px(g, x, 12, hp.light);
      }
      break;
  }
}

function drawGoblinHeadwear(g: CanvasRenderingContext2D, headwearIdx: number): void {
  switch (headwearIdx) {
    case 0: // None
      break;
    case 1: // Dented iron bucket helmet
      rect(g, 16, 11, 16, 7, '#8d8d80');
      hLine(g, 15, 32, 18, '#241a10'); // rim
      vLine(g, 24, 11, 17, '#5a5a52'); // weld seam
      // Riveted iron patch
      rect(g, 19, 13, 3, 3, '#b84e27'); // rust patch
      px(g, 19, 13, '#241a10'); // rivet
      px(g, 28, 14, '#241a10');
      break;
    case 2: // Tinkerer brass goggles pushed up on brow
      rect(g, 18, 16, 5, 4, '#eb9421'); // left brass rim
      rect(g, 25, 16, 5, 4, '#eb9421'); // right brass rim
      rect(g, 19, 17, 3, 2, '#7ce0f7'); // left blue glass
      rect(g, 26, 17, 3, 2, '#7ce0f7'); // right blue glass
      px(g, 20, 17, '#ffffff'); // lens reflection
      px(g, 27, 17, '#ffffff');
      hLine(g, 23, 24, 18, '#241a10'); // goggle strap
      break;
    case 3: // Pointy scrap leather jester cap
      hLine(g, 17, 30, 17, '#785030');
      rect(g, 20, 12, 8, 5, '#593a22');
      // Pointed bent tip
      rect(g, 28, 11, 4, 3, '#593a22');
      px(g, 33, 12, '#ffd54f'); // rusted bell
      break;
    case 4: // Pirate bandanna with skull patch
      rect(g, 17, 14, 14, 5, '#8c381b');
      hLine(g, 16, 31, 18, '#5e2411');
      // Tiny skull patch
      px(g, 24, 16, '#efe6c8');
      px(g, 24, 17, '#efe6c8');
      // Knot tail
      px(g, 32, 18, '#8c381b');
      px(g, 33, 19, '#5e2411');
      break;
    case 5: // Spiked miner hardhat with candle wick
      rect(g, 17, 13, 14, 5, '#636f7a');
      hLine(g, 16, 31, 18, '#2c3238');
      // Center candle / lantern mount
      rect(g, 23, 9, 3, 4, '#b84e27');
      px(g, 24, 8, '#ff9800'); // flame
      px(g, 24, 7, '#fff176');
      break;
    case 6: // Silver Circlet with Topaz Gem (Epic+)
      hLine(g, 17, 30, 19, '#d8e2ec');
      px(g, 17, 18, '#ffffff');
      px(g, 30, 18, '#7e8e9c');
      // Center topaz jewel
      rect(g, 23, 17, 3, 3, '#ffd54f');
      px(g, 24, 18, '#ffffff');
      break;
    case 7: // Crooked Stolen Gold Crown (Legendary+)
      // Crooked angle!
      hLine(g, 18, 30, 17, '#ffd56b');
      hLine(g, 17, 29, 18, '#b26a00');
      // Mismatched spires
      vLine(g, 19, 11, 17, '#ffd56b');
      vLine(g, 23, 8, 16, '#ffd56b');
      vLine(g, 28, 12, 17, '#ffd56b');
      // Mismatched colorful gems
      px(g, 19, 10, '#d50000'); // ruby
      px(g, 23, 7, '#76ff9b'); // emerald
      px(g, 28, 11, '#3ba3c4'); // sapphire
      px(g, 23, 8, '#ffffff');
      break;
  }
}

function drawGoblinAccessory(g: CanvasRenderingContext2D, accIdx: number): void {
  switch (accIdx) {
    case 0: // None
      break;
    case 1: // Big brass hoop earrings in huge ears
      rect(g, 10, 26, 3, 3, '#ffd54f');
      px(g, 11, 27, '#241a10');
      rect(g, 36, 26, 3, 3, '#ffd54f');
      px(g, 37, 27, '#241a10');
      break;
    case 2: // Brass monocle over left eye
      rect(g, 17, 22, 5, 5, '#ffd54f');
      rect(g, 18, 23, 3, 3, '#e0fbff'); // lens glass
      // Monocle cord
      vLine(g, 22, 26, 34, '#ffd54f');
      break;
    case 3: // Smouldering cigar stub in toothy grin
      hLine(g, 17, 21, 33, '#593a22');
      px(g, 16, 33, '#ff9800'); // glowing tip
      px(g, 15, 32, '#8d8d80'); // ash
      px(g, 14, 30, '#e0fbff'); // smoke
      break;
    case 4: // Cross-stitched cheek scar
      px(g, 28, 27, '#241a10');
      px(g, 29, 28, '#241a10');
      px(g, 28, 28, '#b84e27');
      px(g, 29, 27, '#b84e27');
      break;
    case 5: // Copper nose bridge ring
      hLine(g, 22, 25, 27, '#eb9421');
      px(g, 22, 26, '#ffd54f');
      px(g, 25, 26, '#ffd54f');
      break;
  }
}

/**
 * Draw one portrait. Returns frames: one for most portraits, 2-3 when something moves
 * (aura, glowing eyes). The caller caches by id.
 */
export function paintPortrait(t: PortraitTraits): HTMLCanvasElement[] {
  const numFrames = t.aura ? 3 : t.glowEyes ? 2 : 1;
  const frames: HTMLCanvasElement[] = [];

  for (let f = 0; f < numFrames; f++) {
    const [c, g] = makeCanvas();

    // Layer 1: Backdrop
    drawBackdrop(g, t.arc, t.bg);

    // Layer 2: Aura (if set)
    if (t.aura) {
      drawAura(g, f);
    }

    // Layers 3-8: People specific features
    if (t.arc === 'elf') {
      drawElf(g, t, f);
    } else if (t.arc === 'lizard') {
      drawLizard(g, t, f);
    } else if (t.arc === 'caveman') {
      drawCaveman(g, t, f);
    } else if (t.arc === 'dragon') {
      drawDragon(g, t, f);
    } else {
      drawGoblin(g, t, f);
    }

    // Layer 9: Frame
    drawFrame(g, t.frame, f);

    frames.push(c);
  }

  return frames;
}
