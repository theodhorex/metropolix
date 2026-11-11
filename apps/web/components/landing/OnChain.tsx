const REPO = 'https://github.com/theodhorex/metropolix';

const STEPS = [
  {
    chip: 'Written and tested',
    mark: '✓',
    chipClass: 'bg-[#eef8ed] text-[#22722b] border-[#8ad394]',
    title: 'A NEAR smart contract in Rust',
    text: 'It will hold your city, its ChainPower and battle results.',
    link: { href: `${REPO}/tree/HEAD/contracts/metropolix`, label: 'Read the contract on GitHub' },
  },
  {
    chip: 'Next',
    mark: '▶',
    chipClass: 'bg-[#fff8e6] text-[#8a5d08] border-[#e8c060]',
    title: 'Deploy to NEAR testnet',
    text: 'Then sign in with a NEAR wallet and keep your city on the network instead of this device.',
  },
  {
    chip: 'Planned',
    mark: '◇',
    chipClass: 'bg-[#f4f5f7] text-[#555d6e] border-[#c4c9d4] border-dashed',
    title: 'A city coin backed by its treasury',
    text: "The coin's value follows the gold in the city's vault, so a successful raid on a city lowers what its coin is backed by.",
  },
];

export default function OnChain() {
  return (
    <section id="chain" aria-labelledby="chain-h" className="l-section relative bg-[#fbfcfe] px-4 py-20">
      <div className="landing-grid-faint" aria-hidden="true" />
      <div className="pixel-divider -mx-4 -mt-20 mb-16" aria-hidden="true" />
      <div className="mx-auto max-w-6xl">
        <div className="text-center" data-reveal>
          <div className="mb-3">
            <span className="landing-pill">Roadmap</span>
          </div>
          <h2 id="chain-h" data-reveal-words className="landing-h2">
            Headed for NEAR
          </h2>
          <p className="mx-auto mt-4 max-w-prose text-base text-[var(--landing-ink-muted)] sm:text-lg">
            Until then, the whole game runs in your browser and your city is saved on this device.
          </p>
        </div>

        <ol className="mt-14 grid gap-6 lg:grid-cols-3 lg:gap-8" data-reveal>
          {STEPS.map((s) => (
            <li
              key={s.chip}
              className="road-step-light relative flex flex-col gap-4 rounded-md border border-[rgba(18,21,29,0.12)] bg-white p-6 shadow-sm transition-all hover:shadow-md"
            >
              <span
                className={`inline-flex w-fit items-center gap-1.5 rounded border px-2.5 py-1 font-display text-xs font-bold ${s.chipClass}`}
              >
                <span aria-hidden="true">{s.mark}</span>
                {s.chip}
              </span>
              <h3 className="font-serif-display text-xl font-normal tracking-tight text-[var(--landing-ink)]">
                {s.title}
              </h3>
              <p className="text-sm leading-relaxed text-[var(--landing-ink-muted)]">
                {s.text}
              </p>
              {s.link && (
                <a
                  href={s.link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto w-fit text-xs font-bold text-[#1b5e94] underline underline-offset-4 hover:text-[#0c375c]"
                >
                  {s.link.label}
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
