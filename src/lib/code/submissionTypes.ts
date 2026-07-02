export type SubmissionTestCaseResult = {
  index: number;
  isSample: boolean;
  isHidden: boolean;
  input: unknown;
  validationType: 'exact' | 'count_only';
  expectedOutput?: unknown;
  expectedOutputCount?: number;
  actualOutput?: unknown;
  passed: boolean;
  status:
    | 'passed'
    | 'wrong_answer'
    | 'runtime_error'
    | 'compilation_error'
    | 'time_limit_exceeded'
    | 'invalid_input'
    | 'skipped';
  executionTimeMs: number;
  message?: string;
};

export type QuestionSubmission = {
  submissionId: string;
  questionId: number;
  language: string;
  code?: string;
  status: string;
  passedTestCases: number;
  totalTestCases: number;
  executionTime: number;
  memoryUsed?: number;
  createdAt?: string;
  updatedAt?: string;
  failureReason?: string;
  testCases?: SubmissionTestCaseResult[];
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
