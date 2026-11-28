"use client";

import { useState } from "react";
import {
  Clock,
  GripVertical,
  Plus,
  SlidersVertical,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { formatClockTime } from "@/lib/format";

const AUTO_DISTRIBUTED_24H = ["09:00", "10:30", "13:30", "15:00", "16:15"];

/** Converts "09:00 AM" / "1:30 PM" / "09:00" into 24-hour "HH:MM" for `<input type="time">`. */
function to24Hour(label: string): string {
  const trimmed = label.trim();
  const match = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) {
    return /^\d{2}:\d{2}$/.test(trimmed) ? trimmed : "09:00";
  }
  let hours = Number(match[1]);
  const minutes = match[2];
  const meridiem = match[3].toUpperCase();
  if (meridiem === "PM" && hours !== 12) hours += 12;
  if (meridiem === "AM" && hours === 12) hours = 0;
  return `${String(hours).padStart(2, "0")}:${minutes}`;
}

/**
 * Figma Edit Time Slot Dialog (678:18944):
 * Scrollable list of native `<input type="time">` slot rows (trash circle + pill time input + drag grip),
 * "Add new slot" row, "Auto distribute time" pill button, red warning toggle
 * "Apply to Existing Appointments", and static Close / Save footer.
 */
export function EditTimeSlotsDialog({
  open,
  onOpenChange,
  dayName,
  initialSlots,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dayName: string;
  initialSlots: string[];
  onSave: (slots: string[], applyToExisting: boolean) => void;
}) {
  const [slots, setSlots] = useState<string[]>(() =>
    initialSlots.map(to24Hour),
  );
  const [newSlot, setNewSlot] = useState("");
  const [applyToExisting, setApplyToExisting] = useState(false);

  function handleSlotChange(idx: number, val: string) {
    setSlots((prev) => prev.map((s, i) => (i === idx ? val : s)));
  }

  function handleDeleteSlot(idx: number) {
    setSlots((prev) => prev.filter((_, i) => i !== idx));
  }

  function handleAddSlot() {
    if (!newSlot) {
      toast.error("Pick a time first.");
      return;
    }
    setSlots((prev) => [...prev, newSlot]);
    setNewSlot("");
  }

  function handleAutoDistribute() {
    setSlots(AUTO_DISTRIBUTED_24H);
    toast.success(`Auto-distributed slots for ${dayName}`);
  }

  function handleSave() {
    const cleaned = slots.filter(Boolean).map((hhmm) => formatClockTime(hhmm));
    if (cleaned.length === 0) {
      toast.error("Keep at least one time slot.");
      return;
    }
    onSave(cleaned, applyToExisting);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-[420px]">
        {/* Static Header Band */}
        <div className="bg-muted/40 border-border shrink-0 border-b p-5 pr-12 text-left">
          <DialogTitle className="text-foreground text-[16px] font-medium">
            Edit Time Slot for {dayName}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Add, edit, or remove available consultation slots for {dayName}.
          </DialogDescription>
        </div>

        {/* Scrollable Slot Rows */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="border-border space-y-2.5 border-b p-5">
            {slots.map((slot, idx) => (
              <div key={idx} className="flex items-center gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label={`Remove slot ${formatClockTime(slot)}`}
                  onClick={() => handleDeleteSlot(idx)}
                  className="shrink-0"
                >
                  <Trash2 strokeWidth={1.5} className="size-4" />
                </Button>

                <label className="bg-card border-border shadow-steady-card focus-within:ring-ring/40 flex h-12 flex-1 cursor-pointer items-center justify-between gap-2 rounded-full border px-5 transition-shadow focus-within:ring-[3px]">
                  <input
                    type="time"
                    value={slot}
                    onChange={(e) => handleSlotChange(idx, e.target.value)}
                    aria-label={`Time slot ${idx + 1}`}
                    className="text-foreground w-full cursor-pointer bg-transparent text-[15px] outline-none [&::-webkit-calendar-picker-indicator]:opacity-0"
                  />
                  <Clock
                    aria-hidden
                    strokeWidth={1.5}
                    className="text-foreground/75 pointer-events-none size-4 shrink-0"
                  />
                </label>

                <GripVertical
                  aria-hidden
                  strokeWidth={1.5}
                  className="text-muted-foreground size-4 shrink-0"
                />
              </div>
            ))}

            {/* Add New Slot Row */}
            <div className="flex items-center gap-2.5">
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Add new time slot"
                onClick={handleAddSlot}
                className="shrink-0"
              >
                <Plus strokeWidth={1.5} className="size-4" />
              </Button>

              <label className="bg-card border-border shadow-steady-card focus-within:ring-ring/40 flex h-12 flex-1 cursor-pointer items-center justify-between gap-2 rounded-full border px-5 transition-shadow focus-within:ring-[3px]">
                <input
                  type="time"
                  value={newSlot}
                  onChange={(e) => setNewSlot(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddSlot();
                    }
                  }}
                  aria-label="Add new slot"
                  className="text-foreground w-full cursor-pointer bg-transparent text-[15px] outline-none [&::-webkit-calendar-picker-indicator]:opacity-0"
                />
                <Clock
                  aria-hidden
                  strokeWidth={1.5}
                  className="text-foreground/75 pointer-events-none size-4 shrink-0"
                />
              </label>

              <GripVertical
                aria-hidden
                strokeWidth={1.5}
                className="text-muted-foreground/40 size-4 shrink-0"
              />
            </div>
          </div>

          {/* Auto Distribute + Apply to Existing Appointments */}
          <div className="space-y-4 p-5">
            <Button
              type="button"
              variant="outline"
              onClick={handleAutoDistribute}
              className="w-full"
            >
              <SlidersVertical strokeWidth={1.5} className="size-4" />
              Auto Distribute Time
            </Button>

            <label className="flex cursor-pointer items-start gap-3 text-left">
              <Switch
                checked={applyToExisting}
                onCheckedChange={setApplyToExisting}
                aria-label="Apply to Existing Appointments"
                className="mt-0.5"
              />
              <div className="space-y-0.5">
                <p className="text-destructive text-[15px] leading-snug font-medium">
                  Apply to Existing Appointments
                </p>
                <p className="text-foreground/80 text-[14px] leading-snug">
                  This will affect pending or approved appointments. Proceed
                  with caution.
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Static Footer Band */}
        <div className="bg-muted/40 border-border flex shrink-0 items-center justify-end gap-2.5 border-t p-5">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
          <Button type="button" onClick={handleSave}>
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
