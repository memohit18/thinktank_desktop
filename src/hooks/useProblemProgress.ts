'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  countSolved,
  getAllProgress,
  getProblemStatus,
  setProblemStatus,
  type ProgressMap,
} from '@/lib/code/progressStorage';
import type { QuestionStatus } from '@/lib/code/questions';

export function useProblemProgress() {
  const [progress, setProgress] = useState<ProgressMap>({});
  const [solvedCount, setSolvedCount] = useState(0);

  const refresh = useCallback(() => {
    setProgress(getAllProgress());
    setSolvedCount(countSolved());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const updateStatus = useCallback(
    (slug: string, status: QuestionStatus) => {
      setProblemStatus(slug, status);
      refresh();
    },
    [refresh],
  );

  const getStatus = useCallback(
    (slug: string) => progress[slug] ?? getProblemStatus(slug),
    [progress],
  );

  return { progress, solvedCount, refresh, updateStatus, getStatus };
}
