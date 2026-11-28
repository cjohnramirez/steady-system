"use client";

import { useMemo, useState } from "react";
import { useForm, useStore } from "@tanstack/react-form";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/app/error-state";
import { UserAvatar } from "@/components/app/user-avatar";
import { FormInputField } from "@/components/form-input-field";
import { FormSelectField } from "@/components/form-select-field";
import { createClient } from "@/utils/supabase/client";
import type { Tables } from "@/types/supabase";
import { adminUpdateStudent } from "@/lib/students/actions";
import { fetchStudentRow } from "@/lib/students/queries";
import { fetchColleges, fetchDepartments } from "@/lib/reference/queries";
import { queryKeys } from "@/lib/query-keys";
import { abbreviateProgram, strToTitleCase } from "@/lib/format";
import { adminStudentUpdateSchema, GENDERS } from "@/lib/validation/student";

const YEAR_LEVELS = [1, 2, 3, 4, 5, 6].map((y) => ({
  value: String(y),
  label: `${y}${y === 1 ? "st" : y === 2 ? "nd" : y === 3 ? "rd" : "th"} Year`,
}));

interface ScholarshipEntry {
  id: string;
  name: string;
  status: "Active" | "On Hold" | "Completed";
  batchYear: string;
}

function formatOrdinalYear(year?: number | null): string {
  if (!year) return "";
  const suffixes: Record<number, string> = { 1: "st", 2: "nd", 3: "rd" };
  return `${year}${suffixes[year] ?? "th"} Year`;
}

/**
 * Edit Student Profile Modal (Figma 678:21715):
 * Student name is read-only for admins; includes Academic/Operation settings
 * and an optional Scholarship Details section.
 */
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
      <DialogContent className="flex max-h-[85vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-[588px]">
        {/* Static Gray Header Band */}
        <div className="bg-muted/60 border-border shrink-0 border-b p-5 pr-12 text-left">
          <DialogTitle className="text-[15px] font-medium">
            Edit Student Profile
          </DialogTitle>
        </div>

        {row.data ? (
          <StudentForm
            student={student}
            isDisabled={row.data.is_disabled}
            onClose={onClose}
          />
        ) : row.isError ? (
          <div className="p-5">
            <ErrorState
              title="This student couldn't be loaded"
              onRetry={() => row.refetch()}
            />
          </div>
        ) : (
          <div className="p-5">
            <Skeleton className="h-96 rounded-[16px]" />
          </div>
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

  const [scholarships, setScholarships] = useState<ScholarshipEntry[]>([]);

  const fullName =
    `${student.first_name ?? ""} ${student.last_name ?? ""}`.trim() ||
    student.username ||
    "Student";
  const programLine = [
    student.department,
    formatOrdinalYear(student.year_level),
  ]
    .filter(Boolean)
    .join(", ");

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
      // Preserve student's official name — admins cannot modify student names
      const result = await adminUpdateStudent(student.id!, {
        ...value,
        first_name: student.first_name ?? value.first_name,
        middle_name: student.middle_name ?? value.middle_name,
        last_name: student.last_name ?? value.last_name,
      });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Student account updated.");
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

  function addScholarship() {
    setScholarships((prev) => [
      ...prev,
      {
        id: `sch-${Date.now()}`,
        name: "",
        status: "Active",
        batchYear: String(new Date().getFullYear()),
      },
    ]);
  }

  return (
    <>
      <form
        id={formId}
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          void form.handleSubmit();
        }}
        className="divide-border min-h-0 flex-1 divide-y overflow-y-auto text-left"
      >
        {/* Section 1: User Details (Figma 678:21715 — student name read-only) */}
        <div className="space-y-5 p-5">
          <div className="space-y-1">
            <h3 className="text-foreground text-[15px] font-medium">
              User Details
            </h3>
            <p className="text-foreground/80 text-[15px]">
              Edit crucial details like student IDs, academic program, and
              status.
            </p>
          </div>

          {/* Read-only Student Identity Banner */}
          <div className="bg-card border-border shadow-steady-card flex items-center gap-4 rounded-[20px] border p-5">
            <UserAvatar
              name={fullName}
              className="size-[51px] shrink-0 rounded-[10px]"
            />
            <div className="min-w-0 space-y-0.5">
              <p className="text-foreground truncate text-[15px] font-medium">
                {fullName}
              </p>
              <div className="text-foreground/80 flex flex-wrap items-center gap-2.5 text-[15px] tabular-nums">
                <span>{student.university_id || "—"}</span>
                {programLine && (
                  <>
                    <span
                      aria-hidden
                      className="bg-border inline-block h-4 w-px"
                    />
                    <span>{programLine}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <FieldGroup className="gap-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <form.Field name="university_id">
                {(f) => (
                  <FormInputField field={f} label="Student ID" type="number" />
                )}
              </form.Field>
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
                      label: c.abbreviation || c.full_name,
                    }))}
                  />
                )}
              </form.Field>
              <form.Field name="department_id">
                {(f) => (
                  <FormSelectField
                    field={f}
                    label="Program"
                    disabled={!collegeId}
                    isLoading={departments.isLoading}
                    isError={departments.isError}
                    options={(departments.data ?? []).map((d) => ({
                      value: d.id,
                      label: abbreviateProgram(d.title),
                    }))}
                  />
                )}
              </form.Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <form.Field name="year_level">
                {(f) => (
                  <FormSelectField
                    field={f}
                    label="Year Level"
                    options={YEAR_LEVELS}
                  />
                )}
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
              <form.Field name="age">
                {(f) => <FormInputField field={f} label="Age" type="number" />}
              </form.Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <form.Field name="username">
                {(f) => <FormInputField field={f} label="Username" />}
              </form.Field>
              <form.Field name="phone">
                {(f) => (
                  <FormInputField field={f} label="Phone Number" type="tel" />
                )}
              </form.Field>
            </div>
          </FieldGroup>
        </div>

        {/* Section 2: Scholarship Details (Figma 678:21715 — always available to add) */}
        <div className="space-y-4 p-5">
          <div className="space-y-1">
            <h3 className="text-foreground text-[15px] font-medium">
              Scholarship Details
            </h3>
            <p className="text-foreground/80 text-[15px]">
              Edit scholarship status and details of the student
            </p>
          </div>

          {scholarships.length > 0 && (
            <div className="space-y-3">
              {scholarships.map((item) => (
                <div
                  key={item.id}
                  className="grid items-end gap-3 sm:grid-cols-[1fr_auto_110px_auto]"
                >
                  <Field>
                    <FieldLabel>Scholarship</FieldLabel>
                    <Input
                      value={item.name}
                      onChange={(e) =>
                        setScholarships((prev) =>
                          prev.map((s) =>
                            s.id === item.id
                              ? { ...s, name: e.target.value }
                              : s,
                          ),
                        )
                      }
                      placeholder="e.g. DOST-JLSS"
                      className="rounded-[25px]"
                    />
                  </Field>

                  <Field>
                    <FieldLabel>Status</FieldLabel>
                    <Select
                      value={item.status}
                      onValueChange={(v) =>
                        setScholarships((prev) =>
                          prev.map((s) =>
                            s.id === item.id
                              ? {
                                  ...s,
                                  status: v as ScholarshipEntry["status"],
                                }
                              : s,
                          ),
                        )
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">
                          <span className="inline-flex items-center gap-2">
                            <span className="bg-positive size-2 rounded-full" />
                            Active
                          </span>
                        </SelectItem>
                        <SelectItem value="On Hold">
                          <span className="inline-flex items-center gap-2">
                            <span className="bg-warning size-2 rounded-full" />
                            On Hold
                          </span>
                        </SelectItem>
                        <SelectItem value="Completed">
                          <span className="inline-flex items-center gap-2">
                            <span className="bg-primary size-2 rounded-full" />
                            Completed
                          </span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>

                  <Field>
                    <FieldLabel>Batch Year</FieldLabel>
                    <Input
                      value={item.batchYear}
                      onChange={(e) =>
                        setScholarships((prev) =>
                          prev.map((s) =>
                            s.id === item.id
                              ? { ...s, batchYear: e.target.value }
                              : s,
                          ),
                        )
                      }
                      placeholder="2024"
                      className="rounded-[25px]"
                    />
                  </Field>

                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label="Remove scholarship"
                    onClick={() =>
                      setScholarships((prev) =>
                        prev.filter((s) => s.id !== item.id),
                      )
                    }
                  >
                    <Trash2 strokeWidth={1.5} className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <Button type="button" onClick={addScholarship} className="w-full">
            <Plus strokeWidth={1.5} className="size-4" />
            Add New Item
          </Button>
        </div>

        {/* Section 3: Operation Settings (Figma 678:21715) */}
        <div className="space-y-4 p-5">
          <div className="space-y-1">
            <h3 className="text-foreground text-[15px] font-medium">
              Operation Settings
            </h3>
            <p className="text-foreground/80 text-[15px]">
              Edit assigned counselor and account status
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel>Assigned Counselor</FieldLabel>
              <div className="border-border bg-muted/40 text-foreground/85 flex h-12 items-center rounded-[25px] border px-4 text-[15px]">
                {student.counselor_first_name || student.counselor_last_name
                  ? `${student.counselor_first_name ?? ""} ${student.counselor_last_name ?? ""}`.trim()
                  : "Auto-assigned by Program"}
              </div>
            </Field>

            <form.Field name="is_disabled">
              {(f) => (
                <Field>
                  <FieldLabel htmlFor="student-account-status">
                    Account Status
                  </FieldLabel>
                  <Select
                    value={f.state.value ? "disabled" : "active"}
                    onValueChange={(v) => f.handleChange(v === "disabled")}
                  >
                    <SelectTrigger
                      id="student-account-status"
                      className="w-full"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Status</SelectLabel>
                        <SelectItem value="active">
                          <span className="inline-flex items-center gap-2">
                            <span className="bg-positive size-2 rounded-full" />
                            Active
                          </span>
                        </SelectItem>
                        <SelectItem value="disabled">
                          <span className="inline-flex items-center gap-2">
                            <span className="bg-destructive size-2 rounded-full" />
                            Disabled
                          </span>
                        </SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
              )}
            </form.Field>
          </div>
        </div>
      </form>

      {/* Static Gray Footer Band */}
      <div className="bg-muted/60 border-border flex shrink-0 items-center justify-end gap-2.5 border-t p-5">
        <Button type="button" variant="outline" onClick={onClose}>
          Close
        </Button>
        <Button
          type="submit"
          form={formId}
          variant="positive"
          loading={isSubmitting}
        >
          Update Account
        </Button>
      </div>
    </>
  );
}
