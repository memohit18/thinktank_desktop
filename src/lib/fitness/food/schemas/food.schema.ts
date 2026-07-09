import { z } from 'zod';

const optionalNumber = z
  .union([z.string(), z.number()])
  .optional()
  .transform((value) => {
    if (value === undefined || value === '') return undefined;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  })
  .refine((value) => value === undefined || value >= 0, {
    message: 'Must be zero or greater',
  });

export const createFoodSchema = z.object({
  name: z.string().trim().min(1, 'Food name is required'),
  category: z.string().trim().min(1, 'Category is required'),
  dietType: z.string().optional(),
  servingSize: z.string().optional(),
  calories: optionalNumber,
  protein: optionalNumber,
  carbs: optionalNumber,
  fats: optionalNumber,
});

export const updateFoodSchema = createFoodSchema
  .partial()
  .extend({
    name: z.string().trim().min(1, 'Food name is required').optional(),
    category: z.union([z.string().trim().min(1), z.literal('')]).optional(),
  });

export type CreateFoodSchemaValues = z.infer<typeof createFoodSchema>;
export type UpdateFoodSchemaValues = z.infer<typeof updateFoodSchema>;

export const EMPTY_FOOD_FORM_VALUES = {
  name: '',
  category: '',
  dietType: '',
  servingSize: '',
  calories: '',
  protein: '',
  carbs: '',
  fats: '',
} as const;

export function mapFoodToFormValues(food: {
  name: string;
  categoryId: string;
  dietType?: string | null;
  servingSize?: string | null;
  calories?: number | null;
  protein?: number | null;
  carbs?: number | null;
  fats?: number | null;
}) {
  return {
    name: food.name,
    category: food.categoryId && food.categoryId !== 'uncategorized' ? food.categoryId : '',
    dietType: food.dietType ?? '',
    servingSize: food.servingSize ?? '',
    calories: food.calories != null ? String(food.calories) : '',
    protein: food.protein != null ? String(food.protein) : '',
    carbs: food.carbs != null ? String(food.carbs) : '',
    fats: food.fats != null ? String(food.fats) : '',
  };
}

export function toCreateFoodPayload(
  values: CreateFoodSchemaValues,
): import('@/lib/fitness/food/types').CreateFoodPayload {
  return {
    name: values.name.trim(),
    category: values.category,
    dietType: values.dietType?.trim() || undefined,
    servingSize: values.servingSize?.trim() || undefined,
    calories: values.calories,
    protein: values.protein,
    carbs: values.carbs,
    fats: values.fats,
  };
}

export function toUpdateFoodPayload(
  values: UpdateFoodSchemaValues,
  options?: { removeCategory?: boolean },
): import('@/lib/fitness/food/types').UpdateFoodPayload {
  const payload: import('@/lib/fitness/food/types').UpdateFoodPayload = {};

  if (values.name !== undefined) payload.name = values.name.trim();
  if (options?.removeCategory) {
    payload.category = null;
  } else if (values.category) {
    payload.category = values.category;
  }
  if (values.dietType !== undefined) {
    payload.dietType = values.dietType.trim() || undefined;
  }
  if (values.servingSize !== undefined) {
    payload.servingSize = values.servingSize.trim() || undefined;
  }
  if (values.calories !== undefined) payload.calories = values.calories;
  if (values.protein !== undefined) payload.protein = values.protein;
  if (values.carbs !== undefined) payload.carbs = values.carbs;
  if (values.fats !== undefined) payload.fats = values.fats;

  return payload;
}
