import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import * as sim from '../src';

const rich = (seed = 1) => { const s = sim.newState(seed); s.gold = 99999; s.xp = 99999; s.wood = 9999; s.ore = 9999; return s; };

describe('building rules', () => {
  it('needs gold and a free tile', () => {
    const s = sim.newState(); s.gold = 50;
    expect(sim.build(s, 0, 0, 'house').ok).toBe(false);
    s.gold = 1000;
    expect(sim.build(s, 0, 0, 'house').ok).toBe(true);
    expect(sim.build(s, 0, 0, 'house').ok).toBe(false);
    expect(sim.build(s, -1, 0, 'house').ok).toBe(false);
  });
  it('demolish refunds 40%', () => {
    const s = sim.newState(); s.xp = 99999; sim.build(s, 1, 1, 'factory'); const g = s.gold;
    expect(sim.demolish(s, 1, 1).ok).toBe(true);
    expect(s.gold - g).toBe(160);
  });
});

describe('economy', () => {
  it('higher tax lowers happiness', () => {
    const s = rich(); s.pop = 10; sim.build(s, 0, 0, 'house');
    s.taxRate = 10; const a = sim.stats(s).happinessPm;
    s.taxRate = 25; expect(sim.stats(s).happinessPm).toBeLessThan(a);
  });
  it('schools raise productivity', () => {
    const s = rich(); s.pop = 40; sim.build(s, 0, 0, 'house'); sim.build(s, 1, 0, 'factory');
    const p = sim.stats(s).productivityPm;
    sim.build(s, 2, 0, 'school');
    expect(sim.stats(s).productivityPm).toBeGreaterThan(p);
  });
  it('population grows with housing and jobs', () => {
    const s = rich(); sim.build(s, 0, 0, 'house'); sim.build(s, 1, 0, 'house'); sim.build(s, 2, 0, 'farm');
    for (let i = 0; i < 120; i++) sim.step(s);
    expect(s.pop).toBeGreaterThan(0);
  });
});

describe('military', () => {
  it('no barracks, no troops, no attack', () => {
    const s = sim.newState();
    expect(sim.trainTroops(s).ok).toBe(false);
    expect(sim.attackRival(s, 'r1').ok).toBe(false);
  });
  it('troops raise chainpower and beat a weak rival', () => {
    const s = rich(); sim.build(s, 0, 0, 'barracks'); const cp = sim.stats(s).chainPower;
    sim.trainTroops(s, 20);
    expect(sim.stats(s).chainPower).toBeGreaterThan(cp);
    s.troops = 100;
    const r = sim.attackRival(s, 'r1');
    expect(r.ok && r.win).toBe(true);
  });
  it('strong defense holds against a raid', () => {
    const s = sim.newState(); s.troops = 500; s.tick = 200; s.nextRaidTick = 200;
    sim.step(s);
    expect(s.log[0]).toContain('held');
  });
});

describe('determinism and invariants', () => {
  const action = fc.oneof(
    fc.record({ t: fc.constant('build' as const), x: fc.integer({ min: 0, max: sim.GRID - 1 }), y: fc.integer({ min: 0, max: sim.GRID - 1 }), k: fc.constantFrom(...sim.BUILDING_KINDS) }),
    fc.record({ t: fc.constant('train' as const), n: fc.integer({ min: 1, max: 5 }) }),
    fc.record({ t: fc.constant('attack' as const), id: fc.constantFrom('r1', 'r2', 'r3', 'r4') }),
    fc.record({ t: fc.constant('tax' as const), v: fc.integer({ min: 0, max: 30 }) }),
    fc.record({ t: fc.constant('wait' as const), n: fc.integer({ min: 1, max: 40 }) }),
  );
  type Act = typeof action extends fc.Arbitrary<infer T> ? T : never;
  const run = (seed: number, acts: Act[]) => {
    const s = sim.newState(seed);
    for (const a of acts) {
      if (a.t === 'build') sim.build(s, a.x, a.y, a.k);
      else if (a.t === 'train') sim.trainTroops(s, a.n);
      else if (a.t === 'attack') sim.attackRival(s, a.id);
      else if (a.t === 'tax') sim.setTax(s, a.v);
      else for (let i = 0; i < a.n; i++) sim.step(s);
    }
    return s;
  };

  it('same seed and actions give identical state', () => {
    fc.assert(fc.property(fc.integer(), fc.array(action, { maxLength: 40 }), (seed, acts) => {
      expect(run(seed, acts)).toEqual(run(seed, acts));
    }), { numRuns: 100 });
  });
  it('state stays valid: integers, no negatives', () => {
    fc.assert(fc.property(fc.integer(), fc.array(action, { maxLength: 40 }), (seed, acts) => {
      const s = run(seed, acts);
      const st = sim.stats(s);
      for (const v of [s.gold, s.pop, s.troops, st.chainPower, st.net]) expect(Number.isInteger(v)).toBe(true);
      expect(s.gold).toBeGreaterThanOrEqual(0);
      expect(s.pop).toBeGreaterThanOrEqual(0);
      expect(s.troops).toBeGreaterThanOrEqual(0);
      expect(s.pop).toBeLessThanOrEqual(st.housing);
    }), { numRuns: 100 });
  });
});

describe('levels, shop and marketplace', () => {
  it('level rises with xp and locks buildings', () => {
    const s = sim.newState(); s.gold = 99999;
    expect(sim.levelFromXp(0)).toBe(1);
    expect(sim.levelFromXp(60)).toBe(2);
    expect(sim.build(s, 0, 0, 'barracks').ok).toBe(false); // needs level 3
    s.xp = 180;
    expect(sim.build(s, 0, 0, 'barracks').ok).toBe(true);
  });
  it('building grants xp and can level up', () => {
    const s = sim.newState(); s.gold = 99999;
    for (let i = 0; i < 6; i++) sim.build(s, i, 0, 'house'); // 6 x 10 xp
    expect(s.xp).toBe(60);
    expect(sim.stats(s).level).toBe(2);
  });
  it('buy from market goes to inventory and is placed for free', () => {
    const s = sim.newState(); s.gold = 99999; s.xp = 99999;
    const l = s.market.find((x) => !sim.isResource(x.kind))!; const kind = l.kind as sim.BuildingKind; const price = l.price;
    const g = s.gold;
    expect(sim.buyListing(s, l.id).ok).toBe(true);
    expect(g - s.gold).toBe(price);
    expect(s.inventory[kind]).toBe(1);
    const g2 = s.gold;
    expect(sim.build(s, 0, 0, kind).ok).toBe(true);
    expect(s.gold).toBe(g2);
    expect(s.inventory[kind]).toBe(0);
  });
  it('list, cancel and cannot buy own listing', () => {
    const s = sim.newState(); s.inventory.house = 2;
    expect(sim.listForSale(s, 'house', 3, 100).ok).toBe(false);
    expect(sim.listForSale(s, 'house', 2, 90).ok).toBe(true);
    const mine = s.market.find((l) => l.seller === sim.YOU)!;
    expect(sim.buyListing(s, mine.id).ok).toBe(false);
    expect(sim.cancelListing(s, mine.id).ok).toBe(true);
    expect(s.inventory.house).toBe(2);
  });
  it('rejects silly prices', () => {
    const s = sim.newState(); s.inventory.house = 1;
    expect(sim.listForSale(s, 'house', 1, 0).ok).toBe(false);
    expect(sim.listForSale(s, 'house', 1, 100000).ok).toBe(false);
  });
});

describe('building descriptions follow the level', () => {
  it('level 1 text matches the catalog for every building', () => {
    for (const k of Object.keys(sim.BUILDINGS) as sim.BuildingKind[]) expect(sim.describeBuilding(k, 1)).toBe(sim.BUILDINGS[k].desc);
  });
  it('numbers grow with the level', () => {
    expect(sim.describeBuilding('barracks', 2)).toBe('Trains up to 30 troops');
    expect(sim.describeBuilding('barracks', 3)).toBe('Trains up to 40 troops');
    expect(sim.describeBuilding('house', 3)).toBe('Houses 20 citizens');
    expect(sim.describeBuilding('tower', 2)).toBe('+60 defense');
    expect(sim.describeBuilding('farm', 2)).toBe('Grows food for 240 citizens');
  });
  it('text without numbers and bad levels stay safe', () => {
    expect(sim.describeBuilding('park', 3)).toBe(sim.BUILDINGS.park.desc);
    expect(sim.describeBuilding('barracks', 99)).toBe('Trains up to 40 troops');
    expect(sim.describeBuilding('barracks', 0)).toBe('Trains up to 20 troops');
  });
});

describe('players query', () => {
  const rows = sim.generatePlayers(42, 40);
  it('is deterministic with unique names', () => {
    expect(sim.generatePlayers(42, 40)).toEqual(rows);
    expect(new Set(rows.map((r) => r.name)).size).toBe(rows.length);
  });
  it.each(['wealth', 'chainPower', 'level'] as const)('sorts by %s both directions', (sort) => {
    const d = sim.queryPlayers(rows, { ...sim.DEFAULT_QUERY, sort, dir: 'desc' });
    const a = sim.queryPlayers(rows, { ...sim.DEFAULT_QUERY, sort, dir: 'asc' });
    for (let i = 1; i < d.length; i++) expect(d[i - 1]![sort]).toBeGreaterThanOrEqual(d[i]![sort]);
    for (let i = 1; i < a.length; i++) expect(a[i - 1]![sort]).toBeLessThanOrEqual(a[i]![sort]);
  });
  it('sorts by name asc and desc', () => {
    const a = sim.queryPlayers(rows, { ...sim.DEFAULT_QUERY, sort: 'name', dir: 'asc' }).map((r) => r.name);
    const d = sim.queryPlayers(rows, { ...sim.DEFAULT_QUERY, sort: 'name', dir: 'desc' }).map((r) => r.name);
    expect(d).toEqual([...a].reverse());
  });
  it('filters by search and min level', () => {
    const lv = sim.queryPlayers(rows, { ...sim.DEFAULT_QUERY, minLevel: 4 });
    expect(lv.every((r) => r.level >= 4)).toBe(true);
    const name = rows[3]!.name.slice(0, 3).toLowerCase();
    expect(sim.queryPlayers(rows, { ...sim.DEFAULT_QUERY, search: name }).every((r) => r.name.toLowerCase().includes(name))).toBe(true);
  });
  it('ranks ties equally', () => {
    const t = sim.ranked([
      { id: 'a', name: 'A', level: 1, wealth: 5, chainPower: 1, simulated: true },
      { id: 'b', name: 'B', level: 1, wealth: 5, chainPower: 1, simulated: true },
      { id: 'c', name: 'C', level: 1, wealth: 1, chainPower: 1, simulated: true },
    ], 'wealth');
    expect(t.map((r) => r.rank)).toEqual([1, 1, 3]);
  });
});

describe('arcs, resource and decorations', () => {
  it('arc is chosen once and is permanent', () => {
    const s = sim.newState();
    expect(sim.chooseArc(s, 'dragon').ok).toBe(true);
    expect(sim.chooseArc(s, 'elf').ok).toBe(false);
    expect(s.arc).toBe('dragon');
  });
  it('arcs change attack, defense and soldier cost', () => {
    const mk = (arc: sim.ArcId) => { const s = sim.newState(); s.xp = 99999; s.gold = 99999; s.wood = 999; s.ore = 999; sim.chooseArc(s, arc); sim.build(s, 0, 0, 'barracks'); sim.build(s, 1, 0, 'tower'); sim.trainTroops(s, 10); return s; };
    const dragon = sim.stats(mk('dragon')), elf = sim.stats(mk('elf')), caveman = sim.stats(mk('caveman'));
    expect(dragon.attack).toBeGreaterThan(elf.attack);
    expect(elf.defense).toBeGreaterThan(dragon.defense);
    expect(caveman.troopCost).toBeLessThan(dragon.troopCost);
  });
  it('training needs ore', () => {
    const s = sim.newState(); s.xp = 99999; s.gold = 99999; s.ore = 20; sim.chooseArc(s, 'goblin'); sim.build(s, 0, 0, 'barracks'); // barracks eats 20 ore
    expect(s.ore).toBe(0);
    expect(sim.trainTroops(s, 3).ok).toBe(false);
    s.ore = 4;
    const ok = sim.trainTroops(s, 3);
    expect(ok.ok && ok.n).toBe(2);
    expect(s.ore).toBe(0);
  });
  it('buildings cost wood or ore on top of gold', () => {
    const s = sim.newState(); s.gold = 99999; s.wood = 3;
    expect(sim.build(s, 0, 0, 'house').ok).toBe(false); // needs 4 wood
    s.wood = 4;
    expect(sim.build(s, 0, 0, 'house').ok).toBe(true);
    expect(s.wood).toBe(0);
  });
  it('arcs differ in how much wood and ore they dig', () => {
    const rate = (arc: sim.ArcId) => { const s = sim.newState(); s.xp = 99999; s.gold = 99999; s.wood = 999; s.ore = 999; sim.chooseArc(s, arc);
      for (let i = 0; i < 5; i++) { sim.build(s, i, 0, 'house'); }
      for (let i = 0; i < 5; i++) { sim.build(s, i, 1, 'lumber'); sim.build(s, i, 2, 'mine'); }
      s.pop = 50; return sim.stats(s); };
    const elf = rate('elf'), dragon = rate('dragon');
    expect(elf.woodRate).toBeGreaterThan(elf.oreRate);
    expect(dragon.oreRate).toBeGreaterThan(elf.oreRate);
    expect(dragon.woodRate).toBe(0);
  });
  it('dragons cannot build lumber camps, but elves can', () => {
    const d = sim.newState(); d.gold = 99999; d.ore = 99; sim.chooseArc(d, 'dragon');
    const r = sim.build(d, 0, 0, 'lumber');
    expect(r.ok).toBe(false);
    const e = sim.newState(); e.gold = 99999; e.ore = 99; sim.chooseArc(e, 'elf');
    expect(sim.build(e, 0, 0, 'lumber').ok).toBe(true);
  });
  it('resources can be bought and sold on the market', () => {
    const s = sim.newState(); s.gold = 1000; s.wood = 0;
    s.market.push({ id: 900, seller: 'Aria', kind: 'wood', qty: 20, price: 4 });
    expect(sim.buyListing(s, 900, 10).ok).toBe(true);
    expect(s.wood).toBe(10); expect(s.gold).toBe(960);
    expect(sim.listForSale(s, 'wood', 4, 4).ok).toBe(true);
    expect(s.wood).toBe(6);
    expect(sim.listForSale(s, 'ore', 999, 6).ok).toBe(false);
  });
  it('decorations add happiness but no economy', () => {
    const s = sim.newState(); s.xp = 99999; s.gold = 99999; s.pop = 10; sim.build(s, 0, 0, 'house');
    const h = sim.stats(s).happinessPm;
    sim.build(s, 1, 0, 'fountain'); sim.build(s, 2, 0, 'statue');
    expect(sim.stats(s).happinessPm).toBeGreaterThan(h);
    expect(sim.BUILDING_KINDS.slice(0, 8)).toEqual(['house', 'farm', 'shop', 'factory', 'school', 'park', 'barracks', 'tower']);
  });
});

describe('city overview', () => {
  it('demand asks for homes in an empty city and returns bounded numbers', () => {
    const s = rich(); sim.chooseArc(s, 'elf');
    expect(sim.demand(s).residential).toBe(100);
    s.pop = 60; for (let i = 0; i < 3; i++) sim.build(s, i, 0, 'house');
    const d = sim.demand(s);
    for (const v of Object.values(d)) { expect(v).toBeGreaterThanOrEqual(-100); expect(v).toBeLessThanOrEqual(100); }
  });
  it('wealth tiers sum to the population', () => {
    const s = rich(); s.pop = 100; const w = sim.wealthTiers(s);
    expect(w.poor + w.middle + w.rich).toBe(100);
  });
  it('tax curve shows happiness falling as tax rises', () => {
    const s = rich(); s.pop = 20; sim.build(s, 0, 0, 'house');
    const c = sim.taxCurve(s);
    expect(c[0]!.happinessPm).toBeGreaterThanOrEqual(c[6]!.happinessPm);
  });
});

describe('war room', () => {
  const army = () => { const s = rich(); sim.chooseArc(s, 'goblin'); for (let i = 0; i < 6; i++) sim.build(s, i, 0, 'barracks'); return s; };
  it('trains roles and keeps army equal to troops', () => {
    const s = army();
    expect(sim.trainRole(s, 'raider', 5).ok).toBe(true);
    expect(sim.trainTroops(s, 3).ok).toBe(true);
    expect(s.army.raider + s.army.vanguard + s.army.breaker).toBe(s.troops);
  });
  it('raid pays more with raiders, and breakers beat towers', () => {
    const mk = (role: sim.Role) => { const s = army(); sim.trainRole(s, role, 40); return s; };
    const plan = { commit: 100, focus: 'balanced' as const, rage: false, heal: false, ram: false };
    const lootR = sim.previewRaid(mk('raider'), 'r1', plan)!;
    const lootV = sim.previewRaid(mk('vanguard'), 'r1', plan)!;
    expect(lootR.loot).toBeGreaterThan(lootV.loot);
    const brk = sim.previewRaid(mk('breaker'), 'r3', plan)!, van = sim.previewRaid(mk('vanguard'), 'r3', plan)!;
    expect(brk.effDefense).toBeLessThan(van.effDefense);
  });
  it('launching a raid consumes spells, applies loot and cooldown', () => {
    const s = army(); sim.trainRole(s, 'raider', 40); sim.brewSpell(s, 'rage');
    const g = s.gold;
    const res = sim.launchRaid(s, 'r1', { commit: 100, focus: 'loot', rage: true, heal: false, ram: false });
    expect(res.ok).toBe(true);
    expect(s.spells.rage).toBe(0);
    expect(s.gold).toBeGreaterThanOrEqual(g);
    expect(s.army.raider + s.army.vanguard + s.army.breaker).toBe(s.troops);
    expect(sim.launchRaid(s, 'r1', { commit: 100, focus: 'loot', rage: false, heal: false, ram: false }).ok).toBe(false);
  });
  it('heroes unlock by level and defense plan applies', () => {
    const s = sim.newState();
    expect(sim.toggleHero(s, 'warlord').ok).toBe(false);
    s.xp = 99999;
    expect(sim.toggleHero(s, 'warlord').ok).toBe(true);
    expect(sim.setDefPlan(s, 'vault').ok).toBe(true);
  });
  it('scouting is deterministic', () => {
    expect(JSON.stringify(sim.scout(sim.RIVALS[2]!))).toBe(JSON.stringify(sim.scout(sim.RIVALS[2]!)));
  });
});

describe('npc encounters', () => {
  it('offers chat plus extras and is deterministic for a seed', () => {
    const a = rich(5), b = rich(5);
    sim.chooseArc(a, 'elf'); sim.chooseArc(b, 'elf');
    const ea = sim.npcEncounter(a, 2), eb = sim.npcEncounter(b, 2);
    expect(ea).toEqual(eb);
    expect(ea.options[0]!.id).toBe('chat');
    expect(ea.options.length).toBeGreaterThanOrEqual(2);
  });
  it('actions change gold and resources as described', () => {
    const s = rich(); sim.chooseArc(s, 'goblin');
    const g = s.gold; sim.npcAct(s, 'tip');
    expect(s.gold).toBeLessThanOrEqual(g + 30);
    const w = s.wood; sim.npcAct(s, 'buy');
    expect(s.wood).toBe(w + 12); // goblins are short of wood, so they buy wood
    const d = rich(); sim.chooseArc(d, 'dragon');
    const o = d.ore; sim.npcAct(d, 'buy');
    expect(d.ore).toBe(o + 7); // dragons build in stone, so they buy ore
  });
  it('cannot spend gold you do not have', () => {
    const s = sim.newState(); s.gold = 0;
    expect(sim.npcAct(s, 'tip')).toMatch(/afford/);
    expect(s.gold).toBe(0);
  });
});

describe('food, special goods and the second-wave buildings', () => {
  it('every race makes a different special good, and each good is needed by some building', () => {
    const goods = sim.ARCS.map((a) => a.good);
    expect(new Set(goods).size).toBe(sim.ARCS.length);
    for (const g of sim.GOOD_KINDS) expect(Object.values(sim.BUILDINGS).some((b) => (b.goodsCost?.[g] ?? 0) > 0)).toBe(true);
  });
  it('advanced buildings need foreign goods and spend them', () => {
    const s = rich(); s.arc = 'goblin';
    expect(sim.build(s, 0, 0, 'clinic').ok).toBe(false); // needs moonleaf
    s.goods.moonleaf = 5;
    expect(sim.build(s, 0, 0, 'clinic').ok).toBe(true);
    expect(s.goods.moonleaf).toBe(0);
  });
  it('workshops make the race good; farms feed citizens; hunger hurts', () => {
    const s = rich(); s.arc = 'dragon';
    sim.build(s, 0, 0, 'workshop'); sim.build(s, 1, 0, 'house'); s.pop = 4;
    for (let i = 0; i < 5; i++) sim.step(s);
    expect(s.goods.emberstone).toBeGreaterThan(0);
    const t = rich(); t.pop = 200; t.food = 0;
    for (let x = 0; x < 20; x++) sim.build(t, x, 1, 'house');
    const hungry = sim.stats(t);
    expect(hungry.hungry).toBe(true);
    t.food = 50;
    expect(sim.stats(t).happinessPm).toBeGreaterThan(hungry.happinessPm);
  });
});

describe('trading post and buy orders', () => {
  it('post buys dear, sells cheap, and runs out', () => {
    const s = rich(); s.gold = 1000;
    const buy = sim.postBuyPrice('spice'), sell = sim.postSellPrice('spice');
    expect(buy).toBeGreaterThan(sim.fairPrice('spice'));
    expect(sell).toBeLessThan(sim.fairPrice('spice'));
    expect(sim.postBuy(s, 'spice', 2).ok).toBe(true);
    expect(s.goods.spice).toBe(2); expect(s.gold).toBe(1000 - 2 * buy);
    expect(sim.postBuy(s, 'spice', 999).ok).toBe(false);
    expect(sim.postSell(s, 'spice', 1).ok).toBe(true);
    expect(s.gold).toBe(1000 - 2 * buy + sell);
  });
  it('your order holds gold in escrow and refunds on cancel', () => {
    const s = rich(); s.gold = 500;
    expect(sim.placeOrder(s, 'gears', 10, 15).ok).toBe(true);
    expect(s.gold).toBe(350);
    const o = s.orders.find((x) => x.buyer === sim.YOU)!;
    expect(sim.cancelOrder(s, o.id).ok).toBe(true);
    expect(s.gold).toBe(500);
  });
  it('fair orders fill over time, gold is never created', () => {
    const s = rich(); s.gold = 1000;
    sim.placeOrder(s, 'hides', 6, 12);
    const goldAfter = s.gold;
    for (let i = 0; i < 400; i++) sim.tradeStep(Object.assign(s, { tick: s.tick + 1 }));
    expect(s.goods.hides).toBe(6);
    expect(s.orders.some((x) => x.buyer === sim.YOU)).toBe(false);
    expect(s.gold).toBe(goldAfter);
  });
  it('filling another city order sells from stock at their price', () => {
    const s = rich();
    const o = s.orders.find((x) => x.buyer !== sim.YOU)!;
    const { qty, price } = o;
    sim.addStock(s, o.kind, qty);
    const before = s.gold;
    expect(sim.fillOrder(s, o.id, qty).ok).toBe(true);
    expect(s.gold).toBe(before + qty * price);
  });
  it('pack up moves a building into storage', () => {
    const s = rich(); sim.build(s, 3, 3, 'shop');
    expect(sim.packUp(s, 3, 3).ok).toBe(true);
    expect(s.grid[3]![3]).toBeNull(); expect(s.inventory.shop).toBe(1);
  });
  it('market and orders stay deterministic for a seed', () => {
    const run = () => { const s = sim.newState(9); for (let i = 0; i < 300; i++) sim.step(s); return JSON.stringify([s.market, s.orders, s.post]); };
    expect(run()).toBe(run());
  });
});

describe('buildBlocker', () => {
  it('is null exactly when build succeeds, and never changes state', () => {
    fc.assert(fc.property(
      fc.integer(), fc.constantFrom(...sim.BUILDING_KINDS), fc.integer({ min: -1, max: sim.GRID }), fc.integer({ min: -1, max: sim.GRID }),
      fc.nat(5000), fc.nat(40), fc.nat(40), fc.nat(3000),
      (seed, kind, x, y, gold, wood, ore, xp) => {
        const s = sim.newState(seed);
        sim.chooseArc(s, 'goblin');
        Object.assign(s, { gold, wood, ore, xp });
        const before = JSON.stringify(s);
        const why = sim.buildBlocker(s, x, y, kind);
        expect(JSON.stringify(s)).toBe(before);
        const r = sim.build(s, x, y, kind);
        expect(r.ok).toBe(why === null);
        if (!r.ok) expect(r.msg).toBe(why);
      }));
  });
});

describe('vault and relics', () => {
  const mines = (s: sim.GameState, n: number, kind: sim.BuildingKind = 'mine') => {
    let placed = 0;
    for (let y = 0; y < sim.GRID && placed < n; y++) for (let x = 0; x < sim.GRID && placed < n; x++) if (!s.grid[y]![x]) { s.grid[y]![x] = kind; placed++; }
  };
  it('a city with no source buildings never finds anything', () => {
    const s = sim.newState(4);
    for (let i = 0; i < 20000; i++) expect(sim.findStep(s)).toBeNull();
    expect(s.finds).toBe(0);
  });
  it('finds are deterministic for a seed and land in the vault', () => {
    const run = () => { const s = sim.newState(11); mines(s, 25); for (let i = 0; i < 20000; i++) sim.findStep(s); return JSON.stringify([s.vault, s.finds, s.lastFind, s.rng]); };
    expect(run()).toBe(run());
    const s = sim.newState(11); mines(s, 25);
    for (let i = 0; i < 20000; i++) sim.findStep(s);
    const total = Object.values(s.vault).reduce((a, b) => a + b, 0);
    expect(total).toBe(s.finds);
    expect(total).toBeGreaterThan(0);
    for (const k of sim.RELIC_KINDS) if (s.vault[k]) expect(sim.RELICS[k].source).toBe('mine');
  });
  it('rarer tiers turn up far less often, at about the stated odds', () => {
    const s = sim.newState(3); mines(s, 25);
    const seen: Record<sim.Rarity, number> = { rare: 0, epic: 0, legendary: 0, mythic: 0 };
    for (let i = 0; i < 1_000_000; i++) { const f = sim.findStep(s); if (f) seen[sim.RELICS[f.kind].rarity]++; }
    // 25 mines over 1M seconds: rare 25 x 1250 / 100M (312 expected), epic 25 x 300 (75), legendary 25 x 60 (15), mythic 25 x 8 (2)
    expect(seen.rare).toBeGreaterThan(260); expect(seen.rare).toBeLessThan(365);
    expect(seen.epic).toBeGreaterThan(45); expect(seen.epic).toBeLessThan(110);
    expect(seen.legendary).toBeGreaterThan(4); expect(seen.legendary).toBeLessThan(30);
    expect(seen.mythic).toBeLessThan(seen.legendary);
  }, 60_000); // a million game seconds: the odds are low on purpose
  it('only 25 of a building count toward the odds', () => {
    const a = sim.newState(5); mines(a, 25);
    const b = sim.newState(5); mines(b, 60);
    for (let i = 0; i < 5000; i++) { sim.findStep(a); sim.findStep(b); }
    expect(JSON.stringify(b.vault)).toBe(JSON.stringify(a.vault));
  });
  it('display holds three, one of each kind, and gives the bonus', () => {
    const s = rich();
    for (const k of ['kingsblade', 'sunengine', 'geode', 'amber'] as const) sim.addStock(s, k, 1);
    sim.addStock(s, 'kingsblade', 1);
    const atk = sim.cityMods(s).attackPm;
    expect(sim.displayRelic(s, 'kingsblade').ok).toBe(true);
    expect(sim.displayRelic(s, 'kingsblade').ok).toBe(false); // second copy cannot share the display
    expect(sim.cityMods(s).attackPm).toBe(Math.floor((atk * 1200) / 1000));
    expect(sim.displayRelic(s, 'geode').ok).toBe(true);
    expect(sim.stats(s).happyParts.find((p) => p.label === 'Relics on display')?.pm).toBe(30);
    expect(sim.displayRelic(s, 'sunengine').ok).toBe(true);
    expect(sim.displayRelic(s, 'amber').ok).toBe(false);
    expect(s.displayed.length).toBe(sim.DISPLAY_SLOTS);
    expect(sim.storeRelic(s, 'geode').ok).toBe(true);
    expect(s.vault.geode).toBe(1);
    expect(sim.displayRelic(s, 'voidheart').ok).toBe(false); // not owned
  });
  it('the crown pays 60% at once', () => {
    const s = rich(); s.gold = 0; sim.addStock(s, 'voidheart', 1);
    expect(sim.sellToCrown(s, 'voidheart').ok).toBe(true);
    expect(s.gold).toBe(24000); expect(s.vault.voidheart).toBe(0);
    expect(sim.sellToCrown(s, 'voidheart').ok).toBe(false);
  });
  it('relics trade on the market like any item, without level locks', () => {
    const s = rich(); s.xp = 0; sim.addStock(s, 'starmetal', 1);
    expect(sim.stockOf(s, 'starmetal')).toBe(1);
    expect(sim.listForSale(s, 'starmetal', 1, 7000).ok).toBe(true);
    expect(sim.stockOf(s, 'starmetal')).toBe(0);
    const mine = s.market.find((l) => l.seller === sim.YOU && l.kind === 'starmetal')!;
    expect(sim.cancelListing(s, mine.id).ok).toBe(true);
    expect(s.vault.starmetal).toBe(1);
    s.market.push({ id: s.nextListingId++, seller: 'Ironvale', kind: 'cog', qty: 1, price: 1800 });
    const l = s.market[s.market.length - 1]!;
    s.gold = 2000;
    expect(sim.buyListing(s, l.id).ok).toBe(true);
    expect(s.vault.cog).toBe(1); expect(s.gold).toBe(200);
    s.orders.push({ id: s.nextListingId++, buyer: 'Port Sable', kind: 'cog', qty: 1, price: 2000 });
    const o = s.orders[s.orders.length - 1]!;
    expect(sim.fillOrder(s, o.id, 1).ok).toBe(true);
    expect(s.vault.cog).toBe(0); expect(s.gold).toBe(2200);
  });
  it('a long game with relic offers and orders keeps every count whole and non-negative', () => {
    const s = sim.newState(21); mines(s, 10); mines(s, 10, 'workshop');
    for (let i = 0; i < 3000; i++) sim.step(s);
    for (const k of sim.RELIC_KINDS) { expect(Number.isInteger(s.vault[k])).toBe(true); expect(s.vault[k]).toBeGreaterThanOrEqual(0); }
    expect(Number.isFinite(s.gold)).toBe(true);
  });
});

describe('treasure chronicle', () => {
  it('remembers every treasure you have held, even after you sell it', () => {
    const s = rich(); s.gold = 0;
    expect(s.seen).toEqual([]);
    sim.addStock(s, 'tankard', 1);
    expect(s.seen).toEqual(['tankard']);
    sim.sellToCrown(s, 'tankard');
    expect(s.seen).toEqual(['tankard']);
    sim.addStock(s, 'tankard', 1);
    expect(s.seen).toEqual(['tankard']);
  });
  it('a find goes into the chronicle', () => {
    const s = sim.newState(8);
    for (let y = 0; y < 5; y++) for (let x = 0; x < 5; x++) s.grid[y]![x] = 'tavern';
    let f = null; for (let i = 0; i < 200000 && !f; i++) f = sim.findStep(s);
    expect(f).not.toBeNull();
    expect(s.seen).toContain(f!.kind);
    expect(sim.RELICS[f!.kind].source).toBe('tavern');
  });
});

describe('mayor names and profiles', () => {
  it('checks names', () => {
    expect(sim.checkName('  Kael   Ashborne ')).toEqual({ ok: true, name: 'Kael Ashborne' });
    expect(sim.checkName('ab').ok).toBe(false);
    expect(sim.checkName('x'.repeat(21)).ok).toBe(false);
    expect(sim.checkName('<script>').ok).toBe(false);
    expect(sim.checkName('1abc').ok).toBe(false);
    expect(sim.checkName('You').ok).toBe(false);
    expect(sim.checkName("Ser O'Malley-2").ok).toBe(true);
  });
  it('setName stores the clean name and logs it', () => {
    const s = sim.newState();
    expect(s.name).toBe('');
    expect(sim.setName(s, 'no').ok).toBe(false);
    expect(s.name).toBe('');
    expect(sim.setName(s, ' Lyra  Starfall').ok).toBe(true);
    expect(s.name).toBe('Lyra Starfall');
    expect(s.log[0]).toContain('Lyra Starfall');
  });
  it('simulated mayors get fantasy names and a stable profile', () => {
    const rows = sim.generatePlayers(2026, 40);
    expect(new Set(rows.map((r) => r.name)).size).toBe(40);
    for (const r of rows) { expect(r.name).toMatch(/^[A-Z][a-z]+ [A-Z][a-z]+$/); expect(r.arc).toBeDefined(); }
    const a = sim.simProfile(rows[3]!), b = sim.simProfile(rows[3]!);
    expect(a).toEqual(b);
    for (const r of rows) {
      const p = sim.simProfile(r);
      expect(p.displayed.length).toBeLessThanOrEqual(sim.DISPLAY_SLOTS);
      expect(new Set(p.displayed).size).toBe(p.displayed.length);
      expect(p.record.won + p.record.lost).toBeGreaterThanOrEqual(0);
      expect(p.title).toBe(sim.TITLES[r.level - 1]);
    }
  });
  it('your profile reads the live city and the battle record counts fights', () => {
    const s = rich(); s.name = 'Kael Ashborne'; s.troops = 50; s.army.vanguard = 50;
    sim.attackRival(s, 'r1');
    const p = sim.myProfile(s, s.name);
    expect(p.record.won + p.record.lost).toBe(1);
    expect(p.isYou).toBe(true); expect(p.name).toBe('Kael Ashborne');
    expect(p.wealth).toBe(Math.floor(s.gold));
  });
});

describe('building upgrades', () => {
  const lvl = () => { const s = rich(); s.xp = 99999; s.gold = 999999; s.wood = 9999; s.ore = 9999; return s; };
  it('costs gold and materials, needs the player level, and stops at level 3', () => {
    const s = lvl(); sim.build(s, 2, 2, 'house');
    const c2 = sim.upgradeCost('house', 2);
    expect(c2.gold).toBe(sim.BUILDINGS.house.cost * 2);
    const g = s.gold;
    expect(sim.upgradeBuilding(s, 2, 2).ok).toBe(true);
    expect(s.gold).toBe(g - c2.gold);
    expect(sim.buildingLevel(s, 2, 2)).toBe(2);
    expect(sim.upgradeBuilding(s, 2, 2).ok).toBe(true);
    expect(sim.buildingLevel(s, 2, 2)).toBe(3);
    expect(sim.upgradeBlocker(s, 2, 2)).toMatch(/highest/);
    const low = rich(); low.xp = 0; low.grid[1]![1] = 'barracks';
    expect(sim.upgradeBlocker(low, 1, 1)).toMatch(/Reach level/);
    const deco = lvl(); deco.grid[0]![0] = 'tree';
    expect(sim.upgradeBlocker(deco, 0, 0)).toMatch(/Decorations/);
    expect(sim.upgradeBlocker(deco, 5, 5)).toBe('Nothing here');
  });
  it('levels multiply what a building gives, upkeep grows slower', () => {
    const s = lvl(); s.pop = 0; sim.build(s, 0, 0, 'house'); sim.build(s, 1, 0, 'school');
    const a = sim.stats(s);
    sim.upgradeBuilding(s, 0, 0); sim.upgradeBuilding(s, 1, 0);
    const b = sim.stats(s);
    expect(b.housing).toBe(a.housing + 5); // 10 -> 15
    expect(b.edu).toBe(60);
    expect(b.upkeep).toBeLessThan(Math.floor((a.upkeep * 1500) / 1000) + 1);
  });
  it('barracks upgrades bring recruits and drill attack', () => {
    const s = lvl(); s.troops = 0; s.army = { vanguard: 0, raider: 0, breaker: 0 };
    sim.build(s, 3, 3, 'barracks');
    const atk = sim.cityMods(s).attackPm;
    const r = sim.upgradeBuilding(s, 3, 3);
    expect(r.ok && r.recruits).toBe(5);
    expect(s.troops).toBe(5); expect(s.army.vanguard).toBe(5);
    expect(sim.cityMods(s).attackPm).toBe(Math.floor((atk * 1060) / 1000));
    expect(sim.stats(s).troopCap).toBe(30);
    sim.upgradeBuilding(s, 3, 3);
    expect(s.troops).toBe(15);
    expect(sim.drillPm(s)).toBe(120);
  });
  it('recruits never exceed troop room', () => {
    const s = lvl(); sim.build(s, 3, 3, 'barracks'); s.troops = 29; s.army = { vanguard: 29, raider: 0, breaker: 0 };
    const r = sim.upgradeBuilding(s, 3, 3);
    expect(r.ok && r.recruits).toBe(1); expect(s.troops).toBe(30);
  });
  it('farm levels add kinds of food and happiness', () => {
    const s = lvl(); s.food = 999; sim.build(s, 4, 4, 'farm');
    expect(sim.foodTypes(s)).toEqual(['Grain']);
    expect(sim.stats(s).happyParts.find((p) => p.label === 'Varied food')).toBeUndefined();
    sim.upgradeBuilding(s, 4, 4);
    expect(sim.foodTypes(s)).toEqual(['Grain', 'Fruit']);
    sim.upgradeBuilding(s, 4, 4);
    expect(sim.foodTypes(s)).toEqual(['Grain', 'Fruit', 'Cheese']);
    expect(sim.stats(s).happyParts.find((p) => p.label === 'Varied food')?.pm).toBe(80);
  });
  it('demolish, pack up and rebuilding clear the level', () => {
    const s = lvl(); sim.build(s, 6, 6, 'shop'); sim.upgradeBuilding(s, 6, 6);
    expect(sim.packUp(s, 6, 6).ok).toBe(true);
    expect(s.levels['6,6']).toBeUndefined();
    sim.build(s, 6, 6, 'shop'); expect(sim.buildingLevel(s, 6, 6)).toBe(1);
    sim.upgradeBuilding(s, 6, 6); sim.demolish(s, 6, 6);
    expect(s.levels['6,6']).toBeUndefined();
  });
  it('an upgraded mine digs deeper for treasure', () => {
    const a = sim.newState(31), b = sim.newState(31);
    for (let x = 0; x < 10; x++) { a.grid[0]![x] = 'mine'; b.grid[0]![x] = 'mine'; b.levels[`${x},0`] = 3; }
    let fa = 0, fb = 0;
    for (let i = 0; i < 40000; i++) { if (sim.findStep(a)) fa++; if (sim.findStep(b)) fb++; }
    expect(fb).toBeGreaterThan(fa * 1.5);
  });
});

describe('name changes', () => {
  it('first name and first change are free, later changes cost gold', () => {
    const s = sim.newState(); s.gold = 1500;
    expect(sim.renameCost(s)).toBe(0);
    expect(sim.setName(s, 'Kael Ashborne').ok).toBe(true);
    expect(s.gold).toBe(1500); expect(s.nameChanges).toBe(0);
    expect(sim.renameCost(s)).toBe(0);
    expect(sim.setName(s, 'Kael Ashborne').ok).toBe(false); // same name is not a change
    expect(sim.setName(s, 'Lyra Starfall').ok).toBe(true);
    expect(s.gold).toBe(1500); expect(s.nameChanges).toBe(1);
    expect(sim.renameCost(s)).toBe(sim.RENAME_COST);
    expect(sim.setName(s, 'Mira Duskvale').ok).toBe(true);
    expect(s.gold).toBe(500); expect(s.name).toBe('Mira Duskvale');
    expect(sim.setName(s, 'Rhys Valcourt').ok).toBe(false); // 500 < 1000
    expect(s.name).toBe('Mira Duskvale'); expect(s.gold).toBe(500);
  });
});

describe('third wave buildings', () => {
  const rich = (arc: sim.ArcId = 'elf') => {
    const s = sim.newState(7); sim.chooseArc(s, arc);
    s.xp = 99_999; s.gold = 1e7; s.wood = 1e5; s.ore = 1e5;
    for (const g of sim.GOOD_KINDS) s.goods[g] = 1000;
    return s;
  };
  it('appends new kinds after the old 23 so chain codes stay stable', () => {
    expect(sim.BUILDING_KINDS.length).toBe(60);
    expect(sim.BUILDING_KINDS[22]).toBe('workshop');
    expect(new Set(sim.BUILDING_KINDS.map((k) => sim.BUILDINGS[k].name)).size).toBe(60);
  });
  it('every special good is needed by exactly three buildings', () => {
    for (const g of sim.GOOD_KINDS) expect(sim.BUILDING_KINDS.filter((k) => sim.BUILDINGS[k].goodsCost?.[g]).length).toBe(3);
  });
  it('a sawmill makes wood the same way lumber camps do, and dragons cannot build one', () => {
    const a = rich(), b = rich();
    expect(sim.build(a, 0, 0, 'lumber').ok).toBe(true); expect(sim.build(a, 1, 0, 'lumber').ok).toBe(true);
    expect(sim.build(b, 0, 0, 'sawmill').ok).toBe(true);
    // equal raw wood (2 camps x 4 = 1 sawmill x 8): rates differ only by productivity (smoke)
    expect(sim.stats(b).woodRate).toBeGreaterThan(0);
    const d = rich('dragon');
    expect(sim.buildBlocker(d, 0, 0, 'sawmill')).toMatch(/no forests/);
    expect(sim.build(d, 0, 0, 'smelter').ok).toBe(true);
    expect(sim.stats(d).oreRate).toBeGreaterThan(0);
  });
  it('a garden scrubs smoke but never below zero', () => {
    const s = rich();
    sim.build(s, 0, 0, 'factory');
    const before = sim.stats(s).pollution;
    sim.build(s, 1, 0, 'garden');
    expect(sim.stats(s).pollution).toBe(Math.max(0, before - 3));
    sim.build(s, 2, 0, 'garden'); sim.build(s, 3, 0, 'garden');
    expect(sim.stats(s).pollution).toBe(0);
  });
  it('armories raise attack, capped', () => {
    const s = rich();
    s.troops = 100;
    const base = sim.stats(s).attack;
    sim.build(s, 0, 0, 'armory');
    expect(sim.buildAtkPm(s)).toBe(40);
    expect(sim.stats(s).attack).toBeGreaterThan(base);
    for (let x = 1; x < 12; x++) sim.build(s, x, 0, 'armory');
    expect(sim.buildAtkPm(s)).toBe(sim.BUILD_ATK_CAP_PM);
  });
  it('wonders: own people only, one per city, never traded or upgraded', () => {
    const s = rich('elf');
    expect(sim.buildBlocker(s, 0, 0, 'stones')).toMatch(/Only the Cavemen/);
    expect(sim.build(s, 0, 0, 'moontree').ok).toBe(true);
    expect(sim.buildBlocker(s, 1, 0, 'moontree')).toMatch(/already has/);
    expect(sim.packUp(s, 0, 0).ok).toBe(true);
    expect(sim.buildBlocker(s, 1, 0, 'moontree')).toBeNull(); // the stored one can go back down
    expect(sim.listForSale(s, 'moontree', 1, 100).ok).toBe(false);
    expect(sim.placeOrder(s, 'stones', 1, 100).ok).toBe(false);
    const mythic = sim.RELIC_KINDS.find((k) => sim.RELICS[k].rarity === 'mythic')!;
    expect(sim.placeOrder(s, mythic, 1, sim.fairPrice(mythic)).ok).toBe(false); // never filled, so never escrowed
    expect(sim.canUpgrade('moontree')).toBe(false);
    for (let i = 0; i < 400; i++) { sim.addNpcListing(s); sim.addNpcOrder(s); }
    expect([...s.market, ...s.orders].some((l) => sim.isBuilding(l.kind) && sim.BUILDINGS[l.kind].arc)).toBe(false);
  });
  it('level 10 buildings can still be upgraded at the top player level', () => {
    expect(sim.upgradeCost('university', 2).needLevel).toBe(sim.MAX_LEVEL);
    expect(sim.upgradeCost('university', 3).needLevel).toBe(sim.MAX_LEVEL);
  });
});

describe('third wave descriptions', () => {
  it('level 1 text equals the plain desc, and numbers grow with the level', () => {
    for (const k of sim.BUILDING_KINDS) expect(sim.describeBuilding(k, 1)).toBe(sim.BUILDINGS[k].desc);
    expect(sim.describeBuilding('highrise', 3)).not.toBe(sim.BUILDINGS.highrise.desc);
  });
});

describe('market fits the land', () => {
  const woodKinds = sim.TRADE_KINDS.filter((k) => sim.BUILDINGS[k].wood);
  it('Dragonkin (no forests) are never offered or asked for wood buildings', () => {
    const s = sim.newState(7); sim.chooseArc(s, 'dragon');
    s.market = []; s.orders = [];
    for (let i = 0; i < 600; i++) { sim.addNpcListing(s); sim.addNpcOrder(s); s.market = []; s.orders = s.orders.slice(-1); }
    const seen: string[] = [];
    for (let i = 0; i < 600; i++) { sim.addNpcListing(s); sim.addNpcOrder(s); seen.push(s.market.at(-1)!.kind, s.orders.at(-1)!.kind); }
    expect(seen.some((k) => woodKinds.includes(k as sim.BuildingKind))).toBe(false);
    expect(sim.tradeKindsFor(s).length).toBe(sim.TRADE_KINDS.length - woodKinds.length);
  });
  it('peoples with forests still trade them', () => {
    const s = sim.newState(7); sim.chooseArc(s, 'elf');
    expect(sim.tradeKindsFor(s)).toEqual(sim.TRADE_KINDS);
    expect(woodKinds).toContain('sawmill');
    expect(woodKinds).toContain('lumber');
  });
});

describe('audit fixes (15 Nov)', () => {
  it('another city never bids more than another city asks for the same thing', () => {
    for (let seed = 1; seed <= 20; seed++) {
      const s = sim.newState(seed); sim.chooseArc(s, 'elf'); s.xp = 7000;
      for (let t = 0; t < 2000; t++) {
        sim.step(s);
        for (const o of s.orders) {
          if (o.buyer === sim.YOU) continue;
          expect(s.market.some((l) => l.seller !== sim.YOU && l.kind === o.kind && l.price <= o.price)).toBe(false);
        }
      }
    }
  });
  it('one lumber camp on poor land still makes wood over time', () => {
    const s = sim.newState(3); sim.chooseArc(s, 'goblin');
    s.gold = 5000; s.wood = 0; s.ore = 200;
    const spot = (): [number, number] => { for (let y = 0; y < sim.GRID; y++) for (let x = 0; x < sim.GRID; x++) if (!s.grid[y]![x]) return [x, y]; throw new Error('full'); };
    for (const k of ['house', 'house', 'lumber'] as const) { const [x, y] = spot(); s.wood = 200; expect(sim.build(s, x, y, k).ok).toBe(true); }
    s.wood = 0;
    expect(sim.stats(s).woodMilli).toBeGreaterThan(0);
    for (let i = 0; i < 60; i++) sim.step(s);
    expect(s.wood).toBeGreaterThan(10);
  });
  it('a never-sold treasure cannot be ordered, so no gold is locked forever', () => {
    const s = sim.newState(1); sim.chooseArc(s, 'elf'); s.gold = 1e7;
    const mythic = sim.RELIC_KINDS.find((k) => sim.RELICS[k].rarity === 'mythic')!;
    expect(sim.placeOrder(s, mythic, 1, sim.fairPrice(mythic)).ok).toBe(false);
    expect(s.gold).toBe(1e7);
  });
});

