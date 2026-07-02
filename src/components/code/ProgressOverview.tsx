'use client';

import type { UserProgressStatus } from '@/lib/code/userProgressTypes';

const FILTER_CHIPS: {
  status: UserProgressStatus | 'all';
  label: string;
}[] = [
  { status: 'all', label: 'All' },
  { status: 'Mastered', label: 'Mastered' },
  { status: 'Solved', label: 'Solved' },
  { status: 'Attempted', label: 'Attempted' },
];

const BAR_SEGMENTS: {
  status: UserProgressStatus;
  barClass: string;
}[] = [
  { status: 'Mastered', barClass: 'bg-amber-400' },
  { status: 'Revised', barClass: 'bg-violet-400' },
  { status: 'Solved', barClass: 'bg-accent' },
  { status: 'Attempted', barClass: 'bg-sky-400' },
];

type ProgressOverviewProps = {
  totalProblems: number;
  solvedCount: number;
  countsByStatus: Partial<Record<UserProgressStatus, number>>;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
};

export default function ProgressOverview({
  totalProblems,
  solvedCount,
  countsByStatus,
  selectedStatus,
  onStatusChange,
}: ProgressOverviewProps) {
  const trackedTotal = Object.values(countsByStatus).reduce(
    (sum, count) => sum + (count ?? 0),
    0,
  );
  const denominator = Math.max(totalProblems, trackedTotal, 1);

  const completedCount =
    (countsByStatus.Solved ?? 0) +
    (countsByStatus.Revised ?? 0) +
    (countsByStatus.Mastered ?? 0);
  const completionPercent = Math.round((completedCount / denominator) * 100);

  return (
    <div className="flex h-full flex-col justify-center gap-2.5 rounded-xl border border-border bg-card p-2.5 shadow-sm">
      <div className="grid grid-cols-2 gap-2">
        <MiniStatCard
          label="Solved Problems"
          value={String(solvedCount)}
          icon={<CheckIcon />}
          iconClassName="text-accent"
        />
        <MiniStatCard
          label="Total Problems"
          value={String(totalProblems)}
          icon={<ChartIcon />}
          iconClassName="text-sky-500"
        />
      </div>

      <div>
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-semibold text-foreground">Overall Progress</p>
          <p className="text-sm font-bold text-accent">{completionPercent}%</p>
        </div>

        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
          <div className="flex h-full w-full">
            {BAR_SEGMENTS.map((segment) => {
              const count = countsByStatus[segment.status] ?? 0;
              if (count === 0) return null;
              return (
                <div
                  key={segment.status}
                  className={`h-full ${segment.barClass}`}
                  style={{ width: `${(count / denominator) * 100}%` }}
                />
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {FILTER_CHIPS.map((chip) => {
          const count =
            chip.status === 'all'
              ? denominator
              : (countsByStatus[chip.status] ?? 0);
          const isActive =
            chip.status === 'all'
              ? selectedStatus === 'all'
              : selectedStatus === chip.status;

          return (
            <button
              key={chip.status}
              type="button"
              onClick={() => onStatusChange(chip.status)}
              className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold transition-colors ${
                isActive
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-border bg-muted/40 text-muted-foreground hover:bg-muted'
              }`}
            >
              <span>{chip.label}</span>
              <span
                className={`rounded-full px-1 py-px text-[9px] ${
                  isActive ? 'bg-background/20' : 'bg-black/5 dark:bg-white/10'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MiniStatCard({
  label,
  value,
  icon,
  iconClassName,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  iconClassName?: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-muted/20 px-2 py-1.5">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[10px] font-medium text-muted-foreground">{label}</p>
          <p className="text-base font-bold leading-tight text-foreground">{value}</p>
        </div>
        <div
          className={`shrink-0 rounded-md bg-muted p-1.5 ${iconClassName ?? 'text-muted-foreground'}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-3.5">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-3.5">
      <path d="M3 3v18h18" />
      <path d="M7 16V9" />
      <path d="M12 16V5" />
      <path d="M17 16v-4" />
    </svg>
  );
}
