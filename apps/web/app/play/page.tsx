import type { Metadata } from 'next';
import Game from '@/components/Game';

export const metadata: Metadata = { title: 'Play · Metropolix' };

export default function PlayPage() {
  return <Game />;
}
