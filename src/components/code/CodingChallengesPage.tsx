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
import DataTable, { type DataTableColumn } from '@/components/ui/DataTable';
import Pagination from '@/components/ui/Pagination';
import Select from '@/components/ui/Select';

const PAGE_SIZE = 20;

const TABLE_COLUMNS: DataTableColumn[] = [
  { key: 'status', label: 'Status' },
  { key: 'title', label: 'Title' },
  { key: 'category', label: 'Category', headerClassName: 'hidden md:table-cell' },
  { key: 'tags', label: 'Tags', headerClassName: 'hidden md:table-cell' },
  { key: 'pattern', label: 'Pattern', headerClassName: 'hidden lg:table-cell' },
  { key: 'difficulty', label: 'Difficulty' },
  { key: 'attempts', label: 'Attempts', headerClassName: 'hidden lg:table-cell' },
  { key: 'confidence', label: 'Confidence', headerClassName: 'hidden lg:table-cell' },
  { key: 'tests', label: 'Tests', headerClassName: 'hidden sm:table-cell' },
  { key: 'action', label: 'Action' },
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
  const { data: allProgressData } = useGetUserProgressQuery(
    { page: 1, limit: 200 },
    { refetchOnMountOrArgChange: true },
  );

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

  const {
    data: progressData,
    isLoading: isProgressLoading,
    isError: isProgressError,
    isFetching: isProgressFetching,
  } = useGetUserProgressQuery(
    { page, limit: PAGE_SIZE, status: progressStatus },
    { refetchOnMountOrArgChange: true, skip: !usesProgressList },
  );

  const progressByQuestionId = useMemo(() => {
    const map = new Map(
      (allProgressData?.items ?? []).map((item) => [item.questionId, item]),
    );
    return map;
  }, [allProgressData?.items]);

  const countsByStatus = useMemo(() => {
    const base: Partial<Record<UserProgressStatus, number>> =
      progressFilters?.countsByStatus ?? allProgressData?.filters.countsByStatus ?? {};
    const total = data?.total ?? 0;
    const tracked =
      (base.Attempted ?? 0) +
      (base.Solved ?? 0) +
      (base.Revised ?? 0) +
      (base.Mastered ?? 0);

    return {
      'Not Started': Math.max(0, total - tracked),
      Attempted: base.Attempted ?? 0,
      Solved: base.Solved ?? 0,
      Revised: base.Revised ?? 0,
      Mastered: base.Mastered ?? 0,
    } satisfies Record<UserProgressStatus, number>;
  }, [progressFilters, allProgressData, data?.total]);

  const completedCount =
    countsByStatus.Solved + countsByStatus.Revised + countsByStatus.Mastered;

  const questions = useMemo(() => {
    if (usesProgressList && progressData) {
      return progressData.items.map((item) => mapProgressItemToRow(item));
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
    progressData,
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
    ? (progressData?.meta.totalPages ?? 1)
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

  function handlePickRandom() {
    if (questions.length === 0) return;
    const pick = questions[Math.floor(Math.random() * questions.length)];
    router.push(`/code/${pick.number}`);
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
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
            className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
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

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <StatCard label="Solved Problems" value={String(completedCount)} icon={<CheckIcon />} />
        <StatCard label="Total Problems" value={String(data?.total ?? 0)} icon={<FlameIcon />} />
        <StatCard
          label="Attempted"
          value={String(countsByStatus.Attempted)}
          icon={<ClockIcon className="size-5" />}
        />
      </div>

      <div className="mb-6">
        <ProgressOverview
          totalProblems={data?.total ?? 0}
          countsByStatus={countsByStatus}
          selectedStatus={progressStatus}
          onStatusChange={(status) => {
            setProgressStatus(status);
            setPage(1);
          }}
        />
      </div>

      <div className="mb-4 space-y-3">
        <input
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setPage(1);
          }}
          placeholder="Filter by title, number, or pattern..."
          className="w-full max-w-md rounded-xl border border-border bg-card px-4 py-2.5 text-sm outline-none transition-colors focus:border-accent"
        />

        {showFilters ? (
          <div className="space-y-4 rounded-2xl border border-border bg-card p-4">
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
                        className={`tag-badge tag-badge-${getHighlightTone(tag)} rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide transition-opacity ${
                          isSelected ? 'ring-2 ring-accent ring-offset-2 ring-offset-card' : 'opacity-80 hover:opacity-100'
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
      </div>

      <DataTable
        columns={TABLE_COLUMNS}
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
            totalItems={
              usesProgressList
                ? (progressData?.meta.total ?? 0)
                : notStartedMode
                  ? notStartedTotal
                  : (data?.total ?? 0)
            }
            onPageChange={setPage}
          />
        }
      >
        {questions.map((question) => (
          <QuestionRow key={`${question.number}-${question.slug}`} question={question} />
        ))}
      </DataTable>

      <BulkUploadModal open={showBulkUpload} onClose={() => setShowBulkUpload(false)} />
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
    summary: `${item.attempts} attempt${item.attempts === 1 ? '' : 's'} · confidence ${item.confidence}`,
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
    status: progress?.status ?? 'Not Started',
    attempts: progress?.attempts,
    confidence: progress?.confidence,
  };
}

function QuestionRow({ question }: { question: ChallengeRow }) {
  return (
    <tr className="border-b border-border last:border-b-0 hover:bg-muted/40">
      <td className="px-4 py-4">
        <StatusIcon status={question.status} />
      </td>
      <td className="px-4 py-4">
        <Link href={`/code/${question.number}`} className="group block">
          <p className="font-semibold text-foreground group-hover:text-accent">
            {question.number}. {question.title}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{question.summary}</p>
          <div className="mt-2 flex flex-wrap items-center gap-1.5 md:hidden">
            <CategoryBadge category={question.category} categorySlug={question.categorySlug} />
            <TagBadges tags={question.tags} />
          </div>
        </Link>
      </td>
      <td className="hidden px-4 py-4 md:table-cell">
        <CategoryBadge category={question.category} categorySlug={question.categorySlug} />
      </td>
      <td className="hidden px-4 py-4 md:table-cell">
        <TagBadges tags={question.tags} />
      </td>
      <td className="hidden px-4 py-4 text-xs text-muted-foreground lg:table-cell">
        <p>{question.pattern}</p>
        <p className="mt-1 text-[10px] text-muted-foreground/80">
          {question.expectedTimeComplexity} · {question.expectedSpaceComplexity}
        </p>
      </td>
      <td className="px-4 py-4">
        <DifficultyBadge difficulty={question.difficulty} />
      </td>
      <td className="hidden px-4 py-4 text-xs text-muted-foreground lg:table-cell">
        {question.attempts ?? '—'}
      </td>
      <td className="hidden px-4 py-4 text-xs text-muted-foreground lg:table-cell">
        {formatConfidence(question.confidence)}
      </td>
      <td className="hidden px-4 py-4 text-xs text-muted-foreground sm:table-cell">
        <p className="font-medium text-foreground">{question.testcaseCount} tests</p>
        <p className="mt-1">{question.sampleTestcaseCount} sample</p>
      </td>
      <td className="px-4 py-4">
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

function formatConfidence(value?: number) {
  if (value === undefined) return '—';
  if (value <= 1) return `${Math.round(value * 100)}%`;
  return `${value}%`;
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

function CategoryBadge({
  category,
  categorySlug,
}: {
  category: string;
  categorySlug: string;
}) {
  return (
    <HighlightBadge label={category} toneKey={categorySlug} variant="category" />
  );
}

function TagBadges({ tags }: { tags: string[] }) {
  if (!tags.length) {
    return <span className="text-xs text-muted-foreground">—</span>;
  }

  return (
    <div className="flex max-w-[14rem] flex-wrap gap-1.5">
      {tags.map((tag) => (
        <TagBadge key={tag} tag={tag} />
      ))}
    </div>
  );
}

function TagBadge({ tag }: { tag: string }) {
  return <HighlightBadge label={tag} toneKey={tag} variant="tag" />;
}

function HighlightBadge({
  label,
  toneKey,
  variant,
}: {
  label: string;
  toneKey: string;
  variant: 'category' | 'tag';
}) {
  const tone = getHighlightTone(toneKey);

  return (
    <span
      className={`${variant}-badge ${variant}-badge-${tone} inline-flex max-w-full items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide`}
    >
      {label}
    </span>
  );
}

function getHighlightTone(key: string) {
  const tones = [
    'emerald',
    'sky',
    'violet',
    'amber',
    'rose',
    'cyan',
    'indigo',
    'orange',
    'fuchsia',
    'lime',
    'teal',
  ] as const;

  let hash = 0;
  for (let index = 0; index < key.length; index += 1) {
    hash = (hash + key.charCodeAt(index) * (index + 1)) % tones.length;
  }

  return tones[hash] ?? 'emerald';
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

function StatCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-2 text-2xl font-bold text-foreground">{value}</p>
        </div>
        <div className="rounded-xl bg-muted p-2 text-accent">{icon}</div>
      </div>
    </div>
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

function FlameIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-5">
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1.5-3C8 8 8 6 9 4c0 3 2 4 2 6 1-1 3-1 4 1 2 3 1 6-1.5 8.5" />
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
