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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchStudent,
  updateStudentProfile,
} from "@/app/admin/accounts/@modal/actions";
import { toast } from "sonner";
import { useForm } from "@tanstack/react-form";
import { Edit2 } from "lucide-react";
import { useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { FormInputField } from "@/components/form-input-field";
import CollegeDropdown from "@/app/auth/signup/components/college-dropdown";
import DepartmentDropdown from "@/app/auth/signup/components/department-dropdown";
import FormYearLevelField from "@/components/form-year-level-field";
import GenderField from "@/components/form-gender-field";
import EmotionalStatusDropdown from "@/app/auth/signup/components/emotional-status-dropdown";
import { studentUpdateFormSchema } from "@/app/auth/signup/schema";

interface StudentModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  id: string;
}

export default function StudentProfileModal({
  open,
  setOpen,
  id,
}: StudentModalProps) {
  const queryClient = useQueryClient();

  const { data: student } = useQuery({
    queryKey: ["student-user"],
    queryFn: () => fetchStudent(id),
  });

  const updateMutation = useMutation({
    mutationFn: updateStudentProfile,
    onSuccess: async () => {
      toast.success("Student profile updated successfully!");
      setOpen(false);

      queryClient.invalidateQueries({ queryKey: ["student-user"] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to update student profile");
    },
  });

  const form = useForm({
    defaultValues: {
      first_name: student?.first_name || "",
      last_name: student?.last_name || "",
      middle_name: student?.middle_name || "",
      username: student?.username || "",
      college: student?.college_id || "",
      department_id: student?.department_id || "",
      university_id: student?.university_id || 0,
      email: student?.email || "",
      year_level: student?.year_level || 0,
      id: String(student?.id) || "",
      phone: student?.phone ? String(student.phone) : "",
      emotional_status_id: student?.emotional_status_id || "",
      age: student?.age || 0,
      gender: student?.gender || "",
    },
    onSubmitInvalid: ({formApi}) => {
      console.log(formApi.state.values);
      console.log(formApi.state.errors);
    },
    validators: {
      onChange: studentUpdateFormSchema
    },
    onSubmit: async ({ value }) => {
      const {college, ...rest } = value
      updateMutation.mutate(rest);
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
        className="sm:max-w-[900px]"
        showCloseButton={false}
        onInteractOutside={() => {
          setOpen(false);
        }}
      >
        <DialogHeader>
          <DialogTitle>Edit Contact Person(s)</DialogTitle>
        </DialogHeader>
        <form ></form>
        <DialogFooter>
          <Button
            type="submit"
            disabled={updateMutation.isPending}
            form="update-student-profile-form"
          >
            {updateMutation.isPending ? <Spinner /> : "Update"}
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
