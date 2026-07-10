'use client';

import { useEffect, useState } from 'react';
import { mapFoodPreferencesToFormValues } from '@/lib/fitness/food/schemas/foodPreferences.schema';
import {
  clearFoodPreferencesDraft,
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
    if (isLoading || hasHydrated) return;

    if (isError) {
      setInitialValues(mapFoodPreferencesToFormValues(null));
      setHasHydrated(true);
      return;
    }

    if (preferences) {
      setInitialValues(mapFoodPreferencesToFormValues(preferences));
    } else {
      setInitialValues(mapFoodPreferencesToFormValues(null));
    }

    setHasHydrated(true);
  }, [hasHydrated, isError, isLoading, preferences]);

  function persistDraft(values: FoodPreferencesFormValues) {
    if (isError) return;

    writeFoodPreferencesDraft({
      values,
      updatedAt: new Date().toISOString(),
    });
  }

  function clearDraft() {
    clearFoodPreferencesDraft();
  }

  return {
    preferences: isError ? undefined : preferences,
    initialValues,
    hasHydrated,
    hasExistingPreferences: hasSavedPreferences(preferences) && !isError,
    isLoading: !hasHydrated && isLoading,
    isFetching,
    isError,
    refetch,
    persistDraft,
    clearDraft,
  };
}
