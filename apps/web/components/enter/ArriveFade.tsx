'use client';

import { useLayoutEffect, useState } from 'react';
import { ENTER_FLAG } from './gateEntrance';
import './enter.css';

const COLS = 16, ROWS = 9;
/** A fixed scatter of delays so each tile winks out at its own moment (same on every visit). */
const DELAYS = Array.from({ length: COLS * ROWS }, (_, i) => ((i * 53) % 97) / 97);

/**
 * Arriving from the landing gate: the game starts behind the same gold tiles, which wink out in a
 * scatter. Only when the visitor came through the gate (a session flag); otherwise renders nothing.
 */
export default function ArriveFade() {
  const [on, setOn] = useState(false);

  useLayoutEffect(() => {
    let flag = false;
    try { flag = sessionStorage.getItem(ENTER_FLAG) === '1'; sessionStorage.removeItem(ENTER_FLAG); } catch { /* no storage */ }
    if (!flag || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    setOn(true);
    const t = window.setTimeout(() => setOn(false), 1500);
    return () => window.clearTimeout(t);
  }, []);

  if (!on) return null;
  return (
    <div className="enter-veil enter-arrive" aria-hidden="true">
      <div className="enter-tiles" style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}>
        {DELAYS.map((d, i) => <i key={i} style={{ animationDelay: `${0.15 + d * 0.75}s` }} />)}
      </div>
    </div>
  );
}
