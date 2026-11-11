import type { CSSProperties, ReactNode } from 'react';
import type { ArcId } from '@metropolix/sim';

/*
  The hero's own art, all pixel shapes drawn as SVG rects/paths (crispEdges) and CSS motion only.
  Everything is deterministic (integer maths, no Math.random) so the server and the browser agree.
  Ambient motion classes live in hero.css, which also switches them off for prefers-reduced-motion.
*/

const PX = 8; // the cloud grid

/** Cloud silhouette as per-row column spans on the 8px grid (top row first). */
const CLOUD_ROWS: readonly (readonly [number, number][])[] = [
  [[10, 15], [21, 28]],
  [[8, 17], [19, 31]],
  [[6, 34]],
  [[3, 37]],
  [[1, 39]],
  [[0, 40]],
  [[0, 40]],
  [[2, 38]],
  [[5, 34]],
  [[10, 28]],
];
/** Sunset shading per row: orange tops, cream middle, lilac underside. */
const CLOUD_TONES = ['#f4925a', '#f7a870', '#fbc99b', '#fddcb8', '#fff1dc', '#fff8ec', '#fff3e6', '#eadcf2', '#d6c3ec', '#bfa9e0'];

function Cloud({ className, flip = false }: { className: string; flip?: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox={`0 0 ${40 * PX} ${CLOUD_ROWS.length * PX}`}
      className={`${className} ${flip ? '-scale-x-100' : ''}`}
      shapeRendering="crispEdges"
      style={{ imageRendering: 'pixelated' }}
    >
      {CLOUD_ROWS.flatMap((spans, r) =>
        spans.map(([a, b]) => <rect key={`${r}-${a}`} x={a * PX} y={r * PX} width={(b - a) * PX} height={PX} fill={CLOUD_TONES[r]} />),
      )}
    </svg>
  );
}

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
const RANGES = [
  { fill: '#d7e3f6', d: ridge(COLS, VB_H, 150, 70, 44, 6, 40, 18, 3) },  // farthest, palest
  { fill: '#bfd2f0', d: ridge(COLS, VB_H, 112, 64, 34, 21, 30, 14, 9) },
  { fill: '#a8c1e8', d: ridge(COLS, VB_H, 78, 50, 28, 13, 22, 10, 5) },  // nearest range
];
const HILL_BACK = ridge(COLS, VB_H, 36, 22, 60, 12, 8, 16, 2);
const HILL_FRONT = ridge(COLS, VB_H, 18, 16, 46, 30, 6, 12, 7);

/** Tiny pixel gull on a 9x3 grid, two frames: wings up (an "m" with a body) and wings down. */
const BIRD_UP = 'M1 0h2v1H1zM6 0h2v1H6zM0 1h1v1H0zM3 1h1v1H3zM5 1h1v1H5zM8 1h1v1H8zM4 2h1v1H4z';
const BIRD_DOWN = 'M4 0h1v1H4zM1 1h2v1H1zM4 1h1v1H4zM6 1h2v1H6zM0 2h1v1H0zM8 2h1v1H8z';
const BIRDS = [
  { top: '15%', size: 28, dur: 38, delay: -4 },
  { top: '21%', size: 20, dur: 46, delay: -19 },
  { top: '11%', size: 16, dur: 52, delay: -31 },
  { top: '27%', size: 14, dur: 60, delay: -8 },
] as const;

/** Night sky: deterministic pixel stars over the top half, and a 12x12 pixel moon. */
const STARS = Array.from({ length: 42 }, (_, i) => ({
  l: (i * 47 + 7) % 100,
  t: ((i * 31 + 3) % 52) + 2,
  s: i % 5 === 0 ? 3 : 2,
  d: -((i * 11) % 9),
}));
const MOON = 'M4 0h4v1h2v1h1v2h1v4h-1v2h-1v1h-2v1h-4v-1h-2v-1h-1v-2h-1v-4h1v-2h1v-1h2z';
const MOON_SHADE = 'M3 3h2v2h-2zM7 6h2v2h-2zM4 8h1v1h-1z';

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
 * The hero backdrop: pale sky, two sunset pixel clouds, birds, then the landscape block (three mountain
 * ranges, a hill band, and `children`, the live city) faded into the sky, with frosted tiles and falling
 * pixels over everything. Pass the live city as children.
 */
export default function Sky({ arc, children }: { arc: ArcId; children: ReactNode }) {
  const colors = PARTICLE_COLORS[arc];
  return (
    <>
      <div aria-hidden="true" className="hero-sky pointer-events-none absolute inset-0 -z-10" />
      {/* night only (dark theme): pixel stars and a pixel moon */}
      <div aria-hidden="true" className="hero-night pointer-events-none absolute inset-0 -z-10">
        {STARS.map((st, i) => (
          <span key={i} className="hero-star absolute" style={{ left: `${st.l}%`, top: `${st.t}%`, width: st.s, height: st.s, animationDelay: `${st.d}s` }} />
        ))}
        <svg viewBox="0 0 12 12" shapeRendering="crispEdges" className="hero-moon absolute" aria-hidden="true">
          <path d={MOON} fill="#f6efd6" />
          <path d={MOON_SHADE} fill="#d9cfae" />
        </svg>
      </div>

      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="sky-drift-a absolute top-3 -left-12 w-[min(62vw,560px)] sm:-left-6">
          <Cloud className="block w-full h-auto" />
        </div>
        <div className="sky-drift-b absolute top-8 -right-14 w-[min(54vw,500px)] sm:-right-8">
          <Cloud className="block w-full h-auto" flip />
        </div>
        {BIRDS.map((b, i) => (
          <svg
            key={i}
            viewBox="0 0 9 3"
            shapeRendering="crispEdges"
            className="sky-bird absolute left-0"
            style={{ top: b.top, width: b.size, height: (b.size * 3) / 9, animationDuration: `${b.dur}s`, animationDelay: `${b.delay}s` }}
          >
            <path className="bird-up" d={BIRD_UP} fill="#475069" style={{ animationDelay: `${i * -0.13}s` }} />
            <path className="bird-down" d={BIRD_DOWN} fill="#475069" style={{ animationDelay: `${i * -0.13}s` }} />
          </svg>
        ))}
      </div>

      {/* the landscape: ranges and hills sit behind the city; the top fades into the sky */}
      <div className="hero-land pointer-events-none absolute inset-x-0 bottom-0 h-[58%] sm:h-[60%]" aria-hidden="true">
        <svg viewBox={`0 0 ${VB_W} ${VB_H}`} preserveAspectRatio="xMidYMax slice" shapeRendering="crispEdges" className="absolute inset-x-0 bottom-[14%] h-[78%] w-full" style={{ imageRendering: 'pixelated' }}>
          {RANGES.map((r, i) => (
            <path key={i} d={r.d} fill={r.fill} />
          ))}
          <path d={HILL_BACK} fill="#bfe0a6" />
        </svg>
        <svg viewBox={`0 0 ${VB_W} ${VB_H}`} preserveAspectRatio="xMidYMax slice" shapeRendering="crispEdges" className="absolute inset-x-0 bottom-0 h-[34%] w-full" style={{ imageRendering: 'pixelated' }}>
          <path d={HILL_FRONT} fill="#a6d98f" />
        </svg>
        {/* a breath of haze over the far ranges */}
        <div className="hero-haze absolute inset-x-0 bottom-[28%] h-[26%]" />
        {/* only the town shows; the rest of the map's grass melts away so the ranges stay visible */}
        <div className="hero-town absolute inset-0">{children}</div>
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
