'use client';

import { X } from 'lucide-react';
import type { WorkoutHistoryItem } from '@/lib/fitness/workout/types';

type WorkoutHistoryDrawerProps = {
  open: boolean;
  items: WorkoutHistoryItem[];
  isLoading?: boolean;
  onClose: () => void;
};

export default function WorkoutHistoryDrawer({
  open,
  items,
  isLoading = false,
  onClose,
}: WorkoutHistoryDrawerProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
      <button
        type="button"
        aria-label="Close history"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
      />
      <aside className="relative z-10 flex h-full w-full max-w-md flex-col border-l border-border bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Workout History
            </h3>
            <p className="text-xs text-muted-foreground">
              Recent completed sessions
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border p-1.5 text-muted-foreground hover:bg-muted"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="space-y-3">
              <div className="h-20 animate-pulse rounded-xl bg-muted" />
              <div className="h-20 animate-pulse rounded-xl bg-muted" />
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-10 text-center text-sm text-muted-foreground">
              No workout history yet.
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <article
                  key={item.id}
                  className="rounded-xl border border-border bg-muted/20 p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {item.label || 'Workout session'}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {item.date
                          ? new Date(item.date).toLocaleString()
                          : 'Unknown date'}
                        {item.focus ? ` · ${item.focus}` : ''}
                      </p>
                    </div>
                    {item.completionPercent != null ? (
                      <span className="rounded-full border border-border bg-background px-2 py-0.5 text-[10px] font-semibold text-foreground">
                        {Math.round(item.completionPercent)}%
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-[10px] uppercase text-muted-foreground">
                        Duration
                      </p>
                      <p className="text-xs font-semibold text-foreground">
                        {item.durationMinutes ?? '—'}m
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase text-muted-foreground">
                        Volume
                      </p>
                      <p className="text-xs font-semibold text-foreground">
                        {item.volumeKg != null
                          ? `${Math.round(item.volumeKg)}kg`
                          : '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase text-muted-foreground">
                        Cals
                      </p>
                      <p className="text-xs font-semibold text-foreground">
                        {item.caloriesBurned ?? '—'}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
