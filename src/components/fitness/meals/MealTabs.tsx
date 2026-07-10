'use client';

import {
  MEAL_TYPE_LABELS,
  MEAL_TYPE_ORDER,
} from '@/lib/fitness/meals/constants';
import type { MealType } from '@/lib/fitness/meals/types';

type MealTabsProps = {
  activeType: MealType | 'all';
  onChange: (type: MealType | 'all') => void;
  counts?: Partial<Record<MealType | 'all', number>>;
};

export default function MealTabs({
  activeType,
  onChange,
  counts,
}: MealTabsProps) {
  const tabs: Array<MealType | 'all'> = ['all', ...MEAL_TYPE_ORDER];

  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {tabs.map((type) => {
        const isActive = type === activeType;
        const label = type === 'all' ? 'All' : MEAL_TYPE_LABELS[type];
        const count = counts?.[type];

        return (
          <button
            key={type}
            type="button"
            onClick={() => onChange(type)}
            className={`inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
              isActive
                ? 'border-accent bg-accent text-accent-foreground shadow-[0_0_16px_var(--neon-glow)] dark:text-black'
                : 'border-border bg-muted/30 text-muted-foreground hover:border-accent/40 hover:text-foreground'
            }`}
          >
            {label}
            {typeof count === 'number' ? (
              <span className="text-[10px] opacity-80">{count}</span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
