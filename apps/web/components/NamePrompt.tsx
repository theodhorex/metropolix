'use client';

import { useEffect, useRef, useState } from 'react';
import * as sim from '@metropolix/sim';
import ArcPortrait from './ArcPortrait';
import Icon from './Icon';
import { useEscape } from '@/lib/escape';

const roll = (n: number) => {
  const out = new Set<string>();
  while (out.size < n) out.add(sim.randomFantasyName(Math.random()));
  return [...out];
};

/**
 * Asked once, right after the player picks a people: the mayor's name. Type one, or take one
 * of the suggested names, or roll new ones. Also used to rename from the profile (`initial` set).
 */
export default function NamePrompt({ arc, initial = '', cost = 0, gold = 0, onSave, onCancel }: {
  arc: sim.ArcId | null; initial?: string; cost?: number; gold?: number; onSave: (name: string) => sim.Result; onCancel?: () => void;
}) {
  const [name, setName] = useState(initial);
  const [ideas, setIdeas] = useState<string[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const people = sim.arcDef(arc);

  // suggestions come from Math.random, so roll them after mount (server HTML has none)
  useEffect(() => { setIdeas(roll(4)); input.current?.focus(); }, []);
  // renaming: Escape cancels; the first naming cannot be skipped, so Escape does nothing (and closes nothing behind it)
  useEscape(true, () => onCancel?.());

  const save = () => {
    const c = sim.checkName(name);
    if (!c.ok) { setErr(c.msg); input.current?.focus(); return; }
    const r = onSave(c.name);
    if (!r.ok) setErr(r.msg);
  };
  const pick = (n: string) => { setName(n); setErr(null); input.current?.focus(); };

  return (
    <div className="fixed inset-0 z-[66] flex items-center justify-center bg-[#05070bdd] p-4" role="dialog" aria-modal="true" aria-labelledby="name-title" onMouseDown={onCancel}>
      <div className="window win-in grid w-full max-w-xl grid-cols-[9rem_minmax(0,1fr)] overflow-hidden" onMouseDown={(e) => e.stopPropagation()}>
        <div className="border-r-2 border-[var(--ink)] bg-[var(--slab-lo)]">
          {arc && <ArcPortrait arc={arc} className="h-full w-full" />}
        </div>
        <form className="p-5" onSubmit={(e) => { e.preventDefault(); save(); }}>
          <h2 id="name-title" className="font-display text-2xl font-bold leading-tight">{initial ? 'Change your name' : 'What do your people call you?'}</h2>
          <p className="mt-1 text-sm text-[var(--paper-dim)]">
            {initial ? '' : people ? `The ${people.name} need a mayor. ` : ''}Other players see this name in chat, the ranks and on your profile.
          </p>
          {initial && (
            <p className={`mt-2 flex items-center gap-1.5 text-sm font-bold ${cost > gold ? 'text-[var(--bad)]' : cost ? 'text-[var(--gold)]' : 'text-[var(--good)]'}`}>
              <Icon name="coin" size={14} />
              {cost ? `This change costs ${cost.toLocaleString('en-US')} gold${cost > gold ? `, you have ${gold.toLocaleString('en-US')}` : ''}.`
                : `Your one free name change. After it, each change costs ${sim.RENAME_COST.toLocaleString('en-US')} gold.`}
            </p>
          )}
          <label htmlFor="mayor-name" className="mt-4 block text-sm font-bold">Mayor name</label>
          <div className="mt-1 flex gap-1.5">
            <input id="mayor-name" ref={input} value={name} maxLength={sim.NAME_MAX} autoComplete="off" spellCheck={false}
              onChange={(e) => { setName(e.target.value); setErr(null); }} placeholder="Type a name or pick one below"
              aria-invalid={!!err} aria-describedby={err ? 'name-err' : undefined} className="field min-w-0 flex-1 text-base" />
            <button type="button" className="btn btn-quiet shrink-0 px-2.5" onClick={() => pick(sim.randomFantasyName(Math.random()))} title="Random name" aria-label="Random name">
              <Icon name="dice" size={20} />
            </button>
          </div>
          <p id="name-err" role={err ? 'alert' : undefined} className={`mt-1 min-h-5 text-xs ${err ? 'font-bold text-[var(--bad)]' : 'text-[var(--paper-dim)]'}`}>
            {err ?? `${sim.NAME_MIN} to ${sim.NAME_MAX} characters.`}
          </p>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-sm font-bold">Suggestions</span>
            <button type="button" className="text-xs text-[var(--accent)] underline-offset-2 hover:underline" onClick={() => setIdeas(roll(4))}>Show others</button>
          </div>
          <div className="mt-1.5 grid grid-cols-2 gap-1.5">
            {ideas.map((n) => (
              <button key={n} type="button" onClick={() => pick(n)} aria-pressed={name === n}
                className={`btn px-2 py-1.5 text-sm ${name === n ? 'btn-gold' : 'btn-quiet'}`}>{n}</button>
            ))}
          </div>
          <div className="mt-5 flex gap-2">
            {onCancel && <button type="button" className="btn btn-quiet flex-1 py-2" onClick={onCancel}>Cancel</button>}
            <button type="submit" className="btn btn-accent flex-1 py-2 text-base">{initial ? (cost ? `Pay ${cost.toLocaleString('en-US')} and save` : 'Save name') : 'Take office'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
