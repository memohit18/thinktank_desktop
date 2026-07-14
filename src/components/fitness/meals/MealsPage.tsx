'use client';

import { useMemo, useRef, useState, type TouchEvent } from 'react';
import FitnessApiErrorState from '@/components/fitness/FitnessApiErrorState';
import FitnessModuleShell from '@/components/fitness/FitnessModuleShell';
import DailyScore from '@/components/fitness/execution/DailyScore';
import HydrationWidget from '@/components/fitness/execution/HydrationWidget';
import MealExecutionCard from '@/components/fitness/execution/MealExecutionCard';
import HistoryDrawer from '@/components/fitness/meals/HistoryDrawer';
import LoadingSkeleton from '@/components/fitness/meals/LoadingSkeleton';
import MealHero from '@/components/fitness/meals/MealHero';
import MealTabs from '@/components/fitness/meals/MealTabs';
import NutritionSummary from '@/components/fitness/meals/NutritionSummary';
import ReplaceMealDialog from '@/components/fitness/meals/ReplaceMealDialog';
import WeeklyCalendar from '@/components/fitness/meals/WeeklyCalendar';
import { useDailyCheckin } from '@/hooks/useDailyCheckin';
import { useHydration } from '@/hooks/useHydration';
import { useMealExecution } from '@/hooks/useMealExecution';
import { useMeals } from '@/hooks/useMeals';
import { MEAL_TYPE_ORDER } from '@/lib/fitness/meals/constants';
import { filterMealsByType } from '@/lib/fitness/meals/mealResponse';
import type { MealDayKey, MealType } from '@/lib/fitness/meals/types';

/** Prefer check-in macros only when that source has a real goal; else use meal summary. */
function pickGoal(
  checkinGoal?: number | null,
  summaryGoal?: number | null,
) {
  if (checkinGoal != null && checkinGoal > 0) return checkinGoal;
  return summaryGoal ?? 0;
}

function pickMacro(
  checkinCurrent?: number | null,
  summaryCurrent?: number | null,
  checkinGoal?: number | null,
  summaryGoal?: number | null,
) {
  if (checkinGoal != null && checkinGoal > 0) {
    return checkinCurrent ?? 0;
  }
  return summaryCurrent ?? checkinCurrent ?? 0;
}

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
    generate,
    activate,
    isGenerating,
    isActivating,
  } = useMeals();

  const execution = useMealExecution();
  const checkin = useDailyCheckin();
  const hydration = useHydration();

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

  const refreshAll = async () => {
    await Promise.all([
      refetch(),
      checkin.refetch(),
      hydration.refetch(),
      checkin.refresh(),
    ]);
  };

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
      void refreshAll();
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
          onRetry={() => void refreshAll()}
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

        <DailyScore checkin={checkin.checkin} isLoading={checkin.isLoading} />

        <MealHero
          today={today}
          active={active}
          calories={pickMacro(
            checkin.checkin?.calories.current,
            summary?.calories.current,
            checkin.checkin?.calories.goal,
            summary?.calories.goal,
          )}
          protein={pickMacro(
            checkin.checkin?.protein.current,
            summary?.protein.current,
            checkin.checkin?.protein.goal,
            summary?.protein.goal,
          )}
          calorieGoal={pickGoal(
            checkin.checkin?.calories.goal,
            summary?.calories.goal,
          )}
          proteinGoal={pickGoal(
            checkin.checkin?.protein.goal,
            summary?.protein.goal,
          )}
          mealsRemaining={
            today?.mealsRemaining ??
            summary?.mealsRemaining ??
            meals.filter(
              (meal) =>
                meal.status !== 'completed' &&
                meal.status !== 'skipped' &&
                meal.status !== 'partial',
            ).length
          }
          isRefreshing={isFetching || checkin.isFetching}
          onRefresh={() => void refreshAll()}
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
                    Log ate, half portion, skip, replace, or add a note.
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
                    <MealExecutionCard
                      key={meal.id}
                      meal={meal}
                      isActing={
                        execution.isActing &&
                        execution.pendingMealId === meal.id
                      }
                      onLogPortion={(id, quantity, notes) =>
                        execution.logPortion(id, quantity, notes).then((ok) => {
                          if (ok) void checkin.refresh();
                          return ok;
                        })
                      }
                      onHalf={(id) =>
                        execution.halfPortion(id).then((ok) => {
                          if (ok) void checkin.refresh();
                          return ok;
                        })
                      }
                      onSkip={(id) =>
                        execution.skip(id).then((ok) => {
                          if (ok) void checkin.refresh();
                          return ok;
                        })
                      }
                      onReplace={(id) => setReplaceMealId(id)}
                      onCustomFood={(id) => setReplaceMealId(id)}
                    />
                  ))}
                </div>
              )}
            </section>

            <aside className="space-y-4">
              <HydrationWidget
                amountMl={
                  hydration.amountMl || checkin.checkin?.water.currentMl || 0
                }
                goalMl={
                  hydration.goalMl || checkin.checkin?.water.goalMl || 3500
                }
                isLogging={hydration.isLogging}
                onAdd={async (amount) => {
                  const ok = await hydration.add(amount);
                  if (ok) void checkin.refresh();
                  return ok;
                }}
              />
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
          isSubmitting={execution.isReplacing}
          onClose={() => setReplaceMealId(null)}
          onConfirm={(foodId) => {
            if (!replaceMealId) return;
            void execution.replace(replaceMealId, foodId).then((ok) => {
              if (ok) {
                setReplaceMealId(null);
                void checkin.refresh();
              }
            });
          }}
        />
      </div>

      <HydrationWidget
        compact
        amountMl={hydration.amountMl || checkin.checkin?.water.currentMl || 0}
        goalMl={hydration.goalMl || checkin.checkin?.water.goalMl || 3500}
        isLogging={hydration.isLogging}
        onAdd={async (amount) => {
          const ok = await hydration.add(amount);
          if (ok) void checkin.refresh();
          return ok;
        }}
      />
    </FitnessModuleShell>
  );
}
