'use client';

import { useCallback } from 'react';
import { useToast } from '@/components/ui/Toast';
import { getApiErrorMessage } from '@/lib/services/getApiErrorMessage';
import { useReplaceMealItemMutation } from '@/lib/services/mealApi';
import type { ReplaceMealPayload } from '@/lib/fitness/meals/types';

export function useReplaceMeal() {
  const { showToast } = useToast();
  const [replaceMeal, state] = useReplaceMealItemMutation();

  const replace = useCallback(
    async (payload: ReplaceMealPayload) => {
      try {
        await replaceMeal(payload).unwrap();
        showToast('Meal replaced successfully.');
        return true;
      } catch (error) {
        showToast(
          getApiErrorMessage(error, 'Failed to replace meal.'),
          'error',
        );
        return false;
      }
    },
    [replaceMeal, showToast],
  );

  return {
    replace,
    isReplacing: state.isLoading,
  };
}
