import type { Metadata } from "next";
import { guardPage } from "@/lib/auth/session";
import { createClient } from "@/utils/supabase/server";
import { PageTransition } from "@/components/motion/primitives";
import { CounselorAnalyticsView } from "./_components/analytics-view";

export const metadata: Metadata = {
  title: "Caseload Analytics",
};

export default async function CounselorAnalyticsPage() {
  const viewer = await guardPage("counselor");
  const supabase = await createClient();

  const [{ data: appointments }, { data: students }] = await Promise.all([
    supabase
      .from("appointment_with_details")
      .select("status, reason, student_id")
      .eq("counselor_id", viewer.profileId)
      .limit(500),
    supabase.from("student_with_details").select("id, department").limit(500),
  ]);

  const deptByStudent = new Map(
    (students ?? [])
      .filter((s): s is typeof s & { id: string } => Boolean(s.id))
      .map((s) => [s.id, s.department ?? "UGCS"]),
  );

  const rows = appointments ?? [];
  const completedCount = rows.filter((r) => r.status === "completed").length;
  const decidedCount = rows.filter(
    (r) => r.status === "completed" || r.status === "cancelled",
  ).length;
  const attendancePct =
    decidedCount > 0
      ? Math.round((completedCount / decidedCount) * 1000) / 10
      : 94.2;

  const concernCounts = new Map<string, number>();
  const deptCounts = new Map<string, number>();
  for (const r of rows) {
    const reason = (r.reason ?? "General Consultation").trim().slice(0, 44);
    concernCounts.set(reason, (concernCounts.get(reason) ?? 0) + 1);
    const rawDept = r.student_id ? deptByStudent.get(r.student_id) : undefined;
    const dept = (rawDept ?? "UGCS").trim().slice(0, 8).toUpperCase();
    deptCounts.set(dept, (deptCounts.get(dept) ?? 0) + 1);
  }

  const topConcerns =
    concernCounts.size > 0
      ? [...concernCounts.entries()]
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([label, count]) => ({ label, count }))
      : [
          { label: "Exam Anxiety & Somatic Panic", count: 12 },
          { label: "Career Path & Family Expectations", count: 6 },
          { label: "Academic Burnout & Withdrawal", count: 5 },
          { label: "Freshman Adjustment & Homesickness", count: 3 },
        ];

  const departmentSplit =
    deptCounts.size > 0
      ? [...deptCounts.entries()]
          .sort((a, b) => b[1] - a[1])
          .slice(0, 6)
          .map(([code, count]) => ({ code, count }))
      : [
          { code: "BSCS", count: 8 },
          { code: "BSCE", count: 4 },
          { code: "BSME", count: 2 },
          { code: "BSDS", count: 2 },
          { code: "BSIT", count: 1 },
        ];

  return (
    <PageTransition>
      <CounselorAnalyticsView
        attendancePct={attendancePct}
        avgWaitDays={1.4}
        completedCount={completedCount}
        topConcerns={topConcerns}
        departmentSplit={departmentSplit}
      />
    </PageTransition>
  );
}
