"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import type {
  ColumnDef,
  PaginationState,
  SortingState,
} from "@tanstack/react-table";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/app/section-card";
import { StatusBadge } from "@/components/app/status-badge";
import { useSignedInViewer } from "@/components/viewer-provider";
import { DataTable, SortableHeader } from "@/app/admin/_components/data-table";
import { useConfirm } from "@/hooks/use-confirm";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { createClient } from "@/utils/supabase/client";
import { cancelAppointment } from "@/lib/appointments/actions";
import {
  fetchStudentAppointments,
  type AppointmentRow,
} from "@/lib/appointments/queries";
import { formatAppointmentDate } from "@/lib/format";
import { queryKeys } from "@/lib/query-keys";

export default function StudentAppointmentSection() {
  const viewer = useSignedInViewer();
  const supabase = useMemo(() => createClient(), []);
  const queryClient = useQueryClient();
  const confirm = useConfirm();

  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([
    { id: "scheduled_at", desc: true },
  ]);
  const debouncedSearch = useDebouncedValue(search);

  const params = {
    page: pagination.pageIndex,
    pageSize: pagination.pageSize,
    search: debouncedSearch,
    sort: sorting[0],
  };

  const appointments = useQuery({
    queryKey: queryKeys.appointments.forStudent(viewer.profileId, params),
    queryFn: () => fetchStudentAppointments(supabase, viewer.profileId, params),
    placeholderData: keepPreviousData,
  });

  const columns = useMemo<ColumnDef<AppointmentRow>[]>(
    () => [
      {
        id: "scheduled_at",
        accessorKey: "scheduled_at",
        meta: { label: "Date" },
        header: ({ column }) => <SortableHeader column={column} title="Date" />,
        cell: ({ row }) => formatAppointmentDate(row.original.scheduled_at),
      },
      {
        id: "last_counselor_name",
        accessorKey: "last_counselor_name",
        meta: { label: "Counselor" },
        header: ({ column }) => (
          <SortableHeader column={column} title="Counselor" />
        ),
        cell: ({ row }) =>
          [row.original.first_counselor_name, row.original.last_counselor_name]
            .filter(Boolean)
            .join(" ") || "—",
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
      {
        id: "actions",
        header: () => <span className="sr-only">Actions</span>,
        enableHiding: false,
        enableSorting: false,
        cell: ({ row }) => {
          const { id, status, reason } = row.original;

          if (status === "pending" || status === "approved") {
            return (
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  const ok = await confirm({
                    title: "Cancel this appointment?",
                    description:
                      "Your counselor will be notified and the time will be freed up.",
                    confirmLabel: "Cancel appointment",
                    cancelLabel: "Keep it",
                    destructive: true,
                  });
                  if (!ok || !id) return;
                  const result = await cancelAppointment(id);
                  if (!result.ok) {
                    toast.error(result.error);
                    return;
                  }
                  toast.success("Appointment cancelled.");
                  await queryClient.invalidateQueries({
                    queryKey: queryKeys.appointments.all,
                  });
                  await queryClient.invalidateQueries({
                    queryKey: queryKeys.availableSlots.all,
                  });
                }}
              >
                Cancel
              </Button>
            );
          }

          if (status === "cancelled" || status === "rejected") {
            return (
              <Button variant="outline" size="sm" asChild>
                <Link
                  href={`/student/appointment?reason=${encodeURIComponent(reason ?? "")}`}
                >
                  Book again
                </Link>
              </Button>
            );
          }

          return null;
        },
      },
    ],
    [confirm, queryClient],
  );

  return (
    <SectionCard>
      <DataTable
        toolbar={
          <div className="space-y-1">
            <h2 className="font-medium">Your appointments</h2>
            <p className="text-muted-foreground">
              Cancel an upcoming session, or book again after one was declined.
            </p>
          </div>
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
        searchLabel="Search appointments"
        emptyMessage="No appointments yet. Book one when you're ready."
      />
    </SectionCard>
  );
}
