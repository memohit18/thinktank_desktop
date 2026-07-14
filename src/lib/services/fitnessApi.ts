import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type {
  FitnessPlans,
  FitnessProfile,
  FitnessProfilePayload,
  PhysiqueGoal,
  CreatePhysiqueGoalPayload,
  UpdatePhysiqueGoalPayload,
} from '@/lib/fitness/types';
import {
  isFitnessErrorEnvelope,
  isMissingFitnessProfileStatus,
  unwrapFitnessData,
  unwrapFitnessPlans,
  unwrapFitnessProfile,
  unwrapPhysiqueGoals,
} from '@/lib/fitness/fitnessResponse';
import { normalizePhysiqueGoal } from '@/lib/fitness/physiqueGoalMapper';
import { apiSlice } from './apiSlice';
import {
  RTK_QUERY_FRESH_CACHE,
  invalidateTagsOnSuccess,
  withQueryDefaults,
} from './rtkQueryDefaults';

const fitnessProfileQueryOptions = {
  keepUnusedDataFor: RTK_QUERY_FRESH_CACHE.keepUnusedDataFor,
};

const PROFILE_READ_PATHS = ['/fitness/profile', '/fitness-profile'] as const;

async function fetchFitnessProfile(
  baseQuery: (path: string) => Promise<{ data?: unknown; error?: FetchBaseQueryError }>,
) {
  let lastError: FetchBaseQueryError | undefined;
  let sawMissingProfile = false;

  for (const path of PROFILE_READ_PATHS) {
    const result = await baseQuery(path);

    if (result.error) {
      if (isMissingFitnessProfileStatus(result.error.status)) {
        sawMissingProfile = true;
        continue;
      }

      return { error: result.error };
    }

    if (isFitnessErrorEnvelope(result.data)) {
      if (isMissingFitnessProfileStatus(result.data.statusCode)) {
        sawMissingProfile = true;
        continue;
      }

      return {
        error: {
          status: result.data.statusCode,
          data: result.data,
        } satisfies FetchBaseQueryError,
      };
    }

    const profile = unwrapFitnessProfile(result.data);
    if (profile) {
      return { data: profile };
    }

    sawMissingProfile = true;
  }

  if (sawMissingProfile) {
    return { data: null as FitnessProfile | null };
  }

  return {
    error: lastError ?? ({ status: 404, data: 'Fitness profile not found' } satisfies FetchBaseQueryError),
  };
}

export const fitnessApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getFitnessGoals: builder.query<PhysiqueGoal[], void>({
      query: () => '/fitness/goals',
      transformResponse: (response: unknown) => unwrapPhysiqueGoals(response),
      providesTags: ['FitnessGoals'],
      ...fitnessProfileQueryOptions,
    }),
    getFitnessProfile: builder.query<FitnessProfile | null, void>({
      async queryFn(_arg, _queryApi, _extraOptions, baseQuery) {
        return fetchFitnessProfile(async (path) => {
          const result = await baseQuery(path);
          return result;
        });
      },
      providesTags: ['FitnessProfile'],
      ...fitnessProfileQueryOptions,
    }),
    getFitnessPlans: builder.query<FitnessPlans | null, void>({
      async queryFn(_arg, _queryApi, _extraOptions, baseQuery) {
        const result = await baseQuery('/fitness/plans');
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
        return { data: unwrapFitnessPlans(result.data) };
      },
      providesTags: ['FitnessProfile', 'Transformation'],
      ...fitnessProfileQueryOptions,
    }),
    createFitnessProfile: builder.mutation<FitnessProfile, FitnessProfilePayload>({
      query: (body) => ({
        url: '/fitness/profile',
        method: 'POST',
        body,
      }),
      transformResponse: (response: unknown) => {
        const profile = unwrapFitnessProfile(response) ?? unwrapFitnessData<FitnessProfile>(response);
        if (!profile) {
          throw new Error('Invalid fitness profile response');
        }
        return profile;
      },
      invalidatesTags: ['FitnessProfile', 'Transformation'],
    }),
    updateFitnessProfile: builder.mutation<
      FitnessProfile,
      Partial<FitnessProfilePayload>
    >({
      query: (body) => ({
        url: '/fitness/profile',
        method: 'PATCH',
        body,
      }),
      transformResponse: (response: unknown) => {
        const profile = unwrapFitnessProfile(response) ?? unwrapFitnessData<FitnessProfile>(response);
        if (!profile) {
          throw new Error('Invalid fitness profile response');
        }
        return profile;
      },
      invalidatesTags: ['FitnessProfile', 'Transformation'],
    }),
    createFitnessGoal: builder.mutation<PhysiqueGoal, CreatePhysiqueGoalPayload>({
      query: (body) => ({
        url: '/fitness/goals',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      }),
      transformResponse: (response: unknown) => {
        const data = unwrapFitnessData(response) ?? response;
        const goal = normalizePhysiqueGoal(
          data && typeof data === 'object' && 'goal' in (data as object)
            ? (data as { goal: unknown }).goal
            : data,
        );
        if (!goal) throw new Error('Invalid fitness goal response');
        return goal;
      },
      invalidatesTags: invalidateTagsOnSuccess(['FitnessGoals']),
    }),
    updateFitnessGoal: builder.mutation<
      PhysiqueGoal,
      { goalId: string; body: UpdatePhysiqueGoalPayload }
    >({
      query: ({ goalId, body }) => ({
        url: `/fitness/goals/${encodeURIComponent(goalId)}`,
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body,
      }),
      transformResponse: (response: unknown) => {
        const data = unwrapFitnessData(response) ?? response;
        const goal = normalizePhysiqueGoal(
          data && typeof data === 'object' && 'goal' in (data as object)
            ? (data as { goal: unknown }).goal
            : data,
        );
        if (!goal) throw new Error('Invalid fitness goal response');
        return goal;
      },
      invalidatesTags: invalidateTagsOnSuccess(['FitnessGoals']),
    }),
  }),
  overrideExisting: true,
});

export const {
  useCreateFitnessProfileMutation,
  useUpdateFitnessProfileMutation,
  useCreateFitnessGoalMutation,
  useUpdateFitnessGoalMutation,
} = fitnessApi;

export const useGetFitnessGoalsQuery = withQueryDefaults(
  fitnessApi.useGetFitnessGoalsQuery,
  RTK_QUERY_FRESH_CACHE,
);
export const useGetFitnessProfileQuery = withQueryDefaults(
  fitnessApi.useGetFitnessProfileQuery,
  RTK_QUERY_FRESH_CACHE,
);
export const useGetFitnessPlansQuery = withQueryDefaults(
  fitnessApi.useGetFitnessPlansQuery,
  RTK_QUERY_FRESH_CACHE,
);

export { fitnessProfileQueryOptions };
