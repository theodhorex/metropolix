export default function SiteFooter() {
  return (
    <footer className="mt-8">
      <div className="pixel-divider" aria-hidden="true" />
      <div className="bg-[var(--slab)] px-4 py-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-display text-xl font-bold text-[var(--gold)]">Metropolix</p>
          <ul className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            <li>
              <a href="https://github.com/theodhorex/metropolix" target="_blank" rel="noopener noreferrer" className="font-bold underline underline-offset-4">
                GitHub<span className="sr-only"> (opens in a new tab)</span>
              </a>
            </li>
            <li>Built for NEAR</li>
          </ul>
        </div>
        <p className="mx-auto mt-4 max-w-6xl text-xs text-[var(--paper-dim)]">Pixel art, peoples and world drawn for Metropolix.</p>
      </div>
    </footer>
  );
}
