"use client";

import Image from "next/image";

import * as z from "zod";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Eye, EyeClosed } from "lucide-react";
import { roles } from "@/types/main";
import LoginFormAction, { sendResetPasswordEmail } from "../actions";
import { FormInputField } from "@/components/form-input-field";
import { useUserStore } from "@/hooks/auth-store";

const formSchema = z.object({
  email: z.email({ error: "Invalid email" }),
  password: z
    .string()
    .min(8, "8 or more characters required")
    .max(255, "255 or less characters required"),
});

export default function LoginForm({ role }: { role: roles }) {
  const router = useRouter();

  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [isResetLoading, setIsResetLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async (form) => {
      setIsLoginLoading(true);

      try {
        const formData = new FormData();
        formData.append("email", form.value.email);
        formData.append("password", form.value.password);

        const res = await LoginFormAction(formData, role);

        if (res?.error) {
          toast.error(res.error);
          return;
        }

        if (res?.success) {
          toast.success(res.success);
          useUserStore.getState().setUserName(res.data?.userName ?? "");
          useUserStore.getState().setUserRole(role ?? "");
          useUserStore
            .getState()
            .setEmotionalStatus(res.data?.emotionalStatus ?? "");
          useUserStore.getState().setId(res.data?.id ?? "");
        }

        router.push("/");
      } finally {
        setIsLoginLoading(false);
      }
    },
  });

  return (
    <>
      <div className="w-full space-y-2 text-center">
        <p className="text-4xl font-medium">
          Hello, {role.slice(0, 1).toUpperCase() + role.slice(1)}
        </p>
        <p>Enter your credentials below to login to your account</p>
      </div>
      <form
        className="mt-8 space-y-8"
        id="login-form"
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        <FieldGroup>
          <form.Field name="email">
            {(field) => (
              <FormInputField
                field={field}
                label="Email"
                type="email"
                placeholder="Enter your email"
                description="Email must be valid"
              />
            )}
          </form.Field>
          <form.Field name="password">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <div className="flex items-center justify-between">
                    <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                    <p
                      onClick={() => router.push("/auth/forget-password")}
                      className="flex cursor-pointer items-center gap-2"
                    >
                      {isResetLoading && <Spinner />}Forget Password?
                    </p>
                  </div>
                  <InputGroup>
                    <InputGroupInput
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      type={showPassword ? "text" : "password"}
                    />
                    <InputGroupAddon align="inline-end">
                      <InputGroupButton
                        aria-label="Copy"
                        title="Copy"
                        size="icon-xs"
                        onClick={() => {
                          setShowPassword(!showPassword);
                        }}
                      >
                        {showPassword ? <Eye /> : <EyeClosed />}
                      </InputGroupButton>
                    </InputGroupAddon>
                  </InputGroup>

                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>
        </FieldGroup>
        <Button
          type="submit"
          form="login-form"
          className="w-full"
          disabled={isLoginLoading}
        >
          {isLoginLoading ? (
            <>
              <Spinner />
              <p>Submitting</p>
            </>
          ) : (
            <p>Submit</p>
          )}
        </Button>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-background px-2">Or continue with</span>
          </div>
        </div>
        <Button
          variant="outline"
          className="w-full"
          type="button"
          onClick={() => toast.info("OAuth feature coming soon.")}
        >
          <Image
            src="/logo-google.png"
            alt="google-logo"
            height={20}
            width={20}
          />
          Login with Google
        </Button>
        {role === "student" ? (
          <div className="flex justify-center gap-1">
            <p>Don&apos;t have an account?</p>
            <Link href="/auth/signup/student" className="underline">
              Sign Up
            </Link>
          </div>
        ) : (
          <p></p>
        )}
      </form>
    </>
  );
}
