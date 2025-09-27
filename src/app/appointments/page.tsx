"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { appointmentsData } from "@/lib/data/appointments-data";

export default function AppointmentPage() {
  return (
    <div>
      <Tabs defaultValue="pending">
        <div>
          <TabsList>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
        </div>
        <DataTable columns={columns} data={appointmentsData}></DataTable>
      </Tabs>
    </div>
  );
}
