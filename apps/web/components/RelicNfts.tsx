'use client';
// Relics as NEP-171 NFTs on metropolix.testnet: mint one out of the vault, bring one home again.
// A minted relic leaves the local vault (no bonus while it is an NFT); "Bring home" burns the token and the
// relic comes back. Uses the session key when autosave is on, otherwise the wallet asks.
import { useCallback, useEffect, useState } from 'react';
import * as sim from '@metropolix/sim';
import { EXPLORER, CONTRACT_ID, indexer, loadChain, type RelicToken } from '@/lib/chain-meta';
import { RelicThumb } from './ItemThumb';
import { SubHead } from './ui';

const errText = (e: unknown) => {
  const m = e instanceof Error ? e.message : String(e);
  return (/Smart contract panicked: ([^"\\]+)/.exec(m)?.[1] ?? m).slice(0, 120);
};

/** Mint one relic of kind `k` out of the vault. Returns an error message, or null when it worked. */
export async function mintRelicNft(s: sim.GameState, account: string, k: sim.RelicKind): Promise<string | null> {
  if ((s.vault[k] ?? 0) < 1) return 'That treasure is not in your vault.';
  s.vault[k] -= 1; // take it out first so it cannot be sold while the transaction runs
  try {
    const chain = await loadChain();
    await chain.sessionCall(account, 'mint_relic', { kind: k });
    sim.pushLog(s, `${sim.RELICS[k].name} minted as an NFT on NEAR.`);
    void fetch('/api/chain/poke', { method: 'POST' }).catch(() => undefined);
    return null;
  } catch (e) {
    s.vault[k] += 1;
    return `Mint failed: ${errText(e)}`;
  }
}

interface Props { s: sim.GameState; account: string | null; act: (r?: sim.Result) => void; refreshKey: number; onMsg: (m: string | null) => void }

export default function RelicNfts({ s, account, act, refreshKey, onMsg }: Props) {
  const [tokens, setTokens] = useState<RelicToken[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [sendTo, setSendTo] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    if (!account) { setTokens(null); return; }
    // the indexer first; the RPC when it is behind or down
    const fromDb = await indexer<RelicToken[]>(`relics?owner=${encodeURIComponent(account)}`);
    if (fromDb && fromDb.length) { setTokens(fromDb); return; }
    try {
      const chain = await loadChain();
      const raw = (await chain.view<{ token_id: string; owner_id: string; metadata?: { title?: string; extra?: string } }[]>('nft_tokens_for_owner', { account_id: account, limit: 50 })) ?? [];
      setTokens(raw.map((t) => {
        let x: { kind?: string; rarity?: string } = {};
        try { x = JSON.parse(t.metadata?.extra ?? '{}'); } catch { /* keep empty */ }
        return { token_id: t.token_id, owner_id: t.owner_id, kind: x.kind ?? '', rarity: x.rarity ?? '', title: t.metadata?.title ?? '' };
      }));
    } catch { setTokens(fromDb ?? []); }
  }, [account]);
  useEffect(() => { void load(); }, [load, refreshKey]);

  /** NEP-171 transfer to another account: the wallet confirms it (1 yoctoNEAR, as the standard requires). */
  const send = async (t: RelicToken) => {
    const to = (sendTo[t.token_id] ?? '').trim().toLowerCase();
    if (!account || !/^[a-z0-9_.-]{2,64}$/.test(to) || to === account) { onMsg('Enter another NEAR account, like friend.testnet'); return; }
    setBusy(t.token_id);
    try {
      const chain = await loadChain();
      await chain.call('nft_transfer', { receiver_id: to, token_id: t.token_id }, '1');
      sim.pushLog(s, `${t.title || 'A relic NFT'} sent to ${to}.`);
      onMsg(null);
      act(undefined);
      void fetch('/api/chain/poke', { method: 'POST' }).catch(() => undefined);
      setTokens((ts) => (ts ?? []).filter((x) => x.token_id !== t.token_id));
    } catch (e) {
      onMsg(`Could not send it: ${errText(e)}`);
    } finally { setBusy(null); }
  };

  const bringHome = async (t: RelicToken) => {
    if (!account) return;
    setBusy(t.token_id);
    try {
      const chain = await loadChain();
      const kind = (await chain.sessionCall<string>(account, 'return_relic', { token_id: t.token_id })) ?? t.kind;
      if (sim.isRelic(kind as sim.ItemKind)) {
        sim.addStock(s, kind as sim.RelicKind, 1);
        sim.pushLog(s, `${sim.RELICS[kind as sim.RelicKind].name} brought home from the chain.`);
      }
      onMsg(null);
      act(undefined);
      void fetch('/api/chain/poke', { method: 'POST' }).catch(() => undefined);
      setTokens((ts) => (ts ?? []).filter((x) => x.token_id !== t.token_id));
    } catch (e) {
      onMsg(`Could not bring it home: ${errText(e)}`);
    } finally { setBusy(null); }
  };

  return (
    <section className="mt-5">
      <SubHead right={<a className="text-xs text-[var(--paper-dim)] underline" href={`${EXPLORER}/address/${CONTRACT_ID}`} target="_blank" rel="noreferrer">NEP-171 on {CONTRACT_ID}</a>}>On chain (NFTs)</SubHead>
      {!account ? (
        <p className="well p-3 text-sm text-[var(--paper-dim)]">Connect a NEAR wallet to mint treasures as NFTs you can hold, trade or send to another player.</p>
      ) : tokens === null ? (
        <p className="text-sm text-[var(--paper-dim)]">Loading...</p>
      ) : tokens.length === 0 ? (
        <p className="well p-3 text-sm text-[var(--paper-dim)]">No relic NFTs yet. Use "Mint NFT" on a treasure in your vault (up to 3 an hour). It gives no bonus while it is an NFT; bring it home to use it again.</p>
      ) : (
        <ul className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {tokens.map((t) => (
            <li key={t.token_id} className="well flex items-center gap-2.5 p-2">
              {sim.isRelic(t.kind as sim.ItemKind) && <RelicThumb k={t.kind as sim.RelicKind} size={40} />}
              <div className="min-w-0 flex-1 text-sm">
                <b className="font-display block truncate">{t.title || t.kind}</b>
                <span className="text-xs text-[var(--paper-dim)]">Token #{t.token_id}</span>
              </div>
              <div className="flex shrink-0 flex-col gap-1">
                <button className="btn btn-quiet px-2 py-1 text-xs" disabled={!!busy} onClick={() => void bringHome(t)}>
                  {busy === t.token_id ? '...' : 'Bring home'}
                </button>
                <span className="flex gap-1">
                  <label className="sr-only" htmlFor={`to-${t.token_id}`}>Send {t.title} to account</label>
                  <input id={`to-${t.token_id}`} className="field w-28 px-1.5 py-0.5 text-xs" placeholder="friend.testnet" value={sendTo[t.token_id] ?? ''}
                    onChange={(e) => setSendTo({ ...sendTo, [t.token_id]: e.target.value })} />
                  <button className="btn btn-quiet px-2 py-0.5 text-xs" disabled={!!busy} onClick={() => void send(t)}>Send</button>
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
