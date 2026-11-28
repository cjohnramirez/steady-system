"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/app/error-state";
import { useSignedInViewer } from "@/components/viewer-provider";
import { EditTimeSlotsDialog } from "@/components/counselor/edit-time-slots-dialog";
import { AvailabilitySettingsDialog } from "@/components/counselor/availability-settings-dialog";
import { createClient } from "@/utils/supabase/client";
import { fetchCounselorDetails } from "@/lib/counselors/queries";
import { queryKeys } from "@/lib/query-keys";
import { cn } from "@/lib/utils";

const WEEKDAYS = [
  { label: "Monday", dayIndex: 1 },
  { label: "Tuesday", dayIndex: 2 },
  { label: "Wednesday", dayIndex: 3 },
  { label: "Thursday", dayIndex: 4 },
  { label: "Friday", dayIndex: 5 },
] as const;

const DEFAULT_SLOTS = ["09:00 AM", "10:30 AM", "1:30 PM", "3:00 PM", "4:15 PM"];

/**
 * Figma Office Hours & Weekly Schedule (678:17794):
 * 5-column Mon–Fri interactive slot grid (uniform 14px Instrument Sans) +
 * Edit Time Slot Dialog (678:18944) + Availability Configuration Dialog (678:18875).
 */
export default function ProfileCard() {
  const viewer = useSignedInViewer();
  const supabase = useMemo(() => createClient(), []);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [editingDay, setEditingDay] = useState<{
    label: string;
    dayIndex: number;
  } | null>(null);
  const [slotsByDay, setSlotsByDay] = useState<Record<number, string[]>>({});
  const [slotOverrides, setSlotOverrides] = useState<Record<string, boolean>>(
    {},
  );

  const counselor = useQuery({
    queryKey: queryKeys.counselors.detail(viewer.profileId),
    queryFn: () => fetchCounselorDetails(supabase, viewer.profileId),
  });

  const c = counselor.data;

  function getSlotsForDay(dayIndex: number): string[] {
    return slotsByDay[dayIndex] ?? DEFAULT_SLOTS;
  }

  function isSlotOpen(dayIndex: number, slotLabel: string): boolean {
    const key = `${dayIndex}-${slotLabel}`;
    if (slotOverrides[key] !== undefined) return slotOverrides[key];
    return c?.day_of_week?.[dayIndex] ?? true;
  }

  function toggleSlot(dayName: string, dayIndex: number, slotLabel: string) {
    const key = `${dayIndex}-${slotLabel}`;
    const next = !isSlotOpen(dayIndex, slotLabel);
    setSlotOverrides((prev) => ({ ...prev, [key]: next }));
    toast.success(
      `${dayName} ${slotLabel} marked as ${next ? "Open" : "Closed"}`,
    );
  }

  if (counselor.isLoading) {
    return (
      <div className="bg-card border-border shadow-steady-card space-y-5 rounded-[20px] border p-5">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
          {Array.from({ length: 5 }, (_, i) => (
            <Skeleton key={i} className="h-[360px] rounded-[20px]" />
          ))}
        </div>
        <Skeleton className="h-[92px] rounded-[20px]" />
      </div>
    );
  }

  if (counselor.isError) {
    return (
      <ErrorState
        title="Schedule Couldn't Be Loaded"
        onRetry={() => counselor.refetch()}
      />
    );
  }

  return (
    <div className="bg-card border-border shadow-steady-card space-y-5 rounded-[20px] border p-5 font-sans">
      {/* 5-Column Weekday Slot Grid (Figma 678:17794) */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
        {WEEKDAYS.map(({ label, dayIndex }) => {
          const daySlots = getSlotsForDay(dayIndex);
          const openCount = daySlots.filter((s) =>
            isSlotOpen(dayIndex, s),
          ).length;

          return (
            <div
              key={label}
              className="bg-card border-border shadow-steady-card flex flex-col justify-between gap-2.5 rounded-[20px] border p-4 font-sans text-[14px]"
            >
              <div className="space-y-2.5">
                {/* Day Header — uniform 14px Instrument Sans */}
                <div className="flex items-center justify-between gap-2 px-1 pb-1 text-[14px]">
                  <span className="text-foreground font-medium">{label}</span>
                  <span className="text-muted-foreground font-normal">
                    {openCount} {openCount === 1 ? "Slot" : "Slots"}
                  </span>
                </div>

                {/* Slot Pills — uniform 14px Instrument Sans */}
                <div className="flex flex-col gap-2">
                  {daySlots.map((slotLabel) => {
                    const open = isSlotOpen(dayIndex, slotLabel);
                    return (
                      <button
                        key={slotLabel}
                        type="button"
                        aria-pressed={open}
                        onClick={() => toggleSlot(label, dayIndex, slotLabel)}
                        className={cn(
                          "flex h-12 w-full cursor-pointer items-center justify-between rounded-full px-4 font-sans text-[14px] transition-all active:scale-[0.98]",
                          open
                            ? "bg-primary text-primary-foreground shadow-steady-pill font-normal"
                            : "bg-muted/70 text-foreground/80 hover:bg-muted font-normal",
                        )}
                      >
                        <span>{slotLabel}</span>
                        <span>{open ? "Open" : "Closed"}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                disabled={!c}
                onClick={() => setEditingDay({ label, dayIndex })}
                className="mt-1 w-full text-[14px]"
              >
                Edit Slots
              </Button>
            </div>
          );
        })}
      </div>

      {/* Bottom Availability Configuration Bar */}
      <div className="bg-card border-border shadow-steady-card flex flex-wrap items-center justify-between gap-4 rounded-[20px] border p-5">
        <div className="max-w-xl space-y-0.5">
          <p className="text-foreground text-[15px] font-medium">
            Availability Configuration
          </p>
          <p className="text-muted-foreground text-[14px] leading-snug">
            You can configure advanced settings to set buffers between
            appointments, protected lunch hours, and configure working hours.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          disabled={!c}
          onClick={() => setSettingsOpen(true)}
          className="px-5"
        >
          <SlidersHorizontal strokeWidth={1.5} className="size-4" />
          Configure Availability Settings
        </Button>
      </div>

      {editingDay && (
        <EditTimeSlotsDialog
          key={editingDay.dayIndex}
          open
          onOpenChange={(open) => {
            if (!open) setEditingDay(null);
          }}
          dayName={editingDay.label}
          initialSlots={getSlotsForDay(editingDay.dayIndex)}
          onSave={(nextSlots) => {
            setSlotsByDay((prev) => ({
              ...prev,
              [editingDay.dayIndex]: nextSlots,
            }));
            toast.success(`Updated time slots for ${editingDay.label}`);
          }}
        />
      )}

      {c && (
        <AvailabilitySettingsDialog
          open={settingsOpen}
          onOpenChange={setSettingsOpen}
          counselor={c}
        />
      )}
    </div>
  );
}
