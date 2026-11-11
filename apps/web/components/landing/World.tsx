'use client';

import { useEffect, useRef } from 'react';
import { ARCS, BUILDING_KINDS, GRID, WORLD_MAYORS } from '@metropolix/sim';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import CastleBuild from './fx/CastleBuild';
import { isLiteTier, isReducedMotion } from './fx/tier';
import T from './prefs/T';
import { useTr } from './prefs/store';

gsap.registerPlugin(ScrollTrigger);

const STATS = [
  {
    to: ARCS.length,
    suffix: '',
    label: {
      en: 'peoples to rule',
      id: 'bangsa untuk diperintah',
      ko: '통치할 종족',
      zh: '可统治的种族',
    },
    accent: '#5fc07a',
  },
  {
    to: BUILDING_KINDS.length,
    suffix: '',
    label: {
      en: 'kinds of building',
      id: 'ragam bangunan',
      ko: '건축물의 종류',
      zh: '建筑类型',
    },
    accent: '#e8a13a',
  },
  {
    to: WORLD_MAYORS,
    suffix: '',
    label: {
      en: 'rival mayors (simulated)',
      id: 'walikota lawan (simulasi)',
      ko: '라이벌 시장 (시뮬레이션)',
      zh: '对手城主（模拟）',
    },
    accent: '#e5594a',
  },
  {
    to: GRID * GRID,
    suffix: '',
    label: {
      en: 'tiles on the map',
      id: 'petak di peta',
      ko: '지도 위 타일',
      zh: '地图地块',
    },
    accent: '#4fc3f7',
  },
];

export default function World() {
  const tr = useTr();
  const sectionRef = useRef<HTMLElement>(null);
  const castleContainerRef = useRef<HTMLDivElement>(null);
  const statsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const castleEl = castleContainerRef.current;
    const statsEl = statsContainerRef.current;
    if (!section || !castleEl || !statsEl) return;

    const reduced = isReducedMotion();
    const lite = isLiteTier();

    const counterEls = statsEl.querySelectorAll<HTMLElement>('[data-stat-counter]');
    const blocks = Array.from(castleEl.querySelectorAll<SVGElement>('[data-block]'));
    const banners = Array.from(castleEl.querySelectorAll<SVGElement>('[data-banner]'));
    const windows = Array.from(castleEl.querySelectorAll<SVGElement>('[data-window]'));
    const layer0 = castleEl.querySelector<SVGElement>('.castle-layer-0');
    const layer1 = castleEl.querySelector<SVGElement>('.castle-layer-1');
    const layer2 = castleEl.querySelector<SVGElement>('.castle-layer-2');

    // Sort blocks by phase: 0 (foundation), 1 (walls), 2 (towers), 3 (roofs/portcullis)
    const blocksPhase0 = blocks.filter((b) => b.getAttribute('data-phase') === '0');
    const blocksPhase1 = blocks.filter((b) => b.getAttribute('data-phase') === '1');
    const blocksPhase2 = blocks.filter((b) => b.getAttribute('data-phase') === '2');
    const blocksPhase3 = blocks.filter((b) => b.getAttribute('data-phase') === '3');

    // Reduced motion mode: everything is static and visible immediately
    if (reduced) {
      counterEls.forEach((el) => {
        const target = parseFloat(el.getAttribute('data-to') || '0');
        const suffix = el.getAttribute('data-suffix') || '';
        el.textContent = target.toLocaleString() + suffix;
      });
      gsap.set(blocks, { y: 0, opacity: 1 });
      gsap.set(banners, { scaleY: 1 });
      windows.forEach((w) => w.classList.add('lit'));
      return;
    }

    const ctx = gsap.context(() => {
      // FULL tier (desktop with fine pointer, >4 cores): Pin section & scrub assemble
      if (!lite) {
        // Initial state
        gsap.set(blocks, { y: -220, opacity: 0 });
        gsap.set(banners, { scaleY: 0, transformOrigin: 'top center' });
        gsap.set(castleEl, { yPercent: 18, opacity: 0.4 });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: '+=160%',
            pin: true,
            scrub: 0.8,
            anticipatePin: 1,
          },
        });

        // 1. Castle rises up into frame
        tl.to(castleEl, { yPercent: 0, opacity: 1, duration: 0.6, ease: 'power1.out' }, 0);

        // 2. Foundation blocks fall in first (progress 0 -> 0.3)
        tl.to(
          blocksPhase0,
          {
            y: 0,
            opacity: 1,
            ease: 'back.out(1.5)',
            stagger: { each: 0.015, from: 'center' },
            duration: 0.28,
          },
          0.05
        );

        // 3. Walls fall in next (progress 0.25 -> 0.55)
        tl.to(
          blocksPhase1,
          {
            y: 0,
            opacity: 1,
            ease: 'back.out(1.5)',
            stagger: { each: 0.012, from: 'edges' },
            duration: 0.3,
          },
          0.25
        );

        // 4. Towers & battlements fall in (progress 0.5 -> 0.75)
        tl.to(
          blocksPhase2,
          {
            y: 0,
            opacity: 1,
            ease: 'back.out(1.5)',
            stagger: { each: 0.012, from: 'random' },
            duration: 0.25,
          },
          0.5
        );

        // 5. Roofs & portcullis fall in (progress 0.7 -> 0.88)
        tl.to(
          blocksPhase3,
          {
            y: 0,
            opacity: 1,
            ease: 'back.out(1.5)',
            stagger: 0.02,
            duration: 0.2,
          },
          0.7
        );

        // 6. Banners unfurl at the end (progress 0.85 -> 0.98)
        tl.to(
          banners,
          {
            scaleY: 1,
            duration: 0.15,
            ease: 'elastic.out(1, 0.5)',
            stagger: 0.04,
          },
          0.85
        );

        // 7. Windows light up in twilight/night
        tl.call(() => {
          windows.forEach((w, idx) => {
            setTimeout(() => w.classList.add('lit'), idx * 80);
          });
        }, undefined, 0.78);

        // 8. Honest counters count up in sync with build
        counterEls.forEach((el) => {
          const target = parseFloat(el.getAttribute('data-to') || '0');
          const suffix = el.getAttribute('data-suffix') || '';
          const obj = { val: 0 };
          tl.to(
            obj,
            {
              val: target,
              ease: 'power1.out',
              duration: 0.85,
              onUpdate: () => {
                el.textContent = Math.round(obj.val).toLocaleString() + suffix;
              },
            },
            0.1
          );
        });

        // 3-Layer Pointer Parallax (FULL tier only, via quickTo)
        const xQuick0 = layer0 ? gsap.quickTo(layer0, 'x', { duration: 0.6, ease: 'power2.out' }) : null;
        const yQuick0 = layer0 ? gsap.quickTo(layer0, 'y', { duration: 0.6, ease: 'power2.out' }) : null;
        const xQuick1 = layer1 ? gsap.quickTo(layer1, 'x', { duration: 0.5, ease: 'power2.out' }) : null;
        const yQuick1 = layer1 ? gsap.quickTo(layer1, 'y', { duration: 0.5, ease: 'power2.out' }) : null;
        const xQuick2 = layer2 ? gsap.quickTo(layer2, 'x', { duration: 0.4, ease: 'power2.out' }) : null;
        const yQuick2 = layer2 ? gsap.quickTo(layer2, 'y', { duration: 0.4, ease: 'power2.out' }) : null;

        const onMouseMove = (e: MouseEvent) => {
          const rect = section.getBoundingClientRect();
          const relX = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
          const relY = (e.clientY - rect.top) / rect.height - 0.5;

          xQuick0?.(relX * 10);
          yQuick0?.(relY * 6);
          xQuick1?.(relX * 18);
          yQuick1?.(relY * 10);
          xQuick2?.(relX * 28);
          yQuick2?.(relY * 16);
        };

        window.addEventListener('mousemove', onMouseMove, { passive: true });
        return () => {
          window.removeEventListener('mousemove', onMouseMove);
        };
      } else {
        // LITE tier / mobile: No pin, castle assembles once on enter
        gsap.set(blocks, { y: -80, opacity: 0 });
        gsap.set(banners, { scaleY: 0, transformOrigin: 'top center' });
        gsap.set(castleEl, { yPercent: 0, opacity: 1 });

        ScrollTrigger.create({
          trigger: section,
          start: 'top 75%',
          once: true,
          onEnter: () => {
            gsap.to(blocks, {
              y: 0,
              opacity: 1,
              ease: 'power2.out',
              duration: 1.0,
              stagger: 0.015,
            });

            gsap.to(banners, {
              scaleY: 1,
              delay: 0.8,
              duration: 0.4,
              stagger: 0.05,
            });

            windows.forEach((w) => w.classList.add('lit'));

            counterEls.forEach((el) => {
              const target = parseFloat(el.getAttribute('data-to') || '0');
              const suffix = el.getAttribute('data-suffix') || '';
              const obj = { val: 0 };
              gsap.to(obj, {
                val: target,
                duration: 1.2,
                ease: 'power2.out',
                onUpdate: () => {
                  el.textContent = Math.round(obj.val).toLocaleString() + suffix;
                },
              });
            });
          },
        });
      }
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="world"
      aria-labelledby="world-h"
      className="l-section relative flex min-h-[92vh] flex-col justify-between overflow-hidden px-4 py-20"
    >
      <div className="landing-grid-faint" aria-hidden="true" />

      {/* Pixel wipe section divider connecting sections */}
      <div className="pixel-divider -mx-4 -mt-20 mb-16" aria-hidden="true" />

      {/* Main Content: Heading & honest simulation counters */}
      <div ref={statsContainerRef} className="relative z-10 mx-auto w-full max-w-6xl">
        <div className="text-center" data-reveal>
          <div className="mb-3">
            <span className="landing-pill">
              <T en="Living world" id="Dunia hidup" ko="살아 숨 쉬는 세계" zh="鲜活的世界" />
            </span>
          </div>
          <h2 id="world-h" data-reveal-words className="landing-h2">
            <T split en="The realm keeps moving" id="Kerajaan tak pernah diam" ko="왕국은 멈추지 않습니다" zh="王国时刻运转不息" />
          </h2>
          <p className="mx-auto mt-4 max-w-prose text-base text-[var(--landing-ink-muted)] sm:text-lg">
            <T
              en={`${WORLD_MAYORS} simulated rival mayors grow, level up and raid each other and you, even while you plan. A raided city gets a shield. Loot always comes out of a real treasury.`}
              id={`${WORLD_MAYORS} walikota lawan tumbuh, naik level, dan saling menyerang bahkan saat kamu menyusun rencana. Kota terserang mendapat perisai. Jarahan selalu berasal dari kas nyata.`}
              ko={`${WORLD_MAYORS}명의 시뮬레이션 라이벌 시장들은 당신이 계획을 세우는 중에도 스스로 성장하고, 레벨을 올리며, 서로와 당신을 약탈합니다. 약탈당한 도시는 보호막을 얻습니다. 전리품은 언제나 실제 금고에서 차감됩니다.`}
              zh={`${WORLD_MAYORS} 位模拟对手城主即便在你运筹帷幄之际，也会不断发展、升级，并彼此发起突袭（包括突袭你的城市）。遭受突袭的城市将获得护盾。掠夺的战利品始终出自真实的国库。`}
            />
          </p>
        </div>

        {/* 4 Stat Cards: Pale Pixel Banners */}
        <ul className="mt-16 grid grid-cols-2 gap-4 min-[901px]:grid-cols-4 lg:gap-6">
          {STATS.map((s) => (
            <li
              key={s.label.en}
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
                <T {...s.label} />
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Pixel castle that builds itself below the stat cards */}
      <div
        ref={castleContainerRef}
        aria-hidden="true"
        className="world-castle pointer-events-none relative z-0 mx-auto mt-10 flex w-full max-w-3xl justify-center"
      >
        <CastleBuild />
      </div>
    </section>
  );
}
