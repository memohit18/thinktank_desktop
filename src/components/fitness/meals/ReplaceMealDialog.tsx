'use client';

import { useMemo, useState } from 'react';
import { Loader2, Search, X } from 'lucide-react';
import { useFoods } from '@/hooks/useFoods';
import type { Food } from '@/lib/fitness/food/types';

type ReplaceMealDialogProps = {
  open: boolean;
  mealName?: string;
  isSubmitting?: boolean;
  onClose: () => void;
  onConfirm: (foodId: string, quantity: number) => void;
};

export default function ReplaceMealDialog({
  open,
  mealName,
  isSubmitting = false,
  onClose,
  onConfirm,
}: ReplaceMealDialogProps) {
  const {
    foods,
    search,
    setSearch,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useFoods();
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [quantity, setQuantity] = useState('1');

  const quantityValue = useMemo(() => {
    const parsed = Number(quantity);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
  }, [quantity]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 backdrop-blur-sm sm:items-center">
      <button
        type="button"
        aria-label="Close replace meal dialog"
        className="absolute inset-0"
        onClick={onClose}
      />
      <div className="relative z-10 flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-foreground">Replace Meal</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {mealName
                ? `Choose a food to replace “${mealName}”.`
                : 'Choose a replacement food.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="space-y-3 border-b border-border px-5 py-4">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search foods…"
              className="w-full rounded-xl border border-border bg-card py-2.5 pl-10 pr-3 text-sm text-foreground outline-none ring-accent focus:ring-2"
            />
          </label>
          <label className="block text-xs text-muted-foreground">
            Quantity
            <input
              type="number"
              min="0.25"
              step="0.25"
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
              className="mt-1 w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground outline-none ring-accent focus:ring-2"
            />
          </label>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {isLoading || isFetching ? (
            <div className="flex min-h-32 items-center justify-center text-muted-foreground">
              <Loader2 className="size-5 animate-spin" />
            </div>
          ) : isError ? (
            <div className="flex min-h-32 flex-col items-center justify-center gap-3 text-center">
              <p className="text-sm text-muted-foreground">
                Could not load foods.
              </p>
              <button
                type="button"
                onClick={() => void refetch()}
                className="text-xs font-semibold text-accent hover:underline"
              >
                Retry
              </button>
            </div>
          ) : foods.length === 0 ? (
            <div className="flex min-h-32 items-center justify-center text-sm text-muted-foreground">
              No foods found.
            </div>
          ) : (
            <ul className="space-y-2">
              {foods.map((food) => {
                const isSelected = selectedFood?.id === food.id;
                return (
                  <li key={food.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedFood(food)}
                      className={`flex w-full items-start justify-between gap-3 rounded-xl border px-3 py-3 text-left transition-colors ${
                        isSelected
                          ? 'border-accent/40 bg-accent/10'
                          : 'border-border bg-card hover:border-accent/30'
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {food.name}
                        </p>
                        <p className="mt-1 text-[11px] text-muted-foreground">
                          {food.calories != null
                            ? `${Math.round(food.calories)} kcal`
                            : '—'}
                          {food.protein != null
                            ? ` · P ${Math.round(food.protein)}g`
                            : ''}
                        </p>
                      </div>
                      {isSelected ? (
                        <span className="text-[10px] font-semibold uppercase text-accent">
                          Selected
                        </span>
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="flex gap-2 border-t border-border px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!selectedFood || isSubmitting}
            onClick={() => {
              if (!selectedFood) return;
              onConfirm(selectedFood.id, quantityValue);
            }}
            className="flex-1 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground shadow-[0_0_16px_var(--neon-glow)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 dark:text-black"
          >
            {isSubmitting ? 'Replacing…' : 'Replace'}
          </button>
        </div>
      </div>
    </div>
  );
}
