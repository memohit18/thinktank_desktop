'use client';

import { useCallback, useMemo, useState } from 'react';
import { useToast } from '@/components/ui/Toast';
import { useCompleteMeal } from '@/hooks/useCompleteMeal';
import { useNutritionSummary } from '@/hooks/useNutritionSummary';
import { useReplaceMeal } from '@/hooks/useReplaceMeal';
import { useTodayMeals } from '@/hooks/useTodayMeals';
import {
  buildScheduleView,
  mergeNutritionSummaries,
} from '@/lib/fitness/meals/mealResponse';
import type { MealItem, MealNutritionSummary } from '@/lib/fitness/meals/types';
import type { DietMeal, DietNutritionSummary } from '@/lib/fitness/diet/types';
import { getApiErrorMessage } from '@/lib/services/getApiErrorMessage';
import { useGetDietPlannerQuery } from '@/lib/services/dietApi';
import {
  useActivateMealPlanByIdMutation,
  useGenerateMealPlanFromDietMutation,
  useGetActiveMealPlanQuery,
  useGetMealHistoryQuery,
  useGetMealPlanByIdQuery,
  useGetMealPlanScheduleQuery,
} from '@/lib/services/mealApi';

function toMealItem(meal: DietMeal): MealItem {
  return {
    id: meal.id,
    type: meal.type,
    name: meal.name,
    imageUrl: meal.imageUrl,
    servingSize: meal.servingSize,
    scheduledTime: meal.scheduledTime,
    calories: meal.calories,
    protein: meal.protein,
    carbs: meal.carbs,
    fats: meal.fats,
    status: meal.status ?? 'pending',
    canSwap: meal.canSwap,
  };
}

function toMealNutrition(
  nutrition: DietNutritionSummary | null | undefined,
  fallback?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fats?: number;
    mealsAssigned?: number;
    mealsRemaining?: number;
  },
): MealNutritionSummary | null {
  if (!nutrition && !fallback) return null;
  return {
    calories: nutrition?.calories ?? {
      current: 0,
      goal: fallback?.calories ?? 0,
    },
    protein: nutrition?.protein ?? {
      current: 0,
      goal: fallback?.protein ?? 0,
    },
    carbs: nutrition?.carbs ?? {
      current: 0,
      goal: fallback?.carbs ?? 0,
    },
    fats: nutrition?.fats ?? {
      current: 0,
      goal: fallback?.fats ?? 0,
    },
    mealsAssigned: fallback?.mealsAssigned,
    mealsRemaining: fallback?.mealsRemaining,
    mealsCompleted: 0,
    mealsSkipped: 0,
  };
}

export function useMeals() {
  const { showToast } = useToast();
  const activeQuery = useGetActiveMealPlanQuery();
  const today = useTodayMeals({ skip: false });
  const nutrition = useNutritionSummary({ skip: false });
  const historyQuery = useGetMealHistoryQuery({ page: 1, limit: 20 });
  const mealPlanId = activeQuery.data?.id ?? today.today?.mealPlanId ?? null;

  const scheduleQuery = useGetMealPlanScheduleQuery(mealPlanId ?? '', {
    skip: !mealPlanId,
  });
  const planByIdQuery = useGetMealPlanByIdQuery(mealPlanId ?? '', {
    skip: !mealPlanId,
  });

  // Enrich targets from diet planner when meal-plan nutrition has no goals.
  const dietPlannerQuery = useGetDietPlannerQuery(today.today?.date || undefined, {
    skip: false,
  });

  const { complete, skip, isCompleting, isSkipping, pendingMealId } =
    useCompleteMeal();
  const { replace, isReplacing } = useReplaceMeal();
  const [generateMealPlan, generateState] = useGenerateMealPlanFromDietMutation();
  const [activateMealPlan, activateState] = useActivateMealPlanByIdMutation();
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [replaceMealId, setReplaceMealId] = useState<string | null>(null);

  const plannerNutrition = useMemo(() => {
    const planner = dietPlannerQuery.data;
    if (!planner) return null;
    return toMealNutrition(planner.nutrition, {
      calories: planner.dailyCalories,
      protein: planner.dailyProtein,
      carbs: planner.dailyCarbs,
      fats: planner.dailyFats,
      mealsAssigned: Math.max(planner.mealsPerDay, planner.meals?.length ?? 0),
      mealsRemaining:
        planner.meals?.filter(
          (meal) => meal.status !== 'completed' && meal.status !== 'skipped',
        ).length ?? planner.mealsPerDay,
    });
  }, [dietPlannerQuery.data]);

  const summary = useMemo(() => {
    const fromMeals = mergeNutritionSummaries(
      today.today?.nutrition,
      nutrition.summary,
    );
    return mergeNutritionSummaries(fromMeals, plannerNutrition);
  }, [nutrition.summary, plannerNutrition, today.today?.nutrition]);

  const meals = useMemo(() => {
    if (today.meals.length > 0) return today.meals;
    return (dietPlannerQuery.data?.meals ?? []).map(toMealItem);
  }, [dietPlannerQuery.data?.meals, today.meals]);

  const resolvedToday = useMemo(() => {
    if (today.today) {
      return {
        ...today.today,
        goal:
          today.today.goal ||
          activeQuery.data?.goal ||
          dietPlannerQuery.data?.goal ||
          null,
        version:
          today.today.version ??
          activeQuery.data?.version ??
          dietPlannerQuery.data?.version ??
          null,
        mealsRemaining:
          summary?.mealsRemaining ??
          today.today.mealsRemaining ??
          meals.filter(
            (meal) =>
              meal.status !== 'completed' && meal.status !== 'skipped',
          ).length,
        nutrition: summary ?? today.today.nutrition,
        meals: meals.length ? meals : today.today.meals,
      };
    }

    if (meals.length === 0 && !summary) return null;

    return {
      date: dietPlannerQuery.data?.date ?? new Date().toISOString().slice(0, 10),
      mealPlanId:
        mealPlanId ?? dietPlannerQuery.data?.mealPlanId ?? null,
      dietPlanId: dietPlannerQuery.data?.dietPlanId ?? null,
      goal: activeQuery.data?.goal ?? dietPlannerQuery.data?.goal ?? null,
      version: activeQuery.data?.version ?? dietPlannerQuery.data?.version ?? null,
      label: dietPlannerQuery.data?.label ?? null,
      meals,
      nutrition: summary,
      mealsRemaining:
        summary?.mealsRemaining ??
        meals.filter(
          (meal) => meal.status !== 'completed' && meal.status !== 'skipped',
        ).length,
    };
  }, [
    activeQuery.data?.goal,
    activeQuery.data?.version,
    dietPlannerQuery.data,
    mealPlanId,
    meals,
    summary,
    today.today,
  ]);

  const schedule = useMemo(
    () =>
      buildScheduleView(
        scheduleQuery.data,
        planByIdQuery.data ?? activeQuery.data,
        resolvedToday,
      ),
    [
      activeQuery.data,
      planByIdQuery.data,
      resolvedToday,
      scheduleQuery.data,
    ],
  );

  const hasMealPlan = Boolean(
    activeQuery.data?.id ||
      today.today?.mealPlanId ||
      meals.length > 0 ||
      dietPlannerQuery.data?.mealPlanId,
  );

  const isLoading =
    (activeQuery.isLoading && today.isLoading && !resolvedToday) ||
    (today.isLoading && !today.today && meals.length === 0);

  // Nutrition/schedule failures should not blank the whole page.
  const isError = today.isError && activeQuery.isError && !resolvedToday;

  const refetchAll = useCallback(async () => {
    await Promise.all([
      activeQuery.refetch(),
      today.refetch(),
      nutrition.refetch(),
      historyQuery.refetch(),
      mealPlanId ? scheduleQuery.refetch() : Promise.resolve(),
      mealPlanId ? planByIdQuery.refetch() : Promise.resolve(),
      dietPlannerQuery.refetch(),
    ]);
  }, [
    activeQuery,
    dietPlannerQuery,
    historyQuery,
    mealPlanId,
    nutrition,
    planByIdQuery,
    scheduleQuery,
    today,
  ]);

  const handleGenerate = useCallback(async () => {
    try {
      await generateMealPlan({
        dietPlanId:
          activeQuery.data?.dietPlanId ??
          today.today?.dietPlanId ??
          dietPlannerQuery.data?.dietPlanId ??
          undefined,
        planType: 'weekly',
      }).unwrap();
      showToast('Meal plan generated.');
      await refetchAll();
      return true;
    } catch (error) {
      showToast(
        getApiErrorMessage(error, 'Failed to generate meal plan.'),
        'error',
      );
      return false;
    }
  }, [
    activeQuery.data?.dietPlanId,
    dietPlannerQuery.data?.dietPlanId,
    generateMealPlan,
    refetchAll,
    showToast,
    today.today?.dietPlanId,
  ]);

  const handleActivate = useCallback(
    async (id: string) => {
      try {
        await activateMealPlan(id).unwrap();
        showToast('Meal plan activated.');
        setIsHistoryOpen(false);
        await refetchAll();
        return true;
      } catch (error) {
        showToast(
          getApiErrorMessage(error, 'Failed to activate meal plan.'),
          'error',
        );
        return false;
      }
    },
    [activateMealPlan, refetchAll, showToast],
  );

  return {
    active: activeQuery.data ?? null,
    today: resolvedToday,
    meals,
    summary,
    schedule,
    history: historyQuery.data?.items ?? [],
    hasMealPlan,
    isLoading,
    isFetching:
      activeQuery.isFetching ||
      today.isFetching ||
      nutrition.isFetching ||
      scheduleQuery.isFetching ||
      planByIdQuery.isFetching,
    isError,
    refetch: refetchAll,
    isHistoryLoading: historyQuery.isLoading,
    isHistoryOpen,
    setIsHistoryOpen,
    replaceMealId,
    setReplaceMealId,
    complete,
    skip,
    replace,
    generate: handleGenerate,
    activate: handleActivate,
    isGenerating: generateState.isLoading,
    isActivating: activateState.isLoading,
    isCompleting,
    isSkipping,
    isReplacing,
    pendingMealId,
  };
}
