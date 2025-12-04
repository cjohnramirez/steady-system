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
import { fetchEmotionalStatus, updateStudentProfile } from "../../actions";
import { toast } from "sonner";
import { useForm } from "@tanstack/react-form";
import { Edit2 } from "lucide-react";
import { useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { FormInputField } from "@/components/form-input-field";
import CollegeDropdown from "@/app/auth/signup/components/college-dropdown";
import DepartmentDropdown from "@/app/auth/signup/components/department-dropdown";
import FormYearLevelField from "@/components/form-year-level-field";
import { studentUpdateFormSchema } from "../../schema";
import { fetchStudent } from "@/app/admin/appointments/@modal/actions";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import EmotionalStatusDropdown from "@/app/auth/signup/components/emotional-status-dropdown";

export default function StudentModal({ id }: { id?: string }) {
  const queryClient = useQueryClient();

  const params = useParams();
  const resolvedId = id ?? params?.id;
  const router = useRouter();

  const [college, setCollege] = useState("");
  const [selectEmotionalStatus, setSelectEmotionalStatus] = useState("");
  const [emotionalStatus, setEmotionalStatus] = useState("");

  const { data: student } = useQuery({
    queryKey: ["student", params.id],
    queryFn: () =>
      resolvedId ? fetchStudent(resolvedId[0]) : Promise.resolve(undefined),
    initialData: () => {
      const allQueries = queryClient.getQueriesData({
        queryKey: ["students"],
      });

      for (const [_key, queryResult] of allQueries) {
        const listData = (queryResult as any)?.data;
        const found = listData?.find((a: any) => a.id === params.id);
        if (found) return found;
      }
      return undefined;
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateStudentProfile,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["students"] });
      toast.success("Student profile updated successfully!");
      router.back();
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to update student profile");
    },
  });

  const form = useForm({
    defaultValues: {
      first_name: student.first_name ?? "",
      last_name: student.last_name ?? "",
      username: student.username ?? "",
      department_id: student.department_id ?? "",
      university_id: student.university_id ?? "",
      email: student.email ?? "",
      year_level: student.year_level ?? "",
      id: student.id ?? "",
      phone: student.phone ?? "",
      emotional_status_id: selectEmotionalStatus ?? "",
      college_id: student.college_id ?? college ?? "",
    },
    validators: {
      onChange: studentUpdateFormSchema,
    },
    onSubmit: ({ value }) => {
      updateMutation.mutate(value);
    },
  });

  return (
    <Dialog
      open={Boolean(resolvedId)}
      onOpenChange={(isOpen) => {
        if (!isOpen) router.push("/admin/accounts");
      }}
    >
      <DialogContent
        className="sm:max-w-[800px]"
        showCloseButton={false}
        onInteractOutside={() => router.back()}
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
          <div>
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
            <Button onClick={() => router.back()} variant="outline">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
