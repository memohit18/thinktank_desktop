'use client';

import { useMemo } from 'react';
import {
  useGetLatestProgressQuery,
  useGetProgressDashboardQuery,
  useGetProgressHistoryQuery,
} from '@/lib/services/progressApi';

export function useProgress() {
  const dashboardQuery = useGetProgressDashboardQuery();
  const historyQuery = useGetProgressHistoryQuery({ page: 1, limit: 50 });
  const latestQuery = useGetLatestProgressQuery();

  const latest = useMemo(
    () => dashboardQuery.data?.latest ?? latestQuery.data ?? null,
    [dashboardQuery.data?.latest, latestQuery.data],
  );

  return {
    dashboard: dashboardQuery.data ?? null,
    entries: historyQuery.data?.items ?? [],
    latest,
    meta: historyQuery.data?.meta,
    isLoading:
      dashboardQuery.isLoading ||
      (historyQuery.isLoading && !historyQuery.data),
    isFetching:
      dashboardQuery.isFetching ||
      historyQuery.isFetching ||
      latestQuery.isFetching,
    isError: dashboardQuery.isError && historyQuery.isError,
    refetch: async () => {
      await Promise.all([
        dashboardQuery.refetch(),
        historyQuery.refetch(),
        latestQuery.refetch(),
      ]);
    },
  };
}
