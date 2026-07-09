'use client';

import { useCallback } from 'react';
import { useToast } from '@/components/ui/Toast';
import { toCreateFoodPayload } from '@/lib/fitness/food/schemas/food.schema';
import type { CreateFoodSchemaValues } from '@/lib/fitness/food/schemas/food.schema';
import { getApiErrorMessage } from '@/lib/services/getApiErrorMessage';
import {
  useCreateCatalogFoodMutation,
  useCreateCustomFoodMutation,
} from '@/lib/services/foodApi';

type UseSaveFoodOptions = {
  mode?: 'custom' | 'catalog';
  onSaved?: (foodId: string) => void;
};

export function useSaveFood({ mode = 'custom', onSaved }: UseSaveFoodOptions = {}) {
  const { showToast } = useToast();
  const [createCustomFood, customState] = useCreateCustomFoodMutation();
  const [createCatalogFood, catalogState] = useCreateCatalogFoodMutation();

  const saveFood = useCallback(
    async (values: CreateFoodSchemaValues) => {
      const payload = toCreateFoodPayload(values);

      try {
        const food =
          mode === 'catalog'
            ? await createCatalogFood(payload).unwrap()
            : await createCustomFood(payload).unwrap();

        showToast(
          mode === 'catalog'
            ? 'Catalog food created successfully.'
            : 'Custom food created successfully.',
        );
        onSaved?.(food.id);
        return food;
      } catch (error) {
        showToast(getApiErrorMessage(error, 'Failed to create food.'), 'error');
        return null;
      }
    },
    [createCatalogFood, createCustomFood, mode, onSaved, showToast],
  );

  return {
    saveFood,
    isSaving: customState.isLoading || catalogState.isLoading,
  };
}
