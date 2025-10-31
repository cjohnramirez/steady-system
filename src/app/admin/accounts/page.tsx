"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/app/admin/_components/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { createClient } from "@/utils/supabase/client";
import { SupabaseClient } from "@supabase/supabase-js";
import { useQuery } from "@tanstack/react-query";

import { studentColumn } from "./_components/student-column";
import { adminColumn } from "./_components/admin-column";
import { counselorColumn } from "./_components/counselor-column";

async function fetchStudents(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("student_with_details")
    .select(`*`);

  if (error) throw error;
  return data || [];
}

async function fetchAdmins(supabase: SupabaseClient) {
  const { data, error } = await supabase.from("admin").select(`*`);

  if (error) throw error;
  return data || [];
}

async function fetchCounselors(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("counselor_with_details")
    .select(`*`);
  if (error) throw error;
  return data || [];
}

type TabName = "students" | "admins" | "counselors";

export default function AccountsPage() {
  const supabase = createClient();

  const [activeTab, setActiveTab] = useState<TabName>("students");

  const { data: students = [] } = useQuery({
    queryKey: ["students"],
    queryFn: () => fetchStudents(supabase),
  });

  const { data: admins = [] } = useQuery({
    queryKey: ["admins"],
    queryFn: () => fetchAdmins(supabase),
  });

  const { data: counselors = [] } = useQuery({
    queryKey: ["counselors"],
    queryFn: () => fetchCounselors(supabase),
  });

  const tabs = {
    students: {
      name: "students" as const,
      data: students,
      columns: studentColumn,
    },
    admins: { name: "admins" as const, data: admins, columns: adminColumn },
    counselors: {
      name: "counselors" as const,
      data: counselors,
      columns: counselorColumn,
    },
  };

  const active = tabs[activeTab];

  return (
    <div>
      <DataTable
        columns={active.columns}
        data={active.data}
        searchQuery="first_name"
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
