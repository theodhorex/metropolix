import { describe, it, expect } from 'vitest';
import * as sim from '../src';

describe('portraits', () => {
  it('500 portraits with the planned tier counts, 100 per people', () => {
    const count: Record<string, number> = {};
    for (let id = 1; id <= sim.PORTRAIT_COUNT; id++) count[sim.portraitTier(id)] = (count[sim.portraitTier(id)] ?? 0) + 1;
    for (const t of sim.PORTRAIT_TIERS) expect(count[t]).toBe(sim.PORTRAIT_TIER[t].total);
    for (const a of sim.ARCS) {
      const ids = Array.from({ length: 500 }, (_, i) => i + 1).filter((id) => sim.portraitArc(id) === a.id);
      expect(ids.length).toBe(100);
    }
  });
  it('rare parts only on high tiers', () => {
    for (let id = 1; id <= 500; id++) {
      const t = sim.portraitTraits(id); const rank = sim.PORTRAIT_TIERS.indexOf(t.tier);
      expect(t.glowEyes).toBe(rank >= 4);
      expect(t.aura).toBe(t.tier === 'mythic');
      if (rank < 3) expect(t.headwear).toBeLessThan(6);
    }
  });
  it('drawn once with the people, from the seed, of that people, never redrawn', () => {
    const a = sim.newState(42); const b = sim.newState(42);
    expect(a.portrait).toBe(0);
    sim.chooseArc(a, 'goblin'); sim.chooseArc(b, 'goblin');
    expect(a.portrait).toBe(b.portrait);
    expect(sim.portraitArc(a.portrait)).toBe('goblin');
    const first = a.portrait; a.rng = 12345;
    expect(sim.chooseArc(a, 'elf').ok).toBe(false);
    sim.ensurePortrait(a);
    expect(a.portrait).toBe(first);
  });
  it('the draw does not shift the seed', () => {
    const s = sim.newState(9); const before = s.rng;
    sim.chooseArc(s, 'dragon');
    expect(s.rng).toBe(before);
  });
  it('mayors get a stable portrait of their own people', () => {
    const s = sim.newState(3);
    for (const m of s.world.mayors) {
      const p = sim.mayorPortrait(m);
      expect(sim.validPortrait(p)).toBe(true);
      expect(sim.portraitArc(p)).toBe(m.arc);
    }
  });
  it('city value adds buildings by level, relics and the portrait tier', () => {
    const s = sim.newState(1); s.gold = 99999; s.xp = 99999; s.wood = 9999; s.ore = 9999;
    sim.chooseArc(s, 'elf');
    const base = sim.cityValue(s);
    expect(base.buildings).toBe(0);
    expect(base.portrait).toBe(sim.PORTRAIT_TIER[sim.portraitTier(s.portrait)].value);
    expect(sim.build(s, 5, 5, 'house').ok).toBe(true);
    expect(sim.cityValue(s).buildings).toBe(sim.BUILDINGS.house.cost);
    s.vault.amber = 2;
    expect(sim.cityValue(s).relics).toBe(2 * sim.RELICS.amber.price);
  });
});
