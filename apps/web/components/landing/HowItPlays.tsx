'use client';

import { useState } from 'react';
import Image from 'next/image';

const STEPS = [
  {
    num: '1',
    color: '#5fc07a', // Elf accent
    arcName: 'Elf Realm',
    title: 'Build',
    text: 'Houses bring citizens, jobs bring gold. Upgrades change how a building looks and what it does.',
    src: '/landing/building-upgrade.png',
    w: 624,
    h: 600,
    alt: 'The barracks window showing level 2, what level 3 would add (more troop room, higher upkeep), and a gold Upgrade button.',
  },
  {
    num: '2',
    color: '#e8a13a', // Lizard accent
    arcName: 'Lizard Dune',
    title: 'Balance',
    text: 'Tax against happiness. Keep food flowing, build schools and parks, and watch the gold in your vault.',
    src: '/landing/economy.png',
    w: 892,
    h: 652,
    alt: 'The economy window with a tax rate slider and a table showing net gold per second and happiness at each tax rate.',
  },
  {
    num: '3',
    color: '#e5594a', // Dragon accent
    arcName: 'Dragon Spire',
    title: 'Raid',
    text: "Train troops in the war room and raid rival mayors' treasuries. They raid you back.",
    src: '/landing/war-room.png',
    w: 1018,
    h: 790,
    alt: 'The war room window with heroes, archer troop types, spells, siege and a Pick a target button.',
  },
];

const GALLERY = [
  {
    title: 'Market',
    text: 'A market of simulated traders.',
    src: '/landing/market.png',
    w: 1018,
    h: 790,
    alt: 'The marketplace window listing special goods and materials with buy and sell buttons.',
  },
  {
    title: 'Vault',
    text: 'The vault of rare treasures found in your city.',
    src: '/landing/vault.png',
    w: 892,
    h: 790,
    alt: 'The vault window with treasures on display and a list of rare finds.',
  },
  {
    title: 'Chronicle',
    text: 'The chronicle of your reign.',
    src: '/landing/chronicle.png',
    w: 892,
    h: 790,
    alt: 'The chronicle page listing each treasure your city has dug up.',
  },
  {
    title: 'Mayor profile',
    text: 'Your mayor profile.',
    src: '/landing/profile.png',
    w: 764,
    h: 593,
    alt: 'A mayor profile with portrait, level, ChainPower, gold, citizens and battle record.',
  },
];

export default function HowItPlays() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section id="how" aria-labelledby="how-h" className="l-section relative bg-[#fdfdfc] py-20">
      <div className="landing-grid-faint" aria-hidden="true" />
      <div className="pixel-divider -mt-20 mb-16" aria-hidden="true" />

      <div className="mx-auto max-w-6xl px-4">
        <div className="text-center" data-reveal>
          <div className="mb-3">
            <span className="landing-pill">How it plays</span>
          </div>
          <h2 id="how-h" data-reveal-words className="landing-h2">
            How a reign goes
          </h2>
          <p className="mx-auto mt-4 max-w-prose text-base text-[var(--landing-ink-muted)] sm:text-lg">
            Ten minutes to build, balance and defend your realm against rival mayors.
          </p>
        </div>
      </div>

      {/* Desktop 3-Panel Accordion (>= 761px) */}
      <div className="mx-auto mt-14 hidden w-full max-w-7xl px-4 min-[761px]:block" data-reveal>
        <div
          role="tablist"
          aria-label="How it plays steps"
          className="flex h-[74vh] min-h-[580px] max-h-[820px] w-full overflow-hidden rounded-lg border border-[rgba(18,21,29,0.12)] bg-white shadow-sm"
        >
          {STEPS.map((s, i) => {
            const isActive = activeStep === i;
            return (
              <div
                key={s.title}
                role="tab"
                tabIndex={0}
                aria-selected={isActive}
                aria-label={`Step ${s.num}: ${s.title}`}
                onMouseEnter={() => setActiveStep(i)}
                onFocus={() => setActiveStep(i)}
                onClick={() => setActiveStep(i)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setActiveStep(i);
                  }
                }}
                className={`how-panel relative flex cursor-pointer flex-col overflow-hidden border-r border-[rgba(18,21,29,0.1)] last:border-r-0 ${
                  isActive ? 'bg-[#ffffff]' : 'bg-[#f8f9fa] hover:bg-[#f3f4f6]'
                }`}
                style={{
                  flexGrow: isActive ? 1 : 0,
                  flexShrink: 0,
                  flexBasis: 'clamp(96px, 11vw, 170px)',
                }}
              >
                {/* Giant Numeral clipped in collapsed strip */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3 top-2 select-none font-display font-bold leading-none"
                  style={{
                    color: s.color,
                    fontSize: 'clamp(170px, 36vh, 380px)',
                    opacity: isActive ? 0.12 : 0.38,
                    transform: 'translateY(-10%)',
                    transition: 'opacity 0.6s ease',
                  }}
                >
                  {s.num}
                </div>

                {/* Collapsed strip vertical title */}
                {!isActive && (
                  <div
                    aria-hidden="true"
                    className="absolute bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap font-display text-sm font-bold tracking-wider text-[var(--landing-ink)]"
                    style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                  >
                    <span style={{ color: s.color }} className="mr-2">0{s.num}.</span>
                    {s.title}
                  </div>
                )}

                {/* Active Panel Content */}
                <div
                  className={`relative z-10 flex h-full flex-col p-8 transition-all duration-700 ${
                    isActive
                      ? 'opacity-100 blur-0'
                      : 'pointer-events-none opacity-0 blur-sm'
                  }`}
                >
                  <div className="max-w-xl">
                    <div className="flex items-center gap-3">
                      <span
                        className="font-display text-base font-bold"
                        style={{ color: s.color }}
                      >
                        Step {s.num}
                      </span>
                      <span className="h-1 w-1 rounded-full bg-[rgba(18,21,29,0.2)]" />
                      <span className="text-xs font-semibold text-[var(--landing-ink-muted)]">
                        {s.arcName}
                      </span>
                    </div>

                    <h3 className="mt-2 font-serif-display text-3xl font-normal tracking-tight text-[var(--landing-ink)] sm:text-4xl">
                      {s.title}
                    </h3>
                    <p className="mt-3 text-base leading-relaxed text-[var(--landing-ink-muted)]">
                      {s.text}
                    </p>
                  </div>

                  {/* Screenshot in soft frame */}
                  <div className="mt-6 flex flex-1 items-center justify-center overflow-hidden">
                    <figure className="shot-light max-h-[460px] w-full max-w-2xl">
                      <Image
                        src={s.src}
                        alt={s.alt}
                        width={s.w}
                        height={s.h}
                        className="max-h-[460px] w-full object-contain"
                        priority={i === 0}
                      />
                    </figure>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile Stacked List (<= 760px) */}
      <div className="mx-auto mt-10 max-w-xl px-4 min-[761px]:hidden">
        <ol className="space-y-12">
          {STEPS.map((s) => (
            <li
              key={s.title}
              className="flex flex-col gap-4 rounded-lg border border-[rgba(18,21,29,0.1)] bg-white p-6 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <span
                  className="font-display text-3xl font-bold"
                  style={{ color: s.color }}
                >
                  {s.num}.
                </span>
                <h3 className="font-serif-display text-2xl font-normal text-[var(--landing-ink)]">
                  {s.title}
                </h3>
              </div>
              <p className="text-sm leading-relaxed text-[var(--landing-ink-muted)]">
                {s.text}
              </p>
              <figure className="shot-light mt-2">
                <Image
                  src={s.src}
                  alt={s.alt}
                  width={s.w}
                  height={s.h}
                  sizes="100vw"
                  loading="lazy"
                />
              </figure>
            </li>
          ))}
        </ol>
      </div>

      {/* Small Gallery Strip Below (restyled light) */}
      <div className="mx-auto mt-24 max-w-6xl px-4">
        <div className="mb-8 text-center" data-reveal>
          <span className="landing-pill mb-2">City Life</span>
          <h3 className="font-serif-display text-2xl font-normal tracking-tight text-[var(--landing-ink)] sm:text-3xl">
            And the rest of the realm
          </h3>
          <p className="mt-2 text-sm text-[var(--landing-ink-muted)]">
            Every feature drawn in crisp pixel art with real simulation numbers.
          </p>
        </div>

        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4" data-reveal>
          {GALLERY.map((g) => (
            <li
              key={g.title}
              className="group flex flex-col overflow-hidden rounded-md border border-[rgba(18,21,29,0.1)] bg-white p-3 shadow-sm transition-all hover:shadow-md"
            >
              <figure className="flex flex-1 flex-col">
                <div className="shot-light overflow-hidden bg-[#f3f4f6]">
                  <Image
                    src={g.src}
                    alt={g.alt}
                    width={g.w}
                    height={g.h}
                    sizes="(min-width: 1024px) 270px, (min-width: 640px) 45vw, 100vw"
                    loading="lazy"
                    className="transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                </div>
                <figcaption className="mt-3.5 text-xs text-[var(--landing-ink-muted)]">
                  <b className="font-display text-sm font-bold text-[var(--landing-ink)]">
                    {g.title}.
                  </b>{' '}
                  {g.text}
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
