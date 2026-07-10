'use client';

import { useCallback } from 'react';
import { useToast } from '@/components/ui/Toast';
import { getApiErrorMessage } from '@/lib/services/getApiErrorMessage';
import { useRegenerateDietMutation } from '@/lib/services/dietApi';

export function useRegenerateDiet() {
  const { showToast } = useToast();
  const [regenerateDiet, state] = useRegenerateDietMutation();

  const regenerate = useCallback(async () => {
    try {
      const plan = await regenerateDiet().unwrap();
      showToast('Diet plan regenerated successfully.');
      return plan;
    } catch (error) {
      showToast(
        getApiErrorMessage(error, 'Failed to regenerate diet plan.'),
        'error',
      );
      return null;
    }
  }, [regenerateDiet, showToast]);

  return {
    regenerate,
    isRegenerating: state.isLoading,
  };
}
