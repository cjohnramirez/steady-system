"use client";

import { useRouter } from "next/navigation";
import { useForm, useStore } from "@tanstack/react-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import FormPasswordField from "@/components/form-password-field";
import { PASSWORD_HINT, passwordSchema } from "@/lib/validation/fields";
import { AuthHeading } from "../_components/auth-shell";
import { updatePassword } from "../login/actions";

const schema = z
  .object({ password: passwordSchema, confirmPassword: z.string() })
  .refine((value) => value.password === value.confirmPassword, {
    message: "The passwords don't match",
    path: ["confirmPassword"],
  });

export function ResetPasswordForm() {
  const router = useRouter();

  const form = useForm({
    defaultValues: { password: "", confirmPassword: "" },
    validators: { onSubmit: schema },
    onSubmit: async ({ value }) => {
      const result = await updatePassword(value.password);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Your password has been changed.");
      router.replace(result.data.redirectTo);
      router.refresh();
    },
  });

  const isSubmitting = useStore(form.store, (state) => state.isSubmitting);

  return (
    <div className="mx-auto w-full max-w-md">
      <AuthHeading
        title="Choose a new password"
        description="You'll stay signed in on this device."
      />
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          void form.handleSubmit();
        }}
      >
        <FieldGroup>
          <form.Field name="password">
            {(field) => (
              <FormPasswordField
                field={field}
                label="New password"
                autoComplete="new-password"
                description={PASSWORD_HINT}
              />
            )}
          </form.Field>
          <form.Field name="confirmPassword">
            {(field) => (
              <FormPasswordField
                field={field}
                label="Confirm new password"
                autoComplete="new-password"
              />
            )}
          </form.Field>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <Spinner />}
            Save password
          </Button>
        </FieldGroup>
      </form>
    </div>
  );
}
