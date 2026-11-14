// Rebuild a local game from the city saved on chain (new browser or device, cleared storage).
import * as sim from '@metropolix/sim';
import type { CityView } from './chain-meta';

/** The saved city from the chain as a fresh local game (a new browser or device, or a lost local save). */
export function cityFromChain(c: CityView, seed: number): sim.GameState | null {
  const arc = sim.ARCS.find((a) => a.index === c.arc);
  if (!arc || !c.grid || !c.levels) return null;
  const r = sim.newState(seed);
  sim.chooseArc(r, arc.id);
  // the chain's grid is the whole map, starting pieces included
  r.grid = Array.from({ length: sim.GRID }, () => Array<sim.GameState['grid'][number][number]>(sim.GRID).fill(null));
  r.levels = {};
  c.grid.forEach((code, i) => {
    const k = code ? sim.BUILDING_KINDS[code - 1] : undefined;
    if (!k) return;
    const x = i % sim.GRID, y = Math.floor(i / sim.GRID);
    r.grid[y]![x] = k;
    if ((c.levels![i] ?? 1) > 1) r.levels[`${x},${y}`] = c.levels![i]!;
  });
  r.army = { vanguard: c.army[0], raider: c.army[1], breaker: c.army[2] };
  r.troops = c.army[0] + c.army[1] + c.army[2];
  r.gold = c.gold; r.xp = c.xp; r.tick = c.tick; r.trophies = c.trophies;
  r.name = c.name; r.portrait = c.portrait;
  r.record = { ...r.record, won: c.record.won, lost: c.record.lost, held: c.record.held, breached: c.record.breached };
  // schedules count from tick 0 in a new game: move them to the saved clock
  r.nextRaidTick = c.tick + 120; r.nextMarketTick = c.tick + 30;
  if (r.world) r.world.nextTick += c.tick;
  r.log = [`Your city ${c.name} was loaded from NEAR testnet.`];
  return r;
}
