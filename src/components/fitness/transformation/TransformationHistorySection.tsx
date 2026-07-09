'use client';

import { History } from 'lucide-react';
import type {
  TransformationHistoryItem,
  TransformationHistoryMeta,
} from '@/lib/fitness/transformation/types';

type TransformationHistorySectionProps = {
  items: TransformationHistoryItem[];
  meta?: TransformationHistoryMeta;
  activeId?: string;
  isLoading?: boolean;
};

function formatDate(value?: string) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function statusTone(status: string) {
  switch (status.toUpperCase()) {
    case 'ACTIVE':
      return 'border-accent/30 bg-accent/10 text-accent';
    case 'ARCHIVED':
      return 'border-border bg-muted/40 text-muted-foreground';
    case 'COMPLETED':
      return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300';
    default:
      return 'border-border bg-muted/30 text-muted-foreground';
  }
}

export default function TransformationHistorySection({
  items,
  meta,
  activeId,
  isLoading = false,
}: TransformationHistorySectionProps) {
  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
            <History className="size-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Transformation history
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Past plans are archived when you regenerate a new active plan.
              {meta?.total ? ` ${meta.total} total.` : ''}
            </p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-20 animate-pulse rounded-xl border border-border bg-muted/30"
            />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-8 text-center text-sm text-muted-foreground">
          No previous transformation plans yet.
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const isActive = item.id === activeId || item.status === 'ACTIVE';
            return (
              <article
                key={item.id}
                className={`rounded-xl border p-4 transition-colors ${
                  isActive
                    ? 'border-accent/30 bg-accent/5'
                    : 'border-border bg-muted/10'
                }`}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-foreground">
                        {item.currentWeightKg} kg → {item.targetWeightKg} kg
                      </p>
                      <span
                        className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${statusTone(item.status)}`}
                      >
                        {item.status}
                      </span>
                      {isActive ? (
                        <span className="text-[10px] font-medium text-accent">
                          Current dashboard
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {item.targetPhysique ?? 'Transformation plan'} ·{' '}
                      {item.estimatedWeeks} weeks · {Math.round(item.dailyCalories)}{' '}
                      kcal · {Math.round(item.dailyProtein)}g protein
                    </p>
                  </div>
                  <div className="text-left text-xs text-muted-foreground sm:text-right">
                    <p>Created {formatDate(item.createdAt)}</p>
                    <p>Updated {formatDate(item.updatedAt)}</p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
