import type { BuildingKind } from '@metropolix/sim';

/** Third-wave shared art (task file .agy/tasks/t27). Each entry returns the animation frames (64x64 canvases). */
export const art3c: Partial<Record<BuildingKind, () => HTMLCanvasElement[]>> = {};

/** Level 2 / level 3 add-ons for this file's kinds, drawn on a blank 64x64 canvas over the level 1 sprite. */
export const addons3c: Partial<Record<BuildingKind, (ctx: CanvasRenderingContext2D, level: 2 | 3, frame: number) => void>> = {};
