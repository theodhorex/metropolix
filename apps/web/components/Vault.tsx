'use client';

import { useState } from 'react';
import * as sim from '@metropolix/sim';
import Icon from './Icon';
import { RelicThumb } from './ItemThumb';
import { Modal, SubHead, type TabDef } from './ui';
import RelicNfts, { mintRelicNft } from './RelicNfts';

type TabId = 'vault' | 'book';
const TABS: TabDef<TabId>[] = [
  { id: 'vault', label: 'Your treasures', icon: 'chest' },
  { id: 'book', label: 'Chronicle', icon: 'scroll' },
];

const pct = (pm: number) => `${pm > 0 ? '+' : ''}${pm / 10}%`;
const BONUS_LABEL: Record<keyof sim.RelicBonus, string> = {
  gold: 'gold income', ore: 'ore', wood: 'wood', food: 'food', attack: 'attack', defense: 'defense',
  happy: 'happiness', upkeep: 'upkeep', troopCost: 'troop cost',
};
/** "+25% ore, +10% defense" */
export function bonusText(b: sim.RelicBonus): string {
  return (Object.entries(b) as [keyof sim.RelicBonus, number][]).map(([k, v]) => `${pct(v)} ${BONUS_LABEL[k]}`).join(', ');
}

/** mine -> mines, library -> libraries, barracks -> barracks */
const plural = (w: string) => (w.endsWith('s') ? w : /[^aeiou]y$/.test(w) ? `${w.slice(0, -1)}ies` : `${w}s`);

function RarityTag({ k }: { k: sim.RelicKind }) {
  const r = sim.RARITY[sim.RELICS[k].rarity];
  return (
    <span className="inline-flex items-center gap-1 text-xs font-bold">
      <span aria-hidden className="inline-block h-2.5 w-2.5 border border-[var(--ink)]" style={{ background: r.color }} />{r.name}
    </span>
  );
}

interface Props { open: boolean; s: sim.GameState | null; account: string | null; act: (r?: sim.Result) => void; onClose: () => void }

export default function Vault({ open, s, account, act, onClose }: Props) {
  const [tab, setTab] = useState<TabId>('vault');
  const [msg, setMsg] = useState<string | null>(null);
  const [price, setPrice] = useState<Partial<Record<sim.RelicKind, number>>>({});
  const [minting, setMinting] = useState<sim.RelicKind | null>(null);
  const [nftKey, setNftKey] = useState(0);
  if (!open || !s) return null;

  const run = (r: sim.Result) => { setMsg(r.ok ? null : r.msg); act(r); };
  const mint = async (k: sim.RelicKind) => {
    if (!account) return;
    setMinting(k);
    const err = await mintRelicNft(s, account, k);
    setMinting(null);
    setMsg(err);
    act(undefined);
    setNftKey((n) => n + 1);
  };
  const owned = sim.RELIC_KINDS.filter((k) => (s.vault[k] ?? 0) > 0);
  const RANK: Record<sim.Rarity, number> = { mythic: 0, legendary: 1, epic: 2, rare: 3 };
  const chronicle = [...(s.seen ?? [])].sort((a, b) => RANK[sim.RELICS[a].rarity] - RANK[sim.RELICS[b].rarity] || sim.RELICS[a].name.localeCompare(sim.RELICS[b].name));
  const listed = s.market.filter((l) => l.seller === sim.YOU && sim.isRelic(l.kind));
  const total = sim.relicBonus(s);
  const totalText = bonusText(Object.fromEntries(Object.entries(total).filter(([, v]) => v !== 0)));
  const slots = Array.from({ length: sim.DISPLAY_SLOTS }, (_, i) => s.displayed[i] ?? null);
  const full = s.displayed.length >= sim.DISPLAY_SLOTS;

  return (
    <Modal title="Vault" icon="chest" onClose={onClose} tabs={TABS} tab={tab} onTab={(t) => { setTab(t); setMsg(null); }} width="max-w-4xl" tall
      headerRight={<span className="hidden text-sm text-[var(--paper-dim)] md:inline">{s.finds} dug up so far</span>}>
      {msg && <p role="alert" className="mb-3 font-bold text-[var(--bad)]">{msg}</p>}
      {tab === 'vault' ? (
        <>
          <SubHead right={<span className="text-xs text-[var(--paper-dim)]">{s.displayed.length} of {sim.DISPLAY_SLOTS} in use</span>}>On display</SubHead>
          <div className="mb-1 grid grid-cols-3 gap-3">
            {slots.map((k, i) => k ? (
              <div key={k} className="well pedestal flex flex-col items-center gap-1.5 border-t-4 p-3 text-center" style={{ borderTopColor: sim.RARITY[sim.RELICS[k].rarity].color }}>
                <RelicThumb k={k} size={56} />
                <b className="font-display leading-tight">{sim.RELICS[k].name}</b>
                <span className="text-xs text-[var(--good)]">{bonusText(sim.RELICS[k].bonus)}</span>
                <button className="btn btn-quiet mt-auto px-2 py-1 text-xs" onClick={() => run(sim.storeRelic(s, k))}>Put back in vault</button>
              </div>
            ) : (
              <div key={`empty-${i}`} className="pedestal flex flex-col items-center justify-center gap-1 border-2 border-dashed border-[var(--slab-hi)] p-3 text-center text-xs text-[var(--paper-dim)]">
                <span className="h-14 w-14 border-2 border-dashed border-[var(--slab-hi)]" aria-hidden />
                Empty pedestal
              </div>
            ))}
          </div>
          <p className="mb-4 text-sm text-[var(--paper-dim)]">
            {totalText ? <>Your city gets <b className="text-[var(--good)]">{totalText}</b> from the treasures on display.</> : 'A treasure on display gives your whole city a lasting bonus.'}
          </p>

          <SubHead>In the vault</SubHead>
          {owned.length === 0 ? (
            <div className="well flex items-center gap-3 p-4 text-sm">
              <Icon name="chest" size={40} />
              <p className="text-[var(--paper-dim)]">
                Nothing yet. Treasure turns up now and then where your people dig, cut, plant and forge, and the busier your city, the better your luck.
                Traders on the Market sometimes carry one too.
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {owned.map((k) => {
                const r = sim.RELICS[k];
                const crown = Math.floor((r.price * sim.CROWN_PM) / 1000);
                const ask = price[k] ?? Math.round(sim.fairPrice(k) * 1.2);
                return (
                  <li key={k} className="well flex flex-wrap items-center gap-3 p-2.5">
                    <RelicThumb k={k} size={48} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline gap-x-2">
                        <b className="font-display text-base">{r.name}</b>
                        {s.vault[k] > 1 && <span className="text-sm tabular-nums text-[var(--paper-dim)]">x{s.vault[k]}</span>}
                        <RarityTag k={k} />
                      </div>
                      <p className="text-xs text-[var(--paper-dim)]">{r.desc}</p>
                      <p className="text-xs text-[var(--good)]">On display: {bonusText(r.bonus)}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <button className="btn btn-gold w-20 py-1 text-sm" disabled={full || s.displayed.includes(k)} onClick={() => run(sim.displayRelic(s, k))}
                        title={s.displayed.includes(k) ? 'One of these is already on display' : full ? 'Every pedestal is taken. Put one back first.' : undefined}>
                        Display
                      </button>
                      <button className="btn btn-quiet w-44 justify-between px-2.5 py-1 text-sm" onClick={() => run(sim.sellToCrown(s, k))}>
                        Sell to crown <span className="inline-flex items-center gap-0.5 tabular-nums"><Icon name="coin" size={12} />{crown.toLocaleString('en-US')}</span>
                      </button>
                      <span className="flex items-center gap-1">
                        <label className="sr-only" htmlFor={`ask-${k}`}>Market price for {r.name}</label>
                        <input id={`ask-${k}`} type="number" min={1} max={sim.fairPrice(k) * 10} value={ask}
                          onChange={(e) => setPrice({ ...price, [k]: Math.max(1, Math.floor(Number(e.target.value) || 0)) })}
                          className="field w-24 px-1.5 py-1 text-sm tabular-nums" />
                        <button className="btn btn-quiet w-32 py-1 text-sm" onClick={() => run(sim.listForSale(s, k, 1, ask))}>List on market</button>
                      </span>
                      <button className="btn btn-quiet w-24 py-1 text-sm" disabled={!account || !!minting}
                        title={account ? 'Mint one as an NFT on NEAR testnet' : 'Connect a NEAR wallet first'} onClick={() => void mint(k)}>
                        {minting === k ? 'Minting...' : 'Mint NFT'}
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
          {listed.length > 0 && (
            <p className="mt-3 text-sm text-[var(--paper-dim)]">
              On the market: {listed.map((l) => `${sim.itemName(l.kind)} at ${l.price.toLocaleString('en-US')}g`).join(', ')}. Cancel a listing from My trades in the Market.
            </p>
          )}
          <RelicNfts s={s} account={account} act={act} refreshKey={nftKey} onMsg={setMsg} />
          <p className="mt-4 text-xs text-[var(--paper-dim)]">
            The crown buys any treasure on the spot for {sim.CROWN_PM / 10}% of its worth. Other cities pay more, but a rare buyer can take a long time to show up.
          </p>
        </>
      ) : (
        <>
          <section className="lore mb-4 p-4">
            <h3 className="font-display text-lg font-bold">The lost treasures</h3>
            <p className="mt-1.5 text-sm leading-relaxed">
              Old maps speak of more than a hundred treasures buried across these lands. Some scholars swear there are a thousand.
              Nobody alive has seen them all, and the few who found one rarely say where.
            </p>
            <p className="mt-1.5 text-sm leading-relaxed">
              They wake where your people dig, cut, plant and forge, and sometimes in places nobody thinks to look.
              Most mayors never hold one. Keep building, mayor, and keep your eyes open.
            </p>
          </section>
          <SubHead right={<span className="text-xs text-[var(--paper-dim)]">{chronicle.length} {chronicle.length === 1 ? 'page' : 'pages'} written</span>}>Your chronicle</SubHead>
          {chronicle.length === 0 ? (
            <p className="well p-4 text-sm text-[var(--paper-dim)]">No pages yet. The first treasure you hold gets its page here, with its story and what it does for your city.</p>
          ) : (
            <div className="grid grid-cols-2 gap-2 lg:grid-cols-3">
              {chronicle.map((k) => {
                const r = sim.RELICS[k];
                return (
                  <div key={k} className="well flex gap-2.5 p-2.5">
                    <RelicThumb k={k} size={44} />
                    <div className="min-w-0 text-sm">
                      <b className="font-display block leading-tight">{r.name}</b>
                      <RarityTag k={k} />
                      <p className="text-xs text-[var(--paper-dim)]">{r.desc}</p>
                      <p className="text-xs text-[var(--paper-dim)]">Turns up in {plural(sim.BUILDINGS[r.source].name.toLowerCase())}.</p>
                      <p className="text-xs text-[var(--good)]">{bonusText(r.bonus)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </Modal>
  );
}
