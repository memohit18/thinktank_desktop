import { unwrapFitnessData } from '@/lib/fitness/fitnessResponse';
import type {
  MealTimingPreference,
  MealsPerDay,
  NutritionBudget,
  NutritionPreferences,
  NutritionPreferencesFormValues,
  NutritionPreferencesPayload,
  PreferredCuisine,
} from '@/types/nutrition-preferences';

function readString(value: unknown, fallback = '') {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function readNumber(value: unknown, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeBudget(value: unknown): NutritionBudget {
  const budget = readString(value, 'moderate').toLowerCase();

  if (budget === 'budget' || budget === 'moderate' || budget === 'premium') {
    return budget;
  }

  if (budget === 'low') return 'budget';
  if (budget === 'high') return 'premium';

  return 'moderate';
}

function normalizeCuisine(value: unknown): PreferredCuisine {
  const cuisine = readString(value, 'indian').toLowerCase();

  if (
    cuisine === 'indian' ||
    cuisine === 'north_indian' ||
    cuisine === 'south_indian' ||
    cuisine === 'mixed' ||
    cuisine === 'international'
  ) {
    return cuisine;
  }

  if (cuisine === 'north indian') return 'north_indian';
  if (cuisine === 'south indian') return 'south_indian';

  return 'indian';
}

function normalizeMealsPerDay(value: unknown): MealsPerDay {
  const mealsPerDay = readNumber(value, 4);

  if (
    mealsPerDay === 3 ||
    mealsPerDay === 4 ||
    mealsPerDay === 5 ||
    mealsPerDay === 6
  ) {
    return mealsPerDay;
  }

  return 4;
}

function normalizeMealTiming(value: unknown): MealTimingPreference {
  const mealTiming = readString(value, 'flexible').toLowerCase();

  if (mealTiming === 'early' || mealTiming === 'flexible' || mealTiming === 'late') {
    return mealTiming;
  }

  return 'flexible';
}

export function unwrapNutritionPreferences(
  response: unknown,
): NutritionPreferences | null {
  const data = unwrapFitnessData<
    NutritionPreferences | { preferences: NutritionPreferences } | null
  >(response);

  if (!data) return null;

  const record =
    typeof data === 'object' && data !== null && 'preferences' in data
      ? data.preferences
      : data;

  if (!record || typeof record !== 'object') {
    return null;
  }

  const raw = record as Record<string, unknown>;

  return {
    id: readString(raw.id) || undefined,
    userId: readString(raw.userId ?? raw.user_id) || undefined,
    budgetCategory: normalizeBudget(
      raw.budgetCategory ?? raw.budget_category ?? raw.budget,
    ),
    preferredCuisine: normalizeCuisine(
      raw.preferredCuisine ?? raw.preferred_cuisine ?? raw.cuisine,
    ),
    mealsPerDay: normalizeMealsPerDay(
      raw.mealsPerDay ?? raw.meals_per_day ?? raw.mealCount ?? raw.meal_count,
    ),
    cookingTimeMinutes: Math.min(
      120,
      Math.max(
        15,
        readNumber(
          raw.cookingTimeMinutes ??
            raw.cooking_time_minutes ??
            raw.cookingTimeInMinutes ??
            raw.cooking_time_in_minutes ??
            raw.cookingTime ??
            raw.cooking_time,
          30,
        ),
      ),
    ),
    preferredMealTiming: normalizeMealTiming(
      raw.preferredMealTiming ??
        raw.preferred_meal_timing ??
        raw.mealTiming ??
        raw.meal_timing,
    ),
    createdAt: readString(raw.createdAt ?? raw.created_at) || undefined,
    updatedAt: readString(raw.updatedAt ?? raw.updated_at) || undefined,
  };
}

export function toNutritionPreferencesPayload(
  values: NutritionPreferencesFormValues,
): NutritionPreferencesPayload {
  return {
    budgetCategory: values.budgetCategory,
    preferredCuisine: values.preferredCuisine,
    mealsPerDay: values.mealsPerDay,
    cookingTimeMinutes: values.cookingTimeMinutes,
    preferredMealTiming: values.preferredMealTiming,
  };
}

export const nutritionPreferencesService = {
  get() {
    return '/nutrition-preferences';
  },
  create(payload: NutritionPreferencesPayload) {
    return {
      url: '/nutrition-preferences',
      method: 'POST' as const,
      body: payload,
    };
  },
  update(payload: NutritionPreferencesPayload) {
    return {
      url: '/nutrition-preferences',
      method: 'PATCH' as const,
      body: payload,
    };
  },
  delete() {
    return {
      url: '/nutrition-preferences',
      method: 'DELETE' as const,
    };
  },
};
