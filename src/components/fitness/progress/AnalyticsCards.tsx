'use client';

import type { ProgressAnalytics } from '@/lib/fitness/progress/types';

type AnalyticsCardsProps = {
  analytics?: ProgressAnalytics | null;
};

function Card({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-lg font-semibold text-foreground">{value}</p>
      {hint ? (
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

export default function AnalyticsCards({ analytics }: AnalyticsCardsProps) {
  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-base font-semibold text-foreground">Analytics</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Momentum metrics derived from your logs and check-ins.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Card
          label="Weight Change"
          value={
            analytics?.weightChangeKg == null
              ? '—'
              : `${analytics.weightChangeKg > 0 ? '+' : ''}${analytics.weightChangeKg.toFixed(1)} kg`
          }
          hint={
            analytics?.weightChangeKg == null
              ? undefined
              : analytics.weightChangeKg <= 0
                ? 'Net loss so far'
                : 'Net gain so far'
          }
        />
        <Card
          label="Body Fat Change"
          value={
            analytics?.bodyFatChange == null
              ? '—'
              : `${analytics.bodyFatChange > 0 ? '+' : ''}${analytics.bodyFatChange.toFixed(1)}%`
          }
        />
        <Card
          label="Weekly Average"
          value={
            analytics?.weeklyAverageWeightChangeKg == null
              ? '—'
              : `${analytics.weeklyAverageWeightChangeKg > 0 ? '+' : ''}${analytics.weeklyAverageWeightChangeKg.toFixed(1)} kg`
          }
        />
        <Card
          label="Consistency"
          value={
            analytics?.consistencyPercent != null
              ? `${Math.round(analytics.consistencyPercent)}%`
              : '—'
          }
        />
        <Card
          label="ETA"
          value={
            analytics?.estimatedWeeksRemaining != null
              ? `${Math.round(analytics.estimatedWeeksRemaining)} wk`
              : '—'
          }
          hint={
            analytics?.etaWeeksDelta != null && analytics.etaWeeksDelta !== 0
              ? analytics.etaWeeksDelta < 0
                ? `${Math.abs(Math.round(analytics.etaWeeksDelta))} weeks ahead`
                : `${Math.abs(Math.round(analytics.etaWeeksDelta))} weeks behind`
              : undefined
          }
        />
        <Card
          label="Current Streak"
          value={
            analytics?.currentStreakDays != null
              ? `${Math.round(analytics.currentStreakDays)} days`
              : '—'
          }
        />
        <Card
          label="Compliance"
          value={
            analytics?.compliancePercent != null
              ? `${Math.round(analytics.compliancePercent)}%`
              : '—'
          }
        />
        <Card
          label="Weeks Elapsed"
          value={
            analytics?.weeksElapsed != null
              ? `${Math.round(analytics.weeksElapsed)}`
              : '—'
          }
        />
      </div>
    </section>
  );
}
