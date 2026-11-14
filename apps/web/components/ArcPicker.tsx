'use client';

import { useEffect, useState } from 'react';
import { ARCS, BUILDINGS, BUILDING_KINDS, GOOD_KINDS, RESOURCES, type ArcDef, type ArcId, type GoodKind } from '@metropolix/sim';
import ArcPortrait from './ArcPortrait';
import Icon, { type IconName } from './Icon';

import { SPECIES, SPECIES_COUNT } from '@/lib/citizens';
import { CitizenImg } from './CitizenImg';

/** Land richness as a row of pixel icons: one icon = 20%, up to 200%. Half icons are dimmed. */
function Pips({ icon, pm, label }: { icon: IconName; pm: number; label: string }) {
  const units = pm / 200; // 0..10
  return (
    <div className="flex items-center gap-3">
      <span className="w-14 shrink-0 text-sm text-[var(--paper-dim)]">{label}</span>
      <span className="flex flex-1 gap-0.5" role="img" aria-label={`${label} ${Math.round(pm / 10)}%`}>
        {Array.from({ length: 10 }, (_, i) => {
          const fill = Math.max(0, Math.min(1, units - i));
          return <span key={i} style={{ opacity: fill === 0 ? 0.16 : fill < 1 ? 0.55 : 1, filter: fill === 0 ? 'grayscale(1)' : undefined }}><Icon name={icon} size={24} /></span>;
        })}
      </span>
      <span className={`w-14 text-right text-base font-bold tabular-nums ${pm === 0 ? 'text-[var(--bad)]' : ''}`}>{pm === 0 ? 'none' : `${Math.round(pm / 10)}%`}</span>
    </div>
  );
}

/** Five-axis radar: the dashed ring is an average people, the filled shape is this people. */
function Radar({ arc }: { arc: ArcDef }) {
  const axes = [
    { label: 'Attack', pm: arc.mods.attackPm, invert: false },
    { label: 'Loot', pm: arc.mods.lootPm, invert: false },
    { label: 'Cheap army', pm: arc.mods.troopCostPm, invert: true },
    { label: 'Economy', pm: arc.mods.econPm, invert: false },
    { label: 'Defense', pm: arc.mods.defensePm, invert: false },
  ];
  const C = { x: 150, y: 118 }, R = 86;
  const pt = (i: number, r: number) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / axes.length;
    return { x: C.x + Math.cos(a) * R * r, y: C.y + Math.sin(a) * R * r, a };
  };
  const radius = (ax: (typeof axes)[number]) => {
    const delta = (ax.pm - 1000) / 10 * (ax.invert ? -1 : 1);
    return Math.max(0.14, Math.min(1, 0.55 + delta * 0.012));
  };
  const poly = (f: (i: number) => number) => axes.map((_, i) => { const p = pt(i, f(i)); return `${p.x.toFixed(1)},${p.y.toFixed(1)}`; }).join(' ');
  return (
    <svg viewBox="0 0 300 236" className="mx-auto w-full max-w-[420px]" role="img" aria-label={`Strength profile of the ${arc.name}`}>
      {[1, 0.55, 0.25].map((r) => <polygon key={r} points={poly(() => r)} fill="none" stroke={r === 0.55 ? '#6b7690' : '#2e384c'} strokeWidth={r === 0.55 ? 1.5 : 1} strokeDasharray={r === 0.55 ? '4 3' : undefined} />)}
      {axes.map((_, i) => { const p = pt(i, 1); return <line key={i} x1={C.x} y1={C.y} x2={p.x} y2={p.y} stroke="#2e384c" />; })}
      <polygon points={poly((i) => radius(axes[i]!))} fill="var(--accent)" fillOpacity={0.32} stroke="var(--accent)" strokeWidth={2.5} strokeLinejoin="miter" />
      {axes.map((ax, i) => {
        const v = pt(i, radius(ax));
        const l = pt(i, 1.2);
        const delta = Math.round((ax.pm - 1000) / 10);
        const good = ax.invert ? delta < 0 : delta > 0;
        const color = delta === 0 ? 'var(--paper-dim)' : good ? 'var(--good)' : 'var(--bad)';
        const anchor = Math.abs(Math.cos(l.a)) < 0.25 ? 'middle' : Math.cos(l.a) > 0 ? 'start' : 'end';
        return (
          <g key={ax.label}>
            <rect x={v.x - 3.5} y={v.y - 3.5} width={7} height={7} fill="var(--accent)" stroke="#12151d" strokeWidth={1.5} />
            <text x={l.x} y={l.y - 2} textAnchor={anchor} fontSize={12.5} fill="var(--paper)" fontWeight={700}>{ax.label}</text>
            <text x={l.x} y={l.y + 12} textAnchor={anchor} fontSize={12.5} fill={color} fontWeight={700}>{delta > 0 ? '+' : ''}{delta}%</text>
          </g>
        );
      })}
    </svg>
  );
}

const BACKDROP: Record<ArcId, string> = {
  elf: 'radial-gradient(ellipse at 30% 20%, #1d5a34 0%, #0a1a12 60%, #070b10 100%)',
  lizard: 'radial-gradient(ellipse at 30% 20%, #8a4a22 0%, #1b1410 60%, #070b10 100%)',
  caveman: 'radial-gradient(ellipse at 30% 20%, #6a4524 0%, #1a120d 60%, #070b10 100%)',
  dragon: 'radial-gradient(ellipse at 30% 20%, #7a1a14 0%, #190808 60%, #070b10 100%)',
  goblin: 'radial-gradient(ellipse at 30% 20%, #3f5a1c 0%, #101608 60%, #070b10 100%)',
};
const INK: Record<ArcId, string> = { elf: '#0c1f12', lizard: '#2a1a05', caveman: '#2a1505', dragon: '#2a0b08', goblin: '#1a2205' };

function PeopleGallery({ arc }: { arc: ArcId }) {
  return (
    <ul className="grid grid-cols-3 gap-2 sm:grid-cols-6">
      {Array.from({ length: SPECIES_COUNT }, (_, v) => (
        <li key={v} className="well flex flex-col items-center px-1 pt-2 pb-1 text-center">
          <CitizenImg arc={arc} v={v} width={64} height={96} />
          <span className="text-[11px] leading-tight">{SPECIES[arc][v]!.name}</span>
        </li>
      ))}
    </ul>
  );
}

export default function ArcPicker({ onChoose }: { onChoose: (id: ArcId) => void }) {
  const [idx, setIdx] = useState(3); // open on the dragon to show off the art
  const [confirm, setConfirm] = useState(false);
  const arc: ArcDef = ARCS[idx]!;

  const go = (i: number) => { setIdx((i + ARCS.length) % ARCS.length); setConfirm(false); };
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') go(idx + 1);
      else if (e.key === 'ArrowLeft') go(idx - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto transition-[background] duration-500" style={{ background: BACKDROP[arc.id], ['--accent' as string]: arc.accent, ['--accent-ink' as string]: INK[arc.id] }}
      role="dialog" aria-modal="true" aria-label="Choose your people">
      <div className="mx-auto flex min-h-full w-full max-w-6xl flex-col px-4 py-5">
        <header>
          <h2 className="font-display text-3xl font-bold text-[var(--paper)] sm:text-4xl">Choose your people</h2>
          <p className="mt-1 text-sm text-[var(--paper-dim)]">You get one city, and this choice cannot be changed.</p>
        </header>

        <div className="mt-4 grid flex-1 grid-cols-1 gap-5 md:grid-cols-[minmax(260px,380px)_1fr]">
          <div key={arc.id} className="arc-in panel relative mx-auto aspect-[6/7] w-full max-w-[380px] self-start overflow-hidden !border-[var(--accent)]">
            <ArcPortrait arc={arc.id} className="h-full w-full" />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent px-4 pt-10 pb-3">
              <div className="font-display text-3xl font-bold" style={{ color: arc.accent }}>{arc.name}</div>
              <div className="text-sm text-[var(--paper)]">{arc.tagline}</div>
            </div>
            <button onClick={() => go(idx - 1)} aria-label="Previous people" className="btn btn-quiet absolute top-1/2 left-2 h-9 w-9 -translate-y-1/2 !p-0 text-xl">‹</button>
            <button onClick={() => go(idx + 1)} aria-label="Next people" className="btn btn-quiet absolute top-1/2 right-2 h-9 w-9 -translate-y-1/2 !p-0 text-xl">›</button>
          </div>

          <div key={`d-${arc.id}`} className="arc-in panel flex flex-col gap-5 p-4 sm:p-5">
            <section>
              <h3 className="font-display mb-2 text-xl font-bold">Your land</h3>
              <div className="space-y-2">
                <Pips icon="wood" pm={arc.woodPm} label="Forests" />
                <Pips icon="ore" pm={arc.orePm} label="Mines" />
              </div>
              {arc.woodPm === 0 && <p className="mt-2 text-sm text-[var(--bad)]">There are no forests. Every plank has to be bought from other players.</p>}
              <p className="mt-1.5 text-xs text-[var(--paper-dim)]">Each icon is 20% of a standard land. More icons mean faster wood and ore.</p>
            </section>

            <div className="grid gap-5 md:grid-cols-[1.15fr_1fr]">
              <section>
                <h3 className="font-display mb-1 text-xl font-bold">Strength profile</h3>
                <Radar arc={arc} />
                <p className="text-center text-xs text-[var(--paper-dim)]">Dashed ring: an average people. Further out is better.</p>
              </section>
              <div className="flex flex-col gap-3">
                <Card title="Strengths" color="var(--good)" items={arc.strengths} />
                <Card title="What is unique" color="var(--gold)" items={[arc.unique, `Soldiers: ${arc.troop}s`]} />
                <Card title="Weaknesses" color="var(--bad)" items={arc.weaknesses} />
              </div>
            </div>

            <TradeGood arc={arc} />

            <section>
              <h3 className="font-display mb-2 text-xl font-bold">Who lives here</h3>
              <PeopleGallery arc={arc.id} />
            </section>
          </div>
        </div>

        <footer className="mt-5 flex flex-col items-center gap-3">
          <div className="flex gap-3" role="tablist" aria-label="Peoples">
            {ARCS.map((a, i) => (
              <button key={a.id} role="tab" aria-selected={i === idx} onClick={() => go(i)} aria-label={a.name}
                className={`h-16 w-16 overflow-hidden border-2 border-[var(--ink)] transition sm:h-20 sm:w-20 ${i === idx ? '-translate-y-1 shadow-[0_4px_0_var(--ink)]' : 'opacity-60 hover:opacity-100'}`}
                style={{ outline: i === idx ? `3px solid ${a.accent}` : 'none', outlineOffset: -3 }}>
                <ArcPortrait arc={a.id} className="h-full w-full scale-150 object-cover" />
              </button>
            ))}
          </div>
          {!confirm ? (
            <button onClick={() => setConfirm(true)} className="btn btn-accent px-8 py-2.5 text-lg">Choose the {arc.name}</button>
          ) : (
            <div className="flex flex-wrap items-center justify-center gap-3">
              <span className="text-sm">Settle as the <b style={{ color: arc.accent }}>{arc.name}</b> for good?</span>
              <button onClick={() => onChoose(arc.id)} className="btn btn-good px-6 py-2">Yes, found my city</button>
              <button onClick={() => setConfirm(false)} className="btn btn-quiet px-4 py-2">Go back</button>
            </div>
          )}
        </footer>
      </div>
    </div>
  );
}

function Card({ title, color, items }: { title: string; color: string; items: string[] }) {
  return (
    <div className="well p-3">
      <div className="font-display mb-1 text-base font-bold" style={{ color }}>{title}</div>
      <ul className="space-y-1 text-sm">{items.map((t) => <li key={t} className="flex gap-1.5"><span style={{ color }}>-</span><span>{t}</span></li>)}</ul>
    </div>
  );
}

/** Buildings that spend a given good, by name (from the sim's build costs). */
const usedBy = (g: GoodKind) => BUILDING_KINDS.filter((k) => (BUILDINGS[k].goodsCost?.[g] ?? 0) > 0).map((k) => BUILDINGS[k].name);

/** The good this people makes, who needs it, and the goods they must trade for. */
function TradeGood({ arc }: { arc: ArcDef }) {
  const own = arc.good;
  const buy = GOOD_KINDS.filter((g) => g !== own);
  return (
    <section className="well flex flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center border-2 border-[var(--ink)] bg-[var(--slab)]"><Icon name={own} size={34} /></span>
        <div className="min-w-0">
          <h3 className="font-display text-lg leading-tight font-bold">Your trade good: {RESOURCES[own].name}</h3>
          <p className="text-sm text-[var(--paper-dim)]">Only your Workshops and Craft Halls make it. Every city needs it to build {usedBy(own).map((n) => `${/^([AEIO]|U(?!ni))/.test(n) ? 'an' : 'a'} ${n}`).join(' or ')}, so it sells well.</p>
        </div>
      </div>
      <div className="text-sm">
        <span className="mb-1 block text-[var(--paper-dim)]">You buy the rest from other peoples:</span>
        <span className="flex flex-wrap gap-x-3 gap-y-1">
          {buy.map((g) => (
            <span key={g} className="flex items-center gap-1" title={`Needed for: ${usedBy(g).join(', ')}`}><Icon name={g} size={16} /><b>{RESOURCES[g].name}</b></span>
          ))}
        </span>
      </div>
    </section>
  );
}
