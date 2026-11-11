'use client';

import { useEffect, useMemo, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * A section divider: two rows of pixel blocks in the next section's colour that fall into place
 * in a scattered order as the divider scrolls through the viewport, so one section hands over
 * to the next like tiles being laid. Under reduced motion the blocks are simply there.
 */
const COLS = 32;

// deterministic pseudo-random order so server and client render the same markup
function order(seed: number) {
  const idx = Array.from({ length: COLS * 2 }, (_, i) => i);
  let s = seed >>> 0;
  for (let i = idx.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) >>> 0;
    const j = s % (i + 1);
    [idx[i], idx[j]] = [idx[j]!, idx[i]!];
  }
  return idx;
}

export default function PixelWipe({ to = '#ffffff', from = 'transparent', seed = 7, height = 48 }: { to?: string; from?: string; seed?: number; height?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const rank = useMemo(() => {
    const o = order(seed);
    const r = new Array<number>(o.length);
    o.forEach((cell, i) => { r[cell] = i; });
    return r;
  }, [seed]);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      const blocks = gsap.utils.toArray<HTMLElement>('[data-px]', el).sort((a, b) => Number(a.dataset.px) - Number(b.dataset.px));
      gsap.fromTo(blocks,
        { yPercent: -140, opacity: 0 },
        { yPercent: 0, opacity: 1, ease: 'steps(3)', stagger: { each: 0.02 }, scrollTrigger: { trigger: el, start: 'top 95%', end: 'bottom 55%', scrub: 0.6 } });
    }, el);
    return () => ctx.revert();
  }, []);

  const row = (r: number) => (
    <div className="grid" style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)`, height: height / 2 }}>
      {Array.from({ length: COLS }, (_, c) => {
        const cell = r * COLS + c;
        // the lower row is solid; the upper row leaves gaps so the edge looks stepped
        const show = r === 1 || rank[cell]! % 3 !== 0;
        return <span key={c} data-px={show ? rank[cell] : undefined} style={{ background: show ? to : 'transparent' }} />;
      })}
    </div>
  );

  return (
    <div ref={ref} aria-hidden="true" className="relative w-full overflow-hidden" style={{ background: from }}>
      {row(0)}
      {row(1)}
    </div>
  );
}
