import { apiSlice } from './apiSlice';

export const userApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<unknown[], void>({
      query: () => '/users',
    }),
  }),
});

export const { useGetUsersQuery } = userApi;
