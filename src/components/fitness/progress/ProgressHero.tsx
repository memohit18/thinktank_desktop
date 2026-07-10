'use client';

import { Plus, RefreshCw } from 'lucide-react';
import type {
  ProgressAnalytics,
  ProgressInsights,
} from '@/lib/fitness/progress/types';

type ProgressHeroProps = {
  analytics?: ProgressAnalytics | null;
  insights?: ProgressInsights | null;
  isRefreshing?: boolean;
  onRefresh?: () => void;
  onAddProgress?: () => void;
};

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-muted/20 px-4 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

function formatKg(value?: number | null) {
  if (value == null) return '—';
  return `${value.toFixed(1)} kg`;
}

function toneStyles(tone?: string | null) {
  switch (tone) {
    case 'ahead':
      return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300';
    case 'behind':
      return 'border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300';
    case 'on_track':
      return 'border-accent/30 bg-accent/10 text-accent';
    default:
      return 'border-border bg-muted/30 text-muted-foreground';
  }
}

export default function ProgressHero({
  analytics,
  insights,
  isRefreshing = false,
  onRefresh,
  onAddProgress,
}: ProgressHeroProps) {
  const completion = analytics?.goalCompletionPercent;
  const hasStructuredLines = Boolean(
    insights?.complianceLine || insights?.paceLine,
  );
  const supportingCopy = hasStructuredLines
    ? null
    : insights?.summary ||
      analytics?.insightMessage ||
      'Log weight, measurements, and photos so AI can turn raw numbers into momentum.';

  return (
    <section className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 sm:p-8">
      <div className="absolute inset-0 bg-gradient-to-br from-accent/15 via-transparent to-accent/5" />
      <div className="relative space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                Progress Dashboard
              </p>
              {insights?.tone ? (
                <span
                  className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase ${toneStyles(insights.tone)}`}
                >
                  {insights.tone.replace(/_/g, ' ')}
                </span>
              ) : null}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
                {insights?.headline || 'Transformation Progress'}
              </h1>
              {supportingCopy ? (
                <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                  {supportingCopy}
                </p>
              ) : null}
            </div>
            {hasStructuredLines ? (
              <div className="space-y-1 text-sm text-muted-foreground">
                {insights?.complianceLine ? (
                  <p>{insights.complianceLine}</p>
                ) : null}
                {insights?.paceLine ? <p>{insights.paceLine}</p> : null}
              </div>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-2">
            {onRefresh ? (
              <button
                type="button"
                onClick={onRefresh}
                disabled={isRefreshing}
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted disabled:opacity-60"
              >
                <RefreshCw
                  className={`size-3.5 ${isRefreshing ? 'animate-spin' : ''}`}
                />
                Refresh
              </button>
            ) : null}
            {onAddProgress ? (
              <button
                type="button"
                onClick={onAddProgress}
                className="inline-flex items-center gap-2 rounded-xl bg-accent px-3 py-2 text-xs font-semibold text-accent-foreground shadow-[0_0_16px_var(--neon-glow)] transition-opacity hover:opacity-90 dark:text-black"
              >
                <Plus className="size-3.5" />
                Add Progress
              </button>
            ) : null}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Current Weight"
            value={formatKg(analytics?.currentWeightKg)}
          />
          <StatCard
            label="Target Weight"
            value={formatKg(analytics?.targetWeightKg)}
          />
          <StatCard
            label="Remaining"
            value={formatKg(
              analytics?.remainingWeightKg != null
                ? Math.abs(analytics.remainingWeightKg)
                : null,
            )}
          />
          <StatCard
            label="Goal Completion"
            value={completion != null ? `${Math.round(completion)}%` : '—'}
          />
        </div>

        {completion != null ? (
          <div>
            <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>Progress to goal</span>
              <span>{Math.round(completion)}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-accent transition-all"
                style={{ width: `${Math.min(100, Math.max(0, completion))}%` }}
              />
            </div>
          </div>
        ) : null}

        {insights?.bullets && insights.bullets.length > 0 ? (
          <ul className="grid gap-2 sm:grid-cols-2">
            {insights.bullets.map((bullet) => (
              <li
                key={bullet}
                className="rounded-xl border border-border bg-muted/20 px-3 py-2 text-xs text-foreground"
              >
                {bullet}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}
