'use client';

import { useState } from 'react';
import { Check, NotebookPen, Replace, SkipForward, UtensilsCrossed } from 'lucide-react';
import MealNotesDialog from '@/components/fitness/execution/MealNotesDialog';
import PortionSelector from '@/components/fitness/execution/PortionSelector';
import { MEAL_TYPE_LABELS } from '@/lib/fitness/meals/constants';
import type { MealItem } from '@/lib/fitness/meals/types';

type MealExecutionCardProps = {
  meal: MealItem;
  isActing?: boolean;
  onLogPortion?: (
    mealId: string,
    consumedQuantity: number,
    notes?: string,
  ) => void | Promise<boolean>;
  onHalf?: (mealId: string) => void | Promise<boolean>;
  onSkip?: (mealId: string) => void | Promise<boolean>;
  onReplace?: (mealId: string) => void;
  onCustomFood?: (mealId: string) => void;
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
  if (normalized === 'completed' || normalized === 'partial') {
    return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
  }
  if (normalized === 'skipped') {
    return 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400';
  }
  return 'border-border bg-muted text-muted-foreground';
}

export default function MealExecutionCard({
  meal,
  isActing = false,
  onLogPortion,
  onHalf,
  onSkip,
  onReplace,
  onCustomFood,
}: MealExecutionCardProps) {
  const [portion, setPortion] = useState(1);
  const [notesOpen, setNotesOpen] = useState(false);

  const isDone =
    meal.status === 'completed' ||
    meal.status === 'skipped' ||
    meal.status === 'replaced' ||
    meal.status === 'partial';

  const scaled = (value: number) => Math.round(value * portion);

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

          {!isDone ? (
            <div className="space-y-1.5">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Portion
              </p>
              <PortionSelector
                value={portion}
                onChange={setPortion}
                disabled={isActing}
              />
            </div>
          ) : null}

          <div className="grid grid-cols-4 gap-2">
            <MacroChip label="Cals" value={`${scaled(meal.calories)}`} />
            <MacroChip label="P" value={`${scaled(meal.protein)}g`} />
            <MacroChip label="C" value={`${scaled(meal.carbs)}g`} />
            <MacroChip label="F" value={`${scaled(meal.fats)}g`} />
          </div>

          {!isDone ? (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {onLogPortion ? (
                <button
                  type="button"
                  disabled={isActing}
                  onClick={() => void onLogPortion(meal.id, portion)}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-accent px-3 py-2 text-xs font-semibold text-accent-foreground disabled:opacity-50 dark:text-black"
                >
                  <Check className="size-3.5" />
                  {portion === 1
                    ? 'Ate'
                    : portion === 0.5
                      ? 'Half'
                      : `Ate ${Math.round(portion * 100)}%`}
                </button>
              ) : null}
              {onHalf ? (
                <button
                  type="button"
                  disabled={isActing}
                  onClick={() => void onHalf(meal.id)}
                  className="inline-flex items-center justify-center rounded-xl border border-border bg-muted/30 px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted disabled:opacity-50"
                >
                  Half Portion
                </button>
              ) : null}
              {onSkip ? (
                <button
                  type="button"
                  disabled={isActing}
                  onClick={() => void onSkip(meal.id)}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-muted/30 px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted disabled:opacity-50"
                >
                  <SkipForward className="size-3.5" />
                  Skipped
                </button>
              ) : null}
              {onReplace && meal.canSwap !== false ? (
                <button
                  type="button"
                  disabled={isActing}
                  onClick={() => onReplace(meal.id)}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-muted/30 px-3 py-2 text-xs font-semibold text-accent hover:bg-muted disabled:opacity-50"
                >
                  <Replace className="size-3.5" />
                  Replace
                </button>
              ) : null}
              {onCustomFood && meal.canSwap !== false ? (
                <button
                  type="button"
                  disabled={isActing}
                  onClick={() => onCustomFood(meal.id)}
                  className="inline-flex items-center justify-center rounded-xl border border-border bg-muted/30 px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted disabled:opacity-50"
                >
                  Custom Food
                </button>
              ) : null}
              <button
                type="button"
                disabled={isActing}
                onClick={() => setNotesOpen(true)}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-muted/30 px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted disabled:opacity-50"
              >
                <NotebookPen className="size-3.5" />
                Add Note
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <MealNotesDialog
        open={notesOpen}
        mealName={meal.name}
        isSubmitting={isActing}
        onClose={() => setNotesOpen(false)}
        onSave={(notes) => {
          setNotesOpen(false);
          if (onLogPortion) void onLogPortion(meal.id, portion, notes || undefined);
        }}
      />
    </article>
  );
}
