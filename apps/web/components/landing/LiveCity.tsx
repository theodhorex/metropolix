'use client';

import { useEffect, useRef } from 'react';
import type { ArcId, GameState, NewsItem } from '@metropolix/sim';
import { CityRenderer } from '@/lib/renderer';
import { showcasePlan, createShowcase, fullCity, growStep, idleStep } from '@/lib/landing-city';

const GROW_MS = 450;  // one new building every 0.45 s while the town goes up
const HEAD_START = 0.35; // share of the town already standing on the first frame, so the island never shows up bare
const IDLE_MS = 1000; // afterwards the world just keeps living
const NARROW_PX = 768;
const WIDE_PX = 1024;

// The showcase town covers tiles 14..25 (see showcasePlan in lib/landing-city.ts); the island keeps one tile of meadow around it.
const ISLAND = { x0: 13, y0: 13, x1: 26, y1: 26 } as const;
// night grading for the island (multiplied into every sprite, free on the GPU)
const NIGHT_TINT = 0xb6c0ea;

/**
 * The real game as a floating island in the hero's sky (a see-through canvas): a city that builds itself,
 * drawn by the game's own renderer from the game's own simulation, on the game's own isometric map. It never reads or writes the player's save and never takes the page's scroll
 * or clicks (the host has pointer-events: none).
 */
export default function LiveCity({ arc, onNews, className = '' }: { arc: ArcId; onNews?: (items: NewsItem[]) => void; className?: string }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const arcRef = useRef(arc);
  const newsRef = useRef(onNews);
  const rebuildRef = useRef<((a: ArcId) => void) | null>(null);

  useEffect(() => { newsRef.current = onNews; }, [onNews]);

  useEffect(() => {
    const host = hostRef.current!;
    const r = new CityRenderer({ transparent: true, island: ISLAND });
    const narrow = () => host.clientWidth < NARROW_PX;
    let lite = narrow();
    r.setArc(arcRef.current);
    r.setQuality(lite ? 'lite' : 'auto');

    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let reduced = motion.matches;
    let s: GameState | null = null;
    let i = 0;
    let plan = showcasePlan(arcRef.current);
    let lastNews = -1;
    let ready = false;
    let cancelled = false;
    let onScreen = true;
    let timer = 0;
    let settle = 0;

    /** Fit the whole island (buildings, cliff and drifting rocks) inside the host. */
    const frame = () => {
      const w = host.clientWidth, h = host.clientHeight;
      const b = r.islandBounds();
      if (w === 0 || h === 0 || !b) return;
      const k = Math.min(w / b.w, h / b.h) * (w >= WIDE_PX ? 0.98 : 0.96);
      r.setView(b.x + b.w / 2, b.y + b.h / 2, k);
    };

    /** Day or night grading, following the landing's theme switch. */
    const main = host.closest('main');
    const grade = () => { if (ready) r.setTint(main?.dataset.theme === 'dark' ? NIGHT_TINT : 0xffffff); };
    const themeObs = new MutationObserver(grade);
    if (main) themeObs.observe(main, { attributes: true, attributeFilter: ['data-theme'] });

    /** Reduced motion keeps the canvas still: let it paint a moment, then stop the ticker. */
    const pulse = () => {
      r.setPaused(false);
      window.clearTimeout(settle);
      settle = window.setTimeout(() => { if (reduced) r.setPaused(true); }, 400);
    };

    const emitNews = () => {
      const top = s?.world.news[0];
      if (!s || !top || top.id === lastNews) return;
      lastNews = top.id;
      newsRef.current?.(s.world.news.slice(0, 6));
    };

    const tick = () => {
      if (!s) return;
      if (i < plan.length) {
        i = growStep(s, plan, i);
        if (i >= plan.length) sync(); // town finished: slow the clock to the idle pace
      } else {
        idleStep(s);
      }
      r.draw(s);
      emitNews();
    };

    /** Run only while the hero is on screen and the tab is visible; otherwise stop the timer and the renderer. */
    function sync() {
      window.clearInterval(timer);
      timer = 0;
      if (!ready || reduced) return;
      const on = onScreen && !document.hidden;
      r.setPaused(!on);
      if (on) timer = window.setInterval(tick, i < plan.length ? GROW_MS : IDLE_MS);
    }

    const rebuild = (a: ArcId) => {
      plan = showcasePlan(a);
      reduced = motion.matches;
      r.setArc(a);
      lastNews = -1;
      if (reduced) {
        s = fullCity(a);
        i = plan.length;
        r.draw(s);
        emitNews();
        window.clearInterval(timer);
        timer = 0;
        pulse();
        return;
      }
      s = createShowcase(a);
      i = 0;
      const head = Math.floor(plan.length * HEAD_START);
      while (i < head) i = growStep(s, plan, i);
      r.setPaused(false);
      tick(); // draw the head start (and the next building) straight away
      sync();
    };

    r.init(host).then(() => {
      if (cancelled) return;
      ready = true;
      frame();
      grade();
      rebuild(arcRef.current);
    }, () => { /* no WebGL: the hero keeps its painted sky and landscape and the text still works */ });
    rebuildRef.current = (a) => { if (ready) rebuild(a); };

    const onVisibility = () => sync();
    document.addEventListener('visibilitychange', onVisibility);
    const onMotion = () => { if (ready) rebuild(arcRef.current); };
    motion.addEventListener('change', onMotion);

    const io = new IntersectionObserver(([e]) => { onScreen = !!e?.isIntersecting; sync(); });
    io.observe(host);

    const ro = new ResizeObserver(() => {
      if (!ready) return;
      const nowLite = narrow();
      if (nowLite !== lite) { lite = nowLite; r.setQuality(lite ? 'lite' : 'auto'); }
      frame();
      // Pixi follows window resizes only. When the hero itself changes size (fonts, wrapping), nudge it.
      const canvas = host.firstElementChild as HTMLElement | null;
      if (canvas && Math.abs(canvas.clientHeight - host.clientHeight) > 1) window.dispatchEvent(new Event('resize'));
      if (reduced) pulse();
    });
    ro.observe(host);

    return () => {
      cancelled = true;
      ready = false;
      rebuildRef.current = null;
      window.clearInterval(timer);
      window.clearTimeout(settle);
      document.removeEventListener('visibilitychange', onVisibility);
      motion.removeEventListener('change', onMotion);
      io.disconnect();
      ro.disconnect();
      themeObs.disconnect();
      r.destroy();
    };
  }, []);

  useEffect(() => {
    arcRef.current = arc;
    rebuildRef.current?.(arc);
  }, [arc]);

  return <div ref={hostRef} aria-hidden="true" className={`pointer-events-none absolute inset-0 overflow-hidden [&>canvas]:block ${className}`} />;
}
