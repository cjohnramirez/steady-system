"use client";

import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { fetchAdminProfile, updateAdminProfile } from "../actions";
import { adminProfileFormSchema } from "../schema";
import { FieldGroup } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { Skeleton } from "@/components/ui/skeleton";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FormInputField } from "@/components/form-input-field";

export default function AdminProfile() {
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["adminProfile"],
    queryFn: fetchAdminProfile,
  });

  const updateMutation = useMutation({
    mutationFn: updateAdminProfile,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["adminProfile"] });
      toast.success("Profile updated successfully!");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Profile update failed");
    },
  });

  const form = useForm({
    defaultValues: {
      first_name: profile?.first_name ?? "",
      last_name: profile?.last_name ?? "",
      email: profile?.email ?? "",
      username: profile?.username ?? "",
      phone: profile?.phone ?? "",
      university_id: profile?.university_id
        ? String(profile.university_id)
        : "",
    },
    validators: { onChange: adminProfileFormSchema },
    onSubmit: async ({ value }) => {
      updateMutation.mutate({
        ...value,
        university_id: Number(value.university_id),
      });
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
              {(field) => (
                <FormInputField
                  field={field}
                  label="Username"
                  placeholder="Enter your first name"
                />
              )}
            </form.Field>
            <form.Field name="last_name">
              {(field) => (
                <FormInputField
                  field={field}
                  label="Last name"
                  placeholder="Enter your last name"
                />
              )}
            </form.Field>
            <form.Field name="username">
              {(field) => (
                <FormInputField
                  field={field}
                  label="Username"
                  placeholder="Enter your username"
                />
              )}
            </form.Field>
          </div>
          <div className="flex gap-8">
            <form.Field name="email">
              {(field) => (
                <FormInputField
                  field={field}
                  label="Email"
                  placeholder="Enter your email"
                />
              )}
            </form.Field>
            <form.Field name="phone">
              {(field) => (
                <FormInputField
                  field={field}
                  label="Username"
                  placeholder="Enter your phone number"
                />
              )}
            </form.Field>
          </div>
        </FieldGroup>
        <div className="flex w-full justify-end">
          <Button disabled={updateMutation.isPending} type="submit">
            {updateMutation.isPending ? <Spinner /> : <></>}
            Save
          </Button>
        </div>
      </form>
    </section>
  );
}
