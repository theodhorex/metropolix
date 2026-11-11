// Shared by the server page (inline boot script) and the client store. No 'use client' here on purpose:
// a server component importing from a client module would get a reference, not the string.
export const PREFS_KEY = 'metropolix-landing-prefs';

/**
 * Runs before first paint (inlined in page.tsx) so a saved dark theme or Indonesian does not flash.
 * Kept as a string: it executes as a classic script, not as part of the React bundle.
 */
export const PREFS_BOOT = `(function(){try{var m=document.currentScript&&document.currentScript.parentElement;if(!m)return;var p=JSON.parse(localStorage.getItem('${PREFS_KEY}')||'null');var t=p&&p.theme||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');var l=p&&p.lang||((navigator.language||'').toLowerCase().indexOf('id')===0?'id':'en');m.dataset.theme=t;m.dataset.lang=l;document.documentElement.lang=l;document.documentElement.style.colorScheme=t;}catch(e){}})();`;
