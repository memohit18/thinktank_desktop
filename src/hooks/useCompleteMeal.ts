'use client';

import { useCallback } from 'react';
import { useToast } from '@/components/ui/Toast';
import { getApiErrorMessage } from '@/lib/services/getApiErrorMessage';
import {
  useCompleteMealItemMutation,
  useSkipMealItemMutation,
} from '@/lib/services/mealApi';

export function useCompleteMeal() {
  const { showToast } = useToast();
  const [completeMeal, completeState] = useCompleteMealItemMutation();
  const [skipMeal, skipState] = useSkipMealItemMutation();

  const complete = useCallback(
    async (mealItemId: string) => {
      try {
        await completeMeal(mealItemId).unwrap();
        showToast('Meal marked as complete.');
        return true;
      } catch (error) {
        showToast(
          getApiErrorMessage(error, 'Failed to complete meal.'),
          'error',
        );
        return false;
      }
    },
    [completeMeal, showToast],
  );

  const skip = useCallback(
    async (mealItemId: string) => {
      try {
        await skipMeal(mealItemId).unwrap();
        showToast('Meal skipped.');
        return true;
      } catch (error) {
        showToast(getApiErrorMessage(error, 'Failed to skip meal.'), 'error');
        return false;
      }
    },
    [showToast, skipMeal],
  );

  return {
    complete,
    skip,
    isCompleting: completeState.isLoading,
    isSkipping: skipState.isLoading,
    pendingMealId:
      (completeState.originalArgs as string | undefined) ??
      (skipState.originalArgs as string | undefined) ??
      null,
  };
}
