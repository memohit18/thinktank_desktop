'use client';

import { useState } from 'react';
import type { ImageVariantFormat, UserImage } from '@/lib/images/types';

type ProgressiveImageProps = {
  blurDataUrl?: string | null;
  variant: ImageVariantFormat;
  alt: string;
  className?: string;
  sizes?: string;
  /** Force a fixed aspect box; grid uses square, lightbox keeps natural ratio. */
  aspectRatio?: 'square' | 'natural';
};

/** Shows blur placeholder until the sized image finishes loading. */
export function ProgressiveImage({
  blurDataUrl,
  variant,
  alt,
  className = '',
  sizes,
  aspectRatio = 'natural',
}: ProgressiveImageProps) {
  const [loaded, setLoaded] = useState(false);
  const aspect =
    aspectRatio === 'square'
      ? '1 / 1'
      : variant.width > 0 && variant.height > 0
        ? `${variant.width} / ${variant.height}`
        : '1 / 1';

  return (
    <div
      className="relative overflow-hidden bg-muted/30"
      style={{ aspectRatio: aspect }}
    >
      {blurDataUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={blurDataUrl}
          alt=""
          aria-hidden
          className={`absolute inset-0 size-full object-cover transition-opacity duration-300 ${
            loaded ? 'opacity-0' : 'opacity-100'
          }`}
        />
      ) : null}
      <picture>
        {variant.avif ? <source srcSet={variant.avif} type="image/avif" /> : null}
        {variant.webp ? <source srcSet={variant.webp} type="image/webp" /> : null}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={variant.jpeg || variant.webp || variant.avif}
          alt={alt}
          sizes={sizes}
          width={variant.width || undefined}
          height={variant.height || undefined}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          className={`absolute inset-0 size-full object-cover transition-opacity duration-300 ${
            loaded ? 'opacity-100' : 'opacity-0'
          } ${className}`}
        />
      </picture>
    </div>
  );
}

type ImageLightboxProps = {
  image: UserImage;
  onClose: () => void;
};

export function ImageLightbox({ image, onClose }: ImageLightboxProps) {
  const large = image.images.large;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <button
        type="button"
        aria-label="Close image preview"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
      />
      <div className="relative z-10 max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">
              {image.originalFileName}
            </p>
            <p className="text-[11px] text-muted-foreground">
              {large.width}×{large.height}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
          >
            Close
          </button>
        </div>
        <div className="max-h-[calc(90vh-4rem)] overflow-auto bg-muted/20 p-3">
          <ProgressiveImage
            blurDataUrl={image.blurDataUrl}
            variant={large}
            alt={image.originalFileName}
            sizes="(max-width: 768px) 100vw, 768px"
          />
        </div>
      </div>
    </div>
  );
}
