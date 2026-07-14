'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, Check, Upload, X } from 'lucide-react';
import ImageUploadDialog from '@/components/settings/ImageUploadDialog';
import { ProgressiveImage } from '@/components/settings/ProgressiveImage';
import { useProfileImages } from '@/hooks/useProfileImages';
import type {
  ImageVariantFormat,
  ImageVariants,
  UserImage,
} from '@/lib/images/types';

export const IMAGE_SIZE_OPTIONS = [
  'thumbnail',
  'small',
  'medium',
  'large',
] as const satisfies ReadonlyArray<keyof ImageVariants>;

export type ImageSizeOption = (typeof IMAGE_SIZE_OPTIONS)[number];

export type ImageLibraryPickerProps = {
  open: boolean;
  selectedImageId?: string | null;
  selectedImageUrl?: string | null;
  title?: string;
  description?: string;
  sizeStepTitle?: string;
  confirmLabel?: (size: ImageSizeOption) => string;
  emptyHint?: string;
  /** Optional images listing filter (e.g. "food", "profile"). */
  type?: string;
  /** Default type when uploading from this picker. */
  uploadType?: string;
  /** Stack above nested modals when needed. Default: z-50 */
  overlayClassName?: string;
  onClose: () => void;
  onSelect: (
    image: UserImage,
    imageUrl: string,
    size: ImageSizeOption,
  ) => void;
};

export function getPreferredVariantUrl(variant: ImageVariantFormat) {
  return variant.webp || variant.jpeg || variant.avif;
}

export function getImageUrlFromLibrary(
  image: UserImage,
  size: ImageSizeOption = 'medium',
) {
  return getPreferredVariantUrl(image.images[size]);
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ImageLibraryPicker({
  open,
  selectedImageId,
  selectedImageUrl,
  title = 'Choose image',
  description = 'Pick from your uploaded images',
  sizeStepTitle = 'Choose image size',
  confirmLabel = (size) => `Use ${size} image`,
  emptyHint = 'Upload an image here to get started.',
  type,
  uploadType,
  overlayClassName = 'z-50',
  onClose,
  onSelect,
}: ImageLibraryPickerProps) {
  const { images, isLoading, isError, isUploading, upload, refetch } =
    useProfileImages({
      page: 1,
      limit: 40,
      type,
    });
  const [draftImage, setDraftImage] = useState<UserImage | null>(null);
  const [draftSize, setDraftSize] = useState<ImageSizeOption>('medium');
  const [uploadOpen, setUploadOpen] = useState(false);

  const resolvedUploadType = uploadType || type || 'gallery';

  useEffect(() => {
    if (!open) {
      setDraftImage(null);
      setDraftSize('medium');
      setUploadOpen(false);
    }
  }, [open]);

  if (!open) return null;

  function handleClose() {
    setDraftImage(null);
    setDraftSize('medium');
    setUploadOpen(false);
    onClose();
  }

  function handleConfirmSize() {
    if (!draftImage) return;
    onSelect(
      draftImage,
      getImageUrlFromLibrary(draftImage, draftSize),
      draftSize,
    );
  }

  const uploadTile = (
    <button
      type="button"
      onClick={() => setUploadOpen(true)}
      disabled={isUploading}
      className="flex aspect-square flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-border bg-muted/20 text-muted-foreground transition hover:border-accent/50 hover:bg-muted/40 hover:text-foreground disabled:opacity-50"
    >
      <Upload className="size-4" />
      <span className="text-[10px] font-semibold">Upload</span>
    </button>
  );

  return (
    <div
      className={`fixed inset-0 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4 ${overlayClassName}`}
    >
      <button
        type="button"
        aria-label="Close image picker"
        className="absolute inset-0 cursor-default"
        onClick={handleClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative z-10 flex max-h-[85vh] w-full max-w-lg flex-col rounded-t-2xl border border-border bg-card shadow-2xl sm:rounded-2xl"
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="min-w-0 flex-1">
            {draftImage ? (
              <button
                type="button"
                onClick={() => setDraftImage(null)}
                className="mb-1 inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="size-3" />
                Back to images
              </button>
            ) : null}
            <h3 className="text-sm font-semibold text-foreground">
              {draftImage ? sizeStepTitle : title}
            </h3>
            <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
              {draftImage ? draftImage.originalFileName : description}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!draftImage ? (
              <button
                type="button"
                onClick={() => setUploadOpen(true)}
                disabled={isUploading}
                className="inline-flex items-center gap-1 rounded-lg border border-border px-2 py-1.5 text-[11px] font-semibold text-foreground hover:bg-muted disabled:opacity-50"
              >
                <Upload className="size-3" />
                Upload
              </button>
            ) : null}
            <button
              type="button"
              onClick={handleClose}
              className="rounded-lg border border-border p-1.5 text-muted-foreground hover:bg-muted"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          {draftImage ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {IMAGE_SIZE_OPTIONS.map((size) => {
                  const variant = draftImage.images[size];
                  const url = getPreferredVariantUrl(variant);
                  const isSelected =
                    draftSize === size || selectedImageUrl === url;

                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setDraftSize(size)}
                      className={`relative overflow-hidden rounded-xl border text-left transition ${
                        isSelected
                          ? 'border-accent ring-2 ring-accent/40'
                          : 'border-border hover:border-accent/50'
                      }`}
                    >
                      <ProgressiveImage
                        blurDataUrl={draftImage.blurDataUrl}
                        variant={variant}
                        alt={`${draftImage.originalFileName} · ${size}`}
                        aspectRatio="square"
                        sizes="50vw"
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-2.5 pb-2 pt-8">
                        <p className="text-xs font-semibold capitalize text-white">
                          {size}
                        </p>
                        <p className="text-[10px] text-white/80">
                          {variant.width}×{variant.height} ·{' '}
                          {formatBytes(variant.bytes)}
                        </p>
                      </div>
                      {isSelected ? (
                        <span className="absolute right-2 top-2 rounded-full bg-accent p-0.5 text-accent-foreground dark:text-black">
                          <Check className="size-3.5" />
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
              <button
                type="button"
                onClick={handleConfirmSize}
                className="w-full rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground dark:text-black"
              >
                {confirmLabel(draftSize)}
              </button>
            </div>
          ) : isLoading ? (
            <div className="grid grid-cols-4 gap-2">
              {Array.from({ length: 8 }).map((_, index) => (
                <div
                  key={index}
                  className="aspect-square animate-pulse rounded-xl bg-muted"
                />
              ))}
            </div>
          ) : isError ? (
            <div className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-10 text-center">
              <p className="text-sm text-foreground">Could not load images</p>
              <button
                type="button"
                onClick={() => void refetch()}
                className="mt-3 text-xs font-semibold text-accent hover:underline"
              >
                Retry
              </button>
            </div>
          ) : images.length === 0 ? (
            <div className="space-y-3">
              <div className="grid grid-cols-4 gap-2">{uploadTile}</div>
              <div className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-8 text-center">
                <p className="text-sm font-medium text-foreground">
                  No images yet
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{emptyHint}</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {uploadTile}
              {images.map((image) => {
                const small = image.images.small;
                const isSelected = selectedImageId === image.id;

                return (
                  <button
                    key={image.id}
                    type="button"
                    onClick={() => {
                      setDraftImage(image);
                      setDraftSize('medium');
                    }}
                    className={`group relative overflow-hidden rounded-xl border text-left transition ${
                      isSelected
                        ? 'border-accent ring-2 ring-accent/40'
                        : 'border-border hover:border-accent/50'
                    }`}
                  >
                    <ProgressiveImage
                      blurDataUrl={image.blurDataUrl}
                      variant={small}
                      alt={image.originalFileName}
                      aspectRatio="square"
                      sizes="25vw"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-1.5 pb-1.5 pt-5">
                      <p className="truncate text-[10px] font-medium text-white">
                        {image.originalFileName}
                      </p>
                    </div>
                    {isSelected ? (
                      <span className="absolute right-1.5 top-1.5 rounded-full bg-accent p-0.5 text-accent-foreground dark:text-black">
                        <Check className="size-3" />
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <ImageUploadDialog
        open={uploadOpen}
        isUploading={isUploading}
        defaultType={resolvedUploadType}
        overlayClassName="z-[80]"
        onClose={() => {
          if (!isUploading) setUploadOpen(false);
        }}
        onConfirm={async (file, uploadImageType, idempotencyKey) => {
          const result = await upload(file, uploadImageType, idempotencyKey);
          if (result) {
            setUploadOpen(false);
            setDraftImage(result);
            setDraftSize('medium');
          }
        }}
      />
    </div>
  );
}
