'use client';

import { Search } from 'lucide-react';

type FoodSearchProps = {
  value: string;
  onChange: (value: string) => void;
  resultCount?: number;
};

export default function FoodSearch({
  value,
  onChange,
  resultCount,
}: FoodSearchProps) {
  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <label className="block">
        <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Search foods
        </span>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder="Search by food name or category..."
            className="w-full rounded-xl border border-border bg-background py-3 pl-10 pr-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
        </div>
      </label>
      {typeof resultCount === 'number' ? (
        <p className="mt-2 text-xs text-muted-foreground">
          {resultCount} food{resultCount === 1 ? '' : 's'} matching your filters
        </p>
      ) : null}
    </section>
  );
}
