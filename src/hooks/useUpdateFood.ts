'use client';

import { useCallback } from 'react';
import { useToast } from '@/components/ui/Toast';
import {
  toUpdateFoodPayload,
  type UpdateFoodSchemaValues,
} from '@/lib/fitness/food/schemas/food.schema';
import { getApiErrorMessage } from '@/lib/services/getApiErrorMessage';
import { useUpdateFoodMutation } from '@/lib/services/foodApi';

type UseUpdateFoodOptions = {
  onUpdated?: (foodId: string) => void;
};

export function useUpdateFood({ onUpdated }: UseUpdateFoodOptions = {}) {
  const { showToast } = useToast();
  const [updateFood, state] = useUpdateFoodMutation();

  const update = useCallback(
    async (
      foodId: string,
      values: UpdateFoodSchemaValues,
      options?: { removeCategory?: boolean },
    ) => {
      const payload = toUpdateFoodPayload(values, options);

      try {
        const food = await updateFood({ foodId, body: payload }).unwrap();
        showToast('Food updated successfully.');
        onUpdated?.(food.id);
        return food;
      } catch (error) {
        showToast(getApiErrorMessage(error, 'Failed to update food.'), 'error');
        return null;
      }
    },
    [onUpdated, showToast, updateFood],
  );

  return {
    updateFood: update,
    isUpdating: state.isLoading,
  };
}
