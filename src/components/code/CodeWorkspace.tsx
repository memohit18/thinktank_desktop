'use client';

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import CodeEditor from '@/components/code/CodeEditor';
import QuestionSubmissionsPanel from '@/components/code/QuestionSubmissionsPanel';
import QuestionTestResultsPanel from '@/components/code/QuestionTestResultsPanel';
import { useToast } from '@/components/ui/Toast';
import { useProblemProgress } from '@/hooks/useProblemProgress';
import {
  analyzePythonComplexity,
  estimateBeatsPercent,
} from '@/lib/code/analyzePythonComplexity';
import {
  executePython,
  formatExecutionError,
  preloadPyodide,
  type ExecutionResult,
} from '@/lib/code/runPython';
import { formatDisplayValue } from '@/lib/code/formatDisplayValue';
import { formatExpectedTestOutput } from '@/lib/code/testCaseComparison';
import type { CodeQuestion } from '@/lib/code/questions';
import { buildSubmissionPayload } from '@/lib/code/submissionMapper';
import type { QuestionSubmission } from '@/lib/code/submissionTypes';
import {
  loadSubmissionTestResults,
  saveSubmissionTestResults,
} from '@/lib/code/submissionTestResultsStorage';
import { getApiErrorMessage } from '@/lib/services/getApiErrorMessage';
import {
  useGetQuestionSubmissionsQuery,
  useSubmitQuestionMutation,
} from '@/lib/services/problemsApi';

type CodeWorkspaceProps = {
  question: CodeQuestion;
};

type LeftPanelTab = 'question' | 'submissions' | 'test-results';

function difficultyClass(difficulty: CodeQuestion['difficulty']) {
  if (difficulty === 'Easy') return 'difficulty-easy';
  if (difficulty === 'Medium') return 'difficulty-medium';
  return 'difficulty-hard';
}

function localResultStatusLabel(
  status:
    | 'passed'
    | 'wrong_answer'
    | 'runtime_error'
    | 'compilation_error'
    | 'invalid_input',
) {
  switch (status) {
    case 'passed':
      return 'Passed';
    case 'wrong_answer':
      return 'Wrong Answer';
    case 'runtime_error':
      return 'Runtime Error';
    case 'compilation_error':
      return 'Compilation Error';
    case 'invalid_input':
      return 'Invalid Input';
    default:
      return 'Error';
  }
}

function localResultTone(
  status:
    | 'passed'
    | 'wrong_answer'
    | 'runtime_error'
    | 'compilation_error'
    | 'invalid_input',
) {
  if (status === 'passed') return 'success';
  if (status === 'wrong_answer') return 'error';
  return 'warning';
}

function formatLikes(likes: number) {
  if (likes >= 1000) {
    return `${(likes / 1000).toFixed(1).replace(/\.0$/, '')}K`;
  }
  return String(likes);
}

export default function CodeWorkspace({ question }: CodeWorkspaceProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const { updateStatus } = useProblemProgress();
  const { showToast } = useToast();
  const [submitQuestion] = useSubmitQuestionMutation();
  const [code, setCode] = useState(question.starterCode);
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<ExecutionResult | null>(null);
  const [activeCaseIndex, setActiveCaseIndex] = useState(0);
  const [isRuntimeReady, setIsRuntimeReady] = useState(false);
  const [runtimeError, setRuntimeError] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [leftPanel, setLeftPanel] = useState<LeftPanelTab>('question');
  const [latestTestResults, setLatestTestResults] =
    useState<Pick<
      QuestionSubmission,
      | 'submissionId'
      | 'status'
      | 'passedTestCases'
      | 'totalTestCases'
      | 'failureReason'
      | 'testCases'
    > | null>(null);

  const { data: submissionsPreview } = useGetQuestionSubmissionsQuery(
    { questionId: question.number, page: 1, limit: 1 },
    { refetchOnMountOrArgChange: true },
  );
  const hasSubmitted = (submissionsPreview?.meta.total ?? 0) > 0;
  const isTestResultsUnlocked = hasSubmitted || Boolean(latestTestResults?.testCases?.length);

  const activeCase = question.testCases[activeCaseIndex];
  const activeRunResult = activeCase
    ? result?.testResults.find((item) => item.id === activeCase.id)
    : undefined;

  useEffect(() => {
    setCode(question.starterCode);
    setResult(null);
    setActiveCaseIndex(0);
    setLeftPanel('question');
    setLatestTestResults(loadSubmissionTestResults(question.number));
    updateStatus(question.slug, 'in_progress');
  }, [question.id, question.number, question.slug, question.starterCode, updateStatus]);

  useEffect(() => {
    let cancelled = false;

    preloadPyodide();
    getRuntimeReady()
      .then(() => {
        if (!cancelled) {
          setIsRuntimeReady(true);
          setRuntimeError('');
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setIsRuntimeReady(false);
          setRuntimeError(formatExecutionError(error));
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    function onFullscreenChange() {
      setIsFullscreen(Boolean(document.fullscreenElement));
    }

    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () =>
      document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  async function getRuntimeReady() {
    const { getPyodide } = await import('@/lib/code/runPython');
    await getPyodide();
  }

  async function handleRunCode() {
    if (isRunning) return;

    setIsRunning(true);

    try {
      const executionResult = await executePython(code, question.testCases);
      setResult(executionResult);
    } catch (error) {
      setResult({
        consoleOutput: formatExecutionError(error),
        compileError: formatExecutionError(error),
        testResults: question.testCases.map((testCase) => ({
          id: testCase.id,
          passed: false,
          expected: formatExpectedTestOutput(testCase),
          actual: formatExecutionError(error),
          status: 'runtime_error',
          error: 'Execution failed',
          message: formatExecutionError(error),
        })),
        executionTimeMs: 0,
      });
    } finally {
      setIsRunning(false);
    }
  }

  async function recordSubmission() {
    const submission = buildSubmissionPayload(code, 'python');

    try {
      const result = await submitQuestion({
        questionId: question.number,
        body: submission,
      }).unwrap();

      const testResultSnapshot = {
        submissionId: result.submissionId,
        status: result.status,
        passedTestCases: result.passedTestCases,
        totalTestCases: result.totalTestCases,
        failureReason: result.failureReason,
        testCases: result.testCases,
      };

      setLatestTestResults(testResultSnapshot);
      saveSubmissionTestResults(question.number, result);

      if (result.status === 'Accepted') {
        showToast('Submission accepted!');
      } else {
        showToast(`Submission recorded: ${result.status}`, 'error');
      }

      // Keep the current left pane stable on submit to avoid layout shifts.
      // The bottom testcase panel already updates immediately with fresh results.
      if (leftPanel === 'test-results' && result.testCases?.length) {
        setLeftPanel('test-results');
      }
    } catch (error) {
      showToast(
        getApiErrorMessage(error, 'Failed to submit solution.'),
        'error',
      );
    }
  }

  function handleTestResultsTabClick() {
    if (!isTestResultsUnlocked) {
      showToast(
        'Submit your solution at least once to view all test case results.',
        'error',
      );
      return;
    }

    setLeftPanel('test-results');
  }

  async function handleSubmit() {
    if (isRunning) return;

    setIsRunning(true);

    try {
      const executionResult = await executePython(code, question.testCases);
      setResult(executionResult);
      await recordSubmission();

      const passed =
        !executionResult.compileError &&
        executionResult.testResults.every((test) => test.passed);
      if (passed) {
        updateStatus(question.slug, 'solved');
      }
    } catch (error) {
      const executionResult: ExecutionResult = {
        consoleOutput: formatExecutionError(error),
        compileError: formatExecutionError(error),
        testResults: question.testCases.map((testCase) => ({
          id: testCase.id,
          passed: false,
          expected: formatExpectedTestOutput(testCase),
          actual: formatExecutionError(error),
          status: 'runtime_error',
          error: 'Execution failed',
          message: formatExecutionError(error),
        })),
        executionTimeMs: 0,
      };
      setResult(executionResult);
      await recordSubmission();
    } finally {
      setIsRunning(false);
    }
  }

  function handleResetCode() {
    setCode(question.starterCode);
    setResult(null);
    setActiveCaseIndex(0);
  }

  function handleLoadSubmissionCode(submissionCode: string) {
    setCode(submissionCode);
    setResult(null);
    setActiveCaseIndex(0);
    showToast('Submission loaded into editor.');
  }

  function toggleFullscreen() {
    if (!editorRef.current) return;

    if (document.fullscreenElement) {
      void document.exitFullscreen();
      return;
    }

    void editorRef.current.requestFullscreen();
  }

  const passedCount =
    result?.testResults.filter((test) => test.passed).length ?? 0;
  const allPassed =
    result !== null &&
    !result.compileError &&
    passedCount === question.testCases.length;
  const analyzedComplexity = useMemo(
    () => analyzePythonComplexity(code),
    [code],
  );
  const beatsPercent = result
    ? estimateBeatsPercent(
        analyzedComplexity.time,
        question.timeComplexity,
        question.acceptance,
        allPassed,
      )
    : null;

  return (
    <div className="flex min-h-0 flex-1 overflow-hidden">
      <aside className="flex min-h-0 w-[min(34%,410px)] shrink-0 flex-col overflow-hidden border-r border-border bg-card xl:w-[min(37%,450px)]">
        <div className="shrink-0 border-b border-border bg-card px-4 pt-4 lg:px-5 lg:pt-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <h1 className="text-xl font-bold tracking-tight text-foreground lg:text-2xl">
              {question.number}. {question.title}
            </h1>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-md border border-border bg-muted/60 px-2.5 py-1 text-xs font-medium text-muted-foreground">
                {question.category}
              </span>
              <span className="rounded-md border border-border bg-muted/60 px-2.5 py-1 text-xs font-medium text-muted-foreground">
                {question.pattern}
              </span>
              <span
                className={`rounded-md px-2.5 py-1 text-xs font-semibold ${difficultyClass(question.difficulty)}`}
              >
                {question.difficulty}
              </span>
            </div>
          </div>

          <div className="mt-3 flex gap-0.5 border-b border-border">
            <PanelTab
              active={leftPanel === 'question'}
              onClick={() => setLeftPanel('question')}
            >
              Question
            </PanelTab>
            <PanelTab
              active={leftPanel === 'submissions'}
              onClick={() => setLeftPanel('submissions')}
            >
              Submissions
            </PanelTab>
            <PanelTab
              active={leftPanel === 'test-results'}
              locked={!isTestResultsUnlocked}
              onClick={handleTestResultsTabClick}
            >
              Test Results
            </PanelTab>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-hidden">
          {leftPanel === 'question' ? (
            <div className="h-full overflow-y-auto p-4 lg:p-5">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
            {question.likes ? (
              <span className="inline-flex items-center gap-1.5">
                <ThumbsUpIcon className="size-4" />
                {formatLikes(question.likes)}
              </span>
            ) : null}
            <button
              type="button"
              aria-label="Bookmark"
              className="inline-flex items-center text-muted-foreground transition-colors hover:text-accent"
            >
              <BookmarkIcon className="size-4" />
            </button>
          </div>

          <p className="mt-4 whitespace-pre-line text-[13px] leading-6 text-foreground/90 lg:text-sm lg:leading-7">
            {question.description}
          </p>

          <div className="mt-5 space-y-3">
            {question.examples.map((example) => (
              <div
                key={example.label}
                className="rounded-xl border border-border bg-muted/50 p-3.5"
              >
                <p className="text-sm font-semibold text-foreground">
                  {example.label}:
                </p>
                <div className="mt-2.5 space-y-2 text-[13px] lg:text-sm">
                  <p>
                    <span className="font-medium text-muted-foreground">
                      Input:{' '}
                    </span>
                    <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">
                      {example.input}
                    </code>
                  </p>
                  <p>
                    <span className="font-medium text-muted-foreground">
                      Output:{' '}
                    </span>
                    <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">
                      {example.output}
                    </code>
                  </p>
                  {example.explanation ? (
                    <p className="text-muted-foreground">
                      <span className="font-medium text-foreground">
                        Explanation:{' '}
                      </span>
                      {example.explanation}
                    </p>
                  ) : null}
                </div>
              </div>
            ))}
          </div>

          {question.constraints.length > 0 ? (
            <div className="mt-5">
              <p className="text-sm font-semibold text-foreground">
                Constraints:
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-[13px] text-muted-foreground lg:text-sm">
                {question.constraints.map((constraint) => (
                  <li key={constraint}>{constraint}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {question.hints.length > 0 ? (
            <div className="mt-5">
              <p className="text-sm font-semibold text-foreground">Hints:</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-[13px] text-muted-foreground lg:text-sm">
                {question.hints.map((hint) => (
                  <li key={hint}>{hint}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {question.edgeCases.length > 0 ? (
            <div className="mt-5">
              <p className="text-sm font-semibold text-foreground">
                Edge Cases:
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-[13px] text-muted-foreground lg:text-sm">
                {question.edgeCases.map((edgeCase) => (
                  <li key={edgeCase}>{edgeCase}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {question.followUps.length > 0 ? (
            <div className="mt-5">
              <p className="text-sm font-semibold text-foreground">
                Follow-up Questions:
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-[13px] text-muted-foreground lg:text-sm">
                {question.followUps.map((followUp) => (
                  <li key={followUp}>{followUp}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {question.tags.length > 0 ? (
            <div className="mt-5 flex flex-wrap gap-2">
              {question.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-border bg-muted/50 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
            </div>
          ) : leftPanel === 'submissions' ? (
            <div className="h-full overflow-hidden p-4 lg:p-5">
              <QuestionSubmissionsPanel
                questionId={question.number}
                active={leftPanel === 'submissions'}
                onLoadCode={handleLoadSubmissionCode}
              />
            </div>
          ) : (
            <div className="h-full overflow-hidden p-4 lg:p-5">
              <QuestionTestResultsPanel
                status={latestTestResults?.status ?? '—'}
                passedTestCases={latestTestResults?.passedTestCases ?? 0}
                totalTestCases={latestTestResults?.totalTestCases ?? 0}
                failureReason={latestTestResults?.failureReason}
                testCases={latestTestResults?.testCases ?? []}
              />
            </div>
          )}
        </div>
      </aside>

      <div className="grid min-w-0 flex-1 grid-rows-[minmax(0,1fr)_15rem] overflow-hidden xl:grid-rows-[minmax(0,1fr)_16rem]">
        <div className="min-h-0 px-2 pt-2 lg:px-2 lg:pt-2">
          <div
            ref={editorRef}
            className={`flex h-full min-h-0 min-w-0 flex-col overflow-hidden rounded-lg border border-border/70 ${isFullscreen ? 'bg-[#1e1e1e]' : ''}`}
          >
            <div className="flex items-center justify-between border-b border-border bg-[#2d2d2d] px-3 py-1.5 lg:px-3.5 lg:py-1.5">
              <div className="flex items-center gap-2 text-sm text-neutral-200">
                <CodeIcon className="size-4 text-neutral-400" />
                <span className="font-medium">solution.py</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  aria-label="Reset to starter code"
                  onClick={handleResetCode}
                  className="flex size-8 items-center justify-center rounded-md text-neutral-400 transition-colors hover:bg-white/10 hover:text-neutral-200"
                  title="Reset"
                >
                  <ResetIcon className="size-4" />
                </button>
                <button
                  type="button"
                  aria-label="Editor settings"
                  className="flex size-8 items-center justify-center rounded-md text-neutral-400 transition-colors hover:bg-white/10 hover:text-neutral-200"
                >
                  <SettingsIcon className="size-4" />
                </button>
                <button
                  type="button"
                  aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                  onClick={toggleFullscreen}
                  className="flex size-8 items-center justify-center rounded-md text-neutral-400 transition-colors hover:bg-white/10 hover:text-neutral-200"
                >
                  <FullscreenIcon className="size-4" />
                </button>
              </div>
            </div>
            <div className="min-h-0 flex-1 bg-[#1e1e1e]">
              <CodeEditor value={code} onChange={setCode} alwaysDark />
            </div>
            {runtimeError ? (
              <p className="border-t border-border bg-card px-4 py-2 text-xs text-red-500">
                {runtimeError}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex min-h-0 min-w-0 flex-col overflow-hidden border-t border-border lg:flex-row">
          <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden border-b border-border bg-card lg:border-b-0 lg:border-r">
            <div className="border-b border-border px-3 py-2 lg:px-3.5 lg:py-2.5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[13px] font-semibold text-foreground">Testcases</p>
                <button
                  type="button"
                  disabled
                  className="text-xs font-medium text-muted-foreground"
                >
                  + Add
                </button>
              </div>
              {question.judging?.comparisonNote ? (
                <p className="mt-1.5 text-[11px] text-muted-foreground">
                  {question.judging.comparisonNote}
                </p>
              ) : null}
              {question.testcaseSummary ? (
                <p className="mt-1 text-[10px] text-muted-foreground/80">
                  {question.testcaseSummary.sample} sample ·{' '}
                  {question.testcaseSummary.hidden} hidden ·{' '}
                  {question.testcaseSummary.countOnly} count-only checks
                </p>
              ) : null}
            </div>

            <div className="flex min-h-0 flex-1 overflow-hidden">
              <div className="w-20 shrink-0 space-y-1 border-r border-border p-1.5 lg:w-24">
                {question.testCases.map((testCase, index) => {
                  const testResult = result?.testResults.find(
                    (item) => item.id === testCase.id,
                  );
                  const isActive = activeCaseIndex === index;

                  return (
                    <button
                      key={testCase.id}
                      type="button"
                      onClick={() => setActiveCaseIndex(index)}
                      className={`flex w-full items-center gap-1.5 rounded-lg px-1.5 py-1.5 text-left text-[10px] font-medium transition-colors lg:px-2 lg:text-[11px] ${
                        isActive
                          ? 'bg-muted text-foreground'
                          : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                      }`}
                    >
                      <span
                        className={`size-2 shrink-0 rounded-full ${
                          testResult
                            ? testResult.status === 'passed'
                              ? 'bg-accent'
                              : testResult.status === 'wrong_answer'
                                ? 'bg-red-500'
                                : 'bg-amber-500'
                            : 'bg-border'
                        }`}
                      />
                      Case {index + 1}
                    </button>
                  );
                })}
              </div>

              <div className="min-w-0 flex-1 overflow-hidden p-2 lg:p-2.5">
                {activeCase ? (
                  <div className="flex h-full min-h-0 flex-col gap-2">
                    <div className="flex shrink-0 flex-wrap items-center justify-between gap-2">
                      {activeRunResult ? (
                        <div
                          className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                            localResultTone(activeRunResult.status) === 'success'
                              ? 'border-accent/30 bg-accent/5 text-accent'
                              : localResultTone(activeRunResult.status) === 'warning'
                                ? 'border-amber-500/30 bg-amber-500/10 text-amber-600'
                                : 'border-red-500/30 bg-red-500/10 text-red-500'
                          }`}
                        >
                          {localResultStatusLabel(activeRunResult.status)}
                        </div>
                      ) : (
                        <div />
                      )}
                      {result ? (
                        <p className="text-[11px] text-muted-foreground">
                          {result.executionTimeMs}ms
                        </p>
                      ) : null}
                    </div>

                    <div className="grid min-h-0 flex-1 gap-2 lg:grid-cols-2">
                      <Field label="Input" value={activeCase.input} />
                      {activeCase.validationType === 'count_only' ? (
                        <Field
                          label="Validation"
                          value="Count-only (order does not matter)"
                        />
                      ) : (
                        <Field
                          label="Expected Output"
                          value={formatExpectedTestOutput(activeCase)}
                        />
                      )}
                      {result ? (
                        <Field
                          label="Your Output"
                          value={activeRunResult?.actual ?? '—'}
                          tone={
                            activeRunResult
                              ? localResultTone(activeRunResult.status)
                              : undefined
                          }
                        />
                      ) : null}
                      {activeCase.validationType === 'count_only' ? (
                        <Field
                          label="Expected Count"
                          value={String(activeCase.expectedOutputCount ?? 0)}
                        />
                      ) : null}
                      {activeRunResult?.message ? (
                        <Field
                          label="Details"
                          value={activeRunResult.message}
                          tone={
                            activeRunResult.status === 'passed'
                              ? 'success'
                              : activeRunResult.status === 'wrong_answer'
                                ? 'error'
                                : 'warning'
                          }
                          spanFull
                        />
                      ) : null}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </section>

          <section className="flex min-h-0 w-full shrink-0 flex-col overflow-hidden bg-card lg:w-52 xl:w-56">
            <div className="border-b border-border px-3 py-2 lg:px-3.5 lg:py-2.5">
              <p className="text-[13px] font-semibold text-foreground">
                Performance
              </p>
            </div>

            <div className="flex min-h-0 flex-1 flex-col p-2.5 lg:p-3">
              <div className="min-h-0 flex-1 space-y-2.5 overflow-hidden pr-1">
                {result ? (
                  <>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Execution Time
                      </p>
                      <p className="mt-1 text-sm font-semibold text-accent">
                        {result.executionTimeMs}ms
                      </p>
                    </div>

                    {beatsPercent !== null && !result.compileError ? (
                      <div>
                        <div className="mb-1.5 flex items-center justify-between text-[11px] text-muted-foreground">
                          <span>Runtime percentile</span>
                          <span>{beatsPercent}%</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-accent transition-all"
                            style={{ width: `${beatsPercent}%` }}
                          />
                        </div>
                        <p className="mt-1.5 text-[11px] text-muted-foreground">
                          Beats {beatsPercent}% of users with Python3
                        </p>
                      </div>
                    ) : null}

                    {result.compileError ? (
                      <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-500">
                        {result.compileError}
                      </div>
                    ) : null}

                    {allPassed ? (
                      <p className="text-[11px] font-medium text-accent">
                        All test cases passed
                      </p>
                    ) : null}

                    {result.consoleOutput &&
                    result.consoleOutput !== 'No console output.' ? (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">
                          Console
                        </p>
                        <pre className="mt-1 max-h-24 overflow-y-auto rounded-lg border border-border bg-muted/50 p-2 font-mono text-xs text-foreground">
                          {result.consoleOutput}
                        </pre>
                      </div>
                    ) : null}
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Run your code to see execution stats and results.
                  </p>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <StatCard
                    label="Time Comp."
                    value={analyzedComplexity.time}
                  />
                  <StatCard
                    label="Space Comp."
                    value={analyzedComplexity.space}
                  />
                </div>
              </div>

              <div className="mt-2.5 shrink-0 space-y-2 border-t border-border/70 pt-2.5">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleRunCode}
                    disabled={isRunning || !isRuntimeReady}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-border bg-muted px-2.5 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted/80 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <PlayIcon className="size-4" />
                    {isRunning
                      ? 'Running...'
                      : isRuntimeReady
                        ? 'Run'
                        : 'Loading...'}
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isRunning || !isRuntimeReady}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-accent px-2.5 py-2 text-xs font-semibold text-accent-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 dark:text-black"
                  >
                    <SubmitIcon className="size-4" />
                    Submit
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function PanelTab({
  active,
  locked = false,
  onClick,
  children,
}: {
  active: boolean;
  locked?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-disabled={locked}
      className={`inline-flex items-center gap-1.5 border-b-2 px-2.5 py-1.5 text-xs font-medium transition-colors lg:px-3 lg:py-2 lg:text-sm ${
        active
          ? 'border-accent text-foreground'
          : locked
            ? 'cursor-not-allowed border-transparent text-muted-foreground/60'
            : 'border-transparent text-muted-foreground hover:text-foreground'
      }`}
    >
      {children}
      {locked ? <LockIcon className="size-3.5 opacity-70" /> : null}
    </button>
  );
}

function Field({
  label,
  value,
  tone,
  spanFull = false,
}: {
  label: string;
  value: string;
  tone?: 'success' | 'error' | 'warning';
  spanFull?: boolean;
}) {
  return (
    <div className={`flex min-h-0 flex-col ${spanFull ? 'lg:col-span-2' : ''}`}>
      <p className="mb-1 text-[11px] font-medium text-muted-foreground">
        {label}
      </p>
      <pre
        className={`min-h-0 flex-1 overflow-auto whitespace-pre-wrap wrap-break-word rounded-lg border p-2 font-mono text-[10px] leading-relaxed ${
          tone === 'success'
            ? 'border-accent/30 bg-accent/5 text-foreground'
            : tone === 'warning'
              ? 'border-amber-500/30 bg-amber-500/10 text-foreground'
            : tone === 'error'
              ? 'border-red-500/30 bg-red-500/5 text-foreground'
              : 'border-border bg-muted/40 text-foreground'
        }`}
      >
        {formatDisplayValue(value)}
      </pre>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-muted/40 px-2 py-1.5">
      <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 font-mono text-[12px] font-semibold text-foreground">
        {value}
      </p>
    </div>
  );
}

function ThumbsUpIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M7 10v12" />
      <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.76l-2.33 8.02a2 2 0 0 1-1.92 1.48H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h3" />
    </svg>
  );
}

function BookmarkIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function CodeIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="m16 18 6-6-6-6" />
      <path d="m8 6-6 6 6 6" />
    </svg>
  );
}

function ResetIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M3 21v-5h5" />
    </svg>
  );
}

function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function FullscreenIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M8 3H5a2 2 0 0 0-2 2v3" />
      <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
      <path d="M3 16v3a2 2 0 0 0 2 2h3" />
      <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
    </svg>
  );
}

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function SubmitIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" x2="12" y1="3" y2="15" />
    </svg>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}
