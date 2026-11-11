'use client';

import type { NewsItem } from '@metropolix/sim';

const KIND_MARK: Record<NewsItem['kind'], { mark: string; tone: string }> = {
  raid: { mark: 'Raid', tone: 'bg-[#ea6a55]/20 text-[#9b2c1c] border-[#ea6a55]/40' },
  rise: { mark: 'Rise', tone: 'bg-[#7fcf6a]/25 text-[#1b6b27] border-[#7fcf6a]/50' },
  you: { mark: 'You', tone: 'bg-[#f2c14e]/30 text-[#8a5b06] border-[#f2c14e]/60' },
};

const ROWS = 4;

/**
 * The latest lines from the simulated world of rival mayors. Restyled as a small white frosted card
 * over the landscape. Every row has a fixed height so the panel never jumps.
 */
export default function NewsTicker({ items, className = '' }: { items: NewsItem[]; className?: string }) {
  const rows = items.slice(0, ROWS);
  return (
    <section
      aria-label="World news"
      aria-live="off"
      className={`rounded-2xl border border-white/70 bg-white/85 p-3 shadow-[0_8px_30px_rgb(40_60_110/0.14)] backdrop-blur-md ${className}`}
    >
      <p className="sr-only">A live feed of news from a simulated world of forty rival mayors. It updates every few seconds.</p>
      <div className="mb-2 flex items-center justify-between px-1">
        <p className="font-display text-xs font-bold tracking-wide text-[#12151d]">World news · simulated</p>
        <span className="size-1.5 rounded-full bg-[#10b981] animate-pulse" aria-hidden="true" />
      </div>
      <ul className="divide-y divide-[#12151d]/10 overflow-hidden rounded-xl bg-white/60 px-2">
        {Array.from({ length: ROWS }, (_, i) => {
          const n = rows[i];
          return (
            <li
              key={n ? n.id : `empty-${i}`}
              className={`h-9 items-center gap-2 ${n && i === 0 ? 'banner-in' : ''} flex`}
            >
              {n ? (
                <>
                  <span
                    className={`shrink-0 rounded-[2px] border px-1 font-display text-[10px] leading-4 font-bold ${KIND_MARK[n.kind].tone}`}
                  >
                    {KIND_MARK[n.kind].mark}
                  </span>
                  <span
                    className={`line-clamp-1 text-[12px] leading-tight ${i === 0 ? 'font-medium text-[#12151d]' : 'text-[#475069]'}`}
                  >
                    {n.text}
                  </span>
                </>
              ) : (
                <span className="text-[12px] text-[#788198] italic">
                  {i === 0 ? 'Listening for news from the realm…' : ''}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
