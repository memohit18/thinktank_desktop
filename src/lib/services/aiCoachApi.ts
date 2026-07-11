/** Re-export for back-compat — prefer `@/lib/services/aiApi`. */
export {
  aiApi as aiCoachApi,
  useSendAiChatMutation,
  useGetAiHistoryQuery,
  useDeleteAiHistoryMutation,
  useClearAiSessionMutation,
} from '@/lib/services/aiApi';
