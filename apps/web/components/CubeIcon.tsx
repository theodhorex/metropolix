import { shadeHex } from '@/lib/ui';

/** Small isometric cube used as a building icon in the shop and market. */
export default function CubeIcon({ color, size = 40, height = 1 }: { color: string; size?: number; height?: number }) {
  const h = 10 + Math.round(height * 9);
  const w = 20, d = 10;
  const top = `${w},${24 - h} ${2 * w},${24 - h + d} ${w},${24 - h + 2 * d} 0,${24 - h + d}`;
  const left = `0,${24 - h + d} ${w},${24 - h + 2 * d} ${w},${24 + 2 * d} 0,${24 + d}`;
  const right = `${w},${24 - h + 2 * d} ${2 * w},${24 - h + d} ${2 * w},${24 + d} ${w},${24 + 2 * d}`;
  return (
    <svg width={size} height={size} viewBox="0 0 40 52" aria-hidden>
      <polygon points={left} fill={shadeHex(color, 0.65)} stroke="#0008" />
      <polygon points={right} fill={shadeHex(color, 0.82)} stroke="#0008" />
      <polygon points={top} fill={shadeHex(color, 1.1)} stroke="#0008" />
    </svg>
  );
}
