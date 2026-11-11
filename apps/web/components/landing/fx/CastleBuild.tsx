'use client';

import { useId } from 'react';

/**
 * An SVG pixel castle constructed of ~75 blocks across 3 depth layers:
 * - Phase 0: Foundation / ramparts (stone footings)
 * - Phase 1: Walls (curtain walls, keep walls, archway)
 * - Phase 2: Towers & battlements (left, right, turrets, crenellations)
 * - Phase 3: Roofs & details (spires, portcullis, windows)
 * - Phase 4: Royal banners unfurling
 *
 * Designed for GSAP scrub: blocks fall from above with steps easing.
 * Supports dark theme lit windows and 3-layer pointer parallax.
 */

export interface CastleBlock {
  id: string;
  phase: number; // 0: foundation, 1: walls, 2: towers, 3: roofs/details
  layer: 0 | 1 | 2; // 0: back, 1: mid, 2: fore
  x: number;
  y: number;
  w: number;
  h: number;
  fill: string;
  stroke?: string;
}

// Crisp castle palette
const STONE_BASE = '#c4cddc';
const STONE_LIGHT = '#d8dee9';
const STONE_MED = '#cfd6e4';
const STONE_DARK = '#9aa5b8';
const STONE_DEEP = '#4c566a';
const GATE_BG = '#242933';
const ROOF_COLOR = '#5e81ac';

export const CASTLE_BLOCKS: CastleBlock[] = [
  // --- PHASE 0: FOUNDATION (y: 260-360) ---
  // Layer 0: Back foundations
  { id: 'f0-1', phase: 0, layer: 0, x: 80, y: 320, w: 100, h: 40, fill: STONE_DARK },
  { id: 'f0-2', phase: 0, layer: 0, x: 820, y: 320, w: 100, h: 40, fill: STONE_DARK },
  { id: 'f0-3', phase: 0, layer: 0, x: 180, y: 300, w: 120, h: 50, fill: STONE_MED },
  { id: 'f0-4', phase: 0, layer: 0, x: 700, y: 300, w: 120, h: 50, fill: STONE_MED },
  // Layer 1: Mid ramparts
  { id: 'f1-1', phase: 0, layer: 1, x: 120, y: 270, w: 180, h: 40, fill: STONE_LIGHT },
  { id: 'f1-2', phase: 0, layer: 1, x: 300, y: 280, w: 140, h: 40, fill: STONE_BASE },
  { id: 'f1-3', phase: 0, layer: 1, x: 560, y: 280, w: 140, h: 40, fill: STONE_BASE },
  { id: 'f1-4', phase: 0, layer: 1, x: 700, y: 270, w: 180, h: 40, fill: STONE_LIGHT },
  // Layer 2: Foreground base & gate foundation
  { id: 'f2-1', phase: 0, layer: 2, x: 220, y: 320, w: 160, h: 40, fill: STONE_DARK },
  { id: 'f2-2', phase: 0, layer: 2, x: 380, y: 320, w: 240, h: 40, fill: STONE_DARK },
  { id: 'f2-3', phase: 0, layer: 2, x: 620, y: 320, w: 160, h: 40, fill: STONE_DARK },
  { id: 'f2-4', phase: 0, layer: 2, x: 420, y: 280, w: 160, h: 40, fill: STONE_MED },

  // --- PHASE 1: WALLS & STRUCTURE (y: 140-280) ---
  // Mid-turret foundations
  { id: 'w0-1', phase: 1, layer: 0, x: 250, y: 200, w: 100, h: 70, fill: STONE_MED },
  { id: 'w0-2', phase: 1, layer: 0, x: 650, y: 200, w: 100, h: 70, fill: STONE_MED },
  // Keep walls
  { id: 'w1-1', phase: 1, layer: 1, x: 360, y: 180, w: 80, h: 100, fill: STONE_LIGHT },
  { id: 'w1-2', phase: 1, layer: 1, x: 560, y: 180, w: 80, h: 100, fill: STONE_LIGHT },
  { id: 'w1-3', phase: 1, layer: 1, x: 440, y: 160, w: 120, h: 60, fill: STONE_BASE },
  { id: 'w1-4', phase: 1, layer: 1, x: 380, y: 120, w: 110, h: 60, fill: STONE_LIGHT },
  { id: 'w1-5', phase: 1, layer: 1, x: 510, y: 120, w: 110, h: 60, fill: STONE_LIGHT },
  { id: 'w1-6', phase: 1, layer: 1, x: 410, y: 60, w: 180, h: 60, fill: STONE_BASE },
  // Gate archway & walls
  { id: 'w2-1', phase: 1, layer: 2, x: 440, y: 220, w: 30, h: 60, fill: STONE_DARK },
  { id: 'w2-2', phase: 1, layer: 2, x: 530, y: 220, w: 30, h: 60, fill: STONE_DARK },
  { id: 'w2-3', phase: 1, layer: 2, x: 450, y: 195, w: 100, h: 25, fill: STONE_MED },
  { id: 'w2-4', phase: 1, layer: 2, x: 470, y: 220, w: 60, h: 60, fill: GATE_BG },

  // --- PHASE 2: TOWERS & BATTLEMENTS (y: 60-200) ---
  // Left Tower
  { id: 't0-1', phase: 2, layer: 0, x: 130, y: 160, w: 100, h: 110, fill: STONE_MED },
  { id: 't0-2', phase: 2, layer: 0, x: 120, y: 110, w: 120, h: 50, fill: STONE_LIGHT },
  { id: 't0-3', phase: 2, layer: 0, x: 110, y: 90, w: 140, h: 20, fill: STONE_BASE },
  // Left Tower Battlements
  { id: 't0-b1', phase: 2, layer: 0, x: 110, y: 70, w: 24, h: 20, fill: STONE_BASE },
  { id: 't0-b2', phase: 2, layer: 0, x: 148, y: 70, w: 24, h: 20, fill: STONE_BASE },
  { id: 't0-b3', phase: 2, layer: 0, x: 186, y: 70, w: 24, h: 20, fill: STONE_BASE },
  { id: 't0-b4', phase: 2, layer: 0, x: 226, y: 70, w: 24, h: 20, fill: STONE_BASE },

  // Right Tower
  { id: 't1-1', phase: 2, layer: 0, x: 770, y: 160, w: 100, h: 110, fill: STONE_MED },
  { id: 't1-2', phase: 2, layer: 0, x: 760, y: 110, w: 120, h: 50, fill: STONE_LIGHT },
  { id: 't1-3', phase: 2, layer: 0, x: 750, y: 90, w: 140, h: 20, fill: STONE_BASE },
  // Right Tower Battlements
  { id: 't1-b1', phase: 2, layer: 0, x: 750, y: 70, w: 24, h: 20, fill: STONE_BASE },
  { id: 't1-b2', phase: 2, layer: 0, x: 788, y: 70, w: 24, h: 20, fill: STONE_BASE },
  { id: 't1-b3', phase: 2, layer: 0, x: 826, y: 70, w: 24, h: 20, fill: STONE_BASE },
  { id: 't1-b4', phase: 2, layer: 0, x: 866, y: 70, w: 24, h: 20, fill: STONE_BASE },

  // Mid Turrets Battlements
  { id: 'tm-1', phase: 2, layer: 1, x: 240, y: 180, w: 120, h: 20, fill: STONE_DARK },
  { id: 'tm-b1', phase: 2, layer: 1, x: 240, y: 165, w: 20, h: 15, fill: STONE_DARK },
  { id: 'tm-b2', phase: 2, layer: 1, x: 290, y: 165, w: 20, h: 15, fill: STONE_DARK },
  { id: 'tm-b3', phase: 2, layer: 1, x: 340, y: 165, w: 20, h: 15, fill: STONE_DARK },

  { id: 'tm-2', phase: 2, layer: 1, x: 640, y: 180, w: 120, h: 20, fill: STONE_DARK },
  { id: 'tm-b4', phase: 2, layer: 1, x: 640, y: 165, w: 20, h: 15, fill: STONE_DARK },
  { id: 'tm-b5', phase: 2, layer: 1, x: 690, y: 165, w: 20, h: 15, fill: STONE_DARK },
  { id: 'tm-b6', phase: 2, layer: 1, x: 740, y: 165, w: 20, h: 15, fill: STONE_DARK },

  // Central Keep Battlements & Crowns
  { id: 'tk-1', phase: 2, layer: 1, x: 390, y: 40, w: 220, h: 20, fill: STONE_MED },
  { id: 'tk-b1', phase: 2, layer: 1, x: 390, y: 20, w: 26, h: 20, fill: STONE_LIGHT },
  { id: 'tk-b2', phase: 2, layer: 1, x: 438, y: 20, w: 26, h: 20, fill: STONE_LIGHT },
  { id: 'tk-b3', phase: 2, layer: 1, x: 486, y: 20, w: 26, h: 20, fill: STONE_LIGHT },
  { id: 'tk-b4', phase: 2, layer: 1, x: 534, y: 20, w: 26, h: 20, fill: STONE_LIGHT },
  { id: 'tk-b5', phase: 2, layer: 1, x: 584, y: 20, w: 26, h: 20, fill: STONE_LIGHT },

  // --- PHASE 3: ROOFS & DETAILS (y: 10-240) ---
  // High Spire on Keep
  { id: 'r0-1', phase: 3, layer: 1, x: 480, y: 0, w: 40, h: 20, fill: ROOF_COLOR },
  { id: 'r0-2', phase: 3, layer: 1, x: 494, y: -20, w: 12, h: 20, fill: ROOF_COLOR },
  // Turret Roof Caps
  { id: 'r1-1', phase: 3, layer: 0, x: 150, y: 45, w: 60, h: 25, fill: ROOF_COLOR },
  { id: 'r1-2', phase: 3, layer: 0, x: 790, y: 45, w: 60, h: 25, fill: ROOF_COLOR },
];

export interface CastleWindow {
  id: string;
  layer: 0 | 1 | 2;
  x: number;
  y: number;
  w: number;
  h: number;
}

export const CASTLE_WINDOWS: CastleWindow[] = [
  { id: 'win-1', layer: 0, x: 165, y: 125, w: 18, h: 32 },
  { id: 'win-2', layer: 0, x: 815, y: 125, w: 18, h: 32 },
  { id: 'win-3', layer: 1, x: 435, y: 80, w: 22, h: 36 },
  { id: 'win-4', layer: 1, x: 545, y: 80, w: 22, h: 36 },
  { id: 'win-5', layer: 1, x: 490, y: 55, w: 20, h: 30 },
  { id: 'win-6', layer: 2, x: 490, y: 165, w: 20, h: 25 },
];

export interface CastleBanner {
  id: string;
  layer: 0 | 1 | 2;
  poleX: number;
  poleY: number;
  poleH: number;
  flagX: number;
  flagY: number;
  color: string;
}

export const CASTLE_BANNERS: CastleBanner[] = [
  // Left Tower Banner (Elf Green)
  { id: 'ban-left', layer: 0, poleX: 180, poleY: 15, poleH: 55, flagX: 184, flagY: 18, color: '#5fc07a' },
  // Right Tower Banner (Dragon Red)
  { id: 'ban-right', layer: 0, poleX: 820, poleY: 15, poleH: 55, flagX: 824, flagY: 18, color: '#e5594a' },
  // Center High Keep Banner (Royal Gold)
  { id: 'ban-center', layer: 1, poleX: 500, poleY: -45, poleH: 45, flagX: 504, flagY: -42, color: '#e8a13a' },
];

export default function CastleBuild() {
  const filterId = useId().replace(/:/g, '');

  return (
    <svg
      viewBox="0 -50 1000 430"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="castle-svg h-auto max-h-[34vh] w-full max-w-3xl"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      <defs>
        <filter id={`window-glow-${filterId}`} x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#f4a261" floodOpacity="0.85" />
          <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor="#ffd166" floodOpacity="1" />
        </filter>
      </defs>

      {/* Layer 0: Background Towers & Distant Ramparts */}
      <g className="castle-layer castle-layer-0" data-layer="0">
        {CASTLE_BLOCKS.filter((b) => b.layer === 0).map((b) => (
          <rect
            key={b.id}
            data-block
            data-phase={b.phase}
            x={b.x}
            y={b.y}
            width={b.w}
            height={b.h}
            fill={b.fill}
          />
        ))}

        {CASTLE_WINDOWS.filter((w) => w.layer === 0).map((w) => (
          <rect
            key={w.id}
            data-window
            x={w.x}
            y={w.y}
            width={w.w}
            height={w.h}
            fill="#2e3440"
            className="castle-window"
          />
        ))}

        {CASTLE_BANNERS.filter((bn) => bn.layer === 0).map((bn) => (
          <g key={bn.id} data-banner className="castle-banner-group" style={{ transformOrigin: `${bn.poleX}px ${bn.poleY}px` }}>
            <rect x={bn.poleX} y={bn.poleY} width={4} height={bn.poleH} fill="#8892b0" />
            <polygon points={`${bn.flagX},${bn.flagY} ${bn.flagX + 28},${bn.flagY + 12} ${bn.flagX},${bn.flagY + 24}`} fill={bn.color} />
          </g>
        ))}
      </g>

      {/* Layer 1: Mid Keep & Main Castle Walls */}
      <g className="castle-layer castle-layer-1" data-layer="1">
        {CASTLE_BLOCKS.filter((b) => b.layer === 1).map((b) => (
          <rect
            key={b.id}
            data-block
            data-phase={b.phase}
            x={b.x}
            y={b.y}
            width={b.w}
            height={b.h}
            fill={b.fill}
          />
        ))}

        {CASTLE_WINDOWS.filter((w) => w.layer === 1).map((w) => (
          <rect
            key={w.id}
            data-window
            x={w.x}
            y={w.y}
            width={w.w}
            height={w.h}
            fill="#2e3440"
            className="castle-window"
          />
        ))}

        {CASTLE_BANNERS.filter((bn) => bn.layer === 1).map((bn) => (
          <g key={bn.id} data-banner className="castle-banner-group" style={{ transformOrigin: `${bn.poleX}px ${bn.poleY}px` }}>
            <rect x={bn.poleX} y={bn.poleY} width={4} height={bn.poleH} fill="#8892b0" />
            <polygon points={`${bn.flagX},${bn.flagY} ${bn.flagX + 34},${bn.flagY + 14} ${bn.flagX},${bn.flagY + 28}`} fill={bn.color} />
          </g>
        ))}
      </g>

      {/* Layer 2: Foreground Gatehouse & Outer Ramparts */}
      <g className="castle-layer castle-layer-2" data-layer="2">
        {CASTLE_BLOCKS.filter((b) => b.layer === 2).map((b) => (
          <rect
            key={b.id}
            data-block
            data-phase={b.phase}
            x={b.x}
            y={b.y}
            width={b.w}
            height={b.h}
            fill={b.fill}
          />
        ))}

        {/* Portcullis Grille Lines */}
        <g data-block data-phase={3} className="portcullis-grille">
          <line x1={482} y1={220} x2={482} y2={280} stroke="#4c566a" strokeWidth={3} />
          <line x1={495} y1={220} x2={495} y2={280} stroke="#4c566a" strokeWidth={3} />
          <line x1={508} y1={220} x2={508} y2={280} stroke="#4c566a" strokeWidth={3} />
          <line x1={520} y1={220} x2={520} y2={280} stroke="#4c566a" strokeWidth={3} />
          <line x1={470} y1={240} x2={530} y2={240} stroke="#4c566a" strokeWidth={3} />
          <line x1={470} y1={260} x2={530} y2={260} stroke="#4c566a" strokeWidth={3} />
        </g>

        {CASTLE_WINDOWS.filter((w) => w.layer === 2).map((w) => (
          <rect
            key={w.id}
            data-window
            x={w.x}
            y={w.y}
            width={w.w}
            height={w.h}
            fill="#2e3440"
            className="castle-window"
          />
        ))}
      </g>
    </svg>
  );
}
