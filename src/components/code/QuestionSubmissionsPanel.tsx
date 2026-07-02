'use client';

import { useState } from 'react';
import Pagination from '@/components/ui/Pagination';
import { useGetQuestionSubmissionsQuery } from '@/lib/services/problemsApi';

const PAGE_SIZE = 10;

type QuestionSubmissionsPanelProps = {
  questionId: number;
  active: boolean;
  onLoadCode: (code: string) => void;
};

function submissionStatusClass(status: string) {
  if (status === 'Accepted') return 'text-accent';
  if (status === 'Wrong Answer') return 'text-red-500';
  if (status === 'Compile Error' || status === 'Runtime Error') {
    return 'text-amber-500';
  }
  return 'text-muted-foreground';
}

function formatSubmittedAt(value?: string) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function QuestionSubmissionsPanel({
  questionId,
  active,
  onLoadCode,
}: QuestionSubmissionsPanelProps) {
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data, isLoading, isError, isFetching } = useGetQuestionSubmissionsQuery(
    { questionId, page, limit: PAGE_SIZE },
    { skip: !active, refetchOnMountOrArgChange: true },
  );

  const submissions = data?.items ?? [];
  const totalPages = data?.meta.totalPages ?? 1;
  const totalItems = data?.meta.total ?? 0;
  const currentPage = Math.min(page, totalPages);

  if (isLoading) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Loading submissions...
      </p>
    );
  }

  if (isError) {
    return (
      <p className="py-8 text-center text-sm text-red-500">
        Failed to load submissions.
      </p>
    );
  }

  if (submissions.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm font-medium text-foreground">No submissions yet</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Submit your solution to see it here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {isFetching && !isLoading ? (
        <p className="text-center text-xs text-muted-foreground">Updating...</p>
      ) : null}

      {submissions.map((submission) => {
        const isExpanded = expandedId === submission.submissionId;

        return (
          <div
            key={submission.submissionId}
            className="overflow-hidden rounded-xl border border-border bg-muted/30"
          >
            <div className="flex w-full flex-col gap-2 px-4 py-3">
              <div className="flex items-start justify-between gap-3">
                <span
                  className={`text-sm font-semibold ${submissionStatusClass(submission.status)}`}
                >
                  {submission.status}
                </span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {formatSubmittedAt(submission.createdAt)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span>
                  Runtime:{' '}
                  <span className="font-medium text-foreground">
                    {submission.executionTime}ms
                  </span>
                </span>
                <span>
                  Memory:{' '}
                  <span className="font-medium text-foreground">
                    {submission.memoryUsed ?? 0} KB
                  </span>
                </span>
                <span>
                  Tests:{' '}
                  <span className="font-medium text-foreground">
                    {submission.passedTestCases}/{submission.totalTestCases}
                  </span>
                </span>
                <span className="capitalize">
                  Lang:{' '}
                  <span className="font-medium text-foreground">
                    {submission.language}
                  </span>
                </span>
              </div>
            </div>

            {submission.code ? (
              <div className="flex items-center justify-between gap-2 border-t border-border bg-card/50 px-4 py-2">
                <button
                  type="button"
                  onClick={() => onLoadCode(submission.code!)}
                  className="text-xs font-semibold text-accent transition-opacity hover:opacity-80"
                >
                  Load in editor
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setExpandedId(isExpanded ? null : submission.submissionId)
                  }
                  className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  {isExpanded ? 'Hide code' : 'View code'}
                </button>
              </div>
            ) : null}

            {isExpanded && submission.code ? (
              <div className="border-t border-border bg-card px-4 py-3">
                <pre className="max-h-48 overflow-auto font-mono text-[11px] leading-relaxed text-foreground">
                  {submission.code}
                </pre>
              </div>
            ) : null}
          </div>
        );
      })}

      {totalPages > 1 ? (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={PAGE_SIZE}
            totalItems={totalItems}
            onPageChange={setPage}
          />
        </div>
      ) : null}
    </div>
  );
}
