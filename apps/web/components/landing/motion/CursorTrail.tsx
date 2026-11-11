'use client';

import { useEffect, useRef } from 'react';

/**
 * A trail of tiny pixel sparkles behind the mouse, in the landing's accent colour.
 * One fixed canvas, at most MAX particles, nothing on touch screens or under reduced motion.
 */
const MAX = 42;

interface P { x: number; y: number; vx: number; vy: number; life: number; size: number }

export default function CursorTrail() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const fine = window.matchMedia('(pointer: fine)').matches;
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!fine || still) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const parts: P[] = [];
    let raf = 0, running = false, lastX = -1, lastY = -1;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const fit = () => {
      canvas.width = Math.round(innerWidth * dpr);
      canvas.height = Math.round(innerHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = false;
    };
    fit();

    const accent = () => {
      const main = document.querySelector<HTMLElement>('main[data-page="landing"]');
      const v = main ? getComputedStyle(main).getPropertyValue('--landing-accent').trim() : '';
      return v || '#f2c14e';
    };
    let colour = accent();
    const recolour = window.setInterval(() => { colour = accent(); }, 600);

    const frame = () => {
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i]!;
        p.x += p.vx; p.y += p.vy; p.vy += 0.06; p.life -= 0.028;
        if (p.life <= 0) { parts.splice(i, 1); continue; }
        ctx.globalAlpha = p.life;
        ctx.fillStyle = colour;
        // snap to whole pixels so the sparkles stay crisp
        ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size);
        if (p.size > 2) { ctx.fillStyle = '#fff'; ctx.fillRect(Math.round(p.x), Math.round(p.y), 1, 1); }
      }
      ctx.globalAlpha = 1;
      if (parts.length) raf = requestAnimationFrame(frame);
      else running = false;
    };
    const kick = () => { if (!running && !document.hidden) { running = true; raf = requestAnimationFrame(frame); } };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      const dx = e.clientX - lastX, dy = e.clientY - lastY;
      lastX = e.clientX; lastY = e.clientY;
      if (dx * dx + dy * dy < 36) return; // only while the cursor really travels
      if (parts.length >= MAX) parts.shift();
      parts.push({ x: e.clientX, y: e.clientY, vx: (Math.random() - 0.5) * 1.2, vy: -Math.random() * 1.1, life: 1, size: Math.random() < 0.35 ? 4 : Math.random() < 0.5 ? 3 : 2 });
      kick();
    };
    const onHide = () => { if (document.hidden) { cancelAnimationFrame(raf); running = false; parts.length = 0; ctx.clearRect(0, 0, innerWidth, innerHeight); } };

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('resize', fit);
    document.addEventListener('visibilitychange', onHide);
    return () => {
      cancelAnimationFrame(raf);
      clearInterval(recolour);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('resize', fit);
      document.removeEventListener('visibilitychange', onHide);
    };
  }, []);

  return <canvas ref={ref} aria-hidden="true" className="pointer-events-none fixed inset-0 z-[60] h-full w-full" />;
}
