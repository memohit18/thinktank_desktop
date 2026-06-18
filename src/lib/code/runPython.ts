const PYODIDE_VERSION = '0.26.4';
const PYODIDE_CDN = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;

import type { TestCase } from '@/lib/code/questions';
import {
  buildPythonComparisonScript,
  formatExpectedTestOutput,
} from '@/lib/code/testCaseComparison';

type PyodideInterface = {
  runPythonAsync: (code: string) => Promise<unknown>;
  globals: {
    set: (name: string, value: unknown) => void;
    get: (name: string) => unknown;
  };
};

declare global {
  interface Window {
    loadPyodide?: (config: { indexURL: string }) => Promise<PyodideInterface>;
  }
}

export type TestRunResult = {
  id: string;
  passed: boolean;
  expected: string;
  actual: string;
  error: string | null;
};

export type ExecutionResult = {
  consoleOutput: string;
  compileError: string | null;
  testResults: TestRunResult[];
  executionTimeMs: number;
};

let pyodidePromise: Promise<PyodideInterface> | null = null;
let pyodideLoading = false;
let comparisonHelpersReady = false;

function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${src}"]`,
    );

    if (existing) {
      if (existing.dataset.loaded === 'true') {
        resolve();
        return;
      }

      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener(
        'error',
        () => reject(new Error('Failed to load Python runtime.')),
        { once: true },
      );
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = () => {
      script.dataset.loaded = 'true';
      resolve();
    };
    script.onerror = () => reject(new Error('Failed to load Python runtime.'));
    document.head.appendChild(script);
  });
}

async function createPyodide() {
  await loadScript(`${PYODIDE_CDN}pyodide.js`);

  if (!window.loadPyodide) {
    throw new Error('Python runtime failed to initialize.');
  }

  return window.loadPyodide({ indexURL: PYODIDE_CDN });
}

export async function getPyodide() {
  if (pyodidePromise) {
    return pyodidePromise;
  }

  if (pyodideLoading) {
    while (pyodideLoading && !pyodidePromise) {
      await new Promise((resolve) => window.setTimeout(resolve, 50));
    }

    if (pyodidePromise) {
      return pyodidePromise;
    }
  }

  pyodideLoading = true;

  pyodidePromise = createPyodide().catch((error) => {
    pyodidePromise = null;
    throw error;
  });

  try {
    return await pyodidePromise;
  } finally {
    pyodideLoading = false;
  }
}

async function ensureComparisonHelpers(pyodide: PyodideInterface) {
  if (comparisonHelpersReady) return;
  await pyodide.runPythonAsync(buildPythonComparisonScript());
  comparisonHelpersReady = true;
}

export function preloadPyodide() {
  void getPyodide().catch(() => {
    pyodidePromise = null;
    comparisonHelpersReady = false;
  });
}

function formatError(error: unknown) {
  if (error instanceof Error) {
    return error.message.replace(/^PythonError:\s*/i, '').trim();
  }

  return 'Execution failed.';
}

async function runInSandbox(
  pyodide: PyodideInterface,
  userCode: string,
  runExpression?: string,
) {
  pyodide.globals.set('__user_code__', userCode);
  pyodide.globals.set('__run_expression__', runExpression ?? '');

  await pyodide.runPythonAsync(`
import sys
from io import StringIO

_stdout = StringIO()
_stderr = StringIO()
_old_stdout = sys.stdout
_old_stderr = sys.stderr
sys.stdout = _stdout
sys.stderr = _stderr

_exec_error = None
_test_error = None
_test_result = None
_namespace = {"__name__": "__main__"}

try:
    exec(__user_code__, _namespace)
except Exception as exc:
    _exec_error = f"{type(exc).__name__}: {exc}"

if _exec_error is None and __run_expression__:
    try:
        _test_result = eval(__run_expression__, _namespace)
        _test_result_repr = repr(_test_result)
    except Exception as exc:
        _test_error = f"{type(exc).__name__}: {exc}"
        _test_result_repr = None
else:
    _test_result_repr = None

sys.stdout = _old_stdout
sys.stderr = _old_stderr
`);

  const stdout = String(await pyodide.runPythonAsync('_stdout.getvalue()'));
  const stderr = String(await pyodide.runPythonAsync('_stderr.getvalue()'));
  const execError = await pyodide.runPythonAsync('_exec_error');
  const testError = await pyodide.runPythonAsync('_test_error');
  const testResult = await pyodide.runPythonAsync('_test_result_repr');

  const output = [stdout, stderr].filter(Boolean).join('\n').trim();

  return {
    output,
    execError: execError ? String(execError) : null,
    testError: testError ? String(testError) : null,
    testResult:
      testResult === null || testResult === undefined
        ? null
        : String(testResult),
    rawResult: await pyodide.runPythonAsync('_test_result'),
  };
}

async function compareResults(
  pyodide: PyodideInterface,
  actual: unknown,
  testCase: TestCase,
) {
  pyodide.globals.set('__actual_result__', actual);
  pyodide.globals.set('__expected_repr__', testCase.expectedOutput ?? '');
  pyodide.globals.set('__validation_type__', testCase.validationType);
  pyodide.globals.set(
    '__expected_count__',
    testCase.expectedOutputCount ?? -1,
  );
  pyodide.globals.set('__comparison_mode__', testCase.comparisonMode);

  const passed = await pyodide.runPythonAsync(`
__compare_test_result(
    __actual_result__,
    __expected_repr__,
    __validation_type__,
    __expected_count__,
    __comparison_mode__,
)
`);

  return Boolean(passed);
}

export async function executePython(
  userCode: string,
  testCases: TestCase[],
): Promise<ExecutionResult> {
  const startedAt = performance.now();
  const pyodide = await getPyodide();
  await ensureComparisonHelpers(pyodide);
  const consoleLines: string[] = [];

  const initialRun = await runInSandbox(pyodide, userCode);

  if (initialRun.output) {
    consoleLines.push(initialRun.output);
  }

  if (initialRun.execError) {
    return {
      consoleOutput: consoleLines.join('\n') || 'No console output.',
      compileError: initialRun.execError,
      testResults: testCases.map((testCase) => ({
        id: testCase.id,
        passed: false,
        expected: formatExpectedTestOutput(testCase),
        actual: '—',
        error: initialRun.execError,
      })),
      executionTimeMs: Math.round(performance.now() - startedAt),
    };
  }

  const testResults: TestRunResult[] = [];

  for (const testCase of testCases) {
    const testRun = await runInSandbox(
      pyodide,
      userCode,
      testCase.runExpression,
    );

    if (testRun.output) {
      consoleLines.push(testRun.output);
    }

    if (testRun.execError || testRun.testError) {
      testResults.push({
        id: testCase.id,
        passed: false,
        expected: formatExpectedTestOutput(testCase),
        actual: 'Error',
        error: testRun.execError ?? testRun.testError,
      });
      continue;
    }

    const actual = testRun.testResult ?? 'None';
    const passed = await compareResults(pyodide, testRun.rawResult, testCase);

    let actualDisplay = actual;
    if (testCase.validationType === 'count_only') {
      pyodide.globals.set('__actual_result__', testRun.rawResult);
      const resultCount = Number(
        await pyodide.runPythonAsync(`
len(__actual_result__) if isinstance(__actual_result__, (list, tuple, set)) else 0
`),
      );
      actualDisplay = `${resultCount} result${resultCount === 1 ? '' : 's'}`;
    }

    testResults.push({
      id: testCase.id,
      passed,
      expected: formatExpectedTestOutput(testCase),
      actual: actualDisplay,
      error: null,
    });
  }

  return {
    consoleOutput: consoleLines.join('\n') || 'No console output.',
    compileError: null,
    testResults,
    executionTimeMs: Math.round(performance.now() - startedAt),
  };
}

export function formatExecutionError(error: unknown) {
  return formatError(error);
}
