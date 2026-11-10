'use client';

import { useState } from 'react';
import * as sim from '@metropolix/sim';
import { arcDef, type GameState } from '@metropolix/sim';
import { Meter, Modal, SECTOR_COLOR, SegBar, StatRow, SubHead, type TabDef } from './ui';

type TabId = 'overview' | 'demand' | 'economy' | 'happiness' | 'education' | 'military' | 'resources' | 'progress';
const TABS: TabDef<TabId>[] = [
  { id: 'overview', icon: 'city', label: 'Overview' },
  { id: 'demand', icon: 'chart', label: 'Demand' },
  { id: 'economy', icon: 'coin', label: 'Economy' },
  { id: 'happiness', icon: 'smile', label: 'Happiness' },
  { id: 'education', icon: 'book', label: 'Education' },
  { id: 'military', icon: 'swords', label: 'Military' },
  { id: 'resources', icon: 'wood', label: 'Resources' },
  { id: 'progress', icon: 'trophy', label: 'Progress' },
];

/** Poor to rich is an ordered scale, so it uses one hue from dim to bright. */
const WEALTH = ['#6e5524', '#a8822c', '#f2c14e'] as const;

interface Props { open: boolean; s: GameState | null; act: (r: sim.Result | undefined) => void; onClose: () => void; onWar?: () => void }

function DemandBar({ label, value }: { label: string; value: number }) {
  const more = value > 0;
  const w = Math.min(50, Math.abs(value) / 2);
  return (
    <div className="mb-3">
      <div className="mb-1 flex items-baseline justify-between text-sm">
        <span>{label}</span>
        <span className={more ? 'font-bold text-[var(--good)]' : 'text-[var(--paper-dim)]'}>{more ? `Wants more (+${value})` : value === 0 ? 'Balanced' : `Enough for now (${value})`}</span>
      </div>
      <div className="relative h-4 border-2 border-[var(--ink)] bg-[var(--slab-lo)]" aria-hidden>
        <span className="absolute inset-y-0 left-1/2 w-[2px] -translate-x-1/2 bg-[var(--rim)]" />
        <span className="absolute inset-y-0" style={{ left: more ? '50%' : `${50 - w}%`, width: `${w}%`, background: more ? 'var(--good)' : 'var(--paper-dim)', boxShadow: 'inset 0 2px 0 rgba(255,255,255,.25)' }} />
      </div>
    </div>
  );
}

function Note({ children }: { children: React.ReactNode }) {
  return <p className="mt-3 max-w-prose text-sm text-[var(--paper-dim)]">{children}</p>;
}

export default function CityPanel({ open, s, act, onClose, onWar }: Props) {
  const [tab, setTab] = useState<TabId>('overview');
  if (!open || !s) return null;

  const st = sim.stats(s);
  const arc = arcDef(s.arc);
  const sec = sim.sectorCounts(s);
  const dem = sim.demand(s);
  const wealth = sim.wealthTiers(s);
  const pct = (pm: number) => `${Math.round(pm / 10)}%`;
  const nextXp = sim.LEVEL_XP[st.level] ?? null;
  const prevXp = sim.LEVEL_XP[st.level - 1] ?? 0;
  const curve = sim.taxCurve(s);
  const best = curve.reduce((a, r) => (r.net > a.net ? r : a), curve[0]!);
  const placed = Object.values(sec).reduce((a, b) => a + b, 0);

  return (
    <Modal title={arc ? `City of the ${arc.name}` : 'Your city'} icon="city" onClose={onClose} tabs={TABS} tab={tab} onTab={setTab} tabStyle="rail" width="max-w-4xl"
      headerRight={<span className="hidden text-sm text-[var(--paper-dim)] sm:inline">Level <b className="text-[var(--paper)]">{st.level}</b></span>}>
      <div className="min-h-[22rem]">
        {tab === 'overview' && (
          <>
            <SubHead right={`${s.pop} of ${st.housing} homes filled`}>Citizens by wealth</SubHead>
            <SegBar label="Citizens by wealth" parts={[
              { label: 'Poor', value: wealth.poor, color: WEALTH[0] },
              { label: 'Middle', value: wealth.middle, color: WEALTH[1] },
              { label: 'Rich', value: wealth.rich, color: WEALTH[2] },
            ]} />
            <SubHead right={`${placed} placed`}>Buildings by kind</SubHead>
            <SegBar label="Buildings by kind" parts={sim.CATEGORIES.map((c) => ({ label: c.name, value: sec[c.id], color: SECTOR_COLOR[c.id] }))} />
            <SubHead>Work</SubHead>
            <StatRow k="Jobs filled" v={`${st.employed} of ${st.jobs}`} />
            <StatRow k="Citizens without a job" v={<span className={st.unemployed > 0 ? 'text-[var(--bad)]' : ''}>{st.unemployed}</span>} />
            <StatRow k="Productivity" v={pct(st.productivityPm)} />
            <StatRow k="ChainPower" v={<span className="text-[var(--accent)]">{st.chainPower}</span>} hint="Your on-chain score: wealth, army and progress together" />
          </>
        )}

        {tab === 'demand' && (
          <>
            <SubHead>What your citizens ask for</SubHead>
            <DemandBar label="Homes" value={dem.residential} />
            <DemandBar label="Shops" value={dem.commerce} />
            <DemandBar label="Jobs" value={dem.industry} />
            <SubHead>Advisor</SubHead>
            <ul className="space-y-1.5">
              {sim.advice(s).map((a) => <li key={a} className="well px-3 py-2 text-sm">{a}</li>)}
            </ul>
          </>
        )}

        {tab === 'economy' && (
          <>
            <div className="well p-3">
              <div className="flex items-baseline justify-between text-sm"><label htmlFor="tax-city">Tax rate</label><b className="text-lg text-[var(--gold)] tabular-nums">{s.taxRate}%</b></div>
              <input id="tax-city" type="range" min={0} max={30} value={s.taxRate} className="mt-1 w-full"
                onChange={(e) => { sim.setTax(s, +e.target.value); act(undefined); }} />
            </div>
            <SubHead>Money per second</SubHead>
            <StatRow k="Income" v={<span className="text-[var(--good)]">+{st.income}</span>} />
            <StatRow k="Upkeep" v={<span className="text-[var(--bad)]">-{st.upkeep}</span>} />
            <StatRow k="Net" v={<span className={st.net >= 0 ? 'text-[var(--good)]' : 'text-[var(--bad)]'}>{st.net >= 0 ? '+' : ''}{st.net}</span>} />
            <StatRow k="Gold in the vault" v={s.gold} />
            <SubHead right="Higher tax, less happiness">Try another tax rate</SubHead>
            <table className="w-full max-w-xl text-sm tabular-nums">
              <thead className="text-[var(--paper-dim)]"><tr className="border-b-2 border-[var(--ink)]"><th className="py-1 text-left font-normal">Tax</th><th className="text-right font-normal">Net per second</th><th className="text-right font-normal">Happiness</th><th className="w-20" /></tr></thead>
              <tbody>
                {curve.map((r) => {
                  const cur = r.rate === s.taxRate;
                  return (
                    <tr key={r.rate} className={`border-b border-[var(--slab-hi)] ${cur ? 'bg-[var(--slab-hi)]' : ''}`}>
                      <td className="py-1 pl-1">{r.rate}%{r === best && <span className="ml-2 text-xs text-[var(--gold)]">most gold</span>}</td>
                      <td className={`text-right ${r.net < 0 ? 'text-[var(--bad)]' : ''}`}>{r.net >= 0 ? '+' : ''}{r.net}</td>
                      <td className="text-right">{pct(r.happinessPm)}</td>
                      <td className="py-1 text-right">{cur ? <span className="pr-2 text-xs text-[var(--paper-dim)]">Current</span> : <button className="btn btn-quiet !px-2 !py-0.5 text-xs" onClick={() => { sim.setTax(s, r.rate); act(undefined); }}>Use</button>}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </>
        )}

        {tab === 'happiness' && (
          <>
            <SubHead right={pct(st.happinessPm)}>Happiness</SubHead>
            <Meter label="Happiness" value={st.happinessPm} tone="var(--gold)" />
            <SubHead>What moves it</SubHead>
            <StatRow k="Tax" v={s.taxRate > 10 ? <span className="text-[var(--bad)]">-{(s.taxRate - 10) * 2.5}%</span> : <span className="text-[var(--good)]">+{(10 - s.taxRate) * 0.8}%</span>} />
            <StatRow k="Citizens without a job" v={st.unemployed} />
            <StatRow k="Pollution" v={st.pollution} />
            <Note>Parks, fountains, statues and schools lift spirits. High tax, idle hands and factory smoke drag them down.</Note>
          </>
        )}

        {tab === 'education' && (
          <>
            <SubHead right={pct(st.eduCoverPm)}>Citizens with schooling</SubHead>
            <Meter label="Education coverage" value={st.eduCoverPm} tone="#3a9fd8" />
            <SubHead>Schools</SubHead>
            <StatRow k="Seats in school" v={st.edu} />
            <StatRow k="Citizens" v={s.pop} />
            <StatRow k="Productivity" v={pct(st.productivityPm)} />
            <Note>Each school teaches 40 citizens. Schooled workers produce more and climb out of poverty.</Note>
          </>
        )}

        {tab === 'military' && (
          <>
            <SubHead right={`${s.troops} of ${st.troopCap}`}>{arc?.troop ?? 'Troop'}s</SubHead>
            <Meter label="Army size" value={s.troops} max={Math.max(1, st.troopCap)} />
            <div className="mt-3">
              <StatRow k="Attack" v={st.attack} />
              <StatRow k="Defense" v={st.defense} />
              <StatRow k="From towers" v={st.towerDef} />
              <StatRow k="Cost per soldier" v={`${st.troopCost} gold, ${sim.TROOP_ORE_COST} ore`} />
            </div>
            {arc && (
              <div className="well mt-3 p-3 text-sm">
                <p><b>How the {arc.name} fight:</b> {arc.attackStyle}</p>
                <ul className="mt-1.5 space-y-0.5 text-[var(--paper-dim)]">{arc.weaknesses.map((w) => <li key={w}>Weak spot: {w}</li>)}</ul>
              </div>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              <button className="btn btn-quiet text-sm" onClick={() => act(sim.trainTroops(s, 1))}>Train 1</button>
              <button className="btn btn-quiet text-sm" onClick={() => act(sim.trainTroops(s, 5))}>Train 5</button>
              {onWar && <button className="btn btn-accent ml-auto text-sm" onClick={onWar}>Open war room</button>}
            </div>
          </>
        )}

        {tab === 'resources' && (
          <>
            <SubHead>Stockpile</SubHead>
            <StatRow k="Gold" v={s.gold} />
            <StatRow k="Wood" v={<>{s.wood} <span className="font-normal text-[var(--paper-dim)]">+{st.woodRate}/s</span></>} />
            <StatRow k="Ore" v={<>{s.ore} <span className="font-normal text-[var(--paper-dim)]">+{st.oreRate}/s</span></>} />
            {arc && (
              <>
                <SubHead right={arc.woodPm === 0 ? 'none' : `${arc.woodPm / 10}% of normal`}>Forests on your land</SubHead>
                <Meter label="Forest richness" value={arc.woodPm} max={2000} tone="#57a653" />
                <SubHead right={arc.orePm === 0 ? 'none' : `${arc.orePm / 10}% of normal`}>Mines on your land</SubHead>
                <Meter label="Mine richness" value={arc.orePm} max={2000} tone="#8a93a6" />
                <Note>Short on wood or ore? Other mayors sell it in Social, under Market.</Note>
              </>
            )}
          </>
        )}

        {tab === 'progress' && (
          <>
            <SubHead right={nextXp ? `${s.xp} of ${nextXp} XP` : 'Top level'}>Level {st.level}</SubHead>
            <Meter label="Progress to next level" value={nextXp ? s.xp - prevXp : 1} max={nextXp ? nextXp - prevXp : 1} tone="var(--gold)" />
            <SubHead right={`${sim.milestones(s).filter((m) => m.done).length} of ${sim.milestones(s).length} done`}>Milestones</SubHead>
            <ul className="space-y-1.5">
              {sim.milestones(s).map((m) => (
                <li key={m.id} className={`well px-3 py-2 text-sm ${m.done ? 'opacity-70' : ''}`}>
                  <div className="flex items-center gap-2">
                    <span aria-hidden className={`inline-block h-3.5 w-3.5 shrink-0 border-2 border-[var(--ink)] ${m.done ? 'bg-[var(--good)]' : 'bg-[var(--slab)]'}`} />
                    <span className="flex-1">{m.label}{m.done && <span className="sr-only"> (done)</span>}</span>
                    <span className="text-[var(--paper-dim)] tabular-nums">{Math.min(m.progress, m.target)} / {m.target}</span>
                  </div>
                  {!m.done && <div className="mt-1.5"><Meter label={m.label} value={m.progress} max={m.target} /></div>}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </Modal>
  );
}
