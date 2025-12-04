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
import { useQuery } from "@tanstack/react-query";
import { fetchCounselorAppointment, fetchCounselorProfile } from "../actions";
import { createClient } from "@/utils/supabase/client";
import DateTimeSection from "@/app/student/appointment/_components/date-time-section";
import { startTransition, useEffect, useState } from "react";
import { useUserStore } from "@/hooks/auth-store";
import { Tables } from "@/types/supabase";
import { ampmTo24, generateTimeSlots, toAMPM } from "@/lib/format";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { parseISO } from "date-fns";
import { useConfirmStore } from "@/hooks/confirm-store";
import { toast } from "sonner";

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
  const { confirm } = useConfirmStore();

  const [dayOfWeek, setDayOfWeek] = useState<Boolean[]>([]);
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const [isActive, setIsActive] = useState<string>("");

  useEffect(() => {
    if (!counselorProfile) return;

    startTransition(() => {
      setDayOfWeek(counselorProfile.day_of_week ?? Array(7).fill(false));
      setStartTime(
        counselorProfile.start_time ? toAMPM(counselorProfile.start_time) : "",
      );
      setEndTime(
        counselorProfile.end_time ? toAMPM(counselorProfile.end_time) : "",
      );
      setIsActive(String(counselorProfile.is_active));
    });
  }, [counselorProfile]);

  const timeSlots = generateTimeSlots("06:00", "20:30");

  const handleSubmit = async () => {
    const ok = await confirm(
      "Change this appointment?",
      "This action cannot be undone.",
    );

    if (!ok) toast.error("Appointment error");

    console.log("Appointment changed!", {
      dayOfWeek,
      startTime: ampmTo24(startTime),
      endTime: ampmTo24(endTime),
      isActive,
    });
  };

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
        <div className="mt-3">
          <p className="font-medium">Select Day of Week</p>
          <p className="mb-5">
            Days selected will be marked as available to students for
            appointments
          </p>
          <div className="flex gap-2">
            {counselorProfile &&
              DAY_NAMES.map((day, idx) => (
                <Button
                  key={day}
                  variant={dayOfWeek[idx] ? "default" : "outline"}
                  onClick={() => {
                    setDayOfWeek((prev) => {
                      const updated = [...prev];
                      updated[idx] = !updated[idx];
                      return updated;
                    });
                  }}
                >
                  {day}
                </Button>
              ))}
          </div>
        </div>
        <div className="my-5 flex gap-10">
          <div>
            <p className="font-medium">Select Start and End Time</p>
            <div className="mt-5 flex gap-4">
              <div>
                <p className="font-medium">Start Time</p>
                <Select
                  value={startTime}
                  onValueChange={(val) => setStartTime(val)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a start time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((slot) => (
                      <SelectItem key={slot} value={slot}>
                        {slot}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <p className="font-medium">End Time</p>
                <Select
                  value={endTime}
                  onValueChange={(val) => setEndTime(val)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select an end time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((slot) => (
                      <SelectItem key={slot} value={slot}>
                        {slot}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <div>
            <p className="font-medium">Active Status</p>
            <p>This overrides availability, defaults to None</p>
            <div className="mt-5">
              <Select
                value={isActive}
                onValueChange={(val) => setIsActive(val)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select active status" />
                </SelectTrigger>
                <SelectContent>
                  {ACTIVE_STATUS.map((status) => (
                    <SelectItem key={status.name} value={status.value}>
                      <div
                        className={`h-2 w-2 rounded-full ` + status.color}
                      ></div>
                      <p>{status.name}</p>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <div className="flex gap-2">
            <Button onClick={handleSubmit}>Save Changes</Button>
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
