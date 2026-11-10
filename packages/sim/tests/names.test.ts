import { describe, it, expect } from 'vitest';
import { GIVEN, FAMILY, FANTASY_NAME_COUNT, fantasyName, randomFantasyName } from '../src';

describe('fantasy names', () => {
  it('has at least 2000 combinations and meets minimum list sizes', () => {
    expect(GIVEN.length).toBeGreaterThanOrEqual(90);
    expect(FAMILY.length).toBeGreaterThanOrEqual(40);
    expect(FANTASY_NAME_COUNT).toBeGreaterThanOrEqual(2000);
    expect(FANTASY_NAME_COUNT).toBe(GIVEN.length * FAMILY.length);
  });

  it('has no case-insensitive duplicates in given or family lists', () => {
    const lowerGiven = GIVEN.map((g) => g.toLowerCase());
    expect(new Set(lowerGiven).size).toBe(GIVEN.length);

    const lowerFamily = FAMILY.map((f) => f.toLowerCase());
    expect(new Set(lowerFamily).size).toBe(FAMILY.length);
  });

  it('generates distinct names for every index in [0, FANTASY_NAME_COUNT)', () => {
    const names = new Set<string>();
    for (let i = 0; i < FANTASY_NAME_COUNT; i++) {
      names.add(fantasyName(i));
    }
    expect(names.size).toBe(FANTASY_NAME_COUNT);
  });

  it('matches formatting /^[A-Z][a-z]+ [A-Z][a-z]+$/ and length <= 20 chars', () => {
    const namePattern = /^[A-Z][a-z]+ [A-Z][a-z]+$/;
    for (const g of GIVEN) {
      expect(g).toMatch(/^[A-Z][a-z]+$/);
      expect(g.length).toBeGreaterThanOrEqual(3);
      expect(g.length).toBeLessThanOrEqual(9);
    }
    for (const f of FAMILY) {
      expect(f).toMatch(/^[A-Z][a-z]+$/);
      expect(f.length).toBeGreaterThanOrEqual(4);
      expect(f.length).toBeLessThanOrEqual(10);
    }

    for (let i = 0; i < FANTASY_NAME_COUNT; i++) {
      const name = fantasyName(i);
      expect(name).toMatch(namePattern);
      expect(name.length).toBeLessThanOrEqual(20);
    }
  });

  it('wraps correctly with positive and negative indices', () => {
    expect(fantasyName(FANTASY_NAME_COUNT)).toBe(fantasyName(0));
    expect(fantasyName(FANTASY_NAME_COUNT + 5)).toBe(fantasyName(5));
    expect(fantasyName(-1)).toBe(fantasyName(FANTASY_NAME_COUNT - 1));
    expect(fantasyName(-FANTASY_NAME_COUNT)).toBe(fantasyName(0));
    expect(fantasyName(-FANTASY_NAME_COUNT - 3)).toBe(fantasyName(FANTASY_NAME_COUNT - 3));
  });

  it('returns valid names from randomFantasyName', () => {
    const namePattern = /^[A-Z][a-z]+ [A-Z][a-z]+$/;
    const start = randomFantasyName(0);
    const end = randomFantasyName(0.999999);

    expect(start).toMatch(namePattern);
    expect(start).toBe(fantasyName(0));

    expect(end).toMatch(namePattern);
    expect(end).toBe(fantasyName(FANTASY_NAME_COUNT - 1));
  });

  it('ensures the first 40 names have varied given names', () => {
    const first40Given = new Set<string>();
    for (let i = 0; i < 40; i++) {
      const parts = fantasyName(i).split(' ');
      first40Given.add(parts[0]!);
    }
    expect(first40Given.size).toBeGreaterThanOrEqual(30);
  });
});
