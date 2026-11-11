'use client';

import { useState } from 'react';
import Image from 'next/image';
import T from './prefs/T';
import { useTr } from './prefs/store';

const STEPS = [
  {
    num: '1',
    color: '#5fc07a', // Elf accent
    arcName: {
      en: 'Elf Realm',
      id: 'Kerajaan Elf',
      ko: '엘프 왕국',
      zh: '精灵王国',
    },
    title: {
      en: 'Build',
      id: 'Bangun',
      ko: '건설',
      zh: '建设',
    },
    text: {
      en: 'Houses bring citizens, jobs bring gold. Upgrades change how a building looks and what it does.',
      id: 'Rumah mendatangkan warga, pekerjaan menghasilkan emas. Peningkatan mengubah rupa dan fungsi bangunan.',
      ko: '집은 시민을 모으고 일자리는 골드를 창출합니다. 업그레이드를 통해 건물의 외형과 기능이 달라집니다.',
      zh: '房屋迎来居民，就业带来金币。升级不仅改变建筑外观，还会解锁更强功效。',
    },
    src: '/landing/building-upgrade.png',
    w: 624,
    h: 600,
    alt: {
      en: 'The barracks window showing level 2, what level 3 would add (more troop room, higher upkeep), and a gold Upgrade button.',
      id: 'Jendela barak menampilkan level 2, manfaat level 3 (kapasitas pasukan bertambah, biaya rawat naik), dan tombol Tingkatkan warna emas.',
      ko: '레벨 2 병영 창에서 레벨 3 추가 효과(병력 수용량 증가, 유지비 상승)와 황금색 업그레이드 버튼을 보여줍니다.',
      zh: '兵营窗口展示当前为2级，以及升级至3级的增益（增加兵力容量、提高维护成本）与金色升级按钮。',
    },
  },
  {
    num: '2',
    color: '#e8a13a', // Lizard accent
    arcName: {
      en: 'Lizard Dune',
      id: 'Bukit Kadal',
      ko: '리저드 사구',
      zh: '蜥蜴沙丘',
    },
    title: {
      en: 'Balance',
      id: 'Seimbangkan',
      ko: '균형',
      zh: '平衡',
    },
    text: {
      en: 'Tax against happiness. Keep food flowing, build schools and parks, and watch the gold in your vault.',
      id: 'Atur pajak demi kebahagiaan. Pastikan pasokan makanan lancar, bangun sekolah dan taman, serta pantau emas di brankasmu.',
      ko: '세금과 행복도의 균형을 맞추세요. 식량을 공급하고 학교와 공원을 지으며 금고 속 골드를 살피세요.',
      zh: '在税收与幸福度之间谋求平衡。保障粮食供给，建造学校与公园，时刻留意金库中的金币。',
    },
    src: '/landing/economy.png',
    w: 892,
    h: 652,
    alt: {
      en: 'The economy window with a tax rate slider and a table showing net gold per second and happiness at each tax rate.',
      id: 'Jendela ekonomi dengan penggeser tarif pajak dan tabel yang menunjukkan pendapatan bersih emas per detik serta kebahagiaan di tiap tarif pajak.',
      ko: '경제 창에서 세율 슬라이더와 세율별 초당 순수 골드 수익 및 행복도를 표로 보여줍니다.',
      zh: '经济窗口包含税率滑块，以及显示各税率下每秒净金币收益和幸福度的表格。',
    },
  },
  {
    num: '3',
    color: '#e5594a', // Dragon accent
    arcName: {
      en: 'Dragon Spire',
      id: 'Menara Naga',
      ko: '드래곤 첨탑',
      zh: '龙裔尖塔',
    },
    title: {
      en: 'Raid',
      id: 'Serbu',
      ko: '약탈',
      zh: '突袭',
    },
    text: {
      en: "Train troops in the war room and raid rival mayors' treasuries. They raid you back.",
      id: 'Latih pasukan di ruang perang dan serbu kas wali kota rival. Mereka juga akan membalas serbuanmu.',
      ko: '작전실에서 군대를 훈련시키고 라이벌 시장의 보물고를 약탈하세요. 적들도 보복에 나섭니다.',
      zh: '在作战室训练部队并突袭敌对城主的国库。他们同样会实施反击。',
    },
    src: '/landing/war-room.png',
    w: 1018,
    h: 790,
    alt: {
      en: 'The war room window with heroes, archer troop types, spells, siege and a Pick a target button.',
      id: 'Jendela ruang perang berisi pahlawan, jenis pasukan pemanah, sihir, senjata kepung, dan tombol Pilih target.',
      ko: '작전실 창에서 영웅, 궁병 부대 유형, 마법, 공성 병기와 목표 선택 버튼을 보여줍니다.',
      zh: '作战室窗口展示英雄、弓箭兵种、法术、攻城兵器以及“选择目标”按钮。',
    },
  },
];

const GALLERY = [
  {
    title: {
      en: 'Market',
      id: 'Pasar',
      ko: '시장',
      zh: '集市',
    },
    text: {
      en: 'A market of simulated traders.',
      id: 'Pasar dengan pedagang simulasi.',
      ko: '시뮬레이션 상인들이 모인 시장.',
      zh: '由模拟商人组成的集市。',
    },
    src: '/landing/market.png',
    w: 1018,
    h: 790,
    alt: {
      en: 'The marketplace window listing special goods and materials with buy and sell buttons.',
      id: 'Jendela pasar yang memuat daftar barang dan material khusus dengan tombol beli dan jual.',
      ko: '특수 상품 및 자재 목록과 구매/판매 버튼이 있는 상점 창.',
      zh: '集市窗口列出了特色商品与原料，并配有购买与出售按钮。',
    },
  },
  {
    title: {
      en: 'Vault',
      id: 'Brankas',
      ko: '금고',
      zh: '金库',
    },
    text: {
      en: 'The vault of rare treasures found in your city.',
      id: 'Brankas harta langka yang ditemukan di kotamu.',
      ko: '도시에서 발견된 희귀 보물이 보관된 금고.',
      zh: '存放城市中发现的珍稀宝藏的金库。',
    },
    src: '/landing/vault.png',
    w: 892,
    h: 790,
    alt: {
      en: 'The vault window with treasures on display and a list of rare finds.',
      id: 'Jendela brankas yang memajang harta berharga beserta daftar temuan langka.',
      ko: '보물이 전시되고 희귀 발견품 목록이 표시된 금고 창.',
      zh: '展示各种珍宝及稀有发掘品列表的金库窗口。',
    },
  },
  {
    title: {
      en: 'Chronicle',
      id: 'Kronik',
      ko: '연대기',
      zh: '编年史',
    },
    text: {
      en: 'The chronicle of your reign.',
      id: 'Kronik perjalanan masa pemerintahanmu.',
      ko: '통치 여정을 기록한 연대기.',
      zh: '记录你统治历程的编年史。',
    },
    src: '/landing/chronicle.png',
    w: 892,
    h: 790,
    alt: {
      en: 'The chronicle page listing each treasure your city has dug up.',
      id: 'Halaman kronik yang mencatat setiap harta karun yang digali di kotamu.',
      ko: '도시에서 발굴한 각 보물이 기록된 연대기 페이지.',
      zh: '记录着城市挖掘出的每一件宝藏的编年史页面。',
    },
  },
  {
    title: {
      en: 'Mayor profile',
      id: 'Profil wali kota',
      ko: '시장 프로필',
      zh: '城主档案',
    },
    text: {
      en: 'Your mayor profile.',
      id: 'Profil wali kotamu.',
      ko: '당신의 시장 프로필.',
      zh: '你的城主档案。',
    },
    src: '/landing/profile.png',
    w: 764,
    h: 593,
    alt: {
      en: 'A mayor profile with portrait, level, ChainPower, gold, citizens and battle record.',
      id: 'Profil wali kota lengkap dengan potret, level, ChainPower, emas, jumlah warga, dan rekor pertempuran.',
      ko: '초상화, 레벨, ChainPower, 골드, 시민 수, 전투 기록이 담긴 시장 프로필.',
      zh: '包含头像、等级、ChainPower、金币、居民数以及战绩的城主档案。',
    },
  },
];

export default function HowItPlays() {
  const [activeStep, setActiveStep] = useState(0);
  const tr = useTr();

  return (
    <section id="how" aria-labelledby="how-h" className="l-section relative py-20">
      <div className="landing-grid-faint" aria-hidden="true" />
      <div className="pixel-divider -mt-20 mb-16" aria-hidden="true" />

      <div className="mx-auto max-w-6xl px-4">
        <div className="text-center" data-reveal>
          <div className="mb-3">
            <span className="landing-pill">
              <T en="How it plays" id="Cara Bermain" ko="플레이 방법" zh="游玩机制" />
            </span>
          </div>
          <h2 id="how-h" data-reveal-words className="landing-h2">
            <T split en="How a reign goes" id="Jalannya sebuah pemerintahan" ko="통치 여정의 흐름" zh="城邦统治之道" />
          </h2>
          <p className="mx-auto mt-4 max-w-prose text-base text-[var(--landing-ink-muted)] sm:text-lg">
            <T
              en="Ten minutes to build, balance and defend your realm against rival mayors."
              id="Sepuluh menit untuk membangun, menyeimbangkan, dan mempertahankan kerajaanmu dari wali kota rival."
              ko="라이벌 시장에 맞서 10분간 영지를 건설하고, 균형을 잡으며, 방어하세요."
              zh="用十分钟时间建设、统筹并保卫你的王国，抵御敌对城主的侵袭。"
            />
          </p>
        </div>
      </div>

      {/* Desktop 3-Panel Accordion (>= 761px) */}
      <div className="mx-auto mt-14 hidden w-full max-w-7xl px-4 min-[761px]:block" data-reveal>
        <div
          role="tablist"
          aria-label={tr('How it plays steps', 'Tahapan cara bermain', '플레이 단계', '游玩步骤')}
          className="flex h-[74vh] min-h-[580px] max-h-[820px] w-full overflow-hidden rounded-lg border border-[var(--l-line)] bg-[var(--l-surface)] shadow-[0_2px_10px_var(--l-shadow)]"
        >
          {STEPS.map((s, i) => {
            const isActive = activeStep === i;
            return (
              <div
                key={s.num}
                role="tab"
                tabIndex={0}
                aria-selected={isActive}
                aria-label={tr(
                  `Step ${s.num}: ${s.title.en}`,
                  `Langkah ${s.num}: ${s.title.id}`,
                  `${s.num}단계: ${s.title.ko}`,
                  `第${s.num}步：${s.title.zh}`
                )}
                onMouseEnter={() => setActiveStep(i)}
                onFocus={() => setActiveStep(i)}
                onClick={() => setActiveStep(i)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setActiveStep(i);
                  }
                }}
                className={`how-panel relative flex cursor-pointer flex-col overflow-hidden border-r border-[var(--l-line)] last:border-r-0 ${
                  isActive ? 'bg-[var(--l-surface)]' : 'bg-[var(--l-surface-2)] hover:bg-[color-mix(in_srgb,var(--l-surface-2)_80%,var(--l-ink)_4%)]'
                }`}
                style={{
                  flexGrow: isActive ? 1 : 0,
                  flexShrink: 0,
                  flexBasis: 'clamp(96px, 11vw, 170px)',
                }}
              >
                {/* Giant Numeral clipped in collapsed strip */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3 top-2 select-none font-display font-bold leading-none"
                  style={{
                    color: s.color,
                    fontSize: 'clamp(170px, 36vh, 380px)',
                    opacity: isActive ? 0.12 : 0.38,
                    transform: 'translateY(-10%)',
                    transition: 'opacity 0.6s ease',
                  }}
                >
                  {s.num}
                </div>

                {/* Collapsed strip vertical title */}
                {!isActive && (
                  <div
                    aria-hidden="true"
                    className="absolute bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap font-display text-sm font-bold tracking-wider text-[var(--landing-ink)]"
                    style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                  >
                    <span style={{ color: s.color }} className="mr-2">0{s.num}.</span>
                    <T {...s.title} />
                  </div>
                )}

                {/* Active Panel Content */}
                <div
                  className={`relative z-10 flex h-full flex-col p-8 transition-all duration-700 ${
                    isActive
                      ? 'opacity-100 blur-0'
                      : 'pointer-events-none opacity-0 blur-sm'
                  }`}
                >
                  <div className="max-w-xl">
                    <div className="flex items-center gap-3">
                      <span
                        className="font-display text-base font-bold"
                        style={{ color: s.color }}
                      >
                        <T en={`Step ${s.num}`} id={`Langkah ${s.num}`} ko={`${s.num}단계`} zh={`第${s.num}步`} />
                      </span>
                      <span className="h-1 w-1 rounded-full bg-[var(--landing-ink-faint)]" />
                      <span className="text-xs font-semibold text-[var(--landing-ink-muted)]">
                        <T {...s.arcName} />
                      </span>
                    </div>

                    <h3 className="mt-2 font-serif-display text-3xl font-normal tracking-tight text-[var(--landing-ink)] sm:text-4xl">
                      <T {...s.title} />
                    </h3>
                    <p className="mt-3 text-base leading-relaxed text-[var(--landing-ink-muted)]">
                      <T {...s.text} />
                    </p>
                  </div>

                  {/* Screenshot in soft frame */}
                  <div className="mt-6 flex flex-1 items-center justify-center overflow-hidden">
                    <figure className="shot-light max-h-[460px] w-full max-w-2xl">
                      <Image
                        src={s.src}
                        alt={tr(s.alt.en, s.alt.id, s.alt.ko, s.alt.zh)}
                        width={s.w}
                        height={s.h}
                        className="max-h-[460px] w-full object-contain"
                        priority={i === 0}
                      />
                    </figure>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile Stacked List (<= 760px) */}
      <div className="mx-auto mt-10 max-w-xl px-4 min-[761px]:hidden">
        <ol className="space-y-12">
          {STEPS.map((s) => (
            <li
              key={s.num}
              className="flex flex-col gap-4 rounded-lg border border-[var(--l-line)] bg-[var(--l-surface)] p-6 shadow-[0_2px_10px_var(--l-shadow)]"
            >
              <div className="flex items-center gap-3">
                <span
                  className="font-display text-3xl font-bold"
                  style={{ color: s.color }}
                >
                  {s.num}.
                </span>
                <h3 className="font-serif-display text-2xl font-normal text-[var(--landing-ink)]">
                  <T {...s.title} />
                </h3>
              </div>
              <p className="text-sm leading-relaxed text-[var(--landing-ink-muted)]">
                <T {...s.text} />
              </p>
              <figure className="shot-light mt-2">
                <Image
                  src={s.src}
                  alt={tr(s.alt.en, s.alt.id, s.alt.ko, s.alt.zh)}
                  width={s.w}
                  height={s.h}
                  sizes="100vw"
                  loading="lazy"
                />
              </figure>
            </li>
          ))}
        </ol>
      </div>

      {/* Small Gallery Strip Below (restyled light) */}
      <div className="mx-auto mt-24 max-w-6xl px-4">
        <div className="mb-8 text-center" data-reveal>
          <span className="landing-pill mb-2">
            <T en="City Life" id="Kehidupan Kota" ko="도시의 일상" zh="城市百态" />
          </span>
          <h3 className="font-serif-display text-2xl font-normal tracking-tight text-[var(--landing-ink)] sm:text-3xl">
            <T en="And the rest of the realm" id="Dan Seluruh Sudut Kerajaan" ko="그리고 왕국의 다양한 모습들" zh="王国万象尽收眼底" />
          </h3>
          <p className="mt-2 text-sm text-[var(--landing-ink-muted)]">
            <T
              en="Every feature drawn in crisp pixel art with real simulation numbers."
              id="Setiap fitur digambar dalam seni piksel tajam dengan angka simulasi nyata."
              ko="모든 기능이 선명한 픽셀 아트로 그려지며 실제 시뮬레이션 수치로 작동합니다."
              zh="每一项特色均以精美像素风呈现，并依托真实的模拟数据运转。"
            />
          </p>
        </div>

        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4" data-reveal>
          {GALLERY.map((g) => (
            <li
              key={g.title.en}
              className="group flex flex-col overflow-hidden rounded-md border border-[var(--l-line)] bg-[var(--l-surface)] p-3 shadow-[0_2px_10px_var(--l-shadow)] transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_24px_var(--l-shadow)]"
            >
              <figure className="flex flex-1 flex-col">
                <div className="shot-light overflow-hidden bg-[var(--l-surface-2)]">
                  <Image
                    src={g.src}
                    alt={tr(g.alt.en, g.alt.id, g.alt.ko, g.alt.zh)}
                    width={g.w}
                    height={g.h}
                    sizes="(min-width: 1024px) 270px, (min-width: 640px) 45vw, 100vw"
                    loading="lazy"
                    className="transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                </div>
                <figcaption className="mt-3.5 text-xs text-[var(--landing-ink-muted)]">
                  <b className="font-display text-sm font-bold text-[var(--landing-ink)]">
                    <T {...g.title} />.
                  </b>{' '}
                  <T {...g.text} />
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
