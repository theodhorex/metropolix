'use client';

import Link from 'next/link';

const GITHUB = 'https://github.com/theodhorex/metropolix';

/**
 * Pixel crest: Metropolix castle icon (16x16 grid, crisp pixels, 3 colours: ink, gold, white).
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
      {/* 3 colours max: ink #12151d, gold #f2c14e, white #ffffff */}
      <rect x="2" y="2" width="3" height="4" fill="#f2c14e" />
      <rect x="7" y="2" width="2" height="4" fill="#f2c14e" />
      <rect x="11" y="2" width="3" height="4" fill="#f2c14e" />
      <rect x="2" y="6" width="12" height="7" fill="#f2c14e" />
      <rect x="2" y="2" width="2" height="1" fill="#ffffff" />
      <rect x="7" y="2" width="1" height="1" fill="#ffffff" />
      <rect x="11" y="2" width="2" height="1" fill="#ffffff" />
      <rect x="3" y="7" width="1" height="4" fill="#ffffff" />
      <rect x="6" y="9" width="4" height="4" fill="#12151d" />
      <rect x="7" y="8" width="2" height="1" fill="#12151d" />
      <rect x="1" y="6" width="1" height="7" fill="#12151d" />
      <rect x="14" y="6" width="1" height="7" fill="#12151d" />
      <rect x="2" y="13" width="12" height="1" fill="#12151d" />
      <rect x="5" y="2" width="1" height="4" fill="#12151d" />
      <rect x="10" y="2" width="1" height="4" fill="#12151d" />
    </svg>
  );
}

/**
 * Floating pill navigation: centred at top 22px, white 90% with blur and soft shadow,
 * rounded-full, padding 5px 5px 5px 16px, gap ~44px.
 */
export default function SiteNav() {
  return (
    <header className="pointer-events-none absolute inset-x-0 top-[22px] z-50 flex justify-center px-4">
      <nav
        data-hero-nav
        aria-label="Main"
        className="pointer-events-auto inline-flex max-w-[calc(100vw-32px)] items-center gap-6 rounded-full border border-white/60 bg-white/90 shadow-[0_4px_24px_rgb(40_60_110/0.12)] backdrop-blur-md md:gap-[44px]"
        style={{ padding: '5px 5px 5px 16px' }}
      >
        <Link
          href="/"
          className="flex items-center gap-2.5 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--ink)"
          aria-label="Metropolix home"
        >
          <Crest />
          <span className="font-serif-display text-[22px] font-normal leading-none tracking-[-0.04em] text-[#12151d] select-none">
            metropolix
          </span>
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          <a
            href="#faq"
            className="rounded-sm text-[13px] font-medium text-[#444b5e] transition-colors hover:text-[#12151d] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--ink)"
          >
            FAQ
          </a>
          <a
            href={GITHUB}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-sm text-[13px] font-medium text-[#444b5e] transition-colors hover:text-[#12151d] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--ink)"
          >
            GitHub<span className="sr-only"> (opens in a new tab)</span>
          </a>
        </div>

        <Link
          href="/play"
          className="inline-flex min-h-9 items-center justify-center rounded-full bg-[#12151d] px-4 py-1.5 text-[13px] font-semibold text-white shadow-sm transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--ink)"
        >
          Play now
        </Link>
      </nav>
    </header>
  );
}
