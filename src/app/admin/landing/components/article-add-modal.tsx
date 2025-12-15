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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useForm } from "@tanstack/react-form";
import { Upload } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { FormInputField } from "@/components/form-input-field";
import { insertArticle } from "../actions";
import { articleInsertFormSchema } from "../schema";
import { Label } from "@/components/ui/label";
import FormEmotionalStatusField from "@/components/form-emotional-status-field";
import { useEffect, useState } from "react";
import { uploadToCloudinary } from "@/app/actions";
import ImageUpload from "@/components/image-upload";

interface AnnouncementModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export default function ArticleAddModal({
  open,
  setOpen,
}: AnnouncementModalProps) {
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const updateMutation = useMutation({
    mutationFn: insertArticle,
    onSuccess: async () => {
      toast.success("Article added successfully!");
      setOpen(false);

      queryClient.invalidateQueries({ queryKey: ["articles"] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to add article");
    },
  });

  const form = useForm({
    defaultValues: {
      title: "",
      content: "",
      author_name: "",
      emotional_status_id: "",
      publisher_name: "",
      link: "",
      article_image: "",
    },
    onSubmitInvalid: ({ formApi }) => {
      console.log(formApi.state.errors);
      console.log(formApi.state.values);
    },
    validators: {
      onChange: articleInsertFormSchema,
    },
    onSubmit: async ({ value }) => {
      let finalValues = { ...value };

      if (file) {
        setIsUploading(true);
        try {
          const result = await uploadToCloudinary(file, "articles");

          if (result && result.optimizedUrl) {
            finalValues.article_image = result.optimizedUrl;
          }
        } catch (error) {
          toast.error("Failed to upload article image");
          setIsUploading(false);
          return;
        }
      }

      setIsUploading(false);
      updateMutation.mutate(finalValues);
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
        onInteractOutside={(e) => {
          if (isUploading) e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>Add Article</DialogTitle>
        </DialogHeader>
        <form
          className="grid grid-cols-[250px_auto_auto] grid-rows-[auto_auto_auto] gap-4 pt-5"
          id="add-article-form"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <div className="row-span-3">
            <ImageUpload
              initialURL={form.state.values.article_image}
              setFile={setFile}
            />
          </div>
          <div className="col-span-2 flex h-full w-full gap-2">
            <form.Field name="title">
              {(field) => (
                <FormInputField
                  label="Title"
                  placeholder="Enter title of announcement"
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
            form="add-article-form"
          >
            {updateMutation.isPending || (isUploading && <Spinner />)}
            <p>Update</p>
          </Button>
          <DialogClose asChild>
            <Button
              variant="outline"
              onClick={() => {
                setOpen(false);
              }}
              disabled={isUploading}
            >
              Cancel
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
