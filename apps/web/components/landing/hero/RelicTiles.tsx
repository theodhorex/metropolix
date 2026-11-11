'use client';

import { useState, useEffect, useRef, type CSSProperties } from 'react';
import { RELICS, RARITY, type RelicKind } from '@metropolix/sim';
import { RelicThumb } from '@/components/ItemThumb';
import { useFoundRelics, addFoundRelic, HERO_RELIC_KINDS, TOTAL_HERO_RELICS } from './relicStore';
import { useTr } from '../prefs/store';
import T from '../prefs/T';

interface GlassTileDef {
  l: number;
  t: number;
  s: number;
  d: number;
  dur: number;
  relic?: RelicKind;
}

const TILES: GlassTileDef[] = [
  { l: 6, t: 30, s: 52, d: 0, dur: 6, relic: HERO_RELIC_KINDS[0] }, // geode
  { l: 17, t: 58, s: 38, d: -2.2, dur: 7.5, relic: HERO_RELIC_KINDS[1] }, // moonpearl
  { l: 29, t: 24, s: 32, d: -4, dur: 5.5, relic: HERO_RELIC_KINDS[2] }, // starmetal
  { l: 72, t: 34, s: 56, d: -1, dur: 8, relic: HERO_RELIC_KINDS[3] }, // goldtimber
  { l: 85, t: 62, s: 40, d: -3.4, dur: 6.5, relic: HERO_RELIC_KINDS[4] }, // phoenixfeather
  // Decorative ambient glass tiles
  { l: 92, t: 22, s: 26, d: -5.1, dur: 7 },
  { l: 40, t: 12, s: 22, d: -2.8, dur: 6 },
  { l: 62, t: 52, s: 30, d: -0.6, dur: 9 },
  { l: 12, t: 8, s: 24, d: -6, dur: 7.2 },
  { l: 78, t: 10, s: 20, d: -3, dur: 5.8 },
];

// Pre-computed pixel shard angles and offsets for cracked glass burst
const SHARDS = [
  { dx: -24, dy: -20, rot: -45, s: 4 },
  { dx: 22, dy: -22, rot: 30, s: 5 },
  { dx: -26, dy: 18, rot: 60, s: 4 },
  { dx: 25, dy: 24, rot: -30, s: 5 },
  { dx: 0, dy: -28, rot: 15, s: 3 },
  { dx: -28, dy: 0, rot: -60, s: 4 },
  { dx: 28, dy: 2, rot: 45, s: 3 },
  { dx: 0, dy: 26, rot: 90, s: 4 },
];

export default function RelicTiles({ className = '' }: { className?: string }) {
  const tr = useTr();
  const foundRelics = useFoundRelics();
  const [activeRelic, setActiveRelic] = useState<{ kind: RelicKind; tileIdx: number } | null>(null);
  const [burstTile, setBurstTile] = useState<number | null>(null);
  const [showToast, setShowToast] = useState(false);
  const dismissTimer = useRef<number | null>(null);
  const toastTimer = useRef<number | null>(null);

  useEffect(() => {
    const handleAllFound = () => {
      setShowToast(true);
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
      toastTimer.current = window.setTimeout(() => setShowToast(false), 7000);
    };

    window.addEventListener('metropolix:relics:all-found', handleAllFound);
    return () => {
      window.removeEventListener('metropolix:relics:all-found', handleAllFound);
      if (dismissTimer.current) window.clearTimeout(dismissTimer.current);
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
    };
  }, []);

  const handleTileClick = (tile: GlassTileDef, idx: number) => {
    if (!tile.relic) return;
    const kind = tile.relic;

    // Trigger shard burst
    setBurstTile(idx);
    window.setTimeout(() => setBurstTile(null), 700);

    // Save found relic
    addFoundRelic(kind);

    // Show card for 3 seconds
    setActiveRelic({ kind, tileIdx: idx });
    if (dismissTimer.current) window.clearTimeout(dismissTimer.current);
    dismissTimer.current = window.setTimeout(() => {
      setActiveRelic((curr) => (curr?.tileIdx === idx ? null : curr));
    }, 3000);
  };

  return (
    <div
      data-relic-tiles
      className={`hero-glass-layer pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      {TILES.map((t, i) => {
        const isRelicTile = !!t.relic;
        const isFound = isRelicTile && foundRelics.includes(t.relic!);
        const isCracked = burstTile === i;
        const relicDef = isRelicTile ? RELICS[t.relic!] : null;
        const rarityInfo = relicDef ? RARITY[relicDef.rarity] : null;

        const tileLabel = isFound && relicDef
          ? `${relicDef.name} (${rarityInfo?.name})`
          : tr('Frosted tile', 'Ubin kaca');

        return (
          <div
            key={i}
            className={`absolute ${i >= 6 ? 'hidden md:block' : i >= 5 ? 'hidden sm:block' : ''}`}
            style={{
              left: `${t.l}%`,
              top: `${t.t + 34}%`,
              width: t.s,
              height: t.s,
            }}
          >
            <button
              type="button"
              aria-label={tileLabel}
              tabIndex={isRelicTile ? 0 : -1}
              onClick={() => handleTileClick(t, i)}
              style={
                {
                  animationDelay: `${t.d}s`,
                  animationDuration: `${t.dur}s`,
                } as CSSProperties
              }
              className={`hero-glass group relative flex size-full cursor-pointer items-center justify-center p-0 text-left transition-transform active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--gold,#f2c14e)] ${
                isFound ? 'border-amber-400/60 bg-amber-200/20 shadow-[0_0_12px_rgba(245,158,11,0.3)]' : ''
              } ${isRelicTile ? 'pointer-events-auto' : 'pointer-events-none'}`}
            >
              {/* Shimmer sweep */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 overflow-hidden rounded-[9px]"
              >
                <span className="hero-glass-shimmer absolute inset-0 -translate-x-full transition-transform duration-700 group-hover:translate-x-full group-focus:translate-x-full" />
              </span>

              {/* Revealed relic inside tile */}
              {isFound && t.relic && (
                <span aria-hidden="true" className="scale-75 transition-transform duration-300 group-hover:scale-90">
                  <RelicThumb k={t.relic} size={Math.round(t.s * 0.7)} />
                </span>
              )}

              {/* Cracked line texture if cracked */}
              {isFound && (
                <svg
                  aria-hidden="true"
                  viewBox="0 0 40 40"
                  className="pointer-events-none absolute inset-0 size-full opacity-60"
                  shapeRendering="crispEdges"
                >
                  <path
                    d="M6 10 L18 22 L14 36 M18 22 L32 16 M22 25 L34 32"
                    stroke="rgba(255,255,255,0.7)"
                    strokeWidth="1.5"
                    fill="none"
                  />
                </svg>
              )}

              {/* Shard burst animation */}
              {isCracked && (
                <span aria-hidden="true" className="pointer-events-none absolute inset-0">
                  {SHARDS.map((s, si) => (
                    <span
                      key={si}
                      className="hero-shard absolute left-1/2 top-1/2 rounded-[1px] bg-white/90 shadow-xs"
                      style={
                        {
                          width: s.s,
                          height: s.s,
                          '--sdx': `${s.dx}px`,
                          '--sdy': `${s.dy}px`,
                          '--srot': `${s.rot}deg`,
                        } as CSSProperties
                      }
                    />
                  ))}
                </span>
              )}
            </button>

            {/* 3-second floating relic reveal card */}
            {activeRelic?.tileIdx === i && relicDef && rarityInfo && (
              <div
                role="status"
                aria-live="polite"
                className="hero-relic-card pointer-events-auto absolute bottom-full left-1/2 z-40 mb-3 -translate-x-1/2 rounded-xl border border-[var(--l-line)] bg-[var(--l-surface)] p-2.5 text-[var(--l-ink)] shadow-[0_8px_30px_var(--l-shadow)] backdrop-blur-md"
                style={{ width: 'max-content', maxWidth: '240px' }}
              >
                <div className="flex items-center gap-2.5">
                  <RelicThumb k={activeRelic.kind} size={36} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate text-xs font-bold leading-tight">
                        {relicDef.name}
                      </span>
                    </div>
                    <div className="mt-0.5 flex items-center gap-1.5">
                      <span
                        className="rounded px-1 py-0.2 font-mono text-[10px] font-bold uppercase tracking-wider"
                        style={{
                          color: rarityInfo.color,
                          backgroundColor: `color-mix(in srgb, ${rarityInfo.color} 18%, transparent)`,
                        }}
                      >
                        {rarityInfo.name}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="mt-1.5 text-[11px] leading-snug text-[var(--l-muted)]">
                  {relicDef.desc}
                </p>
                {/* 3-second progress indicator */}
                <div className="mt-2 h-0.5 w-full overflow-hidden rounded-full bg-[var(--l-line)]">
                  <div className="hero-relic-timer h-full bg-[var(--gold,#f2c14e)]" />
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* 5/5 Treasure hunter toast */}
      {showToast && (
        <aside
          role="status"
          aria-live="polite"
          className="hero-relic-toast pointer-events-auto fixed bottom-6 left-1/2 z-60 -translate-x-1/2 rounded-2xl border border-[var(--gold,#f2c14e)]/50 bg-[var(--l-surface)] px-4 py-3 text-[var(--l-ink)] shadow-[0_12px_40px_rgba(0,0,0,0.25)] backdrop-blur-md transition-all sm:bottom-8"
          style={{ width: 'min(92vw, 480px)' }}
        >
          <div className="flex items-start gap-3">
            <span
              className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-[var(--gold,#f2c14e)]/20 text-sm"
              aria-hidden="true"
            >
              👑
            </span>
            <div className="flex-1 text-xs leading-relaxed">
              <strong className="block font-bold text-[var(--l-ink)]">
                <T en="Treasure hunter!" id="Pemburu harta karun!" />
              </strong>
              <span className="text-[var(--l-muted)]">
                <T
                  en="In the game, relics turn up in your mines, lumber mills, workshops and farms, very rarely."
                  id="Di dalam game, relik sesekali muncul dari tambang, penggergajian, bengkel, dan ladang Anda, sangat jarang."
                />
              </span>
              <div className="mt-1 text-[11px] font-mono text-[var(--gold,#f2c14e)]">
                {`${TOTAL_HERO_RELICS} / ${TOTAL_HERO_RELICS} `}
                <T en="relics uncovered" id="relik terungkap" />
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowToast(false)}
              aria-label={tr('Close notification', 'Tutup pemberitahuan')}
              className="shrink-0 rounded-md p-1 text-[var(--l-muted)] hover:text-[var(--l-ink)]"
            >
              ✕
            </button>
          </div>
        </aside>
      )}
    </div>
  );
}
