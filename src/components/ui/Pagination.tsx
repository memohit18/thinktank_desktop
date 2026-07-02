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
  const pageNumbers = buildPageNumbers(currentPage, totalPages);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3 text-sm text-muted-foreground">
      <p>
        Showing {rangeStart} to {rangeEnd} of {totalItems} entries
      </p>
      <div className="flex flex-wrap items-center gap-1.5">
        <PageButton
          label="Previous"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
        />
        {pageNumbers.map((page, index) =>
          page === 'ellipsis' ? (
            <span key={`ellipsis-${index}`} className="px-1 text-muted-foreground">
              ...
            </span>
          ) : (
            <PageButton
              key={page}
              label={String(page)}
              active={page === currentPage}
              onClick={() => onPageChange(page)}
            />
          ),
        )}
        <PageButton
          label="Next"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        />
      </div>
    </div>
  );
}

function PageButton({
  label,
  active = false,
  disabled = false,
  onClick,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`min-w-9 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
        active
          ? 'border-foreground bg-foreground text-background'
          : 'border-border hover:bg-muted'
      }`}
    >
      {label}
    </button>
  );
}

function buildPageNumbers(currentPage: number, totalPages: number) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages: Array<number | 'ellipsis'> = [1];

  if (currentPage > 3) {
    pages.push('ellipsis');
  }

  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  for (let page = start; page <= end; page += 1) {
    pages.push(page);
  }

  if (currentPage < totalPages - 2) {
    pages.push('ellipsis');
  }

  pages.push(totalPages);
  return pages;
}
