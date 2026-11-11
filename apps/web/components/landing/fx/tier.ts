'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';

/**
 * Performance tier detection as specified by the performance budget:
 * - FULL tier: laptops and desktops, big tablets.
 * - LITE tier: phones and small touch tablets, devices reporting <=2 cores or <=2 GB, or Save-Data.
 *   Lite keeps every scroll animation but in cheaper forms (no smooth-scroll engine, lower-res sky).
 * - Reduced motion: prefers-reduced-motion: reduce
 */

function checkReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function checkLiteTier(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
    if (nav.connection?.saveData) return true;
    // Chrome rounds these down (a normal 8-thread laptop can report 4 cores and 4 GB), so only the truly
    // small numbers mean a weak device
    if ((nav.hardwareConcurrency ?? 8) <= 2 || (nav.deviceMemory ?? 8) <= 2) return true;
    // phones and small tablets: touch only, small screen
    const touchOnly = window.matchMedia('(pointer: coarse)').matches && !window.matchMedia('(any-pointer: fine)').matches;
    return touchOnly && Math.min(screen.width, screen.height) < 820;
  } catch {
    return false;
  }
}

let cachedLite: boolean | null = null;
export function isLiteTier(): boolean {
  if (cachedLite !== null) return cachedLite;
  cachedLite = checkLiteTier();
  return cachedLite;
}

export function isReducedMotion(): boolean {
  return checkReducedMotion();
}

export interface TierInfo {
  lite: boolean;
  reducedMotion: boolean;
  mounted: boolean;
}

/** Hook returning tier state after mount to prevent hydration mismatch */
export function useTier(): TierInfo {
  const [tier, setTier] = useState<TierInfo>({
    lite: false,
    reducedMotion: false,
    mounted: false,
  });

  useEffect(() => {
    setTier({
      lite: isLiteTier(),
      reducedMotion: checkReducedMotion(),
      mounted: true,
    });

    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => {
      setTier((prev) => ({
        ...prev,
        reducedMotion: mql.matches,
      }));
    };

    if (mql.addEventListener) {
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    } else {
      mql.addListener(onChange);
      return () => mql.removeListener(onChange);
    }
  }, []);

  return tier;
}
