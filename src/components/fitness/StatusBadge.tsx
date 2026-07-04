'use client';

type StatusBadgeProps = {
  status: string;
  tone?: 'success' | 'warning' | 'danger' | 'neutral' | 'info';
};

const TONE_CLASSES: Record<NonNullable<StatusBadgeProps['tone']>, string> = {
  success: 'border-accent/30 bg-accent/10 text-accent',
  warning: 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400',
  danger: 'border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400',
  neutral: 'border-border bg-muted/50 text-muted-foreground',
  info: 'border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-400',
};

export default function StatusBadge({ status, tone = 'neutral' }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${TONE_CLASSES[tone]}`}
    >
      {status}
    </span>
  );
}
