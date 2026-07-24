'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import type { ProblemListItem } from '@/lib/code/problemTypes';
import type { CodeQuestion } from '@/lib/code/questions';
import type { UserProgressItem, UserProgressStatus } from '@/lib/code/userProgressTypes';
import { categoryToSlug, titleToSlug } from '@/lib/code/questionMappers';
import { useGetProblemsQuery, useGetQuestionFiltersQuery } from '@/lib/services/problemsApi';
import {
  useGetUserProgressFiltersQuery,
  useGetUserProgressQuery,
} from '@/lib/services/userProgressApi';
import BulkUploadModal from '@/components/code/BulkUploadModal';
import ProgressOverview from '@/components/code/ProgressOverview';
import RoadmapModal from '@/components/code/RoadmapModal';
import DataTable, { type DataTableColumn } from '@/components/ui/DataTable';
import Pagination from '@/components/ui/Pagination';
import Select from '@/components/ui/Select';

const PAGE_SIZE = 20;

const TABLE_COLUMNS: DataTableColumn[] = [
  { key: 'status', label: 'ST' },
  { key: 'title', label: 'TITLE & DESCRIPTION' },
  { key: 'category', label: 'CATEGORY', headerClassName: 'hidden md:table-cell' },
  { key: 'tags', label: 'TAGS', headerClassName: 'hidden lg:table-cell' },
  { key: 'difficulty', label: 'DIFFICULTY' },
  { key: 'tests', label: 'TESTS', headerClassName: 'hidden sm:table-cell' },
  { key: 'action', label: '', headerClassName: 'w-14' },
];

export default function CodingChallengesPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [difficulty, setDifficulty] = useState('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [showRoadmapModal, setShowRoadmapModal] = useState(false);
  const [progressStatus, setProgressStatus] = useState('all');

  const usesProgressList = ['Attempted', 'Solved', 'Revised', 'Mastered'].includes(
    progressStatus,
  );
  const notStartedMode = progressStatus === 'Not Started';

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query), 300);
    return () => window.clearTimeout(timer);
  }, [query]);

  const { data: filters } = useGetQuestionFiltersQuery();
  const { data: progressFilters } = useGetUserProgressFiltersQuery();
  const {
    data: allProgressData,
    isLoading: isProgressLoading,
    isError: isProgressError,
    isFetching: isProgressFetching,
  } = useGetUserProgressQuery({}, { refetchOnMountOrArgChange: true });

  const problemQueryParams = useMemo(
    () => ({
      category: category === 'all' ? undefined : category,
      difficulty: difficulty === 'all' ? undefined : difficulty,
      tags: selectedTags.length > 0 ? selectedTags.join(',') : undefined,
      search: debouncedQuery || undefined,
      page: notStartedMode ? 1 : page,
      limit: notStartedMode ? 200 : PAGE_SIZE,
    }),
    [category, difficulty, selectedTags, debouncedQuery, page, notStartedMode],
  );

  const { data, isLoading, isError, isFetching } = useGetProblemsQuery(
    problemQueryParams,
    { refetchOnMountOrArgChange: true },
  );

  const progressByQuestionId = useMemo(() => {
    const map = new Map(
      (allProgressData?.items ?? []).map((item) => [item.questionId, item]),
    );
    return map;
  }, [allProgressData?.items]);

  const countsByStatus = useMemo(() => {
    const base =
      progressFilters?.countsByStatus ??
      allProgressData?.filters.countsByStatus;

    if (base) {
      return {
        'Not Started': base['Not Started'] ?? 0,
        Attempted: base.Attempted ?? 0,
        Solved: base.Solved ?? 0,
        Revised: base.Revised ?? 0,
        Mastered: base.Mastered ?? 0,
      } satisfies Record<UserProgressStatus, number>;
    }

    return {
      'Not Started': 0,
      Attempted: 0,
      Solved: 0,
      Revised: 0,
      Mastered: 0,
    } satisfies Record<UserProgressStatus, number>;
  }, [progressFilters, allProgressData?.filters.countsByStatus]);

  const completedCount =
    countsByStatus.Solved + countsByStatus.Revised + countsByStatus.Mastered;

  const progressItemsForList = useMemo(() => {
    if (!usesProgressList) return [];
    const items = allProgressData?.items ?? [];
    if (progressStatus === 'all') return items;
    return items.filter((item) => item.status === progressStatus);
  }, [allProgressData?.items, usesProgressList, progressStatus]);

  const questions = useMemo(() => {
    if (usesProgressList) {
      const pagedItems = progressItemsForList.slice(
        (page - 1) * PAGE_SIZE,
        page * PAGE_SIZE,
      );
      return pagedItems.map((item) => mapProgressItemToRow(item));
    }

    if (!data?.items) return [];

    const unstartedItems = notStartedMode
      ? data.items.filter((item) => !progressByQuestionId.has(item.id))
      : data.items;

    const pagedItems = notStartedMode
      ? unstartedItems.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
      : unstartedItems;

    return pagedItems.map((item) => {
      const progress = progressByQuestionId.get(item.id);
      return mapProblemItemToRow(item, progress);
    });
  }, [
    usesProgressList,
    progressItemsForList,
    data?.items,
    notStartedMode,
    page,
    progressByQuestionId,
  ]);

  const notStartedTotal = useMemo(() => {
    if (!data?.items || !notStartedMode) return 0;
    return data.items.filter((item) => !progressByQuestionId.has(item.id)).length;
  }, [data?.items, notStartedMode, progressByQuestionId]);

  const totalPages = usesProgressList
    ? Math.max(1, Math.ceil(progressItemsForList.length / PAGE_SIZE))
    : notStartedMode
      ? Math.max(1, Math.ceil(notStartedTotal / PAGE_SIZE))
      : (data?.totalPages ?? Math.max(1, Math.ceil((data?.total ?? 0) / PAGE_SIZE)));
  const categoryCount = useMemo(() => {
    if (!data?.items?.length) return 0;
    return new Set(data.items.map((item) => item.category)).size;
  }, [data?.items]);
  const currentPage = Math.min(page, totalPages);

  function handleToggleTag(tag: string) {
    setSelectedTags((current) => {
      if (current.includes(tag)) {
        return current.filter((item) => item !== tag);
      }
      return [...current, tag];
    });
    setPage(1);
  }

  function handleClearFilters() {
    setCategory('all');
    setDifficulty('all');
    setSelectedTags([]);
    setQuery('');
    setProgressStatus('all');
    setPage(1);
  }

  const hasActiveFilters =
    category !== 'all' ||
    difficulty !== 'all' ||
    selectedTags.length > 0 ||
    query.length > 0 ||
    progressStatus !== 'all';

  const categoryOptions = useMemo(
    () => [
      { value: 'all', label: 'All categories' },
      ...(filters?.categories.map((item) => ({ value: item, label: item })) ?? []),
    ],
    [filters?.categories],
  );

  const difficultyOptions = useMemo(
    () => [
      { value: 'all', label: 'All difficulties' },
      ...(filters?.difficulties.map((item) => ({ value: item, label: item })) ?? []),
    ],
    [filters?.difficulties],
  );

  const totalItems =
    usesProgressList
      ? progressItemsForList.length
      : notStartedMode
        ? notStartedTotal
        : (data?.total ?? 0);

  function handlePickRandom() {
    if (questions.length === 0) return;
    const pick = questions[Math.floor(Math.random() * questions.length)];
    router.push(`/code/${pick.number}`);
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Coding Challenges
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            SDE-2 DSA track — {data?.total ?? 0} problems
            {categoryCount > 0 ? ` across ${categoryCount} categories` : ''}.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setShowBulkUpload(true)}
            className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Bulk Upload
          </button>
          <button
            type="button"
            onClick={() => setShowFilters((value) => !value)}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            <FilterIcon className="size-4" />
            Filters
            {hasActiveFilters
              ? ` (${selectedTags.length + (category !== 'all' ? 1 : 0) + (difficulty !== 'all' ? 1 : 0) + (progressStatus !== 'all' ? 1 : 0)})`
              : ''}
          </button>
          <button
            type="button"
            onClick={handlePickRandom}
            className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90 dark:text-black"
          >
            Pick Random
          </button>
        </div>
      </div>

      <div className="mb-4">
        <ProgressOverview
          totalProblems={data?.total ?? 0}
          solvedCount={completedCount}
          countsByStatus={countsByStatus}
          selectedStatus={progressStatus}
          onStatusChange={(status) => {
            setProgressStatus(status);
            setPage(1);
          }}
        />
      </div>

      {showFilters ? (
        <div className="mb-4 space-y-4 rounded-2xl border border-border bg-card p-4">
          <div className="flex flex-wrap items-center gap-3">
            <Select
              value={category}
              onChange={(value) => {
                setCategory(value);
                setPage(1);
              }}
              options={categoryOptions}
            />
            <Select
              value={difficulty}
              onChange={(value) => {
                setDifficulty(value);
                setPage(1);
              }}
              options={difficultyOptions}
            />
            {hasActiveFilters ? (
              <button
                type="button"
                onClick={handleClearFilters}
                className="rounded-xl border border-border px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                Clear filters
              </button>
            ) : null}
          </div>

          {filters?.tags.length ? (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Tags
              </p>
              <div className="flex flex-wrap gap-2">
                {filters.tags.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleToggleTag(tag)}
                      className={`rounded-full border border-emerald-500/40 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-600 transition-opacity dark:text-emerald-400 ${
                        isSelected
                          ? 'bg-emerald-500/10 ring-2 ring-emerald-500 ring-offset-2 ring-offset-card'
                          : 'opacity-80 hover:opacity-100'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      <DataTable
        columns={TABLE_COLUMNS}
        toolbar={
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
            <div className="flex flex-wrap items-center gap-3">
              <input
                type="search"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setPage(1);
                }}
                placeholder="Filter by title..."
                className="w-full min-w-[220px] max-w-sm rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-accent"
              />
              <button
                type="button"
                onClick={() => setShowRoadmapModal(true)}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                <RefreshIcon className="size-4" />
                Update Roadmap
              </button>
            </div>
            <p className="text-sm text-muted-foreground">
              Showing {questions.length} of {totalItems} entries
            </p>
          </div>
        }
        isLoading={usesProgressList ? isProgressLoading : isLoading}
        isError={usesProgressList ? isProgressError : isError}
        isFetching={usesProgressList ? isProgressFetching : isFetching}
        isEmpty={
          usesProgressList
            ? !isProgressLoading && questions.length === 0
            : !isLoading && questions.length === 0
        }
        loadingMessage="Loading problems..."
        errorMessage="Failed to load problems from API."
        emptyMessage="No problems match your filters."
        footer={
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={PAGE_SIZE}
            totalItems={totalItems}
            onPageChange={setPage}
          />
        }
      >
        {questions.map((question) => (
          <QuestionRow key={`${question.number}-${question.slug}`} question={question} />
        ))}
      </DataTable>

      <BulkUploadModal open={showBulkUpload} onClose={() => setShowBulkUpload(false)} />
      <RoadmapModal open={showRoadmapModal} onClose={() => setShowRoadmapModal(false)} />
    </div>
  );
}

type ChallengeRow = {
  slug: string;
  number: number;
  title: string;
  summary: string;
  category: string;
  categorySlug: string;
  pattern: string;
  tags: string[];
  difficulty: CodeQuestion['difficulty'];
  expectedTimeComplexity: string;
  expectedSpaceComplexity: string;
  testcaseCount: number;
  sampleTestcaseCount: number;
  status: UserProgressStatus;
  attempts?: number;
  confidence?: number;
};

function mapProgressItemToRow(item: UserProgressItem): ChallengeRow {
  return {
    slug: titleToSlug(item.question.title),
    number: item.questionId,
    title: item.question.title,
    summary: `${item.question.category} · ${item.status}`,
    category: item.question.category,
    categorySlug: categoryToSlug(item.question.category),
    pattern: '—',
    tags: [],
    difficulty: item.question.difficulty,
    expectedTimeComplexity: '—',
    expectedSpaceComplexity: '—',
    testcaseCount: 0,
    sampleTestcaseCount: 0,
    status: item.status,
    attempts: item.attempts,
    confidence: item.confidence,
  };
}

function mapProblemItemToRow(
  item: ProblemListItem,
  progress?: UserProgressItem,
): ChallengeRow {
  const attempts = progress?.attempts ?? item.attempts ?? 0;
  const confidence = progress?.confidence ?? item.confidence ?? 1;
  const status = progress?.status ?? mapProblemStatus(item.status);

  return {
    slug: item.slug,
    number: item.id,
    title: item.title,
    summary: item.summary,
    category: item.category,
    categorySlug: item.categorySlug,
    pattern: item.pattern,
    tags: item.tags,
    difficulty: item.difficulty,
    expectedTimeComplexity: item.expectedTimeComplexity,
    expectedSpaceComplexity: item.expectedSpaceComplexity,
    testcaseCount: item.testcaseCount,
    sampleTestcaseCount: item.sampleTestcaseCount,
    status,
    attempts,
    confidence,
  };
}

function mapProblemStatus(status: ProblemListItem['status']): UserProgressStatus {
  if (status === 'solved') return 'Solved';
  if (status === 'in_progress') return 'Attempted';
  return 'Not Started';
}

function QuestionRow({ question }: { question: ChallengeRow }) {
  const testsLabel = formatTestsLabel(question);

  return (
    <tr className="border-b border-border last:border-b-0 hover:bg-muted/30">
      <td className="px-4 py-4">
        <StatusIcon status={question.status} />
      </td>
      <td className="px-4 py-4">
        <Link href={`/code/${question.number}`} className="group block min-w-[220px]">
          <p className="font-semibold text-foreground group-hover:text-accent">
            {question.number}. {question.title}
          </p>
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {question.summary}
          </p>
        </Link>
      </td>
      <td className="hidden px-4 py-4 md:table-cell">
        <CategoryBadge category={question.category} />
      </td>
      <td className="hidden px-4 py-4 lg:table-cell">
        <TagBadges tags={question.tags} />
      </td>
      <td className="px-4 py-4">
        <DifficultyBadge difficulty={question.difficulty} />
      </td>
      <td className="hidden px-4 py-4 text-sm font-medium text-muted-foreground sm:table-cell">
        {testsLabel}
      </td>
      <td className="px-4 py-4 text-right">
        <Link
          href={`/code/${question.number}`}
          className="inline-flex size-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-accent hover:bg-accent hover:text-accent-foreground dark:hover:text-black"
          aria-label={`Solve ${question.title}`}
        >
          <PlayIcon />
        </Link>
      </td>
    </tr>
  );
}

function formatTestsLabel(question: ChallengeRow) {
  const total = question.testcaseCount || 0;
  if (total === 0) return '—';

  const passed =
    question.status === 'Solved' ||
    question.status === 'Mastered' ||
    question.status === 'Revised'
      ? total
      : 0;

  return `${passed}/${total}`;
}

function StatusIcon({ status }: { status: UserProgressStatus }) {
  if (status === 'Solved') {
    return (
      <span className="inline-flex size-6 items-center justify-center rounded-full bg-accent text-accent-foreground dark:text-black">
        <CheckIcon className="size-3.5" />
      </span>
    );
  }
  if (status === 'Mastered') {
    return (
      <span className="inline-flex size-6 items-center justify-center rounded-full bg-amber-400 text-black">
        <TrophyIcon className="size-3.5" />
      </span>
    );
  }
  if (status === 'Revised') {
    return (
      <span className="inline-flex size-6 items-center justify-center rounded-full bg-violet-500/20 text-violet-400">
        <RefreshIcon className="size-3.5" />
      </span>
    );
  }
  if (status === 'Attempted') {
    return (
      <span className="inline-flex size-6 items-center justify-center rounded-full border border-sky-400/40 text-sky-400">
        <ClockIcon className="size-3.5" />
      </span>
    );
  }
  return <span className="inline-block size-6 rounded-full border-2 border-border" />;
}

function CategoryBadge({ category }: { category: string }) {
  return (
    <span className="inline-flex max-w-[10rem] truncate rounded-md bg-blue-500/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-blue-600 dark:text-blue-400">
      {category}
    </span>
  );
}

function TagBadges({ tags }: { tags: string[] }) {
  if (!tags.length) {
    return <span className="text-xs text-muted-foreground">—</span>;
  }

  return (
    <div className="flex max-w-[12rem] flex-wrap gap-1.5">
      {tags.map((tag) => (
        <span
          key={tag}
          className="inline-flex rounded-md border border-emerald-500/40 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-600 dark:text-emerald-400"
        >
          {tag}
        </span>
      ))}
    </div>
  );
}

function DifficultyBadge({ difficulty }: { difficulty: CodeQuestion['difficulty'] }) {
  const className =
    difficulty === 'Easy'
      ? 'difficulty-easy'
      : difficulty === 'Medium'
        ? 'difficulty-medium'
        : 'difficulty-hard';
  return (
    <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${className}`}>
      {difficulty}
    </span>
  );
}

function FilterIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className ?? 'size-5'}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="currentColor" className="size-3.5">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function RefreshIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M3 21v-5h5" />
    </svg>
  );
}

function TrophyIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className ?? 'size-5'}>
      <path d="M8 21h8" />
      <path d="M12 17v4" />
      <path d="M7 4h10" />
      <path d="M17 4v3a5 5 0 0 1-10 0V4" />
    </svg>
  );
}
