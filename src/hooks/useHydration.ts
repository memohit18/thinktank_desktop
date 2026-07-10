'use client';

import { useCallback } from 'react';
import { useToast } from '@/components/ui/Toast';
import { getApiErrorMessage } from '@/lib/services/getApiErrorMessage';
import {
  useGetHydrationTodayQuery,
  useLogHydrationMutation,
} from '@/lib/services/hydrationApi';

export function useHydration() {
  const { showToast } = useToast();
  const query = useGetHydrationTodayQuery();
  const [logWater, logState] = useLogHydrationMutation();

  const add = useCallback(
    async (amountMl: number) => {
      try {
        await logWater(amountMl).unwrap();
        showToast(`Added ${amountMl}ml water.`);
        return true;
      } catch (error) {
        showToast(
          getApiErrorMessage(error, 'Failed to log water.'),
          'error',
        );
        return false;
      }
    },
    [logWater, showToast],
  );

  return {
    hydration: query.data,
    amountMl: query.data?.amountMl ?? 0,
    goalMl: query.data?.goalMl ?? 3500,
    percent: query.data?.percent ?? 0,
    remainingMl: query.data?.remainingMl ?? 3500,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    isLogging: logState.isLoading,
    add,
    refetch: query.refetch,
  };
}
