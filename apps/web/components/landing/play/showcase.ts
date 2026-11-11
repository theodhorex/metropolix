import { BUILDINGS, LEVEL_XP, build, chooseArc, newState, step, type ArcId, type BuildingKind, type GameState } from '@metropolix/sim';

/**
 * Small, fixed cities made with the real simulation for the landing's toys (tax lab, war table).
 * They never touch localStorage; every number the toys show is read from these states.
 */
const LAB_PLAN: [number, number, BuildingKind][] = [
  [18, 18, 'house'], [19, 18, 'house'], [20, 18, 'house'], [21, 18, 'house'],
  [18, 19, 'house'], [19, 19, 'house'], [20, 19, 'rowhouse'], [21, 19, 'rowhouse'],
  [18, 20, 'farm'], [19, 20, 'farm'], [20, 20, 'shop'], [21, 20, 'stall'],
  [18, 21, 'shop'], [19, 21, 'workshop'], [20, 21, 'school'], [21, 21, 'park'],
  [22, 18, 'tavern'], [22, 19, 'lumber'], [22, 20, 'fountain'], [22, 21, 'clinic'],
];

function richCity(arc: ArcId, seed: number): GameState {
  const s = newState(seed);
  chooseArc(s, arc);
  s.xp = LEVEL_XP[7] ?? 3300;
  s.gold = 1_000_000; s.wood = 100_000; s.ore = 100_000; s.food = 20_000;
  s.nextRaidTick = Number.MAX_SAFE_INTEGER; // the showcase is never raided
  return s;
}

/** A modest elven town for the tax lab: housing, jobs, food, school and a park. */
export function labCity(): GameState {
  const s = richCity('elf', 11);
  for (const [x, y, k] of LAB_PLAN) if (BUILDINGS[k]) build(s, x, y, k);
  for (let i = 0; i < 40; i++) step(s);
  s.nextRaidTick = Number.MAX_SAFE_INTEGER;
  return s;
}

/** A goblin war camp with an army ready, for the war table. Rivals come from its own simulated world. */
export function warCity(): GameState {
  const s = richCity('goblin', 23);
  build(s, 20, 20, 'barracks'); build(s, 21, 20, 'barracks'); build(s, 20, 21, 'house'); build(s, 21, 21, 'house');
  s.troops = 60;
  s.army = { vanguard: 30, raider: 20, breaker: 10 };
  for (let i = 0; i < 60; i++) step(s); // let the world of mayors grow a little
  s.troops = 60;
  s.army = { vanguard: 30, raider: 20, breaker: 10 };
  s.cooldowns = {};
  return s;
}
