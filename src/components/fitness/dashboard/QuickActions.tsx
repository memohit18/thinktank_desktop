'use client';

import Link from 'next/link';
import {
  Activity,
  CalendarDays,
  Droplets,
  LineChart,
  Salad,
  Sparkles,
} from 'lucide-react';

const ACTIONS = [
  {
    href: '/fitness/meals',
    label: 'Log meals',
    icon: CalendarDays,
  },
  {
    href: '/fitness/workout',
    label: 'Start workout',
    icon: Activity,
  },
  {
    href: '/fitness/diet',
    label: 'View diet',
    icon: Salad,
  },
  {
    href: '/fitness/progress',
    label: 'Progress',
    icon: LineChart,
  },
  {
    href: '/fitness/transformation',
    label: 'Transformation',
    icon: Sparkles,
  },
  {
    href: '/fitness/meals',
    label: 'Hydration',
    icon: Droplets,
  },
] as const;

export default function QuickActions() {
  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-foreground">Quick Actions</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Jump into the next execution step.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={`${action.href}-${action.label}`}
              href={action.href}
              className="flex items-center gap-2 rounded-xl border border-border bg-muted/20 px-3 py-2.5 text-sm font-medium text-foreground transition hover:bg-muted/40"
            >
              <Icon className="size-4 text-accent" />
              {action.label}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
