"use client";

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
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { FormSelectField } from "@/components/form-select-field";
import { InfoCallout } from "@/components/app/info-callout";
import { fieldErrors } from "@/components/form/field-like";
import type { Tables } from "@/types/supabase";
import { updateOwnAvailability } from "@/lib/counselors/actions";
import { formatClockTime } from "@/lib/format";
import { queryKeys } from "@/lib/query-keys";
import { availabilitySchema } from "@/lib/validation/staff";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** Half-hour options from 6:00 AM to 9:00 PM, as HH:MM. */
const TIMES = Array.from({ length: 31 }, (_, i) => {
  const minutes = 6 * 60 + i * 30;
  const value = `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
  return { value, label: formatClockTime(value) };
});

export default function AvailabilityDialog({
  open,
  onOpenChange,
  counselor,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  counselor: Tables<"counselor_with_details">;
}) {
  const queryClient = useQueryClient();
  const formId = "availability-form";

  const form = useForm({
    defaultValues: {
      day_of_week: counselor.day_of_week ?? Array(7).fill(false),
      start_time: (counselor.start_time ?? "08:00").slice(0, 5),
      end_time: (counselor.end_time ?? "17:00").slice(0, 5),
      is_active: counselor.is_active ?? true,
    },
    validators: { onSubmit: availabilitySchema, onChange: availabilitySchema },
    onSubmit: async ({ value }) => {
      const result = await updateOwnAvailability(value);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Availability saved.");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.counselors.all }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.availableSlots.all,
        }),
      ]);
      onOpenChange(false);
    },
  });

  const isSubmitting = useStore(form.store, (state) => state.isSubmitting);
  const selectedDays = useStore(form.store, (state) =>
    state.values.day_of_week.flatMap((on, i) => (on ? [String(i)] : [])),
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Availability</DialogTitle>
          <DialogDescription>
            When students can book time with you.
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
          <FieldGroup className="gap-6">
            <form.Field name="is_active">
              {(field) => (
                <Field
                  orientation="horizontal"
                  className="justify-between rounded-xl border p-4"
                >
                  <div className="space-y-1">
                    <FieldLabel htmlFor={field.name}>
                      Accepting appointments
                    </FieldLabel>
                    <FieldDescription>
                      Turn off while you are on leave. Existing bookings stay.
                    </FieldDescription>
                  </div>
                  <Switch
                    id={field.name}
                    checked={field.state.value}
                    onCheckedChange={field.handleChange}
                  />
                </Field>
              )}
            </form.Field>

            <form.Field name="day_of_week">
              {(field) => {
                const invalid =
                  !field.state.meta.isValid &&
                  field.state.meta.errors.length > 0;
                return (
                  <Field data-invalid={invalid}>
                    <FieldLabel id="days-label">Working days</FieldLabel>
                    <ToggleGroup
                      type="multiple"
                      variant="outline"
                      spacing={2}
                      aria-labelledby="days-label"
                      value={selectedDays}
                      onValueChange={(values) =>
                        field.handleChange(
                          DAYS.map((_, i) => values.includes(String(i))),
                        )
                      }
                      className="flex w-full flex-wrap"
                    >
                      {DAYS.map((day, i) => (
                        <ToggleGroupItem
                          key={day}
                          value={String(i)}
                          className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground min-w-12 flex-1"
                        >
                          {day}
                        </ToggleGroupItem>
                      ))}
                    </ToggleGroup>
                    {invalid && <FieldError errors={fieldErrors(field)} />}
                  </Field>
                );
              }}
            </form.Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <form.Field name="start_time">
                {(field) => (
                  <FormSelectField
                    field={field}
                    label="Start"
                    options={TIMES}
                  />
                )}
              </form.Field>
              <form.Field name="end_time">
                {(field) => (
                  <FormSelectField field={field} label="End" options={TIMES} />
                )}
              </form.Field>
            </div>

            <InfoCallout>
              Changing your hours doesn&apos;t move appointments already booked.
              Reschedule those individually if needed.
            </InfoCallout>
          </FieldGroup>
        </form>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" form={formId} disabled={isSubmitting}>
            {isSubmitting && <Spinner />}
            Save availability
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
