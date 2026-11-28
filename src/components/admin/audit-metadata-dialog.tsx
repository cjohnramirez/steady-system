"use client";

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

  const shortRef = `APT-${record.id.replaceAll("-", "").slice(0, 8).toUpperCase()}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-[588px]">
        {/* Static Gray Header Band (Figma 687:1223) */}
        <div className="bg-muted/60 border-border shrink-0 border-b p-5 pr-12 text-left">
          <DialogTitle className="text-[15px] font-medium">
            Appointment Audit Metadata
          </DialogTitle>
          <DialogDescription className="text-foreground/80 mt-1 text-[15px]">
            {shortRef} &bull; RA 11036 Obfuscated Administrative Record
          </DialogDescription>
        </div>

        {/* Scrollable Center Body (Figma 687:1226) */}
        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5 text-left">
          <div className="flex flex-wrap items-center gap-2.5">
            <StatusBadge status={record.status} />
            <UrgencyBadge urgency={record.urgency} />
          </div>

          <div className="bg-card border-border shadow-steady-card divide-border divide-y rounded-[20px] border text-[15px]">
            <div className="space-y-1 p-5">
              <p className="text-foreground font-medium">
                Obfuscated Student Code
              </p>
              <p className="text-foreground/90 font-normal tabular-nums">
                {record.obfuscatedStudentCode} ({record.college})
              </p>
            </div>
            <div className="space-y-1 p-5">
              <p className="text-foreground font-medium">Assigned Counselor</p>
              <p className="text-foreground/90 font-normal">
                {record.counselorName}
              </p>
            </div>
            <div className="space-y-1 p-5">
              <p className="text-foreground font-medium">
                Scheduled Date &amp; Room
              </p>
              <p className="text-foreground/90 font-normal">
                {record.scheduledLabel} &bull; {record.durationMinutes} mins
              </p>
            </div>
            <div className="space-y-1 p-5">
              <p className="text-foreground font-medium">Warm Referral Flag</p>
              <p className="text-foreground/90 font-normal">
                {record.hasWarmReferral
                  ? "Active transfer logged"
                  : "No active transfer"}
              </p>
            </div>
          </div>

          <p className="text-muted-foreground text-[15px] leading-relaxed font-normal">
            Confidentiality Boundary (RA 11036 / Data Privacy Act 2012):
            Clinical SOAP/SAP notes and student session reasons are strictly
            restricted to the assigned counselor.
          </p>
        </div>

        {/* Static Gray Footer Band (Figma 687:1247) */}
        <div className="bg-muted/60 border-border flex shrink-0 items-center justify-end border-t px-6 py-4">
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
