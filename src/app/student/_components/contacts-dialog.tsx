"use client";

import { useForm, useStore } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FormInputField } from "@/components/form-input-field";
import { saveContactPersons } from "@/lib/students/actions";
import { queryKeys } from "@/lib/query-keys";
import { contactPersonsSchema } from "@/lib/validation/student";

const EMPTY = { first_name: "", middle_name: "", last_name: "", phone: "" };
const schema = z.object({ contacts: contactPersonsSchema });

type Contact = {
  first_name: string;
  middle_name: string | null;
  last_name: string;
  phone: string;
};

export default function ContactsDialog({
  open,
  onOpenChange,
  studentId,
  contacts,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentId: string;
  contacts: Contact[];
}) {
  const queryClient = useQueryClient();
  const formId = "contacts-form";

  const form = useForm({
    defaultValues: {
      contacts: contacts.length
        ? contacts.map((c) => ({ ...c, middle_name: c.middle_name ?? "" }))
        : [EMPTY],
    },
    validators: { onSubmit: schema },
    onSubmit: async ({ value }) => {
      const result = await saveContactPersons(studentId, value.contacts);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Emergency contacts saved.");
      await queryClient.invalidateQueries({
        queryKey: queryKeys.students.contacts(studentId),
      });
      onOpenChange(false);
    },
  });

  const isSubmitting = useStore(form.store, (state) => state.isSubmitting);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Emergency contacts</DialogTitle>
          <DialogDescription>
            People the guidance office may reach in an emergency. Add up to
            three.
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
          <form.Field name="contacts" mode="array">
            {(list) => (
              <div className="flex flex-col gap-4">
                {list.state.value.map((_, index) => (
                  <fieldset key={index} className="rounded-xl border p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <legend className="font-medium">
                        Contact {index + 1}
                      </legend>
                      {list.state.value.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => list.removeValue(index)}
                        >
                          <Trash2 aria-hidden />
                          Remove
                        </Button>
                      )}
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <form.Field name={`contacts[${index}].first_name`}>
                        {(field) => (
                          <FormInputField field={field} label="First name" />
                        )}
                      </form.Field>
                      <form.Field name={`contacts[${index}].last_name`}>
                        {(field) => (
                          <FormInputField field={field} label="Last name" />
                        )}
                      </form.Field>
                      <form.Field name={`contacts[${index}].middle_name`}>
                        {(field) => (
                          <FormInputField
                            field={field}
                            label="Middle name"
                            optional
                          />
                        )}
                      </form.Field>
                      <form.Field name={`contacts[${index}].phone`}>
                        {(field) => (
                          <FormInputField
                            field={field}
                            label="Phone"
                            type="tel"
                          />
                        )}
                      </form.Field>
                    </div>
                  </fieldset>
                ))}
                {list.state.value.length < 3 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => list.pushValue(EMPTY)}
                  >
                    <Plus aria-hidden />
                    Add contact
                  </Button>
                )}
              </div>
            )}
          </form.Field>
        </form>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" form={formId} loading={isSubmitting}>
            Save contacts
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
