'use client';

import { useEffect, useRef } from 'react';
import { usePrefs } from '../prefs/store';
import { isLiteTier, isReducedMotion } from '../fx/tier';
import type { RealmSky as Sky } from './realm';
import './sky.css';

/**
 * The page-wide sky behind every section (see ./realm.ts). three.js loads after first paint; until then,
 * and for reduced motion or a browser without WebGL, a static gradient in the same colours stands in.
 */
export default function RealmSky() {
  const host = useRef<HTMLDivElement>(null);
  const sky = useRef<Sky | null>(null);
  const { theme } = usePrefs();
  const themeRef = useRef(theme);
  themeRef.current = theme;

  useEffect(() => {
    const el = host.current;
    if (!el || isReducedMotion()) return;
    let dead = false;
    const offs: (() => void)[] = [];

    const progress = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      return max > 0 ? scrollY / max : 0;
    };

    // start after the page is interactive so the sky never competes with first paint
    const start = () => import('./realm').then(({ createRealmSky }) => {
      if (dead) return;
      let s: Sky;
      try { s = createRealmSky(el, { lite: isLiteTier(), theme: themeRef.current }); }
      catch { return; } // no WebGL: the gradient stays
      sky.current = s;
      s.setProgress(progress());

      const onScroll = () => s.setProgress(progress());
      addEventListener('scroll', onScroll, { passive: true });
      offs.push(() => removeEventListener('scroll', onScroll));

      if (matchMedia('(pointer: fine)').matches) {
        const onMove = (e: PointerEvent) => s.setPointer(e.clientX / innerWidth, e.clientY / innerHeight);
        const onLeave = () => s.setPointer(null, 0);
        addEventListener('pointermove', onMove, { passive: true });
        document.documentElement.addEventListener('pointerleave', onLeave);
        offs.push(() => { removeEventListener('pointermove', onMove); document.documentElement.removeEventListener('pointerleave', onLeave); });
      }

      // the closing gate paints its own scene edge to edge: stop drawing the sky behind it
      const gate = document.getElementById('cta');
      if (gate) {
        const io = new IntersectionObserver(([e]) => s.setCovered(!!e && e.intersectionRatio > 0.97), { threshold: [0, 0.97, 1] });
        io.observe(gate);
        offs.push(() => io.disconnect());
      }
    });

    const idle = (window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback;
    if (idle) idle(() => void start(), { timeout: 1200 }); else setTimeout(() => void start(), 300);

    return () => {
      dead = true;
      offs.forEach((f) => f());
      sky.current?.dispose();
      sky.current = null;
    };
  }, []);

  useEffect(() => { sky.current?.setTheme(theme); }, [theme]);

  return (
    <div ref={host} className="realm-sky" aria-hidden="true">
      <div className="realm-sky-fallback" />
    </div>
  );
}
