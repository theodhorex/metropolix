import type { ReactNode } from 'react';

/**
 * Bilingual text that works in server and client components alike: both languages are rendered and
 * CSS shows the one that matches <main data-lang>. Use useTr() from ./store for attributes instead.
 */
export default function T({ en, id }: { en: ReactNode; id: ReactNode }) {
  return (
    <>
      <span className="t-en" lang="en">{en}</span>
      <span className="t-id" lang="id">{id}</span>
    </>
  );
}
