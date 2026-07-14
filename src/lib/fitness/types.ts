export type FitnessSetupStepId =
  | 'welcome'
  | 'basic-info'
  | 'activity'
  | 'goal'
  | 'diet'
  | 'allergy'
  | 'review';

export type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say';

export type ActivityLevel =
  | 'sedentary'
  | 'light'
  | 'moderate'
  | 'active'
  | 'athlete';

export type FitnessGoal =
  | 'weight_loss'
  | 'fat_loss'
  | 'lean_bulk'
  | 'muscle_gain'
  | 'body_recomposition'
  | 'maintain_weight';

export type DietType =
  | 'balanced'
  | 'vegetarian'
  | 'vegan'
  | 'keto'
  | 'paleo'
  | 'mediterranean'
  | 'high_protein';

export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';

export type FitnessSetupFormValues = {
  age: number | '';
  gender: Gender | '';
  heightCm: number | '';
  weightKg: number | '';
  activityLevel: ActivityLevel | '';
  fitnessGoal: FitnessGoal | '';
  physiqueGoalId: string;
  dietType: DietType | '';
  workoutExperience: ExperienceLevel | '';
  workoutDaysPerWeek: number | '';
  targetWeightKg: number | '';
  targetBodyFatPercent: number | '';
  allergies: string;
};

export type FitnessProfilePayload = {
  age: number;
  gender: Gender;
  heightCm: number;
  weightKg: number;
  activityLevel: ActivityLevel;
  fitnessGoal: FitnessGoal;
  physiqueGoalId: string;
  dietType: DietType;
  workoutExperience: ExperienceLevel;
  workoutDaysPerWeek: number;
  targetWeightKg?: number | null;
  targetBodyFatPercent?: number | null;
  allergies?: string | null;
  onboardingCompleted?: boolean;
};

export type PhysiqueGoal = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  targetBodyFatMin?: number | null;
  targetBodyFatMax?: number | null;
};

export type CreatePhysiqueGoalPayload = {
  title: string;
  description: string;
  imageUrl?: string | null;
  targetBodyFatMin?: number | null;
  targetBodyFatMax?: number | null;
};

export type UpdatePhysiqueGoalPayload = Partial<CreatePhysiqueGoalPayload>;

export type FitnessPlanNutrition = {
  dailyTarget: string;
  proteinGoal: string;
  calories?: number | null;
  protein?: number | null;
  ready: boolean;
};

export type FitnessPlanWorkout = {
  frequency: string;
  focusArea: string;
  daysPerWeek?: number | null;
  fitnessGoal?: string | null;
  ready: boolean;
};

export type FitnessPlans = {
  nutrition: FitnessPlanNutrition | null;
  workout: FitnessPlanWorkout | null;
  ready: boolean;
  transformationId?: string | null;
  dietPlanId?: string | null;
  workoutPlanId?: string | null;
};

export type FitnessProfile = FitnessProfilePayload & {
  id: string;
  onboardingCompleted: boolean;
  physiqueGoal?: PhysiqueGoal | null;
  plans?: FitnessPlans | null;
  createdAt?: string;
  updatedAt?: string;
};

export type PhysiqueGoalsResponse = {
  goals: PhysiqueGoal[];
};

export type FitnessSetupDraft = {
  step: FitnessSetupStepId;
  values: FitnessSetupFormValues;
  updatedAt: string;
};
