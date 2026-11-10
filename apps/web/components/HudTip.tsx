'use client';

import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import Icon, { type IconName } from './Icon';
import { useEscape } from '@/lib/escape';

/** What a resource card says: one line of meaning, live numbers, and an optional hint. */
export interface TipInfo {
  title: string;
  desc: string;
  rows: { k: string; v: ReactNode; tone?: 'good' | 'bad' | 'gold' }[];
  note?: { text: string; tone: 'good' | 'bad' | 'info' };
}

const TONE = { good: 'text-[var(--good)]', bad: 'text-[var(--bad)]', gold: 'text-[var(--gold)]', info: 'text-[var(--paper-dim)]' } as const;
const DELAY_MS = 500;

/**
 * Wraps a top-bar chip. Resting the pointer on it for half a second (or focusing it with the
 * keyboard) opens a card under it with what the number means and where it stands right now.
 */
export function HudTip({ icon, info, children, className = '' }: { icon: IconName; info: TipInfo; children: ReactNode; className?: string }) {
  const [at, setAt] = useState<{ x: number; y: number } | null>(null);
  const anchor = useRef<HTMLSpanElement>(null);
  const timer = useRef<number | null>(null);
  const id = useId();

  const show = () => {
    const r = anchor.current?.getBoundingClientRect();
    if (r) setAt({ x: Math.max(8, Math.min(r.left, window.innerWidth - 296)), y: r.bottom + 6 });
  };
  const hoverIn = () => { if (timer.current === null) timer.current = window.setTimeout(() => { timer.current = null; show(); }, DELAY_MS); };
  const hide = () => { if (timer.current !== null) { window.clearTimeout(timer.current); timer.current = null; } setAt(null); };

  useEscape(at !== null, hide);
  useEffect(() => () => { if (timer.current !== null) window.clearTimeout(timer.current); }, []);

  return (
    <span ref={anchor} tabIndex={0} aria-describedby={at ? id : undefined} aria-label={info.title}
      onMouseEnter={hoverIn} onMouseLeave={hide} onFocus={show} onBlur={hide}
      className={`cursor-help outline-offset-2 ${className}`}>
      {children}
      {at && (
        <div id={id} role="tooltip" className="panel tip-in pointer-events-none fixed z-50 w-72 p-3 text-sm" style={{ left: at.x, top: at.y }}>
          <div className="mb-1 flex items-center gap-2">
            <Icon name={icon} size={20} />
            <b className="font-display text-base">{info.title}</b>
          </div>
          <p className="mb-2 leading-snug text-[var(--paper-dim)]">{info.desc}</p>
          <dl className="space-y-0.5">
            {info.rows.map((r) => (
              <div key={r.k} className="flex items-baseline justify-between gap-3 border-b border-[var(--slab-hi)] py-0.5 last:border-0">
                <dt className="text-[var(--paper-dim)]">{r.k}</dt>
                <dd className={`font-bold tabular-nums ${r.tone ? TONE[r.tone] : ''}`}>{r.v}</dd>
              </div>
            ))}
          </dl>
          {info.note && <p className={`mt-2 font-bold leading-snug ${TONE[info.note.tone]}`}>{info.note.text}</p>}
        </div>
      )}
    </span>
  );
}

/** "+12/s", "-3/s", "0/s" with a sign, for rates in tooltip rows. */
export const perSec = (n: number) => `${n > 0 ? '+' : ''}${n.toLocaleString('en-US')}/s`;
