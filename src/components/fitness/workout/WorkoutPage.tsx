'use client';

import FitnessApiErrorState from '@/components/fitness/FitnessApiErrorState';
import FitnessModuleShell from '@/components/fitness/FitnessModuleShell';
import DailyScore from '@/components/fitness/execution/DailyScore';
import FloatingCoach from '@/components/fitness/execution/FloatingCoach';
import HydrationWidget from '@/components/fitness/execution/HydrationWidget';
import WorkoutPlayer from '@/components/fitness/workout/WorkoutPlayer';
import { useDailyCheckin } from '@/hooks/useDailyCheckin';
import { useHydration } from '@/hooks/useHydration';
import { useWorkoutExecution } from '@/hooks/useWorkoutExecution';

export default function WorkoutPage() {
  const workout = useWorkoutExecution();
  const checkin = useDailyCheckin();
  const hydration = useHydration();

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
          message="Active workout data could not be loaded. Retry when your connection is available."
          onRetry={() => void workout.refetch()}
        />
      </FitnessModuleShell>
    );
  }

  return (
    <FitnessModuleShell activeNav="workout">
      <div className="space-y-6">
        <DailyScore checkin={checkin.checkin} isLoading={checkin.isLoading} />

        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
          <WorkoutPlayer
            day={workout.today}
            status={workout.status}
            elapsedSeconds={workout.elapsedSeconds}
            restSecondsLeft={workout.restSecondsLeft}
            activeExerciseId={workout.activeExerciseId}
            completedCount={workout.completedCount}
            isStarting={workout.isStarting}
            isEnding={workout.isEnding}
            isCompletingExercise={workout.isCompletingExercise}
            onStart={() => void workout.start()}
            onPause={workout.pause}
            onResume={workout.resume}
            onFinish={() => void workout.finish()}
            onClearRest={workout.clearRest}
            onCompleteExercise={(exercise, values) =>
              workout.markExerciseComplete(exercise, values)
            }
          />
          <aside className="space-y-4">
            <HydrationWidget
              amountMl={hydration.amountMl}
              goalMl={hydration.goalMl}
              isLogging={hydration.isLogging}
              onAdd={hydration.add}
            />
            <div className="rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground">
              <p className="font-semibold text-foreground">Session tips</p>
              <p className="mt-2">
                Start the workout, log each exercise with sets/reps/weight, then
                finish to update today&apos;s score.
              </p>
            </div>
          </aside>
        </div>
      </div>

      <HydrationWidget
        compact
        amountMl={hydration.amountMl}
        goalMl={hydration.goalMl}
        isLogging={hydration.isLogging}
        onAdd={hydration.add}
      />
      <FloatingCoach />
    </FitnessModuleShell>
  );
}
