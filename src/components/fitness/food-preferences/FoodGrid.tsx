'use client';

import { memo } from 'react';
import FoodCard, { type FoodPreferenceAction } from '@/components/fitness/food-preferences/FoodCard';
import EmptyState from '@/components/fitness/food-preferences/EmptyState';
import type { Food } from '@/lib/fitness/food/types';

type FoodGridProps = {
  foods: Food[];
  favoriteFoodIds: string[];
  restrictedFoodIds: string[];
  availableFoodIds: string[];
  isAdmin?: boolean;
  deletingFoodId?: string | null;
  onToggle: (foodId: string, action: FoodPreferenceAction) => void;
  onEditFood?: (food: Food) => void;
  onDeleteFood?: (food: Food) => void | Promise<boolean>;
  isLoading?: boolean;
  emptyMessage?: string;
};

function canManageFood(food: Food, isAdmin: boolean) {
  if (food.isCustom) return true;
  return isAdmin && Boolean(food.isVerified);
}

export default memo(FoodGrid);

function FoodGrid({
  foods,
  favoriteFoodIds,
  restrictedFoodIds,
  availableFoodIds,
  isAdmin = false,
  deletingFoodId = null,
  onToggle,
  onEditFood,
  onDeleteFood,
  isLoading = false,
  emptyMessage = 'No foods match your search or category filter.',
}: FoodGridProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="h-44 animate-pulse rounded-2xl border border-border bg-muted/30"
          />
        ))}
      </div>
    );
  }

  if (foods.length === 0) {
    return <EmptyState title="No foods found" description={emptyMessage} />;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {foods.map((food) => {
        const canManage = canManageFood(food, isAdmin);
        return (
          <FoodCard
            key={food.id}
            food={food}
            isFavorite={favoriteFoodIds.includes(food.id)}
            isRestricted={restrictedFoodIds.includes(food.id)}
            isAvailable={availableFoodIds.includes(food.id)}
            canEdit={canManage}
            isDeleting={deletingFoodId === food.id}
            onEdit={onEditFood ? () => onEditFood(food) : undefined}
            onDelete={
              onDeleteFood && canManage
                ? () => onDeleteFood(food)
                : undefined
            }
            onToggle={(action) => onToggle(food.id, action)}
          />
        );
      })}
    </div>
  );
}
