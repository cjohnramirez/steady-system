"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserAvatar } from "@/components/app/user-avatar";
import { createWarmReferral } from "@/lib/actions/clinical";
import { warmReferralCreateSchema } from "@/lib/validation/clinical";

export interface CounselorOption {
  id: string;
  name: string;
  specialty?: string;
}

const REFERRAL_TYPES = [
  "Internal Co-Counseling Handoff",
  "External Clinical / Psychiatric Specialist",
  "Academic Welfare & Support Transfer",
] as const;

export function WarmReferralDialog({
  open,
  onOpenChange,
  appointmentId,
  studentId,
  studentName,
  studentMeta,
  counselors,
  previewOnly = false,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointmentId?: string;
  studentId: string;
  studentName: string;
  studentMeta?: string;
  counselors: CounselorOption[];
  previewOnly?: boolean;
  onSuccess?: () => void;
}) {
  const [recipient, setRecipient] = useState(counselors[0]?.id ?? "external");
  const [externalClinic, setExternalClinic] = useState("");
  const [referralType, setReferralType] = useState<string>(REFERRAL_TYPES[0]);
  const [summary, setSummary] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const [metaId, metaCourse] = (studentMeta ?? "")
    .split(/[•|]/)
    .map((s) => s.trim());

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const isExternal = recipient === "external";
    const parsed = warmReferralCreateSchema.safeParse({
      appointment_id: appointmentId,
      student_id: studentId,
      to_counselor_id: isExternal ? undefined : recipient,
      external_clinic: isExternal ? externalClinic : "",
      summary: `[${referralType}] ${summary.trim()}`,
      urgency: "medium",
    });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please review the fields.");
      return;
    }

    if (previewOnly) {
      toast.success("Warm clinical referral sent (preview)");
      setSummary("");
      onSuccess?.();
      onOpenChange(false);
      return;
    }

    startTransition(async () => {
      const res = await createWarmReferral(parsed.data);
      if (!res.ok) {
        setError(res.error);
        toast.error(res.error);
        return;
      }
      toast.success("Warm clinical referral sent");
      setSummary("");
      setExternalClinic("");
      onSuccess?.();
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-[588px]">
        {/* Static Gray Header Band (Figma 688:1103) */}
        <div className="bg-muted/60 border-border shrink-0 border-b p-5 pr-12 text-left">
          <DialogTitle className="text-[15px] font-medium">
            Warm Clinical Referral
          </DialogTitle>
          <DialogDescription className="text-foreground/80 mt-1 text-[14px]">
            Transfer a student seamlessly to another licensed counselor or
            external specialist.
          </DialogDescription>
        </div>

        {/* Scrollable Center Body + Static Footer */}
        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
        >
          <div className="min-h-0 flex-1 space-y-3.5 overflow-y-auto px-6 py-5">
            {/* Student Summary Card (Figma 702:27629) */}
            <div className="bg-card border-border shadow-steady-card flex items-center gap-6 rounded-[20px] border p-5">
              <UserAvatar
                name={studentName}
                className="size-[51px] shrink-0 rounded-[10px]"
              />
              <div className="min-w-0 space-y-0.5 text-left">
                <p className="privacy-sensitive truncate text-[15px] font-medium">
                  {studentName}
                </p>
                <div className="text-foreground/80 privacy-sensitive flex flex-wrap items-center gap-2.5 text-[15px]">
                  {metaId && <span>{metaId}</span>}
                  {metaId && metaCourse && (
                    <span
                      aria-hidden
                      className="bg-border inline-block h-4 w-px"
                    />
                  )}
                  {metaCourse && <span>{metaCourse}</span>}
                </div>
              </div>
            </div>

            {/* Receiving Counselor / Clinic (Figma 688:1111) */}
            <div className="space-y-1.5">
              <label className="block text-[14px] font-medium">
                Receiving Counselor / Clinic
              </label>
              <Select value={recipient} onValueChange={setRecipient}>
                <SelectTrigger className="h-14 w-full rounded-[20px]">
                  <SelectValue placeholder="Select receiving counselor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Receiving Counselor</SelectLabel>
                    {counselors.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                        {c.specialty ? ` (${c.specialty})` : ""}
                      </SelectItem>
                    ))}
                    <SelectItem value="external">
                      External Clinic / Specialist…
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              {recipient === "external" && (
                <input
                  type="text"
                  value={externalClinic}
                  onChange={(e) => setExternalClinic(e.target.value)}
                  placeholder="Enter external clinic or specialist name"
                  className="bg-card border-border shadow-steady-card focus-visible:ring-ring/50 mt-2 w-full rounded-[20px] border px-5 py-3.5 text-[15px] outline-none focus-visible:ring-[3px]"
                />
              )}
            </div>

            {/* Referral Type (Figma 688:1115) */}
            <div className="space-y-1.5">
              <label className="block text-[14px] font-medium">
                Referral Type
              </label>
              <Select value={referralType} onValueChange={setReferralType}>
                <SelectTrigger className="h-14 w-full rounded-[20px]">
                  <SelectValue placeholder="Select referral type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Referral Type</SelectLabel>
                    {REFERRAL_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Confidential Handoff Summary (Figma 688:1119) */}
            <div className="space-y-1.5">
              <label
                htmlFor="referral-summary"
                className="block text-[14px] font-medium"
              >
                Confidential Handoff Summary
              </label>
              <textarea
                id="referral-summary"
                rows={3}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Student experiencing acute exam panic and sleep disruption; verbal consent obtained for warm transfer..."
                className="bg-card border-border shadow-steady-card focus-visible:ring-ring/50 w-full resize-y rounded-[20px] border p-5 text-[15px] outline-none focus-visible:ring-[3px]"
              />
            </div>

            {error && <p className="text-destructive text-sm">{error}</p>}
          </div>

          {/* Static Gray Footer Band (Figma 688:1124) */}
          <div className="bg-muted/60 border-border flex shrink-0 items-center justify-end gap-2.5 border-t px-6 py-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" loading={isPending}>
              Send Warm Referral
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
