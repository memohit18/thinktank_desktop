import {
  isFitnessErrorEnvelope,
  isMissingFitnessProfileStatus,
} from '@/lib/fitness/fitnessResponse';
import { unwrapHydrationToday } from '@/lib/fitness/execution/executionResponse';
import type { HydrationToday } from '@/lib/fitness/execution/types';
import { hydrationService } from '@/lib/services/hydration.service';
import { apiSlice } from './apiSlice';
import {
  RTK_QUERY_FRESH_CACHE,
  invalidateTagsOnSuccess,
  withQueryDefaults,
} from './rtkQueryDefaults';

export const hydrationApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getHydrationToday: builder.query<HydrationToday | null, void>({
      async queryFn(_arg, _queryApi, _extraOptions, baseQuery) {
        const result = await baseQuery(hydrationService.today());
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
        return { data: unwrapHydrationToday(result.data) };
      },
      providesTags: ['Hydration', 'Checkin'],
      keepUnusedDataFor: RTK_QUERY_FRESH_CACHE.keepUnusedDataFor,
    }),
    logHydration: builder.mutation<HydrationToday | null, number>({
      query: (amountMl) => hydrationService.log(amountMl),
      transformResponse: (response: unknown) => unwrapHydrationToday(response),
      async onQueryStarted(amountMl, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          hydrationApi.util.updateQueryData(
            'getHydrationToday',
            undefined,
            (draft) => {
              if (!draft) return;
              draft.amountMl += amountMl;
              draft.remainingMl = Math.max(0, draft.goalMl - draft.amountMl);
              draft.percent =
                draft.goalMl > 0
                  ? Math.min(100, (draft.amountMl / draft.goalMl) * 100)
                  : 0;
            },
          ),
        );
        try {
          const { data } = await queryFulfilled;
          if (data) {
            dispatch(
              hydrationApi.util.updateQueryData(
                'getHydrationToday',
                undefined,
                () => data,
              ),
            );
          }
        } catch {
          patch.undo();
        }
      },
      invalidatesTags: invalidateTagsOnSuccess(['Hydration', 'Checkin', 'Dashboard']),
    }),
  }),
  overrideExisting: true,
});

export const useGetHydrationTodayQuery = withQueryDefaults(
  hydrationApi.useGetHydrationTodayQuery,
  RTK_QUERY_FRESH_CACHE,
);

export const { useLogHydrationMutation } = hydrationApi;
