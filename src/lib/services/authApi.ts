import { apiSlice } from './apiSlice';
import type { LoginRequest, LoginResponse } from '@/lib/auth/types';

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: credentials,
      }),
      invalidatesTags: ['Auth'],
    }),
  }),
});

export const { useLoginMutation } = authApi;
