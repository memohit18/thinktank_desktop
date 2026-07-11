import {
  historyItemsToMessages,
  unwrapAiChat,
  unwrapAiHistory,
} from '@/lib/fitness/coach/aiResponse';
import type {
  AiChatResponse,
  AiHistoryResponse,
} from '@/lib/fitness/coach/types';
import {
  isFitnessErrorEnvelope,
  isMissingFitnessProfileStatus,
} from '@/lib/fitness/fitnessResponse';
import { aiService } from '@/lib/services/ai.service';
import { apiSlice } from './apiSlice';
import {
  RTK_QUERY_FRESH_CACHE,
  invalidateTagsOnSuccess,
  withQueryDefaults,
} from './rtkQueryDefaults';

export type AiHistoryParams = {
  page?: number;
  limit?: number;
};

export const aiApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    /** POST /ai/chat */
    sendAiChat: builder.mutation<
      AiChatResponse | null,
      { message: string; sessionId?: string }
    >({
      query: (body) => aiService.chat(body),
      transformResponse: (response: unknown) => unwrapAiChat(response),
      invalidatesTags: invalidateTagsOnSuccess(['AiChat']),
    }),

    /** GET /ai/history?page&limit */
    getAiHistory: builder.query<AiHistoryResponse, AiHistoryParams | void>({
      async queryFn(params, _queryApi, _extraOptions, baseQuery) {
        const result = await baseQuery(
          aiService.history({
            page: params?.page ?? 1,
            limit: params?.limit ?? 20,
          }),
        );
        if (result.error) {
          if (
            isMissingFitnessProfileStatus(result.error.status) ||
            result.error.status === 404
          ) {
            return { data: { items: [] } };
          }
          return { error: result.error };
        }
        if (isFitnessErrorEnvelope(result.data)) {
          return { data: { items: [] } };
        }
        return { data: unwrapAiHistory(result.data) };
      },
      providesTags: ['AiChat'],
      keepUnusedDataFor: RTK_QUERY_FRESH_CACHE.keepUnusedDataFor,
    }),

    /** DELETE /ai/history/:id — turn id or session id */
    deleteAiHistory: builder.mutation<{ ok: boolean }, string>({
      query: (id) => aiService.deleteHistory(id),
      invalidatesTags: invalidateTagsOnSuccess(['AiChat']),
    }),
  }),
  overrideExisting: true,
});

export const useGetAiHistoryQuery = withQueryDefaults(
  aiApi.useGetAiHistoryQuery,
  RTK_QUERY_FRESH_CACHE,
);

export const { useSendAiChatMutation, useDeleteAiHistoryMutation } = aiApi;

export { historyItemsToMessages };

/** Back-compat */
export const aiCoachApi = aiApi;
export const useClearAiSessionMutation = useDeleteAiHistoryMutation;
