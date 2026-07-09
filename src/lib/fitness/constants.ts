import type {
  ActivityLevel,
  DietType,
  ExperienceLevel,
  FitnessGoal,
  FitnessSetupStepId,
  Gender,
} from '@/lib/fitness/types';

export const FITNESS_SETUP_STORAGE_KEY = 'fitness-setup-draft';

export const FITNESS_SETUP_STEPS: {
  id: FitnessSetupStepId;
  label: string;
  shortLabel: string;
}[] = [
  { id: 'welcome', label: 'Welcome', shortLabel: 'Start' },
  { id: 'basic-info', label: 'Basic Info', shortLabel: 'Basics' },
  { id: 'activity', label: 'Activity', shortLabel: 'Activity' },
  { id: 'goal', label: 'Goal', shortLabel: 'Goal' },
  { id: 'physique-goal', label: 'Physique', shortLabel: 'Physique' },
  { id: 'diet', label: 'Diet & Training', shortLabel: 'Diet' },
  { id: 'allergy', label: 'Allergies', shortLabel: 'Allergies' },
  { id: 'review', label: 'Review', shortLabel: 'Review' },
];

export const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
];

export const ACTIVITY_LEVEL_OPTIONS: {
  value: ActivityLevel;
  label: string;
  description: string;
  icon: string;
}[] = [
  {
    value: 'sedentary',
    label: 'Sedentary',
    description: 'Little or no exercise',
    icon: '🪑',
  },
  {
    value: 'light',
    label: 'Light',
    description: 'Light exercise 1–3 days/week',
    icon: '🚶',
  },
  {
    value: 'moderate',
    label: 'Moderate',
    description: 'Moderate exercise 3–5 days/week',
    icon: '🏃',
  },
  {
    value: 'active',
    label: 'Active',
    description: 'Hard exercise 6–7 days/week',
    icon: '💪',
  },
  {
    value: 'athlete',
    label: 'Athlete',
    description: 'Very hard exercise or physical job',
    icon: '🏆',
  },
];

export const FITNESS_GOAL_OPTIONS: {
  value: FitnessGoal;
  label: string;
  description: string;
  imageUrl: string;
}[] = [
  {
    value: 'weight_loss',
    label: 'Weight Loss',
    description: 'Reduce overall body weight',
    imageUrl: '/fitness/goals/weight-loss.jpg',
  },
  {
    value: 'fat_loss',
    label: 'Fat Loss',
    description: 'Lose fat while preserving muscle',
    imageUrl: '/fitness/goals/fat-loss.jpg',
  },
  {
    value: 'lean_bulk',
    label: 'Lean Bulk',
    description: 'Gain muscle with minimal fat',
    imageUrl: '/fitness/goals/lean-bulk.jpg',
  },
  {
    value: 'muscle_gain',
    label: 'Muscle Gain',
    description: 'Maximize strength and size',
    imageUrl: '/fitness/goals/muscle-gain.jpg',
  },
  {
    value: 'body_recomposition',
    label: 'Body Recomposition',
    description: 'Lose fat and build muscle together',
    imageUrl: '/fitness/goals/body-recomposition.jpg',
  },
  {
    value: 'maintain_weight',
    label: 'Maintain Weight',
    description: 'Stay at your current weight',
    imageUrl: '/fitness/goals/maintain-weight.jpg',
  },
];

export const DIET_TYPE_OPTIONS: { value: DietType; label: string }[] = [
  { value: 'balanced', label: 'Balanced' },
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'keto', label: 'Keto' },
  { value: 'paleo', label: 'Paleo' },
  { value: 'mediterranean', label: 'Mediterranean' },
  { value: 'high_protein', label: 'High Protein' },
];

export const EXPERIENCE_LEVEL_OPTIONS: {
  value: ExperienceLevel;
  label: string;
}[] = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

export const WORKOUT_DAYS_OPTIONS = [2, 3, 4, 5, 6, 7];

export const FITNESS_ONBOARDING_BENEFITS = [
  'Personalized AI meal and workout plans',
  'Targets aligned to your physique goals',
  'Progress tracking from day one',
  'Adaptive coaching as you improve',
];
