'use client';
// A citizen's standing portrait: the Blender render (/art/<arc>/cit_<v>_front_4.webp) when it exists, else the
// pixel drawing. Used by the people picker, the guide and the NPC dialog.
import { useMemo, useState, type CSSProperties } from 'react';
import type { ArcId } from '@metropolix/sim';
import { drawCitizen } from '@/lib/citizens';

export function CitizenImg({ arc, v, width, height, className, style }: { arc: ArcId; v: number; width: number; height: number; className?: string; style?: CSSProperties }) {
  const [failed, setFailed] = useState(false);
  const fallback = useMemo(() => (failed ? drawCitizen(arc, v, 'front', 4).toDataURL() : null), [failed, arc, v]);
  return (
    <img
      key={`${arc}-${v}-${failed}`}
      src={fallback ?? `/art/${arc}/cit_${v}_front_4.webp`}
      alt=""
      width={width}
      height={height}
      className={className}
      style={{ ...style, imageRendering: fallback ? 'pixelated' : 'auto' }}
      onError={() => setFailed(true)}
    />
  );
}
