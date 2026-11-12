import { newState, GRID, ARCS, MAX_MAYOR_LEVEL, NEWS_MAX, type Mayor, type World, RELIC_KINDS, DISPLAY_SLOTS, isRelic, checkName, canUpgrade, MAX_BLD_LEVEL, type GameState, tradeKindsFor, isBuilding, type ItemKind } from '@metropolix/sim';

const KEY = 'metropolix-save-v2';

function valid(s: unknown): s is GameState {
  const o = s as GameState;
  return !!o && Array.isArray(o.grid) && o.grid.length > 0 && o.grid.length <= GRID && typeof o.rng === 'number' && typeof o.gold === 'number';
}

/** Older saves had a smaller map: copy it into the top-left corner of the current one. */
function padGrid(old: GameState['grid']): GameState['grid'] {
  const g: GameState['grid'] = Array.from({ length: GRID }, () => Array(GRID).fill(null));
  for (let y = 0; y < Math.min(old.length, GRID); y++)
    for (let x = 0; x < Math.min(old[y]?.length ?? 0, GRID); x++) g[y]![x] = old[y]![x] ?? null;
  return g;
}

const num = (v: unknown, lo: number, hi: number) => typeof v === 'number' && Number.isFinite(v) && v >= lo && v <= hi;
/** Keep a saved world only if every mayor is sane; otherwise the caller falls back to a fresh one. */
function cleanWorld(raw: unknown, fresh: World): World {
  const w = raw as Partial<World> | undefined;
  if (!w || !Array.isArray(w.mayors) || w.mayors.length < 10 || w.mayors.length > 200 || !num(w.rng, 0, 4294967295)) return fresh;
  const ids = new Set<string>();
  const mayors: Mayor[] = [];
  for (const m of w.mayors as Partial<Mayor>[]) {
    const rec = (m?.record ?? {}) as Partial<Mayor['record']>;
    if (!m || typeof m.id !== 'string' || typeof m.name !== 'string' || ids.has(m.id) || !ARCS.some((a) => a.id === m.arc)
      || !num(m.level, 1, MAX_MAYOR_LEVEL) || !num(m.gold, 0, 1e12) || !num(m.wounded, 0, 100) || !num(m.shieldUntil, 0, 1e12) || !num(m.trophies, 0, 1e9)
      || !num(rec.won, 0, 1e9) || !num(rec.lost, 0, 1e9) || !num(rec.held, 0, 1e9) || !num(rec.breached, 0, 1e9)) return fresh;
    ids.add(m.id);
    mayors.push({ id: m.id, name: m.name, arc: m.arc!, level: Math.floor(m.level!), gold: Math.floor(m.gold!), wounded: Math.floor(m.wounded!), shieldUntil: Math.floor(m.shieldUntil!), trophies: Math.floor(m.trophies!), record: { won: rec.won!, lost: rec.lost!, held: rec.held!, breached: rec.breached! } });
  }
  const news = (Array.isArray(w.news) ? w.news : []).filter((n) => n && typeof n.id === 'number' && typeof n.tick === 'number' && typeof n.text === 'string' && (n.kind === 'raid' || n.kind === 'rise' || n.kind === 'you')).slice(0, NEWS_MAX);
  return { rng: w.rng!, mayors, news, newsSeq: num(w.newsSeq, 0, 1e12) ? w.newsSeq! : news.length, nextTick: num(w.nextTick, 0, 1e12) ? w.nextTick! : 0 };
}

export function loadState(): GameState {
  const fresh = newState((Date.now() & 0xffffffff) >>> 0);
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const s = JSON.parse(raw);
      // merge so older saves (before levels/market) gain the new fields with defaults
      if (valid(s)) {
        const merged: GameState = { ...fresh, ...s, grid: padGrid(s.grid), goods: { ...fresh.goods, ...(s.goods ?? {}) }, post: { ...fresh.post, ...(s.post ?? {}) } };
        // listings from before cities had a people are replaced by fresh city offers
        merged.market = merged.market.filter((l) => l.seller === 'you' || l.arc);
        // other cities no longer trade buildings this land cannot run (Dragonkin: no wood buildings)
        const usable = new Set<string>(tradeKindsFor(merged));
        const fits = (k: string) => !isBuilding(k as ItemKind) || usable.has(k);
        merged.market = merged.market.filter((l) => l.seller === 'you' || fits(l.kind));
        merged.orders = (merged.orders ?? []).filter((o) => o.buyer === 'you' || fits(o.kind));
        if (merged.market.length < 6) merged.market = [...merged.market, ...fresh.market.map((l) => ({ ...l, id: merged.nextListingId++ }))];
        // the sim never schedules a raid more than 150 ticks ahead; anything further is a broken save
        if (!(merged.nextRaidTick <= merged.tick + 150)) merged.nextRaidTick = merged.tick + 120;
        // saves from before the vault: start with an empty one; drop anything that is not a known relic
        merged.vault = { ...fresh.vault };
        for (const k of RELIC_KINDS) { const v = (s.vault as Record<string, unknown> | undefined)?.[k]; if (typeof v === 'number' && v > 0) merged.vault[k] = Math.floor(v); }
        merged.displayed = Array.isArray(s.displayed) ? [...new Set(s.displayed.filter((k: unknown) => typeof k === 'string' && isRelic(k)))].slice(0, DISPLAY_SLOTS) : [];
        merged.finds = typeof s.finds === 'number' ? s.finds : 0;
        merged.lastFind = s.lastFind && isRelic(s.lastFind.kind) ? s.lastFind : null;
        // the chronicle: what the save remembers, plus anything it holds right now
        const seen = new Set((Array.isArray(s.seen) ? s.seen : []).filter((k: unknown) => typeof k === 'string' && isRelic(k)));
        for (const k of RELIC_KINDS) if (merged.vault[k] > 0) seen.add(k);
        for (const k of merged.displayed) seen.add(k);
        for (const l of merged.market) if (l.seller === 'you' && isRelic(l.kind)) seen.add(l.kind);
        merged.seen = [...seen];
        // building levels: only "x,y" keys on a real, upgradable building, level 2..3
        merged.levels = {};
        for (const [key, v] of Object.entries((s.levels ?? {}) as Record<string, unknown>)) {
          const m = /^(\d+),(\d+)$/.exec(key); if (!m || typeof v !== 'number') continue;
          const k = merged.grid[+m[2]!]?.[+m[1]!];
          if (k && canUpgrade(k) && v >= 2 && v <= MAX_BLD_LEVEL) merged.levels[key] = Math.floor(v);
        }
        // saves from before profiles: no name yet (the game asks once), empty battle record
        merged.name = typeof s.name === 'string' && checkName(s.name).ok ? s.name : '';
        merged.nameChanges = typeof s.nameChanges === 'number' && s.nameChanges >= 0 ? Math.floor(s.nameChanges) : 0;
        const rec = (s.record ?? {}) as Partial<Record<keyof GameState['record'], unknown>>;
        merged.record = { won: 0, lost: 0, held: 0, breached: 0 };
        for (const k of ['won', 'lost', 'held', 'breached'] as const) { const v = rec[k]; if (typeof v === 'number' && v >= 0) merged.record[k] = Math.floor(v); }
        merged.world = cleanWorld(s.world, fresh.world);
        return merged;
      }
    }
  } catch { /* ignore */ }
  return fresh;
}

export function saveState(s: GameState) {
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* ignore */ }
}
