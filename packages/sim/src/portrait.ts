// Portraits: 500 fixed mayor portraits (#001..#500), 100 per people, each with a tier like a collectible.
// A city draws one once, when its people is chosen. The draw reads the RNG state without advancing it,
// so it never shifts anything else the seed decides, and the same seed always gives the same portrait.
import { ARCS, BUILDINGS, arcDef, type ArcId, type GameState } from './index';
import { RELICS, RELIC_KINDS, RARITY } from './vault';
import { levelKey } from './upgrade';

export type PortraitTier = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';
export const PORTRAIT_TIERS: PortraitTier[] = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'];
export const PORTRAIT_COUNT = 500;
export const PORTRAITS_PER_ARC = 100;

/** Names and colors of the top four match the Vault, so "Epic" means the same thing everywhere. */
export const PORTRAIT_TIER: Record<PortraitTier, { name: string; color: string; total: number; value: number }> = {
  common:    { name: 'Common', color: '#9aa0a6', total: 250, value: 0 },
  uncommon:  { name: 'Uncommon', color: '#5cbf6a', total: 125, value: 250 },
  rare:      { name: RARITY.rare.name, color: RARITY.rare.color, total: 75, value: 900 },
  epic:      { name: RARITY.epic.name, color: RARITY.epic.color, total: 35, value: 3500 },
  legendary: { name: RARITY.legendary.name, color: RARITY.legendary.color, total: 13, value: 14000 },
  mythic:    { name: RARITY.mythic.name, color: RARITY.mythic.color, total: 2, value: 60000 },
};

/** Per people: 50 common, 25 uncommon, 15 rare, 7 epic, then 3 legendary, or 2 legendary + 1 super legendary. */
const MYTHIC_ARCS = new Set([1, 3]); // Lizardfolk and Dragonkin hold the two super legendaries
function arcTiers(arcIndex: number): PortraitTier[] {
  const legend = MYTHIC_ARCS.has(arcIndex) ? 2 : 3;
  const list: PortraitTier[] = [
    ...Array<PortraitTier>(50).fill('common'), ...Array<PortraitTier>(25).fill('uncommon'),
    ...Array<PortraitTier>(15).fill('rare'), ...Array<PortraitTier>(7).fill('epic'),
    ...Array<PortraitTier>(legend).fill('legendary'), ...Array<PortraitTier>(3 - legend).fill('mythic'),
  ];
  // fixed shuffle, so rare numbers are scattered instead of sitting at the end of each block
  let h = (0x2545f491 ^ (arcIndex * 0x9e3779b1)) >>> 0;
  for (let i = list.length - 1; i > 0; i--) {
    h = Math.imul(h ^ (h >>> 15), 0x2c1b3c6d) >>> 0; h = (h ^ (h >>> 12)) >>> 0;
    const j = h % (i + 1);
    [list[i], list[j]] = [list[j]!, list[i]!];
  }
  return list;
}
let TIER_OF: PortraitTier[] | null = null; // built on first use (this module loads before index finishes)

/** A small integer hash (no state), used for draws and for picking art layers. */
export function hash32(n: number): number {
  let h = (n ^ 0x7f4a7c15) >>> 0;
  h = Math.imul(h ^ (h >>> 16), 0x85ebca6b) >>> 0;
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35) >>> 0;
  return (h ^ (h >>> 16)) >>> 0;
}

export const validPortrait = (id: unknown): id is number => typeof id === 'number' && Number.isInteger(id) && id >= 1 && id <= PORTRAIT_COUNT;
export const portraitTier = (id: number): PortraitTier => (TIER_OF ??= ARCS.flatMap((_, i) => arcTiers(i)))[id - 1] ?? 'common';
export const portraitArc = (id: number): ArcId => ARCS[Math.floor((id - 1) / PORTRAITS_PER_ARC)]!.id;
export const portraitLabel = (id: number) => `#${String(id).padStart(3, '0')}`;

/** Which art layers a portrait uses. The rare parts only exist on high tiers. */
export interface PortraitTraits {
  id: number; arc: ArcId; tier: PortraitTier;
  bg: number;        // 0..7 backdrop
  skin: number;      // 0..3 shade within the people's palette
  eyes: number;      // 0..5
  hair: number;      // 0..7 hair, horns, crest or frills, by people
  headwear: number;  // 0 none, 1..5 common hats; 6 circlet (epic+), 7 crown (legendary+)
  accessory: number; // 0 none, 1..5
  glowEyes: boolean; // legendary and up
  aura: boolean;     // super legendary only
  frame: number;     // 0 wood, 1 iron, 2 silver, 3 violet, 4 gold, 5 prismatic (by tier)
}

export function portraitTraits(id: number): PortraitTraits {
  const tier = portraitTier(id);
  const t = PORTRAIT_TIERS.indexOf(tier);
  const h1 = hash32(id * 31 + 7), h2 = hash32(id * 131 + 3);
  const headwear = t >= 4 ? 7 : t >= 3 ? 6 : ((h2 >>> 4) % 6); // epic: circlet, legendary+: crown
  return {
    id, arc: portraitArc(id), tier,
    bg: h1 % 8, skin: (h1 >>> 3) % 4, eyes: (h1 >>> 6) % 6, hair: (h1 >>> 9) % 8,
    headwear, accessory: (h2 >>> 8) % 6, glowEyes: t >= 4, aura: t === 5, frame: t,
  };
}

/** The portrait a city draws when its people is chosen. Reads s.rng, never advances it. */
export function drawPortrait(s: Pick<GameState, 'rng' | 'arc'>): number {
  const a = arcDef(s.arc); if (!a) return 0;
  return a.index * PORTRAITS_PER_ARC + 1 + (hash32(s.rng ^ 0x5bd1e995) % PORTRAITS_PER_ARC);
}

/** Old saves and fresh picks: give a city with a people its portrait, once. */
export function ensurePortrait(s: GameState) {
  if (s.arc && !(validPortrait(s.portrait) && portraitArc(s.portrait) === s.arc)) s.portrait = drawPortrait(s);
}

/** Simulated mayors get a fixed portrait of their own people from their id, so nothing is stored. */
export function mayorPortrait(m: { id: string; arc: ArcId }): number {
  let h = 0; for (const c of m.id) h = Math.imul(h ^ c.charCodeAt(0), 0x01000193) >>> 0;
  return arcDef(m.arc)!.index * PORTRAITS_PER_ARC + 1 + (hash32(h ^ 0x1b873593) % PORTRAITS_PER_ARC);
}

/** In-game worth of a city: buildings (cost x level), relics (vault and display), and the portrait's tier. */
export interface CityValue { buildings: number; relics: number; portrait: number; total: number }
export function cityValue(s: GameState): CityValue {
  let buildings = 0;
  s.grid.forEach((row, y) => row.forEach((k, x) => { if (k) buildings += BUILDINGS[k].cost * (s.levels?.[levelKey(x, y)] ?? 1); }));
  let relics = 0;
  for (const k of RELIC_KINDS) relics += (s.vault?.[k] ?? 0) * RELICS[k].price;
  for (const k of s.displayed ?? []) relics += RELICS[k].price;
  const portrait = validPortrait(s.portrait) ? PORTRAIT_TIER[portraitTier(s.portrait)].value : 0;
  return { buildings, relics, portrait, total: buildings + relics + portrait };
}
