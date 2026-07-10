'use client';

import { useCallback } from 'react';
import {
  useGetTodayCheckinQuery,
  useRefreshTodayCheckinMutation,
} from '@/lib/services/dailyApi';

export function useDailyCheckin() {
  const query = useGetTodayCheckinQuery();
  const [refreshCheckin, refreshState] = useRefreshTodayCheckinMutation();

  const refresh = useCallback(async () => {
    try {
      await refreshCheckin().unwrap();
      return true;
    } catch {
      await query.refetch();
      return false;
    }
  }, [query, refreshCheckin]);

  return {
    checkin: query.data,
    score: query.data?.todayScore ?? null,
    breakdown: query.data?.breakdown ?? null,
    isLoading: query.isLoading,
    isFetching: query.isFetching || refreshState.isLoading,
    isError: query.isError,
    refresh,
    refetch: query.refetch,
  };
}
