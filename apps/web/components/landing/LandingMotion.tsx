'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { isLiteTier, isReducedMotion } from './fx/tier';

gsap.registerPlugin(ScrollTrigger);

/*
  The landing's one motion language. Every reveal is transform + opacity only (no blur, no layout), eased
  with a long expo tail so things settle softly:
  - headings: each word rises out of its own mask (words are pre-split in JSX by <T split>);
  - section pills pop in; paragraphs, cards and lists drift up in staggered batches;
  - the intro: the nav drops in, the hero title rises, the village lifts into the valley while the sun
    climbs in the sky canvas (./sky/realm.ts).
  Lenis smooths wheel and trackpad scrolling wherever there is a mouse; touch keeps native momentum, and
  reduced motion keeps native scrolling and shows everything at rest.
*/

const EASE = 'expo.out';

function riseWords(words: Element[], opts: gsap.TweenVars = {}) {
  return gsap.fromTo(words,
    { yPercent: 118, rotate: 5, transformOrigin: '0% 100%' },
    { yPercent: 0, rotate: 0, duration: 1.25, ease: EASE, stagger: 0.065, ...opts });
}

export default function LandingMotion() {
  useEffect(() => {
    const reduced = isReducedMotion();
    const lite = isLiteTier();
    let lenis: Lenis | null = null;
    let tick: ((t: number) => void) | null = null;

    // in-page links glide (Lenis) or smooth-scroll natively
    const onAnchor = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
      const href = a?.getAttribute('href');
      if (!href || href.length < 2) return;
      const target = document.querySelector<HTMLElement>(href);
      if (!target) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(target, { offset: -24, duration: 1.4 });
      else target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
    };
    document.addEventListener('click', onAnchor);

    const ctx = gsap.context(() => {
      // wheel and trackpad glide on every device with a mouse; touch keeps its native momentum
      if (!reduced && matchMedia('(any-pointer: fine)').matches) {
        lenis = new Lenis({ lerp: 0.075, wheelMultiplier: 0.9, smoothWheel: true, autoRaf: false });
        lenis.on('scroll', ScrollTrigger.update);
        tick = (t: number) => lenis?.raf(t * 1000);
        gsap.ticker.add(tick);
        gsap.ticker.lagSmoothing(0);
      }
      if (reduced) return;

      // ---------- intro ----------
      const intro = gsap.timeline({ delay: 0.1 });
      const nav = document.querySelector('[data-hero-nav]');
      if (nav) intro.fromTo(nav, { y: -36, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1, ease: EASE }, 0);
      const h1Words = document.querySelectorAll('#hero-title .reveal-word');
      if (h1Words.length) intro.add(riseWords([...h1Words], { duration: 1.4, stagger: 0.08 }), 0.15);
      const heroRest = document.querySelectorAll('[data-hero-rest]');
      if (heroRest.length) intro.fromTo(heroRest, { y: 22, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1, ease: EASE, stagger: 0.09 }, 0.55);
      const town = document.querySelector('.hero-town');
      if (town) intro.fromTo(town, { y: 70, opacity: 0 }, { y: 0, opacity: 1, duration: 1.8, ease: EASE }, 0.35);
      const news = document.querySelector('.hero-news');
      if (news) intro.fromTo(news, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 1.2, ease: EASE }, 1.1);
      const land = document.querySelectorAll('.hero-land');
      if (land.length) intro.fromTo(land, { y: 40 }, { y: 0, duration: 1.8, ease: EASE }, 0.2);

      // ---------- section headings: words rise out of their masks ----------
      document.querySelectorAll<HTMLElement>('main h2[data-reveal-words]').forEach((h2) => {
        const words = [...h2.querySelectorAll('.reveal-word')];
        const st = { trigger: h2, start: 'top 84%', once: true };
        if (words.length) riseWords(words, { scrollTrigger: st });
        // headings with rich text (italics) rise as one line out of a clip
        else gsap.fromTo(h2, { yPercent: 40, opacity: 0, clipPath: 'inset(0 0 100% 0)' },
          { yPercent: 0, opacity: 1, clipPath: 'inset(0 0 -20% 0)', duration: 1.2, ease: EASE, scrollTrigger: st });
      });

      // ---------- section heads drift a little slower than the page (scrubbed depth) ----------
      if (!lite) {
        document.querySelectorAll<HTMLElement>('main section :is(div, header):not(.night-card):has(> h2[data-reveal-words])').forEach((head) => {
          if (head.closest('#world')) return; // that head sits on a sticky stage: it must stay put
          gsap.fromTo(head, { y: 46 }, {
            y: -46, ease: 'none',
            scrollTrigger: { trigger: head, start: 'top bottom', end: 'bottom top', scrub: true },
          });
        });
      }

      // ---------- pills pop ----------
      document.querySelectorAll<HTMLElement>('main section .landing-pill').forEach((pill) => {
        if (pill.closest('#hero')) return;
        gsap.fromTo(pill, { scale: 0.6, opacity: 0 }, {
          scale: 1, opacity: 1, duration: 0.7, ease: 'back.out(2.4)',
          scrollTrigger: { trigger: pill, start: 'top 88%', once: true },
        });
      });

      // ---------- blocks drift up; lists stagger their items ----------
      const blocks: HTMLElement[] = [];
      document.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
        if (el.closest('#hero')) return;
        if (el.tagName === 'UL' || el.tagName === 'OL') blocks.push(...[...el.children] as HTMLElement[]);
        else {
          // a section head: its heading and pill have their own reveals; drift the rest
          const parts = [...el.children].filter((c) => !c.matches('h2') && !c.querySelector('.landing-pill') && !c.matches('.landing-pill')) as HTMLElement[];
          blocks.push(...(el.querySelector('h2') ? parts : [el]));
        }
      });
      gsap.set(blocks, { y: 40, opacity: 0 });
      ScrollTrigger.batch(blocks, {
        start: 'top 90%',
        once: true,
        onEnter: (batch) => gsap.to(batch, { y: 0, opacity: 1, duration: 1.1, ease: EASE, stagger: 0.09, overwrite: true }),
      });

      document.fonts?.ready.then(() => ScrollTrigger.refresh());
    });
    const onLoad = () => ScrollTrigger.refresh();
    addEventListener('load', onLoad);

    // anything above a trigger that changes height (images arriving, the quiz moving to its next step, an
    // FAQ opening) would leave every later start and end stale: re-measure once the page settles
    let lastH = 0, refreshT = 0;
    const pageRo = new ResizeObserver(() => {
      const h = document.documentElement.scrollHeight;
      if (Math.abs(h - lastH) < 2) return;
      lastH = h;
      clearTimeout(refreshT);
      refreshT = window.setTimeout(() => ScrollTrigger.refresh(), 250);
    });
    const mainEl = document.querySelector('main');
    if (mainEl) pageRo.observe(mainEl);

    // pause CSS loops while the tab is hidden
    const onVis = () => { document.documentElement.dataset.pageHidden = document.hidden ? 'true' : 'false'; };
    document.addEventListener('visibilitychange', onVis);

    return () => {
      document.removeEventListener('click', onAnchor);
      document.removeEventListener('visibilitychange', onVis);
      removeEventListener('load', onLoad);
      pageRo.disconnect();
      clearTimeout(refreshT);
      ctx.revert();
      if (tick) gsap.ticker.remove(tick);
      lenis?.destroy();
    };
  }, []);

  return null;
}
