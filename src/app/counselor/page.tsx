import type { Metadata } from "next";
import { PageHeader } from "@/components/app/page-header";
import { guardPage } from "@/lib/auth/session";
import { createClient } from "@/utils/supabase/server";
import MetricSection from "./_components/metric-section";
import ProfileCard from "./_components/profile-card";
import AppointmentList from "./_components/appointment-list";
import { ProposeBookingTrigger } from "./_components/propose-booking-trigger";

export const metadata: Metadata = { title: "Counselor dashboard" };

export default async function CounselorPage() {
  const viewer = await guardPage("counselor");
  const supabase = await createClient();
  const { data: rawStudents } = await supabase
    .from("student_with_details")
    .select("id, first_name, last_name")
    .order("last_name", { ascending: true })
    .limit(50);

  const students = (rawStudents ?? [])
    .filter((s): s is typeof s & { id: string } => Boolean(s.id))
    .map((s) => ({
      id: s.id,
      name: `${s.first_name ?? ""} ${s.last_name ?? ""}`.trim() || "Student",
    }));

  const counselorName = `${viewer.firstName} ${viewer.lastName}`.trim();

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      <PageHeader
        title={`Welcome, ${viewer.firstName}`}
        description="Requests waiting on you, your schedule and your profile."
        actions={
          <ProposeBookingTrigger
            counselorName={counselorName}
            students={students}
          />
        }
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
