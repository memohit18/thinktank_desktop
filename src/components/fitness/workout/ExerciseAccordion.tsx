'use client';

import ExerciseCard from '@/components/fitness/workout/ExerciseCard';
import type { WorkoutExercise } from '@/lib/fitness/workout/types';

type ExerciseAccordionProps = {
  exercises: WorkoutExercise[];
  expandedId: string | null;
  activeExerciseId: string | null;
  disabled?: boolean;
  isLoggingSet?: boolean;
  isCompleting?: boolean;
  onExpand: (id: string | null) => void;
  onLogSet: (
    exercise: WorkoutExercise,
    values: { reps: number; weight: number },
  ) => void | Promise<boolean>;
  onComplete: (exercise: WorkoutExercise) => void | Promise<boolean>;
  onSkip: (exercise: WorkoutExercise) => void | Promise<boolean>;
};

export default function ExerciseAccordion({
  exercises,
  expandedId,
  activeExerciseId,
  disabled = false,
  isLoggingSet = false,
  isCompleting = false,
  onExpand,
  onLogSet,
  onComplete,
  onSkip,
}: ExerciseAccordionProps) {
  if (exercises.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-12 text-center text-sm text-muted-foreground">
        No exercises scheduled for today.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {exercises.map((exercise) => (
        <ExerciseCard
          key={exercise.id}
          exercise={exercise}
          expanded={expandedId === exercise.id}
          isActive={activeExerciseId === exercise.id}
          disabled={disabled}
          isLoggingSet={isLoggingSet && activeExerciseId === exercise.id}
          isCompleting={isCompleting && activeExerciseId === exercise.id}
          onToggle={() =>
            onExpand(expandedId === exercise.id ? null : exercise.id)
          }
          onLogSet={(values) => onLogSet(exercise, values)}
          onComplete={() => onComplete(exercise)}
          onSkip={() => onSkip(exercise)}
        />
      ))}
    </div>
  );
}
