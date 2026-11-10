// City overview data for the dashboard: sector split, demand, wealth tiers, advice, milestones.
// Pure and integer-only like the rest of the simulation.
import { BUILDINGS, counts, stats, type BuildingKind, type Category, type GameState } from './index';

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

export interface Demand { residential: number; commerce: number; industry: number } // -100..100, positive = build more

export function demand(s: GameState): Demand {
  const st = stats(s);
  const cts = counts(s);
  let commerceJobs = 0;
  for (const [k, n] of Object.entries(cts) as [BuildingKind, number][]) if (BUILDINGS[k].category === 'commerce') commerceJobs += (BUILDINGS[k].jobs ?? 0) * n;
  const occ = st.housing > 0 ? Math.floor((s.pop * 1000) / st.housing) : 1000;
  const residential = st.housing === 0 ? 100
    : clamp(Math.floor((occ - 700) / 3) + Math.floor((st.jobs - s.pop) / 4) + Math.floor((st.happinessPm - 500) / 20), -100, 100);
  const target = Math.floor(s.pop / 3);
  const commerce = s.pop === 0 ? 0 : clamp(Math.floor(((target - commerceJobs) * 100) / Math.max(10, target)), -100, 100);
  const industry = s.pop === 0 ? 0 : clamp(Math.floor((st.unemployed * 200) / Math.max(10, s.pop)) - st.pollution * 2, -100, 100);
  return { residential, commerce, industry };
}

/** Building count per category, for the pie charts. */
export function sectorCounts(s: GameState): Record<Category, number> {
  const out: Record<Category, number> = { residential: 0, commerce: 0, industry: 0, services: 0, military: 0, decoration: 0 };
  for (const [k, n] of Object.entries(counts(s)) as [BuildingKind, number][]) out[BUILDINGS[k].category] += n;
  return out;
}

/** Poor / middle / rich citizens: education and happiness lift people up. */
export function wealthTiers(s: GameState): { poor: number; middle: number; rich: number } {
  const st = stats(s);
  const rich = Math.floor((s.pop * st.eduCoverPm * st.happinessPm) / 2_000_000);
  const poor = Math.min(s.pop - rich, Math.floor((s.pop * (1000 - st.happinessPm) * (1000 - st.eduCoverPm)) / 1_000_000) + Math.floor(st.unemployed / 2));
  return { poor, middle: Math.max(0, s.pop - rich - poor), rich };
}

/** Income and happiness if the tax were set to each rate: lets players plan. */
export function taxCurve(s: GameState): { rate: number; net: number; happinessPm: number }[] {
  return [0, 5, 10, 15, 20, 25, 30].map((rate) => {
    const t = stats({ ...s, taxRate: rate });
    return { rate, net: t.net, happinessPm: t.happinessPm };
  });
}

/** Plain-language strategy hints derived from the current numbers. */
export function advice(s: GameState): string[] {
  const st = stats(s), d = demand(s), out: string[] = [];
  if (s.arc === null) return out;
  if (st.housing === 0) out.push('Build Houses so citizens can move in.');
  else if (d.residential > 40) out.push('Residents are looking for homes: build more Houses.');
  if (st.unemployed > Math.max(5, s.pop / 5)) out.push(`${st.unemployed} citizens have no job: build Farms, Shops or Lumber Camps.`);
  if (d.commerce > 40) out.push('Citizens want to shop: build more Shops.');
  if (st.happinessPm < 400) out.push('Citizens are unhappy: lower the tax or add Parks and decorations.');
  if (st.eduCoverPm < 300 && s.pop > 20) out.push('Few citizens are educated: Schools raise productivity.');
  if (st.pollution > 12) out.push('Pollution is high: balance Factories with Parks.');
  if (st.troopCap === 0) out.push('Raise Barracks to train troops and attack rivals.');
  else if (st.defense < 40) out.push('Your defense is weak: train troops or raise a Tower.');
  if (st.net < 0) out.push('You are losing gold each second: raise tax or add productive buildings.');
  if (s.wood < 20) out.push('Wood is low: build Lumber Camps or buy wood on the market.');
  if (s.ore < 20) out.push('Ore is low: build Mines or buy ore on the market.');
  if (out.length === 0) out.push('Your city is balanced. Expand, trade and climb the ranks.');
  return out;
}

export interface Milestone { id: string; label: string; done: boolean; progress: number; target: number }

export function milestones(s: GameState): Milestone[] {
  const st = stats(s);
  const total = Object.values(counts(s)).reduce((a, b) => a + (b ?? 0), 0);
  const m = (id: string, label: string, progress: number, target: number): Milestone => ({ id, label, progress: Math.min(progress, target), target, done: progress >= target });
  return [
    m('pop50', 'Reach 50 citizens', s.pop, 50),
    m('b10', 'Place 10 buildings', total, 10),
    m('lv3', 'Reach level 3', st.level, 3),
    m('pop200', 'Reach 200 citizens', s.pop, 200),
    m('troop20', 'Train 20 troops', s.troops, 20),
    m('lv5', 'Reach level 5', st.level, 5),
    m('cp500', 'Reach 500 ChainPower', st.chainPower, 500),
    m('pop500', 'Reach 500 citizens', s.pop, 500),
    m('lv10', 'Reach level 10', st.level, 10),
  ];
}
