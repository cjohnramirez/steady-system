"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
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
        variant="outline"
        onClick={() => setOpen(true)}
        disabled={students.length === 0}
        className="px-5"
      >
        <Plus strokeWidth={1.5} className="size-4" />
        Manual Booking
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
