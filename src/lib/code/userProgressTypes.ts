export type UserProgressStatus =
  | 'Not Started'
  | 'Attempted'
  | 'Solved'
  | 'Revised'
  | 'Mastered';

export type UserProgressFiltersResponse = {
  statuses: UserProgressStatus[];
  countsByStatus: Record<UserProgressStatus, number>;
  totalQuestions: number;
};

export type UserProgressQuestion = {
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
};

export type UserProgressItem = {
  questionId: number;
  status: UserProgressStatus;
  attempts: number;
  confidence: number;
  question: UserProgressQuestion;
};

export type UserProgressResponse = {
  items: UserProgressItem[];
  meta: {
    total: number;
    appliedFilters: Record<string, string>;
  };
  filters: UserProgressFiltersResponse;
};

export type UserProgressParams = {
  status?: string;
};

export type DailyActivityDay = {
  date: string;
  attempted: boolean;
};

export type DailyActivityResponse = {
  year: number;
  month: number;
  monthKey: string;
  startDate: string;
  endDate: string;
  timezone: string;
  days: DailyActivityDay[];
  summary: {
    activeDays: number;
    totalDays: number;
  };
};

export type DailyActivityParams = {
  month: string;
};
