'use client';

import { useId, useState } from 'react';
import Link from 'next/link';
import { ARCS, type ArcDef, type ArcId, type ArcMods } from '@metropolix/sim';
import T from '../prefs/T';
import { useTr } from '../prefs/store';

interface QuestionChoice {
  id: string;
  text: { en: string; id: string; ko: string; zh: string };
  modsWeights: Partial<ArcMods>;
}

interface Question {
  id: string;
  title: { en: string; id: string; ko: string; zh: string };
  choices: QuestionChoice[];
}

interface ArcI18n {
  name: { en: string; id: string; ko: string; zh: string };
  tagline: { en: string; id: string; ko: string; zh: string };
  unique: { en: string; id: string; ko: string; zh: string };
  good: { en: string; id: string; ko: string; zh: string };
  strength: { en: string; id: string; ko: string; zh: string };
}

const ARC_LOCAL: Record<ArcId, ArcI18n> = {
  elf: {
    name: { en: 'Elves', id: 'Elf', ko: '엘프', zh: '精灵' },
    tagline: {
      en: 'Forest guardians: rich woods, thin mountains.',
      id: 'Penjaga hutan: kayu melimpah, pegunungan tandus.',
      ko: '숲의 수호자: 풍부한 목재, 험준한 산악.',
      zh: '森林守护者：林木丰茂，山脉贫瘠。',
    },
    unique: {
      en: 'Silver-arrow volleys from the treeline',
      id: 'Hujanan panah perak dari rimbun pohon',
      ko: '숲속에서 쏟아지는 은빛 화살 비',
      zh: '林间呼啸而至的银箭齐射',
    },
    good: { en: 'moonleaf', id: 'daun bulan', ko: '달잎', zh: '月光草' },
    strength: {
      en: 'Abundant wood',
      id: 'Kayu melimpah',
      ko: '풍부한 목재',
      zh: '木材丰富',
    },
  },
  lizard: {
    name: { en: 'Lizardfolk', id: 'Kaum Kadal', ko: '리저드포크', zh: '蜥蜴人' },
    tagline: {
      en: 'Swamp raiders: balanced land, cheap venom army.',
      id: 'Penjarah rawa: tanah seimbang, pasukan racun murah.',
      ko: '늪지의 약탈자: 균형 잡힌 영토, 값싼 맹독 부대.',
      zh: '沼泽突袭者：平衡之地，廉价剧毒军团。',
    },
    unique: {
      en: 'Venom ambush strikes',
      id: 'Sergapan racun mematikan',
      ko: '맹독 매복 기습',
      zh: '剧毒伏击',
    },
    good: { en: 'spice', id: 'rempah', ko: '향신료', zh: '香料' },
    strength: {
      en: 'Cheap soldiers (-10%)',
      id: 'Prajurit murah (-10%)',
      ko: '저렴한 병력 (-10%)',
      zh: '廉价士兵 (-10%)',
    },
  },
  caveman: {
    name: { en: 'Cavemen', id: 'Manusia Gua', ko: '원시인', zh: '穴居人' },
    tagline: {
      en: 'Stone-age brawlers: cheap army, simple tools.',
      id: 'Petarung zaman batu: pasukan murah, perkakas sederhana.',
      ko: '석기시대 투사: 값싼 군대, 소박한 도구.',
      zh: '石器时代的斗士：廉价军团，简朴工具。',
    },
    unique: {
      en: 'Thundering club charge',
      id: 'Serbuan gada menggelegar',
      ko: '우레와 같은 곤봉 돌격',
      zh: '惊雷般的重槌冲锋',
    },
    good: { en: 'hides', id: 'kulit binatang', ko: '가죽', zh: '毛皮' },
    strength: {
      en: 'Very cheap soldiers (-30%)',
      id: 'Prajurit sangat murah (-30%)',
      ko: '매우 저렴한 병력 (-30%)',
      zh: '极其廉价的士兵 (-30%)',
    },
  },
  dragon: {
    name: { en: 'Dragonkin', id: 'Kaum Naga', ko: '드래곤족', zh: '龙裔' },
    tagline: {
      en: 'Volcanic lords: endless ore, not a single forest.',
      id: 'Penguasa gunung berapi: bijih melimpah, tanpa sebatang pohon.',
      ko: '화산의 군주: 무한한 광석, 나무 한 그루 없는 땅.',
      zh: '火山领主：无尽矿石，寸木不生。',
    },
    unique: {
      en: 'Roaring firestorm',
      id: 'Badai api membara',
      ko: '포효하는 화염 폭풍',
      zh: '咆哮的烈焰风暴',
    },
    good: { en: 'emberstone', id: 'batu bara api', ko: '불씨석', zh: '余烬石' },
    strength: {
      en: 'Huge ore output',
      id: 'Produksi bijih masif',
      ko: '막대한 광석 생산',
      zh: '极其庞大的矿石产量',
    },
  },
  goblin: {
    name: { en: 'Goblins', id: 'Goblin', ko: '고블린', zh: '哥布林' },
    tagline: {
      en: 'Scrap scavengers: rich mines, fragile walls.',
      id: 'Pemulung besi bekas: tambang kaya, tembok ringkih.',
      ko: '고철 수집가: 풍족한 광산, 취약한 성벽.',
      zh: '废料拾荒者：丰饶矿藏，脆弱城墙。',
    },
    unique: {
      en: 'Swarm of sneak-thieves',
      id: 'Gerombolan pencuri licik',
      ko: '날렵한 도둑 떼',
      zh: '倾巢而出的潜行飞贼',
    },
    good: { en: 'gears', id: 'roda gigi', ko: '톱니바퀴', zh: '齿轮' },
    strength: {
      en: 'Best loot (+30%)',
      id: 'Hasil jarahan tertinggi (+30%)',
      ko: '최고의 약탈량 (+30%)',
      zh: '最高的战利品搜刮 (+30%)',
    },
  },
};

function getArcI18n(arc: ArcDef): ArcI18n {
  const local = ARC_LOCAL[arc.id];
  if (local) return local;
  return {
    name: { en: arc.name, id: arc.name, ko: arc.name, zh: arc.name },
    tagline: { en: arc.tagline, id: arc.tagline, ko: arc.tagline, zh: arc.tagline },
    unique: { en: arc.unique, id: arc.unique, ko: arc.unique, zh: arc.unique },
    good: { en: arc.good, id: arc.good, ko: arc.good, zh: arc.good },
    strength: {
      en: arc.strengths[0] ?? arc.name,
      id: arc.strengths[0] ?? arc.name,
      ko: arc.strengths[0] ?? arc.name,
      zh: arc.strengths[0] ?? arc.name,
    },
  };
}

const QUESTIONS: Question[] = [
  {
    id: 'q1',
    title: {
      en: 'A rival city insults your honor and mobilizes at the border. What is your immediate response?',
      id: 'Kota rival menghina kehormatanmu dan mengerahkan pasukan di perbatasan. Apa tindakan pertamamu?',
      ko: '라이벌 도시가 명예를 훼손하고 국경에 군대를 집결시켰습니다. 당신의 즉각적인 대응은?',
      zh: '敌对城邦挑衅了你的尊严并在边境集结军队。你的第一反应是什么？',
    },
    choices: [
      {
        id: 'q1_a',
        text: {
          en: 'Reinforce the watchtowers, tighten defenses, and rain silver arrows from the treeline.',
          id: 'Perkuat menara pengawas, rapatkan pertahanan, dan hujani musuh dengan panah perak dari rimbun pohon.',
          ko: '감시탑을 보강하고 방어를 굳혀 숲속에서 은빛 화살 비를 퍼붓는다.',
          zh: '加固瞭望塔，收紧防线，从树林深处降下银箭之雨。',
        },
        modsWeights: { defensePm: 200, econPm: 100, attackPm: -50, lootPm: -100 },
      },
      {
        id: 'q1_b',
        text: {
          en: 'Unleash a ferocious charge with overwhelming raw firepower and burn their encampments.',
          id: 'Lepaskan serbuan dahsyat dengan daya gempur api membara dan ratakan perkemahan mereka.',
          ko: '압도적인 화력으로 맹렬하게 돌격하여 적의 주둔지를 불태운다.',
          zh: '凭借狂暴的强悍火力发起猛攻，将敌方营地夷为平地。',
        },
        modsWeights: { attackPm: 250, lootPm: 100, troopCostPm: 300, defensePm: 0 },
      },
      {
        id: 'q1_c',
        text: {
          en: 'Lure them deep into the murky marshlands and strike with swift venom ambushers.',
          id: 'Pancing mereka ke rawa berkabut lalu sergap dari bayang-bayang dengan prajurit racun.',
          ko: '안개 낀 늪지대 깊숙이 유인한 뒤 재빠른 맹독 매복병으로 기습한다.',
          zh: '将他们诱入迷雾沼泽深处，用敏捷的剧毒伏兵发动突袭。',
        },
        modsWeights: { attackPm: 50, troopCostPm: -100, lootPm: 100, econPm: 0 },
      },
    ],
  },
  {
    id: 'q2',
    title: {
      en: 'Your scouts discover a mountain valley overflowing with ancient minerals and wreckage. How do you rule?',
      id: 'Pengintaimu menemukan lembah gunung penuh bijih purba dan bangkai mesin besi. Apa titahmu?',
      ko: '정찰병이 고대 광물과 잔해가 가득한 산골짜기를 발견했습니다. 당신의 판결은?',
      zh: '你的斥候发现了一处满是古代矿石与残骸的山谷。你将如何定夺？',
    },
    choices: [
      {
        id: 'q2_a',
        text: {
          en: 'Strip-mine the ore at full speed to forge fearsome siege gear and devastating arms.',
          id: 'Tambang seluruh bijih secepatnya untuk menempa senjata perang pemusnah masal.',
          ko: '광석을 전속력으로 채굴하여 위협적인 공성 병기와 파괴적인 무기를 벼려낸다.',
          zh: '全速开采矿石，铸造令人生畏的攻城器械与毁灭性兵刃。',
        },
        modsWeights: { attackPm: 200, defensePm: 0, troopCostPm: 200, econPm: -150 },
      },
      {
        id: 'q2_b',
        text: {
          en: 'Deploy scavenging grunts to loot every scrap and gear—waste nothing, sell the rest.',
          id: 'Kerahkan pasukan pemulung untuk menjarah setiap baut dan roda gigi—manfaatkan semuanya.',
          ko: '고철 부대를 파견해 부품과 톱니바퀴를 샅샅이 털고, 남는 것은 내다 판다.',
          zh: '派出拾荒小卒搜刮所有残片与齿轮——物尽其用，余者尽数出售。',
        },
        modsWeights: { lootPm: 300, troopCostPm: -200, defensePm: -150, attackPm: -50 },
      },
      {
        id: 'q2_c',
        text: {
          en: 'Tax caravans passing the valley and trade specialized crafted luxuries at maximum profit.',
          id: 'Pajaki karavan yang melintas dan jual komoditas mewah khusus dengan untung berlipat.',
          ko: '골짜기를 지나는 대상에게 세금을 매기고, 특산 명품을 거래해 최대 이윤을 남긴다.',
          zh: '向途经山谷的商队征税，并交易特色奢侈品以获取最大利润。',
        },
        modsWeights: { econPm: 200, defensePm: 100, lootPm: -50, attackPm: -50 },
      },
    ],
  },
  {
    id: 'q3',
    title: {
      en: 'The Council asks: In the unforgiving frontier, what foundation guarantees your empire survives?',
      id: 'Dewan Tetua bertanya: Di tanah perbatasan yang ganas, apa fondasi yang menjamin kerajaanmu abadi?',
      ko: '원로회가 묻습니다: 험난한 변경에서 제국의 생존을 보장하는 기초는 무엇입니까?',
      zh: '长老议会问道：在这片残酷的边疆，什么根基才能确保你的帝国长盛不衰？',
    },
    choices: [
      {
        id: 'q3_a',
        text: {
          en: 'A colossal, inexpensive horde of loyal brawlers that overwhelms opponents by pure numbers.',
          id: 'Gerombolan petarung murah berkekuatan purba yang menundukkan lawan dengan jumlah melimpah.',
          ko: '순수한 머릿수로 상대를 압도하는 거대하고 값싼 충직한 투사 군단.',
          zh: '一支规模庞大且廉价的忠诚斗士大军，以纯粹的数量压倒对手。',
        },
        modsWeights: { troopCostPm: -300, attackPm: 100, econPm: -100, defensePm: -100 },
      },
      {
        id: 'q3_b',
        text: {
          en: 'Impenetrable sanctuary walls, sacred forests, and a flourishing self-sufficient economy.',
          id: 'Tembok suaka tak tertembus, hutan keramat, dan ekonomi mandiri yang makmur berkelanjutan.',
          ko: '난공불락의 성벽, 신성한 숲, 그리고 번영하는 자립형 경제.',
          zh: '坚不可摧的避难所城墙、神圣森林以及繁荣自足的经济。',
        },
        modsWeights: { defensePm: 200, econPm: 150, lootPm: -100, troopCostPm: 0 },
      },
      {
        id: 'q3_c',
        text: {
          en: 'Cunning raids, merciless plunder, and seizing enemies’ riches right when they sleep.',
          id: 'Serbuan tak terduga, jarahan melimpah, dan merebut peti emas musuh saat mereka terlelap.',
          ko: '교활한 약탈과 무자비한 노획으로 적들이 잠든 틈에 보물을 가로채는 것.',
          zh: '巧妙的突袭、毫不留情的劫掠，在敌人熟睡之际夺取他们的财富。',
        },
        modsWeights: { lootPm: 250, troopCostPm: -150, attackPm: 0, defensePm: -50 },
      },
    ],
  },
];

/**
 * Calculates the best matching arc based on accumulated mod preferences.
 * Uses Euclidean distance to the real ARCS[i].mods.
 */
function findBestArcMatch(accumulatedMods: ArcMods): ArcDef {
  let bestArc: ArcDef = ARCS[0]!;
  let minDistance = Infinity;

  for (const arc of ARCS) {
    const dAtk = accumulatedMods.attackPm - arc.mods.attackPm;
    const dDef = accumulatedMods.defensePm - arc.mods.defensePm;
    const dEco = accumulatedMods.econPm - arc.mods.econPm;
    const dTroop = accumulatedMods.troopCostPm - arc.mods.troopCostPm;
    const dLoot = accumulatedMods.lootPm - arc.mods.lootPm;

    const distance = Math.sqrt(
      dAtk * dAtk +
      dDef * dDef +
      dEco * dEco +
      dTroop * dTroop +
      dLoot * dLoot
    );

    if (distance < minDistance) {
      minDistance = distance;
      bestArc = arc;
    }
  }

  return bestArc;
}

export default function PeopleQuiz({ onSelectArc }: { onSelectArc?: (arcId: ArcId) => void }) {
  const tr = useTr();
  const quizId = useId().replace(/:/g, '');

  const [step, setStep] = useState<number>(0); // 0, 1, 2 = questions; 3 = result
  const [selectedChoices, setSelectedChoices] = useState<Record<string, string>>({});
  const [resultArc, setResultArc] = useState<ArcDef | null>(null);

  // Check hardware tier for confetti density
  const isLite =
    typeof window !== 'undefined' &&
    (window.matchMedia('(pointer: coarse)').matches ||
      ((navigator as unknown as { hardwareConcurrency?: number }).hardwareConcurrency ?? 8) <= 4);

  const currentQ = QUESTIONS[step];
  const totalQuestions = QUESTIONS.length;
  const currentSelection = currentQ ? selectedChoices[currentQ.id] : undefined;

  const handleSelectOption = (choiceId: string) => {
    if (!currentQ) return;
    setSelectedChoices((prev) => ({ ...prev, [currentQ.id]: choiceId }));
  };

  const handleNext = () => {
    if (step < totalQuestions - 1) {
      setStep((s) => s + 1);
    } else {
      // Calculate result
      const accumulated: ArcMods = {
        attackPm: 1000,
        defensePm: 1000,
        econPm: 1000,
        troopCostPm: 1000,
        lootPm: 1000,
      };

      for (const q of QUESTIONS) {
        const choiceId = selectedChoices[q.id];
        const choice = q.choices.find((c) => c.id === choiceId);
        if (choice && choice.modsWeights) {
          if (choice.modsWeights.attackPm) accumulated.attackPm += choice.modsWeights.attackPm;
          if (choice.modsWeights.defensePm) accumulated.defensePm += choice.modsWeights.defensePm;
          if (choice.modsWeights.econPm) accumulated.econPm += choice.modsWeights.econPm;
          if (choice.modsWeights.troopCostPm) accumulated.troopCostPm += choice.modsWeights.troopCostPm;
          if (choice.modsWeights.lootPm) accumulated.lootPm += choice.modsWeights.lootPm;
        }
      }

      const match = findBestArcMatch(accumulated);
      setResultArc(match);
      setStep(totalQuestions);

      if (onSelectArc) {
        onSelectArc(match.id);
      }
    }
  };

  const handleRestart = () => {
    setSelectedChoices({});
    setResultArc(null);
    setStep(0);
  };

  // Generate pixel confetti particles for the celebration
  const confettiCount = isLite ? 12 : 24;
  const confettiParticles = Array.from({ length: confettiCount }).map((_, i) => {
    const left = (i * (100 / confettiCount) + (i % 3) * 2).toFixed(1);
    const delay = ((i * 0.12) % 1.6).toFixed(2);
    const size = i % 2 === 0 ? 6 : 8;
    const dur = (1.8 + (i % 4) * 0.3).toFixed(2);
    return { left, delay, size, dur, id: i };
  });

  return (
    <div className="people-quiz-box relative overflow-hidden rounded-sm border border-[var(--l-line)] bg-[var(--l-surface)] p-6 sm:p-10 shadow-lg">
      {/* Decorative Pixel Corner Accents */}
      <div className="quiz-pixel-corner top-0 left-0" aria-hidden="true" />
      <div className="quiz-pixel-corner top-0 right-0" aria-hidden="true" />
      <div className="quiz-pixel-corner bottom-0 left-0" aria-hidden="true" />
      <div className="quiz-pixel-corner bottom-0 right-0" aria-hidden="true" />

      {/* Screen Reader Live Announcement */}
      <div role="status" aria-live="polite" className="sr-only">
        {resultArc
          ? (() => {
              const meta = getArcI18n(resultArc);
              return tr(
                `Quiz complete. You would rule as the ${meta.name.en}! Signature move: ${meta.unique.en}.`,
                `Kuis selesai. Kamu cocok memimpin ${meta.name.id}! Jurus andalan: ${meta.unique.id}.`,
                `퀴즈 완료. 당신은 ${meta.name.ko}의 통치자가 될 운명입니다! 특수 능력: ${meta.unique.ko}.`,
                `测试完成。你注定将作为${meta.name.zh}的统治者！专属战术：${meta.unique.zh}。`
              );
            })()
          : step < totalQuestions
            ? tr(
                `Question ${step + 1} of ${totalQuestions}`,
                `Pertanyaan ${step + 1} dari ${totalQuestions}`,
                `질문 ${step + 1} / ${totalQuestions}`,
                `问题 ${step + 1} / ${totalQuestions}`
              )
            : ''}
      </div>

      {step < totalQuestions && currentQ && (
        <div>
          {/* Header & Progress Indicator */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-[var(--l-line)] pb-4">
            <div>
              <span className="landing-pill text-xs">
                <T en="Realm Quiz" id="Kuis Negeri" ko="왕국 퀴즈" zh="王国测试" />
              </span>
              <h3 className="font-display mt-1 text-xl font-bold tracking-tight text-[var(--l-ink)] sm:text-2xl">
                <T
                  en="Which people are you destined to rule?"
                  id="Bangsa mana yang ditakdirkan untukmu?"
                  ko="어느 종족을 통치할 운명일까요?"
                  zh="你注定将统治哪个种族？"
                />
              </h3>
            </div>
            <div className="text-right">
              <span className="font-pixel text-xs font-bold text-[var(--l-muted)]">
                <T
                  en={`Question ${step + 1} / ${totalQuestions}`}
                  id={`Pertanyaan ${step + 1} / ${totalQuestions}`}
                  ko={`질문 ${step + 1} / ${totalQuestions}`}
                  zh={`问题 ${step + 1} / ${totalQuestions}`}
                />
              </span>
              <div className="mt-1 h-1.5 w-28 rounded-full bg-[var(--l-surface-2)]">
                <div
                  className="h-full rounded-full bg-[#f2b630] transition-all duration-300"
                  style={{ width: `${((step + 1) / totalQuestions) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Question Text */}
          <fieldset className="my-6">
            <legend className="mb-4 text-base font-semibold text-[var(--l-ink)] sm:text-lg">
              <T {...currentQ.title} />
            </legend>

            {/* Answer Options Radio Group */}
            <div className="space-y-3" role="radiogroup" aria-label={tr('Answer choices', 'Pilihan jawaban', '답변 선택지', '选项列表')}>
              {currentQ.choices.map((choice) => {
                const isChecked = currentSelection === choice.id;
                const inputId = `${quizId}-${choice.id}`;

                return (
                  <label
                    key={choice.id}
                    htmlFor={inputId}
                    className={`quiz-choice-card flex cursor-pointer items-start gap-3 rounded border p-4 transition-all ${
                      isChecked
                        ? 'border-[#f2b630] bg-[color-mix(in_srgb,#f2b630_10%,var(--l-surface))] shadow-sm'
                        : 'border-[var(--l-line)] bg-[var(--l-surface-2)] hover:border-[var(--l-muted)]'
                    }`}
                  >
                    <input
                      type="radio"
                      id={inputId}
                      name={`quiz-${currentQ.id}`}
                      value={choice.id}
                      checked={isChecked}
                      onChange={() => handleSelectOption(choice.id)}
                      className="mt-1 h-4 w-4 shrink-0 accent-[#f2b630] cursor-pointer"
                    />
                    <span className="text-sm leading-relaxed text-[var(--l-ink)]">
                      <T {...choice.text} />
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          {/* Navigation Actions */}
          <div className="mt-8 flex items-center justify-between pt-4 border-t border-[var(--l-line)]">
            {step > 0 ? (
              <button
                type="button"
                data-magnetic
                onClick={() => setStep((s) => s - 1)}
                className="quiz-nav-btn rounded px-4 py-2 text-xs font-semibold text-[var(--l-muted)] hover:text-[var(--l-ink)] cursor-pointer"
              >
                <T en="← Previous" id="← Sebelumnya" ko="← 이전" zh="← 上一题" />
              </button>
            ) : (
              <div />
            )}

            <button
              type="button"
              data-magnetic
              disabled={!currentSelection}
              onClick={handleNext}
              className={`quiz-action-btn rounded px-6 py-2.5 text-xs font-bold tracking-wide transition-all ${
                currentSelection
                  ? 'bg-[var(--l-ink)] text-[var(--l-surface)] hover:opacity-90 cursor-pointer shadow-md'
                  : 'bg-[var(--l-surface-2)] text-[var(--l-muted)] cursor-not-allowed opacity-60'
              }`}
            >
              {step === totalQuestions - 1 ? (
                <T en="Reveal My Destiny ✨" id="Lihat Takdirku ✨" ko="내 운명 확인하기 ✨" zh="揭晓我的宿命 ✨" />
              ) : (
                <T en="Next Question →" id="Lanjut →" ko="다음 질문 →" zh="下一题 →" />
              )}
            </button>
          </div>
        </div>
      )}

      {/* QUIZ RESULT SCREEN */}
      {step >= totalQuestions && resultArc && (() => {
        const arcMeta = getArcI18n(resultArc);
        return (
          <div className="relative py-4 text-center">
            {/* Confetti celebration container */}
            <div className="quiz-confetti-container pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
              {confettiParticles.map((p) => (
                <div
                  key={p.id}
                  className="quiz-pixel-particle absolute"
                  style={{
                    left: `${p.left}%`,
                    top: '-10px',
                    width: `${p.size}px`,
                    height: `${p.size}px`,
                    backgroundColor: p.id % 3 === 0 ? resultArc.accent : p.id % 2 === 0 ? '#f6c443' : '#ffffff',
                    animationDelay: `${p.delay}s`,
                    animationDuration: `${p.dur}s`,
                  }}
                />
              ))}
            </div>

            <div className="relative z-10 mx-auto max-w-lg">
              <span
                className="inline-block rounded-full px-3 py-1 font-pixel text-xs font-bold uppercase tracking-wider"
                style={{
                  background: `color-mix(in srgb, ${resultArc.accent} 20%, transparent)`,
                  color: resultArc.accent,
                }}
              >
                <T en="Your Destiny is Written" id="Takdirmu Telah Tertulis" ko="당신의 운명이 정해졌습니다" zh="宿命已定" />
              </span>

              <h3 className="font-display mt-3 text-3xl font-extrabold sm:text-4xl text-[var(--l-ink)]">
                <T
                  en={`You'd rule as the ${arcMeta.name.en}`}
                  id={`Kamu cocok memimpin ${arcMeta.name.id}`}
                  ko={`당신은 ${arcMeta.name.ko}의 통치자가 될 운명입니다`}
                  zh={`你注定将统治${arcMeta.name.zh}`}
                />
              </h3>

              <p className="mt-2 text-sm text-[var(--l-muted)] sm:text-base">
                <T {...arcMeta.tagline} />
              </p>

              <div className="my-6 rounded border border-[var(--l-line)] bg-[var(--l-surface-2)] p-4 text-left">
                <h4 className="text-xs font-bold uppercase tracking-wide text-[var(--l-ink)]">
                  <T en="Why this fits your rule:" id="Mengapa cocok untukmu:" ko="당신의 통치에 어울리는 이유:" zh="与你的统治契合的理由：" />
                </h4>
                <ul className="mt-2 space-y-1.5 text-xs text-[var(--l-muted)]">
                  <li className="flex items-center gap-2">
                    <span className="font-bold text-[#22722b]">⚔</span>
                    <span>
                      <T en="Signature military doctrine: " id="Doktrin militer khas: " ko="고유 군사 전술: " zh="独特军事战术：" />
                      <strong className="text-[var(--l-ink)]">
                        <T {...arcMeta.unique} />
                      </strong>
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="font-bold text-[#f2b630]">🪙</span>
                    <span>
                      <T en="Primary cultural trade good: " id="Komoditas budaya utama: " ko="주요 문화 특산품: " zh="主要文化贸易商品：" />
                      <strong className="text-[var(--l-ink)] capitalize">
                        <T {...arcMeta.good} />
                      </strong>
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="font-bold text-[var(--card-accent,#7bd88f)]">★</span>
                    <span>
                      <T en="Top faction strength: " id="Kelebihan utama bangsa: " ko="종족의 최고 강점: " zh="种族核心优势：" />
                      <strong className="text-[var(--l-ink)]">
                        <T {...arcMeta.strength} />
                      </strong>
                    </span>
                  </li>
                </ul>
              </div>

              {/* Action buttons with data-magnetic */}
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/play"
                  data-magnetic
                  className="quiz-play-btn inline-flex items-center gap-2 rounded px-6 py-3 font-pixel text-sm font-bold text-black shadow-lg transition-transform hover:scale-105"
                  style={{ backgroundColor: resultArc.accent }}
                >
                  <span>⚔</span>
                  <T
                    en={`Play as the ${arcMeta.name.en}`}
                    id={`Bermain sebagai ${arcMeta.name.id}`}
                    ko={`${arcMeta.name.ko}(으)로 플레이`}
                    zh={`作为${arcMeta.name.zh}开玩`}
                  />
                </Link>

                <button
                  type="button"
                  data-magnetic
                  onClick={handleRestart}
                  className="quiz-restart-btn rounded border border-[var(--l-line)] bg-[var(--l-surface)] px-5 py-3 font-pixel text-xs font-bold text-[var(--l-muted)] hover:text-[var(--l-ink)] hover:bg-[var(--l-surface-2)] transition-colors cursor-pointer"
                >
                  <T en="↻ Retake Quiz" id="↻ Ulangi Kuis" ko="↻ 퀴즈 다시 풀기" zh="↻ 重新测试" />
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
