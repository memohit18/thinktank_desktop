'use client';

import { useState } from 'react';
import type { SubmissionTestCaseResult } from '@/lib/code/submissionTypes';
import { formatDisplayValue } from '@/lib/code/formatDisplayValue';

type QuestionTestResultsPanelProps = {
  status: string;
  passedTestCases: number;
  totalTestCases: number;
  failureReason?: string;
  testCases: SubmissionTestCaseResult[];
};

function testcaseStatusClass(status: SubmissionTestCaseResult['status']) {
  if (status === 'passed') return 'text-accent';
  if (status === 'wrong_answer') return 'text-red-500';
  if (status === 'skipped') return 'text-muted-foreground';
  return 'text-amber-500';
}

function testcaseStatusLabel(status: SubmissionTestCaseResult['status']) {
  switch (status) {
    case 'passed':
      return 'Passed';
    case 'wrong_answer':
      return 'Wrong Answer';
    case 'runtime_error':
      return 'Runtime Error';
    case 'compilation_error':
      return 'Compilation Error';
    case 'time_limit_exceeded':
      return 'Time Limit Exceeded';
    case 'invalid_input':
      return 'Invalid Input';
    case 'skipped':
      return 'Skipped';
    default:
      return status;
  }
}

export default function QuestionTestResultsPanel({
  status,
  passedTestCases,
  totalTestCases,
  failureReason,
  testCases,
}: QuestionTestResultsPanelProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeCase = testCases[activeIndex];

  if (testCases.length === 0) {
    return (
      <div className="flex h-full items-center justify-center py-12 text-center">
        <div>
        <p className="text-sm font-medium text-foreground">No test results yet</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Submit your solution again to load detailed test case results.
        </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <div className="shrink-0 rounded-xl border border-border bg-muted/30 p-2.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-foreground">{status}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {passedTestCases}/{totalTestCases} test cases passed
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            {testCases.filter((testCase) => testCase.isHidden).length} hidden ·{' '}
            {testCases.filter((testCase) => testCase.isSample).length} sample
          </p>
        </div>
        {failureReason ? (
          <p className="mt-3 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-xs text-red-500">
            {failureReason}
          </p>
        ) : null}
      </div>

      <div className="min-h-0 flex-1 overflow-hidden rounded-xl border border-border bg-card">
        <div className="flex h-full min-h-0">
          <div className="w-20 shrink-0 space-y-1 overflow-y-auto border-r border-border p-2">
            {testCases.map((testCase, index) => {
              const isActive = activeIndex === index;

              return (
                <button
                  key={testCase.index}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={`flex w-full flex-col gap-1 rounded-lg px-2 py-1.5 text-left text-[10px] font-medium transition-colors ${
                    isActive
                      ? 'bg-muted text-foreground'
                      : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                  }`}
                >
                  <span className="inline-flex items-center gap-2">
                    <span
                      className={`size-2 shrink-0 rounded-full ${
                        testCase.passed ? 'bg-accent' : 'bg-red-500'
                      }`}
                    />
                    Case {testCase.index}
                  </span>
                  {testCase.isHidden ? (
                    <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                      Hidden
                    </span>
                  ) : testCase.isSample ? (
                    <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                      Sample
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>

          {activeCase ? (
            <div className="min-w-0 flex-1 space-y-2.5 overflow-y-auto p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p
                  className={`text-sm font-semibold ${testcaseStatusClass(activeCase.status)}`}
                >
                  {testcaseStatusLabel(activeCase.status)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {activeCase.executionTimeMs}ms
                </p>
              </div>

              <ResultField label="Input" value={formatDisplayValue(activeCase.input)} />
              {activeCase.validationType === 'count_only' ? (
                <ResultField
                  label="Expected Count"
                  value={String(activeCase.expectedOutputCount ?? 0)}
                />
              ) : (
                <ResultField
                  label="Expected Output"
                  value={formatDisplayValue(activeCase.expectedOutput)}
                />
              )}
              <ResultField
                label="Your Output"
                value={formatDisplayValue(activeCase.actualOutput)}
                tone={activeCase.passed ? 'success' : 'error'}
              />
              {activeCase.message ? (
                <ResultField label="Details" value={activeCase.message} tone="error" />
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function ResultField({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: 'success' | 'error';
}) {
  return (
    <div>
      <p className="mb-1.5 text-xs font-medium text-muted-foreground">{label}</p>
      <pre
        className={`overflow-auto whitespace-pre-wrap wrap-break-word rounded-lg border p-2.5 font-mono text-[11px] leading-relaxed ${
          tone === 'success'
            ? 'border-accent/30 bg-accent/5 text-foreground'
            : tone === 'error'
              ? 'border-red-500/30 bg-red-500/5 text-foreground'
              : 'border-border bg-muted/40 text-foreground'
        }`}
      >
        {value}
      </pre>
    </div>
  );
}
