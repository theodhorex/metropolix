'use client';

import { useSyncExternalStore } from 'react';
import { PREFS_KEY } from './boot';
import { isLang, langTag, type Lang } from './langs';

/**
 * Landing preferences: colour theme and language. They live as attributes on
 * <main data-page="landing" data-theme data-lang> so plain CSS (and server components) can follow them;
 * this tiny store mirrors them for client components that need the values (aria labels, alt text).
 */
export type Theme = 'light' | 'dark';
export type { Lang };
export interface Prefs { theme: Theme; lang: Lang }

const DEFAULT: Prefs = { theme: 'light', lang: 'en' };

let current: Prefs = DEFAULT;
const listeners = new Set<() => void>();

function main(): HTMLElement | null {
  return typeof document === 'undefined' ? null : document.querySelector<HTMLElement>('main[data-page="landing"]');
}

/** Read what the inline boot script (or a previous visit) already put on <main>. */
function readDom(): Prefs {
  const m = main();
  const theme = m?.dataset.theme === 'dark' ? 'dark' : 'light';
  const lang = isLang(m?.dataset.lang) ? m.dataset.lang : 'en';
  if (current.theme === theme && current.lang === lang) return current; // keep the snapshot stable
  return { theme, lang };
}

export function setPrefs(next: Partial<Prefs>) {
  current = { ...readDom(), ...next };
  const m = main();
  if (m) { m.dataset.theme = current.theme; m.dataset.lang = current.lang; }
  document.documentElement.lang = langTag(current.lang);
  document.documentElement.style.colorScheme = current.theme;
  try { localStorage.setItem(PREFS_KEY, JSON.stringify(current)); } catch { /* private mode: this visit only */ }
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  current = readDom();
  return () => { listeners.delete(l); };
}
const snapshot = () => current;
const serverSnapshot = () => DEFAULT;

export function usePrefs(): Prefs {
  return useSyncExternalStore(subscribe, snapshot, serverSnapshot);
}

/**
 * Pick a string for the current language (for attributes and computed text; visible text should use <T>).
 * Korean and Chinese fall back to English when missing.
 */
export function useTr() {
  const { lang } = usePrefs();
  return (en: string, id: string, ko?: string, zh?: string) =>
    lang === 'id' ? id : lang === 'ko' ? (ko ?? en) : lang === 'zh' ? (zh ?? en) : en;
}
