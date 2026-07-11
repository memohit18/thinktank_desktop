'use client';

import { RefreshCw } from 'lucide-react';
import ScoreRing from '@/components/fitness/dashboard/ScoreRing';

type DashboardHeroProps = {
  score: number | null;
  compliancePercent?: number | null;
  streakDays?: number | null;
  dateLabel?: string | null;
  isRefreshing?: boolean;
  onRefresh?: () => void;
};

export default function DashboardHero({
  score,
  compliancePercent,
  streakDays,
  dateLabel,
  isRefreshing = false,
  onRefresh,
}: DashboardHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 sm:p-6">
      <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-accent/5" />
      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
            Daily Dashboard
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Today&apos;s Score
          </h1>
          <p className="max-w-md text-sm text-muted-foreground">
            {dateLabel
              ? `Live execution for ${dateLabel}.`
              : 'Live view of meals, workout, water, and macros.'}
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            <span className="rounded-lg border border-border bg-muted/30 px-2.5 py-1 text-xs font-medium text-foreground">
              {compliancePercent != null
                ? `${Math.round(compliancePercent)}% compliance`
                : 'Compliance pending'}
            </span>
            <span className="rounded-lg border border-border bg-muted/30 px-2.5 py-1 text-xs font-medium text-foreground">
              {streakDays != null
                ? `${streakDays}-day streak`
                : 'Streak building'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <ScoreRing
            score={score}
            sublabel={
              score != null ? 'Daily execution' : 'No score yet'
            }
          />
          {onRefresh ? (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="inline-flex size-10 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-50"
              aria-label="Refresh dashboard"
            >
              <RefreshCw
                className={`size-4 ${isRefreshing ? 'animate-spin' : ''}`}
              />
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
