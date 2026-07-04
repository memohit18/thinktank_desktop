import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { apiSlice } from '@/lib/services/apiSlice';
import type {
  ApiAiChatResponse,
  ApiDietHistoryItem,
  ApiDietPlannerResponse,
  ApiFoodItem,
} from '@/lib/fitforge/dietPlannerApiTypes';
import {
  createEmptyDietPlannerDashboard,
  mapDietPlannerResponse,
} from '@/lib/fitforge/dietPlannerMapper';
import type { DietPlannerDashboard } from '@/lib/fitforge/dietPlannerTypes';
import {
  type FitForgePaginatedData,
  type FitForgeResponse,
  unwrapFitForgeData,
} from '@/lib/fitness/fitForgeResponse';

function isNotFound(error?: FetchBaseQueryError) {
  return error?.status === 404;
}

function todayDateParam() {
  return new Date().toISOString().slice(0, 10);
}

export const fitforgeApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDietPlannerDashboard: builder.query<
      DietPlannerDashboard,
      { date?: string } | void
    >({
      async queryFn(arg, _api, _extraOptions, fetchWithBQ) {
        const date = arg?.date ?? todayDateParam();
        const result = await fetchWithBQ(`/diet/planner?date=${date}`);

        if (result.error) {
          if (isNotFound(result.error)) {
            return { data: createEmptyDietPlannerDashboard() };
          }
          return { error: result.error };
        }

        const payload = unwrapFitForgeData(
          result.data as FitForgeResponse<ApiDietPlannerResponse>,
        );

        return { data: mapDietPlannerResponse(payload) };
      },
      providesTags: ['FitForge'],
    }),
    getDietHistory: builder.query<
      FitForgePaginatedData<ApiDietHistoryItem>,
      { page?: number; limit?: number } | void
    >({
      query: (arg) => {
        const page = arg?.page ?? 1;
        const limit = arg?.limit ?? 20;
        return `/diet/history?page=${page}&limit=${limit}`;
      },
      transformResponse: (
        response: FitForgeResponse<FitForgePaginatedData<ApiDietHistoryItem>>,
      ) => unwrapFitForgeData(response),
      providesTags: ['FitForge'],
    }),
    getMealPlanHistory: builder.query<
      FitForgePaginatedData<{ id: string; version?: number; status?: string }>,
      { page?: number; limit?: number } | void
    >({
      query: (arg) => {
        const page = arg?.page ?? 1;
        const limit = arg?.limit ?? 20;
        return `/meal-plans/history?page=${page}&limit=${limit}`;
      },
      transformResponse: (
        response: FitForgeResponse<
          FitForgePaginatedData<{ id: string; version?: number; status?: string }>
        >,
      ) => unwrapFitForgeData(response),
      providesTags: ['FitForge'],
    }),
    getActiveDietPlan: builder.query<unknown, void>({
      query: () => '/diet/active',
      transformResponse: (response: FitForgeResponse<unknown>) =>
        unwrapFitForgeData(response),
      providesTags: ['FitForge'],
    }),
    getActiveMealPlan: builder.query<unknown, void>({
      query: () => '/meal-plans/active',
      transformResponse: (response: FitForgeResponse<unknown>) =>
        unwrapFitForgeData(response),
      providesTags: ['FitForge'],
    }),
    searchFoods: builder.query<
      FitForgePaginatedData<ApiFoodItem>,
      {
        search?: string;
        category?: string;
        dietType?: string;
        page?: number;
        limit?: number;
      }
    >({
      query: ({ search, category, dietType, page = 1, limit = 20 }) => {
        const params = new URLSearchParams({
          page: String(page),
          limit: String(limit),
        });
        if (search) params.set('search', search);
        if (category) params.set('category', category);
        if (dietType) params.set('dietType', dietType);
        return `/foods?${params.toString()}`;
      },
      transformResponse: (
        response: FitForgeResponse<FitForgePaginatedData<ApiFoodItem>>,
      ) => unwrapFitForgeData(response),
    }),
    logMealStatus: builder.mutation<
      { id: string; status: string },
      {
        mealPlanItemId: string;
        status: 'completed' | 'skipped' | 'replaced';
        replacementFoodId?: string;
      }
    >({
      query: (body) => ({
        url: '/meal-logs',
        method: 'POST',
        body,
      }),
      transformResponse: (
        response: FitForgeResponse<{ id: string; status: string }>,
      ) => unwrapFitForgeData(response),
      invalidatesTags: ['FitForge'],
    }),
    updateMealPlanItem: builder.mutation<
      unknown,
      {
        itemId: string;
        foodId: string;
        quantity: number;
        calories: number;
        protein: number;
        carbs: number;
        fats: number;
      }
    >({
      query: ({ itemId, ...body }) => ({
        url: `/meal-plans/items/${itemId}`,
        method: 'PUT',
        body,
      }),
      transformResponse: (response: FitForgeResponse<unknown>) =>
        unwrapFitForgeData(response),
      invalidatesTags: ['FitForge'],
    }),
    patchHydration: builder.mutation<unknown, { amountMl: number }>({
      query: (body) => ({
        url: '/diet/planner/hydration',
        method: 'PATCH',
        body,
      }),
      transformResponse: (response: FitForgeResponse<unknown>) =>
        unwrapFitForgeData(response),
      invalidatesTags: ['FitForge'],
    }),
    createAiSession: builder.mutation<{ id: string }, { title: string }>({
      query: (body) => ({
        url: '/ai/sessions',
        method: 'POST',
        body,
      }),
      transformResponse: (response: FitForgeResponse<{ id: string }>) =>
        unwrapFitForgeData(response),
    }),
    applyCoachSuggestions: builder.mutation<
      ApiAiChatResponse,
      { sessionId: string; message: string }
    >({
      query: (body) => ({
        url: '/ai/chat',
        method: 'POST',
        body,
      }),
      transformResponse: (response: FitForgeResponse<ApiAiChatResponse>) =>
        unwrapFitForgeData(response),
      invalidatesTags: ['FitForge'],
    }),
    submitDailyCheckin: builder.mutation<
      unknown,
      {
        weightKg: number;
        caloriesConsumed: number;
        proteinConsumed: number;
        waterIntakeMl: number;
        mealsCompleted: number;
        mealsSkipped: number;
        workoutCompleted: boolean;
      }
    >({
      query: (body) => ({
        url: '/checkins',
        method: 'POST',
        body,
      }),
      transformResponse: (response: FitForgeResponse<unknown>) =>
        unwrapFitForgeData(response),
      invalidatesTags: ['FitForge'],
    }),
    generateMealPlan: builder.mutation<{ id: string }, { dietPlanId: string }>({
      query: ({ dietPlanId }) => ({
        url: '/meal-plans/generate-ai',
        method: 'POST',
        body: { dietPlanId, planType: 'weekly', days: 7 },
      }),
      transformResponse: (response: FitForgeResponse<{ id: string }>) =>
        unwrapFitForgeData(response),
      invalidatesTags: ['FitForge'],
    }),
    activateMealPlan: builder.mutation<unknown, { mealPlanId: string }>({
      query: ({ mealPlanId }) => ({
        url: `/meal-plans/${mealPlanId}/activate`,
        method: 'POST',
      }),
      transformResponse: (response: FitForgeResponse<unknown>) =>
        unwrapFitForgeData(response),
      invalidatesTags: ['FitForge'],
    }),
    generateDietTargets: builder.mutation<{ id: string }, void>({
      query: () => ({
        url: '/diet/generate-targets',
        method: 'POST',
      }),
      transformResponse: (response: FitForgeResponse<{ id: string }>) =>
        unwrapFitForgeData(response),
      invalidatesTags: ['FitForge'],
    }),
    activateDietPlan: builder.mutation<unknown, { dietPlanId: string }>({
      query: ({ dietPlanId }) => ({
        url: `/diet/${dietPlanId}/activate`,
        method: 'POST',
      }),
      transformResponse: (response: FitForgeResponse<unknown>) =>
        unwrapFitForgeData(response),
      invalidatesTags: ['FitForge'],
    }),
    generateTransformation: builder.mutation<unknown, void>({
      query: () => ({
        url: '/transformation/generate',
        method: 'POST',
      }),
      transformResponse: (response: FitForgeResponse<unknown>) =>
        unwrapFitForgeData(response),
      invalidatesTags: ['FitForge'],
    }),
  }),
});

export const {
  useGetDietPlannerDashboardQuery,
  useGetDietHistoryQuery,
  useLazyGetDietHistoryQuery,
  useLazyGetActiveDietPlanQuery,
  useLazyGetActiveMealPlanQuery,
  useLazySearchFoodsQuery,
  useLogMealStatusMutation,
  useUpdateMealPlanItemMutation,
  usePatchHydrationMutation,
  useCreateAiSessionMutation,
  useApplyCoachSuggestionsMutation,
  useSubmitDailyCheckinMutation,
  useGenerateMealPlanMutation,
  useActivateMealPlanMutation,
  useGenerateDietTargetsMutation,
  useActivateDietPlanMutation,
  useGenerateTransformationMutation,
} = fitforgeApi;
