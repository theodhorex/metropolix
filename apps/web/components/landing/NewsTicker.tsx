'use client';

import type { NewsItem } from '@metropolix/sim';

const KIND_MARK: Record<NewsItem['kind'], { mark: string; tone: string }> = {
  raid: { mark: 'Raid', tone: 'bg-(--bad)' },
  rise: { mark: 'Rise', tone: 'bg-(--good)' },
  you: { mark: 'You', tone: 'bg-(--gold)' },
};

const ROWS = 5;

/**
 * The latest lines from the simulated world of rival mayors. The newest line slides in from the top
 * (the game's own `banner-in` motion, which is switched off under reduced motion in globals.css).
 * Every row has a fixed height so the panel never changes size when news arrives.
 */
export default function NewsTicker({ items, className = '' }: { items: NewsItem[]; className?: string }) {
  const rows = items.slice(0, ROWS);
  return (
    <section aria-label="World news" aria-live="off" className={`panel w-full p-2 ${className}`}>
      <p className="sr-only">A live feed of news from a simulated world of forty rival mayors. It updates every few seconds.</p>
      <p className="font-display mb-1.5 px-1 text-sm font-bold text-(--gold)">World news · simulated</p>
      <ul className="well divide-y divide-(--ink) overflow-hidden">
        {Array.from({ length: ROWS }, (_, i) => {
          const n = rows[i];
          return (
            <li
              key={n ? n.id : `empty-${i}`}
              className={`h-10 items-center gap-2 px-2 ${i === ROWS - 1 ? 'hidden lg:flex' : 'flex'} ${n && i === 0 ? 'banner-in' : ''}`}
            >
              {n ? (
                <>
                  <span className={`shrink-0 border-2 border-(--ink) px-1 font-display text-[11px] leading-4 font-bold text-(--ink) ${KIND_MARK[n.kind].tone}`}>
                    {KIND_MARK[n.kind].mark}
                  </span>
                  <span className={`line-clamp-2 text-[13px] leading-tight ${i === 0 ? 'text-(--paper)' : 'text-(--paper-dim)'}`}>{n.text}</span>
                </>
              ) : (
                <span className="text-[13px] text-(--paper-dim)">{i === 0 ? 'Listening for news from the realm…' : ''}</span>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
