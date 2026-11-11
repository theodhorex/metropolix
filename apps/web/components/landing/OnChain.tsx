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
    chip: ['Written and tested', 'Sudah ditulis dan diuji'],
    title: ['A NEAR smart contract in Rust', 'Smart contract NEAR dalam Rust'],
    text: ['It will hold your city, its ChainPower and your battle results.', 'Nanti menyimpan kotamu, ChainPower-nya, dan hasil pertempuranmu.'],
    link: { href: `${REPO}/tree/HEAD/contracts/metropolix`, label: ['Read the contract on GitHub', 'Baca kontraknya di GitHub'] },
  },
  {
    key: 'next', state: 'next',
    chip: ['Next', 'Berikutnya'],
    title: ['Deploy to NEAR testnet', 'Pasang di NEAR testnet'],
    text: ['Then sign in with a NEAR wallet and keep your city on the network instead of this device.', 'Lalu masuk dengan dompet NEAR dan simpan kotamu di jaringan, bukan lagi di perangkat ini.'],
    link: null,
  },
  {
    key: 'plan', state: 'plan',
    chip: ['Planned', 'Direncanakan'],
    title: ['A city coin backed by its treasury', 'Koin kota yang dijamin kasnya'],
    text: ["The coin's value follows the gold in the city's vault, so a successful raid on a city lowers what its coin is backed by.", 'Nilai koin mengikuti emas di kas kota, jadi serbuan yang berhasil ke sebuah kota menurunkan jaminan koinnya.'],
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
        trigger: stage, start: 'top 70%', end: 'bottom 60%', scrub: 0.6,
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
      start: 'top 75%',
      end: 'bottom 55%',
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
          <div className="mb-3"><span className="landing-pill"><T en="Roadmap" id="Peta jalan" /></span></div>
          <h2 id="chain-h" data-reveal-words className="landing-h2"><T en="Headed for NEAR" id="Menuju NEAR" /></h2>
          <p className="road-lead mx-auto mt-4 max-w-prose text-base sm:text-lg">
            <T en="Until then, the whole game runs in your browser and your city is saved on this device." id="Sampai saat itu, seluruh game berjalan di browsermu dan kotamu disimpan di perangkat ini." />
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
                  <span className="road-chip font-display"><T en={s.chip[0]} id={s.chip[1]} /></span>
                  <h3 className="font-serif-display road-title"><T en={s.title[0]} id={s.title[1]} /></h3>
                  <p className="road-text"><T en={s.text[0]} id={s.text[1]} /></p>
                  {s.link && (
                    <a href={s.link.href} target="_blank" rel="noopener noreferrer" className="road-link"
                      aria-label={tr(`${s.link.label[0]} (opens in a new tab)`, `${s.link.label[1]} (membuka tab baru)`)}>
                      <T en={s.link.label[0]} id={s.link.label[1]} />
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
