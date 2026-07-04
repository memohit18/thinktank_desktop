'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSettings } from '@/providers/SettingsProvider';
import type { FitForgeNavId } from '@/lib/fitforge/dietPlannerTypes';
import {
  useGetDietPlannerDashboardQuery,
  useSubmitDailyCheckinMutation,
} from '@/lib/services/fitforgeApi';
import { getApiErrorMessage } from '@/lib/services/getApiErrorMessage';
import { useToast } from '@/components/ui/Toast';

const NAV_ITEMS: {
  id: FitForgeNavId;
  label: string;
  icon: string;
}[] = [
  { id: 'roadmap', label: 'Roadmap', icon: '🗺️' },
  { id: 'diet-planner', label: 'Diet Planner', icon: '🥗' },
  { id: 'nutrition', label: 'Nutrition', icon: '📊' },
  { id: 'workouts', label: 'Workouts', icon: '🏋️' },
  { id: 'analytics', label: 'Analytics', icon: '📈' },
  { id: 'ai-coach', label: 'AI Coach', icon: '🤖' },
];

type FitForgeShellProps = {
  activeNav: FitForgeNavId;
  onNavChange: (nav: FitForgeNavId) => void;
  children: ReactNode;
};

export default function FitForgeShell({
  activeNav,
  onNavChange,
  children,
}: FitForgeShellProps) {
  const { isModuleEnabled } = useSettings();
  const { showToast } = useToast();
  const { data: dashboard } = useGetDietPlannerDashboardQuery();
  const [submitCheckin, { isLoading: isSubmittingCheckin }] =
    useSubmitDailyCheckinMutation();
  const [checkinOpen, setCheckinOpen] = useState(false);
  const [weightKg, setWeightKg] = useState('78');
  const [workoutCompleted, setWorkoutCompleted] = useState(true);

  if (!isModuleEnabled('fitforge')) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <p className="text-sm text-muted-foreground">
          FitForge module is disabled. Enable it in Settings → Modules.
        </p>
      </div>
    );
  }

  const mealsCompleted =
    dashboard?.meals.filter((meal) => meal.status === 'completed').length ?? 0;
  const mealsSkipped =
    dashboard?.meals.filter((meal) => meal.status === 'skipped').length ?? 0;

  async function handleCheckin() {
    const parsedWeight = Number(weightKg);
    if (!parsedWeight || parsedWeight <= 0) {
      showToast('Enter a valid weight.', 'error');
      return;
    }

    try {
      await submitCheckin({
        weightKg: parsedWeight,
        caloriesConsumed: dashboard?.caloriesConsumed ?? 0,
        proteinConsumed: dashboard?.proteinConsumed ?? 0,
        waterIntakeMl: dashboard?.hydrationMl ?? 0,
        mealsCompleted,
        mealsSkipped,
        workoutCompleted,
      }).unwrap();
      showToast('Daily check-in submitted.');
      setCheckinOpen(false);
    } catch (error) {
      showToast(getApiErrorMessage(error, 'Failed to submit check-in.'), 'error');
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-1 bg-background">
      <aside className="flex w-56 shrink-0 flex-col border-r border-border bg-card/40 p-4">
        <div className="mb-6">
          <p className="text-lg font-bold text-accent">FitForge Elite</p>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Performance: Level 42
          </p>
        </div>

        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = item.id === activeNav;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavChange(item.id)}
                className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <span aria-hidden>{item.icon}</span>
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto space-y-2 pt-6">
          <button
            type="button"
            onClick={() => setCheckinOpen(true)}
            className="w-full rounded-lg bg-accent px-3 py-2.5 text-xs font-bold uppercase tracking-wide text-accent-foreground"
          >
            Daily Check-in
          </button>
          <Link
            href="/settings"
            className="block rounded-lg px-3 py-2 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            Settings
          </Link>
          <button
            type="button"
            className="block w-full rounded-lg px-3 py-2 text-left text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            Support
          </button>
        </div>
      </aside>

      <div className="min-w-0 flex-1 overflow-y-auto">{children}</div>

      {checkinOpen ? (
        <CheckinModal
          weightKg={weightKg}
          onWeightChange={setWeightKg}
          workoutCompleted={workoutCompleted}
          onWorkoutChange={setWorkoutCompleted}
          mealsCompleted={mealsCompleted}
          mealsSkipped={mealsSkipped}
          caloriesConsumed={dashboard?.caloriesConsumed ?? 0}
          proteinConsumed={dashboard?.proteinConsumed ?? 0}
          waterIntakeMl={dashboard?.hydrationMl ?? 0}
          isSubmitting={isSubmittingCheckin}
          onClose={() => setCheckinOpen(false)}
          onSubmit={() => void handleCheckin()}
        />
      ) : null}
    </div>
  );
}

function CheckinModal({
  weightKg,
  onWeightChange,
  workoutCompleted,
  onWorkoutChange,
  mealsCompleted,
  mealsSkipped,
  caloriesConsumed,
  proteinConsumed,
  waterIntakeMl,
  isSubmitting,
  onClose,
  onSubmit,
}: {
  weightKg: string;
  onWeightChange: (value: string) => void;
  workoutCompleted: boolean;
  onWorkoutChange: (value: boolean) => void;
  mealsCompleted: number;
  mealsSkipped: number;
  caloriesConsumed: number;
  proteinConsumed: number;
  waterIntakeMl: number;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: () => void;
}) {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        aria-label="Close"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-md rounded-xl border border-border bg-card p-5 shadow-xl">
        <h3 className="text-sm font-bold uppercase tracking-wide text-foreground">
          Daily Check-in
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Submits POST /checkins with today&apos;s tracked values.
        </p>

        <label className="mt-4 block text-xs font-semibold text-muted-foreground">
          Weight (kg)
          <input
            type="number"
            value={weightKg}
            onChange={(event) => onWeightChange(event.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
          />
        </label>

        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
          <Stat label="Calories" value={`${caloriesConsumed} kcal`} />
          <Stat label="Protein" value={`${proteinConsumed}g`} />
          <Stat label="Water" value={`${(waterIntakeMl / 1000).toFixed(1)}L`} />
          <Stat label="Meals" value={`${mealsCompleted} done · ${mealsSkipped} skipped`} />
        </div>

        <label className="mt-4 flex items-center gap-2 text-xs text-foreground">
          <input
            type="checkbox"
            checked={workoutCompleted}
            onChange={(event) => onWorkoutChange(event.target.checked)}
          />
          Workout completed today
        </label>

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-border py-2 text-xs font-semibold text-foreground hover:bg-muted"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={isSubmitting}
            className="flex-1 rounded-lg bg-accent py-2 text-xs font-bold uppercase text-accent-foreground disabled:opacity-60"
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-muted/20 px-2 py-1.5">
      <p className="text-[10px] uppercase text-muted-foreground">{label}</p>
      <p className="font-semibold text-foreground">{value}</p>
    </div>
  );
}
