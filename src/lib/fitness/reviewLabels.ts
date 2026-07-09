import {
  ACTIVITY_LEVEL_OPTIONS,
  DIET_TYPE_OPTIONS,
  EXPERIENCE_LEVEL_OPTIONS,
  FITNESS_GOAL_OPTIONS,
  GENDER_OPTIONS,
} from '@/lib/fitness/constants';
import { mapFitnessProfileToFormValues } from '@/lib/fitness/profileMapper';
import type { FitnessProfile, FitnessSetupFormValues } from '@/lib/fitness/types';
import type { PhysiqueGoal } from '@/lib/fitness/types';

function labelFor<T extends string>(
  options: { value: T; label: string }[],
  value: T | '',
) {
  return options.find((option) => option.value === value)?.label ?? '—';
}

export function buildFitnessReviewSections(
  values: FitnessSetupFormValues,
  physiqueGoals: PhysiqueGoal[],
) {
  const physiqueGoal = physiqueGoals.find(
    (goal) => goal.id === values.physiqueGoalId,
  );

  return buildReviewSections(values, physiqueGoal);
}

export function buildFitnessReviewSectionsFromProfile(profile: FitnessProfile) {
  const values = mapFitnessProfileToFormValues(profile);
  return buildReviewSections(values, profile.physiqueGoal ?? undefined);
}

function buildReviewSections(
  values: FitnessSetupFormValues,
  physiqueGoal?: PhysiqueGoal | null,
) {
  return [
    {
      id: 'basic-info' as const,
      title: 'Basic information',
      items: [
        { label: 'Age', value: values.age ? `${values.age} years` : '—' },
        {
          label: 'Gender',
          value: labelFor(GENDER_OPTIONS, values.gender),
        },
        {
          label: 'Height',
          value: values.heightCm ? `${values.heightCm} cm` : '—',
        },
        {
          label: 'Weight',
          value: values.weightKg ? `${values.weightKg} kg` : '—',
        },
      ],
    },
    {
      id: 'activity' as const,
      title: 'Activity',
      items: [
        {
          label: 'Activity level',
          value: labelFor(ACTIVITY_LEVEL_OPTIONS, values.activityLevel),
        },
      ],
    },
    {
      id: 'goal' as const,
      title: 'Fitness goal',
      items: [
        {
          label: 'Selected goal',
          value: physiqueGoal?.title ?? '—',
        },
        {
          label: 'Training focus',
          value: labelFor(FITNESS_GOAL_OPTIONS, values.fitnessGoal),
        },
      ],
    },
    {
      id: 'diet' as const,
      title: 'Diet & training',
      items: [
        {
          label: 'Diet type',
          value: labelFor(DIET_TYPE_OPTIONS, values.dietType),
        },
        {
          label: 'Experience',
          value: labelFor(EXPERIENCE_LEVEL_OPTIONS, values.workoutExperience),
        },
        {
          label: 'Workout days',
          value: values.workoutDaysPerWeek
            ? `${values.workoutDaysPerWeek} days / week`
            : '—',
        },
        {
          label: 'Target weight',
          value:
            values.targetWeightKg === ''
              ? 'Not set'
              : `${values.targetWeightKg} kg`,
        },
        {
          label: 'Target body fat',
          value:
            values.targetBodyFatPercent === ''
              ? 'Not set'
              : `${values.targetBodyFatPercent}%`,
        },
      ],
    },
    {
      id: 'allergy' as const,
      title: 'Allergies',
      items: [
        {
          label: 'Restrictions',
          value: values.allergies.trim() ? values.allergies.trim() : 'None listed',
        },
      ],
    },
  ];
}
