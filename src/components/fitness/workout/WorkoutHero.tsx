'use client';

import { History, Pause, Play, Square } from 'lucide-react';
import type { WorkoutAnalytics, WorkoutDay } from '@/lib/fitness/workout/types';

type WorkoutHeroProps = {
  day: WorkoutDay | null;
  status: 'idle' | 'active' | 'paused' | 'finished';
  elapsedSeconds: number;
  analytics: WorkoutAnalytics;
  isStarting?: boolean;
  isPausing?: boolean;
  isResuming?: boolean;
  isEnding?: boolean;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onFinish: () => void;
  onOpenHistory?: () => void;
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

export default function WorkoutHero({
  day,
  status,
  elapsedSeconds,
  analytics,
  isStarting = false,
  isPausing = false,
  isResuming = false,
  isEnding = false,
  onStart,
  onPause,
  onResume,
  onFinish,
  onOpenHistory,
}: WorkoutHeroProps) {
  const sessionLive = status === 'active' || status === 'paused';

  return (
    <section className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 sm:p-6">
      <div className="absolute inset-0 bg-gradient-to-br from-accent/15 via-transparent to-accent/5" />
      <div className="relative space-y-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
              Today&apos;s Workout
            </p>
            <h1 className="mt-1 text-2xl font-bold text-foreground sm:text-3xl">
              {day?.label ||
                (day?.dayNumber != null ? `Day ${day.dayNumber}` : 'Workout Player')}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {day?.focus ? `${day.focus} · ` : ''}
              {analytics.exercisesCompleted}/{analytics.totalExercises} complete
              {day?.estimatedMinutes ? ` · ~${day.estimatedMinutes} min` : ''}
            </p>
          </div>
          <div className="flex items-start gap-3">
            {onOpenHistory ? (
              <button
                type="button"
                onClick={onOpenHistory}
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted"
              >
                <History className="size-3.5" />
                History
              </button>
            ) : null}
            <div className="text-right">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Timer
              </p>
              <p className="text-3xl font-bold tabular-nums text-foreground">
                {formatElapsed(elapsedSeconds)}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {status === 'idle' || status === 'finished' ? (
            <button
              type="button"
              disabled={isStarting || !day}
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
              disabled={isPausing}
              onClick={onPause}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-muted/30 px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-muted disabled:opacity-60"
            >
              <Pause className="size-4" />
              Pause
            </button>
          ) : null}
          {status === 'paused' ? (
            <button
              type="button"
              disabled={isResuming}
              onClick={onResume}
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground disabled:opacity-60 dark:text-black"
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
    </section>
  );
}
