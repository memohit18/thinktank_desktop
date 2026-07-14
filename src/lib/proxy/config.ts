export const AUTH_API_URL =
  process.env.AUTH_API_URL ?? 'https://auth.algoarena.co.in';

export const SERVICE_API_URL =
  process.env.SERVICE_API_URL ??
  process.env.SERVER_API_URL ??
  'https://service.algoarena.co.in';

export type ProxyRoute = {
  prefix: string;
  targetBaseUrl: string;
  stripPrefix: string;
};

export const proxyRoutes: ProxyRoute[] = [
  {
    prefix: '/api/auth',
    targetBaseUrl: AUTH_API_URL,
    stripPrefix: '/api',
  },
  {
    prefix: '/api/questions',
    targetBaseUrl: SERVICE_API_URL,
    stripPrefix: '/api',
  },
  {
    prefix: '/api/profile',
    targetBaseUrl: SERVICE_API_URL,
    stripPrefix: '/api',
  },
  {
    prefix: '/api/user-progress',
    targetBaseUrl: SERVICE_API_URL,
    stripPrefix: '/api',
  },
  {
    prefix: '/api/roadmaps',
    targetBaseUrl: SERVICE_API_URL,
    stripPrefix: '/api',
  },
  {
    prefix: '/api/fitness',
    targetBaseUrl: SERVICE_API_URL,
    stripPrefix: '/api',
  },
  {
    prefix: '/api/transformation',
    targetBaseUrl: SERVICE_API_URL,
    stripPrefix: '/api',
  },
  {
    prefix: '/api/foods',
    targetBaseUrl: SERVICE_API_URL,
    stripPrefix: '/api',
  },
  {
    prefix: '/api/food-preferences',
    targetBaseUrl: SERVICE_API_URL,
    stripPrefix: '/api',
  },
  {
    prefix: '/api/nutrition-preferences',
    targetBaseUrl: SERVICE_API_URL,
    stripPrefix: '/api',
  },
  {
    prefix: '/api/diet',
    targetBaseUrl: SERVICE_API_URL,
    stripPrefix: '/api',
  },
  {
    prefix: '/api/meal-plans',
    targetBaseUrl: SERVICE_API_URL,
    stripPrefix: '/api',
  },
  {
    prefix: '/api/progress',
    targetBaseUrl: SERVICE_API_URL,
    stripPrefix: '/api',
  },
  {
    prefix: '/api/dashboard',
    targetBaseUrl: SERVICE_API_URL,
    stripPrefix: '/api',
  },
  {
    prefix: '/api/checkins',
    targetBaseUrl: SERVICE_API_URL,
    stripPrefix: '/api',
  },
  {
    prefix: '/api/meals',
    targetBaseUrl: SERVICE_API_URL,
    stripPrefix: '/api',
  },
  {
    prefix: '/api/workouts',
    targetBaseUrl: SERVICE_API_URL,
    stripPrefix: '/api',
  },
  {
    prefix: '/api/hydration',
    targetBaseUrl: SERVICE_API_URL,
    stripPrefix: '/api',
  },
  {
    prefix: '/api/ai',
    targetBaseUrl: SERVICE_API_URL,
    stripPrefix: '/api',
  },
  {
    prefix: '/api/uploads',
    targetBaseUrl: SERVICE_API_URL,
    stripPrefix: '/api',
  },
  {
    prefix: '/api/images',
    targetBaseUrl: SERVICE_API_URL,
    stripPrefix: '/api',
  },
];

export function resolveProxyTarget(pathname: string, search: string) {
  for (const route of proxyRoutes) {
    if (!pathname.startsWith(route.prefix)) continue;

    const apiPath = pathname.replace(route.stripPrefix, '');
    return new URL(`${apiPath}${search}`, route.targetBaseUrl);
  }

  return null;
}
