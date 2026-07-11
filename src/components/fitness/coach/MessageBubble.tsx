'use client';

import { useState } from 'react';
import { Check, Copy, Trash2 } from 'lucide-react';
import MarkdownRenderer from '@/components/fitness/coach/MarkdownRenderer';
import type { AiChatMessage } from '@/lib/fitness/coach/types';

type MessageBubbleProps = {
  message: AiChatMessage;
  onDelete?: () => void;
};

export default function MessageBubble({ message, onDelete }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';

  const copy = async () => {
    if (!message.content.trim()) return;
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard may be unavailable
    }
  };

  return (
    <div
      className={`group flex max-w-[90%] flex-col gap-1 ${
        isUser ? 'ml-auto items-end' : 'mr-auto items-start'
      }`}
    >
      <div
        className={`rounded-2xl px-3 py-2 text-sm ${
          isUser
            ? 'bg-accent text-accent-foreground dark:text-black'
            : message.error
              ? 'border border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300'
              : 'border border-border bg-muted/30 text-foreground'
        }`}
      >
        {isAssistant && !message.error ? (
          message.content ? (
            <MarkdownRenderer content={message.content} />
          ) : message.pending ? (
            <span className="text-muted-foreground">…</span>
          ) : null
        ) : (
          <p className="whitespace-pre-wrap">{message.content}</p>
        )}
      </div>

      {isAssistant && message.content && !message.pending ? (
        <div className="flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
          <button
            type="button"
            onClick={() => void copy()}
            className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            {copied ? (
              <>
                <Check className="size-3" />
                Copied
              </>
            ) : (
              <>
                <Copy className="size-3" />
                Copy
              </>
            )}
          </button>
          {onDelete ? (
            <button
              type="button"
              onClick={onDelete}
              className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <Trash2 className="size-3" />
              Delete
            </button>
          ) : null}
          {message.contextVersion ? (
            <span className="px-1 text-[10px] text-muted-foreground">
              {message.contextVersion}
            </span>
          ) : null}
        </div>
      ) : null}

      {message.validationWarnings?.length ? (
        <p className="text-[10px] text-amber-700 dark:text-amber-300">
          {message.validationWarnings[0]}
        </p>
      ) : null}
    </div>
  );
}
