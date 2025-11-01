"use client";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { createClient } from "@/utils/supabase/client";
import { SupabaseClient } from "@supabase/supabase-js";
import { useForm } from "@tanstack/react-form";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import z from "zod";
import SignUpFormAction from "../actions";

export async function fetchDepartment(
  supabase: SupabaseClient,
  college: string,
) {
  if (college) {
    const { data, error } = await supabase
      .from("department")
      .select(`*`)
      .eq("college_id", college);

    if (error) throw error;
    return data || [];
  }
  return [];
}

export async function fetchCollege(supabase: SupabaseClient) {
  const { data, error } = await supabase.from("college").select(`*`);

  if (error) throw error;
  return data || [];
}

export default function SignUpForm() {
  const router = useRouter();

  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);
  const [college, setCollege] = useState("");

  const { data: departmentData = [], isLoading: isDepartmentLoading } =
    useQuery({
      queryKey: ["department", college],
      queryFn: () => fetchDepartment(supabase, college),
    });

  console.log(departmentData);

  const { data: collegeData = [] } = useQuery({
    queryKey: ["college", "all"],
    queryFn: () => fetchCollege(supabase),
  });

  const formSchema = z.object({
    firstName: z.string().min(2, "First name is too short"),
    lastName: z
      .string({ error: "Last name required" })
      .min(2, "First name is too short"),
    email: z.email({ error: "Invalid email" }),
    college: z.uuid("Invalid college ID"),
    department: z.uuid("Invalid department ID"),
    year_level: z.int().min(1, "Year too low").max(5, "Year too high"),
    studentId: z.number({ error: "Not a valid student ID" }),
    password: z
      .string()
      .min(8, "Password too short")
      .max(255, "Password too long"),
  });

  const form = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      department: "",
      college: "",
      year_level: 1,
      password: "",
      studentId: 0,
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async (form) => {
      setIsLoading(true);

      try {
        const formData = new FormData();

        formData.append("firstName", form.value.firstName);
        formData.append("lastName", form.value.lastName);
        formData.append("email", form.value.email);
        formData.append("department", form.value.department);
        formData.append("year_level", form.value.year_level.toString());
        formData.append("password", form.value.password);
        formData.append("studentId", form.value.studentId.toString());

        const res = await SignUpFormAction(formData);

        if (res?.error) {
          toast.error(res.error);
          return;
        }

        if (res?.success) {
          toast.success(res.success);
        }

      } catch {
        toast.error("Sign Up unsuccessful");
      } finally {
        setIsLoading(false);
        router.replace("/")
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
        id="login-form"
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        <FieldGroup>
          <div className="flex gap-8">
            <form.Field name="firstName">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>First Name</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="Enter your first name"
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>
            <form.Field name="lastName">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Last Name</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="Enter your last name (surname)"
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>
          </div>

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
                    placeholder="Enter a valid email address"
                  />
                  {isInvalid ? (
                    <FieldError errors={field.state.meta.errors} />
                  ) : (
                    <FieldDescription>
                      Must be a valid email address, for verification
                    </FieldDescription>
                  )}
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
                    placeholder="Enter a password"
                    autoComplete="off"
                    type="password"
                  />
                  {isInvalid ? (
                    <FieldError errors={field.state.meta.errors} />
                  ) : (
                    <FieldDescription>
                      Must be a minimum of 8 characters and maximum of 255
                    </FieldDescription>
                  )}
                </Field>
              );
            }}
          </form.Field>
          <div className="flex gap-6">
            <form.Field name="college">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>College</FieldLabel>
                    <Select
                      name={field.name}
                      value={field.state.value}
                      onValueChange={(value) => {
                        field.handleChange(value);
                        setCollege(value);
                      }}
                    >
                      <SelectTrigger
                        id="select-college"
                        aria-invalid={isInvalid}
                      >
                        <SelectValue placeholder="Select College" />
                      </SelectTrigger>
                      <SelectContent position="item-aligned">
                        {collegeData.map((college, idx) => (
                          <SelectItem
                            value={college.id}
                            key={idx}
                            onClick={() => setCollege(field.state.value)}
                          >
                            {college.abbreviation}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {isInvalid ? (
                      <FieldError errors={field.state.meta.errors} />
                    ) : (
                      <FieldDescription>
                        A college must be chosen
                      </FieldDescription>
                    )}
                  </Field>
                );
              }}
            </form.Field>
            <form.Field name="department">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Department</FieldLabel>
                    <Select
                      name={field.name}
                      value={field.state.value}
                      onValueChange={field.handleChange}
                      disabled={college == ""}
                    >
                      <SelectTrigger
                        id="select-department"
                        aria-invalid={isInvalid}
                      >
                        {isDepartmentLoading && college != "" ? (
                          <div className="flex items-center gap-2">
                            <Spinner />
                            <p>Loading Department</p>
                          </div>
                        ) : (
                          <SelectValue placeholder="Select Department" />
                        )}
                      </SelectTrigger>
                      <SelectContent position="item-aligned">
                        {departmentData.map((department, idx) => (
                          <SelectItem value={department.id} key={idx}>
                            {department.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {isInvalid ? (
                      <FieldError errors={field.state.meta.errors} />
                    ) : (
                      <FieldDescription>
                        A department must be chosen
                      </FieldDescription>
                    )}
                  </Field>
                );
              }}
            </form.Field>
          </div>
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
      </form>
    </>
  );
}
