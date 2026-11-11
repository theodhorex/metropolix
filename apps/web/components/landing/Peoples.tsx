import { ARCS } from '@metropolix/sim';
import ArcPortrait from '../ArcPortrait';

// the two last cards widen on tablet-landscape (3 + 2 rows) and all five sit in one row on wide screens
const SPAN = [
  'lg:col-span-2 xl:col-span-1',
  'lg:col-span-2 xl:col-span-1',
  'lg:col-span-2 xl:col-span-1',
  'lg:col-span-3 xl:col-span-1',
  'sm:col-span-2 lg:col-span-3 xl:col-span-1',
];

export default function Peoples() {
  return (
    <section id="peoples" aria-labelledby="peoples-h" className="l-section px-4 py-16">
      <div className="pixel-divider -mx-4 -mt-16 mb-16" aria-hidden="true" />
      <div className="mx-auto max-w-6xl">
        <h2 id="peoples-h" className="font-display text-3xl font-bold sm:text-4xl">Five peoples. One choice, forever.</h2>
        <p className="mt-3 max-w-prose text-[var(--paper-dim)]">
          Each city belongs to one people for good. The people decides its land, its army and how it trades, so pick the one you want to rule.
        </p>

        <ul className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-6 xl:grid-cols-5">
          {ARCS.map((a, i) => (
            <li key={a.id} className={SPAN[i]}>
              <article className="people-card flex h-full flex-col overflow-hidden" style={{ '--card': a.accent } as React.CSSProperties}>
                <div className="mt-1 aspect-[5/4] w-full overflow-hidden border-b-2 border-[var(--ink)]">
                  <ArcPortrait arc={a.id} className="h-full w-full" />
                </div>
                <div className="flex flex-1 flex-col gap-3 p-4">
                  <div>
                    <h3 className="font-display text-2xl font-bold" style={{ color: a.accent }}>{a.name}</h3>
                    <p className="mt-1 text-sm text-[var(--paper-dim)]">{a.tagline}</p>
                  </div>
                  <dl className="text-sm">
                    <dt className="font-bold text-[var(--paper-dim)]">Soldiers</dt>
                    <dd>{a.troop}s</dd>
                    <dt className="mt-2 font-bold text-[var(--paper-dim)]">Signature move</dt>
                    <dd>{a.unique}</dd>
                  </dl>
                  <div>
                    <h4 className="text-sm font-bold text-[var(--paper-dim)]">Strengths</h4>
                    <ul className="mt-1 space-y-1 text-sm">
                      {a.strengths.slice(0, 3).map((s) => (
                        <li key={s} className="flex gap-2"><span aria-hidden="true" className="text-[var(--good)]">+</span><span>{s}</span></li>
                      ))}
                    </ul>
                  </div>
                  <div className="mt-auto">
                    <h4 className="text-sm font-bold text-[var(--paper-dim)]">Weak spot</h4>
                    <p className="mt-1 flex gap-2 text-sm"><span aria-hidden="true" className="text-[var(--bad)]">&minus;</span><span>{a.weaknesses[0]}</span></p>
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
