export type QuestionSubmission = {
  submissionId: string;
  questionId: number;
  language: string;
  code?: string;
  status: string;
  passedTestCases: number;
  totalTestCases: number;
  executionTime: number;
  memoryUsed: number;
  createdAt?: string;
  updatedAt?: string;
};

export type QuestionSubmissionsResponse = {
  items: QuestionSubmission[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    questionId: number;
  };
};

export type QuestionSubmissionsParams = {
  questionId: number | string;
  page?: number;
  limit?: number;
};
