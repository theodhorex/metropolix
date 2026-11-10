// Social layer data + pure query logic. There is no backend yet, so other players are SIMULATED
// (deterministic from a seed). The UI labels them as demo data. Real players come from the contract later.
import { ARCS, counts, levelFromXp, pushLog, stats, type ArcId, type BattleRecord, type GameState, type Result } from './index';
import { fantasyName, FANTASY_NAME_COUNT } from './names';
import { RELICS, RELIC_KINDS, type RelicKind } from './vault';

export interface PlayerRow {
  id: string;
  name: string;
  level: number;
  wealth: number; // gold
  chainPower: number;
  isYou?: boolean;
  simulated: boolean;
  arc?: ArcId;
}

export type SortKey = 'wealth' | 'chainPower' | 'level' | 'name';
export type SortDir = 'asc' | 'desc';
export interface PlayerQuery { sort: SortKey; dir: SortDir; search: string; minLevel: number }
export const DEFAULT_QUERY: PlayerQuery = { sort: 'chainPower', dir: 'desc', search: '', minLevel: 1 };

function mulberry(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function generatePlayers(seed: number, n = 40): PlayerRow[] {
  const r = mulberry(seed);
  const used = new Set<string>();
  const rows: PlayerRow[] = [];
  while (rows.length < n) {
    // a short name list must never stall the loop: after a clash, add a number to tell mayors apart
    let name = fantasyName(Math.floor(r() * FANTASY_NAME_COUNT));
    if (used.has(name)) name = used.size >= FANTASY_NAME_COUNT ? `${name} ${rows.length + 1}` : '';
    if (!name || used.has(name)) continue;
    used.add(name);
    const level = 1 + Math.floor(r() * r() * 10); // skewed to low levels, like a real population
    const wealth = Math.floor((level * level * 40 + r() * 600 * level) );
    const chainPower = Math.floor(level * 25 + r() * level * 90);
    const arc = ARCS[Math.floor(r() * ARCS.length)]!.id;
    rows.push({ id: `sim-${rows.length}`, name, level: Math.min(10, level), wealth, chainPower, simulated: true, arc });
  }
  return rows;
}

export function myRow(s: GameState, name = 'You'): PlayerRow {
  return { id: 'you', name, level: levelFromXp(s.xp), wealth: Math.floor(s.gold), chainPower: stats(s).chainPower, isYou: true, simulated: false, arc: s.arc ?? undefined };
}

// ---------- names and profiles ----------
export const NAME_MIN = 3;
export const NAME_MAX = 20;
/** Clean a typed name: trim, single spaces. Returns the name or why it is not allowed. */
export function checkName(raw: string): { ok: true; name: string } | { ok: false; msg: string } {
  const name = String(raw ?? '').replace(/\s+/g, ' ').trim();
  if (name.length < NAME_MIN) return { ok: false, msg: `Use at least ${NAME_MIN} letters` };
  if (name.length > NAME_MAX) return { ok: false, msg: `Keep it to ${NAME_MAX} characters` };
  if (!/^[A-Za-z][A-Za-z0-9' -]*$/.test(name)) return { ok: false, msg: "Letters, numbers, spaces, ' and - only, starting with a letter" };
  if (name.toLowerCase() === 'you') return { ok: false, msg: 'Pick a name other players can tell apart' };
  return { ok: true, name };
}
/** Picking your first name is free, and so is the first change after it. Every later change costs gold. */
export const FREE_RENAMES = 1;
export const RENAME_COST = 1000;
/** Gold the next name change costs (0 while the first name or the free change is still unused). */
export const renameCost = (s: GameState) => (!s.name || (s.nameChanges ?? 0) < FREE_RENAMES ? 0 : RENAME_COST);

export function setName(s: GameState, raw: string): Result {
  const c = checkName(raw);
  if (!c.ok) return { ok: false, msg: c.msg };
  const first = !s.name;
  if (!first && c.name === s.name) return { ok: false, msg: 'That is already your name' };
  const cost = renameCost(s);
  if (s.gold < cost) return { ok: false, msg: `A name change costs ${cost} gold` };
  s.gold -= cost;
  if (!first) s.nameChanges = (s.nameChanges ?? 0) + 1;
  s.name = c.name;
  pushLog(s, first ? `Mayor ${c.name} takes office.` : `You are now known as ${c.name}${cost ? ` (${cost} gold)` : ''}.`);
  return { ok: true, cost };
}

/** Ranks by level, from a village chief to a sovereign of a great city. */
export const TITLES = ['Settler', 'Village Chief', 'Reeve', 'Town Warden', 'Steward', 'Lord Mayor', 'Count Palatine', 'Margrave', 'Archduke', 'High Sovereign'];
export const titleFor = (level: number) => TITLES[Math.max(0, Math.min(TITLES.length, level) - 1)]!;

export interface PlayerProfile {
  id: string; name: string; isYou: boolean; simulated: boolean;
  arc: ArcId | null; level: number; title: string;
  chainPower: number; wealth: number; citizens: number; buildings: number;
  trophies: number; finds: number; displayed: RelicKind[]; record: BattleRecord;
}

export function myProfile(s: GameState, name: string): PlayerProfile {
  const row = myRow(s, name);
  const buildings = Object.values(counts(s)).reduce((a, b) => a + (b ?? 0), 0);
  return {
    id: 'you', name, isYou: true, simulated: false, arc: s.arc, level: row.level, title: titleFor(row.level),
    chainPower: row.chainPower, wealth: row.wealth, citizens: s.pop, buildings,
    trophies: s.trophies, finds: s.finds, displayed: [...s.displayed], record: { ...s.record },
  };
}

/** A believable profile for a simulated mayor, always the same for the same row. */
export function simProfile(p: PlayerRow): PlayerProfile {
  let h = 2166136261;
  for (const ch of p.id + p.name) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  const r = mulberry(h >>> 0);
  const lv = p.level;
  const fights = Math.floor(lv * lv * (1 + r() * 3));
  const won = Math.floor(fights * (0.35 + r() * 0.5));
  const raided = Math.floor(lv * (2 + r() * 6));
  const held = Math.floor(raided * (0.3 + r() * 0.6));
  // relics: the higher the level, the likelier a mayor has a few on display; rarer ones only at high levels
  const pool = RELIC_KINDS.filter((k) => RELICS[k].rarity === 'rare' || (RELICS[k].rarity === 'epic' && lv >= 4) || (RELICS[k].rarity === 'legendary' && lv >= 7) || (RELICS[k].rarity === 'mythic' && lv >= 9 && r() < 0.3));
  const displayed: RelicKind[] = [];
  const want = Math.min(3, Math.floor(r() * (lv / 2.5)));
  while (displayed.length < want && pool.length > 0) displayed.push(pool.splice(Math.floor(r() * pool.length), 1)[0]!);
  return {
    id: p.id, name: p.name, isYou: !!p.isYou, simulated: p.simulated, arc: p.arc ?? null, level: lv, title: titleFor(lv),
    chainPower: p.chainPower, wealth: p.wealth,
    citizens: Math.floor(lv * 40 + r() * lv * 60), buildings: Math.floor(6 + lv * 5 + r() * lv * 6),
    trophies: Math.floor(lv * 12 + r() * lv * 30), finds: displayed.length + Math.floor(r() * lv * 0.6),
    displayed, record: { won, lost: fights - won, held, breached: raided - held },
  };
}

export function queryPlayers(rows: PlayerRow[], q: PlayerQuery): PlayerRow[] {
  const needle = q.search.trim().toLowerCase();
  const out = rows.filter((p) => p.level >= q.minLevel && (!needle || p.name.toLowerCase().includes(needle)));
  const sign = q.dir === 'asc' ? 1 : -1;
  out.sort((a, b) => {
    const d = q.sort === 'name'
      ? a.name.localeCompare(b.name, 'en', { sensitivity: 'base' })
      : a[q.sort] - b[q.sort];
    if (d !== 0) return d * sign;
    return a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }) || a.id.localeCompare(b.id);
  });
  return out;
}

/** Rank by a metric (1 = best). Ties share the better rank. */
export function ranked(rows: PlayerRow[], metric: Exclude<SortKey, 'name'>): (PlayerRow & { rank: number })[] {
  const sorted = [...rows].sort((a, b) => b[metric] - a[metric] || a.name.localeCompare(b.name));
  return sorted.map((p, i) => {
    const firstSame = sorted.findIndex((x) => x[metric] === p[metric]);
    return { ...p, rank: firstSame + 1 };
  });
}

// ---------- chat (simulated bots; a real chat needs a backend) ----------
export interface ChatMessage { id: number; from: string; text: string; simulated: boolean; you?: boolean }
const LINES = [
  'anyone selling towers? my defense is weak',
  'just hit level {l}, schools first is the way',
  'tax at 8% keeps citizens happy and growth fast',
  'who wants to trade barracks for a factory?',
  'raided Ironvale, nice loot',
  'park spam = cheap happiness',
  'GM mayors',
  'chainpower is mostly army early, economy later',
  'selling 2 shops cheap, check market',
  'factory pollution is brutal without parks',
];

export function botMessage(seed: number, n: number, players: PlayerRow[]): ChatMessage {
  const r = mulberry(seed * 7919 + n * 104729);
  const p = players[Math.floor(r() * players.length)]!;
  const line = LINES[Math.floor(r() * LINES.length)]!.replace('{l}', String(Math.max(2, p.level)));
  return { id: n, from: p.name, text: line, simulated: true };
}
