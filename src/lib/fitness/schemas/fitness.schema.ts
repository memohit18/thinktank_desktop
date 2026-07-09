import { z } from 'zod';
import { parseFormNumber } from '@/lib/fitness/formUtils';
import type { FitnessSetupFormValues, FitnessSetupStepId } from '@/lib/fitness/types';

const genderSchema = z.enum(['male', 'female', 'other', 'prefer_not_to_say']);
const activityLevelSchema = z.enum([
  'sedentary',
  'light',
  'moderate',
  'active',
  'athlete',
]);
const fitnessGoalSchema = z.enum([
  'weight_loss',
  'fat_loss',
  'lean_bulk',
  'muscle_gain',
  'body_recomposition',
  'maintain_weight',
]);
const dietTypeSchema = z.enum([
  'balanced',
  'vegetarian',
  'vegan',
  'keto',
  'paleo',
  'mediterranean',
  'high_protein',
]);
const experienceLevelSchema = z.enum(['beginner', 'intermediate', 'advanced']);

const numberField = (label: string, min: number, max: number) =>
  z.preprocess(
    (value) => parseFormNumber(value),
    z
      .union([z.number(), z.literal('')])
      .refine((value) => value !== '', `${label} is required`)
      .refine(
        (value) => typeof value === 'number' && value >= min && value <= max,
        `${label} must be between ${min} and ${max}`,
      ),
  );

const optionalNumberField = (label: string, min: number, max: number) =>
  z.preprocess(
    (value) => parseFormNumber(value),
    z
      .union([z.number(), z.literal('')])
      .refine(
        (value) =>
          value === '' ||
          (typeof value === 'number' && value >= min && value <= max),
        `${label} must be between ${min} and ${max}`,
      ),
  );

export const fitnessSetupSchema = z.object({
  age: numberField('Age', 13, 100),
  gender: z
    .union([genderSchema, z.literal('')])
    .refine((value) => value !== '', 'Gender is required'),
  heightCm: numberField('Height', 100, 250),
  weightKg: numberField('Weight', 30, 300),
  activityLevel: z
    .union([activityLevelSchema, z.literal('')])
    .refine((value) => value !== '', 'Activity level is required'),
  fitnessGoal: z
    .union([fitnessGoalSchema, z.literal('')])
    .refine((value) => value !== '', 'Fitness goal is required'),
  physiqueGoalId: z.string().min(1, 'Physique goal is required'),
  dietType: z
    .union([dietTypeSchema, z.literal('')])
    .refine((value) => value !== '', 'Diet type is required'),
  workoutExperience: z
    .union([experienceLevelSchema, z.literal('')])
    .refine((value) => value !== '', 'Workout experience is required'),
  workoutDaysPerWeek: numberField('Workout days', 1, 7),
  targetWeightKg: optionalNumberField('Target weight', 30, 300),
  targetBodyFatPercent: optionalNumberField('Target body fat', 3, 60),
  allergies: z.string().max(1000, 'Allergies must be 1000 characters or less'),
});

export type FitnessSetupSchemaValues = z.infer<typeof fitnessSetupSchema>;

const stepFieldMap: Record<
  Exclude<FitnessSetupStepId, 'welcome' | 'review'>,
  (keyof FitnessSetupFormValues)[]
> = {
  'basic-info': ['age', 'gender', 'heightCm', 'weightKg'],
  activity: ['activityLevel'],
  goal: ['physiqueGoalId', 'fitnessGoal'],
  diet: [
    'dietType',
    'workoutExperience',
    'workoutDaysPerWeek',
    'targetWeightKg',
    'targetBodyFatPercent',
  ],
  allergy: ['allergies'],
};

export function validateFitnessSetupStep(
  step: FitnessSetupStepId,
  values: FitnessSetupFormValues,
) {
  if (step === 'welcome' || step === 'review') {
    return { success: true as const, errors: {} };
  }

  const fields = stepFieldMap[step];
  const partialSchema = fitnessSetupSchema.pick(
    Object.fromEntries(fields.map((field) => [field, true])) as Record<
      keyof FitnessSetupFormValues,
      true
    >,
  );

  const result = partialSchema.safeParse(values);

  if (result.success) {
    return { success: true as const, errors: {} };
  }

  const errors: Partial<Record<keyof FitnessSetupFormValues, string>> = {};

  for (const issue of result.error.issues) {
    const field = issue.path[0];
    if (typeof field === 'string' && !errors[field as keyof FitnessSetupFormValues]) {
      errors[field as keyof FitnessSetupFormValues] = issue.message;
    }
  }

  return { success: false as const, errors };
}

export function toFitnessProfilePayload(
  values: FitnessSetupFormValues,
  onboardingCompleted = true,
) {
  const parsed = fitnessSetupSchema.parse(values);

  return {
    age: parsed.age as number,
    gender: parsed.gender as z.infer<typeof genderSchema>,
    heightCm: parsed.heightCm as number,
    weightKg: parsed.weightKg as number,
    activityLevel: parsed.activityLevel as z.infer<typeof activityLevelSchema>,
    fitnessGoal: parsed.fitnessGoal as z.infer<typeof fitnessGoalSchema>,
    physiqueGoalId: parsed.physiqueGoalId,
    dietType: parsed.dietType as z.infer<typeof dietTypeSchema>,
    workoutExperience: parsed.workoutExperience as z.infer<
      typeof experienceLevelSchema
    >,
    workoutDaysPerWeek: parsed.workoutDaysPerWeek as number,
    targetWeightKg:
      parsed.targetWeightKg === '' ? null : (parsed.targetWeightKg as number),
    targetBodyFatPercent:
      parsed.targetBodyFatPercent === ''
        ? null
        : (parsed.targetBodyFatPercent as number),
    allergies: parsed.allergies.trim() ? parsed.allergies.trim() : null,
    onboardingCompleted,
  };
}
