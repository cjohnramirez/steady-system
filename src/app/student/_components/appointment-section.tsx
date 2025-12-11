"use client";

import { DataTable } from "@/app/admin/_components/data-table";
import { createClient } from "@/utils/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { PaginationState } from "@tanstack/react-table";
import { useState } from "react";
import { fetchStudentAppointment } from "../actions";
import { useUserStore } from "@/hooks/auth-store";
import { studentAppointmentColumns } from "./appointment-column";

export default function StudentAppointmentSection() {
  const supabase = createClient();
  const studentID = useUserStore.getState().id;

  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const { data: studentAppointment, isLoading: isStudentAppointmentLoading } =
    useQuery({
      queryKey: [
        "student-appointment",
        pagination.pageIndex,
        pagination.pageSize,
        search,
      ],
      queryFn: () =>
        fetchStudentAppointment(
          pagination.pageIndex,
          pagination.pageSize,
          studentID,
          search,
          supabase,
        ),
    });

  const studentAppointmentData = studentAppointment?.data || [];
  const rowCount = studentAppointment?.count || 0;

  return (
    <DataTable
      isLoading={isStudentAppointmentLoading}
      columns={studentAppointmentColumns}
      data={studentAppointmentData}
      rowCount={rowCount}
      pagination={pagination}
      onPaginationChange={setPagination}
      onSearchChange={(val) => {
        setSearch(val);
        setPagination((p) => ({ ...p, pageIndex: 0 }));
      }}
      toolbarExtra={
        <div className="h-full items-center">
          <p className="font-medium">Appointment</p>
          <p>
            You can edit some details about your appointments if you wished to
            do so
          </p>
        </div>
      }
    />
  );
}
