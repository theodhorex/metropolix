'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import T from './prefs/T';
import { useTr } from './prefs/store';
import './closing.css';

/**
 * The roadmap as a road through the realm. A pixel road draws itself as you scroll and a little caravan
 * travels along it; each milestone sign flips up when the caravan reaches it. Honest statuses only: all three run on NEAR testnet.
 */
const REPO = 'https://github.com/theodhorex/metropolix';

const STEPS = [
  {
    key: 'contract', state: 'done',
    chip: {
      en: 'Live on testnet',
      id: 'Aktif di testnet',
      ko: 'testnet 가동 중',
      zh: '已上线 testnet',
    },
    title: {
      en: 'Your city on NEAR',
      id: 'Kotamu di NEAR',
      ko: 'NEAR 위의 당신의 도시',
      zh: '你的城市上链 NEAR',
    },
    text: {
      en: 'Connect a wallet and the Rust contract keeps your city, level and gold, saved every five minutes without a pop-up. Load it back on any device.',
      id: 'Hubungkan dompet dan kontrak Rust menyimpan kota, level, dan emasmu tiap lima menit tanpa pop-up. Muat kembali di perangkat mana pun.',
      ko: '지갑을 연결하면 Rust 컨트랙트가 도시와 레벨, 골드를 팝업 없이 5분마다 저장합니다. 어느 기기에서든 다시 불러올 수 있습니다.',
      zh: '连接钱包后，Rust 合约每五分钟自动保存你的城市、等级和金币，无须弹窗确认。在任何设备上都能读回。',
    },
    link: {
      href: 'https://testnet.nearblocks.io/address/metropolix.testnet',
      label: {
        en: 'See metropolix.testnet',
        id: 'Lihat metropolix.testnet',
        ko: 'metropolix.testnet 보기',
        zh: '查看 metropolix.testnet',
      },
    },
  },
  {
    key: 'raids', state: 'done',
    chip: {
      en: 'Live on testnet',
      id: 'Aktif di testnet',
      ko: 'testnet 가동 중',
      zh: '已上线 testnet',
    },
    title: {
      en: 'Raids between real players',
      id: 'Serbuan antar pemain sungguhan',
      ko: '실제 플레이어 간 약탈',
      zh: '真实玩家之间的突袭',
    },
    text: {
      en: 'The contract runs the battle with on-chain randomness and moves the loot out of the other mayor\'s saved treasury, then shields their city for a while.',
      id: 'Kontrak menjalankan pertempuran dengan keacakan on-chain dan memindahkan jarahan dari kas tersimpan mayor lain, lalu melindungi kotanya sementara.',
      ko: '컨트랙트가 온체인 난수로 전투를 진행하고 상대 시장의 저장된 금고에서 전리품을 옮긴 뒤, 그 도시에 잠시 보호막을 씌웁니다.',
      zh: '合约使用链上随机数进行战斗，从对方城主已保存的国库中转走战利品，随后为其城市开启一段时间的护盾。',
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
    key: 'coin', state: 'done',
    chip: {
      en: 'Live on testnet',
      id: 'Aktif di testnet',
      ko: 'testnet 가동 중',
      zh: '已上线 testnet',
    },
    title: {
      en: '$METRO and treasure NFTs',
      id: '$METRO dan NFT harta karun',
      ko: '$METRO와 보물 NFT',
      zh: '$METRO 与宝藏 NFT',
    },
    text: {
      en: 'A NEP-141 coin with its own pool, backed by the gold in every saved city, so raids move its price. Treasures from your vault mint as NEP-171 NFTs. Testnet tokens, no real value.',
      id: 'Koin NEP-141 dengan pool sendiri, dijamin emas di semua kota tersimpan, jadi serbuan menggerakkan harganya. Harta dari vault bisa dicetak jadi NFT NEP-171. Token testnet, tanpa nilai nyata.',
      ko: '자체 풀을 가진 NEP-141 코인으로, 저장된 모든 도시의 골드가 담보가 되어 약탈이 가격을 움직입니다. 금고의 보물은 NEP-171 NFT로 발행됩니다. 실제 가치가 없는 testnet 토큰입니다.',
      zh: '一枚拥有独立资金池的 NEP-141 代币，以所有已保存城市的金币为储备，因此突袭会影响其价格。金库中的宝藏可铸造为 NEP-171 NFT。均为测试网代币，没有真实价值。',
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
      if (still || !fill || !cart) { showAll(); if (fill) fill.style.transform = 'scaleY(1)'; return; }
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

    if (still) {
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
          <div className="mb-3"><span className="landing-pill"><T en="On chain" id="On-chain" ko="온체인" zh="链上" /></span></div>
          <h2 id="chain-h" data-reveal-words className="landing-h2"><T split en="Live on NEAR testnet" id="Aktif di NEAR testnet" ko="NEAR testnet에서 가동 중" zh="已在 NEAR testnet 上线" /></h2>
          <p className="road-lead mx-auto mt-4 max-w-prose text-base sm:text-lg">
            <T
              en="The game runs in your browser with no account. Connect a NEAR testnet wallet when you want your city on chain; it costs only free testnet NEAR."
              id="Game berjalan di browser tanpa akun. Hubungkan dompet NEAR testnet kapan pun kamu ingin kotamu on-chain; biayanya hanya NEAR testnet yang gratis."
              ko="게임은 계정 없이 브라우저에서 실행됩니다. 도시를 온체인에 올리고 싶을 때 NEAR testnet 지갑을 연결하세요. 비용은 무료 testnet NEAR뿐입니다."
              zh="游戏无需账号即可在浏览器中运行。想让城市上链时，连接 NEAR testnet 钱包即可，只需免费的 testnet NEAR。"
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
