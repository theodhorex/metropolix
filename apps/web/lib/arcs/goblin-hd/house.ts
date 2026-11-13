// Goblin HD: the reference building (the House). Every other Goblin HD building follows its style.
import { G, MOSS, STONE, DAUB, banner, barrel, box, brickWalls, bush, canvasHD, chimney, crate, doorR, groundShadow, roof, scrap, smoke, timberFrame, windowL, windowR } from './kit';

/** A two-storey goblin cottage: stone ground floor, daub and timber above, moss roof with a tin patch. */
export function goblinHouse(frame: number): HTMLCanvasElement {
  const [cv, ctx] = canvasHD();
  const fx = 66, fy = 122, wL = 50, wR = 44;
  groundShadow(ctx, fx, fy, wL, wR, 12);
  // ground floor: stone
  box(ctx, fx, fy, wL, wR, 16, STONE);
  brickWalls(ctx, fx, fy, wL, wR, 16, 4, 6);
  doorR(ctx, fx, fy, 18, 9, 14);
  windowR(ctx, fx, fy, 6, 5, 6, 7);
  windowR(ctx, fx, fy, 32, 5, 6, 7);
  windowL(ctx, fx, fy, 12, 5, 6, 7);
  windowL(ctx, fx, fy, 32, 5, 6, 7, false);
  // upper floor: daub with timber framing, slightly overhanging
  const uy = fy - 16;
  box(ctx, fx, uy, wL, wR, 16, DAUB);
  timberFrame(ctx, fx, uy, wL, wR, 16);
  windowR(ctx, fx, uy, 7, 4, 6, 7);
  windowR(ctx, fx, uy, 30, 4, 6, 7);
  windowL(ctx, fx, uy, 10, 4, 6, 7);
  windowL(ctx, fx, uy, 34, 4, 6, 7);
  // roof and chimney
  roof(ctx, fx, uy, wL, wR, 16, 24, MOSS);
  const c = chimney(ctx, fx + 14, uy - 30, 12); // drawn after the roof so it stands on it
  smoke(ctx, c.x, c.y, frame);
  // yard: banner, barrel, crate, scrap and a bush
  banner(ctx, fx - wL + 1, fy - (wL >> 1) + 3, 34, frame, true);
  barrel(ctx, fx + wR - 2, fy - (wR >> 1) + 10);
  crate(ctx, fx + 4, fy + 4, 6);
  scrap(ctx, fx - 26, fy - 1, 3);
  bush(ctx, fx + wR - 12, fy - (wR >> 1) + 16, 4);
  return cv;
}
export const _unused = G; // keep the palette import for quick colour tweaks
