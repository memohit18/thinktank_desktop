'use client';

import { useState, type ReactNode } from 'react';
import { Ban, Check, Heart, Pencil, Trash2, UtensilsCrossed } from 'lucide-react';
import type { Food } from '@/lib/fitness/food/types';

export type FoodPreferenceAction = 'favorite' | 'restricted' | 'available';

type FoodCardProps = {
  food: Food;
  isFavorite: boolean;
  isRestricted: boolean;
  isAvailable: boolean;
  canEdit?: boolean;
  isDeleting?: boolean;
  onToggle: (action: FoodPreferenceAction) => void;
  onEdit?: () => void;
  onDelete?: () => void | Promise<boolean>;
};

export default function FoodCard({
  food,
  isFavorite,
  isRestricted,
  isAvailable,
  canEdit = false,
  isDeleting = false,
  onToggle,
  onEdit,
  onDelete,
}: FoodCardProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  async function handleConfirmDelete() {
    if (!onDelete || isDeleting) return;
    const ok = await onDelete();
    if (ok !== false) setConfirmOpen(false);
  }

  return (
    <>
      <article
        className={`flex flex-col rounded-2xl border bg-card p-4 transition-colors ${
          isFavorite || isRestricted || isAvailable
            ? 'border-accent/40 shadow-[0_0_16px_var(--neon-glow)]'
            : 'border-border hover:border-accent/30'
        }`}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="relative flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-accent/10 text-accent">
            {food.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={food.imageUrl}
                alt=""
                className="size-full object-cover"
              />
            ) : (
              <UtensilsCrossed className="size-5" />
            )}
          </div>
          {canEdit ? (
            <div className="flex items-center gap-1.5">
              {onEdit ? (
                <button
                  type="button"
                  onClick={onEdit}
                  disabled={isDeleting}
                  className="rounded-lg border border-border p-2 text-muted-foreground transition-colors hover:border-accent/40 hover:text-foreground disabled:opacity-50"
                  aria-label={`Edit ${food.name}`}
                >
                  <Pencil className="size-3.5" />
                </button>
              ) : null}
              {onDelete ? (
                <button
                  type="button"
                  onClick={() => setConfirmOpen(true)}
                  disabled={isDeleting}
                  className="rounded-lg border border-border p-2 text-muted-foreground transition-colors hover:border-rose-400/50 hover:text-rose-600 disabled:opacity-50"
                  aria-label={`Delete ${food.name}`}
                >
                  <Trash2 className="size-3.5" />
                </button>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-sm font-semibold text-foreground">{food.name}</h3>
          {food.isCustom ? (
            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Custom
            </span>
          ) : null}
        </div>
        <p className="mt-1 text-xs capitalize text-muted-foreground">
          {food.categoryName ?? food.categoryId.replace(/_/g, ' ')}
        </p>

        {food.calories || food.protein ? (
          <p className="mt-2 text-[11px] text-muted-foreground">
            {food.calories ? `${Math.round(food.calories)} kcal` : ''}
            {food.calories && food.protein ? ' · ' : ''}
            {food.protein ? `${Math.round(food.protein)}g protein` : ''}
          </p>
        ) : null}

        <div className="mt-4 grid grid-cols-3 gap-2">
          <ActionButton
            label="Favorite"
            active={isFavorite}
            onClick={() => onToggle('favorite')}
            icon={<Heart className="size-3.5" />}
          />
          <ActionButton
            label="Restrict"
            active={isRestricted}
            onClick={() => onToggle('restricted')}
            icon={<Ban className="size-3.5" />}
          />
          <ActionButton
            label="Available"
            active={isAvailable}
            onClick={() => onToggle('available')}
            icon={<Check className="size-3.5" />}
          />
        </div>
      </article>

      {confirmOpen ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <button
            type="button"
            aria-label="Close delete confirmation"
            className="absolute inset-0 cursor-default"
            disabled={isDeleting}
            onClick={() => {
              if (!isDeleting) setConfirmOpen(false);
            }}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={`delete-food-${food.id}`}
            className="relative z-10 w-full max-w-sm rounded-2xl border border-border bg-card p-5 shadow-2xl"
          >
            <h3
              id={`delete-food-${food.id}`}
              className="text-base font-semibold text-foreground"
            >
              Delete food?
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              This will permanently remove{' '}
              <span className="font-medium text-foreground">{food.name}</span>.
              This action cannot be undone.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setConfirmOpen(false)}
                className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
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
    </>
  );
}

function ActionButton({
  label,
  active,
  onClick,
  icon,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-1 rounded-lg border px-2 py-2 text-[10px] font-semibold uppercase tracking-wide transition-colors ${
        active
          ? 'border-accent bg-accent text-accent-foreground dark:text-black'
          : 'border-border bg-muted/20 text-muted-foreground hover:border-accent/40 hover:text-foreground'
      }`}
    >
      {icon}
    </button>
  );
}
