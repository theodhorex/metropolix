'use client';
// /verify: the browser re-derives what the contract claims. It reads raw views straight from a NEAR RPC node (not our
// indexer), recomputes every city's ChainPower and the $METRO backing with the same rule tables the contract was
// generated from, and shows chain vs recomputed side by side. A mismatch would show up red.
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { CONTRACT_ID, EXPLORER, RPC_URL, type CoinView } from '@/lib/chain-meta';
import { diffCity, recomputeCity, recomputeCoin, type AuditedCity } from '@metropolix/sim/src/verify';

async function rpc<T>(params: Record<string, unknown>): Promise<T> {
  const r = await fetch(RPC_URL, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'query', params: { finality: 'final', ...params } }),
  });
  const j = await r.json();
  if (j.error || j.result?.error) throw new Error(j.result?.error ?? j.error?.data ?? 'RPC error');
  return j.result as T;
}
async function view<T>(method: string, args: Record<string, unknown> = {}): Promise<T> {
  const res = await rpc<{ result: number[] }>({ request_type: 'call_function', account_id: CONTRACT_ID, method_name: method, args_base64: btoa(JSON.stringify(args)) });
  return JSON.parse(new TextDecoder().decode(new Uint8Array(res.result))) as T;
}

interface Audit { cities: AuditedCity[]; coin: CoinView; codeHash: string; block: number; at: number }

const fmt = (n: bigint | string, digits = 18) => {
  const s = BigInt(n).toString().padStart(digits + 1, '0');
  const whole = s.slice(0, -digits), frac = s.slice(-digits).slice(0, 4);
  return `${whole}.${frac}`;
};

const LEDGER: { rule: string; who: 'Chain rejects' | 'Chain clamps' | 'Chain computes' | 'Browser, bounded'; how: string }[] = [
  { rule: 'A saved city is a legal city (60 building codes, limits, wonders only for their people)', who: 'Chain rejects', how: 'commit_snapshot panics on an illegal layout. Tables are generated from the simulation and a test fails if they drift.' },
  { rule: 'Troops fit the barracks, XP never falls', who: 'Chain rejects', how: 'Checked on every save against the saved layout.' },
  { rule: 'Gold, XP and the clock a client may claim', who: 'Chain clamps', how: 'Bounded by real time since the mint, what the layout could have earned, and 10 XP a second. The save result says what was kept.' },
  { rule: 'Raid outcome and loot', who: 'Chain computes', how: 'attack() runs the battle on the saved cities with env::random_seed(). The client cannot choose the result.' },
  { rule: 'ChainPower, level, NAV, mNAV, price', who: 'Chain computes', how: 'Recomputed below in your browser from raw views. Any mismatch turns red.' },
  { rule: 'Minute-to-minute economy of your city', who: 'Browser, bounded', how: 'Deterministic integer simulation (same seed, same moves, same city). The chain keeps it inside the bounds above.' },
  { rule: 'Treasure finds in the vault', who: 'Browser, bounded', how: 'Minting is rate-limited and gated by saved level.' },
];

export default function Verify() {
  const [a, setA] = useState<Audit | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const run = useCallback(async () => {
    setBusy(true); setErr(null);
    try {
      const count = await view<number>('get_city_count');
      const cities: AuditedCity[] = [];
      for (let from = 0; from < count; from += 50) {
        const page = await view<(AuditedCity & { grid: number[] | null })[]>('get_cities', { from_index: from, limit: 50, full: true });
        for (const c of page) if (c.grid) cities.push(c as AuditedCity);
      }
      const [coin, acct] = await Promise.all([
        view<CoinView>('get_coin'),
        rpc<{ code_hash: string; block_height: number }>({ request_type: 'view_account', account_id: CONTRACT_ID }),
      ]);
      setA({ cities, coin, codeHash: acct.code_hash, block: acct.block_height, at: Date.now() });
    } catch (e) { setErr(e instanceof Error ? e.message : String(e)); } finally { setBusy(false); }
  }, []);
  useEffect(() => { void run(); }, [run]);

  const coinAudit = a ? recomputeCoin(a.cities.map((c) => c.gold), a.coin) : null;
  const coinOk = a && coinAudit && coinAudit.cityIndex.toString() === a.coin.city_index && coinAudit.nav.toString() === a.coin.nav
    && coinAudit.price.toString() === a.coin.price && coinAudit.mnavPm.toString() === a.coin.mnav_pm;
  const cityBad = a ? a.cities.map((c) => ({ c, bad: diffCity(c) })) : [];
  const allOk = a && coinOk && cityBad.every((x) => x.bad.length === 0);

  return (
    <main className="vf">
      <style>{CSS}</style>
      <nav><Link href="/">Metropolix</Link><Link href="/play">Play</Link><a href={`${EXPLORER}/address/${CONTRACT_ID}`} target="_blank" rel="noreferrer">{CONTRACT_ID}</a></nav>
      <header>
        <p className="eyebrow">Verify</p>
        <h1>Don&apos;t trust the game. Recompute it.</h1>
        <p className="lead">
          Everything below is read raw from a NEAR testnet RPC node, then re-derived in your browser with the same
          rule tables the contract was generated from. No indexer, no server of ours in the loop.
        </p>
        <div className={`verdict ${err ? 'bad' : a ? (allOk ? 'ok' : 'bad') : ''}`} role="status">
          {err ? `Could not reach the chain: ${err}` : !a ? 'Reading the contract…'
            : allOk ? `All ${a.cities.length} saved cities and the $METRO backing match the contract, to the digit.`
              : 'Mismatch found. See the red rows below.'}
        </div>
        <button onClick={run} disabled={busy}>{busy ? 'Reading…' : 'Re-run audit'}</button>
        {a && <span className="stamp">block {a.block.toLocaleString()} · {new Date(a.at).toLocaleTimeString()}</span>}
      </header>

      {a && (<>
        <section>
          <h2>1 · The deployed code</h2>
          <p>Code hash of <code>{CONTRACT_ID}</code> on testnet: <code className="hash">{a.codeHash}</code>. Build the contract from this repository (<code>cargo build --target wasm32-unknown-unknown --release</code>) and compare its SHA-256 (base58) with it. It matched the author&apos;s build on 15 Nov 2026.</p>
        </section>

        <section>
          <h2>2 · Every saved city</h2>
          <p>The chain stores the layout and army; ChainPower and level are computed by the contract. We recompute them from the stored grid.</p>
          <div className="scroll"><table>
            <thead><tr><th>Mayor</th><th>Level</th><th>Buildings</th><th>Econ</th><th>Attack</th><th>Defense</th><th>ChainPower</th><th>Gold</th><th></th></tr></thead>
            <tbody>{cityBad.map(({ c, bad }) => {
              const r = recomputeCity(c);
              return (
                <tr key={c.owner} className={bad.length ? 'row-bad' : ''}>
                  <td><code>{c.owner}</code></td>
                  <td>{c.level} <i>{r.level}</i></td><td>{c.buildings} <i>{r.buildings}</i></td>
                  <td>{c.econ_score} <i>{r.econ_score}</i></td><td>{c.attack} <i>{r.attack}</i></td>
                  <td>{c.defense} <i>{r.defense}</i></td><td>{c.chain_power} <i>{r.chain_power}</i></td>
                  <td>{c.gold.toLocaleString()}</td>
                  <td className={bad.length ? 'no' : 'yes'} title={bad.join('\n')}>{bad.length ? '✗' : '✓'}</td>
                </tr>
              );
            })}</tbody>
          </table></div>
          <p className="note">Each cell shows the chain&apos;s value, then the value we recomputed in italics.</p>
        </section>

        <section>
          <h2>3 · What backs $METRO</h2>
          <p>NAV = (treasury + k · Σ √gold of every saved city) / supply. Raids move gold between cities, so they move NAV; nothing else feeds it, and there is no oracle.</p>
          {coinAudit && (
            <div className="scroll"><table>
              <thead><tr><th></th><th>Chain says</th><th>Recomputed here</th><th></th></tr></thead>
              <tbody>
                <Row k="City index (Σ √gold)" chain={a.coin.city_index} here={coinAudit.cityIndex.toString()} />
                <Row k="NAV per METRO (NEAR)" chain={fmt(a.coin.nav)} here={fmt(coinAudit.nav)} exact={[a.coin.nav, coinAudit.nav.toString()]} />
                <Row k="Pool price (NEAR)" chain={fmt(a.coin.price)} here={fmt(coinAudit.price)} exact={[a.coin.price, coinAudit.price.toString()]} />
                <Row k="mNAV (price / NAV, permille)" chain={a.coin.mnav_pm} here={coinAudit.mnavPm.toString()} />
              </tbody>
            </table></div>
          )}
          <p className="note">Supply {fmt(a.coin.supply)} METRO · treasury {fmt(a.coin.treasury)} NEAR · {a.coin.swaps} swaps. Above 2x mNAV the contract issues new METRO into the pool; below 0.9x it buys back and burns.</p>
        </section>
      </>)}

      <section>
        <h2>{a ? '4' : '2'} · Who is trusted with what</h2>
        <p>The browser plays the minute-to-minute game; the chain decides everything that has to be shared. Nothing is hidden: this is the whole trust model.</p>
        <div className="scroll"><table className="ledger">
          <thead><tr><th>Rule</th><th>Enforced by</th><th>How</th></tr></thead>
          <tbody>{LEDGER.map((l) => (
            <tr key={l.rule}><td>{l.rule}</td><td><span className={`tag ${l.who.startsWith('Chain') ? 'chain' : 'client'}`}>{l.who}</span></td><td>{l.how}</td></tr>
          ))}</tbody>
        </table></div>
      </section>

      <section>
        <h2>Run it yourself</h2>
        <pre>{`git clone https://github.com/theodhorex/metropolix && cd metropolix
pnpm install
pnpm --filter @metropolix/sim test   # verify.test.ts replays this audit on saved chain data`}</pre>
        <p className="note">Source of this page: <code>apps/web/components/Verify.tsx</code>, recomputation: <code>packages/sim/src/verify.ts</code>.</p>
      </section>
    </main>
  );
}

function Row({ k, chain, here, exact }: { k: string; chain: string; here: string; exact?: [string, string] }) {
  const ok = exact ? exact[0] === exact[1] : chain === here;
  return <tr className={ok ? '' : 'row-bad'}><td>{k}</td><td><code>{chain}</code></td><td><code>{here}</code></td><td className={ok ? 'yes' : 'no'}>{ok ? '✓' : '✗'}</td></tr>;
}

const CSS = `
.vf{position:fixed;inset:0;overflow:auto;background:var(--night);color:var(--paper);padding:0 16px 64px;font-family:var(--font-body),system-ui,sans-serif}
.vf>*{max-width:980px;margin-left:auto;margin-right:auto}
.vf nav{display:flex;gap:20px;padding:18px 0;font-size:14px;align-items:center}
.vf nav a{color:var(--paper-dim);text-decoration:none}.vf nav a:first-child{font-family:var(--font-display);color:var(--gold);font-size:18px}.vf nav a:last-child{margin-left:auto;font-family:monospace}
.vf nav a:hover{color:var(--paper)}
.vf .eyebrow{color:var(--accent);font-family:var(--font-display);letter-spacing:.12em;text-transform:uppercase;font-size:13px;margin:28px 0 6px}
.vf h1{font-family:var(--font-display);font-size:clamp(28px,5vw,44px);line-height:1.1;margin:0 0 12px}
.vf h2{font-family:var(--font-display);font-size:20px;margin:0 0 8px;color:var(--gold)}
.vf .lead{color:var(--paper-dim);max-width:62ch;line-height:1.55;margin:0 0 18px}
.vf section{margin-top:34px}.vf section p{line-height:1.55;color:var(--paper-dim);margin:0 0 12px}
.vf .verdict{padding:12px 14px;border:2px solid var(--rim);background:var(--slab);margin-bottom:12px;font-weight:700}
.vf .verdict.ok{border-color:var(--good);color:var(--good)}.vf .verdict.bad{border-color:var(--bad);color:var(--bad)}
.vf button{font:inherit;font-weight:700;background:var(--accent);color:var(--accent-ink);border:0;padding:9px 16px;cursor:pointer}
.vf button:disabled{opacity:.6;cursor:wait}.vf .stamp{margin-left:12px;color:var(--paper-dim);font-size:13px}
.vf .scroll{overflow-x:auto;border:2px solid var(--ink);background:var(--slab)}
.vf table{border-collapse:collapse;width:100%;font-size:14px}
.vf th,.vf td{padding:9px 12px;text-align:left;border-bottom:1px solid var(--ink);vertical-align:top}
.vf th{color:var(--paper-dim);font-weight:400;background:var(--slab-lo);white-space:nowrap}
.vf td i{color:var(--accent);margin-left:6px;font-size:13px}
.vf code{font-family:ui-monospace,monospace;font-size:13px;word-break:break-all}.vf .hash{color:var(--gold)}
.vf .yes{color:var(--good);font-weight:700;text-align:center}.vf .no{color:var(--bad);font-weight:700;text-align:center}
.vf .row-bad{background:rgba(234,106,85,.14)}
.vf .tag{display:inline-block;padding:2px 8px;font-size:12px;font-weight:700;white-space:nowrap}
.vf .tag.chain{background:rgba(127,207,106,.18);color:var(--good)}.vf .tag.client{background:rgba(242,193,78,.16);color:var(--gold)}
.vf .ledger td:nth-child(1){min-width:220px}.vf .ledger td:nth-child(3){color:var(--paper-dim);min-width:260px}
.vf pre{background:var(--slab-lo);border:2px solid var(--ink);padding:12px;overflow-x:auto;font-size:13px}
.vf .note{font-size:13px}
`;
