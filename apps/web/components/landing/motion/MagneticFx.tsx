'use client';

import { useEffect } from 'react';
import gsap from 'gsap';

/**
 * Buttons that lean toward the mouse. Applies to every [data-magnetic] element and every
 * link to /play on the landing page; re-scans when sections mount new buttons.
 * Desktop pointer only, nothing under reduced motion. Renders nothing.
 */
const RANGE = 80; // px around the element where the pull starts
const PULL = 10; // max px the element moves

interface Bound { el: HTMLElement; x: (v: number) => void; y: (v: number) => void; off: () => void }

export default function MagneticFx() {
  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)').matches;
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const root = document.querySelector<HTMLElement>('main[data-page="landing"]');
    if (!fine || still || !root) return;

    const bound = new Map<HTMLElement, Bound>();

    const bind = (el: HTMLElement) => {
      if (bound.has(el)) return;
      const x = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3.out' });
      const y = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3.out' });
      const down = () => gsap.to(el, { scale: 0.95, duration: 0.08, ease: 'steps(2)' });
      const up = () => gsap.to(el, { scale: 1, duration: 0.35, ease: 'back.out(3)' });
      el.addEventListener('pointerdown', down);
      el.addEventListener('pointerup', up);
      el.addEventListener('pointerleave', up);
      bound.set(el, { el, x, y, off: () => {
        el.removeEventListener('pointerdown', down);
        el.removeEventListener('pointerup', up);
        el.removeEventListener('pointerleave', up);
        gsap.set(el, { clearProps: 'x,y,scale' });
      } });
    };

    const scan = () => {
      root.querySelectorAll<HTMLElement>('[data-magnetic], a[href="/play"]').forEach(bind);
      for (const [el, b] of bound) if (!el.isConnected) { b.off(); bound.delete(el); }
    };
    scan();

    let pending = 0;
    const mo = new MutationObserver(() => { clearTimeout(pending); pending = window.setTimeout(scan, 250); });
    mo.observe(root, { childList: true, subtree: true });

    let raf = 0, mx = -1e4, my = -1e4;
    const tick = () => {
      raf = 0;
      for (const b of bound.values()) {
        const r = b.el.getBoundingClientRect();
        if (r.bottom < -RANGE || r.top > innerHeight + RANGE) continue;
        const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        const dx = mx - cx, dy = my - cy;
        const reach = Math.max(r.width, r.height) / 2 + RANGE;
        const d = Math.hypot(dx, dy);
        if (d < reach) {
          const k = (1 - d / reach) * PULL;
          b.x((dx / (d || 1)) * k);
          b.y((dy / (d || 1)) * k);
        } else { b.x(0); b.y(0); }
      }
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      mx = e.clientX; my = e.clientY;
      if (!raf) raf = requestAnimationFrame(tick);
    };
    window.addEventListener('pointermove', onMove, { passive: true });

    return () => {
      window.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(raf);
      clearTimeout(pending);
      mo.disconnect();
      for (const b of bound.values()) b.off();
      bound.clear();
    };
  }, []);

  return null;
}
