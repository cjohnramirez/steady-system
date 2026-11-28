"use client";

import { useMemo } from "react";
import { useForm, useStore } from "@tanstack/react-form";
import { useQuery } from "@tanstack/react-query";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { MarkdownEditor } from "@/components/app/markdown-editor";
import { FormInputField } from "@/components/form-input-field";
import { FormSelectField } from "@/components/form-select-field";
import { fieldErrors, isFieldInvalid } from "@/components/form/field-like";
import { createClient } from "@/utils/supabase/client";
import type { Tables } from "@/types/supabase";
import { saveArticle } from "@/lib/content/actions";
import { fetchEmotionalStatuses } from "@/lib/reference/queries";
import { strToTitleCase } from "@/lib/format";
import { queryKeys } from "@/lib/query-keys";
import { articleSchema } from "@/lib/validation/content";
import { ContentDialogShell, CoverPhotoSection } from "./content-dialog-shell";
import { useContentEditor } from "./use-content-editor";

/**
 * Create / Edit Article Modal (Figma 687:1282 & 739:2215).
 */
export default function ArticleDialog({
  article,
  onClose,
}: {
  article: Tables<"article"> | null;
  onClose: () => void;
}) {
  const isEditing = Boolean(article);
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
      title={isEditing ? "Edit Article" : "Create Article"}
      description={
        isEditing
          ? "Update this mood-tagged reading resource for students."
          : "Add mood-tagged reading resources for students."
      }
      submitLabel={isEditing ? "Save Article" : "Publish Article"}
      isEditing={isEditing}
      isBusy={isSubmitting || editor.image.isUploading}
      busyLabel={editor.image.isUploading ? "Uploading photo..." : "Saving..."}
      onClose={onClose}
      onDelete={() => editor.remove(article?.title ?? "")}
      onSubmit={() => void form.handleSubmit()}
    >
      {() => (
        <>
          <CoverPhotoSection
            label="Article Cover Photo"
            preview={editor.image.preview}
            onChange={editor.image.choose}
          />

          <div className="space-y-5 p-5">
            <p className="text-foreground text-[15px] font-medium">
              {isEditing ? "Edit Article Details" : "Article Details"}
            </p>

            <FieldGroup className="gap-4">
              <form.Field name="title">
                {(f) => (
                  <FormInputField
                    field={f}
                    label="Article Title"
                    placeholder="Understanding Academic Burnout"
                  />
                )}
              </form.Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <form.Field name="author_name">
                  {(f) => (
                    <FormInputField
                      field={f}
                      label="Author"
                      placeholder="Clara Wren"
                    />
                  )}
                </form.Field>
                <form.Field name="publisher_name">
                  {(f) => (
                    <FormInputField
                      field={f}
                      label="Publisher"
                      placeholder="Steady Wellness Editorial"
                    />
                  )}
                </form.Field>
              </div>

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
                    label="External Article URL"
                    type="url"
                    placeholder="https://"
                  />
                )}
              </form.Field>

              <form.Field name="content">
                {(f) => {
                  const invalid = isFieldInvalid(f);
                  return (
                    <Field data-invalid={invalid}>
                      <FieldLabel htmlFor={f.name}>Article Content</FieldLabel>
                      <MarkdownEditor
                        id={f.name}
                        value={f.state.value}
                        onChange={f.handleChange}
                        onBlur={f.handleBlur}
                        invalid={invalid}
                        placeholder="Write the full article content here... Use the toolbar below for bold, italics, headings, or lists."
                      />
                      {invalid && <FieldError errors={fieldErrors(f)} />}
                    </Field>
                  );
                }}
              </form.Field>
            </FieldGroup>
          </div>
        </>
      )}
    </ContentDialogShell>
  );
}
