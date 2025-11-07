"use client";

import { SupabaseClient } from "@supabase/supabase-js";
import { DataTable } from "../_components/data-table";
import { appointmentColumns } from "./_components/appointment-column";
import { createClient } from "@/utils/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchAllAppointments, fetchApprovedAppointments, fetchPendingAppointments } from "./actions";

async function fetchCompletedAppointments(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("appointment_with_details")
    .select(`*`)
    .eq("status", "completed");

  if (error) throw error;
  return data || [];
}

type TabName = "all" | "pending" | "approved" | "done";

export default function AppointmentPage() {
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState<TabName>("all");

  const { data: allData = [], isLoading: isAllLoading } = useQuery({
    queryKey: ["appointments", "all"],
    queryFn: () => fetchAllAppointments(supabase),
  });

  const { data: pendingData = [], isLoading: isPendingLoading } = useQuery({
    queryKey: ["appointments", "pending"],
    queryFn: () => fetchPendingAppointments(supabase),
  });

  const { data: approvedData = [], isLoading: isApprovedLoading } = useQuery({
    queryKey: ["appointments", "approved"],
    queryFn: () => fetchApprovedAppointments(supabase),
  });

  const { data: completedData = [], isLoading: isCompletedLoading } = useQuery({
    queryKey: ["appointments", "completed"],
    queryFn: () => fetchCompletedAppointments(supabase),
  });

  const tabs = {
    all: {
      name: "all" as const,
      data: allData,
      columns: appointmentColumns,
      isLoading: isAllLoading,
      rowUrl: (id : string) => `/admin/appointments/@modal/${id}`,
    },
    pending: {
      name: "pending" as const,
      data: pendingData,
      columns: appointmentColumns,
      isLoading: isPendingLoading,
      rowUrl: (id : string) => `/admin/appointment/@modal/${id}`,
    },
    approved: {
      name: "approved" as const,
      data: approvedData,
      columns: appointmentColumns,
      isLoading: isApprovedLoading,
      rowUrl: (id : string) => `/admin/appointment/@modal/${id}`,
    },
    done: {
      name: "done" as const,
      data: completedData,
      columns: appointmentColumns,
      isLoading: isCompletedLoading,
      rowUrl: (id : string) => `/admin/appointment/@modal/${id}`,
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
