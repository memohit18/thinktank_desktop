'use client';

import { Flame, Target } from 'lucide-react';
import type { DashboardComplianceDetail } from '@/lib/fitness/dashboard/types';

type ComplianceCardProps = {
  compliancePercent: number | null;
  streakDays: number | null;
  longestStreak?: number | null;
  detail?: DashboardComplianceDetail | null;
  tone?: 'strong' | 'good' | 'fair' | 'low' | 'unknown';
};

function toneClass(tone: ComplianceCardProps['tone']) {
  switch (tone) {
    case 'strong':
      return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300';
    case 'good':
      return 'border-accent/30 bg-accent/10 text-accent';
    case 'fair':
      return 'border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300';
    case 'low':
      return 'border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300';
    default:
      return 'border-border bg-muted/30 text-muted-foreground';
  }
}

export default function ComplianceCard({
  compliancePercent,
  streakDays,
  longestStreak,
  detail,
  tone = 'unknown',
}: ComplianceCardProps) {
  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-foreground">
          Compliance & Streak
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Consistency across meals, workout, and hydration.
        </p>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <div className={`rounded-xl border px-3 py-3 ${toneClass(tone)}`}>
          <div className="mb-2 flex items-center gap-2">
            <Target className="size-4" />
            <p className="text-[10px] font-semibold uppercase tracking-wide">
              Compliance
            </p>
          </div>
          <p className="text-2xl font-bold text-foreground">
            {compliancePercent != null
              ? `${Math.round(compliancePercent)}%`
              : '—'}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-muted/20 px-3 py-3">
          <div className="mb-2 flex items-center gap-2 text-accent">
            <Flame className="size-4" />
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Current streak
            </p>
          </div>
          <p className="text-2xl font-bold text-foreground">
            {streakDays != null ? `${streakDays}` : '—'}
            <span className="ml-1 text-sm font-medium text-muted-foreground">
              days
            </span>
          </p>
          {longestStreak != null ? (
            <p className="mt-1 text-[11px] text-muted-foreground">
              Best: {longestStreak} days
            </p>
          ) : null}
        </div>
      </div>
      {detail ? (
        <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
          <MiniStat label="Meals" value={detail.meals} />
          <MiniStat label="Workout" value={detail.workout} />
          <MiniStat label="Cals" value={detail.calories} />
          <MiniStat label="Protein" value={detail.protein} />
          <MiniStat label="Water" value={detail.water} />
        </div>
      ) : null}
    </section>
  );
}

function MiniStat({
  label,
  value,
}: {
  label: string;
  value: number | null;
}) {
  return (
    <div className="rounded-lg border border-border bg-muted/20 px-2 py-1.5 text-center">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5 text-xs font-semibold text-foreground">
        {value != null ? Math.round(value) : '—'}
      </p>
    </div>
  );
}
