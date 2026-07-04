import type {
  ApiDietPlannerResponse,
  ApiPlannerMealGroup,
  ApiPlannerMealItem,
} from '@/lib/fitforge/dietPlannerApiTypes';
import type {
  DietPlannerDashboard,
  DietPlannerMeal,
  MealSlot,
  MealStatus,
  SwapSuggestion,
} from '@/lib/fitforge/dietPlannerTypes';

const SLOT_META: Record<
  MealSlot,
  { title: string; time: string; isCritical?: boolean }
> = {
  breakfast: { title: 'Breakfast', time: '07:30 AM' },
  lunch: { title: 'Lunch', time: '01:15 PM' },
  snack: { title: 'Post-Workout', time: '04:30 PM', isCritical: true },
  dinner: { title: 'Dinner', time: '08:00 PM' },
};

function resolveStatus(item: ApiPlannerMealItem): MealStatus {
  return item.latestLog?.status ?? item.status ?? 'pending';
}

function mapMealItem(
  item: ApiPlannerMealItem,
  group?: ApiPlannerMealGroup,
): DietPlannerMeal {
  const slot = item.mealType ?? group?.mealType ?? group?.slot ?? 'breakfast';
  const meta = SLOT_META[slot] ?? { title: slot, time: '—' };

  return {
    id: item.id,
    slot,
    title: group?.title ?? group?.label ?? meta.title,
    description:
      item.food?.name ??
      (item.quantity ? `Serving x${item.quantity}` : 'Planned meal'),
    time: group?.time ?? meta.time,
    calories: Math.round(item.calories ?? 0),
    protein: Math.round(item.protein ?? 0),
    carbs: Math.round(item.carbs ?? 0),
    fats: Math.round(item.fats ?? 0),
    status: resolveStatus(item),
    isCritical: group?.isCritical ?? meta.isCritical,
    replacementFoodId: item.latestLog?.replacementFood?.id,
  };
}

function flattenMeals(groups: ApiPlannerMealGroup[] = []): DietPlannerMeal[] {
  const meals: DietPlannerMeal[] = [];

  for (const group of groups) {
    if (group.items?.length) {
      for (const item of group.items) {
        meals.push(mapMealItem(item, group));
      }
      continue;
    }

    if ((group as unknown as ApiPlannerMealItem).id) {
      meals.push(
        mapMealItem(group as unknown as ApiPlannerMealItem, group),
      );
    }
  }

  return meals.sort(
    (left, right) => slotOrder(left.slot) - slotOrder(right.slot),
  );
}

function slotOrder(slot: MealSlot) {
  const order: MealSlot[] = ['breakfast', 'lunch', 'snack', 'dinner'];
  return order.indexOf(slot);
}

function normalizeSodiumLevel(
  value?: string,
): DietPlannerDashboard['sodiumLevel'] {
  const level = (value ?? 'ok').toLowerCase();
  if (level.includes('high')) return 'high';
  if (level.includes('low')) return 'low';
  return 'ok';
}

export function mapDietPlannerResponse(
  data: ApiDietPlannerResponse,
): DietPlannerDashboard {
  const calorieTarget =
    data.dailyEnergy?.target ?? data.caloriesTarget ?? 2850;
  const caloriesConsumed =
    data.dailyEnergy?.consumed ?? data.caloriesConsumed ?? 0;
  const proteinTarget = data.proteinGoal?.target ?? data.proteinTarget ?? 210;
  const proteinConsumed =
    data.proteinGoal?.consumed ?? data.proteinConsumed ?? 0;

  const swapSuggestion: SwapSuggestion | undefined = data.swapSuggestion
    ? {
        mealPlanItemId: data.swapSuggestion.mealPlanItemId,
        originalName: data.swapSuggestion.original?.name ?? 'Original',
        suggestedName: data.swapSuggestion.suggested?.name ?? 'Alternative',
        replacementFoodId: data.swapSuggestion.suggested?.foodId,
      }
    : undefined;

  return {
    planLabel: data.planLabel ?? 'Diet Plan',
    phaseTitle: data.phaseTitle ?? 'PHASE: MUSCLE GAIN FOCUS',
    phaseDescription:
      data.phaseDescription ??
      'Current protocol optimized for lean mass gain. AI Athena is monitoring your glycemic response.',
    dailyCalorieTarget: calorieTarget,
    caloriesConsumed,
    proteinTarget,
    proteinConsumed,
    meals: flattenMeals(data.meals),
    aiCoachMessage:
      data.coachInsight ??
      '"Keep logging meals to unlock personalized coaching insights."',
    hydrationMl: data.hydration?.currentMl ?? 0,
    hydrationTargetMl: data.hydration?.targetMl ?? 4000,
    fiberPercent: data.vitals?.fiberPercent ?? 0,
    sodiumLevel: normalizeSodiumLevel(data.vitals?.sodiumLevel),
    caffeineMg: data.vitals?.caffeineMg ?? 0,
    dietPlanId: data.dietPlanId,
    mealPlanId: data.mealPlanId,
    swapSuggestion,
  };
}

export function createEmptyDietPlannerDashboard(): DietPlannerDashboard {
  return mapDietPlannerResponse({});
}
