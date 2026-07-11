'use client';

import { Check, ChevronDown, SkipForward } from 'lucide-react';
import SetLogger from '@/components/fitness/workout/SetLogger';
import { formatExerciseTarget } from '@/lib/fitness/workout/exercisePrescription';
import type { WorkoutExercise } from '@/lib/fitness/workout/types';

type ExerciseCardProps = {
  exercise: WorkoutExercise;
  expanded?: boolean;
  isActive?: boolean;
  disabled?: boolean;
  isLoggingSet?: boolean;
  isCompleting?: boolean;
  onToggle?: () => void;
  onLogSet: (values: { reps: number; weight: number }) => void | Promise<boolean>;
  onComplete: () => void | Promise<boolean>;
  onSkip: () => void | Promise<boolean>;
};

export default function ExerciseCard({
  exercise,
  expanded = false,
  isActive = false,
  disabled = false,
  isLoggingSet = false,
  isCompleting = false,
  onToggle,
  onLogSet,
  onComplete,
  onSkip,
}: ExerciseCardProps) {
  const setsDone = exercise.loggedSets.filter((set) => set.completed).length;

  return (
    <article
      className={`overflow-hidden rounded-2xl border ${
        exercise.completed
          ? 'border-emerald-500/30 bg-emerald-500/5'
          : exercise.skipped
            ? 'border-amber-500/30 bg-amber-500/5'
            : isActive
              ? 'border-accent/40 bg-accent/5'
              : 'border-border bg-card'
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-start justify-between gap-3 px-4 py-3 text-left"
      >
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            {exercise.name}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {setsDone}/{exercise.targetSets} logged · Target{' '}
            {formatExerciseTarget(exercise)}
            {exercise.muscleGroup ? ` · ${exercise.muscleGroup}` : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {exercise.completed ? (
            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-emerald-700 dark:text-emerald-300">
              Done
            </span>
          ) : null}
          {exercise.skipped ? (
            <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-amber-700 dark:text-amber-300">
              Skipped
            </span>
          ) : null}
          <ChevronDown
            className={`size-4 text-muted-foreground transition-transform ${
              expanded ? 'rotate-180' : ''
            }`}
          />
        </div>
      </button>

      {expanded ? (
        <div className="space-y-3 border-t border-border px-4 py-3">
          {!exercise.completed && !exercise.skipped ? (
            <>
              <SetLogger
                exercise={exercise}
                disabled={disabled}
                isSubmitting={isLoggingSet}
                onLogSet={onLogSet}
              />
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={disabled || isCompleting}
                  onClick={() => void onComplete()}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-accent px-3 py-2 text-xs font-semibold text-accent-foreground disabled:opacity-50 dark:text-black"
                >
                  <Check className="size-3.5" />
                  Complete Exercise
                </button>
                <button
                  type="button"
                  disabled={disabled || isCompleting}
                  onClick={() => void onSkip()}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-muted/30 px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted disabled:opacity-50"
                >
                  <SkipForward className="size-3.5" />
                  Skip
                </button>
              </div>
            </>
          ) : (
            <p className="text-xs text-muted-foreground">
              {exercise.completed
                ? 'Exercise completed for this session.'
                : 'Exercise skipped for this session.'}
            </p>
          )}
        </div>
      ) : null}
    </article>
  );
}
