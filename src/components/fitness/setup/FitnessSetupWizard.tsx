'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import FitnessSetupShell, {
  SetupMobileHeader,
} from '@/components/fitness/setup/FitnessSetupShell';
import ProgressHeader from '@/components/fitness/setup/ProgressHeader';
import StepNavigation from '@/components/fitness/setup/StepNavigation';
import ActivityStep from '@/components/fitness/setup/steps/ActivityStep';
import AllergyStep from '@/components/fitness/setup/steps/AllergyStep';
import BasicInfoStep from '@/components/fitness/setup/steps/BasicInfoStep';
import DietStep from '@/components/fitness/setup/steps/DietStep';
import GoalStep from '@/components/fitness/setup/steps/GoalStep';
import PhysiqueGoalStep from '@/components/fitness/setup/steps/PhysiqueGoalStep';
import ProcessingStep from '@/components/fitness/setup/steps/ProcessingStep';
import ReviewStep from '@/components/fitness/setup/steps/ReviewStep';
import SuccessStep from '@/components/fitness/setup/steps/SuccessStep';
import WelcomeStep from '@/components/fitness/setup/steps/WelcomeStep';
import { useToast } from '@/components/ui/Toast';
import { useFitnessSetup } from '@/hooks/useFitnessSetup';
import { getInitialFitnessSetupValues, hasCompletedFitnessOnboarding } from '@/lib/fitness/profileMapper';
import { toFitnessProfilePayload } from '@/lib/fitness/schemas/fitness.schema';
import {
  EMPTY_FITNESS_SETUP_VALUES,
  readFitnessSetupDraft,
} from '@/lib/fitness/setupStorage';
import { getApiErrorMessage } from '@/lib/services/getApiErrorMessage';
import {
  useCreateFitnessProfileMutation,
  useGetFitnessProfileQuery,
  useGetPhysiqueGoalsQuery,
  useUpdateFitnessProfileMutation,
} from '@/lib/services/fitnessApi';

export default function FitnessSetupWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEditMode = searchParams.get('mode') === 'edit';
  const { showToast } = useToast();
  const [isSuccess, setIsSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasHydratedProfile, setHasHydratedProfile] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const [savedProfileId, setSavedProfileId] = useState<string | null>(null);

  const {
    data: profile,
    isLoading: isProfileLoading,
    isFetching: isProfileFetching,
    isError: isProfileError,
    refetch: refetchProfile,
  } = useGetFitnessProfileQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const profileIsComplete =
    profile && hasCompletedFitnessOnboarding(profile);

  useEffect(() => {
    void refetchProfile();
  }, [refetchProfile]);

  const {
    data: physiqueGoals = [],
    isLoading: isGoalsLoading,
    isError: isGoalsError,
    refetch: refetchGoals,
  } = useGetPhysiqueGoalsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const [createProfile, { isLoading: isCreating }] =
    useCreateFitnessProfileMutation();
  const [updateProfile, { isLoading: isUpdating }] =
    useUpdateFitnessProfileMutation();

  const setup = useFitnessSetup();

  const {
    form,
    currentStep,
    progressPercent,
    stepErrors,
    goNext,
    goPrevious,
    goToStep,
    clearDraft,
    isFirstStep,
    isLastStep,
  } = setup;

  useEffect(() => {
    if (isProfileLoading || isProfileFetching || hasHydratedProfile) return;

    if (profileIsComplete && !isEditMode) {
      setIsRedirecting(true);
      router.replace('/fitness/transformation');
      return;
    }

    if (profile?.id) {
      setSavedProfileId(profile.id);
    }

    const draft = readFitnessSetupDraft();

    if (profile) {
      form.reset(getInitialFitnessSetupValues(profile));
    } else if (draft) {
      form.reset({
        ...EMPTY_FITNESS_SETUP_VALUES,
        ...draft.values,
      });
      goToStep(draft.step);
    }

    setHasHydratedProfile(true);
  }, [
    form,
    goToStep,
    hasHydratedProfile,
    isProfileFetching,
    isProfileLoading,
    isEditMode,
    profile,
    profileIsComplete,
    router,
  ]);

  useEffect(() => {
    if ((!isProfileError && !isProfileLoading && !isProfileFetching) || hasHydratedProfile) {
      return;
    }

    if (isProfileError && !isProfileLoading && !isProfileFetching) {
      setHasHydratedProfile(true);
    }
  }, [
    hasHydratedProfile,
    isProfileError,
    isProfileFetching,
    isProfileLoading,
  ]);

  async function handleSubmit() {
    const isValid = setup.validateCurrentStep();
    if (!isValid) return;

    const payload = toFitnessProfilePayload(form.getValues(), true);
    setIsProcessing(true);

    try {
      await new Promise((resolve) => window.setTimeout(resolve, 3500));

      if (savedProfileId || profile?.id) {
        await updateProfile(payload).unwrap();
      } else {
        const created = await createProfile(payload).unwrap();
        setSavedProfileId(created.id);
      }

      clearDraft();
      setIsProcessing(false);
      setIsSuccess(true);
      showToast(
        isEditMode
          ? 'Fitness profile updated successfully.'
          : 'Fitness profile saved successfully.',
      );
    } catch (error) {
      setIsProcessing(false);
      showToast(
        getApiErrorMessage(error, 'Failed to save your fitness profile.'),
        'error',
      );
    }
  }

  function handleNext() {
    if (currentStep === 'welcome') {
      goNext();
      return;
    }

    if (isLastStep) {
      void handleSubmit();
      return;
    }

    goNext();
  }

  if (isProfileLoading || isProfileFetching || !hasHydratedProfile || isRedirecting) {
    return (
      <FitnessSetupSkeleton
        message={
          isRedirecting
            ? 'Opening your transformation dashboard...'
            : 'Checking for existing profile...'
        }
      />
    );
  }

  if (isProcessing) {
    return (
      <FitnessSetupShell
        currentStep={currentStep}
        progressPercent={100}
        footer={<div />}
      >
        <ProcessingStep />
      </FitnessSetupShell>
    );
  }

  if (isSuccess) {
    return (
      <FitnessSetupShell
        currentStep={currentStep}
        progressPercent={100}
        footer={<div />}
      >
        <SuccessStep
          onContinue={() =>
            router.replace(isEditMode ? '/fitness/setup?mode=edit' : '/fitness/transformation')
          }
        />
      </FitnessSetupShell>
    );
  }

  return (
    <FitnessSetupShell
      currentStep={currentStep}
      progressPercent={progressPercent}
      footer={
        <StepNavigation
          showPrevious={!isFirstStep}
          showNext
          previousLabel="Previous"
          nextLabel={
            currentStep === 'welcome'
              ? 'Get Started'
              : isLastStep
                ? 'Generate AI Plan'
                : 'Next'
          }
          isSubmitting={isCreating || isUpdating}
          onPrevious={goPrevious}
          onNext={handleNext}
        />
      }
    >
      <SetupMobileHeader />
      <ProgressHeader currentStep={currentStep} />

      {isProfileError ? (
        <div className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-foreground">
          Could not reach your fitness profile API (`GET /api/fitness/profile`).
          You can still complete onboarding.
          <button
            type="button"
            onClick={() => void refetchProfile()}
            className="ml-2 font-semibold text-accent underline-offset-2 hover:underline"
          >
            Retry
          </button>
        </div>
      ) : profile && isEditMode ? (
        <div className="mb-4 rounded-xl border border-accent/20 bg-accent/5 px-4 py-3 text-sm text-foreground">
          Editing your saved fitness profile.
        </div>
      ) : null}

      <div className="rounded-2xl border border-border/70 bg-card/50 p-4 sm:p-6">
        {currentStep === 'welcome' ? <WelcomeStep /> : null}
        {currentStep === 'basic-info' ? (
          <BasicInfoStep form={form} errors={stepErrors} />
        ) : null}
        {currentStep === 'activity' ? (
          <ActivityStep form={form} error={stepErrors.activityLevel} />
        ) : null}
        {currentStep === 'goal' ? (
          <GoalStep form={form} error={stepErrors.fitnessGoal} />
        ) : null}
        {currentStep === 'physique-goal' ? (
          <PhysiqueGoalStep
            form={form}
            goals={physiqueGoals}
            isLoading={isGoalsLoading}
            isError={isGoalsError}
            onRetry={() => void refetchGoals()}
            error={stepErrors.physiqueGoalId}
          />
        ) : null}
        {currentStep === 'diet' ? (
          <DietStep form={form} errors={stepErrors} />
        ) : null}
        {currentStep === 'allergy' ? (
          <AllergyStep form={form} error={stepErrors.allergies} />
        ) : null}
        {currentStep === 'review' ? (
          <ReviewStep
            values={form.getValues()}
            physiqueGoals={physiqueGoals}
            onEdit={goToStep}
          />
        ) : null}
      </div>
    </FitnessSetupShell>
  );
}

function FitnessSetupSkeleton({ message = 'Loading setup...' }: { message?: string }) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] animate-pulse">
      <div className="hidden w-56 border-r border-border bg-card/50 lg:block" />
      <div className="flex-1 space-y-6 p-8">
        <p className="text-sm text-muted-foreground">{message}</p>
        <div className="h-8 w-48 rounded bg-muted" />
        <div className="h-3 w-full rounded-full bg-muted" />
        <div className="h-64 rounded-2xl bg-muted" />
      </div>
    </div>
  );
}
