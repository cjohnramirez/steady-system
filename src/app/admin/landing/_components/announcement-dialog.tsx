"use client";

import { useState } from "react";
import { useForm, useStore } from "@tanstack/react-form";
import { Checkbox } from "@/components/ui/checkbox";
import { FieldGroup } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { FormInputField } from "@/components/form-input-field";
import { FormDateTimeField } from "@/components/form-date-time-field";
import ImageUpload from "@/components/image-upload";
import { toast } from "sonner";
import type { Tables } from "@/types/supabase";
import { broadcastToRole } from "@/lib/admin/actions";
import { saveAnnouncement } from "@/lib/content/actions";
import { queryKeys } from "@/lib/query-keys";
import { announcementSchema } from "@/lib/validation/content";
import { ContentDialogShell } from "./content-dialog-shell";
import { useContentEditor } from "./use-content-editor";

export default function AnnouncementDialog({
  announcement,
  onClose,
}: {
  announcement: Tables<"announcement"> | null;
  onClose: () => void;
}) {
  const [notifyStudents, setNotifyStudents] = useState(false);
  const editor = useContentEditor({
    table: "announcement",
    target: "announcements",
    noun: "Announcement",
    queryKey: queryKeys.announcements.all,
    id: announcement?.id ?? null,
    initialImage: announcement?.announcement_image ?? "",
    onClose,
  });

  const form = useForm({
    defaultValues: {
      title: announcement?.title ?? "",
      description: announcement?.description ?? "",
      location: announcement?.location ?? "",
      start_date: announcement?.start_date ?? "",
      end_date: announcement?.end_date ?? "",
      announcement_image: announcement?.announcement_image ?? "",
    },
    validators: { onSubmit: announcementSchema },
    onSubmit: ({ value }) =>
      editor.submit(async (imageUrl) => {
        const result = await saveAnnouncement(announcement?.id ?? null, {
          ...value,
          announcement_image: imageUrl,
        });
        if (result.ok && notifyStudents) {
          const sent = await broadcastToRole(
            "student",
            value.title,
            value.location,
            "/portal#announcements",
          );
          if (sent.ok) toast.info(`Notified ${sent.data.sent} students.`);
        }
        return result;
      }),
  });

  const isSubmitting = useStore(form.store, (s) => s.isSubmitting);

  return (
    <ContentDialogShell
      title={announcement ? "Edit announcement" : "New announcement"}
      description="Events and notices shown on the home page and the portal."
      isEditing={Boolean(announcement)}
      isBusy={isSubmitting || editor.image.isUploading}
      busyLabel={editor.image.isUploading ? "Uploading image…" : "Saving…"}
      onClose={onClose}
      onDelete={() => editor.remove(announcement?.title ?? "")}
      onSubmit={() => void form.handleSubmit()}
    >
      {() => (
        <div className="grid gap-6 md:grid-cols-[18rem_1fr]">
          <ImageUpload
            preview={editor.image.preview}
            onChange={editor.image.choose}
          />
          <FieldGroup className="gap-5">
            <form.Field name="title">
              {(f) => <FormInputField field={f} label="Title" />}
            </form.Field>
            <form.Field name="location">
              {(f) => <FormInputField field={f} label="Location" />}
            </form.Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <form.Field name="start_date">
                {(f) => <FormDateTimeField field={f} label="Starts" />}
              </form.Field>
              <form.Field name="end_date">
                {(f) => <FormDateTimeField field={f} label="Ends" />}
              </form.Field>
            </div>
            <form.Field name="description">
              {(f) => (
                <div className="space-y-2">
                  <label htmlFor={f.name} className="text-sm font-medium">
                    Description
                  </label>
                  <Textarea
                    id={f.name}
                    rows={4}
                    maxLength={1000}
                    value={f.state.value}
                    onChange={(e) => f.handleChange(e.target.value)}
                    onBlur={f.handleBlur}
                  />
                </div>
              )}
            </form.Field>
            {!announcement && (
              <div className="flex items-start gap-3 rounded-xl border p-4">
                <Checkbox
                  id="notify-students"
                  checked={notifyStudents}
                  onCheckedChange={(checked) =>
                    setNotifyStudents(checked === true)
                  }
                />
                <label htmlFor="notify-students" className="leading-snug">
                  Notify all students
                  <span className="text-muted-foreground block text-xs">
                    Sends an in-app notification when this is published.
                  </span>
                </label>
              </div>
            )}
          </FieldGroup>
        </div>
      )}
    </ContentDialogShell>
  );
}
