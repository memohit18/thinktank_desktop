'use client';

import { useEffect, useState } from 'react';
import { Brain, Check, Circle, Loader2 } from 'lucide-react';

const TASKS = [
  { id: 'metabolic', label: 'Metabolic Profiling', delay: 800 },
  { id: 'macro', label: 'Macro Optimization', delay: 1600 },
  { id: 'hypertrophy', label: 'Hypertrophy Mapping', delay: 2400 },
  { id: 'recovery', label: 'Recovery Scheduling', delay: 3200 },
] as const;

export default function ProcessingStep() {
  const [progress, setProgress] = useState(12);
  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    const progressTimer = window.setInterval(() => {
      setProgress((current) => Math.min(current + 4, 96));
    }, 220);

    const taskTimers = TASKS.map((task, index) =>
      window.setTimeout(() => setCompletedCount(index + 1), task.delay),
    );

    return () => {
      window.clearInterval(progressTimer);
      taskTimers.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center py-10 text-center">
      <div className="relative flex size-28 items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-accent/10 blur-2xl" />
        <div className="relative flex size-24 items-center justify-center rounded-full border border-accent/30 bg-card">
          <div className="flex size-16 items-center justify-center rounded-full bg-accent text-accent-foreground dark:text-black">
            <Brain className="size-8 animate-pulse" />
          </div>
        </div>
        <Loader2 className="absolute -right-1 -top-1 size-6 animate-spin text-accent" />
      </div>

      <h2 className="mt-8 text-2xl font-bold text-foreground">
        Architecting Your Evolution
      </h2>
      <p className="mt-3 max-w-md text-sm text-muted-foreground">
        Our AI is processing millions of data points to create your bespoke
        performance protocol.
      </p>

      <div className="mt-8 w-full rounded-2xl border border-border bg-card p-5 text-left">
        <div className="mb-3 flex items-center justify-between text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          <span>Structuring workout splits...</span>
          <span>{progress}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-accent transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {TASKS.map((task, index) => {
            const isDone = index < completedCount;

            return (
              <div
                key={task.id}
                className="flex items-center gap-2 text-sm"
              >
                {isDone ? (
                  <Check className="size-4 text-accent" />
                ) : (
                  <Circle className="size-4 text-muted-foreground/50" />
                )}
                <span
                  className={
                    isDone ? 'font-medium text-accent' : 'text-muted-foreground'
                  }
                >
                  {task.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <p className="mt-6 text-xs italic text-muted-foreground">
        Synthesizing structural insights...
      </p>
    </div>
  );
}
