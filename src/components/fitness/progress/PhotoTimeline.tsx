'use client';

import { Trash2 } from 'lucide-react';
import type { ProgressPhotoSet } from '@/lib/fitness/progress/types';

type PhotoTimelineProps = {
  photos: ProgressPhotoSet[];
  selectedId?: string | null;
  isDeleting?: boolean;
  onSelect?: (photo: ProgressPhotoSet) => void;
  onDelete?: (id: string) => void;
};

export default function PhotoTimeline({
  photos,
  selectedId,
  isDeleting = false,
  onSelect,
  onDelete,
}: PhotoTimelineProps) {
  if (photos.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-4 py-10 text-center text-sm text-muted-foreground">
        No progress photos yet. Upload a front/side/back set to start the timeline.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground">Photo Timeline</h3>
      <div className="space-y-3">
        {photos.map((set) => {
          const isSelected = set.id === selectedId;
          const preview =
            set.frontImageUrl || set.sideImageUrl || set.backImageUrl;
          return (
            <div
              key={set.id}
              className={`rounded-2xl border p-3 ${
                isSelected
                  ? 'border-accent bg-accent/5'
                  : 'border-border bg-card'
              }`}
            >
              <button
                type="button"
                onClick={() => onSelect?.(set)}
                className="flex w-full gap-3 text-left"
              >
                <div className="grid grid-cols-3 gap-2">
                  {(['frontImageUrl', 'sideImageUrl', 'backImageUrl'] as const).map(
                    (key) => (
                      <div
                        key={key}
                        className="h-20 w-16 overflow-hidden rounded-lg border border-border bg-muted"
                      >
                        {set[key] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={set[key]!}
                            alt={key}
                            className="size-full object-cover"
                          />
                        ) : (
                          <div className="flex size-full items-center justify-center text-[10px] text-muted-foreground">
                            —
                          </div>
                        )}
                      </div>
                    ),
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground">
                    Weekly photo set
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {set.recordedAt.slice(0, 10)}
                  </p>
                  {!preview ? (
                    <p className="mt-2 text-xs text-muted-foreground">
                      No images in this set.
                    </p>
                  ) : null}
                </div>
              </button>
              {onDelete ? (
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => onDelete(set.id)}
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground disabled:opacity-60"
                >
                  <Trash2 className="size-3.5" />
                  Delete set
                </button>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
