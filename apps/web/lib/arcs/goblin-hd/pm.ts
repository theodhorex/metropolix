// Goblin HD art that the project manager draws: ground, building pad, the reference House.
import type { BuildingKind } from '@metropolix/sim';
import { goblinHouse } from './house';
import { grassTile, padTile } from './kit';

export const pmGround = (_parity: 0 | 1, variant: number) => grassTile(variant);
export const pmFoundation = () => padTile();
export const pmBuildings: Partial<Record<BuildingKind, () => HTMLCanvasElement[]>> = {
  house: () => [0, 1, 2].map(goblinHouse),
};
