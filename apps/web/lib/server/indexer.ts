// The indexer: a read layer over the contract (Theo's design, 14 Nov). The server pulls the contract's views
// from the RPC at most every SYNC_MS and keeps them in Postgres (Neon, DATABASE_URL); the game reads this
// layer through /api/chain/*, not the RPC. Without DATABASE_URL it keeps the same data in memory, so the
// game still works (one server instance's memory, refreshed on the same schedule).
import 'server-only';
import { neon } from '@neondatabase/serverless';
import type { Battle, CityView, CoinTick, CoinView, RelicToken } from '../chain-meta';

export const CONTRACT = process.env.NEXT_PUBLIC_CONTRACT_ID || 'metropolix.testnet';
const RPC = process.env.NEAR_RPC_URL || 'https://test.rpc.fastnear.com';
export const SYNC_MS = 5 * 60 * 1000;
const HISTORY = 288; // a day of 5-minute coin ticks

// ---------- RPC ----------
async function viewFn<T>(method: string, args: Record<string, unknown> = {}): Promise<T> {
  const body = {
    jsonrpc: '2.0', id: 'idx', method: 'query',
    params: { request_type: 'call_function', finality: 'final', account_id: CONTRACT, method_name: method, args_base64: Buffer.from(JSON.stringify(args)).toString('base64') },
  };
  const r = await fetch(RPC, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body), cache: 'no-store' });
  const j = (await r.json()) as { result?: { result?: number[] }; error?: unknown };
  if (!j.result?.result) throw new Error(`rpc ${method}: ${JSON.stringify(j.error ?? j).slice(0, 200)}`);
  return JSON.parse(Buffer.from(j.result.result).toString('utf8')) as T;
}

// ---------- storage ----------
interface Snapshot { cities: CityView[]; battles: Battle[]; coin: CoinView | null; history: CoinTick[]; relics: RelicToken[]; lastSync: number; nextBattle: number }
const mem: Snapshot = { cities: [], battles: [], coin: null, history: [], relics: [], lastSync: 0, nextBattle: 1 };

const sql = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;
export const storeKind = () => (sql ? 'postgres' : 'memory');
let schemaReady: Promise<void> | null = null;
function schema() {
  if (!sql) return Promise.resolve();
  schemaReady ??= (async () => {
    await sql`create table if not exists mx_cities (owner text primary key, chain_power bigint not null, data jsonb not null, updated_at timestamptz not null default now())`;
    await sql`create table if not exists mx_battles (seq bigint primary key, attacker text not null, target text not null, ts_ns numeric not null, data jsonb not null)`;
    await sql`create table if not exists mx_coin_ticks (ts bigint primary key, data jsonb not null)`;
    await sql`create table if not exists mx_relics (token_id text primary key, owner_id text not null, data jsonb not null)`;
    await sql`create table if not exists mx_meta (key text primary key, value text not null)`;
  })();
  return schemaReady;
}

async function getMeta(key: string): Promise<string | null> {
  if (!sql) return null;
  await schema();
  const rows = (await sql`select value from mx_meta where key = ${key}`) as { value: string }[];
  return rows[0]?.value ?? null;
}
async function setMeta(key: string, value: string) {
  if (!sql) return;
  await sql`insert into mx_meta (key, value) values (${key}, ${value}) on conflict (key) do update set value = excluded.value`;
}

// ---------- sync ----------
let inflight: Promise<SyncReport> | null = null;
export interface SyncReport { ok: boolean; store: string; cities: number; battles: number; relics: number; ms: number; error?: string }

async function lastSync(): Promise<number> {
  return sql ? Number((await getMeta('last_sync')) ?? 0) : mem.lastSync;
}

/** Sync when the data is older than SYNC_MS (or always with `force`). One sync at a time. */
export async function maybeSync(force = false): Promise<SyncReport | null> {
  if (!force && Date.now() - (await lastSync()) < SYNC_MS) return null;
  inflight ??= syncNow().finally(() => { inflight = null; });
  return inflight;
}

async function syncNow(): Promise<SyncReport> {
  const t0 = Date.now();
  try {
    await schema();
    // cities, a page of 100 at a time
    const count = await viewFn<number>('get_city_count');
    const cities: CityView[] = [];
    for (let from = 0; from < count; from += 100) cities.push(...(await viewFn<CityView[]>('get_cities', { from_index: from, limit: 100, full: false })));
    // battles since the last one we have
    let next = sql ? Number((await getMeta('next_battle')) ?? 1) : mem.nextBattle;
    const battles: Battle[] = [];
    for (;;) {
      const page = await viewFn<Battle[]>('get_battles', { from_seq: next, limit: 100 });
      if (!page.length) break;
      battles.push(...page);
      next = page[page.length - 1]!.seq + 1;
      if (page.length < 100) break;
    }
    const coin = await viewFn<CoinView>('get_coin');
    // relics: every token (burned ones disappear)
    const relics: RelicToken[] = [];
    for (let from = 0; ; from += 100) {
      const page = await viewFn<{ token_id: string; owner_id: string; metadata?: { title?: string; extra?: string } }[]>('nft_tokens', { from_index: String(from), limit: 100 });
      for (const t of page) {
        let extra: { kind?: string; rarity?: string } = {};
        try { extra = JSON.parse(t.metadata?.extra ?? '{}'); } catch { /* keep empty */ }
        relics.push({ token_id: t.token_id, owner_id: t.owner_id, kind: extra.kind ?? '', rarity: extra.rarity ?? '', title: t.metadata?.title ?? '' });
      }
      if (page.length < 100) break;
    }
    const tick: CoinTick = { ts: Date.now(), price: coin.price, nav: coin.nav, mnav_pm: coin.mnav_pm, supply: coin.supply };

    if (sql) {
      for (const c of cities) await sql`insert into mx_cities (owner, chain_power, data, updated_at) values (${c.owner}, ${c.chain_power}, ${JSON.stringify(c)}, now()) on conflict (owner) do update set chain_power = excluded.chain_power, data = excluded.data, updated_at = now()`;
      for (const b of battles) await sql`insert into mx_battles (seq, attacker, target, ts_ns, data) values (${b.seq}, ${b.attacker}, ${b.target}, ${String(b.ts_ns)}, ${JSON.stringify(b)}) on conflict (seq) do nothing`;
      await sql`insert into mx_coin_ticks (ts, data) values (${tick.ts}, ${JSON.stringify({ ...tick, coin })}) on conflict (ts) do nothing`;
      await sql`delete from mx_coin_ticks where ts < ${Date.now() - 7 * 24 * 3600 * 1000}`;
      await sql`delete from mx_relics`;
      for (const r of relics) await sql`insert into mx_relics (token_id, owner_id, data) values (${r.token_id}, ${r.owner_id}, ${JSON.stringify(r)})`;
      await setMeta('next_battle', String(next));
      await setMeta('last_sync', String(Date.now()));
    } else {
      mem.cities = cities;
      mem.battles = [...mem.battles, ...battles].slice(-500);
      mem.coin = coin;
      mem.history = [...mem.history, tick].slice(-HISTORY);
      mem.relics = relics;
      mem.nextBattle = next;
      mem.lastSync = Date.now();
    }
    return { ok: true, store: storeKind(), cities: cities.length, battles: battles.length, relics: relics.length, ms: Date.now() - t0 };
  } catch (e) {
    return { ok: false, store: storeKind(), cities: 0, battles: 0, relics: 0, ms: Date.now() - t0, error: e instanceof Error ? e.message : String(e) };
  }
}

// ---------- reads ----------
export async function leaderboard(limit = 20): Promise<CityView[]> {
  if (!sql) return [...mem.cities].sort((a, b) => b.chain_power - a.chain_power).slice(0, limit);
  const rows = (await sql`select data from mx_cities order by chain_power desc, owner limit ${limit}`) as { data: CityView }[];
  return rows.map((r) => r.data);
}
export async function city(owner: string): Promise<CityView | null> {
  if (!sql) return mem.cities.find((c) => c.owner === owner) ?? null;
  const rows = (await sql`select data from mx_cities where owner = ${owner}`) as { data: CityView }[];
  return rows[0]?.data ?? null;
}
export async function battles(account: string | null, limit = 50): Promise<Battle[]> {
  if (!sql) return mem.battles.filter((b) => !account || b.attacker === account || b.target === account).slice(-limit).reverse();
  const rows = (account
    ? await sql`select data from mx_battles where attacker = ${account} or target = ${account} order by seq desc limit ${limit}`
    : await sql`select data from mx_battles order by seq desc limit ${limit}`) as { data: Battle }[];
  return rows.map((r) => r.data);
}
export async function coin(): Promise<{ coin: CoinView | null; history: CoinTick[] }> {
  if (!sql) return { coin: mem.coin, history: mem.history };
  const rows = (await sql`select data from mx_coin_ticks order by ts desc limit ${HISTORY}`) as { data: CoinTick & { coin: CoinView } }[];
  return { coin: rows[0]?.data.coin ?? null, history: rows.reverse().map(({ data: { coin: _c, ...t } }) => t) };
}
export async function relics(owner: string | null): Promise<RelicToken[]> {
  if (!sql) return mem.relics.filter((r) => !owner || r.owner_id === owner);
  const rows = (owner
    ? await sql`select data from mx_relics where owner_id = ${owner}`
    : await sql`select data from mx_relics limit 500`) as { data: RelicToken }[];
  return rows.map((r) => r.data);
}
export async function status() {
  return { contract: CONTRACT, store: storeKind(), last_sync: await lastSync(), sync_every_ms: SYNC_MS };
}
