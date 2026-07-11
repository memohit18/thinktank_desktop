/**
 * Daily dashboard API (`BASE=/api`).
 * Prefer GET /dashboard for the main screen.
 */
export const dashboardService = {
  /** Full daily dashboard */
  root() {
    return '/dashboard';
  },
  /** Score card only */
  today() {
    return '/dashboard/today';
  },
  compliance() {
    return '/dashboard/compliance';
  },
  streak() {
    return '/dashboard/streak';
  },
  summary() {
    return '/dashboard/summary';
  },
};
