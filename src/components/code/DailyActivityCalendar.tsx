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

type DailyActivityCalendarProps = {
  /** Compact = small widget; dashboard = larger full card. */
  variant?: 'compact' | 'dashboard';
};

export default function DailyActivityCalendar({
  variant = 'compact',
}: DailyActivityCalendarProps) {
  const [monthKey, setMonthKey] = useState(() => formatMonthKey(new Date()));
  const { data, isLoading, isError } = useGetDailyActivityQuery({ month: monthKey });
  const isDashboard = variant === 'dashboard';

  const calendarCells = useMemo(() => {
    if (!data) return [];

    const padding = new Date(data.year, data.month - 1, 1).getDay();
    return [...Array.from({ length: padding }, () => null), ...data.days];
  }, [data]);

  return (
    <div
      className={`flex h-full flex-col rounded-2xl border border-border bg-card shadow-sm ${
        isDashboard ? 'p-5 sm:p-6' : 'justify-center p-2.5'
      }`}
    >
      <div className="flex shrink-0 items-center justify-between gap-2">
        <div className="min-w-0">
          <p
            className={`font-bold leading-tight text-foreground ${
              isDashboard ? 'text-base sm:text-lg' : 'text-xs'
            }`}
          >
            {formatMonthLabel(monthKey)}
          </p>
          <p
            className={`leading-tight text-muted-foreground ${
              isDashboard ? 'mt-0.5 text-xs sm:text-sm' : 'text-[9px]'
            }`}
          >
            Daily Activity
            {data ? ` • ${data.summary.activeDays} active days` : ''}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          <button
            type="button"
            onClick={() => setMonthKey((current) => shiftMonthKey(current, -1))}
            aria-label="Previous month"
            className={`flex items-center justify-center rounded border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground ${
              isDashboard ? 'size-8' : 'size-5'
            }`}
          >
            <ChevronLeftIcon className={isDashboard ? 'size-4' : 'size-2.5'} />
          </button>
          <button
            type="button"
            onClick={() => setMonthKey(formatMonthKey(new Date()))}
            className={`rounded border border-border font-semibold text-foreground transition-colors hover:bg-muted ${
              isDashboard
                ? 'px-2.5 py-1.5 text-xs'
                : 'px-1 py-px text-[9px]'
            }`}
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => setMonthKey((current) => shiftMonthKey(current, 1))}
            aria-label="Next month"
            className={`flex items-center justify-center rounded border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground ${
              isDashboard ? 'size-8' : 'size-5'
            }`}
          >
            <ChevronRightIcon className={isDashboard ? 'size-4' : 'size-2.5'} />
          </button>
        </div>
      </div>

      {isLoading ? (
        <p
          className={`mt-3 text-muted-foreground ${
            isDashboard ? 'text-sm' : 'text-[10px]'
          }`}
        >
          Loading activity...
        </p>
      ) : null}

      {isError ? (
        <p
          className={`mt-3 text-red-500 ${
            isDashboard ? 'text-sm' : 'text-[10px]'
          }`}
        >
          Failed to load daily activity.
        </p>
      ) : null}

      {!isLoading && !isError && data ? (
        <div
          className={`mt-3 grid grid-cols-7 ${
            isDashboard ? 'gap-1.5 sm:gap-2' : 'gap-px'
          }`}
        >
          {WEEKDAY_LABELS.map((label) => (
            <div
              key={label}
              className={`text-center font-semibold uppercase tracking-wide text-muted-foreground ${
                isDashboard ? 'pb-1 text-[10px] sm:text-xs' : 'text-[8px]'
              }`}
            >
              {label}
            </div>
          ))}
          {calendarCells.map((day, index) => {
            if (!day) {
              return (
                <div
                  key={`pad-${index}`}
                  className={isDashboard ? 'aspect-square min-h-10' : 'h-6'}
                />
              );
            }

            const dayNumber = Number(day.date.split('-')[2]);
            const indicator = getDayIndicator(day);

            return (
              <div
                key={day.date}
                title={getDayTitle(day)}
                className={`relative flex items-center justify-center rounded-md ${
                  isDashboard ? 'aspect-square min-h-10 sm:min-h-12' : 'h-6 rounded-sm'
                } ${
                  indicator === 'fire'
                    ? 'bg-orange-500/10'
                    : indicator === 'dead'
                      ? 'bg-muted/60'
                      : ''
                }`}
              >
                {indicator ? (
                  <>
                    <span
                      className={`leading-none ${
                        isDashboard ? 'text-lg sm:text-xl' : 'text-sm'
                      }`}
                      aria-hidden
                    >
                      {indicator === 'fire' ? '🔥' : '💀'}
                    </span>
                    <span
                      className={`absolute font-semibold leading-none text-foreground/75 ${
                        isDashboard
                          ? 'right-1 top-1 text-[10px] sm:text-xs'
                          : 'right-0.5 top-0 text-[7px]'
                      }`}
                    >
                      {dayNumber}
                    </span>
                  </>
                ) : (
                  <span
                    className={`leading-none text-muted-foreground ${
                      isDashboard ? 'text-sm' : 'text-[9px]'
                    }`}
                  >
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
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
