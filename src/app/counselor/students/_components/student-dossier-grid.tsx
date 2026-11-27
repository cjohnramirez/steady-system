"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { UserAvatar } from "@/components/app/user-avatar";
import {
  DossierDialog,
  type StudentDossierRecord,
} from "@/components/counselor/dossier-dialog";

export function StudentDossierGrid({
  students,
}: {
  students: StudentDossierRecord[];
}) {
  const [selected, setSelected] = useState<StudentDossierRecord | null>(null);

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {students.map((student) => (
          <button
            key={student.id}
            type="button"
            onClick={() => setSelected(student)}
            className="bg-muted/60 border-border hover:bg-muted/90 focus-visible:ring-ring/50 group flex items-start gap-3.5 rounded-[18px] border p-4 text-left transition-colors outline-none focus-visible:ring-[3px]"
          >
            <UserAvatar
              name={student.name || "Student"}
              className="size-11 shrink-0 rounded-[12px]"
            />
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center justify-between gap-2">
                <p className="privacy-sensitive truncate font-medium">
                  {student.name || "Unnamed Student"}
                </p>
                <ChevronRight className="text-muted-foreground size-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
              </div>
              <p className="text-muted-foreground privacy-sensitive truncate text-xs">
                {student.universityId ?? "—"} •{" "}
                {student.department ?? "Department"} • Year{" "}
                {student.yearLevel ?? "—"}
              </p>
              {student.emotionalStatus && (
                <span className="bg-brand-subtle text-brand-subtle-foreground inline-block rounded-full px-2.5 py-0.5 text-xs font-medium">
                  {student.emotionalStatus}
                </span>
              )}
            </div>
          </button>
        ))}
      </div>

      <DossierDialog
        key={selected?.id ?? "closed"}
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
        student={selected}
      />
    </>
  );
}
