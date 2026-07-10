'use client';

import { UtensilsCrossed } from 'lucide-react';
import { DIET_MEAL_LABELS } from '@/lib/fitness/diet/constants';
import type { DietMeal } from '@/lib/fitness/diet/types';

type MealCardProps = {
  meal: DietMeal;
  onReplace?: (mealId: string) => void;
};

function MacroChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-muted/40 px-2.5 py-1.5 text-center">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5 text-xs font-semibold text-foreground">{value}</p>
    </div>
  );
}

export default function MealCard({ meal, onReplace }: MealCardProps) {
  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          {DIET_MEAL_LABELS[meal.type]}
        </p>
        {onReplace ? (
          <button
            type="button"
            onClick={() => onReplace(meal.id)}
            className="text-xs font-semibold text-accent transition-opacity hover:opacity-80"
          >
            Replace
          </button>
        ) : null}
      </div>

      <div className="flex flex-col gap-4 p-4 sm:flex-row">
        <div className="relative h-28 w-full shrink-0 overflow-hidden rounded-xl border border-border bg-muted/30 sm:h-28 sm:w-36">
          {meal.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={meal.imageUrl}
              alt={meal.name}
              className="size-full object-cover"
            />
          ) : (
            <div className="flex size-full items-center justify-center text-muted-foreground">
              <UtensilsCrossed className="size-6" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-semibold text-foreground">{meal.name}</h3>
              {meal.scheduledTime ? (
                <span className="rounded-md border border-border bg-muted/40 px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                  {meal.scheduledTime}
                </span>
              ) : null}
            </div>
            {meal.servingSize ? (
              <p className="mt-1 text-xs text-muted-foreground">
                Serving: {meal.servingSize}
              </p>
            ) : null}
          </div>

          <div className="grid grid-cols-4 gap-2">
            <MacroChip label="Cals" value={`${Math.round(meal.calories)}`} />
            <MacroChip label="P" value={`${Math.round(meal.protein)}g`} />
            <MacroChip label="C" value={`${Math.round(meal.carbs)}g`} />
            <MacroChip label="F" value={`${Math.round(meal.fats)}g`} />
          </div>
        </div>
      </div>
    </article>
  );
}
