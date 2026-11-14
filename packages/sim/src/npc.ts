// Random encounters with citizens: a line of dialogue plus 1-3 actions with small, real effects.
// Randomness comes from the state's PRNG so a replay with the same seed gives the same people.
import { RIVALS, addXp, arcDef, mayorRival, rivalLoot, rngInt, stats, pushLog, type GameState } from './index';

/** Citizens share gifts and favours a few times a minute, not without end: talks past this limit are only talk. */
export const TALK_REWARDS_PER_MIN = 4;
/** Use one of this minute's rewarded talks; false when they are used up. */
function rewardTalk(s: GameState): boolean {
  if (!s.talk || s.tick - s.talk.since >= 60) s.talk = { since: s.tick, n: 0 };
  if (s.talk.n >= TALK_REWARDS_PER_MIN) return false;
  s.talk.n++;
  return true;
}
/** Seconds until talks pay out again (0 when they do now). */
export function talkCooldown(s: GameState): number {
  if (!s.talk || s.tick - s.talk.since >= 60 || s.talk.n < TALK_REWARDS_PER_MIN) return 0;
  return 60 - (s.tick - s.talk.since);
}
const BUSY = (s: GameState) => `They have work to do. Talk again in ${talkCooldown(s)}s.`;
import { trainRole } from './war';

export type NpcAction = 'chat' | 'tip' | 'buy' | 'rumor' | 'recruit';
export interface NpcOption { id: NpcAction; label: string; hint?: string }
export interface Encounter { line: string; options: NpcOption[] }

// role index follows the order of sub-species per race: 0 fighter, 1 elder/noble, 2 mystic/rogue, 3 child, 4 worker, 5 guard
const ROLE_LINES: string[][] = [
  ['Another day, another scrap. Do you need someone to hit things?', 'I could carry twice my weight in ore. Ask anyone.', 'The rivals look soft from the wall. Just saying.'],
  ['In my day this was all open ground. Look at it now.', 'A wise mayor listens before building. Sit with me a moment.', 'Mind the taxes. Smiles cost less than soldiers.'],
  ['I saw something strange by the edge of town last night.', 'Some say the rival cities are hiding gold. I say they are hiding fear.', 'Luck favors those who pay for rumors.'],
  ['Are you the mayor? You are taller than I thought!', 'Can I help build something? I can hold the ladder!', 'I found a shiny rock. It is probably worth a lot.'],
  ['Work is steady, the days are long, the soup is thin.', 'Give us a farm and a school and we will give you a city.', 'My back hurts, but the town is growing, so I will not complain much.'],
  ['All quiet on my watch. Mostly.', 'Towers and troops, mayor. That is what keeps the raiders honest.', 'I have not slept since the last raid. Worth it.'],
];
const CHAT_REPLIES = [
  'They smile and wave you on.', 'You trade stories for a few minutes. The mood lifts.', 'They nod, clearly flattered you stopped.',
  'A short laugh, and they hurry back to work.', 'They tell you about their cousin in the next city.',
];
const COMPLAINTS = {
  unhappy: ['Taxes are crushing us. Lower them or I am leaving.', 'Nothing to do and nowhere to rest. A park would help.'],
  jobless: ['I have no work. Please, build something with jobs.', 'Half of us are idle. The market stalls are empty.'],
  broke: ['The treasury is bare, mayor. People notice.'],
};

export function npcEncounter(s: GameState, role: number): Encounter {
  const st = stats(s);
  const r = ((role % 6) + 6) % 6;
  const pool: string[] = [];
  if (st.happinessPm < 400) pool.push(...COMPLAINTS.unhappy);
  if (s.pop > 10 && st.unemployed > s.pop / 4) pool.push(...COMPLAINTS.jobless);
  if (s.gold < 30) pool.push(...COMPLAINTS.broke);
  pool.push(...ROLE_LINES[r]!);
  const line = pool[rngInt(s, pool.length)]!;

  const options: NpcOption[] = [{ id: 'chat', label: 'Chat' }];
  const extra: NpcOption[] = [];
  if (s.gold >= 15) extra.push({ id: 'tip', label: 'Give a tip', hint: '15 gold' });
  if (s.gold >= 40 && s.arc) extra.push({ id: 'buy', label: 'Buy supplies', hint: '40 gold' });
  extra.push({ id: 'rumor', label: 'Ask for news' });
  if ((r === 0 || r === 5) && s.gold >= 60 && s.ore >= 3 && st.troopCap > s.troops) extra.push({ id: 'recruit', label: 'Recruit', hint: '60 gold, 3 ore' });
  for (let i = 0; i < 2 && extra.length; i++) options.push(extra.splice(rngInt(s, extra.length), 1)[0]!);
  return { line, options };
}

/** Apply one action. Returns the NPC's reply. */
export function npcAct(s: GameState, action: NpcAction): string {
  switch (action) {
    case 'chat': {
      if (!rewardTalk(s)) return BUSY(s);
      addXp(s, 2);
      if (rngInt(s, 100) < 25) { const g = 5 + rngInt(s, 16); s.gold += g; return `They press ${g} gold into your hand for good luck.`; }
      return CHAT_REPLIES[rngInt(s, CHAT_REPLIES.length)]!;
    }
    case 'tip': {
      if (s.gold < 15) return 'You cannot afford that right now.';
      if (!rewardTalk(s)) return BUSY(s);
      s.gold -= 15;
      // a tip buys goodwill (XP); the gold that comes back is luck and on average less than you gave
      if (rngInt(s, 100) < 40) { const g = 20 + rngInt(s, 16); s.gold += g; addXp(s, 10); return `They are grateful and slip you ${g} gold back from a lucky find.`; }
      addXp(s, 5);
      return 'They thank you warmly. Word of your kindness will spread.';
    }
    case 'buy': {
      if (s.gold < 40) return 'You cannot afford that right now.';
      if (!rewardTalk(s)) return BUSY(s);
      const a = arcDef(s.arc);
      // buy what your land lacks; a people without forests builds in stone and wants ore
      const wood = a ? a.woodPm > 0 && a.woodPm <= a.orePm : true;
      s.gold -= 40;
      // close to the fair price (wood 4, ore 6), so reselling never pays
      if (wood) { s.wood += 12; return 'You buy a bundle of 12 wood.'; }
      s.ore += 7; return 'You buy a sack of 7 ore.';
    }
    case 'rumor': {
      // news is about the mayors of this world (old saves without one fall back to the first rivals)
      const pool = s.world?.mayors.length ? s.world.mayors.map(mayorRival) : RIVALS;
      const r = pool[rngInt(s, pool.length)]!;
      const msg = `${r.name} guards itself with ${r.defense} defense and keeps about ${rivalLoot(r)} gold in the vaults.`;
      pushLog(s, `Rumor: ${msg}`);
      return msg;
    }
    case 'recruit': {
      const res = trainRole(s, 'vanguard', 1);
      return res.ok ? 'They take up arms and join your army.' : `They cannot join: ${res.msg as string}`;
    }
  }
}
