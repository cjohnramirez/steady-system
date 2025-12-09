"use client";

import { useMutation } from "@tanstack/react-query";
import { updateAdminPassword } from "../actions";
import { toast } from "sonner";
import { FieldGroup } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useState } from "react";
import FormPasswordField from "@/components/form-password-field";
import { resetPasswordFormSchema } from "../schema";
import { useForm } from "@tanstack/react-form";

export default function ChangePassword() {
  const [showPasswords, setShowPasswords] = useState(false);

  const updateMutation = useMutation({
    mutationFn: updateAdminPassword,
    onSuccess: async () => {
      toast.success("Password updated successfully!");
      form.reset();
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to update password");
    },
  });

  const form = useForm({
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
    validators: {
      onChange: resetPasswordFormSchema,
    },
    onSubmit: async ({ value }) => {
      updateMutation.mutate(value);
    },
  });

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-8">
      <h2 className="mb-1 text-lg font-semibold">Change Password</h2>
      <p className="mb-6 text-sm">
        Securely change your account password. Use a strong combination of
        letters, numbers, and symbols.
      </p>
      <form
        className="mt-8 space-y-8"
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        <FieldGroup>
          <div className="flex gap-8">
            <form.Field name="password">
              {(field) => (
                <FormPasswordField
                  field={field}
                  showPassword={showPasswords}
                  setShowPassword={setShowPasswords}
                />
              )}
            </form.Field>
            <form.Field name="confirmPassword">
              {(field) => (
                <FormPasswordField
                  field={field}
                  showPassword={showPasswords}
                  setShowPassword={setShowPasswords}
                />
              )}
            </form.Field>
          </div>
        </FieldGroup>
        <div className="flex w-full justify-end">
          <Button disabled={updateMutation.isPending}>
            {updateMutation.isPending ? <Spinner /> : <></>}
            Save
          </Button>
        </div>
      </form>
    </section>
  );
}
