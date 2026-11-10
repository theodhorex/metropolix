'use client';

import { useEffect, useRef, useState } from 'react';
import { BUILDINGS, BUILDING_KINDS, CATEGORIES, RESOURCES, arcDef, levelFromXp, type BuildingKind, type Category, type GameState, type GoodKind } from '@metropolix/sim';
import CubeIcon from './CubeIcon';
import Icon, { type IconName } from './Icon';
import { CloseX, SECTOR_COLOR } from './ui';

interface Props {
  open: boolean;
  s: GameState;
  tool: BuildingKind | 'demolish' | 'pack' | 'select';
  onSelect: (k: BuildingKind) => void;
  onClose: () => void;
  preview?: (k: BuildingKind) => string | null;
}

/** What a building does, as short icon lines. */
function effects(k: BuildingKind, good: GoodKind | null): { icon: IconName; text: string; bad?: boolean }[] {
  const b = BUILDINGS[k];
  const out: { icon: IconName; text: string; bad?: boolean }[] = [];
  if (b.housing) out.push({ icon: 'people', text: `Houses ${b.housing}` });
  if (b.jobs) out.push({ icon: 'hammer', text: `${b.jobs} jobs` });
  if (b.edu) out.push({ icon: 'book', text: `${b.edu} school seats` });
  if (b.troopCap) out.push({ icon: 'swords', text: `${b.troopCap} troop beds` });
  if (b.defense) out.push({ icon: 'shield', text: `+${b.defense} defense` });
  if (b.wood) out.push({ icon: 'wood', text: 'Makes wood' });
  if (b.ore) out.push({ icon: 'ore', text: 'Makes ore' });
  if (b.food) out.push({ icon: 'food', text: `Feeds ${b.food * 20} citizens` });
  if (b.goods) out.push({ icon: good ?? 'box', text: good ? `Makes ${RESOURCES[good].name}` : 'Makes your special good' });
  if (b.happy) out.push({ icon: 'smile', text: `+${b.happy} happiness` });
  if (b.pollution) out.push({ icon: 'flame', text: `${b.pollution} smoke`, bad: true });
  if (b.upkeep) out.push({ icon: 'coin', text: `${b.upkeep}/s upkeep`, bad: true });
  return out.slice(0, 3);
}

export default function Shop({ open, s, tool, onSelect, onClose, preview }: Props) {
  const [cat, setCat] = useState<Category>('residential');
  const strip = useRef<HTMLDivElement>(null);
  const groups = useRef<Partial<Record<Category, HTMLElement | null>>>({});
  const level = levelFromXp(s.xp);
  const arc = arcDef(s.arc);
  // Keep the cards out of the DOM while the shop is closed (they re-render every game tick);
  // unmount only after the slide-out finishes so the closing animation still shows them.
  const [live, setLive] = useState(open);
  if (open && !live) setLive(true);
  useEffect(() => {
    if (open) return;
    const t = setTimeout(() => setLive(false), 320);
    return () => clearTimeout(t);
  }, [open]);

  const jump = (c: Category) => {
    setCat(c);
    const el = groups.current[c], sc = strip.current;
    if (!el || !sc) return;
    const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    sc.scrollTo({ left: el.offsetLeft - 8, behavior: smooth ? 'smooth' : 'auto' });
  };
  const onScroll = () => {
    const sc = strip.current; if (!sc) return;
    let now: Category = CATEGORIES[0]!.id;
    for (const c of CATEGORIES) { const el = groups.current[c.id]; if (el && el.offsetLeft - 8 <= sc.scrollLeft + 60) now = c.id; }
    if (sc.scrollLeft + sc.clientWidth >= sc.scrollWidth - 4) now = CATEGORIES[CATEGORIES.length - 1]!.id;
    if (now !== cat) setCat(now);
  };

  return (
    <div className={`window absolute inset-x-2 bottom-2 z-20 !p-0 transition-transform duration-300 ${open ? 'translate-y-0' : 'pointer-events-none translate-y-[120%]'}`}
      aria-hidden={!open} inert={!open} role="region" aria-label="Shop">
      {live && <>
      <div className="flex items-center gap-2 border-b-2 border-[var(--ink)] bg-[var(--slab-hi)] px-2 py-1.5">
        <h2 className="font-display flex shrink-0 items-center gap-1.5 pr-2 text-lg font-bold"><Icon name="bag" size={22} /> Shop</h2>
        <nav className="flex min-w-0 flex-1 gap-1 overflow-x-auto" aria-label="Jump to a category">
          {CATEGORIES.map((c) => (
            <button key={c.id} onClick={() => jump(c.id)} aria-current={cat === c.id ? 'true' : undefined}
              className={`flex shrink-0 items-center gap-1.5 border-2 px-2.5 py-1 text-sm font-bold whitespace-nowrap ${cat === c.id ? 'border-[var(--ink)] bg-[var(--slab)] text-[var(--paper)]' : 'border-transparent text-[var(--paper-dim)] hover:text-[var(--paper)]'}`}>
              <span aria-hidden className="inline-block h-2.5 w-2.5 border border-[var(--ink)]" style={{ background: SECTOR_COLOR[c.id] }} />{c.name}
            </button>
          ))}
        </nav>
        <span className="hidden shrink-0 items-center gap-3 px-2 text-sm tabular-nums lg:flex" aria-label="What you can spend">
          <span className="flex items-center gap-1"><Icon name="coin" size={16} />{s.gold}</span>
          <span className="flex items-center gap-1"><Icon name="wood" size={16} />{s.wood}</span>
          <span className="flex items-center gap-1"><Icon name="ore" size={16} />{s.ore}</span>
        </span>
        <CloseX onClick={onClose} label="Close shop" />
      </div>

      <div ref={strip} onScroll={onScroll} onWheel={(e) => { if (strip.current && Math.abs(e.deltaY) > Math.abs(e.deltaX)) strip.current.scrollLeft += e.deltaY; }}
        className="relative flex gap-5 overflow-x-auto px-3 pt-2 pb-3">
        {CATEGORIES.map((c) => {
          const items = BUILDING_KINDS.filter((k) => BUILDINGS[k].category === c.id);
          if (items.length === 0) return null;
          return (
            <section key={c.id} ref={(el) => { groups.current[c.id] = el; }} aria-label={c.name} className="shrink-0">
              <h3 className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-[var(--paper-dim)]">
                <span aria-hidden className="inline-block h-2 w-5" style={{ background: SECTOR_COLOR[c.id] }} />{c.name}
              </h3>
              <div className="flex gap-2">
                {items.map((k) => {
                  const b = BUILDINGS[k];
                  const locked = level < b.unlockLevel;
                  const stock = s.inventory[k] ?? 0;
                  const noLand = (k === 'lumber' && arc?.woodPm === 0) || (k === 'mine' && arc?.orePm === 0);
                  const lackGold = s.gold < b.cost, lackWood = s.wood < (b.woodCost ?? 0), lackOre = s.ore < (b.oreCost ?? 0);
                  const blocked = locked || noLand;
                  const img = open ? preview?.(k) : null;
                  const sel = tool === k;
                  return (
                    <button key={k} disabled={blocked} onClick={() => onSelect(k)} aria-pressed={sel}
                      title={b.desc}
                      className={`card flex w-36 shrink-0 flex-col text-left ${sel ? 'card-on' : ''}`}>
                      <span className="relative flex h-[76px] items-end justify-center overflow-hidden border-b-2 border-[var(--ink)] bg-[var(--slab-lo)]">
                        {img
                          // eslint-disable-next-line @next/next/no-img-element
                          ? <img src={img} alt="" width={76} height={76} className={blocked ? 'opacity-40 grayscale' : ''} style={{ imageRendering: 'pixelated' }} />
                          : <span className="self-center"><CubeIcon color={b.color} height={b.height} size={48} /></span>}
                        {stock > 0 && <span className="absolute top-1 right-1 border-2 border-[var(--ink)] bg-[var(--good)] px-1 text-[11px] font-bold text-[#0d2106]">x{stock}</span>}
                      </span>
                      <span className="flex flex-1 flex-col px-2 pt-1.5 pb-2">
                        <span className="font-display text-[15px] leading-tight font-bold">{b.name}</span>
                        <span className="mt-1 mb-1.5 min-h-[42px] flex-1 space-y-0.5 text-[11px] leading-tight">
                          {effects(k, arc?.good ?? null).map((e) => (
                            <span key={e.text} className={`flex items-center gap-1 ${e.bad ? 'text-[var(--bad)]' : 'text-[var(--paper-dim)]'}`}><Icon name={e.icon} size={11} />{e.text}</span>
                          ))}
                        </span>
                        {noLand ? (
                          <span className="text-xs font-bold text-[var(--bad)]">No {k === 'lumber' ? 'forest' : 'ore'} on your land</span>
                        ) : locked ? (
                          <span className="flex items-center gap-1 text-xs font-bold text-[var(--paper-dim)]"><Icon name="star" size={12} />Unlocks at level {b.unlockLevel}</span>
                        ) : stock > 0 ? (
                          <span className="text-xs font-bold text-[var(--good)]">Free from storage</span>
                        ) : (
                          <span className="flex flex-wrap items-center gap-x-2 text-sm font-bold tabular-nums">
                            <span className={`flex items-center gap-0.5 ${lackGold ? 'text-[var(--bad)]' : 'text-[var(--gold)]'}`}><Icon name="coin" size={13} />{b.cost}</span>
                            {b.woodCost ? <span className={`flex items-center gap-0.5 ${lackWood ? 'text-[var(--bad)]' : ''}`}><Icon name="wood" size={13} />{b.woodCost}</span> : null}
                            {b.oreCost ? <span className={`flex items-center gap-0.5 ${lackOre ? 'text-[var(--bad)]' : ''}`}><Icon name="ore" size={13} />{b.oreCost}</span> : null}
                            {(Object.entries(b.goodsCost ?? {}) as [GoodKind, number][]).map(([g, n]) => (
                              <span key={g} className={`flex items-center gap-0.5 ${s.goods[g] < n ? 'text-[var(--bad)]' : ''}`} title={`${n} ${RESOURCES[g].name}`}><Icon name={g} size={13} />{n}</span>
                            ))}
                          </span>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
      </>}
    </div>
  );
}
