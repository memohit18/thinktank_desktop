export type MealSlot = 'breakfast' | 'lunch' | 'snack' | 'dinner';

export type MealStatus = 'pending' | 'completed' | 'skipped' | 'replaced';

export type DietPlannerMeal = {
  id: string;
  slot: MealSlot;
  title: string;
  description: string;
  time: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  status: MealStatus;
  isCritical?: boolean;
  replacementFoodId?: string;
};

export type SwapSuggestion = {
  mealPlanItemId?: string;
  originalName: string;
  suggestedName: string;
  replacementFoodId?: string;
};

export type DietPlannerDashboard = {
  planLabel: string;
  phaseTitle: string;
  phaseDescription: string;
  dailyCalorieTarget: number;
  caloriesConsumed: number;
  proteinTarget: number;
  proteinConsumed: number;
  meals: DietPlannerMeal[];
  aiCoachMessage: string;
  hydrationMl: number;
  hydrationTargetMl: number;
  fiberPercent: number;
  sodiumLevel: 'low' | 'ok' | 'high';
  caffeineMg: number;
  dietPlanId?: string;
  mealPlanId?: string;
  swapSuggestion?: SwapSuggestion;
};

export type FitForgeNavId =
  | 'roadmap'
  | 'diet-planner'
  | 'nutrition'
  | 'workouts'
  | 'analytics'
  | 'ai-coach';
