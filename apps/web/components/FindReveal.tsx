'use client';

import { useEffect, useRef } from 'react';
import * as sim from '@metropolix/sim';
import { RelicThumb } from './ItemThumb';
import { bonusText } from './Vault';
import { useEscape } from '@/lib/escape';

/**
 * The one loud moment in the game: an Epic, Legendary or Super Legendary relic just turned up.
 * Rare finds only get a banner; these stop the city for a second.
 */
export default function FindReveal({ s, kind, onDisplay, onVault, onClose }: {
  s: sim.GameState; kind: sim.RelicKind; onDisplay: () => void; onVault: () => void; onClose: () => void;
}) {
  const r = sim.RELICS[kind];
  const tier = sim.RARITY[r.rarity];
  const keep = useRef<HTMLButtonElement>(null);
  const canDisplay = s.displayed.length < sim.DISPLAY_SLOTS && !s.displayed.includes(kind) && (s.vault[kind] ?? 0) > 0;
  useEffect(() => { keep.current?.focus(); }, []); // once: the game re-renders every second
  useEscape(true, onClose);

  return (
    <div className="fixed inset-0 z-[65] flex items-center justify-center bg-[#05070bdd] p-4" role="alertdialog" aria-labelledby="find-title" aria-describedby="find-desc" onMouseDown={onClose}>
      <div className="window win-in w-full max-w-md" onMouseDown={(e) => e.stopPropagation()} style={{ borderColor: tier.color }}>
        <div className="flex flex-col items-center p-6 text-center">
          <div className={`reveal-burst relative mb-4 grid h-40 w-40 place-items-center ${r.rarity === 'mythic' ? 'reveal-mythic' : ''}`} style={{ ['--tier' as string]: tier.color }}>
            <span aria-hidden className="reveal-rays absolute inset-0" />
            <span className="reveal-pop relative"><RelicThumb k={kind} size={96} /></span>
          </div>
          <p className="text-sm font-bold" style={{ color: tier.color }}>{tier.name} find</p>
          <h2 id="find-title" className="font-display mt-0.5 text-3xl font-bold leading-tight">{r.name}</h2>
          <p id="find-desc" className="mt-2 text-sm text-[var(--paper-dim)]">
            Your {sim.BUILDINGS[r.source].name.toLowerCase()} turned it up. {r.desc}
          </p>
          <p className="mt-2 text-sm">On display: <b className="text-[var(--good)]">{bonusText(r.bonus)}</b></p>
          <p className="mt-1 text-xs text-[var(--paper-dim)]">Worth about {r.price.toLocaleString('en-US')} gold to other cities.</p>
          <div className="mt-5 flex w-full gap-2">
            <button className="btn btn-gold flex-1 py-2" disabled={!canDisplay} onClick={onDisplay}
              title={canDisplay ? undefined : 'Every pedestal is taken. Open the vault to swap one.'}>Put on display</button>
            <button className="btn btn-quiet flex-1 py-2" onClick={onVault}>Open vault</button>
          </div>
          <button ref={keep} className="btn btn-quiet mt-2 w-full py-1.5 text-sm" onClick={onClose}>Keep it in the vault</button>
        </div>
      </div>
    </div>
  );
}
