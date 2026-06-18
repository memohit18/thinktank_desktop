'use client';

import { useEffect, useMemo, useState } from 'react';
import type { CodeQuestion } from '@/lib/code/questions';
import { titleToSlug } from '@/lib/code/questionMappers';
import { validateRoadmapCreatePayload } from '@/lib/code/roadmapCreate';
import type { CreateRoadmapPayload } from '@/lib/code/roadmapTypes';
import { getApiErrorMessage } from '@/lib/services/getApiErrorMessage';
import { useGetProblemsQuery } from '@/lib/services/problemsApi';
import { useCreateRoadmapMutation } from '@/lib/services/roadmapsApi';
import { useToast } from '@/components/ui/Toast';

type SelectedQuestion = {
  questionId: number;
  title: string;
  difficulty: CodeQuestion['difficulty'];
};

type RoadmapCreateFormProps = {
  onCreated: () => void;
  onCancel: () => void;
};

const PICKER_PAGE_SIZE = 20;

export default function RoadmapCreateForm({
  onCreated,
  onCancel,
}: RoadmapCreateFormProps) {
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [selected, setSelected] = useState<SelectedQuestion[]>([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [pickerPage, setPickerPage] = useState(1);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const [createRoadmap, { isLoading: isCreating }] = useCreateRoadmapMutation();

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search), 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (slugTouched) return;
    setSlug(titleToSlug(name));
  }, [name, slugTouched]);

  const { data, isLoading, isFetching } = useGetProblemsQuery(
    {
      page: pickerPage,
      limit: PICKER_PAGE_SIZE,
      search: debouncedSearch || undefined,
      useActiveRoadmap: false,
    },
    { refetchOnMountOrArgChange: true },
  );

  const selectedIds = useMemo(
    () => new Set(selected.map((item) => item.questionId)),
    [selected],
  );

  const availableQuestions = useMemo(
    () => data?.items.filter((item) => !selectedIds.has(item.id)) ?? [],
    [data?.items, selectedIds],
  );

  const pickerTotalPages = data?.totalPages ?? 1;

  function addQuestion(question: {
    id: number;
    title: string;
    difficulty: CodeQuestion['difficulty'];
  }) {
    setSelected((current) => [
      ...current,
      {
        questionId: question.id,
        title: question.title,
        difficulty: question.difficulty,
      },
    ]);
    setValidationErrors([]);
  }

  function removeQuestion(questionId: number) {
    setSelected((current) =>
      current.filter((item) => item.questionId !== questionId),
    );
  }

  function reorderSelected(fromIndex: number, toIndex: number) {
    if (fromIndex === toIndex) return;

    setSelected((current) => {
      const next = [...current];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  }

  function buildPayload(): CreateRoadmapPayload {
    return {
      name: name.trim(),
      slug: slug.trim(),
      description: description.trim(),
      isActive,
      questions: selected.map((item, index) => ({
        questionId: item.questionId,
        order: index + 1,
      })),
    };
  }

  async function handleCreate() {
    setValidationErrors([]);

    const payload = buildPayload();
    const validation = validateRoadmapCreatePayload(payload);

    if (!validation.valid) {
      setValidationErrors(validation.errors);
      return;
    }

    try {
      const result = await createRoadmap(validation.payload).unwrap();
      showToast(`Roadmap "${result.name}" created successfully.`);
      onCreated();
    } catch (error) {
      const message = getApiErrorMessage(error, 'Failed to create roadmap.');
      setValidationErrors([message]);
      showToast(message, 'error');
    }
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Name">
          <input
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              setValidationErrors([]);
            }}
            placeholder="Remote SDE-2 Interview Roadmap"
            className={inputClassName}
          />
        </Field>
        <Field label="Slug">
          <input
            value={slug}
            onChange={(event) => {
              setSlugTouched(true);
              setSlug(event.target.value);
              setValidationErrors([]);
            }}
            placeholder="remote-sde2-roadmap"
            className={inputClassName}
          />
        </Field>
      </div>

      <Field label="Description">
        <textarea
          value={description}
          onChange={(event) => {
            setDescription(event.target.value);
            setValidationErrors([]);
          }}
          rows={2}
          placeholder="118 high ROI DSA questions for remote product company interviews."
          className={`${inputClassName} resize-y`}
        />
      </Field>

      <label className="flex items-center gap-2 text-sm text-foreground">
        <input
          type="checkbox"
          checked={isActive}
          onChange={(event) => setIsActive(event.target.checked)}
          className="size-4 rounded border-border accent-accent"
        />
        Set as active roadmap after creation
      </label>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-border bg-muted/20">
          <div className="border-b border-border px-4 py-3">
            <p className="text-sm font-semibold text-foreground">
              Available questions
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Full catalog (useActiveRoadmap=false)
            </p>
            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPickerPage(1);
              }}
              placeholder="Search questions..."
              className={`${inputClassName} mt-3`}
            />
          </div>

          <div className="max-h-72 overflow-y-auto p-2">
            {isLoading ? (
              <p className="px-2 py-6 text-center text-sm text-muted-foreground">
                Loading questions...
              </p>
            ) : null}
            {!isLoading && availableQuestions.length === 0 ? (
              <p className="px-2 py-6 text-center text-sm text-muted-foreground">
                No questions found.
              </p>
            ) : null}
            {availableQuestions.map((question) => (
              <div
                key={question.id}
                className="flex items-center justify-between gap-3 rounded-lg px-2 py-2 hover:bg-muted/50"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {question.id}. {question.title}
                  </p>
                  <DifficultyBadge difficulty={question.difficulty} />
                </div>
                <button
                  type="button"
                  onClick={() => addQuestion(question)}
                  className="shrink-0 rounded-lg border border-border bg-card px-2.5 py-1 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
                >
                  Add
                </button>
              </div>
            ))}
          </div>

          {pickerTotalPages > 1 ? (
            <div className="flex items-center justify-between border-t border-border px-4 py-2 text-xs text-muted-foreground">
              <button
                type="button"
                disabled={pickerPage <= 1}
                onClick={() => setPickerPage((page) => page - 1)}
                className="rounded border border-border px-2 py-1 disabled:opacity-50"
              >
                Prev
              </button>
              <span>
                Page {pickerPage} / {pickerTotalPages}
                {isFetching ? ' · Updating...' : ''}
              </span>
              <button
                type="button"
                disabled={pickerPage >= pickerTotalPages}
                onClick={() => setPickerPage((page) => page + 1)}
                className="rounded border border-border px-2 py-1 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          ) : null}
        </section>

        <section className="rounded-xl border border-border bg-muted/20">
          <div className="border-b border-border px-4 py-3">
            <p className="text-sm font-semibold text-foreground">
              Selected questions ({selected.length})
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Drag to reorder. Order becomes the payload `order` field.
            </p>
          </div>

          <div className="max-h-72 overflow-y-auto p-2">
            {selected.length === 0 ? (
              <p className="px-2 py-6 text-center text-sm text-muted-foreground">
                Add questions from the left panel.
              </p>
            ) : null}
            {selected.map((question, index) => (
              <div
                key={question.questionId}
                draggable
                onDragStart={() => setDragIndex(index)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => {
                  if (dragIndex === null) return;
                  reorderSelected(dragIndex, index);
                  setDragIndex(null);
                }}
                onDragEnd={() => setDragIndex(null)}
                className={`mb-1 flex cursor-grab items-center gap-3 rounded-lg border border-border bg-card px-3 py-2 active:cursor-grabbing ${
                  dragIndex === index ? 'opacity-60' : ''
                }`}
              >
                <span className="flex size-6 shrink-0 items-center justify-center rounded bg-muted text-xs font-semibold text-muted-foreground">
                  {index + 1}
                </span>
                <GripIcon className="size-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {question.title}
                  </p>
                  <DifficultyBadge difficulty={question.difficulty} />
                </div>
                <button
                  type="button"
                  onClick={() => removeQuestion(question.questionId)}
                  className="shrink-0 text-xs font-medium text-red-500 hover:text-red-400"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>

      {validationErrors.length > 0 ? (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4">
          <p className="text-sm font-semibold text-red-500">Validation errors</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-red-500">
            {validationErrors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => void handleCreate()}
          disabled={isCreating}
          className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 dark:text-black"
        >
          {isCreating ? 'Creating...' : 'Create roadmap'}
        </button>
      </div>
    </div>
  );
}

const inputClassName =
  'w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-accent';

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}

function DifficultyBadge({
  difficulty,
}: {
  difficulty: CodeQuestion['difficulty'];
}) {
  const className =
    difficulty === 'Easy'
      ? 'difficulty-easy'
      : difficulty === 'Medium'
        ? 'difficulty-medium'
        : 'difficulty-hard';

  return (
    <span
      className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${className}`}
    >
      {difficulty}
    </span>
  );
}

function GripIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <circle cx="9" cy="7" r="1.5" />
      <circle cx="15" cy="7" r="1.5" />
      <circle cx="9" cy="12" r="1.5" />
      <circle cx="15" cy="12" r="1.5" />
      <circle cx="9" cy="17" r="1.5" />
      <circle cx="15" cy="17" r="1.5" />
    </svg>
  );
}
