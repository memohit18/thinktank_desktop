export const dietService = {
  getActive() {
    return '/diet/active';
  },
  getPlanner(date?: string) {
    return date ? `/diet/planner?date=${encodeURIComponent(date)}` : '/diet/planner';
  },
  generate() {
    return {
      url: '/diet/generate',
      method: 'POST' as const,
    };
  },
  regenerate() {
    return {
      url: '/diet/regenerate',
      method: 'POST' as const,
    };
  },
  generateTargets() {
    return {
      url: '/diet/generate-targets',
      method: 'POST' as const,
    };
  },
  fromTargets(body: {
    goal: string;
    dailyCalories: number;
    protein: number;
    carbs: number;
    fats: number;
  }) {
    return {
      url: '/diet/from-targets',
      method: 'POST' as const,
      body,
    };
  },
  create(body: {
    goal: string;
    caloriesTarget: number;
    proteinTarget: number;
    carbsTarget: number;
    fatsTarget: number;
  }) {
    return {
      url: '/diet',
      method: 'POST' as const,
      body,
    };
  },
  history(params?: { page?: number; limit?: number }) {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 20;
    return `/diet/history?page=${page}&limit=${limit}`;
  },
  activate(dietPlanId: string) {
    return {
      url: `/diet/${dietPlanId}/activate`,
      method: 'POST' as const,
    };
  },
  delete(dietPlanId: string) {
    return {
      url: `/diet/${dietPlanId}`,
      method: 'DELETE' as const,
    };
  },
  updateHydration(body: { amountMl: number }) {
    return {
      url: '/diet/planner/hydration',
      method: 'PATCH' as const,
      body,
    };
  },
};

export const mealPlansService = {
  generateAi(body: {
    dietPlanId: string;
    planType?: string;
    days?: number;
  }) {
    return {
      url: '/meal-plans/generate-ai',
      method: 'POST' as const,
      body,
    };
  },
  generate(body: {
    dietPlanId: string;
    planType?: string;
    days?: number;
  }) {
    return {
      url: '/meal-plans/generate',
      method: 'POST' as const,
      body,
    };
  },
  getActive() {
    return '/meal-plans/active';
  },
  history(params?: { page?: number; limit?: number }) {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 20;
    return `/meal-plans/history?page=${page}&limit=${limit}`;
  },
  activate(mealPlanId: string) {
    return {
      url: `/meal-plans/${mealPlanId}/activate`,
      method: 'POST' as const,
    };
  },
  schedule(mealPlanId: string) {
    return `/meal-plans/${mealPlanId}/schedule`;
  },
};
