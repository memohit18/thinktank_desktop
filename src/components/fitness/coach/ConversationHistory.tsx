'use client';

import type { RefObject } from 'react';
import MessageBubble from '@/components/fitness/coach/MessageBubble';
import TypingIndicator from '@/components/fitness/coach/TypingIndicator';
import type { AiChatMessage } from '@/lib/fitness/coach/types';

type ConversationHistoryProps = {
  messages: AiChatMessage[];
  isTyping?: boolean;
  bottomRef?: RefObject<HTMLDivElement | null>;
  onDeleteTurn?: (historyId: string) => void | Promise<unknown>;
};

export default function ConversationHistory({
  messages,
  isTyping = false,
  bottomRef,
  onDeleteTurn,
}: ConversationHistoryProps) {
  const showTyping =
    isTyping &&
    !messages.some((message) => message.role === 'assistant' && message.pending);

  return (
    <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
          onDelete={
            message.role === 'assistant' && message.historyId && onDeleteTurn
              ? () => void onDeleteTurn(message.historyId!)
              : undefined
          }
        />
      ))}
      {showTyping ? <TypingIndicator /> : null}
      <div ref={bottomRef} />
    </div>
  );
}
