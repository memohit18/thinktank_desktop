'use client';

import { Pencil } from 'lucide-react';
import ReviewCard from '@/components/career/ReviewCard';
import { buildCareerProfileSections } from '@/lib/career/profileMapper';
import type { CareerProfile } from '@/lib/career/types';

type CareerProfileViewProps = {
  profile: CareerProfile;
  onEdit: () => void;
};

function formatDate(value?: string) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function CareerProfileView({
  profile,
  onEdit,
}: CareerProfileViewProps) {
  const sections = buildCareerProfileSections(profile);
  const updatedLabel = formatDate(profile.updatedAt);

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-accent">
            Career Profile
          </p>
          <h1 className="mt-2 text-2xl font-bold text-foreground">
            Your saved career profile
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Your professional details power preferences, resumes, and auto-apply.
          </p>
          {updatedLabel ? (
            <p className="mt-2 text-xs text-muted-foreground">
              Last updated {updatedLabel}
            </p>
          ) : null}
        </div>

        <button
          type="button"
          onClick={onEdit}
          className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground shadow-[0_0_20px_var(--neon-glow)] transition-opacity hover:opacity-90 dark:text-black"
        >
          <Pencil className="size-4" />
          Edit profile
        </button>
      </header>

      <section className="space-y-6">
        {sections.map((section) => (
          <div key={section.id} className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">
              {section.title}
            </h3>
            <div
              className={`grid gap-3 ${
                section.id === 'summary' ? 'grid-cols-1' : 'sm:grid-cols-2'
              }`}
            >
              {section.items.map((item) => (
                <ReviewCard
                  key={`${section.id}-${item.label}`}
                  title={item.label}
                  value={item.value}
                />
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
