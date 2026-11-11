'use client';

import { useState, type CSSProperties } from 'react';
import { ARCS, type ArcId, type NewsItem } from '@metropolix/sim';
import LiveCity from './LiveCity';
import NewsTicker from './NewsTicker';
import Sky from './Sky';
import T from './prefs/T';
import { useTr } from './prefs/store';
import './hero.css';

/** Accent colours darkened until they pass AA (4.5:1) as text on the pale sky; the raw accents stay for dots. */
const TEXT_ACCENT: Record<ArcId, string> = {
  elf: '#25793f',
  lizard: '#68750d',
  caveman: '#9c5a1c',
  dragon: '#c93d27',
  goblin: '#527d0e',
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
      className="hero-root relative isolate min-h-svh overflow-hidden bg-[var(--l-bg)] text-[var(--l-ink)] md:min-h-dvh"
      style={{ '--accent-text': TEXT_ACCENT[arc], '--accent-raw': raw } as CSSProperties}
    >
      <Sky arc={arc}>
        <LiveCity arc={arc} onNews={setNews} />
      </Sky>

      <div className="pointer-events-none relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center px-5 pt-[clamp(6.5rem,30svh,32svh)] text-center">
        <h1
          id="hero-title"
          data-reveal-words
          className="font-serif-display text-balance"
          style={{ fontSize: 'clamp(34px, 5.2vw, 76px)', fontWeight: 400, letterSpacing: '-0.04em', lineHeight: 1.04, color: 'var(--l-ink)' }}
        >
          <T split en="Ten minutes to rule a" id="Sepuluh menit memerintah" ko="10분 만에 다스리는" zh="十分钟统治" /><br />
          <em className="hero-accent font-medium italic"><T split en="fantasy realm." id="negeri fantasi." ko="판타지 왕국." zh="奇幻王国。" /></em>
        </h1>
        <p className="mt-4 max-w-[34rem] text-base leading-relaxed text-pretty text-[var(--l-muted)]">
          <T
            en="Pick a people, raise a city, raid forty rival mayors. In your browser, no sign-up."
            id="Pilih bangsa, bangun kota, serbu empat puluh wali kota rival. Langsung di browser, tanpa daftar."
            ko="종족을 고르고, 도시를 세우며, 40명의 라이벌 시장을 약탈하세요. 브라우저에서 가입 없이 바로."
            zh="选择种族，建立城市，突袭40位竞争城主。无需注册，浏览器即点即玩。"
          />
        </p>

        <div role="group" aria-label={tr('Choose a people for the village below', 'Pilih bangsa untuk desa di bawah', '아래 마을의 종족 선택', '为下方村庄选择种族')} className="pointer-events-auto mt-6 flex flex-wrap justify-center gap-2">
          {ARCS.map((a) => (
            <button
              key={a.id}
              type="button"
              aria-pressed={arc === a.id}
              onClick={() => setArc(a.id)}
              style={{ '--pill': a.accent } as CSSProperties}
              className="font-display inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full bg-[var(--l-surface)] px-4 text-sm font-medium text-[var(--l-ink)] shadow-[0_2px_10px_rgb(40_60_110/0.12)] transition-shadow hover:shadow-[0_3px_14px_rgb(40_60_110/0.2)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--l-ink)] aria-pressed:font-bold aria-pressed:shadow-[0_0_0_2px_var(--l-ink),0_3px_14px_rgb(40_60_110/0.2)]"
            >
              <span aria-hidden="true" className="size-2.5 shrink-0 rounded-full bg-(--pill) shadow-[inset_0_0_0_1px_rgb(18_21_29/0.25)]" />
              {ARC_NAMES[a.id] ? <T {...ARC_NAMES[a.id]} /> : a.name}
            </button>
          ))}
        </div>
        <p className="mt-3 text-xs text-[var(--l-faint)]">
          <T
            en="The village below is the real game, running live."
            id="Desa di bawah adalah game aslinya, berjalan langsung."
            ko="아래 마을은 실제 게임이 실시간으로 구동되는 화면입니다."
            zh="下方村庄是真实运行的游戏实况。"
          />
        </p>
      </div>

      <div className="absolute bottom-4 left-4 z-10 hidden w-72 min-[400px]:block sm:w-80 lg:bottom-6 lg:left-6">
        <NewsTicker items={news} />
      </div>
    </section>
  );
}
