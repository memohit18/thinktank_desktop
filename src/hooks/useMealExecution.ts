'use client';

import { useCallback } from 'react';
import { useToast } from '@/components/ui/Toast';
import { getApiErrorMessage } from '@/lib/services/getApiErrorMessage';
import {
  useExecuteCompleteMealMutation,
  useExecutePartialMealMutation,
  useExecuteReplaceMealMutation,
  useExecuteSkipMealMutation,
  useExecuteUndoMealMutation,
} from '@/lib/services/mealExecutionApi';

export function useMealExecution() {
  const { showToast } = useToast();
  const [completeMeal, completeState] = useExecuteCompleteMealMutation();
  const [partialMeal, partialState] = useExecutePartialMealMutation();
  const [skipMeal, skipState] = useExecuteSkipMealMutation();
  const [replaceMeal, replaceState] = useExecuteReplaceMealMutation();
  const [undoMeal, undoState] = useExecuteUndoMealMutation();

  const logPortion = useCallback(
    async (mealId: string, consumedQuantity: number, notes?: string) => {
      try {
        if (consumedQuantity >= 1) {
          await completeMeal({
            mealId,
            consumedQuantity: 1,
            notes,
          }).unwrap();
          showToast('Meal marked as eaten.');
        } else {
          await partialMeal({ mealId, consumedQuantity }).unwrap();
          showToast(
            consumedQuantity === 0.5
              ? 'Logged half portion.'
              : `Logged ${Math.round(consumedQuantity * 100)}% portion.`,
          );
        }
        return true;
      } catch (error) {
        showToast(
          getApiErrorMessage(error, 'Failed to log meal portion.'),
          'error',
        );
        return false;
      }
    },
    [completeMeal, partialMeal, showToast],
  );

  const ate = useCallback(
    async (mealId: string, notes?: string) => logPortion(mealId, 1, notes),
    [logPortion],
  );

  const halfPortion = useCallback(
    async (mealId: string) => logPortion(mealId, 0.5),
    [logPortion],
  );

  const skip = useCallback(
    async (mealId: string) => {
      try {
        await skipMeal(mealId).unwrap();
        showToast('Meal skipped.');
        return true;
      } catch (error) {
        showToast(getApiErrorMessage(error, 'Failed to skip meal.'), 'error');
        return false;
      }
    },
    [showToast, skipMeal],
  );

  const undo = useCallback(
    async (mealId: string) => {
      try {
        await undoMeal(mealId).unwrap();
        showToast('Meal log reverted.');
        return true;
      } catch (error) {
        showToast(getApiErrorMessage(error, 'Failed to undo meal.'), 'error');
        return false;
      }
    },
    [showToast, undoMeal],
  );

  const replace = useCallback(
    async (mealId: string, foodId: string) => {
      try {
        await replaceMeal({ mealId, foodId }).unwrap();
        showToast('Meal replaced.');
        return true;
      } catch (error) {
        showToast(getApiErrorMessage(error, 'Failed to replace meal.'), 'error');
        return false;
      }
    },
    [replaceMeal, showToast],
  );

  const pendingMealId =
    (completeState.originalArgs as CompleteArgs | undefined)?.mealId ??
    (partialState.originalArgs as PartialArgs | undefined)?.mealId ??
    (skipState.originalArgs as string | undefined) ??
    (replaceState.originalArgs as ReplaceArgs | undefined)?.mealId ??
    (undoState.originalArgs as string | undefined) ??
    null;

  return {
    ate,
    halfPortion,
    logPortion,
    skip,
    undo,
    replace,
    isActing:
      completeState.isLoading ||
      partialState.isLoading ||
      skipState.isLoading ||
      replaceState.isLoading ||
      undoState.isLoading,
    isCompleting: completeState.isLoading,
    isPartial: partialState.isLoading,
    isSkipping: skipState.isLoading,
    isReplacing: replaceState.isLoading,
    pendingMealId,
  };
}

type CompleteArgs = { mealId: string; consumedQuantity?: number; notes?: string };
type PartialArgs = { mealId: string; consumedQuantity: number };
type ReplaceArgs = { mealId: string; foodId: string };
