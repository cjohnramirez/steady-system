"use client";

import { Button } from "@/components/ui/button";
import { useConfirmStore } from "@/hooks/confirm-store";
import { dateToString } from "@/lib/format";
import { Tables } from "@/types/supabase";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { AppointmentStatusDot } from "@/components/appointment-status";
import { useRouter } from "next/navigation";
import { deleteStudentAppointment } from "../actions";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export const studentAppointmentColumns: ColumnDef<
  Tables<"appointment_with_details">
>[] = [
  {
    accessorKey: "counselor_id",
    header: ({ column }) => {
      return (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() == "asc")}
          className="flex items-center gap-2"
        >
          Counselor Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </button>
      );
    },
    cell: ({ row }) => {
      const originalRow = row.original;

      return (
        <p>
          {originalRow.first_counselor_name}, {originalRow.last_counselor_name}
        </p>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <AppointmentStatusDot status={row.getValue("status")} />
    ),
    filterFn: (row, columnId, filterValue: string[]) => {
      if (!filterValue?.length) return true;
      return filterValue.includes(row.getValue(columnId));
    },
  },
  {
    accessorKey: "notes",
    header: "Notes",
    cell: ({ row }) => {
      const notes = row.getValue("notes");
      return (
        <p>
          {notes && String(notes).trim() !== "" ? (
            String(notes)
          ) : (
            <span className="text-muted-foreground">No notes provided</span>
          )}
        </p>
      );
    },
  },
  {
    accessorKey: "scheduled_at",
    header: "Scheduled At",
    cell: ({ row }) => {
      const originalRow = row.original;

      return <p>{dateToString(originalRow.scheduled_at ?? "")}</p>;
    },
  },
  {
    header: "Actions",
    cell: ({ row }) => <AppointmentActionsCell row={row} />,
  },
];

const AppointmentActionsCell = ({ row }: { row: any }) => {
  const originalRow = row.original;
  const router = useRouter();
  const { confirm, startLoading, stopLoading } = useConfirmStore();
  const queryClient = useQueryClient();

  const handleSubmit = async () => {
    const ok = await confirm(
      "Cancel this appointment?",
      "This action cannot be undone.",
    );

    if (!ok) return;

    startLoading();
    const res = await deleteStudentAppointment(row.original.id ?? "");

    if (res.error) {
      toast.error(res.error);
    }

    if (res.success) {
      queryClient.invalidateQueries({ queryKey: ["student-appointments"] });
      toast.success(res.success);
    }

    stopLoading();
  };

  return (
    <div className="flex items-center gap-2">
      {originalRow.status === "pending" && (
        <Button variant="outline" size="sm" onClick={handleSubmit}>
          Cancel Request
        </Button>
      )}
      {originalRow.status === "approved" && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            router.push("/student/appointment");
          }}
        >
          Create Another
        </Button>
      )}
      {originalRow.status === "cancelled" && (
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          Re-request
        </Button>
      )}
    </div>
  );
};
