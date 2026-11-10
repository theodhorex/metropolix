// NEAR layer (testnet only). The simulation stays off-chain; the contract holds ownership,
// the committed snapshot, ChainPower and battle results. ABI mirrors contracts/metropolix.
import { JsonRpcProvider, teraToGas, type SerializedReturnValue } from 'near-api-js';
import { NearConnector } from '@hot-labs/near-connect';
import { BUILDING_KINDS, GRID, stats, type BuildingKind, type GameState } from '@metropolix/sim';

import { CONTRACT_ID, NETWORK, RPC_URL, type CityView } from './chain-meta';
export { CONTRACT_ID, NETWORK, RPC_URL, type BattleResult, type CityView } from './chain-meta';
const GAS = BigInt(teraToGas('100')); // 100 Tgas


const provider = new JsonRpcProvider({ url: RPC_URL });

export async function view<T>(method: string, args: Record<string, unknown> = {}): Promise<T | undefined> {
  const r = await provider.callFunction<SerializedReturnValue>({ contractId: CONTRACT_ID, method, args });
  return r as unknown as T | undefined;
}

export const getCity = (accountId: string) => view<CityView | null>('get_city', { account_id: accountId });
export const getLeaderboard = (limit = 10) => view<CityView[]>('get_leaderboard', { from_index: 0, limit });

// grid <-> bytes. Codes: 0 empty, 1.. = BUILDING_KINDS order (matches the contract).
export const CODES: Record<BuildingKind, number> = Object.fromEntries(BUILDING_KINDS.map((k, i) => [k, i + 1])) as Record<BuildingKind, number>;
export function gridToBytes(s: GameState): number[] {
  const out: number[] = [];
  for (let y = 0; y < GRID; y++) for (let x = 0; x < GRID; x++) { const k = s.grid[y]![x]; out.push(k ? CODES[k] : 0); }
  return out;
}
export const snapshotArgs = (s: GameState) => ({
  grid: gridToBytes(s), troops: s.troops, tick: s.tick, econ_score: stats(s).econScore,
});

let connector: NearConnector | null = null;

/** Client-side only (touches window/IndexedDB). Never call during SSR. */
export function getConnector(): NearConnector {
  if (!connector) {
    connector = new NearConnector({
      network: NETWORK,
      features: { testnet: true },
      signIn: { contractId: CONTRACT_ID, methodNames: ['mint_city', 'commit_snapshot', 'attack', 'claim_loot'] },
    });
  }
  return connector;
}

export async function openModal() {
  await getConnector().connect();
}

export async function signOut() {
  await getConnector().disconnect();
}

export async function currentAccount(): Promise<string | null> {
  try {
    const { accounts } = await getConnector().getConnectedWallet();
    return accounts[0]?.accountId ?? null;
  } catch {
    return null;
  }
}

export async function call(method: string, args: Record<string, unknown> = {}) {
  const w = await getConnector().wallet();
  return w.signAndSendTransaction({
    receiverId: CONTRACT_ID,
    actions: [{ type: 'FunctionCall', params: { methodName: method, args, gas: GAS.toString(), deposit: '0' } }],
  });
}

/** Pull a JSON return value out of a FinalExecutionOutcome (SuccessValue is base64). */
export function returnValue<T>(outcome: unknown): T | undefined {
  const v = (outcome as { status?: { SuccessValue?: string } } | undefined)?.status?.SuccessValue;
  if (!v) return undefined;
  try { return JSON.parse(atob(v)) as T; } catch { return undefined; }
}
