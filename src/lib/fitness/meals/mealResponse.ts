import { unwrapFitnessData, isFitnessErrorEnvelope } from '@/lib/fitness/fitnessResponse';
import {
  MEAL_DAY_ORDER,
  MEAL_TYPE_ORDER,
} from '@/lib/fitness/meals/constants';
import type {
  ActiveMealPlan,
  MealDayKey,
  MealDayPlan,
  MealHistoryItem,
  MealHistoryMeta,
  MealHistoryResponse,
  MealItem,
  MealItemStatus,
  MealMacroProgress,
  MealNutritionSummary,
  MealType,
  TodayMeals,
} from '@/lib/fitness/meals/types';

function readString(value: unknown, fallback = '') {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function readNumber(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function readNullableNumber(value: unknown) {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeMealType(value: unknown): MealType | null {
  const raw = readString(value).toLowerCase();
  if (
    raw === 'breakfast' ||
    raw === 'lunch' ||
    raw === 'snack' ||
    raw === 'dinner'
  ) {
    return raw;
  }
  return null;
}

function normalizeDayKey(value: unknown): MealDayKey | null {
  const raw = readString(value).toLowerCase();
  const aliases: Record<string, MealDayKey> = {
    mon: 'monday',
    monday: 'monday',
    tue: 'tuesday',
    tues: 'tuesday',
    tuesday: 'tuesday',
    wed: 'wednesday',
    wednesday: 'wednesday',
    thu: 'thursday',
    thur: 'thursday',
    thurs: 'thursday',
    thursday: 'thursday',
    fri: 'friday',
    friday: 'friday',
    sat: 'saturday',
    saturday: 'saturday',
    sun: 'sunday',
    sunday: 'sunday',
  };
  return aliases[raw] ?? null;
}

function parseLocalYmd(value: unknown): Date | null {
  const raw = readString(value);
  if (!raw) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(raw);
  if (match) {
    return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  }
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatLocalYmd(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getMealDayKeyFromDate(
  value: string | null | undefined,
): MealDayKey | null {
  const date = parseLocalYmd(value);
  if (!date) return null;
  const weekday = date.getDay();
  return MEAL_DAY_ORDER[weekday === 0 ? 6 : weekday - 1] ?? null;
}

function normalizeStatus(value: unknown): MealItemStatus {
  const raw = readString(value).toLowerCase();
  if (!raw) return 'pending';
  if (raw === 'complete' || raw === 'completed' || raw === 'done') {
    return 'completed';
  }
  if (raw === 'skip' || raw === 'skipped') return 'skipped';
  if (raw === 'replace' || raw === 'replaced') return 'replaced';
  return raw;
}

function normalizeMacroProgress(
  raw: unknown,
  goalFallback = 0,
): MealMacroProgress {
  if (raw && typeof raw === 'object') {
    const record = raw as Record<string, unknown>;
    const current = readNumber(
      record.consumed ?? record.current ?? record.value ?? record.amount,
    );
    const goal = readNumber(
      record.goal ?? record.target ?? record.total ?? goalFallback,
      goalFallback,
    );
    return {
      current,
      goal: goal > 0 ? goal : goalFallback,
      remaining: readNullableNumber(record.remaining) ?? undefined,
      percent: readNullableNumber(record.percent) ?? undefined,
    };
  }

  return { current: 0, goal: goalFallback };
}

function readTargets(record: Record<string, unknown>) {
  const targets =
    record.targets && typeof record.targets === 'object'
      ? (record.targets as Record<string, unknown>)
      : record;

  return {
    calories: readNumber(
      targets.calories ??
        targets.dailyCalories ??
        targets.caloriesTarget ??
        record.dailyCalories,
    ),
    protein: readNumber(
      targets.protein ??
        targets.dailyProtein ??
        targets.proteinTarget ??
        record.dailyProtein,
    ),
    carbs: readNumber(
      targets.carbs ??
        targets.carbohydrates ??
        targets.dailyCarbs ??
        targets.carbsTarget,
    ),
    fats: readNumber(
      targets.fats ?? targets.fat ?? targets.dailyFats ?? targets.fatsTarget,
    ),
  };
}

export function normalizeMealItem(raw: unknown): MealItem | null {
  if (!raw || typeof raw !== 'object') return null;

  const record = raw as Record<string, unknown>;
  const items = Array.isArray(record.items) ? record.items : [];
  const firstItem =
    items[0] && typeof items[0] === 'object'
      ? (items[0] as Record<string, unknown>)
      : null;
  const macros =
    record.macros && typeof record.macros === 'object'
      ? (record.macros as Record<string, unknown>)
      : null;

  const type = normalizeMealType(
    record.mealType ??
      record.meal_type ??
      record.type ??
      record.slot ??
      firstItem?.mealType,
  );
  if (!type) return null;

  const id =
    readString(
      record.id ??
        record.mealPlanItemId ??
        record.meal_plan_item_id ??
        record.itemId ??
        firstItem?.id,
    ) || `${type}-${readString(record.scheduledTime ?? record.displayName)}`;

  const quantity =
    readNullableNumber(
      record.quantity ?? firstItem?.quantity ?? record.servingQuantity,
    ) ?? null;

  const name =
    readString(
      record.description ??
        record.displayName ??
        record.name ??
        record.foodName ??
        firstItem?.foodName ??
        firstItem?.name,
    ) ||
    (quantity !== null &&
    readString(firstItem?.foodName ?? record.foodName)
      ? `${quantity}× ${readString(firstItem?.foodName ?? record.foodName)}`
      : type);

  return {
    id,
    mealPlanId:
      readString(record.mealPlanId ?? record.meal_plan_id) || null,
    type,
    name,
    foodId:
      readString(
        record.foodId ?? record.food_id ?? firstItem?.foodId ?? firstItem?.food_id,
      ) || null,
    imageUrl:
      readString(
        record.imageUrl ??
          record.image_url ??
          firstItem?.imageUrl ??
          firstItem?.image_url,
      ) || null,
    servingSize:
      readString(record.servingSize ?? record.serving_size ?? firstItem?.servingSize) ||
      (quantity !== null ? String(quantity) : null),
    scheduledTime:
      readString(record.scheduledTime ?? record.scheduled_time) || null,
    quantity,
    calories: readNumber(
      macros?.calories ?? record.calories ?? firstItem?.calories,
    ),
    protein: readNumber(
      macros?.protein ?? record.protein ?? firstItem?.protein,
    ),
    carbs: readNumber(macros?.carbs ?? record.carbs ?? firstItem?.carbs),
    fats: readNumber(macros?.fats ?? record.fats ?? firstItem?.fats),
    status: normalizeStatus(
      record.status ?? record.logStatus ?? firstItem?.logStatus,
    ),
    canSwap: Boolean(
      record.canSwap ?? record.can_swap ?? record.canReplace ?? true,
    ),
    canEdit: Boolean(record.canEdit ?? record.can_edit ?? true),
    dayNumber: readNullableNumber(record.dayNumber ?? record.day_number),
    day:
      normalizeDayKey(record.dayName ?? record.day_name ?? record.day) ??
      (readNullableNumber(record.dayNumber ?? record.day_number)
        ? MEAL_DAY_ORDER[
            (readNullableNumber(record.dayNumber ?? record.day_number) ?? 1) - 1
          ]
        : null),
    date: readString(record.date) || null,
  };
}

function normalizeMealList(raw: unknown): MealItem[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => normalizeMealItem(item))
    .filter((item): item is MealItem => item !== null)
    .sort(
      (a, b) =>
        MEAL_TYPE_ORDER.indexOf(a.type) - MEAL_TYPE_ORDER.indexOf(b.type),
    );
}

function normalizeDaysFromItems(items: MealItem[]): MealDayPlan[] {
  const byDay = new Map<MealDayKey, MealItem[]>();

  for (const item of items) {
    const day =
      item.day ??
      (item.dayNumber
        ? MEAL_DAY_ORDER[item.dayNumber - 1]
        : getMealDayKeyFromDate(item.date));
    if (!day) continue;
    const existing = byDay.get(day) ?? [];
    existing.push(item);
    byDay.set(day, existing);
  }

  return MEAL_DAY_ORDER.filter((day) => byDay.has(day)).map((day) => ({
    day,
    meals: byDay.get(day) ?? [],
  }));
}

function normalizeDays(raw: unknown, fallbackItems: MealItem[] = []): MealDayPlan[] {
  if (Array.isArray(raw) && raw.length > 0) {
    const asDayPlans: MealDayPlan[] = [];

    for (let index = 0; index < raw.length; index += 1) {
      const entry = raw[index];
      if (!entry || typeof entry !== 'object') continue;
      const record = entry as Record<string, unknown>;
      const day =
        normalizeDayKey(record.day ?? record.dayName ?? record.name) ??
        MEAL_DAY_ORDER[index] ??
        null;
      if (!day) continue;
      asDayPlans.push({
        day,
        date: readString(record.date) || null,
        dayNumber: readNullableNumber(record.dayNumber ?? record.day_number),
        meals: normalizeMealList(record.meals ?? record.items ?? record.slots),
      });
    }

    if (asDayPlans.some((day) => day.meals.length > 0)) {
      return asDayPlans;
    }

    const fromItems = normalizeDaysFromItems(normalizeMealList(raw));
    if (fromItems.length > 0) return fromItems;
  }

  return normalizeDaysFromItems(fallbackItems);
}

export function normalizeNutritionSummary(
  raw: unknown,
  targetsFallback?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fats?: number;
  },
): MealNutritionSummary | null {
  if (!raw || typeof raw !== 'object') {
    if (!targetsFallback) return null;
    return {
      calories: { current: 0, goal: targetsFallback.calories ?? 0 },
      protein: { current: 0, goal: targetsFallback.protein ?? 0 },
      carbs: { current: 0, goal: targetsFallback.carbs ?? 0 },
      fats: { current: 0, goal: targetsFallback.fats ?? 0 },
    };
  }

  const record = raw as Record<string, unknown>;
  const nestedTargets =
    record.targets && typeof record.targets === 'object'
      ? (record.targets as Record<string, unknown>)
      : null;
  const progress =
    record.progress && typeof record.progress === 'object'
      ? (record.progress as Record<string, unknown>)
      : record;

  const targets = readTargets({
    ...record,
    ...(nestedTargets ?? {}),
    targets: nestedTargets ?? record.targets,
  });

  const caloriesGoal = targets.calories || targetsFallback?.calories || 0;
  const proteinGoal = targets.protein || targetsFallback?.protein || 0;
  const carbsGoal = targets.carbs || targetsFallback?.carbs || 0;
  const fatsGoal = targets.fats || targetsFallback?.fats || 0;

  const mealsAssigned = readNumber(
    progress.mealsAssigned ?? record.mealsAssigned ?? record.totalMeals,
  );
  const mealsCompleted = readNumber(
    progress.mealsCompleted ?? record.mealsCompleted ?? record.completedMeals,
  );
  const mealsSkipped = readNumber(
    progress.mealsSkipped ?? record.mealsSkipped,
  );

  // Prefer explicit remaining, otherwise derive from assigned/completed/skipped.
  const explicitRemaining = readNullableNumber(
    progress.mealsRemaining ?? record.mealsRemaining,
  );
  const derivedRemaining = Math.max(0, mealsAssigned - mealsCompleted - mealsSkipped);
  const mealsRemaining =
    explicitRemaining !== null && mealsAssigned > 0
      ? Math.max(0, explicitRemaining)
      : derivedRemaining;

  const summary: MealNutritionSummary = {
    calories: normalizeMacroProgress(
      progress.calories ?? record.calories,
      caloriesGoal,
    ),
    protein: normalizeMacroProgress(
      progress.protein ?? record.protein,
      proteinGoal,
    ),
    carbs: normalizeMacroProgress(
      progress.carbs ?? progress.carbohydrates ?? record.carbs,
      carbsGoal,
    ),
    fats: normalizeMacroProgress(
      progress.fats ?? progress.fat ?? record.fats,
      fatsGoal,
    ),
    mealsCompleted,
    mealsAssigned,
    mealsRemaining,
    mealsSkipped,
  };

  // Empty/zero summaries are treated as missing so callers can fall back.
  const hasSignal =
    summary.calories.goal > 0 ||
    summary.protein.goal > 0 ||
    summary.carbs.goal > 0 ||
    summary.fats.goal > 0 ||
    (summary.mealsAssigned ?? 0) > 0 ||
    summary.calories.current > 0 ||
    summary.protein.current > 0;

  if (!hasSignal && !targetsFallback) {
    return null;
  }

  return summary;
}

/** Prefer the summary that has real targets / progress. */
export function mergeNutritionSummaries(
  primary: MealNutritionSummary | null | undefined,
  fallback: MealNutritionSummary | null | undefined,
): MealNutritionSummary | null {
  if (!primary && !fallback) return null;
  if (!primary) return fallback ?? null;
  if (!fallback) return primary;

  const pickMacro = (
    a: MealMacroProgress,
    b: MealMacroProgress,
  ): MealMacroProgress => {
    const goal = a.goal > 0 ? a.goal : b.goal;
    const current = a.current > 0 ? a.current : b.current;
    return {
      current,
      goal,
      remaining:
        a.remaining ??
        b.remaining ??
        (goal > 0 ? Math.max(0, goal - current) : undefined),
      percent: a.percent ?? b.percent,
    };
  };

  const mealsAssigned = Math.max(
    primary.mealsAssigned ?? 0,
    fallback.mealsAssigned ?? 0,
  );
  const mealsCompleted = Math.max(
    primary.mealsCompleted ?? 0,
    fallback.mealsCompleted ?? 0,
  );
  const mealsSkipped = Math.max(
    primary.mealsSkipped ?? 0,
    fallback.mealsSkipped ?? 0,
  );

  return {
    calories: pickMacro(primary.calories, fallback.calories),
    protein: pickMacro(primary.protein, fallback.protein),
    carbs: pickMacro(primary.carbs, fallback.carbs),
    fats: pickMacro(primary.fats, fallback.fats),
    mealsAssigned,
    mealsCompleted,
    mealsSkipped,
    mealsRemaining: Math.max(
      0,
      mealsAssigned > 0
        ? mealsAssigned - mealsCompleted - mealsSkipped
        : Math.max(primary.mealsRemaining ?? 0, fallback.mealsRemaining ?? 0),
    ),
  };
}

export function normalizeActiveMealPlan(raw: unknown): ActiveMealPlan | null {
  if (!raw || typeof raw !== 'object') return null;

  const record = raw as Record<string, unknown>;
  const nested =
    record.mealPlan && typeof record.mealPlan === 'object'
      ? (record.mealPlan as Record<string, unknown>)
      : record.plan && typeof record.plan === 'object'
        ? (record.plan as Record<string, unknown>)
        : record;

  const id =
    readString(
      nested.id ??
        nested.mealPlanId ??
        nested.meal_plan_id ??
        record.id ??
        record.mealPlanId,
    ) || '';

  if (!id) return null;

  const items = normalizeMealList(
    nested.items ??
      nested.meals ??
      record.items ??
      record.meals ??
      (nested.mealPlan && typeof nested.mealPlan === 'object'
        ? (nested.mealPlan as Record<string, unknown>).items
        : undefined),
  );

  return {
    id,
    dietPlanId:
      readString(
        nested.dietPlanId ??
          nested.diet_plan_id ??
          record.dietPlanId ??
          record.diet_plan_id,
      ) || null,
    status: readString(nested.status ?? record.status) || 'ACTIVE',
    planType: readString(nested.planType ?? nested.plan_type ?? record.planType) || null,
    version: readNullableNumber(nested.version ?? record.version),
    goal: readString(nested.goal ?? record.goal) || null,
    label: readString(nested.label ?? record.label) || null,
    startDate: readString(nested.startDate ?? nested.start_date) || null,
    endDate: readString(nested.endDate ?? nested.end_date) || null,
    items,
    days: normalizeDays(
      nested.days ?? nested.schedule ?? nested.weeklyPlan ?? record.days,
      items,
    ),
    createdAt: readString(nested.createdAt ?? nested.created_at) || null,
    updatedAt: readString(nested.updatedAt ?? nested.updated_at) || null,
  };
}

export function unwrapActiveMealPlan(response: unknown): ActiveMealPlan | null {
  if (isFitnessErrorEnvelope(response)) return null;
  const data = unwrapFitnessData(response);
  return normalizeActiveMealPlan(data ?? response);
}

export function normalizeTodayMeals(raw: unknown): TodayMeals | null {
  if (!raw || typeof raw !== 'object') return null;

  const record = raw as Record<string, unknown>;
  const plan =
    record.plan && typeof record.plan === 'object'
      ? (record.plan as Record<string, unknown>)
      : {};

  const date =
    readString(record.date ?? record.planDate ?? record.plan_date) ||
    formatLocalYmd(new Date());

  const meals = normalizeMealList(record.meals ?? record.items ?? record.todayMeals);
  const targets = readTargets({ ...plan, ...record });

  // Prefer full planner-shaped payload (targets + progress together).
  const nutritionFromPayload = normalizeNutritionSummary(record, targets);
  const nutritionFromProgress = normalizeNutritionSummary(
    record.nutrition ?? record.summary ?? record.progress ?? record.dailyFulfillment,
    targets,
  );
  const nutrition = mergeNutritionSummaries(
    nutritionFromPayload,
    nutritionFromProgress,
  );

  const mealsCompleted = Math.max(
    nutrition?.mealsCompleted ?? 0,
    meals.filter((meal) => meal.status === 'completed').length,
  );
  const mealsSkipped = Math.max(
    nutrition?.mealsSkipped ?? 0,
    meals.filter((meal) => meal.status === 'skipped').length,
  );
  const mealsAssigned = Math.max(
    nutrition?.mealsAssigned ?? 0,
    meals.length,
  );
  const mealsRemaining = Math.max(
    0,
    mealsAssigned - mealsCompleted - mealsSkipped,
  );

  const mealPlanId =
    readString(
      plan.mealPlanId ??
        plan.meal_plan_id ??
        record.mealPlanId ??
        record.meal_plan_id ??
        record.id,
    ) || null;

  if (!mealPlanId && meals.length === 0 && !nutrition) {
    return null;
  }

  const resolvedNutrition: MealNutritionSummary | null = nutrition
    ? {
        ...nutrition,
        calories: {
          ...nutrition.calories,
          goal: nutrition.calories.goal || targets.calories,
        },
        protein: {
          ...nutrition.protein,
          goal: nutrition.protein.goal || targets.protein,
        },
        carbs: {
          ...nutrition.carbs,
          goal: nutrition.carbs.goal || targets.carbs,
        },
        fats: {
          ...nutrition.fats,
          goal: nutrition.fats.goal || targets.fats,
        },
        mealsAssigned,
        mealsCompleted,
        mealsSkipped,
        mealsRemaining,
      }
    : targets.calories || targets.protein
      ? {
          calories: { current: 0, goal: targets.calories },
          protein: { current: 0, goal: targets.protein },
          carbs: { current: 0, goal: targets.carbs },
          fats: { current: 0, goal: targets.fats },
          mealsAssigned,
          mealsCompleted,
          mealsSkipped,
          mealsRemaining,
        }
      : {
          calories: { current: 0, goal: 0 },
          protein: { current: 0, goal: 0 },
          carbs: { current: 0, goal: 0 },
          fats: { current: 0, goal: 0 },
          mealsAssigned,
          mealsCompleted,
          mealsSkipped,
          mealsRemaining,
        };

  return {
    date,
    mealPlanId,
    dietPlanId:
      readString(
        plan.dietPlanId ??
          plan.diet_plan_id ??
          record.dietPlanId ??
          record.diet_plan_id,
      ) || null,
    goal: readString(plan.goal ?? record.goal) || null,
    version: readNullableNumber(plan.version ?? record.version),
    label: readString(plan.label ?? record.label) || null,
    meals,
    nutrition: resolvedNutrition,
    mealsRemaining,
  };
}

export function unwrapTodayMeals(response: unknown): TodayMeals | null {
  if (isFitnessErrorEnvelope(response)) return null;
  const data = unwrapFitnessData(response);
  return normalizeTodayMeals(data ?? response);
}

export function unwrapNutritionSummary(
  response: unknown,
): MealNutritionSummary | null {
  if (isFitnessErrorEnvelope(response)) return null;
  const data = unwrapFitnessData(response);
  return normalizeNutritionSummary(data ?? response);
}

function normalizeHistoryItem(raw: unknown): MealHistoryItem | null {
  if (!raw || typeof raw !== 'object') return null;
  const record = raw as Record<string, unknown>;
  const id =
    readString(record.id ?? record.mealPlanId ?? record.meal_plan_id) || '';
  if (!id) return null;

  return {
    id,
    dietPlanId:
      readString(record.dietPlanId ?? record.diet_plan_id) || null,
    status: readString(record.status) || 'ARCHIVED',
    planType: readString(record.planType ?? record.plan_type) || null,
    version: readNullableNumber(record.version),
    goal: readString(record.goal) || null,
    label: readString(record.label ?? record.name) || null,
    startDate: readString(record.startDate ?? record.start_date) || null,
    endDate: readString(record.endDate ?? record.end_date) || null,
    createdAt: readString(record.createdAt ?? record.created_at) || null,
    archivedAt: readString(record.archivedAt ?? record.archived_at) || null,
  };
}

export function unwrapMealHistory(response: unknown): MealHistoryResponse {
  if (isFitnessErrorEnvelope(response)) {
    return { items: [] };
  }

  const data = unwrapFitnessData<
    | MealHistoryItem[]
    | {
        items?: unknown[];
        data?: unknown[];
        meta?: MealHistoryMeta;
        pagination?: MealHistoryMeta;
      }
  >(response);

  if (!data) return { items: [] };

  if (Array.isArray(data)) {
    return {
      items: data
        .map((item) => normalizeHistoryItem(item))
        .filter((item): item is MealHistoryItem => item !== null),
    };
  }

  const list = Array.isArray(data.items)
    ? data.items
    : Array.isArray(data.data)
      ? data.data
      : [];

  return {
    items: list
      .map((item) => normalizeHistoryItem(item))
      .filter((item): item is MealHistoryItem => item !== null),
    meta: data.meta ?? data.pagination,
  };
}

export function formatMealGoalLabel(goal?: string | null) {
  if (!goal) return '—';
  return goal.replace(/_/g, ' ');
}

export function filterMealsByType(
  meals: MealItem[],
  type: MealType | 'all',
): MealItem[] {
  if (type === 'all') return meals;
  return meals.filter((meal) => meal.type === type);
}

/** Merge today's meals into a weekly schedule when schedule/active lack day rows. */
export function buildScheduleView(
  schedule: ActiveMealPlan | null | undefined,
  active: ActiveMealPlan | null | undefined,
  today: TodayMeals | null | undefined,
): ActiveMealPlan | null {
  const base = schedule?.days?.some((day) => day.meals.length > 0)
    ? schedule
    : active?.days?.some((day) => day.meals.length > 0)
      ? active
      : active?.items?.length
        ? {
            ...active,
            days: normalizeDays(undefined, active.items),
          }
        : schedule ?? active ?? null;

  if (!today?.meals?.length) {
    return base;
  }

  const dayKey = getMealDayKeyFromDate(today.date) ?? 'monday';
  const id =
    base?.id ??
    today.mealPlanId ??
    active?.id ??
    'today-schedule';

  const existingDays = base?.days?.length
    ? base.days
    : MEAL_DAY_ORDER.map((day) => ({ day, meals: [] as MealItem[] }));

  const days = MEAL_DAY_ORDER.map((day) => {
    const existing = existingDays.find((entry) => entry.day === day);
    if (day === dayKey) {
      return {
        day,
        date: today.date,
        meals: today.meals,
      };
    }
    return existing ?? { day, meals: [] };
  });

  return {
    id,
    dietPlanId: base?.dietPlanId ?? today.dietPlanId ?? null,
    status: base?.status ?? 'ACTIVE',
    planType: base?.planType ?? 'weekly',
    version: base?.version ?? today.version ?? null,
    goal: base?.goal ?? today.goal ?? null,
    label: base?.label ?? today.label ?? null,
    items: base?.items?.length ? base.items : today.meals,
    days,
    createdAt: base?.createdAt ?? null,
    updatedAt: base?.updatedAt ?? null,
  };
}
