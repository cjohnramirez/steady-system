import type { Metadata } from "next";
import { Users } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { PageHeader } from "@/components/app/page-header";
import { SectionCard } from "@/components/app/section-card";
import { EmptyState } from "@/components/app/empty-state";
import { UserAvatar } from "@/components/app/user-avatar";
import { PageTransition } from "@/components/motion/primitives";

export const metadata: Metadata = {
  title: "Student Dossier",
};

export default async function CounselorStudentsPage() {
  const supabase = await createClient();
  const { data: students } = await supabase
    .from("student_with_details")
    .select(
      "id, first_name, last_name, email, university_id, year_level, department, emotional_status",
    )
    .order("last_name", { ascending: true })
    .limit(60);

  return (
    <PageTransition className="flex flex-col gap-6">
      <PageHeader
        title="Student Dossier & Caseload"
        description="Students enrolled in your assigned academic departments. Press P anytime to activate Desk Privacy."
      />

      <SectionCard
        title="Assigned Department Students"
        description={`${students?.length ?? 0} students visible under your counselor scope.`}
      >
        {!students || students.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No students in your departments yet"
            description="Once students register under your assigned departments, their profiles will appear here."
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {students.map((s) => {
              const name = `${s.first_name ?? ""} ${s.last_name ?? ""}`.trim();
              return (
                <div
                  key={s.id}
                  className="bg-muted/60 border-border flex items-start gap-3.5 rounded-[18px] border p-4"
                >
                  <UserAvatar
                    name={name || "Student"}
                    className="size-11 shrink-0 rounded-[12px]"
                  />
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="privacy-sensitive truncate font-medium">
                      {name || "Unnamed Student"}
                    </p>
                    <p className="text-muted-foreground privacy-sensitive truncate text-xs">
                      {s.university_id} • {s.department ?? "Department"} • Year{" "}
                      {s.year_level ?? "—"}
                    </p>
                    {s.emotional_status && (
                      <span className="bg-brand-subtle text-brand-subtle-foreground inline-block rounded-full px-2.5 py-0.5 text-xs font-medium">
                        {s.emotional_status}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>
    </PageTransition>
  );
}
