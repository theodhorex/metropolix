// Vault: relics are ultra rare finds from mines, factories, workshops, lumber mills and farms.
// Keep them, put up to three on display for a lasting city bonus, sell them to the crown,
// or trade them on the market like any other item. Deterministic: finds use the state's PRNG.
// Import note: index.ts imports this file, so nothing from index may be used at module top level here.
import {
  BUILDINGS, pushLog, rngInt, rngNext, weightedCounts,
  type BuildingKind, type GameState, type Result,
} from './index';

export type Rarity = 'rare' | 'epic' | 'legendary' | 'mythic';
export type RelicKind =
  | 'geode' | 'starmetal' | 'voidheart'
  | 'cog' | 'sunengine'
  | 'whetstone' | 'masterhammer' | 'kingsblade' | 'aetheranvil'
  | 'amber' | 'heartwood'
  | 'goldenseed'
  | 'goldtimber' | 'goblinskull' | 'dragonscale' | 'moonpearl' | 'grimoire' | 'mandrake'
  | 'ironbark' | 'tankard' | 'phoenixfeather' | 'titanbone' | 'wardenbanner' | 'clockheart';

/** Lasting bonus while a relic is on display, in permille (150 = +15%). `happy` adds to happiness directly. */
export interface RelicBonus { gold?: number; ore?: number; wood?: number; food?: number; attack?: number; defense?: number; happy?: number; upkeep?: number; troopCost?: number }
export interface RelicDef { name: string; rarity: Rarity; source: BuildingKind; price: number; desc: string; bonus: RelicBonus }

export const RARITIES: Rarity[] = ['rare', 'epic', 'legendary', 'mythic'];
export const RARITY: Record<Rarity, { name: string; color: string; per10M: number }> = {
  // per10M: chance per building per second, out of 10,000,000
  rare: { name: 'Rare', color: '#4fa3e0', per10M: 2500 },          // about 1 in 4,000
  epic: { name: 'Epic', color: '#b07cf0', per10M: 600 },           // about 1 in 16,700
  legendary: { name: 'Legendary', color: '#f2a33a', per10M: 120 }, // about 1 in 83,000
  mythic: { name: 'Super Legendary', color: '#ff5c8a', per10M: 15 }, // about 1 in 667,000
};

export const RELICS: Record<RelicKind, RelicDef> = {
  geode:        { name: 'Crystal Geode', rarity: 'rare', source: 'mine', price: 400, desc: 'A plain rock that cracked open full of light.', bonus: { happy: 30 } },
  starmetal:    { name: 'Starmetal Ore', rarity: 'legendary', source: 'mine', price: 6000, desc: 'Metal that fell from the sky. Smiths fight over it.', bonus: { ore: 250, defense: 100 } },
  voidheart:    { name: 'Voidheart Ore', rarity: 'mythic', source: 'mine', price: 40000, desc: 'A crystal that hums from the deepest shaft ever dug.', bonus: { gold: 150, attack: 150, defense: 150 } },
  cog:          { name: 'Perpetual Cog', rarity: 'epic', source: 'factory', price: 1500, desc: 'It never stops turning, and nobody knows why.', bonus: { upkeep: -200 } },
  sunengine:    { name: 'Sun Engine', rarity: 'legendary', source: 'factory', price: 7000, desc: 'A furnace that burns with no fuel at all.', bonus: { gold: 120 } },
  whetstone:    { name: 'Runed Whetstone', rarity: 'rare', source: 'workshop', price: 450, desc: 'Blades sharpened on it stay sharp for a year.', bonus: { attack: 50 } },
  masterhammer: { name: "Master's Hammer", rarity: 'epic', source: 'workshop', price: 1800, desc: 'The hammer of a legendary smith. Arms come cheaper.', bonus: { troopCost: -150 } },
  kingsblade:   { name: 'Kingsblade', rarity: 'legendary', source: 'workshop', price: 8000, desc: 'A sword fit for a king, forged by accident.', bonus: { attack: 200 } },
  aetheranvil:  { name: 'Aether Anvil', rarity: 'mythic', source: 'workshop', price: 45000, desc: 'Crystal anvil that rings like a bell. Armies march for it.', bonus: { attack: 250, troopCost: -250, gold: 80 } },
  amber:        { name: 'Ancient Amber', rarity: 'rare', source: 'lumber', price: 350, desc: 'Old tree resin with a tiny bug inside.', bonus: { wood: 200 } },
  heartwood:    { name: 'Heartwood Bough', rarity: 'legendary', source: 'lumber', price: 6500, desc: 'A branch from the oldest tree. It still grows.', bonus: { wood: 400, happy: 80 } },
  goldenseed:   { name: 'Golden Seed', rarity: 'epic', source: 'farm', price: 1400, desc: 'One seed, a whole field of golden wheat.', bonus: { food: 300 } },
  goldtimber:   { name: 'Gilded Timber', rarity: 'epic', source: 'lumber', price: 1600, desc: 'A log with grain of real gold. The saw rang when it hit.', bonus: { wood: 250, gold: 50 } },
  goblinskull:  { name: 'Skull of the Goblin King', rarity: 'legendary', source: 'barracks', price: 7500, desc: 'Dug up under the drill yard. It still wears its crown.', bonus: { attack: 150, defense: 80 } },
  dragonscale:  { name: 'Elder Dragon Scale', rarity: 'legendary', source: 'mine', price: 7000, desc: 'A scale as big as a shield, cold to the touch.', bonus: { defense: 250 } },
  moonpearl:    { name: 'Moonwell Pearl', rarity: 'epic', source: 'farm', price: 1500, desc: 'Found in a well bucket. It glows on moonless nights.', bonus: { happy: 60 } },
  grimoire:     { name: 'Forbidden Grimoire', rarity: 'legendary', source: 'library', price: 7200, desc: 'Chained shut. The librarians whisper about it.', bonus: { upkeep: -150, attack: 100 } },
  mandrake:     { name: 'Screaming Mandrake', rarity: 'rare', source: 'farm', price: 380, desc: 'Pulled from a turnip row. The farmhands still have earache.', bonus: { food: 150 } },
  ironbark:     { name: 'Ironbark Log', rarity: 'rare', source: 'lumber', price: 420, desc: 'Wood so hard it blunts axes. Perfect for gates.', bonus: { defense: 60 } },
  tankard:      { name: 'Bottomless Tankard', rarity: 'epic', source: 'tavern', price: 1700, desc: 'Left behind by a stranger. It never runs dry.', bonus: { happy: 100 } },
  phoenixfeather: { name: 'Phoenix Feather', rarity: 'mythic', source: 'lumber', price: 42000, desc: 'Fell from the canopy still burning, and never went out.', bonus: { food: 300, happy: 150, defense: 150 } },
  titanbone:    { name: 'Titan Knucklebone', rarity: 'epic', source: 'mine', price: 1600, desc: 'One bone of a giant. Miners refuse to dig further.', bonus: { defense: 120 } },
  wardenbanner: { name: 'Banner of the First Warden', rarity: 'rare', source: 'barracks', price: 400, desc: 'Torn and faded, but recruits stand taller under it.', bonus: { defense: 40, troopCost: -50 } },
  clockheart:   { name: 'Clockwork Heart', rarity: 'mythic', source: 'factory', price: 44000, desc: 'It ticks like it is alive. The foreman swears it is.', bonus: { gold: 200, upkeep: -250 } },
};
export const RELIC_KINDS = Object.keys(RELICS) as RelicKind[];
export const DISPLAY_SLOTS = 3;
export const CROWN_PM = 600; // the crown pays 60% of a relic's worth, instantly
/** Buildings that can turn up relics, and at most how many of each count toward the odds. */
export const FIND_SOURCES: BuildingKind[] = ['mine', 'factory', 'workshop', 'lumber', 'farm', 'barracks', 'library', 'tavern'];
const SOURCE_CAP = 25;

export const isRelic = (k: string): k is RelicKind => k in RELICS;
/** Write a treasure into the player's chronicle the first time they own one. */
export function discover(s: GameState, k: RelicKind) { if (!s.seen.includes(k)) s.seen.push(k); }
export const freshVault = (): Record<RelicKind, number> => Object.fromEntries(RELIC_KINDS.map((k) => [k, 0])) as Record<RelicKind, number>;

/** Relics a building kind can turn up, rarest last. */
export const relicsFrom = (b: BuildingKind) => RELIC_KINDS.filter((k) => RELICS[k].source === b);

/** Sum of the bonuses of every relic on display. */
export function relicBonus(s: GameState): Required<RelicBonus> {
  const out = { gold: 0, ore: 0, wood: 0, food: 0, attack: 0, defense: 0, happy: 0, upkeep: 0, troopCost: 0 };
  for (const k of s.displayed ?? []) for (const [key, v] of Object.entries(RELICS[k].bonus) as [keyof RelicBonus, number][]) out[key] += v;
  return out;
}

/**
 * One roll per game second for the whole city. Each source building adds its odds per rarity;
 * a hit picks one relic of that rarity from that building kind. Returns the find, if any.
 */
export function findStep(s: GameState): { kind: RelicKind; source: BuildingKind } | null {
  const w = weightedCounts(s).w; // upgraded buildings dig deeper: a level 3 mine counts as two
  const roll = rngNext(s) % 10_000_000;
  let acc = 0;
  for (const rarity of [...RARITIES].reverse()) {
    for (const src of FIND_SOURCES) {
      const nPm = Math.min(SOURCE_CAP * 1000, w[src] ?? 0);
      if (nPm === 0) continue;
      const pool = relicsFrom(src).filter((k) => RELICS[k].rarity === rarity);
      if (pool.length === 0) continue;
      acc += Math.floor((nPm * RARITY[rarity].per10M) / 1000);
      if (roll < acc) {
        const kind = pool[rngInt(s, pool.length)]!;
        s.vault[kind] = (s.vault[kind] ?? 0) + 1;
        discover(s, kind);
        s.finds = (s.finds ?? 0) + 1;
        s.lastFind = { kind, source: src, tick: s.tick };
        const r = RELICS[kind];
        pushLog(s, `${RARITY[r.rarity].name} find! Your ${BUILDINGS[src].name} turned up ${r.name}.`);
        return { kind, source: src };
      }
    }
  }
  return null;
}

/** Put a relic from the vault on display (max three, one of each kind). */
export function displayRelic(s: GameState, k: RelicKind): Result {
  if (!isRelic(k)) return { ok: false, msg: 'Unknown relic' };
  if (s.displayed.includes(k)) return { ok: false, msg: 'Already on display' };
  if (s.displayed.length >= DISPLAY_SLOTS) return { ok: false, msg: `Only ${DISPLAY_SLOTS} relics fit on display` };
  if ((s.vault[k] ?? 0) < 1) return { ok: false, msg: 'Not in your vault' };
  s.vault[k] -= 1;
  s.displayed.push(k);
  pushLog(s, `${RELICS[k].name} is now on display.`);
  return { ok: true };
}

/** Take a relic off display and back into the vault. */
export function storeRelic(s: GameState, k: RelicKind): Result {
  if (!s.displayed.includes(k)) return { ok: false, msg: 'Not on display' };
  s.displayed = s.displayed.filter((x) => x !== k);
  s.vault[k] = (s.vault[k] ?? 0) + 1;
  return { ok: true };
}

/** Sell one relic from the vault to the crown for 60% of its worth. */
export function sellToCrown(s: GameState, k: RelicKind): Result {
  if (!isRelic(k) || (s.vault[k] ?? 0) < 1) return { ok: false, msg: 'Not in your vault' };
  const gold = Math.floor((RELICS[k].price * CROWN_PM) / 1000);
  s.vault[k] -= 1;
  s.gold += gold;
  pushLog(s, `Sold ${RELICS[k].name} to the crown for ${gold} gold.`);
  return { ok: true, gold };
}

/** How often an order for this relic gets filled by another city, per second, out of 10,000. */
export const RELIC_FILL_PER10K: Record<Rarity, number> = { rare: 50, epic: 15, legendary: 3, mythic: 0 };
