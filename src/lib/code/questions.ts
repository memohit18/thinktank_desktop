export type QuestionStatus = 'solved' | 'in_progress' | 'not_started';

export type TestCase = {
  id: string;
  input: string;
  expectedOutput: string;
  runExpression: string;
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
  starterCode: string;
  testCases: TestCase[];
};
