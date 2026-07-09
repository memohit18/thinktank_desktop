'use client';

import CardSelector from '@/components/fitness/setup/CardSelector';
import { StepSection } from '@/components/fitness/setup/FormFields';
import { FITNESS_GOAL_OPTIONS } from '@/lib/fitness/constants';
import type { FitnessGoal } from '@/lib/fitness/types';
import type { FitnessSetupForm } from '@/hooks/useFitnessSetup';

type GoalStepProps = {
  form: FitnessSetupForm;
  error?: string;
};

export default function GoalStep({ form, error }: GoalStepProps) {
  const { setValue, watch } = form;
  const fitnessGoal = watch('fitnessGoal');

  return (
    <StepSection>
      <CardSelector<FitnessGoal>
        value={fitnessGoal}
        options={FITNESS_GOAL_OPTIONS}
        variant="goal"
        error={error}
        onChange={(value) =>
          setValue('fitnessGoal', value, { shouldDirty: true, shouldValidate: true })
        }
      />
    </StepSection>
  );
}
