'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';

/**
 * Performance tier detection as specified by the performance budget:
 * - FULL tier: high-spec desktop with fine pointer, >4 CPU cores, >4GB RAM.
 * - LITE tier: coarse pointer (touch/phone/tablet), <=4 cores, or <=4GB RAM.
 * - Reduced motion: prefers-reduced-motion: reduce
 */

function checkReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function checkLiteTier(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    const cores = navigator.hardwareConcurrency ?? 8;
    const mem = (navigator as unknown as { deviceMemory?: number }).deviceMemory ?? 8;
    return isTouch || cores <= 4 || mem <= 4;
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
