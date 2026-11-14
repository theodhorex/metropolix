// Independent re-computation of what the NEAR contract claims about a city and about $METRO.
// It mirrors contracts/metropolix/src/war.rs and coin.rs line by line, using the same rule tables the contract was
// generated from (see tests/contract-tables.test.ts). Integer maths only, so the answers must match to the digit.
// The /verify page runs this in the visitor's browser against raw chain data: nobody has to trust the indexer or us.
import { ARCS, BASE_WAGE, BUILDINGS, BUILDING_KINDS, LEVEL_PM, LEVEL_XP, MAX_BLD_LEVEL, TROOP_ATTACK, TROOP_DEFENSE } from './index';

const MAX_TAX = 30; // contract constant (tax permille ceiling used for the income bound)
const B = BUILDING_KINDS.map((k) => BUILDINGS[k]);
const pm = (v: number, m: number) => Math.floor((v * m) / 1000);

/** What a contract city view contains that the audit needs (a subset of chain-meta CityView, plus the full grid). */
export interface AuditedCity {
  owner: string; arc: number; xp: number; gold: number; army: [number, number, number];
  grid: number[]; levels: number[];
  level: number; buildings: number; econ_score: number; attack: number; defense: number; chain_power: number;
}

const levelAt = (grid: number[], levels: number[], i: number) =>
  grid[i] === 0 ? 0 : Math.min(MAX_BLD_LEVEL, Math.max(1, levels[i] ?? 1));
const weighted = (grid: number[], levels: number[], pick: (i: number) => number) => {
  let sum = 0;
  for (let i = 0; i < grid.length; i++) if (grid[i]) sum += pm(pick(grid[i]! - 1), LEVEL_PM[levelAt(grid, levels, i)]!);
  return sum;
};

export interface Recomputed {
  level: number; buildings: number; econ_score: number; attack: number; defense: number; chain_power: number;
  troopCap: number; gridValue: number; maxIncome: number;
}

export function recomputeCity(c: Pick<AuditedCity, 'arc' | 'xp' | 'army' | 'grid' | 'levels'>): Recomputed {
  const { grid, levels, arc } = c;
  const mods = ARCS[arc]!.mods;
  const gross = weighted(grid, levels, (k) => B[k]!.output ?? 0) + weighted(grid, levels, (k) => B[k]!.jobs ?? 0) * BASE_WAGE;
  const pop = weighted(grid, levels, (k) => B[k]!.housing ?? 0);
  const econ = pm(gross * 2 + Math.floor(pop / 2), mods.econPm);
  const troops = c.army[0] + c.army[1] + c.army[2];
  const attack = pm(troops * TROOP_ATTACK, mods.attackPm);
  const towers = weighted(grid, levels, (k) => B[k]!.defense ?? 0);
  const defense = pm(troops * TROOP_DEFENSE + towers, mods.defensePm);
  let level = 1;
  for (let i = 1; i < LEVEL_XP.length; i++) if (c.xp >= LEVEL_XP[i]!) level = i + 1;
  let gridValue = 0;
  for (let i = 0; i < grid.length; i++) {
    if (!grid[i]) continue;
    const lv = levelAt(grid, levels, i);
    gridValue += B[grid[i]! - 1]!.cost * (lv === 3 ? 7 : lv === 2 ? 3 : 1);
  }
  return {
    level, buildings: grid.filter((g) => g !== 0).length, econ_score: econ, attack, defense,
    chain_power: econ + attack + Math.floor((defense * 3) / 2),
    troopCap: weighted(grid, levels, (k) => B[k]!.troopCap ?? 0),
    gridValue, maxIncome: Math.floor((gross * MAX_TAX) / 10),
  };
}

/** Fields where the contract's answer differs from the recomputation (empty = the chain told the truth). */
export function diffCity(c: AuditedCity): string[] {
  const r = recomputeCity(c);
  const bad: string[] = [];
  for (const k of ['level', 'buildings', 'econ_score', 'attack', 'defense', 'chain_power'] as const) {
    if (r[k] !== c[k]) bad.push(`${k}: chain ${c[k]}, recomputed ${r[k]}`);
  }
  return bad;
}

// ---------- $METRO ----------
export function isqrt(n: bigint): bigint {
  if (n < 2n) return n;
  let x = BigInt(Math.floor(Math.sqrt(Number(n))));
  while (x * x > n) x--;
  while ((x + 1n) * (x + 1n) <= n) x++;
  return x;
}

const ONE = 10n ** 18n;
export interface CoinFacts {
  supply: string; metro_reserve: string; near_reserve: string; treasury: string; city_index: string; nav_k: string;
  nav: string; price: string; mnav_pm: string;
}
export interface CoinAudit { cityIndex: bigint; nav: bigint; price: bigint; mnavPm: bigint }

/** NAV = (treasury + Σ isqrt(gold of every saved city) · k) / supply; price = NEAR reserve / METRO reserve; mNAV = price / NAV. */
export function recomputeCoin(golds: number[], c: CoinFacts): CoinAudit {
  const cityIndex = golds.reduce((s, g) => s + isqrt(BigInt(g)), 0n);
  const supply = BigInt(c.supply);
  const nav = supply === 0n || cityIndex === 0n ? 0n : ((BigInt(c.treasury) + cityIndex * BigInt(c.nav_k)) * ONE) / supply;
  const price = BigInt(c.metro_reserve) === 0n ? 0n : (BigInt(c.near_reserve) * ONE) / BigInt(c.metro_reserve);
  return { cityIndex, nav, price, mnavPm: nav === 0n ? 0n : (price * 1000n) / nav };
}
