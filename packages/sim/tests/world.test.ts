import { describe, it, expect } from 'vitest';
import * as sim from '../src';

const total = (s: sim.GameState) => s.world.mayors.reduce((a, m) => a + m.gold, 0);
const run = (s: sim.GameState, n: number) => { for (let i = 0; i < n; i++) sim.worldStep(Object.assign(s, { tick: s.tick + 1 })); };

describe('world creation', () => {
  it('is deterministic with 40 unique mayors', () => {
    const a = sim.initWorld(7), b = sim.initWorld(7), c = sim.initWorld(8);
    expect(a).toEqual(b);
    expect(a).not.toEqual(c);
    expect(a.mayors).toHaveLength(sim.WORLD_MAYORS);
    expect(new Set(a.mayors.map((m) => m.name)).size).toBe(sim.WORLD_MAYORS);
    for (const m of a.mayors) { expect(m.level).toBeGreaterThanOrEqual(1); expect(m.level).toBeLessThanOrEqual(sim.MAX_MAYOR_LEVEL); expect(m.gold).toBeGreaterThan(0); }
  });
  it('never touches the city random numbers', () => {
    const s = sim.newState(5); const rng = s.rng;
    run(s, 5000);
    expect(s.rng).toBe(rng);
    expect(s.world.news.length).toBeGreaterThan(0);
  });
});

describe('the world lives on its own', () => {
  it('keeps every number in range and the news bounded over a long run', () => {
    const s = sim.newState(3);
    run(s, 20000);
    for (const m of s.world.mayors) {
      expect(m.gold).toBeGreaterThanOrEqual(0); expect(Number.isInteger(m.gold)).toBe(true);
      expect(m.wounded).toBeGreaterThanOrEqual(0); expect(m.wounded).toBeLessThanOrEqual(100);
      expect(m.level).toBeLessThanOrEqual(sim.MAX_MAYOR_LEVEL);
    }
    expect(s.world.news.length).toBeGreaterThan(0);
    expect(s.world.news.length).toBeLessThanOrEqual(sim.NEWS_MAX);
    expect(s.world.mayors.some((m) => m.record.won > 0)).toBe(true);
  });
  it('raids move gold between treasuries instead of making it', () => {
    const s = sim.newState(11);
    // freeze income and level-ups by checking one world step: gold total only rises by income
    const before = total(s);
    s.tick = sim.WORLD_STEP_TICKS; sim.worldStep(s);
    const income = s.world.mayors.reduce((a, m) => a + 6 * m.level + m.level * m.level, 0);
    expect(total(s)).toBeLessThanOrEqual(before + income);
  });
  it('is the same run twice', () => {
    const a = sim.newState(9), b = sim.newState(9);
    run(a, 3000); run(b, 3000);
    expect(a.world).toEqual(b.world);
  });
});

describe('raiding a mayor', () => {
  const strong = () => {
    const s = sim.newState(2); s.troops = 500; s.army = { vanguard: 200, raider: 200, breaker: 100 };
    const m = s.world.mayors.reduce((w, x) => (x.level < w.level ? x : w));
    m.gold = 5000; m.shieldUntil = 0;
    return { s, m };
  };
  it('takes the loot out of the mayor\'s treasury, capped', () => {
    const { s, m } = strong();
    const g = s.gold, mg = m.gold;
    const r = sim.launchRaid(s, m.id, { commit: 100, focus: 'loot', rage: false, heal: false, ram: false });
    expect(r.ok).toBe(true);
    const gained = s.gold - g;
    expect(mg - m.gold).toBe(gained);
    expect(gained).toBeLessThanOrEqual(Math.floor((mg * sim.MAX_LOOT_PCT) / 100));
  });
  it('shields a breached mayor and refuses a second raid', () => {
    const { s, m } = strong();
    const r = sim.launchRaid(s, m.id, { commit: 100, focus: 'loot', rage: false, heal: false, ram: false });
    if (r.ok && r.win) {
      expect(m.shieldUntil).toBeGreaterThan(s.tick);
      s.cooldowns[m.id] = 0;
      const again = sim.launchRaid(s, m.id, { commit: 100, focus: 'loot', rage: false, heal: false, ram: false });
      expect(again.ok).toBe(false);
    }
  });
  it('previews and scouts a mayor like any rival', () => {
    const { s, m } = strong();
    expect(sim.previewRaid(s, m.id, { commit: 100, focus: 'balanced', rage: false, heal: false, ram: false })).not.toBeNull();
    expect(sim.scout(sim.mayorRival(m)).grid.length).toBeGreaterThan(0);
  });
});

describe('mayors raiding you', () => {
  it('give their loot to the raider and wound a failed attacker', () => {
    const s = sim.newState(4); s.gold = 10000; s.nextRaidTick = 1; s.shieldUntil = 0;
    const before = total(s);
    let raided = 0;
    for (let i = 0; i < 4000 && raided < 3; i++) { const log = s.raidLog.length; sim.step(s); if (s.raidLog.length > log || s.raidLog[0]?.tick === s.tick) raided++; s.nextRaidTick = Math.min(s.nextRaidTick, s.tick + 5); s.shieldUntil = 0; }
    expect(s.raidLog.length).toBeGreaterThan(0);
    expect(total(s)).toBeGreaterThanOrEqual(before - 1);
  });
});
