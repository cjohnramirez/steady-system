"use client";

import { DataTable } from "../_components/data-table";
import { appointmentColumns } from "./_components/appointment-column";
import { createClient } from "@/utils/supabase/client";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchAppointments } from "./actions";
import { PaginationState } from "@tanstack/react-table";
import { Info } from "lucide-react";
import {
  APPOINTMENT_STATUSES,
  type AppointmentStatus,
} from "@/lib/appointments/status";

// Derived from the database enum rather than written out by hand, so a new status
// cannot be added to the schema and silently go missing from this filter.
type TabName = AppointmentStatus | "all";

export default function AppointmentPage() {
  const supabase = createClient();

  const [activeTab, setActiveTab] = useState<TabName>("all");
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const { data, isLoading } = useQuery({
    queryKey: [
      "appointments",
      activeTab,
      pagination.pageIndex,
      pagination.pageSize,
      search,
    ],
    queryFn: () =>
      fetchAppointments(supabase, {
        page: pagination.pageIndex,
        pageSize: pagination.pageSize,
        status: activeTab,
        search: search,
      }),
    placeholderData: keepPreviousData,
  });

  const appointmentData = data?.data || [];
  const totalCount = data?.count || 0;

  const tabsList: TabName[] = ["all", ...APPOINTMENT_STATUSES];

  return (
    <div>
      <div className="mb-10 flex w-full items-center gap-5 rounded-2xl border bg-white p-5">
        <Info strokeWidth={1.25} />
        <div className="flex-1">
          <p className="font-medium">Data Privacy Act and Confidentiality Clause</p>
          <p className="text-sm ">Counseling appointment data is obfuscated to protect client privacy and comply with confidentiality regulations.</p>
        </div>
      </div>
      <DataTable
        columns={appointmentColumns}
        data={appointmentData}
        isLoading={isLoading}
        rowCount={totalCount}
        pagination={pagination}
        onPaginationChange={setPagination}
        onSearchChange={(val) => {
          setSearch(val);
          setPagination((p) => ({ ...p, pageIndex: 0 }));
        }}
        toolbarExtra={
          <Tabs
            value={activeTab}
            onValueChange={(v) => {
              setActiveTab(v as TabName);
              setPagination((p) => ({ ...p, pageIndex: 0 }));
            }}
          >
            <TabsList>
              {tabsList.map((tab) => (
                <TabsTrigger key={tab} value={tab} className="capitalize">
                  {tab}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        }
      />
    </div>
  );
}
