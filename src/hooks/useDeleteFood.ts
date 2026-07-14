'use client';

import { useCallback } from 'react';
import { useToast } from '@/components/ui/Toast';
import { getApiErrorMessage } from '@/lib/services/getApiErrorMessage';
import { useDeleteFoodMutation } from '@/lib/services/foodApi';
import { useExclusiveAction } from '@/hooks/useExclusiveAction';

type UseDeleteFoodOptions = {
  onDeleted?: (foodId: string) => void;
};

export function useDeleteFood({ onDeleted }: UseDeleteFoodOptions = {}) {
  const { showToast } = useToast();
  const [deleteFoodMutation, state] = useDeleteFoodMutation();
  const { runExclusive, isLocked } = useExclusiveAction({ cooldownMs: 500 });

  const deleteFood = useCallback(
    async (foodId: string) => {
      const result = await runExclusive(async () => {
        try {
          await deleteFoodMutation(foodId).unwrap();
          showToast('Food deleted.');
          onDeleted?.(foodId);
          return true;
        } catch (error) {
          showToast(
            getApiErrorMessage(error, 'Failed to delete food.'),
            'error',
          );
          return false;
        }
      });
      return result ?? false;
    },
    [deleteFoodMutation, onDeleted, runExclusive, showToast],
  );

  return {
    deleteFood,
    isDeleting: isLocked || state.isLoading,
  };
}
