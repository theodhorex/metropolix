'use client';

import { useEffect, useRef, useState } from 'react';
import { ARCS, type ArcId } from '@metropolix/sim';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ArcPortrait from '../ArcPortrait';
import T from './prefs/T';
import { useTr } from './prefs/store';
import PeopleQuiz from './play/PeopleQuiz';
import './peoples.css';

gsap.registerPlugin(ScrollTrigger);

const SPAN = [
  'lg:col-span-2 xl:col-span-1',
  'lg:col-span-2 xl:col-span-1',
  'lg:col-span-2 xl:col-span-1',
  'lg:col-span-3 xl:col-span-1',
  'sm:col-span-2 lg:col-span-3 xl:col-span-1',
];

export default function Peoples() {
  const tr = useTr();
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLUListElement>(null);

  const [flipped, setFlipped] = useState<Record<ArcId, boolean>>({
    elf: false,
    lizard: false,
    caveman: false,
    dragon: false,
    goblin: false,
  });
  const [highlightedArc, setHighlightedArc] = useState<ArcId | null>(null);

  const toggleFlip = (id: ArcId) => {
    setFlipped((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Callback when quiz finishes: flip and highlight that card
  const handleQuizResult = (arcId: ArcId) => {
    setHighlightedArc(arcId);
    setFlipped((prev) => ({ ...prev, [arcId]: true }));

    // Smoothly scroll the card into view if needed
    const cardEl = document.getElementById(`people-card-${arcId}`);
    if (cardEl) {
      cardEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  useEffect(() => {
    const section = sectionRef.current;
    const grid = gridRef.current;
    if (!section || !grid) return;

    // 1. Offscreen detection via IntersectionObserver to pause animations
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          section.setAttribute('data-offscreen', entry.isIntersecting ? 'false' : 'true');
        });
      },
      { threshold: 0.05 }
    );
    io.observe(section);

    // 2. Compute device capability tier once
    const finePointer = window.matchMedia('(pointer: fine)').matches;
    const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const nav = navigator as unknown as { hardwareConcurrency?: number; deviceMemory?: number };
    const isLite =
      window.matchMedia('(pointer: coarse)').matches ||
      (nav.hardwareConcurrency ?? 8) <= 4 ||
      (nav.deviceMemory ?? 8) <= 4;

    // 3. GSAP Staggered Pixel Drop-in animation for cards
    const ctx = gsap.context(() => {
      const cardEls = grid.querySelectorAll<HTMLElement>('.people-card-wrapper');

      if (!isReducedMotion) {
        gsap.fromTo(
          cardEls,
          { opacity: 0, y: -48 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            stagger: 0.09,
            ease: 'steps(6)',
            scrollTrigger: {
              trigger: grid,
              start: 'top 82%',
              toggleActions: 'play none none none',
            },
          }
        );
      } else {
        gsap.set(cardEls, { opacity: 1, y: 0 });
      }
    }, section);

    // 4. Desktop Pointer Tilt & Moving Light Sheen (Full Tier only, non-reduced motion)
    const cleanupListeners: (() => void)[] = [];

    if (finePointer && !isLite && !isReducedMotion) {
      const cardEls = grid.querySelectorAll<HTMLElement>('.people-card-wrapper');

      cardEls.forEach((card) => {
        let isHovered = false;

        const onPointerEnter = () => {
          isHovered = true;
        };

        const onPointerMove = (e: PointerEvent) => {
          if (!isHovered) return;
          const rect = card.getBoundingClientRect();
          if (rect.width === 0 || rect.height === 0) return;

          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;

          // Normalized coordinates: -1 to 1
          const px = (x / rect.width) * 2 - 1;
          const py = (y / rect.height) * 2 - 1;

          // Max 6deg tilt towards pointer
          const tiltX = -py * 6;
          const tiltY = px * 6;
          const sheenX = (x / rect.width) * 100;
          const sheenY = (y / rect.height) * 100;

          // Direct CSS variable updates - zero React re-render per pointer move!
          card.style.setProperty('--tilt-x', `${tiltX.toFixed(2)}deg`);
          card.style.setProperty('--tilt-y', `${tiltY.toFixed(2)}deg`);
          card.style.setProperty('--sheen-x', `${sheenX.toFixed(1)}%`);
          card.style.setProperty('--sheen-y', `${sheenY.toFixed(1)}%`);
        };

        const onPointerLeave = () => {
          isHovered = false;
          // Smoothly reset tilt back to flat
          card.style.setProperty('--tilt-x', '0deg');
          card.style.setProperty('--tilt-y', '0deg');
        };

        card.addEventListener('pointerenter', onPointerEnter);
        card.addEventListener('pointermove', onPointerMove, { passive: true });
        card.addEventListener('pointerleave', onPointerLeave);

        cleanupListeners.push(() => {
          card.removeEventListener('pointerenter', onPointerEnter);
          card.removeEventListener('pointermove', onPointerMove);
          card.removeEventListener('pointerleave', onPointerLeave);
        });
      });
    }

    // 5. Document visibility listener to pause loops
    const handleVisibilityChange = () => {
      if (document.hidden) {
        section.setAttribute('data-offscreen', 'true');
      } else {
        section.setAttribute('data-offscreen', 'false');
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      io.disconnect();
      ctx.revert();
      cleanupListeners.forEach((fn) => fn());
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="peoples"
      aria-labelledby="peoples-h"
      className="peoples-section relative px-4 py-20"
      data-offscreen="false"
    >
      <div className="landing-grid-faint" aria-hidden="true" />
      <div className="pixel-divider -mx-4 -mt-20 mb-16" aria-hidden="true" />

      <div className="mx-auto max-w-6xl">
        {/* Section Heading */}
        <div className="text-center">
          <div className="mb-3">
            <span className="landing-pill">
              <T en="Five Peoples" id="Lima Bangsa" />
            </span>
          </div>
          <h2 id="peoples-h" data-reveal-words className="landing-h2">
            <T en="Five peoples. One choice, forever." id="Lima bangsa. Satu pilihan, selamanya." />
          </h2>
          <p className="mx-auto mt-4 max-w-prose text-base text-[var(--l-muted)] sm:text-lg">
            <T
              en="Each city belongs to one people for good. The people decides its land, its army and how it trades, so pick the one you want to rule."
              id="Setiap kota milik satu bangsa selamanya. Bangsa menentukan tanahnya, pasukannya, dan cara berdagang, jadi pilih yang ingin kamu pimpin."
            />
          </p>
        </div>

        {/* 5 Flip Cards Grid */}
        <ul
          ref={gridRef}
          id="peoples-grid"
          className="peoples-grid mt-14 grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 xl:grid-cols-5"
          role="list"
          aria-label={tr('The five peoples of Metropolix', 'Lima bangsa di Metropolix')}
        >
          {ARCS.map((a, i) => {
            const isFlipped = flipped[a.id];
            const isHighlighted = highlightedArc === a.id;

            // Stats relative to neutral 1000 permille (100%)
            const atkPct = Math.round(a.mods.attackPm / 10);
            const defPct = Math.round(a.mods.defensePm / 10);
            const ecoPct = Math.round(a.mods.econPm / 10);
            const lootPct = Math.round(a.mods.lootPm / 10);
            const cheapArmyPct = Math.round((2000 - a.mods.troopCostPm) / 10);

            // Bar fill % relative to 140% max scale
            const barWidth = (pct: number) => `${Math.min(100, Math.max(10, Math.round((pct / 140) * 100)))}%`;

            return (
              <li key={a.id} className={SPAN[i]}>
                <div
                  id={`people-card-${a.id}`}
                  role="button"
                  tabIndex={0}
                  aria-expanded={isFlipped}
                  aria-label={tr(
                    `${a.name} card: ${a.tagline}. Click or press Enter to ${isFlipped ? 'view portrait' : 'inspect stats'}`,
                    `Kartu ${a.name}: ${a.tagline}. Klik atau tekan Enter untuk ${isFlipped ? 'lihat potret' : 'cek statistik'}`
                  )}
                  data-flipped={isFlipped}
                  data-highlighted={isHighlighted}
                  onClick={() => toggleFlip(a.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleFlip(a.id);
                    }
                  }}
                  className="people-card-wrapper"
                  style={
                    {
                      '--card-accent': a.accent,
                    } as React.CSSProperties
                  }
                >
                  <div className="people-card-inner">
                    {/* FRONT FACE */}
                    <article className="people-card-front">
                      <div className="people-card-sheen" aria-hidden="true" />
                      <div className="people-accent-bar" style={{ background: a.accent }} />

                      <div className="people-portrait-frame">
                        <ArcPortrait arc={a.id} className="h-full w-full object-cover" />
                      </div>

                      <div className="people-card-body">
                        <div>
                          <h3 className="font-display text-xl font-bold tracking-wide" style={{ color: a.accent }}>
                            {a.name}
                          </h3>
                          <p className="mt-1 text-xs text-[var(--l-muted)]">{a.tagline}</p>
                        </div>

                        <dl className="text-xs">
                          <dt className="font-bold text-[var(--l-ink)]">
                            <T en="Soldiers" id="Prajurit" />
                          </dt>
                          <dd className="text-[var(--l-muted)]">
                            <T en={`${a.troop}s`} id={a.troop} />
                          </dd>
                          <dt className="mt-2 font-bold text-[var(--l-ink)]">
                            <T en="Signature move" id="Jurus andalan" />
                          </dt>
                          <dd className="text-[var(--l-muted)]">{a.unique}</dd>
                        </dl>

                        <div>
                          <h4 className="text-xs font-bold text-[var(--l-ink)]">
                            <T en="Strengths" id="Kelebihan" />
                          </h4>
                          <ul className="mt-1 space-y-1 text-xs">
                            {a.strengths.slice(0, 2).map((s) => (
                              <li key={s} className="flex gap-1.5 text-[var(--l-muted)]">
                                <span aria-hidden="true" className="font-bold text-[#22722b]">
                                  +
                                </span>
                                <span>{s}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="mt-auto pt-2">
                          <span className="people-flip-hint">
                            <span aria-hidden="true">↻</span>
                            <T en="Inspect stats" id="Cek statistik" />
                          </span>
                        </div>
                      </div>
                    </article>

                    {/* BACK FACE (5-AXIS STATS) */}
                    <article className="people-card-back">
                      <div className="people-card-sheen" aria-hidden="true" />
                      <div className="people-accent-bar" style={{ background: a.accent }} />

                      <div className="people-back-body">
                        <div className="flex items-center justify-between border-b border-[var(--l-line)] pb-2">
                          <div>
                            <h3 className="font-display text-lg font-bold" style={{ color: a.accent }}>
                              {a.name}
                            </h3>
                            <span className="text-[11px] font-medium text-[var(--l-muted)]">
                              {a.troop} · {a.good}
                            </span>
                          </div>
                          <span
                            className="rounded px-1.5 py-0.5 text-[10px] font-bold text-[var(--l-ink)]"
                            style={{ background: colorMix(a.accent, 0.2) }}
                          >
                            <T en="Stats" id="Stat" />
                          </span>
                        </div>

                        {/* 5-Axis Stat Bar */}
                        <div className="people-stat-grid" aria-label={tr('Combat & economic stats', 'Statistik perang & ekonomi')}>
                          {/* Attack */}
                          <div className="people-stat-row">
                            <div className="people-stat-header">
                              <span className="people-stat-label">
                                <T en="Attack" id="Serang" />
                              </span>
                              <span className="people-stat-value" style={{ color: a.accent }}>
                                {atkPct}%
                              </span>
                            </div>
                            <div className="people-stat-track" title={`Attack: ${atkPct}% of neutral 100%`}>
                              <div className="people-stat-marker" />
                              <div className="people-stat-fill" style={{ width: barWidth(atkPct) }} />
                            </div>
                          </div>

                          {/* Defense */}
                          <div className="people-stat-row">
                            <div className="people-stat-header">
                              <span className="people-stat-label">
                                <T en="Defense" id="Bertahan" />
                              </span>
                              <span className="people-stat-value" style={{ color: a.accent }}>
                                {defPct}%
                              </span>
                            </div>
                            <div className="people-stat-track" title={`Defense: ${defPct}% of neutral 100%`}>
                              <div className="people-stat-marker" />
                              <div className="people-stat-fill" style={{ width: barWidth(defPct) }} />
                            </div>
                          </div>

                          {/* Economy */}
                          <div className="people-stat-row">
                            <div className="people-stat-header">
                              <span className="people-stat-label">
                                <T en="Economy" id="Ekonomi" />
                              </span>
                              <span className="people-stat-value" style={{ color: a.accent }}>
                                {ecoPct}%
                              </span>
                            </div>
                            <div className="people-stat-track" title={`Economy: ${ecoPct}% of neutral 100%`}>
                              <div className="people-stat-marker" />
                              <div className="people-stat-fill" style={{ width: barWidth(ecoPct) }} />
                            </div>
                          </div>

                          {/* Cheap Army */}
                          <div className="people-stat-row">
                            <div className="people-stat-header">
                              <span className="people-stat-label">
                                <T en="Cheap Army" id="Hemat Pasukan" />
                              </span>
                              <span className="people-stat-value" style={{ color: a.accent }}>
                                {cheapArmyPct}%
                              </span>
                            </div>
                            <div className="people-stat-track" title={`Army economy: ${cheapArmyPct}% of neutral 100%`}>
                              <div className="people-stat-marker" />
                              <div className="people-stat-fill" style={{ width: barWidth(cheapArmyPct) }} />
                            </div>
                          </div>

                          {/* Loot */}
                          <div className="people-stat-row">
                            <div className="people-stat-header">
                              <span className="people-stat-label">
                                <T en="Looting" id="Rampasan" />
                              </span>
                              <span className="people-stat-value" style={{ color: a.accent }}>
                                {lootPct}%
                              </span>
                            </div>
                            <div className="people-stat-track" title={`Loot power: ${lootPct}% of neutral 100%`}>
                              <div className="people-stat-marker" />
                              <div className="people-stat-fill" style={{ width: barWidth(lootPct) }} />
                            </div>
                          </div>
                        </div>

                        {/* Weakness & Unique */}
                        <dl className="border-t border-[var(--l-line)] pt-2 text-xs">
                          <dt className="font-bold text-[var(--l-ink)]">
                            <T en="Unique Move" id="Jurus Khas" />
                          </dt>
                          <dd className="mt-0.5 text-[11px] text-[var(--l-muted)]">{a.unique}</dd>

                          <dt className="mt-2 font-bold text-[#c73e2b]">
                            <T en="Main Weakness" id="Kelemahan Utama" />
                          </dt>
                          <dd className="mt-0.5 text-[11px] text-[var(--l-muted)]">{a.weaknesses[0]}</dd>
                        </dl>

                        <div className="mt-auto pt-2">
                          <span className="people-flip-hint">
                            <span aria-hidden="true">↻</span>
                            <T en="View portrait" id="Lihat potret" />
                          </span>
                        </div>
                      </div>
                    </article>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        {/* Personality Quiz: Which people are you? */}
        <div className="mt-20">
          <PeopleQuiz onSelectArc={handleQuizResult} />
        </div>
      </div>
    </section>
  );
}

function colorMix(hex: string, alpha: number): string {
  return `color-mix(in srgb, ${hex} ${Math.round(alpha * 100)}%, transparent)`;
}
