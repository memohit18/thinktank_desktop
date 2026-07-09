'use client';

import { useMemo } from 'react';
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

  const initialValues = useMemo(
    () => mapNutritionPreferencesToFormValues(preferences),
    [preferences],
  );

  return {
    preferences,
    initialValues,
    hasExistingPreferences: Boolean(preferences),
    isLoading: isLoading || isFetching,
    isError,
    refetch,
  };
}
