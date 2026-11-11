import type { Metadata } from 'next';
import { Atkinson_Hyperlegible, Fraunces, Noto_Sans_KR, Noto_Sans_SC, Noto_Serif_KR, Noto_Serif_SC, Pixelify_Sans } from 'next/font/google';
import './globals.css';

const body = Atkinson_Hyperlegible({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-body', display: 'swap' });
const serif = Fraunces({ subsets: ['latin'], weight: ['400', '500'], style: ['normal', 'italic'], variable: '--font-serif', display: 'swap' });
const display = Pixelify_Sans({ subsets: ['latin'], weight: ['500', '700'], variable: '--font-display', display: 'swap' });
// Korean and Chinese for the landing languages. Not preloaded: Google serves them in small unicode-range
// slices, so a visitor reading English never downloads a byte of Hangul or Han.
const kr = Noto_Sans_KR({ weight: ['400', '700'], variable: '--font-kr', display: 'swap', preload: false });
const sc = Noto_Sans_SC({ weight: ['400', '700'], variable: '--font-sc', display: 'swap', preload: false });
const krSerif = Noto_Serif_KR({ weight: ['500'], variable: '--font-kr-serif', display: 'swap', preload: false });
const scSerif = Noto_Serif_SC({ weight: ['500'], variable: '--font-sc-serif', display: 'swap', preload: false });

export const metadata: Metadata = {
  title: 'Metropolix',
  description: 'On-chain city builder with a real economy and ChainPower.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${body.variable} ${display.variable} ${serif.variable} ${kr.variable} ${sc.variable} ${krSerif.variable} ${scSerif.variable}`}>
      <body>{children}</body>
    </html>
  );
}
