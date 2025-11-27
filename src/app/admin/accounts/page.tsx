"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/app/admin/_components/data-table";
import { createClient } from "@/utils/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { studentColumn } from "./_components/student-column";

import { counselorColumn } from "./_components/counselor-column";
import { fetchCounselors, fetchStudents } from "./actions";
import { PaginationState } from "@tanstack/react-table";

type TabName = "students" | "counselors";

export default function AccountsPage() {
  const supabase = createClient();

  const [activeTab, setActiveTab] = useState<TabName>("students");
  const [search, setSearch] = useState("");
    const [pagination, setPagination] = useState<PaginationState>({
      pageIndex: 0,
      pageSize: 10,
    });

  const { data: students, isLoading: isStudentsLoading } = useQuery({
    queryKey: ["students", activeTab, pagination.pageIndex, pagination.pageSize, search],
    queryFn: () => fetchStudents(supabase, {
        page: pagination.pageIndex,
        pageSize: pagination.pageSize,
        status: activeTab,
        search: search,
      }),
  });

  const { data: counselors, isLoading: isCounselorsLoading } = useQuery({
    queryKey: ["counselors", activeTab, pagination.pageIndex, pagination.pageSize, search],
    queryFn: () => fetchCounselors(supabase, {
        page: pagination.pageIndex,
        pageSize: pagination.pageSize,
        status: activeTab,
        search: search,
      }),
  });

  const studentsData = students?.data || [];
  const totalStudents = students?.count || 0;

  console.log(studentsData)

  const counselorsData = counselors?.data || [];
  const totalCounselors = counselors?.count || 0;

  const tabs = {
    students: {
      name: "students",
      data: studentsData,
      count: totalStudents,
      columns: studentColumn,
      isLoading: isStudentsLoading,
      rowUrl: (id: string) => `/admin/accounts/student/${id}`,
    },
    counselors: {
      name: "counselors",
      data: counselorsData,
      count: totalCounselors,
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
        rowCount={active.count}
        pagination={pagination}
        onPaginationChange={setPagination}
        onSearchChange={(val) => {
            setSearch(val);
            setPagination(p => ({ ...p, pageIndex: 0 })); 
        }}
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
