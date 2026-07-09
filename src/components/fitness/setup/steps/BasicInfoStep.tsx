'use client';

import { Gauge } from 'lucide-react';
import {
  FormField,
  GenderSegment,
  StepSection,
  WeightSlider,
} from '@/components/fitness/setup/FormFields';
import { GENDER_OPTIONS } from '@/lib/fitness/constants';
import { parseFormNumber } from '@/lib/fitness/formUtils';
import type { FitnessSetupForm } from '@/hooks/useFitnessSetup';
import type { Gender } from '@/lib/fitness/types';

type BasicInfoStepProps = {
  form: FitnessSetupForm;
  errors: Partial<Record<string, string>>;
};

function calculateBmi(weightKg: number | '', heightCm: number | '') {
  if (
    typeof weightKg !== 'number' ||
    typeof heightCm !== 'number' ||
    heightCm <= 0
  ) {
    return null;
  }

  const heightM = heightCm / 100;
  return Number((weightKg / (heightM * heightM)).toFixed(1));
}

function bmiLabel(bmi: number) {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Optimal Range';
  if (bmi < 30) return 'Overweight';
  return 'High';
}

export default function BasicInfoStep({ form, errors }: BasicInfoStepProps) {
  const { register, setValue, watch } = form;
  const gender = watch('gender');
  const heightCm = watch('heightCm');
  const weightKg = watch('weightKg');
  const bmi = calculateBmi(weightKg, heightCm);

  return (
    <StepSection>
      {bmi !== null ? (
        <div className="flex items-center justify-between rounded-2xl border border-accent/20 bg-accent/5 p-4 sm:p-5">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Calculated BMI
            </p>
            <p className="mt-1 text-3xl font-bold text-foreground">{bmi}</p>
            <p className="mt-1 text-sm font-medium text-accent">{bmiLabel(bmi)}</p>
          </div>
          <div className="flex size-14 items-center justify-center rounded-full border border-accent/30 bg-card text-accent">
            <Gauge className="size-6" />
          </div>
        </div>
      ) : null}

      <GenderSegment
        value={gender}
        options={GENDER_OPTIONS}
        onChange={(value) =>
          setValue('gender', value as Gender | '', { shouldDirty: true })
        }
        error={errors.gender}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          label="Age"
          type="number"
          min={13}
          max={100}
          placeholder="28"
          error={errors.age}
          {...register('age', { setValueAs: parseFormNumber })}
        />
        <FormField
          label="Height (cm)"
          type="number"
          min={100}
          max={250}
          placeholder="180"
          error={errors.heightCm}
          {...register('heightCm', { setValueAs: parseFormNumber })}
        />
      </div>

      <WeightSlider
        value={weightKg}
        min={40}
        max={150}
        error={errors.weightKg}
        onChange={(value) =>
          setValue('weightKg', value, { shouldDirty: true, shouldValidate: true })
        }
      />
    </StepSection>
  );
}
