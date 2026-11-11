// The landing languages. No 'use client': the server page, the boot script and the client store share it.
export type Lang = 'en' | 'id' | 'ko' | 'zh';

export const LANGS: readonly { code: Lang; tag: string; short: string; name: string }[] = [
  { code: 'en', tag: 'en', short: 'EN', name: 'English' },
  { code: 'id', tag: 'id', short: 'ID', name: 'Bahasa Indonesia' },
  { code: 'ko', tag: 'ko', short: 'KO', name: '한국어' },
  { code: 'zh', tag: 'zh-Hans', short: '中', name: '简体中文' },
];

export const isLang = (v: unknown): v is Lang => LANGS.some((l) => l.code === v);
export const langTag = (l: Lang) => LANGS.find((x) => x.code === l)!.tag;
