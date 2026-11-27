"use client";

import { useRouter } from "next/navigation";
import { useForm, useStore } from "@tanstack/react-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { FormInputField } from "@/components/form-input-field";
import { SectionCard } from "@/components/app/section-card";
import { updateOwnAdminProfile } from "@/lib/admin/actions";
import { adminSelfUpdateSchema } from "@/lib/validation/staff";

type Admin = {
  first_name: string;
  last_name: string;
  username: string;
  phone: string;
  university_id: number;
  email: string;
};

/**
 * Fixed labels: first name and phone were both labelled "Username". The old schema
 * also required a 10-digit university ID the form had no input for, so it failed
 * without showing why.
 */
export default function ProfileForm({ admin }: { admin: Admin }) {
  const router = useRouter();

  const form = useForm({
    defaultValues: {
      first_name: admin.first_name,
      last_name: admin.last_name,
      username: admin.username,
      phone: admin.phone,
      university_id: admin.university_id,
    },
    validators: {
      onSubmit: adminSelfUpdateSchema,
      onBlur: adminSelfUpdateSchema,
    },
    onSubmit: async ({ value }) => {
      const result = await updateOwnAdminProfile(value);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Profile saved.");
      router.refresh();
    },
  });

  const isSubmitting = useStore(form.store, (s) => s.isSubmitting);
  const isDirty = useStore(form.store, (s) => s.isDirty);

  return (
    <SectionCard title="Profile" description={`Signed in as ${admin.email}.`}>
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          void form.handleSubmit();
        }}
      >
        <FieldGroup className="gap-5">
          <div className="grid gap-4 md:grid-cols-2">
            <form.Field name="first_name">
              {(f) => <FormInputField field={f} label="First name" />}
            </form.Field>
            <form.Field name="last_name">
              {(f) => <FormInputField field={f} label="Last name" />}
            </form.Field>
            <form.Field name="username">
              {(f) => <FormInputField field={f} label="Username" />}
            </form.Field>
            <form.Field name="phone">
              {(f) => <FormInputField field={f} label="Phone" type="tel" />}
            </form.Field>
            <form.Field name="university_id">
              {(f) => (
                <FormInputField field={f} label="University ID" type="number" />
              )}
            </form.Field>
          </div>
          <div className="flex justify-end">
            <Button
              loading={isSubmitting}
              type="submit"
              disabled={isSubmitting || !isDirty}
            >
              Save profile
            </Button>
          </div>
        </FieldGroup>
      </form>
    </SectionCard>
  );
}
