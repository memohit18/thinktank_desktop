export const mealExecutionService = {
  complete(
    mealId: string,
    body?: { consumedQuantity?: number; notes?: string },
  ) {
    return {
      url: `/meals/${mealId}/complete`,
      method: 'POST' as const,
      body: {
        ...(body?.consumedQuantity != null
          ? { consumedQuantity: body.consumedQuantity }
          : { consumedQuantity: 1 }),
        ...(body?.notes?.trim() ? { notes: body.notes.trim() } : {}),
      },
    };
  },
  partial(mealId: string, consumedQuantity: number) {
    return {
      url: `/meals/${mealId}/partial`,
      method: 'POST' as const,
      body: { consumedQuantity },
    };
  },
  skip(mealId: string) {
    return {
      url: `/meals/${mealId}/skip`,
      method: 'POST' as const,
    };
  },
  replace(mealId: string, foodId: string) {
    return {
      url: `/meals/${mealId}/replace`,
      method: 'POST' as const,
      body: { foodId },
    };
  },
};
