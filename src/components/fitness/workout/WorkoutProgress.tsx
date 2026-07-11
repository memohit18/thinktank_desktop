'use client';

import type { WorkoutAnalytics } from '@/lib/fitness/workout/types';

type WorkoutProgressProps = {
  analytics: WorkoutAnalytics;
};

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-muted/20 px-3 py-2">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

export default function WorkoutProgress({ analytics }: WorkoutProgressProps) {
  return (
    <section className="space-y-3 rounded-2xl border border-border bg-card p-4">
      <div>
        <h3 className="text-sm font-semibold text-foreground">
          Workout Progress
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Live volume, duration, and completion for this session.
        </p>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-accent transition-all"
          style={{
            width: `${Math.min(100, Math.max(0, analytics.completionPercent))}%`,
          }}
        />
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <Stat label="Completion" value={`${analytics.completionPercent}%`} />
        <Stat
          label="Exercises"
          value={`${analytics.exercisesCompleted}/${analytics.totalExercises}`}
        />
        <Stat label="Sets" value={`${analytics.setsCompleted}`} />
        <Stat label="Volume" value={`${Math.round(analytics.volumeKg)} kg`} />
        <Stat label="Duration" value={`${analytics.durationMinutes} min`} />
        <Stat
          label="Calories"
          value={
            analytics.caloriesBurned
              ? `${Math.round(analytics.caloriesBurned)}`
              : '—'
          }
        />
      </div>
    </section>
  );
}
