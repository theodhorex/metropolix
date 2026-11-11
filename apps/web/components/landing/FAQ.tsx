import Link from 'next/link';
import { ARCS, GRID, SHIELD_TICKS, WORLD_MAYORS } from '@metropolix/sim';
import './faq.css';

// Every answer here must stay true to the code: no claim the game is on chain yet, no money promises.
const REPO = 'https://github.com/theodhorex/metropolix';

const QA: { q: string; a: React.ReactNode }[] = [
  {
    q: 'What is Metropolix?',
    a: (
      <>
        A fantasy city builder in pixel art. You pick one of {ARCS.length} peoples, raise a city on a {GRID}×{GRID} map, keep your
        citizens fed, housed and happy, and raid rival mayors for their gold. One session of about ten minutes is enough to feel how it plays.
      </>
    ),
  },
  {
    q: 'Do I need to sign up, download anything or pay?',
    a: (
      <>
        No. Press <Link href="/play">Play now</Link> and the game runs in your browser. There is no account, no download and nothing to buy.
      </>
    ),
  },
  {
    q: 'Is the game on the blockchain already?',
    a: (
      <>
        Not yet. The NEAR smart contract that will hold your city, its ChainPower and your battle results is written in Rust and tested
        (see <a href={`${REPO}/tree/HEAD/contracts/metropolix`} target="_blank" rel="noopener noreferrer">contracts/metropolix</a>). The next
        step is deploying it to NEAR testnet and signing in with a NEAR wallet. Until then everything runs in your browser.
      </>
    ),
  },
  {
    q: 'Where is my city saved?',
    a: <>On this device, in your browser. Clearing this site&apos;s data deletes the city, and a different browser or device starts fresh.</>,
  },
  {
    q: 'Can I have more than one city, or change my people later?',
    a: <>No. One player, one city, and the people you choose is yours for good. That choice decides your land, your army and your trade good, so pick with care.</>,
  },
  {
    q: 'Are the other mayors real players?',
    a: (
      <>
        Not yet. The {WORLD_MAYORS} rival mayors are simulated: they grow, level up and raid each other and you, and every raid takes gold
        out of a real treasury in the simulation. They are built to be replaced by real players once the game is on chain.
      </>
    ),
  },
  {
    q: 'What happens when a rival raids me?',
    a: (
      <>
        If their attack beats your defense they take part of your gold and some troops. Your city then gets a shield for {Math.round(SHIELD_TICKS / 60)} minutes
        of game time, so you are not raided again straight away. Towers, troops and a defense plan in the war room make you harder to break.
      </>
    ),
  },
  {
    q: 'Can I earn money by playing?',
    a: (
      <>
        No, not today. A city coin backed by your city&apos;s treasury is planned for after the move to NEAR. Nothing can be bought, sold or
        withdrawn right now, and this page will say so plainly when that changes.
      </>
    ),
  },
  {
    q: 'Does it work on my phone?',
    a: <>It runs in a mobile browser and you can tap to build. It plays best on a larger screen with a mouse, where the map and the side panels have room.</>,
  },
  {
    q: 'Can I see the code?',
    a: (
      <>
        Yes, the whole project is public on <a href={REPO} target="_blank" rel="noopener noreferrer">GitHub</a>: the simulation, the web game and the contract.
      </>
    ),
  },
];

export default function FAQ() {
  return (
    <section id="faq" aria-labelledby="faq-title" className="faq">
      <div className="faq-inner">
        <span className="faq-pill font-display">Questions</span>
        <h2 id="faq-title" className="faq-title font-serif-display" data-reveal-words>
          Before you <em>take office</em>
        </h2>
        <p className="faq-lead">Straight answers about what works today and what is still on the way.</p>
        <div className="faq-list">
          {QA.map(({ q, a }, i) => (
            <details key={q} className="faq-item" name="faq" open={i === 0}>
              <summary>
                <span className="faq-num font-display" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                <span className="faq-q">{q}</span>
                <span className="faq-chevron" aria-hidden="true" />
              </summary>
              <div className="faq-a">{a}</div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
