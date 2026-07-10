'use client';

import ProgressRing from '@/components/fitness/meals/ProgressRing';
import type { MealNutritionSummary } from '@/lib/fitness/meals/types';

type NutritionSummaryProps = {
  summary?: MealNutritionSummary | null;
};

export default function NutritionSummary({ summary }: NutritionSummaryProps) {
  if (!summary) {
    return (
      <section className="rounded-2xl border border-border bg-card p-5">
        <h2 className="text-sm font-semibold text-foreground">Nutrition Summary</h2>
        <div className="mt-4 flex min-h-28 items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 px-4 text-center text-sm text-muted-foreground">
          No nutrition summary available yet.
        </div>
      </section>
    );
  }

  const remaining = {
    calories: Math.max(0, summary.calories.goal - summary.calories.current),
    protein: Math.max(0, summary.protein.goal - summary.protein.current),
    carbs: Math.max(0, summary.carbs.goal - summary.carbs.current),
    fats: Math.max(0, summary.fats.goal - summary.fats.current),
  };

  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-5">
        <h2 className="text-sm font-semibold text-foreground">Nutrition Summary</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Progress rings for today&apos;s macro targets.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
        <ProgressRing
          label="Calories"
          current={summary.calories.current}
          goal={summary.calories.goal}
          unit=" kcal"
        />
        <ProgressRing
          label="Protein"
          current={summary.protein.current}
          goal={summary.protein.goal}
          unit="g"
        />
        <ProgressRing
          label="Carbs"
          current={summary.carbs.current}
          goal={summary.carbs.goal}
          unit="g"
        />
        <ProgressRing
          label="Fats"
          current={summary.fats.current}
          goal={summary.fats.goal}
          unit="g"
        />
      </div>

      <div className="mt-5 border-t border-border pt-4">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          Remaining Macros
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <div className="rounded-lg border border-border bg-muted/20 px-3 py-2">
            <p className="text-[10px] text-muted-foreground">Calories</p>
            <p className="text-sm font-semibold text-foreground">
              {Math.round(remaining.calories)}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-muted/20 px-3 py-2">
            <p className="text-[10px] text-muted-foreground">Protein</p>
            <p className="text-sm font-semibold text-foreground">
              {Math.round(remaining.protein)}g
            </p>
          </div>
          <div className="rounded-lg border border-border bg-muted/20 px-3 py-2">
            <p className="text-[10px] text-muted-foreground">Carbs</p>
            <p className="text-sm font-semibold text-foreground">
              {Math.round(remaining.carbs)}g
            </p>
          </div>
          <div className="rounded-lg border border-border bg-muted/20 px-3 py-2">
            <p className="text-[10px] text-muted-foreground">Fats</p>
            <p className="text-sm font-semibold text-foreground">
              {Math.round(remaining.fats)}g
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
