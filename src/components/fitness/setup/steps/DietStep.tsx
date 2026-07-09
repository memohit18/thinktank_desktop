'use client';

import {
  FormField,
  FormSelect,
  StepSection,
} from '@/components/fitness/setup/FormFields';
import {
  DIET_TYPE_OPTIONS,
  EXPERIENCE_LEVEL_OPTIONS,
  WORKOUT_DAYS_OPTIONS,
} from '@/lib/fitness/constants';
import { parseFormNumber } from '@/lib/fitness/formUtils';
import type { DietType, ExperienceLevel } from '@/lib/fitness/types';
import type { FitnessSetupForm } from '@/hooks/useFitnessSetup';

type DietStepProps = {
  form: FitnessSetupForm;
  errors: Partial<Record<string, string>>;
};

export default function DietStep({ form, errors }: DietStepProps) {
  const { register, setValue, watch } = form;
  const dietType = watch('dietType');
  const workoutExperience = watch('workoutExperience');
  const workoutDaysPerWeek = watch('workoutDaysPerWeek');

  return (
    <StepSection>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormSelect
          label="Diet type"
          value={dietType}
          onChange={(value) =>
            setValue('dietType', value as DietType, { shouldDirty: true })
          }
          options={DIET_TYPE_OPTIONS}
          error={errors.dietType}
        />
        <FormSelect
          label="Workout experience"
          value={workoutExperience}
          onChange={(value) =>
            setValue('workoutExperience', value as ExperienceLevel, {
              shouldDirty: true,
            })
          }
          options={EXPERIENCE_LEVEL_OPTIONS}
          error={errors.workoutExperience}
        />
        <FormSelect
          label="Workout days per week"
          value={workoutDaysPerWeek === '' ? '' : String(workoutDaysPerWeek)}
          onChange={(value) =>
            setValue('workoutDaysPerWeek', value ? Number(value) : '', {
              shouldDirty: true,
            })
          }
          options={WORKOUT_DAYS_OPTIONS.map((days) => ({
            value: String(days),
            label: `${days} days`,
          }))}
          error={errors.workoutDaysPerWeek}
        />
        <FormField
          label="Target weight (kg)"
          type="number"
          min={30}
          max={300}
          placeholder="Optional"
          hint="Leave blank if you do not have a target weight."
          error={errors.targetWeightKg}
          {...register('targetWeightKg', { setValueAs: parseFormNumber })}
        />
        <FormField
          label="Target body fat (%)"
          type="number"
          min={3}
          max={60}
          placeholder="Optional"
          hint="Leave blank if you do not track body fat."
          error={errors.targetBodyFatPercent}
          {...register('targetBodyFatPercent', { setValueAs: parseFormNumber })}
        />
      </div>
    </StepSection>
  );
}
