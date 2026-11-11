'use client';

import Link from 'next/link';
import { useFoundRelics, TOTAL_HERO_RELICS } from './hero/relicStore';
import { useTr } from './prefs/store';
import T from './prefs/T';

const GITHUB = 'https://github.com/theodhorex/metropolix';

/**
 * Pixel crest: Metropolix castle icon (16x16 grid, crisp pixels, 3 colours: ink, gold, surface).
 */
function Crest() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      className="size-5 shrink-0"
      shapeRendering="crispEdges"
      style={{ imageRendering: 'pixelated' }}
    >
      <rect x="2" y="2" width="3" height="4" fill="var(--gold, #f2c14e)" />
      <rect x="7" y="2" width="2" height="4" fill="var(--gold, #f2c14e)" />
      <rect x="11" y="2" width="3" height="4" fill="var(--gold, #f2c14e)" />
      <rect x="2" y="6" width="12" height="7" fill="var(--gold, #f2c14e)" />
      <rect x="2" y="2" width="2" height="1" fill="var(--l-surface, #ffffff)" />
      <rect x="7" y="2" width="1" height="1" fill="var(--l-surface, #ffffff)" />
      <rect x="11" y="2" width="2" height="1" fill="var(--l-surface, #ffffff)" />
      <rect x="3" y="7" width="1" height="4" fill="var(--l-surface, #ffffff)" />
      <rect x="6" y="9" width="4" height="4" fill="var(--l-ink, #12151d)" />
      <rect x="7" y="8" width="2" height="1" fill="var(--l-ink, #12151d)" />
      <rect x="1" y="6" width="1" height="7" fill="var(--l-ink, #12151d)" />
      <rect x="14" y="6" width="1" height="7" fill="var(--l-ink, #12151d)" />
      <rect x="2" y="13" width="12" height="1" fill="var(--l-ink, #12151d)" />
      <rect x="5" y="2" width="1" height="4" fill="var(--l-ink, #12151d)" />
      <rect x="10" y="2" width="1" height="4" fill="var(--l-ink, #12151d)" />
    </svg>
  );
}

/**
 * Floating pill navigation: centred at top 22px, themed surface with blur and soft shadow,
 * rounded-full, balanced spacing that never collides with top-right PrefsToggle.
 */
export default function SiteNav() {
  const tr = useTr();
  const foundRelics = useFoundRelics();
  const relicCount = foundRelics.length;

  return (
    <header className="pointer-events-none absolute inset-x-0 top-[22px] z-50 flex justify-center px-4">
      <nav
        data-hero-nav
        aria-label={tr('Main navigation', 'Navigasi utama')}
        className="pointer-events-auto inline-flex max-w-[calc(100vw-32px)] items-center gap-3 rounded-full border border-[var(--l-line)] bg-[color-mix(in_srgb,var(--l-surface)_90%,transparent)] shadow-[0_4px_24px_var(--l-shadow)] backdrop-blur-md sm:max-w-[calc(100vw-220px)] sm:gap-5 md:max-w-max md:gap-7"
        style={{ padding: '5px 6px 5px 16px' }}
      >
        <Link
          href="/"
          className="flex items-center gap-2.5 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--l-ink)]"
          aria-label={tr('Metropolix home', 'Beranda Metropolix')}
        >
          <Crest />
          <span className="font-serif-display text-[22px] font-normal leading-none tracking-[-0.04em] text-[var(--l-ink)] select-none">
            metropolix
          </span>
        </Link>

        {relicCount > 0 && (
          <span
            className="inline-flex items-center gap-1.5 rounded-full border border-[var(--l-line)] bg-[var(--l-surface-2)] px-2.5 py-0.5 text-[11px] font-medium text-[var(--l-ink)] shadow-xs transition-all animate-fadeIn"
            aria-label={tr(`${relicCount} of ${TOTAL_HERO_RELICS} relics found`, `${relicCount} dari ${TOTAL_HERO_RELICS} relik ditemukan`)}
          >
            <span
              className={`size-1.5 rounded-full ${relicCount === TOTAL_HERO_RELICS ? 'bg-amber-400' : 'bg-[var(--gold,#f2c14e)] animate-pulse'}`}
              aria-hidden="true"
            />
            <span className="font-mono">
              <T
                en={`Relics ${relicCount}/${TOTAL_HERO_RELICS}`}
                id={`Relik ${relicCount}/${TOTAL_HERO_RELICS}`}
              />
            </span>
          </span>
        )}

        <div className="hidden items-center gap-5 sm:flex">
          <a
            href="#faq"
            className="rounded-sm text-[13px] font-medium text-[var(--l-muted)] transition-colors hover:text-[var(--l-ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--l-ink)]"
          >
            <T en="FAQ" id="FAQ" />
          </a>
          <a
            href={GITHUB}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-sm text-[13px] font-medium text-[var(--l-muted)] transition-colors hover:text-[var(--l-ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--l-ink)]"
          >
            GitHub
            <span className="sr-only">
              <T en=" (opens in a new tab)" id=" (buka di tab baru)" />
            </span>
          </a>
        </div>

        <Link
          href="/play"
          className="inline-flex min-h-9 items-center justify-center rounded-full bg-[var(--l-ink)] px-4 py-1.5 text-[13px] font-semibold text-[var(--l-surface)] shadow-xs transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--l-ink)]"
        >
          <T en="Play now" id="Play now" />
        </Link>
      </nav>
    </header>
  );
}
