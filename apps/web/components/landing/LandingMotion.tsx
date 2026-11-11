'use client';

import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { usePrefs } from './prefs/store';
import { isLiteTier, isReducedMotion } from './fx/tier';

gsap.registerPlugin(ScrollTrigger);

/**
 * The words of a [data-reveal-words] heading. Words are pre-split in JSX (`<T split>`), never here: cutting
 * up text nodes React owns broke the spacing after a re-render (language switch, hydration). Headings
 * without pre-split words reveal as one piece.
 */
function splitWords(el: HTMLElement): HTMLElement[] {
  const words = el.querySelectorAll<HTMLElement>('.reveal-word');
  return words.length > 0 ? Array.from(words) : [el];
}

// 8px grid pixel cloud rows
const CLOUD_ROWS: readonly (readonly [number, number][])[] = [
  [[10, 15], [21, 28]],
  [[8, 17], [19, 31]],
  [[6, 34]],
  [[3, 37]],
  [[1, 39]],
  [[0, 40]],
  [[0, 40]],
  [[2, 38]],
  [[5, 34]],
  [[10, 28]],
];
const CLOUD_TONES = [
  '#f4925a', '#f7a870', '#fbc99b', '#fddcb8', '#fff1dc',
  '#fff8ec', '#fff3e6', '#eadcf2', '#d6c3ec', '#bfa9e0'
];

function PixelCloudSvg({ flip = false }: { flip?: boolean }) {
  const PX = 8;
  return (
    <svg
      aria-hidden="true"
      viewBox={`0 0 ${40 * PX} ${CLOUD_ROWS.length * PX}`}
      className={`block h-auto w-full ${flip ? '-scale-x-100' : ''}`}
      shapeRendering="crispEdges"
      style={{ imageRendering: 'pixelated' }}
    >
      {CLOUD_ROWS.flatMap((spans, r) =>
        spans.map(([a, b]) => (
          <rect
            key={`${r}-${a}`}
            x={a * PX}
            y={r * PX}
            width={(b - a) * PX}
            height={PX}
            fill={CLOUD_TONES[r]}
          />
        ))
      )}
    </svg>
  );
}

export default function LandingMotion() {
  const { theme } = usePrefs();
  const backdropRef = useRef<HTMLDivElement>(null);

  // 1. Core Lenis smooth scroll and intro sequence (mount once)
  useEffect(() => {
    const reduced = isReducedMotion();
    const lite = isLiteTier();

    // Respect page visibility: pause all animations when tab is hidden
    const onVisibility = () => {
      document.documentElement.dataset.pageHidden = document.hidden ? 'true' : 'false';
    };
    document.addEventListener('visibilitychange', onVisibility);

    let backdropEl: HTMLDivElement | null = null;
    let lenis: Lenis | null = null;
    let tickerCallback: ((time: number) => void) | null = null;

    const ctx = gsap.context(() => {
      // Lenis smooth scroll (disabled on touch/lite and reduced motion)
      if (!reduced && !lite) {
        lenis = new Lenis({
          duration: 1.25,
          smoothWheel: true,
          autoRaf: false,
        });

        lenis.on('scroll', ScrollTrigger.update);

        tickerCallback = (time: number) => {
          lenis?.raf(time * 1000);
        };
        gsap.ticker.add(tickerCallback);
        gsap.ticker.lagSmoothing(0);
      }

      // In-page smooth scroll for a[href^="#"] links
      const handleAnchorClick = (e: MouseEvent) => {
        const anchor = (e.target as HTMLElement).closest('a[href^="#"]');
        if (!anchor) return;
        const href = anchor.getAttribute('href');
        if (href && href.length > 1 && href.startsWith('#')) {
          const target = document.querySelector(href);
          if (target) {
            e.preventDefault();
            if (lenis) {
              lenis.scrollTo(target as HTMLElement, { offset: -24 });
            } else {
              target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
            }
          }
        }
      };
      document.addEventListener('click', handleAnchorClick);

      // Intro "gate opens" animation (motion allowed only)
      const main = document.querySelector<HTMLElement>('main[data-page="landing"]');
      if (main && !reduced) {
        backdropEl = document.createElement('div');
        backdropEl.id = 'landing-gate-backdrop';
        backdropEl.style.position = 'fixed';
        backdropEl.style.inset = '0';
        backdropEl.style.zIndex = '-1';
        // a plain sky behind the opening gate (no game screenshot on the landing)
        backdropEl.style.background = main.dataset.theme === 'dark'
          ? 'linear-gradient(180deg, #050816 0%, #111a36 100%)'
          : 'linear-gradient(180deg, #b9d3f0 0%, #dcebfb 100%)';
        backdropEl.style.pointerEvents = 'none';
        document.body.prepend(backdropEl);

        gsap.set(main, {
          scale: 0.9,
          borderRadius: '28px',
          overflow: 'hidden',
          transformOrigin: 'center center',
        });

        const introTl = gsap.timeline({
          onComplete: () => {
            gsap.set(main, { clearProps: 'transform,scale,borderRadius,overflow' });
            if (backdropEl && backdropEl.parentNode) {
              backdropEl.parentNode.removeChild(backdropEl);
              backdropEl = null;
            }
            ScrollTrigger.refresh();
          },
        });

        introTl.to(main, {
          scale: 1,
          borderRadius: '0px',
          duration: 1.4,
          ease: 'expo.inOut',
        });

        // Drop in hero navigation
        const heroNav = document.querySelector('[data-hero-nav]');
        if (heroNav) {
          introTl.fromTo(
            heroNav,
            { y: -60, opacity: 0 },
            { y: 0, opacity: 1, duration: 1.0, ease: 'power3.out' },
            '-=0.9'
          );
        }

        // Hero headline word-by-word reveal
        const heroH1 = document.querySelector('h1[data-reveal-words]');
        if (heroH1) {
          const words = splitWords(heroH1 as HTMLElement);
          if (words.length > 0) {
            introTl.fromTo(
              words,
              { opacity: 0, y: 24, filter: 'blur(10px)' },
              {
                opacity: 1,
                y: 0,
                filter: 'blur(0px)',
                duration: 0.9,
                stagger: 0.07,
                ease: 'power2.out',
              },
              '-=1.0'
            );
          }
        }
      }

      // Generic [data-reveal] elements fade up
      if (!reduced) {
        const reveals = document.querySelectorAll<HTMLElement>('[data-reveal]');
        reveals.forEach((el) => {
          if (el.closest('#hero')) return;
          gsap.fromTo(
            el,
            { opacity: 0, y: 16 },
            {
              opacity: 1,
              y: 0,
              duration: 0.8,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: el,
                start: 'top 85%',
                toggleActions: 'play none none none',
              },
            }
          );
        });

        // Section h2 with [data-reveal-words]
        const sectionH2s = document.querySelectorAll<HTMLElement>('h2[data-reveal-words]');
        sectionH2s.forEach((h2) => {
          if (h2.closest('#hero')) return;
          const words = splitWords(h2);
          if (words.length > 0) {
            gsap.fromTo(
              words,
              { opacity: 0, y: 24, filter: 'blur(10px)' },
              {
                opacity: 1,
                y: 0,
                filter: 'blur(0px)',
                duration: 0.8,
                stagger: 0.07,
                ease: 'power2.out',
                scrollTrigger: {
                  trigger: h2,
                  start: 'top 80%',
                  toggleActions: 'play none none none',
                },
              }
            );
          }
        });
      }

      // Refresh ScrollTrigger after fonts/images load
      if (typeof document !== 'undefined' && 'fonts' in document) {
        document.fonts.ready.then(() => {
          ScrollTrigger.refresh();
        });
      }

      const onWindowLoad = () => ScrollTrigger.refresh();
      window.addEventListener('load', onWindowLoad);
    });

    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      ctx.revert();
      if (tickerCallback) {
        gsap.ticker.remove(tickerCallback);
      }
      if (lenis) {
        lenis.destroy();
      }
      if (backdropEl && backdropEl.parentNode) {
        backdropEl.parentNode.removeChild(backdropEl);
      }
    };
  }, []);

  // 2. Day-to-night journey across the page (scrub CSS variables on scroll)
  useEffect(() => {
    const backdrop = backdropRef.current;
    if (!backdrop) return;

    const reduced = isReducedMotion();
    const isDark = theme === 'dark';

    if (reduced) {
      if (isDark) {
        backdrop.style.setProperty('--sky-top', '#070b1c');
        backdrop.style.setProperty('--sky-mid', '#111a36');
        backdrop.style.setProperty('--sky-bot', '#1c2547');
        backdrop.style.setProperty('--stars-op', '0.75');
      } else {
        backdrop.style.setProperty('--sky-top', '#dcebfb');
        backdrop.style.setProperty('--sky-mid', '#eaf3fd');
        backdrop.style.setProperty('--sky-bot', '#f7faff');
        backdrop.style.setProperty('--stars-op', '0');
      }
      return;
    }

    const ctx = gsap.context(() => {
      const scrubTl = gsap.timeline({
        scrollTrigger: {
          trigger: document.body,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.6,
        },
      });

      if (!isDark) {
        // Light Theme Journey:
        // Top (Hero) = Morning sky
        gsap.set(backdrop, {
          '--sky-top': '#dcebfb',
          '--sky-mid': '#eaf3fd',
          '--sky-bot': '#f7faff',
          '--stars-op': 0,
        });

        // 35% (How it plays) = Golden afternoon
        scrubTl.to(backdrop, {
          '--sky-top': '#fae3bc',
          '--sky-mid': '#fdedd6',
          '--sky-bot': '#fef7ee',
          '--stars-op': 0,
          duration: 0.35,
          ease: 'none',
        });

        // 65% (World) = Soft sunset blush
        scrubTl.to(backdrop, {
          // kept pale enough that the sections' dark text stays readable (AA) on it
          '--sky-top': '#e6cfe4',
          '--sky-mid': '#f6dccf',
          '--sky-bot': '#fde9d6',
          '--stars-op': 0,
          duration: 0.3,
          ease: 'none',
        });

        // 100% (Final CTA & Footer) = Evening lilac
        scrubTl.to(backdrop, {
          // evening lilac: the real night lives in the closing town scene, which draws its own sky
          '--sky-top': '#cdbfe6',
          '--sky-mid': '#e4d6ee',
          '--sky-bot': '#f6e3e6',
          '--stars-op': 0.2,
          duration: 0.35,
          ease: 'none',
        });
      } else {
        // Dark Theme Journey:
        // Top = Dusk
        gsap.set(backdrop, {
          '--sky-top': '#151833',
          '--sky-mid': '#252345',
          '--sky-bot': '#3e2e4a',
          '--stars-op': 0.25,
        });

        // 50% = Twilight
        scrubTl.to(backdrop, {
          '--sky-top': '#0b0f24',
          '--sky-mid': '#141c38',
          '--sky-bot': '#1d274c',
          '--stars-op': 0.65,
          duration: 0.5,
          ease: 'none',
        });

        // 100% = Deep night with stars in full brilliance
        scrubTl.to(backdrop, {
          '--sky-top': '#040612',
          '--sky-mid': '#080d20',
          '--sky-bot': '#0e1633',
          '--stars-op': 1.0,
          duration: 0.5,
          ease: 'none',
        });
      }
    }, backdrop);

    return () => ctx.revert();
  }, [theme]);

  return (
    <div
      ref={backdropRef}
      id="landing-journey-backdrop"
      className="landing-journey-backdrop"
      aria-hidden="true"
    >
      <div className="landing-journey-sky" />
      <div className="landing-journey-stars" />

      {/* Slow ambient pixel clouds (CSS-driven, paused offscreen / hidden) */}
      <div className="journey-cloud journey-cloud-1">
        <PixelCloudSvg />
      </div>
      <div className="journey-cloud journey-cloud-2">
        <PixelCloudSvg flip />
      </div>

    </div>
  );
}
