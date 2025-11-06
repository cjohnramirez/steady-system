"use client";

import { useEffect, useState } from "react";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getAdminProfile, updateAdminProfile } from "../actions";
import { adminProfileFormSchema } from "../schema";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { Skeleton } from "@/components/ui/skeleton";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export default function AdminProfile() {
  const queryClient = useQueryClient();

  const {
    data: profile,
    isLoading,
  } = useQuery({
    queryKey: ["adminProfile"],
    queryFn: getAdminProfile,
  });

  const updateMutation = useMutation({
    mutationFn: updateAdminProfile,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["adminProfile"] });
      toast.success("Profile updated successfully!");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update profile");
    },
  });

  const form = useForm({
    defaultValues: {
      first_name: profile?.first_name ?? "",
      last_name: profile?.last_name ?? "",
      email: profile?.email ?? "",
      username: profile?.username ?? "",
      phone: profile?.first_name ?? "",
    },
    validators: { onChange: adminProfileFormSchema },
    onSubmit: async ({ value }) => {
      updateMutation.mutate(value);
    },
  });

  if (isLoading) {
    return (
      <section className="rounded-2xl border border-gray-200 bg-white p-8">
        <Skeleton className="mb-1 h-7 w-48" />
        <Skeleton className="mb-6 h-4 w-full max-w-md" />
        <div className="mt-8 space-y-8">
          <div className="flex gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex-1">
                <Skeleton className="mb-2 h-4 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
          <div className="flex gap-8">
            {[1, 2].map((i) => (
              <div key={i} className="flex-1">
                <Skeleton className="mb-2 h-4 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
          <div className="flex justify-end">
            <Skeleton className="h-10 w-20" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-8">
      <h2 className="mb-1 text-lg font-semibold">Profile Information</h2>
      <p className="mb-6 text-sm">
        View and update your personal details such as name, email address,
        contact number, and assigned role. Make sure this information is
        accurate for system records and communication.
      </p>

      <form
        className="mt-8 space-y-8"
        id="update-admin-profile-form"
        onSubmit={(e) => {
          e.preventDefault();
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
                      value={field.state.value ?? ""}
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
                      value={field.state.value ?? ""}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="Enter your last name"
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>
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
                      value={field.state.value ?? ""}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="Enter your user name"
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>
          </div>
          <div className="flex gap-8">
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
                      value={field.state.value ?? ""}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="Enter your valid email"
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>
            <form.Field name="phone">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Phone Number</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value ?? ""}
                      onBlur={field.handleBlur}
                      onChange={(e) =>
                        field.handleChange(e.target.value.toString())
                      }
                      aria-invalid={isInvalid}
                      placeholder="Enter your valid phone number"
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
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
