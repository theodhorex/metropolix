import type { ArcId } from '@metropolix/sim';
import type { ArcArt } from '../sprites';
import { art as elf } from './elf';
import { art as lizard } from './lizard';
import { art as caveman } from './caveman';
import { art as dragon } from './dragon';
import { art as goblin } from './goblin';
import { art3 as elf3 } from './elf-wave3';
import { art3 as lizard3 } from './lizard-wave3';
import { art3 as caveman3 } from './caveman-wave3';
import { art3 as dragon3 } from './dragon-wave3';
import { art3 as goblin3 } from './goblin-wave3';
import { wonderArt } from './wonders';
import { goblinHD } from './goblin-hd';

const THIRD: Record<ArcId, ArcArt['buildings']> = { elf: elf3, lizard: lizard3, caveman: caveman3, dragon: dragon3, goblin: goblin3 };
const withWonders = (id: ArcId, a: ArcArt): ArcArt => ({ ...a, buildings: { ...a.buildings, ...THIRD[id], ...wonderArt[id] } });

/** Hand-drawn art per arc. Empty entries fall back to the shared sprites with a colour theme. */
export const ARC_ART: Partial<Record<ArcId, ArcArt>> = {
  elf: withWonders('elf', elf), lizard: withWonders('lizard', lizard), caveman: withWonders('caveman', caveman),
  dragon: withWonders('dragon', dragon),
  // the Goblins have the 2x art: it overrides the 1x drawings kind by kind
  goblin: (() => { const b = withWonders('goblin', goblin); return { ...b, ...goblinHD, buildings: { ...b.buildings, ...goblinHD.buildings } }; })(),
};
