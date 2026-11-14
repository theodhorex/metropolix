'use client';

import * as sim from '@metropolix/sim';
import Icon, { type IconName } from './Icon';
import { ItemThumb, type Preview } from './ItemThumb';
import { Modal, SubHead } from './ui';

type Row = { icon: IconName; label: string; key: keyof sim.BuildingDef; unit?: string; upkeep?: boolean; fixed?: boolean; div?: number };
/** What a building does, in the order a player cares about. Values scale with the level. */
const ROWS: Row[] = [
  { icon: 'people', label: 'Homes', key: 'housing' },
  { icon: 'people', label: 'Jobs', key: 'jobs' },
  { icon: 'coin', label: 'Output', key: 'output' },
  { icon: 'food', label: 'Food', key: 'food', unit: '/s' },
  { icon: 'wood', label: 'Wood', key: 'wood', unit: '/s' },
  { icon: 'ore', label: 'Ore', key: 'ore', unit: '/s' },
  { icon: 'box', label: 'Special goods', key: 'goods', unit: '/s' },
  { icon: 'book', label: 'School seats', key: 'edu' },
  { icon: 'smile', label: 'Happiness', key: 'happy' },
  { icon: 'swords', label: 'Troop room', key: 'troopCap' },
  { icon: 'shield', label: 'Defense', key: 'defense' },
  { icon: 'swords', label: 'City attack', key: 'atkPm', unit: '%', div: 10 },
  { icon: 'heart', label: 'Smoke cleaned', key: 'clean' },
  { icon: 'flame', label: 'Smoke', key: 'pollution', upkeep: true, fixed: true },
  { icon: 'coin', label: 'Upkeep', key: 'upkeep', unit: '/s', upkeep: true },
];

const at = (v: number, lv: number, upkeep = false) => Math.floor((v * (upkeep ? sim.UPKEEP_PM : sim.LEVEL_PM)[lv]!) / 1000);
/** A row's value at a level: smoke does not grow with upgrades, the attack bonus is shown in percent. */
const rowAt = (r: Row, v: number, lv: number) => (r.fixed ? v : at(v, lv, r.upkeep && r.key === 'upkeep')) / (r.div ?? 1);

function Pips({ level }: { level: number }) {
  return (
    <span className="inline-flex items-center gap-1" aria-label={`Level ${level} of ${sim.MAX_BLD_LEVEL}`}>
      {Array.from({ length: sim.MAX_BLD_LEVEL }, (_, i) => (
        <span key={i} aria-hidden className={`h-3 w-3 rotate-45 border-2 border-[var(--ink)] ${i < level ? 'bg-[var(--gold)]' : 'bg-[var(--slab-lo)]'} ${i === level - 1 && level > 1 ? 'level-pop' : ''}`} />
      ))}
    </span>
  );
}

/**
 * Opens when you tap a building: what it does now, what the next level adds, and the upgrade
 * button. Barracks show the recruits an upgrade brings, farms the new food they grow.
 */
export default function BuildingPanel({ s, x, y, act, onClose, onPack, onDemolish, preview }: {
  s: sim.GameState; x: number; y: number; act: (r?: sim.Result) => void; onClose: () => void;
  onPack: () => void; onDemolish: () => void; preview?: Preview;
}) {
  const k = s.grid[y]?.[x];
  if (!k) return null;
  const b = sim.BUILDINGS[k];
  const lv = sim.buildingLevel(s, x, y);
  const up = sim.canUpgrade(k);
  const next = up && lv < sim.MAX_BLD_LEVEL ? lv + 1 : null;
  const cost = next ? sim.upgradeCost(k, next, s) : null;
  const why = next ? sim.upgradeBlocker(s, x, y) : null;
  const rows = ROWS.filter((r) => typeof b[r.key] === 'number' && (b[r.key] as number) > 0);
  const perks = sim.PERKS[k];
  const st = sim.stats(s);
  const recruits = k === 'barracks' && next ? Math.max(0, Math.min(sim.RECRUITS[next]!, at(b.troopCap ?? 0, next) - at(b.troopCap ?? 0, lv) + st.troopCap - s.troops)) : 0;

  return (
    <Modal title={b.name} icon="city" onClose={onClose} width="max-w-xl"
      headerRight={up ? <span className="flex items-center gap-2 text-sm text-[var(--paper-dim)]">Level {lv} <Pips level={lv} /></span> : undefined}>
      <div className="flex items-start gap-3">
        <span className="flex h-20 w-20 shrink-0 items-end justify-center overflow-hidden border-2 border-[var(--ink)] bg-[var(--slab-lo)]"><ItemThumb k={k} size={80} preview={preview} /></span>
        <div className="min-w-0 text-sm">
          <p>{sim.describeBuilding(k, lv)}.</p>
          {k === 'farm' && <p className="mt-1 text-[var(--paper-dim)]">Your city grows: {sim.foodTypes(s).join(', ') || 'nothing yet'}.</p>}
          {k === 'barracks' && <p className="mt-1 text-[var(--paper-dim)]">Drill bonus from upgraded barracks: +{sim.drillPm(s) / 10}% attack (most {sim.DRILL_CAP_PM / 10}%).</p>}
          {!up && <p className="mt-1 text-[var(--paper-dim)]">{b.arc ? 'A wonder stands as it is: one per city, and it cannot be upgraded.' : 'Decorations stay as they are; build more of them for more cheer.'}</p>}
        </div>
      </div>

      {rows.length > 0 && (
        <>
          <SubHead>{next ? `Now and at level ${next}` : 'What it does'}</SubHead>
          <table className="w-full text-sm">
            <tbody>
              {rows.map((r) => {
                const now = rowAt(r, b[r.key] as number, lv), then = next ? rowAt(r, b[r.key] as number, next) : null;
                return (
                  <tr key={r.key} className="border-b border-[var(--slab-hi)] last:border-0">
                    <td className="py-1"><span className="flex items-center gap-1.5 text-[var(--paper-dim)]"><Icon name={r.icon} size={14} />{r.label}</span></td>
                    <td className="py-1 text-right font-bold tabular-nums">{now}{r.unit ?? ''}</td>
                    {then !== null && (
                      <td className={`w-24 py-1 text-right font-bold tabular-nums ${then === now ? 'text-[var(--paper-dim)]' : r.upkeep ? 'text-[var(--bad)]' : 'text-[var(--good)]'}`}>
                        {then === now ? 'same' : <>{then}{r.unit ?? ''}</>}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
          {(b.wood || b.ore || b.food || b.goods) && <p className="mt-1 text-xs text-[var(--paper-dim)]">Rates are before your land and your citizens&apos; work speed.</p>}
        </>
      )}

      {perks && (
        <>
          <SubHead>Level rewards</SubHead>
          <ul className="space-y-1 text-sm">
            {perks.map((p, i) => {
              const got = lv >= i + 2;
              return (
                <li key={p} className={`flex items-start gap-2 ${got ? '' : 'text-[var(--paper-dim)]'}`}>
                  <span className={`mt-0.5 shrink-0 font-bold ${got ? 'text-[var(--good)]' : ''}`}>{got ? '✓' : `L${i + 2}`}</span>{p}
                </li>
              );
            })}
          </ul>
        </>
      )}

      {up && (
        <div className="well mt-4 p-3">
          {next && cost ? (
            <>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-bold tabular-nums">
                <span className="text-[var(--paper-dim)]">Upgrade to level {next}:</span>
                <span className={`flex items-center gap-1 ${s.gold < cost.gold ? 'text-[var(--bad)]' : ''}`}><Icon name="coin" size={14} />{cost.gold.toLocaleString('en-US')}</span>
                {cost.wood > 0 && <span className={`flex items-center gap-1 ${s.wood < cost.wood ? 'text-[var(--bad)]' : ''}`}><Icon name="wood" size={14} />{cost.wood}</span>}
                {cost.ore > 0 && <span className={`flex items-center gap-1 ${s.ore < cost.ore ? 'text-[var(--bad)]' : ''}`}><Icon name="ore" size={14} />{cost.ore}</span>}
                <span className={`flex items-center gap-1 ${sim.levelFromXp(s.xp) < cost.needLevel ? 'text-[var(--bad)]' : 'text-[var(--paper-dim)]'}`}><Icon name="star" size={14} />Lv {cost.needLevel}</span>
              </div>
              {recruits > 0 && <p className="mt-1 text-sm text-[var(--good)]">{recruits} fresh recruits will join your army.</p>}
              <button className="btn btn-gold mt-2 w-full py-2 text-base" disabled={!!why} onClick={() => act(sim.upgradeBuilding(s, x, y))}>
                {why ?? `Upgrade to level ${next}`}
              </button>
            </>
          ) : (
            <p className="flex items-center gap-2 text-sm font-bold text-[var(--gold)]"><Icon name="star" size={18} /> Highest level. This {b.name.toLowerCase()} is as good as it gets.</p>
          )}
        </div>
      )}

      <div className="mt-3 flex gap-2">
        <button className="btn btn-quiet flex-1 py-1.5 text-sm" onClick={onPack}>
          <Icon name="box" size={16} /> Pack into storage
        </button>
        <button className="btn btn-quiet flex-1 py-1.5 text-sm" onClick={onDemolish}>
          <Icon name="hammer" size={16} /> Demolish, {Math.floor(b.cost * 0.4)} back
        </button>
      </div>
      {lv > 1 && <p className="mt-1.5 text-xs text-[var(--paper-dim)]">Packing or demolishing loses the upgrades.</p>}
    </Modal>
  );
}
