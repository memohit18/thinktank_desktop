'use client';

import { UtensilsCrossed } from 'lucide-react';
import CompleteButton from '@/components/fitness/meals/CompleteButton';
import SkipButton from '@/components/fitness/meals/SkipButton';
import { MEAL_TYPE_LABELS } from '@/lib/fitness/meals/constants';
import type { MealItem } from '@/lib/fitness/meals/types';

type MealCardProps = {
  meal: MealItem;
  isActing?: boolean;
  onComplete?: (mealId: string) => void;
  onSkip?: (mealId: string) => void;
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

function statusStyles(status: string) {
  const normalized = status.toLowerCase();
  if (normalized === 'completed') {
    return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
  }
  if (normalized === 'skipped') {
    return 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400';
  }
  return 'border-border bg-muted text-muted-foreground';
}

export default function MealCard({
  meal,
  isActing = false,
  onComplete,
  onSkip,
  onReplace,
}: MealCardProps) {
  const isDone =
    meal.status === 'completed' ||
    meal.status === 'skipped' ||
    meal.status === 'replaced';

  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            {MEAL_TYPE_LABELS[meal.type]}
          </p>
          {meal.scheduledTime ? (
            <span className="rounded-md border border-border bg-muted/40 px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
              {meal.scheduledTime}
            </span>
          ) : null}
        </div>
        <span
          className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase ${statusStyles(meal.status)}`}
        >
          {meal.status}
        </span>
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
            <h3 className="text-sm font-semibold text-foreground">{meal.name}</h3>
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

          {!isDone ? (
            <div className="flex flex-col gap-2 sm:flex-row">
              {onComplete ? (
                <CompleteButton
                  isLoading={isActing}
                  onClick={() => onComplete(meal.id)}
                />
              ) : null}
              {onSkip ? (
                <SkipButton
                  isLoading={isActing}
                  onClick={() => onSkip(meal.id)}
                />
              ) : null}
              {onReplace && meal.canSwap !== false ? (
                <button
                  type="button"
                  disabled={isActing}
                  onClick={() => onReplace(meal.id)}
                  className="inline-flex flex-1 items-center justify-center rounded-xl border border-border bg-muted/30 px-3 py-2 text-xs font-semibold text-accent transition-colors hover:bg-muted disabled:opacity-50"
                >
                  Replace
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}
