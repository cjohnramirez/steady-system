"use client";

import { useMemo, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type {
  ColumnDef,
  PaginationState,
  SortingState,
} from "@tanstack/react-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SectionCard } from "@/components/app/section-card";
import { StatusBadge } from "@/components/app/status-badge";
import { AppointmentDetailsDialog } from "@/components/appointments/appointment-details-dialog";
import { DataTable, SortableHeader } from "@/app/admin/_components/data-table";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { createClient } from "@/utils/supabase/client";
import {
  fetchAllAppointments,
  type AppointmentRow,
} from "@/lib/appointments/queries";
import {
  APPOINTMENT_STATUSES,
  appointmentStatusLabel,
  type AppointmentStatus,
} from "@/lib/appointments/status";
import { formatAppointmentDate } from "@/lib/format";
import { queryKeys } from "@/lib/query-keys";

const ALL = "all";

export default function AppointmentsView() {
  const supabase = useMemo(() => createClient(), []);
  const [status, setStatus] = useState<AppointmentStatus | typeof ALL>(ALL);
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([
    { id: "scheduled_at", desc: true },
  ]);
  const [selected, setSelected] = useState<AppointmentRow | null>(null);
  const debouncedSearch = useDebouncedValue(search);

  const params = {
    page: pagination.pageIndex,
    pageSize: pagination.pageSize,
    search: debouncedSearch,
    status: status === ALL ? undefined : status,
    sort: sorting[0],
  };

  const appointments = useQuery({
    queryKey: queryKeys.appointments.list(params),
    queryFn: () => fetchAllAppointments(supabase, params),
    placeholderData: keepPreviousData,
  });

  const columns = useMemo<ColumnDef<AppointmentRow>[]>(
    () => [
      {
        id: "scheduled_at",
        accessorKey: "scheduled_at",
        meta: { label: "Date" },
        header: ({ column }) => <SortableHeader column={column} title="Date" />,
        cell: ({ row }) => (
          <span className="whitespace-nowrap">
            {formatAppointmentDate(row.original.scheduled_at)}
          </span>
        ),
      },
      {
        id: "last_student_name",
        accessorKey: "last_student_name",
        meta: { label: "Student" },
        header: ({ column }) => (
          <SortableHeader column={column} title="Student" />
        ),
        cell: ({ row }) => (
          <div>
            <p className="font-medium">
              {row.original.last_student_name},{" "}
              {row.original.first_student_name}
            </p>
            <p className="text-muted-foreground">
              {row.original.student_university_id}
            </p>
          </div>
        ),
      },
      {
        id: "last_counselor_name",
        accessorKey: "last_counselor_name",
        meta: { label: "Counselor" },
        header: ({ column }) => (
          <SortableHeader column={column} title="Counselor" />
        ),
        cell: ({ row }) =>
          row.original.last_counselor_name
            ? `${row.original.first_counselor_name} ${row.original.last_counselor_name}`
            : "—",
      },
      {
        id: "reason",
        accessorKey: "reason",
        meta: { label: "Reason" },
        header: "Reason",
        enableSorting: false,
      },
      {
        id: "status",
        accessorKey: "status",
        meta: { label: "Status" },
        header: ({ column }) => (
          <SortableHeader column={column} title="Status" />
        ),
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
    ],
    [],
  );

  return (
    <SectionCard>
      <DataTable
        toolbar={
          <Select
            value={status}
            onValueChange={(value) => {
              setStatus(value as AppointmentStatus | typeof ALL);
              setPagination((current) => ({ ...current, pageIndex: 0 }));
            }}
          >
            <SelectTrigger
              className="bg-card w-44"
              aria-label="Filter by status"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All statuses</SelectItem>
              {APPOINTMENT_STATUSES.map((option) => (
                <SelectItem key={option} value={option}>
                  {appointmentStatusLabel(option)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
        columns={columns}
        data={appointments.data?.data ?? []}
        rowCount={appointments.data?.count ?? 0}
        isLoading={appointments.isLoading}
        pagination={pagination}
        onPaginationChange={setPagination}
        sorting={sorting}
        onSortingChange={setSorting}
        search={search}
        onSearchChange={setSearch}
        searchLabel="Search by student, counselor or reason"
        onRowClick={setSelected}
      />
      {selected && (
        <AppointmentDetailsDialog
          appointment={selected}
          open
          onOpenChange={() => setSelected(null)}
        />
      )}
    </SectionCard>
  );
}
