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
  examples?: BulkUploadExample[];
  hints?: string[];
  followUps?: string[];
};

export type BulkUploadTestcase = {
  questionId: number;
  input: Record<string, unknown>;
  expectedOutput: unknown;
  isSample: boolean;
  isHidden: boolean;
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
      questionId: 3,
      title: 'Valid Anagram',
      category: 'Arrays & Hashing',
      pattern: 'Frequency Count',
      difficulty: 'Easy',
      problemStatement:
        'Given two strings s and t, return true if t is an anagram of s.',
      constraints: [
        '1 <= s.length <= 50000',
        's and t consist of lowercase English letters',
      ],
      expectedTimeComplexity: 'O(n)',
      expectedSpaceComplexity: 'O(1)',
      tags: ['string', 'hashmap'],
      examples: [
        {
          input: { s: 'anagram', t: 'nagaram' },
          output: true,
          explanation: 'Both strings contain the same character frequencies.',
        },
      ],
      hints: [
        'Count character frequencies.',
        'Compare both frequency maps.',
      ],
      followUps: [
        'Can you solve without sorting?',
        'What if unicode characters are allowed?',
      ],
    },
  ],
  testcases: [
    {
      questionId: 3,
      input: { s: 'anagram', t: 'nagaram' },
      expectedOutput: true,
      isSample: true,
      isHidden: false,
    },
    {
      questionId: 3,
      input: { s: 'rat', t: 'car' },
      expectedOutput: false,
      isSample: false,
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

  if (testcase.expectedOutput === undefined) {
    errors.push(`testcases[${index}].expectedOutput is required.`);
  }

  if (typeof testcase.isSample !== 'boolean') {
    errors.push(`testcases[${index}].isSample must be a boolean.`);
  }

  if (typeof testcase.isHidden !== 'boolean') {
    errors.push(`testcases[${index}].isHidden must be a boolean.`);
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

  return { valid: true as const, payload: data as BulkUploadPayload };
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
