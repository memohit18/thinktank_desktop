'use client';

import type { FoodCategory } from '@/lib/fitness/food/types';

type CategoryTabsProps = {
  categories: FoodCategory[];
  activeCategoryId: string;
  onChange: (categoryId: string) => void;
};

export default function CategoryTabs({
  categories,
  activeCategoryId,
  onChange,
}: CategoryTabsProps) {
  const tabs = [{ id: 'all', name: 'All' }, ...categories];

  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Categories
      </p>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map((category) => {
          const isActive = activeCategoryId === category.id;

          return (
            <button
              key={category.id}
              type="button"
              onClick={() => onChange(category.id)}
              className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'border-accent bg-accent text-accent-foreground shadow-[0_0_16px_var(--neon-glow)] dark:text-black'
                  : 'border-border bg-muted/30 text-muted-foreground hover:border-accent/40 hover:text-foreground'
              }`}
            >
              <span>{category.name}</span>
              {typeof category.count === 'number' ? (
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                    isActive
                      ? 'bg-accent-foreground/15 text-accent-foreground dark:text-black'
                      : 'bg-background text-muted-foreground'
                  }`}
                >
                  {category.count}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </section>
  );
}
