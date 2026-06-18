import type {
  UserProgressFiltersResponse,
  UserProgressParams,
  UserProgressResponse,
} from '@/lib/code/userProgressTypes';
import { apiSlice } from './apiSlice';

export function buildUserProgressQueryString(params: UserProgressParams = {}) {
  const searchParams = new URLSearchParams();
  searchParams.set('page', String(params.page ?? 1));
  searchParams.set('limit', String(params.limit ?? 20));
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
        return `/user-progress?${query}`;
      },
      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        const query = buildUserProgressQueryString(queryArgs ?? {});
        return `${endpointName}?${query}`;
      },
      providesTags: ['UserProgress'],
    }),
  }),
});

export const {
  useGetUserProgressFiltersQuery,
  useGetUserProgressQuery,
} = userProgressApi;
