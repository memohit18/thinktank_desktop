'use client';

import AchievementCard from '@/components/fitness/dashboard/AchievementCard';
import ComplianceCard from '@/components/fitness/dashboard/ComplianceCard';
import DashboardHero from '@/components/fitness/dashboard/DashboardHero';
import DashboardSkeleton from '@/components/fitness/dashboard/DashboardSkeleton';
import MacroSummary from '@/components/fitness/dashboard/MacroSummary';
import MealProgress from '@/components/fitness/dashboard/MealProgress';
import QuickActions from '@/components/fitness/dashboard/QuickActions';
import TodaysTasks from '@/components/fitness/dashboard/TodaysTasks';
import WaterTracker from '@/components/fitness/dashboard/WaterTracker';
import WorkoutProgress from '@/components/fitness/dashboard/WorkoutProgress';
import FitnessApiErrorState from '@/components/fitness/FitnessApiErrorState';
import FitnessModuleShell from '@/components/fitness/FitnessModuleShell';
import FloatingCoach from '@/components/fitness/execution/FloatingCoach';
import { useCompliance } from '@/hooks/useCompliance';
import { useDashboard } from '@/hooks/useDashboard';
import { useHydration } from '@/hooks/useHydration';

export default function DashboardPage() {
  const dashboard = useDashboard();
  const compliance = useCompliance();
  const hydration = useHydration();

  if (dashboard.isLoading && !dashboard.dashboard) {
    return (
      <FitnessModuleShell activeNav="dashboard">
        <DashboardSkeleton />
      </FitnessModuleShell>
    );
  }

  if (dashboard.isError && !dashboard.dashboard) {
    return (
      <FitnessModuleShell activeNav="dashboard">
        <FitnessApiErrorState
          title="Could not load dashboard"
          message="Today's execution data could not be loaded. Retry when your connection is available."
          onRetry={() => void dashboard.refetch()}
        />
      </FitnessModuleShell>
    );
  }

  const data = dashboard.dashboard;
  const water = {
    currentMl: hydration.hydration
      ? hydration.amountMl
      : (data?.water.currentMl ?? 0),
    goalMl: hydration.hydration
      ? hydration.goalMl
      : (data?.water.targetMl ?? data?.water.goalMl ?? 3500),
    targetMl: hydration.hydration
      ? hydration.goalMl
      : (data?.water.targetMl ?? data?.water.goalMl ?? 3500),
    remainingMl: hydration.hydration
      ? hydration.remainingMl
      : (data?.water.remainingMl ?? 3500),
    percent: hydration.hydration
      ? hydration.percent
      : (data?.water.percent ?? 0),
  };

  return (
    <FitnessModuleShell activeNav="dashboard">
      <div className="space-y-6">
        <DashboardHero
          score={dashboard.todayScore}
          compliancePercent={
            compliance.percent ?? dashboard.compliancePercent
          }
          streakDays={
            compliance.currentStreak ?? dashboard.currentStreak
          }
          dateLabel={data?.date}
          isRefreshing={dashboard.isRefreshing || dashboard.isFetching}
          onRefresh={() => void dashboard.refresh()}
        />

        <div className="grid gap-4 lg:grid-cols-3">
          {data?.meals ? <MealProgress meals={data.meals} /> : null}
          {data?.workout ? <WorkoutProgress workout={data.workout} /> : null}
          <WaterTracker
            water={water}
            isLogging={hydration.isLogging}
            onAdd={hydration.add}
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-4">
            {data?.calories && data?.protein ? (
              <MacroSummary
                calories={data.calories}
                protein={data.protein}
              />
            ) : null}
            <ComplianceCard
              compliancePercent={
                compliance.percent ?? dashboard.compliancePercent
              }
              streakDays={
                compliance.currentStreak ?? dashboard.currentStreak
              }
              longestStreak={
                compliance.longestStreak ?? dashboard.longestStreak
              }
              detail={compliance.detail}
              tone={compliance.tone}
            />
            <TodaysTasks tasks={dashboard.tasks} />
          </div>

          <div className="space-y-4">
            <QuickActions />
            <section className="rounded-2xl border border-border bg-card p-4">
              <div className="mb-3">
                <h3 className="text-sm font-semibold text-foreground">
                  Achievements
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Unlocks as you execute today&apos;s plan.
                </p>
              </div>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                {dashboard.achievements.length ? (
                  dashboard.achievements.map((achievement) => (
                    <AchievementCard
                      key={achievement.id}
                      achievement={achievement}
                    />
                  ))
                ) : (
                  <p className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-8 text-center text-sm text-muted-foreground">
                    Achievements will appear as you build consistency.
                  </p>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>

      <FloatingCoach />
    </FitnessModuleShell>
  );
}
