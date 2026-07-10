'use client';

import { useGetDietHistoryQuery } from '@/lib/services/dietApi';

type UseDietHistoryOptions = {
  page?: number;
  limit?: number;
  skip?: boolean;
};

export function useDietHistory({
  page = 1,
  limit = 20,
  skip = false,
}: UseDietHistoryOptions = {}) {
  const query = useGetDietHistoryQuery({ page, limit }, { skip });

  return {
    history: query.data?.items ?? [],
    meta: query.data?.meta,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    refetch: query.refetch,
  };
}
