import type { QuestionSubmission } from '@/lib/code/submissionTypes';

const STORAGE_PREFIX = 'submission-test-results:';

function storageKey(questionId: number) {
  return `${STORAGE_PREFIX}${questionId}`;
}

export function saveSubmissionTestResults(
  questionId: number,
  submission: Pick<
    QuestionSubmission,
    | 'submissionId'
    | 'status'
    | 'passedTestCases'
    | 'totalTestCases'
    | 'failureReason'
    | 'testCases'
    | 'createdAt'
  >,
) {
  if (typeof window === 'undefined' || !submission.testCases?.length) {
    return;
  }

  window.sessionStorage.setItem(
    storageKey(questionId),
    JSON.stringify({
      submissionId: submission.submissionId,
      status: submission.status,
      passedTestCases: submission.passedTestCases,
      totalTestCases: submission.totalTestCases,
      failureReason: submission.failureReason,
      testCases: submission.testCases,
      createdAt: submission.createdAt,
    }),
  );
}

export function loadSubmissionTestResults(
  questionId: number,
): Pick<
  QuestionSubmission,
  | 'submissionId'
  | 'status'
  | 'passedTestCases'
  | 'totalTestCases'
  | 'failureReason'
  | 'testCases'
  | 'createdAt'
> | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw = window.sessionStorage.getItem(storageKey(questionId));
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as Pick<
      QuestionSubmission,
      | 'submissionId'
      | 'status'
      | 'passedTestCases'
      | 'totalTestCases'
      | 'failureReason'
      | 'testCases'
      | 'createdAt'
    >;
  } catch {
    return null;
  }
}

export function clearSubmissionTestResults(questionId: number) {
  if (typeof window === 'undefined') {
    return;
  }

  window.sessionStorage.removeItem(storageKey(questionId));
}
