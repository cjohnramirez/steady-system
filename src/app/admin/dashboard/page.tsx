import type { Metadata } from "next";
import { createClient } from "@/utils/supabase/server";
import { guardPage } from "@/lib/auth/session";
import { PageHeader } from "@/components/app/page-header";
import { PageTransition } from "@/components/motion/primitives";
import DashboardView, {
  type CollegeCaseloadItem,
  type CounselorCapacityItem,
} from "./_components/dashboard-view";

export const metadata: Metadata = { title: "Executive Guidance Dashboard" };

export default async function DashboardPage() {
  await guardPage("admin");
  const supabase = await createClient();

  const [{ data: students }, { data: counselors }, { data: appointments }] =
    await Promise.all([
      supabase.from("student_with_details").select("id, department").limit(500),
      supabase
        .from("counselor_with_details")
        .select("*")
        .order("last_name", { ascending: true })
        .limit(50),
      supabase
        .from("appointment_with_details")
        .select("id, student_id, counselor_id, status")
        .limit(1000),
    ]);

  const studentDeptMap = new Map<string, string>();
  for (const s of students ?? []) {
    if (s.id) {
      studentDeptMap.set(
        s.id,
        s.department?.trim() || "General Academic College",
      );
    }
  }

  const collegeCounts = new Map<string, number>();
  const counselorActiveCounts = new Map<string, number>();

  for (const apt of appointments ?? []) {
    const dept =
      (apt.student_id && studentDeptMap.get(apt.student_id)) ||
      "General Academic College";
    collegeCounts.set(dept, (collegeCounts.get(dept) ?? 0) + 1);

    if (
      apt.counselor_id &&
      (apt.status === "pending" || apt.status === "approved")
    ) {
      counselorActiveCounts.set(
        apt.counselor_id,
        (counselorActiveCounts.get(apt.counselor_id) ?? 0) + 1,
      );
    }
  }

  // Fallback to student distribution by college if no appointments exist yet
  if (collegeCounts.size === 0) {
    for (const dept of studentDeptMap.values()) {
      collegeCounts.set(dept, (collegeCounts.get(dept) ?? 0) + 1);
    }
  }

  const collegeCaseload: CollegeCaseloadItem[] = Array.from(
    collegeCounts.entries(),
  )
    .map(([college, count]) => ({ college, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  const counselorCapacity: CounselorCapacityItem[] = (counselors ?? [])
    .filter((c): c is typeof c & { id: string } => Boolean(c.id))
    .map((c) => {
      const name =
        `${c.first_name ?? ""} ${c.last_name ?? ""}`.trim() || "Counselor";
      const activeClients = counselorActiveCounts.get(c.id) ?? 0;
      const status: CounselorCapacityItem["status"] =
        activeClients >= 25
          ? "Overloaded"
          : activeClients >= 20
            ? "Moderate"
            : activeClients >= 15
              ? "Balanced"
              : "Low";
      return {
        id: c.id,
        name,
        department: c.department?.trim() || "All Colleges",
        avatarUrl: c.avatar,
        activeClients,
        status,
        counselor: c,
      };
    })
    .sort((a, b) => b.activeClients - a.activeClients);

  return (
    <PageTransition className="flex flex-col gap-7">
      <PageHeader
        title="Executive Guidance Dashboard"
        description="University-wide student engagement, caseload velocity, and clinical urgency trends"
      />
      <DashboardView
        collegeCaseload={collegeCaseload}
        counselorCapacity={counselorCapacity}
      />
    </PageTransition>
  );
}
