"use client";

import { DataTablePagination } from "./pagination";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  VisibilityState,
  PaginationState,
  OnChangeFn,
} from "@tanstack/react-table";
import { Download, SearchIcon, Sidebar } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  toolbarExtra?: React.ReactNode;
  isLoading: boolean;
  rowUrl?: (id: string) => string;
  rowCount?: number;
  pagination?: PaginationState;
  onPaginationChange?: OnChangeFn<PaginationState>;
  onSearchChange?: (value: string) => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  toolbarExtra,
  isLoading,
  rowUrl,
  rowCount,
  pagination,
  onPaginationChange,
  onSearchChange,
}: DataTableProps<TData, TValue>) {
  const router = useRouter();
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const [searchTerm, setSearchTerm] = useState("");

  const tableData = useMemo(
    () => (isLoading ? Array(pagination?.pageSize || 10).fill({}) : data),
    [isLoading, data, pagination?.pageSize],
  );

  const tableColumns = useMemo(
    () =>
      isLoading
        ? columns.map((column) => ({
            ...column,
            cell: () => <Skeleton className="m-1 h-4 w-full rounded-md p-2" />,
          }))
        : columns,
    [isLoading, columns],
  );

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: tableData,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    rowCount: rowCount ?? 0,
    state: {
      columnVisibility,
      pagination,
    },
    onPaginationChange: onPaginationChange,
    onColumnVisibilityChange: setColumnVisibility,
  });

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (onSearchChange) onSearchChange(value);
  };

  return (
    <div>
      <div className="mb-4 flex justify-between gap-4">
        <div>{toolbarExtra}</div>
        <div className="flex gap-4">
          <InputGroup className="bg-white">
            <InputGroupInput
              placeholder="Search..."
              value={searchTerm}
              onChange={handleSearch}
              className="max-w-96"
            />
            <InputGroupAddon>
              <SearchIcon />
            </InputGroupAddon>
          </InputGroup>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Sidebar />
                Customize
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="mt-8 overflow-hidden rounded-md border bg-white">
        <Table>
          <TableHeader className="bg-gray-100">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="p-3">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  onClick={() => {
                    if (rowUrl) router.push(rowUrl(row.original.id));
                  }}
                  onMouseEnter={() => {
                    if (rowUrl) router.prefetch(rowUrl(row.original.id));
                  }}
                  className={
                    rowUrl ? `cursor-pointer` : `` + `hover:bg-gray-50`
                  }
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="p-3">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 p-3 text-center"
                >
                  No results
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  );
}
