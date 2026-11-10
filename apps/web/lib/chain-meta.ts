// Light half of the NEAR layer: names and shapes only, no wallet or RPC code.
// The heavy half (lib/chain.ts: near-api-js, the wallet connector, crypto) loads on demand
// through loadChain(), so the city is playable before any of it is downloaded.

export const NETWORK = 'testnet' as const;
export const CONTRACT_ID = process.env.NEXT_PUBLIC_CONTRACT_ID || 'metropolix.testnet';
export const RPC_URL = 'https://rpc.testnet.near.org';

export interface CityView {
  owner: string;
  tick: number;
  troops: number;
  econ_score: number;
  attack: number;
  defense: number;
  chain_power: number;
  trophies: number;
  loot_claimable: number;
  raided: number;
  arc?: number;
  grid?: number[];
}
export interface BattleResult { win: boolean; force: number; target_defense: number; troops_lost: number; loot: number }

let pending: Promise<typeof import('./chain')> | null = null;
/** Fetch the wallet/RPC module once; later calls reuse the same promise. */
export function loadChain() {
  pending ??= import('./chain');
  return pending;
}
