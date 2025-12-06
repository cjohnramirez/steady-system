"use client";

import { Tables } from "@/types/supabase";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

export const studentColumn: ColumnDef<Tables<"student">>[] = [
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
    cell: ({ row }) => {
      return (
        <div className="w-fit rounded-3xl border border-gray-300 p-1 px-4 text-center text-xs">
          {row.getValue("college_name")}
        </div>
      );
    },
  },
  {
    accessorKey: "department",
    header: "Department",
    cell: ({ row }) => {
      return (
        <div className="w-fit rounded-3xl border border-gray-300 p-1 px-4 text-left text-xs">
          {String(row.getValue("department"))}
        </div>
      );
    },
  },
  {
    accessorKey: "year_level",
    header: "Year Level",
    cell: ({ row }) => {
      return (
        <div className="w-fit rounded-3xl border border-gray-300 p-1 px-4 text-left text-xs">
          {String(row.getValue("year_level"))}
        </div>
      );
    },
  },
];
