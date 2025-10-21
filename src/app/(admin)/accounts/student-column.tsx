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
import { Student } from "@/lib/types/users";
import { ColumnDef } from "@tanstack/react-table";
import clsx from "clsx";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";

export const studentColumn: ColumnDef<Student>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="select all"
      ></Checkbox>
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "id",
    header: ({ column }) => {
      return (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() == "asc")}
          className="flex items-center gap-2"
        >
          Student ID
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </button>
      );
    },
  },
  {
    accessorKey: "email",
    header: "Email Address",
  },
  {
    accessorKey: "lastName",
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
    accessorKey: "firstName",
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
    accessorKey: "college",
    header: "College",
    cell: ({ row }) => {
      return (
        <div className="w-fit rounded-3xl border border-gray-300 p-1 px-4 text-center text-xs">
          {row.getValue("college")}
        </div>
      );
    },
  },
  {
    accessorKey: "program",
    header: "Program",
    cell: ({ row }) => {
      return (
        <div className="w-fit rounded-3xl border border-gray-300 p-1 px-4 text-left text-xs">
          {String(row.getValue("program"))}
        </div>
      );
    },
  },
  {
    accessorKey: "yearLevel",
    header: "Year Level",
    cell: ({ row }) => {
      return (
        <div className="w-fit rounded-3xl border border-gray-300 p-1 px-4 text-left text-xs">
          {String(row.getValue("yearLevel"))}
        </div>
      );
    },
  },
  {
    accessorKey: "emotionalStatus",
    header: "Emotional Status",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const studentAccount = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() =>
                navigator.clipboard.writeText(String(studentAccount.id))
              }
            >
              Copy Student ID
            </DropdownMenuItem>
            <DropdownMenuItem>Edit Student</DropdownMenuItem>
            <DropdownMenuItem>Delete Student</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
