"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm, useStore } from "@tanstack/react-form";
import { MailCheck } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { FormInputField } from "@/components/form-input-field";
import { EmptyState } from "@/components/app/empty-state";
import { InfoCallout } from "@/components/app/info-callout";
import { AuthHeading } from "../_components/auth-shell";
import { sendPasswordResetEmail } from "../login/actions";

const schema = z.object({ email: z.email("Enter a valid email address") });

/**
 * Step one of a reset: ask for the email. Step two lives at /auth/reset-password,
 * reached only through the emailed link.
 *
 * This page used to show "email sent" even when the request failed, because the
 * action returned an error object and the page only listened for thrown errors.
 */
export function ForgotPasswordForm({ linkExpired }: { linkExpired: boolean }) {
  const [sentTo, setSentTo] = useState<string | null>(null);

  const form = useForm({
    defaultValues: { email: "" },
    validators: { onSubmit: schema },
    onSubmit: async ({ value }) => {
      const result = await sendPasswordResetEmail(value.email);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setSentTo(value.email);
    },
  });

  const isSubmitting = useStore(form.store, (state) => state.isSubmitting);

  if (sentTo) {
    return (
      <EmptyState
        icon={MailCheck}
        title="Check your email"
        description={`If ${sentTo} has an account, we sent a link to reset the password. It expires in an hour.`}
        action={
          <Button variant="outline" asChild>
            <Link href="/auth/login/student">Back to log in</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <AuthHeading
        title="Forgot your password?"
        description="Enter your account email and we'll send you a reset link."
      />
      {linkExpired && (
        <InfoCallout variant="destructive" className="mb-6">
          That reset link has expired or was already used. Request a new one
          below.
        </InfoCallout>
      )}
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          void form.handleSubmit();
        }}
      >
        <FieldGroup>
          <form.Field name="email">
            {(field) => (
              <FormInputField
                field={field}
                label="Email"
                type="email"
                autoComplete="email"
              />
            )}
          </form.Field>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <Spinner />}
            Send reset link
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/auth/login/student">Back to log in</Link>
          </Button>
        </FieldGroup>
      </form>
    </div>
  );
}
