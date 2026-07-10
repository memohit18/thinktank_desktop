'use client';

import SegmentedControl from '@/components/ui/SegmentedControl';
import type { MealTimingPreference } from '@/types/nutrition-preferences';

const MEAL_TIMING_OPTIONS: {
  value: MealTimingPreference;
  label: string;
  hint: string;
}[] = [
  {
    value: 'early',
    label: 'Early',
    hint: 'Front-load meals earlier in the day.',
  },
  {
    value: 'flexible',
    label: 'Flexible',
    hint: 'Keep timing adaptable around your schedule.',
  },
  {
    value: 'late',
    label: 'Late',
    hint: 'Shift meals later to fit your routine.',
  },
];

type MealTimingSelectorProps = {
  value?: MealTimingPreference;
  onChange: (value: MealTimingPreference) => void;
  error?: string;
};

export default function MealTimingSelector({
  value,
  onChange,
  error,
}: MealTimingSelectorProps) {
  return (
    <div>
      <p className="text-sm font-semibold text-foreground">
        Preferred meal timing
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        This helps us schedule suggestions around when you usually eat.
      </p>
      <div className="mt-4">
        <SegmentedControl
          value={value}
          options={MEAL_TIMING_OPTIONS}
          layout="cards"
          onChange={onChange}
        />
      </div>
      {error ? <p className="mt-3 text-xs text-red-500">{error}</p> : null}
    </div>
  );
}
