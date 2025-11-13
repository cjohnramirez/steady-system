"use client";

import { DataTable } from "../_components/data-table";
import { appointmentColumns } from "./_components/appointment-column";
import { createClient } from "@/utils/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchAllAppointments } from "./actions";

type TabName = "all" | "pending" | "approved" | "completed" | "cancelled";

export default function AppointmentPage() {
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState<TabName>("all");

  const { data: allData = [], isLoading: isAllLoading } = useQuery({
    queryKey: ["appointments", "all"],
    queryFn: () => fetchAllAppointments(supabase),
  });

  const tabs = {
    all: {
      name: "all" as const,
      data: allData,
      columns: appointmentColumns,
      isLoading: isAllLoading,
      rowUrl: (id : string) => `/admin/appointments/${id}`,
    },
    pending: {
      name: "pending" as const,
      data: allData.filter((a) => a.status === "pending"),
      columns: appointmentColumns,
      isLoading: isAllLoading,
      rowUrl: (id : string) => `/admin/appointments/${id}`,
    },
    approved: {
      name: "approved" as const,
      data: allData.filter((a) => a.status === "approved"),
      columns: appointmentColumns,
      isLoading: isAllLoading,
      rowUrl: (id : string) => `/admin/appointments/${id}`,
    },
    completed: {
      name: "completed" as const,
      data: allData.filter((a) => a.status === "completed"),
      columns: appointmentColumns,
      isLoading: isAllLoading,
      rowUrl: (id : string) => `/admin/appointments/${id}`,
    },
    cancelled: {
      name: "cancelled" as const,
      data: allData.filter((a) => a.status === "cancelled"),
      columns: appointmentColumns,
      isLoading: isAllLoading,
      rowUrl: (id : string) => `/admin/appointments/${id}`,
    },
  };

  const active = tabs[activeTab];

  return (
    <div>
      <DataTable
        columns={active.columns}
        data={active.data}
        searchQuery="last_student_name"
        isLoading={active.isLoading}
        rowUrl={active.rowUrl}
        toolbarExtra={
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as TabName)}
          >
            <TabsList>
              {Object.values(tabs).map((tab) => (
                <TabsTrigger key={tab.name} value={tab.name}>
                  {tab.name.charAt(0).toUpperCase() + tab.name.slice(1)}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        }
      />
    </div>
  );
}
