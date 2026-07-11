'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useToast } from '@/components/ui/Toast';
import { useWorkout } from '@/hooks/useWorkout';
import { useWorkoutSession } from '@/hooks/useWorkoutSession';
import type { WorkoutExercise } from '@/lib/fitness/workout/types';
import {
  computeWorkoutAnalytics,
  mergeWorkoutExercises,
} from '@/lib/fitness/workout/workoutResponse';
import { getApiErrorMessage } from '@/lib/services/getApiErrorMessage';
import {
  useCompleteWorkoutExerciseMutation,
  useLogWorkoutSetMutation,
} from '@/lib/services/workoutApi';

type ExerciseOverride = {
  completed?: boolean;
  skipped?: boolean;
};

function isAlreadyDoneError(error: unknown) {
  const message = getApiErrorMessage(error, '');
  return /already completed|already skipped/i.test(message);
}

export function useWorkoutExecution() {
  const { showToast } = useToast();
  const workout = useWorkout();
  const session = useWorkoutSession(workout.today?.id);
  const [logSet, logSetState] = useLogWorkoutSetMutation();
  const [completeExercise, completeState] =
    useCompleteWorkoutExerciseMutation();

  const [restSecondsLeft, setRestSecondsLeft] = useState(0);
  const [activeExerciseId, setActiveExerciseId] = useState<string | null>(null);
  const [expandedExerciseId, setExpandedExerciseId] = useState<string | null>(
    null,
  );
  const [exerciseOverrides, setExerciseOverrides] = useState<
    Record<string, ExerciseOverride>
  >({});

  useEffect(() => {
    if (restSecondsLeft <= 0 || session.status !== 'active') return;
    const timer = setInterval(() => {
      setRestSecondsLeft((value) => (value > 0 ? value - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [restSecondsLeft, session.status]);

  // Reset local overrides when starting a fresh session id.
  useEffect(() => {
    setExerciseOverrides({});
  }, [session.sessionId]);

  const exercises = useMemo(() => {
    const merged = mergeWorkoutExercises(
      workout.exercises,
      session.session?.exercises,
    );
    return merged.map((exercise) => {
      const override = exerciseOverrides[exercise.id];
      if (!override) return exercise;
      return {
        ...exercise,
        completed: override.completed ?? exercise.completed,
        skipped: override.skipped ?? exercise.skipped,
      };
    });
  }, [exerciseOverrides, session.session?.exercises, workout.exercises]);

  const analytics = useMemo(
    () =>
      computeWorkoutAnalytics(
        {
          ...(workout.today ?? {
            id: 'today',
            exercises: [],
          }),
          exercises,
        },
        session.session,
        session.elapsedSeconds,
      ),
    [exercises, session.elapsedSeconds, session.session, workout.today],
  );

  const remainingRequired = useMemo(
    () => exercises.filter((item) => !item.completed && !item.skipped).length,
    [exercises],
  );

  const advanceToNext = useCallback(
    (currentId: string) => {
      const next = exercises.find(
        (item) =>
          item.id !== currentId && !item.completed && !item.skipped,
      );
      setActiveExerciseId(next?.id ?? currentId);
      setExpandedExerciseId(next?.id ?? null);
    },
    [exercises],
  );

  const start = useCallback(async () => {
    const result = await session.start();
    if (!result) return false;
    setExerciseOverrides({});
    const first = exercises.find((item) => !item.completed && !item.skipped);
    setActiveExerciseId(first?.id ?? exercises[0]?.id ?? null);
    setExpandedExerciseId(first?.id ?? exercises[0]?.id ?? null);
    await workout.refetch();
    return true;
  }, [exercises, session, workout]);

  const logExerciseSet = useCallback(
    async (
      exercise: WorkoutExercise,
      values: { reps: number; weight: number },
    ) => {
      if (!session.sessionId) {
        showToast('Start the workout before logging sets.', 'error');
        return false;
      }
      try {
        await logSet({
          exerciseId: exercise.id,
          sessionId: session.sessionId,
          reps: values.reps,
          weight: values.weight,
          setNumber: exercise.loggedSets.length + 1,
          restSeconds: exercise.restSeconds,
        }).unwrap();
        if (exercise.restSeconds > 0) {
          setRestSecondsLeft(exercise.restSeconds);
        }
        setActiveExerciseId(exercise.id);
        showToast(`Set ${exercise.loggedSets.length + 1} logged.`);
        await Promise.all([workout.refetch(), session.refetchSession()]);
        return true;
      } catch (error) {
        showToast(getApiErrorMessage(error, 'Failed to log set.'), 'error');
        return false;
      }
    },
    [logSet, session, showToast, workout],
  );

  const markExerciseComplete = useCallback(
    async (exercise: WorkoutExercise, skipped = false) => {
      const applyLocalDone = () => {
        setExerciseOverrides((prev) => ({
          ...prev,
          [exercise.id]: {
            completed: !skipped,
            skipped,
          },
        }));
      };

      try {
        await completeExercise({
          exerciseId: exercise.id,
          sessionId: session.sessionId ?? undefined,
          skip: skipped,
        }).unwrap();
        applyLocalDone();
        showToast(
          skipped ? `${exercise.name} skipped.` : `${exercise.name} complete.`,
        );
        advanceToNext(exercise.id);
        if (!skipped && exercise.restSeconds > 0) {
          setRestSecondsLeft(exercise.restSeconds);
        }
        await Promise.all([workout.refetch(), session.refetchSession()]);
        return true;
      } catch (error) {
        // Backend already has it done — sync UI instead of leaving it open.
        if (isAlreadyDoneError(error)) {
          applyLocalDone();
          showToast(
            skipped
              ? `${exercise.name} already skipped.`
              : `${exercise.name} already complete.`,
          );
          advanceToNext(exercise.id);
          await Promise.all([workout.refetch(), session.refetchSession()]);
          return true;
        }
        showToast(
          getApiErrorMessage(error, 'Failed to complete exercise.'),
          'error',
        );
        return false;
      }
    },
    [
      advanceToNext,
      completeExercise,
      session,
      showToast,
      workout,
    ],
  );

  const finish = useCallback(
    async (options?: { force?: boolean }) => {
      if (remainingRequired > 0 && !options?.force) {
        return false;
      }
      const ok = await session.finish({
        force: options?.force,
        caloriesBurned: analytics.caloriesBurned || undefined,
      });
      if (ok) await workout.refetch();
      return ok;
    },
    [analytics.caloriesBurned, remainingRequired, session, workout],
  );

  return {
    today: workout.today,
    active: workout.active,
    exercises,
    analytics,
    remainingRequired,
    sessionId: session.sessionId,
    status: session.status,
    elapsedSeconds: session.elapsedSeconds,
    restSecondsLeft,
    activeExerciseId,
    expandedExerciseId,
    setExpandedExerciseId,
    setActiveExerciseId,
    hasPlan: workout.hasPlan,
    isLoading: workout.isLoading,
    isFetching: workout.isFetching,
    isError: workout.isError,
    isGenerating: workout.isGenerating,
    isStarting: session.isStarting,
    isPausing: session.isPausing,
    isResuming: session.isResuming,
    isEnding: session.isEnding,
    isLoggingSet: logSetState.isLoading,
    isCompletingExercise: completeState.isLoading,
    generate: workout.generate,
    start,
    pause: session.pause,
    resume: session.resume,
    finish,
    logExerciseSet,
    markExerciseComplete,
    clearRest: () => setRestSecondsLeft(0),
    refetch: workout.refetch,
  };
}
