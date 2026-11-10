'use client';

import * as sim from '@metropolix/sim';
import CubeIcon from './CubeIcon';
import Icon from './Icon';

export type Preview = (k: sim.BuildingKind) => string | null;

/** Picture of any tradeable thing: a pixel icon for raw goods, the live sprite for buildings. */
export function ItemThumb({ k, size = 32, preview }: { k: sim.ItemKind; size?: number; preview?: Preview }) {
  if (sim.isRelic(k)) return <RelicThumb k={k} size={size} />;
  if (sim.isResource(k)) return <span className="inline-flex shrink-0 items-center justify-center" style={{ width: size, height: size }}><Icon name={k} size={Math.round(size * 0.75)} /></span>;
  const url = preview?.(k);
  // eslint-disable-next-line @next/next/no-img-element
  if (url) return <img src={url} alt="" width={size} height={size} className="shrink-0" style={{ imageRendering: 'pixelated' }} />;
  return <span className="inline-flex shrink-0 items-center justify-center" style={{ width: size, height: size }}><CubeIcon color={sim.BUILDINGS[k].color} height={sim.BUILDINGS[k].height} size={size * 0.7} /></span>;
}

/** A relic on a small plinth in its rarity colour, so rarity reads before the name does. */
export function RelicThumb({ k, size = 32 }: { k: sim.RelicKind; size?: number }) {
  const r = sim.RARITY[sim.RELICS[k].rarity];
  return (
    <span className={`relic-frame inline-flex shrink-0 items-center justify-center border-2 border-[var(--ink)] ${sim.RELICS[k].rarity === 'mythic' ? 'relic-mythic' : ''}`}
      style={{ width: size, height: size, background: `color-mix(in srgb, ${r.color} 22%, var(--slab-lo))`, boxShadow: `inset 0 0 0 2px ${r.color}` }}>
      <Icon name={k} size={Math.round(size * 0.66)} />
    </span>
  );
}

/** Small tag naming a people, in that people's colour. */
export function RaceTag({ arc }: { arc?: sim.ArcId }) {
  const a = sim.arcDef(arc);
  if (!a) return null;
  return (
    <span className="inline-flex items-center gap-1 border-2 border-[var(--ink)] px-1 text-[11px] leading-4 font-bold" style={{ background: a.accent, color: '#12151d' }}>
      {a.name}
    </span>
  );
}
