"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tables } from "@/types/supabase";
import { ColumnDef } from "@tanstack/react-table";
import clsx from "clsx";
import { ArrowUpDown } from "lucide-react";

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
            <span className="text-muted-foreground">
              No notes provided
            </span>
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

      return (
        <p>
          {originalRow.scheduled_at
            ? new Date(String(originalRow.scheduled_at)).toLocaleString(
                "en-US",
                {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                },
              )
            : ""}
        </p>
      );
    },
  },
  {
    header: "Actions",
    cell: ({ row }) => {
      const originalRow = row.original;

      return (
        <div className="flex items-center gap-2">
          {originalRow.status === "pending" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // Add your cancel logic here
                // e.g. call a mutation or show a confirmation dialog
              }}
            >
              Cancel Request
            </Button>
          )}
          {originalRow.status === "approved" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // Add your cancel logic here
                // e.g. call a mutation or show a confirmation dialog
              }}
            >
              Create Another
            </Button>
          )}
          {originalRow.status === "cancelled" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // Add your cancel logic here
                // e.g. call a mutation or show a confirmation dialog
              }}
            >
              Re-request
            </Button>
          )}
        </div>
      );
    },
  },
];
