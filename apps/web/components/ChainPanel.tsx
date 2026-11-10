'use client';

import { useCallback, useEffect, useState } from 'react';
import { arcDef, type GameState } from '@metropolix/sim';
import { CONTRACT_ID, NETWORK, loadChain, type BattleResult, type CityView } from '@/lib/chain-meta';

type Chain = Awaited<ReturnType<typeof loadChain>>;

interface Props {
  getState: () => GameState | null;
  onLoot: (gold: number) => void;
  onTroopsLost: (n: number) => void;
  onLog: (msg: string) => void;
}

export function useAccount() {
  const [account, setAccount] = useState<string | null>(null);
  useEffect(() => {
    // wait until the city is on screen and the browser is idle, then load the wallet code
    let dead = false;
    let off = () => {};
    const start = async () => {
      const chain = await loadChain();
      if (dead) return;
      const c = chain.getConnector();
      const sync = () => { void chain.currentAccount().then((a) => { if (!dead) setAccount(a); }); };
      sync();
      c.on('wallet:signIn', sync);
      c.on('wallet:signOut', sync);
      off = () => { c.off('wallet:signIn', sync); c.off('wallet:signOut', sync); };
    };
    const idle = typeof window.requestIdleCallback === 'function';
    const id = idle ? window.requestIdleCallback(() => void start(), { timeout: 3000 }) : window.setTimeout(() => void start(), 1500);
    return () => { dead = true; if (idle) window.cancelIdleCallback(id); else window.clearTimeout(id); off(); };
  }, []);
  return account;
}

export default function ChainPanel({ getState, onLoot, onTroopsLost, onLog }: Props) {
  const account = useAccount();
  const [city, setCity] = useState<CityView | null | undefined>(undefined);
  const [board, setBoard] = useState<CityView[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setErr(null);
    try {
      const chain = await loadChain();
      const [c, b] = await Promise.all([account ? chain.getCity(account) : Promise.resolve(undefined), chain.getLeaderboard(10)]);
      setCity(account ? (c ?? null) : undefined);
      setBoard(b ?? []);
    } catch {
      setErr(`Contract not reachable at ${CONTRACT_ID} (not deployed yet?)`);
      setCity(undefined);
    }
  }, [account]);

  useEffect(() => { void refresh(); }, [refresh]);

  const run = async (label: string, fn: (chain: Chain) => Promise<void>) => {
    setBusy(true);
    try { await fn(await loadChain()); onLog(`${label}: done`); await refresh(); }
    catch (e) { onLog(`${label} failed: ${e instanceof Error ? e.message.slice(0, 80) : 'error'}`); }
    finally { setBusy(false); }
  };

  const btn = 'btn btn-quiet w-full text-sm';

  const live = !err;
  return (
    <section className="panel mt-2.5 p-2.5 text-sm">
      <h2 className="font-display mb-1.5 flex items-center gap-2 text-base font-bold">
        <span aria-hidden className="inline-block h-2.5 w-2.5 border border-[var(--ink)]" style={{ background: live ? 'var(--good)' : 'var(--bad)' }} />
        NEAR {NETWORK}
      </h2>
      {err ? (
        <p className="text-xs text-[var(--paper-dim)]">Contract <span className="break-all">{CONTRACT_ID}</span> is not deployed yet. Your city plays offline until it is.</p>
      ) : !account ? (
        <p className="text-xs text-[var(--paper-dim)]">Connect a wallet to put your city on chain and fight other players.</p>
      ) : null}
      {account && city === null && (
        <button className={`${btn} mt-1.5`} disabled={busy} onClick={() => run('Mint city', (chain) => chain.call('mint_city', { arc: (arcDef(getState()?.arc)?.index ?? 0) }).then(() => undefined))}>
          Mint my city
        </button>
      )}
      {account && city && (
        <div className="mt-1 space-y-1.5">
          <p>ChainPower <b className="text-[var(--accent)]">{city.chain_power}</b>, trophies <b className="text-[var(--gold)]">{city.trophies}</b></p>
          <p className="text-xs text-[var(--paper-dim)]">Saved at tick {city.tick}: {city.troops} troops, defense {city.defense}.</p>
          <button className={btn} disabled={busy} onClick={() => run('Commit snapshot', async (chain) => {
            const s = getState(); if (!s) return;
            await chain.call('commit_snapshot', chain.snapshotArgs(s));
          })}>Save city on chain</button>
          {city.loot_claimable > 0 && (
            <button className={btn} disabled={busy} onClick={() => run('Claim loot', async (chain) => {
              const out = await chain.call('claim_loot');
              onLoot(chain.returnValue<number>(out) ?? city.loot_claimable);
            })}>Claim {city.loot_claimable} gold</button>
          )}
        </div>
      )}
      {live && (
        <details className="mt-2 border-t border-[var(--ink)] pt-1.5" open={board.length > 0}>
          <summary className="cursor-pointer text-sm font-bold">Leaderboard</summary>
          {board.length === 0 && <p className="mt-1 text-xs text-[var(--paper-dim)]">No cities on chain yet.</p>}
          {board.map((c, i) => (
            <div key={c.owner} className="well mt-1 flex items-center justify-between gap-1 px-2 py-1">
              <span className="min-w-0 truncate text-xs"><b>{i + 1}.</b> {c.owner}<br /><span className="text-[var(--accent)]">CP {c.chain_power}</span>, def {c.defense}</span>
              {account && city && c.owner !== account && (
                <button className="btn btn-bad text-xs" disabled={busy || city.troops === 0}
                  onClick={() => run(`Attack ${c.owner}`, async (chain) => {
                    const out = await chain.call('attack', { target: c.owner });
                    const r = chain.returnValue<BattleResult>(out);
                    if (r) onTroopsLost(r.troops_lost);
                    if (r) onLog(r.win ? `Won vs ${c.owner}: +${r.loot} loot claimable` : `Lost vs ${c.owner}: -${r.troops_lost} troops`);
                  })}>Attack</button>
              )}
            </div>
          ))}
          <button className={`${btn} mt-1.5`} disabled={busy} onClick={() => void refresh()}>Refresh</button>
        </details>
      )}
    </section>
  );
}
