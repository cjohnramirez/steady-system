"use client";

import { useRouter } from "next/navigation";
import { useForm, useStore } from "@tanstack/react-form";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { FormInputField } from "@/components/form-input-field";
import { FormSelectField } from "@/components/form-select-field";
import { saveOrganizationContacts } from "@/lib/admin/actions";
import { strToTitleCase } from "@/lib/format";
import {
  CONTACT_PLATFORMS,
  organizationContactsSchema,
} from "@/lib/validation/organization";

type Platform = (typeof CONTACT_PLATFORMS)[number];
const schema = z.object({ contacts: organizationContactsSchema });

/**
 * Campus Crisis Lifelines & Public Contact Links (Figma 678:21268):
 * Stacked rounded-[16px] item cards with red Delete pills and full-width blue + Add New Item CTA.
 */
export default function ContactsForm({
  contacts,
}: {
  contacts: { platform: string; contact_detail: string }[];
}) {
  const router = useRouter();

  const form = useForm({
    defaultValues: {
      contacts: contacts.map((c) => ({
        platform: c.platform as Platform,
        contact_detail: c.contact_detail,
      })),
    },
    validators: { onSubmit: schema },
    onSubmit: async ({ value }) => {
      const result = await saveOrganizationContacts(value.contacts);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Contact links saved.");
      router.refresh();
    },
  });

  const isSubmitting = useStore(form.store, (s) => s.isSubmitting);

  return (
    <section className="bg-card border-border shadow-steady-card space-y-5 rounded-[20px] border p-6">
      <div className="space-y-1">
        <h2 className="text-foreground text-[15px] font-medium">
          Campus Crisis Lifelines &amp; Contacts
        </h2>
        <p className="text-muted-foreground text-[14px]">
          Configured in the student emergency sheet and public site footer
        </p>
      </div>

      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          void form.handleSubmit();
        }}
      >
        <FieldGroup className="gap-4">
          <form.Field name="contacts" mode="array">
            {(list) => (
              <>
                {list.state.value.map((_, index) => (
                  <div
                    key={index}
                    className="bg-card border-border shadow-steady-card space-y-3 rounded-[16px] border p-4"
                  >
                    <div className="grid gap-3 sm:grid-cols-[auto_1fr]">
                      <form.Field name={`contacts[${index}].platform`}>
                        {(f) => (
                          <FormSelectField
                            field={f}
                            label="Channel"
                            options={CONTACT_PLATFORMS.map((p) => ({
                              value: p,
                              label: strToTitleCase(p),
                            }))}
                          />
                        )}
                      </form.Field>
                      <form.Field name={`contacts[${index}].contact_detail`}>
                        {(f) => (
                          <FormInputField
                            field={f}
                            label="Point of Contact / Link"
                          />
                        )}
                      </form.Field>
                    </div>
                    <div className="flex justify-start">
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() => list.removeValue(index)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}

                <div className="flex flex-col gap-3 pt-1">
                  <Button
                    type="button"
                    disabled={list.state.value.length >= 10}
                    onClick={() =>
                      list.pushValue({
                        platform: "facebook",
                        contact_detail: "",
                      })
                    }
                    className="w-full"
                  >
                    <Plus strokeWidth={1.5} className="size-4" />
                    Add New Item
                  </Button>

                  <Button
                    type="submit"
                    variant="outline"
                    loading={isSubmitting}
                    className="w-full"
                  >
                    Save Contact Links
                  </Button>
                </div>
              </>
            )}
          </form.Field>
        </FieldGroup>
      </form>
    </section>
  );
}
