'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import T from './prefs/T';
import { useTr } from './prefs/store';
import { isLite } from './closing/tier';
import './closing.css';

/**
 * The roadmap as a road through the realm. A pixel road draws itself as you scroll and a little caravan
 * travels along it; each milestone sign flips up when the caravan reaches it. Honest statuses only.
 */
const REPO = 'https://github.com/theodhorex/metropolix';

const STEPS = [
  {
    key: 'done', state: 'done',
    chip: {
      en: 'Written and tested',
      id: 'Sudah ditulis dan diuji',
      ko: '작성 및 테스트 완료',
      zh: '已完成编写与测试',
    },
    title: {
      en: 'A NEAR smart contract in Rust',
      id: 'Smart contract NEAR dalam Rust',
      ko: 'Rust로 작성된 NEAR 스마트 컨트랙트',
      zh: '基于 Rust 的 NEAR 智能合约',
    },
    text: {
      en: 'It will hold your city, its ChainPower and your battle results.',
      id: 'Nanti menyimpan kotamu, ChainPower-nya, dan hasil pertempuranmu.',
      ko: '앞으로 당신의 도시와 ChainPower, 전투 결과를 담게 됩니다.',
      zh: '它将记录你的城市、ChainPower 以及战斗战果。',
    },
    link: {
      href: `${REPO}/tree/HEAD/contracts/metropolix`,
      label: {
        en: 'Read the contract on GitHub',
        id: 'Baca kontraknya di GitHub',
        ko: 'GitHub에서 컨트랙트 보기',
        zh: '在 GitHub 上查看合约代码',
      },
    },
  },
  {
    key: 'next', state: 'next',
    chip: {
      en: 'Next',
      id: 'Berikutnya',
      ko: '다음 단계',
      zh: '下一步',
    },
    title: {
      en: 'Deploy to NEAR testnet',
      id: 'Pasang di NEAR testnet',
      ko: 'NEAR testnet 배포',
      zh: '部署至 NEAR testnet',
    },
    text: {
      en: 'Then sign in with a NEAR wallet and keep your city on the network instead of this device.',
      id: 'Lalu masuk dengan dompet NEAR dan simpan kotamu di jaringan, bukan lagi di perangkat ini.',
      ko: '이후 NEAR 지갑으로 로그인하여 로컬 기기 대신 네트워크에 도시를 저장합니다.',
      zh: '届时可使用 NEAR 钱包登录，将城市保存在网络上而非局限于当前设备。',
    },
    link: null,
  },
  {
    key: 'plan', state: 'plan',
    chip: {
      en: 'Planned',
      id: 'Direncanakan',
      ko: '예정',
      zh: '计划中',
    },
    title: {
      en: 'A city coin backed by its treasury',
      id: 'Koin kota yang didukung kasnya',
      ko: '국고 기반의 도시 코인',
      zh: '以城市国库为储备的代币',
    },
    text: {
      en: "The coin's value follows the gold in the city's vault, so a successful raid on a city lowers what its coin is backed by.",
      id: 'Nilai koin mengikuti emas di kas kota, jadi serbuan yang berhasil ke sebuah kota menurunkan jaminan koinnya.',
      ko: '코인의 가치는 도시 금고의 골드에 연동되므로, 약탈당하면 코인의 담보 가치도 함께 하락합니다.',
      zh: '代币价值与城市金库中的金币挂钩，因此城市被成功突袭后，其代币背后的储备也会随之减少。',
    },
    link: null,
  },
];

// Desktop road: winds left to right; the three stops sit at 1/6, 1/2 and 5/6 so the signs below line up with them.
const WIDE = {
  vb: '0 0 1200 300',
  d: 'M -20 220 C 80 220 120 120 200 120 S 340 220 400 215 S 520 110 600 110 S 740 220 800 215 S 920 120 1000 120 S 1140 205 1220 205',
  stops: [[200, 120], [600, 110], [1000, 120]],
};

function Road({ cls, vb, d }: { cls: string; vb: string; d: string }) {
  return (
    <svg className={`road-svg ${cls}`} viewBox={vb} aria-hidden="true" shapeRendering="crispEdges">
      <path className="road-bed" d={d} />
      <path className="road-line" d={d} />
      <g className="road-cart">
        {/* our own pixel caravan: horse in front, covered cart behind (drawn facing right) */}
        <g transform="translate(-26 -22)">
          <rect x="0" y="6" width="22" height="10" fill="#efe4c9" /><rect x="2" y="2" width="18" height="4" fill="#efe4c9" />
          <rect x="0" y="6" width="22" height="2" fill="#d8c9a3" /><rect x="1" y="16" width="20" height="3" fill="#7a4a24" />
          <rect x="3" y="18" width="5" height="5" fill="#3a2a1c" /><rect x="14" y="18" width="5" height="5" fill="#3a2a1c" />
          <rect x="4" y="19" width="3" height="3" fill="#c9a26a" /><rect x="15" y="19" width="3" height="3" fill="#c9a26a" />
          <rect x="22" y="14" width="6" height="2" fill="#7a4a24" />
          <rect x="28" y="8" width="12" height="8" fill="#8a5a34" /><rect x="38" y="4" width="5" height="6" fill="#8a5a34" />
          <rect x="41" y="5" width="2" height="2" fill="#12151d" /><rect x="36" y="3" width="2" height="5" fill="#3a2a1c" />
          <rect x="29" y="16" width="2" height="6" fill="#5a3a20" /><rect x="37" y="16" width="2" height="6" fill="#5a3a20" />
          <rect x="26" y="8" width="2" height="5" fill="#3a2a1c" />
          <rect x="9" y="0" width="2" height="3" fill="#e5594a" /><rect x="11" y="0" width="4" height="2" fill="#e5594a" />
        </g>
      </g>
    </svg>
  );
}

export default function OnChain() {
  const tr = useTr();
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    gsap.registerPlugin(ScrollTrigger);
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const wide = window.matchMedia('(min-width: 900px)').matches;
    const signs = Array.from(el.querySelectorAll<HTMLElement>('.road-sign'));
    const stage = el.querySelector<HTMLElement>('.road-stage');
    if (!stage) return;
    const showAll = () => signs.forEach((s) => s.setAttribute('data-up', ''));

    if (!wide) {
      // phone: a straight road down the left, the caravan is a DOM sprite that slides along it
      const fill = stage.querySelector<HTMLElement>('.road-vert-fill');
      const cart = stage.querySelector<HTMLElement>('.road-vert-cart');
      if (still || isLite() || !fill || !cart) { showAll(); if (fill) fill.style.transform = 'scaleY(1)'; return; }
      const marks = signs.map((s) => s.offsetTop / Math.max(1, stage.offsetHeight));
      const st = ScrollTrigger.create({
        trigger: stage, start: 'top 75%', end: 'bottom 80%', scrub: 0.6,
        onUpdate: (self) => {
          const p = self.progress;
          fill.style.transform = `scaleY(${p})`;
          cart.style.transform = `translateY(${p * (stage.offsetHeight - 28)}px)`;
          signs.forEach((s, k) => s.toggleAttribute('data-up', p >= (marks[k] ?? 1) - 0.02));
        },
      });
      return () => st.kill();
    }

    const svg = el.querySelector<SVGSVGElement>('.road-wide');
    const path = svg?.querySelector<SVGPathElement>('.road-line');
    const cart = svg?.querySelector<SVGGElement>('.road-cart');
    if (!svg || !path || !cart) return;

    const len = path.getTotalLength();
    // sample the path once; the caravan reads from this table instead of measuring every frame
    const N = 240;
    const pts = Array.from({ length: N + 1 }, (_, i) => path.getPointAtLength((len * i) / N));
    const at = WIDE.stops.map(([sx, sy]) => {
      let best = 0, bd = Infinity;
      pts.forEach((p, i) => { const d = (p.x - sx!) ** 2 + (p.y - sy!) ** 2; if (d < bd) { bd = d; best = i; } });
      return best / N;
    });
    const place = (p: number) => {
      const i = Math.min(N - 1, Math.max(0, Math.floor(p * N)));
      const a = pts[i]!, b = pts[i + 1]!;
      const angle = Math.atan2(b.y - a.y, b.x - a.x) * (180 / Math.PI) * 0.4;
      cart.setAttribute('transform', `translate(${a.x.toFixed(1)} ${a.y.toFixed(1)}) rotate(${angle.toFixed(1)})`);
      signs.forEach((s, k) => s.toggleAttribute('data-up', p >= (at[k] ?? 1) - 0.01));
    };

    if (still || isLite()) {
      path.style.strokeDasharray = 'none';
      place(at[0] ?? 0);
      showAll();
      return;
    }

    path.style.strokeDasharray = `${len}`;
    path.style.strokeDashoffset = `${len}`;
    place(0);
    const st = ScrollTrigger.create({
      trigger: stage,
      // the caravan reaches the last sign while the whole road (and its heading) is still on screen
      start: 'top 80%',
      end: 'bottom 85%',
      scrub: 0.8,
      onUpdate: (self) => {
        path.style.strokeDashoffset = `${len * (1 - self.progress)}`;
        place(self.progress);
      },
    });
    return () => st.kill();
  }, []);

  return (
    <section ref={root} id="chain" aria-labelledby="chain-h" className="l-section road-section relative px-4 py-20">
      <div className="pixel-divider -mx-4 -mt-20 mb-16" aria-hidden="true" />
      <div className="mx-auto max-w-6xl">
        <div className="text-center" data-reveal>
          <div className="mb-3"><span className="landing-pill"><T en="Roadmap" id="Peta jalan" ko="로드맵" zh="路线图" /></span></div>
          <h2 id="chain-h" data-reveal-words className="landing-h2"><T split en="Headed for NEAR" id="Menuju NEAR" ko="NEAR를 향한 여정" zh="迈向 NEAR" /></h2>
          <p className="road-lead mx-auto mt-4 max-w-prose text-base sm:text-lg">
            <T
              en="Until then, the whole game runs in your browser and your city is saved on this device."
              id="Sampai saat itu, seluruh game berjalan di browsermu dan kotamu disimpan di perangkat ini."
              ko="그전까지는 게임 전체가 브라우저에서 실행되며 도시는 이 기기에 저장됩니다."
              zh="在此之前，整款游戏都在你的浏览器中运行，城市数据也保存在当前设备上。"
            />
          </p>
        </div>

        <div className="road-stage">
          <Road cls="road-wide" vb={WIDE.vb} d={WIDE.d} />
          <div className="road-vert" aria-hidden="true">
            <span className="road-vert-fill" />
            <span className="road-vert-cart" />
          </div>
          <ol className="road-signs">
            {STEPS.map((s, i) => (
              <li key={s.key} className="road-sign" data-state={s.state} style={{ ['--i' as string]: i }}>
                <span className="road-post" aria-hidden="true" />
                <div className="road-board">
                  <span className="road-chip font-display"><T {...s.chip} /></span>
                  <h3 className="font-serif-display road-title"><T {...s.title} /></h3>
                  <p className="road-text"><T {...s.text} /></p>
                  {s.link && (
                    <a href={s.link.href} target="_blank" rel="noopener noreferrer" className="road-link"
                      aria-label={tr(
                        `${s.link.label.en} (opens in a new tab)`,
                        `${s.link.label.id} (membuka tab baru)`,
                        `${s.link.label.ko} (새 탭에서 열림)`,
                        `${s.link.label.zh} (在新标签页中打开)`
                      )}>
                      <T {...s.link.label} />
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
