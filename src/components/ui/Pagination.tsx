'use client';

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
};

export default function Pagination({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
}: PaginationProps) {
  const pageStart = (currentPage - 1) * pageSize;
  const rangeStart = totalItems ? pageStart + 1 : 0;
  const rangeEnd = Math.min(pageStart + pageSize, totalItems);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3 text-sm text-muted-foreground">
      <p>
        Showing {rangeStart} to {rangeEnd} of {totalItems} entries
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="rounded-lg border border-border px-3 py-1.5 transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
        >
          Previous
        </button>
        <span className="rounded-lg bg-accent px-3 py-1.5 font-medium text-accent-foreground dark:text-black">
          {currentPage}
        </span>
        <button
          type="button"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="rounded-lg border border-border px-3 py-1.5 transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
