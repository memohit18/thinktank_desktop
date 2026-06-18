export type BulkUploadExample = {
  input: Record<string, unknown>;
  output: unknown;
  explanation?: string;
};

export type BulkUploadQuestion = {
  questionId: number;
  title: string;
  category: string;
  pattern: string;
  difficulty: string;
  problemStatement: string;
  constraints: string[];
  expectedTimeComplexity: string;
  expectedSpaceComplexity: string;
  tags: string[];
  outputType?: string;
  examples?: BulkUploadExample[];
  hints?: string[];
  followUps?: string[];
};

export type BulkUploadTestcase = {
  questionId: number;
  input: Record<string, unknown>;
  expectedOutput?: unknown;
  expectedOutputCount?: number;
  validationType?: 'exact' | 'count_only';
  isSample?: boolean;
  isHidden?: boolean;
};

export type BulkUploadPayload = {
  questions: BulkUploadQuestion[];
  testcases?: BulkUploadTestcase[];
};

export type BulkUploadResponse = {
  questions: {
    upserted: number;
    modified: number;
    updatedByTitle: number;
  };
  examples?: { inserted: number };
  hints?: { inserted: number };
  followUps?: { inserted: number };
  testcases?: {
    inserted: number;
    upsertedQuestionIds: number;
  };
};

export const BULK_UPLOAD_EXAMPLE: BulkUploadPayload = {
  questions: [
    {
      questionId: 36,
      title: 'Evaluate Reverse Polish Notation',
      category: 'Stack',
      pattern: 'Stack',
      difficulty: 'Medium',
      problemStatement:
        'Evaluate the value of an arithmetic expression in Reverse Polish Notation.',
      constraints: ['1 <= tokens.length <= 10^4'],
      expectedTimeComplexity: 'O(n)',
      expectedSpaceComplexity: 'O(n)',
      tags: ['stack', 'array', 'math'],
      outputType: 'exact',
      examples: [
        {
          input: { tokens: ['2', '1', '+', '3', '*'] },
          output: 9,
        },
      ],
      hints: ['Use a stack to process operands.'],
      followUps: ['What if operators have different precedence?'],
    },
  ],
  testcases: [
    {
      questionId: 36,
      input: { tokens: ['2', '1', '+', '3', '*'] },
      expectedOutput: 9,
      isSample: true,
      isHidden: false,
    },
    {
      questionId: 36,
      input: { tokens: ['4', '13', '5', '/', '+'] },
      expectedOutput: 6,
      isSample: true,
      isHidden: false,
    },
    {
      questionId: 36,
      input: {
        tokens: ['10', '6', '9', '3', '+', '-11', '*', '/', '*', '17', '+', '5', '+'],
      },
      expectedOutput: 22,
      isHidden: true,
    },
  ],
};

export function getBulkUploadExampleJson() {
  return JSON.stringify(BULK_UPLOAD_EXAMPLE, null, 2);
}

function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isStringArray(value: unknown) {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function normalizeTestcase(testcase: BulkUploadTestcase): BulkUploadTestcase {
  const isHidden = testcase.isHidden ?? false;
  const isSample = testcase.isSample ?? !isHidden;

  return {
    ...testcase,
    isHidden,
    isSample,
    validationType: testcase.validationType ?? 'exact',
  };
}

export function normalizeBulkUploadPayload(
  payload: BulkUploadPayload,
): BulkUploadPayload {
  return {
    questions: payload.questions,
    testcases: payload.testcases?.map((testcase) => normalizeTestcase(testcase)),
  };
}

function validateQuestion(question: unknown, index: number, errors: string[]) {
  if (!isObject(question)) {
    errors.push(`questions[${index}] must be an object.`);
    return;
  }

  const requiredStrings = [
    'title',
    'category',
    'pattern',
    'difficulty',
    'problemStatement',
    'expectedTimeComplexity',
    'expectedSpaceComplexity',
  ] as const;

  if (typeof question.questionId !== 'number') {
    errors.push(`questions[${index}].questionId must be a number.`);
  }

  for (const field of requiredStrings) {
    if (typeof question[field] !== 'string' || !question[field]) {
      errors.push(`questions[${index}].${field} must be a non-empty string.`);
    }
  }

  if (!isStringArray(question.constraints)) {
    errors.push(`questions[${index}].constraints must be an array of strings.`);
  }

  if (!isStringArray(question.tags)) {
    errors.push(`questions[${index}].tags must be an array of strings.`);
  }

  if (
    question.outputType !== undefined &&
    (typeof question.outputType !== 'string' || !question.outputType)
  ) {
    errors.push(`questions[${index}].outputType must be a non-empty string.`);
  }

  if (question.examples !== undefined) {
    if (!Array.isArray(question.examples)) {
      errors.push(`questions[${index}].examples must be an array.`);
    } else {
      question.examples.forEach((example, exampleIndex) => {
        if (!isObject(example)) {
          errors.push(
            `questions[${index}].examples[${exampleIndex}] must be an object.`,
          );
          return;
        }
        if (!isObject(example.input)) {
          errors.push(
            `questions[${index}].examples[${exampleIndex}].input must be an object.`,
          );
        }
        if (example.output === undefined) {
          errors.push(
            `questions[${index}].examples[${exampleIndex}].output is required.`,
          );
        }
      });
    }
  }

  if (question.hints !== undefined && !isStringArray(question.hints)) {
    errors.push(`questions[${index}].hints must be an array of strings.`);
  }

  if (question.followUps !== undefined && !isStringArray(question.followUps)) {
    errors.push(`questions[${index}].followUps must be an array of strings.`);
  }
}

function validateTestcase(testcase: unknown, index: number, errors: string[]) {
  if (!isObject(testcase)) {
    errors.push(`testcases[${index}] must be an object.`);
    return;
  }

  if (typeof testcase.questionId !== 'number') {
    errors.push(`testcases[${index}].questionId must be a number.`);
  }

  if (!isObject(testcase.input)) {
    errors.push(`testcases[${index}].input must be an object.`);
  }

  const validationType = testcase.validationType ?? 'exact';

  if (
    validationType !== 'exact' &&
    validationType !== 'count_only'
  ) {
    errors.push(
      `testcases[${index}].validationType must be "exact" or "count_only".`,
    );
  }

  if (validationType === 'count_only') {
    if (typeof testcase.expectedOutputCount !== 'number') {
      errors.push(
        `testcases[${index}].expectedOutputCount is required for count_only validation.`,
      );
    }
  } else if (testcase.expectedOutput === undefined) {
    errors.push(`testcases[${index}].expectedOutput is required.`);
  }

  if (
    testcase.isSample !== undefined &&
    typeof testcase.isSample !== 'boolean'
  ) {
    errors.push(`testcases[${index}].isSample must be a boolean when provided.`);
  }

  if (
    testcase.isHidden !== undefined &&
    typeof testcase.isHidden !== 'boolean'
  ) {
    errors.push(`testcases[${index}].isHidden must be a boolean when provided.`);
  }
}

export function parseBulkUploadJson(raw: string) {
  try {
    return { data: JSON.parse(raw) as unknown, parseError: null as string | null };
  } catch {
    return { data: null, parseError: 'Invalid JSON. Check brackets, commas, and quotes.' };
  }
}

export function validateBulkUploadPayload(data: unknown) {
  const errors: string[] = [];

  if (!isObject(data)) {
    return { valid: false as const, errors: ['Root payload must be a JSON object.'] };
  }

  if (!Array.isArray(data.questions) || data.questions.length === 0) {
    errors.push('questions must be a non-empty array.');
  } else {
    data.questions.forEach((question, index) => validateQuestion(question, index, errors));
  }

  if (data.testcases !== undefined) {
    if (!Array.isArray(data.testcases)) {
      errors.push('testcases must be an array when provided.');
    } else {
      data.testcases.forEach((testcase, index) =>
        validateTestcase(testcase, index, errors),
      );
    }
  }

  if (errors.length > 0) {
    return { valid: false as const, errors };
  }

  const payload = normalizeBulkUploadPayload(data as BulkUploadPayload);

  return { valid: true as const, payload };
}

export function formatBulkUploadResult(result: BulkUploadResponse) {
  const parts = [
    `Questions: ${result.questions.upserted} upserted, ${result.questions.modified} modified`,
  ];

  if (result.examples) {
    parts.push(`Examples: ${result.examples.inserted} inserted`);
  }
  if (result.hints) {
    parts.push(`Hints: ${result.hints.inserted} inserted`);
  }
  if (result.followUps) {
    parts.push(`Follow-ups: ${result.followUps.inserted} inserted`);
  }
  if (result.testcases) {
    parts.push(
      `Testcases: ${result.testcases.inserted} inserted (${result.testcases.upsertedQuestionIds} questions)`,
    );
  }

  return parts.join(' · ');
}
