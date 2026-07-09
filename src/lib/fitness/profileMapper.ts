import type { FitnessSetupFormValues } from '@/lib/fitness/types';
import type { FitnessProfile } from '@/lib/fitness/types';
import { EMPTY_FITNESS_SETUP_VALUES } from '@/lib/fitness/setupStorage';

const REQUIRED_PROFILE_FIELDS: (keyof FitnessProfile)[] = [
  'age',
  'gender',
  'heightCm',
  'weightKg',
  'activityLevel',
  'fitnessGoal',
  'physiqueGoalId',
  'dietType',
  'workoutExperience',
  'workoutDaysPerWeek',
];

function hasRequiredProfileFields(profile: FitnessProfile) {
  return REQUIRED_PROFILE_FIELDS.every((field) => {
    const value = profile[field];
    return value !== null && value !== undefined && value !== '';
  });
}

export function hasCompletedFitnessOnboarding(
  profile: FitnessProfile | null | undefined,
) {
  if (!profile?.id) {
    return false;
  }

  const record = profile as FitnessProfile & { onboarding_completed?: boolean };

  if (record.onboardingCompleted === true || record.onboarding_completed === true) {
    return true;
  }

  return hasRequiredProfileFields(profile);
}

export function mapFitnessProfileToFormValues(
  profile: FitnessProfile,
): FitnessSetupFormValues {
  return {
    age: profile.age,
    gender: profile.gender,
    heightCm: profile.heightCm,
    weightKg: profile.weightKg,
    activityLevel: profile.activityLevel,
    fitnessGoal: profile.fitnessGoal,
    physiqueGoalId: profile.physiqueGoalId,
    dietType: profile.dietType,
    workoutExperience: profile.workoutExperience,
    workoutDaysPerWeek: profile.workoutDaysPerWeek,
    targetWeightKg: profile.targetWeightKg ?? '',
    targetBodyFatPercent: profile.targetBodyFatPercent ?? '',
    allergies: profile.allergies ?? '',
  };
}

export function getInitialFitnessSetupValues(profile: FitnessProfile | null | undefined) {
  if (!profile) {
    return EMPTY_FITNESS_SETUP_VALUES;
  }

  return mapFitnessProfileToFormValues(profile);
}
