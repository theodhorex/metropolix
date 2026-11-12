import type { ArcId, BuildingKind } from '@metropolix/sim';

/**
 * Wonder art, one per people (task file .agy/tasks/t27). Drawn in that people's own palette and
 * used as-is (no colour filter). Each entry returns the animation frames (64x64 canvases).
 */
export const wonderArt: Record<ArcId, Partial<Record<BuildingKind, () => HTMLCanvasElement[]>>> = {
  elf: {}, lizard: {}, caveman: {}, dragon: {}, goblin: {},
};
