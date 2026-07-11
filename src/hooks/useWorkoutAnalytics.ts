'use client';

import { useMemo } from 'react';
import { useWorkout } from '@/hooks/useWorkout';
import { computeWorkoutAnalytics } from '@/lib/fitness/workout/workoutResponse';
import type { WorkoutAnalytics } from '@/lib/fitness/workout/types';

export function useWorkoutAnalytics(): {
  analytics: WorkoutAnalytics;
  isLoading: boolean;
} {
  const workout = useWorkout();
  const analytics = useMemo(
    () => computeWorkoutAnalytics(workout.today),
    [workout.today],
  );
  return {
    analytics,
    isLoading: workout.isLoading,
  };
}
