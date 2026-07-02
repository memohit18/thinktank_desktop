import type {
  DailyActivityParams,
  DailyActivityResponse,
  UserProgressFiltersResponse,
  UserProgressParams,
  UserProgressResponse,
} from '@/lib/code/userProgressTypes';
import { apiSlice } from './apiSlice';

export function buildUserProgressQueryString(params: UserProgressParams = {}) {
  const searchParams = new URLSearchParams();
  if (params.status && params.status !== 'all') {
    searchParams.set('status', params.status);
  }
  return searchParams.toString();
}

export const userProgressApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUserProgressFilters: builder.query<UserProgressFiltersResponse, void>({
      query: () => '/user-progress/filters',
      providesTags: ['UserProgress'],
    }),
    getUserProgress: builder.query<UserProgressResponse, UserProgressParams>({
      query: (params) => {
        const query = buildUserProgressQueryString(params);
        return query ? `/user-progress?${query}` : '/user-progress';
      },
      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        const query = buildUserProgressQueryString(queryArgs ?? {});
        return `${endpointName}?${query}`;
      },
      providesTags: ['UserProgress'],
    }),
    getDailyActivity: builder.query<DailyActivityResponse, DailyActivityParams>({
      query: ({ month }) => `/user-progress/daily-activity?month=${month}`,
      providesTags: ['UserProgress'],
    }),
  }),
});

export const {
  useGetUserProgressFiltersQuery,
  useGetUserProgressQuery,
  useGetDailyActivityQuery,
} = userProgressApi;
