'use client';

import { useEffect, useState } from 'react';
import { Loader2, Plus, X } from 'lucide-react';
import FoodFormFields from '@/components/fitness/food-preferences/FoodFormFields';
import {
  createFoodSchema,
  EMPTY_FOOD_FORM_VALUES,
  type CreateFoodSchemaValues,
} from '@/lib/fitness/food/schemas/food.schema';
import type { FoodCategory } from '@/lib/fitness/food/types';

type FoodFormModalProps = {
  open: boolean;
  title: string;
  description: string;
  submitLabel: string;
  categories: FoodCategory[];
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (values: CreateFoodSchemaValues) => Promise<boolean>;
};

export default function FoodFormModal({
  open,
  title,
  description,
  submitLabel,
  categories,
  isSubmitting = false,
  onClose,
  onSubmit,
}: FoodFormModalProps) {
  const [values, setValues] = useState(EMPTY_FOOD_FORM_VALUES);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    setValues(EMPTY_FOOD_FORM_VALUES);
    setErrors({});
  }, [open]);

  if (!open) return null;

  async function handleSubmit() {
    const parsed = createFoodSchema.safeParse({
      ...values,
      dietType: values.dietType || undefined,
      servingSize: values.servingSize || undefined,
      calories: values.calories || undefined,
      protein: values.protein || undefined,
      carbs: values.carbs || undefined,
      fats: values.fats || undefined,
      averageCost: values.averageCost || undefined,
      imageUrl: values.imageUrl || undefined,
    });

    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (typeof key === 'string' && !fieldErrors[key]) {
          fieldErrors[key] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    const success = await onSubmit(parsed.data);
    if (success) onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-background p-6 shadow-2xl"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">{title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>

        <FoodFormFields
          values={values}
          errors={errors}
          categories={categories}
          disabled={isSubmitting}
          onChange={(field, value) => {
            setValues((current) => ({ ...current, [field]: value }));
            setErrors((current) => ({ ...current, [field]: '' }));
          }}
        />

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-xl border border-border px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={isSubmitting}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground shadow-[0_0_20px_var(--neon-glow)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 dark:text-black"
          >
            {isSubmitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Plus className="size-4" />
            )}
            {submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
