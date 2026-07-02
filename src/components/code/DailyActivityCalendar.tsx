'use client';

import { useMemo, useState } from 'react';
import { useGetDailyActivityQuery } from '@/lib/services/userProgressApi';

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getDayIndicator(day: { date: string; attempted: boolean }) {
  if (day.attempted) return 'fire';

  const todayKey = toDateKey(new Date());
  if (day.date < todayKey) return 'dead';

  return null;
}

function getDayTitle(day: { date: string; attempted: boolean }) {
  const indicator = getDayIndicator(day);
  if (indicator === 'fire') return `${day.date}: practiced`;
  if (indicator === 'dead') return `${day.date}: missed`;
  return `${day.date}: no activity yet`;
}

function formatMonthKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

function shiftMonthKey(monthKey: string, delta: number) {
  const [year, month] = monthKey.split('-').map(Number);
  const date = new Date(year, month - 1 + delta, 1);
  return formatMonthKey(date);
}

function formatMonthLabel(monthKey: string) {
  const [year, month] = monthKey.split('-').map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  });
}

export default function DailyActivityCalendar() {
  const [monthKey, setMonthKey] = useState(() => formatMonthKey(new Date()));
  const { data, isLoading, isError } = useGetDailyActivityQuery({ month: monthKey });

  const calendarCells = useMemo(() => {
    if (!data) return [];

    const padding = new Date(data.year, data.month - 1, 1).getDay();
    return [...Array.from({ length: padding }, () => null), ...data.days];
  }, [data]);

  return (
    <div className="flex h-full flex-col justify-center rounded-xl border border-border bg-card p-2.5 shadow-sm">
      <div className="flex shrink-0 items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-bold leading-tight text-foreground">
            {formatMonthLabel(monthKey)}
          </p>
          <p className="text-[9px] leading-tight text-muted-foreground">
            Daily Activity
            {data ? ` • ${data.summary.activeDays} active days` : ''}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          <button
            type="button"
            onClick={() => setMonthKey((current) => shiftMonthKey(current, -1))}
            aria-label="Previous month"
            className="flex size-5 items-center justify-center rounded border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ChevronLeftIcon className="size-2.5" />
          </button>
          <button
            type="button"
            onClick={() => setMonthKey(formatMonthKey(new Date()))}
            className="rounded border border-border px-1 py-px text-[9px] font-semibold text-foreground transition-colors hover:bg-muted"
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => setMonthKey((current) => shiftMonthKey(current, 1))}
            aria-label="Next month"
            className="flex size-5 items-center justify-center rounded border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ChevronRightIcon className="size-2.5" />
          </button>
        </div>
      </div>

      {isLoading ? (
        <p className="mt-2 text-[10px] text-muted-foreground">Loading activity...</p>
      ) : null}

      {isError ? (
        <p className="mt-2 text-[10px] text-red-500">Failed to load daily activity.</p>
      ) : null}

      {!isLoading && !isError && data ? (
        <div className="mt-1 grid grid-cols-7 gap-px">
          {WEEKDAY_LABELS.map((label) => (
            <div
              key={label}
              className="text-center text-[8px] font-semibold uppercase tracking-wide text-muted-foreground"
            >
              {label}
            </div>
          ))}
          {calendarCells.map((day, index) => {
            if (!day) {
              return <div key={`pad-${index}`} className="h-6" />;
            }

            const dayNumber = Number(day.date.split('-')[2]);
            const indicator = getDayIndicator(day);

            return (
              <div
                key={day.date}
                title={getDayTitle(day)}
                className={`relative flex h-6 items-center justify-center rounded-sm ${
                  indicator === 'fire'
                    ? 'bg-orange-500/10'
                    : indicator === 'dead'
                      ? 'bg-muted/60'
                      : ''
                }`}
              >
                {indicator ? (
                  <>
                    <span className="text-sm leading-none" aria-hidden>
                      {indicator === 'fire' ? '🔥' : '💀'}
                    </span>
                    <span className="absolute right-0.5 top-0 text-[7px] font-semibold leading-none text-foreground/75">
                      {dayNumber}
                    </span>
                  </>
                ) : (
                  <span className="text-[9px] leading-none text-muted-foreground">
                    {dayNumber}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
