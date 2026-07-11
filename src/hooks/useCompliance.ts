'use client';

import { useMemo } from 'react';
import { useGetDashboardComplianceQuery } from '@/lib/services/dashboardApi';

/** Focused compliance panel from GET /dashboard/compliance */
export function useCompliance() {
  const query = useGetDashboardComplianceQuery();

  const compliance = useMemo(() => {
    const overall = query.data?.compliance.overall ?? null;
    const streak = query.data?.streak ?? null;

    let tone: 'strong' | 'good' | 'fair' | 'low' | 'unknown' = 'unknown';
    if (overall == null) tone = 'unknown';
    else if (overall >= 85) tone = 'strong';
    else if (overall >= 70) tone = 'good';
    else if (overall >= 50) tone = 'fair';
    else tone = 'low';

    return {
      percent: overall,
      detail: query.data?.compliance ?? null,
      streak,
      weights: query.data?.weights ?? null,
      tone,
      label:
        overall == null
          ? 'No compliance data yet'
          : `${Math.round(overall)}% compliance`,
      compliantToday: streak?.compliantToday ?? false,
      currentStreak: streak?.currentStreak ?? null,
      longestStreak: streak?.longestStreak ?? null,
    };
  }, [query.data]);

  return {
    ...compliance,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    refetch: query.refetch,
  };
}
