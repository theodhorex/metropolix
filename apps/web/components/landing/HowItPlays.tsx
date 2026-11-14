'use client';

import { useState, type CSSProperties } from 'react';
import Image from 'next/image';
import { useLightbox, ZoomButton, type Shot } from './Lightbox';
import T from './prefs/T';
import { useTr } from './prefs/store';

const STEPS = [
  {
    num: '1',
    color: '#5fc07a', // Elf accent
    arcName: { en: 'Elf Realm', id: 'Kerajaan Elf', ko: '엘프 왕국', zh: '精灵王国' },
    title: { en: 'Build', id: 'Bangun', ko: '건설', zh: '建设' },
    text: {
      en: 'Sixty buildings, drawn for your people, each up to level 3. Houses bring citizens, jobs bring gold, and every upgrade shows on the map.',
      id: 'Enam puluh bangunan, digambar khusus untuk bangsamu, masing-masing sampai level 3. Rumah mendatangkan warga, pekerjaan menghasilkan emas, dan setiap peningkatan terlihat di peta.',
      ko: '종족마다 따로 그려진 60종의 건물, 각각 레벨 3까지. 집은 시민을, 일자리는 골드를 부르고, 모든 업그레이드는 지도에 그대로 보입니다.',
      zh: '六十种建筑，皆按你的种族专门绘制，每座最高3级。房屋迎来居民，就业带来金币，每次升级都会在地图上显现。',
    },
    src: '/landing/shop.jpg',
    w: 1600,
    h: 950,
    alt: {
      en: 'An elven city on the isometric map with the shop open on the Services row: school, park, library, academy, clinic, shrine and garden with their costs.',
      id: 'Kota elf di peta isometrik dengan toko terbuka di baris Layanan: sekolah, taman, perpustakaan, akademi, klinik, kuil, dan kebun beserta harganya.',
      ko: '아이소메트릭 지도 위의 엘프 도시와 서비스 탭이 열린 상점: 학교, 공원, 도서관, 아카데미, 진료소, 사당, 정원과 각 비용.',
      zh: '等距地图上的精灵城市，商店打开在服务类：学校、公园、图书馆、学院、诊所、神龛与花园及其价格。',
    },
  },
  {
    num: '2',
    color: '#e8a13a', // Lizard accent
    arcName: { en: 'Lizard Dune', id: 'Bukit Kadal', ko: '리저드 사구', zh: '蜥蜴沙丘' },
    title: { en: 'Balance', id: 'Seimbangkan', ko: '균형', zh: '平衡' },
    text: {
      en: 'Every tax rate shows its price in happiness before you choose it. Feed them, school them, and the gold keeps coming.',
      id: 'Setiap tarif pajak menunjukkan harganya dalam kebahagiaan sebelum kamu memilih. Beri makan, beri sekolah, dan emas terus mengalir.',
      ko: '모든 세율은 고르기 전에 행복도로 치를 대가를 보여 줍니다. 먹이고 가르치면 골드는 계속 들어옵니다.',
      zh: '每个税率在你选择之前就标明了它的幸福代价。让百姓吃饱、读书，金币便源源不断。',
    },
    src: '/landing/economy.png',
    w: 896,
    h: 656,
    alt: {
      en: 'The economy window: income, upkeep and net gold per second, and a table of every tax rate with its net gold and happiness.',
      id: 'Jendela ekonomi: pemasukan, biaya rawat, dan emas bersih per detik, serta tabel setiap tarif pajak dengan emas bersih dan kebahagiaannya.',
      ko: '경제 창: 수입, 유지비, 초당 순 골드, 그리고 세율별 순 골드와 행복도 표.',
      zh: '经济窗口：收入、维护费与每秒净金币，以及每档税率对应的净金币与幸福度表格。',
    },
  },
  {
    num: '3',
    color: '#e5594a', // Dragon accent
    arcName: { en: 'Dragon Spire', id: 'Menara Naga', ko: '드래곤 첨탑', zh: '龙裔尖塔' },
    title: { en: 'Raid', id: 'Serbu', ko: '약탈', zh: '突袭' },
    text: {
      en: 'Forty rival mayors keep real treasuries. Scout one, see the likely loot before you strike. Lose, and a shield buys you time.',
      id: 'Empat puluh wali kota rival menyimpan kas sungguhan. Intai satu, lihat perkiraan jarahan sebelum menyerang. Kalah? Perisai memberimu waktu.',
      ko: '40명의 라이벌 시장이 실제 금고를 지킵니다. 정찰하고, 공격 전에 예상 약탈량을 확인하세요. 지면 방패가 시간을 벌어 줍니다.',
      zh: '四十位敌对城主守着真实的金库。先侦察，出手前就能看到预计战利品。战败了，护盾会为你争取时间。',
    },
    src: '/landing/war-room.png',
    w: 1024,
    h: 836,
    alt: {
      en: 'The war room attack tab: rival mayors with portraits and treasuries, a map of the target city, and the expected loot before you attack.',
      id: 'Tab serangan ruang perang: wali kota rival dengan potret dan kasnya, peta kota sasaran, dan perkiraan jarahan sebelum menyerang.',
      ko: '작전실 공격 탭: 초상화와 금고가 표시된 라이벌 시장들, 목표 도시 지도, 공격 전 예상 약탈량.',
      zh: '作战室进攻页：带头像与金库的敌对城主、目标城市地图，以及进攻前的预计战利品。',
    },
  },
];

const GALLERY = [
  {
    title: { en: 'Mayor portraits', id: 'Potret wali kota', ko: '시장 초상화', zh: '城主头像' },
    text: {
      en: '500 portraits in six tiers. Yours is drawn once, when your city is founded. Only two are Super Legendary.',
      id: '500 potret dalam enam tingkat. Milikmu diundi sekali, saat kotamu berdiri. Hanya dua yang Super Legendary.',
      ko: '6개 등급의 초상화 500장. 도시를 세울 때 단 한 번 뽑힙니다. 슈퍼 레전더리는 단 두 장.',
      zh: '六个稀有度共500幅头像。建城时只抽一次。超级传说仅有两幅。',
    },
    src: '/landing/portraits.png',
    w: 1200,
    h: 357,
    alt: {
      en: 'Twenty pixel portraits of mayors from all five peoples, from Common to Super Legendary, with tier-coloured frames.',
      id: 'Dua puluh potret piksel wali kota dari kelima bangsa, dari Common sampai Super Legendary, dengan bingkai berwarna sesuai tingkat.',
      ko: '다섯 종족 시장의 픽셀 초상화 20장, 커먼부터 슈퍼 레전더리까지 등급별 테두리.',
      zh: '五个种族的二十幅城主像素头像，从普通到超级传说，边框颜色对应稀有度。',
    },
  },
  {
    title: { en: 'Your profile', id: 'Profilmu', ko: '내 프로필', zh: '你的档案' },
    text: {
      en: 'Rank, battle record, treasures on display and a city value counted in game gold.',
      id: 'Peringkat, rekor perang, harta yang dipajang, dan nilai kota dalam emas game.',
      ko: '순위, 전투 기록, 전시한 보물, 게임 골드로 매긴 도시 가치.',
      zh: '排名、战绩、陈列的宝物，以及以游戏金币计算的城市价值。',
    },
    src: '/landing/profile.png',
    w: 768,
    h: 600,
    alt: {
      en: 'A mayor profile with a Legendary portrait, level 10, ChainPower, battle record, a relic on display and the city value breakdown.',
      id: 'Profil wali kota dengan potret Legendary, level 10, ChainPower, rekor perang, relik yang dipajang, dan rincian nilai kota.',
      ko: '레전더리 초상화, 레벨 10, ChainPower, 전투 기록, 전시 유물, 도시 가치 내역이 담긴 시장 프로필.',
      zh: '城主档案：传说级头像、10级、ChainPower、战绩、陈列的遗物与城市价值明细。',
    },
  },
  {
    title: { en: 'Vault', id: 'Brankas', ko: '금고', zh: '金库' },
    text: {
      en: 'Mines and mills dig up relics, rarely. Show three for their bonus, or sell them.',
      id: 'Tambang dan penggilingan kadang menggali relik, jarang sekali. Pajang tiga untuk bonusnya, atau jual.',
      ko: '광산과 제재소에서 드물게 유물이 나옵니다. 세 개를 전시해 보너스를 받거나 팔 수 있습니다.',
      zh: '矿场与工坊偶尔挖出遗物，极为罕见。陈列三件获得加成，或将其出售。',
    },
    src: '/landing/vault.png',
    w: 896,
    h: 836,
    alt: {
      en: 'The vault: a relic on display with its bonus, and rare and epic relics that can be displayed, sold to the crown or listed on the market.',
      id: 'Brankas: relik yang dipajang beserta bonusnya, serta relik rare dan epic yang bisa dipajang, dijual ke istana, atau dipasang di pasar.',
      ko: '금고: 보너스와 함께 전시된 유물, 그리고 전시·왕실 판매·시장 등록이 가능한 레어와 에픽 유물.',
      zh: '金库：陈列中的遗物及其加成，以及可陈列、卖给王室或挂到集市的稀有与史诗遗物。',
    },
  },
  {
    title: { en: 'Market', id: 'Pasar', ko: '시장', zh: '集市' },
    text: {
      en: 'Each people makes one good the others need. No forests? Build in stone.',
      id: 'Tiap bangsa membuat satu barang yang dibutuhkan bangsa lain. Tak punya hutan? Bangun dari batu.',
      ko: '종족마다 다른 종족에게 필요한 특산품이 하나씩 있습니다. 숲이 없다면? 돌로 짓습니다.',
      zh: '每个种族都产出一种别人需要的特产。没有森林？那就用石头建造。',
    },
    src: '/landing/market.png',
    w: 1024,
    h: 836,
    alt: {
      en: 'The trading post listing the five special goods and raw materials with buy and sell prices.',
      id: 'Pos dagang yang memuat lima barang khas dan bahan mentah dengan harga beli dan jual.',
      ko: '다섯 가지 특산품과 원자재의 매매 가격이 나열된 교역소.',
      zh: '交易站列出五种特产与原材料的买卖价格。',
    },
  },
];

export default function HowItPlays() {
  const [activeStep, setActiveStep] = useState(0);
  const tr = useTr();
  const lang = (o: { en: string; id: string; ko: string; zh: string }) => tr(o.en, o.id, o.ko, o.zh);
  // the step screenshots, then the gallery, as one set the lightbox can step through
  const shots: Shot[] = [
    ...STEPS.map((s) => ({ src: s.src, w: s.w, h: s.h, alt: lang(s.alt), caption: <><b className="text-[var(--landing-ink)]">{s.num}. {lang(s.title)}.</b> {lang(s.text)}</> })),
    ...GALLERY.map((g) => ({ src: g.src, w: g.w, h: g.h, alt: lang(g.alt), caption: <><b className="text-[var(--landing-ink)]">{lang(g.title)}.</b> {lang(g.text)}</> })),
  ];
  const box = useLightbox(shots);

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
                  className={`how-num pointer-events-none absolute left-3 top-2 select-none font-display font-bold leading-none ${isActive ? 'how-num-on' : ''}`}
                  style={{ '--c': s.color, fontSize: 'clamp(170px, 36vh, 380px)' } as CSSProperties}
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
                    <figure className="how-shot shot-light max-h-[460px] max-w-full">
                      <ZoomButton onOpen={() => box.show(i)} label={lang(s.title)} className="!w-auto">
                        <Image
                          src={s.src}
                          alt={tr(s.alt.en, s.alt.id, s.alt.ko, s.alt.zh)}
                          width={s.w}
                          height={s.h}
                          className="!h-auto max-h-[460px] !w-auto max-w-full"
                          priority={i === 0}
                        />
                      </ZoomButton>
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
          {STEPS.map((s, i) => (
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
                <ZoomButton onOpen={() => box.show(i)} label={lang(s.title)}>
                  <Image
                    src={s.src}
                    alt={tr(s.alt.en, s.alt.id, s.alt.ko, s.alt.zh)}
                    width={s.w}
                    height={s.h}
                    sizes="100vw"
                    loading="lazy"
                  />
                </ZoomButton>
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

        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-3" data-reveal>
          {GALLERY.map((g, gi) => (
            <li
              key={g.title.en}
              className={`${gi === 0 ? 'sm:col-span-3 ' : ''}group flex flex-col overflow-hidden rounded-md border border-[var(--l-line)] bg-[var(--l-surface)] p-3 shadow-[0_2px_10px_var(--l-shadow)] transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_24px_var(--l-shadow)]`}
            >
              <figure className="flex flex-1 flex-col">
                <div className="shot-light overflow-hidden bg-[var(--l-surface-2)]">
                  <ZoomButton onOpen={() => box.show(STEPS.length + gi)} label={lang(g.title)}>
                    <Image
                      src={g.src}
                      alt={tr(g.alt.en, g.alt.id, g.alt.ko, g.alt.zh)}
                      width={g.w}
                      height={g.h}
                      sizes={gi === 0 ? '(min-width: 1152px) 1100px, 100vw' : '(min-width: 1152px) 360px, (min-width: 640px) 31vw, 100vw'}
                      loading="lazy"
                      className="transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                  </ZoomButton>
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
      {box.view}
    </section>
  );
}
