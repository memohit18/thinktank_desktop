import type { ExecutionResult } from '@/lib/code/runPython';

export type SubmissionLanguage = 'python' | 'javascript';

export type SubmissionStatus =
  | 'Accepted'
  | 'Wrong Answer'
  | 'Compile Error'
  | 'Runtime Error';

export type QuestionSubmissionPayload = {
  language: SubmissionLanguage;
  code: string;
  status: SubmissionStatus;
  passedTestCases: number;
  totalTestCases: number;
  executionTime: number;
  memoryUsed: number;
};

function resolveSubmissionStatus(
  executionResult: ExecutionResult,
  totalTestCases: number,
  passedTestCases: number,
): SubmissionStatus {
  if (executionResult.compileError) {
    return 'Compile Error';
  }

  if (executionResult.testResults.some((test) => test.error)) {
    return 'Runtime Error';
  }

  if (passedTestCases === totalTestCases && totalTestCases > 0) {
    return 'Accepted';
  }

  return 'Wrong Answer';
}

function estimateMemoryUsedKb(code: string) {
  const memory = (
    performance as Performance & {
      memory?: { usedJSHeapSize: number };
    }
  ).memory;

  if (memory?.usedJSHeapSize) {
    return Math.round(memory.usedJSHeapSize / 1024);
  }

  return Math.max(1, Math.round(new TextEncoder().encode(code).length / 1024));
}

export function mapExecutionToSubmission(
  code: string,
  language: SubmissionLanguage,
  executionResult: ExecutionResult,
  totalTestCases: number,
): QuestionSubmissionPayload {
  const passedTestCases = executionResult.testResults.filter(
    (test) => test.passed,
  ).length;

  return {
    language,
    code,
    status: resolveSubmissionStatus(
      executionResult,
      totalTestCases,
      passedTestCases,
    ),
    passedTestCases,
    totalTestCases,
    executionTime: executionResult.executionTimeMs,
    memoryUsed: estimateMemoryUsedKb(code),
  };
}
