'use client';

import { MessageCircle } from 'lucide-react';
import ChatDrawer from '@/components/fitness/coach/ChatDrawer';
import { useAIChat } from '@/hooks/useAIChat';

export default function FloatingCoach() {
  const chat = useAIChat();

  return (
    <>
      {!chat.isOpen ? (
        <button
          type="button"
          onClick={chat.open}
          className="fixed bottom-6 right-4 z-40 inline-flex items-center gap-2 rounded-full bg-accent px-4 py-3 text-sm font-semibold text-accent-foreground shadow-[0_0_24px_var(--neon-glow)] transition-opacity hover:opacity-90 dark:text-black"
        >
          <MessageCircle className="size-4" />
          Ask AI
        </button>
      ) : null}

      <ChatDrawer
        open={chat.isOpen}
        messages={chat.messages}
        history={chat.history}
        isSending={chat.isSending}
        isHistoryLoading={chat.isHistoryLoading}
        onClose={chat.close}
        onSend={chat.ask}
        onClear={chat.clear}
        onDeleteTurn={chat.removeHistoryTurn}
      />
    </>
  );
}
