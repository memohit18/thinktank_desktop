'use client';

import { Pencil } from 'lucide-react';

type ReviewCardProps = {
  title: string;
  value: string;
  onEdit?: () => void;
};

export default function ReviewCard({ title, value, onEdit }: ReviewCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {title}
          </p>
          <p className="mt-2 whitespace-pre-wrap text-sm text-foreground">
            {value}
          </p>
        </div>
        {onEdit ? (
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Pencil className="size-3.5" />
            Edit
          </button>
        ) : null}
      </div>
    </div>
  );
}
