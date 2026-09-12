import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchOrganizationInfo, updateOrganizationInfo } from "../actions";
import { toast } from "sonner";
import { useForm } from "@tanstack/react-form";
import { organizationInfoFormSchema } from "../schema";
import { FieldGroup } from "@/components/ui/field";
import { FormInputField } from "@/components/form-input-field";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Skeleton } from "@/components/ui/skeleton";

export default function OrganizationInfo() {
  const queryClient = useQueryClient();

  const { data: orgInfo, isLoading } = useQuery({
    queryKey: ["organizationInfo"],
    queryFn: fetchOrganizationInfo,
  });

  const updateMutation = useMutation({
    mutationFn: updateOrganizationInfo,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["organizationInfo"] });
      toast.success("Organization info updated successfully!");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Organization info update failed");
    },
  });

  const form = useForm({
    defaultValues: {
      name: orgInfo?.name ?? "",
      abbreviation: orgInfo?.abbreviation ?? "",
      office_location: orgInfo?.office_location ?? "",
    },
    validators: { onChange: organizationInfoFormSchema },
    onSubmit: async ({ value }) => {
      updateMutation.mutate(value);
    },
  });

  if (isLoading) {
    return (
      <section className="rounded-2xl border border-gray-200 bg-white p-8">
        <Skeleton className="mb-1 h-7 w-48" />
        <Skeleton className="mb-6 h-12 w-full max-w-md" />
        <div className="mt-8 space-y-8">
          <div className="flex gap-8">
            {[1, 2, 3].map((i) => (
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
      <h2 className="mb-1 text-lg font-semibold">Organization Information</h2>
      <p className="mb-6 text-sm">
        Update key information about the Guidance and Counseling Services office
        such as office name, contact details, and logo. This information may
        appear on the landing page and official emails.
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
            <form.Field name="name">
              {(field) => (
                <FormInputField
                  field={field}
                  label="Username"
                  placeholder="Enter the organization name"
                />
              )}
            </form.Field>
            <form.Field name="abbreviation">
              {(field) => (
                <FormInputField
                  field={field}
                  label="Abbreviation"
                  placeholder="Enter the organization abbreviation"
                />
              )}
            </form.Field>
            <form.Field name="office_location">
              {(field) => (
                <FormInputField
                  field={field}
                  label="Office Location"
                  placeholder="Enter the organization office location"
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
