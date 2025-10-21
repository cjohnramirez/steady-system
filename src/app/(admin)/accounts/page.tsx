"use client";

import { useState } from "react";
import { studentColumn } from "./student-column";
import { adminColumn } from "./admin-column";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StudentsData } from "@/lib/data/students-data";
import { AdminsData } from "@/lib/data/admin-data";
import { DataTable } from "@/components/data-table";
import type { ColumnDef } from "@tanstack/react-table";
import { Admin, Counselor, Student } from "@/lib/types/users";
import { CounselorsData } from "@/lib/data/counselors-data";
import { counselorColumn } from "./counselor-column";

type TabConfig =
  | {
      name: "students";
      data: typeof StudentsData;
      columns: ColumnDef<Student, unknown>[];
    }
  | {
      name: "admins";
      data: typeof AdminsData;
      columns: ColumnDef<Admin, unknown>[];
    }
  | {
      name: "counselors";
      data: typeof CounselorsData;
      columns: ColumnDef<Counselor, unknown>[];
    };

export default function AccountsPage() {
  const [activeTab, setActiveTab] = useState<TabConfig["name"]>("students");

  const tabs: TabConfig[] = [
    { name: "students", data: StudentsData, columns: studentColumn },
    { name: "admins", data: AdminsData, columns: adminColumn },
    { name: "counselors", data: CounselorsData, columns: counselorColumn },
  ];

  const active = tabs.find((t) => t.name === activeTab)!;

  return (
    <div>
      <DataTable
        columns={active.columns as ColumnDef<any, unknown>[]}
        data={active.data as any}
        searchQuery="firstName"
        toolbarExtra={
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as TabConfig["name"])}
          >
            <TabsList>
              {tabs.map((tab) => (
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
