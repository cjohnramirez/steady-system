"use client";

import { useMemo } from "react";
import { useForm, useStore } from "@tanstack/react-form";
import { useQuery } from "@tanstack/react-query";
import { FieldGroup } from "@/components/ui/field";
import { FormInputField } from "@/components/form-input-field";
import { FormSelectField } from "@/components/form-select-field";
import ImageUpload from "@/components/image-upload";
import { createClient } from "@/utils/supabase/client";
import type { Tables } from "@/types/supabase";
import { savePlaylist } from "@/lib/content/actions";
import { fetchEmotionalStatuses } from "@/lib/reference/queries";
import { strToTitleCase } from "@/lib/format";
import { queryKeys } from "@/lib/query-keys";
import { playlistSchema } from "@/lib/validation/content";
import { ContentDialogShell } from "./content-dialog-shell";
import { useContentEditor } from "./use-content-editor";

export default function PlaylistDialog({
  playlist,
  onClose,
}: {
  playlist: Tables<"playlist_with_details"> | null;
  onClose: () => void;
}) {
  const supabase = useMemo(() => createClient(), []);
  const moods = useQuery({
    queryKey: queryKeys.emotionalStatus,
    queryFn: () => fetchEmotionalStatuses(supabase),
    staleTime: Infinity,
  });

  const editor = useContentEditor({
    table: "playlist",
    target: "playlists",
    noun: "Playlist",
    queryKey: queryKeys.playlists.all,
    id: playlist?.id ?? null,
    initialImage: playlist?.image ?? "",
    onClose,
  });

  const form = useForm({
    defaultValues: {
      title: playlist?.title ?? "",
      link: playlist?.link ?? "",
      creator: playlist?.creator ?? "",
      emotional_status_id: playlist?.emotional_status_id ?? "",
      image: playlist?.image ?? "",
    },
    validators: { onSubmit: playlistSchema },
    onSubmit: ({ value }) =>
      editor.submit((imageUrl) =>
        savePlaylist(playlist?.id ?? null, { ...value, image: imageUrl }),
      ),
  });

  const isSubmitting = useStore(form.store, (s) => s.isSubmitting);

  return (
    <ContentDialogShell
      title={playlist ? "Edit playlist" : "New playlist"}
      description="Music students can open from the portal."
      isEditing={Boolean(playlist)}
      isBusy={isSubmitting || editor.image.isUploading}
      busyLabel={editor.image.isUploading ? "Uploading image…" : "Saving…"}
      onClose={onClose}
      onDelete={() => editor.remove(playlist?.title ?? "")}
      onSubmit={() => void form.handleSubmit()}
    >
      {() => (
        <div className="grid gap-6 md:grid-cols-[18rem_1fr]">
          <ImageUpload
            preview={editor.image.preview}
            onChange={editor.image.choose}
            label="Cover"
          />
          <FieldGroup className="gap-5">
            <form.Field name="title">
              {(f) => <FormInputField field={f} label="Title" />}
            </form.Field>
            <form.Field name="link">
              {(f) => (
                <FormInputField
                  field={f}
                  label="Link"
                  type="url"
                  placeholder="https://open.spotify.com/…"
                />
              )}
            </form.Field>
            <form.Field name="creator">
              {(f) => <FormInputField field={f} label="Curated by" />}
            </form.Field>
            <form.Field name="emotional_status_id">
              {(f) => (
                <FormSelectField
                  field={f}
                  label="Best for students feeling"
                  options={(moods.data ?? []).map((m) => ({
                    value: m.id,
                    label: strToTitleCase(m.name),
                  }))}
                />
              )}
            </form.Field>
          </FieldGroup>
        </div>
      )}
    </ContentDialogShell>
  );
}
