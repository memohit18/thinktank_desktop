'use client';

import { useCallback } from 'react';
import { useToast } from '@/components/ui/Toast';
import { getApiErrorMessage } from '@/lib/services/getApiErrorMessage';
import { useUpdateDietHydrationMutation } from '@/lib/services/dietApi';

export function useUpdateDietHydration() {
  const { showToast } = useToast();
  const [updateHydration, state] = useUpdateDietHydrationMutation();

  const addHydration = useCallback(
    async (amountMl: number) => {
      try {
        const planner = await updateHydration({ amountMl }).unwrap();
        showToast(`Added ${amountMl}ml water.`);
        return planner;
      } catch (error) {
        showToast(
          getApiErrorMessage(error, 'Failed to update hydration.'),
          'error',
        );
        return null;
      }
    },
    [showToast, updateHydration],
  );

  return {
    addHydration,
    isUpdating: state.isLoading,
  };
}
