'use client';

import { useState } from 'react';
import { ImageIcon, RefreshCw, Trash2, Upload } from 'lucide-react';
import ImageUploadDialog from '@/components/settings/ImageUploadDialog';
import {
  ImageLightbox,
  ProgressiveImage,
} from '@/components/settings/ProgressiveImage';
import { useProfileImages } from '@/hooks/useProfileImages';
import { formatImageBytes } from '@/lib/images/imageResponse';
import type { UserImage } from '@/lib/images/types';

export default function ProfileImagesSection() {
  const {
    images,
    meta,
    isLoading,
    isFetching,
    isError,
    isUploading,
    isDeleting,
    upload,
    remove,
    refetch,
  } = useProfileImages({ page: 1, limit: 20 });
  const [selected, setSelected] = useState<UserImage | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<UserImage | null>(null);

  const busy = isUploading || isDeleting;

  async function handleConfirmDelete() {
    if (!pendingDelete || busy) return;
    const image = pendingDelete;
    const ok = await remove(image);
    if (ok) {
      setPendingDelete(null);
      if (selected?.id === image.id) setSelected(null);
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Profile images
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Grid uses thumbnails with blur placeholders. Upload resizes to
            2000px max and compresses before send (7MB limit).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void refetch()}
            disabled={isFetching || busy}
            className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm font-medium text-foreground transition hover:bg-muted disabled:opacity-50"
          >
            <RefreshCw
              className={`size-4 ${isFetching ? 'animate-spin' : ''}`}
            />
            Refresh
          </button>
          <button
            type="button"
            onClick={() => setUploadOpen(true)}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-50 dark:text-black"
          >
            <Upload className="size-4" />
            Upload
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        {isLoading ? (
          <div className="grid grid-cols-4 gap-3">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="aspect-square animate-pulse rounded-xl bg-muted"
              />
            ))}
          </div>
        ) : isError ? (
          <div className="rounded-xl border border-dashed border-border bg-muted/20 px-6 py-16 text-center">
            <p className="text-sm font-semibold text-foreground">
              Could not load images
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Retry when your connection is available.
            </p>
            <button
              type="button"
              onClick={() => void refetch()}
              className="mt-4 rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
            >
              Retry
            </button>
          </div>
        ) : images.length === 0 ? (
          <button
            type="button"
            onClick={() => setUploadOpen(true)}
            className="flex w-full flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-muted/20 px-6 py-16 text-center transition-colors hover:bg-muted/40"
          >
            <span className="rounded-full bg-muted p-3 text-muted-foreground">
              <ImageIcon className="size-6" />
            </span>
            <div>
              <p className="text-sm font-semibold text-foreground">
                No images yet
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Upload a profile image to get started.
              </p>
            </div>
          </button>
        ) : (
          <>
            <div className="grid grid-cols-4 gap-3">
              {images.map((image) => {
                const thumb = image.images.thumbnail;
                return (
                  <div
                    key={image.id}
                    className="group relative overflow-hidden rounded-xl border border-border bg-muted/20 transition hover:border-accent/50"
                  >
                    <button
                      type="button"
                      onClick={() => setSelected(image)}
                      className="block w-full text-left"
                    >
                      <ProgressiveImage
                        blurDataUrl={image.blurDataUrl}
                        variant={thumb}
                        alt={image.originalFileName}
                        aspectRatio="square"
                        sizes="25vw"
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2.5 pt-8 opacity-100 transition group-hover:opacity-0">
                        <p className="truncate text-xs font-medium text-white">
                          {image.originalFileName}
                        </p>
                        <p className="text-[10px] text-white/70">
                          {image.type}
                          {' · '}
                          {thumb.width}×{thumb.height}
                          {thumb.bytes
                            ? ` · ${formatImageBytes(thumb.bytes)}`
                            : ''}
                        </p>
                      </div>
                    </button>

                    <div className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-1 bg-gradient-to-t from-black/80 to-transparent p-2 pt-8 opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={(event) => {
                          event.stopPropagation();
                          setPendingDelete(image);
                        }}
                        className="pointer-events-auto flex w-full items-center justify-center gap-1.5 rounded-lg bg-rose-600 px-2 py-1.5 text-xs font-semibold text-white transition hover:bg-rose-500 disabled:opacity-50"
                        aria-label={`Delete ${image.originalFileName}`}
                      >
                        <Trash2 className="size-3.5" />
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            {meta ? (
              <p className="mt-4 text-xs text-muted-foreground">
                Showing {images.length} of {meta.total} image
                {meta.total === 1 ? '' : 's'}
              </p>
            ) : null}
          </>
        )}
      </div>

      <ImageUploadDialog
        open={uploadOpen}
        isUploading={isUploading}
        onClose={() => {
          if (!isUploading) setUploadOpen(false);
        }}
        onConfirm={async (file, type, idempotencyKey) => {
          const result = await upload(file, type, idempotencyKey);
          if (result) setUploadOpen(false);
        }}
      />

      {selected ? (
        <ImageLightbox image={selected} onClose={() => setSelected(null)} />
      ) : null}

      {pendingDelete ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <button
            type="button"
            aria-label="Close delete confirmation"
            className="absolute inset-0 cursor-default"
            disabled={busy}
            onClick={() => {
              if (!busy) setPendingDelete(null);
            }}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-image-title"
            className="relative z-10 w-full max-w-sm rounded-2xl border border-border bg-card p-5 shadow-2xl"
          >
            <h3
              id="delete-image-title"
              className="text-base font-semibold text-foreground"
            >
              Delete image?
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              This will permanently remove{' '}
              <span className="font-medium text-foreground">
                {pendingDelete.originalFileName}
              </span>
              . This action cannot be undone.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={() => setPendingDelete(null)}
                className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => void handleConfirmDelete()}
                className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-500 disabled:opacity-50"
              >
                <Trash2 className="size-3.5" />
                {isDeleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
