'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Save } from 'lucide-react';
import DietHero from '@/components/fitness/diet/DietHero';
import GroceryPreview from '@/components/fitness/diet/GroceryPreview';
import HistoryDrawer from '@/components/fitness/diet/HistoryDrawer';
import MealCard from '@/components/fitness/diet/MealCard';
import MealTabs from '@/components/fitness/diet/MealTabs';
import NutritionSummary from '@/components/fitness/diet/NutritionSummary';
import { useToast } from '@/components/ui/Toast';
import {
  DIET_DAY_FULL_LABELS,
  DIET_DAY_ORDER,
} from '@/lib/fitness/diet/constants';
import {
  getDateForDietDay,
  getDayMeals,
  getDietDayKeyFromDate,
} from '@/lib/fitness/diet/dietResponse';
import type {
  DietDayKey,
  DietHistoryItem,
  DietPlan,
  DietPlanner,
} from '@/lib/fitness/diet/types';

type DietDashboardProps = {
  diet: DietPlan;
  planner?: DietPlanner | null;
  history: DietHistoryItem[];
  isHistoryLoading?: boolean;
  isHistoryOpen: boolean;
  isRegenerating?: boolean;
  isActivating?: boolean;
  isDeleting?: boolean;
  isUpdatingHydration?: boolean;
  isPlannerFetching?: boolean;
  onOpenHistory: () => void;
  onCloseHistory: () => void;
  onRegenerate: () => void;
  onActivate?: (dietPlanId: string) => void;
  onDelete?: (dietPlanId: string) => void;
  onAddHydration?: (amountMl?: number) => void;
  onSelectPlannerDate?: (date: string) => void;
};

function downloadDietPdf(diet: DietPlan) {
  const lines = [
    'AI Diet Plan',
    `Goal: ${diet.goal ?? '—'}`,
    `Daily Calories: ${diet.dailyCalories}`,
    `Daily Protein: ${diet.dailyProtein}`,
    `Meals/Day: ${diet.mealsPerDay}`,
    `Duration: ${diet.durationWeeks} weeks`,
    `Version: ${diet.version ?? '—'}`,
    '',
  ];

  for (const day of diet.days) {
    lines.push(DIET_DAY_FULL_LABELS[day.day]);
    for (const meal of day.meals) {
      lines.push(
        `  - ${meal.type}: ${meal.name} (${meal.calories} kcal, P ${meal.protein}g, C ${meal.carbs}g, F ${meal.fats}g)`,
      );
    }
    lines.push('');
  }

  const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `diet-plan-${diet.id}.txt`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export default function DietDashboard({
  diet,
  planner,
  history,
  isHistoryLoading = false,
  isHistoryOpen,
  isRegenerating = false,
  isActivating = false,
  isDeleting = false,
  isUpdatingHydration = false,
  isPlannerFetching = false,
  onOpenHistory,
  onCloseHistory,
  onRegenerate,
  onActivate,
  onDelete,
  onAddHydration,
  onSelectPlannerDate,
}: DietDashboardProps) {
  const router = useRouter();
  const { showToast } = useToast();

  const plannerDay = getDietDayKeyFromDate(planner?.date);
  const weekAnchor = planner?.date ?? null;

  const [activeDay, setActiveDay] = useState<DietDayKey>('monday');
  const [hasSyncedPlannerDay, setHasSyncedPlannerDay] = useState(false);

  useEffect(() => {
    if (!hasSyncedPlannerDay && plannerDay) {
      setActiveDay(plannerDay);
      setHasSyncedPlannerDay(true);
    }
  }, [hasSyncedPlannerDay, plannerDay]);

  const meals = useMemo(() => {
    if (planner?.meals?.length && plannerDay === activeDay) {
      return planner.meals;
    }
    return getDayMeals(diet, activeDay);
  }, [activeDay, diet, planner?.meals, plannerDay]);

  const handleDayChange = (day: DietDayKey) => {
    setActiveDay(day);
    if (onSelectPlannerDate) {
      onSelectPlannerDate(getDateForDietDay(weekAnchor, day));
    }
  };

  return (
    <div className="space-y-6">
      <DietHero
        diet={diet}
        isRegenerating={isRegenerating}
        onRegenerate={onRegenerate}
        onOpenHistory={onOpenHistory}
        onDownloadPdf={() => {
          downloadDietPdf(diet);
          showToast('Diet plan downloaded.');
        }}
      />

      <div className="grid gap-6 lg:grid-cols-[1.45fr_0.85fr]">
        <section className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
            <div className="mb-4">
              <h2 className="text-base font-semibold text-foreground">
                Weekly Meal Plan
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {DIET_DAY_FULL_LABELS[activeDay]} meals
                {planner?.date ? ` · ${planner.date}` : ''}
              </p>
            </div>

            <MealTabs
              activeDay={activeDay}
              availableDays={DIET_DAY_ORDER}
              onChange={handleDayChange}
            />
          </div>

          {isPlannerFetching && meals.length === 0 ? (
            <div className="flex min-h-40 items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 px-6 text-center text-sm text-muted-foreground">
              Loading meals…
            </div>
          ) : meals.length === 0 ? (
            <div className="flex min-h-40 items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 px-6 text-center text-sm text-muted-foreground">
              No meals available for {DIET_DAY_FULL_LABELS[activeDay]}.
            </div>
          ) : (
            <div className="space-y-4">
              {meals.map((meal) => (
                <MealCard
                  key={meal.id}
                  meal={meal}
                  onReplace={
                    meal.canSwap
                      ? () =>
                          showToast(
                            'Meal replace is not available from the API yet.',
                            'error',
                          )
                      : undefined
                  }
                />
              ))}
            </div>
          )}
        </section>

        <aside className="space-y-4">
          {planner?.coachInsight?.message ? (
            <div className="rounded-2xl border border-border bg-card p-4">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Coach insight
              </p>
              <p className="mt-2 text-sm text-foreground">
                {planner.coachInsight.message}
              </p>
            </div>
          ) : null}
          <NutritionSummary
            nutrition={diet.nutrition ?? planner?.nutrition}
            hydration={planner?.hydration}
            hydrationQuickAddsMl={planner?.hydrationQuickAddsMl}
            isUpdatingHydration={isUpdatingHydration}
            onAddHydration={onAddHydration}
          />
          <GroceryPreview
            grocery={diet.grocery}
            onGenerateList={() =>
              showToast(
                diet.grocery?.items?.length
                  ? 'Grocery list is ready in the preview.'
                  : 'No grocery list is available for this plan.',
                diet.grocery?.items?.length ? 'success' : 'error',
              )
            }
          />
        </aside>
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-border pt-4 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={() =>
            showToast('Diet plan is already saved as your active plan.')
          }
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
        >
          <Save className="size-4" />
          Save Plan
        </button>
        <button
          type="button"
          onClick={() => router.push('/fitness/transformation')}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground shadow-[0_0_24px_var(--neon-glow)] transition-opacity hover:opacity-90 dark:text-black"
        >
          Continue
          <ArrowRight className="size-4" />
        </button>
      </div>

      <HistoryDrawer
        open={isHistoryOpen}
        items={history}
        activeId={diet.id}
        isLoading={isHistoryLoading}
        isActivating={isActivating}
        isDeleting={isDeleting}
        onClose={onCloseHistory}
        onActivate={onActivate}
        onDelete={onDelete}
      />
    </div>
  );
}
