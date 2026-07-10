'use client';

import { useCallback, useMemo, useState } from 'react';
import { useActiveDiet } from '@/hooks/useActiveDiet';
import { useDietActions } from '@/hooks/useDietActions';
import { useDietHistory } from '@/hooks/useDietHistory';
import { useDietPlanner } from '@/hooks/useDietPlanner';
import { useGenerateDiet } from '@/hooks/useGenerateDiet';
import { useRegenerateDiet } from '@/hooks/useRegenerateDiet';
import { useUpdateDietHydration } from '@/hooks/useUpdateDietHydration';
import { mergeDietView } from '@/lib/fitness/diet/dietResponse';

export type DietViewMode = 'idle' | 'generating' | 'ready' | 'dashboard';

export function useDiet() {
  const active = useActiveDiet();
  const [plannerDate, setPlannerDate] = useState<string | undefined>(undefined);
  const planner = useDietPlanner({
    date: plannerDate,
    skip: !active.hasDiet,
  });
  const history = useDietHistory();
  const { generate, isGenerating } = useGenerateDiet();
  const { regenerate, isRegenerating } = useRegenerateDiet();
  const { activate, remove, isActivating, isDeleting } = useDietActions();
  const { addHydration, isUpdating: isUpdatingHydration } =
    useUpdateDietHydration();

  const [viewMode, setViewMode] = useState<DietViewMode | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const diet = useMemo(
    () => mergeDietView(active.diet, planner.planner),
    [active.diet, planner.planner],
  );

  const hasDiet = Boolean(active.hasDiet || planner.planner?.dietPlanId);
  const resolvedMode: DietViewMode =
    viewMode ?? (hasDiet ? 'dashboard' : 'idle');

  const isLoading =
    active.isLoading || (active.hasDiet && planner.isLoading && !planner.planner);

  const isError = active.isError || (active.hasDiet && planner.isError);

  const refetchAll = useCallback(async () => {
    await Promise.all([
      active.refetch(),
      planner.refetch(),
      history.refetch(),
    ]);
  }, [active, history, planner]);

  const handleGenerate = useCallback(async () => {
    setViewMode('generating');
    const plan = await generate();
    if (!plan) {
      setViewMode(hasDiet ? 'dashboard' : 'idle');
      return false;
    }
    setViewMode('ready');
    await refetchAll();
    return true;
  }, [generate, hasDiet, refetchAll]);

  const handleRegenerate = useCallback(async () => {
    setViewMode('generating');
    const plan = await regenerate();
    if (!plan) {
      setViewMode('dashboard');
      return false;
    }
    setViewMode('ready');
    await refetchAll();
    return true;
  }, [refetchAll, regenerate]);

  const handleActivate = useCallback(
    async (dietPlanId: string) => {
      const plan = await activate(dietPlanId);
      if (!plan) return false;
      setIsHistoryOpen(false);
      setViewMode('dashboard');
      await refetchAll();
      return true;
    },
    [activate, refetchAll],
  );

  const handleDelete = useCallback(
    async (dietPlanId: string) => {
      const ok = await remove(dietPlanId);
      if (!ok) return false;
      await refetchAll();
      if (dietPlanId === diet?.id) {
        setViewMode('idle');
        setIsHistoryOpen(false);
      }
      return true;
    },
    [diet?.id, refetchAll, remove],
  );

  const handleHydration = useCallback(
    async (amountMl = 250) => {
      const result = await addHydration(amountMl);
      if (result) {
        await planner.refetch();
      }
      return Boolean(result);
    },
    [addHydration, planner],
  );

  const openDashboard = useCallback(() => {
    setViewMode('dashboard');
  }, []);

  const selectPlannerDate = useCallback((date: string) => {
    setPlannerDate(date);
  }, []);

  return {
    diet,
    planner: planner.planner,
    hasDiet,
    isLoading,
    isFetching: active.isFetching || planner.isFetching,
    isPlannerFetching: planner.isFetching,
    isError,
    refetch: refetchAll,
    history: history.history,
    historyMeta: history.meta,
    isHistoryLoading: history.isLoading,
    isGenerating: isGenerating || resolvedMode === 'generating',
    isRegenerating,
    isActivating,
    isDeleting,
    isUpdatingHydration,
    viewMode: resolvedMode,
    isHistoryOpen,
    setIsHistoryOpen,
    generate: handleGenerate,
    regenerate: handleRegenerate,
    activate: handleActivate,
    remove: handleDelete,
    addHydration: handleHydration,
    openDashboard,
    selectPlannerDate,
  };
}
