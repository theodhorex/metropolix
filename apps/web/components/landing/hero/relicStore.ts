'use client';

import { useSyncExternalStore } from 'react';
import type { RelicKind } from '@metropolix/sim';

export const HERO_RELIC_KINDS: readonly RelicKind[] = [
  'geode',
  'moonpearl',
  'starmetal',
  'goldtimber',
  'phoenixfeather',
] as const;

export const TOTAL_HERO_RELICS = HERO_RELIC_KINDS.length;

const STORAGE_KEY = 'metropolix:hero:relics';
const TOAST_KEY = 'metropolix:hero:relics:toast';

let cachedRelics: RelicKind[] = [];
let initialized = false;
const listeners = new Set<() => void>();

function readStorage(): RelicKind[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter((k): k is RelicKind => HERO_RELIC_KINDS.includes(k as RelicKind));
    }
  } catch {
    // sessionStorage not available (private browsing, sandbox)
  }
  return [];
}

function writeStorage(relics: RelicKind[]) {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(relics));
  } catch {
    // ignore
  }
}

export function getFoundRelics(): RelicKind[] {
  if (!initialized && typeof window !== 'undefined') {
    cachedRelics = readStorage();
    initialized = true;
  }
  return cachedRelics;
}

export function addFoundRelic(kind: RelicKind): { isNew: boolean; count: number; allFound: boolean } {
  const current = getFoundRelics();
  const exists = current.includes(kind);
  if (exists) {
    return { isNew: false, count: current.length, allFound: current.length >= TOTAL_HERO_RELICS };
  }
  const next = [...current, kind];
  cachedRelics = next;
  writeStorage(next);
  listeners.forEach((l) => l());

  let allFound = false;
  if (next.length >= TOTAL_HERO_RELICS) {
    allFound = true;
    try {
      const shown = sessionStorage.getItem(TOAST_KEY);
      if (!shown) {
        sessionStorage.setItem(TOAST_KEY, '1');
        dispatchToast();
      }
    } catch {
      dispatchToast();
    }
  }
  return { isNew: true, count: next.length, allFound };
}

function dispatchToast() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('metropolix:relics:all-found'));
  }
}

function subscribe(l: () => void) {
  listeners.add(l);
  if (!initialized && typeof window !== 'undefined') {
    cachedRelics = readStorage();
    initialized = true;
  }
  return () => {
    listeners.delete(l);
  };
}

export function useFoundRelics(): RelicKind[] {
  return useSyncExternalStore(subscribe, getFoundRelics, () => []);
}
