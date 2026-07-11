'use client';

import { useCallback, useMemo, useState } from 'react';
import { useToast } from '@/components/ui/Toast';
import type { AiChatMessage } from '@/lib/fitness/coach/types';
import { useConversation } from '@/hooks/useConversation';
import { useSendAiChatMutation } from '@/lib/services/aiApi';
import { getApiErrorMessage } from '@/lib/services/getApiErrorMessage';

export function useAIChat() {
  const { showToast } = useToast();
  const conversation = useConversation();
  const [sendChat, sendState] = useSendAiChatMutation();
  const [isOpen, setIsOpen] = useState(false);

  const ask = useCallback(
    async (message: string) => {
      const trimmed = message.trim();
      if (!trimmed || sendState.isLoading) return null;

      const userMessage: AiChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: trimmed,
        createdAt: new Date().toISOString(),
        sessionId: conversation.sessionId,
      };
      conversation.appendMessage(userMessage);

      const assistantId = `ai-${Date.now()}`;
      conversation.appendMessage({
        id: assistantId,
        role: 'assistant',
        content: '',
        createdAt: new Date().toISOString(),
        pending: true,
        sessionId: conversation.sessionId,
      });

      try {
        // POST /ai/chat — backend builds coach-v3 context server-side.
        const result = await sendChat({
          message: trimmed,
          sessionId: conversation.sessionId ?? undefined,
        }).unwrap();

        if (!result?.answer && !result?.reply) {
          throw new Error('No response from AI coach.');
        }

        const answer = result.answer || result.reply;
        if (result.sessionId) conversation.setSessionId(result.sessionId);

        conversation.updateMessage(assistantId, {
          content: answer,
          pending: false,
          createdAt: result.createdAt || new Date().toISOString(),
          sessionId: result.sessionId,
          contextVersion: result.contextVersion,
          validationWarnings: result.validation?.warnings ?? [],
        });

        if (result.validation && !result.validation.valid) {
          showToast(
            result.validation.warnings[0] ||
              'Coach reply was flagged by the validator.',
            'error',
          );
        } else if (result.validation?.warnings?.length) {
          showToast(result.validation.warnings[0]);
        }

        void conversation.refetchHistory();
        return result;
      } catch (error) {
        conversation.updateMessage(assistantId, {
          pending: false,
          error: true,
          content: getApiErrorMessage(
            error,
            'AI coach is unavailable right now.',
          ),
        });
        showToast(
          getApiErrorMessage(error, 'AI coach is unavailable right now.'),
          'error',
        );
        return null;
      }
    },
    [conversation, sendChat, sendState.isLoading, showToast],
  );

  const clear = useCallback(async () => {
    await conversation.clear();
    showToast('Conversation cleared.');
  }, [conversation, showToast]);

  return useMemo(
    () => ({
      messages: conversation.messages,
      sessionId: conversation.sessionId,
      history: conversation.history,
      historyMeta: conversation.historyMeta,
      isHistoryLoading: conversation.isHistoryLoading,
      isOpen,
      setIsOpen,
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
      ask,
      clear,
      removeHistoryTurn: conversation.removeHistoryTurn,
      isSending: sendState.isLoading,
      isStreaming: false,
      isTyping: sendState.isLoading,
    }),
    [
      ask,
      clear,
      conversation.history,
      conversation.historyMeta,
      conversation.isHistoryLoading,
      conversation.messages,
      conversation.removeHistoryTurn,
      conversation.sessionId,
      isOpen,
      sendState.isLoading,
    ],
  );
}
