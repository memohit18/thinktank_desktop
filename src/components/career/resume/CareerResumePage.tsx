'use client';

import { useRef, useState } from 'react';
import { Loader2, Star, Trash2, Upload } from 'lucide-react';
import CareerApiErrorState from '@/components/career/CareerApiErrorState';
import CareerModuleShell from '@/components/career/CareerModuleShell';
import { useCareerResumes } from '@/hooks/useCareerResumes';
import type { CareerResume } from '@/lib/career/types';

function formatUploadedDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unknown date';
  return date.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'long',
  });
}

export default function CareerResumePage() {
  const {
    resumes,
    accept,
    isLoading,
    isError,
    isMutating,
    isUploading,
    refetch,
    upload,
    makeDefault,
    remove,
  } = useCareerResumes();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState('');

  if (isLoading) {
    return (
      <CareerModuleShell activeNav="resume">
        <div className="flex min-h-[360px] items-center justify-center">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      </CareerModuleShell>
    );
  }

  if (isError) {
    return (
      <CareerModuleShell activeNav="resume">
        <CareerApiErrorState
          title="Could not load resumes"
          message="Your resumes could not be loaded. Retry when your connection is available."
          onRetry={() => void refetch()}
        />
      </CareerModuleShell>
    );
  }

  return (
    <CareerModuleShell activeNav="resume">
      <div className="space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-accent">
              Resume
            </p>
            <h1 className="mt-2 text-2xl font-bold text-foreground">
              Your resumes
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Upload a PDF or .txt (max 10MB) and set one as default for
              applications.
            </p>
          </div>
        </header>

        <section className="rounded-2xl border border-border bg-card p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <label className="min-w-0 flex-1">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Title (optional)
              </span>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Software Engineer Resume"
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
              />
            </label>
            <button
              type="button"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-accent-foreground shadow-[0_0_20px_var(--neon-glow)] transition-opacity hover:opacity-90 disabled:opacity-60 dark:text-black"
            >
              {isUploading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Upload className="size-4" />
              )}
              {isUploading ? 'Uploading…' : 'Upload resume'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept={accept}
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                event.target.value = '';
                if (!file) return;
                void upload(file, title).then((ok) => {
                  if (ok) setTitle('');
                });
              }}
            />
          </div>
        </section>

        {resumes.length === 0 ? (
          <section className="rounded-2xl border border-dashed border-border bg-card/50 px-6 py-16 text-center">
            <h2 className="text-lg font-semibold text-foreground">
              No resumes yet
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Upload your first resume to get started.
            </p>
          </section>
        ) : (
          <div className="space-y-4">
            {resumes.map((resume, index) => (
              <div key={resume.id}>
                <ResumeRow
                  resume={resume}
                  disabled={isMutating}
                  onSetDefault={() => void makeDefault(resume.id)}
                  onDelete={() => void remove(resume.id)}
                />
                {index < resumes.length - 1 ? (
                  <div className="mt-4 border-t border-border" />
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </CareerModuleShell>
  );
}

function ResumeRow({
  resume,
  disabled,
  onSetDefault,
  onDelete,
}: {
  resume: CareerResume;
  disabled: boolean;
  onSetDefault: () => void;
  onDelete: () => void;
}) {
  return (
    <article className="rounded-2xl border border-border bg-card p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-2">
          <h2 className="text-lg font-semibold text-foreground">
            {resume.title}
          </h2>
          {resume.rating > 0 ? <StarRating rating={resume.rating} /> : null}
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            {resume.isDefault ? (
              <span className="rounded-lg border border-accent/40 bg-accent/10 px-2.5 py-1 text-xs font-semibold text-accent">
                Default
              </span>
            ) : null}
            <span className="rounded-lg border border-border px-2.5 py-1 text-xs">
              v{resume.version}
            </span>
            <span>Uploaded</span>
            <span className="font-medium text-foreground">
              {formatUploadedDate(resume.uploadedAt)}
            </span>
          </div>
          {resume.fileUrl ? (
            <a
              href={resume.fileUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-block text-sm font-medium text-accent hover:underline"
            >
              View file
            </a>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2">
          {!resume.isDefault ? (
            <button
              type="button"
              disabled={disabled}
              onClick={onSetDefault}
              className="rounded-xl border border-border bg-background px-3.5 py-2 text-sm font-semibold text-foreground hover:bg-muted disabled:opacity-60"
            >
              Set Default
            </button>
          ) : null}
          <button
            type="button"
            disabled={disabled}
            onClick={onDelete}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-3.5 py-2 text-sm font-semibold text-red-500 hover:bg-red-500/10 disabled:opacity-60"
          >
            <Trash2 className="size-3.5" />
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}

function StarRating({ rating }: { rating: number }) {
  const filled = Math.round(rating);

  return (
    <div className="flex items-center gap-1" aria-label={`${filled} of 5 stars`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          className={`size-4 ${
            index < filled
              ? 'fill-amber-400 text-amber-400'
              : 'text-muted-foreground/40'
          }`}
        />
      ))}
    </div>
  );
}
