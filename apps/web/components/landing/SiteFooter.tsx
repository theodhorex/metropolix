'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import T from './prefs/T';
import { useTr } from './prefs/store';
import Horizon from './closing/Horizon';
import './closing.css';

gsap.registerPlugin(ScrollTrigger);

const GITHUB = 'https://github.com/theodhorex/metropolix';

function FooterCrest() {
  return (
    <div className="relative flex h-10 w-10 items-center justify-center">
      <svg
        aria-hidden="true"
        viewBox="0 0 32 32"
        className="h-9 w-9 shrink-0"
        shapeRendering="crispEdges"
        style={{ imageRendering: 'pixelated' }}
      >
        {/* Pixel ring drawn around the crest */}
        <rect
          className="crest-ring"
          x="1.5"
          y="1.5"
          width="29"
          height="29"
          fill="none"
          stroke="#5fc07a"
          strokeWidth="1.5"
          strokeDasharray="116"
          strokeDashoffset="116"
        />

        {/* Castle blocks: 16x16 scaled into 32x32 (each pixel = 2x2) */}
        {/* Gold crenellations / towers */}
        <rect className="crest-block" x="6" y="6" width="6" height="8" fill="#f2c14e" />
        <rect className="crest-block" x="14" y="6" width="4" height="8" fill="#f2c14e" />
        <rect className="crest-block" x="20" y="6" width="6" height="8" fill="#f2c14e" />

        {/* Gold main body */}
        <rect className="crest-block" x="6" y="14" width="20" height="12" fill="#f2c14e" />

        {/* White highlights */}
        <rect className="crest-block" x="6" y="6" width="4" height="2" fill="#ffffff" />
        <rect className="crest-block" x="14" y="6" width="2" height="2" fill="#ffffff" />
        <rect className="crest-block" x="20" y="6" width="4" height="2" fill="#ffffff" />
        <rect className="crest-block" x="8" y="16" width="2" height="6" fill="#ffffff" />

        {/* Ink gate & outlines */}
        <rect className="crest-block" x="13" y="19" width="6" height="7" fill="#12151d" />
        <rect className="crest-block" x="14" y="17" width="4" height="2" fill="#12151d" />
        <rect className="crest-block" x="4" y="14" width="2" height="12" fill="#12151d" />
        <rect className="crest-block" x="26" y="14" width="2" height="12" fill="#12151d" />
        <rect className="crest-block" x="6" y="26" width="20" height="2" fill="#12151d" />
        <rect className="crest-block" x="12" y="6" width="2" height="8" fill="#12151d" />
        <rect className="crest-block" x="18" y="6" width="2" height="8" fill="#12151d" />
      </svg>
    </div>
  );
}

export default function SiteFooter() {
  const footerRef = useRef<HTMLElement>(null);
  const tr = useTr();
  const replay = useRef<() => void>(() => {});

  useEffect(() => {
    const footer = footerRef.current;
    if (!footer) return;

    const mm = gsap.matchMedia();

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const blocks = footer.querySelectorAll('.crest-block');
      const ring = footer.querySelector('.crest-ring');

      const tl = gsap.timeline({
        paused: false,
        scrollTrigger: {
          trigger: footer,
          start: 'top 92%',
          once: true,
        },
      });

      // Pixel blocks drop in, bounce and assemble into crest
      tl.fromTo(
        blocks,
        { y: -20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.03,
          duration: 0.6,
          ease: 'bounce.out',
        }
      );

      // Pixel ring draws around it
      if (ring) {
        tl.to(
          ring,
          {
            strokeDashoffset: 0,
            duration: 0.8,
            ease: 'power2.inOut',
          },
          '-=0.2'
        );
      }

      replay.current = () => tl.restart();
    });

    mm.add('(prefers-reduced-motion: reduce)', () => {
      const blocks = footer.querySelectorAll('.crest-block');
      const ring = footer.querySelector('.crest-ring');
      gsap.set(blocks, { y: 0, opacity: 1 });
      if (ring) gsap.set(ring, { strokeDashoffset: 0 });
    });

    return () => {
      mm.revert();
    };
  }, []);

  return (
    <footer
      ref={footerRef}
      className="site-footer relative px-4 pt-12 pb-0"
    >
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-3">
          {/* Left: Animated Crest + Brand */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="crest-btn"
              onClick={() => replay.current()}
              aria-label={tr(
                'Rebuild the crest',
                'Bangun ulang lambang',
                '문장 다시 조립하기',
                '重组纹章'
              )}
            >
              <FooterCrest />
            </button>
            <div>
              <span className="font-serif-display text-xl font-medium tracking-tight">
                Metropolix
              </span>
              <p className="footer-muted text-xs">
                <T
                  en="A pixel fantasy realm, headed for NEAR"
                  id="Negeri fantasi pixel, menuju NEAR"
                  ko="NEAR를 향한 픽셀 판타지 왕국"
                  zh="像素风奇幻国度，迈向 NEAR"
                />
              </p>
            </div>
          </div>

          {/* Middle: In-page and External Links */}
          <nav
            aria-label={tr(
              'Footer navigation',
              'Navigasi bawah',
              '하단 내비게이션',
              '页脚导航'
            )}
            className="flex justify-start md:justify-center"
          >
            <ul className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-semibold">
              <li>
                <a href="#peoples" className="footer-link">
                  <T en="Peoples" id="Bangsa" ko="종족" zh="种族" />
                </a>
              </li>
              <li>
                <a href="#how" className="footer-link">
                  <T en="How it plays" id="Cara bermain" ko="게임 방법" zh="玩法介绍" />
                </a>
              </li>
              <li>
                <a href="#chain" className="footer-link">
                  <T en="Roadmap" id="Peta jalan" ko="로드맵" zh="路线图" />
                </a>
              </li>
              <li>
                <a href="#faq" className="footer-link">
                  FAQ
                </a>
              </li>
              <li>
                <a
                  href={GITHUB}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-link"
                >
                  GitHub
                  <span className="sr-only">
                    <T
                      en=" (opens in a new tab)"
                      id=" (membuka tab baru)"
                      ko=" (새 탭에서 열림)"
                      zh="（在新标签页中打开）"
                    />
                  </span>
                </a>
              </li>
            </ul>
          </nav>

          {/* Right: GitHub Icon Link */}
          <div className="flex items-center justify-start md:justify-end">
            <a
              href={GITHUB}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={tr(
                'Metropolix GitHub repository',
                'Repositori GitHub Metropolix',
                'Metropolix GitHub 저장소',
                'Metropolix GitHub 代码仓库'
              )}
              className="footer-gh inline-flex h-9 w-9 items-center justify-center rounded-full"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  clipRule="evenodd"
                />
              </svg>
            </a>
          </div>
        </div>

        {/* Small Legal & Pixel Art attribution */}
        <div className="mt-8 flex flex-col items-center justify-between gap-3 footer-rule pt-6 sm:flex-row">
          <p className="footer-muted text-xs">
            &copy; 2026 Metropolix.
          </p>
          <p className="footer-muted text-xs">
            <T
              en="Pixel art, peoples and world drawn for Metropolix."
              id="Pixel art, bangsa, dan dunia digambar khusus untuk Metropolix."
              ko="픽셀 아트, 종족, 세계관은 Metropolix를 위해 특별히 제작되었습니다."
              zh="像素画、种族与世界观均为 Metropolix 原创绘制。"
            />
          </p>
        </div>
      </div>
      <Horizon />
    </footer>
  );
}
