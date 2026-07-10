'use client';

import { useGetProgressPhotosQuery } from '@/lib/services/progressApi';

export function useProgressPhotos() {
  const query = useGetProgressPhotosQuery({ page: 1, limit: 50 });

  return {
    photos: query.data?.items ?? [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    refetch: query.refetch,
  };
}
