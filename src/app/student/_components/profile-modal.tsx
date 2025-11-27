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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { updateStudentProfile } from "@/app/admin/accounts/@modal/actions";
import { toast } from "sonner";
import { useForm } from "@tanstack/react-form";
import { Edit2 } from "lucide-react";
import { useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { FormInputField } from "@/components/form-input-field";
import CollegeDropdown from "@/app/auth/signup/components/college-dropdown";
import DepartmentDropdown from "@/app/auth/signup/components/department-dropdown";
import FormYearLevelField from "@/components/form-year-level-field";
import { studentUpdateFormSchema } from "@/app/admin/accounts/@modal/schema";
import z from "zod";
import { fetchStudent } from "@/app/admin/appointments/@modal/actions";

interface StudentModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  id: string;
}

export default function StudentProfileModal({ open, setOpen, id }: StudentModalProps) {
  const queryClient = useQueryClient();
  const [college, setCollege] = useState("");

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
      username: student?.username || "",
      college_id: student?.college_id || "",
      department_id: student?.department_id || "",
      university_id: String(student?.university_id || ""),
      email: student?.email || "",
      year_level: String(student?.year_level || ""),
      id: String(student?.id),
    },
    validators: {
      onChange: studentUpdateFormSchema.extend({
        college_id: z.uuid({ message: "College is required" }),
      }),
    },
    onSubmit: ({ value }) => {
      const { college_id, ...rest } = value;
      console.log(rest)
      updateMutation.mutate({
        ...rest,
        id: student?.id || "",
        university_id: Number(value.university_id),
        year_level: Number(value.year_level),
      });
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
        className="sm:max-w-[800px]"
        showCloseButton={false}
        onInteractOutside={() => {
          setOpen(false);
        }}
      >
        <DialogHeader>
          <DialogTitle>Edit Account</DialogTitle>
        </DialogHeader>
        <form
          className="grid grid-cols-[170px_auto_auto] grid-rows-[auto_auto_auto] gap-2 pt-5"
          id="update-student-profile-form"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <div className="row-span-2 h-full w-full">
            <div className="from-brand-light to-brand-normal relative flex h-36 w-36 items-center justify-center rounded-full bg-gradient-to-t">
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
            <form.Field name="username">
              {(field) => (
                <FormInputField
                  label="Username"
                  placeholder="Enter username"
                  field={field}
                />
              )}
            </form.Field>
          </div>
          <div className="h-full w-full">
            <form.Field name="college_id">
              {(field) => (
                <CollegeDropdown
                  field={field}
                  setCollege={setCollege}
                  enableDescription={false}
                />
              )}
            </form.Field>
          </div>
          <div className="h-full w-full pb-4">
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
          <div className="h-full w-full">
            <form.Field name="university_id">
              {(field) => (
                <FormInputField
                  label="University ID"
                  placeholder="Enter a valid university ID (student)"
                  field={field}
                />
              )}
            </form.Field>
          </div>
          <div className="h-full w-full">
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
          <div className="h-full w-full">
            <form.Field name="year_level">
              {(field) => <FormYearLevelField field={field} />}
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
