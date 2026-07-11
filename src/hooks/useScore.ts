'use client';

import { useGetDashboardTodayQuery } from '@/lib/services/dashboardApi';

/** Focused score card from GET /dashboard/today */
export function useScore() {
  const query = useGetDashboardTodayQuery();
  const data = query.data ?? null;

  return {
    score: data?.todayScore ?? null,
    todayScore: data?.todayScore ?? null,
    breakdown: data?.breakdown ?? null,
    weights: data?.weights ?? null,
    meals: data?.meals ?? null,
    workout: data?.workout ?? null,
    water: data?.water ?? null,
    calories: data?.calories ?? null,
    protein: data?.protein ?? null,
    remainingCalories: data?.remainingCalories ?? null,
    remainingProtein: data?.remainingProtein ?? null,
    compliancePercent: data?.compliance ?? null,
    compliance: data?.compliance ?? null,
    checkin: data?.checkin ?? null,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    refetch: query.refetch,
  };
}
