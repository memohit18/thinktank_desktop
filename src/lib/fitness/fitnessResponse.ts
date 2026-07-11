import type { FitnessProfile, FitnessPlans, PhysiqueGoal, PhysiqueGoalsResponse } from '@/lib/fitness/types';
import { normalizePhysiqueGoal, normalizePhysiqueGoals } from '@/lib/fitness/physiqueGoalMapper';

export type FitnessApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type FitnessApiErrorEnvelope = {
  statusCode: number;
  error: string;
  message: string;
  path?: string;
  timestamp?: string;
};

export function isFitnessErrorEnvelope(
  response: unknown,
): response is FitnessApiErrorEnvelope {
  return (
    !!response &&
    typeof response === 'object' &&
    'statusCode' in response &&
    typeof (response as FitnessApiErrorEnvelope).statusCode === 'number'
  );
}

export function isMissingFitnessProfileStatus(status: unknown) {
  return status === 404;
}

export function unwrapFitnessData<T>(response: unknown): T | null {
  if (!response || typeof response !== 'object') {
    return null;
  }

  if (isFitnessErrorEnvelope(response)) {
    return null;
  }

  if ('success' in response) {
    const envelope = response as FitnessApiEnvelope<T>;

    if (!envelope.success) {
      return null;
    }

    if ('data' in envelope) {
      return envelope.data ?? null;
    }

    return null;
  }

  return response as T;
}

export function unwrapPhysiqueGoals(response: unknown): PhysiqueGoal[] {
  const data = unwrapFitnessData<
    PhysiqueGoal[] | PhysiqueGoalsResponse | { goals: PhysiqueGoal[] }
  >(response);

  if (!data) {
    return [];
  }

  if (Array.isArray(data)) {
    return normalizePhysiqueGoals(data);
  }

  if (typeof data === 'object' && 'goals' in data) {
    return normalizePhysiqueGoals(data.goals ?? []);
  }

  if (typeof data === 'object' && 'items' in data) {
    const items = (data as { items?: unknown[] }).items;
    return normalizePhysiqueGoals(items ?? []);
  }

  return [];
}

export function unwrapFitnessProfile(response: unknown): FitnessProfile | null {
  const data = unwrapFitnessData<
    FitnessProfile | null | { profile: FitnessProfile | null }
  >(response);

  if (!data) {
    return null;
  }

  let profile: FitnessProfile | null = null;

  if (typeof data === 'object' && 'profile' in data) {
    profile = data.profile ?? null;
  } else if (typeof data === 'object' && 'id' in data) {
    profile = data as FitnessProfile;
  }

  if (!profile?.id) {
    return null;
  }

  const record = profile as FitnessProfile & {
    onboarding_completed?: boolean;
    height_cm?: number;
    weight_kg?: number;
    physique_goal_id?: string;
    activity_level?: string;
    fitness_goal?: string;
    diet_type?: string;
    workout_experience?: string;
    workout_days_per_week?: number;
    target_weight_kg?: number | null;
    target_body_fat_percent?: number | null;
    physique_goal?: unknown;
    created_at?: string;
    updated_at?: string;
  };

  const nestedPhysiqueGoal =
    profile.physiqueGoal ?? record.physique_goal ?? null;

  const plansRaw =
    (profile as FitnessProfile).plans ??
    (record as { plans?: unknown }).plans ??
    null;

  return {
    ...profile,
    id: String(profile.id),
    age: Number(profile.age ?? record.age),
    gender: profile.gender ?? (record.gender as FitnessProfile['gender']),
    heightCm: Number(profile.heightCm ?? record.height_cm ?? 0),
    weightKg: Number(profile.weightKg ?? record.weight_kg ?? 0),
    activityLevel:
      profile.activityLevel ??
      (record.activity_level as FitnessProfile['activityLevel']),
    fitnessGoal:
      profile.fitnessGoal ??
      (record.fitness_goal as FitnessProfile['fitnessGoal']),
    physiqueGoalId: String(
      profile.physiqueGoalId ?? record.physique_goal_id ?? '',
    ),
    dietType:
      profile.dietType ?? (record.diet_type as FitnessProfile['dietType']),
    workoutExperience:
      profile.workoutExperience ??
      (record.workout_experience as FitnessProfile['workoutExperience']),
    workoutDaysPerWeek: Number(
      profile.workoutDaysPerWeek ?? record.workout_days_per_week ?? 0,
    ),
    targetWeightKg:
      profile.targetWeightKg ?? record.target_weight_kg ?? null,
    targetBodyFatPercent:
      profile.targetBodyFatPercent ?? record.target_body_fat_percent ?? null,
    allergies: profile.allergies ?? record.allergies ?? null,
    onboardingCompleted: Boolean(
      profile.onboardingCompleted ?? record.onboarding_completed,
    ),
    physiqueGoal: nestedPhysiqueGoal
      ? normalizePhysiqueGoal(nestedPhysiqueGoal)
      : null,
    plans: normalizeFitnessPlans(plansRaw),
    createdAt: profile.createdAt ?? record.created_at,
    updatedAt: profile.updatedAt ?? record.updated_at,
  };
}

function readPlanString(value: unknown, fallback = '') {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

export function normalizeFitnessPlans(raw: unknown): FitnessPlans | null {
  if (!raw || typeof raw !== 'object') return null;
  const record = raw as Record<string, unknown>;
  const nutritionRaw =
    record.nutrition && typeof record.nutrition === 'object'
      ? (record.nutrition as Record<string, unknown>)
      : null;
  const workoutRaw =
    record.workout && typeof record.workout === 'object'
      ? (record.workout as Record<string, unknown>)
      : null;

  const nutrition = nutritionRaw
    ? {
        dailyTarget:
          readPlanString(nutritionRaw.dailyTarget) ||
          (nutritionRaw.calories != null
            ? `${Number(nutritionRaw.calories).toLocaleString()} kcal`
            : ''),
        proteinGoal:
          readPlanString(nutritionRaw.proteinGoal) ||
          (nutritionRaw.protein != null
            ? `${Number(nutritionRaw.protein)} g`
            : ''),
        calories:
          nutritionRaw.calories == null ? null : Number(nutritionRaw.calories),
        protein:
          nutritionRaw.protein == null ? null : Number(nutritionRaw.protein),
        ready: Boolean(nutritionRaw.ready),
      }
    : null;

  const workout = workoutRaw
    ? {
        frequency:
          readPlanString(workoutRaw.frequency) ||
          (workoutRaw.daysPerWeek != null
            ? `${workoutRaw.daysPerWeek} days/week`
            : ''),
        focusArea: readPlanString(workoutRaw.focusArea) || '—',
        daysPerWeek:
          workoutRaw.daysPerWeek == null
            ? null
            : Number(workoutRaw.daysPerWeek),
        fitnessGoal: readPlanString(workoutRaw.fitnessGoal) || null,
        ready: Boolean(workoutRaw.ready),
      }
    : null;

  return {
    nutrition,
    workout,
    ready: Boolean(record.ready ?? (nutrition?.ready && workout?.ready)),
    transformationId: readPlanString(record.transformationId) || null,
    dietPlanId: readPlanString(record.dietPlanId) || null,
    workoutPlanId: readPlanString(record.workoutPlanId) || null,
  };
}

export function unwrapFitnessPlans(response: unknown): FitnessPlans | null {
  if (isFitnessErrorEnvelope(response)) return null;
  const data = unwrapFitnessData(response);
  return normalizeFitnessPlans(data ?? response);
}
