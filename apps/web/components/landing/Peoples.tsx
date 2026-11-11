'use client';

import { useEffect, useRef, useState } from 'react';
import { ARCS, type ArcId } from '@metropolix/sim';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ArcPortrait from '../ArcPortrait';
import T from './prefs/T';
import { useTr } from './prefs/store';
import PeopleQuiz from './play/PeopleQuiz';
import { isLiteTier } from './fx/tier';
import './peoples.css';

gsap.registerPlugin(ScrollTrigger);

const SPAN = [
  'lg:col-span-2 xl:col-span-1',
  'lg:col-span-2 xl:col-span-1',
  'lg:col-span-2 xl:col-span-1',
  'lg:col-span-3 xl:col-span-1',
  'sm:col-span-2 lg:col-span-3 xl:col-span-1',
];

interface PeopleI18n {
  name: { en: string; id: string; ko: string; zh: string };
  tagline: { en: string; id: string; ko: string; zh: string };
  troop: { en: string; id: string; ko: string; zh: string };
  troopPlural: { en: string; id: string; ko: string; zh: string };
  good: { en: string; id: string; ko: string; zh: string };
  unique: { en: string; id: string; ko: string; zh: string };
  strengths: { en: string; id: string; ko: string; zh: string }[];
  weakness: { en: string; id: string; ko: string; zh: string };
}

const PEOPLES_I18N: Record<ArcId, PeopleI18n> = {
  elf: {
    name: { en: 'Elves', id: 'Elf', ko: '엘프', zh: '精灵' },
    tagline: {
      en: 'Forest guardians: rich woods, thin mountains.',
      id: 'Penjaga hutan: kayu berlimpah, pegunungan tandus.',
      ko: '숲의 수호자: 풍부한 숲, 부족한 산.',
      zh: '森林守卫：木材丰富，山地贫瘠。',
    },
    troop: { en: 'Archer', id: 'Pemanah', ko: '궁수', zh: '弓箭手' },
    troopPlural: { en: 'Archers', id: 'Pemanah', ko: '궁수', zh: '弓箭手' },
    good: { en: 'Moonleaf', id: 'Daun bulan', ko: '달잎', zh: '月光草' },
    unique: {
      en: 'Silver-arrow volleys from the treeline',
      id: 'Hujan panah perak dari rimbun hutan',
      ko: '숲 경계에서 쏟아지는 은화살 세례',
      zh: '林线深处射出的银箭齐射',
    },
    strengths: [
      { en: 'Abundant wood', id: 'Kayu berlimpah', ko: '풍부한 목재', zh: '木材充沛' },
      { en: 'Strong defense (+20%)', id: 'Pertahanan kuat (+20%)', ko: '강력한 방어력 (+20%)', zh: '防御强劲 (+20%)' },
    ],
    weakness: {
      en: 'Scarce ore: soldiers and stone buildings are hard to feed',
      id: 'Bijih langka: prajurit dan bangunan batu sulit dipasok',
      ko: '광석 부족: 병사와 석조 건물 유지에 어려움',
      zh: '矿石稀缺：士兵与石造建筑难以维持',
    },
  },
  lizard: {
    name: { en: 'Lizardfolk', id: 'Kaum Kadal', ko: '리저드포크', zh: '蜥蜴人' },
    tagline: {
      en: 'Swamp raiders: balanced land, cheap venom army.',
      id: 'Penyerang rawa: tanah seimbang, pasukan racun hemat.',
      ko: '늪지대 침략자: 균형 잡힌 영토, 저렴한 맹독 군대.',
      zh: '沼泽劫掠者：土地均衡，剧毒军队造价低廉。',
    },
    troop: { en: 'Skirmisher', id: 'Penyerang Cepat', ko: '척후병', zh: '散兵' },
    troopPlural: { en: 'Skirmishers', id: 'Penyerang Cepat', ko: '척후병', zh: '散兵' },
    good: { en: 'Spice', id: 'Rempah', ko: '향신료', zh: '香料' },
    unique: {
      en: 'Venom ambush strikes',
      id: 'Sergapan beracun tiba-tiba',
      ko: '치명적인 맹독 기습 공격',
      zh: '剧毒潜伏突袭',
    },
    strengths: [
      { en: 'Cheap soldiers (-10%)', id: 'Prajurit hemat (-10%)', ko: '저렴한 병사 (-10%)', zh: '征兵成本低 (-10%)' },
      { en: 'Good loot (+10%)', id: 'Rampasan bagus (+10%)', ko: '우수한 약탈품 (+10%)', zh: '掠夺战利品丰厚 (+10%)' },
    ],
    weakness: {
      en: 'Middling ore',
      id: 'Bijih sedang',
      ko: '어중간한 광석',
      zh: '中等矿石储量',
    },
  },
  caveman: {
    name: { en: 'Cavemen', id: 'Manusia Gua', ko: '원시인', zh: '穴居人' },
    tagline: {
      en: 'Stone-age brawlers: cheap army, simple tools.',
      id: 'Petarung zaman batu: pasukan hemat, perkakas sederhana.',
      ko: '석기시대 싸움꾼: 값싼 군대, 투박한 도구.',
      zh: '石器时代斗士：军队廉价，工具原始。',
    },
    troop: { en: 'Brute', id: 'Petarung Kasar', ko: '괴력 전사', zh: '蛮兵' },
    troopPlural: { en: 'Brutes', id: 'Petarung Kasar', ko: '괴력 전사', zh: '蛮兵' },
    good: { en: 'Hides', id: 'Kulit hewan', ko: '가죽', zh: '兽皮' },
    unique: {
      en: 'Thundering club charge',
      id: 'Serbuan gada yang bergemuruh',
      ko: '대지를 울리는 몽둥이 돌진',
      zh: '惊雷般的巨棒冲锋',
    },
    strengths: [
      { en: 'Very cheap soldiers (-30%)', id: 'Prajurit sangat hemat (-30%)', ko: '매우 저렴한 병사 (-30%)', zh: '极低征兵成本 (-30%)' },
      { en: 'Strong attack (+10%)', id: 'Serangan kuat (+10%)', ko: '강력한 공격력 (+10%)', zh: '攻击力强劲 (+10%)' },
    ],
    weakness: {
      en: 'Poor economy (-10%)',
      id: 'Ekonomi lemah (-10%)',
      ko: '빈약한 경제 (-10%)',
      zh: '经济薄弱 (-10%)',
    },
  },
  dragon: {
    name: { en: 'Dragonkin', id: 'Kaum Naga', ko: '드래곤족', zh: '龙裔' },
    tagline: {
      en: 'Volcanic lords: endless ore, not a single forest.',
      id: 'Penguasa gunung berapi: bijih tak terbatas, tanpa sebatang pohon.',
      ko: '화산의 군주: 무한한 광석, 숲은 전무.',
      zh: '火山领主：矿石取之不尽，毫无森林植被。',
    },
    troop: { en: 'Drake', id: 'Naga Muda', ko: '드레이크', zh: '幼龙' },
    troopPlural: { en: 'Drakes', id: 'Naga Muda', ko: '드레이크', zh: '幼龙' },
    good: { en: 'Emberstone', id: 'Batu bara api', ko: '잔불석', zh: '余烬石' },
    unique: {
      en: 'Roaring firestorm',
      id: 'Badai api yang membara',
      ko: '포효하는 화염 폭풍',
      zh: '咆哮的烈焰风暴',
    },
    strengths: [
      { en: 'Huge ore output', id: 'Hasil bijih melimpah', ko: '막대한 광석 생산량', zh: '矿石储量极丰' },
      { en: 'Devastating attack (+25%)', id: 'Serangan mematikan (+25%)', ko: '파괴적인 공격력 (+25%)', zh: '毁灭性攻击力 (+25%)' },
    ],
    weakness: {
      en: 'NO forests: wood must be bought on the market',
      id: 'TANPA hutan: kayu harus dibeli di pasar',
      ko: '산림 전무: 목재는 시장에서 구입 필수',
      zh: '全无森林：木材必须依赖市场购买',
    },
  },
  goblin: {
    name: { en: 'Goblins', id: 'Goblin', ko: '고블린', zh: '哥布林' },
    tagline: {
      en: 'Scrap scavengers: rich mines, fragile walls.',
      id: 'Pemulung rongsokan: tambang kaya, tembok rapuh.',
      ko: '고철 수집가: 풍부한 광산, 부실한 성벽.',
      zh: '拾荒者：矿产丰富，城墙脆弱。',
    },
    troop: { en: 'Grunt', id: 'Prajurit Kroco', ko: '돌격병', zh: '苦工' },
    troopPlural: { en: 'Grunts', id: 'Prajurit Kroco', ko: '돌격병', zh: '苦工' },
    good: { en: 'Gears', id: 'Roda gigi', ko: '톱니바퀴', zh: '齿轮' },
    unique: {
      en: 'Swarm of sneak-thieves',
      id: 'Gerombolan pencuri licik',
      ko: '신출귀몰한 좀도둑 떼',
      zh: '蜂拥而至的盗贼伏兵',
    },
    strengths: [
      { en: 'Best loot (+30%)', id: 'Rampasan terbaik (+30%)', ko: '최고의 약탈력 (+30%)', zh: '顶级掠夺收益 (+30%)' },
      { en: 'Rich ore', id: 'Kaya bijih', ko: '풍부한 광석', zh: '富饶矿脉' },
    ],
    weakness: {
      en: 'Fragile defense (-15%)',
      id: 'Pertahanan rapuh (-15%)',
      ko: '취약한 방어 (-15%)',
      zh: '防御脆弱 (-15%)',
    },
  },
};

export default function Peoples() {
  const tr = useTr();
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLUListElement>(null);

  const [flipped, setFlipped] = useState<Record<ArcId, boolean>>({
    elf: false,
    lizard: false,
    caveman: false,
    dragon: false,
    goblin: false,
  });
  const [highlightedArc, setHighlightedArc] = useState<ArcId | null>(null);

  const toggleFlip = (id: ArcId) => {
    setFlipped((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Callback when quiz finishes: flip and highlight that card
  const handleQuizResult = (arcId: ArcId) => {
    setHighlightedArc(arcId);
    setFlipped((prev) => ({ ...prev, [arcId]: true }));

    // Smoothly scroll the card into view if needed
    const cardEl = document.getElementById(`people-card-${arcId}`);
    if (cardEl) {
      cardEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  useEffect(() => {
    const section = sectionRef.current;
    const grid = gridRef.current;
    if (!section || !grid) return;

    // 1. Offscreen detection via IntersectionObserver to pause animations
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          section.setAttribute('data-offscreen', entry.isIntersecting ? 'false' : 'true');
        });
      },
      { threshold: 0.05 }
    );
    io.observe(section);

    // 2. Compute device capability tier once
    const finePointer = window.matchMedia('(pointer: fine)').matches;
    const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isLite = isLiteTier();

    // 3. Scroll deals the five cards like a hand: they start stacked and fanned in the middle of the
    //    grid and spread to their places as the grid scrolls up (scrubbed, so they follow the wheel);
    //    each portrait drifts inside its frame for depth.
    const ctx = gsap.context(() => {
      const cardEls = Array.from(grid.querySelectorAll<HTMLElement>('.people-card-wrapper'));
      if (isReducedMotion || cardEls.length === 0) {
        gsap.set(cardEls, { opacity: 1, clearProps: 'transform' });
        return;
      }
      const mid = (cardEls.length - 1) / 2;
      const toCentre = (el: HTMLElement) => {
        const g = grid.getBoundingClientRect(), r = el.getBoundingClientRect();
        // measured without the tween's own transform (gsap reverts it during refresh)
        return g.left + g.width / 2 - (r.left + r.width / 2);
      };
      gsap.fromTo(cardEls, {
        x: (i: number, el: HTMLElement) => toCentre(el) * 0.82,
        y: (i: number) => 150 + Math.abs(i - mid) * 26,
        rotation: (i: number) => (i - mid) * 8,
        scale: 0.84,
        opacity: 0,
        transformOrigin: '50% 100%',
      }, {
        x: 0, y: 0, rotation: 0, scale: 1, opacity: 1,
        ease: 'power2.out',
        stagger: 0.06,
        scrollTrigger: { trigger: grid, start: 'top 95%', end: 'top 38%', scrub: 0.7, invalidateOnRefresh: true },
      });
      grid.querySelectorAll<HTMLElement>('.people-portrait-frame > *').forEach((img) => {
        gsap.fromTo(img, { yPercent: -7, scale: 1.14 }, {
          yPercent: 7, scale: 1.14, ease: 'none',
          scrollTrigger: { trigger: img, start: 'top bottom', end: 'bottom top', scrub: true },
        });
      });
    }, section);

    // 4. Desktop Pointer Tilt & Moving Light Sheen (Full Tier only, non-reduced motion)
    const cleanupListeners: (() => void)[] = [];

    if (finePointer && !isLite && !isReducedMotion) {
      const cardEls = grid.querySelectorAll<HTMLElement>('.people-card-wrapper');

      cardEls.forEach((card) => {
        let isHovered = false;

        const onPointerEnter = () => {
          isHovered = true;
        };

        const onPointerMove = (e: PointerEvent) => {
          if (!isHovered) return;
          const rect = card.getBoundingClientRect();
          if (rect.width === 0 || rect.height === 0) return;

          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;

          // Normalized coordinates: -1 to 1
          const px = (x / rect.width) * 2 - 1;
          const py = (y / rect.height) * 2 - 1;

          // Max 6deg tilt towards pointer
          const tiltX = -py * 6;
          const tiltY = px * 6;
          const sheenX = (x / rect.width) * 100;
          const sheenY = (y / rect.height) * 100;

          // Direct CSS variable updates - zero React re-render per pointer move!
          card.style.setProperty('--tilt-x', `${tiltX.toFixed(2)}deg`);
          card.style.setProperty('--tilt-y', `${tiltY.toFixed(2)}deg`);
          card.style.setProperty('--sheen-x', `${sheenX.toFixed(1)}%`);
          card.style.setProperty('--sheen-y', `${sheenY.toFixed(1)}%`);
        };

        const onPointerLeave = () => {
          isHovered = false;
          // Smoothly reset tilt back to flat
          card.style.setProperty('--tilt-x', '0deg');
          card.style.setProperty('--tilt-y', '0deg');
        };

        card.addEventListener('pointerenter', onPointerEnter);
        card.addEventListener('pointermove', onPointerMove, { passive: true });
        card.addEventListener('pointerleave', onPointerLeave);

        cleanupListeners.push(() => {
          card.removeEventListener('pointerenter', onPointerEnter);
          card.removeEventListener('pointermove', onPointerMove);
          card.removeEventListener('pointerleave', onPointerLeave);
        });
      });
    }

    // 5. Document visibility listener to pause loops
    const handleVisibilityChange = () => {
      if (document.hidden) {
        section.setAttribute('data-offscreen', 'true');
      } else {
        section.setAttribute('data-offscreen', 'false');
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      io.disconnect();
      ctx.revert();
      cleanupListeners.forEach((fn) => fn());
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="peoples"
      aria-labelledby="peoples-h"
      className="peoples-section relative px-4 py-20"
      data-offscreen="false"
    >
      <div className="landing-grid-faint" aria-hidden="true" />
      <div className="pixel-divider -mx-4 -mt-20 mb-16" aria-hidden="true" />

      <div className="mx-auto max-w-6xl">
        {/* Section Heading */}
        <div className="text-center">
          <div className="mb-3">
            <span className="landing-pill">
              <T en="Five Peoples" id="Lima Bangsa" ko="5대 종족" zh="五大种族" />
            </span>
          </div>
          <h2 id="peoples-h" data-reveal-words className="landing-h2">
            <T
              split
              en="Five peoples. One choice, forever."
              id="Lima bangsa. Satu pilihan, selamanya."
              ko="다섯 종족. 영원히 이어질 단 하나의 선택."
              zh="五大种族。一朝抉择，直至永远。"
            />
          </h2>
          <p className="mx-auto mt-4 max-w-prose text-base text-[var(--l-muted)] sm:text-lg">
            <T
              en="Each city belongs to one people for good. The people decides its land, its army and how it trades, so pick the one you want to rule."
              id="Setiap kota milik satu bangsa selamanya. Bangsa menentukan tanahnya, pasukannya, dan cara berdagang, jadi pilih yang ingin kamu pimpin."
              ko="모든 도시는 영원히 한 종족의 것입니다. 종족에 따라 영토, 군대, 무역 방식이 결정되니, 다스리고 싶은 종족을 신중하게 선택하세요."
              zh="每座城市都将永久归属于一个种族。种族决定了领地风貌、军队战力与贸易特产，请选择心仪的统领族群。"
            />
          </p>
        </div>

        {/* 5 Flip Cards Grid */}
        <ul
          ref={gridRef}
          id="peoples-grid"
          className="peoples-grid mt-14 grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 xl:grid-cols-5"
          role="list"
          aria-label={tr('The five peoples of Metropolix', 'Lima bangsa di Metropolix', 'Metropolix의 다섯 종족', 'Metropolix 五大种族')}
        >
          {ARCS.map((a, i) => {
            const isFlipped = flipped[a.id];
            const isHighlighted = highlightedArc === a.id;
            const p = PEOPLES_I18N[a.id];

            // Stats relative to neutral 1000 permille (100%)
            const atkPct = Math.round(a.mods.attackPm / 10);
            const defPct = Math.round(a.mods.defensePm / 10);
            const ecoPct = Math.round(a.mods.econPm / 10);
            const lootPct = Math.round(a.mods.lootPm / 10);
            const cheapArmyPct = Math.round((2000 - a.mods.troopCostPm) / 10);

            // Bar fill % relative to 140% max scale
            const barWidth = (pct: number) => `${Math.min(100, Math.max(10, Math.round((pct / 140) * 100)))}%`;

            return (
              <li key={a.id} className={SPAN[i]}>
                <div
                  id={`people-card-${a.id}`}
                  role="button"
                  tabIndex={0}
                  aria-expanded={isFlipped}
                  aria-label={tr(
                    `${p.name.en} card: ${p.tagline.en}. Click or press Enter to ${isFlipped ? 'view portrait' : 'inspect stats'}`,
                    `Kartu ${p.name.id}: ${p.tagline.id}. Klik atau tekan Enter untuk ${isFlipped ? 'lihat potret' : 'cek statistik'}`,
                    `${p.name.ko} 카드: ${p.tagline.ko}. ${isFlipped ? '초상화를 보려면' : '스탯을 확인하려면'} 클릭하거나 Enter를 누르세요`,
                    `${p.name.zh}卡片：${p.tagline.zh}。点击或按回车${isFlipped ? '查看肖像' : '查看属性'}`
                  )}
                  data-flipped={isFlipped}
                  data-highlighted={isHighlighted}
                  onClick={() => toggleFlip(a.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleFlip(a.id);
                    }
                  }}
                  className="people-card-wrapper"
                  style={
                    {
                      '--card-accent': a.accent,
                    } as React.CSSProperties
                  }
                >
                  <div className="people-card-inner">
                    {/* FRONT FACE */}
                    <article className="people-card-front">
                      <div className="people-card-sheen" aria-hidden="true" />
                      <div className="people-accent-bar" style={{ background: a.accent }} />

                      <div className="people-portrait-frame">
                        <ArcPortrait arc={a.id} className="h-full w-full object-cover" />
                      </div>

                      <div className="people-card-body">
                        <div>
                          <h3 className="font-display text-xl font-bold tracking-wide" style={{ color: a.accent }}>
                            <T {...p.name} />
                          </h3>
                          <p className="mt-1 text-xs text-[var(--l-muted)]"><T {...p.tagline} /></p>
                        </div>

                        <dl className="text-xs">
                          <dt className="font-bold text-[var(--l-ink)]">
                            <T en="Soldiers" id="Prajurit" ko="병사" zh="士兵" />
                          </dt>
                          <dd className="text-[var(--l-muted)]">
                            <T {...p.troopPlural} />
                          </dd>
                          <dt className="mt-2 font-bold text-[var(--l-ink)]">
                            <T en="Signature move" id="Jurus andalan" ko="전매특허 기술" zh="招牌绝技" />
                          </dt>
                          <dd className="text-[var(--l-muted)]"><T {...p.unique} /></dd>
                        </dl>

                        <div>
                          <h4 className="text-xs font-bold text-[var(--l-ink)]">
                            <T en="Strengths" id="Kelebihan" ko="강점" zh="优势" />
                          </h4>
                          <ul className="mt-1 space-y-1 text-xs">
                            {p.strengths.map((s, si) => (
                              <li key={si} className="flex gap-1.5 text-[var(--l-muted)]">
                                <span aria-hidden="true" className="font-bold text-[#22722b]">
                                  +
                                </span>
                                <span><T {...s} /></span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="mt-auto pt-2">
                          <span className="people-flip-hint">
                            <span aria-hidden="true">↻</span>
                            <T en="Inspect stats" id="Cek statistik" ko="스탯 확인" zh="查看属性" />
                          </span>
                        </div>
                      </div>
                    </article>

                    {/* BACK FACE (5-AXIS STATS) */}
                    <article className="people-card-back">
                      <div className="people-card-sheen" aria-hidden="true" />
                      <div className="people-accent-bar" style={{ background: a.accent }} />

                      <div className="people-back-body">
                        <div className="flex items-center justify-between border-b border-[var(--l-line)] pb-2">
                          <div>
                            <h3 className="font-display text-lg font-bold" style={{ color: a.accent }}>
                              <T {...p.name} />
                            </h3>
                            <span className="text-[11px] font-medium text-[var(--l-muted)]">
                              <T {...p.troop} /> · <T {...p.good} />
                            </span>
                          </div>
                          <span
                            className="rounded px-1.5 py-0.5 text-[10px] font-bold text-[var(--l-ink)]"
                            style={{ background: colorMix(a.accent, 0.2) }}
                          >
                            <T en="Stats" id="Stat" ko="스탯" zh="属性" />
                          </span>
                        </div>

                        {/* 5-Axis Stat Bar */}
                        <div className="people-stat-grid" aria-label={tr('Combat & economic stats', 'Statistik perang & ekonomi', '전투 및 경제 스탯', '战斗与经济属性')}>
                          {/* Attack */}
                          <div className="people-stat-row">
                            <div className="people-stat-header">
                              <span className="people-stat-label">
                                <T en="Attack" id="Serang" ko="공격력" zh="攻击" />
                              </span>
                              <span className="people-stat-value" style={{ color: a.accent }}>
                                {atkPct}%
                              </span>
                            </div>
                            <div className="people-stat-track" title={tr(`Attack: ${atkPct}% of neutral 100%`, `Serang: ${atkPct}% dari normal 100%`, `공격력: 기본 100% 대비 ${atkPct}%`, `攻击：基准100%的${atkPct}%`)}>
                              <div className="people-stat-marker" />
                              <div className="people-stat-fill" style={{ width: barWidth(atkPct) }} />
                            </div>
                          </div>

                          {/* Defense */}
                          <div className="people-stat-row">
                            <div className="people-stat-header">
                              <span className="people-stat-label">
                                <T en="Defense" id="Bertahan" ko="방어력" zh="防御" />
                              </span>
                              <span className="people-stat-value" style={{ color: a.accent }}>
                                {defPct}%
                              </span>
                            </div>
                            <div className="people-stat-track" title={tr(`Defense: ${defPct}% of neutral 100%`, `Bertahan: ${defPct}% dari normal 100%`, `방어력: 기본 100% 대비 ${defPct}%`, `防御：基准100%的${defPct}%`)}>
                              <div className="people-stat-marker" />
                              <div className="people-stat-fill" style={{ width: barWidth(defPct) }} />
                            </div>
                          </div>

                          {/* Economy */}
                          <div className="people-stat-row">
                            <div className="people-stat-header">
                              <span className="people-stat-label">
                                <T en="Economy" id="Ekonomi" ko="경제" zh="经济" />
                              </span>
                              <span className="people-stat-value" style={{ color: a.accent }}>
                                {ecoPct}%
                              </span>
                            </div>
                            <div className="people-stat-track" title={tr(`Economy: ${ecoPct}% of neutral 100%`, `Ekonomi: ${ecoPct}% dari normal 100%`, `경제: 기본 100% 대비 ${ecoPct}%`, `经济：基准100%的${ecoPct}%`)}>
                              <div className="people-stat-marker" />
                              <div className="people-stat-fill" style={{ width: barWidth(ecoPct) }} />
                            </div>
                          </div>

                          {/* Cheap Army */}
                          <div className="people-stat-row">
                            <div className="people-stat-header">
                              <span className="people-stat-label">
                                <T en="Cheap Army" id="Hemat Pasukan" ko="군대 비용 절감" zh="军费节约" />
                              </span>
                              <span className="people-stat-value" style={{ color: a.accent }}>
                                {cheapArmyPct}%
                              </span>
                            </div>
                            <div className="people-stat-track" title={tr(`Army economy: ${cheapArmyPct}% of neutral 100%`, `Hemat pasukan: ${cheapArmyPct}% dari normal 100%`, `군대 경제: 기본 100% 대비 ${cheapArmyPct}%`, `军力性价比：基准100%的${cheapArmyPct}%`)}>
                              <div className="people-stat-marker" />
                              <div className="people-stat-fill" style={{ width: barWidth(cheapArmyPct) }} />
                            </div>
                          </div>

                          {/* Loot */}
                          <div className="people-stat-row">
                            <div className="people-stat-header">
                              <span className="people-stat-label">
                                <T en="Looting" id="Rampasan" ko="약탈" zh="掠夺" />
                              </span>
                              <span className="people-stat-value" style={{ color: a.accent }}>
                                {lootPct}%
                              </span>
                            </div>
                            <div className="people-stat-track" title={tr(`Loot power: ${lootPct}% of neutral 100%`, `Kekuatan rampasan: ${lootPct}% dari normal 100%`, `약탈 위력: 기본 100% 대비 ${lootPct}%`, `掠夺战力：基准100%的${lootPct}%`)}>
                              <div className="people-stat-marker" />
                              <div className="people-stat-fill" style={{ width: barWidth(lootPct) }} />
                            </div>
                          </div>
                        </div>

                        {/* Weakness & Unique */}
                        <dl className="border-t border-[var(--l-line)] pt-2 text-xs">
                          <dt className="font-bold text-[var(--l-ink)]">
                            <T en="Unique Move" id="Jurus Khas" ko="고유 능력" zh="特有绝技" />
                          </dt>
                          <dd className="mt-0.5 text-[11px] text-[var(--l-muted)]"><T {...p.unique} /></dd>

                          <dt className="mt-2 font-bold text-[#c73e2b]">
                            <T en="Main Weakness" id="Kelemahan Utama" ko="주요 약점" zh="主要弱点" />
                          </dt>
                          <dd className="mt-0.5 text-[11px] text-[var(--l-muted)]"><T {...p.weakness} /></dd>
                        </dl>

                        <div className="mt-auto pt-2">
                          <span className="people-flip-hint">
                            <span aria-hidden="true">↻</span>
                            <T en="View portrait" id="Lihat potret" ko="초상화 보기" zh="查看肖像" />
                          </span>
                        </div>
                      </div>
                    </article>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        {/* Personality Quiz: Which people are you? */}
        <div className="mt-20">
          <PeopleQuiz onSelectArc={handleQuizResult} />
        </div>
      </div>
    </section>
  );
}

function colorMix(hex: string, alpha: number): string {
  return `color-mix(in srgb, ${hex} ${Math.round(alpha * 100)}%, transparent)`;
}
