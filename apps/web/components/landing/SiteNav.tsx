'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

const LINKS = [
  { href: '#peoples', label: 'Peoples' },
  { href: '#how', label: 'How it plays' },
  { href: '#world', label: 'World' },
  { href: '#chain', label: 'Roadmap' },
] as const;
const GITHUB = 'https://github.com/theodhorex/metropolix';

const linkCls = 'font-display font-bold px-3 py-2 text-[var(--paper)] hover:bg-[var(--slab-hi)] rounded-[2px]';

export default function SiteNav() {
  const [open, setOpen] = useState(false);
  const btn = useRef<HTMLButtonElement>(null);

  // Esc closes the menu and hands focus back to the button that opened it
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setOpen(false);
      btn.current?.focus();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const close = () => setOpen(false);

  return (
    <header className="sticky top-0 z-50 bg-[var(--slab)] border-b-2 border-[var(--ink)] shadow-[0_3px_0_var(--ink)]">
      <nav aria-label="Main" className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-2">
        <Link href="/" className="font-display text-xl font-bold text-[var(--gold)] mr-auto md:mr-4 py-1">
          Metropolix
        </Link>

        <ul className="hidden md:flex items-center gap-1 mr-auto">
          {LINKS.map((l) => (
            <li key={l.href}><a href={l.href} className={linkCls}>{l.label}</a></li>
          ))}
          <li>
            <a href={GITHUB} target="_blank" rel="noopener noreferrer" className={linkCls}>
              GitHub<span className="sr-only"> (opens in a new tab)</span>
            </a>
          </li>
        </ul>

        <Link href="/play" className="btn btn-gold">Play now</Link>

        <button
          ref={btn}
          type="button"
          className="btn btn-quiet md:hidden"
          aria-expanded={open}
          aria-controls="site-menu"
          onClick={() => setOpen((v) => !v)}
        >
          <span aria-hidden="true">{open ? '✕' : '☰'}</span>
          <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
        </button>
      </nav>

      {open && (
        <ul id="site-menu" className="md:hidden border-t-2 border-[var(--ink)] bg-[var(--slab-lo)] px-4 py-2 flex flex-col">
          {LINKS.map((l) => (
            <li key={l.href}><a href={l.href} onClick={close} className={`${linkCls} block py-3`}>{l.label}</a></li>
          ))}
          <li>
            <a href={GITHUB} target="_blank" rel="noopener noreferrer" onClick={close} className={`${linkCls} block py-3`}>
              GitHub<span className="sr-only"> (opens in a new tab)</span>
            </a>
          </li>
        </ul>
      )}
    </header>
  );
}
