'use client';

import { useGetDietPlannerQuery } from '@/lib/services/dietApi';

type UseDietPlannerOptions = {
  date?: string;
  skip?: boolean;
};

export function useDietPlanner({
  date,
  skip = false,
}: UseDietPlannerOptions = {}) {
  const query = useGetDietPlannerQuery(date, { skip });

  return {
    planner: query.data ?? null,
    isLoading: query.isLoading || query.isUninitialized,
    isFetching: query.isFetching,
    isError: query.isError,
    refetch: query.refetch,
  };
}
