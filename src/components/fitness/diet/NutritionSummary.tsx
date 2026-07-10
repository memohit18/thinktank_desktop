'use client';

import MacroCard from '@/components/fitness/diet/MacroCard';
import type { DietMacroProgress, DietNutritionSummary } from '@/lib/fitness/diet/types';

type NutritionSummaryProps = {
  nutrition?: DietNutritionSummary | null;
  hydration?: DietMacroProgress | null;
  hydrationQuickAddsMl?: number[];
  isUpdatingHydration?: boolean;
  onAddHydration?: (amountMl?: number) => void;
};

export default function NutritionSummary({
  nutrition,
  hydration,
  hydrationQuickAddsMl = [250],
  isUpdatingHydration = false,
  onAddHydration,
}: NutritionSummaryProps) {
  if (!nutrition && !hydration) {
    return (
      <section className="rounded-2xl border border-border bg-card p-5">
        <h2 className="text-sm font-semibold text-foreground">Daily Fulfillment</h2>
        <div className="mt-4 flex min-h-28 items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 px-4 text-center text-sm text-muted-foreground">
          No nutrition summary available for this plan.
        </div>
      </section>
    );
  }

  // Hydration is normalized to liters in the planner unwrap.
  const waterProgress = nutrition?.water ?? hydration ?? null;
  const quickAdds =
    hydrationQuickAddsMl.length > 0 ? hydrationQuickAddsMl : [250];

  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-5">
        <h2 className="text-sm font-semibold text-foreground">Daily Fulfillment</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Track progress against your daily macro targets.
        </p>
      </div>

      {nutrition ? (
        <div className="space-y-4">
          <MacroCard
            label="Calories"
            progress={nutrition.calories}
            unit=" kcal"
            tone="accent"
          />
          <MacroCard label="Protein" progress={nutrition.protein} unit="g" />
          <MacroCard label="Carbohydrates" progress={nutrition.carbs} unit="g" />
          <MacroCard label="Fats" progress={nutrition.fats} unit="g" />
        </div>
      ) : null}

      <div className="mt-5 grid gap-3 border-t border-border pt-5 sm:grid-cols-2">
        {waterProgress ? (
          <div className="rounded-xl border border-border bg-muted/20 px-3 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Water Goal
            </p>
            <p className="mt-1 text-sm font-semibold text-foreground">
              {waterProgress.current.toFixed(1)}
              {waterProgress.goal > 0
                ? `/${waterProgress.goal.toFixed(1)}L`
                : 'L'}
            </p>
            {onAddHydration ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {quickAdds.slice(0, 2).map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    disabled={isUpdatingHydration}
                    onClick={() => onAddHydration(amount)}
                    className="text-xs font-semibold text-accent hover:underline disabled:opacity-60"
                  >
                    +{amount} ml
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        ) : onAddHydration ? (
          <div className="rounded-xl border border-border bg-muted/20 px-3 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Water Goal
            </p>
            <p className="mt-1 text-sm text-muted-foreground">Not tracked yet</p>
            <button
              type="button"
              disabled={isUpdatingHydration}
              onClick={() => onAddHydration(250)}
              className="mt-2 text-xs font-semibold text-accent hover:underline disabled:opacity-60"
            >
              +250 ml
            </button>
          </div>
        ) : null}

        {nutrition?.fiber ? (
          <div className="rounded-xl border border-border bg-muted/20 px-3 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Fiber Goal
            </p>
            <p className="mt-1 text-sm font-semibold text-foreground">
              {Math.round(nutrition.fiber.current)}/{Math.round(nutrition.fiber.goal)}g
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
