import {
  isFitnessErrorEnvelope,
  isMissingFitnessProfileStatus,
} from '@/lib/fitness/fitnessResponse';
import {
  unwrapLatestProgress,
  unwrapPresignedUpload,
  unwrapProgressAnalytics,
  unwrapProgressDashboard,
  unwrapProgressEntry,
  unwrapProgressHistory,
  unwrapProgressPhotos,
  normalizeProgressPhotoSet,
} from '@/lib/fitness/progress/progressResponse';
import type {
  AddProgressPayload,
  PresignedUploadPayload,
  PresignedUploadResult,
  ProgressAnalytics,
  ProgressDashboard,
  ProgressEntry,
  ProgressHistoryResponse,
  ProgressPhotoSet,
  ProgressPhotosResponse,
  SaveProgressPhotosPayload,
} from '@/lib/fitness/progress/types';
import {
  progressService,
  type ProgressHistoryParams,
} from '@/lib/services/progress.service';
import { apiSlice } from './apiSlice';
import {
  RTK_QUERY_FRESH_CACHE,
  invalidateTagsOnSuccess,
  withQueryDefaults,
} from './rtkQueryDefaults';

const progressQueryOptions = {
  keepUnusedDataFor: RTK_QUERY_FRESH_CACHE.keepUnusedDataFor,
};

export type { ProgressHistoryParams };

export const progressApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProgressDashboard: builder.query<ProgressDashboard | null, void>({
      async queryFn(_arg, _queryApi, _extraOptions, baseQuery) {
        const result = await baseQuery(progressService.dashboard());
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
        return { data: unwrapProgressDashboard(result.data) };
      },
      providesTags: ['Progress'],
      ...progressQueryOptions,
    }),
    getProgressHistory: builder.query<
      ProgressHistoryResponse,
      ProgressHistoryParams | void
    >({
      async queryFn(params, _queryApi, _extraOptions, baseQuery) {
        const result = await baseQuery(
          progressService.history(params ?? undefined),
        );
        if (result.error) {
          if (
            isMissingFitnessProfileStatus(result.error.status) ||
            result.error.status === 404
          ) {
            return { data: { items: [] } };
          }
          return { error: result.error };
        }
        if (isFitnessErrorEnvelope(result.data)) {
          return { data: { items: [] } };
        }
        return { data: unwrapProgressHistory(result.data) };
      },
      providesTags: ['Progress'],
      ...progressQueryOptions,
    }),
    getLatestProgress: builder.query<ProgressEntry | null, void>({
      async queryFn(_arg, _queryApi, _extraOptions, baseQuery) {
        const latestResult = await baseQuery(progressService.latest());
        if (!latestResult.error && !isFitnessErrorEnvelope(latestResult.data)) {
          return { data: unwrapLatestProgress(latestResult.data) };
        }
        if (
          latestResult.error &&
          !isMissingFitnessProfileStatus(latestResult.error.status) &&
          latestResult.error.status !== 404
        ) {
          return { error: latestResult.error };
        }
        return { data: null };
      },
      providesTags: ['Progress'],
      ...progressQueryOptions,
    }),
    getProgressAnalytics: builder.query<ProgressAnalytics | null, void>({
      async queryFn(_arg, _queryApi, _extraOptions, baseQuery) {
        const result = await baseQuery(progressService.analytics());
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
        return { data: unwrapProgressAnalytics(result.data) };
      },
      providesTags: ['Progress'],
      ...progressQueryOptions,
    }),
    getProgressPhotos: builder.query<
      ProgressPhotosResponse,
      { page?: number; limit?: number } | void
    >({
      async queryFn(params, _queryApi, _extraOptions, baseQuery) {
        const result = await baseQuery(
          progressService.photos(params ?? undefined),
        );
        if (result.error) {
          return { data: { items: [] } };
        }
        if (isFitnessErrorEnvelope(result.data)) {
          return { data: { items: [] } };
        }
        return { data: unwrapProgressPhotos(result.data) };
      },
      providesTags: ['Progress'],
      ...progressQueryOptions,
    }),
    addProgressEntry: builder.mutation<ProgressEntry | null, AddProgressPayload>({
      query: (body) => progressService.create(body),
      transformResponse: (response: unknown) => unwrapProgressEntry(response),
      async onQueryStarted(payload, { dispatch, queryFulfilled }) {
        const tempId = `temp-${Date.now()}`;
        const optimistic: ProgressEntry = {
          id: tempId,
          recordedAt: new Date().toISOString(),
          weightKg: payload.weightKg ?? null,
          bodyFatPercentage: payload.bodyFatPercentage ?? null,
          waistCm: payload.waistCm ?? null,
          chestCm: payload.chestCm ?? null,
          armCm: payload.armCm ?? null,
          thighCm: payload.thighCm ?? null,
          notes: payload.notes ?? null,
        };

        const historyPatch = dispatch(
          progressApi.util.updateQueryData(
            'getProgressHistory',
            { page: 1, limit: 50 },
            (draft) => {
              const existingIndex = draft.items.findIndex(
                (item) =>
                  item.recordedAt.slice(0, 10) ===
                  optimistic.recordedAt.slice(0, 10),
              );
              if (existingIndex >= 0) draft.items[existingIndex] = optimistic;
              else draft.items.push(optimistic);
            },
          ),
        );
        const latestPatch = dispatch(
          progressApi.util.updateQueryData(
            'getLatestProgress',
            undefined,
            () => optimistic,
          ),
        );

        try {
          const { data } = await queryFulfilled;
          if (data) {
            dispatch(
              progressApi.util.updateQueryData(
                'getProgressHistory',
                { page: 1, limit: 50 },
                (draft) => {
                  const index = draft.items.findIndex(
                    (item) =>
                      item.id === tempId ||
                      item.recordedAt.slice(0, 10) ===
                        data.recordedAt.slice(0, 10),
                  );
                  if (index >= 0) draft.items[index] = data;
                  else draft.items.push(data);
                },
              ),
            );
            dispatch(
              progressApi.util.updateQueryData(
                'getLatestProgress',
                undefined,
                () => data,
              ),
            );
          }
        } catch {
          historyPatch.undo();
          latestPatch.undo();
        }
      },
      invalidatesTags: invalidateTagsOnSuccess(['Progress']),
    }),
    saveProgressPhotos: builder.mutation<
      ProgressPhotoSet | null,
      SaveProgressPhotosPayload
    >({
      query: (body) => progressService.savePhotos(body),
      transformResponse: (response: unknown) => {
        const data = unwrapFitnessDataSafe(response);
        return normalizeProgressPhotoSet(data);
      },
      invalidatesTags: invalidateTagsOnSuccess(['Progress']),
    }),
    deleteProgressPhotos: builder.mutation<{ id: string } | null, string>({
      query: (id) => progressService.deletePhotos(id),
      invalidatesTags: invalidateTagsOnSuccess(['Progress']),
    }),
    getPresignedUploadUrl: builder.mutation<
      PresignedUploadResult | null,
      PresignedUploadPayload
    >({
      query: (body) => progressService.uploadPresigned(body),
      transformResponse: (response: unknown) => unwrapPresignedUpload(response),
    }),
  }),
  overrideExisting: true,
});

function unwrapFitnessDataSafe(response: unknown) {
  if (!response || typeof response !== 'object') return response;
  if ('data' in response) return (response as { data: unknown }).data;
  return response;
}

export const useGetProgressDashboardQuery = withQueryDefaults(
  progressApi.useGetProgressDashboardQuery,
  RTK_QUERY_FRESH_CACHE,
);
export const useGetProgressHistoryQuery = withQueryDefaults(
  progressApi.useGetProgressHistoryQuery,
  RTK_QUERY_FRESH_CACHE,
);
export const useGetLatestProgressQuery = withQueryDefaults(
  progressApi.useGetLatestProgressQuery,
  RTK_QUERY_FRESH_CACHE,
);
export const useGetProgressAnalyticsQuery = withQueryDefaults(
  progressApi.useGetProgressAnalyticsQuery,
  RTK_QUERY_FRESH_CACHE,
);
export const useGetProgressPhotosQuery = withQueryDefaults(
  progressApi.useGetProgressPhotosQuery,
  RTK_QUERY_FRESH_CACHE,
);

export const {
  useAddProgressEntryMutation,
  useSaveProgressPhotosMutation,
  useDeleteProgressPhotosMutation,
  useGetPresignedUploadUrlMutation,
} = progressApi;
