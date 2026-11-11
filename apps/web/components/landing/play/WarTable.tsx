'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { ARCS, launchRaid, mayorPower, previewRaid, type BattleReport, type GameState, type RaidPlan } from '@metropolix/sim';
import { warCity } from './showcase';
import './play.css';

/**
 * Raid a simulated mayor with the game's own battle maths: previewRaid while you drag,
 * launchRaid on a copy of the state when you press Raid. The showcase never changes.
 */
const TIERS = [{ at: 0.06, label: 'Easy prey' }, { at: 0.4, label: 'Fair fight' }, { at: 0.9, label: 'Warlord' }];

export default function WarTable() {
  const id = useId();
  const base = useMemo<GameState>(() => warCity(), []);
  const targets = useMemo(() => {
    const ms = [...(base.world?.mayors ?? [])].sort((a, b) => mayorPower(a) - mayorPower(b));
    return TIERS.map((t) => ({ tier: t.label, m: ms[Math.min(ms.length - 1, Math.floor(ms.length * t.at))]! })).filter((t) => t.m);
  }, [base]);
  const [pick, setPick] = useState(0);
  const [commit, setCommit] = useState(100);
  const [report, setReport] = useState<BattleReport | null>(null);
  const [busy, setBusy] = useState(false);
  const stage = useRef<HTMLDivElement>(null);

  const target = targets[pick]?.m;
  const plan: RaidPlan = { commit, focus: 'balanced', rage: false, heal: false, ram: false };
  const pv = target ? previewRaid(base, target.id, plan) : null;

  const raid = () => {
    if (!target || busy) return;
    const copy = structuredClone(base);
    const r = launchRaid(copy, target.id, plan);
    if (!r.ok || !r.report) return;
    setBusy(true);
    setReport(null);
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (still || !stage.current) { setReport(r.report); setBusy(false); return; }
    // swords clash, then the result card takes over
    const el = stage.current;
    gsap.timeline({ onComplete: () => { setReport(r.report!); setBusy(false); } })
      .fromTo(el.querySelector('.war-sword-l'), { x: -80, rotate: -40, opacity: 0 }, { x: -6, rotate: 0, opacity: 1, duration: 0.35, ease: 'power3.in' })
      .fromTo(el.querySelector('.war-sword-r'), { x: 80, rotate: 40, opacity: 0 }, { x: 6, rotate: 0, opacity: 1, duration: 0.35, ease: 'power3.in' }, '<')
      .fromTo(el.querySelector('.war-flash'), { scale: 0.2, opacity: 1 }, { scale: 2.4, opacity: 0, duration: 0.4, ease: 'power2.out' })
      .to(el, { x: 4, duration: 0.05, yoyo: true, repeat: 5, ease: 'steps(1)' }, '<')
      .to([el.querySelector('.war-sword-l'), el.querySelector('.war-sword-r')], { opacity: 0, duration: 0.2 });
  };

  // stars pop in and the loot counts up once a report arrives
  useEffect(() => {
    if (!report || !stage.current) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const el = stage.current;
    const ctx = gsap.context(() => {
      gsap.from('.war-star.on', { scale: 0, rotate: -90, duration: 0.45, stagger: 0.18, ease: 'back.out(3)' });
      const n = { v: 0 };
      const out = el.querySelector<HTMLElement>('.war-loot');
      gsap.to(n, { v: report.loot, duration: 0.9, ease: 'power2.out', onUpdate: () => { if (out) out.textContent = String(Math.round(n.v)); } });
    }, el);
    return () => ctx.revert();
  }, [report]);

  if (!target) return null;
  const arcOf = (a: string) => ARCS.find((x) => x.id === a);

  return (
    <div className="war-table" data-reveal>
      <div className="war-head">
        <span className="font-display war-tag">War table</span>
        <p className="war-sub">Pick a rival, choose how many of your {base.troops} troops to send, and read the odds from the game&apos;s own battle maths.</p>
      </div>

      <div className="war-targets" role="radiogroup" aria-label="Rival mayor">
        {targets.map(({ tier, m }, i) => (
          <button
            key={m.id} type="button" role="radio" aria-checked={pick === i}
            className="war-target" data-on={pick === i || undefined}
            style={{ ['--arc' as string]: arcOf(m.arc)?.accent ?? '#999' }}
            onClick={() => { setPick(i); setReport(null); }}
          >
            <span className="war-tier font-display">{tier}</span>
            <span className="war-name">{m.name}</span>
            <span className="war-meta">{arcOf(m.arc)?.name ?? m.arc} · level {m.level}</span>
            <span className="war-meta">Treasury <b className="font-display">{m.gold}</b> · Power <b className="font-display">{mayorPower(m)}</b></span>
          </button>
        ))}
      </div>

      <label htmlFor={id} className="war-label">Troops sent <b className="font-display">{Math.round((base.troops * commit) / 100)}</b> of {base.troops}</label>
      <input id={id} type="range" min={10} max={100} step={5} value={commit} className="war-range"
        onChange={(e) => { setCommit(+e.target.value); setReport(null); }} />

      <div className="war-stage" ref={stage} aria-live="polite">
        <span className="war-sword-l" aria-hidden="true">⚔</span>
        <span className="war-flash" aria-hidden="true" />
        <span className="war-sword-r" aria-hidden="true">⚔</span>
        {report ? (
          <div className="war-result">
            <div className="war-stars" aria-label={`${report.stars} of 3 stars`}>
              {[0, 1, 2].map((i) => <span key={i} className={`war-star ${i < report.stars ? 'on' : ''}`} aria-hidden="true" />)}
            </div>
            <p className="war-verdict font-display">{report.win ? 'Victory' : 'Repelled'}</p>
            <p className="war-line">Loot <b className="font-display war-loot">{report.loot}</b> gold · lost <b className="font-display">{report.lost}</b> troops · {report.destruction}% destroyed</p>
            <p className="war-round">{report.rounds[report.rounds.length - 1]?.text}</p>
          </div>
        ) : pv ? (
          <div className="war-preview">
            <p>Expected: <b className="font-display">{pv.stars}★</b> · loot up to <b className="font-display">{pv.loot}</b> · losses about <b className="font-display">{pv.lost}</b></p>
            <p className="war-odds">Your force {pv.force} against their defense {pv.effDefense}</p>
          </div>
        ) : null}
      </div>

      <div className="war-actions">
        <button type="button" className="war-btn" data-magnetic onClick={raid} disabled={busy}>{busy ? 'Marching…' : report ? 'Raid again' : 'Raid'}</button>
        <span className="war-note">Simulated rivals. In the game they raid you back.</span>
      </div>
    </div>
  );
}
