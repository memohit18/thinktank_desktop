import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import {
  isFitnessErrorEnvelope,
  isMissingFitnessProfileStatus,
  unwrapFitnessData,
} from '@/lib/fitness/fitnessResponse';
import {
  normalizeFood,
  unwrapFoodCategories,
  unwrapFoodPreferences,
  unwrapFoodsList,
} from '@/lib/fitness/food/foodResponse';
import type {
  AddFoodPreferencePayload,
  CreateFoodPayload,
  Food,
  FoodCategoriesResult,
  FoodPreferences,
  FoodsListResult,
  FoodsQueryParams,
  UpdateFoodPayload,
  UpdateFoodPreferencesPayload,
} from '@/lib/fitness/food/types';
import { foodsService } from '@/lib/services/foods.service';
import { apiSlice } from './apiSlice';
import { RTK_QUERY_STABLE_CACHE, invalidateTagsOnSuccess, withQueryDefaults } from './rtkQueryDefaults';

const foodQueryOptions = { keepUnusedDataFor: RTK_QUERY_STABLE_CACHE.keepUnusedDataFor };

function buildFoodsQuery(params?: FoodsQueryParams) {
  const searchParams = new URLSearchParams();

  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.limit) searchParams.set('limit', String(params.limit));
  if (params?.search) searchParams.set('search', params.search);
  if (params?.category) searchParams.set('category', params.category);
  if (params?.dietType) searchParams.set('dietType', params.dietType);

  const query = searchParams.toString();
  return query ? `/foods?${query}` : '/foods';
}

export const foodApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getFoods: builder.query<FoodsListResult, FoodsQueryParams | void>({
      query: (params) => buildFoodsQuery(params ?? undefined),
      transformResponse: (response: unknown) => unwrapFoodsList(response),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map((food) => ({
                type: 'Foods' as const,
                id: food.id,
              })),
              { type: 'Foods', id: 'LIST' },
            ]
          : [{ type: 'Foods', id: 'LIST' }],
      ...foodQueryOptions,
    }),
    getFoodById: builder.query<Food | null, string>({
      async queryFn(foodId, _queryApi, _extraOptions, baseQuery) {
        const result = await baseQuery(`/foods/${foodId}`);

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

        return { data: normalizeFood(unwrapFitnessData(result.data)) };
      },
      providesTags: (_result, _error, foodId) => [{ type: 'Foods', id: foodId }],
      ...foodQueryOptions,
    }),
    getFoodCategories: builder.query<FoodCategoriesResult, void>({
      query: () => '/foods/categories',
      transformResponse: (response: unknown) => unwrapFoodCategories(response),
      providesTags: ['FoodCategories'],
      ...foodQueryOptions,
    }),
    getFoodPreferences: builder.query<FoodPreferences | null, void>({
      async queryFn(_arg, _queryApi, _extraOptions, baseQuery) {
        const result = await baseQuery('/food-preferences');

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

        return { data: unwrapFoodPreferences(result.data) };
      },
      providesTags: ['FoodPreferences'],
      ...foodQueryOptions,
    }),
    addFoodPreference: builder.mutation<void, AddFoodPreferencePayload>({
      query: (body) => ({
        url: '/food-preferences',
        method: 'POST',
        body,
      }),
      invalidatesTags: invalidateTagsOnSuccess(['FoodPreferences']),
    }),
    updateFoodPreferences: builder.mutation<
      FoodPreferences,
      UpdateFoodPreferencesPayload
    >({
      query: (body) => ({
        url: '/food-preferences',
        method: 'PATCH',
        body,
      }),
      transformResponse: (response: unknown) => {
        const preferences = unwrapFoodPreferences(response);
        if (!preferences) {
          throw new Error('Invalid food preferences response');
        }
        return preferences;
      },
      invalidatesTags: invalidateTagsOnSuccess(['FoodPreferences']),
    }),
    removeFoodPreference: builder.mutation<void, string>({
      query: (foodId) => ({
        url: `/food-preferences/${foodId}`,
        method: 'DELETE',
      }),
      invalidatesTags: invalidateTagsOnSuccess(['FoodPreferences']),
    }),
    createCustomFood: builder.mutation<Food, CreateFoodPayload>({
      query: (body) => foodsService.createCustom(body),
      transformResponse: (response: unknown) => {
        const food = normalizeFood(unwrapFitnessData(response));
        if (!food) throw new Error('Invalid food response');
        return food;
      },
      invalidatesTags: invalidateTagsOnSuccess([
        { type: 'Foods', id: 'LIST' },
        'FoodCategories',
      ]),
    }),
    createCatalogFood: builder.mutation<Food, CreateFoodPayload>({
      query: (body) => foodsService.createCatalog(body),
      transformResponse: (response: unknown) => {
        const food = normalizeFood(unwrapFitnessData(response));
        if (!food) throw new Error('Invalid food response');
        return food;
      },
      invalidatesTags: invalidateTagsOnSuccess([
        { type: 'Foods', id: 'LIST' },
        'FoodCategories',
      ]),
    }),
    updateFood: builder.mutation<Food, { foodId: string; body: UpdateFoodPayload }>({
      query: ({ foodId, body }) => foodsService.update(foodId, body),
      transformResponse: (response: unknown) => {
        const food = normalizeFood(unwrapFitnessData(response));
        if (!food) throw new Error('Invalid food response');
        return food;
      },
      invalidatesTags: invalidateTagsOnSuccess((result, arg) => {
        const { foodId } = arg as { foodId: string };
        return [
          { type: 'Foods', id: foodId },
          { type: 'Foods', id: 'LIST' },
          'FoodCategories',
        ] as const;
      }),
    }),
  }),
  overrideExisting: true,
});

export const {
  useAddFoodPreferenceMutation,
  useUpdateFoodPreferencesMutation,
  useRemoveFoodPreferenceMutation,
  useCreateCustomFoodMutation,
  useCreateCatalogFoodMutation,
  useUpdateFoodMutation,
} = foodApi;

export const useGetFoodsQuery = withQueryDefaults(
  foodApi.useGetFoodsQuery,
  RTK_QUERY_STABLE_CACHE,
);
export const useGetFoodByIdQuery = withQueryDefaults(
  foodApi.useGetFoodByIdQuery,
  RTK_QUERY_STABLE_CACHE,
);
export const useGetFoodCategoriesQuery = withQueryDefaults(
  foodApi.useGetFoodCategoriesQuery,
  RTK_QUERY_STABLE_CACHE,
);
export const useGetFoodPreferencesQuery = withQueryDefaults(
  foodApi.useGetFoodPreferencesQuery,
  RTK_QUERY_STABLE_CACHE,
);
