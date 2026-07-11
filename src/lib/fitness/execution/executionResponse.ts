import {
  isFitnessErrorEnvelope,
  unwrapFitnessData,
} from '@/lib/fitness/fitnessResponse';
import type {
  ActiveWorkoutPlan,
  AiChatResponse,
  DailyCheckinScore,
  HydrationToday,
  WorkoutDay,
  WorkoutExercise,
  WorkoutSession,
} from '@/lib/fitness/execution/types';

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

function macroPair(
  raw: unknown,
  currentKeys: string[],
  goalKeys: string[],
): { current: number; goal: number; percent?: number | null } {
  if (raw && typeof raw === 'object') {
    const record = raw as Record<string, unknown>;
    const current = readNumber(
      currentKeys.map((key) => record[key]).find((v) => v != null),
    );
    const goal = readNumber(
      goalKeys.map((key) => record[key]).find((v) => v != null),
    );
    return {
      current,
      goal,
      percent: readNullableNumber(record.percent ?? record.percentage),
    };
  }
  return { current: 0, goal: 0 };
}

export function unwrapDailyCheckin(response: unknown): DailyCheckinScore | null {
  if (isFitnessErrorEnvelope(response)) return null;
  const data = unwrapFitnessData(response);
  if (!data || typeof data !== 'object') return null;
  const record = data as Record<string, unknown>;
  const nestedCheckin =
    record.checkin && typeof record.checkin === 'object'
      ? (record.checkin as Record<string, unknown>)
      : null;
  const breakdown =
    record.breakdown && typeof record.breakdown === 'object'
      ? (record.breakdown as Record<string, unknown>)
      : null;
  const mealsRaw =
    record.meals && typeof record.meals === 'object'
      ? (record.meals as Record<string, unknown>)
      : {};
  const workoutRaw =
    record.workout && typeof record.workout === 'object'
      ? (record.workout as Record<string, unknown>)
      : {};
  const waterRaw =
    record.water && typeof record.water === 'object'
      ? (record.water as Record<string, unknown>)
      : record.hydration && typeof record.hydration === 'object'
        ? (record.hydration as Record<string, unknown>)
        : {};

  // API may return calories/protein as flat numbers OR { current, goal } objects.
  const caloriesIsNumber = typeof record.calories === 'number';
  const proteinIsNumber = typeof record.protein === 'number';
  const calories = caloriesIsNumber
    ? {
        current: readNumber(record.calories),
        goal: readNumber(
          nestedCheckin?.calorieGoal ?? record.calorieGoal ?? record.caloriesGoal,
        ),
        percent: null as number | null,
      }
    : macroPair(
        record.calories ?? record.calorie,
        ['current', 'consumed', 'value', 'amount'],
        ['goal', 'target', 'targetCalories'],
      );
  const protein = proteinIsNumber
    ? {
        current: readNumber(record.protein),
        goal: readNumber(
          nestedCheckin?.proteinGoal ?? record.proteinGoal ?? record.proteinTarget,
        ),
        percent: null as number | null,
      }
    : macroPair(
        record.protein,
        ['current', 'consumed', 'value', 'amount'],
        ['goal', 'target', 'targetProtein'],
      );

  const mealsCompleted = readNumber(
    mealsRaw.completed ??
      mealsRaw.completedCount ??
      record.mealsCompleted ??
      nestedCheckin?.mealsCompleted,
  );
  const mealsAssigned = readNumber(
    mealsRaw.assigned ??
      mealsRaw.total ??
      record.mealsAssigned ??
      (mealsCompleted +
        readNumber(
          mealsRaw.skipped ?? record.mealsSkipped ?? nestedCheckin?.mealsSkipped,
        )),
  );
  const mealsSkipped = readNumber(
    mealsRaw.skipped ??
      mealsRaw.skippedCount ??
      record.mealsSkipped ??
      nestedCheckin?.mealsSkipped,
  );

  return {
    todayScore: readNullableNumber(
      record.todayScore ?? record.score ?? record.dailyScore,
    ),
    calories: {
      current:
        calories.current ||
        readNumber(
          record.caloriesConsumed ?? nestedCheckin?.caloriesConsumed,
        ),
      goal: calories.goal || readNumber(record.calorieGoal),
      percent: calories.percent,
    },
    protein: {
      current:
        protein.current ||
        readNumber(
          record.proteinConsumed ?? nestedCheckin?.proteinConsumed,
        ),
      goal: protein.goal || readNumber(record.proteinGoal),
      percent: protein.percent,
    },
    meals: {
      completed: mealsCompleted,
      assigned: mealsAssigned,
      skipped: mealsSkipped,
      score:
        readNullableNumber(mealsRaw.score ?? breakdown?.meals) ??
        (mealsAssigned > 0
          ? Math.round((mealsCompleted / mealsAssigned) * 100)
          : null),
    },
    workout: {
      completed: Boolean(
        workoutRaw.completed ??
          workoutRaw.done ??
          record.workoutCompleted ??
          nestedCheckin?.workoutCompleted ??
          false,
      ),
      score: readNullableNumber(workoutRaw.score ?? breakdown?.workout),
      durationMinutes: readNullableNumber(
        workoutRaw.durationMinutes ?? workoutRaw.duration,
      ),
    },
    water: {
      currentMl: readNumber(
        waterRaw.currentMl ??
          waterRaw.amountMl ??
          waterRaw.current ??
          record.waterMl ??
          nestedCheckin?.waterIntakeMl,
      ),
      goalMl: readNumber(
        waterRaw.targetMl ??
          waterRaw.goalMl ??
          waterRaw.goal ??
          record.waterGoalMl,
        3500,
      ),
      percent: readNullableNumber(waterRaw.percent ?? breakdown?.water),
      score: readNullableNumber(waterRaw.score),
    },
    compliancePercent: readNullableNumber(
      record.compliancePercent ??
        record.compliance ??
        nestedCheckin?.dietCompliance,
    ),
    breakdown: breakdown
      ? {
          meals: readNullableNumber(breakdown.meals),
          workout: readNullableNumber(breakdown.workout),
          water: readNullableNumber(breakdown.water),
          calories: readNullableNumber(breakdown.calories),
          protein: readNullableNumber(breakdown.protein),
        }
      : {
          meals:
            mealsAssigned > 0
              ? Math.round((mealsCompleted / mealsAssigned) * 100)
              : null,
          workout: readNullableNumber(workoutRaw.score),
          water: readNullableNumber(waterRaw.percent ?? waterRaw.score),
          calories: null,
          protein: null,
        },
    date: readString(record.date ?? nestedCheckin?.checkInDate) || null,
  };
}

export function unwrapHydrationToday(
  response: unknown,
): HydrationToday | null {
  if (isFitnessErrorEnvelope(response)) return null;
  const data = unwrapFitnessData(response);
  if (!data || typeof data !== 'object') return null;
  const record = data as Record<string, unknown>;
  const amountMl = readNumber(
    record.amountMl ?? record.currentMl ?? record.totalMl ?? record.consumedMl,
  );
  const goalMl = readNumber(record.goalMl ?? record.targetMl ?? record.goal, 3500);
  const remainingMl = readNullableNumber(record.remainingMl);
  const percent =
    readNullableNumber(record.percent ?? record.percentage) ??
    (goalMl > 0 ? Math.min(100, (amountMl / goalMl) * 100) : 0);

  return {
    amountMl,
    goalMl,
    remainingMl: remainingMl ?? Math.max(0, goalMl - amountMl),
    percent,
    logs: Array.isArray(record.logs)
      ? record.logs
          .filter((item) => item && typeof item === 'object')
          .map((item) => {
            const log = item as Record<string, unknown>;
            return {
              id: readString(log.id) || undefined,
              amountMl: readNumber(log.amountMl ?? log.amount),
              createdAt: readString(log.createdAt ?? log.loggedAt) || undefined,
            };
          })
      : undefined,
  };
}

function normalizeExercise(raw: unknown, index: number): WorkoutExercise | null {
  if (!raw || typeof raw !== 'object') return null;
  const record = raw as Record<string, unknown>;
  const id = readString(
    record.id ?? record.workoutPlanExerciseId ?? record.exerciseId,
  );
  const name = readString(record.name ?? record.exerciseName ?? record.title);
  if (!id && !name) return null;
  return {
    id: id || `exercise-${index}`,
    name: name || 'Exercise',
    sets: readNullableNumber(record.sets ?? record.targetSets),
    reps: (record.reps ?? record.targetReps ?? null) as string | number | null,
    weightKg: readNullableNumber(record.weightKg ?? record.weight ?? record.targetWeight),
    restSeconds: readNullableNumber(record.restSeconds ?? record.rest),
    durationMinutes: readNullableNumber(record.durationMinutes ?? record.duration),
    notes: readString(record.notes) || null,
    completed: Boolean(record.completed ?? record.isCompleted),
    order: readNullableNumber(record.order ?? record.sortOrder) ?? index,
  };
}

function normalizeWorkoutDay(raw: unknown): WorkoutDay | null {
  if (!raw || typeof raw !== 'object') return null;
  const record = raw as Record<string, unknown>;
  const id = readString(
    record.id ?? record.workoutPlanDayId ?? record.dayId,
  );
  const exercisesRaw = Array.isArray(record.exercises)
    ? record.exercises
    : Array.isArray(record.items)
      ? record.items
      : [];
  const exercises = exercisesRaw
    .map((item, index) => normalizeExercise(item, index))
    .filter((item): item is WorkoutExercise => item !== null)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  if (!id && exercises.length === 0) return null;

  return {
    id: id || `day-${readString(record.dayNumber) || '1'}`,
    label: readString(record.label ?? record.name ?? record.title) || null,
    dayNumber: readNullableNumber(record.dayNumber ?? record.day),
    focus: readString(record.focus ?? record.muscleGroup) || null,
    estimatedMinutes: readNullableNumber(
      record.estimatedMinutes ?? record.durationMinutes,
    ),
    exercises,
  };
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
    .filter((item): item is WorkoutDay => item !== null);
  const today = normalizeWorkoutDay(record.today ?? record.todayWorkout);

  return {
    id: readString(record.id ?? record.workoutPlanId) || 'active-workout',
    name: readString(record.name ?? record.title ?? record.label) || null,
    status: readString(record.status) || null,
    days,
    today: today ?? days[0] ?? null,
  };
}

export function unwrapWorkoutSession(
  response: unknown,
): WorkoutSession | null {
  if (isFitnessErrorEnvelope(response)) return null;
  const data = unwrapFitnessData(response);
  if (!data || typeof data !== 'object') return null;
  const record = data as Record<string, unknown>;
  const sessionId = readString(
    record.sessionId ?? record.id ?? record.workoutSessionId,
  );
  if (!sessionId) return null;
  return {
    sessionId,
    workoutPlanDayId:
      readString(record.workoutPlanDayId ?? record.dayId) || null,
    startedAt: readString(record.startedAt ?? record.createdAt) || null,
    status: readString(record.status) || 'active',
    durationMinutes: readNullableNumber(record.durationMinutes),
    caloriesBurned: readNullableNumber(record.caloriesBurned),
  };
}

export function unwrapAiChat(response: unknown): AiChatResponse | null {
  if (isFitnessErrorEnvelope(response)) return null;
  const data = unwrapFitnessData(response);
  if (!data || typeof data !== 'object') return null;
  const record = data as Record<string, unknown>;
  const reply =
    readString(
      record.reply ??
        record.answer ??
        record.message ??
        record.response ??
        record.content,
    ) || '';
  const sessionId = readString(
    record.sessionId ?? record.conversationId ?? record.id,
  );
  if (!sessionId && !reply) return null;
  return {
    sessionId: sessionId || `session-${Date.now()}`,
    reply,
    message: readString(record.message) || null,
    answer: readString(record.answer) || null,
    contextVersion: (record.contextVersion as string | number | null) ?? null,
    createdAt: readString(record.createdAt ?? record.timestamp) || null,
  };
}
