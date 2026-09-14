"use client";

import { useRouter } from "next/navigation";
import { useForm, useStore } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { FormInputField } from "@/components/form-input-field";
import { FormSelectField } from "@/components/form-select-field";
import { SectionCard } from "@/components/app/section-card";
import { fieldErrors } from "@/components/form/field-like";
import type { Tables } from "@/types/supabase";
import { updateOrganization } from "@/lib/admin/actions";
import { formatClockTime } from "@/lib/format";
import { queryKeys } from "@/lib/query-keys";
import { organizationSchema } from "@/lib/validation/organization";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const TIMES = Array.from({ length: 29 }, (_, i) => {
  const minutes = 6 * 60 + i * 30;
  const value = `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
  return { value, label: formatClockTime(value) };
});

/**
 * The office profile shown on the landing page, footer and booking fallback.
 * Saving now refreshes those too; the old form invalidated a key nothing read.
 */
export default function OrganizationForm({
  organization,
}: {
  organization: Tables<"organization">;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const form = useForm({
    defaultValues: {
      name: organization.name,
      abbreviation: organization.abbreviation,
      email: organization.email,
      phone: String(organization.phone),
      office_location: organization.office_location,
      day_of_week: organization.day_of_week,
      start_office_hour: organization.start_office_hour.slice(0, 5),
      end_office_hour: organization.end_office_hour.slice(0, 5),
    },
    validators: { onSubmit: organizationSchema },
    onSubmit: async ({ value }) => {
      const result = await updateOrganization(organization.id, value);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Office details saved.");
      await queryClient.invalidateQueries({ queryKey: queryKeys.organization });
      router.refresh();
    },
  });

  const isSubmitting = useStore(form.store, (s) => s.isSubmitting);
  const days = useStore(form.store, (s) =>
    s.values.day_of_week.flatMap((on, i) => (on ? [String(i)] : [])),
  );

  return (
    <SectionCard
      title="Office details"
      description="Shown on the public site and to students who can't book."
    >
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          void form.handleSubmit();
        }}
      >
        <FieldGroup className="gap-5">
          <div className="grid gap-4 md:grid-cols-[3fr_1fr]">
            <form.Field name="name">
              {(f) => <FormInputField field={f} label="Office name" />}
            </form.Field>
            <form.Field name="abbreviation">
              {(f) => <FormInputField field={f} label="Abbreviation" />}
            </form.Field>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <form.Field name="email">
              {(f) => <FormInputField field={f} label="Email" type="email" />}
            </form.Field>
            <form.Field name="phone">
              {(f) => <FormInputField field={f} label="Phone" type="tel" />}
            </form.Field>
          </div>
          <form.Field name="office_location">
            {(f) => <FormInputField field={f} label="Location" />}
          </form.Field>
          <form.Field name="day_of_week">
            {(f) => {
              const invalid = f.state.meta.errors.length > 0;
              return (
                <Field data-invalid={invalid}>
                  <FieldLabel id="office-days">Open on</FieldLabel>
                  <ToggleGroup
                    type="multiple"
                    variant="outline"
                    spacing={2}
                    aria-labelledby="office-days"
                    value={days}
                    onValueChange={(values) =>
                      f.handleChange(
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
                  {invalid && <FieldError errors={fieldErrors(f)} />}
                </Field>
              );
            }}
          </form.Field>
          <div className="grid gap-4 md:grid-cols-2">
            <form.Field name="start_office_hour">
              {(f) => (
                <FormSelectField field={f} label="Opens" options={TIMES} />
              )}
            </form.Field>
            <form.Field name="end_office_hour">
              {(f) => (
                <FormSelectField field={f} label="Closes" options={TIMES} />
              )}
            </form.Field>
          </div>
          <div className="flex justify-end">
            <Button type="submit" loading={isSubmitting}>
              Save office details
            </Button>
          </div>
        </FieldGroup>
      </form>
    </SectionCard>
  );
}
