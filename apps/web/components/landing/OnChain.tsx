const REPO = 'https://github.com/theodhorex/metropolix';

const STEPS = [
  {
    chip: 'Written and tested', mark: '✓', tone: 'text-[var(--good)] border-[var(--good)]',
    title: 'A NEAR smart contract in Rust',
    text: 'It will hold your city, its ChainPower and battle results.',
    link: { href: `${REPO}/tree/HEAD/contracts/metropolix`, label: 'Read the contract on GitHub' },
  },
  {
    chip: 'Next', mark: '▶', tone: 'text-[var(--gold)] border-[var(--gold)]',
    title: 'Deploy to NEAR testnet',
    text: 'Then sign in with a NEAR wallet and keep your city on the network instead of this device.',
  },
  {
    chip: 'Planned', mark: '◇', tone: 'text-[var(--paper-dim)] border-[var(--paper-dim)] border-dashed',
    title: 'A city coin backed by its treasury',
    text: "The coin's value follows the gold in the city's vault, so a successful raid on a city lowers what its coin is backed by.",
  },
];

export default function OnChain() {
  return (
    <section id="chain" aria-labelledby="chain-h" className="l-section px-4 py-16">
      <div className="pixel-divider -mx-4 -mt-16 mb-16" aria-hidden="true" />
      <div className="mx-auto max-w-6xl">
        <h2 id="chain-h" className="font-display text-3xl font-bold sm:text-4xl">Headed for NEAR</h2>
        <p className="mt-3 max-w-prose">
          Until then, the whole game runs in your browser and your city is saved on this device.
        </p>

        <ol className="mt-10 grid gap-6 lg:grid-cols-3 lg:gap-10">
          {STEPS.map((s) => (
            <li key={s.chip} className="road-step panel relative flex flex-col gap-3 p-5">
              <span className={`inline-flex w-fit items-center gap-2 border-2 bg-[var(--slab-lo)] px-2 py-1 text-sm font-bold ${s.tone}`}>
                <span aria-hidden="true">{s.mark}</span>{s.chip}
              </span>
              <h3 className="font-display text-xl font-bold">{s.title}</h3>
              <p className="text-sm">{s.text}</p>
              {s.link && (
                <a href={s.link.href} target="_blank" rel="noopener noreferrer" className="mt-auto w-fit text-sm font-bold text-[var(--accent)] underline underline-offset-4">
                  {s.link.label}<span className="sr-only"> (opens in a new tab)</span>
                </a>
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
