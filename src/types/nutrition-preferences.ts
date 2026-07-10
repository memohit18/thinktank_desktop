export type NutritionBudget = 'budget' | 'moderate' | 'premium';

export type PreferredCuisine =
  | 'indian'
  | 'north_indian'
  | 'south_indian'
  | 'mixed'
  | 'international';

export type MealsPerDay = 3 | 4 | 5 | 6;

export type MealTimingPreference = 'early' | 'flexible' | 'late';

export type NutritionPreferences = {
  id?: string;
  userId?: string;
  budgetCategory: NutritionBudget;
  preferredCuisine: PreferredCuisine;
  mealsPerDay: MealsPerDay;
  cookingTimeMinutes: number;
  preferredMealTiming: MealTimingPreference;
  createdAt?: string;
  updatedAt?: string;
};

export type NutritionPreferencesPayload = {
  budgetCategory?: NutritionBudget;
  preferredCuisine?: PreferredCuisine;
  mealsPerDay?: MealsPerDay;
  cookingTimeMinutes?: number;
  preferredMealTiming?: MealTimingPreference;
};

export type NutritionPreferencesFormValues = {
  budgetCategory?: NutritionBudget;
  preferredCuisine?: PreferredCuisine;
  mealsPerDay?: MealsPerDay;
  cookingTimeMinutes?: number;
  preferredMealTiming?: MealTimingPreference;
};
