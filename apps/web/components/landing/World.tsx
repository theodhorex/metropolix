'use client';

import { useEffect, useRef } from 'react';
import { ARCS, BUILDING_KINDS, GRID, WORLD_MAYORS } from '@metropolix/sim';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const STATS = [
  { to: ARCS.length, suffix: '', label: 'peoples to rule', accent: '#5fc07a' },
  { to: BUILDING_KINDS.length, suffix: '', label: 'kinds of building', accent: '#e8a13a' },
  { to: WORLD_MAYORS, suffix: '', label: 'rival mayors (simulated)', accent: '#e5594a' },
  { to: GRID * GRID, suffix: '', label: 'tiles on the map', accent: '#4fc3f7' },
];

export default function World() {
  const sectionRef = useRef<HTMLElement>(null);
  const castleRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const castle = castleRef.current;
    const container = containerRef.current;
    if (!section || !castle || !container) return;

    const counterEls = container.querySelectorAll<HTMLElement>('[data-stat-counter]');

    const mm = gsap.matchMedia();

    // Desktop (>= 901px, motion allowed): pin section & scrub counters and castle
    mm.add('(min-width: 901px) and (prefers-reduced-motion: no-preference)', () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=120%',
          pin: true,
          scrub: 1,
          anticipatePin: 1,
        },
      });

      // Castle rises from below (yPercent 75 -> 6)
      tl.fromTo(
        castle,
        { yPercent: 75 },
        { yPercent: 6, ease: 'none' },
        0
      );

      // Counters count from 0 to their values
      counterEls.forEach((el) => {
        const target = parseFloat(el.getAttribute('data-to') || '0');
        const suffix = el.getAttribute('data-suffix') || '';
        const obj = { val: 0 };
        tl.to(
          obj,
          {
            val: target,
            ease: 'none',
            onUpdate: () => {
              el.textContent = Math.round(obj.val).toLocaleString() + suffix;
            },
          },
          0
        );
      });
    });

    // Mobile / Tablet (< 901px, motion allowed): no pin, count once when visible
    mm.add('(max-width: 900px) and (prefers-reduced-motion: no-preference)', () => {
      ScrollTrigger.create({
        trigger: section,
        start: 'top 80%',
        once: true,
        onEnter: () => {
          gsap.fromTo(
            castle,
            { yPercent: 40, opacity: 0.5 },
            { yPercent: 6, opacity: 1, duration: 1.2, ease: 'power2.out' }
          );

          counterEls.forEach((el) => {
            const target = parseFloat(el.getAttribute('data-to') || '0');
            const suffix = el.getAttribute('data-suffix') || '';
            const obj = { val: 0 };
            gsap.to(obj, {
              val: target,
              duration: 1.5,
              ease: 'power2.out',
              onUpdate: () => {
                el.textContent = Math.round(obj.val).toLocaleString() + suffix;
              },
            });
          });
        },
      });
    });

    // Reduced motion: no animations, show final values immediately
    mm.add('(prefers-reduced-motion: reduce)', () => {
      gsap.set(castle, { yPercent: 6, opacity: 1 });
      counterEls.forEach((el) => {
        const target = parseFloat(el.getAttribute('data-to') || '0');
        const suffix = el.getAttribute('data-suffix') || '';
        el.textContent = target.toLocaleString() + suffix;
      });
    });

    return () => {
      mm.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="world"
      aria-labelledby="world-h"
      className="l-section relative flex min-h-[90vh] flex-col justify-between overflow-hidden bg-[#fafaf8] px-4 py-20"
    >
      <div className="landing-grid-faint" aria-hidden="true" />
      <div className="pixel-divider -mx-4 -mt-20 mb-12" aria-hidden="true" />

      {/* Main Content Container */}
      <div ref={containerRef} className="relative z-10 mx-auto w-full max-w-6xl">
        <div className="text-center" data-reveal>
          <div className="mb-3">
            <span className="landing-pill">Living world</span>
          </div>
          <h2 id="world-h" data-reveal-words className="landing-h2">
            The realm keeps moving
          </h2>
          <p className="mx-auto mt-4 max-w-prose text-base text-[var(--landing-ink-muted)] sm:text-lg">
            {WORLD_MAYORS} simulated rival mayors grow, level up and raid each other and you, even while you plan.
            A raided city gets a shield. Loot always comes out of a real treasury.
          </p>
        </div>

        {/* 4 Stat Cards: Pale Pixel Banners */}
        <ul className="mt-16 grid grid-cols-2 gap-4 min-[901px]:grid-cols-4 lg:gap-6" data-reveal>
          {STATS.map((s) => (
            <li
              key={s.label}
              className="stat-banner-pixel flex flex-col items-center justify-center p-6 text-center transition-transform hover:-translate-y-1"
            >
              <span
                data-stat-counter
                data-to={s.to}
                data-suffix={s.suffix}
                className="font-display text-4xl font-bold tracking-tight text-[var(--landing-ink)] sm:text-5xl"
                style={{ color: s.accent }}
              >
                {s.to}
                {s.suffix}
              </span>
              <span className="mt-2 text-xs font-semibold uppercase tracking-wider text-[var(--landing-ink-muted)] sm:text-sm">
                {s.label}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Pixel Castle Silhouette behind stat cards */}
      <div
        ref={castleRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-0 flex justify-center opacity-75"
        style={{ transform: 'translateY(75%)' }}
      >
        <svg
          viewBox="0 0 1000 380"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-auto w-full max-w-5xl"
          shapeRendering="crispEdges"
        >
          {/* Distant Ramparts / Foundation */}
          <rect x="100" y="240" width="800" height="140" fill="#e5e9f0" />
          <rect x="120" y="220" width="760" height="20" fill="#d8dee9" />

          {/* Left Tower */}
          <rect x="140" y="100" width="100" height="200" fill="#d8dee9" />
          <rect x="130" y="80" width="120" height="20" fill="#cfd6e4" />
          {/* Left Tower Battlements */}
          <rect x="130" y="60" width="24" height="20" fill="#cfd6e4" />
          <rect x="178" y="60" width="24" height="20" fill="#cfd6e4" />
          <rect x="226" y="60" width="24" height="20" fill="#cfd6e4" />
          {/* Left Tower Flag */}
          <rect x="188" y="24" width="4" height="36" fill="#8892b0" />
          <polygon points="192,24 216,34 192,44" fill="#5fc07a" />
          {/* Left Tower Window */}
          <rect x="180" y="130" width="20" height="36" fill="#4c566a" />

          {/* Right Tower */}
          <rect x="760" y="100" width="100" height="200" fill="#d8dee9" />
          <rect x="750" y="80" width="120" height="20" fill="#cfd6e4" />
          {/* Right Tower Battlements */}
          <rect x="750" y="60" width="24" height="20" fill="#cfd6e4" />
          <rect x="798" y="60" width="24" height="20" fill="#cfd6e4" />
          <rect x="846" y="60" width="24" height="20" fill="#cfd6e4" />
          {/* Right Tower Flag */}
          <rect x="808" y="24" width="4" height="36" fill="#8892b0" />
          <polygon points="812,24 836,34 812,44" fill="#e5594a" />
          {/* Right Tower Window */}
          <rect x="800" y="130" width="20" height="36" fill="#4c566a" />

          {/* Central Keep */}
          <rect x="360" y="40" width="280" height="260" fill="#d2d9e6" />
          <rect x="340" y="20" width="320" height="20" fill="#c4cddc" />
          {/* Central Battlements */}
          <rect x="340" y="0" width="30" height="20" fill="#c4cddc" />
          <rect x="398" y="0" width="30" height="20" fill="#c4cddc" />
          <rect x="456" y="0" width="30" height="20" fill="#c4cddc" />
          <rect x="514" y="0" width="30" height="20" fill="#c4cddc" />
          <rect x="572" y="0" width="30" height="20" fill="#c4cddc" />
          <rect x="630" y="0" width="30" height="20" fill="#c4cddc" />

          {/* Main Arched Gate */}
          <rect x="450" y="220" width="100" height="120" fill="#2e3440" />
          <rect x="465" y="200" width="70" height="20" fill="#2e3440" />
          <rect x="480" y="185" width="40" height="15" fill="#2e3440" />

          {/* Gate Portcullis Grille */}
          <line x1="470" y1="200" x2="470" y2="340" stroke="#4c566a" strokeWidth="3" />
          <line x1="490" y1="200" x2="490" y2="340" stroke="#4c566a" strokeWidth="3" />
          <line x1="510" y1="200" x2="510" y2="340" stroke="#4c566a" strokeWidth="3" />
          <line x1="530" y1="200" x2="530" y2="340" stroke="#4c566a" strokeWidth="3" />
          <line x1="450" y1="240" x2="550" y2="240" stroke="#4c566a" strokeWidth="3" />
          <line x1="450" y1="270" x2="550" y2="270" stroke="#4c566a" strokeWidth="3" />
          <line x1="450" y1="300" x2="550" y2="300" stroke="#4c566a" strokeWidth="3" />

          {/* Keep Windows */}
          <rect x="420" y="80" width="24" height="48" fill="#4c566a" />
          <rect x="556" y="80" width="24" height="48" fill="#4c566a" />
          <rect x="488" y="60" width="24" height="48" fill="#4c566a" />

          {/* Mid Turrets */}
          <rect x="250" y="160" width="100" height="140" fill="#dbe1eb" />
          <rect x="240" y="145" width="120" height="15" fill="#cfd6e4" />
          <rect x="240" y="130" width="20" height="15" fill="#cfd6e4" />
          <rect x="290" y="130" width="20" height="15" fill="#cfd6e4" />
          <rect x="340" y="130" width="20" height="15" fill="#cfd6e4" />

          <rect x="650" y="160" width="100" height="140" fill="#dbe1eb" />
          <rect x="640" y="145" width="120" height="15" fill="#cfd6e4" />
          <rect x="640" y="130" width="20" height="15" fill="#cfd6e4" />
          <rect x="690" y="130" width="20" height="15" fill="#cfd6e4" />
          <rect x="740" y="130" width="20" height="15" fill="#cfd6e4" />
        </svg>
      </div>
    </section>
  );
}
