import type { Metadata } from "next";
import { guardPage } from "@/lib/auth/session";
import { createClient } from "@/utils/supabase/server";
import { formatAppointmentDate } from "@/lib/format";
import { PageTransition } from "@/components/motion/primitives";
import {
  DailyCheckingView,
  type DailyScheduleItem,
} from "./_components/daily-checking-view";

export const metadata: Metadata = { title: "Daily Checking" };

export default async function CounselorPage() {
  const viewer = await guardPage("counselor");
  const supabase = await createClient();

  const [
    { data: appointments },
    { data: rawStudents },
    { data: rawCounselors },
  ] = await Promise.all([
    supabase
      .from("appointment_with_details")
      .select(
        "id, student_id, first_student_name, last_student_name, student_university_id, scheduled_at, status, reason",
      )
      .eq("counselor_id", viewer.profileId)
      .order("scheduled_at", { ascending: false })
      .limit(25),
    supabase
      .from("student_with_details")
      .select(
        "id, first_name, last_name, university_id, department, year_level, emotional_status",
      )
      .order("last_name", { ascending: true })
      .limit(60),
    supabase
      .from("counselor")
      .select("id, first_name, last_name")
      .neq("id", viewer.profileId)
      .limit(20),
  ]);

  const studentMap = new Map(
    (rawStudents ?? [])
      .filter((s): s is typeof s & { id: string } => Boolean(s.id))
      .map((s) => [s.id, s]),
  );

  const items: DailyScheduleItem[] = (appointments ?? [])
    .filter(
      (a): a is typeof a & { id: string; student_id: string } =>
        Boolean(a.id) && Boolean(a.student_id),
    )
    .map((a) => {
      const stu = studentMap.get(a.student_id);
      const dept = stu?.department ?? "Student";
      const yr = stu?.year_level ? `Year ${stu.year_level}` : "";
      const fullName =
        `${a.first_student_name ?? ""} ${a.last_student_name ?? ""}`.trim() ||
        "Student";
      return {
        id: a.id,
        studentId: a.student_id,
        studentName: fullName,
        studentUniversityId:
          (stu?.university_id ?? a.student_university_id)
            ? String(stu?.university_id ?? a.student_university_id)
            : "—",
        courseAndYear: yr ? `${dept}, ${yr}` : dept,
        department: dept,
        yearLevel: stu?.year_level ?? null,
        emotionalStatus: stu?.emotional_status ?? null,
        scheduledLabel: a.scheduled_at
          ? formatAppointmentDate(a.scheduled_at)
          : "Unscheduled",
        reason: a.reason ?? "General counseling consultation",
        status: a.status ?? "pending",
      };
    });

  const counts = {
    waiting: items.filter((i) => i.status === "pending").length,
    upcoming: items.filter((i) => i.status === "approved").length,
    completed: items.filter((i) => i.status === "completed").length,
  };

  const students = (rawStudents ?? [])
    .filter((s): s is typeof s & { id: string } => Boolean(s.id))
    .map((s) => ({
      id: s.id,
      name: `${s.first_name ?? ""} ${s.last_name ?? ""}`.trim() || "Student",
    }));

  const colleagues = (rawCounselors ?? []).map((c) => ({
    id: c.id,
    name: `${c.first_name ?? ""} ${c.last_name ?? ""}`.trim() || "Counselor",
  }));

  const counselorName = `${viewer.firstName} ${viewer.lastName}`.trim();

  return (
    <PageTransition>
      <DailyCheckingView
        counselorName={counselorName}
        counts={counts}
        items={items}
        students={students}
        colleagues={colleagues}
      />
    </PageTransition>
  );
}
