'use client';

import { useEffect, useRef, type ReactNode } from 'react';

/**
 * The realm on the horizon at the very bottom of the page: a fantasy silhouette (a castle with
 * cone-roofed towers and banners in the middle, steep-roofed cottages, timber houses, a windmill,
 * round trees and pines), whose few small windows light up one by one when it scrolls into view,
 * and a lamplighter who walks along the road. One SVG, CSS-only motion, paused offscreen.
 * Deterministic (seeded), so the server and the browser draw the same skyline.
 */
const W = 960, H = 84, G = H - 4; // G: the ground line

function rng(seed: number) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

type Win = { x: number; y: number; w?: number; h?: number };
interface Piece { key: string; nodes: ReactNode[]; wins: Win[] }

const roof = (x: number, w: number, y: number, h: number, k: string) => (
  <polygon key={k} className="hz-roof" points={`${x - 2},${y} ${x + w / 2},${y - h} ${x + w + 2},${y}`} />
);

function cottage(x: number, r: () => number, i: number): [Piece, number] {
  const w = 16 + Math.floor(r() * 3) * 4, h = 10 + Math.floor(r() * 2) * 3;
  const top = G - h;
  const nodes: ReactNode[] = [
    <rect key="w" className="hz-wall" x={x} y={top} width={w} height={h} />,
    roof(x, w, top, Math.round(w * 0.62), 'r'),
  ];
  if (r() < 0.6) nodes.push(<rect key="c" className="hz-wall" x={x + w - 6} y={top - 9} width={3} height={7} />);
  const wins: Win[] = [{ x: x + 3, y: top + 3, w: 3, h: 3 }];
  if (w > 18) wins.push({ x: x + w - 6, y: top + 3, w: 3, h: 3 });
  return [{ key: `c${i}`, nodes, wins }, w];
}

function timber(x: number, r: () => number, i: number): [Piece, number] {
  const w = 18 + Math.floor(r() * 2) * 4;
  const lowH = 10, upH = 9;
  const nodes: ReactNode[] = [
    <rect key="l" className="hz-wall" x={x} y={G - lowH} width={w} height={lowH} />,
    <rect key="u" className="hz-wall" x={x - 2} y={G - lowH - upH} width={w + 4} height={upH} />,
    roof(x - 2, w + 4, G - lowH - upH, Math.round(w * 0.7), 'r'),
  ];
  const wins: Win[] = [
    { x: x + 3, y: G - lowH - upH + 3, w: 3, h: 3 },
    { x: x + w - 6, y: G - lowH - upH + 3, w: 3, h: 3 },
    { x: x + Math.floor(w / 2) - 1, y: G - lowH + 3, w: 3, h: 4 },
  ];
  return [{ key: `t${i}`, nodes, wins }, w + 2];
}

function tower(x: number, r: () => number, i: number, tall = 0): [Piece, number] {
  const w = 10 + Math.floor(r() * 2) * 2, h = 26 + tall + Math.floor(r() * 3) * 4;
  const top = G - h;
  const nodes: ReactNode[] = [
    <rect key="w" className="hz-wall" x={x} y={top} width={w} height={h} />,
    <polygon key="r" className="hz-roof" points={`${x - 2},${top} ${x + w / 2},${top - 16} ${x + w + 2},${top}`} />,
    <rect key="p" className="hz-wall" x={x + w / 2 - 0.5} y={top - 22} width={1} height={7} />,
    <polygon key="f" className="hz-flag" points={`${x + w / 2 + 0.5},${top - 22} ${x + w / 2 + 6},${top - 20} ${x + w / 2 + 0.5},${top - 18}`} />,
  ];
  return [{ key: `w${i}`, nodes, wins: [{ x: x + w / 2 - 1, y: top + 6, w: 2, h: 4 }, { x: x + w / 2 - 1, y: top + 16, w: 2, h: 4 }] }, w];
}

function tree(x: number, r: () => number, i: number): [Piece, number] {
  const pine = r() < 0.45;
  const nodes: ReactNode[] = pine
    ? [
      <polygon key="a" className="hz-tree" points={`${x},${G - 4} ${x + 5},${G - 20} ${x + 10},${G - 4}`} />,
      <polygon key="b" className="hz-tree" points={`${x + 1},${G - 12} ${x + 5},${G - 26} ${x + 9},${G - 12}`} />,
      <rect key="t" className="hz-tree" x={x + 4} y={G - 4} width={2} height={4} />,
    ]
    : [
      <rect key="t" className="hz-tree" x={x + 5} y={G - 7} width={3} height={7} />,
      <rect key="a" className="hz-tree" x={x} y={G - 17} width={13} height={10} />,
      <rect key="b" className="hz-tree" x={x + 2} y={G - 20} width={9} height={3} />,
    ];
  return [{ key: `e${i}`, nodes, wins: [] }, pine ? 10 : 13];
}

function windmill(x: number, i: number): [Piece, number] {
  const cx = x + 8, top = G - 26;
  const nodes: ReactNode[] = [
    <polygon key="b" className="hz-wall" points={`${x + 2},${G} ${x + 5},${top} ${x + 11},${top} ${x + 14},${G}`} />,
    <polygon key="r" className="hz-roof" points={`${x + 3},${top} ${cx},${top - 6} ${x + 13},${top}`} />,
    <g key="s" className="hz-sails" style={{ transformOrigin: `${cx}px ${top - 1}px` }}>
      <rect className="hz-wall" x={cx - 0.5} y={top - 15} width={1} height={28} />
      <rect className="hz-wall" x={cx - 14} y={top - 1.5} width={28} height={1} />
      <rect className="hz-wall" x={cx + 0.5} y={top - 15} width={3} height={11} />
      <rect className="hz-wall" x={cx - 3.5} y={top + 2} width={3} height={11} />
      <rect className="hz-wall" x={cx - 14} y={top - 4.5} width={11} height={3} />
      <rect className="hz-wall" x={cx + 3} y={top + 0.5} width={11} height={3} />
    </g>,
  ];
  return [{ key: `m${i}`, nodes, wins: [{ x: cx - 1, y: G - 10, w: 2, h: 3 }] }, 16];
}

function castle(x: number): [Piece, number] {
  const w = 120, wallH = 18, top = G - wallH;
  const nodes: ReactNode[] = [<rect key="wall" className="hz-wall" x={x} y={top} width={w} height={wallH} />];
  for (let mx = x; mx < x + w; mx += 6) nodes.push(<rect key={`m${mx}`} className="hz-wall" x={mx} y={top - 3} width={4} height={3} />);
  const wins: Win[] = [];
  // flanking towers
  for (const [tx, th] of [[x - 4, 34], [x + w - 10, 34], [x + 26, 28], [x + w - 40, 28]] as const) {
    const tTop = G - th;
    nodes.push(
      <rect key={`t${tx}`} className="hz-wall" x={tx} y={tTop} width={14} height={th} />,
      <polygon key={`r${tx}`} className="hz-roof" points={`${tx - 2},${tTop} ${tx + 7},${tTop - 15} ${tx + 16},${tTop}`} />,
      <rect key={`p${tx}`} className="hz-wall" x={tx + 6.5} y={tTop - 21} width={1} height={7} />,
      <polygon key={`f${tx}`} className="hz-flag" points={`${tx + 7.5},${tTop - 21} ${tx + 13},${tTop - 19} ${tx + 7.5},${tTop - 17}`} />,
    );
    wins.push({ x: tx + 6, y: tTop + 7, w: 2, h: 4 });
  }
  // the keep
  const kx = x + w / 2 - 15, kTop = G - 52;
  nodes.push(<rect key="keep" className="hz-wall" x={kx} y={kTop} width={30} height={52} />);
  for (let mx = kx; mx < kx + 30; mx += 6) nodes.push(<rect key={`km${mx}`} className="hz-wall" x={mx} y={kTop - 3} width={4} height={3} />);
  nodes.push(
    <rect key="kp" className="hz-wall" x={kx + 14.5} y={kTop - 16} width={1} height={13} />,
    <polygon key="kf" className="hz-flag hz-banner" points={`${kx + 15.5},${kTop - 16} ${kx + 25},${kTop - 13} ${kx + 15.5},${kTop - 10}`} />,
    <path key="gate" className="hz-gate" d={`M${x + w / 2 - 5} ${G}v-8h2v-2h6v2h2v8z`} />,
  );
  wins.push({ x: kx + 6, y: kTop + 10, w: 3, h: 5 }, { x: kx + 21, y: kTop + 10, w: 3, h: 5 }, { x: kx + 13, y: kTop + 24, w: 4, h: 6 });
  return [{ key: 'castle', nodes, wins }, w + 6];
}

const SKY = (() => {
  const r = rng(73);
  const pieces: Piece[] = [];
  let x = -4, i = 0, mills = 0, castled = false;
  while (x < W) {
    if (!castled && x > W / 2 - 80) {
      x += 8;
      const [p, w] = castle(x); pieces.push(p); x += w + 8; castled = true; continue;
    }
    const roll = r();
    let made: [Piece, number];
    if (roll < 0.34) made = cottage(x, r, i);
    else if (roll < 0.52) made = timber(x, r, i);
    else if (roll < 0.76) made = tree(x, r, i);
    else if (roll < 0.9) made = tower(x, r, i);
    else if (mills < 2) { made = windmill(x, i); mills++; }
    else made = cottage(x, r, i);
    pieces.push(made[0]);
    x += made[1] + (r() < 0.35 ? 2 + Math.floor(r() * 3) * 3 : 1);
    i++;
  }
  return pieces;
})();

export default function Horizon() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      const on = !!e?.isIntersecting;
      el.toggleAttribute('data-offscreen', !on);
      if (on) el.setAttribute('data-lit', '');
    }, { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  let n = 0;
  return (
    <div ref={ref} className="horizon" aria-hidden="true">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMax slice" shapeRendering="crispEdges">
        {SKY.map((p) => <g key={p.key}>{p.nodes}</g>)}
        <rect className="hz-wall" x={0} y={G} width={W} height={H - G} />
        {SKY.flatMap((p) => p.wins).map((w, i) => (
          <rect key={i} className="hz-win" x={w.x} y={w.y} width={w.w ?? 3} height={w.h ?? 3} style={{ transitionDelay: `${(((n++ * 37) % 97) / 97 * 2.6).toFixed(2)}s` }} />
        ))}
      </svg>
      <span className="hz-lighter" />
    </div>
  );
}
