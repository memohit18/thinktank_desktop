'use client';

import {
  Armchair,
  Dumbbell,
  Footprints,
  Trophy,
  Zap,
} from 'lucide-react';
import ListCardSelector from '@/components/fitness/setup/ListCardSelector';
import { StepSection } from '@/components/fitness/setup/FormFields';
import { ACTIVITY_LEVEL_OPTIONS } from '@/lib/fitness/constants';
import type { ActivityLevel } from '@/lib/fitness/types';
import type { FitnessSetupForm } from '@/hooks/useFitnessSetup';

const ACTIVITY_ICONS = {
  sedentary: Armchair,
  light: Footprints,
  moderate: Dumbbell,
  active: Zap,
  athlete: Trophy,
} as const;

type ActivityStepProps = {
  form: FitnessSetupForm;
  error?: string;
};

export default function ActivityStep({ form, error }: ActivityStepProps) {
  const { setValue, watch } = form;
  const activityLevel = watch('activityLevel');

  return (
    <StepSection>
      <ListCardSelector<ActivityLevel>
        value={activityLevel}
        options={ACTIVITY_LEVEL_OPTIONS.map((option) => ({
          value: option.value,
          label: option.label,
          description: option.description,
          icon: ACTIVITY_ICONS[option.value],
        }))}
        error={error}
        onChange={(value) =>
          setValue('activityLevel', value, {
            shouldDirty: true,
            shouldValidate: true,
          })
        }
      />
    </StepSection>
  );
}
