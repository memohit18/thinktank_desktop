'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useToast } from '@/components/ui/Toast';
import type { WorkoutSession } from '@/lib/fitness/workout/types';
import { getApiErrorMessage } from '@/lib/services/getApiErrorMessage';
import {
  useEndWorkoutSessionMutation,
  useGetActiveWorkoutSessionQuery,
  useGetWorkoutSessionQuery,
  usePauseWorkoutSessionMutation,
  useResumeWorkoutSessionMutation,
  useStartWorkoutSessionMutation,
} from '@/lib/services/workoutApi';

type LocalStatus = 'idle' | 'active' | 'paused' | 'finished';

function mapSessionStatus(session?: WorkoutSession | null): LocalStatus {
  if (!session) return 'idle';
  const status = String(session.status).toLowerCase();
  if (status === 'paused') return 'paused';
  if (status === 'completed' || status === 'finished' || status === 'ended') {
    return 'finished';
  }
  if (status === 'active' || status === 'in_progress' || status === 'started') {
    return 'active';
  }
  return 'idle';
}

export function useWorkoutSession(workoutPlanDayId?: string | null) {
  const { showToast } = useToast();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [status, setStatus] = useState<LocalStatus>('idle');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hydratedRef = useRef(false);

  const [startSession, startState] = useStartWorkoutSessionMutation();
  const [pauseSession, pauseState] = usePauseWorkoutSessionMutation();
  const [resumeSession, resumeState] = useResumeWorkoutSessionMutation();
  const [endSession, endState] = useEndWorkoutSessionMutation();
  const activeSessionQuery = useGetActiveWorkoutSessionQuery();
  const sessionQuery = useGetWorkoutSessionQuery(sessionId ?? '', {
    skip: !sessionId,
  });

  useEffect(() => {
    if (hydratedRef.current) return;
    const active = activeSessionQuery.data;
    if (!active?.sessionId) return;
    const mapped = mapSessionStatus(active);
    if (mapped === 'finished' || mapped === 'idle') return;
    hydratedRef.current = true;
    setSessionId(active.sessionId);
    setStatus(mapped);
    if (active.durationSeconds != null) {
      setElapsedSeconds(active.durationSeconds);
    } else if (active.durationMinutes != null) {
      setElapsedSeconds(active.durationMinutes * 60);
    }
  }, [activeSessionQuery.data]);
  useEffect(() => {
    if (sessionQuery.data) {
      setStatus(mapSessionStatus(sessionQuery.data));
      if (sessionQuery.data.durationSeconds != null) {
        setElapsedSeconds(sessionQuery.data.durationSeconds);
      } else if (sessionQuery.data.durationMinutes != null) {
        setElapsedSeconds(sessionQuery.data.durationMinutes * 60);
      }
    }
  }, [sessionQuery.data]);

  useEffect(() => {
    if (status !== 'active') {
      if (tickRef.current) clearInterval(tickRef.current);
      tickRef.current = null;
      return;
    }
    tickRef.current = setInterval(() => {
      setElapsedSeconds((value) => value + 1);
    }, 1000);
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [status]);

  const start = useCallback(async () => {
    try {
      const session = await startSession(workoutPlanDayId || undefined).unwrap();
      if (!session?.sessionId) {
        showToast('Could not start workout session.', 'error');
        return null;
      }
      setSessionId(session.sessionId);
      setStatus('active');
      setElapsedSeconds(0);
      showToast('Workout started.');
      return session;
    } catch (error) {
      showToast(getApiErrorMessage(error, 'Failed to start workout.'), 'error');
      return null;
    }
  }, [showToast, startSession, workoutPlanDayId]);

  const pause = useCallback(async () => {
    if (!sessionId) {
      setStatus('paused');
      return true;
    }
    try {
      await pauseSession(sessionId).unwrap();
      setStatus('paused');
      showToast('Workout paused.');
      return true;
    } catch (error) {
      showToast(getApiErrorMessage(error, 'Failed to pause workout.'), 'error');
      return false;
    }
  }, [pauseSession, sessionId, showToast]);

  const resume = useCallback(async () => {
    if (!sessionId) {
      setStatus('active');
      return true;
    }
    try {
      await resumeSession(sessionId).unwrap();
      setStatus('active');
      showToast('Workout resumed.');
      return true;
    } catch (error) {
      showToast(getApiErrorMessage(error, 'Failed to resume workout.'), 'error');
      return false;
    }
  }, [resumeSession, sessionId, showToast]);

  const finish = useCallback(
    async (options?: { force?: boolean; caloriesBurned?: number }) => {
      if (!sessionId) {
        setStatus('finished');
        return true;
      }
      try {
        await endSession({
          sessionId,
          durationMinutes: Math.max(1, Math.round(elapsedSeconds / 60)),
          caloriesBurned: options?.caloriesBurned,
          force: options?.force,
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
    },
    [elapsedSeconds, endSession, sessionId, showToast],
  );

  return {
    sessionId,
    session: sessionQuery.data ?? null,
    status,
    elapsedSeconds,
    isStarting: startState.isLoading,
    isPausing: pauseState.isLoading,
    isResuming: resumeState.isLoading,
    isEnding: endState.isLoading,
    start,
    pause,
    resume,
    finish,
    setSessionId,
    refetchSession: sessionQuery.refetch,
  };
}
