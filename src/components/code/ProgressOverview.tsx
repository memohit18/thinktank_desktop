'use client';

import type { UserProgressStatus } from '@/lib/code/userProgressTypes';

const STATUS_SEGMENTS: {
  status: UserProgressStatus;
  label: string;
  barClass: string;
  chipClass: string;
}[] = [
  {
    status: 'Mastered',
    label: 'Mastered',
    barClass: 'bg-amber-400',
    chipClass: 'border-amber-400/40 bg-amber-400/10 text-amber-500',
  },
  {
    status: 'Revised',
    label: 'Revised',
    barClass: 'bg-violet-400',
    chipClass: 'border-violet-400/40 bg-violet-400/10 text-violet-400',
  },
  {
    status: 'Solved',
    label: 'Solved',
    barClass: 'bg-accent',
    chipClass: 'border-accent/40 bg-accent/10 text-accent',
  },
  {
    status: 'Attempted',
    label: 'Attempted',
    barClass: 'bg-sky-400',
    chipClass: 'border-sky-400/40 bg-sky-400/10 text-sky-400',
  },
  {
    status: 'Not Started',
    label: 'Not Started',
    barClass: 'bg-muted-foreground/25',
    chipClass: 'border-border bg-muted/50 text-muted-foreground',
  },
];

type ProgressOverviewProps = {
  totalProblems: number;
  countsByStatus: Partial<Record<UserProgressStatus, number>>;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
};

export default function ProgressOverview({
  totalProblems,
  countsByStatus,
  selectedStatus,
  onStatusChange,
}: ProgressOverviewProps) {
  const trackedTotal = STATUS_SEGMENTS.reduce(
    (sum, segment) => sum + (countsByStatus[segment.status] ?? 0),
    0,
  );
  const denominator = Math.max(totalProblems, trackedTotal, 1);

  const completedCount =
    (countsByStatus.Solved ?? 0) +
    (countsByStatus.Revised ?? 0) +
    (countsByStatus.Mastered ?? 0);
  const completionPercent = Math.round((completedCount / denominator) * 100);

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Your progress</p>
          <p className="mt-1 text-2xl font-bold text-foreground">
            {completedCount}{' '}
            <span className="text-base font-medium text-muted-foreground">
              / {denominator} completed
            </span>
          </p>
        </div>
        <p className="text-3xl font-bold text-accent">{completionPercent}%</p>
      </div>

      <div className="mt-4 h-3 overflow-hidden rounded-full bg-muted">
        <div className="flex h-full w-full">
          {STATUS_SEGMENTS.map((segment) => {
            const count = countsByStatus[segment.status] ?? 0;
            if (count === 0) return null;
            const width = (count / denominator) * 100;
            return (
              <div
                key={segment.status}
                className={`h-full ${segment.barClass}`}
                style={{ width: `${width}%` }}
                title={`${segment.label}: ${count}`}
              />
            );
          })}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <StatusChip
          label="All"
          count={denominator}
          active={selectedStatus === 'all'}
          className="border-border bg-muted/50 text-foreground"
          onClick={() => onStatusChange('all')}
        />
        {STATUS_SEGMENTS.map((segment) => {
          const count = countsByStatus[segment.status] ?? 0;
          return (
            <StatusChip
              key={segment.status}
              label={segment.label}
              count={count}
              active={selectedStatus === segment.status}
              className={segment.chipClass}
              onClick={() => onStatusChange(segment.status)}
            />
          );
        })}
      </div>
    </div>
  );
}

function StatusChip({
  label,
  count,
  active,
  className,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  className: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${className} ${
        active ? 'ring-2 ring-accent ring-offset-2 ring-offset-card' : 'opacity-90 hover:opacity-100'
      }`}
    >
      <span>{label}</span>
      <span className="rounded-full bg-black/10 px-1.5 py-0.5 text-[10px] dark:bg-white/10">
        {count}
      </span>
    </button>
  );
}
