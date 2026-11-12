'use client';

import { useState, type CSSProperties } from 'react';
import { ARCS, type ArcId, type NewsItem } from '@metropolix/sim';
import LiveCity from './LiveCity';
import NewsTicker from './NewsTicker';
import Sky from './Sky';
import T from './prefs/T';
import { useTr } from './prefs/store';
import './hero.css';

/**
 * Headline accent per people: a vivid fill, plus a deep ink tone of the same hue drawn as a tight
 * pixel drop shadow under the letters, which keeps the word readable on the bright day sky.
 */
const TEXT_ACCENT: Record<ArcId, { fill: string; ink: string }> = {
  elf: { fill: '#13b25a', ink: '#0b3d24' },
  lizard: { fill: '#9fb412', ink: '#3a420a' },
  caveman: { fill: '#e07a1c', ink: '#4f2a0c' },
  dragon: { fill: '#f0442c', ink: '#5a140c' },
  goblin: { fill: '#74b81a', ink: '#27420a' },
};

const ARC_NAMES: Record<ArcId, { en: string; id: string; ko: string; zh: string }> = {
  elf: { en: 'Elves', id: 'Elf', ko: '엘프', zh: '精灵' },
  lizard: { en: 'Lizardfolk', id: 'Kaum Kadal', ko: '리저드포크', zh: '蜥蜴人' },
  caveman: { en: 'Cavemen', id: 'Manusia Gua', ko: '원시인', zh: '穴居人' },
  dragon: { en: 'Dragonkin', id: 'Kaum Naga', ko: '드래곤족', zh: '龙裔' },
  goblin: { en: 'Goblins', id: 'Goblin', ko: '고블린', zh: '哥布林' },
};

/**
 * The gate of the realm: a bright pixel sky over a valley where the real game builds a village. The
 * visitor can swap the people to watch the same town rise in another style.
 */
export default function Hero() {
  const [arc, setArc] = useState<ArcId>('elf');
  const [news, setNews] = useState<NewsItem[]>([]);
  const tr = useTr();
  const raw = ARCS.find((a) => a.id === arc)?.accent ?? '#5fc07a';

  return (
    <section
      aria-labelledby="hero-title"
      className="hero-root relative isolate min-h-svh overflow-hidden text-[var(--l-ink)] md:min-h-dvh"
      style={{ '--accent-text': TEXT_ACCENT[arc].fill, '--accent-ink': TEXT_ACCENT[arc].ink, '--accent-raw': raw } as CSSProperties}
    >
      <Sky arc={arc} />

      <div className="relative z-10 mx-auto grid min-h-svh w-full max-w-7xl items-center gap-2 px-5 pt-[6.5rem] pb-6 md:min-h-dvh lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-6 lg:px-10 lg:pt-20 lg:pb-4">
      <div className="pointer-events-none flex flex-col items-center text-center lg:items-start lg:text-left">
        <h1
          id="hero-title"
          data-reveal-words
          className="font-serif-display text-balance"
          style={{ fontSize: 'clamp(34px, 4.6vw, 70px)', fontWeight: 400, letterSpacing: '-0.04em', lineHeight: 1.04, color: 'var(--l-ink)' }}
        >
          <T split en="Ten minutes to rule a" id="Sepuluh menit memerintah" ko="10분 만에 다스리는" zh="十分钟统治" /><br />
          <em className="hero-accent font-medium italic"><T split en="fantasy realm." id="negeri fantasi." ko="판타지 왕국." zh="奇幻王国。" /></em>
        </h1>
        <p data-hero-rest className="mt-4 max-w-[34rem] text-base leading-relaxed text-pretty text-[var(--l-muted)]">
          <T
            en="Pick a people, raise a city, raid forty rival mayors. In your browser, no sign-up."
            id="Pilih bangsa, bangun kota, serbu empat puluh wali kota rival. Langsung di browser, tanpa daftar."
            ko="종족을 고르고, 도시를 세우며, 40명의 라이벌 시장을 약탈하세요. 브라우저에서 가입 없이 바로."
            zh="选择种族，建立城市，突袭40位竞争城主。无需注册，浏览器即点即玩。"
          />
        </p>

        <div data-hero-rest role="group" aria-label={tr('Choose a people for the floating village', 'Pilih bangsa untuk desa melayang', '떠 있는 마을의 종족 선택', '为浮空村庄选择种族')} className="pointer-events-auto mt-6 flex flex-wrap justify-center gap-1.5 lg:justify-start">
          {ARCS.map((a) => (
            <button
              key={a.id}
              type="button"
              aria-pressed={arc === a.id}
              onClick={() => setArc(a.id)}
              style={{ '--pill': a.accent } as CSSProperties}
              className="hero-chip font-display inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-full bg-[var(--l-surface)] px-3 text-sm font-medium text-[var(--l-ink)] shadow-[0_2px_10px_rgb(40_60_110/0.12)] hover:shadow-[0_3px_14px_rgb(40_60_110/0.2)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--l-ink)] aria-pressed:font-bold aria-pressed:shadow-[0_0_0_2px_var(--l-ink),0_3px_14px_rgb(40_60_110/0.2)]"
            >
              <span aria-hidden="true" className="size-2.5 shrink-0 rounded-full bg-(--pill) shadow-[inset_0_0_0_1px_rgb(18_21_29/0.25)]" />
              {ARC_NAMES[a.id] ? <T {...ARC_NAMES[a.id]} /> : a.name}
            </button>
          ))}
        </div>
        <p data-hero-rest className="mt-3 text-xs text-[var(--l-faint)]">
          <T
            en="The floating village is the real game, running live."
            id="Desa melayang itu adalah game aslinya, berjalan langsung."
            ko="떠 있는 마을은 실제 게임이 실시간으로 구동되는 화면입니다."
            zh="这座浮空村庄就是实时运行的真实游戏。"
          />
        </p>
      </div>

      {/* the real game on its own map, floating as an island */}
      <div className="relative w-full">
        <div className="hero-town relative h-[min(62svh,96vw)] w-full lg:h-[min(86svh,880px)]">
          <LiveCity arc={arc} onNews={setNews} />
        </div>
        {/* news from the simulated world around the island: under it, out toward the right edge of the screen */}
        <NewsTicker items={news} className="hero-news relative z-10 mx-auto -mt-2 lg:absolute lg:right-[min(-1rem,calc((80rem-100vw)/2-1rem))] lg:bottom-[3%] lg:mt-0" />
      </div>
      </div>
    </section>
  );
}
