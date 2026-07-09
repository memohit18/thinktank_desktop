import type { FitnessSetupStepId } from '@/lib/fitness/types';

export const FITNESS_STEP_META: Record<
  FitnessSetupStepId,
  { title: string; subtitle: string }
> = {
  welcome: {
    title: 'Elite Performance, Tailored by AI',
    subtitle:
      'Answer a few questions so we can architect your personalized nutrition and training protocol.',
  },
  'basic-info': {
    title: 'Physical Profile',
    subtitle:
      'Your baseline metrics power accurate calorie, macro, and training recommendations.',
  },
  activity: {
    title: "What's your daily activity level?",
    subtitle:
      'This helps us calculate your daily caloric needs with clinical precision.',
  },
  goal: {
    title: 'What is your primary fitness goal?',
    subtitle: 'Choose the outcome you want to optimize for over the next phase.',
  },
  'physique-goal': {
    title: 'Physique Goal',
    subtitle:
      'Select the aesthetic trajectory that matches your long-term vision.',
  },
  diet: {
    title: 'Diet & Training Preferences',
    subtitle:
      'Tell us how you eat and train so plans fit your lifestyle.',
  },
  allergy: {
    title: 'Food Allergies & Restrictions',
    subtitle:
      'Share dietary limitations so our AI can curate a safe and effective nutrition plan.',
  },
  review: {
    title: 'Review Your Profile',
    subtitle:
      'Confirm your details before we generate your AI-powered meal and workout plans.',
  },
};

export const ALLERGY_QUICK_TAGS = [
  'Dairy-Free',
  'Gluten-Free',
  'Nut Allergy',
  'Shellfish',
  'Soy-Free',
  'Egg-Free',
];
