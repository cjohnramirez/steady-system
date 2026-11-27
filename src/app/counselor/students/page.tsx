import type { Metadata } from "next";
import { Users } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { PageHeader } from "@/components/app/page-header";
import { SectionCard } from "@/components/app/section-card";
import { EmptyState } from "@/components/app/empty-state";
import { PageTransition } from "@/components/motion/primitives";
import { StudentDossierGrid } from "./_components/student-dossier-grid";
import type { StudentDossierRecord } from "@/components/counselor/dossier-dialog";

export const metadata: Metadata = {
  title: "Student Dossier",
};

export default async function CounselorStudentsPage() {
  const supabase = await createClient();
  const [{ data: students }, { data: actionItems }] = await Promise.all([
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

  const records: StudentDossierRecord[] = (students ?? [])
    .filter((s): s is typeof s & { id: string } => Boolean(s.id))
    .map((s) => ({
      id: s.id,
      name: `${s.first_name ?? ""} ${s.last_name ?? ""}`.trim() || "Student",
      email: s.email,
      universityId: s.university_id,
      department: s.department,
      yearLevel: s.year_level,
      emotionalStatus: s.emotional_status,
      actionItems: itemsByStudent.get(s.id) ?? [],
    }));

  return (
    <PageTransition className="flex flex-col gap-6">
      <PageHeader
        title="Student Dossier & Caseload"
        description="Click any student to view their dossier and assign follow-up action steps. Press P anytime for Desk Privacy."
      />

      <SectionCard
        title="Assigned Department Students"
        description={`${records.length} students visible under your counselor scope.`}
      >
        {records.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No students in your departments yet"
            description="Once students register under your assigned departments, their profiles will appear here."
          />
        ) : (
          <StudentDossierGrid students={records} />
        )}
      </SectionCard>
    </PageTransition>
  );
}
