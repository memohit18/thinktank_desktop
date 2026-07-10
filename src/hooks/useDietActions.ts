'use client';

import { useCallback } from 'react';
import { useToast } from '@/components/ui/Toast';
import { getApiErrorMessage } from '@/lib/services/getApiErrorMessage';
import {
  useActivateDietMutation,
  useDeleteDietMutation,
} from '@/lib/services/dietApi';

export function useDietActions() {
  const { showToast } = useToast();
  const [activateDiet, activateState] = useActivateDietMutation();
  const [deleteDiet, deleteState] = useDeleteDietMutation();

  const activate = useCallback(
    async (dietPlanId: string) => {
      try {
        const plan = await activateDiet(dietPlanId).unwrap();
        showToast('Diet plan activated.');
        return plan;
      } catch (error) {
        showToast(
          getApiErrorMessage(error, 'Failed to activate diet plan.'),
          'error',
        );
        return null;
      }
    },
    [activateDiet, showToast],
  );

  const remove = useCallback(
    async (dietPlanId: string) => {
      try {
        await deleteDiet(dietPlanId).unwrap();
        showToast('Diet plan deleted.');
        return true;
      } catch (error) {
        showToast(
          getApiErrorMessage(error, 'Failed to delete diet plan.'),
          'error',
        );
        return false;
      }
    },
    [deleteDiet, showToast],
  );

  return {
    activate,
    remove,
    isActivating: activateState.isLoading,
    isDeleting: deleteState.isLoading,
  };
}
