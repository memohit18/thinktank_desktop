import type { CodeQuestion, QuestionStatus } from '@/lib/code/questions';

export type ProblemListQuery = {
  category?: string;
  difficulty?: string;
  search?: string;
  page?: number;
  limit?: number;
};

export type ProblemListItem = {
  id: number;
  slug: string;
  number: number;
  title: string;
  category: string;
  categorySlug: string;
  pattern: string;
  difficulty: CodeQuestion['difficulty'];
  summary: string;
  tags: string[];
  expectedTimeComplexity: string;
  expectedSpaceComplexity: string;
  testcaseCount: number;
  sampleTestcaseCount: number;
  hintCount: number;
  followUpCount: number;
  exampleCount: number;
  status: QuestionStatus;
};

export type ProblemListResponse = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  items: ProblemListItem[];
};
