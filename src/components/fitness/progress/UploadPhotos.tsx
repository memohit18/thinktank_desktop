'use client';

import { useState } from 'react';
import { Loader2, Upload } from 'lucide-react';

type UploadPhotosProps = {
  isUploading?: boolean;
  onUpload: (files: {
    front?: File | null;
    side?: File | null;
    back?: File | null;
  }) => Promise<unknown>;
};

export default function UploadPhotos({
  isUploading = false,
  onUpload,
}: UploadPhotosProps) {
  const [front, setFront] = useState<File | null>(null);
  const [side, setSide] = useState<File | null>(null);
  const [back, setBack] = useState<File | null>(null);

  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-foreground">Upload Photos</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Upload front, side, and/or back, then save as one weekly set.
        </p>
      </div>

      <div className="space-y-3">
        {(
          [
            ['Front', front, setFront],
            ['Side', side, setSide],
            ['Back', back, setBack],
          ] as const
        ).map(([label, file, setter]) => (
          <label
            key={label}
            className="flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/20 px-3 py-2 text-sm"
          >
            <span className="font-medium text-foreground">{label}</span>
            <span className="truncate text-xs text-muted-foreground">
              {file?.name || 'Choose image'}
            </span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => setter(event.target.files?.[0] ?? null)}
            />
          </label>
        ))}
      </div>

      <button
        type="button"
        disabled={isUploading || (!front && !side && !back)}
        onClick={() => {
          void onUpload({ front, side, back }).then((result) => {
            if (result) {
              setFront(null);
              setSide(null);
              setBack(null);
            }
          });
        }}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted disabled:opacity-60"
      >
        {isUploading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Upload className="size-4" />
        )}
        Save photo set
      </button>
    </section>
  );
}
