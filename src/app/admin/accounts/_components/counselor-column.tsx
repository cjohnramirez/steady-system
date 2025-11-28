"use client";

import { Badge } from "@/components/ui/badge";
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
import { ArrowUpDown, MoreHorizontal } from "lucide-react";

function getTodayBool(days: boolean[]) {
  const jsDay = new Date().getDay();
  const dayIndex = jsDay === 0 ? 7 : jsDay;
  return days[dayIndex] ?? false;
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
    cell: ({ row }) => {
      return (
        <div className="w-fit rounded-3xl border border-gray-300 p-1 px-4 text-center text-xs">
          {row.getValue("username")}
        </div>
      );
    },
  },
  {
    accessorKey: "availability",
    header: "Availability",
    cell: ({ row }) => {
      const originalRow = row.original;

      const availabilityArray = row.getValue("availability") ?? "";

      const isActive = originalRow.is_active;

      const status =
        isActive === true
          ? getTodayBool(
              (Array.isArray(availabilityArray) && availabilityArray) || [],
            )
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
];
