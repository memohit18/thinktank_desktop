/** Detect duration / cardio-style prescriptions stored in the reps field. */
export function isDurationPrescription(targetReps: string | number | null | undefined) {
  if (targetReps == null) return false;
  const text = String(targetReps).toLowerCase();
  return (
    /min|minute|hour|sec|second|hold|jog|cycle|cardio|stretch|walk|run/.test(
      text,
    ) || /\d+\s*-\s*\d+\s*min/.test(text)
  );
}

export function formatExerciseTarget(exercise: {
  targetSets: number;
  targetReps: string | number | null;
  targetWeightKg?: number | null;
}) {
  const prescription = exercise.targetReps ?? '—';
  if (isDurationPrescription(exercise.targetReps)) {
    return exercise.targetSets > 1
      ? `${exercise.targetSets} × ${prescription}`
      : String(prescription);
  }
  const weight =
    exercise.targetWeightKg != null ? ` @ ${exercise.targetWeightKg}kg` : '';
  return `${exercise.targetSets}×${prescription}${weight}`;
}

/** Parse a rough duration in minutes from strings like "30-45 minutes". */
export function parseDurationMinutes(
  targetReps: string | number | null | undefined,
) {
  if (targetReps == null) return 30;
  const text = String(targetReps);
  const range = text.match(/(\d+)\s*-\s*(\d+)/);
  if (range) return Number(range[1]);
  const single = text.match(/(\d+)/);
  return single ? Number(single[1]) : 30;
}
