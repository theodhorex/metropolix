'use client';

import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import gsap from 'gsap';
import { setPrefs, usePrefs, useTr } from './store';
import { LANGS, type Lang } from './langs';
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
  const tr = useTr();
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const langBtn = useRef<HTMLButtonElement>(null);
  const cur = LANGS.find((l) => l.code === lang)!;

  // close the language menu on an outside click or Escape
  useEffect(() => {
    if (!open) return;
    const away = (e: PointerEvent) => { if (!wrap.current?.contains(e.target as Node)) setOpen(false); };
    const esc = (e: globalThis.KeyboardEvent) => { if (e.key === 'Escape') { setOpen(false); langBtn.current?.focus(); } };
    document.addEventListener('pointerdown', away);
    document.addEventListener('keydown', esc);
    const menu = wrap.current?.querySelector('.pf-menu');
    (menu?.querySelector<HTMLButtonElement>('[aria-current]') ?? menu?.querySelector<HTMLButtonElement>('button'))?.focus();
    return () => { document.removeEventListener('pointerdown', away); document.removeEventListener('keydown', esc); };
  }, [open]);

  // arrow keys move between the four languages
  const onMenuKey = (e: KeyboardEvent<HTMLUListElement>) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    e.preventDefault();
    const items = [...e.currentTarget.querySelectorAll<HTMLButtonElement>('button')];
    const i = items.indexOf(document.activeElement as HTMLButtonElement);
    items[(i + (e.key === 'ArrowDown' ? 1 : items.length - 1)) % items.length]?.focus();
  };

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

  const pickLang = (next: Lang) => {
    setOpen(false);
    langBtn.current?.focus();
    if (next === lang) return;
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
      <div className="pf-pill" role="group" aria-label={tr('Display', 'Tampilan', '화면', '显示')}>
        <button type="button" className="pf-btn" onClick={flipTheme} aria-pressed={theme === 'dark'}
          aria-label={tr('Dark theme', 'Tema gelap', '어두운 테마', '深色主题')}>
          <span className="pf-icon" data-kind={theme === 'dark' ? 'moon' : 'sun'} aria-hidden="true" />
        </button>
        <span className="pf-sep" aria-hidden="true" />
        <div className="pf-langwrap" ref={wrap}>
          <button type="button" ref={langBtn} className="pf-btn pf-lang font-display" onClick={() => setOpen((o) => !o)}
            aria-haspopup="true" aria-expanded={open} aria-controls="pf-langmenu"
            aria-label={`${tr('Language', 'Bahasa', '언어', '语言')}: ${cur.name}`}>
            <span className="pf-globe" aria-hidden="true" />
            <span>{cur.short}</span>
          </button>
          <ul id="pf-langmenu" className="pf-menu" data-open={open || undefined} aria-label={tr('Language', 'Bahasa', '언어', '语言')}
            onKeyDown={onMenuKey}>
            {LANGS.map((l) => (
              <li key={l.code}>
                <button type="button" lang={l.tag} aria-current={l.code === lang || undefined} tabIndex={open ? 0 : -1}
                  onClick={() => pickLang(l.code)}>
                  <span className="pf-code font-display" aria-hidden="true">{l.short}</span>
                  <span>{l.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div ref={fx} className="pf-fx" aria-hidden="true">
        <div className="pf-tiles">{Array.from({ length: COLS }, (_, i) => <span key={i} className="pf-tile" />)}</div>
        <span className="pf-orb" />
      </div>
    </>
  );
}
