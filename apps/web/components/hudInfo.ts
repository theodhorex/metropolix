import * as sim from '@metropolix/sim';
import { perSec, type TipInfo } from './HudTip';

export type HudKey = 'gold' | 'citizens' | 'happiness' | 'education' | 'wood' | 'ore' | 'food' | 'chainPower';

const pct = (pm: number) => `${(pm / 10).toFixed(pm % 10 ? 1 : 0)}%`;
const signedPct = (pm: number) => `${pm > 0 ? '+' : ''}${pct(pm)}`;
const n = (v: number) => v.toLocaleString('en-US');

/** Text for the top-bar cards, built from the same numbers the sim uses. */
export function hudInfo(s: sim.GameState, st: sim.Stats): Record<HudKey, TipInfo> {
  const arc = sim.arcDef(s.arc);
  const c = sim.counts(s);
  const foodNet = st.foodRate - st.foodUse;
  const drag = [...st.happyParts].filter((p) => p.pm < 0).sort((a, b) => a.pm - b.pm)[0];

  return {
    gold: {
      title: 'Gold',
      desc: 'Pays for buildings, troops and market deals. Working citizens pay it as tax.',
      rows: [
        { k: 'Taxes collected', v: perSec(st.income), tone: 'good' },
        ...(st.upkeep ? [{ k: 'Building upkeep', v: perSec(-st.upkeep), tone: 'bad' as const }] : []),
        { k: 'Net per second', v: perSec(st.net), tone: st.net >= 0 ? 'good' : 'bad' },
        { k: 'Tax rate', v: `${s.taxRate}%` },
      ],
      note: st.net < 0
        ? { text: 'You lose gold every second. Raise taxes a little or add jobs.', tone: 'bad' }
        : s.taxRate > 10 ? { text: 'Taxes above 10% cost happiness.', tone: 'info' } : undefined,
    },
    citizens: {
      title: 'Citizens',
      desc: 'People living in your homes. They fill jobs and pay taxes.',
      rows: [
        { k: 'Living here', v: `${n(s.pop)} of ${n(st.housing)}` },
        { k: 'Working', v: n(st.employed) },
        { k: 'Without a job', v: n(st.unemployed), tone: st.unemployed > 0 ? 'bad' : undefined },
        { k: 'Jobs still open', v: n(Math.max(0, st.jobs - st.employed)) },
      ],
      note: st.happinessPm < 250 && s.pop > 0 ? { text: 'Unhappy citizens are moving out.', tone: 'bad' }
        : st.unemployed > 0 ? { text: 'Some citizens have no work. Build shops, farms or workshops.', tone: 'bad' }
        : s.pop >= st.housing && st.housing > 0 ? { text: 'Every home is full. Build houses to grow.', tone: 'info' }
        : undefined,
    },
    happiness: {
      title: 'Happiness',
      desc: 'How content your citizens are. Happy cities work faster. Below 25% people move out.',
      rows: [
        ...st.happyParts.map((p) => ({ k: p.label, v: p.label === 'Base mood' ? pct(p.pm) : signedPct(p.pm), tone: p.label === 'Base mood' ? undefined : p.pm > 0 ? 'good' as const : 'bad' as const })),
        { k: 'Total', v: pct(st.happinessPm), tone: 'gold' },
      ],
      note: drag ? { text: `Biggest drag: ${drag.label.toLowerCase()} (${signedPct(drag.pm)}).`, tone: 'bad' } : { text: 'Nothing is pulling happiness down.', tone: 'good' },
    },
    education: {
      title: 'Education',
      desc: 'Share of citizens with a school seat. Educated citizens work faster.',
      rows: [
        { k: 'School seats', v: n(st.edu) },
        { k: 'Citizens', v: n(s.pop) },
        { k: 'Covered', v: pct(st.eduCoverPm), tone: 'gold' },
        { k: 'Work speed', v: pct(st.productivityPm) },
      ],
      note: st.eduCoverPm < 1000 && s.pop > st.edu
        ? { text: `${n(s.pop - st.edu)} citizens have no seat. Build a school or library.`, tone: 'info' }
        : { text: 'Every citizen has a seat.', tone: 'good' },
    },
    wood: {
      title: 'Wood',
      desc: 'Building material. Lumber mills cut it from your forests.',
      rows: [
        { k: 'In store', v: n(s.wood) },
        { k: 'Lumber mills', v: n(c.lumber ?? 0) },
        { k: 'Made per second', v: perSec(st.woodRate), tone: st.woodRate > 0 ? 'good' : undefined },
      ],
      note: arc && arc.woodPm === 0 ? { text: `The ${arc.name} have no forests. Buy wood at the Market.`, tone: 'bad' }
        : st.woodRate === 0 ? { text: 'Build a lumber mill to make wood.', tone: 'info' } : undefined,
    },
    ore: {
      title: 'Ore',
      desc: 'Stone and metal for big buildings and troops. Mines dig it up.',
      rows: [
        { k: 'In store', v: n(s.ore) },
        { k: 'Mines', v: n(c.mine ?? 0) },
        { k: 'Made per second', v: perSec(st.oreRate), tone: st.oreRate > 0 ? 'good' : undefined },
      ],
      note: arc && arc.orePm === 0 ? { text: `The ${arc.name} have no ore. Buy it at the Market.`, tone: 'bad' }
        : st.oreRate === 0 ? { text: 'Build a mine to make ore.', tone: 'info' } : undefined,
    },
    food: {
      title: 'Food',
      desc: 'Every 20 citizens eat 1 food per second. Farms grow it.',
      rows: [
        { k: 'In store', v: n(s.food) },
        { k: 'Farms grow', v: perSec(st.foodRate), tone: 'good' },
        ...(sim.foodTypes(s).length > 0 ? [{ k: 'Kinds of food', v: sim.foodTypes(s).join(', ') }] : []),
        { k: 'Citizens eat', v: perSec(-st.foodUse), tone: 'bad' },
        { k: 'Net per second', v: perSec(foodNet), tone: foodNet >= 0 ? 'good' : 'bad' },
      ],
      note: st.hungry ? { text: 'Your citizens are hungry: -15% happiness. Build farms or buy food at the Market.', tone: 'bad' }
        : foodNet < 0 && s.food > 0 ? { text: `Food runs out in about ${Math.floor(s.food / -foodNet)}s.`, tone: 'bad' }
        : undefined,
    },
    chainPower: {
      title: 'ChainPower',
      desc: 'Your city score on NEAR and the leaderboard: economy, plus attack, plus defense counted 1.5 times.',
      rows: [
        { k: 'Economy', v: n(st.econScore) },
        { k: 'Attack', v: n(st.attack) },
        { k: 'Defense x 1.5', v: n(Math.floor((st.defense * 3) / 2)) },
        { k: 'Total', v: n(st.chainPower), tone: 'gold' },
      ],
      note: { text: 'Save your city on chain from the NEAR panel to put this score on the leaderboard.', tone: 'info' },
    },
  };
}
