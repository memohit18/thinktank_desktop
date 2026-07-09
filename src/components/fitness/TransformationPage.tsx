'use client';

import FitnessModuleShell from '@/components/fitness/FitnessModuleShell';
import LoadingSkeleton from '@/components/fitness/transformation/LoadingSkeleton';
import TransformationDashboard from '@/components/fitness/transformation/TransformationDashboard';
import TransformationErrorState from '@/components/fitness/transformation/TransformationErrorState';
import TransformationGenerateView from '@/components/fitness/transformation/TransformationGenerateView';
import { useTransformation } from '@/hooks/useTransformation';
import { useGetFitnessProfileQuery } from '@/lib/services/fitnessApi';

export default function TransformationPage() {
  const {
    transformation,
    history,
    historyMeta,
    isLoading,
    isFetching,
    isHistoryLoading,
    isError,
    hasTransformation,
    isGenerating,
    generate,
    regenerate,
    refetch,
  } = useTransformation();

  const { data: profile } = useGetFitnessProfileQuery();

  if (isLoading) {
    return (
      <FitnessModuleShell activeNav="transformation">
        <LoadingSkeleton />
      </FitnessModuleShell>
    );
  }

  if (isError) {
    return (
      <FitnessModuleShell activeNav="transformation">
        <TransformationErrorState
          isFetching={isFetching}
          onRetry={() => void refetch()}
        />
      </FitnessModuleShell>
    );
  }

  if (!hasTransformation || !transformation) {
    return (
      <FitnessModuleShell activeNav="transformation">
        <TransformationGenerateView
          profile={profile}
          isGenerating={isGenerating}
          onGenerate={() => void generate()}
        />
      </FitnessModuleShell>
    );
  }

  return (
    <FitnessModuleShell activeNav="transformation">
      <TransformationDashboard
        transformation={transformation}
        history={history}
        historyMeta={historyMeta}
        isHistoryLoading={isHistoryLoading}
        workoutDaysPerWeek={profile?.workoutDaysPerWeek ?? 0}
        isRegenerating={isGenerating}
        onRegenerate={() => void regenerate()}
      />
    </FitnessModuleShell>
  );
}
