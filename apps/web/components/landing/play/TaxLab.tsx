'use client';

import { useId, useMemo, useState } from 'react';
import { setTax, stats } from '@metropolix/sim';
import { labCity } from './showcase';
import './play.css';

/**
 * Tax against happiness on a real (simulated) town: drag the slider, read the sim's own numbers.
 * The faces row is a picture of the happiness value, not extra data.
 */
const FACES = 10;

function Face({ mood }: { mood: 'happy' | 'meh' | 'angry' }) {
  const skin = mood === 'happy' ? '#f4d27a' : mood === 'meh' ? '#e6c98f' : '#ea8a6a';
  // 8x8 pixel face; the mouth row changes with the mood
  const mouth = mood === 'happy' ? 'M2 5h1v1H2zM5 5h1v1H5zM3 6h2v1H3z' : mood === 'meh' ? 'M2 6h4v1H2z' : 'M3 5h2v1H3zM2 6h1v1H2zM5 6h1v1H5z';
  const brows = mood === 'angry' ? <path d="M1 1h2v1H1zM5 1h2v1H5z" fill="#3a2418" /> : null;
  return (
    <svg viewBox="0 0 8 8" width="22" height="22" shapeRendering="crispEdges" aria-hidden="true" className="tax-face" data-mood={mood}>
      <path d="M1 0h6v1H1zM0 1h8v6H0zM1 7h6v1H1z" fill={skin} />
      <path d="M2 2h1v2H2zM5 2h1v2H5z" fill="#2a1d14" />
      {brows}
      <path d={mouth} fill="#2a1d14" />
    </svg>
  );
}

export default function TaxLab() {
  const id = useId();
  const city = useMemo(() => labCity(), []);
  const [rate, setRate] = useState(city.taxRate);

  const st = useMemo(() => {
    setTax(city, rate);
    return stats(city);
  }, [city, rate]);

  const happy = Math.round(st.happinessPm / 10);
  const moodAt = (i: number): 'happy' | 'meh' | 'angry' => {
    const share = (i + 0.5) / FACES; // faces fill from the left with the happy share of citizens
    return share <= st.happinessPm / 1000 ? 'happy' : share <= Math.min(1, st.happinessPm / 1000 + 0.25) ? 'meh' : 'angry';
  };
  const verdict = happy >= 70 ? 'Content citizens, steady growth.' : happy >= 45 ? 'Grumbling in the taverns.' : 'Unrest. People will leave.';

  return (
    <div className="tax-lab" data-reveal>
      <div className="tax-lab-head">
        <span className="font-display tax-lab-tag">Try it</span>
        <label htmlFor={id} className="tax-lab-label">Tax rate <b className="font-display">{rate}%</b></label>
      </div>
      <input
        id={id} type="range" min={0} max={30} step={1} value={rate}
        onChange={(e) => setRate(+e.target.value)}
        className="tax-lab-range"
        aria-valuetext={`${rate} percent tax, ${happy} percent happiness, ${st.net} gold per second`}
      />
      <div className="tax-lab-stats" aria-live="polite">
        <div><span>Gold / s</span><b className={`font-display ${st.net < 0 ? 'neg' : ''}`}>{st.net > 0 ? '+' : ''}{st.net}</b></div>
        <div><span>Happiness</span><b className="font-display">{happy}%</b></div>
        <div><span>Productivity</span><b className="font-display">{Math.round(st.productivityPm / 10)}%</b></div>
      </div>
      <div className="tax-lab-faces" role="img" aria-label={`Citizens: ${happy}% happy`}>
        {Array.from({ length: FACES }, (_, i) => <Face key={i} mood={moodAt(i)} />)}
      </div>
      <p className="tax-lab-verdict">{verdict}</p>
      <p className="tax-lab-note">Numbers from the real game simulation, on a small elven town.</p>
    </div>
  );
}
