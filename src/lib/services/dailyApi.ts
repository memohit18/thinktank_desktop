import {
  isFitnessErrorEnvelope,
  isMissingFitnessProfileStatus,
} from '@/lib/fitness/fitnessResponse';
import { unwrapDailyCheckin } from '@/lib/fitness/execution/executionResponse';
import type { DailyCheckinScore } from '@/lib/fitness/execution/types';
import { dailyService } from '@/lib/services/daily.service';
import { apiSlice } from './apiSlice';
import {
  RTK_QUERY_FRESH_CACHE,
  invalidateTagsOnSuccess,
  withQueryDefaults,
} from './rtkQueryDefaults';

export const dailyApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getTodayCheckin: builder.query<DailyCheckinScore | null, void>({
      async queryFn(_arg, _queryApi, _extraOptions, baseQuery) {
        const result = await baseQuery(dailyService.today());
        if (result.error) {
          if (
            isMissingFitnessProfileStatus(result.error.status) ||
            result.error.status === 404
          ) {
            return { data: null };
          }
          return { error: result.error };
        }
        if (isFitnessErrorEnvelope(result.data)) {
          return { data: null };
        }
        return { data: unwrapDailyCheckin(result.data) };
      },
      providesTags: ['Checkin'],
      keepUnusedDataFor: RTK_QUERY_FRESH_CACHE.keepUnusedDataFor,
    }),
    refreshTodayCheckin: builder.mutation<DailyCheckinScore | null, void>({
      query: () => dailyService.refresh(),
      transformResponse: (response: unknown) => unwrapDailyCheckin(response),
      invalidatesTags: invalidateTagsOnSuccess(['Checkin']),
    }),
  }),
  overrideExisting: true,
});

export const useGetTodayCheckinQuery = withQueryDefaults(
  dailyApi.useGetTodayCheckinQuery,
  RTK_QUERY_FRESH_CACHE,
);

export const { useRefreshTodayCheckinMutation } = dailyApi;
