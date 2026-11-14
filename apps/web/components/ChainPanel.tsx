'use client';
// The city's on-chain side: connect a NEAR wallet, found the city on metropolix.testnet, turn on autosave (a
// session key, one wallet confirmation), raid other players' saved cities, open the $METRO market.
// Reads other players through the indexer (/api/chain/*, a DB layer synced from the chain every 5 minutes);
// reads your own city straight from the RPC so it is always fresh.
import { useCallback, useEffect, useRef, useState } from 'react';
import * as sim from '@metropolix/sim';
import { cityFromChain } from '@/lib/restore';
import { AUTOSAVE_MS, CONTRACT_ID, EXPLORER, NETWORK, indexer, loadChain, type Battle, type CityView, type CommitResult } from '@/lib/chain-meta';

type Chain = Awaited<ReturnType<typeof loadChain>>;

interface Props {
  getState: () => sim.GameState | null;
  onChange: () => void;
  onLog: (msg: string) => void;
  onOpenCoin: () => void;
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

const errText = (e: unknown) => {
  const m = e instanceof Error ? e.message : String(e);
  const panic = /Smart contract panicked: ([^"\\]+)/.exec(m);
  return (panic?.[1] ?? m).slice(0, 120);
};
const poke = () => { void fetch('/api/chain/poke', { method: 'POST' }).catch(() => undefined); };
const ago = (ns: number) => {
  if (!ns) return 'never';
  const s = Math.max(0, Math.floor((Date.now() - ns / 1e6) / 1000));
  return s < 60 ? `${s}s ago` : s < 3600 ? `${Math.floor(s / 60)} min ago` : `${Math.floor(s / 3600)} h ago`;
};

/** What to send so the chain accepts it: the tick no faster than real time since the last save. */
function safeArgs(chain: Chain, s: sim.GameState, city: CityView | null, goldCap?: number) {
  const a = chain.snapshotArgs(s);
  if (city && city.commits > 0) {
    const elapsed = Math.floor((Date.now() * 1e6 - city.committed_ns) / 1e9);
    a.tick = String(Math.max(city.tick, Math.min(s.tick, city.tick + elapsed + 60)));
  }
  if (goldCap !== undefined) a.gold = String(Math.min(Number(a.gold), goldCap));
  return a;
}

export default function ChainPanel({ getState, onChange, onLog, onOpenCoin }: Props) {
  const account = useAccount();
  const [city, setCity] = useState<CityView | null | undefined>(undefined);
  const [players, setPlayers] = useState<CityView[]>([]);
  const [fights, setFights] = useState<Battle[]>([]);
  const [session, setSession] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState(0);
  const cityRef = useRef<CityView | null>(null);
  cityRef.current = city ?? null;
  // this browser holds an older city than the chain (a new device, cleared storage): offer to load it, never overwrite it
  const local = getState();
  const behind = !!city && city.commits > 0 && (!local?.arc || sim.arcDef(local.arc)?.index !== city.arc || local.xp < city.xp);

  const refresh = useCallback(async () => {
    try {
      const chain = await loadChain();
      const [c, ok] = account ? await Promise.all([chain.getCity(account), chain.hasSession(account)]) : [undefined, false];
      setCity(account ? (c ?? null) : undefined);
      setSession(!!ok);
      setErr(null);
    } catch (e) {
      setErr(`Cannot reach ${CONTRACT_ID}: ${errText(e)}`);
    }
    const [lb, bt] = await Promise.all([indexer<CityView[]>('leaderboard?limit=20'), account ? indexer<Battle[]>(`battles?account=${account}&limit=5`) : Promise.resolve([])]);
    setPlayers(lb ?? []);
    setFights(bt ?? []);
  }, [account]);
  useEffect(() => { void refresh(); }, [refresh]);

  const run = async (label: string, fn: (chain: Chain) => Promise<void>) => {
    setBusy(label);
    try { await fn(await loadChain()); poke(); await refresh(); }
    catch (e) { onLog(`${label} failed: ${errText(e)}`); }
    finally { setBusy(null); }
  };

  /** Save the city on chain; raid losses recorded there come back as `lost_applied`. */
  const save = useCallback(async (quiet: boolean) => {
    const s = getState();
    if (!account || !s) return;
    const chain = await loadChain();
    const c = cityRef.current;
    let r: CommitResult | undefined;
    try {
      r = await chain.sessionCall<CommitResult>(account, 'commit_snapshot', safeArgs(chain, s, c));
    } catch (e) {
      const why = errText(e);
      if (!/Invalid gold/.test(why) || !c) { if (!quiet) onLog(`Save failed: ${why}`); return; }
      // more gold than the chain can vouch for (big trades, raids on AI cities): save what it can prove
      const elapsed = Math.max(0, Number(safeArgs(chain, s, c).tick) - c.tick);
      r = await chain.sessionCall<CommitResult>(account, 'commit_snapshot', safeArgs(chain, s, c, c.gold + elapsed * 200));
    }
    if (r && r.lost_applied > 0) {
      s.gold = Math.max(0, s.gold - r.lost_applied);
      sim.pushLog(s, `Raiders from other players took ${r.lost_applied} gold from your treasury.`);
      onChange();
    }
    setSavedAt(Date.now());
    if (!quiet) onLog('City saved on chain.');
    poke();
    void refresh();
  }, [account, getState, onChange, onLog, refresh]);

  // autosave every few minutes once a session key exists, and once soon after the page opens
  useEffect(() => {
    if (!account || !session || !city || behind) return;
    const first = window.setTimeout(() => void save(true), 20_000);
    const t = window.setInterval(() => void save(true), AUTOSAVE_MS);
    return () => { window.clearTimeout(first); window.clearInterval(t); };
  }, [account, session, city?.owner, behind, save]); // eslint-disable-line react-hooks/exhaustive-deps

  const raid = (target: CityView) => run(`Raid on ${target.name}`, async (chain) => {
    const s = getState(); if (!s || !account) return;
    const b = await chain.sessionCall<Battle>(account, 'attack', { target: target.owner, commit: 100, focus: 0 });
    if (!b) return;
    s.gold += b.loot;
    sim.loseTroops(s, b.lost);
    s.trophies = Math.max(0, s.trophies + b.trophies);
    if (b.win) s.record.won++; else s.record.lost++;
    sim.pushLog(s, b.win
      ? `On-chain raid on ${target.name}: ${b.stars}★, +${b.loot} gold, lost ${b.lost} troops.`
      : `On-chain raid on ${target.name} was thrown back: lost ${b.lost} troops.`);
    onChange();
  });

  const restore = () => run('Load city', async (chain) => {
    const s = getState(); if (!s || !account) return;
    const full = await chain.view<CityView>('get_city', { account_id: account, full: true });
    const r = full && cityFromChain(full, s.rng);
    if (!r) throw new Error('No saved city to load');
    Object.assign(s, r);
    onChange();
  });

  const btn = 'btn btn-quiet w-full text-sm';
  const s = getState();
  const nowNs = Date.now() * 1e6;
  const others = players.filter((p) => p.owner !== account);
  return (
    <section className="panel mt-2.5 p-2.5 text-sm">
      <h2 className="font-display mb-1.5 flex items-center gap-2 text-base font-bold">
        <span aria-hidden className="inline-block h-2.5 w-2.5 border border-[var(--ink)]" style={{ background: err ? 'var(--bad)' : 'var(--good)' }} />
        NEAR {NETWORK}
      </h2>
      <a className="-mt-1 mb-1 block text-xs text-[var(--paper-dim)] underline" href={`${EXPLORER}/address/${CONTRACT_ID}`} target="_blank" rel="noreferrer">{CONTRACT_ID}</a>
      {err && <p className="text-xs text-[var(--bad)]">{err}</p>}

      {!account && (
        <>
          <p className="text-xs text-[var(--paper-dim)]">Connect a NEAR wallet to save your city on chain, raid other players and trade $METRO.</p>
          <button className={`${btn} mt-1.5`} onClick={() => void loadChain().then((c) => c.openModal())}>Connect NEAR wallet</button>
        </>
      )}

      {account && city === null && (
        <>
          <p className="text-xs text-[var(--paper-dim)]">Signed in as <b>{account}</b>. Found your city on chain to join the other players (you get 100 $METRO).</p>
          <button className={`${btn} mt-1.5`} disabled={!!busy || !s?.arc} onClick={() => run('Found city', async (chain) => {
            const st = getState(); if (!st?.arc) return;
            await chain.call('mint_city', { arc: sim.arcDef(st.arc)!.index, name: (st.name || 'Mayor').slice(0, 24), portrait: st.portrait || null });
          })}>{busy === 'Found city' ? 'Founding...' : 'Found my city on chain'}</button>
        </>
      )}

      {account && city && (
        <div className="mt-1 space-y-1.5">
          <p className="text-xs"><b>{city.name}</b> ({account})</p>
          {behind && (
            <div className="well space-y-1.5 border-l-4 border-l-[var(--gold)] p-2 text-xs">
              <p>The city saved on chain (level {city.level}) is ahead of the one in this browser, so autosave is paused.</p>
              <button className="btn btn-gold w-full text-sm" disabled={!!busy} onClick={() => void restore()}>{busy === 'Load city' ? 'Loading...' : 'Load my city from chain'}</button>
            </div>
          )}
          <p>ChainPower <b className="text-[var(--accent)]">{city.chain_power}</b>, trophies <b className="text-[var(--gold)]">{city.trophies}</b>, {city.troops} troops saved</p>
          <p className="text-xs text-[var(--paper-dim)]">
            Last save {ago(savedAt ? savedAt * 1e6 : city.committed_ns)}{session ? `, autosave every ${AUTOSAVE_MS / 60000} min` : ''}.
            {city.record.won + city.record.lost + city.record.held + city.record.breached > 0 && ` Raids: ${city.record.won} won, ${city.record.lost} lost, ${city.record.held} held, ${city.record.breached} breached.`}
          </p>
          {city.gold_lost_unsynced > 0 && <p className="text-xs text-[var(--bad)]">Players raided {city.gold_lost_unsynced} gold from you. It leaves your treasury at the next save.</p>}
          {city.shield_until_ns > nowNs && <p className="text-xs text-[var(--good)]">Shielded for {Math.ceil((city.shield_until_ns - nowNs) / 1e9)}s after a raid.</p>}
          {!session ? (
            <button className={btn} disabled={!!busy} onClick={() => run('Autosave', async (chain) => { await chain.createSession(account); setSession(true); if (!behind) await save(false); })}>
              Turn on autosave (one wallet confirmation)
            </button>
          ) : (
            <button className={btn} disabled={!!busy || behind} onClick={() => run('Save', () => save(false))}>{busy === 'Save' ? 'Saving...' : 'Save now'}</button>
          )}
        </div>
      )}

      <button className={`${btn} mt-1.5`} onClick={onOpenCoin}>$METRO market</button>

      <details className="mt-2 border-t border-[var(--ink)] pt-1.5" open={others.length > 0}>
        <summary className="cursor-pointer text-sm font-bold">Players on chain</summary>
        {others.length === 0 && <p className="mt-1 text-xs text-[var(--paper-dim)]">No other cities saved on chain yet.</p>}
        {others.map((c) => {
          const shielded = c.shield_until_ns > nowNs;
          const young = c.level < 3;
          const why = !city ? 'Found your city first' : city.troops === 0 ? 'Save some troops on chain first' : young ? 'New cities are protected' : shielded ? 'Shielded after a raid' : '';
          return (
            <div key={c.owner} className="well mt-1 flex items-center justify-between gap-1 px-2 py-1">
              <span className="min-w-0 truncate text-xs">
                <b>{c.name}</b> <span className="text-[var(--paper-dim)]">lv {c.level}</span><br />
                <span className="text-[var(--accent)]">CP {c.chain_power}</span>, def {c.defense}, <span className="text-[var(--gold)]">{c.gold}g</span>
              </span>
              {account && (
                <button className="btn btn-bad shrink-0 text-xs" disabled={!!busy || !!why} title={why || `Raid ${c.name} with your saved army`} onClick={() => void raid(c)}>
                  {busy === `Raid on ${c.name}` ? '...' : 'Raid'}
                </button>
              )}
            </div>
          );
        })}
        {fights.length > 0 && (
          <ol className="mt-1.5 space-y-0.5 text-xs text-[var(--paper-dim)]">
            {fights.map((b) => (
              <li key={b.seq}>{b.attacker === account ? `You raided ${b.target}` : `${b.attacker} raided you`}: {b.stars}★, {b.loot}g</li>
            ))}
          </ol>
        )}
        <button className={`${btn} mt-1.5`} disabled={!!busy} onClick={() => void refresh()}>Refresh</button>
      </details>
    </section>
  );
}
