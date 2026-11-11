'use client';

import type { NewsItem } from '@metropolix/sim';
import T from './prefs/T';

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
      className={`rounded-2xl border border-[var(--l-line)] bg-[color-mix(in_srgb,var(--l-surface)_86%,transparent)] p-3 shadow-[0_8px_30px_var(--l-shadow)] backdrop-blur-md ${className}`}
    >
      <p className="sr-only">A live feed of news from a simulated world of forty rival mayors. It updates every few seconds.</p>
      <div className="mb-2 flex items-center justify-between px-1">
        <p className="font-display text-xs font-bold tracking-wide text-[var(--l-ink)]"><T en="World news · simulated" id="Berita dunia · simulasi" /></p>
        <span className="size-1.5 rounded-full bg-[#10b981] animate-pulse" aria-hidden="true" />
      </div>
      <ul className="divide-y divide-[var(--l-line)] overflow-hidden rounded-xl bg-[color-mix(in_srgb,var(--l-surface-2)_70%,transparent)] px-2">
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
                    className={`line-clamp-1 text-[12px] leading-tight ${i === 0 ? 'font-medium text-[var(--l-ink)]' : 'text-[var(--l-muted)]'}`}
                  >
                    {n.text}
                  </span>
                </>
              ) : (
                <span className="text-[12px] text-[var(--l-faint)] italic">
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
