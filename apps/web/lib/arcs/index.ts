import type { ArcId } from '@metropolix/sim';
import type { ArcArt } from '../sprites';
import { art as elf } from './elf';
import { art as lizard } from './lizard';
import { art as caveman } from './caveman';
import { art as dragon } from './dragon';
import { art as goblin } from './goblin';
import { wonderArt } from './wonders';

const withWonders = (id: ArcId, a: ArcArt): ArcArt => ({ ...a, buildings: { ...a.buildings, ...wonderArt[id] } });

/** Hand-drawn art per arc. Empty entries fall back to the shared sprites with a colour theme. */
export const ARC_ART: Partial<Record<ArcId, ArcArt>> = {
  elf: withWonders('elf', elf), lizard: withWonders('lizard', lizard), caveman: withWonders('caveman', caveman),
  dragon: withWonders('dragon', dragon), goblin: withWonders('goblin', goblin),
};
