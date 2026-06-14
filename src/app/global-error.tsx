'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
        <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h1 className="text-xl font-semibold">Something went wrong</h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            An unexpected error occurred. Please try again.
          </p>
          <button
            type="button"
            onClick={reset}
            className="mt-6 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 dark:bg-zinc-50 dark:text-zinc-900"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
