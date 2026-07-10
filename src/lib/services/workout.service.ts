import type {
  CompleteExercisePayload,
  EndWorkoutSessionPayload,
} from '@/lib/fitness/execution/types';

export const workoutService = {
  active() {
    return '/workouts/active';
  },
  startSession(workoutPlanDayId: string) {
    return {
      url: '/workouts/session/start',
      method: 'POST' as const,
      body: { workoutPlanDayId },
    };
  },
  endSession(body: EndWorkoutSessionPayload) {
    return {
      url: '/workouts/session/end',
      method: 'POST' as const,
      body,
    };
  },
  completeExercise(body: CompleteExercisePayload) {
    return {
      url: '/workouts/exercise/complete',
      method: 'POST' as const,
      body,
    };
  },
};
