export const dailyService = {
  today() {
    return '/checkins/today';
  },
  refresh() {
    return {
      url: '/checkins/refresh',
      method: 'POST' as const,
    };
  },
};
