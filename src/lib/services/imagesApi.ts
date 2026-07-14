import {
  unwrapUploadedUserImage,
  unwrapUserImages,
} from '@/lib/images/imageResponse';
import type {
  UserImage,
  UserImagesParams,
  UserImagesResponse,
} from '@/lib/images/types';
import {
  isFitnessErrorEnvelope,
  isMissingFitnessProfileStatus,
} from '@/lib/fitness/fitnessResponse';
import {
  imagesService,
  type DeleteImageByPathPayload,
  type UploadImagePayload,
} from '@/lib/services/images.service';
import { apiSlice } from './apiSlice';
import {
  RTK_QUERY_FRESH_CACHE,
  invalidateTagsOnSuccess,
  withQueryDefaults,
} from './rtkQueryDefaults';

export const imagesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUserImages: builder.query<UserImagesResponse, UserImagesParams | void>({
      async queryFn(params, _queryApi, _extraOptions, baseQuery) {
        const result = await baseQuery(
          imagesService.list({
            page: params?.page ?? 1,
            limit: params?.limit ?? 20,
            type: params?.type,
          }),
        );
        if (result.error) {
          if (
            isMissingFitnessProfileStatus(result.error.status) ||
            result.error.status === 404
          ) {
            return {
              data: {
                items: [],
                meta: { page: 1, limit: 20, total: 0, totalPages: 0 },
              },
            };
          }
          return { error: result.error };
        }
        if (isFitnessErrorEnvelope(result.data)) {
          return {
            data: {
              items: [],
              meta: { page: 1, limit: 20, total: 0, totalPages: 0 },
            },
          };
        }
        return { data: unwrapUserImages(result.data) };
      },
      providesTags: ['Images'],
      keepUnusedDataFor: RTK_QUERY_FRESH_CACHE.keepUnusedDataFor,
    }),

    uploadUserImage: builder.mutation<UserImage | null, UploadImagePayload>({
      query: (payload) => imagesService.upload(payload),
      transformResponse: (response: unknown) =>
        unwrapUploadedUserImage(response),
      invalidatesTags: invalidateTagsOnSuccess(['Images']),
    }),

    deleteUserImageByPath: builder.mutation<
      { success: boolean },
      DeleteImageByPathPayload
    >({
      query: (payload) => imagesService.deleteByPath(payload),
      transformResponse: () => ({ success: true }),
      invalidatesTags: invalidateTagsOnSuccess(['Images']),
    }),
  }),
  overrideExisting: true,
});

export const useGetUserImagesQuery = withQueryDefaults(
  imagesApi.useGetUserImagesQuery,
  RTK_QUERY_FRESH_CACHE,
);

export const {
  useUploadUserImageMutation,
  useDeleteUserImageByPathMutation,
} = imagesApi;
