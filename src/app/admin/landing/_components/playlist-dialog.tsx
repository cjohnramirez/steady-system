"use client";

import { useMemo } from "react";
import { useForm, useStore } from "@tanstack/react-form";
import { useQuery } from "@tanstack/react-query";
import { FieldGroup } from "@/components/ui/field";
import { FormInputField } from "@/components/form-input-field";
import { FormSelectField } from "@/components/form-select-field";
import { createClient } from "@/utils/supabase/client";
import type { Tables } from "@/types/supabase";
import { savePlaylist } from "@/lib/content/actions";
import { fetchEmotionalStatuses } from "@/lib/reference/queries";
import { strToTitleCase } from "@/lib/format";
import { queryKeys } from "@/lib/query-keys";
import { playlistSchema } from "@/lib/validation/content";
import { ContentDialogShell, CoverPhotoSection } from "./content-dialog-shell";
import { useContentEditor } from "./use-content-editor";

/**
 * Create / Edit Playlist Modal (Figma 687:1312).
 */
export default function PlaylistDialog({
  playlist,
  onClose,
}: {
  playlist: Tables<"playlist_with_details"> | null;
  onClose: () => void;
}) {
  const isEditing = Boolean(playlist);
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
      title={isEditing ? "Edit Playlist" : "Create Playlist"}
      description={
        isEditing
          ? "Update this ambient soundscape or focus audio playlist."
          : "Curate ambient soundscapes and focus audio tagged by student mood."
      }
      submitLabel={isEditing ? "Save Playlist" : "Publish Playlist"}
      isEditing={isEditing}
      isBusy={isSubmitting || editor.image.isUploading}
      busyLabel={editor.image.isUploading ? "Uploading photo..." : "Saving..."}
      onClose={onClose}
      onDelete={() => editor.remove(playlist?.title ?? "")}
      onSubmit={() => void form.handleSubmit()}
    >
      {() => (
        <>
          <CoverPhotoSection
            label="Playlist Cover Photo"
            preview={editor.image.preview}
            onChange={editor.image.choose}
          />

          <div className="space-y-5 p-6">
            <p className="text-foreground text-[15px] font-medium">
              {isEditing ? "Edit Playlist Details" : "Playlist Details"}
            </p>

            <FieldGroup className="gap-4">
              <form.Field name="title">
                {(f) => (
                  <FormInputField
                    field={f}
                    label="Playlist Title"
                    placeholder="Rain on West Hall — Deep Focus"
                  />
                )}
              </form.Field>

              <form.Field name="creator">
                {(f) => (
                  <FormInputField
                    field={f}
                    label="Creator"
                    placeholder="Steady Soundscapes"
                  />
                )}
              </form.Field>

              <form.Field name="emotional_status_id">
                {(f) => (
                  <FormSelectField
                    field={f}
                    label="Target Mood Tag"
                    isLoading={moods.isLoading}
                    isError={moods.isError}
                    options={(moods.data ?? []).map((m) => ({
                      value: m.id,
                      label: strToTitleCase(m.name),
                    }))}
                  />
                )}
              </form.Field>

              <form.Field name="link">
                {(f) => (
                  <FormInputField
                    field={f}
                    label="Playlist Link"
                    type="url"
                    placeholder="https://open.spotify.com/..."
                  />
                )}
              </form.Field>
            </FieldGroup>
          </div>
        </>
      )}
    </ContentDialogShell>
  );
}
