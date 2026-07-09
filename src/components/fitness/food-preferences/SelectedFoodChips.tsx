'use client';

import { X } from 'lucide-react';
import type { Food } from '@/lib/fitness/food/types';

type SelectedFoodChipsProps = {
  foods: Food[];
  selectedIds: string[];
  onRemove: (foodId: string) => void;
  emptyLabel?: string;
};

export default function SelectedFoodChips({
  foods,
  selectedIds,
  onRemove,
  emptyLabel = 'No foods selected yet.',
}: SelectedFoodChipsProps) {
  if (selectedIds.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-6 text-center text-sm text-muted-foreground">
        {emptyLabel}
      </p>
    );
  }

  const foodMap = new Map(foods.map((food) => [food.id, food]));

  return (
    <div className="flex flex-wrap gap-2">
      {selectedIds.map((foodId) => {
        const food = foodMap.get(foodId);
        return (
          <span
            key={foodId}
            className="inline-flex items-center gap-1.5 rounded-full border border-accent/20 bg-accent/10 px-3 py-1.5 text-xs font-medium text-foreground"
          >
            {food?.name ?? foodId}
            <button
              type="button"
              aria-label={`Remove ${food?.name ?? foodId}`}
              onClick={() => onRemove(foodId)}
              className="rounded-full p-0.5 text-muted-foreground transition-colors hover:bg-accent/20 hover:text-foreground"
            >
              <X className="size-3" />
            </button>
          </span>
        );
      })}
    </div>
  );
}
