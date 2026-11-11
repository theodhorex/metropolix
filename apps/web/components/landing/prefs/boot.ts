// Shared by the server page (inline boot script) and the client store. No 'use client' here on purpose:
// a server component importing from a client module would get a reference, not the string.
export const PREFS_KEY = 'metropolix-landing-prefs';

/**
 * Runs before first paint (inlined in page.tsx) so a saved dark theme or language does not flash.
 * Kept as a string: it executes as a classic script, not as part of the React bundle.
 * Language: the saved choice, else the browser language when it is one of ours, else English.
 */
export const PREFS_BOOT = `(function(){try{var m=document.currentScript&&document.currentScript.parentElement;if(!m)return;var p=JSON.parse(localStorage.getItem('${PREFS_KEY}')||'null');var t=p&&p.theme||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');var ok={en:1,id:1,ko:1,zh:1};var l=p&&ok[p.lang]?p.lang:'';if(!l){var n=(navigator.language||'').toLowerCase().slice(0,2);l=ok[n]?n:'en';}m.dataset.theme=t;m.dataset.lang=l;document.documentElement.lang=l==='zh'?'zh-Hans':l;document.documentElement.style.colorScheme=t;}catch(e){}})();`;
