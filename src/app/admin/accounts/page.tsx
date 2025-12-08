"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/app/admin/_components/data-table";
import { createClient } from "@/utils/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { studentColumn } from "./_components/student-column";

import { counselorColumn } from "./_components/counselor-column";
import { AccountType, fetchCounselors, fetchStudents } from "./actions";
import { PaginationState } from "@tanstack/react-table";
import { Download, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import ExportModal from "./_components/export-modal";
import AddCounselorModal from "./_components/add-counselor-modal";

type TabName = "students" | "counselors";

export default function AccountsPage() {
  const supabase = createClient();

  const [activeTab, setActiveTab] = useState<TabName>("students");
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const [openExport, setOpenExport] = useState(false);
  const [openAddCounselorAccount, setOpenAddCounselorAccount] = useState(false);
  const [openAddStudentAccount, setOpenAddStudentAccount] = useState(false);

  const { data: students, isLoading: isStudentsLoading } = useQuery({
    queryKey: [
      "students",
      activeTab,
      pagination.pageIndex,
      pagination.pageSize,
      search,
    ],
    queryFn: () =>
      fetchStudents(supabase, {
        page: pagination.pageIndex,
        pageSize: pagination.pageSize,
        status: activeTab,
        search: search,
      }),
  });

  const { data: counselors, isLoading: isCounselorsLoading } = useQuery({
    queryKey: [
      "counselors",
      activeTab,
      pagination.pageIndex,
      pagination.pageSize,
      search,
    ],
    queryFn: () =>
      fetchCounselors(supabase, {
        page: pagination.pageIndex,
        pageSize: pagination.pageSize,
        status: activeTab,
        search: search,
      }),
  });

  const studentsData = students?.data || [];
  const totalStudents = students?.count || 0;

  const counselorsData = counselors?.data || [];
  const totalCounselors = counselors?.count || 0;

  const tabs = {
    students: {
      name: "students" as AccountType,
      data: studentsData,
      count: totalStudents,
      columns: studentColumn,
      isLoading: isStudentsLoading,
      rowUrl: (id: string) => `/admin/accounts/student/${id}`,
    },
    counselors: {
      name: "counselors" as AccountType,
      data: counselorsData,
      count: totalCounselors,
      columns: counselorColumn,
      isLoading: isCounselorsLoading,
      rowUrl: (id: string) => `/admin/accounts/counselor/${id}`,
    },
  };

  const active = tabs[activeTab];

  console.log(active.data)

  return (
    <>
      {openExport && (
        <ExportModal
          open={openExport}
          setOpen={setOpenExport}
          defaultAccountType={active.name}
        />
      )}
      {openAddCounselorAccount && (
        <AddCounselorModal
          open={openAddCounselorAccount}
          setOpen={setOpenAddCounselorAccount}
        />
      )}
      <div className="mb-10 flex w-full items-center gap-5 rounded-2xl border bg-white p-5">
        <Download strokeWidth={1.25} />
        <div className="flex-1">
          <p className="font-medium">Export Accounts</p>
          <p className="text-sm">
            Download a CSV file of all {activeTab} accounts for reporting or
            backup purposes.
          </p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => setOpenExport(true)}>
            <Download />
            Export
          </Button>
          {active.name === "counselors" && (
            <Button
              variant="outline"
              onClick={() => {
                setOpenAddCounselorAccount(true);
              }}
            >
              <Plus />
              Add Counselor Account
            </Button>
          )}
        </div>
      </div>
      <DataTable
        isLoading={active.isLoading}
        columns={active.columns}
        data={active.data}
        rowUrl={active.rowUrl}
        rowCount={active.count}
        pagination={pagination}
        onPaginationChange={setPagination}
        onSearchChange={(val) => {
          setSearch(val);
          setPagination((p) => ({ ...p, pageIndex: 0 }));
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
