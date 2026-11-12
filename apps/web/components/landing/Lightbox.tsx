'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { useTr } from './prefs/store';

export interface Shot { src: string; w: number; h: number; alt: string; caption?: ReactNode }

/**
 * Click a screenshot to see it large. A native modal <dialog> (focus trap, Escape, top layer),
 * arrows step through the set, a click outside the picture closes it. Lenis is told to leave
 * the wheel alone inside it, so the page behind does not scroll.
 */
export function useLightbox(shots: Shot[]) {
  const [open, setOpen] = useState<number | null>(null);
  const show = useCallback((i: number) => setOpen(i), []);
  const view = <LightboxView shots={shots} index={open} onIndex={setOpen} />;
  return { show, view };
}

function LightboxView({ shots, index, onIndex }: { shots: Shot[]; index: number | null; onIndex: (i: number | null) => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const tr = useTr();
  const shot = index === null ? null : shots[index];

  useEffect(() => {
    const d = ref.current; if (!d) return;
    if (index !== null && !d.open) d.showModal();
    if (index === null && d.open) d.close();
    // the page behind stays put while a picture is open (native wheel and Lenis both read this)
    document.documentElement.classList.toggle('lightbox-lock', index !== null);
    return () => document.documentElement.classList.remove('lightbox-lock');
  }, [index]);

  const step = useCallback((by: number) => {
    if (index === null) return;
    onIndex((index + by + shots.length) % shots.length);
  }, [index, onIndex, shots.length]);

  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [index, step]);

  const many = shots.length > 1;
  return (
    <dialog
      ref={ref}
      data-lenis-prevent
      className="lightbox"
      aria-label={shot?.alt ?? ''}
      onClose={() => onIndex(null)}
      onClick={(e) => { if (e.target === e.currentTarget) onIndex(null); }}
    >
      {shot && (
        <figure key={shot.src} className="lightbox-figure" onClick={(e) => { if (e.target === e.currentTarget) onIndex(null); }}>
          <Image src={shot.src} alt={shot.alt} width={shot.w} height={shot.h} sizes="92vw" quality={90} className="lightbox-img" />
          {(shot.caption || many) && (
            <figcaption className="lightbox-cap">
              <span className="min-w-0">{shot.caption}</span>
              {many && <span className="lightbox-count">{(index ?? 0) + 1} / {shots.length}</span>}
            </figcaption>
          )}
        </figure>
      )}
      {many && (
        <>
          <button type="button" className="lightbox-nav lightbox-prev" onClick={() => step(-1)} aria-label={tr('Previous picture', 'Gambar sebelumnya', '이전 그림', '上一张')}>‹</button>
          <button type="button" className="lightbox-nav lightbox-next" onClick={() => step(1)} aria-label={tr('Next picture', 'Gambar berikutnya', '다음 그림', '下一张')}>›</button>
        </>
      )}
      <button type="button" className="lightbox-close" onClick={() => onIndex(null)} aria-label={tr('Close', 'Tutup', '닫기', '关闭')}>×</button>
    </dialog>
  );
}

/** The button around a thumbnail that opens it large. */
export function ZoomButton({ onOpen, label, children, className }: { onOpen: () => void; label: string; children: ReactNode; className?: string }) {
  const tr = useTr();
  return (
    <button type="button" onClick={onOpen} className={`zoomable ${className ?? ''}`}
      aria-label={tr(`Enlarge: ${label}`, `Perbesar: ${label}`, `크게 보기: ${label}`, `放大查看：${label}`)}>
      {children}
      <span className="zoomable-hint" aria-hidden="true">
        <svg viewBox="0 0 16 16" width="14" height="14" shapeRendering="crispEdges"><path fill="currentColor" d="M2 2h5v2H4v3H2zM9 2h5v5h-2V4H9zM2 9h2v3h3v2H2zM12 9h2v5H9v-2h3z" /></svg>
      </span>
    </button>
  );
}
