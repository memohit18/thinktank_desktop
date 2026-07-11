export type AiChatRole = 'user' | 'assistant' | 'system';

export type AiChatValidation = {
  valid: boolean;
  warnings: string[];
};

export type AiChatMessage = {
  id: string;
  role: AiChatRole;
  content: string;
  createdAt: string;
  pending?: boolean;
  error?: boolean;
  /** Server history turn id (assistant message) when loaded from GET /ai/history */
  historyId?: string | null;
  sessionId?: string | null;
  contextVersion?: string | null;
  validationWarnings?: string[];
};

export type AiChatResponse = {
  sessionId: string;
  question: string;
  answer: string;
  /** Alias of answer for UI helpers */
  reply: string;
  contextVersion?: string | null;
  createdAt?: string | null;
  validation?: AiChatValidation | null;
};

export type AiConversationSnapshot = {
  sessionId: string | null;
  messages: AiChatMessage[];
  updatedAt: string;
};

/** One stored Q&A turn from GET /ai/history */
export type AiHistoryItem = {
  id: string;
  sessionId: string;
  question: string;
  answer: string;
  timestamp: string;
  contextVersion?: string | null;
};

export type AiHistoryMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type AiHistoryResponse = {
  items: AiHistoryItem[];
  meta?: AiHistoryMeta;
};
