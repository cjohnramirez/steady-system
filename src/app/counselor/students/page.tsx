import type { Metadata } from "next";
import { createClient } from "@/utils/supabase/server";
import { PageHeader } from "@/components/app/page-header";
import { PageTransition } from "@/components/motion/primitives";
import { StudentDossierGrid } from "./_components/student-dossier-grid";
import type { StudentDossierRecord } from "@/components/counselor/dossier-dialog";

export const metadata: Metadata = {
  title: "Student Directory",
};

export default async function CounselorStudentsPage() {
  const supabase = await createClient();
  const [{ data: students }, { data: actionItems }, { data: appointments }] =
    await Promise.all([
      supabase
        .from("student_with_details")
        .select(
          "id, first_name, last_name, email, university_id, year_level, department, emotional_status",
        )
        .order("last_name", { ascending: true })
        .limit(60),
      supabase
        .from("action_item")
        .select("id, student_id, title, is_completed, due_date")
        .order("created_at", { ascending: false })
        .limit(200),
      supabase
        .from("appointment")
        .select("student_id, reason, scheduled_at, status")
        .order("scheduled_at", { ascending: false })
        .limit(300),
    ]);

  const itemsByStudent = new Map<
    string,
    NonNullable<StudentDossierRecord["actionItems"]>
  >();
  for (const item of actionItems ?? []) {
    const list = itemsByStudent.get(item.student_id) ?? [];
    list.push({
      id: item.id,
      title: item.title,
      is_completed: item.is_completed,
      due_date: item.due_date,
    });
    itemsByStudent.set(item.student_id, list);
  }

  const apptMetaByStudent = new Map<
    string,
    {
      total: number;
      completed: number;
      latestReason: string | null;
      latestDate: string | null;
    }
  >();
  for (const appt of appointments ?? []) {
    if (!appt.student_id) continue;
    const prev = apptMetaByStudent.get(appt.student_id) ?? {
      total: 0,
      completed: 0,
      latestReason: null,
      latestDate: null,
    };
    prev.total += 1;
    if (appt.status === "completed") prev.completed += 1;
    if (!prev.latestReason && appt.reason) prev.latestReason = appt.reason;
    if (!prev.latestDate && appt.scheduled_at)
      prev.latestDate = appt.scheduled_at;
    apptMetaByStudent.set(appt.student_id, prev);
  }

  const records: (StudentDossierRecord & { lastVisited?: string | null })[] = (
    students ?? []
  )
    .filter((s): s is typeof s & { id: string } => Boolean(s.id))
    .map((s) => {
      const meta = apptMetaByStudent.get(s.id);
      return {
        id: s.id,
        name: `${s.first_name ?? ""} ${s.last_name ?? ""}`.trim() || "Student",
        email: s.email,
        universityId: s.university_id,
        department: s.department,
        yearLevel: s.year_level,
        emotionalStatus: s.emotional_status,
        primaryReason: meta?.latestReason ?? "General Wellness Check-In",
        totalSessions: meta?.total ?? 0,
        completedSessions: meta?.completed ?? 0,
        lastVisited: meta?.latestDate
          ? new Date(meta.latestDate).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : "No visits yet",
        actionItems: itemsByStudent.get(s.id) ?? [],
      };
    });

  return (
    <PageTransition className="flex flex-col gap-6">
      <PageHeader
        title="Student Directory"
        description="Confidential records for students, including session history, emergency contacts, and presenting concerns"
      />
      <StudentDossierGrid students={records} />
    </PageTransition>
  );
}
