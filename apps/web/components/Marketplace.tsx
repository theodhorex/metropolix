'use client';

import { useState } from 'react';
import * as sim from '@metropolix/sim';
import Icon from './Icon';
import { ItemThumb, RaceTag, type Preview } from './ItemThumb';
import { Modal, SubHead, type TabDef } from './ui';

type TabId = 'post' | 'offers' | 'wanted' | 'mine';
const TABS: TabDef<TabId>[] = [
  { id: 'post', label: 'Trading post', icon: 'scale' },
  { id: 'offers', label: 'City offers', icon: 'bag' },
  { id: 'wanted', label: 'Wanted', icon: 'scroll' },
  { id: 'mine', label: 'My trades', icon: 'box' },
];
type Filter = 'all' | 'goods' | 'materials' | 'buildings' | 'relics';
const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All' }, { id: 'goods', label: 'Special goods' }, { id: 'materials', label: 'Materials' }, { id: 'buildings', label: 'Buildings' }, { id: 'relics', label: 'Treasures' },
];
const MATERIALS: sim.ResourceKind[] = ['wood', 'ore', 'food'];

interface Props { open: boolean; s: sim.GameState | null; act: (r?: sim.Result) => void; onClose: () => void; preview?: Preview; onPackUp: () => void }

const matches = (k: sim.ItemKind, f: Filter) =>
  f === 'all' || (f === 'goods' ? sim.isGood(k) : f === 'materials' ? sim.isResource(k) && !sim.isGood(k) : f === 'relics' ? sim.isRelic(k) : sim.isBuilding(k));

/** Price against the fair shop price, in words. */
function Deal({ price, k, selling = false }: { price: number; k: sim.ItemKind; selling?: boolean }) {
  const pct = Math.round(((price - sim.fairPrice(k)) * 100) / sim.fairPrice(k));
  if (pct === 0) return <span className="text-[var(--paper-dim)]">fair price</span>;
  const good = selling ? pct > 0 : pct < 0;
  return <span className={good ? 'text-[var(--good)]' : 'text-[var(--bad)]'}>{Math.abs(pct)}% {pct < 0 ? 'below' : 'above'} fair</span>;
}

function Gold({ n, className = '' }: { n: number; className?: string }) {
  return <span className={`inline-flex items-center gap-0.5 font-bold tabular-nums ${className}`}><Icon name="coin" size={13} />{n}</span>;
}

/** What a special good is for, from the buildings that need it. */
function usedBy(g: sim.GoodKind): string[] {
  return sim.BUILDING_KINDS.filter((k) => (sim.BUILDINGS[k].goodsCost?.[g] ?? 0) > 0).map((k) => sim.BUILDINGS[k].name);
}

export default function Marketplace({ open, s, act, onClose, preview, onPackUp }: Props) {
  const [tab, setTab] = useState<TabId>('post');
  const [filter, setFilter] = useState<Filter>('all');
  const [msg, setMsg] = useState<string | null>(null);
  if (!open || !s) return null;

  const mine = sim.arcDef(s.arc);
  const level = sim.levelFromXp(s.xp);
  const run = (r: sim.Result) => { setMsg(r.ok ? null : r.msg); act(r); };

  return (
    <Modal title="Marketplace" icon="scale" onClose={onClose} tabs={TABS} tab={tab} onTab={(t) => { setTab(t); setMsg(null); }} width="max-w-5xl" tall
      headerRight={
        <span className="hidden items-center gap-3 text-sm tabular-nums md:flex" aria-label="Your stock">
          <Gold n={s.gold} className="text-[var(--gold)]" />
          <span className="flex items-center gap-1"><Icon name="wood" size={15} />{s.wood}</span>
          <span className="flex items-center gap-1"><Icon name="ore" size={15} />{s.ore}</span>
          <span className="flex items-center gap-1"><Icon name="food" size={15} />{s.food}</span>
        </span>
      }>
      {msg && <p role="alert" className="well mb-3 px-3 py-1.5 text-sm text-[var(--bad)]">{msg}</p>}
      {tab === 'post' && <Post s={s} run={run} mine={mine} />}
      {tab === 'offers' && <Offers s={s} run={run} filter={filter} setFilter={setFilter} preview={preview} level={level} />}
      {tab === 'wanted' && <Wanted s={s} run={run} filter={filter} setFilter={setFilter} preview={preview} />}
      {tab === 'mine' && <Mine s={s} run={run} preview={preview} onPackUp={onPackUp} />}
    </Modal>
  );
}

/* ---------- Trading post: instant, but dear to buy and cheap to sell ---------- */
function Post({ s, run, mine }: { s: sim.GameState; run: (r: sim.Result) => void; mine: sim.ArcDef | null }) {
  const row = (k: sim.ResourceKind) => {
    const buy = sim.postBuyPrice(k), sell = sim.postSellPrice(k), have = sim.stockOf(s, k), left = s.post[k] ?? 0;
    const good = sim.isGood(k) ? k : null;
    const maker = good ? sim.goodMaker(good) : null;
    return (
      <li key={k} className="well grid grid-cols-[auto_1fr] items-center gap-x-3 gap-y-2 px-3 py-2 md:grid-cols-[auto_minmax(0,1fr)_5rem_13rem_13rem]">
        <ItemThumb k={k} size={36} />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2"><b>{sim.itemName(k)}</b>{maker && (maker.id === mine?.id ? <span className="text-xs text-[var(--good)]">Your people make this</span> : <RaceTag arc={maker.id} />)}</div>
          <p className="text-xs text-[var(--paper-dim)]">{good ? `Needed for ${usedBy(good).join(', ')}.` : sim.RESOURCES[k].desc}</p>
        </div>
        <div className="text-sm tabular-nums md:text-right"><span className="text-[var(--paper-dim)] md:block md:text-xs">You have </span><b>{have}</b></div>
        <div className="col-span-2 flex items-center gap-2 md:col-span-1">
          <span className="w-16 text-right text-sm"><Gold n={buy} /><span className="block text-[11px] text-[var(--paper-dim)] tabular-nums">{left} left</span></span>
          <button className="btn btn-gold !px-2 text-xs" disabled={left < 1 || s.gold < buy} onClick={() => run(sim.postBuy(s, k, 1))}>Buy 1</button>
          <button className="btn btn-gold !px-2 text-xs" disabled={left < 10 || s.gold < buy * 10} onClick={() => run(sim.postBuy(s, k, 10))}>Buy 10</button>
        </div>
        <div className="col-span-2 flex items-center gap-2 md:col-span-1">
          <span className="w-16 text-right text-sm"><Gold n={sell} /><span className="block text-[11px] text-[var(--paper-dim)]">each</span></span>
          <button className="btn btn-quiet !px-2 text-xs" disabled={have < 1} onClick={() => run(sim.postSell(s, k, 1))}>Sell 1</button>
          <button className="btn btn-quiet !px-2 text-xs" disabled={have < 10} onClick={() => run(sim.postSell(s, k, 10))}>Sell 10</button>
        </div>
      </li>
    );
  };
  return (
    <>
      <p className="mb-3 max-w-prose text-sm text-[var(--paper-dim)]">
        The trading post deals right away, at a cost: it charges {sim.POST_BUY_PM / 10}% of the fair price and pays only {sim.POST_SELL_PM / 10}%.
        Other cities usually sell cheaper under City offers.
      </p>
      <div className="hidden px-3 pb-1 text-xs text-[var(--paper-dim)] md:grid md:grid-cols-[36px_minmax(0,1fr)_5rem_13rem_13rem] md:gap-x-3">
        <span /><span>Item</span><span className="text-right">Stock</span><span className="pl-6">Buy from the post</span><span className="pl-6">Sell to the post</span>
      </div>
      <SubHead>Special goods</SubHead>
      <ul className="space-y-1.5">{sim.GOOD_KINDS.map(row)}</ul>
      <SubHead>Materials</SubHead>
      <ul className="space-y-1.5">{MATERIALS.map(row)}</ul>
    </>
  );
}

function FilterBar({ filter, setFilter, count }: { filter: Filter; setFilter: (f: Filter) => void; count: number }) {
  return (
    <div className="mb-3 flex flex-wrap items-center gap-3">
      <div className="seg" role="group" aria-label="Show">
        {FILTERS.map((f) => <button key={f.id} aria-pressed={filter === f.id} onClick={() => setFilter(f.id)}>{f.label}</button>)}
      </div>
      <span className="text-sm text-[var(--paper-dim)] tabular-nums">{count} shown</span>
    </div>
  );
}

/* ---------- Other cities selling ---------- */
function Offers({ s, run, filter, setFilter, preview, level }: { s: sim.GameState; run: (r: sim.Result) => void; filter: Filter; setFilter: (f: Filter) => void; preview?: Preview; level: number }) {
  const rows = s.market.filter((l) => l.seller !== sim.YOU && matches(l.kind, filter))
    .sort((a, b) => a.price / sim.fairPrice(a.kind) - b.price / sim.fairPrice(b.kind));
  return (
    <>
      <FilterBar filter={filter} setFilter={setFilter} count={rows.length} />
      {rows.length === 0 && <p className="text-sm text-[var(--paper-dim)]">Nothing for sale in this group right now. Cities post new offers every minute or so, or place an order under My trades.</p>}
      <ul className="space-y-1.5">
        {rows.map((l) => {
          const lockLv = sim.isBuilding(l.kind) ? sim.BUILDINGS[l.kind].unlockLevel : 0;
          const max = Math.min(l.qty, Math.floor(s.gold / l.price));
          return (
            <li key={l.id} className="well flex flex-wrap items-center gap-x-3 gap-y-1.5 px-3 py-2">
              <ItemThumb k={l.kind} size={40} preview={preview} />
              <div className="min-w-[10rem] flex-1">
                <div className="flex flex-wrap items-center gap-2"><b>{sim.itemName(l.kind)}</b><span className="text-sm text-[var(--paper-dim)] tabular-nums">x{l.qty}</span></div>
                <div className="flex flex-wrap items-center gap-1.5 text-xs text-[var(--paper-dim)]">from {l.seller} <RaceTag arc={l.arc} /></div>
              </div>
              <div className="w-32 text-right text-sm"><Gold n={l.price} className="text-[var(--gold)]" /> <span className="text-xs text-[var(--paper-dim)]">each</span><div className="text-xs"><Deal price={l.price} k={l.kind} /></div></div>
              {level < lockLv ? (
                <span className="w-40 text-right text-xs text-[var(--paper-dim)]">Unlocks at level {lockLv}</span>
              ) : (
                <div className="flex w-40 justify-end gap-1.5">
                  <button className="btn btn-gold !px-2 text-xs" disabled={max < 1} onClick={() => run(sim.buyListing(s, l.id, 1))}>Buy 1</button>
                  {l.qty > 1 && <button className="btn btn-gold !px-2 text-xs" disabled={max < 2} onClick={() => run(sim.buyListing(s, l.id, max))}>Buy {Math.max(2, max)}</button>}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </>
  );
}

/* ---------- Other cities buying ---------- */
function Wanted({ s, run, filter, setFilter, preview }: { s: sim.GameState; run: (r: sim.Result) => void; filter: Filter; setFilter: (f: Filter) => void; preview?: Preview }) {
  const rows = s.orders.filter((o) => o.buyer !== sim.YOU && matches(o.kind, filter))
    .sort((a, b) => b.price / sim.fairPrice(b.kind) - a.price / sim.fairPrice(a.kind));
  return (
    <>
      <p className="mb-3 max-w-prose text-sm text-[var(--paper-dim)]">Cities that lack something post what they will pay. Sell straight from your stock.</p>
      <FilterBar filter={filter} setFilter={setFilter} count={rows.length} />
      {rows.length === 0 && <p className="text-sm text-[var(--paper-dim)]">No requests in this group right now.</p>}
      <ul className="space-y-1.5">
        {rows.map((o) => {
          const have = sim.stockOf(s, o.kind), n = Math.min(have, o.qty);
          return (
            <li key={o.id} className="well flex flex-wrap items-center gap-x-3 gap-y-1.5 px-3 py-2">
              <ItemThumb k={o.kind} size={40} preview={preview} />
              <div className="min-w-[10rem] flex-1">
                <div className="flex flex-wrap items-center gap-1.5"><b>{o.buyer}</b><RaceTag arc={o.arc} /><span className="text-sm">wants <b className="tabular-nums">{o.qty}</b> {sim.itemName(o.kind)}</span></div>
                <div className="text-xs text-[var(--paper-dim)] tabular-nums">You have {have}</div>
              </div>
              <div className="w-32 text-right text-sm"><Gold n={o.price} className="text-[var(--gold)]" /> <span className="text-xs text-[var(--paper-dim)]">each</span><div className="text-xs"><Deal price={o.price} k={o.kind} selling /></div></div>
              <div className="flex w-40 justify-end">
                <button className="btn btn-good text-xs" disabled={n < 1} onClick={() => run(sim.fillOrder(s, o.id, n))}>{n < 1 ? 'None to sell' : `Sell ${n} for ${n * o.price}`}</button>
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}

/* ---------- Your listings and buy orders ---------- */
function Mine({ s, run, preview, onPackUp }: { s: sim.GameState; run: (r: sim.Result) => void; preview?: Preview; onPackUp: () => void }) {
  const stock = [...sim.RESOURCE_KINDS, ...sim.BUILDING_KINDS, ...sim.RELIC_KINDS].filter((k) => sim.stockOf(s, k) > 0);
  // what other cities can actually deliver: no wonders, no buildings your land cannot run, and only treasures you
  // have held (so the list never gives away how many exist) that are not too rare to ever be sold
  const all: sim.ItemKind[] = [...sim.GOOD_KINDS, ...MATERIALS, ...sim.tradeKindsFor(s),
    ...(s.seen ?? []).filter((k) => sim.isRelic(k) && sim.RELIC_FILL_PER10K[sim.RELICS[k].rarity] > 0)];
  const [sellK, setSellK] = useState<sim.ItemKind | ''>('');
  const [sellQ, setSellQ] = useState(1);
  const [sellP, setSellP] = useState(0);
  const [buyK, setBuyK] = useState<sim.ItemKind>('spice');
  const [buyQ, setBuyQ] = useState(5);
  const [buyP, setBuyP] = useState(sim.fairPrice('spice'));
  const sk = (sellK || stock[0]) as sim.ItemKind | undefined;
  // default ask: the most a buyer pays (fair price, but only 70% for a used building)
  const sp = sellP || (sk ? Math.floor((sim.fairPrice(sk) * Math.min(100, sim.buyerCapPct(sk))) / 100) : 0);
  const myList = s.market.filter((l) => l.seller === sim.YOU);
  const myOrders = s.orders.filter((o) => o.buyer === sim.YOU);
  const opt = (k: sim.ItemKind) => <option key={k} value={k}>{sim.itemName(k)}{sim.isBuilding(k) ? ' (building)' : sim.isRelic(k) ? ` (${sim.RARITY[sim.RELICS[k].rarity].name} treasure)` : ''}</option>;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <section className="panel p-3" aria-labelledby="sell-h">
        <h3 id="sell-h" className="font-display mb-2 text-lg font-bold">Sell from your stock</h3>
        {!sk ? (
          <p className="text-sm text-[var(--paper-dim)]">Your storehouse is empty. Make goods in a Workshop, or pack a building into storage to sell it.</p>
        ) : (
          <div className="space-y-2 text-sm">
            <label className="flex items-center gap-2"><span className="w-14 text-[var(--paper-dim)]">Item</span>
              <ItemThumb k={sk} size={28} preview={preview} />
              <select className="field flex-1" value={sk} onChange={(e) => { setSellK(e.target.value as sim.ItemKind); setSellP(0); setSellQ(1); }}>{stock.map(opt)}</select>
            </label>
            <label className="flex items-center gap-2"><span className="w-14 text-[var(--paper-dim)]">Amount</span>
              <input type="number" className="field w-24" min={1} max={sim.stockOf(s, sk)} value={sellQ} onChange={(e) => setSellQ(Math.max(1, Math.floor(+e.target.value)))} />
              <span className="text-[var(--paper-dim)] tabular-nums">of {sim.stockOf(s, sk)}</span>
            </label>
            <label className="flex items-center gap-2"><span className="w-14 text-[var(--paper-dim)]">Price</span>
              <input type="number" className="field w-24" min={1} value={sp} onChange={(e) => setSellP(Math.max(1, Math.floor(+e.target.value)))} />
              <span className="text-xs"><Deal price={sp} k={sk} selling /></span>
            </label>
            <div className="flex items-center justify-between pt-1">
              <span className="text-[var(--paper-dim)]">You get up to <Gold n={sellQ * sp} className="text-[var(--paper)]" /></span>
              <button className="btn btn-gold text-sm" onClick={() => run(sim.listForSale(s, sk, sellQ, sp))}>List for sale</button>
            </div>
          </div>
        )}
        <button className="btn btn-quiet mt-3 w-full text-sm" onClick={onPackUp}><Icon name="box" size={16} /> Pack a building from your city</button>
      </section>

      <section className="panel p-3" aria-labelledby="buy-h">
        <h3 id="buy-h" className="font-display mb-2 text-lg font-bold">Ask other cities for something</h3>
        <div className="space-y-2 text-sm">
          <label className="flex items-center gap-2"><span className="w-14 text-[var(--paper-dim)]">Item</span>
            <ItemThumb k={buyK} size={28} preview={preview} />
            <select className="field flex-1" value={buyK} onChange={(e) => { const k = e.target.value as sim.ItemKind; setBuyK(k); setBuyP(sim.fairPrice(k)); }}>{all.map(opt)}</select>
          </label>
          <label className="flex items-center gap-2"><span className="w-14 text-[var(--paper-dim)]">Amount</span>
            <input type="number" className="field w-24" min={1} value={buyQ} onChange={(e) => setBuyQ(Math.max(1, Math.floor(+e.target.value)))} />
          </label>
          <label className="flex items-center gap-2"><span className="w-14 text-[var(--paper-dim)]">Price</span>
            <input type="number" className="field w-24" min={1} value={buyP} onChange={(e) => setBuyP(Math.max(1, Math.floor(+e.target.value)))} />
            <span className="text-xs"><Deal price={buyP} k={buyK} /></span>
          </label>
          <div className="flex items-center justify-between pt-1">
            <span className="text-[var(--paper-dim)]">Holds <Gold n={buyQ * buyP} className="text-[var(--paper)]" /> until filled</span>
            <button className="btn btn-accent text-sm" disabled={s.gold < buyQ * buyP} onClick={() => run(sim.placeOrder(s, buyK, buyQ, buyP))}>Place order</button>
          </div>
          <p className="text-xs text-[var(--paper-dim)]">Orders at 90% of the fair price or more fill bit by bit. Lower offers wait forever.</p>
        </div>
      </section>

      <section className="lg:col-span-2">
        <SubHead right={`${myList.length + myOrders.length} open`}>Open trades</SubHead>
        {myList.length + myOrders.length === 0 && <p className="text-sm text-[var(--paper-dim)]">Nothing open. Anything you list or ask for shows up here.</p>}
        <ul className="space-y-1.5">
          {myList.map((l) => (
            <li key={`l${l.id}`} className="well flex flex-wrap items-center gap-3 px-3 py-2 text-sm">
              <ItemThumb k={l.kind} size={32} preview={preview} />
              <span className="flex-1"><b className="text-[var(--gold)]">Selling</b> {l.qty} {sim.itemName(l.kind)} at <Gold n={l.price} /> each</span>
              <button className="btn btn-quiet text-xs" onClick={() => run(sim.cancelListing(s, l.id))}>Take back</button>
            </li>
          ))}
          {myOrders.map((o) => (
            <li key={`o${o.id}`} className="well flex flex-wrap items-center gap-3 px-3 py-2 text-sm">
              <ItemThumb k={o.kind} size={32} preview={preview} />
              <span className="flex-1"><b className="text-[var(--accent)]">Buying</b> {o.qty} more {sim.itemName(o.kind)} at <Gold n={o.price} /> each</span>
              <button className="btn btn-quiet text-xs" onClick={() => run(sim.cancelOrder(s, o.id))}>Cancel, refund {o.qty * o.price}</button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
