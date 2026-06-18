export type QuestionStatus = 'solved' | 'in_progress' | 'not_started';

export type TestValidationType = 'exact' | 'count_only';

export type TestComparisonMode = 'exact' | 'unordered_array';

export type TestCase = {
  id: string;
  input: string;
  expectedOutput: string;
  expectedOutputCount?: number;
  validationType: TestValidationType;
  comparisonMode: TestComparisonMode;
  runExpression: string;
  isSample?: boolean;
  isHidden?: boolean;
};

export type QuestionJudging = {
  outputType: string;
  supportsCountOnlyValidation: boolean;
  comparisonNote?: string;
};

export type QuestionTestcaseSummary = {
  total: number;
  sample: number;
  hidden: number;
  exact: number;
  countOnly: number;
  hiddenCountOnly: number;
};

export type QuestionExample = {
  label: string;
  input: string;
  output: string;
  explanation?: string;
};

export type CodeQuestion = {
  id: string;
  number: number;
  title: string;
  slug: string;
  category: string;
  categorySlug: string;
  pattern: string;
  summary: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  acceptance: number;
  status: QuestionStatus;
  description: string;
  examples: QuestionExample[];
  constraints: string[];
  edgeCases: string[];
  followUps: string[];
  hints: string[];
  tags: string[];
  likes?: number;
  timeComplexity?: string;
  spaceComplexity?: string;
  outputType?: string;
  judging?: QuestionJudging;
  testcaseSummary?: QuestionTestcaseSummary;
  starterCode: string;
  testCases: TestCase[];
};
