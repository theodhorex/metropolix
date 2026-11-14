'use client';

import { useRef, useState, type ReactNode } from 'react';
import * as sim from '@metropolix/sim';
import { arcDef, type GameState } from '@metropolix/sim';
import Icon, { type IconName } from './Icon';
import Portrait from './Portrait';
import { Modal, StatRow, SubHead, type TabDef } from './ui';

type TabId = 'army' | 'recipes' | 'attack' | 'defense';
const TABS: TabDef<TabId>[] = [
  { id: 'army', label: 'Army', icon: 'swords' },
  { id: 'recipes', label: 'Army recipes', icon: 'scroll' },
  { id: 'attack', label: 'Attack', icon: 'flame' },
  { id: 'defense', label: 'Defense', icon: 'shield' },
];
const ROLE_ICON: Record<sim.Role, IconName> = { vanguard: 'shield', raider: 'swords', breaker: 'hammer' };
const HERO_ICON: Record<string, IconName> = { champion: 'swords', warden: 'shield', plunderer: 'bag', warlord: 'crown' };
/** Scout map tiles, drawn in the game's own sprite palette. */
const TILE: Record<string, { color: string; name: string; mark?: string }> = {
  hall: { color: '#f2c14e', name: 'Town hall', mark: 'H' },
  tower: { color: '#ea6a55', name: 'Tower', mark: 'T' },
  store: { color: '#57a653', name: 'Vault', mark: '$' },
  barracks: { color: '#8f6fd6', name: 'Barracks', mark: 'B' },
  wall: { color: '#6b5a48', name: 'Wall' },
  house: { color: '#8a93a6', name: 'House' },
};

interface Props { open: boolean; s: GameState | null; act: (r: sim.Result | undefined) => void; onClose: () => void }

/** A unit slot. Clicking it makes one more of that unit. */
function Slot({ icon, count, label, cost, onClick, small }: { icon: IconName; count: number; label: string; cost?: ReactNode; onClick?: () => void; small?: boolean }) {
  const body = (
    <>
      <span className={`absolute -top-2 -left-2 border-2 border-[var(--ink)] px-1.5 text-xs font-bold tabular-nums ${count > 0 ? 'bg-[var(--accent)] text-[var(--accent-ink)]' : 'bg-[var(--slab-hi)] text-[var(--paper-dim)]'}`}>x{count}</span>
      <span className={count > 0 ? '' : 'opacity-50 grayscale'}><Icon name={icon} size={small ? 26 : 34} /></span>
      <span className="text-xs leading-tight font-bold">{label}</span>
      {cost && <span className="flex items-center gap-0.5 text-[11px] text-[var(--gold)] tabular-nums">{cost}</span>}
      {onClick && <span aria-hidden className="absolute right-0.5 bottom-0.5 flex h-4 w-4 items-center justify-center border-2 border-[var(--ink)] bg-[var(--good)] text-[11px] leading-none font-bold text-[#0d2106]">+</span>}
    </>
  );
  const cls = `slot relative flex shrink-0 flex-col items-center justify-center gap-0.5 text-center ${small ? 'h-[72px] w-[72px]' : 'h-24 w-24'}`;
  return onClick
    ? <button onClick={onClick} className={`${cls} slot-btn`} aria-label={`Add one ${label}. You have ${count}.`}>{body}</button>
    : <div className={cls} title={label}>{body}</div>;
}

function Stars({ n, size = 26 }: { n: number; size?: number }) {
  return <span className="inline-flex gap-0.5 align-middle" role="img" aria-label={`${n} of 3 stars`}>{[0, 1, 2].map((i) => <span key={i} className={i < n ? '' : 'opacity-25 grayscale'}><Icon name="star" size={size} /></span>)}</span>;
}

function Gold({ n }: { n: number }) {
  return <><Icon name="coin" size={11} />{n}</>;
}

export default function WarRoom({ open, s, act, onClose }: Props) {
  const [tab, setTab] = useState<TabId>('army');
  const [target, setTarget] = useState('');
  const pinned = useRef(''); // the default target, kept while the list order moves
  const [tq, setTq] = useState<{ search: string; sort: 'gold' | 'power' | 'level' }>({ search: '', sort: 'gold' });
  const [plan, setPlan] = useState<sim.RaidPlan>({ commit: 100, focus: 'balanced', rage: false, heal: false, ram: false });
  const [report, setReport] = useState<sim.BattleReport | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  if (!open || !s) return null;

  const st = sim.stats(s);
  const arc = arcDef(s.arc);
  const level = st.level;
  const army = sim.armyOf(s);
  const run = (r: sim.Result) => { setMsg(r.ok ? null : (r.msg as string)); act(r); };
  const needle = tq.search.trim().toLowerCase();
  const listed = [...s.world.mayors]
    .filter((m) => !needle || m.name.toLowerCase().includes(needle))
    .sort((a, b) => (tq.sort === 'gold' ? b.gold - a.gold : tq.sort === 'level' ? b.level - a.level : sim.mayorPower(b) - sim.mayorPower(a)) || a.name.localeCompare(b.name));
  // until you pick someone, the top of the list is the target, pinned so a world tick cannot swap it under you
  if (!target && (!pinned.current || !sim.findMayor(s, pinned.current))) pinned.current = listed[0]?.id ?? '';
  const mayor = sim.findMayor(s, target || pinned.current) ?? listed[0] ?? s.world.mayors[0];
  const rival = mayor ? sim.mayorRival(mayor) : sim.findRival(s, target) ?? sim.RIVALS[0]!;
  const target_ = rival.id;
  const shieldT = mayor ? sim.shieldLeft(s, mayor) : 0;
  const sc = sim.scout(rival);
  const pv = sim.previewRaid(s, target_, plan);
  const cd = Math.max(0, (s.cooldowns[target_] ?? 0) - s.tick);
  const shield = Math.max(0, s.shieldUntil - s.tick);
  const troopName = arc?.troop ?? 'Troop';
  const switchTab = (t: TabId) => { setTab(t); setMsg(null); };

  return (
    <Modal title="War room" icon="swords" onClose={onClose} tabs={TABS} tab={tab} onTab={switchTab} width="max-w-5xl" tall
      headerRight={
        <span className="flex items-center gap-3 text-sm tabular-nums">
          <span className="flex items-center gap-1" title="Trophies"><Icon name="trophy" size={18} /> {s.trophies}</span>
          {shield > 0 && <span className="flex items-center gap-1" title="Shield: nobody can raid you"><Icon name="shield" size={18} /> {shield}s</span>}
        </span>
      }>
      {msg && <p role="alert" className="well mb-3 flex items-center gap-2 border-[var(--bad)] px-3 py-1.5 text-sm text-[var(--bad)]">{msg}</p>}

      {tab === 'army' && (
        <div className="flex flex-col gap-4 lg:flex-row">
          <section className="shrink-0 lg:w-[212px]" aria-label="Heroes">
            <SubHead>Heroes</SubHead>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-2">
              {sim.HEROES.map((h) => {
                const locked = level < h.unlock, on = !!s.heroes[h.id] && !locked;
                return (
                  <button key={h.id} onClick={() => run(sim.toggleHero(s, h.id))} aria-pressed={on} disabled={locked}
                    className={`hero flex flex-col items-center gap-1 p-1.5 text-center ${on ? 'hero-on' : ''}`}>
                    <span className={`w-full border-2 border-[var(--ink)] py-0.5 text-[11px] font-bold ${on ? 'bg-[var(--gold)] text-[#2b1d04]' : 'bg-[var(--slab-lo)] text-[var(--paper-dim)]'}`}>
                      {locked ? `Level ${h.unlock}` : on ? 'Joins raids' : 'Resting'}
                    </span>
                    <span className="well flex h-14 w-full items-center justify-center"><span className={locked ? 'opacity-40 grayscale' : ''}><Icon name={HERO_ICON[h.id]!} size={40} /></span></span>
                    <span className="font-display text-sm leading-tight font-bold">{h.name}</span>
                    <span className="min-h-[2.4em] text-[11px] leading-tight text-[var(--paper-dim)]">{h.desc}</span>
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-xs text-[var(--paper-dim)]">Tap a hero to send it on raids or let it rest.</p>
          </section>

          <div className="min-w-0 flex-1">
            <SubHead right={`${s.troops} of ${st.troopCap} beds`}>{troopName} troops</SubHead>
            <div className="flex flex-wrap items-start gap-3 pt-2">
              {sim.ROLES.map((r) => <Slot key={r} icon={ROLE_ICON[r]} count={army[r]} label={sim.ROLE_DEFS[r].name} cost={<><Gold n={sim.roleCost(s, r).gold} /> <span className="text-[var(--paper-dim)]">+{sim.roleCost(s, r).ore} ore</span></>} onClick={() => run(sim.trainRole(s, r, 1))} />)}
              <dl className="min-w-[14rem] flex-1 space-y-1 text-sm">
                {sim.ROLES.map((r) => <div key={r}><dt className="inline font-bold">{sim.ROLE_DEFS[r].name}. </dt><dd className="inline text-[var(--paper-dim)]">{sim.ROLE_DEFS[r].desc}</dd></div>)}
              </dl>
            </div>

            <div className="mt-2 grid gap-x-6 sm:grid-cols-2">
              <div>
                <SubHead right={`${s.spells.rage + s.spells.heal} of ${sim.SPELL_MAX * 2}`}>Spells</SubHead>
                <div className="flex items-start gap-3 pt-2">
                  <Slot small icon="flame" count={s.spells.rage} label="Rage" cost={<Gold n={sim.SPELL_COST.rage} />} onClick={() => run(sim.brewSpell(s, 'rage'))} />
                  <Slot small icon="heart" count={s.spells.heal} label="Heal" cost={<Gold n={sim.SPELL_COST.heal} />} onClick={() => run(sim.brewSpell(s, 'heal'))} />
                  <p className="text-sm text-[var(--paper-dim)]">Rage adds 30% attack. Heal saves 40% of the fallen. One of each per raid.</p>
                </div>
              </div>
              <div>
                <SubHead right={`${s.siege} of ${sim.RAM_MAX}`}>Siege</SubHead>
                <div className="flex items-start gap-3 pt-2">
                  <Slot small icon="ram" count={s.siege} label="Ram" cost={<Gold n={sim.RAM_COST.gold} />} onClick={() => run(sim.buildRam(s))} />
                  <p className="text-sm text-[var(--paper-dim)]">Knocks 25% off enemy tower defense. Also costs {sim.RAM_COST.ore} ore.</p>
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3 border-t-2 border-[var(--ink)] pt-3">
              <span className="flex items-center gap-1.5 text-sm"><Icon name="swords" size={16} /> Attack <b className="tabular-nums">{st.attack}</b></span>
              <span className="flex items-center gap-1.5 text-sm"><Icon name="shield" size={16} /> Defense <b className="tabular-nums">{st.defense}</b></span>
              <button className="btn btn-accent ml-auto px-5 py-2 text-base" onClick={() => switchTab('attack')}>Pick a target</button>
            </div>
          </div>
        </div>
      )}

      {tab === 'recipes' && (
        <>
          <p className="mb-3 max-w-prose text-sm text-[var(--paper-dim)]">A recipe trains a ready-made squad in one tap. The mix decides how the raid goes.</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {sim.RECIPES.map((r) => (
              <article key={r.id} className="panel p-3">
                <h3 className="font-display text-lg font-bold">{r.name}</h3>
                <p className="mb-3 text-sm text-[var(--paper-dim)]">{r.desc}</p>
                <div className="mb-3 flex gap-3 pl-2">{sim.ROLES.map((role) => <Slot small key={role} icon={ROLE_ICON[role]} count={r.mix[role]} label={sim.ROLE_DEFS[role].name} />)}</div>
                <SquadCost s={s} mix={r.mix} />
                <div className="flex gap-2">
                  <button className="btn btn-good text-sm" onClick={() => run(sim.trainRecipe(s, r, 1))}>Train squad</button>
                  <button className="btn btn-quiet text-sm" onClick={() => run(sim.trainRecipe(s, r, 3))}>Train 3 squads</button>
                </div>
              </article>
            ))}
          </div>
        </>
      )}

      {tab === 'attack' && (
        <div className="flex flex-col gap-4 md:flex-row">
          <section className="shrink-0 md:w-56" aria-label="Targets">
            <SubHead>Targets</SubHead>
            <div className="mb-1.5 flex gap-1">
              <input value={tq.search} onChange={(e) => setTq({ ...tq, search: e.target.value })} placeholder="Search mayor..." className="field min-w-0 flex-1 text-sm" aria-label="Search targets" />
              <select value={tq.sort} onChange={(e) => setTq({ ...tq, sort: e.target.value as typeof tq.sort })} className="field w-20 text-sm" aria-label="Sort targets">
                <option value="gold">Gold</option><option value="power">Power</option><option value="level">Level</option>
              </select>
            </div>
            <ul className="max-h-[26rem] space-y-1.5 overflow-y-auto pr-1">
              {listed.map((m) => {
                  const c = Math.max(0, (s.cooldowns[m.id] ?? 0) - s.tick);
                  const sh = sim.shieldLeft(s, m);
                  const sel = target_ === m.id;
                  return (
                    <li key={m.id}>
                      <button onClick={() => { setTarget(m.id); setReport(null); }} aria-pressed={sel}
                        className={`target flex w-full items-center gap-2 px-2.5 py-1.5 text-left ${sel ? 'target-on' : ''}`}>
                        <Portrait id={sim.mayorPortrait(m)} className="h-9 w-8 shrink-0 border border-[var(--ink)]" title="" />
                        <span className="min-w-0 flex-1">
                        <span className="flex items-baseline justify-between gap-2"><b className="min-w-0 truncate">{m.name}</b><span className="shrink-0 whitespace-nowrap text-xs text-[var(--paper-dim)]">Lv {m.level}</span></span>
                        <span className="flex justify-between gap-1.5 whitespace-nowrap text-xs text-[var(--paper-dim)] tabular-nums">
                          <span className="flex items-center gap-0.5 text-[var(--gold)]"><Icon name="coin" size={10} />{m.gold}</span>
                          <span>Pow {sim.mayorPower(m)}</span>
                          <span className={`flex items-center gap-0.5 ${sh > 0 ? 'text-[var(--bad)]' : c > 0 ? '' : 'text-[var(--good)]'}`} title={sh > 0 ? 'Shielded after a raid' : c > 0 ? 'Your troops are resting' : 'Ready to raid'}>{sh > 0 ? <><Icon name="shield" size={10} />{sh}s</> : c > 0 ? `${c}s` : 'ready'}</span>
                        </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
            </ul>
          </section>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap gap-4">
              <figure className="shrink-0">
                <svg viewBox="0 0 11 11" className="h-48 w-48 border-2 border-[var(--ink)] bg-[#2b3a25]" shapeRendering="crispEdges" role="img" aria-label={`Scouted layout of ${rival.name}`}>
                  {sc.grid.map((row, y) => row.map((t, x) => t && TILE[t] && (
                    <g key={`${x}-${y}`}>
                      <rect x={x + 0.08} y={y + 0.08} width={0.84} height={0.84} fill={TILE[t].color} stroke="#12151d" strokeWidth={0.08} />
                      {TILE[t].mark && <text x={x + 0.5} y={y + 0.74} fontSize={0.62} fontWeight="bold" textAnchor="middle" fill="#12151d">{TILE[t].mark}</text>}
                    </g>
                  )))}
                </svg>
                <figcaption className="mt-1.5 grid w-48 grid-cols-2 gap-x-2 gap-y-0.5 text-xs text-[var(--paper-dim)]">
                  {Object.values(TILE).map((t) => <span key={t.name} className="flex items-center gap-1"><span aria-hidden className="inline-block h-2.5 w-2.5 border border-[var(--ink)]" style={{ background: t.color }} />{t.name}</span>)}
                </figcaption>
              </figure>
              <div className="min-w-[13rem] flex-1">
                <h3 className="font-display text-xl font-bold">{rival.name}</h3>
                <p className="mb-2 text-sm"><span className="text-[var(--gold)]">{sim.TRAITS[sc.trait].name}.</span> <span className="text-[var(--paper-dim)]">{sim.TRAITS[sc.trait].hint}</span></p>
                <StatRow k="Defense" v={sc.defense} />
                <StatRow k={`From ${sc.towers} tower${sc.towers === 1 ? '' : 's'}`} v={sc.towerDef} />
                <StatRow k="Garrison" v={sc.garrison} />
                {mayor ? (
                  <>
                    <StatRow k="Treasury" v={<span className="text-[var(--gold)]">{mayor.gold}</span>} />
                    <StatRow k={`Most you can take (${sim.MAX_LOOT_PCT}%)`} v={<span className="text-[var(--gold)]">{Math.floor((mayor.gold * sim.MAX_LOOT_PCT) / 100)}</span>} />
                    <StatRow k="Condition" v={shieldT > 0 ? <span className="text-[var(--bad)]">shielded {shieldT}s</span> : mayor.wounded > 0 ? <span className="text-[var(--good)]">wounded {mayor.wounded}%</span> : 'fresh'} />
                  </>
                ) : <StatRow k="Gold in vaults" v={<span className="text-[var(--gold)]">up to {sc.loot}</span>} />}
              </div>
            </div>

            <section className="panel mt-4 p-3" aria-label="Raid plan">
              <div className="flex items-baseline justify-between text-sm">
                <label htmlFor="commit">Send <b>{plan.commit}%</b> of your army</label>
                <b className="tabular-nums">{pv?.sent ?? 0} troops</b>
              </div>
              <input id="commit" type="range" min={10} max={100} step={5} value={plan.commit} className="w-full" onChange={(e) => setPlan({ ...plan, commit: +e.target.value })} />

              <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-[var(--paper-dim)]">Aim for</span>
                  <div className="seg" role="group" aria-label="Aim for">
                    {(['loot', 'balanced', 'trophy'] as sim.Focus[]).map((f) => (
                      <button key={f} aria-pressed={plan.focus === f} onClick={() => setPlan({ ...plan, focus: f })}>{f === 'trophy' ? 'Trophies' : f === 'loot' ? 'Gold' : 'Both'}</button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-[var(--paper-dim)]">Bring</span>
                  {([['rage', 'flame', 'Rage', s.spells.rage], ['heal', 'heart', 'Heal', s.spells.heal], ['ram', 'ram', 'Ram', s.siege]] as const).map(([k, icon, name, have]) => (
                    <button key={k} aria-pressed={plan[k] && have > 0} disabled={!have} onClick={() => setPlan({ ...plan, [k]: !plan[k] })}
                      className="btn btn-quiet !px-2 !py-1 text-xs" title={have ? `${name}: ${have} ready` : `No ${name} ready`}>
                      <Icon name={icon} size={16} /> {name} <span className="tabular-nums opacity-80">{have}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="well mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 px-3 py-2 text-sm">
                {pv ? (
                  <>
                    <Stars n={pv.stars} size={22} />
                    <span><b>{pv.destruction}%</b> destroyed</span>
                    <span className="text-[var(--gold)]">about {pv.loot} gold</span>
                    <span className="text-[var(--bad)]">about {pv.lost} lost</span>
                    <span className="w-full text-xs text-[var(--paper-dim)]">Your force {pv.force} against defense {pv.effDefense}. Luck can swing it 15% either way.</span>
                  </>
                ) : <span className="text-[var(--paper-dim)]">You have no troops yet. Train some in the Army tab.</span>}
              </div>
              <div className="mt-3 flex justify-end">
                <button className="btn btn-accent px-6 py-2 text-lg" disabled={!pv || cd > 0 || shieldT > 0} onClick={() => {
                  const r = sim.launchRaid(s, target_, plan); setMsg(r.ok ? null : (r.msg as string)); if (r.ok && r.report) setReport(r.report); act(r);
                }}>{shieldT > 0 ? `Shielded, ${shieldT}s` : cd > 0 ? `Troops resting, ${cd}s` : 'Attack!'}</button>
              </div>
            </section>

            {report && (
              <section className={`window win-in mt-4 p-4 text-center`} role="status" aria-label="Battle report">
                <h3 className={`font-display text-3xl font-bold ${report.win ? 'text-[var(--gold)]' : 'text-[var(--bad)]'}`}>{report.win ? 'Victory' : 'Defeat'}</h3>
                <div className="my-1"><Stars n={report.stars} size={36} /></div>
                <div className="mx-auto mt-2 grid max-w-md grid-cols-2 gap-2 text-sm sm:grid-cols-4">
                  <span className="well py-1"><b className="block text-base">{report.destruction}%</b>destroyed</span>
                  <span className="well py-1"><b className="block text-base text-[var(--gold)]">+{report.loot}</b>gold</span>
                  <span className="well py-1"><b className="block text-base text-[var(--bad)]">-{report.lost}</b>troops</span>
                  <span className="well py-1"><b className="block text-base">{report.trophies >= 0 ? '+' : ''}{report.trophies}</b>trophies</span>
                </div>
                <ol className="mx-auto mt-3 max-w-prose space-y-1 text-left text-sm">
                  {report.rounds.map((r) => <li key={r.title}><b>{r.title}.</b> <span className="text-[var(--paper-dim)]">{r.text}</span></li>)}
                </ol>
                <p className="mt-2 text-xs text-[var(--paper-dim)]">+{report.xp} XP</p>
              </section>
            )}
          </div>
        </div>
      )}

      {tab === 'defense' && (() => {
        const wall = Math.floor((st.defense * sim.DEF_PLANS[s.defPlan].defPm) / 1000);
        const threats = sim.raidThreats(s);
        const top = Math.max(wall, ...threats.map((r) => r.attack), 1) * 1.15;
        const shield = Math.max(0, s.shieldUntil - s.tick);
        const nextRaid = Math.max(0, s.nextRaidTick - s.tick);
        return (
          <div className="grid gap-5 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
            <section>
              <SubHead>Defense plan</SubHead>
              <div className="grid gap-2" role="radiogroup" aria-label="Defense plan">
                {(Object.keys(sim.DEF_PLANS) as sim.DefPlan[]).map((p) => (
                  <button key={p} role="radio" aria-checked={s.defPlan === p} onClick={() => run(sim.setDefPlan(s, p))}
                    className={`target flex items-baseline gap-3 px-3 py-2 text-left ${s.defPlan === p ? 'target-on' : ''}`}>
                    <span className="font-display w-20 shrink-0 text-base font-bold">{sim.DEF_PLANS[p].name}</span>
                    <span className="text-sm text-[var(--paper-dim)]">{sim.DEF_PLANS[p].desc}</span>
                  </button>
                ))}
              </div>
              <div className="mt-3">
                <StatRow k="Your wall with this plan" v={<span className="text-[var(--gold)]">{wall}</span>} />
                <StatRow k="From towers" v={st.towerDef} />
                <StatRow k="Troops at home" v={s.troops} />
              </div>
              <div className={`well mt-3 flex items-center gap-2.5 px-3 py-2 text-sm ${shield > 0 ? '!border-[var(--good)]' : ''}`}>
                <Icon name="shield" size={22} />
                {shield > 0
                  ? <span><b className="text-[var(--good)]">Shield up</b> for {shield}s. Raiders turn back at the gate.</span>
                  : <span>No shield. You get a {sim.SHIELD_TICKS}s shield after a raid breaks through.</span>}
              </div>
            </section>

            <section aria-label="Who might raid you">
              <SubHead right={nextRaid > 0 ? <span className="tabular-nums">next raid party in {nextRaid}s</span> : 'a raid party is on the way'}>Who might raid you</SubHead>
              {threats.length === 0 ? <p className="text-sm text-[var(--paper-dim)]">No rival is strong enough to bother you yet.</p> : (
                <ul className="relative space-y-2">
                  {threats.map((r) => {
                    const breaks = r.attack > wall;
                    return (
                      <li key={r.id} className="grid grid-cols-[7.5rem_minmax(0,1fr)_6.5rem] items-center gap-2 text-sm">
                        <span className="truncate font-bold">{r.name}</span>
                        <span className="relative h-5 border-2 border-[var(--ink)] bg-[var(--slab-lo)]">
                          <span className="absolute inset-y-0 left-0" style={{ width: `${(r.attack / top) * 100}%`, background: breaks ? 'var(--bad)' : 'var(--paper-dim)', boxShadow: 'inset 0 2px 0 rgba(255,255,255,.2)' }} />
                          <span aria-hidden className="absolute -inset-y-1 w-[3px] bg-[var(--gold)]" style={{ left: `calc(${(wall / top) * 100}% - 1px)` }} />
                        </span>
                        <span className={`text-right font-bold tabular-nums ${breaks ? 'text-[var(--bad)]' : 'text-[var(--good)]'}`}>{r.attack} {breaks ? 'breaks in' : 'held'}</span>
                      </li>
                    );
                  })}
                </ul>
              )}
              <p className="mt-2 flex items-center gap-1.5 text-xs text-[var(--paper-dim)]"><span aria-hidden className="inline-block h-3 w-[3px] bg-[var(--gold)]" /> Gold line: your wall ({wall}). Bars show each rival's attack.</p>

              <SubHead>Raids on your city</SubHead>
              {s.raidLog.length === 0 ? <p className="text-sm text-[var(--paper-dim)]">Nobody has tried yet.</p> : (
                <ul className="space-y-1.5">
                  {s.raidLog.map((r, i) => (
                    <li key={i} className="well flex flex-wrap items-baseline gap-x-2 px-3 py-1.5 text-sm">
                      <b className={r.won ? 'text-[var(--good)]' : 'text-[var(--bad)]'}>{r.won ? 'Held' : 'Raided'}</b>
                      <span>by {r.by}</span>
                      <span className="text-[var(--paper-dim)]">their {r.atk} against your {r.def}</span>
                      {!r.won && <span className="ml-auto text-[var(--bad)] tabular-nums">-{r.stolen} gold, -{r.lost} troops</span>}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        );
      })()}
    </Modal>
  );
}

/** What one squad of a recipe costs right now; red where you are short. */
function SquadCost({ s, mix }: { s: GameState; mix: sim.Army }) {
  let gold = 0, ore = 0;
  for (const role of sim.ROLES) { const c = sim.roleCost(s, role); gold += c.gold * mix[role]; ore += c.ore * mix[role]; }
  const size = sim.ROLES.reduce((a, r) => a + mix[r], 0);
  return (
    <p className="mb-3 flex flex-wrap items-center gap-x-3 text-sm font-bold tabular-nums">
      <span className="font-normal text-[var(--paper-dim)] [font-family:var(--font-body)]">{size} troops, each squad</span>
      <span className={`flex items-center gap-1 ${s.gold < gold ? 'text-[var(--bad)]' : 'text-[var(--gold)]'}`}><Icon name="coin" size={14} />{gold.toLocaleString('en-US')}</span>
      <span className={`flex items-center gap-1 ${s.ore < ore ? 'text-[var(--bad)]' : ''}`}><Icon name="ore" size={14} />{ore}</span>
    </p>
  );
}
