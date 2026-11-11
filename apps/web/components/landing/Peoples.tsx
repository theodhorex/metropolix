import { ARCS } from '@metropolix/sim';
import ArcPortrait from '../ArcPortrait';

const SPAN = [
  'lg:col-span-2 xl:col-span-1',
  'lg:col-span-2 xl:col-span-1',
  'lg:col-span-2 xl:col-span-1',
  'lg:col-span-3 xl:col-span-1',
  'sm:col-span-2 lg:col-span-3 xl:col-span-1',
];

export default function Peoples() {
  return (
    <section id="peoples" aria-labelledby="peoples-h" className="l-section relative bg-[#fbfcfe] px-4 py-20">
      <div className="landing-grid-faint" aria-hidden="true" />
      <div className="pixel-divider -mx-4 -mt-20 mb-16" aria-hidden="true" />
      <div className="mx-auto max-w-6xl">
        <div className="text-center" data-reveal>
          <div className="mb-3">
            <span className="landing-pill">Five Peoples</span>
          </div>
          <h2 id="peoples-h" data-reveal-words className="landing-h2">
            Five peoples. One choice, forever.
          </h2>
          <p className="mx-auto mt-4 max-w-prose text-base text-[var(--landing-ink-muted)] sm:text-lg">
            Each city belongs to one people for good. The people decides its land, its army and how it trades, so pick the one you want to rule.
          </p>
        </div>

        <ul className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-6 xl:grid-cols-5" data-reveal>
          {ARCS.map((a, i) => (
            <li key={a.id} className={SPAN[i]}>
              <article
                className="people-card-light flex h-full flex-col overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
                style={{
                  borderTop: `3px solid ${a.accent}`,
                  '--card': a.accent,
                } as React.CSSProperties}
              >
                <div className="aspect-[5/4] w-full overflow-hidden border-b border-[rgba(18,21,29,0.08)] bg-[#f5f6f8]">
                  <ArcPortrait arc={a.id} className="h-full w-full object-cover" />
                </div>
                <div className="flex flex-1 flex-col gap-3 p-4">
                  <div>
                    <h3 className="font-display text-xl font-bold tracking-wide" style={{ color: a.accent }}>
                      {a.name}
                    </h3>
                    <p className="mt-1 text-xs text-[var(--landing-ink-muted)]">{a.tagline}</p>
                  </div>
                  <dl className="text-xs">
                    <dt className="font-bold text-[var(--landing-ink)]">Soldiers</dt>
                    <dd className="text-[var(--landing-ink-muted)]">{a.troop}s</dd>
                    <dt className="mt-2 font-bold text-[var(--landing-ink)]">Signature move</dt>
                    <dd className="text-[var(--landing-ink-muted)]">{a.unique}</dd>
                  </dl>
                  <div>
                    <h4 className="text-xs font-bold text-[var(--landing-ink)]">Strengths</h4>
                    <ul className="mt-1 space-y-1 text-xs">
                      {a.strengths.slice(0, 3).map((s) => (
                        <li key={s} className="flex gap-1.5 text-[var(--landing-ink-muted)]">
                          <span aria-hidden="true" className="font-bold text-[#22722b]">+</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="mt-auto border-t border-[rgba(18,21,29,0.06)] pt-2.5">
                    <h4 className="text-xs font-bold text-[var(--landing-ink)]">Weak spot</h4>
                    <p className="mt-1 flex gap-1.5 text-xs text-[var(--landing-ink-muted)]">
                      <span aria-hidden="true" className="font-bold text-[#c73e2b]">&minus;</span>
                      <span>{a.weaknesses[0]}</span>
                    </p>
                  </div>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
