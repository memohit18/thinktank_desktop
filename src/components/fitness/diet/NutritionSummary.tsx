'use client';

import MacroCard from '@/components/fitness/diet/MacroCard';
import type {
  DietMacroProgress,
  DietNutritionSummary,
  DietVitals,
} from '@/lib/fitness/diet/types';

type NutritionSummaryProps = {
  nutrition?: DietNutritionSummary | null;
  hydration?: DietMacroProgress | null;
  hydrationQuickAddsMl?: number[];
  vitals?: DietVitals | null;
  dietCompliance?: number | null;
  mealsCompleted?: number | null;
  mealsAssigned?: number | null;
  mealsSkipped?: number | null;
  isUpdatingHydration?: boolean;
  onAddHydration?: (amountMl?: number) => void;
};

export default function NutritionSummary({
  nutrition,
  hydration,
  hydrationQuickAddsMl = [250],
  vitals,
  dietCompliance,
  mealsCompleted,
  mealsAssigned,
  mealsSkipped,
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

      {(mealsAssigned != null || dietCompliance != null) && (
        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="rounded-lg border border-border bg-muted/20 px-2.5 py-2 text-center">
            <p className="text-[10px] uppercase text-muted-foreground">Done</p>
            <p className="text-sm font-semibold text-foreground">
              {mealsCompleted ?? 0}/{mealsAssigned ?? 0}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-muted/20 px-2.5 py-2 text-center">
            <p className="text-[10px] uppercase text-muted-foreground">Skipped</p>
            <p className="text-sm font-semibold text-foreground">
              {mealsSkipped ?? 0}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-muted/20 px-2.5 py-2 text-center">
            <p className="text-[10px] uppercase text-muted-foreground">Compliance</p>
            <p className="text-sm font-semibold text-foreground">
              {Math.round(dietCompliance ?? 0)}%
            </p>
          </div>
        </div>
      )}

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
                {quickAdds.map((amount) => (
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
        ) : null}

        {(nutrition?.fiber || vitals?.fiber) && (
          <div className="rounded-xl border border-border bg-muted/20 px-3 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Fiber Goal
            </p>
            <p className="mt-1 text-sm font-semibold text-foreground">
              {Math.round((nutrition?.fiber ?? vitals?.fiber)?.current ?? 0)}/
              {Math.round((nutrition?.fiber ?? vitals?.fiber)?.goal ?? 0)}g
            </p>
          </div>
        )}

        {vitals?.sodium ? (
          <div className="rounded-xl border border-border bg-muted/20 px-3 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Sodium
            </p>
            <p className="mt-1 text-sm font-semibold text-foreground">
              {vitals.sodium.label || vitals.sodium.status || '—'}
            </p>
            {vitals.sodium.estimated ? (
              <p className="mt-1 text-[10px] text-muted-foreground">Estimated</p>
            ) : null}
          </div>
        ) : null}

        {vitals?.caffeine ? (
          <div className="rounded-xl border border-border bg-muted/20 px-3 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Caffeine
            </p>
            <p className="mt-1 text-sm font-semibold text-foreground">
              {vitals.caffeine.current != null
                ? `${Math.round(vitals.caffeine.current)} mg`
                : vitals.caffeine.status || '—'}
            </p>
            {vitals.caffeine.note ? (
              <p className="mt-1 text-[10px] text-muted-foreground">
                {vitals.caffeine.note}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
