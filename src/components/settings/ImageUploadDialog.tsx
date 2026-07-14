'use client';

import { useEffect, useMemo, useState } from 'react';
import { Upload, X } from 'lucide-react';
import {
  IMAGE_UPLOAD_MAX_BYTES,
  IMAGE_UPLOAD_MAX_DIMENSION,
  formatImageBytes,
  isValidImageType,
  normalizeImageType,
} from '@/lib/images/imageResponse';
import { useExclusiveAction } from '@/hooks/useExclusiveAction';

const PRESET_TYPES = ['profile', 'progress', 'gallery'] as const;

type ImageUploadDialogProps = {
  open: boolean;
  isUploading?: boolean;
  /** Prefill type when opening (e.g. "food", "profile"). */
  defaultType?: string;
  /** Stack above nested pickers. Default: z-50 */
  overlayClassName?: string;
  onClose: () => void;
  onConfirm: (
    file: File,
    type: string,
    idempotencyKey: string,
  ) => void | Promise<unknown>;
};

export default function ImageUploadDialog({
  open,
  isUploading = false,
  defaultType = 'profile',
  overlayClassName = 'z-50',
  onClose,
  onConfirm,
}: ImageUploadDialogProps) {
  const isPreset = (PRESET_TYPES as readonly string[]).includes(defaultType);
  const [file, setFile] = useState<File | null>(null);
  const [preset, setPreset] = useState<string>(
    isPreset ? defaultType : 'custom',
  );
  const [customType, setCustomType] = useState(
    isPreset ? '' : defaultType,
  );
  const [error, setError] = useState<string | null>(null);
  const { isLocked, runExclusive } = useExclusiveAction({ cooldownMs: 600 });

  const previewUrl = useMemo(() => {
    if (!file) return null;
    return URL.createObjectURL(file);
  }, [file]);

  useEffect(() => {
    if (!open) {
      setFile(null);
      const nextIsPreset = (PRESET_TYPES as readonly string[]).includes(
        defaultType,
      );
      setPreset(nextIsPreset ? defaultType : 'custom');
      setCustomType(nextIsPreset ? '' : defaultType);
      setError(null);
    }
  }, [open, defaultType]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  if (!open) return null;

  const busy = isUploading || isLocked;
  const resolvedType =
    preset === 'custom'
      ? normalizeImageType(customType)
      : normalizeImageType(preset);

  function handleFileChange(next: File | null) {
    setError(null);
    if (!next) {
      setFile(null);
      return;
    }
    if (!next.type.startsWith('image/')) {
      setError('Please choose an image file.');
      setFile(null);
      return;
    }
    if (next.size > IMAGE_UPLOAD_MAX_BYTES * 2) {
      setError('Source file is too large. Pick an image under ~14MB.');
      setFile(null);
      return;
    }
    setFile(next);
  }

  async function handleSubmit() {
    if (busy) return;
    if (!file) {
      setError('Choose an image to upload.');
      return;
    }
    if (!isValidImageType(resolvedType)) {
      setError(
        'Type must start with a letter/number and use only a-z, 0-9, _ or -.',
      );
      return;
    }

    await runExclusive(async () => {
      const idempotencyKey = crypto.randomUUID();
      await onConfirm(file, resolvedType, idempotencyKey);
    });
  }

  return (
    <div
      className={`fixed inset-0 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4 ${overlayClassName}`}
    >      <button
        type="button"
        aria-label="Close upload dialog"
        className="absolute inset-0 cursor-default"
        onClick={busy ? undefined : onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Upload image"
        className="relative z-10 w-full max-w-md rounded-t-2xl border border-border bg-card p-5 shadow-2xl sm:rounded-2xl"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-foreground">
              Upload image
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Resized to max {IMAGE_UPLOAD_MAX_DIMENSION}px, compressed JPEG
              (~85%), max {formatImageBytes(IMAGE_UPLOAD_MAX_BYTES)}.
            </p>
          </div>
          <button
            type="button"
            disabled={busy}
            onClick={onClose}
            className="rounded-lg border border-border p-1.5 text-muted-foreground hover:bg-muted disabled:opacity-50"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Type
            </p>
            <div className="flex flex-wrap gap-2">
              {PRESET_TYPES.map((value) => (
                <button
                  key={value}
                  type="button"
                  disabled={busy}
                  onClick={() => setPreset(value)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                    preset === value
                      ? 'border-accent bg-accent/10 text-accent'
                      : 'border-border text-foreground hover:bg-muted'
                  }`}
                >
                  {value}
                </button>
              ))}
              <button
                type="button"
                disabled={busy}
                onClick={() => setPreset('custom')}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                  preset === 'custom'
                    ? 'border-accent bg-accent/10 text-accent'
                    : 'border-border text-foreground hover:bg-muted'
                }`}
              >
                custom
              </button>
            </div>
            {preset === 'custom' ? (
              <input
                value={customType}
                disabled={busy}
                onChange={(event) => setCustomType(event.target.value)}
                placeholder="e.g. headshot"
                className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none ring-accent focus:ring-2"
              />
            ) : null}
            <p className="mt-1.5 text-[11px] text-muted-foreground">
              Will send as:{' '}
              <span className="font-medium text-foreground">
                {resolvedType || '—'}
              </span>
            </p>
          </div>

          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/20 px-4 py-8 text-center transition hover:bg-muted/40">
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewUrl}
                alt="Selected preview"
                className="max-h-40 rounded-lg object-contain"
              />
            ) : (
              <Upload className="size-6 text-muted-foreground" />
            )}
            <span className="text-sm font-medium text-foreground">
              {file ? file.name : 'Choose an image'}
            </span>
            {file ? (
              <span className="text-[11px] text-muted-foreground">
                {formatImageBytes(file.size)}
              </span>
            ) : null}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={busy}
              onChange={(event) =>
                handleFileChange(event.target.files?.[0] ?? null)
              }
            />
          </label>

          {error ? (
            <p className="text-xs text-rose-600 dark:text-rose-300">{error}</p>
          ) : null}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={onClose}
              className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={busy || !file}
              onClick={() => void handleSubmit()}
              className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground disabled:opacity-50 dark:text-black"
            >
              {busy ? 'Uploading…' : 'Upload'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
