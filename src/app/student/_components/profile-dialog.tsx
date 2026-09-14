"use client";

import { useRouter } from "next/navigation";
import { useForm, useStore } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FieldGroup } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { FormInputField } from "@/components/form-input-field";
import { FormSelectField } from "@/components/form-select-field";
import { InfoCallout } from "@/components/app/info-callout";
import type { Tables } from "@/types/supabase";
import { updateOwnProfile } from "@/lib/students/actions";
import { queryKeys } from "@/lib/query-keys";
import { strToTitleCase } from "@/lib/format";
import { GENDERS, studentSelfUpdateSchema } from "@/lib/validation/student";

const YEAR_LEVELS = [1, 2, 3, 4, 5, 6].map((year) => ({
  value: String(year),
  label: `Year ${year}`,
}));

/**
 * A student edits their own profile. College, department and university ID are
 * shown as read-only: changing them decides which counselor sees the student, so
 * only the guidance office may.
 */
export default function ProfileDialog({
  open,
  onOpenChange,
  student,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: Tables<"student_with_details">;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const formId = "student-profile-form";

  const form = useForm({
    defaultValues: {
      first_name: student.first_name ?? "",
      middle_name: student.middle_name ?? "",
      last_name: student.last_name ?? "",
      username: student.username ?? "",
      phone: student.phone ?? "",
      gender: (student.gender ?? "") as (typeof GENDERS)[number],
      age: student.age ?? 0,
      year_level: student.year_level ?? 0,
    },
    validators: {
      onSubmit: studentSelfUpdateSchema,
      onBlur: studentSelfUpdateSchema,
    },
    onSubmit: async ({ value }) => {
      const result = await updateOwnProfile(value);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Profile saved.");
      await queryClient.invalidateQueries({ queryKey: queryKeys.students.all });
      onOpenChange(false);
      router.refresh();
    },
  });

  const isSubmitting = useStore(form.store, (state) => state.isSubmitting);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>
            Changes are visible to your counselor right away.
          </DialogDescription>
        </DialogHeader>
        <form
          id={formId}
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            void form.handleSubmit();
          }}
        >
          <FieldGroup className="gap-5">
            <div className="grid gap-4 sm:grid-cols-3">
              <form.Field name="first_name">
                {(field) => <FormInputField field={field} label="First name" />}
              </form.Field>
              <form.Field name="middle_name">
                {(field) => (
                  <FormInputField field={field} label="Middle name" optional />
                )}
              </form.Field>
              <form.Field name="last_name">
                {(field) => <FormInputField field={field} label="Last name" />}
              </form.Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <form.Field name="username">
                {(field) => (
                  <FormInputField
                    field={field}
                    label="Username"
                    autoComplete="username"
                  />
                )}
              </form.Field>
              <form.Field name="phone">
                {(field) => (
                  <FormInputField
                    field={field}
                    label="Phone"
                    type="tel"
                    optional
                  />
                )}
              </form.Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <form.Field name="age">
                {(field) => (
                  <FormInputField
                    field={field}
                    label="Age"
                    type="number"
                    inputMode="numeric"
                  />
                )}
              </form.Field>
              <form.Field name="gender">
                {(field) => (
                  <FormSelectField
                    field={field}
                    label="Gender"
                    options={GENDERS.map((g) => ({
                      value: g,
                      label: strToTitleCase(g),
                    }))}
                  />
                )}
              </form.Field>
              <form.Field name="year_level">
                {(field) => (
                  <FormSelectField
                    field={field}
                    label="Year level"
                    options={YEAR_LEVELS}
                    parse={Number}
                  />
                )}
              </form.Field>
            </div>
            <InfoCallout title="Enrollment details">
              {student.college_name} · {student.department} · ID{" "}
              {student.university_id}. Contact the guidance office to change
              these.
            </InfoCallout>
          </FieldGroup>
        </form>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" form={formId} disabled={isSubmitting}>
            {isSubmitting && <Spinner />}
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
