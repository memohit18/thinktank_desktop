import type { MealSlot, MealStatus } from '@/lib/fitforge/dietPlannerTypes';

export type ApiPlannerMealItem = {
  id: string;
  mealType?: MealSlot;
  food?: { id?: string; name?: string; category?: string };
  quantity?: number;
  calories: number;
  protein: number;
  carbs?: number;
  fats?: number;
  status?: MealStatus;
  latestLog?: {
    status: MealStatus;
    replacementFood?: { id?: string; name?: string };
  };
};

export type ApiPlannerMealGroup = {
  slot?: MealSlot;
  mealType?: MealSlot;
  title?: string;
  label?: string;
  time?: string;
  isCritical?: boolean;
  items?: ApiPlannerMealItem[];
};

export type ApiSwapSuggestion = {
  mealPlanItemId?: string;
  original?: { foodId?: string; name?: string };
  suggested?: { foodId?: string; name?: string };
};

export type ApiDietPlannerResponse = {
  planLabel?: string;
  dietPlanId?: string;
  mealPlanId?: string;
  phaseTitle?: string;
  phaseDescription?: string;
  dailyEnergy?: {
    target?: number;
    consumed?: number;
    remaining?: number;
  };
  proteinGoal?: {
    target?: number;
    consumed?: number;
    remaining?: number;
  };
  caloriesTarget?: number;
  caloriesConsumed?: number;
  proteinTarget?: number;
  proteinConsumed?: number;
  meals?: ApiPlannerMealGroup[];
  coachInsight?: string;
  hydration?: {
    currentMl?: number;
    targetMl?: number;
  };
  vitals?: {
    fiberPercent?: number;
    sodiumLevel?: string;
    caffeineMg?: number;
  };
  swapSuggestion?: ApiSwapSuggestion;
};

export type ApiFoodItem = {
  id: string;
  name: string;
  category?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fats?: number;
};

export type ApiDietHistoryItem = {
  id: string;
  version?: number;
  status?: string;
  goal?: string;
  createdAt?: string;
};

export type ApiAiChatResponse = {
  reply?: string;
  message?: string;
  content?: string;
};
