/**
 * AI Coach API (`BASE=/api`).
 * Backend flow: Context Builder → Prompt Builder → Gemini → Validator → Storage.
 * Model never gets DB access; FE only sends the user message (+ optional sessionId).
 */
export const aiService = {
  chat(body: { message: string; sessionId?: string }) {
    return {
      url: '/ai/chat',
      method: 'POST' as const,
      body: {
        message: body.message,
        ...(body.sessionId ? { sessionId: body.sessionId } : {}),
      },
    };
  },
  history(params?: { page?: number; limit?: number }) {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 20;
    return `/ai/history?page=${page}&limit=${limit}`;
  },
  /** Delete by assistant-message (turn) id or session id. */
  deleteHistory(id: string) {
    return {
      url: `/ai/history/${id}`,
      method: 'DELETE' as const,
    };
  },
};

/** @deprecated Prefer aiService */
export const aiCoachService = aiService;
