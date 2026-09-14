"use client";

import { useRouter } from "next/navigation";
import { useForm, useStore } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FieldGroup } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { FormInputField } from "@/components/form-input-field";
import type { Tables } from "@/types/supabase";
import { updateOwnCounselorProfile } from "@/lib/counselors/actions";
import { queryKeys } from "@/lib/query-keys";
import { staffSelfUpdateSchema } from "@/lib/validation/staff";

export default function ProfileDialog({
  open,
  onOpenChange,
  counselor,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  counselor: Tables<"counselor_with_details">;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const formId = "counselor-profile-form";

  const form = useForm({
    defaultValues: {
      first_name: counselor.first_name ?? "",
      last_name: counselor.last_name ?? "",
      username: counselor.username ?? "",
      phone: counselor.phone ?? "",
    },
    validators: {
      onSubmit: staffSelfUpdateSchema,
      onBlur: staffSelfUpdateSchema,
    },
    onSubmit: async ({ value }) => {
      const result = await updateOwnCounselorProfile(value);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Profile saved.");
      await queryClient.invalidateQueries({
        queryKey: queryKeys.counselors.all,
      });
      onOpenChange(false);
      router.refresh();
    },
  });

  const isSubmitting = useStore(form.store, (state) => state.isSubmitting);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>
            Your email and university ID are managed by the guidance office.
          </DialogDescription>
        </DialogHeader>
        <form
          id={formId}
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            void form.handleSubmit();
          }}
        >
          <FieldGroup className="gap-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <form.Field name="first_name">
                {(field) => <FormInputField field={field} label="First name" />}
              </form.Field>
              <form.Field name="last_name">
                {(field) => <FormInputField field={field} label="Last name" />}
              </form.Field>
            </div>
            <form.Field name="username">
              {(field) => <FormInputField field={field} label="Username" />}
            </form.Field>
            <form.Field name="phone">
              {(field) => (
                <FormInputField
                  field={field}
                  label="Phone"
                  type="tel"
                  optional
                />
              )}
            </form.Field>
          </FieldGroup>
        </form>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" form={formId} disabled={isSubmitting}>
            {isSubmitting && <Spinner />}
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
