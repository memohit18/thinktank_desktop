import type { ProblemListItem } from '@/lib/code/problemTypes';
import type {
  CodeQuestion,
  QuestionExample,
  QuestionStatus,
  TestCase,
  TestComparisonMode,
  TestValidationType,
} from '@/lib/code/questions';

export type RemoteQuestionExample = {
  input: Record<string, unknown>;
  output: unknown;
  explanation?: string;
};

export type RemoteSampleTestcase = {
  input: Record<string, unknown>;
  expectedOutput?: unknown;
  expectedOutputCount?: number;
  validationType?: TestValidationType;
  isSample?: boolean;
  isHidden?: boolean;
  weight?: number;
};

export type RemoteQuestionJudging = {
  outputType: string;
  supportsCountOnlyValidation: boolean;
  comparisonNote?: string;
};

export type RemoteQuestionTestcaseSummary = {
  total: number;
  sample: number;
  hidden: number;
  exact: number;
  countOnly: number;
  hiddenCountOnly: number;
};

export type RemoteQuestion = {
  questionId: number;
  title: string;
  category: string;
  pattern: string;
  difficulty: CodeQuestion['difficulty'];
  problemStatement: string;
  constraints: string[];
  expectedTimeComplexity: string;
  expectedSpaceComplexity: string;
  tags: string[];
  followUps: string[];
  examples: RemoteQuestionExample[];
  hints: string[];
  testcaseCount: number;
  sampleTestcaseCount: number;
  updatedAt: string;
  createdAt?: string;
};

export type RemoteQuestionDetail = RemoteQuestion & {
  outputType?: string;
  judging?: RemoteQuestionJudging;
  testcaseSummary?: RemoteQuestionTestcaseSummary;
  sampleTestcases: RemoteSampleTestcase[];
  hiddenTestcaseCount?: number;
  starterCode?: string;
};

export type RemoteQuestionsResponse = {
  items: RemoteQuestion[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export function titleToSlug(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function functionNameFromTitle(title: string) {
  return titleToSlug(title).replace(/-/g, '_');
}

export function categoryToSlug(category: string) {
  return titleToSlug(category);
}

function toSummary(statement: string) {
  const line = statement.split('\n').find((part) => part.trim().length > 0) ?? statement;
  return line.replace(/`/g, '').slice(0, 120);
}

function formatExampleValue(value: unknown) {
  if (typeof value === 'string') {
    return value;
  }

  if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
    return Object.entries(value as Record<string, unknown>)
      .map(([key, entry]) => `${key} = ${JSON.stringify(entry)}`)
      .join(', ');
  }

  return JSON.stringify(value);
}

export function toPythonLiteral(value: unknown): string {
  if (value === null || value === undefined) return 'None';
  if (typeof value === 'boolean') return value ? 'True' : 'False';
  if (typeof value === 'number') return String(value);
  if (typeof value === 'string') return JSON.stringify(value);
  if (Array.isArray(value)) {
    return `[${value.map((item) => toPythonLiteral(item)).join(', ')}]`;
  }
  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>).map(
      ([key, entry]) => `${JSON.stringify(key)}: ${toPythonLiteral(entry)}`,
    );
    return `{${entries.join(', ')}}`;
  }

  return JSON.stringify(value);
}

function formatInputDisplay(input: Record<string, unknown>) {
  return Object.entries(input)
    .map(([key, value]) => `${key} = ${toPythonLiteral(value)}`)
    .join(', ');
}

function buildRunExpression(functionName: string, input: Record<string, unknown>) {
  const args = Object.values(input).map((value) => toPythonLiteral(value)).join(', ');
  return `${functionName}(${args})`;
}

function buildStarterCode(functionName: string, input: Record<string, unknown>) {
  const params = Object.keys(input).join(', ');
  return `def ${functionName}(${params}):\n    pass`;
}

function resolveComparisonMode(outputType?: string): TestComparisonMode {
  if (outputType === 'unordered_array') return 'unordered_array';
  return 'exact';
}

function resolveValidationType(testcase: RemoteSampleTestcase): TestValidationType {
  if (testcase.validationType === 'count_only') return 'count_only';
  if (
    testcase.expectedOutputCount !== undefined &&
    testcase.expectedOutput === undefined
  ) {
    return 'count_only';
  }
  return 'exact';
}

function mapExamples(
  examples: RemoteQuestionExample[],
  sampleTestcases: RemoteSampleTestcase[],
): QuestionExample[] {
  const source: RemoteQuestionExample[] =
    examples.length > 0
      ? examples
      : sampleTestcases
          .filter((testcase) => resolveValidationType(testcase) === 'exact')
          .map((testcase) => ({
            input: testcase.input,
            output: testcase.expectedOutput,
          }));

  return source.map((example, index) => ({
    label: `Example ${index + 1}`,
    input: formatExampleValue(example.input),
    output: formatExampleValue(example.output),
    explanation: example.explanation,
  }));
}

function mapSampleTestcases(
  functionName: string,
  sampleTestcases: RemoteSampleTestcase[],
  comparisonMode: TestComparisonMode,
): TestCase[] {
  return sampleTestcases.map((testcase, index) => {
    const validationType = resolveValidationType(testcase);
    const mapped: TestCase = {
      id: `tc-${index + 1}`,
      input: formatInputDisplay(testcase.input),
      expectedOutput:
        validationType === 'count_only'
          ? ''
          : toPythonLiteral(testcase.expectedOutput),
      expectedOutputCount: testcase.expectedOutputCount,
      validationType,
      comparisonMode,
      runExpression: buildRunExpression(functionName, testcase.input),
      isSample: testcase.isSample,
      isHidden: testcase.isHidden,
    };

    return mapped;
  });
}

export function mapRemoteQuestionDetailToCodeQuestion(
  question: RemoteQuestionDetail,
  status: QuestionStatus = 'not_started',
): CodeQuestion {
  const slug = titleToSlug(question.title);
  const functionName = functionNameFromTitle(question.title);
  const signatureInput =
    question.sampleTestcases[0]?.input ??
    question.examples[0]?.input ??
    {};
  const starterCode =
    question.starterCode ?? buildStarterCode(functionName, signatureInput);
  const outputType = question.outputType ?? question.judging?.outputType;
  const comparisonMode = resolveComparisonMode(outputType);

  return {
    id: String(question.questionId),
    slug,
    number: question.questionId,
    title: question.title,
    category: question.category,
    categorySlug: categoryToSlug(question.category),
    pattern: question.pattern,
    summary: toSummary(question.problemStatement),
    difficulty: question.difficulty,
    acceptance: 0,
    status,
    description: question.problemStatement,
    examples: mapExamples(question.examples, question.sampleTestcases),
    constraints: question.constraints ?? [],
    edgeCases: [],
    followUps: question.followUps ?? [],
    hints: question.hints ?? [],
    tags: question.tags ?? [],
    timeComplexity: question.expectedTimeComplexity,
    spaceComplexity: question.expectedSpaceComplexity,
    outputType,
    judging: question.judging
      ? {
          outputType: question.judging.outputType,
          supportsCountOnlyValidation: question.judging.supportsCountOnlyValidation,
          comparisonNote: question.judging.comparisonNote,
        }
      : undefined,
    testcaseSummary: question.testcaseSummary,
    starterCode,
    testCases: mapSampleTestcases(
      functionName,
      question.sampleTestcases ?? [],
      comparisonMode,
    ),
  };
}

export function mapRemoteQuestionToListItem(question: RemoteQuestion): ProblemListItem {
  const slug = titleToSlug(question.title);

  return {
    id: question.questionId,
    slug,
    number: question.questionId,
    title: question.title,
    category: question.category,
    categorySlug: categoryToSlug(question.category),
    pattern: question.pattern,
    difficulty: question.difficulty,
    summary: toSummary(question.problemStatement),
    tags: question.tags ?? [],
    expectedTimeComplexity: question.expectedTimeComplexity,
    expectedSpaceComplexity: question.expectedSpaceComplexity,
    testcaseCount: question.testcaseCount ?? 0,
    sampleTestcaseCount: question.sampleTestcaseCount ?? 0,
    hintCount: question.hints?.length ?? 0,
    followUpCount: question.followUps?.length ?? 0,
    exampleCount: question.examples?.length ?? 0,
    status: 'not_started',
  };
}

export function mapRemoteQuestionsResponse(response: RemoteQuestionsResponse) {
  return {
    total: response.meta.total,
    page: response.meta.page,
    limit: response.meta.limit,
    totalPages: response.meta.totalPages,
    items: response.items.map(mapRemoteQuestionToListItem),
  };
}
