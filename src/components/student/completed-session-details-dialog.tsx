"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toggleActionItem } from "@/lib/actions/clinical";
import type { ActionPlanItem } from "@/components/student/action-plan-card";
import { cn } from "@/lib/utils";

export interface CompletedSessionInfo {
  id: string;
  status?: string | null;
  scheduledLabel: string;
  reason: string;
  notes?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  actionItems?: ActionPlanItem[];
}

const FALLBACK_ACTION_ITEMS: ActionPlanItem[] = [
  {
    id: "session-starter-1",
    title: "Have aunt drop off homecooked food container tonight",
    is_completed: true,
    due_date: null,
  },
  {
    id: "session-starter-2",
    title: "Take 15-min phone-free walk around campus before dinner",
    is_completed: false,
    due_date: null,
  },
  {
    id: "session-starter-3",
    title: "Sign and submit dean's overload reduction waiver",
    is_completed: false,
    due_date: null,
  },
  {
    id: "session-starter-4",
    title: "Send email to Prof. Ramos requesting project extension",
    is_completed: false,
    due_date: null,
  },
];

/**
 * Figma Completed Session Details Dialog (678:20223):
 * Static header & footer bands + scrollable body with Emergency Contact,
 * Reason for Booking, Shared Action Plan checkboxes, and progress bar.
 */
export function CompletedSessionDetailsDialog({
  open,
  onOpenChange,
  session,
  onReschedule,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session: CompletedSessionInfo | null;
  onReschedule?: () => void;
}) {
  const [localOverrides, setLocalOverrides] = useState<Record<string, boolean>>(
    {},
  );
  const [isPending, startTransition] = useTransition();

  if (!session) return null;

  const baseItems =
    session.actionItems && session.actionItems.length > 0
      ? session.actionItems
      : FALLBACK_ACTION_ITEMS;

  const resolvedItems = baseItems.map((item) => ({
    ...item,
    is_completed:
      localOverrides[item.id] !== undefined
        ? localOverrides[item.id]
        : item.is_completed,
  }));

  const completedCount = resolvedItems.filter((i) => i.is_completed).length;
  const pct =
    resolvedItems.length > 0
      ? Math.round((completedCount / resolvedItems.length) * 100)
      : 0;

  function handleToggle(item: ActionPlanItem) {
    const next = !item.is_completed;
    setLocalOverrides((prev) => ({ ...prev, [item.id]: next }));

    if (item.id.startsWith("session-starter-")) return;

    startTransition(async () => {
      const res = await toggleActionItem({ id: item.id, is_completed: next });
      if (!res.ok) {
        setLocalOverrides((prev) => ({
          ...prev,
          [item.id]: item.is_completed,
        }));
        toast.error(res.error);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-[588px]">
        {/* Static Header Band */}
        <div className="bg-muted/40 border-border shrink-0 space-y-0.5 border-b p-5 pr-12 text-left">
          <DialogTitle className="text-foreground text-[16px] font-medium">
            {session.status === "completed"
              ? "Completed Session Details"
              : "Session Details"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-[14px]">
            {session.scheduledLabel}
          </DialogDescription>
        </div>

        {/* Scrollable Center Body */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          {/* Emergency Contact & Reason for Booking */}
          <div className="border-border space-y-4 border-b p-5 text-left">
            <div className="space-y-1">
              <p className="text-foreground text-[15px] font-medium">
                Emergency Contact on File
              </p>
              <p className="text-foreground/85 flex flex-wrap items-center gap-2.5 text-[15px]">
                <span>
                  {session.emergencyContactName ??
                    "On file with Guidance Office"}
                </span>
                {session.emergencyContactPhone && (
                  <>
                    <span aria-hidden className="text-border">
                      |
                    </span>
                    <span>{session.emergencyContactPhone}</span>
                  </>
                )}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-foreground text-[15px] font-medium">
                Reason for Booking
              </p>
              <p className="text-foreground/85 text-[15px] leading-relaxed">
                {session.notes?.trim()
                  ? `${session.reason} — ${session.notes.trim()}`
                  : session.reason}
              </p>
            </div>
          </div>

          {/* Shared Action Plan */}
          <div className="space-y-4 p-5 text-left">
            <div className="space-y-0.5">
              <p className="text-foreground text-[15px] font-medium">
                Shared Action Plan
              </p>
              <p className="text-muted-foreground text-[14px]">
                View progress and take note of your post-session action steps.
              </p>
            </div>

            <div className="flex flex-col gap-2" aria-busy={isPending}>
              {resolvedItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  role="checkbox"
                  aria-checked={item.is_completed}
                  onClick={() => handleToggle(item)}
                  className={cn(
                    "shadow-steady-card flex cursor-pointer items-start gap-[15px] rounded-[19px] border p-[18px] text-left text-[15px] transition-colors",
                    item.is_completed
                      ? "border-[#009966] bg-[#ecfdf5] dark:border-emerald-500 dark:bg-emerald-950/35"
                      : "border-border bg-card hover:border-foreground/30",
                  )}
                >
                  <span
                    aria-hidden
                    className={cn(
                      "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-[4px] border transition-colors",
                      item.is_completed
                        ? "border-[#009966] bg-[#009966] text-white"
                        : "border-border bg-background",
                    )}
                  >
                    {item.is_completed && (
                      <Check strokeWidth={2.5} className="size-3" />
                    )}
                  </span>
                  <span className="text-foreground leading-snug">
                    {item.title}
                  </span>
                </button>
              ))}
            </div>

            {/* Progress Bar Row */}
            <div className="flex items-center gap-4 pt-1">
              <span className="text-foreground shrink-0 text-[14px] font-normal tabular-nums">
                {pct}% Complete
              </span>
              <div className="bg-border h-1.5 flex-1 overflow-hidden rounded-full">
                <div
                  className="h-full rounded-full bg-[#009966] transition-[width] duration-300"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Static Footer Band */}
        <div className="bg-muted/40 border-border flex shrink-0 items-center justify-between gap-3 border-t p-5">
          {onReschedule ? (
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                onOpenChange(false);
                onReschedule();
              }}
            >
              Reschedule
            </Button>
          ) : (
            <Button asChild variant="destructive">
              <Link
                href={`/student/appointment?reason=${encodeURIComponent(session.reason)}`}
                onClick={() => onOpenChange(false)}
              >
                Reschedule
              </Link>
            </Button>
          )}
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
