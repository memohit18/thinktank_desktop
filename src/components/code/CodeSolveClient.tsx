'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import CodeWorkspace from '@/components/code/CodeWorkspace';
import type { CodeQuestion } from '@/lib/code/questions';
import { preloadPyodide } from '@/lib/code/runPython';

type CodeSolveClientProps = {
  question: CodeQuestion;
};

export default function CodeSolveClient({ question }: CodeSolveClientProps) {
  useEffect(() => {
    preloadPyodide();
  }, []);

  return (
    <main className="flex h-[calc(100vh-4rem)] min-h-0 flex-1 flex-col overflow-hidden">
      <div className="flex shrink-0 items-center gap-2 border-b border-border bg-card px-6 py-3">
        <BookIcon className="size-4 text-muted-foreground" />
        <Link
          href="/code"
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-accent"
        >
          Problems
        </Link>
        <ChevronIcon className="size-3.5 text-muted-foreground" />
        <span className="text-sm font-medium text-foreground">
          {question.number}. {question.title}
        </span>
      </div>
      <CodeWorkspace question={question} />
    </main>
  );
}

function BookIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
