'use client';

import type { NewsItem } from '@metropolix/sim';
import T from './prefs/T';
import { useTr } from './prefs/store';

const KIND_MARK: Record<NewsItem['kind'], {
  mark: { en: string; id: string; ko: string; zh: string };
  tone: string;
}> = {
  raid: {
    mark: { en: 'Raid', id: 'Serbu', ko: '약탈', zh: '突袭' },
    tone: 'bg-[#ea6a55]/20 text-[#9b2c1c] border-[#ea6a55]/40',
  },
  rise: {
    mark: { en: 'Rise', id: 'Bangkit', ko: '성장', zh: '崛起' },
    tone: 'bg-[#7fcf6a]/25 text-[#1b6b27] border-[#7fcf6a]/50',
  },
  you: {
    mark: { en: 'You', id: 'Kamu', ko: '당신', zh: '你' },
    tone: 'bg-[#f2c14e]/30 text-[#8a5b06] border-[#f2c14e]/60',
  },
};

const ROWS = 4;

/**
 * The latest lines from the simulated world of rival mayors. Restyled as a small white frosted card
 * over the landscape. Every row has a fixed height so the panel never jumps.
 */
export default function NewsTicker({ items, className = '' }: { items: NewsItem[]; className?: string }) {
  const tr = useTr();
  const rows = items.slice(0, ROWS);
  return (
    <section
      aria-label={tr('World news', 'Berita dunia', '세계 소식', '世界动态')}
      aria-live="off"
      className={`rounded-2xl border border-[var(--l-line)] bg-[color-mix(in_srgb,var(--l-surface)_86%,transparent)] p-3 shadow-[0_8px_30px_var(--l-shadow)] backdrop-blur-md ${className}`}
    >
      <p className="sr-only">
        <T
          en="A live feed of news from a simulated world of forty rival mayors. It updates every few seconds."
          id="Kabar terkini dari dunia simulasi berisi empat puluh wali kota rival. Diperbarui setiap beberapa detik."
          ko="40명의 라이벌 시장이 등장하는 시뮬레이션 세계의 실시간 뉴스 피드입니다. 몇 초마다 업데이트됩니다."
          zh="来自40位竞争城主所在模拟世界的即时新闻动态。每隔数秒更新一次。"
        />
      </p>
      <div className="mb-2 flex items-center justify-between px-1">
        <p className="font-display text-xs font-bold tracking-wide text-[var(--l-ink)]">
          <T
            en="World news · simulated"
            id="Berita dunia · simulasi"
            ko="세계 소식 · 시뮬레이션"
            zh="世界动态 · 模拟"
          />
        </p>
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
                    <T {...KIND_MARK[n.kind].mark} />
                  </span>
                  <span
                    className={`line-clamp-1 text-[12px] leading-tight ${i === 0 ? 'font-medium text-[var(--l-ink)]' : 'text-[var(--l-muted)]'}`}
                  >
                    {n.text}
                  </span>
                </>
              ) : (
                <span className="text-[12px] text-[var(--l-faint)] italic">
                  {i === 0 ? (
                    <T
                      en="Listening for news from the realm…"
                      id="Mendengarkan kabar dari kerajaan…"
                      ko="왕국의 소식을 기다리는 중…"
                      zh="正在探听王国的最新消息…"
                    />
                  ) : ''}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
