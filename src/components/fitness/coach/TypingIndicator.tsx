'use client';

export default function TypingIndicator() {
  return (
    <div
      className="mr-auto inline-flex items-center gap-1 rounded-2xl border border-border bg-muted/30 px-3 py-2"
      aria-label="Coach is typing"
    >
      <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.2s]" />
      <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.1s]" />
      <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground" />
    </div>
  );
}
