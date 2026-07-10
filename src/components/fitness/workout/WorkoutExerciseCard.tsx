'use client';

import { useEffect, useState } from 'react';
import type { WorkoutExercise } from '@/lib/fitness/execution/types';

type WorkoutExerciseCardProps = {
  exercise: WorkoutExercise;
  isActive?: boolean;
  isSubmitting?: boolean;
  disabled?: boolean;
  onComplete: (values: {
    sets?: number;
    reps?: string;
    weight?: number;
    duration?: number;
  }) => void | Promise<boolean>;
};

export default function WorkoutExerciseCard({
  exercise,
  isActive = false,
  isSubmitting = false,
  disabled = false,
  onComplete,
}: WorkoutExerciseCardProps) {
  const [sets, setSets] = useState(String(exercise.sets ?? 3));
  const [reps, setReps] = useState(String(exercise.reps ?? 10));
  const [weight, setWeight] = useState(String(exercise.weightKg ?? ''));

  useEffect(() => {
    setSets(String(exercise.sets ?? 3));
    setReps(String(exercise.reps ?? 10));
    setWeight(String(exercise.weightKg ?? ''));
  }, [exercise.id, exercise.reps, exercise.sets, exercise.weightKg]);

  return (
    <article
      className={`rounded-2xl border p-4 ${
        exercise.completed
          ? 'border-emerald-500/30 bg-emerald-500/5'
          : isActive
            ? 'border-accent/40 bg-accent/5'
            : 'border-border bg-card'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            {exercise.name}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Target {exercise.sets ?? '—'} × {exercise.reps ?? '—'}
            {exercise.weightKg != null ? ` @ ${exercise.weightKg}kg` : ''}
          </p>
        </div>
        {exercise.completed ? (
          <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase text-emerald-700 dark:text-emerald-300">
            Done
          </span>
        ) : null}
      </div>

      {!exercise.completed ? (
        <div className="mt-4 space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <label className="space-y-1">
              <span className="text-[10px] font-semibold uppercase text-muted-foreground">
                Sets
              </span>
              <input
                value={sets}
                onChange={(event) => setSets(event.target.value)}
                disabled={disabled}
                className="w-full rounded-lg border border-border bg-background px-2 py-1.5 text-sm outline-none ring-accent focus:ring-2"
              />
            </label>
            <label className="space-y-1">
              <span className="text-[10px] font-semibold uppercase text-muted-foreground">
                Reps
              </span>
              <input
                value={reps}
                onChange={(event) => setReps(event.target.value)}
                disabled={disabled}
                className="w-full rounded-lg border border-border bg-background px-2 py-1.5 text-sm outline-none ring-accent focus:ring-2"
              />
            </label>
            <label className="space-y-1">
              <span className="text-[10px] font-semibold uppercase text-muted-foreground">
                Weight
              </span>
              <input
                value={weight}
                onChange={(event) => setWeight(event.target.value)}
                disabled={disabled}
                placeholder="kg"
                className="w-full rounded-lg border border-border bg-background px-2 py-1.5 text-sm outline-none ring-accent focus:ring-2"
              />
            </label>
          </div>
          <button
            type="button"
            disabled={disabled || isSubmitting}
            onClick={() =>
              void onComplete({
                sets: Number(sets) || undefined,
                reps: reps || undefined,
                weight: weight ? Number(weight) : undefined,
              })
            }
            className="w-full rounded-xl bg-accent px-3 py-2 text-xs font-semibold text-accent-foreground disabled:opacity-50 dark:text-black"
          >
            {isSubmitting ? 'Saving…' : 'Complete Exercise'}
          </button>
        </div>
      ) : null}
    </article>
  );
}
