"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tables } from "@/types/supabase";
import { ColumnDef } from "@tanstack/react-table";
import clsx from "clsx";
import { ArrowUpDown, Eye } from "lucide-react";
import { useState } from "react";
import AssignDepartmentModal from "./assign-department-modal";

function getTodayBool(days: boolean[]) {
  const jsDay = new Date().getDay();
  const dayIndex = jsDay;
  return days && days.length > dayIndex ? days[dayIndex] : false;
}

export const counselorColumn: ColumnDef<Tables<"counselor_with_details">>[] = [
  {
    accessorKey: "university_id",
    header: ({ column }) => {
      return (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() == "asc")}
          className="flex items-center gap-2"
        >
          University ID
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </button>
      );
    },
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "last_name",
    header: ({ column }) => {
      return (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() == "asc")}
          className="flex items-center gap-2"
        >
          Last Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </button>
      );
    },
  },
  {
    accessorKey: "first_name",
    header: ({ column }) => {
      return (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() == "asc")}
          className="flex items-center gap-2"
        >
          First Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </button>
      );
    },
  },
  {
    accessorKey: "username",
    header: "Username",
  },
  {
    accessorKey: "availability",
    header: "Availability",
    cell: ({ row }) => {
      const originalRow = row.original;

      const dayOfWeekArray = originalRow.day_of_week ?? [];
      const isActive = originalRow.is_active;

      const status =
        isActive === null
          ? getTodayBool(Array.isArray(dayOfWeekArray) ? dayOfWeekArray : [])
          : false;

      const statusColor = clsx("text-black", {
        "bg-red-200": status === false,
        "bg-green-200": status === true,
      });

      return (
        <Badge className={statusColor}>
          {status === true ? "Available" : "Uncertain"}
        </Badge>
      );
    },
    filterFn: (row, columnId, filterValue: string[]) => {
      if (!filterValue?.length) return true;
      return filterValue.includes(row.getValue(columnId));
    },
  },
  {
    header: "Department/s",
    cell: ({ row }) => {
      // Move state to a component to avoid hook errors
      function DepartmentCell() {
        const [openAssignDepartment, setOpenAssignDepartment] = useState(false);

        return (
          <>
            {openAssignDepartment && (
              <AssignDepartmentModal
                open={openAssignDepartment}
                setOpen={setOpenAssignDepartment}
                id={row.original.id ?? ""}
              />
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setOpenAssignDepartment(true);
              }}
            >
              <Eye />
              View Department
            </Button>
          </>
        );
      }
      return <DepartmentCell />;
    }
  }
];
