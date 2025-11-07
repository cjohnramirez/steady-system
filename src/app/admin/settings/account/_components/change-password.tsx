"use client";

import { useMutation } from "@tanstack/react-query";
import { updateAdminPassword } from "../actions";
import { toast } from "sonner";
import { useForm } from "@tanstack/react-form";
import { adminPasswordFormSchema } from "../schema";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Eye, EyeClosed } from "lucide-react";
import { useState } from "react";

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
      onChange: adminPasswordFormSchema,
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
          console.log("Form submit event triggered");
          form.handleSubmit();
        }}
      >
        <FieldGroup>
          <div className="flex gap-8">
            <form.Field name="password">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>New Password</FieldLabel>
                    <InputGroup>
                      <InputGroupInput
                        id={field.name}
                        name={field.name}
                        value={field.state.value ?? ""}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        type={showPasswords ? "text" : "password"}
                        placeholder="Enter your new password"
                      />
                      <InputGroupAddon align="inline-end">
                        <InputGroupButton
                          aria-label="Toggle password visibility"
                          title="Toggle password visibility"
                          size="icon-xs"
                          onClick={() => setShowPasswords(!showPasswords)}
                        >
                          {showPasswords ? <Eye /> : <EyeClosed />}
                        </InputGroupButton>
                      </InputGroupAddon>
                    </InputGroup>
                    {isInvalid && (
                      <FieldError errors={[field.state.meta.errors[0]]} />
                    )}
                  </Field>
                );
              }}
            </form.Field>
            <form.Field name="confirmPassword">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>
                      Confirm Password
                    </FieldLabel>
                    <InputGroup>
                      <InputGroupInput
                        id={field.name}
                        name={field.name}
                        value={field.state.value ?? ""}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        type={showPasswords ? "text" : "password"}
                        placeholder="Confirm your new password"
                      />
                      <InputGroupAddon align="inline-end">
                        <InputGroupButton
                          aria-label="Toggle password visibility"
                          title="Toggle password visibility"
                          size="icon-xs"
                          onClick={() => setShowPasswords(!showPasswords)}
                        >
                          {showPasswords ? <Eye /> : <EyeClosed />}
                        </InputGroupButton>
                      </InputGroupAddon>
                    </InputGroup>
                    {isInvalid && (
                      <FieldError errors={[field.state.meta.errors[0]]} />
                    )}
                  </Field>
                );
              }}
            </form.Field>
          </div>
        </FieldGroup>
        <div className="flex w-full justify-end">
          <Button
            variant="default"
            className="bg-brand-normal hover:bg-brand-normal/80"
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? <Spinner /> : <></>}
            Save
          </Button>
        </div>
      </form>
    </section>
  );
}
