'use client';

import { useEffect, useRef } from 'react';

/**
 * Escape works like a back button: each press closes only the layer opened last
 * (a tooltip, then a dialog, then a drawer, then a tool mode), never several at once.
 * Layers register while they are open; one window listener calls the newest one.
 */
const stack: { close: () => void }[] = [];
let bound = false;

function onKey(e: KeyboardEvent) {
  if (e.key !== 'Escape' || e.defaultPrevented || e.isComposing) return;
  const top = stack[stack.length - 1];
  if (!top) return;
  e.preventDefault();
  e.stopImmediatePropagation();
  top.close();
}

/** While `active`, Escape calls `close` if this is the newest open layer. */
export function useEscape(active: boolean, close: () => void) {
  const fn = useRef(close);
  fn.current = close;
  useEffect(() => {
    if (!active) return;
    if (!bound) { window.addEventListener('keydown', onKey); bound = true; }
    const entry = { close: () => fn.current() };
    stack.push(entry);
    return () => { const i = stack.lastIndexOf(entry); if (i >= 0) stack.splice(i, 1); };
  }, [active]);
}
