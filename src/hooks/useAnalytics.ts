'use client';

import { useMemo } from 'react';
import {
  useGetProgressAnalyticsQuery,
  useGetProgressDashboardQuery,
} from '@/lib/services/progressApi';
import type { ProgressAnalytics, ProgressInsights } from '@/lib/fitness/progress/types';

export function useAnalytics() {
  const dashboardQuery = useGetProgressDashboardQuery();
  const analyticsQuery = useGetProgressAnalyticsQuery();

  const analytics = useMemo((): ProgressAnalytics | null => {
    return dashboardQuery.data?.analytics ?? analyticsQuery.data ?? null;
  }, [analyticsQuery.data, dashboardQuery.data?.analytics]);

  const insights = useMemo((): ProgressInsights | null => {
    return (
      dashboardQuery.data?.insights ??
      analytics?.insights ??
      null
    );
  }, [analytics?.insights, dashboardQuery.data?.insights]);

  return {
    analytics,
    insights,
    transformation: dashboardQuery.data?.transformation ?? null,
    isLoading: dashboardQuery.isLoading && analyticsQuery.isLoading,
    isFetching: dashboardQuery.isFetching || analyticsQuery.isFetching,
    isError: dashboardQuery.isError && analyticsQuery.isError,
    refetch: async () => {
      await Promise.all([dashboardQuery.refetch(), analyticsQuery.refetch()]);
    },
  };
}
