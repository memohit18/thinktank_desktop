import { z } from 'zod';
import type {
  NutritionPreferences,
  NutritionPreferencesFormValues,
} from '@/types/nutrition-preferences';

export const nutritionPreferencesSchema = z.object({
  budgetCategory: z.enum(['budget', 'moderate', 'premium']),
  preferredCuisine: z.enum([
    'indian',
    'north_indian',
    'south_indian',
    'mixed',
    'international',
  ]),
  mealsPerDay: z.union([z.literal(3), z.literal(4), z.literal(5), z.literal(6)]),
  cookingTimeMinutes: z.number().min(15).max(120),
  preferredMealTiming: z.enum(['early', 'flexible', 'late']),
});

export type NutritionPreferencesSchemaValues = z.infer<
  typeof nutritionPreferencesSchema
>;

export const EMPTY_NUTRITION_PREFERENCES_VALUES: NutritionPreferencesFormValues =
  {};

export function mapNutritionPreferencesToFormValues(
  preferences: NutritionPreferences | null | undefined,
): NutritionPreferencesFormValues {
  if (!preferences) {
    return EMPTY_NUTRITION_PREFERENCES_VALUES;
  }

  return {
    budgetCategory: preferences.budgetCategory,
    preferredCuisine: preferences.preferredCuisine,
    mealsPerDay: preferences.mealsPerDay,
    cookingTimeMinutes: preferences.cookingTimeMinutes,
    preferredMealTiming: preferences.preferredMealTiming,
  };
}
