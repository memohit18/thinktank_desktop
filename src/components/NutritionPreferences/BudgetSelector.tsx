'use client';

import SegmentedControl from '@/components/ui/SegmentedControl';
import type { NutritionBudget } from '@/types/nutrition-preferences';

const BUDGET_OPTIONS: {
  value: NutritionBudget;
  label: string;
  hint: string;
}[] = [
  {
    value: 'budget',
    label: 'Budget',
    hint: 'Affordable staples and cost-conscious choices.',
  },
  {
    value: 'moderate',
    label: 'Moderate',
    hint: 'Balanced variety with sensible pricing.',
  },
  {
    value: 'premium',
    label: 'Premium',
    hint: 'Higher flexibility for premium ingredients.',
  },
];

type BudgetSelectorProps = {
  value?: NutritionBudget;
  onChange: (value: NutritionBudget) => void;
  error?: string;
};

export default function BudgetSelector({
  value,
  onChange,
  error,
}: BudgetSelectorProps) {
  return (
    <div>
      <p className="text-sm font-semibold text-foreground">Budget</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Choose the budget range you want meal suggestions to follow.
      </p>
      <div className="mt-4">
        <SegmentedControl
          value={value}
          options={BUDGET_OPTIONS}
          layout="cards"
          onChange={onChange}
        />
      </div>
      {error ? <p className="mt-3 text-xs text-red-500">{error}</p> : null}
    </div>
  );
}
