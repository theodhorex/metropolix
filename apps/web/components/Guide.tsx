'use client';

import { useEffect, useMemo, useState } from 'react';
import { drawCitizen } from '@/lib/citizens';
import { arcDef, type BuildingKind, type GameState } from '@metropolix/sim';

const KEY = 'metropolix-tutorial-v1';
export type GuideTarget = 'shop' | 'social' | 'tax' | null;

interface Step { text: (arc: string) => string; target: GuideTarget; done?: (c: Props, n: (k: BuildingKind) => number) => boolean; next?: boolean }

const STEPS: Step[] = [
  { text: (a) => `Welcome, mayor of the ${a}! Let's build your first village together.`, target: null, next: true },
  { text: () => 'Tap the glowing Shop button to see what you can build.', target: 'shop', done: (c) => c.shopOpen },
  { text: () => 'Pick a House, then tap an empty tile on the map to place it.', target: null, done: (_, n) => n('house') >= 1 },
  { text: () => 'Nice! Citizens need food. Build a Farm.', target: 'shop', done: (_, n) => n('farm') >= 1 },
  { text: () => 'Happy people pay better taxes. Add a Park.', target: 'shop', done: (_, n) => n('park') >= 1 },
  { text: () => 'Tax rate is a trade: more gold, less happiness. Try the slider on the left.', target: 'tax', next: true },
  { text: () => 'Open the Social panel: market, chat, ranks and other players.', target: 'social', done: (c) => c.socialOpen },
  { text: () => 'You are ready! Grow, trade, train troops and climb the leaderboard.', target: null, next: true },
];

interface Props { s: GameState; shopOpen: boolean; socialOpen: boolean; onTarget: (t: GuideTarget) => void }

export default function Guide(props: Props) {
  const { s, onTarget } = props;
  const [step, setStep] = useState<number | null>(null);

  useEffect(() => {
    try { const v = localStorage.getItem(KEY); setStep(v === null ? 0 : Number(v)); } catch { setStep(0); }
  }, []);
  const save = (n: number) => { setStep(n); try { localStorage.setItem(KEY, String(n)); } catch { /* ignore */ } };

  const n = (k: BuildingKind) => {
    let c = 0;
    for (const row of s.grid) for (const v of row) if (v === k) c++;
    return c;
  };
  const cur = step !== null && step < STEPS.length ? STEPS[step]! : null;
  const active = !!cur && s.arc !== null;

  useEffect(() => {
    if (active && cur?.done?.(props, n)) save(step! + 1);
  });
  useEffect(() => { onTarget(active ? cur!.target : null); return () => onTarget(null); }, [active, step]); // eslint-disable-line react-hooks/exhaustive-deps

  const pip = useMemo(() => (s.arc ? drawCitizen(s.arc, 0, 'front', 4).toDataURL() : null), [s.arc]);
  if (!active || !cur) return null;
  const arc = arcDef(s.arc)!;
  return (
    <div className="pointer-events-none fixed bottom-4 left-1/2 z-30 flex -translate-x-1/2 items-end gap-3 px-3" role="status">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {pip && <img src={pip} alt="" width={64} height={96} className="shrink-0" style={{ imageRendering: 'pixelated', filter: 'drop-shadow(0 3px 0 #12151d)' }} />}
      <div className="pointer-events-auto relative max-w-sm border-2 border-[var(--ink)] bg-[var(--paper)] p-3 text-sm text-[#1b1b1b] shadow-[0_3px_0_var(--ink)]">
        <span className="absolute -left-2 bottom-5 h-3 w-3 rotate-45 border-b-2 border-l-2 border-[var(--ink)] bg-[var(--paper)]" />
        <p className="font-display mb-0.5 text-xs text-[#6b6455]">Pip, your guide</p>
        <p className="font-bold">{cur.text(arc.name)}</p>
        <div className="mt-2 flex items-center justify-between gap-2 text-xs">
          <span className="text-[#6b6455] tabular-nums">{step! + 1} of {STEPS.length}</span>
          <span className="flex gap-2">
            <button className="px-2 py-1 text-[#6b6455] underline" onClick={() => save(STEPS.length)}>Skip tutorial</button>
            {cur.next && <button className="btn btn-accent text-sm" onClick={() => save(step! + 1)}>Next</button>}
          </span>
        </div>
      </div>
    </div>
  );
}
