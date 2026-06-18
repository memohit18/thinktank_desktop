'use client';

import { useMemo } from 'react';
import CodeSolveClient from '@/components/code/CodeSolveClient';
import { useProblemProgress } from '@/hooks/useProblemProgress';
import { useGetQuestionByIdQuery } from '@/lib/services/problemsApi';

type CodeSolveLoaderProps = {
  questionId: number;
};

export default function CodeSolveLoader({ questionId }: CodeSolveLoaderProps) {
  const { getStatus } = useProblemProgress();
  const { data, isLoading, isError } = useGetQuestionByIdQuery(questionId);

  const question = useMemo(() => {
    if (!data) return null;
    return {
      ...data,
      status: getStatus(data.slug),
    };
  }, [data, getStatus]);

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center p-6 text-sm text-muted-foreground">
        Loading question...
      </div>
    );
  }

  if (isError || !question) {
    return (
      <div className="flex flex-1 items-center justify-center p-6 text-sm text-red-500">
        Failed to load question. Please try again.
      </div>
    );
  }

  return <CodeSolveClient question={question} />;
}
