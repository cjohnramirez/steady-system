"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/app/admin/_components/data-table";
import { createClient } from "@/utils/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { studentColumn } from "./_components/student-column";

import { counselorColumn } from "./_components/counselor-column";
import { fetchCounselors, fetchStudents } from "./actions";

type TabName = "students" | "counselors";

export default function AccountsPage() {
  const supabase = createClient();

  const [activeTab, setActiveTab] = useState<TabName>("students");

  const { data: students = [], isLoading: isStudentsLoading } = useQuery({
    queryKey: ["students"],
    queryFn: () => fetchStudents(supabase),
  });

  const { data: counselors = [], isLoading: isCounselorsLoading } = useQuery({
    queryKey: ["counselors"],
    queryFn: () => fetchCounselors(supabase),
  });

  const tabs = {
    students: {
      name: "students" as const,
      data: students,
      columns: studentColumn,
      isLoading: isStudentsLoading,
      rowUrl: (id: string) => `/admin/accounts/student/${id}`,
    },
    counselors: {
      name: "counselors" as const,
      data: counselors,
      columns: counselorColumn,
      isLoading: isCounselorsLoading,
      rowUrl: (id: string) => `/admin/accounts/counselor/${id}`,
    },
  };

  const active = tabs[activeTab];

  return (
    <>
      <DataTable
        isLoading={active.isLoading}
        columns={active.columns}
        data={active.data}
        searchQuery="first_name"
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
    </>
  );
}
