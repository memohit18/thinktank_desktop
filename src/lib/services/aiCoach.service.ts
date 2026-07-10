export const aiCoachService = {
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
};
