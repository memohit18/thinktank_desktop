import { apiSlice } from './apiSlice';

export type UserProfile = {
  name: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  role: string;
};

export type UpdateProfilePayload = {
  name: string;
  phone: string | null;
};

export const profileApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProfile: builder.query<UserProfile, void>({
      query: () => '/profile',
      providesTags: ['Profile'],
    }),
    updateProfile: builder.mutation<UserProfile, UpdateProfilePayload>({
      query: (body) => ({
        url: '/profile',
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body,
      }),
      invalidatesTags: ['Profile'],
    }),
  }),
});

export const { useGetProfileQuery, useUpdateProfileMutation } = profileApi;
