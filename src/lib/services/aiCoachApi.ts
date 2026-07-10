import { unwrapAiChat } from '@/lib/fitness/execution/executionResponse';
import type { AiChatResponse } from '@/lib/fitness/execution/types';
import { aiCoachService } from '@/lib/services/aiCoach.service';
import { apiSlice } from './apiSlice';

export const aiCoachApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    sendAiChat: builder.mutation<
      AiChatResponse | null,
      { message: string; sessionId?: string }
    >({
      query: (body) => aiCoachService.chat(body),
      transformResponse: (response: unknown) => unwrapAiChat(response),
    }),
  }),
  overrideExisting: true,
});

export const { useSendAiChatMutation } = aiCoachApi;
