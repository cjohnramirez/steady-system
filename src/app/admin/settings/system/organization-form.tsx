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
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { FormInputField } from "@/components/form-input-field";
import { SteadyMascot } from "@/components/app/steady-mascot";
import { fieldErrors } from "@/components/form/field-like";
import type { Tables } from "@/types/supabase";
import { updateOrganization } from "@/lib/admin/actions";
import { queryKeys } from "@/lib/query-keys";
import { organizationSchema } from "@/lib/validation/organization";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/**
 * Organization & Clinic Profile (Figma 678:21268):
 * Pill-shaped inputs, native time pickers, and mascot office avatar header.
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
    <section className="bg-card border-border shadow-steady-card divide-border divide-y rounded-[20px] border">
      {/* Header Band */}
      <div className="space-y-1 p-6">
        <h2 className="text-foreground text-[15px] font-medium">
          Organization &amp; Clinic Profile
        </h2>
        <p className="text-muted-foreground text-[14px]">
          Manage the office information shown in student booking confirmations
          and footer notices.
        </p>
      </div>

      {/* Office Brand Preview Row */}
      <div className="flex items-center justify-between gap-4 p-6">
        <div className="space-y-1">
          <p className="text-foreground text-[15px] font-medium">
            Office Identity
          </p>
          <p className="text-muted-foreground max-w-[300px] text-[14px]">
            Displayed on public portal pages and student consultation summaries.
          </p>
        </div>
        <SteadyMascot
          variant="avatar"
          emotion="default"
          className="size-[76px] shrink-0 rounded-[16px]"
        />
      </div>

      {/* Organization Form */}
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          void form.handleSubmit();
        }}
        className="space-y-5 p-6"
      >
        <div className="space-y-1">
          <p className="text-foreground text-[15px] font-medium">
            Edit Organization Details
          </p>
          <p className="text-muted-foreground text-[14px]">
            Keep your office name, contact details, location, and operating
            hours up to date.
          </p>
        </div>

        <FieldGroup className="gap-4">
          <form.Field name="name">
            {(f) => <FormInputField field={f} label="Guidance Office Name" />}
          </form.Field>

          <form.Field name="abbreviation">
            {(f) => <FormInputField field={f} label="Office Abbreviation" />}
          </form.Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <form.Field name="phone">
              {(f) => (
                <FormInputField
                  field={f}
                  label="Official Phone Extension"
                  type="tel"
                />
              )}
            </form.Field>
            <form.Field name="office_location">
              {(f) => (
                <FormInputField
                  field={f}
                  label="Office Location / Building Room"
                />
              )}
            </form.Field>
          </div>

          <form.Field name="email">
            {(f) => (
              <FormInputField
                field={f}
                label="Official Guidance Email"
                type="email"
              />
            )}
          </form.Field>

          <form.Field name="day_of_week">
            {(f) => {
              const invalid = f.state.meta.errors.length > 0;
              return (
                <Field data-invalid={invalid}>
                  <FieldLabel id="office-days">Open Days</FieldLabel>
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
                        className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground min-w-12 flex-1 rounded-[20px]"
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

          <div className="grid gap-4 sm:grid-cols-2">
            <form.Field name="start_office_hour">
              {(f) => {
                const invalid = f.state.meta.errors.length > 0;
                return (
                  <Field data-invalid={invalid}>
                    <FieldLabel htmlFor="start-office-hour">
                      Opening Office Hour
                    </FieldLabel>
                    <Input
                      id="start-office-hour"
                      type="time"
                      value={f.state.value}
                      onChange={(e) => f.handleChange(e.target.value)}
                      onBlur={f.handleBlur}
                      className="rounded-[25px]"
                    />
                    {invalid && <FieldError errors={fieldErrors(f)} />}
                  </Field>
                );
              }}
            </form.Field>

            <form.Field name="end_office_hour">
              {(f) => {
                const invalid = f.state.meta.errors.length > 0;
                return (
                  <Field data-invalid={invalid}>
                    <FieldLabel htmlFor="end-office-hour">
                      Closing Office Hour
                    </FieldLabel>
                    <Input
                      id="end-office-hour"
                      type="time"
                      value={f.state.value}
                      onChange={(e) => f.handleChange(e.target.value)}
                      onBlur={f.handleBlur}
                      className="rounded-[25px]"
                    />
                    {invalid && <FieldError errors={fieldErrors(f)} />}
                  </Field>
                );
              }}
            </form.Field>
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" loading={isSubmitting}>
              Save Office Details
            </Button>
          </div>
        </FieldGroup>
      </form>
    </section>
  );
}
