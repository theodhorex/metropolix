'use client';

import { useId } from 'react';
import type { ArcId } from '@metropolix/sim';

/**
 * Original hand-drawn SVG illustrations of the five peoples (bust portraits, 240x280).
 * Flat, stylised, light from the top-left. Each has its own backdrop so the arc reads at a glance.
 */
export default function ArcPortrait({ arc, className }: { arc: ArcId; className?: string }) {
  const id = useId().replace(/:/g, '');
  const P = PORTRAITS[arc];
  return (
    <svg viewBox="0 0 240 280" className={className} role="img" aria-label={`${arc} portrait`} preserveAspectRatio="xMidYMid slice">
      <P id={id} />
    </svg>
  );
}

type PProps = { id: string };

/* ------------------------------------------------------------------ DRAGON */
function Dragon({ id }: PProps) {
  return (
    <g>
      <defs>
        <radialGradient id={`${id}bg`} cx="50%" cy="82%" r="85%"><stop offset="0" stopColor="#ff7a2f" /><stop offset=".35" stopColor="#9c1d1d" /><stop offset="1" stopColor="#14060a" /></radialGradient>
        <linearGradient id={`${id}sk`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#d0402e" /><stop offset="1" stopColor="#7a1414" /></linearGradient>
        <radialGradient id={`${id}eye`}><stop offset="0" stopColor="#fff3a8" /><stop offset=".6" stopColor="#ffb300" /><stop offset="1" stopColor="#e65100" /></radialGradient>
        <radialGradient id={`${id}glow`}><stop offset="0" stopColor="#ffb300" stopOpacity=".55" /><stop offset="1" stopColor="#ffb300" stopOpacity="0" /></radialGradient>
      </defs>
      <rect width="240" height="280" fill={`url(#${id}bg)`} />
      {/* volcano + lava */}
      <path d="M-10 280 L70 175 L100 190 L135 160 L170 185 L250 280Z" fill="#1d0a0c" />
      <path d="M105 192 L112 215 L100 240 L118 262 M138 164 L132 200 L148 228" stroke="#ff8a1f" strokeWidth="3" fill="none" strokeLinecap="round" />
      {[[30, 60, 2], [200, 40, 1.6], [214, 120, 2.2], [20, 150, 1.4], [60, 24, 1.2], [182, 88, 1.5]].map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} fill="#ffb74d" opacity=".85" />)}
      {/* wings */}
      <path d="M78 150 C40 120 18 80 8 40 C34 60 52 62 70 58 C58 84 70 100 86 112Z" fill="#4a0d14" stroke="#1d0508" strokeWidth="2" />
      <path d="M162 150 C200 120 222 80 232 40 C206 60 188 62 170 58 C182 84 170 100 154 112Z" fill="#4a0d14" stroke="#1d0508" strokeWidth="2" />
      <path d="M70 58 L52 108 M70 58 L30 82 M170 58 L188 108 M170 58 L210 82" stroke="#8b2a22" strokeWidth="3" strokeLinecap="round" />
      {/* neck + shoulders */}
      <path d="M60 280 C62 236 84 214 120 212 C156 214 178 236 180 280Z" fill={`url(#${id}sk)`} stroke="#3a0709" strokeWidth="2.5" />
      <path d="M92 236 q6 6 12 0 M118 244 q6 6 12 0 M144 236 q6 6 12 0 M104 258 q6 6 12 0 M132 258 q6 6 12 0" stroke="#3a0709" strokeWidth="2" fill="none" opacity=".6" />
      <path d="M100 214 L120 250 L140 214Z" fill="#f2b45a" stroke="#3a0709" strokeWidth="2" />
      {/* crest */}
      <path d="M104 74 L110 40 L120 66 L130 38 L136 74Z" fill="#8f1d18" stroke="#3a0709" strokeWidth="2.5" strokeLinejoin="round" />
      {/* horns */}
      <path d="M88 92 C56 84 36 52 44 14 C58 40 76 54 102 70Z" fill="#efe0b8" stroke="#3a2a14" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M152 92 C184 84 204 52 196 14 C182 40 164 54 138 70Z" fill="#efe0b8" stroke="#3a2a14" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M52 30 L66 56 M70 44 L84 64 M188 30 L174 56 M170 44 L156 64" stroke="#b89c64" strokeWidth="2" strokeLinecap="round" />
      {/* head */}
      <path d="M120 70 C84 70 64 108 70 146 C74 174 96 204 120 208 C144 204 166 174 170 146 C176 108 156 70 120 70Z" fill={`url(#${id}sk)`} stroke="#3a0709" strokeWidth="3" />
      {/* snout */}
      <path d="M92 158 C92 140 148 140 148 158 C152 186 140 204 120 206 C100 204 88 186 92 158Z" fill="#c4392a" stroke="#3a0709" strokeWidth="2.5" />
      <ellipse cx="108" cy="166" rx="5" ry="7" fill="#2a0508" /><ellipse cx="132" cy="166" rx="5" ry="7" fill="#2a0508" />
      <path d="M104 150 q-6 -14 2 -22 M136 150 q6 -14 -2 -22" stroke="#d9d9d9" strokeWidth="3" fill="none" opacity=".35" strokeLinecap="round" />
      {/* mouth + fangs */}
      <path d="M100 192 Q120 204 140 192" stroke="#2a0508" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M106 193 L110 205 L114 196Z M126 196 L130 205 L134 193Z" fill="#fffbe9" stroke="#2a0508" strokeWidth="1.5" />
      {/* brows + eyes */}
      <path d="M78 112 L110 124 M162 112 L130 124" stroke="#3a0709" strokeWidth="6" strokeLinecap="round" />
      <circle cx="96" cy="130" r="20" fill={`url(#${id}glow)`} /><circle cx="144" cy="130" r="20" fill={`url(#${id}glow)`} />
      <ellipse cx="96" cy="131" rx="13" ry="8" fill={`url(#${id}eye)`} stroke="#3a0709" strokeWidth="2" /><ellipse cx="144" cy="131" rx="13" ry="8" fill={`url(#${id}eye)`} stroke="#3a0709" strokeWidth="2" />
      <ellipse cx="96" cy="131" rx="2.6" ry="8" fill="#14060a" /><ellipse cx="144" cy="131" rx="2.6" ry="8" fill="#14060a" />
      <circle cx="92" cy="128" r="2" fill="#fff" opacity=".9" /><circle cx="140" cy="128" r="2" fill="#fff" opacity=".9" />
      {/* scale flecks */}
      <path d="M86 96 q5 5 10 0 M112 90 q5 5 10 0 M138 96 q5 5 10 0 M76 140 q4 4 8 0 M156 140 q4 4 8 0" stroke="#3a0709" strokeWidth="2" fill="none" opacity=".55" />
    </g>
  );
}

/* --------------------------------------------------------------------- ELF */
function Elf({ id }: PProps) {
  return (
    <g>
      <defs>
        <linearGradient id={`${id}bg`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#10351f" /><stop offset=".6" stopColor="#1e6a3a" /><stop offset="1" stopColor="#0c2a18" /></linearGradient>
        <linearGradient id={`${id}hair`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#f4efe0" /><stop offset="1" stopColor="#b9c2cf" /></linearGradient>
        <radialGradient id={`${id}eye`}><stop offset="0" stopColor="#eaffd0" /><stop offset="1" stopColor="#2ea64a" /></radialGradient>
      </defs>
      <rect width="240" height="280" fill={`url(#${id}bg)`} />
      {/* forest */}
      {[[20, 150, 1.1], [60, 130, 0.8], [190, 140, 1.05], [222, 120, 0.8]].map(([x, y, k], i) => (
        <g key={i} transform={`translate(${x} ${y}) scale(${k})`}><rect x="-5" y="20" width="10" height="90" fill="#3b2a1c" /><path d="M0 -40 L30 20 L-30 20Z M0 -10 L38 52 L-38 52Z" fill="#173f26" stroke="#0a2616" strokeWidth="2" /></g>
      ))}
      {[[40, 70], [190, 60], [210, 110], [30, 120], [150, 30], [90, 40]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="2.4" fill="#c9ff8a" opacity=".9" />)}
      <path d="M-10 280 L-10 214 C60 200 180 200 250 214 L250 280Z" fill="#12361f" />
      {/* hair back */}
      <path d="M74 106 C58 150 62 214 84 250 L156 250 C178 214 182 150 166 106 C150 60 90 60 74 106Z" fill={`url(#${id}hair)`} stroke="#6f7a89" strokeWidth="2.5" />
      {/* cloak */}
      <path d="M40 280 C46 232 76 216 120 214 C164 216 194 232 200 280Z" fill="#245f36" stroke="#0e2d19" strokeWidth="2.5" />
      <path d="M92 218 L120 270 L148 218 C140 228 100 228 92 218Z" fill="#ecdcae" stroke="#0e2d19" strokeWidth="2" />
      <path d="M52 262 C70 244 84 238 96 236 M188 262 C170 244 156 238 144 236" stroke="#3c8a52" strokeWidth="2.5" fill="none" />
      {/* leaf clasp */}
      <path d="M114 224 C108 212 118 204 122 206 C128 212 126 222 118 228Z" fill="#ffd96b" stroke="#7a5a12" strokeWidth="2" />
      {/* neck */}
      <path d="M104 190 L104 220 C112 230 128 230 136 220 L136 190Z" fill="#f1cfae" stroke="#9b6b4a" strokeWidth="2" />
      {/* ears */}
      <path d="M78 134 L38 112 C46 136 58 154 80 162Z" fill="#f7d9bb" stroke="#9b6b4a" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M162 134 L202 112 C194 136 182 154 160 162Z" fill="#f7d9bb" stroke="#9b6b4a" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M72 138 L52 124 M168 138 L188 124" stroke="#e1a98a" strokeWidth="2" />
      {/* face */}
      <path d="M82 118 C82 90 158 90 158 118 C160 156 142 196 120 200 C98 196 80 156 82 118Z" fill="#f8dcc0" stroke="#9b6b4a" strokeWidth="2.5" />
      {/* fringe */}
      <path d="M80 118 C86 84 154 84 160 118 C148 100 128 96 120 98 C112 96 92 100 80 118Z" fill={`url(#${id}hair)`} stroke="#6f7a89" strokeWidth="2" />
      <path d="M120 96 C116 108 108 116 98 120 M120 96 C124 108 132 116 142 120" stroke="#8d97a6" strokeWidth="2" fill="none" />
      {/* circlet */}
      <path d="M84 104 C100 94 140 94 156 104" stroke="#ffd96b" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <path d="M120 90 L126 100 L120 108 L114 100Z" fill="#7be0a0" stroke="#206b3e" strokeWidth="2" />
      {/* eyes */}
      <path d="M92 134 Q104 124 116 134" stroke="#3b2a1c" strokeWidth="3" fill="none" strokeLinecap="round" /><path d="M124 134 Q136 124 148 134" stroke="#3b2a1c" strokeWidth="3" fill="none" strokeLinecap="round" />
      <ellipse cx="104" cy="138" rx="7.5" ry="5.2" fill={`url(#${id}eye)`} stroke="#1f4d2a" strokeWidth="1.8" /><ellipse cx="136" cy="138" rx="7.5" ry="5.2" fill={`url(#${id}eye)`} stroke="#1f4d2a" strokeWidth="1.8" />
      <circle cx="104" cy="138" r="2.4" fill="#12301a" /><circle cx="136" cy="138" r="2.4" fill="#12301a" /><circle cx="101.5" cy="136" r="1.3" fill="#fff" /><circle cx="133.5" cy="136" r="1.3" fill="#fff" />
      <path d="M94 124 L112 128 M146 124 L128 128" stroke="#8d97a6" strokeWidth="3" strokeLinecap="round" />
      {/* nose + mouth */}
      <path d="M120 142 L116 164 L123 164" stroke="#c9906e" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M108 178 Q120 186 132 178" stroke="#b5604f" strokeWidth="3" fill="none" strokeLinecap="round" />
      {/* bow */}
      <path d="M206 70 C240 130 240 200 206 262" stroke="#7a5a2e" strokeWidth="5" fill="none" strokeLinecap="round" /><path d="M206 70 L206 262" stroke="#e8e2cc" strokeWidth="1.5" />
    </g>
  );
}

/* ------------------------------------------------------------------ LIZARD */
function Lizard({ id }: PProps) {
  return (
    <g>
      <defs>
        <linearGradient id={`${id}bg`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f2a65a" /><stop offset=".55" stopColor="#d9743a" /><stop offset="1" stopColor="#5b2a1e" /></linearGradient>
        <linearGradient id={`${id}sk`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#4fc8a8" /><stop offset="1" stopColor="#1d7a72" /></linearGradient>
        <radialGradient id={`${id}fr`}><stop offset="0" stopColor="#ffb347" /><stop offset="1" stopColor="#d6452f" /></radialGradient>
      </defs>
      <rect width="240" height="280" fill={`url(#${id}bg)`} />
      <circle cx="190" cy="64" r="34" fill="#ffe3a0" opacity=".9" />
      <path d="M-10 280 L-10 200 L40 170 L70 200 L120 160 L190 205 L250 175 L250 280Z" fill="#6e3523" />
      <path d="M-10 280 L-10 230 L50 215 L110 235 L170 215 L250 232 L250 280Z" fill="#4a2217" />
      {[[22, 200], [214, 196], [200, 216]].map(([x, y], i) => <g key={i} transform={`translate(${x} ${y})`}><path d="M0 0 C-2 -30 -4 -50 0 -64 M6 0 C8 -26 10 -40 8 -54 M-6 0 C-12 -20 -14 -30 -16 -40" stroke="#6c9a3a" strokeWidth="3" fill="none" strokeLinecap="round" /></g>)}
      {/* frill */}
      <path d="M120 38 C60 30 20 80 28 150 C40 130 56 126 76 132 C62 150 70 168 84 176 C100 170 112 170 120 172 C128 170 140 170 156 176 C170 168 178 150 164 132 C184 126 200 130 212 150 C220 80 180 30 120 38Z" fill={`url(#${id}fr)`} stroke="#6b1f14" strokeWidth="3" strokeLinejoin="round" />
      <path d="M120 40 L120 100 M82 52 L96 110 M158 52 L144 110 M52 82 L84 120 M188 82 L156 120" stroke="#8c2a1c" strokeWidth="2.5" strokeLinecap="round" opacity=".8" />
      {/* body */}
      <path d="M52 280 C56 238 84 218 120 216 C156 218 184 238 188 280Z" fill="#a8693a" stroke="#4a2217" strokeWidth="2.5" />
      <path d="M86 226 C96 256 144 256 154 226" stroke="#f1e6c8" strokeWidth="5" fill="none" strokeDasharray="1 11" strokeLinecap="round" />
      <path d="M92 232 L100 252 M148 232 L140 252" stroke="#f1e6c8" strokeWidth="6" strokeLinecap="round" />
      {/* neck */}
      <path d="M96 190 L96 222 C108 234 132 234 144 222 L144 190Z" fill={`url(#${id}sk)`} stroke="#0f4a46" strokeWidth="2.5" />
      {/* head */}
      <path d="M120 78 C86 78 72 106 76 138 C80 170 98 196 120 198 C142 196 160 170 164 138 C168 106 154 78 120 78Z" fill={`url(#${id}sk)`} stroke="#0f4a46" strokeWidth="3" />
      <path d="M96 160 C96 146 144 146 144 160 C146 182 134 198 120 198 C106 198 94 182 96 160Z" fill="#8fe3c6" stroke="#0f4a46" strokeWidth="2" />
      <ellipse cx="110" cy="164" rx="3" ry="4" fill="#0b3532" /><ellipse cx="130" cy="164" rx="3" ry="4" fill="#0b3532" />
      <path d="M102 186 Q120 196 138 186" stroke="#0b3532" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M120 192 L120 214 L114 224 M120 214 L126 224" stroke="#d6452f" strokeWidth="3" fill="none" strokeLinecap="round" />
      {/* crest ridge + scale dots */}
      <path d="M108 80 L112 62 L120 78 L128 62 L132 80" fill="#1d7a72" stroke="#0f4a46" strokeWidth="2.5" strokeLinejoin="round" />
      {[[92, 110], [104, 100], [136, 100], [148, 110], [84, 130], [156, 130], [120, 106]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="3" fill="#2f9a8e" stroke="#0f4a46" strokeWidth="1" />)}
      {/* eyes */}
      <path d="M84 120 L108 128 M156 120 L132 128" stroke="#0f4a46" strokeWidth="5" strokeLinecap="round" />
      <ellipse cx="98" cy="132" rx="11" ry="9" fill="#ffe14a" stroke="#0f4a46" strokeWidth="2.2" /><ellipse cx="142" cy="132" rx="11" ry="9" fill="#ffe14a" stroke="#0f4a46" strokeWidth="2.2" />
      <ellipse cx="98" cy="132" rx="2.4" ry="8" fill="#14120a" /><ellipse cx="142" cy="132" rx="2.4" ry="8" fill="#14120a" />
      <circle cx="95" cy="128" r="1.8" fill="#fff" /><circle cx="139" cy="128" r="1.8" fill="#fff" />
      {/* bone necklace */}
      <path d="M84 226 C100 250 140 250 156 226" stroke="#6b4a2a" strokeWidth="2.5" fill="none" />
      {([[96, 242], [110, 249], [124, 250], [138, 246]] as [number, number][]).map(([x, y], i) => <rect key={i} x={x - 3} y={y - 1} width="7" height="12" rx="3" fill="#f1e6c8" stroke="#6b4a2a" strokeWidth="1.5" />)}
    </g>
  );
}

/* ----------------------------------------------------------------- CAVEMAN */
function Caveman({ id }: PProps) {
  return (
    <g>
      <defs>
        <radialGradient id={`${id}bg`} cx="50%" cy="85%" r="90%"><stop offset="0" stopColor="#f08a2f" /><stop offset=".4" stopColor="#7a4a2a" /><stop offset="1" stopColor="#1f1410" /></radialGradient>
        <linearGradient id={`${id}hair`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#6b4326" /><stop offset="1" stopColor="#2e1c10" /></linearGradient>
      </defs>
      <rect width="240" height="280" fill={`url(#${id}bg)`} />
      {/* cave painting */}
      <g stroke="#e8c9a0" strokeWidth="3" fill="none" strokeLinecap="round" opacity=".55">
        <path d="M18 50 q8 -14 20 -6 q10 -12 22 0 l-4 14 l-6 -2 l-2 10 M30 70 l-2 12 M52 62 l-2 12" />
        <circle cx="206" cy="52" r="10" /><path d="M206 62 L206 90 M206 72 L194 82 M206 72 L218 82 M206 90 L198 108 M206 90 L214 108" />
      </g>
      <path d="M-10 280 L-10 220 C40 200 80 206 120 200 C160 206 200 200 250 220 L250 280Z" fill="#2a1a12" />
      {/* fire glow */}
      <path d="M40 280 C36 250 48 238 52 224 C60 240 70 250 66 280Z" fill="#ff9a2f" /><path d="M48 280 C46 262 54 254 56 244 C60 256 64 264 62 280Z" fill="#ffe27a" />
      {/* fur pelt */}
      <path d="M36 280 C40 232 74 212 120 210 C166 212 200 232 204 280Z" fill="#b58a55" stroke="#4a2f18" strokeWidth="2.5" />
      <path d="M44 252 l8 -8 l6 10 l8 -10 l6 10 M176 250 l8 -8 l6 10 l8 -10 l6 10 M84 232 l6 8 l6 -8 M146 232 l6 8 l6 -8" stroke="#4a2f18" strokeWidth="2.5" fill="none" strokeLinejoin="round" />
      <path d="M44 280 L180 280" stroke="#4a2f18" strokeWidth="1" opacity="0" />
      <path d="M96 222 C110 244 130 244 144 222" stroke="#e8d7b0" strokeWidth="6" fill="none" strokeDasharray="2 10" strokeLinecap="round" />
      {/* neck + shoulder skin */}
      <path d="M92 192 L92 224 C106 238 134 238 148 224 L148 192Z" fill="#d79a6a" stroke="#7a4a2a" strokeWidth="2.5" />
      {/* hair back */}
      <path d="M68 120 C54 150 62 190 82 200 L158 200 C178 190 186 150 172 120 C160 64 80 64 68 120Z" fill={`url(#${id}hair)`} stroke="#1f120a" strokeWidth="2.5" />
      {/* head */}
      <path d="M82 122 C82 92 158 92 158 122 C162 160 146 196 120 200 C94 196 78 160 82 122Z" fill="#e2a878" stroke="#7a4a2a" strokeWidth="2.5" />
      {/* beard */}
      <path d="M80 148 C84 188 100 214 120 216 C140 214 156 188 160 148 C150 168 138 176 120 176 C102 176 90 168 80 148Z" fill={`url(#${id}hair)`} stroke="#1f120a" strokeWidth="2.5" />
      <path d="M104 190 Q120 200 136 190" stroke="#2e1c10" strokeWidth="3" fill="none" strokeLinecap="round" /><path d="M112 192 Q120 184 128 192" fill="#b24a3a" />
      {/* hair top / unruly */}
      <path d="M78 116 C74 86 96 70 120 76 C144 70 168 86 162 116 C154 98 142 92 130 96 L124 104 L116 94 C98 92 86 98 78 116Z" fill={`url(#${id}hair)`} stroke="#1f120a" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M150 84 L170 58 M156 90 L180 78" stroke="#1f120a" strokeWidth="2" />
      {/* bone in hair */}
      <g transform="rotate(-24 98 84)"><rect x="76" y="80" width="46" height="8" rx="4" fill="#f1e6c8" stroke="#6b4a2a" strokeWidth="2" /><circle cx="76" cy="80" r="5" fill="#f1e6c8" stroke="#6b4a2a" strokeWidth="2" /><circle cx="76" cy="89" r="5" fill="#f1e6c8" stroke="#6b4a2a" strokeWidth="2" /><circle cx="122" cy="80" r="5" fill="#f1e6c8" stroke="#6b4a2a" strokeWidth="2" /><circle cx="122" cy="89" r="5" fill="#f1e6c8" stroke="#6b4a2a" strokeWidth="2" /></g>
      {/* brow + eyes */}
      <path d="M86 122 L112 128 M154 122 L128 128" stroke="#2e1c10" strokeWidth="8" strokeLinecap="round" />
      <ellipse cx="100" cy="136" rx="6" ry="4.5" fill="#fff6e6" stroke="#2e1c10" strokeWidth="1.8" /><ellipse cx="140" cy="136" rx="6" ry="4.5" fill="#fff6e6" stroke="#2e1c10" strokeWidth="1.8" />
      <circle cx="101" cy="137" r="2.6" fill="#3a2410" /><circle cx="139" cy="137" r="2.6" fill="#3a2410" />
      <path d="M120 138 C112 156 112 162 122 164 C128 164 130 160 126 156" stroke="#a8683f" strokeWidth="3" fill="none" strokeLinecap="round" />
      {/* club */}
      <g transform="rotate(28 214 150)"><rect x="204" y="64" width="20" height="150" rx="9" fill="#8a5a2e" stroke="#3a2410" strokeWidth="2.5" /><ellipse cx="214" cy="66" rx="19" ry="26" fill="#9a6a38" stroke="#3a2410" strokeWidth="2.5" /><path d="M208 58 l-4 -10 M220 54 l2 -12 M214 80 l10 6" stroke="#c9ccd0" strokeWidth="3" strokeLinecap="round" /></g>
    </g>
  );
}

/* ------------------------------------------------------------------ GOBLIN */
function Goblin({ id }: PProps) {
  return (
    <g>
      <defs>
        <linearGradient id={`${id}bg`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1b2a14" /><stop offset=".6" stopColor="#3d5a1f" /><stop offset="1" stopColor="#14180c" /></linearGradient>
        <linearGradient id={`${id}sk`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#9ccf4a" /><stop offset="1" stopColor="#5a8a22" /></linearGradient>
        <radialGradient id={`${id}torch`}><stop offset="0" stopColor="#c8ff5a" stopOpacity=".7" /><stop offset="1" stopColor="#c8ff5a" stopOpacity="0" /></radialGradient>
      </defs>
      <rect width="240" height="280" fill={`url(#${id}bg)`} />
      {/* junk heap */}
      <path d="M-10 280 L-10 190 L30 176 L52 196 L80 170 L100 206 L150 200 L170 168 L200 190 L224 172 L250 196 L250 280Z" fill="#2c2a22" />
      <path d="M20 200 l22 -4 l4 14 l-24 2Z M170 196 l26 4 l-4 14 l-24 -2Z" fill="#8a4a24" stroke="#241a10" strokeWidth="2" />
      <circle cx="206" cy="206" r="9" fill="#8d8d80" stroke="#241a10" strokeWidth="2" /><circle cx="206" cy="206" r="3" fill="#241a10" />
      {/* torch */}
      <circle cx="34" cy="96" r="44" fill={`url(#${id}torch)`} />
      <rect x="31" y="100" width="6" height="64" fill="#5c3a1c" stroke="#241a10" strokeWidth="2" />
      <path d="M34 62 C22 80 24 98 34 100 C44 98 46 80 34 62Z" fill="#b6f23a" stroke="#4a7a12" strokeWidth="2" /><path d="M34 80 C30 90 32 98 34 98 C38 96 38 88 34 80Z" fill="#f4ffb0" />
      {/* body + vest */}
      <path d="M50 280 C54 236 84 218 120 216 C156 218 186 236 190 280Z" fill="#7a5230" stroke="#241a10" strokeWidth="2.5" />
      <path d="M92 222 L120 280 L148 222 C140 232 100 232 92 222Z" fill="#a8d04a" stroke="#241a10" strokeWidth="2" />
      <g stroke="#241a10" strokeWidth="2" fill="#8d8d80"><circle cx="70" cy="258" r="5" /><circle cx="170" cy="258" r="5" /><circle cx="86" cy="272" r="4" /></g>
      <path d="M62 244 L96 262 M178 244 L144 262" stroke="#4d321c" strokeWidth="5" strokeLinecap="round" />
      {/* skull trinket */}
      <circle cx="120" cy="250" r="9" fill="#efe6c8" stroke="#241a10" strokeWidth="2" /><circle cx="116" cy="248" r="2.2" fill="#241a10" /><circle cx="124" cy="248" r="2.2" fill="#241a10" />
      {/* neck */}
      <path d="M100 196 L100 224 C110 232 130 232 140 224 L140 196Z" fill={`url(#${id}sk)`} stroke="#2e4a10" strokeWidth="2.5" />
      {/* huge ears */}
      <path d="M80 126 L18 92 C20 128 40 158 82 168Z" fill={`url(#${id}sk)`} stroke="#2e4a10" strokeWidth="3" strokeLinejoin="round" />
      <path d="M160 126 L222 92 C220 128 200 158 158 168Z" fill={`url(#${id}sk)`} stroke="#2e4a10" strokeWidth="3" strokeLinejoin="round" />
      <path d="M72 132 L36 112 M168 132 L204 112" stroke="#4d7a1c" strokeWidth="2.5" />
      <circle cx="44" cy="124" r="4.5" fill="none" stroke="#ffd54f" strokeWidth="2.5" /><circle cx="196" cy="124" r="4.5" fill="none" stroke="#ffd54f" strokeWidth="2.5" /><circle cx="50" cy="140" r="3" fill="#ffd54f" stroke="#7a5a12" strokeWidth="1" />
      {/* head */}
      <path d="M120 82 C84 82 70 112 76 146 C82 180 100 200 120 202 C140 200 158 180 164 146 C170 112 156 82 120 82Z" fill={`url(#${id}sk)`} stroke="#2e4a10" strokeWidth="3" />
      {/* helmet */}
      <path d="M72 116 C72 80 168 80 168 116 C150 106 90 106 72 116Z" fill="#8d8d80" stroke="#241a10" strokeWidth="3" />
      <path d="M72 116 L168 116" stroke="#241a10" strokeWidth="3" /><path d="M120 86 L120 114" stroke="#5a5a52" strokeWidth="3" />
      <rect x="112" y="68" width="16" height="16" rx="3" fill="#b0642a" stroke="#241a10" strokeWidth="2.5" />
      <circle cx="94" cy="100" r="3" fill="#5a5a52" /><circle cx="146" cy="100" r="3" fill="#5a5a52" />
      {/* brows + eyes */}
      <path d="M86 130 L112 138 M154 130 L128 138" stroke="#2e4a10" strokeWidth="6" strokeLinecap="round" />
      <ellipse cx="100" cy="144" rx="10" ry="8" fill="#fff36b" stroke="#2e4a10" strokeWidth="2.2" /><ellipse cx="140" cy="144" rx="10" ry="8" fill="#fff36b" stroke="#2e4a10" strokeWidth="2.2" />
      <circle cx="103" cy="145" r="3.6" fill="#1a1a08" /><circle cx="137" cy="145" r="3.6" fill="#1a1a08" />
      <circle cx="104" cy="143" r="1.3" fill="#fff" /><circle cx="138" cy="143" r="1.3" fill="#fff" />
      {/* nose */}
      <path d="M120 146 C108 166 112 176 124 174 C134 172 132 162 126 156" fill="#7fb63a" stroke="#2e4a10" strokeWidth="2.5" strokeLinejoin="round" />
      {/* grin */}
      <path d="M86 180 Q120 204 154 180 Q120 188 86 180Z" fill="#2a0e08" stroke="#2e4a10" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M96 184 L100 194 L105 187 M110 189 L114 199 L118 190 M124 190 L128 199 L132 189 M139 187 L143 194 L147 184" fill="#fffbe9" stroke="#2a0e08" strokeWidth="1.5" strokeLinejoin="round" />
    </g>
  );
}

const PORTRAITS: Record<ArcId, (p: PProps) => React.ReactElement> = { elf: Elf, lizard: Lizard, caveman: Caveman, dragon: Dragon, goblin: Goblin };
