import { BUILDINGS, type BuildingKind } from '@metropolix/sim';

export function shadeHex(hex: string, f: number): string {
  const n = parseInt(hex.slice(1), 16);
  const c = (v: number) => Math.max(0, Math.min(255, Math.round(v * f)));
  return `rgb(${c((n >> 16) & 255)},${c((n >> 8) & 255)},${c(n & 255)})`;
}

/** Short stat chips for a building card. */
export function chips(kind: BuildingKind): string[] {
  const b = BUILDINGS[kind];
  const out: string[] = [];
  if (b.housing) out.push(`+${b.housing} housing`);
  if (b.jobs) out.push(`${b.jobs} jobs`);
  if (b.output) out.push(`+${b.output} output`);
  if (b.edu) out.push(`educates ${b.edu}`);
  if (b.happy) out.push(`+${b.happy} happy`);
  if (b.pollution) out.push(`-${b.pollution} pollution`);
  if (b.troopCap) out.push(`${b.troopCap} troops`);
  if (b.defense) out.push(`+${b.defense} defense`);
  if (b.wood) out.push('+wood');
  if (b.ore) out.push('+ore');
  if (b.woodCost) out.push(`${b.woodCost} wood`);
  if (b.oreCost) out.push(`${b.oreCost} ore`);
  if (b.upkeep) out.push(`upkeep ${b.upkeep}/s`);
  return out;
}
