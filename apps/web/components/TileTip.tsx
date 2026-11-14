'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import * as sim from '@metropolix/sim';
import Icon, { type IconName } from './Icon';
import { ItemThumb, type Preview } from './ItemThumb';
import { SECTOR_COLOR } from './ui';

type Tool = sim.BuildingKind | 'demolish' | 'pack' | 'select';

/**
 * Card that rides next to the cursor over the map. It answers the question the player has
 * at that moment: what is here, what will my tap do, and if it cannot, why not.
 */
export default function TileTip({ s, tile, tool, preview }: { s: sim.GameState; tile: { x: number; y: number }; tool: Tool; preview: Preview }) {
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const move = (e: PointerEvent) => {
      const el = box.current; if (!el) return;
      const w = el.offsetWidth, h = el.offsetHeight;
      const x = e.clientX + 18 + w > window.innerWidth ? e.clientX - w - 12 : e.clientX + 18;
      const y = e.clientY + 18 + h > window.innerHeight ? e.clientY - h - 12 : e.clientY + 18;
      el.style.transform = `translate(${x}px, ${y}px)`;
    };
    window.addEventListener('pointermove', move);
    return () => window.removeEventListener('pointermove', move);
  }, []);

  const here = s.grid[tile.y]?.[tile.x] ?? null;
  let body: ReactNode;

  if (here) {
    const b = sim.BUILDINGS[here];
    body = (
      <>
        <Head k={here} preview={preview} sub={sim.describeBuilding(here, sim.buildingLevel(s, tile.x, tile.y))} />
        {tool === 'demolish' && <Line tone="bad" icon="hammer">Tap to demolish, <Icon name="coin" size={12} /> {Math.floor(b.cost * 0.4)} back</Line>}
        {tool === 'pack' && <Line tone="good" icon="box">Tap to pack it into storage</Line>}
        {sim.canUpgrade(here) && <Line tone="dim" icon="star">Level {sim.buildingLevel(s, tile.x, tile.y)} of {sim.MAX_BLD_LEVEL}</Line>}
        {tool !== 'demolish' && tool !== 'pack' && <Line tone="good">Tap to open{sim.canUpgrade(here) ? ' and upgrade' : ''}</Line>}
      </>
    );
  } else if (tool === 'select') {
    return null; // nothing to say about bare ground when no building is picked
  } else if (tool === 'demolish' || tool === 'pack') {
    body = <Line tone="dim">Empty ground. Pick a building to {tool === 'pack' ? 'pack' : 'demolish'}.</Line>;
  } else {
    const b = sim.BUILDINGS[tool];
    const why = sim.buildBlocker(s, tile.x, tile.y, tool);
    const stock = s.inventory[tool] ?? 0;
    body = (
      <>
        <Head k={tool} preview={preview} sub={b.desc} />
        {stock > 0 ? (
          <Line tone="good" icon="box">From storage, {stock} left</Line>
        ) : (
          <div className="flex flex-wrap gap-x-2.5 gap-y-0.5 text-sm font-bold tabular-nums">
            <Cost icon="coin" need={b.cost} have={s.gold} />
            {sim.buildCost(s, tool).wood ? <Cost icon="wood" need={sim.buildCost(s, tool).wood} have={s.wood} /> : null}
            {sim.buildCost(s, tool).ore ? <Cost icon="ore" need={sim.buildCost(s, tool).ore} have={s.ore} /> : null}
            {(Object.entries(b.goodsCost ?? {}) as [sim.GoodKind, number][]).map(([g, n]) => <Cost key={g} icon={g} need={n} have={s.goods[g]} />)}
          </div>
        )}
        {why ? <Line tone="bad" icon="cross">{why}</Line> : <Line tone="good">Tap to build</Line>}
      </>
    );
  }

  return (
    <div ref={box} className="panel pointer-events-none fixed top-0 left-0 z-30 w-60 space-y-1 p-2 text-xs" style={{ transform: 'translate(-999px,-999px)' }} role="tooltip">
      {body}
    </div>
  );
}

function Head({ k, preview, sub }: { k: sim.BuildingKind; preview: Preview; sub: string }) {
  const b = sim.BUILDINGS[k];
  return (
    <div className="flex items-center gap-2">
      <span className="flex h-9 w-9 shrink-0 items-end justify-center overflow-hidden bg-[var(--slab-lo)]"><ItemThumb k={k} size={36} preview={preview} /></span>
      <span className="min-w-0">
        <b className="font-display block truncate text-sm">{b.name}</b>
        <span className="flex items-center gap-1 text-[var(--paper-dim)]">
          <span aria-hidden className="inline-block h-2 w-2 shrink-0 border border-[var(--ink)]" style={{ background: SECTOR_COLOR[b.category] }} />
          <span className="truncate">{sub}</span>
        </span>
      </span>
    </div>
  );
}

function Cost({ icon, need, have }: { icon: IconName; need: number; have: number }) {
  const short = have < need;
  return (
    <span className={`flex items-center gap-0.5 ${short ? 'text-[var(--bad)]' : ''}`} title={short ? `You have ${have}` : undefined}>
      <Icon name={icon} size={13} />{need.toLocaleString('en-US')}
    </span>
  );
}

function Line({ tone, icon, children }: { tone: 'good' | 'bad' | 'dim'; icon?: IconName; children: ReactNode }) {
  const c = tone === 'good' ? 'text-[var(--good)]' : tone === 'bad' ? 'text-[var(--bad)]' : 'text-[var(--paper-dim)]';
  return <p className={`flex items-center gap-1 font-bold ${c}`}>{icon && <Icon name={icon} size={12} />}<span>{children}</span></p>;
}
