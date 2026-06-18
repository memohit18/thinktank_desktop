import type { CreateRoadmapPayload } from '@/lib/code/roadmapTypes';

export const ROADMAP_CREATE_EXAMPLE: CreateRoadmapPayload = {
  name: 'Remote SDE-2 Interview Roadmap',
  slug: 'remote-sde2-roadmap',
  description: '118 high ROI DSA questions for remote product company interviews.',
  isActive: true,
  questions: [
    { questionId: 1, order: 1 },
    { questionId: 2, order: 2 },
    { questionId: 3, order: 3 },
    { questionId: 4, order: 4 },
    { questionId: 5, order: 5 },
  ],
};

export function getRoadmapCreateExampleJson() {
  return JSON.stringify(ROADMAP_CREATE_EXAMPLE, null, 2);
}

function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export function parseRoadmapCreateJson(raw: string) {
  try {
    return { data: JSON.parse(raw) as unknown, parseError: null as string | null };
  } catch {
    return { data: null, parseError: 'Invalid JSON. Check brackets, commas, and quotes.' };
  }
}

function validateQuestionRef(
  question: unknown,
  index: number,
  errors: string[],
) {
  if (!isObject(question)) {
    errors.push(`questions[${index}] must be an object.`);
    return;
  }

  if (typeof question.questionId !== 'number') {
    errors.push(`questions[${index}].questionId must be a number.`);
  }

  if (typeof question.order !== 'number') {
    errors.push(`questions[${index}].order must be a number.`);
  }
}

export function validateRoadmapCreatePayload(data: unknown) {
  const errors: string[] = [];

  if (!isObject(data)) {
    return { valid: false as const, errors: ['Payload must be a JSON object.'] };
  }

  const requiredStrings = ['name', 'slug', 'description'] as const;

  for (const field of requiredStrings) {
    if (typeof data[field] !== 'string' || !data[field]) {
      errors.push(`${field} must be a non-empty string.`);
    }
  }

  if (data.isActive !== undefined && typeof data.isActive !== 'boolean') {
    errors.push('isActive must be a boolean when provided.');
  }

  if (!Array.isArray(data.questions) || data.questions.length === 0) {
    errors.push('questions must be a non-empty array.');
  } else {
    data.questions.forEach((question, index) =>
      validateQuestionRef(question, index, errors),
    );
  }

  if (errors.length > 0) {
    return { valid: false as const, errors };
  }

  return { valid: true as const, payload: data as CreateRoadmapPayload };
}
