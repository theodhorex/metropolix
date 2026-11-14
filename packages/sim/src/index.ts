// Metropolix simulation core. Pure, deterministic, integer-only (no floats in state or outputs).
// Same seed + same actions => same state on every machine, so results can be verified on-chain later.

export const GRID = 40;

export type BuildingKind = 'house' | 'farm' | 'shop' | 'factory' | 'school' | 'park' | 'barracks' | 'tower'
  | 'tree' | 'lamp' | 'fountain' | 'statue' | 'lumber' | 'mine'
  | 'rowhouse' | 'manor' | 'stall' | 'tavern' | 'bank' | 'library' | 'academy' | 'clinic' | 'workshop'
  | 'cottage' | 'longhouse' | 'tenement' | 'villa' | 'highrise'
  | 'bakery' | 'teahouse' | 'tailor' | 'bazaar' | 'tradeguild'
  | 'fishery' | 'windmill' | 'sawmill' | 'smelter' | 'crafthall' | 'foundry'
  | 'shrine' | 'garden' | 'theater' | 'observatory' | 'hospital' | 'university'
  | 'palisade' | 'watchtower' | 'armory' | 'warcamp' | 'fortress'
  | 'flowerbed' | 'hedge' | 'well' | 'pond' | 'arch'
  | 'moontree' | 'suntemple' | 'stones' | 'emberthrone' | 'scrapspire';
export type Cell = BuildingKind | null;
export type Category = 'residential' | 'commerce' | 'industry' | 'services' | 'military' | 'decoration';
export const CATEGORIES: { id: Category; name: string }[] = [
  { id: 'residential', name: 'Residential' },
  { id: 'commerce', name: 'Commerce' },
  { id: 'industry', name: 'Industry' },
  { id: 'services', name: 'Services' },
  { id: 'military', name: 'Military' },
  { id: 'decoration', name: 'Decoration' },
];

export interface BuildingDef {
  name: string;
  category: Category;
  unlockLevel: number;
  cost: number;
  color: string;
  height: number; // visual height in tiles, used by the renderer
  desc: string;
  housing?: number;
  jobs?: number;
  output?: number;
  edu?: number;
  happy?: number;
  upkeep?: number;
  pollution?: number;
  troopCap?: number;
  defense?: number;
  woodCost?: number;  // resources spent to build (skipped when placing from stock)
  oreCost?: number;
  wood?: number;      // wood produced per second at neutral abundance
  ore?: number;
  food?: number;      // food produced per second at full productivity
  goods?: number;     // this race's special good produced per second (workshop)
  goodsCost?: Partial<Record<GoodKind, number>>; // special goods spent to build
  clean?: number;     // smoke this building scrubs away (never below zero)
  atkPm?: number;     // city attack bonus in permille (capped, see BUILD_ATK_CAP_PM)
  arc?: ArcId;        // a wonder: only this people can build it
  limit?: number;     // most of this kind one city may own (placed plus in storage)
}

export const BUILDINGS: Record<BuildingKind, BuildingDef> = {
  house:    { name: 'House', category: 'residential', unlockLevel: 1, woodCost: 4,    cost: 100, housing: 10, color: '#d9a066', height: 1.0, desc: 'Houses 10 citizens' },
  farm:     { name: 'Farm', category: 'industry', unlockLevel: 1, woodCost: 6,     cost: 150, jobs: 4, output: 6, food: 8, color: '#8bc34a', height: 0.5, desc: 'Grows food for 160 citizens' },
  shop:     { name: 'Shop', category: 'commerce', unlockLevel: 2, woodCost: 10,     cost: 300, jobs: 6, output: 10, color: '#4fc3f7', height: 1.2, desc: '6 jobs, good output' },
  factory:  { name: 'Factory', category: 'industry', unlockLevel: 4, oreCost: 16,  cost: 400, jobs: 8, output: 16, pollution: 6, color: '#9e9e9e', height: 1.6, desc: '8 jobs, high output, pollutes' },
  school:   { name: 'School', category: 'services', unlockLevel: 3, woodCost: 10,   cost: 350, edu: 40, happy: 3, upkeep: 4, color: '#ffd54f', height: 1.3, desc: 'Educates 40 citizens' },
  park:     { name: 'Park', category: 'services', unlockLevel: 1, woodCost: 4,     cost: 120, happy: 4, color: '#2e7d32', height: 0.3, desc: '+happiness' },
  barracks: { name: 'Barracks', category: 'military', unlockLevel: 3, oreCost: 20, cost: 500, troopCap: 20, upkeep: 8, color: '#c0392b', height: 1.4, desc: 'Trains up to 20 troops' },
  tower:    { name: 'Tower', category: 'military', unlockLevel: 5, oreCost: 18,    cost: 450, defense: 40, upkeep: 5, color: '#6d4c41', height: 2.2, desc: '+40 defense' },
  tree:     { name: 'Tree',     category: 'decoration', unlockLevel: 1, woodCost: 1, cost: 30,  happy: 1, color: '#3f8f3f', height: 0.9, desc: 'Cosy greenery' },
  lamp:     { name: 'Lamp',     category: 'decoration', unlockLevel: 2, oreCost: 2, cost: 60,  happy: 1, color: '#ffd54f', height: 0.9, desc: 'Warm street light' },
  fountain: { name: 'Fountain', category: 'decoration', unlockLevel: 2, oreCost: 6, cost: 200, happy: 3, color: '#4fc3f7', height: 0.7, desc: 'Citizens love it' },
  statue:   { name: 'Statue',   category: 'decoration', unlockLevel: 4, oreCost: 10, cost: 350, happy: 4, color: '#b0bec5', height: 1.5, desc: 'A monument to your city' },
  lumber:   { name: 'Lumber Camp', category: 'industry', unlockLevel: 1, cost: 120, oreCost: 4, jobs: 4, wood: 4, color: '#8d6e3f', height: 0.9, desc: 'Fells trees for wood. Output depends on your land.' },
  mine:     { name: 'Mine',        category: 'industry', unlockLevel: 2, cost: 180, woodCost: 6, jobs: 4, ore: 4, color: '#78909c', height: 0.8, desc: 'Digs ore. Output depends on your land.' },
  // second wave: more choice inside each sector
  rowhouse: { name: 'Row Houses', category: 'residential', unlockLevel: 3, woodCost: 12, cost: 260, housing: 24, color: '#c98a52', height: 1.2, desc: 'Packs 24 citizens on one tile' },
  manor:    { name: 'Manor', category: 'residential', unlockLevel: 5, oreCost: 10, cost: 600, housing: 12, happy: 3, goodsCost: { hides: 6 }, color: '#b06a4a', height: 1.6, desc: 'Fine homes that lift the whole street' },
  stall:    { name: 'Market Stall', category: 'commerce', unlockLevel: 1, woodCost: 3, cost: 80, jobs: 3, output: 4, color: '#e0b04a', height: 0.6, desc: 'A cheap first business' },
  tavern:   { name: 'Tavern', category: 'commerce', unlockLevel: 3, woodCost: 8, cost: 280, jobs: 5, output: 8, happy: 2, goodsCost: { spice: 4 }, color: '#a8643a', height: 1.2, desc: 'Food, drink and gossip' },
  bank:     { name: 'Bank', category: 'commerce', unlockLevel: 6, oreCost: 20, cost: 900, jobs: 8, output: 24, goodsCost: { gears: 8 }, color: '#d8c27a', height: 1.7, desc: 'The richest jobs in town' },
  library:  { name: 'Library', category: 'services', unlockLevel: 2, woodCost: 6, cost: 180, edu: 20, upkeep: 2, color: '#7a8cc8', height: 1.0, desc: 'Teaches 20 citizens, cheap to run' },
  academy:  { name: 'Academy', category: 'services', unlockLevel: 6, oreCost: 12, cost: 900, edu: 120, happy: 2, upkeep: 10, goodsCost: { emberstone: 8 }, color: '#9a7ad8', height: 1.9, desc: 'Teaches 120 citizens' },
  clinic:   { name: 'Clinic', category: 'services', unlockLevel: 4, woodCost: 8, cost: 400, happy: 6, upkeep: 6, goodsCost: { moonleaf: 5 }, color: '#e8e2d0', height: 1.1, desc: 'Healthy citizens are happy citizens' },
  workshop: { name: 'Workshop', category: 'industry', unlockLevel: 2, woodCost: 6, oreCost: 4, cost: 220, jobs: 4, goods: 4, color: '#8a6a9a', height: 1.1, desc: "Makes your people's special good" },
  // third wave: late-game content, levels 7 to 10, and one wonder per people
  cottage:    { name: 'Cottage', category: 'residential', unlockLevel: 1, woodCost: 2, cost: 60, housing: 6, color: '#e0b483', height: 0.8, desc: 'A small first home for 6 citizens' },
  longhouse:  { name: 'Longhouse', category: 'residential', unlockLevel: 4, woodCost: 16, cost: 220, housing: 18, color: '#a8784a', height: 1.0, desc: '18 citizens under one long timber roof' },
  tenement:   { name: 'Tenement', category: 'residential', unlockLevel: 6, woodCost: 8, oreCost: 14, cost: 560, housing: 40, upkeep: 3, color: '#9a7f6a', height: 1.8, desc: 'Crams 40 citizens in, but needs upkeep' },
  villa:      { name: 'Villa', category: 'residential', unlockLevel: 7, oreCost: 10, cost: 800, housing: 16, happy: 4, goodsCost: { spice: 6 }, color: '#e8c9a0', height: 1.4, desc: 'Gardens and courtyards for 16 lucky citizens' },
  highrise:   { name: 'High Rise', category: 'residential', unlockLevel: 9, oreCost: 30, cost: 1400, housing: 60, upkeep: 6, goodsCost: { gears: 8 }, color: '#8fa3b8', height: 2.4, desc: 'Houses 60 citizens, the tallest homes in town' },
  bakery:     { name: 'Bakery', category: 'commerce', unlockLevel: 2, woodCost: 6, cost: 180, jobs: 4, output: 5, food: 3, color: '#e8b872', height: 1.0, desc: 'Sells bread: jobs and a little food' },
  teahouse:   { name: 'Teahouse', category: 'commerce', unlockLevel: 3, woodCost: 8, cost: 260, jobs: 4, output: 6, happy: 2, goodsCost: { moonleaf: 3 }, color: '#7fbf9a', height: 1.1, desc: 'Calm cups of moonleaf tea' },
  tailor:     { name: 'Tailor', category: 'commerce', unlockLevel: 4, woodCost: 6, oreCost: 4, cost: 360, jobs: 5, output: 10, goodsCost: { hides: 4 }, color: '#c27a9a', height: 1.1, desc: 'Fine clothes from traded hides' },
  bazaar:     { name: 'Bazaar', category: 'commerce', unlockLevel: 5, woodCost: 14, oreCost: 6, cost: 520, jobs: 10, output: 14, color: '#e0904a', height: 1.0, desc: 'A crowded market: 10 jobs' },
  tradeguild: { name: 'Trade Guild', category: 'commerce', unlockLevel: 8, oreCost: 24, cost: 1300, jobs: 10, output: 30, goodsCost: { emberstone: 8 }, color: '#c9a24a', height: 1.8, desc: 'Merchant princes and their big deals' },
  fishery:    { name: 'Fishery', category: 'industry', unlockLevel: 2, woodCost: 6, cost: 160, jobs: 4, food: 6, color: '#5f9fc0', height: 0.7, desc: 'Fish for 120 citizens' },
  windmill:   { name: 'Windmill', category: 'industry', unlockLevel: 3, woodCost: 10, cost: 240, jobs: 2, food: 4, happy: 1, color: '#e8dcc0', height: 1.8, desc: 'Grinds flour without any smoke' },
  sawmill:    { name: 'Sawmill', category: 'industry', unlockLevel: 4, oreCost: 8, cost: 360, jobs: 6, wood: 8, pollution: 2, color: '#9a6a3a', height: 1.1, desc: 'Twice the wood of a camp, a little smoke' },
  smelter:    { name: 'Smelter', category: 'industry', unlockLevel: 5, woodCost: 10, cost: 420, jobs: 6, ore: 8, pollution: 4, color: '#7a5a5a', height: 1.3, desc: 'Twice the ore of a mine, smoky' },
  crafthall:  { name: 'Craft Hall', category: 'industry', unlockLevel: 7, woodCost: 12, oreCost: 12, cost: 900, jobs: 6, goods: 8, color: '#9a7aaa', height: 1.4, desc: "Twice a workshop's special goods" },
  foundry:    { name: 'Foundry', category: 'industry', unlockLevel: 8, oreCost: 30, cost: 1200, jobs: 12, output: 30, pollution: 10, color: '#6a6a72', height: 1.9, desc: 'Huge output, thick smoke' },
  shrine:     { name: 'Shrine', category: 'services', unlockLevel: 2, woodCost: 4, cost: 150, happy: 3, upkeep: 1, color: '#d8c8a8', height: 1.0, desc: 'A quiet place to pray' },
  garden:     { name: 'Garden', category: 'services', unlockLevel: 4, woodCost: 6, cost: 300, happy: 3, clean: 3, upkeep: 1, color: '#5aa860', height: 0.4, desc: 'Flowers that scrub away 3 smoke' },
  theater:    { name: 'Theater', category: 'services', unlockLevel: 5, woodCost: 12, cost: 600, jobs: 4, happy: 7, upkeep: 4, goodsCost: { spice: 4 }, color: '#b0485a', height: 1.5, desc: 'Plays and music: big cheer' },
  observatory:{ name: 'Observatory', category: 'services', unlockLevel: 7, oreCost: 16, cost: 1000, edu: 60, upkeep: 6, goodsCost: { gears: 4 }, color: '#5a6aa8', height: 2.0, desc: 'Teaches 60 citizens the stars' },
  hospital:   { name: 'Hospital', category: 'services', unlockLevel: 8, woodCost: 10, oreCost: 10, cost: 1200, happy: 10, upkeep: 10, goodsCost: { moonleaf: 8 }, color: '#f0ece0', height: 1.6, desc: 'Keeps the whole city healthy' },
  university: { name: 'University', category: 'services', unlockLevel: 10, oreCost: 24, cost: 2000, edu: 200, happy: 2, upkeep: 14, goodsCost: { emberstone: 10 }, color: '#8a6ac8', height: 2.2, desc: 'Teaches 200 citizens' },
  palisade:   { name: 'Palisade', category: 'military', unlockLevel: 2, woodCost: 6, cost: 120, defense: 12, color: '#8a6a42', height: 0.8, desc: '+12 defense, cheap sharpened logs' },
  watchtower: { name: 'Watchtower', category: 'military', unlockLevel: 3, woodCost: 10, cost: 260, defense: 20, upkeep: 2, color: '#7a5a3a', height: 2.0, desc: '+20 defense, sees raiders coming' },
  armory:     { name: 'Armory', category: 'military', unlockLevel: 5, oreCost: 16, cost: 600, troopCap: 10, atkPm: 40, upkeep: 4, color: '#7a7a8a', height: 1.3, desc: '+4% attack and 10 troop beds' },
  warcamp:    { name: 'War Camp', category: 'military', unlockLevel: 6, woodCost: 12, oreCost: 12, cost: 900, troopCap: 40, upkeep: 14, color: '#a84a3a', height: 1.0, desc: 'Tents for 40 troops' },
  fortress:   { name: 'Fortress', category: 'military', unlockLevel: 8, oreCost: 40, cost: 1600, defense: 90, troopCap: 10, upkeep: 12, goodsCost: { hides: 6 }, color: '#7a6a5a', height: 2.3, desc: '+90 defense, the last line' },
  flowerbed:  { name: 'Flower Bed', category: 'decoration', unlockLevel: 1, woodCost: 1, cost: 40, happy: 1, color: '#e88aa8', height: 0.3, desc: 'A splash of colour' },
  hedge:      { name: 'Hedge', category: 'decoration', unlockLevel: 1, woodCost: 1, cost: 30, happy: 1, color: '#3a7a3a', height: 0.5, desc: 'Neat green walls' },
  well:       { name: 'Well', category: 'decoration', unlockLevel: 2, oreCost: 2, cost: 90, happy: 2, color: '#8aa0b0', height: 0.7, desc: 'Fresh water and a meeting spot' },
  pond:       { name: 'Pond', category: 'decoration', unlockLevel: 3, woodCost: 2, cost: 150, happy: 2, color: '#4fa8d8', height: 0.2, desc: 'Lilies and ducks' },
  arch:       { name: 'Arch', category: 'decoration', unlockLevel: 5, oreCost: 8, cost: 300, happy: 3, color: '#c8b89a', height: 1.6, desc: 'A grand gateway' },
  // wonders: one per people, one per city, never traded
  moontree:   { name: 'Moon Tree', category: 'services', unlockLevel: 8, woodCost: 30, cost: 2500, happy: 12, edu: 60, arc: 'elf', limit: 1, color: '#9fe0c8', height: 2.6, desc: 'Elves only. +12 happiness and 60 school seats' },
  suntemple:  { name: 'Sunken Temple', category: 'military', unlockLevel: 8, woodCost: 20, oreCost: 10, cost: 2500, happy: 8, troopCap: 30, arc: 'lizard', limit: 1, color: '#7aa860', height: 2.0, desc: 'Lizardfolk only. +8 happiness and 30 troop beds' },
  stones:     { name: 'Standing Stones', category: 'military', unlockLevel: 8, woodCost: 20, oreCost: 10, cost: 2500, happy: 10, defense: 40, arc: 'caveman', limit: 1, color: '#a8a090', height: 1.8, desc: 'Cavemen only. +10 happiness and +40 defense' },
  emberthrone:{ name: 'Ember Throne', category: 'commerce', unlockLevel: 8, oreCost: 40, cost: 2500, jobs: 10, output: 40, happy: 4, arc: 'dragon', limit: 1, color: '#e05a3a', height: 2.4, desc: 'Dragonkin only. A hoard that pays: 10 jobs, huge output' },
  scrapspire: { name: 'Scrap Spire', category: 'industry', unlockLevel: 8, woodCost: 10, oreCost: 30, cost: 2500, jobs: 8, output: 20, troopCap: 15, arc: 'goblin', limit: 1, color: '#9ccc3a', height: 2.6, desc: 'Goblins only. 8 jobs, good output and 15 troop beds' },
};
export const BUILDING_KINDS = Object.keys(BUILDINGS) as BuildingKind[];
/** Kinds other cities buy and sell: everything except the wonders. */
export const TRADE_KINDS = BUILDING_KINDS.filter((k) => !BUILDINGS[k].arc);
/** The most attack bonus buildings like the Armory can add. */
export const BUILD_ATK_CAP_PM = 200;


// ---------- arcs: one permanent culture per city ----------
export type ArcId = 'elf' | 'lizard' | 'caveman' | 'dragon' | 'goblin';
export interface ArcMods { attackPm: number; defensePm: number; econPm: number; troopCostPm: number; lootPm: number } // permille, 1000 = neutral
export interface ArcDef {
  id: ArcId; index: number; name: string; tagline: string;
  good: GoodKind;         // the special good only this people can make
  woodPm: number;         // forest abundance (permille, 0 = no forests at all)
  orePm: number;          // mining abundance
  strengths: string[]; unique: string; weaknesses: string[];
  troop: string;          // what soldiers are called
  attackStyle: string;    // flavour for battle logs
  accent: string;         // UI colour
  mods: ArcMods;
}
export const ARCS: ArcDef[] = [
  { id: 'elf', good: 'moonleaf', index: 0, name: 'Elves', tagline: 'Forest guardians: rich woods, thin mountains.', woodPm: 1600, orePm: 400, troop: 'Archer',
    strengths: ['Abundant wood', 'Strong defense (+20%)', 'Better economy (+10%)'], unique: 'Silver-arrow volleys from the treeline',
    weaknesses: ['Scarce ore: soldiers and stone buildings are hard to feed', 'Weaker attack (-5%)', 'Lower loot (-10%)'],
    attackStyle: 'volleys of silver arrows', accent: '#7bd88f', mods: { attackPm: 950, defensePm: 1200, econPm: 1100, troopCostPm: 1000, lootPm: 900 } },
  { id: 'lizard', good: 'spice', index: 1, name: 'Lizardfolk', tagline: 'Swamp raiders: balanced land, cheap venom army.', woodPm: 1100, orePm: 700, troop: 'Skirmisher',
    strengths: ['Cheap soldiers (-10%)', 'Good loot (+10%)', 'Decent wood'], unique: 'Venom ambush strikes',
    weaknesses: ['Middling ore', 'No big bonus in defense or economy'],
    attackStyle: 'venomous ambush strikes', accent: '#c6d84f', mods: { attackPm: 1050, defensePm: 1000, econPm: 1000, troopCostPm: 900, lootPm: 1100 } },
  { id: 'caveman', good: 'hides', index: 2, name: 'Cavemen', tagline: 'Stone-age brawlers: cheap army, simple tools.', woodPm: 1300, orePm: 600, troop: 'Brute',
    strengths: ['Very cheap soldiers (-30%)', 'Strong attack (+10%)', 'Plenty of wood'], unique: 'Thundering club charge',
    weaknesses: ['Poor economy (-10%)', 'Weak defense (-10%)', 'Scarce ore'],
    attackStyle: 'a thundering club charge', accent: '#d9a066', mods: { attackPm: 1100, defensePm: 900, econPm: 900, troopCostPm: 700, lootPm: 1000 } },
  { id: 'dragon', good: 'emberstone', index: 3, name: 'Dragonkin', tagline: 'Volcanic lords: endless ore, not a single forest.', woodPm: 0, orePm: 2000, troop: 'Drake',
    strengths: ['Huge ore output', 'Devastating attack (+25%)', 'Good loot (+10%)'], unique: 'Roaring firestorm',
    weaknesses: ['NO forests: wood must be bought on the market', 'Expensive soldiers (+30%)', 'Weak economy (-15%)'],
    attackStyle: 'a roaring firestorm', accent: '#ef6a4f', mods: { attackPm: 1250, defensePm: 1000, econPm: 850, troopCostPm: 1300, lootPm: 1100 } },
  { id: 'goblin', good: 'gears', index: 4, name: 'Goblins', tagline: 'Scrap scavengers: rich mines, fragile walls.', woodPm: 600, orePm: 1500, troop: 'Grunt',
    strengths: ['Best loot (+30%)', 'Rich ore', 'Cheap soldiers (-20%)'], unique: 'Swarm of sneak-thieves',
    weaknesses: ['Fragile defense (-15%)', 'Scarce wood', 'Weaker attack (-5%)'],
    attackStyle: 'a swarm of sneak-thieves', accent: '#9ccc3a', mods: { attackPm: 950, defensePm: 850, econPm: 1000, troopCostPm: 800, lootPm: 1300 } },
];
export const NEUTRAL_MODS: ArcMods = { attackPm: 1000, defensePm: 1000, econPm: 1000, troopCostPm: 1000, lootPm: 1000 };
export const arcDef = (id: ArcId | null | undefined): ArcDef | null => ARCS.find((a) => a.id === id) ?? null;
export const modsOf = (s: { arc: ArcId | null }): ArcMods => arcDef(s.arc)?.mods ?? NEUTRAL_MODS;
/** Race modifiers combined with the relics on display: what battles and prices actually use. */
export function cityMods(s: GameState): ArcMods {
  const m = modsOf(s), rb = relicBonus(s);
  return {
    ...m,
    attackPm: Math.floor((m.attackPm * (1000 + rb.attack + drillPm(s) + buildAtkPm(s))) / 1000),
    defensePm: Math.floor((m.defensePm * (1000 + rb.defense)) / 1000),
    troopCostPm: Math.floor((m.troopCostPm * (1000 + rb.troopCost)) / 1000),
  };
}
/** Attack bonus (permille) from buildings such as the Armory, weighted by level and capped. */
export function buildAtkPm(s: GameState): number {
  let pm = 0;
  for (const [k, w] of Object.entries(weightedCounts(s).w) as [BuildingKind, number][]) pm += Math.floor(((BUILDINGS[k].atkPm ?? 0) * w) / 1000);
  return Math.min(BUILD_ATK_CAP_PM, pm);
}
export const TROOP_ORE_COST = 2; // ore per soldier (weapons), on top of gold
const pm = (v: number, mod: number) => Math.floor((v * mod) / 1000);

export const TROOP_COST = 40;
export const TROOP_ATTACK = 5;
export const TROOP_DEFENSE = 3;
import { DEF_PLANS, SHIELD_TICKS, launchRaid, loseTroops, logRaid, trainRole, type Army, type DefPlan, type RaidPlan, type RaidReport } from './war';
export const BASE_WAGE = 1;
export const ATTACK_COOLDOWN = 60;

// XP needed to reach level n+1 is LEVEL_XP[n]. Level = number of thresholds reached.
export const LEVEL_XP = [0, 60, 180, 400, 800, 1400, 2200, 3300, 4800, 6800];
export const MAX_LEVEL = LEVEL_XP.length;
export function levelFromXp(xp: number): number {
  let lv = 1;
  for (let i = 1; i < LEVEL_XP.length; i++) if (xp >= LEVEL_XP[i]!) lv = i + 1;
  return lv;
}

export interface Rival { id: string; name: string; attack: number; defense: number; lootPct: number }
export const RIVALS: Rival[] = [
  { id: 'r1', name: 'Port Sable',   attack: 60,  defense: 50,  lootPct: 10 },
  { id: 'r2', name: 'Ironvale',     attack: 130, defense: 110, lootPct: 15 },
  { id: 'r3', name: 'New Cascadia', attack: 260, defense: 220, lootPct: 20 },
  { id: 'r4', name: 'Helios Prime', attack: 520, defense: 450, lootPct: 28 },
];
export const rivalPower = (r: Rival) => r.attack + Math.floor((r.defense * 3) / 2);
export const rivalLoot = (r: Rival) => Math.max(50, Math.floor((r.lootPct * r.defense * 6) / 100));

export interface GameState {
  gold: number;
  pop: number;
  troops: number;
  taxRate: number; // 0..30 percent
  tick: number;
  grid: Cell[][];
  log: string[];
  logSeq: number;          // counts every message ever logged, so a UI can tell which ones are new
  cooldowns: Record<string, number>;
  nextRaidTick: number;
  rng: number; // uint32 PRNG state
  arc: ArcId | null;     // chosen once, permanent (one city per player)
  portrait: number;      // 1..500, drawn once with the people (0 = none yet), see portrait.ts
  wood: number;
  ore: number;
  food: number;
  goods: Record<GoodKind, number>;
  xp: number;
  inventory: Partial<Record<BuildingKind, number>>; // bought on the market, placed for free
  market: Listing[];
  nextListingId: number;
  nextMarketTick: number;
  orders: BuyOrder[];     // standing requests to buy, yours and other mayors'
  post: Record<ResourceKind, number>; // trading post stock, refills slowly
  army: Army;            // troops by role; sum equals `troops`
  spells: { rage: number; heal: number };
  siege: number;          // battering rams in stock
  heroes: Record<string, boolean>; // deployed on attack
  defPlan: DefPlan;       // how the city meets incoming raids
  trophies: number;
  shieldUntil: number;    // tick until which raids are blocked
  raidLog: RaidReport[];  // latest first, max 12
  vault: Record<RelicKind, number>;  // relics kept in the vault (not on display)
  displayed: RelicKind[];            // relics on display, max DISPLAY_SLOTS, each gives its bonus
  finds: number;                     // relics found so far, so a UI can tell a new find
  seen: RelicKind[];                 // every treasure the player has ever owned: their chronicle
  lastFind: { kind: RelicKind; source: BuildingKind; tick: number } | null;
  name: string;                      // the mayor's name; '' until the player picks one
  nameChanges: number;               // renames after the first name; the first one is free
  levels: Record<string, number>;    // "x,y" -> building level 2..3 (missing = level 1)
  record: BattleRecord;              // lifetime battle tally for the profile
  world: World;                      // the other mayors: living cities that grow and raid
  talk: { since: number; n: number }; // citizen talks that paid out in the current minute (see npc.ts)
}
/** Attacks you won and lost, raids on you that your walls held or that broke in. */
export interface BattleRecord { won: number; lost: number; held: number; breached: number }

export interface Listing { id: number; seller: string; kind: ItemKind; qty: number; price: number; arc?: ArcId }
/** Someone wants to buy. Your own orders hold the gold in escrow until filled or cancelled. */
export interface BuyOrder { id: number; buyer: string; kind: ItemKind; qty: number; price: number; arc?: ArcId }
export const YOU = 'you';
export const NPC_SELLERS = ['Aria', 'Bram', 'Cyrus', 'Dara', 'Eli', 'Fenna', 'Goro', 'Hana', 'Ivo', 'Juno'];

export interface Stats {
  housing: number; jobs: number; edu: number; employed: number; unemployed: number;
  eduCoverPm: number; happinessPm: number; productivityPm: number; // permille 0..1000
  gross: number; income: number; upkeep: number; net: number;
  troopCap: number; towerDef: number; attack: number; defense: number;
  econScore: number; chainPower: number; pollution: number;
  level: number; woodRate: number; oreRate: number; troopCost: number;
  /** Most wood, ore or food the storehouse keeps from your own production (purchases may go past it). */
  storeCap: number;
  /** The treasury is empty and buildings still cost upkeep: workers go unpaid. */
  unpaid: boolean;
  foodRate: number; foodUse: number; hungry: boolean; goodsRate: number;
  /** What adds up to happiness, in permille, before clamping to 0..1000. Zero terms are left out. */
  happyParts: { label: string; pm: number }[];
}

// --- deterministic PRNG (mulberry32 on integer state) ---
export function rngNext(s: GameState): number {
  s.rng = (s.rng + 0x6d2b79f5) >>> 0;
  let t = s.rng;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return (t ^ (t >>> 14)) >>> 0;
}
export const rngInt = (s: GameState, n: number) => rngNext(s) % n;

export function newState(seed = 1): GameState {
  const s: GameState = {
    gold: 800, pop: 0, troops: 0, taxRate: 10, tick: 0,
    grid: Array.from({ length: GRID }, () => Array<Cell>(GRID).fill(null)),
    log: ['Welcome, mayor. Build houses, then jobs.'], logSeq: 1,
    cooldowns: {}, nextRaidTick: 120, rng: seed >>> 0,
    arc: null, portrait: 0, wood: 60, ore: 40, food: 40, goods: { moonleaf: 0, spice: 0, hides: 0, emberstone: 0, gears: 0 },
    xp: 0, inventory: {}, market: [], nextListingId: 1, nextMarketTick: 30, orders: [], post: freshPost(),
    army: { vanguard: 0, raider: 0, breaker: 0 }, spells: { rage: 0, heal: 0 }, siege: 0, heroes: {}, defPlan: 'balanced', trophies: 0, shieldUntil: 0, raidLog: [],
    vault: freshVault(), displayed: [], finds: 0, lastFind: null, seen: [],
    name: '', nameChanges: 0, record: { won: 0, lost: 0, held: 0, breached: 0 }, levels: {},
    world: initWorld(seed), talk: { since: 0, n: 0 },
  };
  for (let i = 0; i < 6; i++) addNpcListing(s);
  for (let i = 0; i < 4; i++) addNpcOrder(s);
  return s;
}

export function counts(s: GameState): Partial<Record<BuildingKind, number>> {
  const c: Partial<Record<BuildingKind, number>> = {};
  for (const row of s.grid) for (const b of row) if (b) c[b] = (c[b] ?? 0) + 1;
  return c;
}

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

export function stats(s: GameState): Stats {
  let housing = 0, jobs = 0, edu = 0, parkHappy = 0, pollution = 0, troopCap = 0, towerDef = 0, upkeep = 0, output = 0, food = 0, goods = 0, wood = 0, ore = 0, clean = 0;
  // upgraded buildings count for more: `w` is each kind's count weighted by level, in permille
  const wc = weightedCounts(s), cts = counts(s);
  const by = (v: number | undefined, wpm: number) => Math.floor(((v ?? 0) * wpm) / 1000);
  for (const [k, wpm] of Object.entries(wc.w) as [BuildingKind, number][]) {
    const b = BUILDINGS[k];
    housing += by(b.housing, wpm); jobs += by(b.jobs, wpm); edu += by(b.edu, wpm);
    parkHappy += by(b.happy, wpm); pollution += (b.pollution ?? 0) * (cts[k] ?? 0); // upgrades add no smoke
    troopCap += by(b.troopCap, wpm); towerDef += by(b.defense, wpm);
    upkeep += by(b.upkeep, wc.up[k] ?? 0); output += by(b.output, wpm);
    food += by(b.food, wpm); goods += by(b.goods, wpm);
    wood += by(b.wood, wpm); ore += by(b.ore, wpm); clean += by(b.clean, wpm);
  }
  pollution = Math.max(0, pollution - clean);
  const rb = relicBonus(s);
  upkeep = Math.floor((upkeep * (1000 + rb.upkeep)) / 1000);
  const foodUse = Math.ceil(s.pop / 20);
  const hungry0 = (s.food ?? 0) <= 0 && food < foodUse; // judged on raw farm output, before productivity
  const unpaid = s.gold <= 0 && upkeep > 0;
  const eduCoverPm = s.pop > 0 ? Math.min(1000, Math.floor((edu * 1000) / s.pop)) : edu > 0 ? 1000 : 0;
  const employed = Math.min(s.pop, jobs);
  const unemployed = s.pop - employed;
  const happyParts = [
    { label: 'Base mood', pm: 600 },
    { label: 'Parks and decoration', pm: Math.min(250, parkHappy * 20) },
    { label: 'Low taxes', pm: s.taxRate < 10 ? (10 - s.taxRate) * 8 : 0 },
    { label: 'High taxes', pm: -Math.max(0, s.taxRate - 10) * 25 },
    { label: 'Smoke', pm: -Math.min(300, pollution * 15) },
    { label: 'No work', pm: -(s.pop > 0 ? Math.floor((unemployed * 200) / s.pop) : 0) },
    { label: 'Hunger', pm: hungry0 ? -150 : 0 },
    { label: 'Varied food', pm: hungry0 ? 0 : Math.max(0, foodTypes(s).length - 1) * FOOD_VARIETY_PM },
    { label: 'Relics on display', pm: rb.happy },
    { label: 'Unpaid upkeep', pm: unpaid ? -UNPAID_PM : 0 },
  ].filter((p) => p.pm !== 0);
  const happinessPm = clamp(happyParts.reduce((a, p) => a + p.pm, 0), 0, 1000);
  const productivityPm = Math.floor(
    ((500 + Math.floor(eduCoverPm / 2)) * (400 + Math.floor((600 * happinessPm) / 1000))) / 1000);
  const filledOutput = jobs > 0 ? Math.floor((output * employed) / jobs) : 0;
  const gross = Math.floor((Math.floor(((filledOutput + employed * BASE_WAGE) * productivityPm) / 1000) * (1000 + rb.gold)) / 1000);
  const income = Math.floor((gross * s.taxRate) / 10);
  const net = income - upkeep;
  const abundance = arcDef(s.arc);
  const woodRate = Math.floor((Math.floor((wood * (abundance?.woodPm ?? 1000) * productivityPm) / 1_000_000) * (1000 + rb.wood)) / 1000);
  const oreRate = Math.floor((Math.floor((ore * (abundance?.orePm ?? 1000) * productivityPm) / 1_000_000) * (1000 + rb.ore)) / 1000);
  const foodRate = Math.floor((Math.floor((food * productivityPm) / 1000) * (1000 + rb.food)) / 1000);
  const goodsRate = Math.floor((goods * productivityPm) / 1000);
  const hungry = (s.food ?? 0) <= 0 && foodRate < foodUse;
  const mod = cityMods(s);
  const attack = pm(s.troops * TROOP_ATTACK, mod.attackPm);
  const defense = pm(s.troops * TROOP_DEFENSE + towerDef, mod.defensePm);
  const econScore = pm(gross * 2 + Math.floor(s.pop / 2), mod.econPm);
  const chainPower = econScore + attack + Math.floor((defense * 3) / 2);
  return { housing, jobs, edu, employed, unemployed, eduCoverPm, happinessPm, productivityPm,
    gross, income, upkeep, net, troopCap, towerDef, attack, defense, econScore, chainPower, pollution,
    level: levelFromXp(s.xp), woodRate, oreRate, troopCost: pm(TROOP_COST, mod.troopCostPm), storeCap: storeCap(s), unpaid,
    foodRate, foodUse, hungry, goodsRate, happyParts };
}

export type Result = { ok: true; [k: string]: unknown } | { ok: false; msg: string };

export function addXp(s: GameState, n: number) {
  const before = levelFromXp(s.xp);
  s.xp += n;
  const after = levelFromXp(s.xp);
  if (after > before) pushLog(s, `Level up! You are now level ${after}.`);
}

/** Happiness lost while the treasury is empty and buildings still cost upkeep. */
export const UNPAID_PM = 200;

/** The storehouse: what your own lumber camps, mines and farms can fill, growing with your level. */
export const STORE_BASE = 400;
export const STORE_PER_LEVEL = 250;
export const storeCap = (s: GameState) => STORE_BASE + STORE_PER_LEVEL * (levelFromXp(s.xp) - 1);
const fill = (have: number, add: number, cap: number) => (have >= cap ? have : Math.min(cap, have + add));

/** A people without forests builds in stone: the wood part of any cost is paid in ore instead. */
export function landCost(s: { arc: ArcId | null }, wood: number, ore: number): { wood: number; ore: number } {
  return arcDef(s.arc)?.woodPm === 0 ? { wood: 0, ore: ore + wood } : { wood, ore };
}
/** What building `kind` costs this city in gold, wood and ore. */
export function buildCost(s: { arc: ArcId | null }, kind: BuildingKind): { gold: number; wood: number; ore: number } {
  const b = BUILDINGS[kind];
  return { gold: b.cost, ...landCost(s, b.woodCost ?? 0, b.oreCost ?? 0) };
}

/** Why `kind` cannot go on (x, y) right now, or null when build() would succeed. Pure: never changes `s`. */
export function buildBlocker(s: GameState, x: number, y: number, kind: BuildingKind): string | null {
  const b = BUILDINGS[kind];
  if (!b) return 'Unknown building';
  if (!Number.isInteger(x) || !Number.isInteger(y) || x < 0 || y < 0 || x >= GRID || y >= GRID) return 'Out of bounds';
  if (s.grid[y]![x]) return 'Tile occupied';
  if (levelFromXp(s.xp) < b.unlockLevel) return `${b.name} unlocks at level ${b.unlockLevel}`;
  const arc = arcDef(s.arc);
  if (b.wood && arc && arc.woodPm === 0) return `The ${arc.name} have no forests: buy wood on the market`;
  if (b.ore && arc && arc.orePm === 0) return `The ${arc.name} have no ore`;
  if (b.arc && s.arc !== b.arc) return `Only the ${arcDef(b.arc)!.name} can build the ${b.name}`;
  if (b.limit && !((s.inventory[kind] ?? 0) > 0) && (counts(s)[kind] ?? 0) >= b.limit) return `Your city already has a ${b.name}`;
  if ((s.inventory[kind] ?? 0) > 0) return null;
  const c = buildCost(s, kind);
  if (s.gold < c.gold) return 'Not enough gold';
  if (s.wood < c.wood) return `Not enough wood (need ${c.wood})`;
  if (s.ore < c.ore) return `Not enough ore (need ${c.ore})`;
  for (const [g, n] of Object.entries(b.goodsCost ?? {}) as [GoodKind, number][])
    if (s.goods[g] < n) return `Not enough ${RESOURCES[g].name} (need ${n}). Buy it on the market.`;
  return null;
}

export function build(s: GameState, x: number, y: number, kind: BuildingKind): Result {
  const why = buildBlocker(s, x, y, kind);
  if (why) return { ok: false, msg: why };
  const b = BUILDINGS[kind];
  const stock = s.inventory[kind] ?? 0;
  if (stock > 0) {
    s.inventory[kind] = stock - 1; // placing from storage is a move, not new work: no XP
  } else {
    const c = buildCost(s, kind);
    s.gold -= c.gold; s.wood -= c.wood; s.ore -= c.ore;
    for (const [g, n] of Object.entries(b.goodsCost ?? {}) as [GoodKind, number][]) s.goods[g] -= n;
  }
  s.grid[y]![x] = kind;
  clearLevel(s, x, y);
  if (stock <= 0) addXp(s, Math.floor(b.cost / 10));
  return { ok: true };
}

export function demolish(s: GameState, x: number, y: number): Result {
  const k = s.grid[y]?.[x];
  if (!k) return { ok: false, msg: 'Nothing here' };
  s.grid[y]![x] = null;
  clearLevel(s, x, y); // upgrades are lost with the building
  s.gold += Math.floor(BUILDINGS[k].cost * 0.4);
  return { ok: true };
}

export function setTax(s: GameState, rate: number) {
  s.taxRate = clamp(Math.round(rate), 0, 30);
}

export function trainTroops(s: GameState, n = 1): Result { return trainRole(s, 'vanguard', n); }

export function chooseArc(s: GameState, id: ArcId): Result {
  if (s.arc !== null) return { ok: false, msg: 'Your arc is permanent' };
  const a = arcDef(id);
  if (!a) return { ok: false, msg: 'Unknown arc' };
  s.arc = a.id;
  // a people without forests builds in stone (see landCost): its starting wood comes as ore
  if (a.woodPm === 0) { s.ore += s.wood; s.wood = 0; }
  ensurePortrait(s);
  pushLog(s, `You chose the ${a.name}. Welcome, mayor.`);
  return { ok: true };
}

export function pushLog(s: GameState, msg: string) {
  s.logSeq = (s.logSeq ?? 0) + 1;
  s.log.unshift(msg);
  if (s.log.length > 30) s.log.length = 30;
}

/** The quick raid from the mayors list: the War Room battle with every troop and a plain plan, so both give the same result. */
export const QUICK_RAID: RaidPlan = { commit: 100, focus: 'balanced', rage: false, heal: false, ram: false };
export function attackRival(s: GameState, rivalId: string): Result {
  const r = launchRaid(s, rivalId, QUICK_RAID);
  if (!r.ok || !r.report) return r;
  return { ok: true, win: r.report.win, loot: r.report.loot, lost: r.report.lost, report: r.report };
}

// ---------- marketplace (player-to-player listings; NPC sellers are simulated offline) ----------
export type MaterialKind = 'wood' | 'ore' | 'food';
export type GoodKind = 'moonleaf' | 'spice' | 'hides' | 'emberstone' | 'gears';
export type ResourceKind = MaterialKind | GoodKind;
export type ItemKind = BuildingKind | ResourceKind | RelicKind;
export const GOOD_KINDS: GoodKind[] = ['moonleaf', 'spice', 'hides', 'emberstone', 'gears'];
export const RESOURCE_KINDS: ResourceKind[] = ['wood', 'ore', 'food', ...GOOD_KINDS];
/** Name, fair gold price per unit, and a one-line description of every tradeable raw material. */
export const RESOURCES: Record<ResourceKind, { name: string; price: number; desc: string }> = {
  wood: { name: 'Wood', price: 4, desc: 'Planks for most buildings' },
  ore: { name: 'Ore', price: 6, desc: 'Stone and metal for strong buildings and weapons' },
  food: { name: 'Food', price: 2, desc: 'Every 20 citizens eat 1 per second' },
  moonleaf: { name: 'Moonleaf', price: 14, desc: 'Elven healing herb. Clinics need it.' },
  spice: { name: 'Spice', price: 12, desc: 'Lizardfolk swamp spice. Taverns need it.' },
  hides: { name: 'Hides', price: 10, desc: 'Cavemen furs and leather. Manors need them.' },
  emberstone: { name: 'Emberstone', price: 16, desc: 'Dragonkin fire crystal. Academies need it.' },
  gears: { name: 'Gears', price: 14, desc: 'Goblin clockwork. Banks need them.' },
};
export const RESOURCE_PRICE: Record<ResourceKind, number> = Object.fromEntries(RESOURCE_KINDS.map((k) => [k, RESOURCES[k].price])) as Record<ResourceKind, number>;
export const isResource = (k: ItemKind): k is ResourceKind => k in RESOURCES;
export const isGood = (k: ItemKind): k is GoodKind => (GOOD_KINDS as string[]).includes(k);
export const isBuilding = (k: ItemKind): k is BuildingKind => k in BUILDINGS;
export const MARKET_MAX_NPC = 16;
export const MAX_OWN_LISTINGS = 8;
/** The most simulated buyers pay for your listings, in percent of the fair price.
 * Buildings sell second-hand (below their build cost, so building to sell never prints gold); raw goods sell a little above. */
export function buyerCapPct(kind: ItemKind): number { return isRelic(kind) ? 125 : isBuilding(kind) ? 70 : 110; }

export function fairPrice(kind: ItemKind): number { return isResource(kind) ? RESOURCES[kind].price : isRelic(kind) ? RELICS[kind].price : BUILDINGS[kind].cost; }
export const itemName = (k: ItemKind) => (isResource(k) ? RESOURCES[k].name : isRelic(k) ? RELICS[k].name : BUILDINGS[k].name);
/** Which people makes a special good. */
export const goodMaker = (g: GoodKind): ArcDef => ARCS.find((a) => a.good === g)!;

/** Simulated mayors of other cities, one per people, so trade has a face. */
export const NPC_CITIES: { name: string; mayor: string; arc: ArcId }[] = [
  { name: 'Silverbough', mayor: 'Aria', arc: 'elf' }, { name: 'Glimmerwood', mayor: 'Fenna', arc: 'elf' },
  { name: 'Mirefang', mayor: 'Sskar', arc: 'lizard' }, { name: 'Saltreed', mayor: 'Ivo', arc: 'lizard' },
  { name: 'Boulderhome', mayor: 'Grug', arc: 'caveman' }, { name: 'Tusk Hollow', mayor: 'Bram', arc: 'caveman' },
  { name: 'Ember Hold', mayor: 'Cyrus', arc: 'dragon' }, { name: 'Ashpeak', mayor: 'Dara', arc: 'dragon' },
  { name: 'Scrapton', mayor: 'Nix', arc: 'goblin' }, { name: 'Rustgulch', mayor: 'Goro', arc: 'goblin' },
];
export const cityOf = (name: string) => NPC_CITIES.find((c) => c.name === name);

/** Buildings worth trading with this player: none that their land cannot run (no forests = no wood buildings). */
export function tradeKindsFor(s: { arc: ArcId | null }): BuildingKind[] {
  const a = arcDef(s.arc);
  if (!a || (a.woodPm > 0 && a.orePm > 0)) return TRADE_KINDS;
  return TRADE_KINDS.filter((k) => !(a.woodPm === 0 && BUILDINGS[k].wood) && !(a.orePm === 0 && BUILDINGS[k].ore));
}
/** What another city puts up for sale: mostly its own special good and what its land is rich in. */
function npcOffer(s: GameState, arc: ArcDef): ItemKind {
  const r = rngInt(s, 100);
  if (r < 45) return arc.good;
  if (r < 60) return 'food';
  if (r < 75) return arc.orePm >= arc.woodPm ? 'ore' : 'wood';
  const kinds = tradeKindsFor(s);
  return kinds[rngInt(s, kinds.length)]!;
}
/** What another city asks for: special goods it cannot make, or what its land lacks. */
function npcNeed(s: GameState, arc: ArcDef): ItemKind {
  const r = rngInt(s, 100);
  if (r < 55) { const others = GOOD_KINDS.filter((g) => g !== arc.good); return others[rngInt(s, others.length)]!; }
  if (r < 70) return 'food';
  if (r < 88) return arc.woodPm <= arc.orePm ? 'wood' : 'ore';
  const kinds = tradeKindsFor(s);
  return kinds[rngInt(s, kinds.length)]!;
}

/** A relic another city might trade: mostly rare, sometimes epic, seldom legendary, never super legendary. */
function npcRelic(s: GameState): RelicKind {
  const r = rngInt(s, 100);
  const rarity: Rarity = r < 70 ? 'rare' : r < 95 ? 'epic' : 'legendary';
  const pool = RELIC_KINDS.filter((k) => RELICS[k].rarity === rarity);
  return pool[rngInt(s, pool.length)]!;
}

export function addNpcListing(s: GameState) {
  const city = NPC_CITIES[rngInt(s, NPC_CITIES.length)]!;
  const relic = rngInt(s, 1000) < 15; // 1.5% of offers are a relic, priced well above its worth
  const kind: ItemKind = relic ? npcRelic(s) : npcOffer(s, arcDef(city.arc)!);
  const resource = isResource(kind);
  const price = Math.max(1, Math.floor((fairPrice(kind) * (relic ? 130 + rngInt(s, 71) : 75 + rngInt(s, 56))) / 100));
  const qty = relic ? 1 : !resource ? 1 + rngInt(s, 3) : isGood(kind) ? 4 + rngInt(s, 12) : 10 + rngInt(s, 31);
  s.market.push({ id: s.nextListingId++, seller: city.name, kind, qty, price, arc: city.arc });
  const npc = s.market.filter((l) => l.seller !== YOU);
  if (npc.length > MARKET_MAX_NPC) {
    const drop = npc[0]!.id;
    s.market = s.market.filter((l) => l.id !== drop);
  }
}

export function addNpcOrder(s: GameState) {
  const city = NPC_CITIES[rngInt(s, NPC_CITIES.length)]!;
  const relic = rngInt(s, 1000) < 20; // 2% of requests are collectors hunting a relic
  const kind: ItemKind = relic ? npcRelic(s) : npcNeed(s, arcDef(city.arc)!);
  const price = Math.max(1, Math.floor((fairPrice(kind) * (relic ? 110 + rngInt(s, 51) : 90 + rngInt(s, 51))) / 100));
  const qty = !isResource(kind) ? 1 : isGood(kind) ? 3 + rngInt(s, 8) : 10 + rngInt(s, 21);
  s.orders.push({ id: s.nextListingId++, buyer: city.name, kind, qty, price, arc: city.arc });
  const npc = s.orders.filter((o) => o.buyer !== YOU);
  if (npc.length > 10) { const drop = npc[0]!.id; s.orders = s.orders.filter((o) => o.id !== drop); }
}

export function stockOf(s: GameState, k: ItemKind): number {
  if (k === 'wood' || k === 'ore' || k === 'food') return s[k];
  if (isGood(k)) return s.goods[k];
  if (isRelic(k)) return s.vault?.[k] ?? 0;
  return s.inventory[k] ?? 0;
}
export function addStock(s: GameState, k: ItemKind, n: number) {
  if (k === 'wood' || k === 'ore' || k === 'food') s[k] += n;
  else if (isGood(k)) s.goods[k] += n;
  else if (isRelic(k)) { s.vault[k] = (s.vault[k] ?? 0) + n; if (n > 0) discover(s, k); }
  else s.inventory[k] = (s.inventory[k] ?? 0) + n;
}

export function listForSale(s: GameState, kind: ItemKind, qty: number, price: number): Result {
  if (!Number.isInteger(qty) || qty < 1) return { ok: false, msg: 'Invalid quantity' };
  if (!Number.isInteger(price) || price < 1 || price > fairPrice(kind) * 10) return { ok: false, msg: 'Invalid price' };
  if (isBuilding(kind) && BUILDINGS[kind].arc) return { ok: false, msg: 'Wonders cannot be sold' };
  if (stockOf(s, kind) < qty) return { ok: false, msg: 'Not enough in stock' };
  if (s.market.filter((l) => l.seller === YOU).length >= MAX_OWN_LISTINGS) return { ok: false, msg: `You can have ${MAX_OWN_LISTINGS} listings at most` };
  addStock(s, kind, -qty);
  s.market.push({ id: s.nextListingId++, seller: YOU, kind, qty, price });
  pushLog(s, `Listed ${qty} x ${itemName(kind)} at ${price}g each.`);
  return { ok: true };
}

export function cancelListing(s: GameState, id: number): Result {
  const l = s.market.find((x) => x.id === id);
  if (!l || l.seller !== YOU) return { ok: false, msg: 'Not your listing' };
  s.market = s.market.filter((x) => x.id !== id);
  addStock(s, l.kind, l.qty);
  return { ok: true };
}

/** Buy `amount` units (default 1) from a listing, at most what it holds and what you can afford. */
export function buyListing(s: GameState, id: number, amount = 1): Result {
  const l = s.market.find((x) => x.id === id);
  if (!l) return { ok: false, msg: 'Listing is gone' };
  if (l.seller === YOU) return { ok: false, msg: 'Cannot buy your own listing' };
  if (isBuilding(l.kind)) {
    const b = BUILDINGS[l.kind];
    if (levelFromXp(s.xp) < b.unlockLevel) return { ok: false, msg: `${b.name} unlocks at level ${b.unlockLevel}` };
  }
  const n = Math.min(Math.max(1, Math.floor(amount)), l.qty, Math.floor(s.gold / l.price));
  if (n < 1) return { ok: false, msg: 'Not enough gold' };
  s.gold -= n * l.price;
  addStock(s, l.kind, n);
  l.qty -= n;
  if (l.qty <= 0) s.market = s.market.filter((x) => x.id !== id);
  pushLog(s, `Bought ${n} ${itemName(l.kind)} for ${n * l.price} gold from ${l.seller}.`);
  return { ok: true, n };
}

function marketStep(s: GameState) {
  if (s.tick >= s.nextMarketTick) {
    s.nextMarketTick = s.tick + 30 + rngInt(s, 30);
    addNpcListing(s);
    if (rngInt(s, 100) < 60) addNpcOrder(s);
  }
  tradeStep(s);
  // simulated buyers take your listings when the price is fair
  for (const l of s.market.slice()) {
    if (l.seller !== YOU) continue;
    if (l.price <= Math.floor((fairPrice(l.kind) * buyerCapPct(l.kind)) / 100) && rngInt(s, 100) < (isRelic(l.kind) ? 1 : 3)) {
      const n = isResource(l.kind) ? Math.min(l.qty, 5) : 1;
      s.gold += n * l.price;
      l.qty -= n;
      pushLog(s, `A buyer took ${n} ${itemName(l.kind)} from you for ${n * l.price} gold.`);
      if (l.qty <= 0) s.market = s.market.filter((x) => x.id !== l.id);
    }
  }
}

/** Advance one game second. */
/** Rivals strong enough to be sent against you, given your ChainPower (the raid timer picks one of them). */
export function raidThreats(s: GameState): Rival[] {
  const cp = stats(s).chainPower;
  if (s.world) return s.world.mayors.map(mayorRival).filter((r) => rivalPower(r) <= Math.floor((cp * 16) / 10) + 60);
  return RIVALS.filter((r) => rivalPower(r) <= Math.floor((cp * 16) / 10) + 60);
}

export function step(s: GameState): GameState {
  s.tick++;
  const st = stats(s);
  s.gold = Math.max(0, s.gold + st.net);
  const cap = st.storeCap;
  s.wood = fill(s.wood, st.woodRate, cap);
  s.ore = fill(s.ore, st.oreRate, cap);
  s.food = Math.max(0, fill(s.food, st.foodRate, cap) - st.foodUse);
  if (s.gold === 0 && st.net < 0 && s.tick % 15 === 0) pushLog(s, 'The treasury is empty: workers go unpaid and the city grows unhappy. Raise taxes or demolish costly buildings.');
  const mine = arcDef(s.arc);
  if (mine && st.goodsRate > 0) s.goods[mine.good] += st.goodsRate;
  if (st.hungry && s.tick % 15 === 0) pushLog(s, 'Your citizens are hungry! Build farms or buy food.');
  marketStep(s);
  findStep(s);
  worldStep(s);

  const room = st.housing - s.pop;
  if (room > 0 && st.happinessPm >= 300) {
    const ratePm = Math.floor((80 * (300 + Math.floor((700 * st.eduCoverPm) / 1000)) * st.happinessPm) / 1_000_000);
    const chance = rngInt(s, 100) < 60 ? 1 : 0;
    s.pop = Math.min(st.housing, s.pop + Math.max(chance, Math.floor((room * ratePm) / 1000)));
  } else if (st.happinessPm < 250 && s.pop > 0) {
    s.pop -= 1;
    if (s.tick % 10 === 0) pushLog(s, 'Unhappy citizens are leaving! Lower taxes or build parks.');
  } else if (s.pop > st.housing) {
    s.pop = st.housing;
  }

  if (s.tick >= s.nextRaidTick) {
    s.nextRaidTick = s.tick + 90 + rngInt(s, 60);
    const now = stats(s);
    const picked = pickRaider(s, now.chainPower);
    const pool = picked ? [] : raidThreats(s);
    const r = picked ?? (pool.length ? pool[rngInt(s, pool.length)]! : s.world ? mayorRival(s.world.mayors.reduce((w, m) => (mayorPower(m) < mayorPower(w) ? m : w))) : RIVALS[0]!);
    if (s.tick < s.shieldUntil) {
      pushLog(s, `${r.name} found your shield up and turned back.`);
    } else {
      const plan = DEF_PLANS[s.defPlan];
      const effDef = Math.floor((now.defense * plan.defPm) / 1000);
      if (r.attack > effDef) {
        const stolen = Math.floor((Math.floor((s.gold * Math.min(30, r.lootPct)) / 100) * plan.stolenPm) / 1000);
        const lost = Math.floor((s.troops * 20) / 100);
        s.gold -= stolen; loseTroops(s, lost);
        s.shieldUntil = s.tick + SHIELD_TICKS;
        s.trophies = Math.max(0, s.trophies - 6);
        logRaid(s, { tick: s.tick, by: r.name, won: false, stolen, lost, def: effDef, atk: r.attack });
        s.record.breached++;
        applyRaidOnYou(s, r.id, { stolen, held: false });
        pushNews(s, 'you', `${r.name} raided you and took ${stolen} gold.`);
        pushLog(s, `${r.name} raided you (atk ${r.attack} > def ${effDef}): -${stolen} gold, -${lost} troops. Shield up for ${SHIELD_TICKS}s.`);
      } else {
        s.trophies += 3;
        logRaid(s, { tick: s.tick, by: r.name, won: true, stolen: 0, lost: 0, def: effDef, atk: r.attack });
        s.record.held++;
        applyRaidOnYou(s, r.id, { stolen: 0, held: true });
        pushNews(s, 'you', `${r.name} attacked you and was turned back.`);
        pushLog(s, `${r.name} attacked but your defense (${effDef}) held.`);
      }
    }
  }
  return s;
}
export * from './social';
export * from './city';
export * from './war';
export * from './npc';
export * from './trade';
import { freshPost, tradeStep } from './trade';
export * from './vault';
export * from './upgrade';
import { clearLevel, drillPm, foodTypes, FOOD_VARIETY_PM, weightedCounts } from './upgrade';
import { RELICS, RELIC_KINDS, discover, findStep, freshVault, isRelic, relicBonus, type Rarity, type RelicKind } from './vault';
export * from './names';
export * from './world';
export * from './portrait';
import { ensurePortrait } from './portrait';
import { MAX_LOOT_PCT, applyRaidOnYou, applyRaidToMayor, findMayor, findRival, initWorld, mayorPower, mayorRival, pickRaider, pushNews, worldStep, type World } from './world';
