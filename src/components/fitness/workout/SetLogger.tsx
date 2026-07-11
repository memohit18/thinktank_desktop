'use client';

import { useState } from 'react';
import RepInput from '@/components/fitness/workout/RepInput';
import WeightInput from '@/components/fitness/workout/WeightInput';
import {
  formatExerciseTarget,
  isDurationPrescription,
  parseDurationMinutes,
} from '@/lib/fitness/workout/exercisePrescription';
import type { WorkoutExercise } from '@/lib/fitness/workout/types';

type SetLoggerProps = {
  exercise: WorkoutExercise;
  disabled?: boolean;
  isSubmitting?: boolean;
  onLogSet: (values: { reps: number; weight: number }) => void | Promise<boolean>;
};

export default function SetLogger({
  exercise,
  disabled = false,
  isSubmitting = false,
  onLogSet,
}: SetLoggerProps) {
  const durationBased = isDurationPrescription(exercise.targetReps);
  const [reps, setReps] = useState(
    durationBased
      ? String(parseDurationMinutes(exercise.targetReps))
      : String(exercise.targetReps ?? 10),
  );
  const [weight, setWeight] = useState(
    String(exercise.targetWeightKg ?? ''),
  );

  const nextSet = exercise.loggedSets.length + 1;

  return (
    <div className="space-y-3 rounded-xl border border-border bg-muted/20 p-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold text-foreground">
          {durationBased
            ? `Log session ${nextSet}${exercise.targetSets ? ` / ${exercise.targetSets}` : ''}`
            : `Log set ${nextSet}${exercise.targetSets ? ` / ${exercise.targetSets}` : ''}`}
        </p>
        <p className="text-right text-[11px] text-muted-foreground">
          Target {formatExerciseTarget(exercise)}
        </p>
      </div>

      {exercise.loggedSets.length > 0 ? (
        <div className="space-y-1">
          {exercise.loggedSets.map((set) => (
            <div
              key={set.id}
              className="flex items-center justify-between rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs"
            >
              <span className="font-semibold text-foreground">
                {durationBased ? `Session ${set.setNumber}` : `Set ${set.setNumber}`}
              </span>
              <span className="text-muted-foreground">
                {durationBased
                  ? `${set.reps ?? '—'} min`
                  : `${set.reps ?? '—'} reps · ${set.weightKg ?? '—'} kg`}
              </span>
            </div>
          ))}
        </div>
      ) : null}

      {durationBased ? (
        <label className="block space-y-1">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            Duration (min)
          </span>
          <input
            type="number"
            inputMode="numeric"
            min={1}
            step={1}
            value={reps}
            disabled={disabled}
            onChange={(event) => setReps(event.target.value)}
            className="w-full rounded-lg border border-border bg-background px-2.5 py-2 text-sm outline-none ring-accent focus:ring-2 disabled:opacity-50"
            placeholder="30"
          />
          <p className="text-[11px] text-muted-foreground">
            Cardio / recovery — log minutes completed. No weight needed.
          </p>
        </label>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <RepInput value={reps} onChange={setReps} disabled={disabled} />
          <WeightInput value={weight} onChange={setWeight} disabled={disabled} />
        </div>
      )}

      <button
        type="button"
        disabled={disabled || isSubmitting || !reps}
        onClick={() =>
          void onLogSet({
            reps: Number(reps) || 0,
            weight: durationBased ? 0 : Number(weight) || 0,
          })
        }
        className="w-full rounded-xl bg-accent px-3 py-2 text-xs font-semibold text-accent-foreground disabled:opacity-50 dark:text-black"
      >
        {isSubmitting
          ? 'Saving…'
          : durationBased
            ? `Log ${reps || '—'} min`
            : `Complete Set ${nextSet}`}
      </button>
    </div>
  );
}
