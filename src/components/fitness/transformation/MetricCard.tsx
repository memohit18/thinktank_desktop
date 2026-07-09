import type { LucideIcon } from 'lucide-react';

type MetricCardProps = {
  label: string;
  value: string;
  description: string;
  icon: LucideIcon;
  badge?: {
    label: string;
    tone: 'success' | 'warning' | 'danger';
  };
};

const BADGE_STYLES = {
  success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  warning: 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400',
  danger: 'border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400',
} as const;

export default function MetricCard({
  label,
  value,
  description,
  icon: Icon,
  badge,
}: MetricCardProps) {
  return (
    <article className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
          <Icon className="size-5" />
        </div>
        {badge ? (
          <span
            className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${BADGE_STYLES[badge.tone]}`}
          >
            {badge.label}
          </span>
        ) : null}
      </div>

      <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-3xl font-bold text-foreground">{value}</p>
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{description}</p>
    </article>
  );
}
