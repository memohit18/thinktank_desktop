import type { TestCase } from '@/lib/code/questions';

export function formatExpectedTestOutput(testCase: Pick<
  TestCase,
  'expectedOutput' | 'expectedOutputCount' | 'validationType'
>) {
  if (testCase.validationType === 'count_only') {
    const count = testCase.expectedOutputCount ?? 0;
    return `${count} combination${count === 1 ? '' : 's'}`;
  }

  return testCase.expectedOutput;
}

export function buildPythonComparisonScript() {
  return `
import ast

def __compare_test_result(actual, expected_repr, validation_type, expected_count, comparison_mode):
    if validation_type == 'count_only':
        if isinstance(actual, (list, tuple, set)):
            return len(actual) == int(expected_count)
        return False

    if not expected_repr:
        return False

    try:
        expected = ast.literal_eval(expected_repr)
    except Exception:
        return repr(actual) == expected_repr

    if comparison_mode == 'unordered_array':
        if isinstance(actual, list) and isinstance(expected, list):
            return sorted(str(item) for item in actual) == sorted(str(item) for item in expected)

    return actual == expected
`;
}
