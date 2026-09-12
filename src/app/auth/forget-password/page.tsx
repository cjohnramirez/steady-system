"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useForm } from "@tanstack/react-form";
import { FieldGroup } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useEffect, useState } from "react";
import FormPasswordField from "@/components/form-password-field";
import { resetPasswordFormSchema } from "@/app/admin/settings/account/schema";
import { updatePassword, sendPasswordResetEmail } from "../login/actions";
import { createClient } from "@/utils/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import { FormInputField } from "@/components/form-input-field";

const emailSchema = z.object({
  email: z.email("Please enter a valid email address"),
});

export default function ForgetPassword() {
  const supabase = createClient();
  const router = useRouter();
  const [showPasswords, setShowPasswords] = useState(false);
  const [step, setStep] = useState<"email" | "reset">("email");

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        setStep("reset");
      } else if (event === "INITIAL_SESSION") {
        if (session) {
          setStep("reset");
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth]);

  const sendResetEmailMutation = useMutation({
    mutationFn: sendPasswordResetEmail,
    onSuccess: async () => {
      toast.success("Password reset email sent! Check your inbox.");
      emailForm.reset();
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to send reset email");
    },
  });

  const updateMutation = useMutation({
    mutationFn: updatePassword,
    onSuccess: async () => {
      toast.success("Password updated successfully!");
      resetForm.reset();
      router.push("/auth/login");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to update password");
    },
  });

  const emailForm = useForm({
    defaultValues: {
      email: "",
    },
    validators: {
      onChange: emailSchema,
    },
    onSubmit: async ({ value }) => {
      sendResetEmailMutation.mutate(value.email);
    },
  });

  const resetForm = useForm({
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
    validators: {
      onChange: resetPasswordFormSchema,
    },
    onSubmit: async ({ value }) => {
      updateMutation.mutate(value.password);
    },
  });

  if (step === "email") {
    return (
      <section className="flex items-center justify-center border-gray-200">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-2 text-center">
            <p className="text-4xl font-medium">Reset Password</p>
            <p className="text-gray-600">
              Enter your email to receive a password reset link
            </p>
          </div>
          <form
            className="space-y-8"
            onSubmit={(e) => {
              e.preventDefault();
              emailForm.handleSubmit();
            }}
          >
            <FieldGroup>
              <emailForm.Field name="email">
                {(field) => (
                  <FormInputField
                    label="Email"
                    placeholder="Enter your email"
                    field={field}
                    type="email"
                  />
                )}
              </emailForm.Field>
            </FieldGroup>
            <div className="flex w-full justify-end gap-4">
              <Button
                variant="outline"
                type="button"
                onClick={() => router.back()}
              >
                Back
              </Button>
              <Button disabled={sendResetEmailMutation.isPending} type="submit">
                {sendResetEmailMutation.isPending ? <Spinner /> : <>Send</>}
              </Button>
            </div>
          </form>
        </div>
      </section>
    );
  }

  return (
    <section className="flex items-center justify-center border-gray-200">
      <div className="w-full max-w-md space-y-8">
        <div className="space-y-2 text-center">
          <p className="text-4xl font-medium">Reset Password</p>
          <p className="text-gray-600">Enter your new password below</p>
        </div>
        <form
          className="space-y-8"
          onSubmit={(e) => {
            e.preventDefault();
            resetForm.handleSubmit();
          }}
        >
          <FieldGroup>
            <div className="flex gap-8">
              <resetForm.Field name="password">
                {(field) => (
                  <FormPasswordField
                    field={field}
                    showPassword={showPasswords}
                    setShowPassword={setShowPasswords}
                  />
                )}
              </resetForm.Field>
              <resetForm.Field name="confirmPassword">
                {(field) => (
                  <FormPasswordField
                    field={field}
                    showPassword={showPasswords}
                    setShowPassword={setShowPasswords}
                  />
                )}
              </resetForm.Field>
            </div>
          </FieldGroup>
          <div className="flex w-full justify-end">
            <Button disabled={updateMutation.isPending}>
              {updateMutation.isPending ? <Spinner /> : <>Save</>}
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}
