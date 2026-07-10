'use client';

import { useGetMealNutritionSummaryQuery } from '@/lib/services/mealApi';

export function useNutritionSummary({ skip = false }: { skip?: boolean } = {}) {
  const query = useGetMealNutritionSummaryQuery(undefined, { skip });

  return {
    summary: query.data ?? null,
    isLoading: query.isLoading || query.isUninitialized,
    isFetching: query.isFetching,
    isError: query.isError,
    refetch: query.refetch,
  };
}
