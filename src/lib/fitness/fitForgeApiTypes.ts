export type ApiFitnessProfile = {
  id: string;
  userId: string;
  age: number;
  gender: string;
  heightCm: number;
  weightKg: number;
  activityLevel: string;
  dietType: string;
  fitnessGoal: string;
  physiqueGoalId: string;
  targetWeightKg?: number | null;
  targetBodyFat?: number | null;
  workoutDaysPerWeek: number;
  experienceLevel: string;
  budgetPreference: string;
  workoutMode: string;
  equipmentAvailable?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ApiCheckinStats = {
  month: string;
  totalCheckins: number;
  avgDietCompliance: number;
  workoutsCompleted: number;
};

export type ApiDietPlan = {
  id: string;
  version: number;
  status: string;
  goal: string;
  caloriesTarget: number;
  proteinTarget: number;
  carbsTarget: number;
  fatsTarget: number;
};
