// War room: army roles, heroes, spells, siege, scouting, raids with stars, defense plans.
// Deterministic and integer-only; randomness comes from the state's PRNG.
import {
  applyRaidToMayor, findMayor, findRival, pushNews, MAX_LOOT_PCT, TROOP_ATTACK, addXp, arcDef, cityMods, levelFromXp, pushLog, rivalLoot, rngInt, stats,
  ATTACK_COOLDOWN, type GameState, type Result, type Rival,
} from './index';

const pm = (v: number, mod: number) => Math.floor((v * mod) / 1000);
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

export type Role = 'vanguard' | 'raider' | 'breaker';
export type Army = Record<Role, number>;
export const ROLES: Role[] = ['vanguard', 'raider', 'breaker'];
export interface RoleDef { id: Role; name: string; desc: string; atkPm: number; lossPm: number; lootPm: number; costPm: number; ore: number }
export const ROLE_DEFS: Record<Role, RoleDef> = {
  vanguard: { id: 'vanguard', name: 'Vanguard', desc: 'Tough front line: fewer losses, weaker loot.', atkPm: 900, lossPm: 600, lootPm: 800, costPm: 1000, ore: 2 },
  raider:   { id: 'raider',   name: 'Raider',   desc: 'Fast looters: +60% loot, take heavy losses.', atkPm: 1000, lossPm: 1100, lootPm: 1600, costPm: 900, ore: 2 },
  breaker:  { id: 'breaker',  name: 'Breaker',  desc: 'Siege fighters: ignore half of tower defense.', atkPm: 1100, lossPm: 1000, lootPm: 800, costPm: 1300, ore: 3 },
};

export interface HeroDef { id: string; name: string; unlock: number; atkPm: number; lootPm: number; lossPm: number; defPm: number; desc: string }
export const HEROES: HeroDef[] = [
  { id: 'champion',   name: 'Champion',   unlock: 2, atkPm: 100, lootPm: 0,   lossPm: 0,   defPm: 0,   desc: '+10% attack' },
  { id: 'warden',     name: 'Warden',     unlock: 4, atkPm: 0,   lootPm: 0,   lossPm: -150, defPm: 150, desc: '-15% losses, +15% defense at home' },
  { id: 'plunderer',  name: 'Plunderer',  unlock: 6, atkPm: 0,   lootPm: 250, lossPm: 0,   defPm: 0,   desc: '+25% loot' },
  { id: 'warlord',    name: 'Warlord',    unlock: 8, atkPm: 200, lootPm: 100, lossPm: 0,   defPm: 0,   desc: '+20% attack, +10% loot' },
];
export const heroDeployed = (s: GameState): HeroDef[] => HEROES.filter((h) => s.heroes[h.id] && levelFromXp(s.xp) >= h.unlock);

export const SPELL_COST = { rage: 80, heal: 80 };
export const SPELL_MAX = 5;
export const RAM_COST = { gold: 150, ore: 10 };
export const RAM_MAX = 2;
export const SHIELD_TICKS = 300;

export type DefPlan = 'bastion' | 'vault' | 'balanced';
export const DEF_PLANS: Record<DefPlan, { name: string; desc: string; defPm: number; stolenPm: number }> = {
  balanced: { name: 'Balanced', desc: 'No bonuses, no penalties.', defPm: 1000, stolenPm: 1000 },
  bastion:  { name: 'Bastion',  desc: '+20% defense. Best against strong raiders.', defPm: 1200, stolenPm: 1000 },
  vault:    { name: 'Vault',    desc: 'Hide your gold: raiders steal 50% less, but defense is -10%.', defPm: 900, stolenPm: 500 },
};

export interface RaidReport { tick: number; by: string; won: boolean; stolen: number; lost: number; def: number; atk: number }
export function logRaid(s: GameState, r: RaidReport) { s.raidLog.unshift(r); if (s.raidLog.length > 12) s.raidLog.length = 12; }

/** Keep `army` consistent with `troops` (old saves, other code paths). */
export function armyOf(s: GameState): Army {
  const a = s.army;
  const sum = a.vanguard + a.raider + a.breaker;
  if (sum < s.troops) a.vanguard += s.troops - sum;
  else if (sum > s.troops) {
    let extra = sum - s.troops;
    for (const r of ['breaker', 'raider', 'vanguard'] as Role[]) { const d = Math.min(extra, a[r]); a[r] -= d; extra -= d; }
  }
  return a;
}

/** Remove n troops, proportionally across roles. */
export function loseTroops(s: GameState, n: number, only?: Army) {
  const a = armyOf(s);
  let left = Math.min(n, s.troops);
  const pool = only ?? a;
  const total = pool.vanguard + pool.raider + pool.breaker;
  if (total <= 0) { s.troops -= left; return; }
  let removed = 0;
  for (const r of ROLES) {
    const d = Math.min(a[r], Math.floor((left * pool[r]) / total));
    a[r] -= d; removed += d;
  }
  for (const r of ROLES) { if (removed >= left) break; if (a[r] > 0 && pool[r] > 0) { a[r]--; removed++; } }
  s.troops = a.vanguard + a.raider + a.breaker;
}

export function trainRole(s: GameState, role: Role, n = 1): Result {
  const st = stats(s);
  const d = ROLE_DEFS[role];
  const room = st.troopCap - s.troops;
  if (room <= 0) return { ok: false, msg: st.troopCap === 0 ? 'Build barracks first' : 'Barracks full' };
  const gold = Math.max(1, pm(st.troopCost, d.costPm));
  const k = Math.min(n, room, Math.floor(s.gold / gold), Math.floor(s.ore / d.ore));
  if (k <= 0) return { ok: false, msg: s.gold < gold ? 'Not enough gold' : `Not enough ore (each ${d.name} needs ${d.ore})` };
  armyOf(s);
  s.gold -= k * gold; s.ore -= k * d.ore;
  s.army[role] += k; s.troops += k;
  return { ok: true, n: k };
}
export const roleCost = (s: GameState, role: Role) => ({ gold: Math.max(1, pm(stats(s).troopCost, ROLE_DEFS[role].costPm)), ore: ROLE_DEFS[role].ore });

export function brewSpell(s: GameState, kind: 'rage' | 'heal'): Result {
  if (s.spells[kind] >= SPELL_MAX) return { ok: false, msg: 'Spell storage full' };
  if (s.gold < SPELL_COST[kind]) return { ok: false, msg: 'Not enough gold' };
  s.gold -= SPELL_COST[kind]; s.spells[kind]++;
  return { ok: true };
}
export function buildRam(s: GameState): Result {
  if (s.siege >= RAM_MAX) return { ok: false, msg: 'Siege workshop full' };
  if (s.gold < RAM_COST.gold) return { ok: false, msg: 'Not enough gold' };
  if (s.ore < RAM_COST.ore) return { ok: false, msg: 'Not enough ore' };
  s.gold -= RAM_COST.gold; s.ore -= RAM_COST.ore; s.siege++;
  return { ok: true };
}
export function toggleHero(s: GameState, id: string): Result {
  const h = HEROES.find((x) => x.id === id);
  if (!h) return { ok: false, msg: 'Unknown hero' };
  if (levelFromXp(s.xp) < h.unlock) return { ok: false, msg: `${h.name} unlocks at level ${h.unlock}` };
  s.heroes[id] = !s.heroes[id];
  return { ok: true };
}
export function setDefPlan(s: GameState, p: DefPlan): Result {
  if (!(p in DEF_PLANS)) return { ok: false, msg: 'Unknown plan' };
  s.defPlan = p; return { ok: true };
}

// ---------- army recipes ----------
export interface Recipe { id: string; name: string; desc: string; mix: Army }
export const RECIPES: Recipe[] = [
  { id: 'balanced', name: 'Balanced Host', desc: 'A bit of everything. Safe against unknown cities.', mix: { vanguard: 4, raider: 3, breaker: 3 } },
  { id: 'loot', name: 'Loot Run', desc: 'Many Raiders for gold. Use against Hoarder cities with weak defense.', mix: { vanguard: 2, raider: 7, breaker: 1 } },
  { id: 'siege', name: 'Siege Wall', desc: 'Breakers crack tower-heavy Bastion cities.', mix: { vanguard: 2, raider: 1, breaker: 7 } },
  { id: 'shield', name: 'Iron Line', desc: 'Vanguards survive Militia cities with few losses.', mix: { vanguard: 7, raider: 1, breaker: 2 } },
];
/** Train as many units of the recipe (scaled by `times`) as gold, ore and barracks allow. */
export function trainRecipe(s: GameState, r: Recipe, times = 1): Result {
  let total = 0;
  for (let t = 0; t < times; t++) for (const role of ROLES) { const res = trainRole(s, role, r.mix[role]); if (res.ok) total += res.n as number; }
  return total > 0 ? { ok: true, n: total } : { ok: false, msg: 'Cannot train: barracks, gold or ore' };
}

// ---------- scouting ----------
export type Trait = 'bastion' | 'militia' | 'hoarder';
export const TRAITS: Record<Trait, { name: string; hint: string; towerPct: number; defPm: number; lootPm: number }> = {
  bastion: { name: 'Bastion', hint: 'Tower-heavy. Bring Breakers and a ram.', towerPct: 60, defPm: 1000, lootPm: 1000 },
  militia: { name: 'Militia', hint: 'Garrison-heavy. Bring Vanguards.', towerPct: 20, defPm: 1000, lootPm: 1000 },
  hoarder: { name: 'Hoarder', hint: 'Weak defense, fat vaults. Bring Raiders.', towerPct: 30, defPm: 800, lootPm: 1500 },
};
export type Tile = 'hall' | 'tower' | 'wall' | 'store' | 'house' | 'barracks' | null;
export interface Scout { trait: Trait; defense: number; towerDef: number; garrison: number; towers: number; stores: number; loot: number; grid: Tile[][] }
const TRAIT_OF: Record<string, Trait> = { r1: 'hoarder', r2: 'militia', r3: 'bastion', r4: 'militia' };

/** Mayors have no fixed trait: derive a stable one from their id. */
function traitOf(id: string): Trait {
  if (TRAIT_OF[id]) return TRAIT_OF[id]!;
  let h = 0; for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return (['bastion', 'militia', 'hoarder'] as const)[h % 3]!;
}
export function scout(r: Rival): Scout {
  const trait = traitOf(r.id);
  const t = TRAITS[trait];
  const defense = pm(r.defense, t.defPm);
  const towerDef = Math.floor((defense * t.towerPct) / 100);
  const garrison = defense - towerDef;
  const towers = Math.max(1, Math.ceil(towerDef / 40));
  const stores = Math.max(1, Math.ceil(pm(rivalLoot(r), t.lootPm) / 60));
  const N = 11;
  const grid: Tile[][] = Array.from({ length: N }, () => Array<Tile>(N).fill(null));
  let seed = 0; for (const ch of r.id) seed = (seed * 31 + ch.charCodeAt(0)) >>> 0;
  const rnd = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed >>> 8; };
  for (let i = 1; i < N - 1; i++) { grid[1]![i] = 'wall'; grid[N - 2]![i] = 'wall'; grid[i]![1] = 'wall'; grid[i]![N - 2] = 'wall'; }
  grid[5]![5] = 'hall';
  const place = (tile: Tile, n: number, lo: number, hi: number) => {
    for (let placed = 0, tries = 0; placed < n && tries < 400; tries++) {
      const x = lo + (rnd() % (hi - lo + 1)), y = lo + (rnd() % (hi - lo + 1));
      if (!grid[y]![x]) { grid[y]![x] = tile; placed++; }
    }
  };
  place('tower', Math.min(towers, 8), 2, 8);
  place('store', Math.min(stores, 6), 3, 7);
  place('barracks', 2, 2, 8);
  place('house', 8, 0, 10);
  return { trait, defense, towerDef, garrison, towers, stores, loot: pm(rivalLoot(r), t.lootPm), grid };
}

// ---------- battle ----------
export type Focus = 'loot' | 'balanced' | 'trophy';
export interface RaidPlan { commit: number; focus: Focus; rage: boolean; heal: boolean; ram: boolean }
export interface Round { title: string; text: string }
export interface BattleReport {
  rival: string; trait: Trait; sent: number; destruction: number; stars: number; loot: number; lost: number;
  trophies: number; xp: number; force: number; effDefense: number; rounds: Round[]; win: boolean;
}

function compute(s: GameState, r: Rival, plan: RaidPlan, roll: number) {
  const a = armyOf(s);
  const commit = clamp(Math.round(plan.commit), 10, 100);
  const sent: Army = { vanguard: Math.floor((a.vanguard * commit) / 100), raider: Math.floor((a.raider * commit) / 100), breaker: Math.floor((a.breaker * commit) / 100) };
  let n = sent.vanguard + sent.raider + sent.breaker;
  if (n === 0 && s.troops > 0) { const r0 = ROLES.find((x) => a[x] > 0)!; sent[r0] = 1; n = 1; }
  const sc = scout(r);
  const heroes = heroDeployed(s);
  const mods = cityMods(s);
  let atkRaw = 0, lootW = 0, lossW = 0;
  for (const role of ROLES) {
    const d = ROLE_DEFS[role];
    atkRaw += sent[role] * TROOP_ATTACK * d.atkPm / 1000;
    lootW += sent[role] * d.lootPm; lossW += sent[role] * d.lossPm;
  }
  const heroAtk = 1000 + heroes.reduce((x, h) => x + h.atkPm, 0);
  const heroLoot = 1000 + heroes.reduce((x, h) => x + h.lootPm, 0);
  const heroLoss = 1000 + heroes.reduce((x, h) => x + h.lossPm, 0);
  const rage = plan.rage && s.spells.rage > 0 ? 1300 : 1000;
  const heal = plan.heal && s.spells.heal > 0 ? 600 : 1000;
  const ram = plan.ram && s.siege > 0;
  const bypass = n > 0 ? Math.min(800, Math.floor((sent.breaker * 500) / n) + (ram ? 250 : 0)) : 0;
  const effDef = Math.max(1, sc.garrison + Math.floor((sc.towerDef * (1000 - bypass)) / 1000));
  const force = Math.floor((pm(pm(Math.floor(atkRaw), mods.attackPm), heroAtk) * rage * roll) / 1_000_000);
  const destruction = clamp(Math.floor((force * 65) / effDef), 0, 100);
  const stars = destruction >= 100 ? 3 : destruction >= 75 ? 2 : destruction >= 50 ? 1 : 0;
  const focusLoot = plan.focus === 'loot' ? 1200 : plan.focus === 'trophy' ? 700 : 1000;
  const loot = n > 0 ? pm(pm(pm(Math.floor((sc.loot * destruction) / 100), focusLoot), n > 0 ? Math.floor(lootW / n) : 1000), pm(heroLoot, mods.lootPm)) : 0;
  const lossBase = 25 + Math.floor(((100 - destruction) * 3) / 10); // percent of sent
  const lost = n > 0 ? Math.min(n, Math.max(1, Math.floor((n * lossBase * pm(pm(Math.floor(lossW / n), heroLoss), heal)) / 1_000_000))) : 0;
  const trophies = stars === 0 ? -5 : Math.floor(stars * 8 * (plan.focus === 'trophy' ? 1.5 : 1));
  return { sent, n, sc, force, effDef, destruction, stars, loot, lost, trophies, ram, rageUsed: rage > 1000, healUsed: heal < 1000, bypass };
}

/** Expected result with a neutral roll, no side effects. */
export function previewRaid(s: GameState, rivalId: string, plan: RaidPlan) {
  const r = findRival(s, rivalId);
  if (!r || s.troops <= 0) return null;
  const c = compute(s, r, plan, 1000);
  const m = findMayor(s, r.id);
  const loot = m ? Math.min(c.loot, Math.floor((m.gold * MAX_LOOT_PCT) / 100)) : c.loot; // a treasury only gives what it holds
  return { force: c.force, effDefense: c.effDef, destruction: c.destruction, stars: c.stars, loot, lost: c.lost, sent: c.n };
}

export function launchRaid(s: GameState, rivalId: string, plan: RaidPlan): Result & { report?: BattleReport } {
  const r = findRival(s, rivalId);
  if (!r) return { ok: false, msg: 'Unknown city' };
  if (s.troops <= 0) return { ok: false, msg: 'No troops. Train some in the Army tab.' };
  const cd = s.cooldowns[r.id] ?? 0;
  if (cd > s.tick) return { ok: false, msg: `${r.name} is recovering, wait ${cd - s.tick}s` };
  const mayor = findMayor(s, r.id);
  if (mayor && mayor.shieldUntil > s.tick) return { ok: false, msg: `${r.name} is shielded for ${mayor.shieldUntil - s.tick}s` };
  const c = compute(s, r, plan, 850 + rngInt(s, 300));
  // a real treasury can only give what it holds: loot comes out of the mayor's gold
  if (mayor) c.loot = Math.min(c.loot, Math.floor((mayor.gold * MAX_LOOT_PCT) / 100));
  if (c.rageUsed) s.spells.rage--;
  if (c.healUsed) s.spells.heal--;
  if (c.ram) s.siege--;
  s.cooldowns[r.id] = s.tick + ATTACK_COOLDOWN;
  s.gold += c.loot;
  loseTroops(s, c.lost, c.sent);
  s.trophies = Math.max(0, s.trophies + c.trophies);
  const xp = c.stars >= 1 ? 15 + 10 * c.stars : 5;
  addXp(s, xp);
  const win = c.stars >= 1;
  if (win) s.record.won++; else s.record.lost++;
  if (mayor) {
    applyRaidToMayor(s, mayor, { loot: c.loot, stars: c.stars, win });
    pushNews(s, 'you', win ? `You raided ${mayor.name} and took ${c.loot} gold.` : `Your raid on ${mayor.name} was thrown back.`);
  }
  const style = arcDef(s.arc)?.attackStyle ?? 'a bold assault';
  const rounds: Round[] = [
    { title: 'Approach', text: `${c.n} troops march on ${r.name} (${TRAITS[c.sc.trait].name}). ${style}.` },
    { title: 'Breach', text: `Towers fall to ${Math.round(c.bypass / 10)}% bypass${c.ram ? ' with the ram' : ''}. Force ${c.force} vs defense ${c.effDef}.` },
    { title: 'Plunder', text: `${c.destruction}% destroyed, ${c.stars} star${c.stars === 1 ? '' : 's'}. +${c.loot} gold, -${c.lost} troops.` },
  ];
  pushLog(s, `${win ? 'Victory' : 'Defeat'} at ${r.name}: ${c.stars}★, +${c.loot} gold, lost ${c.lost} troops.`);
  const report: BattleReport = { rival: r.name, trait: c.sc.trait, sent: c.n, destruction: c.destruction, stars: c.stars, loot: c.loot, lost: c.lost, trophies: c.trophies, xp, force: c.force, effDefense: c.effDef, rounds, win };
  return { ok: true, win, report };
}
