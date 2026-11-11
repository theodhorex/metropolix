import type { Metadata } from 'next';
import Game from '@/components/Game';
import ArriveFade from '@/components/enter/ArriveFade';

export const metadata: Metadata = { title: 'Play · Metropolix' };

export default function PlayPage() {
  return (
    <>
      <Game />
      <ArriveFade />
    </>
  );
}
