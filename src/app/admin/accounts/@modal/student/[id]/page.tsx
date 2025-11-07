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
import { useRouter, useParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Tables } from "@/types/supabase";

export default function StudentModal({ id }: { id?: string }) {
  const queryClient = useQueryClient();

  const params = useParams();
  const resolvedId = id ?? params?.id;
  const router = useRouter();

  const students =
    queryClient.getQueryData<Tables<"student_with_details">[]>(["students"]) ||
    [];

  const currentStudent = students[Number(resolvedId)];

  return (
    <Dialog
      open={Boolean(resolvedId)}
      onOpenChange={(isOpen) => {
        if (!isOpen) router.push("/admin/accounts");
      }}
    >
      <DialogContent
        className="sm:max-w-[425px]"
        showCloseButton={false}
        onInteractOutside={() => router.back()}
      >
        <DialogHeader>
          <DialogTitle>Student Details</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          <p>Row ID: {currentStudent.college_id}</p>
          <p>Department: {currentStudent?.college}</p>
        </div>

        <DialogFooter>
          <Button>
            <a href="https://youtu.be/xKRf-VvfiYY?list=RDxKRf-VvfiYY&t=183">
              Click
            </a>
          </Button>
          <DialogClose asChild>
            <Button onClick={() => router.back()}>Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
