'use client';

import ExerciseAccordion from '@/components/fitness/workout/ExerciseAccordion';
import RestTimer from '@/components/fitness/workout/RestTimer';
import type { WorkoutExercise } from '@/lib/fitness/workout/types';

type WorkoutPlayerProps = {
  exercises: WorkoutExercise[];
  status: 'idle' | 'active' | 'paused' | 'finished';
  restSecondsLeft: number;
  activeExerciseId: string | null;
  expandedExerciseId: string | null;
  isLoggingSet?: boolean;
  isCompletingExercise?: boolean;
  onExpand: (id: string | null) => void;
  onClearRest: () => void;
  onLogSet: (
    exercise: WorkoutExercise,
    values: { reps: number; weight: number },
  ) => void | Promise<boolean>;
  onComplete: (exercise: WorkoutExercise) => void | Promise<boolean>;
  onSkip: (exercise: WorkoutExercise) => void | Promise<boolean>;
};

export default function WorkoutPlayer({
  exercises,
  status,
  restSecondsLeft,
  activeExerciseId,
  expandedExerciseId,
  isLoggingSet = false,
  isCompletingExercise = false,
  onExpand,
  onClearRest,
  onLogSet,
  onComplete,
  onSkip,
}: WorkoutPlayerProps) {
  const sessionLive = status === 'active' || status === 'paused';

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-base font-semibold text-foreground">
          Exercise List
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Expand an exercise to log sets, reps, and weight.
          {!sessionLive
            ? ' Start the workout to enable logging.'
            : status === 'paused'
              ? ' Resume to continue logging.'
              : ''}
        </p>
      </div>

      <RestTimer secondsLeft={restSecondsLeft} onSkip={onClearRest} />

      <ExerciseAccordion
        exercises={exercises}
        expandedId={expandedExerciseId}
        activeExerciseId={activeExerciseId}
        disabled={!sessionLive || status === 'paused'}
        isLoggingSet={isLoggingSet}
        isCompleting={isCompletingExercise}
        onExpand={onExpand}
        onLogSet={onLogSet}
        onComplete={onComplete}
        onSkip={onSkip}
      />
    </section>
  );
}
