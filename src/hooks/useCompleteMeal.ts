'use client';

import { useCallback } from 'react';
import { useToast } from '@/components/ui/Toast';
import { getApiErrorMessage } from '@/lib/services/getApiErrorMessage';
import {
  useCompleteMealItemMutation,
  useSkipMealItemMutation,
  useUndoMealItemMutation,
} from '@/lib/services/mealApi';

export function useCompleteMeal() {
  const { showToast } = useToast();
  const [completeMeal, completeState] = useCompleteMealItemMutation();
  const [skipMeal, skipState] = useSkipMealItemMutation();
  const [undoMeal, undoState] = useUndoMealItemMutation();

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

  const undo = useCallback(
    async (mealItemId: string) => {
      try {
        await undoMeal(mealItemId).unwrap();
        showToast('Meal log reverted.');
        return true;
      } catch (error) {
        showToast(getApiErrorMessage(error, 'Failed to undo meal.'), 'error');
        return false;
      }
    },
    [showToast, undoMeal],
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
    undo,
    isCompleting: completeState.isLoading,
    isSkipping: skipState.isLoading,
    isUndoing: undoState.isLoading,
    pendingMealId:
      (completeState.originalArgs as string | undefined) ??
      (skipState.originalArgs as string | undefined) ??
      (undoState.originalArgs as string | undefined) ??
      null,
  };
}
