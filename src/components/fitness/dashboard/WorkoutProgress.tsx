'use client';

import Link from 'next/link';
import type { DashboardWorkoutProgress } from '@/lib/fitness/dashboard/types';

type WorkoutProgressProps = {
  workout: DashboardWorkoutProgress;
};

export default function WorkoutProgress({ workout }: WorkoutProgressProps) {
  const percent = workout.completed
    ? 100
    : Math.min(100, Math.max(0, workout.score ?? 0));

  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Workout Progress
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {workout.completed ? 'Session complete' : 'Ready when you are'}
          </p>
        </div>
        <Link
          href="/fitness/workout"
          className="text-xs font-semibold text-accent hover:underline"
        >
          Open
        </Link>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-accent transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Stat
          label="Status"
          value={workout.completed ? 'Done' : 'Pending'}
        />
        <Stat
          label="Score"
          value={workout.score != null ? `${Math.round(workout.score)}` : '—'}
        />
      </div>
    </section>
  );
}

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
