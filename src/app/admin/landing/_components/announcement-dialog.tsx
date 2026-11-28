"use client";

import { useState } from "react";
import { useForm, useStore } from "@tanstack/react-form";
import { FieldGroup } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { FormInputField } from "@/components/form-input-field";
import { FormDateTimeField } from "@/components/form-date-time-field";
import { toast } from "sonner";
import type { Tables } from "@/types/supabase";
import { broadcastToRole } from "@/lib/admin/actions";
import { saveAnnouncement } from "@/lib/content/actions";
import { queryKeys } from "@/lib/query-keys";
import { announcementSchema } from "@/lib/validation/content";
import { ContentDialogShell, CoverPhotoSection } from "./content-dialog-shell";
import { useContentEditor } from "./use-content-editor";

/**
 * Create / Edit Announcement Modal (Figma 687:1252).
 */
export default function AnnouncementDialog({
  announcement,
  onClose,
}: {
  announcement: Tables<"announcement"> | null;
  onClose: () => void;
}) {
  const isEditing = Boolean(announcement);
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
      title={isEditing ? "Edit Announcement" : "Create Announcement"}
      description={
        isEditing
          ? "Update this campus event or notice shown on the Landing Page and Student Portal."
          : "Publish a campus event or notice to the Landing Page and Student Portal."
      }
      submitLabel={isEditing ? "Save Announcement" : "Publish Announcement"}
      isEditing={isEditing}
      isBusy={isSubmitting || editor.image.isUploading}
      busyLabel={editor.image.isUploading ? "Uploading photo..." : "Saving..."}
      onClose={onClose}
      onDelete={() => editor.remove(announcement?.title ?? "")}
      onSubmit={() => void form.handleSubmit()}
    >
      {() => (
        <>
          <CoverPhotoSection
            label="Announcement Cover Photo"
            preview={editor.image.preview}
            onChange={editor.image.choose}
          />

          <div className="space-y-5 p-6">
            <p className="text-foreground text-[15px] font-medium">
              {isEditing ? "Edit Announcement Details" : "Announcement Details"}
            </p>

            <FieldGroup className="gap-4">
              <form.Field name="title">
                {(f) => (
                  <FormInputField
                    field={f}
                    label="Announcement Title"
                    placeholder="Midterm Wellness & De-Stress Week"
                  />
                )}
              </form.Field>

              <form.Field name="location">
                {(f) => (
                  <FormInputField
                    field={f}
                    label="Location"
                    placeholder="West Hall Courtyard & Guidance Center"
                  />
                )}
              </form.Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <form.Field name="start_date">
                  {(f) => (
                    <FormDateTimeField field={f} label="Start Date & Time" />
                  )}
                </form.Field>
                <form.Field name="end_date">
                  {(f) => (
                    <FormDateTimeField field={f} label="End Date & Time" />
                  )}
                </form.Field>
              </div>

              <form.Field name="description">
                {(f) => (
                  <div className="space-y-2">
                    <label
                      htmlFor={f.name}
                      className="text-foreground text-[15px] font-medium"
                    >
                      Description
                    </label>
                    <Textarea
                      id={f.name}
                      rows={4}
                      maxLength={1000}
                      placeholder="Share event details, highlights, or what students should bring."
                      value={f.state.value}
                      onChange={(e) => f.handleChange(e.target.value)}
                      onBlur={f.handleBlur}
                    />
                  </div>
                )}
              </form.Field>

              {!isEditing && (
                <div className="flex items-center justify-between gap-4 pt-1">
                  <div className="space-y-0.5">
                    <label
                      htmlFor="notify-students"
                      className="text-foreground cursor-pointer text-[15px] font-medium"
                    >
                      Notify All Students
                    </label>
                    <p className="text-muted-foreground text-[13px]">
                      Sends an in-app notification when published.
                    </p>
                  </div>
                  <Switch
                    id="notify-students"
                    checked={notifyStudents}
                    onCheckedChange={setNotifyStudents}
                  />
                </div>
              )}
            </FieldGroup>
          </div>
        </>
      )}
    </ContentDialogShell>
  );
}
