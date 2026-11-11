import Link from 'next/link';

export default function FinalCta() {
  return (
    <section aria-labelledby="cta-h" className="px-4 py-16">
      <div className="window mx-auto max-w-3xl">
        <div className="flex flex-col items-center gap-5 bg-[var(--slab-lo)] px-6 py-12 text-center">
          <h2 id="cta-h" className="font-display text-4xl font-bold sm:text-5xl">Your realm is waiting.</h2>
          <Link href="/play" className="btn btn-gold px-8 py-3 text-xl">Play now</Link>
          <p className="text-sm text-[var(--paper-dim)]">Free, in your browser. Your city is saved on this device.</p>
        </div>
      </div>
    </section>
  );
}
