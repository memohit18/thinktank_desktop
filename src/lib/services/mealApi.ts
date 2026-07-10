import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import {
  isFitnessErrorEnvelope,
  isMissingFitnessProfileStatus,
} from '@/lib/fitness/fitnessResponse';
import {
  normalizeActiveMealPlan,
  normalizeTodayMeals,
  unwrapActiveMealPlan,
  unwrapMealHistory,
  unwrapNutritionSummary,
  unwrapTodayMeals,
} from '@/lib/fitness/meals/mealResponse';
import type {
  ActiveMealPlan,
  GenerateMealPlanPayload,
  MealHistoryResponse,
  MealItem,
  MealNutritionSummary,
  ReplaceMealPayload,
  TodayMeals,
} from '@/lib/fitness/meals/types';
import { mealService } from '@/lib/services/meal.service';
import { apiSlice } from './apiSlice';
import {
  RTK_QUERY_FRESH_CACHE,
  invalidateTagsOnSuccess,
  withQueryDefaults,
} from './rtkQueryDefaults';

const mealQueryOptions = {
  keepUnusedDataFor: RTK_QUERY_FRESH_CACHE.keepUnusedDataFor,
};

export type MealHistoryParams = {
  page?: number;
  limit?: number;
};

function handleNullableMealQuery<T>(
  result: { data?: unknown; error?: FetchBaseQueryError },
  unwrap: (data: unknown) => T | null,
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

export const mealApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getActiveMealPlan: builder.query<ActiveMealPlan | null, void>({
      async queryFn(_arg, _queryApi, _extraOptions, baseQuery) {
        return handleNullableMealQuery(
          await baseQuery(mealService.active()),
          unwrapActiveMealPlan,
        ) as { data: ActiveMealPlan | null } | { error: FetchBaseQueryError };
      },
      providesTags: ['MealPlan'],
      ...mealQueryOptions,
    }),
    getTodayMeals: builder.query<TodayMeals | null, void>({
      async queryFn(_arg, _queryApi, _extraOptions, baseQuery) {
        return handleNullableMealQuery(
          await baseQuery(mealService.today()),
          unwrapTodayMeals,
        ) as { data: TodayMeals | null } | { error: FetchBaseQueryError };
      },
      providesTags: ['MealPlan'],
      ...mealQueryOptions,
    }),
    getMealNutritionSummary: builder.query<MealNutritionSummary | null, void>({
      async queryFn(_arg, _queryApi, _extraOptions, baseQuery) {
        const result = await baseQuery(mealService.summary());
        // Nutrition summary is optional enrichment — never fail the page on it.
        if (result.error) {
          return { data: null };
        }
        if (isFitnessErrorEnvelope(result.data)) {
          return { data: null };
        }
        return { data: unwrapNutritionSummary(result.data) };
      },
      providesTags: ['MealPlan'],
      ...mealQueryOptions,
    }),
    getMealPlanById: builder.query<ActiveMealPlan | null, string>({
      async queryFn(mealPlanId, _queryApi, _extraOptions, baseQuery) {
        return handleNullableMealQuery(
          await baseQuery(mealService.byId(mealPlanId)),
          unwrapActiveMealPlan,
        ) as { data: ActiveMealPlan | null } | { error: FetchBaseQueryError };
      },
      providesTags: ['MealPlan'],
      ...mealQueryOptions,
    }),
    getMealPlanSchedule: builder.query<ActiveMealPlan | null, string>({
      async queryFn(mealPlanId, _queryApi, _extraOptions, baseQuery) {
        const result = await baseQuery(mealService.schedule(mealPlanId));
        if (result.error) {
          return { data: null };
        }
        if (isFitnessErrorEnvelope(result.data)) {
          return { data: null };
        }
        const schedule = unwrapActiveMealPlan(result.data);
        if (schedule) return { data: schedule };
        return {
          data: normalizeActiveMealPlan({
            id: mealPlanId,
            ...(result.data && typeof result.data === 'object' ? result.data : {}),
          }),
        };
      },
      providesTags: ['MealPlan'],
      ...mealQueryOptions,
    }),
    getMealHistory: builder.query<MealHistoryResponse, MealHistoryParams | void>({
      query: (params) => mealService.history(params ?? undefined),
      transformResponse: (response: unknown) => unwrapMealHistory(response),
      providesTags: ['MealPlan'],
      ...mealQueryOptions,
    }),
    generateMealPlanFromDiet: builder.mutation<
      ActiveMealPlan | null,
      GenerateMealPlanPayload | void
    >({
      query: (body) => mealService.generate(body ?? undefined),
      transformResponse: (response: unknown) => unwrapActiveMealPlan(response),
      invalidatesTags: invalidateTagsOnSuccess(['MealPlan', 'Diet']),
    }),
    activateMealPlanById: builder.mutation<ActiveMealPlan | null, string>({
      query: (mealPlanId) => mealService.activate(mealPlanId),
      transformResponse: (response: unknown) => unwrapActiveMealPlan(response),
      invalidatesTags: invalidateTagsOnSuccess(['MealPlan']),
    }),
    completeMealItem: builder.mutation<TodayMeals | null, string>({
      query: (mealItemId) => mealService.complete(mealItemId),
      transformResponse: (response: unknown) => {
        const today = unwrapTodayMeals(response);
        if (today) return today;
        return null;
      },
      async onQueryStarted(mealItemId, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          mealApi.util.updateQueryData('getTodayMeals', undefined, (draft) => {
            if (!draft) return;
            const meal = draft.meals.find((item) => item.id === mealItemId);
            if (meal) meal.status = 'completed';
            const mealsCompleted = draft.meals.filter(
              (item) => item.status === 'completed',
            ).length;
            const mealsSkipped = draft.meals.filter(
              (item) => item.status === 'skipped',
            ).length;
            const mealsAssigned =
              draft.nutrition?.mealsAssigned ?? draft.meals.length;
            const mealsRemaining = Math.max(
              0,
              mealsAssigned - mealsCompleted - mealsSkipped,
            );
            draft.mealsRemaining = mealsRemaining;
            if (draft.nutrition) {
              draft.nutrition.mealsCompleted = mealsCompleted;
              draft.nutrition.mealsSkipped = mealsSkipped;
              draft.nutrition.mealsRemaining = mealsRemaining;
            }
          }),
        );
        try {
          const { data } = await queryFulfilled;
          if (data) {
            dispatch(
              mealApi.util.updateQueryData(
                'getTodayMeals',
                undefined,
                () => data,
              ),
            );
          }
        } catch {
          patch.undo();
        }
      },
      invalidatesTags: invalidateTagsOnSuccess(['MealPlan']),
    }),
    skipMealItem: builder.mutation<TodayMeals | null, string>({
      query: (mealItemId) => mealService.skip(mealItemId),
      transformResponse: (response: unknown) => unwrapTodayMeals(response),
      async onQueryStarted(mealItemId, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          mealApi.util.updateQueryData('getTodayMeals', undefined, (draft) => {
            if (!draft) return;
            const meal = draft.meals.find((item) => item.id === mealItemId);
            if (meal) meal.status = 'skipped';
            const mealsCompleted = draft.meals.filter(
              (item) => item.status === 'completed',
            ).length;
            const mealsSkipped = draft.meals.filter(
              (item) => item.status === 'skipped',
            ).length;
            const mealsAssigned =
              draft.nutrition?.mealsAssigned ?? draft.meals.length;
            const mealsRemaining = Math.max(
              0,
              mealsAssigned - mealsCompleted - mealsSkipped,
            );
            draft.mealsRemaining = mealsRemaining;
            if (draft.nutrition) {
              draft.nutrition.mealsCompleted = mealsCompleted;
              draft.nutrition.mealsSkipped = mealsSkipped;
              draft.nutrition.mealsRemaining = mealsRemaining;
            }
          }),
        );
        try {
          const { data } = await queryFulfilled;
          if (data) {
            dispatch(
              mealApi.util.updateQueryData(
                'getTodayMeals',
                undefined,
                () => data,
              ),
            );
          }
        } catch {
          patch.undo();
        }
      },
      invalidatesTags: invalidateTagsOnSuccess(['MealPlan']),
    }),
    replaceMealItem: builder.mutation<TodayMeals | MealItem | null, ReplaceMealPayload>({
      query: ({ mealItemId, foodId, quantity }) =>
        mealService.replace(mealItemId, { foodId, quantity }),
      transformResponse: (response: unknown) => {
        const today = unwrapTodayMeals(response);
        if (today) return today;
        const plan = normalizeTodayMeals(response);
        if (plan) return plan;
        return null;
      },
      invalidatesTags: invalidateTagsOnSuccess(['MealPlan']),
    }),
  }),
  overrideExisting: true,
});

export const useGetActiveMealPlanQuery = withQueryDefaults(
  mealApi.useGetActiveMealPlanQuery,
  RTK_QUERY_FRESH_CACHE,
);
export const useGetTodayMealsQuery = withQueryDefaults(
  mealApi.useGetTodayMealsQuery,
  RTK_QUERY_FRESH_CACHE,
);
export const useGetMealNutritionSummaryQuery = withQueryDefaults(
  mealApi.useGetMealNutritionSummaryQuery,
  RTK_QUERY_FRESH_CACHE,
);
export const useGetMealPlanByIdQuery = withQueryDefaults(
  mealApi.useGetMealPlanByIdQuery,
  RTK_QUERY_FRESH_CACHE,
);
export const useGetMealPlanScheduleQuery = withQueryDefaults(
  mealApi.useGetMealPlanScheduleQuery,
  RTK_QUERY_FRESH_CACHE,
);
export const useGetMealHistoryQuery = withQueryDefaults(
  mealApi.useGetMealHistoryQuery,
  RTK_QUERY_FRESH_CACHE,
);

export const {
  useGenerateMealPlanFromDietMutation,
  useActivateMealPlanByIdMutation,
  useCompleteMealItemMutation,
  useSkipMealItemMutation,
  useReplaceMealItemMutation,
} = mealApi;
