import { FOOD_PREFERENCES_STORAGE_KEY } from '@/lib/fitness/food/constants';
import type { FoodPreferencesDraft } from '@/lib/fitness/food/types';

export function readFoodPreferencesDraft(): FoodPreferencesDraft | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem(FOOD_PREFERENCES_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as FoodPreferencesDraft;
  } catch {
    return null;
  }
}

export function writeFoodPreferencesDraft(draft: FoodPreferencesDraft) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(FOOD_PREFERENCES_STORAGE_KEY, JSON.stringify(draft));
}

export function clearFoodPreferencesDraft() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(FOOD_PREFERENCES_STORAGE_KEY);
}
