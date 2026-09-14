import type { Metadata } from "next";
import { PageHeader } from "@/components/app/page-header";
import DashboardView from "./_components/dashboard-view";

export const metadata: Metadata = { title: "Dashboard | GCS Admin" };

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Dashboard"
        description="How the service is being used, on Manila time."
      />
      <DashboardView />
    </div>
  );
}
