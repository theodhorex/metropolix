'use client';

import { useState, type CSSProperties } from 'react';
import { ARCS, type ArcId, type NewsItem } from '@metropolix/sim';
import LiveCity from './LiveCity';
import NewsTicker from './NewsTicker';
import Sky from './Sky';
import './hero.css';

/** Accent colours darkened until they pass AA (4.5:1) as text on the pale sky; the raw accents stay for dots. */
const TEXT_ACCENT: Record<ArcId, string> = {
  elf: '#25793f',
  lizard: '#68750d',
  caveman: '#9c5a1c',
  dragon: '#c93d27',
  goblin: '#527d0e',
};

/**
 * The gate of the realm: a bright pixel sky over a valley where the real game builds a village. The
 * visitor can swap the people to watch the same town rise in another style.
 */
export default function Hero() {
  const [arc, setArc] = useState<ArcId>('elf');
  const [news, setNews] = useState<NewsItem[]>([]);

  return (
    <section
      aria-labelledby="hero-title"
      className="relative isolate min-h-svh overflow-hidden bg-[#fbfcfe] text-(--ink) md:min-h-dvh"
      style={{ '--accent-text': TEXT_ACCENT[arc] } as CSSProperties}
    >
      <Sky arc={arc}>
        <LiveCity arc={arc} onNews={setNews} />
      </Sky>

      <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center px-5 pt-[clamp(6.5rem,30svh,32svh)] text-center">
        <h1
          id="hero-title"
          data-reveal-words
          className="font-serif-display text-balance"
          style={{ fontSize: 'clamp(34px, 5.2vw, 76px)', fontWeight: 400, letterSpacing: '-0.04em', lineHeight: 1.04, color: '#12151d' }}
        >
          Ten minutes to rule a<br />
          <em className="font-medium italic" style={{ color: 'var(--accent-text)' }}>fantasy realm.</em>
        </h1>
        <p className="mt-4 max-w-[34rem] text-base leading-relaxed text-pretty text-[#444b5e]">
          Pick a people, raise a city, raid forty rival mayors. In your browser, no sign-up.
        </p>

        <div role="group" aria-label="Choose a people for the village below" className="mt-6 flex flex-wrap justify-center gap-2">
          {ARCS.map((a) => (
            <button
              key={a.id}
              type="button"
              aria-pressed={arc === a.id}
              onClick={() => setArc(a.id)}
              style={{ '--pill': a.accent } as CSSProperties}
              className="font-display inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full bg-white px-4 text-sm font-medium text-(--ink) shadow-[0_2px_10px_rgb(40_60_110/0.12)] transition-shadow hover:shadow-[0_3px_14px_rgb(40_60_110/0.2)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--ink) aria-pressed:font-bold aria-pressed:shadow-[0_0_0_2px_var(--ink),0_3px_14px_rgb(40_60_110/0.2)]"
            >
              <span aria-hidden="true" className="size-2.5 shrink-0 rounded-full bg-(--pill) shadow-[inset_0_0_0_1px_rgb(18_21_29/0.25)]" />
              {a.name}
            </button>
          ))}
        </div>
        <p className="mt-3 text-xs text-[#5a6174]">The village below is the real game, running live.</p>
      </div>

      <div className="absolute bottom-4 left-4 z-10 hidden w-72 min-[400px]:block sm:w-80 lg:bottom-6 lg:left-6">
        <NewsTicker items={news} />
      </div>
    </section>
  );
}
