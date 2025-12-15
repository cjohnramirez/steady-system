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
  const [college, setCollege] = useState("");
  const [emotionalStatus] = useState("");

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
          <DialogTitle>Edit Account</DialogTitle>
        </DialogHeader>
        <form
          className="grid grid-cols-[170px_auto_auto] grid-rows-[auto_auto_auto] gap-5 pt-5"
          id="update-student-profile-form"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <div className="row-span-7 h-full w-full">
            <div className="from-brand-light to-brand-normal relative flex h-36 w-36 items-center justify-center rounded-full bg-linear-to-t">
              <div className="absolute right-0 bottom-0 cursor-pointer rounded-full border border-gray-200 bg-white p-2">
                <Edit2
                  onClick={() => toast.info("This is an upcoming feature")}
                  size={20}
                />
              </div>
            </div>
          </div>
          <div className="col-span-2 flex h-full w-full gap-2">
            <form.Field name="first_name">
              {(field) => (
                <FormInputField
                  label="First Name"
                  placeholder="Enter first name"
                  field={field}
                />
              )}
            </form.Field>
            <form.Field name="last_name">
              {(field) => (
                <FormInputField
                  label="Last Name"
                  placeholder="Enter last name"
                  field={field}
                />
              )}
            </form.Field>
            <form.Field name="middle_name">
              {(field) => (
                <FormInputField
                  label="Middle Name (Optional)"
                  placeholder="Enter middle name"
                  field={field}
                />
              )}
            </form.Field>
          </div>
          <div className="col-span-2 flex h-full w-full gap-2">
            <form.Field name="username">
              {(field) => (
                <FormInputField
                  label="Username"
                  placeholder="Enter username"
                  field={field}
                />
              )}
            </form.Field>
            <form.Field name="email">
              {(field) => (
                <FormInputField
                  label="Email"
                  placeholder="Enter a valid email"
                  field={field}
                />
              )}
            </form.Field>
          </div>
          <div className="col-span-2 flex h-full w-full gap-2">
            <form.Field name="age">
              {(field) => (
                <FormInputField
                  label="Age"
                  placeholder="Enter your age"
                  field={field}
                  type="number"
                />
              )}
            </form.Field>
            <form.Field name="gender">
              {(field) => (
                <GenderField field={field} enableDescription={false} />
              )}
            </form.Field>
          </div>
          <div className="col-span-2 flex h-full w-full gap-2">
            <form.Field name="college">
              {(field) => (
                <CollegeDropdown
                  field={field}
                  setCollege={setCollege}
                  enableDescription={false}
                />
              )}
            </form.Field>

            <form.Field name="department_id">
              {(field) => (
                <DepartmentDropdown
                  field={field}
                  college={college}
                  enableDescription={false}
                />
              )}
            </form.Field>
          </div>
          <div className="col-span-2 flex h-full w-full gap-2">
            <form.Field name="year_level">
              {(field) => (
                <FormYearLevelField field={field} enableDescription={false} />
              )}    
            </form.Field>
            <form.Field name="university_id">
              {(field) => (
                <FormInputField
                  label="University ID"
                  placeholder="Enter a valid university ID (student)"
                  field={field}
                  type="number"
                />
              )}
            </form.Field>
          </div>
          <div className="col-span-2 flex h-full w-full gap-2">
            <form.Field name="phone">
              {(field) => (
                <FormInputField
                  label="Phone Number"
                  placeholder="Enter a valid phone number"
                  field={field}
                />
              )}
            </form.Field>
            <form.Field name="emotional_status_id">
              {(field) => (
                <EmotionalStatusDropdown
                  field={field}
                  emotionalStatus={emotionalStatus}
                  enableDescription={false}
                />
              )}
            </form.Field>
          </div>
        </form>
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
