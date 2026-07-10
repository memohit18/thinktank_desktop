'use client';

import { History, RefreshCw } from 'lucide-react';
import { formatMealGoalLabel } from '@/lib/fitness/meals/mealResponse';
import type { ActiveMealPlan, TodayMeals } from '@/lib/fitness/meals/types';

type MealHeroProps = {
  today?: TodayMeals | null;
  active?: ActiveMealPlan | null;
  calories?: number;
  protein?: number;
  calorieGoal?: number;
  proteinGoal?: number;
  mealsRemaining?: number;
  isRefreshing?: boolean;
  onRefresh?: () => void;
  onOpenHistory?: () => void;
  onGenerate?: () => void;
  isGenerating?: boolean;
};

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-muted/20 px-4 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold capitalize text-foreground">
        {value}
      </p>
    </div>
  );
}

export default function MealHero({
  today,
  active,
  calories = 0,
  protein = 0,
  calorieGoal,
  proteinGoal,
  mealsRemaining = 0,
  isRefreshing = false,
  onRefresh,
  onOpenHistory,
  onGenerate,
  isGenerating = false,
}: MealHeroProps) {
  const version = today?.version ?? active?.version;
  const goal = today?.goal ?? active?.goal;
  const status = active?.status ?? 'ACTIVE';

  return (
    <section className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 sm:p-8">
      <div className="absolute inset-0 bg-gradient-to-br from-accent/15 via-transparent to-accent/5" />
      <div className="relative space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                Meal Planner
              </p>
              {version ? (
                <span className="rounded-full border border-accent/20 bg-accent/10 px-2.5 py-0.5 text-[10px] font-semibold text-accent">
                  v{version}
                </span>
              ) : null}
              <span className="rounded-full border border-border bg-muted px-2.5 py-0.5 text-[10px] font-semibold uppercase text-muted-foreground">
                {status}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
                Today&apos;s Meals
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                Track completion, macros, and swaps for{' '}
                <span className="font-semibold capitalize text-foreground">
                  {formatMealGoalLabel(goal)}
                </span>
                {today?.date ? ` · ${today.date}` : ''}.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {onOpenHistory ? (
              <button
                type="button"
                onClick={onOpenHistory}
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
              >
                <History className="size-3.5" />
                History
              </button>
            ) : null}
            {onRefresh ? (
              <button
                type="button"
                onClick={onRefresh}
                disabled={isRefreshing}
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted disabled:opacity-60"
              >
                <RefreshCw
                  className={`size-3.5 ${isRefreshing ? 'animate-spin' : ''}`}
                />
                Refresh
              </button>
            ) : null}
            {onGenerate ? (
              <button
                type="button"
                onClick={onGenerate}
                disabled={isGenerating}
                className="inline-flex items-center gap-2 rounded-xl bg-accent px-3 py-2 text-xs font-semibold text-accent-foreground shadow-[0_0_16px_var(--neon-glow)] transition-opacity hover:opacity-90 disabled:opacity-60 dark:text-black"
              >
                {isGenerating ? 'Generating…' : 'Generate Plan'}
              </button>
            ) : null}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <StatCard
            label="Calories"
            value={
              calorieGoal && calorieGoal > 0
                ? `${Math.round(calories).toLocaleString()} / ${Math.round(calorieGoal).toLocaleString()} kcal`
                : `${Math.round(calories).toLocaleString()} kcal`
            }
          />
          <StatCard
            label="Protein"
            value={
              proteinGoal && proteinGoal > 0
                ? `${Math.round(protein)} / ${Math.round(proteinGoal)} g`
                : `${Math.round(protein)} g`
            }
          />
          <StatCard
            label="Meals Remaining"
            value={`${Math.max(0, mealsRemaining)}`}
          />
        </div>
      </div>
    </section>
  );
}
