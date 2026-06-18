'use client';

import type { ReactNode } from 'react';

export type DataTableColumn = {
  key: string;
  label: ReactNode;
  headerClassName?: string;
};

type DataTableProps = {
  columns: DataTableColumn[];
  children: ReactNode;
  isLoading?: boolean;
  isError?: boolean;
  isFetching?: boolean;
  isEmpty?: boolean;
  loadingMessage?: string;
  errorMessage?: string;
  emptyMessage?: string;
  fetchingMessage?: string;
  footer?: ReactNode;
};

export default function DataTable({
  columns,
  children,
  isLoading = false,
  isError = false,
  isFetching = false,
  isEmpty = false,
  loadingMessage = 'Loading...',
  errorMessage = 'Failed to load data.',
  emptyMessage = 'No results found.',
  fetchingMessage = 'Updating results...',
  footer,
}: DataTableProps) {
  const colSpan = columns.length;

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-border bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-4 py-3 font-semibold ${column.headerClassName ?? ''}`}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={colSpan} className="px-4 py-8 text-center text-muted-foreground">
                  {loadingMessage}
                </td>
              </tr>
            ) : null}
            {isError ? (
              <tr>
                <td colSpan={colSpan} className="px-4 py-8 text-center text-red-500">
                  {errorMessage}
                </td>
              </tr>
            ) : null}
            {!isLoading && !isError ? children : null}
          </tbody>
        </table>
      </div>

      {isFetching && !isLoading ? (
        <p className="border-b border-border px-4 py-2 text-center text-xs text-muted-foreground">
          {fetchingMessage}
        </p>
      ) : null}

      {!isLoading && isEmpty ? (
        <p className="px-4 py-8 text-center text-sm text-muted-foreground">{emptyMessage}</p>
      ) : null}

      {footer}
    </div>
  );
}
