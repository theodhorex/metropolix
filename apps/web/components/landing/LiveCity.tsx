'use client';

import { useEffect, useRef } from 'react';
import type { ArcId, GameState, NewsItem } from '@metropolix/sim';
import { CityRenderer } from '@/lib/renderer';
import { SHOWCASE_PLAN, createShowcase, fullCity, growStep, idleStep } from '@/lib/landing-city';

const GROW_MS = 600;  // one new building every 0.6 s while the town goes up
const IDLE_MS = 1000; // afterwards the world just keeps living
const NARROW_PX = 768;
const WIDE_PX = 1024;

// The showcase town in world pixels (see SHOWCASE_PLAN: tiles 14..25), used to frame the camera.
const TOWN_W = 780;
const TOWN_H = 480;
const TOWN_CY = 590;

/**
 * The real game as the hero's valley (a see-through canvas over the painted landscape): a city that builds itself, drawn by the game's own renderer from the
 * game's own simulation. It never reads or writes the player's save and never takes the page's scroll
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
    const r = new CityRenderer({ transparent: true });
    const narrow = () => host.clientWidth < NARROW_PX;
    let lite = narrow();
    r.setArc(arcRef.current);
    r.setQuality(lite ? 'lite' : 'auto');

    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let reduced = motion.matches;
    let s: GameState | null = null;
    let i = 0;
    let lastNews = -1;
    let ready = false;
    let cancelled = false;
    let onScreen = true;
    let timer = 0;
    let settle = 0;

    /**
     * Frame the town as a village in a valley: centred, a little low (the top fades into the sky), and zoomed
     * in enough that the map's diamond edges stay out of view or inside the faded top.
     */
    const frame = () => {
      const w = host.clientWidth, h = host.clientHeight;
      if (w === 0 || h === 0) return;
      const wide = w >= WIDE_PX;
      const k = Math.min((w * (wide ? 0.62 : 1.0)) / TOWN_W, (h * 1.05) / TOWN_H);
      r.setView(0, TOWN_CY - 0.08 * (h / k), k);
    };

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
      if (i < SHOWCASE_PLAN.length) {
        i = growStep(s, SHOWCASE_PLAN, i);
        if (i >= SHOWCASE_PLAN.length) sync(); // town finished: slow the clock to the idle pace
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
      if (on) timer = window.setInterval(tick, i < SHOWCASE_PLAN.length ? GROW_MS : IDLE_MS);
    }

    const rebuild = (a: ArcId) => {
      reduced = motion.matches;
      r.setArc(a);
      lastNews = -1;
      if (reduced) {
        s = fullCity(a);
        i = SHOWCASE_PLAN.length;
        r.draw(s);
        emitNews();
        window.clearInterval(timer);
        timer = 0;
        pulse();
        return;
      }
      s = createShowcase(a);
      i = 0;
      r.setPaused(false);
      tick(); // first building straight away
      sync();
    };

    r.init(host).then(() => {
      if (cancelled) return;
      ready = true;
      frame();
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
      r.destroy();
    };
  }, []);

  useEffect(() => {
    arcRef.current = arc;
    rebuildRef.current?.(arc);
  }, [arc]);

  return <div ref={hostRef} aria-hidden="true" className={`pointer-events-none absolute inset-0 overflow-hidden [&>canvas]:block ${className}`} />;
}
