export type UserProgressStatus =
  | 'Not Started'
  | 'Attempted'
  | 'Solved'
  | 'Revised'
  | 'Mastered';

export type UserProgressFiltersResponse = {
  statuses: UserProgressStatus[];
  countsByStatus: Record<UserProgressStatus, number>;
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
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    appliedFilters: Record<string, string>;
  };
  filters: UserProgressFiltersResponse;
};

export type UserProgressParams = {
  page?: number;
  limit?: number;
  status?: string;
};
