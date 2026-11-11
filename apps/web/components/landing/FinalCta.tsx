'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import T from './prefs/T';
import { isLite } from './closing/tier';
import './closing.css';

/**
 * The closing scene: the city at night. A warm, lit copy of the same city shows through a torch that
 * follows the pointer (on touch screens and slow devices the torch wanders by itself, CSS only).
 * Hovering Play now makes the torch bloom and the lit city flare. Fireflies drift up.
 */
const FLIES = [
  [6, 0, 9], [14, 2.4, 11], [22, 5.1, 8], [31, 1.3, 12], [39, 6.2, 10], [47, 3.3, 9], [55, 0.7, 13],
  [63, 4.4, 10], [71, 2.1, 11], [79, 5.6, 9], [87, 1.8, 12], [94, 3.9, 10], [18, 7.2, 14], [68, 7.9, 13],
] as const; // [left %, delay s, duration s]

export default function FinalCta() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { el.toggleAttribute('data-offscreen', !e?.isIntersecting); });
    io.observe(el);
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (still) { el.dataset.torch = 'still'; return () => io.disconnect(); }
    if (isLite()) { el.dataset.torch = 'wander'; return () => io.disconnect(); }
    el.dataset.torch = 'follow';

    let raf = 0, x = 50, y = 55, tx = 50, ty = 55;
    const tick = () => {
      // ease toward the pointer and stop the loop once settled
      x += (tx - x) * 0.18; y += (ty - y) * 0.18;
      el.style.setProperty('--tx', `${x.toFixed(2)}%`);
      el.style.setProperty('--ty', `${y.toFixed(2)}%`);
      raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.05 ? requestAnimationFrame(tick) : 0;
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(tick); };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      const r = el.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width) * 100;
      ty = ((e.clientY - r.top) / r.height) * 100;
      el.dataset.lit = '';
      kick();
    };
    const onLeave = () => { delete el.dataset.lit; tx = 50; ty = 55; kick(); };
    el.addEventListener('pointermove', onMove, { passive: true });
    el.addEventListener('pointerleave', onLeave);
    return () => { io.disconnect(); cancelAnimationFrame(raf); el.removeEventListener('pointermove', onMove); el.removeEventListener('pointerleave', onLeave); };
  }, []);

  return (
    <section ref={root} id="cta" aria-labelledby="cta-h" className="night-cta relative flex items-center justify-center overflow-hidden px-4 py-24">
      <div className="night-scene" aria-hidden="true">
        <Image src="/landing/city.jpg" alt="" fill sizes="100vw" className="night-img night-dark" />
        <div className="night-lit">
          <Image src="/landing/city.jpg" alt="" fill sizes="100vw" className="night-img night-warm" />
        </div>
        <div className="night-flies">
          {FLIES.map(([left, delay, dur], i) => (
            <span key={i} className={`night-fly ${i >= 8 ? 'night-fly-extra' : ''}`} style={{ left: `${left}%`, animationDelay: `-${delay}s`, animationDuration: `${dur}s` }} />
          ))}
        </div>
      </div>

      <div className="night-card relative z-20 mx-auto w-full max-w-2xl px-6 py-14 text-center sm:px-12 sm:py-16" data-reveal>
        <div className="mb-3"><span className="landing-pill"><T en="Your turn" id="Giliranmu" /></span></div>
        <h2 id="cta-h" data-reveal-words className="night-title font-serif-display">
          <T en={<>Your realm is <em>waiting.</em></>} id={<>Negerimu sudah <em>menunggu.</em></>} />
        </h2>
        <p className="night-line mx-auto mt-4 max-w-md text-base sm:text-lg">
          <T en="Free, in your browser. Your city is saved on this device." id="Gratis, langsung di browser. Kotamu disimpan di perangkat ini." />
        </p>
        <div className="mt-8 flex justify-center">
          <Link href="/play" data-magnetic className="night-play btn btn-gold px-10 py-4 text-xl">
            <T en="Play now" id="Main sekarang" />
          </Link>
        </div>
        <p className="night-hint font-display" aria-hidden="true">
          <T en="Move your torch over the city" id="Gerakkan obormu di atas kota" />
        </p>
      </div>
    </section>
  );
}
