"use client";

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
import { FormInputField } from "@/components/form-input-field";
import FormPasswordField from "@/components/form-password-field";
import { createCounselor } from "@/lib/counselors/actions";
import { queryKeys } from "@/lib/query-keys";
import { PASSWORD_HINT } from "@/lib/validation/fields";
import { counselorCreateSchema } from "@/lib/validation/staff";

export default function CounselorCreateDialog({
  onClose,
}: {
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const formId = "create-counselor-form";

  const form = useForm({
    defaultValues: {
      first_name: "",
      last_name: "",
      username: "",
      email: "",
      phone: "",
      university_id: 0,
      password: "",
    },
    validators: { onSubmit: counselorCreateSchema },
    onSubmit: async ({ value }) => {
      const result = await createCounselor(value);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(
        `${value.first_name}'s account is ready. Assign their departments next.`,
      );
      await queryClient.invalidateQueries({
        queryKey: queryKeys.counselors.all,
      });
      onClose();
    },
  });

  const isSubmitting = useStore(form.store, (s) => s.isSubmitting);

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Add counselor</DialogTitle>
          <DialogDescription>
            The account can sign in straight away with this email and password.
            Share the password securely and ask them to change it.
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
                {(f) => <FormInputField field={f} label="First name" />}
              </form.Field>
              <form.Field name="last_name">
                {(f) => <FormInputField field={f} label="Last name" />}
              </form.Field>
              <form.Field name="username">
                {(f) => <FormInputField field={f} label="Username" />}
              </form.Field>
              <form.Field name="university_id">
                {(f) => (
                  <FormInputField
                    field={f}
                    label="University ID"
                    type="number"
                  />
                )}
              </form.Field>
              <form.Field name="email">
                {(f) => (
                  <FormInputField
                    field={f}
                    label="Email"
                    type="email"
                    autoComplete="off"
                  />
                )}
              </form.Field>
              <form.Field name="phone">
                {(f) => (
                  <FormInputField field={f} label="Phone" type="tel" optional />
                )}
              </form.Field>
            </div>
            <form.Field name="password">
              {(f) => (
                <FormPasswordField
                  field={f}
                  label="Temporary password"
                  autoComplete="new-password"
                  description={PASSWORD_HINT}
                />
              )}
            </form.Field>
          </FieldGroup>
        </form>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form={formId} loading={isSubmitting}>
            Create account
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
