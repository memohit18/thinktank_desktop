'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm, type Resolver, type UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FITNESS_SETUP_STEPS } from '@/lib/fitness/constants';
import type { FitnessSetupFormValues } from '@/lib/fitness/types';
import {
  fitnessSetupSchema,
  validateFitnessSetupStep,
} from '@/lib/fitness/schemas/fitness.schema';
import {
  clearFitnessSetupDraft,
  EMPTY_FITNESS_SETUP_VALUES,
  writeFitnessSetupDraft,
} from '@/lib/fitness/setupStorage';
import type { FitnessSetupStepId } from '@/lib/fitness/types';

type UseFitnessSetupOptions = {
  initialValues?: Partial<FitnessSetupFormValues>;
};

export function useFitnessSetup(options: UseFitnessSetupOptions = {}) {
  const [currentStep, setCurrentStep] = useState<FitnessSetupStepId>(
    'welcome',
  );
  const [stepErrors, setStepErrors] = useState<
    Partial<Record<keyof FitnessSetupFormValues, string>>
  >({});

  const form = useForm<FitnessSetupFormValues>({
    resolver: zodResolver(fitnessSetupSchema) as Resolver<FitnessSetupFormValues>,
    defaultValues: {
      ...EMPTY_FITNESS_SETUP_VALUES,
      ...options.initialValues,
    },
    mode: 'onChange',
  });

  const values = form.watch();

  useEffect(() => {
    if (currentStep === 'welcome') return;

    writeFitnessSetupDraft({
      step: currentStep,
      values: form.getValues(),
      updatedAt: new Date().toISOString(),
    });
  }, [currentStep, values, form]);

  const currentStepIndex = useMemo(
    () => FITNESS_SETUP_STEPS.findIndex((step) => step.id === currentStep),
    [currentStep],
  );

  const progressPercent = useMemo(() => {
    if (currentStep === 'welcome') return 0;
    const actionableSteps = FITNESS_SETUP_STEPS.length - 1;
    return Math.round((currentStepIndex / actionableSteps) * 100);
  }, [currentStep, currentStepIndex]);

  const validateCurrentStep = useCallback(() => {
    const result = validateFitnessSetupStep(currentStep, form.getValues());
    setStepErrors(result.errors);
    return result.success;
  }, [currentStep, form]);

  const goToStep = useCallback(
    (step: FitnessSetupStepId) => {
      setStepErrors({});
      setCurrentStep(step);
    },
    [],
  );

  const goNext = useCallback(() => {
    if (currentStep === 'welcome') {
      goToStep('basic-info');
      return true;
    }

    if (!validateCurrentStep()) {
      return false;
    }

    const nextStep = FITNESS_SETUP_STEPS[currentStepIndex + 1];
    if (nextStep) {
      goToStep(nextStep.id);
    }

    return true;
  }, [currentStep, currentStepIndex, goToStep, validateCurrentStep]);

  const goPrevious = useCallback(() => {
    const previousStep = FITNESS_SETUP_STEPS[currentStepIndex - 1];
    if (previousStep) {
      goToStep(previousStep.id);
    }
  }, [currentStepIndex, goToStep]);

  const clearDraft = useCallback(() => {
    clearFitnessSetupDraft();
  }, []);

  return {
    form,
    currentStep,
    currentStepIndex,
    progressPercent,
    stepErrors,
    goNext,
    goPrevious,
    goToStep,
    validateCurrentStep,
    clearDraft,
    isFirstStep: currentStepIndex === 0,
    isLastStep: currentStep === 'review',
  };
}

export type FitnessSetupForm = UseFormReturn<FitnessSetupFormValues>;
