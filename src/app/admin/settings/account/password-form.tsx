"use client";

import { useForm, useStore } from "@tanstack/react-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import FormPasswordField from "@/components/form-password-field";
import { SectionCard } from "@/components/app/section-card";
import { changeOwnPassword } from "@/lib/admin/actions";
import { PASSWORD_HINT } from "@/lib/validation/fields";
import { changePasswordSchema } from "@/lib/validation/staff";

/** The mismatch error used to attach to no field, so it was never shown. */
export default function PasswordForm() {
  const form = useForm({
    defaultValues: { password: "", confirmPassword: "" },
    validators: { onSubmit: changePasswordSchema },
    onSubmit: async ({ value, formApi }) => {
      const result = await changeOwnPassword(value);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Password changed.");
      formApi.reset();
    },
  });

  const isSubmitting = useStore(form.store, (s) => s.isSubmitting);

  return (
    <SectionCard
      title="Password"
      description="Use a password you don't use anywhere else."
    >
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          void form.handleSubmit();
        }}
      >
        <FieldGroup className="gap-5">
          <div className="grid gap-4 md:grid-cols-2">
            <form.Field name="password">
              {(f) => (
                <FormPasswordField
                  field={f}
                  label="New password"
                  autoComplete="new-password"
                  description={PASSWORD_HINT}
                />
              )}
            </form.Field>
            <form.Field name="confirmPassword">
              {(f) => (
                <FormPasswordField
                  field={f}
                  label="Confirm new password"
                  autoComplete="new-password"
                />
              )}
            </form.Field>
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Spinner />}
              Change password
            </Button>
          </div>
        </FieldGroup>
      </form>
    </SectionCard>
  );
}
