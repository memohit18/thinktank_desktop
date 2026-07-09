import { FITNESS_SETUP_STORAGE_KEY } from '@/lib/fitness/constants';
import type { FitnessSetupDraft, FitnessSetupFormValues } from '@/lib/fitness/types';

export const EMPTY_FITNESS_SETUP_VALUES: FitnessSetupFormValues = {
  age: '',
  gender: '',
  heightCm: '',
  weightKg: '',
  activityLevel: '',
  fitnessGoal: '',
  physiqueGoalId: '',
  dietType: '',
  workoutExperience: '',
  workoutDaysPerWeek: '',
  targetWeightKg: '',
  targetBodyFatPercent: '',
  allergies: '',
};

export function normalizeFitnessSetupStep(
  step: string,
): FitnessSetupDraft['step'] {
  if (step === 'physique-goal') {
    return 'goal';
  }

  return step as FitnessSetupDraft['step'];
}

export function readFitnessSetupDraft(): FitnessSetupDraft | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem(FITNESS_SETUP_STORAGE_KEY);
    if (!raw) return null;

    const draft = JSON.parse(raw) as FitnessSetupDraft;
    return {
      ...draft,
      step: normalizeFitnessSetupStep(draft.step),
    };
  } catch {
    return null;
  }
}

export function writeFitnessSetupDraft(draft: FitnessSetupDraft) {
  if (typeof window === 'undefined') return;

  window.localStorage.setItem(FITNESS_SETUP_STORAGE_KEY, JSON.stringify(draft));
}

export function clearFitnessSetupDraft() {
  if (typeof window === 'undefined') return;

  window.localStorage.removeItem(FITNESS_SETUP_STORAGE_KEY);
}
