"use client";

import { useEffect, useState } from "react";
import { Clock, Play, ShieldAlert, Square, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { StatusBadge, UrgencyBadge } from "@/components/app/status-badge";
import { PillTabs } from "@/components/app/pill-tabs";

export interface SessionCardData {
  id: string;
  studentId: string;
  studentName: string;
  studentUniversityId: string;
  courseAndYear: string;
  scheduledLabel: string;
  reason: string;
  status: "pending" | "approved" | "completed" | "cancelled" | "rejected";
  urgency: "low" | "medium" | "high";
  emergencyContact?: string;
}

/**
 * Compound Counselor Session Card matching Figma `Session Card` (`380:278`)
 * supporting Pending, Active SOAP, Active SAP, and Completed states with a live timer.
 */
export function SessionCard({
  session,
  onSaveNote,
  onComplete,
  onOpenCrisis,
  onOpenReferral,
}: {
  session: SessionCardData;
  onSaveNote?: (payload: {
    appointmentId: string;
    format: "soap" | "sap";
    content: Record<string, string>;
  }) => Promise<void>;
  onComplete?: (appointmentId: string) => Promise<void>;
  onOpenCrisis?: () => void;
  onOpenReferral?: () => void;
}) {
  const [inSession, setInSession] = useState(session.status === "approved");
  const [elapsedSec, setElapsedSec] = useState(0);
  const [noteFormat, setNoteFormat] = useState<"soap" | "sap">("soap");
  const [soap, setSoap] = useState({
    subjective: "",
    objective: "",
    assessment: "",
    plan: "",
  });
  const [sap, setSap] = useState({
    situation: "",
    action: "",
    plan: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!inSession || session.status === "completed") return;
    const id = window.setInterval(() => setElapsedSec((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, [inSession, session.status]);

  const mins = String(Math.floor(elapsedSec / 60)).padStart(2, "0");
  const secs = String(elapsedSec % 60).padStart(2, "0");

  const handleSave = async () => {
    if (!onSaveNote) return;
    setSaving(true);
    try {
      await onSaveNote({
        appointmentId: session.id,
        format: noteFormat,
        content: noteFormat === "soap" ? soap : sap,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <article className="bg-card border-border shadow-steady-card flex flex-col gap-5 rounded-[20px] border p-5 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="privacy-sensitive text-base font-medium">
              {session.studentName}
            </h3>
            <StatusBadge status={session.status} />
            <UrgencyBadge urgency={session.urgency} />
          </div>
          <p className="text-muted-foreground privacy-sensitive text-sm">
            {session.studentUniversityId} • {session.courseAndYear} •{" "}
            {session.scheduledLabel}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {session.status !== "completed" && (
            <div className="bg-muted border-border inline-flex items-center gap-2 rounded-[25px] border px-3.5 py-1.5 font-mono text-sm tabular-nums">
              <Clock className="text-primary size-4" />
              <span>
                {mins}:{secs}
              </span>
            </div>
          )}
          {onOpenReferral && (
            <Button variant="outline" size="sm" onClick={onOpenReferral}>
              <UserPlus className="size-4" />
              Warm Referral
            </Button>
          )}
          {onOpenCrisis && (
            <Button variant="destructive" size="sm" onClick={onOpenCrisis}>
              <ShieldAlert className="size-4" />
              Crisis Protocol
            </Button>
          )}
        </div>
      </div>

      <div className="bg-muted border-border rounded-[16px] border p-4 text-sm">
        <p className="text-muted-foreground text-xs font-medium uppercase">
          Presenting Concern
        </p>
        <p className="privacy-sensitive mt-1">
          {session.reason || "General consultation"}
        </p>
      </div>

      {session.status !== "completed" && (
        <div className="flex flex-col gap-4 border-t pt-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <PillTabs
              ariaLabel="Clinical note format"
              value={noteFormat}
              onChange={setNoteFormat}
              options={[
                { value: "soap", label: "SOAP Notes" },
                { value: "sap", label: "SAP Notes" },
              ]}
            />
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setInSession((v) => !v)}
              >
                {inSession ? (
                  <>
                    <Square className="size-3.5" />
                    Pause Timer
                  </>
                ) : (
                  <>
                    <Play className="size-3.5" />
                    Start Timer
                  </>
                )}
              </Button>
              <Button
                variant="positive"
                size="sm"
                loading={saving}
                onClick={handleSave}
              >
                Save Clinical Notes
              </Button>
              {onComplete && (
                <Button size="sm" onClick={() => void onComplete(session.id)}>
                  Complete Session
                </Button>
              )}
            </div>
          </div>

          {noteFormat === "soap" ? (
            <div className="grid gap-3 md:grid-cols-2">
              {(["subjective", "objective", "assessment", "plan"] as const).map(
                (key) => (
                  <div key={key} className="space-y-1.5">
                    <Label
                      htmlFor={`${session.id}-${key}`}
                      className="capitalize"
                    >
                      {key}
                    </Label>
                    <Textarea
                      id={`${session.id}-${key}`}
                      rows={3}
                      value={soap[key]}
                      onChange={(e) =>
                        setSoap((prev) => ({ ...prev, [key]: e.target.value }))
                      }
                      placeholder={`Document ${key} observations...`}
                      className="privacy-sensitive rounded-[16px]"
                    />
                  </div>
                ),
              )}
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-3">
              {(["situation", "action", "plan"] as const).map((key) => (
                <div key={key} className="space-y-1.5">
                  <Label
                    htmlFor={`${session.id}-sap-${key}`}
                    className="capitalize"
                  >
                    {key}
                  </Label>
                  <Textarea
                    id={`${session.id}-sap-${key}`}
                    rows={4}
                    value={sap[key]}
                    onChange={(e) =>
                      setSap((prev) => ({ ...prev, [key]: e.target.value }))
                    }
                    placeholder={`Document ${key}...`}
                    className="privacy-sensitive rounded-[16px]"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </article>
  );
}
