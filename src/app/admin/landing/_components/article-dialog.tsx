"use client";

import { useMemo } from "react";
import { useForm, useStore } from "@tanstack/react-form";
import { useQuery } from "@tanstack/react-query";
import { FieldGroup } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { FormInputField } from "@/components/form-input-field";
import { FormSelectField } from "@/components/form-select-field";
import ImageUpload from "@/components/image-upload";
import { createClient } from "@/utils/supabase/client";
import type { Tables } from "@/types/supabase";
import { saveArticle } from "@/lib/content/actions";
import { fetchEmotionalStatuses } from "@/lib/reference/queries";
import { strToTitleCase } from "@/lib/format";
import { queryKeys } from "@/lib/query-keys";
import { articleSchema } from "@/lib/validation/content";
import { ContentDialogShell } from "./content-dialog-shell";
import { useContentEditor } from "./use-content-editor";

export default function ArticleDialog({
  article,
  onClose,
}: {
  article: Tables<"article"> | null;
  onClose: () => void;
}) {
  const supabase = useMemo(() => createClient(), []);
  const moods = useQuery({
    queryKey: queryKeys.emotionalStatus,
    queryFn: () => fetchEmotionalStatuses(supabase),
    staleTime: Infinity,
  });

  const editor = useContentEditor({
    table: "article",
    target: "articles",
    noun: "Article",
    queryKey: queryKeys.articles.all,
    id: article?.id ?? null,
    initialImage: article?.article_image ?? "",
    onClose,
  });

  const form = useForm({
    defaultValues: {
      title: article?.title ?? "",
      content: article?.content ?? "",
      link: article?.link ?? "",
      author_name: article?.author_name ?? "",
      publisher_name: article?.publisher_name ?? "",
      emotional_status_id: article?.emotional_status_id ?? "",
      article_image: article?.article_image ?? "",
    },
    validators: { onSubmit: articleSchema },
    onSubmit: ({ value }) =>
      editor.submit((imageUrl) =>
        saveArticle(article?.id ?? null, { ...value, article_image: imageUrl }),
      ),
  });

  const isSubmitting = useStore(form.store, (s) => s.isSubmitting);

  return (
    <ContentDialogShell
      title={article ? "Edit article" : "New article"}
      description="Recommended reading, matched to how students say they feel."
      isEditing={Boolean(article)}
      isBusy={isSubmitting || editor.image.isUploading}
      busyLabel={editor.image.isUploading ? "Uploading image…" : "Saving…"}
      onClose={onClose}
      onDelete={() => editor.remove(article?.title ?? "")}
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
            <form.Field name="link">
              {(f) => (
                <FormInputField
                  field={f}
                  label="Link"
                  type="url"
                  placeholder="https://"
                />
              )}
            </form.Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <form.Field name="author_name">
                {(f) => <FormInputField field={f} label="Author" />}
              </form.Field>
              <form.Field name="publisher_name">
                {(f) => <FormInputField field={f} label="Publisher" />}
              </form.Field>
            </div>
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
            <form.Field name="content">
              {(f) => (
                <div className="space-y-2">
                  <label htmlFor={f.name} className="text-sm font-medium">
                    Summary
                  </label>
                  <Textarea
                    id={f.name}
                    rows={4}
                    maxLength={2000}
                    value={f.state.value}
                    onChange={(e) => f.handleChange(e.target.value)}
                    onBlur={f.handleBlur}
                  />
                </div>
              )}
            </form.Field>
          </FieldGroup>
        </div>
      )}
    </ContentDialogShell>
  );
}
