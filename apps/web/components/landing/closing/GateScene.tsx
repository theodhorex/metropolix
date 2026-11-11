/**
 * The closing scene: the great gate of the realm (a bookend to the opening "gate opens" intro).
 * A stone wall with a stepped pixel arch, a portcullis that rises a little when the scene comes into
 * view and all the way while Play now is hovered or focused, a warm hall glowing behind it, and two
 * wall torches. One SVG on a 480x300 grid; every motion is a CSS transform/opacity (closing.css), so
 * there is no JS loop. Deterministic, so the server and the browser draw the same wall.
 */
const W = 480, H = 300;
const CX = 240, ARCH_R = 108, ARCH_Y = 162; // the arch: a half circle on two straight jambs
const STEP = 6;

/** The arch opening as a stepped polygon (pixel staircase on the curve). */
function archPoints() {
  // walk the curve from the crown down; the left side is then reversed so the outline runs
  // bottom-left -> up the left jamb -> over the crown -> down the right jamb -> bottom-right
  const left: string[] = [];
  const right: string[] = [];
  for (let y = ARCH_Y - ARCH_R; y < ARCH_Y; y += STEP) {
    const half = Math.max(STEP, Math.round(Math.sqrt(Math.max(0, ARCH_R * ARCH_R - (ARCH_Y - y - STEP) ** 2)) / STEP) * STEP);
    left.push(`${CX - half},${y}`, `${CX - half},${y + STEP}`);
    right.push(`${CX + half},${y}`, `${CX + half},${y + STEP}`);
  }
  return [`${CX - ARCH_R},${H}`, ...left.reverse(), ...right, `${CX + ARCH_R},${H}`].join(' ');
}
const ARCH = archPoints();

function rng(seed: number) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

/** Stone courses: rows of blocks with staggered joints; a few blocks get a lighter or darker face. */
const BLOCKS = (() => {
  const r = rng(5);
  const out: { x: number; y: number; w: number; tone: number }[] = [];
  for (let y = 24, row = 0; y < H; y += 12, row++) {
    let x = row % 2 ? -12 : 0;
    while (x < W) {
      const w = 24 + Math.floor(r() * 3) * 6;
      out.push({ x, y, w, tone: r() < 0.18 ? 1 : r() < 0.12 ? 2 : 0 });
      x += w;
    }
  }
  return out;
})();
const MERLONS = Array.from({ length: Math.ceil(W / 24) }, (_, i) => i * 24);

/** Portcullis: vertical bars every 16 units, cross bars every 28, spikes at the bottom. */
const BARS_X = Array.from({ length: 13 }, (_, i) => CX - ARCH_R + 14 + i * 16);
const CROSS_Y = Array.from({ length: 9 }, (_, i) => 56 + i * 28);
const BARS_BOTTOM = 300;

const TORCHES = [CX - ARCH_R - 46, CX + ARCH_R + 46];
const RAYS = Array.from({ length: 9 }, (_, i) => -64 + i * 16); // degrees, a fan from the hall

export default function GateScene({ className = '' }: { className?: string }) {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMin slice" shapeRendering="crispEdges" className={className} aria-hidden="true">
      <defs>
        <clipPath id="gate-opening"><polygon points={ARCH} /></clipPath>
        <radialGradient id="gate-hall" cx="50%" cy="62%" r="62%">
          <stop offset="0" stopColor="#ffe29a" />
          <stop offset=".35" stopColor="#f2a64a" />
          <stop offset=".75" stopColor="#6a2e18" />
          <stop offset="1" stopColor="#1c0c08" />
        </radialGradient>
        <radialGradient id="gate-torchglow" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#ffcf6a" stopOpacity=".55" />
          <stop offset="1" stopColor="#ffcf6a" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* the wall and its battlements */}
      <rect className="g-wall" x={0} y={24} width={W} height={H - 24} />
      {MERLONS.map((x) => <rect key={x} className="g-wall" x={x} y={12} width={14} height={12} />)}
      {BLOCKS.map((b, i) => (
        <rect key={i} className={b.tone === 1 ? 'g-block-hi' : b.tone === 2 ? 'g-block-lo' : 'g-block'} x={b.x + 1} y={b.y + 1} width={b.w - 2} height={10} />
      ))}

      {/* the hall behind the gate, then the portcullis, both clipped to the arch */}
      <g clipPath="url(#gate-opening)">
        <rect x={CX - ARCH_R} y={ARCH_Y - ARCH_R} width={ARCH_R * 2} height={H} fill="#1c0c08" />
        <rect x={CX - ARCH_R} y={ARCH_Y - ARCH_R} width={ARCH_R * 2} height={H} fill="url(#gate-hall)" className="g-hall" />
        <g className="g-rays">
          {RAYS.map((a) => (
            <polygon key={a} points={`${CX},${H - 40} ${CX - 7},0 ${CX + 7},0`} transform={`rotate(${a} ${CX} ${H - 40})`} />
          ))}
        </g>
        <g className="g-bars">
          {BARS_X.map((x) => (
            <g key={x}>
              <rect className="g-iron" x={x} y={ARCH_Y - ARCH_R - 10} width={4} height={BARS_BOTTOM - (ARCH_Y - ARCH_R - 10)} />
              <polygon className="g-iron" points={`${x - 1},${BARS_BOTTOM} ${x + 5},${BARS_BOTTOM} ${x + 2},${BARS_BOTTOM + 8}`} />
            </g>
          ))}
          {CROSS_Y.map((y) => <rect key={y} className="g-iron" x={CX - ARCH_R} y={y} width={ARCH_R * 2} height={3} />)}
        </g>
      </g>

      {/* the ring of voussoirs around the opening */}
      <polygon points={ARCH} className="g-ring" fill="none" strokeWidth={6} />
      <rect className="g-ring-fill" x={CX - 7} y={ARCH_Y - ARCH_R - 9} width={14} height={12} />

      {/* wall torches */}
      {TORCHES.map((x) => (
        <g key={x}>
          <circle cx={x} cy={150} r={40} fill="url(#gate-torchglow)" className="g-torchglow" />
          <rect className="g-iron" x={x - 3} y={160} width={6} height={18} />
          <rect className="g-iron" x={x - 6} y={156} width={12} height={4} />
          <g className="g-flame">
            <rect x={x - 5} y={140} width={10} height={16} fill="#f2a64a" />
            <rect x={x - 3} y={134} width={6} height={10} fill="#ffd56a" />
            <rect x={x - 1} y={130} width={2} height={6} fill="#fff1c2" />
          </g>
        </g>
      ))}
    </svg>
  );
}
