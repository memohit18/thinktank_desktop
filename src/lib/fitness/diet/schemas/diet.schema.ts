import { z } from 'zod';

export const dietDayKeySchema = z.enum([
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
]);

export const dietMealTypeSchema = z.enum([
  'breakfast',
  'lunch',
  'snack',
  'dinner',
]);

export const dietMealSchema = z.object({
  id: z.string().min(1),
  type: dietMealTypeSchema,
  name: z.string().min(1),
  imageUrl: z.string().nullable().optional(),
  servingSize: z.string().nullable().optional(),
  calories: z.number().nonnegative(),
  protein: z.number().nonnegative(),
  carbs: z.number().nonnegative(),
  fats: z.number().nonnegative(),
});

export const dietDayPlanSchema = z.object({
  day: dietDayKeySchema,
  meals: z.array(dietMealSchema),
});

export const dietPlanSchema = z.object({
  id: z.string().min(1),
  goal: z.string().nullable().optional(),
  dailyCalories: z.number().positive(),
  dailyProtein: z.number().nonnegative(),
  mealsPerDay: z.number().int().positive(),
  durationWeeks: z.number().int().positive(),
  version: z.number().int().positive().nullable().optional(),
  status: z.string().min(1),
  days: z.array(dietDayPlanSchema),
});

export type DietPlanSchemaValues = z.infer<typeof dietPlanSchema>;
