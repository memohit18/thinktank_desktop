'use client';

import FitnessApiErrorState from '@/components/fitness/FitnessApiErrorState';
import FitnessModuleShell from '@/components/fitness/FitnessModuleShell';
import DietDashboard from '@/components/fitness/diet/DietDashboard';
import DietGenerateView from '@/components/fitness/diet/DietGenerateView';
import GenerationLoader from '@/components/fitness/diet/GenerationLoader';
import LoadingSkeleton from '@/components/fitness/diet/LoadingSkeleton';
import { useDiet } from '@/hooks/useDiet';

export default function DietPage() {
  const {
    diet,
    planner,
    hasDiet,
    isLoading,
    isError,
    refetch,
    history,
    isHistoryLoading,
    isGenerating,
    isRegenerating,
    isActivating,
    isDeleting,
    isUpdatingHydration,
    viewMode,
    isHistoryOpen,
    setIsHistoryOpen,
    generate,
    regenerate,
    activate,
    remove,
    addHydration,
    openDashboard,
    selectPlannerDate,
    isPlannerFetching,
  } = useDiet();

  if (isLoading) {
    return (
      <FitnessModuleShell activeNav="diet">
        <LoadingSkeleton />
      </FitnessModuleShell>
    );
  }

  if (isError) {
    return (
      <FitnessModuleShell activeNav="diet">
        <FitnessApiErrorState
          title="Could not load diet plan"
          message="Diet data could not be loaded from the server. Retry when your connection is available."
          onRetry={() => void refetch()}
        />
      </FitnessModuleShell>
    );
  }

  if (viewMode === 'generating') {
    return (
      <FitnessModuleShell activeNav="diet">
        <GenerationLoader isComplete={false} />
      </FitnessModuleShell>
    );
  }

  if (viewMode === 'ready') {
    return (
      <FitnessModuleShell activeNav="diet">
        <GenerationLoader isComplete onViewPlan={openDashboard} />
      </FitnessModuleShell>
    );
  }

  if (!hasDiet || !diet || viewMode === 'idle') {
    return (
      <FitnessModuleShell activeNav="diet">
        <DietGenerateView
          isGenerating={isGenerating}
          onGenerate={() => void generate()}
        />
      </FitnessModuleShell>
    );
  }

  return (
    <FitnessModuleShell activeNav="diet">
      <DietDashboard
        diet={diet}
        planner={planner}
        history={history}
        isHistoryLoading={isHistoryLoading}
        isHistoryOpen={isHistoryOpen}
        isRegenerating={isRegenerating || isGenerating}
        isActivating={isActivating}
        isDeleting={isDeleting}
        isUpdatingHydration={isUpdatingHydration}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onCloseHistory={() => setIsHistoryOpen(false)}
        onRegenerate={() => void regenerate()}
        onActivate={(id) => void activate(id)}
        onDelete={(id) => void remove(id)}
        onAddHydration={(amountMl) => void addHydration(amountMl)}
        onSelectPlannerDate={selectPlannerDate}
        isPlannerFetching={isPlannerFetching}
      />
    </FitnessModuleShell>
  );
}
