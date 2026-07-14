import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';
import {
  getValidAccessToken,
  refreshAccessToken,
  shouldAttemptTokenRefresh,
} from '@/lib/auth/refreshToken';
import { RTK_QUERY_DEFAULTS } from '@/lib/services/rtkQueryDefaults';

function isPublicAuthRequest(endpoint: string) {
  return endpoint === 'login' || endpoint === 'signup';
}

const rawBaseQuery = fetchBaseQuery({
  baseUrl: '/api',
  prepareHeaders: async (headers, { endpoint }) => {
    if (isPublicAuthRequest(endpoint)) {
      return headers;
    }

    const accessToken = await getValidAccessToken();

    if (accessToken) {
      headers.set('Authorization', `Bearer ${accessToken}`);
    }

    return headers;
  },
  fetchFn: async (input, init) =>
    fetch(input, {
      ...init,
      cache: 'no-store',
    }),
});

function getRequestUrl(args: string | FetchArgs) {
  return typeof args === 'string' ? args : args.url;
}

function getRequestMethod(args: string | FetchArgs) {
  return typeof args === 'string' ? 'GET' : args.method ?? 'GET';
}

const baseQuery: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const requestUrl = getRequestUrl(args);
  const requestMethod = getRequestMethod(args);

  if (process.env.NODE_ENV === 'development') {
    console.info(`[API] ${requestMethod} /api${requestUrl}`);
  }

  let result = await rawBaseQuery(args, api, extraOptions);

  if (
    result.error &&
    shouldAttemptTokenRefresh(result.error.status, requestUrl)
  ) {
    const newAccessToken = await refreshAccessToken();

    if (newAccessToken) {
      result = await rawBaseQuery(args, api, extraOptions);
    }
  }

  return result;
};

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery,
  ...RTK_QUERY_DEFAULTS,
  keepUnusedDataFor: 300,
  tagTypes: ['Auth', 'CodeSession', 'QuestionFilters', 'Problems', 'Profile', 'Submissions', 'UserProgress', 'Roadmaps', 'FitnessProfile', 'FitnessGoals', 'Transformation', 'Foods', 'FoodCategories', 'FoodPreferences', 'NutritionPreferences', 'Diet', 'MealPlan', 'Progress', 'Checkin', 'Hydration', 'Workout', 'AiChat', 'Dashboard', 'Images'],
  endpoints: () => ({}),
});
