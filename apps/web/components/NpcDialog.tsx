'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ArcId, Encounter, NpcAction } from '@metropolix/sim';
import { SPECIES } from '@/lib/citizens';
import { drawCitizen } from '@/lib/citizens';
import { CloseX } from './ui';

export interface NpcTalk { id: number; variant: number; name: string; x: number; y: number; encounter: Encounter; reply: string | null }

interface Props { talk: NpcTalk; arc: ArcId; width: number; onAct: (a: NpcAction) => void; onMore: () => void; onClose: () => void }

export default function NpcDialog({ talk, arc, width, onAct, onMore, onClose }: Props) {
  const portrait = useMemo(() => drawCitizen(arc, talk.variant, 'front', 4).toDataURL(), [arc, talk.variant]);
  const species = SPECIES[arc][talk.variant % SPECIES[arc].length]!.name;
  const left = Math.max(150, Math.min(talk.x, width - 150));
  // the box is clamped to the map, the tail still points at the citizen
  const tail = Math.max(18, Math.min(270, talk.x - left + 144));
  const line = talk.reply ?? talk.encounter.line;
  return (
    <div className="arc-in absolute z-30 w-72 -translate-x-1/2 -translate-y-full" style={{ left, top: Math.max(8, talk.y) }} role="dialog" aria-label={`Talking to ${talk.name}`}>
      <div className="panel p-2.5">
        <div className="flex items-start gap-2.5">
          <div className="well shrink-0 overflow-hidden p-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={portrait} alt="" width={48} height={72} className="npc-bob" style={{ imageRendering: 'pixelated' }} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div><div className="font-display text-lg leading-tight font-bold">{talk.name}</div><div className="text-xs text-[var(--paper-dim)]">{species}</div></div>
              <CloseX onClick={onClose} label="End the talk" className="!h-7 !w-7" />
            </div>
            <Speech key={line} text={line} />
          </div>
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {talk.reply === null ? talk.encounter.options.map((o) => (
            <button key={o.id} onClick={() => onAct(o.id)} className="btn btn-quiet text-xs">
              {o.label}{o.hint && <span className="font-normal text-[var(--gold)] [font-family:var(--font-body)]">{o.hint}</span>}
            </button>
          )) : (
            <>
              <button onClick={onMore} className="btn btn-accent text-xs">Talk more</button>
              <button onClick={onClose} className="btn btn-quiet text-xs">Goodbye</button>
            </>
          )}
        </div>
      </div>
      {/* tail down to the citizen: ink outline, then panel fill on top */}
      <span aria-hidden className="absolute top-full h-0 w-0 -translate-x-1/2 border-x-[9px] border-t-[10px] border-x-transparent border-t-[var(--ink)]" style={{ left: tail }} />
      <span aria-hidden className="absolute top-full -mt-[3px] h-0 w-0 -translate-x-1/2 border-x-[6px] border-t-[7px] border-x-transparent border-t-[var(--slab)]" style={{ left: tail }} />
    </div>
  );
}

/**
 * Speech bubble that types its line out like an old RPG. Clicking it shows the whole line.
 * Screen readers get the full text at once; reduced motion skips the typing.
 */
function Speech({ text }: { text: string }) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setShown(text.length); return; }
    const id = window.setInterval(() => setShown((n) => { if (n >= text.length) { window.clearInterval(id); return n; } return n + 2; }), 28);
    return () => window.clearInterval(id);
  }, [text]);
  const done = shown >= text.length;
  return (
    <div className="relative mt-1.5">
      <span aria-hidden className="absolute top-2.5 -left-[9px] h-0 w-0 border-y-[6px] border-r-[9px] border-y-transparent border-r-[var(--ink)]" />
      <span aria-hidden className="absolute top-[13px] -left-[5px] h-0 w-0 border-y-[3px] border-r-[5px] border-y-transparent border-r-[var(--paper)]" />
      <p onClick={() => setShown(text.length)} className="min-h-[3.25rem] cursor-default border-2 border-[var(--ink)] bg-[var(--paper)] p-2 text-sm leading-snug text-[#1b1b1b]">
        <span className="sr-only">{text}</span>
        <span aria-hidden>{text.slice(0, shown)}{!done && <span className="opacity-0">{text.slice(shown)}</span>}</span>
      </p>
    </div>
  );
}
