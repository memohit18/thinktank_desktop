import type { Transformation } from '@/lib/fitness/transformation/types';

export const EMPTY_TRANSFORMATION: Transformation = {
  id: '',
  currentWeightKg: 0,
  targetWeightKg: 0,
  currentBodyFat: 0,
  targetBodyFat: 0,
  bmi: 0,
  bmr: 0,
  tdee: 0,
  dailyCalories: 0,
  dailyProtein: 0,
  estimatedWeeks: 0,
  targetPhysique: null,
  goal: null,
  status: 'UNAVAILABLE',
  milestones: [],
};

export function resolveTransformationView(
  transformation: Transformation | null | undefined,
): Transformation {
  if (!transformation?.id) {
    return EMPTY_TRANSFORMATION;
  }

  return transformation;
}

export function formatMetricNumber(value: number, fractionDigits = 0) {
  if (!Number.isFinite(value)) {
    return '0';
  }

  return fractionDigits > 0 ? value.toFixed(fractionDigits) : String(Math.round(value));
}
