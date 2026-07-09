'use client';

import { useEffect, useMemo, useState } from 'react';
import { mapNutritionPreferencesToFormValues } from '@/schemas/nutrition-preferences.schema';
import { useGetNutritionPreferencesQuery } from '@/lib/services/nutritionPreferencesApi';

export function useNutritionPreferences() {
  const {
    data: preferences,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetNutritionPreferencesQuery();

  const [hasHydrated, setHasHydrated] = useState(false);

  const initialValues = useMemo(
    () => mapNutritionPreferencesToFormValues(preferences),
    [preferences],
  );

  useEffect(() => {
    if (isLoading || hasHydrated) return;
    setHasHydrated(true);
  }, [hasHydrated, isLoading]);

  return {
    preferences,
    initialValues,
    hasHydrated,
    hasExistingPreferences: Boolean(preferences),
    isLoading: !hasHydrated && isLoading,
    isFetching,
    isError,
    refetch,
  };
}
