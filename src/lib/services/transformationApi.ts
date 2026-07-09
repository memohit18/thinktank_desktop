import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type {
  Transformation,
  TransformationHistoryResponse,
  TransformationMilestone,
} from '@/lib/fitness/transformation/types';
import {
  isFitnessErrorEnvelope,
  isMissingFitnessProfileStatus,
} from '@/lib/fitness/fitnessResponse';
import {
  unwrapTransformation,
  unwrapTransformationHistory,
  unwrapTransformationMilestones,
} from '@/lib/fitness/transformation/transformationResponse';
import { apiSlice } from './apiSlice';
import { RTK_QUERY_FRESH_CACHE } from './rtkQueryDefaults';

const transformationQueryOptions = RTK_QUERY_FRESH_CACHE;

export type TransformationHistoryParams = {
  page?: number;
  limit?: number;
};

export const transformationApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getActiveTransformation: builder.query<Transformation | null, void>({
      async queryFn(_arg, _queryApi, _extraOptions, baseQuery) {
        const result = await baseQuery('/transformation/active');

        if (result.error) {
          if (isMissingFitnessProfileStatus(result.error.status)) {
            return { data: null };
          }

          return { error: result.error };
        }

        if (isFitnessErrorEnvelope(result.data)) {
          if (isMissingFitnessProfileStatus(result.data.statusCode)) {
            return { data: null };
          }

          return {
            error: {
              status: result.data.statusCode,
              data: result.data,
            } satisfies FetchBaseQueryError,
          };
        }

        return { data: unwrapTransformation(result.data) };
      },
      providesTags: ['Transformation'],
      ...transformationQueryOptions,
    }),
    generateTransformation: builder.mutation<Transformation, void>({
      query: () => ({
        url: '/transformation/generate',
        method: 'POST',
      }),
      transformResponse: (response: unknown) => {
        const transformation = unwrapTransformation(response);
        if (!transformation) {
          throw new Error('Invalid transformation response');
        }
        return transformation;
      },
      invalidatesTags: ['Transformation'],
    }),
    getTransformationHistory: builder.query<
      TransformationHistoryResponse,
      TransformationHistoryParams | void
    >({
      query: (params) => {
        const page = params?.page ?? 1;
        const limit = params?.limit ?? 20;
        return `/transformation/history?page=${page}&limit=${limit}`;
      },
      transformResponse: (response: unknown) => unwrapTransformationHistory(response),
      providesTags: ['Transformation'],
      ...transformationQueryOptions,
    }),
    getTransformationMilestones: builder.query<TransformationMilestone[], string>({
      query: (transformationId) => `/transformation/${transformationId}/milestones`,
      transformResponse: (response: unknown) => unwrapTransformationMilestones(response),
      providesTags: (_result, _error, id) => [{ type: 'Transformation', id }],
      ...transformationQueryOptions,
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetActiveTransformationQuery,
  useGenerateTransformationMutation,
  useGetTransformationHistoryQuery,
  useGetTransformationMilestonesQuery,
} = transformationApi;
