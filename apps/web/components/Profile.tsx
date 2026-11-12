'use client';

import * as sim from '@metropolix/sim';
import ArcPortrait from './ArcPortrait';
import Portrait, { TierBadge } from './Portrait';
import Icon, { type IconName } from './Icon';
import { RelicThumb } from './ItemThumb';
import { Modal, SubHead } from './ui';
import { bonusText } from './Vault';

const n = (v: number) => v.toLocaleString('en-US');

function Stat({ icon, label, value, tone }: { icon: IconName; label: string; value: string; tone?: string }) {
  return (
    <div className="well flex items-center gap-2 px-2.5 py-2">
      <Icon name={icon} size={22} />
      <div className="min-w-0">
        <div className={`font-display text-lg font-bold leading-none tabular-nums ${tone ?? ''}`}>{value}</div>
        <div className="mt-0.5 text-xs text-[var(--paper-dim)]">{label}</div>
      </div>
    </div>
  );
}

/**
 * A mayor's card: who they are, how strong their city is, their battle record and the treasures
 * they show off. The same card for you and for other players; yours can change its name.
 */
export default function Profile({ p, rank, xp, renameCost = 0, onClose, onRename }: {
  p: sim.PlayerProfile; rank?: { pos: number; of: number }; xp?: number; renameCost?: number; onClose: () => void; onRename?: () => void;
}) {
  const people = sim.arcDef(p.arc);
  const lvXp = xp !== undefined ? { from: sim.LEVEL_XP[p.level - 1] ?? 0, to: sim.LEVEL_XP[p.level] } : null;
  const r = p.record;
  const attacks = r.won + r.lost;
  const raids = r.held + r.breached;
  const slots = Array.from({ length: sim.DISPLAY_SLOTS }, (_, i) => p.displayed[i] ?? null);

  return (
    <Modal title={p.isYou ? 'Your profile' : 'Mayor profile'} icon="people" onClose={onClose} width="max-w-3xl">
      <div className="grid gap-4 md:grid-cols-[12rem_minmax(0,1fr)]">
        <div>
          <div className="relative border-2 border-[var(--ink)] bg-[var(--slab-lo)]">
            {p.portrait ? <Portrait id={p.portrait} className="aspect-[6/7] w-full" />
              : p.arc ? <ArcPortrait arc={p.arc} className="block aspect-[6/7] w-full" /> : <div className="grid aspect-[6/7] place-items-center text-sm text-[var(--paper-dim)]">No people yet</div>}
            <div className="absolute -bottom-3 -left-2 flex h-12 w-12 items-center justify-center border-2 border-[var(--ink)] bg-[var(--accent)] font-display text-2xl font-bold text-[var(--accent-ink)] [clip-path:polygon(50%_0,100%_22%,100%_70%,50%_100%,0_70%,0_22%)]"
              aria-label={`Level ${p.level}`}>{p.level}</div>
          </div>
          {p.portrait > 0 && <div className="mt-4 flex justify-center"><TierBadge id={p.portrait} /></div>}
          {p.value && (
            <div className="well mt-3 p-2 text-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 text-[var(--paper-dim)]"><Icon name="coin" size={16} /> City value</span>
                <b className="font-display tabular-nums text-[var(--gold)]">{n(p.value.total)}</b>
              </div>
              <dl className="mt-1 grid grid-cols-[1fr_auto] gap-x-2 text-xs text-[var(--paper-dim)]">
                <dt>Buildings (by level)</dt><dd className="tabular-nums">{n(p.value.buildings)}</dd>
                <dt>Relics</dt><dd className="tabular-nums">{n(p.value.relics)}</dd>
                <dt>Portrait tier</dt><dd className="tabular-nums">{n(p.value.portrait)}</dd>
              </dl>
              <p className="mt-1 text-[11px] leading-snug text-[var(--paper-dim)]">Counted in game gold. Not money, and cities cannot be sold yet.</p>
            </div>
          )}
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-start gap-x-3 gap-y-1">
            <h3 className="font-display min-w-0 flex-1 break-words text-3xl font-bold leading-tight">{p.name}</h3>
            {onRename && (
              <button className="btn btn-quiet flex-col !gap-0 px-2.5 py-1 text-sm leading-tight" onClick={onRename}>
                Change name
                <span className="flex items-center gap-0.5 text-[11px] text-[var(--paper-dim)]">{renameCost ? <><Icon name="coin" size={10} />{renameCost.toLocaleString('en-US')}</> : 'free once'}</span>
              </button>
            )}
          </div>
          <p className="text-sm text-[var(--paper-dim)]">
            {p.title}{people ? ` of the ${people.name}` : ''}
            {rank && <>, <b className="text-[var(--gold)]">#{rank.pos}</b> of {rank.of} mayors by ChainPower</>}
          </p>
          {lvXp && xp !== undefined && (
            <div className="mt-2">
              <div className="h-2.5 border-2 border-[var(--ink)] bg-[var(--slab-lo)]">
                <div className="h-full bg-[var(--accent)]" style={{ width: lvXp.to ? `${Math.min(100, ((xp - lvXp.from) * 100) / (lvXp.to - lvXp.from))}%` : '100%' }} />
              </div>
              <p className="mt-0.5 text-xs text-[var(--paper-dim)]">{lvXp.to ? `${n(xp - lvXp.from)} of ${n(lvXp.to - lvXp.from)} XP to level ${p.level + 1}` : 'Highest level reached'}</p>
            </div>
          )}

          <div className="mt-3 grid grid-cols-3 gap-2">
            <Stat icon="crown" label="ChainPower" value={n(p.chainPower)} tone="text-[var(--accent)]" />
            <Stat icon="coin" label="Gold" value={n(p.wealth)} tone="text-[var(--gold)]" />
            <Stat icon="trophy" label="Trophies" value={n(p.trophies)} />
            <Stat icon="people" label="Citizens" value={n(p.citizens)} />
            <Stat icon="city" label="Buildings" value={n(p.buildings)} />
            <Stat icon="chest" label="Treasures dug up" value={n(p.finds)} />
          </div>

          <SubHead>Battle record</SubHead>
          <dl className="grid grid-cols-2 gap-2 text-sm">
            <div className="well p-2">
              <dt className="flex items-center gap-1.5 text-[var(--paper-dim)]"><Icon name="swords" size={16} /> Attacks</dt>
              <dd className="mt-0.5">{attacks === 0 ? 'None yet' : <><b className="text-[var(--good)]">{n(r.won)} won</b>, <span className="text-[var(--bad)]">{n(r.lost)} lost</span></>}</dd>
            </div>
            <div className="well p-2">
              <dt className="flex items-center gap-1.5 text-[var(--paper-dim)]"><Icon name="shield" size={16} /> Raids on this city</dt>
              <dd className="mt-0.5">{raids === 0 ? 'None yet' : <><b className="text-[var(--good)]">{n(r.held)} held</b>, <span className="text-[var(--bad)]">{n(r.breached)} broke in</span></>}</dd>
            </div>
          </dl>

          <SubHead>On display</SubHead>
          <div className="grid grid-cols-3 gap-2">
            {slots.map((k, i) => k ? (
              <div key={k} className="well flex flex-col items-center gap-1 border-t-4 p-2 text-center" style={{ borderTopColor: sim.RARITY[sim.RELICS[k].rarity].color }}
                title={`${sim.RELICS[k].desc} ${bonusText(sim.RELICS[k].bonus)}`}>
                <RelicThumb k={k} size={44} />
                <b className="text-xs leading-tight">{sim.RELICS[k].name}</b>
                <span className="text-[11px] text-[var(--paper-dim)]">{sim.RARITY[sim.RELICS[k].rarity].name}</span>
              </div>
            ) : (
              <div key={`empty-${i}`} className="grid min-h-24 place-items-center border-2 border-dashed border-[var(--slab-hi)] p-2 text-center text-xs text-[var(--paper-dim)]">Empty pedestal</div>
            ))}
          </div>
          {p.simulated && <p className="mt-3 text-xs text-[var(--paper-dim)]">Offline demo: this mayor is simulated until the game server goes live.</p>}
        </div>
      </div>
    </Modal>
  );
}
