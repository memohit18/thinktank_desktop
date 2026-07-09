'use client';

import FoodCard, { type FoodPreferenceAction } from '@/components/fitness/food-preferences/FoodCard';
import EmptyState from '@/components/fitness/food-preferences/EmptyState';
import type { Food } from '@/lib/fitness/food/types';

type FoodGridProps = {
  foods: Food[];
  favoriteFoodIds: string[];
  restrictedFoodIds: string[];
  availableFoodIds: string[];
  isAdmin?: boolean;
  onToggle: (foodId: string, action: FoodPreferenceAction) => void;
  onEditFood?: (food: Food) => void;
  isLoading?: boolean;
  emptyMessage?: string;
};

function canEditFood(food: Food, isAdmin: boolean) {
  if (food.isCustom) return true;
  return isAdmin && Boolean(food.isVerified);
}

export default function FoodGrid({
  foods,
  favoriteFoodIds,
  restrictedFoodIds,
  availableFoodIds,
  isAdmin = false,
  onToggle,
  onEditFood,
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
      {foods.map((food) => (
        <FoodCard
          key={food.id}
          food={food}
          isFavorite={favoriteFoodIds.includes(food.id)}
          isRestricted={restrictedFoodIds.includes(food.id)}
          isAvailable={availableFoodIds.includes(food.id)}
          canEdit={canEditFood(food, isAdmin)}
          onEdit={onEditFood ? () => onEditFood(food) : undefined}
          onToggle={(action) => onToggle(food.id, action)}
        />
      ))}
    </div>
  );
}
