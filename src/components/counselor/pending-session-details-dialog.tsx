"use client";

import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/app/user-avatar";

export interface PendingSessionRecord {
  id: string;
  studentName: string;
  studentUniversityId: string;
  courseAndYear: string;
  scheduledLabel: string;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  reason: string;
}

export function PendingSessionDetailsDialog({
  open,
  onOpenChange,
  session,
  onReschedule,
  onReferral,
  onSaveNotes,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session: PendingSessionRecord | null;
  onReschedule?: () => void;
  onReferral?: () => void;
  onSaveNotes?: () => void;
}) {
  if (!session) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-[588px]">
        {/* Header Band (Figma 678:18366) */}
        <div className="border-border border-b p-5 pr-12 text-left">
          <DialogTitle className="text-[15px] font-medium">
            Pending Session Details
          </DialogTitle>
          <DialogDescription className="text-foreground/80 mt-1 text-[15px]">
            {session.scheduledLabel}
          </DialogDescription>
        </div>

        {/* White Body (Figma 678:18372) */}
        <div className="space-y-5 p-5 text-left">
          {/* Student + Scheduled At Card (Figma 678:18373) */}
          <div className="bg-card border-border shadow-steady-card flex flex-wrap items-center gap-6 rounded-[20px] border p-5">
            <UserAvatar
              name={session.studentName}
              className="bg-positive text-positive-foreground size-[51px] shrink-0 rounded-[10px]"
            />
            <div className="flex flex-1 flex-wrap items-center justify-between gap-4">
              <div className="space-y-0.5">
                <p className="privacy-sensitive text-[15px] font-medium">
                  {session.studentName}
                </p>
                <div className="text-foreground/80 privacy-sensitive flex items-center gap-2.5 text-[15px]">
                  <span>{session.studentUniversityId}</span>
                  <span
                    aria-hidden
                    className="bg-border inline-block h-4 w-px"
                  />
                  <span>{session.courseAndYear}</span>
                </div>
              </div>
              <div className="space-y-0.5">
                <p className="text-[15px] font-medium">Scheduled At</p>
                <p className="text-foreground/80 text-[15px]">
                  {session.scheduledLabel}
                </p>
              </div>
            </div>
          </div>

          {/* Emergency Contact (Figma 678:18392) */}
          <div className="space-y-1">
            <p className="text-[15px] font-medium">Emergency Contact on File</p>
            <div className="text-foreground/80 privacy-sensitive flex flex-wrap items-center gap-2.5 text-[15px]">
              <span>
                {session.emergencyContactName ?? "No emergency contact on file"}
              </span>
              {session.emergencyContactPhone && (
                <>
                  <span
                    aria-hidden
                    className="bg-border inline-block h-4 w-px"
                  />
                  <span>{session.emergencyContactPhone}</span>
                </>
              )}
            </div>
          </div>

          {/* Reason for Booking (Figma 678:18398) */}
          <div className="space-y-1">
            <p className="text-[15px] font-medium">Reason for Booking</p>
            <p className="text-foreground/85 privacy-sensitive text-[15px] leading-snug">
              {session.reason}
            </p>
          </div>
        </div>

        {/* Gray Footer Band (Figma 678:18403) */}
        <div className="bg-muted/60 border-border flex flex-wrap items-center justify-between gap-3 border-t p-5">
          <div className="flex items-center gap-2.5">
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                if (onReschedule) {
                  onReschedule();
                } else {
                  toast.info("Reschedule requested");
                }
              }}
            >
              Reschedule
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (onReferral) {
                  onReferral();
                } else {
                  toast.info("Opening warm referral");
                }
              }}
            >
              Referral
            </Button>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
            <Button
              type="button"
              onClick={() => {
                if (onSaveNotes) {
                  onSaveNotes();
                } else {
                  toast.success("Session notes saved");
                  onOpenChange(false);
                }
              }}
            >
              Save Notes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
