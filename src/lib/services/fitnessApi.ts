import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type {
  FitnessProfile,
  FitnessProfilePayload,
  PhysiqueGoal,
} from '@/lib/fitness/types';
import {
  isFitnessErrorEnvelope,
  isMissingFitnessProfileStatus,
  unwrapFitnessData,
  unwrapFitnessProfile,
  unwrapPhysiqueGoals,
} from '@/lib/fitness/fitnessResponse';
import { apiSlice } from './apiSlice';

const fitnessProfileQueryOptions = {
  refetchOnMountOrArgChange: true as const,
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
    getPhysiqueGoals: builder.query<PhysiqueGoal[], void>({
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
  }),
  overrideExisting: true,
});

export const {
  useGetPhysiqueGoalsQuery,
  useGetFitnessProfileQuery,
  useCreateFitnessProfileMutation,
  useUpdateFitnessProfileMutation,
} = fitnessApi;

export { fitnessProfileQueryOptions };
