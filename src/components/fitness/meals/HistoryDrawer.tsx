'use client';

import { Loader2, X } from 'lucide-react';
import type { MealHistoryItem } from '@/lib/fitness/meals/types';

type HistoryDrawerProps = {
  open: boolean;
  items: MealHistoryItem[];
  activeId?: string | null;
  isLoading?: boolean;
  isActivating?: boolean;
  onClose: () => void;
  onActivate?: (mealPlanId: string) => void;
};

function historyTitle(item: MealHistoryItem) {
  if (item.label?.trim()) return item.label.trim();
  if (item.goal?.trim()) {
    return item.goal.replace(/_/g, ' ');
  }
  const planType = item.planType?.trim() || 'weekly';
  const version = item.version ? ` v${item.version}` : '';
  return `${planType.charAt(0).toUpperCase()}${planType.slice(1)} Meal Plan${version}`;
}

function formatHistoryDate(value?: string | null) {
  if (!value) return null;
  return value.slice(0, 10);
}

export default function HistoryDrawer({
  open,
  items,
  activeId,
  isLoading = false,
  isActivating = false,
  onClose,
  onActivate,
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
            <h2 className="text-base font-semibold text-foreground">
              Meal Plan History
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Activate a previous meal plan
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
              No previous meal plans available.
            </div>
          ) : (
            <ul className="space-y-3">
              {items.map((item) => {
                const isActive =
                  item.id === activeId ||
                  item.status.toLowerCase() === 'active';
                const created = formatHistoryDate(item.createdAt);
                const started = formatHistoryDate(item.startDate);

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
                        <p className="text-sm font-semibold text-foreground">
                          {historyTitle(item)}
                        </p>
                        <p className="mt-1 text-xs capitalize text-muted-foreground">
                          {item.planType ?? 'weekly'}
                          {started
                            ? ` · started ${started}`
                            : created
                              ? ` · ${created}`
                              : ''}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {item.version ? (
                          <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                            v{item.version}
                          </span>
                        ) : null}
                        <span
                          className={`text-[10px] font-semibold uppercase ${
                            isActive
                              ? 'text-accent'
                              : 'text-muted-foreground'
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>
                    </div>
                    {!isActive && onActivate ? (
                      <button
                        type="button"
                        disabled={isActivating}
                        onClick={() => onActivate(item.id)}
                        className="mt-3 inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted disabled:opacity-60"
                      >
                        {isActivating ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : null}
                        Activate
                      </button>
                    ) : null}
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
