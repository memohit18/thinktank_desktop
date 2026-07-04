'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import type {
  DietPlannerDashboard,
  DietPlannerMeal,
  SwapSuggestion,
} from '@/lib/fitforge/dietPlannerTypes';
import type { ApiFoodItem } from '@/lib/fitforge/dietPlannerApiTypes';
import {
  useApplyCoachSuggestionsMutation,
  useCreateAiSessionMutation,
  useGenerateMealPlanMutation,
  useGetDietHistoryQuery,
  useGetDietPlannerDashboardQuery,
  useLazyGetActiveDietPlanQuery,
  useLazyGetActiveMealPlanQuery,
  useLazySearchFoodsQuery,
  useLogMealStatusMutation,
  usePatchHydrationMutation,
} from '@/lib/services/fitforgeApi';
import { getApiErrorMessage } from '@/lib/services/getApiErrorMessage';
import { useToast } from '@/components/ui/Toast';

const HYDRATION_INCREMENTS: { label: string; amountMl: number }[] = [
  { label: '+250ml', amountMl: 250 },
  { label: '+500ml', amountMl: 500 },
  { label: '+750ml', amountMl: 750 },
  { label: '+1L', amountMl: 1000 },
];

export default function DietPlannerPage() {
  const { showToast } = useToast();
  const { data, isLoading, isError, refetch, isFetching } =
    useGetDietPlannerDashboardQuery();
  const [logMeal, { isLoading: isLogging }] = useLogMealStatusMutation();
  const [patchHydration, { isLoading: isHydrating }] =
    usePatchHydrationMutation();
  const [generatePlan, { isLoading: isGenerating }] =
    useGenerateMealPlanMutation();
  const [createAiSession] = useCreateAiSessionMutation();
  const [applyCoach, { isLoading: isApplyingCoach }] =
    useApplyCoachSuggestionsMutation();

  const [historyOpen, setHistoryOpen] = useState(false);
  const [editPlanOpen, setEditPlanOpen] = useState(false);
  const [foodSearchOpen, setFoodSearchOpen] = useState(false);
  const [foodSearchQuery, setFoodSearchQuery] = useState('');
  const [swapContext, setSwapContext] = useState<{
    mealPlanItemId: string;
    category?: string;
  } | null>(null);

  const aiSessionIdRef = useRef<string | null>(null);

  const [fetchActiveDiet, activeDietState] = useLazyGetActiveDietPlanQuery();
  const [fetchActiveMealPlan, activeMealPlanState] =
    useLazyGetActiveMealPlanQuery();
  const [searchFoods, foodSearchState] = useLazySearchFoodsQuery();

  const handleGenerate = async () => {
    if (!data?.dietPlanId) {
      showToast('No active diet plan. Complete fitness setup on the server first.', 'error');
      return;
    }
    try {
      await generatePlan({ dietPlanId: data.dietPlanId }).unwrap();
      showToast('Meal plan generated.');
      await refetch();
    } catch (error) {
      showToast(getApiErrorMessage(error, 'Failed to generate meal plan.'), 'error');
    }
  };

  const handleToggleMeal = async (meal: DietPlannerMeal) => {
    if (meal.status === 'completed') return;

    try {
      await logMeal({ mealPlanItemId: meal.id, status: 'completed' }).unwrap();
      await refetch();
    } catch (error) {
      showToast(getApiErrorMessage(error, 'Failed to log meal.'), 'error');
    }
  };

  const handleSkipMeal = async (meal: DietPlannerMeal) => {
    try {
      await logMeal({ mealPlanItemId: meal.id, status: 'skipped' }).unwrap();
      showToast('Meal skipped.');
      await refetch();
    } catch (error) {
      showToast(getApiErrorMessage(error, 'Failed to skip meal.'), 'error');
    }
  };

  const handleSwapMeal = async (
    mealPlanItemId: string,
    replacementFoodId: string,
  ) => {
    try {
      await logMeal({
        mealPlanItemId,
        status: 'replaced',
        replacementFoodId,
      }).unwrap();
      showToast('Meal swapped.');
      setFoodSearchOpen(false);
      setSwapContext(null);
      await refetch();
    } catch (error) {
      showToast(getApiErrorMessage(error, 'Failed to swap meal.'), 'error');
    }
  };

  const handleHydration = async (amountMl: number) => {
    try {
      await patchHydration({ amountMl }).unwrap();
      await refetch();
    } catch (error) {
      showToast(getApiErrorMessage(error, 'Failed to update hydration.'), 'error');
    }
  };

  const handleApplyCoach = async () => {
    try {
      if (!aiSessionIdRef.current) {
        const session = await createAiSession({
          title: 'Diet Planner Coach',
        }).unwrap();
        aiSessionIdRef.current = session.id;
      }

      const response = await applyCoach({
        sessionId: aiSessionIdRef.current,
        message:
          'Apply your lunch protein suggestions — swap my side for Greek yogurt to hit my protein target.',
      }).unwrap();

      const reply =
        response.reply ?? response.message ?? response.content ?? 'Suggestions applied.';
      showToast(reply.slice(0, 120));
      await refetch();
    } catch (error) {
      showToast(getApiErrorMessage(error, 'Failed to apply coach suggestions.'), 'error');
    }
  };

  const openEditPlan = () => {
    setEditPlanOpen(true);
    void fetchActiveDiet();
    void fetchActiveMealPlan();
  };

  const openFoodSearch = useCallback(
    (query: string, context?: { mealPlanItemId: string; category?: string }) => {
      setFoodSearchQuery(query);
      setSwapContext(context ?? null);
      setFoodSearchOpen(true);
      if (query.trim()) {
        void searchFoods({ search: query.trim(), page: 1, limit: 20 });
      }
    },
    [searchFoods],
  );

  useEffect(() => {
    if (!foodSearchOpen) return;
    const timer = window.setTimeout(() => {
      if (foodSearchQuery.trim()) {
        void searchFoods({
          search: foodSearchQuery.trim(),
          category: swapContext?.category,
          page: 1,
          limit: 20,
        });
      }
    }, 300);
    return () => window.clearTimeout(timer);
  }, [foodSearchOpen, foodSearchQuery, swapContext?.category, searchFoods]);

  if (isLoading) {
    return (
      <div className="p-8 text-sm text-muted-foreground">
        Loading diet planner...
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-8 text-sm text-red-500">Failed to load diet planner.</div>
    );
  }

  const hasMeals = data.meals.length > 0;

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <span className="rounded-md border border-border bg-muted/40 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            {data.planLabel}
          </span>
          <input
            type="search"
            placeholder="Search nutrients..."
            className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground outline-none focus:border-accent"
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                openFoodSearch((event.target as HTMLInputElement).value);
              }
            }}
            onFocus={(event) => openFoodSearch(event.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setHistoryOpen(true)}
            className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted"
          >
            History
          </button>
          <button
            type="button"
            onClick={openEditPlan}
            disabled={isFetching}
            className="rounded-lg bg-accent px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-accent-foreground disabled:opacity-60"
          >
            Edit Plan
          </button>
        </div>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-black uppercase tracking-tight text-foreground lg:text-3xl">
          {data.phaseTitle}
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          {data.phaseDescription}
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_280px]">
        <TargetCard
          label="Daily Energy"
          value={`${data.dailyCalorieTarget.toLocaleString()} KCAL`}
          sub={`${data.caloriesConsumed.toLocaleString()} kcal consumed (${Math.max(0, data.dailyCalorieTarget - data.caloriesConsumed).toLocaleString()} remaining)`}
          icon="⚡"
        />
        <TargetCard
          label="Protein Goal"
          value={`${data.proteinTarget} GRAMS (P/D)`}
          sub={`${data.proteinConsumed}g tracked (${Math.max(0, data.proteinTarget - data.proteinConsumed)}g remaining)`}
          icon="💪"
        />
        <AiCoachCard
          message={data.aiCoachMessage}
          loading={isApplyingCoach}
          onApply={() => void handleApplyCoach()}
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,0.7fr)]">
        <section>
          <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Meal Distribution
          </h2>

          {!hasMeals ? (
            <div className="rounded-xl border border-dashed border-border p-8 text-center">
              <p className="text-sm font-semibold text-foreground">No meals scheduled today</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Generate a meal plan to see your daily distribution.
              </p>
              <button
                type="button"
                onClick={() => void handleGenerate()}
                disabled={isGenerating}
                className="mt-4 rounded-lg bg-accent px-4 py-2 text-xs font-bold uppercase text-accent-foreground"
              >
                {isGenerating ? 'Generating...' : 'Generate Meal Plan'}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {data.meals.map((meal) => (
                <MealCard
                  key={meal.id}
                  meal={meal}
                  disabled={isLogging}
                  onToggle={() => void handleToggleMeal(meal)}
                  onSkip={() => void handleSkipMeal(meal)}
                  onSwap={() =>
                    openFoodSearch(meal.description, { mealPlanItemId: meal.id })
                  }
                />
              ))}
            </div>
          )}
        </section>

        <aside className="space-y-4">
          <HydrationHub
            currentMl={data.hydrationMl}
            targetMl={data.hydrationTargetMl}
            disabled={isHydrating}
            onAdd={(amountMl) => void handleHydration(amountMl)}
          />
          <MacroSwapHub
            swap={data.swapSuggestion}
            onExplore={() => {
              if (data.swapSuggestion?.suggestedName) {
                openFoodSearch(data.swapSuggestion.suggestedName, {
                  mealPlanItemId: data.swapSuggestion.mealPlanItemId ?? '',
                  category: 'carb',
                });
              } else {
                openFoodSearch('sweet potato', { mealPlanItemId: '', category: 'carb' });
              }
            }}
            onApplySwap={() => {
              const swap = data.swapSuggestion;
              if (swap?.mealPlanItemId && swap.replacementFoodId) {
                void handleSwapMeal(swap.mealPlanItemId, swap.replacementFoodId);
              } else {
                showToast('No swap suggestion available.', 'error');
              }
            }}
          />
          <VitalsCheck
            fiberPercent={data.fiberPercent}
            sodiumLevel={data.sodiumLevel}
            caffeineMg={data.caffeineMg}
          />
        </aside>
      </div>

      <HistoryModal open={historyOpen} onClose={() => setHistoryOpen(false)} />

      <EditPlanModal
        open={editPlanOpen}
        onClose={() => setEditPlanOpen(false)}
        dietData={activeDietState.data}
        mealPlanData={activeMealPlanState.data}
        isLoading={activeDietState.isFetching || activeMealPlanState.isFetching}
        isError={activeDietState.isError || activeMealPlanState.isError}
      />

      <FoodSearchModal
        open={foodSearchOpen}
        onClose={() => {
          setFoodSearchOpen(false);
          setSwapContext(null);
        }}
        query={foodSearchQuery}
        onQueryChange={setFoodSearchQuery}
        foods={foodSearchState.data?.items ?? []}
        isLoading={foodSearchState.isFetching}
        swapContext={swapContext}
        onSelectFood={(food) => {
          if (swapContext?.mealPlanItemId) {
            void handleSwapMeal(swapContext.mealPlanItemId, food.id);
          } else {
            showToast(`Selected: ${food.name}`);
            setFoodSearchOpen(false);
          }
        }}
      />
    </div>
  );
}

function TargetCard({
  label,
  value,
  sub,
  icon,
}: {
  label: string;
  value: string;
  sub: string;
  icon: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            {label}
          </p>
          <p className="mt-2 text-xl font-black text-foreground">{value}</p>
          <p className="mt-1 text-[11px] text-muted-foreground">{sub}</p>
        </div>
        <span className="text-xl" aria-hidden>
          {icon}
        </span>
      </div>
    </div>
  );
}

function AiCoachCard({
  message,
  loading,
  onApply,
}: {
  message: string;
  loading: boolean;
  onApply: () => void;
}) {
  return (
    <div className="rounded-xl border border-accent/30 bg-accent/5 p-4">
      <p className="text-[10px] font-bold uppercase tracking-widest text-accent">
        AI Coach Athena
      </p>
      <p className="mt-2 text-xs leading-relaxed text-foreground">{message}</p>
      <button
        type="button"
        onClick={onApply}
        disabled={loading}
        className="mt-3 rounded-lg border border-accent/40 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-accent disabled:opacity-60"
      >
        {loading ? 'Applying...' : 'Apply Suggestions'}
      </button>
    </div>
  );
}

function MealCard({
  meal,
  onToggle,
  onSkip,
  onSwap,
  disabled,
}: {
  meal: DietPlannerMeal;
  onToggle: () => void;
  onSkip: () => void;
  onSwap: () => void;
  disabled: boolean;
}) {
  const done = meal.status === 'completed';
  const skipped = meal.status === 'skipped';

  return (
    <div
      className={`flex gap-4 rounded-xl border p-4 transition-colors ${
        done ? 'border-accent/30 bg-accent/5' : skipped ? 'border-border bg-muted/20 opacity-70' : 'border-border bg-card'
      }`}
    >
      <div className="flex size-16 shrink-0 items-center justify-center rounded-lg bg-muted text-2xl">
        {meal.slot === 'breakfast' ? '🥞' : meal.slot === 'lunch' ? '🍗' : meal.slot === 'snack' ? '🥤' : '🥗'}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-bold text-foreground">{meal.title}</p>
          <span className="text-[10px] text-muted-foreground">{meal.time}</span>
          {meal.isCritical ? (
            <span className="rounded bg-accent px-1.5 py-0.5 text-[9px] font-bold uppercase text-accent-foreground">
              Critical
            </span>
          ) : null}
          {skipped ? (
            <span className="rounded bg-muted px-1.5 py-0.5 text-[9px] font-bold uppercase text-muted-foreground">
              Skipped
            </span>
          ) : null}
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">{meal.description}</p>
        <div className="mt-2 flex flex-wrap gap-3 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          <span>{meal.calories} Kcal</span>
          <span>{meal.protein}g P</span>
          <span>{meal.carbs}g C</span>
          <span>{meal.fats}g F</span>
        </div>
        {!done && !skipped ? (
          <button
            type="button"
            onClick={onSkip}
            disabled={disabled}
            className="mt-2 text-[10px] font-semibold uppercase text-muted-foreground hover:text-foreground disabled:opacity-50"
          >
            Skip meal
          </button>
        ) : null}
      </div>
      <div className="flex shrink-0 flex-col items-end gap-2">
        <button
          type="button"
          onClick={onSwap}
          disabled={disabled}
          className="text-muted-foreground hover:text-foreground disabled:opacity-50"
          aria-label="Swap meal"
        >
          ⇄
        </button>
        <button
          type="button"
          disabled={disabled || skipped}
          onClick={onToggle}
          className={`flex size-8 items-center justify-center rounded-full border-2 transition-colors disabled:opacity-50 ${
            done
              ? 'border-accent bg-accent text-accent-foreground'
              : 'border-border text-transparent hover:border-muted-foreground'
          }`}
          aria-label={done ? 'Meal completed' : 'Mark meal complete'}
        >
          ✓
        </button>
      </div>
    </div>
  );
}

function HydrationHub({
  currentMl,
  targetMl,
  disabled,
  onAdd,
}: {
  currentMl: number;
  targetMl: number;
  disabled: boolean;
  onAdd: (amountMl: number) => void;
}) {
  const liters = (currentMl / 1000).toFixed(1);
  const targetLiters = (targetMl / 1000).toFixed(0);
  const percent = Math.min(100, Math.round((currentMl / targetMl) * 100));

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
        Hydration Hub
      </p>
      <p className="mt-2 text-lg font-black text-foreground">
        {liters}/{targetLiters}L
      </p>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
        <div className="h-full bg-sky-500" style={{ width: `${percent}%` }} />
      </div>
      <div className="mt-3 grid grid-cols-4 gap-1.5">
        {HYDRATION_INCREMENTS.map(({ label, amountMl }) => (
          <button
            key={label}
            type="button"
            disabled={disabled}
            onClick={() => onAdd(amountMl)}
            className="rounded-md border border-border py-1 text-[9px] font-semibold text-muted-foreground hover:bg-muted disabled:opacity-50"
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

function MacroSwapHub({
  swap,
  onExplore,
  onApplySwap,
}: {
  swap?: SwapSuggestion;
  onExplore: () => void;
  onApplySwap: () => void;
}) {
  const original = swap?.originalName ?? 'White Rice';
  const suggested = swap?.suggestedName ?? 'Sweet Potato';

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
        Macro Swap Hub
      </p>
      <div className="mt-3 grid grid-cols-2 gap-2 text-center text-xs">
        <div className="rounded-lg border border-border bg-muted/30 p-2">
          <p className="text-[10px] text-muted-foreground">Original</p>
          <p className="font-semibold text-foreground">{original}</p>
        </div>
        <div className="rounded-lg border border-accent/30 bg-accent/5 p-2">
          <p className="text-[10px] text-accent">Swap</p>
          <p className="font-semibold text-foreground">{suggested}</p>
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={onExplore}
          className="flex-1 rounded-lg border border-border py-1.5 text-[10px] font-bold uppercase tracking-wide text-foreground hover:bg-muted"
        >
          Explore Alternatives
        </button>
        {swap?.replacementFoodId ? (
          <button
            type="button"
            onClick={onApplySwap}
            className="flex-1 rounded-lg border border-accent/40 py-1.5 text-[10px] font-bold uppercase tracking-wide text-accent hover:bg-accent/5"
          >
            Apply Swap
          </button>
        ) : null}
      </div>
    </div>
  );
}

function VitalsCheck({
  fiberPercent,
  sodiumLevel,
  caffeineMg,
}: Pick<DietPlannerDashboard, 'fiberPercent' | 'sodiumLevel' | 'caffeineMg'>) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
        Vitals Check
      </p>
      <div className="mt-3 space-y-3">
        <VitalRow label="Fiber" value={`${fiberPercent}%`} percent={fiberPercent} tone="success" />
        <VitalRow
          label="Sodium"
          value={sodiumLevel === 'high' ? 'High' : 'OK'}
          percent={sodiumLevel === 'high' ? 85 : 45}
          tone={sodiumLevel === 'high' ? 'danger' : 'warning'}
        />
        <VitalRow label="Caffeine" value={`${caffeineMg}mg`} percent={60} tone="warning" />
      </div>
    </div>
  );
}

function VitalRow({
  label,
  value,
  percent,
  tone,
}: {
  label: string;
  value: string;
  percent: number;
  tone: 'success' | 'warning' | 'danger';
}) {
  const barColor =
    tone === 'success'
      ? 'bg-accent'
      : tone === 'danger'
        ? 'bg-red-500'
        : 'bg-amber-400';

  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold text-foreground">{value}</span>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
        <div className={`h-full ${barColor}`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

function OverlayModal({
  open,
  onClose,
  title,
  children,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        aria-label="Close modal"
        onClick={onClose}
      />
      <div
        className={`relative z-10 max-h-[80vh] overflow-y-auto rounded-xl border border-border bg-card p-5 shadow-xl ${
          wide ? 'w-full max-w-2xl' : 'w-full max-w-lg'
        }`}
      >
        <div className="mb-4 flex items-center justify-between gap-4">
          <h3 className="text-sm font-bold uppercase tracking-wide text-foreground">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function HistoryModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data, isLoading, isError } = useGetDietHistoryQuery(
    { page: 1, limit: 20 },
    { skip: !open },
  );

  return (
    <OverlayModal open={open} onClose={onClose} title="Diet History">
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading history...</p>
      ) : isError ? (
        <p className="text-sm text-red-500">Failed to load diet history.</p>
      ) : !data?.items?.length ? (
        <p className="text-sm text-muted-foreground">No diet history yet.</p>
      ) : (
        <ul className="space-y-2">
          {data.items.map((item) => (
            <li
              key={item.id}
              className="rounded-lg border border-border px-3 py-2 text-xs"
            >
              <p className="font-semibold text-foreground">
                {item.goal ?? `Plan v${item.version ?? '—'}`}
              </p>
              <p className="text-muted-foreground">
                {item.status ?? 'unknown'}
                {item.createdAt ? ` · ${new Date(item.createdAt).toLocaleDateString()}` : ''}
              </p>
            </li>
          ))}
        </ul>
      )}
    </OverlayModal>
  );
}

function EditPlanModal({
  open,
  onClose,
  dietData,
  mealPlanData,
  isLoading,
  isError,
}: {
  open: boolean;
  onClose: () => void;
  dietData: unknown;
  mealPlanData: unknown;
  isLoading: boolean;
  isError: boolean;
}) {
  return (
    <OverlayModal open={open} onClose={onClose} title="Edit Plan" wide>
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading active plans...</p>
      ) : isError ? (
        <p className="text-sm text-red-500">Failed to load active diet or meal plan.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <PlanJsonPanel title="Active Diet (GET /diet/active)" data={dietData} />
          <PlanJsonPanel title="Active Meal Plan (GET /meal-plans/active)" data={mealPlanData} />
        </div>
      )}
      <p className="mt-4 text-[11px] text-muted-foreground">
        Use PUT /meal-plans/items/:id to edit individual items from this data.
      </p>
    </OverlayModal>
  );
}

function PlanJsonPanel({ title, data }: { title: string; data: unknown }) {
  return (
    <div className="rounded-lg border border-border bg-muted/20 p-3">
      <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
        {title}
      </p>
      <pre className="max-h-64 overflow-auto text-[10px] leading-relaxed text-foreground">
        {data ? JSON.stringify(data, null, 2) : 'No active plan'}
      </pre>
    </div>
  );
}

function FoodSearchModal({
  open,
  onClose,
  query,
  onQueryChange,
  foods,
  isLoading,
  swapContext,
  onSelectFood,
}: {
  open: boolean;
  onClose: () => void;
  query: string;
  onQueryChange: (value: string) => void;
  foods: ApiFoodItem[];
  isLoading: boolean;
  swapContext: { mealPlanItemId: string; category?: string } | null;
  onSelectFood: (food: ApiFoodItem) => void;
}) {
  return (
    <OverlayModal
      open={open}
      onClose={onClose}
      title={swapContext?.mealPlanItemId ? 'Swap Food' : 'Search Nutrients'}
      wide
    >
      <input
        type="search"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder="Search foods..."
        className="mb-4 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
        autoFocus
      />
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Searching...</p>
      ) : !foods.length ? (
        <p className="text-sm text-muted-foreground">
          {query.trim() ? 'No foods found.' : 'Type to search nutrients.'}
        </p>
      ) : (
        <ul className="space-y-2">
          {foods.map((food) => (
            <li key={food.id}>
              <button
                type="button"
                onClick={() => onSelectFood(food)}
                className="flex w-full items-center justify-between rounded-lg border border-border px-3 py-2 text-left text-sm hover:bg-muted"
              >
                <span className="font-medium text-foreground">{food.name}</span>
                <span className="text-xs text-muted-foreground">
                  {food.calories != null ? `${food.calories} kcal` : food.category ?? ''}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </OverlayModal>
  );
}
