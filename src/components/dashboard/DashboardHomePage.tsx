'use client';

import DailyActivityCalendar from '@/components/code/DailyActivityCalendar';

export default function DashboardHomePage() {
  return (
    <main className="flex-1 overflow-y-auto p-6">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-accent">
            Dashboard
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">
            Welcome to ThinkTank
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
            Track your daily coding practice and keep your streak going.
          </p>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="min-h-[220px]">
            <DailyActivityCalendar variant="compact" />
          </div>
        </section>
      </div>
    </main>
  );
}
