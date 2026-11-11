'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { setPrefs, usePrefs } from './store';
import './prefs.css';

/**
 * The theme and language switch: a small floating pill. Switching the theme sends a pixel sun (or moon)
 * arcing across the sky while a wave of pixel tiles washes the page into day or night. Switching the
 * language flickers every bilingual string like a sign being repainted.
 */
const COLS = 14;

export default function PrefsToggle() {
  const { theme, lang } = usePrefs();
  const fx = useRef<HTMLDivElement>(null);
  const busy = useRef(false);

  const still = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const flipTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    const el = fx.current;
    if (!el || still() || busy.current) { setPrefs({ theme: next }); return; }
    busy.current = true;
    el.dataset.to = next;
    const tiles = el.querySelectorAll('.pf-tile');
    const orb = el.querySelector('.pf-orb');
    gsap.timeline({ onComplete: () => { busy.current = false; gsap.set(el, { autoAlpha: 0 }); } })
      .set(el, { autoAlpha: 1 })
      .fromTo(orb, { xPercent: -50, x: '-10vw', y: '40vh', scale: 0.6 },
        { x: '110vw', y: '-6vh', scale: 1.15, duration: 1.15, ease: 'sine.inOut' }, 0)
      .fromTo(tiles, { scaleY: 0, transformOrigin: next === 'dark' ? '50% 0%' : '50% 100%' },
        { scaleY: 1, duration: 0.32, ease: 'steps(4)', stagger: { each: 0.025, from: next === 'dark' ? 'start' : 'end', grid: [1, COLS] } }, 0.05)
      .add(() => setPrefs({ theme: next }), 0.5)
      .to(tiles, { scaleY: 0, transformOrigin: next === 'dark' ? '50% 100%' : '50% 0%', duration: 0.3, ease: 'steps(4)', stagger: { each: 0.025, from: next === 'dark' ? 'start' : 'end' } }, 0.6);
  };

  const flipLang = () => {
    const next = lang === 'en' ? 'id' : 'en';
    const m = document.querySelector<HTMLElement>('main[data-page="landing"]');
    if (m && !still()) {
      m.classList.remove('lang-swap');
      void m.offsetWidth; // restart the animation
      m.classList.add('lang-swap');
      window.setTimeout(() => m.classList.remove('lang-swap'), 520);
    }
    setPrefs({ lang: next });
  };

  return (
    <>
      <div className="pf-pill" role="group" aria-label={lang === 'id' ? 'Tampilan' : 'Display'}>
        <button type="button" className="pf-btn" onClick={flipTheme} aria-pressed={theme === 'dark'}
          aria-label={theme === 'dark' ? (lang === 'id' ? 'Ganti ke tema terang' : 'Switch to light theme') : (lang === 'id' ? 'Ganti ke tema gelap' : 'Switch to dark theme')}>
          <span className="pf-icon" data-kind={theme === 'dark' ? 'moon' : 'sun'} aria-hidden="true" />
        </button>
        <span className="pf-sep" aria-hidden="true" />
        <button type="button" className="pf-btn pf-lang font-display" onClick={flipLang}
          aria-label={lang === 'id' ? 'Switch to English' : 'Ganti ke Bahasa Indonesia'}>
          <span data-on={lang === 'en' || undefined}>EN</span>
          <span data-on={lang === 'id' || undefined}>ID</span>
        </button>
      </div>
      <div ref={fx} className="pf-fx" aria-hidden="true">
        <div className="pf-tiles">{Array.from({ length: COLS }, (_, i) => <span key={i} className="pf-tile" />)}</div>
        <span className="pf-orb" />
      </div>
    </>
  );
}
