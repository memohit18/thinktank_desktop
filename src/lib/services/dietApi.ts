import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import {
  isFitnessErrorEnvelope,
  isMissingFitnessProfileStatus,
} from '@/lib/fitness/fitnessResponse';
import {
  unwrapDietHistory,
  unwrapDietPlan,
  unwrapDietPlanner,
} from '@/lib/fitness/diet/dietResponse';
import type {
  DietFromTargetsPayload,
  DietHistoryResponse,
  DietHydrationPayload,
  DietManualCreatePayload,
  DietPlan,
  DietPlanner,
  MealPlanGeneratePayload,
} from '@/lib/fitness/diet/types';
import { dietService, mealPlansService } from '@/lib/services/diet.service';
import { apiSlice } from './apiSlice';
import {
  RTK_QUERY_FRESH_CACHE,
  invalidateTagsOnSuccess,
  withQueryDefaults,
} from './rtkQueryDefaults';

const dietQueryOptions = {
  keepUnusedDataFor: RTK_QUERY_FRESH_CACHE.keepUnusedDataFor,
};

export type DietHistoryParams = {
  page?: number;
  limit?: number;
};

function handleNullableDietQuery(
  result: { data?: unknown; error?: FetchBaseQueryError },
  unwrap: (data: unknown) => DietPlan | DietPlanner | null,
) {
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

  return { data: unwrap(result.data) };
}

export const dietApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getActiveDiet: builder.query<DietPlan | null, void>({
      async queryFn(_arg, _queryApi, _extraOptions, baseQuery) {
        return handleNullableDietQuery(
          await baseQuery(dietService.getActive()),
          unwrapDietPlan,
        ) as { data: DietPlan | null } | { error: FetchBaseQueryError };
      },
      providesTags: ['Diet'],
      ...dietQueryOptions,
    }),
    getDietPlanner: builder.query<DietPlanner | null, string | void>({
      async queryFn(date, _queryApi, _extraOptions, baseQuery) {
        return handleNullableDietQuery(
          await baseQuery(dietService.getPlanner(date || undefined)),
          unwrapDietPlanner,
        ) as { data: DietPlanner | null } | { error: FetchBaseQueryError };
      },
      providesTags: ['Diet'],
      ...dietQueryOptions,
    }),
    generateDiet: builder.mutation<DietPlan, void>({
      query: () => dietService.generate(),
      transformResponse: (response: unknown) => {
        const plan = unwrapDietPlan(response);
        if (!plan) {
          throw new Error('Invalid diet plan response');
        }
        return plan;
      },
      invalidatesTags: invalidateTagsOnSuccess(['Diet']),
    }),
    regenerateDiet: builder.mutation<DietPlan, void>({
      query: () => dietService.regenerate(),
      transformResponse: (response: unknown) => {
        const plan = unwrapDietPlan(response);
        if (!plan) {
          throw new Error('Invalid diet plan response');
        }
        return plan;
      },
      invalidatesTags: invalidateTagsOnSuccess(['Diet']),
    }),
    generateDietTargets: builder.mutation<DietPlan, void>({
      query: () => dietService.generateTargets(),
      transformResponse: (response: unknown) => {
        const plan = unwrapDietPlan(response);
        if (!plan) {
          throw new Error('Invalid diet targets response');
        }
        return plan;
      },
      invalidatesTags: invalidateTagsOnSuccess(['Diet']),
    }),
    createDietFromTargets: builder.mutation<DietPlan, DietFromTargetsPayload>({
      query: (body) => dietService.fromTargets(body),
      transformResponse: (response: unknown) => {
        const plan = unwrapDietPlan(response);
        if (!plan) {
          throw new Error('Invalid diet from-targets response');
        }
        return plan;
      },
      invalidatesTags: invalidateTagsOnSuccess(['Diet']),
    }),
    createDiet: builder.mutation<DietPlan, DietManualCreatePayload>({
      query: (body) => dietService.create(body),
      transformResponse: (response: unknown) => {
        const plan = unwrapDietPlan(response);
        if (!plan) {
          throw new Error('Invalid diet create response');
        }
        return plan;
      },
      invalidatesTags: invalidateTagsOnSuccess(['Diet']),
    }),
    getDietHistory: builder.query<DietHistoryResponse, DietHistoryParams | void>({
      query: (params) => dietService.history(params ?? undefined),
      transformResponse: (response: unknown) => unwrapDietHistory(response),
      providesTags: ['Diet'],
      ...dietQueryOptions,
    }),
    activateDiet: builder.mutation<DietPlan | null, string>({
      query: (dietPlanId) => dietService.activate(dietPlanId),
      transformResponse: (response: unknown) => unwrapDietPlan(response),
      invalidatesTags: invalidateTagsOnSuccess(['Diet']),
    }),
    deleteDiet: builder.mutation<void, string>({
      query: (dietPlanId) => dietService.delete(dietPlanId),
      invalidatesTags: invalidateTagsOnSuccess(['Diet']),
    }),
    updateDietHydration: builder.mutation<DietPlanner | null, DietHydrationPayload>({
      query: (body) => dietService.updateHydration(body),
      transformResponse: (response: unknown) => unwrapDietPlanner(response),
      invalidatesTags: invalidateTagsOnSuccess(['Diet']),
    }),
    generateMealPlanAi: builder.mutation<unknown, MealPlanGeneratePayload>({
      query: (body) =>
        mealPlansService.generateAi({
          dietPlanId: body.dietPlanId,
          planType: body.planType ?? 'weekly',
          days: body.days ?? 7,
        }),
      invalidatesTags: invalidateTagsOnSuccess(['Diet']),
    }),
    generateMealPlan: builder.mutation<unknown, MealPlanGeneratePayload>({
      query: (body) =>
        mealPlansService.generate({
          dietPlanId: body.dietPlanId,
          planType: body.planType ?? 'weekly',
          days: body.days ?? 7,
        }),
      invalidatesTags: invalidateTagsOnSuccess(['Diet']),
    }),
    activateMealPlan: builder.mutation<unknown, string>({
      query: (mealPlanId) => mealPlansService.activate(mealPlanId),
      invalidatesTags: invalidateTagsOnSuccess(['Diet']),
    }),
  }),
  overrideExisting: true,
});

export const useGetActiveDietQuery = withQueryDefaults(
  dietApi.useGetActiveDietQuery,
  RTK_QUERY_FRESH_CACHE,
);
export const useGetDietPlannerQuery = withQueryDefaults(
  dietApi.useGetDietPlannerQuery,
  RTK_QUERY_FRESH_CACHE,
);
export const useGetDietHistoryQuery = withQueryDefaults(
  dietApi.useGetDietHistoryQuery,
  RTK_QUERY_FRESH_CACHE,
);
export const {
  useGenerateDietMutation,
  useRegenerateDietMutation,
  useGenerateDietTargetsMutation,
  useCreateDietFromTargetsMutation,
  useCreateDietMutation,
  useActivateDietMutation,
  useDeleteDietMutation,
  useUpdateDietHydrationMutation,
  useGenerateMealPlanAiMutation,
  useGenerateMealPlanMutation,
  useActivateMealPlanMutation,
} = dietApi;
