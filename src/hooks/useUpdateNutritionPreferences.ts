'use client';

import { useCallback } from 'react';
import {
  useUpdateNutritionPreferencesMutation,
} from '@/lib/services/nutritionPreferencesApi';
import type { NutritionPreferencesPayload } from '@/types/nutrition-preferences';

export function useUpdateNutritionPreferences() {
  const [updateNutritionPreferences, state] =
    useUpdateNutritionPreferencesMutation();

  const update = useCallback(
    (payload: NutritionPreferencesPayload) =>
      updateNutritionPreferences(payload).unwrap(),
    [updateNutritionPreferences],
  );

  return {
    updateNutritionPreferences: update,
    isUpdating: state.isLoading,
  };
}
