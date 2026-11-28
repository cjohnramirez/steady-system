import type { Metadata } from "next";
import { createClient } from "@/utils/supabase/server";
import { guardPage } from "@/lib/auth/session";
import { PageHeader } from "@/components/app/page-header";
import { PageTransition } from "@/components/motion/primitives";
import { ProposeBookingTrigger } from "../_components/propose-booking-trigger";
import AppointmentList from "../_components/appointment-list";

export const metadata: Metadata = {
  title: "Appointments & Student Requests",
};

function formatOrdinalYear(year?: number | null): string {
  if (!year) return "";
  const suffixes: Record<number, string> = { 1: "st", 2: "nd", 3: "rd" };
  return `${year}${suffixes[year] ?? "th"} Year`;
}

export default async function CounselorAppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ student?: string; sort?: string }>;
}) {
  const [viewer, { student: initialStudentName, sort: initialSort }] =
    await Promise.all([guardPage("counselor"), searchParams]);
  const supabase = await createClient();

  const { data: studentRows } = await supabase
    .from("student_with_details")
    .select("id, first_name, last_name, department, year_level")
    .order("last_name", { ascending: true })
    .limit(100);

  const students = (studentRows ?? [])
    .filter((s): s is typeof s & { id: string } => Boolean(s.id))
    .map((s) => ({
      id: s.id,
      name: `${s.first_name ?? ""} ${s.last_name ?? ""}`.trim() || "Student",
    }));

  const studentCourseMap: Record<string, string> = {};
  for (const s of studentRows ?? []) {
    if (!s.id) continue;
    const yearStr = formatOrdinalYear(s.year_level);
    studentCourseMap[s.id] = [s.department, yearStr].filter(Boolean).join(", ");
  }

  const counselorName =
    `${viewer.firstName} ${viewer.lastName}`.trim() || viewer.userName;

  return (
    <PageTransition className="flex flex-col gap-6">
      <PageHeader
        title="Appointments & Student Requests"
        description="Search by student name or reason, filter by status, and confirm or reschedule bookings"
        actions={
          <ProposeBookingTrigger
            counselorName={counselorName}
            students={students}
          />
        }
      />
      <AppointmentList
        key={`${initialStudentName ?? ""}:${initialSort ?? ""}`}
        studentCourseMap={studentCourseMap}
        studentNames={students.map((s) => s.name)}
        initialStudentName={initialStudentName?.slice(0, 100)}
        initialSort={
          initialSort === "name" ||
          initialSort === "date_desc" ||
          initialSort === "date_asc" ||
          initialSort === "status"
            ? initialSort
            : "date_desc"
        }
      />
    </PageTransition>
  );
}
