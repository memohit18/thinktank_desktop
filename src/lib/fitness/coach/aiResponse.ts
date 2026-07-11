import {
  unwrapFitnessData,
  isFitnessErrorEnvelope,
} from '@/lib/fitness/fitnessResponse';
import type {
  AiChatMessage,
  AiChatResponse,
  AiChatValidation,
  AiHistoryItem,
  AiHistoryResponse,
} from '@/lib/fitness/coach/types';

function readString(value: unknown, fallback = '') {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function readNumber(value: unknown, fallback = 0) {
  if (value === null || value === undefined || value === '') return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function unwrapValidation(raw: unknown): AiChatValidation | null {
  if (!raw || typeof raw !== 'object') return null;
  const record = raw as Record<string, unknown>;
  const warnings = Array.isArray(record.warnings)
    ? record.warnings.filter((item): item is string => typeof item === 'string')
    : [];
  return {
    valid: Boolean(record.valid ?? true),
    warnings,
  };
}

/** POST /ai/chat → data.{ sessionId, question, answer, contextVersion, timestamp, validation } */
export function unwrapAiChat(response: unknown): AiChatResponse | null {
  if (isFitnessErrorEnvelope(response)) return null;
  const data = unwrapFitnessData(response);
  if (!data || typeof data !== 'object') return null;
  const record = data as Record<string, unknown>;

  const answer =
    readString(
      record.answer ??
        record.reply ??
        record.message ??
        record.response ??
        record.content,
    ) || '';
  const question = readString(record.question ?? record.message);
  const sessionId = readString(
    record.sessionId ?? record.conversationId ?? record.id,
  );

  if (!answer && !sessionId) return null;

  return {
    sessionId: sessionId || `session-${Date.now()}`,
    question,
    answer,
    reply: answer,
    contextVersion: readString(record.contextVersion) || null,
    createdAt: readString(record.timestamp ?? record.createdAt) || null,
    validation: unwrapValidation(record.validation),
  };
}

/** GET /ai/history → data.{ items[], meta } */
export function unwrapAiHistory(response: unknown): AiHistoryResponse {
  if (isFitnessErrorEnvelope(response)) return { items: [] };
  const data = unwrapFitnessData(response);

  if (Array.isArray(data)) {
    return {
      items: data
        .map((item, index) => normalizeHistoryItem(item, index))
        .filter((item): item is AiHistoryItem => item != null),
    };
  }

  if (!data || typeof data !== 'object') return { items: [] };
  const record = data as Record<string, unknown>;
  const list = Array.isArray(record.items) ? record.items : [];
  const metaRaw =
    record.meta && typeof record.meta === 'object'
      ? (record.meta as Record<string, unknown>)
      : null;

  return {
    items: list
      .map((item, index) => normalizeHistoryItem(item, index))
      .filter((item): item is AiHistoryItem => item != null),
    meta: metaRaw
      ? {
          page: readNumber(metaRaw.page, 1),
          limit: readNumber(metaRaw.limit, 20),
          total: readNumber(metaRaw.total),
          totalPages: readNumber(metaRaw.totalPages, 1),
        }
      : undefined,
  };
}

function normalizeHistoryItem(
  raw: unknown,
  index: number,
): AiHistoryItem | null {
  if (!raw || typeof raw !== 'object') return null;
  const record = raw as Record<string, unknown>;
  const id = readString(record.id) || `history-${index}`;
  const question = readString(record.question);
  const answer = readString(record.answer ?? record.reply);
  if (!question && !answer) return null;

  return {
    id,
    sessionId: readString(record.sessionId) || id,
    question,
    answer,
    timestamp:
      readString(record.timestamp ?? record.createdAt ?? record.updatedAt) ||
      new Date().toISOString(),
    contextVersion: readString(record.contextVersion) || null,
  };
}

/** Expand history turns into chat bubbles (oldest → newest). */
export function historyItemsToMessages(
  items: AiHistoryItem[],
): AiChatMessage[] {
  const sorted = [...items].sort(
    (a, b) =>
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  );

  const messages: AiChatMessage[] = [];
  for (const item of sorted) {
    if (item.question) {
      messages.push({
        id: `${item.id}-q`,
        role: 'user',
        content: item.question,
        createdAt: item.timestamp,
        sessionId: item.sessionId,
        historyId: item.id,
      });
    }
    if (item.answer) {
      messages.push({
        id: item.id,
        role: 'assistant',
        content: item.answer,
        createdAt: item.timestamp,
        sessionId: item.sessionId,
        historyId: item.id,
        contextVersion: item.contextVersion,
      });
    }
  }
  return messages;
}
