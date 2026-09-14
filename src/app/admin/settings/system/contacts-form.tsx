"use client";

import { useRouter } from "next/navigation";
import { useForm, useStore } from "@tanstack/react-form";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { FormInputField } from "@/components/form-input-field";
import { FormSelectField } from "@/components/form-select-field";
import { SectionCard } from "@/components/app/section-card";
import { saveOrganizationContacts } from "@/lib/admin/actions";
import { strToTitleCase } from "@/lib/format";
import {
  CONTACT_PLATFORMS,
  organizationContactsSchema,
} from "@/lib/validation/organization";

type Platform = (typeof CONTACT_PLATFORMS)[number];
const schema = z.object({ contacts: organizationContactsSchema });

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
    <SectionCard
      title="Contact links"
      description="Listed in the footer of the public site."
    >
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
                    className="grid items-start gap-3 sm:grid-cols-[10rem_1fr_auto]"
                  >
                    <form.Field name={`contacts[${index}].platform`}>
                      {(f) => (
                        <FormSelectField
                          field={f}
                          label="Platform"
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
                          label="Link, address or number"
                        />
                      )}
                    </form.Field>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="sm:mt-6"
                      aria-label={`Remove contact ${index + 1}`}
                      onClick={() => list.removeValue(index)}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                ))}
                <div className="flex flex-wrap justify-between gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={list.state.value.length >= 10}
                    onClick={() =>
                      list.pushValue({
                        platform: "facebook",
                        contact_detail: "",
                      })
                    }
                  >
                    <Plus aria-hidden />
                    Add link
                  </Button>
                  <Button type="submit" loading={isSubmitting}>
                    Save links
                  </Button>
                </div>
              </>
            )}
          </form.Field>
        </FieldGroup>
      </form>
    </SectionCard>
  );
}
