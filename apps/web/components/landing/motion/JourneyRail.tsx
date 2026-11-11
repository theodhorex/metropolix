'use client';

import { useEffect, useRef, useState } from 'react';
import T from '../prefs/T';
import { useTr } from '../prefs/store';
import './journey.css';

/**
 * The visitor's journey through the realm: a pixel road on the left edge with a little knight who walks
 * down as the page scrolls, passing a waypoint flag for every section. Flags are links to the sections.
 * Desktop only (>= 1100px, where the margin has room); hidden for touch-sized screens.
 */
const STOPS: { id: string; en: string; idn: string }[] = [
  { id: 'top', en: 'The gate', idn: 'Gerbang' },
  { id: 'peoples', en: 'Peoples', idn: 'Bangsa' },
  { id: 'how', en: 'A reign', idn: 'Masa kuasa' },
  { id: 'world', en: 'The world', idn: 'Dunia' },
  { id: 'chain', en: 'Roadmap', idn: 'Peta jalan' },
  { id: 'faq', en: 'Questions', idn: 'Tanya jawab' },
];

export default function JourneyRail() {
  const tr = useTr();
  const knight = useRef<HTMLSpanElement>(null);
  const [stops, setStops] = useState<{ id: string; at: number }[]>([]);
  const [active, setActive] = useState('top');
  const [walking, setWalking] = useState(false);

  useEffect(() => {
    let raf = 0, idle = 0;
    const measure = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
      setStops(STOPS.map((s) => {
        const el = s.id === 'top' ? null : document.getElementById(s.id);
        const y = el ? el.getBoundingClientRect().top + scrollY - innerHeight * 0.3 : 0;
        return { id: s.id, at: Math.min(1, Math.max(0, y / max)) };
      }).filter((s, i) => i === 0 || s.at > 0));
    };
    const update = () => {
      raf = 0;
      const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
      const p = Math.min(1, Math.max(0, scrollY / max));
      if (knight.current) knight.current.style.top = `${p * 100}%`;
      let cur = 'top';
      for (const el of STOPS) {
        const sec = el.id === 'top' ? null : document.getElementById(el.id);
        if (sec && sec.getBoundingClientRect().top < innerHeight * 0.45) cur = el.id;
      }
      setActive(cur);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
      setWalking(true);
      clearTimeout(idle);
      idle = window.setTimeout(() => setWalking(false), 180);
    };
    measure(); update();
    const ro = new ResizeObserver(() => { measure(); update(); });
    ro.observe(document.body);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('scroll', onScroll); ro.disconnect(); cancelAnimationFrame(raf); clearTimeout(idle); };
  }, []);

  const go = (id: string) => {
    const el = id === 'top' ? document.body : document.getElementById(id);
    el?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  };

  return (
    <nav className="jr" aria-label={tr('Journey through the page', 'Perjalanan menyusuri halaman')}>
      <div className="jr-road" aria-hidden="true" />
      {stops.map((s) => {
        const meta = STOPS.find((x) => x.id === s.id)!;
        return (
          <button key={s.id} type="button" className="jr-stop" data-on={active === s.id || undefined}
            style={{ top: `${s.at * 100}%` }} onClick={() => go(s.id)} aria-current={active === s.id ? 'location' : undefined}>
            <span className="jr-flag" aria-hidden="true" />
            <span className="jr-label font-display"><T en={meta.en} id={meta.idn} /></span>
          </button>
        );
      })}
      <span ref={knight} className="jr-knight" data-walk={walking || undefined} aria-hidden="true"><span /></span>
    </nav>
  );
}
