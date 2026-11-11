// The living world: the other mayors are real cities with a treasury, an army and moods.
// They grow, raid each other and raid you, and what a raid takes comes out of the loser's treasury.
// Everything here is deterministic and integer-only, with its own PRNG so it never disturbs the
// city's random numbers. There is no backend yet: the contract will later replace these mayors
// with real players, keeping the same shapes (a mayor row, a rival view, a news line).
import { ARCS, RIVALS, type ArcId, type BattleRecord, type GameState, type Rival } from './index';
import { fantasyName, FANTASY_NAME_COUNT } from './names';
import type { PlayerRow } from './social';

export const WORLD_MAYORS = 40;
/** The world moves every this many ticks. */
export const WORLD_STEP_TICKS = 10;
export const MAX_MAYOR_LEVEL = 10;
/** A raid never takes more than this share of a treasury. */
export const MAX_LOOT_PCT = 35;
/** How long a mayor is left alone after being breached. */
export const MAYOR_SHIELD_TICKS = 300;
export const NEWS_MAX = 40;

export interface Mayor {
  id: string;
  name: string;
  arc: ArcId;
  level: number;
  /** The treasury. Raids move gold between treasuries, so it is zero-sum apart from income. */
  gold: number;
  /** 0..100: recent losses. Weakens attack and defense, heals with time. */
  wounded: number;
  shieldUntil: number;
  trophies: number;
  record: BattleRecord;
}
export type NewsKind = 'raid' | 'rise' | 'you';
export interface NewsItem { id: number; tick: number; kind: NewsKind; text: string }
export interface World { rng: number; mayors: Mayor[]; news: NewsItem[]; newsSeq: number; nextTick: number }

function wInt(w: World, n: number): number {
  w.rng = (w.rng + 0x6d2b79f5) >>> 0;
  let t = w.rng;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) % Math.max(1, n);
}

// ---------- strength of a mayor ----------
const baseAttack = (lv: number) => 30 * lv + 6 * lv * lv;
const baseDefense = (lv: number) => Math.floor((baseAttack(lv) * 85) / 100);
const woundedPm = (m: Mayor) => 1000 - 5 * Math.min(100, Math.max(0, m.wounded));
export const mayorAttack = (m: Mayor) => Math.floor((baseAttack(m.level) * woundedPm(m)) / 1000);
export const mayorDefense = (m: Mayor) => Math.floor((baseDefense(m.level) * woundedPm(m)) / 1000);
export const mayorLootPct = (m: Mayor) => Math.min(28, 8 + 2 * m.level);
/** Gold a treasury earns per world step. */
const incomePerStep = (lv: number) => 6 * lv + lv * lv;
/** Gold a mayor needs before moving up a level (half of it is spent on the climb). */
const levelNeed = (lv: number) => lv * lv * 150;

/** The war-room view of a mayor, so the raid code can treat mayors and the old fixed rivals the same. */
export function mayorRival(m: Mayor): Rival {
  return { id: m.id, name: m.name, attack: mayorAttack(m), defense: mayorDefense(m), lootPct: mayorLootPct(m) };
}
export const mayorPower = (m: Mayor) => mayorAttack(m) + Math.floor((mayorDefense(m) * 3) / 2);
export const findMayor = (s: GameState, id: string): Mayor | undefined => s.world?.mayors.find((m) => m.id === id);
export function findRival(s: GameState, id: string): Rival | undefined {
  const m = findMayor(s, id);
  return m ? mayorRival(m) : RIVALS.find((r) => r.id === id);
}
export const shieldLeft = (s: GameState, m: Mayor) => Math.max(0, m.shieldUntil - s.tick);

/** A mayor's row for rankings and profiles. ChainPower mixes strength with a little of the treasury. */
export function mayorRow(m: Mayor): PlayerRow {
  return {
    id: m.id, name: m.name, level: m.level, wealth: m.gold, simulated: true, arc: m.arc,
    chainPower: mayorAttack(m) + Math.floor((mayorDefense(m) * 3) / 2) + Math.floor(m.gold / 10),
  };
}
export const worldRows = (s: GameState): PlayerRow[] => (s.world?.mayors ?? []).map(mayorRow);

// ---------- creation ----------
export function initWorld(seed: number, n = WORLD_MAYORS): World {
  const w: World = { rng: (seed ^ 0x9e3779b9) >>> 0, mayors: [], news: [], newsSeq: 0, nextTick: WORLD_STEP_TICKS };
  const used = new Set<string>();
  while (w.mayors.length < n) {
    let name = fantasyName(wInt(w, FANTASY_NAME_COUNT));
    if (used.has(name)) name = used.size >= FANTASY_NAME_COUNT ? `${name} ${w.mayors.length + 1}` : '';
    if (!name || used.has(name)) continue;
    used.add(name);
    const level = Math.min(MAX_MAYOR_LEVEL, 1 + Math.floor((wInt(w, 1000) * wInt(w, 1000) * 10) / 1_000_000));
    w.mayors.push({
      id: `m${w.mayors.length}`, name, arc: ARCS[wInt(w, ARCS.length)]!.id, level,
      gold: level * level * 40 + wInt(w, 600 * level), wounded: 0, shieldUntil: 0,
      trophies: level * 12 + wInt(w, level * 30), record: { won: 0, lost: 0, held: 0, breached: 0 },
    });
  }
  return w;
}

export function pushNews(s: GameState, kind: NewsKind, text: string) {
  const w = s.world; if (!w) return;
  w.newsSeq++;
  w.news.unshift({ id: w.newsSeq, tick: s.tick, kind, text });
  if (w.news.length > NEWS_MAX) w.news.length = NEWS_MAX;
}

// ---------- the world moves ----------
/** One mayor raids another. Loot comes out of the target's treasury. */
function mayorRaid(s: GameState, w: World) {
  const ready = w.mayors.filter((m) => m.wounded < 50);
  if (ready.length === 0) return;
  const a = ready[wInt(w, ready.length)]!;
  // look at three neighbours of a similar level and go for the richest one that is not shielded
  const picks: Mayor[] = [];
  for (let i = 0; i < 6 && picks.length < 3; i++) {
    const t = w.mayors[wInt(w, w.mayors.length)]!;
    if (t.id !== a.id && Math.abs(t.level - a.level) <= 2 && t.shieldUntil <= s.tick && !picks.includes(t)) picks.push(t);
  }
  if (picks.length === 0) return;
  const t = picks.reduce((best, x) => (x.gold > best.gold ? x : best));
  const force = Math.floor((mayorAttack(a) * (850 + wInt(w, 300))) / 1000);
  if (force > mayorDefense(t)) {
    const loot = Math.min(Math.floor((t.gold * mayorLootPct(a)) / 100), Math.floor((t.gold * MAX_LOOT_PCT) / 100));
    t.gold -= loot; a.gold += loot;
    t.wounded = Math.min(100, t.wounded + 25);
    t.shieldUntil = s.tick + MAYOR_SHIELD_TICKS;
    t.trophies = Math.max(0, t.trophies - 6); a.trophies += 8;
    t.record.breached++; a.record.won++;
    pushNews(s, 'raid', `${a.name} raided ${t.name} and took ${loot} gold.`);
  } else {
    a.wounded = Math.min(100, a.wounded + 15);
    a.trophies = Math.max(0, a.trophies - 3);
    a.record.lost++; t.record.held++;
    if (wInt(w, 100) < 35) pushNews(s, 'raid', `${t.name} turned ${a.name} back at the gates.`);
  }
}

/** Advance the world; called every tick but only does work every WORLD_STEP_TICKS. */
export function worldStep(s: GameState) {
  const w = s.world;
  if (!w || s.tick < w.nextTick) return;
  w.nextTick = s.tick + WORLD_STEP_TICKS;
  for (const m of w.mayors) {
    m.gold += incomePerStep(m.level);
    m.wounded = Math.max(0, m.wounded - 3);
    if (m.level < MAX_MAYOR_LEVEL && m.gold >= levelNeed(m.level) && wInt(w, 100) < 30) {
      m.gold -= Math.floor(levelNeed(m.level) / 2);
      m.level++;
      pushNews(s, 'rise', `${m.name} reached level ${m.level}.`);
    }
  }
  if (wInt(w, 100) < 40) mayorRaid(s, w);
}

/** Pick which mayor comes for you: someone in your weight class, richer ones more eagerly. */
export function pickRaider(s: GameState, cp: number): Rival | null {
  const w = s.world; if (!w) return null;
  const pool = w.mayors.filter((m) => mayorPower(m) <= Math.floor((cp * 16) / 10) + 60 && m.wounded < 60);
  if (pool.length === 0) return null;
  const a = pool[wInt(w, pool.length)]!;
  const b = pool[wInt(w, pool.length)]!;
  return mayorRival(mayorPower(a) >= mayorPower(b) ? a : b);
}

/** What the player's raid result does to the mayor on the other side. */
export function applyRaidToMayor(s: GameState, m: Mayor, o: { loot: number; stars: number; win: boolean }) {
  m.gold = Math.max(0, m.gold - o.loot);
  if (o.win) {
    m.wounded = Math.min(100, m.wounded + 10 * Math.max(1, o.stars));
    m.shieldUntil = s.tick + MAYOR_SHIELD_TICKS / 2;
    m.trophies = Math.max(0, m.trophies - 6);
    m.record.breached++;
  } else {
    m.record.held++;
    m.trophies += 3;
  }
}
/** When a mayor's raid on you lands or fails: the loot goes to their treasury, a failed attack wounds them. */
export function applyRaidOnYou(s: GameState, id: string, o: { stolen: number; held: boolean }) {
  const m = findMayor(s, id); if (!m) return;
  if (o.held) { m.wounded = Math.min(100, m.wounded + 20); m.trophies = Math.max(0, m.trophies - 3); m.record.lost++; }
  else { m.gold += o.stolen; m.trophies += 8; m.record.won++; }
}
