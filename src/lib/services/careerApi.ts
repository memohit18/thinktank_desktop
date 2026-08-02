import type { FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import {
  formatSalaryRangeLpa,
  isCareerErrorEnvelope,
  isMissingCareerResourceStatus,
  unwrapCareerDashboard,
  unwrapCareerData,
  unwrapCareerOverview,
  unwrapCareerPreferences,
  unwrapCareerProfile,
  unwrapCareerResume,
  unwrapCareerResumes,
} from '@/lib/career/careerResponse';
import { EMPTY_CAREER_PREFERENCES } from '@/lib/career/constants';
import type {
  CareerDashboard,
  CareerOverview,
  CareerPreferences,
  CareerPreferencesPayload,
  CareerProfile,
  CareerProfilePayload,
  CareerResume,
  UpdateCareerPreferencesPayload,
  UploadCareerResumePayload,
} from '@/lib/career/types';
import { careerService } from '@/lib/services/career.service';
import { apiSlice } from './apiSlice';
import {
  RTK_QUERY_FRESH_CACHE,
  invalidateTagsOnSuccess,
  withQueryDefaults,
} from './rtkQueryDefaults';

const careerQueryOptions = {
  keepUnusedDataFor: RTK_QUERY_FRESH_CACHE.keepUnusedDataFor,
};

type BaseQueryResult = {
  data?: unknown;
  error?: FetchBaseQueryError;
};

async function readOrNull<T>(
  baseQuery: (args: string | FetchArgs) => Promise<BaseQueryResult>,
  path: string,
  unwrap: (response: unknown) => T | null,
  empty: T,
) {
  const result = await baseQuery(path);

  if (result.error) {
    if (isMissingCareerResourceStatus(result.error.status)) {
      return { data: empty };
    }
    return { error: result.error };
  }

  if (isCareerErrorEnvelope(result.data)) {
    if (isMissingCareerResourceStatus(result.data.statusCode)) {
      return { data: empty };
    }
    return {
      error: {
        status: result.data.statusCode,
        data: result.data,
      } satisfies FetchBaseQueryError,
    };
  }

  return { data: unwrap(result.data) ?? empty };
}

export const careerApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCareerOverview: builder.query<CareerOverview | null, void>({
      async queryFn(_arg, _queryApi, _extraOptions, baseQuery) {
        return readOrNull(
          async (args) => baseQuery(args),
          careerService.overview(),
          unwrapCareerOverview,
          null,
        );
      },
      providesTags: [
        'CareerDashboard',
        'CareerProfile',
        'CareerPreferences',
        'CareerResumes',
      ],
      ...careerQueryOptions,
    }),
    getCareerProfile: builder.query<CareerProfile | null, void>({
      async queryFn(_arg, _queryApi, _extraOptions, baseQuery) {
        return readOrNull(
          async (args) => baseQuery(args),
          careerService.profile(),
          unwrapCareerProfile,
          null,
        );
      },
      providesTags: ['CareerProfile'],
      ...careerQueryOptions,
    }),
    createCareerProfile: builder.mutation<CareerProfile, CareerProfilePayload>({
      query: (body) => ({
        url: careerService.profile(),
        method: 'POST',
        body,
      }),
      transformResponse: (response: unknown) => {
        const profile =
          unwrapCareerProfile(response) ??
          unwrapCareerData<CareerProfile>(response);
        if (!profile) throw new Error('Invalid career profile response');
        return profile;
      },
      invalidatesTags: invalidateTagsOnSuccess([
        'CareerProfile',
        'CareerDashboard',
      ]),
    }),
    updateCareerProfile: builder.mutation<
      CareerProfile,
      Partial<CareerProfilePayload>
    >({
      query: (body) => ({
        url: careerService.profile(),
        method: 'PATCH',
        body,
      }),
      transformResponse: (response: unknown) => {
        const profile =
          unwrapCareerProfile(response) ??
          unwrapCareerData<CareerProfile>(response);
        if (!profile) throw new Error('Invalid career profile response');
        return profile;
      },
      invalidatesTags: invalidateTagsOnSuccess([
        'CareerProfile',
        'CareerDashboard',
      ]),
    }),
    getCareerPreferences: builder.query<CareerPreferences | null, void>({
      async queryFn(_arg, _queryApi, _extraOptions, baseQuery) {
        return readOrNull(
          async (args) => baseQuery(args),
          careerService.preferences(),
          unwrapCareerPreferences,
          null,
        );
      },
      providesTags: ['CareerPreferences'],
      ...careerQueryOptions,
    }),
    createCareerPreferences: builder.mutation<
      CareerPreferences,
      CareerPreferencesPayload
    >({
      query: (body) => ({
        url: careerService.preferences(),
        method: 'POST',
        body,
      }),
      transformResponse: (response: unknown) =>
        unwrapCareerPreferences(response) ?? { ...EMPTY_CAREER_PREFERENCES },
      invalidatesTags: invalidateTagsOnSuccess([
        'CareerPreferences',
        'CareerDashboard',
      ]),
    }),
    updateCareerPreferences: builder.mutation<
      CareerPreferences,
      UpdateCareerPreferencesPayload
    >({
      query: (body) => ({
        url: careerService.preferences(),
        method: 'PATCH',
        body,
      }),
      transformResponse: (response: unknown) =>
        unwrapCareerPreferences(response) ?? { ...EMPTY_CAREER_PREFERENCES },
      invalidatesTags: invalidateTagsOnSuccess([
        'CareerPreferences',
        'CareerDashboard',
      ]),
    }),
    getCareerResumes: builder.query<CareerResume[], void>({
      async queryFn(_arg, _queryApi, _extraOptions, baseQuery) {
        return readOrNull(
          async (args) => baseQuery(args),
          careerService.resumes(),
          unwrapCareerResumes,
          [],
        );
      },
      providesTags: ['CareerResumes'],
      ...careerQueryOptions,
    }),
    uploadCareerResume: builder.mutation<
      CareerResume,
      UploadCareerResumePayload
    >({
      query: (payload) => careerService.uploadResume(payload),
      transformResponse: (response: unknown) => {
        const resume =
          unwrapCareerResume(response) ?? unwrapCareerResumes(response)[0];
        if (!resume) throw new Error('Invalid resume upload response');
        return resume;
      },
      invalidatesTags: invalidateTagsOnSuccess([
        'CareerResumes',
        'CareerDashboard',
      ]),
    }),
    setDefaultCareerResume: builder.mutation<CareerResume | null, string>({
      query: (resumeId) => ({
        url: careerService.resumeDefault(resumeId),
        method: 'PATCH',
      }),
      transformResponse: (response: unknown) =>
        unwrapCareerResume(response) ??
        unwrapCareerResumes(response)[0] ??
        null,
      invalidatesTags: invalidateTagsOnSuccess([
        'CareerResumes',
        'CareerDashboard',
      ]),
    }),
    deleteCareerResume: builder.mutation<{ id: string }, string>({
      query: (resumeId) => ({
        url: careerService.resumeById(resumeId),
        method: 'DELETE',
      }),
      transformResponse: (_response: unknown, _meta, arg) => ({ id: arg }),
      invalidatesTags: invalidateTagsOnSuccess([
        'CareerResumes',
        'CareerDashboard',
      ]),
    }),
    getCareerDashboard: builder.query<CareerDashboard | null, void>({
      async queryFn(_arg, _queryApi, _extraOptions, baseQuery) {
        const overviewResult = await readOrNull(
          async (args) => baseQuery(args),
          careerService.overview(),
          unwrapCareerOverview,
          null,
        );

        if ('error' in overviewResult && overviewResult.error) {
          return { error: overviewResult.error };
        }

        const overview = overviewResult.data;
        if (overview) {
          const dashboard = unwrapCareerDashboard({
            success: true,
            message: '',
            data: overview,
          });
          if (dashboard) return { data: dashboard };
        }

        return { data: null };
      },
      providesTags: ['CareerDashboard'],
      ...careerQueryOptions,
    }),
  }),
});

export const {
  useGetCareerOverviewQuery,
  useGetCareerProfileQuery,
  useCreateCareerProfileMutation,
  useUpdateCareerProfileMutation,
  useGetCareerPreferencesQuery,
  useCreateCareerPreferencesMutation,
  useUpdateCareerPreferencesMutation,
  useGetCareerResumesQuery,
  useUploadCareerResumeMutation,
  useSetDefaultCareerResumeMutation,
  useDeleteCareerResumeMutation,
  useGetCareerDashboardQuery,
} = careerApi;

export const useGetCareerProfileQueryWithDefaults = withQueryDefaults(
  useGetCareerProfileQuery,
  RTK_QUERY_FRESH_CACHE,
);

export { formatSalaryRangeLpa };
