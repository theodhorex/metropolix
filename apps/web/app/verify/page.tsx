import type { Metadata } from 'next';
import Verify from '@/components/Verify';

export const metadata: Metadata = {
  title: 'Verify · Metropolix',
  description: 'Recompute every saved city and the $METRO backing from raw NEAR testnet data, in your browser.',
};

export default function VerifyPage() {
  return <Verify />;
}
