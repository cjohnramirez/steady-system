"use client";

import { ShieldCheck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { StatusBadge, UrgencyBadge } from "@/components/app/status-badge";

export interface AuditRecord {
  id: string;
  obfuscatedStudentCode: string;
  college: string;
  department: string;
  counselorName: string;
  scheduledLabel: string;
  durationMinutes: number;
  urgency: "low" | "medium" | "high";
  status: string;
  hasWarmReferral: boolean;
}

/**
 * RA 11036 Obfuscated Audit Metadata Dialog (Figma 687:1222):
 * Displays administrative metadata only — zero clinical notes or consultation reasons.
 */
export function AuditMetadataDialog({
  open,
  onOpenChange,
  record,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record: AuditRecord | null;
}) {
  if (!record) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-[588px]">
        {/* Static Gray Header Band */}
        <div className="bg-muted/60 border-border shrink-0 border-b p-5 pr-12 text-left">
          <DialogTitle className="text-[15px] font-medium">
            Appointment Audit Metadata
          </DialogTitle>
          <DialogDescription className="text-foreground/80 mt-1 text-[14px]">
            RA 11036 privacy-enforced record. Clinical notes and session reasons
            are never exposed to administrative accounts.
          </DialogDescription>
        </div>

        {/* Scrollable Center Body */}
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5 text-left">
          <div className="bg-brand-subtle/60 border-border flex items-center gap-3 rounded-[16px] border px-4 py-3 text-sm">
            <ShieldCheck className="text-primary size-4 shrink-0" />
            <span>
              Student identity obfuscated as{" "}
              <strong className="font-mono font-semibold">
                {record.obfuscatedStudentCode}
              </strong>
            </span>
          </div>

          <div className="bg-card border-border shadow-steady-card divide-border divide-y rounded-[20px] border text-[15px]">
            <div className="flex items-center justify-between gap-4 px-5 py-3.5">
              <span className="text-muted-foreground">Student Code</span>
              <span className="font-mono font-medium">
                {record.obfuscatedStudentCode}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4 px-5 py-3.5">
              <span className="text-muted-foreground">College / Dept</span>
              <span className="text-right font-medium">
                {record.college} • {record.department}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4 px-5 py-3.5">
              <span className="text-muted-foreground">Assigned Counselor</span>
              <span className="font-medium">{record.counselorName}</span>
            </div>
            <div className="flex items-center justify-between gap-4 px-5 py-3.5">
              <span className="text-muted-foreground">Scheduled Slot</span>
              <span className="font-medium">
                {record.scheduledLabel} ({record.durationMinutes}m)
              </span>
            </div>
            <div className="flex items-center justify-between gap-4 px-5 py-3.5">
              <span className="text-muted-foreground">Triage Urgency</span>
              <UrgencyBadge urgency={record.urgency} />
            </div>
            <div className="flex items-center justify-between gap-4 px-5 py-3.5">
              <span className="text-muted-foreground">Status</span>
              <StatusBadge status={record.status} />
            </div>
            <div className="flex items-center justify-between gap-4 px-5 py-3.5">
              <span className="text-muted-foreground">Warm Referral</span>
              <span className="font-medium">
                {record.hasWarmReferral ? "Yes (Logged)" : "None"}
              </span>
            </div>
          </div>
        </div>

        {/* Static Gray Footer Band */}
        <div className="bg-muted/60 border-border flex shrink-0 items-center justify-end border-t p-5">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
