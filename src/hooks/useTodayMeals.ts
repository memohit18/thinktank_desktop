'use client';

import { useGetTodayMealsQuery } from '@/lib/services/mealApi';

export function useTodayMeals({ skip = false }: { skip?: boolean } = {}) {
  const query = useGetTodayMealsQuery(undefined, { skip });

  return {
    today: query.data ?? null,
    meals: query.data?.meals ?? [],
    isLoading: query.isLoading || query.isUninitialized,
    isFetching: query.isFetching,
    isError: query.isError,
    refetch: query.refetch,
  };
}
