'use client';

import { Loader2, Trash2, X } from 'lucide-react';
import { formatGoalLabel } from '@/lib/fitness/diet/dietResponse';
import type { DietHistoryItem } from '@/lib/fitness/diet/types';

type HistoryDrawerProps = {
  open: boolean;
  items: DietHistoryItem[];
  activeId?: string;
  isLoading?: boolean;
  isActivating?: boolean;
  isDeleting?: boolean;
  onClose: () => void;
  onActivate?: (dietPlanId: string) => void;
  onDelete?: (dietPlanId: string) => void;
};

export default function HistoryDrawer({
  open,
  items,
  activeId,
  isLoading = false,
  isActivating = false,
  isDeleting = false,
  onClose,
  onActivate,
  onDelete,
}: HistoryDrawerProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm">
      <button
        type="button"
        aria-label="Close history drawer backdrop"
        className="absolute inset-0"
        onClick={onClose}
      />
      <aside className="relative z-10 flex h-full w-full max-w-md flex-col border-l border-border bg-background shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-foreground">Diet History</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Activate a previous version or remove archived plans
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          {isLoading ? (
            <div className="space-y-3 animate-pulse">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-24 rounded-xl bg-muted" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="flex min-h-40 items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 px-4 text-center text-sm text-muted-foreground">
              No diet history available.
            </div>
          ) : (
            <ul className="space-y-3">
              {items.map((item) => {
                const isActive = item.id === activeId;

                return (
                  <li
                    key={item.id}
                    className={`rounded-xl border px-4 py-3 ${
                      isActive
                        ? 'border-accent/40 bg-accent/10'
                        : 'border-border bg-card'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold capitalize text-foreground">
                          {formatGoalLabel(item.goal)}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {item.dailyCalories > 0
                            ? `${Math.round(item.dailyCalories).toLocaleString()} kcal · `
                            : ''}
                          {item.durationWeeks} weeks
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {item.version ? (
                          <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                            v{item.version}
                          </span>
                        ) : null}
                        <span className="text-[10px] font-semibold uppercase text-muted-foreground">
                          {isActive ? 'Active' : item.status}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {!isActive && onActivate ? (
                        <button
                          type="button"
                          disabled={isActivating}
                          onClick={() => onActivate(item.id)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-accent/30 bg-accent/10 px-3 py-1.5 text-xs font-semibold text-accent disabled:opacity-60"
                        >
                          {isActivating ? (
                            <Loader2 className="size-3 animate-spin" />
                          ) : null}
                          Activate
                        </button>
                      ) : null}
                      {onDelete ? (
                        <button
                          type="button"
                          disabled={isDeleting}
                          onClick={() => onDelete(item.id)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-500 disabled:opacity-60"
                        >
                          {isDeleting ? (
                            <Loader2 className="size-3 animate-spin" />
                          ) : (
                            <Trash2 className="size-3" />
                          )}
                          Delete
                        </button>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </aside>
    </div>
  );
}
