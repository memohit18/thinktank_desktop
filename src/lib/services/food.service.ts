/**
 * Food preferences API layer.
 * Implemented with RTK Query (project standard) — see `foodApi.ts`.
 */
export {
  useGetFoodsQuery as useFoodsQuery,
  useGetFoodByIdQuery as useFoodByIdQuery,
  useGetFoodCategoriesQuery as useFoodCategoriesQuery,
  useGetFoodPreferencesQuery as useFoodPreferencesQuery,
  useAddFoodPreferenceMutation,
  useUpdateFoodPreferencesMutation,
  useRemoveFoodPreferenceMutation,
  useCreateCustomFoodMutation,
  useCreateCatalogFoodMutation,
  useUpdateFoodMutation,
  useDeleteFoodMutation,
} from '@/lib/services/foodApi';

export { foodsService } from '@/lib/services/foods.service';

export type {
  AddFoodPreferencePayload,
  CreateFoodPayload,
  Food,
  FoodCategory,
  FoodCategoriesResult,
  FoodFormValues,
  FoodPreferences,
  FoodsListResult,
  FoodsQueryParams,
  PaginationMeta,
  UpdateFoodPayload,
  UpdateFoodPreferencesPayload,
  FoodPreferenceType,
} from '@/lib/fitness/food/types';

export {
  unwrapFoods,
  unwrapFoodsList,
  unwrapFoodCategories,
  unwrapFoodPreferences,
  toFoodPreferencesPatchPayload,
} from '@/lib/fitness/food/foodResponse';
