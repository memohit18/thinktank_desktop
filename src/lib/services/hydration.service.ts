export const hydrationService = {
  today() {
    return '/hydration/today';
  },
  log(amountMl: number) {
    return {
      url: '/hydration',
      method: 'POST' as const,
      body: { amountMl },
    };
  },
};
