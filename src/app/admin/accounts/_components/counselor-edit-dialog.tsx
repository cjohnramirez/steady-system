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
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { FormInputField } from "@/components/form-input-field";
import type { Tables } from "@/types/supabase";
import { adminUpdateCounselor } from "@/lib/counselors/actions";
import { queryKeys } from "@/lib/query-keys";
import { adminCounselorUpdateSchema } from "@/lib/validation/staff";

export default function CounselorEditDialog({
  counselor,
  onClose,
}: {
  counselor: Tables<"counselor_with_details">;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const formId = "admin-counselor-form";

  const form = useForm({
    defaultValues: {
      first_name: counselor.first_name ?? "",
      last_name: counselor.last_name ?? "",
      username: counselor.username ?? "",
      phone: counselor.phone ?? "",
      university_id: counselor.university_id ?? 0,
      is_active: counselor.is_active ?? true,
    },
    validators: { onSubmit: adminCounselorUpdateSchema },
    onSubmit: async ({ value }) => {
      const result = await adminUpdateCounselor(counselor.id!, value);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Counselor saved.");
      await queryClient.invalidateQueries({
        queryKey: queryKeys.counselors.all,
      });
      onClose();
    },
  });

  const isSubmitting = useStore(form.store, (s) => s.isSubmitting);

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {counselor.first_name} {counselor.last_name}
          </DialogTitle>
          <DialogDescription>{counselor.email}</DialogDescription>
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
              <form.Field name="phone">
                {(f) => <FormInputField field={f} label="Phone" type="tel" />}
              </form.Field>
            </div>
            <form.Field name="university_id">
              {(f) => (
                <FormInputField field={f} label="University ID" type="number" />
              )}
            </form.Field>
            <form.Field name="is_active">
              {(f) => (
                <Field
                  orientation="horizontal"
                  className="justify-between rounded-xl border p-4"
                >
                  <div className="space-y-1">
                    <FieldLabel htmlFor={f.name}>
                      Accepting appointments
                    </FieldLabel>
                    <FieldDescription>
                      Students can only book active counselors.
                    </FieldDescription>
                  </div>
                  <Switch
                    id={f.name}
                    checked={f.state.value}
                    onCheckedChange={f.handleChange}
                  />
                </Field>
              )}
            </form.Field>
          </FieldGroup>
        </form>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
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
