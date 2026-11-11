'use client';

import type { NewsItem } from '@metropolix/sim';
import T from './prefs/T';
import { useTr } from './prefs/store';

const KIND_MARK: Record<NewsItem['kind'], { en: string; id: string; ko: string; zh: string }> = {
  raid: { en: 'Raid', id: 'Serbu', ko: '약탈', zh: '突袭' },
  rise: { en: 'Rise', id: 'Naik', ko: '성장', zh: '崛起' },
  you: { en: 'You', id: 'Kamu', ko: '당신', zh: '你' },
};

const ROWS = 4;

/**
 * The latest lines from the simulated world of rival mayors around the floating village: a small
 * pixel notice board under the island. Rows have a fixed height so the board never jumps; the newest
 * line slides in from the top.
 */
export default function NewsTicker({ items, className = '' }: { items: NewsItem[]; className?: string }) {
  const tr = useTr();
  const rows = items.slice(0, ROWS);
  return (
    <section aria-label={tr('World news', 'Berita dunia', '세계 소식', '世界动态')} aria-live="off" className={`news-board ${className}`}>
      <p className="sr-only">
        <T
          en="A live feed of news from a simulated world of forty rival mayors. It updates every few seconds."
          id="Kabar terkini dari dunia simulasi berisi empat puluh wali kota rival. Diperbarui setiap beberapa detik."
          ko="40명의 라이벌 시장이 등장하는 시뮬레이션 세계의 실시간 뉴스 피드입니다. 몇 초마다 업데이트됩니다."
          zh="来自40位竞争城主所在模拟世界的即时新闻动态。每隔数秒更新一次。"
        />
      </p>
      <div className="news-head">
        <p className="font-display">
          <T en="World news · simulated" id="Berita dunia · simulasi" ko="세계 소식 · 시뮬레이션" zh="世界动态 · 模拟" />
        </p>
        <span className="news-live" aria-hidden="true" />
      </div>
      <ul className="news-rows">
        {Array.from({ length: ROWS }, (_, i) => {
          const n = rows[i];
          return (
            <li key={n ? n.id : `empty-${i}`} className={n && i === 0 ? 'news-new' : undefined}>
              {n ? (
                <>
                  <span className="news-tag font-display" data-kind={n.kind}><T {...KIND_MARK[n.kind]} /></span>
                  <span className={`news-text ${i === 0 ? 'news-text-top' : ''}`}>{n.text}</span>
                </>
              ) : i === 0 ? (
                <span className="news-text news-wait">
                  <T en="Listening for news from the realm…" id="Mendengarkan kabar dari negeri…" ko="왕국의 소식을 기다리는 중…" zh="正在探听王国的最新消息…" />
                </span>
              ) : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
