import type { Metadata } from "next";
import { PageHeader } from "@/components/app/page-header";
import { guardPage } from "@/lib/auth/session";
import MetricSection from "./_components/metric-section";
import ProfileCard from "./_components/profile-card";
import AppointmentList from "./_components/appointment-list";

export const metadata: Metadata = { title: "Counselor dashboard | GCS" };

export default async function CounselorPage() {
  const viewer = await guardPage("counselor");

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      <PageHeader
        title={`Welcome, ${viewer.firstName}`}
        description="Requests waiting on you, your schedule and your profile."
      />
      <div className="grid items-start gap-4 md:gap-6 lg:grid-cols-[2fr_3fr]">
        <div className="flex flex-col gap-4 md:gap-6">
          <MetricSection />
          <ProfileCard />
        </div>
        <AppointmentList />
      </div>
    </div>
  );
}
