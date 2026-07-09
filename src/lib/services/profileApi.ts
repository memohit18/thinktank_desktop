import { apiSlice } from './apiSlice';
import { RTK_QUERY_STABLE_CACHE, invalidateTagsOnSuccess, withQueryDefaults } from './rtkQueryDefaults';

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
      keepUnusedDataFor: RTK_QUERY_STABLE_CACHE.keepUnusedDataFor,
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
      invalidatesTags: invalidateTagsOnSuccess(['Profile']),
    }),
  }),
});

export const { useUpdateProfileMutation } = profileApi;

export const useGetProfileQuery = withQueryDefaults(
  profileApi.useGetProfileQuery,
  RTK_QUERY_STABLE_CACHE,
);
