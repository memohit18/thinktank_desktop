'use client';

import { useEffect, useState } from 'react';
import { Loader2, Save, X } from 'lucide-react';
import FoodFormFields from '@/components/fitness/food-preferences/FoodFormFields';
import {
  mapFoodToFormValues,
  updateFoodSchema,
  type UpdateFoodSchemaValues,
} from '@/lib/fitness/food/schemas/food.schema';
import type { Food, FoodCategory } from '@/lib/fitness/food/types';

type EditFoodModalProps = {
  food: Food | null;
  categories: FoodCategory[];
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (
    foodId: string,
    values: UpdateFoodSchemaValues,
    options?: { removeCategory?: boolean },
  ) => Promise<boolean>;
};

export default function EditFoodModal({
  food,
  categories,
  isSubmitting = false,
  onClose,
  onSubmit,
}: EditFoodModalProps) {
  const [values, setValues] = useState(
    mapFoodToFormValues({ name: '', categoryId: '' }),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!food) return;
    setValues(mapFoodToFormValues(food));
    setErrors({});
  }, [food]);

  if (!food) return null;

  const foodId = food.id;

  async function handleSubmit(removeCategory = false) {
    if (isSubmitting) return;

    const parsed = updateFoodSchema.safeParse({
      ...values,
      dietType: values.dietType || undefined,
      servingSize: values.servingSize || undefined,
      calories: values.calories || undefined,
      protein: values.protein || undefined,
      carbs: values.carbs || undefined,
      fats: values.fats || undefined,
      averageCost: values.averageCost || undefined,
      imageUrl: values.imageUrl || undefined,
      category: removeCategory ? '' : values.category || undefined,
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

    const success = await onSubmit(foodId, parsed.data, { removeCategory });
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
            <h2 className="text-lg font-semibold text-foreground">Edit food</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Update food details or change its category. Set category to none to remove it.
            </p>
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
          allowNoCategory
          disabled={isSubmitting}
          onChange={(field, value) => {
            setValues((current) => ({ ...current, [field]: value }));
            setErrors((current) => ({ ...current, [field]: '' }));
          }}
        />

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => void handleSubmit(true)}
            disabled={isSubmitting}
            className="text-xs font-semibold text-red-500 transition-colors hover:text-red-400 disabled:opacity-50"
          >
            Remove category
          </button>

          <div className="flex flex-col-reverse gap-3 sm:flex-row">
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
              onClick={() => void handleSubmit(false)}
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground shadow-[0_0_20px_var(--neon-glow)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 dark:text-black"
            >
              {isSubmitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              Save changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
