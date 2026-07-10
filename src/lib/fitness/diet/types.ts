export type DietDayKey =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export type DietMealType = 'breakfast' | 'lunch' | 'snack' | 'dinner';

export type DietMeal = {
  id: string;
  type: DietMealType;
  name: string;
  imageUrl?: string | null;
  servingSize?: string | null;
  scheduledTime?: string | null;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  canSwap?: boolean;
  status?: string | null;
};

export type DietDayPlan = {
  day: DietDayKey;
  date?: string | null;
  meals: DietMeal[];
};

export type DietMacroProgress = {
  current: number;
  goal: number;
  remaining?: number;
  percent?: number;
};

export type DietNutritionSummary = {
  calories: DietMacroProgress;
  protein: DietMacroProgress;
  carbs: DietMacroProgress;
  fats: DietMacroProgress;
  water?: DietMacroProgress | null;
  fiber?: DietMacroProgress | null;
};

export type DietGroceryItem = {
  id?: string;
  name: string;
  quantity: string;
};

export type DietGroceryPreview = {
  items: DietGroceryItem[];
  estimatedWeeklyCost?: number | null;
  currency?: string | null;
};

export type DietPlanStatus = 'ACTIVE' | 'ARCHIVED' | 'COMPLETED' | string;

/** Active / history diet plan (legacy targets + Phase 4 plan metadata). */
export type DietPlan = {
  id: string;
  goal?: string | null;
  dailyCalories: number;
  dailyProtein: number;
  dailyCarbs?: number;
  dailyFats?: number;
  mealsPerDay: number;
  durationWeeks: number;
  version?: number | null;
  status: DietPlanStatus;
  days: DietDayPlan[];
  nutrition?: DietNutritionSummary | null;
  grocery?: DietGroceryPreview | null;
  label?: string | null;
  phase?: string | null;
  statusMessage?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type DietCoachInsight = {
  status?: string | null;
  message?: string | null;
  actionable?: boolean;
};

/** Full Diet Planner screen payload from GET /diet/planner. */
export type DietPlanner = {
  date?: string | null;
  dietPlanId?: string | null;
  mealPlanId?: string | null;
  goal?: string | null;
  label?: string | null;
  phase?: string | null;
  statusMessage?: string | null;
  dailyCalories: number;
  dailyProtein: number;
  dailyCarbs?: number;
  dailyFats?: number;
  mealsPerDay: number;
  durationWeeks: number;
  version?: number | null;
  status?: DietPlanStatus | null;
  /** Meals for the selected planner date. */
  meals: DietMeal[];
  days: DietDayPlan[];
  nutrition?: DietNutritionSummary | null;
  grocery?: DietGroceryPreview | null;
  hydration?: DietMacroProgress | null;
  hydrationQuickAddsMl?: number[];
  coachInsight?: DietCoachInsight | null;
};

export type DietHistoryItem = DietPlan & {
  archivedAt?: string;
};

export type DietHistoryMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type DietHistoryResponse = {
  items: DietHistoryItem[];
  meta?: DietHistoryMeta;
};

export type DietFromTargetsPayload = {
  goal: string;
  dailyCalories: number;
  protein: number;
  carbs: number;
  fats: number;
};

export type DietManualCreatePayload = {
  goal: string;
  caloriesTarget: number;
  proteinTarget: number;
  carbsTarget: number;
  fatsTarget: number;
};

export type DietHydrationPayload = {
  amountMl: number;
};

export type MealPlanGeneratePayload = {
  dietPlanId: string;
  planType?: 'weekly' | 'daily' | string;
  days?: number;
};
