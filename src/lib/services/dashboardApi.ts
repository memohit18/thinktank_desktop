import {
  unwrapDailyDashboard,
  unwrapDashboardCompliance,
  unwrapDashboardStreak,
  unwrapDashboardSummary,
  unwrapDashboardToday,
} from '@/lib/fitness/dashboard/dashboardResponse';
import type {
  DailyDashboard,
  DashboardCompliance,
  DashboardStreak,
  DashboardSummary,
  DashboardToday,
} from '@/lib/fitness/dashboard/types';
import {
  isFitnessErrorEnvelope,
  isMissingFitnessProfileStatus,
} from '@/lib/fitness/fitnessResponse';
import { dashboardService } from '@/lib/services/dashboard.service';
import { apiSlice } from './apiSlice';
import {
  RTK_QUERY_FRESH_CACHE,
  withQueryDefaults,
} from './rtkQueryDefaults';

function isSkippableError(status: unknown) {
  return isMissingFitnessProfileStatus(status) || status === 404;
}

export const dashboardApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDailyDashboard: builder.query<DailyDashboard | null, void>({
      async queryFn(_arg, _queryApi, _extraOptions, baseQuery) {
        const result = await baseQuery(dashboardService.root());
        if (result.error) {
          if (isSkippableError(result.error.status)) return { data: null };
          return { error: result.error };
        }
        if (isFitnessErrorEnvelope(result.data)) return { data: null };
        return { data: unwrapDailyDashboard(result.data) };
      },
      providesTags: ['Dashboard', 'Checkin', 'Hydration', 'MealPlan', 'Workout'],
      keepUnusedDataFor: RTK_QUERY_FRESH_CACHE.keepUnusedDataFor,
    }),

    getDashboardToday: builder.query<DashboardToday | null, void>({
      async queryFn(_arg, _queryApi, _extraOptions, baseQuery) {
        const result = await baseQuery(dashboardService.today());
        if (result.error) {
          if (isSkippableError(result.error.status)) return { data: null };
          return { error: result.error };
        }
        if (isFitnessErrorEnvelope(result.data)) return { data: null };
        return { data: unwrapDashboardToday(result.data) };
      },
      providesTags: ['Dashboard'],
      keepUnusedDataFor: RTK_QUERY_FRESH_CACHE.keepUnusedDataFor,
    }),

    getDashboardCompliance: builder.query<DashboardCompliance | null, void>({
      async queryFn(_arg, _queryApi, _extraOptions, baseQuery) {
        const result = await baseQuery(dashboardService.compliance());
        if (result.error) {
          if (isSkippableError(result.error.status)) return { data: null };
          return { error: result.error };
        }
        if (isFitnessErrorEnvelope(result.data)) return { data: null };
        return { data: unwrapDashboardCompliance(result.data) };
      },
      providesTags: ['Dashboard'],
      keepUnusedDataFor: RTK_QUERY_FRESH_CACHE.keepUnusedDataFor,
    }),

    getDashboardStreak: builder.query<DashboardStreak | null, void>({
      async queryFn(_arg, _queryApi, _extraOptions, baseQuery) {
        const result = await baseQuery(dashboardService.streak());
        if (result.error) {
          if (isSkippableError(result.error.status)) return { data: null };
          return { error: result.error };
        }
        if (isFitnessErrorEnvelope(result.data)) return { data: null };
        return { data: unwrapDashboardStreak(result.data) };
      },
      providesTags: ['Dashboard'],
      keepUnusedDataFor: RTK_QUERY_FRESH_CACHE.keepUnusedDataFor,
    }),

    getDashboardSummary: builder.query<DashboardSummary | null, void>({
      async queryFn(_arg, _queryApi, _extraOptions, baseQuery) {
        const result = await baseQuery(dashboardService.summary());
        if (result.error) {
          if (isSkippableError(result.error.status)) return { data: null };
          return { error: result.error };
        }
        if (isFitnessErrorEnvelope(result.data)) return { data: null };
        return { data: unwrapDashboardSummary(result.data) };
      },
      providesTags: ['Dashboard'],
      keepUnusedDataFor: RTK_QUERY_FRESH_CACHE.keepUnusedDataFor,
    }),
  }),
  overrideExisting: true,
});

const liveDefaults = {
  ...RTK_QUERY_FRESH_CACHE,
  pollingInterval: 30_000,
  skipPollingIfUnfocused: true,
};

export const useGetDailyDashboardQuery = withQueryDefaults(
  dashboardApi.useGetDailyDashboardQuery,
  liveDefaults,
);

export const useGetDashboardTodayQuery = withQueryDefaults(
  dashboardApi.useGetDashboardTodayQuery,
  RTK_QUERY_FRESH_CACHE,
);

export const useGetDashboardComplianceQuery = withQueryDefaults(
  dashboardApi.useGetDashboardComplianceQuery,
  RTK_QUERY_FRESH_CACHE,
);

export const useGetDashboardStreakQuery = withQueryDefaults(
  dashboardApi.useGetDashboardStreakQuery,
  RTK_QUERY_FRESH_CACHE,
);

export const useGetDashboardSummaryQuery = withQueryDefaults(
  dashboardApi.useGetDashboardSummaryQuery,
  RTK_QUERY_FRESH_CACHE,
);
