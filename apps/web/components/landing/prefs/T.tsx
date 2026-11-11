import type { ReactNode } from 'react';
import { LANGS, type Lang } from './langs';

/**
 * Text in every landing language that works in server and client components alike: all languages are
 * rendered and CSS shows the one that matches <main data-lang>. A missing ko/zh falls back to English
 * (so a half-translated string never shows up blank). Use useTr() from ./store for attributes instead.
 *
 * `split` pre-splits string text into `.reveal-word` spans for the word-by-word heading reveal, so the
 * animation never has to cut up text nodes React owns (that broke spacing after a re-render).
 */
export default function T(props: { en: ReactNode; id: ReactNode; ko?: ReactNode; zh?: ReactNode; split?: boolean }) {
  return (
    <>
      {LANGS.map(({ code, tag }) => {
        const v = props[code] ?? props.en;
        return (
          <span key={code} className={`t-${code}`} lang={tag}>
            {props.split && typeof v === 'string' ? <Words text={v} lang={code} /> : v}
          </span>
        );
      })}
    </>
  );
}

/** Words for the reveal; Chinese has no spaces, so it reveals in pairs of characters instead. */
function Words({ text, lang }: { text: string; lang: Lang }) {
  const parts = text.split(/\s+/).filter(Boolean);
  const units = lang === 'zh' && parts.length === 1 ? (text.match(/.{1,2}/gu) ?? [text]) : parts;
  const sep = lang === 'zh' && parts.length === 1 ? '' : ' ';
  return (
    <>
      {units.map((w, i) => (
        <span key={i}>
          {i > 0 && sep}
          <span className="reveal-word inline-block">{w}</span>
        </span>
      ))}
    </>
  );
}
