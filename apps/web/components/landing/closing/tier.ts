/**
 * Device tier for the closing sections: "lite" on touch screens, weak CPUs or little memory, where the
 * same scenes run in a cheaper form. Computed once per page load.
 */
let cached: boolean | null = null;

export function isLite(): boolean {
  if (cached !== null) return cached;
  if (typeof window === 'undefined') return false;
  const nav = navigator as Navigator & { deviceMemory?: number };
  cached = window.matchMedia('(pointer: coarse)').matches
    || (nav.hardwareConcurrency ?? 8) <= 4
    || (nav.deviceMemory ?? 8) <= 4;
  return cached;
}
