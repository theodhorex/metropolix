// Audit tests (15 Nov): hostile arguments must never corrupt the state (NaN, fractions, negatives),
// and random play must keep every invariant. Each `it` below pins one fixed bug.
import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import * as sim from '../src';

const rich = (seed = 1) => { const s = sim.newState(seed); sim.chooseArc(s, 'elf'); s.gold = 99999; s.xp = 99999; s.wood = 9999; s.ore = 9999; return s; };

/** Every number in the live state is a finite, non-negative whole number where it must be. */
function sane(s: sim.GameState): string | null {
  for (const k of ['gold', 'pop', 'troops', 'wood', 'ore', 'food', 'xp', 'trophies', 'siege'] as const) {
    const v = s[k] as number;
    if (!Number.isFinite(v) || v < 0 || !Number.isInteger(v)) return `${k}=${v}`;
  }
  for (const [k, v] of Object.entries(s.goods)) if (!Number.isInteger(v) || v < 0) return `goods.${k}=${v}`;
  for (const [k, v] of Object.entries(s.army)) if (!Number.isInteger(v) || v < 0) return `army.${k}=${v}`;
  for (const [k, v] of Object.entries(s.spells)) if (!Number.isInteger(v) || v < 0) return `spells.${k}=${v}`;
  for (const [k, v] of Object.entries(s.inventory)) if (!Number.isInteger(v) || (v as number) < 0) return `inventory.${k}=${v}`;
  for (const [k, v] of Object.entries(s.vault)) if (!Number.isInteger(v) || v < 0) return `vault.${k}=${v}`;
  for (const [k, v] of Object.entries(s.post)) if (!Number.isInteger(v) || v < 0) return `post.${k}=${v}`;
  if (s.army.vanguard + s.army.raider + s.army.breaker !== s.troops) return `army sum ${s.army.vanguard + s.army.raider + s.army.breaker} != troops ${s.troops}`;
  for (const l of s.market) if (!Number.isInteger(l.qty) || l.qty < 1 || !Number.isInteger(l.price) || l.price < 1) return `listing ${l.id} qty=${l.qty} price=${l.price}`;
  for (const o of s.orders) if (!Number.isInteger(o.qty) || o.qty < 1 || !Number.isInteger(o.price) || o.price < 1) return `order ${o.id} qty=${o.qty} price=${o.price}`;
  return null;
}

const BAD = [NaN, Infinity, -Infinity, -1, 0, 0.5, 1.5, 2.7, 1e9];

describe('hostile arguments', () => {
  it.each(BAD)('buyListing(amount=%s) never corrupts gold or stock', (amount) => {
    const s = rich();
    sim.listForSale(s, 'wood', 5, 3);
    const mine = s.market.find((l) => l.seller === 'you')!;
    // buy an NPC listing of a resource
    const npc = s.market.find((l) => l.seller !== 'you')!;
    sim.buyListing(s, npc.id, amount);
    expect(sane(s)).toBeNull();
    expect(mine.qty).toBe(5);
  });

  it.each(BAD)('fillOrder(amount=%s) never corrupts gold or stock', (amount) => {
    const s = rich();
    const o = s.orders.find((x) => x.buyer !== 'you')!;
    sim.addStock(s, o.kind, 50);
    sim.fillOrder(s, o.id, amount);
    expect(sane(s)).toBeNull();
  });

  it.each(BAD)('trainRole(n=%s) never gives fractional or NaN troops', (n) => {
    const s = rich();
    sim.build(s, 0, 0, 'barracks');
    sim.trainRole(s, 'raider', n);
    expect(sane(s)).toBeNull();
    sim.trainTroops(s, n);
    expect(sane(s)).toBeNull();
  });

  it.each(BAD)('launchRaid(commit=%s) never corrupts the state', (commit) => {
    const s = rich();
    sim.build(s, 0, 0, 'barracks');
    sim.trainRole(s, 'vanguard', 5);
    const id = s.world.mayors[0]!.id;
    sim.launchRaid(s, id, { commit, focus: 'balanced', rage: false, heal: false, ram: false });
    expect(sane(s)).toBeNull();
    sim.previewRaid(s, s.world.mayors[1]!.id, { commit, focus: 'loot', rage: true, heal: true, ram: true });
  });

  it.each(BAD)('postBuy/postSell/placeOrder/listForSale reject n=%s', (n) => {
    const s = rich();
    const before = JSON.stringify([s.gold, s.wood, s.market.length, s.orders.length]);
    sim.postBuy(s, 'wood', n); sim.postSell(s, 'wood', n);
    expect(sane(s)).toBeNull();
    sim.placeOrder(s, 'wood', n, 2); sim.placeOrder(s, 'wood', 2, n);
    expect(sane(s)).toBeNull();
    sim.listForSale(s, 'wood', n, 5); sim.listForSale(s, 'wood', 5, n);
    expect(sane(s)).toBeNull();
    void before;
  });
});

describe('random play keeps the state sane', () => {
  const num = fc.oneof(fc.integer({ min: -3, max: 45 }), fc.constantFrom(NaN, 1.5, 1e9, Infinity));
  const kind = fc.constantFrom(...sim.BUILDING_KINDS);
  const res = fc.constantFrom(...sim.RESOURCE_KINDS);
  const action = fc.oneof(
    fc.tuple(fc.constant('build'), num, num, kind),
    fc.tuple(fc.constant('demolish'), num, num),
    fc.tuple(fc.constant('pack'), num, num),
    fc.tuple(fc.constant('upgrade'), num, num),
    fc.tuple(fc.constant('train'), fc.constantFrom('vanguard', 'raider', 'breaker'), num),
    fc.tuple(fc.constant('raid'), fc.integer({ min: 0, max: 20 }), num),
    fc.tuple(fc.constant('list'), res, num, num),
    fc.tuple(fc.constant('buy'), fc.integer({ min: 1, max: 60 }), num),
    fc.tuple(fc.constant('order'), res, num, num),
    fc.tuple(fc.constant('fill'), fc.integer({ min: 1, max: 60 }), num),
    fc.tuple(fc.constant('post'), res, num, fc.boolean()),
    fc.tuple(fc.constant('cancel'), fc.integer({ min: 1, max: 60 })),
    fc.tuple(fc.constant('spell'), fc.constantFrom('rage', 'heal')),
    fc.tuple(fc.constant('ram')),
    fc.tuple(fc.constant('tax'), num),
    fc.tuple(fc.constant('tick'), fc.integer({ min: 1, max: 200 })),
  );
  it('1500 random actions never break an invariant', () => {
    fc.assert(fc.property(fc.integer({ min: 1, max: 1e6 }), fc.array(action, { minLength: 20, maxLength: 120 }), (seed, acts) => {
      const s = sim.newState(seed); sim.chooseArc(s, sim.ARCS[seed % sim.ARCS.length]!.id);
      s.gold = 20000; s.xp = 5000; s.wood = 500; s.ore = 500; s.food = 500;
      for (const a of acts as unknown as unknown[][]) {
        switch (a[0]) {
          case 'build': sim.build(s, a[1] as number, a[2] as number, a[3] as sim.BuildingKind); break;
          case 'demolish': sim.demolish(s, a[1] as number, a[2] as number); break;
          case 'pack': sim.packUp(s, a[1] as number, a[2] as number); break;
          case 'upgrade': sim.upgradeBuilding(s, a[1] as number, a[2] as number); break;
          case 'train': sim.trainRole(s, a[1] as sim.Role, a[2] as number); break;
          case 'raid': sim.launchRaid(s, s.world.mayors[(a[1] as number) % s.world.mayors.length]!.id, { commit: a[2] as number, focus: 'loot', rage: true, heal: true, ram: true }); break;
          case 'list': sim.listForSale(s, a[1] as sim.ResourceKind, a[2] as number, a[3] as number); break;
          case 'buy': { const l = s.market[(a[1] as number) % Math.max(1, s.market.length)]; if (l) sim.buyListing(s, l.id, a[2] as number); break; }
          case 'order': sim.placeOrder(s, a[1] as sim.ResourceKind, a[2] as number, a[3] as number); break;
          case 'fill': { const o = s.orders[(a[1] as number) % Math.max(1, s.orders.length)]; if (o) { sim.addStock(s, o.kind, 5); sim.fillOrder(s, o.id, a[2] as number); } break; }
          case 'post': if (a[3]) sim.postBuy(s, a[1] as sim.ResourceKind, a[2] as number); else sim.postSell(s, a[1] as sim.ResourceKind, a[2] as number); break;
          case 'cancel': { sim.cancelListing(s, a[1] as number); sim.cancelOrder(s, a[1] as number); break; }
          case 'spell': sim.brewSpell(s, a[1] as 'rage' | 'heal'); break;
          case 'ram': sim.buildRam(s); break;
          case 'tax': sim.setTax(s, a[1] as number); break;
          case 'tick': for (let i = 0; i < (a[1] as number); i++) sim.step(s); break;
        }
        const bad = sane(s);
        if (bad) throw new Error(`${bad} after ${JSON.stringify(a)}`);
      }
    }), { numRuns: Number(process.env.AUDIT_RUNS ?? 150) });
  }, 120_000);
});

describe('no gold from the market', () => {
  it('an order that fills can never be resold to buyers for more than it cost', () => {
    for (const k of [...sim.RESOURCE_KINDS, ...sim.RELIC_KINDS, ...sim.TRADE_KINDS] as sim.ItemKind[]) {
      const f = sim.fairPrice(k);
      const cheapestFill = Math.ceil((f * sim.orderFloorPct(k)) / 100);
      const bestResale = Math.floor((f * sim.buyerCapPct(k)) / 100);
      expect(bestResale, k).toBeLessThanOrEqual(cheapestFill);
    }
  });
  it('a lowball relic order stays open', () => {
    const s = rich(); s.xp = 99999;
    const k: sim.ItemKind = 'cog';
    expect(sim.placeOrder(s, k, 1, Math.ceil(sim.fairPrice(k) * 0.9)).ok).toBe(true);
    for (let i = 0; i < 20000; i++) sim.tradeStep(Object.assign(s, { tick: i + 1 }));
    expect(s.orders.some((o) => o.buyer === 'you')).toBe(true);
  });
});
