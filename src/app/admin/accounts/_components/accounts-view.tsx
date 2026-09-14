"use client";

import { useMemo, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type {
  ColumnDef,
  PaginationState,
  SortingState,
} from "@tanstack/react-table";
import { Download, MoreHorizontal, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SectionCard } from "@/components/app/section-card";
import { DataTable, SortableHeader } from "@/app/admin/_components/data-table";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { createClient } from "@/utils/supabase/client";
import type { Tables } from "@/types/supabase";
import { fetchCounselors } from "@/lib/counselors/queries";
import { fetchStudents } from "@/lib/students/queries";
import { queryKeys } from "@/lib/query-keys";
import StudentEditDialog from "./student-edit-dialog";
import CounselorEditDialog from "./counselor-edit-dialog";
import CounselorCreateDialog from "./counselor-create-dialog";
import DepartmentsDialog from "./departments-dialog";
import ExportDialog, { type AccountType } from "./export-dialog";

type Student = Tables<"student_with_details">;
type Counselor = Tables<"counselor_with_details">;

type Open =
  | { kind: "student"; row: Student }
  | { kind: "counselor"; row: Counselor }
  | { kind: "departments"; row: Counselor }
  | { kind: "create" }
  | { kind: "export" }
  | null;

/**
 * Accounts, as one client view with dialogs held in state.
 *
 * The edit screens used to be an @modal parallel route. Refreshing on one gave a
 * 404, closing it fired two navigations, and the admin student form validated
 * fields it never rendered, so it could not be saved. Both tabs were also fetched
 * on every render whichever was showing.
 */
export default function AccountsView() {
  const supabase = useMemo(() => createClient(), []);
  const [tab, setTab] = useState<AccountType>("students");
  const [open, setOpen] = useState<Open>(null);
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([]);
  const debouncedSearch = useDebouncedValue(search);

  const params = {
    page: pagination.pageIndex,
    pageSize: pagination.pageSize,
    search: debouncedSearch,
    sort: sorting[0],
  };

  const students = useQuery({
    queryKey: queryKeys.students.list(params),
    queryFn: () => fetchStudents(supabase, params),
    enabled: tab === "students",
    placeholderData: keepPreviousData,
  });

  const counselors = useQuery({
    queryKey: queryKeys.counselors.list(params),
    queryFn: () => fetchCounselors(supabase, params),
    enabled: tab === "counselors",
    placeholderData: keepPreviousData,
  });

  const studentColumns = useMemo<ColumnDef<Student>[]>(
    () => [
      {
        id: "last_name",
        accessorKey: "last_name",
        meta: { label: "Name" },
        header: ({ column }) => <SortableHeader column={column} title="Name" />,
        cell: ({ row }) => (
          <div className="min-w-40">
            <p className="font-medium">
              {row.original.last_name}, {row.original.first_name}
            </p>
            <p className="text-muted-foreground">@{row.original.username}</p>
          </div>
        ),
      },
      {
        id: "email",
        accessorKey: "email",
        meta: { label: "Email" },
        header: "Email",
        enableSorting: false,
      },
      {
        id: "university_id",
        accessorKey: "university_id",
        meta: { label: "University ID" },
        header: ({ column }) => (
          <SortableHeader column={column} title="University ID" />
        ),
      },
      {
        id: "department",
        accessorKey: "department",
        meta: { label: "Department" },
        header: ({ column }) => (
          <SortableHeader column={column} title="Department" />
        ),
        cell: ({ row }) => (
          <div>
            <p>{row.original.department}</p>
            <p className="text-muted-foreground">{row.original.college_name}</p>
          </div>
        ),
      },
      {
        id: "year_level",
        accessorKey: "year_level",
        meta: { label: "Year" },
        header: ({ column }) => <SortableHeader column={column} title="Year" />,
      },
    ],
    [],
  );

  const counselorColumns = useMemo<ColumnDef<Counselor>[]>(
    () => [
      {
        id: "last_name",
        accessorKey: "last_name",
        meta: { label: "Name" },
        header: ({ column }) => <SortableHeader column={column} title="Name" />,
        cell: ({ row }) => (
          <div className="min-w-40">
            <p className="font-medium">
              {row.original.last_name}, {row.original.first_name}
            </p>
            <p className="text-muted-foreground">@{row.original.username}</p>
          </div>
        ),
      },
      {
        id: "email",
        accessorKey: "email",
        meta: { label: "Email" },
        header: "Email",
        enableSorting: false,
      },
      {
        id: "department",
        accessorKey: "department",
        meta: { label: "Departments" },
        header: "Departments",
        enableSorting: false,
        cell: ({ row }) =>
          row.original.department ?? (
            <span className="text-muted-foreground">None assigned</span>
          ),
      },
      {
        // Showed a red "Uncertain" for every active counselor, because it only
        // looked at the schedule when is_active was null.
        id: "is_active",
        accessorKey: "is_active",
        meta: { label: "Status" },
        header: ({ column }) => (
          <SortableHeader column={column} title="Status" />
        ),
        cell: ({ row }) =>
          row.original.is_active ? (
            <Badge className="bg-status-approved text-status-approved-foreground">
              Accepting
            </Badge>
          ) : (
            <Badge variant="outline">Unavailable</Badge>
          ),
      },
      {
        id: "actions",
        enableHiding: false,
        enableSorting: false,
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`Actions for ${row.original.first_name} ${row.original.last_name}`}
                onClick={(event) => event.stopPropagation()}
              >
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              onClick={(event) => event.stopPropagation()}
            >
              <DropdownMenuItem
                onSelect={() =>
                  setOpen({ kind: "counselor", row: row.original })
                }
              >
                Edit profile
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() =>
                  setOpen({ kind: "departments", row: row.original })
                }
              >
                Assign departments
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [],
  );

  const shared = {
    pagination,
    onPaginationChange: setPagination,
    sorting,
    onSortingChange: setSorting,
    search,
    onSearchChange: setSearch,
    toolbar: (
      <Tabs
        value={tab}
        onValueChange={(value) => {
          setTab(value as AccountType);
          setPagination((current) => ({ ...current, pageIndex: 0 }));
          setSorting([]);
        }}
      >
        <TabsList>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="counselors">Counselors</TabsTrigger>
        </TabsList>
      </Tabs>
    ),
  };

  return (
    <>
      <SectionCard
        title={tab === "students" ? "Students" : "Counselors"}
        description="Select a row to edit it."
        actions={
          <>
            <Button
              variant="outline"
              onClick={() => setOpen({ kind: "export" })}
            >
              <Download aria-hidden />
              Export
            </Button>
            {tab === "counselors" && (
              <Button onClick={() => setOpen({ kind: "create" })}>
                <Plus aria-hidden />
                Add counselor
              </Button>
            )}
          </>
        }
      >
        {tab === "students" ? (
          <DataTable
            {...shared}
            searchLabel="Search students"
            columns={studentColumns}
            data={students.data?.data ?? []}
            rowCount={students.data?.count ?? 0}
            isLoading={students.isLoading}
            onRowClick={(row) => setOpen({ kind: "student", row })}
          />
        ) : (
          <DataTable
            {...shared}
            searchLabel="Search counselors"
            columns={counselorColumns}
            data={counselors.data?.data ?? []}
            rowCount={counselors.data?.count ?? 0}
            isLoading={counselors.isLoading}
            onRowClick={(row) => setOpen({ kind: "counselor", row })}
          />
        )}
      </SectionCard>

      {open?.kind === "student" && (
        <StudentEditDialog student={open.row} onClose={() => setOpen(null)} />
      )}
      {open?.kind === "counselor" && (
        <CounselorEditDialog
          counselor={open.row}
          onClose={() => setOpen(null)}
        />
      )}
      {open?.kind === "departments" && (
        <DepartmentsDialog counselor={open.row} onClose={() => setOpen(null)} />
      )}
      {open?.kind === "create" && (
        <CounselorCreateDialog onClose={() => setOpen(null)} />
      )}
      {open?.kind === "export" && (
        <ExportDialog defaultType={tab} onClose={() => setOpen(null)} />
      )}
    </>
  );
}
