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
import { useForm } from "@tanstack/react-form";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import SignUpFormAction, { fetchCollege, fetchDepartment } from "../actions";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Eye, EyeClosed } from "lucide-react";
import { signUpFormSchema } from "../schema";

export default function SignUpForm() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [college, setCollege] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { data: departmentData = [], isLoading: isDepartmentLoading } =
    useQuery({
      queryKey: ["department", college],
      queryFn: () => fetchDepartment(college),
    });

  const { data: collegeData = [] } = useQuery({
    queryKey: ["college", "all"],
    queryFn: () => fetchCollege(),
  });

  const form = useForm({
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      department_id: "",
      college: "",
      year_level: "",
      password: "",
      student_id: "",
      username: "",
    },
    validators: {
      onChange: signUpFormSchema,
    },
    onSubmit: async (form) => {
      console.log("onSubmit called");
      console.log("Form values:", form.value);
      setIsLoading(true);

      try {
        const formData = new FormData();

        formData.append("first_name", form.value.first_name);
        formData.append("last_name", form.value.last_name);
        formData.append("email", form.value.email);
        formData.append("department_id", form.value.department_id);
        formData.append("year_level", form.value.year_level.toString());
        formData.append("password", form.value.password);
        formData.append("student_id", form.value.student_id.toString());
        formData.append("username", form.value.username.toString());

        const res = await SignUpFormAction(formData);

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
          console.log("Form submit event triggered");
          form.handleSubmit();
        }}
      >
        <FieldGroup>
          <div className="flex gap-8">
            <form.Field name="first_name">
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
            <form.Field name="last_name">
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

          <form.Field name="username">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;

              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Username</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    placeholder="Choose a username"
                  />
                  {isInvalid ? (
                    <FieldError errors={field.state.meta.errors} />
                  ) : (
                    <FieldDescription>
                      Choose a unique username for your account
                    </FieldDescription>
                  )}
                </Field>
              );
            }}
          </form.Field>

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
                    type="email"
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
                  <InputGroup>
                    <InputGroupInput
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a secure password"
                    />
                    <InputGroupAddon align="inline-end">
                      <InputGroupButton
                        aria-label="Toggle password visibility"
                        title="Toggle password visibility"
                        size="icon-xs"
                        onClick={() => {
                          setShowPassword(!showPassword);
                        }}
                      >
                        {showPassword ? <Eye /> : <EyeClosed />}
                      </InputGroupButton>
                    </InputGroupAddon>
                  </InputGroup>
                  {isInvalid ? (
                    <FieldError errors={[field.state.meta.errors[0]]} />
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
            <form.Field name="department_id">
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
          <div className="flex gap-6">
            <form.Field name="year_level">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Year Level</FieldLabel>
                    <Select
                      name={field.name}
                      value={field.state.value.toString() || ""}
                      onValueChange={(value) => field.handleChange(value)}
                    >
                      <SelectTrigger
                        id="select-year-level"
                        aria-invalid={isInvalid}
                      >
                        <SelectValue placeholder="Select Year Level" />
                      </SelectTrigger>
                      <SelectContent position="item-aligned">
                        {[
                          { year: "1", name: "1st Year" },
                          { year: "2", name: "2nd Year" },
                          { year: "3", name: "3rd Year" },
                          { year: "4", name: "4th Year" },
                          { year: "5", name: "5th Year" },
                        ].map((data, idx) => (
                          <SelectItem value={data.year} key={idx}>
                            {data.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {isInvalid ? (
                      <FieldError errors={field.state.meta.errors} />
                    ) : (
                      <FieldDescription>A year must be chosen</FieldDescription>
                    )}
                  </Field>
                );
              }}
            </form.Field>
            <form.Field name="student_id">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Student ID</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value.toString()}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="Enter your student ID"
                    />
                    {isInvalid ? (
                      <FieldError errors={field.state.meta.errors} />
                    ) : (
                      <FieldDescription>
                        Must be a valid university-assigned ID
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