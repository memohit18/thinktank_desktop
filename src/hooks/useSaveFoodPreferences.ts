'use client';

import { useCallback } from 'react';
import { useToast } from '@/components/ui/Toast';
import { toFoodPreferencesPatchPayload } from '@/lib/fitness/food/foodResponse';
import type {
  AddFoodPreferencePayload,
  FoodPreferencesFormValues,
} from '@/lib/fitness/food/types';
import { getApiErrorMessage } from '@/lib/services/getApiErrorMessage';
import {
  useAddFoodPreferenceMutation,
  useRemoveFoodPreferenceMutation,
  useUpdateFoodPreferencesMutation,
} from '@/lib/services/foodApi';

type UseSaveFoodPreferencesOptions = {
  onSaved?: () => void;
  showSuccessToast?: boolean;
};

export function useSaveFoodPreferences({
  onSaved,
  showSuccessToast = true,
}: UseSaveFoodPreferencesOptions = {}) {
  const { showToast } = useToast();
  const [addFoodPreference, addState] = useAddFoodPreferenceMutation();
  const [updateFoodPreferences, updateState] = useUpdateFoodPreferencesMutation();
  const [removeFoodPreference, removeState] = useRemoveFoodPreferenceMutation();

  const isSaving = addState.isLoading || updateState.isLoading;
  const isRemoving = removeState.isLoading;

  const savePreferences = useCallback(
    async (values: FoodPreferencesFormValues) => {
      const payload = toFoodPreferencesPatchPayload(values);

      try {
        await updateFoodPreferences(payload).unwrap();
        if (showSuccessToast) {
          showToast('Food preferences updated successfully.');
        }
        onSaved?.();
        return true;
      } catch (error) {
        showToast(
          getApiErrorMessage(error, 'Failed to save food preferences.'),
          'error',
        );
        return false;
      }
    },
    [onSaved, showSuccessToast, showToast, updateFoodPreferences],
  );

  const addPreference = useCallback(
    async (payload: AddFoodPreferencePayload) => {
      try {
        await addFoodPreference(payload).unwrap();
        return true;
      } catch (error) {
        showToast(
          getApiErrorMessage(error, 'Failed to add food preference.'),
          'error',
        );
        return false;
      }
    },
    [addFoodPreference, showToast],
  );

  const removePreference = useCallback(
    async (foodId: string) => {
      try {
        await removeFoodPreference(foodId).unwrap();
        showToast('Food removed from preferences.');
        return true;
      } catch (error) {
        showToast(
          getApiErrorMessage(error, 'Failed to remove food preference.'),
          'error',
        );
        return false;
      }
    },
    [removeFoodPreference, showToast],
  );

  return {
    savePreferences,
    addPreference,
    removePreference,
    isSaving,
    isRemoving,
  };
}
