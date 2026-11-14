// NEAR layer (testnet only). The game runs in the browser; the contract owns identity, the saved city, raids
// between players, the $METRO coin and relic NFTs. ABI mirrors contracts/metropolix (v2).
// Writes: the wallet for anything that moves value; a session key (a function-call access key limited to
// game methods, no deposits) for autosaves and raids, so they never pop up a wallet window.
import { Account, JsonRpcProvider, KeyPair, teraToGas, type KeyPairString, type SerializedReturnValue } from 'near-api-js';
import { NearConnector } from '@hot-labs/near-connect';
import { BUILDING_KINDS, GRID, type BuildingKind, type GameState } from '@metropolix/sim';

import { CONTRACT_ID, NETWORK, RPC_URL, type CityView } from './chain-meta';
export * from './chain-meta';
const GAS = BigInt(teraToGas('100')).toString(); // 100 Tgas
/** Methods the session key may call: none of them takes a deposit. */
export const SESSION_METHODS = ['commit_snapshot', 'attack', 'mint_relic', 'return_relic'];
const SESSION_ALLOWANCE = '250000000000000000000000'; // 0.25 NEAR of gas

const provider = new JsonRpcProvider({ url: RPC_URL });

export async function view<T>(method: string, args: Record<string, unknown> = {}): Promise<T | undefined> {
  const r = await provider.callFunction<SerializedReturnValue>({ contractId: CONTRACT_ID, method, args });
  return r as unknown as T | undefined;
}
export const getCity = (accountId: string) => view<CityView | null>('get_city', { account_id: accountId, full: false });

// ---------- city <-> contract arguments ----------
/** Codes: 0 empty, 1.. = BUILDING_KINDS order (the contract's tables are generated from the same list). */
export const CODES: Record<BuildingKind, number> = Object.fromEntries(BUILDING_KINDS.map((k, i) => [k, i + 1])) as Record<BuildingKind, number>;
export function gridToBytes(s: GameState): number[] {
  const out: number[] = [];
  for (let y = 0; y < GRID; y++) for (let x = 0; x < GRID; x++) { const k = s.grid[y]![x]; out.push(k ? CODES[k] : 0); }
  return out;
}
export function levelsToBytes(s: GameState): number[] {
  const out: number[] = [];
  for (let y = 0; y < GRID; y++) for (let x = 0; x < GRID; x++) {
    const k = s.grid[y]![x];
    out.push(k ? Math.min(3, Math.max(1, s.levels[`${x},${y}`] ?? 1)) : 0);
  }
  return out;
}
export const snapshotArgs = (s: GameState) => ({
  grid: gridToBytes(s),
  levels: levelsToBytes(s),
  army: [s.army.vanguard, s.army.raider, s.army.breaker],
  gold: String(Math.max(0, Math.floor(s.gold))),
  xp: String(Math.max(0, Math.floor(s.xp))),
  tick: String(Math.max(0, Math.floor(s.tick))),
});

// ---------- wallet ----------
let connector: NearConnector | null = null;

/** Client-side only (touches window/IndexedDB). Never call during SSR. */
export function getConnector(): NearConnector {
  if (!connector) {
    connector = new NearConnector({
      network: NETWORK,
      features: { testnet: true },
      signIn: { contractId: CONTRACT_ID, methodNames: SESSION_METHODS },
    });
  }
  return connector;
}

export async function openModal() {
  await getConnector().connect();
}

export async function signOut() {
  const a = await currentAccount();
  if (a) try { localStorage.removeItem(`metropolix-session-${NETWORK}-${a}`); } catch { /* nothing stored */ }
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

/** Sign with the wallet (the player confirms). `deposit` in yoctoNEAR. */
export async function call(method: string, args: Record<string, unknown> = {}, deposit = '0') {
  const w = await getConnector().wallet();
  return w.signAndSendTransaction({
    receiverId: CONTRACT_ID,
    actions: [{ type: 'FunctionCall', params: { methodName: method, args, gas: GAS, deposit } }],
  });
}

/** Pull a JSON return value out of a FinalExecutionOutcome (SuccessValue is base64). */
export function returnValue<T>(outcome: unknown): T | undefined {
  const v = (outcome as { status?: { SuccessValue?: string } } | undefined)?.status?.SuccessValue;
  if (!v) return undefined;
  try { return JSON.parse(atob(v)) as T; } catch { return undefined; }
}

// ---------- session key: autosave and raids without a wallet window ----------
const keyName = (account: string) => `metropolix-session-${NETWORK}-${account}`;
function storedKey(account: string): KeyPairString | null {
  try { return (localStorage.getItem(keyName(account)) as KeyPairString | null) ?? null; } catch { return null; }
}

/** True when this browser holds a session key the chain still accepts for this account. */
export async function hasSession(account: string): Promise<boolean> {
  const k = storedKey(account);
  if (!k) return false;
  try {
    await new Account(account, provider).getAccessKey(KeyPair.fromString(k).getPublicKey().toString());
    return true;
  } catch {
    return false;
  }
}

/** One wallet confirmation: add a function-call key for the game's own methods, kept in this browser. */
export async function createSession(account: string): Promise<void> {
  const kp = KeyPair.fromRandom('ed25519');
  const w = await getConnector().wallet();
  await w.signAndSendTransaction({
    receiverId: account,
    actions: [{
      type: 'AddKey',
      params: {
        publicKey: kp.getPublicKey().toString(),
        accessKey: { permission: { receiverId: CONTRACT_ID, methodNames: SESSION_METHODS, allowance: SESSION_ALLOWANCE } },
      },
    }],
  });
  try { localStorage.setItem(keyName(account), kp.toString()); } catch { /* private mode: the wallet will be asked each time */ }
}

/** Call a game method with the session key (no popup); falls back to the wallet when there is none. */
export async function sessionCall<T>(account: string, method: string, args: Record<string, unknown>): Promise<T | undefined> {
  const k = storedKey(account);
  if (k && SESSION_METHODS.includes(method)) {
    const acc = new Account(account, provider, k);
    return (await acc.callFunction({ contractId: CONTRACT_ID, methodName: method, args, gas: BigInt(GAS) })) as unknown as T;
  }
  return returnValue<T>(await call(method, args));
}
