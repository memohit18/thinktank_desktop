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
};

export type FitnessProfile = FitnessProfilePayload & {
  id: string;
  onboardingCompleted: boolean;
  physiqueGoal?: PhysiqueGoal | null;
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
