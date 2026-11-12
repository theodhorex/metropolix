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

/** The town area on the island: x and y within LO..HI. */
const LO = 14, HI = 25;
const inTown = (x: number, y: number) => x >= LO && x <= HI && y >= LO && y <= HI;
/** Small deterministic hash for "random" choices that are the same on every visit. */
const hash = (x: number, y: number) => (((x * 73856093) ^ (y * 19349663)) >>> 0) % 1000;
/** Fill `tiles` in order with `kinds`, cycling through the list. */
const deal = (tiles: [number, number][], kinds: BuildingKind[]): PlanEntry[] =>
  tiles.map(([x, y], i) => ({ x, y, kind: kinds[i % kinds.length]! }));
/** Tiles whose distance from (cx, cy) is in [r0, r1), ordered round the circle. */
function ring(cx: number, cy: number, r0: number, r1: number): [number, number][] {
  const out: [number, number][] = [];
  for (let y = LO; y <= HI; y++) for (let x = LO; x <= HI; x++) {
    const d = Math.hypot(x - cx, y - cy);
    if (d >= r0 && d < r1) out.push([x, y]);
  }
  return out.sort((a, b) => Math.atan2(a[1] - cy, a[0] - cx) - Math.atan2(b[1] - cy, b[0] - cx));
}

/** Elves: a round glade. Homes ring the Moon Tree, services ring the homes, the forest edge holds fields and towers. */
function elfPlan(): PlanEntry[] {
  const c = 19.5;
  const homes = ring(c, c, 1.6, 3.0).filter((_, i) => i % 4 !== 3); // every fourth tile stays a footpath
  const middle = ring(c, c, 3.0, 4.3);
  const edge = ring(c, c, 4.3, 6.4);
  return [
    ...at('moontree', [19, 19]), ...at('pond', [20, 20]), ...at('flowerbed', [20, 19], [19, 20]),
    ...deal(homes, ['house', 'cottage', 'villa', 'house', 'rowhouse', 'cottage']),
    ...deal(middle.filter((_, i) => i % 3 !== 2), ['teahouse', 'library', 'garden', 'shrine', 'stall', 'school', 'clinic', 'tree', 'academy', 'tailor', 'observatory', 'theater']),
    ...deal(middle.filter((_, i) => i % 3 === 2), ['tree', 'lamp', 'tree', 'hedge']),
    ...deal(edge.filter(([x, y]) => hash(x, y) % 5 !== 0), ['tree', 'farm', 'tree', 'lumber', 'tree', 'windmill', 'hedge', 'watchtower', 'tree', 'farm', 'workshop', 'garden']),
  ];
}

/** Lizardfolk: stilt homes along both banks of a swamp river that runs corner to corner, a temple in the water. */
function lizardPlan(): PlanEntry[] {
  const river: [number, number][] = [], near: [number, number][] = [], far: [number, number][] = [];
  for (let y = LO; y <= HI; y++) for (let x = LO; x <= HI; x++) {
    const d = x + y - 39 + ((x - y) % 4 === 0 ? 1 : 0); // a gently wavy line
    if (d === 0) river.push([x, y]);
    else if (Math.abs(d) <= 2) near.push([x, y]);
    else if (Math.abs(d) <= 5) far.push([x, y]);
  }
  const byMid = (a: [number, number], b: [number, number]) => Math.abs(a[0] - a[1]) - Math.abs(b[0] - b[1]);
  river.sort(byMid); near.sort(byMid); far.sort(byMid);
  return [
    ...at('suntemple', river[0]!), ...deal(river.slice(1), ['pond', 'fishery', 'pond', 'pond']),
    ...deal(near.filter(([x, y]) => hash(x, y) % 4 !== 0), ['house', 'fishery', 'cottage', 'rowhouse', 'stall', 'house', 'tavern', 'cottage', 'bazaar', 'longhouse', 'teahouse', 'house']),
    ...deal(far.filter(([x, y]) => hash(x, y) % 3 !== 0), ['farm', 'tree', 'barracks', 'clinic', 'warcamp', 'shrine', 'farm', 'lumber', 'tree', 'mine', 'workshop', 'school', 'watchtower', 'library', 'tree', 'theater']),
  ];
}

/** Cavemen: three huddled camps, each round its gathering stone, inside one log palisade. */
function cavemanPlan(): PlanEntry[] {
  const camps: [number, number, BuildingKind][] = [[17, 17, 'stones'], [22, 18, 'well'], [18, 22, 'well']];
  const out: PlanEntry[] = [];
  for (const [cx, cy, heart] of camps) {
    out.push({ x: cx, y: cy, kind: heart });
    out.push(...deal(ring(cx, cy, 0.9, 1.6), ['longhouse', 'cottage', 'cottage', 'longhouse', 'cottage', 'house', 'cottage', 'longhouse']));
  }
  const wall: [number, number][] = [];
  for (let i = LO + 1; i <= HI - 1; i++) wall.push([i, LO], [i, HI], [LO, i], [HI, i]);
  const between = ring(19.5, 19.5, 0, 6).filter(([x, y]) => x > LO && x < HI && y > LO && y < HI && hash(x, y) % 3 === 0);
  return [
    ...out,
    ...deal(between, ['farm', 'tavern', 'tree', 'lumber', 'barracks', 'farm', 'stall', 'mine', 'workshop', 'warcamp', 'tree', 'shrine']),
    ...deal(wall.filter(([x, y]) => (x + y) % 7 !== 0), ['palisade']), // a few gaps are the gates
    ...at('watchtower', [LO, LO], [HI, HI], [LO, HI], [HI, LO]),
  ];
}

/** Dragonkin: a mirrored fortress city. A grand avenue climbs to the Ember Throne, forges smoke along the south. */
function dragonPlan(): PlanEntry[] {
  const mirror = (kind: BuildingKind, ...xs: [number, number][]) => xs.flatMap(([x, y]) => at(kind, [x, y], [39 - x, y]));
  return [
    ...at('emberthrone', [19, 15]), ...at('arch', [19, 24]),
    ...at('lamp', [19, 17], [19, 19], [19, 21], [19, 23]), ...at('statue', [20, 17]), ...at('fountain', [20, 20]),
    ...mirror('manor', [17, 16]), ...mirror('villa', [17, 17]), ...mirror('tenement', [17, 19], [17, 20]),
    ...mirror('rowhouse', [16, 19], [16, 20], [16, 21]), ...mirror('house', [17, 21], [17, 22]),
    ...mirror('bank', [18, 16]), ...mirror('tradeguild', [16, 16]), ...mirror('bazaar', [18, 18]), ...mirror('tavern', [18, 22]),
    ...mirror('academy', [15, 18]), ...mirror('theater', [15, 20]),
    ...mirror('smelter', [15, 23], [17, 24]), ...mirror('mine', [16, 24], [14, 24]), ...mirror('foundry', [15, 22]), ...mirror('workshop', [18, 24]),
    ...mirror('fortress', [14, 14]), ...mirror('tower', [14, 17], [14, 20]), ...mirror('armory', [16, 14]), ...mirror('barracks', [17, 14]),
    ...mirror('fishery', [14, 22]), ...mirror('farm', [15, 15]),
  ];
}

/** Goblins: a crammed scrap town that grew wherever there was room, round the Scrap Spire. */
function goblinPlan(): PlanEntry[] {
  const tiles = ring(21, 18, 0.9, 9).filter(([x, y]) => hash(x, y) % 6 !== 0 && inTown(x, y));
  tiles.sort((a, b) => Math.hypot(a[0] - 21, a[1] - 18) - Math.hypot(b[0] - 21, b[1] - 18));
  return [
    ...at('scrapspire', [21, 18]),
    ...deal(tiles, ['tenement', 'mine', 'house', 'stall', 'smelter', 'rowhouse', 'tavern', 'workshop', 'house', 'lamp', 'bazaar', 'tenement',
      'factory', 'cottage', 'mine', 'armory', 'house', 'shop', 'crafthall', 'rowhouse', 'farm', 'barracks', 'well', 'smelter', 'school', 'farm', 'tower']),
  ];
}

const PLANS: Record<ArcId, () => PlanEntry[]> = { elf: elfPlan, lizard: lizardPlan, caveman: cavemanPlan, dragon: dragonPlan, goblin: goblinPlan };
const cache = new Map<ArcId, readonly PlanEntry[]>();
/** The town plan of one people, in building order. Each people lays its town out its own way. */
export function showcasePlan(arc: ArcId): readonly PlanEntry[] {
  let p = cache.get(arc);
  if (!p) { p = PLANS[arc]().filter((e) => inTown(e.x, e.y)); cache.set(arc, p); }
  return p;
}

/** A fresh city of this people, rich enough to build everything, never raided, with a lively world around it. */
export function createShowcase(arc: ArcId, seed = 7): GameState {
  const s = newState(seed);
  chooseArc(s, arc);
  s.name = 'Lord Alder';
  s.nextRaidTick = NEVER;
  s.xp = 7000; // player level 10: every building, the wonder included, is unlocked
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
  const plan = showcasePlan(arc);
  for (let i = 0; i < plan.length; ) i = placeNext(s, plan, i); // always moves forward
  s.pop = stats(s).housing; // move everybody in, so the streets are not empty
  const troops = Math.min(12, stats(s).troopCap);
  s.troops = troops;
  s.army.vanguard = troops;
  return s;
}
