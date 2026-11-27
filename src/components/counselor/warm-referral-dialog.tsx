"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Send } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { UrgencyBadge } from "@/components/app/status-badge";
import {
  warmReferralCreateSchema,
  type WarmReferralCreateInput,
} from "@/lib/validation/clinical";

export function WarmReferralDialog({
  open,
  onOpenChange,
  studentId,
  studentName,
  studentMeta,
  appointmentId,
  counselors,
  onSubmitReferral,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentId: string;
  studentName: string;
  studentMeta: string;
  appointmentId?: string;
  counselors: readonly { id: string; name: string }[];
  onSubmitReferral?: (
    input: WarmReferralCreateInput,
  ) => Promise<{ ok: boolean; error?: string }>;
}) {
  const [toCounselorId, setToCounselorId] = useState(counselors[0]?.id ?? "");
  const [externalClinic, setExternalClinic] = useState("");
  const [urgency, setUrgency] = useState<"low" | "medium" | "high">("medium");
  const [summary, setSummary] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = warmReferralCreateSchema.safeParse({
      appointment_id: appointmentId,
      student_id: studentId,
      to_counselor_id: toCounselorId || undefined,
      external_clinic: externalClinic,
      summary,
      urgency,
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Check referral fields.");
      return;
    }
    setSubmitting(true);
    try {
      if (onSubmitReferral) {
        const res = await onSubmitReferral(parsed.data);
        if (!res.ok) {
          toast.error(res.error ?? "Could not send warm referral.");
          return;
        }
      }
      toast.success("Warm referral sent securely.");
      setSummary("");
      setExternalClinic("");
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[580px]">
        <DialogHeader>
          <DialogTitle>Warm Clinical Referral</DialogTitle>
          <DialogDescription>
            Transfer a student seamlessly to another licensed counselor or
            external specialist. Handoff notes are strictly confidential.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="bg-muted border-border flex items-center justify-between gap-3 rounded-[16px] border px-4 py-3">
            <div className="min-w-0">
              <p className="privacy-sensitive truncate text-sm font-medium">
                {studentName}
              </p>
              <p className="text-muted-foreground privacy-sensitive truncate text-xs">
                {studentMeta}
              </p>
            </div>
            <UrgencyBadge urgency={urgency} />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="referral-counselor">Receiving Counselor</Label>
              <select
                id="referral-counselor"
                value={toCounselorId}
                onChange={(e) => setToCounselorId(e.target.value)}
                className="border-input bg-card shadow-steady-card focus-visible:ring-ring/50 h-11 w-full rounded-[25px] border px-4 text-sm outline-none focus-visible:ring-2"
              >
                <option value="">External clinic only</option>
                {counselors.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="referral-urgency">Clinical Urgency</Label>
              <select
                id="referral-urgency"
                value={urgency}
                onChange={(e) =>
                  setUrgency(e.target.value as "low" | "medium" | "high")
                }
                className="border-input bg-card shadow-steady-card focus-visible:ring-ring/50 h-11 w-full rounded-[25px] border px-4 text-sm outline-none focus-visible:ring-2"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="referral-clinic">
              External Clinic / Specialist (Optional)
            </Label>
            <Input
              id="referral-clinic"
              value={externalClinic}
              onChange={(e) => setExternalClinic(e.target.value)}
              placeholder="e.g. University Health Clinic — Psychiatry"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="referral-summary">
              Confidential Handoff Summary
            </Label>
            <Textarea
              id="referral-summary"
              rows={4}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Summarize presenting concerns, risk screening, and student consent for warm transfer..."
              className="privacy-sensitive rounded-[20px]"
            />
            <p className="text-muted-foreground text-xs">
              Visible only to sending and receiving counselors. Administrators
              only see a referral flag.
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              <Send className="size-4" />
              Send Warm Referral
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
