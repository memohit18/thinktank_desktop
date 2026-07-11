'use client';

import { useCallback } from 'react';
import { useGetDailyDashboardQuery } from '@/lib/services/dashboardApi';

export function useDashboard() {
  const query = useGetDailyDashboardQuery();

  const refresh = useCallback(async () => {
    try {
      await query.refetch();
      return true;
    } catch {
      return false;
    }
  }, [query]);

  const data = query.data ?? null;

  return {
    dashboard: data,
    score: data?.todayScore ?? null,
    todayScore: data?.todayScore ?? null,
    breakdown: data?.breakdown ?? null,
    compliancePercent: data?.compliance ?? null,
    compliance: data?.compliance ?? null,
    streakDays: data?.currentStreak ?? null,
    currentStreak: data?.currentStreak ?? null,
    longestStreak: data?.longestStreak ?? null,
    meals: data?.meals ?? null,
    workout: data?.workout ?? null,
    water: data?.water ?? null,
    calories: data?.calories ?? null,
    protein: data?.protein ?? null,
    remainingMacros: data
      ? {
          calories: data.remainingCalories,
          protein: data.remainingProtein,
        }
      : null,
    remainingCalories: data?.remainingCalories ?? null,
    remainingProtein: data?.remainingProtein ?? null,
    tasks: data?.tasks ?? [],
    achievements: data?.achievements ?? [],
    sources: data?.sources ?? null,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    isRefreshing: query.isFetching && !query.isLoading,
    refresh,
    refetch: query.refetch,
  };
}
