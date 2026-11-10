'use client';

import { useEffect, useId, useRef, type ReactNode } from 'react';
import Icon, { type IconName } from './Icon';
import { useEscape } from '@/lib/escape';

/** Square red close button used by every window, drawer and dialog. */
export function CloseX({ onClick, label = 'Close', className = '' }: { onClick: () => void; label?: string; className?: string }) {
  return (
    <button onClick={onClick} aria-label={label} title={label} className={`btn btn-bad h-9 w-9 shrink-0 !p-0 ${className}`}>
      <Icon name="cross" size={16} />
    </button>
  );
}

export interface TabDef<T extends string> { id: T; label: string; icon?: IconName }

interface ModalProps<T extends string> {
  title: ReactNode;
  icon: IconName;
  onClose: () => void;
  tabs?: TabDef<T>[];
  tab?: T;
  onTab?: (t: T) => void;
  /** 'top' for a few wide tabs, 'rail' for a long list of sections. */
  tabStyle?: 'top' | 'rail';
  headerRight?: ReactNode;
  width?: string;
  /** Fixed height so switching tabs does not make the window jump. */
  tall?: boolean;
  children: ReactNode;
}

/**
 * One window frame for every big panel: title strip, tabs, scrolling body.
 * Escape closes, focus moves in on open and back to the opener on close,
 * Tab cycles inside the window.
 */
export function Modal<T extends string>({ title, icon, onClose, tabs, tab, onTab, tabStyle = 'top', headerRight, width = 'max-w-4xl', tall = false, children }: ModalProps<T>) {
  const box = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEscape(true, () => closeRef.current());

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    box.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !box.current) return;
      const f = [...box.current.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), select, [tabindex="0"]')];
      if (f.length === 0) return;
      const first = f[0]!, last = f[f.length - 1]!;
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('keydown', onKey); opener?.focus?.(); };
  }, []);

  const tabList = tabs && tab !== undefined && onTab && (
    <div role="tablist" aria-orientation={tabStyle === 'rail' ? 'vertical' : 'horizontal'}
      className={tabStyle === 'rail'
        ? 'flex shrink-0 gap-1 overflow-x-auto border-b-2 border-[var(--ink)] bg-[var(--slab-lo)] p-1.5 md:w-44 md:flex-col md:overflow-visible md:border-r-2 md:border-b-0'
        : 'flex shrink-0 items-end gap-1 overflow-x-auto bg-[var(--slab-lo)] px-2 pt-1.5'}>
      {tabs.map((t) => (
        <button key={t.id} role="tab" aria-selected={tab === t.id} onClick={() => onTab(t.id)}
          className={tabStyle === 'rail' ? 'rail-tab' : 'tab flex items-center gap-1.5 whitespace-nowrap'}>
          {t.icon && <Icon name={t.icon} size={tabStyle === 'rail' ? 20 : 18} />}
          <span>{t.label}</span>
        </button>
      ))}
    </div>
  );

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#05070bcc] p-2 sm:p-4" onMouseDown={onClose}>
      <div ref={box} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby={titleId} onMouseDown={(e) => e.stopPropagation()}
        className={`window win-in flex max-h-[92vh] w-full ${tall ? 'h-[88vh]' : ''} ${width} flex-col overflow-hidden outline-none`}>
        <header className="window-title flex items-center gap-2.5 px-3 py-2">
          <Icon name={icon} size={24} />
          <h2 id={titleId} className="font-display min-w-0 flex-1 truncate text-xl font-bold">{title}</h2>
          {headerRight}
          <CloseX onClick={onClose} />
        </header>
        {tabStyle === 'rail' ? (
          <div className="flex min-h-0 flex-1 flex-col md:flex-row">
            {tabList}
            <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-4">{children}</div>
          </div>
        ) : (
          <>
            {tabList}
            <div className="min-h-0 flex-1 overflow-y-auto border-t-2 border-[var(--ink)] p-3 sm:p-4">{children}</div>
          </>
        )}
      </div>
    </div>
  );
}

/** Horizontal fill bar. `tone` is a CSS color; defaults to the race accent. */
export function Meter({ value, max = 1000, tone = 'var(--accent)', label }: { value: number; max?: number; tone?: string; label: string }) {
  const pct = max <= 0 ? 0 : Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="meter" role="meter" aria-label={label} aria-valuemin={0} aria-valuemax={max} aria-valuenow={value}>
      <i style={{ width: `${pct}%`, background: tone }} />
    </div>
  );
}

/** Label on the left, value on the right, on a ledger line. */
export function StatRow({ k, v, hint }: { k: ReactNode; v: ReactNode; hint?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-[var(--slab-hi)] py-1.5 text-sm last:border-0" title={hint}>
      <span className="text-[var(--paper-dim)]">{k}</span>
      <b className="text-right tabular-nums">{v}</b>
    </div>
  );
}

export interface Part { label: string; value: number; color: string }

/** Part-to-whole as one segmented bar plus a legend that carries the numbers. */
export function SegBar({ parts, label }: { parts: Part[]; label: string }) {
  const total = parts.reduce((a, p) => a + p.value, 0);
  return (
    <figure>
      <div className="flex h-5 gap-[2px] border-2 border-[var(--ink)] bg-[var(--slab-lo)]" role="img"
        aria-label={`${label}: ${parts.map((p) => `${p.label} ${p.value}`).join(', ')}`}>
        {total > 0 && parts.filter((p) => p.value > 0).map((p) => (
          <span key={p.label} title={`${p.label}: ${p.value}`} style={{ flexGrow: p.value, background: p.color, boxShadow: 'inset 0 2px 0 rgba(255,255,255,.22)' }} />
        ))}
      </div>
      <figcaption className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-sm">
        {parts.map((p) => (
          <span key={p.label} className="flex items-center gap-1.5">
            <span aria-hidden className="inline-block h-3 w-3 border-2 border-[var(--ink)]" style={{ background: p.color }} />
            <span className="text-[var(--paper-dim)]">{p.label}</span>
            <b className="tabular-nums">{p.value}</b>
          </span>
        ))}
      </figcaption>
    </figure>
  );
}

/** Small heading inside a window body. */
export function SubHead({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <h3 className="font-display mt-4 mb-2 flex items-baseline justify-between text-base font-bold first:mt-0">
      <span>{children}</span>
      {right && <span className="text-sm font-normal text-[var(--paper-dim)] [font-family:var(--font-body)]">{right}</span>}
    </h3>
  );
}

/** Sector colors, checked for color-blind separation on the slab surface. */
export const SECTOR_COLOR = {
  residential: '#c27c3e',
  commerce: '#3a9fd8',
  industry: '#b08a22',
  services: '#d0688c',
  military: '#8f6fd6',
  decoration: '#57a653',
} as const;
