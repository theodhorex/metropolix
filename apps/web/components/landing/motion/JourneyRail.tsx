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
interface StopDef {
  id: string;
  label: { en: string; id: string; ko: string; zh: string };
}

const STOPS: readonly StopDef[] = [
  { id: 'top', label: { en: 'The gate', id: 'Gerbang', ko: '성문', zh: '城门' } },
  { id: 'peoples', label: { en: 'Peoples', id: 'Bangsa', ko: '종족', zh: '种族' } },
  { id: 'how', label: { en: 'A reign', id: 'Masa kuasa', ko: '통치', zh: '统治时代' } },
  { id: 'world', label: { en: 'The world', id: 'Dunia', ko: '세계', zh: '世界' } },
  { id: 'chain', label: { en: 'On chain', id: 'On-chain', ko: '온체인', zh: '链上' } },
  { id: 'faq', label: { en: 'Questions', id: 'Tanya jawab', ko: '자주 묻는 질문', zh: '常见问题' } },
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
    <nav className="jr" aria-label={tr('Journey through the page', 'Perjalanan menyusuri halaman', '페이지 둘러보기', '页面导览')}>
      <div className="jr-road" aria-hidden="true" />
      {stops.map((s) => {
        const meta = STOPS.find((x) => x.id === s.id)!;
        return (
          <button key={s.id} type="button" className="jr-stop" data-on={active === s.id || undefined}
            style={{ top: `${s.at * 100}%` }} onClick={() => go(s.id)} aria-current={active === s.id ? 'location' : undefined}>
            <span className="jr-flag" aria-hidden="true" />
            <span className="jr-label font-display"><T {...meta.label} /></span>
          </button>
        );
      })}
      <span ref={knight} className="jr-knight" data-walk={walking || undefined} aria-hidden="true"><span /></span>
    </nav>
  );
}
