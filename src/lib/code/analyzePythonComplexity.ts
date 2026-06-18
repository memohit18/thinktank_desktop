export type ComplexityEstimate = {
  time: string;
  space: string;
};

const TIME_BY_LOOP_DEPTH: Record<number, string> = {
  0: 'O(1)',
  1: 'O(n)',
  2: 'O(n²)',
  3: 'O(n³)',
};

function normalizeIndent(line: string) {
  return line.replace(/\t/g, '    ').match(/^(\s*)/)?.[1].length ?? 0;
}

function stripComments(line: string) {
  return line.replace(/#.*$/, '').trimEnd();
}

function isLoopLine(line: string) {
  return /^\s*(?:async\s+)?(?:for|while)\b/.test(line);
}

function maxLoopNesting(code: string) {
  const loopIndents: number[] = [];
  let maxDepth = 0;

  for (const rawLine of code.split('\n')) {
    const line = stripComments(rawLine);
    const trimmed = line.trim();

    if (!trimmed) {
      continue;
    }

    const indent = normalizeIndent(line);

    while (loopIndents.length > 0 && indent <= loopIndents[loopIndents.length - 1]) {
      loopIndents.pop();
    }

    if (isLoopLine(line)) {
      loopIndents.push(indent);
      maxDepth = Math.max(maxDepth, loopIndents.length);
    }
  }

  return maxDepth;
}

function hasRecursion(code: string) {
  const functionNames = [...code.matchAll(/^\s*def\s+([A-Za-z_]\w*)/gm)].map(
    (match) => match[1],
  );

  return functionNames.some((name) => {
    const callPattern = new RegExp(`\\b${name}\\s*\\(`, 'm');
    const bodyPattern = new RegExp(
      `def\\s+${name}\\s*\\([^)]*\\):[\\s\\S]*?${callPattern.source}`,
      'm',
    );
    return bodyPattern.test(code);
  });
}

function estimateTimeComplexity(code: string) {
  const loopDepth = maxLoopNesting(code);

  if (hasRecursion(code) && loopDepth === 0) {
    return 'O(2^n)';
  }

  if (loopDepth >= 4) {
    return `O(n^${loopDepth})`;
  }

  return TIME_BY_LOOP_DEPTH[loopDepth] ?? 'O(1)';
}

function estimateSpaceComplexity(code: string) {
  const loopDepth = maxLoopNesting(code);
  const usesHashMap =
    /\b(dict|set|defaultdict|Counter)\b/.test(code) ||
    /\{[^}]*:[^}]*\}/.test(code);
  const buildsNestedList =
    loopDepth >= 2 && /\[\s*\[/.test(code.replace(/\[\]/g, ''));

  if (buildsNestedList || (usesHashMap && loopDepth >= 2)) {
    return 'O(n²)';
  }

  if (usesHashMap || (/\blist\s*\(/.test(code) && loopDepth >= 1)) {
    return 'O(n)';
  }

  if (loopDepth >= 2) {
    return 'O(1)';
  }

  return 'O(1)';
}

export function analyzePythonComplexity(code: string): ComplexityEstimate {
  return {
    time: estimateTimeComplexity(code),
    space: estimateSpaceComplexity(code),
  };
}

export function complexityRank(complexity: string) {
  const normalized = complexity.replace(/\s/g, '').toLowerCase();

  if (normalized === 'o(1)') return 0;
  if (normalized === 'o(logn)') return 1;
  if (normalized === 'o(n)') return 2;
  if (normalized === 'o(nlogn)') return 3;
  if (normalized === 'o(n²)' || normalized === 'o(n^2)') return 4;
  if (normalized === 'o(n³)' || normalized === 'o(n^3)') return 5;
  if (normalized.startsWith('o(n^')) {
    const exponent = Number(normalized.match(/\^(\d+)/)?.[1] ?? 4);
    return Math.min(6 + exponent, 10);
  }
  if (normalized === 'o(2^n)') return 8;

  return 3;
}

export function estimateBeatsPercent(
  userTime: string,
  optimalTime: string | undefined,
  acceptance: number,
  allPassed: boolean,
) {
  if (!allPassed) {
    return null;
  }

  const optimal = optimalTime ?? 'O(n)';
  const gap = complexityRank(userTime) - complexityRank(optimal);
  const penalty = Math.max(0, gap) * 18;

  return Math.max(5, Math.min(99, Math.round(acceptance - penalty)));
}
