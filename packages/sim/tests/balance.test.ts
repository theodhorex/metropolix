// Fixes from the 12 Nov gameplay audit: exploits (A1-A4) and balance (B5-B8, C13).
import { describe, it, expect } from 'vitest';
import * as sim from '../src';

const rich = (seed = 1) => { const s = sim.newState(seed); s.gold = 99999; s.xp = 99999; s.wood = 2000; s.ore = 2000; return s; };

describe('exploits are closed', () => {
  it('packing a building and placing it again gives no XP', () => {
    const s = sim.newState(); s.gold = 1000;
    expect(sim.build(s, 0, 0, 'house').ok).toBe(true);
    const xp = s.xp;
    for (let i = 0; i < 50; i++) {
      expect(sim.packUp(s, 0, 0).ok).toBe(true);
      expect(sim.build(s, 0, 0, 'house').ok).toBe(true);
    }
    expect(s.xp).toBe(xp);
  });

  it('caps your own listings at 8', () => {
    const s = rich(); s.inventory.house = 20;
    for (let i = 0; i < sim.MAX_OWN_LISTINGS; i++) expect(sim.listForSale(s, 'house', 1, 60).ok).toBe(true);
    expect(sim.listForSale(s, 'house', 1, 60).ok).toBe(false);
  });

  it('buyers pay second-hand prices for buildings, so building to sell never prints gold', () => {
    const s = rich(); s.troops = 5000; s.inventory.house = 2;
    sim.listForSale(s, 'house', 1, sim.BUILDINGS.house.cost); // at build cost: nobody bites
    const cheap = sim.listForSale(s, 'house', 1, Math.floor((sim.BUILDINGS.house.cost * 70) / 100));
    expect(cheap.ok).toBe(true);
    for (let i = 0; i < 600; i++) sim.step(s);
    const mine = s.market.filter((l) => l.seller === sim.YOU && l.kind === 'house');
    expect(mine.map((l) => l.price)).toEqual([sim.BUILDINGS.house.cost]);
  });

  it('citizen talks pay out a few times a minute, not without end', () => {
    const s = sim.newState(); s.tick = 1000;
    const xp = s.xp;
    for (let i = 0; i < 20; i++) sim.npcAct(s, 'chat');
    expect(s.xp - xp).toBe(sim.TALK_REWARDS_PER_MIN * 2);
    expect(sim.npcAct(s, 'chat')).toMatch(/Talk again/);
    s.tick += 60;
    const before = s.xp; sim.npcAct(s, 'chat');
    expect(s.xp).toBe(before + 2);
  });

  it('tips cost gold on average', () => {
    const s = sim.newState(); s.gold = 100_000;
    for (let i = 0; i < 2000; i++) { s.tick += 60; sim.npcAct(s, 'tip'); }
    expect(s.gold).toBeLessThan(100_000);
  });

  it('war room losses scale with the army (no more 1-troop raids)', () => {
    const s = rich(); sim.chooseArc(s, 'elf');
    s.troops = 40; s.army = { vanguard: 40, raider: 0, breaker: 0 };
    const id = s.world.mayors[0]!.id;
    const p = sim.previewRaid(s, id, sim.QUICK_RAID)!;
    // vanguards lose 60% of the base rate: at least 25% x 0.6 = 15% of 40 = 6
    expect(p.lost).toBeGreaterThanOrEqual(6);
  });
});

describe('balance', () => {
  it('the storehouse stops your own production at its cap', () => {
    const s = rich(); sim.chooseArc(s, 'elf');
    for (let i = 0; i < 10; i++) sim.build(s, i, 0, 'lumber');
    expect(sim.stats(s).woodRate).toBeGreaterThan(0);
    const cap = sim.storeCap(s);
    s.wood = cap - 1; s.troops = 5000; sim.step(s);
    expect(s.wood).toBe(cap);
    sim.step(s);
    expect(s.wood).toBe(cap);
    s.wood = cap + 500; sim.step(s); // bought goods above the cap are kept, just not added to
    expect(s.wood).toBe(cap + 500);
  });

  it('an empty treasury with upkeep makes citizens unhappy', () => {
    const s = rich(); sim.build(s, 0, 0, 'school');
    const ok = sim.stats(s).happinessPm;
    s.gold = 0;
    const st = sim.stats(s);
    expect(st.unpaid).toBe(true);
    expect(st.happyParts.some((p) => p.label === 'Unpaid upkeep')).toBe(true);
    expect(st.happinessPm).toBeLessThan(ok);
  });

  it('Dragonkin build food in stone: ore instead of wood', () => {
    const s = sim.newState(); sim.chooseArc(s, 'dragon');
    expect([s.wood, s.ore]).toEqual([0, 100]); // the starting wood comes as ore
    s.gold = 1000;
    expect(sim.buildCost(s, 'farm')).toEqual({ gold: 150, wood: 0, ore: 6 });
    expect(sim.build(s, 0, 0, 'farm').ok).toBe(true);
    expect(s.ore).toBe(94);
    expect(sim.upgradeCost('farm', 2, s)).toMatchObject({ wood: 0, ore: 12 });
    const elf = sim.newState(); sim.chooseArc(elf, 'elf');
    expect(sim.buildCost(elf, 'farm')).toEqual({ gold: 150, wood: 6, ore: 0 });
  });

  it('the quick raid is the war room battle with every troop', () => {
    const mk = () => { const s = rich(7); sim.chooseArc(s, 'goblin'); s.troops = 60; s.army = { vanguard: 20, raider: 20, breaker: 20 }; return s; };
    const a = mk(), b = mk();
    const id = a.world.mayors[3]!.id;
    const ra = sim.attackRival(a, id), rb = sim.launchRaid(b, id, sim.QUICK_RAID);
    expect(ra.ok && rb.ok).toBe(true);
    expect([a.gold, a.troops, a.trophies]).toEqual([b.gold, b.troops, b.trophies]);
  });

  it('news from citizens is about the mayors of this world', () => {
    const s = sim.newState(); sim.chooseArc(s, 'elf');
    const names = s.world.mayors.map((m) => m.name);
    const msg = sim.npcAct(s, 'rumor');
    expect(names.some((n) => msg.startsWith(n))).toBe(true);
  });
});
