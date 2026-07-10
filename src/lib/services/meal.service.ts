export const mealService = {
  active() {
    return '/meal-plans/active';
  },
  byId(mealPlanId: string) {
    return `/meal-plans/${mealPlanId}`;
  },
  today() {
    return '/meal-plans/today';
  },
  summary() {
    return '/meal-plans/nutrition-summary';
  },
  history(params?: { page?: number; limit?: number }) {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 20;
    return `/meal-plans/history?page=${page}&limit=${limit}`;
  },
  schedule(mealPlanId: string) {
    return `/meal-plans/${mealPlanId}/schedule`;
  },
  generate(body?: {
    dietPlanId?: string;
    planType?: string;
    days?: number;
  }) {
    return {
      url: '/meal-plans/generate',
      method: 'POST' as const,
      body: {
        planType: body?.planType ?? 'weekly',
        ...(body?.dietPlanId ? { dietPlanId: body.dietPlanId } : {}),
        ...(body?.days ? { days: body.days } : {}),
      },
    };
  },
  activate(mealPlanId: string) {
    return {
      url: `/meal-plans/${mealPlanId}/activate`,
      method: 'POST' as const,
    };
  },
  complete(mealItemId: string) {
    return {
      url: `/meal-plans/${mealItemId}/complete`,
      method: 'POST' as const,
    };
  },
  skip(mealItemId: string) {
    return {
      url: `/meal-plans/${mealItemId}/skip`,
      method: 'POST' as const,
    };
  },
  replace(
    mealItemId: string,
    body: { foodId: string; quantity?: number },
  ) {
    return {
      url: `/meal-plans/${mealItemId}/replace`,
      method: 'POST' as const,
      body: {
        foodId: body.foodId,
        quantity: body.quantity ?? 1,
      },
    };
  },
};
