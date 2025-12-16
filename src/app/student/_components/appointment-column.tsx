"use client";

import { Button } from "@/components/ui/button";
import { useConfirmStore } from "@/hooks/confirm-store";
import { dateToString } from "@/lib/format";
import { Tables } from "@/types/supabase";
import { ColumnDef } from "@tanstack/react-table";
import clsx from "clsx";
import { ArrowUpDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { cancelStudentAppointment } from "../actions";

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
    cell: ({ row }) => {
      const status = row.getValue("status") ?? "";

      const statusColor = clsx("h-2 w-2 rounded-full", {
        "bg-blue-500": status === "approved",
        "bg-amber-500": status === "pending",
        "bg-green-500": status === "completed",
        "bg-red-500": status === "cancelled",
      });

      return (
        <div className="flex items-center gap-2">
          <div className={statusColor}></div>
          <p>{String(status)[0].toUpperCase() + String(status).slice(1)}</p>
        </div>
      );
    },
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

      return <p>{dateToString(originalRow.scheduled_at ?? "", true)}</p>;
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
    const res = await cancelStudentAppointment(row.original.id ?? "");

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
