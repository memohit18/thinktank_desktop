'use client';

import CompletionRing from '@/components/fitness/execution/CompletionRing';
import type { DailyCheckinScore } from '@/lib/fitness/execution/types';

type DailyScoreProps = {
  checkin?: DailyCheckinScore | null;
  isLoading?: boolean;
};

function BreakdownPill({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-muted/20 px-3 py-2">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

export default function DailyScore({ checkin, isLoading }: DailyScoreProps) {
  if (isLoading && !checkin) {
    return (
      <section className="animate-pulse rounded-2xl border border-border bg-card p-6">
        <div className="h-6 w-40 rounded bg-muted" />
        <div className="mt-6 flex gap-6">
          <div className="size-28 rounded-full bg-muted" />
          <div className="grid flex-1 grid-cols-2 gap-2">
            <div className="h-14 rounded-xl bg-muted" />
            <div className="h-14 rounded-xl bg-muted" />
            <div className="h-14 rounded-xl bg-muted" />
            <div className="h-14 rounded-xl bg-muted" />
          </div>
        </div>
      </section>
    );
  }

  const score = checkin?.todayScore ?? 0;
  const mealsScore =
    checkin?.breakdown?.meals ??
    checkin?.meals.score ??
    (checkin?.meals.assigned
      ? Math.round(
          (checkin.meals.completed / checkin.meals.assigned) * 100,
        )
      : null);
  const workoutScore =
    checkin?.breakdown?.workout ??
    checkin?.workout.score ??
    (checkin?.workout.completed ? 100 : 0);
  const waterScore =
    checkin?.breakdown?.water ??
    checkin?.water.score ??
    (checkin?.water.goalMl
      ? Math.round((checkin.water.currentMl / checkin.water.goalMl) * 100)
      : null);
  const calorieScore =
    checkin?.breakdown?.calories ??
    (checkin?.calories.goal
      ? Math.min(
          100,
          Math.round((checkin.calories.current / checkin.calories.goal) * 100),
        )
      : null);
  const proteinScore =
    checkin?.breakdown?.protein ??
    (checkin?.protein.goal
      ? Math.min(
          100,
          Math.round((checkin.protein.current / checkin.protein.goal) * 100),
        )
      : null);

  return (
    <section className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 sm:p-6">
      <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-accent/5" />
      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
        <div className="space-y-2 sm:min-w-[160px]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
            Today&apos;s Score
          </p>
          <CompletionRing
            value={score}
            max={100}
            label="score"
            sublabel={
              checkin?.compliancePercent != null
                ? `${Math.round(checkin.compliancePercent)}% compliance`
                : 'Daily execution'
            }
          />
        </div>

        <div className="grid flex-1 grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          <BreakdownPill
            label="Meals"
            value={mealsScore != null ? `${Math.round(mealsScore)}` : '—'}
          />
          <BreakdownPill
            label="Workout"
            value={workoutScore != null ? `${Math.round(workoutScore)}` : '—'}
          />
          <BreakdownPill
            label="Water"
            value={waterScore != null ? `${Math.round(waterScore)}` : '—'}
          />
          <BreakdownPill
            label="Calories"
            value={
              checkin?.calories.goal
                ? `${Math.round(checkin.calories.current)}/${Math.round(checkin.calories.goal)}`
                : checkin?.calories.current
                  ? `${Math.round(checkin.calories.current)}`
                  : '—'
            }
          />
          <BreakdownPill
            label="Protein"
            value={
              checkin?.protein.goal
                ? `${Math.round(checkin.protein.current)}/${Math.round(checkin.protein.goal)}g`
                : checkin?.protein.current
                  ? `${Math.round(checkin.protein.current)}g`
                  : '—'
            }
          />
        </div>
      </div>
      {calorieScore != null || proteinScore != null ? (
        <p className="relative mt-4 text-xs text-muted-foreground">
          Macro progress
          {calorieScore != null ? ` · calories ${Math.round(calorieScore)}%` : ''}
          {proteinScore != null ? ` · protein ${Math.round(proteinScore)}%` : ''}
        </p>
      ) : null}
    </section>
  );
}
