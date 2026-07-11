'use client';

import { useEffect, useRef, useState } from 'react';
import { Eraser, Send, Sparkles, X } from 'lucide-react';
import ConversationHistory from '@/components/fitness/coach/ConversationHistory';
import PromptSuggestions from '@/components/fitness/coach/PromptSuggestions';
import type { AiChatMessage, AiHistoryItem } from '@/lib/fitness/coach/types';

type ChatDrawerProps = {
  open: boolean;
  messages: AiChatMessage[];
  history?: AiHistoryItem[];
  isSending?: boolean;
  isHistoryLoading?: boolean;
  onClose: () => void;
  onSend: (message: string) => void | Promise<unknown>;
  onClear?: () => void | Promise<unknown>;
  onDeleteTurn?: (historyId: string) => void | Promise<unknown>;
};

export default function ChatDrawer({
  open,
  messages,
  history = [],
  isSending = false,
  isHistoryLoading = false,
  onClose,
  onSend,
  onClear,
  onDeleteTurn,
}: ChatDrawerProps) {
  const [draft, setDraft] = useState('');
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open, isSending]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const submit = async () => {
    const value = draft.trim();
    if (!value || isSending) return;
    setDraft('');
    await onSend(value);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-stretch sm:justify-end">
      <button
        type="button"
        aria-label="Close AI coach"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="AI Coach"
        className="relative z-10 flex h-[min(92vh,720px)] w-full flex-col rounded-t-2xl border border-border bg-card shadow-2xl sm:h-full sm:max-w-md sm:rounded-none sm:border-l sm:border-t-0 sm:border-r-0 sm:border-b-0"
      >
        <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-muted sm:hidden" />

        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-accent" />
            <div>
              <p className="text-sm font-semibold text-foreground">Ask AI</p>
              <p className="text-[11px] text-muted-foreground">
                Context-aware coach · meals, workout, hydration
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {onClear ? (
              <button
                type="button"
                onClick={() => void onClear()}
                disabled={isSending || (messages.length === 0 && history.length === 0)}
                className="inline-flex items-center gap-1 rounded-lg border border-border px-2 py-1.5 text-[11px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-40"
              >
                <Eraser className="size-3.5" />
                Clear
              </button>
            ) : null}
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border p-1.5 text-muted-foreground hover:bg-muted"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {messages.length === 0 ? (
          <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
            <PromptSuggestions
              disabled={isSending}
              onSelect={(prompt) => void onSend(prompt)}
            />
            {isHistoryLoading ? (
              <p className="text-xs text-muted-foreground">Loading history…</p>
            ) : history.length > 0 ? (
              <div className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Recent history
                </p>
                {history.slice(0, 5).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    disabled={isSending}
                    onClick={() => void onSend(item.question)}
                    className="w-full rounded-xl border border-border bg-muted/20 px-3 py-2 text-left transition hover:bg-muted/40 disabled:opacity-50"
                  >
                    <p className="truncate text-xs font-medium text-foreground">
                      {item.question}
                    </p>
                    <p className="mt-0.5 line-clamp-2 text-[11px] text-muted-foreground">
                      {item.answer}
                    </p>
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        ) : (
          <ConversationHistory
            messages={messages}
            isTyping={isSending}
            bottomRef={bottomRef}
            onDeleteTurn={onDeleteTurn}
          />
        )}

        {messages.length > 0 ? (
          <div className="border-t border-border px-4 py-2">
            <PromptSuggestions
              compact
              disabled={isSending}
              onSelect={(prompt) => void onSend(prompt)}
            />
          </div>
        ) : null}

        <div className="border-t border-border p-3">
          <div className="flex gap-2">
            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  void submit();
                }
              }}
              placeholder="Ask your coach…"
              disabled={isSending}
              className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none ring-accent focus:ring-2 disabled:opacity-60"
            />
            <button
              type="button"
              disabled={isSending || !draft.trim()}
              onClick={() => void submit()}
              className="inline-flex items-center justify-center rounded-xl bg-accent px-3 py-2 text-accent-foreground disabled:opacity-50 dark:text-black"
              aria-label="Send message"
            >
              <Send className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
