export type DashboardScoreWeights = {
  meals: number;
  workout: number;
  calories: number;
  protein: number;
  water: number;
};

export type DashboardBreakdown = {
  meals: number | null;
  workout: number | null;
  calories: number | null;
  protein: number | null;
  water: number | null;
};

export type DashboardMealProgress = {
  completed: number;
  assigned: number;
  skipped: number;
  score: number | null;
  percent: number;
};

export type DashboardWorkoutProgress = {
  completed: boolean;
  score: number | null;
};

export type DashboardWaterProgress = {
  currentMl: number;
  goalMl: number;
  targetMl: number;
  remainingMl: number;
  percent: number;
};

export type DashboardMacro = {
  current: number;
  goal: number;
  remaining: number;
  percent: number;
};

export type DashboardAchievement = {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  unlockedAt?: string | null;
};

export type DashboardTask = {
  id: string;
  label: string;
  done: boolean;
  href: string;
  category: 'meals' | 'workout' | 'water' | 'macros';
};

export type DashboardSources = {
  mealLogs: number;
  hydrationLogs: number;
  workoutSessions: number;
  progressLogs: number;
};

export type DashboardCheckinMeta = {
  id?: string | null;
  userId?: string | null;
  checkInDate?: string | null;
  dietCompliance?: number | null;
  mealsCompleted?: number | null;
  workoutCompleted?: boolean | null;
};

/** GET /dashboard — full daily dashboard */
export type DailyDashboard = {
  date: string | null;
  todayScore: number | null;
  breakdown: DashboardBreakdown | null;
  weights: DashboardScoreWeights | null;
  meals: DashboardMealProgress;
  workout: DashboardWorkoutProgress;
  water: DashboardWaterProgress;
  calories: DashboardMacro;
  protein: DashboardMacro;
  remainingCalories: number;
  remainingProtein: number;
  compliance: number | null;
  currentStreak: number | null;
  longestStreak: number | null;
  achievements: DashboardAchievement[];
  checkin: DashboardCheckinMeta | null;
  sources: DashboardSources | null;
  tasks: DashboardTask[];
};

/** GET /dashboard/today — score card */
export type DashboardToday = {
  date: string | null;
  todayScore: number | null;
  breakdown: DashboardBreakdown | null;
  weights: DashboardScoreWeights | null;
  meals: DashboardMealProgress;
  workout: DashboardWorkoutProgress;
  water: DashboardWaterProgress;
  calories: DashboardMacro;
  protein: DashboardMacro;
  remainingCalories: number;
  remainingProtein: number;
  compliance: number | null;
  checkin: DashboardCheckinMeta | null;
};

export type DashboardComplianceDetail = {
  overall: number | null;
  meals: number | null;
  workout: number | null;
  calories: number | null;
  protein: number | null;
  water: number | null;
  dietCompliance: number | null;
};

export type DashboardStreakDetail = {
  currentStreak: number | null;
  longestStreak: number | null;
  lastCompliantDate: string | null;
  compliantToday: boolean;
};

/** GET /dashboard/compliance */
export type DashboardCompliance = {
  date: string | null;
  compliance: DashboardComplianceDetail;
  streak: DashboardStreakDetail;
  weights: DashboardScoreWeights | null;
};

/** GET /dashboard/streak */
export type DashboardStreak = {
  date: string | null;
  currentStreak: number | null;
  longestStreak: number | null;
  lastCompliantDate: string | null;
  compliantToday: boolean;
  achievements: DashboardAchievement[];
};

export type DashboardPeriodStats = {
  daysTracked: number;
  workoutsCompleted: number;
  avgDietCompliance: number | null;
  avgCalories?: number | null;
  avgProtein?: number | null;
  avgWaterMl?: number | null;
  currentStreak?: number | null;
  longestStreak?: number | null;
};

/** GET /dashboard/summary */
export type DashboardSummary = {
  date: string | null;
  today: DailyDashboard | null;
  week: DashboardPeriodStats | null;
  month: DashboardPeriodStats | null;
  sources: DashboardSources | null;
};
