export type DailyCheckinScore = {
  todayScore: number | null;
  calories: {
    current: number;
    goal: number;
    percent?: number | null;
  };
  protein: {
    current: number;
    goal: number;
    percent?: number | null;
  };
  meals: {
    completed: number;
    assigned: number;
    skipped: number;
    score?: number | null;
  };
  workout: {
    completed: boolean;
    score?: number | null;
    durationMinutes?: number | null;
  };
  water: {
    currentMl: number;
    goalMl: number;
    percent?: number | null;
    score?: number | null;
  };
  compliancePercent?: number | null;
  breakdown?: {
    meals?: number | null;
    workout?: number | null;
    water?: number | null;
    calories?: number | null;
    protein?: number | null;
  } | null;
  date?: string | null;
};

export type HydrationToday = {
  amountMl: number;
  goalMl: number;
  remainingMl: number;
  percent: number;
  logs?: Array<{ id?: string; amountMl: number; createdAt?: string }>;
};

export type WorkoutExercise = {
  id: string;
  name: string;
  sets?: number | null;
  reps?: string | number | null;
  weightKg?: number | null;
  restSeconds?: number | null;
  durationMinutes?: number | null;
  notes?: string | null;
  completed?: boolean;
  order?: number | null;
};

export type WorkoutDay = {
  id: string;
  label?: string | null;
  dayNumber?: number | null;
  focus?: string | null;
  estimatedMinutes?: number | null;
  exercises: WorkoutExercise[];
};

export type ActiveWorkoutPlan = {
  id: string;
  name?: string | null;
  status?: string | null;
  days: WorkoutDay[];
  today?: WorkoutDay | null;
};

export type WorkoutSession = {
  sessionId: string;
  workoutPlanDayId?: string | null;
  startedAt?: string | null;
  status?: 'active' | 'paused' | 'completed' | string;
  durationMinutes?: number | null;
  caloriesBurned?: number | null;
};

export type CompleteExercisePayload = {
  workoutPlanExerciseId: string;
  sessionId?: string;
  sets?: number;
  reps?: string | number;
  weight?: number;
  duration?: number;
};

export type EndWorkoutSessionPayload = {
  sessionId: string;
  durationMinutes?: number;
  caloriesBurned?: number;
};

export type MealExecutionPayload = {
  mealId: string;
  consumedQuantity?: number;
  notes?: string;
};

export type MealPartialPayload = {
  mealId: string;
  consumedQuantity: number;
};

export type MealReplacePayload = {
  mealId: string;
  foodId: string;
};

export type AiChatMessage = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: string;
  pending?: boolean;
  error?: boolean;
};

export type AiChatResponse = {
  sessionId: string;
  reply: string;
  message?: string | null;
  answer?: string | null;
  contextVersion?: string | number | null;
  createdAt?: string | null;
};
