'use client';

import { useGetWorkoutHistoryQuery } from '@/lib/services/workoutApi';

export function useWorkoutHistory(params?: { page?: number; limit?: number }) {
  const query = useGetWorkoutHistoryQuery({
    page: params?.page ?? 1,
    limit: params?.limit ?? 20,
  });

  return {
    items: query.data?.items ?? [],
    meta: query.data?.meta,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    refetch: query.refetch,
  };
}
