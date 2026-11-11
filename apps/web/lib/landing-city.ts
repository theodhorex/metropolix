// The landing page's showcase city: a fixed town plan that the real simulation builds tile by tile.
// Pure TypeScript (no DOM, no React, no storage): the page owns the timers, this file owns the rules.
import {
  GOOD_KINDS, buildingLevel, build, canUpgrade, chooseArc, newState, stats, step, upgradeBuilding,
  type ArcId, type BuildingKind, type GameState,
} from '@metropolix/sim';

export interface PlanEntry { x: number; y: number; kind: BuildingKind }

/** Every this many placed buildings, one placed building is upgraded so new shapes show up. */
const UPGRADE_EVERY = 8;
/** Sim ticks played before the first frame, so the world (40 rival mayors) already has news to show. */
const WARMUP_TICKS = 220;
/** Sim ticks that pass with each new building, so citizens move in and the world keeps moving. */
const TICKS_PER_GROW = 2;
const TICKS_PER_IDLE = 3;
/** A raid tick this far away means the showcase city is never raided. */
const NEVER = 1_000_000_000;

const at = (kind: BuildingKind, ...xy: [number, number][]): PlanEntry[] => xy.map(([x, y]) => ({ x, y, kind }));

/**
 * A believable town around tile (20, 20), x and y within 14..25. No roads: houses sit in four blocks
 * with free alleys between them (citizens walk the empty tiles). The list is in building order: the
 * plaza first, then the homes around it, then trade, services, farms, industry, the edge and decor.
 */
export const SHOWCASE_PLAN: readonly PlanEntry[] = [
  ...at('fountain', [19, 19]),
  // homes, block by block, starting beside the plaza
  ...at('house', [20, 20], [21, 20], [20, 21]), ...at('rowhouse', [21, 21]),
  ...at('house', [17, 20], [18, 20], [17, 21]), ...at('rowhouse', [18, 21]),
  ...at('house', [20, 17], [21, 17], [21, 18]), ...at('rowhouse', [20, 18]),
  ...at('house', [17, 17], [18, 17], [17, 18]), ...at('manor', [18, 18]),
  // the market, east of the plaza
  ...at('stall', [23, 18], [23, 20]), ...at('shop', [23, 19], [24, 21]), ...at('tavern', [24, 19]), ...at('bank', [23, 22]),
  // learning, healing and green space, west
  ...at('school', [15, 18]), ...at('library', [15, 20]), ...at('clinic', [15, 22]),
  ...at('park', [14, 19], [16, 19]), ...at('academy', [15, 16]),
  // fields along the north edge
  ...at('farm', [17, 15], [18, 15], [19, 15], [20, 15], [21, 15]),
  // wood, ore and workshops along the south edge
  ...at('lumber', [17, 24], [18, 24]), ...at('mine', [20, 24], [21, 24]), ...at('workshop', [23, 24]), ...at('factory', [22, 24]),
  // the watch
  ...at('barracks', [23, 16]), ...at('tower', [25, 15], [14, 23], [25, 20]),
  // finishing touches
  ...at('tree', [16, 17], [16, 22], [22, 16]),
  ...at('lamp', [19, 17], [19, 20], [22, 20], [19, 21]),
  ...at('statue', [19, 22]),
];

/** A fresh city of this people, rich enough to build everything, never raided, with a lively world around it. */
export function createShowcase(arc: ArcId, seed = 7): GameState {
  const s = newState(seed);
  chooseArc(s, arc);
  s.name = 'Lord Alder';
  s.nextRaidTick = NEVER;
  s.xp = 2300; // player level 7: bank, academy, tower and the rest are unlocked
  s.taxRate = 10;
  for (let i = 0; i < WARMUP_TICKS; i++) step(s);
  topUp(s);
  return s;
}

/** Keep the treasury full so a build is never refused for lack of gold, wood, ore, food or special goods. */
function topUp(s: GameState) {
  s.gold = Math.max(s.gold, 50_000);
  s.wood = Math.max(s.wood, 600);
  s.ore = Math.max(s.ore, 600);
  s.food = Math.max(s.food, 600);
  for (const g of GOOD_KINDS) s.goods[g] = Math.max(s.goods[g], 120);
}

/** Place the next placeable plan entry at or after `i` (blocked ones are skipped). Returns the next index. */
function placeNext(s: GameState, plan: readonly PlanEntry[], i: number): number {
  topUp(s);
  for (let j = i; j < plan.length; j++) {
    const e = plan[j]!;
    if (!build(s, e.x, e.y, e.kind).ok) continue;
    const next = j + 1;
    if (next % UPGRADE_EVERY === 0) upgradeOne(s, plan, j, next / UPGRADE_EVERY);
    return next;
  }
  return plan.length;
}

/** Upgrade one already placed building (round-robin over those that can still go up). */
function upgradeOne(s: GameState, plan: readonly PlanEntry[], upTo: number, turn: number) {
  const open: PlanEntry[] = [];
  for (let k = 0; k <= upTo; k++) {
    const e = plan[k]!;
    if (s.grid[e.y]![e.x] === e.kind && canUpgrade(e.kind) && buildingLevel(s, e.x, e.y) < 3) open.push(e);
  }
  if (open.length === 0) return;
  const e = open[(turn * 3) % open.length]!;
  upgradeBuilding(s, e.x, e.y);
}

/**
 * One step of the build-up: place the next entry, then let a couple of seconds of the real game pass.
 * Returns the next plan index; when it equals `plan.length` the town is finished.
 */
export function growStep(s: GameState, plan: readonly PlanEntry[], i: number): number {
  const next = placeNext(s, plan, i);
  for (let t = 0; t < TICKS_PER_GROW; t++) step(s);
  return next;
}

/** The finished town stays alive: citizens keep walking and the world keeps raiding. */
export function idleStep(s: GameState) {
  topUp(s);
  for (let t = 0; t < TICKS_PER_IDLE; t++) step(s);
}

/** The finished city at once (for visitors who prefer reduced motion): no growing, no stepping afterwards. */
export function fullCity(arc: ArcId, seed = 7): GameState {
  const s = createShowcase(arc, seed);
  for (let i = 0; i < SHOWCASE_PLAN.length; ) i = placeNext(s, SHOWCASE_PLAN, i); // always moves forward
  s.pop = stats(s).housing; // move everybody in, so the streets are not empty
  const troops = Math.min(12, stats(s).troopCap);
  s.troops = troops;
  s.army.vanguard = troops;
  return s;
}
