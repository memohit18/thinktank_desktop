'use client';

import { useEffect, useRef, useState } from 'react';
import { Send, Sparkles, X } from 'lucide-react';
import type { AiChatMessage } from '@/lib/fitness/execution/types';

type AIChatDrawerProps = {
  open: boolean;
  messages: AiChatMessage[];
  isSending?: boolean;
  onClose: () => void;
  onSend: (message: string) => void | Promise<unknown>;
};

const SUGGESTIONS = [
  'Can I replace dinner?',
  'I skipped breakfast.',
  'What should I eat for lunch?',
];

export default function AIChatDrawer({
  open,
  messages,
  isSending = false,
  onClose,
  onSend,
}: AIChatDrawerProps) {
  const [draft, setDraft] = useState('');
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  if (!open) return null;

  const submit = async () => {
    const value = draft.trim();
    if (!value || isSending) return;
    setDraft('');
    await onSend(value);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end bg-black/40 p-0 sm:p-4">
      <button
        type="button"
        aria-label="Close AI coach"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
      />
      <div className="relative z-10 flex h-[min(85vh,640px)] w-full flex-col rounded-t-2xl border border-border bg-card shadow-2xl sm:max-w-md sm:rounded-2xl">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-accent" />
            <div>
              <p className="text-sm font-semibold text-foreground">Ask AI</p>
              <p className="text-[11px] text-muted-foreground">
                Coach knows today&apos;s meals, water, and plan
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border p-1.5 text-muted-foreground hover:bg-muted"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
          {messages.length === 0 ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Ask about swaps, skipped meals, or what to eat next.
              </p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    disabled={isSending}
                    onClick={() => void onSend(suggestion)}
                    className="rounded-full border border-border bg-muted/30 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                  message.role === 'user'
                    ? 'ml-auto bg-accent text-accent-foreground dark:text-black'
                    : 'mr-auto border border-border bg-muted/30 text-foreground'
                }`}
              >
                {message.content}
              </div>
            ))
          )}
          {isSending ? (
            <div className="mr-auto rounded-2xl border border-border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
              Thinking…
            </div>
          ) : null}
          <div ref={bottomRef} />
        </div>

        <div className="border-t border-border p-3">
          <div className="flex gap-2">
            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') void submit();
              }}
              placeholder="Ask your coach…"
              className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none ring-accent focus:ring-2"
            />
            <button
              type="button"
              disabled={isSending || !draft.trim()}
              onClick={() => void submit()}
              className="inline-flex items-center justify-center rounded-xl bg-accent px-3 py-2 text-accent-foreground disabled:opacity-50 dark:text-black"
            >
              <Send className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
