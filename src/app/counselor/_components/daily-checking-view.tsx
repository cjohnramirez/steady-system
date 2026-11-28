"use client";

import { useState } from "react";
import { CalendarClock, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/app/user-avatar";
import { StatusBadge } from "@/components/app/status-badge";
import { EmptyState } from "@/components/app/empty-state";
import {
  SessionCard,
  type SessionCardData,
} from "@/components/counselor/session-card";
import {
  DossierDialog,
  type StudentDossierRecord,
} from "@/components/counselor/dossier-dialog";
import { CrisisSupportDialog } from "@/components/app/crisis-dialog";
import {
  WarmReferralDialog,
  type CounselorOption,
} from "@/components/counselor/warm-referral-dialog";
import type { BookingStudentOption } from "@/components/counselor/proposed-booking-dialog";

export interface DailyScheduleItem extends SessionCardData {
  department?: string | null;
  yearLevel?: number | null;
  emotionalStatus?: string | null;
}

export function DailyCheckingView({
  counts,
  items,
  colleagues,
}: {
  counselorName?: string;
  counts: { waiting: number; upcoming: number; completed: number };
  items: DailyScheduleItem[];
  students?: BookingStudentOption[];
  colleagues: CounselorOption[];
}) {
  const [dossierStudent, setDossierStudent] =
    useState<StudentDossierRecord | null>(null);
  const [crisisOpen, setCrisisOpen] = useState(false);
  const [referralTarget, setReferralTarget] =
    useState<DailyScheduleItem | null>(null);
  const [activeIds, setActiveIds] = useState<Set<string>>(() => new Set());

  function openDossier(item: DailyScheduleItem) {
    setDossierStudent({
      id: item.studentId,
      name: item.studentName,
      universityId: item.studentUniversityId,
      department: item.department ?? item.courseAndYear,
      yearLevel: item.yearLevel,
      emotionalStatus: item.emotionalStatus,
      emergencyContactName: item.emergencyContactName,
      emergencyContactPhone: item.emergencyContactPhone,
      primaryReason: item.reason,
      completedSessions: counts.completed,
      totalSessions: Math.max(counts.completed + counts.upcoming, 1),
    });
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header Row + 3-Column Pill KPI Strip (Figma 678:17237) */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-[22px] font-medium tracking-tight">
            Today&apos;s Schedule &amp; In-Room Session
          </h1>
          <p className="text-muted-foreground max-w-xl text-[15px]">
            Your daily appointments in chronological order, live session
            notepad, and incoming student requests
          </p>
        </div>

        {/* Exact Figma 678:17251 Header Counter */}
        <div className="bg-card border-border shadow-steady-card flex items-stretch gap-[30px] rounded-[20px] border p-[21px]">
          <div className="flex flex-col items-start gap-[2px] text-left">
            <p className="text-foreground text-[24px] leading-none font-normal">
              {counts.waiting}
            </p>
            <p className="text-foreground/85 text-[15px] leading-snug whitespace-nowrap">
              Waiting
            </p>
          </div>
          <span aria-hidden className="bg-border w-px self-stretch" />
          <div className="flex flex-col items-start gap-[2px] text-left">
            <p className="text-foreground text-[24px] leading-none font-normal">
              {counts.upcoming}
            </p>
            <p className="text-foreground/85 text-[15px] leading-snug whitespace-nowrap">
              Upcoming
            </p>
          </div>
          <span aria-hidden className="bg-border w-px self-stretch" />
          <div className="flex flex-col items-start gap-[2px] text-left">
            <p className="text-foreground text-[24px] leading-none font-normal">
              {counts.completed}
            </p>
            <p className="text-foreground/85 text-[15px] leading-snug whitespace-nowrap">
              Completed
            </p>
          </div>
        </div>
      </div>

      {/* Chronological Session Stack */}
      {items.length === 0 ? (
        <div className="bg-card border-border shadow-steady-card rounded-[20px] border p-8">
          <EmptyState
            icon={CalendarClock}
            title="No sessions scheduled yet"
            description="Incoming student requests and approved appointments will appear here in chronological order."
          />
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {items.map((item) => {
            const isSpotlight =
              item.status === "pending" || activeIds.has(item.id);

            if (isSpotlight) {
              return (
                <SessionCard
                  key={item.id}
                  session={item}
                  onOpenCrisis={() => setCrisisOpen(true)}
                  onOpenReferral={() => setReferralTarget(item)}
                />
              );
            }

            return (
              <div
                key={item.id}
                className="bg-card border-border shadow-steady-card flex flex-col gap-5 rounded-[20px] border p-5"
              >
                {/* Top row: Time + Status Pill */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-[15px]">
                  <span className="flex items-center gap-2">
                    <Clock strokeWidth={1.5} className="size-3.5 shrink-0" />
                    <span>{item.scheduledLabel}</span>
                  </span>
                  <StatusBadge status={item.status} />
                </div>

                {/* 3-Column Student Row */}
                <div className="flex flex-wrap items-center gap-5">
                  <UserAvatar
                    name={item.studentName}
                    className="size-11 shrink-0 rounded-[10px]"
                  />
                  <div className="flex flex-wrap items-center gap-x-10 gap-y-2 text-[15px]">
                    <div>
                      <p className="font-medium">Student Name</p>
                      <p className="text-foreground/80 privacy-sensitive">
                        {item.studentName}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">Student ID</p>
                      <p className="text-foreground/80 privacy-sensitive">
                        {item.studentUniversityId}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">Course and Year</p>
                      <p className="text-foreground/80">{item.courseAndYear}</p>
                    </div>
                  </div>
                </div>

                {/* Concern Box */}
                <div className="bg-card border-border shadow-steady-card rounded-[20px] border p-5">
                  <div className="flex flex-col gap-2 text-[15px] sm:flex-row sm:items-start">
                    <p className="w-[102px] shrink-0 font-medium">Concern</p>
                    <p className="text-foreground/90 privacy-sensitive flex-1 leading-relaxed">
                      &ldquo;{item.reason}&rdquo;
                    </p>
                  </div>
                </div>

                {/* Bottom Row: Emergency Contact + Actions */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-[15px]">
                    <span className="font-medium">Emergency Contact</span>
                    <div className="text-foreground/80 privacy-sensitive flex flex-wrap items-center gap-2.5">
                      <span>
                        {item.emergencyContactName ?? "No contact recorded"}
                      </span>
                      {item.emergencyContactPhone && (
                        <>
                          <span
                            aria-hidden
                            className="bg-border inline-block h-4 w-px"
                          />
                          <span>{item.emergencyContactPhone}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => openDossier(item)}
                    >
                      View Full Dossier
                    </Button>
                    {item.status === "approved" && (
                      <Button
                        type="button"
                        variant="positive"
                        size="sm"
                        onClick={() =>
                          setActiveIds((prev) => new Set(prev).add(item.id))
                        }
                      >
                        Begin Early
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <DossierDialog
        key={dossierStudent?.id ?? "closed"}
        open={Boolean(dossierStudent)}
        onOpenChange={(open) => {
          if (!open) setDossierStudent(null);
        }}
        student={dossierStudent}
      />

      <CrisisSupportDialog
        open={crisisOpen}
        onOpenChange={setCrisisOpen}
        role="counselor"
      />

      {referralTarget && (
        <WarmReferralDialog
          open={Boolean(referralTarget)}
          onOpenChange={(open) => {
            if (!open) setReferralTarget(null);
          }}
          appointmentId={referralTarget.id}
          studentId={referralTarget.studentId}
          studentName={referralTarget.studentName}
          studentMeta={`${referralTarget.studentUniversityId} | ${referralTarget.courseAndYear}`}
          counselors={colleagues}
        />
      )}
    </div>
  );
}
