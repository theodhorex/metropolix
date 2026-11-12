'use client';

import { useEffect, useState } from 'react';
import * as sim from '@metropolix/sim';
import { paintPortrait } from '../lib/portraitArt';

// One painted set of frames per portrait id, as data URLs, shared by every place that shows it.
const cache = new Map<number, string[]>();
function framesOf(id: number): string[] {
  let f = cache.get(id);
  if (!f) { f = paintPortrait(sim.portraitTraits(id)).map((c) => c.toDataURL()); cache.set(id, f); }
  return f;
}

const reduced = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/** A mayor's pixel portrait (#001..#500). Animated frames (aura, glowing eyes) step slowly; still under reduced motion. */
export default function Portrait({ id, className, title }: { id: number; className?: string; title?: string }) {
  const [frames, setFrames] = useState<string[] | null>(null);
  const [i, setI] = useState(0);
  useEffect(() => { setFrames(framesOf(id)); setI(0); }, [id]);
  useEffect(() => {
    if (!frames || frames.length < 2 || reduced()) return;
    const t = window.setInterval(() => setI((v) => (v + 1) % frames.length), 420);
    return () => window.clearInterval(t);
  }, [frames]);
  const tier = sim.PORTRAIT_TIER[sim.portraitTier(id)];
  const label = title ?? `Portrait ${sim.portraitLabel(id)}, ${tier.name}`;
  if (!frames) return <span className={`block bg-[var(--slab-lo)] ${className ?? ''}`} role="img" aria-label={label} />;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={frames[i]} alt={label} draggable={false} className={`block [image-rendering:pixelated] ${className ?? ''}`} />;
}

/** "#042 · Epic" in the tier's colour. */
export function TierBadge({ id, className }: { id: number; className?: string }) {
  const tier = sim.PORTRAIT_TIER[sim.portraitTier(id)];
  return (
    <span className={`inline-flex items-center gap-1 border-2 border-[var(--ink)] bg-[var(--slab-hi)] px-1.5 py-0.5 font-display text-xs font-bold leading-none ${className ?? ''}`}
      style={{ color: tier.color }} title={`${tier.total} of ${sim.PORTRAIT_COUNT} portraits are ${tier.name}`}>
      {sim.portraitLabel(id)} · {tier.name}
    </span>
  );
}
