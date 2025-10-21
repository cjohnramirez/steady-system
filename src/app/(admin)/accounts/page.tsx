"use client";

import { useState } from "react";
import { studentColumn } from "./student-column";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StudentsData } from "@/lib/data/students-data";
import { AdminsData } from "@/lib/data/admin-data";
import { CounselorsData } from "@/lib/data/counselors-data";
import { DataTable } from "@/components/data-table";

export default function AccountsPage() {
  const [activeTab, setActiveTab] = useState("students");

  const getData = () => {
    switch (activeTab) {
      case "students":
        return StudentsData;
      case "admins":
        return AdminsData;
      case "counselors":
        return CounselorsData;
      default:
        return [];
    }
  };

  return (
    <div className="p-8">
      <DataTable
        columns={studentColumn}
        data={StudentsData}
        searchQuery="firstName"
        toolbarExtra={
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="students">Students</TabsTrigger>
              <TabsTrigger value="admins">Admins</TabsTrigger>
              <TabsTrigger value="counselors">Counselors</TabsTrigger>
            </TabsList>
          </Tabs>
        }
      />
    </div>
  );
}
