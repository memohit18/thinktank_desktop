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
  imageUrl?: string | null;
};

type ProfileApiRecord = {
  name?: unknown;
  email?: unknown;
  phone?: unknown;
  role?: unknown;
  avatar?: unknown;
  imageUrl?: unknown;
  image_url?: unknown;
};

function asRecord(value: unknown): ProfileApiRecord | null {
  return value && typeof value === 'object'
    ? (value as ProfileApiRecord)
    : null;
}

function readString(value: unknown) {
  return typeof value === 'string' ? value : null;
}

function unwrapEnvelopeData(response: unknown) {
  const record = asRecord(response);
  if (!record) return response;

  if ('data' in record && record.data != null) {
    return (record as { data: unknown }).data;
  }

  return response;
}

export function normalizeUserProfile(response: unknown): UserProfile {
  const data = asRecord(unwrapEnvelopeData(response)) ?? {};

  return {
    name: readString(data.name) ?? '',
    email: readString(data.email) ?? '',
    phone: readString(data.phone),
    avatar:
      readString(data.imageUrl) ??
      readString(data.image_url) ??
      readString(data.avatar),
    role: readString(data.role) ?? 'user',
  };
}

export const profileApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProfile: builder.query<UserProfile, void>({
      query: () => '/profile',
      transformResponse: (response: unknown) => normalizeUserProfile(response),
      providesTags: ['Profile'],
      keepUnusedDataFor: RTK_QUERY_STABLE_CACHE.keepUnusedDataFor,
    }),
    updateProfile: builder.mutation<UserProfile, UpdateProfilePayload>({
      query: (body) => ({
        url: '/profile',
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body,
      }),
      transformResponse: (response: unknown) => normalizeUserProfile(response),
      invalidatesTags: invalidateTagsOnSuccess(['Profile']),
    }),
  }),
});

export const { useUpdateProfileMutation } = profileApi;

export const useGetProfileQuery = withQueryDefaults(
  profileApi.useGetProfileQuery,
  RTK_QUERY_STABLE_CACHE,
);
