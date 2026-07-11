'use client';

import Link from 'next/link';
import type { DashboardMealProgress } from '@/lib/fitness/dashboard/types';

type MealProgressProps = {
  meals: DashboardMealProgress;
};

export default function MealProgress({ meals }: MealProgressProps) {
  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Meals Progress
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {meals.assigned
              ? `${meals.completed} of ${meals.assigned} meals logged`
              : 'No meals assigned yet'}
            {meals.score != null ? ` · score ${Math.round(meals.score)}` : ''}
          </p>
        </div>
        <Link
          href="/fitness/meals"
          className="text-xs font-semibold text-accent hover:underline"
        >
          Open
        </Link>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-accent transition-all"
          style={{ width: `${meals.percent}%` }}
        />
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        <Stat label="Done" value={`${meals.completed}`} />
        <Stat label="Assigned" value={`${meals.assigned || '—'}`} />
        <Stat label="Skipped" value={`${meals.skipped}`} />
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-muted/20 px-3 py-2">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}
