'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { historyItemsToMessages } from '@/lib/fitness/coach/aiResponse';
import { AI_CONVERSATION_STORAGE_KEY } from '@/lib/fitness/coach/constants';
import type {
  AiChatMessage,
  AiConversationSnapshot,
  AiHistoryItem,
} from '@/lib/fitness/coach/types';
import {
  useDeleteAiHistoryMutation,
  useGetAiHistoryQuery,
} from '@/lib/services/aiApi';

function loadSnapshot(): AiConversationSnapshot | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(AI_CONVERSATION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AiConversationSnapshot;
    if (!parsed || !Array.isArray(parsed.messages)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function saveSnapshot(snapshot: AiConversationSnapshot) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(
      AI_CONVERSATION_STORAGE_KEY,
      JSON.stringify(snapshot),
    );
  } catch {
    // ignore quota
  }
}

export function useConversation() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<AiChatMessage[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [serverHydrated, setServerHydrated] = useState(false);

  const historyQuery = useGetAiHistoryQuery({ page: 1, limit: 20 });
  const [deleteHistory] = useDeleteAiHistoryMutation();

  useEffect(() => {
    const snapshot = loadSnapshot();
    if (snapshot?.messages?.length) {
      setSessionId(snapshot.sessionId);
      setMessages(snapshot.messages.filter((item) => !item.pending));
    }
    setHydrated(true);
  }, []);

  // Prefer server history when local thread is empty.
  useEffect(() => {
    if (!hydrated || serverHydrated) return;
    const items = historyQuery.data?.items ?? [];
    if (historyQuery.isLoading || historyQuery.isFetching) return;

    if (messages.length === 0 && items.length > 0) {
      const fromServer = historyItemsToMessages(items);
      setMessages(fromServer);
      const latestSession =
        [...items].sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
        )[0]?.sessionId ?? null;
      if (latestSession) setSessionId(latestSession);
    }
    setServerHydrated(true);
  }, [
    hydrated,
    historyQuery.data?.items,
    historyQuery.isFetching,
    historyQuery.isLoading,
    messages.length,
    serverHydrated,
  ]);

  useEffect(() => {
    if (!hydrated) return;
    saveSnapshot({
      sessionId,
      messages: messages.filter((item) => !item.pending),
      updatedAt: new Date().toISOString(),
    });
  }, [hydrated, messages, sessionId]);

  const appendMessage = useCallback((message: AiChatMessage) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  const updateMessage = useCallback(
    (id: string, patch: Partial<AiChatMessage>) => {
      setMessages((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...patch } : item)),
      );
    },
    [],
  );

  const removeHistoryTurn = useCallback(
    async (historyId: string) => {
      try {
        await deleteHistory(historyId).unwrap();
      } catch {
        // still remove locally
      }
      setMessages((prev) =>
        prev.filter(
          (item) =>
            item.historyId !== historyId &&
            item.id !== historyId &&
            item.id !== `${historyId}-q`,
        ),
      );
      return true;
    },
    [deleteHistory],
  );

  const clear = useCallback(async () => {
    const currentSession = sessionId;
    const turnIds = Array.from(
      new Set(
        messages
          .map((item) => item.historyId)
          .filter((id): id is string => Boolean(id)),
      ),
    );

    setMessages([]);
    setSessionId(null);
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(AI_CONVERSATION_STORAGE_KEY);
    }

    // Docs: DELETE accepts turn id or session id — prefer session wipe.
    if (currentSession) {
      try {
        await deleteHistory(currentSession).unwrap();
        void historyQuery.refetch();
        return;
      } catch {
        // fall through to per-turn deletes
      }
    }

    await Promise.allSettled(
      turnIds.map((id) => deleteHistory(id).unwrap()),
    );
    void historyQuery.refetch();
  }, [deleteHistory, historyQuery, messages, sessionId]);

  const historyItems: AiHistoryItem[] = historyQuery.data?.items ?? [];

  return useMemo(
    () => ({
      sessionId,
      setSessionId,
      messages,
      setMessages,
      appendMessage,
      updateMessage,
      removeHistoryTurn,
      clear,
      hydrated,
      history: historyItems,
      historyMeta: historyQuery.data?.meta,
      isHistoryLoading: historyQuery.isLoading,
      refetchHistory: historyQuery.refetch,
    }),
    [
      appendMessage,
      clear,
      historyItems,
      historyQuery.data?.meta,
      historyQuery.isLoading,
      historyQuery.refetch,
      hydrated,
      messages,
      removeHistoryTurn,
      sessionId,
      updateMessage,
    ],
  );
}
