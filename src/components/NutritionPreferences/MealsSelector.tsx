'use client';

import SegmentedControl from '@/components/ui/SegmentedControl';
import type { MealsPerDay } from '@/types/nutrition-preferences';

const MEAL_OPTIONS: { value: MealsPerDay; label: string }[] = [
  { value: 3, label: '3' },
  { value: 4, label: '4' },
  { value: 5, label: '5' },
  { value: 6, label: '6' },
];

type MealsSelectorProps = {
  value?: MealsPerDay;
  onChange: (value: MealsPerDay) => void;
  error?: string;
};

export default function MealsSelector({
  value,
  onChange,
  error,
}: MealsSelectorProps) {
  return (
    <div>
      <p className="text-sm font-semibold text-foreground">Meals per day</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Tell us how many meals you prefer across a normal day.
      </p>
      <div className="mt-4">
        <SegmentedControl
          value={value !== undefined ? String(value) : undefined}
          options={MEAL_OPTIONS.map((option) => ({
            value: String(option.value),
            label: option.label,
          }))}
          onChange={(nextValue) => onChange(Number(nextValue) as MealsPerDay)}
        />
      </div>
      {error ? <p className="mt-3 text-xs text-red-500">{error}</p> : null}
    </div>
  );
}
