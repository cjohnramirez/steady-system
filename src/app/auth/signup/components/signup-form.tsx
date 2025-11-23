"use client";

import { Button } from "@/components/ui/button";
import {
  FieldGroup,
} from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { useForm } from "@tanstack/react-form";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import SignUpFormAction from "../actions"; 
import { studentSignUpFormSchema } from "../schema";
import { FormInputField } from "@/components/form-input-field";
import CollegeDropdown from "./college-dropdown";
import DepartmentDropdown from "./department-dropdown";
import FormPasswordField from "@/components/form-password-field";
import FormYearLevelField from "@/components/form-year-level-field";
import Link from "next/link";

export default function SignUpForm() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [college, setCollege] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm({
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      department_id: "",
      college: "",
      year_level: "",
      password: "",
      university_id: "",
      username: "",
    },
    validators: {
      onChange: studentSignUpFormSchema,
    },
    onSubmit: async (form) => {
      setIsLoading(true);

      try {

        const res = await SignUpFormAction({
          ...form.value,
          university_id: Number(form.value.university_id),
          year_level: Number(form.value.year_level),
        });

        if (res?.error) {
          toast.error(res.error);
          return;
        }

        if (res?.success) {
          toast.success(res.success);
        }
      } catch (error) {
        console.error("Sign up error:", error);
        toast.error("Sign up unsuccessful");
      } finally {
        setIsLoading(false);
        router.replace("/");
      }
    },
  });

  return (
    <>
      <div className="w-full space-y-2 text-center">
        <p className="text-4xl font-medium">Hello, Student</p>
        <p>Enter your credentials below to signup</p>
      </div>
      <form
        className="mt-8 space-y-8"
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        <FieldGroup>
          <div className="flex gap-8">
            <form.Field name="first_name">
              {(field) => (
                <FormInputField
                  field={field}
                  label="First Name"
                  placeholder="Enter your first name"
                />
              )}
            </form.Field>
            <form.Field name="last_name">
              {(field) => (
                <FormInputField
                  field={field}
                  label="Last Name"
                  placeholder="Enter your last name"
                />
              )}
            </form.Field>
          </div>
          <form.Field name="username">
            {(field) => (
              <FormInputField
                field={field}
                label="Username"
                placeholder="Enter your username"
                description="Username must be unique"
              />
            )}
          </form.Field>
          <form.Field name="email">
            {(field) => (
              <FormInputField
                field={field}
                label="Email"
                placeholder="Enter your email"
                type="email"
                description="Email must be valid for verification"
              />
            )}
          </form.Field>
          <form.Field name="password">
            {(field) => (
              <FormPasswordField
                field={field}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
              />
            )}
          </form.Field>
          <div className="flex gap-6">
            <form.Field name="college">
              {(field) => (
                <CollegeDropdown field={field} setCollege={setCollege} />
              )}
            </form.Field>
            <form.Field name="department_id">
              {(field) => (
                <DepartmentDropdown field={field} college={college} />
              )}
            </form.Field>
          </div>
          <div className="flex gap-6">
            <form.Field name="year_level">
              {(field) => <FormYearLevelField field={field} />}
            </form.Field>
            <form.Field name="university_id">
              {(field) => (
                <FormInputField
                  field={field}
                  label="University ID"
                  placeholder="Enter your university ID"
                  description="Enter a valid university ID (student)"
                />
              )}
            </form.Field>
          </div>
        </FieldGroup>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Spinner />
              <p>Submitting</p>
            </>
          ) : (
            <p>Submit</p>
          )}
        </Button>
        <div className="flex justify-center gap-1">
            <p>Already have an account?</p>
            <Link href="/auth/login/student" className="underline">
              Login
            </Link>
          </div>
      </form>
    </>
  );
}
