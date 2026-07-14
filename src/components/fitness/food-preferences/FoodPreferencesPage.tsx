'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Plus, Save } from 'lucide-react';
import EditFoodModal from '@/components/fitness/food-preferences/EditFoodModal';
import FoodFormModal from '@/components/fitness/food-preferences/FoodFormModal';
import NutritionBudgetSelector from '@/components/NutritionPreferences/BudgetSelector';
import CookingTimeSlider from '@/components/NutritionPreferences/CookingTimeSlider';
import CuisineSelector from '@/components/NutritionPreferences/CuisineSelector';
import MealTimingSelector from '@/components/NutritionPreferences/MealTimingSelector';
import MealsSelector from '@/components/NutritionPreferences/MealsSelector';
import FitnessModuleShell from '@/components/fitness/FitnessModuleShell';
import FitnessApiErrorState from '@/components/fitness/FitnessApiErrorState';
import CategoryTabs from '@/components/fitness/food-preferences/CategoryTabs';
import type { FoodPreferenceAction } from '@/components/fitness/food-preferences/FoodCard';
import FoodGrid from '@/components/fitness/food-preferences/FoodGrid';
import FoodSearch from '@/components/fitness/food-preferences/FoodSearch';
import LoadingSkeleton from '@/components/fitness/food-preferences/LoadingSkeleton';
import PreferenceSection from '@/components/fitness/food-preferences/PreferenceSection';
import { useToast } from '@/components/ui/Toast';
import { useFoodPreferences } from '@/hooks/useFoodPreferences';
import { useFoods } from '@/hooks/useFoods';
import { useNutritionPreferences } from '@/hooks/useNutritionPreferences';
import { useSaveFood } from '@/hooks/useSaveFood';
import { useSaveFoodPreferences } from '@/hooks/useSaveFoodPreferences';
import { useSaveNutritionPreferences } from '@/hooks/useSaveNutritionPreferences';
import { useUpdateFood } from '@/hooks/useUpdateFood';
import { useDeleteFood } from '@/hooks/useDeleteFood';
import {
  FOOD_PREFERENCE_MIN_FAVORITES,
} from '@/lib/fitness/food/constants';
import {
  applyFoodPreferenceToggle,
} from '@/lib/fitness/food/foodPreferenceActions';
import {
  EMPTY_FOOD_PREFERENCES_VALUES,
  foodPreferencesSchema,
  type FoodPreferencesSchemaValues,
} from '@/lib/fitness/food/schemas/foodPreferences.schema';
import {
  nutritionPreferencesSchema,
  type NutritionPreferencesSchemaValues,
} from '@/schemas/nutrition-preferences.schema';
import type {
  MealTimingPreference,
  MealsPerDay,
  NutritionBudget,
  PreferredCuisine,
} from '@/types/nutrition-preferences';
import type { Food } from '@/lib/fitness/food/types';
import type { CreateFoodSchemaValues } from '@/lib/fitness/food/schemas/food.schema';
import { useIsAdmin } from '@/hooks/useIsAdmin';

export default function FoodPreferencesPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const {
    foods,
    allFoods,
    categories,
    categoriesResult,
    meta,
    search,
    setSearch,
    categoryId,
    setCategoryId,
    page,
    setPage,
    canGoPrevious,
    canGoNext,
    isLoading: isFoodsLoading,
    isFetching: isFoodsFetching,
    isError: isFoodsError,
    refetch: refetchFoods,
  } = useFoods();

  const {
    preferences,
    initialValues,
    hasHydrated,
    isLoading: isPreferencesLoading,
    isError: isPreferencesError,
    persistDraft,
    clearDraft,
    refetch: refetchPreferences,
  } = useFoodPreferences();

  const {
    initialValues: nutritionInitialValues,
    hasExistingPreferences: hasExistingNutritionPreferences,
    hasHydrated: hasNutritionHydrated,
    isLoading: isNutritionLoading,
    isError: isNutritionError,
    refetch: refetchNutritionPreferences,
  } = useNutritionPreferences();

  const { savePreferences, isSaving } = useSaveFoodPreferences({
    onSaved: clearDraft,
    showSuccessToast: false,
  });

  const {
    saveNutritionPreferences,
    isSaving: isNutritionSaving,
  } = useSaveNutritionPreferences({
    hasExistingPreferences: hasExistingNutritionPreferences,
    showSuccessToast: false,
  });

  const foodForm = useForm<FoodPreferencesSchemaValues>({
    resolver: zodResolver(foodPreferencesSchema),
    defaultValues: EMPTY_FOOD_PREFERENCES_VALUES,
    mode: 'onChange',
  });

  const nutritionForm = useForm<NutritionPreferencesSchemaValues>({
    resolver: zodResolver(nutritionPreferencesSchema),
    defaultValues: {},
    mode: 'onChange',
  });

  const [hasInitializedFoodForm, setHasInitializedFoodForm] = useState(false);
  const [hasInitializedNutritionForm, setHasInitializedNutritionForm] =
    useState(false);
  const [isCreateCustomOpen, setIsCreateCustomOpen] = useState(false);
  const [isCreateCatalogOpen, setIsCreateCatalogOpen] = useState(false);
  const [editingFood, setEditingFood] = useState<Food | null>(null);
  const [deletingFoodId, setDeletingFoodId] = useState<string | null>(null);

  const isAdmin = useIsAdmin();
  const categoryOptions =
    categoriesResult?.allowedCategories ?? categoriesResult?.tabs ?? categories;

  const { saveFood: saveCustomFood, isSaving: isCreatingCustomFood } = useSaveFood({
    mode: 'custom',
  });

  const { saveFood: saveCatalogFood, isSaving: isCreatingCatalogFood } = useSaveFood({
    mode: 'catalog',
  });

  const { updateFood, isUpdating: isUpdatingFood } = useUpdateFood();
  const { deleteFood, isDeleting: isDeletingFood } = useDeleteFood({
    onDeleted: () => setEditingFood(null),
  });

  const favoriteFoodIds = useWatch({
    control: foodForm.control,
    name: 'favoriteFoodIds',
  }) ?? [];
  const restrictedFoodIds = useWatch({
    control: foodForm.control,
    name: 'restrictedFoodIds',
  }) ?? [];
  const availableFoodIds = useWatch({
    control: foodForm.control,
    name: 'availableFoodIds',
  }) ?? [];

  const watchedNutritionValues = useWatch({
    control: nutritionForm.control,
  });

  const nutritionValues = watchedNutritionValues ?? {};

  const draftTimeoutRef = useRef<number | null>(null);

  const catalogFoods = useMemo(() => {
    const map = new Map(allFoods.map((food) => [food.id, food]));

    for (const food of [
      ...(preferences?.favoriteFoods ?? []),
      ...(preferences?.restrictedFoods ?? []),
      ...(preferences?.availableFoods ?? []),
    ]) {
      map.set(food.id, food);
    }

    return Array.from(map.values());
  }, [allFoods, preferences]);

  useEffect(() => {
    if (!hasHydrated || hasInitializedFoodForm) return;
    foodForm.reset(initialValues);
    setHasInitializedFoodForm(true);
  }, [foodForm, hasHydrated, hasInitializedFoodForm, initialValues]);

  useEffect(() => {
    if (!hasNutritionHydrated || hasInitializedNutritionForm) return;
    nutritionForm.reset(nutritionInitialValues);
    setHasInitializedNutritionForm(true);
  }, [
    hasInitializedNutritionForm,
    hasNutritionHydrated,
    nutritionForm,
    nutritionInitialValues,
  ]);

  const persistDraftDebounced = useCallback(
    (values: FoodPreferencesSchemaValues) => {
      if (draftTimeoutRef.current) {
        window.clearTimeout(draftTimeoutRef.current);
      }

      draftTimeoutRef.current = window.setTimeout(() => {
        persistDraft(values);
      }, 400);
    },
    [persistDraft],
  );

  useEffect(() => {
    if (!hasInitializedFoodForm) return;

    persistDraftDebounced({
      favoriteFoodIds,
      restrictedFoodIds,
      availableFoodIds,
    });

    return () => {
      if (draftTimeoutRef.current) {
        window.clearTimeout(draftTimeoutRef.current);
      }
    };
  }, [
    availableFoodIds,
    favoriteFoodIds,
    hasInitializedFoodForm,
    persistDraftDebounced,
    restrictedFoodIds,
  ]);

  const handleToggle = useCallback((foodId: string, action: FoodPreferenceAction) => {
    const nextValues = applyFoodPreferenceToggle(foodForm.getValues(), foodId, action);
    foodForm.reset(nextValues, { keepDefaultValues: false });
    void foodForm.trigger();
  }, [foodForm]);

  const handleRemove = useCallback((
    foodId: string,
    field: 'favoriteFoodIds' | 'restrictedFoodIds' | 'availableFoodIds',
  ) => {
    const current = foodForm.getValues();
    foodForm.reset(
      {
        ...current,
        [field]: current[field].filter((id) => id !== foodId),
      },
      { keepDefaultValues: false },
    );
    void foodForm.trigger();
  }, [foodForm]);

  async function handleCreateCustomFood(values: CreateFoodSchemaValues) {
    const food = await saveCustomFood(values);
    return Boolean(food);
  }

  async function handleCreateCatalogFood(values: CreateFoodSchemaValues) {
    const food = await saveCatalogFood(values);
    return Boolean(food);
  }

  async function handleUpdateFood(
    foodId: string,
    values: Parameters<typeof updateFood>[1],
    options?: { removeCategory?: boolean },
  ) {
    const food = await updateFood(foodId, values, options);
    return Boolean(food);
  }

  async function handleDeleteFood(foodId: string) {
    setDeletingFoodId(foodId);
    try {
      return await deleteFood(foodId);
    } finally {
      setDeletingFoodId(null);
    }
  }

  async function handleDeleteFoodFromCard(food: Food) {
    return handleDeleteFood(food.id);
  }

  async function handleSave() {
    const [isFoodValid, isNutritionValid] = await Promise.all([
      foodForm.trigger(),
      nutritionForm.trigger(),
    ]);

    if (!isFoodValid || !isNutritionValid) return;

    const [foodSaved, nutritionSaved] = await Promise.all([
      savePreferences(foodForm.getValues()),
      saveNutritionPreferences(nutritionForm.getValues()),
    ]);

    if (!foodSaved || !nutritionSaved) return;

    showToast('Food and nutrition preferences saved successfully.');
    router.push('/fitness/transformation');
  }

  const saveFooter = (
    <div className="border-t border-border bg-background/95 px-4 py-4 backdrop-blur sm:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">
          Save both sections to continue to your transformation plan.
        </p>
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={isSaving || isNutritionSaving}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground shadow-[0_0_24px_var(--neon-glow)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 dark:text-black"
        >
          {isSaving || isNutritionSaving ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          Save &amp; Continue
        </button>
      </div>
    </div>
  );

  const hasCriticalError =
    isFoodsError || isPreferencesError || isNutritionError;

  if (
    isPreferencesLoading ||
    isNutritionLoading ||
    (isFoodsLoading && foods.length === 0) ||
    !hasInitializedFoodForm ||
    !hasInitializedNutritionForm
  ) {
    return (
      <FitnessModuleShell activeNav="nutrition">
        <LoadingSkeleton />
      </FitnessModuleShell>
    );
  }

  if (hasCriticalError) {
    return (
      <FitnessModuleShell activeNav="nutrition">
        <FitnessApiErrorState
          title="Could not load nutrition preferences"
          message="Food and nutrition data could not be loaded from the server. Retry when your connection is available."
          onRetry={() => {
            void refetchFoods();
            void refetchPreferences();
            void refetchNutritionPreferences();
          }}
        />
      </FitnessModuleShell>
    );
  }

  const foodErrors = foodForm.formState.errors;
  const nutritionErrors = nutritionForm.formState.errors;

  return (
    <FitnessModuleShell activeNav="nutrition" footer={saveFooter}>
      <div className="space-y-6">
        <header>
          <p className="text-xs font-semibold uppercase tracking-widest text-accent">
            Nutrition
          </p>
          <h1 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">
            Nutrition Preferences
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
            Fine-tune both the foods you want in your plan and how meals should
            be structured around your taste, schedule, and budget.
          </p>
        </header>

        <section className="space-y-6 rounded-2xl border border-border bg-card p-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-accent">
              Section 1
            </p>
            <h2 className="mt-2 text-xl font-semibold text-foreground">
              Food Preferences
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Choose the foods you want to prioritize, avoid, or keep available
              in your meal recommendations.
            </p>
          </div>

          <FoodSearch
            value={search}
            onChange={setSearch}
            resultCount={meta?.total ?? foods.length}
          />

          <CategoryTabs
            categories={categories}
            activeCategoryId={categoryId}
            onChange={setCategoryId}
          />

          <PreferenceSection
            title="Favorite foods"
            description="Foods you enjoy and want prioritized in your meal plans."
            requirement={`Min ${FOOD_PREFERENCE_MIN_FAVORITES}`}
            foods={catalogFoods}
          selectedIds={favoriteFoodIds}
          onRemove={(foodId) => handleRemove(foodId, 'favoriteFoodIds')}
          error={foodErrors.favoriteFoodIds?.message}
            emptyLabel="Add favorites from the available foods grid below."
          />

          <PreferenceSection
            title="Restricted foods"
            description="Foods to exclude from recommendations due to preference or intolerance."
            foods={catalogFoods}
          selectedIds={restrictedFoodIds}
          onRemove={(foodId) => handleRemove(foodId, 'restrictedFoodIds')}
          error={foodErrors.restrictedFoodIds?.message}
            emptyLabel="No restricted foods selected."
          />

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-foreground">Available foods</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Browse and tag foods you are willing to eat. Mark favorites,
                restrictions, or availability using the action buttons on each card.
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                {availableFoodIds.length} tagged as available
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setIsCreateCustomOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
              >
                <Plus className="size-4" />
                Add custom food
              </button>
              {isAdmin ? (
                <button
                  type="button"
                  onClick={() => setIsCreateCatalogOpen(true)}
                  className="inline-flex items-center gap-2 rounded-xl border border-accent/30 bg-accent/10 px-4 py-2.5 text-sm font-semibold text-accent transition-colors hover:bg-accent/15"
                >
                  <Plus className="size-4" />
                  Add catalog food
                </button>
              ) : null}
            </div>
          </div>

          <FoodGrid
            foods={foods}
            favoriteFoodIds={favoriteFoodIds}
            restrictedFoodIds={restrictedFoodIds}
            availableFoodIds={availableFoodIds}
            isAdmin={isAdmin}
            deletingFoodId={deletingFoodId}
            onToggle={handleToggle}
            onEditFood={setEditingFood}
            onDeleteFood={handleDeleteFoodFromCard}
            isLoading={isFoodsFetching}
          />

          {(meta?.totalPages ?? 0) > 1 ? (
            <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
              <p className="text-xs text-muted-foreground">
                Page {meta?.page ?? 1} of {meta?.totalPages ?? 1}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  disabled={!canGoPrevious || isFoodsFetching}
                  className="rounded-xl border border-border px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => setPage((current) => current + 1)}
                  disabled={!canGoNext || isFoodsFetching}
                  className="rounded-xl border border-border px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          ) : null}
        </section>

        <div className="border-t border-border" />

        <section className="space-y-6 rounded-2xl border border-border bg-card p-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-accent">
              Section 2
            </p>
            <h2 className="mt-2 text-xl font-semibold text-foreground">
              Nutrition Preferences
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Set meal structure preferences so recommendations match your
              budget, cuisine, timing, and cooking routine.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <NutritionBudgetSelector
              value={nutritionValues.budgetCategory}
              onChange={(value: NutritionBudget) =>
                nutritionForm.setValue('budgetCategory', value, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
              error={nutritionErrors.budgetCategory?.message}
            />

            <CuisineSelector
              value={nutritionValues.preferredCuisine}
              onChange={(value: PreferredCuisine) =>
                nutritionForm.setValue('preferredCuisine', value, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
              error={nutritionErrors.preferredCuisine?.message}
            />

            <MealsSelector
              value={nutritionValues.mealsPerDay}
              onChange={(value: MealsPerDay) =>
                nutritionForm.setValue('mealsPerDay', value, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
              error={nutritionErrors.mealsPerDay?.message}
            />

            <MealTimingSelector
              value={nutritionValues.preferredMealTiming}
              onChange={(value: MealTimingPreference) =>
                nutritionForm.setValue('preferredMealTiming', value, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
              error={nutritionErrors.preferredMealTiming?.message}
            />
          </div>

          <CookingTimeSlider
            value={nutritionValues.cookingTimeMinutes}
            onChange={(value) =>
              nutritionForm.setValue('cookingTimeMinutes', value, {
                shouldDirty: true,
                shouldValidate: true,
              })
            }
            error={nutritionErrors.cookingTimeMinutes?.message}
          />
        </section>
      </div>

      <FoodFormModal
        open={isCreateCustomOpen}
        title="Add custom food"
        description="Create a personal food entry with category and macros. Aliases like carbs are accepted by the API."
        submitLabel="Create custom food"
        categories={categoryOptions}
        isSubmitting={isCreatingCustomFood}
        onClose={() => setIsCreateCustomOpen(false)}
        onSubmit={handleCreateCustomFood}
      />

      <FoodFormModal
        open={isCreateCatalogOpen}
        title="Add catalog food"
        description="Create a verified catalog food entry. Admin only."
        submitLabel="Create catalog food"
        categories={categoryOptions}
        isSubmitting={isCreatingCatalogFood}
        onClose={() => setIsCreateCatalogOpen(false)}
        onSubmit={handleCreateCatalogFood}
      />

      <EditFoodModal
        food={editingFood}
        categories={categoryOptions}
        isSubmitting={isUpdatingFood}
        isDeleting={isDeletingFood}
        onClose={() => setEditingFood(null)}
        onSubmit={handleUpdateFood}
        onDelete={handleDeleteFood}
      />
    </FitnessModuleShell>
  );
}
