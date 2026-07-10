'use client';

import { ShoppingBasket } from 'lucide-react';
import type { DietGroceryPreview } from '@/lib/fitness/diet/types';

type GroceryPreviewProps = {
  grocery?: DietGroceryPreview | null;
  onGenerateList?: () => void;
};

export default function GroceryPreview({
  grocery,
  onGenerateList,
}: GroceryPreviewProps) {
  const items = grocery?.items?.slice(0, 6) ?? [];

  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Grocery Preview</h2>
          <p className="mt-1 text-xs text-muted-foreground">Top items for this week</p>
        </div>
        <div className="flex size-9 items-center justify-center rounded-lg bg-accent/10 text-accent">
          <ShoppingBasket className="size-4" />
        </div>
      </div>

      {items.length === 0 ? (
        <div className="flex min-h-28 items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 px-4 text-center text-sm text-muted-foreground">
          No grocery items available for this plan.
        </div>
      ) : (
        <ul className="space-y-2">
          {items.map((item, index) => (
            <li
              key={item.id ?? `${item.name}-${index}`}
              className="flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/20 px-3 py-2.5"
            >
              <span className="truncate text-sm font-medium text-foreground">
                {item.name}
              </span>
              {item.quantity ? (
                <span className="shrink-0 text-xs text-muted-foreground">
                  {item.quantity}
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      {typeof grocery?.estimatedWeeklyCost === 'number' ? (
        <p className="mt-4 text-sm text-muted-foreground">
          Estimated Weekly Cost:{' '}
          <span className="font-semibold text-foreground">
            {grocery.currency === 'INR' || !grocery.currency ? '₹' : `${grocery.currency} `}
            {grocery.estimatedWeeklyCost.toFixed(2)}
          </span>
        </p>
      ) : null}

      {onGenerateList ? (
        <button
          type="button"
          onClick={onGenerateList}
          className="mt-4 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
        >
          Generate Grocery List
        </button>
      ) : null}
    </section>
  );
}
