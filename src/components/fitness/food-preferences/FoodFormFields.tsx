'use client';

import type { FoodCategory } from '@/lib/fitness/food/types';
import { FormField, FormSelect } from '@/components/fitness/setup/FormFields';

const DIET_TYPE_OPTIONS = [
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'veg', label: 'Veg' },
  { value: 'eggetarian', label: 'Eggetarian' },
  { value: 'non_vegetarian', label: 'Non-vegetarian' },
  { value: 'vegan', label: 'Vegan' },
];

type FoodFormFieldsProps = {
  values: {
    name: string;
    category: string;
    dietType: string;
    servingSize: string;
    calories: string;
    protein: string;
    carbs: string;
    fats: string;
  };
  errors: Partial<
    Record<
      'name' | 'category' | 'dietType' | 'servingSize' | 'calories' | 'protein' | 'carbs' | 'fats',
      string
    >
  >;
  categories: FoodCategory[];
  allowNoCategory?: boolean;
  onChange: <K extends keyof FoodFormFieldsProps['values']>(
    field: K,
    value: FoodFormFieldsProps['values'][K],
  ) => void;
};

export default function FoodFormFields({
  values,
  errors,
  categories,
  allowNoCategory = false,
  onChange,
}: FoodFormFieldsProps) {
  const categoryOptions = [
    ...(allowNoCategory ? [{ value: '', label: 'No category' }] : []),
    ...categories.map((category) => ({
      value: category.id,
      label: category.label ?? category.name,
    })),
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <FormField
          label="Food name"
          value={values.name}
          onChange={(event) => onChange('name', event.target.value)}
          placeholder="e.g. Mom's Paneer Curry"
          error={errors.name}
        />
      </div>

      <FormSelect
        label="Category"
        value={values.category}
        onChange={(value) => onChange('category', value)}
        options={categoryOptions}
        error={errors.category}
      />

      <FormSelect
        label="Diet type"
        value={values.dietType}
        onChange={(value) => onChange('dietType', value)}
        options={DIET_TYPE_OPTIONS}
        error={errors.dietType}
      />

      <FormField
        label="Serving size"
        value={values.servingSize}
        onChange={(event) => onChange('servingSize', event.target.value)}
        placeholder="e.g. 1 bowl"
        error={errors.servingSize}
      />

      <FormField
        label="Calories"
        type="number"
        min={0}
        value={values.calories}
        onChange={(event) => onChange('calories', event.target.value)}
        placeholder="320"
        error={errors.calories}
      />

      <FormField
        label="Protein (g)"
        type="number"
        min={0}
        step="0.1"
        value={values.protein}
        onChange={(event) => onChange('protein', event.target.value)}
        placeholder="18"
        error={errors.protein}
      />

      <FormField
        label="Carbs (g)"
        type="number"
        min={0}
        step="0.1"
        value={values.carbs}
        onChange={(event) => onChange('carbs', event.target.value)}
        placeholder="12"
        error={errors.carbs}
      />

      <FormField
        label="Fats (g)"
        type="number"
        min={0}
        step="0.1"
        value={values.fats}
        onChange={(event) => onChange('fats', event.target.value)}
        placeholder="22"
        error={errors.fats}
      />
    </div>
  );
}
