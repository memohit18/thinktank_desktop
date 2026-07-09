'use client';

import { useEffect, useState } from 'react';
import { mapFoodPreferencesToFormValues } from '@/lib/fitness/food/schemas/foodPreferences.schema';
import {
  clearFoodPreferencesDraft,
  readFoodPreferencesDraft,
  writeFoodPreferencesDraft,
} from '@/lib/fitness/food/foodPreferencesStorage';
import type { FoodPreferencesFormValues } from '@/lib/fitness/food/types';
import { useGetFoodPreferencesQuery } from '@/lib/services/foodApi';

function hasSavedPreferences(
  preferences: ReturnType<typeof useGetFoodPreferencesQuery>['data'],
) {
  if (!preferences) return false;

  return (
    preferences.favoriteFoodIds.length > 0 ||
    preferences.restrictedFoodIds.length > 0 ||
    preferences.availableFoodIds.length > 0
  );
}

export function useFoodPreferences() {
  const {
    data: preferences,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetFoodPreferencesQuery();

  const [hasHydrated, setHasHydrated] = useState(false);
  const [initialValues, setInitialValues] = useState<FoodPreferencesFormValues>(
    mapFoodPreferencesToFormValues(null),
  );

  useEffect(() => {
    if (isLoading || isFetching || hasHydrated) return;

    const draft = readFoodPreferencesDraft();

    if (preferences) {
      setInitialValues(mapFoodPreferencesToFormValues(preferences));
    } else if (draft) {
      setInitialValues(draft.values);
    }

    setHasHydrated(true);
  }, [hasHydrated, isFetching, isLoading, preferences]);

  function persistDraft(values: FoodPreferencesFormValues) {
    writeFoodPreferencesDraft({
      values,
      updatedAt: new Date().toISOString(),
    });
  }

  function clearDraft() {
    clearFoodPreferencesDraft();
  }

  return {
    preferences,
    initialValues,
    hasHydrated,
    hasExistingPreferences: hasSavedPreferences(preferences),
    isLoading: isLoading || isFetching || !hasHydrated,
    isError,
    refetch,
    persistDraft,
    clearDraft,
  };
}
