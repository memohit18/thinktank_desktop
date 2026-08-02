import { z } from 'zod';

function parseFormNumber(value: unknown) {
  if (value === '' || value === null || value === undefined) {
    return '';
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? '' : parsed;
}

const numberField = (label: string, min = 0) =>
  z.preprocess(
    (value) => parseFormNumber(value),
    z
      .union([z.number(), z.literal('')])
      .refine((value) => value !== '', `${label} is required`)
      .refine(
        (value) => typeof value === 'number' && value >= min,
        `${label} cannot be negative`,
      ),
  );

export const careerProfileSchema = z
  .object({
    currentCompany: z.string().min(1, 'Current company is required'),
    currentRole: z.string().min(1, 'Current role is required'),
    totalExperience: numberField('Experience'),
    currentCtc: numberField('Salary'),
    expectedMinCtc: numberField('Minimum expected CTC'),
    expectedMaxCtc: numberField('Maximum expected CTC'),
    noticePeriod: numberField('Notice period'),
    linkedinUrl: z.string().url('Enter a valid LinkedIn URL').or(z.literal('')),
    githubUrl: z.string().url('Enter a valid Github URL').or(z.literal('')),
    portfolioUrl: z
      .string()
      .url('Enter a valid portfolio URL')
      .or(z.literal('')),
    summary: z.string().min(1, 'Professional summary is required'),
    isActive: z.boolean(),
  })
  .refine(
    (data) =>
      typeof data.expectedMaxCtc !== 'number' ||
      typeof data.expectedMinCtc !== 'number' ||
      data.expectedMaxCtc >= data.expectedMinCtc,
    {
      message: 'Maximum CTC must be greater than or equal to minimum CTC',
      path: ['expectedMaxCtc'],
    },
  );

export type CareerProfileSchemaValues = z.infer<typeof careerProfileSchema>;
