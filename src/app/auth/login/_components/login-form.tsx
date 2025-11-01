"use client";

import { Input } from "@/components/ui/input";
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
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import { jwtDecode } from "jwt-decode";

type roles = "student" | "admin" | "counselor";

interface JwtCustomPayload {
  user_role: roles;
  exp: number;
  iat: number;
  sub: string;
}

const formSchema = z.object({
  email: z.email({ error: "Invalid email" }),
  password: z
    .string()
    .min(8, "8 or more characters required")
    .max(255, "255 or less characters required"),
});

export default function LoginForm({ role }: { role: roles }) {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async (form) => {
      const supabase = createClient();
      setIsLoading(true);

      try {
        const { error } = await supabase.auth.signInWithPassword(form.value);

        if (error) {
          toast.error("Internal server error");
          return;
        }

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          const jwt = jwtDecode<JwtCustomPayload>(session.access_token);
          if (jwt.user_role !== role) {
            toast.error("Unauthorized access for this role");
            return;
          }
        }

        toast.success("Authentication successful");
        router.push("/");
      } catch {
        toast.error("Authentication unsuccessful");
      } finally {
        setIsLoading(false);
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
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;

              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    placeholder={`${role}@ustp.edu.ph`}
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>
          <form.Field name="password">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                  />
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
          disabled={isLoading}
        >
          {isLoading ? (
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
