'use client';

import {
  MEAL_DAY_FULL_LABELS,
  MEAL_DAY_LABELS,
  MEAL_DAY_ORDER,
  MEAL_TYPE_LABELS,
} from '@/lib/fitness/meals/constants';
import { getMealDayKeyFromDate } from '@/lib/fitness/meals/mealResponse';
import type { ActiveMealPlan, MealDayKey } from '@/lib/fitness/meals/types';

type WeeklyCalendarProps = {
  schedule?: ActiveMealPlan | null;
  selectedDay?: MealDayKey;
  onSelectDay?: (day: MealDayKey) => void;
  highlightDate?: string | null;
};

export default function WeeklyCalendar({
  schedule,
  selectedDay,
  onSelectDay,
  highlightDate,
}: WeeklyCalendarProps) {
  const highlightDay = getMealDayKeyFromDate(highlightDate);
  const activeDay = selectedDay ?? highlightDay ?? 'monday';

  const days =
    schedule?.days?.length
      ? MEAL_DAY_ORDER.map((day) => {
          const entry = schedule.days.find((item) => item.day === day);
          return {
            day,
            meals: entry?.meals ?? [],
            date: entry?.date ?? null,
          };
        })
      : MEAL_DAY_ORDER.map((day) => ({ day, meals: [], date: null }));

  const selected = days.find((entry) => entry.day === activeDay) ?? days[0];

  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-foreground">Weekly View</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Browse meals across Monday through Sunday.
        </p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {days.map((entry) => {
          const isActive = entry.day === activeDay;
          const isToday = entry.day === highlightDay;

          return (
            <button
              key={entry.day}
              type="button"
              onClick={() => onSelectDay?.(entry.day)}
              className={`inline-flex min-w-[4.5rem] shrink-0 flex-col items-center rounded-xl border px-3 py-2 transition-colors ${
                isActive
                  ? 'border-accent bg-accent text-accent-foreground shadow-[0_0_16px_var(--neon-glow)] dark:text-black'
                  : 'border-border bg-muted/20 text-muted-foreground hover:border-accent/40 hover:text-foreground'
              }`}
            >
              <span className="text-xs font-semibold">
                {MEAL_DAY_LABELS[entry.day]}
              </span>
              <span className="mt-1 text-[10px] opacity-80">
                {entry.meals.length} meals
              </span>
              {isToday ? (
                <span className="mt-1 text-[9px] font-semibold uppercase">
                  Today
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      <div className="mt-4 space-y-2">
        <p className="text-xs font-semibold text-foreground">
          {MEAL_DAY_FULL_LABELS[selected.day]}
        </p>
        {selected.meals.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-6 text-center text-sm text-muted-foreground">
            No meals scheduled for {MEAL_DAY_FULL_LABELS[selected.day]}.
          </div>
        ) : (
          <ul className="space-y-2">
            {selected.meals.map((meal) => (
              <li
                key={meal.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/20 px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {meal.name}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {MEAL_TYPE_LABELS[meal.type]}
                    {meal.scheduledTime ? ` · ${meal.scheduledTime}` : ''}
                  </p>
                </div>
                <p className="shrink-0 text-xs font-semibold text-muted-foreground">
                  {Math.round(meal.calories)} kcal
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
