import { ARCS, BUILDING_KINDS, GRID, WORLD_MAYORS } from '@metropolix/sim';

const STATS = [
  { n: ARCS.length, label: 'peoples to rule' },
  { n: BUILDING_KINDS.length, label: 'kinds of building' },
  { n: WORLD_MAYORS, label: 'simulated rival mayors' },
  { n: `${GRID} × ${GRID}`, label: 'tiles on the map' },
];

export default function World() {
  return (
    <section id="world" aria-labelledby="world-h" className="l-section px-4 py-16">
      <div className="pixel-divider -mx-4 -mt-16 mb-16" aria-hidden="true" />
      <div className="mx-auto max-w-6xl">
        <h2 id="world-h" className="font-display text-3xl font-bold sm:text-4xl">The realm keeps moving</h2>
        <p className="mt-3 max-w-prose">
          {WORLD_MAYORS} simulated rival mayors grow, level up and raid each other and you, even while you plan.
          A raided city gets a shield. Loot always comes out of a real treasury.
        </p>

        <ul className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {STATS.map((s) => (
            <li key={s.label} className="panel flex flex-col gap-1 p-4">
              <span className="font-display text-4xl font-bold text-[var(--gold)]">{s.n}</span>
              <span className="text-sm text-[var(--paper-dim)]">{s.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
