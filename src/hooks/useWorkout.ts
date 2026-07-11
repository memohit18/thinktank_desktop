'use client';

import { useCallback, useMemo } from 'react';
import { useToast } from '@/components/ui/Toast';
import { getApiErrorMessage } from '@/lib/services/getApiErrorMessage';
import {
  useActivateWorkoutPlanMutation,
  useGenerateWorkoutPlanMutation,
  useGetActiveWorkoutQuery,
  useGetTodayWorkoutQuery,
} from '@/lib/services/workoutApi';

export function useWorkout() {
  const { showToast } = useToast();
  const todayQuery = useGetTodayWorkoutQuery();
  const activeQuery = useGetActiveWorkoutQuery();
  const [generatePlan, generateState] = useGenerateWorkoutPlanMutation();
  const [activatePlan, activateState] = useActivateWorkoutPlanMutation();

  const today = useMemo(() => {
    return (
      todayQuery.data ??
      activeQuery.data?.today ??
      activeQuery.data?.days.find((day) => day.dayNumber === 1) ??
      activeQuery.data?.days[0] ??
      null
    );
  }, [activeQuery.data, todayQuery.data]);

  const generate = useCallback(async () => {
    try {
      // Backend now auto-activates; response is the active plan.
      const plan = await generatePlan().unwrap();
      if (!plan?.id) {
        showToast('Workout plan generated, but no plan id returned.', 'error');
        return false;
      }

      // Fallback if an older backend still returns draft.
      if (plan.status && plan.status.toLowerCase() === 'draft') {
        try {
          await activatePlan(plan.id).unwrap();
          showToast('Workout plan generated and activated.');
        } catch (activateError) {
          showToast(
            getApiErrorMessage(
              activateError,
              'Plan generated as draft. Activate it to start workouts.',
            ),
            'error',
          );
        }
      } else {
        showToast('Workout plan generated and activated.');
      }

      await Promise.all([todayQuery.refetch(), activeQuery.refetch()]);
      return true;
    } catch (error) {
      showToast(
        getApiErrorMessage(
          error,
          'Failed to generate workout plan. Confirm POST /workouts/generate-ai is available.',
        ),
        'error',
      );
      return false;
    }
  }, [activatePlan, activeQuery, generatePlan, showToast, todayQuery]);

  return {
    today,
    active: activeQuery.data,
    exercises: today?.exercises ?? [],
    hasPlan: Boolean(
      activeQuery.data?.days?.length || today?.exercises?.length,
    ),
    isLoading: todayQuery.isLoading && activeQuery.isLoading,
    isFetching: todayQuery.isFetching || activeQuery.isFetching,
    isError: todayQuery.isError && activeQuery.isError,
    isGenerating: generateState.isLoading || activateState.isLoading,
    generate,
    refetch: async () => {
      await Promise.all([todayQuery.refetch(), activeQuery.refetch()]);
    },
  };
}
