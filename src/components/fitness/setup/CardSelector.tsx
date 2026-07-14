'use client';

import { useEffect, useState } from 'react';
import { Check, Pencil } from 'lucide-react';
import { getPhysiqueGoalFallbackImage } from '@/lib/fitness/physiqueGoalMapper';

type CardSelectorOption<T extends string> = {
  value: T;
  label: string;
  description?: string;
  icon?: string;
  imageUrl?: string;
};

type CardSelectorProps<T extends string> = {
  value: T | '';
  options: CardSelectorOption<T>[];
  onChange: (value: T) => void;
  variant?: 'grid' | 'physique' | 'goal';
  columns?: 1 | 2 | 3;
  error?: string;
  /** When set, shows hover edit control on goal/physique images. */
  onEditImage?: (value: T) => void;
};

export default function CardSelector<T extends string>({
  value,
  options,
  onChange,
  variant = 'grid',
  columns = 2,
  error,
  onEditImage,
}: CardSelectorProps<T>) {
  const gridClass =
    variant === 'physique' || variant === 'goal'
      ? 'grid-cols-1 sm:grid-cols-2'
      : columns === 1
        ? 'grid-cols-1'
        : columns === 3
          ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3'
          : 'grid-cols-1 sm:grid-cols-2';

  return (
    <div className="space-y-2">
      <div className={`grid gap-4 ${gridClass}`}>
        {options.map((option) => (
          <PhysiqueCardOption
            key={option.value}
            option={option}
            isSelected={value === option.value}
            isImageFirst={variant === 'physique' || variant === 'goal'}
            onSelect={() => onChange(option.value)}
            onEditImage={
              onEditImage ? () => onEditImage(option.value) : undefined
            }
          />
        ))}
      </div>
      {error ? <p className="text-xs text-red-500">{error}</p> : null}
    </div>
  );
}

type PhysiqueCardOptionProps<T extends string> = {
  option: CardSelectorOption<T>;
  isSelected: boolean;
  isImageFirst: boolean;
  onSelect: () => void;
  onEditImage?: () => void;
};

function PhysiqueCardOption<T extends string>({
  option,
  isSelected,
  isImageFirst,
  onSelect,
  onEditImage,
}: PhysiqueCardOptionProps<T>) {
  const [imageSrc, setImageSrc] = useState(option.imageUrl);

  useEffect(() => {
    setImageSrc(option.imageUrl);
  }, [option.imageUrl]);

  const showImage = Boolean(imageSrc);

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border text-left transition-all ${
        isSelected
          ? 'border-accent bg-accent/5 shadow-[0_0_24px_var(--neon-glow)]'
          : 'border-border bg-card hover:border-accent/40 hover:bg-muted/30'
      } ${isImageFirst ? 'p-0' : 'p-4'}`}
    >
      {showImage && isImageFirst ? (
        <div className="relative">
          <button type="button" onClick={onSelect} className="block w-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageSrc}
              alt={`${option.label} body reference`}
              className="h-44 w-full object-cover object-top sm:h-48"
              onError={() => {
                const fallback = getPhysiqueGoalFallbackImage(option.label);
                if (imageSrc !== fallback) {
                  setImageSrc(fallback);
                }
              }}
            />
          </button>
          {isSelected ? (
            <span className="pointer-events-none absolute right-3 top-3 flex size-7 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-lg dark:text-black">
              <Check className="size-4" />
            </span>
          ) : null}
          {onEditImage ? (
            <button
              type="button"
              onClick={onEditImage}
              className="absolute bottom-3 right-3 z-10 inline-flex items-center gap-1.5 rounded-lg bg-black/75 px-2.5 py-1.5 text-[11px] font-semibold text-white opacity-0 shadow-lg transition group-hover:opacity-100 hover:bg-black/90"
              aria-label={`Edit image for ${option.label}`}
            >
              <Pencil className="size-3" />
              Edit image
            </button>
          ) : null}
        </div>
      ) : null}

      <button
        type="button"
        onClick={onSelect}
        className={`block w-full text-left ${isImageFirst && showImage ? '' : ''}`}
      >
        {showImage && !isImageFirst ? (
          <div className="relative mb-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageSrc}
              alt={`${option.label} body reference`}
              className="h-32 w-full rounded-xl border border-border object-cover object-top"
              onError={() => {
                const fallback = getPhysiqueGoalFallbackImage(option.label);
                if (imageSrc !== fallback) {
                  setImageSrc(fallback);
                }
              }}
            />
          </div>
        ) : null}

        {!showImage && option.icon ? (
          <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-muted text-lg">
            {option.icon}
          </div>
        ) : null}

        {!showImage && isImageFirst ? (
          <div className="flex h-44 w-full items-center justify-center bg-muted/40 sm:h-48">
            <span className="text-xs font-medium text-muted-foreground">
              {option.label}
            </span>
          </div>
        ) : null}

        <div
          className={`flex items-start justify-between gap-3 ${
            isImageFirst ? 'p-4 pt-3' : ''
          }`}
        >
          <div>
            <p
              className={`font-semibold ${
                isSelected ? 'text-accent' : 'text-foreground'
              } ${isImageFirst ? 'text-base' : 'text-sm'}`}
            >
              {option.label}
            </p>
            {option.description ? (
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {option.description}
              </p>
            ) : null}
          </div>
          {!isImageFirst ? (
            <span
              className={`flex size-5 shrink-0 items-center justify-center rounded-full border ${
                isSelected
                  ? 'border-accent bg-accent text-accent-foreground dark:text-black'
                  : 'border-border bg-background text-transparent'
              }`}
            >
              <Check className="size-3" />
            </span>
          ) : null}
        </div>
      </button>
    </div>
  );
}
