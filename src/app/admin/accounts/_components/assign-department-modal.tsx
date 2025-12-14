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
import { Spinner } from "@/components/ui/spinner";
import { useUserStore } from "@/hooks/auth-store";
import { fetchCounselorDepartment } from "../actions";
import { useQuery } from "@tanstack/react-query";

interface AnnouncementModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  id: string;
}

export default function AssignDepartmentModal({
  open,
  setOpen,
  id,
}: AnnouncementModalProps) {
  const { data: counselorDepartments, isLoading } = useQuery({
    queryKey: ["counselor-department", id],
    queryFn: () => fetchCounselorDepartment(id),
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
      }}
    >
      <DialogContent
        className="sm:max-w-[600px]"
        showCloseButton={false}
        onInteractOutside={() => {
          setOpen(false);
        }}
      >
        <DialogHeader>
          <DialogTitle>Assign Departments</DialogTitle>
        </DialogHeader>
        <div>
          {counselorDepartments?.map((department) => (
            <p key={department.id}>{department.title}</p>
          ))}
        </div>
        <DialogFooter>
          <Button
            type="submit"
            form="insert-counselor-profile-form"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            Submit
          </Button>
          <DialogClose asChild>
            <Button
              variant="outline"
              onClick={(e) => {
                setOpen(false);
                e.stopPropagation();
              }}
            >
              Cancel
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
