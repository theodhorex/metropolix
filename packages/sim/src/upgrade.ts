// Building upgrades: every non-decoration building can be raised from level 1 to 3.
// A level multiplies what the building does (homes, jobs, output, food, defense...), and some
// buildings gain something new on top: barracks drill troops harder and send fresh recruits,
// farms grow new kinds of food, mines and other treasure sites dig deeper.
// Import note: index.ts imports this file, so nothing from index may be used at module top level here.
import {
  BUILDINGS, GRID, addXp, levelFromXp, MAX_LEVEL, pushLog, stats,
  type BuildingKind, type GameState, type Result,
} from './index';

export const MAX_BLD_LEVEL = 3;
/** What a building does at each level, in permille of level 1 (index = level). */
export const LEVEL_PM = [0, 1000, 1500, 2000] as const;
/** Upkeep grows slower than the benefit, so an upgrade always pays for itself. */
export const UPKEEP_PM = [0, 1000, 1300, 1600] as const;
/** Free soldiers that join when a barracks reaches a level (up to the troop cap). */
export const RECRUITS = [0, 0, 5, 10] as const;
/** Attack bonus per barracks level above 1, in permille, capped for the whole city. */
export const DRILL_PM = 60;
export const DRILL_CAP_PM = 360;
/** Extra happiness for each kind of food beyond plain grain, while nobody is hungry. */
export const FOOD_VARIETY_PM = 40;

export const levelKey = (x: number, y: number) => `${x},${y}`;
export const canUpgrade = (k: BuildingKind) => BUILDINGS[k].category !== 'decoration';

/** Level of the building on a tile: 0 for an empty tile, else 1..3. */
export function buildingLevel(s: GameState, x: number, y: number): number {
  if (!s.grid[y]?.[x]) return 0;
  return s.levels?.[levelKey(x, y)] ?? 1;
}

/** Each kind's buildings summed by level weight (permille), and by upkeep weight. */
export function weightedCounts(s: GameState): { w: Partial<Record<BuildingKind, number>>; up: Partial<Record<BuildingKind, number>>; top: Partial<Record<BuildingKind, number>> } {
  const w: Partial<Record<BuildingKind, number>> = {}, up: Partial<Record<BuildingKind, number>> = {}, top: Partial<Record<BuildingKind, number>> = {};
  for (let y = 0; y < s.grid.length; y++) {
    const row = s.grid[y]!;
    for (let x = 0; x < row.length; x++) {
      const k = row[x];
      if (!k) continue;
      const lv = s.levels?.[levelKey(x, y)] ?? 1;
      w[k] = (w[k] ?? 0) + LEVEL_PM[lv]!;
      up[k] = (up[k] ?? 0) + UPKEEP_PM[lv]!;
      top[k] = Math.max(top[k] ?? 0, lv);
    }
  }
  return { w, up, top };
}

/** Attack bonus (permille) from upgraded barracks. */
export function drillPm(s: GameState): number {
  let pm = 0;
  for (const [key, lv] of Object.entries(s.levels ?? {})) {
    const [x, y] = key.split(',').map(Number) as [number, number];
    if (s.grid[y]?.[x] === 'barracks') pm += (lv - 1) * DRILL_PM;
  }
  return Math.min(DRILL_CAP_PM, pm);
}

/** Kinds of food the city grows: grain from any farm, fruit from a level 2 farm, cheese from a level 3 farm. */
export function foodTypes(s: GameState): string[] {
  const top = weightedCounts(s).top.farm ?? 0;
  return top === 0 ? [] : ['Grain', 'Fruit', 'Cheese'].slice(0, top);
}

/** What the next level costs and the player level it needs. */
export function upgradeCost(k: BuildingKind, toLevel: number) {
  const b = BUILDINGS[k];
  const f = toLevel === 2 ? 2 : 4;
  return {
    gold: b.cost * f, wood: (b.woodCost ?? 0) * f, ore: (b.oreCost ?? 0) * f,
    needLevel: toLevel === 2 ? Math.max(2, b.unlockLevel + 1) : Math.min(MAX_LEVEL, b.unlockLevel + 3),
  };
}

/** What a building gains on top of the plain multiplier, at level 2 and level 3. */
export const PERKS: Partial<Record<BuildingKind, [string, string]>> = {
  barracks: ['Drill yard: +6% attack for the city, 5 fresh recruits join', 'War college: another +6% attack, 10 more recruits join'],
  farm: ['Orchard: your city also grows fruit (+4% happiness)', 'Dairy: your city also makes cheese (+4% happiness)'],
  tower: ['Stone walls: more defense', 'Ballista: double the defense of level 1'],
  factory: ['Better furnaces: more output, no extra smoke', 'Steam lines: double output, still no extra smoke'],
  mine: ['Deeper shafts: more ore and better treasure odds', 'The deep vein: double ore, best treasure odds'],
  lumber: ['Sawmill: more wood and better treasure odds', 'Old-growth rights: double wood, best treasure odds'],
  workshop: ['Master crafters: more special goods, better treasure odds', 'Guild hall: double goods, best treasure odds'],
  tavern: ['Upstairs rooms: more jobs and cheer, better treasure odds', 'Famous inn: double the cheer, best treasure odds'],
  library: ['Reading room: more seats, better treasure odds', 'Grand archive: double seats, best treasure odds'],
};

/** Why the building on (x, y) cannot be upgraded right now, or null. Pure. */
export function upgradeBlocker(s: GameState, x: number, y: number): string | null {
  if (!Number.isInteger(x) || !Number.isInteger(y) || x < 0 || y < 0 || x >= GRID || y >= GRID) return 'Out of bounds';
  const k = s.grid[y]![x];
  if (!k) return 'Nothing here';
  if (!canUpgrade(k)) return 'Decorations cannot be upgraded';
  const lv = buildingLevel(s, x, y);
  if (lv >= MAX_BLD_LEVEL) return 'Already at the highest level';
  const c = upgradeCost(k, lv + 1);
  if (levelFromXp(s.xp) < c.needLevel) return `Reach level ${c.needLevel} to upgrade this`;
  if (s.gold < c.gold) return `Not enough gold (need ${c.gold})`;
  if (s.wood < c.wood) return `Not enough wood (need ${c.wood})`;
  if (s.ore < c.ore) return `Not enough ore (need ${c.ore})`;
  return null;
}

export function upgradeBuilding(s: GameState, x: number, y: number): Result {
  const why = upgradeBlocker(s, x, y);
  if (why) return { ok: false, msg: why };
  const k = s.grid[y]![x]!;
  const to = buildingLevel(s, x, y) + 1;
  const c = upgradeCost(k, to);
  s.gold -= c.gold; s.wood -= c.wood; s.ore -= c.ore;
  s.levels[levelKey(x, y)] = to;
  addXp(s, to === 2 ? 15 : 30);
  pushLog(s, `${BUILDINGS[k].name} upgraded to level ${to}.`);
  let recruits = 0;
  if (k === 'barracks') {
    recruits = Math.max(0, Math.min(RECRUITS[to]!, stats(s).troopCap - s.troops));
    if (recruits > 0) {
      s.troops += recruits; s.army.vanguard += recruits;
      pushLog(s, `${recruits} fresh recruits joined at the Barracks.`);
    }
  }
  return { ok: true, level: to, recruits };
}

/** Clear a tile's level when its building goes away. */
export function clearLevel(s: GameState, x: number, y: number) {
  if (s.levels) delete s.levels[levelKey(x, y)];
}
