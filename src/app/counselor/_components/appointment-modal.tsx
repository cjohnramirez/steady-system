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
import { fetchCounselorAppointment } from "../actions";
import { createClient } from "@/utils/supabase/client";
import { Edit2 } from "lucide-react";
import { toast } from "sonner";
import { dateToString } from "@/lib/format";

interface StudentModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  id: string;
}

export default function CounselorAppointmentModal({
  open,
  setOpen,
  id,
}: StudentModalProps) {
  const supabase = createClient();

  const { data: counselorAppointment } = useQuery({
    queryKey: ["counselor-appointment", id],
    queryFn: () => fetchCounselorAppointment(supabase, id),
  });

  const isNotesEmpty = counselorAppointment?.notes?.length === 0;

  return (
    <> <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
      }}
    >
      <DialogContent
        className="sm:max-w-[800px]"
        showCloseButton={false}
        onInteractOutside={() => {
          setOpen(false);
        }}
      >
        <DialogHeader>
          <DialogTitle>View Appointment</DialogTitle>
        </DialogHeader>
        <div className="my-5 grid grid-cols-[150px_1fr_1fr] grid-rows-3 gap-4">
          <div className="from-brand-light to-brand-normal relative row-span-3 flex h-30 w-30 items-center justify-center rounded-full bg-linear-to-t">
            <div className="absolute right-0 bottom-0 cursor-pointer rounded-full border border-gray-200 bg-white p-4">
              <Edit2
                onClick={() => toast.info("This is an upcoming feature")}
                size={20}
              />
            </div>
          </div>
          <div>
            <p className="font-medium">First Student Name</p>
            <p>{counselorAppointment?.first_student_name}</p>
          </div>
          <div>
            <p className="font-medium">Last Student Name</p>
            <p>{counselorAppointment?.last_student_name}</p>
          </div>
          <div>
            <p className="font-medium">Student ID</p>
            <p>{counselorAppointment?.student_university_id}</p>
          </div>
          <div className="">
            <p className="font-medium">Email</p>
            <p>{counselorAppointment?.student_email}</p>
          </div>
          <div className="col-span-2 flex gap-4">
            <div className="w-full">
              <p className="font-medium">Notes</p>
              <p className={`${isNotesEmpty ? "text-gray-500" : ""}`}>
                {isNotesEmpty ? "No notes given" : counselorAppointment?.notes}
              </p>
            </div>
            <div className="w-full">
              <p className="font-medium">Scheduled At</p>
              <p>{dateToString(counselorAppointment?.scheduled_at ?? "")}</p>
            </div>
          </div>
        </div>
        <DialogFooter>
          <div className="flex gap-2">
            <DialogClose asChild>
              <Button
                variant="outline"
                onClick={() => {
                  setOpen(false);
                }}
              >
                Exit
              </Button>
            </DialogClose>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog></>
   
  );
}
