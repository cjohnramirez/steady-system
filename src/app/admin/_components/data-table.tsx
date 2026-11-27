"use client";

import { useState, type ReactNode } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type Column,
  type ColumnDef,
  type OnChangeFn,
  type PaginationState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Columns3,
  SearchX,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/app/empty-state";
import { ErrorState } from "@/components/app/error-state";
import { SearchInput } from "@/components/app/search-input";
import { cn } from "@/lib/utils";
import { DataTablePagination } from "./pagination";

/**
 * Every row is the same height whether or not it holds a button. With padding
 * alone, rows with an action button (32px) came out taller than text-only rows.
 */
const ROW_HEIGHT = "h-14";

type DataTableProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading: boolean;
  /** A refetch over rows already shown (paging, search). Dims the rows. */
  isFetching?: boolean;
  isError?: boolean;
  /** Names what failed, e.g. "Appointments couldn't be loaded". */
  errorTitle?: string;
  onRetry?: () => unknown;
  rowCount: number;
  pagination: PaginationState;
  onPaginationChange: OnChangeFn<PaginationState>;
  /** Server-side sorting. Omit to make every header plain text. */
  sorting?: SortingState;
  onSortingChange?: OnChangeFn<SortingState>;
  /** The raw search text. Debounce it where it feeds the query. */
  search?: string;
  onSearchChange?: (value: string) => void;
  searchLabel?: string;
  /** Left side of the toolbar, usually a title or filters. */
  toolbar?: ReactNode;
  onRowClick?: (row: TData) => void;
  /** What to say when there are no rows at all. */
  empty?: {
    title: string;
    description?: string;
    icon?: LucideIcon;
    action?: ReactNode;
  };
  /**
   * A search or filter is narrowing the rows, so an empty table means "no matches",
   * not "nothing yet". `onClearFilters` adds a button to reset them.
   */
  isFiltered?: boolean;
  onClearFilters?: () => void;
};

/**
 * A server-paginated table.
 *
 * Fixed from the previous version: sort headers called toggleSorting on a table
 * with no sorting state, so they did nothing; the hover class was lost to an
 * operator-precedence slip; skeleton rows prefetched `/undefined`; and the
 * footer's "N of N" compared the current page with itself.
 */
export function DataTable<TData, TValue>({
  columns,
  data,
  isLoading,
  rowCount,
  pagination,
  onPaginationChange,
  sorting,
  onSortingChange,
  search,
  onSearchChange,
  searchLabel = "Search",
  toolbar,
  onRowClick,
  empty = { title: "Nothing here yet" },
  isFetching = false,
  isError = false,
  errorTitle,
  onRetry,
  isFiltered = false,
  onClearFilters,
}: DataTableProps<TData, TValue>) {
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    enableSorting: Boolean(onSortingChange),
    rowCount,
    state: { columnVisibility, pagination, sorting: sorting ?? [] },
    onPaginationChange,
    onSortingChange: (updater) => {
      onSortingChange?.(updater);
      onPaginationChange((current) => ({ ...current, pageIndex: 0 }));
    },
    onColumnVisibilityChange: setColumnVisibility,
  });

  const hideable = table
    .getAllColumns()
    .filter((column) => column.getCanHide());

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">{toolbar}</div>
        <div className="flex flex-wrap items-center gap-2">
          {onSearchChange && (
            <SearchInput
              label={searchLabel}
              value={search ?? ""}
              onValueChange={(value) => {
                onSearchChange(value);
                onPaginationChange((current) => ({ ...current, pageIndex: 0 }));
              }}
            />
          )}
          {hideable.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Columns3 aria-hidden />
                  Columns
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {hideable.map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {typeof column.columnDef.meta === "object" &&
                    column.columnDef.meta &&
                    "label" in column.columnDef.meta
                      ? String(column.columnDef.meta.label)
                      : column.id}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Empty and error states sit below the table, outside its horizontal
          scroller: inside a cell they centred on the full table width, which on a
          phone is wider than the screen, and were cut off. */}
      <div className="bg-card overflow-hidden rounded-xl border">
        <Table>
          <TableHeader className="bg-muted/60">
            {table.getHeaderGroups().map((group) => (
              <TableRow key={group.id}>
                {group.headers.map((header) => (
                  <TableHead key={header.id} className="px-3">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody
            aria-busy={isLoading || isFetching}
            className={cn(
              "transition-opacity",
              isFetching && !isLoading && "opacity-60",
            )}
          >
            {isLoading
              ? Array.from(
                  { length: Math.min(pagination.pageSize, 8) },
                  (_, index) => (
                    <TableRow key={index} className={ROW_HEIGHT}>
                      {table.getVisibleLeafColumns().map((column) => (
                        <TableCell key={column.id} className="px-3 py-2">
                          <Skeleton className="h-4 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ),
                )
              : !isError &&
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    onClick={
                      onRowClick ? () => onRowClick(row.original) : undefined
                    }
                    className={cn(ROW_HEIGHT, onRowClick && "cursor-pointer")}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="px-3 py-2">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
          </TableBody>
        </Table>

        {!isLoading && isError ? (
          <ErrorState
            title={errorTitle}
            onRetry={onRetry}
            className="rounded-none border-none p-6"
          />
        ) : !isLoading && table.getRowModel().rows.length === 0 ? (
          isFiltered ? (
            <EmptyState
              icon={SearchX}
              title="No matches"
              description="Try a different search or filter."
              action={
                onClearFilters && (
                  <Button variant="outline" size="sm" onClick={onClearFilters}>
                    Clear filters
                  </Button>
                )
              }
              className="rounded-none border-none p-6"
            />
          ) : (
            <EmptyState {...empty} className="rounded-none border-none p-6" />
          )
        ) : null}
      </div>
      <DataTablePagination table={table} />
    </div>
  );
}

/** A header that sorts the column on click and shows the direction. */
export function SortableHeader<TData, TValue>({
  column,
  title,
}: {
  column: Column<TData, TValue>;
  title: string;
}) {
  if (!column.getCanSort()) return <span>{title}</span>;

  const sorted = column.getIsSorted();
  const Icon =
    sorted === "asc" ? ArrowUp : sorted === "desc" ? ArrowDown : ArrowUpDown;

  return (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-2 h-8 px-2"
      onClick={() => column.toggleSorting(sorted === "asc")}
      aria-label={`Sort by ${title}`}
    >
      {title}
      <Icon aria-hidden className="text-muted-foreground" />
    </Button>
  );
}
