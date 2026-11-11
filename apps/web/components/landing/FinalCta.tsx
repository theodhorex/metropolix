'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function FinalCta() {
  const sectionRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const bg = bgRef.current;
    if (!section || !bg) return;

    const mm = gsap.matchMedia();

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      // Background drifts slightly with scroll (yPercent -12 -> 0, scrub)
      gsap.fromTo(
        bg,
        { yPercent: -12 },
        {
          yPercent: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
          },
        }
      );
    });

    mm.add('(prefers-reduced-motion: reduce)', () => {
      gsap.set(bg, { yPercent: 0 });
    });

    return () => {
      mm.revert();
    };
  }, []);

  // Pre-generate ember configurations for falling particles
  const embers = [
    { left: '8%', delay: '0s', dur: '4.5s', size: 3 },
    { left: '18%', delay: '1.2s', dur: '5.2s', size: 4 },
    { left: '26%', delay: '2.8s', dur: '6.1s', size: 3 },
    { left: '38%', delay: '0.6s', dur: '4.8s', size: 4 },
    { left: '49%', delay: '3.1s', dur: '5.5s', size: 3 },
    { left: '60%', delay: '1.7s', dur: '4.2s', size: 5 },
    { left: '72%', delay: '2.4s', dur: '6.4s', size: 3 },
    { left: '81%', delay: '0.9s', dur: '5.0s', size: 4 },
    { left: '92%', delay: '3.5s', dur: '5.8s', size: 3 },
  ];

  return (
    <section
      ref={sectionRef}
      id="cta"
      aria-labelledby="cta-h"
      className="relative flex min-h-[92vh] items-center justify-center overflow-hidden bg-white px-4 py-24 md:min-h-screen"
    >
      {/* Lower ~78% Night Scene Image with Mask Fade into White */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-[78%] overflow-hidden"
        style={{
          maskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.4) 15%, black 40%)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.4) 15%, black 40%)',
        }}
      >
        <div
          ref={bgRef}
          className="relative h-[120%] w-full"
          style={{ willChange: 'transform' }}
        >
          <Image
            src="/landing/city.jpg"
            alt=""
            fill
            sizes="100vw"
            className="object-cover object-bottom"
            style={{
              filter: 'brightness(0.38) contrast(1.25) saturate(1.15)',
            }}
          />
          {/* Deep blue night overlay */}
          <div
            className="absolute inset-0 bg-[#070f20]/65 mix-blend-multiply"
            aria-hidden="true"
          />
        </div>

        {/* Falling pixel embers */}
        <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden" aria-hidden="true">
          {embers.map((e, idx) => (
            <div
              key={idx}
              className="pixel-ember"
              style={{
                left: e.left,
                animationDelay: e.delay,
                animationDuration: e.dur,
                width: `${e.size}px`,
                height: `${e.size}px`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Frosted White-to-Clear Card Centred on Top */}
      <div
        className="relative z-20 mx-auto w-full max-w-2xl px-6 py-14 text-center sm:px-12 sm:py-16"
        style={{
          background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.96) 0%, rgba(255, 255, 255, 0.22) 100%)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderRadius: '26px',
          border: '1px solid rgba(255, 255, 255, 0.8)',
          boxShadow: '0 24px 64px rgba(10, 18, 36, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
        }}
        data-reveal
      >
        <div className="mb-3">
          <span className="landing-pill">Your turn</span>
        </div>

        <h2
          id="cta-h"
          data-reveal-words
          className="font-serif-display text-4xl font-normal tracking-tight text-[var(--landing-ink)] sm:text-5xl"
        >
          Your realm is waiting.
        </h2>

        <p className="mx-auto mt-4 max-w-md text-base text-[var(--landing-ink-muted)] sm:text-lg">
          Free, in your browser. Your city is saved on this device.
        </p>

        <div className="mt-8 flex justify-center">
          <Link
            href="/play"
            className="btn btn-gold px-10 py-4 text-xl shadow-lg transition-transform duration-150 hover:scale-105"
          >
            Play now
          </Link>
        </div>
      </div>
    </section>
  );
}
