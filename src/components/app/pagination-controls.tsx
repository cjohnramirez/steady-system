"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { hasNextPage } from "@/lib/db/paginate";

/**
 * Previous and next for a server-paginated list, with a "1–6 of 42" summary.
 *
 * Seven hand-rolled copies of this enabled "next" whenever the current page was
 * full, which on an exact multiple of the page size requested a page past the end.
 */
export function PaginationControls({
  page,
  pageSize,
  total,
  onPageChange,
  isLoading,
  itemLabel = "items",
}: {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
  itemLabel?: string;
}) {
  const from = total === 0 ? 0 : page * pageSize + 1;
  const to = Math.min(total, (page + 1) * pageSize);

  return (
    <div className="flex items-center justify-between gap-4">
      <p className="text-muted-foreground" aria-live="polite">
        {total === 0
          ? `No ${itemLabel}`
          : `${from}–${to} of ${total} ${itemLabel}`}
      </p>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="icon"
          aria-label="Previous page"
          disabled={isLoading || page === 0}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft />
        </Button>
        <Button
          variant="outline"
          size="icon"
          aria-label="Next page"
          disabled={isLoading || !hasNextPage(page, pageSize, total)}
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRight />
        </Button>
      </div>
    </div>
  );
}
