import type { ReactNode } from 'react';
import { LANGS } from './langs';

/**
 * Text in every landing language that works in server and client components alike: all languages are
 * rendered and CSS shows the one that matches <main data-lang>. A missing ko/zh falls back to English
 * (so a half-translated string never shows up blank). Use useTr() from ./store for attributes instead.
 */
export default function T(props: { en: ReactNode; id: ReactNode; ko?: ReactNode; zh?: ReactNode }) {
  return (
    <>
      {LANGS.map(({ code, tag }) => (
        <span key={code} className={`t-${code}`} lang={tag}>{props[code] ?? props.en}</span>
      ))}
    </>
  );
}
