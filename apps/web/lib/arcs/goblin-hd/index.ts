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

export const goblinHD: ArcArt = {
  ground: pmGround,
  foundation: pmFoundation,
  buildings: { ...residential, ...decoration, ...commerce, ...military, ...industryA, ...industryB, ...servicesA, ...servicesB, ...pmBuildings },
};
