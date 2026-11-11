'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Splits text nodes in an element into inline-block word spans for staggered blur/reveal animations,
 * while preserving tags like <br> and <em>.
 */
function splitWords(el: HTMLElement): HTMLElement[] {
  const existing = el.querySelectorAll<HTMLElement>('.reveal-word');
  if (existing.length > 0) return Array.from(existing);

  const spans: HTMLElement[] = [];

  function processNode(node: Node) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent || '';
      const parts = text.split(/(\s+)/);
      const fragment = document.createDocumentFragment();

      parts.forEach((part) => {
        if (/^\s+$/.test(part) || part === '') {
          fragment.appendChild(document.createTextNode(part));
        } else {
          const span = document.createElement('span');
          span.className = 'reveal-word inline-block';
          span.textContent = part;
          fragment.appendChild(span);
          spans.push(span);
        }
      });

      node.parentNode?.replaceChild(fragment, node);
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const elNode = node as HTMLElement;
      if (elNode.tagName.toLowerCase() === 'br') {
        return;
      }
      Array.from(elNode.childNodes).forEach(processNode);
    }
  }

  Array.from(el.childNodes).forEach(processNode);
  return spans;
}

export default function LandingMotion() {
  useEffect(() => {
    // Respect prefers-reduced-motion: skip all intro zooms, smooth scrolls, and parallax
    const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isReducedMotion) {
      return;
    }

    let backdropEl: HTMLDivElement | null = null;
    let lenis: Lenis | null = null;
    let tickerCallback: ((time: number) => void) | null = null;

    const ctx = gsap.context(() => {
      // 1. Initialize Lenis smooth scroll
      lenis = new Lenis({
        duration: 1.25,
        smoothWheel: true,
        autoRaf: false,
      });

      lenis.on('scroll', ScrollTrigger.update);

      tickerCallback = (time: number) => {
        lenis?.raf(time * 1000);
      };
      gsap.ticker.add(tickerCallback);
      gsap.ticker.lagSmoothing(0);

      // In-page smooth scroll for a[href^="#"] links
      const handleAnchorClick = (e: MouseEvent) => {
        const anchor = (e.target as HTMLElement).closest('a[href^="#"]');
        if (!anchor) return;
        const href = anchor.getAttribute('href');
        if (href && href.length > 1 && href.startsWith('#')) {
          const target = document.querySelector(href);
          if (target && lenis) {
            e.preventDefault();
            lenis.scrollTo(target as HTMLElement, { offset: -24 });
          }
        }
      };
      document.addEventListener('click', handleAnchorClick);

      // 2. Intro "gate opens" animation
      const main = document.querySelector<HTMLElement>('main[data-page="landing"]');
      if (main) {
        // Create blurred backdrop of city.jpg
        backdropEl = document.createElement('div');
        backdropEl.id = 'landing-gate-backdrop';
        backdropEl.style.position = 'fixed';
        backdropEl.style.inset = '0';
        backdropEl.style.zIndex = '-1';
        backdropEl.style.backgroundImage = 'url(/landing/city.jpg)';
        backdropEl.style.backgroundPosition = 'center';
        backdropEl.style.backgroundSize = 'cover';
        backdropEl.style.filter = 'blur(20px) brightness(0.65)';
        backdropEl.style.transform = 'scale(1.1)';
        backdropEl.style.pointerEvents = 'none';
        document.body.prepend(backdropEl);

        gsap.set(main, {
          scale: 0.9,
          borderRadius: '28px',
          overflow: 'hidden',
          transformOrigin: 'center center',
        });

        const introTl = gsap.timeline({
          onComplete: () => {
            // Clear props so ScrollTrigger pins work accurately without offset distortion
            gsap.set(main, { clearProps: 'transform,scale,borderRadius,overflow' });
            if (backdropEl && backdropEl.parentNode) {
              backdropEl.parentNode.removeChild(backdropEl);
              backdropEl = null;
            }
            ScrollTrigger.refresh();
          },
        });

        introTl.to(main, {
          scale: 1,
          borderRadius: '0px',
          duration: 1.4,
          ease: 'expo.inOut',
        });

        // Drop in hero navigation
        const heroNav = document.querySelector('[data-hero-nav]');
        if (heroNav) {
          introTl.fromTo(
            heroNav,
            { y: -60, opacity: 0 },
            { y: 0, opacity: 1, duration: 1.0, ease: 'power3.out' },
            '-=0.9'
          );
        }

        // Hero headline word-by-word reveal
        const heroH1 = document.querySelector('h1[data-reveal-words]');
        if (heroH1) {
          const words = splitWords(heroH1 as HTMLElement);
          if (words.length > 0) {
            introTl.fromTo(
              words,
              { opacity: 0, y: 24, filter: 'blur(10px)' },
              {
                opacity: 1,
                y: 0,
                filter: 'blur(0px)',
                duration: 0.9,
                stagger: 0.07,
                ease: 'power2.out',
              },
              '-=1.0'
            );
          }
        }
      }

      // 3. Generic [data-reveal] elements fade up at top 85%
      const reveals = document.querySelectorAll<HTMLElement>('[data-reveal]');
      reveals.forEach((el) => {
        if (el.closest('#hero')) return;
        gsap.fromTo(
          el,
          { opacity: 0, y: 16 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
          }
        );
      });

      // 4. Section h2 with [data-reveal-words] reveal word by word at top 80%
      const sectionH2s = document.querySelectorAll<HTMLElement>('h2[data-reveal-words]');
      sectionH2s.forEach((h2) => {
        if (h2.closest('#hero')) return;
        const words = splitWords(h2);
        if (words.length > 0) {
          gsap.fromTo(
            words,
            { opacity: 0, y: 24, filter: 'blur(10px)' },
            {
              opacity: 1,
              y: 0,
              filter: 'blur(0px)',
              duration: 0.8,
              stagger: 0.07,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: h2,
                start: 'top 80%',
                toggleActions: 'play none none none',
              },
            }
          );
        }
      });

      // 5. Refresh ScrollTrigger after fonts/images load
      if (typeof document !== 'undefined' && 'fonts' in document) {
        document.fonts.ready.then(() => {
          ScrollTrigger.refresh();
        });
      }

      const onWindowLoad = () => ScrollTrigger.refresh();
      window.addEventListener('load', onWindowLoad);
    });

    return () => {
      ctx.revert();
      if (tickerCallback) {
        gsap.ticker.remove(tickerCallback);
      }
      if (lenis) {
        lenis.destroy();
      }
      if (backdropEl && backdropEl.parentNode) {
        backdropEl.parentNode.removeChild(backdropEl);
      }
    };
  }, []);

  return null;
}
