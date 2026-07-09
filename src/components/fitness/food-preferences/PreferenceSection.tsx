'use client';

import SelectedFoodChips from '@/components/fitness/food-preferences/SelectedFoodChips';
import type { Food } from '@/lib/fitness/food/types';

type PreferenceSectionProps = {
  title: string;
  description: string;
  requirement?: string;
  foods: Food[];
  selectedIds: string[];
  onRemove: (foodId: string) => void;
  error?: string;
  emptyLabel?: string;
};

export default function PreferenceSection({
  title,
  description,
  requirement,
  foods,
  selectedIds,
  onRemove,
  error,
  emptyLabel,
}: PreferenceSectionProps) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground">{title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="rounded-full border border-border bg-muted/30 px-2.5 py-1 font-semibold text-foreground">
            {selectedIds.length} selected
          </span>
          {requirement ? (
            <span className="text-muted-foreground">{requirement}</span>
          ) : null}
        </div>
      </div>

      <SelectedFoodChips
        foods={foods}
        selectedIds={selectedIds}
        onRemove={onRemove}
        emptyLabel={emptyLabel}
      />

      {error ? <p className="mt-3 text-xs text-red-500">{error}</p> : null}
    </section>
  );
}
