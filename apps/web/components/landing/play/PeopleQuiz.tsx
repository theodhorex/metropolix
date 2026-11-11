'use client';

import { useId, useState } from 'react';
import Link from 'next/link';
import { ARCS, type ArcDef, type ArcId, type ArcMods } from '@metropolix/sim';
import T from '../prefs/T';
import { useTr } from '../prefs/store';

interface QuestionChoice {
  id: string;
  textEn: string;
  textId: string;
  modsWeights: Partial<ArcMods>;
}

interface Question {
  id: string;
  titleEn: string;
  titleId: string;
  choices: QuestionChoice[];
}

const QUESTIONS: Question[] = [
  {
    id: 'q1',
    titleEn: 'A rival city insults your honor and mobilizes at the border. What is your immediate response?',
    titleId: 'Kota rival menghina kehormatanmu dan mengerahkan pasukan di perbatasan. Apa tindakan pertamamu?',
    choices: [
      {
        id: 'q1_a',
        textEn: 'Reinforce the watchtowers, tighten defenses, and rain silver arrows from the treeline.',
        textId: 'Perkuat menara pengawas, rapatkan pertahanan, dan hujani musuh dengan panah perak dari rimbun pohon.',
        modsWeights: { defensePm: 200, econPm: 100, attackPm: -50, lootPm: -100 },
      },
      {
        id: 'q1_b',
        textEn: 'Unleash a ferocious charge with overwhelming raw firepower and burn their encampments.',
        textId: 'Lepaskan serbuan dahsyat dengan daya gempur api membara dan ratakan perkemahan mereka.',
        modsWeights: { attackPm: 250, lootPm: 100, troopCostPm: 300, defensePm: 0 },
      },
      {
        id: 'q1_c',
        textEn: 'Lure them deep into the murky marshlands and strike with swift venom ambushers.',
        textId: 'Pancing mereka ke rawa berkabut lalu sergap dari bayang-bayang dengan prajurit racun.',
        modsWeights: { attackPm: 50, troopCostPm: -100, lootPm: 100, econPm: 0 },
      },
    ],
  },
  {
    id: 'q2',
    titleEn: 'Your scouts discover a mountain valley overflowing with ancient minerals and wreckage. How do you rule?',
    titleId: 'Pengintaimu menemukan lembah gunung penuh bijih purba dan bangkai mesin besi. Apa titahmu?',
    choices: [
      {
        id: 'q2_a',
        textEn: 'Strip-mine the ore at full speed to forge fearsome siege gear and devastating arms.',
        textId: 'Tambang seluruh bijih secepatnya untuk menempa senjata perang pemusnah masal.',
        modsWeights: { attackPm: 200, defensePm: 0, troopCostPm: 200, econPm: -150 },
      },
      {
        id: 'q2_b',
        textEn: 'Deploy scavenging grunts to loot every scrap and gear—waste nothing, sell the rest.',
        textId: 'Kerahkan pasukan pemulung untuk menjarah setiap baut dan roda gigi—manfaatkan semuanya.',
        modsWeights: { lootPm: 300, troopCostPm: -200, defensePm: -150, attackPm: -50 },
      },
      {
        id: 'q2_c',
        textEn: 'Tax caravans passing the valley and trade specialized crafted luxuries at maximum profit.',
        textId: 'Pajaki karavan yang melintas dan jual komoditas mewah khusus dengan untung berlipat.',
        modsWeights: { econPm: 200, defensePm: 100, lootPm: -50, attackPm: -50 },
      },
    ],
  },
  {
    id: 'q3',
    titleEn: 'The Council asks: In the unforgiving frontier, what foundation guarantees your empire survives?',
    titleId: 'Dewan Tetua bertanya: Di tanah perbatasan yang ganas, apa fondasi yang menjamin kerajaanmu abadi?',
    choices: [
      {
        id: 'q3_a',
        textEn: 'A colossal, inexpensive horde of loyal brawlers that overwhelms opponents by pure numbers.',
        textId: 'Gerombolan petarung murah berkekuatan purba yang menundukkan lawan dengan jumlah melimpah.',
        modsWeights: { troopCostPm: -300, attackPm: 100, econPm: -100, defensePm: -100 },
      },
      {
        id: 'q3_b',
        textEn: 'Impenetrable sanctuary walls, sacred forests, and a flourishing self-sufficient economy.',
        textId: 'Tembok suaka tak tertembus, hutan keramat, dan ekonomi mandiri yang makmur berkelanjutan.',
        modsWeights: { defensePm: 200, econPm: 150, lootPm: -100, troopCostPm: 0 },
      },
      {
        id: 'q3_c',
        textEn: 'Cunning raids, merciless plunder, and seizing enemies’ riches right when they sleep.',
        textId: 'Serbuan tak terduga, jarahan melimpah, dan merebut peti emas musuh saat mereka terlelap.',
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
          ? tr(
              `Quiz complete. You would rule as the ${resultArc.name}! Signature move: ${resultArc.unique}.`,
              `Kuis selesai. Kamu cocok memimpin ${resultArc.name}! Jurus andalan: ${resultArc.unique}.`
            )
          : step < totalQuestions
            ? tr(`Question ${step + 1} of ${totalQuestions}`, `Pertanyaan ${step + 1} dari ${totalQuestions}`)
            : ''}
      </div>

      {step < totalQuestions && currentQ && (
        <div>
          {/* Header & Progress Indicator */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-[var(--l-line)] pb-4">
            <div>
              <span className="landing-pill text-xs">
                <T en="Realm Quiz" id="Kuis Negeri" />
              </span>
              <h3 className="font-display mt-1 text-xl font-bold tracking-tight text-[var(--l-ink)] sm:text-2xl">
                <T en="Which people are you destined to rule?" id="Bangsa mana yang ditakdirkan untukmu?" />
              </h3>
            </div>
            <div className="text-right">
              <span className="font-pixel text-xs font-bold text-[var(--l-muted)]">
                <T en={`Question ${step + 1} / ${totalQuestions}`} id={`Pertanyaan ${step + 1} / ${totalQuestions}`} />
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
              <T en={currentQ.titleEn} id={currentQ.titleId} />
            </legend>

            {/* Answer Options Radio Group */}
            <div className="space-y-3" role="radiogroup" aria-label={tr('Answer choices', 'Pilihan jawaban')}>
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
                      <T en={choice.textEn} id={choice.textId} />
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
                <T en="← Previous" id="← Sebelumnya" />
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
                <T en="Reveal My Destiny ✨" id="Lihat Takdirku ✨" />
              ) : (
                <T en="Next Question →" id="Lanjut →" />
              )}
            </button>
          </div>
        </div>
      )}

      {/* QUIZ RESULT SCREEN */}
      {step >= totalQuestions && resultArc && (
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
              <T en="Your Destiny is Written" id="Takdirmu Telah Tertulis" />
            </span>

            <h3 className="font-display mt-3 text-3xl font-extrabold sm:text-4xl text-[var(--l-ink)]">
              <T en={`You'd rule as the ${resultArc.name}`} id={`Kamu cocok memimpin ${resultArc.name}`} />
            </h3>

            <p className="mt-2 text-sm text-[var(--l-muted)] sm:text-base">{resultArc.tagline}</p>

            <div className="my-6 rounded border border-[var(--l-line)] bg-[var(--l-surface-2)] p-4 text-left">
              <h4 className="text-xs font-bold uppercase tracking-wide text-[var(--l-ink)]">
                <T en="Why this fits your rule:" id="Mengapa cocok untukmu:" />
              </h4>
              <ul className="mt-2 space-y-1.5 text-xs text-[var(--l-muted)]">
                <li className="flex items-center gap-2">
                  <span className="font-bold text-[#22722b]">⚔</span>
                  <span>
                    <T en="Signature military doctrine: " id="Doktrin militer khas: " />
                    <strong className="text-[var(--l-ink)]">{resultArc.unique}</strong>
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="font-bold text-[#f2b630]">🪙</span>
                  <span>
                    <T en="Primary cultural trade good: " id="Komoditas budaya utama: " />
                    <strong className="text-[var(--l-ink)] capitalize">{resultArc.good}</strong>
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="font-bold text-[var(--card-accent,#7bd88f)]">★</span>
                  <span>
                    <T en="Top faction strength: " id="Kelebihan utama bangsa: " />
                    <strong className="text-[var(--l-ink)]">{resultArc.strengths[0]}</strong>
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
                <T en={`Play as the ${resultArc.name}`} id={`Bermain sebagai ${resultArc.name}`} />
              </Link>

              <button
                type="button"
                data-magnetic
                onClick={handleRestart}
                className="quiz-restart-btn rounded border border-[var(--l-line)] bg-[var(--l-surface)] px-5 py-3 font-pixel text-xs font-bold text-[var(--l-muted)] hover:text-[var(--l-ink)] hover:bg-[var(--l-surface-2)] transition-colors cursor-pointer"
              >
                <T en="↻ Retake Quiz" id="↻ Ulangi Kuis" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
