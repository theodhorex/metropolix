import type { BuildingKind } from '@metropolix/sim';

/** elf art for the third-wave buildings. Used as-is (no colour filter); kinds left out use the shared art recoloured. */
export const art3: Partial<Record<BuildingKind, () => HTMLCanvasElement[]>> = {};
