import Image from 'next/image';

const STEPS = [
  {
    title: 'Build',
    text: 'Houses bring citizens, jobs bring gold. Upgrades change how a building looks and what it does.',
    src: '/landing/building-upgrade.png', w: 624, h: 600,
    alt: 'The barracks window showing level 2, what level 3 would add (more troop room, higher upkeep), and a gold Upgrade button.',
  },
  {
    title: 'Balance',
    text: 'Tax against happiness. Keep food flowing, build schools and parks, and watch the gold in your vault.',
    src: '/landing/economy.png', w: 892, h: 652,
    alt: 'The economy window with a tax rate slider and a table showing net gold per second and happiness at each tax rate.',
  },
  {
    title: 'Raid',
    text: "Train troops in the war room and raid rival mayors' treasuries. They raid you back.",
    src: '/landing/war-room.png', w: 1018, h: 790,
    alt: 'The war room window with heroes, archer troop types, spells, siege and a Pick a target button.',
  },
];

const GALLERY = [
  { title: 'Market', text: 'A market of simulated traders.', src: '/landing/market.png', w: 1018, h: 790, alt: 'The marketplace window listing special goods and materials with buy and sell buttons.' },
  { title: 'Vault', text: 'The vault of rare treasures found in your city.', src: '/landing/vault.png', w: 892, h: 790, alt: 'The vault window with treasures on display and a list of rare finds.' },
  { title: 'Chronicle', text: 'The chronicle of your reign.', src: '/landing/chronicle.png', w: 892, h: 790, alt: 'The chronicle page listing each treasure your city has dug up.' },
  { title: 'Mayor profile', text: 'Your mayor profile.', src: '/landing/profile.png', w: 764, h: 593, alt: 'A mayor profile with portrait, level, ChainPower, gold, citizens and battle record.' },
];

export default function HowItPlays() {
  return (
    <section id="how" aria-labelledby="how-h" className="l-section px-4 py-16">
      <div className="pixel-divider -mx-4 -mt-16 mb-16" aria-hidden="true" />
      <div className="mx-auto max-w-6xl">
        <h2 id="how-h" className="font-display text-3xl font-bold sm:text-4xl">How a reign goes</h2>

        <ol className="mt-10 space-y-16">
          {STEPS.map((s, i) => (
            <li key={s.title} className="grid items-center gap-6 md:grid-cols-2 md:gap-10">
              <div className={i % 2 ? 'md:order-2' : ''}>
                <h3 className="font-display text-2xl font-bold text-[var(--gold)]">
                  <span className="mr-2 text-[var(--paper-dim)]">{i + 1}.</span>{s.title}
                </h3>
                <p className="mt-2 max-w-prose">{s.text}</p>
              </div>
              <figure className="shot mx-2 sm:mx-0">
                <Image src={s.src} alt={s.alt} width={s.w} height={s.h} sizes="(min-width: 1152px) 560px, (min-width: 768px) 45vw, 100vw" loading="lazy" />
              </figure>
            </li>
          ))}
        </ol>

        <h3 className="mt-20 font-display text-2xl font-bold">And the rest of the realm</h3>
        <ul className="mt-6 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {GALLERY.map((g) => (
            <li key={g.title}>
              <figure>
                <div className="shot mx-1">
                  <Image src={g.src} alt={g.alt} width={g.w} height={g.h} sizes="(min-width: 1024px) 270px, (min-width: 640px) 45vw, 100vw" loading="lazy" />
                </div>
                <figcaption className="mt-4 text-sm"><b className="font-display">{g.title}.</b> {g.text}</figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
