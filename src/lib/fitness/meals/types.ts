export type MealType = 'breakfast' | 'lunch' | 'snack' | 'dinner';

export type MealDayKey =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export type MealItemStatus =
  | 'pending'
  | 'completed'
  | 'skipped'
  | 'replaced'
  | string;

export type MealMacros = {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
};

export type MealItem = {
  id: string;
  mealPlanId?: string | null;
  type: MealType;
  name: string;
  foodId?: string | null;
  imageUrl?: string | null;
  servingSize?: string | null;
  scheduledTime?: string | null;
  quantity?: number | null;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  status: MealItemStatus;
  canSwap?: boolean;
  canEdit?: boolean;
  dayNumber?: number | null;
  day?: MealDayKey | null;
  date?: string | null;
};

export type MealMacroProgress = {
  current: number;
  goal: number;
  remaining?: number;
  percent?: number;
};

export type MealNutritionSummary = {
  calories: MealMacroProgress;
  protein: MealMacroProgress;
  carbs: MealMacroProgress;
  fats: MealMacroProgress;
  mealsCompleted?: number;
  mealsAssigned?: number;
  mealsRemaining?: number;
  mealsSkipped?: number;
};

export type ActiveMealPlan = {
  id: string;
  dietPlanId?: string | null;
  status: string;
  planType?: string | null;
  version?: number | null;
  goal?: string | null;
  label?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  items: MealItem[];
  days: MealDayPlan[];
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type MealDayPlan = {
  day: MealDayKey;
  date?: string | null;
  dayNumber?: number | null;
  meals: MealItem[];
};

export type TodayMeals = {
  date: string;
  mealPlanId?: string | null;
  dietPlanId?: string | null;
  goal?: string | null;
  version?: number | null;
  label?: string | null;
  meals: MealItem[];
  nutrition: MealNutritionSummary | null;
  mealsRemaining: number;
};

export type MealHistoryItem = {
  id: string;
  dietPlanId?: string | null;
  status: string;
  planType?: string | null;
  version?: number | null;
  goal?: string | null;
  label?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  createdAt?: string | null;
  archivedAt?: string | null;
};

export type MealHistoryMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type MealHistoryResponse = {
  items: MealHistoryItem[];
  meta?: MealHistoryMeta;
};

export type ReplaceMealPayload = {
  mealItemId: string;
  foodId: string;
  quantity?: number;
};

export type GenerateMealPlanPayload = {
  dietPlanId?: string;
  planType?: 'weekly' | 'daily' | string;
  days?: number;
};
