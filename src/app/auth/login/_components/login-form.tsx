"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, useStore } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { FormInputField } from "@/components/form-input-field";
import FormPasswordField from "@/components/form-password-field";
import { InfoCallout } from "@/components/app/info-callout";
import type { roles } from "@/types/main";
import { AuthHeading } from "../../_components/auth-shell";
import { logIn } from "../actions";

const schema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(1, "Enter your password"),
});

const ERRORS: Record<string, string> = {
  "link-expired":
    "That link has expired or was already used. Please log in or request a new one.",
};

export default function LoginForm({
  role,
  title,
  initialError,
}: {
  role: roles;
  title: string;
  initialError?: string;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const form = useForm({
    defaultValues: { email: "", password: "" },
    validators: { onSubmit: schema },
    onSubmit: async ({ value }) => {
      const result = await logIn({ ...value, role });

      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      // Anything cached belongs to whoever used this browser before.
      queryClient.clear();
      router.replace(result.data.redirectTo);
      router.refresh();
    },
  });

  const isSubmitting = useStore(form.store, (state) => state.isSubmitting);
  const bannerError = initialError ? ERRORS[initialError] : undefined;

  return (
    <div className="mx-auto w-full max-w-md">
      <AuthHeading
        title={title}
        description="Enter your email and password to continue."
      />
      {bannerError && (
        <InfoCallout variant="destructive" className="mb-6">
          {bannerError}
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
          <form.Field name="password">
            {(field) => (
              <FormPasswordField
                field={field}
                autoComplete="current-password"
                labelAction={
                  <Link
                    href="/auth/forget-password"
                    className="text-muted-foreground hover:text-foreground text-sm underline-offset-4 hover:underline"
                  >
                    Forgot password?
                  </Link>
                }
              />
            )}
          </form.Field>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <Spinner />}
            {isSubmitting ? "Logging in…" : "Log in"}
          </Button>
          {role === "student" && (
            <p className="text-muted-foreground text-center">
              New here?{" "}
              <Link
                href="/auth/signup/student"
                className="text-foreground underline underline-offset-4"
              >
                Create an account
              </Link>
            </p>
          )}
        </FieldGroup>
      </form>
    </div>
  );
}
