import type { Metadata } from 'next';
import Hero from '@/components/landing/Hero';
import SiteNav from '@/components/landing/SiteNav';
import Peoples from '@/components/landing/Peoples';
import HowItPlays from '@/components/landing/HowItPlays';
import World from '@/components/landing/World';
import OnChain from '@/components/landing/OnChain';
import FAQ from '@/components/landing/FAQ';
import FinalCta from '@/components/landing/FinalCta';
import SiteFooter from '@/components/landing/SiteFooter';
import CursorTrail from '@/components/landing/motion/CursorTrail';
import MagneticFx from '@/components/landing/motion/MagneticFx';
import PrefsToggle from '@/components/landing/prefs/PrefsToggle';
import { PREFS_BOOT } from '@/components/landing/prefs/boot';
import '@/components/landing/landing.css';

export const metadata: Metadata = {
  title: 'Metropolix · Ten minutes to rule a fantasy realm',
  description: 'A pixel fantasy city builder headed for NEAR. Pick a people, raise a city and raid rival mayors, right in your browser.',
};

// The front gate of the realm. The game itself lives at /play.
export default function LandingPage() {
  return (
    <main data-page="landing" data-theme="light" data-lang="en" suppressHydrationWarning className="min-h-dvh overflow-x-clip">
      {/* applies a saved theme and language before the first paint */}
      <script dangerouslySetInnerHTML={{ __html: PREFS_BOOT }} />
      <SiteNav />
      <Hero />
      <Peoples />
      <HowItPlays />
      <World />
      <OnChain />
      <FAQ />
      <FinalCta />
      <SiteFooter />
      <PrefsToggle />
      <CursorTrail />
      <MagneticFx />
    </main>
  );
}
