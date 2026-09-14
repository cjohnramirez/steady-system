"use client";

import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { EmptyState } from "@/components/app/empty-state";
import { ErrorState } from "@/components/app/error-state";
import { PaginationControls } from "@/components/app/pagination-controls";
import { SearchInput } from "@/components/app/search-input";
import { cn } from "@/lib/utils";
import { ContentCardSkeleton } from "./content-card";

/**
 * Search, grid, loading, empty and error states, and pager for a content list. The
 * portal and the admin CMS each had three near-identical copies of this layout.
 *
 * While a new page or filter loads, the current tiles stay in place but dim, so
 * the grid doesn't collapse and jump; the first load shows skeleton tiles.
 */
export function ContentGrid<T>({
  id,
  title,
  description,
  actions,
  filters,
  search,
  onSearchChange,
  searchLabel,
  items,
  isLoading,
  isFetching = false,
  isError = false,
  onRetry,
  total,
  page,
  pageSize,
  onPageChange,
  renderItem,
  empty,
  itemLabel,
}: {
  id?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  filters?: ReactNode;
  search: string;
  onSearchChange: (value: string) => void;
  searchLabel: string;
  items: T[];
  isLoading: boolean;
  /** A refetch over tiles already shown (paging, search, mood). Dims the grid. */
  isFetching?: boolean;
  isError?: boolean;
  onRetry?: () => unknown;
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  renderItem: (item: T) => ReactNode;
  empty: { title: string; description?: string; icon?: LucideIcon };
  itemLabel: string;
}) {
  return (
    <section
      id={id}
      className="flex scroll-mt-24 flex-col gap-5"
      aria-labelledby={id ? `${id}-title` : undefined}
    >
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <h2
            id={id ? `${id}-title` : undefined}
            className="text-2xl tracking-tight md:text-3xl"
          >
            {title}
          </h2>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
          {filters}
          <SearchInput
            label={searchLabel}
            value={search}
            onValueChange={(value) => {
              onSearchChange(value);
              onPageChange(0);
            }}
          />
          {actions}
        </div>
      </header>

      {isLoading ? (
        <div
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          aria-busy
        >
          {Array.from({ length: pageSize }, (_, index) => (
            <ContentCardSkeleton key={index} />
          ))}
        </div>
      ) : isError && items.length === 0 ? (
        <ErrorState title={`${title} couldn't be loaded`} onRetry={onRetry} />
      ) : items.length === 0 ? (
        <EmptyState
          title={search ? "No matches" : empty.title}
          description={search ? "Try a different search." : empty.description}
          icon={empty.icon}
        />
      ) : (
        <div
          aria-busy={isFetching}
          className={cn(
            "grid gap-4 transition-opacity sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
            isFetching && "opacity-60",
          )}
        >
          {items.map(renderItem)}
        </div>
      )}

      <PaginationControls
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={onPageChange}
        isLoading={isLoading || isFetching}
        itemLabel={itemLabel}
      />
    </section>
  );
}
