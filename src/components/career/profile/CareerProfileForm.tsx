'use client';

import type { InputHTMLAttributes } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import type { CareerProfileFormValues } from '@/lib/career/types';

type CareerProfileFormProps = {
  form: UseFormReturn<CareerProfileFormValues>;
  isSaving: boolean;
  onCancel?: () => void;
  submitLabel?: string;
};

export default function CareerProfileForm({
  form,
  isSaving,
  onCancel,
  submitLabel = 'Save profile',
}: CareerProfileFormProps) {
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs font-semibold uppercase tracking-widest text-accent">
          Career Profile
        </p>
        <h1 className="mt-2 text-2xl font-bold text-foreground">
          {onCancel ? 'Edit career profile' : 'Create career profile'}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Capture your current role, compensation, and professional links.
        </p>
      </header>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">
          Basic Information
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Current Company"
            error={errors.currentCompany?.message}
            {...register('currentCompany')}
          />
          <Field
            label="Current Role"
            error={errors.currentRole?.message}
            {...register('currentRole')}
          />
          <Field
            label="Experience (years)"
            type="number"
            step="0.1"
            error={errors.totalExperience?.message}
            {...register('totalExperience')}
          />
          <Field
            label="Salary (LPA)"
            type="number"
            step="0.1"
            error={errors.currentCtc?.message}
            {...register('currentCtc')}
          />
          <Field
            label="Notice Period (days)"
            type="number"
            error={errors.noticePeriod?.message}
            {...register('noticePeriod')}
          />
          <Field
            label="Expected Min CTC (LPA)"
            type="number"
            step="0.1"
            error={errors.expectedMinCtc?.message}
            {...register('expectedMinCtc')}
          />
          <Field
            label="Expected Max CTC (LPA)"
            type="number"
            step="0.1"
            error={errors.expectedMaxCtc?.message}
            {...register('expectedMaxCtc')}
          />
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Links</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Github"
            placeholder="https://github.com/username"
            error={errors.githubUrl?.message}
            {...register('githubUrl')}
          />
          <Field
            label="LinkedIn"
            placeholder="https://linkedin.com/in/username"
            error={errors.linkedinUrl?.message}
            {...register('linkedinUrl')}
          />
          <Field
            label="Portfolio"
            placeholder="https://yoursite.com"
            error={errors.portfolioUrl?.message}
            {...register('portfolioUrl')}
          />
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">
          Professional Summary
        </h3>
        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Summary
          </span>
          <textarea
            rows={6}
            className="w-full resize-y rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-accent focus:ring-2 focus:ring-accent/20"
            placeholder="Brief overview of your experience and strengths"
            {...register('summary')}
          />
          {errors.summary?.message ? (
            <span className="mt-1.5 block text-xs text-red-500">
              {errors.summary.message}
            </span>
          ) : null}
        </label>
      </section>

      <div className="flex flex-wrap gap-2">
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-muted"
          >
            Cancel
          </button>
        ) : null}
        <button
          type="submit"
          disabled={isSaving}
          className="rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground shadow-[0_0_20px_var(--neon-glow)] transition-opacity hover:opacity-90 disabled:opacity-60 dark:text-black"
        >
          {isSaving ? 'Saving…' : submitLabel}
        </button>
      </div>
    </div>
  );
}

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

function Field({ label, error, id, ...props }: FieldProps) {
  const fieldId = id ?? label.toLowerCase().replace(/\s+/g, '-');

  return (
    <label className="block" htmlFor={fieldId}>
      <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <input
        id={fieldId}
        className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-accent focus:ring-2 focus:ring-accent/20 disabled:cursor-not-allowed disabled:opacity-60"
        {...props}
      />
      {error ? (
        <span className="mt-1.5 block text-xs text-red-500">{error}</span>
      ) : null}
    </label>
  );
}
