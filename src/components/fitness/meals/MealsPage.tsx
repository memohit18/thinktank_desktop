'use client';

import { useMemo, useRef, useState, type TouchEvent } from 'react';
import FitnessApiErrorState from '@/components/fitness/FitnessApiErrorState';
import FitnessModuleShell from '@/components/fitness/FitnessModuleShell';
import HistoryDrawer from '@/components/fitness/meals/HistoryDrawer';
import LoadingSkeleton from '@/components/fitness/meals/LoadingSkeleton';
import MealCard from '@/components/fitness/meals/MealCard';
import MealHero from '@/components/fitness/meals/MealHero';
import MealTabs from '@/components/fitness/meals/MealTabs';
import NutritionSummary from '@/components/fitness/meals/NutritionSummary';
import ReplaceMealDialog from '@/components/fitness/meals/ReplaceMealDialog';
import WeeklyCalendar from '@/components/fitness/meals/WeeklyCalendar';
import { useMeals } from '@/hooks/useMeals';
import { MEAL_TYPE_ORDER } from '@/lib/fitness/meals/constants';
import { filterMealsByType } from '@/lib/fitness/meals/mealResponse';
import type { MealDayKey, MealType } from '@/lib/fitness/meals/types';

export default function MealsPage() {
  const {
    active,
    today,
    meals,
    summary,
    schedule,
    history,
    hasMealPlan,
    isLoading,
    isFetching,
    isError,
    refetch,
    isHistoryLoading,
    isHistoryOpen,
    setIsHistoryOpen,
    replaceMealId,
    setReplaceMealId,
    complete,
    skip,
    replace,
    generate,
    activate,
    isGenerating,
    isActivating,
    isCompleting,
    isSkipping,
    isReplacing,
    pendingMealId,
  } = useMeals();

  const [mealType, setMealType] = useState<MealType | 'all'>('all');
  const [selectedDay, setSelectedDay] = useState<MealDayKey | undefined>();
  const pullStartY = useRef<number | null>(null);
  const [pullDistance, setPullDistance] = useState(0);

  const filteredMeals = useMemo(
    () => filterMealsByType(meals, mealType),
    [mealType, meals],
  );

  const counts = useMemo(() => {
    const result: Partial<Record<MealType | 'all', number>> = {
      all: meals.length,
    };
    for (const type of MEAL_TYPE_ORDER) {
      result[type] = meals.filter((meal) => meal.type === type).length;
    }
    return result;
  }, [meals]);

  const replaceTarget = meals.find((meal) => meal.id === replaceMealId) ?? null;

  const handleTouchStart = (event: TouchEvent) => {
    if (typeof window === 'undefined') return;
    if (window.scrollY > 0) return;
    pullStartY.current = event.touches[0]?.clientY ?? null;
  };

  const handleTouchMove = (event: TouchEvent) => {
    if (pullStartY.current == null) return;
    const currentY = event.touches[0]?.clientY ?? 0;
    const distance = Math.max(0, Math.min(80, currentY - pullStartY.current));
    setPullDistance(distance);
  };

  const handleTouchEnd = () => {
    if (pullDistance > 56) {
      void refetch();
    }
    pullStartY.current = null;
    setPullDistance(0);
  };

  if (isLoading) {
    return (
      <FitnessModuleShell activeNav="meals">
        <LoadingSkeleton />
      </FitnessModuleShell>
    );
  }

  if (isError) {
    return (
      <FitnessModuleShell activeNav="meals">
        <FitnessApiErrorState
          title="Could not load meal plan"
          message="Meal planner data could not be loaded from the server. Retry when your connection is available."
          onRetry={() => void refetch()}
        />
      </FitnessModuleShell>
    );
  }

  return (
    <FitnessModuleShell activeNav="meals">
      <div
        className="space-y-6"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {pullDistance > 0 ? (
          <div
            className="overflow-hidden text-center text-xs font-semibold text-accent transition-all"
            style={{ height: pullDistance }}
          >
            {pullDistance > 56 ? 'Release to refresh' : 'Pull to refresh'}
          </div>
        ) : null}

        <MealHero
          today={today}
          active={active}
          calories={summary?.calories.current ?? 0}
          protein={summary?.protein.current ?? 0}
          calorieGoal={summary?.calories.goal ?? 0}
          proteinGoal={summary?.protein.goal ?? 0}
          mealsRemaining={
            today?.mealsRemaining ??
            summary?.mealsRemaining ??
            meals.filter(
              (meal) =>
                meal.status !== 'completed' && meal.status !== 'skipped',
            ).length
          }
          isRefreshing={isFetching}
          onRefresh={() => void refetch()}
          onOpenHistory={() => setIsHistoryOpen(true)}
          onGenerate={!hasMealPlan ? () => void generate() : undefined}
          isGenerating={isGenerating}
        />

        {!hasMealPlan && meals.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-16 text-center">
            <h2 className="text-lg font-semibold text-foreground">
              No active meal plan
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              Generate a weekly meal plan from your active diet to start tracking
              today&apos;s meals.
            </p>
            <button
              type="button"
              disabled={isGenerating}
              onClick={() => void generate()}
              className="mt-6 inline-flex items-center justify-center rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground shadow-[0_0_24px_var(--neon-glow)] transition-opacity hover:opacity-90 disabled:opacity-60 dark:text-black"
            >
              {isGenerating ? 'Generating…' : 'Generate Meal Plan'}
            </button>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1.45fr_0.85fr]">
            <section className="space-y-4">
              <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
                <div className="mb-4">
                  <h2 className="text-base font-semibold text-foreground">
                    Today&apos;s Meals
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Mark meals complete, skip, or replace as needed.
                  </p>
                </div>
                <MealTabs
                  activeType={mealType}
                  onChange={setMealType}
                  counts={counts}
                />
              </div>

              {filteredMeals.length === 0 ? (
                <div className="flex min-h-40 items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 px-6 text-center text-sm text-muted-foreground">
                  No meals available for this filter.
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredMeals.map((meal) => (
                    <MealCard
                      key={meal.id}
                      meal={meal}
                      isActing={
                        (isCompleting || isSkipping) &&
                        pendingMealId === meal.id
                      }
                      onComplete={(id) => void complete(id)}
                      onSkip={(id) => void skip(id)}
                      onReplace={(id) => setReplaceMealId(id)}
                    />
                  ))}
                </div>
              )}
            </section>

            <aside className="space-y-4">
              <NutritionSummary summary={summary} />
              <WeeklyCalendar
                schedule={schedule}
                selectedDay={selectedDay}
                onSelectDay={setSelectedDay}
                highlightDate={today?.date}
              />
            </aside>
          </div>
        )}

        <HistoryDrawer
          open={isHistoryOpen}
          items={history}
          activeId={active?.id ?? today?.mealPlanId}
          isLoading={isHistoryLoading}
          isActivating={isActivating}
          onClose={() => setIsHistoryOpen(false)}
          onActivate={(id) => void activate(id)}
        />

        <ReplaceMealDialog
          open={Boolean(replaceMealId)}
          mealName={replaceTarget?.name}
          isSubmitting={isReplacing}
          onClose={() => setReplaceMealId(null)}
          onConfirm={(foodId, quantity) => {
            if (!replaceMealId) return;
            void replace({ mealItemId: replaceMealId, foodId, quantity }).then(
              (ok) => {
                if (ok) setReplaceMealId(null);
              },
            );
          }}
        />
      </div>
    </FitnessModuleShell>
  );
}
