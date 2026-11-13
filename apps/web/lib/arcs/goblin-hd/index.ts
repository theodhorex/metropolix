// Goblin HD: 2x art for the Goblins (128 px canvases, drawn at half scale). Merged over the 1x goblin art,
// so any kind not drawn yet still shows its 1x sprite.
import type { ArcArt } from '../../sprites';
import { pmBuildings, pmFoundation, pmGround } from './pm';
import { art as residential } from './residential';
import { art as decoration } from './decoration';
import { art as commerce } from './commerce';
import { art as military } from './military';
import { art as industryA } from './industry-a';
import { art as industryB } from './industry-b';
import { art as servicesA } from './services-a';
import { art as servicesB } from './services-b';
import type { BuildingKind } from '@metropolix/sim';
import { paintedArt, paintedNames } from '../../painted';

export const goblinHD: ArcArt = {
  ground: pmGround,
  foundation: pmFoundation,
  buildings: withPainted({ ...residential, ...decoration, ...commerce, ...military, ...industryA, ...industryB, ...servicesA, ...servicesB, ...pmBuildings }),
};

/** A painted picture (public/art/goblin/<kind>.png) wins over the drawn art when it is loaded. */
function withPainted(drawn: NonNullable<ArcArt['buildings']>): NonNullable<ArcArt['buildings']> {
  const out: NonNullable<ArcArt['buildings']> = { ...drawn };
  for (const kind of paintedNames('goblin') as BuildingKind[]) {
    const fallback = drawn[kind];
    out[kind] = () => { const p = paintedArt('goblin', kind); return p ? [p] : fallback ? fallback() : []; };
  }
  return out;
}
