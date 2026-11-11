import type { CSSProperties } from 'react';
import type { ArcId } from '@metropolix/sim';

/*
  The hero's own art, all pixel shapes drawn as SVG rects/paths (crispEdges) and CSS motion only.
  Everything is deterministic (integer maths, no Math.random) so the server and the browser agree.
  Ambient motion classes live in hero.css, which also switches them off for prefers-reduced-motion.
*/

/** Integer triangle wave: 0..p/2..0. */
const tri = (x: number, p: number) => Math.abs((((x % p) + p) % p) - p / 2);

/** A stepped skyline as one path: `cols` columns of 16 units, each `base + waves` high (snapped to 16). */
function ridge(cols: number, vbH: number, base: number, a: number, pa: number, oa: number, b: number, pb: number, ob: number): string {
  let d = `M0 ${vbH}`;
  let prev = -1;
  for (let i = 0; i < cols; i++) {
    const h = Math.round((base + (a * tri(i + oa, pa)) / (pa / 2) + (b * tri(i + ob, pb)) / (pb / 2)) / 16) * 16;
    if (h !== prev) d += `V${vbH - h}`;
    d += `H${(i + 1) * 16}`;
    prev = h;
  }
  return `${d}V${vbH}Z`;
}

const VB_W = 1600;
const VB_H = 360;
const COLS = VB_W / 16;
// rich, saturated ranges: distant violet-blue, a deeper blue range, then a green-teal near ridge
const RANGES = [
  { fill: '#9db4f0', d: ridge(COLS, VB_H, 150, 70, 44, 6, 40, 18, 3) },  // farthest
  { fill: '#7393e0', d: ridge(COLS, VB_H, 112, 64, 34, 21, 30, 14, 9) },
  { fill: '#4f7fc9', d: ridge(COLS, VB_H, 78, 50, 28, 13, 22, 10, 5) },  // nearest range
];
/** Falling pixels coloured by the chosen people (elf leaves, lizard spice, ash, embers, sparks). */
const PARTICLE_COLORS: Record<ArcId, readonly string[]> = {
  elf: ['#5fc07a', '#8fdc9a', '#3f9f5f'],
  lizard: ['#e8892a', '#f2a64a', '#d96f1c'],
  caveman: ['#8a8d94', '#b4b6bb', '#6d7077'],
  dragon: ['#e5483a', '#f26a3d', '#c0322a'],
  goblin: ['#a6d63a', '#c4ea5a', '#86b82a'],
};
const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  left: (i * 37 + 11) % 100,
  size: 3 + ((i * 5) % 3), // 3 to 5 px
  dx: ((i * 29) % 61) - 30,
  dur: 9 + ((i * 7) % 8),
  delay: -((i * 13) % 17),
  tone: i % 3,
}));

/**
 * The hero backdrop under the page-wide sky (./sky/RealmSky): three distant mountain ranges sinking into
 * mist, and falling pixels in the chosen people's colours. The live city floats in front as an island
 * (see LiveCity and the island option of the game renderer).
 */
export default function Sky({ arc }: { arc: ArcId }) {
  const colors = PARTICLE_COLORS[arc];
  return (
    <>
      <div className="hero-land hero-ranges pointer-events-none absolute inset-x-0 bottom-0 h-[46%]" aria-hidden="true">
        <svg viewBox={`0 0 ${VB_W} ${VB_H}`} preserveAspectRatio="xMidYMax slice" shapeRendering="crispEdges" className="absolute inset-0 h-full w-full" style={{ imageRendering: 'pixelated' }}>
          {RANGES.map((r, i) => (
            <path key={i} d={r.d} fill={r.fill} />
          ))}
        </svg>
        {/* the valleys below are lost in mist */}
        <div className="hero-haze absolute inset-x-0 bottom-0 h-[60%]" />
      </div>

      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        {PARTICLES.map((p, i) => (
          <span
            key={i}
            className="hero-fall absolute top-0"
            style={{
              left: `${p.left}%`,
              width: p.size,
              height: p.size,
              background: colors[p.tone],
              animationDuration: `${p.dur}s`,
              animationDelay: `${p.delay}s`,
              '--dx': `${p.dx}px`,
            } as CSSProperties}
          />
        ))}
      </div>
    </>
  );
}
