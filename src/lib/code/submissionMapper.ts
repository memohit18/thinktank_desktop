export type SubmissionLanguage = 'python' | 'javascript';

export type QuestionSubmissionPayload = {
  language: SubmissionLanguage;
  code: string;
};

export function buildSubmissionPayload(
  code: string,
  language: SubmissionLanguage = 'python',
): QuestionSubmissionPayload {
  return { language, code };
}
