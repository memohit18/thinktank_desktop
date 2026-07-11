import type {
  CompleteExercisePayload,
  EndWorkoutSessionPayload,
  LogSetPayload,
  UpdateSetPayload,
} from '@/lib/fitness/workout/types';

export type WorkoutHistoryParams = {
  page?: number;
  limit?: number;
};

function withQuery(
  path: string,
  params?: Record<string, string | number | undefined>,
) {
  if (!params) return path;
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === '') continue;
    search.set(key, String(value));
  }
  const query = search.toString();
  return query ? `${path}?${query}` : path;
}

export const workoutService = {
  /** Today's planned workout day + exercises */
  today() {
    return '/workouts/today';
  },
  /** Active workout plan (planner output) */
  active() {
    return '/workouts/active';
  },
  /** In-progress session, if any */
  activeSession() {
    return '/workouts/session/active';
  },
  /** Past sessions */
  history(params?: WorkoutHistoryParams) {
    return withQuery('/workouts/sessions/history', {
      page: params?.page ?? 1,
      limit: params?.limit ?? 20,
    });
  },
  session(sessionId: string) {
    return `/workouts/session/${sessionId}`;
  },
  /** Planner: generate AI workout plan (returns draft) */
  generate(body?: Record<string, unknown>) {
    return {
      url: '/workouts/generate-ai',
      method: 'POST' as const,
      body: body ?? {},
    };
  },
  /** Activate a draft plan so /today and /active resolve */
  activate(planId: string) {
    return {
      url: `/workouts/${planId}/activate`,
      method: 'POST' as const,
    };
  },
  start(workoutPlanDayId?: string) {
    return {
      url: '/workouts/session/start',
      method: 'POST' as const,
      body: workoutPlanDayId ? { workoutPlanDayId } : {},
    };
  },
  pause(sessionId: string) {
    return {
      url: '/workouts/session/pause',
      method: 'POST' as const,
      body: { sessionId },
    };
  },
  resume(sessionId: string) {
    return {
      url: '/workouts/session/resume',
      method: 'POST' as const,
      body: { sessionId },
    };
  },
  finish(body: EndWorkoutSessionPayload) {
    return {
      url: '/workouts/session/end',
      method: 'POST' as const,
      body,
    };
  },
  completeSet(body: LogSetPayload) {
    return {
      url: `/workouts/exercises/${body.exerciseId}/set`,
      method: 'POST' as const,
      body: {
        sessionId: body.sessionId,
        reps: body.reps,
        weight: body.weight,
        ...(body.setNumber != null ? { setNumber: body.setNumber } : {}),
        ...(body.restSeconds != null ? { restSeconds: body.restSeconds } : {}),
      },
    };
  },
  updateSet(body: UpdateSetPayload) {
    return {
      url: `/workouts/exercises/${body.exerciseId}/set/${body.setId}`,
      method: 'PATCH' as const,
      body: {
        ...(body.reps != null ? { reps: body.reps } : {}),
        ...(body.weight != null ? { weight: body.weight } : {}),
        ...(body.restSeconds != null ? { restSeconds: body.restSeconds } : {}),
      },
    };
  },
  completeExercise(body: CompleteExercisePayload) {
    return {
      url: `/workouts/exercises/${body.exerciseId}/complete`,
      method: 'POST' as const,
      body: {
        ...(body.sessionId ? { sessionId: body.sessionId } : {}),
        ...(body.skip != null ? { skip: body.skip } : {}),
      },
    };
  },
};
