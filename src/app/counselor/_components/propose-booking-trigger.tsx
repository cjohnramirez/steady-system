"use client";

import { useState } from "react";
import { CalendarPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ProposedBookingDialog,
  type BookingStudentOption,
} from "@/components/counselor/proposed-booking-dialog";

export function ProposeBookingTrigger({
  counselorName,
  students,
}: {
  counselorName: string;
  students: BookingStudentOption[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        onClick={() => setOpen(true)}
        disabled={students.length === 0}
      >
        <CalendarPlus className="size-4" />
        Propose Booking
      </Button>

      <ProposedBookingDialog
        open={open}
        onOpenChange={setOpen}
        counselorName={counselorName}
        students={students}
      />
    </>
  );
}
