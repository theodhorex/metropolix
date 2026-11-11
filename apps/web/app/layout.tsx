import type { Metadata } from 'next';
import { Atkinson_Hyperlegible, Fraunces, Pixelify_Sans } from 'next/font/google';
import './globals.css';

const body = Atkinson_Hyperlegible({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-body', display: 'swap' });
const serif = Fraunces({ subsets: ['latin'], weight: ['400', '500'], style: ['normal', 'italic'], variable: '--font-serif', display: 'swap' });
const display = Pixelify_Sans({ subsets: ['latin'], weight: ['500', '700'], variable: '--font-display', display: 'swap' });

export const metadata: Metadata = {
  title: 'Metropolix',
  description: 'On-chain city builder with a real economy and ChainPower.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${body.variable} ${display.variable} ${serif.variable}`}>
      <body>{children}</body>
    </html>
  );
}
