'use client';

import { useState } from 'react';
import FitnessApiErrorState from '@/components/fitness/FitnessApiErrorState';
import FitnessModuleShell from '@/components/fitness/FitnessModuleShell';
import DailyScore from '@/components/fitness/execution/DailyScore';
import HydrationWidget from '@/components/fitness/execution/HydrationWidget';
import FinishWorkoutDialog from '@/components/fitness/workout/FinishWorkoutDialog';
import WorkoutHero from '@/components/fitness/workout/WorkoutHero';
import WorkoutHistoryDrawer from '@/components/fitness/workout/WorkoutHistoryDrawer';
import WorkoutPlayer from '@/components/fitness/workout/WorkoutPlayer';
import WorkoutProgress from '@/components/fitness/workout/WorkoutProgress';
import { useDailyCheckin } from '@/hooks/useDailyCheckin';
import { useHydration } from '@/hooks/useHydration';
import { useWorkoutExecution } from '@/hooks/useWorkoutExecution';
import { useWorkoutHistory } from '@/hooks/useWorkoutHistory';

export default function WorkoutPage() {
  const workout = useWorkoutExecution();
  const history = useWorkoutHistory();
  const checkin = useDailyCheckin();
  const hydration = useHydration();

  const [historyOpen, setHistoryOpen] = useState(false);
  const [finishOpen, setFinishOpen] = useState(false);

  if (workout.isLoading) {
    return (
      <FitnessModuleShell activeNav="workout">
        <div className="animate-pulse space-y-4">
          <div className="h-40 rounded-2xl bg-muted" />
          <div className="h-56 rounded-2xl bg-muted" />
          <div className="h-40 rounded-2xl bg-muted" />
        </div>
      </FitnessModuleShell>
    );
  }

  if (workout.isError && !workout.today) {
    return (
      <FitnessModuleShell activeNav="workout">
        <FitnessApiErrorState
          title="Could not load workout"
          message="Today's workout could not be loaded. Retry when your connection is available."
          onRetry={() => void workout.refetch()}
        />
      </FitnessModuleShell>
    );
  }

  return (
    <FitnessModuleShell activeNav="workout">
      <div className="space-y-6">
        <DailyScore checkin={checkin.checkin} isLoading={checkin.isLoading} />

        <WorkoutHero
          day={workout.today}
          status={workout.status}
          elapsedSeconds={workout.elapsedSeconds}
          analytics={workout.analytics}
          isStarting={workout.isStarting}
          isPausing={workout.isPausing}
          isResuming={workout.isResuming}
          isEnding={workout.isEnding}
          onStart={() => void workout.start()}
          onPause={() => void workout.pause()}
          onResume={() => void workout.resume()}
          onFinish={() => setFinishOpen(true)}
          onOpenHistory={() => setHistoryOpen(true)}
        />

        {!workout.today ? (
          <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-16 text-center">
            <h2 className="text-lg font-semibold text-foreground">
              No workout plan yet
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              Generate an AI workout plan, then start today&apos;s session to
              log sets, reps, and rest.
            </p>
            <button
              type="button"
              disabled={workout.isGenerating}
              onClick={() => void workout.generate()}
              className="mt-6 inline-flex items-center justify-center rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground shadow-[0_0_24px_var(--neon-glow)] transition-opacity hover:opacity-90 disabled:opacity-60 dark:text-black"
            >
              {workout.isGenerating ? 'Generating…' : 'Generate Workout Plan'}
            </button>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
            <WorkoutPlayer
              exercises={workout.exercises}
              status={workout.status}
              restSecondsLeft={workout.restSecondsLeft}
              activeExerciseId={workout.activeExerciseId}
              expandedExerciseId={workout.expandedExerciseId}
              isLoggingSet={workout.isLoggingSet}
              isCompletingExercise={workout.isCompletingExercise}
              onExpand={workout.setExpandedExerciseId}
              onClearRest={workout.clearRest}
              onLogSet={(exercise, values) =>
                workout.logExerciseSet(exercise, values)
              }
              onComplete={(exercise) =>
                workout.markExerciseComplete(exercise, false)
              }
              onSkip={(exercise) =>
                workout.markExerciseComplete(exercise, true)
              }
            />
            <aside className="space-y-4">
              <WorkoutProgress analytics={workout.analytics} />
              <HydrationWidget
                amountMl={hydration.amountMl}
                goalMl={hydration.goalMl}
                isLogging={hydration.isLogging}
                onAdd={async (amount) => {
                  const ok = await hydration.add(amount);
                  if (ok) void checkin.refresh();
                  return ok;
                }}
              />
            </aside>
          </div>
        )}
      </div>

      <FinishWorkoutDialog
        open={finishOpen}
        remainingRequired={workout.remainingRequired}
        durationMinutes={Math.max(1, Math.round(workout.elapsedSeconds / 60))}
        isSubmitting={workout.isEnding}
        onClose={() => setFinishOpen(false)}
        onConfirm={async (force) => {
          const ok = await workout.finish({ force });
          if (ok) {
            setFinishOpen(false);
            void checkin.refresh();
          }
          return ok;
        }}
      />

      <WorkoutHistoryDrawer
        open={historyOpen}
        items={history.items}
        isLoading={history.isLoading}
        onClose={() => setHistoryOpen(false)}
      />

      <HydrationWidget
        compact
        amountMl={hydration.amountMl}
        goalMl={hydration.goalMl}
        isLogging={hydration.isLogging}
        onAdd={async (amount) => {
          const ok = await hydration.add(amount);
          if (ok) void checkin.refresh();
          return ok;
        }}
      />
    </FitnessModuleShell>
  );
}
