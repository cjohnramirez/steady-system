"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { fetchAppointment, fetchStudent, updateAppointment } from "../actions";
import { toast } from "sonner";
import { useForm } from "@tanstack/react-form";
import { FormInputField } from "@/components/form-input-field";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectContent,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { useState } from "react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { appointmentFormSchema, appointmentInsertFormSchema } from "../schema";

export default function AppointmentModal({ id }: { id?: string }) {
  const queryClient = useQueryClient();

  const [searchFirstName, setSearchFirstName] = useState("");
  const [searchLastName, setSearchLastName] = useState("");
  const [studentLoading, setStudentLoading] = useState(false);

  const router = useRouter();
  const params = useParams();
  const resolvedId = id ?? params?.id;

  const { data: appointment } = useQuery({
    queryKey: ["appointment", params.id],
    queryFn: () =>
      resolvedId ? fetchAppointment(resolvedId[0]) : Promise.resolve(undefined),
    initialData: () => {
      const allQueries = queryClient.getQueriesData({
        queryKey: ["appointments"],
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
    mutationFn: updateAppointment,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["appointments"] });
      toast.success("Appointment updated successfully!");
      router.back();
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to update appointment");
    },
  });

  const form = useForm({
    defaultValues: {
      id: appointment.id || "",
      university_id: appointment.student_university_id || "",
      counselor_id: appointment.counselor_id || "",
      scheduled_at: appointment.scheduled_at || "",
      status: appointment.status || "",
      notes: appointment.notes || "",
      student_id: appointment.student_id || "",
      reason: ""
    },
    validators: {
      onChange: appointmentFormSchema
    },
    onSubmit: ({ value }) => {
      handleFetchStudent();
      updateMutation.mutate(value);
    },
  });

  const handleFetchStudent = async () => {
    setStudentLoading(true);
    if (appointment && appointment.university_id) {
      try {
        const data = await fetchStudent(
          form.getFieldValue("university_id"),
        );

        setSearchFirstName(data?.first_name ?? "");
        setSearchLastName(data?.last_name ?? "");

        toast.success("Student found");
      } catch {
        toast.error("Failed to fetch student");
      } finally {
        setStudentLoading(false);
      }
    }
  };

  return (
    <Dialog
      open={Boolean(params.id)}
      onOpenChange={(isOpen) => {
        if (!isOpen) router.push("/admin/appointments");
      }}
    >
      <DialogContent
        className="sm:max-w-[800px]"
        showCloseButton={false}
        onInteractOutside={() => router.back()}
      >
        <DialogHeader>
          <DialogTitle>Edit Appointment</DialogTitle>
        </DialogHeader>
        <form
          className="grid grid-cols-3 grid-rows-2 gap-2 pt-5"
          id="update-student-profile-form"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <form.Field name="university_id">
            {(field) => (
              <FormInputField
                label="University ID"
                placeholder="Enter university ID"
                field={field}
              />
            )}
          </form.Field>
          <div className="col-span-2 flex w-full items-end gap-2 pb-3">
            <Button type="button" onClick={handleFetchStudent}>
              Find Student
            </Button>
            <Field>
              <FieldLabel>First Name</FieldLabel>
              <InputGroup>
                <InputGroupInput
                  value={
                    searchFirstName || appointment.first_student_name || ""
                  }
                  disabled={true}
                />
                {studentLoading ? (
                  <InputGroupAddon>
                    <Spinner />
                  </InputGroupAddon>
                ) : (
                  <></>
                )}
              </InputGroup>
            </Field>
            <Field>
              <FieldLabel>Last Name</FieldLabel>
              <InputGroup>
                <InputGroupInput
                  value={searchLastName || appointment.last_student_name || ""}
                  disabled={true}
                />

                {studentLoading ? (
                  <InputGroupAddon>
                    <Spinner />
                  </InputGroupAddon>
                ) : (
                  <></>
                )}
              </InputGroup>
            </Field>
          </div>
          <form.Field name="status">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;

              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Year Level</FieldLabel>
                  <Select
                    name={field.name}
                    value={
                      field.state.value ? field.state.value.toString() : ""
                    }
                    onValueChange={(value) => field.handleChange(value)}
                  >
                    <SelectTrigger
                      id="select-year-level"
                      aria-invalid={isInvalid}
                    >
                      <SelectValue placeholder="Select Year Level" />
                    </SelectTrigger>
                    <SelectContent position="item-aligned">
                      {["completed", "cancelled", "pending", "approved"].map(
                        (status, idx) => (
                          <SelectItem value={status} key={idx}>
                            {status}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                  {isInvalid ? (
                    <FieldError errors={field.state.meta.errors} />
                  ) : (
                    <></>
                  )}
                </Field>
              );
            }}
          </form.Field>
          <div className="col-span-2 w-full">
            <form.Field name="notes">
              {(field) => (
                <FormInputField
                  label="Notes"
                  placeholder="Enter notes"
                  field={field}
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
            <Button onClick={() => router.back()} variant="outline">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
