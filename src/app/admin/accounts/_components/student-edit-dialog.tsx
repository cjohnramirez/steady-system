"use client";

import { useMemo } from "react";
import { useForm, useStore } from "@tanstack/react-form";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
  FieldLegend,
} from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/app/error-state";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { FormInputField } from "@/components/form-input-field";
import { FormSelectField } from "@/components/form-select-field";
import { createClient } from "@/utils/supabase/client";
import type { Tables } from "@/types/supabase";
import { adminUpdateStudent } from "@/lib/students/actions";
import { fetchStudentRow } from "@/lib/students/queries";
import { fetchColleges, fetchDepartments } from "@/lib/reference/queries";
import { queryKeys } from "@/lib/query-keys";
import { strToTitleCase } from "@/lib/format";
import { adminStudentUpdateSchema, GENDERS } from "@/lib/validation/student";

const YEAR_LEVELS = [1, 2, 3, 4, 5, 6].map((y) => ({
  value: String(y),
  label: `Year ${y}`,
}));

export default function StudentEditDialog({
  student,
  onClose,
}: {
  student: Tables<"student_with_details">;
  onClose: () => void;
}) {
  const supabase = useMemo(() => createClient(), []);
  const row = useQuery({
    queryKey: [...queryKeys.students.detail(student.id!), "row"],
    queryFn: () => fetchStudentRow(supabase, student.id!),
  });

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {student.first_name} {student.last_name}
          </DialogTitle>
          <DialogDescription>{student.email}</DialogDescription>
        </DialogHeader>
        {row.data ? (
          <StudentForm
            student={student}
            isDisabled={row.data.is_disabled}
            onClose={onClose}
          />
        ) : row.isError ? (
          <ErrorState
            title="This student couldn't be loaded"
            onRetry={() => row.refetch()}
          />
        ) : (
          <Skeleton className="h-96 rounded-xl" />
        )}
      </DialogContent>
    </Dialog>
  );
}

function StudentForm({
  student,
  isDisabled,
  onClose,
}: {
  student: Tables<"student_with_details">;
  isDisabled: boolean;
  onClose: () => void;
}) {
  const supabase = useMemo(() => createClient(), []);
  const queryClient = useQueryClient();
  const formId = "admin-student-form";

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
      college_id: student.college_id ?? "",
      department_id: student.department_id ?? "",
      university_id: student.university_id ?? 0,
      is_disabled: isDisabled,
    },
    validators: { onSubmit: adminStudentUpdateSchema },
    onSubmit: async ({ value }) => {
      const result = await adminUpdateStudent(student.id!, value);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Student saved.");
      await queryClient.invalidateQueries({ queryKey: queryKeys.students.all });
      onClose();
    },
  });

  const collegeId = useStore(form.store, (s) => s.values.college_id);
  const isSubmitting = useStore(form.store, (s) => s.isSubmitting);

  const colleges = useQuery({
    queryKey: queryKeys.colleges,
    queryFn: () => fetchColleges(supabase),
    staleTime: Infinity,
  });
  const departments = useQuery({
    queryKey: queryKeys.departments(collegeId),
    queryFn: () => fetchDepartments(supabase, collegeId),
    enabled: Boolean(collegeId),
    staleTime: Infinity,
  });

  return (
    <>
      <form
        id={formId}
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          void form.handleSubmit();
        }}
      >
        <FieldGroup className="gap-6">
          <FieldSet>
            <FieldLegend>Profile</FieldLegend>
            <div className="grid gap-4 sm:grid-cols-3">
              <form.Field name="first_name">
                {(f) => <FormInputField field={f} label="First name" />}
              </form.Field>
              <form.Field name="middle_name">
                {(f) => <FormInputField field={f} label="Middle name" />}
              </form.Field>
              <form.Field name="last_name">
                {(f) => <FormInputField field={f} label="Last name" />}
              </form.Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <form.Field name="username">
                {(f) => <FormInputField field={f} label="Username" />}
              </form.Field>
              <form.Field name="phone">
                {(f) => <FormInputField field={f} label="Phone" type="tel" />}
              </form.Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <form.Field name="age">
                {(f) => <FormInputField field={f} label="Age" type="number" />}
              </form.Field>
              <form.Field name="gender">
                {(f) => (
                  <FormSelectField
                    field={f}
                    label="Gender"
                    options={GENDERS.map((g) => ({
                      value: g,
                      label: strToTitleCase(g),
                    }))}
                  />
                )}
              </form.Field>
              <form.Field name="year_level">
                {(f) => (
                  <FormSelectField
                    field={f}
                    label="Year level"
                    options={YEAR_LEVELS}
                    parse={Number}
                  />
                )}
              </form.Field>
            </div>
          </FieldSet>
          <FieldSet>
            <FieldLegend>Enrollment</FieldLegend>
            <div className="grid gap-4 sm:grid-cols-2">
              <form.Field
                name="college_id"
                listeners={{
                  onChange: () => form.setFieldValue("department_id", ""),
                }}
              >
                {(f) => (
                  <FormSelectField
                    field={f}
                    label="College"
                    isLoading={colleges.isLoading}
                    isError={colleges.isError}
                    options={(colleges.data ?? []).map((c) => ({
                      value: c.id,
                      label: c.abbreviation,
                    }))}
                  />
                )}
              </form.Field>
              <form.Field name="department_id">
                {(f) => (
                  <FormSelectField
                    field={f}
                    label="Department"
                    isLoading={departments.isLoading}
                    isError={departments.isError}
                    emptyLabel="No departments in this college yet"
                    disabled={!collegeId}
                    description="Decides which counselor this student books with."
                    options={(departments.data ?? []).map((d) => ({
                      value: d.id,
                      label: d.title,
                    }))}
                  />
                )}
              </form.Field>
            </div>
            <form.Field name="university_id">
              {(f) => (
                <FormInputField field={f} label="University ID" type="number" />
              )}
            </form.Field>
          </FieldSet>
          <form.Field name="is_disabled">
            {(f) => (
              <Field
                orientation="horizontal"
                className="justify-between rounded-xl border p-4"
              >
                <div className="space-y-1">
                  <FieldLabel htmlFor={f.name}>Disable account</FieldLabel>
                  <FieldDescription>
                    A disabled student cannot log in.
                  </FieldDescription>
                </div>
                <Switch
                  id={f.name}
                  checked={f.state.value}
                  onCheckedChange={f.handleChange}
                />
              </Field>
            )}
          </form.Field>
        </FieldGroup>
      </form>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" form={formId} disabled={isSubmitting}>
          {isSubmitting && <Spinner />}
          Save changes
        </Button>
      </DialogFooter>
    </>
  );
}
