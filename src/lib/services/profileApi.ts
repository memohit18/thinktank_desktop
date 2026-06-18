import { apiSlice } from './apiSlice';

export type UserProfile = {
  name: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  role: string;
};

export const profileApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProfile: builder.query<UserProfile, void>({
      query: () => '/profile',
      providesTags: ['Profile'],
    }),
  }),
});

export const { useGetProfileQuery } = profileApi;
