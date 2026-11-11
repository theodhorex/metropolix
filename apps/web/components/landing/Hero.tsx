'use client';

import { useState, type CSSProperties } from 'react';
import Link from 'next/link';
import { ARCS, type ArcId, type NewsItem } from '@metropolix/sim';
import LiveCity from './LiveCity';
import NewsTicker from './NewsTicker';

// Hard, blur-free outline so light text stays readable on top of the moving city (matches the pixel panels).
const INK_TEXT = '[text-shadow:0_2px_0_var(--ink),0_0_8px_rgb(12_16_24/0.9)]';

/**
 * The gate of the realm: the real game builds a city behind the headline, and the visitor can swap
 * the people to watch the same town rise in another style.
 */
export default function Hero() {
  const [arc, setArc] = useState<ArcId>('elf');
  const [news, setNews] = useState<NewsItem[]>([]);

  return (
    <section className="relative isolate min-h-dvh overflow-hidden bg-(--night)">
      <LiveCity arc={arc} onNews={setNews} />

      {/* readable text: dark on the left (wide) or top (narrow), and a fade into the next section */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgb(12_16_24/0.92)_0%,rgb(12_16_24/0.7)_55%,rgb(12_16_24/0.45)_100%)] lg:bg-[linear-gradient(90deg,rgb(12_16_24/0.95)_0%,rgb(12_16_24/0.8)_34%,rgb(12_16_24/0)_68%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(0deg,var(--night),rgb(12_16_24/0))]"
      />

      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-7xl flex-col justify-center px-5 pt-28 pb-12 sm:px-8">
        <div className="max-w-xl lg:max-w-2xl">
          <p className={`font-display text-sm font-bold text-(--gold) sm:text-base ${INK_TEXT}`}>
            A fantasy city builder · headed for NEAR
          </p>
          <h1 className={`font-display mt-3 text-4xl leading-[1.05] font-bold text-balance text-(--paper) sm:text-6xl xl:text-7xl ${INK_TEXT}`}>
            Ten minutes to rule a fantasy realm.
          </h1>
          <p className={`mt-5 max-w-[34rem] text-base leading-relaxed text-(--paper) sm:text-lg ${INK_TEXT}`}>
            Pick a people, raise a city, keep your citizens happy and raid forty rival mayors. It plays in your browser: no sign-up, no download.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/play" className="btn btn-gold min-h-12 px-6! text-lg">Play now</Link>
            <a href="#how" className="btn btn-quiet min-h-12 px-5! text-lg">See how it plays</a>
          </div>

          <div className="mt-8">
            <div role="group" aria-label="Choose a people for the city behind this text" className="flex flex-wrap gap-2">
              {ARCS.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  aria-pressed={arc === a.id}
                  onClick={() => setArc(a.id)}
                  style={{ '--accent': a.accent } as CSSProperties}
                  className="btn min-h-11 px-3! text-sm sm:text-base"
                >
                  <span aria-hidden="true" className="size-3 shrink-0 border-2 border-(--ink) bg-(--accent)" />
                  {a.name}
                </button>
              ))}
            </div>
            <p className={`mt-4 text-sm text-(--paper-dim) ${INK_TEXT}`}>The city behind this text is the real game, running live.</p>
          </div>
        </div>

        <div className="mt-8 w-full max-w-md xl:absolute xl:right-8 xl:bottom-10 xl:mt-0 xl:w-96">
          <NewsTicker items={news} />
        </div>
      </div>
    </section>
  );
}
