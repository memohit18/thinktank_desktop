import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';
import { getAccessToken } from '@/lib/auth/cookies';

const rawBaseQuery = fetchBaseQuery({
  baseUrl: '/api',
  prepareHeaders: (headers) => {
    const accessToken = getAccessToken();

    if (accessToken) {
      headers.set('Authorization', `Bearer ${accessToken}`);
    }

    return headers;
  },
});

const baseQuery: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  return rawBaseQuery(args, api, extraOptions);
};

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery,
  tagTypes: ['Auth', 'CodeSession', 'QuestionFilters', 'Problems', 'Profile', 'Submissions', 'UserProgress'],
  endpoints: () => ({}),
});
