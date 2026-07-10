'use client';

import { useCallback } from 'react';
import { useToast } from '@/components/ui/Toast';
import { getApiErrorMessage } from '@/lib/services/getApiErrorMessage';
import { useGenerateDietMutation } from '@/lib/services/dietApi';

export function useGenerateDiet() {
  const { showToast } = useToast();
  const [generateDiet, state] = useGenerateDietMutation();

  const generate = useCallback(async () => {
    try {
      const plan = await generateDiet().unwrap();
      showToast('Diet plan generated successfully.');
      return plan;
    } catch (error) {
      showToast(
        getApiErrorMessage(error, 'Failed to generate diet plan.'),
        'error',
      );
      return null;
    }
  }, [generateDiet, showToast]);

  return {
    generate,
    isGenerating: state.isLoading,
  };
}
