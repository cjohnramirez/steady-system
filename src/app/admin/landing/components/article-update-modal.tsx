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
import { Upload } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { FormInputField } from "@/components/form-input-field";
import { fetchArticle, insertArticle, updateArticle } from "../actions";
import { articleInsertFormSchema, articleUpdateFormSchema } from "../schema";
import { Label } from "@/components/ui/label";
import FormEmotionalStatusField from "@/components/form-emotional-status-field";
import { startTransition, useEffect, useState } from "react";

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

  const { data: article } = useQuery({
    queryKey: ["article", id],
    queryFn: () => fetchArticle(id),
  });

  const updateMutation = useMutation({
    mutationFn: updateArticle,
    onSuccess: async () => {
      toast.success("Article added successfully!");
      setOpen(false);

      queryClient.invalidateQueries({ queryKey: ["article", id] });
      queryClient.invalidateQueries({ queryKey: ["articles"] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to add articles");
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
    },
    validators: {
      onChange: articleUpdateFormSchema,
    },
    onSubmit: async ({ value }) => {
      updateMutation.mutate(value);
    },
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
      }}
    >
      <DialogContent
        className="sm:max-w-[800px]"
        showCloseButton={false}
        onInteractOutside={() => {
          setOpen(false);
        }}
      >
        <DialogHeader>
          <DialogTitle>Update Article</DialogTitle>
        </DialogHeader>
        <form
          className="grid grid-cols-[250px_auto_auto] grid-rows-[auto_auto_auto] gap-4 pt-5"
          id="update-article-form"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <div className="row-span-3 flex flex-col gap-4">
            <Label>Article Image</Label>
            <div className="h-full rounded-2xl border p-2">
              <label
                htmlFor="fileUpload"
                className="row-span-3 flex h-full cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-gray-400 p-4 text-center"
              >
                <Upload strokeWidth={1.25} />
                <p>Click to upload the image.</p>
              </label>
              <input
                type="file"
                id="fileUpload"
                className="hidden"
                accept="image/*"
              />
            </div>
          </div>

          <div className="col-span-2 flex h-full w-full gap-2">
            <form.Field name="title">
              {(field) => (
                <FormInputField
                  label="Title"
                  placeholder="Enter title of annoucement"
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
            disabled={updateMutation.isPending}
            form="update-article-form"
          >
            {updateMutation.isPending ? <Spinner /> : "Update"}
          </Button>
          <DialogClose asChild>
            <Button
              variant="outline"
              onClick={() => {
                setOpen(false);
              }}
            >
              Cancel
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
