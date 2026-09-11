"use client";

import { Tables } from "@/types/supabase";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

// The table is fed from student_with_details, not the base table. Typing it as
// Tables<"student"> promised columns the view does not carry, such as avatar and
// last_active_at, and hid the ones it does, such as college_name.
export const studentColumn: ColumnDef<Tables<"student_with_details">>[] = [
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
    accessorKey: "username",
    header: ({ column }) => {
      return (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() == "asc")}
          className="flex items-center gap-2"
        >
          Username
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </button>
      );
    },
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
    accessorKey: "college_name",
    header: "College",
  },
  {
    accessorKey: "department",
    header: "Department",
  },
  {
    accessorKey: "year_level",
    header: "Year Level",
  },
];
