"use client";

import Link from "next/link";
import { CalendarPlus, ExternalLink } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/app/user-avatar";
import type { ActionPlanItem } from "@/components/student/action-plan-card";

export interface StudentDossierRecord {
  id: string;
  name: string;
  email?: string | null;
  universityId?: string | number | null;
  department?: string | null;
  yearLevel?: number | null;
  emotionalStatus?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  primaryReason?: string | null;
  previousNoteSummary?: string | null;
  completedSessions?: number;
  totalSessions?: number;
  actionItems?: ActionPlanItem[];
  recentSessions?: {
    id: string;
    dateLabel: string;
    status: string;
    reason?: string | null;
  }[];
}

export function DossierDialog({
  open,
  onOpenChange,
  student,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: StudentDossierRecord | null;
  previewOnly?: boolean;
}) {
  if (!student) return null;

  const total =
    student.totalSessions ?? Math.max(student.actionItems?.length ?? 0, 1);
  const completed =
    student.completedSessions ??
    student.actionItems?.filter((i) => i.is_completed).length ??
    0;
  const pct = Math.min(100, Math.round((completed / Math.max(total, 1)) * 100));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-[577px]">
        {/* Static Header (Figma 678:18090) */}
        <div className="border-border flex shrink-0 items-center gap-5 border-b p-5 pr-12">
          <UserAvatar
            name={student.name}
            className="size-[51px] shrink-0 rounded-[10px]"
          />
          <div className="min-w-0 flex-1 space-y-0.5 text-left">
            <DialogTitle className="privacy-sensitive truncate text-[15px] font-medium">
              {student.name}
            </DialogTitle>
            <DialogDescription className="text-foreground/80 privacy-sensitive flex flex-wrap items-center gap-2.5 text-[15px]">
              <span>{student.universityId ?? "ID —"}</span>
              <span aria-hidden className="bg-border inline-block h-4 w-px" />
              <span>
                {student.department ?? "Department"}
                {student.yearLevel ? `, Year ${student.yearLevel}` : ""}
              </span>
            </DialogDescription>
          </div>
        </div>

        {/* Scrollable Center Body */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          {/* Section 1: Emergency Contact Card + Reason & Emotion (Figma 678:18104) */}
          <div className="border-border space-y-5 border-b p-5">
            <div className="bg-card border-border shadow-steady-card space-y-1.5 rounded-[20px] border p-5">
              <p className="text-[15px] font-medium">
                Emergency Contact on File
              </p>
              <div className="text-foreground/80 privacy-sensitive flex flex-wrap items-center gap-2.5 text-[15px]">
                <span>
                  {student.emergencyContactName ??
                    "No emergency contact on file"}
                </span>
                {student.emergencyContactPhone && (
                  <>
                    <span
                      aria-hidden
                      className="bg-border inline-block h-4 w-px"
                    />
                    <span>{student.emergencyContactPhone}</span>
                  </>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-1">
                <p className="text-[15px] font-medium">
                  Primary Reason for Consultation
                </p>
                <p className="text-foreground/80 privacy-sensitive text-[15px]">
                  {student.primaryReason ??
                    "General academic & wellness check-in"}
                </p>
              </div>
              {student.emotionalStatus && (
                <div className="space-y-1.5">
                  <p className="text-[15px] font-medium">Emotion</p>
                  <span className="bg-warning/20 text-warning inline-flex items-center justify-center rounded-[35px] px-3 py-1 text-[14px] font-medium">
                    {student.emotionalStatus}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Previous Session Notes + View Sessions (Figma 678:18120) */}
          <div className="border-border flex flex-col gap-4 border-b p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-[300px] space-y-1">
              <p className="text-[15px] font-medium">Previous Session Notes</p>
              <p className="text-foreground/80 privacy-sensitive text-[15px] leading-snug">
                {student.previousNoteSummary ??
                  "No clinical summary recorded from prior sessions yet."}
              </p>
            </div>
            <Button
              variant="outline"
              asChild
              onClick={() => onOpenChange(false)}
              className="shrink-0"
            >
              <Link
                href={`/counselor/appointments?student=${encodeURIComponent(student.name)}&sort=date_desc`}
              >
                <ExternalLink className="size-3.5" />
                View Sessions
              </Link>
            </Button>
          </div>

          {/* Section 3: Session Progress (Figma 678:18129) */}
          <div className="border-border space-y-4 border-b p-5">
            <div className="flex items-center justify-between gap-2 text-[15px]">
              <p className="font-medium">Session Progress</p>
              <p className="text-foreground/80">
                {completed} out of {total} sessions completed
              </p>
            </div>
            <div className="bg-muted h-1.5 w-full overflow-hidden rounded-full">
              <div
                className="bg-positive h-full rounded-full transition-[width] duration-300"
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="text-muted-foreground text-[14px] leading-snug">
              A session is considered complete if its Shared Action Plan are all
              accomplished.
            </p>
          </div>
        </div>

        {/* Static Gray Footer Band (Figma 678:18138) */}
        <div className="bg-muted/60 border-border flex shrink-0 items-center justify-between border-t p-5">
          <Button
            variant="positive"
            asChild
            onClick={() => onOpenChange(false)}
          >
            <Link
              href={`/counselor/appointments?student=${encodeURIComponent(student.name)}&sort=date_desc`}
            >
              <CalendarPlus strokeWidth={1.5} className="size-4" />
              View Sessions
            </Link>
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Close Dossier
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
