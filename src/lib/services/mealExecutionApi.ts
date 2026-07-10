import { unwrapTodayMeals } from '@/lib/fitness/meals/mealResponse';
import type { TodayMeals } from '@/lib/fitness/meals/types';
import { mealExecutionService } from '@/lib/services/mealExecution.service';
import { mealApi } from '@/lib/services/mealApi';
import { apiSlice } from './apiSlice';
import { invalidateTagsOnSuccess } from './rtkQueryDefaults';

type CompleteArgs = {
  mealId: string;
  consumedQuantity?: number;
  notes?: string;
};

type PartialArgs = {
  mealId: string;
  consumedQuantity: number;
};

type ReplaceArgs = {
  mealId: string;
  foodId: string;
};

export const mealExecutionApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    executeCompleteMeal: builder.mutation<TodayMeals | null, CompleteArgs>({
      query: ({ mealId, consumedQuantity, notes }) =>
        mealExecutionService.complete(mealId, { consumedQuantity, notes }),
      transformResponse: (response: unknown) => unwrapTodayMeals(response),
      async onQueryStarted({ mealId }, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          mealApi.util.updateQueryData('getTodayMeals', undefined, (draft) => {
            if (!draft) return;
            const meal = draft.meals.find((item) => item.id === mealId);
            if (!meal) return;
            meal.status = 'completed';
            draft.mealsRemaining = draft.meals.filter(
              (item) =>
                item.status !== 'completed' && item.status !== 'skipped',
            ).length;
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
      invalidatesTags: invalidateTagsOnSuccess([
        'MealPlan',
        'Checkin',
        'Diet',
      ]),
    }),
    executePartialMeal: builder.mutation<TodayMeals | null, PartialArgs>({
      query: ({ mealId, consumedQuantity }) =>
        mealExecutionService.partial(mealId, consumedQuantity),
      transformResponse: (response: unknown) => unwrapTodayMeals(response),
      async onQueryStarted({ mealId }, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          mealApi.util.updateQueryData('getTodayMeals', undefined, (draft) => {
            if (!draft) return;
            const meal = draft.meals.find((item) => item.id === mealId);
            if (!meal) return;
            meal.status = 'partial';
            draft.mealsRemaining = draft.meals.filter(
              (item) =>
                item.status !== 'completed' &&
                item.status !== 'skipped' &&
                item.status !== 'partial',
            ).length;
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
      invalidatesTags: invalidateTagsOnSuccess([
        'MealPlan',
        'Checkin',
        'Diet',
      ]),
    }),
    executeSkipMeal: builder.mutation<TodayMeals | null, string>({
      query: (mealId) => mealExecutionService.skip(mealId),
      transformResponse: (response: unknown) => unwrapTodayMeals(response),
      async onQueryStarted(mealId, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          mealApi.util.updateQueryData('getTodayMeals', undefined, (draft) => {
            if (!draft) return;
            const meal = draft.meals.find((item) => item.id === mealId);
            if (!meal) return;
            meal.status = 'skipped';
            draft.mealsRemaining = draft.meals.filter(
              (item) =>
                item.status !== 'completed' && item.status !== 'skipped',
            ).length;
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
      invalidatesTags: invalidateTagsOnSuccess([
        'MealPlan',
        'Checkin',
        'Diet',
      ]),
    }),
    executeReplaceMeal: builder.mutation<TodayMeals | null, ReplaceArgs>({
      query: ({ mealId, foodId }) =>
        mealExecutionService.replace(mealId, foodId),
      transformResponse: (response: unknown) => unwrapTodayMeals(response),
      invalidatesTags: invalidateTagsOnSuccess([
        'MealPlan',
        'Checkin',
        'Diet',
      ]),
    }),
  }),
  overrideExisting: true,
});

export const {
  useExecuteCompleteMealMutation,
  useExecutePartialMealMutation,
  useExecuteSkipMealMutation,
  useExecuteReplaceMealMutation,
} = mealExecutionApi;
