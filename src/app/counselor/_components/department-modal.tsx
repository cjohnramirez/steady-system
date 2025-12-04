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
import { fetchCounselorDeparments } from "../actions";
import { createClient } from "@/utils/supabase/client";
import { useUserStore } from "@/hooks/auth-store";
import { GraduationCap } from "lucide-react";

interface StudentModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export default function DepartmentModal({ open, setOpen }: StudentModalProps) {
  const supabase = createClient();
  const userID = useUserStore.getState().id;

  const { data: departments } = useQuery({
    queryKey: ["counselor-departments", userID],
    queryFn: () => fetchCounselorDeparments(supabase, userID),
  });

  return (
    <Dialog
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
          <DialogTitle>View Departments</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-3 gap-4">
          {departments?.map((department, idx) => (
            <div key={idx} className="my-5 rounded-2xl border p-4 space-y-2">
              <GraduationCap strokeWidth={1.25} />
              <p>{department.title}</p>
            </div>
          ))}
        </div>
        <DialogFooter>
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
