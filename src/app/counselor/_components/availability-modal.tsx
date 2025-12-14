"use client";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateCounselorAvailability } from "../actions";
import { Tables } from "@/types/supabase";
import { generateTimeSlots, toAMPM } from "@/lib/format";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useConfirmStore } from "@/hooks/confirm-store";
import { toast } from "sonner";
import { useUserStore } from "@/hooks/auth-store";
import { Info } from "lucide-react";
import { useForm } from "@tanstack/react-form";

interface AvailabilityModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  counselorProfile: Tables<"counselor_with_details"> | undefined;
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const ACTIVE_STATUS = [
  {
    color: "bg-gray-300",
    value: "null",
    name: "None",
  },
  {
    color: "bg-green-300",
    value: "true",
    name: "Active",
  },
  {
    color: "bg-red-300",
    value: "false",
    name: "Inactive",
  },
];

export default function AvailabilityModal({
  open,
  setOpen,
  counselorProfile,
}: AvailabilityModalProps) {
  const { confirm, startLoading, stopLoading } = useConfirmStore();
  const queryClient = useQueryClient();
  const counselorID = useUserStore.getState().id;

  const updateMutation = useMutation({
    mutationFn: updateCounselorAvailability,
    onSuccess: async () => {
      toast.success("Counselor profile updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["counselor-profile"] });

      setOpen(false);
      stopLoading();
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to update counselor profile");
      stopLoading();
    },
  });
  
  const timeSlots = generateTimeSlots("06:00", "20:30");

  const form = useForm({
    defaultValues: {
      day_of_week: counselorProfile?.day_of_week ?? Array(7).fill(false),
      start_time: counselorProfile?.start_time
        ? toAMPM(counselorProfile.start_time)
        : "",
      end_time: counselorProfile?.end_time
        ? toAMPM(counselorProfile.end_time)
        : "",
      is_active: (counselorProfile?.is_active ?? null) as boolean | null,
      id: counselorID,
    },
    onSubmit: async ({ value }) => {
      const ok = await confirm(
        "Change this appointment?",
        "This action cannot be undone.",
      );

      if (!ok) return;
      startLoading();
      updateMutation.mutate(value);
    },
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
      }}
    >
      <DialogContent
        className="sm:max-w-[650px]"
        showCloseButton={false}
        onInteractOutside={() => {
          setOpen(false);
        }}
      >
        <DialogHeader>
          <DialogTitle>Change Availability</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          id="update-availability-form"
        >
          <div>
            <div className="col-span-3 mt-3 mb-7 flex w-full items-center gap-5 rounded-2xl border bg-white p-5">
              <Info strokeWidth={1.25} />
              <div className="flex-1">
                <p className="font-medium">Important Notice</p>
                <p className="text-sm">
                  Please be aware that changing your availability may affect
                  existing appointments. Review your schedule before saving
                  changes.
                </p>
              </div>
            </div>
            <p className="font-medium">Select Day of Week</p>
            <p className="mb-5">
              Days selected will be marked as available to students for
              appointments
            </p>
            <form.Field name="day_of_week">
              {(field) => (
                <div className="flex gap-2">
                  {counselorProfile &&
                    DAY_NAMES.map((day, idx) => (
                      <Button
                        key={day}
                        type="button"
                        variant={field.state.value[idx] ? "default" : "outline"}
                        onClick={() => {
                          const dayOfWeek = [...field.state.value];
                          dayOfWeek[idx] = !dayOfWeek[idx];
                          field.handleChange(dayOfWeek);
                        }}
                      >
                        {day}
                      </Button>
                    ))}
                </div>
              )}
            </form.Field>
          </div>
          <div className="my-5 flex gap-10">
            <div>
              <p className="font-medium">Select Start and End Time</p>
              <div className="mt-5 flex gap-4">
                <div>
                  <p className="font-medium">Start Time</p>
                  <form.Field name="start_time">
                    {(field) => (
                      <Select
                        value={field.state.value}
                        onValueChange={(val) => field.handleChange(val)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a start time" />
                        </SelectTrigger>
                        <SelectContent>
                          {timeSlots.map((slot, idx) => (
                            <SelectItem key={idx} value={slot}>
                              {slot}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </form.Field>
                </div>
                <div>
                  <p className="font-medium">End Time</p>
                  <form.Field name="end_time">
                    {(field) => (
                      <Select
                        value={field.state.value}
                        onValueChange={(val) => field.handleChange(val)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select an end time" />
                        </SelectTrigger>
                        <SelectContent>
                          {timeSlots.map((slot, idx) => (
                            <SelectItem key={idx} value={slot}>
                              {slot}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </form.Field>
                </div>
              </div>
            </div>
            <div>
              <p className="font-medium">Active Status</p>
              <p>This overrides availability, defaults to None</p>
              <div className="mt-5">
                <form.Field name="is_active">
                  {(field) => (
                    <Select
                      value={String(field.state.value)}
                      onValueChange={(val) =>
                        field.handleChange(
                          val === "null" ? null : val === "true",
                        )
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select active status" />
                      </SelectTrigger>
                      <SelectContent>
                        {ACTIVE_STATUS.map((status) => (
                          <SelectItem key={status.name} value={status.value}>
                            <div
                              className={`h-2 w-2 rounded-full ${status.color}`}
                            />
                            {status.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </form.Field>
              </div>
            </div>
          </div>
        </form>
        <DialogFooter>
          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={updateMutation.isPending}
              form="update-availability-form"
            >
              Save Changes
            </Button>
            <DialogClose asChild>
              <Button
                variant="outline"
                onClick={() => {
                  setOpen(false);
                }}
              >
                Cancel
              </Button>
            </DialogClose>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
