'use client';

import { useGetActiveDietQuery } from '@/lib/services/dietApi';

export function useActiveDiet() {
  const query = useGetActiveDietQuery();

  return {
    diet: query.data ?? null,
    hasDiet: Boolean(query.data?.id),
    isLoading: query.isLoading || query.isUninitialized,
    isFetching: query.isFetching,
    isError: query.isError,
    refetch: query.refetch,
  };
}
