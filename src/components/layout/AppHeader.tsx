'use client';

export default function AppHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center border-b border-border bg-card/95 px-6 backdrop-blur">
      <label className="relative w-full max-w-xl">
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          placeholder="Search questions..."
          className="w-full rounded-full border border-border bg-muted/60 py-2 pl-10 pr-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-accent"
        />
      </label>
    </header>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}
