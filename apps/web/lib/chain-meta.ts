// Light half of the NEAR layer: names and shapes only, no wallet or RPC code.
// The heavy half (lib/chain.ts: near-api-js, the wallet connector, crypto) loads on demand
// through loadChain(), so the city is playable before any of it is downloaded.

export const NETWORK = 'testnet' as const;
export const CONTRACT_ID = process.env.NEXT_PUBLIC_CONTRACT_ID || 'metropolix.testnet';
/** FastNEAR's public testnet RPC answers browsers (CORS); rpc.testnet.near.org does not. */
export const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || 'https://test.rpc.fastnear.com';
export const EXPLORER = 'https://testnet.nearblocks.io';
/** How often a connected city saves itself on chain. */
export const AUTOSAVE_MS = 5 * 60 * 1000;
export const METRO_DECIMALS = 18;

export interface ChainRecord { won: number; lost: number; held: number; breached: number }
export interface CityView {
  owner: string;
  name: string;
  arc: number;
  portrait: number;
  level: number;
  xp: number;
  gold: number;
  army: [number, number, number];
  troops: number;
  tick: number;
  committed_ns: number;
  commits: number;
  trophies: number;
  record: ChainRecord;
  shield_until_ns: number;
  gold_lost_unsynced: number;
  buildings: number;
  econ_score: number;
  attack: number;
  defense: number;
  chain_power: number;
  grid?: number[] | null;
  levels?: number[] | null;
}
export interface Battle {
  seq: number; ts_ns: number; attacker: string; target: string; sent: number; destruction: number;
  stars: number; loot: number; lost: number; trophies: number; force: number; eff_defense: number; win: boolean;
}
export interface CommitResult { gold: number; lost_applied: number; trophies: number; shield_until_ns: number }
/** Amounts are strings in the smallest unit (yoctoNEAR, 1e-18 METRO). */
export interface CoinView {
  symbol: string; decimals: number; supply: string; metro_reserve: string; near_reserve: string; treasury: string;
  city_index: string; nav_k: string; price: string; nav: string; mnav_pm: string; issued: string; burned: string;
  swaps: number; volume_near: string;
}
export interface CoinTick { ts: number; price: string; nav: string; mnav_pm: string; supply: string }
export interface RelicToken { token_id: string; owner_id: string; kind: string; rarity: string; title: string }

/** yoctoNEAR (or 1e-18 METRO) string to a plain number for display. */
export function fromUnits(v: string | undefined, decimals = 24): number {
  if (!v) return 0;
  const s = v.padStart(decimals + 1, '0');
  return Number(`${s.slice(0, s.length - decimals)}.${s.slice(s.length - decimals, s.length - decimals + 8)}`);
}
/** A decimal amount to the smallest unit as a string (no floats in the integer part). */
export function toUnits(amount: string, decimals = 24): string {
  if (!/^\d*(\.\d*)?$/.test(amount.trim())) return '0';
  const [i = '0', f = ''] = amount.trim().split('.');
  const whole = (i.replace(/\D/g, '') || '0') + (f.replace(/\D/g, '') + '0'.repeat(decimals)).slice(0, decimals);
  return whole.replace(/^0+(?=\d)/, '');
}

let pending: Promise<typeof import('./chain')> | null = null;
/** Fetch the wallet/RPC module once; later calls reuse the same promise. */
export function loadChain() {
  pending ??= import('./chain');
  return pending;
}

/** Read the indexer (our DB layer over the chain). Returns undefined when it is not reachable. */
export async function indexer<T>(path: string): Promise<T | undefined> {
  try {
    const r = await fetch(`/api/chain/${path}`, { cache: 'no-store' });
    if (!r.ok) return undefined;
    return (await r.json()) as T;
  } catch {
    return undefined;
  }
}
