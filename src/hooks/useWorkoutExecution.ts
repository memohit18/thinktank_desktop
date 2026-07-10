'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useToast } from '@/components/ui/Toast';
import type {
  CompleteExercisePayload,
  WorkoutExercise,
} from '@/lib/fitness/execution/types';
import { getApiErrorMessage } from '@/lib/services/getApiErrorMessage';
import {
  useCompleteWorkoutExerciseMutation,
  useEndWorkoutSessionMutation,
  useGetActiveWorkoutQuery,
  useStartWorkoutSessionMutation,
} from '@/lib/services/workoutApi';

type SessionStatus = 'idle' | 'active' | 'paused' | 'finished';

export function useWorkoutExecution() {
  const { showToast } = useToast();
  const workoutQuery = useGetActiveWorkoutQuery();
  const [startSession, startState] = useStartWorkoutSessionMutation();
  const [completeExercise, completeState] =
    useCompleteWorkoutExerciseMutation();
  const [endSession, endState] = useEndWorkoutSessionMutation();

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [status, setStatus] = useState<SessionStatus>('idle');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [restSecondsLeft, setRestSecondsLeft] = useState(0);
  const [activeExerciseId, setActiveExerciseId] = useState<string | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const today = workoutQuery.data?.today ?? workoutQuery.data?.days[0] ?? null;

  useEffect(() => {
    if (status !== 'active') {
      if (tickRef.current) clearInterval(tickRef.current);
      tickRef.current = null;
      return;
    }

    tickRef.current = setInterval(() => {
      setElapsedSeconds((value) => value + 1);
      setRestSecondsLeft((value) => (value > 0 ? value - 1 : 0));
    }, 1000);

    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [status]);

  const start = useCallback(async () => {
    if (!today?.id) {
      showToast('No workout day available.', 'error');
      return false;
    }
    try {
      const session = await startSession(today.id).unwrap();
      if (!session?.sessionId) {
        showToast('Could not start workout session.', 'error');
        return false;
      }
      setSessionId(session.sessionId);
      setStatus('active');
      setElapsedSeconds(0);
      setActiveExerciseId(today.exercises[0]?.id ?? null);
      showToast('Workout started.');
      return true;
    } catch (error) {
      showToast(
        getApiErrorMessage(error, 'Failed to start workout.'),
        'error',
      );
      return false;
    }
  }, [showToast, startSession, today]);

  const pause = useCallback(() => {
    if (status === 'active') setStatus('paused');
  }, [status]);

  const resume = useCallback(() => {
    if (status === 'paused') setStatus('active');
  }, [status]);

  const finish = useCallback(async () => {
    if (!sessionId) {
      setStatus('finished');
      return true;
    }
    try {
      await endSession({
        sessionId,
        durationMinutes: Math.max(1, Math.round(elapsedSeconds / 60)),
      }).unwrap();
      setStatus('finished');
      showToast('Workout finished.');
      return true;
    } catch (error) {
      showToast(
        getApiErrorMessage(error, 'Failed to finish workout.'),
        'error',
      );
      return false;
    }
  }, [elapsedSeconds, endSession, sessionId, showToast]);

  const markExerciseComplete = useCallback(
    async (
      exercise: WorkoutExercise,
      values: Omit<CompleteExercisePayload, 'workoutPlanExerciseId' | 'sessionId'>,
    ) => {
      try {
        await completeExercise({
          workoutPlanExerciseId: exercise.id,
          sessionId: sessionId ?? undefined,
          sets: values.sets ?? exercise.sets ?? undefined,
          reps: values.reps ?? exercise.reps ?? undefined,
          weight: values.weight ?? exercise.weightKg ?? undefined,
          duration: values.duration,
        }).unwrap();
        if (exercise.restSeconds && exercise.restSeconds > 0) {
          setRestSecondsLeft(exercise.restSeconds);
        }
        const exercises = today?.exercises ?? [];
        const index = exercises.findIndex((item) => item.id === exercise.id);
        const next = exercises[index + 1];
        setActiveExerciseId(next?.id ?? exercise.id);
        showToast(`${exercise.name} logged.`);
        return true;
      } catch (error) {
        showToast(
          getApiErrorMessage(error, 'Failed to log exercise.'),
          'error',
        );
        return false;
      }
    },
    [completeExercise, sessionId, showToast, today?.exercises],
  );

  const completedCount = useMemo(
    () => today?.exercises.filter((item) => item.completed).length ?? 0,
    [today?.exercises],
  );

  return {
    plan: workoutQuery.data,
    today,
    sessionId,
    status,
    elapsedSeconds,
    restSecondsLeft,
    activeExerciseId,
    setActiveExerciseId,
    completedCount,
    totalExercises: today?.exercises.length ?? 0,
    isLoading: workoutQuery.isLoading,
    isFetching: workoutQuery.isFetching,
    isError: workoutQuery.isError,
    isStarting: startState.isLoading,
    isCompletingExercise: completeState.isLoading,
    isEnding: endState.isLoading,
    start,
    pause,
    resume,
    finish,
    markExerciseComplete,
    clearRest: () => setRestSecondsLeft(0),
    refetch: workoutQuery.refetch,
  };
}
