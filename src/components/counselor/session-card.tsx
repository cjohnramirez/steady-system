"use client";

import { useEffect, useState, useTransition } from "react";
import {
  Check,
  Clock,
  Plus,
  ShieldAlert,
  Trash2,
  UserPlus,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/app/user-avatar";
import { saveClinicalNote } from "@/lib/actions/clinical";
import { cn } from "@/lib/utils";

export interface SessionCardData {
  id: string;
  studentId: string;
  studentName: string;
  studentUniversityId: string;
  courseAndYear: string;
  scheduledLabel: string;
  reason: string;
  status: string;
  urgency?: "low" | "medium" | "high";
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  durationMinutes?: number;
}

function formatTimer(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export function SessionCard({
  session,
  previewOnly = false,
  onOpenCrisis,
  onOpenReferral,
  onComplete,
}: {
  session: SessionCardData;
  previewOnly?: boolean;
  onOpenCrisis?: () => void;
  onOpenReferral?: () => void;
  onComplete?: (payload: {
    format: "soap" | "sap";
    content: Record<string, string>;
  }) => Promise<void> | void;
}) {
  const [stage, setStage] = useState<"pending" | "active" | "completed">(
    session.status === "completed" ? "completed" : "pending",
  );
  const [elapsed, setElapsed] = useState(0);
  const [activeTab, setActiveTab] = useState<"soap" | "action_plan">("soap");
  const [soap, setSoap] = useState({
    subjective: "",
    objective: "",
    assessment: "",
    plan: "",
  });
  const [actionSteps, setActionSteps] = useState<string[]>([
    "15-minute unplugged walk before dinner",
  ]);
  const [newStep, setNewStep] = useState("");
  const [isPending, startTransition] = useTransition();

  const durationSec = (session.durationMinutes ?? 30) * 60;

  useEffect(() => {
    if (stage !== "active") return;
    const id = window.setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, [stage]);

  function handleComplete() {
    startTransition(async () => {
      if (!previewOnly) {
        const res = await saveClinicalNote({
          appointment_id: session.id,
          format: "soap",
          content: soap,
        });
        if (!res.ok) {
          toast.error(res.error);
          return;
        }
      }
      await onComplete?.({ format: "soap", content: soap });
      setStage("completed");
      toast.success("Session completed and SOAP notes filed");
    });
  }

  function handleAddStep() {
    const trimmed = newStep.trim();
    if (!trimmed) return;
    setActionSteps((prev) => [...prev, trimmed]);
    setNewStep("");
  }

  const isActive = stage === "active";
  const isCompleted = stage === "completed";

  return (
    /* Outer Nested Tray (Figma 380:276 Pending / 380:277 Active) */
    <div
      className={cn(
        "border-border shadow-steady-card relative flex flex-col overflow-hidden rounded-[20px] border p-[2px] transition-colors",
        isActive ? "bg-positive/15" : "bg-muted",
      )}
    >
      {/* Top Status Strip (Figma 313:191 / 374:1181) */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-2.5 text-[15px]">
        <div className="flex items-center gap-2.5">
          <span
            aria-hidden
            className={cn(
              "size-3 rounded-full",
              isActive
                ? "bg-positive animate-pulse"
                : isCompleted
                  ? "bg-primary"
                  : "bg-warning",
            )}
          />
          <span>
            {isActive
              ? "In Room Active Session"
              : isCompleted
                ? "Completed Session"
                : "Pending Session"}
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="text-foreground/80">Time Remaining</span>
          <span
            className={cn(
              "rounded-[10px] px-3.5 py-1 text-[14px] tabular-nums",
              isActive
                ? "bg-positive/25 text-foreground"
                : "bg-border/70 text-foreground",
            )}
          >
            {isActive
              ? `${formatTimer(elapsed)} / ${formatTimer(durationSec)}`
              : isCompleted
                ? formatTimer(elapsed)
                : "Not Started"}
          </span>
        </div>
      </div>

      {/* Inner White Card (Figma 313:199 / 374:1189) */}
      <div className="bg-card border-border flex flex-col gap-5 rounded-[19px] border p-5">
        {/* Time Row */}
        <div className="flex items-center justify-between gap-2 text-[15px]">
          <span className="flex items-center gap-2.5">
            <Clock className="size-3.5 shrink-0" />
            <span>{session.scheduledLabel}</span>
          </span>
          {onOpenReferral && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onOpenReferral}
            >
              <UserPlus className="size-3.5" />
              Warm Referral
            </Button>
          )}
        </div>

        {/* 3-Column Student Row (Figma 313:204) */}
        <div className="flex flex-wrap items-center gap-5">
          <UserAvatar
            name={session.studentName}
            className="size-[51px] shrink-0 rounded-[10px]"
          />
          <div className="flex flex-wrap items-center gap-x-10 gap-y-2 text-[15px]">
            <div>
              <p className="font-medium">Student Name</p>
              <p className="text-foreground/80 privacy-sensitive">
                {session.studentName}
              </p>
            </div>
            <div>
              <p className="font-medium">Student ID</p>
              <p className="text-foreground/80 privacy-sensitive">
                {session.studentUniversityId}
              </p>
            </div>
            <div>
              <p className="font-medium">Course and Year</p>
              <p className="text-foreground/80">{session.courseAndYear}</p>
            </div>
          </div>
        </div>

        {/* Concern Card (Figma 313:220) */}
        <div className="bg-card border-border shadow-steady-card rounded-[20px] border p-5">
          <div className="flex flex-col gap-2 text-[15px] sm:flex-row sm:items-start">
            <p className="w-[102px] shrink-0 font-medium">Concern</p>
            <p className="text-foreground/90 privacy-sensitive flex-1 leading-relaxed">
              &ldquo;{session.reason}&rdquo;
            </p>
          </div>
        </div>

        {/* Nested Emerald Clinical Notes / Action Plan Tray when Active (Figma 374:1214) */}
        {isActive && (
          <div className="bg-positive/15 border-border flex flex-col overflow-hidden rounded-[20px] border p-[2px]">
            <div className="p-2.5">
              <div className="bg-card shadow-steady-card inline-flex flex-wrap items-center gap-1 rounded-[30px] p-1.5">
                <button
                  type="button"
                  onClick={() => setActiveTab("soap")}
                  className={cn(
                    "rounded-[32px] px-5 py-2.5 text-[14px] transition-colors",
                    activeTab === "soap"
                      ? "bg-positive text-positive-foreground shadow-steady-pill"
                      : "text-foreground hover:bg-muted",
                  )}
                >
                  Confidential Clinical SOAP Notes
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("action_plan")}
                  className={cn(
                    "rounded-[32px] px-5 py-2.5 text-[14px] transition-colors",
                    activeTab === "action_plan"
                      ? "bg-positive text-positive-foreground shadow-steady-pill"
                      : "text-foreground hover:bg-muted",
                  )}
                >
                  Shared Action Plan (Student Portal)
                </button>
              </div>
            </div>

            <div className="bg-card border-border space-y-3.5 rounded-[19px] border p-5">
              {activeTab === "soap" ? (
                <>
                  <p className="text-muted-foreground text-[14px]">
                    Only you can view this.
                  </p>
                  <div className="space-y-2.5">
                    {(
                      [
                        ["subjective", "Subjective"],
                        ["objective", "Objective"],
                        ["assessment", "Assessment"],
                        ["plan", "Plan"],
                      ] as const
                    ).map(([key, label]) => (
                      <div
                        key={key}
                        className="bg-card border-border shadow-steady-card rounded-[20px] border p-4"
                      >
                        <label
                          htmlFor={`soap-${session.id}-${key}`}
                          className="text-muted-foreground mb-1 block text-[14px]"
                        >
                          {label}
                        </label>
                        <textarea
                          id={`soap-${session.id}-${key}`}
                          rows={2}
                          value={soap[key]}
                          onChange={(e) =>
                            setSoap((prev) => ({
                              ...prev,
                              [key]: e.target.value,
                            }))
                          }
                          placeholder={`Document ${label.toLowerCase()} observations...`}
                          className="w-full resize-y bg-transparent text-[15px] outline-none"
                        />
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="space-y-3">
                  <p className="text-muted-foreground text-[14px]">
                    Shared with the student on their Sanctuary Dashboard.
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newStep}
                      onChange={(e) => setNewStep(e.target.value)}
                      placeholder="Add a gentle post-session step..."
                      className="bg-card border-border shadow-steady-card flex-1 rounded-[20px] border px-4 py-2.5 text-[15px] outline-none"
                    />
                    <Button type="button" size="sm" onClick={handleAddStep}>
                      <Plus className="size-4" />
                      Add
                    </Button>
                  </div>
                  <ul className="space-y-2">
                    {actionSteps.map((step, i) => (
                      <li
                        key={`${step}-${i}`}
                        className="border-border flex items-center justify-between gap-2 rounded-[16px] border px-4 py-3 text-[15px]"
                      >
                        <span>{step}</span>
                        <button
                          type="button"
                          aria-label="Remove step"
                          onClick={() =>
                            setActionSteps((prev) =>
                              prev.filter((_, idx) => idx !== i),
                            )
                          }
                          className="text-destructive hover:opacity-80"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Emergency Contact Row (Figma 313:224) */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-[15px]">
          <span className="font-medium">Emergency Contact</span>
          <div className="text-foreground/80 privacy-sensitive flex flex-wrap items-center gap-2.5">
            <span>
              {session.emergencyContactName ?? "Sophie Carter (Sister)"}
            </span>
            <span aria-hidden className="bg-border inline-block h-4 w-px" />
            <span>{session.emergencyContactPhone ?? "0917 987 6543"}</span>
          </div>
        </div>

        {/* Footer Actions Row (Figma 313:227 / 374:1246) */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button type="button" variant="destructive" onClick={onOpenCrisis}>
            <ShieldAlert className="size-4" />
            Crisis Protocol
          </Button>

          {stage === "pending" && (
            <Button
              type="button"
              variant="positive"
              onClick={() => setStage("active")}
            >
              Begin Session
            </Button>
          )}
          {stage === "active" && (
            <Button
              type="button"
              variant="positive"
              loading={isPending}
              onClick={handleComplete}
            >
              <Check className="size-4" />
              Complete and File Session
            </Button>
          )}
          {stage === "completed" && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setStage("pending")}
            >
              Reset Preview
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
