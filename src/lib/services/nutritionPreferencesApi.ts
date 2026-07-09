import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import {
  isFitnessErrorEnvelope,
  isMissingFitnessProfileStatus,
} from '@/lib/fitness/fitnessResponse';
import {
  nutritionPreferencesService,
  unwrapNutritionPreferences,
} from '@/lib/services/nutrition-preferences.service';
import { apiSlice } from './apiSlice';
import { RTK_QUERY_FRESH_CACHE } from './rtkQueryDefaults';
import type {
  NutritionPreferences,
  NutritionPreferencesPayload,
} from '@/types/nutrition-preferences';

const nutritionQueryOptions = RTK_QUERY_FRESH_CACHE;

export const nutritionPreferencesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getNutritionPreferences: builder.query<NutritionPreferences | null, void>({
      async queryFn(_arg, _queryApi, _extraOptions, baseQuery) {
        const result = await baseQuery(nutritionPreferencesService.get());

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

        return { data: unwrapNutritionPreferences(result.data) };
      },
      providesTags: ['NutritionPreferences'],
      ...nutritionQueryOptions,
    }),
    createNutritionPreferences: builder.mutation<
      NutritionPreferences,
      NutritionPreferencesPayload
    >({
      query: (payload) => nutritionPreferencesService.create(payload),
      transformResponse: (response: unknown) => {
        const preferences = unwrapNutritionPreferences(response);

        if (!preferences) {
          throw new Error('Invalid nutrition preferences response');
        }

        return preferences;
      },
      invalidatesTags: ['NutritionPreferences'],
    }),
    updateNutritionPreferences: builder.mutation<
      NutritionPreferences,
      NutritionPreferencesPayload
    >({
      query: (payload) => nutritionPreferencesService.update(payload),
      transformResponse: (response: unknown) => {
        const preferences = unwrapNutritionPreferences(response);

        if (!preferences) {
          throw new Error('Invalid nutrition preferences response');
        }

        return preferences;
      },
      invalidatesTags: ['NutritionPreferences'],
    }),
    deleteNutritionPreferences: builder.mutation<void, void>({
      query: () => nutritionPreferencesService.delete(),
      invalidatesTags: ['NutritionPreferences'],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetNutritionPreferencesQuery,
  useCreateNutritionPreferencesMutation,
  useUpdateNutritionPreferencesMutation,
  useDeleteNutritionPreferencesMutation,
} = nutritionPreferencesApi;
