'use client';

import Link from 'next/link';
import { CheckCircle2, Circle } from 'lucide-react';
import type { DashboardTask } from '@/lib/fitness/dashboard/types';

type TodaysTasksProps = {
  tasks: DashboardTask[];
};

export default function TodaysTasks({ tasks }: TodaysTasksProps) {
  const doneCount = tasks.filter((task) => task.done).length;

  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-foreground">
          Today&apos;s Tasks
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          {tasks.length
            ? `${doneCount}/${tasks.length} complete`
            : 'No tasks yet — generate a plan to get started.'}
        </p>
      </div>
      <ul className="space-y-2">
        {tasks.map((task) => (
          <li key={task.id}>
            <Link
              href={task.href}
              className="flex items-center gap-3 rounded-xl border border-border bg-muted/20 px-3 py-2.5 transition hover:bg-muted/40"
            >
              {task.done ? (
                <CheckCircle2 className="size-4 shrink-0 text-accent" />
              ) : (
                <Circle className="size-4 shrink-0 text-muted-foreground" />
              )}
              <span
                className={`text-sm ${
                  task.done
                    ? 'text-muted-foreground line-through'
                    : 'text-foreground'
                }`}
              >
                {task.label}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
