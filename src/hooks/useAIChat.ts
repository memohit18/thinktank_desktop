'use client';

import { useCallback, useMemo, useState } from 'react';
import { useToast } from '@/components/ui/Toast';
import type { AiChatMessage } from '@/lib/fitness/execution/types';
import { getApiErrorMessage } from '@/lib/services/getApiErrorMessage';
import { useSendAiChatMutation } from '@/lib/services/aiCoachApi';

export function useAIChat() {
  const { showToast } = useToast();
  const [sendChat, sendState] = useSendAiChatMutation();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<AiChatMessage[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const ask = useCallback(
    async (message: string) => {
      const trimmed = message.trim();
      if (!trimmed) return null;

      const userMessage: AiChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: trimmed,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMessage]);

      try {
        const result = await sendChat({
          message: trimmed,
          sessionId: sessionId ?? undefined,
        }).unwrap();

        if (!result) {
          showToast('No response from AI coach.', 'error');
          return null;
        }

        if (result.sessionId) setSessionId(result.sessionId);

        const assistantMessage: AiChatMessage = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: result.reply || result.answer || result.message || '',
          createdAt: result.createdAt || new Date().toISOString(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
        return result;
      } catch (error) {
        showToast(
          getApiErrorMessage(error, 'AI coach is unavailable right now.'),
          'error',
        );
        return null;
      }
    },
    [sendChat, sessionId, showToast],
  );

  const clear = useCallback(() => {
    setMessages([]);
    setSessionId(null);
  }, []);

  return useMemo(
    () => ({
      messages,
      sessionId,
      isOpen,
      setIsOpen,
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
      ask,
      clear,
      isSending: sendState.isLoading,
    }),
    [ask, clear, isOpen, messages, sendState.isLoading, sessionId],
  );
}
