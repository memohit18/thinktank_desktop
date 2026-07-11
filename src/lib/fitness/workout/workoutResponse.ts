import {
  isFitnessErrorEnvelope,
  unwrapFitnessData,
} from '@/lib/fitness/fitnessResponse';
import type {
  ActiveWorkoutPlan,
  WorkoutAnalytics,
  WorkoutDay,
  WorkoutExercise,
  WorkoutHistoryItem,
  WorkoutHistoryMeta,
  WorkoutHistoryResponse,
  WorkoutSession,
  WorkoutSetLog,
} from '@/lib/fitness/workout/types';

function readString(value: unknown, fallback = '') {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function readNumber(value: unknown, fallback = 0) {
  if (value === null || value === undefined || value === '') return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function readNullableNumber(value: unknown) {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeSet(raw: unknown, index: number): WorkoutSetLog | null {
  if (!raw || typeof raw !== 'object') return null;
  const record = raw as Record<string, unknown>;
  const id = readString(record.id ?? record.setId) || `set-${index + 1}`;
  return {
    id,
    setNumber: readNumber(record.setNumber ?? record.set ?? index + 1, index + 1),
    reps: readNullableNumber(record.reps ?? record.repCount),
    weightKg: readNullableNumber(record.weightKg ?? record.weight),
    completed: Boolean(
      record.completed ?? record.isCompleted ?? record.logged ?? true,
    ),
    restSeconds: readNullableNumber(record.restSeconds ?? record.rest),
    createdAt: readString(record.createdAt ?? record.loggedAt) || null,
  };
}

export function normalizeWorkoutExercise(
  raw: unknown,
  index = 0,
): WorkoutExercise | null {
  if (!raw || typeof raw !== 'object') return null;
  const record = raw as Record<string, unknown>;
  const nestedExercise =
    record.exercise && typeof record.exercise === 'object'
      ? (record.exercise as Record<string, unknown>)
      : null;

  // Prefer workout_plan_exercises.id (needed for set/complete APIs).
  const id = readString(
    record.id ??
      record.workoutPlanExerciseId ??
      record.workoutExerciseId ??
      nestedExercise?.id ??
      record.exerciseId,
  );
  const name = readString(
    nestedExercise?.name ??
      record.name ??
      record.exerciseName ??
      record.title ??
      record.label,
  );
  if (!id && !name) return null;

  const setsRaw = Array.isArray(record.loggedSets)
    ? record.loggedSets
    : Array.isArray(record.sets) &&
        record.sets.some(
          (item) => item && typeof item === 'object' && 'reps' in (item as object),
        )
      ? record.sets
      : Array.isArray(record.setLogs)
        ? record.setLogs
        : [];

  const loggedSets = setsRaw
    .map((item, setIndex) => normalizeSet(item, setIndex))
    .filter((item): item is WorkoutSetLog => item !== null);

  const targetSets = readNumber(
    record.targetSets ??
      record.setsTarget ??
      (typeof record.sets === 'number' ? record.sets : null) ??
      loggedSets.length,
    3,
  );

  const status = readString(record.status).toLowerCase();

  return {
    id: id || `exercise-${index}`,
    name: name || 'Exercise',
    targetSets,
    targetReps: (record.targetReps ??
      record.reps ??
      record.repRange ??
      null) as string | number | null,
    targetWeightKg: readNullableNumber(
      record.targetWeightKg ?? record.weightKg ?? record.weight ?? record.targetWeight,
    ),
    restSeconds: readNumber(record.restSeconds ?? record.rest ?? record.restTime, 60),
    notes: readString(record.notes ?? record.instructions) || null,
    order: readNullableNumber(record.order ?? record.sortOrder) ?? index,
    completed: Boolean(
      record.completed === true ||
        record.isCompleted === true ||
        record.completedAt ||
        status === 'completed' ||
        status === 'complete' ||
        status === 'done' ||
        status === 'finished',
    ),
    skipped: Boolean(
      record.skipped === true ||
        record.skip === true ||
        record.isSkipped === true ||
        record.skippedAt ||
        status === 'skipped',
    ),
    loggedSets,
    muscleGroup:
      readString(
        nestedExercise?.muscleGroup ?? record.muscleGroup ?? record.focus,
      ) || null,
  };
}

export function normalizeWorkoutDay(raw: unknown): WorkoutDay | null {
  if (!raw || typeof raw !== 'object') return null;
  const record = raw as Record<string, unknown>;
  const id = readString(
    record.id ?? record.workoutPlanDayId ?? record.dayId ?? record.todayId,
  );
  const exercisesRaw = Array.isArray(record.exercises)
    ? record.exercises
    : Array.isArray(record.items)
      ? record.items
      : Array.isArray(record.workoutPlanExercises)
        ? record.workoutPlanExercises
        : [];

  const exercises = exercisesRaw
    .map((item, index) => normalizeWorkoutExercise(item, index))
    .filter((item): item is WorkoutExercise => item !== null)
    .sort((a, b) => a.order - b.order);

  if (!id && exercises.length === 0) return null;

  return {
    id: id || `day-${readString(record.dayNumber) || '1'}`,
    workoutPlanId:
      readString(record.workoutPlanId ?? record.planId) || null,
    label: readString(record.label ?? record.name ?? record.title) || null,
    dayNumber: readNullableNumber(record.dayNumber ?? record.day),
    focus: readString(record.focus ?? record.muscleGroup ?? record.theme) || null,
    estimatedMinutes: readNullableNumber(
      record.estimatedMinutes ?? record.durationMinutes ?? record.duration,
    ),
    estimatedCalories: readNullableNumber(
      record.estimatedCalories ?? record.calories,
    ),
    exercises,
    date: readString(record.date) || null,
  };
}

export function unwrapTodayWorkout(response: unknown): WorkoutDay | null {
  if (isFitnessErrorEnvelope(response)) return null;
  const data = unwrapFitnessData(response);
  if (!data) return null;
  if (typeof data !== 'object') return null;
  const record = data as Record<string, unknown>;

  // Phase 8.1 shape: { date, workoutPlanDay, activeSession }
  let day: WorkoutDay | null = null;
  if (record.workoutPlanDay != null) {
    day = normalizeWorkoutDay(record.workoutPlanDay);
  } else if ('today' in record) {
    day = normalizeWorkoutDay(record.today);
  } else {
    day = normalizeWorkoutDay(data);
  }

  if (!day) return null;

  // Plan day alone has no session progress — merge active session logs/status.
  if (record.activeSession != null) {
    const session = unwrapWorkoutSession({
      success: true,
      message: 'Success',
      data: record.activeSession,
    });
    if (session?.exercises?.length) {
      day = {
        ...day,
        exercises: mergeWorkoutExercises(day.exercises, session.exercises),
      };
    }
  }

  return day;
}

/** Overlay session progress (sets / completed / skipped) onto plan exercises. */
export function mergeWorkoutExercises(
  planExercises: WorkoutExercise[],
  sessionExercises?: WorkoutExercise[] | null,
): WorkoutExercise[] {
  if (!sessionExercises?.length) return planExercises;

  const byId = new Map(
    sessionExercises.map((exercise) => [exercise.id, exercise]),
  );

  const merged = planExercises.map((planExercise) => {
    const progress = byId.get(planExercise.id);
    if (!progress) return planExercise;
    byId.delete(planExercise.id);
    return {
      ...planExercise,
      name: progress.name || planExercise.name,
      loggedSets: progress.loggedSets.length
        ? progress.loggedSets
        : planExercise.loggedSets,
      completed: progress.completed || planExercise.completed,
      skipped: progress.skipped || planExercise.skipped,
      muscleGroup: progress.muscleGroup || planExercise.muscleGroup,
    };
  });

  // Keep any session-only exercises that weren't in the plan list.
  for (const leftover of byId.values()) {
    merged.push(leftover);
  }

  return merged.sort((a, b) => a.order - b.order);
}

/** Optional in-progress session nested on GET /workouts/today */
export function unwrapTodayActiveSession(
  response: unknown,
): WorkoutSession | null {
  if (isFitnessErrorEnvelope(response)) return null;
  const data = unwrapFitnessData(response);
  if (!data || typeof data !== 'object') return null;
  const record = data as Record<string, unknown>;
  if (record.activeSession == null) return null;
  return unwrapWorkoutSession({
    success: true,
    message: 'Success',
    data: record.activeSession,
  });
}

export function unwrapActiveWorkout(
  response: unknown,
): ActiveWorkoutPlan | null {
  if (isFitnessErrorEnvelope(response)) return null;
  const data = unwrapFitnessData(response);
  if (!data || typeof data !== 'object') return null;
  const record = data as Record<string, unknown>;
  const daysRaw = Array.isArray(record.days)
    ? record.days
    : Array.isArray(record.workoutDays)
      ? record.workoutDays
      : [];
  const days = daysRaw
    .map((item) => normalizeWorkoutDay(item))
    .filter((item): item is WorkoutDay => item !== null)
    .sort((a, b) => (a.dayNumber ?? 0) - (b.dayNumber ?? 0));

  // Backend may omit `today`; fall back to day 1 / first day so the player can render.
  const today =
    normalizeWorkoutDay(record.today ?? record.todayWorkout) ??
    days.find((day) => day.dayNumber === 1) ??
    days[0] ??
    null;

  return {
    id: readString(record.id ?? record.workoutPlanId) || 'active-workout',
    name:
      readString(
        record.name ??
          record.title ??
          record.label ??
          (record.goal ? String(record.goal).replace(/_/g, ' ') : ''),
      ) || null,
    status: readString(record.status) || null,
    days,
    today,
  };
}

export function unwrapWorkoutSession(
  response: unknown,
): WorkoutSession | null {
  if (isFitnessErrorEnvelope(response)) return null;
  const data = unwrapFitnessData(response);
  if (!data || typeof data !== 'object') return null;
  const record = data as Record<string, unknown>;
  const nested =
    record.session && typeof record.session === 'object'
      ? (record.session as Record<string, unknown>)
      : record;
  const sessionId = readString(
    nested.sessionId ?? nested.id ?? nested.workoutSessionId ?? record.sessionId,
  );
  if (!sessionId) return null;

  const exercisesRaw = Array.isArray(nested.exercises)
    ? nested.exercises
    : Array.isArray(record.exercises)
      ? record.exercises
      : [];

  return {
    sessionId,
    workoutPlanDayId:
      readString(nested.workoutPlanDayId ?? nested.dayId) || null,
    workoutPlanId: readString(nested.workoutPlanId ?? nested.planId) || null,
    status: readString(nested.status ?? record.status) || 'active',
    startedAt: readString(nested.startedAt ?? nested.createdAt) || null,
    pausedAt: readString(nested.pausedAt) || null,
    endedAt: readString(nested.endedAt ?? nested.completedAt) || null,
    durationSeconds: readNullableNumber(
      nested.durationSeconds ?? nested.elapsedSeconds,
    ),
    durationMinutes: readNullableNumber(nested.durationMinutes),
    caloriesBurned: readNullableNumber(nested.caloriesBurned ?? nested.calories),
    exercisesCompleted: readNullableNumber(nested.exercisesCompleted),
    exercisesSkipped: readNullableNumber(nested.exercisesSkipped),
    setsCompleted: readNullableNumber(nested.setsCompleted),
    completionPercent: readNullableNumber(
      nested.completionPercent ?? nested.completion,
    ),
    volumeKg: readNullableNumber(nested.volumeKg ?? nested.volume),
    exercises: exercisesRaw
      .map((item, index) => normalizeWorkoutExercise(item, index))
      .filter((item): item is WorkoutExercise => item !== null),
  };
}

export function unwrapWorkoutSet(response: unknown): WorkoutSetLog | null {
  if (isFitnessErrorEnvelope(response)) return null;
  const data = unwrapFitnessData(response);
  return normalizeSet(data ?? response, 0);
}

export function unwrapWorkoutAnalytics(
  response: unknown,
  fallback?: Partial<WorkoutAnalytics>,
): WorkoutAnalytics | null {
  if (isFitnessErrorEnvelope(response)) {
    return fallback
      ? {
          volumeKg: fallback.volumeKg ?? 0,
          durationMinutes: fallback.durationMinutes ?? 0,
          exercisesCompleted: fallback.exercisesCompleted ?? 0,
          exercisesSkipped: fallback.exercisesSkipped ?? 0,
          setsCompleted: fallback.setsCompleted ?? 0,
          caloriesBurned: fallback.caloriesBurned ?? 0,
          completionPercent: fallback.completionPercent ?? 0,
          totalExercises: fallback.totalExercises ?? 0,
        }
      : null;
  }
  const data = unwrapFitnessData(response);
  const record =
    data && typeof data === 'object' ? (data as Record<string, unknown>) : {};
  const analytics =
    record.analytics && typeof record.analytics === 'object'
      ? (record.analytics as Record<string, unknown>)
      : record;

  return {
    volumeKg: readNumber(analytics.volumeKg ?? analytics.volume ?? fallback?.volumeKg),
    durationMinutes: readNumber(
      analytics.durationMinutes ??
        analytics.duration ??
        fallback?.durationMinutes,
    ),
    exercisesCompleted: readNumber(
      analytics.exercisesCompleted ?? fallback?.exercisesCompleted,
    ),
    exercisesSkipped: readNumber(
      analytics.exercisesSkipped ?? fallback?.exercisesSkipped,
    ),
    setsCompleted: readNumber(
      analytics.setsCompleted ?? fallback?.setsCompleted,
    ),
    caloriesBurned: readNumber(
      analytics.caloriesBurned ?? analytics.calories ?? fallback?.caloriesBurned,
    ),
    completionPercent: readNumber(
      analytics.completionPercent ??
        analytics.completion ??
        fallback?.completionPercent,
    ),
    totalExercises: readNumber(
      analytics.totalExercises ?? fallback?.totalExercises,
    ),
  };
}

function normalizeHistoryItem(raw: unknown): WorkoutHistoryItem | null {
  if (!raw || typeof raw !== 'object') return null;
  const record = raw as Record<string, unknown>;
  const id = readString(record.id ?? record.sessionId);
  if (!id) return null;
  return {
    id,
    sessionId: readString(record.sessionId ?? record.id) || null,
    label: readString(record.label ?? record.name ?? record.title) || null,
    focus: readString(record.focus ?? record.muscleGroup) || null,
    date: readString(record.date ?? record.completedAt ?? record.createdAt) || null,
    durationMinutes: readNullableNumber(record.durationMinutes ?? record.duration),
    caloriesBurned: readNullableNumber(record.caloriesBurned ?? record.calories),
    completionPercent: readNullableNumber(
      record.completionPercent ?? record.completion,
    ),
    exercisesCompleted: readNullableNumber(record.exercisesCompleted),
    volumeKg: readNullableNumber(record.volumeKg ?? record.volume),
    status: readString(record.status) || null,
  };
}

export function unwrapWorkoutHistory(
  response: unknown,
): WorkoutHistoryResponse {
  if (isFitnessErrorEnvelope(response)) return { items: [] };
  const data = unwrapFitnessData<
    | WorkoutHistoryItem[]
    | { items?: unknown[]; history?: unknown[]; meta?: WorkoutHistoryMeta }
  >(response);
  if (!data) return { items: [] };
  const list = Array.isArray(data)
    ? data
    : Array.isArray(data.items)
      ? data.items
      : Array.isArray(data.history)
        ? data.history
        : [];
  return {
    items: list
      .map((item) => normalizeHistoryItem(item))
      .filter((item): item is WorkoutHistoryItem => item !== null),
    meta: !Array.isArray(data) ? data.meta : undefined,
  };
}

export function computeWorkoutAnalytics(
  day: WorkoutDay | null,
  session?: WorkoutSession | null,
  elapsedSeconds = 0,
): WorkoutAnalytics {
  const exercises = mergeWorkoutExercises(
    day?.exercises ?? [],
    session?.exercises,
  );
  const exercisesCompleted = exercises.filter((item) => item.completed).length;
  const exercisesSkipped = exercises.filter((item) => item.skipped).length;
  const setsCompleted = exercises.reduce(
    (sum, item) => sum + item.loggedSets.filter((set) => set.completed).length,
    0,
  );
  const volumeKg = exercises.reduce(
    (sum, item) =>
      sum +
      item.loggedSets.reduce(
        (setSum, set) =>
          setSum + (set.completed ? (set.weightKg ?? 0) * (set.reps ?? 0) : 0),
        0,
      ),
    0,
  );
  const totalExercises = exercises.length;
  const completionPercent =
    totalExercises > 0
      ? Math.round(
          ((exercisesCompleted + exercisesSkipped) / totalExercises) * 100,
        )
      : 0;

  return {
    volumeKg: session?.volumeKg ?? volumeKg,
    durationMinutes:
      session?.durationMinutes ??
      Math.max(0, Math.round(elapsedSeconds / 60)),
    exercisesCompleted: session?.exercisesCompleted ?? exercisesCompleted,
    exercisesSkipped: session?.exercisesSkipped ?? exercisesSkipped,
    setsCompleted: session?.setsCompleted ?? setsCompleted,
    caloriesBurned: session?.caloriesBurned ?? 0,
    completionPercent: session?.completionPercent ?? completionPercent,
    totalExercises,
  };
}
