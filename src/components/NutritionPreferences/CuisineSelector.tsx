'use client';

import Select from '@/components/ui/Select';
import type { PreferredCuisine } from '@/types/nutrition-preferences';

const CUISINE_OPTIONS = [
  { value: 'indian', label: 'Indian' },
  { value: 'north_indian', label: 'North Indian' },
  { value: 'south_indian', label: 'South Indian' },
  { value: 'mixed', label: 'Mixed' },
  { value: 'international', label: 'International' },
] as const;

type CuisineSelectorProps = {
  value?: PreferredCuisine;
  onChange: (value: PreferredCuisine) => void;
  error?: string;
};

export default function CuisineSelector({
  value,
  onChange,
  error,
}: CuisineSelectorProps) {
  return (
    <div>
      <label
        htmlFor="nutrition-preferred-cuisine"
        className="text-sm font-semibold text-foreground"
      >
        Preferred cuisine
      </label>
      <p className="mt-1 text-sm text-muted-foreground">
        We will prioritize meal ideas that match your usual food style.
      </p>
      <Select
        id="nutrition-preferred-cuisine"
        value={value ?? ''}
        onChange={(nextValue) => {
          if (!nextValue) return;
          onChange(nextValue as PreferredCuisine);
        }}
        options={[
          { value: '', label: 'Select cuisine' },
          ...CUISINE_OPTIONS.map((option) => ({
            value: option.value,
            label: option.label,
          })),
        ]}
        className="mt-4 w-full"
      />
      {error ? <p className="mt-3 text-xs text-red-500">{error}</p> : null}
    </div>
  );
}
