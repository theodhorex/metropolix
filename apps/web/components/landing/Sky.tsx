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

/** Tiny V-shaped bird on a 7x3 grid. */
const BIRD = 'M0 0h1v1H0zM6 0h1v1H6zM1 1h1v1H1zM5 1h1v1H5zM2 2h3v1H2z';
const BIRDS = [
  { top: '15%', size: 28, dur: 38, delay: -4 },
  { top: '21%', size: 20, dur: 46, delay: -19 },
  { top: '11%', size: 16, dur: 52, delay: -31 },
  { top: '27%', size: 14, dur: 60, delay: -8 },
] as const;

/** 10 frosted "map tiles"; the last four are left out on narrow screens. */
const GLASS = [
  { l: 6, t: 30, s: 54, d: 0, dur: 6 }, { l: 17, t: 58, s: 36, d: -2.2, dur: 7.5 }, { l: 29, t: 24, s: 28, d: -4, dur: 5.5 },
  { l: 72, t: 34, s: 60, d: -1, dur: 8 }, { l: 85, t: 62, s: 38, d: -3.4, dur: 6.5 }, { l: 92, t: 22, s: 26, d: -5.1, dur: 7 },
  { l: 40, t: 12, s: 22, d: -2.8, dur: 6 }, { l: 62, t: 52, s: 30, d: -0.6, dur: 9 }, { l: 12, t: 8, s: 24, d: -6, dur: 7.2 }, { l: 78, t: 10, s: 20, d: -3, dur: 5.8 },
] as const;

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
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(180deg,#dcebfb_0%,#eaf3fd_26%,#f7faff_44%,#fbfcfe_60%)]" />

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
            viewBox="0 0 7 3"
            shapeRendering="crispEdges"
            className="sky-bird absolute left-0"
            style={{ top: b.top, width: b.size, height: (b.size * 3) / 7, animationDuration: `${b.dur}s`, animationDelay: `${b.delay}s` }}
          >
            <path d={BIRD} fill="#475069" />
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
        <div className="absolute inset-x-0 bottom-[28%] h-[26%] bg-[linear-gradient(180deg,rgb(255_255_255/0),rgb(255_255_255/0.5))]" />
        {/* only the town shows; the rest of the map's grass melts away so the ranges stay visible */}
        <div className="hero-town absolute inset-0">{children}</div>
      </div>

      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        {GLASS.map((g, i) => (
          <span
            key={i}
            className={`hero-glass absolute ${i >= 6 ? 'hidden md:block' : i >= 3 ? 'hidden sm:block' : ''}`}
            style={{ left: `${g.l}%`, top: `${g.t + 34}%`, width: g.s, height: g.s, animationDelay: `${g.d}s`, animationDuration: `${g.dur}s` }}
          />
        ))}
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
