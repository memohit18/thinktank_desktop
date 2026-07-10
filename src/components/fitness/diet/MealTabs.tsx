'use client';

import {
  DIET_DAY_LABELS,
  DIET_DAY_ORDER,
} from '@/lib/fitness/diet/constants';
import type { DietDayKey } from '@/lib/fitness/diet/types';

type MealTabsProps = {
  activeDay: DietDayKey;
  onChange: (day: DietDayKey) => void;
  availableDays?: DietDayKey[];
};

export default function MealTabs({
  activeDay,
  onChange,
  availableDays = DIET_DAY_ORDER,
}: MealTabsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {DIET_DAY_ORDER.map((day) => {
        const isActive = day === activeDay;
        const isAvailable = availableDays.includes(day);

        return (
          <button
            key={day}
            type="button"
            disabled={!isAvailable}
            onClick={() => onChange(day)}
            className={`inline-flex shrink-0 items-center justify-center rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
              isActive
                ? 'border-accent bg-accent text-accent-foreground shadow-[0_0_16px_var(--neon-glow)] dark:text-black'
                : isAvailable
                  ? 'border-border bg-muted/30 text-muted-foreground hover:border-accent/40 hover:text-foreground'
                  : 'cursor-not-allowed border-border/50 bg-muted/10 text-muted-foreground/40'
            }`}
          >
            {DIET_DAY_LABELS[day]}
          </button>
        );
      })}
    </div>
  );
}
