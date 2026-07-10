'use client';

import { Pause, Play, Square } from 'lucide-react';
import RestTimer from '@/components/fitness/workout/RestTimer';
import WorkoutExerciseCard from '@/components/fitness/workout/WorkoutExerciseCard';
import type { WorkoutDay, WorkoutExercise } from '@/lib/fitness/execution/types';

type WorkoutPlayerProps = {
  day: WorkoutDay | null;
  status: 'idle' | 'active' | 'paused' | 'finished';
  elapsedSeconds: number;
  restSecondsLeft: number;
  activeExerciseId: string | null;
  completedCount: number;
  isStarting?: boolean;
  isEnding?: boolean;
  isCompletingExercise?: boolean;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onFinish: () => void;
  onClearRest: () => void;
  onCompleteExercise: (
    exercise: WorkoutExercise,
    values: {
      sets?: number;
      reps?: string;
      weight?: number;
      duration?: number;
    },
  ) => void | Promise<boolean>;
};

function formatElapsed(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export default function WorkoutPlayer({
  day,
  status,
  elapsedSeconds,
  restSecondsLeft,
  activeExerciseId,
  completedCount,
  isStarting = false,
  isEnding = false,
  isCompletingExercise = false,
  onStart,
  onPause,
  onResume,
  onFinish,
  onClearRest,
  onCompleteExercise,
}: WorkoutPlayerProps) {
  if (!day) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-16 text-center">
        <h2 className="text-lg font-semibold text-foreground">
          No workout scheduled
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          Activate a workout plan to start logging sets, reps, and rest timers.
        </p>
      </div>
    );
  }

  const sessionLive = status === 'active' || status === 'paused';

  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
              Workout Session
            </p>
            <h2 className="mt-1 text-xl font-bold text-foreground">
              {day.label ||
                (day.dayNumber != null ? `Day ${day.dayNumber}` : 'Today')}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {day.focus ? `${day.focus} · ` : ''}
              {completedCount}/{day.exercises.length} exercises
              {day.estimatedMinutes
                ? ` · ~${day.estimatedMinutes} min`
                : ''}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Timer
            </p>
            <p className="text-3xl font-bold tabular-nums text-foreground">
              {formatElapsed(elapsedSeconds)}
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {status === 'idle' || status === 'finished' ? (
            <button
              type="button"
              disabled={isStarting}
              onClick={onStart}
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground disabled:opacity-60 dark:text-black"
            >
              <Play className="size-4" />
              {status === 'finished' ? 'Start Again' : 'Start Workout'}
            </button>
          ) : null}
          {status === 'active' ? (
            <button
              type="button"
              onClick={onPause}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-muted/30 px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-muted"
            >
              <Pause className="size-4" />
              Pause
            </button>
          ) : null}
          {status === 'paused' ? (
            <button
              type="button"
              onClick={onResume}
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground dark:text-black"
            >
              <Play className="size-4" />
              Resume
            </button>
          ) : null}
          {sessionLive ? (
            <button
              type="button"
              disabled={isEnding}
              onClick={onFinish}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-muted/30 px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-muted disabled:opacity-60"
            >
              <Square className="size-4" />
              Finish
            </button>
          ) : null}
        </div>
      </div>

      <RestTimer secondsLeft={restSecondsLeft} onSkip={onClearRest} />

      <div className="space-y-3">
        {day.exercises.map((exercise) => (
          <WorkoutExerciseCard
            key={exercise.id}
            exercise={exercise}
            isActive={activeExerciseId === exercise.id}
            isSubmitting={isCompletingExercise && activeExerciseId === exercise.id}
            disabled={!sessionLive}
            onComplete={(values) => onCompleteExercise(exercise, values)}
          />
        ))}
      </div>
    </section>
  );
}
