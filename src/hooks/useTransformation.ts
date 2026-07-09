'use client';

import { useCallback, useMemo } from 'react';
import { useToast } from '@/components/ui/Toast';
import { getApiErrorMessage } from '@/lib/services/getApiErrorMessage';
import {
  useGenerateTransformationMutation,
  useGetActiveTransformationQuery,
  useGetTransformationHistoryQuery,
  useGetTransformationMilestonesQuery,
} from '@/lib/services/transformationApi';

export function useTransformation() {
  const { showToast } = useToast();

  const {
    data: transformation,
    isLoading,
    isFetching,
    isError,
    isUninitialized,
    refetch,
  } = useGetActiveTransformationQuery();

  const {
    data: historyResponse,
    isLoading: isHistoryLoading,
  } = useGetTransformationHistoryQuery({ page: 1, limit: 20 });

  const shouldFetchMilestones =
    Boolean(transformation?.id) && !(transformation?.milestones?.length ?? 0);

  const { data: fetchedMilestones = [] } = useGetTransformationMilestonesQuery(
    transformation?.id ?? '',
    { skip: !shouldFetchMilestones },
  );

  const [generateTransformation, generateState] = useGenerateTransformationMutation();

  const milestones =
    transformation?.milestones?.length
      ? transformation.milestones
      : fetchedMilestones;

  const resolvedTransformation = useMemo(() => {
    if (!transformation?.id) {
      return null;
    }

    return {
      ...transformation,
      milestones,
    };
  }, [milestones, transformation]);

  const hasLoaded = !isLoading && !isUninitialized;
  const hasTransformation = Boolean(transformation?.id);
  const isUsingFallback = hasLoaded && isError;

  const generate = useCallback(async () => {
    try {
      await generateTransformation().unwrap();
      showToast('Transformation plan generated successfully.');
      await refetch();
      return true;
    } catch (error) {
      showToast(
        getApiErrorMessage(error, 'Failed to generate transformation plan.'),
        'error',
      );
      return false;
    }
  }, [generateTransformation, refetch, showToast]);

  const regenerate = useCallback(async () => {
    try {
      await generateTransformation().unwrap();
      showToast('Transformation plan regenerated successfully.');
      await refetch();
      return true;
    } catch (error) {
      showToast(
        getApiErrorMessage(error, 'Failed to regenerate transformation plan.'),
        'error',
      );
      return false;
    }
  }, [generateTransformation, refetch, showToast]);

  return {
    transformation: resolvedTransformation,
    history: historyResponse?.items ?? [],
    historyMeta: historyResponse?.meta,
    isLoading: isLoading || isUninitialized,
    isFetching,
    isHistoryLoading,
    isError,
    isUsingFallback,
    isGenerating: generateState.isLoading,
    hasTransformation,
    generate,
    regenerate,
    refetch,
  };
}
