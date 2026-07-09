'use client';

import { useCallback } from 'react';
import { useToast } from '@/components/ui/Toast';
import {
  useCreateNutritionPreferencesMutation,
  useUpdateNutritionPreferencesMutation,
} from '@/lib/services/nutritionPreferencesApi';
import { getApiErrorMessage } from '@/lib/services/getApiErrorMessage';
import { toNutritionPreferencesPayload } from '@/lib/services/nutrition-preferences.service';
import type { NutritionPreferencesFormValues } from '@/types/nutrition-preferences';

type UseSaveNutritionPreferencesOptions = {
  hasExistingPreferences?: boolean;
  onSaved?: () => void;
  showSuccessToast?: boolean;
};

function isConflictError(error: unknown) {
  return (
    !!error &&
    typeof error === 'object' &&
    'status' in error &&
    (error as { status: unknown }).status === 409
  );
}

export function useSaveNutritionPreferences({
  hasExistingPreferences = false,
  onSaved,
  showSuccessToast = true,
}: UseSaveNutritionPreferencesOptions = {}) {
  const { showToast } = useToast();
  const [createNutritionPreferences, createState] =
    useCreateNutritionPreferencesMutation();
  const [updateNutritionPreferences, updateState] =
    useUpdateNutritionPreferencesMutation();

  const saveNutritionPreferences = useCallback(
    async (values: NutritionPreferencesFormValues) => {
      const payload = toNutritionPreferencesPayload(values);

      try {
        if (hasExistingPreferences) {
          await updateNutritionPreferences(payload).unwrap();
        } else {
          try {
            await createNutritionPreferences(payload).unwrap();
          } catch (error) {
            if (!isConflictError(error)) {
              throw error;
            }

            await updateNutritionPreferences(payload).unwrap();
          }
        }

        if (showSuccessToast) {
          showToast('Nutrition preferences saved successfully.');
        }
        onSaved?.();
        return true;
      } catch (error) {
        showToast(
          getApiErrorMessage(error, 'Failed to save nutrition preferences.'),
          'error',
        );
        return false;
      }
    },
    [
      createNutritionPreferences,
      hasExistingPreferences,
      onSaved,
      showSuccessToast,
      showToast,
      updateNutritionPreferences,
    ],
  );

  return {
    saveNutritionPreferences,
    isSaving: createState.isLoading || updateState.isLoading,
  };
}
