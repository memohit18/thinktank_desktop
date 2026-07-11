export type WorkoutSetLog = {
  id: string;
  setNumber: number;
  reps: number | null;
  weightKg: number | null;
  completed: boolean;
  restSeconds?: number | null;
  createdAt?: string | null;
};

export type WorkoutExercise = {
  id: string;
  name: string;
  targetSets: number;
  targetReps: string | number | null;
  targetWeightKg: number | null;
  restSeconds: number;
  notes?: string | null;
  order: number;
  completed: boolean;
  skipped: boolean;
  loggedSets: WorkoutSetLog[];
  muscleGroup?: string | null;
};

export type WorkoutDay = {
  id: string;
  workoutPlanId?: string | null;
  label?: string | null;
  dayNumber?: number | null;
  focus?: string | null;
  estimatedMinutes?: number | null;
  estimatedCalories?: number | null;
  exercises: WorkoutExercise[];
  date?: string | null;
};

export type ActiveWorkoutPlan = {
  id: string;
  name?: string | null;
  status?: string | null;
  days: WorkoutDay[];
  today?: WorkoutDay | null;
};

export type WorkoutSessionStatus =
  | 'idle'
  | 'active'
  | 'paused'
  | 'completed'
  | 'finished'
  | string;

export type WorkoutSession = {
  sessionId: string;
  workoutPlanDayId?: string | null;
  workoutPlanId?: string | null;
  status: WorkoutSessionStatus;
  startedAt?: string | null;
  pausedAt?: string | null;
  endedAt?: string | null;
  durationSeconds?: number | null;
  durationMinutes?: number | null;
  caloriesBurned?: number | null;
  exercisesCompleted?: number | null;
  exercisesSkipped?: number | null;
  setsCompleted?: number | null;
  completionPercent?: number | null;
  volumeKg?: number | null;
  exercises?: WorkoutExercise[];
};

export type WorkoutAnalytics = {
  volumeKg: number;
  durationMinutes: number;
  exercisesCompleted: number;
  exercisesSkipped: number;
  setsCompleted: number;
  caloriesBurned: number;
  completionPercent: number;
  totalExercises: number;
};

export type WorkoutHistoryItem = {
  id: string;
  sessionId?: string | null;
  label?: string | null;
  focus?: string | null;
  date?: string | null;
  durationMinutes?: number | null;
  caloriesBurned?: number | null;
  completionPercent?: number | null;
  exercisesCompleted?: number | null;
  volumeKg?: number | null;
  status?: string | null;
};

export type WorkoutHistoryMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type WorkoutHistoryResponse = {
  items: WorkoutHistoryItem[];
  meta?: WorkoutHistoryMeta;
};

export type LogSetPayload = {
  exerciseId: string;
  sessionId: string;
  reps: number;
  weight: number;
  setNumber?: number;
  restSeconds?: number;
};

export type UpdateSetPayload = {
  exerciseId: string;
  setId: string;
  reps?: number;
  weight?: number;
  restSeconds?: number;
};

export type CompleteExercisePayload = {
  exerciseId: string;
  sessionId?: string;
  skip?: boolean;
};

export type EndWorkoutSessionPayload = {
  sessionId: string;
  durationMinutes?: number;
  caloriesBurned?: number;
  force?: boolean;
};
