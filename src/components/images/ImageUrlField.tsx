'use client';

import { useState } from 'react';
import { Camera, ImageIcon, X } from 'lucide-react';
import ImageLibraryPicker, {
  type ImageSizeOption,
} from '@/components/images/ImageLibraryPicker';
import type { UserImage } from '@/lib/images/types';

type ImageUrlFieldProps = {
  label?: string;
  value?: string | null;
  disabled?: boolean;
  error?: string;
  /** Filter listing API by image type when set. */
  imageType?: string;
  /** Prefill upload type in the nested upload dialog. */
  uploadType?: string;
  pickerTitle?: string;
  pickerDescription?: string;
  changeLabel?: string;
  chooseLabel?: string;
  /** Ensure picker sits above parent modals. */
  pickerOverlayClassName?: string;
  onChange: (imageUrl: string | null, meta?: {
    image: UserImage;
    size: ImageSizeOption;
  }) => void;
};

export default function ImageUrlField({
  label = 'Image',
  value,
  disabled = false,
  error,
  imageType,
  uploadType,
  pickerTitle = 'Choose image',
  pickerDescription = 'Pick from your uploaded images',
  changeLabel = 'Change image',
  chooseLabel = 'Choose image',
  pickerOverlayClassName = 'z-[70]',
  onChange,
}: ImageUrlFieldProps) {
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <div>
      <p className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>

      <div className="flex items-center gap-3 rounded-xl border border-border bg-background p-3">
        <div className="relative size-16 shrink-0 overflow-hidden rounded-xl border border-border bg-muted/30">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={value}
              alt=""
              className="size-full object-cover"
            />
          ) : (
            <div className="flex size-full items-center justify-center text-muted-foreground">
              <ImageIcon className="size-5" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-xs text-muted-foreground">
            {value ? value : 'No image selected'}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={disabled}
              onClick={() => setPickerOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Camera className="size-3.5" />
              {value ? changeLabel : chooseLabel}
            </button>
            {value ? (
              <button
                type="button"
                disabled={disabled}
                onClick={() => onChange(null)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X className="size-3.5" />
                Remove
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {error ? (
        <p className="mt-1.5 text-xs text-red-500">{error}</p>
      ) : null}

      <ImageLibraryPicker
        open={pickerOpen}
        selectedImageUrl={value}
        title={pickerTitle}
        description={pickerDescription}
        type={imageType}
        uploadType={uploadType || imageType}
        overlayClassName={pickerOverlayClassName}
        onClose={() => setPickerOpen(false)}
        onSelect={(image, imageUrl, size) => {
          onChange(imageUrl, { image, size });
          setPickerOpen(false);
        }}
      />
    </div>
  );
}
