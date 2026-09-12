"use client";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useForm } from "@tanstack/react-form";
import { Spinner } from "@/components/ui/spinner";
import { FormInputField } from "@/components/form-input-field";
import { fetchArticle, updateArticle } from "../actions";
import { articleUpdateFormSchema } from "../schema";
import FormEmotionalStatusField from "@/components/form-emotional-status-field";
import ImageUpload from "@/components/image-upload";
import { useImageUpload } from "@/hooks/use-image-upload";
import { useState } from "react";

interface ArticleModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  id: string;
}

export default function ArticleUpdateModal({
  open,
  setOpen,
  id,
}: ArticleModalProps) {
  const queryClient = useQueryClient();
  const image = useImageUpload("articles");
  const [isDeleted, setIsDeleted] = useState(false);

  const { data: article, isLoading } = useQuery({
    queryKey: ["article", id],
    queryFn: () => fetchArticle(id),
  });

  const updateMutation = useMutation({
    mutationFn: updateArticle,
    onSuccess: async () => {
      toast.success("Article updated successfully!");
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["article", id] });
      queryClient.invalidateQueries({ queryKey: ["articles"] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to update article");
    },
  });

  const form = useForm({
    defaultValues: {
      title: article?.title ?? "",
      content: article?.content ?? "",
      author_name: article?.author_name ?? "",
      emotional_status_id: article?.emotional_status_id ?? "",
      publisher_name: article?.publisher_name ?? "",
      link: article?.link ?? "",
      id: id ?? "",
      article_image: article?.article_image ?? "",
    },
    validators: {
      onChange: articleUpdateFormSchema,
    },
    onSubmitInvalid: ({ formApi }) => {},
    onSubmit: async ({ value }) => {
      try {
        const imageUrl = await image.resolveImageUrl(value.article_image);
        updateMutation.mutate({ ...value, article_image: imageUrl });
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Could not upload the image.",
        );
      }
    },
  });

  if (isLoading) return null;

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          image.reset();
        }
        setOpen(isOpen);
      }}
    >
      <DialogContent
        className="sm:max-w-[800px]"
        showCloseButton={false}
        onInteractOutside={(e) => {
          if (image.isBusy) e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>Update Article</DialogTitle>
        </DialogHeader>
        <form
          className="grid grid-cols-[250px_auto_auto] grid-rows-[auto_auto_auto] gap-4 pt-5"
          id="article-form"
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <div className="row-span-3">
            <ImageUpload
              initialURL={article?.article_image ?? ""}
              setFile={image.setFile}
              setIsDeleted={image.setIsRemoved}
            />
          </div>
          <div className="col-span-2 flex h-full w-full gap-2">
            <form.Field name="title">
              {(field) => (
                <FormInputField
                  label="Title"
                  placeholder="Enter title"
                  field={field}
                />
              )}
            </form.Field>
            <form.Field name="link">
              {(field) => (
                <FormInputField
                  label="Link"
                  placeholder="Enter link"
                  field={field}
                />
              )}
            </form.Field>
          </div>
          <div className="col-span-2 flex gap-2">
            <form.Field name="author_name">
              {(field) => (
                <FormInputField
                  label="Author Name"
                  placeholder="Enter author name"
                  field={field}
                />
              )}
            </form.Field>
            <form.Field name="publisher_name">
              {(field) => (
                <FormInputField
                  label="Publisher Name"
                  placeholder="Enter publisher name"
                  field={field}
                />
              )}
            </form.Field>
          </div>
          <div className="col-span-2 flex gap-2">
            <form.Field name="content">
              {(field) => (
                <FormInputField
                  label="Content"
                  placeholder="Enter content"
                  field={field}
                />
              )}
            </form.Field>
            <form.Field name="emotional_status_id">
              {(field) => (
                <FormEmotionalStatusField
                  emotionalStatus={field.state.value}
                  setEmotionalStatus={(value) => field.setValue(value)}
                  enableDescription={false}
                />
              )}
            </form.Field>
          </div>
        </form>
        <DialogFooter>
          <Button
            type="submit"
            disabled={updateMutation.isPending || image.isBusy}
            form="update-article-form"
          >
            {updateMutation.isPending || (image.isBusy && <Spinner />)}
            <p>Update</p>
          </Button>
          <DialogClose asChild>
            <Button variant="outline" disabled={image.isBusy}>
              Cancel
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
