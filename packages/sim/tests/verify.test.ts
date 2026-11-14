// Fixtures are raw `get_cities(full)` and `get_coin` answers from metropolix.testnet (15 Nov 2026).
// The independent recomputation must agree with the deployed Rust contract to the digit.
import { describe, it, expect } from 'vitest';
import cities from './fixtures/chain-cities.json';
import coin from './fixtures/chain-coin.json';
import { diffCity, isqrt, recomputeCity, recomputeCoin, type AuditedCity } from '../src/verify';

describe('recomputation matches the deployed contract', () => {
  it('every saved city: level, buildings, econ, attack, defense, ChainPower', () => {
    expect(cities.length).toBeGreaterThan(0);
    for (const c of cities as unknown as AuditedCity[]) expect(diffCity(c), c.owner).toEqual([]);
  });
  it('$METRO: city index, NAV, price and mNAV', () => {
    const r = recomputeCoin((cities as { gold: number }[]).map((c) => c.gold), coin);
    expect(r.cityIndex.toString()).toBe(coin.city_index);
    expect(r.nav.toString()).toBe(coin.nav);
    expect(r.price.toString()).toBe(coin.price);
    expect(r.mnavPm.toString()).toBe(coin.mnav_pm);
  });
  it('flags a lying contract', () => {
    const c = { ...(cities[0] as unknown as AuditedCity), chain_power: 1 };
    expect(diffCity(c)).toHaveLength(1);
  });
  it('isqrt is exact', () => {
    expect(isqrt(0n)).toBe(0n); expect(isqrt(15n)).toBe(3n); expect(isqrt(16n)).toBe(4n); expect(isqrt(10n ** 30n)).toBe(10n ** 15n);
  });
  it('a tampered grid changes the recomputed power', () => {
    const c = cities[1] as unknown as AuditedCity;
    const g = c.grid.slice(); g.fill(0);
    expect(recomputeCity({ ...c, grid: g }).econ_score).toBe(0);
  });
});
