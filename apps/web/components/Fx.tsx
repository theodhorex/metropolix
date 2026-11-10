'use client';

import { useEffect, useState } from 'react';
import Icon, { type IconName } from './Icon';

/*
  Game feedback layer.
  - Floaters: numbers that rise from the spot you tapped ("-100 gold", "Not enough wood").
  - Banners: short announcements for things that happen to the city (level up, a raid, an order filled).
  A tiny module-level bus lets the game loop fire effects without threading props everywhere.
*/

export type Tone = 'good' | 'bad' | 'gold' | 'info';
export interface FloatPart { icon?: IconName; text: string; tone: Tone }
interface Floater { id: number; x: number; y: number; parts: FloatPart[] }
interface Banner { id: number; text: string; tone: Tone; icon: IconName; big?: boolean }

let nextId = 1;
const floatSubs = new Set<(f: Floater) => void>();
const bannerSubs = new Set<(b: Banner) => void>();
const lastBanner = new Map<string, number>();

export const fx = {
  float(x: number, y: number, parts: FloatPart[]) {
    if (parts.length === 0) return;
    const w = typeof window === 'undefined' ? 1e4 : window.innerWidth;
    const f = { id: nextId++, x: Math.max(90, Math.min(w - 90, x)), y: Math.max(40, y), parts };
    floatSubs.forEach((cb) => cb(f));
  },
  banner(text: string, tone: Tone, icon: IconName, big = false) {
    // the same warning again within 45 s stays in the log only
    const now = Date.now();
    if (!big && now - (lastBanner.get(text) ?? -1e9) < 45_000) return;
    lastBanner.set(text, now);
    const b = { id: nextId++, text, tone, icon, big };
    bannerSubs.forEach((cb) => cb(b));
  },
};

/** Decide whether a log line deserves a banner, and how it looks. */
export function classify(msg: string): { tone: Tone; icon: IconName; big?: boolean } | null {
  if (/^Level up/.test(msg)) return { tone: 'gold', icon: 'star', big: true };
  if (/^(Rare|Epic|Legendary|Super Legendary) find!/.test(msg)) return { tone: 'gold', icon: 'chest' };
  if (/raided you/.test(msg)) return { tone: 'bad', icon: 'swords', big: true };
  if (/defense \(\d+\) held|turned back/.test(msg)) return { tone: 'good', icon: 'shield' };
  if (/^Victory/.test(msg)) return { tone: 'gold', icon: 'trophy' };
  if (/^Defeat/.test(msg)) return { tone: 'bad', icon: 'swords' };
  if (/filled your order|took .* from you|^Sold \d+/.test(msg)) return { tone: 'good', icon: 'coin' };
  if (/hungry/.test(msg)) return { tone: 'bad', icon: 'food' };
  if (/leaving/.test(msg)) return { tone: 'bad', icon: 'people' };
  return null;
}

const TONE: Record<Tone, string> = { good: 'var(--good)', bad: 'var(--bad)', gold: 'var(--gold)', info: 'var(--paper)' };

export function Floaters() {
  const [list, setList] = useState<Floater[]>([]);
  useEffect(() => {
    const cb = (f: Floater) => {
      setList((l) => [...l.slice(-7), f]);
      setTimeout(() => setList((l) => l.filter((x) => x.id !== f.id)), 1300);
    };
    floatSubs.add(cb);
    return () => { floatSubs.delete(cb); };
  }, []);
  return (
    <div className="pointer-events-none fixed inset-0 z-[60]" aria-hidden>
      {list.map((f) => (
        <div key={f.id} className="float-up absolute flex -translate-x-1/2 items-center gap-2.5" style={{ left: f.x, top: f.y - 18 }}>
          {f.parts.map((p, i) => (
            <span key={i} className="font-display flex items-center gap-1 text-lg leading-none font-bold whitespace-nowrap [text-shadow:2px_2px_0_#12151d,-1px_-1px_0_#12151d,1px_-1px_0_#12151d,-1px_1px_0_#12151d]" style={{ color: TONE[p.tone] }}>
              {p.icon && <Icon name={p.icon} size={18} />}{p.text}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}

export function Banners() {
  const [list, setList] = useState<Banner[]>([]);
  useEffect(() => {
    const cb = (b: Banner) => {
      setList((l) => [...l.filter((x) => x.text !== b.text).slice(-2), b]);
      setTimeout(() => setList((l) => l.filter((x) => x.id !== b.id)), b.big ? 4200 : 3200);
    };
    bannerSubs.add(cb);
    return () => { bannerSubs.delete(cb); };
  }, []);
  return (
    <div className="pointer-events-none fixed top-14 left-1/2 z-[55] flex w-[min(34rem,92vw)] -translate-x-1/2 flex-col items-center gap-2" role="status" aria-live="polite">
      {list.map((b) => (
        <div key={b.id} className={`banner-in flex w-full items-stretch border-2 border-[var(--ink)] bg-[var(--slab)] shadow-[0_4px_0_var(--ink)] ${b.big ? 'min-h-14' : ''}`}>
          <span className="flex w-12 shrink-0 items-center justify-center border-r-2 border-[var(--ink)]" style={{ background: TONE[b.tone] }}>
            <Icon name={b.icon} size={b.big ? 28 : 22} />
          </span>
          <span className={`flex items-center px-3 py-2 ${b.big ? 'font-display text-lg font-bold' : 'text-sm font-bold'}`}>{b.text}</span>
        </div>
      ))}
    </div>
  );
}

// Dev-only handle so effects can be fired from the browser console during visual QA.
if (process.env.NODE_ENV !== 'production' && typeof window !== 'undefined') (window as unknown as { __fx: typeof fx }).__fx = fx;
