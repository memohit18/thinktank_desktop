import { z } from 'zod';
import { FOOD_PREFERENCE_MIN_FAVORITES } from '@/lib/fitness/food/constants';
import type {
  FoodPreferences,
  FoodPreferencesFormValues,
} from '@/lib/fitness/food/types';

export const foodPreferencesSchema = z.object({
  favoriteFoodIds: z
    .array(z.string())
    .min(
      FOOD_PREFERENCE_MIN_FAVORITES,
      `Select at least ${FOOD_PREFERENCE_MIN_FAVORITES} favorite foods`,
    ),
  restrictedFoodIds: z.array(z.string()),
  availableFoodIds: z.array(z.string()),
});

export type FoodPreferencesSchemaValues = z.infer<typeof foodPreferencesSchema>;

export const EMPTY_FOOD_PREFERENCES_VALUES: FoodPreferencesFormValues = {
  favoriteFoodIds: [],
  restrictedFoodIds: [],
  availableFoodIds: [],
};

export function mapFoodPreferencesToFormValues(
  preferences: FoodPreferences | null | undefined,
): FoodPreferencesFormValues {
  if (!preferences) {
    return EMPTY_FOOD_PREFERENCES_VALUES;
  }

  return {
    favoriteFoodIds: preferences.favoriteFoodIds ?? [],
    restrictedFoodIds: preferences.restrictedFoodIds ?? [],
    availableFoodIds: preferences.availableFoodIds ?? [],
  };
}
